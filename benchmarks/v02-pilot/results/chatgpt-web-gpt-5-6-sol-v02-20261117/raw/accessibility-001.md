# Accessibility Remediation Plan — Case 001

## Scope and evidence boundary

This plan is based only on the reported defects and the packet guidance. It does **not** change business content and does **not** claim WCAG conformance.

No contrast measurements, screen-reader transcripts, automated scan results, browser/assistive-technology matrix, or public conformance audit were provided. Accordingly:

- **Reported defects** below are treated as observed tester findings.
- **Plausible causes** are hypotheses only until implementation inspection or testing confirms them.
- **Proposed fixes** target the highest reusable layer available, following `reuse → extend → variant → compose → new`.
- **Validation results are not claimed**; all checks below remain required unless explicitly marked as already reported by testers.

## Prioritization model

Priority is based on whether a defect blocks or materially impairs a core interaction, prevents users from perceiving essential information, or creates a recurring failure through a shared component.

- **P0 — Blocking interaction / form access:** remediate before visual polish.
- **P1 — Essential information or navigation is not equivalently available:** remediate in the same accessibility pass.
- **P2 — Important preference/resilience issue:** remediate before release and validate across motion settings.

## Prioritized remediation matrix

| Priority | Reported defect | Responsible reusable layer | Plausible cause — not yet verified | Proposed shared-layer remediation | Keyboard checks | Screen-reader checks | Visual checks | Automated / code checks still required |
|---|---|---|---|---|---|---|---|---|
| **P0** | Filter dialog opens while keyboard focus remains behind it. | `FilterDialog` | Dialog may not move focus to an appropriate element on open; modal semantics or focus containment may be incomplete. | Extend `FilterDialog` so opening it moves focus into the dialog to a predictable initial target, keeps keyboard interaction within the active modal while open, and exposes appropriate dialog semantics/name. Do not patch only this page. | Open using keyboard; verify focus immediately enters dialog; Tab/Shift+Tab traverse intended interactive elements without moving behind it; Escape behavior is verified if supported by the product interaction. | Verify dialog is announced with its accessible name/role and that reading/navigation starts in a sensible place inside the dialog. Confirm background content is not presented as the active interaction context while the modal is open. | Confirm a visible focus indicator is present on the initial and subsequent focus targets; dialog remains visually distinguishable from background at supported layouts/zoom. | Inspect rendered semantics and focus-management implementation; run an accessibility scan for dialog/name issues where supported. Automated results alone are insufficient for focus order/containment. |
| **P0** | After closing the dialog, focus does not return to the trigger. | `FilterDialog` | Trigger reference may not be retained, or close behavior may move focus to document start/body or leave focus undefined. | Make focus restoration part of the `FilterDialog` contract: on normal close, return focus to the control that opened it, unless that control no longer exists or a documented workflow requires another destination. | Open dialog from trigger, close by every supported method, and confirm focus returns to that trigger and keyboard flow can continue. | Confirm the returned trigger is announced clearly and no unexpected context jump occurs. | Confirm restored focus is visibly indicated and not obscured. | Unit/integration check for trigger capture and restoration can supplement manual testing; actual focus behavior still requires rendered manual verification. |
| **P0** | Form field has placeholder text but no visible or programmatic label. | `TextField` | Placeholder may be functioning as the only prompt; component API may permit unlabeled fields. | Extend `TextField` so a usable label is a required part of the component contract. Support a visible label by default; if a deliberately non-visible label variant is needed, require an explicit accessible name rather than relying on placeholder text. Preserve the existing business field meaning. | Tab to field; verify focus order and that the field remains operable when placeholder disappears after entry. | Verify the field is announced with its intended label/name, purpose, value, and any required/error state that exists. Placeholder should not be the sole accessible name. | Verify a persistent visible label is present for the reported case; focus, entered text, errors, and disabled states remain legible. | Run form-label/name checks in automated tooling; inspect component API to prevent unlabeled instances. Confirm no duplicate/conflicting accessible names. |
| **P1** | Revenue trend tooltip opens only on mouse hover; no keyboard path. | `TrendChart` | Tooltip trigger may be bound only to pointer hover; chart marks may not be keyboard focusable or may lack a non-hover information path. | Extend `TrendChart` so every essential value currently exposed via hover has an equivalent keyboard-accessible path. Prefer a bounded, reusable chart interaction pattern: focusable data points/series where appropriate, with focus-triggered detail, plus a non-pointer method to obtain the same information. If the visual chart cannot provide robust semantic access alone, provide an accessible textual/table representation of the same data. | Reach chart information without mouse; traverse interactive points/series in a predictable order; open/read detail using keyboard; dismiss/move on without trapping focus. | Verify chart purpose and data are understandable; focused data points or the alternative representation expose category/time/value information in meaningful order; tooltip content is not hover-only or pointer-only. | Verify focused chart elements have clear focus treatment; tooltip/detail remains visible while keyboard focus requires it; content is not clipped at zoom/narrow containers. | Inspect event handlers for pointer-only logic; automated tools may identify some focusability/name issues but cannot establish that the data experience is complete or usable. |
| **P1** | Pie chart uses color alone to identify categories. | `PieChart` | Category distinction may rely solely on slice fill colors; legend/labels may not provide persistent textual or patterned differentiation. | Extend `PieChart` so category identity is communicated with text in a legend and/or direct labels, with a clear mapping from each category to its value. Color may remain supplementary, not exclusive. Where needed, expose the data through an accessible list/table representation. | If legend/slices are interactive, verify all actions and category details are keyboard reachable; if non-interactive, ensure keyboard is not unnecessarily required to understand the data. | Verify categories and values are announced without needing color interpretation and that relationships are understandable in a sensible reading order. | Test in grayscale/high-contrast-like viewing and with color perception differences in mind; verify labels/legend alone identify categories and remain readable/reflow correctly. | Static/code review can detect presence of legend/labels but not whether color is truly non-essential. Automated contrast checks require actual rendered colors and measurements, which are currently missing. |
| **P1** | Evidence-source text link is visually present, but its label is only “here”. | `Link` plus page composition/content binding | Link component may allow non-descriptive accessible names; page composition may supply an ambiguous label without surrounding semantic context sufficient to identify purpose. | Preserve the evidence-source destination and business meaning, but change the rendered link text/accessibility name to identify its purpose or destination in context (for example, the evidence/source itself rather than “here”). Add a `Link` usage rule that link names must be meaningful in context and should not depend on generic “here/click” wording. | Tab through links and verify the evidence link can be identified from its focus state and name without needing mouse hover. | Review links in sequence/list-of-links navigation and confirm this link’s purpose is distinguishable from other links. | Verify descriptive text fits/refows without truncating essential meaning and retains visible focus treatment. | Automated tools may flag generic link text but cannot guarantee contextual clarity; include a link-name lint/review rule if the implementation stack supports it. |
| **P2** | Decorative loading animation has no reduced-motion behavior. | `LoadingIndicator` | Animation may run unconditionally and may not react to the user’s reduced-motion preference; decorative status may also be conflated with status messaging. | Extend `LoadingIndicator` with a reduced-motion state that removes or substantially reduces non-essential decorative movement while preserving any required loading/status meaning. Keep decorative animation separate from semantic status text where applicable. | Verify loading does not steal focus and that keyboard interaction remains stable while loading begins/ends. | If the indicator conveys status, verify that status is announced appropriately without excessive repetition; if purely decorative, verify it is not announced as meaningful content. | Enable reduced-motion preference and confirm decorative motion is removed/reduced; verify a clear non-motion loading state remains. Also check default motion does not obscure content or create layout shift. | Inspect reduced-motion style/logic and animation properties. Automated scan may not establish the quality of the fallback; manual preference testing is required. |

