from pathlib import Path
from typing import Dict, List


PROMPT_MODE_DIR = Path(__file__).resolve().parents[1] / "prompts" / "note_modes"

DEFAULT_NOTE_PROMPT_MODE = "professor_mode"
DEFAULT_NOTE_LENGTH_MODE = "standard_notes"

NOTE_PROMPT_MODES: Dict[str, dict] = {
    "quick_answer": {
        "label": "Quick Answer",
        "file": "quick_answer.md",
        "min_units": 520,
        "allow_expansion": False,
    },
    "detailed_explanation": {
        "label": "Detailed Explanation",
        "file": "detailed_explanation.md",
        "min_units": 1800,
        "allow_expansion": True,
    },
    "professor_mode": {
        "label": "Academic Analysis",
        "file": "academic_analysis_mode.md",
        "min_units": 2600,
        "allow_expansion": True,
    },
    "tutor_mode": {
        "label": "Tutor Mode",
        "file": "tutor_mode.md",
        "min_units": 2000,
        "allow_expansion": True,
    },
    "source_strict_research_mode": {
        "label": "Source-Strict Research Mode",
        "file": "source_strict_research_mode.md",
        "min_units": 1800,
        "allow_expansion": True,
    },
    "assignment_apa_mode": {
        "label": "Assignment / APA Mode",
        "file": "assignment_apa_mode.md",
        "min_units": 2200,
        "allow_expansion": True,
    },
}

NOTE_LENGTH_MODES: Dict[str, dict] = {
    "quick_review": {
        "label": "Quick Review",
        "description": "300-500 words focused on the fastest revision points.",
        "min_words": 300,
        "max_words": 500,
        "target_words": 420,
        "target_units": 420,
        "allow_expansion": False,
    },
    "standard_notes": {
        "label": "Standard Notes",
        "description": "900-1400 words with balanced explanation and evidence.",
        "min_words": 900,
        "max_words": 1400,
        "target_words": 1150,
        "target_units": 980,
        "allow_expansion": True,
    },
    "deep_study": {
        "label": "Deep Study",
        "description": "1800-2500 words for fuller exam preparation.",
        "min_words": 1800,
        "max_words": 2500,
        "target_words": 2150,
        "target_units": 1850,
        "allow_expansion": True,
    },
}


def note_prompt_mode_options() -> List[dict]:
    return [
        {
            "value": key,
            "label": config["label"],
        }
        for key, config in NOTE_PROMPT_MODES.items()
    ]


def note_length_mode_options() -> List[dict]:
    return [
        {
            "value": key,
            "label": config["label"],
            "description": config["description"],
            "min_words": config["min_words"],
            "max_words": config["max_words"],
        }
        for key, config in NOTE_LENGTH_MODES.items()
    ]


def normalise_note_prompt_mode(value: str) -> str:
    key = str(value or "").strip().lower().replace("-", "_").replace(" ", "_").replace("/", "_")
    aliases = {
        "quick": "quick_answer",
        "quickanswer": "quick_answer",
        "detail": "detailed_explanation",
        "detailed": "detailed_explanation",
        "academic": "professor_mode",
        "academic_analysis": "professor_mode",
        "analysis": "professor_mode",
        "professional": "professor_mode",
        "professional_mode": "professor_mode",
        "professor": "professor_mode",
        "professor_mode": "professor_mode",
        "teacher": "professor_mode",
        "tutor": "tutor_mode",
        "source_strict": "source_strict_research_mode",
        "research": "source_strict_research_mode",
        "strict_research": "source_strict_research_mode",
        "apa": "assignment_apa_mode",
        "assignment": "assignment_apa_mode",
        "assignment_apa": "assignment_apa_mode",
    }
    key = aliases.get(key, key)
    return key if key in NOTE_PROMPT_MODES else DEFAULT_NOTE_PROMPT_MODE


def normalise_note_length_mode(value: str) -> str:
    key = str(value or "").strip().lower().replace("-", "_").replace(" ", "_").replace("/", "_")
    aliases = {
        "quick": "quick_review",
        "quickreview": "quick_review",
        "standard": "standard_notes",
        "notes": "standard_notes",
        "standardnotes": "standard_notes",
        "deep": "deep_study",
        "deepstudy": "deep_study",
    }
    key = aliases.get(key, key)
    return key if key in NOTE_LENGTH_MODES else DEFAULT_NOTE_LENGTH_MODE


def note_prompt_mode_label(value: str) -> str:
    key = normalise_note_prompt_mode(value)
    return NOTE_PROMPT_MODES[key]["label"]


def note_length_mode_label(value: str) -> str:
    key = normalise_note_length_mode(value)
    return NOTE_LENGTH_MODES[key]["label"]


def note_prompt_mode_min_units(value: str, fallback: int = 2600) -> int:
    key = normalise_note_prompt_mode(value)
    try:
        return int(NOTE_PROMPT_MODES[key].get("min_units", fallback))
    except Exception:
        return fallback


def note_length_mode_word_bounds(value: str) -> tuple[int, int]:
    key = normalise_note_length_mode(value)
    config = NOTE_LENGTH_MODES[key]
    return int(config["min_words"]), int(config["max_words"])


def note_length_mode_target_words(value: str) -> int:
    key = normalise_note_length_mode(value)
    return int(NOTE_LENGTH_MODES[key]["target_words"])


def note_length_mode_unit_target(value: str, fallback: int = 980) -> int:
    key = normalise_note_length_mode(value)
    try:
        return int(NOTE_LENGTH_MODES[key].get("target_units", fallback))
    except Exception:
        return fallback


def note_prompt_mode_allows_expansion(value: str) -> bool:
    key = normalise_note_prompt_mode(value)
    return bool(NOTE_PROMPT_MODES[key].get("allow_expansion", True))


def note_length_mode_allows_expansion(value: str) -> bool:
    key = normalise_note_length_mode(value)
    return bool(NOTE_LENGTH_MODES[key].get("allow_expansion", True))


def load_note_prompt_mode_text(value: str) -> str:
    key = normalise_note_prompt_mode(value)
    config = NOTE_PROMPT_MODES[key]
    path = (PROMPT_MODE_DIR / config["file"]).resolve()
    try:
        path.relative_to(PROMPT_MODE_DIR.resolve())
    except ValueError:
        raise ValueError(f"Prompt mode file escapes prompt directory: {config['file']}")
    return path.read_text(encoding="utf-8").strip()
