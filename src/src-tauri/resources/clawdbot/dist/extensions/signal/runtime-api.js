import { u as normalizeE164 } from "../../utils-BMRcljdi.js";
import { t as formatDocsLink } from "../../links-rWevNMpC.js";
import { t as formatCliCommand } from "../../command-format-BFuugklF.js";
import { r as buildChannelConfigSchema } from "../../config-schema-BEuj464I.js";
import { n as normalizeAccountId, t as DEFAULT_ACCOUNT_ID } from "../../account-id-C3j_3_su.js";
import { a as SignalConfigSchema } from "../../zod-schema.providers-core-Bl_XI-8U.js";
import { a as chunkText } from "../../chunk-CpCakLTa.js";
import { n as deleteAccountFromConfigSection, r as setAccountEnabledInConfigSection } from "../../config-helpers-CsJ8cmDG.js";
import { n as formatPairingApproveHint } from "../../helpers-TGDlD7dJ.js";
import "../../text-runtime-B1c54bxG.js";
import { n as emptyPluginConfigSchema } from "../../config-schema-BDzJIh_2.js";
import { s as migrateBaseNameToDefaultAccount, t as applyAccountNameToChannelSection } from "../../setup-helpers-CErkrrS9.js";
import { c as getChatChannelMeta } from "../../core-C7AkvHZx.js";
import { t as createPluginRuntimeStore } from "../../runtime-store-CURt34XU.js";
import { n as resolveAllowlistProviderRuntimeGroupPolicy, r as resolveDefaultGroupPolicy } from "../../runtime-group-policy-C-ntqoF6.js";
import { t as resolveChannelMediaMaxBytes } from "../../media-limits-DYln5NHj.js";
import { t as PAIRING_APPROVED_MESSAGE } from "../../pairing-message-D_jmgW5W.js";
import { c as collectStatusIssuesFromLastError, d as createDefaultChannelRuntimeState, n as buildBaseChannelStatusSummary, t as buildBaseAccountStatusSnapshot } from "../../status-helpers-Jbf-oZqp.js";
import { t as detectBinary } from "../../detect-binary-CRLO_1os.js";
import "../../setup-tools-D8G7pP_W.js";
import "../../config-runtime-Dutm3Ah0.js";
import "../../reply-runtime-BZB-8mvu.js";
import "../../media-runtime-CaqK85Sx.js";
import "../../channel-status-DcDrNBsU.js";
import { i as resolveSignalAccount, n as listSignalAccountIds, r as resolveDefaultSignalAccountId, t as listEnabledSignalAccounts } from "../../accounts-CLL-q8QA.js";
import { d as looksLikeSignalTargetId, f as normalizeSignalMessagingTarget } from "../../identity-DD30KqEM.js";
import { n as sendReactionSignal, t as removeReactionSignal } from "../../reaction-runtime-api-DkTU2PKu.js";
import { n as resolveSignalReactionLevel, t as signalMessageActions } from "../../message-actions-DOy-k7DF.js";
import "../../config-api-BfDpf8iF.js";
import { n as installSignalCli } from "../../install-signal-cli-BHYBL33S.js";
import { t as monitorSignalProvider } from "../../monitor-BJbDYaRM.js";
import { t as sendMessageSignal } from "../../send-CuqYqI2W.js";
import { t as probeSignal } from "../../probe-Dr67is2X.js";
//#region extensions/signal/src/runtime.ts
const { setRuntime: setSignalRuntime, clearRuntime: clearSignalRuntime, getRuntime: getSignalRuntime } = createPluginRuntimeStore({
	pluginId: "signal",
	errorMessage: "Signal runtime not initialized"
});
//#endregion
export { DEFAULT_ACCOUNT_ID, PAIRING_APPROVED_MESSAGE, SignalConfigSchema, applyAccountNameToChannelSection, buildBaseAccountStatusSnapshot, buildBaseChannelStatusSummary, buildChannelConfigSchema, chunkText, collectStatusIssuesFromLastError, createDefaultChannelRuntimeState, deleteAccountFromConfigSection, detectBinary, emptyPluginConfigSchema, formatCliCommand, formatDocsLink, formatPairingApproveHint, getChatChannelMeta, installSignalCli, listEnabledSignalAccounts, listSignalAccountIds, looksLikeSignalTargetId, migrateBaseNameToDefaultAccount, monitorSignalProvider, normalizeAccountId, normalizeE164, normalizeSignalMessagingTarget, probeSignal, removeReactionSignal, resolveAllowlistProviderRuntimeGroupPolicy, resolveChannelMediaMaxBytes, resolveDefaultGroupPolicy, resolveDefaultSignalAccountId, resolveSignalAccount, resolveSignalReactionLevel, sendMessageSignal, sendReactionSignal, setAccountEnabledInConfigSection, setSignalRuntime, signalMessageActions };
