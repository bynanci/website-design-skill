# 響應式客戶 Dashboard：v0.2 選用範例

[English](README.md) · 繁體中文

此公開範例把視覺方向、響應式與 token 契約套用到合成客戶資料。實作包含八個可重用原生 template factory、兩種視覺方向、明暗主題，以及合成載入／復原 owner。

目前 browser runner 定義 32 項矩陣條件，另有兩張原生 200% page zoom 擷取。[2026-11-17 證據紀錄](output/qa-review-2026-11-17.zh-TW.md)追蹤候選版本與 CI 結果。定義檢查不等於已通過；[2026-11-16 報告](output/qa-review-2026-11-16.md)保留為當時來源的歷史證據。

## 開始使用

以現代瀏覽器開啟 [specimen/index.html](specimen/index.html)。不需要 build、後端、外部字型或網路請求。姓名、日期與金額皆為合成資料。

- [原始合成輸入](input/current-page.md)保留當初不完整的設計題目。
- [元件與 host 契約](specimen/README.zh-TW.md)說明重用方式與所有權。
- [響應式行為](output/responsive-behavior.zh-TW.md)定義內容保留及驗收邊界。
- [視覺方向](output/visual-direction-comparison.zh-TW.md)記錄作者選擇閱讀優先預設值的理由。
- [Token 盤點](output/design-token-extraction.zh-TW.md)對應實際 CSS 來源與使用處。
- [QA 指令](qa/README.zh-TW.md)產生量測、截圖與失敗紀錄。

## 支援範圍

原生 factory 已在此獨立範例中實作；Vue／React 整合與其他產品元件庫的相容性仍需個別證據。客戶資料、重試及 page lifecycle 為合成流程。筆記只留在已掛載的輸入欄位，不會持久化或傳送。

此範例不列入官方 v0.1 40 分 benchmark。實體裝置、螢幕閱讀器、原生 Tauri、真實客戶整合與產品效能尚未執行驗收。產品人工驗收與自動檢查分開判定。
