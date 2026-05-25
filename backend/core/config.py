import os
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI


def env_bool(name: str, default: str = "false") -> bool:
    return os.getenv(name, default).lower() not in {"0", "false", "no"}


def env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except Exception:
        return default


def env_list(name: str, default: str = "") -> list:
    raw = os.getenv(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_DIR / ".env")
load_dotenv()

OPENAI_API_KEY = (os.getenv("OPENAI_API_KEY") or "").strip()
OPENAI_ORG_ID = (os.getenv("OPENAI_ORG_ID") or "").strip() or None
OPENAI_PROJECT_ID = (os.getenv("OPENAI_PROJECT_ID") or "").strip() or None

client = (
    OpenAI(
        api_key=OPENAI_API_KEY,
        organization=OPENAI_ORG_ID,
        project=OPENAI_PROJECT_ID,
    )
    if OPENAI_API_KEY
    else None
)

ANALYSIS_MODEL = os.getenv("OPENAI_ANALYSIS_MODEL", "gpt-4o")
CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini")
TRANSCRIBE_MODEL = os.getenv("OPENAI_TRANSCRIBE_MODEL", "gpt-4o-mini-transcribe")
REALTIME_MODEL = os.getenv("OPENAI_REALTIME_MODEL", "gpt-realtime-2")
REALTIME_VOICE = os.getenv("OPENAI_REALTIME_VOICE", "marin")
VISUAL_IMAGE_GUIDE_MODEL = os.getenv("OPENAI_VISUAL_IMAGE_GUIDE_MODEL", "gpt-image-1.5")
VISUAL_IMAGE_GUIDE_SIZE = os.getenv("OPENAI_VISUAL_IMAGE_GUIDE_SIZE", "1024x1536")
VISUAL_IMAGE_GUIDE_QUALITY = os.getenv("OPENAI_VISUAL_IMAGE_GUIDE_QUALITY", "medium")

ENABLE_TUTOR_WEB_RESEARCH = env_bool("ENABLE_TUTOR_WEB_RESEARCH", "true")
MAX_TUTOR_SEARCH_RESULTS = env_int("MAX_TUTOR_SEARCH_RESULTS", 4)
MAX_TUTOR_RESEARCH_CHARS = env_int("MAX_TUTOR_RESEARCH_CHARS", 9000)
VOICE_TUTOR_HISTORY_LIMIT = env_int("VOICE_TUTOR_HISTORY_LIMIT", 24)
VOICE_TUTOR_CONTEXT_CHARS = env_int("VOICE_TUTOR_CONTEXT_CHARS", 18000)
VOICE_TUTOR_TOKENS = env_int("VOICE_TUTOR_TOKENS", 2200)
VOICE_TUTOR_REALTIME_CONTEXT_CHARS = env_int("VOICE_TUTOR_REALTIME_CONTEXT_CHARS", 16000)

MAX_AUDIO_BYTES = env_int("MAX_AUDIO_BYTES", 24 * 1024 * 1024)
MAX_VIDEO_BYTES = env_int("MAX_VIDEO_BYTES", 60 * 1024 * 1024)
MAX_UPLOAD_BYTES = env_int("MAX_UPLOAD_BYTES", 100 * 1024 * 1024)
MAX_SOURCE_CHARS = env_int("MAX_SOURCE_CHARS", 90000)
MAX_VIDEO_FRAMES = env_int("MAX_VIDEO_FRAMES", 8)
MAX_VISUAL_IMAGES_PER_SOURCE = env_int("MAX_VISUAL_IMAGES_PER_SOURCE", 10)
MAX_MULTI_SOURCE_VISUAL_IMAGES = env_int("MAX_MULTI_SOURCE_VISUAL_IMAGES", 64)
MULTISOURCE_VISUAL_GALLERY_LIMIT = env_int("MULTISOURCE_VISUAL_GALLERY_LIMIT", 36)
MULTISOURCE_SYNTHESIS_PART_TOKENS = env_int("MULTISOURCE_SYNTHESIS_PART_TOKENS", 9000)
MULTISOURCE_CONNECTION_TOKENS = env_int("MULTISOURCE_CONNECTION_TOKENS", 14000)
VISUAL_ARGUMENT_CARD_LIMIT = env_int("VISUAL_ARGUMENT_CARD_LIMIT", 18)
VISUAL_ARGUMENT_TOKENS = env_int("VISUAL_ARGUMENT_TOKENS", 1100)
VISUAL_RENDER_DPI = env_int("VISUAL_RENDER_DPI", 170)

