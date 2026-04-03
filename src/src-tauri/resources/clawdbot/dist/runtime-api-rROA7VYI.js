import { p as normalizeE164 } from "./utils-CE3P21nG.js";
import { n as missingTargetError } from "./target-errors-B-DHXiI8.js";
import { t as loadWebMedia } from "./web-media-4TOxrRxF.js";
import { t as resolveReactionLevel } from "./text-runtime-B0ZpmkER.js";
import "./account-resolution-CahYTlaB.js";
import "./web-media-DPyBx-37.js";
import "./whatsapp-core-R685X6IP.js";
import "./whatsapp-shared-CBKcRrIP.js";
import { u as resolveMergedWhatsAppAccountConfig } from "./accounts-C7z-45Me.js";
//#region extensions/whatsapp/src/normalize-target.ts
const WHATSAPP_USER_JID_RE = /^(\d+)(?::\d+)?@s\.whatsapp\.net$/i;
const WHATSAPP_LID_RE = /^(\d+)@lid$/i;
function stripWhatsAppTargetPrefixes(value) {
	let candidate = value.trim();
	for (;;) {
		const before = candidate;
		candidate = candidate.replace(/^whatsapp:/i, "").trim();
		if (candidate === before) return candidate;
	}
}
function isWhatsAppGroupJid(value) {
	const candidate = stripWhatsAppTargetPrefixes(value);
	if (!candidate.toLowerCase().endsWith("@g.us")) return false;
	const localPart = candidate.slice(0, candidate.length - 5);
	if (!localPart || localPart.includes("@")) return false;
	return /^[0-9]+(-[0-9]+)*$/.test(localPart);
}
function isWhatsAppUserTarget(value) {
	const candidate = stripWhatsAppTargetPrefixes(value);
	return WHATSAPP_USER_JID_RE.test(candidate) || WHATSAPP_LID_RE.test(candidate);
}
function extractUserJidPhone(jid) {
	const userMatch = jid.match(WHATSAPP_USER_JID_RE);
	if (userMatch) return userMatch[1];
	const lidMatch = jid.match(WHATSAPP_LID_RE);
	if (lidMatch) return lidMatch[1];
	return null;
}
function normalizeWhatsAppTarget(value) {
	const candidate = stripWhatsAppTargetPrefixes(value);
	if (!candidate) return null;
	if (isWhatsAppGroupJid(candidate)) return `${candidate.slice(0, candidate.length - 5)}@g.us`;
	if (isWhatsAppUserTarget(candidate)) {
		const phone = extractUserJidPhone(candidate);
		if (!phone) return null;
		const normalized = normalizeE164(phone);
		return normalized.length > 1 ? normalized : null;
	}
	if (candidate.includes("@")) return null;
	const normalized = normalizeE164(candidate);
	return normalized.length > 1 ? normalized : null;
}
//#endregion
//#region extensions/whatsapp/src/resolve-outbound-target.ts
function whatsappAllowFromPolicyError(target) {
	return /* @__PURE__ */ new Error(`Target "${target}" is not listed in the configured WhatsApp allowFrom policy.`);
}
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
			error: whatsappAllowFromPolicyError(normalizedTo)
		};
	}
	return {
		ok: false,
		error: missingTargetError("WhatsApp", "<E.164|group JID>")
	};
}
//#endregion
//#region extensions/whatsapp/src/reaction-level.ts
/** Resolve the effective reaction level and its implications for WhatsApp. */
function resolveWhatsAppReactionLevel(params) {
	return resolveReactionLevel({
		value: resolveMergedWhatsAppAccountConfig({
			cfg: params.cfg,
			accountId: params.accountId
		}).reactionLevel,
		defaultLevel: "minimal",
		invalidFallback: "minimal"
	});
}
//#endregion
//#region extensions/whatsapp/src/runtime-api.ts
async function loadOutboundMediaFromUrl(mediaUrl, options = {}) {
	const readFile = options.mediaAccess?.readFile ?? options.mediaReadFile;
	const localRoots = options.mediaAccess?.localRoots?.length && options.mediaAccess.localRoots.length > 0 ? options.mediaAccess.localRoots : options.mediaLocalRoots && options.mediaLocalRoots.length > 0 ? options.mediaLocalRoots : void 0;
	return await loadWebMedia(mediaUrl, readFile ? {
		...options.maxBytes !== void 0 ? { maxBytes: options.maxBytes } : {},
		localRoots: "any",
		readFile,
		hostReadCapability: true
	} : {
		...options.maxBytes !== void 0 ? { maxBytes: options.maxBytes } : {},
		...localRoots ? { localRoots } : {}
	});
}
//#endregion
export { isWhatsAppUserTarget as a, isWhatsAppGroupJid as i, resolveWhatsAppReactionLevel as n, normalizeWhatsAppTarget as o, resolveWhatsAppOutboundTarget as r, loadOutboundMediaFromUrl as t };
