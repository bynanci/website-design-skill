"""Smoke-test emitted static files over HTTP; optional Playwright dependency.

This validates deployment routing and basic production interactions. The frozen
Dashboard's full responsive/zoom/accessibility matrix remains a separate gate.
"""

import argparse
import functools
import hashlib
import json
import threading
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_arguments):
        pass


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def chart_keyboard_feedback(page):
    points = page.locator('[data-chart-point="mix"]')
    # Focus may scroll an SVG under a stationary pointer, whose mouseenter
    # then replaces the focused point's announcement. Isolate keyboard input.
    page.mouse.move(0, 0)
    points.first.scroll_into_view_if_needed()
    points.first.evaluate("node => { if (node === document.activeElement) node.blur(); }")
    points.first.focus()
    for index in (0, 1):
        fields = points.nth(index).get_attribute("aria-label").split("，")
        require(len(fields) == 3, "mix chart label must identify name, amount and share")
        expected = fields[0] + "：" + fields[1] + "，占 " + fields[2] + "。"
        page.wait_for_function("""({index, expected}) => {
          const points = [...document.querySelectorAll('[data-chart-point="mix"]')];
          return document.activeElement === points[index] &&
            points[index].getAttribute('tabindex') === '0' &&
            points.filter(point => point.getAttribute('tabindex') === '0').length === 1 &&
            document.querySelector('#mix-feedback').textContent === expected;
        }""", arg={"index": index, "expected": expected})
        if index == 0:
            page.mouse.move(0, 0)
            page.keyboard.press("ArrowRight")


