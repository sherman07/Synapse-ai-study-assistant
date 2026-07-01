from .common import PROFESSIONAL_ARTIFACT_HEADINGS, SOURCE_STRICT_ARTIFACT_HEADINGS, validate_mode_shape


def validate_detailed_explanation(summary: str, context: dict) -> str:
    return validate_mode_shape(
        summary,
        context,
        mode_label="Detailed Explanation",
        expected_headings=(
            "Main Idea",
            "Key Concepts",
            "Step-by-Step Explanation",
            "Examples / Diagrams / Formulas",
            "Common Confusions",
            "Practice / Revision Checklist",
        ),
        forbidden_headings=(
            *SOURCE_STRICT_ARTIFACT_HEADINGS,
            "Direct Answer",
            "Do / Avoid",
            "Need-to-Know Formula / Example",
            *PROFESSIONAL_ARTIFACT_HEADINGS,
            "What You Need To Understand First",
            "Why This Works",
            "Mini Worked Example",
            "Memory Hooks / Checks",
            "Practice Prompt",
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
            "Quick Answer",
        ),
    )
