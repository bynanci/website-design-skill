# 渲染後視覺驗收 Adapter

[English](README.md) · 繁體中文

**狀態：選用整合契約，已有範圍明確的可執行試點。** [Dashboard QA 指南](../../examples/responsive-dashboard/qa/README.zh-TW.md) 實作凍結的 browser 矩陣及單一有限 CSS 復原操作。通用修正、vision-model 判斷與原生 shell 相容性仍在此試點之外。

## 目的

縮小設計提案與瀏覽器實際畫面之間的落差：

檢查專案 → 實作提案 → 執行已授權命令 → 渲染已知狀態 → 留存證據 → 審查問題 → 有界限修正 → 再次截圖。

每一步都須先確認能力。如果環境不能執行 app、控制 browser 或檢視影像，標記 not run，並使用現有證據繼續。

## 證據層級

分開記錄以下狀態：

- **Specified**：已寫下版面、行為或對比要求。
- **Rendered**：某 route/state 已在指定 browser/runtime/viewport 擷取。
- **Measured**：以明確方法取得溢位範圍或對比比例等數值。
- **Visually reviewed**：人員或有影像能力的 reviewer 檢視實際截圖。
- **Fixed and re-rendered**：已修改並以相同條件重新擷取。

設計提案或單張截圖不能單獨證明可及性、跨裝置正確性或正式環境效能。

## 有界限的驗收流程

1. 讀 package scripts 與現有測試設定，採用 repository 說明的命令。不得未經授權安裝套件、連外服務或執行不可信 shell command。
2. 使用本機 development server、明確 route 與合成或核准資料。截圖和 logs 不得包含 token、環境資料或不必要的個資/客戶資料。
3. 擷取專案支援的 viewport、窄容器、zoom、theme、鍵盤焦點與重要 empty/loading/error 狀態；記錄省略項目。
4. 執行可用的確定性檢查，包括 overflow、裁切、console error、focus reachability、語意名稱與專案設定的 accessibility check。對比數值需記錄實際色值與量測方法。
5. 只有具備影像檢視能力時，才回報實際視覺審查。不可從 source code 假裝完成 vision review。
6. 每個修正需連結觀察到的問題與來源位置，並限制重試次數與時間/資源。
7. 以相同 route、資料、viewport、theme 與 runtime 再次擷取，以利比較。

截圖差異是審查證據之一，不能取代語意與互動檢查。Browser render 會受環境影響。

## 多條件矩陣

沿用 Issue #7 的 dashboard specimen，不建立第二套無關 runner。每次執行需固定 source revision、fixture、字型、locale、動畫/時鐘政策與 runtime；並行執行時隔離 browser context 和應用資料。

候選條件包括：1920×1080 與 1366×768 桌面；768 CSS px 平板；390 與 320 CSS px 窄頁；320 CSS px 窄卡片；合成 480×360 浮動編輯器面板；支援的 theme 和長字串；loading/empty/error/success；鍵盤、focus、pointer/touch；以已驗證機制設定的 200% browser zoom；以及另外記錄的 Tauri OS/WebView 實際環境。

這些都是候選條件，不代表已擷取或涵蓋所有裝置。Viewport、device scale 與 browser zoom 不可混為一談；browser 渲染也無法驗證 native titlebar、OS menu 或 native dialog。

## 有界限的響應式修正

自動修改最多兩輪，另需設定 wall-time/resource 預算。保留初始 baseline 與每次嘗試，包括拒絕或回復的修改。

- 優先處理可確定問題，例如溢位、重要操作不可用、圖表標籤碰撞與焦點遺失；視覺問題需檢視實際畫面。
- 依問題選擇適合的 token、元件、模式或頁面層級；Flex、grid、media/container query 應有內容理由。
- 不可用隱藏必要內容、全域停用選取、裁切頁面、縮小到低於門檻或降低驗收標準來消除失敗。
- 使用受限 patch 契約；每次修改後重跑完整宣告矩陣。
- 只有必要的確定性檢查通過、視覺問題有處置紀錄，才接受候選修改。
- 預算耗盡、修正震盪、新回歸、行為不明或改到受保護範圍時停止，保留已知通過版本並回報未解問題。

「自癒」只描述有限修正實驗，不保證所有尺寸完美或取得可及性認證。

## 驗收紀錄與 CSV 看板

每次驗收記錄 source revision、命令與 route、runtime、viewport/zoom/theme/互動狀態、fixture、截圖或量測、觀察問題、結果狀態與修正。

處理研究或測試 CSV 時，先檢查欄位、型別、單位、缺值、重複 ID 與筆數。每種視覺編碼需對應欄位與 aggregation；完成率和錯誤率需顯示分母/樣本數。遵守匿名化規則，不把相關性或時間順序誤寫成因果；小樣本和無支持比較需標示不確定性；圖表提供表格或文字替代。先用專案已有 ECharts、D3 或 chart wrapper；只有提出理由才加依賴。
