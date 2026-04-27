import { n as resolvePreferredOpenClawTmpDir } from "../tmp-openclaw-dir-CoGSA-7K.js";
import { h as MarkdownConfigSchema } from "../zod-schema.core-BR1v7ukx.js";
import { r as buildChannelConfigSchema } from "../config-schema-BEuj464I.js";
import { n as normalizeAccountId, t as DEFAULT_ACCOUNT_ID } from "../account-id-C3j_3_su.js";
import { c as ToolPolicySchema } from "../zod-schema.agent-runtime-C-c82OTL.js";
import { i as loadBundledPluginPublicSurfaceModuleSync } from "../facade-loader-2P4UQTnv.js";
import { b as sendPayloadWithChunkedTextAndMedia, f as resolveOutboundMediaUrls, g as sendMediaWithLeadingCaption, i as deliverTextOrMediaReply, l as isNumericTargetId, m as resolveSendableOutboundReplyParts } from "../reply-payload-COWCxmsk.js";
import { n as deleteAccountFromConfigSection, r as setAccountEnabledInConfigSection } from "../config-helpers-CsJ8cmDG.js";
import { n as formatPairingApproveHint } from "../helpers-TGDlD7dJ.js";
import { t as createAccountListHelpers } from "../account-helpers-BXEoBg1h.js";
import { n as emptyPluginConfigSchema } from "../config-schema-BDzJIh_2.js";
import { l as patchScopedAccountConfig, n as applySetupAccountConfigPatch, s as migrateBaseNameToDefaultAccount, t as applyAccountNameToChannelSection } from "../setup-helpers-CErkrrS9.js";
import { i as resolveMentionGatingWithBypass, n as resolveInboundMentionDecision, r as resolveMentionGating } from "../mention-gating-B3vlGf1T.js";
import { i as mergeAllowlist, o as summarizeMapping } from "../resolve-utils-nNCaaJHG.js";
import { t as formatAllowFromLowercase } from "../allow-from-BCtr_DMW.js";
import { a as warnMissingProviderGroupPolicyFallbackOnce, i as resolveOpenProviderRuntimeGroupPolicy, r as resolveDefaultGroupPolicy } from "../runtime-group-policy-C-ntqoF6.js";
import { n as isDangerousNameMatchingEnabled } from "../dangerous-name-matching-wQgGIYE0.js";
import { a as resolveSenderScopedGroupPolicy, t as evaluateGroupRouteAccessForPolicy } from "../group-access-Dzf-PegR.js";
import { X as setTopLevelChannelDmPolicyWithAllowFrom, t as addWildcardAllowFrom, v as mergeAllowFromEntries } from "../setup-wizard-helpers-B8Qrpsoj.js";
import { t as createChannelReplyPipeline } from "../channel-reply-pipeline-zp0MNhbR.js";
import { n as createChannelPairingController } from "../channel-pairing-DF6gWII4.js";
import { t as buildBaseAccountStatusSnapshot } from "../status-helpers-Jbf-oZqp.js";
import { t as formatResolvedUnresolvedNote } from "../setup-Bk02jGjc.js";
import { t as createOptionalChannelSetupSurface } from "../channel-setup-ByPYNtWa.js";
import { t as loadOutboundMediaFromUrl } from "../outbound-media-Crb_x_N8.js";
import { t as chunkTextForOutbound } from "../text-chunking-CnW9V_2f.js";
import { a as resolveSenderCommandAuthorization } from "../command-auth-Cu1JGJnK.js";
import { r as buildChannelSendResult } from "../channel-send-result-Rm0tzVhB.js";
import { t as resolveChannelAccountConfigBasePath } from "../config-paths-BvXxA-p5.js";
//#region src/plugin-sdk/zalouser.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "zalouser",
		artifactBasename: "contract-api.js"
	});
}
const collectZalouserSecurityAuditFindings = ((...args) => loadFacadeModule().collectZalouserSecurityAuditFindings(...args));
const zalouserSetup = createOptionalChannelSetupSurface({
	channel: "zalouser",
	label: "Zalo Personal",
	npmSpec: "@openclaw/zalouser",
	docsPath: "/channels/zalouser"
});
const zalouserSetupAdapter = zalouserSetup.setupAdapter;
const zalouserSetupWizard = zalouserSetup.setupWizard;
//#endregion
export { DEFAULT_ACCOUNT_ID, MarkdownConfigSchema, ToolPolicySchema, addWildcardAllowFrom, applyAccountNameToChannelSection, applySetupAccountConfigPatch, buildBaseAccountStatusSnapshot, buildChannelConfigSchema, buildChannelSendResult, chunkTextForOutbound, collectZalouserSecurityAuditFindings, createAccountListHelpers, createChannelPairingController, createChannelReplyPipeline, deleteAccountFromConfigSection, deliverTextOrMediaReply, emptyPluginConfigSchema, evaluateGroupRouteAccessForPolicy, formatAllowFromLowercase, formatPairingApproveHint, formatResolvedUnresolvedNote, isDangerousNameMatchingEnabled, isNumericTargetId, loadOutboundMediaFromUrl, mergeAllowFromEntries, mergeAllowlist, migrateBaseNameToDefaultAccount, normalizeAccountId, patchScopedAccountConfig, resolveChannelAccountConfigBasePath, resolveDefaultGroupPolicy, resolveInboundMentionDecision, resolveMentionGating, resolveMentionGatingWithBypass, resolveOpenProviderRuntimeGroupPolicy, resolveOutboundMediaUrls, resolvePreferredOpenClawTmpDir, resolveSendableOutboundReplyParts, resolveSenderCommandAuthorization, resolveSenderScopedGroupPolicy, sendMediaWithLeadingCaption, sendPayloadWithChunkedTextAndMedia, setAccountEnabledInConfigSection, setTopLevelChannelDmPolicyWithAllowFrom, summarizeMapping, warnMissingProviderGroupPolicyFallbackOnce, zalouserSetupAdapter, zalouserSetupWizard };
