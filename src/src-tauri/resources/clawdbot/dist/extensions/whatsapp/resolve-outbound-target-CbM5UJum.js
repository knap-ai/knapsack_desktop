import { o as normalizeWhatsAppTarget, t as isWhatsAppGroupJid } from "./normalize-target-DzehiMvp.js";
import { missingTargetError } from "openclaw/plugin-sdk/channel-feedback";
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
export { resolveWhatsAppOutboundTarget as t };
