# 合成媒體庫狀態轉換 fixture

[English](README.md) · 繁體中文

此 Vue／Pinia fixture 實作 Issue #13 的有限範圍媒體庫狀態轉換。素材名稱與長度均為合成資料；不讀取素材檔、不呼叫 native service、不傳送網路請求、不持久化編輯，也不修改凍結的 v0.1 benchmark。

## Owner 與支援狀態

`src/stores/media-library.js` 是唯一的 UI 狀態 owner。View 呼叫該 store，store 再經由 `src/services/media-api.js` 的唯讀 `listMedia` 邊界取得資料。Service 接收 `AbortSignal` 與目前篩選文字，回傳 `{ items, partial }`。測試可注入本地來源以控制回應；不新增第二個 store，也不讓 view 直接呼叫 service。

| 條件 | 行為 |
|---|---|
| 首次載入前 | `idle`，清單空白 |
| 首次讀取延遲 | `loading`，以狀態文字通知進度 |
| 空白結果 | `success`，顯示無符合資料的說明 |
| 完整或部分結果 | 素材可操作；service 宣告不完整時顯示部分資料提示 |
| 暫時性讀取失敗 | `error`，顯示安全訊息與原生重試按鈕 |
| 權限不足或回應格式錯誤 | 不允許重試；復原控制與表單提交均不重新送出 |
| 背景更新失敗 | 保留既有素材、選取項目、篩選文字與部分資料狀態 |
| 取代請求、修改篩選或取消 | 中止舊請求；即使來源忽略 abort，序號檢查仍會拒絕較晚回來的舊結果 |
| 元件卸載 | 釋放 owner；進行中的請求或後續讀取均不能再更新狀態 |

重試會合併重複呼叫，同一時間只執行一個讀取請求。此 service 沒有寫入，因此本 fixture 不適用寫入冪等與重複異動防護。未來若接上有副作用的真實媒體 adapter，必須先定義相關規則。本例未涵蓋授權 session 變更、持久化、播放頭、檔案匯入或 native shell。

View 重用 profile fixture 的警告／危險狀態樣式與 token 名稱。`profile-contract.json` 記錄元件公開 API、語意角色的使用位置、state/action/service owner 與有範圍的 literal 例外。來源 adapter 可在不執行目標設定檔的前提下檢查這些關係。

## Runtime 驗證

先使用 `integrations/vue-project-profile/` 的固定 lockfile 安裝選用工具。從該工具目錄執行：

```sh
node --test media.test.mjs
node inspect.mjs ../../examples/media-library-vue --entry src/main.js --contract profile-contract.json
```

測試實際執行 Pinia owner 與注入的唯讀 service，涵蓋延遲載入、空白與部分資料、重試合併、權限拒絕、背景更新失敗後的內容保留、過期回應、篩選變動、abort、dispose、錯誤回應、安全錯誤文字及來源所有權。這些 runtime 測試本身不代表已完成渲染後的鍵盤操作或影像品質驗收；共用的選用 build／browser harness 負責這些檢查，並另外保存命令、版本與證據。

## 瀏覽器情境控制

為取得可重現的瀏覽器證據，可在 entry module 執行前設定 `globalThis.__MEDIA_TEST_CONTROL__ = true`。Fixture entry 隨後安裝可延遲回應的來源，並提供受信任的本地 `globalThis.__MEDIA_FIXTURE__` 控制器。這不是產品功能或供模型操作的 API。

控制器提供 `pending()`、`requests()`、`resolve(id, { items, partial })`、`reject(id, code)`、`snapshot()`、`load({ replace })`、`cancel()`、`dispose()`、`setFilter(value)`、`select(id)` 與 `unmount()`。支援的錯誤代碼為 `unavailable`、`permission_denied` 與 `invalid_response`。

首次 mount 會建立請求 1。可將它 resolve 成素材清單、reject 成錯誤，或維持 pending 以觀察載入。之後呼叫 `load()` 會開始背景更新；`load({ replace: true })` 會中止前一個請求。此測試來源刻意忽略 abort，讓瀏覽器測試能在取消後完成舊請求，驗證 owner 確實拒絕舊結果。

固定的 `data-testid` 包含 `media-panel`、`media-filter`、`media-load`、`media-cancel`、`media-status`、`media-items`、`media-empty` 與 `media-selection`。復原按鈕在載入、錯誤、重試與成功時保持同一個 DOM 元素。原生按鈕、radio 與有 label 的輸入框提供鍵盤操作；錯誤使用 `role="alert"`，進度使用 `role="status"`，reduced-motion CSS 停用動畫與 transition。

共用的選用 browser harness 會 build 此 fixture，測試初始載入、空資料、重試、成功/部分資料、更新失敗、不可重試的權限錯誤、過期回應、取消及卸載，並保存實際 owner/service request、鍵盤焦點、reduced motion、截圖與來源/runtime hash。

```sh
node integrations/vue-project-profile/render-media.mjs
```

整個 session 的權限拒絕會在修改篩選、取消及直接 load 後維持阻擋。可信任的新 session 應建立新的 owner；修改輸入不會重設權限狀態。
