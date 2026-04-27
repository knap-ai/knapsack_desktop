import { a as resolveDiscordAllowListMatch, r as normalizeDiscordAllowList } from "./allow-list-CuKLSnAf.js";
import { deriveLastRoutePolicy, resolveAgentIdFromSessionKey, resolveAgentRoute } from "openclaw/plugin-sdk/routing";
import { createChannelPairingChallengeIssuer } from "openclaw/plugin-sdk/channel-pairing";
import { upsertChannelPairingRequest } from "openclaw/plugin-sdk/conversation-runtime";
import { readStoreAllowFromForDmPolicy, resolveDmGroupAccessWithLists } from "openclaw/plugin-sdk/security-runtime";
import { resolveCommandAuthorizedFromAuthorizers } from "openclaw/plugin-sdk/command-auth-native";
//#region extensions/discord/src/monitor/dm-command-auth.ts
const DISCORD_ALLOW_LIST_PREFIXES = [
	"discord:",
	"user:",
	"pk:"
];
function resolveSenderAllowMatch(params) {
	const allowList = normalizeDiscordAllowList(params.allowEntries, DISCORD_ALLOW_LIST_PREFIXES);
	return allowList ? resolveDiscordAllowListMatch({
		allowList,
		candidate: params.sender,
		allowNameMatching: params.allowNameMatching
	}) : { allowed: false };
}
function resolveDmPolicyCommandAuthorization(params) {
	if (params.dmPolicy === "open" && params.decision === "allow") return true;
	return params.commandAuthorized;
}
async function resolveDiscordDmCommandAccess(params) {
	const storeAllowFrom = params.readStoreAllowFrom ? await params.readStoreAllowFrom().catch(() => []) : await readStoreAllowFromForDmPolicy({
		provider: "discord",
		accountId: params.accountId,
		dmPolicy: params.dmPolicy
	});
	const access = resolveDmGroupAccessWithLists({
		isGroup: false,
		dmPolicy: params.dmPolicy,
		allowFrom: params.configuredAllowFrom,
		groupAllowFrom: [],
		storeAllowFrom,
		isSenderAllowed: (allowEntries) => resolveSenderAllowMatch({
			allowEntries,
			sender: params.sender,
			allowNameMatching: params.allowNameMatching
		}).allowed
	});
	const allowMatch = resolveSenderAllowMatch({
		allowEntries: access.effectiveAllowFrom,
		sender: params.sender,
		allowNameMatching: params.allowNameMatching
	});
	const commandAuthorized = resolveCommandAuthorizedFromAuthorizers({
		useAccessGroups: params.useAccessGroups,
		authorizers: [{
			configured: access.effectiveAllowFrom.length > 0,
			allowed: allowMatch.allowed
		}],
		modeWhenAccessGroupsOff: "configured"
	});
	return {
		decision: access.decision,
		reason: access.reason,
		commandAuthorized: resolveDmPolicyCommandAuthorization({
			dmPolicy: params.dmPolicy,
			decision: access.decision,
			commandAuthorized
		}),
		allowMatch
	};
}
//#endregion
//#region extensions/discord/src/monitor/dm-command-decision.ts
async function handleDiscordDmCommandDecision(params) {
	if (params.dmAccess.decision === "allow") return true;
	if (params.dmAccess.decision === "pairing") {
		const upsertPairingRequest = params.upsertPairingRequest ?? upsertChannelPairingRequest;
		const result = await createChannelPairingChallengeIssuer({
			channel: "discord",
			upsertPairingRequest: async ({ id, meta }) => await upsertPairingRequest({
				channel: "discord",
				id,
				accountId: params.accountId,
				meta
			})
		})({
			senderId: params.sender.id,
			senderIdLine: `Your Discord user id: ${params.sender.id}`,
			meta: {
				tag: params.sender.tag,
				name: params.sender.name
			},
			sendPairingReply: async () => {}
		});
		if (result.created && result.code) await params.onPairingCreated(result.code);
		return false;
	}
	await params.onUnauthorized();
	return false;
}
//#endregion
//#region extensions/discord/src/monitor/route-resolution.ts
function buildDiscordRoutePeer(params) {
	return {
		kind: params.isDirectMessage ? "direct" : params.isGroupDm ? "group" : "channel",
		id: params.isDirectMessage ? params.directUserId?.trim() || params.conversationId : params.conversationId
	};
}
function resolveDiscordConversationRoute(params) {
	return resolveAgentRoute({
		cfg: params.cfg,
		channel: "discord",
		accountId: params.accountId,
		guildId: params.guildId ?? void 0,
		memberRoleIds: params.memberRoleIds,
		peer: params.peer,
		parentPeer: params.parentConversationId ? {
			kind: "channel",
			id: params.parentConversationId
		} : void 0
	});
}
function resolveDiscordBoundConversationRoute(params) {
	return resolveDiscordEffectiveRoute({
		route: resolveDiscordConversationRoute({
			cfg: params.cfg,
			accountId: params.accountId,
			guildId: params.guildId,
			memberRoleIds: params.memberRoleIds,
			peer: buildDiscordRoutePeer({
				isDirectMessage: params.isDirectMessage,
				isGroupDm: params.isGroupDm,
				directUserId: params.directUserId,
				conversationId: params.conversationId
			}),
			parentConversationId: params.parentConversationId
		}),
		boundSessionKey: params.boundSessionKey,
		configuredRoute: params.configuredRoute,
		matchedBy: params.matchedBy
	});
}
function resolveDiscordEffectiveRoute(params) {
	const boundSessionKey = params.boundSessionKey?.trim();
	if (!boundSessionKey) return params.configuredRoute?.route ?? params.route;
	return {
		...params.route,
		sessionKey: boundSessionKey,
		agentId: resolveAgentIdFromSessionKey(boundSessionKey),
		lastRoutePolicy: deriveLastRoutePolicy({
			sessionKey: boundSessionKey,
			mainSessionKey: params.route.mainSessionKey
		}),
		...params.matchedBy ? { matchedBy: params.matchedBy } : {}
	};
}
//#endregion
export { handleDiscordDmCommandDecision as a, resolveDiscordEffectiveRoute as i, resolveDiscordBoundConversationRoute as n, resolveDiscordDmCommandAccess as o, resolveDiscordConversationRoute as r, buildDiscordRoutePeer as t };
