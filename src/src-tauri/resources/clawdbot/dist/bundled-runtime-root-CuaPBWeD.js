import { a as resolveBundledRuntimeDependencyInstallRoot, r as registerBundledRuntimeDependencyNodePath, s as resolveBundledRuntimeDependencyPackageRoot, t as ensureBundledPluginRuntimeDeps } from "./bundled-runtime-deps-BdEAdjwi.js";
import fs from "node:fs";
import path from "node:path";
//#region src/plugins/bundled-runtime-root.ts
const bundledRuntimeDepsRetainSpecsByInstallRoot = /* @__PURE__ */ new Map();
function isBuiltBundledPluginRuntimeRoot(pluginRoot) {
	const extensionsDir = path.dirname(pluginRoot);
	const buildDir = path.dirname(extensionsDir);
	return path.basename(extensionsDir) === "extensions" && (path.basename(buildDir) === "dist" || path.basename(buildDir) === "dist-runtime");
}
function prepareBundledPluginRuntimeRoot(params) {
	const env = params.env ?? process.env;
	const installRoot = resolveBundledRuntimeDependencyInstallRoot(params.pluginRoot, { env });
	const retainSpecs = bundledRuntimeDepsRetainSpecsByInstallRoot.get(installRoot) ?? [];
	const depsInstallResult = ensureBundledPluginRuntimeDeps({
		pluginId: params.pluginId,
		pluginRoot: params.pluginRoot,
		env,
		retainSpecs
	});
	if (depsInstallResult.installedSpecs.length > 0) {
		bundledRuntimeDepsRetainSpecsByInstallRoot.set(installRoot, [...new Set([...retainSpecs, ...depsInstallResult.retainSpecs])].toSorted((left, right) => left.localeCompare(right)));
		params.logInstalled?.(depsInstallResult.installedSpecs);
	}
	if (path.resolve(installRoot) === path.resolve(params.pluginRoot)) return {
		pluginRoot: params.pluginRoot,
		modulePath: params.modulePath
	};
	const packageRoot = resolveBundledRuntimeDependencyPackageRoot(params.pluginRoot);
	if (packageRoot) registerBundledRuntimeDependencyNodePath(packageRoot);
	registerBundledRuntimeDependencyNodePath(installRoot);
	const mirrorRoot = mirrorBundledPluginRuntimeRoot({
		pluginId: params.pluginId,
		pluginRoot: params.pluginRoot,
		installRoot
	});
	return {
		pluginRoot: mirrorRoot,
		modulePath: remapBundledPluginRuntimePath({
			source: params.modulePath,
			pluginRoot: params.pluginRoot,
			mirroredRoot: mirrorRoot
		})
	};
}
function remapBundledPluginRuntimePath(params) {
	const relativePath = path.relative(params.pluginRoot, params.source);
	if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) return params.source;
	return path.join(params.mirroredRoot, relativePath);
}
function mirrorBundledPluginRuntimeRoot(params) {
	const mirrorParent = prepareBundledPluginRuntimeDistMirror({
		installRoot: params.installRoot,
		pluginRoot: params.pluginRoot
	});
	const mirrorRoot = path.join(mirrorParent, params.pluginId);
	fs.mkdirSync(params.installRoot, { recursive: true });
	try {
		fs.chmodSync(params.installRoot, 493);
	} catch {}
	fs.mkdirSync(mirrorParent, { recursive: true });
	try {
		fs.chmodSync(mirrorParent, 493);
	} catch {}
	fs.accessSync(mirrorParent, fs.constants.W_OK);
	const tempDir = fs.mkdtempSync(path.join(mirrorParent, `.plugin-${params.pluginId}-`));
	const stagedRoot = path.join(tempDir, "plugin");
	try {
		copyBundledPluginRuntimeRoot(params.pluginRoot, stagedRoot);
		fs.rmSync(mirrorRoot, {
			recursive: true,
			force: true
		});
		try {
			fs.renameSync(stagedRoot, mirrorRoot);
		} catch (renameErr) {
			if (renameErr.code === 'ENOTEMPTY' || renameErr.code === 'EEXIST') {
				fs.rmSync(mirrorRoot, { recursive: true, force: true });
				fs.renameSync(stagedRoot, mirrorRoot);
			} else {
				throw renameErr;
			}
		}
	} finally {
		fs.rmSync(tempDir, {
			recursive: true,
			force: true
		});
	}
	return mirrorRoot;
}
function prepareBundledPluginRuntimeDistMirror(params) {
	const sourceExtensionsRoot = path.dirname(params.pluginRoot);
	const sourceDistRoot = path.dirname(sourceExtensionsRoot);
	const mirrorDistRoot = path.join(params.installRoot, "dist");
	const mirrorExtensionsRoot = path.join(mirrorDistRoot, "extensions");
	fs.mkdirSync(mirrorExtensionsRoot, {
		recursive: true,
		mode: 493
	});
	ensureBundledRuntimeDistPackageJson(mirrorDistRoot);
	for (const entry of fs.readdirSync(sourceDistRoot, { withFileTypes: true })) {
		if (entry.name === "extensions") continue;
		const sourcePath = path.join(sourceDistRoot, entry.name);
		const targetPath = path.join(mirrorDistRoot, entry.name);
		if (fs.existsSync(targetPath)) continue;
		try {
			fs.symlinkSync(sourcePath, targetPath, entry.isDirectory() ? "junction" : "file");
		} catch {
			if (entry.isDirectory()) copyBundledPluginRuntimeRoot(sourcePath, targetPath);
			else if (entry.isFile()) fs.copyFileSync(sourcePath, targetPath);
		}
	}
	ensureOpenClawPluginSdkAlias(mirrorDistRoot);
	return mirrorExtensionsRoot;
}
function ensureBundledRuntimeDistPackageJson(mirrorDistRoot) {
	const packageJsonPath = path.join(mirrorDistRoot, "package.json");
	if (fs.existsSync(packageJsonPath)) return;
	writeRuntimeJsonFile(packageJsonPath, { type: "module" });
}
function copyBundledPluginRuntimeRoot(sourceRoot, targetRoot) {
	fs.mkdirSync(targetRoot, {
		recursive: true,
		mode: 493
	});
	for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
		if (entry.name === "node_modules") continue;
		const sourcePath = path.join(sourceRoot, entry.name);
		const targetPath = path.join(targetRoot, entry.name);
		if (entry.isDirectory()) {
			copyBundledPluginRuntimeRoot(sourcePath, targetPath);
			continue;
		}
		if (entry.isSymbolicLink()) {
			fs.symlinkSync(fs.readlinkSync(sourcePath), targetPath);
			continue;
		}
		if (!entry.isFile()) continue;
		fs.copyFileSync(sourcePath, targetPath);
		try {
			const sourceMode = fs.statSync(sourcePath).mode;
			fs.chmodSync(targetPath, sourceMode | 384);
		} catch {}
	}
}
function writeRuntimeJsonFile(targetPath, value) {
	fs.mkdirSync(path.dirname(targetPath), { recursive: true });
	fs.writeFileSync(targetPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
function hasRuntimeDefaultExport(sourcePath) {
	const text = fs.readFileSync(sourcePath, "utf8");
	return /\bexport\s+default\b/u.test(text) || /\bas\s+default\b/u.test(text);
}
function writeRuntimeModuleWrapper(sourcePath, targetPath) {
	const specifier = path.relative(path.dirname(targetPath), sourcePath).replaceAll(path.sep, "/");
	const normalizedSpecifier = specifier.startsWith(".") ? specifier : `./${specifier}`;
	const defaultForwarder = hasRuntimeDefaultExport(sourcePath) ? [
		`import defaultModule from ${JSON.stringify(normalizedSpecifier)};`,
		`let defaultExport = defaultModule;`,
		`for (let index = 0; index < 4 && defaultExport && typeof defaultExport === "object" && "default" in defaultExport; index += 1) {`,
		`  defaultExport = defaultExport.default;`,
		`}`
	] : [
		`import * as module from ${JSON.stringify(normalizedSpecifier)};`,
		`let defaultExport = "default" in module ? module.default : module;`,
		`for (let index = 0; index < 4 && defaultExport && typeof defaultExport === "object" && "default" in defaultExport; index += 1) {`,
		`  defaultExport = defaultExport.default;`,
		`}`
	];
	fs.mkdirSync(path.dirname(targetPath), { recursive: true });
	fs.writeFileSync(targetPath, [
		`export * from ${JSON.stringify(normalizedSpecifier)};`,
		...defaultForwarder,
		"export { defaultExport as default };",
		""
	].join("\n"), "utf8");
}
function ensureOpenClawPluginSdkAlias(distRoot) {
	const pluginSdkDir = path.join(distRoot, "plugin-sdk");
	if (!fs.existsSync(pluginSdkDir)) return;
	const aliasDir = path.join(distRoot, "extensions", "node_modules", "openclaw");
	const pluginSdkAliasDir = path.join(aliasDir, "plugin-sdk");
	writeRuntimeJsonFile(path.join(aliasDir, "package.json"), {
		name: "openclaw",
		type: "module",
		exports: {
			"./plugin-sdk": "./plugin-sdk/index.js",
			"./plugin-sdk/*": "./plugin-sdk/*.js"
		}
	});
	try {
		if (fs.existsSync(pluginSdkAliasDir) && !fs.lstatSync(pluginSdkAliasDir).isDirectory()) {
			fs.rmSync(pluginSdkAliasDir, { recursive: true, force: true });
		}
	} catch {}
	fs.mkdirSync(pluginSdkAliasDir, { recursive: true });
	for (const entry of fs.readdirSync(pluginSdkDir, { withFileTypes: true })) {
		if (!entry.isFile() || path.extname(entry.name) !== ".js") continue;
		writeRuntimeModuleWrapper(path.join(pluginSdkDir, entry.name), path.join(pluginSdkAliasDir, entry.name));
	}
}
//#endregion
export { prepareBundledPluginRuntimeRoot as n, isBuiltBundledPluginRuntimeRoot as t };
