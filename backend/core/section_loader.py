from pathlib import Path
from typing import Iterable


class AppSectionLoader:
    """Loads route and workflow sections into the FastAPI app namespace."""

    def __init__(self, package_dir: Path, section_files: Iterable[str], section_dir: str = "app_sections"):
        self.package_dir = Path(package_dir)
        self.section_dir = section_dir
        self.section_files = tuple(section_files)

    def section_path(self, file_name: str) -> Path:
        return self.package_dir / self.section_dir / file_name

    def load(self, namespace: dict) -> None:
        for file_name in self.section_files:
            path = self.section_path(file_name)
            exec(compile(path.read_text(encoding="utf-8"), str(path), "exec"), namespace)
