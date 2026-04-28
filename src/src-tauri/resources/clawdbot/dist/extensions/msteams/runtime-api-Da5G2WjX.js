import { mergeAllowlist, resolveAllowlistMatchSimple, summarizeMapping } from "openclaw/plugin-sdk/allow-from";
import { createChannelPairingController } from "openclaw/plugin-sdk/channel-pairing";
import { evaluateSenderGroupAccessForPolicy, readStoreAllowFromForDmPolicy, resolveDmGroupAccessWithLists, resolveEffectiveAllowFromLists, resolveSenderScopedGroupPolicy, resolveToolsBySender } from "openclaw/plugin-sdk/channel-policy";
import { DEFAULT_ACCOUNT_ID } from "openclaw/plugin-sdk/account-id";
import { logTypingFailure } from "openclaw/plugin-sdk/channel-logging";
import { createChannelReplyPipeline } from "openclaw/plugin-sdk/channel-reply-pipeline";
import { PAIRING_APPROVED_MESSAGE, buildProbeChannelStatusSummary, createDefaultChannelRuntimeState } from "openclaw/plugin-sdk/channel-status";
import { buildChannelKeyCandidates, normalizeChannelSlug, resolveChannelEntryMatchWithFallback, resolveNestedAllowlistDecision } from "openclaw/plugin-sdk/channel-targets";
import { isDangerousNameMatchingEnabled } from "openclaw/plugin-sdk/dangerous-name-runtime";
import { resolveDefaultGroupPolicy } from "openclaw/plugin-sdk/runtime-group-policy";
import { withFileLock as withFileLock$1 } from "openclaw/plugin-sdk/file-lock";
import { keepHttpServerTaskAlive } from "openclaw/plugin-sdk/channel-lifecycle";
import { detectMime, extensionForMime, extractOriginalFilename, getFileExtension, resolveChannelMediaMaxBytes } from "openclaw/plugin-sdk/media-runtime";
import { dispatchReplyFromConfigWithSettledDispatcher as dispatchReplyFromConfigWithSettledDispatcher$1 } from "openclaw/plugin-sdk/inbound-reply-dispatch";
import { loadOutboundMediaFromUrl } from "openclaw/plugin-sdk/outbound-media";
import { buildMediaPayload } from "openclaw/plugin-sdk/reply-payload";
import { fetchWithSsrFGuard as fetchWithSsrFGuard$1 } from "openclaw/plugin-sdk/ssrf-runtime";
import { normalizeStringEntries } from "openclaw/plugin-sdk/string-normalization-runtime";
import { chunkTextForOutbound } from "openclaw/plugin-sdk/text-chunking";
import { DEFAULT_WEBHOOK_MAX_BODY_BYTES } from "openclaw/plugin-sdk/webhook-ingress";
import { createPluginRuntimeStore } from "openclaw/plugin-sdk/runtime-store";
//#region extensions/msteams/src/runtime.ts
const { setRuntime: setMSTeamsRuntime, getRuntime: getMSTeamsRuntime } = createPluginRuntimeStore({
	pluginId: "msteams",
	errorMessage: "MSTeams runtime not initialized"
});
//#endregion
export { resolveDmGroupAccessWithLists as A, normalizeChannelSlug as C, resolveChannelEntryMatchWithFallback as D, resolveAllowlistMatchSimple as E, summarizeMapping as F, withFileLock$1 as I, getMSTeamsRuntime as L, resolveNestedAllowlistDecision as M, resolveSenderScopedGroupPolicy as N, resolveChannelMediaMaxBytes as O, resolveToolsBySender as P, setMSTeamsRuntime as R, mergeAllowlist as S, readStoreAllowFromForDmPolicy as T, getFileExtension as _, buildMediaPayload as a, loadOutboundMediaFromUrl as b, createChannelPairingController as c, detectMime as d, dispatchReplyFromConfigWithSettledDispatcher$1 as f, fetchWithSsrFGuard$1 as g, extractOriginalFilename as h, buildChannelKeyCandidates as i, resolveEffectiveAllowFromLists as j, resolveDefaultGroupPolicy as k, createChannelReplyPipeline as l, extensionForMime as m, DEFAULT_WEBHOOK_MAX_BODY_BYTES as n, buildProbeChannelStatusSummary as o, evaluateSenderGroupAccessForPolicy as p, PAIRING_APPROVED_MESSAGE as r, chunkTextForOutbound as s, DEFAULT_ACCOUNT_ID as t, createDefaultChannelRuntimeState as u, isDangerousNameMatchingEnabled as v, normalizeStringEntries as w, logTypingFailure as x, keepHttpServerTaskAlive as y };
