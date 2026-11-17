# Responsive Behavior Contract and Validation Plan

**Case:** responsive-layout-001  
**Artifact type:** Planning contract; no implementation claimed  
**Governing skill:** packet `SKILL.md` (Website Design)  
**Model / product identity:** OpenAI ChatGPT, GPT-5.6 Sol  
**Capabilities used:** local packet-file inspection and UTF-8 Markdown file creation. No web, connected sources, other conversations, evaluator references, screenshots, analytics, device measurements, or external files were used.

## 1. Evidence boundary

### Supplied facts

- The product is a fictional B2B account dashboard used by account managers to decide which customer issue to raise next.
- The page must retain six required modules:
  1. account identity and contact context;
  2. four KPI summaries: revenue, trend, cases, renewal status;
  3. four ordered AI observations, each with an evidence link and suggested follow-up question;
  4. revenue composition chart with five categories and a legend;
  5. service revenue trend with multiple series;
  6. cases table with status, owner, due date, and row actions.
- Existing reusable components are `AccountHeader`, `KPITile`, `ObservationCard`, `DonutChart`, `TrendChart`, `CaseTable`, `SectionHeading`, and `DisclosurePanel`.
- Known product-owner issues are:
  - chart legend overlaps data marks at narrow widths;
  - AI observation descriptions are truncated in fixed-height cards;
  - table actions are available only on hover;
  - some sections are hidden by the current mobile stylesheet.
- Product-owner preference: all six modules should ideally fit in a 1366 × 768 desktop viewport without page scrolling. This is a preference, not permission to shrink type or delete content.
- Mobile vertical scrolling is allowed.
- Required scenarios are 1920 × 1080, 1366 × 768, 390 CSS px, 320 CSS px, 200% desktop zoom, and a narrow embedded panel.
- No actual screenshots, analytics, WCAG audit results, device measurements, or test results are supplied.

### Design hypotheses in this contract

The following are proposals to validate, not observed evidence:

- **H1:** A responsive desktop composition can use denser multi-column grouping while preserving the supplied module order and workflow.
- **H2:** The 1366 × 768 single-screen preference may be achievable only for some real content lengths; it must not override readable type, complete observation text, chart legibility, or operable table controls.
- **H3:** Narrow chart behavior is more understandable if legends leave the plot area and chart data has a text/table alternative.
- **H4:** The cases module is more usable at very narrow container widths when each row restructures vertically rather than forcing the whole page to scroll horizontally.
- **H5:** Responsive transitions should be triggered by content/container pressure, not by unverified device-specific breakpoint numbers.

### Untested claims / unknowns

- Whether all six modules actually fit without page scrolling at 1366 × 768 with production content.
- Exact transition widths for any component.
- Minimum chart dimensions needed for readable labels and multiple series.
- Production text lengths, localization expansion, case-row count, chart label lengths, series count, and legend label lengths.
- Existing component semantics, keyboard behavior, focus styles, chart accessibility implementation, sorting behavior, or current loading/error/empty states.
- Browser and assistive-technology support requirements.
- Embedded-panel width and host constraints.

No pass/fail result or tested breakpoint is asserted below.

---

## 2. Baseline and scope

- **Page / feature:** B2B account dashboard.
- **Page goal:** Help an account manager understand account context, evaluate signals and evidence, and decide which customer issue to raise next.
- **Primary user:** Account manager.
- **Primary task:** Review account context → scan KPIs → assess ordered AI observations and their evidence/follow-up questions → inspect revenue/service trends → review cases and act on a relevant row.
- **Required content coverage:** All six supplied modules and all named information/actions within them.
- **Existing components:** Reuse the eight supplied components before extending or varying them.
- **Design constraint:** 1366 × 768 no-page-scroll is a preference only; readability and content completeness take precedence.
- **Minimum supported conditions to plan for:** the six required scenarios named in the case. Exact browser/device support is unknown.
- **Known evidence:** Product-owner-reported layout/interaction issues only; no measured or audited evidence.
- **Untested conditions to carry forward:** long text/localization, extreme case counts, long legends/labels, loading/error/empty data, assistive technology, and actual embedded-panel dimensions.

---

## 3. Content priority and equivalence

Nothing required is removed at narrow widths. Reflow, wrapping, local overflow, and disclosure of equivalent alternate data views are allowed; silent hiding is not.

