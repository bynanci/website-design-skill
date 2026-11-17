#!/usr/bin/env node
/** Bounded, read-only source inspection. Target configuration is never executed. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { parse as parseVue } from '@vue/compiler-sfc';
import ts from 'typescript';
import scss from 'postcss-scss';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MAX_FILES = 200;
const MAX_BYTES = 1_000_000;
const extensions = ['', '.ts', '.js', '.vue', '.css', '.scss', '/index.ts', '/index.js'];
const colorGrammarKeywords = new Set('none initial inherit unset revert revert-layer transparent currentcolor solid dotted dashed double groove ridge inset outset hidden auto center left top bottom right repeat no-repeat repeat-x repeat-y cover contain scroll fixed local border-box padding-box content-box space round'.split(' '));
const unique = values => [...new Set(values)].sort();
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const walk = (node, callback) => { callback(node); ts.forEachChild(node, child => walk(child, callback)); };
const nameOf = node => node && (ts.isIdentifier(node) || ts.isStringLiteral(node)) ? node.text : null;
const runtimeBindings = source => {
  const names = [];
  const add = node => {
    if (ts.isIdentifier(node)) names.push(node.text);
    else if (ts.isObjectBindingPattern(node) || ts.isArrayBindingPattern(node)) {
      for (const element of node.elements) if (ts.isBindingElement(element)) add(element.name);
    }
  };
  walk(source, node => {
    if ((ts.isVariableDeclaration(node) || ts.isParameter(node) || ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) && node.name) add(node.name);
  });
  return names;
};

export function inspect(rootInput, { entry = 'src/main.ts', contract: contractPath = 'profile-contract.json' } = {}) {
  const root = fs.realpathSync(rootInput);
  const evidence = { imports: [], roles: [], componentApis: [], stateOwners: [], drift: [], findings: [], unsupported: [] };
  const texts = new Map();
  const digests = new Map();
  const modules = new Map();
  const declarations = [];
  const styleUses = new Map();
  const finding = (code, source, detail) => evidence.findings.push({ code, path: source, detail });
  const safePath = relative => {
    if (typeof relative !== 'string' || path.isAbsolute(relative)) throw new Error('Expected a project-relative path');
    const absolute = path.resolve(root, relative);
    if (!absolute.startsWith(root + path.sep)) throw new Error('Path escapes the project root');
    const real = fs.realpathSync(absolute);
    if (real !== absolute || !real.startsWith(root + path.sep)) throw new Error('Symlinks are unsupported');
    const stat = fs.statSync(real);
    if (!stat.isFile()) throw new Error('Only regular source files are supported');
    if (stat.size > MAX_BYTES) throw new Error('Source exceeds the read limit');
    return real;
  };
  const read = relative => {
    if (!texts.has(relative)) {
      if (texts.size >= MAX_FILES) throw new Error('Source count exceeds the read limit');
      const bytes = fs.readFileSync(safePath(relative));
      texts.set(relative, new TextDecoder('utf-8', { fatal: true }).decode(bytes));
      digests.set(relative, hash(bytes));
    }
    return texts.get(relative);
  };
  const contract = JSON.parse(read(contractPath));
  if (contract.version !== '0.1') throw new Error('Unsupported contract version');
  for (const field of ['themes', 'roles', 'components', 'stateOwners', 'allowedLiterals']) {
    if (!Array.isArray(contract[field])) throw new Error(`Contract ${field} must be an array`);
  }
  for (const theme of contract.themes) {
    if (typeof theme.name !== 'string' || typeof theme.selector !== 'string') throw new Error('Invalid theme contract');
  }
  for (const role of contract.roles) {
    if (typeof role.role !== 'string' || !/^--[\w-]+$/.test(role.reference) || typeof role.consumer !== 'string') throw new Error('Invalid role contract');
  }
  if (!contract.allowedLiterals.every(item => item && typeof item.path === 'string' && typeof item.property === 'string' && typeof item.value === 'string' && typeof item.reason === 'string' && item.reason.trim())) throw new Error('Literal exceptions require path, property, value and a reason');
  const parsedConfig = ts.parseConfigFileTextToJson('tsconfig.json', read('tsconfig.json'));
  if (parsedConfig.error || !parsedConfig.config || typeof parsedConfig.config !== 'object' || Array.isArray(parsedConfig.config)) throw new Error('Invalid root tsconfig');
  if (parsedConfig.config.extends) throw new Error('Inherited aliases are unsupported by this bounded adapter');
  const options = parsedConfig.config.compilerOptions || {};
  const aliases = options.paths || {};
  const baseUrl = options.baseUrl || '.';
  if (typeof baseUrl !== 'string' || typeof aliases !== 'object' || Array.isArray(aliases)) throw new Error('Invalid compiler aliases');
  const resolveImport = (from, specifier) => {
    let candidate;
    if (specifier.startsWith('.')) candidate = path.posix.join(path.posix.dirname(from), specifier);
    else {
      const matches = Object.entries(aliases).filter(([alias]) => alias === specifier || (alias.endsWith('/*') && specifier.startsWith(alias.slice(0, -1))));
      if (matches.length !== 1) return null;
      const [alias, targets] = matches[0];
      if (!Array.isArray(targets) || targets.length !== 1 || typeof targets[0] !== 'string') throw new Error('Ambiguous alias targets are unsupported');
      candidate = path.posix.join(baseUrl, targets[0].replace('*', alias.endsWith('/*') ? specifier.slice(alias.length - 1) : ''));
    }
    for (const extension of extensions) {
      const relative = path.posix.normalize(candidate + extension);
      try { if (fs.statSync(path.resolve(root, relative)).isFile()) { safePath(relative); return relative; } }
      catch (error) { if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') throw error; }
    }
    throw new Error(`Missing local import ${specifier} from ${from}`);
  };
  const parseScript = (relative, text) => {
    const source = ts.createSourceFile(relative, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    if (source.parseDiagnostics.length) throw new Error(`Unsupported or malformed TypeScript: ${relative}`);
    return source;
  };
  const importRecords = (relative, source) => {
    const records = [];
    for (const node of source.statements) {
      if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) continue;
      const specifier = node.moduleSpecifier.text;
      const target = resolveImport(relative, specifier);
      const bindings = [];
      const clause = node.importClause;
      const typeOnly = !!clause?.isTypeOnly || !!(
        clause && !clause.name && clause.namedBindings && ts.isNamedImports(clause.namedBindings)
        && clause.namedBindings.elements.length && clause.namedBindings.elements.every(item => item.isTypeOnly)
      );
      if (clause?.name && !typeOnly) bindings.push({ imported: 'default', local: clause.name.text });
      if (!typeOnly && clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        for (const item of clause.namedBindings.elements) if (!item.isTypeOnly) bindings.push({ imported: item.propertyName?.text || item.name.text, local: item.name.text });
      }
      records.push({ specifier, target, bindings, typeOnly });
      evidence.imports.push({ from: relative, specifier, target, status: typeOnly ? 'type-only-source' : target ? 'local-source' : 'external-uninspected' });
    }
    return records;
  };
  const parseStyle = (relative, text, scoped = false, lineOffset = 0) => {
    const sheet = scss.parse(text, { from: relative });
    const uses = styleUses.get(relative) || [];
    styleUses.set(relative, uses);
    sheet.walkDecls(declaration => {
      const selector = declaration.parent?.type === 'rule' ? declaration.parent.selector : null;
      const line = declaration.source?.start?.line ? declaration.source.start.line + lineOffset : null;
      let ancestor = declaration.parent;
      let conditional = false;
      while (ancestor) { if (ancestor.type === 'atrule') conditional = true; ancestor = ancestor.parent; }
      if (declaration.prop.startsWith('--')) declarations.push({ reference: declaration.prop, value: declaration.value, selector, path: relative, line, scoped, conditional });
      else if (!declaration.prop.startsWith('$')) {
        for (const match of declaration.value.matchAll(/var\(\s*(--[\w-]+)(\s*,)?/g)) {
          const fallback = !!match[2];
          uses.push({ reference: match[1], property: declaration.prop, selector, line, fallback });
          if (fallback) evidence.unsupported.push({ path: relative, detail: `CSS variable fallback requires computed verification: ${declaration.value}` });
        }
        const literals = declaration.value.match(/#[a-fA-F0-9]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|(?<![\w-])\d*\.?\d+(?:px|rem|em|vh|vw)\b/g) || [];
        if (/^(?:color|background(?:-.+)?|border(?:-.+)?|outline(?:-.+)?|fill|stroke|text-shadow|box-shadow)$/.test(declaration.prop)) {
          // A bounded conservative rule: unknown identifiers in color-bearing
          // declarations require review, including all CSS named/system colors.
          const plain = declaration.value.replace(/var\([^)]*\)|#[a-fA-F0-9]{3,8}\b|(?:rgba?|hsla?)\([^)]*\)|\d*\.?\d+(?:[a-zA-Z%]+)?/g, ' ');
          for (const match of plain.matchAll(/\b[a-zA-Z][\w-]*\b/g)) {
            if (!colorGrammarKeywords.has(match[0].toLowerCase())) literals.push(match[0]);
          }
        }
        for (const value of literals) if (!contract.allowedLiterals.some(exception => exception.path === relative && exception.property === declaration.prop && exception.value === value)) evidence.drift.push({ path: relative, line, property: declaration.prop, value, status: 'unapproved-literal' });
      }
    });
    const imports = [];
    sheet.walkAtRules(/^(import|use|forward)$/, rule => {
      const match = rule.params.match(/^["']([^"']+)["'](?:\s.*)?$/);
      if (!match || match[1].startsWith('sass:') || /^(https?:|url\()/i.test(rule.params)) {
        evidence.unsupported.push({ path: relative, detail: `Unsupported style import: ${rule.toString()}` });
        return;
      }
      let specifier = match[1];
      if (!specifier.startsWith('.') && !specifier.startsWith('@/')) specifier = './' + specifier;
      let target;
      try { target = resolveImport(relative, specifier); }
      catch (error) {
        // Sass partials are an explicit bounded extension to local resolution.
        const partial = path.posix.join(path.posix.dirname(specifier), '_' + path.posix.basename(specifier));
        try { target = resolveImport(relative, partial.startsWith('.') || partial.startsWith('@/') ? partial : './' + partial); }
        catch { finding('missing-import', relative, error.message); return; }
      }
      if (target) { evidence.imports.push({ from: relative, specifier: match[1], target, status: 'local-source' }); imports.push(target); }
    });
    return imports;
  };
  const reachable = new Set();
  const visit = relative => {
    if (reachable.has(relative)) return;
    reachable.add(relative);
    const text = read(relative);
    const extension = path.extname(relative);
    if (['.css', '.scss'].includes(extension)) { for (const target of parseStyle(relative, text)) visit(target); return; }
    let scriptText = text;
    let descriptor;
    if (extension === '.vue') {
      const parsed = parseVue(text, { filename: relative });
      if (parsed.errors.length) throw new Error(`Malformed Vue source: ${relative}`);
      descriptor = parsed.descriptor;
      if (descriptor.script && descriptor.scriptSetup) throw new Error('Combined script and script setup are unsupported');
      if (descriptor.script?.src || descriptor.scriptSetup?.src) throw new Error('External Vue scripts are unsupported');
      scriptText = descriptor.scriptSetup?.content || descriptor.script?.content || '';
      for (const style of descriptor.styles) {
        if (style.src && style.scoped) {
          evidence.unsupported.push({ path: relative, detail: 'Scoped external styles require scope-aware module analysis and are not accepted as global theme declarations.' });
        } else if (style.src) { const target = resolveImport(relative, style.src); if (target) visit(target); }
        else for (const target of parseStyle(relative, style.content, !!style.scoped, style.loc.start.line - 1)) visit(target);
      }
    }
    const source = parseScript(relative, scriptText);
    const imports = importRecords(relative, source);
    modules.set(relative, { source, imports, descriptor });
    for (const record of imports) if (record.target && !record.typeOnly) visit(record.target);
  };
  visit(entry);
  const profiles = JSON.parse(execFileSync('python3', [path.resolve(HERE, '../../scripts/inspect_project_profile.py'), root, '--affected-path', entry], { encoding: 'utf8', maxBuffer: 5_000_000 }));
  const existingSources = new Map(profiles.sources.map(source => [source.path, source]));
  for (const relative of texts.keys()) existingSources.set(relative, { path: relative, kind: relative === contractPath ? 'inspection-contract' : 'parsed-source', status: 'observed', sha256: digests.get(relative) });
  profiles.sources = [...existingSources.values()].sort((a, b) => a.path.localeCompare(b.path));
  profiles.task.request = 'Inspect declared Vue roles, public APIs and state ownership';
  profiles.capabilities.parse = 'available';
  profiles.unknowns.push('This bounded adapter verifies source declarations and import reachability only. Computed theme values, accessibility, contrast and runtime behavior require separate build/render evidence.');

  const roleNames = new Map();
  const roleReferences = new Map();
  for (const role of contract.roles) {
    const roles = roleNames.get(role.role) || new Set(); roles.add(role.reference); roleNames.set(role.role, roles);
    const references = roleReferences.get(role.reference) || new Set(); references.add(role.role); roleReferences.set(role.reference, references);
  }
  for (const role of contract.roles) {
    const allDefinitions = declarations.filter(item => item.reference === role.reference && !item.scoped);
    const themes = contract.themes.map(theme => ({ name: theme.name, selector: theme.selector, declarations: allDefinitions.filter(item => item.selector?.split(',').map(s => s.trim()).includes(theme.selector)) }));
    const consumers = (styleUses.get(role.consumer) || []).filter(item => item.reference === role.reference);
    const unimportedPaths = profiles.tokens.filter(token => token.reference === role.reference).flatMap(token => token.evidencePaths).filter(source => !reachable.has(source));
    if (unimportedPaths.length) finding('missing-import', role.consumer, `Token declaration sources are outside the entry import graph: ${unique(unimportedPaths).join(', ')}`);
    let status = 'theme-dependent';
    if (roleNames.get(role.role).size > 1 || roleReferences.get(role.reference).size > 1 || themes.some(theme => theme.declarations.length > 1)) {
      status = 'conflicting'; finding('conflicting-role', role.consumer, `Conflicting declaration or role mapping for ${role.role}`);
    } else if (allDefinitions.some(definition => definition.conditional) || consumers.some(consumer => consumer.fallback)) {
      status = 'unknown'; finding('unresolved-token-condition', role.consumer, `Conditional declarations or fallbacks require computed verification for ${role.reference}`);
    } else if (!reachable.has(role.consumer) || !consumers.length) {
      status = 'missing'; finding('missing-consumer', role.consumer, `No reachable consumer for ${role.reference}`);
    } else if (themes.some(theme => theme.declarations.length === 0)) {
      status = 'missing'; finding('missing-theme', role.consumer, `Missing imported declaration for ${role.reference} in ${themes.filter(theme => !theme.declarations.length).map(theme => theme.name).join(', ')}`);
    }
    const paths = unique([contractPath, role.consumer, ...allDefinitions.map(item => item.path)]);
    evidence.roles.push({ ...role, status, consumers, themes, verification: 'source-declarations-only' });
    profiles.tokens.push({ role: role.role, reference: role.reference, syntax: 'CSS custom property', status, themes: themes.filter(theme => theme.declarations.length).map(theme => theme.name), evidencePaths: paths });
  }

  for (const component of contract.components) {
    const module = modules.get(component.path);
    const api = [];
    let supported = !!module?.descriptor?.scriptSetup && !runtimeBindings(module.source).includes('defineProps') && !module.imports.some(item => item.bindings.some(binding => binding.local === 'defineProps'));
    if (module) {
      const aliases = new Map(module.source.statements.filter(ts.isTypeAliasDeclaration).map(node => [node.name.text, node.type]));
      const describe = (type, seen = new Set()) => {
        if (!type) return null;
        if (ts.isTypeReferenceNode(type) && ts.isIdentifier(type.typeName)) {
          if (seen.has(type.typeName.text)) return null;
          return describe(aliases.get(type.typeName.text), new Set([...seen, type.typeName.text]));
        }
        if (ts.isUnionTypeNode(type)) { const types = type.types.map(item => describe(item, seen)); return types.every(Boolean) ? types.join(' | ') : null; }
        if (ts.isLiteralTypeNode(type) && ts.isStringLiteral(type.literal)) return JSON.stringify(type.literal.text);
        if ([ts.SyntaxKind.StringKeyword, ts.SyntaxKind.NumberKeyword, ts.SyntaxKind.BooleanKeyword].includes(type.kind)) return ts.tokenToString(type.kind);
        return null;
      };
      const calls = [];
      walk(module.source, node => { if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'defineProps') calls.push(node); });
      const call = calls.length === 1 ? calls[0] : null;
      const topLevel = call && (ts.isExpressionStatement(call.parent) && call.parent.parent === module.source || ts.isVariableDeclaration(call.parent) && call.parent.initializer === call && ts.isVariableDeclarationList(call.parent.parent) && ts.isVariableStatement(call.parent.parent.parent) && call.parent.parent.parent.parent === module.source);
      const props = topLevel && call.typeArguments?.length === 1 ? call.typeArguments[0] : null;
      // Extra compiler macros can add events, models or exposed APIs. Their
      // presence makes this props-only adapter incomplete, even with TS generics.
      let extraPublicApi = false;
      walk(module.source, node => {
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)
          && ['defineEmits', 'defineSlots', 'defineExpose', 'defineModel', 'defineOptions'].includes(node.expression.text)) extraPublicApi = true;
      });
      if (module.descriptor?.template?.content.includes('<slot') || extraPublicApi) supported = false;
      if (!props || !ts.isTypeLiteralNode(props)) supported = false;
      else for (const prop of props.members) {
        const type = ts.isPropertySignature(prop) && describe(prop.type);
        const name = nameOf(prop.name);
        if (!type || !name) { supported = false; continue; }
        api.push({ name, type, required: !prop.questionToken });
      }
    }
    evidence.componentApis.push({ path: component.path, status: supported ? 'source-confirmed' : 'unknown', props: api });
    const existing = profiles.components.find(item => item.path === component.path);
    if (existing && supported) { existing.responsibility = component.responsibility; existing.publicApi = api.map(prop => `${prop.name}${prop.required ? '' : '?'}: ${prop.type}`); existing.evidencePaths = [component.path, contractPath]; }
    if (!supported) evidence.unsupported.push({ path: component.path, detail: 'Component props require one local defineProps type literal with supported primitive or local union types.' });
  }

  for (const owner of contract.stateOwners) {
    const module = modules.get(owner.path);
    const consumer = modules.get(owner.consumer);
    const service = modules.get(owner.service);
    const serviceExports = new Set();
    for (const statement of service?.source.statements || []) {
      if (!statement.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
      if (ts.isFunctionDeclaration(statement) && statement.name && statement.body) serviceExports.add(statement.name.text);
      if (ts.isVariableStatement(statement)) for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.initializer && (ts.isArrowFunction(declaration.initializer) || ts.isFunctionExpression(declaration.initializer))) serviceExports.add(declaration.name.text);
      }
    }
    const defineStoreNames = module?.imports.filter(item => item.specifier === 'pinia').flatMap(item => item.bindings.filter(binding => binding.imported === 'defineStore').map(binding => binding.local)) || [];
    const serviceNames = module?.imports.filter(item => item.target === owner.service).flatMap(item => item.bindings.filter(binding => serviceExports.has(binding.imported)).map(binding => binding.local)) || [];
    const bindings = consumer?.imports.filter(item => item.target === owner.path).flatMap(item => item.bindings.filter(binding => binding.imported === owner.export).map(binding => binding.local)) || [];
    const shadowed = module && runtimeBindings(module.source).some(name => [...defineStoreNames, ...serviceNames].includes(name)) || consumer && runtimeBindings(consumer.source).some(name => bindings.includes(name));
    let declaration;
    for (const statement of module?.source.statements || []) {
      if (!ts.isVariableStatement(statement) || !statement.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
      declaration = statement.declarationList.declarations.find(item => nameOf(item.name) === owner.export && item.initializer && ts.isCallExpression(item.initializer) && ts.isIdentifier(item.initializer.expression) && defineStoreNames.includes(item.initializer.expression.text)) || declaration;
    }
    const call = declaration?.initializer;
    const optionsNode = call?.arguments[1];
    const actions = optionsNode && ts.isObjectLiteralExpression(optionsNode) ? optionsNode.properties.find(prop => nameOf(prop.name) === 'actions') : null;
    const action = actions && ts.isPropertyAssignment(actions) && ts.isObjectLiteralExpression(actions.initializer) ? actions.initializer.properties.find(prop => nameOf(prop.name) === owner.action) : null;
    let serviceCalls = 0;
    let consumerCalls = 0;
    if (action && ts.isMethodDeclaration(action)) walk(action, node => { if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && serviceNames.includes(node.expression.text)) serviceCalls++; });
    if (consumer) walk(consumer.source, node => { if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && bindings.includes(node.expression.text)) consumerCalls++; });
    const confirmed = !shadowed && !!declaration && !!action && serviceCalls === 1 && consumerCalls === 1;
    evidence.stateOwners.push({ ...owner, status: confirmed ? 'source-confirmed' : 'unknown', serviceCallsInAction: serviceCalls, ownerCallsInConsumer: consumerCalls, verification: 'import-and-call-AST; runtime-not-executed' });
    if (confirmed) {
      const existing = profiles.stateOwners.find(item => item.path === owner.path);
      if (existing) { existing.name = owner.export; existing.kind = `Pinia source owner; action ${owner.action}`; existing.evidencePaths = unique([owner.path, owner.consumer, owner.service, contractPath]); }
    } else evidence.unsupported.push({ path: owner.path, detail: 'Owner requires one exported Pinia options store, one imported service call in a method, and one consumer store call.' });
  }
  for (const imported of evidence.imports) if (!imported.target && (imported.specifier.startsWith('.') || imported.specifier.startsWith('@/'))) finding('missing-import', imported.from, imported.specifier);
  evidence.reachablePaths = [...reachable].sort();
  evidence.unrun = ['target configuration execution', 'computed theme resolution', 'browser rendering', 'contrast and accessibility measurements', 'state transition execution'];
  return { profile: profiles, evidence };
}

export const inspectProject = inspect;

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const root = args.shift();
    if (!root) throw new Error('Usage: node inspect.mjs ROOT [--entry PATH] [--contract PATH]');
    const options = {};
    while (args.length) {
      const key = args.shift(); const value = args.shift();
      if (!['--entry', '--contract'].includes(key) || !value) throw new Error('Unsupported arguments');
      options[key.slice(2)] = value;
    }
    process.stdout.write(JSON.stringify(inspect(root, options), null, 2) + '\n');
  } catch (error) { process.stderr.write(`Inspection refused: ${error.message}\n`); process.exitCode = 2; }
}
