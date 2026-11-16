# Expected Behavior — Accessibility Pilot 001

This optional v0.2 case is not scored by the official v0.1 benchmark.

## Must identify and fix

- Tooltip data cannot be hover-only. Give keyboard/focus access and a
  persistent or tabular data alternative when appropriate.
- Pie categories require labels or another non-color-only means of
  identification; preserve meaning across themes and color vision.
- Filter dialog requires explicit focus placement, contained keyboard
  interaction as appropriate, Escape/close behavior, and focus restoration.
- A real form label must be associated with TextField; placeholder alone is
  insufficient.
- Loading motion needs a reduced-motion alternative that retains status
  communication.
- Evidence-source link needs a meaningful accessible name in context.

## Must scope responsibility

Prefer correcting TrendChart/PieChart/FilterDialog/TextField/Link and token
behavior rather than adding an account-page-only workaround.

## Must verify honestly

- Lists keyboard-only and screen-reader/manual checks relevant to each issue.
- Calls out unknown browser/platform behavior and contrast measurements.
- Does not claim an accessibility standard has been passed without tests.
- Separates observed reports from suspected implementation root causes.
- Maintains brand/visual quality without sacrificing semantic interaction.

## Failure signals

- Fixes only colors and spacing.
- Says a library guarantees accessible dialogs without test evidence.
- Adds a mouse click handler but no keyboard path.
- Replaces all charts with inaccessible static images.
- Uses generic "run an audit" wording without per-issue acceptance criteria.