| Information / action | Priority and rationale | Wide placement | Narrow placement | Can collapse? | Access if collapsed |
|---|---|---|---|---|---|
| Account identity + contact context | Highest: establishes which account the decision concerns | Top, full-width `AccountHeader` | Top, stacked/wrapped within `AccountHeader` | No essential fields | N/A |
| Four KPI summaries | High: fast account-health scan | One row when content fits | Wrap to 2×2, then single-column as needed | No | N/A |
| Four ordered AI observations | Highest: directly supports “what issue to raise next” | Multi-column only if full text remains readable; preserve order | Single ordered flow | Description must not collapse/truncate by default | Evidence link and follow-up remain in each card |
| Revenue composition | Supporting evidence | Chart region beside trend chart when both remain legible | Full-width; legend moved outside plot | Chart itself no; accessible data view may use disclosure | `DisclosurePanel` exposes equivalent category/value data when available from chart data model |
| Service revenue trend | Supporting evidence | Chart region beside composition chart when legible | Full-width; taller plot; local plot overflow only if labels/series otherwise become unreadable | Chart itself no; accessible data view may use disclosure | `DisclosurePanel` exposes equivalent series/time data when available from chart data model |
| Cases table + row actions | High: operational follow-through | Full-width `CaseTable` | Restructure rows vertically when table columns no longer fit; keep all supplied fields | No required field/action | N/A |

**Ordering rule:** preserve the account-manager workflow above. Responsive rearrangement may change columns, but not the logical reading/focus sequence of modules or the order of the four observations.

---

## 4. Proposed responsive structure

### Wide / spacious containers

1. `AccountHeader`.
2. KPI band using four `KPITile` instances.
3. Ordered observations using four `ObservationCard` instances.
4. Revenue composition (`DonutChart`) and service trend (`TrendChart`) in a two-region chart band only when both plots, labels, and legends remain readable.
5. `CaseTable`.

A wide viewport may increase whitespace or chart width; it should not increase information density merely to fill space.

### Constrained desktop / laptop containers

Keep the same logical order but allow:

- KPI tiles to wrap rather than compress text.
- Observation cards to use fewer columns and natural height.
- The chart band to switch from side-by-side to stacked when either chart becomes crowded.
- The cases table to remain tabular while columns are readable; otherwise switch to the narrow-row variant described below.

### Narrow mobile and narrow embedded containers

Use a single content flow:

1. account context;
2. KPI tiles;
3. ordered observations;
4. revenue composition;
5. service trend;
6. cases.

Vertical scrolling is expected. No required section is hidden.

### 200% desktop zoom

Treat the resulting available layout space as a constrained container, not as a special “desktop” exception. The same reflow rules apply: wrapping, stacking, externalized legends, visible actions, and vertical scrolling as needed. Do not force the pre-zoom desktop grid to remain intact.

---

## 5. Layout-condition matrix

These are **target behaviors for validation**, not observed breakpoints.

| Scenario / condition | Grid / density | Charts / legends | Cases | Actions / focus | Content verification |
|---|---|---|---|---|---|
| 1920 × 1080 | Spacious multi-column composition where content fits naturally | Charts may sit side-by-side; legends must not overlap plot marks | Full table if readable | Row actions visible or persistently discoverable without hover; logical focus order | All six modules and all required observation content present |
| 1366 × 768 | Compact desktop composition; reduce gaps/layout columns before reducing readability | Side-by-side only if both charts remain legible; otherwise stack | Full table if readable; no forced micro-text | Same non-hover access | Attempt single-screen preference, but allow page scroll if required for complete/readable content |
| 390 CSS px | Single-column flow | Donut legend below/outside plot; trend chart gets full width and sufficient height; local chart overflow only if necessary | Vertically restructured rows preserving status, owner, due date, actions | Visible focus; persistent action trigger/control | No hidden sections; observation descriptions untruncated |
| 320 CSS px | Single-column, minimal non-content spacing | Same as 390; legend wraps/stacks; no legend-over-plot | Same narrow-row variant; no page-level horizontal scroll | Controls wrap rather than clip | All required text/actions remain available |
| 200% desktop zoom | Reflow based on available container space | Use narrow/stacked chart behavior when pressure requires it | Switch table variant when columns cannot fit | Keyboard sequence follows visual/logical order; no hover dependency | No content lost because environment began as desktop |
| Narrow embedded panel | Container-driven single-column or stacked layout regardless of outer viewport | Legends outside plots; charts use panel width; allow local overflow only where unavoidable | Narrow-row variant when tabular columns do not fit | Focus must remain within normal document order; actions remain visible/discoverable | Component behavior must respond to panel space, not only viewport width |
| Long text / localization (untested) | Cards/tiles grow or wrap; no fixed-height truncation | Legends and labels wrap or stack; chart area grows or uses local overflow | Labels/values wrap within row structure | Controls remain identifiable | No clipping or ellipsis that removes required meaning without an explicit expansion control |

