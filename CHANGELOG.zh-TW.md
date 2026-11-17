# 變更紀錄

[English](CHANGELOG.md) · 繁體中文

本專案的公開 artifact 契約以語意化版本管理，已接受版本由實際 tag 與 Release 識別。版本發布紀錄以 [GitHub Releases](https://github.com/bynanci/website-design-skill/releases) 為準。

## [未發布]

### 新增

- 保留來源位元的有限 Dashboard CSS 復原，搭配凍結的 32 項／原生縮放 runner、完整基線／候選證據及有限回滾／資源政策。
- 隔離的 v0.2 pilot 資料包、獨立評分／結果契約及證據完整性驗證。兩次獨立審查的執行已於 #33 合併：GPT-6 得 36/36，GPT-5.6 Sol 得 33/36。AX-01、AX-02、AX-03 保留部分得分，兩次均無 critical error。
- 可重用的原生 Dashboard factories、合成復原狀態、語意明暗主題及雙語量測證據文件。
- v0.2 選用的視覺方向比較、響應式行為與 token 擷取／遷移範本，以及視覺品質審查參考文件。
- 合成 Dashboard、可重現 Chromium QA，以及獨立於 v0.1 官方案例的響應式與可及性 pilot。

### 變更

- 整合 v0.2 選用項目與已發布的 v0.1.0 基線，保留全部原始評估輸出與凍結契約。#6 pilot 與 #29 部署已完成，每個整合候選仍須通過自己的檢查。

## [0.1.0] - 2026-11-18

[正式發布](https://github.com/bynanci/website-design-skill/releases/tag/v0.1.0) · 07:03:58 Asia/Taipei · commit `e33c7414de44cf537c9a59113fd8f393352af5bc`

### 新增

- 兩階段發布請求，以嚴格 candidate 檢查、不可變的 notes hash 及 GitHub 短效 repository token 完成發布。
- ChatGPT web 上兩次完成獨立審查的官方 v0.1 benchmark，所選模型標籤為 GPT-6 與 GPT-5.6 Sol。兩次均使用凍結 suite `0.1.0` 與核心 commit `7d64090710ef20f1d24cea6b46199391d3c09c18`，各得 40/40。原始執行與評分連結見[相容性矩陣](benchmarks/compatibility-matrix.md)。
- [v0.1.0 雙語發布說明](docs/releases/v0.1.0.zh-TW.md)，列出證據邊界、接受的 candidate 與已核實的發布紀錄，[Issue #1](https://github.com/bynanci/website-design-skill/issues/1) 已完成。

- 明確的零相依靜態展示建置與 Vercel 部署契約、公開資產／來源檢查、main／preview HTTP／browser smoke，以及涵蓋外部部署的合併就緒報告。
- 新增有限宣告式 recovery 原型，包含遞迴嚴格 payload 驗證、即時一次性 host capability、純文字 Vue renderer、靜態 fallback 與可比較的 production bundle/UI 成本證據。

- 新增有限 Vue 軌道排序 patch、剖析 target、必要型別檢查、受保護範圍、no-op/rollback 與隔離 workspace 前提；另提供媒體庫過期/取消/卸載防護及共用 browser 證據。

- 新增選用的有限 Vue 來源 profile adapter、明確角色/owner 契約、局部 drift 與拒絕條件測試，以及獨立的 production build/theme 渲染證據流程。

- 核心技能、roadmap、參考指南、範本與 context-aware UI 整合指南的繁體中文版本，並建立雙語寫作規範。
- Issue #11 專案 profile 的提案 JSON Schema 與合成範例。它們定義資料契約，尚未實作掃描器。
- 有限範圍的唯讀 project-profile inspector，可盤點靜態 package metadata、TypeScript JSONC alias、token 候選與來源 digest；語意角色與執行期行為仍未驗證。
- 新增雙語合成 Vue project-profile fixture、已保存的 inspector 輸出，以及驗證 fixture 一致性與來源 digest 更新的回歸測試。Profile 僅記錄候選，尚未驗證 token 語意、theme 計算、元件 API、狀態所有權或渲染結果。
- 選用的 context-aware UI 架構、專案 profile/token 對照、狀態轉換、AST patch 與 declarative runtime UI 契約。
- Vue/Tauri、渲染後視覺驗收與 MCP 指引，以及有輪數上限並明確記錄未執行情況的多條件修正流程。
- Issue #8 的整合工作順序。這些文件不包含執行引擎，也不改動凍結的 v0.1 評估集。

#### 初始 Release Candidate 基線

- 跨平台核心 SKILL.md 與改版工作流程
- 資訊架構、元件架構參考文件
- 專案背景、頁面規格、導覽比較、內容涵蓋與元件契約範本
- 合成 SaaS 範例與端到端 B2B 改版案例
- 資訊架構及元件重用行為評估案例
- 跨 agent benchmark 契約、基準清單與評分量表
- 結果 JSON Schema、範例結果與標準 runner 指示
- Runner eligibility、availability 與相容性矩陣
- v0.1 發布政策、release readiness 工具與流程
- 驗證腳本、GitHub Actions 與 Issue 範本
- 整合邊界、貢獻指南、roadmap、治理與安全政策
- v0.1.0 發布追蹤 Issue #1

### 變更

- 修正公開 clean-run packet 的過時 baseline，使其符合發布政策；回歸測試會防止操作文件再次偏離指定 commit。

- 官方證據必須使用凍結的 v0.1 benchmark commit，並驗證執行者與能力資訊。
- 發布檢查會拒絕空白、跨執行重用、絕對路徑或越界的 raw evidence。
- 在 CI 加入 benchmark evidence 完整性檢查。
- 核心流程依階段載入所需參考文件與範本。
- Repository validator 檢查完整 eval case 與端到端 artifact 鏈。
- Benchmark validator 檢查版本、發布政策、結果範本、原始輸出、評分準則及分數彙總。
- 行為評估以契約為準，不要求逐字符合 golden output。
- Runner 無法使用與技能不相容分開記錄。
- 貢獻指南區分乾淨 benchmark 執行與探索性提交。

#### Release Candidate 維護紀錄

README、治理、安全與 roadmap 文件納入公開維護基線；runner 存取限制不會被錯誤計為技能相容性失敗。

### Runner 證據

- Replit Agent 探索性執行未產生可取回的原始輸出。
- 精簡 IA 重試因需要有效訂閱而無法執行；Replit 因此記為目前環境不可用，不計為相容性失敗。
- Superpowers 提供方法與技能行為，但不是隔離的 agent 執行環境，因此不產生相容性分數。
