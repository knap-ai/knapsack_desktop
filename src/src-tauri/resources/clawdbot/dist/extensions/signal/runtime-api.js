import { u as normalizeE164 } from "../../utils-D5DtWkEu.js";
import { t as formatDocsLink } from "../../links-Dp5-Wbn2.js";
import { t as formatCliCommand } from "../../command-format-Dd3uP9-6.js";
import { r as buildChannelConfigSchema } from "../../config-schema-sgVTuroC.js";
import { n as normalizeAccountId, t as DEFAULT_ACCOUNT_ID } from "../../account-id-j7GeQlaZ.js";
import { a as SignalConfigSchema } from "../../zod-schema.providers-core-BxvvQH1c.js";
import { a as chunkText } from "../../chunk-C8HOq7ak.js";
import { n as deleteAccountFromConfigSection, r as setAccountEnabledInConfigSection } from "../../config-helpers-BnrSrKhR.js";
import "../../text-runtime-DTMxvodz.js";
import { n as formatPairingApproveHint } from "../../helpers-D33sU6YZ.js";
import { n as emptyPluginConfigSchema } from "../../config-schema-BJSXw2hl.js";
import { s as migrateBaseNameToDefaultAccount, t as applyAccountNameToChannelSection } from "../../setup-helpers-NxWLbAbV.js";
import { o as getChatChannelMeta } from "../../core-Dh0sB0kj.js";
import { t as createPluginRuntimeStore } from "../../runtime-store-Cvr8bl0h.js";
import { n as resolveAllowlistProviderRuntimeGroupPolicy, r as resolveDefaultGroupPolicy } from "../../runtime-group-policy-B7-UthCu.js";
import { t as resolveChannelMediaMaxBytes } from "../../media-limits-CdCXl04b.js";
import { t as PAIRING_APPROVED_MESSAGE } from "../../pairing-message-DXbuAoem.js";
import { c as collectStatusIssuesFromLastError, d as createDefaultChannelRuntimeState, n as buildBaseChannelStatusSummary, t as buildBaseAccountStatusSnapshot } from "../../status-helpers-BEDVo_4L.js";
import { t as detectBinary } from "../../detect-binary-EIuU3RzU.js";
import "../../setup-tools-ChX5E-WF.js";
import "../../config-runtime-Bh8MKSv2.js";
import "../../reply-runtime-BZD8duRn.js";
import "../../media-runtime-M1ED8IU3.js";
import "../../channel-status-CnINozhH.js";
import { i as resolveSignalAccount, n as listSignalAccountIds, r as resolveDefaultSignalAccountId, t as listEnabledSignalAccounts } from "../../accounts-DMNa8l5m.js";
import { d as looksLikeSignalTargetId, f as normalizeSignalMessagingTarget } from "../../identity-Dbl9D0Ka.js";
import { t as sendMessageSignal } from "../../send-D3j3EMJe.js";
import { n as sendReactionSignal, t as removeReactionSignal } from "../../reaction-runtime-api-BJAEpBCf.js";
import { n as resolveSignalReactionLevel, t as signalMessageActions } from "../../message-actions-CoPD0R6C.js";
import "../../config-api-7PD9xOll.js";
import { n as installSignalCli } from "../../install-signal-cli-BF9Niywk.js";
import { t as monitorSignalProvider } from "../../monitor-CByY9P1A.js";
import { t as probeSignal } from "../../probe-CE9kPkTl.js";
//#region extensions/signal/src/runtime.ts
const { setRuntime: setSignalRuntime, clearRuntime: clearSignalRuntime, getRuntime: getSignalRuntime } = createPluginRuntimeStore({
	pluginId: "signal",
	errorMessage: "Signal runtime not initialized"
});
//#endregion
export { DEFAULT_ACCOUNT_ID, PAIRING_APPROVED_MESSAGE, SignalConfigSchema, applyAccountNameToChannelSection, buildBaseAccountStatusSnapshot, buildBaseChannelStatusSummary, buildChannelConfigSchema, chunkText, collectStatusIssuesFromLastError, createDefaultChannelRuntimeState, deleteAccountFromConfigSection, detectBinary, emptyPluginConfigSchema, formatCliCommand, formatDocsLink, formatPairingApproveHint, getChatChannelMeta, installSignalCli, listEnabledSignalAccounts, listSignalAccountIds, looksLikeSignalTargetId, migrateBaseNameToDefaultAccount, monitorSignalProvider, normalizeAccountId, normalizeE164, normalizeSignalMessagingTarget, probeSignal, removeReactionSignal, resolveAllowlistProviderRuntimeGroupPolicy, resolveChannelMediaMaxBytes, resolveDefaultGroupPolicy, resolveDefaultSignalAccountId, resolveSignalAccount, resolveSignalReactionLevel, sendMessageSignal, sendReactionSignal, setAccountEnabledInConfigSection, setSignalRuntime, signalMessageActions };
