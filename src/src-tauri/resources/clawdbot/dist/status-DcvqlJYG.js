import { n as DEFAULT_GATEWAY_PORT, u as resolveGatewayPort } from "./paths-DVBShlw6.js";
import { B as theme, d as restoreTerminalState, k as info, u as defaultRuntime, z as isRich } from "./subsystem-QRNIBE7-.js";
import { b as resolveUserPath, g as pathExists, w as sleep } from "./utils-CrauP1IK.js";
import { At as getRemoteSkillEligibility, Er as peekSystemEvents, _ as listAgentsForGateway, a as buildChannelSummary, bt as loadProviderUsageSummary, et as readRestartSentinel, kn as getMemorySearchManager, p as sha256HexPrefix, tt as summarizeRestartSentinel, xt as formatUsageReportLines, yr as lookupContextTokens } from "./reply-BNEkWD6b.js";
import { l as normalizeAgentId, y as parseAgentSessionKey } from "./session-key-BWxPj0z_.js";
import { n as runExec } from "./exec-BDyx_yxc.js";
import { t as resolveOpenClawPackageRoot } from "./openclaw-root-CnzGNXsk.js";
import { c as resolveDefaultAgentId, h as DEFAULT_IDENTITY_FILENAME, p as DEFAULT_BOOTSTRAP_FILENAME, r as resolveAgentDir, s as resolveAgentWorkspaceDir } from "./agent-scope-DMGrQp5u.js";
import { Ct as ensureAuthProfileStore, Ft as DEFAULT_CONTEXT_TOKENS, It as DEFAULT_MODEL, Lt as DEFAULT_PROVIDER, d as resolveConfiguredModelRef } from "./model-selection-D37iyQY4.js";
import { r as resolveCliName, t as formatCliCommand } from "./command-format-ChfKqObn.js";
import { F as VERSION, i as loadConfig, l as writeConfigFile, o as readConfigFileSnapshot } from "./config-CWifpzL_.js";
import { n as listChannelPlugins } from "./plugins-CLo5nH74.js";
import { M as resolveMainSessionKey, O as resolveFreshSessionTotalTokens, i as loadSessionStore } from "./sessions-ezP1qtWM.js";
import { a as inspectPortUsage, o as resolveLsofCommandSync, s as formatPortDiagnostics } from "./ports-DAxLoOFv.js";
import { c as resolveStorePath } from "./paths-BuQbsACT.js";
import { n as callGateway, t as buildGatewayConnectionDetails } from "./call-i9290XP8.js";
import { r as formatDurationPrecise } from "./format-duration-Bo9zNKwO.js";
import { n as formatTimeAgo } from "./format-relative-Bc_rVyZs.js";
import { n as withProgress } from "./progress-DitCFjx_.js";
import { S as normalizeControlUiBasePath, _ as summarizeExistingConfig, a as ensureWorkspaceAndSessions, c as handleReset, d as openUrl, f as printWizardHeader, h as resolveControlUiLinks, i as detectBrowserOpenSupport, m as randomToken, n as applyWizardMetadata, o as formatControlUiSshHint, p as probeGatewayReachable, t as DEFAULT_WORKSPACE, u as normalizeGatewayTokenInput, v as validateGatewayPasswordInput, y as waitForGatewayReachable } from "./onboard-helpers-tLA-tN_l.js";
import { h as readTailscaleStatusJson, m as getTailnetHostname, p as findTailscaleBinary } from "./auth-DT6fiHDK.js";
import { a as gatewayInstallErrorHint, i as buildGatewayInstallPlan, n as GATEWAY_DAEMON_RUNTIME_OPTIONS, t as DEFAULT_GATEWAY_DAEMON_RUNTIME } from "./daemon-runtime-sITO6h1s.js";
import { t as resolveChannelDefaultAccountId } from "./helpers-28CRTwys.js";
import { n as logConfigUpdated } from "./logging-BYdFQAju.js";
import { t as WizardCancelledError } from "./prompts-BEHxUC3w.js";
import { S as promptAuthChoiceGrouped, _ as applyAuthChoice, c as promptCustomApiConfig, f as applyPrimaryModel, g as warnIfModelConfigLooksOff, h as resolvePreferredProviderForAuthChoice, p as promptDefaultModel, r as promptRemoteGatewayConfig, t as setupSkills } from "./onboard-skills-BBfEXIps.js";
import { n as setupChannels } from "./onboard-channels-0nZkyjjM.js";
import { c as formatHealthCheckFailure, i as resolveHeartbeatSummaryForAgent, l as ensureControlUiAssetsBuilt, r as healthCommand, t as formatHealthChannelLines } from "./health-Cb5plNjz.js";
import { o as resolveGatewayLogPaths, t as resolveGatewayService } from "./service-CMKWaXkp.js";
import { r as isSystemdUserServiceAvailable } from "./systemd-CFcBM6Sc.js";
import { t as buildWorkspaceSkillStatus } from "./skills-status-CRbYCH-J.js";
import { r as installCompletion } from "./completion-cli-D7hv-tR8.js";
import { C as ensureCompletionCacheExists, b as resolveEffectiveUpdateChannel, d as checkUpdateStatus, f as compareSemverStrings, i as resolveUpdateAvailability, n as formatUpdateOneLiner, r as getUpdateCheckResult, t as formatUpdateAvailableHint, v as formatUpdateChannelLabel, x as checkShellCompletionStatus, y as normalizeUpdateChannel } from "./status.update-CWTIGg6J.js";
import { o as readLastGatewayErrorLine } from "./service-audit-t42gxcdN.js";
import { t as collectChannelStatusIssues } from "./channels-status-issues-Cuirza--.js";
import { t as renderTable } from "./table-BuqaalSN.js";
import { t as buildWorkspaceHookStatus } from "./hooks-status-B2nsYsXM.js";
import { t as runTui } from "./tui-CMbEG2YE.js";
import { o as probeGateway, t as runSecurityAudit } from "./audit-CeiPGqWs.js";
import { t as resolveNodeService } from "./node-service-CAYdczqI.js";
import { n as redactSecrets, t as formatGatewayAuthUsed } from "./format-DDo_iNRW.js";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import fsPromises from "node:fs/promises";
import { execFileSync, spawnSync } from "node:child_process";

//#region src/cli/ports.ts
function parseLsofOutput(output) {
	const lines = output.split(/\r?\n/).filter(Boolean);
	const results = [];
	let current = {};
	for (const line of lines) if (line.startsWith("p")) {
		if (current.pid) results.push(current);
		current = { pid: Number.parseInt(line.slice(1), 10) };
	} else if (line.startsWith("c")) current.command = line.slice(1);
	if (current.pid) results.push(current);
	return results;
}
function listPortListeners(port) {
	try {
		return parseLsofOutput(execFileSync(resolveLsofCommandSync(), [
			"-nP",
			`-iTCP:${port}`,
			"-sTCP:LISTEN",
			"-FpFc"
		], { encoding: "utf-8" }));
	} catch (err) {
		const status = err.status;
		if (err.code === "ENOENT") throw new Error("lsof not found; required for --force", { cause: err });
		if (status === 1) return [];
		throw err instanceof Error ? err : new Error(String(err));
	}
}
function forceFreePort(port) {
	const listeners = listPortListeners(port);
	for (const proc of listeners) try {
		process.kill(proc.pid, "SIGTERM");
	} catch (err) {
		throw new Error(`failed to kill pid ${proc.pid}${proc.command ? ` (${proc.command})` : ""}: ${String(err)}`, { cause: err });
	}
	return listeners;
}
function killPids(listeners, signal) {
	for (const proc of listeners) try {
		process.kill(proc.pid, signal);
	} catch (err) {
		throw new Error(`failed to kill pid ${proc.pid}${proc.command ? ` (${proc.command})` : ""}: ${String(err)}`, { cause: err });
	}
}
async function forceFreePortAndWait(port, opts = {}) {
	const timeoutMs = Math.max(opts.timeoutMs ?? 1500, 0);
	const intervalMs = Math.max(opts.intervalMs ?? 100, 1);
	const sigtermTimeoutMs = Math.min(Math.max(opts.sigtermTimeoutMs ?? 600, 0), timeoutMs);
	const killed = forceFreePort(port);
	if (killed.length === 0) return {
		killed,
		waitedMs: 0,
		escalatedToSigkill: false
	};
	let waitedMs = 0;
	const triesSigterm = intervalMs > 0 ? Math.ceil(sigtermTimeoutMs / intervalMs) : 0;
	for (let i = 0; i < triesSigterm; i++) {
		if (listPortListeners(port).length === 0) return {
			killed,
			waitedMs,
			escalatedToSigkill: false
		};
		await sleep(intervalMs);
		waitedMs += intervalMs;
	}
	if (listPortListeners(port).length === 0) return {
		killed,
		waitedMs,
		escalatedToSigkill: false
	};
	killPids(listPortListeners(port), "SIGKILL");
	const remainingBudget = Math.max(timeoutMs - waitedMs, 0);
	const triesSigkill = intervalMs > 0 ? Math.ceil(remainingBudget / intervalMs) : 0;
	for (let i = 0; i < triesSigkill; i++) {
		if (listPortListeners(port).length === 0) return {
			killed,
			waitedMs,
			escalatedToSigkill: true
		};
		await sleep(intervalMs);
		waitedMs += intervalMs;
	}
	const still = listPortListeners(port);
	if (still.length === 0) return {
		killed,
		waitedMs,
		escalatedToSigkill: true
	};
	throw new Error(`port ${port} still has listeners after --force: ${still.map((p) => p.pid).join(", ")}`);
}

//#endregion
//#region src/agents/identity-file.ts
const IDENTITY_PLACEHOLDER_VALUES = new Set([
	"pick something you like",
	"ai? robot? familiar? ghost in the machine? something weirder?",
	"how do you come across? sharp? warm? chaotic? calm?",
	"your signature - pick one that feels right",
	"workspace-relative path, http(s) url, or data uri"
]);
function normalizeIdentityValue(value) {
	let normalized = value.trim();
	normalized = normalized.replace(/^[*_]+|[*_]+$/g, "").trim();
	if (normalized.startsWith("(") && normalized.endsWith(")")) normalized = normalized.slice(1, -1).trim();
	normalized = normalized.replace(/[\u2013\u2014]/g, "-");
	normalized = normalized.replace(/\s+/g, " ").toLowerCase();
	return normalized;
}
function isIdentityPlaceholder(value) {
	const normalized = normalizeIdentityValue(value);
	return IDENTITY_PLACEHOLDER_VALUES.has(normalized);
}
function parseIdentityMarkdown(content) {
	const identity = {};
	const lines = content.split(/\r?\n/);
	for (const line of lines) {
		const cleaned = line.trim().replace(/^\s*-\s*/, "");
		const colonIndex = cleaned.indexOf(":");
		if (colonIndex === -1) continue;
		const label = cleaned.slice(0, colonIndex).replace(/[*_]/g, "").trim().toLowerCase();
		const value = cleaned.slice(colonIndex + 1).replace(/^[*_]+|[*_]+$/g, "").trim();
		if (!value) continue;
		if (isIdentityPlaceholder(value)) continue;
		if (label === "name") identity.name = value;
		if (label === "emoji") identity.emoji = value;
		if (label === "creature") identity.creature = value;
		if (label === "vibe") identity.vibe = value;
		if (label === "theme") identity.theme = value;
		if (label === "avatar") identity.avatar = value;
	}
	return identity;
}
function identityHasValues(identity) {
	return Boolean(identity.name || identity.emoji || identity.theme || identity.creature || identity.vibe || identity.avatar);
}
function loadIdentityFromFile(identityPath) {
	try {
		const parsed = parseIdentityMarkdown(fs.readFileSync(identityPath, "utf-8"));
		if (!identityHasValues(parsed)) return null;
		return parsed;
	} catch {
		return null;
	}
}
function loadAgentIdentityFromWorkspace(workspace) {
	return loadIdentityFromFile(path.join(workspace, DEFAULT_IDENTITY_FILENAME));
}

//#endregion
//#region src/commands/agents.config.ts
function listAgentEntries(cfg) {
	const list = cfg.agents?.list;
	if (!Array.isArray(list)) return [];
	return list.filter((entry) => Boolean(entry && typeof entry === "object"));
}
function findAgentEntryIndex(list, agentId) {
	const id = normalizeAgentId(agentId);
	return list.findIndex((entry) => normalizeAgentId(entry.id) === id);
}
function resolveAgentName(cfg, agentId) {
	return listAgentEntries(cfg).find((agent) => normalizeAgentId(agent.id) === normalizeAgentId(agentId))?.name?.trim() || void 0;
}
function resolveAgentModel(cfg, agentId) {
	const entry = listAgentEntries(cfg).find((agent) => normalizeAgentId(agent.id) === normalizeAgentId(agentId));
	if (entry?.model) {
		if (typeof entry.model === "string" && entry.model.trim()) return entry.model.trim();
		if (typeof entry.model === "object") {
			const primary = entry.model.primary?.trim();
			if (primary) return primary;
		}
	}
	const raw = cfg.agents?.defaults?.model;
	if (typeof raw === "string") return raw;
	return raw?.primary?.trim() || void 0;
}
function loadAgentIdentity(workspace) {
	const parsed = loadAgentIdentityFromWorkspace(workspace);
	if (!parsed) return null;
	return identityHasValues(parsed) ? parsed : null;
}
function buildAgentSummaries(cfg) {
	const defaultAgentId = normalizeAgentId(resolveDefaultAgentId(cfg));
	const configuredAgents = listAgentEntries(cfg);
	const orderedIds = configuredAgents.length > 0 ? configuredAgents.map((agent) => normalizeAgentId(agent.id)) : [defaultAgentId];
	const bindingCounts = /* @__PURE__ */ new Map();
	for (const binding of cfg.bindings ?? []) {
		const agentId = normalizeAgentId(binding.agentId);
		bindingCounts.set(agentId, (bindingCounts.get(agentId) ?? 0) + 1);
	}
	return orderedIds.filter((id, index) => orderedIds.indexOf(id) === index).map((id) => {
		const workspace = resolveAgentWorkspaceDir(cfg, id);
		const identity = loadAgentIdentity(workspace);
		const configIdentity = configuredAgents.find((agent) => normalizeAgentId(agent.id) === id)?.identity;
		const identityName = identity?.name ?? configIdentity?.name?.trim();
		const identityEmoji = identity?.emoji ?? configIdentity?.emoji?.trim();
		const identitySource = identity ? "identity" : configIdentity && (identityName || identityEmoji) ? "config" : void 0;
		return {
			id,
			name: resolveAgentName(cfg, id),
			identityName,
			identityEmoji,
			identitySource,
			workspace,
			agentDir: resolveAgentDir(cfg, id),
			model: resolveAgentModel(cfg, id),
			bindings: bindingCounts.get(id) ?? 0,
			isDefault: id === defaultAgentId
		};
	});
}
function applyAgentConfig(cfg, params) {
	const agentId = normalizeAgentId(params.agentId);
	const name = params.name?.trim();
	const list = listAgentEntries(cfg);
	const index = findAgentEntryIndex(list, agentId);
	const nextEntry = {
		...index >= 0 ? list[index] : { id: agentId },
		...name ? { name } : {},
		...params.workspace ? { workspace: params.workspace } : {},
		...params.agentDir ? { agentDir: params.agentDir } : {},
		...params.model ? { model: params.model } : {}
	};
	const nextList = [...list];
	if (index >= 0) nextList[index] = nextEntry;
	else {
		if (nextList.length === 0 && agentId !== normalizeAgentId(resolveDefaultAgentId(cfg))) nextList.push({ id: resolveDefaultAgentId(cfg) });
		nextList.push(nextEntry);
	}
	return {
		...cfg,
		agents: {
			...cfg.agents,
			list: nextList
		}
	};
}
function pruneAgentConfig(cfg, agentId) {
	const id = normalizeAgentId(agentId);
	const nextAgentsList = listAgentEntries(cfg).filter((entry) => normalizeAgentId(entry.id) !== id);
	const nextAgents = nextAgentsList.length > 0 ? nextAgentsList : void 0;
	const bindings = cfg.bindings ?? [];
	const filteredBindings = bindings.filter((binding) => normalizeAgentId(binding.agentId) !== id);
	const allow = cfg.tools?.agentToAgent?.allow ?? [];
	const filteredAllow = allow.filter((entry) => entry !== id);
	const nextAgentsConfig = cfg.agents ? {
		...cfg.agents,
		list: nextAgents
	} : nextAgents ? { list: nextAgents } : void 0;
	const nextTools = cfg.tools?.agentToAgent ? {
		...cfg.tools,
		agentToAgent: {
			...cfg.tools.agentToAgent,
			allow: filteredAllow.length > 0 ? filteredAllow : void 0
		}
	} : cfg.tools;
	return {
		config: {
			...cfg,
			agents: nextAgentsConfig,
			bindings: filteredBindings.length > 0 ? filteredBindings : void 0,
			tools: nextTools
		},
		removedBindings: bindings.length - filteredBindings.length,
		removedAllow: allow.length - filteredAllow.length
	};
}

