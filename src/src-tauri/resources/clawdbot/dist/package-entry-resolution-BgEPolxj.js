import { c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
import { n as resolveBoundaryPath, r as resolveBoundaryPathSync } from "./boundary-path-6aPPz8oV.js";
import { i as openBoundaryFileSync, n as matchBoundaryFileOpenFailure, r as openBoundaryFile } from "./boundary-file-read-C8TEdk8a.js";
import { r as getPackageManifestMetadata } from "./manifest-DkU_xlZi.js";
import fs from "node:fs";
import path from "node:path";
//#region src/plugins/package-entrypoints.ts
function isTypeScriptPackageEntry(entryPath) {
	return [
		".ts",
		".mts",
		".cts"
	].includes(path.extname(entryPath).toLowerCase());
}
function listBuiltRuntimeEntryCandidates(entryPath) {
	if (!isTypeScriptPackageEntry(entryPath)) return [];
	const normalized = entryPath.replace(/\\/g, "/");
	const withoutExtension = normalized.replace(/\.[^.]+$/u, "");
	const normalizedRelative = normalized.replace(/^\.\//u, "");
	const distWithoutExtension = normalizedRelative.startsWith("src/") ? `./dist/${normalizedRelative.slice(4).replace(/\.[^.]+$/u, "")}` : `./dist/${withoutExtension.replace(/^\.\//u, "")}`;
	const withJavaScriptExtensions = (basePath) => [
		`${basePath}.js`,
		`${basePath}.mjs`,
		`${basePath}.cjs`
	];
	const candidates = [...withJavaScriptExtensions(distWithoutExtension), ...withJavaScriptExtensions(withoutExtension)];
	return [...new Set(candidates)].filter((candidate) => candidate !== normalized);
}
//#endregion
//#region src/plugins/package-entry-resolution.ts
function runtimeExtensionsLengthMismatchMessage(params) {
	return `package.json openclaw.runtimeExtensions length (${params.runtimeExtensionsLength}) must match openclaw.extensions length (${params.extensionsLength})`;
}
function normalizePackageManifestStringList(value) {
	if (!Array.isArray(value)) return [];
	return value.map((entry) => normalizeOptionalString(entry) ?? "").filter(Boolean);
}
function resolvePackageRuntimeExtensionEntries(params) {
	const runtimeExtensions = normalizePackageManifestStringList(getPackageManifestMetadata(params.manifest ?? void 0)?.runtimeExtensions);
	if (runtimeExtensions.length === 0) return {
		ok: true,
		runtimeExtensions: []
	};
	if (runtimeExtensions.length !== params.extensions.length) return {
		ok: false,
		error: runtimeExtensionsLengthMismatchMessage({
			runtimeExtensionsLength: runtimeExtensions.length,
			extensionsLength: params.extensions.length
		})
	};
	return {
		ok: true,
		runtimeExtensions
	};
}
async function validatePackageExtensionEntry(params) {
	const absolutePath = path.resolve(params.packageDir, params.entry);
	try {
		if (!(await resolveBoundaryPath({
			absolutePath,
			rootPath: params.packageDir,
			boundaryLabel: "plugin package directory"
		})).exists) return params.requireExisting ? {
			ok: false,
			error: `${params.label} not found: ${params.entry}`
		} : {
			ok: true,
			exists: false
		};
	} catch {
		return {
			ok: false,
			error: `${params.label} escapes plugin directory: ${params.entry}`
		};
	}
	const opened = await openBoundaryFile({
		absolutePath,
		rootPath: params.packageDir,
		boundaryLabel: "plugin package directory"
	});
	if (!opened.ok) return matchBoundaryFileOpenFailure(opened, {
		path: () => ({
			ok: false,
			error: `${params.label} not found: ${params.entry}`
		}),
		io: () => ({
			ok: false,
			error: `${params.label} unreadable: ${params.entry}`
		}),
		validation: () => ({
			ok: false,
			error: `${params.label} failed plugin directory boundary checks: ${params.entry}`
		}),
		fallback: () => ({
			ok: false,
			error: `${params.label} failed plugin directory boundary checks: ${params.entry}`
		})
	});
	fs.closeSync(opened.fd);
	return {
		ok: true,
		exists: true
	};
}
async function validatePackageExtensionEntriesForInstall(params) {
	const runtimeResolution = resolvePackageRuntimeExtensionEntries({
		manifest: params.manifest,
		extensions: params.extensions
	});
	if (!runtimeResolution.ok) return runtimeResolution;
	for (const [index, entry] of params.extensions.entries()) {
		const sourceEntry = await validatePackageExtensionEntry({
			packageDir: params.packageDir,
			entry,
			label: "extension entry",
			requireExisting: false
		});
		if (!sourceEntry.ok) return sourceEntry;
		const runtimeEntry = runtimeResolution.runtimeExtensions[index];
		if (runtimeEntry) {
			const runtimeResult = await validatePackageExtensionEntry({
				packageDir: params.packageDir,
				entry: runtimeEntry,
				label: "runtime extension entry",
				requireExisting: true
			});
			if (!runtimeResult.ok) return runtimeResult;
			continue;
		}
		if (sourceEntry.exists) continue;
		let foundBuiltEntry = false;
		for (const builtEntry of listBuiltRuntimeEntryCandidates(entry)) {
			const builtResult = await validatePackageExtensionEntry({
				packageDir: params.packageDir,
				entry: builtEntry,
				label: "inferred runtime extension entry",
				requireExisting: false
			});
			if (!builtResult.ok) return builtResult;
			if (builtResult.exists) {
				foundBuiltEntry = true;
				break;
			}
		}
		if (!foundBuiltEntry) return {
			ok: false,
			error: `extension entry not found: ${entry}`
		};
	}
	return { ok: true };
}
function resolvePackageEntrySource(params) {
	const source = path.resolve(params.packageDir, params.entryPath);
	const rejectHardlinks = params.rejectHardlinks ?? true;
	const candidates = [source];
	const openCandidate = (absolutePath) => {
		const opened = openBoundaryFileSync({
			absolutePath,
			rootPath: params.packageDir,
			...params.packageRootRealPath !== void 0 ? { rootRealPath: params.packageRootRealPath } : {},
			boundaryLabel: "plugin package directory",
			rejectHardlinks
		});
		if (!opened.ok) return matchBoundaryFileOpenFailure(opened, {
			path: () => null,
			io: () => {
				params.diagnostics.push({
					level: "warn",
					message: `extension entry unreadable (I/O error): ${params.entryPath}`,
					source: params.sourceLabel
				});
				return null;
			},
			fallback: () => {
				params.diagnostics.push({
					level: "error",
					message: `extension entry escapes package directory: ${params.entryPath}`,
					source: params.sourceLabel
				});
				return null;
			}
		});
		const safeSource = opened.path;
		fs.closeSync(opened.fd);
		return safeSource;
	};
	if (!rejectHardlinks) {
		const builtCandidate = source.replace(/\.[^.]+$/u, ".js");
		if (builtCandidate !== source) candidates.push(builtCandidate);
	}
	for (const candidate of new Set(candidates)) {
		if (!fs.existsSync(candidate)) continue;
		return openCandidate(candidate);
	}
	return openCandidate(source);
}
function shouldInferBuiltRuntimeEntry(origin) {
	return origin === "config" || origin === "global";
}
function resolveSafePackageEntry(params) {
	const absolutePath = path.resolve(params.packageDir, params.entryPath);
	if (fs.existsSync(absolutePath)) {
		const existingSource = resolvePackageEntrySource({
			packageDir: params.packageDir,
			...params.packageRootRealPath !== void 0 ? { packageRootRealPath: params.packageRootRealPath } : {},
			entryPath: params.entryPath,
			sourceLabel: params.sourceLabel,
			diagnostics: params.diagnostics,
			rejectHardlinks: params.rejectHardlinks
		});
		if (!existingSource) return null;
		return {
			relativePath: path.relative(params.packageDir, absolutePath).replace(/\\/g, "/"),
			existingSource
		};
	}
	try {
		resolveBoundaryPathSync({
			absolutePath,
			rootPath: params.packageDir,
			...params.packageRootRealPath !== void 0 ? { rootCanonicalPath: params.packageRootRealPath } : {},
			boundaryLabel: "plugin package directory"
		});
	} catch {
		params.diagnostics.push({
			level: "error",
			message: `extension entry escapes package directory: ${params.entryPath}`,
			source: params.sourceLabel
		});
		return null;
	}
	return { relativePath: path.relative(params.packageDir, absolutePath).replace(/\\/g, "/") };
}
function resolveExistingPackageEntrySource(params) {
	const source = path.resolve(params.packageDir, params.entryPath);
	if (!fs.existsSync(source)) return null;
	return resolvePackageEntrySource(params);
}
function resolvePackageRuntimeEntrySource(params) {
	const safeEntry = resolveSafePackageEntry({
		packageDir: params.packageDir,
		...params.packageRootRealPath !== void 0 ? { packageRootRealPath: params.packageRootRealPath } : {},
		entryPath: params.entryPath,
		sourceLabel: params.sourceLabel,
		diagnostics: params.diagnostics,
		rejectHardlinks: params.rejectHardlinks
	});
	if (!safeEntry) return null;
	if (params.runtimeEntryPath) {
		const runtimeSource = resolvePackageEntrySource({
			packageDir: params.packageDir,
			...params.packageRootRealPath !== void 0 ? { packageRootRealPath: params.packageRootRealPath } : {},
			entryPath: params.runtimeEntryPath,
			sourceLabel: params.sourceLabel,
			diagnostics: params.diagnostics,
			rejectHardlinks: params.rejectHardlinks
		});
		if (runtimeSource) return runtimeSource;
	}
	if (shouldInferBuiltRuntimeEntry(params.origin)) for (const candidate of listBuiltRuntimeEntryCandidates(safeEntry.relativePath)) {
		const runtimeSource = resolveExistingPackageEntrySource({
			packageDir: params.packageDir,
			...params.packageRootRealPath !== void 0 ? { packageRootRealPath: params.packageRootRealPath } : {},
			entryPath: candidate,
			sourceLabel: params.sourceLabel,
			diagnostics: params.diagnostics,
			rejectHardlinks: params.rejectHardlinks
		});
		if (runtimeSource) return runtimeSource;
	}
	if (safeEntry.existingSource) return safeEntry.existingSource;
	return resolvePackageEntrySource({
		packageDir: params.packageDir,
		...params.packageRootRealPath !== void 0 ? { packageRootRealPath: params.packageRootRealPath } : {},
		entryPath: params.entryPath,
		sourceLabel: params.sourceLabel,
		diagnostics: params.diagnostics,
		rejectHardlinks: params.rejectHardlinks
	});
}
function resolvePackageSetupSource(params) {
	const packageManifest = getPackageManifestMetadata(params.manifest ?? void 0);
	const setupEntryPath = normalizeOptionalString(packageManifest?.setupEntry);
	if (!setupEntryPath) return null;
	return resolvePackageRuntimeEntrySource({
		packageDir: params.packageDir,
		...params.packageRootRealPath !== void 0 ? { packageRootRealPath: params.packageRootRealPath } : {},
		entryPath: setupEntryPath,
		runtimeEntryPath: normalizeOptionalString(packageManifest?.runtimeSetupEntry),
		origin: params.origin,
		sourceLabel: params.sourceLabel,
		diagnostics: params.diagnostics,
		rejectHardlinks: params.rejectHardlinks
	});
}
function resolvePackageRuntimeExtensionSources(params) {
	const runtimeResolution = resolvePackageRuntimeExtensionEntries({
		manifest: params.manifest,
		extensions: params.extensions
	});
	if (!runtimeResolution.ok) {
		params.diagnostics.push({
			level: "error",
			message: runtimeResolution.error,
			source: params.sourceLabel
		});
		return [];
	}
	return params.extensions.flatMap((entryPath, index) => {
		const source = resolvePackageRuntimeEntrySource({
			packageDir: params.packageDir,
			...params.packageRootRealPath !== void 0 ? { packageRootRealPath: params.packageRootRealPath } : {},
			entryPath,
			runtimeEntryPath: runtimeResolution.runtimeExtensions[index],
			origin: params.origin,
			sourceLabel: params.sourceLabel,
			diagnostics: params.diagnostics,
			rejectHardlinks: params.rejectHardlinks
		});
		return source ? [source] : [];
	});
}
//#endregion
export { resolvePackageSetupSource as n, validatePackageExtensionEntriesForInstall as r, resolvePackageRuntimeExtensionSources as t };
