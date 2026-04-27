import { collectStatusIssuesFromLastError, createDefaultChannelRuntimeState } from "openclaw/plugin-sdk/status-helpers";
import { DEFAULT_ACCOUNT_ID, buildChannelConfigSchema as buildChannelConfigSchema$1, formatPairingApproveHint } from "openclaw/plugin-sdk/channel-plugin-common";
import { createPreCryptoDirectDmAuthorizer, resolveInboundDirectDmAccessWithRuntime } from "openclaw/plugin-sdk/direct-dm-access";
import { AllowFromListSchema, DmPolicySchema, MarkdownConfigSchema, buildChannelConfigSchema } from "openclaw/plugin-sdk/channel-config-primitives";
import { buildSecretInputSchema } from "openclaw/plugin-sdk/secret-input";
import { z } from "openclaw/plugin-sdk/zod";
//#region extensions/nostr/src/config-schema.ts
/**
* Validates https:// URLs only (no javascript:, data:, file:, etc.)
*/
const safeUrlSchema = z.string().url().refine((url) => {
	try {
		return new URL(url).protocol === "https:";
	} catch {
		return false;
	}
}, { message: "URL must use https:// protocol" });
/**
* NIP-01 profile metadata schema
* https://github.com/nostr-protocol/nips/blob/master/01.md
*/
const NostrProfileSchema = z.object({
	name: z.string().max(256).optional(),
	displayName: z.string().max(256).optional(),
	about: z.string().max(2e3).optional(),
	picture: safeUrlSchema.optional(),
	banner: safeUrlSchema.optional(),
	website: safeUrlSchema.optional(),
	nip05: z.string().optional(),
	lud16: z.string().optional()
});
/**
* Zod schema for channels.nostr.* configuration
*/
const NostrConfigSchema = z.object({
	name: z.string().optional(),
	defaultAccount: z.string().optional(),
	enabled: z.boolean().optional(),
	markdown: MarkdownConfigSchema,
	privateKey: buildSecretInputSchema().optional(),
	relays: z.array(z.string()).optional(),
	dmPolicy: DmPolicySchema.optional(),
	allowFrom: AllowFromListSchema,
	profile: NostrProfileSchema.optional()
});
buildChannelConfigSchema(NostrConfigSchema);
//#endregion
export { collectStatusIssuesFromLastError as a, formatPairingApproveHint as c, buildChannelConfigSchema$1 as i, resolveInboundDirectDmAccessWithRuntime as l, NostrProfileSchema as n, createDefaultChannelRuntimeState as o, DEFAULT_ACCOUNT_ID as r, createPreCryptoDirectDmAuthorizer as s, NostrConfigSchema as t };
