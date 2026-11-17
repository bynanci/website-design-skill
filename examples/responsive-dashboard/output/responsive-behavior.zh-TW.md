# Harbor Dashboard：響應式行為契約

[English](responsive-behavior.md) · 繁體中文

目前原生範例已實作下列行為，[2026-11-17 QA 紀錄](qa-review-2026-11-17.zh-TW.md)追蹤特定候選結果。2026-11-16 報告中的高度屬於歷史量測，不可直接當成新版版面的量測值。

## 內容優先序與保留

| 群組 | 寬版行為 | 窄版行為 | 必須保留 |
|---|---|---|---|
| 客戶摘要 | 完整身分及聯絡欄位 | 名稱換行、不截斷 | 身分／聯絡資訊可抵達 |
| 指標 | 空間足夠時四欄 | 兩欄 grid | 標籤、值及單位 |
| 觀察 | 主要閱讀欄 | 全寬有序列表與手機捷徑 | 所有主張、證據與問題 |
| 營收組成 | 支援圖表／圖例區 | 圖例重排、保留數據表 | 五個分類與精確值 |
| 營收趨勢 | 多序列圖表與圖例 | 容器內縮放及數據表替代 | 三個序列、十八個點 |
| 商機 | 支援 panel | 全寬列表 | 明確的不確定標示 |
| 案件 | 完整表格及可見按鈕 | 表格局部水平捲動 | 每個欄位及操作 |
| 筆記 | 位於觀察流程旁 | 排在主要內容之後 | 合成復原期間保留已掛載欄位 |

1190、875、525、340 CSS px 的 container threshold 只適用此 fixture，不能當成通用 breakpoint。浮動驗收面板在桌面保留側邊空間，窄 viewport 時回到文件流；必要可見操作不能被遮擋。

## 狀態與互動所有權

合成 read owner 提供 loading、empty、error、success、鍵盤重試及 status／alert 語意。無法使用的內容會隱藏並設為 inert。重複 refresh 共用請求，復原保留筆記。Persisted page-transition probe 暫停／恢復 owner，非 persisted hide 銷毀 owner。這不等於真實 API 或實際 BFCache 導航驗收。

每張圖表有一個 roving Tab stop，支援 Arrow／Home／End、局部具名回饋及完整數據表。Runner 使用真正露出的 SVG pointer 位置，不假設 bounding-box 中心可互動。Dialog 初始焦點進入標題，Tab 留在明確邊界內，關閉後回到觸發處。模擬觸控則檢查圖例與案件按鈕的 tap 操作。

## 已定義的條件矩陣

二十種 viewport／方向／主題組合，加上十二項互動、狀態、容器、浮動、觸控及長文字條件，共 32 項瀏覽器矩陣。另以兩張 headed Chromium 截圖檢查 editorial 明暗主題的實際原生 200% page zoom。683px 寬度代理保留為不同條件。

六次 axe-core 掃描涵蓋 editorial 的 1366／390／320 CSS px 及明暗主題。Navigation／Paint Timing 原始值僅描述當次 file fixture，不宣稱速度提升或產品預算。驗收前，日期報告必須列出完成、失敗與未執行條件。

## 桌面捲動與待決事項

作者選擇 editorial 作為觀察／證據閱讀的預設值，不承諾在 1366×768 中一屏顯示所有內容。先保留必要文字、資料與操作，再依新截圖記錄人工對捲動及密度的決定。

Not tested：實體裝置、螢幕閱讀器、原生 Tauri、真實登入／API／持久化、產品效能、任意語系／內容、cockpit 原生縮放與真人任務結果。其他 host 需自行檢查元件／token，並提供案件 dialog 綁定，才能宣稱完成整合。

## 範圍與復原

所有樣式都屬於獨立 fixture，沒有覆寫正式產品 stylesheet。方向與主題 attribute 選擇已審查的局部規則；設回 `editorial`、`light` 可返回預設。關閉浮動面板會收回保留空間。窄容器及長文字注入只存在於可丟棄的 QA 頁面。有限修正實驗只修改副本的 `.mix-body` 宣告，並保存精確前後位元；來源衝突時停止回滾，避免覆寫其他修改。
