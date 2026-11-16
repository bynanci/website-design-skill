#!/usr/bin/env python3
"""Actual Chromium rendering/interaction checks for the synthetic B2B specimen.

Screenshots and measurements are generated in CI, not guessed by the author.
No real device, native 200% zoom, screen reader, or WCAG certification is claimed.
"""
import json
import os
from pathlib import Path
from datetime import datetime, timezone

AXE_BUNDLE = Path(__file__).resolve().parents[3] / 'node_modules/axe-core/axe.min.js'
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ENTRY = (ROOT / "specimen/index.html").resolve().as_uri()
EVIDENCE = Path(os.environ.get("DASHBOARD_QA_OUTPUT", str(ROOT / "evidence")))
EVIDENCE.mkdir(parents=True, exist_ok=True)
SCENARIOS = [
    ("desktop-wide", 1920, 1080), ("desktop-laptop", 1366, 768),
    ("split-pane", 768, 1000), ("mobile-390", 390, 844), ("mobile-320", 320, 700),
]
REQUIRED = ["#account-name",".metrics","#observations","#mix-heading",
            "#trend-heading","#opportunities-heading","#cases-heading",
            "#notes-heading","#sources-heading"]
records = []
failures = []


def check(ok, message):
    if not ok:
        failures.append(message)


def measurements(page):
    return page.evaluate("""() => {
      const rect = e => { const r=e.getBoundingClientRect();
        return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,
                width:r.width,height:r.height}; };
      return {
        viewport:{width:innerWidth,height:innerHeight},
        page:{scrollWidth:document.documentElement.scrollWidth,
              scrollHeight:document.documentElement.scrollHeight},
        donut:rect(document.querySelector('#revenue-donut')),
        legend:rect(document.querySelector('#revenue-legend')),
        cases:rect(document.querySelector('.cases-scroll')),
        direction:document.querySelector('.dashboard').dataset.direction,
        requiredContentPresent:document.querySelectorAll('.observation').length===4
          && document.querySelectorAll('.metric').length===4
          && document.querySelectorAll('.opportunity-list li').length===2
          && document.querySelectorAll('.cases-panel tbody tr').length===3
      };
    }""")


def intersect(a, b):
    return a["left"] < b["right"] and a["right"] > b["left"] and a["top"] < b["bottom"] and a["bottom"] > b["top"]


