import unittest

from backend.core.learning_companion import (
    MAX_COMPANION_LIST_ENTRIES,
    MAX_COMPANION_SOURCE_TOTAL_CHARS,
    build_companion_prompt_blocks,
    normalise_companion_decision,
    normalise_companion_source_bundle,
    normalise_learning_context,
)


class LearningCompanionContractTests(unittest.TestCase):
    def test_source_bundle_drops_binary_like_urls_and_caps_excerpts(self):
        source_bundle = normalise_companion_source_bundle({
            "fingerprint": "note-1",
            "sources": [{
                "id": "lecture-1",
                "title": "Lecture 1",
                "url": "data:text/plain,not-allowed",
                "excerpt": "a" * 9000,
            }],
        })

        self.assertEqual(source_bundle["fingerprint"], "note-1")
        self.assertEqual(source_bundle["sources"][0]["url"], "")
        self.assertEqual(len(source_bundle["sources"][0]["excerpt"]), 6000)

    def test_decision_keeps_only_citations_from_the_supplied_bundle(self):
        decision = normalise_companion_decision(
            {
                "reply": "The lecture defines reinforcement as a consequence that increases behaviour.",
                "turn_mode": "source_answer",
                "evidence_mode": "materials",
                "citations": [
                    {"source_id": "lecture-1", "label": "Lecture 1"},
                    {"source_id": "invented", "label": "Not allowed"},
                ],
                "learning_context": {"topic": "Behaviourism", "goal": "Pass the quiz"},
            },
            fallback_reply="Please try again.",
            message="What does this lecture say reinforcement is?",
            history=[],
            prior_context={},
            source_bundle={"fingerprint": "note-1", "sources": [{"id": "lecture-1", "title": "Lecture 1", "excerpt": "..."}]},
            research_sources=[],
        )

        self.assertEqual(decision["evidence_mode"], "materials")
        self.assertEqual(decision["turn_mode"], "source_answer")
        self.assertEqual(decision["citations"], [{"source_id": "lecture-1", "label": "Lecture 1", "url": ""}])
        self.assertEqual(decision["learning_context"]["goal"], "Pass the quiz")

    def test_context_is_bounded_and_minutes_are_clamped(self):
        context = normalise_learning_context({
            "topic": "  A   topic  ",
            "permanent_daily_minutes": 999,
            "misconceptions": [str(i) for i in range(20)],
            "path_levels": list(range(20)),
        })
        self.assertEqual(context["topic"], "A topic")
        self.assertEqual(context["permanent_daily_minutes"], 480)
        self.assertEqual(len(context["misconceptions"]), 8)
        self.assertEqual(len(context["path_levels"]), 8)

    def test_prompt_blocks_gate_materials_and_research_text_by_mode(self):
        materials = build_companion_prompt_blocks(
            message="Explain this note",
            history=[],
            prior_context={},
            source_bundle={"sources": [{"id": "note-1", "title": "Note", "excerpt": "MATERIAL TEXT"}]},
            research_sources=[{"title": "Web", "url": "https://example.com", "text": "WEB TEXT"}],
            evidence_mode="materials",
        )
        self.assertIn("MATERIAL TEXT", materials)
        self.assertNotIn("WEB TEXT", materials)
        self.assertIn("one-question active practice", materials.lower())
        self.assertIn('"path_update"', materials)

        research = build_companion_prompt_blocks(
            message="What is current?",
            history=[],
            prior_context={},
            source_bundle={"sources": [{"id": "note-1", "title": "Note", "excerpt": "MATERIAL TEXT"}]},
            research_sources=[{"title": "Web", "url": "https://example.com", "text": "WEB TEXT"}],
            evidence_mode="research",
        )
        self.assertNotIn("MATERIAL TEXT", research)
        self.assertIn("WEB TEXT", research)

    def test_invalid_model_fallback_does_not_merge_prior_context_or_evidence(self):
        decision = normalise_companion_decision(
            None,
            fallback_reply="Please try again.",
            message="Help me study.",
            history=[],
            prior_context={"topic": "Private prior topic", "goal": "Prior goal"},
            source_bundle={"sources": [{"id": "note-1", "title": "Note", "excerpt": "text"}]},
            research_sources=[{"title": "Web", "text": "current text"}],
        )
        self.assertEqual(decision["learning_context"], normalise_learning_context({}))
        self.assertEqual(decision["evidence_mode"], "tutor")
        self.assertEqual(decision["citations"], [])
        self.assertEqual(decision["path_update"], {})

    def test_prompt_bounds_history_and_research_sources(self):
        history = [{"role": "user", "text": "h" * 5000} for _ in range(20)]
        research_sources = [{"title": f"Web {i}", "text": "w" * 6000} for i in range(10)]
        prompt = build_companion_prompt_blocks(
            history=history,
            research_sources=research_sources,
            evidence_mode="research",
        )
        self.assertEqual(prompt.count("[web:"), 4)
        self.assertNotIn("[web:5]", prompt)
        self.assertLessEqual(prompt.count("w"), MAX_COMPANION_SOURCE_TOTAL_CHARS + 100)
        history_text = prompt.split("History:\n", 1)[1].split("\nLearning context", 1)[0]
        self.assertLessEqual(history_text.count("h"), MAX_COMPANION_LIST_ENTRIES * 180 + 20)

    def test_research_citation_allow_list_matches_bounded_research_sources(self):
        research_sources = [{"title": f"Web {i}", "text": "text"} for i in range(10)]
        decision = normalise_companion_decision(
            {"evidence_mode": "research", "citations": [
                {"source_id": "web:6"}, {"source_id": "web:7"}, {"source_id": "web:1"}, {"source_id": "web:1"},
            ]},
            "fallback", "message", [], {}, {}, research_sources,
        )
        self.assertEqual([item["source_id"] for item in decision["citations"]], ["web:6", "web:1"])

    def test_citations_are_bounded_and_deduplicated(self):
        citations = [{"source_id": "note-1", "label": str(i)} for i in range(12)]
        decision = normalise_companion_decision(
            {"evidence_mode": "materials", "citations": citations},
            "fallback", "message", [], {},
            {"sources": [{"id": "note-1", "title": "Note", "excerpt": "text"}]}, [],
        )
        self.assertEqual(len(decision["citations"]), 1)

    def test_safe_url_rejects_whitespace_and_invalid_ports(self):
        from backend.core.learning_companion import safe_http_url

        self.assertEqual(safe_http_url("http://exa mple.com"), "")
        self.assertEqual(safe_http_url("http://example.com:bad"), "")

    def test_string_false_can_end_is_false(self):
        decision = normalise_companion_decision(
            {"can_end": "false", "mastery": 10}, "fallback", "message", [], {}, {}, [],
        )
        self.assertFalse(decision["can_end"])

    def test_citations_are_scoped_to_the_selected_evidence_mode(self):
        parsed = {"citations": [{"source_id": "note-1"}, {"source_id": "web:1"}]}
        bundle = {"sources": [{"id": "note-1", "title": "Note", "excerpt": "text"}]}
        research = [{"title": "Web", "text": "text"}]

        materials = normalise_companion_decision(
            {**parsed, "evidence_mode": "materials"}, "fallback", "message", [], {}, bundle, research,
        )
        web = normalise_companion_decision(
            {**parsed, "evidence_mode": "research"}, "fallback", "message", [], {}, bundle, research,
        )
        tutor = normalise_companion_decision(
            {**parsed, "evidence_mode": "tutor"}, "fallback", "message", [], {}, bundle, research,
        )
        self.assertEqual([item["source_id"] for item in materials["citations"]], ["note-1"])
        self.assertEqual([item["source_id"] for item in web["citations"]], ["web:1"])
        self.assertEqual(tutor["citations"], [])

    def test_path_update_is_normalized_to_a_bounded_shape(self):
        decision = normalise_companion_decision(
            {"path_update": {
                "title": "Learning path title",
                "status": "  active  ",
                "total_hours": "t" * 200,
                "next_session": "Next session details",
                "current_level_id": "level-1",
                "next_level_id": "level-2",
                "summary": "s" * 500,
                "completed_level_ids": [str(i) for i in range(20)],
                "levels": [{
                    "id": str(i), "title": "t" * 500, "objective": "o" * 500,
                    "status": "active", "graduation": "g" * 500, "hours": "h" * 500,
                    "subskills": [str(j) for j in range(20)],
                    "arbitrary_nested": {"secret": "discard", "oversized": "x" * 10000},
                } for i in range(20)],
                "arbitrary_nested": {"secret": "discard", "oversized": "x" * 10000},
            }}, "fallback", "message", [], {}, {}, [],
        )
        path = decision["path_update"]
        self.assertEqual(set(path), {"title", "status", "total_hours", "next_session", "current_level_id", "next_level_id", "summary", "completed_level_ids", "levels"})
        self.assertEqual(len(path["completed_level_ids"]), 8)
        self.assertEqual(len(path["levels"]), 8)
        self.assertEqual(path["title"], "Learning path title")
        self.assertEqual(path["next_session"], "Next session details")
        self.assertEqual(len(path["total_hours"]), 80)
        self.assertLessEqual(len(path["summary"]), 180)
        self.assertEqual(set(path["levels"][0]), {"id", "title", "objective", "status", "graduation", "hours", "subskills"})
        self.assertLessEqual(len(path["levels"][0]["title"]), 180)
        self.assertLessEqual(len(path["levels"][0]["objective"]), 180)
        self.assertLessEqual(len(path["levels"][0]["graduation"]), 180)
        self.assertLessEqual(len(path["levels"][0]["hours"]), 180)
        self.assertEqual(len(path["levels"][0]["subskills"]), 8)
        self.assertNotIn("arbitrary_nested", path)
        self.assertNotIn("arbitrary_nested", path["levels"][0])
        self.assertEqual(normalise_companion_decision({"path_update": []}, "fallback", "message", [], {}, {}, [],)["path_update"], {})


if __name__ == "__main__":
    unittest.main()
