# MCP Adapter 契約

[English](README.md) · 繁體中文

**狀態：提案架構；尚未實作 MCP server 套件。**

## 目標

透過 Model Context Protocol 提供選用操作，讓相容 host 可以要求專案盤點、設計文件、預覽或 patch。MCP adapter 是獨立整合套件；核心 skill 不依賴它。

第一版應提供小型、具型別的操作：

| 操作 | 副作用 | 契約 |
|---|---|---|
| inspect_project | 唯讀 | 僅回傳核准根目錄內的必要 metadata 和來源片段 |
| create_design_plan | 唯讀 | 回傳含證據、假設與未知項目的結構化產物 |
| render_preview | 執行已設定命令 | 需明確命令政策、逾時與本機目標 |
| review_capture | 唯讀 | 檢視提供的截圖；無影像能力時明確回報 |
| propose_patch | 唯讀 | 回傳 unified diff 和影響路徑，不寫入 |
| apply_patch | 寫入 | 與提案分開；需 host/user 授權並重新核對來源版本 |

不得提供通用 shell、無限制檔案系統、任意環境變數讀取或隱含部署工具。

## Workspace 與資料邊界

每次 request 綁定明確設定的 workspace root。路徑需正規化並解析 symlink；拒絕目錄跳脫或解析後超出核准 root 的路徑。只讀任務所需檔案，不列舉或回傳環境變數；預設排除 secrets、credentials、build artifacts 與個資。輸出和 logs 需清理。

預覽應留在本機並設逾時。未獲明確授權，不得將 source、截圖或 CSV 傳給外部服務。安裝依賴、使用網路或執行專案 script 前需有明確政策，並設定 allowlist、逾時與 process cleanup。寫入限定於核准路徑，並回傳完整 diff。

Remote transport 在實作前另需 authentication、每位使用者授權、origin 控制與 threat review。Local stdio 只是候選方案，尚未決策。

## 動態 UI 試點

遵循 [declarative runtime UI 契約](../runtime-ui/README.zh-TW.md)。Host 提供最小化 state snapshot、schema/component 版本與有限 action 能力；adapter 回傳資料，host 驗證後才可用註冊元件渲染暫時面板。

生成模板、module、raw HTML/CSS 與任意命令都不允許。狀態變更沿用 host 授權並重新檢查當前狀態。遇到無效 payload、timeout 或模型不可用時，提供可及的靜態 fallback。宣稱減少 bundle 前，先量測 latency、成本與 runtime 影響。

## 發布前 gate

- tool schema 拒絕未知欄位與無效路徑；
- 測試 workspace root 與 symlink 越界；
- 讀取和寫入分開且可稽核；
- 命令執行預設關閉，啟用時需受限；
- 明確定義資料處理、網路與保存方式；
- host 可顯示來源、證據、精確 diff 與授權提示；
- conformance test 不依賴特定模型；
- 依實際 transport、SDK 與 host 權限模型進行安全審查。
