#!/usr/bin/env node
/** One bounded operation: bind two existing buttons to an existing store action. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parse, compileScript, compileTemplate, version as vueVersion } from '@vue/compiler-sfc';
import ts from 'typescript';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MAX_BYTES = 1_000_000;
const DEFAULTS = {
  file: 'src/components/TrackReorder.vue', owner: 'src/stores/tracks.ts',
  service: 'src/services/track-persistence.ts', storeExport: 'useTracksStore',
  storeBinding: 'tracks', trackId: 'trackId', action: 'moveTrack',
};
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const text = bytes => new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
const name = node => node && (ts.isIdentifier(node) || ts.isStringLiteral(node)) ? node.text : null;
const walk = (node, callback) => { callback(node); ts.forEachChild(node, child => walk(child, callback)); };
const fail = message => { throw new Error(message); };
// compileScript may transform template nodes; keep the compiler's cached parse
// descriptor immutable so subsequent proposals inspect original source nodes.
const parseFresh = (source, options) => {
  const result = parse(source, options);
  // SFC descriptors include an HMR callback; cloning their data drops that
  // unused callback and isolates compiler mutations without bypassing parsing.
  return { ...result, descriptor: JSON.parse(JSON.stringify(result.descriptor)) };
};

function safeFile(root, relative) {
  if (typeof relative !== 'string' || path.isAbsolute(relative)) fail('Expected a project-relative regular file');
  const absolute = path.resolve(root, relative);
  if (!absolute.startsWith(root + path.sep)) fail('Path escapes the approved root');
  if (fs.realpathSync(absolute) !== absolute) fail('Symlinks are unsupported');
  const stat = fs.statSync(absolute);
  if (!stat.isFile() || stat.size > MAX_BYTES) fail('Only bounded regular files are supported');
  return absolute;
}

function ast(file, source) {
  const result = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  if (result.parseDiagnostics.length) fail(`Malformed TypeScript: ${file}`);
  return result;
}

function runtimeImports(source) {
  const imports = [];
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const clause = statement.importClause;
    if (!clause || clause.isTypeOnly) continue;
    const bindings = [];
    if (clause.name) bindings.push({ imported: 'default', local: clause.name.text });
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const element of clause.namedBindings.elements) if (!element.isTypeOnly) bindings.push({ imported: element.propertyName?.text || element.name.text, local: element.name.text });
    }
    imports.push({ specifier: statement.moduleSpecifier.text, bindings });
  }
  return imports;
}

function localBindings(source) {
  const bindings = [];
  const collect = node => {
    if (ts.isIdentifier(node)) bindings.push(node.text);
    else if (ts.isObjectBindingPattern(node) || ts.isArrayBindingPattern(node)) for (const element of node.elements) if (ts.isBindingElement(element)) collect(element.name);
  };
  walk(source, node => {
    if ((ts.isVariableDeclaration(node) || ts.isParameter(node) || ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) && node.name) collect(node.name);
  });
  return bindings;
}

function buildPlan(root, input, beforeOverride) {
  const options = { ...DEFAULTS, ...input };
  for (const key of Object.keys(options)) if (![...Object.keys(DEFAULTS), 'expectedSha256'].includes(key)) fail(`Unsupported operation option: ${key}`);
  for (const key of ['storeExport', 'storeBinding', 'trackId', 'action']) if (!/^[A-Za-z_$][\w$]*$/.test(options[key])) fail(`Unsupported binding name: ${key}`);
  if (!/^[a-f0-9]{64}$/.test(options.expectedSha256 || '')) fail('An expected raw SHA-256 is required');
  const sources = new Map();
  const read = relative => {
    if (!sources.has(relative)) {
      const absolute = safeFile(root, relative);
      sources.set(relative, relative === options.file && beforeOverride ? Buffer.from(beforeOverride) : fs.readFileSync(absolute));
    }
    return sources.get(relative);
  };
  const original = read(options.file);
  if (sha256(original) !== options.expectedSha256) fail('Stale target digest');
  const manifest = JSON.parse(text(read('package.json')));
  if (manifest.dependencies?.vue !== vueVersion || manifest.devDependencies?.typescript !== ts.version) fail('Target Vue and TypeScript versions must match this pinned adapter');
  const originalText = text(original);
  if (path.extname(options.file) !== '.vue') fail('Only Vue SFC targets are supported');
  const parsed = parseFresh(originalText, { filename: options.file });
  if (parsed.errors.length) fail('Malformed Vue source');
  const descriptor = parsed.descriptor;
  if (!descriptor.template || !descriptor.scriptSetup || descriptor.script || descriptor.scriptSetup.lang !== 'ts' || descriptor.scriptSetup.src || descriptor.template.src || descriptor.template.lang || descriptor.styles.some(style => style.src || style.lang && style.lang !== 'css')) fail('Unsupported SFC block form');
  const componentAst = ast(options.file, descriptor.scriptSetup.content);
  const config = ts.parseConfigFileTextToJson('tsconfig.json', text(read('tsconfig.json')));
  if (config.error || !config.config || config.config.extends) fail('Static root aliases are required');
  const compiler = config.config.compilerOptions || {};
  const paths = compiler.paths || {};
  const baseUrl = compiler.baseUrl || '.';
  if (typeof baseUrl !== 'string') fail('Unsupported alias baseUrl');
  const resolveImport = (from, specifier) => {
    let candidate;
    if (specifier.startsWith('.')) candidate = path.posix.join(path.posix.dirname(from), specifier);
    else {
      const matches = Object.entries(paths).filter(([alias]) => alias === specifier || alias.endsWith('/*') && specifier.startsWith(alias.slice(0, -1)));
      if (matches.length !== 1) fail(`Unsupported or missing local alias: ${specifier}`);
      const [alias, targets] = matches[0];
      if (!Array.isArray(targets) || targets.length !== 1 || typeof targets[0] !== 'string') fail('Ambiguous alias targets');
      candidate = path.posix.join(baseUrl, targets[0].replace('*', alias.endsWith('/*') ? specifier.slice(alias.length - 1) : ''));
    }
    for (const extension of ['', '.ts', '/index.ts']) {
      const relative = path.posix.normalize(candidate + extension);
      try { safeFile(root, relative); return relative; }
      catch (error) { if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') throw error; }
    }
    fail(`Missing local import: ${specifier}`);
  };
  const inspectImportBoundary = (source, from, allowedLocal) => {
    for (const item of runtimeImports(source)) {
      if (path.isAbsolute(item.specifier)) fail('Absolute source imports escape the supported boundary');
      const packageName = item.specifier.startsWith('@') ? item.specifier.split('/').slice(0, 2).join('/') : item.specifier.split('/')[0];
      if (Object.hasOwn(manifest.dependencies || {}, packageName) || Object.hasOwn(manifest.devDependencies || {}, packageName)) continue;
      const target = resolveImport(from, item.specifier);
      if (!allowedLocal.includes(target)) fail(`Unsupported local module beyond the declared owner/service boundary: ${target}`);
      read(target);
    }
  };
  inspectImportBoundary(componentAst, options.file, [options.owner]);
  const imports = runtimeImports(componentAst);
  const ownerImports = imports.filter(item => item.bindings.some(binding => binding.imported === options.storeExport)).map(item => ({ ...item, target: resolveImport(options.file, item.specifier) })).filter(item => item.target === options.owner);
  if (ownerImports.length !== 1) fail('An unambiguous existing owner import is required');
  const ownerBindings = ownerImports[0].bindings.filter(binding => binding.imported === options.storeExport);
  if (ownerBindings.length !== 1) fail('Ambiguous owner import');
  const ownerBinding = ownerBindings[0].local;
  if (localBindings(componentAst).includes(ownerBinding)) fail('Shadowed owner import');
  const stores = [];
  for (const statement of componentAst.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) if (name(declaration.name) === options.storeBinding && declaration.initializer && ts.isCallExpression(declaration.initializer) && name(declaration.initializer.expression) === ownerBinding && declaration.initializer.arguments.length === 0) stores.push(declaration);
  }
  if (stores.length !== 1 || localBindings(componentAst).filter(binding => binding === options.storeBinding).length !== 1) fail('One unshadowed existing store binding is required');
  const compiledScript = compileScript(descriptor, { id: 'track-reorder-pilot' });
  if (compiledScript.bindings[options.trackId] !== 'props' || localBindings(componentAst).includes(options.trackId)) fail('An existing unshadowed track ID prop is required');
  let propsStatements = 0;
  for (const statement of componentAst.statements) {
    if (ts.isImportDeclaration(statement) || ts.isTypeAliasDeclaration(statement) || ts.isInterfaceDeclaration(statement) || ts.isEmptyStatement(statement)) continue;
    if (ts.isVariableStatement(statement) && statement.declarationList.flags & ts.NodeFlags.Const && statement.declarationList.declarations.length === 1 && statement.declarationList.declarations[0] === stores[0]) continue;
    if (ts.isExpressionStatement(statement) && ts.isCallExpression(statement.expression) && name(statement.expression.expression) === 'defineProps' && statement.expression.arguments.length === 0) { propsStatements++; continue; }
    fail('Unsupported executable statement: only imports, types, defineProps and one const owner binding are supported');
  }
  if (propsStatements !== 1) fail('One top-level defineProps macro statement is required');
  const ownerAst = ast(options.owner, text(read(options.owner)));
  inspectImportBoundary(ownerAst, options.owner, [options.service]);
  const piniaImports = runtimeImports(ownerAst).filter(item => item.specifier === 'pinia').flatMap(item => item.bindings.filter(binding => binding.imported === 'defineStore'));
  if (piniaImports.length !== 1 || localBindings(ownerAst).includes(piniaImports[0].local)) fail('An existing Pinia owner is required');
  let ownerDeclaration;
  for (const statement of ownerAst.statements) {
    if (!ts.isVariableStatement(statement) || !statement.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const declaration of statement.declarationList.declarations) if (name(declaration.name) === options.storeExport) {
      if (ownerDeclaration) fail('Ambiguous exported owner');
      ownerDeclaration = declaration;
    }
  }
  const ownerCall = ownerDeclaration?.initializer;
  if (!ownerCall || !ts.isCallExpression(ownerCall) || name(ownerCall.expression) !== piniaImports[0].local || ownerCall.arguments.length !== 2 || !ts.isObjectLiteralExpression(ownerCall.arguments[1])) fail('Unsupported owner declaration');
  const actionGroups = ownerCall.arguments[1].properties.filter(property => name(property.name) === 'actions');
  if (actionGroups.length !== 1) fail('Ambiguous options-store actions');
  const actionsProperty = actionGroups[0];
  if (!actionsProperty || !ts.isPropertyAssignment(actionsProperty) || !ts.isObjectLiteralExpression(actionsProperty.initializer)) fail('An existing options-store action is required');
  const actions = actionsProperty.initializer.properties.filter(property => name(property.name) === options.action);
  if (actions.length !== 1 || !ts.isMethodDeclaration(actions[0]) || actions[0].parameters.length !== 2) fail('Expected one existing two-argument action');
  const action = actions[0];
  if (name(action.parameters[0].name) !== options.trackId || action.parameters[0].type?.kind !== ts.SyntaxKind.StringKeyword || name(action.parameters[1].name) !== 'direction') fail('Unsupported action arguments');
  let directionType = action.parameters[1].type;
  if (directionType && ts.isTypeReferenceNode(directionType) && ts.isIdentifier(directionType.typeName)) directionType = ownerAst.statements.find(statement => ts.isTypeAliasDeclaration(statement) && statement.name.text === directionType.typeName.text)?.type;
  if (!directionType || !ts.isUnionTypeNode(directionType) || directionType.types.length !== 2 || !directionType.types.every(type => ts.isLiteralTypeNode(type) && ts.isStringLiteral(type.literal)) || directionType.types.map(type => type.literal.text).sort().join(',') !== 'down,up') fail('Action must accept exactly up/down direction literals');
  const serviceImports = runtimeImports(ownerAst).filter(item => {
    const packageName = item.specifier.startsWith('@') ? item.specifier.split('/').slice(0, 2).join('/') : item.specifier.split('/')[0];
    return !Object.hasOwn(manifest.dependencies || {}, packageName) && !Object.hasOwn(manifest.devDependencies || {}, packageName);
  }).map(item => ({ ...item, target: resolveImport(options.owner, item.specifier) })).filter(item => item.target === options.service);
  if (serviceImports.length !== 1 || serviceImports[0].bindings.length !== 1) fail('An existing persistence-service import is required');
  const serviceBinding = serviceImports[0].bindings[0];
  if (localBindings(ownerAst).includes(serviceBinding.local)) fail('Shadowed persistence service');
  const serviceAst = ast(options.service, text(read(options.service)));
  inspectImportBoundary(serviceAst, options.service, []);
  if (!serviceAst.statements.some(statement => ts.isFunctionDeclaration(statement) && statement.name?.text === serviceBinding.imported && statement.body && statement.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword))) fail('Missing persistence-service export');
  let serviceCalls = 0;
  walk(action, node => { if (ts.isCallExpression(node) && name(node.expression) === serviceBinding.local) serviceCalls++; });
  if (serviceCalls !== 1) fail('Ambiguous existing persistence-call boundary');

  const targets = { up: [], down: [] };
  const rawAttributes = node => {
    let cursor = node.loc.start.offset + node.tag.length + 1;
    const start = cursor;
    let quote = '';
    while (cursor < originalText.length) {
      const char = originalText[cursor];
      if (quote) { if (char === quote) quote = ''; }
      else if (char === '"' || char === "'") quote = char;
      else if (char === '>') break;
      cursor++;
    }
    return [...originalText.slice(start, cursor).matchAll(/([^\s"'<>/=]+)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/g)].map(match => match[1]);
  };
  const findTargets = (node, ancestors = []) => {
    if (node.type === 1) {
      const markers = node.props.filter(prop => prop.type === 6 && prop.name === 'data-reorder');
      if (markers.length) {
        if (markers.length !== 1 || !markers[0].value || !Object.hasOwn(targets, markers[0].value.content)) fail('Unsupported reorder marker');
        const direction = markers[0].value.content;
        if ([...ancestors, node].some(parent => rawAttributes(parent).includes('v-pre'))) fail('v-pre prevents event binding on this target');
        if (node.props.some(prop => prop.type === 6 && /^on/i.test(prop.name)) || ancestors.some(parent => parent.props.some(prop => prop.type === 6 && /^on/i.test(prop.name) || prop.type === 7 && prop.name === 'on'))) fail('Existing native or ancestor event handlers require unsupported composition');
        if (node.tag !== 'button' || node.ns !== 0 || node.props.some(prop => prop.type === 6 && prop.name === 'is') || !node.props.some(prop => prop.type === 6 && prop.name === 'type' && prop.value?.content === 'button')) fail('Reorder targets must be native HTML type=button controls');
        if ([...ancestors, node].some(parent => parent.props?.some(prop => prop.type === 7 && ['for', 'slot'].includes(prop.name)))) fail('Scoped template aliases are unsupported for this target');
        if (node.props.some(prop => prop.type === 7 && (prop.name === 'on' && (prop.arg?.type !== 4 || prop.arg.content !== 'click') || prop.name === 'bind' && (!prop.arg || !prop.arg.isStatic || !['disabled', 'title', 'aria-label'].includes(prop.arg.content))))) fail('Unsupported event or object binding on reorder control');
        const clickHandlers = node.props.filter(prop => prop.type === 7 && prop.name === 'on' && prop.arg?.content === 'click');
        const expression = `${options.storeBinding}.${options.action}(${options.trackId}, "${direction}")`;
        if (clickHandlers.length > 1 || clickHandlers.some(handler => handler.modifiers.length || handler.exp?.content !== expression)) fail(`Conflicting ${direction} click handler`);
        const insertion = node.props.length ? node.props[node.props.length - 1].loc.end.offset : node.loc.start.offset + '<button'.length;
        targets[direction].push({ insertion, expression, present: clickHandlers.length === 1 });
      }
    }
    for (const child of node.children || []) findTargets(child, node.type === 1 ? [...ancestors, node] : ancestors);
  };
  findTargets(descriptor.template.ast);
  for (const direction of ['up', 'down']) if (targets[direction].length !== 1) fail(`Expected exactly one ${direction} target, found ${targets[direction].length}`);
  const edits = ['up', 'down'].filter(direction => !targets[direction][0].present).map(direction => ({ start: targets[direction][0].insertion, end: targets[direction][0].insertion, text: ` @click='${targets[direction][0].expression}'`, direction })).sort((a, b) => a.start - b.start);
  let candidateText = originalText;
  for (const edit of [...edits].reverse()) {
    if (edit.start < descriptor.template.loc.start.offset || edit.end > descriptor.template.loc.end.offset) fail('Edit escapes the template allowed range');
    candidateText = candidateText.slice(0, edit.start) + edit.text + candidateText.slice(edit.end);
  }
  const candidate = Buffer.from(candidateText, 'utf8');
  const reparsed = parseFresh(candidateText, { filename: options.file });
  if (reparsed.errors.length) fail('Candidate fails SFC parsing');
  compileScript(reparsed.descriptor, { id: 'track-reorder-pilot' });
  const templateCheck = compileTemplate({ source: reparsed.descriptor.template.content, filename: options.file, id: 'track-reorder-pilot', compilerOptions: { expressionPlugins: ['typescript'] } });
  if (templateCheck.errors.length) fail('Candidate fails template compilation');
  return {
    version: '0.1', operation: 'bind-track-reorder-buttons', options,
    target: options.file, expectedSha256: sha256(original), candidateSha256: sha256(candidate),
    before: original.toString('base64'), after: candidate.toString('base64'),
    sourceDigests: Object.fromEntries([...sources].map(([relative, bytes]) => [relative, sha256(bytes)])),
    allowedRange: { start: descriptor.template.loc.start.offset, end: descriptor.template.loc.end.offset, coordinates: 'UTF-16 code units in original SFC' },
    edits, status: edits.length ? 'proposed' : 'no-op',
    parserVersions: { vue: vueVersion, typescript: ts.version },
    verification: { sfcParse: 'passed', scriptCompile: 'passed', templateCompile: 'passed', typeCheck: 'not-run', browserBehavior: 'not-run' },
  };
}

export function proposeReorder(rootInput, options) {
  return buildPlan(fs.realpathSync(rootInput), options);
}

function verifiedPlan(root, plan) {
  if (!plan || plan.version !== '0.1' || plan.operation !== 'bind-track-reorder-buttons') fail('Unsupported patch plan');
  const before = Buffer.from(plan.before || '', 'base64');
  if (before.length > MAX_BYTES || sha256(before) !== plan.expectedSha256) fail('Invalid original bytes in plan');
  const rebuilt = buildPlan(root, plan.options, before);
  for (const key of ['target', 'expectedSha256', 'candidateSha256', 'before', 'after', 'sourceDigests', 'edits', 'allowedRange', 'status', 'parserVersions']) if (JSON.stringify(rebuilt[key]) !== JSON.stringify(plan[key])) fail(`Patch plan differs from verified operation: ${key}`);
  return rebuilt;
}

function exchange(rootInput, plan, rollback, host) {
  if (host?.exclusiveWorkspace !== true) fail('Applying or rolling back requires an explicitly isolated, exclusive workspace');
  const root = fs.realpathSync(rootInput);
  const verified = verifiedPlan(root, plan);
  if (!rollback) typeCheckReorder(root, verified);
  const expected = rollback ? verified.candidateSha256 : verified.expectedSha256;
  const replacement = Buffer.from(rollback ? verified.before : verified.after, 'base64');
  const target = safeFile(root, verified.target);
  const check = () => {
    if (sha256(fs.readFileSync(safeFile(root, verified.target))) !== expected) fail(rollback ? 'Rollback conflict: target changed' : 'Concurrent edit: target changed');
    for (const [relative, digest] of Object.entries(verified.sourceDigests)) if (relative !== verified.target && sha256(fs.readFileSync(safeFile(root, relative))) !== digest) fail(`Concurrent context edit: ${relative}`);
  };
  check();
  if (verified.status === 'no-op') return { status: 'no-op', sha256: expected };
  const lock = target + '.reorder-patch.lock';
  const temporary = target + `.reorder-patch-${crypto.randomUUID()}.tmp`;
  let lockFd;
  let tempFd;
  try {
    lockFd = fs.openSync(lock, 'wx', 0o600);
    check();
    const mode = fs.statSync(target).mode;
    tempFd = fs.openSync(temporary, 'wx', mode);
    fs.fchmodSync(tempFd, mode & 0o777);
    fs.writeFileSync(tempFd, replacement);
    fs.fsyncSync(tempFd);
    fs.closeSync(tempFd); tempFd = undefined;
    check();
    fs.renameSync(temporary, target);
    return { status: rollback ? 'rolled-back' : 'applied', sha256: sha256(replacement) };
  } finally {
    if (tempFd !== undefined) fs.closeSync(tempFd);
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    if (lockFd !== undefined) { fs.closeSync(lockFd); fs.unlinkSync(lock); }
  }
}

export const applyReorder = (root, plan, host) => exchange(root, plan, false, host);
export const rollbackReorder = (root, plan, host) => exchange(root, plan, true, host);

export function typeCheckReorder(rootInput, plan) {
  const root = fs.realpathSync(rootInput);
  const verified = verifiedPlan(root, plan);
  const descriptor = parseFresh(text(Buffer.from(verified.after, 'base64')), { filename: verified.target }).descriptor;
  const compiled = compileScript(descriptor, { id: 'track-reorder-pilot', inlineTemplate: true });
  const virtualPath = path.join(root, verified.target + '.ts');
  const rootConfig = ts.parseConfigFileTextToJson('tsconfig.json', fs.readFileSync(safeFile(root, 'tsconfig.json'), 'utf8')).config.compilerOptions;
  const options = { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, strict: true, skipLibCheck: true, noEmit: true, baseUrl: path.resolve(root, rootConfig.baseUrl || '.'), paths: rootConfig.paths || {} };
  const host = ts.createCompilerHost(options);
  const toolModules = fs.realpathSync(path.join(HERE, 'node_modules'));
  const allowed = file => {
    try {
      const absolute = path.resolve(file);
      const actual = fs.realpathSync(absolute);
      if (absolute.startsWith(root + path.sep)) return actual === absolute;
      return actual === toolModules || actual.startsWith(toolModules + path.sep);
    } catch { return false; }
  };
  host.readFile = file => {
    if (file === virtualPath) return compiled.content;
    if (!allowed(file) || !fs.statSync(file).isFile()) return undefined;
    return fs.readFileSync(file, 'utf8');
  };
  host.fileExists = file => file === virtualPath || allowed(file) && fs.statSync(file).isFile();
  host.directoryExists = directory => allowed(directory) && fs.statSync(directory).isDirectory();
  host.getDirectories = directory => host.directoryExists(directory) ? fs.readdirSync(directory, { withFileTypes: true }).filter(entry => entry.isDirectory() && allowed(path.join(directory, entry.name))).map(entry => path.join(directory, entry.name)) : [];
  host.getSourceFile = (file, languageVersion, onError) => {
    const source = host.readFile(file);
    if (source === undefined) { onError?.('Source is outside the project or trusted tooling boundary'); return undefined; }
    return ts.createSourceFile(file, source, languageVersion, true);
  };
  host.resolveModuleNames = (names, containingFile) => names.map(moduleName => ts.resolveModuleName(moduleName, containingFile, options, host).resolvedModule || (!moduleName.startsWith('.') && !moduleName.startsWith('@/') ? ts.resolveModuleName(moduleName, path.join(HERE, 'package.json'), options, host).resolvedModule : undefined));
  const program = ts.createProgram([virtualPath, path.join(root, verified.options.owner), path.join(root, verified.options.service)], options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) fail('Type check failed: ' + ts.flattenDiagnosticMessageText(diagnostics[0].messageText, '\n'));
  return { status: 'passed', typescript: ts.version };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [command, root, argument, authorization] = process.argv.slice(2);
    if (!root || !argument || !['propose', 'apply', 'rollback', 'typecheck'].includes(command)) fail('Usage: patch.mjs propose ROOT EXPECTED_SHA | apply/rollback/typecheck ROOT PLAN_JSON');
    if (authorization && authorization !== '--exclusive-workspace') fail('Unsupported CLI argument');
    const result = command === 'propose' ? proposeReorder(root, { expectedSha256: argument }) : ({ apply: applyReorder, rollback: rollbackReorder, typecheck: typeCheckReorder }[command])(root, JSON.parse(fs.readFileSync(argument, 'utf8')), { exclusiveWorkspace: authorization === '--exclusive-workspace' });
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } catch (error) { process.stderr.write(`Patch refused: ${error.message}\n`); process.exitCode = 2; }
}
