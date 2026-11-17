# Harbor Dashboard：實際 token 盤點

[English](design-token-extraction.md) · 繁體中文

目前範例有可檢查的 CSS 來源。目標產品的 inventory pending：這些公開數值無法證明其他 repository 已有相同 token、alias 或元件相容性。

## 來源與作用域

`specimen/index.html` 直接載入 `styles.css`。Root 提供 light 預設值，`:root[data-theme=dark]` 覆寫 dark 值。`components.js` 建立使用 `--chart-*` 的 SVG；`app.js` 切換 root theme attribute，不會編譯或下載樣式。

目前來源由 [2026-11-17 證據紀錄](qa-review-2026-11-17.zh-TW.md)追蹤。比較數值前先核對最終 raw artifact 的 source digest；2026-11-16 報告中的舊 stylesheet digest 僅識別當時版本。

| 實際 token | Light／dark 範例 | 使用處 |
|---|---|---|
| `--canvas`、`--surface` | `#f6f7f6`／`#111a19`；`#fff`／`#182522` | 頁面、panel、控制項與 dialog |
| `--ink`、`--muted` | `#1c2d31`／`#edf5f0`；`#52625d`／`#b7c9bf` | 文字、metadata、回饋與 SVG 標籤 |
| `--accent`、`--accent-ink`、`--on-accent` | Accent `#165e59`／`#9cd8bd`；前景 `#fff`／`#102c21` | 按鈕、已選方向、連結及識別標誌 |
| `--focus`、`--control-line` | Focus `#026ebc`／`#85c8ff`；邊界 `#6b8178`／`#789c88` | 焦點外框與控制項邊界 |
| `--warning-ink`、`--warning-bg` | 前景 `#906420`／`#f5d68c`；背景 `#fff8e9`／`#443715` | 觀察警示與案件狀態 |
| `--danger-ink`、`--danger-bg` | 前景 `#a45733`／`#ffc2a4`；背景 `#fff2eb`／`#4b2c23` | 錯誤回饋與高優先案件 |
| `--chart-1` … `--chart-5`、`--chart-track` | 各主題提供五個分類／序列色與底軌值 | 營收圖表及圖例 |
| `--radius` | Editorial `12px`；cockpit `7px` | Dashboard 內的 panel／metric 圓角 |

警告與高優先／錯誤樣式各有 token。本範例沒有破壞性操作，`danger` 名稱不能證明刪除或不可逆操作的語意。數據表及具名回饋保留圖表意義，不依賴顏色單獨判讀。

## 重用與剩餘 drift 範圍

八個原生 factory 封裝客戶、指標、觀察、圖表、商機、案件與筆記；主題及 dialog／read 行為由 host 負責。此範例已實作原生 template 重用，外部 Vue／React 元件整合仍未執行。

Editorial 與 cockpit 共用主題色盤，cockpit 改變密度、圓角、邊框及間距。字體、版面尺寸及部分裝飾／陰影仍使用 CSS literal。此處沒有 SCSS、Tailwind 設定、token interchange，也未宣稱已消除所有 literal。

遷移前，先檢查目標產品的 import 與元件 API，逐項對應語意角色，核准新增 token 或局部例外，再比較每個主題／狀態的使用處。保留舊候選與來源 hash 供 rollback。現有矩陣及六次 tagged axe 掃描屬於局部證據，不代表所有 token 使用或對比組合已認證。

## 證據狀態

- [x] 已檢查 token 宣告、theme selector 與代表性使用處。
- [x] 已記錄原生元件與 host 所有權。
- [ ] 在日期報告連結並審查目前候選的完整矩陣／原生縮放 CI 結果。
- [ ] 完成外部產品 token／元件對照、drift 分母及遷移核准。
- [ ] 依產品需求補足螢幕閱讀器、實體裝置及正式主題證據。
