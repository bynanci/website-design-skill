# Harbor Account Workspace — Proposed Responsive Contract

Source: [synthetic input](../input/current-page.md).
Status: **proposal**, not rendered or device tested.

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
| 1920 x 1080 | Two main columns; observations wider than charts; KPI strip | Readability, page hierarchy and whitespace |
| 1366 x 768 | Reduce decorative padding, not text; show top tasks first; allow lower detail to scroll if necessary | Whether full-page no-scroll is realistic |
| 768 CSS px | One primary column plus optional adjacent KPI region if content fits | Actual container width and long labels |
| 390 / 320 CSS px | Single column; full observation text; chart data access and case detail | Reflow, no accidental clipping, focus order |
| 200% zoom | Treat as reduced available CSS width, not as guaranteed mobile state | Reflow, dialog bounds, keyboard, text resize |
| Narrow embedded panel | Component reacts to **container** pressure | Nested legend, actions, responsive surfaces |

Breakpoints are deliberately not fixed before measuring the rendered layout.

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

## Desktop no-scroll trade-off

A single 1366 x 768 screen is a **preference** that competes with full AI
observation text, chart legends, interaction and useful typography. Proposed
compromise: keep account identity, high-priority observations and meeting
action prominent, with supporting charts/cases reachable through deliberate
scrolling or approved disclosure. Obtain explicit product-owner approval
before hiding or collapsing anything essential.

## Validation plan (no checks claimed)

| Test | Expected outcome | Evidence status |
|---|---|---|
| 1920 x 1080 / 1366 x 768 screenshots | Clear hierarchy, readable chart/legend, no overlap | Not tested |
| 768 / 390 / 320 CSS px screenshots | All required modules reachable, text reflows | Not tested |
| 200% desktop zoom | No truncated observation or unreachable action | Not tested |
| Keyboard-only path | Evidence links, filters, tables and save action operable | Not tested |
| Touch path | No hover-only tooltips or row actions | Not tested |
| Screen reader/manual chart review | Category/series meaning and full figures accessible | Not tested |
| Long text, zero data, failed requests | Layout and feedback understandable | Not tested |

Release gate: do not claim responsive or accessibility success until rendered
evidence exists for representative conditions and any content trade-off is
approved.
