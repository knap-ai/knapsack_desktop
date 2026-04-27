import { i as normalizeDeliveryContext } from "./delivery-context.shared-BRwSoIeK.js";
import { t as resolveFirstBoundAccountId } from "./bound-account-read-YGhnk9FQ.js";
//#region src/agents/spawn-requester-origin.ts
const KIND_PREFIX_TO_CHAT_TYPE = {
	"room:": "channel",
	"channel:": "channel",
	"conversation:": "channel",
	"chat:": "channel",
	"thread:": "channel",
	"topic:": "channel",
	"group:": "group",
	"team:": "group",
	"user:": "direct",
	"dm:": "direct",
	"pm:": "direct"
};
const GENERIC_PREFIX_PATTERN = /^[a-z][a-z0-9_-]*:/i;
function getKindForRequesterPrefix(prefix) {
	return Object.hasOwn(KIND_PREFIX_TO_CHAT_TYPE, prefix) ? KIND_PREFIX_TO_CHAT_TYPE[prefix] : void 0;
}
function normalizeChannelPrefix(channelId) {
	const normalized = channelId?.trim().toLowerCase();
	return normalized ? `${normalized}:` : void 0;
}
function shouldPeelRequesterPrefix(prefix, channelPrefix) {
	return Boolean(getKindForRequesterPrefix(prefix) || prefix === channelPrefix);
}
function inferPeerKindFromBareId(value) {
	if (value.startsWith("@")) return "direct";
	if (value.startsWith("!") || value.startsWith("#")) return "channel";
}
function extractRequesterPeer(channelId, requesterTo) {
	if (!requesterTo) return {};
	const raw = requesterTo.trim();
	if (!raw) return {};
	const channelPrefix = normalizeChannelPrefix(channelId);
	let inferredKind;
	let allowBareIdKindOverride = false;
	let value = raw;
	while (true) {
		const match = GENERIC_PREFIX_PATTERN.exec(value);
		if (!match) break;
		const prefix = match[0].toLowerCase();
		if (!shouldPeelRequesterPrefix(prefix, channelPrefix)) break;
		const kindFromPrefix = getKindForRequesterPrefix(prefix);
		if (kindFromPrefix) inferredKind ??= kindFromPrefix;
		allowBareIdKindOverride ||= prefix === channelPrefix || prefix === "room:";
		value = value.slice(prefix.length).trim();
	}
	const bareIdKind = value ? inferPeerKindFromBareId(value) : void 0;
	if (bareIdKind && (!inferredKind || allowBareIdKindOverride)) inferredKind = bareIdKind;
	return {
		peerId: value || void 0,
		peerKind: inferredKind
	};
}
function resolveRequesterOriginForChild(params) {
	const { peerId: normalizedPeerId, peerKind: inferredPeerKind } = extractRequesterPeer(params.requesterChannel, params.requesterTo);
	const rawPeerIdAlias = params.requesterTo?.trim();
	const boundAccountId = params.requesterChannel && params.targetAgentId !== params.requesterAgentId ? resolveFirstBoundAccountId({
		cfg: params.cfg,
		channelId: params.requesterChannel,
		agentId: params.targetAgentId,
		peerId: normalizedPeerId,
		exactPeerIdAliases: rawPeerIdAlias && rawPeerIdAlias !== normalizedPeerId ? [rawPeerIdAlias] : void 0,
		peerKind: inferredPeerKind,
		groupSpace: params.requesterGroupSpace,
		memberRoleIds: params.requesterMemberRoleIds
	}) : void 0;
	return normalizeDeliveryContext({
		channel: params.requesterChannel,
		accountId: boundAccountId ?? params.requesterAccountId,
		to: params.requesterTo,
		threadId: params.requesterThreadId
	});
}
//#endregion
export { resolveRequesterOriginForChild as t };
