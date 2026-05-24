def format_bytes(size: int) -> str:
    value = float(max(0, size or 0))
    for unit in ("B", "KB", "MB", "GB"):
        if value < 1024 or unit == "GB":
            return f"{value:.1f}{unit}" if unit != "B" else f"{int(value)}B"
        value /= 1024
    return f"{value:.1f}GB"


async def read_upload_bytes(upload, max_bytes: int, label: str = "uploaded file") -> bytes:
    limit = max(1, int(max_bytes or 1))
    data = await upload.read(limit + 1)
    if len(data) > limit:
        raise ValueError(
            f"{label or 'uploaded file'} is too large ({format_bytes(len(data))}). "
            f"The current limit is {format_bytes(limit)}."
        )
    return data
