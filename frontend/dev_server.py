from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class StaticFrontendServer:
    """Serves the project root without injecting browser auto-refresh scripts."""

    def __init__(self, host: str = "0.0.0.0", port: int = 3000):
        self.host = host
        self.port = port
        self.project_root = Path(__file__).resolve().parents[1]

    def run(self) -> None:
        handler = partial(SimpleHTTPRequestHandler, directory=str(self.project_root))
        server = ThreadingHTTPServer((self.host, self.port), handler)
        print(f"Serving Synapse frontend at http://{self.host}:{self.port}/frontend/")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nFrontend server stopped.")
        finally:
            server.server_close()


def main() -> None:
    StaticFrontendServer().run()


if __name__ == "__main__":
    main()
