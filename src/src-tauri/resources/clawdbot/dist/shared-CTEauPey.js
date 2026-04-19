import { i as normalizeLowercaseStringOrEmpty, o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { b as isSubagentSessionKey, x as parseAgentSessionKey } from "./session-key-Bh1lMwK5.js";
import { t as getActivePluginChannelRegistry } from "./runtime-BB1a2aCy.js";
import { m as subagentRuns, s as countPendingDescendantRunsFromRuns, t as getSubagentRunsSnapshotForRead } from "./subagent-registry-state-Dyk_jaON.js";
import { t as extractTextFromChatContent } from "./chat-content-B2Cx1lHu.js";
import { r as callGateway } from "./call-BA3do6C0.js";
import { n as looksLikeSessionId } from "./session-id-RmePhKuR.js";
import { l as resolveInternalSessionKey, u as resolveMainSessionAlias } from "./sessions-helpers-CBIn5ORF.js";
import { n as sanitizeTextContent } from "./chat-history-text-C5anYCs7.js";
import { t as resolveStoredSubagentCapabilities } from "./subagent-capabilities-C1AtAm9u.js";
import { a as formatRunStatus, i as formatRunLabel, s as resolveSubagentTargetFromRuns } from "./subagents-format-BNFotQVC.js";
import { n as formatTimeAgo } from "./format-relative-BErnCbgi.js";
//#region src/auto-reply/reply/channel-context.ts
function resolveCommandSurfaceChannel(params) {
	return normalizeOptionalLowercaseString(params.ctx.OriginatingChannel ?? params.command.channel ?? params.ctx.Surface ?? params.ctx.Provider) ?? "";
}
function resolveChannelAccountId(params) {
	const accountId = normalizeOptionalString(params.ctx.AccountId) ?? "";
	if (accountId) return accountId;
	const channel = resolveCommandSurfaceChannel(params);
	const plugin = getActivePluginChannelRegistry()?.channels.find((entry) => entry.plugin.id === channel)?.plugin;
	return normalizeOptionalString(plugin?.config.defaultAccountId?.(params.cfg)) || "default";
}
//#endregion
//#region src/auto-reply/reply/commands-subagents-text.ts
function extractMessageText(message) {
	const role = typeof message.role === "string" ? message.role : "";
	const shouldSanitize = role === "assistant";
	const text = extractTextFromChatContent(message.content, { sanitizeText: shouldSanitize ? sanitizeTextContent : void 0 });
	return text ? {
		role,
		text
	} : null;
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
		isActive: (entry) => !entry.endedAt || Math.max(0, countPendingDescendantRunsFromRuns(getSubagentRunsSnapshotForRead(subagentRuns), entry.childSessionKey)) > 0,
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
	const commandTarget = normalizeOptionalString(params.ctx.CommandTargetSessionKey);
	const commandSession = normalizeOptionalString(params.sessionKey);
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
		const action = normalizeLowercaseStringOrEmpty(actionRaw) || "list";
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
		const key = normalizeOptionalString((await callGateway({
			method: "sessions.resolve",
			params: attempt
		}))?.key) ?? "";
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
export { loadSubagentSessionEntry as a, resolveFocusTargetSession as c, resolveSubagentEntryForToken as d, resolveSubagentsAction as f, resolveCommandSurfaceChannel as h, formatTimestampWithAge as i, resolveHandledPrefix as l, resolveChannelAccountId as m, buildSubagentsHelp as n, resolveCommandSubagentController as o, stopWithText as p, formatLogLines as r, resolveDisplayStatus as s, COMMAND as t, resolveRequesterSessionKey as u };
