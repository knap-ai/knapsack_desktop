import { createActionGate as createActionGate$1, jsonResult as jsonResult$1, readNumberParam as readNumberParam$1, readReactionParams as readReactionParams$1, readStringParam as readStringParam$1 } from "openclaw/plugin-sdk/channel-actions";
import { loadOutboundMediaFromUrl as loadOutboundMediaFromUrl$1 } from "openclaw/plugin-sdk/outbound-media";
import { extractToolSend as extractToolSend$1 } from "openclaw/plugin-sdk/tool-send";
import { fetchWithSsrFGuard as fetchWithSsrFGuard$1 } from "openclaw/plugin-sdk/ssrf-runtime";
import { DEFAULT_ACCOUNT_ID } from "openclaw/plugin-sdk/account-id";
import { buildChannelConfigSchema } from "openclaw/plugin-sdk/channel-config-primitives";
import { missingTargetError } from "openclaw/plugin-sdk/channel-feedback";
import { createAccountStatusSink as createAccountStatusSink$1, runPassiveAccountLifecycle as runPassiveAccountLifecycle$1 } from "openclaw/plugin-sdk/channel-lifecycle";
import { createChannelPairingController } from "openclaw/plugin-sdk/channel-pairing";
import { createChannelReplyPipeline } from "openclaw/plugin-sdk/channel-reply-pipeline";
import { evaluateGroupRouteAccessForPolicy, resolveDmGroupAccessWithLists, resolveSenderScopedGroupPolicy } from "openclaw/plugin-sdk/channel-policy";
import { PAIRING_APPROVED_MESSAGE } from "openclaw/plugin-sdk/channel-status";
import { chunkTextForOutbound } from "openclaw/plugin-sdk/text-chunking";
import { GoogleChatConfigSchema } from "openclaw/plugin-sdk/channel-config-schema-legacy";
import { GROUP_POLICY_BLOCKED_LABEL, resolveAllowlistProviderRuntimeGroupPolicy, resolveDefaultGroupPolicy, warnMissingProviderGroupPolicyFallbackOnce } from "openclaw/plugin-sdk/runtime-group-policy";
import { isDangerousNameMatchingEnabled } from "openclaw/plugin-sdk/dangerous-name-runtime";
import { fetchRemoteMedia, resolveChannelMediaMaxBytes } from "openclaw/plugin-sdk/media-runtime";
import { resolveInboundMentionDecision as resolveInboundMentionDecision$1 } from "openclaw/plugin-sdk/channel-inbound";
import { resolveInboundRouteEnvelopeBuilderWithRuntime } from "openclaw/plugin-sdk/inbound-envelope";
import { resolveWebhookPath } from "openclaw/plugin-sdk/webhook-path";
import { registerWebhookTargetWithPluginRoute as registerWebhookTargetWithPluginRoute$1, resolveWebhookTargetWithAuthOrReject as resolveWebhookTargetWithAuthOrReject$1, withResolvedWebhookRequestPipeline as withResolvedWebhookRequestPipeline$1 } from "openclaw/plugin-sdk/webhook-targets";
import { createWebhookInFlightLimiter as createWebhookInFlightLimiter$1, readJsonWebhookBodyOrReject as readJsonWebhookBodyOrReject$1 } from "openclaw/plugin-sdk/webhook-request-guards";
import { createPluginRuntimeStore } from "openclaw/plugin-sdk/runtime-store";
//#region extensions/googlechat/src/runtime.ts
const { setRuntime: setGoogleChatRuntime, getRuntime: getGoogleChatRuntime } = createPluginRuntimeStore({
	pluginId: "googlechat",
	errorMessage: "Google Chat runtime not initialized"
});
//#endregion
export { resolveInboundRouteEnvelopeBuilderWithRuntime as A, readStringParam$1 as C, resolveDefaultGroupPolicy as D, resolveChannelMediaMaxBytes as E, warnMissingProviderGroupPolicyFallbackOnce as F, withResolvedWebhookRequestPipeline$1 as I, getGoogleChatRuntime as L, resolveWebhookPath as M, resolveWebhookTargetWithAuthOrReject$1 as N, resolveDmGroupAccessWithLists as O, runPassiveAccountLifecycle$1 as P, setGoogleChatRuntime as R, readReactionParams$1 as S, resolveAllowlistProviderRuntimeGroupPolicy as T, jsonResult$1 as _, buildChannelConfigSchema as a, readJsonWebhookBodyOrReject$1 as b, createActionGate$1 as c, createWebhookInFlightLimiter$1 as d, evaluateGroupRouteAccessForPolicy as f, isDangerousNameMatchingEnabled as g, fetchWithSsrFGuard$1 as h, PAIRING_APPROVED_MESSAGE as i, resolveSenderScopedGroupPolicy as j, resolveInboundMentionDecision$1 as k, createChannelPairingController as l, fetchRemoteMedia as m, GROUP_POLICY_BLOCKED_LABEL as n, chunkTextForOutbound as o, extractToolSend$1 as p, GoogleChatConfigSchema as r, createAccountStatusSink$1 as s, DEFAULT_ACCOUNT_ID as t, createChannelReplyPipeline as u, loadOutboundMediaFromUrl$1 as v, registerWebhookTargetWithPluginRoute$1 as w, readNumberParam$1 as x, missingTargetError as y };
