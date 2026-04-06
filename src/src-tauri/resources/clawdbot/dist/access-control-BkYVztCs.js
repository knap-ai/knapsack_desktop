import { d as isSelfChatMode, p as normalizeE164 } from "./utils-CE3P21nG.js";
import { r as logVerbose } from "./globals-BJZkpw-q.js";
import { c as loadConfig } from "./io-DhtVmzAJ.js";
import { a as warnMissingProviderGroupPolicyFallbackOnce, i as resolveOpenProviderRuntimeGroupPolicy, r as resolveDefaultGroupPolicy } from "./runtime-group-policy-Dj5ka44z.js";
import { d as upsertChannelPairingRequest } from "./pairing-store-DxNrxr_7.js";
import { n as readStoreAllowFromForDmPolicy, o as resolveDmGroupAccessWithLists } from "./dm-policy-shared-ikRqobo8.js";
import "./runtime-env-CoykX19-.js";
import "./config-runtime-CmISCurQ.js";
import "./conversation-runtime-DIsQmaYR.js";
import "./text-runtime-B0ZpmkER.js";
import "./security-runtime-DCa00BFS.js";
import { t as createChannelPairingChallengeIssuer } from "./channel-pairing-Nk7oRFrM.js";
import { s as resolveWhatsAppAccount } from "./accounts-C7z-45Me.js";
//#region extensions/whatsapp/src/inbound/access-control.ts
const PAIRING_REPLY_HISTORY_GRACE_MS = 3e4;
function resolveWhatsAppRuntimeGroupPolicy(params) {
	return resolveOpenProviderRuntimeGroupPolicy({
		providerConfigPresent: params.providerConfigPresent,
		groupPolicy: params.groupPolicy,
		defaultGroupPolicy: params.defaultGroupPolicy
	});
}
async function checkInboundAccessControl(params) {
	const cfg = loadConfig();
	const account = resolveWhatsAppAccount({
		cfg,
		accountId: params.accountId
	});
	const dmPolicy = account.dmPolicy ?? "pairing";
	const configuredAllowFrom = account.allowFrom ?? [];
	const storeAllowFrom = await readStoreAllowFromForDmPolicy({
		provider: "whatsapp",
		accountId: account.accountId,
		dmPolicy
	});
	const defaultAllowFrom = configuredAllowFrom.length === 0 && params.selfE164 ? [params.selfE164] : [];
	const dmAllowFrom = configuredAllowFrom.length > 0 ? configuredAllowFrom : defaultAllowFrom;
	const groupAllowFrom = account.groupAllowFrom ?? (configuredAllowFrom.length > 0 ? configuredAllowFrom : void 0);
	const isSamePhone = params.from === params.selfE164;
	const isSelfChat = account.selfChatMode ?? isSelfChatMode(params.selfE164, configuredAllowFrom);
	const pairingGraceMs = typeof params.pairingGraceMs === "number" && params.pairingGraceMs > 0 ? params.pairingGraceMs : PAIRING_REPLY_HISTORY_GRACE_MS;
	const suppressPairingReply = typeof params.connectedAtMs === "number" && typeof params.messageTimestampMs === "number" && params.messageTimestampMs < params.connectedAtMs - pairingGraceMs;
	const defaultGroupPolicy = resolveDefaultGroupPolicy(cfg);
	const { groupPolicy, providerMissingFallbackApplied } = resolveWhatsAppRuntimeGroupPolicy({
		providerConfigPresent: cfg.channels?.whatsapp !== void 0,
		groupPolicy: account.groupPolicy,
		defaultGroupPolicy
	});
	warnMissingProviderGroupPolicyFallbackOnce({
		providerMissingFallbackApplied,
		providerKey: "whatsapp",
		accountId: account.accountId,
		log: (message) => logVerbose(message)
	});
	const normalizedDmSender = normalizeE164(params.from);
	const normalizedGroupSender = typeof params.senderE164 === "string" ? normalizeE164(params.senderE164) : null;
	const access = resolveDmGroupAccessWithLists({
		isGroup: params.group,
		dmPolicy,
		groupPolicy,
		allowFrom: params.group ? configuredAllowFrom : dmAllowFrom,
		groupAllowFrom,
		storeAllowFrom,
		isSenderAllowed: (allowEntries) => {
			if (allowEntries.includes("*")) return true;
			const normalizedEntrySet = new Set(allowEntries.map((entry) => normalizeE164(String(entry))).filter((entry) => Boolean(entry)));
			if (!params.group && isSamePhone) return true;
			return params.group ? Boolean(normalizedGroupSender && normalizedEntrySet.has(normalizedGroupSender)) : normalizedEntrySet.has(normalizedDmSender);
		}
	});
	if (params.group && access.decision !== "allow") {
		if (access.reason === "groupPolicy=disabled") logVerbose("Blocked group message (groupPolicy: disabled)");
		else if (access.reason === "groupPolicy=allowlist (empty allowlist)") logVerbose("Blocked group message (groupPolicy: allowlist, no groupAllowFrom)");
		else logVerbose(`Blocked group message from ${params.senderE164 ?? "unknown sender"} (groupPolicy: allowlist)`);
		return {
			allowed: false,
			shouldMarkRead: false,
			isSelfChat,
			resolvedAccountId: account.accountId
		};
	}
	if (!params.group) {
		if (params.isFromMe && !isSamePhone) {
			logVerbose("Skipping outbound DM (fromMe); no pairing reply needed.");
			return {
				allowed: false,
				shouldMarkRead: false,
				isSelfChat,
				resolvedAccountId: account.accountId
			};
		}
		if (access.decision === "block" && access.reason === "dmPolicy=disabled") {
			logVerbose("Blocked dm (dmPolicy: disabled)");
			return {
				allowed: false,
				shouldMarkRead: false,
				isSelfChat,
				resolvedAccountId: account.accountId
			};
		}
		if (access.decision === "pairing" && !isSamePhone) {
			const candidate = params.from;
			if (suppressPairingReply) logVerbose(`Skipping pairing reply for historical DM from ${candidate}.`);
			else await createChannelPairingChallengeIssuer({
				channel: "whatsapp",
				upsertPairingRequest: async ({ id, meta }) => await upsertChannelPairingRequest({
					channel: "whatsapp",
					id,
					accountId: account.accountId,
					meta
				})
			})({
				senderId: candidate,
				senderIdLine: `Your WhatsApp phone number: ${candidate}`,
				meta: { name: (params.pushName ?? "").trim() || void 0 },
				onCreated: () => {
					logVerbose(`whatsapp pairing request sender=${candidate} name=${params.pushName ?? "unknown"}`);
				},
				sendPairingReply: async (text) => {
					await params.sock.sendMessage(params.remoteJid, { text });
				},
				onReplyError: (err) => {
					logVerbose(`whatsapp pairing reply failed for ${candidate}: ${String(err)}`);
				}
			});
			return {
				allowed: false,
				shouldMarkRead: false,
				isSelfChat,
				resolvedAccountId: account.accountId
			};
		}
		if (access.decision !== "allow") {
			logVerbose(`Blocked unauthorized sender ${params.from} (dmPolicy=${dmPolicy})`);
			return {
				allowed: false,
				shouldMarkRead: false,
				isSelfChat,
				resolvedAccountId: account.accountId
			};
		}
	}
	return {
		allowed: true,
		shouldMarkRead: true,
		isSelfChat,
		resolvedAccountId: account.accountId
	};
}
const __testing = { resolveWhatsAppRuntimeGroupPolicy };
//#endregion
export { checkInboundAccessControl as n, __testing as t };
