// Facts about the SOURCE TypeScript, read straight from its AST. These are the expectations the
// tests hold the generated dist to, so they are derived here independently of build/build.mjs
// (which is deliberately not imported - it would run the generator) and never hardcoded.
import { loadTypeScript, readSource, readClient } from './paths.mjs';

const ts = loadTypeScript();

export function parse(text, fileName = 'source.ts') {
  return ts.createSourceFile(fileName, text, ts.ScriptTarget.ES2020, true, ts.ScriptKind.TS);
}

export function sourceFile() {
  return parse(readSource(), 'FunticoPhaserSDK.ts');
}

export function clientFile() {
  return parse(readClient(), 'FunticoClient.ts');
}

function modifierKinds(node) {
  return ts.canHaveModifiers(node) ? (ts.getModifiers(node) ?? []).map(m => m.kind) : [];
}

function has(node, kind) {
  return modifierKinds(node).includes(kind);
}

/**
 * Names of the exported RUNTIME declarations (classes, enums, functions, variables). Type-only
 * exports (interfaces, type aliases, `declare`, `const enum`) have no runtime value and are skipped.
 */
export function runtimeExports(sf) {
  const names = [];
  for (const st of sf.statements) {
    if (!has(st, ts.SyntaxKind.ExportKeyword) || has(st, ts.SyntaxKind.DeclareKeyword)) continue;
    if (ts.isClassDeclaration(st)) names.push(st.name.text);
    else if (ts.isFunctionDeclaration(st) && st.body) names.push(st.name.text);
    else if (ts.isEnumDeclaration(st) && !has(st, ts.SyntaxKind.ConstKeyword)) names.push(st.name.text);
    else if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        if (ts.isIdentifier(d.name)) names.push(d.name.text);
        else throw new Error('destructured export in source - extend test/helpers/source-ast.mjs');
      }
    }
  }
  return names;
}

/** Top-level non-exported runtime declarations (must stay private inside the UMD closure). */
export function privateRuntimeDeclarations(sf) {
  return sf.statements
    .filter(st => (ts.isClassDeclaration(st) || ts.isEnumDeclaration(st) || ts.isFunctionDeclaration(st)) &&
      st.name && !has(st, ts.SyntaxKind.ExportKeyword) && !has(st, ts.SyntaxKind.DeclareKeyword) &&
      !has(st, ts.SyntaxKind.ConstKeyword))
    .map(st => st.name.text);
}

function findClass(sf, name) {
  const cls = sf.statements.find(st => ts.isClassDeclaration(st) && st.name?.text === name);
  if (!cls) throw new Error(`class ${name} not found in the source`);
  return cls;
}

/**
 * Every non-private method/accessor of a class, statics included (constructor and fields excluded).
 * @returns {{ name: string, isStatic: boolean, kind: string }[]}
 */
export function publicMembers(sf, className) {
  const cls = findClass(sf, className);
  const out = [];
  for (const m of cls.members) {
    const isCallable = ts.isMethodDeclaration(m) || ts.isGetAccessorDeclaration(m) || ts.isSetAccessorDeclaration(m);
    if (!isCallable || !m.name || ts.isPrivateIdentifier(m.name)) continue;
    if (has(m, ts.SyntaxKind.PrivateKeyword) || has(m, ts.SyntaxKind.ProtectedKeyword)) continue;
    if (ts.isMethodDeclaration(m) && !m.body) continue; // overload signature
    const name = m.name.getText(sf);
    if (!out.some(x => x.name === name)) {
      out.push({ name, isStatic: has(m, ts.SyntaxKind.StaticKeyword), kind: ts.SyntaxKind[m.kind] });
    }
  }
  return out;
}

/** The exported classes that carry callable public members (e.g. FunticoSDK, PrizeUtils, CryptoHelper). */
export function exportedClassesWithMembers(sf, exclude = []) {
  return sf.statements
    .filter(st => ts.isClassDeclaration(st) && st.name && has(st, ts.SyntaxKind.ExportKeyword) &&
      !exclude.includes(st.name.text))
    .map(st => st.name.text)
    .filter(name => publicMembers(sf, name).length > 0);
}

/** `static readonly EVENTS = { KEY: 'value', ... }` of a class, as a plain object. */
export function staticEvents(sf, className) {
  const cls = findClass(sf, className);
  const prop = cls.members.find(m => ts.isPropertyDeclaration(m) && m.name.getText(sf) === 'EVENTS' &&
    has(m, ts.SyntaxKind.StaticKeyword));
  if (!prop || !prop.initializer || !ts.isObjectLiteralExpression(prop.initializer)) {
    throw new Error(`${className}.EVENTS is not a static object literal`);
  }
  const events = {};
  for (const p of prop.initializer.properties) {
    if (!ts.isPropertyAssignment(p) || !ts.isStringLiteralLike(p.initializer)) {
      throw new Error(`${className}.EVENTS has a non-literal member`);
    }
    events[p.name.getText(sf)] = p.initializer.text;
  }
  return events;
}

/** Public methods of a class with their parameter names (used to relate FunticoClient to the plugin). */
export function methodNames(sf, className) {
  return publicMembers(sf, className).filter(m => m.kind === 'MethodDeclaration').map(m => m.name);
}

export { ts };
