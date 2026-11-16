# Rendered Visual Validation Adapter

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

