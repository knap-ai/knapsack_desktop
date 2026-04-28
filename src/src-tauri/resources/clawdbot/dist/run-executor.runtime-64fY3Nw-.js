import { a as logWarn } from "./logger-mz_TsqXj.js";
import { u as resolveEffectiveModelFallbacks } from "./agent-scope-i10se9ty.js";
import { g as normalizeVerboseLevel } from "./thinking-DhTFkZJF.js";
import { t as isCliProvider } from "./model-selection-cli-CrT2GxLy.js";
import { o as resolveSessionTranscriptPath } from "./paths-CHP3g1Fg.js";
import { u as registerAgentRunContext } from "./agent-events-1--MOtpo.js";
import { o as resolveBootstrapWarningSignaturesSeen } from "./bootstrap-budget-FLCjP_87.js";
import { i as LiveSessionModelSwitchError, r as runWithModelFallback } from "./model-fallback-Bo9VOdZK.js";
import { a as resolveCronChannelOutputPolicy, i as syncCronSessionLiveSelection, o as resolveCurrentChannelTarget } from "./run-session-state-D3wWwesU.js";
import { i as resolveCronPayloadOutcome } from "./helpers-gjf6tglW.js";
import { n as isLikelyInterimCronMessage } from "./subagent-followup-hints-BdepinMK.js";
//#region src/cron/isolated-agent/run-execution.runtime.ts
let cronExecutionCliRuntimePromise;
async function loadCronExecutionCliRuntime() {
	cronExecutionCliRuntimePromise ??= import("./run-execution-cli.runtime-D5ztUPEA.js");
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
	cronEmbeddedRuntimePromise ??= import("./run-embedded.runtime-CP5Va3fE.js");
	return await cronEmbeddedRuntimePromise;
}
async function loadCronSubagentRegistryRuntime() {
	cronSubagentRegistryRuntimePromise ??= import("./run-subagent-registry.runtime-BLqsnjcK.js");
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
						sessionKey: params.runSessionKey,
						agentId: params.agentId,
						trigger: "cron",
						jobId: params.job.id,
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
						messageChannel: params.messageChannel,
						abortSignal: params.abortSignal,
						onExecutionStarted: params.onExecutionStarted,
						bootstrapPromptWarningSignaturesSeen,
						bootstrapPromptWarningSignature,
						senderIsOwner: true
					});
					bootstrapPromptWarningSignaturesSeen = resolveBootstrapWarningSignaturesSeen(result.meta?.systemPromptReport);
					return result;
				}
				const { resolveCronAgentLane, resolveFastModeState, runEmbeddedPiAgent } = await loadCronEmbeddedRuntime();
				const currentChannelId = await resolveCurrentChannelTarget({
					channel: params.messageChannel,
					to: params.resolvedDelivery.to,
					threadId: params.resolvedDelivery.threadId
				});
				const result = await runEmbeddedPiAgent({
					sessionId: params.cronSession.sessionEntry.sessionId,
					sessionKey: params.runSessionKey,
					agentId: params.agentId,
					trigger: "cron",
					jobId: params.job.id,
					cleanupBundleMcpOnRunEnd: params.job.sessionTarget === "isolated",
					allowGatewaySubagentBinding: true,
					senderIsOwner: false,
					messageChannel: params.messageChannel,
					agentAccountId: params.resolvedDelivery.accountId,
					messageTo: params.resolvedDelivery.to,
					messageThreadId: params.resolvedDelivery.threadId,
					currentChannelId,
					sessionFile,
					agentDir: params.agentDir,
					workspaceDir: params.workspaceDir,
					config: params.cfgWithAgentDefaults,
					skillsSnapshot: params.skillsSnapshot,
					prompt: promptText,
					lane: resolveCronAgentLane(params.lane),
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
					execOverrides: params.suppressExecNotifyOnExit ? {
						notifyOnExit: false,
						notifyOnExitEmptySuccess: false
					} : void 0,
					runId: params.cronSession.sessionEntry.sessionId,
					requireExplicitMessageTarget: params.toolPolicy.requireExplicitMessageTarget,
					disableMessageTool: params.toolPolicy.disableMessageTool,
					forceMessageTool: params.toolPolicy.forceMessageTool,
					allowTransientCooldownProbe: runOptions?.allowTransientCooldownProbe,
					abortSignal: params.abortSignal,
					onExecutionStarted: params.onExecutionStarted,
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
		sessionKey: params.runSessionKey,
		verboseLevel: resolvedVerboseLevel
	});
	const executor = createCronPromptExecutor({
		cfg: params.cfg,
		cfgWithAgentDefaults: params.cfgWithAgentDefaults,
		job: params.job,
		agentId: params.agentId,
		agentDir: params.agentDir,
		agentSessionKey: params.agentSessionKey,
		runSessionKey: params.runSessionKey,
		workspaceDir: params.workspaceDir,
		lane: params.lane,
		resolvedVerboseLevel,
		thinkLevel: params.thinkLevel,
		timeoutMs: params.timeoutMs,
		messageChannel: params.resolvedDelivery.channel,
		suppressExecNotifyOnExit: params.suppressExecNotifyOnExit,
		resolvedDelivery: params.resolvedDelivery,
		toolPolicy: params.toolPolicy,
		skillsSnapshot: params.skillsSnapshot,
		agentPayload: params.agentPayload,
		liveSelection: params.liveSelection,
		cronSession: params.cronSession,
		abortSignal: params.abortSignal,
		abortReason: params.abortReason,
		onExecutionStarted: params.onExecutionStarted
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
		const { deliveryPayloadHasStructuredContent: interimPayloadHasStructuredContent, hasFatalErrorPayload: interimHasFatalErrorPayload, outputText: interimOutputText } = resolveCronPayloadOutcome({
			payloads: interimPayloads,
			runLevelError: runResult.meta?.error,
			failureSignal: runResult.meta?.failureSignal,
			finalAssistantVisibleText: runResult.meta?.finalAssistantVisibleText,
			preferFinalAssistantVisibleText: (await resolveCronChannelOutputPolicy(params.resolvedDelivery.channel)).preferFinalAssistantVisibleText
		});
		const interimText = interimOutputText?.trim() ?? "";
		const shouldRetryInterimAck = !runResult.meta?.error && !interimHasFatalErrorPayload && !runResult.didSendViaMessagingTool && !interimPayloadHasStructuredContent && !interimPayloads.some((payload) => payload?.isError === true) && isLikelyInterimCronMessage(interimText);
		let hasFreshDescendants = false;
		let hasActiveDescendants = false;
		if (shouldRetryInterimAck) {
			const { countActiveDescendantRuns, listDescendantRunsForRequester } = await loadCronSubagentRegistryRuntime();
			hasFreshDescendants = listDescendantRunsForRequester(params.runSessionKey).some((entry) => {
				const descendantStartedAt = typeof entry.startedAt === "number" ? entry.startedAt : entry.createdAt;
				return typeof descendantStartedAt === "number" && descendantStartedAt >= runStartedAt;
			});
			hasActiveDescendants = countActiveDescendantRuns(params.runSessionKey) > 0;
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
