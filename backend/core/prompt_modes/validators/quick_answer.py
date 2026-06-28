from .common import PROFESSIONAL_ARTIFACT_HEADINGS, SOURCE_STRICT_ARTIFACT_HEADINGS, validate_mode_shape


def validate_quick_answer(summary: str, context: dict) -> str:
    return validate_mode_shape(
        summary,
        context,
        mode_label="Quick Answer",
        expected_headings=(
            "Direct Answer",
            "Why",
            "What To Do / Remember",
        ),
        forbidden_headings=(
            *SOURCE_STRICT_ARTIFACT_HEADINGS,
            *PROFESSIONAL_ARTIFACT_HEADINGS,
            "Core Explanation",
            "How the Reasoning Works",
            "Worked Examples and Evidence",
            "Concept Comparison",
            "Main Idea",
            "Key Concepts",
            "Step-by-Step Explanation",
            "Examples / Diagrams / Formulas",
            "Common Confusions",
            "Practice / Revision Checklist",
            "What You Need To Understand First",
            "Why This Works",
            "Mini Worked Example",
            "Start From The Basic Idea",
            "Build The Concept Step By Step",
            "Where Students Usually Get Confused",
            "Worked Example / Guided Explanation",
            "Try This",
            "Check Your Understanding",
            "Working Thesis / Answer",
            "APA-Style Outline",
            "Evidence Paragraphs",
            "References From Uploaded Sources",
        ),
        forbidden_phrases=(
            "Professional Mode",
            "Source-Strict Research Mode",
            "Assignment / APA Mode",
            "Tutor Mode",
            "Detailed Explanation",
        ),
        word_warning_limit=850,
    )