//#endregion
//#region src/commands/onboard-hooks.ts
async function setupInternalHooks(cfg, runtime, prompter) {
	await prompter.note([
		"Hooks let you automate actions when agent commands are issued.",
		"Example: Save session context to memory when you issue /new.",
		"",
		"Learn more: https://docs.openclaw.ai/hooks"
	].join("\n"), "Hooks");
	const eligibleHooks = buildWorkspaceHookStatus(resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg)), { config: cfg }).hooks.filter((h) => h.eligible);
	if (eligibleHooks.length === 0) {
		await prompter.note("No eligible hooks found. You can configure hooks later in your config.", "No Hooks Available");
		return cfg;
	}
	const selected = (await prompter.multiselect({
		message: "Enable hooks?",
		options: [{
			value: "__skip__",
			label: "Skip for now"
		}, ...eligibleHooks.map((hook) => ({
			value: hook.name,
			label: `${hook.emoji ?? "🔗"} ${hook.name}`,
			hint: hook.description
		}))]
	})).filter((name) => name !== "__skip__");
	if (selected.length === 0) return cfg;
	const entries = { ...cfg.hooks?.internal?.entries };
	for (const name of selected) entries[name] = { enabled: true };
	const next = {
		...cfg,
		hooks: {
			...cfg.hooks,
			internal: {
				enabled: true,
				entries
			}
		}
	};
	await prompter.note([
		`Enabled ${selected.length} hook${selected.length > 1 ? "s" : ""}: ${selected.join(", ")}`,
		"",
		"You can manage hooks later with:",
		`  ${formatCliCommand("openclaw hooks list")}`,
		`  ${formatCliCommand("openclaw hooks enable <name>")}`,
		`  ${formatCliCommand("openclaw hooks disable <name>")}`
	].join("\n"), "Hooks Configured");
	return next;
}

//#endregion
//#region src/wizard/onboarding.completion.ts
async function resolveProfileHint(shell) {
	const home = process.env.HOME || os.homedir();
	if (shell === "zsh") return "~/.zshrc";
	if (shell === "bash") return await pathExists(path.join(home, ".bashrc")) ? "~/.bashrc" : "~/.bash_profile";
	if (shell === "fish") return "~/.config/fish/config.fish";
	return "$PROFILE";
}
function formatReloadHint(shell, profileHint) {
	if (shell === "powershell") return "Restart your shell (or reload your PowerShell profile).";
	return `Restart your shell or run: source ${profileHint}`;
}
async function setupOnboardingShellCompletion(params) {
	const deps = {
		resolveCliName,
		checkShellCompletionStatus,
		ensureCompletionCacheExists,
		installCompletion,
		...params.deps
	};
	const cliName = deps.resolveCliName();
	const completionStatus = await deps.checkShellCompletionStatus(cliName);
	if (completionStatus.usesSlowPattern) {
		if (await deps.ensureCompletionCacheExists(cliName)) await deps.installCompletion(completionStatus.shell, true, cliName);
		return;
	}
	if (completionStatus.profileInstalled && !completionStatus.cacheExists) {
		await deps.ensureCompletionCacheExists(cliName);
		return;
	}
	if (!completionStatus.profileInstalled) {
		if (!(params.flow === "quickstart" ? true : await params.prompter.confirm({
			message: `Enable ${completionStatus.shell} shell completion for ${cliName}?`,
			initialValue: true
		}))) return;
		if (!await deps.ensureCompletionCacheExists(cliName)) {
			await params.prompter.note(`Failed to generate completion cache. Run \`${cliName} completion --install\` later.`, "Shell completion");
			return;
		}
		await deps.installCompletion(completionStatus.shell, true, cliName);
		const profileHint = await resolveProfileHint(completionStatus.shell);
		await params.prompter.note(`Shell completion installed. ${formatReloadHint(completionStatus.shell, profileHint)}`, "Shell completion");
	}
}

//#endregion
//#region src/wizard/onboarding.finalize.ts
async function finalizeOnboardingWizard(options) {
	const { flow, opts, baseConfig, nextConfig, settings, prompter, runtime } = options;
	const withWizardProgress = async (label, options, work) => {
		const progress = prompter.progress(label);
		try {
			return await work(progress);
		} finally {
			progress.stop(options.doneMessage);
		}
	};
	const systemdAvailable = process.platform === "linux" ? await isSystemdUserServiceAvailable() : true;
	if (process.platform === "linux" && !systemdAvailable) await prompter.note("Systemd user services are unavailable. Skipping lingering checks and service install.", "Systemd");
	if (process.platform === "linux" && systemdAvailable) {
		const { ensureSystemdUserLingerInteractive } = await import("./systemd-linger-DfY-LfC0.js").then((n) => n.r);
		await ensureSystemdUserLingerInteractive({
			runtime,
			prompter: {
				confirm: prompter.confirm,
				note: prompter.note
			},
			reason: "Linux installs use a systemd user service by default. Without lingering, systemd stops the user session on logout/idle and kills the Gateway.",
			requireConfirm: false
		});
	}
	const explicitInstallDaemon = typeof opts.installDaemon === "boolean" ? opts.installDaemon : void 0;
	let installDaemon;
	if (explicitInstallDaemon !== void 0) installDaemon = explicitInstallDaemon;
	else if (process.platform === "linux" && !systemdAvailable) installDaemon = false;
	else if (flow === "quickstart") installDaemon = true;
	else installDaemon = await prompter.confirm({
		message: "Install Gateway service (recommended)",
		initialValue: true
	});
	if (process.platform === "linux" && !systemdAvailable && installDaemon) {
		await prompter.note("Systemd user services are unavailable; skipping service install. Use your container supervisor or `docker compose up -d`.", "Gateway service");
		installDaemon = false;
	}
	if (installDaemon) {
		const daemonRuntime = flow === "quickstart" ? DEFAULT_GATEWAY_DAEMON_RUNTIME : await prompter.select({
			message: "Gateway service runtime",
			options: GATEWAY_DAEMON_RUNTIME_OPTIONS,
			initialValue: opts.daemonRuntime ?? DEFAULT_GATEWAY_DAEMON_RUNTIME
		});
		if (flow === "quickstart") await prompter.note("QuickStart uses Node for the Gateway service (stable + supported).", "Gateway service runtime");
		const service = resolveGatewayService();
		const loaded = await service.isLoaded({ env: process.env });
		if (loaded) {
			const action = await prompter.select({
				message: "Gateway service already installed",
				options: [
					{
						value: "restart",
						label: "Restart"
					},
					{
						value: "reinstall",
						label: "Reinstall"
					},
					{
						value: "skip",
						label: "Skip"
					}
				]
			});
			if (action === "restart") await withWizardProgress("Gateway service", { doneMessage: "Gateway service restarted." }, async (progress) => {
				progress.update("Restarting Gateway service…");
				await service.restart({
					env: process.env,
					stdout: process.stdout
				});
			});
			else if (action === "reinstall") await withWizardProgress("Gateway service", { doneMessage: "Gateway service uninstalled." }, async (progress) => {
				progress.update("Uninstalling Gateway service…");
				await service.uninstall({
					env: process.env,
					stdout: process.stdout
				});
			});
		}
		if (!loaded || loaded && !await service.isLoaded({ env: process.env })) {
			const progress = prompter.progress("Gateway service");
			let installError = null;
			try {
				progress.update("Preparing Gateway service…");
				const { programArguments, workingDirectory, environment } = await buildGatewayInstallPlan({
					env: process.env,
					port: settings.port,
					token: settings.gatewayToken,
					runtime: daemonRuntime,
					warn: (message, title) => prompter.note(message, title),
					config: nextConfig
				});
				progress.update("Installing Gateway service…");
				await service.install({
					env: process.env,
					stdout: process.stdout,
					programArguments,
					workingDirectory,
					environment
				});
			} catch (err) {
				installError = err instanceof Error ? err.message : String(err);
			} finally {
				progress.stop(installError ? "Gateway service install failed." : "Gateway service installed.");
			}
			if (installError) {
				await prompter.note(`Gateway service install failed: ${installError}`, "Gateway");
				await prompter.note(gatewayInstallErrorHint(), "Gateway");
			}
		}
	}
	if (!opts.skipHealth) {
		await waitForGatewayReachable({
			url: resolveControlUiLinks({
				bind: nextConfig.gateway?.bind ?? "loopback",
				port: settings.port,
				customBindHost: nextConfig.gateway?.customBindHost,
				basePath: void 0
			}).wsUrl,
			token: settings.gatewayToken,
			deadlineMs: 15e3
		});
		try {
			await healthCommand({
				json: false,
				timeoutMs: 1e4
			}, runtime);
		} catch (err) {
			runtime.error(formatHealthCheckFailure(err));
			await prompter.note([
				"Docs:",
				"https://docs.openclaw.ai/gateway/health",
				"https://docs.openclaw.ai/gateway/troubleshooting"
			].join("\n"), "Health check help");
		}
	}
	const controlUiEnabled = nextConfig.gateway?.controlUi?.enabled ?? baseConfig.gateway?.controlUi?.enabled ?? true;
	if (!opts.skipUi && controlUiEnabled) {
		const controlUiAssets = await ensureControlUiAssetsBuilt(runtime);
		if (!controlUiAssets.ok && controlUiAssets.message) runtime.error(controlUiAssets.message);
	}
	await prompter.note([
		"Add nodes for extra features:",
		"- macOS app (system + notifications)",
		"- iOS app (camera/canvas)",
		"- Android app (camera/canvas)"
	].join("\n"), "Optional apps");
	const controlUiBasePath = nextConfig.gateway?.controlUi?.basePath ?? baseConfig.gateway?.controlUi?.basePath;
	const links = resolveControlUiLinks({
		bind: settings.bind,
		port: settings.port,
		customBindHost: settings.customBindHost,
		basePath: controlUiBasePath
	});
	const authedUrl = settings.authMode === "token" && settings.gatewayToken ? `${links.httpUrl}#token=${encodeURIComponent(settings.gatewayToken)}` : links.httpUrl;
	const gatewayProbe = await probeGatewayReachable({
		url: links.wsUrl,
		token: settings.authMode === "token" ? settings.gatewayToken : void 0,
		password: settings.authMode === "password" ? nextConfig.gateway?.auth?.password : ""
	});
	const gatewayStatusLine = gatewayProbe.ok ? "Gateway: reachable" : `Gateway: not detected${gatewayProbe.detail ? ` (${gatewayProbe.detail})` : ""}`;
	const bootstrapPath = path.join(resolveUserPath(options.workspaceDir), DEFAULT_BOOTSTRAP_FILENAME);
	const hasBootstrap = await fsPromises.access(bootstrapPath).then(() => true).catch(() => false);
	await prompter.note([
		`Web UI: ${links.httpUrl}`,
		settings.authMode === "token" && settings.gatewayToken ? `Web UI (with token): ${authedUrl}` : void 0,
		`Gateway WS: ${links.wsUrl}`,
		gatewayStatusLine,
		"Docs: https://docs.openclaw.ai/web/control-ui"
	].filter(Boolean).join("\n"), "Control UI");
	let controlUiOpened = false;
	let controlUiOpenHint;
	let hatchChoice = null;
	let launchedTui = false;
	if (!opts.skipUi && gatewayProbe.ok) {
		if (hasBootstrap) await prompter.note([
			"This is the defining action that makes your agent you.",
			"Please take your time.",
			"The more you tell it, the better the experience will be.",
			"We will send: \"Wake up, my friend!\""
		].join("\n"), "Start TUI (best option!)");
		await prompter.note([
			"Gateway token: shared auth for the Gateway + Control UI.",
			"Stored in: ~/.openclaw/openclaw.json (gateway.auth.token) or OPENCLAW_GATEWAY_TOKEN.",
			`View token: ${formatCliCommand("openclaw config get gateway.auth.token")}`,
			`Generate token: ${formatCliCommand("openclaw doctor --generate-gateway-token")}`,
			"Web UI stores a copy in this browser's localStorage (openclaw.control.settings.v1).",
			`Open the dashboard anytime: ${formatCliCommand("openclaw dashboard --no-open")}`,
			"If prompted: paste the token into Control UI settings (or use the tokenized dashboard URL)."
		].join("\n"), "Token");
		hatchChoice = await prompter.select({
			message: "How do you want to hatch your bot?",
			options: [
				{
					value: "tui",
					label: "Hatch in TUI (recommended)"
				},
				{
					value: "web",
					label: "Open the Web UI"
				},
				{
					value: "later",
					label: "Do this later"
				}
			],
			initialValue: "tui"
		});
		if (hatchChoice === "tui") {
			restoreTerminalState("pre-onboarding tui");
			await runTui({
				url: links.wsUrl,
				token: settings.authMode === "token" ? settings.gatewayToken : void 0,
				password: settings.authMode === "password" ? nextConfig.gateway?.auth?.password : "",
				deliver: false,
				message: hasBootstrap ? "Wake up, my friend!" : void 0
			});
			launchedTui = true;
		} else if (hatchChoice === "web") {
			if ((await detectBrowserOpenSupport()).ok) {
				controlUiOpened = await openUrl(authedUrl);
				if (!controlUiOpened) controlUiOpenHint = formatControlUiSshHint({
					port: settings.port,
					basePath: controlUiBasePath,
					token: settings.authMode === "token" ? settings.gatewayToken : void 0
				});
			} else controlUiOpenHint = formatControlUiSshHint({
				port: settings.port,
				basePath: controlUiBasePath,
				token: settings.authMode === "token" ? settings.gatewayToken : void 0
			});
			await prompter.note([
				`Dashboard link (with token): ${authedUrl}`,
				controlUiOpened ? "Opened in your browser. Keep that tab to control OpenClaw." : "Copy/paste this URL in a browser on this machine to control OpenClaw.",
				controlUiOpenHint
			].filter(Boolean).join("\n"), "Dashboard ready");
		} else await prompter.note(`When you're ready: ${formatCliCommand("openclaw dashboard --no-open")}`, "Later");
	} else if (opts.skipUi) await prompter.note("Skipping Control UI/TUI prompts.", "Control UI");
	await prompter.note(["Back up your agent workspace.", "Docs: https://docs.openclaw.ai/concepts/agent-workspace"].join("\n"), "Workspace backup");
	await prompter.note("Running agents on your computer is risky — harden your setup: https://docs.openclaw.ai/security", "Security");
	await setupOnboardingShellCompletion({
		flow,
		prompter
	});
	if (!opts.skipUi && settings.authMode === "token" && Boolean(settings.gatewayToken) && hatchChoice === null) {
		if ((await detectBrowserOpenSupport()).ok) {
			controlUiOpened = await openUrl(authedUrl);
			if (!controlUiOpened) controlUiOpenHint = formatControlUiSshHint({
				port: settings.port,
				basePath: controlUiBasePath,
				token: settings.gatewayToken
			});
		} else controlUiOpenHint = formatControlUiSshHint({
			port: settings.port,
			basePath: controlUiBasePath,
			token: settings.gatewayToken
		});
		await prompter.note([
			`Dashboard link (with token): ${authedUrl}`,
			controlUiOpened ? "Opened in your browser. Keep that tab to control OpenClaw." : "Copy/paste this URL in a browser on this machine to control OpenClaw.",
			controlUiOpenHint
		].filter(Boolean).join("\n"), "Dashboard ready");
	}
	const webSearchKey = (nextConfig.tools?.web?.search?.apiKey ?? "").trim();
	const webSearchEnv = (process.env.BRAVE_API_KEY ?? "").trim();
	const hasWebSearchKey = Boolean(webSearchKey || webSearchEnv);
	await prompter.note(hasWebSearchKey ? [
		"Web search is enabled, so your agent can look things up online when needed.",
		"",
		webSearchKey ? "API key: stored in config (tools.web.search.apiKey)." : "API key: provided via BRAVE_API_KEY env var (Gateway environment).",
		"Docs: https://docs.openclaw.ai/tools/web"
	].join("\n") : [
		"If you want your agent to be able to search the web, you’ll need an API key.",
		"",
		"OpenClaw uses Brave Search for the `web_search` tool. Without a Brave Search API key, web search won’t work.",
		"",
		"Set it up interactively:",
		`- Run: ${formatCliCommand("openclaw configure --section web")}`,
		"- Enable web_search and paste your Brave Search API key",
		"",
		"Alternative: set BRAVE_API_KEY in the Gateway environment (no config changes).",
		"Docs: https://docs.openclaw.ai/tools/web"
	].join("\n"), "Web search (optional)");
	await prompter.note("What now: https://openclaw.ai/showcase (\"What People Are Building\").", "What now");
	await prompter.outro(controlUiOpened ? "Onboarding complete. Dashboard opened; keep that tab to control OpenClaw." : "Onboarding complete. Use the dashboard link above to control OpenClaw.");
	return { launchedTui };
}

