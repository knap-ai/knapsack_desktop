import { i as defineChannelPluginEntry } from "../../core-BghMcc08.js";
import { A as getAccessToken, o as sendDocument, ot as debugError, st as debugLog } from "../../outbound-DE5EbLPn.js";
import { a as resolveQQBotAccount, r as listQQBotAccountIds } from "../../config-DODp7r-t.js";
import { n as setQQBotRuntime, t as getQQBotRuntime } from "../../runtime-DFBwpBiF.js";
import { r as qqbotPlugin, t as getFrameworkCommands } from "../../slash-commands-Bu_4ImoV.js";
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
						error: `Network error: ${err instanceof Error ? err.message : String(err)}`,
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
					error: err instanceof Error ? err.message : String(err),
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
	const s = timeStr.trim().toLowerCase();
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
//#region extensions/qqbot/index.ts
var qqbot_default = defineChannelPluginEntry({
	id: "qqbot",
	name: "QQ Bot",
	description: "QQ Bot channel plugin",
	plugin: qqbotPlugin,
	setRuntime: setQQBotRuntime,
	registerFull(api) {
		registerChannelTool(api);
		registerRemindTool(api);
		for (const cmd of getFrameworkCommands()) api.registerCommand({
			name: cmd.name,
			description: cmd.description,
			requireAuth: true,
			acceptsArgs: true,
			handler: async (ctx) => {
				const fromStripped = (ctx.from ?? "").replace(/^qqbot:/i, "");
				const rawMsgType = fromStripped.split(":")[0] ?? "c2c";
				const msgType = rawMsgType === "group" ? "group" : rawMsgType === "channel" ? "guild" : rawMsgType === "dm" ? "dm" : "c2c";
				const colonIdx = fromStripped.indexOf(":");
				const targetId = colonIdx !== -1 ? fromStripped.slice(colonIdx + 1) : fromStripped;
				const targetType = rawMsgType === "group" ? "group" : rawMsgType === "channel" ? "channel" : rawMsgType === "dm" ? "dm" : "c2c";
				const account = resolveQQBotAccount(ctx.config, ctx.accountId ?? void 0);
				const slashCtx = {
					type: msgType,
					senderId: ctx.senderId ?? "",
					messageId: "",
					eventTimestamp: (/* @__PURE__ */ new Date()).toISOString(),
					receivedAt: Date.now(),
					rawContent: `/${cmd.name}${ctx.args ? ` ${ctx.args}` : ""}`,
					args: ctx.args ?? "",
					accountId: account.accountId,
					appId: account.appId,
					accountConfig: account.config,
					commandAuthorized: true,
					queueSnapshot: {
						totalPending: 0,
						activeUsers: 0,
						maxConcurrentUsers: 10,
						senderPending: 0
					}
				};
				const result = await cmd.handler(slashCtx);
				if (typeof result === "string") return { text: result };
				if (result && "filePath" in result) {
					try {
						await sendDocument({
							targetType,
							targetId,
							account,
							logPrefix: `[qqbot:${account.accountId}]`
						}, result.filePath);
					} catch {}
					return { text: result.text };
				}
				return { text: "⚠️ 命令返回了意外结果。" };
			}
		});
	}
});
//#endregion
export { qqbot_default as default, getQQBotRuntime, qqbotPlugin, setQQBotRuntime };
