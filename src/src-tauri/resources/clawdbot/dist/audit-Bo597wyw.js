import { $ as resolveStateDir, U as resolveConfigPath, Z as resolveOAuthDir } from "./entry.js";
import { t as formatCliCommand } from "./command-format-CVN3MX2Q.js";
import { l as normalizeAgentId } from "./session-key-DVvxnFKg.js";
import { n as runExec } from "./exec-B52LZOrO.js";
import { c as resolveDefaultAgentId, s as resolveAgentWorkspaceDir } from "./agent-scope-Bu62UIQZ.js";
import { A as INCLUDE_KEY, j as MAX_INCLUDE_DEPTH, r as createConfigIO } from "./config-BJWIHf6x.js";
import { a as MANIFEST_KEY, l as normalizePluginsConfig } from "./manifest-registry-DlFh5LWe.js";
import { n as listChannelPlugins } from "./plugins-DsHRVW6o.js";
import { h as GATEWAY_CLIENT_NAMES, m as GATEWAY_CLIENT_MODES } from "./message-channel-D-iPIX3C.js";
import { o as resolveBrowserConfig, s as resolveProfile } from "./server-context-DSQVDg5o.js";
import { i as resolveGatewayAuth } from "./auth-DaQXd14b.js";
import { n as resolveBrowserControlAuth } from "./control-auth-B-AeOmM1.js";
import { n as formatErrorMessage } from "./errors-C34O4jLW.js";
import { d as resolveSandboxToolPolicyForAgent, l as resolveSandboxConfigForAgent, v as resolveToolProfilePolicy } from "./sandbox-yPHyBnUy.js";
import { i as loadWorkspaceSkillEntries } from "./skills-C1pxUa-I.js";
import { t as GatewayClient } from "./client-DV6vI7ic.js";
import { t as buildGatewayConnectionDetails } from "./call-FZUZ5EU4.js";
import { i as readChannelAllowFromStore } from "./pairing-store-C9d3jZbc.js";
import { c as resolveNativeSkillsEnabled, n as isToolAllowedByPolicies, s as resolveNativeCommandsEnabled } from "./pi-tools.policy-CTtzXtkF.js";
import { t as resolveChannelDefaultAccountId } from "./helpers-nebh58LK.js";
import { t as scanDirectoryWithSummary } from "./skill-scanner-DFG_N86N.js";
import path from "node:path";
import os from "node:os";
import JSON5 from "json5";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";

//#region src/gateway/probe.ts
async function probeGateway(opts) {
	const startedAt = Date.now();
	const instanceId = randomUUID();
	let connectLatencyMs = null;
	let connectError = null;
	let close = null;
	return await new Promise((resolve) => {
		let settled = false;
		const settle = (result) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			client.stop();
			resolve({
				url: opts.url,
				...result
			});
		};
		const client = new GatewayClient({
			url: opts.url,
			token: opts.auth?.token,
			password: opts.auth?.password,
			clientName: GATEWAY_CLIENT_NAMES.CLI,
			clientVersion: "dev",
			mode: GATEWAY_CLIENT_MODES.PROBE,
			instanceId,
			onConnectError: (err) => {
				connectError = formatErrorMessage(err);
			},
			onClose: (code, reason) => {
				close = {
					code,
					reason
				};
			},
			onHelloOk: async () => {
				connectLatencyMs = Date.now() - startedAt;
				try {
					const [health, status, presence, configSnapshot] = await Promise.all([
						client.request("health"),
						client.request("status"),
						client.request("system-presence"),
						client.request("config.get", {})
					]);
					settle({
						ok: true,
						connectLatencyMs,
						error: null,
						close,
						health,
						status,
						presence: Array.isArray(presence) ? presence : null,
						configSnapshot
					});
				} catch (err) {
					settle({
						ok: false,
						connectLatencyMs,
						error: formatErrorMessage(err),
						close,
						health: null,
						status: null,
						presence: null,
						configSnapshot: null
					});
				}
			}
		});
		const timer = setTimeout(() => {
			settle({
				ok: false,
				connectLatencyMs,
				error: connectError ? `connect failed: ${connectError}` : "timeout",
				close,
				health: null,
				status: null,
				presence: null,
				configSnapshot: null
			});
		}, Math.max(250, opts.timeoutMs));
		client.start();
	});
}

//#endregion
//#region src/gateway/node-command-policy.ts
const CANVAS_COMMANDS = [
	"canvas.present",
	"canvas.hide",
	"canvas.navigate",
	"canvas.eval",
	"canvas.snapshot",
	"canvas.a2ui.push",
	"canvas.a2ui.pushJSONL",
	"canvas.a2ui.reset"
];
const CAMERA_COMMANDS = ["camera.list"];
const CAMERA_DANGEROUS_COMMANDS = ["camera.snap", "camera.clip"];
const SCREEN_DANGEROUS_COMMANDS = ["screen.record"];
const LOCATION_COMMANDS = ["location.get"];
const DEVICE_COMMANDS = ["device.info", "device.status"];
const CONTACTS_COMMANDS = ["contacts.search"];
const CONTACTS_DANGEROUS_COMMANDS = ["contacts.add"];
const CALENDAR_COMMANDS = ["calendar.events"];
const CALENDAR_DANGEROUS_COMMANDS = ["calendar.add"];
const REMINDERS_COMMANDS = ["reminders.list"];
const REMINDERS_DANGEROUS_COMMANDS = ["reminders.add"];
const PHOTOS_COMMANDS = ["photos.latest"];
const MOTION_COMMANDS = ["motion.activity", "motion.pedometer"];
const SMS_DANGEROUS_COMMANDS = ["sms.send"];
const IOS_SYSTEM_COMMANDS = ["system.notify"];
const SYSTEM_COMMANDS = [
	"system.run",
	"system.which",
	"system.notify",
	"system.execApprovals.get",
	"system.execApprovals.set",
	"browser.proxy"
];
const DEFAULT_DANGEROUS_NODE_COMMANDS = [
	...CAMERA_DANGEROUS_COMMANDS,
	...SCREEN_DANGEROUS_COMMANDS,
	...CONTACTS_DANGEROUS_COMMANDS,
	...CALENDAR_DANGEROUS_COMMANDS,
	...REMINDERS_DANGEROUS_COMMANDS,
	...SMS_DANGEROUS_COMMANDS
];
const PLATFORM_DEFAULTS = {
	ios: [
		...CANVAS_COMMANDS,
		...CAMERA_COMMANDS,
		...LOCATION_COMMANDS,
		...DEVICE_COMMANDS,
		...CONTACTS_COMMANDS,
		...CALENDAR_COMMANDS,
		...REMINDERS_COMMANDS,
		...PHOTOS_COMMANDS,
		...MOTION_COMMANDS,
		...IOS_SYSTEM_COMMANDS
	],
	android: [
		...CANVAS_COMMANDS,
		...CAMERA_COMMANDS,
		...LOCATION_COMMANDS,
		...DEVICE_COMMANDS,
		...CONTACTS_COMMANDS,
		...CALENDAR_COMMANDS,
		...REMINDERS_COMMANDS,
		...PHOTOS_COMMANDS,
		...MOTION_COMMANDS
	],
	macos: [
		...CANVAS_COMMANDS,
		...CAMERA_COMMANDS,
		...LOCATION_COMMANDS,
		...DEVICE_COMMANDS,
		...CONTACTS_COMMANDS,
		...CALENDAR_COMMANDS,
		...REMINDERS_COMMANDS,
		...PHOTOS_COMMANDS,
		...MOTION_COMMANDS,
		...SYSTEM_COMMANDS
	],
	linux: [...SYSTEM_COMMANDS],
	windows: [...SYSTEM_COMMANDS],
	unknown: [
		...CANVAS_COMMANDS,
		...CAMERA_COMMANDS,
		...LOCATION_COMMANDS,
		...SYSTEM_COMMANDS
	]
};
function normalizePlatformId(platform, deviceFamily) {
	const raw = (platform ?? "").trim().toLowerCase();
	if (raw.startsWith("ios")) return "ios";
	if (raw.startsWith("android")) return "android";
	if (raw.startsWith("mac")) return "macos";
	if (raw.startsWith("darwin")) return "macos";
	if (raw.startsWith("win")) return "windows";
	if (raw.startsWith("linux")) return "linux";
	const family = (deviceFamily ?? "").trim().toLowerCase();
	if (family.includes("iphone") || family.includes("ipad") || family.includes("ios")) return "ios";
	if (family.includes("android")) return "android";
	if (family.includes("mac")) return "macos";
	if (family.includes("windows")) return "windows";
	if (family.includes("linux")) return "linux";
	return "unknown";
}
function resolveNodeCommandAllowlist(cfg, node) {
	const base = PLATFORM_DEFAULTS[normalizePlatformId(node?.platform, node?.deviceFamily)] ?? PLATFORM_DEFAULTS.unknown;
	const extra = cfg.gateway?.nodes?.allowCommands ?? [];
	const deny = new Set(cfg.gateway?.nodes?.denyCommands ?? []);
	const allow = new Set([...base, ...extra].map((cmd) => cmd.trim()).filter(Boolean));
	for (const blocked of deny) {
		const trimmed = blocked.trim();
		if (trimmed) allow.delete(trimmed);
	}
	return allow;
}
function isNodeCommandAllowed(params) {
	const command = params.command.trim();
	if (!command) return {
		ok: false,
		reason: "command required"
	};
	if (!params.allowlist.has(command)) return {
		ok: false,
		reason: "command not allowlisted"
	};
	if (Array.isArray(params.declaredCommands) && params.declaredCommands.length > 0) {
		if (!params.declaredCommands.includes(command)) return {
			ok: false,
			reason: "command not declared by node"
		};
	} else return {
		ok: false,
		reason: "node did not declare commands"
	};
	return { ok: true };
}

