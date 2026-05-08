import { c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
import { t as createSubsystemLogger } from "./subsystem-rHhUC6qs.js";
import "./logging-D6k9oiB3.js";
import { t as finalizeInboundContext } from "./inbound-context-BSjNVUNw.js";
import { n as fetchRemoteMedia } from "./fetch-3KGMv703.js";
import { i as resolveHumanDelayConfig, r as resolveEffectiveMessagesConfig } from "./identity-CviweAtG.js";
import { u as resolveStorePath } from "./paths-CHP3g1Fg.js";
import { a as updateLastRoute, n as readSessionUpdatedAt, r as recordSessionMetaFromInbound } from "./store-CR7YmZjp.js";
import "./sessions-CLHVJJOI.js";
import { l as saveMediaBuffer } from "./store-L0fSpY73.js";
import { n as resolveChannelGroupRequireMention, t as resolveChannelGroupPolicy } from "./group-policy-BUH7JoX8.js";
import { a as chunkText, c as resolveTextChunkLimit, i as chunkMarkdownTextWithMode, o as chunkTextWithMode, r as chunkMarkdownText, s as resolveChunkMode, t as chunkByNewline } from "./chunk-ChDuy-Cw.js";
import { t as loadChannelOutboundAdapter } from "./load-Bk5l8qM4.js";
import { i as resolveAgentRoute, t as buildAgentSessionKey } from "./resolve-route-C2h77Rnt.js";
import { t as convertMarkdownTables } from "./tables-C124BdvF.js";
import { i as shouldComputeCommandAuthorized, r as isControlCommandMessage, t as hasControlCommand } from "./command-detection-DUg5j-0t.js";
import { p as shouldHandleTextCommands } from "./commands-registry-DPcvwVIV.js";
import { a as createReplyDispatcherWithTyping, o as dispatchReplyFromConfig, s as withReplyDispatcher } from "./dispatch-gfPCX7Ws.js";
import { i as matchesMentionWithExplicit, n as buildMentionRegexes, r as matchesMentionPatterns } from "./mentions-DBu-D91I.js";
import { a as resolveEnvelopeFormatOptions, r as formatInboundEnvelope, t as formatAgentEnvelope } from "./envelope-Cozhn2Y4.js";
import { n as resolveInboundDebounceMs, t as createInboundDebouncer } from "./inbound-debounce-CBW3F5JP.js";
import { t as dispatchReplyWithBufferedBlockDispatcher } from "./provider-dispatcher-Bvzf8sXR.js";
import { i as shouldAckReaction, n as removeAckReactionAfterReply, r as removeAckReactionHandleAfterReply, t as createAckReactionHandle } from "./ack-reactions-BqB__0an.js";
import { t as resolveCommandAuthorizedFromAuthorizers } from "./command-gating-CAzf7x74.js";
import { n as resolveInboundMentionDecision, t as implicitMentionKindWhen } from "./mention-gating-CNvLDrnW.js";
import { n as setChannelConversationBindingMaxAgeBySessionKey, t as setChannelConversationBindingIdleTimeoutBySessionKey } from "./conversation-bindings-BxkhqJJr.js";
import { t as recordInboundSession } from "./session-BIs3Awn3.js";
import { t as resolveMarkdownTableMode } from "./markdown-tables-wHRsCFsy.js";
import { n as recordChannelActivity, t as getChannelActivity } from "./channel-activity-Bfsq8DHc.js";
import { t as buildPairingReply } from "./pairing-messages-CWsBbHcD.js";
import { a as readChannelAllowFromStore, d as upsertChannelPairingRequest } from "./pairing-store-YNHOr2Zu.js";
//#region src/plugins/runtime/runtime-channel.ts
const log = createSubsystemLogger("plugins/runtime-channel");
function normalizeRuntimeContextString(value) {
	return normalizeOptionalString(value) ?? "";
}
function normalizeRuntimeContextKey(params) {
	const channelId = normalizeRuntimeContextString(params.channelId);
	const capability = normalizeRuntimeContextString(params.capability);
	const accountId = normalizeRuntimeContextString(params.accountId);
	if (!channelId || !capability) return null;
	return {
		mapKey: `${channelId}\u0000${accountId}\u0000${capability}`,
		normalizedKey: {
			channelId,
			capability,
			...accountId ? { accountId } : {}
		}
	};
}
function doesRuntimeContextWatcherMatch(params) {
	if (params.watcher.channelId && params.watcher.channelId !== params.event.key.channelId) return false;
	if (params.watcher.accountId !== void 0 && params.watcher.accountId !== (params.event.key.accountId ?? "")) return false;
	if (params.watcher.capability && params.watcher.capability !== params.event.key.capability) return false;
	return true;
}
function createRuntimeChannel() {
	const runtimeContexts = /* @__PURE__ */ new Map();
	const runtimeContextWatchers = /* @__PURE__ */ new Set();
	const emitRuntimeContextEvent = (event) => {
		for (const watcher of runtimeContextWatchers) {
			if (!doesRuntimeContextWatcherMatch({
				watcher: watcher.filter,
				event
			})) continue;
			try {
				watcher.onEvent(event);
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				log.error(`runtime context watcher failed during ${event.type} channel=${event.key.channelId} capability=${event.key.capability}` + (event.key.accountId ? ` account=${event.key.accountId}` : "") + `: ${message}`);
			}
		}
	};
	return {
		text: {
			chunkByNewline,
			chunkMarkdownText,
			chunkMarkdownTextWithMode,
			chunkText,
			chunkTextWithMode,
			resolveChunkMode,
			resolveTextChunkLimit,
			hasControlCommand,
			resolveMarkdownTableMode,
			convertMarkdownTables
		},
		reply: {
			dispatchReplyWithBufferedBlockDispatcher,
			createReplyDispatcherWithTyping,
			resolveEffectiveMessagesConfig,
			resolveHumanDelayConfig,
			dispatchReplyFromConfig,
			withReplyDispatcher,
			finalizeInboundContext,
			formatAgentEnvelope,
			/** @deprecated Prefer `BodyForAgent` + structured user-context blocks (do not build plaintext envelopes for prompts). */
			formatInboundEnvelope,
			resolveEnvelopeFormatOptions
		},
		routing: {
			buildAgentSessionKey,
			resolveAgentRoute
		},
		pairing: {
			buildPairingReply,
			readAllowFromStore: ({ channel, accountId, env }) => readChannelAllowFromStore(channel, env, accountId),
			upsertPairingRequest: ({ channel, id, accountId, meta, env, pairingAdapter }) => upsertChannelPairingRequest({
				channel,
				id,
				accountId,
				meta,
				env,
				pairingAdapter
			})
		},
		media: {
			fetchRemoteMedia,
			saveMediaBuffer
		},
		activity: {
			record: recordChannelActivity,
			get: getChannelActivity
		},
		session: {
			resolveStorePath,
			readSessionUpdatedAt,
			recordSessionMetaFromInbound,
			recordInboundSession,
			updateLastRoute
		},
		mentions: {
			buildMentionRegexes,
			matchesMentionPatterns,
			matchesMentionWithExplicit,
			implicitMentionKindWhen,
			resolveInboundMentionDecision
		},
		reactions: {
			createAckReactionHandle,
			shouldAckReaction,
			removeAckReactionAfterReply,
			removeAckReactionHandleAfterReply
		},
		groups: {
			resolveGroupPolicy: resolveChannelGroupPolicy,
			resolveRequireMention: resolveChannelGroupRequireMention
		},
		debounce: {
			createInboundDebouncer,
			resolveInboundDebounceMs
		},
		commands: {
			resolveCommandAuthorizedFromAuthorizers,
			isControlCommandMessage,
			shouldComputeCommandAuthorized,
			shouldHandleTextCommands
		},
		outbound: { loadAdapter: loadChannelOutboundAdapter },
		threadBindings: {
			setIdleTimeoutBySessionKey: ({ channelId, targetSessionKey, accountId, idleTimeoutMs }) => setChannelConversationBindingIdleTimeoutBySessionKey({
				channelId,
				targetSessionKey,
				accountId,
				idleTimeoutMs
			}),
			setMaxAgeBySessionKey: ({ channelId, targetSessionKey, accountId, maxAgeMs }) => setChannelConversationBindingMaxAgeBySessionKey({
				channelId,
				targetSessionKey,
				accountId,
				maxAgeMs
			})
		},
		runtimeContexts: {
			register: (params) => {
				const normalized = normalizeRuntimeContextKey(params);
				if (!normalized) return { dispose: () => {} };
				if (params.abortSignal?.aborted) return { dispose: () => {} };
				const token = Symbol(normalized.mapKey);
				let disposed = false;
				const dispose = () => {
					if (disposed) return;
					disposed = true;
					const current = runtimeContexts.get(normalized.mapKey);
					if (!current || current.token !== token) return;
					runtimeContexts.delete(normalized.mapKey);
					emitRuntimeContextEvent({
						type: "unregistered",
						key: normalized.normalizedKey
					});
				};
				params.abortSignal?.addEventListener("abort", dispose, { once: true });
				if (params.abortSignal?.aborted) {
					dispose();
					return { dispose };
				}
				runtimeContexts.set(normalized.mapKey, {
					token,
					context: params.context,
					normalizedKey: normalized.normalizedKey
				});
				if (disposed) return { dispose };
				emitRuntimeContextEvent({
					type: "registered",
					key: normalized.normalizedKey,
					context: params.context
				});
				return { dispose };
			},
			get: (params) => {
				const normalized = normalizeRuntimeContextKey(params);
				if (!normalized) return;
				return runtimeContexts.get(normalized.mapKey)?.context;
			},
			watch: (params) => {
				const watcher = {
					filter: {
						...params.channelId?.trim() ? { channelId: params.channelId.trim() } : {},
						...params.accountId != null ? { accountId: params.accountId.trim() } : {},
						...params.capability?.trim() ? { capability: params.capability.trim() } : {}
					},
					onEvent: params.onEvent
				};
				runtimeContextWatchers.add(watcher);
				return () => {
					runtimeContextWatchers.delete(watcher);
				};
			}
		}
	};
}
//#endregion
export { createRuntimeChannel as t };
