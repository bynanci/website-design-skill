# Harbor Account Workspace — Visual Directions

Sources: [synthetic input](../input/current-page.md) and
[responsive contract](responsive-behavior.md).
State: **hypotheses only**. No brand research, screenshots or user tests.

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
- Implementation: likely existing panel layout and typography token changes,
  not a new page-specific component.

## B — Compact operational cockpit

- Tighter density, explicit panel grouping and a more uniform grid.
- Four KPIs plus chart overview emphasized above extensive reading.
- Observation list remains fully accessible but requires careful line length
  and disclosure choices to avoid truncation.
- Risk: perceived scannability may improve at the expense of deep AI
  observation reading; no evidence yet supports that trade-off.
- Implementation: reuse existing components; avoid special variants unless
  they are shared across related product pages.

## Provisional comparison

0 = constraint failure, 1 = plausible but unverified, 2 = backed by evidence.
Only **1** is assigned here because the fixture has no measured evidence.

| Criterion | A | B | Evidence limitation |
|---|---:|---:|---|
| Meeting-preparation task fit | 1 | 1 | No task study |
| Hierarchy / long-text readability | 1 | 1 | No rendered text |
| Supporting data discoverability | 1 | 1 | No usage analytics |
| Existing component compatibility | 1 | 1 | Inventory names only |
| Narrow width / zoom | 1 | 1 | No screenshots |
| Keyboard and chart access | 1 | 1 | No interaction testing |

## Decision

Provisional preference: **A**, because the stated primary task requires
reading AI observations and evidence before meeting actions. This preference
is a design hypothesis, not a proven user outcome.

Required evidence: product-owner review of content priority; rendered laptop
and 320/390 CSS px variations; chart legend/data and keyboard behavior;
long-text samples. Escalate any pressure to hide required content.
