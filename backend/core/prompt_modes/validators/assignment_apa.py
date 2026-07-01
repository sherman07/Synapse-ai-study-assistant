from .common import PROFESSIONAL_ARTIFACT_HEADINGS, SOURCE_STRICT_ARTIFACT_HEADINGS, validate_mode_shape


def validate_assignment_apa(summary: str, context: dict) -> str:
    return validate_mode_shape(
        summary,
        context,
        mode_label="Assignment / APA Mode",
        expected_headings=(
            "Working Thesis / Answer",
            "APA-Style Outline",
            "Evidence Paragraphs",
            "Application / Analysis",
            "Counterpoint or Limitation",
            "References From Uploaded Sources",
        ),
        forbidden_headings=(
            *SOURCE_STRICT_ARTIFACT_HEADINGS,
            "Direct Answer",
            "Source Evidence",
            "Do / Avoid",
            "Need-to-Know Formula / Example",
            "Learning Question",
            "Core Explanation",
            "How the Reasoning Works",
            "Worked Examples and Evidence",
            "Concept Comparison",
            "Revision Checklist",
            *PROFESSIONAL_ARTIFACT_HEADINGS,
            "What You Need To Understand First",
            "Step-by-Step Explanation",
            "Why This Works",
            "Mini Worked Example",
            "Memory Hooks / Checks",
            "Practice Prompt",
        ),
        forbidden_phrases=(
            "Professional Mode",
            "Source-Strict Research Mode",
            "Tutor Mode",
            "Quick Answer",
            "Detailed Explanation",
        ),
    )
