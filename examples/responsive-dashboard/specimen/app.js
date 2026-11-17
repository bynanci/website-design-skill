/* Synthetic public fixture: no network, persisted customer data or analytics. */
(() => {
  "use strict";
  const started = performance.now();
  const qs = selector => document.querySelector(selector);
  function direction(){
    document.querySelectorAll("[data-set-direction]").forEach(button=>{
      button.addEventListener("click",()=>{
        const active=button.getAttribute("data-set-direction");
        qs(".dashboard").dataset.direction=active;
        document.querySelectorAll("[data-set-direction]").forEach(other=>
          other.setAttribute("aria-pressed",String(other===button)));
      });
    });
  }
  function caseDialog(){
    const dialog=qs("#case-dialog"),title=qs("#case-dialog-title");
    let returnFocus=null;
    // Delegate to the shared dialog host so later component instances receive
    // the same native pointer/keyboard behavior as the initial dashboard.
    document.addEventListener("click", event => {
      const button = event.target instanceof Element ? event.target.closest('button[data-case]') : null;
      if (!button || button.disabled || !button.closest('[data-component="CaseTable"]')) return;
      const row = button.closest("tr"), cells = row ? Array.from(row.querySelectorAll("td")) : [];
      if (cells.length !== 7 || dialog.open) return;
      returnFocus = button;
      const value = index => cells[index].textContent.trim();
      title.textContent = "案件 " + button.dataset.case;
      // Read the current instance's rendered, text-only props. Do not look up
      // a fixed global fixture ID or copy another component's record.
      qs("#case-dialog-description").textContent = value(1) + " · " + value(2) + "優先級。示範狀態：" + value(5) + "。預定完成日：" + value(4) + "。";
      dialog.showModal();title.focus();
    });
    const close=()=>dialog.close();
    qs("#close-dialog").addEventListener("click",close);
    qs("#dialog-done").addEventListener("click",close);
    dialog.addEventListener("keydown", event => {
      if (event.key !== "Tab" || !dialog.open) return;
      const controls = Array.from(dialog.querySelectorAll('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'))
        .filter(element => !element.disabled && element.getClientRects().length);
      if (!controls.length) { event.preventDefault(); title.focus(); return; }
      const current = controls.indexOf(document.activeElement);
      const next = current < 0 ? (event.shiftKey ? controls.length - 1 : 0)
        : (current + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
      event.preventDefault(); controls[next].focus();
    });
    dialog.addEventListener("close",()=>{if(returnFocus?.isConnected)returnFocus.focus();returnFocus=null;});
  }
  /** One synthetic read owner; no network, storage or backend permission. */
  function createDashboardOwner() {
    const allowed = new Set(["loading", "empty", "error", "success"]);
    const status = qs("#dashboard-status"), retry = qs("#dashboard-retry"), content = qs("#dashboard-content");
    let state = "success", sequence = 0, timer = null, active = null, disposed = false, requests = 0;
    const messages = { loading: "正在載入合成示範資料…", empty: "此條件沒有可顯示的合成資料。", error: "合成資料暫時無法載入，可重試恢復。", success: "已載入合成示範資料。" };
    function render() {
      status.textContent = messages[state];
      status.setAttribute("role", state === "error" ? "alert" : "status");
      qs("#dashboard-surface").setAttribute("aria-busy", String(state === "loading"));
      content.hidden = state !== "success"; content.inert = state !== "success";
      retry.setAttribute("aria-disabled", String(state === "loading"));
      retry.textContent = state === "error" ? "重試載入" : "重新載入示範資料";
      document.documentElement.dataset.fixtureState = state;
    }
    function cancel() {
      sequence += 1; if (timer !== null) clearTimeout(timer); timer = null;
      if (active) active.resolve({ outcome: "cancelled" }); active = null;
    }
    function setState(value) {
      if (!allowed.has(value)) throw new Error("Unsupported fixture state");
      if (disposed) return;
      cancel(); state = value; render();
    }
    function refresh() {
      if (disposed) return Promise.resolve({ outcome: "disposed" });
      if (active) return active.promise;
      const current = ++sequence; requests += 1; state = "loading"; render();
      let resolve;
      const promise = new Promise(done => { resolve = done; }); active = { promise, resolve };
      timer = setTimeout(() => {
        if (disposed || current !== sequence) return;
        timer = null; active = null; state = "success"; render(); resolve({ outcome: "success" });
      }, 30);
      return promise;
    }
    function suspend() {
      if (disposed) return;
      const wasLoading = state === "loading";
      cancel();
      // The complete synthetic data is already mounted and can be shown again.
      if (wasLoading) { state = "success"; render(); }
    }
    function resume() {
      if (disposed) return;
      if (state === "loading" && !active) state = "success";
      render();
    }
    function dispose() { suspend(); disposed = true; }
    retry.addEventListener("click", () => { refresh(); });
    render();
    return { setState, refresh, suspend, resume, dispose, snapshot: () => ({ state, requests, pending: Boolean(active), disposed, note: qs("#note-text").value }) };
  }
  function preferences() {
    const theme = qs("#theme-toggle"), floating = qs("#floating-toggle"), panel = qs("#fixture-floating-panel");
    function setTheme(value) {
      if (!["light", "dark"].includes(value)) throw new Error("Unsupported theme");
      document.documentElement.dataset.theme = value;
      theme.setAttribute("aria-pressed", String(value === "dark")); theme.textContent = "深色模式";
    }
    function setFloating(value, restoreFocus = false) {
      const active = value === true;
      panel.hidden = !active; document.body.dataset.floating = String(active);
      floating.setAttribute("aria-expanded", String(active));
      floating.textContent = active ? "關閉驗收面板" : "開啟驗收面板";
      if (restoreFocus) floating.focus();
    }
    theme.addEventListener("click", () => setTheme(document.documentElement.dataset.theme !== "dark" ? "dark" : "light"));
    floating.addEventListener("click", () => setFloating(panel.hidden));
    qs("#fixture-floating-close").addEventListener("click", () => setFloating(false, true));
    const query = new URLSearchParams(location.search);
    setTheme(query.get("theme") === "dark" ? "dark" : "light");
    setFloating(query.get("floating") === "1");
    return { setTheme, setFloating };
  }
  direction();caseDialog();
  const owner = createDashboardOwner(), preference = preferences();
  const query = new URLSearchParams(location.search);
  if (["loading", "empty", "error", "success"].includes(query.get("state"))) owner.setState(query.get("state"));
  window.__DASHBOARD_FIXTURE__ = Object.freeze({ ...owner, ...preference });
  window.addEventListener("pagehide", event => {
    if (event.persisted) owner.suspend(); else owner.dispose();
  });
  window.addEventListener("pageshow", event => { if (event.persisted) owner.resume(); });
  const controllerInitializationMs = performance.now() - started;
  const componentInitializationMs = window.__DASHBOARD_COMPONENT_PERFORMANCE__.initializationMs;
  window.__DASHBOARD_PERFORMANCE__ = Object.freeze({ initializationMs: componentInitializationMs + controllerInitializationMs, componentInitializationMs, controllerInitializationMs, method: "Sum of performance.now samples for component construction/chart/control initialization and the application controller; excludes script parsing, navigation and data transfer" });
  window.__DASHBOARD_READY__ = true;
})();