def smoke(root, expected, report_root, chromium_executable=None):
    from playwright.sync_api import sync_playwright

    root = root.resolve(strict=True)
    manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
    available = manifest["dashboard"]["available"]
    require(isinstance(available, bool), "manifest dashboard availability must be boolean")
    require(available == (expected == "available"), "unexpected dashboard availability")
    report_root.mkdir(parents=True, exist_ok=True)
    handler = functools.partial(QuietHandler, directory=str(root))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    origin = f"http://127.0.0.1:{server.server_port}"
    report = {"passed": False, "dashboardAvailable": available, "manifestSha256": hashlib.sha256((root / "manifest.json").read_bytes()).hexdigest(), "http": [], "checks": [], "pageErrors": [], "consoleErrors": [], "failedRequests": []}
    try:
        public = [item["path"] for item in manifest["files"]] + ["manifest.json"]
        for name in public:
            with urllib.request.urlopen(origin + "/" + urllib.parse.quote(name), timeout=10) as response:
                content = response.read()
                media = response.headers.get_content_type()
                require(response.status == 200, f"HTTP status for {name}")
                expected_types = {".html": {"text/html"}, ".css": {"text/css"}, ".js": {"text/javascript", "application/javascript"}, ".json": {"application/json"}}[Path(name).suffix]
                require(media in expected_types, f"wrong MIME for {name}: {media}")
                require(content == (root / name).read_bytes(), f"HTTP body changed {name}")
                report["http"].append({"path": name, "status": response.status, "mime": media})
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(**({"executable_path": str(chromium_executable.resolve(strict=True))} if chromium_executable else {}))
            report["browserExecutable"] = str(chromium_executable) if chromium_executable else "Playwright-managed Chromium"
            report["browser"] = browser.version
            page = browser.new_page(viewport={"width": 1366, "height": 900}, reduced_motion="reduce")
            page.on("pageerror", lambda error: report["pageErrors"].append(str(error)))
            page.on("console", lambda message: report["consoleErrors"].append(message.text) if message.type == "error" else None)
            page.on("requestfailed", lambda request: report["failedRequests"].append({"url": request.url, "failure": request.failure}))
            page.goto(origin + "/", wait_until="networkidle")
            require(page.locator("h1").count() == 1, "landing page must have one heading")
            require(page.locator("h1").is_visible(), "landing heading is not visible")
            # The public page is self-contained; a CDN or dependency root must
            # not accidentally become part of deployment readiness.
            references = page.locator("[src],link[href]").evaluate_all("nodes => nodes.map(node => node.src || node.href)")
            require(all(urllib.parse.urlparse(url).netloc == urllib.parse.urlparse(origin).netloc for url in references), "landing loads an external runtime asset")
            require(page.locator('a[href="/demos/dashboard/"]').count() + page.locator('a[href="./demos/dashboard/"]').count() + page.locator('a[href="demos/dashboard/"]').count() == int(available), "landing demo link disagrees with manifest")
            page.screenshot(path=str(report_root / "landing.png"), full_page=True)
            report["checks"].append("landing-ready-and-demo-availability")
            if available:
                page.goto(origin + "/demos/dashboard/", wait_until="networkidle")
                page.wait_for_function("window.__DASHBOARD_READY__ === true")
                groups = page.locator("#dashboard-content [data-content-group]").evaluate_all("nodes => nodes.map(node => node.dataset.contentGroup)")
                require(len(groups) == len(set(groups)) == 8, f"expected eight content groups, got {groups}")
                require(page.locator('#dashboard-content [data-chart-point="mix"]').count() == 5, "missing mix chart points")
                require(page.locator('#dashboard-content [data-chart-point="trend"]').count() == 18, "missing trend chart points")
                require(page.evaluate("DashboardComponents.mounted.length") == 8, "component registry did not mount eight groups")
                report["checks"].append("dashboard-eight-groups-five-mix-eighteen-trend")
                page.locator("#theme-toggle").click()
                require(page.locator("html").get_attribute("data-theme") == "dark", "theme switch did not apply dark theme")
                require(page.locator("#theme-toggle").get_attribute("aria-pressed") == "true", "theme switch state is not announced")
                page.locator("#theme-toggle").click()
                require(page.locator("html").get_attribute("data-theme") == "light", "theme switch did not restore light theme")
                report["checks"].append("theme-round-trip")
                before_url = page.url
                note = "部署冒煙測試：保留公開示範的本頁筆記。"
                page.locator("#note-text").fill(note)
                page.locator("#note-form button").click()
                page.wait_for_function("document.querySelector('#note-status').textContent.includes('本頁暫存')")
                require(page.url == before_url, "note submission navigated away")
                require(page.locator("#note-text").input_value() == note, "note was lost after submission")
                report["checks"].append("note-submit-without-navigation")
                trigger = page.locator('[data-case="CS-2026-081"]')
                trigger.focus()
                page.keyboard.press("Enter")
                require(page.locator("#case-dialog").evaluate("node => node.open"), "keyboard action did not open dialog")
                require(page.locator("#case-dialog-title").inner_text() == "案件 CS-2026-081", "dialog lost the selected case")
                require(page.evaluate("document.activeElement.id") == "case-dialog-title", "dialog did not receive initial focus")
                page.keyboard.press("Escape")
                require(not page.locator("#case-dialog").evaluate("node => node.open"), "Escape did not close dialog")
                require(page.evaluate("document.activeElement.dataset.case") == "CS-2026-081", "dialog did not restore trigger focus")
                report["checks"].append("case-dialog-keyboard-round-trip")
                chart_keyboard_feedback(page)
                report["checks"].append("chart-keyboard-feedback")
                page.screenshot(path=str(report_root / "dashboard-desktop.png"), full_page=True)
                page.set_viewport_size({"width": 390, "height": 844})
                page.locator("#theme-toggle").click()
                require(page.locator("#theme-toggle").get_attribute("aria-pressed") == "true", "mobile theme control unavailable")
                require(page.locator("#dashboard-content").is_visible(), "mobile dashboard content missing")
                chart_keyboard_feedback(page)
                report["checks"].append("mobile-chart-keyboard-feedback")
                page.screenshot(path=str(report_root / "dashboard-mobile.png"), full_page=True)
                report["checks"].append("mobile-content-and-theme-ready")
            require(not report["pageErrors"], f"browser runtime errors: {report['pageErrors']}")
            require(not report["consoleErrors"], f"browser console errors: {report['consoleErrors']}")
            require(not report["failedRequests"], f"failed static requests: {report['failedRequests']}")
            browser.close()
        report["passed"] = True
    except Exception as error:
        report["error"] = f"{type(error).__name__}: {error}"
        raise
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)
        (report_root / "smoke-results.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", required=True, type=Path, help="emitted static dist directory")
    parser.add_argument("--expect-dashboard", required=True, choices=("available", "absent"))
    parser.add_argument("--report", required=True, type=Path)
    parser.add_argument("--chromium-executable", type=Path, help="optional explicit local Chromium; CI uses the pinned Playwright browser")
    arguments = parser.parse_args()
    result = smoke(arguments.root, arguments.expect_dashboard, arguments.report, arguments.chromium_executable)
    print(json.dumps({"passed": result["passed"], "dashboardAvailable": result["dashboardAvailable"], "checks": result["checks"]}, ensure_ascii=False))
