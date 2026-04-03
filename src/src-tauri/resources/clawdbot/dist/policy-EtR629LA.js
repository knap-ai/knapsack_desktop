import { _ as normalizeAccountId } from "./session-key-D7XpmyVq.js";
import { s as resolveMergedAccountConfig } from "./account-helpers-DqNwQN08.js";
import { i as evaluateSenderGroupAccessForPolicy } from "./group-access-Cc77nG5J.js";
import "./account-resolution-CahYTlaB.js";
import "./runtime-api-B9CFXC5g.js";
import { n as normalizeFeishuTarget } from "./targets-DLSGBpV_.js";
//#region extensions/feishu/src/card-interaction.ts
const FEISHU_CARD_INTERACTION_VERSION = "ocf1";
function isRecord(value) {
	return typeof value === "object" && value !== null;
}
function isInteractionKind(value) {
	return value === "button" || value === "quick" || value === "meta";
}
function isMetadataValue(value) {
	return value === null || value === void 0 || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}
function createFeishuCardInteractionEnvelope(envelope) {
	return {
		oc: FEISHU_CARD_INTERACTION_VERSION,
		...envelope
	};
}
function buildFeishuCardActionTextFallback(event) {
	const actionValue = event.action.value;
	if (isRecord(actionValue)) {
		if (typeof actionValue.text === "string") return actionValue.text;
		if (typeof actionValue.command === "string") return actionValue.command;
		return JSON.stringify(actionValue);
	}
	return String(actionValue);
}
function decodeFeishuCardAction(params) {
	const { event, now = Date.now() } = params;
	const actionValue = event.action.value;
	if (!isRecord(actionValue) || actionValue.oc !== "ocf1") return {
		kind: "legacy",
		text: buildFeishuCardActionTextFallback(event)
	};
	if (!isInteractionKind(actionValue.k) || typeof actionValue.a !== "string" || !actionValue.a) return {
		kind: "invalid",
		reason: "malformed"
	};
	if (actionValue.q !== void 0 && typeof actionValue.q !== "string") return {
		kind: "invalid",
		reason: "malformed"
	};
	if (actionValue.m !== void 0) {
		if (!isRecord(actionValue.m)) return {
			kind: "invalid",
			reason: "malformed"
		};
		for (const value of Object.values(actionValue.m)) if (!isMetadataValue(value)) return {
			kind: "invalid",
			reason: "malformed"
		};
	}
	if (actionValue.c !== void 0) {
		if (!isRecord(actionValue.c)) return {
			kind: "invalid",
			reason: "malformed"
		};
		if (actionValue.c.u !== void 0 && typeof actionValue.c.u !== "string") return {
			kind: "invalid",
			reason: "malformed"
		};
		if (actionValue.c.h !== void 0 && typeof actionValue.c.h !== "string") return {
			kind: "invalid",
			reason: "malformed"
		};
		if (actionValue.c.s !== void 0 && typeof actionValue.c.s !== "string") return {
			kind: "invalid",
			reason: "malformed"
		};
		if (actionValue.c.e !== void 0 && !Number.isFinite(actionValue.c.e)) return {
			kind: "invalid",
			reason: "malformed"
		};
		if (actionValue.c.t !== void 0 && actionValue.c.t !== "p2p" && actionValue.c.t !== "group") return {
			kind: "invalid",
			reason: "malformed"
		};
		if (typeof actionValue.c.e === "number" && actionValue.c.e < now) return {
			kind: "invalid",
			reason: "stale"
		};
		const expectedUser = actionValue.c.u?.trim();
		if (expectedUser && expectedUser !== (event.operator.open_id ?? "").trim()) return {
			kind: "invalid",
			reason: "wrong_user"
		};
		const expectedChat = actionValue.c.h?.trim();
		if (expectedChat && expectedChat !== (event.context.chat_id ?? "").trim()) return {
			kind: "invalid",
			reason: "wrong_conversation"
		};
	}
	return {
		kind: "structured",
		envelope: actionValue
	};
}
//#endregion
//#region extensions/feishu/src/policy.ts
function normalizeFeishuAllowEntry(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return "";
	if (trimmed === "*") return "*";
	const withoutProviderPrefix = trimmed.replace(/^feishu:/i, "");
	return (normalizeFeishuTarget(withoutProviderPrefix) ?? withoutProviderPrefix).trim().toLowerCase();
}
function resolveFeishuAllowlistMatch(params) {
	const allowFrom = params.allowFrom.map((entry) => normalizeFeishuAllowEntry(String(entry))).filter(Boolean);
	if (allowFrom.length === 0) return { allowed: false };
	if (allowFrom.includes("*")) return {
		allowed: true,
		matchKey: "*",
		matchSource: "wildcard"
	};
	const senderCandidates = [params.senderId, ...params.senderIds ?? []].map((entry) => normalizeFeishuAllowEntry(String(entry ?? ""))).filter(Boolean);
	for (const senderId of senderCandidates) if (allowFrom.includes(senderId)) return {
		allowed: true,
		matchKey: senderId,
		matchSource: "id"
	};
	return { allowed: false };
}
function resolveFeishuGroupConfig(params) {
	const groups = params.cfg?.groups ?? {};
	const wildcard = groups["*"];
	const groupId = params.groupId?.trim();
	if (!groupId) return;
	const direct = groups[groupId];
	if (direct) return direct;
	const lowered = groupId.toLowerCase();
	const matchKey = Object.keys(groups).find((key) => key.toLowerCase() === lowered);
	if (matchKey) return groups[matchKey];
	return wildcard;
}
function resolveFeishuGroupToolPolicy(params) {
	const cfg = params.cfg.channels?.feishu;
	if (!cfg) return;
	return resolveFeishuGroupConfig({
		cfg,
		groupId: params.groupId
	})?.tools;
}
function isFeishuGroupAllowed(params) {
	return evaluateSenderGroupAccessForPolicy({
		groupPolicy: params.groupPolicy === "allowall" ? "open" : params.groupPolicy,
		groupAllowFrom: params.allowFrom.map((entry) => String(entry)),
		senderId: params.senderId,
		isSenderAllowed: () => resolveFeishuAllowlistMatch(params).allowed
	}).allowed;
}
function resolveFeishuReplyPolicy(params) {
	if (params.isDirectMessage) return { requireMention: false };
	const feishuCfg = params.cfg.channels?.feishu;
	const resolvedCfg = resolveMergedAccountConfig({
		channelConfig: feishuCfg,
		accounts: feishuCfg?.accounts,
		accountId: normalizeAccountId(params.accountId),
		normalizeAccountId,
		omitKeys: ["defaultAccount"]
	});
	const groupRequireMention = resolveFeishuGroupConfig({
		cfg: resolvedCfg,
		groupId: params.groupId
	})?.requireMention;
	return { requireMention: typeof groupRequireMention === "boolean" ? groupRequireMention : typeof resolvedCfg.requireMention === "boolean" ? resolvedCfg.requireMention : params.groupPolicy === "open" ? false : true };
}
//#endregion
export { resolveFeishuReplyPolicy as a, createFeishuCardInteractionEnvelope as c, resolveFeishuGroupToolPolicy as i, decodeFeishuCardAction as l, resolveFeishuAllowlistMatch as n, FEISHU_CARD_INTERACTION_VERSION as o, resolveFeishuGroupConfig as r, buildFeishuCardActionTextFallback as s, isFeishuGroupAllowed as t };
