import { x as shortenHomeInString } from "./utils-q1rHOG-N.js";
import { r as redactToolDetail } from "./redact-Bt-krp_b.js";

//#region src/agents/tool-display.json
var tool_display_default = {
	version: 1,
	fallback: {
		"emoji": "🧩",
		"detailKeys": [
			"command",
			"path",
			"url",
			"targetUrl",
			"targetId",
			"ref",
			"element",
			"node",
			"nodeId",
			"id",
			"requestId",
			"to",
			"channelId",
			"guildId",
			"userId",
			"name",
			"query",
			"pattern",
			"messageId"
		]
	},
	tools: {
		"exec": {
			"emoji": "🛠️",
			"title": "Exec",
			"detailKeys": ["command"]
		},
		"process": {
			"emoji": "🧰",
			"title": "Process",
			"detailKeys": ["sessionId"]
		},
		"read": {
			"emoji": "📖",
			"title": "Read",
			"detailKeys": ["path"]
		},
		"write": {
			"emoji": "✍️",
			"title": "Write",
			"detailKeys": ["path"]
		},
		"edit": {
			"emoji": "📝",
			"title": "Edit",
			"detailKeys": ["path"]
		},
		"apply_patch": {
			"emoji": "🩹",
			"title": "Apply Patch",
			"detailKeys": []
		},
		"attach": {
			"emoji": "📎",
			"title": "Attach",
			"detailKeys": [
				"path",
				"url",
				"fileName"
			]
		},
		"browser": {
			"emoji": "🌐",
			"title": "Browser",
			"actions": {
				"status": { "label": "status" },
				"start": { "label": "start" },
				"stop": { "label": "stop" },
				"tabs": { "label": "tabs" },
				"open": {
					"label": "open",
					"detailKeys": ["targetUrl"]
				},
				"focus": {
					"label": "focus",
					"detailKeys": ["targetId"]
				},
				"close": {
					"label": "close",
					"detailKeys": ["targetId"]
				},
				"snapshot": {
					"label": "snapshot",
					"detailKeys": [
						"targetUrl",
						"targetId",
						"ref",
						"element",
						"format"
					]
				},
				"screenshot": {
					"label": "screenshot",
					"detailKeys": [
						"targetUrl",
						"targetId",
						"ref",
						"element"
					]
				},
				"navigate": {
					"label": "navigate",
					"detailKeys": ["targetUrl", "targetId"]
				},
				"console": {
					"label": "console",
					"detailKeys": ["level", "targetId"]
				},
				"pdf": {
					"label": "pdf",
					"detailKeys": ["targetId"]
				},
				"upload": {
					"label": "upload",
					"detailKeys": [
						"paths",
						"ref",
						"inputRef",
						"element",
						"targetId"
					]
				},
				"dialog": {
					"label": "dialog",
					"detailKeys": [
						"accept",
						"promptText",
						"targetId"
					]
				},
				"act": {
					"label": "act",
					"detailKeys": [
						"request.kind",
						"request.ref",
						"request.selector",
						"request.text",
						"request.value"
					]
				}
			}
		},
		"canvas": {
			"emoji": "🖼️",
			"title": "Canvas",
			"actions": {
				"present": {
					"label": "present",
					"detailKeys": [
						"target",
						"node",
						"nodeId"
					]
				},
				"hide": {
					"label": "hide",
					"detailKeys": ["node", "nodeId"]
				},
				"navigate": {
					"label": "navigate",
					"detailKeys": [
						"url",
						"node",
						"nodeId"
					]
				},
				"eval": {
					"label": "eval",
					"detailKeys": [
						"javaScript",
						"node",
						"nodeId"
					]
				},
				"snapshot": {
					"label": "snapshot",
					"detailKeys": [
						"format",
						"node",
						"nodeId"
					]
				},
				"a2ui_push": {
					"label": "A2UI push",
					"detailKeys": [
						"jsonlPath",
						"node",
						"nodeId"
					]
				},
				"a2ui_reset": {
					"label": "A2UI reset",
					"detailKeys": ["node", "nodeId"]
				}
			}
		},
		"nodes": {
			"emoji": "📱",
			"title": "Nodes",
			"actions": {
				"status": { "label": "status" },
				"describe": {
					"label": "describe",
					"detailKeys": ["node", "nodeId"]
				},
				"pending": { "label": "pending" },
				"approve": {
					"label": "approve",
					"detailKeys": ["requestId"]
				},
				"reject": {
					"label": "reject",
					"detailKeys": ["requestId"]
				},
				"notify": {
					"label": "notify",
					"detailKeys": [
						"node",
						"nodeId",
						"title",
						"body"
					]
				},
				"camera_snap": {
					"label": "camera snap",
					"detailKeys": [
						"node",
						"nodeId",
						"facing",
						"deviceId"
					]
				},
				"camera_list": {
					"label": "camera list",
					"detailKeys": ["node", "nodeId"]
				},
				"camera_clip": {
					"label": "camera clip",
					"detailKeys": [
						"node",
						"nodeId",
						"facing",
						"duration",
						"durationMs"
					]
				},
				"screen_record": {
					"label": "screen record",
					"detailKeys": [
						"node",
						"nodeId",
						"duration",
						"durationMs",
						"fps",
						"screenIndex"
					]
				}
			}
		},
		"cron": {
			"emoji": "⏰",
			"title": "Cron",
			"actions": {
				"status": { "label": "status" },
				"list": { "label": "list" },
				"add": {
					"label": "add",
					"detailKeys": [
						"job.name",
						"job.id",
						"job.schedule",
						"job.cron"
					]
				},
				"update": {
					"label": "update",
					"detailKeys": ["id"]
				},
				"remove": {
					"label": "remove",
					"detailKeys": ["id"]
				},
				"run": {
					"label": "run",
					"detailKeys": ["id"]
				},
				"runs": {
					"label": "runs",
					"detailKeys": ["id"]
				},
				"wake": {
					"label": "wake",
					"detailKeys": ["text", "mode"]
				}
			}
		},
		"gateway": {
			"emoji": "🔌",
			"title": "Gateway",
			"actions": { "restart": {
				"label": "restart",
				"detailKeys": ["reason", "delayMs"]
			} }
		},
		"message": {
			"emoji": "✉️",
			"title": "Message",
			"actions": {
				"send": {
					"label": "send",
					"detailKeys": [
						"provider",
						"to",
						"media",
						"replyTo",
						"threadId"
					]
				},
				"poll": {
					"label": "poll",
					"detailKeys": [
						"provider",
						"to",
						"pollQuestion"
					]
				},
				"react": {
					"label": "react",
					"detailKeys": [
						"provider",
						"to",
						"messageId",
						"emoji",
						"remove"
					]
				},
				"reactions": {
					"label": "reactions",
					"detailKeys": [
						"provider",
						"to",
						"messageId",
						"limit"
					]
				},
				"read": {
					"label": "read",
					"detailKeys": [
						"provider",
						"to",
						"limit"
					]
				},
				"edit": {
					"label": "edit",
					"detailKeys": [
						"provider",
						"to",
						"messageId"
					]
				},
				"delete": {
					"label": "delete",
					"detailKeys": [
						"provider",
						"to",
						"messageId"
					]
				},
				"pin": {
					"label": "pin",
					"detailKeys": [
						"provider",
						"to",
						"messageId"
					]
				},
				"unpin": {
					"label": "unpin",
					"detailKeys": [
						"provider",
						"to",
						"messageId"
					]
				},
				"list-pins": {
					"label": "list pins",
					"detailKeys": ["provider", "to"]
				},
				"permissions": {
					"label": "permissions",
					"detailKeys": [
						"provider",
						"channelId",
						"to"
					]
				},
				"thread-create": {
					"label": "thread create",
					"detailKeys": [
						"provider",
						"channelId",
						"threadName"
					]
				},
				"thread-list": {
					"label": "thread list",
					"detailKeys": [
						"provider",
						"guildId",
						"channelId"
					]
				},
				"thread-reply": {
					"label": "thread reply",
					"detailKeys": [
						"provider",
						"channelId",
						"messageId"
					]
				},
				"search": {
					"label": "search",
					"detailKeys": [
						"provider",
						"guildId",
						"query"
					]
				},
				"sticker": {
					"label": "sticker",
					"detailKeys": [
						"provider",
						"to",
						"stickerId"
					]
				},
				"member-info": {
					"label": "member",
					"detailKeys": [
						"provider",
						"guildId",
						"userId"
					]
				},
				"role-info": {
					"label": "roles",
					"detailKeys": ["provider", "guildId"]
				},
				"emoji-list": {
					"label": "emoji list",
					"detailKeys": ["provider", "guildId"]
				},
				"emoji-upload": {
					"label": "emoji upload",
					"detailKeys": [
						"provider",
						"guildId",
						"emojiName"
					]
				},
				"sticker-upload": {
					"label": "sticker upload",
					"detailKeys": [
						"provider",
						"guildId",
						"stickerName"
					]
				},
				"role-add": {
					"label": "role add",
					"detailKeys": [
						"provider",
						"guildId",
						"userId",
						"roleId"
					]
				},
				"role-remove": {
					"label": "role remove",
					"detailKeys": [
						"provider",
						"guildId",
						"userId",
						"roleId"
					]
				},
				"channel-info": {
					"label": "channel",
					"detailKeys": ["provider", "channelId"]
				},
				"channel-list": {
					"label": "channels",
					"detailKeys": ["provider", "guildId"]
				},
				"voice-status": {
					"label": "voice",
					"detailKeys": [
						"provider",
						"guildId",
						"userId"
					]
				},
				"event-list": {
					"label": "events",
					"detailKeys": ["provider", "guildId"]
				},
				"event-create": {
					"label": "event create",
					"detailKeys": [
						"provider",
						"guildId",
						"eventName"
					]
				},
				"timeout": {
					"label": "timeout",
					"detailKeys": [
						"provider",
						"guildId",
						"userId"
					]
				},
				"kick": {
					"label": "kick",
					"detailKeys": [
						"provider",
						"guildId",
						"userId"
					]
				},
				"ban": {
					"label": "ban",
					"detailKeys": [
						"provider",
						"guildId",
						"userId"
					]
				}
			}
		},
		"agents_list": {
			"emoji": "🧭",
			"title": "Agents",
			"detailKeys": []
		},
		"sessions_list": {
			"emoji": "🗂️",
			"title": "Sessions",
			"detailKeys": [
				"kinds",
				"limit",
				"activeMinutes",
				"messageLimit"
			]
		},
		"sessions_history": {
			"emoji": "🧾",
			"title": "Session History",
			"detailKeys": [
				"sessionKey",
				"limit",
				"includeTools"
			]
		},
		"sessions_send": {
			"emoji": "📨",
			"title": "Session Send",
			"detailKeys": [
				"label",
				"sessionKey",
				"agentId",
				"timeoutSeconds"
			]
		},
		"sessions_spawn": {
			"emoji": "🧑‍🔧",
			"title": "Sub-agent",
			"detailKeys": [
				"label",
				"task",
				"agentId",
				"model",
				"thinking",
				"runTimeoutSeconds",
				"cleanup",
				"timeoutSeconds"
			]
		},
		"session_status": {
			"emoji": "📊",
			"title": "Session Status",
			"detailKeys": ["sessionKey", "model"]
		},
		"memory_search": {
			"emoji": "🧠",
			"title": "Memory Search",
			"detailKeys": ["query"]
		},
		"memory_get": {
			"emoji": "📓",
			"title": "Memory Get",
			"detailKeys": [
				"path",
				"from",
				"lines"
			]
		},
		"web_search": {
			"emoji": "🔎",
			"title": "Web Search",
			"detailKeys": ["query", "count"]
		},
		"web_fetch": {
			"emoji": "📄",
			"title": "Web Fetch",
			"detailKeys": [
				"url",
				"extractMode",
				"maxChars"
			]
		},
		"whatsapp_login": {
			"emoji": "🟢",
			"title": "WhatsApp Login",
			"actions": {
				"start": { "label": "start" },
				"wait": { "label": "wait" }
			}
		}
	}
};

