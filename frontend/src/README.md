# Frontend Architecture

The frontend boots through a React shell while preserving the existing Synapse
controller behavior.

## Boundaries

- `main.js` mounts the React shell and then loads the legacy controller.
- `react/App.js` is the React entry component.
- `react/runtime.js` exposes the browser React runtime plus small compatibility
  helpers for invoking legacy global actions from React event handlers.
- `react/constants.js` centralizes shared option lists used by the workspace UI.
- `react/components/` contains presentational UI sections with stable DOM ids
  and React-managed events.
- `legacy/controller.js` contains the existing feature controller for uploads,
  notes, source viewing, study tools, tutor chat, voice tutor, and history.
- `legacy/loadLegacyController.js` loads the controller only after React has
  rendered the DOM that the controller binds to.

## Refactor Direction

New UI should be added as focused React components first. Keep legacy action
bridges in `runtime.js` until the matching controller behavior is migrated into
React-owned modules. Existing DOM ids used by persisted notes, history, and
study-tool actions should stay stable until their callers are migrated too.
