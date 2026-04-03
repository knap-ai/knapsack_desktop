import { n as isPathInside, t as extensionUsesSkippedScannerPath } from "./scan-paths-CFWv0hpJ.js";
import { t as getGlobalHookRunner } from "./hook-runner-global-CmW7Xsw3.js";
import { t as scanDirectoryWithSummary } from "./skill-scanner-JxC9Rzer.js";
import path from "node:path";
//#region src/plugins/install-policy-context.ts
function createBeforeInstallHookPayload(params) {
	return {
		event: {
			targetType: params.targetType,
			targetName: params.targetName,
			sourcePath: params.sourcePath,
			sourcePathKind: params.sourcePathKind,
			...params.origin ? { origin: params.origin } : {},
			request: params.request,
			builtinScan: params.builtinScan,
			...params.skill ? { skill: params.skill } : {},
			...params.plugin ? { plugin: params.plugin } : {}
		},
		ctx: {
			targetType: params.targetType,
			requestKind: params.request.kind,
			...params.origin ? { origin: params.origin } : {}
		}
	};
}
//#endregion
//#region src/plugins/install-security-scan.runtime.ts
function buildCriticalDetails(params) {
	return params.findings.filter((finding) => finding.severity === "critical").map((finding) => `${finding.message} (${finding.file}:${finding.line})`).join("; ");
}
function buildCriticalBlockReason(params) {
	return `${params.targetLabel} blocked: dangerous code patterns detected: ${buildCriticalDetails({ findings: params.findings })}`;
}
function buildScanFailureBlockReason(params) {
	return `${params.targetLabel} blocked: code safety scan failed (${params.error}). Run "openclaw security audit --deep" for details.`;
}
function buildBuiltinScanFromError(error) {
	return {
		status: "error",
		scannedFiles: 0,
		critical: 0,
		warn: 0,
		info: 0,
		findings: [],
		error: String(error)
	};
}
function buildBuiltinScanFromSummary(summary) {
	return {
		status: "ok",
		scannedFiles: summary.scannedFiles,
		critical: summary.critical,
		warn: summary.warn,
		info: summary.info,
		findings: summary.findings
	};
}
async function scanDirectoryTarget(params) {
	try {
		const scanSummary = await scanDirectoryWithSummary(params.path, { includeFiles: params.includeFiles });
		const builtinScan = buildBuiltinScanFromSummary(scanSummary);
		if (scanSummary.critical > 0) params.logger.warn?.(`${params.warningMessage}: ${buildCriticalDetails({ findings: scanSummary.findings })}`);
		else if (scanSummary.warn > 0) params.logger.warn?.(params.suspiciousMessage.replace("{count}", String(scanSummary.warn)).replace("{target}", params.targetName));
		return builtinScan;
	} catch (err) {
		return buildBuiltinScanFromError(err);
	}
}
function buildBlockedScanResult(params) {
	if (params.builtinScan.status === "error") return { blocked: {
		code: "security_scan_failed",
		reason: buildScanFailureBlockReason({
			error: params.builtinScan.error ?? "unknown error",
			targetLabel: params.targetLabel
		})
	} };
	if (params.builtinScan.critical > 0) {
		if (params.dangerouslyForceUnsafeInstall) return;
		return { blocked: {
			code: "security_scan_blocked",
			reason: buildCriticalBlockReason({
				findings: params.builtinScan.findings,
				targetLabel: params.targetLabel
			})
		} };
	}
}
function logDangerousForceUnsafeInstall(params) {
	params.logger.warn?.(`WARNING: ${params.targetLabel} forced despite dangerous code patterns via --dangerously-force-unsafe-install: ${buildCriticalDetails({ findings: params.findings })}`);
}
function resolveBuiltinScanDecision(params) {
	const builtinBlocked = buildBlockedScanResult({
		builtinScan: params.builtinScan,
		dangerouslyForceUnsafeInstall: params.dangerouslyForceUnsafeInstall,
		targetLabel: params.targetLabel
	});
	if (params.dangerouslyForceUnsafeInstall && params.builtinScan.critical > 0) logDangerousForceUnsafeInstall({
		findings: params.builtinScan.findings,
		logger: params.logger,
		targetLabel: params.targetLabel
	});
	return builtinBlocked;
}
async function scanFileTarget(params) {
	const directory = path.dirname(params.path);
	return await scanDirectoryTarget({
		includeFiles: [params.path],
		logger: params.logger,
		path: directory,
		suspiciousMessage: params.suspiciousMessage,
		targetName: params.targetName,
		warningMessage: params.warningMessage
	});
}
async function runBeforeInstallHook(params) {
	const hookRunner = getGlobalHookRunner();
	if (!hookRunner?.hasHooks("before_install")) return;
	try {
		const { event, ctx } = createBeforeInstallHookPayload({
			targetName: params.targetName,
			targetType: params.targetType,
			origin: params.origin,
			sourcePath: params.sourcePath,
			sourcePathKind: params.sourcePathKind,
			request: {
				kind: params.requestKind,
				mode: params.requestMode,
				...params.requestedSpecifier ? { requestedSpecifier: params.requestedSpecifier } : {}
			},
			builtinScan: params.builtinScan,
			...params.skill ? { skill: params.skill } : {},
			...params.plugin ? { plugin: params.plugin } : {}
		});
		const hookResult = await hookRunner.runBeforeInstall(event, ctx);
		if (hookResult?.block) {
			const reason = hookResult.blockReason || "Installation blocked by plugin hook";
			params.logger.warn?.(`WARNING: ${params.installLabel} blocked by plugin hook: ${reason}`);
			return { blocked: { reason } };
		}
		if (hookResult?.findings) {
			for (const finding of hookResult.findings) if (finding.severity === "critical" || finding.severity === "warn") params.logger.warn?.(`Plugin scanner: ${finding.message} (${finding.file}:${finding.line})`);
		}
	} catch {}
}
async function scanBundleInstallSourceRuntime(params) {
	const builtinScan = await scanDirectoryTarget({
		logger: params.logger,
		path: params.sourceDir,
		suspiciousMessage: `Bundle "{target}" has {count} suspicious code pattern(s). Run "openclaw security audit --deep" for details.`,
		targetName: params.pluginId,
		warningMessage: `WARNING: Bundle "${params.pluginId}" contains dangerous code patterns`
	});
	const builtinBlocked = resolveBuiltinScanDecision({
		builtinScan,
		logger: params.logger,
		dangerouslyForceUnsafeInstall: params.dangerouslyForceUnsafeInstall,
		targetLabel: `Bundle "${params.pluginId}" installation`
	});
	const hookResult = await runBeforeInstallHook({
		logger: params.logger,
		installLabel: `Bundle "${params.pluginId}" installation`,
		origin: "plugin-bundle",
		sourcePath: params.sourceDir,
		sourcePathKind: "directory",
		targetName: params.pluginId,
		targetType: "plugin",
		requestKind: params.requestKind ?? "plugin-dir",
		requestMode: params.mode ?? "install",
		requestedSpecifier: params.requestedSpecifier,
		builtinScan,
		plugin: {
			contentType: "bundle",
			pluginId: params.pluginId,
			manifestId: params.pluginId,
			...params.version ? { version: params.version } : {}
		}
	});
	return hookResult?.blocked ? hookResult : builtinBlocked;
}
async function scanPackageInstallSourceRuntime(params) {
	const forcedScanEntries = [];
	for (const entry of params.extensions) {
		const resolvedEntry = path.resolve(params.packageDir, entry);
		if (!isPathInside(params.packageDir, resolvedEntry)) {
			params.logger.warn?.(`extension entry escapes plugin directory and will not be scanned: ${entry}`);
			continue;
		}
		if (extensionUsesSkippedScannerPath(entry)) params.logger.warn?.(`extension entry is in a hidden/node_modules path and will receive targeted scan coverage: ${entry}`);
		forcedScanEntries.push(resolvedEntry);
	}
	const builtinScan = await scanDirectoryTarget({
		includeFiles: forcedScanEntries,
		logger: params.logger,
		path: params.packageDir,
		suspiciousMessage: `Plugin "{target}" has {count} suspicious code pattern(s). Run "openclaw security audit --deep" for details.`,
		targetName: params.pluginId,
		warningMessage: `WARNING: Plugin "${params.pluginId}" contains dangerous code patterns`
	});
	const builtinBlocked = resolveBuiltinScanDecision({
		builtinScan,
		logger: params.logger,
		dangerouslyForceUnsafeInstall: params.dangerouslyForceUnsafeInstall,
		targetLabel: `Plugin "${params.pluginId}" installation`
	});
	const hookResult = await runBeforeInstallHook({
		logger: params.logger,
		installLabel: `Plugin "${params.pluginId}" installation`,
		origin: "plugin-package",
		sourcePath: params.packageDir,
		sourcePathKind: "directory",
		targetName: params.pluginId,
		targetType: "plugin",
		requestKind: params.requestKind ?? "plugin-dir",
		requestMode: params.mode ?? "install",
		requestedSpecifier: params.requestedSpecifier,
		builtinScan,
		plugin: {
			contentType: "package",
			pluginId: params.pluginId,
			...params.packageName ? { packageName: params.packageName } : {},
			...params.manifestId ? { manifestId: params.manifestId } : {},
			...params.version ? { version: params.version } : {},
			extensions: params.extensions.slice()
		}
	});
	return hookResult?.blocked ? hookResult : builtinBlocked;
}
async function scanFileInstallSourceRuntime(params) {
	const builtinScan = await scanFileTarget({
		logger: params.logger,
		path: params.filePath,
		suspiciousMessage: `Plugin file "{target}" has {count} suspicious code pattern(s). Run "openclaw security audit --deep" for details.`,
		targetName: params.pluginId,
		warningMessage: `WARNING: Plugin file "${params.pluginId}" contains dangerous code patterns`
	});
	const builtinBlocked = resolveBuiltinScanDecision({
		builtinScan,
		logger: params.logger,
		dangerouslyForceUnsafeInstall: params.dangerouslyForceUnsafeInstall,
		targetLabel: `Plugin file "${params.pluginId}" installation`
	});
	const hookResult = await runBeforeInstallHook({
		logger: params.logger,
		installLabel: `Plugin file "${params.pluginId}" installation`,
		origin: "plugin-file",
		sourcePath: params.filePath,
		sourcePathKind: "file",
		targetName: params.pluginId,
		targetType: "plugin",
		requestKind: "plugin-file",
		requestMode: params.mode ?? "install",
		requestedSpecifier: params.requestedSpecifier,
		builtinScan,
		plugin: {
			contentType: "file",
			pluginId: params.pluginId,
			extensions: [path.basename(params.filePath)]
		}
	});
	return hookResult?.blocked ? hookResult : builtinBlocked;
}
async function scanSkillInstallSourceRuntime(params) {
	const builtinScan = await scanDirectoryTarget({
		logger: params.logger,
		path: params.sourceDir,
		suspiciousMessage: "Skill \"{target}\" has {count} suspicious code pattern(s). Run \"openclaw security audit --deep\" for details.",
		targetName: params.skillName,
		warningMessage: `WARNING: Skill "${params.skillName}" contains dangerous code patterns`
	});
	const builtinBlocked = buildBlockedScanResult({
		builtinScan,
		dangerouslyForceUnsafeInstall: params.dangerouslyForceUnsafeInstall,
		targetLabel: `Skill "${params.skillName}" installation`
	});
	if (params.dangerouslyForceUnsafeInstall && builtinScan.critical > 0) logDangerousForceUnsafeInstall({
		findings: builtinScan.findings,
		logger: params.logger,
		targetLabel: `Skill "${params.skillName}" installation`
	});
	const hookResult = await runBeforeInstallHook({
		logger: params.logger,
		installLabel: `Skill "${params.skillName}" installation`,
		origin: params.origin,
		sourcePath: params.sourceDir,
		sourcePathKind: "directory",
		targetName: params.skillName,
		targetType: "skill",
		requestKind: "skill-install",
		requestMode: "install",
		builtinScan,
		skill: {
			installId: params.installId,
			...params.installSpec ? { installSpec: params.installSpec } : {}
		}
	});
	return hookResult?.blocked ? hookResult : builtinBlocked;
}
//#endregion
export { scanBundleInstallSourceRuntime, scanFileInstallSourceRuntime, scanPackageInstallSourceRuntime, scanSkillInstallSourceRuntime };
