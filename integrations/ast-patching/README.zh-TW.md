# AST 導向 UI Patch 契約

[English](README.md) · 繁體中文

**狀態：選用整合提案，尚未實作 parser 或 transform。**

## 用途與限制

使用語法結構定位和小範圍修改，降低改動既有元件時的非預期變更。解析成功不代表應用程式行為維持不變。

Vue SFC compiler utilities 可解析單檔元件；MagicString 用於修改來源文字範圍與產生 source map，本身不是 AST parser。應先以相容的語言與 template parser 找到支援節點，再使用 range editor 或適合的 printer 輸出修改。

## Vue 試點流程

1. 讀取目標檔並記錄內容 digest。
2. 使用符合專案 Vue 版本的工具解析 SFC 區塊。
3. 以實際語法解析 template 與 script，包括 TypeScript；所有位置都使用原始來源座標。
4. 透過明確條件找到唯一 template node，並解析相關 binding/import。
5. 依既有 handler、alias、scope、props/emits 與 state owner 決定修改方式。
6. 僅在宣告的允許區域產生互不重疊的 edits；保留其他註解、樣式與業務程式。
7. 重新解析提案，檢查 bindings、受保護區域，並執行適用的 compile/type/behavior 檢查。
8. 提交 diff 與證據；寫入前重新檢查 digest 與 host 授權。
9. 在約定檔案集合內原子套用，否則保持未套用。若檔案同時遭修改，必須重做計畫。

遇到不支援的 preprocessor、外部 SFC block 或語法時，回報不支援及可審查的替代方案，不得靜默改寫整份檔案。

## Patch 計畫紀錄

需記錄 profile、plan 與 operation ID；目標檔案及原始 digest；parser 版本與支援語法；target predicate 與命中數；既有 binding/handler；允許與保護區域；修改清單與 diff；預期 postcondition；解析/build/type/behavior 驗證；以及重複套用時的 no-op 或明確衝突規則。

新增 import 或 state 宣告必須另有允許範圍；找到一個 template node 不代表有權修改整個 script 區塊。

## Timeline 拖曳排序範例

需定位實際重複的 track/clip node 與穩定 key；重用 store 既有 reorder action 和 immutable ID；保留既有 drag handler；僅在 state owner 明確且不存在時新增 drag state；除 pointer 操作外提供鍵盤排序；保持 FFmpeg 呼叫與持久化邏輯留在原有 service；並驗證排序參數、副作用次數、選取/playhead 與持久化結果。

看到 dragstart 事件和 ref 不足以證明行為正確。Native drag/drop 與桌面 shell 差異需個別驗收。

## 失敗與回復

遇到來源錯誤或不支援、命中為零或多筆、binding 衝突、digest 過期、保護區域被改或 edits 重疊、compile/type/behavior 檢查失敗時，回傳提案 diff 或結構化拒絕。

提案失敗時不得改動專案檔案。在隔離 worktree 驗證後若要回復，只能撤銷本操作仍能識別的變更；遇到並行衝突應回報，不得覆寫。

## 支援宣稱前的證據

Vue transform 需要 TypeScript import、區域 shadowing、既有 handler、註解、多個 style block、重複/歧義節點、錯誤語法、過期檔案、冪等重套與回復衝突 fixture。需檢查允許範圍外位元組未變，並在既有 API 邊界驗證行為。

React/JSX 與 Svelte 需各自的 parser adapter、scope 規則與 conformance fixture。Parser 能解析語法，不等於 transform 正確。

## 已實作的 Vue 試點

選用的[軌道排序 fixture](../../examples/track-reorder-vue/README.zh-TW.md) 實作單一支援操作，包含當前原始來源 digest、剖析後的 target、受保護範圍、必要的 Vue/TypeScript 檢查、重複套用 no-op 與拒絕衝突的 rollback。套用必須使用 host 隔離且獨占的 checkout。共用 browser harness 保存完整提案，並驗證原生事件、副作用次數、選取與 playhead；支援語法與未執行邊界均明確列出。
