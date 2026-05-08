import { t as DEFAULT_ACCOUNT_ID } from "../account-id-DhSD7lhD.js";
import { h as MarkdownConfigSchema } from "../zod-schema.core-Dkd4NgDa.js";
import { r as buildChannelConfigSchema } from "../config-schema-Di5PBhdS.js";
import { t as getPluginRuntimeGatewayRequestScope } from "../gateway-request-scope-BrfRtlzX.js";
import { c as isBlockedHostnameOrIp } from "../ssrf-K8pX0Zi6.js";
import { m as mapAllowFromEntries } from "../channel-config-helpers-C9OhAb3g.js";
import { n as formatPairingApproveHint } from "../helpers-DacXri_3.js";
import { n as emptyPluginConfigSchema } from "../config-schema-CBtJ4osk.js";
import { t as createChannelReplyPipeline } from "../channel-reply-pipeline-BYR66qkC.js";
import { c as collectStatusIssuesFromLastError, d as createDefaultChannelRuntimeState, r as buildComputedAccountStatusSnapshot } from "../status-helpers-C00ai5Oy.js";
import { a as createFixedWindowRateLimiter } from "../webhook-memory-guards-CL1vPKbQ.js";
import { c as requestBodyErrorToText, o as readJsonBodyWithLimit } from "../http-body-DULyPC70.js";
import { t as createOptionalChannelSetupSurface } from "../channel-setup-DXcxitmF.js";
import { n as resolveInboundDirectDmAccessWithRuntime, t as createPreCryptoDirectDmAuthorizer } from "../direct-dm-access-CvGs_kA7.js";
import { t as createDirectDmPreCryptoGuardPolicy } from "../direct-dm-guard-policy-Q1MG7jR6.js";
import { t as dispatchInboundDirectDmWithRuntime } from "../direct-dm-C8Osrz4E.js";
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
