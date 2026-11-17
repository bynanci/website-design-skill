#!/usr/bin/env python3
"""Measure native Chromium page zoom through actual X11 keyboard shortcuts."""
import hashlib
import json
import os
import re
import shutil
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import sync_playwright
from run_browser_qa import measurements, REQUIRED

ROOT = Path(os.environ.get("DASHBOARD_SPECIMEN_ROOT", str(Path(__file__).resolve().parents[1]))).resolve()
OUTPUT = Path(os.environ.get("DASHBOARD_QA_OUTPUT", str(ROOT / "evidence")))
OUTPUT.mkdir(parents=True, exist_ok=True)
ENTRY = (ROOT / "specimen/index.html").as_uri()


def geometry(page):
    return page.evaluate("""() => ({innerWidth,innerHeight,outerWidth,outerHeight,
      devicePixelRatio,visualScale:visualViewport.scale,
      scrollWidth:document.documentElement.scrollWidth,
      screenWidth:screen.width,screenHeight:screen.height})""")


def key(chord):
    subprocess.run(["xdotool", "key", "--clearmodifiers", chord], check=True, timeout=5)


def main():
    started = time.monotonic()
    max_seconds = float(os.environ.get("DASHBOARD_MAX_SECONDS", "120"))
    report = {"method": "Headed Chromium, no viewport emulation; Xvfb/XTest Ctrl+0 then Ctrl++ keyboard shortcuts", "passed": False,
              "captured_at": datetime.now(timezone.utc).isoformat(), "before": None, "after": None,
              "steps": [], "themes": [], "not_run": ["Physical display, touch device, screen reader and native Tauri shell"]}
    try:
        if int(os.environ.get("DASHBOARD_MAX_CAPTURES", "2")) < 2:
            raise RuntimeError("Native zoom requires a two-capture budget.")
        if not os.environ.get("DISPLAY") or not shutil.which("xdotool"):
            raise RuntimeError("Native zoom requires DISPLAY and xdotool; no viewport proxy is substituted.")
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=False,
                executable_path=os.environ.get("DASHBOARD_CHROMIUM_EXECUTABLE"),
                args=["--window-size=1366,900", "--force-device-scale-factor=1"])
            report["chromium"] = browser.version
            context = browser.new_context(no_viewport=True, reduced_motion="reduce")
            page = context.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.goto(ENTRY, wait_until="load")
            page.wait_for_function("window.__DASHBOARD_READY__ === true")
            title = page.title()
            found = subprocess.check_output(["xdotool", "search", "--onlyvisible", "--name", re.escape(title)], text=True, timeout=5).splitlines()
            if not found:
                raise RuntimeError("Cannot identify the real Chromium window.")
            window = found[-1]
            subprocess.run(["xdotool", "windowfocus", "--sync", window], check=True, timeout=5)
            key("ctrl+0")
            page.wait_for_timeout(150)
            before = geometry(page)
            report["before"] = before
            if not 0.98 <= before["devicePixelRatio"] <= 1.02:
                raise RuntimeError("Cannot establish an unzoomed 100% baseline.")
            for _ in range(8):
                key("ctrl+plus")
                page.wait_for_timeout(100)
                observed = geometry(page)
                report["steps"].append(observed)
                if observed["devicePixelRatio"] / before["devicePixelRatio"] >= 1.98:
                    break
            after = geometry(page)
            report["after"] = after
            ratio = after["devicePixelRatio"] / before["devicePixelRatio"]
            assert abs(ratio - 2) <= 0.03, f"Expected native page zoom 2x; observed ratio {ratio}"
            assert abs(after["outerWidth"] - before["outerWidth"]) <= 2, "Outer window changed instead of page zoom"
            assert abs(after["visualScale"] - 1) <= 0.02, "Pinch/visual scaling is not native page zoom"
            assert abs(after["innerWidth"] * 2 - before["innerWidth"]) <= 3, "Effective CSS viewport did not halve"
            for theme in ("light", "dark"):
                page.evaluate("theme => __DASHBOARD_FIXTURE__.setTheme(theme)", theme)
                page.wait_for_timeout(100)
                observed = measurements(page)
                assert observed["page"]["scrollWidth"] <= observed["viewport"]["width"] + 1, "Native-zoom horizontal overflow"
                assert observed["requiredContentPresent"], "Native zoom lost required data"
                for selector in REQUIRED:
                    assert page.locator(selector).count() > 0, f"Missing {selector}"
                donut, legend = observed["donut"], observed["legend"]
                overlap = donut["left"] < legend["right"] and donut["right"] > legend["left"] and donut["top"] < legend["bottom"] and donut["bottom"] > legend["top"]
                assert not overlap, "Native zoom chart and legend overlap"
                for selector in (".direction-btn", "#note-form .primary-btn", "#theme-toggle"):
                    assert page.locator(selector).first.is_visible(), f"Native zoom action hidden: {selector}"
                if time.monotonic() - started > max_seconds:
                    raise TimeoutError("Native zoom time budget exhausted")
                filename = f"native-zoom-200-{theme}.png"
                page.screenshot(path=str(OUTPUT / filename), full_page=True, animations="disabled")
                report["themes"].append({"theme": theme, "measurements": observed, "capture": filename,
                    "sha256": hashlib.sha256((OUTPUT / filename).read_bytes()).hexdigest()})
            assert not errors, str(errors)
            report["page_errors"] = errors
            report["passed"] = True
            key("ctrl+0")
            context.close()
            browser.close()
    except Exception as error:
        report["error"] = {"type": type(error).__name__, "message": str(error)}
    finally:
        report["elapsed_seconds"] = time.monotonic() - started
        report["source_digests"] = {f"specimen/{p.name}": hashlib.sha256(p.read_bytes()).hexdigest()
            for p in sorted((ROOT / "specimen").glob("*")) if p.is_file()}
        report["runner_sha256"] = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
        (OUTPUT / "native-zoom-results.json").write_text(json.dumps(report, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    if not report["passed"]:
        raise SystemExit("Native zoom unavailable or failed; inspect native-zoom-results.json")
    print("Actual native Chromium 200% page zoom passed in light/dark themes.")


if __name__ == "__main__":
    main()