//#endregion
//#region src/agents/tool-display.ts
const TOOL_DISPLAY_CONFIG = tool_display_default;
const FALLBACK = TOOL_DISPLAY_CONFIG.fallback ?? { emoji: "🧩" };
const TOOL_MAP = TOOL_DISPLAY_CONFIG.tools ?? {};
const DETAIL_LABEL_OVERRIDES = {
	agentId: "agent",
	sessionKey: "session",
	targetId: "target",
	targetUrl: "url",
	nodeId: "node",
	requestId: "request",
	messageId: "message",
	threadId: "thread",
	channelId: "channel",
	guildId: "guild",
	userId: "user",
	runTimeoutSeconds: "timeout",
	timeoutSeconds: "timeout",
	includeTools: "tools",
	pollQuestion: "poll",
	maxChars: "max chars"
};
const MAX_DETAIL_ENTRIES = 8;
function normalizeToolName(name) {
	return (name ?? "tool").trim();
}
function defaultTitle(name) {
	const cleaned = name.replace(/_/g, " ").trim();
	if (!cleaned) return "Tool";
	return cleaned.split(/\s+/).map((part) => part.length <= 2 && part.toUpperCase() === part ? part : `${part.at(0)?.toUpperCase() ?? ""}${part.slice(1)}`).join(" ");
}
function normalizeVerb(value) {
	const trimmed = value?.trim();
	if (!trimmed) return;
	return trimmed.replace(/_/g, " ");
}
function coerceDisplayValue(value) {
	if (value === null || value === void 0) return;
	if (typeof value === "string") {
		const trimmed = value.trim();
		if (!trimmed) return;
		const firstLine = trimmed.split(/\r?\n/)[0]?.trim() ?? "";
		if (!firstLine) return;
		return firstLine.length > 160 ? `${firstLine.slice(0, 157)}…` : firstLine;
	}
	if (typeof value === "boolean") return value ? "true" : void 0;
	if (typeof value === "number") {
		if (!Number.isFinite(value) || value === 0) return;
		return String(value);
	}
	if (Array.isArray(value)) {
		const values = value.map((item) => coerceDisplayValue(item)).filter((item) => Boolean(item));
		if (values.length === 0) return;
		const preview = values.slice(0, 3).join(", ");
		return values.length > 3 ? `${preview}…` : preview;
	}
}
function lookupValueByPath(args, path) {
	if (!args || typeof args !== "object") return;
	let current = args;
	for (const segment of path.split(".")) {
		if (!segment) return;
		if (!current || typeof current !== "object") return;
		current = current[segment];
	}
	return current;
}
function formatDetailKey(raw) {
	const last = raw.split(".").filter(Boolean).at(-1) ?? raw;
	const override = DETAIL_LABEL_OVERRIDES[last];
	if (override) return override;
	return last.replace(/_/g, " ").replace(/-/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").trim().toLowerCase() || last.toLowerCase();
}
function resolveDetailFromKeys(args, keys) {
	const entries = [];
	for (const key of keys) {
		const display = coerceDisplayValue(lookupValueByPath(args, key));
		if (!display) continue;
		entries.push({
			label: formatDetailKey(key),
			value: display
		});
	}
	if (entries.length === 0) return;
	if (entries.length === 1) return entries[0].value;
	const seen = /* @__PURE__ */ new Set();
	const unique = [];
	for (const entry of entries) {
		const token = `${entry.label}:${entry.value}`;
		if (seen.has(token)) continue;
		seen.add(token);
		unique.push(entry);
	}
	if (unique.length === 0) return;
	return unique.slice(0, MAX_DETAIL_ENTRIES).map((entry) => `${entry.label} ${entry.value}`).join(" · ");
}
function resolveReadDetail(args) {
	if (!args || typeof args !== "object") return;
	const record = args;
	const path = typeof record.path === "string" ? record.path : void 0;
	if (!path) return;
	const offset = typeof record.offset === "number" ? record.offset : void 0;
	const limit = typeof record.limit === "number" ? record.limit : void 0;
	if (offset !== void 0 && limit !== void 0) return `${path}:${offset}-${offset + limit}`;
	return path;
}
function resolveWriteDetail(args) {
	if (!args || typeof args !== "object") return;
	const record = args;
	return typeof record.path === "string" ? record.path : void 0;
}
function resolveActionSpec(spec, action) {
	if (!spec || !action) return;
	return spec.actions?.[action] ?? void 0;
}
function resolveToolDisplay(params) {
	const name = normalizeToolName(params.name);
	const key = name.toLowerCase();
	const spec = TOOL_MAP[key];
	const emoji = spec?.emoji ?? FALLBACK.emoji ?? "🧩";
	const title = spec?.title ?? defaultTitle(name);
	const label = spec?.label ?? title;
	const actionRaw = params.args && typeof params.args === "object" ? params.args.action : void 0;
	const action = typeof actionRaw === "string" ? actionRaw.trim() : void 0;
	const actionSpec = resolveActionSpec(spec, action);
	const verb = normalizeVerb(actionSpec?.label ?? action);
	let detail;
	if (key === "read") detail = resolveReadDetail(params.args);
	if (!detail && (key === "write" || key === "edit" || key === "attach")) detail = resolveWriteDetail(params.args);
	const detailKeys = actionSpec?.detailKeys ?? spec?.detailKeys ?? FALLBACK.detailKeys ?? [];
	if (!detail && detailKeys.length > 0) detail = resolveDetailFromKeys(params.args, detailKeys);
	if (!detail && params.meta) detail = params.meta;
	if (detail) detail = shortenHomeInString(detail);
	return {
		name,
		emoji,
		title,
		label,
		verb,
		detail
	};
}
function formatToolDetail(display) {
	const parts = [];
	if (display.verb) parts.push(display.verb);
	if (display.detail) parts.push(redactToolDetail(display.detail));
	if (parts.length === 0) return;
	return parts.join(" · ");
}

//#endregion
export { resolveToolDisplay as n, formatToolDetail as t };