# Dark Learning Workspace Design

## Decision

Redesign the Synapse learning shell as an original dark, conversation-first workspace inspired by familiar AI-chat interaction patterns. It must not reuse ChatGPT branding, copy, icons, or proprietary assets.

## App shell

The desktop shell has a dark left rail and a dark main canvas. The rail keeps Synapse’s existing generated-note history functional while presenting it as a cleaner navigation surface.

- Brand at the top: Synapse logo and name.
- Primary actions: New chat/workspace, search, and Materials library.
- Recent area: existing generated notes and learning chats, using the current history data rather than fabricated navigation.
- Account: an anchored bottom rail control that reuses the existing account menu and authenticated actions.
- Existing mobile navigation remains the responsive entry point; no separate desktop-only behaviour is introduced.

## Main workspace

Companion becomes the primary chat surface: a minimal top bar with the active workspace control, centered readable conversation, and an anchored message composer. Materials uses the same canvas and rail but retains source upload/generation behaviour. The compact workspace switch remains available in both modes.

The implementation removes the pale blue page wash and large glass cards in the initial workspace. It uses Synapse’s own dark charcoal palette, restrained borders, readable contrast, and modest radius/shadow values.

## Scope boundaries

In scope: App-shell layout, History navigation appearance/controls, Companion dark chat appearance, Materials dark surface appearance, and account placement.

Out of scope: copying ChatGPT assets or text, changing authentication behaviour, rewriting note-generation flows, changing the existing summary navigation, schema/API changes, or adding new product sections with placeholder data.

## Verification

Automated checks will confirm the rail controls and account entry remain rendered, the workspace switch and mode targets survive, companion composer behaviour is preserved, and the existing frontend test suite/build pass. A browser visual check will confirm desktop and narrow layouts remain usable and no existing dirty changes outside this scope are overwritten.
