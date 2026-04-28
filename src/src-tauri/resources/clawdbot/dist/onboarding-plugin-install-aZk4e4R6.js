import { r as parseRegistryNpmSpec } from "./npm-registry-spec-BajOKPjz.js";
import { t as sanitizeTerminalText } from "./safe-text-BsGBhnDf.js";
import { n as recordPluginInstall, t as buildNpmResolutionInstallFields } from "./installs-31vZ2PVW.js";
import { t as withTimeout } from "./with-timeout-C7CNOwvj.js";
import { a as resolveDefaultPluginExtensionsDir, r as installPluginFromNpmSpec } from "./install-BrXYq_UK.js";
import { t as enablePluginInConfig } from "./enable-BsT6IO1f.js";
import { i as resolveBundledPluginSources, n as findBundledPluginSourceInMap } from "./bundled-sources-CqkGtVM8.js";
import { n as resolveBundledInstallPlanForCatalogEntry } from "./plugin-install-plan-iAiXlNqM.js";
import fs from "node:fs";
import path from "node:path";
//#region src/commands/onboarding-plugin-install.ts
const ONBOARDING_PLUGIN_INSTALL_TIMEOUT_MS = 300 * 1e3;
const ONBOARDING_PLUGIN_INSTALL_WATCHDOG_TIMEOUT_MS = ONBOARDING_PLUGIN_INSTALL_TIMEOUT_MS + 5e3;
function resolveRealDirectory(dir) {
	try {
		const resolved = fs.realpathSync(dir);
		return fs.statSync(resolved).isDirectory() ? resolved : null;
	} catch {
		return null;
	}
}
function resolveGitDirectoryMarker(dir) {
	const marker = path.join(dir, ".git");
	try {
		const stat = fs.statSync(marker);
		if (stat.isDirectory()) return resolveRealDirectory(marker);
		if (!stat.isFile()) return null;
		const content = fs.readFileSync(marker, "utf8").trim();
		const match = /^gitdir:\s*(.+)$/i.exec(content);
		if (!match) return null;
		const gitDir = match[1]?.trim();
		if (!gitDir) return null;
		return resolveRealDirectory(path.isAbsolute(gitDir) ? gitDir : path.resolve(dir, gitDir));
	} catch {
		return null;
	}
}
function isWithinBaseDirectory(baseDir, targetPath) {
	const relative = path.relative(baseDir, targetPath);
	return relative === "" || !path.isAbsolute(relative) && !relative.startsWith(`..${path.sep}`) && relative !== "..";
}
function hasTrustedGitWorkspace(root) {
	const realRoot = resolveRealDirectory(root);
	if (!realRoot) return false;
	for (let dir = realRoot;; dir = path.dirname(dir)) {
		if (resolveGitDirectoryMarker(dir)) return true;
		if (path.dirname(dir) === dir) return false;
	}
}
function hasGitWorkspace(workspaceDir) {
	const roots = [process.cwd()];
	if (workspaceDir && workspaceDir !== process.cwd()) roots.push(workspaceDir);
	return roots.some((root) => hasTrustedGitWorkspace(root));
}
function addPluginLoadPath(cfg, pluginPath) {
	const existing = cfg.plugins?.load?.paths ?? [];
	const merged = Array.from(new Set([...existing, pluginPath]));
	return {
		...cfg,
		plugins: {
			...cfg.plugins,
			load: {
				...cfg.plugins?.load,
				paths: merged
			}
		}
	};
}
function pathsReferToSameDirectory(left, right) {
	if (!left || !right) return false;
	const realLeft = resolveRealDirectory(left);
	const realRight = resolveRealDirectory(right);
	return Boolean(realLeft && realRight && realLeft === realRight);
}
function formatPortableLocalPath(localPath, workspaceDir) {
	const bases = [workspaceDir, process.cwd()].filter((entry) => Boolean(entry));
	for (const base of bases) {
		const realBase = resolveRealDirectory(base);
		if (!realBase) continue;
		const relative = path.relative(realBase, localPath);
		if (relative === "" || !path.isAbsolute(relative) && !relative.startsWith(`..${path.sep}`) && relative !== "..") {
			const portable = relative.split(path.sep).join("/");
			return portable ? `./${portable}` : ".";
		}
	}
}
async function recordLocalPluginInstall(params) {
	const sourcePath = formatPortableLocalPath(params.localPath, params.workspaceDir);
	const install = {
		pluginId: params.entry.pluginId,
		source: "path",
		...sourcePath ? { sourcePath } : {},
		...params.npmSpec ? { spec: params.npmSpec } : {}
	};
	return recordPluginInstall(params.cfg, install);
}
function resolveLocalPath(params) {
	if (!params.allowLocal) return null;
	const raw = params.entry.install.localPath?.trim();
	if (!raw) return null;
	const candidates = /* @__PURE__ */ new Set();
	const bases = [process.cwd()];
	if (params.workspaceDir && params.workspaceDir !== process.cwd()) bases.push(params.workspaceDir);
	for (const base of bases) {
		const realBase = resolveRealDirectory(base);
		if (!realBase) continue;
		candidates.add(path.resolve(realBase, raw));
	}
	for (const candidate of candidates) try {
		const resolved = fs.realpathSync(candidate);
		if (!bases.some((base) => {
			const realBase = resolveRealDirectory(base);
			return realBase ? isWithinBaseDirectory(realBase, resolved) : false;
		})) continue;
		if (fs.statSync(resolved).isDirectory()) return resolved;
	} catch {
		continue;
	}
	return null;
}
function resolveBundledLocalPath(params) {
	const bundledSources = resolveBundledPluginSources({ workspaceDir: params.workspaceDir });
	const npmSpec = params.entry.install.npmSpec?.trim();
	if (npmSpec) return resolveBundledInstallPlanForCatalogEntry({
		pluginId: params.entry.pluginId,
		npmSpec,
		findBundledSource: (lookup) => findBundledPluginSourceInMap({
			bundled: bundledSources,
			lookup
		})
	})?.bundledSource.localPath ?? null;
	return findBundledPluginSourceInMap({
		bundled: bundledSources,
		lookup: {
			kind: "pluginId",
			value: params.entry.pluginId
		}
	})?.localPath ?? null;
}
function resolveNpmSpecForOnboarding(install) {
	const npmSpec = install.npmSpec?.trim();
	if (!npmSpec) return null;
	return parseRegistryNpmSpec(npmSpec) ? npmSpec : null;
}
function resolveInstallDefaultChoice(params) {
	const { cfg, entry, localPath, bundledLocalPath, hasNpmSpec } = params;
	if (!hasNpmSpec) return localPath ? "local" : "skip";
	if (!localPath) return "npm";
	if (bundledLocalPath) return "local";
	const updateChannel = cfg.update?.channel;
	if (updateChannel === "dev") return "local";
	if (updateChannel === "stable" || updateChannel === "beta") return "npm";
	const entryDefault = entry.install.defaultChoice;
	if (entryDefault === "local") return "local";
	if (entryDefault === "npm") return "npm";
	return "local";
}
async function promptInstallChoice(params) {
	const npmSpec = resolveNpmSpecForOnboarding(params.entry.install);
	const safeLabel = sanitizeTerminalText(params.entry.label);
	const safeNpmSpec = npmSpec ? sanitizeTerminalText(npmSpec) : null;
	const safeLocalPath = params.localPath ? sanitizeTerminalText(params.localPath) : null;
	const options = [];
	if (safeNpmSpec) options.push({
		value: "npm",
		label: `Download from npm (${safeNpmSpec})`
	});
	if (params.localPath) options.push({
		value: "local",
		label: "Use local plugin path",
		...safeLocalPath ? { hint: safeLocalPath } : {}
	});
	options.push({
		value: "skip",
		label: "Skip for now"
	});
	const initialValue = params.defaultChoice === "local" && !params.localPath ? npmSpec ? "npm" : "skip" : params.defaultChoice;
	return await params.prompter.select({
		message: `Install ${safeLabel} plugin?`,
		options,
		initialValue
	});
}
function formatDurationLabel(timeoutMs) {
	if (timeoutMs % 6e4 === 0) {
		const minutes = timeoutMs / 6e4;
		return `${minutes} minute${minutes === 1 ? "" : "s"}`;
	}
	const seconds = Math.round(timeoutMs / 1e3);
	return `${seconds} second${seconds === 1 ? "" : "s"}`;
}
function summarizeInstallError(message) {
	const cleaned = sanitizeTerminalText(message).replace(/^Install failed(?:\s*\([^)]*\))?\s*:?\s*/i, "").trim();
	if (!cleaned) return "Unknown install failure";
	return cleaned.length > 180 ? `${cleaned.slice(0, 179)}…` : cleaned;
}
function isTimeoutError(error) {
	return error instanceof Error && error.message === "timeout";
}
async function applyPluginEnablement(params) {
	const enableResult = enablePluginInConfig(params.cfg, params.pluginId);
	if (enableResult.enabled) return enableResult;
	const safeLabel = sanitizeTerminalText(params.label);
	const reason = enableResult.reason ?? "plugin disabled";
	await params.prompter.note(`Cannot enable ${safeLabel}: ${reason}.`, "Plugin install");
	params.runtime.error?.(`Plugin install failed: ${sanitizeTerminalText(params.pluginId)} is disabled (${reason}).`);
	return enableResult;
}
async function installPluginFromNpmSpecWithProgress(params) {
	const safeLabel = sanitizeTerminalText(params.entry.label);
	const progress = params.prompter.progress(`Installing ${safeLabel} plugin…`);
	const updateProgress = (message) => {
		const next = sanitizeTerminalText(message).trim();
		if (!next) return;
		progress.update(next);
	};
	try {
		const result = await withTimeout(installPluginFromNpmSpec({
			spec: params.npmSpec,
			timeoutMs: ONBOARDING_PLUGIN_INSTALL_TIMEOUT_MS,
			expectedIntegrity: params.entry.install.expectedIntegrity,
			extensionsDir: resolveDefaultPluginExtensionsDir(),
			logger: {
				info: updateProgress,
				warn: (message) => {
					updateProgress(message);
					params.runtime.log?.(sanitizeTerminalText(message));
				}
			}
		}), ONBOARDING_PLUGIN_INSTALL_WATCHDOG_TIMEOUT_MS);
		if (result.ok) progress.stop(`Installed ${safeLabel} plugin`);
		else progress.stop(`Install failed: ${safeLabel}`);
		return {
			status: "completed",
			result
		};
	} catch (error) {
		if (isTimeoutError(error)) {
			progress.stop(`Install timed out: ${safeLabel}`);
			return { status: "timed_out" };
		}
		progress.stop(`Install failed: ${safeLabel}`);
		return {
			status: "completed",
			result: {
				ok: false,
				error: error instanceof Error ? error.message : String(error)
			}
		};
	}
}
async function ensureOnboardingPluginInstalled(params) {
	const { entry, prompter, runtime, workspaceDir } = params;
	let next = params.cfg;
	const allowLocal = hasGitWorkspace(workspaceDir);
	const bundledLocalPath = resolveBundledLocalPath({
		entry,
		workspaceDir
	});
	const localPath = bundledLocalPath ?? resolveLocalPath({
		entry,
		workspaceDir,
		allowLocal
	});
	const npmSpec = resolveNpmSpecForOnboarding(entry.install);
	const defaultChoice = resolveInstallDefaultChoice({
		cfg: next,
		entry,
		localPath,
		bundledLocalPath,
		hasNpmSpec: Boolean(npmSpec)
	});
	const choice = params.promptInstall === false ? defaultChoice : await promptInstallChoice({
		entry,
		localPath,
		defaultChoice,
		prompter
	});
	if (choice === "skip") return {
		cfg: next,
		installed: false,
		pluginId: entry.pluginId,
		status: "skipped"
	};
	if (choice === "local" && localPath) {
		const enableResult = await applyPluginEnablement({
			cfg: next,
			pluginId: entry.pluginId,
			label: entry.label,
			prompter,
			runtime
		});
		if (!enableResult.enabled) return {
			cfg: enableResult.config,
			installed: false,
			pluginId: entry.pluginId,
			status: "failed"
		};
		if (pathsReferToSameDirectory(localPath, bundledLocalPath)) return {
			cfg: enableResult.config,
			installed: true,
			pluginId: entry.pluginId,
			status: "installed"
		};
		next = addPluginLoadPath(enableResult.config, localPath);
		next = await recordLocalPluginInstall({
			cfg: next,
			entry,
			localPath,
			npmSpec,
			workspaceDir
		});
		return {
			cfg: next,
			installed: true,
			pluginId: entry.pluginId,
			status: "installed"
		};
	}
	if (!npmSpec) {
		await prompter.note(`No npm install source is available for ${sanitizeTerminalText(entry.label)}. Returning to selection.`, "Plugin install");
		runtime.error?.(`Plugin install failed: no npm spec available for ${sanitizeTerminalText(entry.pluginId)}.`);
		return {
			cfg: next,
			installed: false,
			pluginId: entry.pluginId,
			status: "failed"
		};
	}
	const installOutcome = await installPluginFromNpmSpecWithProgress({
		entry,
		npmSpec,
		prompter,
		runtime
	});
	if (installOutcome.status === "timed_out") {
		await prompter.note([`Installing ${sanitizeTerminalText(npmSpec)} timed out after ${formatDurationLabel(ONBOARDING_PLUGIN_INSTALL_TIMEOUT_MS)}.`, "Returning to selection."].join("\n"), "Plugin install");
		runtime.error?.(`Plugin install timed out after ${ONBOARDING_PLUGIN_INSTALL_TIMEOUT_MS}ms: ${sanitizeTerminalText(npmSpec)}`);
		return {
			cfg: next,
			installed: false,
			pluginId: entry.pluginId,
			status: "timed_out"
		};
	}
	const { result } = installOutcome;
	if (result.ok) {
		const enableResult = await applyPluginEnablement({
			cfg: next,
			pluginId: result.pluginId,
			label: entry.label,
			prompter,
			runtime
		});
		if (!enableResult.enabled) return {
			cfg: enableResult.config,
			installed: false,
			pluginId: result.pluginId,
			status: "failed"
		};
		next = enableResult.config;
		const install = {
			pluginId: result.pluginId,
			source: "npm",
			spec: npmSpec,
			installPath: result.targetDir,
			version: result.version,
			...buildNpmResolutionInstallFields(result.npmResolution)
		};
		next = recordPluginInstall(next, install);
		return {
			cfg: next,
			installed: true,
			pluginId: result.pluginId,
			status: "installed"
		};
	}
	await prompter.note([`Failed to install ${sanitizeTerminalText(npmSpec)}: ${summarizeInstallError(result.error)}`, "Returning to selection."].join("\n"), "Plugin install");
	if (localPath) {
		if (await prompter.confirm({
			message: `Use local plugin path instead? (${sanitizeTerminalText(localPath)})`,
			initialValue: true
		})) {
			const enableResult = await applyPluginEnablement({
				cfg: next,
				pluginId: entry.pluginId,
				label: entry.label,
				prompter,
				runtime
			});
			if (!enableResult.enabled) return {
				cfg: enableResult.config,
				installed: false,
				pluginId: entry.pluginId,
				status: "failed"
			};
			if (pathsReferToSameDirectory(localPath, bundledLocalPath)) return {
				cfg: enableResult.config,
				installed: true,
				pluginId: entry.pluginId,
				status: "installed"
			};
			next = addPluginLoadPath(enableResult.config, localPath);
			next = await recordLocalPluginInstall({
				cfg: next,
				entry,
				localPath,
				npmSpec,
				workspaceDir
			});
			return {
				cfg: next,
				installed: true,
				pluginId: entry.pluginId,
				status: "installed"
			};
		}
	}
	runtime.error?.(`Plugin install failed: ${sanitizeTerminalText(result.error)}`);
	return {
		cfg: next,
		installed: false,
		pluginId: entry.pluginId,
		status: "failed"
	};
}
//#endregion
export { ensureOnboardingPluginInstalled as t };
