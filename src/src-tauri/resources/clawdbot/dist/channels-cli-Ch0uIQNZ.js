import "./paths-DVBShlw6.js";
import { B as theme, O as danger, P as setVerbose, U as getResolvedLoggerSettings, _ as DEFAULT_CHAT_CHANNEL, u as defaultRuntime } from "./subsystem-QRNIBE7-.js";
import { f as isRecord } from "./utils-CrauP1IK.js";
import "./pi-embedded-helpers-BMGOFUCT.js";
import { bt as loadProviderUsageSummary, xt as formatUsageReportLines } from "./reply-BNEkWD6b.js";
import { c as normalizeAccountId, t as DEFAULT_ACCOUNT_ID } from "./session-key-BWxPj0z_.js";
import "./exec-BDyx_yxc.js";
import { c as resolveDefaultAgentId, s as resolveAgentWorkspaceDir } from "./agent-scope-DMGrQp5u.js";
import { wt as loadAuthProfileStore } from "./model-selection-D37iyQY4.js";
import "./github-copilot-token-CiF5Iyi2.js";
import { t as formatCliCommand } from "./command-format-ChfKqObn.js";
import "./boolean-BgXe2hyu.js";
import "./env-BSjH4KuP.js";
import { i as loadConfig, l as writeConfigFile, o as readConfigFileSnapshot } from "./config-CWifpzL_.js";
import "./manifest-registry-DFR7U7LS.js";
import { n as listChannelPlugins, r as normalizeChannelId, t as getChannelPlugin } from "./plugins-CLo5nH74.js";
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
import { i as createSlackWebClient } from "./send-CUpDmT_F.js";
import { H as parseDiscordTarget, lt as fetchChannelPermissionsDiscord } from "./send-C8AhSqO8.js";
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
import { n as callGateway } from "./call-i9290XP8.js";
import { n as formatTimeAgo } from "./format-relative-Bc_rVyZs.js";
import "./channel-activity-Ds_g7OEt.js";
import "./tables-1llcV3qs.js";
import "./send-oaAcLlhT.js";
import { t as formatDocsLink } from "./links-DKVbBuQN.js";
import { n as runCommandWithRuntime } from "./cli-utils-Gpj8Z_ye.js";
import { n as withProgress } from "./progress-DitCFjx_.js";
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
import { n as resolveMessageChannelSelection } from "./channel-selection-BN6_hiIf.js";
import "./delivery-queue-46I6nBfA.js";
import { t as resolveChannelDefaultAccountId } from "./helpers-28CRTwys.js";
import "./note-B5hvEaG5.js";
import { t as createClackPrompter } from "./clack-prompter-BUK2BneN.js";
import { i as reloadOnboardingPluginRegistry, n as setupChannels, r as ensureOnboardingPluginInstalled } from "./onboard-channels-0nZkyjjM.js";
import { i as listChannelPluginCatalogEntries } from "./plugin-auto-enable-B_v9wM6g.js";
import "./archive-3RxGtdg9.js";
import "./skill-scanner-BDTjIBGW.js";
import "./installs-NHf37wyZ.js";
import { i as hasExplicitOptions, t as formatCliChannelOptions } from "./channel-options-D1f5Nf8U.js";
import { t as collectChannelStatusIssues } from "./channels-status-issues-Cuirza--.js";
import { t as buildChannelAccountSnapshot } from "./status-3LCCYMbr.js";
import { t as parseLogLine } from "./parse-log-line-BivTbzsK.js";
import fsPromises from "node:fs/promises";

//#region src/commands/channels/add-mutators.ts
function applyAccountName(params) {
	const accountId = normalizeAccountId(params.accountId);
	const apply = getChannelPlugin(params.channel)?.setup?.applyAccountName;
	return apply ? apply({
		cfg: params.cfg,
		accountId,
		name: params.name
	}) : params.cfg;
}
function applyChannelAccountConfig(params) {
	const accountId = normalizeAccountId(params.accountId);
	const apply = getChannelPlugin(params.channel)?.setup?.applyAccountConfig;
	if (!apply) return params.cfg;
	const input = {
		name: params.name,
		token: params.token,
		tokenFile: params.tokenFile,
		botToken: params.botToken,
		appToken: params.appToken,
		signalNumber: params.signalNumber,
		cliPath: params.cliPath,
		dbPath: params.dbPath,
		service: params.service,
		region: params.region,
		authDir: params.authDir,
		httpUrl: params.httpUrl,
		httpHost: params.httpHost,
		httpPort: params.httpPort,
		webhookPath: params.webhookPath,
		webhookUrl: params.webhookUrl,
		audienceType: params.audienceType,
		audience: params.audience,
		useEnv: params.useEnv,
		homeserver: params.homeserver,
		userId: params.userId,
		accessToken: params.accessToken,
		password: params.password,
		deviceName: params.deviceName,
		initialSyncLimit: params.initialSyncLimit,
		ship: params.ship,
		url: params.url,
		code: params.code,
		groupChannels: params.groupChannels,
		dmAllowlist: params.dmAllowlist,
		autoDiscoverChannels: params.autoDiscoverChannels
	};
	return apply({
		cfg: params.cfg,
		accountId,
		input
	});
}

//#endregion
//#region src/commands/channels/shared.ts
async function requireValidConfig(runtime = defaultRuntime) {
	const snapshot = await readConfigFileSnapshot();
	if (snapshot.exists && !snapshot.valid) {
		const issues = snapshot.issues.length > 0 ? snapshot.issues.map((issue) => `- ${issue.path}: ${issue.message}`).join("\n") : "Unknown validation issue.";
		runtime.error(`Config invalid:\n${issues}`);
		runtime.error(`Fix the config or run ${formatCliCommand("openclaw doctor")}.`);
		runtime.exit(1);
		return null;
	}
	return snapshot.config;
}
function formatAccountLabel(params) {
	const base = params.accountId || DEFAULT_ACCOUNT_ID;
	if (params.name?.trim()) return `${base} (${params.name.trim()})`;
	return base;
}
const channelLabel = (channel) => {
	return getChannelPlugin(channel)?.meta.label ?? channel;
};
function formatChannelAccountLabel(params) {
	const channelText = channelLabel(params.channel);
	const accountText = formatAccountLabel({
		accountId: params.accountId,
		name: params.name
	});
	return `${params.channelStyle ? params.channelStyle(channelText) : channelText} ${params.accountStyle ? params.accountStyle(accountText) : accountText}`;
}
function shouldUseWizard(params) {
	return params?.hasFlags === false;
}

