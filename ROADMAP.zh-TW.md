# Roadmap

[English](ROADMAP.md) · 繁體中文

Website Design Skill 以跨平台改版方法、明確的交付契約與行為評估為核心。核心流程與選用整合層分開演進，避免綁定特定模型、設計工具、前端框架、CMS 或部署平台。

## 目前工作：Context-aware UI 協作

整合層提案定義五項能力：讀取既有設計系統、以 AST 為基礎提出有限修改、處理適用的 UI 狀態轉換、進行有預算上限的響應式修正，以及受控的 declarative runtime UI。

第一個框架目標是 Vue。React、Svelte 等框架必須有各自的 adapter 與 conformance fixture，不能由共用規格推定相容。Runtime UI 是獨立的 P2 實驗，不是一般設計時工作的前置條件。

細項任務由 [Issue #8](https://github.com/bynanci/website-design-skill/issues/8) 統整；每個子 Issue 是各工作的驗收依據。#11 現已包含合成 Vue fixture、範圍受限的 AST/來源檢查、明確語意角色契約、來源 API/owner 檢查、局部 drift 檢查及 production build/theme-render harness。[試點指南](integrations/vue-project-profile/README.zh-TW.md) 定義支援語法與證據格式；實際驗證結果由 CI 與 #11 記錄。

有限軌道排序 patch（#12）與媒體庫 owner/service 轉換（#13）現已提供可執行 fixture 及共用 browser 證據 harness。Patch 必須使用隔離且獨占的 checkout。完整 dashboard 渲染與有限修正分別由 #7、#14 追蹤；runtime recovery 由 #15 追蹤。#1 仍需獨立乾淨 agent 輸出，draft PR #5 保留各自的發布 gate。

## v0.1：最小公開版本

發布前需通過 repository validators，取得至少兩個符合規範的獨立 agent benchmark，且達到分數門檻；若不同 agent 在同一準則反覆失分，也要先處理核心契約歧義。目前 v0.1 仍以 release gate 為準，不可把可用性問題當成相容性分數。

## v0.2：擴大改版情境

候選範圍包括可及性與響應式評估、內容密集型與商務型案例、登入後 dashboard、內容遷移、視覺方向比較、響應式行為與 token 擷取。新增方法必須搭配具體交付契約或評估流程。

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
