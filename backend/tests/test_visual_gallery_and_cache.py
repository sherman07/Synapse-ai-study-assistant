import asyncio
import json
import tempfile
import time
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.app import app
from backend.app import analyze_materials
from backend.app import build_analysis_fingerprint
from backend.app import build_visual_gallery
from backend.app import choose_learning_depth
from backend.app import file_to_source_unit
from backend.app import finalize_generated_summary
from backend.app import iter_visual_candidates
from backend.app import link_to_source_unit
from backend.app import rebuild_cached_visual_argument_cards
from backend.core.analysis_cache import AnalysisCacheStore


class ApiShapeTests(unittest.TestCase):
    def test_health_response_shape(self):
        response = TestClient(app).get("/health")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["status"], "ok")
        self.assertIn("analysis_model", payload)
        self.assertIn("fallback_model", payload)
        self.assertIn("mindmap_model", payload)
        self.assertIn("title_model", payload)
        self.assertIn("visual_image_guide_model", payload)
        self.assertIn("openai_timeout_seconds", payload)
        self.assertNotIn("OPENAI_API_KEY", payload)

    def test_explicit_detail_level_overrides_auto_depth(self):
        payload = choose_learning_depth("Tiny note about slope.", [], "detailed")

        self.assertEqual(payload["depth"], "detailed")
        self.assertTrue(payload["override"])
        self.assertEqual(payload["requested_detail_level"], "detailed")
        self.assertEqual(payload["auto_selected_depth"], "focused")

    def test_auto_detail_level_keeps_adaptive_depth(self):
        payload = choose_learning_depth("Tiny note about slope.", [], "auto")

        self.assertEqual(payload["depth"], "focused")
        self.assertFalse(payload["override"])
        self.assertEqual(payload["requested_detail_level"], "auto")

    def test_analysis_deadline_skips_optional_model_stages(self):
        with (
            patch("backend.app.ANALYSIS_MAX_SECONDS", 60),
            patch("backend.app.analysis_elapsed_seconds_since", return_value=60.0),
            patch("backend.app.should_run_optional_analysis_stage", return_value=False),
            patch("backend.app.require_openai"),
            patch("backend.app.cache_get", return_value=None),
            patch("backend.app.cache_set"),
            patch(
                "backend.app.generate_reference_style_multisource_notes",
                return_value="# Overview\n\nTiny source note about slope.\n\n## Key Ideas\n\nSlope compares rise and run.",
            ),
            patch("backend.app.make_notes_title", side_effect=AssertionError("title model should be skipped")),
            patch("backend.app.generate_ai_mind_map", side_effect=AssertionError("AI mind map should be skipped")),
        ):
            payload = asyncio.run(analyze_materials(
                files=[],
                links="[]",
                free_text="Tiny note about slope.",
                preferred_language="english",
                detail_level="auto",
                prompt_mode="professor_mode",
                client_fingerprint="",
            ))

        self.assertNotIn("error", payload)
        self.assertIn("title", payload["optional_stages_skipped"])
        self.assertIn("mind_map", payload["optional_stages_skipped"])
        self.assertEqual(payload["analysis_max_seconds"], 60)
        self.assertGreaterEqual(payload["analysis_elapsed_seconds"], 60)
        self.assertTrue(payload["mind_map"].get("branches"))