//#endregion
//#region src/wizard/onboarding.gateway-config.ts
const DEFAULT_DANGEROUS_NODE_DENY_COMMANDS = [
	"camera.snap",
	"camera.clip",
	"screen.record",
	"calendar.add",
	"contacts.add",
	"reminders.add"
];
async function configureGatewayForOnboarding(opts) {
	const { flow, localPort, quickstartGateway, prompter } = opts;
	let { nextConfig } = opts;
	const port = flow === "quickstart" ? quickstartGateway.port : Number.parseInt(String(await prompter.text({
		message: "Gateway port",
		initialValue: String(localPort),
		validate: (value) => Number.isFinite(Number(value)) ? void 0 : "Invalid port"
	})), 10);
	let bind = flow === "quickstart" ? quickstartGateway.bind : await prompter.select({
		message: "Gateway bind",
		options: [
			{
				value: "loopback",
				label: "Loopback (127.0.0.1)"
			},
			{
				value: "lan",
				label: "LAN (0.0.0.0)"
			},
			{
				value: "tailnet",
				label: "Tailnet (Tailscale IP)"
			},
			{
				value: "auto",
				label: "Auto (Loopback → LAN)"
			},
			{
				value: "custom",
				label: "Custom IP"
			}
		]
	});
	let customBindHost = quickstartGateway.customBindHost;
	if (bind === "custom") {
		if (flow !== "quickstart" || !customBindHost) {
			const input = await prompter.text({
				message: "Custom IP address",
				placeholder: "192.168.1.100",
				initialValue: customBindHost ?? "",
				validate: (value) => {
					if (!value) return "IP address is required for custom bind mode";
					const parts = value.trim().split(".");
					if (parts.length !== 4) return "Invalid IPv4 address (e.g., 192.168.1.100)";
					if (parts.every((part) => {
						const n = parseInt(part, 10);
						return !Number.isNaN(n) && n >= 0 && n <= 255 && part === String(n);
					})) return;
					return "Invalid IPv4 address (each octet must be 0-255)";
				}
			});
			customBindHost = typeof input === "string" ? input.trim() : void 0;
		}
	}
	let authMode = flow === "quickstart" ? quickstartGateway.authMode : await prompter.select({
		message: "Gateway auth",
		options: [{
			value: "token",
			label: "Token",
			hint: "Recommended default (local + remote)"
		}, {
			value: "password",
			label: "Password"
		}],
		initialValue: "token"
	});
	const tailscaleMode = flow === "quickstart" ? quickstartGateway.tailscaleMode : await prompter.select({
		message: "Tailscale exposure",
		options: [
			{
				value: "off",
				label: "Off",
				hint: "No Tailscale exposure"
			},
			{
				value: "serve",
				label: "Serve",
				hint: "Private HTTPS for your tailnet (devices on Tailscale)"
			},
			{
				value: "funnel",
				label: "Funnel",
				hint: "Public HTTPS via Tailscale Funnel (internet)"
			}
		]
	});
	if (tailscaleMode !== "off") {
		if (!await findTailscaleBinary()) await prompter.note([
			"Tailscale binary not found in PATH or /Applications.",
			"Ensure Tailscale is installed from:",
			"  https://tailscale.com/download/mac",
			"",
			"You can continue setup, but serve/funnel will fail at runtime."
		].join("\n"), "Tailscale Warning");
	}
	let tailscaleResetOnExit = flow === "quickstart" ? quickstartGateway.tailscaleResetOnExit : false;
	if (tailscaleMode !== "off" && flow !== "quickstart") {
		await prompter.note([
			"Docs:",
			"https://docs.openclaw.ai/gateway/tailscale",
			"https://docs.openclaw.ai/web"
		].join("\n"), "Tailscale");
		tailscaleResetOnExit = Boolean(await prompter.confirm({
			message: "Reset Tailscale serve/funnel on exit?",
			initialValue: false
		}));
	}
	if (tailscaleMode !== "off" && bind !== "loopback") {
		await prompter.note("Tailscale requires bind=loopback. Adjusting bind to loopback.", "Note");
		bind = "loopback";
		customBindHost = void 0;
	}
	if (tailscaleMode === "funnel" && authMode !== "password") {
		await prompter.note("Tailscale funnel requires password auth.", "Note");
		authMode = "password";
	}
	let gatewayToken;
	if (authMode === "token") if (flow === "quickstart") gatewayToken = quickstartGateway.token ?? randomToken();
	else gatewayToken = normalizeGatewayTokenInput(await prompter.text({
		message: "Gateway token (blank to generate)",
		placeholder: "Needed for multi-machine or non-loopback access",
		initialValue: quickstartGateway.token ?? ""
	})) || randomToken();
	if (authMode === "password") {
		const password = flow === "quickstart" && quickstartGateway.password ? quickstartGateway.password : await prompter.text({
			message: "Gateway password",
			validate: validateGatewayPasswordInput
		});
		nextConfig = {
			...nextConfig,
			gateway: {
				...nextConfig.gateway,
				auth: {
					...nextConfig.gateway?.auth,
					mode: "password",
					password: String(password ?? "").trim()
				}
			}
		};
	} else if (authMode === "token") nextConfig = {
		...nextConfig,
		gateway: {
			...nextConfig.gateway,
			auth: {
				...nextConfig.gateway?.auth,
				mode: "token",
				token: gatewayToken
			}
		}
	};
	nextConfig = {
		...nextConfig,
		gateway: {
			...nextConfig.gateway,
			port,
			bind,
			...bind === "custom" && customBindHost ? { customBindHost } : {},
			tailscale: {
				...nextConfig.gateway?.tailscale,
				mode: tailscaleMode,
				resetOnExit: tailscaleResetOnExit
			}
		}
	};
	if (!quickstartGateway.hasExisting && nextConfig.gateway?.nodes?.denyCommands === void 0 && nextConfig.gateway?.nodes?.allowCommands === void 0 && nextConfig.gateway?.nodes?.browser === void 0) nextConfig = {
		...nextConfig,
		gateway: {
			...nextConfig.gateway,
			nodes: {
				...nextConfig.gateway?.nodes,
				denyCommands: [...DEFAULT_DANGEROUS_NODE_DENY_COMMANDS]
			}
		}
	};
	return {
		nextConfig,
		settings: {
			port,
			bind,
			customBindHost: bind === "custom" ? customBindHost : void 0,
			authMode,
			gatewayToken,
			tailscaleMode,
			tailscaleResetOnExit
		}
	};
}

//#endregion
//#region src/wizard/onboarding.ts
async function requireRiskAcknowledgement(params) {
	if (params.opts.acceptRisk === true) return;
	await params.prompter.note([
		"Security warning — please read.",
		"",
		"OpenClaw is a hobby project and still in beta. Expect sharp edges.",
		"This bot can read files and run actions if tools are enabled.",
		"A bad prompt can trick it into doing unsafe things.",
		"",
		"If you’re not comfortable with basic security and access control, don’t run OpenClaw.",
		"Ask someone experienced to help before enabling tools or exposing it to the internet.",
		"",
		"Recommended baseline:",
		"- Pairing/allowlists + mention gating.",
		"- Sandbox + least-privilege tools.",
		"- Keep secrets out of the agent’s reachable filesystem.",
		"- Use the strongest available model for any bot with tools or untrusted inboxes.",
		"",
		"Run regularly:",
		"openclaw security audit --deep",
		"openclaw security audit --fix",
		"",
		"Must read: https://docs.openclaw.ai/gateway/security"
	].join("\n"), "Security");
	if (!await params.prompter.confirm({
		message: "I understand this is powerful and inherently risky. Continue?",
		initialValue: false
	})) throw new WizardCancelledError("risk not accepted");
}
async function runOnboardingWizard(opts, runtime = defaultRuntime, prompter) {
	printWizardHeader(runtime);
	await prompter.intro("OpenClaw onboarding");
	await requireRiskAcknowledgement({
		opts,
		prompter
	});
	const snapshot = await readConfigFileSnapshot();
	let baseConfig = snapshot.valid ? snapshot.config : {};
	if (snapshot.exists && !snapshot.valid) {
		await prompter.note(summarizeExistingConfig(baseConfig), "Invalid config");
		if (snapshot.issues.length > 0) await prompter.note([
			...snapshot.issues.map((iss) => `- ${iss.path}: ${iss.message}`),
			"",
			"Docs: https://docs.openclaw.ai/gateway/configuration"
		].join("\n"), "Config issues");
		await prompter.outro(`Config invalid. Run \`${formatCliCommand("openclaw doctor")}\` to repair it, then re-run onboarding.`);
		runtime.exit(1);
		return;
	}
	const quickstartHint = `Configure details later via ${formatCliCommand("openclaw configure")}.`;
	const manualHint = "Configure port, network, Tailscale, and auth options.";
	const explicitFlowRaw = opts.flow?.trim();
	const normalizedExplicitFlow = explicitFlowRaw === "manual" ? "advanced" : explicitFlowRaw;
	if (normalizedExplicitFlow && normalizedExplicitFlow !== "quickstart" && normalizedExplicitFlow !== "advanced") {
		runtime.error("Invalid --flow (use quickstart, manual, or advanced).");
		runtime.exit(1);
		return;
	}
	let flow = (normalizedExplicitFlow === "quickstart" || normalizedExplicitFlow === "advanced" ? normalizedExplicitFlow : void 0) ?? await prompter.select({
		message: "Onboarding mode",
		options: [{
			value: "quickstart",
			label: "QuickStart",
			hint: quickstartHint
		}, {
			value: "advanced",
			label: "Manual",
			hint: manualHint
		}],
		initialValue: "quickstart"
	});
	if (opts.mode === "remote" && flow === "quickstart") {
		await prompter.note("QuickStart only supports local gateways. Switching to Manual mode.", "QuickStart");
		flow = "advanced";
	}
	if (snapshot.exists) {
		await prompter.note(summarizeExistingConfig(baseConfig), "Existing config detected");
		if (await prompter.select({
			message: "Config handling",
			options: [
				{
					value: "keep",
					label: "Use existing values"
				},
				{
					value: "modify",
					label: "Update values"
				},
				{
					value: "reset",
					label: "Reset"
				}
			]
		}) === "reset") {
			const workspaceDefault = baseConfig.agents?.defaults?.workspace ?? DEFAULT_WORKSPACE;
			await handleReset(await prompter.select({
				message: "Reset scope",
				options: [
					{
						value: "config",
						label: "Config only"
					},
					{
						value: "config+creds+sessions",
						label: "Config + creds + sessions"
					},
					{
						value: "full",
						label: "Full reset (config + creds + sessions + workspace)"
					}
				]
			}), resolveUserPath(workspaceDefault), runtime);
			baseConfig = {};
		}
	}
	const quickstartGateway = (() => {
		const hasExisting = typeof baseConfig.gateway?.port === "number" || baseConfig.gateway?.bind !== void 0 || baseConfig.gateway?.auth?.mode !== void 0 || baseConfig.gateway?.auth?.token !== void 0 || baseConfig.gateway?.auth?.password !== void 0 || baseConfig.gateway?.customBindHost !== void 0 || baseConfig.gateway?.tailscale?.mode !== void 0;
		const bindRaw = baseConfig.gateway?.bind;
		const bind = bindRaw === "loopback" || bindRaw === "lan" || bindRaw === "auto" || bindRaw === "custom" || bindRaw === "tailnet" ? bindRaw : "loopback";
		let authMode = "token";
		if (baseConfig.gateway?.auth?.mode === "token" || baseConfig.gateway?.auth?.mode === "password") authMode = baseConfig.gateway.auth.mode;
		else if (baseConfig.gateway?.auth?.token) authMode = "token";
		else if (baseConfig.gateway?.auth?.password) authMode = "password";
		const tailscaleRaw = baseConfig.gateway?.tailscale?.mode;
		const tailscaleMode = tailscaleRaw === "off" || tailscaleRaw === "serve" || tailscaleRaw === "funnel" ? tailscaleRaw : "off";
		return {
			hasExisting,
			port: resolveGatewayPort(baseConfig),
			bind,
			authMode,
			tailscaleMode,
			token: baseConfig.gateway?.auth?.token,
			password: baseConfig.gateway?.auth?.password,
			customBindHost: baseConfig.gateway?.customBindHost,
			tailscaleResetOnExit: baseConfig.gateway?.tailscale?.resetOnExit ?? false
		};
	})();
	if (flow === "quickstart") {
		const formatBind = (value) => {
			if (value === "loopback") return "Loopback (127.0.0.1)";
			if (value === "lan") return "LAN";
			if (value === "custom") return "Custom IP";
			if (value === "tailnet") return "Tailnet (Tailscale IP)";
			return "Auto";
		};
		const formatAuth = (value) => {
			if (value === "token") return "Token (default)";
			return "Password";
		};
		const formatTailscale = (value) => {
			if (value === "off") return "Off";
			if (value === "serve") return "Serve";
			return "Funnel";
		};
		const quickstartLines = quickstartGateway.hasExisting ? [
			"Keeping your current gateway settings:",
			`Gateway port: ${quickstartGateway.port}`,
			`Gateway bind: ${formatBind(quickstartGateway.bind)}`,
			...quickstartGateway.bind === "custom" && quickstartGateway.customBindHost ? [`Gateway custom IP: ${quickstartGateway.customBindHost}`] : [],
			`Gateway auth: ${formatAuth(quickstartGateway.authMode)}`,
			`Tailscale exposure: ${formatTailscale(quickstartGateway.tailscaleMode)}`,
			"Direct to chat channels."
		] : [
			`Gateway port: ${DEFAULT_GATEWAY_PORT}`,
			"Gateway bind: Loopback (127.0.0.1)",
			"Gateway auth: Token (default)",
			"Tailscale exposure: Off",
			"Direct to chat channels."
		];
		await prompter.note(quickstartLines.join("\n"), "QuickStart");
	}
	const localPort = resolveGatewayPort(baseConfig);
	const localUrl = `ws://127.0.0.1:${localPort}`;
	const localProbe = await probeGatewayReachable({
		url: localUrl,
		token: baseConfig.gateway?.auth?.token ?? process.env.OPENCLAW_GATEWAY_TOKEN,
		password: baseConfig.gateway?.auth?.password ?? process.env.OPENCLAW_GATEWAY_PASSWORD
	});
	const remoteUrl = baseConfig.gateway?.remote?.url?.trim() ?? "";
	const remoteProbe = remoteUrl ? await probeGatewayReachable({
		url: remoteUrl,
		token: baseConfig.gateway?.remote?.token
	}) : null;
	const mode = opts.mode ?? (flow === "quickstart" ? "local" : await prompter.select({
		message: "What do you want to set up?",
		options: [{
			value: "local",
			label: "Local gateway (this machine)",
			hint: localProbe.ok ? `Gateway reachable (${localUrl})` : `No gateway detected (${localUrl})`
		}, {
			value: "remote",
			label: "Remote gateway (info-only)",
			hint: !remoteUrl ? "No remote URL configured yet" : remoteProbe?.ok ? `Gateway reachable (${remoteUrl})` : `Configured but unreachable (${remoteUrl})`
		}]
	}));
	if (mode === "remote") {
		let nextConfig = await promptRemoteGatewayConfig(baseConfig, prompter);
		nextConfig = applyWizardMetadata(nextConfig, {
			command: "onboard",
			mode
		});
		await writeConfigFile(nextConfig);
		logConfigUpdated(runtime);
		await prompter.outro("Remote gateway configured.");
		return;
	}
	const workspaceDir = resolveUserPath((opts.workspace ?? (flow === "quickstart" ? baseConfig.agents?.defaults?.workspace ?? DEFAULT_WORKSPACE : await prompter.text({
		message: "Workspace directory",
		initialValue: baseConfig.agents?.defaults?.workspace ?? DEFAULT_WORKSPACE
	}))).trim() || DEFAULT_WORKSPACE);
	let nextConfig = {
		...baseConfig,
		agents: {
			...baseConfig.agents,
			defaults: {
				...baseConfig.agents?.defaults,
				workspace: workspaceDir
			}
		},
		gateway: {
			...baseConfig.gateway,
			mode: "local"
		}
	};
	const authStore = ensureAuthProfileStore(void 0, { allowKeychainPrompt: false });
	const authChoiceFromPrompt = opts.authChoice === void 0;
	const authChoice = opts.authChoice ?? await promptAuthChoiceGrouped({
		prompter,
		store: authStore,
		includeSkip: true
	});
	if (authChoice === "custom-api-key") nextConfig = (await promptCustomApiConfig({
		prompter,
		runtime,
		config: nextConfig
	})).config;
	else nextConfig = (await applyAuthChoice({
		authChoice,
		config: nextConfig,
		prompter,
		runtime,
		setDefaultModel: true,
		opts: {
			tokenProvider: opts.tokenProvider,
			token: opts.authChoice === "apiKey" && opts.token ? opts.token : void 0
		}
	})).config;
	if (authChoiceFromPrompt && authChoice !== "custom-api-key") {
		const modelSelection = await promptDefaultModel({
			config: nextConfig,
			prompter,
			allowKeep: true,
			ignoreAllowlist: true,
			includeVllm: true,
			preferredProvider: resolvePreferredProviderForAuthChoice(authChoice)
		});
		if (modelSelection.config) nextConfig = modelSelection.config;
		if (modelSelection.model) nextConfig = applyPrimaryModel(nextConfig, modelSelection.model);
	}
	await warnIfModelConfigLooksOff(nextConfig, prompter);
	const gateway = await configureGatewayForOnboarding({
		flow,
		baseConfig,
		nextConfig,
		localPort,
		quickstartGateway,
		prompter,
		runtime
	});
	nextConfig = gateway.nextConfig;
	const settings = gateway.settings;
	if (opts.skipChannels ?? opts.skipProviders) await prompter.note("Skipping channel setup.", "Channels");
	else {
		const quickstartAllowFromChannels = flow === "quickstart" ? listChannelPlugins().filter((plugin) => plugin.meta.quickstartAllowFrom).map((plugin) => plugin.id) : [];
		nextConfig = await setupChannels(nextConfig, runtime, prompter, {
			allowSignalInstall: true,
			forceAllowFromChannels: quickstartAllowFromChannels,
			skipDmPolicyPrompt: flow === "quickstart",
			skipConfirm: flow === "quickstart",
			quickstartDefaults: flow === "quickstart"
		});
	}
	await writeConfigFile(nextConfig);
	logConfigUpdated(runtime);
	await ensureWorkspaceAndSessions(workspaceDir, runtime, { skipBootstrap: Boolean(nextConfig.agents?.defaults?.skipBootstrap) });
	if (opts.skipSkills) await prompter.note("Skipping skills setup.", "Skills");
	else nextConfig = await setupSkills(nextConfig, workspaceDir, runtime, prompter);
	nextConfig = await setupInternalHooks(nextConfig, runtime, prompter);
	nextConfig = applyWizardMetadata(nextConfig, {
		command: "onboard",
		mode
	});
	await writeConfigFile(nextConfig);
	const { launchedTui } = await finalizeOnboardingWizard({
		flow,
		opts,
		baseConfig,
		nextConfig,
		workspaceDir,
		settings,
		prompter,
		runtime
	});
	if (launchedTui) return;
}

