# Frontend Architecture

The frontend now boots through a small React shell while preserving the
existing Synapse controller behavior.

## Boundaries

- `main.js` mounts the React shell and then loads the legacy controller.
- `react/App.js` is the React entry component.
- `react/components/` contains presentational UI sections with stable DOM ids.
- `legacy/controller.js` contains the existing feature controller for uploads,
  notes, source viewing, study tools, tutor chat, voice tutor, and history.
- `legacy/loadLegacyController.js` loads the controller only after React has
  rendered the DOM that the controller binds to.

## Refactor Direction

New UI should be added as focused React components first. Existing controller
logic can be migrated feature by feature into cohesive modules, but the DOM ids
used by persisted notes, history, and study-tool actions should stay stable
until their callers are migrated too.
