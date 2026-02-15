import "./paths-DVBShlw6.js";
import { B as theme, u as defaultRuntime } from "./subsystem-QRNIBE7-.js";
import { C as shortenHomePath, b as resolveUserPath, t as CONFIG_DIR } from "./utils-CrauP1IK.js";
import "./pi-embedded-helpers-BMGOFUCT.js";
import "./reply-BNEkWD6b.js";
import { t as runCommandWithTimeout } from "./exec-BDyx_yxc.js";
import { c as resolveDefaultAgentId, s as resolveAgentWorkspaceDir } from "./agent-scope-DMGrQp5u.js";
import "./model-selection-D37iyQY4.js";
import "./github-copilot-token-CiF5Iyi2.js";
import { t as formatCliCommand } from "./command-format-ChfKqObn.js";
import "./boolean-BgXe2hyu.js";
import "./env-BSjH4KuP.js";
import { i as loadConfig, l as writeConfigFile } from "./config-CWifpzL_.js";
import { a as MANIFEST_KEY } from "./manifest-registry-DFR7U7LS.js";
import "./plugins-CLo5nH74.js";
import "./sessions-ezP1qtWM.js";
import "./runner-BDxtyEy4.js";
import "./image-w4Unf0wW.js";
import "./pi-model-discovery-EwKVHlZB.js";
import "./sandbox-BOXx_Lgl.js";
import "./chrome-CGPBw-bD.js";
import "./skills-Dj7GqTPz.js";
import "./routes-CyIJmYmu.js";
import "./server-context-DGqqHDqz.js";
import "./image-ops-DS83Z7J2.js";
import "./store-DFW2MnP3.js";
import "./ports-DAxLoOFv.js";
import "./message-channel-BA527_ar.js";
import "./logging-CcxUDNcI.js";
import "./accounts-DmCS3XF8.js";
import "./send-CUpDmT_F.js";
import "./send-C8AhSqO8.js";
import "./paths-BuQbsACT.js";
import "./tool-images-C7cLCz1D.js";
import "./redact-Bb36nvYe.js";
import "./tool-display-CPUH9JiE.js";
import "./fetch-_IAZS3Vz.js";
import "./deliver-BUfUVLsa.js";
import "./dispatcher-CKUm3wsK.js";
import "./send-Div41qfG.js";
import "./manager-BK_KHPSI.js";
import "./sqlite-DLuWRI0D.js";
import "./retry-UPMRcKEG.js";
import "./common-DwTaPWKf.js";
import "./ir-CGIUordM.js";
import "./render-DIvHuHqk.js";
import "./commands-registry-DBWrx0Xv.js";
import "./client-CEto0Pf6.js";
import "./call-i9290XP8.js";
import "./channel-activity-Ds_g7OEt.js";
import "./tables-1llcV3qs.js";
import "./send-oaAcLlhT.js";
import { t as formatDocsLink } from "./links-DKVbBuQN.js";
import "./progress-DitCFjx_.js";
import "./pairing-store-88eMFj2v.js";
import "./pi-tools.policy-BKT9HswJ.js";
import "./send-DbQ_i4Qf.js";
import "./onboard-helpers-tLA-tN_l.js";
import "./prompt-style-ciYaT-3f.js";
import "./pairing-labels-C_rjFixf.js";
import "./session-cost-usage-CbsU4YHL.js";
import "./nodes-screen-BeEWwXR4.js";
import "./auth-DT6fiHDK.js";
import "./control-auth-Drf7IiLj.js";
import "./control-service-BKUh8p7b.js";
import "./channel-selection-BN6_hiIf.js";
import "./delivery-queue-46I6nBfA.js";
import { a as resolvePackedRootDir, i as resolveArchiveKind, n as fileExists, r as readJsonFile, t as extractArchive } from "./archive-3RxGtdg9.js";
import { t as renderTable } from "./table-BuqaalSN.js";
import { a as parseFrontmatter, n as loadWorkspaceHookEntries, t as buildWorkspaceHookStatus } from "./hooks-status-B2nsYsXM.js";
import { t as buildPluginStatusReport } from "./status-KJxlkH62.js";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import fsPromises from "node:fs/promises";

