# Dashboard Chromium QA

Install Playwright and its Chromium runtime:

    python -m pip install 'playwright==1.56.0'
    python -m playwright install --with-deps chromium
    npm install --no-save --no-package-lock axe-core@4.10.3
    python examples/responsive-dashboard/qa/run_browser_qa.py

Run this script from the repository root, or use the "Dashboard specimen
browser QA" GitHub workflow. It renders the **public synthetic** HTML
specimen via file://, writes viewport/full-page screenshots, and emits
machine-readable evidence to examples/responsive-dashboard/evidence/.
The GitHub workflow uploads the screenshots and raw JSON as an artifact.

The JSON records SHA-256 digests for the three specimen sources and the QA
runner, plus the actual Python, Playwright, Chromium and axe-core versions.
GitHub Actions metadata identifies the checkout and run when available. Use
the digests to check local edits; a commit label alone cannot identify them.
If setup or launch fails, `qa-results.json` records `passed: false`, the
execution error and completed-case count; missing results are not passes.

To use an existing Chromium executable in a local environment, set
`DASHBOARD_CHROMIUM_EXECUTABLE=/absolute/path/to/chromium`. The override is
recorded in the evidence and is not equivalent to the CI browser version.
Use `DASHBOARD_QA_OUTPUT=/absolute/output/path` to keep generated captures
outside the source tree.

Test matrix: 1920x1080, 1366x768, 768 CSS px, 390 CSS px, 320 CSS px,
narrow embedded 360 CSS px container, a 683 CSS px effective-width
proxy for 200% zoom, and a 320px long-content stress case. The proxy is
not a native browser zoom test; stress content is synthetic DOM injection.

Checks: no global horizontal overflow, chart/legend non-overlap,
content parity, two visual directions, accessible chart data tables,
arrow-key roving (one Tab stop per chart), keyboard Enter/Escape dialog and
focus restoration, visible mobile shortcut, minimum primary touch-control
height, local-only notes state. A pinned axe-core 4.10.3 WCAG A/AA tagged
scan runs against 1366px, 390px and 320px.

For full recorded evidence, see [2026-11-16 review](../output/qa-review-2026-11-16.md).
No screen reader, physical device, actual 200% browser zoom, network
performance, full automated accessibility coverage, or WCAG certification
is claimed. Humans still need to inspect screenshots and usability.
