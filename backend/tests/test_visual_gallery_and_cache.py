import asyncio
import base64
import json
import re
import tempfile
import time
import unittest
from pathlib import Path
from urllib.parse import urlparse
from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.app import app
from backend import app as backend_app_module
from backend.app import analyze_materials
from backend.app import build_analysis_fingerprint
from backend.app import build_visual_gallery
from backend.app import choose_learning_depth
from backend.app import enforce_requested_language
from backend.app import file_to_source_unit
from backend.app import finalize_generated_summary
from backend.app import generate_reference_style_multisource_notes
from backend.app import iter_visual_candidates
from backend.app import link_to_source_unit
from backend.app import rebuild_cached_visual_argument_cards
from backend.app import render_pptx_source_preview_svg_images
from backend.app import source_preview_image_url
from backend.app import validate_source_strict_summary
from backend.core.analysis_cache import AnalysisCacheStore
from backend.core.visual_assets import visual_asset_url_for_browser

try:
    from pptx import Presentation
except Exception:
    Presentation = None


def assert_served_visual_asset(test_case, url: str, expected_content_type: str = "image/png"):
    parsed = urlparse(url)
    test_case.assertEqual(parsed.scheme, "http")
    test_case.assertEqual(parsed.netloc, "127.0.0.1:8001")
    test_case.assertTrue(parsed.path.startswith("/assets/visuals/"))

    response = TestClient(app).get(parsed.path)
    test_case.assertEqual(response.status_code, 200)
    test_case.assertEqual(response.headers.get("content-type", "").split(";")[0], expected_content_type)


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
        self.assertIn("public_backend_base_url", payload)
        self.assertIn("runtime_assets_dir", payload)
        self.assertNotIn("OPENAI_API_KEY", payload)

    def test_default_frontend_base_url_matches_documented_vite_server(self):
        self.assertEqual(
            backend_app_module.SYNAPSE_FRONTEND_BASE_URL,
            "http://127.0.0.1:5175/frontend",
        )

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
        self.assertEqual(payload["language"], "english")
        self.assertEqual(payload["output_language"], "english")
        self.assertTrue(payload["mind_map"].get("branches"))

    def test_analyze_route_returns_http_error_for_empty_request(self):
        with patch("backend.app.require_openai"):
            response = TestClient(app).post("/analyze", data={})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), {"error": "No readable files, links, or text were provided."})

    def test_analyze_route_returns_service_error_when_openai_missing(self):
        with patch("backend.app.require_openai", side_effect=RuntimeError("OPENAI_API_KEY is missing.")):
            response = TestClient(app).post("/analyze", data={"free_text": "short source"})

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json(), {"error": "OPENAI_API_KEY is missing."})

    def test_cached_result_visual_rebuild_never_calls_model(self):
        visual_parts = [
            {
                "type": "text",
                "text": (
                    "IN-TEXT SOURCE FIGURE FROM cached lecture — PDF page 2. "
                    "Page text preview: table graph data results comparison. "
                    "Image-count=1; drawing-count=12; visual-score=28."
                ),
            },
            {"type": "image_url", "image_url": {"url": "data:image/png;base64,AA=="}},
        ]
        source_meta = {
            "display_name": "cached lecture",
            "source_identity": "url:https://example.com/cached-lecture",
            "title_candidate": "Cached lecture",
            "content_hash": "cached-lecture",
            "text_excerpt": "The source includes a result table used as evidence.",
            "visual_parts": visual_parts,
            "url": "https://example.com/cached-lecture",
        }
        cached_result = {
            "title": "Cached lecture notes",
            "summary": "# Overview\n\nCached notes discuss the source result table.",
            "sections": {"Overview": "Cached notes discuss the source result table."},
            "connections": [],
            "mind_map": {"center": "Cached lecture notes", "branches": []},
            "visual_gallery": [],
            "primary_source_identity": source_meta["source_identity"],
        }

        with (
            patch("backend.app.require_openai"),
            patch("backend.app.cache_get", return_value=cached_result),
            patch("backend.app.rebuild_cached_visual_argument_cards", return_value=[]),
            patch("backend.app.link_to_source_unit", return_value=(
                [{"type": "text", "text": "Cached lecture with a result table."}],
                source_meta,
            )),
            patch("backend.app.generate_chat", side_effect=AssertionError("cache hit should not call the model")),
        ):
            payload = asyncio.run(analyze_materials(
                files=[],
                links=json.dumps(["https://example.com/cached-lecture"]),
                free_text="",
                preferred_language="english",
                detail_level="auto",
                prompt_mode="professor_mode",
                client_fingerprint="",
            ))

        self.assertNotIn("error", payload)
        self.assertTrue(payload["cached"])
        self.assertIn("[[VISUAL:0]]", payload["summary"])
        self.assertEqual(len(payload["visual_gallery"]), 1)

    def test_deadline_skips_visual_filter_and_note_expansion_model_stages(self):
        long_summary = "# Overview\n\n" + ("This source explains table data, comparison, evidence, and exam use. " * 700)
        candidate = {
            "source_index": 1,
            "source_title": "Lecture results",
            "display_name": "lecture.pdf",
            "caption": "A table with data, results, comparison groups, and statistical evidence.",
            "location": "PDF page 2",
            "url": "data:image/png;base64,AA==",
            "score": 32,
            "visual_kind": "data/table",
            "teaching_signals": 4,
            "decorative_signals": 0,
            "is_likely_decorative": False,
        }
        source_units = [{
            "display_name": "lecture.pdf",
            "title_candidate": "Lecture results",
            "text_excerpt": "The source includes a table with data, results, and comparison evidence.",
            "visual_parts": [],
        }]
        skipped = []

        with (
            patch("backend.app.analysis_remaining_seconds_since", return_value=20),
            patch("backend.app.select_visual_candidates_for_argument", return_value=[candidate]),
            patch("backend.app.generate_chat", return_value=long_summary) as generate_chat_mock,
            patch("backend.app.expand_sparse_inline_summary", side_effect=AssertionError("expansion should be skipped")),
        ):
            summary = generate_reference_style_multisource_notes(
                source_units,
                "english",
                {"depth": "detailed", "config": backend_app_module.DEPTH_CONFIG["detailed"]},
                "professor_mode",
                analysis_started_at=1.0,
                skipped_optional_stages=skipped,
            )

        self.assertEqual(generate_chat_mock.call_count, 1)
        self.assertIn("visual_card_filter", skipped)
        self.assertIn("note_expansion", skipped)
        self.assertIn("[[VISUAL:0]]", summary)

    def test_analyze_cache_preserves_browser_visual_metadata(self):
        captured = {}
        gallery = [{
            "index": 0,
            "url": "http://127.0.0.1:8001/assets/visuals/result-table.png",
            "title": "Result table",
            "caption": "Table with data and results.",
            "visual_kind": "data/table",
        }]

        def capture_cache_set(fingerprint, result):
            captured["fingerprint"] = fingerprint
            captured["result"] = result

        with (
            patch("backend.app.require_openai"),
            patch("backend.app.cache_get", return_value=None),
            patch("backend.app.cache_set", side_effect=capture_cache_set),
            patch("backend.app.should_run_optional_analysis_stage", return_value=False),
            patch("backend.app.build_visual_gallery", return_value=gallery),
            patch(
                "backend.app.generate_reference_style_multisource_notes",
                return_value="# Overview\n\nThe table evidence is explained near [[VISUAL:0]].\n\n## Key Ideas\n\nData supports the claim.",
            ),
        ):
            payload = asyncio.run(analyze_materials(
                files=[],
                links="[]",
                free_text="Tiny note about a result table.",
                preferred_language="english",
                detail_level="auto",
                prompt_mode="professor_mode",
                client_fingerprint="",
            ))

        self.assertNotIn("error", payload)
        self.assertEqual(payload["visual_gallery"], gallery)
        self.assertEqual(payload["visuals"], gallery)
        self.assertEqual(captured["result"]["visual_gallery"], gallery)
        self.assertEqual(captured["result"]["visuals"], gallery)

    def test_cached_result_uses_cached_visual_gallery_when_live_rebuild_is_empty(self):
        asset_path = backend_app_module.RUNTIME_ASSETS_DIR / "visuals" / "test-cached-table.png"
        asset_path.parent.mkdir(parents=True, exist_ok=True)
        asset_path.write_bytes(b"cached visual")
        cached_gallery = [{
            "index": 0,
            "url": "http://127.0.0.1:8001/assets/visuals/test-cached-table.png",
            "title": "Cached result table",
            "caption": "Cached table metadata.",
            "visual_kind": "data/table",
        }]
        cached_result = {
            "title": "Cached notes",
            "summary": "# Overview\n\nCached notes keep [[VISUAL:0]].",
            "sections": {"Overview": "Cached notes keep [[VISUAL:0]]."},
            "connections": [],
            "mind_map": {"center": "Cached notes", "branches": []},
            "visual_gallery": cached_gallery,
            "primary_source_identity": "text:cached",
        }

        try:
            with (
                patch("backend.app.require_openai"),
                patch("backend.app.cache_get", return_value=cached_result),
                patch("backend.app.rebuild_cached_visual_argument_cards", return_value=[]),
                patch("backend.app.build_visual_gallery", return_value=[]),
                patch("backend.app.generate_chat", side_effect=AssertionError("cache hit should not need a model call")),
            ):
                payload = asyncio.run(analyze_materials(
                    files=[],
                    links="[]",
                    free_text="Tiny note about a result table.",
                    preferred_language="english",
                    detail_level="auto",
                    prompt_mode="professor_mode",
                    client_fingerprint="",
                ))
        finally:
            asset_path.unlink(missing_ok=True)

        self.assertTrue(payload["cached"])
        self.assertEqual(payload["visual_gallery"], cached_gallery)
        self.assertEqual(payload["visuals"], cached_gallery)

    def test_cached_result_does_not_return_missing_runtime_visual_asset(self):
        cached_result = {
            "title": "Cached notes",
            "summary": "# Overview\n\nCached notes still reference [[VISUAL:0]].",
            "sections": {"Overview": "Cached notes still reference [[VISUAL:0]]."},
            "connections": [],
            "mind_map": {"center": "Cached notes", "branches": []},
            "visual_gallery": [{
                "index": 0,
                "url": "http://127.0.0.1:8001/assets/visuals/definitely-missing-cached-asset.png",
                "title": "Missing cached table",
                "caption": "The cache entry points to a runtime asset that no longer exists.",
                "visual_kind": "data/table",
            }],
            "primary_source_identity": "text:cached",
        }

        with (
            patch("backend.app.require_openai"),
            patch("backend.app.cache_get", return_value=cached_result),
            patch("backend.app.rebuild_cached_visual_argument_cards", return_value=[]),
            patch("backend.app.build_visual_gallery", return_value=[]),
            patch("backend.app.generate_chat", side_effect=AssertionError("cache hit should not need a model call")),
        ):
            payload = asyncio.run(analyze_materials(
                files=[],
                links="[]",
                free_text="Tiny note about a missing cached result table.",
                preferred_language="english",
                detail_level="auto",
                prompt_mode="professor_mode",
                client_fingerprint="",
            ))

        self.assertTrue(payload["cached"])
        self.assertEqual(payload["visual_gallery"], [])
        self.assertEqual(payload["visuals"], [])
        self.assertIn("[[VISUAL:0]]", payload["summary"])

    def test_language_enforcement_skips_rewrite_when_english_already_satisfied(self):
        summary = "# Overview\n\nThis study note explains the source evidence, comparison table, and revision use."

        with patch("backend.app.generate_chat", side_effect=AssertionError("English notes should not be rewritten")):
            result = enforce_requested_language(summary, "english")

        self.assertEqual(result, summary)

    def test_language_enforcement_skips_rewrite_when_chinese_already_satisfied(self):
        summary = "# 概述\n\n这份学习笔记解释来源证据、比较表格、核心概念和复习用途，帮助学生直接按照材料复习。"

        with patch("backend.app.generate_chat", side_effect=AssertionError("Chinese notes should not be rewritten")):
            result = enforce_requested_language(summary, "simplified_chinese")

        self.assertEqual(result, summary)

    def test_language_enforcement_rewrites_visible_mismatch(self):
        rewritten = "# 概述\n\n这份笔记已经改写为中文。"

        with patch("backend.app.generate_chat", return_value=rewritten) as generate_chat_mock:
            result = enforce_requested_language("# Overview\n\nThis note is still English.", "simplified_chinese")

        self.assertEqual(result, rewritten)
        self.assertEqual(generate_chat_mock.call_count, 1)

    def test_language_enforcement_rewrites_simplified_when_traditional_requested(self):
        rewritten = "# 概覽\n\n這份筆記已經改寫為繁體中文。"

        with patch("backend.app.generate_chat", return_value=rewritten) as generate_chat_mock:
            result = enforce_requested_language("# 概述\n\n这份学习笔记解释来源证据和复习用途。", "traditional_chinese")

        self.assertEqual(result, rewritten)
        self.assertEqual(generate_chat_mock.call_count, 1)


