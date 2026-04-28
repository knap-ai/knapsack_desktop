import { t as formatDocsLink } from "../links-BszRQhGa.js";
import { _ as sleep } from "../utils-DvkbxKCZ.js";
import { l as normalizeResolvedSecretInputString, o as hasConfiguredSecretInput, u as normalizeSecretInputString } from "../types.secrets-ClP-vJ-P.js";
import { t as DEFAULT_ACCOUNT_ID } from "../account-id-DhSD7lhD.js";
import { s as normalizeStringEntries } from "../string-normalization-Cz5hTdB3.js";
import { r as buildChannelConfigSchema } from "../config-schema-Di5PBhdS.js";
import { i as MSTeamsConfigSchema } from "../zod-schema.providers-core-DHTvT0Zy.js";
import { a as withFileLock } from "../file-lock-BQHS1IIm.js";
import { a as resolveChannelEntryMatchWithFallback, n as buildChannelKeyCandidates, r as normalizeChannelSlug, s as resolveNestedAllowlistDecision } from "../channel-config-NQAKxANV.js";
import { a as resolveAllowlistMatchSimple, n as formatAllowlistMatchMeta } from "../allowlist-match-BvNqTFh5.js";
import { u as isPrivateIpAddress } from "../ssrf-K8pX0Zi6.js";
import { n as fetchWithSsrFGuard } from "../fetch-guard-8smVA_M-.js";
import { i as getFileExtension, n as detectMime, r as extensionForMime } from "../mime-B-vvNIo6.js";
import { a as isSilentReplyText, n as SILENT_REPLY_TOKEN } from "../tokens-D3yEVrkk.js";
import { S as buildMediaPayload, f as resolveOutboundMediaUrls, m as resolveSendableOutboundReplyParts } from "../reply-payload-Cy4FCQXC.js";
import { o as extractOriginalFilename } from "../store-L0fSpY73.js";
import { t as loadWebMedia } from "../web-media-9UYLzIiN.js";
import { i as resolveToolsBySender } from "../group-policy-BUH7JoX8.js";
import { n as writeJsonFileAtomically, t as readJsonFileWithFallback } from "../json-store-BEwdd3qq.js";
import { n as emptyPluginConfigSchema } from "../config-schema-CBtJ4osk.js";
import { n as resolveControlCommandGate, r as resolveDualTextControlCommandGate } from "../command-gating-CAzf7x74.js";
import { i as resolveMentionGatingWithBypass, n as resolveInboundMentionDecision, r as resolveMentionGating } from "../mention-gating-CNvLDrnW.js";
import { n as keepHttpServerTaskAlive } from "../channel-lifecycle.core-C1iWveR9.js";
import { i as mergeAllowlist, o as summarizeMapping } from "../resolve-utils-BJoNTtkf.js";
import { n as resolveAllowlistProviderRuntimeGroupPolicy, r as resolveDefaultGroupPolicy } from "../runtime-group-policy-BgTcv0Si.js";
import { n as isDangerousNameMatchingEnabled } from "../dangerous-name-matching-BixRCsA4.js";
import { a as resolveSenderScopedGroupPolicy, i as evaluateSenderGroupAccessForPolicy } from "../group-access-N9qDc8PQ.js";
import { n as readStoreAllowFromForDmPolicy, o as resolveDmGroupAccessWithLists, s as resolveEffectiveAllowFromLists } from "../dm-policy-shared-DzT5EPsb.js";
import { a as buildPendingHistoryContextFromMap, s as clearHistoryEntriesIfEnabled, t as DEFAULT_GROUP_HISTORY_LIMIT, u as recordPendingHistoryEntryIfEnabled } from "../history-D7zjWV0P.js";
import { n as logInboundDrop, r as logTypingFailure } from "../logging-CF5IrOHO.js";
import { t as resolveChannelMediaMaxBytes } from "../media-limits-DbrPRQ0r.js";
import { Q as splitSetupEntries, X as setTopLevelChannelDmPolicyWithAllowFrom, Y as setTopLevelChannelAllowFrom, Z as setTopLevelChannelGroupPolicy, t as addWildcardAllowFrom, v as mergeAllowFromEntries } from "../setup-wizard-helpers-CCAvauB7.js";
import { t as PAIRING_APPROVED_MESSAGE } from "../pairing-message-D9zbnODE.js";
import { t as createChannelReplyPipeline } from "../channel-reply-pipeline-BYR66qkC.js";
import { n as createChannelPairingController } from "../channel-pairing-DFE8Potd.js";
import { a as buildRuntimeAccountStatusSnapshot, d as createDefaultChannelRuntimeState, i as buildProbeChannelStatusSummary, n as buildBaseChannelStatusSummary } from "../status-helpers-C00ai5Oy.js";
import { n as DEFAULT_WEBHOOK_MAX_BODY_BYTES } from "../http-body-DULyPC70.js";
import { t as createOptionalChannelSetupSurface } from "../channel-setup-DXcxitmF.js";
import { n as filterSupplementalContextItems, r as shouldIncludeSupplementalContext } from "../context-visibility-CPmLQtEe.js";
import { t as resolveChannelContextVisibilityMode } from "../context-visibility-BB_lrk_J.js";
import { r as dispatchReplyFromConfigWithSettledDispatcher } from "../inbound-reply-dispatch-BJCyKZ9L.js";
import "../web-media-CCayMqnh.js";
import { t as loadOutboundMediaFromUrl } from "../outbound-media-CEp-pdL2.js";
import { a as isHttpsUrlAllowedByHostnameSuffixAllowlist, l as normalizeHostnameSuffixAllowlist, n as buildHostnameAllowlistPolicyFromSuffixAllowlist } from "../ssrf-policy-BMzLPvV8.js";
import { t as chunkTextForOutbound } from "../text-chunking-BEGwlstH.js";
import { t as resolveInboundSessionEnvelopeContext } from "../session-envelope-BTzMPjLE.js";
//#region src/plugin-sdk/msteams.ts
const msteamsSetup = createOptionalChannelSetupSurface({
	channel: "msteams",
	label: "Microsoft Teams",
	npmSpec: "@openclaw/msteams",
	docsPath: "/channels/msteams"
});
const msteamsSetupWizard = msteamsSetup.setupWizard;
const msteamsSetupAdapter = msteamsSetup.setupAdapter;
//#endregion
export { DEFAULT_ACCOUNT_ID, DEFAULT_GROUP_HISTORY_LIMIT, DEFAULT_WEBHOOK_MAX_BODY_BYTES, MSTeamsConfigSchema, PAIRING_APPROVED_MESSAGE, SILENT_REPLY_TOKEN, addWildcardAllowFrom, buildBaseChannelStatusSummary, buildChannelConfigSchema, buildChannelKeyCandidates, buildHostnameAllowlistPolicyFromSuffixAllowlist, buildMediaPayload, buildPendingHistoryContextFromMap, buildProbeChannelStatusSummary, buildRuntimeAccountStatusSnapshot, chunkTextForOutbound, clearHistoryEntriesIfEnabled, createChannelPairingController, createChannelReplyPipeline, createDefaultChannelRuntimeState, detectMime, dispatchReplyFromConfigWithSettledDispatcher, emptyPluginConfigSchema, evaluateSenderGroupAccessForPolicy, extensionForMime, extractOriginalFilename, fetchWithSsrFGuard, filterSupplementalContextItems, formatAllowlistMatchMeta, formatDocsLink, getFileExtension, hasConfiguredSecretInput, isDangerousNameMatchingEnabled, isHttpsUrlAllowedByHostnameSuffixAllowlist, isPrivateIpAddress, isSilentReplyText, keepHttpServerTaskAlive, loadOutboundMediaFromUrl, loadWebMedia, logInboundDrop, logTypingFailure, mergeAllowFromEntries, mergeAllowlist, msteamsSetupAdapter, msteamsSetupWizard, normalizeChannelSlug, normalizeHostnameSuffixAllowlist, normalizeResolvedSecretInputString, normalizeSecretInputString, normalizeStringEntries, readJsonFileWithFallback, readStoreAllowFromForDmPolicy, recordPendingHistoryEntryIfEnabled, resolveAllowlistMatchSimple, resolveAllowlistProviderRuntimeGroupPolicy, resolveChannelContextVisibilityMode, resolveChannelEntryMatchWithFallback, resolveChannelMediaMaxBytes, resolveControlCommandGate, resolveDefaultGroupPolicy, resolveDmGroupAccessWithLists, resolveDualTextControlCommandGate, resolveEffectiveAllowFromLists, resolveInboundMentionDecision, resolveInboundSessionEnvelopeContext, resolveMentionGating, resolveMentionGatingWithBypass, resolveNestedAllowlistDecision, resolveOutboundMediaUrls, resolveSendableOutboundReplyParts, resolveSenderScopedGroupPolicy, resolveToolsBySender, setTopLevelChannelAllowFrom, setTopLevelChannelDmPolicyWithAllowFrom, setTopLevelChannelGroupPolicy, shouldIncludeSupplementalContext, sleep, splitSetupEntries, summarizeMapping, withFileLock, writeJsonFileAtomically };
