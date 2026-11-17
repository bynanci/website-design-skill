# Responsive Behavior Contract and Validation Plan

**Case:** responsive-layout-001 · Fictional B2B account dashboard  
**Deliverable:** Planning specification only; no application implementation  
**Status:** Proposed / not validated  
**Governing source:** Packet `SKILL.md`, with packet-specified workflow, component architecture, and responsive-behavior guidance  
**Preparation capability:** Packet reading, design reasoning, and UTF-8 Markdown file generation. No browser, running product, repository, visual renderer, assistive-technology test, or device test was used.  
**Model:** OpenAI GPT-6

## 1. Baseline, evidence, and scope

### Supplied facts (case evidence)

- **User and task:** Account managers decide which customer issue to raise next.
- **Six required modules:** (1) account identity/contact context, (2) four KPI summaries—revenue, trend, cases, renewal status, (3) four **ordered** AI observations, each with an evidence link and suggested follow-up question, (4) five-category revenue composition chart and legend, (5) multiple-series service revenue trend, and (6) cases table with status, owner, due date, and row actions.
- **Existing reusable components:** `AccountHeader`, `KPITile`, `ObservationCard`, `DonutChart`, `TrendChart`, `CaseTable`, `SectionHeading`, `DisclosurePanel`.
- **Reported defects:** Narrow chart legends overlap data marks; fixed-height observation cards truncate descriptions; table row actions are hover-only; some sections disappear under the mobile stylesheet.
- **Preference, not requirement:** Ideally all six modules fit in one **1366 × 768** desktop viewport without page scrolling. Shrinking type and deleting content are not authorized. Mobile vertical scrolling is allowed.
- **Required scenarios:** 1920 × 1080, 1366 × 768, 390 CSS px, 320 CSS px, 200% desktop zoom, and a narrow embedded panel.
- **Not supplied:** Screenshots, analytics, measured content dimensions, real data, actual component APIs, source code, design tokens, tested breakpoints, browser/device matrix, accessibility audit, and user research.

### Design hypotheses (proposals, not observations)

1. A task-first reading order—**identity → KPIs → ordered observations → revenue composition → revenue trend → cases**—helps users orient, identify an issue, inspect supporting evidence, and reach cases. This preserves the source module order; the existing DOM order is unknown.
2. Container-aware responsive layouts, natural-height observation cards, and separated legends can eliminate the specified failure mechanisms without removing data.
3. For a dense cases table, a labeled field-stack at small *container* sizes is easier to scan than a heavily compressed grid; a horizontally scrollable table remains a candidate alternative if actions or semantics depend on table comparison.
4. A full textual data view for both charts is a valuable equivalent route to values and series when plot labels, tooltip interactions, or available width fail.

All four are **untested design hypotheses**, not claims about user preference, accessibility compliance, or feasibility in the existing codebase.

### Page goal and proposed low-fidelity structure

**Goal:** Help an account manager decide the next customer issue to raise, inspect its evidence, form a follow-up question, and access the relevant case action.

```text
AccountHeader: identity + contact context
KPIs: revenue | trend | cases | renewal status (four total)
AI observations: #1, #2, #3, #4, in source order
  Each: full description + evidence link + follow-up question
Revenue composition: five categories + five-item legend + data view
Service revenue trend: all supplied series + series keys + data view
Cases: status | owner | due date | row actions
```

This is a **proposed content hierarchy**, not a claim about the current rendered layout. No page-global navigation redesign is supported by the supplied case. Preserve any existing navigation semantics if a host application provides them; no routes or destination labels are invented.

### Content coverage matrix

