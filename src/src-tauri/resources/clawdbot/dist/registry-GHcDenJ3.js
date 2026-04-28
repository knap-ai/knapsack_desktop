import { c as normalizeOptionalString, s as normalizeOptionalLowercaseString } from "./string-coerce-Bje8XVt9.js";
import { i as listBundledChannelCatalogEntries, n as CHAT_CHANNEL_ORDER, r as normalizeChatChannelId } from "./ids-C5uBFLeA.js";
import { t as getActivePluginChannelRegistryFromState } from "./runtime-channel-state-l9dosyQh.js";
import { t as buildManifestChannelMeta } from "./channel-meta-DZ7d0AiI.js";
//#region src/channels/chat-meta-shared.ts
const CHAT_CHANNEL_ID_SET = new Set(CHAT_CHANNEL_ORDER);
function toChatChannelMeta(params) {
	const label = normalizeOptionalString(params.channel.label);
	if (!label) throw new Error(`Missing label for bundled chat channel "${params.id}"`);
	return buildManifestChannelMeta({
		id: params.id,
		channel: params.channel,
		label,
		selectionLabel: normalizeOptionalString(params.channel.selectionLabel) || label,
		docsPath: normalizeOptionalString(params.channel.docsPath) || `/channels/${params.id}`,
		docsLabel: normalizeOptionalString(params.channel.docsLabel),
		blurb: normalizeOptionalString(params.channel.blurb) || "",
		detailLabel: normalizeOptionalString(params.channel.detailLabel),
		systemImage: normalizeOptionalString(params.channel.systemImage),
		arrayFieldMode: "non-empty",
		selectionDocsPrefixMode: "defined"
	});
}
function buildChatChannelMetaById() {
	const entries = /* @__PURE__ */ new Map();
	for (const entry of listBundledChannelCatalogEntries()) {
		const rawId = normalizeOptionalString(entry.id);
		if (!rawId || !CHAT_CHANNEL_ID_SET.has(rawId)) continue;
		const id = rawId;
		entries.set(id, toChatChannelMeta({
			id,
			channel: entry.channel
		}));
	}
	return Object.freeze(Object.fromEntries(entries));
}
//#endregion
//#region src/channels/chat-meta.ts
const CHAT_CHANNEL_META = buildChatChannelMetaById();
function listChatChannels() {
	return CHAT_CHANNEL_ORDER.map((id) => CHAT_CHANNEL_META[id]);
}
function getChatChannelMeta(id) {
	return CHAT_CHANNEL_META[id];
}
//#endregion
//#region src/channels/registry.ts
function listRegisteredChannelPluginEntries() {
	const channelRegistry = getActivePluginChannelRegistryFromState();
	if (channelRegistry && channelRegistry.channels && channelRegistry.channels.length > 0) return channelRegistry.channels;
	return [];
}
function findRegisteredChannelPluginEntry(normalizedKey) {
	return listRegisteredChannelPluginEntries().find((entry) => {
		const id = normalizeOptionalLowercaseString(entry.plugin.id ?? "") ?? "";
		if (id && id === normalizedKey) return true;
		return (entry.plugin.meta?.aliases ?? []).some((alias) => normalizeOptionalLowercaseString(alias) === normalizedKey);
	});
}
function findRegisteredChannelPluginEntryById(id) {
	const normalizedId = normalizeOptionalLowercaseString(id);
	if (!normalizedId) return;
	return listRegisteredChannelPluginEntries().find((entry) => normalizeOptionalLowercaseString(entry.plugin.id) === normalizedId);
}
function normalizeChannelId(raw) {
	return normalizeChatChannelId(raw);
}
function normalizeAnyChannelId(raw) {
	const key = normalizeOptionalLowercaseString(raw);
	if (!key) return null;
	return findRegisteredChannelPluginEntry(key)?.plugin.id ?? null;
}
function listRegisteredChannelPluginIds() {
	return listRegisteredChannelPluginEntries().flatMap((entry) => {
		const id = normalizeOptionalString(entry.plugin.id);
		return id ? [id] : [];
	});
}
function getRegisteredChannelPluginMeta(id) {
	return findRegisteredChannelPluginEntryById(id)?.plugin.meta ?? null;
}
function formatChannelPrimerLine(meta) {
	return `${meta.label}: ${meta.blurb}`;
}
function formatChannelSelectionLine(meta, docsLink) {
	const docsPrefix = meta.selectionDocsPrefix ?? "Docs:";
	const docsLabel = meta.docsLabel ?? meta.id;
	const docs = meta.selectionDocsOmitLabel ? docsLink(meta.docsPath) : docsLink(meta.docsPath, docsLabel);
	const extras = (meta.selectionExtras ?? []).filter(Boolean).join(" ");
	return `${meta.label} — ${meta.blurb} ${docsPrefix ? `${docsPrefix} ` : ""}${docs}${extras ? ` ${extras}` : ""}`;
}
//#endregion
export { normalizeAnyChannelId as a, listChatChannels as c, listRegisteredChannelPluginIds as i, buildChatChannelMetaById as l, formatChannelSelectionLine as n, normalizeChannelId as o, getRegisteredChannelPluginMeta as r, getChatChannelMeta as s, formatChannelPrimerLine as t };
