# Vue 3、SCSS 與 Tauri Adapter

[English](README.md) · 繁體中文

**狀態：選用整合提案，只有說明文件；不含程式碼產生器，也沒有宣稱已在 Tauri 執行。**

## 目標

將通用設計產物轉成既有 Vue 3 專案的慣例。只有目標程式庫實際使用 Vue 3 時才採用 Vue 規則；只有實際存在 SCSS/Tauri 時才套用對應規範。

不得強加固定目錄、alias、元件庫、圖表套件、Tauri 版本或桌面互動方式。

## 產生程式前先檢查

依目標檢查 package 與 lockfile、Vue/TypeScript/SCSS/Tauri 版本、Vite 與 tsconfig alias、鄰近 SFC 慣例、token、共用元件、chart wrapper、可及性模式，以及 Tauri 設定和 Rust/plugin 設定。

缺少的檔案和未解資訊必須標記。不可因為方便而推定套件、alias、runtime 能力或 token 存在。

## Context、token、state 與修改邊界

先建立[專案 profile](../context-aware-ui/project-profile.zh-TW.md)，再提出 source 修改。視覺角色必須對應到實際觀察的 token/元件，並記錄缺漏、theme 與 import 證據。

沿用既有 store、composable 和 service owner。修改現有 SFC 時遵循[AST patch 契約](../ast-patching/README.zh-TW.md)：使用相符 parser、找到唯一目標、保留受保護範圍、拒絕過期檔案，並在 API 邊界驗證行為。MagicString 是來源範圍編輯工具，不是 parser。遇到不支援語法時應回報，不要重寫整份檔案。

## 元件提案需記錄

目標路徑及其來源慣例、元件責任、props/events/owned state、重用的元件與 token、鍵盤/focus/pointer 行為、empty/error/loading 狀態、SCSS scope、新增 token 或依賴，以及仍需取得的 Tauri 或截圖證據。

使用 script setup、TypeScript、composable 與 scoped SCSS 的前提，是它們符合現有程式庫慣例。

## Alias

@viz、@common 只是專案案例，不是預設。先從現有 Vite/TypeScript 設定解析 alias；若不存在，沿用已確認的路徑慣例，或另提具理由的設定變更，不得暗中新增 alias。

## 桌面互動

- **視窗拖曳**：Tauri 優先使用偵測版本所支援的 data-tauri-drag-region 或 window API。互動控制項應在拖曳區外或明確排除。不可假設 Electron 的 -webkit-app-region: drag 適用所有 Tauri WebView。
- **右鍵選單**：保留文字輸入、連結與可及性原生行為；僅在必要範圍攔截 contextmenu。自訂選單需支援鍵盤呼叫、焦點移入/還原、Escape 與語意。
- **文字選取**：不得全域停用。user-select: none 僅用在已確認的 title bar/drag handle；內文、程式碼、逐字稿、字幕與可編輯區須可選取。
- **視窗控制**：檢查點擊範圍、焦點順序、disabled、鍵盤、縮放、高 DPI 與 reduced motion。宣稱平台一致前，需實際測試目標 OS 和 WebView。

## 桌面編輯器試點

畫面規劃前先確認任務與內容模型。可包含媒體庫/匯入、預覽/播放、timeline、選取項目 inspector、特效或 story-node 樹，以及播放控制和快捷鍵。

明確管理 selection、playhead、zoom 與 drag state，並定義 empty/loading/selected/disabled/overflow。原型截圖不能證明真實媒體行為、timeline 效能或 native window 正確。

## 完成條件

宣稱 adapter 可執行前，需確認路徑與 alias 符合實際設定、頁面語意未破壞、專案 build 通過、鍵盤/focus/窄視窗經檢視、各宣稱 Tauri/WebView 目標已實測，並附上截圖與限制。