| Existing information/action | Proposed location | Action | Content status |
|---|---|---|---|
| Account identity and contact context | `AccountHeader`, first | Preserve; reflow fields | Preserved in specification |
| Revenue KPI | KPI group | Preserve value and label | Preserved in specification |
| Trend KPI | KPI group | Preserve value and label | Preserved in specification |
| Cases KPI | KPI group | Preserve value and label | Preserved in specification |
| Renewal status KPI | KPI group | Preserve value and label | Preserved in specification |
| AI observations #1–#4, in given order | Observation section, 1–4 | Preserve all descriptions without fixed-height truncation | Preserved in specification |
| Evidence link for **each** observation | Within corresponding card | Preserve as operable link | Preserved in specification |
| Suggested question for **each** observation | Within corresponding card | Preserve readable text | Preserved in specification |
| Revenue composition, five categories and legend | `DonutChart` section | Preserve all categories; separate legend and offer data view | Preserved in specification |
| Multiple-series service revenue trend | `TrendChart` section | Preserve every supplied series and its data; offer data view | Preserved in specification |
| Case status, owner, due date | `CaseTable` section | Preserve all fields; restructure per row if necessary | Preserved in specification |
| Case row actions | Each case row | Make discoverable by pointer, keyboard and touch | Preserved in specification |

**No intentional removals.** This matrix describes planned parity; no implemented content coverage has been verified. Actual field values, number of cases, chart point counts, series names, link destinations, and actions are unknown and must be sourced from the unchanged product data at implementation time.

## 2. Responsive content and interaction contract

**Core rule:** Reflow by available **component/container width and actual content pressure**, not device label alone. Do not equate viewport width with an embedded panel's content width. The following are provisional responses; numerical production breakpoints must be derived after rendering actual content and measuring failures. Preserve one logical reading order and do not hide required sections using display rules or disclosure defaults.

| Information / action | Priority | Roomy container | Constrained container | May collapse? / access |
|---|---|---|---|---|
| Account identity and contact | Essential orientation | Inline or grouped fields | Wrapped/stacked labels and values | Not remove; no inaccessible overflow |
| Four KPIs | High-priority overview | Four across if readable | Wrap 2 × 2, then 1 per row as needed | No: retain all four |
| Four ordered AI observations | Primary issue-selection content | Cards in readable sequence; adjacent columns only if order unambiguous | One column; variable-height cards; number/order explicit | **No default collapse/truncation** of descriptions, evidence, or question |
| Revenue composition | Supporting evidence | Plot adjacent to external five-item legend | Legend below plot, wrap or list without overlap; full data view | Optional chart visualization disclosure only if all information remains clearly accessible; not hidden by default |
| Service trend | Supporting evidence | Plot and series legend | Simplified axes/label intervals; external series legend; accessible data view | May visually defer less critical tick labels, **not data or series** |
| Cases | Operational follow-through | Semantic multi-column table | Field-stack rows or contained table scroller, depending on tested viability | No row/action removal; pagination if already supported must be retained |
| Row actions and evidence links | Essential interactions | Visible controls | Visible controls | Never hover-only or focus-inaccessible |

### Layout-condition matrix (candidate, untested)

