import re
from typing import Dict, List, Tuple


NOTE_LENGTH_WORD_BOUNDS = {
    "quick_review": (300, 500),
    "standard_notes": (900, 1400),
    "deep_study": (1800, 2500),
}

SOURCE_STRICT_GAP_TEXT = "Not enough evidence from the uploaded source."

SOURCE_STRICT_SECTIONS: Tuple[Tuple[str, str, Tuple[str, ...], float], ...] = (
    (
        "source_question",
        "Source Question",
        ("Source Question", "Learning Question", "Overview"),
        0.10,
    ),
    (
        "direct_claims",
        "Direct Source Claims",
        ("Direct Source Claims", "Key Takeaways", "Main Notes by Lecture Section", "Main Notes"),
        0.22,
    ),
    (
        "source_evidence",
        "Source Evidence",
        ("Source Evidence", "Evidence Bank", "Key Terms Table", "Case Study / Example Breakdown"),
        0.22,
    ),
    (
        "inferences",
        "Inferences Allowed By The Source",
        ("Inferences Allowed By The Source", "Core Concept Map", "Interpretation"),
        0.14,
    ),
    (
        "gaps_limits",
        "Gaps / Limits",
        ("Gaps / Limits", "Gaps", "Limits", "Limitations"),
        0.12,
    ),
    (
        "exam_research_use",
        "Exam / Research Use",
        ("Exam / Research Use", "Exam Answer Templates", "Revision Checklist", "Common Mistakes"),
        0.10,
    ),
    (
        "compact_revision_summary",
        "Compact Revision Summary",
        ("Compact Revision Summary", "Flashcard-ready Summary", "Summary"),
        0.10,
    ),
)


def _normalise_heading(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (value or "").lower()).strip()


def _count_words(text: str) -> int:
    return len(re.findall(r"[\u4e00-\u9fff]|\b[\w'-]+\b", text or ""))


def _parse_sections(summary: str) -> Dict[str, str]:
    sections: Dict[str, str] = {}
    current_heading = "Overview"
    current_content: List[str] = []
    for raw_line in (summary or "").splitlines():
        heading_match = re.match(r"^\s*#{1,6}\s+(.+?)\s*$", raw_line)
        if heading_match:
            if current_content or current_heading not in sections:
                sections[current_heading] = "\n".join(current_content).strip()
            current_heading = heading_match.group(1).strip()
            current_content = []
        else:
            current_content.append(raw_line.rstrip())
    if current_content or current_heading not in sections:
        sections[current_heading] = "\n".join(current_content).strip()
    return sections


def _section_key(title: str) -> str:
    normalised_title = _normalise_heading(title)
    for key, _display_title, aliases, _weight in SOURCE_STRICT_SECTIONS:
        for alias in aliases:
            if _normalise_heading(alias) in normalised_title:
                return key
    return ""


def _strip_old_badge_lines(text: str) -> str:
    return re.sub(
        r"(?im)^\s*\[(?:Direct from source|Inferred from source|Tutor explanation|Not enough evidence)\]\s*$",
        "",
        text or "",
    ).strip()


def _remove_leaked_visual_fallbacks(text: str) -> str:
    cleaned_lines: List[str] = []
    for raw_line in (text or "").splitlines():
        if re.search(
            r"Source figure unavailable|Figure unavailable|browser did not receive a usable image URL|This image could not be extracted from the uploaded source",
            raw_line,
            flags=re.I,
        ):
            continue
        cleaned_lines.append(raw_line.rstrip())
    return re.sub(r"\n{4,}", "\n\n\n", "\n".join(cleaned_lines)).strip()


