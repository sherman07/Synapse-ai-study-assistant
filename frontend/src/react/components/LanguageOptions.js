import { html } from "../html.js";

export function languageOptions({ includePlaceholder = false } = {}) {
  return html`
    ${includePlaceholder ? '<option value="">Translate</option>' : '<option value="auto">Auto-detect source language</option>'}
    <option value="english">English</option>
    <option value="simplified_chinese">简体中文</option>
    <option value="traditional_chinese">繁體中文</option>
    <option value="mixed_chinese_english">中文 + English keywords</option>
    <option value="japanese">日本語</option>
    <option value="korean">한국어</option>
    <option value="french">Français</option>
    <option value="spanish">Español</option>
    <option value="german">Deutsch</option>
    <option value="italian">Italiano</option>
    <option value="portuguese">Português</option>
    <option value="arabic">العربية</option>
    <option value="hindi">हिन्दी</option>
    <option value="vietnamese">Tiếng Việt</option>
    <option value="thai">ไทย</option>
    <option value="indonesian">Bahasa Indonesia</option>
    <option value="malay">Bahasa Melayu</option>
    <option value="russian">Русский</option>
  `;
}