class VisualGalleryTests(unittest.TestCase):
    def test_selected_visual_card_uses_marker_index(self):
        source_units = [{
            "visual_argument_cards": [{
                "index": 17,
                "url": "data:image/png;base64,AA==",
                "title": "Result comparison",
                "caption": "Table with data, results, comparison groups, and statistical evidence.",
                "what_shows": "The table compares results and shows a data pattern.",
                "argument_supported": "The table supports the analysis by showing the comparison directly.",
                "how_to_read": "Read rows, columns, values, and group differences.",
                "visual_kind": "unknown",
            }]
        }]

        gallery = build_visual_gallery(source_units)

        self.assertEqual(len(gallery), 1)
        self.assertEqual(gallery[0]["index"], 0)
        self.assertEqual(gallery[0]["url"], "data:image/png;base64,AA==")

    def test_cached_visual_rebuild_does_not_call_model(self):
        source_units = [{
            "display_name": "lecture.pdf",
            "title_candidate": "Lecture data",
            "visual_parts": [
                {
                    "type": "text",
                    "text": (
                        "IN-TEXT SOURCE FIGURE FROM lecture.pdf — PDF page 2. "
                        "Page text preview: table graph data results comparison. "
                        "Image-count=1; drawing-count=12; visual-score=28."
                    ),
                },
                {"type": "image_url", "image_url": {"url": "data:image/png;base64,AA=="}},
            ],
        }]

        with patch("backend.app.generate_chat", side_effect=AssertionError("model should not be called")):
            cards = rebuild_cached_visual_argument_cards(source_units, "english")
            summary = finalize_generated_summary(
                "## Notes\n\nThe table compares the source results.",
                requested_language="english",
                generation_language="english",
                source_context="",
                source_units=source_units,
                attach_visuals=True,
            )
            gallery = build_visual_gallery(source_units)

        self.assertEqual(len(cards), 1)
        self.assertIn("[[VISUAL:0]]", summary)
        self.assertEqual(len(gallery), 1)
        self.assertEqual(gallery[0]["url"], "data:image/png;base64,AA==")

    def test_youtube_link_preserves_frame_visual_parts_for_inline_candidates(self):
        frame_parts = [
            {
                "type": "text",
                "text": (
                    "IN-TEXT SOURCE FIGURE FROM lecture video — video frame 1 sampled at approximately 00:10. "
                    "The frame shows a graph with data, results, comparison groups, and visual-score=32."
                ),
            },
            {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64,AA=="}},
        ]
        meta = {
            "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "source_identity": "youtube:dQw4w9WgXcQ",
            "detected_title": "Lecture video",
            "content_hash": "hash",
            "visual_parts": frame_parts,
        }

        with patch("backend.app.analyse_youtube_url", return_value=("Transcript text", frame_parts, meta)):
            parts, source = link_to_source_unit("https://www.youtube.com/watch?v=dQw4w9WgXcQ")

        self.assertEqual(source["visual_parts"], frame_parts)
        self.assertEqual(parts[-1]["image_url"]["url"], "data:image/jpeg;base64,AA==")
        candidates = iter_visual_candidates([source])
        self.assertEqual(len(candidates), 1)
        self.assertEqual(candidates[0]["url"], "data:image/jpeg;base64,AA==")


class SourceIdentityTests(unittest.TestCase):
    def test_uploaded_file_identity_keeps_raw_bytes_when_extracted_text_matches(self):
        with patch("backend.app.extract_pdf", return_value=""), patch("backend.app.render_pdf_visual_parts", return_value=[]):
            _, first = file_to_source_unit("scan-a.pdf", "application/pdf", b"pdf bytes a")
            _, second = file_to_source_unit("scan-b.pdf", "application/pdf", b"pdf bytes b")

        self.assertNotEqual(first["source_identity"], second["source_identity"])
        self.assertNotEqual(first["content_hash"], second["content_hash"])
        self.assertNotEqual(
            build_analysis_fingerprint("auto", [first], "detailed", "professor_mode"),
            build_analysis_fingerprint("auto", [second], "detailed", "professor_mode"),
        )


class AnalysisCacheTests(unittest.TestCase):
    def test_cache_round_trip_and_ttl_cleanup(self):
        with tempfile.TemporaryDirectory() as tmp:
            cache_path = Path(tmp) / "cache.json"
            store = AnalysisCacheStore(cache_path=cache_path, ttl_seconds=60)

            store.set("fingerprint", {"summary": "ok", "visual_gallery": []})

            self.assertEqual(store.get("fingerprint")["summary"], "ok")
            self.assertTrue(cache_path.exists())

            cache_path.write_text(
                json.dumps({
                    "expired": {
                        "created_at": time.time() - 120,
                        "result": {"summary": "old"},
                    }
                }),
                encoding="utf-8",
            )
            expired_store = AnalysisCacheStore(cache_path=cache_path, ttl_seconds=1)

            self.assertIsNone(expired_store.get("expired"))


if __name__ == "__main__":
    unittest.main()
