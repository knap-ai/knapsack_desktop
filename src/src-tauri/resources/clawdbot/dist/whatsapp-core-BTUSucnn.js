import { Ft as resolveWhatsAppAccount, Jb as adaptScopedAccountAccessor, gx as isWhatsAppGroupJid, vx as normalizeWhatsAppTarget } from "./pi-embedded-CbCYZxIb.js";
import { o as resolveChannelGroupRequireMention, s as resolveChannelGroupToolsPolicy } from "./config-runtime-BYNizC50.js";
import { d as missingTargetError } from "./channel-feedback-BSaFwmB3.js";
import { d as listResolvedDirectoryUserEntriesFromAllowFrom, u as listResolvedDirectoryGroupEntriesFromMapKeys } from "./directory-runtime-D9Y42mW-.js";
//#region extensions/whatsapp/src/auto-reply/constants.ts
const DEFAULT_WEB_MEDIA_BYTES = 5 * 1024 * 1024;
//#endregion
//#region extensions/whatsapp/src/group-policy.ts
function resolveWhatsAppGroupRequireMention(params) {
	return resolveChannelGroupRequireMention({
		cfg: params.cfg,
		channel: "whatsapp",
		groupId: params.groupId,
		accountId: params.accountId
	});
}
function resolveWhatsAppGroupToolPolicy(params) {
	return resolveChannelGroupToolsPolicy({
		cfg: params.cfg,
		channel: "whatsapp",
		groupId: params.groupId,
		accountId: params.accountId,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
}
//#endregion
//#region extensions/whatsapp/src/resolve-outbound-target.ts
function resolveWhatsAppOutboundTarget(params) {
	const trimmed = params.to?.trim() ?? "";
	const allowListRaw = (params.allowFrom ?? []).map((entry) => String(entry).trim()).filter(Boolean);
	const hasWildcard = allowListRaw.includes("*");
	const allowList = allowListRaw.filter((entry) => entry !== "*").map((entry) => normalizeWhatsAppTarget(entry)).filter((entry) => Boolean(entry));
	if (trimmed) {
		const normalizedTo = normalizeWhatsAppTarget(trimmed);
		if (!normalizedTo) return {
			ok: false,
			error: missingTargetError("WhatsApp", "<E.164|group JID>")
		};
		if (isWhatsAppGroupJid(normalizedTo)) return {
			ok: true,
			to: normalizedTo
		};
		if (hasWildcard || allowList.length === 0) return {
			ok: true,
			to: normalizedTo
		};
		if (allowList.includes(normalizedTo)) return {
			ok: true,
			to: normalizedTo
		};
		return {
			ok: false,
			error: missingTargetError("WhatsApp", "<E.164|group JID>")
		};
	}
	return {
		ok: false,
		error: missingTargetError("WhatsApp", "<E.164|group JID>")
	};
}
//#endregion
//#region extensions/whatsapp/src/directory-config.ts
async function listWhatsAppDirectoryPeersFromConfig(params) {
	return listResolvedDirectoryUserEntriesFromAllowFrom({
		...params,
		resolveAccount: adaptScopedAccountAccessor(resolveWhatsAppAccount),
		resolveAllowFrom: (account) => account.allowFrom,
		normalizeId: (entry) => {
			const normalized = normalizeWhatsAppTarget(entry);
			if (!normalized || isWhatsAppGroupJid(normalized)) return null;
			return normalized;
		}
	});
}
async function listWhatsAppDirectoryGroupsFromConfig(params) {
	return listResolvedDirectoryGroupEntriesFromMapKeys({
		...params,
		resolveAccount: adaptScopedAccountAccessor(resolveWhatsAppAccount),
		resolveGroups: (account) => account.groups
	});
}
//#endregion
export { resolveWhatsAppGroupToolPolicy as a, resolveWhatsAppGroupRequireMention as i, listWhatsAppDirectoryPeersFromConfig as n, DEFAULT_WEB_MEDIA_BYTES as o, resolveWhatsAppOutboundTarget as r, listWhatsAppDirectoryGroupsFromConfig as t };
