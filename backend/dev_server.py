from pathlib import Path

import uvicorn


class BackendDevServer:
    """Runs the API in development without watching virtualenv or frontend files."""

    def __init__(self, host: str = "127.0.0.1", port: int = 8001):
        self.host = host
        self.port = port
        self.project_root = Path(__file__).resolve().parents[1]
        self.backend_dir = self.project_root / "backend"

    def run(self) -> None:
        uvicorn.run(
            "backend.app:app",
            host=self.host,
            port=self.port,
            reload=True,
            reload_dirs=[str(self.backend_dir)],
            reload_excludes=[
                ".venv/*",
                "venv/*",
                "frontend/*",
                "logos/*",
                "**/__pycache__/*",
                "**/*.pyc",
                "backend/synapse_analysis_cache.json",
            ],
        )


def main() -> None:
    BackendDevServer().run()


if __name__ == "__main__":
    main()
