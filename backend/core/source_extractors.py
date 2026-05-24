from io import BytesIO
from typing import List, Optional

from pypdf import PdfReader

try:
    from core.config import MAX_VISUAL_IMAGES_PER_SOURCE
except ModuleNotFoundError:
    from backend.core.config import MAX_VISUAL_IMAGES_PER_SOURCE

try:
    from docx import Document
except Exception:
    Document = None


class PdfTextExtractor:
    """Extracts text from PDFs and keeps page markers for later citations."""

    def extract(self, data: bytes) -> str:
        reader = PdfReader(BytesIO(data), strict=False)
        pages = []
        for page_index, page in enumerate(reader.pages, start=1):
            page_text = page.extract_text() or ""
            page_text = page_text.strip()
            if page_text:
                pages.append(f"[PDF PAGE {page_index}]\n{page_text}")
        extracted = "\n\n".join(pages).strip()
        if len(extracted) < 300:
            extracted += (
                "\n\n[System note: Very little text was extractable. "
                "This PDF may be scanned, image-based, or partially corrupted.]"
            )
        return extracted


class DocxTextExtractor:
    """Extracts readable paragraphs from Word documents."""

    def extract(self, data: bytes) -> str:
        if Document is None:
            return "DOCX support is not installed. Run: pip install python-docx"
        document = Document(BytesIO(data))
        paragraphs = [p.text.strip() for p in document.paragraphs if p.text and p.text.strip()]
        return "\n".join(paragraphs).strip()


class PlainTextExtractor:
    """Decodes UTF-8-ish text files without failing on imperfect bytes."""

    def extract(self, data: bytes) -> str:
        return data.decode("utf-8", errors="ignore").strip()


class SourceVisualPartSelector:
    """Keeps source-card visual parts paired with their preceding text labels."""

    def __init__(self, default_max_images: int = MAX_VISUAL_IMAGES_PER_SOURCE):
        self.default_max_images = default_max_images

    def select(self, unit: dict, max_images: Optional[int] = None) -> List[dict]:
        raw_parts = unit.get("visual_parts") or []
        if not raw_parts:
            return []
        limit = int(max_images or self.default_max_images)
        selected: List[dict] = []
        image_count = 0
        pending_label = None
        for part in raw_parts:
            if not isinstance(part, dict):
                continue
            if part.get("type") == "text":
                pending_label = part
                continue
            if part.get("type") == "image_url":
                if image_count >= limit:
                    break
                if pending_label:
                    selected.append(pending_label)
                    pending_label = None
                selected.append(part)
                image_count += 1
        return selected


class SourceExtractor:
    """Coordinates source-specific text extractors behind one entry point."""

    def __init__(
        self,
        pdf_extractor: PdfTextExtractor,
        docx_extractor: DocxTextExtractor,
        text_extractor: PlainTextExtractor,
    ):
        self.pdf_extractor = pdf_extractor
        self.docx_extractor = docx_extractor
        self.text_extractor = text_extractor

    def extract_pdf(self, data: bytes) -> str:
        return self.pdf_extractor.extract(data)

    def extract_docx(self, data: bytes) -> str:
        return self.docx_extractor.extract(data)

    def extract_text_file(self, data: bytes) -> str:
        return self.text_extractor.extract(data)


source_extractor = SourceExtractor(PdfTextExtractor(), DocxTextExtractor(), PlainTextExtractor())
visual_part_selector = SourceVisualPartSelector()


def extract_pdf(data: bytes) -> str:
    return source_extractor.extract_pdf(data)


def source_unit_visual_parts(unit: dict, max_images: Optional[int] = None) -> List[dict]:
    return visual_part_selector.select(unit, max_images)


def extract_docx(data: bytes) -> str:
    return source_extractor.extract_docx(data)


def extract_text_file(data: bytes) -> str:
    return source_extractor.extract_text_file(data)
