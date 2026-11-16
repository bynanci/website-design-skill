# 合成 Vue 專案 Profile fixture

[English](README.md) · 繁體中文

此 fixture 提供可重現的唯讀檢查輸入：

- `package.json` 宣告 Vue、Vite、TypeScript、Sass 與 Pinia 版本。
- 根目錄 `tsconfig.json` 使用 JSONC 註解、尾端逗號與 `@/*` alias。
- SCSS token 宣告與 dark theme CSS override。
- Vue 狀態元件、Pinia store 與 API service 邊界。
- Vite 動態設定會被列入來源並計算 digest，但不會執行或解析。

套件版本只是合成 manifest 中的宣告；fixture 不含 lockfile、已安裝依賴、build 或 runtime。

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

`expected-profile.json` 保存此命令的輸出，用來確認靜態檔案 digest 與候選清單。回歸測試會比對此輸出，並確認來源檔變動後會重新計算 digest。Token 語意、CSS import 關係、dark theme 最終值、元件公開 API、狀態所有權與渲染結果仍維持 unknown。本 fixture 沒有宣稱通過視覺、可及性或瀏覽器驗收。

請在 repository 根目錄執行聚焦的回歸測試：

```sh
python3 -m unittest discover -s tests -p 'test_project_profile_inspector.py' -v
```
