# Website Design Skill

[English](README.md) · 繁體中文

Website Design Skill 是一套與工具及前端框架無關的網站改版方法。它協助 AI 從現況盤點開始，逐步整理資訊架構、頁面規格、視覺方向、設計系統、元件實作與驗收證據。

## 核心流程

1. **探索**：整理目標、使用者、內容、限制與現況證據。
2. **組織**：檢視資訊架構、分類、頁面群組與導覽。
3. **線框**：先定義頁面層級和內容順序，再進入視覺設計。
4. **探索視覺方向**：在結構穩定後比較字體、色彩、間距、網格、影像與動態原則。
5. **建立系統**：整理設計 token、版型模式、元件契約與互動規則。
6. **實作**：依目標專案既有技術與慣例組合頁面。
7. **驗收**：檢查內容涵蓋、導覽、響應式行為、可及性、一致性與回歸。

## 開始使用

1. 依使用環境載入核心技能：[繁中版 SKILL](SKILL.zh-TW.md) 或 [英文版 SKILL](SKILL.md)。
2. 提供網站、站點地圖、內容、程式庫或其他可用證據。
3. 說明改版目標與限制。
4. 從最不穩定的上游問題開始，不要在內容與結構尚未釐清時直接進入精緻視覺稿。
5. 保存產出的規格與決策，讓後續工作可以接續。

## 專案定位

本專案提供可重複的改版工作流程、明確的交付契約與行為評估方式。它不是 UI 框架、網站範本、提示詞集合，也不取代產品、品牌或利害關係人的判斷。

核心方法保持跨平台。Vue、React、Svelte、CMS、設計工具與部署平台都必須由選用的整合層個別驗證，不由核心技能預設。

## Context-aware UI 整合進度

[整合架構](integrations/context-aware-ui/README.zh-TW.md)連結專案 token、可重用元件、狀態／API 所有權及有限來源修改。Main 已有範圍明確的 Vue 盤點、軌道排序修改、媒體狀態轉換及宣告式復原 fixture 與 browser 證據；v0.2 preview 另提供可渲染 Dashboard 與單一已審查 CSS 復原操作。每項能力均有限定語法、host 與證據邊界，其他框架需各自驗證。

[Issue #8](https://github.com/bynanci/website-design-skill/issues/8)記錄已完成試點；#1 的 v0.1 benchmark gate 在 2026-11-17 證據快照中已有兩次完成獨立審查的官方執行。獨立的 [#6 v0.2 pilot](https://github.com/bynanci/website-design-skill/issues/6) 在 preview worktree 已完成兩次執行、獨立審查與驗證：GPT-6 得 36/36，GPT-5.6 Sol 得 33/36。GPT-5.6 Sol 的 AX-01、AX-02、AX-03 為部分得分，兩次均無 critical error；發布與合併狀態以 #6 為準。部署另由 [#29](https://github.com/bynanci/website-design-skill/issues/29)追蹤。

## 建置靜態展示頁

```sh
node site/build.mjs
python3 -m http.server 8000 --directory dist
```

Builder 只用 Node 內建功能及明確公開檔案清單。Main 產生雙語技能／文件入口；preview 在完整 fixture 存在時另包含合成 Dashboard。選用的 Vue 盤點／測試工具目錄不是 Vite app 入口。部署請以 repository root 及[部署指南](docs/DEPLOYMENT.zh-TW.md)為準。

GitHub Actions 成功不等於外部部署成功。合併前需核對完整 candidate SHA 的所有 statuses 與 check runs：

```sh
python3 scripts/check_merge_readiness.py --repo bynanci/website-design-skill --sha <完整-commit-sha> --required-check validate
```

預期部署 Vercel 的候選另加 `--required-check 'Vercel – vue-project-profile'`。檢查失敗、pending、缺漏或證據不完整都會回傳非零；工具不會改寫平台狀態或 repository 保護規則。

## 文件語言與寫作規範

本次雙語範圍包含 README、核心技能、roadmap、核心參考文件、範本與選用 UI adapter 契約。Benchmark 輸入、預期輸出、評分量表、原始證據與 repository 政策文件仍維持英文版本。繁中使用台灣用語、固定術語與可操作步驟；英文參考 ASD-STE100 Issue 9 的清楚寫法，但本專案不宣稱正式合規。該標準不定義繁體中文合規。詳見[雙語寫作規範](docs/WRITING-STYLE.md)。

## 核心參考資料與範本

- [網站改版流程](references/workflow.zh-TW.md)
- [資訊架構](references/information-architecture.zh-TW.md)
- [元件架構](references/component-architecture.zh-TW.md)
- [專案背景範本](templates/project-context.zh-TW.md)
- [頁面規格範本](templates/page-spec.zh-TW.md)
- [導覽比較範本](templates/navigation-comparison.zh-TW.md)
- [內容涵蓋範本](templates/content-coverage.zh-TW.md)
- [元件契約範本](templates/component-contract.zh-TW.md)

## v0.1 證據與發布狀態

截至 2026-11-17，[GPT-6](benchmarks/results/chatgpt-web-gpt-6-v01-20261117/) 與 [GPT-5.6 Sol](benchmarks/results/chatgpt-web-gpt-5-6-sol-v01-20261117/) 兩次官方執行均通過獨立審查與 repository 驗證，各得 40/40。這是同一 ChatGPT web 產品上的兩個所選模型標籤，不能推論跨供應商或所有平台相容。每個案例均使用全新的 Temporary、Unpersonalized 對話與指定輸入資料包，未使用 API key。

正式 UI 執行保存原始下載、隔離紀錄、執行資訊及獨立逐項評分。一般人工操作測試不會自動成為官方相容性證據。完整分數與限制見[相容性矩陣](benchmarks/compatibility-matrix.md)。這些規劃交付物的評分不代表已完成真人研究、實作成效或可及性合規驗證。

本機 `python3 scripts/release_status.py --require-ready` 回報 ready：兩次官方執行、兩個不同 agent signature，沒有 failure 或 warning。兩次均使用 suite `0.1.0` 與凍結核心 commit `7d64090710ef20f1d24cea6b46199391d3c09c18`；main 後續的 adapter 與測試屬於另一組證據，未納入本次 benchmark 輸入。

發布前須核對確切 candidate 的 CI 與必要外部檢查、完成公開合併，再依 [RELEASE.md](RELEASE.md) 建立 release tag。發布紀錄以 [Issue #1](https://github.com/bynanci/website-design-skill/issues/1) 與 [GitHub Releases](https://github.com/bynanci/website-design-skill/releases) 為準。在 2026-11-17 快照中，[#29](https://github.com/bynanci/website-design-skill/issues/29) 的部署配額限制仍有效，預定於 2026-11-18 19:10（Asia/Taipei）追蹤。詳見 [v0.1.0 發布說明草案](docs/releases/v0.1.0.zh-TW.md)。

## 相關文件

- [繁體中文變更紀錄](CHANGELOG.zh-TW.md)
- [繁體中文核心技能](SKILL.zh-TW.md)
- [繁體中文 Roadmap](ROADMAP.zh-TW.md)
- [繁體中文整合層索引](integrations/README.zh-TW.md)
- [英文版整合層索引](integrations/README.md)
