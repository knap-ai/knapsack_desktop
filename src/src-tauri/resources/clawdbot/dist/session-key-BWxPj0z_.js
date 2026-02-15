//#region src/sessions/session-key-utils.ts
function parseAgentSessionKey(sessionKey) {
	const raw = (sessionKey ?? "").trim();
	if (!raw) return null;
	const parts = raw.split(":").filter(Boolean);
	if (parts.length < 3) return null;
	if (parts[0] !== "agent") return null;
	const agentId = parts[1]?.trim();
	const rest = parts.slice(2).join(":");
	if (!agentId || !rest) return null;
	return {
		agentId,
		rest
	};
}
function isCronRunSessionKey(sessionKey) {
	const parsed = parseAgentSessionKey(sessionKey);
	if (!parsed) return false;
	return /^cron:[^:]+:run:[^:]+$/.test(parsed.rest);
}
function isSubagentSessionKey(sessionKey) {
	const raw = (sessionKey ?? "").trim();
	if (!raw) return false;
	if (raw.toLowerCase().startsWith("subagent:")) return true;
	const parsed = parseAgentSessionKey(raw);
	return Boolean((parsed?.rest ?? "").toLowerCase().startsWith("subagent:"));
}
function isAcpSessionKey(sessionKey) {
	const raw = (sessionKey ?? "").trim();
	if (!raw) return false;
	if (raw.toLowerCase().startsWith("acp:")) return true;
	const parsed = parseAgentSessionKey(raw);
	return Boolean((parsed?.rest ?? "").toLowerCase().startsWith("acp:"));
}
const THREAD_SESSION_MARKERS = [":thread:", ":topic:"];
function resolveThreadParentSessionKey(sessionKey) {
	const raw = (sessionKey ?? "").trim();
	if (!raw) return null;
	const normalized = raw.toLowerCase();
	let idx = -1;
	for (const marker of THREAD_SESSION_MARKERS) {
		const candidate = normalized.lastIndexOf(marker);
		if (candidate > idx) idx = candidate;
	}
	if (idx <= 0) return null;
	const parent = raw.slice(0, idx).trim();
	return parent ? parent : null;
}