//#endregion
//#region src/memory/status-format.ts
function resolveMemoryVectorState(vector) {
	if (!vector.enabled) return {
		tone: "muted",
		state: "disabled"
	};
	if (vector.available === true) return {
		tone: "ok",
		state: "ready"
	};
	if (vector.available === false) return {
		tone: "warn",
		state: "unavailable"
	};
	return {
		tone: "muted",
		state: "unknown"
	};
}
function resolveMemoryFtsState(fts) {
	if (!fts.enabled) return {
		tone: "muted",
		state: "disabled"
	};
	return fts.available ? {
		tone: "ok",
		state: "ready"
	} : {
		tone: "warn",
		state: "unavailable"
	};
}
function resolveMemoryCacheSummary(cache) {
	if (!cache.enabled) return {
		tone: "muted",
		text: "cache off"
	};
	return {
		tone: "ok",
		text: `cache on${typeof cache.entries === "number" ? ` (${cache.entries})` : ""}`
	};
}

//#endregion
//#region src/infra/os-summary.ts
function safeTrim(value) {
	return typeof value === "string" ? value.trim() : "";
}
function macosVersion() {
	return safeTrim(spawnSync("sw_vers", ["-productVersion"], { encoding: "utf-8" }).stdout) || os.release();
}
function resolveOsSummary() {
	const platform = os.platform();
	const release = os.release();
	const arch = os.arch();
	return {
		platform,
		arch,
		release,
		label: (() => {
			if (platform === "darwin") return `macos ${macosVersion()} (${arch})`;
			if (platform === "win32") return `windows ${release} (${arch})`;
			return `${platform} ${release} (${arch})`;
		})()
	};
}

//#endregion
//#region src/commands/status-all/agents.ts
async function fileExists$1(p) {
	try {
		await fsPromises.access(p);
		return true;
	} catch {
		return false;
	}
}
async function getAgentLocalStatuses$1(cfg) {
	const agentList = listAgentsForGateway(cfg);
	const now = Date.now();
	const agents = await Promise.all(agentList.agents.map(async (agent) => {
		const workspaceDir = (() => {
			try {
				return resolveAgentWorkspaceDir(cfg, agent.id);
			} catch {
				return null;
			}
		})();
		const bootstrapPending = workspaceDir != null ? await fileExists$1(path.join(workspaceDir, "BOOTSTRAP.md")) : null;
		const sessionsPath = resolveStorePath(cfg.session?.store, { agentId: agent.id });
		const store = (() => {
			try {
				return loadSessionStore(sessionsPath);
			} catch {
				return {};
			}
		})();
		const updatedAt = Object.values(store).reduce((max, entry) => Math.max(max, entry?.updatedAt ?? 0), 0);
		const lastUpdatedAt = updatedAt > 0 ? updatedAt : null;
		const lastActiveAgeMs = lastUpdatedAt ? now - lastUpdatedAt : null;
		const sessionsCount = Object.keys(store).filter((k) => k !== "global" && k !== "unknown").length;
		return {
			id: agent.id,
			name: agent.name,
			workspaceDir,
			bootstrapPending,
			sessionsPath,
			sessionsCount,
			lastUpdatedAt,
			lastActiveAgeMs
		};
	}));
	const totalSessions = agents.reduce((sum, a) => sum + a.sessionsCount, 0);
	const bootstrapPendingCount = agents.reduce((sum, a) => sum + (a.bootstrapPending ? 1 : 0), 0);
	return {
		defaultId: agentList.defaultId,
		agents,
		totalSessions,
		bootstrapPendingCount
	};
}

//#endregion
//#region src/commands/status-all/channels.ts
const asRecord = (value) => value && typeof value === "object" ? value : {};
function summarizeSources(sources) {
	const counts = /* @__PURE__ */ new Map();
	for (const s of sources) {
		const key = s?.trim() ? s.trim() : "unknown";
		counts.set(key, (counts.get(key) ?? 0) + 1);
	}
	const parts = [...counts.entries()].toSorted((a, b) => b[1] - a[1]).map(([key, n]) => `${key}${n > 1 ? `×${n}` : ""}`);
	return {
		label: parts.length > 0 ? parts.join("+") : "unknown",
		parts
	};
}
function existsSyncMaybe(p) {
	const path = p?.trim() || "";
	if (!path) return null;
	try {
		return fs.existsSync(path);
	} catch {
		return null;
	}
}
function formatTokenHint(token, opts) {
	const t = token.trim();
	if (!t) return "empty";
	if (!opts.showSecrets) return `sha256:${sha256HexPrefix(t, 8)} · len ${t.length}`;
	const head = t.slice(0, 4);
	const tail = t.slice(-4);
	if (t.length <= 10) return `${t} · len ${t.length}`;
	return `${head}…${tail} · len ${t.length}`;
}
const formatAccountLabel = (params) => {
	const base = params.accountId || "default";
	if (params.name?.trim()) return `${base} (${params.name.trim()})`;
	return base;
};
const resolveAccountEnabled = (plugin, account, cfg) => {
	if (plugin.config.isEnabled) return plugin.config.isEnabled(account, cfg);
	return asRecord(account).enabled !== false;
};
const resolveAccountConfigured = async (plugin, account, cfg) => {
	if (plugin.config.isConfigured) return await plugin.config.isConfigured(account, cfg);
	return asRecord(account).configured !== false;
};
const buildAccountSnapshot = (params) => {
	const described = params.plugin.config.describeAccount?.(params.account, params.cfg);
	return {
		enabled: params.enabled,
		configured: params.configured,
		...described,
		accountId: params.accountId
	};
};
const formatAllowFrom = (params) => {
	if (params.plugin.config.formatAllowFrom) return params.plugin.config.formatAllowFrom({
		cfg: params.cfg,
		accountId: params.accountId,
		allowFrom: params.allowFrom
	});
	return params.allowFrom.map((entry) => String(entry).trim()).filter(Boolean);
};
const buildAccountNotes = (params) => {
	const { plugin, cfg, entry } = params;
	const notes = [];
	const snapshot = entry.snapshot;
	if (snapshot.enabled === false) notes.push("disabled");
	if (snapshot.dmPolicy) notes.push(`dm:${snapshot.dmPolicy}`);
	if (snapshot.tokenSource && snapshot.tokenSource !== "none") notes.push(`token:${snapshot.tokenSource}`);
	if (snapshot.botTokenSource && snapshot.botTokenSource !== "none") notes.push(`bot:${snapshot.botTokenSource}`);
	if (snapshot.appTokenSource && snapshot.appTokenSource !== "none") notes.push(`app:${snapshot.appTokenSource}`);
	if (snapshot.baseUrl) notes.push(snapshot.baseUrl);
	if (snapshot.port != null) notes.push(`port:${snapshot.port}`);
	if (snapshot.cliPath) notes.push(`cli:${snapshot.cliPath}`);
	if (snapshot.dbPath) notes.push(`db:${snapshot.dbPath}`);
	const allowFrom = plugin.config.resolveAllowFrom?.({
		cfg,
		accountId: snapshot.accountId
	}) ?? snapshot.allowFrom;
	if (allowFrom?.length) {
		const formatted = formatAllowFrom({
			plugin,
			cfg,
			accountId: snapshot.accountId,
			allowFrom
		}).slice(0, 3);
		if (formatted.length > 0) notes.push(`allow:${formatted.join(",")}`);
	}
	return notes;
};
function resolveLinkFields(summary) {
	const rec = asRecord(summary);
	const linked = typeof rec.linked === "boolean" ? rec.linked : null;
	const authAgeMs = typeof rec.authAgeMs === "number" ? rec.authAgeMs : null;
	const self = asRecord(rec.self);
	return {
		linked,
		authAgeMs,
		selfE164: typeof self.e164 === "string" && self.e164.trim() ? self.e164.trim() : null
	};
}
function collectMissingPaths(accounts) {
	const missing = [];
	for (const entry of accounts) {
		const accountRec = asRecord(entry.account);
		const snapshotRec = asRecord(entry.snapshot);
		for (const key of [
			"tokenFile",
			"botTokenFile",
			"appTokenFile",
			"cliPath",
			"dbPath",
			"authDir"
		]) {
			const raw = accountRec[key] ?? snapshotRec[key];
			if (existsSyncMaybe(raw) === false) missing.push(String(raw));
		}
	}
	return missing;
}
function summarizeTokenConfig(params) {
	const enabled = params.accounts.filter((a) => a.enabled);
	if (enabled.length === 0) return {
		state: null,
		detail: null
	};
	const accountRecs = enabled.map((a) => asRecord(a.account));
	const hasBotOrAppTokenFields = accountRecs.some((r) => "botToken" in r || "appToken" in r);
	const hasTokenField = accountRecs.some((r) => "token" in r);
	if (!hasBotOrAppTokenFields && !hasTokenField) return {
		state: null,
		detail: null
	};
	if (hasBotOrAppTokenFields) {
		const ready = enabled.filter((a) => {
			const rec = asRecord(a.account);
			const bot = typeof rec.botToken === "string" ? rec.botToken.trim() : "";
			const app = typeof rec.appToken === "string" ? rec.appToken.trim() : "";
			return Boolean(bot) && Boolean(app);
		});
		const partial = enabled.filter((a) => {
			const rec = asRecord(a.account);
			const bot = typeof rec.botToken === "string" ? rec.botToken.trim() : "";
			const app = typeof rec.appToken === "string" ? rec.appToken.trim() : "";
			const hasBot = Boolean(bot);
			const hasApp = Boolean(app);
			return hasBot && !hasApp || !hasBot && hasApp;
		});
		if (partial.length > 0) return {
			state: "warn",
			detail: `partial tokens (need bot+app) · accounts ${partial.length}`
		};
		if (ready.length === 0) return {
			state: "setup",
			detail: "no tokens (need bot+app)"
		};
		const botSources = summarizeSources(ready.map((a) => a.snapshot.botTokenSource ?? "none"));
		const appSources = summarizeSources(ready.map((a) => a.snapshot.appTokenSource ?? "none"));
		const sample = ready[0]?.account ? asRecord(ready[0].account) : {};
		const botToken = typeof sample.botToken === "string" ? sample.botToken : "";
		const appToken = typeof sample.appToken === "string" ? sample.appToken : "";
		const botHint = botToken.trim() ? formatTokenHint(botToken, { showSecrets: params.showSecrets }) : "";
		const appHint = appToken.trim() ? formatTokenHint(appToken, { showSecrets: params.showSecrets }) : "";
		const hint = botHint || appHint ? ` (bot ${botHint || "?"}, app ${appHint || "?"})` : "";
		return {
			state: "ok",
			detail: `tokens ok (bot ${botSources.label}, app ${appSources.label})${hint} · accounts ${ready.length}/${enabled.length || 1}`
		};
	}
	const ready = enabled.filter((a) => {
		const rec = asRecord(a.account);
		return typeof rec.token === "string" ? Boolean(rec.token.trim()) : false;
	});
	if (ready.length === 0) return {
		state: "setup",
		detail: "no token"
	};
	const sources = summarizeSources(ready.map((a) => a.snapshot.tokenSource));
	const sample = ready[0]?.account ? asRecord(ready[0].account) : {};
	const token = typeof sample.token === "string" ? sample.token : "";
	const hint = token.trim() ? ` (${formatTokenHint(token, { showSecrets: params.showSecrets })})` : "";
	return {
		state: "ok",
		detail: `token ${sources.label}${hint} · accounts ${ready.length}/${enabled.length || 1}`
	};
}
async function buildChannelsTable(cfg, opts) {
	const showSecrets = opts?.showSecrets === true;
	const rows = [];
	const details = [];
	for (const plugin of listChannelPlugins()) {
		const accountIds = plugin.config.listAccountIds(cfg);
		const defaultAccountId = resolveChannelDefaultAccountId({
			plugin,
			cfg,
			accountIds
		});
		const resolvedAccountIds = accountIds.length > 0 ? accountIds : [defaultAccountId];
		const accounts = [];
		for (const accountId of resolvedAccountIds) {
			const account = plugin.config.resolveAccount(cfg, accountId);
			const enabled = resolveAccountEnabled(plugin, account, cfg);
			const configured = await resolveAccountConfigured(plugin, account, cfg);
			const snapshot = buildAccountSnapshot({
				plugin,
				cfg,
				accountId,
				account,
				enabled,
				configured
			});
			accounts.push({
				accountId,
				account,
				enabled,
				configured,
				snapshot
			});
		}
		const anyEnabled = accounts.some((a) => a.enabled);
		const enabledAccounts = accounts.filter((a) => a.enabled);
		const configuredAccounts = enabledAccounts.filter((a) => a.configured);
		const defaultEntry = accounts.find((a) => a.accountId === defaultAccountId) ?? accounts[0];
		const link = resolveLinkFields(plugin.status?.buildChannelSummary ? await plugin.status.buildChannelSummary({
			account: defaultEntry?.account ?? {},
			cfg,
			defaultAccountId,
			snapshot: defaultEntry?.snapshot ?? { accountId: defaultAccountId }
		}) : void 0);
		const missingPaths = collectMissingPaths(enabledAccounts);
		const tokenSummary = summarizeTokenConfig({
			plugin,
			cfg,
			accounts,
			showSecrets
		});
		const issues = plugin.status?.collectStatusIssues ? plugin.status.collectStatusIssues(accounts.map((a) => a.snapshot)) : [];
		const label = plugin.meta.label ?? plugin.id;
		const state = (() => {
			if (!anyEnabled) return "off";
			if (missingPaths.length > 0) return "warn";
			if (issues.length > 0) return "warn";
			if (link.linked === false) return "setup";
			if (tokenSummary.state) return tokenSummary.state;
			if (link.linked === true) return "ok";
			if (configuredAccounts.length > 0) return "ok";
			return "setup";
		})();
		const detail = (() => {
			if (!anyEnabled) {
				if (!defaultEntry) return "disabled";
				return plugin.config.disabledReason?.(defaultEntry.account, cfg) ?? "disabled";
			}
			if (missingPaths.length > 0) return `missing file (${missingPaths[0]})`;
			if (issues.length > 0) return issues[0]?.message ?? "misconfigured";
			if (link.linked !== null) {
				const base = link.linked ? "linked" : "not linked";
				const extra = [];
				if (link.linked && link.selfE164) extra.push(link.selfE164);
				if (link.linked && link.authAgeMs != null && link.authAgeMs >= 0) extra.push(`auth ${formatTimeAgo(link.authAgeMs)}`);
				if (accounts.length > 1 || plugin.meta.forceAccountBinding) extra.push(`accounts ${accounts.length || 1}`);
				return extra.length > 0 ? `${base} · ${extra.join(" · ")}` : base;
			}
			if (tokenSummary.detail) return tokenSummary.detail;
			if (configuredAccounts.length > 0) {
				const head = "configured";
				if (accounts.length <= 1 && !plugin.meta.forceAccountBinding) return head;
				return `${head} · accounts ${configuredAccounts.length}/${enabledAccounts.length || 1}`;
			}
			return (defaultEntry && plugin.config.unconfiguredReason ? plugin.config.unconfiguredReason(defaultEntry.account, cfg) : null) ?? "not configured";
		})();
		rows.push({
			id: plugin.id,
			label,
			enabled: anyEnabled,
			state,
			detail
		});
		if (configuredAccounts.length > 0) details.push({
			title: `${label} accounts`,
			columns: [
				"Account",
				"Status",
				"Notes"
			],
			rows: configuredAccounts.map((entry) => {
				const notes = buildAccountNotes({
					plugin,
					cfg,
					entry
				});
				return {
					Account: formatAccountLabel({
						accountId: entry.accountId,
						name: entry.snapshot.name
					}),
					Status: entry.enabled ? "OK" : "WARN",
					Notes: notes.join(" · ")
				};
			})
		});
	}
	return {
		rows,
		details
	};
}