| Scenario | Grid and density | Chart / table treatment | Actions, content and focus |
|---|---|---|---|
| **1920 × 1080** | Use a reasonable readable content max-width; KPIs may be four across; side-by-side chart sections only if both remain legible. Avoid making the observation reading path ambiguous. | Full labels/legend outside chart marks; table columns visible where space permits. | Actions persistently visible; do not stretch body text into excessively long lines. |
| **1366 × 768** | Prioritize identity, KPIs, and observations in the first view; allow page scrolling to keep descriptions and charts readable. A more compact shared spacing variant is permissible only if readable. | Two charts may share a row only if text/legends fit; cases continue below as needed. | No forced six-module fit. No type reduction solely to meet one screen. |
| **Mid-width / split-view (illustrative ~768 CSS px)** | KPI wrap; chart sections stack when their individual containers become cramped; observations use natural height. | External legends and data views; table restructures or scrolls locally. | Maintain DOM/tab order; preserve all controls. |
| **390 CSS px** | One-column section flow; KPIs one or two per row **only when labels and values fit**; observation cards grow vertically. | Legend becomes a list outside plot; series/data alternative visible; cases use labeled rows or local scroller. | Visible evidence links and case actions; page scrolls vertically. |
| **320 CSS px** | Single-column, wrapping text; no rigid card height or minimum fixed content width. | Reduce decorative chart detail before reducing useful text; legend list, chart data view; row fields/actions wrap. | No clipped cards, missing modules, overlapping data marks, or inaccessible actions. |
| **200% desktop zoom** | Treat effective layout width as reduced; let containers reflow based on available CSS space, not nominal monitor resolution. | Same narrow-container chart/table adaptations. | Keyboard focus stays visible; avoid two-dimensional **page** scrolling where reflow is feasible. Actual behavior requires testing. |
| **Narrow embedded panel** | Container-responsive one-column composition even when parent viewport is wide. Avoid relying solely on viewport media queries. | Plot/legend separated; data view and field-stack rows; constrain any unavoidable scroller to its component. | Host panel clipping/scroll behavior and focus boundaries must be tested; parent behavior is unknown. |
| **Long content / localization** | Long account/contact strings, dates, headings, questions, and descriptions wrap; heights expand. | Legend entries and column values wrap; chart labels use full-text alternatives. | No ellipsis for required information without an explicit reveal mechanism. |

**Container-pressure triggers to implement and verify:** KPI tile contents no longer fit without collision; chart marks and legend compete for the same plot space; multi-series legends become ambiguous or overflow; case columns/actions need impractically narrow widths; observation text would be clipped. Reflow at these points, rather than encoding the above scenario widths as already validated breakpoints.

## 3. Per-component contracts and reuse decisions

| Component | Reuse decision and responsibility | Proposed adaptive behavior | Interaction and accessibility contract | Evidence |
|---|---|---|---|---|
| `AccountHeader` | **Extend** only if existing field wrapping is insufficient; identity/context owner | Wrap or stack account/contact fields without losing any | Semantic identity heading and labeled contact fields; links keyboard focusable | Not tested |
| `KPITile` | **Reuse / bounded density variant** for one metric | Four tiles wrap on intrinsic minimum readable width; labels and figures remain intact | Pair values with visible labels; do not signal trend/status only by color | Not tested |
| `ObservationCard` | **Extend** existing card to natural height; no replacement card | Full description; evidence link and question remain in same card; stable #1–#4 order | Heading/sequence cues, normal text selection, keyboard-operable named evidence link, visible focus; no hover-to-reveal content | Not tested |
| `DonutChart` | **Extend** existing chart with legend outside marks and structured data alternative | Plot shrinks only to a usable limit; five legend items flow beneath/alongside without overlap; show each category in alternative data representation | Legend labels associate with marks; values/meaning available as text/table; no color-only or tooltip-only information; keyboard access to any interactive marks | Not tested |
| `TrendChart` | **Extend** existing chart for external series keys and data view | Retain all series; wrap/stack series legend; adjust label density, not underlying data; reveal full values in data table | Identify each series in text and, where feasible, line style/markers; focused/keyboard equivalent to hover tooltips; descriptive chart name | Not tested |
| `CaseTable` | **Extend / bounded narrow-row variant** without changing case model | Wide semantic table; narrow labeled field-stack rows if semantic/accessibility tests support it; otherwise contained horizontal scroller with evident affordance | Status, owner, due date, row identity, and *all* row actions reachable with keyboard/touch; actions shown at rest; stable names and focus | Not tested |
| `SectionHeading` | **Reuse** for consistent section hierarchy | Text wraps; no fixed one-line requirement | Semantic, ordered headings; optional actions do not interrupt reading logic | Not tested |
| `DisclosurePanel` | **Reuse only** for optional data/table detail if it improves comprehension | Disclosure contains a chart data table or supplementary explanation; controls remain visible | Button with accessible name and expanded state; Enter/Space toggle; associated region; logical focus on open/close | Not tested |

