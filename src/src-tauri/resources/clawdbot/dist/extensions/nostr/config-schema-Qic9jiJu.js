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
	/** Username (NIP-01: name) - max 256 chars */
	name: z.string().max(256).optional(),
	/** Display name (NIP-01: display_name) - max 256 chars */
	displayName: z.string().max(256).optional(),
	/** Bio/description (NIP-01: about) - max 2000 chars */
	about: z.string().max(2e3).optional(),
	/** Profile picture URL (must be https) */
	picture: safeUrlSchema.optional(),
	/** Banner image URL (must be https) */
	banner: safeUrlSchema.optional(),
	/** Website URL (must be https) */
	website: safeUrlSchema.optional(),
	/** NIP-05 identifier (e.g., "user@example.com") */
	nip05: z.string().optional(),
	/** Lightning address (LUD-16) */
	lud16: z.string().optional()
});
/**
* Zod schema for channels.nostr.* configuration
*/
const NostrConfigSchema = z.object({
	/** Account name (optional display name) */
	name: z.string().optional(),
	/** Optional default account id for routing/account selection. */
	defaultAccount: z.string().optional(),
	/** Whether this channel is enabled */
	enabled: z.boolean().optional(),
	/** Markdown formatting overrides (tables). */
	markdown: MarkdownConfigSchema,
	/** Private key in hex or nsec bech32 format */
	privateKey: buildSecretInputSchema().optional(),
	/** WebSocket relay URLs to connect to */
	relays: z.array(z.string()).optional(),
	/** DM access policy: pairing, allowlist, open, or disabled */
	dmPolicy: DmPolicySchema.optional(),
	/** Allowed sender pubkeys (npub or hex format) */
	allowFrom: AllowFromListSchema,
	/** Profile metadata (NIP-01 kind:0 content) */
	profile: NostrProfileSchema.optional()
});
buildChannelConfigSchema(NostrConfigSchema);
//#endregion
export { collectStatusIssuesFromLastError as a, formatPairingApproveHint as c, buildChannelConfigSchema$1 as i, resolveInboundDirectDmAccessWithRuntime as l, NostrProfileSchema as n, createDefaultChannelRuntimeState as o, DEFAULT_ACCOUNT_ID as r, createPreCryptoDirectDmAuthorizer as s, NostrConfigSchema as t };
