# 有限範圍的軌道排序 fixture

[English](README.md) · 繁體中文

此合成 fixture 的兩個原生按鈕起初沒有事件綁定。既有 Pinia action 負責軌道順序，每次有效移動只呼叫一次既有 persistence service。選取項目與 playhead 為獨立狀態；adapter 僅加入兩個 Vue click 綁定。

使用選用的 [Vue 試點工具](../../integrations/vue-project-profile/README.zh-TW.md)。Patch API 位於 `integrations/vue-project-profile/patch.mjs`：

```js
const plan = proposeReorder(root, { expectedSha256 });
typeCheckReorder(root, plan);
applyReorder(root, plan, { exclusiveWorkspace: true });
```

呼叫端必須提供當前來源原始 bytes 的 SHA-256。提案記錄原始/候選 bytes、修改範圍、相關來源 digest 與 parser 版本。套用時會重新驗證，且必須先通過真正的 TypeScript 檢查才可寫入。提出提案不會修改檔案；以當前 digest 重複套用相同操作會回傳 no-op。

寫入與 rollback 必須在 host 獨占控制的隔離 checkout 執行。合作式鎖與重複 digest 檢查可偵測遵循協定或已可見的變更，無法對任意外部編輯器提供儲存層級的 compare-and-swap。若 target 或相關來源已變更，rollback 會拒絕覆寫。

## 支援的來源形式

- Vue/compiler 3.5.13 與 TypeScript 5.7.3。
- 單一 TypeScript `script setup`，使用靜態 import、支援的 props 宣告與穩定的既有 `const` store binding；額外可執行元件程式會被拒絕。
- 一個既有匯出的 Pinia options store、只接受 `up`/`down` 的 `moveTrack(trackId, direction)` 型別化 action，以及一個已確認的 persistence-service 呼叫。
- `data-reorder="up"` 與 `data-reorder="down"` 各對應唯一的原生 HTML `type="button"`。
- 不接受 template alias、`v-pre`、自訂/SVG 控制項、物件式事件綁定、衝突 handler 或不支援的來源 block。

僅可修改宣告的 template 插入範圍。註解、多個支援的 style block、其他來源 bytes 與 service 檔案均受保護。格式錯誤、歧義、過期或不支援的輸入會被拒絕。

## 瀏覽器證據

安裝選用工具及 Playwright browser 後，在 repository 根目錄執行：

```sh
node integrations/vue-project-profile/render-reorder.mjs
```

共用 harness 將 fixture 複製到暫存且獨占的 workspace，先驗證未綁定的基準，再套用 patch、執行型別檢查並 build 實際 Vue app。它測試 pointer、Tab、Space、Enter，檢查 action/persistence 次數與選取/playhead，確認第二次套用為 no-op，最後驗證 rollback 的 bytes 完全一致。`artifacts/reorder-results.json` 保存完整提案、來源/工具版本、截圖、斷言與未執行項目；原始 fixture 不會改動。

Persistence 僅為記憶體中的合成 readback，不執行檔案系統、media、FFmpeg 或 native shell 操作。

## 合成 fixture 部署建置

此處的 `vercel.json` 使用共用且鎖定版本的 Vue 工具建置原樣合成 fixture，不會在子目錄錯跑 repository 展示頁指令。由此 fixture 目錄執行：

```sh
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci --prefix ../../integrations/vue-project-profile
node ../../integrations/vue-project-profile/build-fixture.mjs track-reorder-vue
```

Adapter 只接受兩個已審查的 fixture 名稱，不載入 target Vite 設定，保留來源檔案並把編譯後入口／資產輸出到此目錄的 `dist/`。這只建置原始測試基線，不代表 production app 或更廣的 UI 驗收。此設定不會停用 Git 部署，ignored-build 指令會要求真正建置。詳見[部署操作](../../docs/DEPLOYMENT.zh-TW.md)。

基線的排序按鈕仍刻意未綁事件。此建置不套用來源 patch，也不宣稱排序互動已完成；該驗證由獨立且隔離的 patch／browser harness 負責。
