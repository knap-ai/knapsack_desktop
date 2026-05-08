import { t as formatDocsLink } from "../../links-BszRQhGa.js";
import { t as formatCliCommand } from "../../command-format-BORwwHyH.js";
import { l as normalizeE164 } from "../../utils-DvkbxKCZ.js";
import { n as normalizeAccountId, t as DEFAULT_ACCOUNT_ID } from "../../account-id-DhSD7lhD.js";
import { r as buildChannelConfigSchema } from "../../config-schema-Di5PBhdS.js";
import { a as SignalConfigSchema } from "../../zod-schema.providers-core-DHTvT0Zy.js";
import { a as chunkText } from "../../chunk-ChDuy-Cw.js";
import { n as deleteAccountFromConfigSection, r as setAccountEnabledInConfigSection } from "../../config-helpers-DWMJguLB.js";
import { n as formatPairingApproveHint } from "../../helpers-DacXri_3.js";
import "../../text-runtime-DfALcXL5.js";
import { n as emptyPluginConfigSchema } from "../../config-schema-CBtJ4osk.js";
import { s as migrateBaseNameToDefaultAccount, t as applyAccountNameToChannelSection } from "../../setup-helpers-CWjxgWew.js";
import { c as getChatChannelMeta } from "../../core-Dd3gimuF.js";
import { t as createPluginRuntimeStore } from "../../runtime-store-BnOb3XjU.js";
import { n as resolveAllowlistProviderRuntimeGroupPolicy, r as resolveDefaultGroupPolicy } from "../../runtime-group-policy-BgTcv0Si.js";
import { t as resolveChannelMediaMaxBytes } from "../../media-limits-DbrPRQ0r.js";
import { t as PAIRING_APPROVED_MESSAGE } from "../../pairing-message-D9zbnODE.js";
import { c as collectStatusIssuesFromLastError, d as createDefaultChannelRuntimeState, n as buildBaseChannelStatusSummary, t as buildBaseAccountStatusSnapshot } from "../../status-helpers-C00ai5Oy.js";
import { t as detectBinary } from "../../detect-binary-Boq1qvvQ.js";
import "../../setup-tools-xZB9WXg4.js";
import "../../reply-runtime-DbCC8RJx.js";
import "../../media-runtime-BVjLGcae.js";
import "../../channel-status-CE9QH1-O.js";
import { i as resolveSignalAccount, n as listSignalAccountIds, r as resolveDefaultSignalAccountId, t as listEnabledSignalAccounts } from "../../accounts-9hBZMI_Q.js";
import { d as looksLikeSignalTargetId, f as normalizeSignalMessagingTarget } from "../../identity-AT2s9fvA.js";
import { n as sendReactionSignal, t as removeReactionSignal } from "../../reaction-runtime-api-BTdMzGms.js";
import { n as resolveSignalReactionLevel, t as signalMessageActions } from "../../message-actions-pzrnkoUt.js";
import "../../config-api-BLtpLP02.js";
import { n as installSignalCli } from "../../install-signal-cli-Dd-oQNtl.js";
import { t as monitorSignalProvider } from "../../monitor-Czh2NOm8.js";
import { t as sendMessageSignal } from "../../send-BlC3iru1.js";
import { t as probeSignal } from "../../probe-URpZVbGQ.js";
//#region extensions/signal/src/runtime.ts
const { setRuntime: setSignalRuntime, clearRuntime: clearSignalRuntime, getRuntime: getSignalRuntime } = createPluginRuntimeStore({
	pluginId: "signal",
	errorMessage: "Signal runtime not initialized"
});
//#endregion
export { DEFAULT_ACCOUNT_ID, PAIRING_APPROVED_MESSAGE, SignalConfigSchema, applyAccountNameToChannelSection, buildBaseAccountStatusSnapshot, buildBaseChannelStatusSummary, buildChannelConfigSchema, chunkText, collectStatusIssuesFromLastError, createDefaultChannelRuntimeState, deleteAccountFromConfigSection, detectBinary, emptyPluginConfigSchema, formatCliCommand, formatDocsLink, formatPairingApproveHint, getChatChannelMeta, installSignalCli, listEnabledSignalAccounts, listSignalAccountIds, looksLikeSignalTargetId, migrateBaseNameToDefaultAccount, monitorSignalProvider, normalizeAccountId, normalizeE164, normalizeSignalMessagingTarget, probeSignal, removeReactionSignal, resolveAllowlistProviderRuntimeGroupPolicy, resolveChannelMediaMaxBytes, resolveDefaultGroupPolicy, resolveDefaultSignalAccountId, resolveSignalAccount, resolveSignalReactionLevel, sendMessageSignal, sendReactionSignal, setAccountEnabledInConfigSection, setSignalRuntime, signalMessageActions };
