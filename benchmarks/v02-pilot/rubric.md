# v0.2 pilot rubric

[繁體中文](rubric.zh-TW.md)

Version: `0.2-pilot.1`. Evaluator only. Do not include this file or the case `expected.md` files in a generation context.

This pilot evaluates planning artifacts for two optional cases. It has 18 criteria and a separate maximum of **36 points**. It does not change the frozen v0.1 40-point benchmark, award an official v0.1 score, or define a release threshold.

Score each criterion independently:

| Score | Meaning |
|---|---|
| 0 | Missing, contradicted, unsafe, or unsupported by the output. |
| 1 | Relevant but incomplete; an important behavior or verification step is absent. |
| 2 | Explicit, feasible behavior and a case-specific verification condition; evidence boundaries remain clear. |

A plan can earn 2 for an explicit acceptance criterion without claiming a test was run. Do not reward invented screenshots, measurements, user research or conformance. Preserve a quote from the unmodified output for every nonzero score. Use notes to explain omissions or a zero score. `completed` means generation and scoring finished; it does not mean the plan passed all criteria.

## Responsive layout — 18 points

| ID | Criterion | A score of 2 requires |
|---|---|---|
| RL-01 | Content parity | All six supplied modules remain accounted for at wide/narrow sizes, including evidence, contact details, observations and row actions. |
| RL-02 | Task priority | Account identity and actionable observations/evidence/questions stay easy to reach; supporting information has a justified order. |
| RL-03 | Desktop trade-off | The no-scroll request is treated as a preference; any compromise preserves readable type and content and has a review gate. |
| RL-04 | Narrow charts | Explicit legend reflow/disclosure, retained five-category/multiple-series meaning and an accessible figure/table alternative. |
| RL-05 | Narrow tables | An explicit scrolling/stacking/detail strategy keeps status, owner, due date and actions discoverable. |
| RL-06 | Input parity | Keyboard/focus, touch and non-hover paths cover charts, evidence, actions and disclosures. |
| RL-07 | Conditions | 1920×1080, 1366×768, 390/320 CSS px, 200% zoom and a narrow panel are specified as conditions; guessed breakpoints are not presented as measurements. |
| RL-08 | Component restraint | Reuse/extension of the supplied components is explicit; any new responsibility has a reuse justification. |
| RL-09 | Evidence honesty | Supplied defects, proposed behavior and untested rendered/device/accessibility outcomes remain distinct. |

Record critical errors separately:

- `required-content-hidden`: required information/actions are deleted or hidden to make the layout fit.
- `hover-or-color-only`: chart meaning or a required action remains available only through hover/color.
- `unsupported-success-claim`: the output claims measured, rendered, device or conformance success without evidence.

## Accessibility — 18 points

| ID | Criterion | A score of 2 requires |
|---|---|---|
| AX-01 | Tooltip access | A keyboard/focus path and persistent/tabular data alternative with a concrete check. |
| AX-02 | Chart meaning | Categories remain identifiable without color alone; theme/color-vision checks preserve meaning. |
| AX-03 | Dialog focus | Placement, applicable containment, Escape/close and trigger focus restoration each have checks. |
| AX-04 | Field label | A real visible/programmatic label is associated with TextField; placeholder is not the substitute. |
| AX-05 | Motion/status | Reduced-motion behavior retains meaningful loading/status communication and has a preference check. |
| AX-06 | Link name | The evidence-source link has an informative accessible name in context. |
| AX-07 | Reusable scope | Fixes belong to the observed shared component/token layers with a justified responsibility. |
| AX-08 | Verification | Relevant per-defect keyboard/manual/screen-reader checks are explicit; a generic audit is insufficient. |
| AX-09 | Evidence boundaries | Reported defects, suspected causes, proposed fixes and missing browser/contrast/conformance evidence remain distinct. |

Record critical errors separately:

- `missing-keyboard-path`: a supplied hover-only or mouse-only defect remains unresolved in the proposed behavior.
- `missing-dialog-focus-recovery`: the dialog plan omits focus handling/restoration or asserts a library guarantees it.
- `unsupported-conformance-claim`: the output claims accessibility conformance or a successful audit without evidence.

A total cannot cancel a critical error. Report criterion scores, critical findings and evidence gaps together. If independent clean runs share a critical failure, retain both outputs, review the platform-independent contract, and repeat the affected pilot after a documented version decision. Do not add product-specific rescue prompts to hide it.

## Review sequence

1. Verify the pinned source, identity, capability and isolation record before scoring.
2. Preserve raw generation bytes and their SHA-256 values before opening evaluator material.
3. Read the relevant case `expected.md` and this rubric only after generation.
4. Score each ID, retain supporting raw quotes, and record critical errors without averaging them away.
5. Run `python3 scripts/validate_v02_pilot.py` before accepting a record.
6. Compare at least two eligible independent execution contexts at criterion level. Report runner availability separately.

No completed real runs are bundled with this infrastructure. Unit-test records are synthetic test inputs and must never be submitted as agent evidence.
