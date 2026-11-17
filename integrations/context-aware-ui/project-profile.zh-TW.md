# 專案 Profile 與設計系統對照

[English](project-profile.md) · 繁體中文

**狀態：提案中的可重用檢查紀錄。** Profile 必須從目標程式庫實際讀取，不預載任何個人專案 alias 或 token。

## 快照與範圍

記錄 profile 格式版本、workspace 與允許根目錄、repository revision、相關檔案 digest、任務與影響功能、來源位置、來源是否可用或已過期，以及 host 已授權的讀取、命令、網路與寫入能力。未提交的變更不會由 commit SHA 表示，因此 patch 依賴檔案也要保存內容 digest。來源變動時，快取紀錄必須失效。

## 技術堆疊與慣例

檢查並記錄：
- framework、compiler、語言與版本；
- build/style toolchain；
- 真正設定的 alias 及其目標；
- feature、元件與 composable 目錄；
- props、events、slots 與命名慣例；
- store、composable、service 等狀態與資料 owner；
- 桌面 shell、native command 與支援平台；
- repository 明確允許的 build/check/render 命令。

JavaScript 設定檔不可為了讀取設定而直接執行。能靜態解析的值應註明來源；動態值在授權執行或 build 提供證據前，維持 unknown。

## 元件盤點與重用

對每個職責，記錄既有 component/API、變體與狀態、token 來源、重用決策及證據。依序評估重用、擴充、變體、組合、新建；新增前說明前幾種方案為何不足。Alias 必須從專案設定取得，不能假設有 @common 或 @viz。

## Token 證據

檢查 CSS custom properties、作用域與 theme override；SCSS variables、modules、mixins 與匯入鏈；依版本檢查 Tailwind 設定或 CSS theme；既有 token 匯出格式；以及已封裝所需視覺角色的共用元件。不可只搜尋舊版設定檔名，也不可暗中遷移樣式系統。

建立語意對照時，至少涵蓋危險操作、警告、表面/前景、間距、字體、圓角與動態。警告與破壞性操作可以是不同角色。範例 token 名稱不代表目標專案真的有該 token。

若缺少必要角色，先使用既有語意元件或 variant；否則提出命名 token 或有範圍和理由的局部例外。不得私自引入色碼或未解析的 CSS variable fallback。

## 驗證與 drift 報告

- 透過實際 build/render 路徑檢查每個宣告 theme 的 token 解析。
- 對比前景/背景時記錄計算色值與量測方法；token 存在不代表對比足夠。
- 記錄影響範圍內的新 literal、重複 token 與共用定義變更。
- 報告 token 覆蓋率時註明分母，並分開列出零值或 layout 計算等合理 literal。
- 區分靜態文字檢查與 computed/rendered 驗證。
- 保留元件 variant 與品牌語意，不強制套用單一全域色盤。

重用 token 名稱不等於已證明視覺完全一致。

## State、API 與副作用邊界

記錄 feature owner、輸入與事件、輸出與錯誤、取消/重試/持久化方式、要重用的 store/action/composable、API/native command 契約、受保護檔案或符號、需要修改 owner/API 的範圍、適用狀態契約，以及鍵盤/focus 和內容保留條件。

## 能力與證據矩陣

逐項記錄讀取、語法解析、patch 提案/寫入、build/type-check、web rendering、實際影像審查、DOM/可及性量測，以及 native shell、browser zoom 或輔助科技測試的 available、unavailable 或 unknown 狀態與證據。

Profile 可以不完整。只有在缺少證據使該操作不安全或不受支援時才阻擋該操作，並明確保留未知項目。


## 唯讀 Profile 試點工具

第一個實作切片是 scripts/inspect_project_profile.py。它讀取靜態 package/TypeScript 設定與有限數量的來源候選檔，不執行專案設定、不安裝依賴、不執行 build、不渲染 app，也不寫入檔案。

使用範例：

```sh
python3 scripts/inspect_project_profile.py ./target-project \
  --task "Map the media-library warning state" \
  --required-alias "@common" \
  --required-token=--color-warning
```

Token 參照以 `--` 開頭，請使用 `--required-token=--color-warning` 傳入，避免命令列解析器將它當成另一個選項。

輸出 JSON 遵循 project-profile.schema.json。靜態 token 宣告、Vue 檔案路徑，以及 state/API 路徑名稱都只是候選證據。工具不會確認語意 token 角色、實際 theme 計算值、元件 API、狀態所有權、執行行為或快取新鮮度；在 parser、renderer 或 reviewer 提供證據前，這些欄位應維持 unknown。


## 合成 Vue fixture

[合成 Vue fixture](../../examples/project-profile-vue/README.zh-TW.md) 保存範圍受限的範例專案與唯讀 inspector 的實際輸出。回歸測試會比對該輸出，並確認來源檔變動時會產生新 digest，而未變動元件的 digest 保持一致。

Fixture 使用 manifest 宣告的套件版本、JSONC alias、SCSS/CSS token 候選、dark theme override、Vue 元件、Pinia store 與 API service 路徑。它不安裝依賴、不執行 Vite 設定、不解析匯入或 theme 計算值、不剖析公開元件 API、不確認狀態所有權，也不渲染 app。這些項目仍應標記為 unknown。

## Vue 來源剖析與 theme 渲染

選用的 [Vue profile 試點](../vue-project-profile/README.zh-TW.md) 在唯讀盤點上加入範圍受限的來源 parser。經審查的意圖契約指定要驗證的語意角色與 owner；adapter 追蹤本地匯入、逐 theme 檢查宣告與 consumer、擷取支援的元件 props、檢查 Pinia/service 呼叫，並報告衝突、未知項目與限定範圍的 token drift。輸出沿用可攜 profile schema。

獨立的 production build/browser harness 量測隨附 fixture 的 light/dark token consumer。來源宣告與計算結果各自保留；指南列出支援語法、拒絕條件、命令、依賴與證據位置。
