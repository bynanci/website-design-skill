#!/usr/bin/env python3
"""Actual Chromium evidence for the synthetic dashboard's declared matrix.

DOM, accessibility, keyboard and emulated-touch checks are observations. Physical
hardware, screen readers and native browser zoom need their own recorded runs.
"""
import hashlib
import json
import os
import platform
import subprocess
import sys
import time
from datetime import datetime, timezone
from importlib.metadata import version
from pathlib import Path

from playwright.sync_api import sync_playwright

RUNNER_ROOT = Path(__file__).resolve().parents[1]
ROOT = Path(os.environ.get("DASHBOARD_SPECIMEN_ROOT", str(RUNNER_ROOT))).resolve()
ENTRY = (ROOT / "specimen/index.html").resolve().as_uri()
AXE_BUNDLE = RUNNER_ROOT.parents[1] / "node_modules/axe-core/axe.min.js"
EVIDENCE = Path(os.environ.get("DASHBOARD_QA_OUTPUT", str(ROOT / "evidence")))
EVIDENCE.mkdir(parents=True, exist_ok=True)
CHROMIUM_EXECUTABLE = os.environ.get("DASHBOARD_CHROMIUM_EXECUTABLE")
HEADED = os.environ.get("DASHBOARD_HEADED") == "1"
SCENARIOS = [
    ("desktop-wide", 1920, 1080), ("desktop-laptop", 1366, 768),
    ("split-pane", 768, 1000), ("mobile-390", 390, 844), ("mobile-320", 320, 700),
]
REQUIRED = ["#account-name", ".metrics", "#observations", "#mix-heading",
            "#trend-heading", "#opportunities-heading", "#cases-heading",
            "#notes-heading", "#sources-heading"]
MATRIX_CONDITIONS = [
    f"{name}-{direction}-{theme}"
    for name, _, _ in SCENARIOS
    for direction in ("editorial", "cockpit")
    for theme in ("light", "dark")
] + [
    "keyboard-dialog-open", "keyboard-chart-dialog-note", "zoom-200-width-proxy",
    "embedded-360-container", "state-loading", "state-empty", "state-error",
    "state-success-recovery", "floating-panel-open", "floating-panel-closed",
    "emulated-touch-dialog", "stress-long-copy-320",
]
records = []
axe_reports = []
failures = []
STARTED = time.monotonic()
native_zoom = {"status": "not-run", "reason": "Set DASHBOARD_NATIVE_ZOOM=1 with a headed desktop/Xvfb environment for the separate native zoom mechanism."}


