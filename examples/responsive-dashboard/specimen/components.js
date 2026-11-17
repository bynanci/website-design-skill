/* Reusable native template components. Only trusted templates supply markup. */
(() => {
  "use strict";
  const started = performance.now();
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
  const namespace="http://www.w3.org/2000/svg";
  function svg(parent,name,attrs,text){
    const element=document.createElementNS(namespace,name);
    Object.entries(attrs).forEach(([key,value])=>element.setAttribute(key,String(value)));
    if(text!==undefined)element.textContent=String(text);
    parent.appendChild(element);return element;
  }
  function buildMix(root, { mix }){
    const qs = selector => root.querySelector(selector);
    const feedback = qs("#mix-feedback");
    const group=qs("#donut-segments"),legend=qs("#revenue-legend"),tbody=qs("#mix-data");
    [group, legend, tbody].forEach(node => node.replaceChildren());
    if (!Array.isArray(mix) || !mix.length || mix.length > 5 || mix.some(item => !Array.isArray(item) || typeof item[0] !== "string" || !Number.isFinite(item[1]) || item[1] < 0) || mix.every(item => item[1] === 0)) throw new TypeError("Revenue mix requires one to five named non-negative values and a positive total");
    const radius=91,perimeter=2*Math.PI*radius,total=mix.reduce((sum,item)=>sum+item[1],0);
    let offset=0;
    svg(group,"circle",{cx:130,cy:130,r:radius,fill:"none",stroke:"var(--chart-track)","stroke-width":30});
    mix.forEach(([name,value],index)=>{
      const percent=(value/total*100).toFixed(1),dash=value/total*perimeter;
      const segment=svg(group,"circle",{
        cx:130,cy:130,r:radius,fill:"none",stroke:"var(--chart-"+(index+1)+")",
        "stroke-width":30,"stroke-dasharray":dash+" "+(perimeter-dash),
        "stroke-dashoffset":-offset,transform:"rotate(-90 130 130)",
        tabindex:0,role:"img","aria-label":name+"，"+value+" 萬元，"+percent+"%",
        "data-chart-point":"mix","data-series":name
      });
      const announce=()=>{ feedback.textContent=name+"："+value+" 萬元，占 "+percent+"%。"; };
      segment.addEventListener("focus",announce);
      segment.addEventListener("mouseenter",announce);
      segment.addEventListener("click",announce);
      offset+=dash;
      const button=document.createElement("button");
      button.type="button";button.className="legend-item";
      const chip=document.createElement("span");chip.className="legend-chip c"+(index+1);chip.setAttribute("aria-hidden","true");
      const label=document.createElement("span");label.textContent=name;
      const share=document.createElement("strong");share.textContent=percent+"%";
      button.append(chip,label,share);
      button.setAttribute("aria-label",name+"："+value+" 萬元，占 "+percent+"%");
      button.addEventListener("click",announce);button.addEventListener("focus",announce);
      legend.append(button);
      const tr=document.createElement("tr"),heading=document.createElement("th"),amount=document.createElement("td"),shareCell=document.createElement("td");
      heading.setAttribute("scope","row");heading.textContent=name;amount.textContent=String(value);shareCell.textContent=percent+"%";
      tr.append(heading,amount,shareCell);tbody.append(tr);
    });
  }
  function buildTrend(root, { months, trend }){
    const qs = selector => root.querySelector(selector);
    const feedback=qs("#trend-feedback"), graph=qs("#trend-svg"),legend=qs("#trend-key");
    [graph,legend,qs("#trend-table-head"),qs("#trend-table-body")].forEach(node => node.replaceChildren());
    if (!Array.isArray(months) || !months.length || !months.every(item => typeof item === "string") || !Array.isArray(trend) || !trend.length || trend.length > 5 || trend.some(item => !Array.isArray(item) || typeof item[0] !== "string" || !Array.isArray(item[1]) || item[1].length !== months.length || item[1].some(value => !Number.isFinite(value) || value < 0 || value > 150))) throw new TypeError("Revenue trend requires matching named month/series values in the declared 0–150 range");
    const left=50,top=18,width=590,height=206,min=0,max=150;
    const x=index=>left+index*width/Math.max(1,months.length-1);
    const y=value=>top+height-(value-min)/(max-min)*height;
    [0,50,100,150].forEach(value=>{
      const yy=y(value);
      svg(graph,"line",{x1:left,y1:yy,x2:left+width,y2:yy,class:"gridline"});
      svg(graph,"text",{x:38,y:yy+4,class:"axis-tick","text-anchor":"end"},value);
    });
    months.forEach((month,index)=>svg(graph,"text",{
      x:x(index),y:top+height+26,class:"axis-tick","text-anchor":"middle"
    },month));
    trend.forEach(([name,values],index)=>{
      const points=values.map((value,i)=>x(i)+","+y(value)).join(" ");
      svg(graph,"polyline",{points,fill:"none",stroke:"var(--chart-"+(index+1)+")",
        "stroke-width":3.2,"stroke-linejoin":"round","stroke-linecap":"round"});
      const key=document.createElement("span");key.className="trend-key-item";
      const chip=document.createElement("span");chip.className="legend-chip c"+(index+1);chip.setAttribute("aria-hidden","true");
      key.append(chip,document.createTextNode(name));
      legend.append(key);
      values.forEach((value,i)=>{
        const message=name+" "+months[i]+"："+value+" 萬元。";
        const dot=svg(graph,"circle",{cx:x(i),cy:y(value),r:5.8,
          fill:"var(--chart-"+(index+1)+")",stroke:"var(--surface)","stroke-width":2,
          tabindex:0,role:"img","aria-label":message,
          "data-chart-point":"trend","data-series":name,"data-month":months[i]});
        ["focus","mouseenter","click"].forEach(event=>dot.addEventListener(event,
          ()=>{ feedback.textContent=message; }));
      });
    });
    const head=document.createElement("tr"),monthHeading=document.createElement("th");
    monthHeading.setAttribute("scope","col");monthHeading.textContent="月份";head.append(monthHeading);
    trend.forEach(([name])=>{const heading=document.createElement("th");heading.setAttribute("scope","col");heading.textContent=name+"（萬元）";head.append(heading);});
    qs("#trend-table-head").append(head);
    months.forEach((month,index)=>{
      const row=document.createElement("tr"),heading=document.createElement("th");heading.setAttribute("scope","row");heading.textContent=month;row.append(heading);
      trend.forEach(([,values])=>{const cell=document.createElement("td");cell.textContent=String(values[index]);row.append(cell);});
      qs("#trend-table-body").append(row);
    });
  }
  /**
   * One Tab stop per chart; arrow keys navigate data points. The expanded
   * data table remains the durable reading alternative for every value.
   * This avoids forcing users through 23 separate points just to reach
   * the next section.
   */
  function rovingChart(root, kind){
    const points=Array.from(root.querySelectorAll('[data-chart-point="'+kind+'"]'));
    if(points.length===0)return;
    const setCurrent=index=>{
      points.forEach((point,i)=>point.setAttribute("tabindex",String(i===index?0:-1)));
    };
    points.forEach((point,index)=>{
      point.setAttribute("tabindex",String(index===0?0:-1));
      point.addEventListener("focus",()=>setCurrent(index));
      point.addEventListener("keydown",event=>{
        let next=index;
        if(event.key==="ArrowRight"||event.key==="ArrowDown")next=(index+1)%points.length;
        else if(event.key==="ArrowLeft"||event.key==="ArrowUp")next=(index+points.length-1)%points.length;
        else if(event.key==="Home")next=0;
        else if(event.key==="End")next=points.length-1;
        else return;
        event.preventDefault();
        setCurrent(next);
        points[next].focus();
      });
    });
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
      buildMix(root, props);rovingChart(root, "mix");
      text(root, ".donut-center-value", props.mix.reduce((sum, item) => sum + item[1], 0));
    },
    NotesEditor(root, props) {
      text(root, "#notes-heading", props.title);
      const form=root.querySelector("#note-form"),input=root.querySelector("#note-text"),status=root.querySelector("#note-status");
      form.addEventListener("submit",event=>{
        event.preventDefault();
        if(!input.value.trim()){status.textContent="請輸入會後判斷";input.focus();return;}
        status.textContent="已在本頁暫存（未傳送到伺服器）";
      });
      input.addEventListener("input",()=>{status.textContent="內容尚未儲存";});
    },
    RevenueTrend(root, props) { text(root, "#trend-heading", props.title);buildTrend(root, props);rovingChart(root, "trend"); },
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
  window.__DASHBOARD_COMPONENT_PERFORMANCE__ = Object.freeze({ initializationMs: performance.now() - started, method: "performance.now around template component construction, data binding and local chart/control initialization; excludes script parsing and navigation" });
  window.DashboardComponents = Object.freeze({ create, names: Object.freeze(Object.keys(binders)), mounted: Object.freeze(mounted) });
})();
