# 宣告式 Runtime Recovery 試點

[English](README.md) · 繁體中文

**狀態：範圍受限的合成實作。** 媒體 fixture 已包含嚴格資料驗證器、host capability 邊界、可信任的 Vue renderer 與靜態復原。尚未測試 live model 傳輸或推論費用。

## 執行試點

安裝選用的 [Vue 工具](../vue-project-profile/README.zh-TW.md)，再於 repository 根目錄執行：

```sh
node --test integrations/vue-project-profile/runtime.test.mjs
node integrations/vue-project-profile/render-runtime.mjs
```

Browser harness 會產生 `artifacts/runtime-results.json` 與截圖。`--build-only` 只比較 production bundle，不宣稱瀏覽器結果。Fixture 以可信任的本地 JSON producer 測試合法、格式錯誤、過大、不可用、延遲與逾時生成；一般 fixture 預設使用靜態復原。

## Host 與權限邊界

`createRecoveryHost()` 接受可信任的當前 owner snapshot、既有 `retry()`、時鐘及選用生成服務 callback。它僅傳送核准的錯誤代碼、是否有可用資料、是否允許重試、request/state ID 與固定版本資訊；排除素材名稱、filter、log、憑證與原始診斷文字。

Host 僅接受 `ui-panel/0.1` 與 `media-recovery/0.1` registry。固定元件皆為版本 1：`Group`、`Notice`、`ActionButton`。唯一 action 是參數為空物件的 `retryMediaRead`，只委派給既有 Pinia owner，不可新增 API、檔案系統或 native command。

Host 在驗證後產生一次性 action token；producer 無法提供 token。啟動 action 時檢查當前 owner revision、錯誤/權限、期限及 request capability。Host 先撤銷舊 capability 才觸發 abort callback，並在同步 observer 執行後再次檢查權限。時鐘倒退、過期、重放、stale action 與格式錯誤的參數均會被拒絕。

這是同 origin JavaScript 邊界，無法對其他可信任的應用程式碼提供 process sandbox。MCP 可以傳遞資料，但不會授予權限。真實 host 仍須執行自己的驗證身分、確認與隔離規則。

## 嚴格 Payload 契約

參閱 [runtime-payload.schema.json](runtime-payload.schema.json) 與 `examples/media-library-vue/src/runtime/contract.js` 的可執行驗證器。

| 限制 | 數值 |
|---|---:|
| 序列化 UTF-8 payload | 8,192 bytes |
| 節點總數 | 32 |
| 樹深度 | 4 |
| 每個 group 或 root 的子節點 | 8 |
| 文字總量 | 4,096 UTF-8 bytes |
| Producer 期限 | 1–60,000 ms |
| Host action 期限 | 此 fixture 最多 30,000 ms |
| UI 生成逾時 | 1,500 ms；確定性測試採較短期限 |

每一層均拒絕未知屬性；拒絕 code/template/HTML/CSS/expression/URL/native-command 欄位、任意元件/action 與不相容版本。配置 UTF-8 buffer 前先限制字串長度，再檢查精確 byte 數。

文字一律視為不透明資料，以 Vue text interpolation 呈現。外觀像 HTML 或 expression 的文字不會被編譯。本試點沒有圖片元件，因此不接受遠端圖片或 asset URL；未來若需要插圖，必須另建固定的本地 asset registry。

## 支援回應

```json
{
  "schemaVersion": "ui-panel/0.1",
  "registryVersion": "media-recovery/0.1",
  "requestId": "synthetic-case-01",
  "stateVersion": "media-state-4",
  "expiresAfterMs": 30000,
  "nodes": [
    {"type":"Notice","props":{"tone":"warning","title":"Suggested recovery","text":"The existing read owner can retry the current request."}},
    {"type":"ActionButton","props":{"label":"Retry media read"},"action":{"id":"retryMediaRead","params":{}}}
  ]
}
```

Request 與 state 必須符合 host request。Host 限制期限，並在已驗證的 render view 中加入私有 token。此 view 是 host 內部紀錄，不是 producer payload；生成指引會明確標為建議。

## 失敗與鍵盤行為

Payload 無效、生成逾時、不可用、action 過期或 state 變動時，使用當前靜態復原。關閉、取消及卸載會使 pending generation 失效，即使 producer 忽略 abort 也不能更新畫面。不可重試的權限狀態不會提供 retry action。

受限的原生 dialog 具有穩定的關閉控制項、Escape、鍵盤操作與焦點還原。若 retry 使開啟按鈕不可用，焦點會回到既有 media-load 控制項。同一套 browser harness 檢查文字跳脫、輸入最小化、原生事件、重放/期限/權限拒絕，以及卸載的 microtask 邊界。

## 成本與證據

Harness 以固定且可信任的 build alias，將相同 production fixture 的動態元件替換為靜態復原元件，各 build 一次並記錄 JS/CSS 的 raw/gzip bytes。冷開啟另外量測；兩次 warmup 後，各收集 20 次開啟至 Vue DOM commit 的樣本，保留原始值、median、p95 與範圍。

宣告門檻為本地 fixture producer 的 p95 不超過 250 ms，新增 gzip JavaScript 不超過 64 KiB；payload 限制與正確性檢查仍必須通過。這些是受限原型的預算，不代表 production 效能，也不保證應用程式 bundle 變小。

沒有呼叫外部模型。Fixture 推論費用為零；live model 延遲與金額維持 null，並附未執行原因。Workflow artifact 保存來源/工具 hash、實際 runtime 版本、命令、失敗紀錄與截圖。Process isolation、live model 整合、輔助科技、實體裝置及 native shell 仍需各自取得證據。
