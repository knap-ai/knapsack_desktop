import { t as formatDocsLink } from "../links-Dp5-Wbn2.js";
import { r as buildChannelConfigSchema } from "../config-schema-sgVTuroC.js";
import { n as normalizeAccountId, t as DEFAULT_ACCOUNT_ID } from "../account-id-j7GeQlaZ.js";
import { t as createDedupeCache } from "../dedupe-uU1DnJKZ.js";
import { n as fetchWithSsrFGuard } from "../fetch-guard-B3p4gGaY.js";
import { c as isBlockedHostnameOrIp, t as SsrFBlockedError } from "../ssrf-DoOclwFS.js";
import { n as emptyPluginConfigSchema } from "../config-schema-BJSXw2hl.js";
import { l as patchScopedAccountConfig, t as applyAccountNameToChannelSection } from "../setup-helpers-NxWLbAbV.js";
import { t as createChannelReplyPipeline } from "../channel-reply-pipeline-DHFpjrzi.js";
import { r as buildComputedAccountStatusSnapshot } from "../status-helpers-BEDVo_4L.js";
import { t as createLoggerBackedRuntime } from "../runtime-logger-CMNNz8AK.js";
import "../runtime-Lsq_Ew0U.js";
import { t as createOptionalChannelSetupSurface } from "../channel-setup-CXvL-Qpc.js";
//#region src/plugin-sdk/tlon.ts
const tlonSetup = createOptionalChannelSetupSurface({
	channel: "tlon",
	label: "Tlon",
	npmSpec: "@openclaw/tlon",
	docsPath: "/channels/tlon"
});
const tlonSetupAdapter = tlonSetup.setupAdapter;
const tlonSetupWizard = tlonSetup.setupWizard;
//#endregion
export { DEFAULT_ACCOUNT_ID, SsrFBlockedError, applyAccountNameToChannelSection, buildChannelConfigSchema, buildComputedAccountStatusSnapshot, createChannelReplyPipeline, createDedupeCache, createLoggerBackedRuntime, emptyPluginConfigSchema, fetchWithSsrFGuard, formatDocsLink, isBlockedHostnameOrIp, normalizeAccountId, patchScopedAccountConfig, tlonSetupAdapter, tlonSetupWizard };
