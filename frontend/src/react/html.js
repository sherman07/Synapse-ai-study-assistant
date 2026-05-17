export function html(strings, ...values) {
  return strings.reduce((output, chunk, index) => output + chunk + (values[index] ?? ""), "");
}

export function joinHtml(parts) {
  return parts.filter(Boolean).join("\n");
}
