import { D as parseThreadSessionSuffix, E as parseRawSessionConversationRef } from "./session-key-D7XpmyVq.js";
import { _ as resolveBundledPluginsDir, c as resolveBundledPluginPublicSurfacePath } from "./chat-meta-Cdrnv7R-.js";
import { o as normalizeChannelId } from "./registry-DTO_OK4F.js";
import { r as normalizeChannelId$1, t as getChannelPlugin } from "./registry-fiJfPVib.js";
import { o as tryLoadActivatedBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-D_0VC8Qr.js";
import { fileURLToPath } from "node:url";
//#region src/channels/plugins/session-conversation.ts
const OPENCLAW_PACKAGE_ROOT = fileURLToPath(new URL("../../..", import.meta.url));
const SESSION_KEY_API_ARTIFACT_BASENAME = "session-key-api.js";
function normalizeResolvedChannel(channel) {
	return normalizeChannelId$1(channel) ?? normalizeChannelId(channel) ?? channel.trim().toLowerCase();
}
function getMessagingAdapter(channel) {
	const normalizedChannel = normalizeResolvedChannel(channel);
	try {
		return getChannelPlugin(normalizedChannel)?.messaging;
	} catch {
		return;
	}
}
function dedupeConversationIds(values) {
	const seen = /* @__PURE__ */ new Set();
	const resolved = [];
	for (const value of values) {
		if (typeof value !== "string") continue;
		const trimmed = value.trim();
		if (!trimmed || seen.has(trimmed)) continue;
		seen.add(trimmed);
		resolved.push(trimmed);
	}
	return resolved;
}
function buildGenericConversationResolution(rawId) {
	const trimmed = rawId.trim();
	if (!trimmed) return null;
	const parsed = parseThreadSessionSuffix(trimmed);
	const id = (parsed.baseSessionKey ?? trimmed).trim();
	if (!id) return null;
	return {
		id,
		threadId: parsed.threadId,
		baseConversationId: id,
		parentConversationCandidates: dedupeConversationIds(parsed.threadId ? [parsed.baseSessionKey] : [])
	};
}
function normalizeSessionConversationResolution(resolved) {
	if (!resolved?.id?.trim()) return null;
	return {
		id: resolved.id.trim(),
		threadId: resolved.threadId?.trim() || void 0,
		baseConversationId: resolved.baseConversationId?.trim() || dedupeConversationIds(resolved.parentConversationCandidates ?? []).at(-1) || resolved.id.trim(),
		parentConversationCandidates: dedupeConversationIds(resolved.parentConversationCandidates ?? []),
		hasExplicitParentConversationCandidates: Object.hasOwn(resolved, "parentConversationCandidates")
	};
}
function resolveBundledSessionConversationFallback(params) {
	const dirName = normalizeResolvedChannel(params.channel);
	if (!resolveBundledPluginPublicSurfacePath({
		rootDir: OPENCLAW_PACKAGE_ROOT,
		bundledPluginsDir: resolveBundledPluginsDir(),
		dirName,
		artifactBasename: SESSION_KEY_API_ARTIFACT_BASENAME
	})) return null;
	const resolveSessionConversation = tryLoadActivatedBundledPluginPublicSurfaceModuleSync({
		dirName,
		artifactBasename: SESSION_KEY_API_ARTIFACT_BASENAME
	})?.resolveSessionConversation;
	if (typeof resolveSessionConversation !== "function") return null;
	return normalizeSessionConversationResolution(resolveSessionConversation({
		kind: params.kind,
		rawId: params.rawId
	}));
}
function resolveSessionConversationResolution(params) {
	const rawId = params.rawId.trim();
	if (!rawId) return null;
	const messaging = getMessagingAdapter(params.channel);
	const pluginResolved = normalizeSessionConversationResolution(messaging?.resolveSessionConversation?.({
		kind: params.kind,
		rawId
	}));
	const resolved = pluginResolved ?? resolveBundledSessionConversationFallback({
		channel: params.channel,
		kind: params.kind,
		rawId
	}) ?? buildGenericConversationResolution(rawId);
	if (!resolved) return null;
	const parentConversationCandidates = dedupeConversationIds(pluginResolved?.hasExplicitParentConversationCandidates ? resolved.parentConversationCandidates : messaging?.resolveParentConversationCandidates?.({
		kind: params.kind,
		rawId
	}) ?? resolved.parentConversationCandidates);
	const baseConversationId = parentConversationCandidates.at(-1) ?? resolved.baseConversationId ?? resolved.id;
	return {
		...resolved,
		baseConversationId,
		parentConversationCandidates
	};
}
function resolveSessionConversation(params) {
	return resolveSessionConversationResolution(params);
}
function buildBaseSessionKey(raw, id) {
	return `${raw.prefix}:${id}`;
}
function resolveSessionConversationRef(sessionKey) {
	const raw = parseRawSessionConversationRef(sessionKey);
	if (!raw) return null;
	const resolved = resolveSessionConversation(raw);
	if (!resolved) return null;
	return {
		channel: normalizeResolvedChannel(raw.channel),
		kind: raw.kind,
		rawId: raw.rawId,
		id: resolved.id,
		threadId: resolved.threadId,
		baseSessionKey: buildBaseSessionKey(raw, resolved.id),
		baseConversationId: resolved.baseConversationId,
		parentConversationCandidates: resolved.parentConversationCandidates
	};
}
function resolveSessionThreadInfo(sessionKey) {
	const resolved = resolveSessionConversationRef(sessionKey);
	if (!resolved) return parseThreadSessionSuffix(sessionKey);
	return {
		baseSessionKey: resolved.threadId ? resolved.baseSessionKey : sessionKey?.trim() || void 0,
		threadId: resolved.threadId
	};
}
function resolveSessionParentSessionKey(sessionKey) {
	const { baseSessionKey, threadId } = resolveSessionThreadInfo(sessionKey);
	if (!threadId) return null;
	return baseSessionKey ?? null;
}
//#endregion
export { resolveSessionThreadInfo as i, resolveSessionConversationRef as n, resolveSessionParentSessionKey as r, resolveSessionConversation as t };
