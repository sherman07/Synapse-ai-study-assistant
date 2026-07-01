import logging
import re
from typing import Iterable, List, Optional, Sequence


SOURCE_STRICT_BADGES = (
    "Direct from source",
    "Inferred from source",
    "Tutor explanation",
    "Not enough evidence",
)

SOURCE_STRICT_ARTIFACT_HEADINGS = (
    "Core Concept Map",
    "Main Notes by Lecture Section",
    "Key Terms Table",
    "Case Study / Example Breakdown",
    "Evidence Bank",
    "Exam Answer Templates",
    "Flashcard-ready Summary",
)

PROFESSIONAL_ARTIFACT_HEADINGS = (
    "Big Picture",
    "The Exam Will Probably Test These Ideas",
    "What You Actually Need To Understand",
    "Deep Explanation",
    "Deep Explanation of the Core Concepts",
    "Concept Connections",
    "Concept Connections: How The Ideas Work Together",
    "Background Knowledge Layer",
    "Background Knowledge Needed To Understand This Properly",
    "Application To New Situations",
    "How To Apply This To New Questions",
    "High-Quality Student Thinking",
    "Common Mistakes",
    "Common Mistakes That Lose Marks",
    "How To Use This In Assessment",
    "Model High-Quality Output",
    "Model High-Quality Answers",
    "Exam Question Bank",
    "Memory and Practice",
)


def _collapse_blank_lines(text: str) -> str:
    return re.sub(r"\n{4,}", "\n\n\n", (text or "").strip())


def _normalise_heading(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (value or "").lower()).strip()


def _heading_matches(title: str, forbidden_headings: Sequence[str]) -> bool:
    normalised_title = _normalise_heading(title)
    return any(_normalise_heading(heading) in normalised_title for heading in forbidden_headings)


def _word_count(text: str) -> int:
    return len(re.findall(r"[\u4e00-\u9fff]|\b[\w'-]+\b", text or ""))


def strip_source_strict_badge_lines(text: str) -> str:
    badge_pattern = "|".join(re.escape(badge) for badge in SOURCE_STRICT_BADGES)
    cleaned = re.sub(rf"(?im)^\s*\[(?:{badge_pattern})\]\s*$", "", text or "")
    return _collapse_blank_lines(cleaned)


def remove_sections_by_heading(text: str, forbidden_headings: Sequence[str]) -> str:
    if not forbidden_headings:
        return _collapse_blank_lines(text)

    lines = (text or "").splitlines()
    kept: List[str] = []
    skip_level: Optional[int] = None
    for raw_line in lines:
        heading_match = re.match(r"^\s*(#{2,6})\s+(.+?)\s*$", raw_line)
        if heading_match:
            level = len(heading_match.group(1))
            if skip_level is not None and level <= skip_level:
                skip_level = None
            if skip_level is None and _heading_matches(heading_match.group(2), forbidden_headings):
                skip_level = level
                continue
        if skip_level is not None:
            continue
        kept.append(raw_line.rstrip())
    return _collapse_blank_lines("\n".join(kept))


def visible_headings(text: str) -> List[str]:
    return [
        match.group(1).strip()
        for match in re.finditer(r"(?m)^\s*#{1,6}\s+(.+?)\s*$", text or "")
    ]


def _has_heading(text: str, expected_heading: str) -> bool:
    expected = _normalise_heading(expected_heading)
    return any(expected in _normalise_heading(heading) for heading in visible_headings(text))


def record_validator_warning(context: dict, mode_label: str, message: str) -> None:
    context.setdefault("validator_warnings", []).append(message)
    logging.getLogger(__name__).debug("%s validator: %s", mode_label, message)


def validate_mode_shape(
    summary: str,
    context: dict,
    *,
    mode_label: str,
    expected_headings: Iterable[str] = (),
    forbidden_headings: Iterable[str] = (),
    forbidden_phrases: Iterable[str] = (),
    word_warning_limit: Optional[int] = None,
    strip_source_strict_artifacts: bool = True,
) -> str:
    cleaned = (summary or "").strip()
    if strip_source_strict_artifacts:
        without_badges = strip_source_strict_badge_lines(cleaned)
        if without_badges != cleaned:
            record_validator_warning(context, mode_label, "removed source-strict badge leakage")
        cleaned = without_badges

    forbidden_heading_list = list(forbidden_headings)
    without_forbidden_sections = remove_sections_by_heading(cleaned, forbidden_heading_list)
    if without_forbidden_sections != cleaned:
        record_validator_warning(context, mode_label, "removed unselected-mode section leakage")
    cleaned = without_forbidden_sections

    missing_headings = [
        heading
        for heading in expected_headings
        if not _has_heading(cleaned, heading)
    ]
    if missing_headings:
        record_validator_warning(context, mode_label, f"missing expected section(s): {', '.join(missing_headings)}")

    lower_cleaned = cleaned.lower()
    leaked_phrases = [
        phrase
        for phrase in forbidden_phrases
        if phrase and phrase.lower() in lower_cleaned
    ]
    if leaked_phrases:
        record_validator_warning(context, mode_label, f"contains unselected-mode phrase(s): {', '.join(leaked_phrases)}")

    if word_warning_limit and _word_count(cleaned) > word_warning_limit:
        record_validator_warning(context, mode_label, f"exceeds expected concise word budget of {word_warning_limit} words")

    return cleaned