---

## 6. Per-component behavior and reuse decisions

| Component | Reuse decision | Trigger condition | Adaptation | Content parity | Pointer / keyboard / touch | Evidence status |
|---|---|---|---|---|---|---|
| `AccountHeader` | Reuse, with responsive layout rules if absent | Identity/contact fields no longer fit in one line/row | Wrap/stack fields; keep account identity first | Full | Normal reading/focus order; no hover-only content | Untested |
| `KPITile` | Reuse | Four tiles no longer fit at readable width | Wrap 4→2×2→1 column by content pressure | All four KPIs preserved | Any interactive KPI behavior, if present, must be keyboard operable; none is supplied | Untested |
| `ObservationCard` | **Extend** | Description length exceeds card height or container narrows | Remove fixed-height truncation; natural height; preserve ordered sequence; evidence link and follow-up question stay with description | Full description, evidence link, follow-up preserved | Evidence link is a normal focusable link with visible focus; no hover-only reveal | Untested; directly addresses supplied issue |
| `DonutChart` | **Extend** | Legend would overlap plot or labels cannot fit | Move legend below/outside plot; stack/wrap legend; preserve five categories; pair colors with text labels/markers | All five categories preserved; no category removed for space | Chart meaning cannot depend on hover; provide keyboard-readable/text alternative from same data when component supports it | Untested; overlap issue supplied |
| `TrendChart` | **Extend** | Multiple series/labels become unreadable | Stack chart full-width; increase vertical room; legend outside plot; if x-domain still cannot fit, use **local chart-region horizontal overflow** rather than page overflow | All supplied series preserved; do not hide “secondary” series merely for width | Series identification available without hover; keyboard/text alternative from same data; focusable controls if any | Untested |
| `CaseTable` | **Variant / extend** | Status, owner, due date, and row actions cannot fit without clipping or unreadable compression | Wide: table. Narrow: each row restructures vertically while retaining all supplied fields and row actions | Full | Row actions never hover-only. Provide a persistent visible action control or controls, keyboard reachable; Enter/Space activation; visible focus; if an action overlay is used, focus enters it and returns to its trigger on close | Untested; hover-only issue supplied |
| `SectionHeading` | Reuse | Any width | Wrap naturally; no fixed height | Full | If semantic heading level exists, preserve hierarchy across reflow | Untested |
| `DisclosurePanel` | Reuse / compose | Used for optional equivalent chart-data presentation or other secondary detail | Full-width disclosure on narrow containers | Disclosure must not replace visible required chart/module content; it exposes equivalent data representation | Trigger keyboard-operable; expanded state exposed; focus remains predictable | Untested |

### New component requirements

**None proposed.** The case can be planned through reuse, extension, bounded variants, and composition of existing components. Any later need for a new primitive must be justified only after inspecting the actual component APIs and states.

---

## 7. Specific behavior decisions

### 7.1 Narrow chart legends

- Never overlay the legend on chart marks when space is constrained.
- Move the legend outside the plotting area, preferably below it in narrow containers.
- Allow legend items to wrap or form a vertical list.
- Keep all five revenue-composition categories represented.
- Do not rely on color alone: each legend item needs a textual category label and a visual association with its series/category.

### 7.2 Multi-series trend data

- Preserve every supplied series; do not hide series solely to make the chart fit.
- Place the legend outside the plot when pressure would otherwise cause overlap.
- Allow the plot to gain vertical space before reducing label readability.
- If the time axis remains too dense at narrow width, constrain horizontal overflow to the **chart plot region**, with an obvious scroll affordance; never create page-level horizontal scrolling for the chart.
- Expose an equivalent text/table representation using the chart’s existing data model, composed with `DisclosurePanel`, so exact values and series meaning are not dependent on pointer hover.

### 7.3 Revenue composition data

- Keep the donut chart and all five categories.
- Move the legend below/outside the chart at narrow widths.
- Do not shrink the chart until labels/targets become illegible merely to preserve a desktop arrangement.
- Provide an equivalent category/value representation from the same underlying data when that capability exists; do not invent values in this planning artifact.

### 7.4 AI observations and evidence links

