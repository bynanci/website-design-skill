# Roadmap

[English](ROADMAP.md) · 繁體中文

Website Design Skill 以跨平台改版方法、明確的交付契約與行為評估為核心。核心流程與選用整合層分開演進，避免綁定特定模型、設計工具、前端框架、CMS 或部署平台。

## 目前工作：Context-aware UI 協作

整合層提案定義五項能力：讀取既有設計系統、以 AST 為基礎提出有限修改、處理適用的 UI 狀態轉換、進行有預算上限的響應式修正，以及受控的 declarative runtime UI。

第一個框架目標是 Vue。React、Svelte 等框架必須有各自的 adapter 與 conformance fixture，不能由共用規格推定相容。Runtime UI 是獨立的 P2 實驗，不是一般設計時工作的前置條件。

細項任務由 [Issue #8](https://github.com/bynanci/website-design-skill/issues/8) 統整；每個子 Issue 是各工作的驗收依據。#11 現已包含合成 Vue fixture、範圍受限的 AST/來源檢查、明確語意角色契約、來源 API/owner 檢查、局部 drift 檢查及 production build/theme-render harness。[試點指南](integrations/vue-project-profile/README.zh-TW.md) 定義支援語法與證據格式；實際驗證結果由 CI 與 #11 記錄。

#11–#13 的有限 Vue 試點及 #15 runtime recovery 已在 main 實作。Recovery 使用嚴格資料驗證、host 一次性 action、純文字 renderer 與靜態 fallback；實際 browser/build 證據由 #15 記錄，live model 傳輸仍未執行。

選用 PR #5 preview 包含八組可重用 Dashboard 元件、32 項矩陣及額外的真正 200% 原生視窗擷取（#7）。#14 加入保留來源位元的單一 CSS 復原操作、最多兩輪 patch/recheck、來源/runtime 鎖定及時間／process／擷取預算。同一套 Dashboard runner 量測通過參考、注入的失敗基線及候選；此能力不等於通用 CSS 修復。具日期的雙語證據紀錄是實際驗收狀態的依據。

#6 已有隔離且版本化的資料包、評分準則、嚴格結果驗證與完整性測試。獨立的 [#6 v0.2 pilot](https://github.com/bynanci/website-design-skill/issues/6) 在 preview worktree 已完成兩次執行、獨立審查與驗證：GPT-6 得 36/36，GPT-5.6 Sol 得 33/36。GPT-5.6 Sol 的 AX-01、AX-02、AX-03 為部分得分，兩次均無 critical error；發布與合併狀態以 #6 為準。#1 已有兩次完成獨立審查的官方 v0.1 執行：[GPT-6](benchmarks/results/chatgpt-web-gpt-6-v01-20261117/) 與 [GPT-5.6 Sol](benchmarks/results/chatgpt-web-gpt-5-6-sol-v01-20261117/)，均來自同一 ChatGPT web 產品，各得 40/40。本機嚴格證據 gate 已通過。這些執行使用凍結核心 commit `7d64090710ef20f1d24cea6b46199391d3c09c18`；main 後續的 adapter 與測試仍屬另一組證據。Draft PR #5 保留其獨立發布 gate，實作與 browser 測試不會取代這些證據。

## 部署與外部檢查

[#29](https://github.com/bynanci/website-design-skill/issues/29)追蹤錯誤的 Vite 工具根目錄、重複 Vercel 專案及平台限流。明確的靜態展示建置與 production output smoke 不等於核心發布就緒。需同時核對外部部署狀態與 GitHub Actions，只有綁定實際來源的 READY 部署才能完成該驗收項目。在 2026-11-17 快照中，部署配額限制仍有效，預定於 2026-11-18 19:10（Asia/Taipei）追蹤。詳見[部署操作](docs/DEPLOYMENT.zh-TW.md)。

## v0.1：最小公開版本

發布前需通過 repository validators，取得至少兩個符合規範的獨立 agent benchmark，且達到分數門檻；若不同 agent 在同一準則反覆失分，也要先處理核心契約歧義。截至 2026-11-17，本機嚴格證據 gate 回報兩次官方執行、兩個不同 signature，沒有 failure 或 warning。發布前須核對確切 candidate 的 CI 與外部檢查、完成公開合併並依程序建立 release tag；詳見[備妥的發布說明](docs/releases/v0.1.0.zh-TW.md)。發布紀錄以 [Issue #1](https://github.com/bynanci/website-design-skill/issues/1) 與 [GitHub Releases](https://github.com/bynanci/website-design-skill/releases) 為準。不可把可用性問題當成相容性分數。

## v0.2：擴大改版情境

候選範圍包括可及性與響應式評估、內容密集型與商務型案例、登入後 dashboard、內容遷移、視覺方向比較、響應式行為與 token 擷取。新增方法必須搭配具體交付契約或評估流程。

### v0.2 選用 pilot 交付物

PR #5 preview 提供視覺方向比較、responsive/container/zoom 行為、token 擷取契約、可重用合成 Dashboard 及響應式／可及性案例。#7 已提供 32 項矩陣、實際 200% 原生縮放與已記錄的預設方向選擇；#14 已提供同一 runner 的有限復原證據。#6 的隔離資料包與評分契約已備妥。獨立的 [#6 v0.2 pilot](https://github.com/bynanci/website-design-skill/issues/6) 在 preview worktree 已完成兩次執行、獨立審查與驗證：GPT-6 得 36/36，GPT-5.6 Sol 得 33/36。GPT-5.6 Sol 的 AX-01、AX-02、AX-03 為部分得分，兩次均無 critical error；發布與合併狀態以 #6 為準。實體裝置、螢幕閱讀器與真人任務研究保持未執行。

這些交付物不改動 v0.1 核心流程、凍結案例或評分規則，不可計為官方 v0.1 相容性證據。PR #5 仍須通過其既有 draft 與版本驗收 gate。

## v0.3：互通性與 adapters

在不增加核心依賴的前提下，驗證能力探索、artifact 路徑、讀寫責任、agent/tool adapter，以及專案 context、頁面規格、token 對照和驗收結果的往返傳遞。

## v0.4：遷移與回歸 gate

建立共用元件遷移規劃、一次性 CSS 覆寫稽核、內容 parity、token drift 檢查、代表性 legacy 系統的響應式/可及性 fixture，以及範圍、fallback、rollback、deprecation 與 release review gate。

## 原則

- 核心技能不依賴選用 adapters。
- 不宣稱未取得證據的截圖、效能或可及性結果。
- 自動檢查需可追溯；人工決策需明確記錄。
- 核心契約變更必須版本化，並以乾淨環境重新驗證。
- Issue #1 的 v0.1 gate、PR #5 的 v0.2 artifact，以及 Issue #6/#7 的 pilot/specimen 各自獨立管理。
