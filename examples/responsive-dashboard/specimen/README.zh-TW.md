# Harbor 客戶工作台：可執行元件範例

[English](README.md) · 繁體中文

直接開啟 `index.html`。載入順序為 `fixture-data.js` → `components.js` → `app.js`。結構來自受信任的原生 `<template>`；合成資料以文字節點及限定的本地 evidence ID 寫入。

## 可重用 factory

`DashboardComponents.create(name, props, {idPrefix})` 回傳尚未掛載的元素。新增同類元件時，提供以 `-` 結尾且不重複的 prefix；factory 會改寫內部 ID、label 與 ARIA 參照。指向頁面擁有之 evidence 的連結不會被加上 prefix。

| Factory | 內容職責 | 主要 props |
|---|---|---|
| `AccountSummary` | 客戶身分與基本資訊 | `name`、`summary`、`details` |
| `MetricGrid` | 四項指標摘要 | `items` |
| `InsightList` | 有順序的主張、證據與見面提問 | `items` |
| `RevenueMix` | 營收分類、圖例、精確數據表及局部回饋 | `title`、`mix` |
| `NotesEditor` | 有標籤的頁內筆記與儲存回饋 | `title` |
| `RevenueTrend` | 序列／月份數值、圖例、數據表與局部回饋 | `title`、`months`、`trend` |
| `OpportunityList` | 明確標記未確認的商機 | `items` |
| `CaseTable` | 案件欄位與可見操作按鈕 | `items` |

每個 factory 封裝原始合成需求中的既有內容職責。圖表建立、roving keyboard 與筆記 submit 回饋都保存自己的 root 參照；runner 以不同資料及 ID prefix 檢查第二個實例。案件按鈕送出含 `data-case` 的一般 click；頁面 host 以事件代理處理最初及稍後建立的表格，讀取該實例文字，關閉後將焦點交還仍掛載的觸發按鈕。其他 host 重用時也要提供自己的 dialog／action 綁定。

## Host 行為

`app.js` 負責單頁視覺方向、主題、浮動驗收面板、原生案件 dialog 與合成 read owner，並公開測試專用 `__DASHBOARD_FIXTURE__` 介面。Loading、empty 與 error 會隱藏資料區並設為 inert；重試回到已掛載的合成成功資料，保留筆記。進行中的重複讀取會共用同一請求。帶有 persisted 的 `pagehide` 暫停工作，`pageshow` 恢復保留的 owner；非 persisted hide 則銷毀 owner。

支援 `?theme=dark`、`?floating=1` 及 `?state=error` 等 query。Dialog 的 Enter／Escape、明確的 Tab 邊界及焦點復原列入檢查。浮動面板在桌面保留旁側空間，窄版時回到正常文件流。

## 樣式與證據

Editorial 與 cockpit 共用元件及資料結構，以間距、密度與圓角呈現差異；明暗主題獨立提供語意色彩。Container query 重新排列 Dashboard，保留完整文字、圖表數據表與案件欄位。

使用 [QA 指令](../qa/README.zh-TW.md)及[目前證據紀錄](../output/qa-review-2026-11-17.zh-TW.md)。新 CI 結果由該紀錄追蹤，舊日期報告僅適用於當時來源。本範例不包含登入、真實服務、持久化筆記、外部字型或產品效能主張。
