import { n as resolvePreferredOpenClawTmpDir } from "../tmp-openclaw-dir-WEYPFjsW.js";
import { n as normalizeAccountId, t as DEFAULT_ACCOUNT_ID } from "../account-id-DhSD7lhD.js";
import { h as MarkdownConfigSchema } from "../zod-schema.core-Dkd4NgDa.js";
import { r as buildChannelConfigSchema } from "../config-schema-Di5PBhdS.js";
import { l as ToolPolicySchema } from "../zod-schema.agent-runtime-CcRKs3kU.js";
import { i as loadBundledPluginPublicSurfaceModuleSync } from "../facade-loader-BAtcmKGO.js";
import { b as sendPayloadWithChunkedTextAndMedia, f as resolveOutboundMediaUrls, g as sendMediaWithLeadingCaption, i as deliverTextOrMediaReply, l as isNumericTargetId, m as resolveSendableOutboundReplyParts } from "../reply-payload-Cy4FCQXC.js";
import { n as deleteAccountFromConfigSection, r as setAccountEnabledInConfigSection } from "../config-helpers-DWMJguLB.js";
import { n as formatPairingApproveHint } from "../helpers-DacXri_3.js";
import { t as createAccountListHelpers } from "../account-helpers-CHOojGMz.js";
import { n as emptyPluginConfigSchema } from "../config-schema-CBtJ4osk.js";
import { l as patchScopedAccountConfig, n as applySetupAccountConfigPatch, s as migrateBaseNameToDefaultAccount, t as applyAccountNameToChannelSection } from "../setup-helpers-CWjxgWew.js";
import { i as resolveMentionGatingWithBypass, n as resolveInboundMentionDecision, r as resolveMentionGating } from "../mention-gating-CNvLDrnW.js";
import { i as mergeAllowlist, o as summarizeMapping } from "../resolve-utils-BJoNTtkf.js";
import { t as formatAllowFromLowercase } from "../allow-from-BNuy8DH5.js";
import { a as warnMissingProviderGroupPolicyFallbackOnce, i as resolveOpenProviderRuntimeGroupPolicy, r as resolveDefaultGroupPolicy } from "../runtime-group-policy-BgTcv0Si.js";
import { n as isDangerousNameMatchingEnabled } from "../dangerous-name-matching-BixRCsA4.js";
import { a as resolveSenderScopedGroupPolicy, t as evaluateGroupRouteAccessForPolicy } from "../group-access-N9qDc8PQ.js";
import { X as setTopLevelChannelDmPolicyWithAllowFrom, t as addWildcardAllowFrom, v as mergeAllowFromEntries } from "../setup-wizard-helpers-CCAvauB7.js";
import { t as createChannelReplyPipeline } from "../channel-reply-pipeline-BYR66qkC.js";
import { n as createChannelPairingController } from "../channel-pairing-DFE8Potd.js";
import { t as buildBaseAccountStatusSnapshot } from "../status-helpers-C00ai5Oy.js";
import { t as formatResolvedUnresolvedNote } from "../setup-CScHqsli.js";
import { t as createOptionalChannelSetupSurface } from "../channel-setup-DXcxitmF.js";
import { t as loadOutboundMediaFromUrl } from "../outbound-media-CEp-pdL2.js";
import { t as chunkTextForOutbound } from "../text-chunking-BEGwlstH.js";
import { a as resolveSenderCommandAuthorization } from "../command-auth-ByDn3Wc-.js";
import { r as buildChannelSendResult } from "../channel-send-result-zfdTkGD0.js";
import { t as resolveChannelAccountConfigBasePath } from "../config-paths-D1ifO3Wl.js";
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
