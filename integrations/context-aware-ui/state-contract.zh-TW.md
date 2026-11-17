# 適用的 UI 狀態與轉換契約

[English](state-contract.md) · 繁體中文

**狀態：選用 adapter 的提案契約，尚未實作狀態管理套件。**

## 先判斷適用性

Loading、empty、error、success 是非同步資料介面的基本狀態，應放在負責該資料的邊界，不必套用到每顆按鈕或裝飾元件。若某狀態不適用，記錄原因。

保留既有的 focus、selected、expanded、dragging、disabled 等互動狀態。依功能檢查 permission、offline、partial success 與背景更新。只有四個畫面分支不代表完整狀態機。

沿用既有 store、composable 或 query owner，不要為符合文件而新增第二個資料來源或改動 service API。

## Ownership 紀錄

記錄功能與使用者任務、現有 state owner 和來源版本、初始狀態、request/action 入口、回應與錯誤契約、衍生呈現狀態、需保留的選取或輸入、副作用與受保護 service，以及適用狀態和合理省略項目。

## 媒體庫範例轉換

以下是合成情境。實作前必須映射到實際專案事件與資料型別。

| 目前狀態 | 事件或條件 | 下一狀態或保留資料 | 副作用與回饋 |
|---|---|---|---|
| Idle | 開啟面板且需要查詢 | Loading，附 request identity | 透過既有 action 載入一次 |
| Loading | 最新 request 回傳素材 | Success | 顯示穩定 key 與完整標籤 |
| Loading | 最新 request 無素材 | Empty | 顯示既有匯入操作 |
| Loading | 最新 request 失敗 | Error | 顯示已清理且可操作的訊息 |
| Error | 安全重試 | Loading | 透過既有 owner 重試，不重複匯入 |
| Success | 開始刷新 | 保留素材並標示 Refreshing | 不用全畫面 skeleton 取代可用內容 |
| 刷新中 | 刷新失敗 | 保留舊素材並顯示 stale/error | 提供安全重試並保留選取 |
| 任一待完成狀態 | 取消或卸載 | 由 owner 定義穩定或保留狀態 | 中止或忽略完成結果，避免晚到的 UI 覆寫 |
| 任一待完成狀態 | 舊 request 晚於新 request 完成 | 不採用舊 response | 依 owner 的 request identity/version 規則處理 |

## 呈現與可及性

- **Loading**：呈現合適進度或 skeleton；支援時可取消；保留焦點，避免重複播報並尊重減少動態設定。
- **Empty**：說明沒有資料的原因並提供有效下一步；區分搜尋無結果、尚未匯入和權限不足。
- **Error**：提供可及的錯誤訊息與安全復原路徑；保留輸入與焦點。資料錯誤不必然是元件渲染例外。
- **Success**：呈現必要資料與選取操作；鍵盤和 pointer 行為一致，長字串與大型清單仍可使用。
- **Refresh/partial**：保留既有資料並標示進度或限制，不可誤報完成或遺失選取。

沿用專案既有 status、alert 與 error boundary。不要宣稱單一元件錯誤處理器能攔截所有非同步、網路或 native 錯誤。

## 重試與並行規則

先辨別操作是讀取還是修改/匯入資料；重試按鈕不會自動讓副作用具冪等性。由既有 owner 定義 request identity、取消與過期回應處理。避免重複提交，並說明可用的復原方式：重試、取消、修改輸入、重新授權或檢視細節。除非產品契約明確要求，否則保留選取和編輯內容。背景更新失敗需與初次載入失敗分開。錯誤訊息不得暴露敏感路徑、token 或原始 native stack trace。

## 實作驗收證據

透過實際公開 owner/API 邊界與可控制的合成 fixture 驗證轉換，不以四張互不相連的截圖代替。

至少涵蓋延遲載入、空資料、可復原與不可復原錯誤、重試、亂序完成、卸載/取消、已有資料時刷新失敗、鍵盤復原與焦點保留，以及適用的 permission 和 partial-data 狀態。記錄每項轉換、預期不變條件、runtime 結果與尚存缺口。截圖可呈現狀態；轉換與副作用次數需有行為斷言。
