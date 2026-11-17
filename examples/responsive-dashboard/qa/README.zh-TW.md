# Dashboard 瀏覽器 QA

[English](README.md) · 繁體中文

請在 repository 根目錄執行。Runner 透過 `file://` 渲染公開合成範例，保存 JSON、整頁截圖及影像 hash。

```sh
python -m pip install 'playwright==1.56.0'
python -m playwright install --with-deps chromium
npm install --no-save --no-package-lock axe-core@4.10.3
python examples/responsive-dashboard/qa/run_browser_qa.py
```

此命令執行 32 項條件矩陣。原生瀏覽器縮放使用另一個機制，未啟用時會明確記為 not run。

## 原生 200% page zoom

Linux 安裝 Xvfb、xdotool 與 ImageMagick 後，使用同一 pipeline：

```sh
sudo apt-get install -y xvfb xdotool imagemagick
DASHBOARD_NATIVE_ZOOM=1 DASHBOARD_MAX_CAPTURES=40 DASHBOARD_MAX_SECONDS=480 \
  xvfb-run -a -s '-screen 0 1920x1080x24' \
  python examples/responsive-dashboard/qa/run_browser_qa.py
```

Helper 以 headed Chromium 執行，不模擬 viewport。它送出真正的 X11 Ctrl+0／Ctrl++ 鍵盤指令，驗證 DPR 加倍、CSS viewport 減半、視窗外框寬度維持相同，以及 visual scale 為 1。它另擷取預設 editorial 方向的明暗主題，共兩張原生縮放截圖。使用 ImageMagick 擷取真正的 X11 瀏覽器視窗，包含 browser chrome 與可見 viewport；不把 CDP 整頁影像當成原生縮放截圖。683 CSS px 的寬度代理仍是獨立條件，不能充當原生縮放證據。

## 已定義的檢查

- 二十種組合：五種尺寸（1920×1080、1366×768、768×1000、390×844、320×700）、兩種方向與兩種主題。
- 十二項其他條件：開啟 dialog；圖表／dialog／筆記鍵盤操作；寬度代理；360px 窄容器；loading、empty、error、復原；浮動面板開啟／關閉；模擬觸控 dialog；320px 長文字。
- 內容相等、圖表／圖例交疊、表格容器邊界及已定義的控制尺寸。
- 使用不同 props 的圖表／筆記實例：數據表、實際 pointer／focus 數值、鍵盤導覽、筆記送出與 ID 範圍。
- 六次 axe-core 掃描：editorial 的 1366／390／320 CSS px，各自檢查明暗主題，使用 WCAG A／AA tags。
- persisted 暫停／恢復及非 persisted 銷毀的合成 page-transition probe；這不等於實際 BFCache 導航量測。

## 證據與執行控制

`qa-results.json` 保存 specimen 及 runner digest、實際 runtime 版本、Actions 資訊、定義／完成條件順序、影像 hash、失敗及原始 Navigation／Paint Timing。`native-zoom-results.json` 保存獨立的 page zoom 機制與來源 hash。時間數值僅為當次觀察，不代表效能提升或產品預算。

`DASHBOARD_QA_OUTPUT` 指定外部輸出目錄；`DASHBOARD_CHROMIUM_EXECUTABLE` 指定已安裝的 Chromium；`DASHBOARD_HEADED=1` 啟用主矩陣的視窗模式；`DASHBOARD_SPECIMEN_ROOT` 指向包含 `specimen/` 的獨立範例目錄。Workflow 設定 40 張擷取、480 秒上限，失敗時仍保存輸出。缺少或失敗條件不會視為通過。

另見[目前證據](../output/qa-review-2026-11-17.zh-TW.md)及[歷史證據](../output/qa-review-2026-11-16.md)。影像審查、實體裝置、螢幕閱讀器、原生 Tauri、產品網路及 WCAG 合規需另有證據。

## 有限修正實驗

先在 `integrations/vue-project-profile` 執行 `npm ci --ignore-scripts`，安裝選用工具。在同一個 Xvfb session 先執行上方完整 QA，再執行：

```bash
node examples/responsive-dashboard/qa/run_bounded_repair.mjs
```

Runner 要求當次通過的參考，且來源、native helper 及 runtime hash 相同。它將 fixture 複製到獨占暫存 workspace，把唯一頂層 `.mix-body` 的欄寬注入為 `640px 640px`，再透過 PostCSS 來源座標只還原已審查的值。原始 fixture 不會被修改。

`repair-contract.json` 限制最多兩次修改、包含參考在內三次完整矩陣 process、240 張擷取及 600 秒。每輪沿用相同 32 項條件與原生縮放 helper。`evidence/bounded-repair/` 保存通過參考、失敗基線、候選 CSS／diff、process、影像、量測及最終處置。條件缺漏、來源衝突、回歸、震盪或預算耗盡都會停止。DOM 通過仍需另外檢查實際影像。此為單一已審查的復原操作，不等於通用版面生成；不會呼叫外部模型。
