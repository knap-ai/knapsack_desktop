import { i as formatErrorMessage } from "./errors-Jbvi20TW.js";
import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString, f as readStringValue, n as localeLowercasePreservingWhitespace, s as normalizeOptionalLowercaseString } from "./string-coerce-C1IzJjqi.js";
import { n as isAbortError } from "./unhandled-rejections-Bzjq4Io_.js";
import { l as isRecord } from "./utils-BMRcljdi.js";
import { t as createSubsystemLogger } from "./subsystem-CWI_MDy_.js";
import { a as logWarn, t as logDebug } from "./logger-bvytzgs1.js";
import { i as openBoundaryFileSync, r as openBoundaryFile } from "./boundary-file-read-BDEvfiRb.js";
import { t as loadPluginManifestRegistry } from "./manifest-registry-pYrbrdHJ.js";
import { c as resolveEffectivePluginActivationState, o as normalizePluginsConfig } from "./config-state-UvzNc3si.js";
import { n as normalizeAccountId } from "./account-id-C3j_3_su.js";
import { r as normalizeProviderId } from "./provider-id-BLh32HP1.js";
import { i as normalizeChannelId } from "./registry-B2TRwbJD.js";
import { t as DEFAULT_CONTEXT_TOKENS } from "./defaults-DM8yIn8C.js";
import { r as resolveProviderEndpoint } from "./provider-attribution-DMdhUxEe.js";
import { i as applyMergePatch } from "./schema-validator-BKDxqOUA.js";
import { v as resolveAgentContextLimits } from "./agent-scope-_6dFncNS.js";
import { t as parseDurationMs } from "./parse-duration-DH3x5y_9.js";
import { t as resolveAccountEntry } from "./account-lookup-B3p3r-Uq.js";
import { t as rawDataToString } from "./ws-VGsesElb.js";
import { a as normalizeInputProvenance, n as applyInputProvenanceToUserMessage, r as hasInterSessionUserProvenance } from "./input-provenance-IJ6YNe09.js";
import { s as getCompactionProvider } from "./loader-NucjcOgv.js";
import "./plugins-BZ_I3cWH.js";
import { t as getGlobalHookRunner } from "./hook-runner-global-C-5w-v1N.js";
import { t as listAgentToolResultMiddlewares } from "./agent-tool-result-middleware-yRWJju9O.js";
import { D as resolveProviderCacheTtlEligibility, J as validateProviderReplayTurnsWithPlugin, R as resolveProviderTransportTurnStateWithPlugin, V as resolveProviderWebSocketSessionPolicyWithPlugin, W as sanitizeProviderReplayHistoryWithPlugin, nt as resolveProviderRuntimePlugin } from "./provider-runtime-C1HXSRlX.js";
import "./model-selection-hTT37jzm.js";
import { c as createExpiringMapCache, d as resolveCacheTtlMs, u as isCacheEnabled } from "./store-cache-C-s7DrKa.js";
import { n as acquireSessionWriteLock } from "./session-write-lock-CAy2l2rJ.js";
import { t as emitSessionTranscriptUpdate } from "./transcript-events-ofiGBxi_.js";
import { a as normalizeUsage, i as makeZeroUsageSnapshot } from "./usage-xVEV8sHL.js";
import { a as normalizeAssistantPhase, o as parseAssistantTextSignature, t as encodeAssistantTextSignature } from "./chat-message-content-BMWW7Uy3.js";
import { o as resolveContextWindowInfo } from "./context-window-guard-Cd8bhVQq.js";
import { a as isSilentReplyText } from "./tokens-C_v_J0E7.js";
import { s as stripHeartbeatToken } from "./heartbeat-DKgfsHcO.js";
import { c as mergeAlsoAllowPolicy, m as resolveToolProfilePolicy, n as applyOwnerOnlyToolPolicy } from "./tool-policy-DArLXMH2.js";
import { i as setPluginToolMeta, n as getPluginToolMeta } from "./tools-CZr3orc0.js";
import { c as downgradeOpenAIFunctionCallReasoningPairs, g as sanitizeGoogleTurnOrdering, l as downgradeOpenAIReasoningBlocks, n as validateGeminiTurns, s as sanitizeSessionMessagesImages, t as validateAnthropicTurns, u as isGoogleModelApi } from "./pi-embedded-helpers-C0R2W0ZW.js";
import { n as matchesAnyGlobPattern, t as compileGlobPatterns } from "./glob-pattern-CT6DNi96.js";
import { n as extractToolResultId, r as sanitizeToolCallIdsForCloudCodeAssist, t as extractToolCallsFromAssistant } from "./tool-call-id-CLaBkBI7.js";
import { i as resolveImageSanitizationLimits } from "./tool-images-CE0bWSrm.js";
import { a as isTimeoutError } from "./failover-error-D72vttCv.js";
import { r as createAgentToolResultMiddlewareRunner } from "./tool-schema-runtime-B9xsYCmd.js";
import { c as mapOpenAIReasoningEffortForModel, i as createBoundaryAwareStreamFnForModel, l as resolveOpenAIStrictToolSetting, o as normalizeOpenAIStrictToolParameters, s as resolveOpenAIStrictToolFlagForInventory } from "./provider-stream-EGXtbhbQ.js";
import { d as resolveDebugProxySettings, n as captureWsEvent, u as createDebugProxyWebSocketAgent } from "./runtime-CadHRMLo.js";
import { i as normalizeOpenAIReasoningEffort } from "./openai-responses-payload-policy-nh4fYQcn.js";
import { t as log$3 } from "./logger-Cq8_pd8S.js";
import { y as resolveOpenAITextVerbosity } from "./proxy-stream-wrappers-C97rqRKW.js";
import { c as resolveProviderRequestPolicyConfig, i as getModelProviderRequestTransport, r as buildProviderRequestTlsClientOptions } from "./provider-request-config-Bxj9Jz-Z.js";
import { i as stripSystemPromptCacheBoundary } from "./system-prompt-cache-boundary-CeY_ZCdW.js";
import { r as hasCopilotVisionInput, t as buildCopilotDynamicHeaders } from "./copilot-dynamic-headers-Cjo05vxn.js";
import { d as repairToolUseResultPairing, f as sanitizeToolCallInputs, m as stripToolResultDetails, p as sanitizeToolUseResultPairing, s as mergeTransportMetadata, u as makeMissingToolResult } from "./transport-stream-shared-21GahxfU.js";
import { n as loadEnabledBundleLspConfig } from "./bundle-lsp-0y4CwTzU.js";
import { c as loadEmbeddedPiMcpConfig, d as describeStdioMcpServerLaunchConfig, f as resolveStdioMcpServerLaunchConfig } from "./pi-bundle-mcp-runtime-B_SrebwR.js";
import { t as collectTextContentBlocks } from "./content-blocks-yDpFZ6IX.js";
import { r as applyPiCompactionSettingsFromConfig } from "./pi-settings-DnGbeiAj.js";
import { a as toToolDefinitions } from "./pi-tool-definition-adapter-CXI4s2a7.js";
import { a as resolveGroupToolPolicy, i as resolveGroupContextFromSessionKey, o as resolveSubagentToolPolicyForSession, r as resolveEffectiveToolPolicy } from "./read-capability-NRo6-_mG.js";
import { i as resolveSubagentCapabilityStore, t as isSubagentEnvelopeSession } from "./subagent-capabilities-XxJhf1t-.js";
import { n as buildDefaultToolPolicyPipelineSteps, t as applyToolPolicyPipeline } from "./tool-policy-pipeline-BP097Aez.js";
import { i as setRawSessionAppendMessage, n as rewriteTranscriptEntriesInSessionManager, r as getRawSessionAppendMessage } from "./transcript-rewrite-DEfbMkgI.js";
import { i as resolveSkillRuntimeConfig } from "./env-overrides-rjhjtupn.js";
import { o as loadWorkspaceSkillEntries } from "./workspace-7Uj_FaPS.js";
import "./skills-ClcFefyl.js";
import { i as resolveUserTimezone } from "./date-time-CvWUojm_.js";
import { y as shouldPreserveThinkingBlocks } from "./provider-model-shared-D-iKoymz.js";
import { C as isAnthropicModelRef, S as isAnthropicFamilyCacheTtlEligible } from "./provider-stream-shared-BYe_GyIX.js";
import { o as isGooglePromptCacheEligible } from "./extra-params-BSCrTsfs.js";
import { t as withTimeout } from "./with-timeout-CQk2w6Fh.js";
import { n as resolveCronStyleNow } from "./current-time-GUMQXnlj.js";
import { n as retryAsync } from "./retry-D2j_UnTY.js";
import { n as isQueryStopWordToken, t as extractKeywords } from "./query-expansion-Dqgt2KXp.js";
import "./query-DidA433J.js";
import { i as wrapUntrustedPromptDataBlock, t as buildAgentSystemPrompt } from "./system-prompt-C0kqz5AF.js";
import { t as estimateStringChars } from "./cjk-chars-Cw_Ytzp3.js";
import { t as createAnthropicVertexStreamFnForModel } from "./anthropic-vertex-stream-Cp19SBcn.js";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import fs$1 from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import WebSocket from "ws";
import { Buffer as Buffer$1 } from "node:buffer";
import { SessionManager, SettingsManager, estimateTokens, generateSummary } from "@mariozechner/pi-coding-agent";
import * as piAi from "@mariozechner/pi-ai";
import { streamSimple } from "@mariozechner/pi-ai";
import { EventEmitter } from "node:events";
//#region src/config/channel-capabilities.ts
const isStringArray = (value) => Array.isArray(value) && value.every((entry) => typeof entry === "string");
function normalizeCapabilities(capabilities) {
	if (!isStringArray(capabilities)) return;
	const normalized = capabilities.map((entry) => entry.trim()).filter(Boolean);
	return normalized.length > 0 ? normalized : void 0;
}
function resolveAccountCapabilities(params) {
	const cfg = params.cfg;
	if (!cfg) return;
	const normalizedAccountId = normalizeAccountId(params.accountId);
	const accounts = cfg.accounts;
	if (accounts && typeof accounts === "object") {
		const match = resolveAccountEntry(accounts, normalizedAccountId);
		if (match) return normalizeCapabilities(match.capabilities) ?? normalizeCapabilities(cfg.capabilities);
	}
	return normalizeCapabilities(cfg.capabilities);
}
function resolveChannelCapabilities(params) {
	const cfg = params.cfg;
	const channel = normalizeChannelId(params.channel);
	if (!cfg || !channel) return;
	return resolveAccountCapabilities({
		cfg: cfg.channels?.[channel] ?? cfg[channel],
		accountId: params.accountId
	});
}
//#endregion
//#region src/agents/openai-ws-request.ts
function stringifyStable$1(value) {
	if (value === void 0) return "";
	if (value === null || typeof value !== "object") return JSON.stringify(value);
	if (Array.isArray(value)) return `[${value.map((entry) => stringifyStable$1(entry)).join(",")}]`;
	return `{${Object.entries(value).filter(([, entry]) => entry !== void 0).toSorted(([left], [right]) => left.localeCompare(right)).map(([key, entry]) => `${JSON.stringify(key)}:${stringifyStable$1(entry)}`).join(",")}}`;
}
function payloadWithoutIncrementalFields(payload) {
	const { input: _input, metadata: _metadata, previous_response_id: _previousResponseId, ...rest } = payload;
	return rest;
}
function payloadFieldsMatch(left, right) {
	return stringifyStable$1(payloadWithoutIncrementalFields(left)) === stringifyStable$1(payloadWithoutIncrementalFields(right));
}
function inputItemsStartWith(input, baseline) {
	if (baseline.length > input.length) return false;
	return baseline.every((item, index) => stringifyStable$1(item) === stringifyStable$1(input[index]));
}
function planOpenAIWebSocketRequestPayload(params) {
	const fullInputItems = Array.isArray(params.fullPayload.input) ? params.fullPayload.input : [];
	const previousInputItems = Array.isArray(params.previousRequestPayload?.input) ? params.previousRequestPayload.input : [];
	const previousResponseInputItems = params.previousResponseInputItems ?? [];
	if (params.previousResponseId && params.previousRequestPayload && payloadFieldsMatch(params.fullPayload, params.previousRequestPayload)) {
		const baseline = [...previousInputItems, ...previousResponseInputItems];
		if (inputItemsStartWith(fullInputItems, baseline)) return {
			mode: "incremental",
			payload: {
				...params.fullPayload,
				previous_response_id: params.previousResponseId,
				input: fullInputItems.slice(baseline.length)
			}
		};
	}
	const { previous_response_id: _previousResponseId, ...payload } = params.fullPayload;
	return {
		mode: "full_context",
		payload
	};
}
function buildOpenAIWebSocketWarmUpPayload(params) {
	return {
		type: "response.create",
		generate: false,
		model: params.model,
		input: [],
		...params.tools?.length ? { tools: params.tools } : {},
		...params.instructions ? { instructions: params.instructions } : {},
		...params.metadata ? { metadata: params.metadata } : {}
	};
}
function buildOpenAIWebSocketResponseCreatePayload(params) {
	const extraParams = {};
	const streamOpts = params.options;
	if (streamOpts?.temperature !== void 0) extraParams.temperature = streamOpts.temperature;
	if (streamOpts?.maxTokens !== void 0) extraParams.max_output_tokens = streamOpts.maxTokens;
	if (streamOpts?.topP !== void 0) extraParams.top_p = streamOpts.topP;
	if (streamOpts?.toolChoice !== void 0) extraParams.tool_choice = streamOpts.toolChoice;
	const reasoningEffort = mapOpenAIReasoningEffortForModel({
		model: params.model,
		effort: streamOpts?.reasoningEffort ?? streamOpts?.reasoning ?? (params.model.reasoning ? "high" : void 0)
	});
	if (reasoningEffort || streamOpts?.reasoningSummary) {
		const reasoning = {};
		if (reasoningEffort !== void 0) reasoning.effort = normalizeOpenAIReasoningEffort(reasoningEffort);
		if (reasoningEffort !== "none" && streamOpts?.reasoningSummary !== void 0) reasoning.summary = streamOpts.reasoningSummary;
		extraParams.reasoning = reasoning;
	}
	const textVerbosity = resolveOpenAITextVerbosity(streamOpts);
	if (textVerbosity !== void 0) extraParams.text = {
		...extraParams.text && typeof extraParams.text === "object" ? extraParams.text : {},
		verbosity: textVerbosity
	};
	const supportsResponsesStoreField = resolveProviderRequestPolicyConfig({
		provider: readStringValue(params.model.provider),
		api: readStringValue(params.model.api),
		baseUrl: readStringValue(params.model.baseUrl),
		compat: params.model.compat,
		capability: "llm",
		transport: "websocket"
	}).capabilities.supportsResponsesStoreField;
	return {
		type: "response.create",
		model: params.model.id,
		...supportsResponsesStoreField ? { store: false } : {},
		input: params.turnInput.inputItems,
		instructions: params.context.systemPrompt ? stripSystemPromptCacheBoundary(params.context.systemPrompt) : void 0,
		tools: params.tools.length > 0 ? params.tools : void 0,
		...params.turnInput.previousResponseId ? { previous_response_id: params.turnInput.previousResponseId } : {},
		...params.metadata ? { metadata: params.metadata } : {},
		...extraParams
	};
}
//#endregion
//#region src/agents/openai-ws-connection.ts
/**
* OpenAI WebSocket Connection Manager
*
* Manages a persistent WebSocket connection to the OpenAI Responses API
* (wss://api.openai.com/v1/responses) for multi-turn tool-call workflows.
*
* Features:
* - Auto-reconnect with exponential backoff (max 5 retries: 1s/2s/4s/8s/16s)
* - Tracks previous_response_id per connection for incremental turns
* - Warm-up support (generate: false) to pre-load the connection
* - Typed WebSocket event definitions matching the Responses API SSE spec
*
* @see https://developers.openai.com/api/docs/guides/websocket-mode
*/
const OPENAI_WS_URL = "wss://api.openai.com/v1/responses";
const MAX_RETRIES = 5;
/** Backoff delays in ms: 1s, 2s, 4s, 8s, 16s */
const BACKOFF_DELAYS_MS = [
	1e3,
	2e3,
	4e3,
	8e3,
	16e3
];
/**
* Manages a persistent WebSocket connection to the OpenAI Responses API.
*
* Usage:
* ```ts
* const manager = new OpenAIWebSocketManager();
* await manager.connect(apiKey);
*
* manager.onMessage((event) => {
*   if (event.type === "response.completed") {
*     console.log("Response ID:", event.response.id);
*   }
* });
*
* manager.send({ type: "response.create", model: "gpt-5.4", input: [...] });
* ```
*/
var OpenAIWebSocketManager = class extends EventEmitter {
	constructor(options = {}) {
		super();
		this.ws = null;
		this.apiKey = null;
		this.retryCount = 0;
		this.retryTimer = null;
		this.closed = false;
		this._previousResponseId = null;
		this._connectionState = "idle";
		this._lastCloseInfo = null;
		this.wsUrl = options.url ?? OPENAI_WS_URL;
		this.maxRetries = options.maxRetries ?? MAX_RETRIES;
		this.backoffDelaysMs = options.backoffDelaysMs ?? BACKOFF_DELAYS_MS;
		this.socketFactory = options.socketFactory ?? ((url, socketOptions) => new WebSocket(url, socketOptions));
		this.headers = options.headers;
		this.request = options.request;
		this.flowId = randomUUID();
	}
	/**
	* Returns the previous_response_id from the last completed response,
	* for use in subsequent response.create events.
	*/
	get previousResponseId() {
		return this._previousResponseId;
	}
	get connectionState() {
		return this._connectionState;
	}
	get lastCloseInfo() {
		return this._lastCloseInfo;
	}
	/**
	* Opens a WebSocket connection to the OpenAI Responses API.
	* Resolves when the connection is established (open event fires).
	* Rejects if the initial connection fails after max retries.
	*/
	connect(apiKey) {
		this.apiKey = apiKey;
		this.closed = false;
		this.retryCount = 0;
		this._connectionState = "connecting";
		this._lastCloseInfo = null;
		return this._openConnection();
	}
	/**
	* Sends a typed event to the OpenAI Responses API over the WebSocket.
	* Throws if the connection is not open.
	*/
	send(event) {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) throw new Error(`OpenAIWebSocketManager: cannot send — connection is not open (readyState=${this.ws?.readyState ?? "no socket"})`);
		const payload = JSON.stringify(event);
		captureWsEvent({
			url: this.wsUrl,
			direction: "outbound",
			kind: "ws-frame",
			flowId: this.flowId,
			payload,
			meta: { eventType: event.type }
		});
		this.ws.send(payload);
	}
	/**
	* Registers a handler for incoming server-sent WebSocket events.
	* Returns an unsubscribe function.
	*/
	onMessage(handler) {
		this.on("message", handler);
		return () => {
			this.off("message", handler);
		};
	}
	/**
	* Returns true if the WebSocket is currently open and ready to send.
	*/
	isConnected() {
		return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
	}
	/**
	* Permanently closes the WebSocket connection and disables auto-reconnect.
	*/
	close() {
		this.closed = true;
		this._connectionState = "closed";
		this._cancelRetryTimer();
		if (this.ws) {
			this.ws.removeAllListeners();
			try {
				if (this.ws.readyState === WebSocket.OPEN) this.ws.close(1e3, "Client closed");
				else if (this.ws.readyState === WebSocket.CONNECTING) this.ws.terminate();
			} catch {}
			this.ws = null;
		}
	}
	_openConnection() {
		return new Promise((resolve, reject) => {
			if (!this.apiKey) {
				reject(/* @__PURE__ */ new Error("OpenAIWebSocketManager: apiKey is required before connecting."));
				return;
			}
			const requestConfig = resolveProviderRequestPolicyConfig({
				provider: "openai",
				api: "openai-responses",
				baseUrl: this.wsUrl,
				capability: "llm",
				transport: "websocket",
				providerHeaders: {
					Authorization: `Bearer ${this.apiKey}`,
					"OpenAI-Beta": "responses-websocket=v1",
					...this.headers
				},
				precedence: "defaults-win",
				request: this.request,
				allowPrivateNetwork: this.request?.allowPrivateNetwork === true
			});
			const debugAgent = createDebugProxyWebSocketAgent(resolveDebugProxySettings());
			const socket = this.socketFactory(this.wsUrl, {
				headers: requestConfig.headers,
				...debugAgent ? { agent: debugAgent } : {},
				...buildProviderRequestTlsClientOptions(requestConfig)
			});
			this.ws = socket;
			const onOpen = () => {
				this.retryCount = 0;
				this._connectionState = "open";
				this._lastCloseInfo = null;
				captureWsEvent({
					url: this.wsUrl,
					direction: "local",
					kind: "ws-open",
					flowId: this.flowId
				});
				resolve();
				this.emit("open");
			};
			const onError = (err) => {
				socket.off("open", onOpen);
				if (this.listenerCount("error") > 0) this.emit("error", err);
				captureWsEvent({
					url: this.wsUrl,
					direction: "local",
					kind: "error",
					flowId: this.flowId,
					errorText: err.message
				});
				if (this._connectionState === "connecting" || this._connectionState === "reconnecting") this._connectionState = "closed";
				reject(err);
			};
			const onClose = (code, reason) => {
				const reasonStr = reason.toString();
				const closeInfo = {
					code,
					reason: reasonStr,
					retryable: isRetryableWebSocketClose(code)
				};
				this._lastCloseInfo = closeInfo;
				captureWsEvent({
					url: this.wsUrl,
					direction: "local",
					kind: "ws-close",
					flowId: this.flowId,
					closeCode: code,
					payload: reasonStr
				});
				this.emit("close", code, reasonStr);
				if (!this.closed && closeInfo.retryable) this._scheduleReconnect();
				else this._connectionState = "closed";
			};
			const onMessage = (data) => {
				captureWsEvent({
					url: this.wsUrl,
					direction: "inbound",
					kind: "ws-frame",
					flowId: this.flowId,
					payload: Buffer.from(rawDataToString(data))
				});
				this._handleMessage(data);
			};
			socket.once("open", onOpen);
			socket.on("error", onError);
			socket.on("close", onClose);
			socket.on("message", onMessage);
		});
	}
	_scheduleReconnect() {
		if (this.closed) return;
		if (this.retryCount >= this.maxRetries) {
			this._connectionState = "closed";
			this._safeEmitError(/* @__PURE__ */ new Error(`OpenAIWebSocketManager: max reconnect retries (${this.maxRetries}) exceeded.`));
			return;
		}
		const delayMs = this.backoffDelaysMs[Math.min(this.retryCount, this.backoffDelaysMs.length - 1)] ?? 1e3;
		this.retryCount++;
		this._connectionState = "reconnecting";
		this.retryTimer = setTimeout(() => {
			if (this.closed) return;
			this._openConnection().catch(() => {});
		}, delayMs);
	}
	/** Emit an error only if there are listeners; prevents Node.js from crashing
	*  with "unhandled 'error' event" when no one is listening. */
	_safeEmitError(err) {
		if (this.listenerCount("error") > 0) this.emit("error", err);
	}
	_cancelRetryTimer() {
		if (this.retryTimer !== null) {
			clearTimeout(this.retryTimer);
			this.retryTimer = null;
		}
	}
	_handleMessage(data) {
		let text;
		if (typeof data === "string") text = data;
		else if (Buffer.isBuffer(data)) text = data.toString("utf8");
		else if (data instanceof ArrayBuffer) text = Buffer.from(data).toString("utf8");
		else text = String(data);
		let parsed;
		try {
			parsed = JSON.parse(text);
		} catch {
			this._safeEmitError(/* @__PURE__ */ new Error(`OpenAIWebSocketManager: failed to parse message: ${text.slice(0, 200)}`));
			return;
		}
		if (!parsed || typeof parsed !== "object" || !("type" in parsed)) {
			this._safeEmitError(/* @__PURE__ */ new Error(`OpenAIWebSocketManager: unexpected message shape (no "type" field): ${text.slice(0, 200)}`));
			return;
		}
		const event = parsed;
		if (event.type === "response.completed" && event.response?.id) this._previousResponseId = event.response.id;
		this.emit("message", event);
	}
	/**
	* Sends a warm-up event to pre-load the connection and model without generating output.
	* Pass tools/instructions to prime the connection for the upcoming session.
	*/
	warmUp(params) {
		const event = buildOpenAIWebSocketWarmUpPayload(params);
		this.send(event);
	}
};
function getOpenAIWebSocketErrorDetails(event) {
	return {
		status: typeof event.status === "number" ? event.status : void 0,
		type: event.error?.type,
		code: event.error?.code ?? event.code,
		message: event.error?.message ?? event.message,
		param: event.error?.param ?? event.param
	};
}
function isRetryableWebSocketClose(code) {
	return code === 1001 || code === 1005 || code === 1006 || code === 1011 || code === 1012 || code === 1013;
}
//#endregion
//#region src/agents/stream-message-shared.ts
function buildZeroUsage() {
	return {
		input: 0,
		output: 0,
		cacheRead: 0,
		cacheWrite: 0,
		totalTokens: 0,
		cost: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0,
			total: 0
		}
	};
}
function buildUsageWithNoCost(params) {
	const input = params.input ?? 0;
	const output = params.output ?? 0;
	return {
		input,
		output,
		cacheRead: params.cacheRead ?? 0,
		cacheWrite: params.cacheWrite ?? 0,
		totalTokens: params.totalTokens ?? input + output,
		cost: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0,
			total: 0
		}
	};
}
function buildAssistantMessage(params) {
	return {
		role: "assistant",
		content: params.content,
		stopReason: params.stopReason,
		api: params.model.api,
		provider: params.model.provider,
		model: params.model.id,
		usage: params.usage,
		timestamp: params.timestamp ?? Date.now()
	};
}
function buildAssistantMessageWithZeroUsage(params) {
	return buildAssistantMessage({
		model: params.model,
		content: params.content,
		stopReason: params.stopReason,
		usage: buildZeroUsage(),
		timestamp: params.timestamp
	});
}
function buildStreamErrorAssistantMessage(params) {
	return {
		...buildAssistantMessageWithZeroUsage({
			model: params.model,
			content: [],
			stopReason: "error",
			timestamp: params.timestamp
		}),
		stopReason: "error",
		errorMessage: params.errorMessage
	};
}
//#endregion
//#region src/agents/openai-ws-message-conversion.ts
function toNonEmptyString(value) {
	if (typeof value !== "string") return null;
	const trimmed = normalizeOptionalString(value) ?? "";
	return trimmed.length > 0 ? trimmed : null;
}
function supportsImageInput(modelOverride) {
	return !Array.isArray(modelOverride?.input) || modelOverride.input.includes("image");
}
function usesOpenAICompletionsImageParts(modelOverride) {
	return modelOverride?.api === "openai-completions";
}
function toImageUrlFromBase64(params) {
	return `data:${params.mediaType ?? "image/jpeg"};base64,${params.data}`;
}
function contentToText(content) {
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return "";
	return content.filter((part) => Boolean(part) && typeof part === "object").filter((part) => (part.type === "text" || part.type === "input_text" || part.type === "output_text") && typeof part.text === "string").map((part) => part.text).join("");
}
function contentToOpenAIParts(content, modelOverride) {
	if (typeof content === "string") return content ? [{
		type: "input_text",
		text: content
	}] : [];
	if (!Array.isArray(content)) return [];
	const includeImages = supportsImageInput(modelOverride);
	const useImageUrl = usesOpenAICompletionsImageParts(modelOverride);
	const parts = [];
	for (const part of content) {
		if ((part.type === "text" || part.type === "input_text" || part.type === "output_text") && typeof part.text === "string") {
			parts.push({
				type: "input_text",
				text: part.text
			});
			continue;
		}
		if (!includeImages) continue;
		if (part.type === "image" && typeof part.data === "string") {
			if (useImageUrl) {
				parts.push({
					type: "image_url",
					image_url: { url: toImageUrlFromBase64({
						mediaType: part.mimeType,
						data: part.data
					}) }
				});
				continue;
			}
			parts.push({
				type: "input_image",
				source: {
					type: "base64",
					media_type: part.mimeType ?? "image/jpeg",
					data: part.data
				}
			});
			continue;
		}
		if (part.type === "input_image" && part.source && typeof part.source === "object" && typeof part.source.type === "string") {
			const source = part.source;
			if (useImageUrl) {
				parts.push({
					type: "image_url",
					image_url: { url: source.type === "url" ? source.url : toImageUrlFromBase64({
						mediaType: source.media_type,
						data: source.data
					}) }
				});
				continue;
			}
			parts.push({
				type: "input_image",
				source
			});
		}
	}
	return parts;
}
function isReplayableReasoningType(value) {
	return typeof value === "string" && (value === "reasoning" || value.startsWith("reasoning."));
}
function toReplayableReasoningId(value) {
	const id = toNonEmptyString(value);
	return id && id.startsWith("rs_") ? id : null;
}
function toReasoningSignature(value) {
	if (!value || typeof value !== "object") return null;
	const record = value;
	if (!isReplayableReasoningType(record.type)) return null;
	const reasoningId = toReplayableReasoningId(record.id);
	return {
		type: record.type,
		...reasoningId ? { id: reasoningId } : {}
	};
}
function encodeThinkingSignature(signature) {
	return JSON.stringify(signature);
}
function parseReasoningItem(value) {
	if (!value || typeof value !== "object") return null;
	const record = value;
	if (!isReplayableReasoningType(record.type)) return null;
	const reasoningId = toReplayableReasoningId(record.id);
	return {
		type: "reasoning",
		...reasoningId ? { id: reasoningId } : {},
		...typeof record.content === "string" ? { content: record.content } : {},
		...typeof record.encrypted_content === "string" ? { encrypted_content: record.encrypted_content } : {},
		...typeof record.summary === "string" ? { summary: record.summary } : {}
	};
}
function parseThinkingSignature(value) {
	if (typeof value !== "string" || value.trim().length === 0) return null;
	try {
		const signature = toReasoningSignature(JSON.parse(value));
		return signature ? parseReasoningItem(signature) : null;
	} catch {
		return null;
	}
}
function encodeToolCallReplayId(params) {
	return params.itemId ? `${params.callId}|${params.itemId}` : params.callId;
}
function decodeToolCallReplayId(value) {
	const raw = toNonEmptyString(value);
	if (!raw) return null;
	const [callId, itemId] = raw.split("|", 2);
	return {
		callId,
		...itemId ? { itemId } : {}
	};
}
function extractReasoningSummaryText(value) {
	if (typeof value === "string") return value.trim();
	if (!Array.isArray(value)) return "";
	return value.map((item) => {
		if (typeof item === "string") return item.trim();
		if (!item || typeof item !== "object") return "";
		return normalizeOptionalString(item.text) ?? "";
	}).filter(Boolean).join("\n").trim();
}
function extractResponseReasoningText(item) {
	if (!item || typeof item !== "object") return "";
	const record = item;
	const summaryText = extractReasoningSummaryText(record.summary);
	if (summaryText) return summaryText;
	return normalizeOptionalString(record.content) ?? "";
}
function convertTools(tools, options) {
	if (!tools || tools.length === 0) return [];
	const strict = resolveOpenAIStrictToolFlagForInventory(tools, options?.strict);
	return tools.map((tool) => {
		return {
			type: "function",
			name: tool.name,
			description: typeof tool.description === "string" ? tool.description : void 0,
			parameters: normalizeOpenAIStrictToolParameters(tool.parameters ?? {}, strict === true),
			...strict === void 0 ? {} : { strict }
		};
	});
}
function convertMessagesToInputItems(messages, modelOverride) {
	const items = [];
	for (const msg of messages) {
		const m = msg;
		if (m.role === "user") {
			const parts = contentToOpenAIParts(m.content, modelOverride);
			if (parts.length === 0) continue;
			items.push({
				type: "message",
				role: "user",
				content: parts.length === 1 && parts[0]?.type === "input_text" ? parts[0].text : parts
			});
			continue;
		}
		if (m.role === "assistant") {
			const content = m.content;
			const assistantMessagePhase = normalizeAssistantPhase(m.phase);
			if (Array.isArray(content)) {
				const textParts = [];
				let currentTextPhase;
				const hasExplicitBlockPhase = content.some((block) => {
					if (!block || typeof block !== "object") return false;
					const record = block;
					return record.type === "text" && Boolean(parseAssistantTextSignature(record.textSignature)?.phase);
				});
				const pushAssistantText = (phase) => {
					if (textParts.length === 0) return;
					items.push({
						type: "message",
						role: "assistant",
						content: textParts.join(""),
						...phase ? { phase } : {}
					});
					textParts.length = 0;
				};
				for (const block of content) {
					if (block.type === "text" && typeof block.text === "string") {
						const parsedSignature = parseAssistantTextSignature(block.textSignature);
						const blockPhase = parsedSignature?.phase ?? (parsedSignature?.id ? assistantMessagePhase : hasExplicitBlockPhase ? void 0 : assistantMessagePhase);
						if (textParts.length > 0 && blockPhase !== currentTextPhase) pushAssistantText(currentTextPhase);
						textParts.push(block.text);
						currentTextPhase = blockPhase;
						continue;
					}
					if (block.type === "thinking") {
						pushAssistantText(currentTextPhase);
						const reasoningItem = parseThinkingSignature(block.thinkingSignature);
						if (reasoningItem) items.push(reasoningItem);
						continue;
					}
					if (block.type !== "toolCall") continue;
					pushAssistantText(currentTextPhase);
					const replayId = decodeToolCallReplayId(block.id);
					const toolName = toNonEmptyString(block.name);
					if (!replayId || !toolName) continue;
					items.push({
						type: "function_call",
						...replayId.itemId ? { id: replayId.itemId } : {},
						call_id: replayId.callId,
						name: toolName,
						arguments: typeof block.arguments === "string" ? block.arguments : JSON.stringify(block.arguments ?? {})
					});
				}
				pushAssistantText(currentTextPhase);
				continue;
			}
			const text = contentToText(content);
			if (!text) continue;
			items.push({
				type: "message",
				role: "assistant",
				content: text,
				...assistantMessagePhase ? { phase: assistantMessagePhase } : {}
			});
			continue;
		}
		if (m.role !== "toolResult") continue;
		const toolCallId = toNonEmptyString(m.toolCallId) ?? toNonEmptyString(m.toolUseId);
		if (!toolCallId) continue;
		const replayId = decodeToolCallReplayId(toolCallId);
		if (!replayId) continue;
		const parts = Array.isArray(m.content) ? contentToOpenAIParts(m.content, modelOverride) : [];
		const textOutput = contentToText(m.content);
		const imageParts = parts.filter((part) => part.type === "input_image" || part.type === "image_url");
		items.push({
			type: "function_call_output",
			call_id: replayId.callId,
			output: textOutput || (imageParts.length > 0 ? "(see attached image)" : "")
		});
		if (imageParts.length > 0) items.push({
			type: "message",
			role: "user",
			content: [{
				type: "input_text",
				text: "Attached image(s) from tool result:"
			}, ...imageParts]
		});
	}
	return items;
}
function buildAssistantMessageFromResponse(response, modelInfo) {
	const content = [];
	const assistantMessageOutputs = (response.output ?? []).filter((item) => item.type === "message");
	const hasExplicitPhasedAssistantText = assistantMessageOutputs.some((item) => {
		const itemPhase = normalizeAssistantPhase(item.phase);
		return Boolean(itemPhase && item.content?.some((part) => part.type === "output_text" && Boolean(part.text)));
	});
	const hasFinalAnswerText = assistantMessageOutputs.some((item) => {
		if (normalizeAssistantPhase(item.phase) !== "final_answer") return false;
		return item.content?.some((part) => part.type === "output_text" && Boolean(part.text)) ?? false;
	});
	const includedAssistantPhases = /* @__PURE__ */ new Set();
	let hasIncludedUnphasedAssistantText = false;
	for (const item of response.output ?? []) if (item.type === "message") {
		const itemPhase = normalizeAssistantPhase(item.phase);
		for (const part of item.content ?? []) if (part.type === "output_text" && part.text) {
			if (!(hasFinalAnswerText ? itemPhase === "final_answer" : hasExplicitPhasedAssistantText ? itemPhase === void 0 : true)) continue;
			if (itemPhase) includedAssistantPhases.add(itemPhase);
			else hasIncludedUnphasedAssistantText = true;
			content.push({
				type: "text",
				text: part.text,
				textSignature: encodeAssistantTextSignature({
					id: item.id,
					...itemPhase ? { phase: itemPhase } : {}
				})
			});
		}
	} else if (item.type === "function_call") {
		const toolName = toNonEmptyString(item.name);
		if (!toolName) continue;
		const callId = toNonEmptyString(item.call_id);
		const itemId = toNonEmptyString(item.id);
		content.push({
			type: "toolCall",
			id: encodeToolCallReplayId({
				callId: callId ?? `call_${randomUUID()}`,
				itemId: itemId ?? void 0
			}),
			name: toolName,
			arguments: (() => {
				try {
					return JSON.parse(item.arguments);
				} catch {
					return item.arguments;
				}
			})()
		});
	} else {
		if (!isReplayableReasoningType(item.type)) continue;
		const reasoning = extractResponseReasoningText(item);
		if (!reasoning) continue;
		const reasoningId = toReplayableReasoningId(item.id);
		content.push({
			type: "thinking",
			thinking: reasoning,
			...reasoningId ? { thinkingSignature: encodeThinkingSignature({
				id: reasoningId,
				type: item.type
			}) } : {}
		});
	}
	const stopReason = content.some((part) => part.type === "toolCall") ? "toolUse" : "stop";
	const normalizedUsage = normalizeUsage(response.usage);
	const rawTotalTokens = normalizedUsage?.total;
	const resolvedTotalTokens = rawTotalTokens && rawTotalTokens > 0 ? rawTotalTokens : (normalizedUsage?.input ?? 0) + (normalizedUsage?.output ?? 0) + (normalizedUsage?.cacheRead ?? 0) + (normalizedUsage?.cacheWrite ?? 0);
	const message = buildAssistantMessage({
		model: modelInfo,
		content,
		stopReason,
		usage: buildUsageWithNoCost({
			input: normalizedUsage?.input ?? 0,
			output: normalizedUsage?.output ?? 0,
			cacheRead: normalizedUsage?.cacheRead ?? 0,
			cacheWrite: normalizedUsage?.cacheWrite ?? 0,
			totalTokens: resolvedTotalTokens > 0 ? resolvedTotalTokens : void 0
		})
	});
	const finalAssistantPhase = includedAssistantPhases.size === 1 && !hasIncludedUnphasedAssistantText ? [...includedAssistantPhases][0] : void 0;
	return finalAssistantPhase ? {
		...message,
		phase: finalAssistantPhase
	} : message;
}
function convertResponseToInputItems(response, modelInfo) {
	return convertMessagesToInputItems([buildAssistantMessageFromResponse(response, modelInfo)], modelInfo);
}
//#endregion
//#region src/agents/openai-ws-stream.ts
/**
* OpenAI WebSocket StreamFn Integration
*
* Wraps `OpenAIWebSocketManager` in a `StreamFn` that can be plugged into the
* pi-embedded-runner agent in place of the default `streamSimple` HTTP function.
*
* Key behaviours:
*  - Per-session `OpenAIWebSocketManager` (keyed by sessionId)
*  - Tracks `previous_response_id` to send only incremental tool-result inputs
*  - Falls back to `streamSimple` (HTTP) if the WebSocket connection fails
*  - Cleanup helpers for releasing sessions after the run completes
*
* Complexity budget & risk mitigation:
*  - **Transport aware**: respects `transport` (`auto` | `websocket` | `sse`)
*  - **Transparent fallback in `auto` mode**: connect/send failures fall back to
*    the existing HTTP `streamSimple`; forced `websocket` mode surfaces WS errors
*  - **Zero shared state**: per-session registry; session cleanup on dispose prevents leaks
*  - **Full parity**: all generation options (temperature, top_p, max_output_tokens,
*    tool_choice, reasoning) forwarded identically to the HTTP path
*
* @see src/agents/openai-ws-connection.ts for the connection manager
*/
function resolveOpenAIWebSocketStrictToolSetting(model) {
	return resolveOpenAIStrictToolSetting(model, {
		transport: "websocket",
		supportsStrictMode: model.compat && typeof model.compat === "object" ? model.compat.supportsStrictMode : void 0
	});
}
/** Module-level registry: sessionId → WsSession */
const wsRegistry = /* @__PURE__ */ new Map();
let openAIWsStreamDeps = {
	createManager: (options) => new OpenAIWebSocketManager(options),
	createHttpFallbackStreamFn: (model) => createBoundaryAwareStreamFnForModel(model),
	streamSimple: (...args) => piAi.streamSimple(...args)
};
var LocalAssistantMessageEventStream = class {
	constructor() {
		this.queue = [];
		this.waiting = [];
		this.done = false;
		this.finalResultPromise = new Promise((resolve) => {
			this.resolveFinalResult = resolve;
		});
	}
	push(event) {
		if (this.done) return;
		if (event.type === "done") {
			this.done = true;
			this.resolveFinalResult(event.message);
		} else if (event.type === "error") {
			this.done = true;
			this.resolveFinalResult(event.error);
		}
		const waiter = this.waiting.shift();
		if (waiter) {
			waiter({
				value: event,
				done: false
			});
			return;
		}
		this.queue.push(event);
	}
	end(result) {
		this.done = true;
		if (result) this.resolveFinalResult(result);
		while (this.waiting.length > 0) this.waiting.shift()?.({
			value: void 0,
			done: true
		});
	}
	async *[Symbol.asyncIterator]() {
		while (true) {
			if (this.queue.length > 0) {
				yield this.queue.shift();
				continue;
			}
			if (this.done) return;
			const result = await new Promise((resolve) => {
				this.waiting.push(resolve);
			});
			if (result.done) return;
			yield result.value;
		}
	}
	result() {
		return this.finalResultPromise;
	}
};
function createEventStream() {
	return typeof piAi.createAssistantMessageEventStream === "function" ? piAi.createAssistantMessageEventStream() : new LocalAssistantMessageEventStream();
}
function resolveWsSessionPoolConfig(env = process.env) {
	const enabled = env.OPENCLAW_OPENAI_WS_POOL === "1" || env.OPENCLAW_OPENAI_WS_SESSION_POOL === "1";
	const rawIdleMs = Number(env.OPENCLAW_OPENAI_WS_SESSION_POOL_IDLE_MS);
	return {
		enabled,
		idleMs: Number.isFinite(rawIdleMs) ? Math.min(3e5, Math.max(1e3, Math.trunc(rawIdleMs))) : 3e4
	};
}
function clearWsSessionIdleTimer(session) {
	if (!session.idleTimer) return;
	clearTimeout(session.idleTimer);
	session.idleTimer = void 0;
	session.pooledUntil = void 0;
}
function closeWsSession(sessionId, session) {
	clearWsSessionIdleTimer(session);
	try {
		session.manager.close();
	} catch {}
	wsRegistry.delete(sessionId);
}
/**
* Release and close the WebSocket session for the given sessionId.
* Call this after the agent run completes to free the connection.
*/
function releaseWsSession(sessionId, options = {}) {
	const session = wsRegistry.get(sessionId);
	if (!session) return;
	const pool = resolveWsSessionPoolConfig(options.env);
	if (options.allowPool === true && pool.enabled && !session.broken && session.manager.isConnected()) {
		clearWsSessionIdleTimer(session);
		session.pooledUntil = Date.now() + pool.idleMs;
		session.idleTimer = setTimeout(() => {
			if (wsRegistry.get(sessionId) === session) closeWsSession(sessionId, session);
		}, pool.idleMs);
		session.idleTimer.unref?.();
		log$3.debug(`[ws-stream] pooled websocket session=${sessionId} idleMs=${pool.idleMs}`);
		return;
	}
	closeWsSession(sessionId, session);
}
const WARM_UP_TIMEOUT_MS = 8e3;
const MAX_AUTO_WS_RUNTIME_RETRIES = 1;
const DEFAULT_WS_DEGRADE_COOLDOWN_MS = 6e4;
let wsDegradeCooldownMsOverride;
var OpenAIWebSocketRuntimeError = class extends Error {
	constructor(message, params) {
		super(message);
		this.name = "OpenAIWebSocketRuntimeError";
		this.kind = params.kind;
		this.retryable = params.retryable;
		this.closeCode = params.closeCode;
		this.closeReason = params.closeReason;
	}
};
function resolveWsTransport(options) {
	const transport = options?.transport;
	return transport === "sse" || transport === "websocket" || transport === "auto" ? transport : "auto";
}
function resolveWsWarmup(options) {
	return options?.openaiWsWarmup === true;
}
function resetWsSession(params) {
	clearWsSessionIdleTimer(params.session);
	try {
		params.session.manager.close();
	} catch {}
	params.session.manager = params.createManager();
	params.session.everConnected = false;
	params.session.warmUpAttempted = false;
	params.session.broken = false;
	params.session.lastContextLength = 0;
	params.session.lastRequestPayload = void 0;
	params.session.lastResponseInputItems = [];
	if (!params.preserveDegradeUntil) params.session.degradedUntil = null;
}
function markWsSessionDegraded(session) {
	session.degradedUntil = Date.now() + session.degradeCooldownMs;
}
function isWsSessionDegraded(session) {
	if (!session.degradedUntil) return false;
	if (session.degradedUntil <= Date.now()) {
		session.degradedUntil = null;
		return false;
	}
	return true;
}
function createWsManager(managerOptions, sessionHeaders) {
	return openAIWsStreamDeps.createManager({
		...managerOptions,
		...sessionHeaders ? { headers: {
			...managerOptions?.headers,
			...sessionHeaders
		} } : {}
	});
}
function stringifyStable(value) {
	if (value === null || typeof value !== "object") return JSON.stringify(value);
	if (Array.isArray(value)) return `[${value.map((entry) => stringifyStable(entry)).join(",")}]`;
	return `{${Object.entries(value).toSorted(([left], [right]) => left.localeCompare(right)).map(([key, entry]) => `${JSON.stringify(key)}:${stringifyStable(entry)}`).join(",")}}`;
}
function resolveWsManagerConfigSignature(managerOptions, sessionHeaders) {
	return stringifyStable({
		headers: sessionHeaders,
		request: managerOptions?.request,
		url: managerOptions?.url
	});
}
function resolveWsAuthSignature(apiKey) {
	return createHash("sha256").update(apiKey).digest("hex");
}
const AZURE_OPENAI_PROVIDER_IDS = new Set(["azure-openai", "azure-openai-responses"]);
const OPENAI_CODEX_PROVIDER_ID = "openai-codex";
function normalizeTransportIdentityValue(value, maxLength = 160) {
	const trimmed = value.trim().replace(/[\r\n]+/gu, " ");
	return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
}
function usesNativeOpenAIRoute(provider, baseUrl) {
	const endpointClass = resolveProviderEndpoint(baseUrl).endpointClass;
	const normalizedProvider = normalizeProviderId(provider);
	if (!normalizedProvider) return false;
	if (normalizedProvider === "openai") return endpointClass === "default" || endpointClass === "openai-public";
	if (AZURE_OPENAI_PROVIDER_IDS.has(normalizedProvider)) return endpointClass === "default" || endpointClass === "azure-openai";
	if (normalizedProvider === OPENAI_CODEX_PROVIDER_ID) return endpointClass === "default" || endpointClass === "openai-public" || endpointClass === "openai-codex";
	return false;
}
function resolveNativeOpenAISessionHeaders(params) {
	if (!params.sessionId || !usesNativeOpenAIRoute(params.provider, params.baseUrl)) return;
	const sessionId = normalizeTransportIdentityValue(params.sessionId);
	if (!sessionId) return;
	return {
		"x-client-request-id": sessionId,
		"x-openclaw-session-id": sessionId
	};
}
function resolveNativeOpenAITransportTurnState(params) {
	const sessionHeaders = resolveNativeOpenAISessionHeaders({
		provider: params.provider,
		baseUrl: params.baseUrl,
		sessionId: params.sessionId
	});
	if (!sessionHeaders) return;
	const turnId = normalizeTransportIdentityValue(params.turnId);
	const attempt = String(Math.max(1, params.attempt));
	return {
		headers: {
			...sessionHeaders,
			"x-openclaw-turn-id": turnId,
			"x-openclaw-turn-attempt": attempt
		},
		metadata: {
			openclaw_session_id: sessionHeaders["x-openclaw-session-id"] ?? "",
			openclaw_turn_id: turnId,
			openclaw_turn_attempt: attempt,
			openclaw_transport: params.transport
		}
	};
}
function resolveProviderTransportTurnState(model, params) {
	if (usesNativeOpenAIRoute(model.provider, model.baseUrl)) return resolveNativeOpenAITransportTurnState({
		provider: model.provider,
		baseUrl: model.baseUrl,
		sessionId: params.sessionId,
		turnId: params.turnId,
		attempt: params.attempt,
		transport: params.transport
	});
	return resolveProviderTransportTurnStateWithPlugin({
		provider: model.provider,
		context: {
			provider: model.provider,
			modelId: model.id,
			model,
			sessionId: params.sessionId,
			turnId: params.turnId,
			attempt: params.attempt,
			transport: params.transport
		}
	}) ?? void 0;
}
function resolveWebSocketSessionPolicy(model, sessionId) {
	if (usesNativeOpenAIRoute(model.provider, model.baseUrl)) return {
		headers: resolveNativeOpenAISessionHeaders({
			provider: model.provider,
			baseUrl: model.baseUrl,
			sessionId
		}),
		degradeCooldownMs: Math.max(0, wsDegradeCooldownMsOverride ?? DEFAULT_WS_DEGRADE_COOLDOWN_MS)
	};
	const policy = resolveProviderWebSocketSessionPolicyWithPlugin({
		provider: model.provider,
		context: {
			provider: model.provider,
			modelId: model.id,
			model,
			sessionId
		}
	});
	return {
		headers: policy?.headers,
		degradeCooldownMs: Math.max(0, wsDegradeCooldownMsOverride ?? policy?.degradeCooldownMs ?? DEFAULT_WS_DEGRADE_COOLDOWN_MS)
	};
}
function formatOpenAIWebSocketError(event) {
	const details = getOpenAIWebSocketErrorDetails(event);
	const code = details.code ?? "unknown";
	const message = details.message ?? "Unknown error";
	const extras = [
		typeof details.status === "number" ? `status=${details.status}` : null,
		details.type ? `type=${details.type}` : null,
		details.param ? `param=${details.param}` : null
	].filter(Boolean);
	return extras.length > 0 ? `${message} (code=${code}; ${extras.join(", ")})` : `${message} (code=${code})`;
}
function formatOpenAIWebSocketResponseFailure(response) {
	if (response.error) return `${response.error.code || "unknown"}: ${response.error.message || "no message"}`;
	if (response.incomplete_details?.reason) return `incomplete: ${response.incomplete_details.reason}`;
	return "Unknown error (no error details in response)";
}
function normalizeWsRunError(err) {
	if (err instanceof OpenAIWebSocketRuntimeError) return err;
	return new OpenAIWebSocketRuntimeError(formatErrorMessage(err), {
		kind: "server",
		retryable: false
	});
}
function buildRetryableSendError(err) {
	return new OpenAIWebSocketRuntimeError(err instanceof Error ? err.message : `WebSocket send failed: ${String(err)}`, {
		kind: "send",
		retryable: true
	});
}
async function runWarmUp(params) {
	if (params.signal?.aborted) throw new Error("aborted");
	await new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			cleanup();
			reject(/* @__PURE__ */ new Error(`warm-up timed out after ${WARM_UP_TIMEOUT_MS}ms`));
		}, WARM_UP_TIMEOUT_MS);
		const abortHandler = () => {
			cleanup();
			reject(/* @__PURE__ */ new Error("aborted"));
		};
		const closeHandler = (code, reason) => {
			cleanup();
			reject(/* @__PURE__ */ new Error(`warm-up closed (code=${code}, reason=${reason || "unknown"})`));
		};
		const unsubscribe = params.manager.onMessage((event) => {
			if (event.type === "response.completed") {
				cleanup();
				resolve();
			} else if (event.type === "response.failed") {
				cleanup();
				reject(/* @__PURE__ */ new Error(`warm-up failed: ${formatOpenAIWebSocketResponseFailure(event.response)}`));
			} else if (event.type === "error") {
				cleanup();
				reject(/* @__PURE__ */ new Error(`warm-up error: ${formatOpenAIWebSocketError(event)}`));
			}
		});
		const cleanup = () => {
			clearTimeout(timeout);
			params.signal?.removeEventListener("abort", abortHandler);
			params.manager.off("close", closeHandler);
			unsubscribe();
		};
		params.signal?.addEventListener("abort", abortHandler, { once: true });
		params.manager.on("close", closeHandler);
		params.manager.warmUp({
			model: params.modelId,
			tools: params.tools.length > 0 ? params.tools : void 0,
			instructions: params.instructions,
			...params.metadata ? { metadata: params.metadata } : {}
		});
	});
}
/**
* Creates a `StreamFn` backed by a persistent WebSocket connection to the
* OpenAI Responses API.  The first call for a given `sessionId` opens the
* connection; subsequent calls reuse it, sending only incremental tool-result
* inputs with `previous_response_id`.
*
* If the WebSocket connection is unavailable, the function falls back to the
* standard `streamSimple` HTTP path and logs a warning.
*
* @param apiKey     OpenAI API key
* @param sessionId  Agent session ID (used as the registry key)
* @param opts       Optional manager + abort signal overrides
*/
function createOpenAIWebSocketStreamFn(apiKey, sessionId, opts = {}) {
	return (model, context, options) => {
		const eventStream = createEventStream();
		const run = async () => {
			const transport = resolveWsTransport(options);
			if (transport === "sse") return fallbackToHttp(model, context, options, apiKey, eventStream, opts.signal);
			const signal = opts.signal ?? options?.signal;
			let emittedStart = false;
			let runtimeRetries = 0;
			const turnId = randomUUID();
			let turnAttempt = 0;
			const wsSessionPolicy = resolveWebSocketSessionPolicy(model, sessionId);
			const sessionHeaders = wsSessionPolicy.headers;
			while (true) {
				let session = wsRegistry.get(sessionId);
				const authSignature = resolveWsAuthSignature(apiKey);
				const managerConfigSignature = resolveWsManagerConfigSignature(opts.managerOptions, sessionHeaders);
				if (!session) {
					session = {
						manager: createWsManager(opts.managerOptions, sessionHeaders),
						managerConfigSignature,
						authSignature,
						lastContextLength: 0,
						lastResponseInputItems: [],
						everConnected: false,
						warmUpAttempted: false,
						broken: false,
						degradedUntil: null,
						degradeCooldownMs: wsSessionPolicy.degradeCooldownMs
					};
					wsRegistry.set(sessionId, session);
				} else if (session.managerConfigSignature !== managerConfigSignature || session.authSignature !== authSignature) {
					clearWsSessionIdleTimer(session);
					resetWsSession({
						session,
						createManager: () => createWsManager(opts.managerOptions, sessionHeaders)
					});
					session.managerConfigSignature = managerConfigSignature;
					session.authSignature = authSignature;
					session.degradeCooldownMs = wsSessionPolicy.degradeCooldownMs;
				} else clearWsSessionIdleTimer(session);
				if (transport !== "websocket" && isWsSessionDegraded(session)) {
					log$3.debug(`[ws-stream] session=${sessionId} in websocket cool-down; using HTTP fallback until ${new Date(session.degradedUntil).toISOString()}`);
					return fallbackToHttp(model, context, options, apiKey, eventStream, opts.signal, {
						suppressStart: emittedStart,
						turnState: resolveProviderTransportTurnState(model, {
							sessionId,
							turnId,
							attempt: Math.max(1, turnAttempt),
							transport: "stream"
						})
					});
				}
				if (!session.manager.isConnected() && !session.broken) try {
					await session.manager.connect(apiKey);
					session.everConnected = true;
					session.degradedUntil = null;
					log$3.debug(`[ws-stream] connected for session=${sessionId}`);
				} catch (connErr) {
					markWsSessionDegraded(session);
					resetWsSession({
						session,
						createManager: () => createWsManager(opts.managerOptions, sessionHeaders),
						preserveDegradeUntil: true
					});
					if (transport === "websocket") throw connErr instanceof Error ? connErr : new Error(String(connErr));
					log$3.warn(`[ws-stream] WebSocket connect failed for session=${sessionId}; falling back to HTTP. error=${String(connErr)}`);
					return fallbackToHttp(model, context, options, apiKey, eventStream, opts.signal, {
						suppressStart: emittedStart,
						turnState: resolveProviderTransportTurnState(model, {
							sessionId,
							turnId,
							attempt: Math.max(1, turnAttempt),
							transport: "stream"
						})
					});
				}
				if (session.broken || !session.manager.isConnected()) {
					if (transport === "websocket") throw new Error("WebSocket session disconnected");
					log$3.warn(`[ws-stream] session=${sessionId} broken/disconnected; falling back to HTTP`);
					markWsSessionDegraded(session);
					resetWsSession({
						session,
						createManager: () => createWsManager(opts.managerOptions, sessionHeaders),
						preserveDegradeUntil: true
					});
					return fallbackToHttp(model, context, options, apiKey, eventStream, opts.signal, {
						suppressStart: emittedStart,
						turnState: resolveProviderTransportTurnState(model, {
							sessionId,
							turnId,
							attempt: Math.max(1, turnAttempt),
							transport: "stream"
						})
					});
				}
				if (resolveWsWarmup(options) && !session.warmUpAttempted) {
					session.warmUpAttempted = true;
					let warmupFailed = false;
					try {
						await runWarmUp({
							manager: session.manager,
							modelId: model.id,
							tools: convertTools(context.tools, { strict: resolveOpenAIWebSocketStrictToolSetting(model) }),
							instructions: context.systemPrompt ? stripSystemPromptCacheBoundary(context.systemPrompt) : void 0,
							metadata: resolveProviderTransportTurnState(model, {
								sessionId,
								turnId,
								attempt: Math.max(1, turnAttempt),
								transport: "websocket"
							})?.metadata,
							signal
						});
						log$3.debug(`[ws-stream] warm-up completed for session=${sessionId}`);
					} catch (warmErr) {
						if (signal?.aborted) throw warmErr instanceof Error ? warmErr : new Error(String(warmErr));
						warmupFailed = true;
						log$3.warn(`[ws-stream] warm-up failed for session=${sessionId}; continuing without warm-up. error=${String(warmErr)}`);
					}
					if (warmupFailed && !session.manager.isConnected()) {
						try {
							session.manager.close();
						} catch {}
						try {
							session.manager = createWsManager(opts.managerOptions, sessionHeaders);
							await session.manager.connect(apiKey);
							session.everConnected = true;
							session.degradedUntil = null;
							log$3.debug(`[ws-stream] reconnected after warm-up failure for session=${sessionId}`);
						} catch (reconnectErr) {
							markWsSessionDegraded(session);
							resetWsSession({
								session,
								createManager: () => createWsManager(opts.managerOptions, sessionHeaders),
								preserveDegradeUntil: true
							});
							if (transport === "websocket") throw reconnectErr instanceof Error ? reconnectErr : new Error(String(reconnectErr));
							log$3.warn(`[ws-stream] reconnect after warm-up failed for session=${sessionId}; falling back to HTTP. error=${String(reconnectErr)}`);
							return fallbackToHttp(model, context, options, apiKey, eventStream, opts.signal, {
								suppressStart: emittedStart,
								turnState: resolveProviderTransportTurnState(model, {
									sessionId,
									turnId,
									attempt: Math.max(1, turnAttempt),
									transport: "stream"
								})
							});
						}
					}
				}
				turnAttempt++;
				const turnState = resolveProviderTransportTurnState(model, {
					sessionId,
					turnId,
					attempt: turnAttempt,
					transport: "websocket"
				});
				let fullPayload = buildOpenAIWebSocketResponseCreatePayload({
					model,
					context,
					options,
					turnInput: { inputItems: convertMessagesToInputItems(context.messages, model) },
					tools: convertTools(context.tools, { strict: resolveOpenAIWebSocketStrictToolSetting(model) }),
					metadata: turnState?.metadata
				});
				fullPayload = mergeTransportMetadata(await options?.onPayload?.(fullPayload, model) ?? fullPayload, turnState?.metadata);
				const plannedPayload = planOpenAIWebSocketRequestPayload({
					fullPayload,
					previousRequestPayload: session.lastRequestPayload,
					previousResponseId: session.manager.previousResponseId,
					previousResponseInputItems: session.lastResponseInputItems
				});
				const plannedInputItems = Array.isArray(plannedPayload.payload.input) ? plannedPayload.payload.input : [];
				if (plannedPayload.mode === "incremental") log$3.debug(`[ws-stream] session=${sessionId}: incremental send (${plannedInputItems.length} items) previous_response_id=${plannedPayload.payload.previous_response_id}`);
				else log$3.debug(`[ws-stream] session=${sessionId}: full context send (${plannedInputItems.length} items)`);
				const requestPayload = plannedPayload.payload;
				try {
					session.manager.send(requestPayload);
				} catch (sendErr) {
					const normalizedErr = buildRetryableSendError(sendErr);
					if (transport !== "websocket" && !signal?.aborted && runtimeRetries < MAX_AUTO_WS_RUNTIME_RETRIES) {
						runtimeRetries++;
						log$3.warn(`[ws-stream] retrying websocket turn after send failure for session=${sessionId} (${runtimeRetries}/${MAX_AUTO_WS_RUNTIME_RETRIES}). error=${normalizedErr.message}`);
						resetWsSession({
							session,
							createManager: () => createWsManager(opts.managerOptions, sessionHeaders)
						});
						continue;
					}
					if (transport !== "websocket") {
						log$3.warn(`[ws-stream] send failed for session=${sessionId}; falling back to HTTP. error=${normalizedErr.message}`);
						markWsSessionDegraded(session);
						resetWsSession({
							session,
							createManager: () => createWsManager(opts.managerOptions, sessionHeaders),
							preserveDegradeUntil: true
						});
						return fallbackToHttp(model, context, options, apiKey, eventStream, opts.signal, {
							suppressStart: emittedStart,
							turnState: resolveProviderTransportTurnState(model, {
								sessionId,
								turnId,
								attempt: turnAttempt,
								transport: "stream"
							})
						});
					}
					throw normalizedErr;
				}
				if (!emittedStart) {
					eventStream.push({
						type: "start",
						partial: buildAssistantMessageWithZeroUsage({
							model,
							content: [],
							stopReason: "stop"
						})
					});
					emittedStart = true;
				}
				const outputItemPhaseById = /* @__PURE__ */ new Map();
				const outputTextByPart = /* @__PURE__ */ new Map();
				const emittedTextByPart = /* @__PURE__ */ new Map();
				const getOutputTextKey = (itemId, contentIndex) => `${itemId}:${contentIndex}`;
				const emitTextDelta = (params) => {
					const resolvedItemId = params.itemId;
					const contentIndex = params.contentIndex ?? 0;
					const itemPhase = resolvedItemId ? normalizeAssistantPhase(outputItemPhaseById.get(resolvedItemId)) : void 0;
					const partialBase = buildAssistantMessageWithZeroUsage({
						model,
						content: [{
							type: "text",
							text: params.fullText,
							...resolvedItemId ? { textSignature: encodeAssistantTextSignature({
								id: resolvedItemId,
								...itemPhase ? { phase: itemPhase } : {}
							}) } : {}
						}],
						stopReason: "stop"
					});
					const partialMsg = itemPhase ? {
						...partialBase,
						phase: itemPhase
					} : partialBase;
					eventStream.push({
						type: "text_delta",
						contentIndex,
						delta: params.deltaText,
						partial: partialMsg
					});
				};
				const emitBufferedTextDelta = (params) => {
					const key = getOutputTextKey(params.itemId, params.contentIndex);
					const fullText = outputTextByPart.get(key) ?? "";
					const emittedText = emittedTextByPart.get(key) ?? "";
					if (!fullText || fullText === emittedText) return;
					const deltaText = fullText.startsWith(emittedText) ? fullText.slice(emittedText.length) : fullText;
					emittedTextByPart.set(key, fullText);
					emitTextDelta({
						fullText,
						deltaText,
						itemId: params.itemId,
						contentIndex: params.contentIndex
					});
				};
				const capturedContextLength = context.messages.length;
				let sawWsOutput = false;
				try {
					await new Promise((resolve, reject) => {
						const abortHandler = () => {
							outputItemPhaseById.clear();
							outputTextByPart.clear();
							emittedTextByPart.clear();
							cleanup();
							reject(/* @__PURE__ */ new Error("aborted"));
						};
						if (signal?.aborted) {
							reject(/* @__PURE__ */ new Error("aborted"));
							return;
						}
						signal?.addEventListener("abort", abortHandler, { once: true });
						const closeHandler = (code, reason) => {
							outputItemPhaseById.clear();
							outputTextByPart.clear();
							emittedTextByPart.clear();
							cleanup();
							const closeInfo = session.manager.lastCloseInfo;
							reject(new OpenAIWebSocketRuntimeError(`WebSocket closed mid-request (code=${code}, reason=${reason || "unknown"})`, {
								kind: "disconnect",
								retryable: closeInfo?.retryable ?? true,
								closeCode: closeInfo?.code ?? code,
								closeReason: closeInfo?.reason ?? reason
							}));
						};
						session.manager.on("close", closeHandler);
						const cleanup = () => {
							signal?.removeEventListener("abort", abortHandler);
							session.manager.off("close", closeHandler);
							unsubscribe();
						};
						const unsubscribe = session.manager.onMessage((event) => {
							if (event.type === "response.output_item.added" || event.type === "response.output_item.done" || event.type === "response.content_part.added" || event.type === "response.content_part.done" || event.type === "response.output_text.delta" || event.type === "response.output_text.done" || event.type === "response.function_call_arguments.delta" || event.type === "response.function_call_arguments.done") sawWsOutput = true;
							if (event.type === "response.output_item.added" || event.type === "response.output_item.done") {
								if (typeof event.item.id === "string") {
									const itemPhase = event.item.type === "message" ? normalizeAssistantPhase(event.item.phase) : void 0;
									outputItemPhaseById.set(event.item.id, itemPhase);
									if (itemPhase !== void 0) {
										for (const key of outputTextByPart.keys()) if (key.startsWith(`${event.item.id}:`)) {
											const [, contentIndexText] = key.split(":");
											emitBufferedTextDelta({
												itemId: event.item.id,
												contentIndex: Number.parseInt(contentIndexText ?? "0", 10) || 0
											});
										}
									}
								}
								return;
							}
							if (event.type === "response.output_text.delta") {
								const key = getOutputTextKey(event.item_id, event.content_index);
								const nextText = `${outputTextByPart.get(key) ?? ""}${event.delta}`;
								outputTextByPart.set(key, nextText);
								if (outputItemPhaseById.get(event.item_id) !== void 0) emitBufferedTextDelta({
									itemId: event.item_id,
									contentIndex: event.content_index
								});
								return;
							}
							if (event.type === "response.output_text.done") {
								const key = getOutputTextKey(event.item_id, event.content_index);
								if (event.text && event.text !== outputTextByPart.get(key)) outputTextByPart.set(key, event.text);
								if (outputItemPhaseById.get(event.item_id) !== void 0) emitBufferedTextDelta({
									itemId: event.item_id,
									contentIndex: event.content_index
								});
								return;
							}
							if (event.type === "response.completed") {
								outputItemPhaseById.clear();
								outputTextByPart.clear();
								emittedTextByPart.clear();
								cleanup();
								session.lastContextLength = capturedContextLength;
								session.lastRequestPayload = fullPayload;
								session.lastResponseInputItems = convertResponseToInputItems(event.response, {
									api: model.api,
									provider: model.provider,
									id: model.id,
									input: model.input
								});
								const assistantMsg = buildAssistantMessageFromResponse(event.response, {
									api: model.api,
									provider: model.provider,
									id: model.id
								});
								const reason = assistantMsg.stopReason === "toolUse" ? "toolUse" : "stop";
								eventStream.push({
									type: "done",
									reason,
									message: assistantMsg
								});
								resolve();
							} else if (event.type === "response.failed") {
								outputItemPhaseById.clear();
								outputTextByPart.clear();
								emittedTextByPart.clear();
								cleanup();
								reject(new OpenAIWebSocketRuntimeError(`OpenAI WebSocket response failed: ${formatOpenAIWebSocketResponseFailure(event.response)}`, {
									kind: "server",
									retryable: false
								}));
							} else if (event.type === "error") {
								outputItemPhaseById.clear();
								outputTextByPart.clear();
								emittedTextByPart.clear();
								cleanup();
								reject(new OpenAIWebSocketRuntimeError(`OpenAI WebSocket error: ${formatOpenAIWebSocketError(event)}`, {
									kind: "server",
									retryable: false
								}));
							}
						});
					});
					return;
				} catch (wsRunErr) {
					const normalizedErr = normalizeWsRunError(wsRunErr);
					if (transport !== "websocket" && !signal?.aborted && normalizedErr.retryable && !sawWsOutput && runtimeRetries < MAX_AUTO_WS_RUNTIME_RETRIES) {
						runtimeRetries++;
						log$3.warn(`[ws-stream] retrying websocket turn after retryable runtime failure for session=${sessionId} (${runtimeRetries}/${MAX_AUTO_WS_RUNTIME_RETRIES}). error=${normalizedErr.message}`);
						resetWsSession({
							session,
							createManager: () => createWsManager(opts.managerOptions, sessionHeaders)
						});
						continue;
					}
					if (transport !== "websocket" && !signal?.aborted && !sawWsOutput) {
						log$3.warn(`[ws-stream] session=${sessionId} runtime failure before output; falling back to HTTP. error=${normalizedErr.message}`);
						markWsSessionDegraded(session);
						resetWsSession({
							session,
							createManager: () => createWsManager(opts.managerOptions, sessionHeaders),
							preserveDegradeUntil: true
						});
						return fallbackToHttp(model, context, options, apiKey, eventStream, opts.signal, {
							suppressStart: true,
							turnState: resolveProviderTransportTurnState(model, {
								sessionId,
								turnId,
								attempt: turnAttempt,
								transport: "stream"
							})
						});
					}
					throw normalizedErr;
				}
			}
		};
		queueMicrotask(() => run().catch((err) => {
			const errorMessage = formatErrorMessage(err);
			log$3.warn(`[ws-stream] session=${sessionId} run error: ${errorMessage}`);
			eventStream.push({
				type: "error",
				reason: "error",
				error: buildStreamErrorAssistantMessage({
					model,
					errorMessage
				})
			});
			eventStream.end();
		}));
		return eventStream;
	};
}
/**
* Fall back to HTTP and pipe events into the existing stream.
* This is called when the WebSocket is broken or unavailable.
*/
async function fallbackToHttp(model, context, streamOptions, apiKey, eventStream, signal, fallbackOptions) {
	const baseOnPayload = streamOptions?.onPayload;
	const mergedOptions = {
		...streamOptions,
		apiKey,
		...fallbackOptions?.turnState?.headers ? { headers: {
			...streamOptions?.headers,
			...fallbackOptions.turnState.headers
		} } : {},
		...fallbackOptions?.turnState?.metadata ? { onPayload: async (payload, payloadModel) => {
			return mergeTransportMetadata(await baseOnPayload?.(payload, payloadModel) ?? payload, fallbackOptions.turnState?.metadata);
		} } : {},
		...signal ? { signal } : {}
	};
	const httpStream = await (openAIWsStreamDeps.createHttpFallbackStreamFn(model) ?? openAIWsStreamDeps.streamSimple)(model, context, mergedOptions);
	for await (const event of httpStream) {
		if (fallbackOptions?.suppressStart && event.type === "start") continue;
		eventStream.push(event);
	}
}
//#endregion
//#region src/agents/embedded-pi-lsp.ts
function loadEmbeddedPiLspConfig(params) {
	const bundleLsp = loadEnabledBundleLspConfig({
		workspaceDir: params.workspaceDir,
		cfg: params.cfg
	});
	return {
		lspServers: { ...bundleLsp.config.lspServers },
		diagnostics: bundleLsp.diagnostics
	};
}
//#endregion
//#region src/agents/pi-bundle-lsp-runtime.ts
function encodeLspMessage(body) {
	const json = JSON.stringify(body);
	return `Content-Length: ${Buffer.byteLength(json, "utf-8")}\r\n\r\n${json}`;
}
function parseLspMessages(buffer) {
	const messages = [];
	let remaining = buffer;
	while (true) {
		const headerEnd = remaining.indexOf("\r\n\r\n");
		if (headerEnd === -1) break;
		const match = remaining.slice(0, headerEnd).match(/Content-Length:\s*(\d+)/i);
		if (!match) {
			remaining = remaining.slice(headerEnd + 4);
			continue;
		}
		const contentLength = Number.parseInt(match[1], 10);
		const bodyStart = headerEnd + 4;
		const bodyEnd = bodyStart + contentLength;
		if (Buffer.byteLength(remaining.slice(bodyStart), "utf-8") < contentLength) break;
		try {
			const body = remaining.slice(bodyStart, bodyStart + contentLength);
			messages.push(JSON.parse(body));
		} catch {}
		remaining = remaining.slice(bodyEnd);
	}
	return {
		messages,
		remaining
	};
}
function sendRequest(session, method, params) {
	const id = ++session.requestId;
	return new Promise((resolve, reject) => {
		session.pendingRequests.set(id, {
			resolve,
			reject
		});
		const encoded = encodeLspMessage({
			jsonrpc: "2.0",
			id,
			method,
			params
		});
		session.process.stdin?.write(encoded, "utf-8");
		setTimeout(() => {
			if (session.pendingRequests.has(id)) {
				session.pendingRequests.delete(id);
				reject(/* @__PURE__ */ new Error(`LSP request ${method} timed out`));
			}
		}, 1e4);
	});
}
function handleIncomingData(session, chunk) {
	session.buffer += chunk;
	const { messages, remaining } = parseLspMessages(session.buffer);
	session.buffer = remaining;
	for (const msg of messages) {
		if (typeof msg !== "object" || msg === null) continue;
		const record = msg;
		if ("id" in record && typeof record.id === "number") {
			const pending = session.pendingRequests.get(record.id);
			if (pending) {
				session.pendingRequests.delete(record.id);
				if ("error" in record) pending.reject(new Error(JSON.stringify(record.error)));
				else pending.resolve(record.result);
			}
		}
		if ("method" in record && !("id" in record)) logDebug(`bundle-lsp:${session.serverName}: notification ${String(record.method)}`);
	}
}
async function initializeSession(session) {
	const result = await sendRequest(session, "initialize", {
		processId: process.pid,
		rootUri: null,
		capabilities: { textDocument: {
			hover: { contentFormat: ["plaintext", "markdown"] },
			completion: { completionItem: { snippetSupport: false } },
			definition: {},
			references: {}
		} }
	});
	session.process.stdin?.write(encodeLspMessage({
		jsonrpc: "2.0",
		method: "initialized",
		params: {}
	}), "utf-8");
	session.initialized = true;
	return result?.capabilities ?? {};
}
async function disposeSession(session) {
	if (session.initialized) try {
		await sendRequest(session, "shutdown").catch(() => {});
		session.process.stdin?.write(encodeLspMessage({
			jsonrpc: "2.0",
			method: "exit",
			params: null
		}), "utf-8");
	} catch {}
	for (const [, pending] of session.pendingRequests) pending.reject(/* @__PURE__ */ new Error("LSP session disposed"));
	session.pendingRequests.clear();
	session.process.kill();
}
function createLspPositionTool(params) {
	return {
		name: params.toolName,
		label: params.label,
		description: params.description,
		parameters: {
			type: "object",
			properties: {
				uri: {
					type: "string",
					description: "File URI (file:///path/to/file)"
				},
				line: {
					type: "number",
					description: "Zero-based line number"
				},
				character: {
					type: "number",
					description: "Zero-based character offset"
				}
			},
			required: [
				"uri",
				"line",
				"character"
			]
		},
		execute: async (_toolCallId, input) => {
			const position = input;
			const result = await sendRequest(params.session, params.method, {
				textDocument: { uri: position.uri },
				position: {
					line: position.line,
					character: position.character
				}
			});
			return formatLspResult(params.session.serverName, params.resultLabel, result);
		}
	};
}
function buildLspTools(session) {
	const tools = [];
	const caps = session.capabilities;
	const serverLabel = session.serverName;
	if (caps.hoverProvider) tools.push(createLspPositionTool({
		session,
		toolName: `lsp_hover_${serverLabel}`,
		label: `LSP Hover (${serverLabel})`,
		description: `Get hover information for a symbol at a position in a file via the ${serverLabel} language server.`,
		method: "textDocument/hover",
		resultLabel: "hover"
	}));
	if (caps.definitionProvider) tools.push(createLspPositionTool({
		session,
		toolName: `lsp_definition_${serverLabel}`,
		label: `LSP Go to Definition (${serverLabel})`,
		description: `Find the definition of a symbol at a position in a file via the ${serverLabel} language server.`,
		method: "textDocument/definition",
		resultLabel: "definition"
	}));
	if (caps.referencesProvider) tools.push({
		name: `lsp_references_${serverLabel}`,
		label: `LSP Find References (${serverLabel})`,
		description: `Find all references to a symbol at a position in a file via the ${serverLabel} language server.`,
		parameters: {
			type: "object",
			properties: {
				uri: {
					type: "string",
					description: "File URI (file:///path/to/file)"
				},
				line: {
					type: "number",
					description: "Zero-based line number"
				},
				character: {
					type: "number",
					description: "Zero-based character offset"
				},
				includeDeclaration: {
					type: "boolean",
					description: "Include the declaration in results"
				}
			},
			required: [
				"uri",
				"line",
				"character"
			]
		},
		execute: async (_toolCallId, input) => {
			const params = input;
			return formatLspResult(serverLabel, "references", await sendRequest(session, "textDocument/references", {
				textDocument: { uri: params.uri },
				position: {
					line: params.line,
					character: params.character
				},
				context: { includeDeclaration: params.includeDeclaration ?? true }
			}));
		}
	});
	return tools;
}
function formatLspResult(serverName, method, result) {
	return {
		content: [{
			type: "text",
			text: result !== null && result !== void 0 ? JSON.stringify(result, null, 2) : `No ${method} result from ${serverName}`
		}],
		details: {
			lspServer: serverName,
			lspMethod: method
		}
	};
}
async function createBundleLspToolRuntime(params) {
	const loaded = loadEmbeddedPiLspConfig({
		workspaceDir: params.workspaceDir,
		cfg: params.cfg
	});
	for (const diagnostic of loaded.diagnostics) logWarn(`bundle-lsp: ${diagnostic.pluginId}: ${diagnostic.message}`);
	if (Object.keys(loaded.lspServers).length === 0) return {
		tools: [],
		sessions: [],
		dispose: async () => {}
	};
	const reservedNames = new Set(Array.from(params.reservedToolNames ?? [], (name) => normalizeOptionalLowercaseString(name)).filter(Boolean));
	const sessions = [];
	const tools = [];
	try {
		for (const [serverName, rawServer] of Object.entries(loaded.lspServers)) {
			const launch = resolveStdioMcpServerLaunchConfig(rawServer);
			if (!launch.ok) {
				logWarn(`bundle-lsp: skipped server "${serverName}" because ${launch.reason}.`);
				continue;
			}
			const launchConfig = launch.config;
			try {
				const child = spawn(launchConfig.command, launchConfig.args ?? [], {
					stdio: [
						"pipe",
						"pipe",
						"pipe"
					],
					env: {
						...process.env,
						...launchConfig.env
					},
					cwd: launchConfig.cwd
				});
				const session = {
					serverName,
					process: child,
					requestId: 0,
					pendingRequests: /* @__PURE__ */ new Map(),
					buffer: "",
					initialized: false,
					capabilities: {}
				};
				child.stdout?.setEncoding("utf-8");
				child.stdout?.on("data", (chunk) => handleIncomingData(session, chunk));
				child.stderr?.setEncoding("utf-8");
				child.stderr?.on("data", (chunk) => {
					for (const line of chunk.split(/\r?\n/).filter(Boolean)) logDebug(`bundle-lsp:${serverName}: ${line.trim()}`);
				});
				session.capabilities = await initializeSession(session);
				sessions.push(session);
				const serverTools = buildLspTools(session);
				for (const tool of serverTools) {
					const normalizedName = normalizeOptionalLowercaseString(tool.name);
					if (!normalizedName) continue;
					if (reservedNames.has(normalizedName)) {
						logWarn(`bundle-lsp: skipped tool "${tool.name}" from server "${serverName}" because the name already exists.`);
						continue;
					}
					reservedNames.add(normalizedName);
					setPluginToolMeta(tool, {
						pluginId: "bundle-lsp",
						optional: false
					});
					tools.push(tool);
				}
				logDebug(`bundle-lsp: started "${serverName}" (${describeStdioMcpServerLaunchConfig(launchConfig)}) with ${serverTools.length} tools`);
			} catch (error) {
				logWarn(`bundle-lsp: failed to start server "${serverName}" (${describeStdioMcpServerLaunchConfig(launchConfig)}): ${String(error)}`);
			}
		}
		return {
			tools,
			sessions: sessions.map((s) => ({
				serverName: s.serverName,
				capabilities: s.capabilities
			})),
			dispose: async () => {
				await Promise.allSettled(sessions.map((session) => disposeSession(session)));
			}
		};
	} catch (error) {
		await Promise.allSettled(sessions.map((session) => disposeSession(session)));
		throw error;
	}
}
//#endregion
//#region src/agents/pi-embedded-runner/thinking.ts
function isAssistantMessageWithContent(message) {
	return !!message && typeof message === "object" && message.role === "assistant" && Array.isArray(message.content);
}
function isThinkingBlock(block) {
	return !!block && typeof block === "object" && (block.type === "thinking" || block.type === "redacted_thinking");
}
function isSignedThinkingBlock(block) {
	if (!isThinkingBlock(block)) return false;
	const record = block;
	return record.type === "redacted_thinking" || record.signature != null || record.thinkingSignature != null || record.thought_signature != null;
}
function hasMeaningfulText$1(block) {
	if (!block || typeof block !== "object" || block.type !== "text") return false;
	return typeof block.text === "string" ? block.text.trim().length > 0 : false;
}
/**
* Strip `type: "thinking"` and `type: "redacted_thinking"` content blocks from
* all assistant messages except the latest one.
*
* Thinking blocks in the latest assistant turn are preserved verbatim so
* providers that require replay signatures can continue the conversation.
*
* If a non-latest assistant message becomes empty after stripping, it is
* replaced with a synthetic `{ type: "text", text: "" }` block to preserve
* turn structure (some providers require strict user/assistant alternation).
*
* Returns the original array reference when nothing was changed (callers can
* use reference equality to skip downstream work).
*/
function dropThinkingBlocks(messages) {
	let latestAssistantIndex = -1;
	for (let i = messages.length - 1; i >= 0; i -= 1) if (isAssistantMessageWithContent(messages[i])) {
		latestAssistantIndex = i;
		break;
	}
	let touched = false;
	const out = [];
	for (let i = 0; i < messages.length; i += 1) {
		const msg = messages[i];
		if (!isAssistantMessageWithContent(msg)) {
			out.push(msg);
			continue;
		}
		if (i === latestAssistantIndex) {
			out.push(msg);
			continue;
		}
		const nextContent = [];
		let changed = false;
		for (const block of msg.content) {
			if (isThinkingBlock(block)) {
				touched = true;
				changed = true;
				continue;
			}
			nextContent.push(block);
		}
		if (!changed) {
			out.push(msg);
			continue;
		}
		const content = nextContent.length > 0 ? nextContent : [{
			type: "text",
			text: ""
		}];
		out.push({
			...msg,
			content
		});
	}
	return touched ? out : messages;
}
function assessLastAssistantMessage(message) {
	if (!isAssistantMessageWithContent(message)) return "valid";
	if (message.content.length === 0) return "incomplete-thinking";
	let hasSignedThinking = false;
	let hasUnsignedThinking = false;
	let hasNonThinkingContent = false;
	let hasEmptyTextBlock = false;
	for (const block of message.content) {
		if (!block || typeof block !== "object") return "incomplete-thinking";
		if (isThinkingBlock(block)) {
			if (isSignedThinkingBlock(block)) hasSignedThinking = true;
			else hasUnsignedThinking = true;
			continue;
		}
		hasNonThinkingContent = true;
		if (block.type === "text" && !hasMeaningfulText$1(block)) hasEmptyTextBlock = true;
	}
	if (hasUnsignedThinking) return "incomplete-thinking";
	if (hasSignedThinking && !hasNonThinkingContent) return "incomplete-text";
	if (hasSignedThinking && hasEmptyTextBlock) return "incomplete-text";
	return "valid";
}
//#endregion
//#region src/agents/pi-project-settings-snapshot.ts
const log$2 = createSubsystemLogger("embedded-pi-settings");
const DEFAULT_EMBEDDED_PI_PROJECT_SETTINGS_POLICY = "sanitize";
const SANITIZED_PROJECT_PI_KEYS = ["shellPath", "shellCommandPrefix"];
function sanitizePiSettingsSnapshot(settings) {
	const sanitized = { ...settings };
	for (const key of SANITIZED_PROJECT_PI_KEYS) delete sanitized[key];
	return sanitized;
}
function sanitizeProjectSettings(settings) {
	return sanitizePiSettingsSnapshot(settings);
}
function loadBundleSettingsFile(params) {
	const absolutePath = path.join(params.rootDir, params.relativePath);
	const opened = openBoundaryFileSync({
		absolutePath,
		rootPath: params.rootDir,
		boundaryLabel: "plugin root",
		rejectHardlinks: true
	});
	if (!opened.ok) {
		log$2.warn(`skipping unsafe bundle settings file: ${absolutePath}`);
		return null;
	}
	try {
		const raw = JSON.parse(fs.readFileSync(opened.fd, "utf-8"));
		if (!isRecord(raw)) {
			log$2.warn(`skipping bundle settings file with non-object JSON: ${absolutePath}`);
			return null;
		}
		return sanitizePiSettingsSnapshot(raw);
	} catch (error) {
		log$2.warn(`failed to parse bundle settings file ${absolutePath}: ${String(error)}`);
		return null;
	} finally {
		fs.closeSync(opened.fd);
	}
}
function loadEnabledBundlePiSettingsSnapshot(params) {
	const workspaceDir = params.cwd.trim();
	if (!workspaceDir) return {};
	const registry = loadPluginManifestRegistry({
		workspaceDir,
		config: params.cfg
	});
	if (registry.plugins.length === 0) return {};
	const normalizedPlugins = normalizePluginsConfig(params.cfg?.plugins);
	let snapshot = {};
	for (const record of registry.plugins) {
		const settingsFiles = record.settingsFiles ?? [];
		if (record.format !== "bundle" || settingsFiles.length === 0) continue;
		if (!resolveEffectivePluginActivationState({
			id: record.id,
			origin: record.origin,
			config: normalizedPlugins,
			rootConfig: params.cfg
		}).activated) continue;
		for (const relativePath of settingsFiles) {
			const bundleSettings = loadBundleSettingsFile({
				rootDir: record.rootDir,
				relativePath
			});
			if (!bundleSettings) continue;
			snapshot = applyMergePatch(snapshot, bundleSettings);
		}
	}
	const embeddedPiMcp = loadEmbeddedPiMcpConfig({
		workspaceDir,
		cfg: params.cfg
	});
	for (const diagnostic of embeddedPiMcp.diagnostics) log$2.warn(`bundle MCP skipped for ${diagnostic.pluginId}: ${diagnostic.message}`);
	if (Object.keys(embeddedPiMcp.mcpServers).length > 0) snapshot = applyMergePatch(snapshot, { mcpServers: embeddedPiMcp.mcpServers });
	return snapshot;
}
function resolveEmbeddedPiProjectSettingsPolicy(cfg) {
	const raw = cfg?.agents?.defaults?.embeddedPi?.projectSettingsPolicy;
	if (raw === "trusted" || raw === "sanitize" || raw === "ignore") return raw;
	return DEFAULT_EMBEDDED_PI_PROJECT_SETTINGS_POLICY;
}
function buildEmbeddedPiSettingsSnapshot(params) {
	const effectiveProjectSettings = params.policy === "ignore" ? {} : params.policy === "sanitize" ? sanitizeProjectSettings(params.projectSettings) : params.projectSettings;
	return applyMergePatch(applyMergePatch(params.globalSettings, sanitizePiSettingsSnapshot(params.pluginSettings ?? {})), effectiveProjectSettings);
}
//#endregion
//#region src/agents/pi-project-settings.ts
function createEmbeddedPiSettingsManager(params) {
	const fileSettingsManager = SettingsManager.create(params.cwd, params.agentDir);
	const policy = resolveEmbeddedPiProjectSettingsPolicy(params.cfg);
	const pluginSettings = loadEnabledBundlePiSettingsSnapshot({
		cwd: params.cwd,
		cfg: params.cfg
	});
	const hasPluginSettings = Object.keys(pluginSettings).length > 0;
	if (policy === "trusted" && !hasPluginSettings) return fileSettingsManager;
	const settings = buildEmbeddedPiSettingsSnapshot({
		globalSettings: fileSettingsManager.getGlobalSettings(),
		pluginSettings,
		projectSettings: fileSettingsManager.getProjectSettings(),
		policy
	});
	return SettingsManager.inMemory(settings);
}
function createPreparedEmbeddedPiSettingsManager(params) {
	const settingsManager = createEmbeddedPiSettingsManager(params);
	applyPiCompactionSettingsFromConfig({
		settingsManager,
		cfg: params.cfg,
		contextTokenBudget: params.contextTokenBudget
	});
	return settingsManager;
}
//#endregion
//#region src/agents/session-file-repair.ts
function isSessionHeader(entry) {
	if (!entry || typeof entry !== "object") return false;
	const record = entry;
	return record.type === "session" && typeof record.id === "string" && record.id.length > 0;
}
async function repairSessionFileIfNeeded(params) {
	const sessionFile = params.sessionFile.trim();
	if (!sessionFile) return {
		repaired: false,
		droppedLines: 0,
		reason: "missing session file"
	};
	let content;
	try {
		content = await fs$1.readFile(sessionFile, "utf-8");
	} catch (err) {
		if (err?.code === "ENOENT") return {
			repaired: false,
			droppedLines: 0,
			reason: "missing session file"
		};
		const reason = `failed to read session file: ${err instanceof Error ? err.message : "unknown error"}`;
		params.warn?.(`session file repair skipped: ${reason} (${path.basename(sessionFile)})`);
		return {
			repaired: false,
			droppedLines: 0,
			reason
		};
	}
	const lines = content.split(/\r?\n/);
	const entries = [];
	let droppedLines = 0;
	for (const line of lines) {
		if (!line.trim()) continue;
		try {
			const entry = JSON.parse(line);
			entries.push(entry);
		} catch {
			droppedLines += 1;
		}
	}
	if (entries.length === 0) return {
		repaired: false,
		droppedLines,
		reason: "empty session file"
	};
	if (!isSessionHeader(entries[0])) {
		params.warn?.(`session file repair skipped: invalid session header (${path.basename(sessionFile)})`);
		return {
			repaired: false,
			droppedLines,
			reason: "invalid session header"
		};
	}
	if (droppedLines === 0) return {
		repaired: false,
		droppedLines: 0
	};
	const cleaned = `${entries.map((entry) => JSON.stringify(entry)).join("\n")}\n`;
	const backupPath = `${sessionFile}.bak-${process.pid}-${Date.now()}`;
	const tmpPath = `${sessionFile}.repair-${process.pid}-${Date.now()}.tmp`;
	try {
		const stat = await fs$1.stat(sessionFile).catch(() => null);
		await fs$1.writeFile(backupPath, content, "utf-8");
		if (stat) await fs$1.chmod(backupPath, stat.mode);
		await fs$1.writeFile(tmpPath, cleaned, "utf-8");
		if (stat) await fs$1.chmod(tmpPath, stat.mode);
		await fs$1.rename(tmpPath, sessionFile);
	} catch (err) {
		try {
			await fs$1.unlink(tmpPath);
		} catch (cleanupErr) {
			params.warn?.(`session file repair cleanup failed: ${cleanupErr instanceof Error ? cleanupErr.message : "unknown error"} (${path.basename(tmpPath)})`);
		}
		return {
			repaired: false,
			droppedLines,
			reason: `repair failed: ${err instanceof Error ? err.message : "unknown error"}`
		};
	}
	params.warn?.(`session file repaired: dropped ${droppedLines} malformed line(s) (${path.basename(sessionFile)})`);
	return {
		repaired: true,
		droppedLines,
		backupPath
	};
}
const IMAGE_CHAR_ESTIMATE$1 = 8e3;
function isTextBlock(block) {
	return !!block && typeof block === "object" && block.type === "text" && typeof block.text === "string";
}
function isImageBlock$1(block) {
	return !!block && typeof block === "object" && block.type === "image";
}
function estimateUnknownChars(value) {
	if (typeof value === "string") return value.length;
	if (value === void 0) return 0;
	try {
		const serialized = JSON.stringify(value);
		return typeof serialized === "string" ? serialized.length : 0;
	} catch {
		return 256;
	}
}
function isToolResultMessage(msg) {
	const role = msg.role;
	const type = msg.type;
	return role === "toolResult" || role === "tool" || type === "toolResult";
}
function getToolResultContent(msg) {
	if (!isToolResultMessage(msg)) return [];
	const content = msg.content;
	if (typeof content === "string") return [{
		type: "text",
		text: content
	}];
	return Array.isArray(content) ? content : [];
}
function estimateContentBlockChars(content) {
	let chars = 0;
	for (const block of content) if (isTextBlock(block)) chars += block.text.length;
	else if (isImageBlock$1(block)) chars += IMAGE_CHAR_ESTIMATE$1;
	else chars += estimateUnknownChars(block);
	return chars;
}
function getToolResultText(msg) {
	const content = getToolResultContent(msg);
	const chunks = [];
	for (const block of content) if (isTextBlock(block)) chunks.push(block.text);
	return chunks.join("\n");
}
function estimateMessageChars$1(msg) {
	if (!msg || typeof msg !== "object") return 0;
	if (msg.role === "user") {
		const content = msg.content;
		if (typeof content === "string") return content.length;
		if (Array.isArray(content)) return estimateContentBlockChars(content);
		return 0;
	}
	if (msg.role === "assistant") {
		let chars = 0;
		const content = msg.content;
		if (Array.isArray(content)) for (const block of content) {
			if (!block || typeof block !== "object") continue;
			const typed = block;
			if (typed.type === "text" && typeof typed.text === "string") chars += typed.text.length;
			else if (typed.type === "thinking" && typeof typed.thinking === "string") chars += typed.thinking.length;
			else if (typed.type === "toolCall") try {
				chars += JSON.stringify(typed.arguments ?? {}).length;
			} catch {
				chars += 128;
			}
			else chars += estimateUnknownChars(block);
		}
		return chars;
	}
	if (isToolResultMessage(msg)) {
		let chars = estimateContentBlockChars(getToolResultContent(msg));
		const details = msg.details;
		chars += estimateUnknownChars(details);
		const weightedChars = Math.ceil(chars * (4 / 2));
		return Math.max(chars, weightedChars);
	}
	return 256;
}
function createMessageCharEstimateCache() {
	return /* @__PURE__ */ new WeakMap();
}
function estimateMessageCharsCached(msg, cache) {
	const hit = cache.get(msg);
	if (hit !== void 0) return hit;
	const estimated = estimateMessageChars$1(msg);
	cache.set(msg, estimated);
	return estimated;
}
function estimateContextChars$1(messages, cache) {
	return messages.reduce((sum, msg) => sum + estimateMessageCharsCached(msg, cache), 0);
}
function invalidateMessageCharsCacheEntry(cache, msg) {
	cache.delete(msg);
}
//#endregion
//#region src/agents/pi-embedded-runner/tool-result-context-guard.ts
const SINGLE_TOOL_RESULT_CONTEXT_SHARE = .5;
const PREEMPTIVE_OVERFLOW_RATIO = .9;
const CONTEXT_LIMIT_TRUNCATION_NOTICE = "more characters truncated";
const PREEMPTIVE_CONTEXT_OVERFLOW_MESSAGE = "Context overflow: estimated context size exceeds safe threshold during tool loop.";
const TOOL_RESULT_ESTIMATE_TO_TEXT_RATIO = 4 / 2;
function formatContextLimitTruncationNotice(truncatedChars) {
	return `[... ${Math.max(1, Math.floor(truncatedChars))} ${CONTEXT_LIMIT_TRUNCATION_NOTICE}]`;
}
function truncateTextToBudget(text, maxChars) {
	if (text.length <= maxChars) return text;
	if (maxChars <= 0) return formatContextLimitTruncationNotice(text.length);
	let bodyBudget = maxChars;
	for (let i = 0; i < 4; i += 1) {
		const estimatedSuffix = formatContextLimitTruncationNotice(Math.max(1, text.length - bodyBudget));
		bodyBudget = Math.max(0, maxChars - estimatedSuffix.length);
	}
	let cutPoint = bodyBudget;
	const newline = text.lastIndexOf("\n", cutPoint);
	if (newline > bodyBudget * .7) cutPoint = newline;
	const omittedChars = text.length - cutPoint;
	return text.slice(0, cutPoint) + formatContextLimitTruncationNotice(omittedChars);
}
function replaceToolResultText(msg, text) {
	const content = msg.content;
	const replacementContent = typeof content === "string" || content === void 0 ? text : [{
		type: "text",
		text
	}];
	const { details: _details, ...rest } = msg;
	return {
		...rest,
		content: replacementContent
	};
}
function estimateBudgetToTextBudget(maxChars) {
	return Math.max(0, Math.floor(maxChars / TOOL_RESULT_ESTIMATE_TO_TEXT_RATIO));
}
function truncateToolResultToChars(msg, maxChars, cache) {
	if (!isToolResultMessage(msg)) return msg;
	const estimatedChars = estimateMessageCharsCached(msg, cache);
	if (estimatedChars <= maxChars) return msg;
	const rawText = getToolResultText(msg);
	if (!rawText) return replaceToolResultText(msg, formatContextLimitTruncationNotice(Math.max(1, estimateBudgetToTextBudget(Math.max(estimatedChars - maxChars, 1)))));
	const textBudget = estimateBudgetToTextBudget(maxChars);
	if (textBudget <= 0) return replaceToolResultText(msg, formatContextLimitTruncationNotice(rawText.length));
	if (rawText.length <= textBudget) return replaceToolResultText(msg, rawText);
	return replaceToolResultText(msg, truncateTextToBudget(rawText, textBudget));
}
function cloneMessagesForGuard(messages) {
	return messages.map((msg) => ({ ...msg }));
}
function toolResultsNeedTruncation(params) {
	const { messages, maxSingleToolResultChars } = params;
	const estimateCache = createMessageCharEstimateCache();
	for (const message of messages) {
		if (!isToolResultMessage(message)) continue;
		if (estimateMessageCharsCached(message, estimateCache) > maxSingleToolResultChars) return true;
	}
	return false;
}
function exceedsPreemptiveOverflowThreshold(params) {
	const estimateCache = createMessageCharEstimateCache();
	return estimateContextChars$1(params.messages, estimateCache) > params.maxContextChars;
}
function applyMessageMutationInPlace(target, source, cache) {
	if (target === source) return;
	const targetRecord = target;
	const sourceRecord = source;
	for (const key of Object.keys(targetRecord)) if (!(key in sourceRecord)) delete targetRecord[key];
	Object.assign(targetRecord, sourceRecord);
	if (cache) invalidateMessageCharsCacheEntry(cache, target);
}
function enforceToolResultLimitInPlace(params) {
	const { messages, maxSingleToolResultChars } = params;
	const estimateCache = createMessageCharEstimateCache();
	for (const message of messages) {
		if (!isToolResultMessage(message)) continue;
		applyMessageMutationInPlace(message, truncateToolResultToChars(message, maxSingleToolResultChars, estimateCache), estimateCache);
	}
}
/**
* Per-iteration `afterTurn` + `assemble` wrapper for sessions where
* the context engine owns compaction. Lets the engine compact inside
* a long tool loop instead of only at end of attempt.
*/
function installContextEngineLoopHook(params) {
	const { contextEngine, sessionId, sessionKey, sessionFile, tokenBudget, modelId } = params;
	const mutableAgent = params.agent;
	const originalTransformContext = mutableAgent.transformContext;
	let lastSeenLength = null;
	let lastAssembledView = null;
	mutableAgent.transformContext = (async (messages, signal) => {
		const transformed = originalTransformContext ? await originalTransformContext.call(mutableAgent, messages, signal) : messages;
		const sourceMessages = Array.isArray(transformed) ? transformed : messages;
		const prePromptMessageCount = Math.max(0, Math.min(sourceMessages.length, lastSeenLength ?? params.getPrePromptMessageCount?.() ?? sourceMessages.length));
		lastSeenLength = prePromptMessageCount;
		if (!(sourceMessages.length > prePromptMessageCount)) return lastAssembledView ?? sourceMessages;
		try {
			if (typeof contextEngine.afterTurn === "function") await contextEngine.afterTurn({
				sessionId,
				sessionKey,
				sessionFile,
				messages: sourceMessages,
				prePromptMessageCount,
				tokenBudget,
				runtimeContext: params.getRuntimeContext?.({
					messages: sourceMessages,
					prePromptMessageCount
				})
			});
			else {
				const newMessages = sourceMessages.slice(prePromptMessageCount);
				if (newMessages.length > 0) if (typeof contextEngine.ingestBatch === "function") await contextEngine.ingestBatch({
					sessionId,
					sessionKey,
					messages: newMessages
				});
				else for (const message of newMessages) await contextEngine.ingest({
					sessionId,
					sessionKey,
					message
				});
			}
			lastSeenLength = sourceMessages.length;
			const assembled = await contextEngine.assemble({
				sessionId,
				sessionKey,
				messages: sourceMessages,
				tokenBudget,
				model: modelId
			});
			if (assembled && Array.isArray(assembled.messages) && assembled.messages !== sourceMessages) {
				lastAssembledView = assembled.messages;
				return assembled.messages;
			}
			lastAssembledView = null;
		} catch {}
		return sourceMessages;
	});
	return () => {
		mutableAgent.transformContext = originalTransformContext;
	};
}
function installToolResultContextGuard(params) {
	const contextWindowTokens = Math.max(1, Math.floor(params.contextWindowTokens));
	const maxContextChars = Math.max(1024, Math.floor(contextWindowTokens * 4 * PREEMPTIVE_OVERFLOW_RATIO));
	const maxSingleToolResultChars = Math.max(1024, Math.floor(contextWindowTokens * 2 * SINGLE_TOOL_RESULT_CONTEXT_SHARE));
	const mutableAgent = params.agent;
	const originalTransformContext = mutableAgent.transformContext;
	mutableAgent.transformContext = (async (messages, signal) => {
		const transformed = originalTransformContext ? await originalTransformContext.call(mutableAgent, messages, signal) : messages;
		const sourceMessages = Array.isArray(transformed) ? transformed : messages;
		const contextMessages = toolResultsNeedTruncation({
			messages: sourceMessages,
			maxSingleToolResultChars
		}) ? cloneMessagesForGuard(sourceMessages) : sourceMessages;
		if (contextMessages !== sourceMessages) enforceToolResultLimitInPlace({
			messages: contextMessages,
			maxSingleToolResultChars
		});
		if (exceedsPreemptiveOverflowThreshold({
			messages: contextMessages,
			maxContextChars
		})) throw new Error(PREEMPTIVE_CONTEXT_OVERFLOW_MESSAGE);
		return contextMessages;
	});
	return () => {
		mutableAgent.transformContext = originalTransformContext;
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/tool-result-truncation.ts
/**
* Maximum share of the context window a single tool result should occupy.
* This is intentionally conservative – a single tool result should not
* consume more than 30% of the context window even without other messages.
*/
const MAX_TOOL_RESULT_CONTEXT_SHARE = .3;
/**
* Default hard cap for a single live tool result text block.
*
* Pi already truncates tool results aggressively when serializing old history
* for compaction summaries. For the live request path we still keep a bounded
* request-local ceiling so oversized tool output cannot dominate the next turn.
*/
const DEFAULT_MAX_LIVE_TOOL_RESULT_CHARS = 16e3;
/**
* Minimum characters to keep when truncating.
* We always keep at least the first portion so the model understands
* what was in the content.
*/
const MIN_KEEP_CHARS = 2e3;
const RECOVERY_MIN_KEEP_CHARS = 0;
const DEFAULT_SUFFIX = (truncatedChars) => formatContextLimitTruncationNotice(truncatedChars);
MIN_KEEP_CHARS + DEFAULT_SUFFIX(1).length;
function resolveSuffixFactory(suffix) {
	if (typeof suffix === "function") return suffix;
	if (typeof suffix === "string") return () => suffix;
	return DEFAULT_SUFFIX;
}
function resolveEffectiveMinKeepChars(params) {
	const suffixFloor = params.suffixFactory(1).length;
	return Math.max(0, Math.min(params.minKeepChars, Math.max(0, params.maxChars - suffixFloor)));
}
function appendBoundedTruncationSuffix(params) {
	const build = (keptText) => keptText + params.suffixFactory(Math.max(1, params.originalTextLength - keptText.length));
	let keptText = params.keptText;
	while (true) {
		const finalText = build(keptText);
		if (finalText.length <= params.maxChars) return finalText;
		if (keptText.length === 0) return finalText.slice(0, params.maxChars);
		const overflow = finalText.length - params.maxChars;
		const nextKeptText = keptText.slice(0, Math.max(0, keptText.length - overflow));
		keptText = nextKeptText.length < keptText.length ? nextKeptText : keptText.slice(0, -1);
	}
}
/**
* Marker inserted between head and tail when using head+tail truncation.
*/
const MIDDLE_OMISSION_MARKER = "\n\n⚠️ [... middle content omitted — showing head and tail ...]\n\n";
/**
* Detect whether text likely contains error/diagnostic content near the end,
* which should be preserved during truncation.
*/
function hasImportantTail(text) {
	const tail = normalizeLowercaseStringOrEmpty(text.slice(-2e3));
	return /\b(error|exception|failed|fatal|traceback|panic|stack trace|errno|exit code)\b/.test(tail) || /\}\s*$/.test(tail.trim()) || /\b(total|summary|result|complete|finished|done)\b/.test(tail);
}
/**
* Truncate a single text string to fit within maxChars.
*
* Uses a head+tail strategy when the tail contains important content
* (errors, results, JSON structure), otherwise preserves the beginning.
* This ensures error messages and summaries at the end of tool output
* aren't lost during truncation.
*/
function truncateToolResultText(text, maxChars, options = {}) {
	const suffixFactory = resolveSuffixFactory(options.suffix);
	const minKeepChars = resolveEffectiveMinKeepChars({
		maxChars,
		minKeepChars: options.minKeepChars ?? MIN_KEEP_CHARS,
		suffixFactory
	});
	if (text.length <= maxChars) return text;
	const defaultSuffix = suffixFactory(Math.max(1, text.length - maxChars));
	const budget = Math.max(minKeepChars, maxChars - defaultSuffix.length);
	if (hasImportantTail(text) && budget > minKeepChars * 2) {
		const tailBudget = Math.min(Math.floor(budget * .3), 4e3);
		const headBudget = budget - tailBudget - 63;
		if (headBudget > minKeepChars) {
			let headCut = headBudget;
			const headNewline = text.lastIndexOf("\n", headBudget);
			if (headNewline > headBudget * .8) headCut = headNewline;
			let tailStart = text.length - tailBudget;
			const tailNewline = text.indexOf("\n", tailStart);
			if (tailNewline !== -1 && tailNewline < tailStart + tailBudget * .2) tailStart = tailNewline + 1;
			return appendBoundedTruncationSuffix({
				keptText: text.slice(0, headCut) + MIDDLE_OMISSION_MARKER + text.slice(tailStart),
				originalTextLength: text.length,
				maxChars,
				suffixFactory
			});
		}
	}
	let cutPoint = budget;
	const lastNewline = text.lastIndexOf("\n", budget);
	if (lastNewline > budget * .8) cutPoint = lastNewline;
	return appendBoundedTruncationSuffix({
		keptText: text.slice(0, cutPoint),
		originalTextLength: text.length,
		maxChars,
		suffixFactory
	});
}
/**
* Calculate the maximum allowed characters for a single tool result
* based on the model's context window tokens.
*
* Uses a rough 4 chars ≈ 1 token heuristic (conservative for English text;
* actual ratio varies by tokenizer).
*/
function calculateMaxToolResultChars(contextWindowTokens) {
	return calculateMaxToolResultCharsWithCap(contextWindowTokens, DEFAULT_MAX_LIVE_TOOL_RESULT_CHARS);
}
function calculateMaxToolResultCharsWithCap(contextWindowTokens, hardCapChars) {
	const maxChars = Math.floor(contextWindowTokens * MAX_TOOL_RESULT_CONTEXT_SHARE) * 4;
	return Math.min(maxChars, Math.max(1, hardCapChars));
}
function resolveLiveToolResultMaxChars(params) {
	const configuredCap = resolveAgentContextLimits(params.cfg, params.agentId)?.toolResultMaxChars ?? 16e3;
	return calculateMaxToolResultCharsWithCap(params.contextWindowTokens, configuredCap);
}
/**
* Get the total character count of text content blocks in a tool result message.
*/
function getToolResultTextLength(msg) {
	if (!msg || msg.role !== "toolResult") return 0;
	const content = msg.content;
	if (!Array.isArray(content)) return 0;
	let totalLength = 0;
	for (const block of content) if (block && typeof block === "object" && block.type === "text") {
		const text = block.text;
		if (typeof text === "string") totalLength += text.length;
	}
	return totalLength;
}
/**
* Truncate a tool result message's text content blocks to fit within maxChars.
* Returns a new message (does not mutate the original).
*/
function truncateToolResultMessage(msg, maxChars, options = {}) {
	const suffixFactory = resolveSuffixFactory(options.suffix);
	const minKeepChars = resolveEffectiveMinKeepChars({
		maxChars,
		minKeepChars: options.minKeepChars ?? MIN_KEEP_CHARS,
		suffixFactory
	});
	const content = msg.content;
	if (!Array.isArray(content)) return msg;
	const totalTextChars = getToolResultTextLength(msg);
	if (totalTextChars <= maxChars) return msg;
	const newContent = content.map((block) => {
		if (!block || typeof block !== "object" || block.type !== "text") return block;
		const textBlock = block;
		if (typeof textBlock.text !== "string") return block;
		const blockShare = textBlock.text.length / totalTextChars;
		const defaultSuffix = suffixFactory(Math.max(1, textBlock.text.length - Math.floor(maxChars * blockShare)));
		const proportionalBudget = Math.floor(maxChars * blockShare);
		const blockBudget = Math.max(1, Math.min(maxChars, Math.max(minKeepChars + defaultSuffix.length, proportionalBudget)));
		return Object.assign({}, textBlock, { text: truncateToolResultText(textBlock.text, blockBudget, {
			suffix: suffixFactory,
			minKeepChars
		}) });
	});
	return {
		...msg,
		content: newContent
	};
}
function calculateRecoveryAggregateToolResultChars(contextWindowTokens, maxCharsOverride) {
	return Math.max(1, maxCharsOverride ?? calculateMaxToolResultChars(contextWindowTokens));
}
function buildAggregateToolResultReplacements(params) {
	const minKeepChars = params.minKeepChars ?? MIN_KEEP_CHARS;
	const minTruncatedTextChars = minKeepChars + DEFAULT_SUFFIX(1).length;
	const candidates = params.branch.map((entry, index) => ({
		entry,
		index
	})).filter((item) => item.entry.type === "message" && Boolean(item.entry.message) && item.entry.message.role === "toolResult").map((item) => ({
		index: item.index,
		entryId: item.entry.id,
		message: item.entry.message,
		textLength: getToolResultTextLength(item.entry.message)
	})).filter((item) => item.textLength > 0);
	if (candidates.length < 2) return [];
	const totalChars = candidates.reduce((sum, item) => sum + item.textLength, 0);
	if (totalChars <= params.aggregateBudgetChars) return [];
	let remainingReduction = totalChars - params.aggregateBudgetChars;
	const replacements = [];
	for (const candidate of candidates.toSorted((a, b) => {
		if (a.index !== b.index) return b.index - a.index;
		return b.textLength - a.textLength;
	})) {
		if (remainingReduction <= 0) break;
		const reducibleChars = Math.max(0, candidate.textLength - minTruncatedTextChars);
		if (reducibleChars <= 0) continue;
		const requestedReduction = Math.min(reducibleChars, remainingReduction);
		const targetChars = Math.max(minTruncatedTextChars, candidate.textLength - requestedReduction);
		const truncatedMessage = truncateToolResultMessage(candidate.message, targetChars, { minKeepChars });
		const newLength = getToolResultTextLength(truncatedMessage);
		const actualReduction = Math.max(0, candidate.textLength - newLength);
		if (actualReduction <= 0) continue;
		replacements.push({
			entryId: candidate.entryId,
			message: truncatedMessage
		});
		remainingReduction -= actualReduction;
	}
	return replacements;
}
function buildOversizedToolResultReplacements(params) {
	const minKeepChars = params.minKeepChars ?? MIN_KEEP_CHARS;
	const replacements = [];
	for (const entry of params.branch) {
		if (entry.type !== "message" || !entry.message) continue;
		const msg = entry.message;
		if (msg.role !== "toolResult") continue;
		if (getToolResultTextLength(msg) <= params.maxChars) continue;
		replacements.push({
			entryId: entry.id,
			message: truncateToolResultMessage(msg, params.maxChars, { minKeepChars })
		});
	}
	return replacements;
}
function calculateReplacementReduction(branch, replacements) {
	if (replacements.length === 0) return 0;
	const branchById = new Map(branch.map((entry) => [entry.id, entry]));
	let reduction = 0;
	for (const replacement of replacements) {
		const entry = branchById.get(replacement.entryId);
		if (!entry?.message) continue;
		reduction += Math.max(0, getToolResultTextLength(entry.message) - getToolResultTextLength(replacement.message));
	}
	return reduction;
}
function applyToolResultReplacementsToBranch(branch, replacements) {
	if (replacements.length === 0) return branch;
	const replacementsById = new Map(replacements.map((replacement) => [replacement.entryId, replacement]));
	return branch.map((entry) => {
		const replacement = replacementsById.get(entry.id);
		if (!replacement || entry.type !== "message") return entry;
		return {
			...entry,
			message: replacement.message
		};
	});
}
function buildToolResultReplacementPlan(params) {
	const minKeepChars = params.minKeepChars ?? MIN_KEEP_CHARS;
	const oversizedReplacements = buildOversizedToolResultReplacements({
		branch: params.branch,
		maxChars: params.maxChars,
		minKeepChars
	});
	const oversizedReducibleChars = calculateReplacementReduction(params.branch, oversizedReplacements);
	const oversizedTrimmedBranch = applyToolResultReplacementsToBranch(params.branch, oversizedReplacements);
	const aggregateReplacements = buildAggregateToolResultReplacements({
		branch: oversizedTrimmedBranch,
		aggregateBudgetChars: params.aggregateBudgetChars,
		minKeepChars
	});
	const aggregateReducibleChars = calculateReplacementReduction(oversizedTrimmedBranch, aggregateReplacements);
	return {
		replacements: [...oversizedReplacements, ...aggregateReplacements],
		oversizedReplacementCount: oversizedReplacements.length,
		aggregateReplacementCount: aggregateReplacements.length,
		oversizedReducibleChars,
		aggregateReducibleChars
	};
}
function estimateToolResultReductionPotential(params) {
	const { messages, contextWindowTokens } = params;
	const maxChars = Math.max(1, params.maxCharsOverride ?? calculateMaxToolResultChars(contextWindowTokens));
	const aggregateBudgetChars = calculateRecoveryAggregateToolResultChars(contextWindowTokens, maxChars);
	const branch = messages.map((message, index) => ({
		id: `message-${index}`,
		type: "message",
		message
	}));
	let toolResultCount = 0;
	let totalToolResultChars = 0;
	for (const msg of messages) {
		if (msg.role !== "toolResult") continue;
		const textLength = getToolResultTextLength(msg);
		if (textLength <= 0) continue;
		toolResultCount += 1;
		totalToolResultChars += textLength;
	}
	const plan = buildToolResultReplacementPlan({
		branch,
		maxChars,
		aggregateBudgetChars,
		minKeepChars: RECOVERY_MIN_KEEP_CHARS
	});
	const maxReducibleChars = plan.oversizedReducibleChars + plan.aggregateReducibleChars;
	return {
		maxChars,
		aggregateBudgetChars,
		toolResultCount,
		totalToolResultChars,
		oversizedCount: plan.oversizedReplacementCount,
		oversizedReducibleChars: plan.oversizedReducibleChars,
		aggregateReducibleChars: plan.aggregateReducibleChars,
		maxReducibleChars
	};
}
function truncateOversizedToolResultsInExistingSessionManager(params) {
	const { sessionManager, contextWindowTokens } = params;
	const maxChars = Math.max(1, params.maxCharsOverride ?? calculateMaxToolResultChars(contextWindowTokens));
	const aggregateBudgetChars = calculateRecoveryAggregateToolResultChars(contextWindowTokens, maxChars);
	const branch = sessionManager.getBranch();
	if (branch.length === 0) return {
		truncated: false,
		truncatedCount: 0,
		reason: "empty session"
	};
	const plan = buildToolResultReplacementPlan({
		branch,
		maxChars,
		aggregateBudgetChars,
		minKeepChars: RECOVERY_MIN_KEEP_CHARS
	});
	if (plan.replacements.length === 0) return {
		truncated: false,
		truncatedCount: 0,
		reason: "no oversized or aggregate tool results"
	};
	const rewriteResult = rewriteTranscriptEntriesInSessionManager({
		sessionManager,
		replacements: plan.replacements
	});
	if (rewriteResult.changed && params.sessionFile) emitSessionTranscriptUpdate(params.sessionFile);
	log$3.info(`[tool-result-truncation] Truncated ${rewriteResult.rewrittenEntries} tool result(s) in session (contextWindow=${contextWindowTokens} maxChars=${maxChars} aggregateBudgetChars=${aggregateBudgetChars} oversized=${plan.oversizedReplacementCount} aggregate=${plan.aggregateReplacementCount}) sessionKey=${params.sessionKey ?? params.sessionId ?? "unknown"}`);
	return {
		truncated: rewriteResult.changed,
		truncatedCount: rewriteResult.rewrittenEntries,
		reason: rewriteResult.reason
	};
}
function truncateOversizedToolResultsInSessionManager(params) {
	try {
		return truncateOversizedToolResultsInExistingSessionManager(params);
	} catch (err) {
		const errMsg = formatErrorMessage(err);
		log$3.warn(`[tool-result-truncation] Failed to truncate: ${errMsg}`);
		return {
			truncated: false,
			truncatedCount: 0,
			reason: errMsg
		};
	}
}
async function truncateOversizedToolResultsInSession(params) {
	const { sessionFile, contextWindowTokens } = params;
	let sessionLock;
	try {
		sessionLock = await acquireSessionWriteLock({ sessionFile });
		return truncateOversizedToolResultsInExistingSessionManager({
			sessionManager: SessionManager.open(sessionFile),
			contextWindowTokens,
			maxCharsOverride: params.maxCharsOverride,
			sessionFile,
			sessionId: params.sessionId,
			sessionKey: params.sessionKey
		});
	} catch (err) {
		const errMsg = formatErrorMessage(err);
		log$3.warn(`[tool-result-truncation] Failed to truncate: ${errMsg}`);
		return {
			truncated: false,
			truncatedCount: 0,
			reason: errMsg
		};
	} finally {
		await sessionLock?.release();
	}
}
function sessionLikelyHasOversizedToolResults(params) {
	const estimate = estimateToolResultReductionPotential(params);
	return estimate.oversizedCount > 0 || estimate.aggregateReducibleChars > 0;
}
//#endregion
//#region src/agents/session-tool-result-state.ts
function createPendingToolCallState() {
	const pending = /* @__PURE__ */ new Map();
	return {
		size: () => pending.size,
		entries: () => pending.entries(),
		getToolName: (id) => pending.get(id),
		delete: (id) => {
			pending.delete(id);
		},
		clear: () => {
			pending.clear();
		},
		trackToolCalls: (calls) => {
			for (const call of calls) pending.set(call.id, call.name);
		},
		getPendingIds: () => Array.from(pending.keys()),
		shouldFlushForSanitizedDrop: () => pending.size > 0,
		shouldFlushBeforeNonToolResult: (nextRole, toolCallCount) => pending.size > 0 && (toolCallCount === 0 || nextRole !== "assistant"),
		shouldFlushBeforeNewToolCalls: (toolCallCount) => pending.size > 0 && toolCallCount > 0
	};
}
//#endregion
//#region src/agents/session-tool-result-guard.ts
/**
* Truncate oversized text content blocks in a tool result message.
* Returns the original message if under the limit, or a new message with
* truncated text blocks otherwise.
*/
function capToolResultSize(msg, maxChars) {
	if (msg.role !== "toolResult") return msg;
	return truncateToolResultMessage(msg, maxChars, {
		suffix: (truncatedChars) => formatContextLimitTruncationNotice(truncatedChars),
		minKeepChars: 2e3
	});
}
function resolveMaxToolResultChars(opts) {
	return Math.max(1, opts?.maxToolResultChars ?? 16e3);
}
function normalizePersistedToolResultName(message, fallbackName) {
	if (message.role !== "toolResult") return message;
	const toolResult = message;
	const rawToolName = toolResult.toolName;
	const normalizedToolName = normalizeOptionalString(rawToolName);
	if (normalizedToolName) {
		if (rawToolName === normalizedToolName) return toolResult;
		return {
			...toolResult,
			toolName: normalizedToolName
		};
	}
	const normalizedFallback = normalizeOptionalString(fallbackName);
	if (normalizedFallback) return {
		...toolResult,
		toolName: normalizedFallback
	};
	if (typeof rawToolName === "string") return {
		...toolResult,
		toolName: "unknown"
	};
	return toolResult;
}
function installSessionToolResultGuard(sessionManager, opts) {
	const originalAppend = getRawSessionAppendMessage(sessionManager);
	setRawSessionAppendMessage(sessionManager, originalAppend);
	const pendingState = createPendingToolCallState();
	const persistMessage = (message) => {
		const transformer = opts?.transformMessageForPersistence;
		return transformer ? transformer(message) : message;
	};
	const persistToolResult = (message, meta) => {
		const transformer = opts?.transformToolResultForPersistence;
		return transformer ? transformer(message, meta) : message;
	};
	const allowSyntheticToolResults = opts?.allowSyntheticToolResults ?? true;
	const missingToolResultText = opts?.missingToolResultText;
	const beforeWrite = opts?.beforeMessageWriteHook;
	const maxToolResultChars = resolveMaxToolResultChars(opts);
	/**
	* Run the before_message_write hook. Returns the (possibly modified) message,
	* or null if the message should be blocked.
	*/
	const applyBeforeWriteHook = (msg) => {
		if (!beforeWrite) return msg;
		const result = beforeWrite({ message: msg });
		if (result?.block) return null;
		if (result?.message) return result.message;
		return msg;
	};
	const flushPendingToolResults = () => {
		if (pendingState.size() === 0) return;
		if (allowSyntheticToolResults) for (const [id, name] of pendingState.entries()) {
			const flushed = applyBeforeWriteHook(persistToolResult(persistMessage(makeMissingToolResult({
				toolCallId: id,
				toolName: name,
				text: missingToolResultText
			})), {
				toolCallId: id,
				toolName: name,
				isSynthetic: true
			}));
			if (flushed) originalAppend(capToolResultSize(flushed, maxToolResultChars));
		}
		pendingState.clear();
	};
	const clearPendingToolResults = () => {
		pendingState.clear();
	};
	const guardedAppend = (message) => {
		let nextMessage = message;
		if (message.role === "assistant") {
			const sanitized = sanitizeToolCallInputs([message], { allowedToolNames: opts?.allowedToolNames });
			if (sanitized.length === 0) {
				if (pendingState.shouldFlushForSanitizedDrop()) flushPendingToolResults();
				return;
			}
			nextMessage = sanitized[0];
		}
		const nextRole = nextMessage.role;
		if (nextRole === "toolResult") {
			const id = extractToolResultId(nextMessage);
			const toolName = id ? pendingState.getToolName(id) : void 0;
			if (id) pendingState.delete(id);
			const persisted = applyBeforeWriteHook(persistToolResult(capToolResultSize(persistMessage(normalizePersistedToolResultName(nextMessage, toolName)), maxToolResultChars), {
				toolCallId: id ?? void 0,
				toolName,
				isSynthetic: false
			}));
			if (!persisted) return;
			return originalAppend(capToolResultSize(persisted, maxToolResultChars));
		}
		const stopReason = nextMessage.stopReason;
		const toolCalls = nextRole === "assistant" && stopReason !== "aborted" && stopReason !== "error" ? extractToolCallsFromAssistant(nextMessage) : [];
		if (pendingState.shouldFlushBeforeNonToolResult(nextRole, toolCalls.length)) flushPendingToolResults();
		if (pendingState.shouldFlushBeforeNewToolCalls(toolCalls.length)) flushPendingToolResults();
		const finalMessage = applyBeforeWriteHook(persistMessage(nextMessage));
		if (!finalMessage) return;
		const result = originalAppend(finalMessage);
		const sessionFile = sessionManager.getSessionFile?.();
		if (sessionFile) emitSessionTranscriptUpdate({
			sessionFile,
			sessionKey: opts?.sessionKey,
			message: finalMessage,
			messageId: typeof result === "string" ? result : void 0
		});
		if (toolCalls.length > 0) pendingState.trackToolCalls(toolCalls);
		return result;
	};
	sessionManager.appendMessage = guardedAppend;
	return {
		flushPendingToolResults,
		clearPendingToolResults,
		getPendingIds: pendingState.getPendingIds
	};
}
//#endregion
//#region src/agents/session-tool-result-guard-wrapper.ts
/**
* Apply the tool-result guard to a SessionManager exactly once and expose
* a flush method on the instance for easy teardown handling.
*/
function guardSessionManager(sessionManager, opts) {
	if (typeof sessionManager.flushPendingToolResults === "function") return sessionManager;
	const hookRunner = getGlobalHookRunner();
	const beforeMessageWrite = hookRunner?.hasHooks("before_message_write") ? (event) => {
		return hookRunner.runBeforeMessageWrite(event, {
			agentId: opts?.agentId,
			sessionKey: opts?.sessionKey
		});
	} : void 0;
	const transform = hookRunner?.hasHooks("tool_result_persist") ? (message, meta) => {
		return hookRunner.runToolResultPersist({
			toolName: meta.toolName,
			toolCallId: meta.toolCallId,
			message,
			isSynthetic: meta.isSynthetic
		}, {
			agentId: opts?.agentId,
			sessionKey: opts?.sessionKey,
			toolName: meta.toolName,
			toolCallId: meta.toolCallId
		})?.message ?? message;
	} : void 0;
	const guard = installSessionToolResultGuard(sessionManager, {
		sessionKey: opts?.sessionKey,
		transformMessageForPersistence: (message) => applyInputProvenanceToUserMessage(message, opts?.inputProvenance),
		transformToolResultForPersistence: transform,
		allowSyntheticToolResults: opts?.allowSyntheticToolResults,
		missingToolResultText: opts?.missingToolResultText,
		allowedToolNames: opts?.allowedToolNames,
		beforeMessageWriteHook: beforeMessageWrite,
		maxToolResultChars: typeof opts?.contextWindowTokens === "number" ? resolveLiveToolResultMaxChars({
			contextWindowTokens: opts.contextWindowTokens,
			cfg: opts.config,
			agentId: opts.agentId
		}) : void 0
	});
	sessionManager.flushPendingToolResults = guard.flushPendingToolResults;
	sessionManager.clearPendingToolResults = guard.clearPendingToolResults;
	return sessionManager;
}
//#endregion
//#region src/agents/transcript-policy.ts
function shouldAllowProviderOwnedThinkingReplay(params) {
	return isAnthropicApi(params.modelApi) && params.policy.validateAnthropicTurns && params.policy.preserveSignatures && !params.policy.dropThinkingBlocks;
}
const DEFAULT_TRANSCRIPT_POLICY = {
	sanitizeMode: "images-only",
	sanitizeToolCallIds: false,
	toolCallIdMode: void 0,
	preserveNativeAnthropicToolUseIds: false,
	repairToolUseResultPairing: true,
	preserveSignatures: false,
	sanitizeThoughtSignatures: void 0,
	sanitizeThinkingSignatures: false,
	dropThinkingBlocks: false,
	applyGoogleTurnOrdering: false,
	validateGeminiTurns: false,
	validateAnthropicTurns: false,
	allowSyntheticToolResults: false
};
function isAnthropicApi(modelApi) {
	return modelApi === "anthropic-messages" || modelApi === "bedrock-converse-stream";
}
/**
* Provides a narrow replay-policy fallback for providers that do not have an
* owning runtime plugin.
*
* This exists to preserve generic custom-provider behavior. Bundled providers
* should express replay ownership through `buildReplayPolicy` instead.
*/
function buildUnownedProviderTransportReplayFallback(params) {
	const isGoogle = isGoogleModelApi(params.modelApi);
	const isAnthropic = isAnthropicApi(params.modelApi);
	const isStrictOpenAiCompatible = params.modelApi === "openai-completions";
	const requiresOpenAiCompatibleToolIdSanitization = params.modelApi === "openai-completions" || params.modelApi === "openai-responses" || params.modelApi === "openai-codex-responses" || params.modelApi === "azure-openai-responses";
	if (!isGoogle && !isAnthropic && !isStrictOpenAiCompatible && !requiresOpenAiCompatibleToolIdSanitization) return;
	const modelId = normalizeLowercaseStringOrEmpty(params.modelId);
	return {
		...isGoogle || isAnthropic ? { sanitizeMode: "full" } : {},
		...isGoogle || isAnthropic || requiresOpenAiCompatibleToolIdSanitization ? {
			sanitizeToolCallIds: true,
			toolCallIdMode: "strict"
		} : {},
		...isAnthropic ? { preserveSignatures: true } : {},
		...isGoogle ? { sanitizeThoughtSignatures: {
			allowBase64Only: true,
			includeCamelCase: true
		} } : {},
		...isAnthropic && modelId.includes("claude") ? { dropThinkingBlocks: !shouldPreserveThinkingBlocks(modelId) } : {},
		...isGoogle || isStrictOpenAiCompatible ? { applyAssistantFirstOrderingFix: true } : {},
		...isGoogle || isStrictOpenAiCompatible ? { validateGeminiTurns: true } : {},
		...isAnthropic || isStrictOpenAiCompatible ? { validateAnthropicTurns: true } : {},
		...isGoogle || isAnthropic ? { allowSyntheticToolResults: true } : {}
	};
}
function mergeTranscriptPolicy(policy, basePolicy = DEFAULT_TRANSCRIPT_POLICY) {
	if (!policy) return basePolicy;
	return {
		...basePolicy,
		...policy.sanitizeMode != null ? { sanitizeMode: policy.sanitizeMode } : {},
		...typeof policy.sanitizeToolCallIds === "boolean" ? { sanitizeToolCallIds: policy.sanitizeToolCallIds } : {},
		...policy.toolCallIdMode ? { toolCallIdMode: policy.toolCallIdMode } : {},
		...typeof policy.preserveNativeAnthropicToolUseIds === "boolean" ? { preserveNativeAnthropicToolUseIds: policy.preserveNativeAnthropicToolUseIds } : {},
		...typeof policy.repairToolUseResultPairing === "boolean" ? { repairToolUseResultPairing: policy.repairToolUseResultPairing } : {},
		...typeof policy.preserveSignatures === "boolean" ? { preserveSignatures: policy.preserveSignatures } : {},
		...policy.sanitizeThoughtSignatures ? { sanitizeThoughtSignatures: policy.sanitizeThoughtSignatures } : {},
		...typeof policy.dropThinkingBlocks === "boolean" ? { dropThinkingBlocks: policy.dropThinkingBlocks } : {},
		...typeof policy.applyAssistantFirstOrderingFix === "boolean" ? { applyGoogleTurnOrdering: policy.applyAssistantFirstOrderingFix } : {},
		...typeof policy.validateGeminiTurns === "boolean" ? { validateGeminiTurns: policy.validateGeminiTurns } : {},
		...typeof policy.validateAnthropicTurns === "boolean" ? { validateAnthropicTurns: policy.validateAnthropicTurns } : {},
		...typeof policy.allowSyntheticToolResults === "boolean" ? { allowSyntheticToolResults: policy.allowSyntheticToolResults } : {}
	};
}
function resolveTranscriptPolicy(params) {
	const provider = normalizeProviderId(params.provider ?? "");
	const runtimePlugin = provider ? resolveProviderRuntimePlugin({
		provider,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	}) : void 0;
	const context = {
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		provider,
		modelId: params.modelId ?? "",
		modelApi: params.modelApi,
		model: params.model
	};
	const buildReplayPolicy = runtimePlugin?.buildReplayPolicy;
	if (buildReplayPolicy) return mergeTranscriptPolicy(buildReplayPolicy(context) ?? void 0);
	return mergeTranscriptPolicy(buildUnownedProviderTransportReplayFallback({
		modelApi: params.modelApi,
		modelId: params.modelId
	}));
}
function isCacheTtlEligibleProvider(provider, modelId, modelApi) {
	const normalizedProvider = normalizeLowercaseStringOrEmpty(provider);
	const normalizedModelId = normalizeLowercaseStringOrEmpty(modelId);
	const pluginEligibility = resolveProviderCacheTtlEligibility({
		provider: normalizedProvider,
		context: {
			provider: normalizedProvider,
			modelId: normalizedModelId,
			modelApi
		}
	});
	if (pluginEligibility !== void 0) return pluginEligibility;
	return isAnthropicFamilyCacheTtlEligible({
		provider: normalizedProvider,
		modelId: normalizedModelId,
		modelApi
	}) || normalizedProvider === "kilocode" && isAnthropicModelRef(normalizedModelId) || isGooglePromptCacheEligible({
		modelApi,
		modelId: normalizedModelId
	});
}
function normalizeCacheTtlKey(value) {
	return normalizeOptionalLowercaseString(value);
}
function matchesCacheTtlContext(data, context) {
	if (!context) return true;
	const expectedProvider = normalizeCacheTtlKey(context.provider);
	if (expectedProvider && normalizeCacheTtlKey(data?.provider) !== expectedProvider) return false;
	const expectedModelId = normalizeCacheTtlKey(context.modelId);
	if (expectedModelId && normalizeCacheTtlKey(data?.modelId) !== expectedModelId) return false;
	return true;
}
function readLastCacheTtlTimestamp(sessionManager, context) {
	const sm = sessionManager;
	if (!sm?.getEntries) return null;
	try {
		const entries = sm.getEntries();
		let last = null;
		for (let i = entries.length - 1; i >= 0; i--) {
			const entry = entries[i];
			if (entry?.type !== "custom" || entry?.customType !== "openclaw.cache-ttl") continue;
			const data = entry?.data;
			if (!matchesCacheTtlContext(data, context)) continue;
			const ts = typeof data?.timestamp === "number" ? data.timestamp : null;
			if (ts && Number.isFinite(ts)) {
				last = ts;
				break;
			}
		}
		return last;
	} catch {
		return null;
	}
}
//#endregion
//#region src/agents/pi-embedded-runner/compaction-safety-timeout.ts
const EMBEDDED_COMPACTION_TIMEOUT_MS = 9e5;
const MAX_SAFE_TIMEOUT_MS = 2147e6;
function createAbortError(signal) {
	const reason = "reason" in signal ? signal.reason : void 0;
	if (reason instanceof Error) return reason;
	const err = reason ? new Error("aborted", { cause: reason }) : /* @__PURE__ */ new Error("aborted");
	err.name = "AbortError";
	return err;
}
function resolveCompactionTimeoutMs(cfg) {
	const raw = cfg?.agents?.defaults?.compaction?.timeoutSeconds;
	if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) return Math.min(Math.floor(raw) * 1e3, MAX_SAFE_TIMEOUT_MS);
	return EMBEDDED_COMPACTION_TIMEOUT_MS;
}
async function compactWithSafetyTimeout(compact, timeoutMs = EMBEDDED_COMPACTION_TIMEOUT_MS, opts) {
	let canceled = false;
	const cancel = () => {
		if (canceled) return;
		canceled = true;
		try {
			opts?.onCancel?.();
		} catch {}
	};
	return await withTimeout(async (timeoutSignal) => {
		let timeoutListener;
		let externalAbortListener;
		let externalAbortPromise;
		const abortSignal = opts?.abortSignal;
		if (timeoutSignal) {
			timeoutListener = () => {
				cancel();
			};
			timeoutSignal.addEventListener("abort", timeoutListener, { once: true });
		}
		if (abortSignal) {
			if (abortSignal.aborted) {
				cancel();
				throw createAbortError(abortSignal);
			}
			externalAbortPromise = new Promise((_, reject) => {
				externalAbortListener = () => {
					cancel();
					reject(createAbortError(abortSignal));
				};
				abortSignal.addEventListener("abort", externalAbortListener, { once: true });
			});
		}
		try {
			if (externalAbortPromise) return await Promise.race([compact(), externalAbortPromise]);
			return await compact();
		} finally {
			if (timeoutListener) timeoutSignal?.removeEventListener("abort", timeoutListener);
			if (externalAbortListener) abortSignal?.removeEventListener("abort", externalAbortListener);
		}
	}, timeoutMs, "Compaction");
}
//#endregion
//#region src/agents/pi-embedded-runner/effective-tool-policy.ts
function resolveTrustedGroupId(params) {
	const callerGroupId = (params.groupId ?? "").trim();
	if (!callerGroupId) return {
		groupId: params.groupId,
		dropped: false
	};
	const sessionGroupIds = resolveGroupContextFromSessionKey(params.sessionKey).groupIds ?? [];
	const spawnedGroupIds = resolveGroupContextFromSessionKey(params.spawnedBy).groupIds ?? [];
	const trusted = [...sessionGroupIds, ...spawnedGroupIds];
	if (trusted.length === 0) return {
		groupId: null,
		dropped: true
	};
	if (trusted.includes(callerGroupId)) return {
		groupId: params.groupId,
		dropped: false
	};
	return {
		groupId: null,
		dropped: true
	};
}
function applyFinalEffectiveToolPolicy(params) {
	if (params.bundledTools.length === 0) return params.bundledTools;
	const trustedGroup = resolveTrustedGroupId(params);
	if (trustedGroup.dropped) params.warn("effective tool policy: dropping caller-provided groupId that does not match session-derived group context");
	const { agentId, globalPolicy, globalProviderPolicy, agentPolicy, agentProviderPolicy, profile, providerProfile, profileAlsoAllow, providerProfileAlsoAllow } = resolveEffectiveToolPolicy({
		config: params.config,
		sessionKey: params.sessionKey,
		agentId: params.agentId,
		modelProvider: params.modelProvider,
		modelId: params.modelId
	});
	const groupPolicy = resolveGroupToolPolicy({
		config: params.config,
		sessionKey: params.sessionKey,
		spawnedBy: params.spawnedBy,
		messageProvider: params.messageProvider,
		groupId: trustedGroup.groupId,
		groupChannel: trustedGroup.dropped ? null : params.groupChannel,
		groupSpace: trustedGroup.dropped ? null : params.groupSpace,
		accountId: params.agentAccountId,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
	const profilePolicy = resolveToolProfilePolicy(profile);
	const providerProfilePolicy = resolveToolProfilePolicy(providerProfile);
	const profilePolicyWithAlsoAllow = mergeAlsoAllowPolicy(profilePolicy, profileAlsoAllow);
	const providerProfilePolicyWithAlsoAllow = mergeAlsoAllowPolicy(providerProfilePolicy, providerProfileAlsoAllow);
	const subagentStore = resolveSubagentCapabilityStore(params.sessionKey, { cfg: params.config });
	const subagentPolicy = params.sessionKey && isSubagentEnvelopeSession(params.sessionKey, {
		cfg: params.config,
		store: subagentStore
	}) ? resolveSubagentToolPolicyForSession(params.config, params.sessionKey, { store: subagentStore }) : void 0;
	const ownerFiltered = applyOwnerOnlyToolPolicy(params.bundledTools, params.senderIsOwner === true);
	const pipelineSteps = [
		...buildDefaultToolPolicyPipelineSteps({
			profilePolicy: profilePolicyWithAlsoAllow,
			profile,
			profileUnavailableCoreWarningAllowlist: profilePolicy?.allow,
			providerProfilePolicy: providerProfilePolicyWithAlsoAllow,
			providerProfile,
			providerProfileUnavailableCoreWarningAllowlist: providerProfilePolicy?.allow,
			globalPolicy,
			globalProviderPolicy,
			agentPolicy,
			agentProviderPolicy,
			groupPolicy,
			agentId
		}),
		{
			policy: params.sandboxToolPolicy,
			label: "sandbox tools.allow"
		},
		{
			policy: subagentPolicy,
			label: "subagent tools.allow"
		}
	].map((step) => Object.assign({}, step, { suppressUnavailableCoreToolWarning: true }));
	return applyToolPolicyPipeline({
		tools: ownerFiltered,
		toolMeta: (tool) => getPluginToolMeta(tool),
		warn: params.warn,
		steps: pipelineSteps
	});
}
//#endregion
//#region src/agents/pi-hooks/session-manager-runtime-registry.ts
function createSessionManagerRuntimeRegistry() {
	const registry = /* @__PURE__ */ new WeakMap();
	const set = (sessionManager, value) => {
		if (!sessionManager || typeof sessionManager !== "object") return;
		const key = sessionManager;
		if (value === null) {
			registry.delete(key);
			return;
		}
		registry.set(key, value);
	};
	const get = (sessionManager) => {
		if (!sessionManager || typeof sessionManager !== "object") return null;
		return registry.get(sessionManager) ?? null;
	};
	return {
		set,
		get
	};
}
//#endregion
//#region src/agents/pi-hooks/compaction-safeguard-runtime.ts
const registry$1 = createSessionManagerRuntimeRegistry();
const setCompactionSafeguardRuntime = registry$1.set;
const getCompactionSafeguardRuntime = registry$1.get;
function setCompactionSafeguardCancelReason(sessionManager, reason) {
	const current = getCompactionSafeguardRuntime(sessionManager);
	const trimmed = reason?.trim();
	if (!current) {
		if (!trimmed) return;
		setCompactionSafeguardRuntime(sessionManager, { cancelReason: trimmed });
		return;
	}
	const next = { ...current };
	if (trimmed) next.cancelReason = trimmed;
	else delete next.cancelReason;
	setCompactionSafeguardRuntime(sessionManager, next);
}
function consumeCompactionSafeguardCancelReason(sessionManager) {
	const current = getCompactionSafeguardRuntime(sessionManager);
	const reason = current?.cancelReason?.trim();
	if (!reason) return null;
	const next = { ...current };
	delete next.cancelReason;
	setCompactionSafeguardRuntime(sessionManager, Object.keys(next).length > 0 ? next : null);
	return reason;
}
//#endregion
//#region src/auto-reply/reply/post-compaction-context.ts
const MAX_CONTEXT_CHARS = 1800;
const DEFAULT_POST_COMPACTION_SECTIONS = ["Session Startup", "Red Lines"];
const LEGACY_POST_COMPACTION_SECTIONS = ["Every Session", "Safety"];
function matchesSectionSet(sectionNames, expectedSections) {
	if (sectionNames.length !== expectedSections.length) return false;
	const counts = /* @__PURE__ */ new Map();
	for (const name of expectedSections) {
		const normalized = normalizeLowercaseStringOrEmpty(name);
		counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
	}
	for (const name of sectionNames) {
		const normalized = normalizeLowercaseStringOrEmpty(name);
		const count = counts.get(normalized);
		if (!count) return false;
		if (count === 1) counts.delete(normalized);
		else counts.set(normalized, count - 1);
	}
	return counts.size === 0;
}
function formatDateStamp(nowMs, timezone) {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: timezone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).formatToParts(new Date(nowMs));
	const year = parts.find((p) => p.type === "year")?.value;
	const month = parts.find((p) => p.type === "month")?.value;
	const day = parts.find((p) => p.type === "day")?.value;
	if (year && month && day) return `${year}-${month}-${day}`;
	return new Date(nowMs).toISOString().slice(0, 10);
}
async function readPostCompactionContext(workspaceDir, options) {
	const cfg = options?.cfg;
	const agentId = options?.agentId;
	const effectiveNowMs = options?.nowMs;
	const agentsPath = path.join(workspaceDir, "AGENTS.md");
	try {
		const opened = await openBoundaryFile({
			absolutePath: agentsPath,
			rootPath: workspaceDir,
			boundaryLabel: "workspace root"
		});
		if (!opened.ok) return null;
		const content = (() => {
			try {
				return fs.readFileSync(opened.fd, "utf-8");
			} finally {
				fs.closeSync(opened.fd);
			}
		})();
		const configuredSections = cfg?.agents?.defaults?.compaction?.postCompactionSections;
		const sectionNames = Array.isArray(configuredSections) ? configuredSections : DEFAULT_POST_COMPACTION_SECTIONS;
		if (sectionNames.length === 0) return null;
		const foundSectionNames = [];
		let sections = extractSections(content, sectionNames, foundSectionNames);
		const isDefaultSections = !Array.isArray(configuredSections) || matchesSectionSet(configuredSections, DEFAULT_POST_COMPACTION_SECTIONS);
		if (sections.length === 0 && isDefaultSections) sections = extractSections(content, LEGACY_POST_COMPACTION_SECTIONS, foundSectionNames);
		if (sections.length === 0) return null;
		const displayNames = foundSectionNames.length > 0 ? foundSectionNames : sectionNames;
		const resolvedNowMs = effectiveNowMs ?? Date.now();
		const dateStamp = formatDateStamp(resolvedNowMs, resolveUserTimezone(cfg?.agents?.defaults?.userTimezone));
		const maxContextChars = resolveAgentContextLimits(cfg, agentId)?.postCompactionMaxChars ?? MAX_CONTEXT_CHARS;
		const { timeLine } = resolveCronStyleNow(cfg ?? {}, resolvedNowMs);
		const combined = sections.join("\n\n").replaceAll("YYYY-MM-DD", dateStamp);
		const safeContent = combined.length > maxContextChars ? combined.slice(0, maxContextChars) + "\n...[truncated]..." : combined;
		return `[Post-compaction context refresh]

${isDefaultSections ? "Session was just compacted. The conversation summary above is a hint, NOT a substitute for your startup sequence. Run your Session Startup sequence - read the required files before responding to the user." : `Session was just compacted. The conversation summary above is a hint, NOT a substitute for your full startup sequence. Re-read the sections injected below (${displayNames.join(", ")}) and follow your configured startup procedure before responding to the user.`}\n\n${isDefaultSections ? "Critical rules from AGENTS.md:" : `Injected sections from AGENTS.md (${displayNames.join(", ")}):`}\n\n${safeContent}\n\n${timeLine}`;
	} catch {
		return null;
	}
}
/**
* Extract named sections from markdown content.
* Matches H2 (##) or H3 (###) headings case-insensitively.
* Skips content inside fenced code blocks.
* Captures until the next heading of same or higher level, or end of string.
*/
function extractSections(content, sectionNames, foundNames) {
	const results = [];
	const lines = content.split("\n");
	for (const name of sectionNames) {
		let sectionLines = [];
		let inSection = false;
		let sectionLevel = 0;
		let inCodeBlock = false;
		for (const line of lines) {
			if (line.trimStart().startsWith("```")) {
				inCodeBlock = !inCodeBlock;
				if (inSection) sectionLines.push(line);
				continue;
			}
			if (inCodeBlock) {
				if (inSection) sectionLines.push(line);
				continue;
			}
			const headingMatch = line.match(/^(#{2,3})\s+(.+?)\s*$/);
			if (headingMatch) {
				const level = headingMatch[1].length;
				const headingText = headingMatch[2];
				if (!inSection) {
					if (normalizeLowercaseStringOrEmpty(headingText) === normalizeLowercaseStringOrEmpty(name)) {
						inSection = true;
						sectionLevel = level;
						sectionLines = [line];
						continue;
					}
				} else {
					if (level <= sectionLevel) break;
					sectionLines.push(line);
					continue;
				}
			}
			if (inSection) sectionLines.push(line);
		}
		if (sectionLines.length > 0) {
			results.push(sectionLines.join("\n").trim());
			foundNames?.push(name);
		}
	}
	return results;
}
const NON_CONVERSATION_BLOCK_TYPES = new Set([
	"toolCall",
	"toolUse",
	"functionCall",
	"thinking",
	"reasoning"
]);
function hasMeaningfulText(text) {
	const trimmed = text.trim();
	if (!trimmed) return false;
	if (isSilentReplyText(trimmed)) return false;
	const heartbeat = stripHeartbeatToken(trimmed, { mode: "message" });
	if (heartbeat.didStrip) return heartbeat.text.trim().length > 0;
	return true;
}
function hasMeaningfulConversationContent(message) {
	const content = message.content;
	if (typeof content === "string") return hasMeaningfulText(content);
	if (!Array.isArray(content)) return false;
	let sawMeaningfulNonTextBlock = false;
	for (const block of content) {
		if (!block || typeof block !== "object") continue;
		const type = block.type;
		if (type !== "text") {
			if (typeof type === "string" && NON_CONVERSATION_BLOCK_TYPES.has(type)) continue;
			sawMeaningfulNonTextBlock = true;
			continue;
		}
		const text = block.text;
		if (typeof text !== "string") continue;
		if (hasMeaningfulText(text)) return true;
	}
	return sawMeaningfulNonTextBlock;
}
function isRealConversationMessage(message, messages, index) {
	if (message.role === "user" || message.role === "assistant") return hasMeaningfulConversationContent(message);
	if (message.role !== "toolResult") return false;
	const start = Math.max(0, index - 20);
	for (let i = index - 1; i >= start; i -= 1) {
		const candidate = messages[i];
		if (!candidate || candidate.role !== "user") continue;
		if (hasMeaningfulConversationContent(candidate)) return true;
	}
	return false;
}
//#endregion
//#region src/agents/compaction.ts
const log$1 = createSubsystemLogger("compaction");
const BASE_CHUNK_RATIO = .4;
const MIN_CHUNK_RATIO = .15;
const SAFETY_MARGIN = 1.2;
const DEFAULT_SUMMARY_FALLBACK = "No prior history.";
const DEFAULT_PARTS = 2;
const MERGE_SUMMARIES_INSTRUCTIONS = [
	"Merge these partial summaries into a single cohesive summary.",
	"",
	"MUST PRESERVE:",
	"- Active tasks and their current status (in-progress, blocked, pending)",
	"- Batch operation progress (e.g., '5/17 items completed')",
	"- The last thing the user requested and what was being done about it",
	"- Decisions made and their rationale",
	"- TODOs, open questions, and constraints",
	"- Any commitments or follow-ups promised",
	"",
	"PRIORITIZE recent context over older history. The agent needs to know",
	"what it was doing, not just what was discussed."
].join("\n");
const IDENTIFIER_PRESERVATION_INSTRUCTIONS = "Preserve all opaque identifiers exactly as written (no shortening or reconstruction), including UUIDs, hashes, IDs, hostnames, IPs, ports, URLs, and file names.";
const generateSummaryCompat = generateSummary;
function resolveIdentifierPreservationInstructions(instructions) {
	const policy = instructions?.identifierPolicy ?? "strict";
	if (policy === "off") return;
	if (policy === "custom") {
		const custom = instructions?.identifierInstructions?.trim();
		return custom && custom.length > 0 ? custom : IDENTIFIER_PRESERVATION_INSTRUCTIONS;
	}
	return IDENTIFIER_PRESERVATION_INSTRUCTIONS;
}
function buildCompactionSummarizationInstructions(customInstructions, instructions) {
	const custom = customInstructions?.trim();
	const identifierPreservation = resolveIdentifierPreservationInstructions(instructions);
	if (!identifierPreservation && !custom) return;
	if (!custom) return identifierPreservation;
	if (!identifierPreservation) return `Additional focus:\n${custom}`;
	return `${identifierPreservation}\n\nAdditional focus:\n${custom}`;
}
function estimateMessagesTokens(messages) {
	return stripToolResultDetails(messages).reduce((sum, message) => sum + estimateTokens(message), 0);
}
function estimateCompactionMessageTokens(message) {
	return estimateMessagesTokens([message]);
}
function normalizeParts(parts, messageCount) {
	if (!Number.isFinite(parts) || parts <= 1) return 1;
	return Math.min(Math.max(1, Math.floor(parts)), Math.max(1, messageCount));
}
function splitMessagesByTokenShare(messages, parts = DEFAULT_PARTS) {
	if (messages.length === 0) return [];
	const normalizedParts = normalizeParts(parts, messages.length);
	if (normalizedParts <= 1) return [messages];
	const targetTokens = estimateMessagesTokens(messages) / normalizedParts;
	const chunks = [];
	let current = [];
	let currentTokens = 0;
	let pendingToolCallIds = /* @__PURE__ */ new Set();
	let pendingChunkStartIndex = null;
	const splitCurrentAtPendingBoundary = () => {
		if (pendingChunkStartIndex === null || pendingChunkStartIndex <= 0 || chunks.length >= normalizedParts - 1) return false;
		chunks.push(current.slice(0, pendingChunkStartIndex));
		current = current.slice(pendingChunkStartIndex);
		currentTokens = current.reduce((sum, msg) => sum + estimateCompactionMessageTokens(msg), 0);
		pendingChunkStartIndex = 0;
		return true;
	};
	for (const message of messages) {
		const messageTokens = estimateCompactionMessageTokens(message);
		if (pendingToolCallIds.size === 0 && chunks.length < normalizedParts - 1 && current.length > 0 && currentTokens + messageTokens > targetTokens) {
			chunks.push(current);
			current = [];
			currentTokens = 0;
			pendingChunkStartIndex = null;
		}
		current.push(message);
		currentTokens += messageTokens;
		if (message.role === "assistant") {
			const toolCalls = extractToolCallsFromAssistant(message);
			const stopReason = message.stopReason;
			const keepsPending = stopReason !== "aborted" && stopReason !== "error" && toolCalls.length > 0;
			pendingToolCallIds = keepsPending ? new Set(toolCalls.map((t) => t.id)) : /* @__PURE__ */ new Set();
			pendingChunkStartIndex = keepsPending ? current.length - 1 : null;
		} else if (message.role === "toolResult" && pendingToolCallIds.size > 0) {
			const resultId = extractToolResultId(message);
			if (!resultId) {
				pendingToolCallIds = /* @__PURE__ */ new Set();
				pendingChunkStartIndex = null;
			} else pendingToolCallIds.delete(resultId);
			if (pendingToolCallIds.size === 0 && chunks.length < normalizedParts - 1 && currentTokens > targetTokens) {
				splitCurrentAtPendingBoundary();
				pendingChunkStartIndex = null;
			}
		}
	}
	if (pendingToolCallIds.size > 0 && currentTokens > targetTokens) splitCurrentAtPendingBoundary();
	if (current.length > 0) chunks.push(current);
	return chunks;
}
const SUMMARIZATION_OVERHEAD_TOKENS = 4096;
function chunkMessagesByMaxTokens(messages, maxTokens) {
	if (messages.length === 0) return [];
	const effectiveMax = Math.max(1, Math.floor(maxTokens / SAFETY_MARGIN));
	const chunks = [];
	let currentChunk = [];
	let currentTokens = 0;
	for (const message of messages) {
		const messageTokens = estimateCompactionMessageTokens(message);
		if (currentChunk.length > 0 && currentTokens + messageTokens > effectiveMax) {
			chunks.push(currentChunk);
			currentChunk = [];
			currentTokens = 0;
		}
		currentChunk.push(message);
		currentTokens += messageTokens;
		if (messageTokens > effectiveMax) {
			chunks.push(currentChunk);
			currentChunk = [];
			currentTokens = 0;
		}
	}
	if (currentChunk.length > 0) chunks.push(currentChunk);
	return chunks;
}
/**
* Compute adaptive chunk ratio based on average message size.
* When messages are large, we use smaller chunks to avoid exceeding model limits.
*/
function computeAdaptiveChunkRatio(messages, contextWindow) {
	if (messages.length === 0) return BASE_CHUNK_RATIO;
	const avgRatio = estimateMessagesTokens(messages) / messages.length * SAFETY_MARGIN / contextWindow;
	if (avgRatio > .1) {
		const reduction = Math.min(avgRatio * 2, BASE_CHUNK_RATIO - MIN_CHUNK_RATIO);
		return Math.max(MIN_CHUNK_RATIO, BASE_CHUNK_RATIO - reduction);
	}
	return BASE_CHUNK_RATIO;
}
/**
* Check if a single message is too large to summarize.
* If single message > 50% of context, it can't be summarized safely.
*/
function isOversizedForSummary(msg, contextWindow) {
	return estimateCompactionMessageTokens(msg) * SAFETY_MARGIN > contextWindow * .5;
}
async function summarizeChunks(params) {
	if (params.messages.length === 0) return params.previousSummary ?? DEFAULT_SUMMARY_FALLBACK;
	const chunks = chunkMessagesByMaxTokens(stripToolResultDetails(params.messages), params.maxChunkTokens);
	let summary = params.previousSummary;
	const effectiveInstructions = buildCompactionSummarizationInstructions(params.customInstructions, params.summarizationInstructions);
	for (const chunk of chunks) summary = await retryAsync(() => generateSummary$1(chunk, params.model, params.reserveTokens, params.apiKey, params.headers, params.signal, effectiveInstructions, summary), {
		attempts: 3,
		minDelayMs: 500,
		maxDelayMs: 5e3,
		jitter: .2,
		label: "compaction/generateSummary",
		shouldRetry: (err) => !isAbortError(err) && !isTimeoutError(err)
	});
	return summary ?? DEFAULT_SUMMARY_FALLBACK;
}
function generateSummary$1(currentMessages, model, reserveTokens, apiKey, headers, signal, customInstructions, previousSummary) {
	if (generateSummary.length >= 8) return generateSummaryCompat(currentMessages, model, reserveTokens, apiKey, headers, signal, customInstructions, previousSummary);
	return generateSummaryCompat(currentMessages, model, reserveTokens, apiKey, signal, customInstructions, previousSummary);
}
/**
* Summarize with progressive fallback for handling oversized messages.
* If full summarization fails, tries partial summarization excluding oversized messages.
*/
async function summarizeWithFallback(params) {
	const { messages, contextWindow } = params;
	if (messages.length === 0) return params.previousSummary ?? DEFAULT_SUMMARY_FALLBACK;
	try {
		return await summarizeChunks(params);
	} catch (fullError) {
		log$1.warn(`Full summarization failed: ${formatErrorMessage(fullError)}`);
	}
	const smallMessages = [];
	const oversizedNotes = [];
	for (const msg of messages) if (isOversizedForSummary(msg, contextWindow)) {
		const role = msg.role ?? "message";
		const tokens = estimateCompactionMessageTokens(msg);
		oversizedNotes.push(`[Large ${role} (~${Math.round(tokens / 1e3)}K tokens) omitted from summary]`);
	} else smallMessages.push(msg);
	if (smallMessages.length > 0 && smallMessages.length !== messages.length) try {
		return await summarizeChunks({
			...params,
			messages: smallMessages
		}) + (oversizedNotes.length > 0 ? `\n\n${oversizedNotes.join("\n")}` : "");
	} catch (partialError) {
		log$1.warn(`Partial summarization also failed: ${formatErrorMessage(partialError)}`);
	}
	return `Context contained ${messages.length} messages (${oversizedNotes.length} oversized). Summary unavailable due to size limits.`;
}
async function summarizeInStages(params) {
	const { messages } = params;
	if (messages.length === 0) return params.previousSummary ?? DEFAULT_SUMMARY_FALLBACK;
	const minMessagesForSplit = Math.max(2, params.minMessagesForSplit ?? 4);
	const parts = normalizeParts(params.parts ?? DEFAULT_PARTS, messages.length);
	const totalTokens = estimateMessagesTokens(messages);
	if (parts <= 1 || messages.length < minMessagesForSplit || totalTokens <= params.maxChunkTokens) return summarizeWithFallback(params);
	const splits = splitMessagesByTokenShare(messages, parts).filter((chunk) => chunk.length > 0);
	if (splits.length <= 1) return summarizeWithFallback(params);
	const partialSummaries = [];
	for (const chunk of splits) partialSummaries.push(await summarizeWithFallback({
		...params,
		messages: chunk,
		previousSummary: void 0
	}));
	if (partialSummaries.length === 1) return partialSummaries[0];
	const summaryMessages = partialSummaries.map((summary) => ({
		role: "user",
		content: summary,
		timestamp: Date.now()
	}));
	const custom = params.customInstructions?.trim();
	const mergeInstructions = custom ? `${MERGE_SUMMARIES_INSTRUCTIONS}\n\n${custom}` : MERGE_SUMMARIES_INSTRUCTIONS;
	return summarizeWithFallback({
		...params,
		messages: summaryMessages,
		customInstructions: mergeInstructions
	});
}
function pruneHistoryForContextShare(params) {
	const maxHistoryShare = params.maxHistoryShare ?? .5;
	const budgetTokens = Math.max(1, Math.floor(params.maxContextTokens * maxHistoryShare));
	let keptMessages = params.messages;
	const allDroppedMessages = [];
	let droppedChunks = 0;
	let droppedMessages = 0;
	let droppedTokens = 0;
	const parts = normalizeParts(params.parts ?? DEFAULT_PARTS, keptMessages.length);
	while (keptMessages.length > 0 && estimateMessagesTokens(keptMessages) > budgetTokens) {
		const chunks = splitMessagesByTokenShare(keptMessages, parts);
		if (chunks.length <= 1) break;
		const [dropped, ...rest] = chunks;
		const repairReport = repairToolUseResultPairing(rest.flat());
		const repairedKept = repairReport.messages;
		const orphanedCount = repairReport.droppedOrphanCount;
		droppedChunks += 1;
		droppedMessages += dropped.length + orphanedCount;
		droppedTokens += estimateMessagesTokens(dropped);
		allDroppedMessages.push(...dropped);
		keptMessages = repairedKept;
	}
	return {
		messages: keptMessages,
		droppedMessagesList: allDroppedMessages,
		droppedChunks,
		droppedMessages,
		droppedTokens,
		keptTokens: estimateMessagesTokens(keptMessages),
		budgetTokens
	};
}
function resolveContextWindowTokens$1(model) {
	const effective = model?.contextTokens ?? model?.contextWindow;
	return Math.max(1, Math.floor(effective ?? 2e5));
}
/**
* Upper bound on custom instruction length to prevent prompt bloat.
* ~800 chars ≈ ~200 tokens — keeps summarization quality stable.
*/
const MAX_INSTRUCTION_LENGTH = 800;
function truncateUnicodeSafe(s, maxCodePoints) {
	const chars = Array.from(s);
	if (chars.length <= maxCodePoints) return s;
	return chars.slice(0, maxCodePoints).join("");
}
function normalize(s) {
	if (s == null) return;
	const trimmed = s.trim();
	return trimmed.length > 0 ? trimmed : void 0;
}
/**
* Resolve compaction instructions with precedence:
*   event (SDK) → runtime (config) → DEFAULT constant.
*
* Each input is normalized first (trim + empty→undefined) so that blank
* strings don't short-circuit the fallback chain.
*/
function resolveCompactionInstructions(eventInstructions, runtimeInstructions) {
	return truncateUnicodeSafe(normalize(eventInstructions) ?? normalize(runtimeInstructions) ?? "Write the summary body in the primary language used in the conversation.\nFocus on factual content: what was discussed, decisions made, and current state.\nKeep the required summary structure and section headers unchanged.\nDo not translate or alter code, file paths, identifiers, or error messages.", MAX_INSTRUCTION_LENGTH);
}
/**
* Compose split-turn instructions by combining the SDK's turn-prefix
* instructions with the resolved compaction instructions.
*/
function composeSplitTurnInstructions(turnPrefixInstructions, resolvedInstructions) {
	return [
		turnPrefixInstructions,
		"Additional requirements:",
		resolvedInstructions
	].join("\n\n");
}
//#endregion
//#region src/agents/pi-hooks/compaction-safeguard-quality.ts
const MAX_EXTRACTED_IDENTIFIERS = 12;
const MAX_UNTRUSTED_INSTRUCTION_CHARS = 4e3;
const MAX_ASK_OVERLAP_TOKENS = 12;
const MIN_ASK_OVERLAP_TOKENS_FOR_DOUBLE_MATCH = 3;
const REQUIRED_SUMMARY_SECTIONS = [
	"## Decisions",
	"## Open TODOs",
	"## Constraints/Rules",
	"## Pending user asks",
	"## Exact identifiers"
];
const STRICT_EXACT_IDENTIFIERS_INSTRUCTION = "For ## Exact identifiers, preserve literal values exactly as seen (IDs, URLs, file paths, ports, hashes, dates, times).";
const POLICY_OFF_EXACT_IDENTIFIERS_INSTRUCTION = "For ## Exact identifiers, include identifiers only when needed for continuity; do not enforce literal-preservation rules.";
function wrapUntrustedInstructionBlock(label, text) {
	return wrapUntrustedPromptDataBlock({
		label,
		text,
		maxChars: MAX_UNTRUSTED_INSTRUCTION_CHARS
	});
}
function resolveExactIdentifierSectionInstruction(summarizationInstructions) {
	const policy = summarizationInstructions?.identifierPolicy ?? "strict";
	if (policy === "off") return POLICY_OFF_EXACT_IDENTIFIERS_INSTRUCTION;
	if (policy === "custom") {
		const custom = summarizationInstructions?.identifierInstructions?.trim();
		if (custom) {
			const customBlock = wrapUntrustedInstructionBlock("For ## Exact identifiers, apply this operator-defined policy text", custom);
			if (customBlock) return customBlock;
		}
	}
	return STRICT_EXACT_IDENTIFIERS_INSTRUCTION;
}
function buildCompactionStructureInstructions(customInstructions, summarizationInstructions) {
	const identifierSectionInstruction = resolveExactIdentifierSectionInstruction(summarizationInstructions);
	const sectionsTemplate = [
		"Produce a compact, factual summary with these exact section headings:",
		...REQUIRED_SUMMARY_SECTIONS,
		identifierSectionInstruction,
		"Do not omit unresolved asks from the user.",
		"When prior compaction summaries are present, re-distill them with new messages and remove stale duplicate detail."
	].join("\n");
	const custom = customInstructions?.trim();
	if (!custom) return sectionsTemplate;
	const customBlock = wrapUntrustedInstructionBlock("Additional context from /compact", custom);
	if (!customBlock) return sectionsTemplate;
	return `${sectionsTemplate}\n\n${customBlock}`;
}
function normalizedSummaryLines(summary) {
	return summary.split(/\r?\n/u).map((line) => line.trim()).filter((line) => line.length > 0);
}
function hasRequiredSummarySections(summary) {
	const lines = normalizedSummaryLines(summary);
	let cursor = 0;
	for (const heading of REQUIRED_SUMMARY_SECTIONS) {
		const index = lines.findIndex((line, lineIndex) => lineIndex >= cursor && line === heading);
		if (index < 0) return false;
		cursor = index + 1;
	}
	return true;
}
function buildStructuredFallbackSummary(previousSummary, _summarizationInstructions) {
	const trimmedPreviousSummary = previousSummary?.trim() ?? "";
	if (trimmedPreviousSummary && hasRequiredSummarySections(trimmedPreviousSummary)) return trimmedPreviousSummary;
	return [
		"## Decisions",
		trimmedPreviousSummary || "No prior history.",
		"",
		"## Open TODOs",
		"None.",
		"",
		"## Constraints/Rules",
		"None.",
		"",
		"## Pending user asks",
		"None.",
		"",
		"## Exact identifiers",
		"None captured."
	].join("\n");
}
function appendSummarySection(summary, section) {
	if (!section) return summary;
	if (!summary.trim()) return section.trimStart();
	return `${summary}${section}`;
}
function sanitizeExtractedIdentifier(value) {
	return value.trim().replace(/^[("'`[{<]+/, "").replace(/[)\]"'`,;:.!?<>]+$/, "");
}
function isPureHexIdentifier(value) {
	return /^[A-Fa-f0-9]{8,}$/.test(value);
}
function normalizeOpaqueIdentifier(value) {
	return isPureHexIdentifier(value) ? value.toUpperCase() : value;
}
function summaryIncludesIdentifier(summary, identifier) {
	if (isPureHexIdentifier(identifier)) return summary.toUpperCase().includes(identifier.toUpperCase());
	return summary.includes(identifier);
}
function extractOpaqueIdentifiers(text) {
	const matches = text.match(/([A-Fa-f0-9]{8,}|https?:\/\/\S+|\/[\w.-]{2,}(?:\/[\w.-]+)+|[A-Za-z]:\\[\w\\.-]+|[A-Za-z0-9._-]+\.[A-Za-z0-9._/-]+:\d{1,5}|\b\d{6,}\b)/g) ?? [];
	return Array.from(new Set(matches.map((value) => sanitizeExtractedIdentifier(value)).map((value) => normalizeOpaqueIdentifier(value)).filter((value) => value.length >= 4))).slice(0, MAX_EXTRACTED_IDENTIFIERS);
}
function tokenizeAskOverlapText(text) {
	const normalized = localeLowercasePreservingWhitespace(text.normalize("NFKC")).trim();
	if (!normalized) return [];
	const keywords = extractKeywords(normalized);
	if (keywords.length > 0) return keywords;
	return normalized.split(/[^\p{L}\p{N}]+/u).map((token) => token.trim()).filter((token) => token.length > 0);
}
function hasAskOverlap(summary, latestAsk) {
	if (!latestAsk) return true;
	const askTokens = Array.from(new Set(tokenizeAskOverlapText(latestAsk))).slice(0, MAX_ASK_OVERLAP_TOKENS);
	if (askTokens.length === 0) return true;
	const meaningfulAskTokens = askTokens.filter((token) => {
		if (token.length <= 1) return false;
		if (isQueryStopWordToken(token)) return false;
		return true;
	});
	const tokensToCheck = meaningfulAskTokens.length > 0 ? meaningfulAskTokens : askTokens;
	if (tokensToCheck.length === 0) return true;
	const summaryTokens = new Set(tokenizeAskOverlapText(summary));
	let overlapCount = 0;
	for (const token of tokensToCheck) if (summaryTokens.has(token)) overlapCount += 1;
	const requiredMatches = tokensToCheck.length >= MIN_ASK_OVERLAP_TOKENS_FOR_DOUBLE_MATCH ? 2 : 1;
	return overlapCount >= requiredMatches;
}
function auditSummaryQuality(params) {
	const reasons = [];
	const lines = new Set(normalizedSummaryLines(params.summary));
	for (const section of REQUIRED_SUMMARY_SECTIONS) if (!lines.has(section)) reasons.push(`missing_section:${section}`);
	if ((params.identifierPolicy ?? "strict") === "strict") {
		const missingIdentifiers = params.identifiers.filter((identifier) => !summaryIncludesIdentifier(params.summary, identifier));
		if (missingIdentifiers.length > 0) reasons.push(`missing_identifiers:${missingIdentifiers.slice(0, 3).join(",")}`);
	}
	if (!hasAskOverlap(params.summary, params.latestAsk)) reasons.push("latest_user_ask_not_reflected");
	return {
		ok: reasons.length === 0,
		reasons
	};
}
//#endregion
//#region src/agents/pi-hooks/compaction-safeguard.ts
const log = createSubsystemLogger("compaction-safeguard");
const missedModelWarningSessions = /* @__PURE__ */ new WeakSet();
const TURN_PREFIX_INSTRUCTIONS = "This summary covers the prefix of a split turn. Focus on the original request, early progress, and any details needed to understand the retained suffix.";
const MAX_TOOL_FAILURES = 8;
const MAX_TOOL_FAILURE_CHARS = 240;
const MAX_COMPACTION_SUMMARY_CHARS = 16e3;
const MAX_FILE_OPS_SECTION_CHARS = 2e3;
const MAX_FILE_OPS_LIST_CHARS = 900;
const SUMMARY_TRUNCATED_MARKER = "\n\n[Compaction summary truncated to fit budget]";
const DEFAULT_RECENT_TURNS_PRESERVE = 3;
const DEFAULT_QUALITY_GUARD_MAX_RETRIES = 1;
const MAX_RECENT_TURNS_PRESERVE = 12;
const MAX_QUALITY_GUARD_MAX_RETRIES = 3;
const MAX_RECENT_TURN_TEXT_CHARS = 600;
const PREVIOUS_SUMMARY_REDISTILL_PREFIX = "Previous compaction summary to re-distill with the current conversation. Prune stale, duplicate, or superseded details instead of preserving it verbatim.";
const compactionSafeguardDeps = { summarizeInStages };
function buildPreviousSummaryMessage(previousSummary) {
	return {
		role: "user",
		content: [{
			type: "text",
			text: `<previous-compaction-summary>\n${PREVIOUS_SUMMARY_REDISTILL_PREFIX}\n\n${previousSummary.trim()}\n</previous-compaction-summary>`
		}],
		timestamp: 0
	};
}
function prependPreviousSummaryForRedistill(params) {
	const previousSummary = params.previousSummary?.trim();
	if (!previousSummary) return params.messages;
	return [buildPreviousSummaryMessage(previousSummary), ...params.messages];
}
/**
* Attempt provider-based summarization. Returns the summary string on success,
* or `undefined` when the caller should fall back to built-in LLM summarization.
* Rethrows abort/timeout errors so cancellation is always respected.
*/
async function tryProviderSummarize(provider, params) {
	try {
		const result = await provider.summarize(params);
		if (typeof result === "string" && result.trim()) return result;
		log.warn(`Compaction provider "${provider.id}" returned empty result, falling back to LLM.`);
		return;
	} catch (err) {
		if (isAbortError(err) || isTimeoutError(err)) throw err;
		log.warn(`Compaction provider "${provider.id}" failed, falling back to LLM: ${err instanceof Error ? err.message : String(err)}`);
		return;
	}
}
/**
* Summarize via the built-in LLM pipeline (summarizeInStages).
* Only called when no compaction provider is available or the provider failed.
*/
async function summarizeViaLLM(params) {
	const messages = prependPreviousSummaryForRedistill({
		messages: params.messages,
		previousSummary: params.previousSummary
	});
	return compactionSafeguardDeps.summarizeInStages({
		messages,
		model: params.model,
		apiKey: params.apiKey,
		headers: params.headers,
		signal: params.signal,
		reserveTokens: params.reserveTokens,
		maxChunkTokens: params.maxChunkTokens,
		contextWindow: params.contextWindow,
		customInstructions: params.customInstructions,
		summarizationInstructions: params.summarizationInstructions,
		previousSummary: void 0
	});
}
/**
* Build the reserved suffix that follows the summary body. Both the provider
* and LLM paths use this so diagnostic sections survive truncation.
*/
function assembleSuffix(parts) {
	let suffix = "";
	suffix = appendSummarySection(suffix, parts.splitTurnSection ?? "");
	suffix = appendSummarySection(suffix, parts.preservedTurnsSection ?? "");
	suffix = appendSummarySection(suffix, parts.toolFailureSection ?? "");
	suffix = appendSummarySection(suffix, parts.fileOpsSummary ?? "");
	suffix = appendSummarySection(suffix, parts.workspaceContext ?? "");
	if (suffix && !/^\s/.test(suffix)) suffix = `\n\n${suffix}`;
	return suffix;
}
/**
* Resolve model credentials. Returns auth details on success or a cancel reason on failure.
* Extracted to keep the main handler readable when model/auth is conditional.
*/
async function resolveModelAuth(ctx, model) {
	let requestAuth;
	try {
		const modelRegistry = ctx.modelRegistry;
		if (typeof modelRegistry.getApiKeyAndHeaders !== "function") throw new Error("model registry auth lookup unavailable");
		requestAuth = await modelRegistry.getApiKeyAndHeaders(model);
	} catch (err) {
		const error = formatErrorMessage(err);
		log.warn(`Compaction safeguard: request credentials unavailable; cancelling compaction. ${error}`);
		return {
			ok: false,
			reason: `Compaction safeguard could not resolve request credentials for ${model.provider}/${model.id}: ${error}`
		};
	}
	if (!requestAuth.ok) {
		log.warn(`Compaction safeguard: request credential resolution failed for ${model.provider}/${model.id}: ${requestAuth.error}`);
		return {
			ok: false,
			reason: `Compaction safeguard could not resolve request credentials for ${model.provider}/${model.id}: ${requestAuth.error}`
		};
	}
	if (!requestAuth.apiKey && !requestAuth.headers) {
		log.warn("Compaction safeguard: no request credentials available; cancelling compaction to preserve history.");
		return {
			ok: false,
			reason: `Compaction safeguard could not resolve request credentials for ${model.provider}/${model.id}.`
		};
	}
	return {
		ok: true,
		apiKey: requestAuth.apiKey,
		headers: requestAuth.headers
	};
}
function buildCompactionSummaryHeaders(params) {
	if (params.model.provider !== "github-copilot") return params.headers;
	const messages = params.messages;
	return {
		...buildCopilotDynamicHeaders({
			messages,
			hasImages: hasCopilotVisionInput(messages)
		}),
		...params.headers
	};
}
function clampNonNegativeInt(value, fallback) {
	return Math.max(0, Math.floor(typeof value === "number" && Number.isFinite(value) ? value : fallback));
}
function resolveRecentTurnsPreserve(value) {
	return Math.min(MAX_RECENT_TURNS_PRESERVE, clampNonNegativeInt(value, DEFAULT_RECENT_TURNS_PRESERVE));
}
function resolveQualityGuardMaxRetries(value) {
	return Math.min(MAX_QUALITY_GUARD_MAX_RETRIES, clampNonNegativeInt(value, DEFAULT_QUALITY_GUARD_MAX_RETRIES));
}
function normalizeFailureText(text) {
	return text.replace(/\s+/g, " ").trim();
}
function truncateFailureText(text, maxChars) {
	if (text.length <= maxChars) return text;
	return `${text.slice(0, Math.max(0, maxChars - 3))}...`;
}
function formatToolFailureMeta(details) {
	if (!details || typeof details !== "object") return;
	const record = details;
	const status = typeof record.status === "string" ? record.status : void 0;
	const exitCode = typeof record.exitCode === "number" && Number.isFinite(record.exitCode) ? record.exitCode : void 0;
	const parts = [];
	if (status) parts.push(`status=${status}`);
	if (exitCode !== void 0) parts.push(`exitCode=${exitCode}`);
	return parts.length > 0 ? parts.join(" ") : void 0;
}
function extractToolResultText(content) {
	return collectTextContentBlocks(content).join("\n");
}
function collectToolFailures(messages) {
	const failures = [];
	const seen = /* @__PURE__ */ new Set();
	for (const message of messages) {
		if (!message || typeof message !== "object") continue;
		if (message.role !== "toolResult") continue;
		const toolResult = message;
		if (toolResult.isError !== true) continue;
		const toolCallId = typeof toolResult.toolCallId === "string" ? toolResult.toolCallId : "";
		if (!toolCallId || seen.has(toolCallId)) continue;
		seen.add(toolCallId);
		const toolName = typeof toolResult.toolName === "string" && toolResult.toolName.trim() ? toolResult.toolName : "tool";
		const rawText = extractToolResultText(toolResult.content);
		const meta = formatToolFailureMeta(toolResult.details);
		const summary = truncateFailureText(normalizeFailureText(rawText) || (meta ? "failed" : "failed (no output)"), MAX_TOOL_FAILURE_CHARS);
		failures.push({
			toolCallId,
			toolName,
			summary,
			meta
		});
	}
	return failures;
}
function formatToolFailuresSection(failures) {
	if (failures.length === 0) return "";
	const lines = failures.slice(0, MAX_TOOL_FAILURES).map((failure) => {
		const meta = failure.meta ? ` (${failure.meta})` : "";
		return `- ${failure.toolName}${meta}: ${failure.summary}`;
	});
	if (failures.length > MAX_TOOL_FAILURES) lines.push(`- ...and ${failures.length - MAX_TOOL_FAILURES} more`);
	return `\n\n## Tool Failures\n${lines.join("\n")}`;
}
function computeFileLists(fileOps) {
	const modified = new Set([...fileOps.edited, ...fileOps.written]);
	return {
		readFiles: [...fileOps.read].filter((f) => !modified.has(f)).toSorted(),
		modifiedFiles: [...modified].toSorted()
	};
}
function formatFileOperations(readFiles, modifiedFiles) {
	function formatBoundedFileList(tag, files, maxChars) {
		if (files.length === 0 || maxChars <= 0) return "";
		const openTag = `<${tag}>\n`;
		const closeTag = `\n</${tag}>`;
		const lines = [];
		let usedChars = openTag.length + closeTag.length;
		for (let i = 0; i < files.length; i++) {
			const line = `${files[i]}\n`;
			const remaining = files.length - i - 1;
			const overflowLine = remaining > 0 ? `...and ${remaining} more\n` : "";
			if (usedChars + line.length + overflowLine.length > maxChars) {
				const overflow = `...and ${files.length - i} more\n`;
				if (usedChars + overflow.length <= maxChars) lines.push(overflow);
				break;
			}
			lines.push(line);
			usedChars += line.length;
		}
		return lines.length > 0 ? `${openTag}${lines.join("")}${closeTag}` : "";
	}
	const sections = [];
	const readSection = formatBoundedFileList("read-files", readFiles, MAX_FILE_OPS_LIST_CHARS);
	const modifiedSection = formatBoundedFileList("modified-files", modifiedFiles, MAX_FILE_OPS_LIST_CHARS);
	if (readSection) sections.push(readSection);
	if (modifiedSection) sections.push(modifiedSection);
	if (sections.length === 0) return "";
	return capCompactionSummary(`\n\n${sections.join("\n\n")}`, MAX_FILE_OPS_SECTION_CHARS);
}
function capCompactionSummary(summary, maxChars = MAX_COMPACTION_SUMMARY_CHARS) {
	if (maxChars <= 0 || summary.length <= maxChars) return summary;
	const marker = SUMMARY_TRUNCATED_MARKER;
	const budget = Math.max(0, maxChars - 46);
	if (budget <= 0) return summary.slice(0, maxChars);
	return `${summary.slice(0, budget)}${marker}`;
}
function capCompactionSummaryPreservingSuffix(summaryBody, suffix, maxChars = MAX_COMPACTION_SUMMARY_CHARS) {
	if (!suffix) return capCompactionSummary(summaryBody, maxChars);
	if (maxChars <= 0) return capCompactionSummary(`${summaryBody}${suffix}`, maxChars);
	if (suffix.length >= maxChars) return suffix.slice(-maxChars);
	return `${capCompactionSummary(summaryBody, Math.max(0, maxChars - suffix.length))}${suffix}`;
}
function extractMessageText(message) {
	const content = message.content;
	if (typeof content === "string") return content.trim();
	if (!Array.isArray(content)) return "";
	const parts = [];
	for (const block of content) {
		if (!block || typeof block !== "object") continue;
		const text = block.text;
		if (typeof text === "string" && text.trim().length > 0) parts.push(text.trim());
	}
	return parts.join("\n").trim();
}
function formatNonTextPlaceholder(content) {
	if (content === null || content === void 0) return null;
	if (typeof content === "string") return null;
	if (!Array.isArray(content)) return "[non-text content]";
	const typeCounts = /* @__PURE__ */ new Map();
	for (const block of content) {
		if (!block || typeof block !== "object") continue;
		const typeRaw = block.type;
		const type = typeof typeRaw === "string" && typeRaw.trim().length > 0 ? typeRaw : "unknown";
		if (type === "text") continue;
		typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
	}
	if (typeCounts.size === 0) return null;
	return `[non-text content: ${[...typeCounts.entries()].map(([type, count]) => count > 1 ? `${type} x${count}` : type).join(", ")}]`;
}
function splitPreservedRecentTurns(params) {
	const preserveTurns = Math.min(MAX_RECENT_TURNS_PRESERVE, clampNonNegativeInt(params.recentTurnsPreserve, 0));
	if (preserveTurns <= 0) return {
		summarizableMessages: params.messages,
		preservedMessages: []
	};
	const conversationIndexes = [];
	const userIndexes = [];
	for (let i = 0; i < params.messages.length; i += 1) {
		const role = params.messages[i].role;
		if (role === "user" || role === "assistant") {
			conversationIndexes.push(i);
			if (role === "user") userIndexes.push(i);
		}
	}
	if (conversationIndexes.length === 0) return {
		summarizableMessages: params.messages,
		preservedMessages: []
	};
	const preservedIndexSet = /* @__PURE__ */ new Set();
	if (userIndexes.length >= preserveTurns) {
		const boundaryStartIndex = userIndexes[userIndexes.length - preserveTurns] ?? -1;
		if (boundaryStartIndex >= 0) {
			for (const index of conversationIndexes) if (index >= boundaryStartIndex) preservedIndexSet.add(index);
		}
	} else {
		const fallbackMessageCount = preserveTurns * 2;
		for (const userIndex of userIndexes) preservedIndexSet.add(userIndex);
		for (let i = conversationIndexes.length - 1; i >= 0; i -= 1) {
			const index = conversationIndexes[i];
			if (index === void 0) continue;
			preservedIndexSet.add(index);
			if (preservedIndexSet.size >= fallbackMessageCount) break;
		}
	}
	if (preservedIndexSet.size === 0) return {
		summarizableMessages: params.messages,
		preservedMessages: []
	};
	const preservedToolCallIds = /* @__PURE__ */ new Set();
	for (let i = 0; i < params.messages.length; i += 1) {
		if (!preservedIndexSet.has(i)) continue;
		const message = params.messages[i];
		if (message.role !== "assistant") continue;
		const toolCalls = extractToolCallsFromAssistant(message);
		for (const toolCall of toolCalls) preservedToolCallIds.add(toolCall.id);
	}
	if (preservedToolCallIds.size > 0) {
		let preservedStartIndex = -1;
		for (let i = 0; i < params.messages.length; i += 1) if (preservedIndexSet.has(i)) {
			preservedStartIndex = i;
			break;
		}
		if (preservedStartIndex >= 0) for (let i = preservedStartIndex; i < params.messages.length; i += 1) {
			const message = params.messages[i];
			if (message.role !== "toolResult") continue;
			const toolResultId = extractToolResultId(message);
			if (toolResultId && preservedToolCallIds.has(toolResultId)) preservedIndexSet.add(i);
		}
	}
	return {
		summarizableMessages: repairToolUseResultPairing(params.messages.filter((_, idx) => !preservedIndexSet.has(idx))).messages,
		preservedMessages: params.messages.filter((_, idx) => preservedIndexSet.has(idx)).filter((msg) => {
			const role = msg.role;
			return role === "user" || role === "assistant" || role === "toolResult";
		})
	};
}
function formatContextMessages(messages) {
	return messages.map((message) => {
		let roleLabel;
		if (message.role === "assistant") roleLabel = "Assistant";
		else if (message.role === "user") roleLabel = "User";
		else if (message.role === "toolResult") {
			const toolName = message.toolName;
			roleLabel = `Tool result (${typeof toolName === "string" && toolName.trim() ? toolName : "tool"})`;
		} else return null;
		const text = extractMessageText(message);
		const nonTextPlaceholder = formatNonTextPlaceholder(message.content);
		const rendered = text && nonTextPlaceholder ? `${text}\n${nonTextPlaceholder}` : text || nonTextPlaceholder;
		if (!rendered) return null;
		const trimmed = rendered.length > MAX_RECENT_TURN_TEXT_CHARS ? `${rendered.slice(0, MAX_RECENT_TURN_TEXT_CHARS)}...` : rendered;
		return `- ${roleLabel}: ${trimmed}`;
	}).filter((line) => Boolean(line));
}
function formatPreservedTurnsSection(messages) {
	if (messages.length === 0) return "";
	const lines = formatContextMessages(messages);
	if (lines.length === 0) return "";
	return `\n\n## Recent turns preserved verbatim\n${lines.join("\n")}`;
}
function formatSplitTurnContextSection(messages) {
	if (messages.length === 0) return "";
	const lines = formatContextMessages(messages);
	if (lines.length === 0) return "";
	return `**Turn Context (split turn):**\n\n${lines.join("\n")}`;
}
function extractLatestUserAsk(messages) {
	for (let i = messages.length - 1; i >= 0; i -= 1) {
		const message = messages[i];
		if (message.role !== "user") continue;
		const text = extractMessageText(message);
		if (text) return text;
	}
	return null;
}
/**
* Read and format critical workspace context for compaction summary.
* Extracts "Session Startup" and "Red Lines" from AGENTS.md.
* Falls back to legacy names "Every Session" and "Safety".
* Limited to 2000 chars to avoid bloating the summary.
*/
async function readWorkspaceContextForSummary() {
	const MAX_SUMMARY_CONTEXT_CHARS = 2e3;
	const workspaceDir = process.cwd();
	const agentsPath = path.join(workspaceDir, "AGENTS.md");
	try {
		const opened = await openBoundaryFile({
			absolutePath: agentsPath,
			rootPath: workspaceDir,
			boundaryLabel: "workspace root"
		});
		if (!opened.ok) return "";
		const content = (() => {
			try {
				return fs.readFileSync(opened.fd, "utf-8");
			} finally {
				fs.closeSync(opened.fd);
			}
		})();
		let sections = extractSections(content, ["Session Startup", "Red Lines"]);
		if (sections.length === 0) sections = extractSections(content, ["Every Session", "Safety"]);
		if (sections.length === 0) return "";
		const combined = sections.join("\n\n");
		return `\n\n<workspace-critical-rules>\n${combined.length > MAX_SUMMARY_CONTEXT_CHARS ? combined.slice(0, MAX_SUMMARY_CONTEXT_CHARS) + "\n...[truncated]..." : combined}\n</workspace-critical-rules>`;
	} catch {
		return "";
	}
}
function compactionSafeguardExtension(api) {
	api.on("session_before_compact", async (event, ctx) => {
		const { preparation, customInstructions: eventInstructions, signal } = event;
		const hasRealSummarizable = preparation.messagesToSummarize.some((message, index, messages) => isRealConversationMessage(message, messages, index));
		const hasRealTurnPrefix = preparation.turnPrefixMessages.some((message, index, messages) => isRealConversationMessage(message, messages, index));
		setCompactionSafeguardCancelReason(ctx.sessionManager, void 0);
		if (!hasRealSummarizable && !hasRealTurnPrefix) {
			log.info("Compaction safeguard: no real conversation messages to summarize; writing compaction boundary to suppress re-trigger loop.");
			return { compaction: {
				summary: buildStructuredFallbackSummary(preparation.previousSummary),
				firstKeptEntryId: preparation.firstKeptEntryId,
				tokensBefore: preparation.tokensBefore
			} };
		}
		const { readFiles, modifiedFiles } = computeFileLists(preparation.fileOps);
		const fileOpsSummary = formatFileOperations(readFiles, modifiedFiles);
		const toolFailureSection = formatToolFailuresSection(collectToolFailures([...preparation.messagesToSummarize, ...preparation.turnPrefixMessages]));
		const runtime = getCompactionSafeguardRuntime(ctx.sessionManager);
		const customInstructions = resolveCompactionInstructions(eventInstructions, runtime?.customInstructions);
		const summarizationInstructions = {
			identifierPolicy: runtime?.identifierPolicy,
			identifierInstructions: runtime?.identifierInstructions
		};
		const identifierPolicy = runtime?.identifierPolicy ?? "strict";
		const providerId = runtime?.provider;
		const turnPrefixMessages = preparation.turnPrefixMessages ?? [];
		const recentTurnsPreserve = resolveRecentTurnsPreserve(runtime?.recentTurnsPreserve);
		const { preservedMessages: providerPreservedMessages } = splitPreservedRecentTurns({
			messages: preparation.messagesToSummarize,
			recentTurnsPreserve
		});
		const preservedTurnsSection = formatPreservedTurnsSection(providerPreservedMessages);
		const splitTurnSection = preparation.isSplitTurn ? formatSplitTurnContextSection(turnPrefixMessages) : "";
		const structuredInstructions = buildCompactionStructureInstructions(customInstructions, summarizationInstructions);
		if (providerId) {
			const compactionProvider = getCompactionProvider(providerId);
			if (compactionProvider) try {
				const providerResult = await tryProviderSummarize(compactionProvider, {
					messages: [...preparation.messagesToSummarize, ...preparation.turnPrefixMessages ?? []],
					signal,
					customInstructions: structuredInstructions,
					summarizationInstructions,
					previousSummary: preparation.previousSummary
				});
				if (providerResult !== void 0) return { compaction: {
					summary: capCompactionSummaryPreservingSuffix(providerResult, assembleSuffix({
						splitTurnSection,
						preservedTurnsSection,
						toolFailureSection,
						fileOpsSummary,
						workspaceContext: await readWorkspaceContextForSummary()
					})),
					firstKeptEntryId: preparation.firstKeptEntryId,
					tokensBefore: preparation.tokensBefore,
					details: {
						readFiles,
						modifiedFiles
					}
				} };
				log.info("Compaction provider did not produce a result; falling back to LLM path.");
			} catch (err) {
				if (isAbortError(err) || isTimeoutError(err)) throw err;
				log.warn(`Compaction provider path failed unexpectedly: ${err instanceof Error ? err.message : String(err)}`);
			}
			else log.warn(`Compaction provider "${providerId}" is configured but not registered. Falling back to LLM.`);
		}
		const model = ctx.model ?? runtime?.model;
		if (!model) {
			if (!ctx.model && !runtime?.model && !missedModelWarningSessions.has(ctx.sessionManager)) {
				missedModelWarningSessions.add(ctx.sessionManager);
				log.warn("[compaction-safeguard] Both ctx.model and runtime.model are undefined. Compaction summarization will not run. This indicates extensionRunner.initialize() was not called and model was not passed through runtime registry.");
			}
			setCompactionSafeguardCancelReason(ctx.sessionManager, "Compaction safeguard could not resolve a summarization model.");
			return { cancel: true };
		}
		const authResult = await resolveModelAuth(ctx, model);
		if (!authResult.ok) {
			setCompactionSafeguardCancelReason(ctx.sessionManager, authResult.reason);
			return { cancel: true };
		}
		const apiKey = authResult.apiKey ?? "";
		const authHeaders = authResult.headers;
		try {
			const modelContextWindow = resolveContextWindowTokens$1(model);
			const contextWindowTokens = runtime?.contextWindowTokens ?? modelContextWindow;
			let messagesToSummarize = preparation.messagesToSummarize;
			const headers = buildCompactionSummaryHeaders({
				model,
				messages: messagesToSummarize,
				headers: authHeaders
			});
			const qualityGuardEnabled = runtime?.qualityGuardEnabled ?? false;
			const qualityGuardMaxRetries = resolveQualityGuardMaxRetries(runtime?.qualityGuardMaxRetries);
			const maxHistoryShare = runtime?.maxHistoryShare ?? .5;
			const tokensBefore = typeof preparation.tokensBefore === "number" && Number.isFinite(preparation.tokensBefore) ? preparation.tokensBefore : void 0;
			let droppedSummary;
			if (tokensBefore !== void 0) {
				const summarizableTokens = estimateMessagesTokens(messagesToSummarize) + estimateMessagesTokens(turnPrefixMessages);
				const newContentTokens = Math.max(0, Math.floor(tokensBefore - summarizableTokens));
				if (newContentTokens > Math.floor(contextWindowTokens * maxHistoryShare * 1.2)) {
					const pruned = pruneHistoryForContextShare({
						messages: messagesToSummarize,
						maxContextTokens: contextWindowTokens,
						maxHistoryShare,
						parts: 2
					});
					if (pruned.droppedChunks > 0) {
						const newContentRatio = newContentTokens / contextWindowTokens * 100;
						log.warn(`Compaction safeguard: new content uses ${newContentRatio.toFixed(1)}% of context; dropped ${pruned.droppedChunks} older chunk(s) (${pruned.droppedMessages} messages) to fit history budget.`);
						messagesToSummarize = pruned.messages;
						if (pruned.droppedMessagesList.length > 0) try {
							const droppedChunkRatio = computeAdaptiveChunkRatio(pruned.droppedMessagesList, contextWindowTokens);
							const droppedMaxChunkTokens = Math.max(1, Math.floor(contextWindowTokens * droppedChunkRatio) - SUMMARIZATION_OVERHEAD_TOKENS);
							droppedSummary = await summarizeViaLLM({
								messages: pruned.droppedMessagesList,
								model,
								apiKey,
								headers,
								signal,
								reserveTokens: Math.max(1, Math.floor(preparation.settings.reserveTokens)),
								maxChunkTokens: droppedMaxChunkTokens,
								contextWindow: contextWindowTokens,
								customInstructions: structuredInstructions,
								summarizationInstructions,
								previousSummary: preparation.previousSummary
							});
						} catch (droppedError) {
							log.warn(`Compaction safeguard: failed to summarize dropped messages, continuing without: ${formatErrorMessage(droppedError)}`);
						}
					}
				}
			}
			const { summarizableMessages: summaryTargetMessages, preservedMessages: preservedRecentMessages } = splitPreservedRecentTurns({
				messages: messagesToSummarize,
				recentTurnsPreserve
			});
			messagesToSummarize = summaryTargetMessages;
			const preservedTurnsSection = formatPreservedTurnsSection(preservedRecentMessages);
			const latestUserAsk = extractLatestUserAsk([...messagesToSummarize, ...turnPrefixMessages]);
			const identifiers = extractOpaqueIdentifiers([...messagesToSummarize, ...turnPrefixMessages].slice(-10).map((message) => extractMessageText(message)).filter(Boolean).join("\n"));
			const adaptiveRatio = computeAdaptiveChunkRatio([...messagesToSummarize, ...turnPrefixMessages], contextWindowTokens);
			const maxChunkTokens = Math.max(1, Math.floor(contextWindowTokens * adaptiveRatio) - SUMMARIZATION_OVERHEAD_TOKENS);
			const reserveTokens = Math.max(1, Math.floor(preparation.settings.reserveTokens));
			const effectivePreviousSummary = droppedSummary ?? preparation.previousSummary;
			let summary = "";
			let lastHistorySummary = "";
			let lastSplitTurnSection = "";
			let currentInstructions = structuredInstructions;
			const totalAttempts = qualityGuardEnabled ? qualityGuardMaxRetries + 1 : 1;
			let lastSuccessfulSummary = null;
			for (let attempt = 0; attempt < totalAttempts; attempt += 1) {
				let summaryWithoutPreservedTurns = "";
				let summaryWithPreservedTurns = "";
				let splitTurnSection = "";
				let historySummary = "";
				try {
					historySummary = messagesToSummarize.length > 0 ? await summarizeViaLLM({
						messages: messagesToSummarize,
						model,
						apiKey,
						headers,
						signal,
						reserveTokens,
						maxChunkTokens,
						contextWindow: contextWindowTokens,
						customInstructions: currentInstructions,
						summarizationInstructions,
						previousSummary: effectivePreviousSummary
					}) : buildStructuredFallbackSummary(effectivePreviousSummary, summarizationInstructions);
					summaryWithoutPreservedTurns = historySummary;
					if (preparation.isSplitTurn && turnPrefixMessages.length > 0) {
						splitTurnSection = `**Turn Context (split turn):**\n\n${await summarizeViaLLM({
							messages: turnPrefixMessages,
							model,
							apiKey,
							headers,
							signal,
							reserveTokens,
							maxChunkTokens,
							contextWindow: contextWindowTokens,
							customInstructions: composeSplitTurnInstructions(TURN_PREFIX_INSTRUCTIONS, currentInstructions),
							summarizationInstructions,
							previousSummary: void 0
						})}`;
						summaryWithoutPreservedTurns = historySummary.trim() ? `${historySummary}\n\n---\n\n${splitTurnSection}` : splitTurnSection;
					}
					summaryWithPreservedTurns = appendSummarySection(summaryWithoutPreservedTurns, preservedTurnsSection);
				} catch (attemptError) {
					if (lastSuccessfulSummary && attempt > 0) {
						log.warn(`Compaction safeguard: quality retry failed on attempt ${attempt + 1}; keeping last successful summary: ${formatErrorMessage(attemptError)}`);
						summary = lastSuccessfulSummary;
						break;
					}
					throw attemptError;
				}
				lastSuccessfulSummary = summaryWithPreservedTurns;
				lastHistorySummary = historySummary;
				lastSplitTurnSection = splitTurnSection;
				const canRegenerate = messagesToSummarize.length > 0 || preparation.isSplitTurn && turnPrefixMessages.length > 0;
				if (!qualityGuardEnabled || !canRegenerate) {
					summary = summaryWithPreservedTurns;
					break;
				}
				const quality = auditSummaryQuality({
					summary: summaryWithoutPreservedTurns,
					identifiers,
					latestAsk: latestUserAsk,
					identifierPolicy
				});
				summary = summaryWithPreservedTurns;
				if (quality.ok || attempt >= totalAttempts - 1) break;
				const reasons = quality.reasons.join(", ");
				const qualityFeedbackInstruction = identifierPolicy === "strict" ? "Fix all issues and include every required section with exact identifiers preserved." : "Fix all issues and include every required section while following the configured identifier policy.";
				const qualityFeedbackReasons = wrapUntrustedInstructionBlock("Quality check feedback", `Previous summary failed quality checks (${reasons}).`);
				currentInstructions = qualityFeedbackReasons ? `${structuredInstructions}\n\n${qualityFeedbackInstruction}\n\n${qualityFeedbackReasons}` : `${structuredInstructions}\n\n${qualityFeedbackInstruction}`;
			}
			const workspaceContext = await readWorkspaceContextForSummary();
			const suffix = assembleSuffix({
				splitTurnSection: lastSplitTurnSection,
				preservedTurnsSection,
				toolFailureSection,
				fileOpsSummary,
				workspaceContext
			});
			summary = capCompactionSummaryPreservingSuffix(lastHistorySummary || summary, suffix);
			return { compaction: {
				summary,
				firstKeptEntryId: preparation.firstKeptEntryId,
				tokensBefore: preparation.tokensBefore,
				details: {
					readFiles,
					modifiedFiles
				}
			} };
		} catch (error) {
			const message = formatErrorMessage(error);
			log.warn(`Compaction summarization failed; cancelling compaction to preserve history: ${message}`);
			setCompactionSafeguardCancelReason(ctx.sessionManager, `Compaction safeguard could not summarize the session: ${message}`);
			return { cancel: true };
		}
	});
}
//#endregion
//#region src/agents/pi-hooks/context-pruning/tools.ts
function normalizeGlob(value) {
	return normalizeLowercaseStringOrEmpty(value ?? "");
}
function makeToolPrunablePredicate(match) {
	const deny = compileGlobPatterns({
		raw: match.deny,
		normalize: normalizeGlob
	});
	const allow = compileGlobPatterns({
		raw: match.allow,
		normalize: normalizeGlob
	});
	return (toolName) => {
		const normalized = normalizeGlob(toolName);
		if (matchesAnyGlobPattern(normalized, deny)) return false;
		if (allow.length === 0) return true;
		return matchesAnyGlobPattern(normalized, allow);
	};
}
//#endregion
//#region src/agents/pi-hooks/context-pruning/pruner.ts
const IMAGE_CHAR_ESTIMATE = 8e3;
const PRUNED_CONTEXT_IMAGE_MARKER = "[image removed during context pruning]";
function asText(text) {
	return {
		type: "text",
		text
	};
}
function serializeMalformedTextBlock(block) {
	try {
		const serialized = JSON.stringify(block);
		return typeof serialized === "string" ? serialized : "[malformed text block]";
	} catch {
		return "[malformed text block]";
	}
}
function coerceTextBlock(block) {
	if (!block || typeof block !== "object") return null;
	if (block.type !== "text") return null;
	const text = block.text;
	return typeof text === "string" ? text : serializeMalformedTextBlock(block);
}
function isImageBlock(block) {
	return !!block && typeof block === "object" && block.type === "image";
}
function collectTextSegments(content) {
	const parts = [];
	for (const block of content) {
		const text = coerceTextBlock(block);
		if (text !== null) parts.push(text);
	}
	return parts;
}
function collectPrunableToolResultSegments(content) {
	const parts = [];
	for (const block of content) {
		const text = coerceTextBlock(block);
		if (text !== null) {
			parts.push(text);
			continue;
		}
		if (isImageBlock(block)) parts.push(PRUNED_CONTEXT_IMAGE_MARKER);
	}
	return parts;
}
function estimateJoinedTextLength(parts) {
	if (parts.length === 0) return 0;
	let len = 0;
	for (const p of parts) len += p.length;
	len += Math.max(0, parts.length - 1);
	return len;
}
function takeHeadFromJoinedText(parts, maxChars) {
	if (maxChars <= 0 || parts.length === 0) return "";
	let remaining = maxChars;
	let out = "";
	for (let i = 0; i < parts.length && remaining > 0; i++) {
		if (i > 0) {
			out += "\n";
			remaining -= 1;
			if (remaining <= 0) break;
		}
		const p = parts[i];
		if (p.length <= remaining) {
			out += p;
			remaining -= p.length;
		} else {
			out += p.slice(0, remaining);
			remaining = 0;
		}
	}
	return out;
}
function takeTailFromJoinedText(parts, maxChars) {
	if (maxChars <= 0 || parts.length === 0) return "";
	let remaining = maxChars;
	const out = [];
	for (let i = parts.length - 1; i >= 0 && remaining > 0; i--) {
		const p = parts[i];
		if (p.length <= remaining) {
			out.push(p);
			remaining -= p.length;
		} else {
			out.push(p.slice(p.length - remaining));
			remaining = 0;
			break;
		}
		if (remaining > 0 && i > 0) {
			out.push("\n");
			remaining -= 1;
		}
	}
	out.reverse();
	return out.join("");
}
function hasImageBlocks(content) {
	for (const block of content) if (isImageBlock(block)) return true;
	return false;
}
function estimateWeightedTextChars(text) {
	return estimateStringChars(text);
}
function estimateTextAndImageChars(content) {
	let chars = 0;
	for (const block of content) {
		const text = coerceTextBlock(block);
		if (text !== null) {
			chars += estimateWeightedTextChars(text);
			continue;
		}
		if (isImageBlock(block)) chars += IMAGE_CHAR_ESTIMATE;
	}
	return chars;
}
function estimateMessageChars(message) {
	if (message.role === "user") {
		const content = message.content;
		if (typeof content === "string") return estimateWeightedTextChars(content);
		return estimateTextAndImageChars(content);
	}
	if (message.role === "assistant") {
		let chars = 0;
		for (const b of message.content) {
			if (!b || typeof b !== "object") continue;
			if (b.type === "text" && typeof b.text === "string") chars += estimateWeightedTextChars(b.text);
			const blockType = b.type;
			if (blockType === "thinking" || blockType === "redacted_thinking") {
				const thinking = b.thinking;
				if (typeof thinking === "string") chars += estimateWeightedTextChars(thinking);
				const data = b.data;
				if (blockType === "redacted_thinking" && typeof data === "string") chars += estimateWeightedTextChars(data);
				const signature = b.thinkingSignature;
				if (typeof signature === "string") chars += estimateWeightedTextChars(signature);
			}
			if (b.type === "toolCall") try {
				chars += JSON.stringify(b.arguments ?? {}).length;
			} catch {
				chars += 128;
			}
		}
		return chars;
	}
	if (message.role === "toolResult") return estimateTextAndImageChars(message.content);
	return 256;
}
function estimateContextChars(messages) {
	return messages.reduce((sum, m) => sum + estimateMessageChars(m), 0);
}
function findAssistantCutoffIndex(messages, keepLastAssistants) {
	if (keepLastAssistants <= 0) return messages.length;
	let remaining = keepLastAssistants;
	for (let i = messages.length - 1; i >= 0; i--) {
		if (messages[i]?.role !== "assistant") continue;
		remaining--;
		if (remaining === 0) return i;
	}
	return null;
}
function findFirstUserIndex(messages) {
	for (let i = 0; i < messages.length; i++) if (messages[i]?.role === "user") return i;
	return null;
}
function softTrimToolResultMessage(params) {
	const { msg, settings } = params;
	const hasImages = hasImageBlocks(msg.content);
	const parts = hasImages ? collectPrunableToolResultSegments(msg.content) : collectTextSegments(msg.content);
	const rawLen = estimateJoinedTextLength(parts);
	if (rawLen <= settings.softTrim.maxChars) {
		if (!hasImages) return null;
		return {
			...msg,
			content: [asText(parts.join("\n"))]
		};
	}
	const headChars = Math.max(0, settings.softTrim.headChars);
	const tailChars = Math.max(0, settings.softTrim.tailChars);
	if (headChars + tailChars >= rawLen) {
		if (!hasImages) return null;
		return {
			...msg,
			content: [asText(parts.join("\n"))]
		};
	}
	const trimmed = `${takeHeadFromJoinedText(parts, headChars)}
...
${takeTailFromJoinedText(parts, tailChars)}`;
	const note = `

[Tool result trimmed: kept first ${headChars} chars and last ${tailChars} chars of ${rawLen} chars.]`;
	return {
		...msg,
		content: [asText(trimmed + note)]
	};
}
function pruneContextMessages(params) {
	const { messages, settings, ctx } = params;
	const contextWindowTokens = typeof params.contextWindowTokensOverride === "number" && Number.isFinite(params.contextWindowTokensOverride) && params.contextWindowTokensOverride > 0 ? params.contextWindowTokensOverride : ctx.model?.contextWindow;
	if (!contextWindowTokens || contextWindowTokens <= 0) return messages;
	const charWindow = contextWindowTokens * 4;
	if (charWindow <= 0) return messages;
	const cutoffIndex = findAssistantCutoffIndex(messages, settings.keepLastAssistants);
	if (cutoffIndex === null) return messages;
	const firstUserIndex = findFirstUserIndex(messages);
	const pruneStartIndex = firstUserIndex === null ? messages.length : firstUserIndex;
	const isToolPrunable = params.isToolPrunable ?? makeToolPrunablePredicate(settings.tools);
	let totalChars = estimateContextChars(params.dropThinkingBlocksForEstimate ? dropThinkingBlocks(messages) : messages);
	let ratio = totalChars / charWindow;
	if (ratio < settings.softTrimRatio) return messages;
	const prunableToolIndexes = [];
	let next = null;
	for (let i = pruneStartIndex; i < cutoffIndex; i++) {
		const msg = messages[i];
		if (!msg || msg.role !== "toolResult") continue;
		if (!isToolPrunable(msg.toolName)) continue;
		prunableToolIndexes.push(i);
		const updated = softTrimToolResultMessage({
			msg,
			settings
		});
		if (!updated) continue;
		const beforeChars = estimateMessageChars(msg);
		const afterChars = estimateMessageChars(updated);
		totalChars += afterChars - beforeChars;
		if (!next) next = messages.slice();
		next[i] = updated;
	}
	const outputAfterSoftTrim = next ?? messages;
	ratio = totalChars / charWindow;
	if (ratio < settings.hardClearRatio) return outputAfterSoftTrim;
	if (!settings.hardClear.enabled) return outputAfterSoftTrim;
	let prunableToolChars = 0;
	for (const i of prunableToolIndexes) {
		const msg = outputAfterSoftTrim[i];
		if (!msg || msg.role !== "toolResult") continue;
		prunableToolChars += estimateMessageChars(msg);
	}
	if (prunableToolChars < settings.minPrunableToolChars) return outputAfterSoftTrim;
	for (const i of prunableToolIndexes) {
		if (ratio < settings.hardClearRatio) break;
		const msg = (next ?? messages)[i];
		if (!msg || msg.role !== "toolResult") continue;
		const beforeChars = estimateMessageChars(msg);
		const cleared = {
			...msg,
			content: [asText(settings.hardClear.placeholder)]
		};
		if (!next) next = messages.slice();
		next[i] = cleared;
		const afterChars = estimateMessageChars(cleared);
		totalChars += afterChars - beforeChars;
		ratio = totalChars / charWindow;
	}
	return next ?? messages;
}
//#endregion
//#region src/agents/pi-hooks/context-pruning/runtime.ts
const registry = createSessionManagerRuntimeRegistry();
const setContextPruningRuntime = registry.set;
const getContextPruningRuntime = registry.get;
//#endregion
//#region src/agents/pi-hooks/context-pruning/extension.ts
function contextPruningExtension(api) {
	api.on("context", (event, ctx) => {
		const runtime = getContextPruningRuntime(ctx.sessionManager);
		if (!runtime) return;
		if (runtime.settings.mode === "cache-ttl") {
			const ttlMs = runtime.settings.ttlMs;
			const lastTouch = runtime.lastCacheTouchAt ?? null;
			if (!lastTouch || ttlMs <= 0) return;
			if (ttlMs > 0 && Date.now() - lastTouch < ttlMs) return;
		}
		const next = pruneContextMessages({
			messages: event.messages,
			settings: runtime.settings,
			ctx,
			isToolPrunable: runtime.isToolPrunable,
			contextWindowTokensOverride: runtime.contextWindowTokens ?? void 0,
			dropThinkingBlocksForEstimate: runtime.dropThinkingBlocks
		});
		if (next === event.messages) return;
		if (runtime.settings.mode === "cache-ttl") runtime.lastCacheTouchAt = Date.now();
		return { messages: next };
	});
}
//#endregion
//#region src/agents/pi-hooks/context-pruning/settings.ts
const DEFAULT_CONTEXT_PRUNING_SETTINGS = {
	mode: "cache-ttl",
	ttlMs: 300 * 1e3,
	keepLastAssistants: 3,
	softTrimRatio: .3,
	hardClearRatio: .5,
	minPrunableToolChars: 5e4,
	tools: {},
	softTrim: {
		maxChars: 4e3,
		headChars: 1500,
		tailChars: 1500
	},
	hardClear: {
		enabled: true,
		placeholder: "[Old tool result content cleared]"
	}
};
function computeEffectiveSettings(raw) {
	if (!raw || typeof raw !== "object") return null;
	const cfg = raw;
	if (cfg.mode !== "cache-ttl") return null;
	const s = structuredClone(DEFAULT_CONTEXT_PRUNING_SETTINGS);
	s.mode = cfg.mode;
	if (typeof cfg.ttl === "string") try {
		s.ttlMs = parseDurationMs(cfg.ttl, { defaultUnit: "m" });
	} catch {}
	if (typeof cfg.keepLastAssistants === "number" && Number.isFinite(cfg.keepLastAssistants)) s.keepLastAssistants = Math.max(0, Math.floor(cfg.keepLastAssistants));
	if (typeof cfg.softTrimRatio === "number" && Number.isFinite(cfg.softTrimRatio)) s.softTrimRatio = Math.min(1, Math.max(0, cfg.softTrimRatio));
	if (typeof cfg.hardClearRatio === "number" && Number.isFinite(cfg.hardClearRatio)) s.hardClearRatio = Math.min(1, Math.max(0, cfg.hardClearRatio));
	if (typeof cfg.minPrunableToolChars === "number" && Number.isFinite(cfg.minPrunableToolChars)) s.minPrunableToolChars = Math.max(0, Math.floor(cfg.minPrunableToolChars));
	if (cfg.tools) s.tools = cfg.tools;
	if (cfg.softTrim) {
		if (typeof cfg.softTrim.maxChars === "number" && Number.isFinite(cfg.softTrim.maxChars)) s.softTrim.maxChars = Math.max(0, Math.floor(cfg.softTrim.maxChars));
		if (typeof cfg.softTrim.headChars === "number" && Number.isFinite(cfg.softTrim.headChars)) s.softTrim.headChars = Math.max(0, Math.floor(cfg.softTrim.headChars));
		if (typeof cfg.softTrim.tailChars === "number" && Number.isFinite(cfg.softTrim.tailChars)) s.softTrim.tailChars = Math.max(0, Math.floor(cfg.softTrim.tailChars));
	}
	if (cfg.hardClear) {
		if (typeof cfg.hardClear.enabled === "boolean") s.hardClear.enabled = cfg.hardClear.enabled;
		if (typeof cfg.hardClear.placeholder === "string" && cfg.hardClear.placeholder.trim()) s.hardClear.placeholder = cfg.hardClear.placeholder.trim();
	}
	return s;
}
//#endregion
//#region src/agents/pi-embedded-runner/extensions.ts
function recordFromUnknown(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function buildAgentToolResultMiddlewareFactory() {
	const handlers = listAgentToolResultMiddlewares("pi");
	const runner = createAgentToolResultMiddlewareRunner({ runtime: "pi" }, handlers);
	return (pi) => {
		pi.on("tool_result", async (rawEvent, ctx) => {
			if (handlers.length === 0) return;
			const event = recordFromUnknown(rawEvent);
			if (!event.toolName) return;
			const toolCallId = typeof event.toolCallId === "string" && event.toolCallId.trim() ? event.toolCallId : `pi-${randomUUID()}`;
			const current = {
				content: Array.isArray(event.content) ? event.content : [],
				details: event.details
			};
			const result = await runner.applyToolResultMiddleware({
				threadId: event.threadId,
				turnId: event.turnId,
				toolCallId,
				toolName: event.toolName,
				args: recordFromUnknown(event.input),
				cwd: ctx.cwd,
				isError: event.isError,
				result: current
			});
			return {
				content: result.content,
				details: result.details
			};
		});
	};
}
function resolveContextWindowTokens(params) {
	return resolveContextWindowInfo({
		cfg: params.cfg,
		provider: params.provider,
		modelId: params.modelId,
		modelContextTokens: params.model?.contextTokens,
		modelContextWindow: params.model?.contextWindow,
		defaultTokens: DEFAULT_CONTEXT_TOKENS
	}).tokens;
}
function buildContextPruningFactory(params) {
	const raw = params.cfg?.agents?.defaults?.contextPruning;
	if (raw?.mode !== "cache-ttl") return;
	if (!isCacheTtlEligibleProvider(params.provider, params.modelId, params.model?.api)) return;
	const settings = computeEffectiveSettings(raw);
	if (!settings) return;
	const transcriptPolicy = resolveTranscriptPolicy({
		modelApi: params.model?.api,
		provider: params.provider,
		modelId: params.modelId
	});
	setContextPruningRuntime(params.sessionManager, {
		settings,
		contextWindowTokens: resolveContextWindowTokens(params),
		isToolPrunable: makeToolPrunablePredicate(settings.tools),
		dropThinkingBlocks: transcriptPolicy.dropThinkingBlocks,
		lastCacheTouchAt: readLastCacheTtlTimestamp(params.sessionManager, {
			provider: params.provider,
			modelId: params.modelId
		})
	});
	return contextPruningExtension;
}
function resolveCompactionMode(cfg) {
	const compaction = cfg?.agents?.defaults?.compaction;
	if (compaction?.provider) return "safeguard";
	return compaction?.mode === "safeguard" ? "safeguard" : "default";
}
function buildEmbeddedExtensionFactories(params) {
	const factories = [];
	if (resolveCompactionMode(params.cfg) === "safeguard") {
		const compactionCfg = params.cfg?.agents?.defaults?.compaction;
		const qualityGuardCfg = compactionCfg?.qualityGuard;
		const contextWindowInfo = resolveContextWindowInfo({
			cfg: params.cfg,
			provider: params.provider,
			modelId: params.modelId,
			modelContextTokens: params.model?.contextTokens,
			modelContextWindow: params.model?.contextWindow,
			defaultTokens: DEFAULT_CONTEXT_TOKENS
		});
		setCompactionSafeguardRuntime(params.sessionManager, {
			maxHistoryShare: compactionCfg?.maxHistoryShare,
			contextWindowTokens: contextWindowInfo.tokens,
			identifierPolicy: compactionCfg?.identifierPolicy,
			identifierInstructions: compactionCfg?.identifierInstructions,
			customInstructions: compactionCfg?.customInstructions,
			qualityGuardEnabled: qualityGuardCfg?.enabled ?? true,
			qualityGuardMaxRetries: qualityGuardCfg?.maxRetries,
			model: params.model,
			recentTurnsPreserve: compactionCfg?.recentTurnsPreserve,
			provider: compactionCfg?.provider
		});
		factories.push(compactionSafeguardExtension);
	}
	const pruningFactory = buildContextPruningFactory(params);
	if (pruningFactory) factories.push(pruningFactory);
	factories.push(buildAgentToolResultMiddlewareFactory());
	return factories;
}
//#endregion
//#region src/agents/pi-embedded-runner/history.ts
const THREAD_SUFFIX_REGEX = /^(.*)(?::(?:thread|topic):\d+)$/i;
function stripThreadSuffix(value) {
	return value.match(THREAD_SUFFIX_REGEX)?.[1] ?? value;
}
/**
* Limits conversation history to the last N user turns (and their associated
* assistant responses). This reduces token usage for long-running DM sessions.
*/
function limitHistoryTurns(messages, limit) {
	if (!limit || limit <= 0 || messages.length === 0) return messages;
	let userCount = 0;
	let lastUserIndex = messages.length;
	for (let i = messages.length - 1; i >= 0; i--) if (messages[i].role === "user") {
		userCount++;
		if (userCount > limit) return messages.slice(lastUserIndex);
		lastUserIndex = i;
	}
	return messages;
}
/**
* Extract provider + user ID from a session key and look up dmHistoryLimit.
* Supports per-DM overrides and provider defaults.
* For channel/group sessions, uses historyLimit from provider config.
*/
function getHistoryLimitFromSessionKey(sessionKey, config) {
	if (!sessionKey || !config) return;
	const parts = sessionKey.split(":").filter(Boolean);
	const providerParts = parts.length >= 3 && parts[0] === "agent" ? parts.slice(2) : parts;
	const provider = normalizeProviderId(providerParts[0] ?? "");
	if (!provider) return;
	const kind = normalizeOptionalLowercaseString(providerParts[1]);
	const userId = stripThreadSuffix(providerParts.slice(2).join(":"));
	const resolveProviderConfig = (cfg, providerId) => {
		const channels = cfg?.channels;
		if (!channels || typeof channels !== "object") return;
		for (const [configuredProviderId, value] of Object.entries(channels)) {
			if (normalizeProviderId(configuredProviderId) !== providerId) continue;
			if (!value || typeof value !== "object" || Array.isArray(value)) return;
			return value;
		}
	};
	const providerConfig = resolveProviderConfig(config, provider);
	if (!providerConfig) return;
	if (kind === "dm" || kind === "direct") {
		if (userId && providerConfig.dms?.[userId]?.historyLimit !== void 0) return providerConfig.dms[userId].historyLimit;
		return providerConfig.dmHistoryLimit;
	}
	if (kind === "channel" || kind === "group") return providerConfig.historyLimit;
}
/**
* @deprecated Use getHistoryLimitFromSessionKey instead.
* Alias for backward compatibility.
*/
const getDmHistoryLimitFromSessionKey = getHistoryLimitFromSessionKey;
//#endregion
//#region src/agents/pi-embedded-runner/message-action-discovery-input.ts
function buildEmbeddedMessageActionDiscoveryInput(params) {
	return {
		cfg: params.cfg,
		channel: params.channel,
		currentChannelId: params.currentChannelId ?? void 0,
		currentThreadTs: params.currentThreadTs ?? void 0,
		currentMessageId: params.currentMessageId ?? void 0,
		accountId: params.accountId ?? void 0,
		sessionKey: params.sessionKey ?? void 0,
		sessionId: params.sessionId ?? void 0,
		agentId: params.agentId ?? void 0,
		requesterSenderId: params.senderId ?? void 0,
		senderIsOwner: params.senderIsOwner
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/replay-history.ts
const INTER_SESSION_PREFIX_BASE = "[Inter-session message]";
const MODEL_SNAPSHOT_CUSTOM_TYPE = "model-snapshot";
function createProviderReplayPluginParams(params) {
	const context = {
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		provider: params.provider,
		modelId: params.modelId,
		modelApi: params.modelApi,
		model: params.model,
		sessionId: params.sessionId
	};
	return {
		provider: params.provider,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		context
	};
}
function buildInterSessionPrefix(message) {
	const provenance = normalizeInputProvenance(message.provenance);
	if (!provenance) return INTER_SESSION_PREFIX_BASE;
	const details = [
		provenance.sourceSessionKey ? `sourceSession=${provenance.sourceSessionKey}` : void 0,
		provenance.sourceChannel ? `sourceChannel=${provenance.sourceChannel}` : void 0,
		provenance.sourceTool ? `sourceTool=${provenance.sourceTool}` : void 0
	].filter(Boolean);
	if (details.length === 0) return INTER_SESSION_PREFIX_BASE;
	return `${INTER_SESSION_PREFIX_BASE} ${details.join(" ")}`;
}
function annotateInterSessionUserMessages(messages) {
	let touched = false;
	const out = [];
	for (const msg of messages) {
		if (!hasInterSessionUserProvenance(msg)) {
			out.push(msg);
			continue;
		}
		const prefix = buildInterSessionPrefix(msg);
		const user = msg;
		if (typeof user.content === "string") {
			if (user.content.startsWith(prefix)) {
				out.push(msg);
				continue;
			}
			touched = true;
			out.push({
				...msg,
				content: `${prefix}\n${user.content}`
			});
			continue;
		}
		if (!Array.isArray(user.content)) {
			out.push(msg);
			continue;
		}
		const textIndex = user.content.findIndex((block) => block && typeof block === "object" && block.type === "text" && typeof block.text === "string");
		if (textIndex >= 0) {
			const existing = user.content[textIndex];
			if (existing.text.startsWith(prefix)) {
				out.push(msg);
				continue;
			}
			const nextContent = [...user.content];
			nextContent[textIndex] = {
				...existing,
				text: `${prefix}\n${existing.text}`
			};
			touched = true;
			out.push({
				...msg,
				content: nextContent
			});
			continue;
		}
		touched = true;
		out.push({
			...msg,
			content: [{
				type: "text",
				text: prefix
			}, ...user.content]
		});
	}
	return touched ? out : messages;
}
function parseMessageTimestamp(value) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string") {
		const parsed = Date.parse(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return null;
}
function stripStaleAssistantUsageBeforeLatestCompaction(messages) {
	let latestCompactionSummaryIndex = -1;
	let latestCompactionTimestamp = null;
	for (let i = 0; i < messages.length; i += 1) {
		const entry = messages[i];
		if (entry?.role !== "compactionSummary") continue;
		latestCompactionSummaryIndex = i;
		latestCompactionTimestamp = parseMessageTimestamp(entry.timestamp ?? null);
	}
	if (latestCompactionSummaryIndex === -1) return messages;
	const out = [...messages];
	let touched = false;
	for (let i = 0; i < out.length; i += 1) {
		const candidate = out[i];
		if (!candidate || candidate.role !== "assistant") continue;
		if (!candidate.usage || typeof candidate.usage !== "object") continue;
		const messageTimestamp = parseMessageTimestamp(candidate.timestamp);
		if (!(latestCompactionTimestamp !== null && messageTimestamp !== null && messageTimestamp <= latestCompactionTimestamp) && !(i < latestCompactionSummaryIndex)) continue;
		out[i] = {
			...candidate,
			usage: makeZeroUsageSnapshot()
		};
		touched = true;
	}
	return touched ? out : messages;
}
function normalizeAssistantReplayContent(messages) {
	let touched = false;
	const out = [...messages];
	for (let i = 0; i < out.length; i += 1) {
		const message = out[i];
		const replayContent = message?.content;
		if (!message || message.role !== "assistant" || typeof replayContent !== "string") continue;
		out[i] = {
			...message,
			content: [{
				type: "text",
				text: replayContent
			}]
		};
		touched = true;
	}
	return touched ? out : messages;
}
function normalizeAssistantUsageSnapshot(usage) {
	const normalized = normalizeUsage(usage ?? void 0);
	if (!normalized) return makeZeroUsageSnapshot();
	const input = normalized.input ?? 0;
	const output = normalized.output ?? 0;
	const cacheRead = normalized.cacheRead ?? 0;
	const cacheWrite = normalized.cacheWrite ?? 0;
	const totalTokens = normalized.total ?? input + output + cacheRead + cacheWrite;
	const cost = normalizeAssistantUsageCost(usage);
	return {
		input,
		output,
		cacheRead,
		cacheWrite,
		totalTokens,
		...cost ? { cost } : {}
	};
}
function normalizeAssistantUsageCost(usage) {
	const base = makeZeroUsageSnapshot().cost;
	if (!usage || typeof usage !== "object") return;
	const rawCost = usage.cost;
	if (!rawCost || typeof rawCost !== "object") return;
	const cost = rawCost;
	const inputRaw = toFiniteCostNumber(cost.input);
	const outputRaw = toFiniteCostNumber(cost.output);
	const cacheReadRaw = toFiniteCostNumber(cost.cacheRead);
	const cacheWriteRaw = toFiniteCostNumber(cost.cacheWrite);
	const totalRaw = toFiniteCostNumber(cost.total);
	if (inputRaw === void 0 && outputRaw === void 0 && cacheReadRaw === void 0 && cacheWriteRaw === void 0 && totalRaw === void 0) return;
	const input = inputRaw ?? base.input;
	const output = outputRaw ?? base.output;
	const cacheRead = cacheReadRaw ?? base.cacheRead;
	const cacheWrite = cacheWriteRaw ?? base.cacheWrite;
	return {
		input,
		output,
		cacheRead,
		cacheWrite,
		total: totalRaw ?? input + output + cacheRead + cacheWrite
	};
}
function toFiniteCostNumber(value) {
	return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function ensureAssistantUsageSnapshots(messages) {
	if (messages.length === 0) return messages;
	let touched = false;
	const out = [...messages];
	for (let i = 0; i < out.length; i += 1) {
		const message = out[i];
		if (!message || message.role !== "assistant") continue;
		const normalizedUsage = normalizeAssistantUsageSnapshot(message.usage);
		const usageCost = message.usage && typeof message.usage === "object" ? message.usage.cost : void 0;
		const normalizedCost = normalizedUsage.cost;
		if (message.usage && typeof message.usage === "object" && message.usage.input === normalizedUsage.input && message.usage.output === normalizedUsage.output && message.usage.cacheRead === normalizedUsage.cacheRead && message.usage.cacheWrite === normalizedUsage.cacheWrite && message.usage.totalTokens === normalizedUsage.totalTokens && (normalizedCost && usageCost && typeof usageCost === "object" && usageCost.input === normalizedCost.input && usageCost.output === normalizedCost.output && usageCost.cacheRead === normalizedCost.cacheRead && usageCost.cacheWrite === normalizedCost.cacheWrite && usageCost.total === normalizedCost.total || !normalizedCost && usageCost === void 0)) continue;
		out[i] = {
			...message,
			usage: normalizedUsage
		};
		touched = true;
	}
	return touched ? out : messages;
}
function createProviderReplaySessionState(sessionManager) {
	return {
		getCustomEntries() {
			try {
				const customEntries = [];
				for (const entry of sessionManager.getEntries()) {
					const candidate = entry;
					if (candidate?.type !== "custom" || typeof candidate.customType !== "string") continue;
					const customType = candidate.customType.trim();
					if (!customType) continue;
					customEntries.push({
						customType,
						data: candidate.data
					});
				}
				return customEntries;
			} catch {
				return [];
			}
		},
		appendCustomEntry(customType, data) {
			try {
				sessionManager.appendCustomEntry(customType, data);
			} catch {}
		}
	};
}
function readLastModelSnapshot(sessionManager) {
	try {
		const entries = sessionManager.getEntries();
		for (let i = entries.length - 1; i >= 0; i -= 1) {
			const entry = entries[i];
			if (entry?.type !== "custom" || entry?.customType !== MODEL_SNAPSHOT_CUSTOM_TYPE) continue;
			const data = entry?.data;
			if (data && typeof data === "object") return data;
		}
	} catch {
		return null;
	}
	return null;
}
function appendModelSnapshot(sessionManager, data) {
	try {
		sessionManager.appendCustomEntry(MODEL_SNAPSHOT_CUSTOM_TYPE, data);
	} catch {}
}
function isSameModelSnapshot(a, b) {
	const normalize = (value) => value ?? "";
	return normalize(a.provider) === normalize(b.provider) && normalize(a.modelApi) === normalize(b.modelApi) && normalize(a.modelId) === normalize(b.modelId);
}
/**
* Applies the generic replay-history cleanup pipeline before provider-owned
* replay hooks run.
*/
async function sanitizeSessionHistory(params) {
	const policy = params.policy ?? resolveTranscriptPolicy({
		modelApi: params.modelApi,
		provider: params.provider,
		modelId: params.modelId,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		model: params.model
	});
	const withInterSessionMarkers = annotateInterSessionUserMessages(params.messages);
	const allowProviderOwnedThinkingReplay = shouldAllowProviderOwnedThinkingReplay({
		modelApi: params.modelApi,
		policy
	});
	const isOpenAIResponsesApi = params.modelApi === "openai-responses" || params.modelApi === "openai-codex-responses" || params.modelApi === "azure-openai-responses";
	const hasSnapshot = Boolean(params.provider || params.modelApi || params.modelId);
	const priorSnapshot = hasSnapshot ? readLastModelSnapshot(params.sessionManager) : null;
	const modelChanged = priorSnapshot ? !isSameModelSnapshot(priorSnapshot, {
		timestamp: 0,
		provider: params.provider,
		modelApi: params.modelApi,
		modelId: params.modelId
	}) : false;
	const sanitizedImages = await sanitizeSessionMessagesImages(normalizeAssistantReplayContent(withInterSessionMarkers), "session:history", {
		sanitizeMode: policy.sanitizeMode,
		sanitizeToolCallIds: policy.sanitizeToolCallIds && !allowProviderOwnedThinkingReplay && !isOpenAIResponsesApi,
		toolCallIdMode: policy.toolCallIdMode,
		preserveNativeAnthropicToolUseIds: policy.preserveNativeAnthropicToolUseIds,
		preserveSignatures: policy.preserveSignatures,
		sanitizeThoughtSignatures: policy.sanitizeThoughtSignatures,
		...resolveImageSanitizationLimits(params.config)
	});
	const sanitizedToolCalls = sanitizeToolCallInputs(policy.dropThinkingBlocks ? dropThinkingBlocks(sanitizedImages) : sanitizedImages, {
		allowedToolNames: params.allowedToolNames,
		allowProviderOwnedThinkingReplay
	});
	const openAIRepairedToolCalls = isOpenAIResponsesApi && policy.repairToolUseResultPairing ? sanitizeToolUseResultPairing(sanitizedToolCalls, {
		erroredAssistantResultPolicy: "drop",
		missingToolResultText: "aborted"
	}) : sanitizedToolCalls;
	const openAISafeToolCalls = isOpenAIResponsesApi ? downgradeOpenAIFunctionCallReasoningPairs(downgradeOpenAIReasoningBlocks(openAIRepairedToolCalls, { dropReplayableReasoning: modelChanged })) : sanitizedToolCalls;
	const sanitizedToolIds = policy.sanitizeToolCallIds && policy.toolCallIdMode ? sanitizeToolCallIdsForCloudCodeAssist(openAISafeToolCalls, policy.toolCallIdMode, {
		preserveNativeAnthropicToolUseIds: policy.preserveNativeAnthropicToolUseIds,
		preserveReplaySafeThinkingToolCallIds: allowProviderOwnedThinkingReplay,
		allowedToolNames: params.allowedToolNames
	}) : openAISafeToolCalls;
	const sanitizedCompactionUsage = ensureAssistantUsageSnapshots(stripStaleAssistantUsageBeforeLatestCompaction(stripToolResultDetails(!isOpenAIResponsesApi && policy.repairToolUseResultPairing ? sanitizeToolUseResultPairing(sanitizedToolIds, { erroredAssistantResultPolicy: "drop" }) : sanitizedToolIds)));
	const provider = params.provider?.trim();
	let providerSanitized;
	if (provider && provider.length > 0) {
		const pluginParams = createProviderReplayPluginParams({
			...params,
			provider
		});
		providerSanitized = await sanitizeProviderReplayHistoryWithPlugin({
			...pluginParams,
			context: {
				...pluginParams.context,
				sessionId: params.sessionId ?? "",
				messages: sanitizedCompactionUsage,
				allowedToolNames: params.allowedToolNames,
				sessionState: createProviderReplaySessionState(params.sessionManager)
			}
		}) ?? void 0;
	}
	const sanitizedWithProvider = providerSanitized ?? sanitizedCompactionUsage;
	if (hasSnapshot && (!priorSnapshot || modelChanged)) appendModelSnapshot(params.sessionManager, {
		timestamp: Date.now(),
		provider: params.provider,
		modelApi: params.modelApi,
		modelId: params.modelId
	});
	if (!policy.applyGoogleTurnOrdering) return sanitizedWithProvider;
	return sanitizeGoogleTurnOrdering(sanitizedWithProvider);
}
/**
* Runs provider-owned replay validation before falling back to the remaining
* generic validator pipeline.
*/
async function validateReplayTurns(params) {
	const policy = params.policy ?? resolveTranscriptPolicy({
		modelApi: params.modelApi,
		provider: params.provider,
		modelId: params.modelId,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		model: params.model
	});
	const provider = params.provider?.trim();
	if (provider) {
		const pluginParams = createProviderReplayPluginParams({
			...params,
			provider
		});
		const providerValidated = await validateProviderReplayTurnsWithPlugin({
			...pluginParams,
			context: {
				...pluginParams.context,
				messages: params.messages
			}
		});
		if (providerValidated) return providerValidated;
	}
	const validatedGemini = policy.validateGeminiTurns ? validateGeminiTurns(params.messages) : params.messages;
	return policy.validateAnthropicTurns ? validateAnthropicTurns(validatedGemini) : validatedGemini;
}
//#endregion
//#region src/agents/pi-embedded-runner/session-manager-cache.ts
const DEFAULT_SESSION_MANAGER_TTL_MS = 45e3;
const MIN_SESSION_MANAGER_CACHE_PRUNE_INTERVAL_MS = 1e3;
const MAX_SESSION_MANAGER_CACHE_PRUNE_INTERVAL_MS = 3e4;
function getSessionManagerTtl() {
	return resolveCacheTtlMs({
		envValue: process.env.OPENCLAW_SESSION_MANAGER_CACHE_TTL_MS,
		defaultTtlMs: DEFAULT_SESSION_MANAGER_TTL_MS
	});
}
function resolveSessionManagerCachePruneInterval(ttlMs) {
	return Math.min(Math.max(ttlMs, MIN_SESSION_MANAGER_CACHE_PRUNE_INTERVAL_MS), MAX_SESSION_MANAGER_CACHE_PRUNE_INTERVAL_MS);
}
function createSessionManagerCache(options) {
	const getTtlMs = () => typeof options?.ttlMs === "function" ? options.ttlMs() : options?.ttlMs ?? getSessionManagerTtl();
	const cache = createExpiringMapCache({
		ttlMs: getTtlMs,
		pruneIntervalMs: resolveSessionManagerCachePruneInterval,
		clock: options?.clock
	});
	const fsModule = options?.fsModule ?? fs$1;
	return {
		clear: () => {
			cache.clear();
		},
		isSessionManagerCached: (sessionFile) => cache.get(sessionFile) === true,
		keys: () => cache.keys(),
		prewarmSessionFile: async (sessionFile) => {
			if (!isCacheEnabled(getTtlMs())) return;
			if (cache.get(sessionFile) === true) return;
			try {
				const handle = await fsModule.open(sessionFile, "r");
				try {
					const buffer = Buffer$1.alloc(4096);
					await handle.read(buffer, 0, buffer.length, 0);
				} finally {
					await handle.close();
				}
				cache.set(sessionFile, true);
			} catch {}
		},
		trackSessionManagerAccess: (sessionFile) => {
			cache.set(sessionFile, true);
		}
	};
}
const sessionManagerCache = createSessionManagerCache();
function trackSessionManagerAccess(sessionFile) {
	sessionManagerCache.trackSessionManagerAccess(sessionFile);
}
async function prewarmSessionFile(sessionFile) {
	await sessionManagerCache.prewarmSessionFile(sessionFile);
}
//#endregion
//#region src/agents/pi-embedded-runner/skills-runtime.ts
function resolveEmbeddedRunSkillEntries(params) {
	const shouldLoadSkillEntries = !params.skillsSnapshot || !params.skillsSnapshot.resolvedSkills;
	const config = resolveSkillRuntimeConfig(params.config);
	return {
		shouldLoadSkillEntries,
		skillEntries: shouldLoadSkillEntries ? loadWorkspaceSkillEntries(params.workspaceDir, {
			config,
			agentId: params.agentId
		}) : []
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/stream-resolution.ts
let embeddedAgentBaseStreamFnCache = /* @__PURE__ */ new WeakMap();
function resolveEmbeddedAgentBaseStreamFn(params) {
	const cached = embeddedAgentBaseStreamFnCache.get(params.session);
	if (cached !== void 0 || embeddedAgentBaseStreamFnCache.has(params.session)) return cached;
	const baseStreamFn = params.session.agent.streamFn;
	embeddedAgentBaseStreamFnCache.set(params.session, baseStreamFn);
	return baseStreamFn;
}
function describeEmbeddedAgentStreamStrategy(params) {
	if (params.providerStreamFn) return "provider";
	if (params.shouldUseWebSocketTransport) return params.wsApiKey ? "openai-websocket" : "session-http-fallback";
	if (params.model.provider === "anthropic-vertex") return "anthropic-vertex";
	if (params.currentStreamFn === void 0 || params.currentStreamFn === streamSimple) return createBoundaryAwareStreamFnForModel(params.model) ? `boundary-aware:${params.model.api}` : "stream-simple";
	return "session-custom";
}
async function resolveEmbeddedAgentApiKey(params) {
	const resolvedApiKey = params.resolvedApiKey?.trim();
	if (resolvedApiKey) return resolvedApiKey;
	return params.authStorage ? await params.authStorage.getApiKey(params.provider) : void 0;
}
function resolveEmbeddedAgentStreamFn(params) {
	if (params.providerStreamFn) {
		const inner = params.providerStreamFn;
		const normalizeContext = (context) => context.systemPrompt ? {
			...context,
			systemPrompt: stripSystemPromptCacheBoundary(context.systemPrompt)
		} : context;
		const mergeRunSignal = (options) => {
			const signal = options?.signal ?? params.signal;
			return signal ? {
				...options,
				signal
			} : options;
		};
		if (params.authStorage || params.resolvedApiKey) {
			const { authStorage, model, resolvedApiKey } = params;
			return async (m, context, options) => {
				const apiKey = await resolveEmbeddedAgentApiKey({
					provider: model.provider,
					resolvedApiKey,
					authStorage
				});
				return inner(m, normalizeContext(context), {
					...mergeRunSignal(options),
					apiKey: apiKey ?? options?.apiKey
				});
			};
		}
		return (m, context, options) => inner(m, normalizeContext(context), mergeRunSignal(options));
	}
	const currentStreamFn = params.currentStreamFn ?? streamSimple;
	if (params.shouldUseWebSocketTransport) return params.wsApiKey ? createOpenAIWebSocketStreamFn(params.wsApiKey, params.sessionId, {
		signal: params.signal,
		managerOptions: { request: getModelProviderRequestTransport(params.model) }
	}) : currentStreamFn;
	if (params.model.provider === "anthropic-vertex") return createAnthropicVertexStreamFnForModel(params.model);
	if (params.currentStreamFn === void 0 || params.currentStreamFn === streamSimple) {
		const boundaryAwareStreamFn = createBoundaryAwareStreamFnForModel(params.model);
		if (boundaryAwareStreamFn) return boundaryAwareStreamFn;
	}
	return currentStreamFn;
}
//#endregion
//#region src/agents/pi-embedded-runner/system-prompt.ts
function buildEmbeddedSystemPrompt(params) {
	return buildAgentSystemPrompt({
		workspaceDir: params.workspaceDir,
		defaultThinkLevel: params.defaultThinkLevel,
		reasoningLevel: params.reasoningLevel,
		extraSystemPrompt: params.extraSystemPrompt,
		ownerNumbers: params.ownerNumbers,
		ownerDisplay: params.ownerDisplay,
		ownerDisplaySecret: params.ownerDisplaySecret,
		reasoningTagHint: params.reasoningTagHint,
		heartbeatPrompt: params.heartbeatPrompt,
		skillsPrompt: params.skillsPrompt,
		docsPath: params.docsPath,
		ttsHint: params.ttsHint,
		workspaceNotes: params.workspaceNotes,
		reactionGuidance: params.reactionGuidance,
		promptMode: params.promptMode,
		acpEnabled: params.acpEnabled,
		runtimeInfo: params.runtimeInfo,
		messageToolHints: params.messageToolHints,
		sandboxInfo: params.sandboxInfo,
		toolNames: params.tools.map((tool) => tool.name),
		modelAliasLines: params.modelAliasLines,
		userTimezone: params.userTimezone,
		userTime: params.userTime,
		userTimeFormat: params.userTimeFormat,
		contextFiles: params.contextFiles,
		includeMemorySection: params.includeMemorySection,
		memoryCitationsMode: params.memoryCitationsMode,
		promptContribution: params.promptContribution
	});
}
function createSystemPromptOverride(systemPrompt) {
	const override = systemPrompt.trim();
	return (_defaultPrompt) => override;
}
function applySystemPromptOverrideToSession(session, override) {
	const prompt = typeof override === "function" ? override() : override.trim();
	session.agent.state.systemPrompt = prompt;
	const mutableSession = session;
	mutableSession._baseSystemPrompt = prompt;
	mutableSession._rebuildSystemPrompt = () => prompt;
}
//#endregion
//#region src/agents/pi-embedded-runner/tool-name-allowlist.ts
/**
* Pi built-in tools that remain present in the embedded runtime even when
* OpenClaw routes execution through custom tool definitions.
*/
const PI_RESERVED_TOOL_NAMES = [
	"bash",
	"edit",
	"find",
	"grep",
	"ls",
	"read",
	"write"
];
function addName(names, value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	if (trimmed) names.add(trimmed);
}
function collectAllowedToolNames(params) {
	const names = /* @__PURE__ */ new Set();
	for (const tool of params.tools) addName(names, tool.name);
	for (const tool of params.clientTools ?? []) addName(names, tool.function?.name);
	return names;
}
/**
* Collect the exact tool names registered with Pi for this session.
*/
function collectRegisteredToolNames(tools) {
	const names = /* @__PURE__ */ new Set();
	for (const tool of tools) addName(names, tool.name);
	return names;
}
function toSessionToolAllowlist(allowedToolNames) {
	return [...new Set(allowedToolNames)].toSorted((a, b) => a.localeCompare(b));
}
//#endregion
//#region src/agents/pi-embedded-runner/tool-split.ts
function splitSdkTools(options) {
	const { tools } = options;
	return { customTools: toToolDefinitions(tools) };
}
//#endregion
//#region src/agents/pi-embedded-runner/utils.ts
function mapThinkingLevel(level) {
	if (!level) return "off";
	if (level === "max") return "xhigh";
	if (level === "adaptive") return "medium";
	return level;
}
async function waitForAgentIdleBestEffort(agent, timeoutMs) {
	const waitForIdle = agent?.waitForIdle;
	if (typeof waitForIdle !== "function") return false;
	const idleResolved = Symbol("idle");
	const idleTimedOut = Symbol("timeout");
	let timeoutHandle;
	try {
		return await Promise.race([waitForIdle.call(agent).then(() => idleResolved), new Promise((resolve) => {
			timeoutHandle = setTimeout(() => resolve(idleTimedOut), timeoutMs);
			timeoutHandle.unref?.();
		})]) === idleTimedOut;
	} catch {
		return false;
	} finally {
		if (timeoutHandle) clearTimeout(timeoutHandle);
	}
}
async function flushPendingToolResultsAfterIdle(opts) {
	if (await waitForAgentIdleBestEffort(opts.agent, opts.timeoutMs ?? 3e4) && opts.clearPendingOnTimeout && opts.sessionManager?.clearPendingToolResults) {
		opts.sessionManager.clearPendingToolResults();
		return;
	}
	opts.sessionManager?.flushPendingToolResults?.();
}
//#endregion
export { buildStreamErrorAssistantMessage as $, consumeCompactionSafeguardCancelReason as A, estimateToolResultReductionPotential as B, limitHistoryTurns as C, hasMeaningfulConversationContent as D, estimateMessagesTokens as E, isCacheTtlEligibleProvider as F, installContextEngineLoopHook as G, sessionLikelyHasOversizedToolResults as H, readLastCacheTtlTimestamp as I, createPreparedEmbeddedPiSettingsManager as J, installToolResultContextGuard as K, resolveTranscriptPolicy as L, applyFinalEffectiveToolPolicy as M, compactWithSafetyTimeout as N, isRealConversationMessage as O, resolveCompactionTimeoutMs as P, releaseWsSession as Q, shouldAllowProviderOwnedThinkingReplay as R, getDmHistoryLimitFromSessionKey as S, SAFETY_MARGIN as T, truncateOversizedToolResultsInSession as U, resolveLiveToolResultMaxChars as V, truncateOversizedToolResultsInSessionManager as W, dropThinkingBlocks as X, assessLastAssistantMessage as Y, createBundleLspToolRuntime as Z, trackSessionManagerAccess as _, collectAllowedToolNames as a, validateReplayTurns as b, applySystemPromptOverrideToSession as c, describeEmbeddedAgentStreamStrategy as d, buildUsageWithNoCost as et, resolveEmbeddedAgentApiKey as f, prewarmSessionFile as g, resolveEmbeddedRunSkillEntries as h, PI_RESERVED_TOOL_NAMES as i, setCompactionSafeguardCancelReason as j, readPostCompactionContext as k, buildEmbeddedSystemPrompt as l, resolveEmbeddedAgentStreamFn as m, mapThinkingLevel as n, collectRegisteredToolNames as o, resolveEmbeddedAgentBaseStreamFn as p, repairSessionFileIfNeeded as q, splitSdkTools as r, toSessionToolAllowlist as s, flushPendingToolResultsAfterIdle as t, resolveChannelCapabilities as tt, createSystemPromptOverride as u, normalizeAssistantReplayContent as v, buildEmbeddedExtensionFactories as w, buildEmbeddedMessageActionDiscoveryInput as x, sanitizeSessionHistory as y, guardSessionManager as z };
