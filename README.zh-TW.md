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

[整合層索引](integrations/README.zh-TW.md)描述如何讀取專案既有設計 token、元件、狀態與 API 所有權，並提出有界限的修改與驗收紀錄。這些內容目前屬於 PR #9 的提案規格；尚未提供掃描器、AST 修改器、Playwright runner、MCP server 或 runtime renderer。

實作任務由 [Issue #8](https://github.com/bynanci/website-design-skill/issues/8) 統整，細項為 #11–#15。核心 v0.1 發布證據與 v0.2 實作仍依各自的 release gate 管理。

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

## 相關文件

- [繁體中文變更紀錄](CHANGELOG.zh-TW.md)
- [繁體中文核心技能](SKILL.zh-TW.md)
- [繁體中文 Roadmap](ROADMAP.zh-TW.md)
- [繁體中文整合層索引](integrations/README.zh-TW.md)
- [英文版整合層索引](integrations/README.md)
