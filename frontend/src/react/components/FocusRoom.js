import { h } from "../runtime.js";
import { renderFocusRoomShell } from "../../focus-room/shell.js";

export function FocusRoom() {
  return h("div", {
    dangerouslySetInnerHTML: { __html: renderFocusRoomShell() },
  });
}