//#endregion
//#region src/security/audit-channel.ts
function normalizeAllowFromList$1(list) {
	if (!Array.isArray(list)) return [];
	return list.map((v) => String(v).trim()).filter(Boolean);
}
function classifyChannelWarningSeverity(message) {
	const s = message.toLowerCase();
	if (s.includes("dms: open") || s.includes("grouppolicy=\"open\"") || s.includes("dmpolicy=\"open\"")) return "critical";
	if (s.includes("allows any") || s.includes("anyone can dm") || s.includes("public")) return "critical";
	if (s.includes("locked") || s.includes("disabled")) return "info";
	return "warn";
}
async function collectChannelSecurityFindings(params) {
	const findings = [];
	const coerceNativeSetting = (value) => {
		if (value === true) return true;
		if (value === false) return false;
		if (value === "auto") return "auto";
	};
	const warnDmPolicy = async (input) => {
		const policyPath = input.policyPath ?? `${input.allowFromPath}policy`;
		const configAllowFrom = normalizeAllowFromList$1(input.allowFrom);
		const hasWildcard = configAllowFrom.includes("*");
		const dmScope = params.cfg.session?.dmScope ?? "main";
		const storeAllowFrom = await readChannelAllowFromStore(input.provider).catch(() => []);
		const normalizeEntry = input.normalizeEntry ?? ((value) => value);
		const normalizedCfg = configAllowFrom.filter((value) => value !== "*").map((value) => normalizeEntry(value)).map((value) => value.trim()).filter(Boolean);
		const normalizedStore = storeAllowFrom.map((value) => normalizeEntry(value)).map((value) => value.trim()).filter(Boolean);
		const allowCount = Array.from(new Set([...normalizedCfg, ...normalizedStore])).length;
		const isMultiUserDm = hasWildcard || allowCount > 1;
		if (input.dmPolicy === "open") {
			const allowFromKey = `${input.allowFromPath}allowFrom`;
			findings.push({
				checkId: `channels.${input.provider}.dm.open`,
				severity: "critical",
				title: `${input.label} DMs are open`,
				detail: `${policyPath}="open" allows anyone to DM the bot.`,
				remediation: `Use pairing/allowlist; if you really need open DMs, ensure ${allowFromKey} includes "*".`
			});
			if (!hasWildcard) findings.push({
				checkId: `channels.${input.provider}.dm.open_invalid`,
				severity: "warn",
				title: `${input.label} DM config looks inconsistent`,
				detail: `"open" requires ${allowFromKey} to include "*".`
			});
		}
		if (input.dmPolicy === "disabled") {
			findings.push({
				checkId: `channels.${input.provider}.dm.disabled`,
				severity: "info",
				title: `${input.label} DMs are disabled`,
				detail: `${policyPath}="disabled" ignores inbound DMs.`
			});
			return;
		}
		if (dmScope === "main" && isMultiUserDm) findings.push({
			checkId: `channels.${input.provider}.dm.scope_main_multiuser`,
			severity: "warn",
			title: `${input.label} DMs share the main session`,
			detail: "Multiple DM senders currently share the main session, which can leak context across users.",
			remediation: "Run: " + formatCliCommand("openclaw config set session.dmScope \"per-channel-peer\"") + " (or \"per-account-channel-peer\" for multi-account channels) to isolate DM sessions per sender."
		});
	};
	for (const plugin of params.plugins) {
		if (!plugin.security) continue;
		const accountIds = plugin.config.listAccountIds(params.cfg);
		const defaultAccountId = resolveChannelDefaultAccountId({
			plugin,
			cfg: params.cfg,
			accountIds
		});
		const account = plugin.config.resolveAccount(params.cfg, defaultAccountId);
		if (!(plugin.config.isEnabled ? plugin.config.isEnabled(account, params.cfg) : true)) continue;
		if (!(plugin.config.isConfigured ? await plugin.config.isConfigured(account, params.cfg) : true)) continue;
		if (plugin.id === "discord") {
			const discordCfg = account?.config ?? {};
			const nativeEnabled = resolveNativeCommandsEnabled({
				providerId: "discord",
				providerSetting: coerceNativeSetting(discordCfg.commands?.native),
				globalSetting: params.cfg.commands?.native
			});
			const nativeSkillsEnabled = resolveNativeSkillsEnabled({
				providerId: "discord",
				providerSetting: coerceNativeSetting(discordCfg.commands?.nativeSkills),
				globalSetting: params.cfg.commands?.nativeSkills
			});
			if (nativeEnabled || nativeSkillsEnabled) {
				const defaultGroupPolicy = params.cfg.channels?.defaults?.groupPolicy;
				const groupPolicy = discordCfg.groupPolicy ?? defaultGroupPolicy ?? "allowlist";
				const guildEntries = discordCfg.guilds ?? {};
				const guildsConfigured = Object.keys(guildEntries).length > 0;
				const hasAnyUserAllowlist = Object.values(guildEntries).some((guild) => {
					if (!guild || typeof guild !== "object") return false;
					const g = guild;
					if (Array.isArray(g.users) && g.users.length > 0) return true;
					const channels = g.channels;
					if (!channels || typeof channels !== "object") return false;
					return Object.values(channels).some((channel) => {
						if (!channel || typeof channel !== "object") return false;
						const c = channel;
						return Array.isArray(c.users) && c.users.length > 0;
					});
				});
				const dmAllowFromRaw = discordCfg.dm?.allowFrom;
				const dmAllowFrom = Array.isArray(dmAllowFromRaw) ? dmAllowFromRaw : [];
				const storeAllowFrom = await readChannelAllowFromStore("discord").catch(() => []);
				const ownerAllowFromConfigured = normalizeAllowFromList$1([...dmAllowFrom, ...storeAllowFrom]).length > 0;
				const useAccessGroups = params.cfg.commands?.useAccessGroups !== false;
				if (!useAccessGroups && groupPolicy !== "disabled" && guildsConfigured && !hasAnyUserAllowlist) findings.push({
					checkId: "channels.discord.commands.native.unrestricted",
					severity: "critical",
					title: "Discord slash commands are unrestricted",
					detail: "commands.useAccessGroups=false disables sender allowlists for Discord slash commands unless a per-guild/channel users allowlist is configured; with no users allowlist, any user in allowed guild channels can invoke /… commands.",
					remediation: "Set commands.useAccessGroups=true (recommended), or configure channels.discord.guilds.<id>.users (or channels.discord.guilds.<id>.channels.<channel>.users)."
				});
				else if (useAccessGroups && groupPolicy !== "disabled" && guildsConfigured && !ownerAllowFromConfigured && !hasAnyUserAllowlist) findings.push({
					checkId: "channels.discord.commands.native.no_allowlists",
					severity: "warn",
					title: "Discord slash commands have no allowlists",
					detail: "Discord slash commands are enabled, but neither an owner allowFrom list nor any per-guild/channel users allowlist is configured; /… commands will be rejected for everyone.",
					remediation: "Add your user id to channels.discord.dm.allowFrom (or approve yourself via pairing), or configure channels.discord.guilds.<id>.users."
				});
			}
		}
		if (plugin.id === "slack") {
			const slackCfg = account?.config ?? {};
			const nativeEnabled = resolveNativeCommandsEnabled({
				providerId: "slack",
				providerSetting: coerceNativeSetting(slackCfg.commands?.native),
				globalSetting: params.cfg.commands?.native
			});
			const nativeSkillsEnabled = resolveNativeSkillsEnabled({
				providerId: "slack",
				providerSetting: coerceNativeSetting(slackCfg.commands?.nativeSkills),
				globalSetting: params.cfg.commands?.nativeSkills
			});
			if (nativeEnabled || nativeSkillsEnabled || slackCfg.slashCommand?.enabled === true) if (!(params.cfg.commands?.useAccessGroups !== false)) findings.push({
				checkId: "channels.slack.commands.slash.useAccessGroups_off",
				severity: "critical",
				title: "Slack slash commands bypass access groups",
				detail: "Slack slash/native commands are enabled while commands.useAccessGroups=false; this can allow unrestricted /… command execution from channels/users you didn't explicitly authorize.",
				remediation: "Set commands.useAccessGroups=true (recommended)."
			});
			else {
				const dmAllowFromRaw = account?.dm?.allowFrom;
				const dmAllowFrom = Array.isArray(dmAllowFromRaw) ? dmAllowFromRaw : [];
				const storeAllowFrom = await readChannelAllowFromStore("slack").catch(() => []);
				const ownerAllowFromConfigured = normalizeAllowFromList$1([...dmAllowFrom, ...storeAllowFrom]).length > 0;
				const channels = slackCfg.channels ?? {};
				const hasAnyChannelUsersAllowlist = Object.values(channels).some((value) => {
					if (!value || typeof value !== "object") return false;
					const channel = value;
					return Array.isArray(channel.users) && channel.users.length > 0;
				});
				if (!ownerAllowFromConfigured && !hasAnyChannelUsersAllowlist) findings.push({
					checkId: "channels.slack.commands.slash.no_allowlists",
					severity: "warn",
					title: "Slack slash commands have no allowlists",
					detail: "Slack slash/native commands are enabled, but neither an owner allowFrom list nor any channels.<id>.users allowlist is configured; /… commands will be rejected for everyone.",
					remediation: "Approve yourself via pairing (recommended), or set channels.slack.dm.allowFrom and/or channels.slack.channels.<id>.users."
				});
			}
		}
		const dmPolicy = plugin.security.resolveDmPolicy?.({
			cfg: params.cfg,
			accountId: defaultAccountId,
			account
		});
		if (dmPolicy) await warnDmPolicy({
			label: plugin.meta.label ?? plugin.id,
			provider: plugin.id,
			dmPolicy: dmPolicy.policy,
			allowFrom: dmPolicy.allowFrom,
			policyPath: dmPolicy.policyPath,
			allowFromPath: dmPolicy.allowFromPath,
			normalizeEntry: dmPolicy.normalizeEntry
		});
		if (plugin.security.collectWarnings) {
			const warnings = await plugin.security.collectWarnings({
				cfg: params.cfg,
				accountId: defaultAccountId,
				account
			});
			for (const message of warnings ?? []) {
				const trimmed = String(message).trim();
				if (!trimmed) continue;
				findings.push({
					checkId: `channels.${plugin.id}.warning.${findings.length + 1}`,
					severity: classifyChannelWarningSeverity(trimmed),
					title: `${plugin.meta.label ?? plugin.id} security warning`,
					detail: trimmed.replace(/^-\s*/, "")
				});
			}
		}
		if (plugin.id === "telegram") {
			if (!(params.cfg.commands?.text !== false)) continue;
			const telegramCfg = account?.config ?? {};
			const defaultGroupPolicy = params.cfg.channels?.defaults?.groupPolicy;
			const groupPolicy = telegramCfg.groupPolicy ?? defaultGroupPolicy ?? "allowlist";
			const groups = telegramCfg.groups;
			const groupsConfigured = Boolean(groups) && Object.keys(groups ?? {}).length > 0;
			if (!(groupPolicy === "open" || groupPolicy === "allowlist" && groupsConfigured)) continue;
			const storeAllowFrom = await readChannelAllowFromStore("telegram").catch(() => []);
			const storeHasWildcard = storeAllowFrom.some((v) => String(v).trim() === "*");
			const groupAllowFrom = Array.isArray(telegramCfg.groupAllowFrom) ? telegramCfg.groupAllowFrom : [];
			const groupAllowFromHasWildcard = groupAllowFrom.some((v) => String(v).trim() === "*");
			const anyGroupOverride = Boolean(groups && Object.values(groups).some((value) => {
				if (!value || typeof value !== "object") return false;
				const group = value;
				if ((Array.isArray(group.allowFrom) ? group.allowFrom : []).length > 0) return true;
				const topics = group.topics;
				if (!topics || typeof topics !== "object") return false;
				return Object.values(topics).some((topicValue) => {
					if (!topicValue || typeof topicValue !== "object") return false;
					const topic = topicValue;
					return (Array.isArray(topic.allowFrom) ? topic.allowFrom : []).length > 0;
				});
			}));
			const hasAnySenderAllowlist = storeAllowFrom.length > 0 || groupAllowFrom.length > 0 || anyGroupOverride;
			if (storeHasWildcard || groupAllowFromHasWildcard) {
				findings.push({
					checkId: "channels.telegram.groups.allowFrom.wildcard",
					severity: "critical",
					title: "Telegram group allowlist contains wildcard",
					detail: "Telegram group sender allowlist contains \"*\", which allows any group member to run /… commands and control directives.",
					remediation: "Remove \"*\" from channels.telegram.groupAllowFrom and pairing store; prefer explicit user ids/usernames."
				});
				continue;
			}
			if (!hasAnySenderAllowlist) {
				const providerSetting = telegramCfg.commands?.nativeSkills;
				const skillsEnabled = resolveNativeSkillsEnabled({
					providerId: "telegram",
					providerSetting,
					globalSetting: params.cfg.commands?.nativeSkills
				});
				findings.push({
					checkId: "channels.telegram.groups.allowFrom.missing",
					severity: "critical",
					title: "Telegram group commands have no sender allowlist",
					detail: `Telegram group access is enabled but no sender allowlist is configured; this allows any group member to invoke /… commands` + (skillsEnabled ? " (including skill commands)." : "."),
					remediation: "Approve yourself via pairing (recommended), or set channels.telegram.groupAllowFrom (or per-group groups.<id>.allowFrom)."
				});
			}
		}
	}
	return findings;
}

