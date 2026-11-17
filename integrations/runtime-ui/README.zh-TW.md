# Declarative Runtime UI 實驗

[English](README.md) · 繁體中文

**狀態：提案中的 P2 實驗；尚未實作 runtime renderer 或 microfrontend system。**

## 目的與安全邊界

Host 可針對特定狀態要求暫時的 troubleshooting 或設定面板。模型只提出宣告式 UI tree；host 使用已信任的元件和 action handler 驗證並渲染。

這與設計時 source editing 是不同邊界。MCP 可以傳送 request，但它本身不是 renderer，也不會授予授權。

模型輸出與錯誤 log 一律視為不可信資料。不得在應用程式中編譯生成的 Vue template、JSX、JavaScript、任意 HTML/CSS、expression、module URL 或 native command。

## Host 契約

- 協商明確 schema version、註冊元件版本、可用 token 與 action 能力。
- 只提供最小化且已遮蔽的 state snapshot，並附穩定 error code 和 correlation ID。
- Log text 只是資料，不可擴大工具或 action allowlist。
- 遞迴驗證每個 node、property、enum、長度、數量與深度，拒絕未知欄位。
- 元件名稱只能從固定 registry 解析，各元件另有允許的 props。
- Action 必須來自 registry，具有型別化參數並通過每次 request 的 host 授權。
- 每次 mutation 前重新檢查 state/version，拒絕過期或重放的操作。
- 面板需有範圍限制、可關閉；維持焦點、鍵盤導覽、錯誤與 reduced-motion 行為。
- 生成 timeout、不可用或 payload 驗證失敗時，顯示靜態錯誤面板。
- 插圖只能選取可信的本機 asset ID；不接受 raw HTML、任意圖片或遠端 URL。

## 示意回應

示例只說明資料形狀；正式實作必須先定義 strict schema 並由 host 驗證。Host 需限制 expires 時間，action registry 必須把 action 綁到當前 request，所有文字以純文字呈現。生成的診斷只能標示為建議，並在有可信診斷證據時連結該證據。

## 研究測試錯誤試點

對 N-01 troubleshooting 實驗，先取得實際案例的輸入、錯誤和復原契約。本提案不推測 N-01 含義，也不捏造研究證據。

使用合成例外和預先註冊的安全 action；檢查合法資料、未知元件/action/props、超大巢狀 payload、惡意 log、注入 code/URL、過期或重放 action、模型不可用與 focus restoration。除非明確核准，request 不得包含原始參與者資料。

## 成本與支援門檻

動態面板可能增加模型延遲、網路依賴、schema/registry 程式碼與維護成本。「初始 bundle 更小」是待量測假設，不是保證。

接受 runtime 試點前，記錄 schema conformance、靜態 fallback、延遲/成本預算、payload 上限、可及性與 host 隔離/權限邊界，並和靜態 recovery panel 比較。

若要稱為 microfrontend，還需定義套件隔離、生命週期、部署和版本相容性。此實驗只定義 declarative panel 邊界。