//#endregion
//#region src/commands/channels/add.ts
function parseList(value) {
	if (!value?.trim()) return;
	const parsed = value.split(/[\n,;]+/g).map((entry) => entry.trim()).filter(Boolean);
	return parsed.length > 0 ? parsed : void 0;
}
function resolveCatalogChannelEntry(raw, cfg) {
	const trimmed = raw.trim().toLowerCase();
	if (!trimmed) return;
	return listChannelPluginCatalogEntries({ workspaceDir: cfg ? resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg)) : void 0 }).find((entry) => {
		if (entry.id.toLowerCase() === trimmed) return true;
		return (entry.meta.aliases ?? []).some((alias) => alias.trim().toLowerCase() === trimmed);
	});
}
async function channelsAddCommand(opts, runtime = defaultRuntime, params) {
	const cfg = await requireValidConfig(runtime);
	if (!cfg) return;
	let nextConfig = cfg;
	if (shouldUseWizard(params)) {
		const prompter = createClackPrompter();
		let selection = [];
		const accountIds = {};
		await prompter.intro("Channel setup");
		let nextConfig = await setupChannels(cfg, runtime, prompter, {
			allowDisable: false,
			allowSignalInstall: true,
			promptAccountIds: true,
			onSelection: (value) => {
				selection = value;
			},
			onAccountId: (channel, accountId) => {
				accountIds[channel] = accountId;
			}
		});
		if (selection.length === 0) {
			await prompter.outro("No channels selected.");
			return;
		}
		if (await prompter.confirm({
			message: "Add display names for these accounts? (optional)",
			initialValue: false
		})) for (const channel of selection) {
			const accountId = accountIds[channel] ?? DEFAULT_ACCOUNT_ID;
			const plugin = getChannelPlugin(channel);
			const account = plugin?.config.resolveAccount(nextConfig, accountId);
			const existingName = (plugin?.config.describeAccount?.(account, nextConfig))?.name ?? account?.name;
			const name = await prompter.text({
				message: `${channel} account name (${accountId})`,
				initialValue: existingName
			});
			if (name?.trim()) nextConfig = applyAccountName({
				cfg: nextConfig,
				channel,
				accountId,
				name
			});
		}
		await writeConfigFile(nextConfig);
		await prompter.outro("Channels updated.");
		return;
	}
	const rawChannel = String(opts.channel ?? "");
	let channel = normalizeChannelId(rawChannel);
	let catalogEntry = channel ? void 0 : resolveCatalogChannelEntry(rawChannel, nextConfig);
	if (!channel && catalogEntry) {
		const prompter = createClackPrompter();
		const workspaceDir = resolveAgentWorkspaceDir(nextConfig, resolveDefaultAgentId(nextConfig));
		const result = await ensureOnboardingPluginInstalled({
			cfg: nextConfig,
			entry: catalogEntry,
			prompter,
			runtime,
			workspaceDir
		});
		nextConfig = result.cfg;
		if (!result.installed) return;
		reloadOnboardingPluginRegistry({
			cfg: nextConfig,
			runtime,
			workspaceDir
		});
		channel = normalizeChannelId(catalogEntry.id) ?? catalogEntry.id;
	}
	if (!channel) {
		const hint = catalogEntry ? `Plugin ${catalogEntry.meta.label} could not be loaded after install.` : `Unknown channel: ${String(opts.channel ?? "")}`;
		runtime.error(hint);
		runtime.exit(1);
		return;
	}
	const plugin = getChannelPlugin(channel);
	if (!plugin?.setup?.applyAccountConfig) {
		runtime.error(`Channel ${channel} does not support add.`);
		runtime.exit(1);
		return;
	}
	const accountId = plugin.setup.resolveAccountId?.({
		cfg: nextConfig,
		accountId: opts.account
	}) ?? normalizeAccountId(opts.account);
	const useEnv = opts.useEnv === true;
	const initialSyncLimit = typeof opts.initialSyncLimit === "number" ? opts.initialSyncLimit : typeof opts.initialSyncLimit === "string" && opts.initialSyncLimit.trim() ? Number.parseInt(opts.initialSyncLimit, 10) : void 0;
	const groupChannels = parseList(opts.groupChannels);
	const dmAllowlist = parseList(opts.dmAllowlist);
	const validationError = plugin.setup.validateInput?.({
		cfg: nextConfig,
		accountId,
		input: {
			name: opts.name,
			token: opts.token,
			tokenFile: opts.tokenFile,
			botToken: opts.botToken,
			appToken: opts.appToken,
			signalNumber: opts.signalNumber,
			cliPath: opts.cliPath,
			dbPath: opts.dbPath,
			service: opts.service,
			region: opts.region,
			authDir: opts.authDir,
			httpUrl: opts.httpUrl,
			httpHost: opts.httpHost,
			httpPort: opts.httpPort,
			webhookPath: opts.webhookPath,
			webhookUrl: opts.webhookUrl,
			audienceType: opts.audienceType,
			audience: opts.audience,
			homeserver: opts.homeserver,
			userId: opts.userId,
			accessToken: opts.accessToken,
			password: opts.password,
			deviceName: opts.deviceName,
			initialSyncLimit,
			useEnv,
			ship: opts.ship,
			url: opts.url,
			code: opts.code,
			groupChannels,
			dmAllowlist,
			autoDiscoverChannels: opts.autoDiscoverChannels
		}
	});
	if (validationError) {
		runtime.error(validationError);
		runtime.exit(1);
		return;
	}
	nextConfig = applyChannelAccountConfig({
		cfg: nextConfig,
		channel,
		accountId,
		name: opts.name,
		token: opts.token,
		tokenFile: opts.tokenFile,
		botToken: opts.botToken,
		appToken: opts.appToken,
		signalNumber: opts.signalNumber,
		cliPath: opts.cliPath,
		dbPath: opts.dbPath,
		service: opts.service,
		region: opts.region,
		authDir: opts.authDir,
		httpUrl: opts.httpUrl,
		httpHost: opts.httpHost,
		httpPort: opts.httpPort,
		webhookPath: opts.webhookPath,
		webhookUrl: opts.webhookUrl,
		audienceType: opts.audienceType,
		audience: opts.audience,
		homeserver: opts.homeserver,
		userId: opts.userId,
		accessToken: opts.accessToken,
		password: opts.password,
		deviceName: opts.deviceName,
		initialSyncLimit,
		useEnv,
		ship: opts.ship,
		url: opts.url,
		code: opts.code,
		groupChannels,
		dmAllowlist,
		autoDiscoverChannels: opts.autoDiscoverChannels
	});
	await writeConfigFile(nextConfig);
	runtime.log(`Added ${channelLabel(channel)} account "${accountId}".`);
}

//#endregion
//#region src/slack/scopes.ts
function collectScopes(value, into) {
	if (!value) return;
	if (Array.isArray(value)) {
		for (const entry of value) if (typeof entry === "string" && entry.trim()) into.push(entry.trim());
		return;
	}
	if (typeof value === "string") {
		const raw = value.trim();
		if (!raw) return;
		const parts = raw.split(/[,\s]+/).map((part) => part.trim());
		for (const part of parts) if (part) into.push(part);
		return;
	}
	if (!isRecord(value)) return;
	for (const entry of Object.values(value)) if (Array.isArray(entry) || typeof entry === "string") collectScopes(entry, into);
}
function normalizeScopes(scopes) {
	return Array.from(new Set(scopes.map((scope) => scope.trim()).filter(Boolean))).toSorted();
}
function extractScopes(payload) {
	if (!isRecord(payload)) return [];
	const scopes = [];
	collectScopes(payload.scopes, scopes);
	collectScopes(payload.scope, scopes);
	if (isRecord(payload.info)) {
		collectScopes(payload.info.scopes, scopes);
		collectScopes(payload.info.scope, scopes);
		collectScopes(payload.info.user_scopes, scopes);
		collectScopes(payload.info.bot_scopes, scopes);
	}
	return normalizeScopes(scopes);
}
function readError(payload) {
	if (!isRecord(payload)) return;
	const error = payload.error;
	return typeof error === "string" && error.trim() ? error.trim() : void 0;
}
async function callSlack(client, method) {
	try {
		const result = await client.apiCall(method);
		return isRecord(result) ? result : null;
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : String(err)
		};
	}
}
async function fetchSlackScopes(token, timeoutMs) {
	const client = createSlackWebClient(token, { timeout: timeoutMs });
	const attempts = ["auth.scopes", "apps.permissions.info"];
	const errors = [];
	for (const method of attempts) {
		const result = await callSlack(client, method);
		const scopes = extractScopes(result);
		if (scopes.length > 0) return {
			ok: true,
			scopes,
			source: method
		};
		const error = readError(result);
		if (error) errors.push(`${method}: ${error}`);
	}
	return {
		ok: false,
		error: errors.length > 0 ? errors.join(" | ") : "no scopes returned"
	};
}

