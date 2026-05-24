from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


class FastApiAppBuilder:
    """Builds the HTTP app and owns cross-cutting middleware setup."""

    def __init__(self, title: str, allow_origins=None, allow_origin_regex=None, allow_credentials: bool = False):
        self.title = title
        self.allow_origins = allow_origins or []
        self.allow_origin_regex = allow_origin_regex
        self.allow_credentials = allow_credentials

    def build(self) -> FastAPI:
        app = FastAPI(title=self.title)
        app.add_middleware(
            CORSMiddleware,
            allow_origins=self.allow_origins,
            allow_origin_regex=self.allow_origin_regex,
            allow_credentials=self.allow_credentials,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        return app


class LatexPromptLiteralRegistry:
    """Registers literal LaTeX environment names so f-string prompts stay safe."""

    DEFAULT_ENV_NAMES = (
        "bmatrix",
        "pmatrix",
        "matrix",
        "vmatrix",
        "Vmatrix",
        "Bmatrix",
        "smallmatrix",
        "array",
        "cases",
        "aligned",
        "align",
        "gathered",
        "gather",
        "split",
        "equation",
    )

    def __init__(self, env_names=DEFAULT_ENV_NAMES):
        self.env_names = tuple(env_names)

    def install(self, namespace: dict) -> None:
        for env_name in self.env_names:
            namespace[env_name] = "{" + env_name + "}"
