# Synapse-ai-study-assistant
An AI-powered personal academic brain that remembers everything you learn, connects ideas across time, and actively helps you think, not just summarize.

## Production Source Preview

Synapse should render uploaded sources on the server, not by relying on a local desktop app. For full PPTX slide previews in the Sources panel, install LibreOffice in the production image/server and keep local desktop fallbacks disabled.

Recommended production environment:

```env
ENABLE_SOURCE_PPTX_PREVIEW_RENDER=true
ENABLE_LOCAL_PPTX_APP_RENDER=false
LIBREOFFICE_PATH=/usr/bin/libreoffice
SOURCE_PREVIEW_RENDER_DPI=120
SOURCE_PREVIEW_PPTX_CONVERT_TIMEOUT=120
SOURCE_PREVIEW_MAX_SLIDES=80
SOURCE_PREVIEW_MAX_PDF_PAGES=160
```

If LibreOffice is unavailable, Synapse falls back to a best-effort browser slide-page preview and clearly labels it. It no longer presents extracted PPTX text/images as a fake slide reader. Production deployments should include LibreOffice plus the fonts used by uploaded course materials so the viewer can show original slide pages.