//#endregion
//#region src/commands/channels/capabilities.ts
const REQUIRED_DISCORD_PERMISSIONS = ["ViewChannel", "SendMessages"];
const TEAMS_GRAPH_PERMISSION_HINTS = {
	"ChannelMessage.Read.All": "channel history",
	"Chat.Read.All": "chat history",
	"Channel.ReadBasic.All": "channel list",
	"Team.ReadBasic.All": "team list",
	"TeamsActivity.Read.All": "teams activity",
	"Sites.Read.All": "files (SharePoint)",
	"Files.Read.All": "files (OneDrive)"
};
function normalizeTimeout(raw, fallback = 1e4) {
	const value = typeof raw === "string" ? Number(raw) : Number(raw);
	if (!Number.isFinite(value) || value <= 0) return fallback;
	return value;
}
function formatSupport(capabilities) {
	if (!capabilities) return "unknown";
	const bits = [];
	if (capabilities.chatTypes?.length) bits.push(`chatTypes=${capabilities.chatTypes.join(",")}`);
	if (capabilities.polls) bits.push("polls");
	if (capabilities.reactions) bits.push("reactions");
	if (capabilities.edit) bits.push("edit");
	if (capabilities.unsend) bits.push("unsend");
	if (capabilities.reply) bits.push("reply");
	if (capabilities.effects) bits.push("effects");
	if (capabilities.groupManagement) bits.push("groupManagement");
	if (capabilities.threads) bits.push("threads");
	if (capabilities.media) bits.push("media");
	if (capabilities.nativeCommands) bits.push("nativeCommands");
	if (capabilities.blockStreaming) bits.push("blockStreaming");
	return bits.length ? bits.join(" ") : "none";
}
function summarizeDiscordTarget(raw) {
	if (!raw) return;
	const target = parseDiscordTarget(raw, { defaultKind: "channel" });
	if (!target) return { raw };
	if (target.kind === "channel") return {
		raw,
		normalized: target.normalized,
		kind: "channel",
		channelId: target.id
	};
	if (target.kind === "user") return {
		raw,
		normalized: target.normalized,
		kind: "user"
	};
	return {
		raw,
		normalized: target.normalized
	};
}
function formatDiscordIntents(intents) {
	if (!intents) return "unknown";
	return [
		`messageContent=${intents.messageContent ?? "unknown"}`,
		`guildMembers=${intents.guildMembers ?? "unknown"}`,
		`presence=${intents.presence ?? "unknown"}`
	].join(" ");
}
function formatProbeLines(channelId, probe) {
	const lines = [];
	if (!probe || typeof probe !== "object") return lines;
	const probeObj = probe;
	if (channelId === "discord") {
		const bot = probeObj.bot;
		if (bot?.username) {
			const botId = bot.id ? ` (${bot.id})` : "";
			lines.push(`Bot: ${theme.accent(`@${bot.username}`)}${botId}`);
		}
		const app = probeObj.application;
		if (app?.intents) lines.push(`Intents: ${formatDiscordIntents(app.intents)}`);
	}
	if (channelId === "telegram") {
		const bot = probeObj.bot;
		if (bot?.username) {
			const botId = bot.id ? ` (${bot.id})` : "";
			lines.push(`Bot: ${theme.accent(`@${bot.username}`)}${botId}`);
		}
		const flags = [];
		const canJoinGroups = bot?.canJoinGroups;
		const canReadAll = bot?.canReadAllGroupMessages;
		const inlineQueries = bot?.supportsInlineQueries;
		if (typeof canJoinGroups === "boolean") flags.push(`joinGroups=${canJoinGroups}`);
		if (typeof canReadAll === "boolean") flags.push(`readAllGroupMessages=${canReadAll}`);
		if (typeof inlineQueries === "boolean") flags.push(`inlineQueries=${inlineQueries}`);
		if (flags.length > 0) lines.push(`Flags: ${flags.join(" ")}`);
		const webhook = probeObj.webhook;
		if (webhook?.url !== void 0) lines.push(`Webhook: ${webhook.url || "none"}`);
	}
	if (channelId === "slack") {
		const bot = probeObj.bot;
		const team = probeObj.team;
		if (bot?.name) lines.push(`Bot: ${theme.accent(`@${bot.name}`)}`);
		if (team?.name || team?.id) {
			const id = team?.id ? ` (${team.id})` : "";
			lines.push(`Team: ${team?.name ?? "unknown"}${id}`);
		}
	}
	if (channelId === "signal") {
		const version = probeObj.version;
		if (version) lines.push(`Signal daemon: ${version}`);
	}
	if (channelId === "msteams") {
		const appId = typeof probeObj.appId === "string" ? probeObj.appId.trim() : "";
		if (appId) lines.push(`App: ${theme.accent(appId)}`);
		const graph = probeObj.graph;
		if (graph) {
			const roles = Array.isArray(graph.roles) ? graph.roles.map((role) => String(role).trim()).filter(Boolean) : [];
			const scopes = typeof graph.scopes === "string" ? graph.scopes.split(/\s+/).map((scope) => scope.trim()).filter(Boolean) : Array.isArray(graph.scopes) ? graph.scopes.map((scope) => String(scope).trim()).filter(Boolean) : [];
			if (graph.ok === false) lines.push(`Graph: ${theme.error(graph.error ?? "failed")}`);
			else if (roles.length > 0 || scopes.length > 0) {
				const formatPermission = (permission) => {
					const hint = TEAMS_GRAPH_PERMISSION_HINTS[permission];
					return hint ? `${permission} (${hint})` : permission;
				};
				if (roles.length > 0) lines.push(`Graph roles: ${roles.map(formatPermission).join(", ")}`);
				if (scopes.length > 0) lines.push(`Graph scopes: ${scopes.map(formatPermission).join(", ")}`);
			} else if (graph.ok === true) lines.push("Graph: ok");
		}
	}
	const ok = typeof probeObj.ok === "boolean" ? probeObj.ok : void 0;
	if (ok === true && lines.length === 0) lines.push("Probe: ok");
	if (ok === false) {
		const error = typeof probeObj.error === "string" && probeObj.error ? ` (${probeObj.error})` : "";
		lines.push(`Probe: ${theme.error(`failed${error}`)}`);
	}
	return lines;
}
async function buildDiscordPermissions(params) {
	const target = summarizeDiscordTarget(params.target?.trim());
	if (!target) return {};
	if (target.kind !== "channel" || !target.channelId) return {
		target,
		report: { error: "Target looks like a DM user; pass channel:<id> to audit channel permissions." }
	};
	const token = params.account.token?.trim();
	if (!token) return {
		target,
		report: {
			channelId: target.channelId,
			error: "Discord bot token missing for permission audit."
		}
	};
	try {
		const perms = await fetchChannelPermissionsDiscord(target.channelId, {
			token,
			accountId: params.account.accountId ?? void 0
		});
		const missing = REQUIRED_DISCORD_PERMISSIONS.filter((permission) => !perms.permissions.includes(permission));
		return {
			target,
			report: {
				channelId: perms.channelId,
				guildId: perms.guildId,
				isDm: perms.isDm,
				channelType: perms.channelType,
				permissions: perms.permissions,
				missingRequired: missing.length ? missing : [],
				raw: perms.raw
			}
		};
	} catch (err) {
		return {
			target,
			report: {
				channelId: target.channelId,
				error: err instanceof Error ? err.message : String(err)
			}
		};
	}
}
async function resolveChannelReports(params) {
	const { plugin, cfg, timeoutMs } = params;
	const accountIds = params.accountOverride ? [params.accountOverride] : (() => {
		const ids = plugin.config.listAccountIds(cfg);
		return ids.length > 0 ? ids : [resolveChannelDefaultAccountId({
			plugin,
			cfg,
			accountIds: ids
		})];
	})();
	const reports = [];
	const listedActions = plugin.actions?.listActions?.({ cfg }) ?? [];
	const actions = Array.from(new Set([
		"send",
		"broadcast",
		...listedActions.map((action) => String(action))
	]));
	for (const accountId of accountIds) {
		const resolvedAccount = plugin.config.resolveAccount(cfg, accountId);
		const configured = plugin.config.isConfigured ? await plugin.config.isConfigured(resolvedAccount, cfg) : Boolean(resolvedAccount);
		const enabled = plugin.config.isEnabled ? plugin.config.isEnabled(resolvedAccount, cfg) : resolvedAccount.enabled !== false;
		let probe;
		if (configured && enabled && plugin.status?.probeAccount) try {
			probe = await plugin.status.probeAccount({
				account: resolvedAccount,
				timeoutMs,
				cfg
			});
		} catch (err) {
			probe = {
				ok: false,
				error: err instanceof Error ? err.message : String(err)
			};
		}
		let slackScopes;
		if (plugin.id === "slack" && configured && enabled) {
			const botToken = resolvedAccount.botToken?.trim();
			const userToken = resolvedAccount.config?.userToken?.trim();
			const scopeReports = [];
			if (botToken) scopeReports.push({
				tokenType: "bot",
				result: await fetchSlackScopes(botToken, timeoutMs)
			});
			else scopeReports.push({
				tokenType: "bot",
				result: {
					ok: false,
					error: "Slack bot token missing."
				}
			});
			if (userToken) scopeReports.push({
				tokenType: "user",
				result: await fetchSlackScopes(userToken, timeoutMs)
			});
			slackScopes = scopeReports;
		}
		let discordTarget;
		let discordPermissions;
		if (plugin.id === "discord" && params.target) {
			const perms = await buildDiscordPermissions({
				account: resolvedAccount,
				target: params.target
			});
			discordTarget = perms.target;
			discordPermissions = perms.report;
		}
		reports.push({
			channel: plugin.id,
			accountId,
			accountName: typeof resolvedAccount.name === "string" ? resolvedAccount.name?.trim() || void 0 : void 0,
			configured,
			enabled,
			support: plugin.capabilities,
			probe,
			target: discordTarget,
			channelPermissions: discordPermissions,
			actions,
			slackScopes
		});
	}
	return reports;
}
async function channelsCapabilitiesCommand(opts, runtime = defaultRuntime) {
	const cfg = await requireValidConfig(runtime);
	if (!cfg) return;
	const timeoutMs = normalizeTimeout(opts.timeout, 1e4);
	const rawChannel = typeof opts.channel === "string" ? opts.channel.trim().toLowerCase() : "";
	const rawTarget = typeof opts.target === "string" ? opts.target.trim() : "";
	if (opts.account && (!rawChannel || rawChannel === "all")) {
		runtime.error(danger("--account requires a specific --channel."));
		runtime.exit(1);
		return;
	}
	if (rawTarget && rawChannel !== "discord") {
		runtime.error(danger("--target requires --channel discord."));
		runtime.exit(1);
		return;
	}
	const plugins = listChannelPlugins();
	const selected = !rawChannel || rawChannel === "all" ? plugins : (() => {
		const plugin = getChannelPlugin(rawChannel);
		if (!plugin) return null;
		return [plugin];
	})();
	if (!selected || selected.length === 0) {
		runtime.error(danger(`Unknown channel "${rawChannel}".`));
		runtime.exit(1);
		return;
	}
	const reports = [];
	for (const plugin of selected) {
		const accountOverride = opts.account?.trim() || void 0;
		reports.push(...await resolveChannelReports({
			plugin,
			cfg,
			timeoutMs,
			accountOverride,
			target: rawTarget && plugin.id === "discord" ? rawTarget : void 0
		}));
	}
	if (opts.json) {
		runtime.log(JSON.stringify({ channels: reports }, null, 2));
		return;
	}
	const lines = [];
	for (const report of reports) {
		const label = formatChannelAccountLabel({
			channel: report.channel,
			accountId: report.accountId,
			name: report.accountName,
			channelStyle: theme.accent,
			accountStyle: theme.heading
		});
		lines.push(theme.heading(label));
		lines.push(`Support: ${formatSupport(report.support)}`);
		if (report.actions && report.actions.length > 0) lines.push(`Actions: ${report.actions.join(", ")}`);
		if (report.configured === false || report.enabled === false) {
			const configuredLabel = report.configured === false ? "not configured" : "configured";
			const enabledLabel = report.enabled === false ? "disabled" : "enabled";
			lines.push(`Status: ${configuredLabel}, ${enabledLabel}`);
		}
		const probeLines = formatProbeLines(report.channel, report.probe);
		if (probeLines.length > 0) lines.push(...probeLines);
		else if (report.configured && report.enabled) lines.push(theme.muted("Probe: unavailable"));
		if (report.channel === "slack" && report.slackScopes) for (const entry of report.slackScopes) {
			const source = entry.result.source ? ` (${entry.result.source})` : "";
			const label = entry.tokenType === "user" ? "User scopes" : "Bot scopes";
			if (entry.result.ok && entry.result.scopes?.length) lines.push(`${label}${source}: ${entry.result.scopes.join(", ")}`);
			else if (entry.result.error) lines.push(`${label}: ${theme.error(entry.result.error)}`);
		}
		if (report.channel === "discord" && report.channelPermissions) {
			const perms = report.channelPermissions;
			if (perms.error) lines.push(`Permissions: ${theme.error(perms.error)}`);
			else {
				const list = perms.permissions?.length ? perms.permissions.join(", ") : "none";
				const label = perms.channelId ? ` (${perms.channelId})` : "";
				lines.push(`Permissions${label}: ${list}`);
				if (perms.missingRequired && perms.missingRequired.length > 0) lines.push(`${theme.warn("Missing required:")} ${perms.missingRequired.join(", ")}`);
				else lines.push(theme.success("Missing required: none"));
			}
		} else if (report.channel === "discord" && rawTarget && !report.channelPermissions) lines.push(theme.muted("Permissions: skipped (no target)."));
		lines.push("");
	}
	runtime.log(lines.join("\n").trimEnd());
}

