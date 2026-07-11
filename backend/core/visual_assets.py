import base64
import hashlib
import re
from pathlib import Path
from typing import List, Optional, Tuple
from urllib.parse import urlparse

try:
    from core.config import PUBLIC_BACKEND_BASE_URL, RUNTIME_ASSETS_DIR
except ModuleNotFoundError:
    from backend.core.config import PUBLIC_BACKEND_BASE_URL, RUNTIME_ASSETS_DIR


DATA_IMAGE_RE = re.compile(r"^data:(image/[A-Za-z0-9.+-]+)(?:;[^,]*)?;base64,(.+)$", re.S)
CONTENT_TYPE_EXTENSIONS = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
}
RASTER_IMAGE_TYPES = set(CONTENT_TYPE_EXTENSIONS)
LOCAL_FILESYSTEM_URL_RE = re.compile(
    r"^(?:file:|[A-Za-z]:[\\/]|\\\\|/(?:Users|home|var|tmp|private|Volumes|Applications|opt|usr)/)",
    re.I,
)


def parse_image_data_url(url: str) -> Optional[Tuple[str, bytes]]:
    match = DATA_IMAGE_RE.match(str(url or "").strip())
    if not match:
        return None
    content_type = match.group(1).lower()
    try:
        data = base64.b64decode(match.group(2), validate=True)
    except Exception:
        return None
    if not data:
        return None
    return content_type, data


def visual_asset_url_for_browser(url: str) -> str:
    """Convert model-facing image data URLs into browser-served runtime assets."""
    value = str(url or "").strip()
    parsed = parse_image_data_url(value)
    if not parsed:
        lower_value = value.lower()
        if lower_value.startswith("data:image/"):
            return ""
        if LOCAL_FILESYSTEM_URL_RE.match(value):
            return ""
        parsed_url = urlparse(value)
        if parsed_url.scheme and parsed_url.scheme not in {"http", "https"}:
            return ""
        return value

    content_type, data = parsed
    if content_type not in RASTER_IMAGE_TYPES:
        return ""
    extension = CONTENT_TYPE_EXTENSIONS.get(content_type, "img")
    digest = hashlib.sha256(data).hexdigest()
    asset_dir = RUNTIME_ASSETS_DIR / "visuals"
    asset_path = asset_dir / f"{digest}.{extension}"
    try:
        asset_dir.mkdir(parents=True, exist_ok=True)
        if not asset_path.exists():
            asset_path.write_bytes(data)
        return f"{PUBLIC_BACKEND_BASE_URL}/assets/visuals/{asset_path.name}"
    except Exception:
        return url


def runtime_visual_asset_path_for_browser_url(url: str) -> Optional[Path]:
    value = str(url or "").strip()
    if not value:
        return None

    parsed = urlparse(value)
    backend_base = urlparse(PUBLIC_BACKEND_BASE_URL)
    path = parsed.path
    if parsed.scheme or parsed.netloc:
        if parsed.scheme != backend_base.scheme or parsed.netloc != backend_base.netloc:
            return None

    prefix = "/assets/visuals/"
    if not path.startswith(prefix):
        return None
    asset_name = path[len(prefix):]
    if not asset_name or "/" in asset_name or "\\" in asset_name:
        return None
    return RUNTIME_ASSETS_DIR / "visuals" / asset_name


def visual_asset_url_is_available(url: str) -> bool:
    browser_url = visual_asset_url_for_browser(url)
    if not browser_url:
        return False
    asset_path = runtime_visual_asset_path_for_browser_url(browser_url)
    if asset_path is None:
        return True
    try:
        return asset_path.is_file()
    except Exception:
        return False


def filter_browser_visual_gallery(items: List[dict]) -> List[dict]:
    """Keep cached visual metadata only when the browser URL can still render."""
    cleaned: List[dict] = []
    for fallback_index, item in enumerate(items or []):
        if not isinstance(item, dict):
            continue
        browser_url = visual_asset_url_for_browser(item.get("url", ""))
        if not browser_url or not visual_asset_url_is_available(browser_url):
            continue
        cleaned_item = dict(item)
        cleaned_item["url"] = browser_url
        if "index" not in cleaned_item:
            marker_index = visual_marker_index(cleaned_item, fallback_index)
            if marker_index is not None:
                cleaned_item["index"] = marker_index
        cleaned.append(cleaned_item)
    return cleaned


def visual_marker_index(item: dict, fallback_index: int) -> Optional[int]:
    for key in ("index", "id"):
        try:
            value = item.get(key)
            if value is None or value == "":
                continue
            index = int(value)
        except Exception:
            continue
        if index >= 0:
            return index
    return fallback_index


def visual_marker_indexes(items: List[dict]) -> set:
    indexes = set()
    for fallback_index, item in enumerate(items or []):
        if not isinstance(item, dict):
            continue
        marker_index = visual_marker_index(item, fallback_index)
        if marker_index is not None:
            indexes.add(marker_index)
    return indexes


def prune_unavailable_visual_markers(summary: str, items: List[dict]) -> str:
    """Drop cached visual markers whose browser-safe visual card no longer exists."""
    text = str(summary or "")
    if not text:
        return text
    available_indexes = visual_marker_indexes(items)

    def keep_or_remove(match) -> str:
        try:
            marker_index = int(match.group(1))
        except Exception:
            return ""
        return match.group(0) if marker_index in available_indexes else ""

    text = re.sub(r"(?m)^\s*\[\[VISUAL:(\d+)\]\]\s*$", keep_or_remove, text)
    text = re.sub(r"\[\[VISUAL:(\d+)\]\]", keep_or_remove, text)
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()
