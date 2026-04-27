import { t as formatDocsLink } from "../links-rWevNMpC.js";
import { r as buildChannelConfigSchema } from "../config-schema-BEuj464I.js";
import { n as normalizeAccountId, t as DEFAULT_ACCOUNT_ID } from "../account-id-C3j_3_su.js";
import { t as createDedupeCache } from "../dedupe-CjwkdrbQ.js";
import { c as isBlockedHostnameOrIp, t as SsrFBlockedError } from "../ssrf-MkDHylX_.js";
import { n as fetchWithSsrFGuard } from "../fetch-guard-DKbwHPzH.js";
import { n as emptyPluginConfigSchema } from "../config-schema-BDzJIh_2.js";
import { l as patchScopedAccountConfig, t as applyAccountNameToChannelSection } from "../setup-helpers-CErkrrS9.js";
import { t as createChannelReplyPipeline } from "../channel-reply-pipeline-zp0MNhbR.js";
import { r as buildComputedAccountStatusSnapshot } from "../status-helpers-Jbf-oZqp.js";
import { t as createLoggerBackedRuntime } from "../runtime-logger-Dbec5-lc.js";
import "../runtime-DovlAEyp.js";
import { t as createOptionalChannelSetupSurface } from "../channel-setup-ByPYNtWa.js";
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
