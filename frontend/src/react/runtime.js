const ReactRuntime = globalThis.React;

if (!ReactRuntime) {
  throw new Error("React runtime was not loaded before Synapse components.");
}

export const React = ReactRuntime;
export const h = ReactRuntime.createElement;
export const Fragment = ReactRuntime.Fragment;

export function classes(...values) {
  return values.filter(Boolean).join(" ");
}

export function icon(name, extraClass = "") {
  return h("i", {
    className: classes("bi", name, extraClass),
    "aria-hidden": "true",
  });
}

function callLegacyAction(name, args) {
  const action = globalThis[name];
  if (typeof action !== "function") {
    console.warn(`Synapse action "${name}" is not available yet.`);
    return undefined;
  }
  return action(...args);
}

export function legacyAction(name, ...args) {
  return () => callLegacyAction(name, args);
}

export function legacyTargetAction(name, ...args) {
  return event => callLegacyAction(name, [...args, event.currentTarget]);
}
