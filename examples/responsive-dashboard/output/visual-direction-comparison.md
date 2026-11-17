# Harbor Account Workspace — Visual Directions

Sources: [synthetic input](../input/current-page.md) and
[responsive contract](responsive-behavior.md).
State: task-fit **hypotheses**, with two implemented CSS directions and prior
Chromium captures. No brand research or user task study has been completed.
The [QA review](qa-review-2026-11-16.md) identifies the source files, matching
run and screenshot artifact. This document does not convert automated layout
checks into human design acceptance.

## Locked structure

Both options preserve the same eight required content groups, observation
ordering and evidence-to-question workflow. The proposed responsive behavior
and existing component inventory are shared.

## A — Quiet editorial operations

- Wider typography rhythm and explicit hierarchy for AI observations.
- Few surfaces; use spacing and alignment before borders or shadows.
- Account identity and meeting questions receive visual priority.
- Charts use subdued supporting treatment, with legible legends and exact
  value access.
- Risk: supporting KPIs / cases may fall below the fold at laptop height.
- Implementation: the specimen's shared DOM and CSS tokens provide this
  default direction. No framework component integration has been tested.

## B — Compact operational cockpit

- Tighter density, explicit panel grouping and a more uniform grid.
- Four KPIs plus chart overview emphasized above extensive reading.
- Observation list remains fully accessible but requires careful line length
  and disclosure choices to avoid truncation.
- Risk: perceived scannability may improve at the expense of deep AI
  observation reading; no evidence yet supports that trade-off.
- Implementation: `data-direction="cockpit"` changes accent/chart colors,
  radius and panel/observation spacing on the same DOM and data. The selector
  is a specimen variant, not proof of integration with an existing product's
  reusable component system.

## Provisional comparison

| Criterion | Observed evidence | Remaining decision or test |
|---|---|---|
| Meeting-preparation task fit | Both directions preserve the account, observation and evidence content | Compare task completion with account managers |
| Visual difference | Laptop and 390px captures exist for both directions; CSS changes color, radius and density | Human review of hierarchy and legibility |
| Content parity | The two modes use the same DOM; the runner checks four observations after switching | Broader content and interaction parity across both full matrices |
| Narrow width | Editorial captures cover 320/390px and a 360px container | Cockpit 320px/container checks; native zoom for both |
| Keyboard and chart access | Prior scripted chart navigation, dialog Enter/Escape and focus return checks passed | Screen-reader and manual keyboard review; both-mode coverage |
| Product component compatibility | Standalone HTML/CSS/JS implements the specimen | Inspect and integrate actual reusable product components |

## Decision

Provisional preference: **A**, because the stated primary task requires
reading AI observations and evidence before meeting actions. This preference
is a design hypothesis, not a proven user outcome.

Remaining evidence: product-owner review of content priority and scrolling;
both-direction matrix coverage; native browser zoom; screen-reader and manual
keyboard checks; actual reusable component integration. The prior run covers
an editorial 320px long-copy stress case, not all future text or locales.