//#endregion
//#region src/security/audit-extra.sync.ts
const SMALL_MODEL_PARAM_B_MAX = 300;
function summarizeGroupPolicy(cfg) {
	const channels = cfg.channels;
	if (!channels || typeof channels !== "object") return {
		open: 0,
		allowlist: 0,
		other: 0
	};
	let open = 0;
	let allowlist = 0;
	let other = 0;
	for (const value of Object.values(channels)) {
		if (!value || typeof value !== "object") continue;
		const policy = value.groupPolicy;
		if (policy === "open") open += 1;
		else if (policy === "allowlist") allowlist += 1;
		else other += 1;
	}
	return {
		open,
		allowlist,
		other
	};
}
function isProbablySyncedPath(p) {
	const s = p.toLowerCase();
	return s.includes("icloud") || s.includes("dropbox") || s.includes("google drive") || s.includes("googledrive") || s.includes("onedrive");
}
function looksLikeEnvRef(value) {
	const v = value.trim();
	return v.startsWith("${") && v.endsWith("}");
}
function isGatewayRemotelyExposed(cfg) {
	if ((typeof cfg.gateway?.bind === "string" ? cfg.gateway.bind : "loopback") !== "loopback") return true;
	const tailscaleMode = cfg.gateway?.tailscale?.mode ?? "off";
	return tailscaleMode === "serve" || tailscaleMode === "funnel";
}
function addModel(models, raw, source) {
	if (typeof raw !== "string") return;
	const id = raw.trim();
	if (!id) return;
	models.push({
		id,
		source
	});
}
function collectModels(cfg) {
	const out = [];
	addModel(out, cfg.agents?.defaults?.model?.primary, "agents.defaults.model.primary");
	for (const f of cfg.agents?.defaults?.model?.fallbacks ?? []) addModel(out, f, "agents.defaults.model.fallbacks");
	addModel(out, cfg.agents?.defaults?.imageModel?.primary, "agents.defaults.imageModel.primary");
	for (const f of cfg.agents?.defaults?.imageModel?.fallbacks ?? []) addModel(out, f, "agents.defaults.imageModel.fallbacks");
	const list = Array.isArray(cfg.agents?.list) ? cfg.agents?.list : [];
	for (const agent of list ?? []) {
		if (!agent || typeof agent !== "object") continue;
		const id = typeof agent.id === "string" ? agent.id : "";
		const model = agent.model;
		if (typeof model === "string") addModel(out, model, `agents.list.${id}.model`);
		else if (model && typeof model === "object") {
			addModel(out, model.primary, `agents.list.${id}.model.primary`);
			const fallbacks = model.fallbacks;
			if (Array.isArray(fallbacks)) for (const f of fallbacks) addModel(out, f, `agents.list.${id}.model.fallbacks`);
		}
	}
	return out;
}
const LEGACY_MODEL_PATTERNS = [
	{
		id: "openai.gpt35",
		re: /\bgpt-3\.5\b/i,
		label: "GPT-3.5 family"
	},
	{
		id: "anthropic.claude2",
		re: /\bclaude-(instant|2)\b/i,
		label: "Claude 2/Instant family"
	},
	{
		id: "openai.gpt4_legacy",
		re: /\bgpt-4-(0314|0613)\b/i,
		label: "Legacy GPT-4 snapshots"
	}
];
const WEAK_TIER_MODEL_PATTERNS = [{
	id: "anthropic.haiku",
	re: /\bhaiku\b/i,
	label: "Haiku tier (smaller model)"
}];
function inferParamBFromIdOrName(text) {
	const matches = text.toLowerCase().matchAll(/(?:^|[^a-z0-9])[a-z]?(\d+(?:\.\d+)?)b(?:[^a-z0-9]|$)/g);
	let best = null;
	for (const match of matches) {
		const numRaw = match[1];
		if (!numRaw) continue;
		const value = Number(numRaw);
		if (!Number.isFinite(value) || value <= 0) continue;
		if (best === null || value > best) best = value;
	}
	return best;
}
function isGptModel(id) {
	return /\bgpt-/i.test(id);
}
function isGpt5OrHigher(id) {
	return /\bgpt-5(?:\b|[.-])/i.test(id);
}
function isClaudeModel(id) {
	return /\bclaude-/i.test(id);
}
function isClaude45OrHigher(id) {
	return /\bclaude-[^\s/]*?(?:-4-?(?:[5-9]|[1-9]\d)\b|4\.(?:[5-9]|[1-9]\d)\b|-[5-9](?:\b|[.-]))/i.test(id);
}
function extractAgentIdFromSource(source) {
	return source.match(/^agents\.list\.([^.]*)\./)?.[1] ?? null;
}
function unionAllow$1(base, extra) {
	if (!Array.isArray(extra) || extra.length === 0) return base;
	if (!Array.isArray(base) || base.length === 0) return Array.from(new Set(["*", ...extra]));
	return Array.from(new Set([...base, ...extra]));
}
function pickToolPolicy$1(config) {
	if (!config) return null;
	const allow = Array.isArray(config.allow) ? unionAllow$1(config.allow, config.alsoAllow) : Array.isArray(config.alsoAllow) && config.alsoAllow.length > 0 ? unionAllow$1(void 0, config.alsoAllow) : void 0;
	const deny = Array.isArray(config.deny) ? config.deny : void 0;
	if (!allow && !deny) return null;
	return {
		allow,
		deny
	};
}
function hasConfiguredDockerConfig(docker) {
	if (!docker || typeof docker !== "object") return false;
	return Object.values(docker).some((value) => value !== void 0);
}
function normalizeNodeCommand(value) {
	return typeof value === "string" ? value.trim() : "";
}
function listKnownNodeCommands(cfg) {
	const baseCfg = {
		...cfg,
		gateway: {
			...cfg.gateway,
			nodes: {
				...cfg.gateway?.nodes,
				denyCommands: []
			}
		}
	};
	const out = /* @__PURE__ */ new Set();
	for (const platform of [
		"ios",
		"android",
		"macos",
		"linux",
		"windows",
		"unknown"
	]) {
		const allow = resolveNodeCommandAllowlist(baseCfg, { platform });
		for (const cmd of allow) {
			const normalized = normalizeNodeCommand(cmd);
			if (normalized) out.add(normalized);
		}
	}
	return out;
}
function looksLikeNodeCommandPattern(value) {
	if (!value) return false;
	if (/[?*[\]{}(),|]/.test(value)) return true;
	if (value.startsWith("/") || value.endsWith("/") || value.startsWith("^") || value.endsWith("$")) return true;
	return /\s/.test(value) || value.includes("group:");
}
function resolveToolPolicies$1(params) {
	const policies = [];
	const profilePolicy = resolveToolProfilePolicy(params.agentTools?.profile ?? params.cfg.tools?.profile);
	if (profilePolicy) policies.push(profilePolicy);
	const globalPolicy = pickToolPolicy$1(params.cfg.tools ?? void 0);
	if (globalPolicy) policies.push(globalPolicy);
	const agentPolicy = pickToolPolicy$1(params.agentTools);
	if (agentPolicy) policies.push(agentPolicy);
	if (params.sandboxMode === "all") {
		const sandboxPolicy = resolveSandboxToolPolicyForAgent(params.cfg, params.agentId ?? void 0);
		policies.push(sandboxPolicy);
	}
	return policies;
}
function hasWebSearchKey(cfg, env) {
	const search = cfg.tools?.web?.search;
	return Boolean(search?.apiKey || search?.perplexity?.apiKey || env.BRAVE_API_KEY || env.PERPLEXITY_API_KEY || env.OPENROUTER_API_KEY);
}
function isWebSearchEnabled(cfg, env) {
	const enabled = cfg.tools?.web?.search?.enabled;
	if (enabled === false) return false;
	if (enabled === true) return true;
	return hasWebSearchKey(cfg, env);
}
function isWebFetchEnabled(cfg) {
	if (cfg.tools?.web?.fetch?.enabled === false) return false;
	return true;
}
function isBrowserEnabled(cfg) {
	try {
		return resolveBrowserConfig(cfg.browser, cfg).enabled;
	} catch {
		return true;
	}
}
function listGroupPolicyOpen(cfg) {
	const out = [];
	const channels = cfg.channels;
	if (!channels || typeof channels !== "object") return out;
	for (const [channelId, value] of Object.entries(channels)) {
		if (!value || typeof value !== "object") continue;
		const section = value;
		if (section.groupPolicy === "open") out.push(`channels.${channelId}.groupPolicy`);
		const accounts = section.accounts;
		if (accounts && typeof accounts === "object") for (const [accountId, accountVal] of Object.entries(accounts)) {
			if (!accountVal || typeof accountVal !== "object") continue;
			if (accountVal.groupPolicy === "open") out.push(`channels.${channelId}.accounts.${accountId}.groupPolicy`);
		}
	}
	return out;
}
function collectAttackSurfaceSummaryFindings(cfg) {
	const group = summarizeGroupPolicy(cfg);
	const elevated = cfg.tools?.elevated?.enabled !== false;
	const webhooksEnabled = cfg.hooks?.enabled === true;
	const internalHooksEnabled = cfg.hooks?.internal?.enabled === true;
	const browserEnabled = cfg.browser?.enabled ?? true;
	return [{
		checkId: "summary.attack_surface",
		severity: "info",
		title: "Attack surface summary",
		detail: `groups: open=${group.open}, allowlist=${group.allowlist}\ntools.elevated: ${elevated ? "enabled" : "disabled"}\nhooks.webhooks: ${webhooksEnabled ? "enabled" : "disabled"}\nhooks.internal: ${internalHooksEnabled ? "enabled" : "disabled"}\nbrowser control: ${browserEnabled ? "enabled" : "disabled"}`
	}];
}
function collectSyncedFolderFindings(params) {
	const findings = [];
	if (isProbablySyncedPath(params.stateDir) || isProbablySyncedPath(params.configPath)) findings.push({
		checkId: "fs.synced_dir",
		severity: "warn",
		title: "State/config path looks like a synced folder",
		detail: `stateDir=${params.stateDir}, configPath=${params.configPath}. Synced folders (iCloud/Dropbox/OneDrive/Google Drive) can leak tokens and transcripts onto other devices.`,
		remediation: `Keep OPENCLAW_STATE_DIR on a local-only volume and re-run "${formatCliCommand("openclaw security audit --fix")}".`
	});
	return findings;
}
function collectSecretsInConfigFindings(cfg) {
	const findings = [];
	const password = typeof cfg.gateway?.auth?.password === "string" ? cfg.gateway.auth.password.trim() : "";
	if (password && !looksLikeEnvRef(password)) findings.push({
		checkId: "config.secrets.gateway_password_in_config",
		severity: "warn",
		title: "Gateway password is stored in config",
		detail: "gateway.auth.password is set in the config file; prefer environment variables for secrets when possible.",
		remediation: "Prefer OPENCLAW_GATEWAY_PASSWORD (env) and remove gateway.auth.password from disk."
	});
	const hooksToken = typeof cfg.hooks?.token === "string" ? cfg.hooks.token.trim() : "";
	if (cfg.hooks?.enabled === true && hooksToken && !looksLikeEnvRef(hooksToken)) findings.push({
		checkId: "config.secrets.hooks_token_in_config",
		severity: "info",
		title: "Hooks token is stored in config",
		detail: "hooks.token is set in the config file; keep config perms tight and treat it like an API secret."
	});
	return findings;
}
function collectHooksHardeningFindings(cfg) {
	const findings = [];
	if (cfg.hooks?.enabled !== true) return findings;
	const token = typeof cfg.hooks?.token === "string" ? cfg.hooks.token.trim() : "";
	if (token && token.length < 24) findings.push({
		checkId: "hooks.token_too_short",
		severity: "warn",
		title: "Hooks token looks short",
		detail: `hooks.token is ${token.length} chars; prefer a long random token.`
	});
	const gatewayAuth = resolveGatewayAuth({
		authConfig: cfg.gateway?.auth,
		tailscaleMode: cfg.gateway?.tailscale?.mode ?? "off"
	});
	const gatewayToken = gatewayAuth.mode === "token" && typeof gatewayAuth.token === "string" && gatewayAuth.token.trim() ? gatewayAuth.token.trim() : null;
	if (token && gatewayToken && token === gatewayToken) findings.push({
		checkId: "hooks.token_reuse_gateway_token",
		severity: "warn",
		title: "Hooks token reuses the Gateway token",
		detail: "hooks.token matches gateway.auth token; compromise of hooks expands blast radius to the Gateway API.",
		remediation: "Use a separate hooks.token dedicated to hook ingress."
	});
	if ((typeof cfg.hooks?.path === "string" ? cfg.hooks.path.trim() : "") === "/") findings.push({
		checkId: "hooks.path_root",
		severity: "critical",
		title: "Hooks base path is '/'",
		detail: "hooks.path='/' would shadow other HTTP endpoints and is unsafe.",
		remediation: "Use a dedicated path like '/hooks'."
	});
	const allowRequestSessionKey = cfg.hooks?.allowRequestSessionKey === true;
	const defaultSessionKey = typeof cfg.hooks?.defaultSessionKey === "string" ? cfg.hooks.defaultSessionKey.trim() : "";
	const allowedPrefixes = Array.isArray(cfg.hooks?.allowedSessionKeyPrefixes) ? cfg.hooks.allowedSessionKeyPrefixes.map((prefix) => prefix.trim()).filter((prefix) => prefix.length > 0) : [];
	const remoteExposure = isGatewayRemotelyExposed(cfg);
	if (!defaultSessionKey) findings.push({
		checkId: "hooks.default_session_key_unset",
		severity: "warn",
		title: "hooks.defaultSessionKey is not configured",
		detail: "Hook agent runs without explicit sessionKey use generated per-request keys. Set hooks.defaultSessionKey to keep hook ingress scoped to a known session.",
		remediation: "Set hooks.defaultSessionKey (for example, \"hook:ingress\")."
	});
	if (allowRequestSessionKey) findings.push({
		checkId: "hooks.request_session_key_enabled",
		severity: remoteExposure ? "critical" : "warn",
		title: "External hook payloads may override sessionKey",
		detail: "hooks.allowRequestSessionKey=true allows `/hooks/agent` callers to choose the session key. Treat hook token holders as full-trust unless you also restrict prefixes.",
		remediation: "Set hooks.allowRequestSessionKey=false (recommended) or constrain hooks.allowedSessionKeyPrefixes."
	});
	if (allowRequestSessionKey && allowedPrefixes.length === 0) findings.push({
		checkId: "hooks.request_session_key_prefixes_missing",
		severity: remoteExposure ? "critical" : "warn",
		title: "Request sessionKey override is enabled without prefix restrictions",
		detail: "hooks.allowRequestSessionKey=true and hooks.allowedSessionKeyPrefixes is unset/empty, so request payloads can target arbitrary session key shapes.",
		remediation: "Set hooks.allowedSessionKeyPrefixes (for example, [\"hook:\"]) or disable request overrides."
	});
	return findings;
}
function collectSandboxDockerNoopFindings(cfg) {
	const findings = [];
	const configuredPaths = [];
	const agents = Array.isArray(cfg.agents?.list) ? cfg.agents.list : [];
	const defaultsSandbox = cfg.agents?.defaults?.sandbox;
	const hasDefaultDocker = hasConfiguredDockerConfig(defaultsSandbox?.docker);
	const defaultMode = defaultsSandbox?.mode ?? "off";
	const hasAnySandboxEnabledAgent = agents.some((entry) => {
		if (!entry || typeof entry !== "object" || typeof entry.id !== "string") return false;
		return resolveSandboxConfigForAgent(cfg, entry.id).mode !== "off";
	});
	if (hasDefaultDocker && defaultMode === "off" && !hasAnySandboxEnabledAgent) configuredPaths.push("agents.defaults.sandbox.docker");
	for (const entry of agents) {
		if (!entry || typeof entry !== "object" || typeof entry.id !== "string") continue;
		if (!hasConfiguredDockerConfig(entry.sandbox?.docker)) continue;
		if (resolveSandboxConfigForAgent(cfg, entry.id).mode === "off") configuredPaths.push(`agents.list.${entry.id}.sandbox.docker`);
	}
	if (configuredPaths.length === 0) return findings;
	findings.push({
		checkId: "sandbox.docker_config_mode_off",
		severity: "warn",
		title: "Sandbox docker settings configured while sandbox mode is off",
		detail: "These docker settings will not take effect until sandbox mode is enabled:\n" + configuredPaths.map((entry) => `- ${entry}`).join("\n"),
		remediation: "Enable sandbox mode (`agents.defaults.sandbox.mode=\"non-main\"` or `\"all\"`) where needed, or remove unused docker settings."
	});
	return findings;
}
function collectNodeDenyCommandPatternFindings(cfg) {
	const findings = [];
	const denyListRaw = cfg.gateway?.nodes?.denyCommands;
	if (!Array.isArray(denyListRaw) || denyListRaw.length === 0) return findings;
	const denyList = denyListRaw.map(normalizeNodeCommand).filter(Boolean);
	if (denyList.length === 0) return findings;
	const knownCommands = listKnownNodeCommands(cfg);
	const patternLike = denyList.filter((entry) => looksLikeNodeCommandPattern(entry));
	const unknownExact = denyList.filter((entry) => !looksLikeNodeCommandPattern(entry) && !knownCommands.has(entry));
	if (patternLike.length === 0 && unknownExact.length === 0) return findings;
	const detailParts = [];
	if (patternLike.length > 0) detailParts.push(`Pattern-like entries (not supported by exact matching): ${patternLike.join(", ")}`);
	if (unknownExact.length > 0) detailParts.push(`Unknown command names (not in defaults/allowCommands): ${unknownExact.join(", ")}`);
	const examples = Array.from(knownCommands).slice(0, 8);
	findings.push({
		checkId: "gateway.nodes.deny_commands_ineffective",
		severity: "warn",
		title: "Some gateway.nodes.denyCommands entries are ineffective",
		detail: "gateway.nodes.denyCommands uses exact command-name matching only.\n" + detailParts.map((entry) => `- ${entry}`).join("\n"),
		remediation: `Use exact command names (for example: ${examples.join(", ")}). If you need broader restrictions, remove risky commands from allowCommands/default workflows.`
	});
	return findings;
}
function collectMinimalProfileOverrideFindings(cfg) {
	const findings = [];
	if (cfg.tools?.profile !== "minimal") return findings;
	const overrides = (cfg.agents?.list ?? []).filter((entry) => {
		return Boolean(entry && typeof entry === "object" && typeof entry.id === "string" && entry.tools?.profile && entry.tools.profile !== "minimal");
	}).map((entry) => `${entry.id}=${entry.tools?.profile}`);
	if (overrides.length === 0) return findings;
	findings.push({
		checkId: "tools.profile_minimal_overridden",
		severity: "warn",
		title: "Global tools.profile=minimal is overridden by agent profiles",
		detail: "Global minimal profile is set, but these agent profiles take precedence:\n" + overrides.map((entry) => `- agents.list.${entry}`).join("\n"),
		remediation: "Set those agents to `tools.profile=\"minimal\"` (or remove the agent override) if you want minimal tools enforced globally."
	});
	return findings;
}
function collectModelHygieneFindings(cfg) {
	const findings = [];
	const models = collectModels(cfg);
	if (models.length === 0) return findings;
	const weakMatches = /* @__PURE__ */ new Map();
	const addWeakMatch = (model, source, reason) => {
		const key = `${model}@@${source}`;
		const existing = weakMatches.get(key);
		if (!existing) {
			weakMatches.set(key, {
				model,
				source,
				reasons: [reason]
			});
			return;
		}
		if (!existing.reasons.includes(reason)) existing.reasons.push(reason);
	};
	for (const entry of models) {
		for (const pat of WEAK_TIER_MODEL_PATTERNS) if (pat.re.test(entry.id)) {
			addWeakMatch(entry.id, entry.source, pat.label);
			break;
		}
		if (isGptModel(entry.id) && !isGpt5OrHigher(entry.id)) addWeakMatch(entry.id, entry.source, "Below GPT-5 family");
		if (isClaudeModel(entry.id) && !isClaude45OrHigher(entry.id)) addWeakMatch(entry.id, entry.source, "Below Claude 4.5");
	}
	const matches = [];
	for (const entry of models) for (const pat of LEGACY_MODEL_PATTERNS) if (pat.re.test(entry.id)) {
		matches.push({
			model: entry.id,
			source: entry.source,
			reason: pat.label
		});
		break;
	}
	if (matches.length > 0) {
		const lines = matches.slice(0, 12).map((m) => `- ${m.model} (${m.reason}) @ ${m.source}`).join("\n");
		const more = matches.length > 12 ? `\n…${matches.length - 12} more` : "";
		findings.push({
			checkId: "models.legacy",
			severity: "warn",
			title: "Some configured models look legacy",
			detail: "Older/legacy models can be less robust against prompt injection and tool misuse.\n" + lines + more,
			remediation: "Prefer modern, instruction-hardened models for any bot that can run tools."
		});
	}
	if (weakMatches.size > 0) {
		const lines = Array.from(weakMatches.values()).slice(0, 12).map((m) => `- ${m.model} (${m.reasons.join("; ")}) @ ${m.source}`).join("\n");
		const more = weakMatches.size > 12 ? `\n…${weakMatches.size - 12} more` : "";
		findings.push({
			checkId: "models.weak_tier",
			severity: "warn",
			title: "Some configured models are below recommended tiers",
			detail: "Smaller/older models are generally more susceptible to prompt injection and tool misuse.\n" + lines + more,
			remediation: "Use the latest, top-tier model for any bot with tools or untrusted inboxes. Avoid Haiku tiers; prefer GPT-5+ and Claude 4.5+."
		});
	}
	return findings;
}
function collectSmallModelRiskFindings(params) {
	const findings = [];
	const models = collectModels(params.cfg).filter((entry) => !entry.source.includes("imageModel"));
	if (models.length === 0) return findings;
	const smallModels = models.map((entry) => {
		const paramB = inferParamBFromIdOrName(entry.id);
		if (!paramB || paramB > SMALL_MODEL_PARAM_B_MAX) return null;
		return {
			...entry,
			paramB
		};
	}).filter((entry) => Boolean(entry));
	if (smallModels.length === 0) return findings;
	let hasUnsafe = false;
	const modelLines = [];
	const exposureSet = /* @__PURE__ */ new Set();
	for (const entry of smallModels) {
		const agentId = extractAgentIdFromSource(entry.source);
		const sandboxMode = resolveSandboxConfigForAgent(params.cfg, agentId ?? void 0).mode;
		const agentTools = agentId && params.cfg.agents?.list ? params.cfg.agents.list.find((agent) => agent?.id === agentId)?.tools : void 0;
		const policies = resolveToolPolicies$1({
			cfg: params.cfg,
			agentTools,
			sandboxMode,
			agentId
		});
		const exposed = [];
		if (isWebSearchEnabled(params.cfg, params.env)) {
			if (isToolAllowedByPolicies("web_search", policies)) exposed.push("web_search");
		}
		if (isWebFetchEnabled(params.cfg)) {
			if (isToolAllowedByPolicies("web_fetch", policies)) exposed.push("web_fetch");
		}
		if (isBrowserEnabled(params.cfg)) {
			if (isToolAllowedByPolicies("browser", policies)) exposed.push("browser");
		}
		for (const tool of exposed) exposureSet.add(tool);
		const sandboxLabel = sandboxMode === "all" ? "sandbox=all" : `sandbox=${sandboxMode}`;
		const exposureLabel = exposed.length > 0 ? ` web=[${exposed.join(", ")}]` : " web=[off]";
		const safe = sandboxMode === "all" && exposed.length === 0;
		if (!safe) hasUnsafe = true;
		const statusLabel = safe ? "ok" : "unsafe";
		modelLines.push(`- ${entry.id} (${entry.paramB}B) @ ${entry.source} (${statusLabel}; ${sandboxLabel};${exposureLabel})`);
	}
	const exposureList = Array.from(exposureSet);
	const exposureDetail = exposureList.length > 0 ? `Uncontrolled input tools allowed: ${exposureList.join(", ")}.` : "No web/browser tools detected for these models.";
	findings.push({
		checkId: "models.small_params",
		severity: hasUnsafe ? "critical" : "info",
		title: "Small models require sandboxing and web tools disabled",
		detail: `Small models (<=${SMALL_MODEL_PARAM_B_MAX}B params) detected:\n` + modelLines.join("\n") + `\n` + exposureDetail + "\nSmall models are not recommended for untrusted inputs.",
		remediation: "If you must use small models, enable sandboxing for all sessions (agents.defaults.sandbox.mode=\"all\") and disable web_search/web_fetch/browser (tools.deny=[\"group:web\",\"browser\"])."
	});
	return findings;
}
function collectExposureMatrixFindings(cfg) {
	const findings = [];
	const openGroups = listGroupPolicyOpen(cfg);
	if (openGroups.length === 0) return findings;
	if (cfg.tools?.elevated?.enabled !== false) findings.push({
		checkId: "security.exposure.open_groups_with_elevated",
		severity: "critical",
		title: "Open groupPolicy with elevated tools enabled",
		detail: `Found groupPolicy="open" at:\n${openGroups.map((p) => `- ${p}`).join("\n")}\nWith tools.elevated enabled, a prompt injection in those rooms can become a high-impact incident.`,
		remediation: `Set groupPolicy="allowlist" and keep elevated allowlists extremely tight.`
	});
	return findings;
}