//#region src/hooks/install.ts
const defaultLogger = {};
function unscopedPackageName(name) {
	const trimmed = name.trim();
	if (!trimmed) return trimmed;
	return trimmed.includes("/") ? trimmed.split("/").pop() ?? trimmed : trimmed;
}
function safeDirName(input) {
	const trimmed = input.trim();
	if (!trimmed) return trimmed;
	return trimmed.replaceAll("/", "__").replaceAll("\\", "__");
}
function validateHookId(hookId) {
	if (!hookId) return "invalid hook name: missing";
	if (hookId === "." || hookId === "..") return "invalid hook name: reserved path segment";
	if (hookId.includes("/") || hookId.includes("\\")) return "invalid hook name: path separators not allowed";
	return null;
}
function resolveHookInstallDir(hookId, hooksDir) {
	const hooksBase = hooksDir ? resolveUserPath(hooksDir) : path.join(CONFIG_DIR, "hooks");
	const hookIdError = validateHookId(hookId);
	if (hookIdError) throw new Error(hookIdError);
	const targetDirResult = resolveSafeInstallDir(hooksBase, hookId);
	if (!targetDirResult.ok) throw new Error(targetDirResult.error);
	return targetDirResult.path;
}
function resolveSafeInstallDir(hooksDir, hookId) {
	const targetDir = path.join(hooksDir, safeDirName(hookId));
	const resolvedBase = path.resolve(hooksDir);
	const resolvedTarget = path.resolve(targetDir);
	const relative = path.relative(resolvedBase, resolvedTarget);
	if (!relative || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) return {
		ok: false,
		error: "invalid hook name: path traversal detected"
	};
	return {
		ok: true,
		path: targetDir
	};
}
async function ensureOpenClawHooks(manifest) {
	const hooks = manifest[MANIFEST_KEY]?.hooks;
	if (!Array.isArray(hooks)) throw new Error("package.json missing openclaw.hooks");
	const list = hooks.map((e) => typeof e === "string" ? e.trim() : "").filter(Boolean);
	if (list.length === 0) throw new Error("package.json openclaw.hooks is empty");
	return list;
}
async function resolveHookNameFromDir(hookDir) {
	const hookMdPath = path.join(hookDir, "HOOK.md");
	if (!await fileExists(hookMdPath)) throw new Error(`HOOK.md missing in ${hookDir}`);
	return parseFrontmatter(await fsPromises.readFile(hookMdPath, "utf-8")).name || path.basename(hookDir);
}
async function validateHookDir(hookDir) {
	if (!await fileExists(path.join(hookDir, "HOOK.md"))) throw new Error(`HOOK.md missing in ${hookDir}`);
	if (!await Promise.all([
		"handler.ts",
		"handler.js",
		"index.ts",
		"index.js"
	].map(async (candidate) => fileExists(path.join(hookDir, candidate)))).then((results) => results.some(Boolean))) throw new Error(`handler.ts/handler.js/index.ts/index.js missing in ${hookDir}`);
}
async function installHookPackageFromDir(params) {
	const logger = params.logger ?? defaultLogger;
	const timeoutMs = params.timeoutMs ?? 12e4;
	const mode = params.mode ?? "install";
	const dryRun = params.dryRun ?? false;
	const manifestPath = path.join(params.packageDir, "package.json");
	if (!await fileExists(manifestPath)) return {
		ok: false,
		error: "package.json missing"
	};
	let manifest;
	try {
		manifest = await readJsonFile(manifestPath);
	} catch (err) {
		return {
			ok: false,
			error: `invalid package.json: ${String(err)}`
		};
	}
	let hookEntries;
	try {
		hookEntries = await ensureOpenClawHooks(manifest);
	} catch (err) {
		return {
			ok: false,
			error: String(err)
		};
	}
	const pkgName = typeof manifest.name === "string" ? manifest.name : "";
	const hookPackId = pkgName ? unscopedPackageName(pkgName) : path.basename(params.packageDir);
	const hookIdError = validateHookId(hookPackId);
	if (hookIdError) return {
		ok: false,
		error: hookIdError
	};
	if (params.expectedHookPackId && params.expectedHookPackId !== hookPackId) return {
		ok: false,
		error: `hook pack id mismatch: expected ${params.expectedHookPackId}, got ${hookPackId}`
	};
	const hooksDir = params.hooksDir ? resolveUserPath(params.hooksDir) : path.join(CONFIG_DIR, "hooks");
	await fsPromises.mkdir(hooksDir, { recursive: true });
	const targetDirResult = resolveSafeInstallDir(hooksDir, hookPackId);
	if (!targetDirResult.ok) return {
		ok: false,
		error: targetDirResult.error
	};
	const targetDir = targetDirResult.path;
	if (mode === "install" && await fileExists(targetDir)) return {
		ok: false,
		error: `hook pack already exists: ${targetDir} (delete it first)`
	};
	const resolvedHooks = [];
	for (const entry of hookEntries) {
		const hookDir = path.resolve(params.packageDir, entry);
		await validateHookDir(hookDir);
		const hookName = await resolveHookNameFromDir(hookDir);
		resolvedHooks.push(hookName);
	}
	if (dryRun) return {
		ok: true,
		hookPackId,
		hooks: resolvedHooks,
		targetDir,
		version: typeof manifest.version === "string" ? manifest.version : void 0
	};
	logger.info?.(`Installing to ${targetDir}…`);
	let backupDir = null;
	if (mode === "update" && await fileExists(targetDir)) {
		backupDir = `${targetDir}.backup-${Date.now()}`;
		await fsPromises.rename(targetDir, backupDir);
	}
	try {
		await fsPromises.cp(params.packageDir, targetDir, { recursive: true });
	} catch (err) {
		if (backupDir) {
			await fsPromises.rm(targetDir, {
				recursive: true,
				force: true
			}).catch(() => void 0);
			await fsPromises.rename(backupDir, targetDir).catch(() => void 0);
		}
		return {
			ok: false,
			error: `failed to copy hook pack: ${String(err)}`
		};
	}
	const deps = manifest.dependencies ?? {};
	if (Object.keys(deps).length > 0) {
		logger.info?.("Installing hook pack dependencies…");
		const npmRes = await runCommandWithTimeout([
			"npm",
			"install",
			"--omit=dev",
			"--silent",
			"--ignore-scripts"
		], {
			timeoutMs: Math.max(timeoutMs, 3e5),
			cwd: targetDir
		});
		if (npmRes.code !== 0) {
			if (backupDir) {
				await fsPromises.rm(targetDir, {
					recursive: true,
					force: true
				}).catch(() => void 0);
				await fsPromises.rename(backupDir, targetDir).catch(() => void 0);
			}
			return {
				ok: false,
				error: `npm install failed: ${npmRes.stderr.trim() || npmRes.stdout.trim()}`
			};
		}
	}
	if (backupDir) await fsPromises.rm(backupDir, {
		recursive: true,
		force: true
	}).catch(() => void 0);
	return {
		ok: true,
		hookPackId,
		hooks: resolvedHooks,
		targetDir,
		version: typeof manifest.version === "string" ? manifest.version : void 0
	};
}
async function installHookFromDir(params) {
	const logger = params.logger ?? defaultLogger;
	const mode = params.mode ?? "install";
	const dryRun = params.dryRun ?? false;
	await validateHookDir(params.hookDir);
	const hookName = await resolveHookNameFromDir(params.hookDir);
	const hookIdError = validateHookId(hookName);
	if (hookIdError) return {
		ok: false,
		error: hookIdError
	};
	if (params.expectedHookPackId && params.expectedHookPackId !== hookName) return {
		ok: false,
		error: `hook id mismatch: expected ${params.expectedHookPackId}, got ${hookName}`
	};
	const hooksDir = params.hooksDir ? resolveUserPath(params.hooksDir) : path.join(CONFIG_DIR, "hooks");
	await fsPromises.mkdir(hooksDir, { recursive: true });
	const targetDirResult = resolveSafeInstallDir(hooksDir, hookName);
	if (!targetDirResult.ok) return {
		ok: false,
		error: targetDirResult.error
	};
	const targetDir = targetDirResult.path;
	if (mode === "install" && await fileExists(targetDir)) return {
		ok: false,
		error: `hook already exists: ${targetDir} (delete it first)`
	};
	if (dryRun) return {
		ok: true,
		hookPackId: hookName,
		hooks: [hookName],
		targetDir
	};
	logger.info?.(`Installing to ${targetDir}…`);
	let backupDir = null;
	if (mode === "update" && await fileExists(targetDir)) {
		backupDir = `${targetDir}.backup-${Date.now()}`;
		await fsPromises.rename(targetDir, backupDir);
	}
	try {
		await fsPromises.cp(params.hookDir, targetDir, { recursive: true });
	} catch (err) {
		if (backupDir) {
			await fsPromises.rm(targetDir, {
				recursive: true,
				force: true
			}).catch(() => void 0);
			await fsPromises.rename(backupDir, targetDir).catch(() => void 0);
		}
		return {
			ok: false,
			error: `failed to copy hook: ${String(err)}`
		};
	}
	if (backupDir) await fsPromises.rm(backupDir, {
		recursive: true,
		force: true
	}).catch(() => void 0);
	return {
		ok: true,
		hookPackId: hookName,
		hooks: [hookName],
		targetDir
	};
}
async function installHooksFromArchive(params) {
	const logger = params.logger ?? defaultLogger;
	const timeoutMs = params.timeoutMs ?? 12e4;
	const archivePath = resolveUserPath(params.archivePath);
	if (!await fileExists(archivePath)) return {
		ok: false,
		error: `archive not found: ${archivePath}`
	};
	if (!resolveArchiveKind(archivePath)) return {
		ok: false,
		error: `unsupported archive: ${archivePath}`
	};
	const tmpDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), "openclaw-hook-"));
	const extractDir = path.join(tmpDir, "extract");
	await fsPromises.mkdir(extractDir, { recursive: true });
	logger.info?.(`Extracting ${archivePath}…`);
	try {
		await extractArchive({
			archivePath,
			destDir: extractDir,
			timeoutMs,
			logger
		});
	} catch (err) {
		return {
			ok: false,
			error: `failed to extract archive: ${String(err)}`
		};
	}
	let rootDir = "";
	try {
		rootDir = await resolvePackedRootDir(extractDir);
	} catch (err) {
		return {
			ok: false,
			error: String(err)
		};
	}
	if (await fileExists(path.join(rootDir, "package.json"))) return await installHookPackageFromDir({
		packageDir: rootDir,
		hooksDir: params.hooksDir,
		timeoutMs,
		logger,
		mode: params.mode,
		dryRun: params.dryRun,
		expectedHookPackId: params.expectedHookPackId
	});
	return await installHookFromDir({
		hookDir: rootDir,
		hooksDir: params.hooksDir,
		logger,
		mode: params.mode,
		dryRun: params.dryRun,
		expectedHookPackId: params.expectedHookPackId
	});
}
async function installHooksFromNpmSpec(params) {
	const logger = params.logger ?? defaultLogger;
	const timeoutMs = params.timeoutMs ?? 12e4;
	const mode = params.mode ?? "install";
	const dryRun = params.dryRun ?? false;
	const expectedHookPackId = params.expectedHookPackId;
	const spec = params.spec.trim();
	if (!spec) return {
		ok: false,
		error: "missing npm spec"
	};
	const tmpDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), "openclaw-hook-pack-"));
	logger.info?.(`Downloading ${spec}…`);
	const res = await runCommandWithTimeout([
		"npm",
		"pack",
		spec
	], {
		timeoutMs: Math.max(timeoutMs, 3e5),
		cwd: tmpDir,
		env: { COREPACK_ENABLE_DOWNLOAD_PROMPT: "0" }
	});
	if (res.code !== 0) return {
		ok: false,
		error: `npm pack failed: ${res.stderr.trim() || res.stdout.trim()}`
	};
	const packed = (res.stdout || "").split("\n").map((l) => l.trim()).filter(Boolean).pop();
	if (!packed) return {
		ok: false,
		error: "npm pack produced no archive"
	};
	return await installHooksFromArchive({
		archivePath: path.join(tmpDir, packed),
		hooksDir: params.hooksDir,
		timeoutMs,
		logger,
		mode,
		dryRun,
		expectedHookPackId
	});
}
async function installHooksFromPath(params) {
	const resolved = resolveUserPath(params.path);
	if (!await fileExists(resolved)) return {
		ok: false,
		error: `path not found: ${resolved}`
	};
	if ((await fsPromises.stat(resolved)).isDirectory()) {
		if (await fileExists(path.join(resolved, "package.json"))) return await installHookPackageFromDir({
			packageDir: resolved,
			hooksDir: params.hooksDir,
			timeoutMs: params.timeoutMs,
			logger: params.logger,
			mode: params.mode,
			dryRun: params.dryRun,
			expectedHookPackId: params.expectedHookPackId
		});
		return await installHookFromDir({
			hookDir: resolved,
			hooksDir: params.hooksDir,
			logger: params.logger,
			mode: params.mode,
			dryRun: params.dryRun,
			expectedHookPackId: params.expectedHookPackId
		});
	}
	if (!resolveArchiveKind(resolved)) return {
		ok: false,
		error: `unsupported hook file: ${resolved}`
	};
	return await installHooksFromArchive({
		archivePath: resolved,
		hooksDir: params.hooksDir,
		timeoutMs: params.timeoutMs,
		logger: params.logger,
		mode: params.mode,
		dryRun: params.dryRun,
		expectedHookPackId: params.expectedHookPackId
	});
}

