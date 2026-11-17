# Dashboard browser QA

[繁體中文](README.zh-TW.md)

Run from the repository root. The runner renders the public synthetic specimen through `file://` and writes JSON, full-page captures and screenshot hashes.

```sh
python -m pip install 'playwright==1.56.0'
python -m playwright install --with-deps chromium
npm install --no-save --no-package-lock axe-core@4.10.3
python examples/responsive-dashboard/qa/run_browser_qa.py
```

This command runs the 32-condition matrix. Native browser zoom is a separate mechanism and is marked not run unless enabled.

## Native 200% page zoom

On Linux, install Xvfb, xdotool and ImageMagick, then run the same pipeline:

```sh
sudo apt-get install -y xvfb xdotool imagemagick
DASHBOARD_NATIVE_ZOOM=1 DASHBOARD_MAX_CAPTURES=40 DASHBOARD_MAX_SECONDS=480 \
  xvfb-run -a -s '-screen 0 1920x1080x24' \
  python examples/responsive-dashboard/qa/run_browser_qa.py
```

The helper launches headed Chromium without viewport emulation. It sends actual X11 Ctrl+0 / Ctrl++ keyboard shortcuts and checks doubled DPR, halved CSS viewport, stable outer-window width and visual scale 1. It captures the default editorial direction in light and dark themes: two native-zoom captures beyond the 32-condition matrix. ImageMagick captures the actual X11 browser window, including browser chrome and the visible viewport. The helper checks PNG pixel dimensions against the outer window; it does not use a CDP full-page raster for native zoom. A 683 CSS px width proxy remains a separately labeled condition and does not satisfy native zoom.

## Declared checks

- Twenty combinations: five widths (1920×1080, 1366×768, 768×1000, 390×844, 320×700), two directions and two themes.
- Twelve additional conditions: open dialog; chart/dialog/note keyboard interactions; width proxy; 360px embedded container; loading, empty, error and recovery; open/closed floating panel; emulated touch dialog; 320px long-copy stress.
- Content equality, chart/legend intersections, table-container bounds and declared control sizes.
- Separate chart/note instances with local props, tables, real pointer/focus values, keyboard navigation, notes submission and ID scope.
- Six axe-core scans: editorial at 1366/390/320 CSS px in both themes, using WCAG A/AA tags.
- Synthetic page-transition probes for persisted suspension/resume and nonpersisted disposal. They do not measure a real BFCache navigation.

## Evidence and controls

`qa-results.json` records specimen source digests, runner digest, actual runtime versions, Actions metadata, the declared/completed condition order, screenshot hashes, failures and raw Navigation/Paint Timing observations. `native-zoom-results.json` records the separate page-zoom mechanism and source hashes. Timing values are local observations, not a performance improvement or production budget.

Use `DASHBOARD_QA_OUTPUT` for an external output directory; `DASHBOARD_CHROMIUM_EXECUTABLE` for an installed Chromium; `DASHBOARD_HEADED=1` for a headed main matrix; and `DASHBOARD_SPECIMEN_ROOT` for a separate specimen directory that contains `specimen/`. The workflow uses a 40-capture / 480-second limit and preserves output on failure. Missing or failed conditions remain failures or explicit unrun evidence.

See [current evidence](../output/qa-review-2026-11-17.md) and [historical evidence](../output/qa-review-2026-11-16.md). Screenshot review, physical devices, screen readers, native Tauri, production networking and WCAG certification need separate evidence.

## Bounded repair experiment

Install the optional tools with `npm ci --ignore-scripts` under `integrations/vue-project-profile`. In the same Xvfb session, run the full QA command above, then:

```bash
node examples/responsive-dashboard/qa/run_bounded_repair.mjs
```

The runner requires the freshly passing reference and matching source, native helper and runtime hashes. It copies the fixture into an exclusive temporary workspace, injects `640px 640px` into the unique top-level `.mix-body` columns declaration, then restores only its reviewed value through PostCSS source coordinates. The canonical fixture is never changed.

`repair-contract.json` allows at most two edits, three matrix processes including the reference, 240 captures and 600 seconds. Every pass uses the same 32 conditions and native zoom helper. Evidence under `evidence/bounded-repair/` preserves the passing reference, failing baseline, candidate CSS/diff, processes, captures, measurements and final disposition. Missing conditions, source conflicts, regressions, oscillation or exhausted limits stop the experiment. A passing DOM result still requires separate image review. This is one reviewed restoration operation, not general layout generation; no external model is called.
