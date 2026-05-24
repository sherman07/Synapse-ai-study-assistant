import { html } from "../html.js";
import { languageOptions } from "./LanguageOptions.js";

export function UploadStage() {
  return html`
    <section id="uploadStage" class="upload-stage">
      <div class="hero-copy text-center">
        <div class="brand-pill mx-auto mb-4">
          <i class="bi bi-stars"></i>
          AI Academic Tutor
        </div>
        <h1>Study Smarter</h1>
        <p>Your private tutor for readings, notes, images, and links.</p>
      </div>

      <section class="premium-upload-card">
        <div id="dropZone" class="drop-zone" tabindex="0" role="button" aria-label="Upload area — drop files or click to browse">
          <input id="assetUpload" class="visually-hidden" type="file" multiple accept=".pdf,.txt,.md,.docx,.pptx,.png,.jpg,.jpeg,.webp,.mp3,.m4a,.wav,.mp4,.webm,image/*,audio/*,video/*,application/pdf,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document">

          <div class="upload-icon-wrap"><i class="bi bi-cloud-arrow-up"></i></div>
          <h2>Upload your study material</h2>
          <p>Drop PDFs, images, notes, or documents here. Add links below if your source is online.</p>
          <button type="button" class="btn btn-primary btn-lg upload-browse-btn" onclick="openFilePicker()">
            <i class="bi bi-plus-lg me-2"></i>Select files
          </button>
        </div>

        <div id="filePreview" class="file-preview d-none"></div>

        <div class="source-box">
          <label for="linkInput" class="form-label">Add online sources</label>
          <div class="multi-link-adder">
            <div class="multi-link-input-wrap">
              <i class="bi bi-link-45deg"></i>
              <input id="linkInput" class="multi-link-input" type="text" placeholder="Paste one or many links, then press Enter or Add">
            </div>
            <button id="addLinkBtn" class="btn btn-outline-primary multi-link-add-btn" type="button" onclick="addLinksFromInput()">
              <i class="bi bi-plus-lg"></i>
              Add
            </button>
          </div>
          <div id="linkPreview" class="link-preview d-none" aria-live="polite"></div>
          <p class="source-helper source-helper-tight">Supports multiple YouTube, webpage, video, and article links. Paste links separated by spaces, commas, or new lines.</p>

          <label for="sourceInput" class="form-label mt-3">Optional pasted notes or mixed source text</label>
          <div class="source-input-wrap">
            <div class="source-hints">
              <span><i class="bi bi-youtube"></i> YouTube link</span>
              <span>/</span>
              <span><i class="bi bi-link-45deg"></i> Web URL</span>
              <span>/</span>
              <span><i class="bi bi-camera-video"></i> Video link</span>
              <span>/</span>
              <span><i class="bi bi-file-text"></i> Free text</span>
            </div>
            <textarea id="sourceInput" class="source-input" rows="5" placeholder="Paste extra notes here, or paste links directly if you do not want to add them one by one..."></textarea>
          </div>
          <p class="source-helper">YouTube links pasted here or found inside uploaded PDFs/PPTs are expanded into transcript sources for analysis.</p>
        </div>

        <div class="language-box">
          <label for="preferredLanguage" class="form-label">Preferred output language</label>
          <p class="language-note">Brand names such as Synapse stay unchanged in every language.</p>
          <select id="preferredLanguage" class="language-select" aria-label="Preferred output language">
            ${languageOptions()}
          </select>
        </div>
        <input type="hidden" id="detailLevel" value="auto" />

        <div class="language-box auto-depth-box" aria-live="polite">
          <div class="auto-depth-icon"><i class="bi bi-lightning-charge-fill"></i></div>
          <div>
            <label class="form-label mb-1">Adaptive learning depth</label>
            <p class="language-note mb-0">Synapse automatically chooses the clearest level of detail. Simple sources stay focused; dense legal, mathematical, academic, or multi-section sources stay detailed.</p>
          </div>
        </div>

        <button id="generateBtn" type="button" class="btn btn-primary btn-lg w-100 generate-btn" onclick="analyzeMaterials()">
          <i class="bi bi-stars me-2"></i>Analyze with Synapse
        </button>
      </section>
    </section>
  `;
}
