import { c as normalizeOptionalString } from "./string-coerce-C1IzJjqi.js";
import { i as getChildLogger, v as normalizeLogLevel } from "./logger-x0IvPL2B.js";
import { t as createSubsystemLogger } from "./subsystem-CWI_MDy_.js";
import { _ as resolveStateDir } from "./paths-BG0ad0P6.js";
import { n as VERSION } from "./version-DZq9J0ei.js";
import { a as shouldLogVerbose } from "./globals-DeRFSEIV.js";
import { r as runCommandWithTimeout } from "./exec-BaXt0vsL.js";
import { a as loadConfig, y as writeConfigFile } from "./io-Dv_xNAZB.js";
import { n as DEFAULT_MODEL, r as DEFAULT_PROVIDER } from "./defaults-DM8yIn8C.js";
import { u as ensureAgentWorkspace } from "./workspace-DiB6mKpP.js";
import { b as resolveAgentWorkspaceDir, y as resolveAgentDir } from "./agent-scope-_6dFncNS.js";
import "./config-yDDhhyz6.js";
import "./logging-DFHb42Bl.js";
import { p as resolveThinkingDefault } from "./model-selection-hTT37jzm.js";
import { i as resolveHumanDelayConfig, n as resolveAgentIdentity, r as resolveEffectiveMessagesConfig } from "./identity-lSr9N8UI.js";
import { i as resolveSessionFilePath, u as resolveStorePath } from "./paths-DvU8Tgvw.js";
import { i as normalizeDeliveryContext } from "./delivery-context.shared-BRwSoIeK.js";
import { t as loadSessionStore } from "./store-load-Cf3NDflc.js";
import { a as updateLastRoute, i as saveSessionStore, n as readSessionUpdatedAt, r as recordSessionMetaFromInbound } from "./store-Bm25Mivo.js";
import "./sessions-DIdqAx7y.js";
import { n as onSessionTranscriptUpdate } from "./transcript-events-ofiGBxi_.js";
import { l as onAgentEvent } from "./agent-events-DMk-SEBA.js";
import { h as mediaKindFromMime, t as detectMime } from "./mime-Zn7U6BSf.js";
import { a as getImageMetadata, l as resizeToJpeg } from "./image-ops-DFAxz8Ri.js";
import { n as createLazyRuntimeMethodBinder, r as createLazyRuntimeModule, t as createLazyRuntimeMethod } from "./lazy-runtime-BxcSgm-I.js";
import { n as listRuntimeImageGenerationProviders, t as generateImage } from "./runtime-Bs-fdato.js";
import { l as saveMediaBuffer } from "./store-B9O3InEv.js";
import { t as loadWebMedia } from "./web-media-CA1OunRg.js";
import { n as fetchRemoteMedia } from "./fetch-p2uITHmD.js";
import { n as resolveChannelGroupRequireMention, t as resolveChannelGroupPolicy } from "./group-policy-CDJmvoGe.js";
import { a as chunkText, c as resolveTextChunkLimit, i as chunkMarkdownTextWithMode, o as chunkTextWithMode, r as chunkMarkdownText, s as resolveChunkMode, t as chunkByNewline } from "./chunk-CpCakLTa.js";
import { t as loadChannelOutboundAdapter } from "./load-DDBpMLL3.js";
import { i as resolveAgentRoute, t as buildAgentSessionKey } from "./resolve-route-DWtJo8cH.js";
import { n as listRuntimeMusicGenerationProviders, t as generateMusic } from "./runtime-BSHeg81Q.js";
import { n as requestHeartbeatNow } from "./heartbeat-wake-gACR6ANS.js";
import { i as enqueueSystemEvent } from "./system-events-B6vO-QxY.js";
import { A as finishFlow, F as requestFlowCancel, L as resumeFlow, O as failFlow, R as setFlowWaiting, T as createManagedTaskFlow, d as listTasksForFlowId } from "./task-registry-DabR0MkC.js";
import { n as summarizeTaskRecords } from "./task-registry.summary-Bv7sS-Eo.js";
import "./runtime-internal-DY7rV33A.js";
import { c as getFlowTaskSummary, g as resolveTaskFlowForLookupTokenForOwner, h as listTaskFlowsForOwner, m as getTaskFlowByIdForOwner, p as findLatestTaskFlowForOwner, r as cancelFlowByIdForOwner, t as cancelDetachedTaskRunById, u as runTaskInFlowForOwner } from "./task-executor-BkjIRXig.js";
import { a as getTaskByIdForOwner, o as listTasksForRelatedSessionKeyForOwner, r as findLatestTaskForRelatedSessionKeyForOwner, s as resolveTaskForLookupTokenForOwner } from "./task-owner-access-CN9Sdqx6.js";
import { t as resolveAgentTimeoutMs } from "./timeout-TgWmyBUs.js";
import { n as listRuntimeVideoGenerationProviders, t as generateVideo } from "./runtime-DRp677-D.js";
import { a as runWebSearch, r as listWebSearchProviders } from "./runtime-CWcUaGyA.js";
import { t as convertMarkdownTables } from "./tables-BHEdR14m.js";
import { t as RequestScopedSubagentRuntimeError } from "./error-runtime-D8vVwCEz.js";
import { n as gatewaySubagentState } from "./gateway-bindings-f4lixXGG.js";
import { i as shouldComputeCommandAuthorized, r as isControlCommandMessage, t as hasControlCommand } from "./command-detection-C6edkeaW.js";
import { f as shouldHandleTextCommands } from "./commands-registry-D1HuZY_U.js";
import { a as createReplyDispatcherWithTyping, c as withReplyDispatcher, s as dispatchReplyFromConfig } from "./dispatch-Dw_9PM8V.js";
import { t as finalizeInboundContext } from "./inbound-context-CLbSDMst.js";
import { a as resolveEnvelopeFormatOptions, r as formatInboundEnvelope, t as formatAgentEnvelope } from "./envelope-DDp7QU_Z.js";
import { n as resolveInboundDebounceMs, t as createInboundDebouncer } from "./inbound-debounce-a9Z7UIuW.js";
import { i as matchesMentionWithExplicit, n as buildMentionRegexes, r as matchesMentionPatterns } from "./mentions-8V4_s3MO.js";
import { t as dispatchReplyWithBufferedBlockDispatcher } from "./provider-dispatcher-CikJ_7wl.js";
import { n as shouldAckReaction, t as removeAckReactionAfterReply } from "./ack-reactions-Du7CfpP-.js";
import { t as resolveCommandAuthorizedFromAuthorizers } from "./command-gating-iPAl2C9q.js";
import { n as resolveInboundMentionDecision, t as implicitMentionKindWhen } from "./mention-gating-B3vlGf1T.js";
import { n as setChannelConversationBindingMaxAgeBySessionKey, t as setChannelConversationBindingIdleTimeoutBySessionKey } from "./conversation-bindings-BKH4g4IL.js";
import { t as recordInboundSession } from "./session-DjO_XD77.js";
import { t as resolveMarkdownTableMode } from "./markdown-tables-DPeXG03j.js";
import { n as recordChannelActivity, t as getChannelActivity } from "./channel-activity-Cd93U4xD.js";
import { t as buildPairingReply } from "./pairing-messages-DuBQu0Gx.js";
import { a as readChannelAllowFromStore, d as upsertChannelPairingRequest } from "./pairing-store-BqyKPFa6.js";
import { r as isVoiceCompatibleAudio } from "./audio-V_M8o5vA.js";
//#region src/plugins/runtime/runtime-cache.ts
function defineCachedValue(target, key, create) {
	let cached;
	let ready = false;
	Object.defineProperty(target, key, {
		configurable: true,
		enumerable: true,
		get() {
			if (!ready) {
				cached = create();
				ready = true;
			}
			return cached;
		}
	});
}
//#endregion
//#region src/plugins/runtime/runtime-agent.ts
const loadEmbeddedPiRuntime = createLazyRuntimeModule(() => import("./runtime-embedded-pi.runtime-BGQdF1HT.js"));
function createRuntimeAgent() {
	const agentRuntime = {
		defaults: {
			model: DEFAULT_MODEL,
			provider: DEFAULT_PROVIDER
		},
		resolveAgentDir,
		resolveAgentWorkspaceDir,
		resolveAgentIdentity,
		resolveThinkingDefault,
		resolveAgentTimeoutMs,
		ensureAgentWorkspace
	};
	defineCachedValue(agentRuntime, "runEmbeddedAgent", () => createLazyRuntimeMethod(loadEmbeddedPiRuntime, (runtime) => runtime.runEmbeddedAgent));
	defineCachedValue(agentRuntime, "runEmbeddedPiAgent", () => createLazyRuntimeMethod(loadEmbeddedPiRuntime, (runtime) => runtime.runEmbeddedPiAgent));
	defineCachedValue(agentRuntime, "session", () => ({
		resolveStorePath,
		loadSessionStore,
		saveSessionStore,
		resolveSessionFilePath
	}));
	return agentRuntime;
}
//#endregion
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
			shouldAckReaction,
			removeAckReactionAfterReply
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
//#region src/plugins/runtime/runtime-config.ts
function createRuntimeConfig() {
	return {
		loadConfig,
		writeConfigFile
	};
}
//#endregion
//#region src/plugins/runtime/runtime-events.ts
function createRuntimeEvents() {
	return {
		onAgentEvent,
		onSessionTranscriptUpdate
	};
}
//#endregion
//#region src/plugins/runtime/runtime-logging.ts
function createRuntimeLogging() {
	return {
		shouldLogVerbose,
		getChildLogger: (bindings, opts) => {
			const logger = getChildLogger(bindings, { level: opts?.level ? normalizeLogLevel(opts.level) : void 0 });
			return {
				debug: (message) => logger.debug?.(message),
				info: (message) => logger.info(message),
				warn: (message) => logger.warn(message),
				error: (message) => logger.error(message)
			};
		}
	};
}
//#endregion
//#region src/plugins/runtime/runtime-media.ts
function createRuntimeMedia() {
	return {
		loadWebMedia,
		detectMime,
		mediaKindFromMime,
		isVoiceCompatibleAudio,
		getImageMetadata,
		resizeToJpeg
	};
}
//#endregion
//#region src/plugins/runtime/native-deps.ts
function formatNativeDependencyHint(params) {
	const manager = params.manager ?? "pnpm";
	const rebuildCommand = params.rebuildCommand ?? (manager === "npm" ? `npm rebuild ${params.packageName}` : manager === "yarn" ? `yarn rebuild ${params.packageName}` : `pnpm rebuild ${params.packageName}`);
	const steps = [
		params.approveBuildsCommand ?? (manager === "pnpm" ? `pnpm approve-builds (select ${params.packageName})` : void 0),
		rebuildCommand,
		params.downloadCommand
	].filter((step) => Boolean(step));
	if (steps.length === 0) return `Install ${params.packageName} and rebuild its native module.`;
	return `Install ${params.packageName} and rebuild its native module (${steps.join("; ")}).`;
}
//#endregion
//#region src/plugins/runtime/runtime-system.ts
const runHeartbeatOnceInternal = createLazyRuntimeMethod(createLazyRuntimeModule(() => import("./heartbeat-runner-BZVAwrbJ.js")), (runtime) => runtime.runHeartbeatOnce);
function createRuntimeSystem() {
	return {
		enqueueSystemEvent,
		requestHeartbeatNow,
		runHeartbeatOnce: (opts) => {
			const { reason, agentId, sessionKey, heartbeat } = opts ?? {};
			return runHeartbeatOnceInternal({
				reason,
				agentId,
				sessionKey,
				heartbeat: heartbeat ? { target: heartbeat.target } : void 0
			});
		},
		runCommandWithTimeout,
		formatNativeDependencyHint
	};
}
//#endregion
//#region src/plugins/runtime/runtime-taskflow.ts
function assertSessionKey$1(sessionKey, errorMessage) {
	const normalized = sessionKey?.trim();
	if (!normalized) throw new Error(errorMessage);
	return normalized;
}
function asManagedTaskFlowRecord(flow) {
	if (!flow || flow.syncMode !== "managed" || !flow.controllerId) return;
	return flow;
}
function resolveManagedFlowForOwner(params) {
	const flow = getTaskFlowByIdForOwner({
		flowId: params.flowId,
		callerOwnerKey: params.ownerKey
	});
	if (!flow) return {
		ok: false,
		code: "not_found"
	};
	const managed = asManagedTaskFlowRecord(flow);
	if (!managed) return {
		ok: false,
		code: "not_managed",
		current: flow
	};
	return {
		ok: true,
		flow: managed
	};
}
function mapFlowUpdateResult(result) {
	if (result.applied) {
		const managed = asManagedTaskFlowRecord(result.flow);
		if (!managed) return {
			applied: false,
			code: "not_managed",
			current: result.flow
		};
		return {
			applied: true,
			flow: managed
		};
	}
	return {
		applied: false,
		code: result.reason,
		...result.current ? { current: result.current } : {}
	};
}
function createBoundTaskFlowRuntime(params) {
	const ownerKey = assertSessionKey$1(params.sessionKey, "TaskFlow runtime requires a bound sessionKey.");
	const requesterOrigin = params.requesterOrigin ? normalizeDeliveryContext(params.requesterOrigin) : void 0;
	return {
		sessionKey: ownerKey,
		...requesterOrigin ? { requesterOrigin } : {},
		createManaged: (input) => createManagedTaskFlow({
			ownerKey,
			controllerId: input.controllerId,
			requesterOrigin,
			status: input.status,
			notifyPolicy: input.notifyPolicy,
			goal: input.goal,
			currentStep: input.currentStep,
			stateJson: input.stateJson,
			waitJson: input.waitJson,
			cancelRequestedAt: input.cancelRequestedAt,
			createdAt: input.createdAt,
			updatedAt: input.updatedAt,
			endedAt: input.endedAt
		}),
		get: (flowId) => getTaskFlowByIdForOwner({
			flowId,
			callerOwnerKey: ownerKey
		}),
		list: () => listTaskFlowsForOwner({ callerOwnerKey: ownerKey }),
		findLatest: () => findLatestTaskFlowForOwner({ callerOwnerKey: ownerKey }),
		resolve: (token) => resolveTaskFlowForLookupTokenForOwner({
			token,
			callerOwnerKey: ownerKey
		}),
		getTaskSummary: (flowId) => {
			const flow = getTaskFlowByIdForOwner({
				flowId,
				callerOwnerKey: ownerKey
			});
			return flow ? getFlowTaskSummary(flow.flowId) : void 0;
		},
		setWaiting: (input) => {
			const flow = resolveManagedFlowForOwner({
				flowId: input.flowId,
				ownerKey
			});
			if (!flow.ok) return {
				applied: false,
				code: flow.code,
				...flow.current ? { current: flow.current } : {}
			};
			return mapFlowUpdateResult(setFlowWaiting({
				flowId: flow.flow.flowId,
				expectedRevision: input.expectedRevision,
				currentStep: input.currentStep,
				stateJson: input.stateJson,
				waitJson: input.waitJson,
				blockedTaskId: input.blockedTaskId,
				blockedSummary: input.blockedSummary,
				updatedAt: input.updatedAt
			}));
		},
		resume: (input) => {
			const flow = resolveManagedFlowForOwner({
				flowId: input.flowId,
				ownerKey
			});
			if (!flow.ok) return {
				applied: false,
				code: flow.code,
				...flow.current ? { current: flow.current } : {}
			};
			return mapFlowUpdateResult(resumeFlow({
				flowId: flow.flow.flowId,
				expectedRevision: input.expectedRevision,
				status: input.status,
				currentStep: input.currentStep,
				stateJson: input.stateJson,
				updatedAt: input.updatedAt
			}));
		},
		finish: (input) => {
			const flow = resolveManagedFlowForOwner({
				flowId: input.flowId,
				ownerKey
			});
			if (!flow.ok) return {
				applied: false,
				code: flow.code,
				...flow.current ? { current: flow.current } : {}
			};
			return mapFlowUpdateResult(finishFlow({
				flowId: flow.flow.flowId,
				expectedRevision: input.expectedRevision,
				stateJson: input.stateJson,
				updatedAt: input.updatedAt,
				endedAt: input.endedAt
			}));
		},
		fail: (input) => {
			const flow = resolveManagedFlowForOwner({
				flowId: input.flowId,
				ownerKey
			});
			if (!flow.ok) return {
				applied: false,
				code: flow.code,
				...flow.current ? { current: flow.current } : {}
			};
			return mapFlowUpdateResult(failFlow({
				flowId: flow.flow.flowId,
				expectedRevision: input.expectedRevision,
				stateJson: input.stateJson,
				blockedTaskId: input.blockedTaskId,
				blockedSummary: input.blockedSummary,
				updatedAt: input.updatedAt,
				endedAt: input.endedAt
			}));
		},
		requestCancel: (input) => {
			const flow = resolveManagedFlowForOwner({
				flowId: input.flowId,
				ownerKey
			});
			if (!flow.ok) return {
				applied: false,
				code: flow.code,
				...flow.current ? { current: flow.current } : {}
			};
			return mapFlowUpdateResult(requestFlowCancel({
				flowId: flow.flow.flowId,
				expectedRevision: input.expectedRevision,
				cancelRequestedAt: input.cancelRequestedAt
			}));
		},
		cancel: ({ flowId, cfg }) => cancelFlowByIdForOwner({
			cfg,
			flowId,
			callerOwnerKey: ownerKey
		}),
		runTask: (input) => {
			const created = runTaskInFlowForOwner({
				flowId: input.flowId,
				callerOwnerKey: ownerKey,
				runtime: input.runtime,
				sourceId: input.sourceId,
				childSessionKey: input.childSessionKey,
				parentTaskId: input.parentTaskId,
				agentId: input.agentId,
				runId: input.runId,
				label: input.label,
				task: input.task,
				preferMetadata: input.preferMetadata,
				notifyPolicy: input.notifyPolicy,
				deliveryStatus: input.deliveryStatus,
				status: input.status,
				startedAt: input.startedAt,
				lastEventAt: input.lastEventAt,
				progressSummary: input.progressSummary
			});
			if (!created.created) return {
				created: false,
				found: created.found,
				reason: created.reason ?? "Task was not created.",
				...created.flow ? { flow: created.flow } : {}
			};
			const managed = asManagedTaskFlowRecord(created.flow);
			if (!managed) return {
				created: false,
				found: true,
				reason: "TaskFlow does not accept managed child tasks.",
				flow: created.flow
			};
			if (!created.task) return {
				created: false,
				found: true,
				reason: "Task was not created.",
				flow: created.flow
			};
			return {
				created: true,
				flow: managed,
				task: created.task
			};
		}
	};
}
function createRuntimeTaskFlow() {
	return {
		bindSession: (params) => createBoundTaskFlowRuntime({
			sessionKey: params.sessionKey,
			requesterOrigin: params.requesterOrigin
		}),
		fromToolContext: (ctx) => createBoundTaskFlowRuntime({
			sessionKey: assertSessionKey$1(ctx.sessionKey, "TaskFlow runtime requires tool context with a sessionKey."),
			requesterOrigin: ctx.deliveryContext
		})
	};
}
//#endregion
//#region src/tasks/task-domain-views.ts
function mapTaskRunAggregateSummary(summary) {
	return {
		total: summary.total,
		active: summary.active,
		terminal: summary.terminal,
		failures: summary.failures,
		byStatus: { ...summary.byStatus },
		byRuntime: { ...summary.byRuntime }
	};
}
function mapTaskRunView(task) {
	return {
		id: task.taskId,
		runtime: task.runtime,
		...task.sourceId ? { sourceId: task.sourceId } : {},
		sessionKey: task.requesterSessionKey,
		ownerKey: task.ownerKey,
		scope: task.scopeKind,
		...task.childSessionKey ? { childSessionKey: task.childSessionKey } : {},
		...task.parentFlowId ? { flowId: task.parentFlowId } : {},
		...task.parentTaskId ? { parentTaskId: task.parentTaskId } : {},
		...task.agentId ? { agentId: task.agentId } : {},
		...task.runId ? { runId: task.runId } : {},
		...task.label ? { label: task.label } : {},
		title: task.task,
		status: task.status,
		deliveryStatus: task.deliveryStatus,
		notifyPolicy: task.notifyPolicy,
		createdAt: task.createdAt,
		...task.startedAt !== void 0 ? { startedAt: task.startedAt } : {},
		...task.endedAt !== void 0 ? { endedAt: task.endedAt } : {},
		...task.lastEventAt !== void 0 ? { lastEventAt: task.lastEventAt } : {},
		...task.cleanupAfter !== void 0 ? { cleanupAfter: task.cleanupAfter } : {},
		...task.error ? { error: task.error } : {},
		...task.progressSummary ? { progressSummary: task.progressSummary } : {},
		...task.terminalSummary ? { terminalSummary: task.terminalSummary } : {},
		...task.terminalOutcome ? { terminalOutcome: task.terminalOutcome } : {}
	};
}
function mapTaskRunDetail(task) {
	return mapTaskRunView(task);
}
function mapTaskFlowView(flow) {
	return {
		id: flow.flowId,
		ownerKey: flow.ownerKey,
		...flow.requesterOrigin ? { requesterOrigin: { ...flow.requesterOrigin } } : {},
		status: flow.status,
		notifyPolicy: flow.notifyPolicy,
		goal: flow.goal,
		...flow.currentStep ? { currentStep: flow.currentStep } : {},
		...flow.cancelRequestedAt !== void 0 ? { cancelRequestedAt: flow.cancelRequestedAt } : {},
		createdAt: flow.createdAt,
		updatedAt: flow.updatedAt,
		...flow.endedAt !== void 0 ? { endedAt: flow.endedAt } : {}
	};
}
function mapTaskFlowDetail(params) {
	const summary = params.summary ?? summarizeTaskRecords(params.tasks);
	return {
		...mapTaskFlowView(params.flow),
		...params.flow.stateJson !== void 0 ? { state: params.flow.stateJson } : {},
		...params.flow.waitJson !== void 0 ? { wait: params.flow.waitJson } : {},
		...params.flow.blockedTaskId || params.flow.blockedSummary ? { blocked: {
			...params.flow.blockedTaskId ? { taskId: params.flow.blockedTaskId } : {},
			...params.flow.blockedSummary ? { summary: params.flow.blockedSummary } : {}
		} } : {},
		tasks: params.tasks.map((task) => mapTaskRunView(task)),
		taskSummary: mapTaskRunAggregateSummary(summary)
	};
}
//#endregion
//#region src/plugins/runtime/runtime-tasks.ts
function assertSessionKey(sessionKey, errorMessage) {
	const normalized = sessionKey?.trim();
	if (!normalized) throw new Error(errorMessage);
	return normalized;
}
function mapCancelledTaskResult(result) {
	return {
		found: result.found,
		cancelled: result.cancelled,
		...result.reason ? { reason: result.reason } : {},
		...result.task ? { task: mapTaskRunDetail(result.task) } : {}
	};
}
function createBoundTaskRunsRuntime(params) {
	const ownerKey = assertSessionKey(params.sessionKey, "Tasks runtime requires a bound sessionKey.");
	const requesterOrigin = params.requesterOrigin ? normalizeDeliveryContext(params.requesterOrigin) : void 0;
	return {
		sessionKey: ownerKey,
		...requesterOrigin ? { requesterOrigin } : {},
		get: (taskId) => {
			const task = getTaskByIdForOwner({
				taskId,
				callerOwnerKey: ownerKey
			});
			return task ? mapTaskRunDetail(task) : void 0;
		},
		list: () => listTasksForRelatedSessionKeyForOwner({
			relatedSessionKey: ownerKey,
			callerOwnerKey: ownerKey
		}).map((task) => mapTaskRunView(task)),
		findLatest: () => {
			const task = findLatestTaskForRelatedSessionKeyForOwner({
				relatedSessionKey: ownerKey,
				callerOwnerKey: ownerKey
			});
			return task ? mapTaskRunDetail(task) : void 0;
		},
		resolve: (token) => {
			const task = resolveTaskForLookupTokenForOwner({
				token,
				callerOwnerKey: ownerKey
			});
			return task ? mapTaskRunDetail(task) : void 0;
		},
		cancel: async ({ taskId, cfg }) => {
			const task = getTaskByIdForOwner({
				taskId,
				callerOwnerKey: ownerKey
			});
			if (!task) return {
				found: false,
				cancelled: false,
				reason: "Task not found."
			};
			return mapCancelledTaskResult(await cancelDetachedTaskRunById({
				cfg,
				taskId: task.taskId
			}));
		}
	};
}
function createBoundTaskFlowsRuntime(params) {
	const ownerKey = assertSessionKey(params.sessionKey, "TaskFlow runtime requires a bound sessionKey.");
	const requesterOrigin = params.requesterOrigin ? normalizeDeliveryContext(params.requesterOrigin) : void 0;
	const getDetail = (flowId) => {
		const flow = getTaskFlowByIdForOwner({
			flowId,
			callerOwnerKey: ownerKey
		});
		if (!flow) return;
		return mapTaskFlowDetail({
			flow,
			tasks: listTasksForFlowId(flow.flowId),
			summary: getFlowTaskSummary(flow.flowId)
		});
	};
	return {
		sessionKey: ownerKey,
		...requesterOrigin ? { requesterOrigin } : {},
		get: (flowId) => getDetail(flowId),
		list: () => listTaskFlowsForOwner({ callerOwnerKey: ownerKey }).map((flow) => mapTaskFlowView(flow)),
		findLatest: () => {
			const flow = findLatestTaskFlowForOwner({ callerOwnerKey: ownerKey });
			return flow ? getDetail(flow.flowId) : void 0;
		},
		resolve: (token) => {
			const flow = resolveTaskFlowForLookupTokenForOwner({
				token,
				callerOwnerKey: ownerKey
			});
			return flow ? getDetail(flow.flowId) : void 0;
		},
		getTaskSummary: (flowId) => {
			const flow = getTaskFlowByIdForOwner({
				flowId,
				callerOwnerKey: ownerKey
			});
			return flow ? mapTaskRunAggregateSummary(getFlowTaskSummary(flow.flowId)) : void 0;
		}
	};
}
function createRuntimeTaskRuns() {
	return {
		bindSession: (params) => createBoundTaskRunsRuntime({
			sessionKey: params.sessionKey,
			requesterOrigin: params.requesterOrigin
		}),
		fromToolContext: (ctx) => createBoundTaskRunsRuntime({
			sessionKey: assertSessionKey(ctx.sessionKey, "Tasks runtime requires tool context with a sessionKey."),
			requesterOrigin: ctx.deliveryContext
		})
	};
}
function createRuntimeTaskFlows() {
	return {
		bindSession: (params) => createBoundTaskFlowsRuntime({
			sessionKey: params.sessionKey,
			requesterOrigin: params.requesterOrigin
		}),
		fromToolContext: (ctx) => createBoundTaskFlowsRuntime({
			sessionKey: assertSessionKey(ctx.sessionKey, "TaskFlow runtime requires tool context with a sessionKey."),
			requesterOrigin: ctx.deliveryContext
		})
	};
}
function createRuntimeTasks(params) {
	return {
		runs: createRuntimeTaskRuns(),
		flows: createRuntimeTaskFlows(),
		flow: params.legacyTaskFlow
	};
}
//#endregion
//#region src/plugins/runtime/index.ts
const loadTtsRuntime = createLazyRuntimeModule(() => import("./tts-BV-5XkAc.js"));
const loadMediaUnderstandingRuntime = createLazyRuntimeModule(() => import("./runtime-BGWu5iSY.js"));
const loadModelAuthRuntime = createLazyRuntimeModule(() => import("./runtime-model-auth.runtime-BTlk5Dgp.js"));
function createRuntimeTts() {
	const bindTtsRuntime = createLazyRuntimeMethodBinder(loadTtsRuntime);
	return {
		textToSpeech: bindTtsRuntime((runtime) => runtime.textToSpeech),
		textToSpeechTelephony: bindTtsRuntime((runtime) => runtime.textToSpeechTelephony),
		listVoices: bindTtsRuntime((runtime) => runtime.listSpeechVoices)
	};
}
function createRuntimeMediaUnderstandingFacade() {
	const bindMediaUnderstandingRuntime = createLazyRuntimeMethodBinder(loadMediaUnderstandingRuntime);
	return {
		runFile: bindMediaUnderstandingRuntime((runtime) => runtime.runMediaUnderstandingFile),
		describeImageFile: bindMediaUnderstandingRuntime((runtime) => runtime.describeImageFile),
		describeImageFileWithModel: bindMediaUnderstandingRuntime((runtime) => runtime.describeImageFileWithModel),
		describeVideoFile: bindMediaUnderstandingRuntime((runtime) => runtime.describeVideoFile),
		transcribeAudioFile: bindMediaUnderstandingRuntime((runtime) => runtime.transcribeAudioFile)
	};
}
function createRuntimeImageGeneration() {
	return {
		generate: (params) => generateImage(params),
		listProviders: (params) => listRuntimeImageGenerationProviders(params)
	};
}
function createRuntimeVideoGeneration() {
	return {
		generate: (params) => generateVideo(params),
		listProviders: (params) => listRuntimeVideoGenerationProviders(params)
	};
}
function createRuntimeMusicGeneration() {
	return {
		generate: (params) => generateMusic(params),
		listProviders: (params) => listRuntimeMusicGenerationProviders(params)
	};
}
function createRuntimeModelAuth() {
	const getApiKeyForModel = createLazyRuntimeMethod(loadModelAuthRuntime, (runtime) => runtime.getApiKeyForModel);
	const getRuntimeAuthForModel = createLazyRuntimeMethod(loadModelAuthRuntime, (runtime) => runtime.getRuntimeAuthForModel);
	const resolveApiKeyForProvider = createLazyRuntimeMethod(loadModelAuthRuntime, (runtime) => runtime.resolveApiKeyForProvider);
	return {
		getApiKeyForModel: (params) => getApiKeyForModel({
			model: params.model,
			cfg: params.cfg
		}),
		getRuntimeAuthForModel: (params) => getRuntimeAuthForModel({
			model: params.model,
			cfg: params.cfg,
			workspaceDir: params.workspaceDir
		}),
		resolveApiKeyForProvider: (params) => resolveApiKeyForProvider({
			provider: params.provider,
			cfg: params.cfg
		})
	};
}
function createUnavailableSubagentRuntime() {
	const unavailable = () => {
		throw new RequestScopedSubagentRuntimeError();
	};
	return {
		run: unavailable,
		waitForRun: unavailable,
		getSessionMessages: unavailable,
		getSession: unavailable,
		deleteSession: unavailable
	};
}
/**
* Create a late-binding subagent that resolves to:
* 1. An explicitly provided subagent (from runtimeOptions), OR
* 2. The process-global gateway subagent when the caller explicitly opts in, OR
* 3. The unavailable fallback (throws with a clear error message).
*/
function createLateBindingSubagent(explicit, allowGatewaySubagentBinding = false) {
	if (explicit) return explicit;
	const unavailable = createUnavailableSubagentRuntime();
	if (!allowGatewaySubagentBinding) return unavailable;
	return new Proxy(unavailable, { get(_target, prop, _receiver) {
		const resolved = gatewaySubagentState.subagent ?? unavailable;
		return Reflect.get(resolved, prop, resolved);
	} });
}
function createUnavailableNodesRuntime() {
	const unavailable = () => {
		throw new Error("Plugin node runtime is only available inside the Gateway.");
	};
	return {
		list: unavailable,
		invoke: unavailable
	};
}
function createLateBindingNodes(allowGatewayBinding = false) {
	const unavailable = createUnavailableNodesRuntime();
	if (!allowGatewayBinding) return unavailable;
	return new Proxy(unavailable, { get(_target, prop, _receiver) {
		const resolved = gatewaySubagentState.nodes ?? unavailable;
		return Reflect.get(resolved, prop, resolved);
	} });
}
function createPluginRuntime(_options = {}) {
	const mediaUnderstanding = createRuntimeMediaUnderstandingFacade();
	const taskFlow = createRuntimeTaskFlow();
	const tasks = createRuntimeTasks({ legacyTaskFlow: taskFlow });
	const runtime = {
		version: VERSION,
		config: createRuntimeConfig(),
		agent: createRuntimeAgent(),
		subagent: createLateBindingSubagent(_options.subagent, _options.allowGatewaySubagentBinding === true),
		nodes: _options.nodes ?? createLateBindingNodes(_options.allowGatewaySubagentBinding === true),
		system: createRuntimeSystem(),
		media: createRuntimeMedia(),
		webSearch: {
			listProviders: listWebSearchProviders,
			search: runWebSearch
		},
		channel: createRuntimeChannel(),
		events: createRuntimeEvents(),
		logging: createRuntimeLogging(),
		state: { resolveStateDir },
		tasks,
		taskFlow
	};
	defineCachedValue(runtime, "tts", createRuntimeTts);
	defineCachedValue(runtime, "mediaUnderstanding", () => mediaUnderstanding);
	defineCachedValue(runtime, "stt", () => ({ transcribeAudioFile: mediaUnderstanding.transcribeAudioFile }));
	defineCachedValue(runtime, "modelAuth", createRuntimeModelAuth);
	defineCachedValue(runtime, "imageGeneration", createRuntimeImageGeneration);
	defineCachedValue(runtime, "videoGeneration", createRuntimeVideoGeneration);
	defineCachedValue(runtime, "musicGeneration", createRuntimeMusicGeneration);
	return runtime;
}
//#endregion
export { createPluginRuntime as t };
