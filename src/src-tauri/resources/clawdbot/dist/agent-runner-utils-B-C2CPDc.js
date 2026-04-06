import { _ as resolveRunModelFallbacksOverride } from "./agent-scope-CYXg_wTS.js";
import { a as normalizeAnyChannelId, o as normalizeChannelId } from "./registry-DTO_OK4F.js";
import { t as getChannelPlugin } from "./registry-fiJfPVib.js";
import "./plugins-DF32jmMU.js";
import { m as isReasoningTagProvider } from "./content-blocks-CWb2xgCb.js";
import { n as resolveOriginMessageProvider, r as resolveOriginMessageTo } from "./origin-routing-8_5I9UOx.js";
//#region src/auto-reply/reply/agent-runner-auth-profile.ts
function resolveProviderScopedAuthProfile(params) {
	const authProfileId = params.provider === params.primaryProvider ? params.authProfileId : void 0;
	return {
		authProfileId,
		authProfileIdSource: authProfileId ? params.authProfileIdSource : void 0
	};
}
function resolveRunAuthProfile(run, provider) {
	return resolveProviderScopedAuthProfile({
		provider,
		primaryProvider: run.provider,
		authProfileId: run.authProfileId,
		authProfileIdSource: run.authProfileIdSource
	});
}
//#endregion
//#region src/auto-reply/reply/agent-runner-utils.ts
const BUN_FETCH_SOCKET_ERROR_RE = /socket connection was closed unexpectedly/i;
/**
* Build provider-specific threading context for tool auto-injection.
*/
function buildThreadingToolContext(params) {
	const { sessionCtx, config, hasRepliedRef } = params;
	const currentMessageId = sessionCtx.MessageSidFull ?? sessionCtx.MessageSid;
	const originProvider = resolveOriginMessageProvider({
		originatingChannel: sessionCtx.OriginatingChannel,
		provider: sessionCtx.Provider
	});
	const originTo = resolveOriginMessageTo({
		originatingTo: sessionCtx.OriginatingTo,
		to: sessionCtx.To
	});
	if (!config) return { currentMessageId };
	const rawProvider = originProvider?.trim().toLowerCase();
	if (!rawProvider) return { currentMessageId };
	const provider = normalizeChannelId(rawProvider) ?? normalizeAnyChannelId(rawProvider);
	const threading = provider ? getChannelPlugin(provider)?.threading : void 0;
	if (!threading?.buildToolContext) return {
		currentChannelId: originTo?.trim() || void 0,
		currentChannelProvider: provider ?? rawProvider,
		currentMessageId,
		hasRepliedRef
	};
	const context = threading.buildToolContext({
		cfg: config,
		accountId: sessionCtx.AccountId,
		context: {
			Channel: originProvider,
			From: sessionCtx.From,
			To: originTo,
			ChatType: sessionCtx.ChatType,
			CurrentMessageId: currentMessageId,
			ReplyToId: sessionCtx.ReplyToId,
			ThreadLabel: sessionCtx.ThreadLabel,
			MessageThreadId: sessionCtx.MessageThreadId,
			NativeChannelId: sessionCtx.NativeChannelId
		},
		hasRepliedRef
	}) ?? {};
	return {
		...context,
		currentChannelProvider: provider,
		currentMessageId: context.currentMessageId ?? currentMessageId
	};
}
const isBunFetchSocketError = (message) => Boolean(message && BUN_FETCH_SOCKET_ERROR_RE.test(message));
const formatBunFetchSocketError = (message) => {
	return [
		"⚠️ LLM connection failed. This could be due to server issues, network problems, or context length exceeded (e.g., with local LLMs like LM Studio). Original error:",
		"```",
		message.trim() || "Unknown error",
		"```"
	].join("\n");
};
const resolveEnforceFinalTag = (run, provider) => Boolean(run.enforceFinalTag || isReasoningTagProvider(provider, {
	config: run.config,
	workspaceDir: run.workspaceDir,
	modelId: run.model
}));
function resolveModelFallbackOptions(run) {
	return {
		cfg: run.config,
		provider: run.provider,
		model: run.model,
		agentDir: run.agentDir,
		fallbacksOverride: resolveRunModelFallbacksOverride({
			cfg: run.config,
			agentId: run.agentId,
			sessionKey: run.sessionKey
		})
	};
}
function buildEmbeddedRunBaseParams(params) {
	return {
		sessionFile: params.run.sessionFile,
		workspaceDir: params.run.workspaceDir,
		agentDir: params.run.agentDir,
		config: params.run.config,
		skillsSnapshot: params.run.skillsSnapshot,
		ownerNumbers: params.run.ownerNumbers,
		inputProvenance: params.run.inputProvenance,
		senderIsOwner: params.run.senderIsOwner,
		enforceFinalTag: resolveEnforceFinalTag(params.run, params.provider),
		silentExpected: params.run.silentExpected,
		provider: params.provider,
		model: params.model,
		...params.authProfile,
		thinkLevel: params.run.thinkLevel,
		verboseLevel: params.run.verboseLevel,
		reasoningLevel: params.run.reasoningLevel,
		execOverrides: params.run.execOverrides,
		bashElevated: params.run.bashElevated,
		timeoutMs: params.run.timeoutMs,
		runId: params.runId,
		allowTransientCooldownProbe: params.allowTransientCooldownProbe
	};
}
function buildEmbeddedContextFromTemplate(params) {
	return {
		sessionId: params.run.sessionId,
		sessionKey: params.run.sessionKey,
		agentId: params.run.agentId,
		messageProvider: resolveOriginMessageProvider({
			originatingChannel: params.sessionCtx.OriginatingChannel,
			provider: params.sessionCtx.Provider
		}),
		agentAccountId: params.sessionCtx.AccountId,
		messageTo: resolveOriginMessageTo({
			originatingTo: params.sessionCtx.OriginatingTo,
			to: params.sessionCtx.To
		}),
		messageThreadId: params.sessionCtx.MessageThreadId ?? void 0,
		...buildThreadingToolContext({
			sessionCtx: params.sessionCtx,
			config: params.run.config,
			hasRepliedRef: params.hasRepliedRef
		})
	};
}
function buildTemplateSenderContext(sessionCtx) {
	return {
		senderId: sessionCtx.SenderId?.trim() || void 0,
		senderName: sessionCtx.SenderName?.trim() || void 0,
		senderUsername: sessionCtx.SenderUsername?.trim() || void 0,
		senderE164: sessionCtx.SenderE164?.trim() || void 0
	};
}
function buildEmbeddedRunContexts(params) {
	return {
		authProfile: resolveRunAuthProfile(params.run, params.provider),
		embeddedContext: buildEmbeddedContextFromTemplate({
			run: params.run,
			sessionCtx: params.sessionCtx,
			hasRepliedRef: params.hasRepliedRef
		}),
		senderContext: buildTemplateSenderContext(params.sessionCtx)
	};
}
function buildEmbeddedRunExecutionParams(params) {
	const { authProfile, embeddedContext, senderContext } = buildEmbeddedRunContexts(params);
	return {
		embeddedContext,
		senderContext,
		runBaseParams: buildEmbeddedRunBaseParams({
			run: params.run,
			provider: params.provider,
			model: params.model,
			runId: params.runId,
			authProfile,
			allowTransientCooldownProbe: params.allowTransientCooldownProbe
		})
	};
}
//#endregion
export { resolveModelFallbackOptions as a, isBunFetchSocketError as i, buildThreadingToolContext as n, resolveRunAuthProfile as o, formatBunFetchSocketError as r, buildEmbeddedRunExecutionParams as t };
