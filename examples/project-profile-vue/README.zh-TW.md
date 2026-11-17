# 合成 Vue 專案 Profile fixture

[English](README.md) · 繁體中文

此 fixture 提供可重現的唯讀檢查輸入：

- `package.json` 宣告 Vue、Vite、TypeScript、Sass 與 Pinia 版本。
- 根目錄 `tsconfig.json` 使用 JSONC 註解、尾端逗號與 `@/*` alias。
- SCSS token 宣告與 dark theme CSS override。
- Vue 狀態元件、Pinia store 與 API service 邊界。
- Vite 動態設定會被列入來源並計算 digest，但不會執行或解析。

Fixture manifest 宣告所需套件；選用的 [Vue profile 試點](../../integrations/vue-project-profile/README.zh-TW.md) 以自己的 lockfile 鎖定相同 compiler/runtime，並提供 production build/render harness。

請在 repository 根目錄執行：

```sh
python3 scripts/inspect_project_profile.py examples/project-profile-vue \
  --task "Inspect the dashboard status banner" \
  --affected-path src/components/StatusBanner.vue \
  --required-alias "@/components" \
  --required-alias "@missing" \
  --required-token=--color-warning \
  --required-token=--color-destructive \
  --required-token=--missing-token
```

`expected-profile.json` 保存此命令的輸出，用來確認靜態檔案 digest 與候選清單。回歸測試會比對此輸出，並確認來源檔變動後會重新計算 digest。此 Python 快照對語意角色、theme 計算值、元件 API 與狀態所有權仍維持 unknown。選用試點會為 `profile-contract.json` 指定的角色提供來源證據、擷取元件 props 與既有 Pinia/service owner，並另外執行兩個 theme consumer 的瀏覽器檢查。這些檢查只涵蓋此狀態元件 fixture；完整 dashboard 品質與狀態轉換仍需各自的證據。

請在 repository 根目錄執行聚焦的回歸測試：

```sh
python3 -m unittest discover -s tests -p 'test_project_profile_inspector.py' -v
```

## 剖析與渲染證據

`profile-contract.json` 是經審查的意圖契約。它將警告與破壞性操作分別對應至不同的既有 token，指定兩個 theme、元件及既有 state/API owner，並為唯一獲准的邊線寬度 literal 限定範圍。它不提供執行期權限。

依選用試點指南安裝工具、檢查來源圖並執行 production render 檢查。CI 保存生成的 profile、實際 runtime 版本、來源 hash 與截圖。瀏覽器不可用或執行失敗時，仍須明確標記失敗或未執行。