class SourceStrictNotesTests(unittest.TestCase):
    def test_source_strict_validation_rebuilds_required_sections_and_dedupes_repeat(self):
        summary = """
# Vaccination ethics

## Key Takeaways

- Mandates must be necessary and proportionate (Slide 15).
- Mandates must be necessary and proportionate (Slide 15).

## Evidence Bank

The lecture uses Jacobson v. Massachusetts to illustrate necessity and proportionality (Slide 21).
The lecture uses Jacobson v. Massachusetts to illustrate necessity and proportionality (Slide 21).
""".strip()

        validated = validate_source_strict_summary(summary, "english", "standard_notes")

        self.assertIn("## Learning Question", validated)
        self.assertIn("## Key Terms Table", validated)
        self.assertIn("## Flashcard-ready Summary", validated)
        self.assertIn("[Direct from source]", validated)
        self.assertIn("[Tutor explanation]", validated)
        self.assertEqual(validated.count("Mandates must be necessary and proportionate (Slide 15)."), 1)
        self.assertEqual(
            validated.count("Jacobson v. Massachusetts to illustrate necessity and proportionality (Slide 21)."),
            1,
        )

    def test_source_strict_finalize_respects_quick_review_word_limit(self):
        repeated_sentence = "Necessity, proportionality, and liberty must be balanced with cited lecture evidence (Slide 15)."
        summary = "# Vaccination policy\n\n## Main Notes by Lecture Section\n\n" + "\n\n".join(repeated_sentence for _ in range(80))

        final = finalize_generated_summary(
            summary,
            requested_language="english",
            generation_language="english",
            prompt_mode="source_strict_research_mode",
            note_length_mode="quick_review",
            attach_visuals=False,
        )

        word_count = len(re.findall(r"[\u4e00-\u9fff]|\b[\w'-]+\b", final))
        self.assertLessEqual(word_count, 560)
        self.assertIn("## Key Takeaways", final)

    def test_analysis_fingerprint_changes_with_note_length_mode(self):
        units = [{
            "source_identity": "text:abc",
            "content_hash": "hash-1",
        }]

        quick = build_analysis_fingerprint("english", units, "auto", "source_strict_research_mode", "quick_review")
        deep = build_analysis_fingerprint("english", units, "auto", "source_strict_research_mode", "deep_study")

        self.assertNotEqual(quick, deep)


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
        assert_served_visual_asset(self, gallery[0]["url"], "image/png")

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
        assert_served_visual_asset(self, gallery[0]["url"], "image/png")

    def test_visual_gallery_serves_runtime_asset_url(self):
        source_units = [{
            "visual_argument_cards": [{
                "index": 0,
                "url": "data:image/png;base64,AA==",
                "title": "Source data table",
                "caption": "Table with data, results, comparison groups, and statistical evidence.",
                "what_shows": "The table compares results and shows a data pattern.",
                "argument_supported": "The table supports the analysis by showing the comparison directly.",
                "how_to_read": "Read rows, columns, values, and group differences.",
                "visual_kind": "data/table",
            }]
        }]

        gallery = build_visual_gallery(source_units)

        self.assertEqual(len(gallery), 1)
        self.assertFalse(gallery[0]["url"].startswith("data:"))
        assert_served_visual_asset(self, gallery[0]["url"], "image/png")

    def test_source_preview_image_url_serves_runtime_asset_when_requested(self):
        png_data = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ"
            "AAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        )

        url = source_preview_image_url(png_data, "image/png", browser_asset=True)

        self.assertFalse(url.startswith("data:"))
        assert_served_visual_asset(self, url, "image/png")

    def test_visual_asset_url_preserves_existing_browser_url(self):
        url = "http://127.0.0.1:8001/assets/visuals/already.png"

        self.assertEqual(visual_asset_url_for_browser(url), url)

    def test_visual_asset_url_rejects_invalid_or_non_raster_data_urls(self):
        invalid_url = "data:image/png;base64,not-valid-base64"
        svg_url = "data:image/svg+xml;base64,PHN2Zy8+"

        self.assertEqual(visual_asset_url_for_browser(invalid_url), "")
        self.assertEqual(visual_asset_url_for_browser(svg_url), "")

    def test_visual_asset_url_rejects_local_filesystem_paths(self):
        self.assertEqual(visual_asset_url_for_browser("file:///Users/student/source/page.png"), "")
        self.assertEqual(visual_asset_url_for_browser("/Users/student/source/page.png"), "")
        self.assertEqual(visual_asset_url_for_browser("C:\\Users\\student\\source\\page.png"), "")

    def test_visual_gallery_rejects_local_filesystem_card_urls(self):
        source_units = [{
            "visual_argument_cards": [{
                "index": 0,
                "url": "/Users/student/source/page.png",
                "title": "Local-only table",
                "caption": "Table with data, results, comparison groups, and statistical evidence.",
                "what_shows": "The table compares results and shows a data pattern.",
                "argument_supported": "The table supports the analysis by showing the comparison directly.",
                "how_to_read": "Read rows, columns, values, and group differences.",
                "visual_kind": "data/table",
            }]
        }]

        gallery = build_visual_gallery(source_units)

        self.assertEqual(gallery, [])

    def test_visual_markers_are_reindexed_after_unrenderable_cards_are_removed(self):
        source_units = [{
            "visual_argument_cards": [
                {
                    "index": 0,
                    "url": "",
                    "title": "Missing visual",
                    "caption": "Table with data, results, comparison groups, and statistical evidence.",
                    "what_shows": "The unavailable table compares results.",
                    "argument_supported": "This card should not get a marker because it has no image URL.",
                    "how_to_read": "Read rows, columns, values, and group differences.",
                    "visual_kind": "data/table",
                },
                {
                    "index": 1,
                    "url": "data:image/png;base64,AA==",
                    "title": "Renderable result table",
                    "caption": "Table with data, results, comparison groups, and statistical evidence.",
                    "what_shows": "The table compares results and shows a data pattern.",
                    "argument_supported": "The table supports the analysis by showing the comparison directly.",
                    "how_to_read": "Read rows, columns, values, and group differences.",
                    "visual_kind": "data/table",
                },
            ]
        }]

        summary = finalize_generated_summary(
            "## Notes\n\nThe table compares source results and supports the key claim.",
            requested_language="english",
            generation_language="english",
            source_context="",
            source_units=source_units,
            attach_visuals=True,
        )
        gallery = build_visual_gallery(source_units)

        self.assertIn("[[VISUAL:0]]", summary)
        self.assertNotIn("[[VISUAL:1]]", summary)
        self.assertEqual(len(gallery), 1)
        self.assertEqual(gallery[0]["index"], 0)
        self.assertEqual(gallery[0]["title"], "Renderable result table")
        assert_served_visual_asset(self, gallery[0]["url"], "image/png")

    def test_pptx_svg_fallback_is_rasterized_for_runtime_assets(self):
        if Presentation is None:
            self.skipTest("python-pptx is not installed")
        prs = Presentation()
        slide = prs.slides.add_slide(prs.slide_layouts[6])
        textbox = slide.shapes.add_textbox(914400, 914400, 5486400, 914400)
        textbox.text = "Results table and comparison graph"

        rendered = render_pptx_source_preview_svg_images(prs, 1)

        self.assertIn(1, rendered)
        self.assertTrue(rendered[1].startswith("data:image/png;base64,"))
        assert_served_visual_asset(self, visual_asset_url_for_browser(rendered[1]), "image/png")

    def test_pptx_svg_browser_preview_uses_runtime_asset_url(self):
        if Presentation is None:
            self.skipTest("python-pptx is not installed")
        prs = Presentation()
        slide = prs.slides.add_slide(prs.slide_layouts[6])
        textbox = slide.shapes.add_textbox(914400, 914400, 5486400, 914400)
        textbox.text = "Results table and comparison graph"

        rendered = render_pptx_source_preview_svg_images(prs, 1, browser_assets=True)

        self.assertIn(1, rendered)
        self.assertFalse(rendered[1].startswith("data:"))
        assert_served_visual_asset(self, rendered[1], "image/png")

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

    def test_cache_save_uses_complete_file_without_temp_artifacts(self):
        with tempfile.TemporaryDirectory() as tmp:
            cache_path = Path(tmp) / "cache.json"
            store = AnalysisCacheStore(cache_path=cache_path, ttl_seconds=60)

            store.set("fingerprint", {"summary": "ok", "visual_gallery": [{"index": 0}]})

            self.assertEqual(store.get("fingerprint")["summary"], "ok")
            self.assertFalse(list(Path(tmp).glob(".cache.json.*.tmp")))


if __name__ == "__main__":
    unittest.main()
