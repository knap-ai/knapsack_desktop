import { h as MarkdownConfigSchema } from "../zod-schema.core-CYrn8zgQ.js";
import { r as buildChannelConfigSchema } from "../config-schema-sgVTuroC.js";
import { t as DEFAULT_ACCOUNT_ID } from "../account-id-j7GeQlaZ.js";
import { t as getPluginRuntimeGatewayRequestScope } from "../gateway-request-scope-Dkin09LL.js";
import { c as isBlockedHostnameOrIp } from "../ssrf-DoOclwFS.js";
import { h as mapAllowFromEntries } from "../channel-config-helpers-9F9ZxFrZ.js";
import { n as formatPairingApproveHint } from "../helpers-D33sU6YZ.js";
import { n as emptyPluginConfigSchema } from "../config-schema-BJSXw2hl.js";
import { t as createChannelReplyPipeline } from "../channel-reply-pipeline-DHFpjrzi.js";
import { c as collectStatusIssuesFromLastError, d as createDefaultChannelRuntimeState, r as buildComputedAccountStatusSnapshot } from "../status-helpers-BEDVo_4L.js";
import { a as createFixedWindowRateLimiter } from "../webhook-memory-guards-xdWNBMxB.js";
import { c as requestBodyErrorToText, o as readJsonBodyWithLimit } from "../http-body-CmkD5yuo.js";
import { t as createOptionalChannelSetupSurface } from "../channel-setup-CXvL-Qpc.js";
import { i as resolveInboundDirectDmAccessWithRuntime, n as createPreCryptoDirectDmAuthorizer, r as dispatchInboundDirectDmWithRuntime, t as createDirectDmPreCryptoGuardPolicy } from "../direct-dm-Di-7DpVE.js";
//#region src/plugin-sdk/nostr.ts
const nostrSetup = createOptionalChannelSetupSurface({
	channel: "nostr",
	label: "Nostr",
	npmSpec: "@openclaw/nostr",
	docsPath: "/channels/nostr"
});
const nostrSetupAdapter = nostrSetup.setupAdapter;
const nostrSetupWizard = nostrSetup.setupWizard;
//#endregion
export { DEFAULT_ACCOUNT_ID, MarkdownConfigSchema, buildChannelConfigSchema, buildComputedAccountStatusSnapshot, collectStatusIssuesFromLastError, createChannelReplyPipeline, createDefaultChannelRuntimeState, createDirectDmPreCryptoGuardPolicy, createFixedWindowRateLimiter, createPreCryptoDirectDmAuthorizer, dispatchInboundDirectDmWithRuntime, emptyPluginConfigSchema, formatPairingApproveHint, getPluginRuntimeGatewayRequestScope, isBlockedHostnameOrIp, mapAllowFromEntries, nostrSetupAdapter, nostrSetupWizard, readJsonBodyWithLimit, requestBodyErrorToText, resolveInboundDirectDmAccessWithRuntime };
