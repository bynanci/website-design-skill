# Vue 專案 Profile 試點

[English](README.md) · 繁體中文

此選用 adapter 檢查範圍受限的 Vue 原始碼。它在 Python 的可攜 profile 上，加入本地匯入關係、宣告的語意角色、元件 props，以及既有 Pinia/service 邊界的剖析證據。核心技能可在未安裝 Node 依賴的環境執行。

## 支援輸入

- 根目錄 TypeScript JSONC 設定；每個 alias 僅有一個靜態目標，且不使用 `extends`。
- 從明確入口追蹤本地 `.ts`、`.js`、`.vue`、`.css` 與 `.scss` 匯入。
- 明確 theme selector 下的 CSS custom properties。SCSS 運算式在 build 解析前仍視為來源表達式。
- 一個 `script setup` 元件，使用本地 `defineProps` 型別物件、基本型別或本地字串聯集型別。
- 一個匯出的 Pinia options store；既有 action 呼叫一個匯入的 service，consumer 呼叫一次該 store。
- 經審查的 `profile-contract.json`，指定角色、selector、consumer 與 owner。契約提供意圖，每項宣告與使用仍需來源證據支持。

不支援或有歧義的語法會維持 unknown 或拒絕處理。本試點不宣稱支援 Tailwind、任意 Sass module 語意、React、Svelte、繼承 alias 或 native shell。

## 安裝與檢查

使用 Node 22 以上版本與 Python 3，在本目錄安裝選用依賴：

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
node inspect.mjs ../../examples/project-profile-vue \
  --entry src/main.ts --contract profile-contract.json
```

命令將 JSON 輸出至標準輸出。`profile` 沿用既有 0.1 schema；`evidence` 記錄本地匯入圖、來源宣告、consumer 位置、元件 props、owner/action 呼叫、drift findings 與不支援情況。Inspector 不執行目標設定或專案程式；每次呼叫均重新讀取來源，不建立持久快取。

契約分別對應警告與破壞性操作角色。缺少宣告、consumer 或 theme 時會記錄 finding；角色衝突也會明確列出。Literal 例外必須指定來源路徑、屬性、值與原因；其他位置使用相同值不會因此獲准。

## Build 與渲染隨附 fixture

獨立的 render harness 使用受控的固定 Vite 設定與鎖定版本的 Vue/Sass 工具鏈，不執行目標動態 `vite.config.ts`。

```sh
npx playwright install --with-deps chromium
node render.mjs ../../examples/project-profile-vue
```

若已安裝 Chromium，可設定 `CHROMIUM_EXECUTABLE_PATH`。Production build 必須先通過；瀏覽器再量測 light/dark theme 中的警告與破壞性操作 consumer。檢查會比對前景、背景及狀態邊線的計算色值，量測對比、記錄 runtime error，並確認 fixture 來源未被修改。

`artifacts/` 會包含 production build、兩張截圖與 `render-results.json`。報告保存來源與工具 hash、套件版本、實際瀏覽器版本、檢查結果及未執行項目。GitHub Actions 以 `vue-profile-evidence` 保存 JSON 與截圖；CI 結果與 artifact 連結記錄在對應 PR 或 Issue #11。

靜態角色證據與瀏覽器量測各自保存。Theme 檢查通過仍不足以證明完整 dashboard 品質、狀態轉換行為、輔助科技支援或官方跨 agent 發布證據。

外部 scoped Vue 樣式仍不支援，不可用來確認全域 theme 宣告。
