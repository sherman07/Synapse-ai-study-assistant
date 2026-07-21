"""Short-lived, content-free progress snapshots for long-running analyses."""

from __future__ import annotations

import re
import threading
import time
from typing import Any, Dict, Optional


_REQUEST_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{12,96}$")
_PROGRESS_TTL_SECONDS = 15 * 60
_LOCK = threading.Lock()
_RECORDS: Dict[str, Dict[str, Any]] = {}

_STAGES = {
    "initializing": (8, "Starting the analysis workspace"),
    "file_read": (16, "Reading your uploaded material"),
    "file_extract": (24, "Extracting useful text and visuals"),
    "source_preparation": (34, "Organising sources and study context"),
    "cache_hit": (76, "Restoring your previous analysis"),
    "generation": (52, "Drafting your tutor-style study notes"),
    "title": (72, "Refining the title and structure"),
    "mind_map": (82, "Connecting the key ideas"),
    "persistence": (92, "Saving your study workspace"),
    "completed": (100, "Study notes are ready"),
    "failed": (100, "Analysis stopped before completion"),
}


def valid_analysis_request_id(request_id: str) -> bool:
    return bool(_REQUEST_ID_PATTERN.fullmatch(str(request_id or "")))


def _cleanup_locked(now: float) -> None:
    expired = [
        request_id
        for request_id, record in _RECORDS.items()
        if now - float(record.get("updated_monotonic", now)) > _PROGRESS_TTL_SECONDS
    ]
    for request_id in expired:
        _RECORDS.pop(request_id, None)


def _snapshot(request_id: str, record: Dict[str, Any], now: float) -> Dict[str, Any]:
    stage = str(record.get("stage") or "initializing")
    progress_percent, message = _STAGES.get(stage, _STAGES["initializing"])
    return {
        "request_id": request_id,
        "status": str(record.get("status") or "running"),
        "stage": stage,
        "progress_percent": progress_percent,
        "message": message,
        "elapsed_seconds": round(max(0.0, now - float(record["started_monotonic"])), 1),
    }


def begin_analysis_progress(request_id: str) -> Optional[Dict[str, Any]]:
    if not valid_analysis_request_id(request_id):
        return None
    now = time.monotonic()
    with _LOCK:
        _cleanup_locked(now)
        _RECORDS[request_id] = {
            "status": "running",
            "stage": "initializing",
            "started_monotonic": now,
            "updated_monotonic": now,
        }
        return _snapshot(request_id, _RECORDS[request_id], now)


def update_analysis_progress(request_id: str, stage: str) -> Optional[Dict[str, Any]]:
    if not valid_analysis_request_id(request_id) or stage not in _STAGES:
        return None
    now = time.monotonic()
    with _LOCK:
        _cleanup_locked(now)
        record = _RECORDS.get(request_id)
        if not record:
            return None
        record.update({"stage": stage, "status": "running", "updated_monotonic": now})
        return _snapshot(request_id, record, now)


def finish_analysis_progress(request_id: str, status: str) -> Optional[Dict[str, Any]]:
    terminal_status = "completed" if status == "completed" else "failed"
    now = time.monotonic()
    with _LOCK:
        _cleanup_locked(now)
        record = _RECORDS.get(request_id)
        if not record:
            return None
        record.update({
            "stage": terminal_status,
            "status": terminal_status,
            "updated_monotonic": now,
        })
        return _snapshot(request_id, record, now)


def get_analysis_progress(request_id: str) -> Optional[Dict[str, Any]]:
    if not valid_analysis_request_id(request_id):
        return None
    now = time.monotonic()
    with _LOCK:
        _cleanup_locked(now)
        record = _RECORDS.get(request_id)
        return _snapshot(request_id, record, now) if record else None
