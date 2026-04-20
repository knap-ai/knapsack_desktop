import { F as initApiConfig, K as sendGroupImageMessage, N as getAccessToken, R as sendC2CImageMessage, X as sendProactiveC2CMessage, Z as sendProactiveGroupMessage, a as recordMessageReply, c as sendMedia, d as sendText, f as sendVideoMsg, l as sendPhoto, lt as debugError, n as getMessageReplyConfig, o as sendCronMessage, p as sendVoice, r as getMessageReplyStats, s as sendDocument, t as checkMessageReplyLimit, u as sendProactiveMessage, ut as debugLog } from "./outbound-Nkg_Sn0w.js";
import { _ as listQQBotAccountIds, a as recordKnownUser, f as qqbotConfigAdapter, g as applyQQBotAccountConfig, h as DEFAULT_ACCOUNT_ID, i as listKnownUsers$1, m as qqbotSetupAdapterShared, n as flushKnownUsers, o as removeKnownUser$1, p as qqbotMeta, r as getKnownUser$1, s as getFrameworkCommands, t as clearKnownUsers$1, v as resolveDefaultQQBotAccountId, y as resolveQQBotAccount } from "./known-users-CX1XBPSa.js";
import { t as getQQBotRuntime } from "./runtime-B2Qn21pE.js";
import { formatErrorMessage } from "openclaw/plugin-sdk/error-runtime";
import { normalizeLowercaseStringOrEmpty, normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { buildSecretInputSchema } from "openclaw/plugin-sdk/secret-input";
import { AllowFromListSchema, buildChannelConfigSchema } from "openclaw/plugin-sdk/channel-config-schema";
import { z } from "zod";
import { createStandardChannelSetupStatus, hasConfiguredSecretInput as hasConfiguredSecretInput$1, setSetupChannelEnabled } from "openclaw/plugin-sdk/setup";
import { formatDocsLink } from "openclaw/plugin-sdk/setup-tools";
//#region extensions/qqbot/src/config-schema.ts
const AudioFormatPolicySchema = z.object({
	sttDirectFormats: z.array(z.string()).optional(),
	uploadDirectFormats: z.array(z.string()).optional(),
	transcodeEnabled: z.boolean().optional()
}).optional();
const QQBotSpeechQueryParamsSchema = z.record(z.string(), z.string()).optional();
const QQBotTtsSchema = z.object({
	enabled: z.boolean().optional(),
	provider: z.string().optional(),
	baseUrl: z.string().optional(),
	apiKey: z.string().optional(),
	model: z.string().optional(),
	voice: z.string().optional(),
	authStyle: z.enum(["bearer", "api-key"]).optional(),
	queryParams: QQBotSpeechQueryParamsSchema,
	speed: z.number().optional()
}).strict().optional();
const QQBotSttSchema = z.object({
	enabled: z.boolean().optional(),
	provider: z.string().optional(),
	baseUrl: z.string().optional(),
	apiKey: z.string().optional(),
	model: z.string().optional()
}).strict().optional();
const QQBotStreamingSchema = z.union([z.boolean(), z.object({ mode: z.enum(["off", "partial"]).default("partial") }).passthrough()]).optional();
const QQBotAccountSchema = z.object({
	enabled: z.boolean().optional(),
	name: z.string().optional(),
	appId: z.string().optional(),
	clientSecret: buildSecretInputSchema().optional(),
	clientSecretFile: z.string().optional(),
	allowFrom: AllowFromListSchema,
	systemPrompt: z.string().optional(),
	markdownSupport: z.boolean().optional(),
	voiceDirectUploadFormats: z.array(z.string()).optional(),
	audioFormatPolicy: AudioFormatPolicySchema,
	urlDirectUpload: z.boolean().optional(),
	upgradeUrl: z.string().optional(),
	upgradeMode: z.enum(["doc", "hot-reload"]).optional(),
	streaming: QQBotStreamingSchema
}).passthrough();
const qqbotChannelConfigSchema = buildChannelConfigSchema(QQBotAccountSchema.extend({
	tts: QQBotTtsSchema,
	stt: QQBotSttSchema,
	accounts: z.object({}).catchall(QQBotAccountSchema.passthrough()).optional(),
	defaultAccount: z.string().optional()
}).passthrough());
//#endregion
//#region extensions/qqbot/src/setup-surface.ts
const channel = "qqbot";
/**
* Clear only the credential fields owned by the setup prompt that switched to
* env-backed resolution. This preserves mixed-source setups such as config
* AppID + env AppSecret.
*/
function clearQQBotCredentialField(cfg, accountId, field) {
	const next = { ...cfg };
	const qqbot = { ...next.channels?.qqbot };
	const clearField = (entry) => {
		if (field === "appId") {
			delete entry.appId;
			return;
		}
		delete entry.clientSecret;
		delete entry.clientSecretFile;
	};
	if (accountId === "default") clearField(qqbot);
	else {
		const accounts = { ...qqbot.accounts };
		if (accounts[accountId]) {
			const entry = { ...accounts[accountId] };
			clearField(entry);
			accounts[accountId] = entry;
			qqbot.accounts = accounts;
		}
	}
	next.channels = {
		...next.channels,
		qqbot
	};
	return next;
}
const QQBOT_SETUP_HELP_LINES = [
	"To create a QQ Bot, visit the QQ Open Platform:",
	`  ${formatDocsLink("https://q.qq.com", "q.qq.com")}`,
	"",
	"1. Create an application and note the AppID.",
	"2. Go to development settings to find the AppSecret."
];
const qqbotSetupWizard = {
	channel,
	status: createStandardChannelSetupStatus({
		channelLabel: "QQ Bot",
		configuredLabel: "configured",
		unconfiguredLabel: "needs AppID + AppSecret",
		configuredHint: "configured",
		unconfiguredHint: "needs AppID + AppSecret",
		configuredScore: 1,
		unconfiguredScore: 6,
		resolveConfigured: ({ cfg, accountId }) => (accountId ? [accountId] : listQQBotAccountIds(cfg)).some((resolvedAccountId) => {
			const account = resolveQQBotAccount(cfg, resolvedAccountId, { allowUnresolvedSecretRef: true });
			return Boolean(account.appId && (Boolean(account.clientSecret) || hasConfiguredSecretInput$1(account.config.clientSecret) || Boolean(account.config.clientSecretFile?.trim())));
		})
	}),
	credentials: [{
		inputKey: "token",
		providerHint: channel,
		credentialLabel: "AppID",
		preferredEnvVar: "QQBOT_APP_ID",
		helpTitle: "QQ Bot AppID",
		helpLines: QQBOT_SETUP_HELP_LINES,
		envPrompt: "QQBOT_APP_ID detected. Use env var?",
		keepPrompt: "QQ Bot AppID already configured. Keep it?",
		inputPrompt: "Enter QQ Bot AppID",
		allowEnv: ({ accountId }) => accountId === DEFAULT_ACCOUNT_ID,
		inspect: ({ cfg, accountId }) => {
			const resolved = resolveQQBotAccount(cfg, accountId, { allowUnresolvedSecretRef: true });
			const hasConfiguredValue = Boolean(hasConfiguredSecretInput$1(resolved.config.clientSecret) || normalizeOptionalString(resolved.config.clientSecretFile) || resolved.clientSecret);
			return {
				accountConfigured: Boolean(resolved.appId && hasConfiguredValue),
				hasConfiguredValue: Boolean(resolved.appId),
				resolvedValue: resolved.appId || void 0,
				envValue: accountId === "default" ? normalizeOptionalString(process.env.QQBOT_APP_ID) : void 0
			};
		},
		applyUseEnv: ({ cfg, accountId }) => clearQQBotCredentialField(applyQQBotAccountConfig(cfg, accountId, {}), accountId, "appId"),
		applySet: ({ cfg, accountId, resolvedValue }) => applyQQBotAccountConfig(cfg, accountId, { appId: resolvedValue })
	}, {
		inputKey: "password",
		providerHint: "qqbot-secret",
		credentialLabel: "AppSecret",
		preferredEnvVar: "QQBOT_CLIENT_SECRET",
		helpTitle: "QQ Bot AppSecret",
		helpLines: QQBOT_SETUP_HELP_LINES,
		envPrompt: "QQBOT_CLIENT_SECRET detected. Use env var?",
		keepPrompt: "QQ Bot AppSecret already configured. Keep it?",
		inputPrompt: "Enter QQ Bot AppSecret",
		allowEnv: ({ accountId }) => accountId === DEFAULT_ACCOUNT_ID,
		inspect: ({ cfg, accountId }) => {
			const resolved = resolveQQBotAccount(cfg, accountId, { allowUnresolvedSecretRef: true });
			const hasConfiguredValue = Boolean(hasConfiguredSecretInput$1(resolved.config.clientSecret) || normalizeOptionalString(resolved.config.clientSecretFile) || resolved.clientSecret);
			return {
				accountConfigured: Boolean(resolved.appId && hasConfiguredValue),
				hasConfiguredValue,
				resolvedValue: resolved.clientSecret || void 0,
				envValue: accountId === "default" ? normalizeOptionalString(process.env.QQBOT_CLIENT_SECRET) : void 0
			};
		},
		applyUseEnv: ({ cfg, accountId }) => clearQQBotCredentialField(applyQQBotAccountConfig(cfg, accountId, {}), accountId, "clientSecret"),
		applySet: ({ cfg, accountId, resolvedValue }) => applyQQBotAccountConfig(cfg, accountId, { clientSecret: resolvedValue })
	}],
	disable: (cfg) => setSetupChannelEnabled(cfg, channel, false)
};
//#endregion
//#region extensions/qqbot/src/channel.ts
let _gatewayModulePromise;
function loadGatewayModule() {
	_gatewayModulePromise ??= import("./gateway-BZwNq797.js");
	return _gatewayModulePromise;
}
const qqbotPlugin = {
	id: "qqbot",
	setupWizard: qqbotSetupWizard,
	meta: { ...qqbotMeta },
	capabilities: {
		chatTypes: ["direct", "group"],
		media: true,
		reactions: false,
		threads: false,
		blockStreaming: true
	},
	reload: { configPrefixes: ["channels.qqbot"] },
	configSchema: qqbotChannelConfigSchema,
	config: { ...qqbotConfigAdapter },
	setup: { ...qqbotSetupAdapterShared },
	messaging: {
		normalizeTarget: (target) => {
			const id = target.replace(/^qqbot:/i, "");
			if (id.startsWith("c2c:") || id.startsWith("group:") || id.startsWith("channel:")) return `qqbot:${id}`;
			if (/^[0-9a-fA-F]{32}$/.test(id)) return `qqbot:c2c:${id}`;
			if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) return `qqbot:c2c:${id}`;
		},
		targetResolver: {
			looksLikeId: (id) => {
				if (/^qqbot:(c2c|group|channel):/i.test(id)) return true;
				if (/^(c2c|group|channel):/i.test(id)) return true;
				if (/^[0-9a-fA-F]{32}$/.test(id)) return true;
				return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
			},
			hint: "QQ Bot target format: qqbot:c2c:openid (direct) or qqbot:group:groupid (group)"
		}
	},
	outbound: {
		deliveryMode: "direct",
		chunker: (text, limit) => getQQBotRuntime().channel.text.chunkMarkdownText(text, limit),
		chunkerMode: "markdown",
		textChunkLimit: 5e3,
		sendText: async ({ to, text, accountId, replyToId, cfg }) => {
			const account = resolveQQBotAccount(cfg, accountId);
			const { sendText } = await import("./outbound-Nkg_Sn0w.js").then((n) => n.i);
			initApiConfig(account.appId, { markdownSupport: account.markdownSupport });
			const result = await sendText({
				to,
				text,
				accountId,
				replyToId,
				account
			});
			return {
				channel: "qqbot",
				messageId: result.messageId ?? "",
				meta: result.error ? { error: result.error } : void 0
			};
		},
		sendMedia: async ({ to, text, mediaUrl, accountId, replyToId, cfg }) => {
			const account = resolveQQBotAccount(cfg, accountId);
			const { sendMedia } = await import("./outbound-Nkg_Sn0w.js").then((n) => n.i);
			initApiConfig(account.appId, { markdownSupport: account.markdownSupport });
			const result = await sendMedia({
				to,
				text: text ?? "",
				mediaUrl: mediaUrl ?? "",
				accountId,
				replyToId,
				account
			});
			return {
				channel: "qqbot",
				messageId: result.messageId ?? "",
				meta: result.error ? { error: result.error } : void 0
			};
		}
	},
	gateway: {
		startAccount: async (ctx) => {
			const { account } = ctx;
			const { abortSignal, log, cfg } = ctx;
			const { startGateway } = await loadGatewayModule();
			log?.info(`[qqbot:${account.accountId}] Starting gateway — appId=${account.appId}, enabled=${account.enabled}, name=${account.name ?? "unnamed"}`);
			await startGateway({
				account,
				abortSignal,
				cfg,
				log,
				onReady: () => {
					log?.info(`[qqbot:${account.accountId}] Gateway ready`);
					ctx.setStatus({
						...ctx.getStatus(),
						running: true,
						connected: true,
						lastConnectedAt: Date.now()
					});
				},
				onError: (error) => {
					log?.error(`[qqbot:${account.accountId}] Gateway error: ${error.message}`);
					ctx.setStatus({
						...ctx.getStatus(),
						lastError: error.message
					});
				}
			});
		},
		logoutAccount: async ({ accountId, cfg }) => {
			const nextCfg = { ...cfg };
			const nextQQBot = cfg.channels?.qqbot ? { ...cfg.channels.qqbot } : void 0;
			let cleared = false;
			let changed = false;
			if (nextQQBot) {
				const qqbot = nextQQBot;
				if (accountId === "default") {
					if (qqbot.clientSecret) {
						delete qqbot.clientSecret;
						cleared = true;
						changed = true;
					}
					if (qqbot.clientSecretFile) {
						delete qqbot.clientSecretFile;
						cleared = true;
						changed = true;
					}
				}
				const accounts = qqbot.accounts;
				if (accounts && accountId in accounts) {
					const entry = accounts[accountId];
					if (entry && "clientSecret" in entry) {
						delete entry.clientSecret;
						cleared = true;
						changed = true;
					}
					if (entry && "clientSecretFile" in entry) {
						delete entry.clientSecretFile;
						cleared = true;
						changed = true;
					}
					if (entry && Object.keys(entry).length === 0) {
						delete accounts[accountId];
						changed = true;
					}
				}
			}
			if (changed && nextQQBot) {
				nextCfg.channels = {
					...nextCfg.channels,
					qqbot: nextQQBot
				};
				await getQQBotRuntime().config.writeConfigFile(nextCfg);
			}
			const loggedOut = resolveQQBotAccount(changed ? nextCfg : cfg, accountId).secretSource === "none";
			const envToken = Boolean(process.env.QQBOT_CLIENT_SECRET);
			return {
				ok: true,
				cleared,
				envToken,
				loggedOut
			};
		}
	},
	status: {
		defaultRuntime: {
			accountId: DEFAULT_ACCOUNT_ID,
			running: false,
			connected: false,
			lastConnectedAt: null,
			lastError: null,
			lastInboundAt: null,
			lastOutboundAt: null
		},
		buildChannelSummary: ({ snapshot }) => ({
			configured: snapshot.configured ?? false,
			tokenSource: snapshot.tokenSource ?? "none",
			running: snapshot.running ?? false,
			connected: snapshot.connected ?? false,
			lastConnectedAt: snapshot.lastConnectedAt ?? null,
			lastError: snapshot.lastError ?? null
		}),
		buildAccountSnapshot: ({ account, runtime }) => ({
			accountId: account?.accountId ?? "default",
			name: account?.name,
			enabled: account?.enabled ?? false,
			configured: Boolean(account?.appId && account?.clientSecret),
			tokenSource: account?.secretSource,
			running: runtime?.running ?? false,
			connected: runtime?.connected ?? false,
			lastConnectedAt: runtime?.lastConnectedAt ?? null,
			lastError: runtime?.lastError ?? null,
			lastInboundAt: runtime?.lastInboundAt ?? null,
			lastOutboundAt: runtime?.lastOutboundAt ?? null
		})
	}
};
//#endregion
//#region extensions/qqbot/src/channel.setup.ts
/**
* Setup-only QQBot plugin — lightweight subset used during `openclaw onboard`
* and `openclaw configure` without pulling the full runtime dependencies.
*/
const qqbotSetupPlugin = {
	id: "qqbot",
	setupWizard: qqbotSetupWizard,
	meta: { ...qqbotMeta },
	capabilities: {
		chatTypes: ["direct", "group"],
		media: true,
		reactions: false,
		threads: false,
		blockStreaming: true
	},
	reload: { configPrefixes: ["channels.qqbot"] },
	configSchema: qqbotChannelConfigSchema,
	config: { ...qqbotConfigAdapter },
	setup: { ...qqbotSetupAdapterShared }
};
//#endregion
//#region extensions/qqbot/src/tools/channel.ts
const API_BASE = "https://api.sgroup.qq.com";
const DEFAULT_TIMEOUT_MS = 3e4;
const ChannelApiSchema = {
	type: "object",
	properties: {
		method: {
			type: "string",
			description: "HTTP method. Allowed values: GET, POST, PUT, PATCH, DELETE.",
			enum: [
				"GET",
				"POST",
				"PUT",
				"PATCH",
				"DELETE"
			]
		},
		path: {
			type: "string",
			description: "API path without the host. Replace placeholders with concrete values. Examples: /users/@me/guilds, /guilds/{guild_id}/channels, /channels/{channel_id}."
		},
		body: {
			type: "object",
			description: "JSON request body for POST/PUT/PATCH requests. GET/DELETE usually do not need it."
		},
		query: {
			type: "object",
			description: "URL query parameters as key/value pairs appended to the path. For example, { \"limit\": \"100\", \"after\": \"0\" } becomes ?limit=100&after=0.",
			additionalProperties: { type: "string" }
		}
	},
	required: ["method", "path"]
};
function json$1(data) {
	return {
		content: [{
			type: "text",
			text: JSON.stringify(data, null, 2)
		}],
		details: data
	};
}
function buildUrl(path, query) {
	let url = `${API_BASE}${path}`;
	if (query && Object.keys(query).length > 0) {
		const params = new URLSearchParams();
		for (const [key, value] of Object.entries(query)) if (value !== void 0 && value !== null && value !== "") params.set(key, value);
		const qs = params.toString();
		if (qs) url += `?${qs}`;
	}
	return url;
}
function validatePath(path) {
	if (!path.startsWith("/")) return "path must start with /";
	if (path.includes("..") || path.includes("//")) return "path must not contain .. or //";
	if (!/^\/[a-zA-Z0-9\-._~:@!$&'()*+,;=/%]+$/.test(path) && path !== "/") return "path contains unsupported characters";
	return null;
}
/**
* Register the QQ channel API proxy tool.
*
* The tool acts as an authenticated HTTP proxy for the QQ Open Platform channel APIs.
* Agents learn endpoint details from the skill docs and send requests through this proxy.
*/
function registerChannelTool(api) {
	const cfg = api.config;
	if (!cfg) {
		debugLog("[qqbot-channel-api] No config available, skipping");
		return;
	}
	const accountIds = listQQBotAccountIds(cfg);
	if (accountIds.length === 0) {
		debugLog("[qqbot-channel-api] No QQBot accounts configured, skipping");
		return;
	}
	const firstAccountId = accountIds[0];
	const account = resolveQQBotAccount(cfg, firstAccountId);
	if (!account.appId || !account.clientSecret) {
		debugLog("[qqbot-channel-api] Account not fully configured, skipping");
		return;
	}
	api.registerTool({
		name: "qqbot_channel_api",
		label: "QQBot Channel API",
		description: "Authenticated HTTP proxy for QQ Open Platform channel APIs. Common endpoints: list guilds GET /users/@me/guilds | list channels GET /guilds/{guild_id}/channels | get channel GET /channels/{channel_id} | create channel POST /guilds/{guild_id}/channels | list members GET /guilds/{guild_id}/members?after=0&limit=100 | get member GET /guilds/{guild_id}/members/{user_id} | list threads GET /channels/{channel_id}/threads | create thread PUT /channels/{channel_id}/threads | create announce POST /guilds/{guild_id}/announces | create schedule POST /channels/{channel_id}/schedules. See the qqbot-channel skill for full endpoint details.",
		parameters: ChannelApiSchema,
		async execute(_toolCallId, params) {
			const p = params;
			if (!p.method) return json$1({ error: "method is required" });
			if (!p.path) return json$1({ error: "path is required" });
			const method = p.method.toUpperCase();
			if (![
				"GET",
				"POST",
				"PUT",
				"PATCH",
				"DELETE"
			].includes(method)) return json$1({ error: `Unsupported HTTP method: ${method}. Allowed values: GET, POST, PUT, PATCH, DELETE` });
			const pathError = validatePath(p.path);
			if (pathError) return json$1({ error: pathError });
			if ((method === "GET" || method === "DELETE") && p.body && Object.keys(p.body).length > 0) debugLog(`[qqbot-channel-api] ${method} request with body, body will be ignored`);
			try {
				const accessToken = await getAccessToken(account.appId, account.clientSecret);
				const url = buildUrl(p.path, p.query);
				const headers = {
					Authorization: `QQBot ${accessToken}`,
					"Content-Type": "application/json"
				};
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
				const fetchOptions = {
					method,
					headers,
					signal: controller.signal
				};
				if (p.body && [
					"POST",
					"PUT",
					"PATCH"
				].includes(method)) fetchOptions.body = JSON.stringify(p.body);
				debugLog(`[qqbot-channel-api] >>> ${method} ${url} (timeout: ${DEFAULT_TIMEOUT_MS}ms)`);
				let res;
				try {
					res = await fetch(url, fetchOptions);
				} catch (err) {
					clearTimeout(timeoutId);
					if (err instanceof Error && err.name === "AbortError") {
						debugError(`[qqbot-channel-api] <<< Request timeout after ${DEFAULT_TIMEOUT_MS}ms`);
						return json$1({
							error: `Request timed out after ${DEFAULT_TIMEOUT_MS}ms`,
							path: p.path
						});
					}
					debugError("[qqbot-channel-api] <<< Network error:", err);
					return json$1({
						error: `Network error: ${formatErrorMessage(err)}`,
						path: p.path
					});
				} finally {
					clearTimeout(timeoutId);
				}
				debugLog(`[qqbot-channel-api] <<< Status: ${res.status} ${res.statusText}`);
				const rawBody = await res.text();
				if (!rawBody || rawBody.trim() === "") {
					if (res.ok) return json$1({
						success: true,
						status: res.status,
						path: p.path
					});
					return json$1({
						error: `API returned ${res.status} ${res.statusText}`,
						status: res.status,
						path: p.path
					});
				}
				let parsed;
				try {
					parsed = JSON.parse(rawBody);
				} catch {
					parsed = rawBody;
				}
				if (!res.ok) {
					const errMsg = typeof parsed === "object" && parsed && "message" in parsed ? String(parsed.message) : `${res.status} ${res.statusText}`;
					debugError(`[qqbot-channel-api] Error [${method} ${p.path}]: ${errMsg}`);
					return json$1({
						error: errMsg,
						status: res.status,
						path: p.path,
						details: parsed
					});
				}
				return json$1({
					success: true,
					status: res.status,
					path: p.path,
					data: parsed
				});
			} catch (err) {
				return json$1({
					error: formatErrorMessage(err),
					path: p.path
				});
			}
		}
	}, { name: "qqbot_channel_api" });
}
//#endregion
//#region extensions/qqbot/src/tools/remind.ts
const RemindSchema = {
	type: "object",
	properties: {
		action: {
			type: "string",
			description: "Action type. add=create a reminder, list=show reminders, remove=delete a reminder.",
			enum: [
				"add",
				"list",
				"remove"
			]
		},
		content: {
			type: "string",
			description: "Reminder content, for example \"drink water\" or \"join the meeting\". Required when action=add."
		},
		to: {
			type: "string",
			description: "Delivery target from the `[QQBot] to=` context value. Direct-message format: qqbot:c2c:user_openid. Group format: qqbot:group:group_openid. Required when action=add."
		},
		time: {
			type: "string",
			description: "Time description. Supported formats:\n1. Relative time, for example \"5m\", \"1h\", \"1h30m\", or \"2d\"\n2. Cron expression, for example \"0 8 * * *\" or \"0 9 * * 1-5\"\nValues containing spaces are treated as cron expressions; everything else is treated as a one-shot relative delay.\nRequired when action=add."
		},
		timezone: {
			type: "string",
			description: "Timezone used for cron reminders. Defaults to \"Asia/Shanghai\"."
		},
		name: {
			type: "string",
			description: "Optional reminder job name. Defaults to the first 20 characters of content."
		},
		jobId: {
			type: "string",
			description: "Job ID to remove. Required when action=remove; fetch it with list first."
		}
	},
	required: ["action"]
};
function json(data) {
	return {
		content: [{
			type: "text",
			text: JSON.stringify(data, null, 2)
		}],
		details: data
	};
}
function parseRelativeTime(timeStr) {
	const s = normalizeLowercaseStringOrEmpty(timeStr);
	if (/^\d+$/.test(s)) return parseInt(s, 10) * 6e4;
	let totalMs = 0;
	let matched = false;
	const regex = /(\d+(?:\.\d+)?)\s*(d|h|m|s)/g;
	let match;
	while ((match = regex.exec(s)) !== null) {
		matched = true;
		const value = parseFloat(match[1]);
		switch (match[2]) {
			case "d":
				totalMs += value * 864e5;
				break;
			case "h":
				totalMs += value * 36e5;
				break;
			case "m":
				totalMs += value * 6e4;
				break;
			case "s":
				totalMs += value * 1e3;
				break;
		}
	}
	return matched ? Math.round(totalMs) : null;
}
function isCronExpression(timeStr) {
	const parts = timeStr.trim().split(/\s+/);
	if (parts.length < 3 || parts.length > 6) return false;
	return parts.every((p) => /^[0-9*?/,LW#-]/.test(p));
}
function generateJobName(content) {
	const trimmed = content.trim();
	return `Reminder: ${trimmed.length > 20 ? `${trimmed.slice(0, 20)}…` : trimmed}`;
}
function buildReminderPrompt(content) {
	return `You are a warm reminder assistant. Please remind the user about: ${content}. Requirements: (1) do not reply with HEARTBEAT_OK (2) do not explain who you are (3) output a direct and caring reminder message (4) you may add a short encouraging line (5) keep it within 2-3 sentences (6) use a small amount of emoji.`;
}
function buildOnceJob(params, delayMs) {
	const atMs = Date.now() + delayMs;
	const to = params.to;
	const content = params.content;
	return {
		action: "add",
		job: {
			name: params.name || generateJobName(content),
			schedule: {
				kind: "at",
				atMs
			},
			sessionTarget: "isolated",
			wakeMode: "now",
			deleteAfterRun: true,
			payload: {
				kind: "agentTurn",
				message: buildReminderPrompt(content),
				deliver: true,
				channel: "qqbot",
				to
			}
		}
	};
}
function buildCronJob(params) {
	const to = params.to;
	const content = params.content;
	const name = params.name || generateJobName(content);
	const tz = params.timezone || "Asia/Shanghai";
	return {
		action: "add",
		job: {
			name,
			schedule: {
				kind: "cron",
				expr: params.time.trim(),
				tz
			},
			sessionTarget: "isolated",
			wakeMode: "now",
			payload: {
				kind: "agentTurn",
				message: buildReminderPrompt(content),
				deliver: true,
				channel: "qqbot",
				to
			}
		}
	};
}
function formatDelay(ms) {
	const totalSeconds = Math.round(ms / 1e3);
	if (totalSeconds < 60) return `${totalSeconds}s`;
	const totalMinutes = Math.round(ms / 6e4);
	if (totalMinutes < 60) return `${totalMinutes}m`;
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	if (minutes === 0) return `${hours}h`;
	return `${hours}h${minutes}m`;
}
function registerRemindTool(api) {
	api.registerTool({
		name: "qqbot_remind",
		label: "QQBot Reminder",
		description: "Create, list, and remove QQ reminders. Use simple parameters without manually building cron JSON.\nCreate: action=add, content=message, to=target, time=schedule\nList: action=list\nRemove: action=remove, jobId=job id from list\nTime examples: \"5m\", \"1h\", \"0 8 * * *\"",
		parameters: RemindSchema,
		async execute(_toolCallId, params) {
			const p = params;
			if (p.action === "list") return json({
				_instruction: "Use the cron tool immediately with the following parameters.",
				cronParams: { action: "list" }
			});
			if (p.action === "remove") {
				if (!p.jobId) return json({ error: "jobId is required when action=remove. Use action=list first." });
				return json({
					_instruction: "Use the cron tool immediately with the following parameters.",
					cronParams: {
						action: "remove",
						jobId: p.jobId
					}
				});
			}
			if (!p.content) return json({ error: "content is required when action=add" });
			if (!p.to) return json({ error: "to is required when action=add" });
			if (!p.time) return json({ error: "time is required when action=add" });
			if (isCronExpression(p.time)) return json({
				_instruction: "Use the cron tool immediately with the following parameters, then tell the user the reminder has been scheduled.",
				cronParams: buildCronJob(p),
				summary: `⏰ Recurring reminder: "${p.content}" (${p.time}, tz=${p.timezone || "Asia/Shanghai"})`
			});
			const delayMs = parseRelativeTime(p.time);
			if (delayMs == null) return json({ error: `Could not parse time format: ${p.time}. Use values like 5m, 1h, 1h30m, or a cron expression.` });
			if (delayMs < 3e4) return json({ error: "Reminder delay must be at least 30 seconds" });
			return json({
				_instruction: "Use the cron tool immediately with the following parameters, then tell the user the reminder has been scheduled.",
				cronParams: buildOnceJob(p, delayMs),
				summary: `⏰ Reminder in ${formatDelay(delayMs)}: "${p.content}"`
			});
		}
	}, { name: "qqbot_remind" });
}
//#endregion
//#region extensions/qqbot/src/proactive.ts
/** Look up a known user entry (adapter for the old proactive API shape). */
function getKnownUser(type, openid, accountId) {
	return getKnownUser$1(accountId, openid, type);
}
/** List known users with optional filtering and sorting (adapter). */
function listKnownUsers(options) {
	const type = options?.type;
	return listKnownUsers$1({
		type: type === "channel" ? void 0 : type,
		accountId: options?.accountId,
		limit: options?.limit,
		sortBy: options?.sortByLastInteraction !== false ? "lastSeenAt" : void 0,
		sortOrder: "desc"
	});
}
/** Remove one known user entry (adapter). */
function removeKnownUser(type, openid, accountId) {
	return removeKnownUser$1(accountId, openid, type);
}
/** Clear all known users, optionally scoped to a single account (adapter). */
function clearKnownUsers(accountId) {
	return clearKnownUsers$1(accountId);
}
/** Resolve account config and send a proactive message. */
async function sendProactive(options, cfg) {
	const { to, text, type = "c2c", imageUrl, accountId = resolveDefaultQQBotAccountId(cfg) } = options;
	const account = resolveQQBotAccount(cfg, accountId);
	if (!account.appId || !account.clientSecret) return {
		success: false,
		error: "QQBot not configured (missing appId or clientSecret)"
	};
	try {
		const accessToken = await getAccessToken(account.appId, account.clientSecret);
		if (imageUrl) try {
			if (type === "c2c") await sendC2CImageMessage(account.appId, accessToken, to, imageUrl, void 0, void 0);
			else if (type === "group") await sendGroupImageMessage(account.appId, accessToken, to, imageUrl, void 0, void 0);
			debugLog(`[qqbot:proactive] Sent image to ${type}:${to}`);
		} catch (err) {
			debugError(`[qqbot:proactive] Failed to send image: ${String(err)}`);
		}
		let result;
		if (type === "c2c") result = await sendProactiveC2CMessage(account.appId, accessToken, to, text);
		else if (type === "group") result = await sendProactiveGroupMessage(account.appId, accessToken, to, text);
		else if (type === "channel") return {
			success: false,
			error: "Channel proactive messages are not supported. Please use group or c2c."
		};
		else return {
			success: false,
			error: `Unknown message type: ${String(type)}`
		};
		debugLog(`[qqbot:proactive] Sent message to ${type}:${to}, id: ${result.id}`);
		return {
			success: true,
			messageId: result.id,
			timestamp: result.timestamp
		};
	} catch (err) {
		const message = formatErrorMessage(err);
		debugError(`[qqbot:proactive] Failed to send message: ${message}`);
		return {
			success: false,
			error: message
		};
	}
}
/** Send one proactive message to each recipient. */
async function sendBulkProactiveMessage(recipients, text, type, cfg, accountId = resolveDefaultQQBotAccountId(cfg)) {
	const results = [];
	for (const to of recipients) {
		const result = await sendProactive({
			to,
			text,
			type,
			accountId
		}, cfg);
		results.push({
			to,
			result
		});
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	return results;
}
/**
* Send a message to all known users.
*
* @param text Message content.
* @param cfg OpenClaw config.
* @param options Optional filters.
* @returns Aggregate send statistics.
*/
async function broadcastMessage(text, cfg, options) {
	const validUsers = listKnownUsers({
		type: options?.type,
		accountId: options?.accountId,
		limit: options?.limit,
		sortByLastInteraction: true
	}).filter((u) => u.type === "c2c" || u.type === "group");
	const results = [];
	let success = 0;
	let failed = 0;
	for (const user of validUsers) {
		const targetId = user.type === "group" ? user.groupOpenid ?? user.openid : user.openid;
		const result = await sendProactive({
			to: targetId,
			text,
			type: user.type,
			accountId: user.accountId
		}, cfg);
		results.push({
			to: targetId,
			result
		});
		if (result.success) success++;
		else failed++;
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	return {
		total: validUsers.length,
		success,
		failed,
		results
	};
}
/**
* Send a proactive message using a resolved account without a full config object.
*
* @param account Resolved account configuration.
* @param to Target openid.
* @param text Message content.
* @param type Message type.
*/
async function sendProactiveMessageDirect(account, to, text, type = "c2c") {
	if (!account.appId || !account.clientSecret) return {
		success: false,
		error: "QQBot not configured (missing appId or clientSecret)"
	};
	try {
		const accessToken = await getAccessToken(account.appId, account.clientSecret);
		let result;
		if (type === "c2c") result = await sendProactiveC2CMessage(account.appId, accessToken, to, text);
		else result = await sendProactiveGroupMessage(account.appId, accessToken, to, text);
		return {
			success: true,
			messageId: result.id,
			timestamp: result.timestamp
		};
	} catch (err) {
		return {
			success: false,
			error: formatErrorMessage(err)
		};
	}
}
/**
* Return known-user counts for the selected account.
*/
function getKnownUsersStats(accountId) {
	const users = listKnownUsers({ accountId });
	return {
		total: users.length,
		c2c: users.filter((u) => u.type === "c2c").length,
		group: users.filter((u) => u.type === "group").length,
		channel: 0
	};
}
//#endregion
export { DEFAULT_ACCOUNT_ID, applyQQBotAccountConfig, broadcastMessage, checkMessageReplyLimit, clearKnownUsers, clearKnownUsers$1 as clearKnownUsersFromStore, flushKnownUsers, getFrameworkCommands, getKnownUser, getKnownUser$1 as getKnownUserFromStore, getKnownUsersStats, getMessageReplyConfig, getMessageReplyStats, listKnownUsers, listKnownUsers$1 as listKnownUsersFromStore, listQQBotAccountIds, qqbotPlugin, qqbotSetupPlugin, recordKnownUser, recordMessageReply, registerChannelTool, registerRemindTool, removeKnownUser, removeKnownUser$1 as removeKnownUserFromStore, resolveDefaultQQBotAccountId, resolveQQBotAccount, sendBulkProactiveMessage, sendCronMessage, sendDocument, sendMedia, sendPhoto, sendProactive, sendProactiveMessage, sendProactiveMessageDirect, sendText, sendVideoMsg, sendVoice };