## Shared component contracts to update

### `FilterDialog` — Extended

**Responsibility:** Own modal dialog semantics, opening/closing behavior, focus entry, focus containment, and focus restoration.

**Required interaction contract**
- Trigger: existing filter control.
- Open response: render/show dialog and place focus on a documented initial target inside it.
- Keyboard: logical Tab/Shift+Tab traversal; no interaction with controls behind the active modal; support documented close controls consistently.
- Close response: restore focus to the opening trigger in the normal case.

**Accessibility contract**
- Dialog has an accessible role and name.
- Visible focus is retained throughout interaction.
- Background content is not the active keyboard interaction context while modal is open.
- Narrow/zoom layouts do not place focused controls outside usable dialog bounds.

### `TextField` — Extended

**Responsibility:** Own the field control, persistent label/name association, and field states.

**Accessibility contract**
- Label/name is required by the API.
- Placeholder is supplemental, never the only label.
- Visible label is the default for the reported form case.
- Required, error, disabled, and value states must remain available to keyboard and assistive technology when those states exist.

### `TrendChart` — Extended

**Responsibility:** Present trend data with equivalent pointer, keyboard, and non-visual access to essential values.

**Accessibility contract**
- Essential data is not hover-only.
- Keyboard users can obtain the same trend/detail information.
- Focused interactive chart elements have visible focus.
- A semantic/textual alternative is available if the chart geometry alone cannot communicate the dataset reliably.
- Narrow-container behavior must preserve labels, detail access, and full data discovery.