//#endregion
//#region src/security/windows-acl.ts
const INHERIT_FLAGS = new Set([
	"I",
	"OI",
	"CI",
	"IO",
	"NP"
]);
const WORLD_PRINCIPALS = new Set([
	"everyone",
	"users",
	"builtin\\users",
	"authenticated users",
	"nt authority\\authenticated users"
]);
const TRUSTED_BASE = new Set([
	"nt authority\\system",
	"system",
	"builtin\\administrators",
	"creator owner"
]);
const WORLD_SUFFIXES = ["\\users", "\\authenticated users"];
const TRUSTED_SUFFIXES = ["\\administrators", "\\system"];
const normalize = (value) => value.trim().toLowerCase();
function resolveWindowsUserPrincipal(env) {
	const username = env?.USERNAME?.trim() || os.userInfo().username?.trim();
	if (!username) return null;
	const domain = env?.USERDOMAIN?.trim();
	return domain ? `${domain}\\${username}` : username;
}
function buildTrustedPrincipals(env) {
	const trusted = new Set(TRUSTED_BASE);
	const principal = resolveWindowsUserPrincipal(env);
	if (principal) {
		trusted.add(normalize(principal));
		const userOnly = principal.split("\\").at(-1);
		if (userOnly) trusted.add(normalize(userOnly));
	}
	return trusted;
}
function classifyPrincipal(principal, env) {
	const normalized = normalize(principal);
	if (buildTrustedPrincipals(env).has(normalized) || TRUSTED_SUFFIXES.some((s) => normalized.endsWith(s))) return "trusted";
	if (WORLD_PRINCIPALS.has(normalized) || WORLD_SUFFIXES.some((s) => normalized.endsWith(s))) return "world";
	return "group";
}
function rightsFromTokens(tokens) {
	const upper = tokens.join("").toUpperCase();
	const canWrite = upper.includes("F") || upper.includes("M") || upper.includes("W") || upper.includes("D");
	return {
		canRead: upper.includes("F") || upper.includes("M") || upper.includes("R"),
		canWrite
	};
}
function parseIcaclsOutput(output, targetPath) {
	const entries = [];
	const normalizedTarget = targetPath.trim();
	const lowerTarget = normalizedTarget.toLowerCase();
	const quotedTarget = `"${normalizedTarget}"`;
	const quotedLower = quotedTarget.toLowerCase();
	for (const rawLine of output.split(/\r?\n/)) {
		const line = rawLine.trimEnd();
		if (!line.trim()) continue;
		const trimmed = line.trim();
		const lower = trimmed.toLowerCase();
		if (lower.startsWith("successfully processed") || lower.startsWith("processed") || lower.startsWith("failed processing") || lower.startsWith("no mapping between account names")) continue;
		let entry = trimmed;
		if (lower.startsWith(lowerTarget)) entry = trimmed.slice(normalizedTarget.length).trim();
		else if (lower.startsWith(quotedLower)) entry = trimmed.slice(quotedTarget.length).trim();
		if (!entry) continue;
		const idx = entry.indexOf(":");
		if (idx === -1) continue;
		const principal = entry.slice(0, idx).trim();
		const rawRights = entry.slice(idx + 1).trim();
		const tokens = rawRights.match(/\(([^)]+)\)/g)?.map((token) => token.slice(1, -1).trim()).filter(Boolean) ?? [];
		if (tokens.some((token) => token.toUpperCase() === "DENY")) continue;
		const rights = tokens.filter((token) => !INHERIT_FLAGS.has(token.toUpperCase()));
		if (rights.length === 0) continue;
		const { canRead, canWrite } = rightsFromTokens(rights);
		entries.push({
			principal,
			rights,
			rawRights,
			canRead,
			canWrite
		});
	}
	return entries;
}
function summarizeWindowsAcl(entries, env) {
	const trusted = [];
	const untrustedWorld = [];
	const untrustedGroup = [];
	for (const entry of entries) {
		const classification = classifyPrincipal(entry.principal, env);
		if (classification === "trusted") trusted.push(entry);
		else if (classification === "world") untrustedWorld.push(entry);
		else untrustedGroup.push(entry);
	}
	return {
		trusted,
		untrustedWorld,
		untrustedGroup
	};
}
async function inspectWindowsAcl(targetPath, opts) {
	const exec = opts?.exec ?? runExec;
	try {
		const { stdout, stderr } = await exec("icacls", [targetPath]);
		const entries = parseIcaclsOutput(`${stdout}\n${stderr}`.trim(), targetPath);
		const { trusted, untrustedWorld, untrustedGroup } = summarizeWindowsAcl(entries, opts?.env);
		return {
			ok: true,
			entries,
			trusted,
			untrustedWorld,
			untrustedGroup
		};
	} catch (err) {
		return {
			ok: false,
			entries: [],
			trusted: [],
			untrustedWorld: [],
			untrustedGroup: [],
			error: String(err)
		};
	}
}
function formatWindowsAclSummary(summary) {
	if (!summary.ok) return "unknown";
	const untrusted = [...summary.untrustedWorld, ...summary.untrustedGroup];
	if (untrusted.length === 0) return "trusted-only";
	return untrusted.map((entry) => `${entry.principal}:${entry.rawRights}`).join(", ");
}
function formatIcaclsResetCommand(targetPath, opts) {
	const user = resolveWindowsUserPrincipal(opts.env) ?? "%USERNAME%";
	const grant = opts.isDir ? "(OI)(CI)F" : "F";
	return `icacls "${targetPath}" /inheritance:r /grant:r "${user}:${grant}" /grant:r "SYSTEM:${grant}"`;
}
function createIcaclsResetCommand(targetPath, opts) {
	const user = resolveWindowsUserPrincipal(opts.env);
	if (!user) return null;
	const grant = opts.isDir ? "(OI)(CI)F" : "F";
	return {
		command: "icacls",
		args: [
			targetPath,
			"/inheritance:r",
			"/grant:r",
			`${user}:${grant}`,
			"/grant:r",
			`SYSTEM:${grant}`
		],
		display: formatIcaclsResetCommand(targetPath, opts)
	};
}