ENABLE_PPTX_SLIDE_RENDER = env_bool("ENABLE_PPTX_SLIDE_RENDER", "true")
ENABLE_PPTX_SVG_FALLBACK_RENDER = env_bool("ENABLE_PPTX_SVG_FALLBACK_RENDER", "true")
ENABLE_SOURCE_PPTX_PREVIEW_RENDER = env_bool("ENABLE_SOURCE_PPTX_PREVIEW_RENDER", "true")
ENABLE_LOCAL_PPTX_APP_RENDER = env_bool(
    "ENABLE_LOCAL_PPTX_APP_RENDER",
    os.getenv("ENABLE_SOURCE_PPTX_APP_RENDER", "false"),
)

SOURCE_PREVIEW_MAX_SLIDES = env_int("SOURCE_PREVIEW_MAX_SLIDES", 80)
SOURCE_PREVIEW_MAX_PDF_PAGES = env_int("SOURCE_PREVIEW_MAX_PDF_PAGES", 160)
SOURCE_PREVIEW_MAX_EMBEDDED_IMAGES = env_int("SOURCE_PREVIEW_MAX_EMBEDDED_IMAGES", 120)
SOURCE_PREVIEW_RENDER_DPI = env_int("SOURCE_PREVIEW_RENDER_DPI", 200)
SOURCE_PREVIEW_PPTX_CONVERT_TIMEOUT = env_int(
    "SOURCE_PREVIEW_PPTX_CONVERT_TIMEOUT",
    env_int("SOURCE_PREVIEW_PPTX_APP_TIMEOUT", 120),
)

ENABLE_MULTI_SOURCE_DIGESTS = env_bool("ENABLE_MULTI_SOURCE_DIGESTS", "true")
MULTISOURCE_SOURCE_DIGEST_TOKENS = env_int("MULTISOURCE_SOURCE_DIGEST_TOKENS", 9000)
MULTISOURCE_SOURCE_CHARS = env_int("MULTISOURCE_SOURCE_CHARS", 500000)
ANALYSIS_CACHE_TTL_SECONDS = env_int("ANALYSIS_CACHE_TTL_SECONDS", 7 * 24 * 60 * 60)
DEFAULT_CACHE_PATH = BACKEND_DIR / "synapse_analysis_cache.json"
try:
    RUNTIME_DIR = BACKEND_DIR.parent / ".synapse_runtime"
    RUNTIME_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_PATH = RUNTIME_DIR / "synapse_analysis_cache.json"
except Exception:
    CACHE_PATH = DEFAULT_CACHE_PATH
CACHE_VERSION = "source_identity_mindmap_v63_enhanced_source_screenshots"

CORS_ALLOW_ORIGINS = env_list(
    "SYNAPSE_CORS_ALLOW_ORIGINS",
    ",".join(
        [
            "http://127.0.0.1:8001",
            "http://localhost:8001",
            "http://127.0.0.1:5173",
            "http://localhost:5173",
            "http://127.0.0.1:5500",
            "http://localhost:5500",
            "http://127.0.0.1:5501",
            "http://localhost:5501",
        ]
    ),
)
CORS_ALLOW_ORIGIN_REGEX = (
    os.getenv(
        "SYNAPSE_CORS_ALLOW_ORIGIN_REGEX",
        r"^https?://(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$",
    ).strip()
    or None
)
CORS_ALLOW_CREDENTIALS = env_bool("SYNAPSE_CORS_ALLOW_CREDENTIALS", "false")


def model_for_depth(depth: str) -> str:
    if depth == "focused":
        return os.getenv("OPENAI_FOCUSED_MODEL", os.getenv("OPENAI_BRIEF_MODEL", ANALYSIS_MODEL))
    if depth == "standard":
        return os.getenv("OPENAI_STANDARD_MODEL", ANALYSIS_MODEL)
    if depth == "detailed":
        return os.getenv("OPENAI_DETAILED_MODEL", ANALYSIS_MODEL)
    return os.getenv("OPENAI_COMPREHENSIVE_MODEL", os.getenv("OPENAI_DEEP_MODEL", ANALYSIS_MODEL))


def has_openai() -> bool:
    return bool(OPENAI_API_KEY and client is not None)


def require_openai() -> None:
    if not has_openai():
        raise RuntimeError(
            "OPENAI_API_KEY is missing. Create backend/.env and add "
            "OPENAI_API_KEY=your_key_here, then restart uvicorn."
        )
