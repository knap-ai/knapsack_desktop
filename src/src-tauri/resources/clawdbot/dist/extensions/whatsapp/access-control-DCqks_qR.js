import { a as resolveWhatsAppAccount } from "./accounts-BDqgpFEB.js";
import { r as isSelfChatMode, t as text_runtime_exports } from "./text-runtime-BvOFWrFo.js";
import { a as getSelfIdentity, o as getSenderIdentity } from "./identity-BiH3hhFs.js";
import { t as resolveWhatsAppRuntimeGroupPolicy } from "./runtime-group-policy-CQymYAt5.js";
import { defaultRuntime } from "openclaw/plugin-sdk/runtime-env";
import { resolveChannelGroupPolicy, resolveChannelGroupRequireMention } from "openclaw/plugin-sdk/channel-policy";
import { createChannelPairingChallengeIssuer } from "openclaw/plugin-sdk/channel-pairing";
import { resolveGroupSessionKey } from "openclaw/plugin-sdk/session-store-runtime";
import { upsertChannelPairingRequest } from "openclaw/plugin-sdk/conversation-runtime";
import { resolveDefaultGroupPolicy, warnMissingProviderGroupPolicyFallbackOnce } from "openclaw/plugin-sdk/runtime-group-policy";
import { readStoreAllowFromForDmPolicy, resolveDmGroupAccessWithCommandGate, resolveDmGroupAccessWithLists, resolveEffectiveAllowFromLists } from "openclaw/plugin-sdk/security-runtime";
//#region extensions/whatsapp/src/inbound-policy.ts
function resolveGroupConversationId(conversationId) {
	return resolveGroupSessionKey({
		From: conversationId,
		ChatType: "group",
		Provider: "whatsapp"
	})?.id ?? conversationId;
}
function isNormalizedSenderAllowed(allowEntries, sender) {
	if (allowEntries.includes("*")) return true;
	const normalizedSender = (0, text_runtime_exports.normalizeE164)(sender ?? "");
	if (!normalizedSender) return false;
	return new Set(allowEntries.map((entry) => (0, text_runtime_exports.normalizeE164)(entry)).filter((entry) => Boolean(entry))).has(normalizedSender);
}
function buildResolvedWhatsAppGroupConfig(params) {
	return { channels: { whatsapp: {
		groupPolicy: params.groupPolicy,
		groups: params.groups
	} } };
}
function resolveWhatsAppInboundPolicy(params) {
	const account = resolveWhatsAppAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	const configuredAllowFrom = account.allowFrom ?? [];
	const dmPolicy = account.dmPolicy ?? "pairing";
	const dmAllowFrom = configuredAllowFrom.length > 0 ? configuredAllowFrom : params.selfE164 ? [params.selfE164] : [];
	const groupAllowFrom = account.groupAllowFrom ?? (configuredAllowFrom.length > 0 ? configuredAllowFrom : void 0) ?? [];
	const { effectiveGroupAllowFrom } = resolveEffectiveAllowFromLists({
		allowFrom: configuredAllowFrom,
		groupAllowFrom
	});
	const defaultGroupPolicy = resolveDefaultGroupPolicy(params.cfg);
	const { groupPolicy, providerMissingFallbackApplied } = resolveWhatsAppRuntimeGroupPolicy({
		providerConfigPresent: params.cfg.channels?.whatsapp !== void 0,
		groupPolicy: account.groupPolicy,
		defaultGroupPolicy
	});
	const resolvedGroupCfg = buildResolvedWhatsAppGroupConfig({
		groupPolicy,
		groups: account.groups
	});
	const isSamePhone = (value) => typeof value === "string" && typeof params.selfE164 === "string" && value === params.selfE164;
	return {
		account,
		dmPolicy,
		groupPolicy,
		configuredAllowFrom,
		dmAllowFrom,
		groupAllowFrom,
		isSelfChat: account.selfChatMode ?? isSelfChatMode(params.selfE164, configuredAllowFrom),
		providerMissingFallbackApplied,
		shouldReadStorePairingApprovals: dmPolicy !== "allowlist",
		isSamePhone,
		isDmSenderAllowed: (allowEntries, sender) => isSamePhone(sender) || isNormalizedSenderAllowed(allowEntries, sender),
		isGroupSenderAllowed: (allowEntries, sender) => isNormalizedSenderAllowed(allowEntries, sender),
		resolveConversationGroupPolicy: (conversationId) => resolveChannelGroupPolicy({
			cfg: resolvedGroupCfg,
			channel: "whatsapp",
			groupId: resolveGroupConversationId(conversationId),
			hasGroupAllowFrom: effectiveGroupAllowFrom.length > 0
		}),
		resolveConversationRequireMention: (conversationId) => resolveChannelGroupRequireMention({
			cfg: resolvedGroupCfg,
			channel: "whatsapp",
			groupId: resolveGroupConversationId(conversationId)
		})
	};
}
async function resolveWhatsAppCommandAuthorized(params) {
	const useAccessGroups = params.cfg.commands?.useAccessGroups !== false;
	if (!useAccessGroups) return true;
	const self = getSelfIdentity(params.msg);
	const policy = params.policy ?? resolveWhatsAppInboundPolicy({
		cfg: params.cfg,
		accountId: params.msg.accountId,
		selfE164: self.e164 ?? null
	});
	const isGroup = params.msg.chatType === "group";
	const sender = getSenderIdentity(params.msg);
	const dmSender = sender.e164 ?? params.msg.from ?? "";
	const groupSender = sender.e164 ?? "";
	if (!(0, text_runtime_exports.normalizeE164)(isGroup ? groupSender : dmSender)) return false;
	const storeAllowFrom = isGroup || !policy.shouldReadStorePairingApprovals ? [] : await readStoreAllowFromForDmPolicy({
		provider: "whatsapp",
		accountId: policy.account.accountId,
		dmPolicy: policy.dmPolicy,
		shouldRead: policy.shouldReadStorePairingApprovals
	});
	return resolveDmGroupAccessWithCommandGate({
		isGroup,
		dmPolicy: policy.dmPolicy,
		groupPolicy: policy.groupPolicy,
		allowFrom: policy.dmAllowFrom,
		groupAllowFrom: policy.groupAllowFrom,
		storeAllowFrom,
		isSenderAllowed: (allowEntries) => isGroup ? policy.isGroupSenderAllowed(allowEntries, groupSender) : policy.isDmSenderAllowed(allowEntries, dmSender),
		command: {
			useAccessGroups,
			allowTextCommands: true,
			hasControlCommand: true
		}
	}).commandAuthorized;
}
//#endregion
//#region extensions/whatsapp/src/inbound/access-control.ts
const PAIRING_REPLY_HISTORY_GRACE_MS = 3e4;
function logWhatsAppVerbose(enabled, message) {
	if (!enabled) return;
	defaultRuntime.log(message);
}
async function checkInboundAccessControl(params) {
	const policy = resolveWhatsAppInboundPolicy({
		cfg: params.cfg,
		accountId: params.accountId,
		selfE164: params.selfE164
	});
	const storeAllowFrom = await readStoreAllowFromForDmPolicy({
		provider: "whatsapp",
		accountId: policy.account.accountId,
		dmPolicy: policy.dmPolicy,
		shouldRead: policy.shouldReadStorePairingApprovals
	});
	const pairingGraceMs = typeof params.pairingGraceMs === "number" && params.pairingGraceMs > 0 ? params.pairingGraceMs : PAIRING_REPLY_HISTORY_GRACE_MS;
	const suppressPairingReply = typeof params.connectedAtMs === "number" && typeof params.messageTimestampMs === "number" && params.messageTimestampMs < params.connectedAtMs - pairingGraceMs;
	warnMissingProviderGroupPolicyFallbackOnce({
		providerMissingFallbackApplied: policy.providerMissingFallbackApplied,
		providerKey: "whatsapp",
		accountId: policy.account.accountId,
		log: (message) => logWhatsAppVerbose(params.verbose, message)
	});
	const access = resolveDmGroupAccessWithLists({
		isGroup: params.group,
		dmPolicy: policy.dmPolicy,
		groupPolicy: policy.groupPolicy,
		allowFrom: params.group ? policy.configuredAllowFrom : policy.dmAllowFrom,
		groupAllowFrom: policy.groupAllowFrom,
		storeAllowFrom,
		isSenderAllowed: (allowEntries) => {
			return params.group ? policy.isGroupSenderAllowed(allowEntries, params.senderE164) : policy.isDmSenderAllowed(allowEntries, params.from);
		}
	});
	if (params.group && access.decision !== "allow") {
		if (access.reason === "groupPolicy=disabled") logWhatsAppVerbose(params.verbose, "Blocked group message (groupPolicy: disabled)");
		else if (access.reason === "groupPolicy=allowlist (empty allowlist)") logWhatsAppVerbose(params.verbose, "Blocked group message (groupPolicy: allowlist, no groupAllowFrom)");
		else logWhatsAppVerbose(params.verbose, `Blocked group message from ${params.senderE164 ?? "unknown sender"} (groupPolicy: allowlist)`);
		return {
			allowed: false,
			shouldMarkRead: false,
			isSelfChat: policy.isSelfChat,
			resolvedAccountId: policy.account.accountId
		};
	}
	if (!params.group) {
		if (params.isFromMe && !policy.isSamePhone(params.from)) {
			logWhatsAppVerbose(params.verbose, "Skipping outbound DM (fromMe); no pairing reply needed.");
			return {
				allowed: false,
				shouldMarkRead: false,
				isSelfChat: policy.isSelfChat,
				resolvedAccountId: policy.account.accountId
			};
		}
		if (access.decision === "block" && access.reason === "dmPolicy=disabled") {
			logWhatsAppVerbose(params.verbose, "Blocked dm (dmPolicy: disabled)");
			return {
				allowed: false,
				shouldMarkRead: false,
				isSelfChat: policy.isSelfChat,
				resolvedAccountId: policy.account.accountId
			};
		}
		if (access.decision === "pairing" && !policy.isSamePhone(params.from)) {
			const candidate = params.from;
			if (suppressPairingReply) logWhatsAppVerbose(params.verbose, `Skipping pairing reply for historical DM from ${candidate}.`);
			else await createChannelPairingChallengeIssuer({
				channel: "whatsapp",
				upsertPairingRequest: async ({ id, meta }) => await upsertChannelPairingRequest({
					channel: "whatsapp",
					id,
					accountId: policy.account.accountId,
					meta
				})
			})({
				senderId: candidate,
				senderIdLine: `Your WhatsApp phone number: ${candidate}`,
				meta: { name: (params.pushName ?? "").trim() || void 0 },
				onCreated: () => {
					logWhatsAppVerbose(params.verbose, `whatsapp pairing request sender=${candidate} name=${params.pushName ?? "unknown"}`);
				},
				sendPairingReply: async (text) => {
					await params.sock.sendMessage(params.remoteJid, { text });
				},
				onReplyError: (err) => {
					logWhatsAppVerbose(params.verbose, `whatsapp pairing reply failed for ${candidate}: ${String(err)}`);
				}
			});
			return {
				allowed: false,
				shouldMarkRead: false,
				isSelfChat: policy.isSelfChat,
				resolvedAccountId: policy.account.accountId
			};
		}
		if (access.decision !== "allow") {
			logWhatsAppVerbose(params.verbose, `Blocked unauthorized sender ${params.from} (dmPolicy=${policy.dmPolicy})`);
			return {
				allowed: false,
				shouldMarkRead: false,
				isSelfChat: policy.isSelfChat,
				resolvedAccountId: policy.account.accountId
			};
		}
	}
	return {
		allowed: true,
		shouldMarkRead: true,
		isSelfChat: policy.isSelfChat,
		resolvedAccountId: policy.account.accountId
	};
}
const __testing = { resolveWhatsAppInboundPolicy };
//#endregion
export { resolveWhatsAppInboundPolicy as i, checkInboundAccessControl as n, resolveWhatsAppCommandAuthorized as r, __testing as t };
