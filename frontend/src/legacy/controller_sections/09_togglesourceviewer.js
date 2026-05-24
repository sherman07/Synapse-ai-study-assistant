function toggleSourceViewer(force = null) {
  const desired = typeof force === "boolean" ? force : !sourceViewerOpen;
  sourceViewerOpen = desired;
  renderSourceViewer();
}

function selectSourceItem(id) {
  activeSourceItemId = id;
  renderSourceViewer();
}

function changeSourceZoom(delta) {
  sourceViewerZoom = Math.max(60, Math.min(180, sourceViewerZoom + Number(delta || 0)));
  renderSourceViewer();
}

function sourceMetaLine(item) {
  const bits = [];
  if (item.kind === "youtube") bits.push("YOUTUBE VIDEO");
  else if (item.kind === "presentation") bits.push("PRESENTATION");
  else if (item.kind) bits.push(item.kind.toUpperCase());
  if (item.size) bits.push(formatBytes(item.size));
  if (item.sourceIdentity && item.sourceIdentity.startsWith("youtube:")) bits.push("Transcript source");
  return bits.filter(Boolean).join(" · ");
}

async function readSourceText(item) {
  if (item?.content) return item.content;
  if (!item?.blob) return "";
  try {
    return await item.blob.text();
  } catch {
    return "";
  }
}

function canUseBackendSourcePreview(item) {
  return Boolean(item?.blob && ["pdf", "presentation", "document"].includes(item.kind));
}

function sourceSlidePageUrl(slide) {
  return slide?.screenshot || slide?.image_data_url || "";
}

function sourcePresentationFileUrl(item) {
  return item?.blob ? makeSourceObjectUrl(item) : (item?.url || item?.originalUrl || "");
}

function sourcePresentationRenderLabel(preview) {
  const mode = preview?.render_mode || "";
  if (mode === "libreoffice") return "Original slide-page render";
  if (mode === "local-powerpoint") return "PowerPoint slide-page render";
  if (mode === "local-keynote") return "Keynote slide-page render";
  if (mode === "server-svg" || mode === "svg") return "Browser slide-page preview";
  return "Slide-page preview";
}

