import hashlib
from pathlib import Path
from typing import Callable, Dict, List, Optional

from .validators.assignment_apa import validate_assignment_apa
from .validators.detailed_explanation import validate_detailed_explanation
from .validators.professional import validate_professional
from .validators.quick_answer import validate_quick_answer
from .validators.source_strict import validate_source_strict
from .validators.tutor import validate_tutor


BACKEND_DIR = Path(__file__).resolve().parents[2]
PROMPT_ROOT = BACKEND_DIR / "prompts"
COMMON_PROMPT_DIR = PROMPT_ROOT / "common"
PROMPT_MODE_DIR = PROMPT_ROOT / "modes"

DEFAULT_NOTE_PROMPT_MODE = "professor_mode"
DEFAULT_NOTE_LENGTH_MODE = "standard_notes"

Validator = Callable[[str, dict], str]


NOTE_PROMPT_MODES: Dict[str, dict] = {
    "quick_answer": {
        "label": "Quick Answer",
        "file": "quick-answer.md",
        "min_units": 520,
        "allow_expansion": False,
        "validator": validate_quick_answer,
    },
    "detailed_explanation": {
        "label": "Detailed Explanation",
        "file": "detailed-explanation.md",
        "min_units": 1800,
        "allow_expansion": True,
        "validator": validate_detailed_explanation,
    },
    "professor_mode": {
        "label": "Professional Mode",
        "file": "professional.md",
        "min_units": 2600,
        "allow_expansion": True,
        "validator": validate_professional,
    },
    "tutor_mode": {
        "label": "Tutor Mode",
        "file": "tutor.md",
        "min_units": 2000,
        "allow_expansion": True,
        "validator": validate_tutor,
    },
    "source_strict_research_mode": {
        "label": "Source-Strict Research Mode",
        "file": "source-strict-research.md",
        "min_units": 1800,
        "allow_expansion": True,
        "validator": validate_source_strict,
    },
    "assignment_apa_mode": {
        "label": "Assignment / APA Mode",
        "file": "assignment-apa.md",
        "min_units": 2200,
        "allow_expansion": True,
        "validator": validate_assignment_apa,
    },
}


NOTE_LENGTH_MODES: Dict[str, dict] = {
    "quick_review": {
        "label": "Quick Review",
        "description": "Low content depth: extract the core answer and the few most useful source anchors.",
        "min_words": 300,
        "max_words": 500,
        "target_words": 420,
        "target_units": 420,
        "allow_expansion": False,
    },
    "standard_notes": {
        "label": "Standard Notes",
        "description": "Balanced content depth: explain source concepts, reasoning, examples, and revision use.",
        "min_words": 900,
        "max_words": 1400,
        "target_words": 1150,
        "target_units": 980,
        "allow_expansion": True,
    },
    "deep_study": {
        "label": "Deep Study",
        "description": "High content depth: expand reasoning, concept connections, source examples, applications, limitations, and mistakes.",
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


def _safe_prompt_path(base_dir: Path, filename: str) -> Path:
    path = (base_dir / filename).resolve()
    try:
        path.relative_to(base_dir.resolve())
    except ValueError:
        raise ValueError(f"Prompt file escapes prompt directory: {filename}")
    return path


def load_note_prompt_mode_text(value: str) -> str:
    key = normalise_note_prompt_mode(value)
    config = NOTE_PROMPT_MODES[key]
    path = _safe_prompt_path(PROMPT_MODE_DIR, config["file"])
    return path.read_text(encoding="utf-8").strip()


def load_common_prompt_text(filename: str) -> str:
    path = _safe_prompt_path(COMMON_PROMPT_DIR, filename)
    return path.read_text(encoding="utf-8").strip()


def prompt_mode_prompt_hash(value: str, common_files: Optional[List[str]] = None) -> str:
    key = normalise_note_prompt_mode(value)
    files = list(common_files or [
        "language.md",
        "source-context.md",
        "visual-markers.md",
        "math-formatting.md",
        "output-format.md",
    ])
    digest = hashlib.sha256()
    for filename in files:
        digest.update(filename.encode("utf-8"))
        digest.update(b"\0")
        digest.update(load_common_prompt_text(filename).encode("utf-8"))
        digest.update(b"\0")
    digest.update(str(NOTE_PROMPT_MODES[key]["file"]).encode("utf-8"))
    digest.update(b"\0")
    digest.update(load_note_prompt_mode_text(key).encode("utf-8"))
    return digest.hexdigest()[:16]


def validate_note_output(mode_key: str, summary: str, context: Optional[dict] = None) -> str:
    key = normalise_note_prompt_mode(mode_key)
    validator = NOTE_PROMPT_MODES[key].get("validator")
    if not callable(validator):
        return summary or ""
    validator_context = dict(context or {})
    validator_context["prompt_mode"] = key
    return validator(summary or "", validator_context)
