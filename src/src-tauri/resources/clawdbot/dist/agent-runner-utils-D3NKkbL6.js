import { o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { a as normalizeAnyChannelId, o as normalizeChannelId } from "./registry-CENZffQG.js";
import { t as getChannelPlugin } from "./registry-Delpa74L.js";
import { r as getRuntimeConfigSnapshot } from "./runtime-snapshot-BwqEmc6G.js";
import { f as resolveRunModelFallbacksOverride } from "./agent-scope-KFH9bkHi.js";
import "./config-Q9XZc_2I.js";
import "./plugins-D4ODSIPT.js";
import { t as isReasoningTagProvider } from "./provider-utils-DNY7A_rU.js";
import { t as resolveMessageSecretScope } from "./message-secret-scope-Dp8_bdnI.js";
import { t as resolveCommandSecretRefsViaGateway } from "./command-secret-gateway-D1MBXqwF.js";
import { a as getScopedChannelsCommandSecretTargets, t as getAgentRuntimeCommandSecretTargetIds } from "./command-secret-targets-WLIHx3E8.js";
import { n as resolveOriginMessageProvider, r as resolveOriginMessageTo } from "./origin-routing-0ZGm8VdG.js";
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
function resolveQueuedReplyRuntimeConfig(config) {
	return (typeof getRuntimeConfigSnapshot === "function" ? getRuntimeConfigSnapshot() : null) ?? config;
}
async function resolveQueuedReplyExecutionConfig(config, params) {
	const runtimeConfig = resolveQueuedReplyRuntimeConfig(config);
	const { resolvedConfig } = await resolveCommandSecretRefsViaGateway({
		config: runtimeConfig,
		commandName: "reply",
		targetIds: getAgentRuntimeCommandSecretTargetIds()
	});
	const baseResolvedConfig = resolvedConfig ?? runtimeConfig;
	const scope = resolveMessageSecretScope({
		channel: params?.originatingChannel,
		fallbackChannel: params?.messageProvider,
		accountId: params?.originatingAccountId,
		fallbackAccountId: params?.agentAccountId
	});
	if (!scope.channel) return baseResolvedConfig;
	const scopedTargets = getScopedChannelsCommandSecretTargets({
		config: baseResolvedConfig,
		channel: scope.channel,
		accountId: scope.accountId
	});
	if (scopedTargets.targetIds.size === 0) return baseResolvedConfig;
	return (await resolveCommandSecretRefsViaGateway({
		config: baseResolvedConfig,
		commandName: "reply",
		targetIds: scopedTargets.targetIds,
		...scopedTargets.allowedPaths ? { allowedPaths: scopedTargets.allowedPaths } : {}
	})).resolvedConfig ?? baseResolvedConfig;
}
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
	const rawProvider = normalizeOptionalLowercaseString(originProvider);
	if (!rawProvider) return { currentMessageId };
	const provider = normalizeChannelId(rawProvider) ?? normalizeAnyChannelId(rawProvider);
	const threading = provider ? getChannelPlugin(provider)?.threading : void 0;
	if (!threading?.buildToolContext) return {
		currentChannelId: normalizeOptionalString(originTo),
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
const isBunFetchSocketError = (message) => message ? BUN_FETCH_SOCKET_ERROR_RE.test(message) : false;
const formatBunFetchSocketError = (message) => {
	return [
		"⚠️ LLM connection failed. This could be due to server issues, network problems, or context length exceeded (e.g., with local LLMs like LM Studio). Original error:",
		"```",
		message.trim() || "Unknown error",
		"```"
	].join("\n");
};
const resolveEnforceFinalTag = (run, provider, model = run.model) => (run.skipProviderRuntimeHints ? false : void 0) ?? (run.enforceFinalTag || isReasoningTagProvider(provider, {
	config: run.config,
	workspaceDir: run.workspaceDir,
	modelId: model
}));
function resolveModelFallbackOptions(run) {
	const config = run.config;
	return {
		cfg: config,
		provider: run.provider,
		model: run.model,
		agentDir: run.agentDir,
		fallbacksOverride: resolveRunModelFallbacksOverride({
			cfg: config,
			agentId: run.agentId,
			sessionKey: run.sessionKey
		})
	};
}
function buildEmbeddedRunBaseParams(params) {
	const config = params.run.config;
	return {
		sessionFile: params.run.sessionFile,
		workspaceDir: params.run.workspaceDir,
		agentDir: params.run.agentDir,
		config,
		skillsSnapshot: params.run.skillsSnapshot,
		ownerNumbers: params.run.ownerNumbers,
		inputProvenance: params.run.inputProvenance,
		senderIsOwner: params.run.senderIsOwner,
		enforceFinalTag: resolveEnforceFinalTag(params.run, params.provider, params.model),
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
	const config = params.run.config;
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
			config,
			hasRepliedRef: params.hasRepliedRef
		})
	};
}
function buildTemplateSenderContext(sessionCtx) {
	return {
		senderId: normalizeOptionalString(sessionCtx.SenderId),
		senderName: normalizeOptionalString(sessionCtx.SenderName),
		senderUsername: normalizeOptionalString(sessionCtx.SenderUsername),
		senderE164: normalizeOptionalString(sessionCtx.SenderE164)
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
export { resolveModelFallbackOptions as a, resolveRunAuthProfile as c, isBunFetchSocketError as i, buildThreadingToolContext as n, resolveQueuedReplyExecutionConfig as o, formatBunFetchSocketError as r, resolveQueuedReplyRuntimeConfig as s, buildEmbeddedRunExecutionParams as t };