def _remove_duplicate_paragraphs(text: str) -> str:
    blocks = re.split(r"\n{2,}", text or "")
    seen = set()
    kept: List[str] = []
    for block in blocks:
        block_text = block.strip()
        if not block_text:
            continue
        if block_text.startswith("#") or block_text.startswith("[[VISUAL:"):
            kept.append(block_text)
            continue
        signature = re.sub(r"\s+", " ", re.sub(r"\[\[VISUAL:\d+\]\]", "", block_text)).strip().lower()
        if len(signature) >= 24 and signature in seen:
            continue
        seen.add(signature)
        kept.append(block_text)

    cleaned_blocks: List[str] = []
    for block in kept:
        line_seen = set()
        cleaned_lines: List[str] = []
        for raw_line in block.splitlines():
            stripped = raw_line.strip()
            signature = re.sub(r"\s+", " ", stripped).strip().lower()
            if stripped and not stripped.startswith("#") and signature in line_seen:
                continue
            if stripped:
                line_seen.add(signature)
            cleaned_lines.append(raw_line.rstrip())
        cleaned_blocks.append("\n".join(cleaned_lines).strip())
    return "\n\n".join(block for block in cleaned_blocks if block).strip()


def _truncate_fragment(text: str, max_words: int) -> str:
    if max_words <= 0:
        return ""
    pieces: List[str] = []
    used = 0
    for token in re.findall(r"\s+|[^\s]+", text or ""):
        token_words = _count_words(token)
        if token_words and used + token_words > max_words:
            break
        pieces.append(token)
        used += token_words
    suffix = "..." if used < _count_words(text) else ""
    return "".join(pieces).strip().rstrip(",;:-") + suffix


def _trim_block(text: str, max_words: int) -> str:
    if _count_words(text) <= max_words:
        return text.strip()
    blocks = re.split(r"\n{2,}", text.strip())
    kept: List[str] = []
    used = 0
    for block in blocks:
        if not block.strip():
            continue
        block_words = _count_words(block)
        if used + block_words <= max_words or not kept:
            kept.append(block.strip())
            used += block_words
            continue
        remaining = max_words - used
        if remaining > 0:
            kept.append(_truncate_fragment(block.strip(), remaining))
        break
    return "\n\n".join(part for part in kept if part).strip()


def _section_word_caps(note_length_mode: str) -> Dict[str, int]:
    _, max_words = NOTE_LENGTH_WORD_BOUNDS.get(note_length_mode, NOTE_LENGTH_WORD_BOUNDS["standard_notes"])
    return {
        key: max(24, int(max_words * weight))
        for key, _title, _aliases, weight in SOURCE_STRICT_SECTIONS
    }


def _source_pointer_present(text: str) -> bool:
    return bool(re.search(r"\((?:Slide|Page|Source|Section)\s+\d+|slide\s+\d+|page\s+\d+", text or "", flags=re.I))


def validate_source_strict(summary: str, context: dict) -> str:
    note_length_mode = context.get("note_length_mode") or "standard_notes"
    title_match = re.search(r"(?m)^\s*#\s+(.+?)\s*$", summary or "")
    title = re.sub(r"\s+", " ", title_match.group(1) if title_match else "").strip() or "Source-Strict Study Notes"

    cleaned = _remove_duplicate_paragraphs(_remove_leaked_visual_fallbacks(_strip_old_badge_lines(summary or "")))
    parsed_sections = _parse_sections(cleaned)
    by_key: Dict[str, str] = {}
    unmatched_sections: List[str] = []
    for heading, body in parsed_sections.items():
        body = _strip_old_badge_lines(body).strip()
        key = _section_key(heading)
        if key and key not in by_key and body:
            by_key[key] = body
        elif body and not heading.startswith("#"):
            unmatched_sections.append(body)

    fallback_pool = _remove_duplicate_paragraphs("\n\n".join(unmatched_sections))
    if fallback_pool and "direct_claims" not in by_key:
        by_key["direct_claims"] = fallback_pool
    if fallback_pool and "source_evidence" not in by_key and _source_pointer_present(fallback_pool):
        by_key["source_evidence"] = fallback_pool

    caps = _section_word_caps(note_length_mode)
    parts = [f"# {title}"]
    for key, display_title, _aliases, _weight in SOURCE_STRICT_SECTIONS:
        body = _remove_duplicate_paragraphs(_remove_leaked_visual_fallbacks(_strip_old_badge_lines(by_key.get(key, ""))))
        if not body:
            body = SOURCE_STRICT_GAP_TEXT
        body = _trim_block(body, caps.get(key, 120))
        parts.extend(["", f"## {display_title}", "", body.strip()])
    return "\n".join(parts).strip()