//#endregion
//#region src/commands/channels/list.ts
const colorValue = (value) => {
	if (value === "none") return theme.error(value);
	if (value === "env") return theme.accent(value);
	return theme.success(value);
};
function formatEnabled(value) {
	return value === false ? theme.error("disabled") : theme.success("enabled");
}
function formatConfigured(value) {
	return value ? theme.success("configured") : theme.warn("not configured");
}
function formatTokenSource(source) {
	return `token=${colorValue(source || "none")}`;
}
function formatSource(label, source) {
	return `${label}=${colorValue(source || "none")}`;
}
function formatLinked(value) {
	return value ? theme.success("linked") : theme.warn("not linked");
}
function shouldShowConfigured(channel) {
	return channel.meta.showConfigured !== false;
}
function formatAccountLine(params) {
	const { channel, snapshot } = params;
	const label = formatChannelAccountLabel({
		channel: channel.id,
		accountId: snapshot.accountId,
		name: snapshot.name,
		channelStyle: theme.accent,
		accountStyle: theme.heading
	});
	const bits = [];
	if (snapshot.linked !== void 0) bits.push(formatLinked(snapshot.linked));
	if (shouldShowConfigured(channel) && typeof snapshot.configured === "boolean") bits.push(formatConfigured(snapshot.configured));
	if (snapshot.tokenSource) bits.push(formatTokenSource(snapshot.tokenSource));
	if (snapshot.botTokenSource) bits.push(formatSource("bot", snapshot.botTokenSource));
	if (snapshot.appTokenSource) bits.push(formatSource("app", snapshot.appTokenSource));
	if (snapshot.baseUrl) bits.push(`base=${theme.muted(snapshot.baseUrl)}`);
	if (typeof snapshot.enabled === "boolean") bits.push(formatEnabled(snapshot.enabled));
	return `- ${label}: ${bits.join(", ")}`;
}
async function loadUsageWithProgress(runtime) {
	try {
		return await withProgress({
			label: "Fetching usage snapshot…",
			indeterminate: true,
			enabled: true
		}, async () => await loadProviderUsageSummary());
	} catch (err) {
		runtime.error(String(err));
		return null;
	}
}
async function channelsListCommand(opts, runtime = defaultRuntime) {
	const cfg = await requireValidConfig(runtime);
	if (!cfg) return;
	const includeUsage = opts.usage !== false;
	const plugins = listChannelPlugins();
	const authStore = loadAuthProfileStore();
	const authProfiles = Object.entries(authStore.profiles).map(([profileId, profile]) => ({
		id: profileId,
		provider: profile.provider,
		type: profile.type,
		isExternal: false
	}));
	if (opts.json) {
		const usage = includeUsage ? await loadProviderUsageSummary() : void 0;
		const chat = {};
		for (const plugin of plugins) chat[plugin.id] = plugin.config.listAccountIds(cfg);
		const payload = {
			chat,
			auth: authProfiles,
			...usage ? { usage } : {}
		};
		runtime.log(JSON.stringify(payload, null, 2));
		return;
	}
	const lines = [];
	lines.push(theme.heading("Chat channels:"));
	for (const plugin of plugins) {
		const accounts = plugin.config.listAccountIds(cfg);
		if (!accounts || accounts.length === 0) continue;
		for (const accountId of accounts) {
			const snapshot = await buildChannelAccountSnapshot({
				plugin,
				cfg,
				accountId
			});
			lines.push(formatAccountLine({
				channel: plugin,
				snapshot
			}));
		}
	}
	lines.push("");
	lines.push(theme.heading("Auth providers (OAuth + API keys):"));
	if (authProfiles.length === 0) lines.push(theme.muted("- none"));
	else for (const profile of authProfiles) {
		const external = profile.isExternal ? theme.muted(" (synced)") : "";
		lines.push(`- ${theme.accent(profile.id)} (${theme.success(profile.type)}${external})`);
	}
	runtime.log(lines.join("\n"));
	if (includeUsage) {
		runtime.log("");
		const usage = await loadUsageWithProgress(runtime);
		if (usage) {
			const usageLines = formatUsageReportLines(usage);
			if (usageLines.length > 0) {
				usageLines[0] = theme.accent(usageLines[0]);
				runtime.log(usageLines.join("\n"));
			}
		}
	}
	runtime.log("");
	runtime.log(`Docs: ${formatDocsLink("/gateway/configuration", "gateway/configuration")}`);
}

