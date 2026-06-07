import base64
import hashlib
import re
from typing import Optional, Tuple

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
        return "" if value.lower().startswith("data:image/") else value

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
