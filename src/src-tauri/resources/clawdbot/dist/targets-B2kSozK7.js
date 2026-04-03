import { T as parseAgentSessionKey, c as normalizeAgentId, w as isSubagentSessionKey } from "./session-key-D7XpmyVq.js";
import { l as resolveBundledPluginWorkspaceSourcePath } from "./chat-meta-Cdrnv7R-.js";
import { r as callGateway } from "./call-CQ0eH9Ew.js";
import { t as normalizeConversationText } from "./conversation-id-BY-PeLYS.js";
import { Fr as resolveInternalSessionKey, Hn as resolveStoredSubagentCapabilities, Ir as resolveMainSessionAlias, Jn as resolveSubagentTargetFromRuns, Kn as formatRunLabel, Lr as SESSION_ID_RE, Nr as sanitizeTextContent, Rr as looksLikeSessionId, qn as formatRunStatus, yt as countPendingDescendantRuns } from "./pi-embedded-BYdcxQ5A.js";
import { n as parseExplicitTargetForChannel } from "./target-parsing-CYsOfnR5.js";
import { E as extractTextFromChatContent } from "./minimax-vlm-uN3pFvTM.js";
import { n as formatTimeAgo } from "./format-relative-hwB9KFeB.js";
import { h as supportsAutomaticThreadBindingSpawn } from "./thread-bindings-policy-ypJ47uk9.js";
import { a as resolveConversationBindingThreadIdFromMessage, n as resolveConversationBindingChannelFromMessage, o as resolveEffectiveResetTargetSessionKey, r as resolveConversationBindingContextFromAcpCommand, t as resolveConversationBindingAccountIdFromMessage } from "./conversation-binding-input-CffXKaWJ.js";
import { n as toAcpRuntimeErrorText } from "./error-text-CtgJQqdg.js";
import { r as resolveBundledPluginInstallCommandHint } from "./bundled-sources-B9i5z3_o.js";
import { existsSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
//#region src/auto-reply/reply/commands-acp/context.ts
function resolveAcpCommandChannel(params) {
	return normalizeConversationText(resolveConversationBindingChannelFromMessage(params.ctx, params.command.channel)).toLowerCase();
}
function resolveAcpCommandAccountId(params) {
	return resolveConversationBindingAccountIdFromMessage(params.ctx);
}
function resolveAcpCommandThreadId(params) {
	return resolveConversationBindingThreadIdFromMessage(params.ctx);
}
function resolveAcpCommandConversationRef(params) {
	const resolved = resolveConversationBindingContextFromAcpCommand(params);
	if (!resolved) return null;
	return {
		conversationId: resolved.conversationId,
		...resolved.parentConversationId && resolved.parentConversationId !== resolved.conversationId ? { parentConversationId: resolved.parentConversationId } : {}
	};
}
function resolveAcpCommandConversationId(params) {
	return resolveAcpCommandConversationRef(params)?.conversationId;
}
function resolveAcpCommandBindingContext(params) {
	const conversationRef = resolveAcpCommandConversationRef(params);
	if (!conversationRef) return {
		channel: resolveAcpCommandChannel(params),
		accountId: resolveAcpCommandAccountId(params),
		threadId: resolveAcpCommandThreadId(params)
	};
	return {
		channel: resolveAcpCommandChannel(params),
		accountId: resolveAcpCommandAccountId(params),
		threadId: resolveAcpCommandThreadId(params),
		conversationId: conversationRef.conversationId,
		...conversationRef.parentConversationId ? { parentConversationId: conversationRef.parentConversationId } : {}
	};
}
//#endregion
//#region src/auto-reply/reply/commands-acp/install-hints.ts
function resolveConfiguredAcpBackendId(cfg) {
	return cfg.acp?.backend?.trim() || "acpx";
}
function resolveAcpInstallCommandHint(cfg) {
	const configured = cfg.acp?.runtime?.installCommand?.trim();
	if (configured) return configured;
	const workspaceDir = process.cwd();
	const backendId = resolveConfiguredAcpBackendId(cfg).toLowerCase();
	if (backendId === "acpx") {
		const workspaceLocalPath = resolveBundledPluginWorkspaceSourcePath({
			rootDir: workspaceDir,
			pluginId: backendId
		});
		if (workspaceLocalPath && existsSync(workspaceLocalPath)) return `openclaw plugins install ${workspaceLocalPath}`;
		const bundledInstallHint = resolveBundledPluginInstallCommandHint({
			pluginId: backendId,
			workspaceDir
		});
		if (bundledInstallHint) {
			const localPath = bundledInstallHint.replace(/^openclaw plugins install /u, "");
			const resolvedLocalPath = path.resolve(localPath);
			const relativeToWorkspace = path.relative(workspaceDir, resolvedLocalPath);
			if ((relativeToWorkspace.length === 0 || !relativeToWorkspace.startsWith("..") && !path.isAbsolute(relativeToWorkspace)) && existsSync(resolvedLocalPath)) return bundledInstallHint;
		}
		return "openclaw plugins install acpx";
	}
	return `Install and enable the plugin that provides ACP backend "${backendId}".`;
}
//#endregion
//#region src/auto-reply/reply/commands-acp/shared.ts
const COMMAND$1 = "/acp";
const ACP_SPAWN_USAGE = "Usage: /acp spawn [harness-id] [--mode persistent|oneshot] [--thread auto|here|off] [--bind here|off] [--cwd <path>] [--label <label>].";
const ACP_STEER_USAGE = "Usage: /acp steer [--session <session-key|session-id|session-label>] <instruction>";
const ACP_SET_MODE_USAGE = "Usage: /acp set-mode <mode> [session-key|session-id|session-label]";
const ACP_SET_USAGE = "Usage: /acp set <key> <value> [session-key|session-id|session-label]";
const ACP_CWD_USAGE = "Usage: /acp cwd <path> [session-key|session-id|session-label]";
const ACP_PERMISSIONS_USAGE = "Usage: /acp permissions <profile> [session-key|session-id|session-label]";
const ACP_TIMEOUT_USAGE = "Usage: /acp timeout <seconds> [session-key|session-id|session-label]";
const ACP_MODEL_USAGE = "Usage: /acp model <model-id> [session-key|session-id|session-label]";
const ACP_RESET_OPTIONS_USAGE = "Usage: /acp reset-options [session-key|session-id|session-label]";
const ACP_STATUS_USAGE = "Usage: /acp status [session-key|session-id|session-label]";
const ACP_INSTALL_USAGE = "Usage: /acp install";
const ACP_DOCTOR_USAGE = "Usage: /acp doctor";
const ACP_SESSIONS_USAGE = "Usage: /acp sessions";
const ACP_UNICODE_DASH_PREFIX_RE = /^[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D]+/;
function stopWithText$1(text) {
	return {
		shouldContinue: false,
		reply: { text }
	};
}
function resolveAcpAction(tokens) {
	const action = tokens[0]?.trim().toLowerCase();
	if (action === "spawn" || action === "cancel" || action === "steer" || action === "close" || action === "sessions" || action === "status" || action === "set-mode" || action === "set" || action === "cwd" || action === "permissions" || action === "timeout" || action === "model" || action === "reset-options" || action === "doctor" || action === "install" || action === "help") {
		tokens.shift();
		return action;
	}
	return "help";
}
function readOptionValue(params) {
	const token = normalizeAcpOptionToken(params.tokens[params.index] ?? "");
	if (token === params.flag) {
		const nextValue = normalizeAcpOptionToken(params.tokens[params.index + 1] ?? "");
		if (!nextValue || nextValue.startsWith("--")) return {
			matched: true,
			nextIndex: params.index + 1,
			error: `${params.flag} requires a value`
		};
		return {
			matched: true,
			value: nextValue,
			nextIndex: params.index + 2
		};
	}
	if (token.startsWith(`${params.flag}=`)) {
		const value = token.slice(`${params.flag}=`.length).trim();
		if (!value) return {
			matched: true,
			nextIndex: params.index + 1,
			error: `${params.flag} requires a value`
		};
		return {
			matched: true,
			value,
			nextIndex: params.index + 1
		};
	}
	return { matched: false };
}
function normalizeAcpOptionToken(raw) {
	const token = raw.trim();
	if (!token || token.startsWith("--")) return token;
	const dashPrefix = token.match(ACP_UNICODE_DASH_PREFIX_RE)?.[0];
	if (!dashPrefix) return token;
	return `--${token.slice(dashPrefix.length)}`;
}
function resolveDefaultSpawnThreadMode(params) {
	if (!supportsAutomaticThreadBindingSpawn(resolveAcpCommandChannel(params))) return "off";
	return resolveAcpCommandThreadId(params) ? "here" : "auto";
}
function parseSpawnInput(params, tokens) {
	const normalizedTokens = tokens.map((token) => normalizeAcpOptionToken(token));
	let mode = "persistent";
	let thread = resolveDefaultSpawnThreadMode(params);
	let sawThreadOption = false;
	let bind = "off";
	let cwd;
	let label;
	let rawAgentId;
	for (let i = 0; i < normalizedTokens.length;) {
		const token = normalizedTokens[i] ?? "";
		const modeOption = readOptionValue({
			tokens: normalizedTokens,
			index: i,
			flag: "--mode"
		});
		if (modeOption.matched) {
			if (modeOption.error) return {
				ok: false,
				error: `${modeOption.error}. ${ACP_SPAWN_USAGE}`
			};
			const raw = modeOption.value?.trim().toLowerCase();
			if (raw !== "persistent" && raw !== "oneshot") return {
				ok: false,
				error: `Invalid --mode value "${modeOption.value}". Use persistent or oneshot.`
			};
			mode = raw;
			i = modeOption.nextIndex;
			continue;
		}
		const bindOption = readOptionValue({
			tokens: normalizedTokens,
			index: i,
			flag: "--bind"
		});
		if (bindOption.matched) {
			if (bindOption.error) return {
				ok: false,
				error: `${bindOption.error}. ${ACP_SPAWN_USAGE}`
			};
			const raw = bindOption.value?.trim().toLowerCase();
			if (raw !== "here" && raw !== "off") return {
				ok: false,
				error: `Invalid --bind value "${bindOption.value}". Use here or off.`
			};
			bind = raw;
			i = bindOption.nextIndex;
			continue;
		}
		const threadOption = readOptionValue({
			tokens: normalizedTokens,
			index: i,
			flag: "--thread"
		});
		if (threadOption.matched) {
			if (threadOption.error) return {
				ok: false,
				error: `${threadOption.error}. ${ACP_SPAWN_USAGE}`
			};
			const raw = threadOption.value?.trim().toLowerCase();
			if (raw !== "auto" && raw !== "here" && raw !== "off") return {
				ok: false,
				error: `Invalid --thread value "${threadOption.value}". Use auto, here, or off.`
			};
			thread = raw;
			sawThreadOption = true;
			i = threadOption.nextIndex;
			continue;
		}
		const cwdOption = readOptionValue({
			tokens: normalizedTokens,
			index: i,
			flag: "--cwd"
		});
		if (cwdOption.matched) {
			if (cwdOption.error) return {
				ok: false,
				error: `${cwdOption.error}. ${ACP_SPAWN_USAGE}`
			};
			cwd = cwdOption.value?.trim();
			i = cwdOption.nextIndex;
			continue;
		}
		const labelOption = readOptionValue({
			tokens: normalizedTokens,
			index: i,
			flag: "--label"
		});
		if (labelOption.matched) {
			if (labelOption.error) return {
				ok: false,
				error: `${labelOption.error}. ${ACP_SPAWN_USAGE}`
			};
			label = labelOption.value?.trim();
			i = labelOption.nextIndex;
			continue;
		}
		if (token.startsWith("--")) return {
			ok: false,
			error: `Unknown option: ${token}. ${ACP_SPAWN_USAGE}`
		};
		if (!rawAgentId) {
			rawAgentId = token.trim();
			i += 1;
			continue;
		}
		return {
			ok: false,
			error: `Unexpected argument: ${token}. ${ACP_SPAWN_USAGE}`
		};
	}
	const fallbackAgent = params.cfg.acp?.defaultAgent?.trim() || "";
	const selectedAgent = (rawAgentId?.trim() || fallbackAgent).trim();
	if (!selectedAgent) return {
		ok: false,
		error: `ACP target harness id is required. Pass an ACP harness id (for example codex) or configure acp.defaultAgent. ${ACP_SPAWN_USAGE}`
	};
	const normalizedAgentId = normalizeAgentId(selectedAgent);
	if (bind !== "off" && !sawThreadOption) thread = "off";
	if (thread !== "off" && bind !== "off") return {
		ok: false,
		error: `Use either --thread or --bind for /acp spawn, not both. ${ACP_SPAWN_USAGE}`
	};
	return {
		ok: true,
		value: {
			agentId: normalizedAgentId,
			mode,
			thread,
			bind,
			cwd,
			label: label || void 0
		}
	};
}
function parseSteerInput(tokens) {
	const normalizedTokens = tokens.map((token) => normalizeAcpOptionToken(token));
	let sessionToken;
	const instructionTokens = [];
	for (let i = 0; i < normalizedTokens.length;) {
		const sessionOption = readOptionValue({
			tokens: normalizedTokens,
			index: i,
			flag: "--session"
		});
		if (sessionOption.matched) {
			if (sessionOption.error) return {
				ok: false,
				error: `${sessionOption.error}. ${ACP_STEER_USAGE}`
			};
			sessionToken = sessionOption.value?.trim() || void 0;
			i = sessionOption.nextIndex;
			continue;
		}
		instructionTokens.push(tokens[i] ?? "");
		i += 1;
	}
	const instruction = instructionTokens.join(" ").trim();
	if (!instruction) return {
		ok: false,
		error: ACP_STEER_USAGE
	};
	return {
		ok: true,
		value: {
			sessionToken,
			instruction
		}
	};
}
function parseSingleValueCommandInput(tokens, usage) {
	const value = tokens[0]?.trim() || "";
	if (!value) return {
		ok: false,
		error: usage
	};
	if (tokens.length > 2) return {
		ok: false,
		error: usage
	};
	return {
		ok: true,
		value: {
			value,
			sessionToken: tokens[1]?.trim() || void 0
		}
	};
}
function parseSetCommandInput(tokens) {
	const key = tokens[0]?.trim() || "";
	const value = tokens[1]?.trim() || "";
	if (!key || !value) return {
		ok: false,
		error: ACP_SET_USAGE
	};
	if (tokens.length > 3) return {
		ok: false,
		error: ACP_SET_USAGE
	};
	return {
		ok: true,
		value: {
			key,
			value,
			sessionToken: tokens[2]?.trim() || void 0
		}
	};
}
function parseOptionalSingleTarget(tokens, usage) {
	if (tokens.length > 1) return {
		ok: false,
		error: usage
	};
	const token = tokens[0]?.trim() || "";
	return {
		ok: true,
		...token ? { sessionToken: token } : {}
	};
}
function resolveAcpHelpText() {
	return [
		"ACP commands:",
		"-----",
		"/acp spawn [harness-id] [--mode persistent|oneshot] [--thread auto|here|off] [--bind here|off] [--cwd <path>] [--label <label>]",
		"/acp cancel [session-key|session-id|session-label]",
		"/acp steer [--session <session-key|session-id|session-label>] <instruction>",
		"/acp close [session-key|session-id|session-label]",
		"/acp status [session-key|session-id|session-label]",
		"/acp set-mode <mode> [session-key|session-id|session-label]",
		"/acp set <key> <value> [session-key|session-id|session-label]",
		"/acp cwd <path> [session-key|session-id|session-label]",
		"/acp permissions <profile> [session-key|session-id|session-label]",
		"/acp timeout <seconds> [session-key|session-id|session-label]",
		"/acp model <model-id> [session-key|session-id|session-label]",
		"/acp reset-options [session-key|session-id|session-label]",
		"/acp doctor",
		"/acp install",
		"/acp sessions",
		"",
		"Notes:",
		"- /acp spawn harness-id is an ACP runtime harness alias (for example codex), not an OpenClaw agents.list id.",
		"- Use --bind here to pin the current conversation to the ACP session without creating a child thread.",
		"- /focus and /unfocus also work with ACP session keys.",
		"- ACP dispatch of normal thread messages is controlled by acp.dispatch.enabled."
	].join("\n");
}
function formatRuntimeOptionsText(options) {
	const extras = options.backendExtras ? Object.entries(options.backendExtras).toSorted(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join(", ") : "";
	const parts = [
		options.runtimeMode ? `runtimeMode=${options.runtimeMode}` : null,
		options.model ? `model=${options.model}` : null,
		options.cwd ? `cwd=${options.cwd}` : null,
		options.permissionProfile ? `permissionProfile=${options.permissionProfile}` : null,
		typeof options.timeoutSeconds === "number" ? `timeoutSeconds=${options.timeoutSeconds}` : null,
		extras ? `extras={${extras}}` : null
	].filter(Boolean);
	if (parts.length === 0) return "(none)";
	return parts.join(", ");
}
function formatAcpCapabilitiesText(controls) {
	if (controls.length === 0) return "(none)";
	return controls.toSorted().join(", ");
}
function resolveCommandRequestId(params) {
	const value = params.ctx.MessageSidFull ?? params.ctx.MessageSid ?? params.ctx.MessageSidFirst ?? params.ctx.MessageSidLast;
	if (typeof value === "string" && value.trim()) return value.trim();
	if (typeof value === "number" || typeof value === "bigint") return String(value);
	return randomUUID();
}
function collectAcpErrorText(params) {
	return toAcpRuntimeErrorText({
		error: params.error,
		fallbackCode: params.fallbackCode,
		fallbackMessage: params.fallbackMessage
	});
}
async function withAcpCommandErrorBoundary(params) {
	try {
		const result = await params.run();
		return params.onSuccess(result);
	} catch (error) {
		return stopWithText$1(collectAcpErrorText({
			error,
			fallbackCode: params.fallbackCode,
			fallbackMessage: params.fallbackMessage
		}));
	}
}
//#endregion
//#region src/auto-reply/reply/channel-context.ts
function isDiscordSurface(params) {
	return resolveCommandSurfaceChannel(params) === "discord";
}
function isTelegramSurface(params) {
	return resolveCommandSurfaceChannel(params) === "telegram";
}
function isMatrixSurface(params) {
	return resolveCommandSurfaceChannel(params) === "matrix";
}
function resolveCommandSurfaceChannel(params) {
	const channel = params.ctx.OriginatingChannel ?? params.command.channel ?? params.ctx.Surface ?? params.ctx.Provider;
	return String(channel ?? "").trim().toLowerCase();
}
function resolveChannelAccountId(params) {
	return (typeof params.ctx.AccountId === "string" ? params.ctx.AccountId.trim() : "") || "default";
}
//#endregion
//#region src/auto-reply/reply/telegram-context.ts
function resolveTelegramConversationId(params) {
	const threadId = (params.ctx.MessageThreadId != null ? String(params.ctx.MessageThreadId).trim() : "") || void 0;
	const chatId = [
		typeof params.ctx.OriginatingTo === "string" ? params.ctx.OriginatingTo : "",
		typeof params.command.to === "string" ? params.command.to : "",
		typeof params.ctx.To === "string" ? params.ctx.To : ""
	].map((value) => value.trim()).filter(Boolean).map((candidate) => parseExplicitTargetForChannel("telegram", candidate)?.to.trim() ?? "").find((candidate) => candidate.length > 0);
	if (!chatId) return;
	if (threadId) return `${chatId}:topic:${threadId}`;
	if (chatId.startsWith("-")) return;
	return chatId;
}
//#endregion
//#region src/auto-reply/reply/commands-subagents/shared.ts
const COMMAND = "/subagents";
const COMMAND_KILL = "/kill";
const COMMAND_STEER = "/steer";
const COMMAND_TELL = "/tell";
const COMMAND_FOCUS = "/focus";
const COMMAND_UNFOCUS = "/unfocus";
const COMMAND_AGENTS = "/agents";
const ACTIONS = new Set([
	"list",
	"kill",
	"log",
	"send",
	"steer",
	"info",
	"spawn",
	"focus",
	"unfocus",
	"agents",
	"help"
]);
function resolveDisplayStatus(entry, options) {
	const pendingDescendants = Math.max(0, options?.pendingDescendants ?? 0);
	if (pendingDescendants > 0) return `active (waiting on ${pendingDescendants} ${pendingDescendants === 1 ? "child" : "children"})`;
	const status = formatRunStatus(entry);
	return status === "error" ? "failed" : status;
}
function formatTimestamp(valueMs) {
	if (!valueMs || !Number.isFinite(valueMs) || valueMs <= 0) return "n/a";
	return new Date(valueMs).toISOString();
}
function formatTimestampWithAge(valueMs) {
	if (!valueMs || !Number.isFinite(valueMs) || valueMs <= 0) return "n/a";
	return `${formatTimestamp(valueMs)} (${formatTimeAgo(Date.now() - valueMs, { fallback: "n/a" })})`;
}
function stopWithText(text) {
	return {
		shouldContinue: false,
		reply: { text }
	};
}
function stopWithUnknownTargetError(error) {
	return stopWithText(`⚠️ ${error ?? "Unknown subagent."}`);
}
function resolveSubagentTarget(runs, token) {
	return resolveSubagentTargetFromRuns({
		runs,
		token,
		recentWindowMinutes: 30,
		label: (entry) => formatRunLabel(entry),
		isActive: (entry) => !entry.endedAt || Math.max(0, countPendingDescendantRuns(entry.childSessionKey)) > 0,
		errors: {
			missingTarget: "Missing subagent id.",
			invalidIndex: (value) => `Invalid subagent index: ${value}`,
			unknownSession: (value) => `Unknown subagent session: ${value}`,
			ambiguousLabel: (value) => `Ambiguous subagent label: ${value}`,
			ambiguousLabelPrefix: (value) => `Ambiguous subagent label prefix: ${value}`,
			ambiguousRunIdPrefix: (value) => `Ambiguous run id prefix: ${value}`,
			unknownTarget: (value) => `Unknown subagent id: ${value}`
		}
	});
}
function resolveSubagentEntryForToken(runs, token) {
	const resolved = resolveSubagentTarget(runs, token);
	if (!resolved.entry) return { reply: stopWithUnknownTargetError(resolved.error) };
	return { entry: resolved.entry };
}
function resolveRequesterSessionKey(params, opts) {
	const commandTarget = params.ctx.CommandTargetSessionKey?.trim();
	const commandSession = params.sessionKey?.trim();
	const raw = opts?.preferCommandTarget ?? params.ctx.CommandSource === "native" ? commandTarget || commandSession : commandSession || commandTarget;
	if (!raw) return;
	const { mainKey, alias } = resolveMainSessionAlias(params.cfg);
	return resolveInternalSessionKey({
		key: raw,
		alias,
		mainKey
	});
}
function resolveCommandSubagentController(params, requesterKey) {
	if (!isSubagentSessionKey(requesterKey)) return {
		controllerSessionKey: requesterKey,
		callerSessionKey: requesterKey,
		callerIsSubagent: false,
		controlScope: "children"
	};
	return {
		controllerSessionKey: requesterKey,
		callerSessionKey: requesterKey,
		callerIsSubagent: true,
		controlScope: resolveStoredSubagentCapabilities(requesterKey, { cfg: params.cfg }).controlScope
	};
}
function resolveHandledPrefix(normalized) {
	return normalized.startsWith("/subagents") ? COMMAND : normalized.startsWith("/kill") ? COMMAND_KILL : normalized.startsWith("/steer") ? COMMAND_STEER : normalized.startsWith("/tell") ? COMMAND_TELL : normalized.startsWith("/focus") ? COMMAND_FOCUS : normalized.startsWith("/unfocus") ? COMMAND_UNFOCUS : normalized.startsWith("/agents") ? COMMAND_AGENTS : null;
}
function resolveSubagentsAction(params) {
	if (params.handledPrefix === "/subagents") {
		const [actionRaw] = params.restTokens;
		const action = actionRaw?.toLowerCase() || "list";
		if (!ACTIONS.has(action)) return null;
		params.restTokens.splice(0, 1);
		return action;
	}
	if (params.handledPrefix === "/kill") return "kill";
	if (params.handledPrefix === "/focus") return "focus";
	if (params.handledPrefix === "/unfocus") return "unfocus";
	if (params.handledPrefix === "/agents") return "agents";
	return "steer";
}
function resolveDiscordChannelIdForFocus(params) {
	const toCandidates = [
		typeof params.ctx.OriginatingTo === "string" ? params.ctx.OriginatingTo.trim() : "",
		typeof params.command.to === "string" ? params.command.to.trim() : "",
		typeof params.ctx.To === "string" ? params.ctx.To.trim() : ""
	].filter(Boolean);
	for (const candidate of toCandidates) {
		const target = parseExplicitTargetForChannel("discord", candidate);
		if (target?.chatType === "channel" && target.to) return target.to;
	}
}
async function resolveFocusTargetSession(params) {
	const subagentMatch = resolveSubagentTarget(params.runs, params.token);
	if (subagentMatch.entry) {
		const key = subagentMatch.entry.childSessionKey;
		return {
			targetKind: "subagent",
			targetSessionKey: key,
			agentId: parseAgentSessionKey(key)?.agentId ?? "main",
			label: formatRunLabel(subagentMatch.entry)
		};
	}
	const token = params.token.trim();
	if (!token) return null;
	const attempts = [];
	attempts.push({ key: token });
	if (looksLikeSessionId(token)) attempts.push({ sessionId: token });
	attempts.push({ label: token });
	for (const attempt of attempts) try {
		const resolved = await callGateway({
			method: "sessions.resolve",
			params: attempt
		});
		const key = typeof resolved?.key === "string" ? resolved.key.trim() : "";
		if (!key) continue;
		const parsed = parseAgentSessionKey(key);
		return {
			targetKind: key.includes(":subagent:") ? "subagent" : "acp",
			targetSessionKey: key,
			agentId: parsed?.agentId ?? "main",
			label: token
		};
	} catch {}
	return null;
}
function buildSubagentsHelp() {
	return [
		"Subagents",
		"Usage:",
		"- /subagents list",
		"- /subagents kill <id|#|all>",
		"- /subagents log <id|#> [limit] [tools]",
		"- /subagents info <id|#>",
		"- /subagents send <id|#> <message>",
		"- /subagents steer <id|#> <message>",
		"- /subagents spawn <agentId> <task> [--model <model>] [--thinking <level>]",
		"- /focus <subagent-label|session-key|session-id|session-label>",
		"- /unfocus",
		"- /agents",
		"- /session idle <duration|off>",
		"- /session max-age <duration|off>",
		"- /kill <id|#|all>",
		"- /steer <id|#> <message>",
		"- /tell <id|#> <message>",
		"",
		"Ids: use the list index (#), runId/session prefix, label, or full session key."
	].join("\n");
}
function extractMessageText(message) {
	const role = typeof message.role === "string" ? message.role : "";
	const shouldSanitize = role === "assistant";
	const text = extractTextFromChatContent(message.content, { sanitizeText: shouldSanitize ? sanitizeTextContent : void 0 });
	return text ? {
		role,
		text
	} : null;
}
function formatLogLines(messages) {
	const lines = [];
	for (const msg of messages) {
		const extracted = extractMessageText(msg);
		if (!extracted) continue;
		const label = extracted.role === "assistant" ? "Assistant" : "User";
		lines.push(`${label}: ${extracted.text}`);
	}
	return lines;
}
function loadSubagentSessionEntry(params, childKey, loaders, storeCache) {
	const parsed = parseAgentSessionKey(childKey);
	const storePath = loaders.resolveStorePath(params.cfg.session?.store, { agentId: parsed?.agentId });
	let store = storeCache?.get(storePath);
	if (!store) {
		store = loaders.loadSessionStore(storePath);
		storeCache?.set(storePath, store);
	}
	return {
		storePath,
		store,
		entry: store[childKey]
	};
}
//#endregion
//#region src/auto-reply/reply/commands-acp/targets.ts
async function resolveSessionKeyByToken(token) {
	const trimmed = token.trim();
	if (!trimmed) return null;
	const attempts = [{ key: trimmed }];
	if (SESSION_ID_RE.test(trimmed)) attempts.push({ sessionId: trimmed });
	attempts.push({ label: trimmed });
	for (const params of attempts) try {
		const resolved = await callGateway({
			method: "sessions.resolve",
			params,
			timeoutMs: 8e3
		});
		const key = typeof resolved?.key === "string" ? resolved.key.trim() : "";
		if (key) return key;
	} catch {}
	return null;
}
function resolveBoundAcpThreadSessionKey(params) {
	const activeSessionKey = (typeof params.ctx.CommandTargetSessionKey === "string" ? params.ctx.CommandTargetSessionKey.trim() : "") || params.sessionKey.trim();
	const bindingContext = resolveAcpCommandBindingContext(params);
	return resolveEffectiveResetTargetSessionKey({
		cfg: params.cfg,
		channel: bindingContext.channel,
		accountId: bindingContext.accountId,
		conversationId: bindingContext.conversationId,
		parentConversationId: bindingContext.parentConversationId,
		activeSessionKey,
		allowNonAcpBindingSessionKey: true,
		skipConfiguredFallbackWhenActiveSessionNonAcp: false
	});
}
async function resolveAcpTargetSessionKey(params) {
	const token = params.token?.trim() || "";
	if (token) {
		const resolved = await resolveSessionKeyByToken(token);
		if (!resolved) return {
			ok: false,
			error: `Unable to resolve session target: ${token}`
		};
		return {
			ok: true,
			sessionKey: resolved
		};
	}
	const threadBound = resolveBoundAcpThreadSessionKey(params.commandParams);
	if (threadBound) return {
		ok: true,
		sessionKey: threadBound
	};
	const fallback = resolveRequesterSessionKey(params.commandParams, { preferCommandTarget: true });
	if (!fallback) return {
		ok: false,
		error: "Missing session key."
	};
	return {
		ok: true,
		sessionKey: fallback
	};
}
//#endregion
export { ACP_SET_MODE_USAGE as A, parseSpawnInput as B, ACP_CWD_USAGE as C, ACP_PERMISSIONS_USAGE as D, ACP_MODEL_USAGE as E, formatAcpCapabilitiesText as F, stopWithText$1 as G, resolveAcpAction as H, formatRuntimeOptionsText as I, resolveConfiguredAcpBackendId as J, withAcpCommandErrorBoundary as K, parseOptionalSingleTarget as L, ACP_TIMEOUT_USAGE as M, COMMAND$1 as N, ACP_RESET_OPTIONS_USAGE as O, collectAcpErrorText as P, resolveAcpCommandThreadId as Q, parseSetCommandInput as R, resolveCommandSurfaceChannel as S, ACP_INSTALL_USAGE as T, resolveAcpHelpText as U, parseSteerInput as V, resolveCommandRequestId as W, resolveAcpCommandBindingContext as X, resolveAcpCommandAccountId as Y, resolveAcpCommandConversationId as Z, resolveTelegramConversationId as _, formatLogLines as a, isTelegramSurface as b, resolveCommandSubagentController as c, resolveFocusTargetSession as d, resolveHandledPrefix as f, stopWithText as g, resolveSubagentsAction as h, buildSubagentsHelp as i, ACP_STATUS_USAGE as j, ACP_SESSIONS_USAGE as k, resolveDiscordChannelIdForFocus as l, resolveSubagentEntryForToken as m, resolveBoundAcpThreadSessionKey as n, formatTimestampWithAge as o, resolveRequesterSessionKey as p, resolveAcpInstallCommandHint as q, COMMAND as r, loadSubagentSessionEntry as s, resolveAcpTargetSessionKey as t, resolveDisplayStatus as u, isDiscordSurface as v, ACP_DOCTOR_USAGE as w, resolveChannelAccountId as x, isMatrixSurface as y, parseSingleValueCommandInput as z };
