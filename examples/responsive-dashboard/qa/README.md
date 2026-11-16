# Dashboard Chromium QA

Install Playwright and its Chromium runtime:

    python -m pip install 'playwright==1.56.0'
    python -m playwright install --with-deps chromium
    python examples/responsive-dashboard/qa/run_browser_qa.py

Run this script from the repository root, or use the "Dashboard specimen
browser QA" GitHub workflow. It renders the **public synthetic** HTML
specimen via file://, writes viewport/full-page screenshots, and emits
machine-readable evidence to examples/responsive-dashboard/evidence/.
The GitHub workflow uploads the screenshots and raw JSON as an artifact.

Test matrix: 1920x1080, 1366x768, 768 CSS px, 390 CSS px, 320 CSS px,
narrow embedded 360 CSS px container and a 683 CSS px effective-width
proxy for 200% zoom. The proxy is not a native browser zoom test.

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
