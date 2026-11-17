# 獨立的 v0.2 試點

[English](README.md) · 繁體中文

狀態：**兩組真實 ChatGPT web 執行已於 2026-11-17 生成並完成獨立評審。** 此試點涵蓋 draft PR #5 的響應式配置與可及性規劃案例，與凍結的 v0.1 benchmark 及發布政策分開。

| 契約 | 值 |
|---|---|
| Suite/protocol 版本 | `0.2-pilot.1` |
| 固定來源 commit | `7f7148a0752718ba3fb363c019441a6d5ca91f15` |
| 案例 | `responsive-layout-001`、`accessibility-001` |
| 評分 | 每案 9 項、每項 0–2 分，獨立滿分 36 分 |
| 公開發布門檻 | 無；比較逐項結果與重大錯誤 |
| 真實已完成執行 | 2；每組的每個案例均使用全新生成情境 |

來源 commit 固定公開技能、選用範本與案例輸入；packager 僅在這些固定 bytes 之外產生操作 metadata。來源、提示或準則變動時，須先審查試點版本決策，不可暗中移動 pin；validator 會拒絕其他 commit。

## 準備隔離輸入

先取得 repository history，確保固定 commit 可讀取。在 repository 根目錄執行：

```sh
python3 scripts/validate_v02_pilot.py
python3 scripts/build_v02_pilot_packets.py --output-dir /tmp/website-v02-pilot-packets
```

Builder 透過 Git 讀取固定來源，為每案產生一個 ZIP 與 `packet-checksums.json`。每個 ZIP 僅包含該案輸入、經審查的公開技能/參考/範本白名單，以及生成的 `packet.json`。Expected、量表、結果、評審註記與其他案例不會放入。ZIP 時間與順序固定，SHA-256 識別確切輸入包及檔案。

輸入包不會證明 runner 合格，也不會產生相容性證據。已接觸評審材料的目前對話及其繼承 agent 不可當成乾淨執行。

## 執行與保存

1. 選擇至少兩個獨立啟動的 agent 執行情境，記錄實際 provider、product、model 與能力；不可猜測隱藏模型身份。每案使用新的生成情境。
2. 每個 runner 僅提供一個 ZIP。確認 checksum，將檔案存取限制於解壓後的輸入包。不可提供評審檔案、分數、舊回應或另一案例的輸出。
3. 依 `packet.json` 與公開技能執行，保存完整原始回應，包含失敗與不確定性，不可人工改稿。
4. 在 `isolation.md` 保存各案例的實際 execution/context ID、輸入包 checksum、提供/讀取檔案、能力/存取限制、起訖時間與隔離證據。工具不可用須與規劃品質分開記錄。
5. 生成後評審才可讀取[量表](rubric.zh-TW.md)與固定案例的 `expected.md`。依準則 ID 評分，保存原文摘錄與重大錯誤說明，維持生成先於評分。
6. 每次執行存於 `results/<run-id>/`，含 `result.json`、`isolation.md`、`raw/responsive-layout-001.md` 及 `raw/accessibility-001.md`。依已保存 bytes 計算 raw/isolation SHA-256；不同案例不可重用 raw 檔案。
7. 驗證紀錄後，仍須審查執行 log 與隔離宣告，才能接受結果。

[嚴格結果 schema](result.schema.json) 定義完整 metadata。完成紀錄須有實際 agent 身份、明確能力、獨立/評審隔離宣告、生成及評分時間、兩個 raw 輸出、18 項分數、重大錯誤與重算總分。每個非零分數都需引用已保存的 raw 原文。

不可用紀錄使用 `status="unavailable"`、明確存取/能力原因與真實嘗試/隔離紀錄，不包含生成輸出、評審或分數。訂閱阻擋、無模型身份、環境不支援或評審污染都不是技能相容性失敗。

## 驗證與比較

```sh
python3 scripts/validate_v02_pilot.py
python3 -m unittest discover -s tests -p 'test_v02_pilot.py' -v
```

零依賴 validator 檢查嚴格欄位、固定版本/pin、身份/能力、隔離紀錄、時間、逐案路徑、UTF-8/非空 raw、symlink/越界保護、內容 hash、raw 重用、準則 ID、整數分數、原文摘錄與總分。若安裝 `jsonschema`，另可交叉檢查 JSON Schema。驗證通過僅證明紀錄一致，無法單獨認證服務商的情境隔離或評分品質。

至少比較兩個合格獨立情境，重大錯誤不可被平均抵銷。保留失敗及共通重大問題，先審查可重用契約再重跑，不可用 agent 專用指示掩蓋失敗。不可用紀錄不計入相容性分數；試點結果不會轉成官方 v0.1 證據。

## 已提交結果 — 2026-11-17

| 介面顯示模型 | 響應式配置 | 可及性 | 試點總分 | 量表列出的重大錯誤 |
|---|---:|---:|---:|---|
| [GPT-6](results/chatgpt-web-gpt-6-v02-20261117/result.json) | 18/18 | 18/18 | 36/36 | 未發現 |
| [GPT-5.6 Sol](results/chatgpt-web-gpt-5-6-sol-v02-20261117/result.json) | 18/18 | 15/18 | 33/36 | 未發現 |

兩組皆透過無 API 的 ChatGPT web 介面執行，推理強度為 Medium。每案使用全新的 Temporary／Unpersonalized 對話，只提供該案未修改的固定 ZIP 與相同標準生成提示。評審逐一比對 raw 與原始瀏覽器下載檔，並將輸入包各來源檔案與固定 Git bytes 比對。逐項原文摘錄、先生成後評分的時間、情境 ID、設定證據、hash、資格判斷與證據限制，均保存在各組的 `result.json`、`isolation.md` 與 `evidence/`。試點 validator、24 項試點測試及 JSON Schema 交叉檢查皆通過。

GPT-5.6 Sol 有三項可及性準則僅部分達成（各 1/2 分）；保留原始輸出與待改善項目，未代為改稿：

- **AX-01：** 已明訂鍵盤路徑，但持續可讀／表格資料替代方案仍附帶條件。後續須明訂不依賴短暫圖表詳情的等價資料路徑。
- **AX-02：** 有灰階與色覺差異檢查，缺少各產品主題下的驗證。後續補上主題別的分類意義檢查。
- **AX-03：** 已明訂焦點置入、限制與復原，但僅在既有產品支援時檢查 Escape。後續補上 Escape 行為及驗收條件。

未發現兩組共有的量表重大失敗。這是兩組以介面模型標籤識別的規劃執行，不是統計比較或發布門檻。介面標籤無法揭露隱藏後端版本（capture sidecar 的 `version: null`），展開的 UI 活動摘要也不是完整的服務商存取 log。資格判斷以保存的設定、輸入包邊界及控制者觀察為依據，受上述證據限制。分數不代表真實產品渲染、裝置行為、人工輔助科技測試或可及性標準已通過。試點分數不會轉為官方 v0.1 證據，也不套用其 30/40 門檻。這些提交提供了 Issue #6 追蹤的試點真實輸出與評審分數；issue／發布狀態仍須另行決定。

已完成執行之間不可重用相同 raw 內容或檔案身份，即使更換 run ID 或 provider metadata 也不例外。若真實輸出完全相同，須先另行審查協定，才能作為獨立性主張；validator 不會暗中將其計為新執行。