async function fetchSourcePreview(item) {
  if (!item) throw new Error("No source selected.");
  if (item.preview) {
    const presentationPreviewHasSlidePages =
      item.preview.kind === "presentation" &&
      (item.preview.slides || []).some((slide) => sourceSlidePageUrl(slide));
    if (item.kind !== "presentation" || presentationPreviewHasSlidePages) {
      return item.preview;
    }
    if (!item.blob) {
      throw new Error("The saved presentation preview does not contain full slide pages, and the original file is not available in this browser session. Reopen or re-upload the source to rebuild the slide reader.");
    }
  }
  if (!item.blob) {
    throw new Error("The original uploaded file is not available in this browser session. Regenerate from the source file to restore the full preview.");
  }

  const formData = new FormData();
  formData.append("file", item.blob, item.name || item.displayName || "source");
  const response = await fetch(`${API_BASE}/source-preview`, {
    method: "POST",
    body: formData
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    throw new Error(data.error || "Source preview could not be generated.");
  }
  item.preview = data;
  item.previewError = "";
  return data;
}

function renderSourcePreviewLoading(item) {
  sourceViewerBody.innerHTML = `
    <div class="source-loading">
      <i class="bi ${sourceIcon(item.kind)}"></i>
      <h3>Preparing source preview...</h3>
      <p>Synapse is converting this file into a readable browser view.</p>
    </div>
  `;
}

function renderSourcePreviewError(item, error) {
  const fallbackText = item?.content || "";
  const allowTextFallback = item?.kind !== "presentation" && Boolean(fallbackText);
  const url = item?.blob ? makeSourceObjectUrl(item) : "";
  sourceViewerBody.innerHTML = `
    <div class="source-file-preview">
      <i class="bi ${sourceIcon(item?.kind)}"></i>
      <h3>${escapeHTML(item?.name || "Uploaded source")}</h3>
      <p>${escapeHTML(error?.message || item?.previewError || "This source could not be previewed.")}</p>
      ${allowTextFallback ? `<button class="source-inline-action" type="button" onclick="renderSourceTextFallback('${escapeAttr(item.id)}')">Show extracted text</button>` : ""}
      ${url ? `<a href="${escapeAttr(url)}" download="${escapeAttr(item?.name || "source")}">Download original source</a>` : ""}
    </div>
  `;
}

function renderSourceTextFallback(id) {
  const item = sourceViewerItems.find(entry => entry.id === id);
  if (!item) return;
  activeSourceItemId = item.id;
  sourceViewerBody.innerHTML = `
    <pre class="source-text-preview" style="font-size:${Math.max(0.78, sourceViewerZoom / 100)}rem">${escapeHTML(item.content || "No extracted source text is available.")}</pre>
  `;
}

function renderStructuredSourcePreview(preview, item) {
  if (!preview || preview.error) {
    renderSourcePreviewError(item, new Error(preview?.error || "Source preview could not be generated."));
    return;
  }

  if (preview.kind === "pdf") {
    const pages = Array.isArray(preview.pages) ? preview.pages : [];
    const scale = Math.max(70, Math.min(160, sourceViewerZoom));
    const url = item?.blob ? makeSourceObjectUrl(item) : (item?.url || item?.originalUrl || "");
    sourceViewerBody.innerHTML = `
      <div class="source-structured-preview source-pdf-clean-preview">
        ${renderSourceOpenActions(url, "Open full PDF", item.name || "source.pdf")}
        ${preview.warning ? `<div class="source-preview-notice"><i class="bi bi-info-circle"></i>${escapeHTML(preview.warning)}</div>` : ""}
        ${pages.length ? `
          <div class="source-pdf-pages" style="--source-pdf-page-width:${scale}%">
            ${pages.map(page => `
              <article class="source-pdf-page" aria-label="PDF page ${Number(page.number || 0) || ""}">
                <img src="${escapeAttr(page.image)}" alt="PDF page ${Number(page.number || 0) || ""}">
                <span class="source-pdf-page-number">Page ${Number(page.number || 0) || ""}${preview.page_count ? ` / ${Number(preview.page_count)}` : ""}</span>
              </article>
            `).join("")}
          </div>
        ` : `
          <div class="source-viewer-empty">
            <i class="bi bi-file-earmark-pdf"></i>
            <h3>No PDF pages could be rendered</h3>
            <p>Use the open or download action to view the original file.</p>
          </div>
        `}
      </div>
    `;
    return;
  }

  if (preview.kind === "presentation") {
    const slides = Array.isArray(preview.slides) ? preview.slides : [];
    const scale = Math.max(70, Math.min(160, sourceViewerZoom));
    const slidePages = slides.filter(slide => sourceSlidePageUrl(slide));
    const totalSlides = Number(preview.slide_count || slides.length || slidePages.length || 0);
    const shownSlides = Number(preview.shown_count || slidePages.length || slides.length || 0);
    const sourceUrl = sourcePresentationFileUrl(item);
    const downloadName = item?.name || `${preview.title || "presentation"}.pptx`;
    const renderLabel = sourcePresentationRenderLabel(preview);
    if (!slidePages.length) {
      sourceViewerBody.innerHTML = `
        <div class="source-structured-preview source-presentation-preview source-presentation-unavailable">
          <div class="source-viewer-empty">
            <i class="bi bi-file-earmark-slides"></i>
            <h3>Full slide preview is unavailable</h3>
            <p>Synapse could not render this presentation as complete slide pages. For a production deployment, install LibreOffice on the backend or ask users to upload/export the deck as PDF.</p>
            ${sourceUrl ? `<a class="source-inline-action" href="${escapeAttr(sourceUrl)}" download="${escapeAttr(downloadName)}">Download original presentation</a>` : ""}
            ${preview.warning ? `<p class="source-slide-muted">${escapeHTML(preview.warning)}</p>` : ""}
          </div>
        </div>
      `;
      return;
    }

    sourceViewerBody.innerHTML = `
      <div class="source-structured-preview source-presentation-preview has-slide-pages">
        <div class="source-slide-reader">
          <div class="source-slide-reader-bar">
            <div>
              <span class="source-slide-reader-kicker">Slide reader</span>
              <strong>${shownSlides}${totalSlides ? ` / ${totalSlides}` : ""} slides</strong>
              <small>${escapeHTML(renderLabel)}</small>
            </div>
            ${sourceUrl ? `<a class="source-open-action secondary" href="${escapeAttr(sourceUrl)}" download="${escapeAttr(downloadName)}"><i class="bi bi-download"></i>Download original</a>` : ""}
          </div>
          ${preview.warning ? `<div class="source-preview-notice source-preview-notice-compact"><i class="bi bi-info-circle"></i>${escapeHTML(preview.warning)}</div>` : ""}
          <div class="source-slide-pages" style="--source-slide-page-width:${scale}%">
            ${slidePages.map(slide => {
              const number = Number(slide.number || 0) || "";
              const label = number ? `Slide ${number}${totalSlides ? ` / ${totalSlides}` : ""}` : "Slide";
              return `
                <figure class="source-slide-page" aria-label="${escapeAttr(label)}">
                  <img loading="lazy" decoding="async" src="${escapeAttr(sourceSlidePageUrl(slide))}" alt="${escapeAttr(label)}">
                  <figcaption class="source-slide-page-number">${escapeHTML(label)}</figcaption>
                </figure>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;
    return;
  }

  const text = preview.text || item.content || "";
  sourceViewerBody.innerHTML = `
    <div class="source-structured-preview">
      <article class="source-slide-card">
        <div class="source-slide-header">
          <span>${escapeHTML(preview.kind || item.kind || "source")}</span>
          <strong>${escapeHTML(preview.title || item.title || item.name || "Uploaded source")}</strong>
        </div>
        <div class="source-slide-text">${markdownToHTML(text || "No readable text preview is available.")}</div>
      </article>
    </div>
  `;
  renderMath();
}

function renderSourceOpenActions(url, label = "Open full source", downloadName = "") {
  if (!url) return "";
  const downloadAttr = downloadName ? ` download="${escapeAttr(downloadName)}"` : "";
  return `
    <div class="source-open-actions">
      <a class="source-open-action" href="${escapeAttr(url)}" target="_blank" rel="noopener">
        <i class="bi bi-box-arrow-up-right"></i>${escapeHTML(label)}
      </a>
      ${downloadName ? `
        <a class="source-open-action secondary" href="${escapeAttr(url)}"${downloadAttr}>
          <i class="bi bi-download"></i>Download
        </a>
      ` : ""}
    </div>
  `;
}

function renderYoutubeSourcePreview(item) {
  const watchUrl = youtubeWatchUrlFromItem(item);
  const embedUrl = youtubeEmbedUrlFromItem(item);
  const title = item.title || item.displayName || item.name || "YouTube source";
  const transcriptState = getYoutubeTranscriptState(item.content || "");
  const videoId = getYouTubeVideoIdClient(watchUrl || item?.sourceIdentity || item?.originalUrl || item?.url);
  sourceViewerBody.innerHTML = `
    <div class="source-youtube-stage">
      ${embedUrl ? `
        <div class="source-youtube-embed">
          <iframe
            title="${escapeAttr(title)}"
            src="${escapeAttr(embedUrl)}"
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen></iframe>
        </div>
      ` : `
        <div class="source-link-preview source-link-preview-inline">
          <i class="bi bi-youtube"></i>
          <h3>YouTube source</h3>
          <p>${escapeHTML(watchUrl || "No playable YouTube URL was saved with this source.")}</p>
        </div>
      `}
      <div class="source-youtube-info">
        <div>
          <span class="source-youtube-kicker">Linked video source</span>
          <h3>${escapeHTML(title)}</h3>
          <p>${escapeHTML(watchUrl || "This video was expanded from a link inside the uploaded material.")}</p>
          ${videoId ? `<p class="source-youtube-id">Video ID: ${escapeHTML(videoId)}</p>` : ""}
        </div>
        ${watchUrl ? `<a class="source-open-action" href="${escapeAttr(watchUrl)}" target="_blank" rel="noopener"><i class="bi bi-youtube"></i>Open on YouTube</a>` : ""}
      </div>
      ${watchUrl ? `
        <div class="source-preview-notice">
          <i class="bi bi-info-circle"></i>
          <span>If YouTube blocks embedded playback for this video, use <strong>Open on YouTube</strong>. When YouTube exposes captions, Synapse stores them below for analysis.</span>
        </div>
      ` : ""}
      ${transcriptState.hasReadableTranscript ? `
        <details class="source-transcript-panel" open>
          <summary>Transcript / extracted source text</summary>
          <pre>${escapeHTML(transcriptState.transcript)}</pre>
        </details>
      ` : `
        <div class="source-preview-notice source-preview-transcript-empty">
          <i class="bi bi-info-circle"></i>
          <span>
            <strong>Transcript is not available from this YouTube source.</strong>
            YouTube did not expose a readable caption/transcript to Synapse for this video. Use Open on YouTube to review captions, or upload a transcript/caption file to include it in analysis.
          </span>
        </div>
      `}
    </div>
  `;
}

function renderSourceViewerBody(item) {
  if (!sourceViewerBody || !item) return;
  const meta = sourceMetaLine(item);
  if (sourceViewerTitle) sourceViewerTitle.textContent = item.title || item.name || "Uploaded source";
  if (sourceViewerMeta) sourceViewerMeta.textContent = meta || "Source preview";
  if (sourceZoomLabel) sourceZoomLabel.textContent = `${sourceViewerZoom}%`;

  if (item.kind === "image" && item.blob) {
    const url = makeSourceObjectUrl(item);
    sourceViewerBody.innerHTML = `
      <div class="source-image-stage">
        ${renderSourceOpenActions(url, "Open full image", item.name || "source")}
        <img src="${escapeAttr(url)}" alt="${escapeAttr(item.name)}" style="width:${sourceViewerZoom}%">
      </div>
    `;
    return;
  }

  if (canUseBackendSourcePreview(item)) {
    renderSourcePreviewLoading(item);
    const expectedItemId = item.id;
    fetchSourcePreview(item)
      .then(preview => {
        if (activeSourceItemId !== expectedItemId) return;
        renderStructuredSourcePreview(preview, item);
      })
      .catch(error => {
        item.previewError = error?.message || "Source preview failed.";
        if (activeSourceItemId !== expectedItemId) return;
        renderSourcePreviewError(item, error);
      });
    return;
  }

  if ((item.kind === "presentation" || item.kind === "document") && item.content && !item.blob) {
    sourceViewerBody.innerHTML = `
      <div class="source-structured-preview">
        <div class="source-preview-notice"><i class="bi bi-info-circle"></i>The original file was not restored, so Synapse is showing the extracted source text saved with this note.</div>
        <article class="source-slide-card">
          <div class="source-slide-header">
            <span>${escapeHTML(item.kind)}</span>
            <strong>${escapeHTML(item.title || item.name || "Uploaded source")}</strong>
          </div>
          <div class="source-slide-text">${markdownToHTML(item.content)}</div>
        </article>
      </div>
    `;
    renderMath();
    return;
  }

  if (item.kind === "text" || item.kind === "note") {
    sourceViewerBody.innerHTML = `<div class="source-text-stage"><div class="source-loading">Loading source text...</div></div>`;
    const expectedItemId = item.id;
    readSourceText(item).then(text => {
      if (activeSourceItemId !== expectedItemId) return;
      sourceViewerBody.innerHTML = `
        <pre class="source-text-preview" style="font-size:${Math.max(0.78, sourceViewerZoom / 100)}rem">${escapeHTML(text || "No readable text preview is available.")}</pre>
      `;
    });
    return;
  }

  if (item.kind === "youtube" || item.kind === "link") {
    if (item.kind === "youtube") {
      renderYoutubeSourcePreview(item);
      return;
    }
    const url = item.originalUrl || item.url || "";
    sourceViewerBody.innerHTML = `
      <div class="source-link-preview">
        <i class="bi ${sourceIcon(item.kind)}"></i>
        <h3>${escapeHTML(item.kind === "youtube" ? "YouTube source" : "Web source")}</h3>
        <p>${escapeHTML(url)}</p>
        ${url ? `<a href="${escapeAttr(url)}" target="_blank" rel="noopener">Open source link</a>` : ""}
      </div>
    `;
    return;
  }

  const url = item.blob ? makeSourceObjectUrl(item) : "";
  sourceViewerBody.innerHTML = `
    <div class="source-file-preview">
      <i class="bi ${sourceIcon(item.kind)}"></i>
      <h3>${escapeHTML(item.name || "Uploaded source")}</h3>
      <p>${escapeHTML(meta || "Synapse analysed this file. Browser preview is not available for this file type.")}</p>
      ${url ? `<a href="${escapeAttr(url)}" download="${escapeAttr(item.name || "source")}">Download original source</a>` : ""}
    </div>
  `;
}

function makeHistoryTitle(source, fallback = "Generated Study Notes") {
  const raw = typeof source === "object" && source !== null
    ? (source.title || source.summary || source.fullSummary || "")
    : String(source || "");

  const text = normaliseTitleText(raw);
  if (!text) return fallback;

  const explicitTopicPatterns = [
    /\b(FINEARTS\s*\d{3,4}[A-Z]?\s*[-–—:]?\s*[^.\n,;:]{0,55})/i,
    /\b(WTRENG\s*\d{3,4}[A-Z]?\s*[-–—:]?\s*[^.\n,;:]{0,55})/i,
    /\b([A-Z]{2,}\s*\d{3,4}[A-Z]?\s*[-–—:]?\s*[^.\n,;:]{0,55})/,
    /\b([A-Z][A-Za-z\s]+ Act\s+\d{4})\b/,
    /\b(Zero Carbon Act|Privacy Act|Resource Management Act|GDPR|Legislation Act\s+\d{4})\b/i,
    /\b(Pythagorean Theorem|Curvature of Vector Function|Cross Product|Infant Incubator|AI-powered|AI powered)[^.\n,;:]*/i
  ];

  for (const pattern of explicitTopicPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) return cleanTitle(match[1], fallback);
  }

  const topicPatterns = [
    /(?:source material|material|document|lesson|video|workshop|case study)\s+(?:is|was|appears to be|focuses on|examines|explores|discusses|covers|teaches|is related to)\s+(?:a|an|the)?\s*([^.;\n]{10,110})/i,
    /(?:focuses on|examines|explores|discusses|covers|teaches|demonstrates|shows)\s+(?:how to\s+)?(?:a|an|the)?\s*([^.;\n]{10,110})/i,
    /(?:about|on)\s+(?:a|an|the)?\s*([^.;\n]{10,90})/i
  ];

  for (const pattern of topicPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) return cleanTitle(match[1], fallback);
  }

  const firstUseful = text
    .split(/[.!?。！？]/)
    .map(part => part.trim())
    .find(part => part.length > 10 && !/^(synapse summary|summary|core argument|key ideas)$/i.test(part));

  return cleanTitle(firstUseful || text, fallback);
}

