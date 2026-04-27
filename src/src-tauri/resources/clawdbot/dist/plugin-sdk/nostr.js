import { h as MarkdownConfigSchema } from "../zod-schema.core-BR1v7ukx.js";
import { r as buildChannelConfigSchema } from "../config-schema-BEuj464I.js";
import { t as DEFAULT_ACCOUNT_ID } from "../account-id-C3j_3_su.js";
import { t as getPluginRuntimeGatewayRequestScope } from "../gateway-request-scope-D6nplzWA.js";
import { c as isBlockedHostnameOrIp } from "../ssrf-MkDHylX_.js";
import { m as mapAllowFromEntries } from "../channel-config-helpers-D7luFLJH.js";
import { n as formatPairingApproveHint } from "../helpers-TGDlD7dJ.js";
import { n as emptyPluginConfigSchema } from "../config-schema-BDzJIh_2.js";
import { t as createChannelReplyPipeline } from "../channel-reply-pipeline-zp0MNhbR.js";
import { c as collectStatusIssuesFromLastError, d as createDefaultChannelRuntimeState, r as buildComputedAccountStatusSnapshot } from "../status-helpers-Jbf-oZqp.js";
import { a as createFixedWindowRateLimiter } from "../webhook-memory-guards-CHE_PrXl.js";
import { c as requestBodyErrorToText, o as readJsonBodyWithLimit } from "../http-body-DmMOHMx8.js";
import { t as createOptionalChannelSetupSurface } from "../channel-setup-ByPYNtWa.js";
import { n as resolveInboundDirectDmAccessWithRuntime, t as createPreCryptoDirectDmAuthorizer } from "../direct-dm-access-Cl_72A6P.js";
import { t as createDirectDmPreCryptoGuardPolicy } from "../direct-dm-guard-policy-CC0JBBFe.js";
import { t as dispatchInboundDirectDmWithRuntime } from "../direct-dm-DBZYYeR4.js";
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
