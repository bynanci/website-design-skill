/* Synthetic public fixture: no network, persisted customer data or analytics. */
(() => {
  "use strict";
  const started = performance.now();
  const mix = window.DashboardFixtureData.RevenueMix.mix;
  const months = window.DashboardFixtureData.RevenueTrend.months;
  const trend = window.DashboardFixtureData.RevenueTrend.trend;
  const qs = selector => document.querySelector(selector);
  const namespace="http://www.w3.org/2000/svg";
  function svg(parent,name,attrs,text){
    const element=document.createElementNS(namespace,name);
    Object.entries(attrs).forEach(([key,value])=>element.setAttribute(key,String(value)));
    if(text!==undefined)element.textContent=String(text);
    parent.appendChild(element);return element;
  }
  function feedback(id,message){document.getElementById(id).textContent=message;}
  function buildMix(){
    const group=qs("#donut-segments"),legend=qs("#revenue-legend"),tbody=qs("#mix-data");
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
      const announce=()=>feedback("mix-feedback",name+"："+value+" 萬元，占 "+percent+"%。");
      segment.addEventListener("focus",announce);
      segment.addEventListener("mouseenter",announce);
      segment.addEventListener("click",announce);
      offset+=dash;
      const button=document.createElement("button");
      button.type="button";button.className="legend-item";
      button.innerHTML='<span class="legend-chip c'+(index+1)+'" aria-hidden="true"></span><span>'+name+'</span><strong>'+percent+'%</strong>';
      button.setAttribute("aria-label",name+"："+value+" 萬元，占 "+percent+"%");
      button.addEventListener("click",announce);button.addEventListener("focus",announce);
      legend.append(button);
      const tr=document.createElement("tr");
      tr.innerHTML='<th scope="row">'+name+"</th><td>"+value+"</td><td>"+percent+"%</td>";
      tbody.append(tr);
    });
  }
  function buildTrend(){
    const graph=qs("#trend-svg"),legend=qs("#trend-key");
    const left=50,top=18,width=590,height=206,min=0,max=150;
    const x=index=>left+index*width/(months.length-1);
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
      key.innerHTML='<span class="legend-chip c'+(index+1)+'" aria-hidden="true"></span>'+name;
      legend.append(key);
      values.forEach((value,i)=>{
        const message=name+" "+months[i]+"："+value+" 萬元。";
        const dot=svg(graph,"circle",{cx:x(i),cy:y(value),r:5.8,
          fill:"var(--chart-"+(index+1)+")",stroke:"var(--surface)","stroke-width":2,
          tabindex:0,role:"img","aria-label":message,
          "data-chart-point":"trend","data-series":name,"data-month":months[i]});
        ["focus","mouseenter","click"].forEach(event=>dot.addEventListener(event,
          ()=>feedback("trend-feedback",message)));
      });
    });
    qs("#trend-table-head").innerHTML='<tr><th scope="col">月份</th>'+
      trend.map(([name])=>'<th scope="col">'+name+'（萬元）</th>').join("")+"</tr>";
    qs("#trend-table-body").innerHTML=months.map((month,index)=>
      '<tr><th scope="row">'+month+"</th>"+
      trend.map(([,values])=>"<td>"+values[index]+"</td>").join("")+"</tr>"
    ).join("");
  }
  /**
   * One Tab stop per chart; arrow keys navigate data points. The expanded
   * data table remains the durable reading alternative for every value.
   * This avoids forcing users through 23 separate points just to reach
   * the next section.
   */
  function rovingChart(kind){
    const points=Array.from(document.querySelectorAll('[data-chart-point="'+kind+'"]'));
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
  function notes(){
    qs("#note-form").addEventListener("submit",event=>{
      event.preventDefault();
      const input=qs("#note-text");
      if(!input.value.trim()){feedback("note-status","請輸入會後判斷");input.focus();return;}
      feedback("note-status","已在本頁暫存（未傳送到伺服器）");
    });
    qs("#note-text").addEventListener("input",()=>feedback("note-status","內容尚未儲存"));
  }
  function caseDialog(){
    const dialog=qs("#case-dialog"),title=qs("#case-dialog-title");
    let returnFocus=null;
    const descriptions={
      "CS-2026-081":"雲端專線延遲 · 高優先級。示範狀態：調查中。預定完成日：11/18。",
      "CS-2026-076":"備援路由調整 · 一般優先級。示範狀態：待確認。預定完成日：11/20。",
      "CS-2026-070":"服務監測報表 · 一般優先級。示範狀態：處理中。預定完成日：11/21。"
    };
    document.querySelectorAll("[data-case]").forEach(button=>button.addEventListener("click",()=>{
      returnFocus=button;
      const id=button.dataset.case;
      title.textContent="案件 "+id;
      qs("#case-dialog-description").textContent=descriptions[id];
      dialog.showModal();title.focus();
    }));
    const close=()=>dialog.close();
    qs("#close-dialog").addEventListener("click",close);
    qs("#dialog-done").addEventListener("click",close);
    dialog.addEventListener("close",()=>{if(returnFocus){returnFocus.focus();returnFocus=null;}});
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
    function dispose() { cancel(); disposed = true; }
    retry.addEventListener("click", () => { refresh(); });
    render();
    return { setState, refresh, dispose, snapshot: () => ({ state, requests, pending: Boolean(active), disposed, note: qs("#note-text").value }) };
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
  buildMix();buildTrend();rovingChart("mix");rovingChart("trend");direction();notes();caseDialog();
  const owner = createDashboardOwner(), preference = preferences();
  const query = new URLSearchParams(location.search);
  if (["loading", "empty", "error", "success"].includes(query.get("state"))) owner.setState(query.get("state"));
  window.__DASHBOARD_FIXTURE__ = Object.freeze({ ...owner, ...preference });
  window.addEventListener("pagehide", () => owner.dispose(), { once: true });
  window.__DASHBOARD_PERFORMANCE__ = Object.freeze({ initializationMs: performance.now() - started, method: "performance.now around synchronous chart/control/state initialization; excludes browser navigation and data transfer" });
  window.__DASHBOARD_READY__ = true;
})();
