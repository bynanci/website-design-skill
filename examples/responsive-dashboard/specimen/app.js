/* Synthetic public fixture: no network, persisted customer data or analytics. */
(() => {
  "use strict";
  const mix = [
    ["雲端專線",302],["企業網路",226],["資訊安全",138],
    ["資料中心",102],["其他服務",74]
  ];
  const months=["6 月","7 月","8 月","9 月","10 月","11 月"];
  const trend=[
    ["雲端專線",[82,88,91,101,108,121]],
    ["企業網路",[78,79,77,80,81,84]],
    ["資訊安全",[36,38,42,46,49,52]]
  ];
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
  buildMix();buildTrend();direction();notes();caseDialog();
})();