//#endregion
//#region src/security/audit-fs.ts
async function safeStat(targetPath) {
	try {
		const lst = await fs.lstat(targetPath);
		return {
			ok: true,
			isSymlink: lst.isSymbolicLink(),
			isDir: lst.isDirectory(),
			mode: typeof lst.mode === "number" ? lst.mode : null,
			uid: typeof lst.uid === "number" ? lst.uid : null,
			gid: typeof lst.gid === "number" ? lst.gid : null
		};
	} catch (err) {
		return {
			ok: false,
			isSymlink: false,
			isDir: false,
			mode: null,
			uid: null,
			gid: null,
			error: String(err)
		};
	}
}
async function inspectPathPermissions(targetPath, opts) {
	const st = await safeStat(targetPath);
	if (!st.ok) return {
		ok: false,
		isSymlink: false,
		isDir: false,
		mode: null,
		bits: null,
		source: "unknown",
		worldWritable: false,
		groupWritable: false,
		worldReadable: false,
		groupReadable: false,
		error: st.error
	};
	const bits = modeBits(st.mode);
	if ((opts?.platform ?? process.platform) === "win32") {
		const acl = await inspectWindowsAcl(targetPath, {
			env: opts?.env,
			exec: opts?.exec
		});
		if (!acl.ok) return {
			ok: true,
			isSymlink: st.isSymlink,
			isDir: st.isDir,
			mode: st.mode,
			bits,
			source: "unknown",
			worldWritable: false,
			groupWritable: false,
			worldReadable: false,
			groupReadable: false,
			error: acl.error
		};
		return {
			ok: true,
			isSymlink: st.isSymlink,
			isDir: st.isDir,
			mode: st.mode,
			bits,
			source: "windows-acl",
			worldWritable: acl.untrustedWorld.some((entry) => entry.canWrite),
			groupWritable: acl.untrustedGroup.some((entry) => entry.canWrite),
			worldReadable: acl.untrustedWorld.some((entry) => entry.canRead),
			groupReadable: acl.untrustedGroup.some((entry) => entry.canRead),
			aclSummary: formatWindowsAclSummary(acl)
		};
	}
	return {
		ok: true,
		isSymlink: st.isSymlink,
		isDir: st.isDir,
		mode: st.mode,
		bits,
		source: "posix",
		worldWritable: isWorldWritable(bits),
		groupWritable: isGroupWritable(bits),
		worldReadable: isWorldReadable(bits),
		groupReadable: isGroupReadable(bits)
	};
}
function formatPermissionDetail(targetPath, perms) {
	if (perms.source === "windows-acl") return `${targetPath} acl=${perms.aclSummary ?? "unknown"}`;
	return `${targetPath} mode=${formatOctal(perms.bits)}`;
}
function formatPermissionRemediation(params) {
	if (params.perms.source === "windows-acl") return formatIcaclsResetCommand(params.targetPath, {
		isDir: params.isDir,
		env: params.env
	});
	return `chmod ${params.posixMode.toString(8).padStart(3, "0")} ${params.targetPath}`;
}
function modeBits(mode) {
	if (mode == null) return null;
	return mode & 511;
}
function formatOctal(bits) {
	if (bits == null) return "unknown";
	return bits.toString(8).padStart(3, "0");
}
function isWorldWritable(bits) {
	if (bits == null) return false;
	return (bits & 2) !== 0;
}
function isGroupWritable(bits) {
	if (bits == null) return false;
	return (bits & 16) !== 0;
}
function isWorldReadable(bits) {
	if (bits == null) return false;
	return (bits & 4) !== 0;
}
function isGroupReadable(bits) {
	if (bits == null) return false;
	return (bits & 32) !== 0;
}

