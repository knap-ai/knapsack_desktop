import { r as buildChannelConfigSchema } from "../../config-schema-sgVTuroC.js";
import { t as DEFAULT_ACCOUNT_ID } from "../../account-id-j7GeQlaZ.js";
import { r as IMessageConfigSchema } from "../../zod-schema.providers-core-BxvvQH1c.js";
import { m as formatTrimmedAllowFromEntries } from "../../channel-config-helpers-9F9ZxFrZ.js";
import { o as getChatChannelMeta } from "../../core-Dh0sB0kj.js";
import { t as createPluginRuntimeStore } from "../../runtime-store-Cvr8bl0h.js";
import { t as resolveChannelMediaMaxBytes } from "../../media-limits-CdCXl04b.js";
import { t as PAIRING_APPROVED_MESSAGE } from "../../pairing-message-DXbuAoem.js";
import { c as collectStatusIssuesFromLastError, r as buildComputedAccountStatusSnapshot } from "../../status-helpers-BEDVo_4L.js";
import "../../media-runtime-M1ED8IU3.js";
import { t as chunkTextForOutbound } from "../../text-chunking-CtENq2zv.js";
import "../../channel-status-CnINozhH.js";
import { _ as resolveIMessageConfigAllowFrom, g as normalizeIMessageMessagingTarget, h as looksLikeIMessageTargetId, t as probeIMessage, v as resolveIMessageConfigDefaultTo } from "../../probe-DMJ26cNa.js";
import { n as resolveIMessageGroupToolPolicy, t as resolveIMessageGroupRequireMention } from "../../group-policy-DMWywzQV.js";
import "../../config-api-C35kSSd0.js";
import { n as sendMessageIMessage, t as monitorIMessageProvider } from "../../monitor-D2Mv4hKV.js";
//#region extensions/imessage/src/runtime.ts
const { setRuntime: setIMessageRuntime, getRuntime: getIMessageRuntime } = createPluginRuntimeStore({
	pluginId: "imessage",
	errorMessage: "iMessage runtime not initialized"
});
//#endregion
export { DEFAULT_ACCOUNT_ID, IMessageConfigSchema, PAIRING_APPROVED_MESSAGE, buildChannelConfigSchema, buildComputedAccountStatusSnapshot, chunkTextForOutbound, collectStatusIssuesFromLastError, formatTrimmedAllowFromEntries, getChatChannelMeta, looksLikeIMessageTargetId, monitorIMessageProvider, normalizeIMessageMessagingTarget, probeIMessage, resolveChannelMediaMaxBytes, resolveIMessageConfigAllowFrom, resolveIMessageConfigDefaultTo, resolveIMessageGroupRequireMention, resolveIMessageGroupToolPolicy, sendMessageIMessage, setIMessageRuntime };