//#endregion
//#region src/commands/channels/logs.ts
const DEFAULT_LIMIT = 200;
const MAX_BYTES = 1e6;
const getChannelSet = () => new Set([...listChannelPlugins().map((plugin) => plugin.id), "all"]);
function parseChannelFilter(raw) {
	const trimmed = raw?.trim().toLowerCase();
	if (!trimmed) return "all";
	return getChannelSet().has(trimmed) ? trimmed : "all";
}
function matchesChannel(line, channel) {
	if (channel === "all") return true;
	const needle = `gateway/channels/${channel}`;
	if (line.subsystem?.includes(needle)) return true;
	if (line.module?.includes(channel)) return true;
	return false;
}
async function readTailLines(file, limit) {
	const stat = await fsPromises.stat(file).catch(() => null);
	if (!stat) return [];
	const size = stat.size;
	const start = Math.max(0, size - MAX_BYTES);
	const handle = await fsPromises.open(file, "r");
	try {
		const length = Math.max(0, size - start);
		if (length === 0) return [];
		const buffer = Buffer.alloc(length);
		const readResult = await handle.read(buffer, 0, length, start);
		let lines = buffer.toString("utf8", 0, readResult.bytesRead).split("\n");
		if (start > 0) lines = lines.slice(1);
		if (lines.length && lines[lines.length - 1] === "") lines = lines.slice(0, -1);
		if (lines.length > limit) lines = lines.slice(lines.length - limit);
		return lines;
	} finally {
		await handle.close();
	}
}
async function channelsLogsCommand(opts, runtime = defaultRuntime) {
	const channel = parseChannelFilter(opts.channel);
	const limitRaw = typeof opts.lines === "string" ? Number(opts.lines) : opts.lines;
	const limit = typeof limitRaw === "number" && Number.isFinite(limitRaw) && limitRaw > 0 ? Math.floor(limitRaw) : DEFAULT_LIMIT;
	const file = getResolvedLoggerSettings().file;
	const filtered = (await readTailLines(file, limit * 4)).map(parseLogLine).filter((line) => Boolean(line)).filter((line) => matchesChannel(line, channel));
	const lines = filtered.slice(Math.max(0, filtered.length - limit));
	if (opts.json) {
		runtime.log(JSON.stringify({
			file,
			channel,
			lines
		}, null, 2));
		return;
	}
	runtime.log(theme.info(`Log file: ${file}`));
	if (channel !== "all") runtime.log(theme.info(`Channel: ${channel}`));
	if (lines.length === 0) {
		runtime.log(theme.muted("No matching log lines."));
		return;
	}
	for (const line of lines) {
		const ts = line.time ? `${line.time} ` : "";
		const level = line.level ? `${line.level.toLowerCase()} ` : "";
		runtime.log(`${ts}${level}${line.message}`.trim());
	}
}

