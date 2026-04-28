import { t as formatDocsLink } from "../links-BszRQhGa.js";
import { s as isSecretRef } from "../types.secrets-ClP-vJ-P.js";
import { n as normalizeAccountId, t as DEFAULT_ACCOUNT_ID } from "../account-id-DhSD7lhD.js";
import { r as buildChannelConfigSchema } from "../config-schema-Di5PBhdS.js";
import { s as getChatChannelMeta } from "../registry-GHcDenJ3.js";
import { n as GoogleChatConfigSchema } from "../zod-schema.providers-core-DHTvT0Zy.js";
import { n as fetchWithSsrFGuard } from "../fetch-guard-8smVA_M-.js";
import { n as fetchRemoteMedia } from "../fetch-3KGMv703.js";
import { a as createActionGate, f as readNumberParam, g as readStringParam, l as jsonResult, p as readReactionParams } from "../common-C4RGIxnG.js";
import { t as loadWebMedia } from "../web-media-9UYLzIiN.js";
import { n as resolveChannelGroupRequireMention } from "../group-policy-BUH7JoX8.js";
import { n as missingTargetError } from "../target-errors-SGzTAriK.js";
import { n as deleteAccountFromConfigSection, r as setAccountEnabledInConfigSection } from "../config-helpers-DWMJguLB.js";
import { n as formatPairingApproveHint } from "../helpers-DacXri_3.js";
import { t as createAccountListHelpers } from "../account-helpers-CHOojGMz.js";
import { n as emptyPluginConfigSchema } from "../config-schema-CBtJ4osk.js";
import { n as applySetupAccountConfigPatch, s as migrateBaseNameToDefaultAccount, t as applyAccountNameToChannelSection } from "../setup-helpers-CWjxgWew.js";
import { i as resolveMentionGatingWithBypass, n as resolveInboundMentionDecision, r as resolveMentionGating } from "../mention-gating-CNvLDrnW.js";
import { r as runPassiveAccountLifecycle, t as createAccountStatusSink } from "../channel-lifecycle.core-C1iWveR9.js";
import { a as warnMissingProviderGroupPolicyFallbackOnce, n as resolveAllowlistProviderRuntimeGroupPolicy, r as resolveDefaultGroupPolicy, t as GROUP_POLICY_BLOCKED_LABEL } from "../runtime-group-policy-BgTcv0Si.js";
import "../channel-policy-D_qJHct1.js";
import { n as isDangerousNameMatchingEnabled } from "../dangerous-name-matching-BixRCsA4.js";
import { a as resolveSenderScopedGroupPolicy, t as evaluateGroupRouteAccessForPolicy } from "../group-access-N9qDc8PQ.js";
import { o as resolveDmGroupAccessWithLists } from "../dm-policy-shared-DzT5EPsb.js";
import { c as listDirectoryUserEntriesFromAllowFrom, o as listDirectoryGroupEntriesFromMapKeys } from "../directory-config-helpers-D_VhabsK.js";
import { t as resolveChannelMediaMaxBytes } from "../media-limits-DbrPRQ0r.js";
import { Q as splitSetupEntries, X as setTopLevelChannelDmPolicyWithAllowFrom, t as addWildcardAllowFrom, v as mergeAllowFromEntries } from "../setup-wizard-helpers-CCAvauB7.js";
import { t as PAIRING_APPROVED_MESSAGE } from "../pairing-message-D9zbnODE.js";
import { t as createChannelReplyPipeline } from "../channel-reply-pipeline-BYR66qkC.js";
import { n as createChannelPairingController } from "../channel-pairing-DFE8Potd.js";
import { r as buildComputedAccountStatusSnapshot } from "../status-helpers-C00ai5Oy.js";
import { t as extractToolSend } from "../tool-send-BxghT2DW.js";
import { a as createWebhookInFlightLimiter, i as beginWebhookRequestPipelineOrReject, s as readJsonWebhookBodyOrReject } from "../webhook-request-guards-D97L2HdA.js";
import { n as resolveWebhookPath } from "../webhook-path-Bsl9dK_8.js";
import { c as resolveWebhookTargets, l as withResolvedWebhookRequestPipeline, n as registerWebhookTargetWithPluginRoute, o as resolveWebhookTargetWithAuthOrReject } from "../webhook-targets-CduZ45Oa.js";
import "../webhook-ingress-CAGeq6oN.js";
import { t as createOptionalChannelSetupSurface } from "../channel-setup-DXcxitmF.js";
import { r as resolveInboundRouteEnvelopeBuilderWithRuntime } from "../inbound-envelope-CuFtsbNG.js";
import "../web-media-CCayMqnh.js";
import { t as loadOutboundMediaFromUrl } from "../outbound-media-CEp-pdL2.js";
import { t as chunkTextForOutbound } from "../text-chunking-BEGwlstH.js";
//#region src/plugin-sdk/googlechat.ts
function resolveGoogleChatGroupRequireMention(params) {
	return resolveChannelGroupRequireMention({
		cfg: params.cfg,
		channel: "googlechat",
		groupId: params.groupId,
		accountId: params.accountId
	});
}
const googlechatSetup = createOptionalChannelSetupSurface({
	channel: "googlechat",
	label: "Google Chat",
	npmSpec: "@openclaw/googlechat",
	docsPath: "/channels/googlechat"
});
const googlechatSetupAdapter = googlechatSetup.setupAdapter;
const googlechatSetupWizard = googlechatSetup.setupWizard;
//#endregion
export { DEFAULT_ACCOUNT_ID, GROUP_POLICY_BLOCKED_LABEL, GoogleChatConfigSchema, PAIRING_APPROVED_MESSAGE, addWildcardAllowFrom, applyAccountNameToChannelSection, applySetupAccountConfigPatch, beginWebhookRequestPipelineOrReject, buildChannelConfigSchema, buildComputedAccountStatusSnapshot, chunkTextForOutbound, createAccountListHelpers, createAccountStatusSink, createActionGate, createChannelPairingController, createChannelReplyPipeline, createWebhookInFlightLimiter, deleteAccountFromConfigSection, emptyPluginConfigSchema, evaluateGroupRouteAccessForPolicy, extractToolSend, fetchRemoteMedia, fetchWithSsrFGuard, formatDocsLink, formatPairingApproveHint, getChatChannelMeta, googlechatSetupAdapter, googlechatSetupWizard, isDangerousNameMatchingEnabled, isSecretRef, jsonResult, listDirectoryGroupEntriesFromMapKeys, listDirectoryUserEntriesFromAllowFrom, loadOutboundMediaFromUrl, loadWebMedia, mergeAllowFromEntries, migrateBaseNameToDefaultAccount, missingTargetError, normalizeAccountId, readJsonWebhookBodyOrReject, readNumberParam, readReactionParams, readStringParam, registerWebhookTargetWithPluginRoute, resolveAllowlistProviderRuntimeGroupPolicy, resolveChannelMediaMaxBytes, resolveDefaultGroupPolicy, resolveDmGroupAccessWithLists, resolveGoogleChatGroupRequireMention, resolveInboundMentionDecision, resolveInboundRouteEnvelopeBuilderWithRuntime, resolveMentionGating, resolveMentionGatingWithBypass, resolveSenderScopedGroupPolicy, resolveWebhookPath, resolveWebhookTargetWithAuthOrReject, resolveWebhookTargets, runPassiveAccountLifecycle, setAccountEnabledInConfigSection, setTopLevelChannelDmPolicyWithAllowFrom, splitSetupEntries, warnMissingProviderGroupPolicyFallbackOnce, withResolvedWebhookRequestPipeline };