### `PieChart` — Extended

**Responsibility:** Present category proportions without depending on color alone.

**Accessibility contract**
- Category names and values are available in text.
- Color is supplementary.
- Legend/direct-label mapping remains understandable without hue perception.
- Data remains available in a sensible reading order and, where necessary, through an accessible textual/table equivalent.

### `Link` — Usage rule / bounded extension

**Responsibility:** Expose a clear navigation/action name and visible focus state.

**Accessibility contract**
- Generic labels such as “here” are not sufficient when they do not identify purpose.
- Link purpose should be understandable in its context and remain distinguishable during sequential assistive-technology navigation.
- Do not override visible text with a conflicting accessible name.

### `LoadingIndicator` — Extended

**Responsibility:** Communicate loading state while keeping decorative motion optional.

**Accessibility contract**
- Decorative motion has a reduced-motion fallback.
- Loading behavior does not take keyboard focus unless an explicit workflow requires it.
- Semantic status messaging, if present, is separate from decorative visuals and should avoid repetitive announcements.

## Page-level composition plan

No business content or information architecture change is required by the supplied evidence. The account/analytics page should continue using the existing content and preferred components, but compose the remediated shared variants:

| Page area | Existing component | Action | Reason |
|---|---|---|---|
| Revenue trend | `TrendChart` | **Extend shared component, then reuse** | Keyboard-equivalent detail access is a recurring chart responsibility. |
| Category pie chart | `PieChart` | **Extend shared component, then reuse** | Textual category identification belongs to the chart contract, not a one-off page patch. |
| Filters | `FilterDialog` | **Extend shared component, then reuse** | Modal focus lifecycle must be consistent everywhere the dialog is used. |
| Form field | `TextField` | **Extend shared component, then reuse** | Label requirement should prevent future unlabeled fields. |
| AI evidence source | `Link` | **Reuse with corrected descriptive content; add usage guardrail** | Destination/business meaning is preserved; only the ambiguous link label is corrected. |
| Loading state | `LoadingIndicator` | **Extend shared component, then reuse** | Reduced-motion behavior should apply consistently across loading states. |

No new component is justified by the supplied case facts.

## Validation plan

### 1. Keyboard-only manual pass

Run the complete page without a pointing device.

Required checks:
- Every interactive control is reachable in a logical order.
- Trend data currently available by hover can be obtained by keyboard.
- Filter dialog receives focus on open, does not allow focus to remain behind it, and restores focus to its trigger on close.
- Text field is operable with a persistent label.
- Evidence-source link has a meaningful focus-visible label.
- Loading transitions do not steal or lose focus.
- All focus indicators are visible and not clipped/obscured at tested layouts.

### 2. Screen-reader manual pass

Use at least one supported browser/screen-reader combination once the project’s actual support matrix is known.

Required checks:
- Dialog role/name/context are announced and reading interaction is scoped appropriately while open.
- Focus restoration after dialog close is understandable.
- Text field has the intended name and relevant state information.
- Trend and pie-chart purpose, categories, values, and relationships can be understood without visual color/hover cues.
- Evidence link purpose is distinguishable in sequential link navigation.
- Loading status is announced only if semantically required; decorative animation is not exposed as meaningful content.

### 3. Visual and responsive manual pass

Test rendered output rather than inferring behavior from code alone.

Required checks:
- Persistent text labels are visible and do not disappear when fields contain values.
- Pie-chart categories remain identifiable without color, including grayscale-style inspection.
- Keyboard focus is clearly visible on chart controls/data, dialog controls, fields, and links.
- Tooltip/detail content is not clipped or pointer-dependent.
- At narrow containers, zoomed layouts, and long text, chart legends/labels and dialog controls remain usable.
- With reduced-motion preference enabled, decorative loading movement is removed or substantially reduced while loading state remains understandable.

