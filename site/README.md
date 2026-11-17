# Public documentation site

Build from the repository root with Node.js 22 or later:

```sh
node site/build.mjs
```

The output is always `dist/`. Serve that directory as a static site. The build uses Node.js built-ins and requires no package installation, framework build or environment variables.

The bilingual landing page links to the documentation at the source commit. When the responsive-dashboard specimen is present, the builder copies only `index.html`, `styles.css`, `fixture-data.js`, `components.js` and `app.js` into `dist/demos/dashboard/`. When absent, the landing page states that the demo is not included and links to its preview source. Partial or invalid specimen inputs fail the build. Each build removes the previous output, including when input validation fails.

`manifest.json` records the source Git commit, available demos, fixed input hashes, and the byte count and SHA-256 hash of each published file. The manifest excludes its own digest. It follows [manifest.schema.json](manifest.schema.json); it contains no build timestamp, environment variables or absolute source paths. A non-Git isolated test fixture uses a `null` source commit.

Tests may import `buildSite({ projectRoot })` from `build.mjs`. `projectRoot` must be an absolute, non-symlink directory containing the same fixed `site/` inputs. The output remains `projectRoot/dist`; there is no configurable destination or environment override. Input files and their parent directories must be regular paths without symlinks. JavaScript syntax is checked without executing the specimen.

The site is a documentation and bounded-demo surface. Its successful build does not satisfy the v0.1 benchmark release gate or establish general v0.2 integration support.

## 繁體中文

在 repository 根目錄執行 `node site/build.mjs`，即可產生 `dist/` 靜態網站。建置只使用 Node.js 內建模組，不需要安裝套件或設定環境變數。

雙語首頁連結至來源 commit 的文件。只有來源包含完整響應式工作台時，才會複製明確允許的五個檔案；main 未包含此範例時，首頁會清楚標示並提供預覽來源連結。每次建置先移除舊輸出，避免預覽檔案殘留於 main 部署。輸入不完整或驗證失敗時，不留下可誤部署的輸出。

公開 manifest 記錄來源 commit、示範狀態、輸入與輸出雜湊，不包含環境變數、時間戳或本機絕對路徑。網站建置成功與核心 benchmark 發布條件分開管理。
