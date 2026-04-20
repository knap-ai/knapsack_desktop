import { a as logWarn } from "./logger-BA_TvTc6.js";
import { u as resolveEffectiveModelFallbacks } from "./agent-scope-KFH9bkHi.js";
import { t as isCliProvider } from "./model-selection-cli-_3Gn8Wcd.js";
import { d as normalizeVerboseLevel } from "./thinking.shared-CAbk7EZs.js";
import { o as resolveSessionTranscriptPath } from "./paths-CZMxg3hs.js";
import { o as resolveBootstrapWarningSignaturesSeen } from "./bootstrap-budget-BfULAZ3v.js";
import { u as registerAgentRunContext } from "./agent-events-BLJ1mmc3.js";
import { i as LiveSessionModelSwitchError, r as runWithModelFallback } from "./model-fallback-D2mt9Plr.js";
import { i as resolveCronPayloadOutcome } from "./helpers-CYnU2_ru.js";
import { n as isLikelyInterimCronMessage } from "./subagent-followup-hints-C0YI6gyy.js";
import { i as syncCronSessionLiveSelection } from "./run-session-state-NJBSDS3i.js";
//#region src/cron/isolated-agent/run-execution.runtime.ts
let cronExecutionCliRuntimePromise;
async function loadCronExecutionCliRuntime() {
	cronExecutionCliRuntimePromise ??= import("./run-execution-cli.runtime-D-r9wnia.js");
	return await cronExecutionCliRuntimePromise;
}
async function getCliSessionId(...args) {
	return (await loadCronExecutionCliRuntime()).getCliSessionId(...args);
}
async function runCliAgent(...args) {
	return (await loadCronExecutionCliRuntime()).runCliAgent(...args);
}
//#endregion
//#region src/cron/isolated-agent/run-fallback-policy.ts
function resolveCronFallbacksOverride(params) {
	const payload = params.job.payload.kind === "agentTurn" ? params.job.payload : void 0;
	const payloadFallbacks = Array.isArray(payload?.fallbacks) ? payload.fallbacks : void 0;
	const hasCronPayloadModelOverride = typeof payload?.model === "string" && payload.model.trim().length > 0;
	return payloadFallbacks ?? resolveEffectiveModelFallbacks({
		cfg: params.cfg,
		agentId: params.agentId,
		hasSessionModelOverride: hasCronPayloadModelOverride
	});
}
//#endregion
//#region src/cron/isolated-agent/run-executor.ts
let cronEmbeddedRuntimePromise;
let cronSubagentRegistryRuntimePromise;
async function loadCronEmbeddedRuntime() {
	cronEmbeddedRuntimePromise ??= import("./run-embedded.runtime-WaaxcH2W.js");
	return await cronEmbeddedRuntimePromise;
}
async function loadCronSubagentRegistryRuntime() {
	cronSubagentRegistryRuntimePromise ??= import("./run-subagent-registry.runtime-CVi5YlJZ.js");
	return await cronSubagentRegistryRuntimePromise;
}
function createCronPromptExecutor(params) {
	const sessionFile = params.cronSession.sessionEntry.sessionFile?.trim() || resolveSessionTranscriptPath(params.cronSession.sessionEntry.sessionId, params.agentId);
	if (!params.cronSession.sessionEntry.sessionFile?.trim()) params.cronSession.sessionEntry.sessionFile = sessionFile;
	const cronFallbacksOverride = resolveCronFallbacksOverride({
		cfg: params.cfg,
		job: params.job,
		agentId: params.agentId
	});
	let runResult;
	let fallbackProvider = params.liveSelection.provider;
	let fallbackModel = params.liveSelection.model;
	let runEndedAt = Date.now();
	let bootstrapPromptWarningSignaturesSeen = resolveBootstrapWarningSignaturesSeen(params.cronSession.sessionEntry.systemPromptReport);
	const runPrompt = async (promptText) => {
		const fallbackResult = await runWithModelFallback({
			cfg: params.cfgWithAgentDefaults,
			provider: params.liveSelection.provider,
			model: params.liveSelection.model,
			runId: params.cronSession.sessionEntry.sessionId,
			agentDir: params.agentDir,
			fallbacksOverride: cronFallbacksOverride,
			run: async (providerOverride, modelOverride, runOptions) => {
				if (params.abortSignal?.aborted) throw new Error(params.abortReason());
				const bootstrapPromptWarningSignature = bootstrapPromptWarningSignaturesSeen[bootstrapPromptWarningSignaturesSeen.length - 1];
				if (isCliProvider(providerOverride, params.cfgWithAgentDefaults)) {
					const cliSessionId = params.cronSession.isNewSession ? void 0 : await getCliSessionId(params.cronSession.sessionEntry, providerOverride);
					const result = await runCliAgent({
						sessionId: params.cronSession.sessionEntry.sessionId,
						sessionKey: params.agentSessionKey,
						agentId: params.agentId,
						sessionFile,
						workspaceDir: params.workspaceDir,
						config: params.cfgWithAgentDefaults,
						prompt: promptText,
						provider: providerOverride,
						model: modelOverride,
						thinkLevel: params.thinkLevel,
						timeoutMs: params.timeoutMs,
						runId: params.cronSession.sessionEntry.sessionId,
						cliSessionId,
						skillsSnapshot: params.skillsSnapshot,
						bootstrapPromptWarningSignaturesSeen,
						bootstrapPromptWarningSignature,
						senderIsOwner: true
					});
					bootstrapPromptWarningSignaturesSeen = resolveBootstrapWarningSignaturesSeen(result.meta?.systemPromptReport);
					return result;
				}
				const { resolveFastModeState, resolveNestedAgentLane, runEmbeddedPiAgent } = await loadCronEmbeddedRuntime();
				const result = await runEmbeddedPiAgent({
					sessionId: params.cronSession.sessionEntry.sessionId,
					sessionKey: params.agentSessionKey,
					agentId: params.agentId,
					trigger: "cron",
					allowGatewaySubagentBinding: true,
					senderIsOwner: false,
					messageChannel: params.messageChannel,
					agentAccountId: params.resolvedDelivery.accountId,
					sessionFile,
					agentDir: params.agentDir,
					workspaceDir: params.workspaceDir,
					config: params.cfgWithAgentDefaults,
					skillsSnapshot: params.skillsSnapshot,
					prompt: promptText,
					lane: resolveNestedAgentLane(params.lane),
					provider: providerOverride,
					model: modelOverride,
					authProfileId: params.liveSelection.authProfileId,
					authProfileIdSource: params.liveSelection.authProfileId ? params.liveSelection.authProfileIdSource : void 0,
					thinkLevel: params.thinkLevel,
					fastMode: resolveFastModeState({
						cfg: params.cfgWithAgentDefaults,
						provider: providerOverride,
						model: modelOverride,
						agentId: params.agentId,
						sessionEntry: params.cronSession.sessionEntry
					}).enabled,
					verboseLevel: params.resolvedVerboseLevel,
					timeoutMs: params.timeoutMs,
					bootstrapContextMode: params.agentPayload?.lightContext ? "lightweight" : void 0,
					bootstrapContextRunKind: "cron",
					toolsAllow: params.agentPayload?.toolsAllow,
					runId: params.cronSession.sessionEntry.sessionId,
					requireExplicitMessageTarget: params.toolPolicy.requireExplicitMessageTarget,
					disableMessageTool: params.toolPolicy.disableMessageTool,
					allowTransientCooldownProbe: runOptions?.allowTransientCooldownProbe,
					abortSignal: params.abortSignal,
					bootstrapPromptWarningSignaturesSeen,
					bootstrapPromptWarningSignature
				});
				bootstrapPromptWarningSignaturesSeen = resolveBootstrapWarningSignaturesSeen(result.meta?.systemPromptReport);
				return result;
			}
		});
		runResult = fallbackResult.result;
		fallbackProvider = fallbackResult.provider;
		fallbackModel = fallbackResult.model;
		params.liveSelection.provider = fallbackResult.provider;
		params.liveSelection.model = fallbackResult.model;
		runEndedAt = Date.now();
	};
	return {
		runPrompt,
		getState: () => ({
			runResult,
			fallbackProvider,
			fallbackModel,
			runEndedAt,
			liveSelection: params.liveSelection
		})
	};
}
async function executeCronRun(params) {
	const resolvedVerboseLevel = normalizeVerboseLevel(params.cronSession.sessionEntry.verboseLevel) ?? normalizeVerboseLevel(params.agentVerboseDefault) ?? "off";
	registerAgentRunContext(params.cronSession.sessionEntry.sessionId, {
		sessionKey: params.agentSessionKey,
		verboseLevel: resolvedVerboseLevel
	});
	const executor = createCronPromptExecutor({
		cfg: params.cfg,
		cfgWithAgentDefaults: params.cfgWithAgentDefaults,
		job: params.job,
		agentId: params.agentId,
		agentDir: params.agentDir,
		agentSessionKey: params.agentSessionKey,
		workspaceDir: params.workspaceDir,
		lane: params.lane,
		resolvedVerboseLevel,
		thinkLevel: params.thinkLevel,
		timeoutMs: params.timeoutMs,
		messageChannel: params.resolvedDelivery.channel,
		resolvedDelivery: params.resolvedDelivery,
		toolPolicy: params.toolPolicy,
		skillsSnapshot: params.skillsSnapshot,
		agentPayload: params.agentPayload,
		liveSelection: params.liveSelection,
		cronSession: params.cronSession,
		abortSignal: params.abortSignal,
		abortReason: params.abortReason
	});
	const runStartedAt = params.runStartedAt ?? Date.now();
	const MAX_MODEL_SWITCH_RETRIES = 2;
	let modelSwitchRetries = 0;
	while (true) try {
		await executor.runPrompt(params.commandBody);
		break;
	} catch (err) {
		if (!(err instanceof LiveSessionModelSwitchError)) throw err;
		modelSwitchRetries += 1;
		if (modelSwitchRetries > MAX_MODEL_SWITCH_RETRIES) {
			logWarn(`[cron:${params.job.id}] LiveSessionModelSwitchError retry limit reached (${MAX_MODEL_SWITCH_RETRIES}); aborting`);
			throw err;
		}
		params.liveSelection.provider = err.provider;
		params.liveSelection.model = err.model;
		params.liveSelection.authProfileId = err.authProfileId;
		params.liveSelection.authProfileIdSource = err.authProfileId ? err.authProfileIdSource : void 0;
		syncCronSessionLiveSelection({
			entry: params.cronSession.sessionEntry,
			liveSelection: params.liveSelection
		});
		try {
			await params.persistSessionEntry();
		} catch (persistErr) {
			logWarn(`[cron:${params.job.id}] Failed to persist model switch session entry: ${String(persistErr)}`);
		}
		continue;
	}
	let { runResult, fallbackProvider, fallbackModel, runEndedAt } = executor.getState();
	if (!runResult) throw new Error("cron isolated run returned no result");
	if (!params.isAborted()) {
		const interimPayloads = runResult.payloads ?? [];
		const { deliveryPayloadHasStructuredContent: interimPayloadHasStructuredContent, outputText: interimOutputText } = resolveCronPayloadOutcome({
			payloads: interimPayloads,
			runLevelError: runResult.meta?.error,
			finalAssistantVisibleText: runResult.meta?.finalAssistantVisibleText,
			preferFinalAssistantVisibleText: params.resolvedDelivery.channel === "telegram"
		});
		const interimText = interimOutputText?.trim() ?? "";
		const shouldRetryInterimAck = !runResult.meta?.error && !runResult.didSendViaMessagingTool && !interimPayloadHasStructuredContent && !interimPayloads.some((payload) => payload?.isError === true) && isLikelyInterimCronMessage(interimText);
		let hasFreshDescendants = false;
		let hasActiveDescendants = false;
		if (shouldRetryInterimAck) {
			const { countActiveDescendantRuns, listDescendantRunsForRequester } = await loadCronSubagentRegistryRuntime();
			hasFreshDescendants = listDescendantRunsForRequester(params.agentSessionKey).some((entry) => {
				const descendantStartedAt = typeof entry.startedAt === "number" ? entry.startedAt : entry.createdAt;
				return typeof descendantStartedAt === "number" && descendantStartedAt >= runStartedAt;
			});
			hasActiveDescendants = countActiveDescendantRuns(params.agentSessionKey) > 0;
		}
		if (shouldRetryInterimAck && !hasFreshDescendants && !hasActiveDescendants) {
			const continuationPrompt = [
				"Your previous response was only an acknowledgement and did not complete this cron task.",
				"Complete the original task now.",
				"Do not send a status update like 'on it'.",
				"Use tools when needed, including sessions_spawn for parallel subtasks, wait for spawned subagents to finish, then return only the final summary."
			].join(" ");
			await executor.runPrompt(continuationPrompt);
			({runResult, fallbackProvider, fallbackModel, runEndedAt} = executor.getState());
		}
	}
	if (!runResult) throw new Error("cron isolated run returned no result");
	return {
		runResult,
		fallbackProvider,
		fallbackModel,
		runStartedAt,
		runEndedAt,
		liveSelection: params.liveSelection
	};
}
//#endregion
export { executeCronRun };