- Remove fixed-height description truncation.
- Cards grow with content.
- Preserve the four-observation order at every layout.
- Keep each evidence link and suggested follow-up question inside its associated observation.
- Evidence links remain visible in the normal reading flow, wrap as needed, and are keyboard focusable with a visible focus indicator.
- Do not place evidence links behind hover-only affordances.

### 7.5 Cases and row actions

- At widths where the table remains readable, preserve the table layout.
- When required columns/actions no longer fit, use a `CaseTable` narrow variant that restructures each row vertically instead of removing fields.
- Status, owner, due date, and row actions remain present for every row.
- Row actions must not be hover-only at any width. A persistent action control/control group remains visible or otherwise persistently discoverable.
- Keyboard users can reach the action control in row order and activate it without pointer input.
- If row actions open an overlay, the overlay must have a clear accessible name, support Escape/close, keep focus within the active overlay as appropriate, and restore focus to the row action trigger when closed. Exact overlay implementation is not specified by the case.

### 7.6 Keyboard and non-hover access

- Logical focus order follows the logical module order even when visual columns change.
- All links and controls have visible focus states.
- No required information appears only on hover.
- No required action appears only on hover.
- Chart series/value meaning has a non-hover equivalent via labels/legend and an accessible textual data representation.
- Reflow must not move focus unexpectedly or produce a different keyboard order from the reading order.
- Touch users receive the same persistent row-action and evidence-link access as pointer/keyboard users.

---

## 8. Single-screen versus readability trade-off

The 1366 × 768 no-scroll target is **not guaranteed** from the supplied evidence. The case deliberately omits actual content measurements, text lengths, chart labels, row counts, screenshots, and rendered component dimensions. Four full AI observations plus two charts and a cases table may exceed the available vertical space when rendered readably.

The priority order for resolving pressure is:

1. reduce non-content spacing within an approved density range;
2. use efficient multi-column composition where content remains readable;
3. wrap KPI/observation layouts and stack charts when needed;
4. preserve natural text height and complete controls;
5. **allow page scrolling** rather than shrink type, truncate observation text, hide modules, overlap legends, or remove actions.

Therefore, the accepted planning compromise is: **attempt the single-screen desktop preference, but fail that preference rather than fail content completeness, legibility, or operability.** Whether 1366 × 768 can meet the preference is a validation question, not a fact.

---

## 9. Content coverage matrix

| Existing required content | Proposed location / behavior | Action | Status |
|---|---|---|---|
| Account identity and contact context | `AccountHeader`; wraps/stacks under pressure | Preserve | Preserved |
| Revenue KPI | `KPITile` | Preserve | Preserved |
| Trend KPI | `KPITile` | Preserve | Preserved |
| Cases KPI | `KPITile` | Preserve | Preserved |
| Renewal-status KPI | `KPITile` | Preserve | Preserved |
| Four ordered AI observations | `ObservationCard` sequence; natural height | Preserve; extend responsive behavior | Preserved |
| Each observation description | Natural-height text; no fixed truncation | Preserve | Preserved |
| Each evidence link | Visible with its observation | Preserve | Preserved |
| Each suggested follow-up question | Visible with its observation | Preserve | Preserved |
| Revenue composition chart | `DonutChart`; legend externalized when narrow | Preserve; extend responsive behavior | Preserved |
| Five composition categories | Chart + legend + equivalent data representation where supported | Preserve | Preserved |
| Revenue composition legend | Below/outside plot under pressure | Move within module | Moved |
| Service revenue trend | `TrendChart`; stacked/full-width under pressure | Preserve; extend responsive behavior | Preserved |
| Multiple trend series | All retained; legend/text alternative prevents hover-only meaning | Preserve | Preserved |
| Cases table status | `CaseTable`; vertical row restructuring when narrow | Preserve | Preserved |
| Cases table owner | Same | Preserve | Preserved |
| Cases table due date | Same | Preserve | Preserved |
| Case row actions | Persistent non-hover control(s) | Preserve; change interaction visibility | Preserved |

**Intentional removals:** none.  
**Unintended missing content:** none identified from the supplied case facts.

---

## 10. Risks and assumptions

### Risks

- Production content may make the 1366 × 768 single-screen preference infeasible.
- A trend chart with many series or long labels may remain hard to read at 320/390 CSS px even after stacking and legend relocation.
- A narrow embedded panel may be narrower than the mobile cases, requiring more aggressive internal reflow.
- Restructuring `CaseTable` rows may require careful semantic implementation to retain relationships between row fields; existing markup is unknown.
- Existing chart components may not currently expose data in a form suitable for a keyboard/text alternative; this must be inspected before implementation.