//#endregion
//#region src/routing/session-key.ts
const DEFAULT_AGENT_ID = "main";
const DEFAULT_MAIN_KEY = "main";
const DEFAULT_ACCOUNT_ID = "default";
const VALID_ID_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/i;
const INVALID_CHARS_RE = /[^a-z0-9_-]+/g;
const LEADING_DASH_RE = /^-+/;
const TRAILING_DASH_RE = /-+$/;
function normalizeToken(value) {
	return (value ?? "").trim().toLowerCase();
}
function normalizeMainKey(value) {
	const trimmed = (value ?? "").trim();
	return trimmed ? trimmed.toLowerCase() : DEFAULT_MAIN_KEY;
}
function toAgentRequestSessionKey(storeKey) {
	const raw = (storeKey ?? "").trim();
	if (!raw) return;
	return parseAgentSessionKey(raw)?.rest ?? raw;
}
function toAgentStoreSessionKey(params) {
	const raw = (params.requestKey ?? "").trim();
	if (!raw || raw === DEFAULT_MAIN_KEY) return buildAgentMainSessionKey({
		agentId: params.agentId,
		mainKey: params.mainKey
	});
	const lowered = raw.toLowerCase();
	if (lowered.startsWith("agent:")) return lowered;
	if (lowered.startsWith("subagent:")) return `agent:${normalizeAgentId(params.agentId)}:${lowered}`;
	return `agent:${normalizeAgentId(params.agentId)}:${lowered}`;
}
function resolveAgentIdFromSessionKey(sessionKey) {
	return normalizeAgentId(parseAgentSessionKey(sessionKey)?.agentId ?? DEFAULT_AGENT_ID);
}
function classifySessionKeyShape(sessionKey) {
	const raw = (sessionKey ?? "").trim();
	if (!raw) return "missing";
	if (parseAgentSessionKey(raw)) return "agent";
	return raw.toLowerCase().startsWith("agent:") ? "malformed_agent" : "legacy_or_alias";
}
function normalizeAgentId(value) {
	const trimmed = (value ?? "").trim();
	if (!trimmed) return DEFAULT_AGENT_ID;
	if (VALID_ID_RE.test(trimmed)) return trimmed.toLowerCase();
	return trimmed.toLowerCase().replace(INVALID_CHARS_RE, "-").replace(LEADING_DASH_RE, "").replace(TRAILING_DASH_RE, "").slice(0, 64) || DEFAULT_AGENT_ID;
}
function sanitizeAgentId(value) {
	const trimmed = (value ?? "").trim();
	if (!trimmed) return DEFAULT_AGENT_ID;
	if (VALID_ID_RE.test(trimmed)) return trimmed.toLowerCase();
	return trimmed.toLowerCase().replace(INVALID_CHARS_RE, "-").replace(LEADING_DASH_RE, "").replace(TRAILING_DASH_RE, "").slice(0, 64) || DEFAULT_AGENT_ID;
}
function normalizeAccountId(value) {
	const trimmed = (value ?? "").trim();
	if (!trimmed) return DEFAULT_ACCOUNT_ID;
	if (VALID_ID_RE.test(trimmed)) return trimmed.toLowerCase();
	return trimmed.toLowerCase().replace(INVALID_CHARS_RE, "-").replace(LEADING_DASH_RE, "").replace(TRAILING_DASH_RE, "").slice(0, 64) || DEFAULT_ACCOUNT_ID;
}
function buildAgentMainSessionKey(params) {
	return `agent:${normalizeAgentId(params.agentId)}:${normalizeMainKey(params.mainKey)}`;
}
function buildAgentPeerSessionKey(params) {
	const peerKind = params.peerKind ?? "direct";
	if (peerKind === "direct") {
		const dmScope = params.dmScope ?? "main";
		let peerId = (params.peerId ?? "").trim();
		const linkedPeerId = dmScope === "main" ? null : resolveLinkedPeerId({
			identityLinks: params.identityLinks,
			channel: params.channel,
			peerId
		});
		if (linkedPeerId) peerId = linkedPeerId;
		peerId = peerId.toLowerCase();
		if (dmScope === "per-account-channel-peer" && peerId) {
			const channel = (params.channel ?? "").trim().toLowerCase() || "unknown";
			const accountId = normalizeAccountId(params.accountId);
			return `agent:${normalizeAgentId(params.agentId)}:${channel}:${accountId}:direct:${peerId}`;
		}
		if (dmScope === "per-channel-peer" && peerId) {
			const channel = (params.channel ?? "").trim().toLowerCase() || "unknown";
			return `agent:${normalizeAgentId(params.agentId)}:${channel}:direct:${peerId}`;
		}
		if (dmScope === "per-peer" && peerId) return `agent:${normalizeAgentId(params.agentId)}:direct:${peerId}`;
		return buildAgentMainSessionKey({
			agentId: params.agentId,
			mainKey: params.mainKey
		});
	}
	const channel = (params.channel ?? "").trim().toLowerCase() || "unknown";
	const peerId = ((params.peerId ?? "").trim() || "unknown").toLowerCase();
	return `agent:${normalizeAgentId(params.agentId)}:${channel}:${peerKind}:${peerId}`;
}
function resolveLinkedPeerId(params) {
	const identityLinks = params.identityLinks;
	if (!identityLinks) return null;
	const peerId = params.peerId.trim();
	if (!peerId) return null;
	const candidates = /* @__PURE__ */ new Set();
	const rawCandidate = normalizeToken(peerId);
	if (rawCandidate) candidates.add(rawCandidate);
	const channel = normalizeToken(params.channel);
	if (channel) {
		const scopedCandidate = normalizeToken(`${channel}:${peerId}`);
		if (scopedCandidate) candidates.add(scopedCandidate);
	}
	if (candidates.size === 0) return null;
	for (const [canonical, ids] of Object.entries(identityLinks)) {
		const canonicalName = canonical.trim();
		if (!canonicalName) continue;
		if (!Array.isArray(ids)) continue;
		for (const id of ids) {
			const normalized = normalizeToken(id);
			if (normalized && candidates.has(normalized)) return canonicalName;
		}
	}
	return null;
}
function buildGroupHistoryKey(params) {
	const channel = normalizeToken(params.channel) || "unknown";
	const accountId = normalizeAccountId(params.accountId);
	const peerId = params.peerId.trim().toLowerCase() || "unknown";
	return `${channel}:${accountId}:${params.peerKind}:${peerId}`;
}
function resolveThreadSessionKeys(params) {
	const threadId = (params.threadId ?? "").trim();
	if (!threadId) return {
		sessionKey: params.baseSessionKey,
		parentSessionKey: void 0
	};
	const normalizedThreadId = threadId.toLowerCase();
	return {
		sessionKey: params.useSuffix ?? true ? `${params.baseSessionKey}:thread:${normalizedThreadId}` : params.baseSessionKey,
		parentSessionKey: params.parentSessionKey
	};
}

//#endregion
export { isCronRunSessionKey as _, buildAgentPeerSessionKey as a, resolveThreadParentSessionKey as b, normalizeAccountId as c, resolveAgentIdFromSessionKey as d, resolveThreadSessionKeys as f, isAcpSessionKey as g, toAgentStoreSessionKey as h, buildAgentMainSessionKey as i, normalizeAgentId as l, toAgentRequestSessionKey as m, DEFAULT_AGENT_ID as n, buildGroupHistoryKey as o, sanitizeAgentId as p, DEFAULT_MAIN_KEY as r, classifySessionKeyShape as s, DEFAULT_ACCOUNT_ID as t, normalizeMainKey as u, isSubagentSessionKey as v, parseAgentSessionKey as y };