**Reuse sequence:** reuse → extend → variant → compose → new. Compose existing `SectionHeading`, charts, and `DisclosurePanel` for optional textual chart-data views before proposing a new primitive. **No new reusable component is justified yet.** A shared chart-data-view primitive should be considered only if inspection shows neither chart can expose equivalent data using its existing contract or composition; the actual API is unknown.

### Narrow chart and legend rules

1. Keep chart drawing area and legend in separate layout tracks so text cannot overlay data marks. Use placement (side on wide, below on narrow), not absolute positioning over the plot.
2. Show exactly five revenue categories in the composition legend; use full category names in a compact external list. Preserve original category/value mapping, but do not invent names, values, percentages, or ordering beyond source data.
3. Keep **all** service-revenue series available. If line and label density makes direct reading unreliable, use the data table, structured series keys, and a focused series inspection mechanism. Do not silently drop, aggregate, or switch off series. Any optional series visibility toggles must be labeled, keyboard-operable, indicate selection, and have a clear restore-all path; they are not assumed to exist.
4. Ensure each chart has an accessible name, short description of its purpose, and a keyboard-reachable **View data** disclosure or equivalent table. Table headers identify categories/time points and series; unavailable values remain unavailable rather than estimated. Display chart-value units and date granularity only when actual source data provides them.
5. If interactive chart points exist, hover tooltips must have focus/touch equivalents and must not be the only means to retrieve information. If labels cannot fit inside the plot, reposition/simplify them and rely on the accessible data view, without erasing data.

### Cases table rules

- On wide layouts use a real table with column headers for the supplied fields, plus row-identifying context as available. Preserve current row order unless the product specifies a sort.
- At narrow **container** widths, first test a labeled row-stack composition displaying each case's status, owner, due date, and actions, with the case identity available if supplied. Preserve a coherent semantic association per row. Do not pretend cards are an accessible table unless they retain correct structure and navigation.
- If comparative table scanning, keyboard semantics, or content volume make row-stacking unsuitable, keep a native table in a **bounded, keyboard-scrollable horizontal region** with a visible cue such as “Scroll case table horizontally to see more columns.” Do not create a second horizontal scrollbar for the whole page. Avoid sticky elements obscuring focus or columns.
- Show primary and secondary actions as labeled buttons/links at rest; if a bounded overflow menu is used, its **menu trigger is always visible**, with all row actions reachable by touch and keyboard. Do not replace hover-only actions with an equally invisible tap target. Existing action labels/destinations must be carried through unchanged unless separately approved; none are supplied here.
- Preserve existing sorting, filtering, selection, pagination, and empty/error behaviors **if present**; their existence is unknown and must be audited before implementation.

### Navigation, focus, overlays, and states

- **Reading and focus order:** One logical sequence matching the proposed hierarchy, and within observations #1 → #4. Visual multi-column placement must not scramble screen-reader or keyboard order. Evidence link follows its own observation's content in logical tab sequence. Table action order remains row-local.
- **Keyboard and non-hover:** All links, disclosure triggers, chart alternative controls, table scroll affordances, and row actions must be operable without pointer hover. Native interactive elements preferred; Enter activates links/buttons, Space activates buttons, and Escape closes an actual dismissible popup if one exists. Avoid custom keyboard patterns unless the UI genuinely requires them.
- **Focus visibility and restoration:** Visible focus indicator must not be clipped by containers; after closing a row-action popup or disclosure-derived dialog (if used), return focus to the launching control. Opening a disclosure should not unexpectedly move focus; removed/reflowed nodes must not lose the active control.
- **Popup bounds:** If actions use menus/popovers, keep them within mobile/panel bounds, prevent clipping, provide a labeled trigger and expanded state, and make dismissal/return focus predictable. Modal scroll locking applies only to an actual modal, not to normal disclosures.
- **Touch and target size:** Size and separate interactive controls sufficiently for touch, and test hit regions and label clarity at 320 px; exact current target measurements are unavailable.
- **Motion:** Do not require animation to understand changes; respect reduced-motion preferences for chart transitions and disclosures.
- **Loading, empty, and error states:** Retain section identity and explain unavailable data. Avoid representing missing observations, chart values, or case details as zero; preserve controls needed to retry or access available information where the application supports them. Verify each state rather than asserting existing support.

