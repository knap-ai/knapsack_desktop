import { x as isPlainObject } from "./utils-BMRcljdi.js";
import { n as emitDiagnosticEvent } from "./diagnostic-events-Cz86_awm.js";
import { i as freezeDiagnosticTraceContext } from "./diagnostic-trace-context-D6vXBN1-.js";
import { t as createSubsystemLogger } from "./subsystem-CWI_MDy_.js";
import { t as getGlobalHookRunner } from "./hook-runner-global-C-5w-v1N.js";
import { i as PluginApprovalResolutions } from "./types-C419GIfP.js";
import { p as normalizeToolName } from "./tool-policy-DArLXMH2.js";
import { t as copyPluginToolMeta } from "./tools-CZr3orc0.js";
import { t as copyChannelAgentToolMeta } from "./channel-tools-DeYKQo13.js";
import { a as createLazyRuntimeSurface } from "./lazy-runtime-BxcSgm-I.js";
import { t as callGatewayTool } from "./gateway-ChidttH0.js";
//#region src/infra/diagnostic-error-metadata.ts
const HTTP_STATUS_MIN = 100;
const HTTP_STATUS_MAX = 599;
function isObjectLike(value) {
	return (typeof value === "object" || typeof value === "function") && value !== null;
}
function readOwnDataProperty(value, key) {
	if (!isObjectLike(value)) return;
	try {
		const descriptor = Object.getOwnPropertyDescriptor(value, key);
		return descriptor && "value" in descriptor ? descriptor.value : void 0;
	} catch {
		return;
	}
}
function isHttpStatusCode(value) {
	return typeof value === "number" && Number.isInteger(value) && value >= HTTP_STATUS_MIN && value <= HTTP_STATUS_MAX;
}
function diagnosticErrorCategory(err) {
	try {
		if (err instanceof TypeError) return "TypeError";
		if (err instanceof RangeError) return "RangeError";
		if (err instanceof ReferenceError) return "ReferenceError";
		if (err instanceof SyntaxError) return "SyntaxError";
		if (err instanceof URIError) return "URIError";
		if (typeof AggregateError !== "undefined" && err instanceof AggregateError) return "AggregateError";
		if (err instanceof Error) return "Error";
	} catch {
		return "unknown";
	}
	if (err === null) return "null";
	return typeof err;
}
function diagnosticHttpStatusCode(err) {
	const status = readOwnDataProperty(err, "status");
	if (isHttpStatusCode(status)) return String(status);
	const statusCode = readOwnDataProperty(err, "statusCode");
	if (isHttpStatusCode(statusCode)) return String(statusCode);
}
//#endregion
//#region src/agents/pi-tools.before-tool-call.ts
const log = createSubsystemLogger("agents/tools");
const BEFORE_TOOL_CALL_WRAPPED = Symbol("beforeToolCallWrapped");
const BEFORE_TOOL_CALL_HOOK_FAILURE_REASON = "Tool call blocked because before_tool_call hook failed";
const adjustedParamsByToolCallId = /* @__PURE__ */ new Map();
const MAX_TRACKED_ADJUSTED_PARAMS = 1024;
const LOOP_WARNING_BUCKET_SIZE = 10;
const MAX_LOOP_WARNING_KEYS = 256;
const loadBeforeToolCallRuntime = createLazyRuntimeSurface(() => import("./pi-tools.before-tool-call.runtime-CplCp_EP.js"), ({ beforeToolCallRuntime }) => beforeToolCallRuntime);
function buildAdjustedParamsKey(params) {
	if (params.runId && params.runId.trim()) return `${params.runId}:${params.toolCallId}`;
	return params.toolCallId;
}
function mergeParamsWithApprovalOverrides(originalParams, approvalParams) {
	if (approvalParams && isPlainObject(approvalParams)) {
		if (isPlainObject(originalParams)) return {
			...originalParams,
			...approvalParams
		};
		return approvalParams;
	}
	return originalParams;
}
function isAbortSignalCancellation(err, signal) {
	if (!signal?.aborted) return false;
	if (err === signal.reason) return true;
	if (err instanceof Error && err.name === "AbortError") return true;
	return false;
}
function unwrapErrorCause(err) {
	try {
		if (!(err instanceof Error)) return err;
		const cause = Object.getOwnPropertyDescriptor(err, "cause");
		if (cause && "value" in cause && cause.value !== void 0) return cause.value;
	} catch {
		return err;
	}
	return err;
}
function summarizeToolParams(params) {
	if (params === null) return { kind: "null" };
	if (params === void 0) return { kind: "undefined" };
	if (Array.isArray(params)) return {
		kind: "array",
		length: params.length
	};
	if (typeof params === "object") return { kind: "object" };
	if (typeof params === "string") return {
		kind: "string",
		length: params.length
	};
	if (typeof params === "number") return { kind: "number" };
	if (typeof params === "boolean") return { kind: "boolean" };
	return { kind: "other" };
}
function shouldEmitLoopWarning(state, warningKey, count) {
	if (!state.toolLoopWarningBuckets) state.toolLoopWarningBuckets = /* @__PURE__ */ new Map();
	const bucket = Math.floor(count / LOOP_WARNING_BUCKET_SIZE);
	if (bucket <= (state.toolLoopWarningBuckets.get(warningKey) ?? 0)) return false;
	state.toolLoopWarningBuckets.set(warningKey, bucket);
	if (state.toolLoopWarningBuckets.size > MAX_LOOP_WARNING_KEYS) {
		const oldest = state.toolLoopWarningBuckets.keys().next().value;
		if (oldest) state.toolLoopWarningBuckets.delete(oldest);
	}
	return true;
}
async function recordLoopOutcome(args) {
	if (!args.ctx?.sessionKey) return;
	try {
		const { getDiagnosticSessionState, recordToolCallOutcome } = await loadBeforeToolCallRuntime();
		recordToolCallOutcome(getDiagnosticSessionState({
			sessionKey: args.ctx.sessionKey,
			sessionId: args.ctx?.agentId
		}), {
			toolName: args.toolName,
			toolParams: args.toolParams,
			toolCallId: args.toolCallId,
			result: args.result,
			error: args.error,
			config: args.ctx.loopDetection
		});
	} catch (err) {
		log.warn(`tool loop outcome tracking failed: tool=${args.toolName} error=${String(err)}`);
	}
}
async function runBeforeToolCallHook(args) {
	const toolName = normalizeToolName(args.toolName || "tool");
	const params = args.params;
	if (args.ctx?.sessionKey) {
		const { getDiagnosticSessionState, logToolLoopAction, detectToolCallLoop, recordToolCall } = await loadBeforeToolCallRuntime();
		const sessionState = getDiagnosticSessionState({
			sessionKey: args.ctx.sessionKey,
			sessionId: args.ctx?.agentId
		});
		const loopResult = detectToolCallLoop(sessionState, toolName, params, args.ctx.loopDetection);
		if (loopResult.stuck) {
			if (loopResult.level === "critical") {
				log.error(`Blocking ${toolName} due to critical loop: ${loopResult.message}`);
				logToolLoopAction({
					sessionKey: args.ctx.sessionKey,
					sessionId: args.ctx?.agentId,
					toolName,
					level: "critical",
					action: "block",
					detector: loopResult.detector,
					count: loopResult.count,
					message: loopResult.message,
					pairedToolName: loopResult.pairedToolName
				});
				return {
					blocked: true,
					reason: loopResult.message
				};
			}
			if (shouldEmitLoopWarning(sessionState, loopResult.warningKey ?? `${loopResult.detector}:${toolName}`, loopResult.count)) {
				log.warn(`Loop warning for ${toolName}: ${loopResult.message}`);
				logToolLoopAction({
					sessionKey: args.ctx.sessionKey,
					sessionId: args.ctx?.agentId,
					toolName,
					level: "warning",
					action: "warn",
					detector: loopResult.detector,
					count: loopResult.count,
					message: loopResult.message,
					pairedToolName: loopResult.pairedToolName
				});
			}
		}
		recordToolCall(sessionState, toolName, params, args.toolCallId, args.ctx.loopDetection);
	}
	const hookRunner = getGlobalHookRunner();
	if (!hookRunner?.hasHooks("before_tool_call")) return {
		blocked: false,
		params: args.params
	};
	try {
		const normalizedParams = isPlainObject(params) ? params : {};
		const toolContext = {
			toolName,
			...args.ctx?.agentId && { agentId: args.ctx.agentId },
			...args.ctx?.sessionKey && { sessionKey: args.ctx.sessionKey },
			...args.ctx?.sessionId && { sessionId: args.ctx.sessionId },
			...args.ctx?.runId && { runId: args.ctx.runId },
			...args.ctx?.trace && { trace: freezeDiagnosticTraceContext(args.ctx.trace) },
			...args.toolCallId && { toolCallId: args.toolCallId }
		};
		const hookResult = await hookRunner.runBeforeToolCall({
			toolName,
			params: normalizedParams,
			...args.ctx?.runId && { runId: args.ctx.runId },
			...args.toolCallId && { toolCallId: args.toolCallId }
		}, toolContext);
		if (hookResult?.block) return {
			blocked: true,
			reason: hookResult.blockReason || "Tool call blocked by plugin hook"
		};
		if (hookResult?.requireApproval) {
			const approval = hookResult.requireApproval;
			const safeOnResolution = (resolution) => {
				const onResolution = approval.onResolution;
				if (typeof onResolution !== "function") return;
				try {
					Promise.resolve(onResolution(resolution)).catch((err) => {
						log.warn(`plugin onResolution callback failed: ${String(err)}`);
					});
				} catch (err) {
					log.warn(`plugin onResolution callback failed: ${String(err)}`);
				}
			};
			try {
				const requestResult = await callGatewayTool("plugin.approval.request", { timeoutMs: (approval.timeoutMs ?? 12e4) + 1e4 }, {
					pluginId: approval.pluginId,
					title: approval.title,
					description: approval.description,
					severity: approval.severity,
					toolName,
					toolCallId: args.toolCallId,
					agentId: args.ctx?.agentId,
					sessionKey: args.ctx?.sessionKey,
					timeoutMs: approval.timeoutMs ?? 12e4,
					twoPhase: true
				}, { expectFinal: false });
				const id = requestResult?.id;
				if (!id) {
					safeOnResolution(PluginApprovalResolutions.CANCELLED);
					return {
						blocked: true,
						reason: approval.description || "Plugin approval request failed"
					};
				}
				const hasImmediateDecision = Object.prototype.hasOwnProperty.call(requestResult ?? {}, "decision");
				let decision;
				if (hasImmediateDecision) {
					decision = requestResult?.decision;
					if (decision === null) {
						safeOnResolution(PluginApprovalResolutions.CANCELLED);
						return {
							blocked: true,
							reason: "Plugin approval unavailable (no approval route)"
						};
					}
				} else {
					const waitPromise = callGatewayTool("plugin.approval.waitDecision", { timeoutMs: (approval.timeoutMs ?? 12e4) + 1e4 }, { id });
					let waitResult;
					if (args.signal) {
						let onAbort;
						const abortPromise = new Promise((_, reject) => {
							if (args.signal.aborted) {
								reject(args.signal.reason);
								return;
							}
							onAbort = () => reject(args.signal.reason);
							args.signal.addEventListener("abort", onAbort, { once: true });
						});
						try {
							waitResult = await Promise.race([waitPromise, abortPromise]);
						} finally {
							if (onAbort) args.signal.removeEventListener("abort", onAbort);
						}
					} else waitResult = await waitPromise;
					decision = waitResult?.decision;
				}
				safeOnResolution(decision === PluginApprovalResolutions.ALLOW_ONCE || decision === PluginApprovalResolutions.ALLOW_ALWAYS || decision === PluginApprovalResolutions.DENY ? decision : PluginApprovalResolutions.TIMEOUT);
				if (decision === PluginApprovalResolutions.ALLOW_ONCE || decision === PluginApprovalResolutions.ALLOW_ALWAYS) return {
					blocked: false,
					params: mergeParamsWithApprovalOverrides(params, hookResult.params)
				};
				if (decision === PluginApprovalResolutions.DENY) return {
					blocked: true,
					reason: "Denied by user"
				};
				if ((approval.timeoutBehavior ?? "deny") === "allow") return {
					blocked: false,
					params: mergeParamsWithApprovalOverrides(params, hookResult.params)
				};
				return {
					blocked: true,
					reason: "Approval timed out"
				};
			} catch (err) {
				safeOnResolution(PluginApprovalResolutions.CANCELLED);
				if (isAbortSignalCancellation(err, args.signal)) {
					log.warn(`plugin approval wait cancelled by run abort: ${String(err)}`);
					return {
						blocked: true,
						reason: "Approval cancelled (run aborted)"
					};
				}
				log.warn(`plugin approval gateway request failed; blocking tool call: ${String(err)}`);
				return {
					blocked: true,
					reason: "Plugin approval required (gateway unavailable)"
				};
			}
		}
		if (hookResult?.params) return {
			blocked: false,
			params: mergeParamsWithApprovalOverrides(params, hookResult.params)
		};
	} catch (err) {
		const toolCallId = args.toolCallId ? ` toolCallId=${args.toolCallId}` : "";
		const cause = unwrapErrorCause(err);
		log.error(`before_tool_call hook failed: tool=${toolName}${toolCallId} error=${String(cause)}`);
		return {
			blocked: true,
			reason: BEFORE_TOOL_CALL_HOOK_FAILURE_REASON
		};
	}
	return {
		blocked: false,
		params
	};
}
function wrapToolWithBeforeToolCallHook(tool, ctx) {
	const execute = tool.execute;
	if (!execute) return tool;
	const toolName = tool.name || "tool";
	const wrappedTool = {
		...tool,
		execute: async (toolCallId, params, signal, onUpdate) => {
			const outcome = await runBeforeToolCallHook({
				toolName,
				params,
				toolCallId,
				ctx,
				signal
			});
			if (outcome.blocked) throw new Error(outcome.reason);
			if (toolCallId) {
				const adjustedParamsKey = buildAdjustedParamsKey({
					runId: ctx?.runId,
					toolCallId
				});
				adjustedParamsByToolCallId.set(adjustedParamsKey, outcome.params);
				if (adjustedParamsByToolCallId.size > MAX_TRACKED_ADJUSTED_PARAMS) {
					const oldest = adjustedParamsByToolCallId.keys().next().value;
					if (oldest) adjustedParamsByToolCallId.delete(oldest);
				}
			}
			const normalizedToolName = normalizeToolName(toolName || "tool");
			const eventBase = {
				...ctx?.runId && { runId: ctx.runId },
				...ctx?.sessionKey && { sessionKey: ctx.sessionKey },
				...ctx?.sessionId && { sessionId: ctx.sessionId },
				...ctx?.trace && { trace: freezeDiagnosticTraceContext(ctx.trace) },
				toolName: normalizedToolName,
				...toolCallId && { toolCallId },
				paramsSummary: summarizeToolParams(outcome.params)
			};
			emitDiagnosticEvent({
				type: "tool.execution.started",
				...eventBase
			});
			const startedAt = Date.now();
			try {
				const result = await execute(toolCallId, outcome.params, signal, onUpdate);
				const durationMs = Date.now() - startedAt;
				await recordLoopOutcome({
					ctx,
					toolName: normalizedToolName,
					toolParams: outcome.params,
					toolCallId,
					result
				});
				emitDiagnosticEvent({
					type: "tool.execution.completed",
					...eventBase,
					durationMs
				});
				return result;
			} catch (err) {
				const cause = unwrapErrorCause(err);
				const errorCode = diagnosticHttpStatusCode(cause);
				emitDiagnosticEvent({
					type: "tool.execution.error",
					...eventBase,
					durationMs: Date.now() - startedAt,
					errorCategory: diagnosticErrorCategory(cause),
					...errorCode ? { errorCode } : {}
				});
				await recordLoopOutcome({
					ctx,
					toolName: normalizedToolName,
					toolParams: outcome.params,
					toolCallId,
					error: err
				});
				throw err;
			}
		}
	};
	copyPluginToolMeta(tool, wrappedTool);
	copyChannelAgentToolMeta(tool, wrappedTool);
	Object.defineProperty(wrappedTool, BEFORE_TOOL_CALL_WRAPPED, {
		value: true,
		enumerable: true
	});
	return wrappedTool;
}
function isToolWrappedWithBeforeToolCallHook(tool) {
	return tool[BEFORE_TOOL_CALL_WRAPPED] === true;
}
function consumeAdjustedParamsForToolCall(toolCallId, runId) {
	const adjustedParamsKey = buildAdjustedParamsKey({
		runId,
		toolCallId
	});
	const params = adjustedParamsByToolCallId.get(adjustedParamsKey);
	adjustedParamsByToolCallId.delete(adjustedParamsKey);
	return params;
}
const __testing = {
	BEFORE_TOOL_CALL_WRAPPED,
	buildAdjustedParamsKey,
	adjustedParamsByToolCallId,
	runBeforeToolCallHook,
	mergeParamsWithApprovalOverrides,
	isPlainObject
};
//#endregion
export { wrapToolWithBeforeToolCallHook as a, runBeforeToolCallHook as i, consumeAdjustedParamsForToolCall as n, diagnosticErrorCategory as o, isToolWrappedWithBeforeToolCallHook as r, __testing as t };