Candidate scenarios from the packet’s responsive guidance should include wide desktop, laptop, mid-width/split view, narrow mobile, minimum reflow candidate, 200% zoom, long text/localization, and embedded narrow containers. These are test scenarios, not asserted product breakpoints.

### 4. Automated and static validation

Use automated checks as supporting evidence, not as a replacement for manual interaction testing.

Check where tooling supports it:
- form controls have programmatic names/labels;
- dialog exposes a valid accessible role/name relationship;
- interactive chart elements, if used, have names/roles/states and are not pointer-only;
- links have non-empty, non-generic accessible names where detectable;
- duplicate IDs or broken label associations are absent;
- obvious semantic accessibility violations are absent;
- reduced-motion styles/logic exist for `LoadingIndicator`;
- component tests cover dialog focus entry/restoration and required `TextField` label props.

Automated checks **cannot by themselves establish** usable focus order, successful focus trapping/restoration, comprehensible chart data, non-color dependence, appropriate reduced-motion quality, or overall conformance.

## Missing verification evidence

The following evidence is unavailable and must remain explicitly open:

1. **Rendered contrast measurements** for text, controls, focus indicators, chart labels/legend, tooltip content, and dialog surfaces.
2. **Screen-reader transcripts or observed results**, including the actual browser/screen-reader combinations tested.
3. **Automated accessibility scan output** and tool/version details.
4. **Supported browser, device, operating-system, zoom, and assistive-technology matrix.**
5. **Rendered keyboard test evidence** for focus order, chart operation, dialog containment, and focus restoration.
6. **Reduced-motion test evidence** with the user preference enabled.
7. **Responsive/reflow evidence** at narrow containers and 200% zoom, especially for charts and the dialog.
8. **Color-perception/non-color-dependence evidence** for the pie chart after remediation.
9. **Implementation inspection** confirming the actual root cause of each reported defect; the causes listed in this plan are hypotheses.
10. **Public or independent conformance audit.** None was provided, so no WCAG conformance statement should be made.

## Risks and assumptions

- The preferred components named in the case are assumed to be reusable shared components, but their current APIs and internal semantics were not provided.
- The page’s exact business workflow, chart dataset shape, filter contents, field purpose, and evidence-source destination were not provided; this plan preserves them rather than inventing replacements.
- The dialog’s intended close methods are not specified. Validate every close method the product actually supports.
- The trend tooltip may contain essential or supplementary data; because the reported defect says keyboard users have no path, the remediation should ensure equivalent access to any information needed to understand or operate the chart.
- No measured color values were supplied. The pie-chart fix addresses color-only identification, but contrast cannot be evaluated from the case facts.
- “Modern, visually refined” styling should proceed only after these interaction and semantic contracts are stable; visual polish must not reintroduce hover-only, color-only, hidden-label, focus, or motion regressions.

## Release gate / validation checklist

Do not mark the remediation complete until observed evidence exists for the following:

- [ ] `FilterDialog` moves focus inside on open.
- [ ] Keyboard focus cannot remain on or move to controls behind the active modal.
- [ ] `FilterDialog` restores focus to its trigger after normal close.
- [ ] `TextField` has a persistent visible label for this case and a valid programmatic name.
- [ ] `TrendChart` exposes essential tooltip/detail information without requiring mouse hover.
- [ ] `PieChart` category identity and values are understandable without color alone.
- [ ] Evidence-source link has a descriptive purpose/name instead of “here”.
- [ ] `LoadingIndicator` has a verified reduced-motion fallback.
- [ ] Visible focus is present and usable for all affected interactive elements.
- [ ] Narrow-container, reflow, and 200% zoom behavior has been manually checked.
- [ ] At least one supported screen-reader/browser combination has been manually checked.
- [ ] Automated/static checks have been run and findings triaged.
- [ ] Contrast has been measured on the rendered design.
- [ ] Any failures discovered during validation are corrected at the highest reusable layer possible.
- [ ] No claim of WCAG conformance is made unless a separate, sufficiently scoped conformance evaluation establishes it.

## Validation status

**Current status: Plan complete; remediation not implemented or validated.**

The tester-reported defects are the only observed accessibility evidence supplied. All proposed causes, fixes, and validation outcomes remain to be confirmed in the actual implementation and rendered experience.
