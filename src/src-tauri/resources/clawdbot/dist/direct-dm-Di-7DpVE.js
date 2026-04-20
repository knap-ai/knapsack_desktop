import { n as readStoreAllowFromForDmPolicy, o as resolveDmGroupAccessWithLists } from "./dm-policy-shared-B7IvP1oD.js";
import { i as recordInboundSessionAndDispatchReply } from "./inbound-reply-dispatch-DL65hfTX.js";
import { r as resolveInboundRouteEnvelopeBuilderWithRuntime } from "./inbound-envelope-DEcn47BC.js";
//#region src/plugin-sdk/direct-dm.ts
/** Resolve direct-DM policy, effective allowlists, and optional command auth in one place. */
async function resolveInboundDirectDmAccessWithRuntime(params) {
	const dmPolicy = params.dmPolicy ?? "pairing";
	const storeAllowFrom = dmPolicy === "pairing" ? await readStoreAllowFromForDmPolicy({
		provider: params.channel,
		accountId: params.accountId,
		dmPolicy,
		readStore: params.readStoreAllowFrom
	}) : [];
	const access = resolveDmGroupAccessWithLists({
		isGroup: false,
		dmPolicy,
		allowFrom: params.allowFrom,
		storeAllowFrom,
		groupAllowFromFallbackToAllowFrom: false,
		isSenderAllowed: (allowEntries) => params.isSenderAllowed(params.senderId, allowEntries)
	});
	const shouldComputeAuth = params.runtime.shouldComputeCommandAuthorized(params.rawBody, params.cfg);
	const senderAllowedForCommands = params.isSenderAllowed(params.senderId, access.effectiveAllowFrom);
	const commandAuthorized = shouldComputeAuth ? dmPolicy === "open" ? true : params.runtime.resolveCommandAuthorizedFromAuthorizers({
		useAccessGroups: params.cfg.commands?.useAccessGroups !== false,
		authorizers: [{
			configured: access.effectiveAllowFrom.length > 0,
			allowed: senderAllowedForCommands
		}],
		modeWhenAccessGroupsOff: params.modeWhenAccessGroupsOff
	}) : void 0;
	return {
		access: {
			decision: access.decision,
			reasonCode: access.reasonCode,
			reason: access.reason,
			effectiveAllowFrom: access.effectiveAllowFrom
		},
		shouldComputeAuth,
		senderAllowedForCommands,
		commandAuthorized
	};
}
/** Convert resolved DM policy into a pre-crypto allow/block/pairing callback. */
function createPreCryptoDirectDmAuthorizer(params) {
	return async (input) => {
		const resolved = await params.resolveAccess(input.senderId);
		const access = "access" in resolved ? resolved.access : resolved;
		if (access.decision === "allow") return "allow";
		if (access.decision === "pairing") {
			if (params.issuePairingChallenge) await params.issuePairingChallenge({
				senderId: input.senderId,
				reply: input.reply
			});
			return "pairing";
		}
		params.onBlocked?.({
			senderId: input.senderId,
			reason: access.reason,
			reasonCode: access.reasonCode
		});
		return "block";
	};
}
/** Shared policy object for DM-style pre-crypto guardrails. */
function createDirectDmPreCryptoGuardPolicy(overrides = {}) {
	return {
		allowedKinds: overrides.allowedKinds ?? [4],
		maxFutureSkewSec: overrides.maxFutureSkewSec ?? 120,
		maxCiphertextBytes: overrides.maxCiphertextBytes ?? 16 * 1024,
		maxPlaintextBytes: overrides.maxPlaintextBytes ?? 8 * 1024,
		rateLimit: {
			windowMs: overrides.rateLimit?.windowMs ?? 6e4,
			maxPerSenderPerWindow: overrides.rateLimit?.maxPerSenderPerWindow ?? 20,
			maxGlobalPerWindow: overrides.rateLimit?.maxGlobalPerWindow ?? 200,
			maxTrackedSenderKeys: overrides.rateLimit?.maxTrackedSenderKeys ?? 4096
		}
	};
}
/** Route, envelope, record, and dispatch one direct-DM turn through the standard pipeline. */
async function dispatchInboundDirectDmWithRuntime(params) {
	const { route, buildEnvelope } = resolveInboundRouteEnvelopeBuilderWithRuntime({
		cfg: params.cfg,
		channel: params.channel,
		accountId: params.accountId,
		peer: params.peer,
		runtime: params.runtime.channel,
		sessionStore: params.cfg.session?.store
	});
	const { storePath, body } = buildEnvelope({
		channel: params.channelLabel,
		from: params.conversationLabel,
		body: params.rawBody,
		timestamp: params.timestamp
	});
	const ctxPayload = params.runtime.channel.reply.finalizeInboundContext({
		Body: body,
		BodyForAgent: params.bodyForAgent ?? params.rawBody,
		RawBody: params.rawBody,
		CommandBody: params.commandBody ?? params.rawBody,
		From: params.senderAddress,
		To: params.recipientAddress,
		SessionKey: route.sessionKey,
		AccountId: route.accountId ?? params.accountId,
		ChatType: "direct",
		ConversationLabel: params.conversationLabel,
		SenderId: params.senderId,
		Provider: params.provider ?? params.channel,
		Surface: params.surface ?? params.channel,
		MessageSid: params.messageId,
		MessageSidFull: params.messageId,
		Timestamp: params.timestamp,
		CommandAuthorized: params.commandAuthorized,
		OriginatingChannel: params.originatingChannel ?? params.channel,
		OriginatingTo: params.originatingTo ?? params.recipientAddress,
		...params.extraContext
	});
	await recordInboundSessionAndDispatchReply({
		cfg: params.cfg,
		channel: params.channel,
		accountId: route.accountId ?? params.accountId,
		agentId: route.agentId,
		routeSessionKey: route.sessionKey,
		storePath,
		ctxPayload,
		recordInboundSession: params.runtime.channel.session.recordInboundSession,
		dispatchReplyWithBufferedBlockDispatcher: params.runtime.channel.reply.dispatchReplyWithBufferedBlockDispatcher,
		deliver: params.deliver,
		onRecordError: params.onRecordError,
		onDispatchError: params.onDispatchError
	});
	return {
		route,
		storePath,
		ctxPayload
	};
}
//#endregion
export { resolveInboundDirectDmAccessWithRuntime as i, createPreCryptoDirectDmAuthorizer as n, dispatchInboundDirectDmWithRuntime as r, createDirectDmPreCryptoGuardPolicy as t };