## 4. Single-screen desktop trade-off

The product owner's six-module / **1366 × 768** no-scroll preference is **not established as feasible**. Four variable-length observations, two charts with legible legends, and a potentially long table compete for vertical space. Forcing everything above the fold by truncating observation text, omitting cases, shrinking type, collapsing sections, or overlaying legends would conflict with task completion and supplied constraints.

**Proposed compromise:** Make account identity, four KPIs, and the beginning of the ordered observation sequence immediately findable; keep the remaining observations, charts, and cases in a predictable vertical flow with clear section headings. Use measured spacing efficiency and sensible multi-column chart layout only when tested. Accept desktop vertical scrolling when content pressure requires it. An optional sticky anchor/section navigation is **not** required and should not be added without evidence or a reuse audit.

**Decision gate:** Product owner must accept that no-scroll is a non-blocking aspiration, while **content completeness, no overlap/clipping, functional parity, and non-hover operability** are blocking requirements. A single-screen claim cannot be approved without a representative populated render and measurements.

## 5. Small validation plan (all results pending)

**Method:** After implementation, use representative source-backed fixture content (including all four observations, five categories, each existing trend series, several case rows, and the longest real labels available), inspect rendered widths at each scenario, and perform keyboard/manual accessibility checks. Any synthetic edge-case fixture must be clearly labeled *test data*, not customer evidence. Capture screenshots, overflow/scroll recordings, focus traces, and accessibility findings when tools and product access exist. No such tests were performed for this deliverable.

| Test / environment | Acceptance criteria | Planned method | Evidence / result | Owner |
|---|---|---|---|---|
| 1920 × 1080 | All six modules present in page; readable line lengths; charts/legends distinct; table actions visible | Rendered screenshot + content audit + keyboard pass | **Not tested**; no link | Design / frontend / QA (assignment pending) |
| 1366 × 768 | Content complete; no smaller type or deletion to force one screen; scrolling documented where needed | Screenshot + vertical scroll inspection + product-owner trade-off review | **Not tested**; no link | Product owner + design / QA (pending) |
| 390 CSS px | All six modules present; four ordered observations fully readable; chart legends not overlapping; case actions usable | Manual viewport and touch-emulation test; tab traversal | **Not tested**; no link | Frontend / QA (pending) |
| 320 CSS px | No text clipping/overlap; essential page reflows; only explicitly bounded component overflow allowed; controls usable | Screenshot/overflow inspection, keyboard test, long-label fixture | **Not tested**; no link | Frontend / QA (pending) |
| 200% desktop zoom | Reflow based on effective available width; no module disappears; focus and link/action access retained | Browser zoom, inspect scrolling and tab focus | **Not tested**; no link | Accessibility / QA (pending) |
| Narrow embedded panel | Responds to actual **panel/container** width on wide parent; no host clipping or lost focus | Embed in host or harness at variable container widths; inspect resize transitions | **Not tested**; host unknown | Frontend / integration QA (pending) |
| Long observation text + localization stress | Description, evidence link, question, KPI labels, and legend labels wrap without truncation | Content stress fixtures and manual inspection | **Not tested**; source content unknown | Content / QA (pending) |
| Chart equivalents, all series | Five composition categories and each available trend series represented and retrievable without hover/color alone | Compare chart labels/legend/data-view rows against same fixture; keyboard review | **Not tested**; series count unknown | Data / accessibility QA (pending) |
| Cases and actions | Status/owner/due/row actions retained on wide and narrow; each visible/actionable without hover; local scroll discoverable if used | Field-by-field coverage audit; touch + keyboard activation; focus return | **Not tested**; action set unknown | Product / accessibility QA (pending) |
| Empty/loading/error + disclosure/popup states | Labels, control access, focus, and graceful messaging survive responsive transition | State simulations, Enter/Space/Escape where appropriate, reduced-motion check | **Not tested**; existing states unknown | Frontend / accessibility QA (pending) |

