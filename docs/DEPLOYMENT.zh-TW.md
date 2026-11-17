# 靜態展示頁部署

[English](DEPLOYMENT.md) · 繁體中文

本 repository 是 Agent Skill，另有選用靜態展示頁，不是根目錄 Vite 或 Next.js app。把 `integrations/vue-project-profile` 當成 Vite 專案部署會失敗，因為該工具目錄沒有 `index.html` 入口。

## 建置與範圍

在 repository root 執行 `node site/build.mjs`，以 `dist/` 為輸出。不需安裝套件、Python、browser 或付費服務即可建置。

Main 產生雙語文件入口。完整響應式 Dashboard fixture 存在時，另把五個已核准靜態檔案發布到 `/demos/dashboard/`。Builder 會清除舊輸出，main 不可殘留前一次 preview 的 Dashboard。公開 manifest 記錄來源與輸出檔案 digest；評估答案、benchmark 原始結果、logs、憑證與套件目錄不屬於公開資產。

建置或部署展示頁不等於發布核心技能、不會建立版本 tag，也不滿足 #1／#6；PR #5 保留發布 gate。

## 單一 Vercel 部署專案

| 設定 | 值 |
|---|---|
| 既有專案 | Team `bynanci` 的 `vue-project-profile` |
| Root Directory | Repository root；project setting 為空／null |
| Framework Preset | Other（`null`）|
| Node.js | 22.x |
| Install Command | `node -e "process.exit(0)"` |
| Build Command | `node site/build.mjs` |
| Output Directory | `dist` |
| Ignored Build Step | `node scripts/vercel_ignore_build.mjs` |

根目錄 `vercel.json` 定義建置／輸出行為。Root Directory 是 project setting，不是 `vercel.json` 欄位。保留既有存取保護與網域。

三個重複專案（`-83bv`、`-o57d`、`-8ed8`）已設定暫停 preview、忽略 build step，其工具根目錄另包含 `git.deploymentEnabled: false`。保留部署歷史，後續只使用單一正式指定專案。

Ignore script 只在已驗證的 diff 沒有變更部署輸入時略過，也包含用來判斷 preview 情境的 Dashboard 目錄是否存在。首次部署、淺層歷史缺少 object、revision 不一致或 Git 錯誤都要求建置。略過不等於部署成功；Vercel 仍把進入 ignored build step 後取消的部署計入部署配額。略過可節省建置工作，停用重複自動部署才會消除重複觸發。

## 驗證與合併

Static-site workflow 會建置 main 與已固定的完整 Dashboard 情境，檢查公開檔案清單、站內連結／資產及 MIME，並用 Chromium 操作實際 served production output，保存 artifacts 與來源識別。這些結果與 Vercel 平台狀態分開記錄。

核對完整 candidate SHA 的所有 commit statuses 與 check runs：

```sh
python3 scripts/check_merge_readiness.py \
  --repo bynanci/website-design-skill --sha <40字元-sha> \
  --required-check validate --required-check 'Vercel – vue-project-profile'
```

Exit 0 表示所有已觀察 context 及指定名稱均完成且成功；1 表示有阻擋／缺漏證據；2 表示 API、identity 或分頁證據無法驗證。Neutral、skipped 及 preview 留言成功都不證明部署成功。工具只回報就緒狀態，不會自行設定 branch protection。

Vercel 驗收需記錄精確來源 SHA、deployment ID、環境、`READY` 狀態及實際 HTTP／browser 結果。有配額、build 或存取錯誤時仍屬未完成。保存平台的 retry／reset 資訊；被限流時不反覆重試，也不自動升級方案。歷史失敗檢查保留為稽核紀錄。

## 事件與來源

[#29](https://github.com/bynanci/website-design-skill/issues/29)記錄缺少入口的實際 build 錯誤、四個重複部署 context、後續配額失敗、設定變更與最新驗證。在該 Issue 記錄真正 `READY` 部署前，不可把本機／CI 建置成功描述為 Vercel 成功。

平台原始文件：[專案設定](https://vercel.com/docs/project-configuration/vercel-json)、[Git 部署控制](https://vercel.com/docs/project-configuration/git-configuration)、[建置設定](https://vercel.com/docs/project-configuration/project-settings)、[配額](https://vercel.com/docs/limits)。
