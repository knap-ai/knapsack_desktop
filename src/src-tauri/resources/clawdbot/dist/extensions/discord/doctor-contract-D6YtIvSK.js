import { t as resolveDiscordPreviewStreamMode } from "./preview-streaming-DqJ3SGWf.js";
import { asObjectRecord, normalizeLegacyDmAliases, normalizeLegacyStreamingAliases } from "openclaw/plugin-sdk/runtime-doctor";
//#region extensions/discord/src/doctor-contract.ts
const LEGACY_TTS_PROVIDER_KEYS = [
	"openai",
	"elevenlabs",
	"microsoft",
	"edge"
];
function hasLegacyTtsProviderKeys(value) {
	const tts = asObjectRecord(value);
	if (!tts) return false;
	return LEGACY_TTS_PROVIDER_KEYS.some((key) => Object.prototype.hasOwnProperty.call(tts, key));
}
function hasLegacyDiscordAccountTtsProviderKeys(value) {
	const accounts = asObjectRecord(value);
	if (!accounts) return false;
	return Object.values(accounts).some((accountValue) => {
		return hasLegacyTtsProviderKeys(asObjectRecord(asObjectRecord(accountValue)?.voice)?.tts);
	});
}
function mergeMissing(target, source) {
	for (const [key, value] of Object.entries(source)) {
		if (value === void 0) continue;
		const existing = target[key];
		if (existing === void 0) {
			target[key] = value;
			continue;
		}
		if (existing && typeof existing === "object" && !Array.isArray(existing) && value && typeof value === "object" && !Array.isArray(value)) mergeMissing(existing, value);
	}
}
function getOrCreateTtsProviders(tts) {
	const providers = asObjectRecord(tts.providers) ?? {};
	tts.providers = providers;
	return providers;
}
function mergeLegacyTtsProviderConfig(tts, legacyKey, providerId) {
	const legacyValue = asObjectRecord(tts[legacyKey]);
	if (!legacyValue) return false;
	const providers = getOrCreateTtsProviders(tts);
	const existing = asObjectRecord(providers[providerId]) ?? {};
	const merged = structuredClone(existing);
	mergeMissing(merged, legacyValue);
	providers[providerId] = merged;
	delete tts[legacyKey];
	return true;
}
function migrateLegacyTtsConfig(tts, pathLabel, changes) {
	if (!tts) return false;
	let changed = false;
	if (mergeLegacyTtsProviderConfig(tts, "openai", "openai")) {
		changes.push(`Moved ${pathLabel}.openai → ${pathLabel}.providers.openai.`);
		changed = true;
	}
	if (mergeLegacyTtsProviderConfig(tts, "elevenlabs", "elevenlabs")) {
		changes.push(`Moved ${pathLabel}.elevenlabs → ${pathLabel}.providers.elevenlabs.`);
		changed = true;
	}
	if (mergeLegacyTtsProviderConfig(tts, "microsoft", "microsoft")) {
		changes.push(`Moved ${pathLabel}.microsoft → ${pathLabel}.providers.microsoft.`);
		changed = true;
	}
	if (mergeLegacyTtsProviderConfig(tts, "edge", "microsoft")) {
		changes.push(`Moved ${pathLabel}.edge → ${pathLabel}.providers.microsoft.`);
		changed = true;
	}
	return changed;
}
const legacyConfigRules = [{
	path: [
		"channels",
		"discord",
		"voice",
		"tts"
	],
	message: "channels.discord.voice.tts.<provider> keys (openai/elevenlabs/microsoft/edge) are legacy; use channels.discord.voice.tts.providers.<provider>. Run \"openclaw doctor --fix\".",
	match: hasLegacyTtsProviderKeys
}, {
	path: [
		"channels",
		"discord",
		"accounts"
	],
	message: "channels.discord.accounts.<id>.voice.tts.<provider> keys (openai/elevenlabs/microsoft/edge) are legacy; use channels.discord.accounts.<id>.voice.tts.providers.<provider>. Run \"openclaw doctor --fix\".",
	match: hasLegacyDiscordAccountTtsProviderKeys
}];
function normalizeCompatibilityConfig({ cfg }) {
	const rawEntry = asObjectRecord(cfg.channels?.discord);
	if (!rawEntry) return {
		config: cfg,
		changes: []
	};
	const changes = [];
	let updated = rawEntry;
	let changed = false;
	const shouldPromoteRootDmAllowFrom = !asObjectRecord(updated.accounts);
	const dm = normalizeLegacyDmAliases({
		entry: updated,
		pathPrefix: "channels.discord",
		changes,
		promoteAllowFrom: shouldPromoteRootDmAllowFrom
	});
	updated = dm.entry;
	changed = changed || dm.changed;
	const streaming = normalizeLegacyStreamingAliases({
		entry: updated,
		pathPrefix: "channels.discord",
		changes,
		resolvedMode: resolveDiscordPreviewStreamMode(updated),
		includePreviewChunk: true
	});
	updated = streaming.entry;
	changed = changed || streaming.changed;
	const rawAccounts = asObjectRecord(updated.accounts);
	if (rawAccounts) {
		let accountsChanged = false;
		const accounts = { ...rawAccounts };
		for (const [accountId, rawAccount] of Object.entries(rawAccounts)) {
			const account = asObjectRecord(rawAccount);
			if (!account) continue;
			let accountEntry = account;
			let accountChanged = false;
			const accountDm = normalizeLegacyDmAliases({
				entry: accountEntry,
				pathPrefix: `channels.discord.accounts.${accountId}`,
				changes
			});
			accountEntry = accountDm.entry;
			accountChanged = accountDm.changed;
			const accountStreaming = normalizeLegacyStreamingAliases({
				entry: accountEntry,
				pathPrefix: `channels.discord.accounts.${accountId}`,
				changes,
				resolvedMode: resolveDiscordPreviewStreamMode(accountEntry),
				includePreviewChunk: true
			});
			accountEntry = accountStreaming.entry;
			accountChanged = accountChanged || accountStreaming.changed;
			const accountVoice = asObjectRecord(accountEntry.voice);
			if (accountVoice && migrateLegacyTtsConfig(asObjectRecord(accountVoice.tts), `channels.discord.accounts.${accountId}.voice.tts`, changes)) {
				accountEntry = {
					...accountEntry,
					voice: accountVoice
				};
				accountChanged = true;
			}
			if (accountChanged) {
				accounts[accountId] = accountEntry;
				accountsChanged = true;
			}
		}
		if (accountsChanged) {
			updated = {
				...updated,
				accounts
			};
			changed = true;
		}
	}
	const voice = asObjectRecord(updated.voice);
	if (voice && migrateLegacyTtsConfig(asObjectRecord(voice.tts), "channels.discord.voice.tts", changes)) {
		updated = {
			...updated,
			voice
		};
		changed = true;
	}
	if (!changed) return {
		config: cfg,
		changes: []
	};
	return {
		config: {
			...cfg,
			channels: {
				...cfg.channels,
				discord: updated
			}
		},
		changes
	};
}
//#endregion
export { normalizeCompatibilityConfig as n, legacyConfigRules as t };
