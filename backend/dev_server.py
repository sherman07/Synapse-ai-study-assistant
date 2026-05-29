import os
from pathlib import Path

import uvicorn


class BackendDevServer:
    """Runs the API in development without watching virtualenv or frontend files."""

    def __init__(self, host: str = "127.0.0.1", port: int = 8001):
        self.host = host
        self.port = port
        self.project_root = Path(__file__).resolve().parents[1]
        self.backend_dir = self.project_root / "backend"
        self.reload_enabled = os.getenv("SYNAPSE_BACKEND_RELOAD", "false").lower() not in {"0", "false", "no"}

    def run(self) -> None:
        options = {
            "host": self.host,
            "port": self.port,
            "reload": self.reload_enabled,
        }
        if self.reload_enabled:
            options.update({
                "reload_dirs": [str(self.backend_dir)],
                "reload_excludes": [
                    ".venv/*",
                    "venv/*",
                    "frontend/*",
                    "logos/*",
                    "**/__pycache__/*",
                    "**/*.pyc",
                    "backend/synapse_analysis_cache.json",
                ],
            })
        uvicorn.run(
            "backend.app:app",
            **options,
        )


def main() -> None:
    BackendDevServer().run()


if __name__ == "__main__":
    main()
