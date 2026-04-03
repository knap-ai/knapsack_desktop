import { a as hasErrnoCode, r as formatErrorMessage } from "./errors-Bs2h5H8p.js";
import { i as getChildLogger, y as normalizeLogLevel } from "./logger-BCzP_yik.js";
import { m as defaultRuntime, t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import { n as resolveGlobalSingleton } from "./global-singleton-BuWJMSMa.js";
import { l as escapeRegExp } from "./utils-CE3P21nG.js";
import { n as DEFAULT_MODEL, r as DEFAULT_PROVIDER } from "./defaults-BwiMD7ye.js";
import { n as VERSION } from "./version-TiEvEN12.js";
import { S as resolveThinkingDefault } from "./model-selection-8a6zD_aX.js";
import { _ as resolveStateDir } from "./paths-CD8i0MSg.js";
import { T as parseAgentSessionKey, c as normalizeAgentId, h as toAgentStoreSessionKey, u as resolveAgentIdFromSessionKey } from "./session-key-D7XpmyVq.js";
import { a as shouldLogVerbose } from "./globals-BJZkpw-q.js";
import { a as resolveAgentDir, i as resolveAgentConfig, m as resolveDefaultAgentId, p as resolveAgentWorkspaceDir } from "./agent-scope-CYXg_wTS.js";
import { a as logWarn } from "./logger-Dr2uNJI4.js";
import { r as runCommandWithTimeout } from "./exec-nWahKiCu.js";
import { d as ensureAgentWorkspace, i as DEFAULT_HEARTBEAT_FILENAME } from "./workspace-R-NeOkBt.js";
import { c as loadConfig, x as writeConfigFile } from "./io-DhtVmzAJ.js";
import { d as buildPluginLoaderJitiOptions, g as shouldPreferNativeJiti, u as buildPluginLoaderAliasMap } from "./chat-meta-Cdrnv7R-.js";
import "./config-CJQx-9zo.js";
import { d as updateSessionStore, i as loadSessionStore, l as saveSessionStore, o as readSessionUpdatedAt, s as recordSessionMetaFromInbound, u as updateLastRoute } from "./store-BGmy-Wot.js";
import { t as getChannelPlugin } from "./registry-fiJfPVib.js";
import "./plugins-DF32jmMU.js";
import { n as resolveAgentMainSessionKey, t as canonicalizeMainSessionAlias } from "./main-session-CFwamLE8.js";
import "./sessions-DC7OiAdD.js";
import { l as resolveStorePath, r as resolveSessionFilePath } from "./paths-DBIQqSpZ.js";
import { a as loadBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-D_0VC8Qr.js";
import { i as resolveSessionResetPolicy, n as evaluateSessionFreshness } from "./session-file-B_sG4I7G.js";
import { a as normalizeDeliveryContext } from "./delivery-context-BV8uXbJ1.js";
import { n as onSessionTranscriptUpdate } from "./transcript-events-KFgKuvkB.js";
import "./logging-C0VWvR36.js";
import { i as resolveHumanDelayConfig, n as resolveAgentIdentity, r as resolveEffectiveMessagesConfig } from "./identity-BVAU5Jb3.js";
import { t as HEARTBEAT_TOKEN } from "./tokens-Bot0VGKf.js";
import { a as stripHeartbeatToken, i as resolveHeartbeatPrompt$1, r as isHeartbeatContentEffectivelyEmpty } from "./heartbeat-CguHGkad.js";
import { $t as createManagedTaskFlow, Bn as onAgentEvent, Bt as listTaskFlowsForOwner, Ht as cancelTaskById, It as getFlowTaskSummary, J as getTaskByIdForOwner, K as findLatestTaskForRelatedSessionKeyForOwner, Lt as runTaskInFlowForOwner, Mt as cancelFlowByIdForOwner, Rt as findLatestTaskFlowForOwner, Vt as resolveTaskFlowForLookupTokenForOwner, X as resolveTaskForLookupTokenForOwner, Y as listTasksForRelatedSessionKeyForOwner, cn as resumeFlow, ln as setFlowWaiting, nn as finishFlow, on as requestFlowCancel, qt as listTasksForFlowId, tn as failFlow, zt as getTaskFlowByIdForOwner } from "./pi-embedded-BYdcxQ5A.js";
import { D as getQueueSize, N as CommandLane } from "./queue-CrmMgtZc.js";
import { f as clearBootstrapSnapshotOnSessionRollover, n as resolveAgentTimeoutMs } from "./content-blocks-CWb2xgCb.js";
import { a as getImageMetadata, l as resizeToJpeg } from "./image-ops-DjlnMkqM.js";
import { i as resolveUserTimezone } from "./date-time-836HB-p6.js";
import { m as mediaKindFromMime, t as detectMime } from "./mime-C9472kP8.js";
import { t as deliverOutboundPayloads } from "./deliver-BV9UlnxV.js";
import { C as setHeartbeatWakeHandler, S as requestHeartbeatNow, T as resolveHeartbeatReasonKind, x as areHeartbeatsEnabled } from "./model-runtime-D4KJqIwp.js";
import { l as resolveSystemEventDeliveryContext, o as peekSystemEventEntries, r as enqueueSystemEvent } from "./system-events-DOxYwk9w.js";
import { p as resolveSendableOutboundReplyParts, s as hasOutboundReplyContent } from "./reply-payload-SzVz53hc.js";
import { a as chunkText, c as resolveTextChunkLimit, i as chunkMarkdownTextWithMode, o as chunkTextWithMode, r as chunkMarkdownText, s as resolveChunkMode, t as chunkByNewline } from "./chunk-D6CtZg6q.js";
import { t as loadChannelOutboundAdapter } from "./load-1Moal5cB.js";
import { t as buildOutboundSessionContext } from "./session-context-Be2O9afs.js";
import { n as resolveHeartbeatSenderContext, t as resolveHeartbeatDeliveryTarget } from "./targets-DjOu09mG.js";
import { l as saveMediaBuffer } from "./store-CCBPdtW9.js";
import { n as fetchRemoteMedia } from "./fetch-ClF-ZgDC.js";
import { t as loadWebMedia } from "./web-media-4TOxrRxF.js";
import { a as createLazyRuntimeSurface, n as createLazyRuntimeMethodBinder, r as createLazyRuntimeModule, t as createLazyRuntimeMethod } from "./lazy-runtime-B4PzSTA5.js";
import { i as resolveAgentRoute, t as buildAgentSessionKey } from "./resolve-route-DID7K3Jm.js";
import { n as summarizeTaskRecords } from "./task-registry.summary-DqH4Nyhq.js";
import { y as shouldHandleTextCommands } from "./commands-registry-dA2_ExHR.js";
import { i as runWebSearch, n as listWebSearchProviders } from "./runtime-D06HuHUY.js";
import { n as resolveChannelGroupRequireMention, t as resolveChannelGroupPolicy } from "./group-policy-B1uRyci5.js";
import { t as appendCronStyleCurrentTimeLine } from "./current-time-D5BJUy-c.js";
import { i as shouldComputeCommandAuthorized, r as isControlCommandMessage, t as hasControlCommand } from "./command-detection-Bz_HOEgu.js";
import { c as dispatchReplyFromConfig, i as withReplyDispatcher, o as createReplyDispatcherWithTyping } from "./dispatch-C2z_6KF9.js";
import { t as finalizeInboundContext } from "./inbound-context-1KETU_yq.js";
import { a as resolveEnvelopeFormatOptions, r as formatInboundEnvelope, t as formatAgentEnvelope } from "./envelope-CTj2Ympv.js";
import { n as resolveInboundDebounceMs, t as createInboundDebouncer } from "./inbound-debounce-DcwkFaUr.js";
import { i as matchesMentionWithExplicit, n as buildMentionRegexes, r as matchesMentionPatterns } from "./mentions-Bfkn0E5p.js";
import { t as dispatchReplyWithBufferedBlockDispatcher } from "./provider-dispatcher-B2dh4tuq.js";
import { n as shouldAckReaction, t as removeAckReactionAfterReply } from "./ack-reactions-cTTW0IRo.js";
import { t as resolveCommandAuthorizedFromAuthorizers } from "./command-gating-Ch_OhMao.js";
import { t as recordInboundSession } from "./session-BiguA5nC.js";
import { t as resolveMarkdownTableMode } from "./markdown-tables-DAbwMp5F.js";
import { c as recordChannelActivity, n as emitHeartbeatEvent, o as resolveIndicatorType, s as getChannelActivity, t as resolveHeartbeatVisibility } from "./heartbeat-visibility-CIk_o9BM.js";
import { t as convertMarkdownTables } from "./tables-Dmh1EQ3k.js";
import { t as buildPairingReply } from "./pairing-messages-CHCwedho.js";
import { a as readChannelAllowFromStore, d as upsertChannelPairingRequest } from "./pairing-store-DxNrxr_7.js";
import { a as resolveThreadBindingIdleTimeoutMs, c as resolveThreadBindingMaxAgeMs, d as unbindThreadBindingsBySessionKey, l as setThreadBindingIdleTimeoutBySessionKey, o as resolveThreadBindingInactivityExpiresAt, r as getThreadBindingManager, s as resolveThreadBindingMaxAgeExpiresAt, u as setThreadBindingMaxAgeBySessionKey } from "./discord-thread-bindings-ClgIxmQz.js";
import { u as discordMessageActions } from "./discord-runtime-surface-B-TFSuFq.js";
import { n as resolvePluginRuntimeModulePath, r as resolvePluginRuntimeRecord, t as loadPluginBoundaryModuleWithJiti } from "./runtime-plugin-boundary-BrIbTCFo.js";
import { a as probeSignal, d as signalMessageActions, i as monitorSignalProvider, l as sendMessageSignal } from "./signal-surface-ymLRor-m.js";
import "./signal-Cf9oPQhJ.js";
import { i as isVoiceCompatibleAudio } from "./audio-C5jg10kq.js";
import { t as resolveHeartbeatReplyPayload } from "./heartbeat-reply-payload-enSdLyYn.js";
import { t as getReplyFromConfig } from "./reply-BilMVRVo.js";
import { n as resolveHeartbeatIntervalMs, t as isHeartbeatEnabledForAgent } from "./heartbeat-summary-By73B04h.js";
import { fileURLToPath } from "node:url";
import fsSync from "node:fs";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { createJiti } from "jiti";
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
const loadEmbeddedPiRuntime = createLazyRuntimeModule(() => import("./runtime-embedded-pi.runtime-BWG_bgC5.js"));
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
//#region src/channels/plugins/conversation-bindings.ts
function setChannelConversationBindingIdleTimeoutBySessionKey(params) {
	const setIdleTimeoutBySessionKey = getChannelPlugin(params.channelId)?.conversationBindings?.setIdleTimeoutBySessionKey;
	if (!setIdleTimeoutBySessionKey) return [];
	return setIdleTimeoutBySessionKey({
		targetSessionKey: params.targetSessionKey,
		accountId: params.accountId,
		idleTimeoutMs: params.idleTimeoutMs
	});
}
function setChannelConversationBindingMaxAgeBySessionKey(params) {
	const setMaxAgeBySessionKey = getChannelPlugin(params.channelId)?.conversationBindings?.setMaxAgeBySessionKey;
	if (!setMaxAgeBySessionKey) return [];
	return setMaxAgeBySessionKey({
		targetSessionKey: params.targetSessionKey,
		accountId: params.accountId,
		maxAgeMs: params.maxAgeMs
	});
}
//#endregion
//#region src/plugins/runtime/typing-lease.ts
async function createTypingLease(params) {
	const intervalMs = typeof params.intervalMs === "number" && Number.isFinite(params.intervalMs) ? Math.max(1e3, Math.floor(params.intervalMs)) : params.defaultIntervalMs;
	let stopped = false;
	let timer = null;
	const pulse = async () => {
		if (stopped) return;
		await params.pulse(params.pulseArgs);
	};
	await pulse();
	timer = setInterval(() => {
		pulse().catch((err) => {
			logWarn(`plugins: ${params.errorLabel} typing pulse failed: ${String(err)}`);
		});
	}, intervalMs);
	timer.unref?.();
	return {
		refresh: async () => {
			await pulse();
		},
		stop: () => {
			stopped = true;
			if (timer) {
				clearInterval(timer);
				timer = null;
			}
		}
	};
}
//#endregion
//#region src/plugins/runtime/runtime-discord-typing.ts
const DEFAULT_DISCORD_TYPING_INTERVAL_MS = 8e3;
async function createDiscordTypingLease(params) {
	return await createTypingLease({
		defaultIntervalMs: DEFAULT_DISCORD_TYPING_INTERVAL_MS,
		errorLabel: "discord",
		intervalMs: params.intervalMs,
		pulse: params.pulse,
		pulseArgs: {
			channelId: params.channelId,
			accountId: params.accountId,
			cfg: params.cfg
		}
	});
}
//#endregion
//#region src/plugins/runtime/runtime-discord.ts
const bindDiscordRuntimeMethod = createLazyRuntimeMethodBinder(createLazyRuntimeSurface(() => import("./runtime-discord-ops.runtime-mTLnyp4C.js"), ({ runtimeDiscordOps }) => runtimeDiscordOps));
const auditChannelPermissionsLazy = bindDiscordRuntimeMethod((runtimeDiscordOps) => runtimeDiscordOps.auditChannelPermissions);
const listDirectoryGroupsLiveLazy$1 = bindDiscordRuntimeMethod((runtimeDiscordOps) => runtimeDiscordOps.listDirectoryGroupsLive);
const listDirectoryPeersLiveLazy$1 = bindDiscordRuntimeMethod((runtimeDiscordOps) => runtimeDiscordOps.listDirectoryPeersLive);
const probeDiscordLazy = bindDiscordRuntimeMethod((runtimeDiscordOps) => runtimeDiscordOps.probeDiscord);
const resolveChannelAllowlistLazy$1 = bindDiscordRuntimeMethod((runtimeDiscordOps) => runtimeDiscordOps.resolveChannelAllowlist);
const resolveUserAllowlistLazy$1 = bindDiscordRuntimeMethod((runtimeDiscordOps) => runtimeDiscordOps.resolveUserAllowlist);
const sendComponentMessageLazy = bindDiscordRuntimeMethod((runtimeDiscordOps) => runtimeDiscordOps.sendComponentMessage);
const sendMessageDiscordLazy = bindDiscordRuntimeMethod((runtimeDiscordOps) => runtimeDiscordOps.sendMessageDiscord);
const sendPollDiscordLazy = bindDiscordRuntimeMethod((runtimeDiscordOps) => runtimeDiscordOps.sendPollDiscord);
const monitorDiscordProviderLazy = bindDiscordRuntimeMethod((runtimeDiscordOps) => runtimeDiscordOps.monitorDiscordProvider);
const sendTypingDiscordLazy = bindDiscordRuntimeMethod((runtimeDiscordOps) => runtimeDiscordOps.typing.pulse);
const editMessageDiscordLazy = bindDiscordRuntimeMethod((runtimeDiscordOps) => runtimeDiscordOps.conversationActions.editMessage);
const deleteMessageDiscordLazy = bindDiscordRuntimeMethod((runtimeDiscordOps) => runtimeDiscordOps.conversationActions.deleteMessage);
const pinMessageDiscordLazy = bindDiscordRuntimeMethod((runtimeDiscordOps) => runtimeDiscordOps.conversationActions.pinMessage);
const unpinMessageDiscordLazy = bindDiscordRuntimeMethod((runtimeDiscordOps) => runtimeDiscordOps.conversationActions.unpinMessage);
const createThreadDiscordLazy = bindDiscordRuntimeMethod((runtimeDiscordOps) => runtimeDiscordOps.conversationActions.createThread);
const editChannelDiscordLazy = bindDiscordRuntimeMethod((runtimeDiscordOps) => runtimeDiscordOps.conversationActions.editChannel);
function createRuntimeDiscord() {
	return {
		messageActions: discordMessageActions,
		auditChannelPermissions: auditChannelPermissionsLazy,
		listDirectoryGroupsLive: listDirectoryGroupsLiveLazy$1,
		listDirectoryPeersLive: listDirectoryPeersLiveLazy$1,
		probeDiscord: probeDiscordLazy,
		resolveChannelAllowlist: resolveChannelAllowlistLazy$1,
		resolveUserAllowlist: resolveUserAllowlistLazy$1,
		sendComponentMessage: sendComponentMessageLazy,
		sendMessageDiscord: sendMessageDiscordLazy,
		sendPollDiscord: sendPollDiscordLazy,
		monitorDiscordProvider: monitorDiscordProviderLazy,
		threadBindings: {
			getManager: getThreadBindingManager,
			resolveIdleTimeoutMs: resolveThreadBindingIdleTimeoutMs,
			resolveInactivityExpiresAt: resolveThreadBindingInactivityExpiresAt,
			resolveMaxAgeMs: resolveThreadBindingMaxAgeMs,
			resolveMaxAgeExpiresAt: resolveThreadBindingMaxAgeExpiresAt,
			setIdleTimeoutBySessionKey: setThreadBindingIdleTimeoutBySessionKey,
			setMaxAgeBySessionKey: setThreadBindingMaxAgeBySessionKey,
			unbindBySessionKey: unbindThreadBindingsBySessionKey
		},
		typing: {
			pulse: sendTypingDiscordLazy,
			start: async ({ channelId, accountId, cfg, intervalMs }) => await createDiscordTypingLease({
				channelId,
				accountId,
				cfg,
				intervalMs,
				pulse: async ({ channelId, accountId, cfg }) => void await sendTypingDiscordLazy(channelId, {
					accountId,
					cfg
				})
			})
		},
		conversationActions: {
			editMessage: editMessageDiscordLazy,
			deleteMessage: deleteMessageDiscordLazy,
			pinMessage: pinMessageDiscordLazy,
			unpinMessage: unpinMessageDiscordLazy,
			createThread: createThreadDiscordLazy,
			editChannel: editChannelDiscordLazy
		}
	};
}
//#endregion
//#region src/plugins/runtime/local-runtime-module.ts
const RUNTIME_MODULE_EXTENSIONS = [
	".js",
	".ts",
	".mjs",
	".mts",
	".cjs",
	".cts"
];
const jitiLoaders$1 = /* @__PURE__ */ new Map();
function resolveSiblingRuntimeModulePath(moduleUrl, relativeBase) {
	const baseDir = path.dirname(fileURLToPath(moduleUrl));
	const baseName = relativeBase.replace(/^\.\//, "");
	const candidateDirs = [baseDir, path.resolve(baseDir, "plugins", "runtime")];
	for (const dir of candidateDirs) for (const ext of RUNTIME_MODULE_EXTENSIONS) {
		const candidate = path.resolve(dir, `${baseName}${ext}`);
		if (fsSync.existsSync(candidate)) return candidate;
	}
	throw new Error(`Unable to resolve runtime module ${relativeBase} from ${moduleUrl}`);
}
function getJiti(modulePath, moduleUrl) {
	const tryNative = shouldPreferNativeJiti(modulePath);
	const aliasMap = buildPluginLoaderAliasMap(modulePath, process.argv[1], moduleUrl);
	const cacheKey = JSON.stringify({
		tryNative,
		aliasMap: Object.entries(aliasMap).toSorted(([left], [right]) => left.localeCompare(right)),
		moduleUrl
	});
	const cached = jitiLoaders$1.get(cacheKey);
	if (cached) return cached;
	const loader = createJiti(moduleUrl, {
		...buildPluginLoaderJitiOptions(aliasMap),
		tryNative
	});
	jitiLoaders$1.set(cacheKey, loader);
	return loader;
}
function loadSiblingRuntimeModuleSync(params) {
	const modulePath = resolveSiblingRuntimeModulePath(params.moduleUrl, params.relativeBase);
	return getJiti(modulePath, params.moduleUrl)(modulePath);
}
//#endregion
//#region src/plugins/runtime/runtime-line.ts
let cachedRuntimeLineModule = null;
function loadRuntimeLineModule() {
	cachedRuntimeLineModule ??= loadSiblingRuntimeModuleSync({
		moduleUrl: import.meta.url,
		relativeBase: "./runtime-line.contract"
	});
	return cachedRuntimeLineModule;
}
function createRuntimeLine() {
	return {
		listLineAccountIds: (...args) => loadRuntimeLineModule().runtimeLine.listLineAccountIds(...args),
		resolveDefaultLineAccountId: (...args) => loadRuntimeLineModule().runtimeLine.resolveDefaultLineAccountId(...args),
		resolveLineAccount: (...args) => loadRuntimeLineModule().runtimeLine.resolveLineAccount(...args),
		normalizeAccountId: (...args) => loadRuntimeLineModule().runtimeLine.normalizeAccountId(...args),
		probeLineBot: (...args) => loadRuntimeLineModule().runtimeLine.probeLineBot(...args),
		sendMessageLine: (...args) => loadRuntimeLineModule().runtimeLine.sendMessageLine(...args),
		pushMessageLine: (...args) => loadRuntimeLineModule().runtimeLine.pushMessageLine(...args),
		pushMessagesLine: (...args) => loadRuntimeLineModule().runtimeLine.pushMessagesLine(...args),
		pushFlexMessage: (...args) => loadRuntimeLineModule().runtimeLine.pushFlexMessage(...args),
		pushTemplateMessage: (...args) => loadRuntimeLineModule().runtimeLine.pushTemplateMessage(...args),
		pushLocationMessage: (...args) => loadRuntimeLineModule().runtimeLine.pushLocationMessage(...args),
		pushTextMessageWithQuickReplies: (...args) => loadRuntimeLineModule().runtimeLine.pushTextMessageWithQuickReplies(...args),
		createQuickReplyItems: (...args) => loadRuntimeLineModule().runtimeLine.createQuickReplyItems(...args),
		buildTemplateMessageFromPayload: (...args) => loadRuntimeLineModule().runtimeLine.buildTemplateMessageFromPayload(...args),
		monitorLineProvider: (...args) => loadRuntimeLineModule().runtimeLine.monitorLineProvider(...args)
	};
}
//#endregion
//#region src/plugins/runtime/runtime-matrix-boundary.ts
const MATRIX_PLUGIN_ID = "matrix";
let cachedModulePath = null;
let cachedModule = null;
const jitiLoaders = /* @__PURE__ */ new Map();
function resolveMatrixPluginRecord() {
	return resolvePluginRuntimeRecord(MATRIX_PLUGIN_ID);
}
function resolveMatrixRuntimeModulePath(record) {
	return resolvePluginRuntimeModulePath(record, "runtime-api");
}
function loadMatrixModule() {
	const record = resolveMatrixPluginRecord();
	if (!record) return null;
	const modulePath = resolveMatrixRuntimeModulePath(record);
	if (!modulePath) return null;
	if (cachedModule && cachedModulePath === modulePath) return cachedModule;
	const loaded = loadPluginBoundaryModuleWithJiti(modulePath, jitiLoaders);
	cachedModulePath = modulePath;
	cachedModule = loaded;
	return loaded;
}
function setMatrixThreadBindingIdleTimeoutBySessionKey(...args) {
	const fn = loadMatrixModule()?.setMatrixThreadBindingIdleTimeoutBySessionKey;
	if (typeof fn !== "function") return [];
	return fn(...args);
}
function setMatrixThreadBindingMaxAgeBySessionKey(...args) {
	const fn = loadMatrixModule()?.setMatrixThreadBindingMaxAgeBySessionKey;
	if (typeof fn !== "function") return [];
	return fn(...args);
}
//#endregion
//#region src/plugins/runtime/runtime-matrix.ts
function createRuntimeMatrix() {
	return { threadBindings: {
		setIdleTimeoutBySessionKey: setMatrixThreadBindingIdleTimeoutBySessionKey,
		setMaxAgeBySessionKey: setMatrixThreadBindingMaxAgeBySessionKey
	} };
}
//#endregion
//#region src/plugins/runtime/runtime-signal.ts
function createRuntimeSignal() {
	return {
		probeSignal,
		sendMessageSignal,
		monitorSignalProvider,
		messageActions: signalMessageActions
	};
}
//#endregion
//#region src/plugins/runtime/runtime-slack.ts
const bindSlackRuntimeMethod = createLazyRuntimeMethodBinder(createLazyRuntimeSurface(() => import("./runtime-slack-ops.runtime-RW4UUYHI.js"), ({ runtimeSlackOps }) => runtimeSlackOps));
const listDirectoryGroupsLiveLazy = bindSlackRuntimeMethod((runtimeSlackOps) => runtimeSlackOps.listDirectoryGroupsLive);
const listDirectoryPeersLiveLazy = bindSlackRuntimeMethod((runtimeSlackOps) => runtimeSlackOps.listDirectoryPeersLive);
const probeSlackLazy = bindSlackRuntimeMethod((runtimeSlackOps) => runtimeSlackOps.probeSlack);
const resolveChannelAllowlistLazy = bindSlackRuntimeMethod((runtimeSlackOps) => runtimeSlackOps.resolveChannelAllowlist);
const resolveUserAllowlistLazy = bindSlackRuntimeMethod((runtimeSlackOps) => runtimeSlackOps.resolveUserAllowlist);
const sendMessageSlackLazy = bindSlackRuntimeMethod((runtimeSlackOps) => runtimeSlackOps.sendMessageSlack);
const monitorSlackProviderLazy = bindSlackRuntimeMethod((runtimeSlackOps) => runtimeSlackOps.monitorSlackProvider);
const handleSlackActionLazy = bindSlackRuntimeMethod((runtimeSlackOps) => runtimeSlackOps.handleSlackAction);
function createRuntimeSlack() {
	return {
		listDirectoryGroupsLive: listDirectoryGroupsLiveLazy,
		listDirectoryPeersLive: listDirectoryPeersLiveLazy,
		probeSlack: probeSlackLazy,
		resolveChannelAllowlist: resolveChannelAllowlistLazy,
		resolveUserAllowlist: resolveUserAllowlistLazy,
		sendMessageSlack: sendMessageSlackLazy,
		monitorSlackProvider: monitorSlackProviderLazy,
		handleSlackAction: handleSlackActionLazy
	};
}
//#endregion
//#region src/plugins/runtime/runtime-channel.ts
function createRuntimeChannel() {
	const channelRuntime = {
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
			matchesMentionWithExplicit
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
			setIdleTimeoutBySessionKey: ({ channelId, targetSessionKey, accountId, idleTimeoutMs }) => {
				switch (channelId) {
					case "discord": return setThreadBindingIdleTimeoutBySessionKey({
						targetSessionKey,
						accountId,
						idleTimeoutMs
					});
					case "matrix": return setChannelConversationBindingIdleTimeoutBySessionKey({
						channelId,
						targetSessionKey,
						accountId: accountId ?? "",
						idleTimeoutMs
					});
					case "telegram": return setChannelConversationBindingIdleTimeoutBySessionKey({
						channelId,
						targetSessionKey,
						accountId,
						idleTimeoutMs
					});
				}
			},
			setMaxAgeBySessionKey: ({ channelId, targetSessionKey, accountId, maxAgeMs }) => {
				switch (channelId) {
					case "discord": return setThreadBindingMaxAgeBySessionKey({
						targetSessionKey,
						accountId,
						maxAgeMs
					});
					case "matrix": return setChannelConversationBindingMaxAgeBySessionKey({
						channelId,
						targetSessionKey,
						accountId: accountId ?? "",
						maxAgeMs
					});
					case "telegram": return setChannelConversationBindingMaxAgeBySessionKey({
						channelId,
						targetSessionKey,
						accountId,
						maxAgeMs
					});
				}
			}
		}
	};
	defineCachedValue(channelRuntime, "discord", createRuntimeDiscord);
	defineCachedValue(channelRuntime, "slack", createRuntimeSlack);
	defineCachedValue(channelRuntime, "matrix", createRuntimeMatrix);
	defineCachedValue(channelRuntime, "signal", createRuntimeSignal);
	defineCachedValue(channelRuntime, "line", createRuntimeLine);
	return channelRuntime;
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
//#region src/cron/isolated-agent/session.ts
function resolveCronSession(params) {
	const sessionCfg = params.cfg.session;
	const storePath = resolveStorePath(sessionCfg?.store, { agentId: params.agentId });
	const store = loadSessionStore(storePath);
	const entry = store[params.sessionKey];
	let sessionId;
	let isNewSession;
	let systemSent;
	if (!params.forceNew && entry?.sessionId) {
		const resetPolicy = resolveSessionResetPolicy({
			sessionCfg,
			resetType: "direct"
		});
		if (evaluateSessionFreshness({
			updatedAt: entry.updatedAt,
			now: params.nowMs,
			policy: resetPolicy
		}).fresh) {
			sessionId = entry.sessionId;
			isNewSession = false;
			systemSent = entry.systemSent ?? false;
		} else {
			sessionId = crypto.randomUUID();
			isNewSession = true;
			systemSent = false;
		}
	} else {
		sessionId = crypto.randomUUID();
		isNewSession = true;
		systemSent = false;
	}
	clearBootstrapSnapshotOnSessionRollover({
		sessionKey: params.sessionKey,
		previousSessionId: isNewSession ? entry?.sessionId : void 0
	});
	return {
		storePath,
		store,
		sessionEntry: {
			...entry,
			sessionId,
			updatedAt: params.nowMs,
			systemSent,
			...isNewSession && {
				lastChannel: void 0,
				lastTo: void 0,
				lastAccountId: void 0,
				lastThreadId: void 0,
				deliveryContext: void 0
			}
		},
		systemSent,
		isNewSession
	};
}
//#endregion
//#region src/infra/heartbeat-active-hours.ts
const ACTIVE_HOURS_TIME_PATTERN = /^(?:([01]\d|2[0-3]):([0-5]\d)|24:00)$/;
function resolveActiveHoursTimezone(cfg, raw) {
	const trimmed = raw?.trim();
	if (!trimmed || trimmed === "user") return resolveUserTimezone(cfg.agents?.defaults?.userTimezone);
	if (trimmed === "local") return Intl.DateTimeFormat().resolvedOptions().timeZone?.trim() || "UTC";
	try {
		new Intl.DateTimeFormat("en-US", { timeZone: trimmed }).format(/* @__PURE__ */ new Date());
		return trimmed;
	} catch {
		return resolveUserTimezone(cfg.agents?.defaults?.userTimezone);
	}
}
function parseActiveHoursTime(opts, raw) {
	if (!raw || !ACTIVE_HOURS_TIME_PATTERN.test(raw)) return null;
	const [hourStr, minuteStr] = raw.split(":");
	const hour = Number(hourStr);
	const minute = Number(minuteStr);
	if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
	if (hour === 24) {
		if (!opts.allow24 || minute !== 0) return null;
		return 1440;
	}
	return hour * 60 + minute;
}
function resolveMinutesInTimeZone(nowMs, timeZone) {
	try {
		const parts = new Intl.DateTimeFormat("en-US", {
			timeZone,
			hour: "2-digit",
			minute: "2-digit",
			hourCycle: "h23"
		}).formatToParts(new Date(nowMs));
		const map = {};
		for (const part of parts) if (part.type !== "literal") map[part.type] = part.value;
		const hour = Number(map.hour);
		const minute = Number(map.minute);
		if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
		return hour * 60 + minute;
	} catch {
		return null;
	}
}
function isWithinActiveHours(cfg, heartbeat, nowMs) {
	const active = heartbeat?.activeHours;
	if (!active) return true;
	const startMin = parseActiveHoursTime({ allow24: false }, active.start);
	const endMin = parseActiveHoursTime({ allow24: true }, active.end);
	if (startMin === null || endMin === null) return true;
	if (startMin === endMin) return false;
	const timeZone = resolveActiveHoursTimezone(cfg, active.timezone);
	const currentMin = resolveMinutesInTimeZone(nowMs ?? Date.now(), timeZone);
	if (currentMin === null) return true;
	if (endMin > startMin) return currentMin >= startMin && currentMin < endMin;
	return currentMin >= startMin || currentMin < endMin;
}
//#endregion
//#region src/infra/heartbeat-events-filter.ts
function buildCronEventPrompt(pendingEvents, opts) {
	const deliverToUser = opts?.deliverToUser ?? true;
	const eventText = pendingEvents.join("\n").trim();
	if (!eventText) {
		if (!deliverToUser) return "A scheduled cron event was triggered, but no event content was found. Handle this internally and reply HEARTBEAT_OK when nothing needs user-facing follow-up.";
		return "A scheduled cron event was triggered, but no event content was found. Reply HEARTBEAT_OK.";
	}
	if (!deliverToUser) return "A scheduled reminder has been triggered. The reminder content is:\n\n" + eventText + "\n\nHandle this reminder internally. Do not relay it to the user unless explicitly requested.";
	return "A scheduled reminder has been triggered. The reminder content is:\n\n" + eventText + "\n\nPlease relay this reminder to the user in a helpful and friendly way.";
}
function buildExecEventPrompt(opts) {
	if (!(opts?.deliverToUser ?? true)) return "An async command you ran earlier has completed. The result is shown in the system messages above. Handle the result internally. Do not relay it to the user unless explicitly requested.";
	return "An async command you ran earlier has completed. The result is shown in the system messages above. Please relay the command output to the user in a helpful way. If the command succeeded, share the relevant output. If it failed, explain what went wrong.";
}
const HEARTBEAT_OK_PREFIX = HEARTBEAT_TOKEN.toLowerCase();
function isHeartbeatAckEvent(evt) {
	const trimmed = evt.trim();
	if (!trimmed) return false;
	const lower = trimmed.toLowerCase();
	if (!lower.startsWith(HEARTBEAT_OK_PREFIX)) return false;
	const suffix = lower.slice(HEARTBEAT_OK_PREFIX.length);
	if (suffix.length === 0) return true;
	return !/[a-z0-9_]/.test(suffix[0]);
}
function isHeartbeatNoiseEvent(evt) {
	const lower = evt.trim().toLowerCase();
	if (!lower) return false;
	return isHeartbeatAckEvent(lower) || lower.includes("heartbeat poll") || lower.includes("heartbeat wake");
}
function isExecCompletionEvent(evt) {
	return evt.toLowerCase().includes("exec finished");
}
function isCronSystemEvent(evt) {
	if (!evt.trim()) return false;
	return !isHeartbeatNoiseEvent(evt) && !isExecCompletionEvent(evt);
}
//#endregion
//#region src/infra/heartbeat-runner.ts
const log = createSubsystemLogger("gateway/heartbeat");
function hasExplicitHeartbeatAgents(cfg) {
	return (cfg.agents?.list ?? []).some((entry) => Boolean(entry?.heartbeat));
}
function resolveHeartbeatConfig(cfg, agentId) {
	const defaults = cfg.agents?.defaults?.heartbeat;
	if (!agentId) return defaults;
	const overrides = resolveAgentConfig(cfg, agentId)?.heartbeat;
	if (!defaults && !overrides) return overrides;
	return {
		...defaults,
		...overrides
	};
}
function resolveHeartbeatAgents(cfg) {
	const list = cfg.agents?.list ?? [];
	if (hasExplicitHeartbeatAgents(cfg)) return list.filter((entry) => entry?.heartbeat).map((entry) => {
		const id = normalizeAgentId(entry.id);
		return {
			agentId: id,
			heartbeat: resolveHeartbeatConfig(cfg, id)
		};
	}).filter((entry) => entry.agentId);
	const fallbackId = resolveDefaultAgentId(cfg);
	return [{
		agentId: fallbackId,
		heartbeat: resolveHeartbeatConfig(cfg, fallbackId)
	}];
}
function resolveHeartbeatPrompt(cfg, heartbeat) {
	return resolveHeartbeatPrompt$1(heartbeat?.prompt ?? cfg.agents?.defaults?.heartbeat?.prompt);
}
function resolveHeartbeatAckMaxChars(cfg, heartbeat) {
	return Math.max(0, heartbeat?.ackMaxChars ?? cfg.agents?.defaults?.heartbeat?.ackMaxChars ?? 300);
}
function resolveHeartbeatSession(cfg, agentId, heartbeat, forcedSessionKey) {
	const sessionCfg = cfg.session;
	const scope = sessionCfg?.scope ?? "per-sender";
	const resolvedAgentId = normalizeAgentId(agentId ?? resolveDefaultAgentId(cfg));
	const mainSessionKey = scope === "global" ? "global" : resolveAgentMainSessionKey({
		cfg,
		agentId: resolvedAgentId
	});
	const storeAgentId = scope === "global" ? resolveDefaultAgentId(cfg) : resolvedAgentId;
	const storePath = resolveStorePath(sessionCfg?.store, { agentId: storeAgentId });
	const store = loadSessionStore(storePath);
	const mainEntry = store[mainSessionKey];
	if (scope === "global") return {
		sessionKey: mainSessionKey,
		storePath,
		store,
		entry: mainEntry
	};
	const forced = forcedSessionKey?.trim();
	if (forced) {
		const forcedCanonical = canonicalizeMainSessionAlias({
			cfg,
			agentId: resolvedAgentId,
			sessionKey: toAgentStoreSessionKey({
				agentId: resolvedAgentId,
				requestKey: forced,
				mainKey: cfg.session?.mainKey
			})
		});
		if (forcedCanonical !== "global") {
			if (resolveAgentIdFromSessionKey(forcedCanonical) === normalizeAgentId(resolvedAgentId)) return {
				sessionKey: forcedCanonical,
				storePath,
				store,
				entry: store[forcedCanonical]
			};
		}
	}
	const trimmed = heartbeat?.session?.trim() ?? "";
	if (!trimmed) return {
		sessionKey: mainSessionKey,
		storePath,
		store,
		entry: mainEntry
	};
	const normalized = trimmed.toLowerCase();
	if (normalized === "main" || normalized === "global") return {
		sessionKey: mainSessionKey,
		storePath,
		store,
		entry: mainEntry
	};
	const canonical = canonicalizeMainSessionAlias({
		cfg,
		agentId: resolvedAgentId,
		sessionKey: toAgentStoreSessionKey({
			agentId: resolvedAgentId,
			requestKey: trimmed,
			mainKey: cfg.session?.mainKey
		})
	});
	if (canonical !== "global") {
		if (resolveAgentIdFromSessionKey(canonical) === normalizeAgentId(resolvedAgentId)) return {
			sessionKey: canonical,
			storePath,
			store,
			entry: store[canonical]
		};
	}
	return {
		sessionKey: mainSessionKey,
		storePath,
		store,
		entry: mainEntry
	};
}
function resolveHeartbeatReasoningPayloads(replyResult) {
	return (Array.isArray(replyResult) ? replyResult : replyResult ? [replyResult] : []).filter((payload) => {
		return (typeof payload.text === "string" ? payload.text : "").trimStart().startsWith("Reasoning:");
	});
}
async function restoreHeartbeatUpdatedAt(params) {
	const { storePath, sessionKey, updatedAt } = params;
	if (typeof updatedAt !== "number") return;
	const entry = loadSessionStore(storePath)[sessionKey];
	if (!entry) return;
	const nextUpdatedAt = Math.max(entry.updatedAt ?? 0, updatedAt);
	if (entry.updatedAt === nextUpdatedAt) return;
	await updateSessionStore(storePath, (nextStore) => {
		const nextEntry = nextStore[sessionKey] ?? entry;
		if (!nextEntry) return;
		const resolvedUpdatedAt = Math.max(nextEntry.updatedAt ?? 0, updatedAt);
		if (nextEntry.updatedAt === resolvedUpdatedAt) return;
		nextStore[sessionKey] = {
			...nextEntry,
			updatedAt: resolvedUpdatedAt
		};
	});
}
/**
* Prune heartbeat transcript entries by truncating the file back to a previous size.
* This removes the user+assistant turns that were written during a HEARTBEAT_OK run,
* preventing context pollution from zero-information exchanges.
*/
async function pruneHeartbeatTranscript(params) {
	const { transcriptPath, preHeartbeatSize } = params;
	if (!transcriptPath || typeof preHeartbeatSize !== "number" || preHeartbeatSize < 0) return;
	try {
		if ((await fs.stat(transcriptPath)).size > preHeartbeatSize) await fs.truncate(transcriptPath, preHeartbeatSize);
	} catch {}
}
/**
* Get the transcript file path and its current size before a heartbeat run.
* Returns undefined values if the session or transcript doesn't exist yet.
*/
async function captureTranscriptState(params) {
	const { storePath, sessionKey, agentId } = params;
	try {
		const entry = loadSessionStore(storePath)[sessionKey];
		if (!entry?.sessionId) return {};
		const transcriptPath = resolveSessionFilePath(entry.sessionId, entry, {
			agentId,
			sessionsDir: path.dirname(storePath)
		});
		return {
			transcriptPath,
			preHeartbeatSize: (await fs.stat(transcriptPath)).size
		};
	} catch {
		return {};
	}
}
function stripLeadingHeartbeatResponsePrefix(text, responsePrefix) {
	const normalizedPrefix = responsePrefix?.trim();
	if (!normalizedPrefix) return text;
	const prefixPattern = new RegExp(`^${escapeRegExp(normalizedPrefix)}(?=$|\\s|[\\p{P}\\p{S}])\\s*`, "iu");
	return text.replace(prefixPattern, "");
}
function normalizeHeartbeatReply(payload, responsePrefix, ackMaxChars) {
	const stripped = stripHeartbeatToken(stripLeadingHeartbeatResponsePrefix(typeof payload.text === "string" ? payload.text : "", responsePrefix), {
		mode: "heartbeat",
		maxAckChars: ackMaxChars
	});
	const hasMedia = resolveSendableOutboundReplyParts(payload).hasMedia;
	if (stripped.shouldSkip && !hasMedia) return {
		shouldSkip: true,
		text: "",
		hasMedia
	};
	let finalText = stripped.text;
	if (responsePrefix && finalText && !finalText.startsWith(responsePrefix)) finalText = `${responsePrefix} ${finalText}`;
	return {
		shouldSkip: false,
		text: finalText,
		hasMedia
	};
}
function resolveHeartbeatReasonFlags(reason) {
	const reasonKind = resolveHeartbeatReasonKind(reason);
	return {
		isExecEventReason: reasonKind === "exec-event",
		isCronEventReason: reasonKind === "cron",
		isWakeReason: reasonKind === "wake" || reasonKind === "hook"
	};
}
async function resolveHeartbeatPreflight(params) {
	const reasonFlags = resolveHeartbeatReasonFlags(params.reason);
	const session = resolveHeartbeatSession(params.cfg, params.agentId, params.heartbeat, params.forcedSessionKey);
	const pendingEventEntries = peekSystemEventEntries(session.sessionKey);
	const turnSourceDeliveryContext = resolveSystemEventDeliveryContext(pendingEventEntries);
	const hasTaggedCronEvents = pendingEventEntries.some((event) => event.contextKey?.startsWith("cron:"));
	const shouldInspectPendingEvents = reasonFlags.isExecEventReason || reasonFlags.isCronEventReason || hasTaggedCronEvents;
	const shouldBypassFileGates = reasonFlags.isExecEventReason || reasonFlags.isCronEventReason || reasonFlags.isWakeReason || hasTaggedCronEvents;
	const basePreflight = {
		...reasonFlags,
		session,
		pendingEventEntries,
		turnSourceDeliveryContext,
		hasTaggedCronEvents,
		shouldInspectPendingEvents
	};
	if (shouldBypassFileGates) return basePreflight;
	const workspaceDir = resolveAgentWorkspaceDir(params.cfg, params.agentId);
	const heartbeatFilePath = path.join(workspaceDir, DEFAULT_HEARTBEAT_FILENAME);
	try {
		if (isHeartbeatContentEffectivelyEmpty(await fs.readFile(heartbeatFilePath, "utf-8"))) return {
			...basePreflight,
			skipReason: "empty-heartbeat-file"
		};
	} catch (err) {
		if (hasErrnoCode(err, "ENOENT")) return basePreflight;
	}
	return basePreflight;
}
function appendHeartbeatWorkspacePathHint(prompt, workspaceDir) {
	if (!/heartbeat\.md/i.test(prompt)) return prompt;
	const hint = `When reading HEARTBEAT.md, use workspace file ${path.join(workspaceDir, DEFAULT_HEARTBEAT_FILENAME).replace(/\\/g, "/")} (exact case). Do not read docs/heartbeat.md.`;
	if (prompt.includes(hint)) return prompt;
	return `${prompt}\n${hint}`;
}
function resolveHeartbeatRunPrompt(params) {
	const pendingEventEntries = params.preflight.pendingEventEntries;
	const pendingEvents = params.preflight.shouldInspectPendingEvents ? pendingEventEntries.map((event) => event.text) : [];
	const cronEvents = pendingEventEntries.filter((event) => (params.preflight.isCronEventReason || event.contextKey?.startsWith("cron:")) && isCronSystemEvent(event.text)).map((event) => event.text);
	const hasExecCompletion = pendingEvents.some(isExecCompletionEvent);
	const hasCronEvents = cronEvents.length > 0;
	return {
		prompt: appendHeartbeatWorkspacePathHint(hasExecCompletion ? buildExecEventPrompt({ deliverToUser: params.canRelayToUser }) : hasCronEvents ? buildCronEventPrompt(cronEvents, { deliverToUser: params.canRelayToUser }) : resolveHeartbeatPrompt(params.cfg, params.heartbeat), params.workspaceDir),
		hasExecCompletion,
		hasCronEvents
	};
}
async function runHeartbeatOnce(opts) {
	const cfg = opts.cfg ?? loadConfig();
	const explicitAgentId = typeof opts.agentId === "string" ? opts.agentId.trim() : "";
	const forcedSessionAgentId = explicitAgentId.length > 0 ? void 0 : parseAgentSessionKey(opts.sessionKey)?.agentId;
	const agentId = normalizeAgentId(explicitAgentId || forcedSessionAgentId || resolveDefaultAgentId(cfg));
	const heartbeat = opts.heartbeat ?? resolveHeartbeatConfig(cfg, agentId);
	if (!areHeartbeatsEnabled()) return {
		status: "skipped",
		reason: "disabled"
	};
	if (!isHeartbeatEnabledForAgent(cfg, agentId)) return {
		status: "skipped",
		reason: "disabled"
	};
	if (!resolveHeartbeatIntervalMs(cfg, void 0, heartbeat)) return {
		status: "skipped",
		reason: "disabled"
	};
	const startedAt = opts.deps?.nowMs?.() ?? Date.now();
	if (!isWithinActiveHours(cfg, heartbeat, startedAt)) return {
		status: "skipped",
		reason: "quiet-hours"
	};
	if ((opts.deps?.getQueueSize ?? getQueueSize)(CommandLane.Main) > 0) return {
		status: "skipped",
		reason: "requests-in-flight"
	};
	const preflight = await resolveHeartbeatPreflight({
		cfg,
		agentId,
		heartbeat,
		forcedSessionKey: opts.sessionKey,
		reason: opts.reason
	});
	if (preflight.skipReason) {
		emitHeartbeatEvent({
			status: "skipped",
			reason: preflight.skipReason,
			durationMs: Date.now() - startedAt
		});
		return {
			status: "skipped",
			reason: preflight.skipReason
		};
	}
	const { entry, sessionKey, storePath } = preflight.session;
	const previousUpdatedAt = entry?.updatedAt;
	const useIsolatedSession = heartbeat?.isolatedSession === true;
	let runSessionKey = sessionKey;
	let runStorePath = storePath;
	if (useIsolatedSession) {
		const isolatedKey = `${sessionKey}:heartbeat`;
		const cronSession = resolveCronSession({
			cfg,
			sessionKey: isolatedKey,
			agentId,
			nowMs: startedAt,
			forceNew: true
		});
		cronSession.store[isolatedKey] = cronSession.sessionEntry;
		await saveSessionStore(cronSession.storePath, cronSession.store);
		runSessionKey = isolatedKey;
		runStorePath = cronSession.storePath;
	}
	const delivery = resolveHeartbeatDeliveryTarget({
		cfg,
		entry,
		heartbeat,
		turnSource: useIsolatedSession ? void 0 : preflight.turnSourceDeliveryContext
	});
	const heartbeatAccountId = heartbeat?.accountId?.trim();
	if (delivery.reason === "unknown-account") log.warn("heartbeat: unknown accountId", {
		accountId: delivery.accountId ?? heartbeatAccountId ?? null,
		target: heartbeat?.target ?? "none"
	});
	else if (heartbeatAccountId) log.info("heartbeat: using explicit accountId", {
		accountId: delivery.accountId ?? heartbeatAccountId,
		target: heartbeat?.target ?? "none",
		channel: delivery.channel
	});
	const visibility = delivery.channel !== "none" ? resolveHeartbeatVisibility({
		cfg,
		channel: delivery.channel,
		accountId: delivery.accountId
	}) : {
		showOk: false,
		showAlerts: true,
		useIndicator: true
	};
	const { sender } = resolveHeartbeatSenderContext({
		cfg,
		entry,
		delivery
	});
	const responsePrefix = resolveEffectiveMessagesConfig(cfg, agentId, {
		channel: delivery.channel !== "none" ? delivery.channel : void 0,
		accountId: delivery.accountId
	}).responsePrefix;
	const { prompt, hasExecCompletion, hasCronEvents } = resolveHeartbeatRunPrompt({
		cfg,
		heartbeat,
		preflight,
		canRelayToUser: Boolean(delivery.channel !== "none" && delivery.to && visibility.showAlerts),
		workspaceDir: resolveAgentWorkspaceDir(cfg, agentId)
	});
	const ctx = {
		Body: appendCronStyleCurrentTimeLine(prompt, cfg, startedAt),
		From: sender,
		To: sender,
		OriginatingChannel: delivery.channel !== "none" ? delivery.channel : void 0,
		OriginatingTo: delivery.to,
		AccountId: delivery.accountId,
		MessageThreadId: delivery.threadId,
		Provider: hasExecCompletion ? "exec-event" : hasCronEvents ? "cron-event" : "heartbeat",
		SessionKey: runSessionKey,
		ForceSenderIsOwnerFalse: hasExecCompletion
	};
	if (!visibility.showAlerts && !visibility.showOk && !visibility.useIndicator) {
		emitHeartbeatEvent({
			status: "skipped",
			reason: "alerts-disabled",
			durationMs: Date.now() - startedAt,
			channel: delivery.channel !== "none" ? delivery.channel : void 0,
			accountId: delivery.accountId
		});
		return {
			status: "skipped",
			reason: "alerts-disabled"
		};
	}
	const heartbeatOkText = responsePrefix ? `${responsePrefix} ${HEARTBEAT_TOKEN}` : HEARTBEAT_TOKEN;
	const outboundSession = buildOutboundSessionContext({
		cfg,
		agentId,
		sessionKey
	});
	const canAttemptHeartbeatOk = Boolean(visibility.showOk && delivery.channel !== "none" && delivery.to);
	const maybeSendHeartbeatOk = async () => {
		if (!canAttemptHeartbeatOk || delivery.channel === "none" || !delivery.to) return false;
		const heartbeatPlugin = getChannelPlugin(delivery.channel);
		if (heartbeatPlugin?.heartbeat?.checkReady) {
			if (!(await heartbeatPlugin.heartbeat.checkReady({
				cfg,
				accountId: delivery.accountId,
				deps: opts.deps
			})).ok) return false;
		}
		await deliverOutboundPayloads({
			cfg,
			channel: delivery.channel,
			to: delivery.to,
			accountId: delivery.accountId,
			threadId: delivery.threadId,
			payloads: [{ text: heartbeatOkText }],
			session: outboundSession,
			deps: opts.deps
		});
		return true;
	};
	try {
		const transcriptState = await captureTranscriptState({
			storePath: runStorePath,
			sessionKey: runSessionKey,
			agentId
		});
		const heartbeatModelOverride = heartbeat?.model?.trim() || void 0;
		const suppressToolErrorWarnings = heartbeat?.suppressToolErrorWarnings === true;
		const bootstrapContextMode = heartbeat?.lightContext === true ? "lightweight" : void 0;
		const replyResult = await getReplyFromConfig(ctx, heartbeatModelOverride ? {
			isHeartbeat: true,
			heartbeatModelOverride,
			suppressToolErrorWarnings,
			bootstrapContextMode
		} : {
			isHeartbeat: true,
			suppressToolErrorWarnings,
			bootstrapContextMode
		}, cfg);
		const replyPayload = resolveHeartbeatReplyPayload(replyResult);
		const reasoningPayloads = heartbeat?.includeReasoning === true ? resolveHeartbeatReasoningPayloads(replyResult).filter((payload) => payload !== replyPayload) : [];
		if (!replyPayload || !hasOutboundReplyContent(replyPayload)) {
			await restoreHeartbeatUpdatedAt({
				storePath,
				sessionKey,
				updatedAt: previousUpdatedAt
			});
			await pruneHeartbeatTranscript(transcriptState);
			const okSent = await maybeSendHeartbeatOk();
			emitHeartbeatEvent({
				status: "ok-empty",
				reason: opts.reason,
				durationMs: Date.now() - startedAt,
				channel: delivery.channel !== "none" ? delivery.channel : void 0,
				accountId: delivery.accountId,
				silent: !okSent,
				indicatorType: visibility.useIndicator ? resolveIndicatorType("ok-empty") : void 0
			});
			return {
				status: "ran",
				durationMs: Date.now() - startedAt
			};
		}
		const normalized = normalizeHeartbeatReply(replyPayload, responsePrefix, resolveHeartbeatAckMaxChars(cfg, heartbeat));
		const execFallbackText = hasExecCompletion && !normalized.text.trim() && replyPayload.text?.trim() ? replyPayload.text.trim() : null;
		if (execFallbackText) {
			normalized.text = execFallbackText;
			normalized.shouldSkip = false;
		}
		const shouldSkipMain = normalized.shouldSkip && !normalized.hasMedia && !hasExecCompletion;
		if (shouldSkipMain && reasoningPayloads.length === 0) {
			await restoreHeartbeatUpdatedAt({
				storePath,
				sessionKey,
				updatedAt: previousUpdatedAt
			});
			await pruneHeartbeatTranscript(transcriptState);
			const okSent = await maybeSendHeartbeatOk();
			emitHeartbeatEvent({
				status: "ok-token",
				reason: opts.reason,
				durationMs: Date.now() - startedAt,
				channel: delivery.channel !== "none" ? delivery.channel : void 0,
				accountId: delivery.accountId,
				silent: !okSent,
				indicatorType: visibility.useIndicator ? resolveIndicatorType("ok-token") : void 0
			});
			return {
				status: "ran",
				durationMs: Date.now() - startedAt
			};
		}
		const mediaUrls = resolveSendableOutboundReplyParts(replyPayload).mediaUrls;
		const prevHeartbeatText = typeof entry?.lastHeartbeatText === "string" ? entry.lastHeartbeatText : "";
		const prevHeartbeatAt = typeof entry?.lastHeartbeatSentAt === "number" ? entry.lastHeartbeatSentAt : void 0;
		if (!shouldSkipMain && !mediaUrls.length && Boolean(prevHeartbeatText.trim()) && normalized.text.trim() === prevHeartbeatText.trim() && typeof prevHeartbeatAt === "number" && startedAt - prevHeartbeatAt < 1440 * 60 * 1e3) {
			await restoreHeartbeatUpdatedAt({
				storePath,
				sessionKey,
				updatedAt: previousUpdatedAt
			});
			await pruneHeartbeatTranscript(transcriptState);
			emitHeartbeatEvent({
				status: "skipped",
				reason: "duplicate",
				preview: normalized.text.slice(0, 200),
				durationMs: Date.now() - startedAt,
				hasMedia: false,
				channel: delivery.channel !== "none" ? delivery.channel : void 0,
				accountId: delivery.accountId
			});
			return {
				status: "ran",
				durationMs: Date.now() - startedAt
			};
		}
		const previewText = shouldSkipMain ? reasoningPayloads.map((payload) => payload.text).filter((text) => Boolean(text?.trim())).join("\n") : normalized.text;
		if (delivery.channel === "none" || !delivery.to) {
			emitHeartbeatEvent({
				status: "skipped",
				reason: delivery.reason ?? "no-target",
				preview: previewText?.slice(0, 200),
				durationMs: Date.now() - startedAt,
				hasMedia: mediaUrls.length > 0,
				accountId: delivery.accountId
			});
			return {
				status: "ran",
				durationMs: Date.now() - startedAt
			};
		}
		if (!visibility.showAlerts) {
			await restoreHeartbeatUpdatedAt({
				storePath,
				sessionKey,
				updatedAt: previousUpdatedAt
			});
			emitHeartbeatEvent({
				status: "skipped",
				reason: "alerts-disabled",
				preview: previewText?.slice(0, 200),
				durationMs: Date.now() - startedAt,
				channel: delivery.channel,
				hasMedia: mediaUrls.length > 0,
				accountId: delivery.accountId,
				indicatorType: visibility.useIndicator ? resolveIndicatorType("sent") : void 0
			});
			return {
				status: "ran",
				durationMs: Date.now() - startedAt
			};
		}
		const deliveryAccountId = delivery.accountId;
		const heartbeatPlugin = getChannelPlugin(delivery.channel);
		if (heartbeatPlugin?.heartbeat?.checkReady) {
			const readiness = await heartbeatPlugin.heartbeat.checkReady({
				cfg,
				accountId: deliveryAccountId,
				deps: opts.deps
			});
			if (!readiness.ok) {
				emitHeartbeatEvent({
					status: "skipped",
					reason: readiness.reason,
					preview: previewText?.slice(0, 200),
					durationMs: Date.now() - startedAt,
					hasMedia: mediaUrls.length > 0,
					channel: delivery.channel,
					accountId: delivery.accountId
				});
				log.info("heartbeat: channel not ready", {
					channel: delivery.channel,
					reason: readiness.reason
				});
				return {
					status: "skipped",
					reason: readiness.reason
				};
			}
		}
		await deliverOutboundPayloads({
			cfg,
			channel: delivery.channel,
			to: delivery.to,
			accountId: deliveryAccountId,
			session: outboundSession,
			threadId: delivery.threadId,
			payloads: [...reasoningPayloads, ...shouldSkipMain ? [] : [{
				text: normalized.text,
				mediaUrls
			}]],
			deps: opts.deps
		});
		if (!shouldSkipMain && normalized.text.trim()) {
			const store = loadSessionStore(storePath);
			const current = store[sessionKey];
			if (current) {
				store[sessionKey] = {
					...current,
					lastHeartbeatText: normalized.text,
					lastHeartbeatSentAt: startedAt
				};
				await saveSessionStore(storePath, store);
			}
		}
		emitHeartbeatEvent({
			status: "sent",
			to: delivery.to,
			preview: previewText?.slice(0, 200),
			durationMs: Date.now() - startedAt,
			hasMedia: mediaUrls.length > 0,
			channel: delivery.channel,
			accountId: delivery.accountId,
			indicatorType: visibility.useIndicator ? resolveIndicatorType("sent") : void 0
		});
		return {
			status: "ran",
			durationMs: Date.now() - startedAt
		};
	} catch (err) {
		const reason = formatErrorMessage(err);
		emitHeartbeatEvent({
			status: "failed",
			reason,
			durationMs: Date.now() - startedAt,
			channel: delivery.channel !== "none" ? delivery.channel : void 0,
			accountId: delivery.accountId,
			indicatorType: visibility.useIndicator ? resolveIndicatorType("failed") : void 0
		});
		log.error(`heartbeat failed: ${reason}`, { error: reason });
		return {
			status: "failed",
			reason
		};
	}
}
function startHeartbeatRunner(opts) {
	const runtime = opts.runtime ?? defaultRuntime;
	const runOnce = opts.runOnce ?? runHeartbeatOnce;
	const state = {
		cfg: opts.cfg ?? loadConfig(),
		runtime,
		agents: /* @__PURE__ */ new Map(),
		timer: null,
		stopped: false
	};
	let initialized = false;
	const resolveNextDue = (now, intervalMs, prevState) => {
		if (typeof prevState?.lastRunMs === "number") return prevState.lastRunMs + intervalMs;
		if (prevState && prevState.intervalMs === intervalMs && prevState.nextDueMs > now) return prevState.nextDueMs;
		return now + intervalMs;
	};
	const advanceAgentSchedule = (agent, now) => {
		agent.lastRunMs = now;
		agent.nextDueMs = now + agent.intervalMs;
	};
	const scheduleNext = () => {
		if (state.stopped) return;
		if (state.timer) {
			clearTimeout(state.timer);
			state.timer = null;
		}
		if (state.agents.size === 0) return;
		const now = Date.now();
		let nextDue = Number.POSITIVE_INFINITY;
		for (const agent of state.agents.values()) if (agent.nextDueMs < nextDue) nextDue = agent.nextDueMs;
		if (!Number.isFinite(nextDue)) return;
		const delay = Math.max(0, nextDue - now);
		state.timer = setTimeout(() => {
			state.timer = null;
			requestHeartbeatNow({
				reason: "interval",
				coalesceMs: 0
			});
		}, delay);
		state.timer.unref?.();
	};
	const updateConfig = (cfg) => {
		if (state.stopped) return;
		const now = Date.now();
		const prevAgents = state.agents;
		const prevEnabled = prevAgents.size > 0;
		const nextAgents = /* @__PURE__ */ new Map();
		const intervals = [];
		for (const agent of resolveHeartbeatAgents(cfg)) {
			const intervalMs = resolveHeartbeatIntervalMs(cfg, void 0, agent.heartbeat);
			if (!intervalMs) continue;
			intervals.push(intervalMs);
			const prevState = prevAgents.get(agent.agentId);
			const nextDueMs = resolveNextDue(now, intervalMs, prevState);
			nextAgents.set(agent.agentId, {
				agentId: agent.agentId,
				heartbeat: agent.heartbeat,
				intervalMs,
				lastRunMs: prevState?.lastRunMs,
				nextDueMs
			});
		}
		state.cfg = cfg;
		state.agents = nextAgents;
		const nextEnabled = nextAgents.size > 0;
		if (!initialized) {
			if (!nextEnabled) log.info("heartbeat: disabled", { enabled: false });
			else log.info("heartbeat: started", { intervalMs: Math.min(...intervals) });
			initialized = true;
		} else if (prevEnabled !== nextEnabled) if (!nextEnabled) log.info("heartbeat: disabled", { enabled: false });
		else log.info("heartbeat: started", { intervalMs: Math.min(...intervals) });
		scheduleNext();
	};
	const run = async (params) => {
		if (state.stopped) return {
			status: "skipped",
			reason: "disabled"
		};
		if (!areHeartbeatsEnabled()) return {
			status: "skipped",
			reason: "disabled"
		};
		if (state.agents.size === 0) return {
			status: "skipped",
			reason: "disabled"
		};
		const reason = params?.reason;
		const requestedAgentId = params?.agentId ? normalizeAgentId(params.agentId) : void 0;
		const requestedSessionKey = params?.sessionKey?.trim() || void 0;
		const isInterval = reason === "interval";
		const startedAt = Date.now();
		const now = startedAt;
		let ran = false;
		let requestsInFlight = false;
		try {
			if (requestedSessionKey || requestedAgentId) {
				const targetAgentId = requestedAgentId ?? resolveAgentIdFromSessionKey(requestedSessionKey);
				const targetAgent = state.agents.get(targetAgentId);
				if (!targetAgent) return {
					status: "skipped",
					reason: "disabled"
				};
				try {
					const res = await runOnce({
						cfg: state.cfg,
						agentId: targetAgent.agentId,
						heartbeat: targetAgent.heartbeat,
						reason,
						sessionKey: requestedSessionKey,
						deps: { runtime: state.runtime }
					});
					if (res.status !== "skipped" || res.reason !== "disabled") advanceAgentSchedule(targetAgent, now);
					return res.status === "ran" ? {
						status: "ran",
						durationMs: Date.now() - startedAt
					} : res;
				} catch (err) {
					const errMsg = formatErrorMessage(err);
					log.error(`heartbeat runner: targeted runOnce threw unexpectedly: ${errMsg}`, { error: errMsg });
					advanceAgentSchedule(targetAgent, now);
					return {
						status: "failed",
						reason: errMsg
					};
				}
			}
			for (const agent of state.agents.values()) {
				if (isInterval && now < agent.nextDueMs) continue;
				let res;
				try {
					res = await runOnce({
						cfg: state.cfg,
						agentId: agent.agentId,
						heartbeat: agent.heartbeat,
						reason,
						deps: { runtime: state.runtime }
					});
				} catch (err) {
					const errMsg = formatErrorMessage(err);
					log.error(`heartbeat runner: runOnce threw unexpectedly: ${errMsg}`, { error: errMsg });
					advanceAgentSchedule(agent, now);
					continue;
				}
				if (res.status === "skipped" && res.reason === "requests-in-flight") {
					requestsInFlight = true;
					return res;
				}
				if (res.status !== "skipped" || res.reason !== "disabled") advanceAgentSchedule(agent, now);
				if (res.status === "ran") ran = true;
			}
			if (ran) return {
				status: "ran",
				durationMs: Date.now() - startedAt
			};
			return {
				status: "skipped",
				reason: isInterval ? "not-due" : "disabled"
			};
		} finally {
			if (!requestsInFlight) scheduleNext();
		}
	};
	const wakeHandler = async (params) => run({
		reason: params.reason,
		agentId: params.agentId,
		sessionKey: params.sessionKey
	});
	const disposeWakeHandler = setHeartbeatWakeHandler(wakeHandler);
	updateConfig(state.cfg);
	const cleanup = () => {
		if (state.stopped) return;
		state.stopped = true;
		disposeWakeHandler();
		if (state.timer) clearTimeout(state.timer);
		state.timer = null;
	};
	opts.abortSignal?.addEventListener("abort", cleanup, { once: true });
	return {
		stop: cleanup,
		updateConfig
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
function createRuntimeSystem() {
	return {
		enqueueSystemEvent,
		requestHeartbeatNow,
		runHeartbeatOnce: (opts) => {
			const { reason, agentId, sessionKey, heartbeat } = opts ?? {};
			return runHeartbeatOnce({
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
			return mapCancelledTaskResult(await cancelTaskById({
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
const loadTtsRuntime = createLazyRuntimeModule(() => import("./runtime-tts.runtime-CI8l3kbm.js"));
const loadMediaUnderstandingRuntime = createLazyRuntimeModule(() => import("./runtime-media-understanding.runtime-C9uFlP57.js"));
const loadModelAuthRuntime = createLazyRuntimeModule(() => import("./runtime-model-auth.runtime-D0Xx-DYG.js"));
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
let cachedRuntimeImageGenerationModule = null;
function loadRuntimeImageGenerationModule() {
	cachedRuntimeImageGenerationModule ??= loadBundledPluginPublicSurfaceModuleSync({
		dirName: "image-generation-core",
		artifactBasename: "runtime-api.js"
	});
	return cachedRuntimeImageGenerationModule;
}
function createRuntimeImageGeneration() {
	return {
		generate: (params) => loadRuntimeImageGenerationModule().generateImage(params),
		listProviders: (params) => loadRuntimeImageGenerationModule().listRuntimeImageGenerationProviders(params)
	};
}
function createRuntimeModelAuth() {
	const getApiKeyForModel = createLazyRuntimeMethod(loadModelAuthRuntime, (runtime) => runtime.getApiKeyForModel);
	const resolveApiKeyForProvider = createLazyRuntimeMethod(loadModelAuthRuntime, (runtime) => runtime.resolveApiKeyForProvider);
	return {
		getApiKeyForModel: (params) => getApiKeyForModel({
			model: params.model,
			cfg: params.cfg
		}),
		resolveApiKeyForProvider: (params) => resolveApiKeyForProvider({
			provider: params.provider,
			cfg: params.cfg
		})
	};
}
function createUnavailableSubagentRuntime() {
	const unavailable = () => {
		throw new Error("Plugin runtime subagent methods are only available during a gateway request.");
	};
	return {
		run: unavailable,
		waitForRun: unavailable,
		getSessionMessages: unavailable,
		getSession: unavailable,
		deleteSession: unavailable
	};
}
const gatewaySubagentState = resolveGlobalSingleton(Symbol.for("openclaw.plugin.gatewaySubagentRuntime"), () => ({ subagent: void 0 }));
/**
* Set the process-global gateway subagent runtime.
* Called during gateway startup so that gateway-bindable plugin runtimes can
* resolve subagent methods dynamically even when their registry was cached
* before the gateway finished loading plugins.
*/
function setGatewaySubagentRuntime(subagent) {
	gatewaySubagentState.subagent = subagent;
}
/**
* Reset the process-global gateway subagent runtime.
* Used by tests to avoid leaking gateway state across module reloads.
*/
function clearGatewaySubagentRuntime() {
	gatewaySubagentState.subagent = void 0;
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
function createPluginRuntime(_options = {}) {
	const mediaUnderstanding = createRuntimeMediaUnderstandingFacade();
	const taskFlow = createRuntimeTaskFlow();
	const tasks = createRuntimeTasks({ legacyTaskFlow: taskFlow });
	const runtime = {
		version: VERSION,
		config: createRuntimeConfig(),
		agent: createRuntimeAgent(),
		subagent: createLateBindingSubagent(_options.subagent, _options.allowGatewaySubagentBinding === true),
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
	return runtime;
}
//#endregion
export { startHeartbeatRunner as a, runHeartbeatOnce as i, createPluginRuntime as n, resolveCronSession as o, setGatewaySubagentRuntime as r, clearGatewaySubagentRuntime as t };