//#endregion
//#region src/commands/channels/remove.ts
function listAccountIds(cfg, channel) {
	const plugin = getChannelPlugin(channel);
	if (!plugin) return [];
	return plugin.config.listAccountIds(cfg);
}
async function channelsRemoveCommand(opts, runtime = defaultRuntime, params) {
	const cfg = await requireValidConfig(runtime);
	if (!cfg) return;
	const useWizard = shouldUseWizard(params);
	const prompter = useWizard ? createClackPrompter() : null;
	let channel = normalizeChannelId(opts.channel);
	let accountId = normalizeAccountId(opts.account);
	const deleteConfig = Boolean(opts.delete);
	if (useWizard && prompter) {
		await prompter.intro("Remove channel account");
		const selectedChannel = await prompter.select({
			message: "Channel",
			options: listChannelPlugins().map((plugin) => ({
				value: plugin.id,
				label: plugin.meta.label
			}))
		});
		channel = selectedChannel;
		accountId = await (async () => {
			const ids = listAccountIds(cfg, selectedChannel);
			return normalizeAccountId(await prompter.select({
				message: "Account",
				options: ids.map((id) => ({
					value: id,
					label: id === DEFAULT_ACCOUNT_ID ? "default (primary)" : id
				})),
				initialValue: ids[0] ?? DEFAULT_ACCOUNT_ID
			}));
		})();
		if (!await prompter.confirm({
			message: `Disable ${channelLabel(selectedChannel)} account "${accountId}"? (keeps config)`,
			initialValue: true
		})) {
			await prompter.outro("Cancelled.");
			return;
		}
	} else {
		if (!channel) {
			runtime.error("Channel is required. Use --channel <name>.");
			runtime.exit(1);
			return;
		}
		if (!deleteConfig) {
			if (!await createClackPrompter().confirm({
				message: `Disable ${channelLabel(channel)} account "${accountId}"? (keeps config)`,
				initialValue: true
			})) return;
		}
	}
	const plugin = getChannelPlugin(channel);
	if (!plugin) {
		runtime.error(`Unknown channel: ${channel}`);
		runtime.exit(1);
		return;
	}
	const resolvedAccountId = normalizeAccountId(accountId) ?? resolveChannelDefaultAccountId({
		plugin,
		cfg
	});
	const accountKey = resolvedAccountId || DEFAULT_ACCOUNT_ID;
	let next = { ...cfg };
	if (deleteConfig) {
		if (!plugin.config.deleteAccount) {
			runtime.error(`Channel ${channel} does not support delete.`);
			runtime.exit(1);
			return;
		}
		next = plugin.config.deleteAccount({
			cfg: next,
			accountId: resolvedAccountId
		});
	} else {
		if (!plugin.config.setAccountEnabled) {
			runtime.error(`Channel ${channel} does not support disable.`);
			runtime.exit(1);
			return;
		}
		next = plugin.config.setAccountEnabled({
			cfg: next,
			accountId: resolvedAccountId,
			enabled: false
		});
	}
	await writeConfigFile(next);
	if (useWizard && prompter) await prompter.outro(deleteConfig ? `Deleted ${channelLabel(channel)} account "${accountKey}".` : `Disabled ${channelLabel(channel)} account "${accountKey}".`);
	else runtime.log(deleteConfig ? `Deleted ${channelLabel(channel)} account "${accountKey}".` : `Disabled ${channelLabel(channel)} account "${accountKey}".`);
}

//#endregion
//#region src/commands/channels/resolve.ts
function resolvePreferredKind(kind) {
	if (!kind || kind === "auto") return;
	if (kind === "user") return "user";
	return "group";
}
function detectAutoKind(input) {
	const trimmed = input.trim();
	if (!trimmed) return "group";
	if (trimmed.startsWith("@")) return "user";
	if (/^<@!?/.test(trimmed)) return "user";
	if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "user";
	if (/^(user|discord|slack|matrix|msteams|teams|zalo|zalouser|googlechat|google-chat|gchat):/i.test(trimmed)) return "user";
	return "group";
}
function formatResolveResult(result) {
	if (!result.resolved || !result.id) return `${result.input} -> unresolved`;
	const name = result.name ? ` (${result.name})` : "";
	const note = result.note ? ` [${result.note}]` : "";
	return `${result.input} -> ${result.id}${name}${note}`;
}
async function channelsResolveCommand(opts, runtime) {
	const cfg = loadConfig();
	const entries = (opts.entries ?? []).map((entry) => entry.trim()).filter(Boolean);
	if (entries.length === 0) throw new Error("At least one entry is required.");
	const selection = await resolveMessageChannelSelection({
		cfg,
		channel: opts.channel ?? null
	});
	const plugin = getChannelPlugin(selection.channel);
	if (!plugin?.resolver?.resolveTargets) throw new Error(`Channel ${selection.channel} does not support resolve.`);
	const preferredKind = resolvePreferredKind(opts.kind);
	let results = [];
	if (preferredKind) results = (await plugin.resolver.resolveTargets({
		cfg,
		accountId: opts.account ?? null,
		inputs: entries,
		kind: preferredKind,
		runtime
	})).map((entry) => ({
		input: entry.input,
		resolved: entry.resolved,
		id: entry.id,
		name: entry.name,
		note: entry.note
	}));
	else {
		const byKind = /* @__PURE__ */ new Map();
		for (const entry of entries) {
			const kind = detectAutoKind(entry);
			byKind.set(kind, [...byKind.get(kind) ?? [], entry]);
		}
		const resolved = [];
		for (const [kind, inputs] of byKind.entries()) {
			const batch = await plugin.resolver.resolveTargets({
				cfg,
				accountId: opts.account ?? null,
				inputs,
				kind,
				runtime
			});
			resolved.push(...batch);
		}
		const byInput = new Map(resolved.map((entry) => [entry.input, entry]));
		results = entries.map((input) => {
			const entry = byInput.get(input);
			return {
				input,
				resolved: entry?.resolved ?? false,
				id: entry?.id,
				name: entry?.name,
				note: entry?.note
			};
		});
	}
	if (opts.json) {
		runtime.log(JSON.stringify(results, null, 2));
		return;
	}
	for (const result of results) if (result.resolved && result.id) runtime.log(formatResolveResult(result));
	else runtime.error(danger(`${result.input} -> unresolved${result.error ? ` (${result.error})` : result.note ? ` (${result.note})` : ""}`));
}

