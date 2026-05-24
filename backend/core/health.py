class HealthReporter:
    """Builds health endpoint payloads without tying route handlers to config details."""

    def __init__(self, namespace: dict):
        self.namespace = namespace

    def _get(self, name: str, default=None):
        return self.namespace.get(name, default)

    def _call(self, name: str, default=None):
        callback = self.namespace.get(name)
        if not callable(callback):
            return default
        try:
            return callback()
        except Exception:
            return default

    def backend_status(self) -> dict:
        max_visual_images = self._get("MAX_VISUAL_IMAGES_PER_SOURCE")
        return {
            "status": "ok",
            "api_key_loaded": bool(self._get("OPENAI_API_KEY")),
            "org_id_loaded": bool(self._get("OPENAI_ORG_ID")),
            "project_id_loaded": bool(self._get("OPENAI_PROJECT_ID")),
            "analysis_model": self._get("ANALYSIS_MODEL"),
            "chat_model": self._get("CHAT_MODEL"),
            "transcribe_model": self._get("TRANSCRIBE_MODEL"),
            "cache_version": self._get("CACHE_VERSION"),
            "tutor_web_research_enabled": self._get("ENABLE_TUTOR_WEB_RESEARCH"),
            "multi_source_digests_enabled": self._get("ENABLE_MULTI_SOURCE_DIGESTS"),
            "max_visual_images_per_source": max_visual_images,
            "max_pdf_visual_candidates_per_source": self._get(
                "PDF_VISUAL_CANDIDATE_LIMIT",
                max_visual_images,
            ),
            "max_multi_source_visual_images": self._get("MAX_MULTI_SOURCE_VISUAL_IMAGES"),
            "multi_source_visual_gallery_limit": self._get("MULTISOURCE_VISUAL_GALLERY_LIMIT"),
            "multi_source_synthesis_part_tokens": self._get("MULTISOURCE_SYNTHESIS_PART_TOKENS"),
            "multi_source_connection_tokens": self._get("MULTISOURCE_CONNECTION_TOKENS"),
            "visual_argument_card_limit": self._get("VISUAL_ARGUMENT_CARD_LIMIT"),
            "visual_render_dpi": self._get("VISUAL_RENDER_DPI"),
            "pptx_slide_render_enabled": self._get("ENABLE_PPTX_SLIDE_RENDER"),
            "pptx_svg_fallback_render_enabled": self._get("ENABLE_PPTX_SVG_FALLBACK_RENDER"),
            "source_pptx_preview_render_enabled": self._get("ENABLE_SOURCE_PPTX_PREVIEW_RENDER"),
            "source_pptx_server_renderer": bool(self._call("find_libreoffice_binary")),
            "source_pptx_local_app_fallback_enabled": self._get("ENABLE_LOCAL_PPTX_APP_RENDER"),
        }

    def openai_status(self) -> dict:
        try:
            self._get("require_openai")()
            response = self._get("client").chat.completions.create(
                model=self._get("CHAT_MODEL"),
                messages=[{"role": "user", "content": "Reply with OK only."}],
                temperature=0,
                max_tokens=5,
            )
            return {
                "status": "ok",
                "model": self._get("CHAT_MODEL"),
                "reply": (response.choices[0].message.content or "").strip(),
                "org_id_loaded": bool(self._get("OPENAI_ORG_ID")),
                "project_id_loaded": bool(self._get("OPENAI_PROJECT_ID")),
            }
        except Exception as error:
            return {
                "status": "error",
                "message": str(error),
                "hint": (
                    "Check OPENAI_API_KEY, OPENAI_ORG_ID, OPENAI_PROJECT_ID, billing, "
                    "project access, and model access."
                ),
            }
