/** Public static-site builder. Node built-ins only; never executes specimen code. */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { lstat, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE_INPUTS = Object.freeze(['site/build.mjs', 'site/index.html', 'site/styles.css', 'site/manifest.schema.json']);
const DASHBOARD_SOURCE = 'examples/responsive-dashboard/specimen';
const DASHBOARD_FILES = Object.freeze(['index.html', 'styles.css', 'fixture-data.js', 'components.js', 'app.js']);
const COMPONENTS = Object.freeze(['AccountSummary', 'MetricGrid', 'InsightList', 'RevenueMix', 'NotesEditor', 'RevenueTrend', 'OpportunityList', 'CaseTable']);
const REPOSITORY = 'https://github.com/bynanci/website-design-skill';
const PREVIEW_SOURCE = `${REPOSITORY}/tree/codex/roadmap-v02-visual-responsive-preview-20261116/examples/responsive-dashboard`;
const MAX_INPUT_BYTES = 1024 * 1024;
const sha256 = value => createHash('sha256').update(value).digest('hex');

async function statIfPresent(filename) {
  try { return await lstat(filename); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

// All public inputs are fixed paths. Refuse symlinks in each path segment so a
// copied fixture cannot expand publication scope or write outside its root.
async function regularInput(root, relative) {
  const segments = relative.split('/');
  let current = root;
  for (const [index, segment] of segments.entries()) {
    current = path.join(current, segment);
    const stat = await statIfPresent(current);
    if (!stat || stat.isSymbolicLink() || (index < segments.length - 1 ? !stat.isDirectory() : !stat.isFile())) {
      throw new Error(`Expected a regular, non-symlink input: ${relative}`);
    }
    if (index === segments.length - 1 && stat.size > MAX_INPUT_BYTES) throw new Error(`Input exceeds size limit: ${relative}`);
  }
  const bytes = await readFile(current);
  if (bytes.length > MAX_INPUT_BYTES) throw new Error(`Input exceeds size limit: ${relative}`);
  let text;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { throw new Error(`Input must be UTF-8: ${relative}`); }
  if (!text.trim() || text.includes('\0')) throw new Error(`Empty or invalid input: ${relative}`);
  return { bytes, text };
}

function attributes(markup, name) {
  const pattern = new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'gi');
  return [...markup.matchAll(pattern)].map(match => match[1] ?? match[2] ?? match[3]);
}

function validateHtml(text, label) {
  if (!/^\s*<!doctype html>/i.test(text) || !/<html\b/i.test(text) || !/<head\b/i.test(text) || !/<body\b/i.test(text)
    || !/<\/head\s*>/i.test(text) || !/<\/body\s*>\s*<\/html\s*>\s*$/i.test(text)
    || !/<title>[^<]+<\/title>/i.test(text) || !/<main\b/i.test(text)) {
    throw new Error(`Incomplete HTML document: ${label}`);
  }
}

function validateCss(text, label) {
  let depth = 0, quote = null, comment = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i + 1];
    if (comment) { if (ch === '*' && next === '/') { comment = false; i++; } continue; }
    if (quote) { if (ch === '\\') i++; else if (ch === quote) quote = null; continue; }
    if (ch === '/' && next === '*') { comment = true; i++; continue; }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '{') depth++;
    if (ch === '}' && --depth < 0) throw new Error(`Unbalanced CSS: ${label}`);
  }
  if (depth !== 0 || quote || comment || !text.includes('{')) throw new Error(`Incomplete CSS: ${label}`);
  // Both published stylesheets are self-contained. Do not introduce an implicit
  // remote asset or another source path through CSS.
  if (/@import\b|url\s*\(/i.test(text)) throw new Error(`Unexpected CSS asset dependency: ${label}`);
}