//#endregion
//#region src/commands/status-all/gateway.ts
async function readFileTailLines(filePath, maxLines) {
	const raw = await fsPromises.readFile(filePath, "utf8").catch(() => "");
	if (!raw.trim()) return [];
	const lines = raw.replace(/\r/g, "").split("\n");
	return lines.slice(Math.max(0, lines.length - maxLines)).map((line) => line.trimEnd()).filter((line) => line.trim().length > 0);
}
function countMatches(haystack, needle) {
	if (!haystack || !needle) return 0;
	return haystack.split(needle).length - 1;
}
function shorten(message, maxLen) {
	const cleaned = message.replace(/\s+/g, " ").trim();
	if (cleaned.length <= maxLen) return cleaned;
	return `${cleaned.slice(0, Math.max(0, maxLen - 1))}…`;
}
function normalizeGwsLine(line) {
	return line.replace(/\s+runId=[^\s]+/g, "").replace(/\s+conn=[^\s]+/g, "").replace(/\s+id=[^\s]+/g, "").replace(/\s+error=Error:.*$/g, "").trim();
}
function consumeJsonBlock(lines, startIndex) {
	const startLine = lines[startIndex] ?? "";
	const braceAt = startLine.indexOf("{");
	if (braceAt < 0) return null;
	const parts = [startLine.slice(braceAt)];
	let depth = countMatches(parts[0] ?? "", "{") - countMatches(parts[0] ?? "", "}");
	let i = startIndex;
	while (depth > 0 && i + 1 < lines.length) {
		i += 1;
		const next = lines[i] ?? "";
		parts.push(next);
		depth += countMatches(next, "{") - countMatches(next, "}");
	}
	return {
		json: parts.join("\n"),
		endIndex: i
	};
}
function summarizeLogTail(rawLines, opts) {
	const maxLines = Math.max(6, opts?.maxLines ?? 26);
	const out = [];
	const groups = /* @__PURE__ */ new Map();
	const addGroup = (key, base) => {
		const existing = groups.get(key);
		if (existing) {
			existing.count += 1;
			return;
		}
		groups.set(key, {
			count: 1,
			index: out.length,
			base
		});
		out.push(base);
	};
	const addLine = (line) => {
		const trimmed = line.trimEnd();
		if (!trimmed) return;
		out.push(trimmed);
	};
	const lines = rawLines.map((line) => line.trimEnd()).filter(Boolean);
	for (let i = 0; i < lines.length; i += 1) {
		const line = lines[i] ?? "";
		const trimmedStart = line.trimStart();
		if ((trimmedStart.startsWith("\"") || trimmedStart === "}" || trimmedStart === "{" || trimmedStart.startsWith("}") || trimmedStart.startsWith("{")) && !trimmedStart.startsWith("[") && !trimmedStart.startsWith("#")) continue;
		const tokenRefresh = line.match(/^\[([^\]]+)\]\s+Token refresh failed:\s*(\d+)\s*(\{)?\s*$/);
		if (tokenRefresh) {
			const tag = tokenRefresh[1] ?? "unknown";
			const status = tokenRefresh[2] ?? "unknown";
			const block = consumeJsonBlock(lines, i);
			if (block) {
				i = block.endIndex;
				const parsed = (() => {
					try {
						return JSON.parse(block.json);
					} catch {
						return null;
					}
				})();
				const code = parsed?.error?.code?.trim() || null;
				const msg = parsed?.error?.message?.trim() || null;
				const msgShort = msg ? msg.toLowerCase().includes("signing in again") ? "re-auth required" : shorten(msg, 52) : null;
				const base = `[${tag}] token refresh ${status}${code ? ` ${code}` : ""}${msgShort ? ` · ${msgShort}` : ""}`;
				addGroup(`token:${tag}:${status}:${code ?? ""}:${msgShort ?? ""}`, base);
				continue;
			}
		}
		const embedded = line.match(/^Embedded agent failed before reply:\s+OAuth token refresh failed for ([^:]+):/);
		if (embedded) {
			const provider = embedded[1]?.trim() || "unknown";
			addGroup(`embedded:${provider}`, `Embedded agent: OAuth token refresh failed (${provider})`);
			continue;
		}
		if (line.startsWith("[gws]") && line.includes("errorCode=UNAVAILABLE") && line.includes("OAuth token refresh failed")) {
			const normalized = normalizeGwsLine(line);
			addGroup(`gws:${normalized}`, normalized);
			continue;
		}
		addLine(line);
	}
	for (const g of groups.values()) {
		if (g.count <= 1) continue;
		out[g.index] = `${g.base} ×${g.count}`;
	}
	const deduped = [];
	for (const line of out) {
		if (deduped[deduped.length - 1] === line) continue;
		deduped.push(line);
	}
	if (deduped.length <= maxLines) return deduped;
	const head = Math.min(6, Math.floor(maxLines / 3));
	const tail = Math.max(1, maxLines - head - 1);
	return [
		...deduped.slice(0, head),
		`… ${deduped.length - head - tail} lines omitted …`,
		...deduped.slice(-tail)
	];
}
function pickGatewaySelfPresence$1(presence) {
	if (!Array.isArray(presence)) return null;
	const self = presence.find((e) => e.mode === "gateway" && e.reason === "self") ?? null;
	if (!self) return null;
	return {
		host: typeof self.host === "string" ? self.host : void 0,
		ip: typeof self.ip === "string" ? self.ip : void 0,
		version: typeof self.version === "string" ? self.version : void 0,
		platform: typeof self.platform === "string" ? self.platform : void 0
	};
}