def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            for name,width,height in SCENARIOS:
                page = browser.new_page(viewport={"width":width,"height":height},reduced_motion="reduce")
                errors = []
                page.on("pageerror",lambda error:errors.append(str(error)))
                page.goto(ENTRY,wait_until="load")
                page.locator('[data-chart-point="mix"]').first.wait_for()
                check(not errors,name+": JavaScript errors "+str(errors))
                for selector in REQUIRED:
                    check(page.locator(selector).count()>0,name+": missing "+selector)
                check(page.locator('[data-chart-point="mix"]').count()==5,name+": donut must have 5 labeled points")
                check(page.locator('[data-chart-point="trend"]').count()==18,name+": trend must have 18 labeled points")
                result = measurements(page)
                check(result["page"]["scrollWidth"]<=width+1,name+": global horizontal overflow")
                if width<=390:
                    label=page.locator(".fixture-label").bounding_box()
                    avatar=page.locator(".avatar").bounding_box()
                    check(label["x"]+label["width"]<=avatar["x"]+1,name+": compact header label overlaps account avatar")
                    check(page.locator(".direction-btn").first.bounding_box()["height"]>=44,name+": design-mode button below 44px target")
                    check(page.locator("#note-form .primary-btn").bounding_box()["height"]>=44,name+": save control below 44px target")
                check(not intersect(result["donut"],result["legend"]),name+": donut/legend overlap")
                check(result["requiredContentPresent"],name+": lost required content")
                page.screenshot(path=str(EVIDENCE/(name+"-editorial.png")),
                                full_page=True,animations="disabled")
                records.append({"scenario":name,"measurements":result,"javascript_errors":errors})
                if name in ("desktop-laptop","mobile-390"):
                    page.locator('[data-set-direction="cockpit"]').click()
                    check(page.locator('[data-set-direction="cockpit"]').get_attribute("aria-pressed")=="true",
                          name+": visual-mode state not updated")
                    check(page.locator(".observation").count()==4,name+": visual-mode content parity")
                    page.screenshot(path=str(EVIDENCE/(name+"-cockpit.png")),
                                    full_page=True,animations="disabled")
                page.close()

            page=browser.new_page(viewport={"width":1366,"height":768},reduced_motion="reduce")
            page.goto(ENTRY,wait_until="load")
            page.locator('[data-chart-point="mix"]').first.focus()
            check("雲端專線" in page.locator("#mix-feedback").inner_text(),
                  "focused donut has no accessible value feedback")
            page.locator('[data-chart-point="trend"]').first.focus()
            check("6 月" in page.locator("#trend-feedback").inner_text(),
                  "focused trend has no accessible value feedback")
            for kind in ("mix","trend"):
                points=page.locator('[data-chart-point="'+kind+'"]')
                check(sum(point.get_attribute("tabindex")=="0" for point in points.all())==1,
                      kind+": expected one roving Tab stop for entire chart")
            page.locator('[data-chart-point="mix"]').first.focus()
            page.keyboard.press("ArrowRight")
            check("企業網路" in page.locator("#mix-feedback").inner_text(),
                  "donut ArrowRight did not navigate or announce next segment")
            page.keyboard.press("Home")
            check(page.evaluate("document.activeElement.getAttribute('data-series')")=="雲端專線",
                  "donut Home should return to first segment")
            page.locator('[data-chart-point="trend"]').first.focus()
            page.keyboard.press("End")
            check("資訊安全" in page.locator("#trend-feedback").inner_text() and "11 月" in page.locator("#trend-feedback").inner_text(),
                  "trend End should reach last series/month")
            page.keyboard.press("Home")
            check("雲端專線" in page.locator("#trend-feedback").inner_text() and "6 月" in page.locator("#trend-feedback").inner_text(),
                  "trend Home should reach first point")
            page.locator(".chart-panel details summary").click()
            check(page.locator("#mix-data tr").count()==5,"mix accessible table incomplete")
            total=sum(int(row.locator("td").first.inner_text()) for row in page.locator("#mix-data tr").all())
            check(total==842,"mix chart and data table totals disagree")
            page.locator(".trend-panel details summary").click()
            check(page.locator("#trend-table-body tr").count()==6,"trend accessible table incomplete")
            trigger=page.locator('[data-case="CS-2026-081"]')
            trigger.focus()
            page.keyboard.press("Enter")
            check(page.locator("#case-dialog").evaluate("(e)=>e.open"),"keyboard Enter fails to open modal")
            check(page.evaluate("document.activeElement.id")=="case-dialog-title","modal initial focus incorrect")
            check(page.locator("#close-dialog").bounding_box()["height"]>=44,
                  "dialog close touch target below 44px")
            page.keyboard.press("Escape")
            check(not page.locator("#case-dialog").evaluate("(e)=>e.open"),"Escape fails to close modal")
            check(page.evaluate("document.activeElement.getAttribute('data-case')")=="CS-2026-081",
                  "modal focus not restored")
            check(page.locator('label[for="note-text"]').count()==1,"note input has no label")
            page.locator("#note-text").fill("測試：確認雲端專線容量需求。")
            page.locator("#note-form button").click()
            check("本頁暫存" in page.locator("#note-status").inner_text(),"note status misleading")
            page.set_viewport_size({"width":683,"height":384})
            page.screenshot(path=str(EVIDENCE/"zoom-200-width-proxy.png"),
                            full_page=True,animations="disabled")
            proxy=measurements(page)
            check(proxy["page"]["scrollWidth"]<=684,"200% CSS-width proxy: global overflow")
            records.append({"scenario":"zoom-200-width-proxy","measurements":proxy,
                "method":"683 CSS px is only an effective-width approximation of 1366px at 200%; not real browser zoom"})
            page.set_viewport_size({"width":1280,"height":900})
            page.add_style_tag(content=".dashboard{width:360px;margin-inline:auto}.global-header{min-width:0}")
            page.screenshot(path=str(EVIDENCE/"embedded-360-container.png"),
                            full_page=True,animations="disabled")
            narrow=measurements(page)
            check(narrow["page"]["scrollWidth"]<=1281,"embedded container: global overflow")
            records.append({"scenario":"embedded-360-css-px-container","measurements":narrow})
            page.close()
        finally:
            browser.close()
    report={
        "source":"public synthetic account dashboard","timestamp_utc":datetime.now(timezone.utc).isoformat(),
        "browser":"Playwright Chromium headless","rendered_cases":len(SCENARIOS),
        "notes":["Screenshots captured but automated checks are not human visual approval.",
                 "200% zoom uses effective CSS-width proxy, not native browser zoom.",
                 "Physical devices, screen readers and WCAG conformance not tested.",
                 "No real customer data or performance certification."],
        "checks":records,"failures":failures,"passed":not failures
    }
    (EVIDENCE/"qa-results.json").write_text(
        json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"passed":not failures,"cases":len(records),"failures":failures},ensure_ascii=False))
    if failures: raise SystemExit(1)


if __name__=="__main__":
    main()
