import { t as resolveBundledPluginsDir } from "./bundled-dir-D4Wk35JT.js";
import fs from "node:fs";
import path from "node:path";
//#region src/plugins/public-surface-runtime.ts
const PUBLIC_SURFACE_SOURCE_EXTENSIONS = [
	".ts",
	".mts",
	".js",
	".mjs",
	".cts",
	".cjs"
];
function normalizeBundledPluginArtifactSubpath(artifactBasename) {
	if (path.posix.isAbsolute(artifactBasename) || path.win32.isAbsolute(artifactBasename) || artifactBasename.includes("\\")) throw new Error(`Bundled plugin artifact path must stay plugin-local: ${artifactBasename}`);
	const normalized = artifactBasename.replace(/^\.\//u, "");
	if (!normalized) throw new Error("Bundled plugin artifact path must not be empty");
	if (normalized.split("/").some((segment) => segment.length === 0 || segment === "." || segment === ".." || segment.includes(":"))) throw new Error(`Bundled plugin artifact path must stay plugin-local: ${artifactBasename}`);
	return normalized;
}
function resolveBundledPluginSourcePublicSurfacePath(params) {
	const sourceBaseName = normalizeBundledPluginArtifactSubpath(params.artifactBasename).replace(/\.js$/u, "");
	for (const ext of PUBLIC_SURFACE_SOURCE_EXTENSIONS) {
		const sourceCandidate = path.resolve(params.sourceRoot, params.dirName, `${sourceBaseName}${ext}`);
		if (fs.existsSync(sourceCandidate)) return sourceCandidate;
	}
	return null;
}
function resolvePackageSourceFallbackForBundledDir(params) {
	const normalizedBundledDir = path.resolve(params.bundledPluginsDir);
	const normalizedRootDir = path.resolve(params.rootDir);
	if (![path.join(normalizedRootDir, "dist", "extensions"), path.join(normalizedRootDir, "dist-runtime", "extensions")].includes(normalizedBundledDir)) return null;
	return resolveBundledPluginSourcePublicSurfacePath({
		sourceRoot: path.join(normalizedRootDir, "extensions"),
		dirName: params.dirName,
		artifactBasename: params.artifactBasename
	});
}
function resolveBundledPluginPublicSurfacePath(params) {
	const artifactBasename = normalizeBundledPluginArtifactSubpath(params.artifactBasename);
	const explicitBundledPluginsDir = params.bundledPluginsDir ?? resolveBundledPluginsDir(params.env ?? process.env);
	if (explicitBundledPluginsDir) {
		const explicitPluginDir = path.resolve(explicitBundledPluginsDir, params.dirName);
		const explicitBuiltCandidate = path.join(explicitPluginDir, artifactBasename);
		if (fs.existsSync(explicitBuiltCandidate)) return explicitBuiltCandidate;
		return resolveBundledPluginSourcePublicSurfacePath({
			sourceRoot: explicitBundledPluginsDir,
			dirName: params.dirName,
			artifactBasename
		}) ?? resolvePackageSourceFallbackForBundledDir({
			rootDir: params.rootDir,
			bundledPluginsDir: explicitBundledPluginsDir,
			dirName: params.dirName,
			artifactBasename
		});
	}
	for (const candidate of [path.resolve(params.rootDir, "dist", "extensions", params.dirName, artifactBasename), path.resolve(params.rootDir, "dist-runtime", "extensions", params.dirName, artifactBasename)]) if (fs.existsSync(candidate)) return candidate;
	return resolveBundledPluginSourcePublicSurfacePath({
		sourceRoot: path.resolve(params.rootDir, "extensions"),
		dirName: params.dirName,
		artifactBasename
	});
}
//#endregion
export { resolveBundledPluginSourcePublicSurfacePath as i, normalizeBundledPluginArtifactSubpath as n, resolveBundledPluginPublicSurfacePath as r, PUBLIC_SURFACE_SOURCE_EXTENSIONS as t };
