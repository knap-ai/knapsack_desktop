import { t as formatDocsLink } from "../links-rWevNMpC.js";
import { s as isSecretRef } from "../types.secrets-Zn5Zyn7M.js";
import { r as buildChannelConfigSchema } from "../config-schema-BEuj464I.js";
import { n as normalizeAccountId, t as DEFAULT_ACCOUNT_ID } from "../account-id-C3j_3_su.js";
import { s as getChatChannelMeta } from "../registry-B9khhdbq.js";
import { n as GoogleChatConfigSchema } from "../zod-schema.providers-core-Bl_XI-8U.js";
import { n as fetchWithSsrFGuard } from "../fetch-guard-DKbwHPzH.js";
import { a as createActionGate, f as readNumberParam, g as readStringParam, l as jsonResult, p as readReactionParams } from "../common-B4WrK_Ib.js";
import { t as loadWebMedia } from "../web-media-CA1OunRg.js";
import { n as fetchRemoteMedia } from "../fetch-p2uITHmD.js";
import { n as resolveChannelGroupRequireMention } from "../group-policy-CDJmvoGe.js";
import { n as missingTargetError } from "../target-errors-Co5gkCsD.js";
import { n as deleteAccountFromConfigSection, r as setAccountEnabledInConfigSection } from "../config-helpers-CsJ8cmDG.js";
import { n as formatPairingApproveHint } from "../helpers-TGDlD7dJ.js";
import { t as createAccountListHelpers } from "../account-helpers-BXEoBg1h.js";
import { n as emptyPluginConfigSchema } from "../config-schema-BDzJIh_2.js";
import { n as applySetupAccountConfigPatch, s as migrateBaseNameToDefaultAccount, t as applyAccountNameToChannelSection } from "../setup-helpers-CErkrrS9.js";
import { i as resolveMentionGatingWithBypass, n as resolveInboundMentionDecision, r as resolveMentionGating } from "../mention-gating-B3vlGf1T.js";
import { r as runPassiveAccountLifecycle, t as createAccountStatusSink } from "../channel-lifecycle.core-BnEmMwfO.js";
import { a as warnMissingProviderGroupPolicyFallbackOnce, n as resolveAllowlistProviderRuntimeGroupPolicy, r as resolveDefaultGroupPolicy, t as GROUP_POLICY_BLOCKED_LABEL } from "../runtime-group-policy-C-ntqoF6.js";
import "../channel-policy-z64fOzIr.js";
import { n as isDangerousNameMatchingEnabled } from "../dangerous-name-matching-wQgGIYE0.js";
import { a as resolveSenderScopedGroupPolicy, t as evaluateGroupRouteAccessForPolicy } from "../group-access-Dzf-PegR.js";
import { o as resolveDmGroupAccessWithLists } from "../dm-policy-shared-CF1kNTSS.js";
import { c as listDirectoryUserEntriesFromAllowFrom, o as listDirectoryGroupEntriesFromMapKeys } from "../directory-config-helpers-vZwa2pcs.js";
import { t as resolveChannelMediaMaxBytes } from "../media-limits-DYln5NHj.js";
import { Q as splitSetupEntries, X as setTopLevelChannelDmPolicyWithAllowFrom, t as addWildcardAllowFrom, v as mergeAllowFromEntries } from "../setup-wizard-helpers-B8Qrpsoj.js";
import { t as PAIRING_APPROVED_MESSAGE } from "../pairing-message-D_jmgW5W.js";
import { t as createChannelReplyPipeline } from "../channel-reply-pipeline-zp0MNhbR.js";
import { n as createChannelPairingController } from "../channel-pairing-DF6gWII4.js";
import { r as buildComputedAccountStatusSnapshot } from "../status-helpers-Jbf-oZqp.js";
import { t as extractToolSend } from "../tool-send-7BzeSR9n.js";
import { a as createWebhookInFlightLimiter, i as beginWebhookRequestPipelineOrReject, s as readJsonWebhookBodyOrReject } from "../webhook-request-guards-BcN30fL1.js";
import { n as resolveWebhookPath } from "../webhook-path-fOHmFm_o.js";
import { c as resolveWebhookTargets, l as withResolvedWebhookRequestPipeline, n as registerWebhookTargetWithPluginRoute, o as resolveWebhookTargetWithAuthOrReject } from "../webhook-targets-BxJSNvH9.js";
import "../webhook-ingress-S9T0oiq6.js";
import { t as createOptionalChannelSetupSurface } from "../channel-setup-ByPYNtWa.js";
import { r as resolveInboundRouteEnvelopeBuilderWithRuntime } from "../inbound-envelope-D_m2MAPM.js";
import "../web-media-Bb3gpr-C.js";
import { t as loadOutboundMediaFromUrl } from "../outbound-media-Crb_x_N8.js";
import { t as chunkTextForOutbound } from "../text-chunking-CnW9V_2f.js";
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