//#endregion
//#region src/security/audit-extra.async.ts
/**
* Asynchronous security audit collector functions.
*
* These functions perform I/O (filesystem, config reads) to detect security issues.
*/
function expandTilde(p, env) {
	if (!p.startsWith("~")) return p;
	const home = typeof env.HOME === "string" && env.HOME.trim() ? env.HOME.trim() : null;
	if (!home) return null;
	if (p === "~") return home;
	if (p.startsWith("~/") || p.startsWith("~\\")) return path.join(home, p.slice(2));
	return null;
}
function resolveIncludePath(baseConfigPath, includePath) {
	return path.normalize(path.isAbsolute(includePath) ? includePath : path.resolve(path.dirname(baseConfigPath), includePath));
}
function listDirectIncludes(parsed) {
	const out = [];
	const visit = (value) => {
		if (!value) return;
		if (Array.isArray(value)) {
			for (const item of value) visit(item);
			return;
		}
		if (typeof value !== "object") return;
		const rec = value;
		const includeVal = rec[INCLUDE_KEY];
		if (typeof includeVal === "string") out.push(includeVal);
		else if (Array.isArray(includeVal)) {
			for (const item of includeVal) if (typeof item === "string") out.push(item);
		}
		for (const v of Object.values(rec)) visit(v);
	};
	visit(parsed);
	return out;
}
async function collectIncludePathsRecursive(params) {
	const visited = /* @__PURE__ */ new Set();
	const result = [];
	const walk = async (basePath, parsed, depth) => {
		if (depth > MAX_INCLUDE_DEPTH) return;
		for (const raw of listDirectIncludes(parsed)) {
			const resolved = resolveIncludePath(basePath, raw);
			if (visited.has(resolved)) continue;
			visited.add(resolved);
			result.push(resolved);
			const rawText = await fs.readFile(resolved, "utf-8").catch(() => null);
			if (!rawText) continue;
			const nestedParsed = (() => {
				try {
					return JSON5.parse(rawText);
				} catch {
					return null;
				}
			})();
			if (nestedParsed) await walk(resolved, nestedParsed, depth + 1);
		}
	};
	await walk(params.configPath, params.parsed, 0);
	return result;
}
function isPathInside(basePath, candidatePath) {
	const base = path.resolve(basePath);
	const candidate = path.resolve(candidatePath);
	const rel = path.relative(base, candidate);
	return rel === "" || !rel.startsWith(`..${path.sep}`) && rel !== ".." && !path.isAbsolute(rel);
}
function extensionUsesSkippedScannerPath(entry) {
	return entry.split(/[\\/]+/).filter(Boolean).some((segment) => segment === "node_modules" || segment.startsWith(".") && segment !== "." && segment !== "..");
}
async function readPluginManifestExtensions(pluginPath) {
	const manifestPath = path.join(pluginPath, "package.json");
	const raw = await fs.readFile(manifestPath, "utf-8").catch(() => "");
	if (!raw.trim()) return [];
	const extensions = JSON.parse(raw)?.[MANIFEST_KEY]?.extensions;
	if (!Array.isArray(extensions)) return [];
	return extensions.map((entry) => typeof entry === "string" ? entry.trim() : "").filter(Boolean);
}
function listWorkspaceDirs(cfg) {
	const dirs = /* @__PURE__ */ new Set();
	const list = cfg.agents?.list;
	if (Array.isArray(list)) {
		for (const entry of list) if (entry && typeof entry === "object" && typeof entry.id === "string") dirs.add(resolveAgentWorkspaceDir(cfg, entry.id));
	}
	dirs.add(resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg)));
	return [...dirs];
}
function formatCodeSafetyDetails(findings, rootDir) {
	return findings.map((finding) => {
		const relPath = path.relative(rootDir, finding.file);
		const normalizedPath = (relPath && relPath !== "." && !relPath.startsWith("..") ? relPath : path.basename(finding.file)).replaceAll("\\", "/");
		return `  - [${finding.ruleId}] ${finding.message} (${normalizedPath}:${finding.line})`;
	}).join("\n");
}
function unionAllow(base, extra) {
	if (!Array.isArray(extra) || extra.length === 0) return base;
	if (!Array.isArray(base) || base.length === 0) return Array.from(new Set(["*", ...extra]));
	return Array.from(new Set([...base, ...extra]));
}
function pickToolPolicy(config) {
	if (!config) return;
	const allow = Array.isArray(config.allow) ? unionAllow(config.allow, config.alsoAllow) : Array.isArray(config.alsoAllow) && config.alsoAllow.length > 0 ? unionAllow(void 0, config.alsoAllow) : void 0;
	const deny = Array.isArray(config.deny) ? config.deny : void 0;
	if (!allow && !deny) return;
	return {
		allow,
		deny
	};
}
function resolveToolPolicies(params) {
	const policies = [
		resolveToolProfilePolicy(params.agentTools?.profile ?? params.cfg.tools?.profile),
		pickToolPolicy(params.cfg.tools ?? void 0),
		pickToolPolicy(params.agentTools)
	];
	if (params.sandboxMode === "all") policies.push(resolveSandboxToolPolicyForAgent(params.cfg, params.agentId ?? void 0));
	return policies;
}
function normalizePluginIdSet(entries) {
	return new Set(entries.map((entry) => entry.trim().toLowerCase()).filter(Boolean));
}
function resolveEnabledExtensionPluginIds(params) {
	const normalized = normalizePluginsConfig(params.cfg.plugins);
	if (!normalized.enabled) return [];
	const allowSet = normalizePluginIdSet(normalized.allow);
	const denySet = normalizePluginIdSet(normalized.deny);
	const entryById = /* @__PURE__ */ new Map();
	for (const [id, entry] of Object.entries(normalized.entries)) entryById.set(id.trim().toLowerCase(), entry);
	const enabled = [];
	for (const id of params.pluginDirs) {
		const normalizedId = id.trim().toLowerCase();
		if (!normalizedId) continue;
		if (denySet.has(normalizedId)) continue;
		if (allowSet.size > 0 && !allowSet.has(normalizedId)) continue;
		if (entryById.get(normalizedId)?.enabled === false) continue;
		enabled.push(normalizedId);
	}
	return enabled;
}
function collectAllowEntries(config) {
	const out = [];
	if (Array.isArray(config?.allow)) out.push(...config.allow);
	if (Array.isArray(config?.alsoAllow)) out.push(...config.alsoAllow);
	return out.map((entry) => entry.trim().toLowerCase()).filter(Boolean);
}
function hasExplicitPluginAllow(params) {
	return params.allowEntries.some((entry) => entry === "group:plugins" || params.enabledPluginIds.has(entry));
}
function hasProviderPluginAllow(params) {
	if (!params.byProvider) return false;
	for (const policy of Object.values(params.byProvider)) if (hasExplicitPluginAllow({
		allowEntries: collectAllowEntries(policy),
		enabledPluginIds: params.enabledPluginIds
	})) return true;
	return false;
}
async function collectPluginsTrustFindings(params) {
	const findings = [];
	const extensionsDir = path.join(params.stateDir, "extensions");
	const st = await safeStat(extensionsDir);
	if (!st.ok || !st.isDir) return findings;
	const pluginDirs = (await fs.readdir(extensionsDir, { withFileTypes: true }).catch(() => [])).filter((e) => e.isDirectory()).map((e) => e.name).filter(Boolean);
	if (pluginDirs.length === 0) return findings;
	const allow = params.cfg.plugins?.allow;
	if (!(Array.isArray(allow) && allow.length > 0)) {
		const hasString = (value) => typeof value === "string" && value.trim().length > 0;
		const hasAccountStringKey = (account, key) => Boolean(account && typeof account === "object" && hasString(account[key]));
		const discordConfigured = hasString(params.cfg.channels?.discord?.token) || Boolean(params.cfg.channels?.discord?.accounts && Object.values(params.cfg.channels.discord.accounts).some((a) => hasAccountStringKey(a, "token"))) || hasString(process.env.DISCORD_BOT_TOKEN);
		const telegramConfigured = hasString(params.cfg.channels?.telegram?.botToken) || hasString(params.cfg.channels?.telegram?.tokenFile) || Boolean(params.cfg.channels?.telegram?.accounts && Object.values(params.cfg.channels.telegram.accounts).some((a) => hasAccountStringKey(a, "botToken") || hasAccountStringKey(a, "tokenFile"))) || hasString(process.env.TELEGRAM_BOT_TOKEN);
		const slackConfigured = hasString(params.cfg.channels?.slack?.botToken) || hasString(params.cfg.channels?.slack?.appToken) || Boolean(params.cfg.channels?.slack?.accounts && Object.values(params.cfg.channels.slack.accounts).some((a) => hasAccountStringKey(a, "botToken") || hasAccountStringKey(a, "appToken"))) || hasString(process.env.SLACK_BOT_TOKEN) || hasString(process.env.SLACK_APP_TOKEN);
		const skillCommandsLikelyExposed = discordConfigured && resolveNativeSkillsEnabled({
			providerId: "discord",
			providerSetting: params.cfg.channels?.discord?.commands?.nativeSkills,
			globalSetting: params.cfg.commands?.nativeSkills
		}) || telegramConfigured && resolveNativeSkillsEnabled({
			providerId: "telegram",
			providerSetting: params.cfg.channels?.telegram?.commands?.nativeSkills,
			globalSetting: params.cfg.commands?.nativeSkills
		}) || slackConfigured && resolveNativeSkillsEnabled({
			providerId: "slack",
			providerSetting: params.cfg.channels?.slack?.commands?.nativeSkills,
			globalSetting: params.cfg.commands?.nativeSkills
		});
		findings.push({
			checkId: "plugins.extensions_no_allowlist",
			severity: skillCommandsLikelyExposed ? "critical" : "warn",
			title: "Extensions exist but plugins.allow is not set",
			detail: `Found ${pluginDirs.length} extension(s) under ${extensionsDir}. Without plugins.allow, any discovered plugin id may load (depending on config and plugin behavior).` + (skillCommandsLikelyExposed ? "\nNative skill commands are enabled on at least one configured chat surface; treat unpinned/unallowlisted extensions as high risk." : ""),
			remediation: "Set plugins.allow to an explicit list of plugin ids you trust."
		});
	}
	const enabledExtensionPluginIds = resolveEnabledExtensionPluginIds({
		cfg: params.cfg,
		pluginDirs
	});
	if (enabledExtensionPluginIds.length > 0) {
		const enabledPluginSet = new Set(enabledExtensionPluginIds);
		const contexts = [{ label: "default" }];
		for (const entry of params.cfg.agents?.list ?? []) {
			if (!entry || typeof entry !== "object" || typeof entry.id !== "string") continue;
			contexts.push({
				label: `agents.list.${entry.id}`,
				agentId: entry.id,
				tools: entry.tools
			});
		}
		const permissiveContexts = [];
		for (const context of contexts) {
			const profile = context.tools?.profile ?? params.cfg.tools?.profile;
			const restrictiveProfile = Boolean(resolveToolProfilePolicy(profile));
			const sandboxMode = resolveSandboxConfigForAgent(params.cfg, context.agentId).mode;
			const broadPolicy = isToolAllowedByPolicies("__openclaw_plugin_probe__", resolveToolPolicies({
				cfg: params.cfg,
				agentTools: context.tools,
				sandboxMode,
				agentId: context.agentId
			}));
			const explicitPluginAllow = !restrictiveProfile && (hasExplicitPluginAllow({
				allowEntries: collectAllowEntries(params.cfg.tools),
				enabledPluginIds: enabledPluginSet
			}) || hasProviderPluginAllow({
				byProvider: params.cfg.tools?.byProvider,
				enabledPluginIds: enabledPluginSet
			}) || hasExplicitPluginAllow({
				allowEntries: collectAllowEntries(context.tools),
				enabledPluginIds: enabledPluginSet
			}) || hasProviderPluginAllow({
				byProvider: context.tools?.byProvider,
				enabledPluginIds: enabledPluginSet
			}));
			if (broadPolicy || explicitPluginAllow) permissiveContexts.push(context.label);
		}
		if (permissiveContexts.length > 0) findings.push({
			checkId: "plugins.tools_reachable_permissive_policy",
			severity: "warn",
			title: "Extension plugin tools may be reachable under permissive tool policy",
			detail: `Enabled extension plugins: ${enabledExtensionPluginIds.join(", ")}.\nPermissive tool policy contexts:\n${permissiveContexts.map((entry) => `- ${entry}`).join("\n")}`,
			remediation: "Use restrictive profiles (`minimal`/`coding`) or explicit tool allowlists that exclude plugin tools for agents handling untrusted input."
		});
	}
	return findings;
}
async function collectIncludeFilePermFindings(params) {
	const findings = [];
	if (!params.configSnapshot.exists) return findings;
	const configPath = params.configSnapshot.path;
	const includePaths = await collectIncludePathsRecursive({
		configPath,
		parsed: params.configSnapshot.parsed
	});
	if (includePaths.length === 0) return findings;
	for (const p of includePaths) {
		const perms = await inspectPathPermissions(p, {
			env: params.env,
			platform: params.platform,
			exec: params.execIcacls
		});
		if (!perms.ok) continue;
		if (perms.worldWritable || perms.groupWritable) findings.push({
			checkId: "fs.config_include.perms_writable",
			severity: "critical",
			title: "Config include file is writable by others",
			detail: `${formatPermissionDetail(p, perms)}; another user could influence your effective config.`,
			remediation: formatPermissionRemediation({
				targetPath: p,
				perms,
				isDir: false,
				posixMode: 384,
				env: params.env
			})
		});
		else if (perms.worldReadable) findings.push({
			checkId: "fs.config_include.perms_world_readable",
			severity: "critical",
			title: "Config include file is world-readable",
			detail: `${formatPermissionDetail(p, perms)}; include files can contain tokens and private settings.`,
			remediation: formatPermissionRemediation({
				targetPath: p,
				perms,
				isDir: false,
				posixMode: 384,
				env: params.env
			})
		});
		else if (perms.groupReadable) findings.push({
			checkId: "fs.config_include.perms_group_readable",
			severity: "warn",
			title: "Config include file is group-readable",
			detail: `${formatPermissionDetail(p, perms)}; include files can contain tokens and private settings.`,
			remediation: formatPermissionRemediation({
				targetPath: p,
				perms,
				isDir: false,
				posixMode: 384,
				env: params.env
			})
		});
	}
	return findings;
}
async function collectStateDeepFilesystemFindings(params) {
	const findings = [];
	const oauthDir = resolveOAuthDir(params.env, params.stateDir);
	const oauthPerms = await inspectPathPermissions(oauthDir, {
		env: params.env,
		platform: params.platform,
		exec: params.execIcacls
	});
	if (oauthPerms.ok && oauthPerms.isDir) {
		if (oauthPerms.worldWritable || oauthPerms.groupWritable) findings.push({
			checkId: "fs.credentials_dir.perms_writable",
			severity: "critical",
			title: "Credentials dir is writable by others",
			detail: `${formatPermissionDetail(oauthDir, oauthPerms)}; another user could drop/modify credential files.`,
			remediation: formatPermissionRemediation({
				targetPath: oauthDir,
				perms: oauthPerms,
				isDir: true,
				posixMode: 448,
				env: params.env
			})
		});
		else if (oauthPerms.groupReadable || oauthPerms.worldReadable) findings.push({
			checkId: "fs.credentials_dir.perms_readable",
			severity: "warn",
			title: "Credentials dir is readable by others",
			detail: `${formatPermissionDetail(oauthDir, oauthPerms)}; credentials and allowlists can be sensitive.`,
			remediation: formatPermissionRemediation({
				targetPath: oauthDir,
				perms: oauthPerms,
				isDir: true,
				posixMode: 448,
				env: params.env
			})
		});
	}
	const agentIds = Array.isArray(params.cfg.agents?.list) ? params.cfg.agents?.list.map((a) => a && typeof a === "object" && typeof a.id === "string" ? a.id.trim() : "").filter(Boolean) : [];
	const defaultAgentId = resolveDefaultAgentId(params.cfg);
	const ids = Array.from(new Set([defaultAgentId, ...agentIds])).map((id) => normalizeAgentId(id));
	for (const agentId of ids) {
		const agentDir = path.join(params.stateDir, "agents", agentId, "agent");
		const authPath = path.join(agentDir, "auth-profiles.json");
		const authPerms = await inspectPathPermissions(authPath, {
			env: params.env,
			platform: params.platform,
			exec: params.execIcacls
		});
		if (authPerms.ok) {
			if (authPerms.worldWritable || authPerms.groupWritable) findings.push({
				checkId: "fs.auth_profiles.perms_writable",
				severity: "critical",
				title: "auth-profiles.json is writable by others",
				detail: `${formatPermissionDetail(authPath, authPerms)}; another user could inject credentials.`,
				remediation: formatPermissionRemediation({
					targetPath: authPath,
					perms: authPerms,
					isDir: false,
					posixMode: 384,
					env: params.env
				})
			});
			else if (authPerms.worldReadable || authPerms.groupReadable) findings.push({
				checkId: "fs.auth_profiles.perms_readable",
				severity: "warn",
				title: "auth-profiles.json is readable by others",
				detail: `${formatPermissionDetail(authPath, authPerms)}; auth-profiles.json contains API keys and OAuth tokens.`,
				remediation: formatPermissionRemediation({
					targetPath: authPath,
					perms: authPerms,
					isDir: false,
					posixMode: 384,
					env: params.env
				})
			});
		}
		const storePath = path.join(params.stateDir, "agents", agentId, "sessions", "sessions.json");
		const storePerms = await inspectPathPermissions(storePath, {
			env: params.env,
			platform: params.platform,
			exec: params.execIcacls
		});
		if (storePerms.ok) {
			if (storePerms.worldReadable || storePerms.groupReadable) findings.push({
				checkId: "fs.sessions_store.perms_readable",
				severity: "warn",
				title: "sessions.json is readable by others",
				detail: `${formatPermissionDetail(storePath, storePerms)}; routing and transcript metadata can be sensitive.`,
				remediation: formatPermissionRemediation({
					targetPath: storePath,
					perms: storePerms,
					isDir: false,
					posixMode: 384,
					env: params.env
				})
			});
		}
	}
	const logFile = typeof params.cfg.logging?.file === "string" ? params.cfg.logging.file.trim() : "";
	if (logFile) {
		const expanded = logFile.startsWith("~") ? expandTilde(logFile, params.env) : logFile;
		if (expanded) {
			const logPath = path.resolve(expanded);
			const logPerms = await inspectPathPermissions(logPath, {
				env: params.env,
				platform: params.platform,
				exec: params.execIcacls
			});
			if (logPerms.ok) {
				if (logPerms.worldReadable || logPerms.groupReadable) findings.push({
					checkId: "fs.log_file.perms_readable",
					severity: "warn",
					title: "Log file is readable by others",
					detail: `${formatPermissionDetail(logPath, logPerms)}; logs can contain private messages and tool output.`,
					remediation: formatPermissionRemediation({
						targetPath: logPath,
						perms: logPerms,
						isDir: false,
						posixMode: 384,
						env: params.env
					})
				});
			}
		}
	}
	return findings;
}
async function readConfigSnapshotForAudit(params) {
	return await createConfigIO({
		env: params.env,
		configPath: params.configPath
	}).readConfigFileSnapshot();
}
async function collectPluginsCodeSafetyFindings(params) {
	const findings = [];
	const extensionsDir = path.join(params.stateDir, "extensions");
	const st = await safeStat(extensionsDir);
	if (!st.ok || !st.isDir) return findings;
	const pluginDirs = (await fs.readdir(extensionsDir, { withFileTypes: true }).catch((err) => {
		findings.push({
			checkId: "plugins.code_safety.scan_failed",
			severity: "warn",
			title: "Plugin extensions directory scan failed",
			detail: `Static code scan could not list extensions directory: ${String(err)}`,
			remediation: "Check file permissions and plugin layout, then rerun `openclaw security audit --deep`."
		});
		return [];
	})).filter((e) => e.isDirectory()).map((e) => e.name);
	for (const pluginName of pluginDirs) {
		const pluginPath = path.join(extensionsDir, pluginName);
		const extensionEntries = await readPluginManifestExtensions(pluginPath).catch(() => []);
		const forcedScanEntries = [];
		const escapedEntries = [];
		for (const entry of extensionEntries) {
			const resolvedEntry = path.resolve(pluginPath, entry);
			if (!isPathInside(pluginPath, resolvedEntry)) {
				escapedEntries.push(entry);
				continue;
			}
			if (extensionUsesSkippedScannerPath(entry)) findings.push({
				checkId: "plugins.code_safety.entry_path",
				severity: "warn",
				title: `Plugin "${pluginName}" entry path is hidden or node_modules`,
				detail: `Extension entry "${entry}" points to a hidden or node_modules path. Deep code scan will cover this entry explicitly, but review this path choice carefully.`,
				remediation: "Prefer extension entrypoints under normal source paths like dist/ or src/."
			});
			forcedScanEntries.push(resolvedEntry);
		}
		if (escapedEntries.length > 0) findings.push({
			checkId: "plugins.code_safety.entry_escape",
			severity: "critical",
			title: `Plugin "${pluginName}" has extension entry path traversal`,
			detail: `Found extension entries that escape the plugin directory:\n${escapedEntries.map((entry) => `  - ${entry}`).join("\n")}`,
			remediation: "Update the plugin manifest so all openclaw.extensions entries stay inside the plugin directory."
		});
		const summary = await scanDirectoryWithSummary(pluginPath, { includeFiles: forcedScanEntries }).catch((err) => {
			findings.push({
				checkId: "plugins.code_safety.scan_failed",
				severity: "warn",
				title: `Plugin "${pluginName}" code scan failed`,
				detail: `Static code scan could not complete: ${String(err)}`,
				remediation: "Check file permissions and plugin layout, then rerun `openclaw security audit --deep`."
			});
			return null;
		});
		if (!summary) continue;
		if (summary.critical > 0) {
			const details = formatCodeSafetyDetails(summary.findings.filter((f) => f.severity === "critical"), pluginPath);
			findings.push({
				checkId: "plugins.code_safety",
				severity: "critical",
				title: `Plugin "${pluginName}" contains dangerous code patterns`,
				detail: `Found ${summary.critical} critical issue(s) in ${summary.scannedFiles} scanned file(s):\n${details}`,
				remediation: "Review the plugin source code carefully before use. If untrusted, remove the plugin from your OpenClaw extensions state directory."
			});
		} else if (summary.warn > 0) {
			const details = formatCodeSafetyDetails(summary.findings.filter((f) => f.severity === "warn"), pluginPath);
			findings.push({
				checkId: "plugins.code_safety",
				severity: "warn",
				title: `Plugin "${pluginName}" contains suspicious code patterns`,
				detail: `Found ${summary.warn} warning(s) in ${summary.scannedFiles} scanned file(s):\n${details}`,
				remediation: `Review the flagged code to ensure it is intentional and safe.`
			});
		}
	}
	return findings;
}
async function collectInstalledSkillsCodeSafetyFindings(params) {
	const findings = [];
	const pluginExtensionsDir = path.join(params.stateDir, "extensions");
	const scannedSkillDirs = /* @__PURE__ */ new Set();
	const workspaceDirs = listWorkspaceDirs(params.cfg);
	for (const workspaceDir of workspaceDirs) {
		const entries = loadWorkspaceSkillEntries(workspaceDir, { config: params.cfg });
		for (const entry of entries) {
			if (entry.skill.source === "openclaw-bundled") continue;
			const skillDir = path.resolve(entry.skill.baseDir);
			if (isPathInside(pluginExtensionsDir, skillDir)) continue;
			if (scannedSkillDirs.has(skillDir)) continue;
			scannedSkillDirs.add(skillDir);
			const skillName = entry.skill.name;
			const summary = await scanDirectoryWithSummary(skillDir).catch((err) => {
				findings.push({
					checkId: "skills.code_safety.scan_failed",
					severity: "warn",
					title: `Skill "${skillName}" code scan failed`,
					detail: `Static code scan could not complete for ${skillDir}: ${String(err)}`,
					remediation: "Check file permissions and skill layout, then rerun `openclaw security audit --deep`."
				});
				return null;
			});
			if (!summary) continue;
			if (summary.critical > 0) {
				const details = formatCodeSafetyDetails(summary.findings.filter((finding) => finding.severity === "critical"), skillDir);
				findings.push({
					checkId: "skills.code_safety",
					severity: "critical",
					title: `Skill "${skillName}" contains dangerous code patterns`,
					detail: `Found ${summary.critical} critical issue(s) in ${summary.scannedFiles} scanned file(s) under ${skillDir}:\n${details}`,
					remediation: `Review the skill source code before use. If untrusted, remove "${skillDir}".`
				});
			} else if (summary.warn > 0) {
				const details = formatCodeSafetyDetails(summary.findings.filter((finding) => finding.severity === "warn"), skillDir);
				findings.push({
					checkId: "skills.code_safety",
					severity: "warn",
					title: `Skill "${skillName}" contains suspicious code patterns`,
					detail: `Found ${summary.warn} warning(s) in ${summary.scannedFiles} scanned file(s) under ${skillDir}:\n${details}`,
					remediation: "Review flagged lines to ensure the behavior is intentional and safe."
				});
			}
		}
	}
	return findings;
}

