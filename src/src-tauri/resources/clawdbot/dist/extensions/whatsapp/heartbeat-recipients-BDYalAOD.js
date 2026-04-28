import { r as resolveDefaultWhatsAppAccountId } from "./account-ids-DG18xddX.js";
import { a as resolveWhatsAppAccount } from "./accounts-BDqgpFEB.js";
import { normalizeE164 as normalizeE164$1 } from "openclaw/plugin-sdk/account-resolution";
import { DEFAULT_ACCOUNT_ID as DEFAULT_ACCOUNT_ID$1 } from "openclaw/plugin-sdk/account-id";
import { createPluginRuntimeStore } from "openclaw/plugin-sdk/runtime-store";
import { readChannelAllowFromStoreSync } from "openclaw/plugin-sdk/channel-pairing";
import { normalizeChannelId } from "openclaw/plugin-sdk/channel-targets";
import { loadSessionStore, resolveStorePath } from "openclaw/plugin-sdk/session-store-runtime";
//#region extensions/whatsapp/src/runtime.ts
const { setRuntime: setWhatsAppRuntime, getRuntime: getWhatsAppRuntime } = createPluginRuntimeStore({
	pluginId: "whatsapp",
	errorMessage: "WhatsApp runtime not initialized"
});
//#endregion
//#region extensions/whatsapp/src/heartbeat-recipients.ts
function getSessionRecipients(cfg) {
	if ((cfg.session?.scope ?? "per-sender") === "global") return [];
	const store = loadSessionStore(resolveStorePath(cfg.session?.store));
	const isGroupKey = (key) => key.includes(":group:") || key.includes(":channel:") || key.includes("@g.us");
	const isCronKey = (key) => key.startsWith("cron:");
	const recipients = Object.entries(store).filter(([key]) => key !== "global" && key !== "unknown").filter(([key]) => !isGroupKey(key) && !isCronKey(key)).map(([_, entry]) => ({
		to: normalizeChannelId(entry?.lastChannel) === "whatsapp" && entry?.lastTo ? normalizeE164$1(entry.lastTo) : "",
		updatedAt: entry?.updatedAt ?? 0
	})).filter(({ to }) => to.length > 1).toSorted((a, b) => b.updatedAt - a.updatedAt);
	const seen = /* @__PURE__ */ new Set();
	return recipients.filter((recipient) => {
		if (seen.has(recipient.to)) return false;
		seen.add(recipient.to);
		return true;
	});
}
function resolveWhatsAppHeartbeatRecipients(cfg, opts = {}) {
	if (opts.to) return {
		recipients: [normalizeE164$1(opts.to)],
		source: "flag"
	};
	const sessionRecipients = getSessionRecipients(cfg);
	const resolvedAccountId = opts.accountId?.trim() || resolveDefaultWhatsAppAccountId(cfg) || DEFAULT_ACCOUNT_ID$1;
	const configuredAllowFrom = (resolveWhatsAppAccount({
		cfg,
		accountId: resolvedAccountId
	}).allowFrom ?? []).filter((value) => value !== "*").map(normalizeE164$1);
	const storeAllowFrom = readChannelAllowFromStoreSync("whatsapp", process.env, resolvedAccountId).map(normalizeE164$1);
	const unique = (list) => [...new Set(list.filter(Boolean))];
	const allowFrom = unique([...configuredAllowFrom, ...storeAllowFrom]);
	if (opts.all) return {
		recipients: unique([...sessionRecipients.map((entry) => entry.to), ...allowFrom]),
		source: "all"
	};
	if (allowFrom.length > 0) {
		const allowSet = new Set(allowFrom);
		const authorizedSessionRecipients = sessionRecipients.map((entry) => entry.to).filter((recipient) => allowSet.has(recipient));
		if (authorizedSessionRecipients.length === 1) return {
			recipients: [authorizedSessionRecipients[0]],
			source: "session-single"
		};
		if (authorizedSessionRecipients.length > 1) return {
			recipients: authorizedSessionRecipients,
			source: "session-ambiguous"
		};
		return {
			recipients: allowFrom,
			source: "allowFrom"
		};
	}
	if (sessionRecipients.length === 1) return {
		recipients: [sessionRecipients[0].to],
		source: "session-single"
	};
	if (sessionRecipients.length > 1) return {
		recipients: sessionRecipients.map((entry) => entry.to),
		source: "session-ambiguous"
	};
	return {
		recipients: allowFrom,
		source: "allowFrom"
	};
}
//#endregion
export { getWhatsAppRuntime as n, setWhatsAppRuntime as r, resolveWhatsAppHeartbeatRecipients as t };
