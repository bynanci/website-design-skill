# Harbor Account Workspace — Responsive Contract and Evidence

Source: [synthetic input](../input/current-page.md).
Status: the standalone synthetic specimen has prior Chromium rendering and
scripted interaction evidence. The [QA review](qa-review-2026-11-16.md) records
its source/run/artifact provenance and remaining gaps. Physical devices,
native browser zoom and screen readers remain untested.

## Content priority and equivalence

| Content | Wide layout | Narrow layout | Preservation rule |
|---|---|---|---|
| Account summary | Compact header | First block, key fields wrap | Contact and status remain accessible |
| AI observations 01–04 | Primary reading column | Immediate full-width section after summary | Preserve ordering, source, unknowns, and question |
| Human note | Adjacent to observation workflow | After observations, with save feedback | No hidden save action |
| KPIs | Compact row | Two-up or stacked, based on measured content | Keep labels and full values |
| Revenue mix | Supporting visual column | Full-width chart followed by data representation | Legend and category meaning stay accessible |
| Revenue trend | Supporting visual column | Full-width with readable series control | Preserve all series and point values |
| Opportunities | Lower supporting panel | Section after revenue, may disclose details | Mark suggestions as suggestions |
| Cases | Lower panel | Table with local horizontal scroll or row detail | All statuses, owners and row actions remain accessible |

The narrow layout may **reorder** sections to support the AM workflow but does
not remove content. Every disclosure must retain a named accessible control.

## Candidate layout conditions

| Scenario | Proposed adaptation | Verification still required |
|---|---|---|
| 1920 x 1080 | Specimen uses two main columns, wider observations and a KPI strip | Human readability and hierarchy review |
| 1366 x 768 | Full content remains scrollable; recorded document height is 2722px | Product-owner acceptance of the scrolling trade-off |
| 768 CSS px | Primary content reflows to one column | More locales and realistic long values |
| 390 / 320 CSS px | Single-column content, tabular chart data and local case-table scroll | Full manual focus order and physical touch review |
| 200% zoom | A 683 CSS px proxy was captured; native zoom remains unrun | Actual browser zoom, dialog bounds and text resize |
| Narrow embedded panel | A 360 CSS px dashboard container was captured | Full nested bounds and focus assertions in both directions |

The specimen uses container-query thresholds at 1190, 875, 525 and 340 CSS
px. These are implementation choices checked at the recorded conditions,
not proven breakpoints for arbitrary target products or content.

## Charts, tables and actions

- RevenueCompositionChart: legend can move below chart, wrap, or enter an
  explicitly labeled disclosure; values also remain available in a table.
- RevenueTrendChart: do not hide a series to "make the chart fit"; offer
  series selection with full data access, keyboard focus and readable labels.
- CasesTable: local scroll has an affordance and stable row/column headings,
  or row-detail layout retains every field and action.
- All hover-only actions must have visible keyboard/focus and touch paths.
- Observation evidence links must have descriptive accessible names.
- NotesEditor must preserve unsaved text and communicate saving, error and
  validation states.

## Desktop scrolling trade-off

A single 1366 x 768 screen remains a **preference**. The rendered specimen
does not achieve it: its recorded full-page height is 2722px. It preserves
the full text, evidence, charts and case actions. The mobile shortcut links
directly to AI observations. Product-owner acceptance of this scrolling
trade-off and a human visual-direction decision remain open.

## Validation evidence and open checks

| Test | Expected outcome | Evidence status |
|---|---|---|
| 1920 x 1080 / 1366 x 768 screenshots | Content present; no chart/legend intersection or global overflow | Prior automated checks passed; human design acceptance open |
| 768 / 390 / 320 CSS px screenshots | Required groups remain; text reflows | Prior automated checks passed for the synthetic content |
| 200% desktop zoom | No truncated observation or unreachable action | Not tested natively; the CSS-width proxy is recorded separately |
| Keyboard chart and dialog paths | Arrow/Home/End navigation; Enter/Escape and focus return | Prior scripted checks passed; full manual traversal remains open |
| Touch path | Visible row actions and adequate primary controls | Scripted size/visibility checks passed; physical device use not tested |
| Screen reader/manual chart review | Category/series meaning and full figures accessible | Not tested |
| Long strings | Observation/evidence/account strings remain within 320px | Prior synthetic stress check passed |
| Empty/loading/error requests | Layout and recovery remain understandable | Not tested; current specimen is static and synchronous |
| Both visual directions | Content and interaction parity at all supported conditions | Laptop/390px captures exist; full matrix still open |

Issue #7 remains open until missing conditions, reusable component integration
and human decisions have evidence. Prior automated results cover the recorded
fictional specimen and runtime; they do not certify a production page.
