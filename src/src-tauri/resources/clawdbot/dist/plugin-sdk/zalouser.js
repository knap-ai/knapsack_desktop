import { n as resolvePreferredOpenClawTmpDir } from "../tmp-openclaw-dir-eyAoWbVe.js";
import { h as MarkdownConfigSchema } from "../zod-schema.core-CYrn8zgQ.js";
import { r as buildChannelConfigSchema } from "../config-schema-sgVTuroC.js";
import { n as normalizeAccountId, t as DEFAULT_ACCOUNT_ID } from "../account-id-j7GeQlaZ.js";
import { c as ToolPolicySchema } from "../zod-schema.agent-runtime-BSPBF_O_.js";
import { i as loadBundledPluginPublicSurfaceModuleSync } from "../facade-loader-CGu7k8Om.js";
import { d as resolveOutboundMediaUrls, h as sendMediaWithLeadingCaption, i as deliverTextOrMediaReply, l as isNumericTargetId, p as resolveSendableOutboundReplyParts, y as sendPayloadWithChunkedTextAndMedia } from "../reply-payload-Db_8BQiX.js";
import { n as deleteAccountFromConfigSection, r as setAccountEnabledInConfigSection } from "../config-helpers-BnrSrKhR.js";
import { t as createAccountListHelpers } from "../account-helpers-BWbrvOLB.js";
import { n as formatPairingApproveHint } from "../helpers-D33sU6YZ.js";
import { n as emptyPluginConfigSchema } from "../config-schema-BJSXw2hl.js";
import { l as patchScopedAccountConfig, n as applySetupAccountConfigPatch, s as migrateBaseNameToDefaultAccount, t as applyAccountNameToChannelSection } from "../setup-helpers-NxWLbAbV.js";
import { i as resolveMentionGatingWithBypass, n as resolveInboundMentionDecision, r as resolveMentionGating } from "../mention-gating-hCKSH1UX.js";
import { i as mergeAllowlist, o as summarizeMapping } from "../resolve-utils-D-hsUiqA.js";
import { t as formatAllowFromLowercase } from "../allow-from-3zjA49Rt.js";
import { a as warnMissingProviderGroupPolicyFallbackOnce, i as resolveOpenProviderRuntimeGroupPolicy, r as resolveDefaultGroupPolicy } from "../runtime-group-policy-B7-UthCu.js";
import { n as isDangerousNameMatchingEnabled } from "../dangerous-name-matching-C88BNn_A.js";
import { a as resolveSenderScopedGroupPolicy, t as evaluateGroupRouteAccessForPolicy } from "../group-access-CH5DRjVf.js";
import { X as setTopLevelChannelDmPolicyWithAllowFrom, t as addWildcardAllowFrom, v as mergeAllowFromEntries } from "../setup-wizard-helpers-C8R_wm_7.js";
import { t as createChannelReplyPipeline } from "../channel-reply-pipeline-DHFpjrzi.js";
import { n as createChannelPairingController } from "../channel-pairing-DMzs787S.js";
import { t as buildBaseAccountStatusSnapshot } from "../status-helpers-BEDVo_4L.js";
import { t as formatResolvedUnresolvedNote } from "../setup-Ben3xLZg.js";
import { t as createOptionalChannelSetupSurface } from "../channel-setup-CXvL-Qpc.js";
import { t as loadOutboundMediaFromUrl } from "../outbound-media-DUQMvysg.js";
import { t as chunkTextForOutbound } from "../text-chunking-CtENq2zv.js";
import { a as resolveSenderCommandAuthorization } from "../command-auth-Da7bqm4r.js";
import { r as buildChannelSendResult } from "../channel-send-result-ticJ0Xvk.js";
import { t as resolveChannelAccountConfigBasePath } from "../config-paths-CXxVwhBi.js";
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
