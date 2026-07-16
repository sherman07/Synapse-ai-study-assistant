# Responsive web design

## Goal

Make Synapse feel deliberate and fully usable on phones without creating a separate mobile product. Every core action remains available: start/upload a workspace, read notes, change study tools, open the tutor, manage account state, and use the focus room.

## Supported contexts

- **Phone:** 320–639px, touch-first, portrait and landscape.
- **Tablet:** 640–1023px, touch-first with more reading room.
- **Desktop:** 1024px and above, multi-panel workspace preserved.

The viewport includes `viewport-fit=cover`; fixed controls respect safe-area insets. Interactive controls use at least a 44px touch target on coarse pointers.

## Shared responsive system

One common responsive layer owns the breakpoint rules, safe-area spacing, horizontal-overflow prevention, fluid spacing and typography. Page CSS can define content-specific layout only; it must not introduce competing breakpoint behavior for shared shells, controls, or panels.

Mobile defaults to a single readable content column. Larger layouts are progressively enhanced with sidebars or secondary panels where enough room exists. Horizontal scrolling is never used as a substitute for a reflowed primary interface.

## Study workspace

On phones:

- The left history and generated-heading navigation move into the existing mobile drawer.
- Notes become the full-width primary surface with responsive heading sizes and safe horizontal padding.
- The tutor opens as a bottom sheet / full-height mobile panel, never as a third column.
- Study-tool controls wrap into a horizontally scrollable tab row only when each control remains directly usable; tool content itself remains single-column.
- Source viewer, account controls, settings, menus and tool dialogs escape overflow containers and remain reachable.

On tablets, the workspace keeps a two-region layout only when the content column stays readable. Desktop retains the three-region workspace.

## Public and account flows

Landing, sign-up, log-in, recovery, verification, pricing, billing result, terms, privacy, and 404 pages use a single-column form/content layout on phones. Forms fill the available width, supplementary visuals are reduced rather than obscuring actions, and CTA rows stack when their labels no longer fit.

## Focus room

The timer, material area, player controls, side controls, history, and settings reflow into a single clear hierarchy on phones. Audio controls remain touch-sized; any dense secondary content becomes a drawer or vertically stacked section rather than a clipped side pane.

## Quality and accessibility requirements

- No horizontal document overflow at 320px, 390px, 768px, or 1024px.
- No text clipping, overlapping fixed panels, or controls obscured by mobile browser chrome.
- Keyboard, screen-reader labels, and reduced-motion behavior remain intact.
- Hover-only affordances have visible touch equivalents.
- Existing URLs, generated-note history, broadcasts, and study activity data keep their current behavior.

## Verification

Automated regression coverage checks shared safe-area/mobile rules and route coverage. Rendered QA covers the public entry, workspace upload flow, mobile drawer, tutor open/close state, auth form, billing page, and focus-room controls at phone, tablet, and desktop widths. Production build and existing frontend regressions must remain green.
