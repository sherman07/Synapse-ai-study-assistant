import { AppShellMarkup } from "./components/AppShell.js?v=account-landing-v2";

export function App() {
  return window.React.createElement("div", {
    dangerouslySetInnerHTML: { __html: AppShellMarkup() },
  });
}
