import { t as __exportAll } from "./rolldown-runtime-DUslC3ob.js";
import { o as resolveDiscordAccount } from "./accounts-zcI4mtzH.js";
import "./config-api-DMPzECzW.js";
import "./channel-api-D5SVa11v.js";
import "./outbound-session-route-Db2eI0ss.js";
import { A as createDiscordClient, O as parseAndResolveRecipient, d as resolveChannelId, f as resolveDiscordChannelType, r as buildDiscordSendError, t as SUPPRESS_NOTIFICATIONS_FLAG, v as stripUndefinedFields, y as toDiscordFileBlob } from "./send.shared-G5HPu1EM.js";
import { t as sendMessageDiscord } from "./send.outbound-BTnNj5k_.js";
import { i as buildDiscordComponentMessageFlags, l as resolveDiscordComponentAttachmentName, r as buildDiscordComponentMessage } from "./components-AfY8KcWW.js";
import "openclaw/plugin-sdk/account-id";
import "openclaw/plugin-sdk/secret-input";
import "openclaw/plugin-sdk/account-helpers";
import "openclaw/plugin-sdk/routing";
import "openclaw/plugin-sdk/channel-status";
import { assertMediaNotDataUrl, jsonResult, parseAvailableTags, readNumberParam, readReactionParams, readStringArrayParam, readStringParam, resolvePollMaxSelections, withNormalizedTimestamp } from "openclaw/plugin-sdk/channel-actions";
import { readBooleanParam as readBooleanParam$1 } from "openclaw/plugin-sdk/boolean-param";
import "openclaw/plugin-sdk/channel-config-helpers";
import "openclaw/plugin-sdk/channel-plugin-common";
import { loadOutboundMediaFromUrl } from "openclaw/plugin-sdk/outbound-media";
import { ChannelType, Routes } from "discord-api-types/v10";
import { serializePayload } from "@buape/carbon";
import { requireRuntimeConfig } from "openclaw/plugin-sdk/config-runtime";
import { recordChannelActivity } from "openclaw/plugin-sdk/infra-runtime";
import { resolveGlobalMap } from "openclaw/plugin-sdk/global-singleton";
//#region extensions/discord/src/components-registry.ts
const DEFAULT_COMPONENT_TTL_MS = 1800 * 1e3;
const DISCORD_COMPONENT_ENTRIES_KEY = Symbol.for("openclaw.discord.componentEntries");
const DISCORD_MODAL_ENTRIES_KEY = Symbol.for("openclaw.discord.modalEntries");
let componentEntries;
let modalEntries;
function getComponentEntries() {
	componentEntries ??= resolveGlobalMap(DISCORD_COMPONENT_ENTRIES_KEY);
	return componentEntries;
}
function getModalEntries() {
	modalEntries ??= resolveGlobalMap(DISCORD_MODAL_ENTRIES_KEY);
	return modalEntries;
}
function isExpired(entry, now) {
	return typeof entry.expiresAt === "number" && entry.expiresAt <= now;
}
function normalizeEntryTimestamps(entry, now, ttlMs) {
	const createdAt = entry.createdAt ?? now;
	const expiresAt = entry.expiresAt ?? createdAt + ttlMs;
	return {
		...entry,
		createdAt,
		expiresAt
	};
}
function registerEntries(entries, store, params) {
	for (const entry of entries) {
		const normalized = normalizeEntryTimestamps({
			...entry,
			messageId: params.messageId ?? entry.messageId
		}, params.now, params.ttlMs);
		store.set(entry.id, normalized);
	}
}
function resolveEntry(store, params) {
	const entry = store.get(params.id);
	if (!entry) return null;
	if (isExpired(entry, Date.now())) {
		store.delete(params.id);
		return null;
	}
	if (params.consume !== false) store.delete(params.id);
	return entry;
}
function registerDiscordComponentEntries(params) {
	const now = Date.now();
	const ttlMs = params.ttlMs ?? DEFAULT_COMPONENT_TTL_MS;
	registerEntries(params.entries, getComponentEntries(), {
		now,
		ttlMs,
		messageId: params.messageId
	});
	registerEntries(params.modals, getModalEntries(), {
		now,
		ttlMs,
		messageId: params.messageId
	});
}
function resolveDiscordComponentEntry(params) {
	return resolveEntry(getComponentEntries(), params);
}
function resolveDiscordModalEntry(params) {
	return resolveEntry(getModalEntries(), params);
}
//#endregion
//#region extensions/discord/src/send.components.ts
var send_components_exports = /* @__PURE__ */ __exportAll({
	editDiscordComponentMessage: () => editDiscordComponentMessage,
	registerBuiltDiscordComponentMessage: () => registerBuiltDiscordComponentMessage,
	sendDiscordComponentMessage: () => sendDiscordComponentMessage
});
const DISCORD_FORUM_LIKE_TYPES = new Set([ChannelType.GuildForum, ChannelType.GuildMedia]);
function extractComponentAttachmentNames(spec) {
	const names = [];
	for (const block of spec.blocks ?? []) if (block.type === "file") names.push(resolveDiscordComponentAttachmentName(block.file));
	return names;
}
function hasComponentAttachmentBlock(spec) {
	return (spec.blocks ?? []).some((block) => block.type === "file");
}
function withImplicitComponentAttachmentBlock(spec, attachmentName) {
	if (!attachmentName || hasComponentAttachmentBlock(spec)) return spec;
	return {
		...spec,
		blocks: [...spec.blocks ?? [], {
			type: "file",
			file: `attachment://${attachmentName}`
		}]
	};
}
function hasClassicOnlyBlocks(spec) {
	return (spec.blocks ?? []).every((block) => block.type === "text" || block.type === "file");
}
function hasUnsupportedClassicFeatures(spec) {
	return Boolean(spec.modal || spec.container);
}
function hasAtMostOneNonSpoilerFile(spec) {
	let fileBlockCount = 0;
	for (const block of spec.blocks ?? []) {
		if (block.type !== "file") continue;
		fileBlockCount += 1;
		if (block.spoiler) return false;
	}
	return fileBlockCount <= 1;
}
/**
* Keep the downgrade rules explicit because this path is only safe when the
* spec means exactly what a plain Discord message can represent.
*/
function getClassicDiscordMessageDecision(spec) {
	if (hasUnsupportedClassicFeatures(spec)) return {
		mode: "components",
		reason: "unsupported-feature"
	};
	if (!hasClassicOnlyBlocks(spec)) return {
		mode: "components",
		reason: "unsupported-block"
	};
	if (!hasAtMostOneNonSpoilerFile(spec)) return {
		mode: "components",
		reason: "multiple-or-spoiler-files"
	};
	return {
		mode: "classic",
		reason: "plain-text-single-file"
	};
}
function collapseClassicComponentText(spec) {
	const parts = [];
	const addPart = (value) => {
		if (typeof value !== "string") return;
		const trimmed = value.trim();
		if (!trimmed || parts.includes(trimmed)) return;
		parts.push(trimmed);
	};
	addPart(spec.text);
	for (const block of spec.blocks ?? []) if (block.type === "text") addPart(block.text);
	return parts.join("\n\n");
}
function registerBuiltDiscordComponentMessage(params) {
	registerDiscordComponentEntries({
		entries: params.buildResult.entries,
		modals: params.buildResult.modals,
		messageId: params.messageId
	});
}
async function buildDiscordComponentPayload(params) {
	const messageReference = params.opts.replyTo ? {
		message_id: params.opts.replyTo,
		fail_if_not_exists: false
	} : void 0;
	let spec = params.spec;
	let resolvedFileName;
	let files;
	if (params.opts.mediaUrl) {
		const media = await loadOutboundMediaFromUrl(params.opts.mediaUrl, {
			mediaAccess: params.opts.mediaAccess,
			mediaLocalRoots: params.opts.mediaLocalRoots,
			mediaReadFile: params.opts.mediaReadFile
		});
		resolvedFileName = params.opts.filename?.trim() || media.fileName || "upload";
		spec = withImplicitComponentAttachmentBlock(spec, resolvedFileName);
		files = [{
			data: toDiscordFileBlob(media.buffer),
			name: resolvedFileName
		}];
	}
	const attachmentNames = extractComponentAttachmentNames(spec);
	const uniqueAttachmentNames = [...new Set(attachmentNames)];
	if (uniqueAttachmentNames.length > 1) throw new Error("Discord component attachments currently support a single file. Use media-gallery for multiple files.");
	const expectedAttachmentName = uniqueAttachmentNames[0];
	if (expectedAttachmentName && resolvedFileName && expectedAttachmentName !== resolvedFileName) throw new Error(`Component file block expects attachment "${expectedAttachmentName}", but the uploaded file is "${resolvedFileName}". Update components.blocks[].file or provide a matching filename.`);
	if (!params.opts.mediaUrl && expectedAttachmentName) throw new Error("Discord component file blocks require a media attachment (media/path/filePath).");
	const buildResult = buildDiscordComponentMessage({
		spec,
		sessionKey: params.opts.sessionKey,
		agentId: params.opts.agentId,
		accountId: params.accountId
	});
	const flags = buildDiscordComponentMessageFlags(buildResult.components);
	const finalFlags = params.opts.silent ? (flags ?? 0) | SUPPRESS_NOTIFICATIONS_FLAG : flags ?? void 0;
	return {
		body: stripUndefinedFields({
			...serializePayload({
				components: buildResult.components,
				...finalFlags ? { flags: finalFlags } : {},
				...files ? { files } : {}
			}),
			...messageReference ? { message_reference: messageReference } : {}
		}),
		buildResult
	};
}
async function sendDiscordComponentMessage(to, spec, opts) {
	const classicDecision = getClassicDiscordMessageDecision(spec);
	if (opts.mediaUrl && classicDecision.mode === "classic") return await sendMessageDiscord(to, collapseClassicComponentText(spec), {
		cfg: opts.cfg,
		accountId: opts.accountId,
		token: opts.token,
		rest: opts.rest,
		mediaUrl: opts.mediaUrl,
		filename: opts.filename,
		mediaLocalRoots: opts.mediaLocalRoots,
		mediaReadFile: opts.mediaReadFile,
		mediaAccess: opts.mediaAccess,
		replyTo: opts.replyTo,
		silent: opts.silent,
		textLimit: opts.textLimit,
		maxLinesPerMessage: opts.maxLinesPerMessage,
		tableMode: opts.tableMode,
		chunkMode: opts.chunkMode
	});
	const cfg = requireRuntimeConfig(opts.cfg, "Discord component send");
	const accountInfo = resolveDiscordAccount({
		cfg,
		accountId: opts.accountId
	});
	const { token, rest, request } = createDiscordClient({
		...opts,
		cfg
	});
	const { channelId } = await resolveChannelId(rest, await parseAndResolveRecipient(to, cfg, opts.accountId), request);
	const channelType = await resolveDiscordChannelType(rest, channelId);
	if (channelType && DISCORD_FORUM_LIKE_TYPES.has(channelType)) throw new Error("Discord components are not supported in forum-style channels");
	const { body, buildResult } = await buildDiscordComponentPayload({
		spec,
		opts,
		accountId: accountInfo.accountId
	});
	let result;
	try {
		result = await request(() => rest.post(Routes.channelMessages(channelId), { body }), "components");
	} catch (err) {
		throw await buildDiscordSendError(err, {
			channelId,
			cfg,
			rest,
			token,
			hasMedia: Boolean(opts.mediaUrl)
		});
	}
	registerBuiltDiscordComponentMessage({
		buildResult,
		messageId: result.id
	});
	recordChannelActivity({
		channel: "discord",
		accountId: accountInfo.accountId,
		direction: "outbound"
	});
	return {
		messageId: result.id ?? "unknown",
		channelId: result.channel_id ?? channelId
	};
}
async function editDiscordComponentMessage(to, messageId, spec, opts) {
	const cfg = requireRuntimeConfig(opts.cfg, "Discord component edit");
	const accountInfo = resolveDiscordAccount({
		cfg,
		accountId: opts.accountId
	});
	const { token, rest, request } = createDiscordClient({
		...opts,
		cfg
	});
	const { channelId } = await resolveChannelId(rest, await parseAndResolveRecipient(to, cfg, opts.accountId), request);
	const { body, buildResult } = await buildDiscordComponentPayload({
		spec,
		opts,
		accountId: accountInfo.accountId
	});
	let result;
	try {
		result = await request(() => rest.patch(Routes.channelMessage(channelId, messageId), { body }), "components");
	} catch (err) {
		throw await buildDiscordSendError(err, {
			channelId,
			cfg,
			rest,
			token,
			hasMedia: Boolean(opts.mediaUrl)
		});
	}
	registerBuiltDiscordComponentMessage({
		buildResult,
		messageId: result.id ?? messageId
	});
	recordChannelActivity({
		channel: "discord",
		accountId: accountInfo.accountId,
		direction: "outbound"
	});
	return {
		messageId: result.id ?? messageId,
		channelId: result.channel_id ?? channelId
	};
}
//#endregion
export { resolveDiscordComponentEntry as a, jsonResult as c, readNumberParam as d, readReactionParams as f, withNormalizedTimestamp as g, resolvePollMaxSelections as h, send_components_exports as i, parseAvailableTags as l, readStringParam as m, registerBuiltDiscordComponentMessage as n, resolveDiscordModalEntry as o, readStringArrayParam as p, sendDiscordComponentMessage as r, assertMediaNotDataUrl as s, editDiscordComponentMessage as t, readBooleanParam$1 as u };