### Validation sequence and decision gates

1. **Content / wireframe gate:** Confirm actual source data fields, observation order, links, chart series/values, case row actions, and all six modules map to the proposed structure. Reject any unintentional `Missing` status.
2. **Component-system gate:** Inspect actual component APIs and design tokens. Implement shared wrapping, legend separation, and non-hover action behavior at the reusable component/pattern layer, not through isolated page overrides; confirm no unnecessary new component.
3. **Responsive gate:** Test all named scenarios, plus at least one intermediate resizable width/container. Record the *measured* condition where each layout changes; distinguish proposed thresholds from observed ones. Check no overlap, unintended truncation, or unbounded page-level horizontal scroll.
4. **Interaction/accessibility gate:** Keyboard-only read-through, focus visibility/order/restoration, touch/non-hover actions, chart equivalents, understandable labels, and reduced-motion behavior. A formal accessibility conformance claim requires appropriate audit evidence not supplied here.
5. **Product gate:** Review the actual 1366 × 768 result and explicitly approve vertical scrolling if required. Record screenshots, deviations, owners, and unresolved risks; do not label the redesign complete before these checks.

### Blocking failures and rollback criteria

Block release or revert the affected component change if any required mobile section disappears; AI text/evidence/question is clipped; legend overlays data; a trend series or composition category is silently lost; case fields/actions disappear or become hover-only; keyboard focus is trapped/lost; or the embedded presentation is inaccessible due to clipping. An unmet no-scroll **preference alone** does not warrant reverting an otherwise readable, complete layout.

## 6. Assumptions, unknowns, and decisions awaiting evidence

| Topic | Current status | Required follow-through |
|---|---|---|
| Actual data and content lengths | **Unknown** | Audit production-like, appropriately authorized fixtures; no invented values |
| Current DOM reading order and navigation | **Unknown** | Inspect source; preserve existing task semantics and correct order if necessary |
| Component APIs, library behaviors, design tokens | **Unknown** | Audit before choosing extension/variant implementation |
| Exact adaptive breakpoints | **Hypothesis only** | Derive from rendered component pressure, document observed thresholds |
| Number of trend series / points, case count and actions | **Unknown** | Inventory each; verify content/action parity |
| Existing sorting, filtering, pagination, dialogs, loading states | **Unknown** | Preserve if present and test; do not invent features |
| Embedded host width, clipping, zoom interactions | **Unknown** | Test actual host/container, not only browser viewport |
| Screen-reader/browser/device support and conformance | **Untested** | Perform accessibility checks on implemented artifact |
| No-scroll at 1366 × 768 | **Stakeholder preference; feasibility unknown** | Review populated render; prioritize readability and completeness |
| Ownership and approval | **Unassigned** | Product owner approves trade-off; implementation/test leads assigned before release |

## 7. Deliverable validation status

- [x] Planning contract lists all required content and actions, including four ordered observations and both chart types.
- [x] Proposed responsive behavior covers 1920 × 1080, 1366 × 768, 390 CSS px, 320 CSS px, 200% zoom, and narrow embedded panel.
- [x] Non-hover and keyboard access, chart legends/data equivalents, table row actions, and no-scroll compromise are specified.
- [x] Existing components are considered before any hypothetical new component.
- [x] Facts, proposals, unknowns, and **not-tested** results are differentiated.
- [ ] Actual content and component inspection completed.
- [ ] Rendered/keyboard/touch/zoom/embedded tests passed.
- [ ] Accessibility and product-owner sign-off completed.

**Outcome:** A complete **proposed responsive behavior contract and executable validation plan**, not a validated redesign. No test passes, final breakpoints, production functionality, or implementation completion are asserted.
