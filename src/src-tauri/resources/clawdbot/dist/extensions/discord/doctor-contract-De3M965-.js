import { t as resolveDiscordPreviewStreamMode } from "./preview-streaming-BSJjH2oo.js";
import { asObjectRecord, normalizeLegacyChannelAliases } from "openclaw/plugin-sdk/runtime-doctor";
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
function hasLegacyDiscordGuildChannelAllowAlias(value) {
	const guilds = asObjectRecord(asObjectRecord(value)?.guilds);
	if (!guilds) return false;
	return Object.values(guilds).some((guildValue) => {
		const channels = asObjectRecord(asObjectRecord(guildValue)?.channels);
		if (!channels) return false;
		return Object.values(channels).some((channel) => Object.prototype.hasOwnProperty.call(asObjectRecord(channel) ?? {}, "allow"));
	});
}
function hasLegacyDiscordAccountGuildChannelAllowAlias(value) {
	const accounts = asObjectRecord(value);
	if (!accounts) return false;
	return Object.values(accounts).some((account) => hasLegacyDiscordGuildChannelAllowAlias(account));
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
function normalizeDiscordGuildChannelAllowAliases(params) {
	const guilds = asObjectRecord(params.entry.guilds);
	if (!guilds) return {
		entry: params.entry,
		changed: false
	};
	let changed = false;
	const nextGuilds = { ...guilds };
	for (const [guildId, guildValue] of Object.entries(guilds)) {
		const guild = asObjectRecord(guildValue);
		const channels = asObjectRecord(guild?.channels);
		if (!guild || !channels) continue;
		let channelsChanged = false;
		const nextChannels = { ...channels };
		for (const [channelId, channelValue] of Object.entries(channels)) {
			const channel = asObjectRecord(channelValue);
			if (!channel || !Object.prototype.hasOwnProperty.call(channel, "allow")) continue;
			const nextChannel = { ...channel };
			if (nextChannel.enabled === void 0) {
				nextChannel.enabled = channel.allow;
				params.changes.push(`Moved ${params.pathPrefix}.guilds.${guildId}.channels.${channelId}.allow → ${params.pathPrefix}.guilds.${guildId}.channels.${channelId}.enabled.`);
			} else params.changes.push(`Removed ${params.pathPrefix}.guilds.${guildId}.channels.${channelId}.allow (${params.pathPrefix}.guilds.${guildId}.channels.${channelId}.enabled already set).`);
			delete nextChannel.allow;
			nextChannels[channelId] = nextChannel;
			channelsChanged = true;
		}
		if (!channelsChanged) continue;
		nextGuilds[guildId] = {
			...guild,
			channels: nextChannels
		};
		changed = true;
	}
	return changed ? {
		entry: {
			...params.entry,
			guilds: nextGuilds
		},
		changed: true
	} : {
		entry: params.entry,
		changed: false
	};
}
const legacyConfigRules = [
	{
		path: [
			"channels",
			"discord",
			"voice",
			"tts"
		],
		message: "channels.discord.voice.tts.<provider> keys (openai/elevenlabs/microsoft/edge) are legacy; use channels.discord.voice.tts.providers.<provider>. Run \"openclaw doctor --fix\".",
		match: hasLegacyTtsProviderKeys
	},
	{
		path: [
			"channels",
			"discord",
			"accounts"
		],
		message: "channels.discord.accounts.<id>.voice.tts.<provider> keys (openai/elevenlabs/microsoft/edge) are legacy; use channels.discord.accounts.<id>.voice.tts.providers.<provider>. Run \"openclaw doctor --fix\".",
		match: hasLegacyDiscordAccountTtsProviderKeys
	},
	{
		path: ["channels", "discord"],
		message: "channels.discord.guilds.<id>.channels.<id>.allow is legacy; use channels.discord.guilds.<id>.channels.<id>.enabled instead. Run \"openclaw doctor --fix\".",
		match: hasLegacyDiscordGuildChannelAllowAlias
	},
	{
		path: [
			"channels",
			"discord",
			"accounts"
		],
		message: "channels.discord.accounts.<id>.guilds.<id>.channels.<id>.allow is legacy; use channels.discord.accounts.<id>.guilds.<id>.channels.<id>.enabled instead. Run \"openclaw doctor --fix\".",
		match: hasLegacyDiscordAccountGuildChannelAllowAlias
	}
];
function normalizeCompatibilityConfig({ cfg }) {
	const rawEntry = asObjectRecord(cfg.channels?.discord);
	if (!rawEntry) return {
		config: cfg,
		changes: []
	};
	const changes = [];
	let updated = rawEntry;
	let changed = false;
	const aliases = normalizeLegacyChannelAliases({
		entry: rawEntry,
		pathPrefix: "channels.discord",
		changes,
		normalizeDm: true,
		rootDmPromoteAllowFrom: !asObjectRecord(updated.accounts),
		normalizeAccountDm: true,
		resolveStreamingOptions: (entry) => ({
			resolvedMode: resolveDiscordPreviewStreamMode(entry),
			includePreviewChunk: true
		}),
		normalizeAccountExtra: ({ account, pathPrefix }) => {
			const accountVoice = asObjectRecord(account.voice);
			if (!accountVoice || !migrateLegacyTtsConfig(asObjectRecord(accountVoice.tts), `${pathPrefix}.voice.tts`, changes)) return {
				entry: account,
				changed: false
			};
			return {
				entry: {
					...account,
					voice: accountVoice
				},
				changed: true
			};
		}
	});
	updated = aliases.entry;
	changed = aliases.changed;
	const guildAliases = normalizeDiscordGuildChannelAllowAliases({
		entry: updated,
		pathPrefix: "channels.discord",
		changes
	});
	updated = guildAliases.entry;
	changed = changed || guildAliases.changed;
	const accounts = asObjectRecord(updated.accounts);
	if (accounts) {
		let accountsChanged = false;
		const nextAccounts = { ...accounts };
		for (const [accountId, accountValue] of Object.entries(accounts)) {
			const account = asObjectRecord(accountValue);
			if (!account) continue;
			const normalized = normalizeDiscordGuildChannelAllowAliases({
				entry: account,
				pathPrefix: `channels.discord.accounts.${accountId}`,
				changes
			});
			if (!normalized.changed) continue;
			nextAccounts[accountId] = normalized.entry;
			accountsChanged = true;
		}
		if (accountsChanged) {
			updated = {
				...updated,
				accounts: nextAccounts
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
