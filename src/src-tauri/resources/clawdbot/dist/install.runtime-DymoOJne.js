import "./logger-kwZIqwuw.js";
import "./paths-ViKUYWUK.js";
import "./tmp-openclaw-dir-idKIOMmb.js";
import "./theme-CdOoMzRk.js";
import "./globals-DBUMOBZ8.js";
import "./subsystem-DISldKSB.js";
import "./ansi-BEJF8NKS.js";
import "./utils-CS0Ikux6.js";
import "./boundary-path-Dm0QJ7-y.js";
import "./logger-BmpSCz93.js";
import "./exec-B5_AYfQG.js";
import { n as isPathInside, r as isPathInsideWithRealpath } from "./scan-paths-DKkCswtk.js";
import "./path-alias-guards-CwRM04O1.js";
import { a as resolveArchiveKind, i as readJsonFile, r as fileExists } from "./archive-pOxyr9r4.js";
import "./fs-safe-DZyOgpPN.js";
import { i as validateRegistryNpmSpec } from "./npm-registry-spec-BH5usJ-U.js";
import { r as resolveArchiveSourcePath } from "./install-source-utils-C3NuFv6M.js";
import { i as withExtractedArchiveRoot, n as installPackageDirWithManifestDeps, r as resolveExistingInstallPath, t as installPackageDir } from "./install-package-dir-ztoahuHZ.js";
import { a as finalizeNpmSpecArchiveInstall, i as resolveTimedInstallModeOptions, n as resolveCanonicalInstallTarget, o as installFromNpmSpecArchiveWithInstaller, r as resolveInstallModeOptions, t as ensureInstallTargetAvailable } from "./install-target-B4Jw5W-T.js";
//#region src/infra/install-from-npm-spec.ts
async function installFromValidatedNpmSpecArchive(params) {
	const spec = params.spec.trim();
	const specError = validateRegistryNpmSpec(spec);
	if (specError) return {
		ok: false,
		error: specError
	};
	return finalizeNpmSpecArchiveInstall(await installFromNpmSpecArchiveWithInstaller({
		tempDirPrefix: params.tempDirPrefix,
		spec,
		timeoutMs: params.timeoutMs,
		expectedIntegrity: params.expectedIntegrity,
		onIntegrityDrift: params.onIntegrityDrift,
		warn: params.warn,
		installFromArchive: params.installFromArchive,
		archiveInstallParams: params.archiveInstallParams
	}));
}
//#endregion
export { ensureInstallTargetAvailable, fileExists, installFromValidatedNpmSpecArchive, installPackageDir, installPackageDirWithManifestDeps, isPathInside, isPathInsideWithRealpath, readJsonFile, resolveArchiveKind, resolveArchiveSourcePath, resolveCanonicalInstallTarget, resolveExistingInstallPath, resolveInstallModeOptions, resolveTimedInstallModeOptions, withExtractedArchiveRoot };
