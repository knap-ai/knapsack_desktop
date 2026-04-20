import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { n as defaultRuntime } from "./runtime-Dx7oeLYq.js";
import { t as sanitizeForLog } from "./ansi-Bs_ZZlnS.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { t as formatCliCommand } from "./command-format-Dd3uP9-6.js";
import { o as isSecretRef } from "./types.secrets-CeL3gSMO.js";
import { a as loadConfig, u as readConfigFileSnapshotForWrite } from "./io-5pxHCi7V.js";
import { c as normalizeAgentId, u as resolveAgentIdFromSessionKey } from "./session-key-Bh1lMwK5.js";
import { n as DEFAULT_MODEL, r as DEFAULT_PROVIDER } from "./defaults-CiQa3xnX.js";
import { u as setRuntimeConfigSnapshot } from "./runtime-snapshot-BwqEmc6G.js";
import { d as ensureAgentWorkspace } from "./workspace-hhTlRYqM.js";
import { b as resolveAgentWorkspaceDir, g as listAgentIds, l as resolveAgentSkillsFilter, p as resolveSessionAgentId, u as resolveEffectiveModelFallbacks, y as resolveAgentDir } from "./agent-scope-KFH9bkHi.js";
import { r as matchesSkillFilter } from "./agent-filter-CYpmR-qt.js";
import { f as resolveMessageChannel } from "./message-channel-CBqCPFa_.js";
import { n as ensureAuthProfileStore } from "./store-C1I9Mkh8.js";
import { f as modelKey, m as parseModelRef, p as normalizeModelRef } from "./model-selection-cli-_3Gn8Wcd.js";
import { c as normalizeThinkLevel, d as normalizeVerboseLevel, n as formatXHighModelHint } from "./thinking.shared-CAbk7EZs.js";
import { d as resolveConfiguredModelRef, f as resolveDefaultModelForAgent, t as buildAllowedModelSet, x as resolveThinkingDefault } from "./model-selection-CTdyYoio.js";
import { r as loadModelCatalog } from "./model-catalog-CdCqmHkW.js";
import { o as normalizeAccountId } from "./delivery-context.shared-EClQPjt-.js";
import { i as supportsXHighThinking, t as formatThinkingLevels } from "./thinking-CtJu90cp.js";
import "./auth-profiles-BQEgLpFI.js";
import { i as emitAgentEvent, t as clearAgentRunContext, u as registerAgentRunContext } from "./agent-events-BLJ1mmc3.js";
import { i as LiveSessionModelSwitchError, r as runWithModelFallback } from "./model-fallback-D2mt9Plr.js";
import { t as getAgentRuntimeCommandSecretTargetIds } from "./command-secret-targets-WLIHx3E8.js";
import { t as buildOutboundSessionContext } from "./session-context--WJ2aq2e.js";
import { t as applyModelOverrideToSessionEntry } from "./model-overrides-BEFWLg94.js";
import { n as AGENT_LANE_SUBAGENT } from "./lanes-CJ0uhThr.js";
import { t as resolveAgentTimeoutMs } from "./timeout-CxW3WOrq.js";
import { n as normalizeSpawnedRunMetadata } from "./spawned-context-D7kox5Yj.js";
import { S as shouldRefreshSnapshotForVersion, r as getRemoteSkillEligibility, t as canExecRequestNode, y as getSkillsSnapshotVersion } from "./exec-defaults-DiCDZt_n.js";
import { r as buildWorkspaceSkillSnapshot } from "./skills-Cwx5TftI.js";
import { r as resolveSession } from "./live-model-switch-DHqPme9r.js";
import { i as toAcpRuntimeError } from "./errors-DrSVrMCJ.js";
import { n as getAcpSessionManager } from "./manager-CECGVjs9.js";
import { n as resolveSendPolicy } from "./send-policy-DyHi525p.js";
import { t as clearSessionAuthProfileOverride } from "./session-override-TDK5Oy09.js";
import { n as resolveAcpAgentPolicyError, r as resolveAcpDispatchPolicyError } from "./policy-BWMox--C.js";
import { t as resolveAcpSessionCwd } from "./session-identifiers-B8aS2nlu.js";
import { t as createDefaultDeps } from "./deps-wxTK-yVM.js";
import { n as applyVerboseOverride } from "./level-overrides-BTUPvbOt.js";
import { n as prependInternalEventContext, t as persistSessionEntry$1 } from "./attempt-execution.shared-CtcY9pwJ.js";
import "./refresh-CKrDWMET.js";
//#region src/agents/command/run-context.ts
function resolveAgentRunContext(opts) {
	const merged = opts.runContext ? { ...opts.runContext } : {};
	const normalizedChannel = resolveMessageChannel(merged.messageChannel ?? opts.messageChannel, opts.replyChannel ?? opts.channel);
	if (normalizedChannel) merged.messageChannel = normalizedChannel;
	const normalizedAccountId = normalizeAccountId(merged.accountId ?? opts.accountId);
	if (normalizedAccountId) merged.accountId = normalizedAccountId;
	const groupId = (merged.groupId ?? opts.groupId)?.toString().trim();
	if (groupId) merged.groupId = groupId;
	const groupChannel = (merged.groupChannel ?? opts.groupChannel)?.toString().trim();
	if (groupChannel) merged.groupChannel = groupChannel;
	const groupSpace = (merged.groupSpace ?? opts.groupSpace)?.toString().trim();
	if (groupSpace) merged.groupSpace = groupSpace;
	if (merged.currentThreadTs == null && opts.threadId != null && opts.threadId !== "" && opts.threadId !== null) merged.currentThreadTs = String(opts.threadId);
	if (!merged.currentChannelId && opts.to) {
		const trimmedTo = opts.to.trim();
		if (trimmedTo) merged.currentChannelId = trimmedTo;
	}
	return merged;
}
//#endregion
//#region src/agents/agent-command.ts
const log = createSubsystemLogger("agents/agent-command");
let attemptExecutionRuntimePromise;
let deliveryRuntimePromise;
let sessionStoreRuntimePromise;
let transcriptResolveRuntimePromise;
function loadAttemptExecutionRuntime() {
	attemptExecutionRuntimePromise ??= import("./attempt-execution.runtime-xF4aJ1vF.js");
	return attemptExecutionRuntimePromise;
}
function loadDeliveryRuntime() {
	deliveryRuntimePromise ??= import("./delivery.runtime-BoR0_irN.js");
	return deliveryRuntimePromise;
}
function loadSessionStoreRuntime() {
	sessionStoreRuntimePromise ??= import("./session-store.runtime-D0Wf4U9r.js");
	return sessionStoreRuntimePromise;
}
function loadTranscriptResolveRuntime() {
	transcriptResolveRuntimePromise ??= import("./transcript-resolve.runtime-Bx2HOvsX.js");
	return transcriptResolveRuntimePromise;
}
const OVERRIDE_FIELDS_CLEARED_BY_DELETE = [
	"providerOverride",
	"modelOverride",
	"authProfileOverride",
	"authProfileOverrideSource",
	"authProfileOverrideCompactionCount",
	"fallbackNoticeSelectedModel",
	"fallbackNoticeActiveModel",
	"fallbackNoticeReason",
	"claudeCliSessionId"
];
const OVERRIDE_VALUE_MAX_LENGTH = 256;
async function persistSessionEntry(params) {
	await persistSessionEntry$1({
		...params,
		clearedFields: OVERRIDE_FIELDS_CLEARED_BY_DELETE
	});
}
async function resolveAgentRuntimeConfig(runtime, params) {
	const loadedRaw = loadConfig();
	const sourceConfig = await (async () => {
		try {
			const { snapshot } = await readConfigFileSnapshotForWrite();
			if (snapshot.valid) return snapshot.resolved;
		} catch {}
		return loadedRaw;
	})();
	const includeChannelTargets = params?.runtimeTargetsChannelSecrets === true;
	const cfg = hasAgentRuntimeSecretRefs({
		config: loadedRaw,
		includeChannelTargets
	}) ? (await (await import("./command-config-resolution.runtime-BuR9DGqG.js")).resolveCommandConfigWithSecrets({
		config: loadedRaw,
		commandName: "agent",
		targetIds: getAgentRuntimeCommandSecretTargetIds({ includeChannelTargets }),
		runtime
	})).resolvedConfig : loadedRaw;
	setRuntimeConfigSnapshot(cfg, sourceConfig);
	return {
		loadedRaw,
		sourceConfig,
		cfg
	};
}
function hasNestedSecretRef(value) {
	if (isSecretRef(value)) return true;
	if (Array.isArray(value)) return value.some((entry) => hasNestedSecretRef(entry));
	if (!value || typeof value !== "object") return false;
	return Object.values(value).some((entry) => hasNestedSecretRef(entry));
}
function hasAgentRuntimeSecretRefs(params) {
	const { config } = params;
	if (hasNestedSecretRef(config.models?.providers)) return true;
	if (hasNestedSecretRef(config.agents?.defaults?.memorySearch?.remote?.apiKey)) return true;
	if (Array.isArray(config.agents?.list) && config.agents.list.some((agent) => hasNestedSecretRef(agent?.memorySearch?.remote?.apiKey))) return true;
	if (hasNestedSecretRef(config.messages?.tts?.providers)) return true;
	if (hasNestedSecretRef(config.skills?.entries)) return true;
	if (hasNestedSecretRef(config.tools?.web?.search)) return true;
	if (config.plugins?.entries && Object.values(config.plugins.entries).some((entry) => hasNestedSecretRef({
		webSearch: entry?.config?.webSearch,
		webFetch: entry?.config?.webFetch
	}))) return true;
	return params.includeChannelTargets ? hasNestedSecretRef(config.channels) : false;
}
function containsControlCharacters(value) {
	for (const char of value) {
		const code = char.codePointAt(0);
		if (code === void 0) continue;
		if (code <= 31 || code >= 127 && code <= 159) return true;
	}
	return false;
}
function normalizeExplicitOverrideInput(raw, kind) {
	const trimmed = raw.trim();
	const label = kind === "provider" ? "Provider" : "Model";
	if (!trimmed) throw new Error(`${label} override must be non-empty.`);
	if (trimmed.length > OVERRIDE_VALUE_MAX_LENGTH) throw new Error(`${label} override exceeds ${String(OVERRIDE_VALUE_MAX_LENGTH)} characters.`);
	if (containsControlCharacters(trimmed)) throw new Error(`${label} override contains invalid control characters.`);
	return trimmed;
}
async function prepareAgentCommandExecution(opts, runtime) {
	const message = opts.message ?? "";
	if (!message.trim()) throw new Error("Message (--message) is required");
	const body = prependInternalEventContext(message, opts.internalEvents);
	if (!opts.to && !opts.sessionId && !opts.sessionKey && !opts.agentId) throw new Error("Pass --to <E.164>, --session-id, or --agent to choose a session");
	const { cfg } = await resolveAgentRuntimeConfig(runtime, { runtimeTargetsChannelSecrets: opts.deliver === true });
	const normalizedSpawned = normalizeSpawnedRunMetadata({
		spawnedBy: opts.spawnedBy,
		groupId: opts.groupId,
		groupChannel: opts.groupChannel,
		groupSpace: opts.groupSpace,
		workspaceDir: opts.workspaceDir
	});
	const agentIdOverrideRaw = opts.agentId?.trim();
	const agentIdOverride = agentIdOverrideRaw ? normalizeAgentId(agentIdOverrideRaw) : void 0;
	if (agentIdOverride) {
		if (!listAgentIds(cfg).includes(agentIdOverride)) throw new Error(`Unknown agent id "${agentIdOverrideRaw}". Use "${formatCliCommand("openclaw agents list")}" to see configured agents.`);
	}
	if (agentIdOverride && opts.sessionKey) {
		const sessionAgentId = resolveAgentIdFromSessionKey(opts.sessionKey);
		if (sessionAgentId !== agentIdOverride) throw new Error(`Agent id "${agentIdOverrideRaw}" does not match session key agent "${sessionAgentId}".`);
	}
	const agentCfg = cfg.agents?.defaults;
	const configuredModel = resolveConfiguredModelRef({
		cfg,
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	});
	const thinkingLevelsHint = formatThinkingLevels(configuredModel.provider, configuredModel.model);
	const thinkOverride = normalizeThinkLevel(opts.thinking);
	const thinkOnce = normalizeThinkLevel(opts.thinkingOnce);
	if (opts.thinking && !thinkOverride) throw new Error(`Invalid thinking level. Use one of: ${thinkingLevelsHint}.`);
	if (opts.thinkingOnce && !thinkOnce) throw new Error(`Invalid one-shot thinking level. Use one of: ${thinkingLevelsHint}.`);
	const verboseOverride = normalizeVerboseLevel(opts.verbose);
	if (opts.verbose && !verboseOverride) throw new Error("Invalid verbose level. Use \"on\", \"full\", or \"off\".");
	const isSubagentLane = (normalizeOptionalString(opts.lane) ?? "") === AGENT_LANE_SUBAGENT;
	const timeoutSecondsRaw = opts.timeout !== void 0 ? Number.parseInt(opts.timeout, 10) : isSubagentLane ? 0 : void 0;
	if (timeoutSecondsRaw !== void 0 && (Number.isNaN(timeoutSecondsRaw) || timeoutSecondsRaw < 0)) throw new Error("--timeout must be a non-negative integer (seconds; 0 means no timeout)");
	const timeoutMs = resolveAgentTimeoutMs({
		cfg,
		overrideSeconds: timeoutSecondsRaw
	});
	const { sessionId, sessionKey, sessionEntry: sessionEntryRaw, sessionStore, storePath, isNewSession, persistedThinking, persistedVerbose } = resolveSession({
		cfg,
		to: opts.to,
		sessionId: opts.sessionId,
		sessionKey: opts.sessionKey,
		agentId: agentIdOverride
	});
	const sessionAgentId = agentIdOverride ?? resolveSessionAgentId({
		sessionKey: sessionKey ?? opts.sessionKey?.trim(),
		config: cfg
	});
	const outboundSession = buildOutboundSessionContext({
		cfg,
		agentId: sessionAgentId,
		sessionKey
	});
	const workspaceDirRaw = normalizedSpawned.workspaceDir ?? resolveAgentWorkspaceDir(cfg, sessionAgentId);
	const agentDir = resolveAgentDir(cfg, sessionAgentId);
	const workspaceDir = (await ensureAgentWorkspace({
		dir: workspaceDirRaw,
		ensureBootstrapFiles: !agentCfg?.skipBootstrap
	})).dir;
	const runId = opts.runId?.trim() || sessionId;
	const acpManager = getAcpSessionManager();
	return {
		body,
		cfg,
		normalizedSpawned,
		agentCfg,
		thinkOverride,
		thinkOnce,
		verboseOverride,
		timeoutMs,
		sessionId,
		sessionKey,
		sessionEntry: sessionEntryRaw,
		sessionStore,
		storePath,
		isNewSession,
		persistedThinking,
		persistedVerbose,
		sessionAgentId,
		outboundSession,
		workspaceDir,
		agentDir,
		runId,
		acpManager,
		acpResolution: sessionKey ? acpManager.resolveSession({
			cfg,
			sessionKey
		}) : null
	};
}
async function agentCommandInternal(opts, runtime = defaultRuntime, deps = createDefaultDeps()) {
	const prepared = await prepareAgentCommandExecution(opts, runtime);
	const { body, cfg, normalizedSpawned, agentCfg, thinkOverride, thinkOnce, verboseOverride, timeoutMs, sessionId, sessionKey, sessionStore, storePath, isNewSession, persistedThinking, persistedVerbose, sessionAgentId, outboundSession, workspaceDir, agentDir, runId, acpManager, acpResolution } = prepared;
	let sessionEntry = prepared.sessionEntry;
	try {
		if (opts.deliver === true) {
			if (resolveSendPolicy({
				cfg,
				entry: sessionEntry,
				sessionKey,
				channel: sessionEntry?.channel,
				chatType: sessionEntry?.chatType
			}) === "deny") throw new Error("send blocked by session policy");
		}
		if (acpResolution?.kind === "stale") throw acpResolution.error;
		if (acpResolution?.kind === "ready" && sessionKey) {
			const attemptExecutionRuntime = await loadAttemptExecutionRuntime();
			const startedAt = Date.now();
			registerAgentRunContext(runId, { sessionKey });
			attemptExecutionRuntime.emitAcpLifecycleStart({
				runId,
				startedAt
			});
			const visibleTextAccumulator = attemptExecutionRuntime.createAcpVisibleTextAccumulator();
			let stopReason;
			try {
				const dispatchPolicyError = resolveAcpDispatchPolicyError(cfg);
				if (dispatchPolicyError) throw dispatchPolicyError;
				const agentPolicyError = resolveAcpAgentPolicyError(cfg, normalizeAgentId(acpResolution.meta.agent || resolveAgentIdFromSessionKey(sessionKey)));
				if (agentPolicyError) throw agentPolicyError;
				await acpManager.runTurn({
					cfg,
					sessionKey,
					text: body,
					mode: "prompt",
					requestId: runId,
					signal: opts.abortSignal,
					onEvent: (event) => {
						if (event.type === "done") {
							stopReason = event.stopReason;
							return;
						}
						if (event.type !== "text_delta") return;
						if (event.stream && event.stream !== "output") return;
						if (!event.text) return;
						const visibleUpdate = visibleTextAccumulator.consume(event.text);
						if (!visibleUpdate) return;
						attemptExecutionRuntime.emitAcpAssistantDelta({
							runId,
							text: visibleUpdate.text,
							delta: visibleUpdate.delta
						});
					}
				});
			} catch (error) {
				const acpError = toAcpRuntimeError({
					error,
					fallbackCode: "ACP_TURN_FAILED",
					fallbackMessage: "ACP turn failed before completion."
				});
				attemptExecutionRuntime.emitAcpLifecycleError({
					runId,
					message: acpError.message
				});
				throw acpError;
			}
			attemptExecutionRuntime.emitAcpLifecycleEnd({ runId });
			const finalTextRaw = visibleTextAccumulator.finalizeRaw();
			const finalText = visibleTextAccumulator.finalize();
			try {
				sessionEntry = await attemptExecutionRuntime.persistAcpTurnTranscript({
					body,
					finalText: finalTextRaw,
					sessionId,
					sessionKey,
					sessionEntry,
					sessionStore,
					storePath,
					sessionAgentId,
					threadId: opts.threadId,
					sessionCwd: resolveAcpSessionCwd(acpResolution.meta) ?? workspaceDir
				});
			} catch (error) {
				log.warn(`ACP transcript persistence failed for ${sessionKey}: ${formatErrorMessage(error)}`);
			}
			const result = attemptExecutionRuntime.buildAcpResult({
				payloadText: finalText,
				startedAt,
				stopReason,
				abortSignal: opts.abortSignal
			});
			const payloads = result.payloads;
			const { deliverAgentCommandResult } = await loadDeliveryRuntime();
			return await deliverAgentCommandResult({
				cfg,
				deps,
				runtime,
				opts,
				outboundSession,
				sessionEntry,
				result,
				payloads
			});
		}
		let resolvedThinkLevel = thinkOnce ?? thinkOverride ?? persistedThinking;
		const resolvedVerboseLevel = verboseOverride ?? persistedVerbose ?? agentCfg?.verboseDefault;
		if (sessionKey) registerAgentRunContext(runId, {
			sessionKey,
			verboseLevel: resolvedVerboseLevel
		});
		const skillsSnapshotVersion = getSkillsSnapshotVersion(workspaceDir);
		const skillFilter = resolveAgentSkillsFilter(cfg, sessionAgentId);
		const currentSkillsSnapshot = sessionEntry?.skillsSnapshot;
		const shouldRefreshSkillsSnapshot = !currentSkillsSnapshot || shouldRefreshSnapshotForVersion(currentSkillsSnapshot.version, skillsSnapshotVersion) || !matchesSkillFilter(currentSkillsSnapshot.skillFilter, skillFilter);
		const needsSkillsSnapshot = isNewSession || shouldRefreshSkillsSnapshot;
		const skillsSnapshot = needsSkillsSnapshot ? buildWorkspaceSkillSnapshot(workspaceDir, {
			config: cfg,
			eligibility: { remote: getRemoteSkillEligibility({ advertiseExecNode: canExecRequestNode({
				cfg,
				sessionEntry,
				sessionKey,
				agentId: sessionAgentId
			}) }) },
			snapshotVersion: skillsSnapshotVersion,
			skillFilter,
			agentId: sessionAgentId
		}) : currentSkillsSnapshot;
		if (skillsSnapshot && sessionStore && sessionKey && needsSkillsSnapshot) {
			const next = {
				...sessionEntry ?? {
					sessionId,
					updatedAt: Date.now()
				},
				sessionId,
				updatedAt: Date.now(),
				skillsSnapshot
			};
			await persistSessionEntry({
				sessionStore,
				sessionKey,
				storePath,
				entry: next
			});
			sessionEntry = next;
		}
		if (sessionStore && sessionKey) {
			const next = {
				...sessionStore[sessionKey] ?? sessionEntry ?? {
					sessionId,
					updatedAt: Date.now()
				},
				sessionId,
				updatedAt: Date.now()
			};
			if (thinkOverride) next.thinkingLevel = thinkOverride;
			applyVerboseOverride(next, verboseOverride);
			await persistSessionEntry({
				sessionStore,
				sessionKey,
				storePath,
				entry: next
			});
			sessionEntry = next;
		}
		const configuredDefaultRef = resolveDefaultModelForAgent({
			cfg,
			agentId: sessionAgentId
		});
		const { provider: defaultProvider, model: defaultModel } = normalizeModelRef(configuredDefaultRef.provider, configuredDefaultRef.model);
		let provider = defaultProvider;
		let model = defaultModel;
		const hasAllowlist = agentCfg?.models && Object.keys(agentCfg.models).length > 0;
		const hasStoredOverride = Boolean(sessionEntry?.modelOverride || sessionEntry?.providerOverride);
		const explicitProviderOverride = typeof opts.provider === "string" ? normalizeExplicitOverrideInput(opts.provider, "provider") : void 0;
		const explicitModelOverride = typeof opts.model === "string" ? normalizeExplicitOverrideInput(opts.model, "model") : void 0;
		const hasExplicitRunOverride = Boolean(explicitProviderOverride || explicitModelOverride);
		if (hasExplicitRunOverride && opts.allowModelOverride !== true) throw new Error("Model override is not authorized for this caller.");
		const needsModelCatalog = hasAllowlist || hasStoredOverride || hasExplicitRunOverride;
		let allowedModelKeys = /* @__PURE__ */ new Set();
		let allowedModelCatalog = [];
		let modelCatalog = null;
		let allowAnyModel = false;
		if (needsModelCatalog) {
			modelCatalog = await loadModelCatalog({ config: cfg });
			const allowed = buildAllowedModelSet({
				cfg,
				catalog: modelCatalog,
				defaultProvider,
				defaultModel,
				agentId: sessionAgentId
			});
			allowedModelKeys = allowed.allowedKeys;
			allowedModelCatalog = allowed.allowedCatalog;
			allowAnyModel = allowed.allowAny ?? false;
		}
		if (sessionEntry && sessionStore && sessionKey && hasStoredOverride) {
			const entry = sessionEntry;
			const overrideProvider = sessionEntry.providerOverride?.trim() || defaultProvider;
			const overrideModel = sessionEntry.modelOverride?.trim();
			if (overrideModel) {
				const normalizedOverride = normalizeModelRef(overrideProvider, overrideModel);
				const key = modelKey(normalizedOverride.provider, normalizedOverride.model);
				if (!allowAnyModel && !allowedModelKeys.has(key)) {
					const { updated } = applyModelOverrideToSessionEntry({
						entry,
						selection: {
							provider: defaultProvider,
							model: defaultModel,
							isDefault: true
						}
					});
					if (updated) await persistSessionEntry({
						sessionStore,
						sessionKey,
						storePath,
						entry
					});
				}
			}
		}
		const storedProviderOverride = sessionEntry?.providerOverride?.trim();
		let storedModelOverride = sessionEntry?.modelOverride?.trim();
		if (storedModelOverride) {
			const normalizedStored = normalizeModelRef(storedProviderOverride || defaultProvider, storedModelOverride);
			const key = modelKey(normalizedStored.provider, normalizedStored.model);
			if (allowAnyModel || allowedModelKeys.has(key)) {
				provider = normalizedStored.provider;
				model = normalizedStored.model;
			}
		}
		let providerForAuthProfileValidation = provider;
		if (hasExplicitRunOverride) {
			const explicitRef = explicitModelOverride ? explicitProviderOverride ? normalizeModelRef(explicitProviderOverride, explicitModelOverride) : parseModelRef(explicitModelOverride, provider) : explicitProviderOverride ? normalizeModelRef(explicitProviderOverride, model) : null;
			if (!explicitRef) throw new Error("Invalid model override.");
			const explicitKey = modelKey(explicitRef.provider, explicitRef.model);
			if (!allowAnyModel && !allowedModelKeys.has(explicitKey)) throw new Error(`Model override "${sanitizeForLog(explicitRef.provider)}/${sanitizeForLog(explicitRef.model)}" is not allowed for agent "${sessionAgentId}".`);
			provider = explicitRef.provider;
			model = explicitRef.model;
		}
		if (sessionEntry) {
			const authProfileId = sessionEntry.authProfileOverride;
			if (authProfileId) {
				const entry = sessionEntry;
				const profile = ensureAuthProfileStore().profiles[authProfileId];
				if (!profile || profile.provider !== providerForAuthProfileValidation) {
					if (sessionStore && sessionKey) await clearSessionAuthProfileOverride({
						sessionEntry: entry,
						sessionStore,
						sessionKey,
						storePath
					});
				}
			}
		}
		if (!resolvedThinkLevel) {
			let catalogForThinking = modelCatalog ?? allowedModelCatalog;
			if (!catalogForThinking || catalogForThinking.length === 0) {
				modelCatalog = await loadModelCatalog({ config: cfg });
				catalogForThinking = modelCatalog;
			}
			resolvedThinkLevel = resolveThinkingDefault({
				cfg,
				provider,
				model,
				catalog: catalogForThinking
			});
		}
		if (resolvedThinkLevel === "xhigh" && !supportsXHighThinking(provider, model)) {
			if (Boolean(thinkOnce || thinkOverride)) throw new Error(`Thinking level "xhigh" is only supported for ${formatXHighModelHint()}.`);
			resolvedThinkLevel = "high";
			if (sessionEntry && sessionStore && sessionKey && sessionEntry.thinkingLevel === "xhigh") {
				const entry = sessionEntry;
				entry.thinkingLevel = "high";
				entry.updatedAt = Date.now();
				await persistSessionEntry({
					sessionStore,
					sessionKey,
					storePath,
					entry
				});
			}
		}
		const { resolveSessionTranscriptFile } = await loadTranscriptResolveRuntime();
		let sessionFile;
		if (sessionStore && sessionKey) {
			const resolvedSessionFile = await resolveSessionTranscriptFile({
				sessionId,
				sessionKey,
				sessionStore,
				storePath,
				sessionEntry,
				agentId: sessionAgentId,
				threadId: opts.threadId
			});
			sessionFile = resolvedSessionFile.sessionFile;
			sessionEntry = resolvedSessionFile.sessionEntry;
		}
		if (!sessionFile) {
			const resolvedSessionFile = await resolveSessionTranscriptFile({
				sessionId,
				sessionKey: sessionKey ?? sessionId,
				storePath,
				sessionEntry,
				agentId: sessionAgentId,
				threadId: opts.threadId
			});
			sessionFile = resolvedSessionFile.sessionFile;
			sessionEntry = resolvedSessionFile.sessionEntry;
		}
		const startedAt = Date.now();
		let lifecycleEnded = false;
		const attemptExecutionRuntime = await loadAttemptExecutionRuntime();
		let result;
		let fallbackProvider = provider;
		let fallbackModel = model;
		const MAX_LIVE_SWITCH_RETRIES = 5;
		let liveSwitchRetries = 0;
		for (;;) try {
			const runContext = resolveAgentRunContext(opts);
			const messageChannel = resolveMessageChannel(runContext.messageChannel, opts.replyChannel ?? opts.channel);
			const spawnedBy = normalizedSpawned.spawnedBy ?? sessionEntry?.spawnedBy;
			const effectiveFallbacksOverride = resolveEffectiveModelFallbacks({
				cfg,
				agentId: sessionAgentId,
				hasSessionModelOverride: Boolean(storedModelOverride)
			});
			let fallbackAttemptIndex = 0;
			const fallbackResult = await runWithModelFallback({
				cfg,
				provider,
				model,
				runId,
				agentDir,
				fallbacksOverride: effectiveFallbacksOverride,
				run: async (providerOverride, modelOverride, runOptions) => {
					const isFallbackRetry = fallbackAttemptIndex > 0;
					fallbackAttemptIndex += 1;
					return attemptExecutionRuntime.runAgentAttempt({
						providerOverride,
						modelOverride,
						cfg,
						sessionEntry,
						sessionId,
						sessionKey,
						sessionAgentId,
						sessionFile,
						workspaceDir,
						body,
						isFallbackRetry,
						resolvedThinkLevel,
						timeoutMs,
						runId,
						opts,
						runContext,
						spawnedBy,
						messageChannel,
						skillsSnapshot,
						resolvedVerboseLevel,
						agentDir,
						authProfileProvider: providerForAuthProfileValidation,
						sessionStore,
						storePath,
						allowTransientCooldownProbe: runOptions?.allowTransientCooldownProbe,
						sessionHasHistory: !isNewSession || await attemptExecutionRuntime.sessionFileHasContent(sessionFile),
						onAgentEvent: (evt) => {
							if (evt.stream === "lifecycle" && typeof evt.data?.phase === "string" && (evt.data.phase === "end" || evt.data.phase === "error")) lifecycleEnded = true;
						}
					});
				}
			});
			result = fallbackResult.result;
			fallbackProvider = fallbackResult.provider;
			fallbackModel = fallbackResult.model;
			if (!lifecycleEnded) {
				const stopReason = result.meta.stopReason;
				if (stopReason && stopReason !== "end_turn") console.error(`[agent] run ${runId} ended with stopReason=${stopReason}`);
				emitAgentEvent({
					runId,
					stream: "lifecycle",
					data: {
						phase: "end",
						startedAt,
						endedAt: Date.now(),
						aborted: result.meta.aborted ?? false,
						stopReason
					}
				});
			}
			break;
		} catch (err) {
			if (err instanceof LiveSessionModelSwitchError) {
				liveSwitchRetries++;
				if (liveSwitchRetries > MAX_LIVE_SWITCH_RETRIES) {
					log.error(`Live session model switch in subagent run ${runId}: exceeded maximum retries (${MAX_LIVE_SWITCH_RETRIES})`);
					if (!lifecycleEnded) emitAgentEvent({
						runId,
						stream: "lifecycle",
						data: {
							phase: "error",
							startedAt,
							endedAt: Date.now(),
							error: "Agent run failed"
						}
					});
					throw new Error(`Exceeded maximum live model switch retries (${MAX_LIVE_SWITCH_RETRIES})`, { cause: err });
				}
				const switchRef = normalizeModelRef(err.provider, err.model);
				const switchKey = modelKey(switchRef.provider, switchRef.model);
				if (!allowAnyModel && !allowedModelKeys.has(switchKey)) {
					log.info(`Live session model switch in subagent run ${runId}: rejected ${sanitizeForLog(err.provider)}/${sanitizeForLog(err.model)} (not in allowlist)`);
					if (!lifecycleEnded) emitAgentEvent({
						runId,
						stream: "lifecycle",
						data: {
							phase: "error",
							startedAt,
							endedAt: Date.now(),
							error: "Agent run failed"
						}
					});
					throw new Error(`Live model switch rejected: ${sanitizeForLog(err.provider)}/${sanitizeForLog(err.model)} is not in the agent allowlist`, { cause: err });
				}
				const previousProvider = provider;
				const previousModel = model;
				provider = err.provider;
				model = err.model;
				fallbackProvider = err.provider;
				fallbackModel = err.model;
				providerForAuthProfileValidation = err.provider;
				if (sessionEntry) {
					sessionEntry = { ...sessionEntry };
					sessionEntry.authProfileOverride = err.authProfileId;
					sessionEntry.authProfileOverrideSource = err.authProfileId ? err.authProfileIdSource : void 0;
					sessionEntry.authProfileOverrideCompactionCount = void 0;
				}
				if (storedModelOverride || err.model !== previousModel || err.provider !== previousProvider) storedModelOverride = err.model;
				lifecycleEnded = false;
				log.info(`Live session model switch in subagent run ${runId}: switching to ${sanitizeForLog(err.provider)}/${sanitizeForLog(err.model)}`);
				continue;
			}
			if (!lifecycleEnded) emitAgentEvent({
				runId,
				stream: "lifecycle",
				data: {
					phase: "error",
					startedAt,
					endedAt: Date.now(),
					error: err instanceof Error ? err.message : "Agent run failed"
				}
			});
			throw err;
		}
		if (sessionStore && sessionKey) {
			const { updateSessionStoreAfterAgentRun } = await loadSessionStoreRuntime();
			await updateSessionStoreAfterAgentRun({
				cfg,
				contextTokensOverride: agentCfg?.contextTokens,
				sessionId,
				sessionKey,
				storePath,
				sessionStore,
				defaultProvider: provider,
				defaultModel: model,
				fallbackProvider,
				fallbackModel,
				result
			});
			sessionEntry = sessionStore[sessionKey] ?? sessionEntry;
		}
		if (result.meta.executionTrace?.runner === "cli") try {
			sessionEntry = await attemptExecutionRuntime.persistCliTurnTranscript({
				body,
				result,
				sessionId,
				sessionKey: sessionKey ?? sessionId,
				sessionEntry,
				sessionStore,
				storePath,
				sessionAgentId,
				threadId: opts.threadId,
				sessionCwd: workspaceDir
			});
		} catch (error) {
			log.warn(`CLI transcript persistence failed for ${sessionKey ?? sessionId}: ${error instanceof Error ? error.message : String(error)}`);
		}
		const payloads = result.payloads ?? [];
		const { deliverAgentCommandResult } = await loadDeliveryRuntime();
		return await deliverAgentCommandResult({
			cfg,
			deps,
			runtime,
			opts,
			outboundSession,
			sessionEntry,
			result,
			payloads
		});
	} finally {
		clearAgentRunContext(runId);
	}
}
async function agentCommand(opts, runtime = defaultRuntime, deps = createDefaultDeps()) {
	return await agentCommandInternal({
		...opts,
		senderIsOwner: opts.senderIsOwner ?? true,
		allowModelOverride: opts.allowModelOverride ?? true
	}, runtime, deps);
}
async function agentCommandFromIngress(opts, runtime = defaultRuntime, deps = createDefaultDeps()) {
	if (typeof opts.senderIsOwner !== "boolean") throw new Error("senderIsOwner must be explicitly set for ingress agent runs.");
	if (typeof opts.allowModelOverride !== "boolean") throw new Error("allowModelOverride must be explicitly set for ingress agent runs.");
	return await agentCommandInternal({
		...opts,
		senderIsOwner: opts.senderIsOwner,
		allowModelOverride: opts.allowModelOverride
	}, runtime, deps);
}
const __testing = {
	resolveAgentRuntimeConfig,
	prepareAgentCommandExecution
};
//#endregion
export { agentCommand as n, agentCommandFromIngress as r, __testing as t };