//#endregion
//#region src/commands/status-all/diagnosis.ts
async function appendStatusAllDiagnosis(params) {
	const { lines, muted, ok, warn, fail } = params;
	const emitCheck = (label, status) => {
		const icon = status === "ok" ? ok("✓") : status === "warn" ? warn("!") : fail("✗");
		const colored = status === "ok" ? ok(label) : status === "warn" ? warn(label) : fail(label);
		lines.push(`${icon} ${colored}`);
	};
	lines.push("");
	lines.push(muted("Gateway connection details:"));
	for (const line of redactSecrets(params.connectionDetailsForReport).split("\n").map((l) => l.trimEnd())) lines.push(`  ${muted(line)}`);
	lines.push("");
	if (params.snap) {
		const status = !params.snap.exists ? "fail" : params.snap.valid ? "ok" : "warn";
		emitCheck(`Config: ${params.snap.path ?? "(unknown)"}`, status);
		const issues = [...params.snap.legacyIssues ?? [], ...params.snap.issues ?? []];
		const uniqueIssues = issues.filter((issue, index) => issues.findIndex((x) => x.path === issue.path && x.message === issue.message) === index);
		for (const issue of uniqueIssues.slice(0, 12)) lines.push(`  - ${issue.path}: ${issue.message}`);
		if (uniqueIssues.length > 12) lines.push(`  ${muted(`… +${uniqueIssues.length - 12} more`)}`);
	} else emitCheck("Config: read failed", "warn");
	if (params.remoteUrlMissing) {
		lines.push("");
		emitCheck("Gateway remote mode misconfigured (gateway.remote.url missing)", "warn");
		lines.push(`  ${muted("Fix: set gateway.remote.url, or set gateway.mode=local.")}`);
	}
	if (params.sentinel?.payload) {
		emitCheck("Restart sentinel present", "warn");
		lines.push(`  ${muted(`${summarizeRestartSentinel(params.sentinel.payload)} · ${formatTimeAgo(Date.now() - params.sentinel.payload.ts)}`)}`);
	} else emitCheck("Restart sentinel: none", "ok");
	const lastErrClean = params.lastErr?.trim() ?? "";
	const isTrivialLastErr = lastErrClean.length < 8 || lastErrClean === "}" || lastErrClean === "{";
	if (lastErrClean && !isTrivialLastErr) {
		lines.push("");
		lines.push(muted("Gateway last log line:"));
		lines.push(`  ${muted(redactSecrets(lastErrClean))}`);
	}
	if (params.portUsage) {
		const portOk = params.portUsage.listeners.length === 0;
		emitCheck(`Port ${params.port}`, portOk ? "ok" : "warn");
		if (!portOk) for (const line of formatPortDiagnostics(params.portUsage)) lines.push(`  ${muted(line)}`);
	}
	{
		const backend = params.tailscale.backendState ?? "unknown";
		const okBackend = backend === "Running";
		const hasDns = Boolean(params.tailscale.dnsName);
		emitCheck(params.tailscaleMode === "off" ? `Tailscale: off · ${backend}${params.tailscale.dnsName ? ` · ${params.tailscale.dnsName}` : ""}` : `Tailscale: ${params.tailscaleMode} · ${backend}${params.tailscale.dnsName ? ` · ${params.tailscale.dnsName}` : ""}`, okBackend && (params.tailscaleMode === "off" || hasDns) ? "ok" : "warn");
		if (params.tailscale.error) lines.push(`  ${muted(`error: ${params.tailscale.error}`)}`);
		if (params.tailscale.ips.length > 0) lines.push(`  ${muted(`ips: ${params.tailscale.ips.slice(0, 3).join(", ")}${params.tailscale.ips.length > 3 ? "…" : ""}`)}`);
		if (params.tailscaleHttpsUrl) lines.push(`  ${muted(`https: ${params.tailscaleHttpsUrl}`)}`);
	}
	if (params.skillStatus) {
		const eligible = params.skillStatus.skills.filter((s) => s.eligible).length;
		const missing = params.skillStatus.skills.filter((s) => s.eligible && Object.values(s.missing).some((arr) => arr.length)).length;
		emitCheck(`Skills: ${eligible} eligible · ${missing} missing · ${params.skillStatus.workspaceDir}`, missing === 0 ? "ok" : "warn");
	}
	params.progress.setLabel("Reading logs…");
	const logPaths = (() => {
		try {
			return resolveGatewayLogPaths(process.env);
		} catch {
			return null;
		}
	})();
	if (logPaths) {
		params.progress.setLabel("Reading logs…");
		const [stderrTail, stdoutTail] = await Promise.all([readFileTailLines(logPaths.stderrPath, 40).catch(() => []), readFileTailLines(logPaths.stdoutPath, 40).catch(() => [])]);
		if (stderrTail.length > 0 || stdoutTail.length > 0) {
			lines.push("");
			lines.push(muted(`Gateway logs (tail, summarized): ${logPaths.logDir}`));
			lines.push(`  ${muted(`# stderr: ${logPaths.stderrPath}`)}`);
			for (const line of summarizeLogTail(stderrTail, { maxLines: 22 }).map(redactSecrets)) lines.push(`  ${muted(line)}`);
			lines.push(`  ${muted(`# stdout: ${logPaths.stdoutPath}`)}`);
			for (const line of summarizeLogTail(stdoutTail, { maxLines: 22 }).map(redactSecrets)) lines.push(`  ${muted(line)}`);
		}
	}
	params.progress.tick();
	if (params.channelsStatus) {
		emitCheck(`Channel issues (${params.channelIssues.length || "none"})`, params.channelIssues.length === 0 ? "ok" : "warn");
		for (const issue of params.channelIssues.slice(0, 12)) {
			const fixText = issue.fix ? ` · fix: ${issue.fix}` : "";
			lines.push(`  - ${issue.channel}[${issue.accountId}] ${issue.kind}: ${issue.message}${fixText}`);
		}
		if (params.channelIssues.length > 12) lines.push(`  ${muted(`… +${params.channelIssues.length - 12} more`)}`);
	} else emitCheck(`Channel issues skipped (gateway ${params.gatewayReachable ? "query failed" : "unreachable"})`, "warn");
	const healthErr = (() => {
		if (!params.health || typeof params.health !== "object") return "";
		const record = params.health;
		if (!("error" in record)) return "";
		const value = record.error;
		if (!value) return "";
		if (typeof value === "string") return value;
		try {
			return JSON.stringify(value, null, 2);
		} catch {
			return "[unserializable error]";
		}
	})();
	if (healthErr) {
		lines.push("");
		lines.push(muted("Gateway health:"));
		lines.push(`  ${muted(redactSecrets(healthErr))}`);
	}
	lines.push("");
	lines.push(muted("Pasteable debug report. Auth tokens redacted."));
	lines.push("Troubleshooting: https://docs.openclaw.ai/troubleshooting");
	lines.push("");
}

//#endregion
//#region src/commands/status-all/report-lines.ts
async function buildStatusAllReportLines(params) {
	const rich = isRich();
	const heading = (text) => rich ? theme.heading(text) : text;
	const ok = (text) => rich ? theme.success(text) : text;
	const warn = (text) => rich ? theme.warn(text) : text;
	const fail = (text) => rich ? theme.error(text) : text;
	const muted = (text) => rich ? theme.muted(text) : text;
	const tableWidth = Math.max(60, (process.stdout.columns ?? 120) - 1);
	const overview = renderTable({
		width: tableWidth,
		columns: [{
			key: "Item",
			header: "Item",
			minWidth: 10
		}, {
			key: "Value",
			header: "Value",
			flex: true,
			minWidth: 24
		}],
		rows: params.overviewRows
	});
	const channelRows = params.channels.rows.map((row) => ({
		channelId: row.id,
		Channel: row.label,
		Enabled: row.enabled ? ok("ON") : muted("OFF"),
		State: row.state === "ok" ? ok("OK") : row.state === "warn" ? warn("WARN") : row.state === "off" ? muted("OFF") : theme.accentDim("SETUP"),
		Detail: row.detail
	}));
	const channelIssuesByChannel = (() => {
		const map = /* @__PURE__ */ new Map();
		for (const issue of params.channelIssues) {
			const key = issue.channel;
			const list = map.get(key);
			if (list) list.push(issue);
			else map.set(key, [issue]);
		}
		return map;
	})();
	const channelsTable = renderTable({
		width: tableWidth,
		columns: [
			{
				key: "Channel",
				header: "Channel",
				minWidth: 10
			},
			{
				key: "Enabled",
				header: "Enabled",
				minWidth: 7
			},
			{
				key: "State",
				header: "State",
				minWidth: 8
			},
			{
				key: "Detail",
				header: "Detail",
				flex: true,
				minWidth: 28
			}
		],
		rows: channelRows.map((row) => {
			const issues = channelIssuesByChannel.get(row.channelId) ?? [];
			if (issues.length === 0) return row;
			const issue = issues[0];
			const suffix = ` · ${warn(`gateway: ${String(issue.message).slice(0, 90)}`)}`;
			return {
				...row,
				State: warn("WARN"),
				Detail: `${row.Detail}${suffix}`
			};
		})
	});
	const agentsTable = renderTable({
		width: tableWidth,
		columns: [
			{
				key: "Agent",
				header: "Agent",
				minWidth: 12
			},
			{
				key: "Bootstrap",
				header: "Bootstrap",
				minWidth: 10
			},
			{
				key: "Sessions",
				header: "Sessions",
				align: "right",
				minWidth: 8
			},
			{
				key: "Active",
				header: "Active",
				minWidth: 10
			},
			{
				key: "Store",
				header: "Store",
				flex: true,
				minWidth: 34
			}
		],
		rows: params.agentStatus.agents.map((a) => ({
			Agent: a.name?.trim() ? `${a.id} (${a.name.trim()})` : a.id,
			Bootstrap: a.bootstrapPending === true ? warn("PENDING") : a.bootstrapPending === false ? ok("OK") : "unknown",
			Sessions: String(a.sessionsCount),
			Active: a.lastActiveAgeMs != null ? formatTimeAgo(a.lastActiveAgeMs) : "unknown",
			Store: a.sessionsPath
		}))
	});
	const lines = [];
	lines.push(heading("OpenClaw status --all"));
	lines.push("");
	lines.push(heading("Overview"));
	lines.push(overview.trimEnd());
	lines.push("");
	lines.push(heading("Channels"));
	lines.push(channelsTable.trimEnd());
	for (const detail of params.channels.details) {
		lines.push("");
		lines.push(heading(detail.title));
		lines.push(renderTable({
			width: tableWidth,
			columns: detail.columns.map((c) => ({
				key: c,
				header: c,
				flex: c === "Notes",
				minWidth: c === "Notes" ? 28 : 10
			})),
			rows: detail.rows.map((r) => ({
				...r,
				...r.Status === "OK" ? { Status: ok("OK") } : r.Status === "WARN" ? { Status: warn("WARN") } : {}
			}))
		}).trimEnd());
	}
	lines.push("");
	lines.push(heading("Agents"));
	lines.push(agentsTable.trimEnd());
	lines.push("");
	lines.push(heading("Diagnosis (read-only)"));
	await appendStatusAllDiagnosis({
		lines,
		progress: params.progress,
		muted,
		ok,
		warn,
		fail,
		connectionDetailsForReport: params.connectionDetailsForReport,
		...params.diagnosis
	});
	return lines;
}

//#endregion
//#region src/commands/status-all.ts
async function statusAllCommand(runtime, opts) {
	await withProgress({
		label: "Scanning status --all…",
		total: 11
	}, async (progress) => {
		progress.setLabel("Loading config…");
		const cfg = loadConfig();
		const osSummary = resolveOsSummary();
		const snap = await readConfigFileSnapshot().catch(() => null);
		progress.tick();
		progress.setLabel("Checking Tailscale…");
		const tailscaleMode = cfg.gateway?.tailscale?.mode ?? "off";
		const tailscale = await (async () => {
			try {
				const parsed = await readTailscaleStatusJson(runExec, { timeoutMs: 1200 });
				const backendState = typeof parsed.BackendState === "string" ? parsed.BackendState : null;
				const self = typeof parsed.Self === "object" && parsed.Self !== null ? parsed.Self : null;
				const dnsNameRaw = self && typeof self.DNSName === "string" ? self.DNSName : null;
				return {
					ok: true,
					backendState,
					dnsName: dnsNameRaw ? dnsNameRaw.replace(/\.$/, "") : null,
					ips: self && Array.isArray(self.TailscaleIPs) ? self.TailscaleIPs.filter((v) => typeof v === "string" && v.trim().length > 0).map((v) => v.trim()) : [],
					error: null
				};
			} catch (err) {
				return {
					ok: false,
					backendState: null,
					dnsName: null,
					ips: [],
					error: String(err)
				};
			}
		})();
		const tailscaleHttpsUrl = tailscaleMode !== "off" && tailscale.dnsName ? `https://${tailscale.dnsName}${normalizeControlUiBasePath(cfg.gateway?.controlUi?.basePath)}` : null;
		progress.tick();
		progress.setLabel("Checking for updates…");
		const update = await checkUpdateStatus({
			root: await resolveOpenClawPackageRoot({
				moduleUrl: import.meta.url,
				argv1: process.argv[1],
				cwd: process.cwd()
			}),
			timeoutMs: 6500,
			fetchGit: true,
			includeRegistry: true
		});
		const channelInfo = resolveEffectiveUpdateChannel({
			configChannel: normalizeUpdateChannel(cfg.update?.channel),
			installKind: update.installKind,
			git: update.git ? {
				tag: update.git.tag,
				branch: update.git.branch
			} : void 0
		});
		const channelLabel = formatUpdateChannelLabel({
			channel: channelInfo.channel,
			source: channelInfo.source,
			gitTag: update.git?.tag ?? null,
			gitBranch: update.git?.branch ?? null
		});
		const gitLabel = update.installKind === "git" ? (() => {
			const shortSha = update.git?.sha ? update.git.sha.slice(0, 8) : null;
			const branch = update.git?.branch && update.git.branch !== "HEAD" ? update.git.branch : null;
			const tag = update.git?.tag ?? null;
			return [
				branch ?? (tag ? "detached" : "git"),
				tag ? `tag ${tag}` : null,
				shortSha ? `@ ${shortSha}` : null
			].filter(Boolean).join(" · ");
		})() : null;
		progress.tick();
		progress.setLabel("Probing gateway…");
		const connection = buildGatewayConnectionDetails({ config: cfg });
		const isRemoteMode = cfg.gateway?.mode === "remote";
		const remoteUrlRaw = typeof cfg.gateway?.remote?.url === "string" ? cfg.gateway.remote.url.trim() : "";
		const remoteUrlMissing = isRemoteMode && !remoteUrlRaw;
		const gatewayMode = isRemoteMode ? "remote" : "local";
		const resolveProbeAuth = (mode) => {
			const authToken = cfg.gateway?.auth?.token;
			const authPassword = cfg.gateway?.auth?.password;
			const remote = cfg.gateway?.remote;
			return {
				token: mode === "remote" ? typeof remote?.token === "string" && remote.token.trim() ? remote.token.trim() : void 0 : process.env.OPENCLAW_GATEWAY_TOKEN?.trim() || (typeof authToken === "string" && authToken.trim() ? authToken.trim() : void 0),
				password: process.env.OPENCLAW_GATEWAY_PASSWORD?.trim() || (mode === "remote" ? typeof remote?.password === "string" && remote.password.trim() ? remote.password.trim() : void 0 : typeof authPassword === "string" && authPassword.trim() ? authPassword.trim() : void 0)
			};
		};
		const localFallbackAuth = resolveProbeAuth("local");
		const remoteAuth = resolveProbeAuth("remote");
		const probeAuth = isRemoteMode && !remoteUrlMissing ? remoteAuth : localFallbackAuth;
		const gatewayProbe = await probeGateway({
			url: connection.url,
			auth: probeAuth,
			timeoutMs: Math.min(5e3, opts?.timeoutMs ?? 1e4)
		}).catch(() => null);
		const gatewayReachable = gatewayProbe?.ok === true;
		const gatewaySelf = pickGatewaySelfPresence$1(gatewayProbe?.presence ?? null);
		progress.tick();
		progress.setLabel("Checking services…");
		const readServiceSummary = async (service) => {
			try {
				const [loaded, runtimeInfo, command] = await Promise.all([
					service.isLoaded({ env: process.env }).catch(() => false),
					service.readRuntime(process.env).catch(() => void 0),
					service.readCommand(process.env).catch(() => null)
				]);
				const installed = command != null;
				return {
					label: service.label,
					installed,
					loaded,
					loadedText: loaded ? service.loadedText : service.notLoadedText,
					runtime: runtimeInfo
				};
			} catch {
				return null;
			}
		};
		const daemon = await readServiceSummary(resolveGatewayService());
		const nodeService = await readServiceSummary(resolveNodeService());
		progress.tick();
		progress.setLabel("Scanning agents…");
		const agentStatus = await getAgentLocalStatuses$1(cfg);
		progress.tick();
		progress.setLabel("Summarizing channels…");
		const channels = await buildChannelsTable(cfg, { showSecrets: false });
		progress.tick();
		const connectionDetailsForReport = (() => {
			if (!remoteUrlMissing) return connection.message;
			const bindMode = cfg.gateway?.bind ?? "loopback";
			return [
				"Gateway mode: remote",
				"Gateway target: (missing gateway.remote.url)",
				`Config: ${snap?.path?.trim() ? snap.path.trim() : "(unknown config path)"}`,
				`Bind: ${bindMode}`,
				`Local fallback (used for probes): ${connection.url}`,
				"Fix: set gateway.remote.url, or set gateway.mode=local."
			].join("\n");
		})();
		const callOverrides = remoteUrlMissing ? {
			url: connection.url,
			token: localFallbackAuth.token,
			password: localFallbackAuth.password
		} : {};
		progress.setLabel("Querying gateway…");
		const health = gatewayReachable ? await callGateway({
			method: "health",
			timeoutMs: Math.min(8e3, opts?.timeoutMs ?? 1e4),
			...callOverrides
		}).catch((err) => ({ error: String(err) })) : { error: gatewayProbe?.error ?? "gateway unreachable" };
		const channelsStatus = gatewayReachable ? await callGateway({
			method: "channels.status",
			params: {
				probe: false,
				timeoutMs: opts?.timeoutMs ?? 1e4
			},
			timeoutMs: Math.min(8e3, opts?.timeoutMs ?? 1e4),
			...callOverrides
		}).catch(() => null) : null;
		const channelIssues = channelsStatus ? collectChannelStatusIssues(channelsStatus) : [];
		progress.tick();
		progress.setLabel("Checking local state…");
		const sentinel = await readRestartSentinel().catch(() => null);
		const lastErr = await readLastGatewayErrorLine(process.env).catch(() => null);
		const port = resolveGatewayPort(cfg);
		const portUsage = await inspectPortUsage(port).catch(() => null);
		progress.tick();
		const defaultWorkspace = agentStatus.agents.find((a) => a.id === agentStatus.defaultId)?.workspaceDir ?? agentStatus.agents[0]?.workspaceDir ?? null;
		const skillStatus = defaultWorkspace != null ? (() => {
			try {
				return buildWorkspaceSkillStatus(defaultWorkspace, {
					config: cfg,
					eligibility: { remote: getRemoteSkillEligibility() }
				});
			} catch {
				return null;
			}
		})() : null;
		const dashboard = cfg.gateway?.controlUi?.enabled ?? true ? resolveControlUiLinks({
			port,
			bind: cfg.gateway?.bind,
			customBindHost: cfg.gateway?.customBindHost,
			basePath: cfg.gateway?.controlUi?.basePath
		}).httpUrl : null;
		const updateLine = (() => {
			if (update.installKind === "git" && update.git) {
				const parts = [];
				parts.push(update.git.branch ? `git ${update.git.branch}` : "git");
				if (update.git.upstream) parts.push(`↔ ${update.git.upstream}`);
				if (update.git.dirty) parts.push("dirty");
				if (update.git.behind != null && update.git.ahead != null) if (update.git.behind === 0 && update.git.ahead === 0) parts.push("up to date");
				else if (update.git.behind > 0 && update.git.ahead === 0) parts.push(`behind ${update.git.behind}`);
				else if (update.git.behind === 0 && update.git.ahead > 0) parts.push(`ahead ${update.git.ahead}`);
				else parts.push(`diverged (ahead ${update.git.ahead}, behind ${update.git.behind})`);
				if (update.git.fetchOk === false) parts.push("fetch failed");
				const latest = update.registry?.latestVersion;
				if (latest) {
					const cmp = compareSemverStrings(VERSION, latest);
					if (cmp === 0) parts.push(`npm latest ${latest}`);
					else if (cmp != null && cmp < 0) parts.push(`npm update ${latest}`);
					else parts.push(`npm latest ${latest} (local newer)`);
				} else if (update.registry?.error) parts.push("npm latest unknown");
				if (update.deps?.status === "ok") parts.push("deps ok");
				if (update.deps?.status === "stale") parts.push("deps stale");
				if (update.deps?.status === "missing") parts.push("deps missing");
				return parts.join(" · ");
			}
			const parts = [];
			parts.push(update.packageManager !== "unknown" ? update.packageManager : "pkg");
			const latest = update.registry?.latestVersion;
			if (latest) {
				const cmp = compareSemverStrings(VERSION, latest);
				if (cmp === 0) parts.push(`npm latest ${latest}`);
				else if (cmp != null && cmp < 0) parts.push(`npm update ${latest}`);
				else parts.push(`npm latest ${latest} (local newer)`);
			} else if (update.registry?.error) parts.push("npm latest unknown");
			if (update.deps?.status === "ok") parts.push("deps ok");
			if (update.deps?.status === "stale") parts.push("deps stale");
			if (update.deps?.status === "missing") parts.push("deps missing");
			return parts.join(" · ");
		})();
		const gatewayTarget = remoteUrlMissing ? `fallback ${connection.url}` : connection.url;
		const gatewayStatus = gatewayReachable ? `reachable ${formatDurationPrecise(gatewayProbe?.connectLatencyMs ?? 0)}` : gatewayProbe?.error ? `unreachable (${gatewayProbe.error})` : "unreachable";
		const gatewayAuth = gatewayReachable ? ` · auth ${formatGatewayAuthUsed(probeAuth)}` : "";
		const gatewaySelfLine = gatewaySelf?.host || gatewaySelf?.ip || gatewaySelf?.version || gatewaySelf?.platform ? [
			gatewaySelf.host ? gatewaySelf.host : null,
			gatewaySelf.ip ? `(${gatewaySelf.ip})` : null,
			gatewaySelf.version ? `app ${gatewaySelf.version}` : null,
			gatewaySelf.platform ? gatewaySelf.platform : null
		].filter(Boolean).join(" ") : null;
		const aliveThresholdMs = 10 * 6e4;
		const aliveAgents = agentStatus.agents.filter((a) => a.lastActiveAgeMs != null && a.lastActiveAgeMs <= aliveThresholdMs).length;
		const lines = await buildStatusAllReportLines({
			progress,
			overviewRows: [
				{
					Item: "Version",
					Value: VERSION
				},
				{
					Item: "OS",
					Value: osSummary.label
				},
				{
					Item: "Node",
					Value: process.versions.node
				},
				{
					Item: "Config",
					Value: snap?.path?.trim() ? snap.path.trim() : "(unknown config path)"
				},
				dashboard ? {
					Item: "Dashboard",
					Value: dashboard
				} : {
					Item: "Dashboard",
					Value: "disabled"
				},
				{
					Item: "Tailscale",
					Value: tailscaleMode === "off" ? `off${tailscale.backendState ? ` · ${tailscale.backendState}` : ""}${tailscale.dnsName ? ` · ${tailscale.dnsName}` : ""}` : tailscale.dnsName && tailscaleHttpsUrl ? `${tailscaleMode} · ${tailscale.backendState ?? "unknown"} · ${tailscale.dnsName} · ${tailscaleHttpsUrl}` : `${tailscaleMode} · ${tailscale.backendState ?? "unknown"} · magicdns unknown`
				},
				{
					Item: "Channel",
					Value: channelLabel
				},
				...gitLabel ? [{
					Item: "Git",
					Value: gitLabel
				}] : [],
				{
					Item: "Update",
					Value: updateLine
				},
				{
					Item: "Gateway",
					Value: `${gatewayMode}${remoteUrlMissing ? " (remote.url missing)" : ""} · ${gatewayTarget} (${connection.urlSource}) · ${gatewayStatus}${gatewayAuth}`
				},
				{
					Item: "Security",
					Value: `Run: ${formatCliCommand("openclaw security audit --deep")}`
				},
				gatewaySelfLine ? {
					Item: "Gateway self",
					Value: gatewaySelfLine
				} : {
					Item: "Gateway self",
					Value: "unknown"
				},
				daemon ? {
					Item: "Gateway service",
					Value: !daemon.installed ? `${daemon.label} not installed` : `${daemon.label} ${daemon.installed ? "installed · " : ""}${daemon.loadedText}${daemon.runtime?.status ? ` · ${daemon.runtime.status}` : ""}${daemon.runtime?.pid ? ` (pid ${daemon.runtime.pid})` : ""}`
				} : {
					Item: "Gateway service",
					Value: "unknown"
				},
				nodeService ? {
					Item: "Node service",
					Value: !nodeService.installed ? `${nodeService.label} not installed` : `${nodeService.label} ${nodeService.installed ? "installed · " : ""}${nodeService.loadedText}${nodeService.runtime?.status ? ` · ${nodeService.runtime.status}` : ""}${nodeService.runtime?.pid ? ` (pid ${nodeService.runtime.pid})` : ""}`
				} : {
					Item: "Node service",
					Value: "unknown"
				},
				{
					Item: "Agents",
					Value: `${agentStatus.agents.length} total · ${agentStatus.bootstrapPendingCount} bootstrapping · ${aliveAgents} active · ${agentStatus.totalSessions} sessions`
				}
			],
			channels,
			channelIssues: channelIssues.map((issue) => ({
				channel: issue.channel,
				message: issue.message
			})),
			agentStatus,
			connectionDetailsForReport,
			diagnosis: {
				snap,
				remoteUrlMissing,
				sentinel,
				lastErr,
				port,
				portUsage,
				tailscaleMode,
				tailscale,
				tailscaleHttpsUrl,
				skillStatus,
				channelsStatus,
				channelIssues,
				gatewayReachable,
				health
			}
		});
		progress.setLabel("Rendering…");
		runtime.log(lines.join("\n"));
		progress.tick();
	});
}

//#endregion
//#region src/commands/status.format.ts
const formatKTokens = (value) => `${(value / 1e3).toFixed(value >= 1e4 ? 0 : 1)}k`;
const formatDuration = (ms) => {
	if (ms == null || !Number.isFinite(ms)) return "unknown";
	return formatDurationPrecise(ms, { decimals: 1 });
};
const shortenText = (value, maxLen) => {
	const chars = Array.from(value);
	if (chars.length <= maxLen) return value;
	return `${chars.slice(0, Math.max(0, maxLen - 1)).join("")}…`;
};
const formatTokensCompact = (sess) => {
	const used = sess.totalTokens;
	const ctx = sess.contextTokens;
	if (used == null) return ctx ? `unknown/${formatKTokens(ctx)} (?%)` : "unknown used";
	if (!ctx) return `${formatKTokens(used)} used`;
	const pctLabel = sess.percentUsed != null ? `${sess.percentUsed}%` : "?%";
	return `${formatKTokens(used)}/${formatKTokens(ctx)} (${pctLabel})`;
};
const formatDaemonRuntimeShort = (runtime) => {
	if (!runtime) return null;
	const status = runtime.status ?? "unknown";
	const details = [];
	if (runtime.pid) details.push(`pid ${runtime.pid}`);
	if (runtime.state && runtime.state.toLowerCase() !== status) details.push(`state ${runtime.state}`);
	const detail = runtime.detail?.replace(/\s+/g, " ").trim() || "";
	const noisyLaunchctlDetail = runtime.missingUnit === true && detail.toLowerCase().includes("could not find service");
	if (detail && !noisyLaunchctlDetail) details.push(detail);
	return details.length > 0 ? `${status} (${details.join(", ")})` : status;
};

//#endregion
//#region src/commands/status.daemon.ts
async function buildDaemonStatusSummary(service, fallbackLabel) {
	try {
		const [loaded, runtime, command] = await Promise.all([
			service.isLoaded({ env: process.env }).catch(() => false),
			service.readRuntime(process.env).catch(() => void 0),
			service.readCommand(process.env).catch(() => null)
		]);
		const installed = command != null;
		const loadedText = loaded ? service.loadedText : service.notLoadedText;
		const runtimeShort = formatDaemonRuntimeShort(runtime);
		return {
			label: service.label,
			installed,
			loadedText,
			runtimeShort
		};
	} catch {
		return {
			label: fallbackLabel,
			installed: null,
			loadedText: "unknown",
			runtimeShort: null
		};
	}
}
async function getDaemonStatusSummary() {
	return await buildDaemonStatusSummary(resolveGatewayService(), "Daemon");
}
async function getNodeDaemonStatusSummary() {
	return await buildDaemonStatusSummary(resolveNodeService(), "Node");
}

//#endregion
//#region src/commands/status.gateway-probe.ts
function resolveGatewayProbeAuth(cfg) {
	const isRemoteMode = cfg.gateway?.mode === "remote";
	const remote = isRemoteMode ? cfg.gateway?.remote : void 0;
	const authToken = cfg.gateway?.auth?.token;
	const authPassword = cfg.gateway?.auth?.password;
	return {
		token: isRemoteMode ? typeof remote?.token === "string" && remote.token.trim().length > 0 ? remote.token.trim() : void 0 : process.env.OPENCLAW_GATEWAY_TOKEN?.trim() || (typeof authToken === "string" && authToken.trim().length > 0 ? authToken.trim() : void 0),
		password: process.env.OPENCLAW_GATEWAY_PASSWORD?.trim() || (isRemoteMode ? typeof remote?.password === "string" && remote.password.trim().length > 0 ? remote.password.trim() : void 0 : typeof authPassword === "string" && authPassword.trim().length > 0 ? authPassword.trim() : void 0)
	};
}
function pickGatewaySelfPresence(presence) {
	if (!Array.isArray(presence)) return null;
	const self = presence.find((e) => e.mode === "gateway" && e.reason === "self") ?? null;
	if (!self) return null;
	return {
		host: typeof self.host === "string" ? self.host : void 0,
		ip: typeof self.ip === "string" ? self.ip : void 0,
		version: typeof self.version === "string" ? self.version : void 0,
		platform: typeof self.platform === "string" ? self.platform : void 0
	};
}

//#endregion
//#region src/commands/status.agent-local.ts
async function fileExists(p) {
	try {
		await fsPromises.access(p);
		return true;
	} catch {
		return false;
	}
}
async function getAgentLocalStatuses() {
	const cfg = loadConfig();
	const agentList = listAgentsForGateway(cfg);
	const now = Date.now();
	const statuses = [];
	for (const agent of agentList.agents) {
		const agentId = agent.id;
		const workspaceDir = (() => {
			try {
				return resolveAgentWorkspaceDir(cfg, agentId);
			} catch {
				return null;
			}
		})();
		const bootstrapPath = workspaceDir != null ? path.join(workspaceDir, "BOOTSTRAP.md") : null;
		const bootstrapPending = bootstrapPath != null ? await fileExists(bootstrapPath) : null;
		const sessionsPath = resolveStorePath(cfg.session?.store, { agentId });
		const store = (() => {
			try {
				return loadSessionStore(sessionsPath);
			} catch {
				return {};
			}
		})();
		const sessions = Object.entries(store).filter(([key]) => key !== "global" && key !== "unknown").map(([, entry]) => entry);
		const sessionsCount = sessions.length;
		const lastUpdatedAt = sessions.reduce((max, e) => Math.max(max, e?.updatedAt ?? 0), 0);
		const resolvedLastUpdatedAt = lastUpdatedAt > 0 ? lastUpdatedAt : null;
		const lastActiveAgeMs = resolvedLastUpdatedAt ? now - resolvedLastUpdatedAt : null;
		statuses.push({
			id: agentId,
			name: agent.name,
			workspaceDir,
			bootstrapPending,
			sessionsPath,
			sessionsCount,
			lastUpdatedAt: resolvedLastUpdatedAt,
			lastActiveAgeMs
		});
	}
	const totalSessions = statuses.reduce((sum, s) => sum + s.sessionsCount, 0);
	const bootstrapPendingCount = statuses.reduce((sum, s) => sum + (s.bootstrapPending ? 1 : 0), 0);
	return {
		defaultId: agentList.defaultId,
		agents: statuses,
		totalSessions,
		bootstrapPendingCount
	};
}

//#endregion
//#region src/commands/status.link-channel.ts
async function resolveLinkChannelContext(cfg) {
	for (const plugin of listChannelPlugins()) {
		const defaultAccountId = resolveChannelDefaultAccountId({
			plugin,
			cfg,
			accountIds: plugin.config.listAccountIds(cfg)
		});
		const account = plugin.config.resolveAccount(cfg, defaultAccountId);
		const enabled = plugin.config.isEnabled ? plugin.config.isEnabled(account, cfg) : true;
		const configured = plugin.config.isConfigured ? await plugin.config.isConfigured(account, cfg) : true;
		const snapshot = plugin.config.describeAccount ? plugin.config.describeAccount(account, cfg) : {
			accountId: defaultAccountId,
			enabled,
			configured
		};
		const summaryRecord = plugin.status?.buildChannelSummary ? await plugin.status.buildChannelSummary({
			account,
			cfg,
			defaultAccountId,
			snapshot
		}) : void 0;
		const linked = summaryRecord && typeof summaryRecord.linked === "boolean" ? summaryRecord.linked : null;
		if (linked === null) continue;
		return {
			linked,
			authAgeMs: summaryRecord && typeof summaryRecord.authAgeMs === "number" ? summaryRecord.authAgeMs : null,
			account,
			accountId: defaultAccountId,
			plugin
		};
	}
	return null;
}

//#endregion
//#region src/commands/status.summary.ts
const classifyKey = (key, entry) => {
	if (key === "global") return "global";
	if (key === "unknown") return "unknown";
	if (entry?.chatType === "group" || entry?.chatType === "channel") return "group";
	if (key.includes(":group:") || key.includes(":channel:")) return "group";
	return "direct";
};
const buildFlags = (entry) => {
	if (!entry) return [];
	const flags = [];
	const think = entry?.thinkingLevel;
	if (typeof think === "string" && think.length > 0) flags.push(`think:${think}`);
	const verbose = entry?.verboseLevel;
	if (typeof verbose === "string" && verbose.length > 0) flags.push(`verbose:${verbose}`);
	const reasoning = entry?.reasoningLevel;
	if (typeof reasoning === "string" && reasoning.length > 0) flags.push(`reasoning:${reasoning}`);
	const elevated = entry?.elevatedLevel;
	if (typeof elevated === "string" && elevated.length > 0) flags.push(`elevated:${elevated}`);
	if (entry?.systemSent) flags.push("system");
	if (entry?.abortedLastRun) flags.push("aborted");
	const sessionId = entry?.sessionId;
	if (typeof sessionId === "string" && sessionId.length > 0) flags.push(`id:${sessionId}`);
	return flags;
};
async function getStatusSummary() {
	const cfg = loadConfig();
	const linkContext = await resolveLinkChannelContext(cfg);
	const agentList = listAgentsForGateway(cfg);
	const heartbeatAgents = agentList.agents.map((agent) => {
		const summary = resolveHeartbeatSummaryForAgent(cfg, agent.id);
		return {
			agentId: agent.id,
			enabled: summary.enabled,
			every: summary.every,
			everyMs: summary.everyMs
		};
	});
	const channelSummary = await buildChannelSummary(cfg, {
		colorize: true,
		includeAllowFrom: true
	});
	const queuedSystemEvents = peekSystemEvents(resolveMainSessionKey(cfg));
	const configModel = resolveConfiguredModelRef({
		cfg,
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	}).model ?? DEFAULT_MODEL;
	const configContextTokens = cfg.agents?.defaults?.contextTokens ?? lookupContextTokens(configModel) ?? DEFAULT_CONTEXT_TOKENS;
	const now = Date.now();
	const storeCache = /* @__PURE__ */ new Map();
	const loadStore = (storePath) => {
		const cached = storeCache.get(storePath);
		if (cached) return cached;
		const store = loadSessionStore(storePath);
		storeCache.set(storePath, store);
		return store;
	};
	const buildSessionRows = (store, opts = {}) => Object.entries(store).filter(([key]) => key !== "global" && key !== "unknown").map(([key, entry]) => {
		const updatedAt = entry?.updatedAt ?? null;
		const age = updatedAt ? now - updatedAt : null;
		const model = entry?.model ?? configModel ?? null;
		const contextTokens = entry?.contextTokens ?? lookupContextTokens(model) ?? configContextTokens ?? null;
		const total = resolveFreshSessionTotalTokens(entry);
		const totalTokensFresh = typeof entry?.totalTokens === "number" ? entry?.totalTokensFresh !== false : false;
		const remaining = contextTokens != null && total !== void 0 ? Math.max(0, contextTokens - total) : null;
		const pct = contextTokens && contextTokens > 0 && total !== void 0 ? Math.min(999, Math.round(total / contextTokens * 100)) : null;
		const parsedAgentId = parseAgentSessionKey(key)?.agentId;
		return {
			agentId: opts.agentIdOverride ?? parsedAgentId,
			key,
			kind: classifyKey(key, entry),
			sessionId: entry?.sessionId,
			updatedAt,
			age,
			thinkingLevel: entry?.thinkingLevel,
			verboseLevel: entry?.verboseLevel,
			reasoningLevel: entry?.reasoningLevel,
			elevatedLevel: entry?.elevatedLevel,
			systemSent: entry?.systemSent,
			abortedLastRun: entry?.abortedLastRun,
			inputTokens: entry?.inputTokens,
			outputTokens: entry?.outputTokens,
			totalTokens: total ?? null,
			totalTokensFresh,
			remainingTokens: remaining,
			percentUsed: pct,
			model,
			contextTokens,
			flags: buildFlags(entry)
		};
	}).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
	const paths = /* @__PURE__ */ new Set();
	const byAgent = agentList.agents.map((agent) => {
		const storePath = resolveStorePath(cfg.session?.store, { agentId: agent.id });
		paths.add(storePath);
		const sessions = buildSessionRows(loadStore(storePath), { agentIdOverride: agent.id });
		return {
			agentId: agent.id,
			path: storePath,
			count: sessions.length,
			recent: sessions.slice(0, 10)
		};
	});
	const allSessions = Array.from(paths).flatMap((storePath) => buildSessionRows(loadStore(storePath))).toSorted((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
	const recent = allSessions.slice(0, 10);
	const totalSessions = allSessions.length;
	return {
		linkChannel: linkContext ? {
			id: linkContext.plugin.id,
			label: linkContext.plugin.meta.label ?? "Channel",
			linked: linkContext.linked,
			authAgeMs: linkContext.authAgeMs
		} : void 0,
		heartbeat: {
			defaultAgentId: agentList.defaultId,
			agents: heartbeatAgents
		},
		channelSummary,
		queuedSystemEvents,
		sessions: {
			paths: Array.from(paths),
			count: totalSessions,
			defaults: {
				model: configModel ?? null,
				contextTokens: configContextTokens ?? null
			},
			recent,
			byAgent
		}
	};
}

//#endregion
//#region src/commands/status.scan.ts
function resolveMemoryPluginStatus(cfg) {
	if (!(cfg.plugins?.enabled !== false)) return {
		enabled: false,
		slot: null,
		reason: "plugins disabled"
	};
	const raw = typeof cfg.plugins?.slots?.memory === "string" ? cfg.plugins.slots.memory.trim() : "";
	if (raw && raw.toLowerCase() === "none") return {
		enabled: false,
		slot: null,
		reason: "plugins.slots.memory=\"none\""
	};
	return {
		enabled: true,
		slot: raw || "memory-core"
	};
}
async function scanStatus(opts, _runtime) {
	return await withProgress({
		label: "Scanning status…",
		total: 10,
		enabled: opts.json !== true
	}, async (progress) => {
		progress.setLabel("Loading config…");
		const cfg = loadConfig();
		const osSummary = resolveOsSummary();
		progress.tick();
		progress.setLabel("Checking Tailscale…");
		const tailscaleMode = cfg.gateway?.tailscale?.mode ?? "off";
		const tailscaleDns = tailscaleMode === "off" ? null : await getTailnetHostname((cmd, args) => runExec(cmd, args, {
			timeoutMs: 1200,
			maxBuffer: 2e5
		})).catch(() => null);
		const tailscaleHttpsUrl = tailscaleMode !== "off" && tailscaleDns ? `https://${tailscaleDns}${normalizeControlUiBasePath(cfg.gateway?.controlUi?.basePath)}` : null;
		progress.tick();
		progress.setLabel("Checking for updates…");
		const update = await getUpdateCheckResult({
			timeoutMs: opts.all ? 6500 : 2500,
			fetchGit: true,
			includeRegistry: true
		});
		progress.tick();
		progress.setLabel("Resolving agents…");
		const agentStatus = await getAgentLocalStatuses();
		progress.tick();
		progress.setLabel("Probing gateway…");
		const gatewayConnection = buildGatewayConnectionDetails();
		const isRemoteMode = cfg.gateway?.mode === "remote";
		const remoteUrlRaw = typeof cfg.gateway?.remote?.url === "string" ? cfg.gateway.remote.url : "";
		const remoteUrlMissing = isRemoteMode && !remoteUrlRaw.trim();
		const gatewayMode = isRemoteMode ? "remote" : "local";
		const gatewayProbe = remoteUrlMissing ? null : await probeGateway({
			url: gatewayConnection.url,
			auth: resolveGatewayProbeAuth(cfg),
			timeoutMs: Math.min(opts.all ? 5e3 : 2500, opts.timeoutMs ?? 1e4)
		}).catch(() => null);
		const gatewayReachable = gatewayProbe?.ok === true;
		const gatewaySelf = gatewayProbe?.presence ? pickGatewaySelfPresence(gatewayProbe.presence) : null;
		progress.tick();
		progress.setLabel("Querying channel status…");
		const channelsStatus = gatewayReachable ? await callGateway({
			method: "channels.status",
			params: {
				probe: false,
				timeoutMs: Math.min(8e3, opts.timeoutMs ?? 1e4)
			},
			timeoutMs: Math.min(opts.all ? 5e3 : 2500, opts.timeoutMs ?? 1e4)
		}).catch(() => null) : null;
		const channelIssues = channelsStatus ? collectChannelStatusIssues(channelsStatus) : [];
		progress.tick();
		progress.setLabel("Summarizing channels…");
		const channels = await buildChannelsTable(cfg, { showSecrets: process.env.CLAWDBOT_SHOW_SECRETS?.trim() !== "0" });
		progress.tick();
		progress.setLabel("Checking memory…");
		const memoryPlugin = resolveMemoryPluginStatus(cfg);
		const memory = await (async () => {
			if (!memoryPlugin.enabled) return null;
			if (memoryPlugin.slot !== "memory-core") return null;
			const agentId = agentStatus.defaultId ?? "main";
			const { manager } = await getMemorySearchManager({
				cfg,
				agentId
			});
			if (!manager) return null;
			try {
				await manager.probeVectorAvailability();
			} catch {}
			const status = manager.status();
			await manager.close?.().catch(() => {});
			return {
				agentId,
				...status
			};
		})();
		progress.tick();
		progress.setLabel("Reading sessions…");
		const summary = await getStatusSummary();
		progress.tick();
		progress.setLabel("Rendering…");
		progress.tick();
		return {
			cfg,
			osSummary,
			tailscaleMode,
			tailscaleDns,
			tailscaleHttpsUrl,
			update,
			gatewayConnection,
			remoteUrlMissing,
			gatewayMode,
			gatewayProbe,
			gatewayReachable,
			gatewaySelf,
			channelIssues,
			agentStatus,
			channels,
			summary,
			memory,
			memoryPlugin
		};
	});
}

//#endregion
//#region src/commands/status.command.ts
async function statusCommand(opts, runtime) {
	if (opts.all && !opts.json) {
		await statusAllCommand(runtime, { timeoutMs: opts.timeoutMs });
		return;
	}
	const { cfg, osSummary, tailscaleMode, tailscaleDns, tailscaleHttpsUrl, update, gatewayConnection, remoteUrlMissing, gatewayMode, gatewayProbe, gatewayReachable, gatewaySelf, channelIssues, agentStatus, channels, summary, memory, memoryPlugin } = await scanStatus({
		json: opts.json,
		timeoutMs: opts.timeoutMs,
		all: opts.all
	}, runtime);
	const securityAudit = await withProgress({
		label: "Running security audit…",
		indeterminate: true,
		enabled: opts.json !== true
	}, async () => await runSecurityAudit({
		config: cfg,
		deep: false,
		includeFilesystem: true,
		includeChannelSecurity: true
	}));
	const usage = opts.usage ? await withProgress({
		label: "Fetching usage snapshot…",
		indeterminate: true,
		enabled: opts.json !== true
	}, async () => await loadProviderUsageSummary({ timeoutMs: opts.timeoutMs })) : void 0;
	const health = opts.deep ? await withProgress({
		label: "Checking gateway health…",
		indeterminate: true,
		enabled: opts.json !== true
	}, async () => await callGateway({
		method: "health",
		params: { probe: true },
		timeoutMs: opts.timeoutMs
	})) : void 0;
	const lastHeartbeat = opts.deep && gatewayReachable ? await callGateway({
		method: "last-heartbeat",
		params: {},
		timeoutMs: opts.timeoutMs
	}).catch(() => null) : null;
	const channelInfo = resolveEffectiveUpdateChannel({
		configChannel: normalizeUpdateChannel(cfg.update?.channel),
		installKind: update.installKind,
		git: update.git ? {
			tag: update.git.tag,
			branch: update.git.branch
		} : void 0
	});
	if (opts.json) {
		const [daemon, nodeDaemon] = await Promise.all([getDaemonStatusSummary(), getNodeDaemonStatusSummary()]);
		runtime.log(JSON.stringify({
			...summary,
			os: osSummary,
			update,
			updateChannel: channelInfo.channel,
			updateChannelSource: channelInfo.source,
			memory,
			memoryPlugin,
			gateway: {
				mode: gatewayMode,
				url: gatewayConnection.url,
				urlSource: gatewayConnection.urlSource,
				misconfigured: remoteUrlMissing,
				reachable: gatewayReachable,
				connectLatencyMs: gatewayProbe?.connectLatencyMs ?? null,
				self: gatewaySelf,
				error: gatewayProbe?.error ?? null
			},
			gatewayService: daemon,
			nodeService: nodeDaemon,
			agents: agentStatus,
			securityAudit,
			...health || usage || lastHeartbeat ? {
				health,
				usage,
				lastHeartbeat
			} : {}
		}, null, 2));
		return;
	}
	const muted = (value) => theme.muted(value);
	const ok = (value) => theme.success(value);
	const warn = (value) => theme.warn(value);
	if (opts.verbose) {
		const details = buildGatewayConnectionDetails();
		runtime.log(info("Gateway connection:"));
		for (const line of details.message.split("\n")) runtime.log(`  ${line}`);
		runtime.log("");
	}
	const tableWidth = Math.max(60, (process.stdout.columns ?? 120) - 1);
	const dashboard = (() => {
		if (!(cfg.gateway?.controlUi?.enabled ?? true)) return "disabled";
		return resolveControlUiLinks({
			port: resolveGatewayPort(cfg),
			bind: cfg.gateway?.bind,
			customBindHost: cfg.gateway?.customBindHost,
			basePath: cfg.gateway?.controlUi?.basePath
		}).httpUrl;
	})();
	const gatewayValue = (() => {
		const target = remoteUrlMissing ? `fallback ${gatewayConnection.url}` : `${gatewayConnection.url}${gatewayConnection.urlSource ? ` (${gatewayConnection.urlSource})` : ""}`;
		const reach = remoteUrlMissing ? warn("misconfigured (remote.url missing)") : gatewayReachable ? ok(`reachable ${formatDuration(gatewayProbe?.connectLatencyMs)}`) : warn(gatewayProbe?.error ? `unreachable (${gatewayProbe.error})` : "unreachable");
		const auth = gatewayReachable && !remoteUrlMissing ? ` · auth ${formatGatewayAuthUsed(resolveGatewayProbeAuth(cfg))}` : "";
		const self = gatewaySelf?.host || gatewaySelf?.version || gatewaySelf?.platform ? [
			gatewaySelf?.host ? gatewaySelf.host : null,
			gatewaySelf?.ip ? `(${gatewaySelf.ip})` : null,
			gatewaySelf?.version ? `app ${gatewaySelf.version}` : null,
			gatewaySelf?.platform ? gatewaySelf.platform : null
		].filter(Boolean).join(" ") : null;
		return `${gatewayMode} · ${target} · ${reach}${auth}${self ? ` · ${self}` : ""}`;
	})();
	const agentsValue = (() => {
		const pending = agentStatus.bootstrapPendingCount > 0 ? `${agentStatus.bootstrapPendingCount} bootstrapping` : "no bootstraps";
		const def = agentStatus.agents.find((a) => a.id === agentStatus.defaultId);
		const defActive = def?.lastActiveAgeMs != null ? formatTimeAgo(def.lastActiveAgeMs) : "unknown";
		const defSuffix = def ? ` · default ${def.id} active ${defActive}` : "";
		return `${agentStatus.agents.length} · ${pending} · sessions ${agentStatus.totalSessions}${defSuffix}`;
	})();
	const [daemon, nodeDaemon] = await Promise.all([getDaemonStatusSummary(), getNodeDaemonStatusSummary()]);
	const daemonValue = (() => {
		if (daemon.installed === false) return `${daemon.label} not installed`;
		const installedPrefix = daemon.installed === true ? "installed · " : "";
		return `${daemon.label} ${installedPrefix}${daemon.loadedText}${daemon.runtimeShort ? ` · ${daemon.runtimeShort}` : ""}`;
	})();
	const nodeDaemonValue = (() => {
		if (nodeDaemon.installed === false) return `${nodeDaemon.label} not installed`;
		const installedPrefix = nodeDaemon.installed === true ? "installed · " : "";
		return `${nodeDaemon.label} ${installedPrefix}${nodeDaemon.loadedText}${nodeDaemon.runtimeShort ? ` · ${nodeDaemon.runtimeShort}` : ""}`;
	})();
	const defaults = summary.sessions.defaults;
	const defaultCtx = defaults.contextTokens ? ` (${formatKTokens(defaults.contextTokens)} ctx)` : "";
	const eventsValue = summary.queuedSystemEvents.length > 0 ? `${summary.queuedSystemEvents.length} queued` : "none";
	const probesValue = health ? ok("enabled") : muted("skipped (use --deep)");
	const heartbeatValue = (() => {
		const parts = summary.heartbeat.agents.map((agent) => {
			if (!agent.enabled || !agent.everyMs) return `disabled (${agent.agentId})`;
			return `${agent.every} (${agent.agentId})`;
		}).filter(Boolean);
		return parts.length > 0 ? parts.join(", ") : "disabled";
	})();
	const lastHeartbeatValue = (() => {
		if (!opts.deep) return null;
		if (!gatewayReachable) return warn("unavailable");
		if (!lastHeartbeat) return muted("none");
		const age = formatTimeAgo(Date.now() - lastHeartbeat.ts);
		const channel = lastHeartbeat.channel ?? "unknown";
		const accountLabel = lastHeartbeat.accountId ? `account ${lastHeartbeat.accountId}` : null;
		return [
			lastHeartbeat.status,
			`${age} ago`,
			channel,
			accountLabel
		].filter(Boolean).join(" · ");
	})();
	const storeLabel = summary.sessions.paths.length > 1 ? `${summary.sessions.paths.length} stores` : summary.sessions.paths[0] ?? "unknown";
	const memoryValue = (() => {
		if (!memoryPlugin.enabled) return muted(`disabled${memoryPlugin.reason ? ` (${memoryPlugin.reason})` : ""}`);
		if (!memory) {
			const slot = memoryPlugin.slot ? `plugin ${memoryPlugin.slot}` : "plugin";
			if (memoryPlugin.slot && memoryPlugin.slot !== "memory-core") return `enabled (${slot})`;
			return muted(`enabled (${slot}) · unavailable`);
		}
		const parts = [];
		const dirtySuffix = memory.dirty ? ` · ${warn("dirty")}` : "";
		parts.push(`${memory.files} files · ${memory.chunks} chunks${dirtySuffix}`);
		if (memory.sources?.length) parts.push(`sources ${memory.sources.join(", ")}`);
		if (memoryPlugin.slot) parts.push(`plugin ${memoryPlugin.slot}`);
		const colorByTone = (tone, text) => tone === "ok" ? ok(text) : tone === "warn" ? warn(text) : muted(text);
		const vector = memory.vector;
		if (vector) {
			const state = resolveMemoryVectorState(vector);
			const label = state.state === "disabled" ? "vector off" : `vector ${state.state}`;
			parts.push(colorByTone(state.tone, label));
		}
		const fts = memory.fts;
		if (fts) {
			const state = resolveMemoryFtsState(fts);
			const label = state.state === "disabled" ? "fts off" : `fts ${state.state}`;
			parts.push(colorByTone(state.tone, label));
		}
		const cache = memory.cache;
		if (cache) {
			const summary = resolveMemoryCacheSummary(cache);
			parts.push(colorByTone(summary.tone, summary.text));
		}
		return parts.join(" · ");
	})();
	const updateAvailability = resolveUpdateAvailability(update);
	const updateLine = formatUpdateOneLiner(update).replace(/^Update:\s*/i, "");
	const channelLabel = formatUpdateChannelLabel({
		channel: channelInfo.channel,
		source: channelInfo.source,
		gitTag: update.git?.tag ?? null,
		gitBranch: update.git?.branch ?? null
	});
	const gitLabel = update.installKind === "git" ? (() => {
		const shortSha = update.git?.sha ? update.git.sha.slice(0, 8) : null;
		const branch = update.git?.branch && update.git.branch !== "HEAD" ? update.git.branch : null;
		const tag = update.git?.tag ?? null;
		return [
			branch ?? (tag ? "detached" : "git"),
			tag ? `tag ${tag}` : null,
			shortSha ? `@ ${shortSha}` : null
		].filter(Boolean).join(" · ");
	})() : null;
	const overviewRows = [
		{
			Item: "Dashboard",
			Value: dashboard
		},
		{
			Item: "OS",
			Value: `${osSummary.label} · node ${process.versions.node}`
		},
		{
			Item: "Tailscale",
			Value: tailscaleMode === "off" ? muted("off") : tailscaleDns && tailscaleHttpsUrl ? `${tailscaleMode} · ${tailscaleDns} · ${tailscaleHttpsUrl}` : warn(`${tailscaleMode} · magicdns unknown`)
		},
		{
			Item: "Channel",
			Value: channelLabel
		},
		...gitLabel ? [{
			Item: "Git",
			Value: gitLabel
		}] : [],
		{
			Item: "Update",
			Value: updateAvailability.available ? warn(`available · ${updateLine}`) : updateLine
		},
		{
			Item: "Gateway",
			Value: gatewayValue
		},
		{
			Item: "Gateway service",
			Value: daemonValue
		},
		{
			Item: "Node service",
			Value: nodeDaemonValue
		},
		{
			Item: "Agents",
			Value: agentsValue
		},
		{
			Item: "Memory",
			Value: memoryValue
		},
		{
			Item: "Probes",
			Value: probesValue
		},
		{
			Item: "Events",
			Value: eventsValue
		},
		{
			Item: "Heartbeat",
			Value: heartbeatValue
		},
		...lastHeartbeatValue ? [{
			Item: "Last heartbeat",
			Value: lastHeartbeatValue
		}] : [],
		{
			Item: "Sessions",
			Value: `${summary.sessions.count} active · default ${defaults.model ?? "unknown"}${defaultCtx} · ${storeLabel}`
		}
	];
	runtime.log(theme.heading("OpenClaw status"));
	runtime.log("");
	runtime.log(theme.heading("Overview"));
	runtime.log(renderTable({
		width: tableWidth,
		columns: [{
			key: "Item",
			header: "Item",
			minWidth: 12
		}, {
			key: "Value",
			header: "Value",
			flex: true,
			minWidth: 32
		}],
		rows: overviewRows
	}).trimEnd());
	runtime.log("");
	runtime.log(theme.heading("Security audit"));
	const fmtSummary = (value) => {
		return [
			theme.error(`${value.critical} critical`),
			theme.warn(`${value.warn} warn`),
			theme.muted(`${value.info} info`)
		].join(" · ");
	};
	runtime.log(theme.muted(`Summary: ${fmtSummary(securityAudit.summary)}`));
	const importantFindings = securityAudit.findings.filter((f) => f.severity === "critical" || f.severity === "warn");
	if (importantFindings.length === 0) runtime.log(theme.muted("No critical or warn findings detected."));
	else {
		const severityLabel = (sev) => {
			if (sev === "critical") return theme.error("CRITICAL");
			if (sev === "warn") return theme.warn("WARN");
			return theme.muted("INFO");
		};
		const sevRank = (sev) => sev === "critical" ? 0 : sev === "warn" ? 1 : 2;
		const sorted = [...importantFindings].toSorted((a, b) => sevRank(a.severity) - sevRank(b.severity));
		const shown = sorted.slice(0, 6);
		for (const f of shown) {
			runtime.log(`  ${severityLabel(f.severity)} ${f.title}`);
			runtime.log(`    ${shortenText(f.detail.replaceAll("\n", " "), 160)}`);
			if (f.remediation?.trim()) runtime.log(`    ${theme.muted(`Fix: ${f.remediation.trim()}`)}`);
		}
		if (sorted.length > shown.length) runtime.log(theme.muted(`… +${sorted.length - shown.length} more`));
	}
	runtime.log(theme.muted(`Full report: ${formatCliCommand("openclaw security audit")}`));
	runtime.log(theme.muted(`Deep probe: ${formatCliCommand("openclaw security audit --deep")}`));
	runtime.log("");
	runtime.log(theme.heading("Channels"));
	const channelIssuesByChannel = (() => {
		const map = /* @__PURE__ */ new Map();
		for (const issue of channelIssues) {
			const key = issue.channel;
			const list = map.get(key);
			if (list) list.push(issue);
			else map.set(key, [issue]);
		}
		return map;
	})();
	runtime.log(renderTable({
		width: tableWidth,
		columns: [
			{
				key: "Channel",
				header: "Channel",
				minWidth: 10
			},
			{
				key: "Enabled",
				header: "Enabled",
				minWidth: 7
			},
			{
				key: "State",
				header: "State",
				minWidth: 8
			},
			{
				key: "Detail",
				header: "Detail",
				flex: true,
				minWidth: 24
			}
		],
		rows: channels.rows.map((row) => {
			const issues = channelIssuesByChannel.get(row.id) ?? [];
			const effectiveState = row.state === "off" ? "off" : issues.length > 0 ? "warn" : row.state;
			const issueSuffix = issues.length > 0 ? ` · ${warn(`gateway: ${shortenText(issues[0]?.message ?? "issue", 84)}`)}` : "";
			return {
				Channel: row.label,
				Enabled: row.enabled ? ok("ON") : muted("OFF"),
				State: effectiveState === "ok" ? ok("OK") : effectiveState === "warn" ? warn("WARN") : effectiveState === "off" ? muted("OFF") : theme.accentDim("SETUP"),
				Detail: `${row.detail}${issueSuffix}`
			};
		})
	}).trimEnd());
	runtime.log("");
	runtime.log(theme.heading("Sessions"));
	runtime.log(renderTable({
		width: tableWidth,
		columns: [
			{
				key: "Key",
				header: "Key",
				minWidth: 20,
				flex: true
			},
			{
				key: "Kind",
				header: "Kind",
				minWidth: 6
			},
			{
				key: "Age",
				header: "Age",
				minWidth: 9
			},
			{
				key: "Model",
				header: "Model",
				minWidth: 14
			},
			{
				key: "Tokens",
				header: "Tokens",
				minWidth: 16
			}
		],
		rows: summary.sessions.recent.length > 0 ? summary.sessions.recent.map((sess) => ({
			Key: shortenText(sess.key, 32),
			Kind: sess.kind,
			Age: sess.updatedAt ? formatTimeAgo(sess.age) : "no activity",
			Model: sess.model ?? "unknown",
			Tokens: formatTokensCompact(sess)
		})) : [{
			Key: muted("no sessions yet"),
			Kind: "",
			Age: "",
			Model: "",
			Tokens: ""
		}]
	}).trimEnd());
	if (summary.queuedSystemEvents.length > 0) {
		runtime.log("");
		runtime.log(theme.heading("System events"));
		runtime.log(renderTable({
			width: tableWidth,
			columns: [{
				key: "Event",
				header: "Event",
				flex: true,
				minWidth: 24
			}],
			rows: summary.queuedSystemEvents.slice(0, 5).map((event) => ({ Event: event }))
		}).trimEnd());
		if (summary.queuedSystemEvents.length > 5) runtime.log(muted(`… +${summary.queuedSystemEvents.length - 5} more`));
	}
	if (health) {
		runtime.log("");
		runtime.log(theme.heading("Health"));
		const rows = [];
		rows.push({
			Item: "Gateway",
			Status: ok("reachable"),
			Detail: `${health.durationMs}ms`
		});
		for (const line of formatHealthChannelLines(health, { accountMode: "all" })) {
			const colon = line.indexOf(":");
			if (colon === -1) continue;
			const item = line.slice(0, colon).trim();
			const detail = line.slice(colon + 1).trim();
			const normalized = detail.toLowerCase();
			const status = (() => {
				if (normalized.startsWith("ok")) return ok("OK");
				if (normalized.startsWith("failed")) return warn("WARN");
				if (normalized.startsWith("not configured")) return muted("OFF");
				if (normalized.startsWith("configured")) return ok("OK");
				if (normalized.startsWith("linked")) return ok("LINKED");
				if (normalized.startsWith("not linked")) return warn("UNLINKED");
				return warn("WARN");
			})();
			rows.push({
				Item: item,
				Status: status,
				Detail: detail
			});
		}
		runtime.log(renderTable({
			width: tableWidth,
			columns: [
				{
					key: "Item",
					header: "Item",
					minWidth: 10
				},
				{
					key: "Status",
					header: "Status",
					minWidth: 8
				},
				{
					key: "Detail",
					header: "Detail",
					flex: true,
					minWidth: 28
				}
			],
			rows
		}).trimEnd());
	}
	if (usage) {
		runtime.log("");
		runtime.log(theme.heading("Usage"));
		for (const line of formatUsageReportLines(usage)) runtime.log(line);
	}
	runtime.log("");
	runtime.log("FAQ: https://docs.openclaw.ai/faq");
	runtime.log("Troubleshooting: https://docs.openclaw.ai/troubleshooting");
	runtime.log("");
	const updateHint = formatUpdateAvailableHint(update);
	if (updateHint) {
		runtime.log(theme.warn(updateHint));
		runtime.log("");
	}
	runtime.log("Next steps:");
	runtime.log(`  Need to share?      ${formatCliCommand("openclaw status --all")}`);
	runtime.log(`  Need to debug live? ${formatCliCommand("openclaw logs --follow")}`);
	if (gatewayReachable) runtime.log(`  Need to test channels? ${formatCliCommand("openclaw status --deep")}`);
	else runtime.log(`  Fix reachability first: ${formatCliCommand("openclaw gateway probe")}`);
}

//#endregion
export { buildAgentSummaries as a, loadAgentIdentity as c, loadAgentIdentityFromWorkspace as d, parseIdentityMarkdown as f, applyAgentConfig as i, pruneAgentConfig as l, getStatusSummary as n, findAgentEntryIndex as o, forceFreePortAndWait as p, runOnboardingWizard as r, listAgentEntries as s, statusCommand as t, identityHasValues as u };