from pathlib import Path
from typing import Iterable


class AppSectionLoader:
    """Loads route and workflow sections into the FastAPI app namespace."""

    def __init__(self, package_dir: Path, section_files: Iterable[str], section_dir: str = "app_sections"):
        self.package_dir = Path(package_dir)
        self.section_dir = section_dir
        self.section_files = tuple(section_files)

    def section_path(self, file_name: str) -> Path:
        section_root = (self.package_dir / self.section_dir).resolve()
        path = (section_root / file_name).resolve()
        try:
            path.relative_to(section_root)
        except ValueError:
            raise ValueError(f"App section path escapes section directory: {file_name}")
        if path.suffix != ".py":
            raise ValueError(f"App section must be a Python file: {file_name}")
        return path

    def load(self, namespace: dict) -> None:
        for file_name in self.section_files:
            path = self.section_path(file_name)
            # Section files are a fixed local list and path-validated before execution.
            exec(compile(path.read_text(encoding="utf-8"), str(path), "exec"), namespace)  # nosec
