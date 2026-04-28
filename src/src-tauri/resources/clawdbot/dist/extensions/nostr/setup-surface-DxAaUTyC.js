import { t as DEFAULT_RELAYS } from "./default-relays-DLwdWOTu.js";
import { hasConfiguredSecretInput, normalizeSecretInputString } from "openclaw/plugin-sdk/secret-input";
import { getPublicKey, nip19 } from "nostr-tools";
import { DEFAULT_ACCOUNT_ID, normalizeAccountId, normalizeOptionalAccountId } from "openclaw/plugin-sdk/account-id";
import { listCombinedAccountIds, resolveListedDefaultAccountId } from "openclaw/plugin-sdk/account-resolution";
import { normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { DEFAULT_ACCOUNT_ID as DEFAULT_ACCOUNT_ID$1 } from "openclaw/plugin-sdk/routing";
import { createStandardChannelSetupStatus, createTopLevelChannelDmPolicy, createTopLevelChannelParsedAllowFromPrompt, formatDocsLink, mergeAllowFromEntries, parseSetupEntriesWithParser, patchTopLevelChannelConfigSection, splitSetupEntries } from "openclaw/plugin-sdk/setup";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region extensions/nostr/src/nostr-key-utils.ts
/**
* Validate and normalize a private key (accepts hex or nsec format)
*/
function validatePrivateKey(key) {
	const trimmed = key.trim();
	if (trimmed.startsWith("nsec1")) {
		const decoded = nip19.decode(trimmed);
		if (decoded.type !== "nsec") throw new Error("Invalid nsec key: wrong type");
		return decoded.data;
	}
	if (!/^[0-9a-fA-F]{64}$/.test(trimmed)) throw new Error("Private key must be 64 hex characters or nsec bech32 format");
	const bytes = new Uint8Array(32);
	for (let i = 0; i < 32; i++) bytes[i] = Number.parseInt(trimmed.slice(i * 2, i * 2 + 2), 16);
	return bytes;
}
/**
* Get public key from private key (hex or nsec format)
*/
function getPublicKeyFromPrivate(privateKey) {
	return getPublicKey(validatePrivateKey(privateKey));
}
/**
* Normalize a pubkey to hex format (accepts npub or hex)
*/
function normalizePubkey(input) {
	const trimmed = input.trim();
	if (trimmed.startsWith("npub1")) {
		const decoded = nip19.decode(trimmed);
		if (decoded.type !== "npub") throw new Error("Invalid npub key");
		return Array.from(decoded.data).map((b) => b.toString(16).padStart(2, "0")).join("");
	}
	if (!/^[0-9a-fA-F]{64}$/.test(trimmed)) throw new Error("Pubkey must be 64 hex characters or npub format");
	return trimmed.toLowerCase();
}
//#endregion
//#region extensions/nostr/src/types.ts
function resolveConfiguredDefaultNostrAccountId(cfg) {
	const nostrCfg = cfg.channels?.nostr;
	return normalizeOptionalAccountId(nostrCfg?.defaultAccount);
}
/**
* List all configured Nostr account IDs
*/
function listNostrAccountIds(cfg) {
	const nostrCfg = cfg.channels?.nostr;
	return listCombinedAccountIds({
		configuredAccountIds: [],
		implicitAccountId: normalizeSecretInputString(nostrCfg?.privateKey) ? resolveConfiguredDefaultNostrAccountId(cfg) ?? DEFAULT_ACCOUNT_ID : void 0
	});
}
/**
* Get the default account ID
*/
function resolveDefaultNostrAccountId(cfg) {
	return resolveListedDefaultAccountId({
		accountIds: listNostrAccountIds(cfg),
		configuredDefaultAccountId: resolveConfiguredDefaultNostrAccountId(cfg)
	});
}
/**
* Resolve a Nostr account from config
*/
function resolveNostrAccount(opts) {
	const accountId = normalizeAccountId(opts.accountId ?? resolveDefaultNostrAccountId(opts.cfg));
	const nostrCfg = opts.cfg.channels?.nostr;
	const baseEnabled = nostrCfg?.enabled !== false;
	const privateKey = normalizeSecretInputString(nostrCfg?.privateKey) ?? "";
	const configured = Boolean(privateKey);
	let publicKey = "";
	if (privateKey) try {
		publicKey = getPublicKeyFromPrivate(privateKey);
	} catch {}
	return {
		accountId,
		name: normalizeOptionalString(nostrCfg?.name),
		enabled: baseEnabled,
		configured,
		privateKey,
		publicKey,
		relays: nostrCfg?.relays ?? DEFAULT_RELAYS,
		profile: nostrCfg?.profile,
		config: {
			enabled: nostrCfg?.enabled,
			name: nostrCfg?.name,
			privateKey: nostrCfg?.privateKey,
			relays: nostrCfg?.relays,
			dmPolicy: nostrCfg?.dmPolicy,
			allowFrom: nostrCfg?.allowFrom,
			profile: nostrCfg?.profile
		}
	};
}
//#endregion
//#region extensions/nostr/src/setup-surface.ts
var setup_surface_exports = /* @__PURE__ */ __exportAll({
	nostrSetupAdapter: () => nostrSetupAdapter,
	nostrSetupWizard: () => nostrSetupWizard
});
const channel = "nostr";
const NOSTR_SETUP_HELP_LINES = [
	"Use a Nostr private key in nsec or 64-character hex format.",
	"Relay URLs are optional. Leave blank to keep the default relay set.",
	"Env vars supported: NOSTR_PRIVATE_KEY (default account only).",
	`Docs: ${formatDocsLink("/channels/nostr", "channels/nostr")}`
];
const NOSTR_ALLOW_FROM_HELP_LINES = [
	"Allowlist Nostr DMs by npub or hex pubkey.",
	"Examples:",
	"- npub1...",
	"- nostr:npub1...",
	"- 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
	"Multiple entries: comma-separated.",
	`Docs: ${formatDocsLink("/channels/nostr", "channels/nostr")}`
];
function buildNostrSetupPatch(accountId, patch) {
	return {
		...accountId !== DEFAULT_ACCOUNT_ID$1 ? { defaultAccount: accountId } : {},
		...patch
	};
}
function parseRelayUrls(raw) {
	const entries = splitSetupEntries(raw);
	const relays = [];
	for (const entry of entries) {
		try {
			const parsed = new URL(entry);
			if (parsed.protocol !== "ws:" && parsed.protocol !== "wss:") return {
				relays: [],
				error: `Relay must use ws:// or wss:// (${entry})`
			};
		} catch {
			return {
				relays: [],
				error: `Invalid relay URL: ${entry}`
			};
		}
		relays.push(entry);
	}
	return { relays: [...new Set(relays)] };
}
function parseNostrAllowFrom(raw) {
	return parseSetupEntriesWithParser(raw, (entry) => {
		const cleaned = entry.replace(/^nostr:/i, "").trim();
		try {
			return { value: normalizePubkey(cleaned) };
		} catch {
			return { error: `Invalid Nostr pubkey: ${entry}` };
		}
	});
}
const nostrDmPolicy = createTopLevelChannelDmPolicy({
	label: "Nostr",
	channel,
	policyKey: "channels.nostr.dmPolicy",
	allowFromKey: "channels.nostr.allowFrom",
	getCurrent: (cfg) => cfg.channels?.nostr?.dmPolicy ?? "pairing",
	promptAllowFrom: createTopLevelChannelParsedAllowFromPrompt({
		channel,
		defaultAccountId: resolveDefaultNostrAccountId,
		noteTitle: "Nostr allowlist",
		noteLines: NOSTR_ALLOW_FROM_HELP_LINES,
		message: "Nostr allowFrom",
		placeholder: "npub1..., 0123abcd...",
		parseEntries: parseNostrAllowFrom,
		mergeEntries: ({ existing, parsed }) => mergeAllowFromEntries(existing, parsed)
	})
});
const nostrSetupAdapter = {
	resolveAccountId: ({ cfg, accountId }) => accountId?.trim() || resolveDefaultNostrAccountId(cfg),
	applyAccountName: ({ cfg, accountId, name }) => patchTopLevelChannelConfigSection({
		cfg,
		channel,
		patch: buildNostrSetupPatch(accountId, name?.trim() ? { name: name.trim() } : {})
	}),
	validateInput: ({ input }) => {
		const typedInput = input;
		if (!typedInput.useEnv) {
			const privateKey = typedInput.privateKey?.trim();
			if (!privateKey) return "Nostr requires --private-key or --use-env.";
			try {
				getPublicKeyFromPrivate(privateKey);
			} catch {
				return "Nostr private key must be valid nsec or 64-character hex.";
			}
		}
		if (typedInput.relayUrls?.trim()) return parseRelayUrls(typedInput.relayUrls).error ?? null;
		return null;
	},
	applyAccountConfig: ({ cfg, accountId, input }) => {
		const typedInput = input;
		const relayResult = typedInput.relayUrls?.trim() ? parseRelayUrls(typedInput.relayUrls) : { relays: [] };
		return patchTopLevelChannelConfigSection({
			cfg,
			channel,
			enabled: true,
			clearFields: typedInput.useEnv ? ["privateKey"] : void 0,
			patch: buildNostrSetupPatch(accountId, {
				...typedInput.useEnv ? {} : { privateKey: typedInput.privateKey?.trim() },
				...relayResult.relays.length > 0 ? { relays: relayResult.relays } : {}
			})
		});
	}
};
const nostrSetupWizard = {
	channel,
	resolveAccountIdForConfigure: ({ accountOverride, defaultAccountId }) => accountOverride?.trim() || defaultAccountId,
	resolveShouldPromptAccountIds: () => false,
	status: createStandardChannelSetupStatus({
		channelLabel: "Nostr",
		configuredLabel: "configured",
		unconfiguredLabel: "needs private key",
		configuredHint: "configured",
		unconfiguredHint: "needs private key",
		configuredScore: 1,
		unconfiguredScore: 0,
		includeStatusLine: true,
		resolveConfigured: ({ cfg }) => resolveNostrAccount({ cfg }).configured,
		resolveExtraStatusLines: ({ cfg }) => {
			return [`Relays: ${resolveNostrAccount({ cfg }).relays.length || DEFAULT_RELAYS.length}`];
		}
	}),
	introNote: {
		title: "Nostr setup",
		lines: NOSTR_SETUP_HELP_LINES
	},
	envShortcut: {
		prompt: "NOSTR_PRIVATE_KEY detected. Use env var?",
		preferredEnvVar: "NOSTR_PRIVATE_KEY",
		isAvailable: ({ cfg, accountId }) => accountId === DEFAULT_ACCOUNT_ID$1 && Boolean(process.env.NOSTR_PRIVATE_KEY?.trim()) && !hasConfiguredSecretInput(resolveNostrAccount({
			cfg,
			accountId
		}).config.privateKey),
		apply: async ({ cfg, accountId }) => patchTopLevelChannelConfigSection({
			cfg,
			channel,
			enabled: true,
			clearFields: ["privateKey"],
			patch: buildNostrSetupPatch(accountId, {})
		})
	},
	credentials: [{
		inputKey: "privateKey",
		providerHint: channel,
		credentialLabel: "private key",
		preferredEnvVar: "NOSTR_PRIVATE_KEY",
		helpTitle: "Nostr private key",
		helpLines: NOSTR_SETUP_HELP_LINES,
		envPrompt: "NOSTR_PRIVATE_KEY detected. Use env var?",
		keepPrompt: "Nostr private key already configured. Keep it?",
		inputPrompt: "Nostr private key (nsec... or hex)",
		allowEnv: ({ accountId }) => accountId === DEFAULT_ACCOUNT_ID$1,
		inspect: ({ cfg, accountId }) => {
			const account = resolveNostrAccount({
				cfg,
				accountId
			});
			return {
				accountConfigured: account.configured,
				hasConfiguredValue: hasConfiguredSecretInput(account.config.privateKey),
				resolvedValue: normalizeSecretInputString(account.config.privateKey),
				envValue: process.env.NOSTR_PRIVATE_KEY?.trim()
			};
		},
		applyUseEnv: async ({ cfg, accountId }) => patchTopLevelChannelConfigSection({
			cfg,
			channel,
			enabled: true,
			clearFields: ["privateKey"],
			patch: buildNostrSetupPatch(accountId, {})
		}),
		applySet: async ({ cfg, accountId, resolvedValue }) => patchTopLevelChannelConfigSection({
			cfg,
			channel,
			enabled: true,
			patch: buildNostrSetupPatch(accountId, { privateKey: resolvedValue })
		})
	}],
	textInputs: [{
		inputKey: "relayUrls",
		message: "Relay URLs (comma-separated, optional)",
		placeholder: DEFAULT_RELAYS.join(", "),
		required: false,
		applyEmptyValue: true,
		helpTitle: "Nostr relays",
		helpLines: ["Use ws:// or wss:// relay URLs.", "Leave blank to keep the default relay set."],
		currentValue: ({ cfg, accountId }) => {
			const account = resolveNostrAccount({
				cfg,
				accountId
			});
			const configuredRelays = cfg.channels?.nostr?.relays;
			return (configuredRelays && configuredRelays.length > 0 ? account.relays : []).join(", ");
		},
		keepPrompt: (value) => `Relay URLs set (${value}). Keep them?`,
		validate: ({ value }) => parseRelayUrls(value).error,
		applySet: async ({ cfg, accountId, value }) => {
			const relayResult = parseRelayUrls(value);
			return patchTopLevelChannelConfigSection({
				cfg,
				channel,
				enabled: true,
				clearFields: relayResult.relays.length > 0 ? void 0 : ["relays"],
				patch: buildNostrSetupPatch(accountId, relayResult.relays.length > 0 ? { relays: relayResult.relays } : {})
			});
		}
	}],
	dmPolicy: nostrDmPolicy,
	disable: (cfg) => patchTopLevelChannelConfigSection({
		cfg,
		channel,
		patch: { enabled: false }
	})
};
//#endregion
export { resolveDefaultNostrAccountId as a, validatePrivateKey as c, listNostrAccountIds as i, nostrSetupWizard as n, resolveNostrAccount as o, setup_surface_exports as r, normalizePubkey as s, nostrSetupAdapter as t };