function normaliseTitleText(value) {
  return String(value || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[#*_`]/g, "")
    .replace(/\\\[|\\\]|\\\(|\\\)/g, " ")
    .replace(/^\s*Synapse Summary[:\s-]*/i, "")
    .replace(/^\s*Summary[:\s-]*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanTitle(title, fallback = "Generated Study Notes") {
  let cleaned = normaliseTitleText(title)
    .replace(/^(that|the|this|source material|material|document|lesson|video|workshop|case study)\s+/i, "")
    .replace(/^(how to|understanding how to|understanding|to demonstrate how to|demonstrate how to)\s+/i, "")
    .replace(/\s+(which|that|because|where|while|through|by|including|with)\s+.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return fallback;

  const words = cleaned.split(" ");
  let sliced = words.slice(0, 7).join(" ");

  if (/^(to|how|appears|related|based|source|material|document)\b/i.test(sliced) && words.length > 7) {
    sliced = words.slice(1, 8).join(" ");
  }

  sliced = sliced.replace(/[,:;\-–—]+$/g, "").trim();

  if (sliced.split(" ").length <= 2 && words.length > 2 && !/[A-Z]{2,}|\d{4}/.test(sliced)) {
    sliced = words.slice(0, 5).join(" ");
  }

  return shorten(sliced || fallback, 58);
}

function saveHistoryEntry(payload) {
  const items = getHistory();
  const sourceFingerprint = payload.sourceFingerprint || payload.clientFingerprint || currentSourceFingerprint || "";
  const existingIndex = sourceFingerprint
    ? items.findIndex(item => item.sourceFingerprint === sourceFingerprint || item.clientFingerprint === sourceFingerprint)
    : -1;

  const entry = {
    ...payload,
    id: existingIndex >= 0 ? items[existingIndex].id : Date.now().toString(),
    title: makeHistoryTitle(payload.title || payload.summary),
    createdAt: existingIndex >= 0 ? items[existingIndex].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sourceFingerprint,
    clientFingerprint: payload.clientFingerprint || sourceFingerprint,
  };

  const nextItems = existingIndex >= 0
    ? [entry, ...items.filter((_, index) => index !== existingIndex)]
    : [entry, ...items];

  setHistory(nextItems);
  renderHistory();
  return entry;
}

function findHistoryByFingerprint(fingerprint) {
  if (!fingerprint) return null;
  return getHistory().find(item =>
    item.sourceFingerprint === fingerprint ||
    item.clientFingerprint === fingerprint
  ) || null;
}

function renderHistory(filter = "") {
  const query = String(filter || "").toLowerCase().trim();
  const items = getHistory().filter(item => {
    const haystack = `${item.title || ""} ${item.summary || ""}`.toLowerCase();
    return !query || haystack.includes(query);
  });

  const html = renderHistoryItemsHTML(items);
  if (historyList) historyList.innerHTML = html;
  if (mobileHistoryList) mobileHistoryList.innerHTML = html;
}

function renderHistoryItemsHTML(items) {
  if (!items.length) {
    return `<p class="history-empty">No matching generated notes yet.</p>`;
  }

  return items.map(item => `
    <div class="history-item-wrap">
      <button class="history-item" type="button" onclick="loadHistoryEntry('${escapeAttr(item.id)}')">
        <div class="history-item-title">${escapeHTML(makeHistoryTitle(item))}</div>
        <div class="history-item-meta">${formatHistoryDate(item.createdAt)}</div>
      </button>
      <button class="history-delete-btn" type="button"
              title="Delete this history item"
              aria-label="Delete ${escapeAttr(makeHistoryTitle(item))}"
              onclick="deleteHistoryEntry(event, '${escapeAttr(item.id)}')">
        <i class="bi bi-trash3"></i>
      </button>
    </div>
  `).join("");
}

function closeMobileNavIfOpen() {
  const mobileNav = document.getElementById("mobileNav");
  if (!mobileNav || typeof bootstrap === "undefined") return;
  const instance = bootstrap.Offcanvas.getInstance(mobileNav);
  if (instance) instance.hide();
}

async function deleteHistoryEntry(event, id) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const items = getHistory();
  const target = items.find(item => item.id === id);
  const title = target ? makeHistoryTitle(target) : "this history item";

  const confirmed = window.confirm(`Delete "${title}" from history?`);
  if (!confirmed) return;

  setHistory(items.filter(item => item.id !== id));
  await deleteVisualGalleryAssets(id, target?.sourceFingerprint || target?.clientFingerprint || "");
  await deleteSourceAssets(id, target?.sourceFingerprint || target?.clientFingerprint || "");
  deleteTutorChatHistory(id, target?.sourceFingerprint || target?.clientFingerprint || "");
  deleteTimelinePath(id, target?.sourceFingerprint || target?.clientFingerprint || "");
  deleteVisualGuide(id, target?.sourceFingerprint || target?.clientFingerprint || "");
  deleteQuizHistory(id, target?.sourceFingerprint || target?.clientFingerprint || "");
  deleteFlashcardDeck(id, target?.sourceFingerprint || target?.clientFingerprint || "");
  deleteVoiceTutorHistory(id, target?.sourceFingerprint || target?.clientFingerprint || "");
  renderHistory(historySearch ? historySearch.value : "");
}

async function loadHistoryEntry(id, options = {}) {
  const item = getHistory().find(entry => entry.id === id);
  if (!item) return;
  closeMobileNavIfOpen();

  fullSummary = removeAutoBilingualHeadings(item.summary || "", item.language || "auto");
  storedTitle = item.title || makeHistoryTitle(fullSummary) || "Study Notes";
  sections = cleanAutoLanguageSectionTitles(hydrateSectionsFromSummary(item.sections || {}, fullSummary), fullSummary, item.language || "auto");
  connectionsData = item.connections || [];
  currentSourceFingerprint = item.sourceFingerprint || item.clientFingerprint || "";
  currentHistoryId = item.id;
  currentPrimarySourceIdentity = item.primarySourceIdentity || item.primary_source_identity || "";
  const localVisuals = Array.isArray(item.visualGallery) ? item.visualGallery : [];
  const restoredVisuals = await loadVisualGalleryAssets(id, currentSourceFingerprint);
  visualGalleryData = sanitizeLearningFigures(restoredVisuals.length ? restoredVisuals : localVisuals);
  const restoredSources = await loadSourceAssets(id, currentSourceFingerprint);
  restoreSourceViewerItems(restoredSources.length ? restoredSources : (item.sourceItems || item.sources || []));

  safeSetLocalStorage(ACTIVE_HISTORY_KEY, id);
  showAnalysisView({ scrollToTop: !options.preserveScroll });

  sectionTitle.innerText = "Study Notes";
  contextLabel.textContent = "Current Notes";
  renderSections();
  renderConnections();
  currentMindMap = item.mindMap || item.mind_map || item.brainstorm || null;
  resetTimelineState();
  loadTimelineForCurrentNote();
  resetVisualGuideState();
  loadVisualGuideForCurrentNote();
  resetQuizState();
  loadQuizHistoryForCurrentNote();
  loadFlashcardsForCurrentNote();
  loadVoiceTutorHistoryForCurrentNote();
  activeMindBranchIndex = 0;
  activeMindPointIndex = 0;
  activeMindChildIndex = -1;
  mindDetailPopupOpen = false;
  collapsedMindBranches = new Set();
  switchTool("mindmap");
  renderMindMap(currentMindMap);
  renderVisualGallery();
  loadTutorChatHistoryForCurrentNote();
  typeInto(summaryContent, markdownToHTML(fullSummary), renderMath);
}

function formatHistoryDate(value) {
  if (!value) return "Saved notes";
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch {
    return "Saved notes";
  }
}

function cleanExistingHistoryTitles() {
  const items = getHistory();
  if (!items.length) return;

  let changed = false;
  const cleaned = items.map(item => {
    const cleanTitle = makeHistoryTitle(item);
    if (cleanTitle !== item.title) changed = true;
    return { ...item, title: cleanTitle };
  });

  if (changed) setHistory(cleaned);
}