def provenance(browser=None):
    """Identify every actual specimen source, including new renderer modules."""
    source_paths = sorted(path for path in (ROOT / "specimen").rglob("*")
                          if path.is_file() and path.suffix in {".html", ".css", ".js", ".json"})
    sources = [{"path": path.relative_to(ROOT).as_posix(),
                "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}
               for path in source_paths]
    sources.append({"path": "qa/run_browser_qa.py", "kind": "trusted-runner",
                    "sha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest()})
    return {
        "sources": sources,
        "runtime": {
            "python": platform.python_version(), "playwright": version("playwright"),
            "chromium": browser.version if browser is not None else None,
            "executable": CHROMIUM_EXECUTABLE or "Playwright-managed Chromium",
            "headed": HEADED,
            "axe_core": json.loads((AXE_BUNDLE.parent / "package.json").read_text())["version"]
            if AXE_BUNDLE.is_file() else None,
        },
        "github_actions": {
            "repository": os.environ.get("GITHUB_REPOSITORY"),
            "checkout_sha": os.environ.get("GITHUB_SHA"),
            "run_id": os.environ.get("GITHUB_RUN_ID"),
            "run_attempt": os.environ.get("GITHUB_RUN_ATTEMPT"),
        },
    }


def check(ok, message):
    if not ok:
        failures.append(message)


def ready(page):
    page.wait_for_function("window.__DASHBOARD_READY__ === true")
    page.locator('[data-chart-point="mix"]').first.wait_for()
    page.evaluate("() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")


def open_page(browser, width=1366, height=768, query=""):
    page = browser.new_page(viewport={"width": width, "height": height}, reduced_motion="reduce")
    page.goto(ENTRY + query, wait_until="load")
    ready(page)
    return page


def measurements(page):
    return page.evaluate("""() => {
      const rect = e => { const r=e.getBoundingClientRect();
        return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}; };
      const navigation=performance.getEntriesByType('navigation')[0];
      const paints=Object.fromEntries(performance.getEntriesByType('paint').map(e=>[e.name,e.startTime]));
      const groups=[...document.querySelectorAll('[data-content-group]')];
      return {
        viewport:{width:innerWidth,height:innerHeight,devicePixelRatio},
        page:{scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight},
        donut:rect(document.querySelector('#revenue-donut')),
        legend:rect(document.querySelector('#revenue-legend')),
        cases:rect(document.querySelector('.cases-scroll')),
        trendLegend:[...document.querySelectorAll('.trend-key-item')].map(rect),
        direction:document.querySelector('.dashboard').dataset.direction,
        theme:document.documentElement.dataset.theme || 'light',
        groups:groups.map(e=>({name:e.dataset.contentGroup,rect:rect(e)})),
        content:Object.fromEntries(groups.map(e=>[e.dataset.contentGroup,e.textContent.replace(/\\s+/g,' ').trim()])),
        requiredContentPresent:document.querySelectorAll('.observation').length===4
          && document.querySelectorAll('.metric').length===4
          && document.querySelectorAll('.opportunity-list li').length===2
          && document.querySelectorAll('.cases-panel tbody tr').length===3,
        performance:{
          navigation: navigation ? {domContentLoadedMs:navigation.domContentLoadedEventEnd,
             loadEventMs:navigation.loadEventEnd,transferSize:navigation.transferSize} : null,
          paints,readyObservedMs:performance.now(),
          method:'Navigation Timing and Paint Timing from this file fixture; readyObservedMs includes automation observation delay. No speed comparison or certification.'
        }
      };
    }""")


def intersect(a, b):
    return (a["left"] < b["right"] - 0.5 and a["right"] > b["left"] + 0.5
            and a["top"] < b["bottom"] - 0.5 and a["bottom"] > b["top"] + 0.5)


def common_checks(page, name, result=None):
    result = result or measurements(page)
    width = result["viewport"]["width"]
    check(result["page"]["scrollWidth"] <= width + 1, name + ": global horizontal overflow")
    for selector in REQUIRED:
        check(page.locator(selector).count() == 1, name + ": missing or duplicate " + selector)
    check(result["requiredContentPresent"], name + ": lost required content")
    check(len(result["groups"]) == 8 and len({g["name"] for g in result["groups"]}) == 8,
          name + ": expected eight unique reusable content groups")
    check(page.locator('[data-chart-point="mix"]').count() == 5, name + ": donut point count")
    check(page.locator('[data-chart-point="trend"]').count() == 18, name + ": trend point count")
    check(not intersect(result["donut"], result["legend"]), name + ": donut/legend overlap")
    for index, first in enumerate(result["trendLegend"]):
        for second in result["trendLegend"][index + 1:]:
            check(not intersect(first, second), name + ": trend legend item collision")
    check(result["cases"]["left"] >= -1 and result["cases"]["right"] <= width + 1,
          name + ": case-table scroll container escapes viewport")
    if width <= 390:
        label, avatar = page.locator(".fixture-label").bounding_box(), page.locator(".avatar").bounding_box()
        check(label["x"] + label["width"] <= avatar["x"] + 1, name + ": header label overlaps avatar")
        for selector in (".direction-btn", "#theme-toggle", "#note-form .primary-btn"):
            check(page.locator(selector).first.bounding_box()["height"] >= 44,
                  name + ": control below declared 44px target: " + selector)
    return result


def record(page, name, result=None, **extra):
    limit = int(os.environ.get("DASHBOARD_MAX_CAPTURES", "64"))
    seconds = float(os.environ.get("DASHBOARD_MAX_SECONDS", "480"))
    if limit < 0 or limit > 128 or seconds <= 0 or seconds > 1800:
        raise ValueError("Invalid dashboard capture/time budget")
    if len(records) >= limit:
        raise RuntimeError("Capture budget exhausted before " + name)
    if time.monotonic() - STARTED >= seconds:
        raise RuntimeError("Dashboard time budget exhausted before " + name)
    screenshot = name + ".png"
    page.screenshot(path=str(EVIDENCE / screenshot), full_page=True, animations="disabled")
    records.append({"scenario": name, "measurements": result or measurements(page),
                    "screenshot": screenshot, "screenshot_sha256": hashlib.sha256((EVIDENCE / screenshot).read_bytes()).hexdigest(), **extra})


def axe(page, name):
    if not AXE_BUNDLE.is_file():
        return
    page.add_script_tag(path=str(AXE_BUNDLE))
    violations = page.evaluate("""async () => {
      const result=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});
      return result.violations.map(v=>({id:v.id,impact:v.impact,description:v.help,
        nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary})).slice(0,250)}));
    }""")
    axe_reports.append({"scenario": name, "violations": violations})
    check(not violations, name + ": axe-core violations: " + json.dumps(violations, ensure_ascii=False)[:1800])


def chart_keyboard_hover(page):
    for kind, feedback_id in (("mix", "#mix-feedback"), ("trend", "#trend-feedback")):
        points = page.locator('[data-chart-point="' + kind + '"]')
        check(sum(point.get_attribute("tabindex") == "0" for point in points.all()) == 1,
              kind + ": expected one roving Tab stop")
        point = points.first
        point.focus()
        keyboard = page.locator(feedback_id).inner_text()
        point.scroll_into_view_if_needed()
        if kind == "mix":
            # A circle's bounding-box center is not its visible arc. Move to the
            # midpoint of this segment to dispatch a real pointer enter event.
            position = point.evaluate("""e => {
              const dash=Number(e.getAttribute('stroke-dasharray').split(/[ ,]+/)[0]);
              const offset=Math.abs(Number(e.getAttribute('stroke-dashoffset')));
              const radius=Number(e.getAttribute('r')), angle=(offset+dash/2)/radius;
              const p=new DOMPoint(Number(e.getAttribute('cx'))+radius*Math.cos(angle),
                Number(e.getAttribute('cy'))+radius*Math.sin(angle)).matrixTransform(e.getScreenCTM());
              return {x:p.x,y:p.y};
            }""")
            page.mouse.move(0, 0)
            page.locator(feedback_id).evaluate("e=>{e.textContent='pointer probe pending'}")
            page.mouse.move(position["x"], position["y"])
        else:
            page.mouse.move(0, 0)
            page.locator(feedback_id).evaluate("e=>{e.textContent='pointer probe pending'}")
            # Nearby series markers can overlap their centres. Select an
            # actually exposed point on this marker, then deliver a real move.
            position = point.evaluate("""e => {
              const cx=Number(e.getAttribute('cx')),cy=Number(e.getAttribute('cy')),
                r=Number(e.getAttribute('r')),matrix=e.getScreenCTM();
              for(const [dx,dy] of [[0,0],[0,-.7],[-.7,0],[.7,0],[0,.7]]){
                const p=new DOMPoint(cx+dx*r,cy+dy*r).matrixTransform(matrix);
                if(document.elementFromPoint(p.x,p.y)===e)return {x:p.x,y:p.y};
              }
              throw new Error('Trend marker has no exposed pointer target');
            }""")
            page.mouse.move(position["x"], position["y"])
        check(page.locator(feedback_id).inner_text() == keyboard, kind + ": pointer/keyboard value mismatch")
    page.locator('[data-chart-point="mix"]').first.focus()
    page.keyboard.press("ArrowRight")
    check("企業網路" in page.locator("#mix-feedback").inner_text(), "donut ArrowRight missing next value")
    page.keyboard.press("Home")
    check(page.evaluate("document.activeElement.getAttribute('data-series')") == "雲端專線", "donut Home target")
    page.locator('[data-chart-point="trend"]').first.focus()
    page.keyboard.press("End")
    check("資訊安全" in page.locator("#trend-feedback").inner_text() and "11 月" in page.locator("#trend-feedback").inner_text(), "trend End target")
    page.keyboard.press("Home")
    check("雲端專線" in page.locator("#trend-feedback").inner_text() and "6 月" in page.locator("#trend-feedback").inner_text(), "trend Home target")


def interactions(browser):
    page = open_page(browser)
    reuse = page.evaluate("""() => {
      const registry=DashboardComponents;
      const probe=registry.create('AccountSummary',{name:'<img src=x onerror=alert(1)>',summary:'Independent component props'},{idPrefix:'probe-'});
      return {names:registry.names,mounted:registry.mounted,
        probeName:probe.querySelector('#probe-account-name').textContent,
        probeAria:probe.getAttribute('aria-labelledby'),
        probeImages:probe.querySelectorAll('img').length,
        originalName:document.querySelector('#account-name').textContent};
    }""")
    check(len(reuse["names"]) == 8 and len(set(reuse["mounted"])) == 8, "eight reusable component bindings not mounted")
    check(reuse["probeName"] == '<img src=x onerror=alert(1)>' and reuse["probeImages"] == 0,
          "component props did not remain plain text")
    check(reuse["probeAria"] == 'probe-account-name' and reuse["originalName"] == 'Harbor Cloud',
          "component ID scope or independent props mutated the existing instance")
    chart_keyboard_hover(page)
    for panel, rows, expected in ((".chart-panel", "#mix-data tr", 5), (".trend-panel", "#trend-table-body tr", 6)):
        page.locator(panel + " details summary").click()
        check(page.locator(rows).count() == expected, panel + ": accessible table incomplete")
    check(sum(int(row.locator("td").first.inner_text()) for row in page.locator("#mix-data tr").all()) == 842,
          "mix chart and table totals disagree")
    trigger = page.locator('[data-case="CS-2026-081"]')
    trigger.focus()
    page.keyboard.press("Enter")
    check(page.locator("#case-dialog").evaluate("e=>e.open"), "keyboard Enter did not open dialog")
    check(page.evaluate("document.activeElement.id") == "case-dialog-title", "dialog initial focus")
    for key in ("Tab", "Tab", "Shift+Tab"):
        page.keyboard.press(key)
        check(page.evaluate("document.querySelector('#case-dialog').contains(document.activeElement)"),
              "dialog focus escaped after " + key)
    record(page, "keyboard-dialog-open")
    page.keyboard.press("Escape")
    check(not page.locator("#case-dialog").evaluate("e=>e.open"), "Escape did not close dialog")
    check(page.evaluate("document.activeElement.getAttribute('data-case')") == "CS-2026-081", "dialog focus not restored")
    page.locator("#note-text").fill("測試：確認雲端專線容量需求。")
    page.locator("#note-form button").click()
    check("本頁暫存" in page.locator("#note-status").inner_text(), "note status does not disclose page-only persistence")
    record(page, "keyboard-chart-dialog-note", component_reuse=reuse)
    page.set_viewport_size({"width": 683, "height": 384})
    proxy = common_checks(page, "zoom-200-width-proxy")
    record(page, "zoom-200-width-proxy", proxy,
           method="683 CSS px is an effective-width approximation of 1366px at 200%; not native browser zoom")
    page.set_viewport_size({"width": 1280, "height": 900})
    page.add_style_tag(content=".dashboard{width:360px;margin-inline:auto}.global-header{min-width:0}")
    narrow = common_checks(page, "embedded-360-container")
    record(page, "embedded-360-container", narrow)
    page.close()


def state_checks(browser):
    page = open_page(browser)
    page.locator("#note-text").fill("本地輸入必須在復原後保留。")
    initial = page.evaluate("__DASHBOARD_FIXTURE__.snapshot()")
    for state in ("loading", "empty", "error"):
        page.evaluate("state=>__DASHBOARD_FIXTURE__.setState(state)", state)
        check(not page.locator("#dashboard-content").is_visible(), state + ": unavailable data surface remains visible")
        check(bool(page.locator("#dashboard-status").inner_text().strip()), state + ": status announcement empty")
        check(page.locator("#dashboard-content").evaluate("e=>e.inert"), state + ": hidden content remains interactive")
        # measurements are zero for hidden figures; preserve this explicitly.
        record(page, "state-" + state, state_snapshot=page.evaluate("__DASHBOARD_FIXTURE__.snapshot()"))
        retry = page.locator("#dashboard-retry")
        retry.focus()
        retry.press("Enter")
        page.wait_for_function("document.querySelector('#dashboard-content').hidden === false")
        check(page.evaluate("document.activeElement.id") == "dashboard-retry", state + ": retry focus was lost")
        check(page.locator("#note-text").input_value() == "本地輸入必須在復原後保留。", state + ": note input lost after recovery")
        common_checks(page, "state-" + state + "-recovered")
    record(page, "state-success-recovery", state_snapshot=page.evaluate("__DASHBOARD_FIXTURE__.snapshot()"), initial_snapshot=initial)
    page.close()


def floating_and_touch(browser):
    floating = open_page(browser, query="?floating=1")
    panel = floating.locator("#fixture-floating-panel")
    check(panel.is_visible(), "floating panel is not visible in declared stress condition")
    result = common_checks(floating, "floating-panel")
    intersections = floating.evaluate("""() => {
      const p=document.querySelector('#fixture-floating-panel').getBoundingClientRect();
      return [...document.querySelectorAll('#dashboard-content button, #dashboard-content a')].filter(e=>{
        const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight
          && r.left<p.right&&r.right>p.left&&r.top<p.bottom&&r.bottom>p.top;
      }).map(e=>({text:e.textContent.trim(),id:e.id}));
    }""")
    check(not intersections, "floating panel covers required visible actions: " + json.dumps(intersections, ensure_ascii=False))
    record(floating, "floating-panel-open", result, action_intersections=intersections)
    panel.get_by_role("button").first.focus()
    floating.keyboard.press("Enter")
    check(not panel.is_visible(), "floating panel keyboard close failed")
    check(floating.evaluate("document.activeElement.id") == "floating-toggle", "floating close did not restore focus")
    record(floating, "floating-panel-closed", common_checks(floating, "floating-panel-closed"), action_intersections=intersections)
    floating.close()

    context = browser.new_context(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True,
                                  reduced_motion="reduce")
    touch = context.new_page()
    touch.goto(ENTRY, wait_until="load")
    ready(touch)
    check(touch.evaluate("navigator.maxTouchPoints > 0"), "touch context did not enable touch emulation")
    touch.locator(".legend-item").first.tap()
    check("雲端專線" in touch.locator("#mix-feedback").inner_text(), "touch legend did not reveal value")
    touch.locator('[data-case="CS-2026-081"]').tap()
    check(touch.locator("#case-dialog").evaluate("e=>e.open"), "touch case action did not open dialog")
    record(touch, "emulated-touch-dialog", method="Chromium mobile/touch emulation; no physical-device claim")
    touch.locator("#close-dialog").tap()
    check(not touch.locator("#case-dialog").evaluate("e=>e.open"), "touch dialog close failed")
    context.close()


def long_copy(browser):
    page = open_page(browser, 320, 700)
    page.evaluate("""() => {
      document.querySelector('.observation .obs-content > p').textContent=
        '跨區備援部署、維運流程與雲端專線調整的實際影響需依客戶需求逐項確認。'.repeat(16);
      document.querySelector('.evidence-row a').textContent='source:'+('unbroken_1234567890'.repeat(18));
      document.querySelector('#account-name').textContent='HarborCloudEnterpriseAccountWithVeryLongUnbrokenName';
    }""")
    result = common_checks(page, "stress-long-copy-320")
    stats = page.evaluate("""() => {
      const p=document.querySelector('.observation .obs-content > p'),a=document.querySelector('.evidence-row a');
      return {paragraphUnclipped:p.scrollHeight<=p.clientHeight+2,
        linkInViewport:a.getBoundingClientRect().left>=0&&a.getBoundingClientRect().right<=innerWidth+1,
        companyInViewport:document.querySelector('#account-name').getBoundingClientRect().right<=innerWidth+1};
    }""")
    check(all(stats.values()), "long-copy content clipping: " + json.dumps(stats))
    record(page, "stress-long-copy-320", result, stress=stats,
           method="Synthetic long content in actual DOM, with no evidence truncation")
    page.close()


def run_native_zoom():
    global native_zoom
    if os.environ.get("DASHBOARD_NATIVE_ZOOM") != "1":
        return
    output = EVIDENCE / "native-zoom-results.json"
    environment = os.environ.copy()
    environment["DASHBOARD_MAX_CAPTURES"] = str(max(0, int(os.environ.get("DASHBOARD_MAX_CAPTURES", "64")) - len(records)))
    remaining = float(os.environ.get("DASHBOARD_MAX_SECONDS", "480")) - (time.monotonic() - STARTED)
    if remaining <= 0:
        native_zoom = {"passed": False, "execution_error": "No native zoom time budget remains"}
        check(False, "native zoom time budget exhausted")
        return
    environment["DASHBOARD_MAX_SECONDS"] = str(remaining)
    output.unlink(missing_ok=True)
    try:
        result = subprocess.run([sys.executable, str(Path(__file__).resolve().parent / "run_native_zoom.py")],
                                env=environment, capture_output=True, text=True, timeout=remaining, check=False)
        native_zoom = json.loads(output.read_text(encoding="utf-8")) if output.is_file() else {
            "passed": False, "execution_error": "Native zoom helper produced no report"}
        native_zoom["helper_exit_code"] = result.returncode
        if result.returncode:
            native_zoom["helper_output_tail"] = (result.stdout + result.stderr)[-4000:]
        check(result.returncode == 0 and native_zoom.get("passed") is True,
              "native browser zoom failed: " + json.dumps(native_zoom, ensure_ascii=False)[:1800])
    except (OSError, ValueError, subprocess.TimeoutExpired) as error:
        native_zoom = {"passed": False, "execution_error": {"type": type(error).__name__, "message": str(error)}}
        check(False, "native browser zoom did not complete: " + str(error))


def main():
    check(AXE_BUNDLE.is_file(), "axe-core bundle missing from CI installation")
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=not HEADED, executable_path=CHROMIUM_EXECUTABLE)
        observed_provenance = provenance(browser)
        try:
            baseline_content = None
            for name, width, height in SCENARIOS:
                page = open_page(browser, width, height)
                errors = []
                page.on("pageerror", lambda error, target=errors: target.append(str(error)))
                for direction in ("editorial", "cockpit"):
                    page.locator('[data-set-direction="' + direction + '"]').click()
                    for theme in ("light", "dark"):
                        if page.evaluate("document.documentElement.dataset.theme || 'light'") != theme:
                            page.locator("#theme-toggle").click()
                        label = name + "-" + direction + "-" + theme
                        result = common_checks(page, label)
                        check(result["theme"] == theme, label + ": theme did not update")
                        check(result["direction"] == direction, label + ": direction did not update")
                        check(not errors, label + ": JavaScript errors: " + str(errors))
                        if baseline_content is None:
                            baseline_content = result["content"]
                        check(result["content"] == baseline_content, label + ": direction/theme changed required content")
                        if name in ("desktop-laptop", "mobile-390", "mobile-320") and direction == "editorial":
                            axe(page, label)
                        record(page, label, result, javascript_errors=list(errors))
                if width <= 390:
                    shortcut = page.locator(".quick-insight-link")
                    check(shortcut.is_visible(), name + ": mobile AI shortcut missing")
                    shortcut.click()
                    check(page.evaluate("location.hash") == "#observations", name + ": AI shortcut target")
                    top = page.locator("#observations").evaluate("e=>e.getBoundingClientRect().top")
                    check(-5 <= top <= 60, name + ": AI shortcut did not reveal heading")
                page.close()
            interactions(browser)
            state_checks(browser)
            floating_and_touch(browser)
            long_copy(browser)
        finally:
            browser.close()
    run_native_zoom()
    check([record["scenario"] for record in records] == MATRIX_CONDITIONS, "Declared full matrix was not completed in order")
    report = {
        "source": "public synthetic account dashboard", "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "provenance": observed_provenance, "browser": "Playwright Chromium " + ("headed" if HEADED else "headless"),
        "rendered_cases": len(records), "matrixVersion": "dashboard-0.2-20261117",
        "captureBudget": int(os.environ.get("DASHBOARD_MAX_CAPTURES", "64")),
        "elapsedSeconds": time.monotonic() - STARTED,
        "matrixConditions": MATRIX_CONDITIONS,
        "completedConditions": [record["scenario"] for record in records],
        "matrix": {"viewports": SCENARIOS, "directions": ["editorial", "cockpit"], "themes": ["light", "dark"]},
        "checks": records, "axe_audits": axe_reports, "native_zoom": native_zoom, "failures": failures, "passed": not failures,
        "notes": ["Captures and deterministic checks are separate from visual-review acceptance.",
                  "The 200% width proxy is not native browser zoom; a native zoom run must identify its browser mechanism.",
                  "Touch is emulated. Physical devices, screen readers and WCAG certification are not tested.",
                  "Performance fields are raw Navigation/Paint Timing observations, not a speed improvement or production certification."],
    }
    (EVIDENCE / "qa-results.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"passed": not failures, "cases": len(records), "failures": failures}, ensure_ascii=False))
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        (EVIDENCE / "qa-results.json").write_text(json.dumps({
            "source": "public synthetic account dashboard", "timestamp_utc": datetime.now(timezone.utc).isoformat(),
            "provenance": provenance(), "passed": False, "rendered_cases": len(records),
            "matrixVersion": "dashboard-0.2-20261117", "matrixConditions": MATRIX_CONDITIONS,
            "completedConditions": [record["scenario"] for record in records],
            "checks": records, "axe_audits": axe_reports, "native_zoom": native_zoom, "failures": failures,
            "execution_error": {"type": type(error).__name__, "message": str(error)},
            "notes": ["Execution did not complete; absent checks are not passing evidence."],
        }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        raise