//#endregion
//#region src/security/audit.ts
function countBySeverity(findings) {
	let critical = 0;
	let warn = 0;
	let info = 0;
	for (const f of findings) if (f.severity === "critical") critical += 1;
	else if (f.severity === "warn") warn += 1;
	else info += 1;
	return {
		critical,
		warn,
		info
	};
}
function normalizeAllowFromList(list) {
	if (!Array.isArray(list)) return [];
	return list.map((v) => String(v).trim()).filter(Boolean);
}
async function collectFilesystemFindings(params) {
	const findings = [];
	const stateDirPerms = await inspectPathPermissions(params.stateDir, {
		env: params.env,
		platform: params.platform,
		exec: params.execIcacls
	});
	if (stateDirPerms.ok) {
		if (stateDirPerms.isSymlink) findings.push({
			checkId: "fs.state_dir.symlink",
			severity: "warn",
			title: "State dir is a symlink",
			detail: `${params.stateDir} is a symlink; treat this as an extra trust boundary.`
		});
		if (stateDirPerms.worldWritable) findings.push({
			checkId: "fs.state_dir.perms_world_writable",
			severity: "critical",
			title: "State dir is world-writable",
			detail: `${formatPermissionDetail(params.stateDir, stateDirPerms)}; other users can write into your OpenClaw state.`,
			remediation: formatPermissionRemediation({
				targetPath: params.stateDir,
				perms: stateDirPerms,
				isDir: true,
				posixMode: 448,
				env: params.env
			})
		});
		else if (stateDirPerms.groupWritable) findings.push({
			checkId: "fs.state_dir.perms_group_writable",
			severity: "warn",
			title: "State dir is group-writable",
			detail: `${formatPermissionDetail(params.stateDir, stateDirPerms)}; group users can write into your OpenClaw state.`,
			remediation: formatPermissionRemediation({
				targetPath: params.stateDir,
				perms: stateDirPerms,
				isDir: true,
				posixMode: 448,
				env: params.env
			})
		});
		else if (stateDirPerms.groupReadable || stateDirPerms.worldReadable) findings.push({
			checkId: "fs.state_dir.perms_readable",
			severity: "warn",
			title: "State dir is readable by others",
			detail: `${formatPermissionDetail(params.stateDir, stateDirPerms)}; consider restricting to 700.`,
			remediation: formatPermissionRemediation({
				targetPath: params.stateDir,
				perms: stateDirPerms,
				isDir: true,
				posixMode: 448,
				env: params.env
			})
		});
	}
	const configPerms = await inspectPathPermissions(params.configPath, {
		env: params.env,
		platform: params.platform,
		exec: params.execIcacls
	});
	if (configPerms.ok) {
		if (configPerms.isSymlink) findings.push({
			checkId: "fs.config.symlink",
			severity: "warn",
			title: "Config file is a symlink",
			detail: `${params.configPath} is a symlink; make sure you trust its target.`
		});
		if (configPerms.worldWritable || configPerms.groupWritable) findings.push({
			checkId: "fs.config.perms_writable",
			severity: "critical",
			title: "Config file is writable by others",
			detail: `${formatPermissionDetail(params.configPath, configPerms)}; another user could change gateway/auth/tool policies.`,
			remediation: formatPermissionRemediation({
				targetPath: params.configPath,
				perms: configPerms,
				isDir: false,
				posixMode: 384,
				env: params.env
			})
		});
		else if (configPerms.worldReadable) findings.push({
			checkId: "fs.config.perms_world_readable",
			severity: "critical",
			title: "Config file is world-readable",
			detail: `${formatPermissionDetail(params.configPath, configPerms)}; config can contain tokens and private settings.`,
			remediation: formatPermissionRemediation({
				targetPath: params.configPath,
				perms: configPerms,
				isDir: false,
				posixMode: 384,
				env: params.env
			})
		});
		else if (configPerms.groupReadable) findings.push({
			checkId: "fs.config.perms_group_readable",
			severity: "warn",
			title: "Config file is group-readable",
			detail: `${formatPermissionDetail(params.configPath, configPerms)}; config can contain tokens and private settings.`,
			remediation: formatPermissionRemediation({
				targetPath: params.configPath,
				perms: configPerms,
				isDir: false,
				posixMode: 384,
				env: params.env
			})
		});
	}
	return findings;
}
function collectGatewayConfigFindings(cfg, env) {
	const findings = [];
	const bind = typeof cfg.gateway?.bind === "string" ? cfg.gateway.bind : "loopback";
	const tailscaleMode = cfg.gateway?.tailscale?.mode ?? "off";
	const auth = resolveGatewayAuth({
		authConfig: cfg.gateway?.auth,
		tailscaleMode,
		env
	});
	const controlUiEnabled = cfg.gateway?.controlUi?.enabled !== false;
	const trustedProxies = Array.isArray(cfg.gateway?.trustedProxies) ? cfg.gateway.trustedProxies : [];
	const hasToken = typeof auth.token === "string" && auth.token.trim().length > 0;
	const hasPassword = typeof auth.password === "string" && auth.password.trim().length > 0;
	const hasSharedSecret = auth.mode === "token" && hasToken || auth.mode === "password" && hasPassword;
	const hasTailscaleAuth = auth.allowTailscale && tailscaleMode === "serve";
	const hasGatewayAuth = hasSharedSecret || hasTailscaleAuth;
	const remotelyExposed = bind !== "loopback" || tailscaleMode === "serve" || tailscaleMode === "funnel";
	if (bind !== "loopback" && !hasSharedSecret) findings.push({
		checkId: "gateway.bind_no_auth",
		severity: "critical",
		title: "Gateway binds beyond loopback without auth",
		detail: `gateway.bind="${bind}" but no gateway.auth token/password is configured.`,
		remediation: `Set gateway.auth (token recommended) or bind to loopback.`
	});
	if (bind === "loopback" && controlUiEnabled && trustedProxies.length === 0) findings.push({
		checkId: "gateway.trusted_proxies_missing",
		severity: "warn",
		title: "Reverse proxy headers are not trusted",
		detail: "gateway.bind is loopback and gateway.trustedProxies is empty. If you expose the Control UI through a reverse proxy, configure trusted proxies so local-client checks cannot be spoofed.",
		remediation: "Set gateway.trustedProxies to your proxy IPs or keep the Control UI local-only."
	});
	if (bind === "loopback" && controlUiEnabled && !hasGatewayAuth) findings.push({
		checkId: "gateway.loopback_no_auth",
		severity: "critical",
		title: "Gateway auth missing on loopback",
		detail: "gateway.bind is loopback but no gateway auth secret is configured. If the Control UI is exposed through a reverse proxy, unauthenticated access is possible.",
		remediation: "Set gateway.auth (token recommended) or keep the Control UI local-only."
	});
	if (tailscaleMode === "funnel") findings.push({
		checkId: "gateway.tailscale_funnel",
		severity: "critical",
		title: "Tailscale Funnel exposure enabled",
		detail: `gateway.tailscale.mode="funnel" exposes the Gateway publicly; keep auth strict and treat it as internet-facing.`,
		remediation: `Prefer tailscale.mode="serve" (tailnet-only) or set tailscale.mode="off".`
	});
	else if (tailscaleMode === "serve") findings.push({
		checkId: "gateway.tailscale_serve",
		severity: "info",
		title: "Tailscale Serve exposure enabled",
		detail: `gateway.tailscale.mode="serve" exposes the Gateway to your tailnet (loopback behind Tailscale).`
	});
	if (cfg.gateway?.controlUi?.allowInsecureAuth === true) findings.push({
		checkId: "gateway.control_ui.insecure_auth",
		severity: "critical",
		title: "Control UI allows insecure HTTP auth",
		detail: "gateway.controlUi.allowInsecureAuth=true allows token-only auth over HTTP and skips device identity.",
		remediation: "Disable it or switch to HTTPS (Tailscale Serve) or localhost."
	});
	if (cfg.gateway?.controlUi?.dangerouslyDisableDeviceAuth === true) findings.push({
		checkId: "gateway.control_ui.device_auth_disabled",
		severity: "critical",
		title: "DANGEROUS: Control UI device auth disabled",
		detail: "gateway.controlUi.dangerouslyDisableDeviceAuth=true disables device identity checks for the Control UI.",
		remediation: "Disable it unless you are in a short-lived break-glass scenario."
	});
	const token = typeof auth.token === "string" && auth.token.trim().length > 0 ? auth.token.trim() : null;
	if (auth.mode === "token" && token && token.length < 24) findings.push({
		checkId: "gateway.token_too_short",
		severity: "warn",
		title: "Gateway token looks short",
		detail: `gateway auth token is ${token.length} chars; prefer a long random token.`
	});
	const chatCompletionsEnabled = cfg.gateway?.http?.endpoints?.chatCompletions?.enabled === true;
	const responsesEnabled = cfg.gateway?.http?.endpoints?.responses?.enabled === true;
	if (chatCompletionsEnabled || responsesEnabled) {
		const enabledEndpoints = [chatCompletionsEnabled ? "/v1/chat/completions" : null, responsesEnabled ? "/v1/responses" : null].filter((value) => Boolean(value));
		findings.push({
			checkId: "gateway.http.session_key_override_enabled",
			severity: remotelyExposed ? "warn" : "info",
			title: "HTTP APIs accept explicit session key override headers",
			detail: `${enabledEndpoints.join(", ")} support x-openclaw-session-key. Any authenticated caller can route requests into arbitrary sessions.`,
			remediation: "Treat HTTP API credentials as full-trust, disable unused endpoints, and avoid sharing tokens across tenants."
		});
	}
	if (bind !== "loopback" && !cfg.gateway?.auth?.rateLimit) findings.push({
		checkId: "gateway.auth_no_rate_limit",
		severity: "warn",
		title: "No auth rate limiting configured",
		detail: "gateway.bind is not loopback but no gateway.auth.rateLimit is configured. Without rate limiting, brute-force auth attacks are not mitigated.",
		remediation: "Set gateway.auth.rateLimit (e.g. { maxAttempts: 10, windowMs: 60000, lockoutMs: 300000 })."
	});
	return findings;
}
function collectBrowserControlFindings(cfg, env) {
	const findings = [];
	let resolved;
	try {
		resolved = resolveBrowserConfig(cfg.browser, cfg);
	} catch (err) {
		findings.push({
			checkId: "browser.control_invalid_config",
			severity: "warn",
			title: "Browser control config looks invalid",
			detail: String(err),
			remediation: `Fix browser.cdpUrl in ${resolveConfigPath()} and re-run "${formatCliCommand("openclaw security audit --deep")}".`
		});
		return findings;
	}
	if (!resolved.enabled) return findings;
	const browserAuth = resolveBrowserControlAuth(cfg, env);
	if (!browserAuth.token && !browserAuth.password) findings.push({
		checkId: "browser.control_no_auth",
		severity: "critical",
		title: "Browser control has no auth",
		detail: "Browser control HTTP routes are enabled but no gateway.auth token/password is configured. Any local process (or SSRF to loopback) can call browser control endpoints.",
		remediation: "Set gateway.auth.token (recommended) or gateway.auth.password so browser control HTTP routes require authentication. Restarting the gateway will auto-generate gateway.auth.token when browser control is enabled."
	});
	for (const name of Object.keys(resolved.profiles)) {
		const profile = resolveProfile(resolved, name);
		if (!profile || profile.cdpIsLoopback) continue;
		let url;
		try {
			url = new URL(profile.cdpUrl);
		} catch {
			continue;
		}
		if (url.protocol === "http:") findings.push({
			checkId: "browser.remote_cdp_http",
			severity: "warn",
			title: "Remote CDP uses HTTP",
			detail: `browser profile "${name}" uses http CDP (${profile.cdpUrl}); this is OK only if it's tailnet-only or behind an encrypted tunnel.`,
			remediation: `Prefer HTTPS/TLS or a tailnet-only endpoint for remote CDP.`
		});
	}
	return findings;
}
function collectLoggingFindings(cfg) {
	if (cfg.logging?.redactSensitive !== "off") return [];
	return [{
		checkId: "logging.redact_off",
		severity: "warn",
		title: "Tool summary redaction is disabled",
		detail: `logging.redactSensitive="off" can leak secrets into logs and status output.`,
		remediation: `Set logging.redactSensitive="tools".`
	}];
}
function collectElevatedFindings(cfg) {
	const findings = [];
	const enabled = cfg.tools?.elevated?.enabled;
	const allowFrom = cfg.tools?.elevated?.allowFrom ?? {};
	const anyAllowFromKeys = Object.keys(allowFrom).length > 0;
	if (enabled === false) return findings;
	if (!anyAllowFromKeys) return findings;
	for (const [provider, list] of Object.entries(allowFrom)) {
		const normalized = normalizeAllowFromList(list);
		if (normalized.includes("*")) findings.push({
			checkId: `tools.elevated.allowFrom.${provider}.wildcard`,
			severity: "critical",
			title: "Elevated exec allowlist contains wildcard",
			detail: `tools.elevated.allowFrom.${provider} includes "*" which effectively approves everyone on that channel for elevated mode.`
		});
		else if (normalized.length > 25) findings.push({
			checkId: `tools.elevated.allowFrom.${provider}.large`,
			severity: "warn",
			title: "Elevated exec allowlist is large",
			detail: `tools.elevated.allowFrom.${provider} has ${normalized.length} entries; consider tightening elevated access.`
		});
	}
	return findings;
}
async function maybeProbeGateway(params) {
	const url = buildGatewayConnectionDetails({ config: params.cfg }).url;
	const isRemoteMode = params.cfg.gateway?.mode === "remote";
	const remoteUrlRaw = typeof params.cfg.gateway?.remote?.url === "string" ? params.cfg.gateway.remote.url.trim() : "";
	const remoteUrlMissing = isRemoteMode && !remoteUrlRaw;
	const resolveAuth = (mode) => {
		const authToken = params.cfg.gateway?.auth?.token;
		const authPassword = params.cfg.gateway?.auth?.password;
		const remote = params.cfg.gateway?.remote;
		return {
			token: mode === "remote" ? typeof remote?.token === "string" && remote.token.trim() ? remote.token.trim() : void 0 : process.env.OPENCLAW_GATEWAY_TOKEN?.trim() || (typeof authToken === "string" && authToken.trim() ? authToken.trim() : void 0),
			password: process.env.OPENCLAW_GATEWAY_PASSWORD?.trim() || (mode === "remote" ? typeof remote?.password === "string" && remote.password.trim() ? remote.password.trim() : void 0 : typeof authPassword === "string" && authPassword.trim() ? authPassword.trim() : void 0)
		};
	};
	const auth = !isRemoteMode || remoteUrlMissing ? resolveAuth("local") : resolveAuth("remote");
	const res = await params.probe({
		url,
		auth,
		timeoutMs: params.timeoutMs
	}).catch((err) => ({
		ok: false,
		url,
		connectLatencyMs: null,
		error: String(err),
		close: null,
		health: null,
		status: null,
		presence: null,
		configSnapshot: null
	}));
	return { gateway: {
		attempted: true,
		url,
		ok: res.ok,
		error: res.ok ? null : res.error,
		close: res.close ? {
			code: res.close.code,
			reason: res.close.reason
		} : null
	} };
}
async function runSecurityAudit(opts) {
	const findings = [];
	const cfg = opts.config;
	const env = opts.env ?? process.env;
	const platform = opts.platform ?? process.platform;
	const execIcacls = opts.execIcacls;
	const stateDir = opts.stateDir ?? resolveStateDir(env);
	const configPath = opts.configPath ?? resolveConfigPath(env, stateDir);
	findings.push(...collectAttackSurfaceSummaryFindings(cfg));
	findings.push(...collectSyncedFolderFindings({
		stateDir,
		configPath
	}));
	findings.push(...collectGatewayConfigFindings(cfg, env));
	findings.push(...collectBrowserControlFindings(cfg, env));
	findings.push(...collectLoggingFindings(cfg));
	findings.push(...collectElevatedFindings(cfg));
	findings.push(...collectHooksHardeningFindings(cfg));
	findings.push(...collectSandboxDockerNoopFindings(cfg));
	findings.push(...collectNodeDenyCommandPatternFindings(cfg));
	findings.push(...collectMinimalProfileOverrideFindings(cfg));
	findings.push(...collectSecretsInConfigFindings(cfg));
	findings.push(...collectModelHygieneFindings(cfg));
	findings.push(...collectSmallModelRiskFindings({
		cfg,
		env
	}));
	findings.push(...collectExposureMatrixFindings(cfg));
	const configSnapshot = opts.includeFilesystem !== false ? await readConfigSnapshotForAudit({
		env,
		configPath
	}).catch(() => null) : null;
	if (opts.includeFilesystem !== false) {
		findings.push(...await collectFilesystemFindings({
			stateDir,
			configPath,
			env,
			platform,
			execIcacls
		}));
		if (configSnapshot) findings.push(...await collectIncludeFilePermFindings({
			configSnapshot,
			env,
			platform,
			execIcacls
		}));
		findings.push(...await collectStateDeepFilesystemFindings({
			cfg,
			env,
			stateDir,
			platform,
			execIcacls
		}));
		findings.push(...await collectPluginsTrustFindings({
			cfg,
			stateDir
		}));
		if (opts.deep === true) {
			findings.push(...await collectPluginsCodeSafetyFindings({ stateDir }));
			findings.push(...await collectInstalledSkillsCodeSafetyFindings({
				cfg,
				stateDir
			}));
		}
	}
	if (opts.includeChannelSecurity !== false) {
		const plugins = opts.plugins ?? listChannelPlugins();
		findings.push(...await collectChannelSecurityFindings({
			cfg,
			plugins
		}));
	}
	const deep = opts.deep === true ? await maybeProbeGateway({
		cfg,
		timeoutMs: Math.max(250, opts.deepTimeoutMs ?? 5e3),
		probe: opts.probeGatewayFn ?? probeGateway
	}) : void 0;
	if (deep?.gateway?.attempted && !deep.gateway.ok) findings.push({
		checkId: "gateway.probe_failed",
		severity: "warn",
		title: "Gateway probe failed (deep)",
		detail: deep.gateway.error ?? "gateway unreachable",
		remediation: `Run "${formatCliCommand("openclaw status --all")}" to debug connectivity/auth, then re-run "${formatCliCommand("openclaw security audit --deep")}".`
	});
	const summary = countBySeverity(findings);
	return {
		ts: Date.now(),
		summary,
		findings,
		deep
	};
}

//#endregion
export { resolveNodeCommandAllowlist as a, isNodeCommandAllowed as i, createIcaclsResetCommand as n, probeGateway as o, formatIcaclsResetCommand as r, runSecurityAudit as t };