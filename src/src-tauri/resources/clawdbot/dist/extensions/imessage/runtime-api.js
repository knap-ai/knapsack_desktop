import { r as buildChannelConfigSchema } from "../../config-schema-BEuj464I.js";
import { t as DEFAULT_ACCOUNT_ID } from "../../account-id-C3j_3_su.js";
import { r as IMessageConfigSchema } from "../../zod-schema.providers-core-Bl_XI-8U.js";
import { p as formatTrimmedAllowFromEntries } from "../../channel-config-helpers-D7luFLJH.js";
import { c as getChatChannelMeta } from "../../core-C7AkvHZx.js";
import { t as createPluginRuntimeStore } from "../../runtime-store-CURt34XU.js";
import { t as resolveChannelMediaMaxBytes } from "../../media-limits-DYln5NHj.js";
import { t as PAIRING_APPROVED_MESSAGE } from "../../pairing-message-D_jmgW5W.js";
import { c as collectStatusIssuesFromLastError, r as buildComputedAccountStatusSnapshot } from "../../status-helpers-Jbf-oZqp.js";
import "../../media-runtime-CaqK85Sx.js";
import { t as chunkTextForOutbound } from "../../text-chunking-CnW9V_2f.js";
import "../../channel-status-DcDrNBsU.js";
import { f as looksLikeIMessageTargetId, h as resolveIMessageConfigDefaultTo, m as resolveIMessageConfigAllowFrom, p as normalizeIMessageMessagingTarget } from "../../conversation-id-D4vg4q7Z.js";
import { n as resolveIMessageGroupToolPolicy, t as resolveIMessageGroupRequireMention } from "../../group-policy-hmDMo498.js";
import "../../config-api-CBSdmomi.js";
import { t as probeIMessage } from "../../probe-CyrEswXv.js";
import { n as sendMessageIMessage, t as monitorIMessageProvider } from "../../monitor-VMXY94Ns.js";
//#region extensions/imessage/src/runtime.ts
const { setRuntime: setIMessageRuntime, getRuntime: getIMessageRuntime } = createPluginRuntimeStore({
	pluginId: "imessage",
	errorMessage: "iMessage runtime not initialized"
});
//#endregion
export { DEFAULT_ACCOUNT_ID, IMessageConfigSchema, PAIRING_APPROVED_MESSAGE, buildChannelConfigSchema, buildComputedAccountStatusSnapshot, chunkTextForOutbound, collectStatusIssuesFromLastError, formatTrimmedAllowFromEntries, getChatChannelMeta, looksLikeIMessageTargetId, monitorIMessageProvider, normalizeIMessageMessagingTarget, probeIMessage, resolveChannelMediaMaxBytes, resolveIMessageConfigAllowFrom, resolveIMessageConfigDefaultTo, resolveIMessageGroupRequireMention, resolveIMessageGroupToolPolicy, sendMessageIMessage, setIMessageRuntime };
