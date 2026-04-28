import { t as DEFAULT_ACCOUNT_ID } from "../../account-id-DhSD7lhD.js";
import { r as buildChannelConfigSchema } from "../../config-schema-Di5PBhdS.js";
import { r as IMessageConfigSchema } from "../../zod-schema.providers-core-DHTvT0Zy.js";
import { p as formatTrimmedAllowFromEntries } from "../../channel-config-helpers-C9OhAb3g.js";
import { c as getChatChannelMeta } from "../../core-Dd3gimuF.js";
import { t as createPluginRuntimeStore } from "../../runtime-store-BnOb3XjU.js";
import { t as resolveChannelMediaMaxBytes } from "../../media-limits-DbrPRQ0r.js";
import { t as PAIRING_APPROVED_MESSAGE } from "../../pairing-message-D9zbnODE.js";
import { c as collectStatusIssuesFromLastError, r as buildComputedAccountStatusSnapshot } from "../../status-helpers-C00ai5Oy.js";
import "../../media-runtime-BVjLGcae.js";
import { t as chunkTextForOutbound } from "../../text-chunking-BEGwlstH.js";
import "../../channel-status-CE9QH1-O.js";
import { f as looksLikeIMessageTargetId, h as resolveIMessageConfigDefaultTo, m as resolveIMessageConfigAllowFrom, p as normalizeIMessageMessagingTarget } from "../../conversation-id-DBxdnDY0.js";
import { n as resolveIMessageGroupToolPolicy, t as resolveIMessageGroupRequireMention } from "../../group-policy-Cuu2lkfu.js";
import "../../config-api-DjdPLZUj.js";
import { t as probeIMessage } from "../../probe-BhYFPpIH.js";
import { n as sendMessageIMessage, t as monitorIMessageProvider } from "../../monitor-ChxbhW0l.js";
//#region extensions/imessage/src/runtime.ts
const { setRuntime: setIMessageRuntime, getRuntime: getIMessageRuntime } = createPluginRuntimeStore({
	pluginId: "imessage",
	errorMessage: "iMessage runtime not initialized"
});
//#endregion
export { DEFAULT_ACCOUNT_ID, IMessageConfigSchema, PAIRING_APPROVED_MESSAGE, buildChannelConfigSchema, buildComputedAccountStatusSnapshot, chunkTextForOutbound, collectStatusIssuesFromLastError, formatTrimmedAllowFromEntries, getChatChannelMeta, looksLikeIMessageTargetId, monitorIMessageProvider, normalizeIMessageMessagingTarget, probeIMessage, resolveChannelMediaMaxBytes, resolveIMessageConfigAllowFrom, resolveIMessageConfigDefaultTo, resolveIMessageGroupRequireMention, resolveIMessageGroupToolPolicy, sendMessageIMessage, setIMessageRuntime };