//#endregion
//#region src/commands/channels/status.ts
function formatGatewayChannelsStatusLines(payload) {
	const lines = [];
	lines.push(theme.success("Gateway reachable."));
	const accountLines = (provider, accounts) => accounts.map((account) => {
		const bits = [];
		if (typeof account.enabled === "boolean") bits.push(account.enabled ? "enabled" : "disabled");
		if (typeof account.configured === "boolean") bits.push(account.configured ? "configured" : "not configured");
		if (typeof account.linked === "boolean") bits.push(account.linked ? "linked" : "not linked");
		if (typeof account.running === "boolean") bits.push(account.running ? "running" : "stopped");
		if (typeof account.connected === "boolean") bits.push(account.connected ? "connected" : "disconnected");
		const inboundAt = typeof account.lastInboundAt === "number" && Number.isFinite(account.lastInboundAt) ? account.lastInboundAt : null;
		const outboundAt = typeof account.lastOutboundAt === "number" && Number.isFinite(account.lastOutboundAt) ? account.lastOutboundAt : null;
		if (inboundAt) bits.push(`in:${formatTimeAgo(Date.now() - inboundAt)}`);
		if (outboundAt) bits.push(`out:${formatTimeAgo(Date.now() - outboundAt)}`);
		if (typeof account.mode === "string" && account.mode.length > 0) bits.push(`mode:${account.mode}`);
		const botUsername = (() => {
			const bot = account.bot;
			const probeBot = account.probe?.bot;
			const raw = bot?.username ?? probeBot?.username ?? "";
			if (typeof raw !== "string") return "";
			const trimmed = raw.trim();
			if (!trimmed) return "";
			return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
		})();
		if (botUsername) bits.push(`bot:${botUsername}`);
		if (typeof account.dmPolicy === "string" && account.dmPolicy.length > 0) bits.push(`dm:${account.dmPolicy}`);
		if (Array.isArray(account.allowFrom) && account.allowFrom.length > 0) bits.push(`allow:${account.allowFrom.slice(0, 2).join(",")}`);
		if (typeof account.tokenSource === "string" && account.tokenSource) bits.push(`token:${account.tokenSource}`);
		if (typeof account.botTokenSource === "string" && account.botTokenSource) bits.push(`bot:${account.botTokenSource}`);
		if (typeof account.appTokenSource === "string" && account.appTokenSource) bits.push(`app:${account.appTokenSource}`);
		const messageContent = account.application?.intents?.messageContent;
		if (typeof messageContent === "string" && messageContent.length > 0 && messageContent !== "enabled") bits.push(`intents:content=${messageContent}`);
		if (account.allowUnmentionedGroups === true) bits.push("groups:unmentioned");
		if (typeof account.baseUrl === "string" && account.baseUrl) bits.push(`url:${account.baseUrl}`);
		const probe = account.probe;
		if (probe && typeof probe.ok === "boolean") bits.push(probe.ok ? "works" : "probe failed");
		const audit = account.audit;
		if (audit && typeof audit.ok === "boolean") bits.push(audit.ok ? "audit ok" : "audit failed");
		if (typeof account.lastError === "string" && account.lastError) bits.push(`error:${account.lastError}`);
		return `- ${formatChannelAccountLabel({
			channel: provider,
			accountId: typeof account.accountId === "string" ? account.accountId : "default",
			name: (typeof account.name === "string" ? account.name.trim() : "") || void 0
		})}: ${bits.join(", ")}`;
	});
	const plugins = listChannelPlugins();
	const accountsByChannel = payload.channelAccounts;
	const accountPayloads = {};
	for (const plugin of plugins) {
		const raw = accountsByChannel?.[plugin.id];
		if (Array.isArray(raw)) accountPayloads[plugin.id] = raw;
	}
	for (const plugin of plugins) {
		const accounts = accountPayloads[plugin.id];
		if (accounts && accounts.length > 0) lines.push(...accountLines(plugin.id, accounts));
	}
	lines.push("");
	const issues = collectChannelStatusIssues(payload);
	if (issues.length > 0) {
		lines.push(theme.warn("Warnings:"));
		for (const issue of issues) lines.push(`- ${issue.channel} ${issue.accountId}: ${issue.message}${issue.fix ? ` (${issue.fix})` : ""}`);
		lines.push(`- Run: ${formatCliCommand("openclaw doctor")}`);
		lines.push("");
	}
	lines.push(`Tip: ${formatDocsLink("/cli#status", "status --deep")} adds gateway health probes to status output (requires a reachable gateway).`);
	return lines;
}
async function formatConfigChannelsStatusLines(cfg, meta) {
	const lines = [];
	lines.push(theme.warn("Gateway not reachable; showing config-only status."));
	if (meta.path) lines.push(`Config: ${meta.path}`);
	if (meta.mode) lines.push(`Mode: ${meta.mode}`);
	if (meta.path || meta.mode) lines.push("");
	const accountLines = (provider, accounts) => accounts.map((account) => {
		const bits = [];
		if (typeof account.enabled === "boolean") bits.push(account.enabled ? "enabled" : "disabled");
		if (typeof account.configured === "boolean") bits.push(account.configured ? "configured" : "not configured");
		if (typeof account.linked === "boolean") bits.push(account.linked ? "linked" : "not linked");
		if (typeof account.mode === "string" && account.mode.length > 0) bits.push(`mode:${account.mode}`);
		if (typeof account.tokenSource === "string" && account.tokenSource) bits.push(`token:${account.tokenSource}`);
		if (typeof account.botTokenSource === "string" && account.botTokenSource) bits.push(`bot:${account.botTokenSource}`);
		if (typeof account.appTokenSource === "string" && account.appTokenSource) bits.push(`app:${account.appTokenSource}`);
		if (typeof account.baseUrl === "string" && account.baseUrl) bits.push(`url:${account.baseUrl}`);
		return `- ${formatChannelAccountLabel({
			channel: provider,
			accountId: typeof account.accountId === "string" ? account.accountId : "default",
			name: (typeof account.name === "string" ? account.name.trim() : "") || void 0
		})}: ${bits.join(", ")}`;
	});
	const plugins = listChannelPlugins();
	for (const plugin of plugins) {
		const accountIds = plugin.config.listAccountIds(cfg);
		if (!accountIds.length) continue;
		const snapshots = [];
		for (const accountId of accountIds) {
			const snapshot = await buildChannelAccountSnapshot({
				plugin,
				cfg,
				accountId
			});
			snapshots.push(snapshot);
		}
		if (snapshots.length > 0) lines.push(...accountLines(plugin.id, snapshots));
	}
	lines.push("");
	lines.push(`Tip: ${formatDocsLink("/cli#status", "status --deep")} adds gateway health probes to status output (requires a reachable gateway).`);
	return lines;
}
async function channelsStatusCommand(opts, runtime = defaultRuntime) {
	const timeoutMs = Number(opts.timeout ?? 1e4);
	const statusLabel = opts.probe ? "Checking channel status (probe)…" : "Checking channel status…";
	if (opts.json !== true && !process.stderr.isTTY) runtime.log(statusLabel);
	try {
		const payload = await withProgress({
			label: statusLabel,
			indeterminate: true,
			enabled: opts.json !== true
		}, async () => await callGateway({
			method: "channels.status",
			params: {
				probe: Boolean(opts.probe),
				timeoutMs
			},
			timeoutMs
		}));
		if (opts.json) {
			runtime.log(JSON.stringify(payload, null, 2));
			return;
		}
		runtime.log(formatGatewayChannelsStatusLines(payload).join("\n"));
	} catch (err) {
		runtime.error(`Gateway not reachable: ${String(err)}`);
		const cfg = await requireValidConfig(runtime);
		if (!cfg) return;
		const snapshot = await readConfigFileSnapshot();
		const mode = cfg.gateway?.mode === "remote" ? "remote" : "local";
		runtime.log((await formatConfigChannelsStatusLines(cfg, {
			path: snapshot.path,
			mode
		})).join("\n"));
	}
}

//#endregion
//#region src/cli/channel-auth.ts
async function runChannelLogin(opts, runtime = defaultRuntime) {
	const channelInput = opts.channel ?? DEFAULT_CHAT_CHANNEL;
	const channelId = normalizeChannelId(channelInput);
	if (!channelId) throw new Error(`Unsupported channel: ${channelInput}`);
	const plugin = getChannelPlugin(channelId);
	if (!plugin?.auth?.login) throw new Error(`Channel ${channelId} does not support login`);
	setVerbose(Boolean(opts.verbose));
	const cfg = loadConfig();
	const accountId = opts.account?.trim() || resolveChannelDefaultAccountId({
		plugin,
		cfg
	});
	await plugin.auth.login({
		cfg,
		accountId,
		runtime,
		verbose: Boolean(opts.verbose),
		channelInput
	});
}
async function runChannelLogout(opts, runtime = defaultRuntime) {
	const channelInput = opts.channel ?? DEFAULT_CHAT_CHANNEL;
	const channelId = normalizeChannelId(channelInput);
	if (!channelId) throw new Error(`Unsupported channel: ${channelInput}`);
	const plugin = getChannelPlugin(channelId);
	if (!plugin?.gateway?.logoutAccount) throw new Error(`Channel ${channelId} does not support logout`);
	const cfg = loadConfig();
	const accountId = opts.account?.trim() || resolveChannelDefaultAccountId({
		plugin,
		cfg
	});
	const account = plugin.config.resolveAccount(cfg, accountId);
	await plugin.gateway.logoutAccount({
		cfg,
		accountId,
		account,
		runtime
	});
}

