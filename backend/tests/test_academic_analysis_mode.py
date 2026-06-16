import unittest

from backend.core.note_prompt_modes import (
    load_note_prompt_mode_text,
    normalise_note_prompt_mode,
    note_prompt_mode_label,
    note_prompt_mode_options,
)


class AcademicAnalysisModeTests(unittest.TestCase):
    def test_professor_mode_key_is_presented_as_academic_analysis(self):
        options = {item["value"]: item["label"] for item in note_prompt_mode_options()}

        self.assertEqual(options["professor_mode"], "Academic Analysis")
        self.assertEqual(note_prompt_mode_label("professor_mode"), "Academic Analysis")
        self.assertEqual(normalise_note_prompt_mode("academic analysis"), "professor_mode")
        self.assertEqual(normalise_note_prompt_mode("professional mode"), "professor_mode")

    def test_academic_analysis_prompt_requires_argument_not_longer_summary(self):
        prompt = load_note_prompt_mode_text("professor_mode")

        self.assertIn("# Academic Analysis Mode", prompt)
        self.assertIn("Do not simply summarise the uploaded source", prompt)
        self.assertIn("Academic Overview", prompt)
        self.assertIn("Central Argument", prompt)
        self.assertIn("Conceptual Framework", prompt)
        self.assertIn("Key Tensions / Debates", prompt)
        self.assertIn("Critical Analysis", prompt)
        self.assertIn("Essay-Ready Thesis Statements", prompt)
        self.assertIn("Source-based", prompt)
        self.assertIn("Academic interpretation", prompt)
        self.assertIn("Validation checks before rendering", prompt)
        self.assertNotIn("complete study pack built by an expert lecturer", prompt)


if __name__ == "__main__":
    unittest.main()