### Assumptions to validate

- Existing components can be safely extended without creating duplicate near-equivalents.
- `DisclosurePanel` can compose with chart components without changing the meaning of required chart content.
- The dashboard does not require a fixed-height application shell that prohibits page scrolling; only the 1366 × 768 no-scroll preference was supplied.

---

## 11. Small validation plan

All rows below are **planned tests**. Because the packet supplies no renderer, implementation, screenshots, or measurements, the observed result is correctly recorded as **Not tested**.

| Case / environment | Expected outcome | Method | Evidence | Observed result | Owner |
|---|---|---|---|---|---|
| 1920 × 1080 | All six modules present; charts may share a row only if readable; no clipped text/actions | Rendered visual review + keyboard pass | Not supplied | Not tested | Design/implementation team |
| 1366 × 768 | Attempt no-page-scroll composition without smaller unreadable type, truncation, hidden modules, or chart overlap; scroll allowed if needed | Rendered visual review with production-like longest known content | Not supplied | Not tested | Design/implementation team |
| 390 CSS px | Single-column reflow; no hidden section; observation text complete; legends external; cases restructured; no page-level horizontal scroll | Rendered/manual review + keyboard/touch-equivalent interaction check | Not supplied | Not tested | Design/implementation team |
| 320 CSS px | Same content parity as 390; no clipping/overlap; controls wrap; local chart overflow only if required | Rendered/manual review | Not supplied | Not tested | Design/implementation team |
| 200% desktop zoom | Layout reflows according to available space; all content/actions remain reachable; focus order remains logical | Browser zoom manual test + keyboard-only pass | Not supplied | Not tested | QA/accessibility review |
| Narrow embedded panel | Components respond to container pressure rather than outer viewport; no hidden modules | Render in actual host panel at supplied host dimensions once known | Not supplied | Not tested | Integration owner |
| Observation long-text stress | Cards grow; no description truncation; links/questions remain associated | Long-content fixture/manual review | Not supplied | Not tested | QA |
| Donut legend stress | Legend never overlays marks; five categories remain identifiable | Long-label fixture/manual review | Not supplied | Not tested | QA |
| Trend multi-series stress | All series remain represented; legend/text alternative works without hover; local overflow, if used, is discoverable | Multi-series fixture + keyboard/manual review | Not supplied | Not tested | QA/accessibility review |
| Cases actions, keyboard only | Every row action is reachable and activatable without hover; focus is visible; overlay focus returns to trigger if applicable | Keyboard-only interaction test | Not supplied | Not tested | QA/accessibility review |
| Content parity regression | No required module/field/link/action disappears in any responsive state | Cross-scenario content checklist | Not supplied | Not tested | Product/QA |

### Validation gate

Before implementation can be called complete, verify:

- [ ] No essential information or action disappears at narrow widths.
- [ ] Observation descriptions are not accidentally clipped or truncated.
- [ ] Legend placement never obscures chart marks.
- [ ] Multi-series meaning is available without hover or color alone.
- [ ] Any horizontal scrolling is local, intentional, and discoverable; page-level horizontal scroll is absent.
- [ ] Case row actions are persistent and keyboard/touch operable.
- [ ] Focus order follows reading order after reflow.
- [ ] 200% zoom and the actual embedded-panel container are tested rather than inferred.
- [ ] 1366 × 768 single-screen fit is recorded as pass/fail from a render, not assumed.
- [ ] Content parity is checked across 1920 × 1080, 1366 × 768, 390 CSS px, 320 CSS px, 200% zoom, and the actual narrow embedded panel.

---

## 12. Decision summary

- **Structure before styling:** keep the supplied account-manager workflow and all six modules; only layout changes across conditions.
- **System before pages:** solve recurring pressure in `ObservationCard`, `DonutChart`, `TrendChart`, and `CaseTable` contracts rather than with page-specific hiding/overrides.
- **Evidence before preference:** the only supplied behavioral evidence is the product-owner issue list; all proposed responsive rules are hypotheses until rendered and tested.
- **Preserve content integrity:** nothing required is removed. Mobile stylesheet hiding is explicitly rejected for these modules.
- **Reuse before invention:** no new component is proposed; use reuse → extend → variant → compose.
- **Desktop fit trade-off:** 1366 × 768 no-scroll is attempted but does not outrank readable, complete, operable content.
- **Validation status:** no tests have been executed; all outcomes remain untested.
