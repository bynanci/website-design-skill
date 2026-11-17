/* Reusable native template components. Only trusted templates supply markup. */
(() => {
  "use strict";
  const fixture = window.DashboardFixtureData;
  function deepFreeze(value) {
    Object.values(value).forEach(child => { if (child && typeof child === "object") deepFreeze(child); });
    return Object.freeze(value);
  }
  deepFreeze(fixture);
  const text = (root, selector, value) => {
    const node = root.querySelector(selector);
    if (!node) throw new Error("Missing component text target: " + selector);
    node.textContent = String(value);
  };
  function repeat(root, selector, items, bind) {
    if (!Array.isArray(items)) throw new TypeError("Component items must be an array");
    const existing = Array.from(root.querySelectorAll(selector));
    const parent = existing[0]?.parentNode;
    if (!parent) throw new Error("Missing repeat template: " + selector);
    const prototype = existing[0].cloneNode(true);
    existing.forEach(node => node.remove());
    items.forEach((item, index) => { const node = prototype.cloneNode(true); bind(node, item, index); parent.append(node); });
  }
  const binders = {
    AccountSummary(root, props) {
      text(root, "#account-name", props.name);
      text(root, ".account-identity p", props.summary);
      root.querySelectorAll(".account-details dd").forEach((node, i) => { node.textContent = String(props.details[i] ?? ""); });
    },
    MetricGrid(root, props) {
      repeat(root, ".metric", props.items, (node, item) => {
        text(node, "h2", item.title); text(node, ".metric-glyph", item.glyph); text(node, ".metric-foot", item.foot);
        const value = node.querySelector(".metric-value");
        value.classList.toggle("positive", Boolean(item.positive));
        value.replaceChildren(document.createTextNode(String(item.value)));
        const unit = document.createElement("small"); unit.textContent = String(item.unit); value.append(unit);
      });
    },
    InsightList(root, props) {
      repeat(root, ".observation", props.items, (node, item, i) => {
        text(node, ".obs-number", String(i + 1).padStart(2, "0")); text(node, "h3", item.title);
        text(node, ".obs-content > p", item.description); text(node, ".meeting-question p", item.question);
        text(node, ".evidence-row a", item.source); text(node, ".evidence-row span", item.kind);
        // Fixture evidence links are local trusted IDs, never model or user URLs.
        if (!/^#evidence-\d{2}$/.test(item.href)) throw new Error("Unsupported fixture evidence ID");
        node.querySelector(".evidence-row a").setAttribute("href", item.href);
        const priority = node.querySelector(".priority-label");
        if (item.priority) priority.textContent = String(item.priority); else priority.remove();
      });
      text(root, ".heading-count", String(props.items.length).padStart(2, "0"));
    },
    RevenueMix(root, props) {
      text(root, "#mix-heading", props.title);
      text(root, ".donut-center-value", props.mix.reduce((sum, item) => sum + item[1], 0));
    },
    NotesEditor(root, props) { text(root, "#notes-heading", props.title); },
    RevenueTrend(root, props) { text(root, "#trend-heading", props.title); },
    OpportunityList(root, props) {
      repeat(root, ".opportunity-list li", props.items, (node, item, i) => {
        text(node, ".opportunity-number", String(i + 1).padStart(2, "0")); text(node, "h3", item.title);
        text(node, "p", item.description); text(node, ".opportunity-status", item.status);
      });
    },
    CaseTable(root, props) {
      repeat(root, "tbody tr", props.items, (node, item) => {
        const cells = node.querySelectorAll("td");
        [0, 1, 3, 4].forEach(i => { cells[i].textContent = String(item[i]); });
        cells[2].querySelector(".severity").textContent = String(item[2]);
        cells[2].querySelector(".severity").className = "severity " + (item[2] === "高" ? "high" : "normal");
        cells[5].querySelector(".case-state").textContent = String(item[5]);
        cells[6].querySelector("button").setAttribute("data-case", String(item[0]));
      });
    }
  };
  function prefixIds(root, prefix) {
    if (!prefix) return;
    if (!/^[a-zA-Z][\w-]*-$/.test(prefix)) throw new Error("A component ID prefix must end with a hyphen");
    const nodes = [root, ...root.querySelectorAll("[id]")];
    const ids = new Map(nodes.filter(node => node.id).map(node => [node.id, prefix + node.id]));
    nodes.forEach(node => { if (ids.has(node.id)) node.id = ids.get(node.id); });
    [root, ...root.querySelectorAll("[aria-labelledby],[aria-describedby],[for],[href]")].forEach(node => {
      ["aria-labelledby", "aria-describedby", "for"].forEach(attribute => {
        if (node.hasAttribute(attribute)) node.setAttribute(attribute, node.getAttribute(attribute).split(/\s+/).map(id => ids.get(id) || id).join(" "));
      });
      if (node.getAttribute("href")?.startsWith("#")) {
        const id = node.getAttribute("href").slice(1); if (ids.has(id)) node.setAttribute("href", "#" + ids.get(id));
      }
    });
  }
  function create(name, props = {}, { idPrefix = "" } = {}) {
    if (!Object.hasOwn(binders, name)) throw new Error("Unknown dashboard component");
    const template = document.getElementById("component-" + name);
    const root = template.content.firstElementChild.cloneNode(true);
    binders[name](root, { ...fixture[name], ...props });
    prefixIds(root, idPrefix);
    root.dataset.component = name;
    return root;
  }
  const mounted = [];
  document.querySelectorAll("[data-dashboard-component]").forEach(placeholder => {
    const name = placeholder.dataset.dashboardComponent;
    placeholder.replaceWith(create(name)); mounted.push(name);
  });
  window.DashboardComponents = Object.freeze({ create, names: Object.freeze(Object.keys(binders)), mounted: Object.freeze(mounted) });
})();
