import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import "./pi-embedded-helpers-6UMMUO8y.js";
import { f as isFailoverErrorMessage, t as classifyFailoverReason } from "./errors-CJULmF31.js";
import { i as isFailoverError, s as resolveFailoverStatus, t as FailoverError } from "./failover-error-CqpA2cGv.js";
//#region src/agents/cli-runner.ts
async function runCliAgent(params) {
	const { prepareCliRunContext } = await import("./prepare.runtime-ChOwghnY.js");
	return runPreparedCliAgent(await prepareCliRunContext(params));
}
async function runPreparedCliAgent(context) {
	const { executePreparedCliRun } = await import("./execute.runtime-CHmBY4OM.js");
	const { params } = context;
	const buildCliRunResult = (resultParams) => {
		const text = resultParams.output.text?.trim();
		const rawText = resultParams.output.rawText?.trim();
		return {
			payloads: text ? [{ text }] : void 0,
			meta: {
				durationMs: Date.now() - context.started,
				...resultParams.output.finalPromptText ? { finalPromptText: resultParams.output.finalPromptText } : {},
				...text || rawText ? {
					...text ? { finalAssistantVisibleText: text } : {},
					...rawText ? { finalAssistantRawText: rawText } : {}
				} : {},
				systemPromptReport: context.systemPromptReport,
				executionTrace: {
					winnerProvider: params.provider,
					winnerModel: context.modelId,
					attempts: [{
						provider: params.provider,
						model: context.modelId,
						result: "success"
					}],
					fallbackUsed: false,
					runner: "cli"
				},
				requestShaping: {
					...params.thinkLevel ? { thinking: params.thinkLevel } : {},
					...params.authProfileId ? { authMode: "auth-profile" } : {}
				},
				completion: {
					finishReason: "stop",
					stopReason: "completed",
					refusal: false
				},
				agentMeta: {
					sessionId: resultParams.effectiveCliSessionId ?? params.sessionId ?? "",
					provider: params.provider,
					model: context.modelId,
					usage: resultParams.output.usage,
					...resultParams.effectiveCliSessionId ? { cliSessionBinding: {
						sessionId: resultParams.effectiveCliSessionId,
						...params.authProfileId ? { authProfileId: params.authProfileId } : {},
						...context.authEpoch ? { authEpoch: context.authEpoch } : {},
						...context.extraSystemPromptHash ? { extraSystemPromptHash: context.extraSystemPromptHash } : {},
						...context.preparedBackend.mcpConfigHash ? { mcpConfigHash: context.preparedBackend.mcpConfigHash } : {}
					} } : {}
				}
			}
		};
	};
	try {
		try {
			const output = await executePreparedCliRun(context, context.reusableCliSession.sessionId);
			return buildCliRunResult({
				output,
				effectiveCliSessionId: output.sessionId ?? context.reusableCliSession.sessionId
			});
		} catch (err) {
			if (isFailoverError(err)) {
				const retryableSessionId = context.reusableCliSession.sessionId ?? params.cliSessionId;
				if (err.reason === "session_expired" && retryableSessionId && params.sessionKey) {
					const output = await executePreparedCliRun(context, void 0);
					const effectiveCliSessionId = output.sessionId;
					return buildCliRunResult({
						output,
						effectiveCliSessionId
					});
				}
				throw err;
			}
			const message = formatErrorMessage(err);
			if (isFailoverErrorMessage(message, { provider: params.provider })) {
				const reason = classifyFailoverReason(message, { provider: params.provider }) ?? "unknown";
				const status = resolveFailoverStatus(reason);
				throw new FailoverError(message, {
					reason,
					provider: params.provider,
					model: context.modelId,
					status
				});
			}
			throw err;
		}
	} finally {
		await context.preparedBackend.cleanup?.();
	}
}
//#endregion
export { runCliAgent as t };