//#endregion
//#region src/cli/channels-cli.ts
const optionNamesAdd = [
	"channel",
	"account",
	"name",
	"token",
	"tokenFile",
	"botToken",
	"appToken",
	"signalNumber",
	"cliPath",
	"dbPath",
	"service",
	"region",
	"authDir",
	"httpUrl",
	"httpHost",
	"httpPort",
	"webhookPath",
	"webhookUrl",
	"audienceType",
	"audience",
	"useEnv",
	"homeserver",
	"userId",
	"accessToken",
	"password",
	"deviceName",
	"initialSyncLimit",
	"ship",
	"url",
	"code",
	"groupChannels",
	"dmAllowlist",
	"autoDiscoverChannels"
];
const optionNamesRemove = [
	"channel",
	"account",
	"delete"
];
function runChannelsCommand(action) {
	return runCommandWithRuntime(defaultRuntime, action);
}
function runChannelsCommandWithDanger(action, label) {
	return runCommandWithRuntime(defaultRuntime, action, (err) => {
		defaultRuntime.error(danger(`${label}: ${String(err)}`));
		defaultRuntime.exit(1);
	});
}
function registerChannelsCli(program) {
	const channelNames = formatCliChannelOptions();
	const channels = program.command("channels").description("Manage chat channel accounts").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/channels", "docs.openclaw.ai/cli/channels")}\n`);
	channels.command("list").description("List configured channels + auth profiles").option("--no-usage", "Skip model provider usage/quota snapshots").option("--json", "Output JSON", false).action(async (opts) => {
		await runChannelsCommand(async () => {
			await channelsListCommand(opts, defaultRuntime);
		});
	});
	channels.command("status").description("Show gateway channel status (use status --deep for local)").option("--probe", "Probe channel credentials", false).option("--timeout <ms>", "Timeout in ms", "10000").option("--json", "Output JSON", false).action(async (opts) => {
		await runChannelsCommand(async () => {
			await channelsStatusCommand(opts, defaultRuntime);
		});
	});
	channels.command("capabilities").description("Show provider capabilities (intents/scopes + supported features)").option("--channel <name>", `Channel (${formatCliChannelOptions(["all"])})`).option("--account <id>", "Account id (only with --channel)").option("--target <dest>", "Channel target for permission audit (Discord channel:<id>)").option("--timeout <ms>", "Timeout in ms", "10000").option("--json", "Output JSON", false).action(async (opts) => {
		await runChannelsCommand(async () => {
			await channelsCapabilitiesCommand(opts, defaultRuntime);
		});
	});
	channels.command("resolve").description("Resolve channel/user names to IDs").argument("<entries...>", "Entries to resolve (names or ids)").option("--channel <name>", `Channel (${channelNames})`).option("--account <id>", "Account id (accountId)").option("--kind <kind>", "Target kind (auto|user|group)", "auto").option("--json", "Output JSON", false).action(async (entries, opts) => {
		await runChannelsCommand(async () => {
			await channelsResolveCommand({
				channel: opts.channel,
				account: opts.account,
				kind: opts.kind,
				json: Boolean(opts.json),
				entries: Array.isArray(entries) ? entries : [String(entries)]
			}, defaultRuntime);
		});
	});
	channels.command("logs").description("Show recent channel logs from the gateway log file").option("--channel <name>", `Channel (${formatCliChannelOptions(["all"])})`, "all").option("--lines <n>", "Number of lines (default: 200)", "200").option("--json", "Output JSON", false).action(async (opts) => {
		await runChannelsCommand(async () => {
			await channelsLogsCommand(opts, defaultRuntime);
		});
	});
	channels.command("add").description("Add or update a channel account").option("--channel <name>", `Channel (${channelNames})`).option("--account <id>", "Account id (default when omitted)").option("--name <name>", "Display name for this account").option("--token <token>", "Bot token (Telegram/Discord)").option("--token-file <path>", "Bot token file (Telegram)").option("--bot-token <token>", "Slack bot token (xoxb-...)").option("--app-token <token>", "Slack app token (xapp-...)").option("--signal-number <e164>", "Signal account number (E.164)").option("--cli-path <path>", "CLI path (signal-cli or imsg)").option("--db-path <path>", "iMessage database path").option("--service <service>", "iMessage service (imessage|sms|auto)").option("--region <region>", "iMessage region (for SMS)").option("--auth-dir <path>", "WhatsApp auth directory override").option("--http-url <url>", "Signal HTTP daemon base URL").option("--http-host <host>", "Signal HTTP host").option("--http-port <port>", "Signal HTTP port").option("--webhook-path <path>", "Webhook path (Google Chat/BlueBubbles)").option("--webhook-url <url>", "Google Chat webhook URL").option("--audience-type <type>", "Google Chat audience type (app-url|project-number)").option("--audience <value>", "Google Chat audience value (app URL or project number)").option("--homeserver <url>", "Matrix homeserver URL").option("--user-id <id>", "Matrix user ID").option("--access-token <token>", "Matrix access token").option("--password <password>", "Matrix password").option("--device-name <name>", "Matrix device name").option("--initial-sync-limit <n>", "Matrix initial sync limit").option("--ship <ship>", "Tlon ship name (~sampel-palnet)").option("--url <url>", "Tlon ship URL").option("--code <code>", "Tlon login code").option("--group-channels <list>", "Tlon group channels (comma-separated)").option("--dm-allowlist <list>", "Tlon DM allowlist (comma-separated ships)").option("--auto-discover-channels", "Tlon auto-discover group channels").option("--no-auto-discover-channels", "Disable Tlon auto-discovery").option("--use-env", "Use env token (default account only)", false).action(async (opts, command) => {
		await runChannelsCommand(async () => {
			await channelsAddCommand(opts, defaultRuntime, { hasFlags: hasExplicitOptions(command, optionNamesAdd) });
		});
	});
	channels.command("remove").description("Disable or delete a channel account").option("--channel <name>", `Channel (${channelNames})`).option("--account <id>", "Account id (default when omitted)").option("--delete", "Delete config entries (no prompt)", false).action(async (opts, command) => {
		await runChannelsCommand(async () => {
			await channelsRemoveCommand(opts, defaultRuntime, { hasFlags: hasExplicitOptions(command, optionNamesRemove) });
		});
	});
	channels.command("login").description("Link a channel account (if supported)").option("--channel <channel>", "Channel alias (default: whatsapp)").option("--account <id>", "Account id (accountId)").option("--verbose", "Verbose connection logs", false).action(async (opts) => {
		await runChannelsCommandWithDanger(async () => {
			await runChannelLogin({
				channel: opts.channel,
				account: opts.account,
				verbose: Boolean(opts.verbose)
			}, defaultRuntime);
		}, "Channel login failed");
	});
	channels.command("logout").description("Log out of a channel session (if supported)").option("--channel <channel>", "Channel alias (default: whatsapp)").option("--account <id>", "Account id (accountId)").action(async (opts) => {
		await runChannelsCommandWithDanger(async () => {
			await runChannelLogout({
				channel: opts.channel,
				account: opts.account
			}, defaultRuntime);
		}, "Channel logout failed");
	});
}

//#endregion
export { registerChannelsCli };