import { AppShellMarkup } from "./components/AppShell.js";

export function App() {
  return window.React.createElement("div", {
    dangerouslySetInnerHTML: { __html: AppShellMarkup() },
  });
}
