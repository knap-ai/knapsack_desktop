import { a as recordMessageReply, c as sendCronMessage, d as sendPhoto, f as sendProactiveMessage, h as sendVoice, l as sendDocument, m as sendVideoMsg, n as getMessageReplyConfig, o as registerOutboundAudioAdapter, p as sendText, r as getMessageReplyStats, s as registerOutboundAudioAdapterFactory, t as checkMessageReplyLimit, u as sendMedia } from "./outbound-CNhvemR8.js";
import { n as getBridgeLogger } from "./bootstrap-DP2UpEF-.js";
import { a as resolveQQBotAccount, i as resolveDefaultQQBotAccountId, n as applyQQBotAccountConfig, r as listQQBotAccountIds, t as DEFAULT_ACCOUNT_ID } from "./config--Jdei9fe.js";
import { t as qqbotPlugin } from "./channel-IJ1hgwOJ.js";
import { O as formatErrorMessage, T as debugLog, o as getAccessToken, w as debugError } from "./sender-BZ_TJkxQ.js";
import { t as qqbotSetupPlugin } from "./channel.setup-CW7WojiA.js";
import { r as getFrameworkCommands, t as getRequestContext } from "./request-context-DM5_RNBD.js";
//#region extensions/qqbot/src/engine/tools/channel-api.ts
/**
* QQ Channel API proxy tool core logic.
* QQ 频道 API 代理工具核心逻辑。
*
* Provides an authenticated HTTP proxy for the QQ Open Platform channel
* APIs. The caller (old tools/channel.ts shell) resolves the access
* token and passes it in; this module handles URL building, path
* validation, fetch, and structured response formatting.
*/
const API_BASE = "https://api.sgroup.qq.com";
const DEFAULT_TIMEOUT_MS = 3e4;
/**
* JSON Schema for AI tool parameters (used by framework registration).
* AI Tool 参数的 JSON Schema 定义（供框架注册使用）。
*/
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
/**
* Build the full API URL from base + path + query params.
* 拼接 API 基地址 + 路径 + 查询参数。
*/
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
/**
* Validate API path format; returns an error string or null if valid.
* 校验 API 路径格式，返回错误描述或 null（合法）。
*/
function validatePath(path) {
	if (!path.startsWith("/")) return "path must start with /";
	if (path.includes("..") || path.includes("//")) return "path must not contain .. or //";
	if (!/^\/[a-zA-Z0-9\-._~:@!$&'()*+,;=/%]+$/.test(path) && path !== "/") return "path contains unsupported characters";
	return null;
}
function json$1(data) {
	return {
		content: [{
			type: "text",
			text: JSON.stringify(data, null, 2)
		}],
		details: data
	};
}
/**
* Execute a channel API proxy request.
* 执行频道 API 代理请求。
*
* The caller provides the access token; this function handles
* URL building, path validation, HTTP fetch, and structured
* response formatting suitable for AI tool output.
*/
async function executeChannelApi(params, options) {
	if (!params.method) return json$1({ error: "method is required" });
	if (!params.path) return json$1({ error: "path is required" });
	const method = params.method.toUpperCase();
	if (![
		"GET",
		"POST",
		"PUT",
		"PATCH",
		"DELETE"
	].includes(method)) return json$1({ error: `Unsupported HTTP method: ${method}. Allowed values: GET, POST, PUT, PATCH, DELETE` });
	const pathError = validatePath(params.path);
	if (pathError) return json$1({ error: pathError });
	if ((method === "GET" || method === "DELETE") && params.body && Object.keys(params.body).length > 0) debugLog(`[qqbot-channel-api] ${method} request with body, body will be ignored`);
	try {
		const url = buildUrl(params.path, params.query);
		const headers = {
			Authorization: `QQBot ${options.accessToken}`,
			"Content-Type": "application/json"
		};
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
		const fetchOptions = {
			method,
			headers,
			signal: controller.signal
		};
		if (params.body && [
			"POST",
			"PUT",
			"PATCH"
		].includes(method)) fetchOptions.body = JSON.stringify(params.body);
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
					path: params.path
				});
			}
			debugError("[qqbot-channel-api] <<< Network error:", err);
			return json$1({
				error: `Network error: ${formatErrorMessage(err)}`,
				path: params.path
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
				path: params.path
			});
			return json$1({
				error: `API returned ${res.status} ${res.statusText}`,
				status: res.status,
				path: params.path
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
			debugError(`[qqbot-channel-api] Error [${method} ${params.path}]: ${errMsg}`);
			return json$1({
				error: errMsg,
				status: res.status,
				path: params.path,
				details: parsed
			});
		}
		return json$1({
			success: true,
			status: res.status,
			path: params.path,
			data: parsed
		});
	} catch (err) {
		return json$1({
			error: formatErrorMessage(err),
			path: params.path
		});
	}
}
//#endregion
//#region extensions/qqbot/src/bridge/tools/channel.ts
/**
* Register the QQ channel API proxy tool.
*
* The tool acts as an authenticated HTTP proxy for the QQ Open Platform
* channel APIs. Agents learn endpoint details from the skill docs and
* send requests through this proxy.
*/
function registerChannelTool(api) {
	const cfg = api.config;
	if (!cfg) {
		getBridgeLogger().debug?.("[qqbot-channel-api] No config available, skipping");
		return;
	}
	const accountIds = listQQBotAccountIds(cfg);
	if (accountIds.length === 0) {
		getBridgeLogger().debug?.("[qqbot-channel-api] No QQBot accounts configured, skipping");
		return;
	}
	const firstAccountId = accountIds[0];
	const account = resolveQQBotAccount(cfg, firstAccountId);
	if (!account.appId || !account.clientSecret) {
		getBridgeLogger().debug?.("[qqbot-channel-api] Account not fully configured, skipping");
		return;
	}
	api.registerTool({
		name: "qqbot_channel_api",
		label: "QQBot Channel API",
		description: "Authenticated HTTP proxy for QQ Open Platform channel APIs. Common endpoints: list guilds GET /users/@me/guilds | list channels GET /guilds/{guild_id}/channels | get channel GET /channels/{channel_id} | create channel POST /guilds/{guild_id}/channels | list members GET /guilds/{guild_id}/members?after=0&limit=100 | get member GET /guilds/{guild_id}/members/{user_id} | list threads GET /channels/{channel_id}/threads | create thread PUT /channels/{channel_id}/threads | create announce POST /guilds/{guild_id}/announces | create schedule POST /channels/{channel_id}/schedules. See the qqbot-channel skill for full endpoint details.",
		parameters: ChannelApiSchema,
		async execute(_toolCallId, params) {
			return executeChannelApi(params, { accessToken: await getAccessToken(account.appId, account.clientSecret) });
		}
	}, { name: "qqbot_channel_api" });
}
//#endregion
//#region extensions/qqbot/src/engine/tools/remind-logic.ts
/**
* JSON Schema for AI tool parameters (used by framework registration).
* AI Tool 参数的 JSON Schema 定义（供框架注册使用）。
*/
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
			description: "Optional delivery target. The runtime automatically resolves the current conversation target, so you usually do not need to supply this. Direct-message format: qqbot:c2c:user_openid. Group format: qqbot:group:group_openid."
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
/**
* Parse a relative time string into milliseconds.
* 解析相对时间字符串为毫秒数。
*
* Supports: "5m", "1h", "1h30m", "2d", "45s", plain number (as minutes).
*
* @returns Milliseconds or null if unparseable.
*/
function parseRelativeTime(timeStr) {
	const s = timeStr.toLowerCase();
	if (/^\d+$/.test(s)) return Number.parseInt(s, 10) * 6e4;
	let totalMs = 0;
	let matched = false;
	const regex = /(\d+(?:\.\d+)?)\s*(d|h|m|s)/g;
	let match;
	while ((match = regex.exec(s)) !== null) {
		matched = true;
		const value = Number.parseFloat(match[1]);
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
/**
* Check whether a time string is a cron expression (3–6 space-separated fields).
* 判断时间字符串是否为 cron 表达式。
*/
function isCronExpression(timeStr) {
	const parts = timeStr.trim().split(/\s+/);
	if (parts.length < 3 || parts.length > 6) return false;
	return parts.every((p) => /^[0-9*?/,LW#-]/.test(p));
}
/**
* Generate a cron job name from reminder content (first 20 chars).
* 根据提醒内容生成 cron job 名称。
*/
function generateJobName(content) {
	const trimmed = content.trim();
	return `Reminder: ${trimmed.length > 20 ? `${trimmed.slice(0, 20)}…` : trimmed}`;
}
/** Build the reminder system prompt sent to the AI. */
function buildReminderPrompt(content) {
	return `You are a warm reminder assistant. Please remind the user about: ${content}. Requirements: (1) do not reply with HEARTBEAT_OK (2) do not explain who you are (3) output a direct and caring reminder message (4) you may add a short encouraging line (5) keep it within 2-3 sentences (6) use a small amount of emoji.`;
}
/** Build cron job params for a one-shot delayed reminder. */
function buildOnceJob(params, delayMs, to, accountId) {
	const atMs = Date.now() + delayMs;
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
				message: buildReminderPrompt(content)
			},
			delivery: {
				mode: "announce",
				channel: "qqbot",
				to,
				accountId
			}
		}
	};
}
/** Build cron job params for a recurring cron reminder. */
function buildCronJob(params, to, accountId) {
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
				message: buildReminderPrompt(content)
			},
			delivery: {
				mode: "announce",
				channel: "qqbot",
				to,
				accountId
			}
		}
	};
}
/** Format a delay in milliseconds as a short string (e.g. "5m", "1h30m"). */
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
function json(data) {
	return {
		content: [{
			type: "text",
			text: JSON.stringify(data, null, 2)
		}],
		details: data
	};
}
/**
* Execute the reminder tool logic.
* 执行提醒工具逻辑。
*
* Validates params, parses time, and returns a structured result
* containing cron job params that the framework shell passes back
* as the tool output.
*
* When the AI omits `to` / `accountId`, the bridge layer can supply
* `ctx.fallbackTo` / `ctx.fallbackAccountId` (typically resolved from
* the request-scoped AsyncLocalStorage) to fill them in.
*/
function executeRemind(params, ctx = {}) {
	if (params.action === "list") return json({
		_instruction: "Use the cron tool immediately with the following parameters.",
		cronParams: { action: "list" }
	});
	if (params.action === "remove") {
		if (!params.jobId) return json({ error: "jobId is required when action=remove. Use action=list first." });
		return json({
			_instruction: "Use the cron tool immediately with the following parameters.",
			cronParams: {
				action: "remove",
				jobId: params.jobId
			}
		});
	}
	if (!params.content) return json({ error: "content is required when action=add" });
	const resolvedTo = params.to || ctx.fallbackTo;
	if (!resolvedTo) return json({ error: "Unable to determine delivery target for action=add. The reminder can only be scheduled from within an active conversation." });
	if (!params.time) return json({ error: "time is required when action=add" });
	const resolvedAccountId = ctx.fallbackAccountId || "default";
	if (isCronExpression(params.time)) return json({
		_instruction: "Use the cron tool immediately with the following parameters. Pass cronParams verbatim — do not modify or omit any field, especially delivery.accountId — then tell the user the reminder has been scheduled.",
		cronParams: buildCronJob(params, resolvedTo, resolvedAccountId),
		summary: `⏰ Recurring reminder: "${params.content}" (${params.time}, tz=${params.timezone || "Asia/Shanghai"})`
	});
	const delayMs = parseRelativeTime(params.time);
	if (delayMs == null) return json({ error: `Could not parse time format: ${params.time}. Use values like 5m, 1h, 1h30m, or a cron expression.` });
	if (delayMs < 3e4) return json({ error: "Reminder delay must be at least 30 seconds" });
	return json({
		_instruction: "Use the cron tool immediately with the following parameters. Pass cronParams verbatim — do not modify or omit any field, especially delivery.accountId — then tell the user the reminder has been scheduled.",
		cronParams: buildOnceJob(params, delayMs, resolvedTo, resolvedAccountId),
		summary: `⏰ Reminder in ${formatDelay(delayMs)}: "${params.content}"`
	});
}
//#endregion
//#region extensions/qqbot/src/bridge/tools/remind.ts
function registerRemindTool(api) {
	api.registerTool({
		name: "qqbot_remind",
		label: "QQBot Reminder",
		description: "Create, list, and remove QQ reminders. Use simple parameters without manually building cron JSON.\nCreate: action=add, content=message, time=schedule (to is optional, resolved automatically from the current conversation)\nList: action=list\nRemove: action=remove, jobId=job id from list\nTime examples: \"5m\", \"1h\", \"0 8 * * *\"",
		parameters: RemindSchema,
		async execute(_toolCallId, params) {
			const ctx = getRequestContext();
			return executeRemind(params, {
				fallbackTo: ctx?.target,
				fallbackAccountId: ctx?.accountId
			});
		}
	}, { name: "qqbot_remind" });
}
//#endregion
//#region extensions/qqbot/src/bridge/tools/index.ts
function registerQQBotTools(api) {
	registerChannelTool(api);
	registerRemindTool(api);
}
//#endregion
//#region extensions/qqbot/src/bridge/commands/framework-context-adapter.ts
/**
* Default queue snapshot used for framework-registered commands.
*
* Framework-side command dispatch runs outside the per-sender queue, so
* handlers observe an empty snapshot by design.
*/
const DEFAULT_QUEUE_SNAPSHOT = {
	totalPending: 0,
	activeUsers: 0,
	maxConcurrentUsers: 10,
	senderPending: 0
};
function buildFrameworkSlashContext({ ctx, account, from, commandName }) {
	const args = ctx.args ?? "";
	const rawContent = args ? `/${commandName} ${args}` : `/${commandName}`;
	return {
		type: from.msgType,
		senderId: ctx.senderId ?? "",
		messageId: "",
		eventTimestamp: (/* @__PURE__ */ new Date()).toISOString(),
		receivedAt: Date.now(),
		rawContent,
		args,
		accountId: account.accountId,
		appId: account.appId,
		accountConfig: account.config,
		commandAuthorized: true,
		queueSnapshot: { ...DEFAULT_QUEUE_SNAPSHOT }
	};
}
//#endregion
//#region extensions/qqbot/src/bridge/commands/from-parser.ts
const MSG_TYPE_MAP = {
	c2c: "c2c",
	dm: "dm",
	group: "group",
	channel: "guild"
};
const TARGET_TYPE_MAP = {
	c2c: "c2c",
	dm: "dm",
	group: "group",
	channel: "channel"
};
function isFromKind(value) {
	return value === "c2c" || value === "dm" || value === "group" || value === "channel";
}
/**
* Parse `ctx.from` into the structured fields the QQBot bridge expects.
*
* Unknown or missing prefixes fall back to c2c. The remainder after the first
* `:` is returned verbatim as the target id, matching what the previous inline
* implementation did.
*/
function parseQQBotFrom(from) {
	const stripped = (from ?? "").replace(/^qqbot:/iu, "");
	const colonIdx = stripped.indexOf(":");
	const rawPrefix = colonIdx === -1 ? stripped : stripped.slice(0, colonIdx);
	const targetId = colonIdx === -1 ? stripped : stripped.slice(colonIdx + 1);
	const kind = isFromKind(rawPrefix) ? rawPrefix : "c2c";
	return {
		msgType: MSG_TYPE_MAP[kind],
		targetType: TARGET_TYPE_MAP[kind],
		targetId
	};
}
//#endregion
//#region extensions/qqbot/src/bridge/commands/result-dispatcher.ts
const UNEXPECTED_RESULT_TEXT = "⚠️ 命令返回了意外结果。";
function hasFilePath(value) {
	return typeof value === "object" && value !== null && "filePath" in value && typeof value.filePath === "string";
}
function buildMediaTarget(account, from) {
	return {
		targetType: from.targetType,
		targetId: from.targetId,
		account
	};
}
async function dispatchFrameworkSlashResult({ result, account, from, logger }) {
	if (typeof result === "string") return { text: result };
	if (hasFilePath(result)) {
		const mediaCtx = buildMediaTarget(account, from);
		try {
			await sendDocument(mediaCtx, result.filePath, { allowQQBotDataDownloads: true });
		} catch (err) {
			logger?.warn(`framework slash file send failed: ${String(err)}`);
		}
		return { text: result.text };
	}
	return { text: UNEXPECTED_RESULT_TEXT };
}
//#endregion
//#region extensions/qqbot/src/bridge/commands/framework-registration.ts
function registerQQBotFrameworkCommands(api) {
	for (const cmd of getFrameworkCommands()) api.registerCommand({
		name: cmd.name,
		description: cmd.description,
		requireAuth: true,
		acceptsArgs: true,
		handler: async (ctx) => {
			const from = parseQQBotFrom(ctx.from);
			const account = resolveQQBotAccount(ctx.config, ctx.accountId ?? void 0);
			const slashCtx = buildFrameworkSlashContext({
				ctx,
				account,
				from,
				commandName: cmd.name
			});
			return await dispatchFrameworkSlashResult({
				result: await cmd.handler(slashCtx),
				account,
				from,
				logger: api.logger
			});
		}
	});
}
//#endregion
//#region extensions/qqbot/src/bridge/channel-entry.ts
function registerQQBotFull(api) {
	registerQQBotTools(api);
	registerQQBotFrameworkCommands(api);
}
//#endregion
export { DEFAULT_ACCOUNT_ID, applyQQBotAccountConfig, checkMessageReplyLimit, getFrameworkCommands, getMessageReplyConfig, getMessageReplyStats, listQQBotAccountIds, qqbotPlugin, qqbotSetupPlugin, recordMessageReply, registerChannelTool, registerOutboundAudioAdapter, registerOutboundAudioAdapterFactory, registerQQBotFull, registerQQBotTools, registerRemindTool, resolveDefaultQQBotAccountId, resolveQQBotAccount, sendCronMessage, sendDocument, sendMedia, sendPhoto, sendProactiveMessage, sendText, sendVideoMsg, sendVoice };