//#endregion
//#region src/hooks/installs.ts
function recordHookInstall(cfg, update) {
	const { hookId, ...record } = update;
	const installs = {
		...cfg.hooks?.internal?.installs,
		[hookId]: {
			...cfg.hooks?.internal?.installs?.[hookId],
			...record,
			installedAt: record.installedAt ?? (/* @__PURE__ */ new Date()).toISOString()
		}
	};
	return {
		...cfg,
		hooks: {
			...cfg.hooks,
			internal: {
				...cfg.hooks?.internal,
				installs: {
					...installs,
					[hookId]: installs[hookId]
				}
			}
		}
	};
}

//#endregion
//#region src/cli/hooks-cli.ts
function mergeHookEntries(pluginEntries, workspaceEntries) {
	const merged = /* @__PURE__ */ new Map();
	for (const entry of pluginEntries) merged.set(entry.hook.name, entry);
	for (const entry of workspaceEntries) merged.set(entry.hook.name, entry);
	return Array.from(merged.values());
}
function buildHooksReport(config) {
	const workspaceDir = resolveAgentWorkspaceDir(config, resolveDefaultAgentId(config));
	const workspaceEntries = loadWorkspaceHookEntries(workspaceDir, { config });
	return buildWorkspaceHookStatus(workspaceDir, {
		config,
		entries: mergeHookEntries(buildPluginStatusReport({
			config,
			workspaceDir
		}).hooks.map((hook) => hook.entry), workspaceEntries)
	});
}
function formatHookStatus(hook) {
	if (hook.eligible) return theme.success("✓ ready");
	if (hook.disabled) return theme.warn("⏸ disabled");
	return theme.error("✗ missing");
}
function formatHookName(hook) {
	return `${hook.emoji ?? "🔗"} ${theme.command(hook.name)}`;
}
function formatHookSource(hook) {
	if (!hook.managedByPlugin) return hook.source;
	return `plugin:${hook.pluginId ?? "unknown"}`;
}
function formatHookMissingSummary(hook) {
	const missing = [];
	if (hook.missing.bins.length > 0) missing.push(`bins: ${hook.missing.bins.join(", ")}`);
	if (hook.missing.anyBins.length > 0) missing.push(`anyBins: ${hook.missing.anyBins.join(", ")}`);
	if (hook.missing.env.length > 0) missing.push(`env: ${hook.missing.env.join(", ")}`);
	if (hook.missing.config.length > 0) missing.push(`config: ${hook.missing.config.join(", ")}`);
	if (hook.missing.os.length > 0) missing.push(`os: ${hook.missing.os.join(", ")}`);
	return missing.join("; ");
}
async function readInstalledPackageVersion(dir) {
	try {
		const raw = await fsPromises.readFile(path.join(dir, "package.json"), "utf-8");
		const parsed = JSON.parse(raw);
		return typeof parsed.version === "string" ? parsed.version : void 0;
	} catch {
		return;
	}
}
/**
* Format the hooks list output
*/
function formatHooksList(report, opts) {
	const hooks = opts.eligible ? report.hooks.filter((h) => h.eligible) : report.hooks;
	if (opts.json) {
		const jsonReport = {
			workspaceDir: report.workspaceDir,
			managedHooksDir: report.managedHooksDir,
			hooks: hooks.map((h) => ({
				name: h.name,
				description: h.description,
				emoji: h.emoji,
				eligible: h.eligible,
				disabled: h.disabled,
				source: h.source,
				pluginId: h.pluginId,
				events: h.events,
				homepage: h.homepage,
				missing: h.missing,
				managedByPlugin: h.managedByPlugin
			}))
		};
		return JSON.stringify(jsonReport, null, 2);
	}
	if (hooks.length === 0) return opts.eligible ? `No eligible hooks found. Run \`${formatCliCommand("openclaw hooks list")}\` to see all hooks.` : "No hooks found.";
	const eligible = hooks.filter((h) => h.eligible);
	const tableWidth = Math.max(60, (process.stdout.columns ?? 120) - 1);
	const rows = hooks.map((hook) => {
		const missing = formatHookMissingSummary(hook);
		return {
			Status: formatHookStatus(hook),
			Hook: formatHookName(hook),
			Description: theme.muted(hook.description),
			Source: formatHookSource(hook),
			Missing: missing ? theme.warn(missing) : ""
		};
	});
	const columns = [
		{
			key: "Status",
			header: "Status",
			minWidth: 10
		},
		{
			key: "Hook",
			header: "Hook",
			minWidth: 18,
			flex: true
		},
		{
			key: "Description",
			header: "Description",
			minWidth: 24,
			flex: true
		},
		{
			key: "Source",
			header: "Source",
			minWidth: 12,
			flex: true
		}
	];
	if (opts.verbose) columns.push({
		key: "Missing",
		header: "Missing",
		minWidth: 18,
		flex: true
	});
	const lines = [];
	lines.push(`${theme.heading("Hooks")} ${theme.muted(`(${eligible.length}/${hooks.length} ready)`)}`);
	lines.push(renderTable({
		width: tableWidth,
		columns,
		rows
	}).trimEnd());
	return lines.join("\n");
}
/**
* Format detailed info for a single hook
*/
function formatHookInfo(report, hookName, opts) {
	const hook = report.hooks.find((h) => h.name === hookName || h.hookKey === hookName);
	if (!hook) {
		if (opts.json) return JSON.stringify({
			error: "not found",
			hook: hookName
		}, null, 2);
		return `Hook "${hookName}" not found. Run \`${formatCliCommand("openclaw hooks list")}\` to see available hooks.`;
	}
	if (opts.json) return JSON.stringify(hook, null, 2);
	const lines = [];
	const emoji = hook.emoji ?? "🔗";
	const status = hook.eligible ? theme.success("✓ Ready") : hook.disabled ? theme.warn("⏸ Disabled") : theme.error("✗ Missing requirements");
	lines.push(`${emoji} ${theme.heading(hook.name)} ${status}`);
	lines.push("");
	lines.push(hook.description);
	lines.push("");
	lines.push(theme.heading("Details:"));
	if (hook.managedByPlugin) lines.push(`${theme.muted("  Source:")} ${hook.source} (${hook.pluginId ?? "unknown"})`);
	else lines.push(`${theme.muted("  Source:")} ${hook.source}`);
	lines.push(`${theme.muted("  Path:")} ${shortenHomePath(hook.filePath)}`);
	lines.push(`${theme.muted("  Handler:")} ${shortenHomePath(hook.handlerPath)}`);
	if (hook.homepage) lines.push(`${theme.muted("  Homepage:")} ${hook.homepage}`);
	if (hook.events.length > 0) lines.push(`${theme.muted("  Events:")} ${hook.events.join(", ")}`);
	if (hook.managedByPlugin) lines.push(theme.muted("  Managed by plugin; enable/disable via hooks CLI not available."));
	if (hook.requirements.bins.length > 0 || hook.requirements.anyBins.length > 0 || hook.requirements.env.length > 0 || hook.requirements.config.length > 0 || hook.requirements.os.length > 0) {
		lines.push("");
		lines.push(theme.heading("Requirements:"));
		if (hook.requirements.bins.length > 0) {
			const binsStatus = hook.requirements.bins.map((bin) => {
				return hook.missing.bins.includes(bin) ? theme.error(`✗ ${bin}`) : theme.success(`✓ ${bin}`);
			});
			lines.push(`${theme.muted("  Binaries:")} ${binsStatus.join(", ")}`);
		}
		if (hook.requirements.anyBins.length > 0) {
			const anyBinsStatus = hook.missing.anyBins.length > 0 ? theme.error(`✗ (any of: ${hook.requirements.anyBins.join(", ")})`) : theme.success(`✓ (any of: ${hook.requirements.anyBins.join(", ")})`);
			lines.push(`${theme.muted("  Any binary:")} ${anyBinsStatus}`);
		}
		if (hook.requirements.env.length > 0) {
			const envStatus = hook.requirements.env.map((env) => {
				return hook.missing.env.includes(env) ? theme.error(`✗ ${env}`) : theme.success(`✓ ${env}`);
			});
			lines.push(`${theme.muted("  Environment:")} ${envStatus.join(", ")}`);
		}
		if (hook.requirements.config.length > 0) {
			const configStatus = hook.configChecks.map((check) => {
				return check.satisfied ? theme.success(`✓ ${check.path}`) : theme.error(`✗ ${check.path}`);
			});
			lines.push(`${theme.muted("  Config:")} ${configStatus.join(", ")}`);
		}
		if (hook.requirements.os.length > 0) {
			const osStatus = hook.missing.os.length > 0 ? theme.error(`✗ (${hook.requirements.os.join(", ")})`) : theme.success(`✓ (${hook.requirements.os.join(", ")})`);
			lines.push(`${theme.muted("  OS:")} ${osStatus}`);
		}
	}
	return lines.join("\n");
}
/**
* Format check output
*/
function formatHooksCheck(report, opts) {
	if (opts.json) {
		const eligible = report.hooks.filter((h) => h.eligible);
		const notEligible = report.hooks.filter((h) => !h.eligible);
		return JSON.stringify({
			total: report.hooks.length,
			eligible: eligible.length,
			notEligible: notEligible.length,
			hooks: {
				eligible: eligible.map((h) => h.name),
				notEligible: notEligible.map((h) => ({
					name: h.name,
					missing: h.missing
				}))
			}
		}, null, 2);
	}
	const eligible = report.hooks.filter((h) => h.eligible);
	const notEligible = report.hooks.filter((h) => !h.eligible);
	const lines = [];
	lines.push(theme.heading("Hooks Status"));
	lines.push("");
	lines.push(`${theme.muted("Total hooks:")} ${report.hooks.length}`);
	lines.push(`${theme.success("Ready:")} ${eligible.length}`);
	lines.push(`${theme.warn("Not ready:")} ${notEligible.length}`);
	if (notEligible.length > 0) {
		lines.push("");
		lines.push(theme.heading("Hooks not ready:"));
		for (const hook of notEligible) {
			const reasons = [];
			if (hook.disabled) reasons.push("disabled");
			if (hook.missing.bins.length > 0) reasons.push(`bins: ${hook.missing.bins.join(", ")}`);
			if (hook.missing.anyBins.length > 0) reasons.push(`anyBins: ${hook.missing.anyBins.join(", ")}`);
			if (hook.missing.env.length > 0) reasons.push(`env: ${hook.missing.env.join(", ")}`);
			if (hook.missing.config.length > 0) reasons.push(`config: ${hook.missing.config.join(", ")}`);
			if (hook.missing.os.length > 0) reasons.push(`os: ${hook.missing.os.join(", ")}`);
			lines.push(`  ${hook.emoji ?? "🔗"} ${hook.name} - ${reasons.join("; ")}`);
		}
	}
	return lines.join("\n");
}
async function enableHook(hookName) {
	const config = loadConfig();
	const hook = buildHooksReport(config).hooks.find((h) => h.name === hookName);
	if (!hook) throw new Error(`Hook "${hookName}" not found`);
	if (hook.managedByPlugin) throw new Error(`Hook "${hookName}" is managed by plugin "${hook.pluginId ?? "unknown"}" and cannot be enabled/disabled.`);
	if (!hook.eligible) throw new Error(`Hook "${hookName}" is not eligible (missing requirements)`);
	const entries = { ...config.hooks?.internal?.entries };
	entries[hookName] = {
		...entries[hookName],
		enabled: true
	};
	await writeConfigFile({
		...config,
		hooks: {
			...config.hooks,
			internal: {
				...config.hooks?.internal,
				enabled: true,
				entries
			}
		}
	});
	defaultRuntime.log(`${theme.success("✓")} Enabled hook: ${hook.emoji ?? "🔗"} ${theme.command(hookName)}`);
}
async function disableHook(hookName) {
	const config = loadConfig();
	const hook = buildHooksReport(config).hooks.find((h) => h.name === hookName);
	if (!hook) throw new Error(`Hook "${hookName}" not found`);
	if (hook.managedByPlugin) throw new Error(`Hook "${hookName}" is managed by plugin "${hook.pluginId ?? "unknown"}" and cannot be enabled/disabled.`);
	const entries = { ...config.hooks?.internal?.entries };
	entries[hookName] = {
		...entries[hookName],
		enabled: false
	};
	await writeConfigFile({
		...config,
		hooks: {
			...config.hooks,
			internal: {
				...config.hooks?.internal,
				entries
			}
		}
	});
	defaultRuntime.log(`${theme.warn("⏸")} Disabled hook: ${hook.emoji ?? "🔗"} ${theme.command(hookName)}`);
}
function registerHooksCli(program) {
	const hooks = program.command("hooks").description("Manage internal agent hooks").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/hooks", "docs.openclaw.ai/cli/hooks")}\n`);
	hooks.command("list").description("List all hooks").option("--eligible", "Show only eligible hooks", false).option("--json", "Output as JSON", false).option("-v, --verbose", "Show more details including missing requirements", false).action(async (opts) => {
		try {
			const report = buildHooksReport(loadConfig());
			defaultRuntime.log(formatHooksList(report, opts));
		} catch (err) {
			defaultRuntime.error(`${theme.error("Error:")} ${err instanceof Error ? err.message : String(err)}`);
			process.exit(1);
		}
	});
	hooks.command("info <name>").description("Show detailed information about a hook").option("--json", "Output as JSON", false).action(async (name, opts) => {
		try {
			const report = buildHooksReport(loadConfig());
			defaultRuntime.log(formatHookInfo(report, name, opts));
		} catch (err) {
			defaultRuntime.error(`${theme.error("Error:")} ${err instanceof Error ? err.message : String(err)}`);
			process.exit(1);
		}
	});
	hooks.command("check").description("Check hooks eligibility status").option("--json", "Output as JSON", false).action(async (opts) => {
		try {
			const report = buildHooksReport(loadConfig());
			defaultRuntime.log(formatHooksCheck(report, opts));
		} catch (err) {
			defaultRuntime.error(`${theme.error("Error:")} ${err instanceof Error ? err.message : String(err)}`);
			process.exit(1);
		}
	});
	hooks.command("enable <name>").description("Enable a hook").action(async (name) => {
		try {
			await enableHook(name);
		} catch (err) {
			defaultRuntime.error(`${theme.error("Error:")} ${err instanceof Error ? err.message : String(err)}`);
			process.exit(1);
		}
	});
	hooks.command("disable <name>").description("Disable a hook").action(async (name) => {
		try {
			await disableHook(name);
		} catch (err) {
			defaultRuntime.error(`${theme.error("Error:")} ${err instanceof Error ? err.message : String(err)}`);
			process.exit(1);
		}
	});
	hooks.command("install").description("Install a hook pack (path, archive, or npm spec)").argument("<path-or-spec>", "Path to a hook pack or npm package spec").option("-l, --link", "Link a local path instead of copying", false).action(async (raw, opts) => {
		const resolved = resolveUserPath(raw);
		const cfg = loadConfig();
		if (fs.existsSync(resolved)) {
			if (opts.link) {
				if (!fs.statSync(resolved).isDirectory()) {
					defaultRuntime.error("Linked hook paths must be directories.");
					process.exit(1);
				}
				const existing = cfg.hooks?.internal?.load?.extraDirs ?? [];
				const merged = Array.from(new Set([...existing, resolved]));
				const probe = await installHooksFromPath({
					path: resolved,
					dryRun: true
				});
				if (!probe.ok) {
					defaultRuntime.error(probe.error);
					process.exit(1);
				}
				let next = {
					...cfg,
					hooks: {
						...cfg.hooks,
						internal: {
							...cfg.hooks?.internal,
							enabled: true,
							load: {
								...cfg.hooks?.internal?.load,
								extraDirs: merged
							}
						}
					}
				};
				for (const hookName of probe.hooks) next = {
					...next,
					hooks: {
						...next.hooks,
						internal: {
							...next.hooks?.internal,
							entries: {
								...next.hooks?.internal?.entries,
								[hookName]: {
									...next.hooks?.internal?.entries?.[hookName],
									enabled: true
								}
							}
						}
					}
				};
				next = recordHookInstall(next, {
					hookId: probe.hookPackId,
					source: "path",
					sourcePath: resolved,
					installPath: resolved,
					version: probe.version,
					hooks: probe.hooks
				});
				await writeConfigFile(next);
				defaultRuntime.log(`Linked hook path: ${shortenHomePath(resolved)}`);
				defaultRuntime.log(`Restart the gateway to load hooks.`);
				return;
			}
			const result = await installHooksFromPath({
				path: resolved,
				logger: {
					info: (msg) => defaultRuntime.log(msg),
					warn: (msg) => defaultRuntime.log(theme.warn(msg))
				}
			});
			if (!result.ok) {
				defaultRuntime.error(result.error);
				process.exit(1);
			}
			let next = {
				...cfg,
				hooks: {
					...cfg.hooks,
					internal: {
						...cfg.hooks?.internal,
						enabled: true,
						entries: { ...cfg.hooks?.internal?.entries }
					}
				}
			};
			for (const hookName of result.hooks) next = {
				...next,
				hooks: {
					...next.hooks,
					internal: {
						...next.hooks?.internal,
						entries: {
							...next.hooks?.internal?.entries,
							[hookName]: {
								...next.hooks?.internal?.entries?.[hookName],
								enabled: true
							}
						}
					}
				}
			};
			const source = resolveArchiveKind(resolved) ? "archive" : "path";
			next = recordHookInstall(next, {
				hookId: result.hookPackId,
				source,
				sourcePath: resolved,
				installPath: result.targetDir,
				version: result.version,
				hooks: result.hooks
			});
			await writeConfigFile(next);
			defaultRuntime.log(`Installed hooks: ${result.hooks.join(", ")}`);
			defaultRuntime.log(`Restart the gateway to load hooks.`);
			return;
		}
		if (opts.link) {
			defaultRuntime.error("`--link` requires a local path.");
			process.exit(1);
		}
		if (raw.startsWith(".") || raw.startsWith("~") || path.isAbsolute(raw) || raw.endsWith(".zip") || raw.endsWith(".tgz") || raw.endsWith(".tar.gz") || raw.endsWith(".tar")) {
			defaultRuntime.error(`Path not found: ${resolved}`);
			process.exit(1);
		}
		const result = await installHooksFromNpmSpec({
			spec: raw,
			logger: {
				info: (msg) => defaultRuntime.log(msg),
				warn: (msg) => defaultRuntime.log(theme.warn(msg))
			}
		});
		if (!result.ok) {
			defaultRuntime.error(result.error);
			process.exit(1);
		}
		let next = {
			...cfg,
			hooks: {
				...cfg.hooks,
				internal: {
					...cfg.hooks?.internal,
					enabled: true,
					entries: { ...cfg.hooks?.internal?.entries }
				}
			}
		};
		for (const hookName of result.hooks) next = {
			...next,
			hooks: {
				...next.hooks,
				internal: {
					...next.hooks?.internal,
					entries: {
						...next.hooks?.internal?.entries,
						[hookName]: {
							...next.hooks?.internal?.entries?.[hookName],
							enabled: true
						}
					}
				}
			}
		};
		next = recordHookInstall(next, {
			hookId: result.hookPackId,
			source: "npm",
			spec: raw,
			installPath: result.targetDir,
			version: result.version,
			hooks: result.hooks
		});
		await writeConfigFile(next);
		defaultRuntime.log(`Installed hooks: ${result.hooks.join(", ")}`);
		defaultRuntime.log(`Restart the gateway to load hooks.`);
	});
	hooks.command("update").description("Update installed hooks (npm installs only)").argument("[id]", "Hook pack id (omit with --all)").option("--all", "Update all tracked hooks", false).option("--dry-run", "Show what would change without writing", false).action(async (id, opts) => {
		const cfg = loadConfig();
		const installs = cfg.hooks?.internal?.installs ?? {};
		const targets = opts.all ? Object.keys(installs) : id ? [id] : [];
		if (targets.length === 0) {
			defaultRuntime.error("Provide a hook id or use --all.");
			process.exit(1);
		}
		let nextCfg = cfg;
		let updatedCount = 0;
		for (const hookId of targets) {
			const record = installs[hookId];
			if (!record) {
				defaultRuntime.log(theme.warn(`No install record for "${hookId}".`));
				continue;
			}
			if (record.source !== "npm") {
				defaultRuntime.log(theme.warn(`Skipping "${hookId}" (source: ${record.source}).`));
				continue;
			}
			if (!record.spec) {
				defaultRuntime.log(theme.warn(`Skipping "${hookId}" (missing npm spec).`));
				continue;
			}
			let installPath;
			try {
				installPath = record.installPath ?? resolveHookInstallDir(hookId);
			} catch (err) {
				defaultRuntime.log(theme.error(`Invalid install path for "${hookId}": ${String(err)}`));
				continue;
			}
			const currentVersion = await readInstalledPackageVersion(installPath);
			if (opts.dryRun) {
				const probe = await installHooksFromNpmSpec({
					spec: record.spec,
					mode: "update",
					dryRun: true,
					expectedHookPackId: hookId,
					logger: {
						info: (msg) => defaultRuntime.log(msg),
						warn: (msg) => defaultRuntime.log(theme.warn(msg))
					}
				});
				if (!probe.ok) {
					defaultRuntime.log(theme.error(`Failed to check ${hookId}: ${probe.error}`));
					continue;
				}
				const nextVersion = probe.version ?? "unknown";
				const currentLabel = currentVersion ?? "unknown";
				if (currentVersion && probe.version && currentVersion === probe.version) defaultRuntime.log(`${hookId} is up to date (${currentLabel}).`);
				else defaultRuntime.log(`Would update ${hookId}: ${currentLabel} → ${nextVersion}.`);
				continue;
			}
			const result = await installHooksFromNpmSpec({
				spec: record.spec,
				mode: "update",
				expectedHookPackId: hookId,
				logger: {
					info: (msg) => defaultRuntime.log(msg),
					warn: (msg) => defaultRuntime.log(theme.warn(msg))
				}
			});
			if (!result.ok) {
				defaultRuntime.log(theme.error(`Failed to update ${hookId}: ${result.error}`));
				continue;
			}
			const nextVersion = result.version ?? await readInstalledPackageVersion(result.targetDir);
			nextCfg = recordHookInstall(nextCfg, {
				hookId,
				source: "npm",
				spec: record.spec,
				installPath: result.targetDir,
				version: nextVersion,
				hooks: result.hooks
			});
			updatedCount += 1;
			const currentLabel = currentVersion ?? "unknown";
			const nextLabel = nextVersion ?? "unknown";
			if (currentVersion && nextVersion && currentVersion === nextVersion) defaultRuntime.log(`${hookId} already at ${currentLabel}.`);
			else defaultRuntime.log(`Updated ${hookId}: ${currentLabel} → ${nextLabel}.`);
		}
		if (updatedCount > 0) {
			await writeConfigFile(nextCfg);
			defaultRuntime.log("Restart the gateway to load hooks.");
		}
	});
	hooks.action(async () => {
		try {
			const report = buildHooksReport(loadConfig());
			defaultRuntime.log(formatHooksList(report, {}));
		} catch (err) {
			defaultRuntime.error(`${theme.error("Error:")} ${err instanceof Error ? err.message : String(err)}`);
			process.exit(1);
		}
	});
}

//#endregion
export { registerHooksCli };