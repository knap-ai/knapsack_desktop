import { t as formatDocsLink } from "../links-BszRQhGa.js";
import { n as normalizeAccountId, t as DEFAULT_ACCOUNT_ID } from "../account-id-DhSD7lhD.js";
import { r as buildChannelConfigSchema } from "../config-schema-Di5PBhdS.js";
import { t as createDedupeCache } from "../dedupe-pCHVfTe7.js";
import { c as isBlockedHostnameOrIp, t as SsrFBlockedError } from "../ssrf-K8pX0Zi6.js";
import { n as fetchWithSsrFGuard } from "../fetch-guard-8smVA_M-.js";
import { n as emptyPluginConfigSchema } from "../config-schema-CBtJ4osk.js";
import { l as patchScopedAccountConfig, t as applyAccountNameToChannelSection } from "../setup-helpers-CWjxgWew.js";
import { t as createChannelReplyPipeline } from "../channel-reply-pipeline-BYR66qkC.js";
import { r as buildComputedAccountStatusSnapshot } from "../status-helpers-C00ai5Oy.js";
import { t as createLoggerBackedRuntime } from "../runtime-logger-DeGpnr7K.js";
import "../runtime-o2QCXshQ.js";
import { t as createOptionalChannelSetupSurface } from "../channel-setup-DXcxitmF.js";
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
