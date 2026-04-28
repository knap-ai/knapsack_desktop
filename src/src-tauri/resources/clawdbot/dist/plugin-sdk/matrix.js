import { r as redactSensitiveText } from "../redact-Cv5sPU4g.js";
import { t as formatDocsLink } from "../links-BszRQhGa.js";
import { l as normalizeResolvedSecretInputString, o as hasConfiguredSecretInput, u as normalizeSecretInputString } from "../types.secrets-ClP-vJ-P.js";
import { s as isPrivateOrLoopbackHost } from "../net-BBCaEpfz.js";
import { n as normalizeAccountId, r as normalizeOptionalAccountId, t as DEFAULT_ACCOUNT_ID } from "../account-id-DhSD7lhD.js";
import { u as resolveAgentIdFromSessionKey } from "../session-key-hxP9B3Or.js";
import { s as normalizeStringEntries } from "../string-normalization-Cz5hTdB3.js";
import { h as MarkdownConfigSchema } from "../zod-schema.core-Dkd4NgDa.js";
import { r as buildChannelConfigSchema } from "../config-schema-Di5PBhdS.js";
import { s as getChatChannelMeta } from "../registry-GHcDenJ3.js";
import { l as ToolPolicySchema } from "../zod-schema.agent-runtime-CcRKs3kU.js";
import { i as resolveChannelEntryMatch, n as buildChannelKeyCandidates } from "../channel-config-NQAKxANV.js";
import { i as resolveAllowlistMatchByCandidates, n as formatAllowlistMatchMeta, o as resolveCompiledAllowlistMatch, r as resolveAllowlistCandidates, t as compileAllowlist } from "../allowlist-match-BvNqTFh5.js";
import { n as fetchWithSsrFGuard } from "../fetch-guard-8smVA_M-.js";
import { r as getAgentScopedMediaLocalRoots } from "../local-roots-BvdjNS1u.js";
import { t as resolveAckReaction } from "../identity-CviweAtG.js";
import { i as loadBundledPluginPublicSurfaceModuleSync, t as createLazyFacadeArrayValue } from "../facade-loader-BAtcmKGO.js";
import { a as createActionGate, f as readNumberParam, g as readStringParam, l as jsonResult, m as readStringArrayParam, p as readReactionParams } from "../common-C4RGIxnG.js";
import { n as normalizePollInput } from "../polls-T-m992dB.js";
import { n as resolveOutboundSendDep } from "../send-deps-BqoHh6Cq.js";
import { n as deleteAccountFromConfigSection, r as setAccountEnabledInConfigSection } from "../config-helpers-DWMJguLB.js";
import { n as formatPairingApproveHint } from "../helpers-DacXri_3.js";
import { n as writeJsonFileAtomically, t as readJsonFileWithFallback } from "../json-store-BEwdd3qq.js";
import { a as registerSessionBindingAdapter, o as unregisterSessionBindingAdapter, r as getSessionBindingService } from "../session-binding-service-BQV_OJiA.js";
import { t as createAccountListHelpers } from "../account-helpers-CHOojGMz.js";
import { n as emptyPluginConfigSchema } from "../config-schema-CBtJ4osk.js";
import { c as moveSingleAccountChannelSectionToDefaultAccount, t as applyAccountNameToChannelSection } from "../setup-helpers-CWjxgWew.js";
import { n as formatZonedTimestamp } from "../format-datetime-Hf-XA1Zp.js";
import { r as buildSecretInputSchema } from "../secret-input-DpyDR7r6.js";
import { n as resolveControlCommandGate } from "../command-gating-CAzf7x74.js";
import { a as patchAllowlistUsersInConfigEntries, i as mergeAllowlist, n as buildAllowlistResolutionSummary, o as summarizeMapping, r as canonicalizeAllowlistWithResolvedIds, t as addAllowlistUserEntriesFromConfigEntry } from "../resolve-utils-BJoNTtkf.js";
import { a as warnMissingProviderGroupPolicyFallbackOnce, n as resolveAllowlistProviderRuntimeGroupPolicy, r as resolveDefaultGroupPolicy, t as GROUP_POLICY_BLOCKED_LABEL } from "../runtime-group-policy-BgTcv0Si.js";
import { a as resolveSenderScopedGroupPolicy, t as evaluateGroupRouteAccessForPolicy } from "../group-access-N9qDc8PQ.js";
import { n as logInboundDrop, r as logTypingFailure } from "../logging-CF5IrOHO.js";
import { O as promptAccountId, P as promptSingleChannelSecretInput, Z as setTopLevelChannelGroupPolicy, n as buildSingleChannelSecretPromptState, t as addWildcardAllowFrom, v as mergeAllowFromEntries } from "../setup-wizard-helpers-CCAvauB7.js";
import { t as PAIRING_APPROVED_MESSAGE } from "../pairing-message-D9zbnODE.js";
import { n as createReplyPrefixOptions } from "../reply-prefix-DBPareXi.js";
import { t as createTypingCallbacks } from "../typing-DvMRwV16.js";
import { t as createChannelReplyPipeline } from "../channel-reply-pipeline-BYR66qkC.js";
import { n as createChannelPairingController } from "../channel-pairing-DFE8Potd.js";
import { c as collectStatusIssuesFromLastError, i as buildProbeChannelStatusSummary, r as buildComputedAccountStatusSnapshot } from "../status-helpers-C00ai5Oy.js";
import { t as runPluginCommandWithTimeout } from "../run-command-Dn8XvLAC.js";
import { n as resolveRuntimeEnv, t as createLoggerBackedRuntime } from "../runtime-logger-DeGpnr7K.js";
import "../runtime-o2QCXshQ.js";
import { t as promptChannelAccessConfig } from "../setup-group-access-BbBZMMY4.js";
import { t as formatResolvedUnresolvedNote } from "../setup-CScHqsli.js";
import { t as createOptionalChannelSetupSurface } from "../channel-setup-DXcxitmF.js";
import { t as loadOutboundMediaFromUrl } from "../outbound-media-CEp-pdL2.js";
import { n as resolveThreadBindingFarewellText } from "../thread-bindings-messages-B-NBj3dt.js";
import { c as resolveThreadBindingMaxAgeMsForChannel, o as resolveThreadBindingIdleTimeoutMsForChannel } from "../thread-bindings-policy-C8aOK058.js";
import { t as chunkTextForOutbound } from "../text-chunking-BEGwlstH.js";
import "../channel-plugin-common-BuvT-Hg-.js";
import { n as toLocationContext, t as formatLocationText } from "../location-D1jwbB9z.js";
import { n as setMatrixThreadBindingMaxAgeBySessionKey, t as setMatrixThreadBindingIdleTimeoutBySessionKey } from "../matrix-thread-bindings-C-oPLWKn.js";
import { a as resolveMatrixAccountStorageRoot, c as resolveMatrixCredentialsPath, i as resolveConfiguredMatrixAccountIds, l as resolveMatrixDefaultOrOnlyAccountId, n as getMatrixScopedEnvVarNames, o as resolveMatrixChannelConfig, r as requiresExplicitMatrixDefaultAccount, s as resolveMatrixCredentialsDir, t as findMatrixAccountEntry, u as resolveMatrixLegacyFlatStoragePaths } from "../matrix-helper-C9mnCRO-.js";
import { n as setMatrixRuntime, t as resolveMatrixAccountStringValues } from "../matrix-runtime-surface-BjDr1pl7.js";
import { r as resetMatrixThreadBindingsForTests, t as createMatrixThreadBindingManager } from "../matrix-surface-Rdi1oCpf.js";
//#region src/plugin-sdk/matrix.ts
function loadMatrixFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "matrix",
		artifactBasename: "contract-api.js"
	});
}
const singleAccountKeysToMove = createLazyFacadeArrayValue(() => loadMatrixFacadeModule().singleAccountKeysToMove);
const namedAccountPromotionKeys = createLazyFacadeArrayValue(() => loadMatrixFacadeModule().namedAccountPromotionKeys);
const resolveSingleAccountPromotionTarget = ((...args) => loadMatrixFacadeModule().resolveSingleAccountPromotionTarget(...args));
const matrixSetup = createOptionalChannelSetupSurface({
	channel: "matrix",
	label: "Matrix",
	npmSpec: "@openclaw/matrix",
	docsPath: "/channels/matrix"
});
const matrixSetupWizard = matrixSetup.setupWizard;
const matrixSetupAdapter = matrixSetup.setupAdapter;
//#endregion
export { DEFAULT_ACCOUNT_ID, GROUP_POLICY_BLOCKED_LABEL, MarkdownConfigSchema, PAIRING_APPROVED_MESSAGE, ToolPolicySchema, addAllowlistUserEntriesFromConfigEntry, addWildcardAllowFrom, applyAccountNameToChannelSection, buildAllowlistResolutionSummary, buildChannelConfigSchema, buildChannelKeyCandidates, buildComputedAccountStatusSnapshot, buildProbeChannelStatusSummary, buildSecretInputSchema, buildSingleChannelSecretPromptState, canonicalizeAllowlistWithResolvedIds, chunkTextForOutbound, collectStatusIssuesFromLastError, compileAllowlist, createAccountListHelpers, createActionGate, createChannelPairingController, createChannelReplyPipeline, createLoggerBackedRuntime, createMatrixThreadBindingManager, createReplyPrefixOptions, createTypingCallbacks, deleteAccountFromConfigSection, emptyPluginConfigSchema, evaluateGroupRouteAccessForPolicy, fetchWithSsrFGuard, findMatrixAccountEntry, formatAllowlistMatchMeta, formatDocsLink, formatLocationText, formatPairingApproveHint, formatResolvedUnresolvedNote, formatZonedTimestamp, getAgentScopedMediaLocalRoots, getChatChannelMeta, getMatrixScopedEnvVarNames, getSessionBindingService, hasConfiguredSecretInput, isPrivateOrLoopbackHost, jsonResult, loadOutboundMediaFromUrl, logInboundDrop, logTypingFailure, matrixSetupAdapter, matrixSetupWizard, mergeAllowFromEntries, mergeAllowlist, moveSingleAccountChannelSectionToDefaultAccount, namedAccountPromotionKeys, normalizeAccountId, normalizeOptionalAccountId, normalizePollInput, normalizeResolvedSecretInputString, normalizeSecretInputString, normalizeStringEntries, patchAllowlistUsersInConfigEntries, promptAccountId, promptChannelAccessConfig, promptSingleChannelSecretInput, readJsonFileWithFallback, readNumberParam, readReactionParams, readStringArrayParam, readStringParam, redactSensitiveText, registerSessionBindingAdapter, requiresExplicitMatrixDefaultAccount, resetMatrixThreadBindingsForTests, resolveAckReaction, resolveAgentIdFromSessionKey, resolveAllowlistCandidates, resolveAllowlistMatchByCandidates, resolveAllowlistProviderRuntimeGroupPolicy, resolveChannelEntryMatch, resolveCompiledAllowlistMatch, resolveConfiguredMatrixAccountIds, resolveControlCommandGate, resolveDefaultGroupPolicy, resolveMatrixAccountStorageRoot, resolveMatrixAccountStringValues, resolveMatrixChannelConfig, resolveMatrixCredentialsDir, resolveMatrixCredentialsPath, resolveMatrixDefaultOrOnlyAccountId, resolveMatrixLegacyFlatStoragePaths, resolveOutboundSendDep, resolveRuntimeEnv, resolveSenderScopedGroupPolicy, resolveSingleAccountPromotionTarget, resolveThreadBindingFarewellText, resolveThreadBindingIdleTimeoutMsForChannel, resolveThreadBindingMaxAgeMsForChannel, runPluginCommandWithTimeout, setAccountEnabledInConfigSection, setMatrixRuntime, setMatrixThreadBindingIdleTimeoutBySessionKey, setMatrixThreadBindingMaxAgeBySessionKey, setTopLevelChannelGroupPolicy, singleAccountKeysToMove, summarizeMapping, toLocationContext, unregisterSessionBindingAdapter, warnMissingProviderGroupPolicyFallbackOnce, writeJsonFileAtomically };
