import { l as runDiscordTaskWithTimeout, s as normalizeDiscordInboundWorkerTimeoutMs } from "./timeouts-DDxjtlnF.js";
import { d as resolveDiscordChannelInfoSafe, f as resolveDiscordChannelNameSafe, m as resolveDiscordChannelParentSafe, n as hasDiscordMessageStickers, o as resolveDiscordMessageChannelId, s as resolveDiscordMessageText, u as resolveDiscordChannelIdSafe } from "./message-utils-CJUMRDQq.js";
import { n as resolveDiscordReplyDeliveryPlan } from "./threading-CrYVZmM2.js";
import { normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { danger, formatDurationSeconds } from "openclaw/plugin-sdk/runtime-env";
import { resolveOpenProviderRuntimeGroupPolicy } from "openclaw/plugin-sdk/runtime-group-policy";
import { resolveBatchedReplyThreadingPolicy } from "openclaw/plugin-sdk/reply-reference";
import { createChannelInboundDebouncer, shouldDebounceTextInbound } from "openclaw/plugin-sdk/channel-inbound";
import { createClaimableDedupe } from "openclaw/plugin-sdk/persistent-dedupe";
import { createRunStateMachine } from "openclaw/plugin-sdk/channel-lifecycle";
import { KeyedAsyncQueue } from "openclaw/plugin-sdk/keyed-async-queue";
//#region extensions/discord/src/monitor/inbound-dedupe.ts
const RECENT_DISCORD_MESSAGE_TTL_MS = 5 * 6e4;
const RECENT_DISCORD_MESSAGE_MAX = 5e3;
function createDiscordInboundReplayGuard() {
	return createClaimableDedupe({
		ttlMs: RECENT_DISCORD_MESSAGE_TTL_MS,
		memoryMaxSize: RECENT_DISCORD_MESSAGE_MAX
	});
}
var DiscordRetryableInboundError = class extends Error {
	constructor(message, options) {
		super(message, options);
		this.name = "DiscordRetryableInboundError";
	}
};
function buildDiscordInboundReplayKey(params) {
	const messageId = params.data.message?.id?.trim();
	if (!messageId) return null;
	const channelId = resolveDiscordMessageChannelId({
		message: params.data.message,
		eventChannelId: params.data.channel_id
	});
	if (!channelId) return null;
	return `${params.accountId}:${channelId}:${messageId}`;
}
async function claimDiscordInboundReplay(params) {
	const replayKey = params.replayKey?.trim();
	if (!replayKey) return true;
	return (await params.replayGuard.claim(replayKey)).kind === "claimed";
}
async function commitDiscordInboundReplay(params) {
	const replayKeys = normalizeDiscordInboundReplayKeys(params.replayKeys);
	await Promise.all(replayKeys.map((replayKey) => params.replayGuard.commit(replayKey)));
}
function releaseDiscordInboundReplay(params) {
	normalizeDiscordInboundReplayKeys(params.replayKeys).forEach((replayKey) => params.replayGuard.release(replayKey, { error: params.error }));
}
function normalizeDiscordInboundReplayKeys(replayKeys) {
	return [...new Set((replayKeys ?? []).map((replayKey) => replayKey?.trim()).filter((replayKey) => Boolean(replayKey)))];
}
//#endregion
//#region extensions/discord/src/monitor/inbound-job.ts
function resolveDiscordInboundJobQueueKey(ctx) {
	const sessionKey = ctx.route.sessionKey?.trim();
	if (sessionKey) return sessionKey;
	const baseSessionKey = ctx.baseSessionKey?.trim();
	if (baseSessionKey) return baseSessionKey;
	return ctx.messageChannelId;
}
function buildDiscordInboundJob(ctx, options) {
	const { runtime, abortSignal, guildHistories, client, threadBindings, discordRestFetch, message, data, threadChannel, ...payload } = ctx;
	const sanitizedMessage = sanitizeDiscordInboundMessage(message);
	return {
		queueKey: resolveDiscordInboundJobQueueKey(ctx),
		payload: {
			...payload,
			message: sanitizedMessage,
			data: {
				...data,
				message: sanitizedMessage
			},
			threadChannel: normalizeDiscordThreadChannel(threadChannel)
		},
		runtime: {
			runtime,
			abortSignal,
			guildHistories,
			client,
			threadBindings,
			discordRestFetch
		},
		replayKeys: options?.replayKeys ? [...options.replayKeys] : void 0
	};
}
function materializeDiscordInboundJob(job, abortSignal) {
	return {
		...job.payload,
		...job.runtime,
		abortSignal: abortSignal ?? job.runtime.abortSignal
	};
}
function sanitizeDiscordInboundMessage(message) {
	const descriptors = Object.getOwnPropertyDescriptors(message);
	delete descriptors.channel;
	return Object.create(Object.getPrototypeOf(message), descriptors);
}
function normalizeDiscordThreadChannel(threadChannel) {
	if (!threadChannel) return null;
	const channelInfo = resolveDiscordChannelInfoSafe(threadChannel);
	const parent = resolveDiscordChannelParentSafe(threadChannel);
	return {
		id: threadChannel.id,
		name: channelInfo.name,
		parentId: channelInfo.parentId,
		parent: parent ? {
			id: resolveDiscordChannelIdSafe(parent),
			name: resolveDiscordChannelNameSafe(parent)
		} : void 0,
		ownerId: channelInfo.ownerId
	};
}
//#endregion
//#region extensions/discord/src/monitor/inbound-worker.ts
let messageProcessRuntimePromise;
let replyDeliveryRuntimePromise;
async function loadMessageProcessRuntime() {
	messageProcessRuntimePromise ??= import("./message-handler.process-DtUMSaqq.js");
	return await messageProcessRuntimePromise;
}
async function loadReplyDeliveryRuntime() {
	replyDeliveryRuntimePromise ??= import("./reply-delivery-1yqnujqr.js").then((n) => n.n);
	return await replyDeliveryRuntimePromise;
}
function formatDiscordRunContextSuffix(job) {
	const channelId = job.payload.messageChannelId?.trim();
	const messageId = job.payload.data?.message?.id?.trim();
	const details = [channelId ? `channelId=${channelId}` : null, messageId ? `messageId=${messageId}` : null].filter((entry) => Boolean(entry));
	if (details.length === 0) return "";
	return ` (${details.join(", ")})`;
}
async function processDiscordInboundJob(params) {
	const timeoutMs = normalizeDiscordInboundWorkerTimeoutMs(params.runTimeoutMs);
	const contextSuffix = formatDiscordRunContextSuffix(params.job);
	let finalReplyStarted = false;
	let createdThreadId;
	let sessionKey;
	const processDiscordMessageImpl = params.testing?.processDiscordMessage ?? (await loadMessageProcessRuntime()).processDiscordMessage;
	try {
		await runDiscordTaskWithTimeout({
			run: async (abortSignal) => {
				await processDiscordMessageImpl(materializeDiscordInboundJob(params.job, abortSignal), {
					onFinalReplyStart: () => {
						finalReplyStarted = true;
					},
					onFinalReplyDelivered: () => {
						finalReplyStarted = true;
					},
					onReplyPlanResolved: (resolved) => {
						createdThreadId = normalizeOptionalString(resolved.createdThreadId);
						sessionKey = normalizeOptionalString(resolved.sessionKey);
					}
				});
			},
			timeoutMs,
			abortSignals: [params.job.runtime.abortSignal, params.lifecycleSignal],
			onTimeout: async (resolvedTimeoutMs) => {
				params.runtime.error?.(danger(`discord inbound worker timed out after ${formatDurationSeconds(resolvedTimeoutMs, {
					decimals: 1,
					unit: "seconds"
				})}${contextSuffix}`));
				if (finalReplyStarted) return;
				await sendDiscordInboundWorkerTimeoutReply({
					job: params.job,
					runtime: params.runtime,
					contextSuffix,
					createdThreadId,
					sessionKey,
					deliverDiscordReplyImpl: params.testing?.deliverDiscordReply
				});
			},
			onErrorAfterTimeout: (error) => {
				params.runtime.error?.(danger(`discord inbound worker failed after timeout: ${String(error)}${contextSuffix}`));
			}
		});
		await commitDiscordInboundReplay({
			replayKeys: params.job.replayKeys,
			replayGuard: params.replayGuard
		});
	} catch (error) {
		if (error instanceof DiscordRetryableInboundError) releaseDiscordInboundReplay({
			replayKeys: params.job.replayKeys,
			error,
			replayGuard: params.replayGuard
		});
		else await commitDiscordInboundReplay({
			replayKeys: params.job.replayKeys,
			replayGuard: params.replayGuard
		});
		throw error;
	}
}
async function sendDiscordInboundWorkerTimeoutReply(params) {
	const messageChannelId = params.job.payload.messageChannelId?.trim();
	const messageId = params.job.payload.message?.id?.trim();
	const token = params.job.payload.token?.trim();
	if (!messageChannelId || !messageId || !token) {
		params.runtime.error?.(danger(`discord inbound worker timeout reply skipped: missing reply target${params.contextSuffix}`));
		return;
	}
	const deliveryPlan = resolveDiscordReplyDeliveryPlan({
		replyTarget: `channel:${params.job.payload.threadChannel?.id ?? messageChannelId}`,
		replyToMode: params.job.payload.replyToMode,
		messageId,
		threadChannel: params.job.payload.threadChannel,
		createdThreadId: params.createdThreadId
	});
	try {
		await (params.deliverDiscordReplyImpl ?? (await loadReplyDeliveryRuntime()).deliverDiscordReply)({
			cfg: params.job.payload.cfg,
			replies: [{
				text: "Discord inbound worker timed out.",
				isError: true
			}],
			target: deliveryPlan.deliverTarget,
			token,
			accountId: params.job.payload.accountId,
			runtime: params.runtime,
			textLimit: params.job.payload.textLimit,
			maxLinesPerMessage: params.job.payload.discordConfig?.maxLinesPerMessage,
			replyToId: deliveryPlan.replyReference.use(),
			replyToMode: params.job.payload.replyToMode,
			sessionKey: params.sessionKey ?? params.job.payload.route.sessionKey ?? params.job.payload.baseSessionKey,
			threadBindings: params.job.runtime.threadBindings
		});
	} catch (error) {
		params.runtime.error?.(danger(`discord inbound worker timeout reply failed: ${String(error)}${params.contextSuffix}`));
	}
}
function createDiscordInboundWorker(params) {
	const runQueue = new KeyedAsyncQueue();
	const runState = createRunStateMachine({
		setStatus: params.setStatus,
		abortSignal: params.abortSignal
	});
	const replayGuard = params.replayGuard ?? createDiscordInboundReplayGuard();
	return {
		enqueue(job) {
			runQueue.enqueue(job.queueKey, async () => {
				if (!runState.isActive()) return;
				runState.onRunStart();
				try {
					if (!runState.isActive()) return;
					await processDiscordInboundJob({
						job,
						runtime: params.runtime,
						lifecycleSignal: params.abortSignal,
						runTimeoutMs: params.runTimeoutMs,
						replayGuard,
						testing: params.__testing
					});
				} finally {
					runState.onRunEnd();
				}
			}).catch((error) => {
				params.runtime.error?.(danger(`discord inbound worker failed: ${String(error)}`));
			});
		},
		deactivate: runState.deactivate
	};
}
//#endregion
//#region extensions/discord/src/monitor/message-handler.batch-gate.ts
function applyImplicitReplyBatchGate(ctx, replyToMode, isBatched) {
	const replyThreading = resolveBatchedReplyThreadingPolicy(replyToMode, isBatched);
	if (!replyThreading) return;
	ctx.ReplyThreading = replyThreading;
}
//#endregion
//#region extensions/discord/src/monitor/message-handler.ts
let messagePreflightRuntimePromise;
async function loadMessagePreflightRuntime() {
	messagePreflightRuntimePromise ??= import("./message-handler.preflight-UmyKSMK9.js");
	return await messagePreflightRuntimePromise;
}
function isNonEmptyString(value) {
	return typeof value === "string" && value.length > 0;
}
function createDiscordMessageHandler(params) {
	const { groupPolicy } = resolveOpenProviderRuntimeGroupPolicy({
		providerConfigPresent: params.cfg.channels?.discord !== void 0,
		groupPolicy: params.discordConfig?.groupPolicy,
		defaultGroupPolicy: params.cfg.channels?.defaults?.groupPolicy
	});
	const ackReactionScope = params.discordConfig?.ackReactionScope ?? params.cfg.messages?.ackReactionScope ?? "group-mentions";
	const preflightDiscordMessageImpl = params.__testing?.preflightDiscordMessage;
	const replayGuard = createDiscordInboundReplayGuard();
	const inboundWorker = createDiscordInboundWorker({
		runtime: params.runtime,
		setStatus: params.setStatus,
		abortSignal: params.abortSignal,
		runTimeoutMs: params.workerRunTimeoutMs,
		replayGuard,
		__testing: params.__testing
	});
	const { debouncer } = createChannelInboundDebouncer({
		cfg: params.cfg,
		channel: "discord",
		buildKey: (entry) => {
			const message = entry.data.message;
			const authorId = entry.data.author?.id;
			if (!message || !authorId) return null;
			const channelId = resolveDiscordMessageChannelId({
				message,
				eventChannelId: entry.data.channel_id
			});
			if (!channelId) return null;
			return `discord:${params.accountId}:${channelId}:${authorId}`;
		},
		shouldDebounce: (entry) => {
			const message = entry.data.message;
			if (!message) return false;
			return shouldDebounceTextInbound({
				text: resolveDiscordMessageText(message, { includeForwarded: false }),
				cfg: params.cfg,
				hasMedia: Boolean(message.attachments && message.attachments.length > 0 || hasDiscordMessageStickers(message))
			});
		},
		onFlush: async (entries) => {
			const last = entries.at(-1);
			if (!last) return;
			const replayKeys = entries.map((entry) => entry.replayKey).filter(isNonEmptyString);
			const abortSignal = last.abortSignal;
			if (abortSignal?.aborted) {
				releaseDiscordInboundReplay({
					replayKeys,
					error: abortSignal.reason,
					replayGuard
				});
				return;
			}
			try {
				if (entries.length === 1) {
					const ctx = await (preflightDiscordMessageImpl ?? (await loadMessagePreflightRuntime()).preflightDiscordMessage)({
						...params,
						ackReactionScope,
						groupPolicy,
						abortSignal,
						data: last.data,
						client: last.client
					});
					if (!ctx) {
						await commitDiscordInboundReplay({
							replayKeys,
							replayGuard
						});
						return;
					}
					applyImplicitReplyBatchGate(ctx, params.replyToMode, false);
					inboundWorker.enqueue(buildDiscordInboundJob(ctx, { replayKeys }));
					return;
				}
				const combinedBaseText = entries.map((entry) => resolveDiscordMessageText(entry.data.message, { includeForwarded: false })).filter(Boolean).join("\n");
				const syntheticMessage = {
					...last.data.message,
					content: combinedBaseText,
					attachments: [],
					message_snapshots: last.data.message.message_snapshots,
					messageSnapshots: last.data.message.messageSnapshots,
					rawData: { ...last.data.message.rawData }
				};
				const syntheticData = {
					...last.data,
					message: syntheticMessage
				};
				const ctx = await (preflightDiscordMessageImpl ?? (await loadMessagePreflightRuntime()).preflightDiscordMessage)({
					...params,
					ackReactionScope,
					groupPolicy,
					abortSignal,
					data: syntheticData,
					client: last.client
				});
				if (!ctx) {
					await commitDiscordInboundReplay({
						replayKeys,
						replayGuard
					});
					return;
				}
				applyImplicitReplyBatchGate(ctx, params.replyToMode, true);
				if (entries.length > 1) {
					const ids = entries.map((entry) => entry.data.message?.id).filter(isNonEmptyString);
					if (ids.length > 0) {
						const ctxBatch = ctx;
						ctxBatch.MessageSids = ids;
						ctxBatch.MessageSidFirst = ids[0];
						ctxBatch.MessageSidLast = ids[ids.length - 1];
					}
				}
				inboundWorker.enqueue(buildDiscordInboundJob(ctx, { replayKeys }));
			} catch (error) {
				if (error instanceof DiscordRetryableInboundError) releaseDiscordInboundReplay({
					replayKeys,
					error,
					replayGuard
				});
				else await commitDiscordInboundReplay({
					replayKeys,
					replayGuard
				});
				throw error;
			}
		},
		onError: (err) => {
			params.runtime.error?.(danger(`discord debounce flush failed: ${String(err)}`));
		}
	});
	const handler = async (data, client, options) => {
		try {
			if (options?.abortSignal?.aborted) return;
			const msgAuthorId = data.message?.author?.id ?? data.author?.id;
			if (params.botUserId && msgAuthorId === params.botUserId) return;
			const replayKey = buildDiscordInboundReplayKey({
				accountId: params.accountId,
				data
			});
			if (!await claimDiscordInboundReplay({
				replayKey,
				replayGuard
			})) return;
			await debouncer.enqueue({
				data,
				client,
				abortSignal: options?.abortSignal,
				replayKey: replayKey ?? void 0
			});
		} catch (err) {
			params.runtime.error?.(danger(`handler failed: ${String(err)}`));
		}
	};
	handler.deactivate = inboundWorker.deactivate;
	return handler;
}
//#endregion
export { createDiscordMessageHandler as t };
