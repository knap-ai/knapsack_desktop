import "openclaw/plugin-sdk/channel-config-primitives";
import "openclaw/plugin-sdk/channel-policy";
import { getSessionBindingService as getSessionBindingService$1, resolveThreadBindingIdleTimeoutMsForChannel, resolveThreadBindingMaxAgeMsForChannel } from "openclaw/plugin-sdk/conversation-runtime";
import { resolveOutboundSendDep } from "openclaw/plugin-sdk/outbound-runtime";
import { chunkTextForOutbound as chunkTextForOutbound$1 } from "openclaw/plugin-sdk/text-chunking";
import { normalizeAccountId as normalizeAccountId$3 } from "openclaw/plugin-sdk/account-id";
import { closeDispatcher, createPinnedDispatcher, isPrivateOrLoopbackHost, resolvePinnedHostnameWithPolicy } from "openclaw/plugin-sdk/ssrf-runtime";
import { ToolAuthorizationError, createActionGate, jsonResult, readNumberParam, readReactionParams, readStringArrayParam, readStringParam } from "openclaw/plugin-sdk/channel-actions";
import "openclaw/plugin-sdk/channel-inbound";
import "openclaw/plugin-sdk/channel-feedback";
import { GROUP_POLICY_BLOCKED_LABEL, resolveAllowlistProviderRuntimeGroupPolicy, resolveDefaultGroupPolicy, warnMissingProviderGroupPolicyFallbackOnce } from "openclaw/plugin-sdk/config-runtime";
import { addWildcardAllowFrom, formatDocsLink, hasConfiguredSecretInput, mergeAllowFromEntries, promptAccountId, promptChannelAccessConfig, splitSetupEntries } from "openclaw/plugin-sdk/setup";
import "openclaw/plugin-sdk/inbound-reply-dispatch";
import { resolveConfiguredAcpBindingRecord } from "openclaw/plugin-sdk/acp-binding-runtime";
import "openclaw/plugin-sdk/channel-status";
import { resolveAgentIdFromSessionKey as resolveAgentIdFromSessionKey$1 } from "openclaw/plugin-sdk/routing";
import "openclaw/plugin-sdk/channel-reply-pipeline";
import { loadOutboundMediaFromUrl } from "openclaw/plugin-sdk/outbound-media";
import { normalizePollInput } from "openclaw/plugin-sdk/media-runtime";
import { writeJsonFileAtomically as writeJsonFileAtomically$1 } from "openclaw/plugin-sdk/json-store";
import "openclaw/plugin-sdk/channel-targets";
import { formatZonedTimestamp } from "openclaw/plugin-sdk/matrix-runtime-shared";
//#region extensions/matrix/src/runtime-api.ts
function buildTimeoutAbortSignal(params) {
	const { timeoutMs, signal } = params;
	if (!timeoutMs && !signal) return {
		signal: void 0,
		cleanup: () => {}
	};
	if (!timeoutMs) return {
		signal,
		cleanup: () => {}
	};
	const controller = new AbortController();
	const timeoutId = setTimeout(controller.abort.bind(controller), timeoutMs);
	const onAbort = () => controller.abort();
	if (signal) if (signal.aborted) controller.abort();
	else signal.addEventListener("abort", onAbort, { once: true });
	return {
		signal: controller.signal,
		cleanup: () => {
			clearTimeout(timeoutId);
			signal?.removeEventListener("abort", onAbort);
		}
	};
}
//#endregion
export { resolvePinnedHostnameWithPolicy as A, readStringArrayParam as C, resolveConfiguredAcpBindingRecord as D, resolveAllowlistProviderRuntimeGroupPolicy as E, writeJsonFileAtomically$1 as F, resolveThreadBindingMaxAgeMsForChannel as M, splitSetupEntries as N, resolveDefaultGroupPolicy as O, warnMissingProviderGroupPolicyFallbackOnce as P, readReactionParams as S, resolveAgentIdFromSessionKey$1 as T, normalizeAccountId$3 as _, chunkTextForOutbound$1 as a, promptChannelAccessConfig as b, createPinnedDispatcher as c, getSessionBindingService$1 as d, hasConfiguredSecretInput as f, mergeAllowFromEntries as g, loadOutboundMediaFromUrl as h, buildTimeoutAbortSignal as i, resolveThreadBindingIdleTimeoutMsForChannel as j, resolveOutboundSendDep as k, formatDocsLink as l, jsonResult as m, ToolAuthorizationError as n, closeDispatcher as o, isPrivateOrLoopbackHost as p, addWildcardAllowFrom as r, createActionGate as s, GROUP_POLICY_BLOCKED_LABEL as t, formatZonedTimestamp as u, normalizePollInput as v, readStringParam as w, readNumberParam as x, promptAccountId as y };
