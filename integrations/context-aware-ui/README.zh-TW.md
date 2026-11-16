# Context-aware UI 協作架構（提案）

[English](README.md) · 繁體中文

**狀態：文件規格，尚未實作。** 本目錄定義選用整合層的契約，不含專案掃描器、patch engine、狀態產生器、視覺修正 agent 或 runtime renderer。

## 目標與範圍

讓 UI 修改符合目標專案的設計系統、元件 API、狀態所有權、資料流與 runtime 限制，並提供可審查的變更與驗收證據。

核心改版方法繼續保持精簡且可攜。整合規格須先以版本化契約和 fixture 驗證；在沒有獨立證據前，不宣稱支援其他框架或保證業務行為不變。

## 分層責任

| 層級 | 責任 | 產物 |
|---|---|---|
| 通用方法 | 目標、內容涵蓋、資訊架構、元件職責 | 既有設計文件 |
| 專案 context | 檢查慣例、token、元件、狀態/API owner | 帶來源的版本化 profile |
| 修改計畫 | 對應需求、重用策略、狀態與修改邊界 | 可審查的計畫 |
| 框架 adapter | 解析支援語法並提出有限修改 | patch 與驗收需求 |
| 證據 runner | 執行設定好的狀態和條件 | 截圖、量測、失敗與未執行條件 |
| Host 整合 | 提供受限操作或暫時宣告式介面 | 受 host 控制的工具與 UI |

解析器、命令執行、影像審查、MCP transport 與 runtime renderer 是不同能力，必須分別探索，不可互相推定。

## 五項能力契約

1. **設計系統對應**：將語意需求連到已觀察到的 token 與既有元件。角色、theme、import 或 alias 不明時停止猜測。
2. **AST 導向修改**：解析支援的目標、保留修改邊界並檢查來源版本；遇到過期、歧義或不支援語法時拒絕寫入。
3. **狀態涵蓋**：依功能適用 loading、empty、error、success 等狀態，並處理取消、過期回應與安全回復。
4. **響應式修正**：檢查宣告的尺寸、theme 和互動矩陣；修正輪數及資源有上限，任何候選修改都要重新檢查完整矩陣。
5. **Declarative runtime UI**：只接受經過驗證的資料樹、固定元件與 action registry，並提供靜態 fallback。

## 最小 artifact 鏈

專案 profile 記錄檔案 digest、技術堆疊、alias、token/元件來源、state/API owner、可用能力與未知事項。修改計畫記錄目標檔案、語意、保護區域、預期檢查。patch proposal 綁定來源 digest，變更前重新核對。驗收報告記錄版本、fixture、runtime、量測、產物與未執行項目。

成功規劃或成功解析不等於實作成功。所有結果使用 passed、failed、not run、unsupported 或 blocked 等明確狀態，並附證據。

## 交付順序

- P0 #11：唯讀專案 profile、token 對照與元件重用。
- P0 #12：一種具過期檔案拒絕、冪等與行為回歸的 Vue patch。
- P0 #13：沿用既有 owner 的媒體庫狀態轉換與錯誤回復。
- P1 #14：在 Issue #7 的 dashboard fixture 上執行有限響應式修正。
- P2 #15：以註冊 action 和靜態 fallback 試做 runtime troubleshooting panel。

#1 的 v0.1 發布證據與 #5–#7 的 v0.2 artifact/pilot 是獨立 gate，不會因整合層實驗而自動通過。