function validateDashboard(inputs) {
  const html = inputs.get(`${DASHBOARD_SOURCE}/index.html`).text;
  validateHtml(html, `${DASHBOARD_SOURCE}/index.html`);
  // The reviewed specimen uses only three script resources and one stylesheet.
  // Refuse other resource-bearing markup outright, including unquoted URL
  // attributes which a quoted-attribute inventory alone would not recognize.
  if (/<\s*(?:img|iframe|frame|object|embed|image|use|source|video|audio|base|portal|fencedframe|style)\b/i.test(html)
    || /\s(?:srcset|poster|background|action|formaction|http-equiv|style)\s*=/i.test(html)) {
    throw new Error('Dashboard contains unsupported resource-bearing markup');
  }
  const scripts = [...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi)];
  const actualScripts = scripts.map(([tag]) => attributes(tag, 'src')[0]);
  const expectedScripts = ['fixture-data.js', 'components.js', 'app.js'];
  if (actualScripts.length !== expectedScripts.length || actualScripts.some((value, index) => value?.replace(/^\.\//, '') !== expectedScripts[index])) {
    throw new Error('Dashboard must reference only the three allowlisted scripts in execution order');
  }
  const styles = [...html.matchAll(/<link\b[^>]*>/gi)];
  if (styles.length !== 1 || !/\brel\s*=\s*(["'])stylesheet\1/i.test(styles[0][0]) || attributes(styles[0][0], 'href')[0]?.replace(/^\.\//, '') !== 'styles.css') {
    throw new Error('Dashboard must reference the allowlisted stylesheet');
  }
  const assetSources = attributes(html, 'src');
  if (assetSources.length !== 3 || assetSources.some(value => !expectedScripts.includes(value.replace(/^\.\//, '')))) {
    throw new Error('Dashboard contains an asset outside the publication allowlist');
  }
  const hrefs = attributes(html, 'href');
  if (hrefs.some(value => !value.startsWith('#') && value.replace(/^\.\//, '') !== 'styles.css')) {
    throw new Error('Dashboard contains a link outside the self-contained specimen');
  }
  for (const name of COMPONENTS) {
    if (!html.includes(`data-dashboard-component="${name}"`) || !html.includes(`id="component-${name}"`)) {
      throw new Error(`Dashboard is missing a component mount or template: ${name}`);
    }
  }
  for (const filename of expectedScripts) {
    try { new vm.Script(inputs.get(`${DASHBOARD_SOURCE}/${filename}`).text, { filename }); }
    catch (error) { throw new Error(`Invalid dashboard JavaScript (${filename}): ${error.message}`); }
  }
  validateFixtureData(inputs.get(`${DASHBOARD_SOURCE}/fixture-data.js`).text);
  if (!inputs.get(`${DASHBOARD_SOURCE}/app.js`).text.includes('window.__DASHBOARD_READY__ = true')
    || !inputs.get(`${DASHBOARD_SOURCE}/components.js`).text.includes('window.DashboardComponents')) {
    throw new Error('Dashboard is missing its application or component initialization contract');
  }
  validateCss(inputs.get(`${DASHBOARD_SOURCE}/styles.css`).text, `${DASHBOARD_SOURCE}/styles.css`);
}

function validateFixtureData(text) {
  // This specimen deliberately stores JSON in one assignment. Parse that JSON
  // rather than running JavaScript or reading any runtime/global value.
  const assignment = text.match(/^\s*(?:\/\*[\s\S]*?\*\/\s*)*window\.DashboardFixtureData\s*=\s*([\s\S]*?)\s*;\s*$/);
  let data;
  try { data = assignment && JSON.parse(assignment[1]); }
  catch { throw new Error('Dashboard fixture data must contain its complete static JSON assignment'); }
  const string = value => typeof value === 'string' && value.trim().length > 0;
  const items = (value, count, valid) => Array.isArray(value) && value.length === count && value.every(valid);
  const fields = (value, names) => value && names.every(name => string(value[name]));
  const numeric = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
  const valid = data && typeof data === 'object' && Object.keys(data).length === COMPONENTS.length
    && COMPONENTS.every(name => data[name] && typeof data[name] === 'object')
    && fields(data.AccountSummary, ['name', 'summary']) && items(data.AccountSummary.details, 4, string)
    && items(data.MetricGrid.items, 4, item => fields(item, ['title', 'glyph', 'value', 'unit', 'foot']) && typeof item.positive === 'boolean')
    && items(data.InsightList.items, 4, item => fields(item, ['title', 'description', 'source', 'href', 'kind', 'question']) && /^#evidence-\d{2}$/.test(item.href) && (item.priority === null || string(item.priority)))
    && items(data.OpportunityList.items, 2, item => fields(item, ['title', 'description', 'status']))
    && items(data.CaseTable.items, 3, item => items(item, 7, string))
    && fields(data.NotesEditor, ['title']) && fields(data.RevenueMix, ['title'])
    && items(data.RevenueMix.mix, 5, item => Array.isArray(item) && item.length === 2 && string(item[0]) && numeric(item[1]))
    && data.RevenueMix.mix.some(item => item[1] > 0)
    && fields(data.RevenueTrend, ['title']) && items(data.RevenueTrend.months, 6, string)
    && items(data.RevenueTrend.trend, 3, item => Array.isArray(item) && item.length === 2 && string(item[0]) && items(item[1], 6, value => numeric(value) && value <= 150));
  if (!valid) throw new Error('Dashboard fixture data does not satisfy the eight-group, five-mix, eighteen-trend-point specimen contract');
}

function sourceCommit(root) {
  try {
    // Do not let GIT_DIR/GIT_WORK_TREE or ambient Git configuration select a
    // different repository. Only public revision metadata is requested.
    const options = { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], env: { LC_ALL: 'C', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null' } };
    const top = execFileSync('git', ['-C', root, 'rev-parse', '--show-toplevel'], options).trim();
    if (path.resolve(top) !== root) return null;
    const sha = execFileSync('git', ['-C', root, 'rev-parse', '--verify', 'HEAD'], options).trim();
    return /^[a-f0-9]{40}$/.test(sha) ? sha : null;
  } catch { return null; }
}

function dashboardSection(available) {
  if (available) return `<article class="demo-card" data-demo-status="synthetic-preview"><div><span class="demo-badge">SYNTHETIC PREVIEW · 合成資料試作</span><h3>響應式客戶工作台<span lang="en">Responsive account dashboard</span></h3><p>八組內容、兩種視覺方向、明暗主題與可操作圖表。所有資料均為合成示範；記錄只保留於目前頁面，不會讀取或寫入後端。</p><p lang="en">Eight content groups, two visual directions, light and dark themes, and interactive charts. All data is synthetic. Notes remain in the current page; no backend data is read or written.</p><p>此範例屬 v0.2 有界試作，不能作為核心發布或通用整合能力的證明。<span lang="en"> This bounded v0.2 pilot does not establish core release readiness or general integration capability.</span></p></div><div class="demo-actions"><a class="button primary" href="./demos/dashboard/">開啟示範 · Open demo ↗</a><a href="${PREVIEW_SOURCE}">範圍與來源 · Scope &amp; source ↗</a></div></article>`;
  return `<article class="demo-card" data-demo-status="not-included"><div><span class="demo-badge">NOT INCLUDED · 此版本未包含</span><h3>響應式工作台另於預覽分支開發<span lang="en">The dashboard is developed on the preview branch</span></h3><p>目前來源未包含響應式工作台。本部署提供核心技能與雙語文件入口；v0.2 合成資料試作保留於預覽分支，依獨立驗收條件管理。</p><p lang="en">This source does not include the responsive dashboard. This deployment provides the core skill and bilingual documentation links. The synthetic v0.2 pilot remains on the preview branch with separate acceptance criteria.</p></div><div class="demo-actions"><a class="button secondary" href="${PREVIEW_SOURCE}">查看預覽來源 · Preview source ↗</a></div></article>`;
}

/** Build into projectRoot/dist. projectRoot is the only fixture-test override. */
export async function buildSite({ projectRoot = DEFAULT_ROOT } = {}) {
  if (typeof projectRoot !== 'string' || !path.isAbsolute(projectRoot)) throw new Error('projectRoot must be an absolute directory path');
  const rootStat = await statIfPresent(projectRoot);
  if (!rootStat?.isDirectory() || rootStat.isSymbolicLink()) throw new Error('projectRoot must be a regular, non-symlink directory');
  const root = await realpath(projectRoot);
  const output = path.join(root, 'dist');
  const outputStat = await statIfPresent(output);
  if (outputStat && (!outputStat.isDirectory() || outputStat.isSymbolicLink())) throw new Error('dist must be a regular directory, never a symlink');
  // A rebuild is a fresh publication, including when optional input validation
  // fails. In particular, a main build cannot retain preview-only demo assets.
  await rm(output, { recursive: true, force: true });
  try {
    const inputs = new Map();
    for (const relative of SITE_INPUTS) inputs.set(relative, await regularInput(root, relative));
    const template = inputs.get('site/index.html').text;
    validateHtml(template, 'site/index.html');
    validateCss(inputs.get('site/styles.css').text, 'site/styles.css');
    JSON.parse(inputs.get('site/manifest.schema.json').text);
    const exampleStat = await statIfPresent(path.join(root, 'examples'));
    if (exampleStat?.isSymbolicLink()) throw new Error('examples must not be a symlink');
    const dashboardRoot = await statIfPresent(path.join(root, 'examples/responsive-dashboard'));
    const specimen = await statIfPresent(path.join(root, DASHBOARD_SOURCE));
    const available = Boolean(dashboardRoot || specimen);
    if (available) {
      for (const filename of DASHBOARD_FILES) {
        const relative = `${DASHBOARD_SOURCE}/${filename}`;
        inputs.set(relative, await regularInput(root, relative));
      }
      validateDashboard(inputs);
    }
    const commit = sourceCommit(root);
    const html = template.replaceAll('{{SOURCE_BASE}}', `${REPOSITORY}/blob/${commit ?? 'main'}`)
      .replaceAll('{{SOURCE_COMMIT}}', commit ?? 'unversioned fixture')
      .replace('{{DASHBOARD_SECTION}}', dashboardSection(available));
    if (/\{\{[A-Z_]+\}\}/.test(html)) throw new Error('Unresolved landing-page placeholder');
    const publication = new Map([['index.html', Buffer.from(html)], ['styles.css', inputs.get('site/styles.css').bytes]]);
    if (available) for (const filename of DASHBOARD_FILES) publication.set(`demos/dashboard/${filename}`, inputs.get(`${DASHBOARD_SOURCE}/${filename}`).bytes);
    const manifest = {
      schemaVersion: 1, sourceCommit: commit,
      availableDemos: available ? ['dashboard'] : [],
      dashboard: { available, status: available ? 'synthetic-preview' : 'not-included', source: available ? DASHBOARD_SOURCE : null },
      inputs: [...inputs].map(([relative, { bytes }]) => ({ path: relative, sha256: sha256(bytes) })).sort((a, b) => a.path.localeCompare(b.path, 'en')),
      files: [...publication].map(([relative, bytes]) => ({ path: relative, sha256: sha256(bytes), bytes: bytes.length })).sort((a, b) => a.path.localeCompare(b.path, 'en')),
    };
    for (const [relative, bytes] of publication) {
      const destination = path.join(output, relative);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, bytes);
    }
    await writeFile(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    return manifest;
  } catch (error) {
    await rm(output, { recursive: true, force: true });
    throw error;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 2) {
    process.stderr.write('Usage: node site/build.mjs\n'); process.exitCode = 1;
  } else {
    try {
      const manifest = await buildSite();
      process.stdout.write(`Built dist: ${manifest.files.length + 1} public files; dashboard ${manifest.dashboard.status}; source ${manifest.sourceCommit ?? 'unversioned fixture'}\n`);
    } catch (error) { process.stderr.write(`Static site build failed: ${error.message}\n`); process.exitCode = 1; }
  }
}
