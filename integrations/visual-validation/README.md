# Rendered Visual Validation Adapter

[繁體中文版本](README.zh-TW.md)

Status: **proposed integration contract; documentation only**. No Playwright runner, screenshot service, vision model, or automatic code-fix loop is implemented by this document.

## Purpose

Close the gap between a design or code proposal and what the browser actually renders:

```text
inspect project → implement proposal → run permitted command
→ render known states → capture evidence → review findings
→ apply bounded correction → capture again
```

Each step is optional and capability-gated. If the environment cannot run the app, control a browser, or inspect an image, mark that step `not run`; continue with the evidence that is available.

## Evidence levels

Keep these claims separate:

- **Specified:** a layout, behavior, or contrast requirement was written down.
- **Rendered:** a named route/state was captured in a named browser/runtime and viewport.
- **Measured:** a check produced a numeric result, such as overflow bounds or a contrast ratio.
- **Visually reviewed:** a human or an available vision-capable reviewer inspected the actual capture.
- **Fixed and re-rendered:** a change was applied and the same condition was captured again.

A proposed implementation or screenshot does not, by itself, establish accessibility, cross-device correctness, or production performance.

## Bounded review flow

1. **Discover the project command.** Read its package scripts and existing test configuration. Use the documented command and repository dependencies. Do not install packages, contact external services, or run an untrusted shell command implicitly.
2. **Set a local target.** Use a local development server, an explicit route, and synthetic or approved data. Keep logs and screenshots free of tokens, environment dumps, and unnecessary personal or customer data.
3. **Capture representative states.** Use the project's supported viewports, narrow containers, zoom levels, light/dark themes, keyboard focus, and important empty/loading/error states. Record which states were omitted.
4. **Run deterministic checks where available.** Check viewport/container overflow, clipped controls, console errors, focus reachability, semantic names, and project-configured accessibility checks. Numeric contrast claims require measured foreground/background colors and the stated contrast method; visual impression alone is not a measurement.
5. **Review the actual image.** A vision-capable reviewer may identify hierarchy, alignment, overlap, truncation, and theme issues from the captured image. If no such capability exists, report that visual review was unavailable; do not simulate a vision result from source code.
6. **Make a bounded correction.** Tie each proposed fix to a finding and source location. Limit retries to the agreed iteration budget, then report remaining issues rather than looping indefinitely.
7. **Capture again.** Use the same route, data, viewport, theme, and runtime so the before/after comparison is meaningful.

Playwright can capture screenshots and compare them with stable baselines; its documentation also notes that render output can vary by operating environment. Treat screenshot diffs as review evidence, not as a substitute for semantic and interaction checks. See [Playwright screenshots](https://playwright.dev/docs/screenshots) and [visual comparisons](https://playwright.dev/docs/test-snapshots).

## Multi-condition acceptance matrix

Extend the reproducible specimen in Issue #7 rather than creating a second
unrelated dashboard runner. Freeze source revision, fixtures, fonts, locale,
clock/animation policy and runtime for each run. Isolate browser contexts and
application data when running conditions concurrently.

The initial candidate matrix is:

| Condition | Example target | Evidence required |
|---|---|---|
| Desktop | 1920×1080 and 1366×768 CSS viewport | Required content/actions and chart labels remain accessible |
| Tablet | 768×1024 CSS viewport | Wrapping, order and input affordances |
| Narrow page | 390×844 and 320×800 CSS viewport | Content parity and justified scrolling |
| Narrow container | 320 CSS px card inside a wider page | Per-component layout; viewport-only rules are insufficient |
| Floating editor panel | 480×360 CSS viewport, synthetic pilot only | Toolbar/menu access; actual product minimum remains to be discovered |
| Theme/state | Supported themes, long labels, loading/empty/error/success | Contrast measurements, content and recovery paths |
| Input | Keyboard/focus and supported pointer/touch conditions | Focus/hover data parity, menus/dialogs and chart table equivalents |
| Browser zoom | 200% through a verified browser mechanism | Actual mechanism and effective viewport; mark unrun if unavailable |
| Native desktop | Claimed Tauri OS/WebView/window conditions | Actual shell behavior, recorded separately from web rendering |

These are proposed conditions, not captures or device results. Declare which
combinations are required and which remain unrun; avoid implying exhaustive
coverage from a few sample viewports.

Playwright [emulation](https://playwright.dev/docs/emulation) can configure
viewport, device scale, touch and color scheme. Device scale factor is not browser
zoom. A smaller viewport can expose reflow problems, but is not proof of actual
200% browser-zoom behavior. Browser rendering alone does not verify a Tauri
titlebar, OS menu or native dialog.

## Bounded responsive repair policy

A future pilot may allow at most **two automatic patch/recheck iterations**,
plus a configured wall-time/resource budget. Record the initial baseline and
every attempted correction, including rejected or reverted changes.

- Start with deterministic findings such as overflow, missing action reachability,
  chart-label collisions and focus loss; use actual image review for visual issues.
- Map findings to source and choose the highest appropriate reusable layer:
  token, component, pattern or page. Flex/grid/media/container-query choices
  require a content-based rationale.
- Preserve content, action access, semantic structure and state/API contracts.
  Do not resolve a failure by hiding data, disabling selection globally, clipping
  the document with overflow rules, shrinking text below the agreed minimum,
  relaxing thresholds or replacing a failing screenshot baseline.
- Route corrections through the bounded patch contract and existing host write
  authorization. Re-check the full declared matrix after a correction, not just
  the original failing size.
- Accept a candidate only when required deterministic checks pass and visual
  findings have recorded disposition. An unavailable required capability keeps
  the gate incomplete.
- Stop on exhausted budget, oscillation, new regression, ambiguous behavior or a
  protected-region change. Keep a known passing candidate when available; return
  unresolved findings and an explicit rollback/conflict record.

"Self-healing" describes this bounded repair experiment. It is not a guarantee of
perfect layout at every possible size or of accessibility certification.

## Review record

A future runner should preserve a compact record for every validation pass:

| Field | Example |
|---|---|
| source revision | commit SHA or working-tree identifier |
| command and route | repository script, local route |
| runtime | browser / WebView, OS, version if known |
| condition | viewport, zoom, theme, interaction state |
| input data | synthetic / approved fixture identifier |
| artifact | screenshot, trace, measurement output |
| finding | observed issue with location and severity |
| status | passed, failed, not run, or unverified |
| correction | code change and subsequent capture |

Do not commit screenshots containing confidential data without authorization.

## Data-dashboard pilot: research CSV

For author-study or test-log CSV input:

- inspect headers, types, units, missing values, duplicate identifiers, and row counts before choosing a chart;
- map each visual encoding to an explicit source column and aggregation rule;
- show denominators and sample sizes for completion or error rates;
- preserve participant privacy through the approved anonymization scheme;
- keep correlation and temporal sequence separate from causal conclusions;
- label unsupported comparisons and small samples as uncertain;
- retain a table or accessible textual equivalent for chart data;
- use the project's existing ECharts, D3, or chart wrapper when present; justify any new dependency.

Python may help with repeatable data checks, but the adapter must not require it when the project already has an appropriate data pipeline.

