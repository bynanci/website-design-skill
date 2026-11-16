# 整合層

[English](README.md) · 繁體中文

核心技能保持跨平台。選用 adapter 可將能力導向的流程接到特定專案或工具，但不能成為核心 SKILL.md 的必要依賴，也不能改寫核心方法。

## Context-aware UI 架構

[架構總覽](context-aware-ui/README.zh-TW.md)將通用改版方法連接到專案 profile、token/元件來源、狀態與 API 所有權、有限程式碼修改及驗收證據。Vue 是第一個提案目標；React、Svelte 與 runtime rendering 都需要各自的實作證據。

## 規格文件

- [專案 profile 與設計系統對照](context-aware-ui/project-profile.zh-TW.md)：記錄來源、theme、alias、元件、token 與狀態/API 所有權。
- [UI 狀態與轉換](context-aware-ui/state-contract.zh-TW.md)：在既有 owner 邊界定義狀態、取消、重試與回復。
- [AST 導向修改](ast-patching/README.zh-TW.md)：鎖定支援語法、保護未修改區域並拒絕過期或不明確目標。
- [Vue 3、SCSS 與 Tauri](vue3-tauri/README.zh-TW.md)：先檢查專案，再採用已驗證的路徑、alias 與桌面互動方式。
- [渲染後視覺驗收](visual-validation/README.zh-TW.md)：只在具備 browser、執行與影像檢查能力時渲染，並記錄限制。
- [MCP adapter](mcp-server/README.zh-TW.md)：以明確的 workspace、執行與寫入界限提供窄範圍操作。
- [Declarative runtime UI](runtime-ui/README.zh-TW.md)：以已註冊的元件與 action 描述暫時介面，並提供靜態 fallback。

以上均為 PR #9 的提案契約，尚未代表已實作的產生器、runner、server 或 renderer。

## 預定試點

- 依核准任務與元件對照建立 OpenFilm 類桌面編輯器原型。
- 依檢查過且匿名化的 CSV 欄位建立研究 dashboard。
- 以最小化 state snapshot 產生受控的除錯或設定面板。

在建立 fixture、實作與驗收證據前，這些都只是提案。

## Adapter 規則

1. 核心流程使用能力與契約描述。
2. 選路徑、alias、依賴與慣例前，先檢查目標程式庫。
3. 不使用 adapter 也能完成核心設計工作。
4. 缺少能力或未執行的驗收，標為 unknown 或 not run。
5. 分開讀取、執行命令、提出 patch 與寫入檔案。
6. 未獲明確授權，不得把程式碼、截圖、客戶資料或環境值送到外部服務。
7. Runtime UI 僅接受受驗證的宣告式資料，不執行生成程式碼。
