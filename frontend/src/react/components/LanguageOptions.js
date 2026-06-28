import { LANGUAGE_OPTIONS } from "../constants.js";
import { h } from "../runtime.js";

export function languageOptions({ includePlaceholder = false } = {}) {
  const placeholder = includePlaceholder
    ? ["", "Translate"]
    : ["auto", "Auto (English default)"];

  return [placeholder, ...LANGUAGE_OPTIONS].map(([value, label]) =>
    h("option", { key: value, value }, label)
  );
}

export function LanguageSelect({
  includePlaceholder = false,
  defaultValue,
  ariaLabel,
  ...props
} = {}) {
  return h(
    "select",
    {
      ...props,
      "aria-label": ariaLabel,
      defaultValue: defaultValue ?? (includePlaceholder ? "" : "auto"),
    },
    languageOptions({ includePlaceholder })
  );
}
