# Responsive Behavior Contract (Optional v0.2 Preview)

Define behavior by **content and container pressure**, then map it to actual
viewport conditions. A breakpoint number alone is not a behavior contract.

## Baseline and scope

- Page / feature:
- Locked page specification:
- Required content coverage:
- Existing components and layout tokens:
- Critical user task / CTA:
- Minimum supported environment (state assumptions):
- Design constraints (e.g., desktop single-screen preference):
- Known device, browser and zoom evidence:
- Untested conditions:

## Content priority and equivalence

| Information / action | Priority and rationale | Wide placement | Narrow placement | Can collapse? | How to access when collapsed |
|---|---|---|---|---|---|
| | | | | | |

Mark explicitly when content is deferred, summarized, moved, or truly removed.
Removal requires a content-coverage decision, not a media query.

## Layout-condition matrix

Record **observed** breakpoints after testing. The widths below are candidate
test scenarios, not prescribed product breakpoints.

| Scenario / condition | Navigation | Grid / density | Tables or charts | Actions / overlays | Content / focus verification |
|---|---|---|---|---|---|
| Wide desktop (e.g. 1920 x 1080) | | | | | |
| Laptop (e.g. 1366 x 768) | | | | | |
| Mid-width / split view (e.g. 768 CSS px) | | | | | |
| Narrow mobile (e.g. 390 CSS px) | | | | | |
| Minimum reflow candidate (e.g. 320 CSS px) | | | | | |
| 200% zoom on desktop | | | | | |
| Long text / localization | | | | | |
| Embedded narrow card / panel | | | | | |

## Per-component behavior

| Component / variant | Trigger condition (not only width) | Adaptation | Data / content parity | Pointer / keyboard / touch | Test evidence |
|---|---|---|---|---|---|
| | | | | | |

For charts and tables, specify:
- legend placement and overflow behavior;
- readable labels, tooltip / focus / keyboard alternatives;
- whether data is summarized, restructured, horizontally scrollable, or available
  as an accessible table;
- how the user discovers additional series and the full data;
- retained filters, sorting, selection, and error / empty states.

## Navigation, overlays and interaction

- Navigation disclosure and escape/back behavior:
- Focus order after layout reflow:
- Visible focus and focus restoration:
- Dialog/popover bounds, scroll locking, and return focus:
- Touch target and pointer alternatives:
- Hover-only information replacement:
- Motion preference and reduced-motion fallback:
- Loading / error / empty / offline states:

## Validation evidence

| Case / environment | Expected outcome | Method (rendered/manual/automated) | Evidence link | Observed result | Owner |
|---|---|---|---|---|---|
| | | | | Not tested / Pass / Fail | |

## Trade-off / gate

- Desktop no-scroll requirement vs readability or content completeness:
- Explicit accepted compromise:
- Known regressions and rollback conditions:

- [ ] No essential information or action disappears at narrow widths.
- [ ] Horizontal scrolling is intentional, local, and discoverable where needed.
- [ ] Text reflows without accidental clipping or overlap.
- [ ] Zoom and narrow **container** layouts are tested, not inferred from viewport alone.
- [ ] Keyboard / focus / overlay interactions remain operable after reflow.
- [ ] Chart data and meaning are not communicated through color or hover alone.
- [ ] Test outcomes are marked as observed, simulated, or not tested.
