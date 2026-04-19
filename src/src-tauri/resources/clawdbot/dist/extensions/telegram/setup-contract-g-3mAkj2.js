import { t as resolveTelegramPreviewStreamMode } from "./preview-streaming-DHVltX4_.js";
import { asObjectRecord, hasLegacyAccountStreamingAliases, hasLegacyStreamingAliases, normalizeLegacyStreamingAliases } from "openclaw/plugin-sdk/runtime-doctor";
//#region extensions/telegram/src/doctor-contract.ts
function hasLegacyTelegramStreamingAliases(value) {
	return hasLegacyStreamingAliases(value, { includePreviewChunk: true });
}
function resolveCompatibleDefaultGroupEntry(section) {
	const existingGroups = section.groups;
	if (existingGroups !== void 0 && !asObjectRecord(existingGroups)) return null;
	const groups = asObjectRecord(existingGroups) ?? {};
	const existingEntry = groups["*"];
	if (existingEntry !== void 0 && !asObjectRecord(existingEntry)) return null;
	return {
		groups,
		entry: asObjectRecord(existingEntry) ?? {}
	};
}
const legacyConfigRules = [
	{
		path: [
			"channels",
			"telegram",
			"groupMentionsOnly"
		],
		message: "channels.telegram.groupMentionsOnly was removed; use channels.telegram.groups.\"*\".requireMention instead. Run \"openclaw doctor --fix\"."
	},
	{
		path: ["channels", "telegram"],
		message: "channels.telegram.streamMode, channels.telegram.streaming (scalar), chunkMode, blockStreaming, draftChunk, and blockStreamingCoalesce are legacy; use channels.telegram.streaming.{mode,chunkMode,preview.chunk,block.enabled,block.coalesce}.",
		match: hasLegacyTelegramStreamingAliases
	},
	{
		path: [
			"channels",
			"telegram",
			"accounts"
		],
		message: "channels.telegram.accounts.<id>.streamMode, streaming (scalar), chunkMode, blockStreaming, draftChunk, and blockStreamingCoalesce are legacy; use channels.telegram.accounts.<id>.streaming.{mode,chunkMode,preview.chunk,block.enabled,block.coalesce}.",
		match: (value) => hasLegacyAccountStreamingAliases(value, hasLegacyTelegramStreamingAliases)
	}
];
function normalizeCompatibilityConfig({ cfg }) {
	const rawEntry = asObjectRecord(cfg.channels?.telegram);
	if (!rawEntry) return {
		config: cfg,
		changes: []
	};
	const changes = [];
	let updated = rawEntry;
	let changed = false;
	if (updated.groupMentionsOnly !== void 0) {
		const defaultGroupEntry = resolveCompatibleDefaultGroupEntry(updated);
		if (!defaultGroupEntry) changes.push("Skipped channels.telegram.groupMentionsOnly migration because channels.telegram.groups already has an incompatible shape; fix remaining issues manually.");
		else {
			const { groups, entry } = defaultGroupEntry;
			if (entry.requireMention === void 0) {
				entry.requireMention = updated.groupMentionsOnly;
				groups["*"] = entry;
				updated = {
					...updated,
					groups
				};
				changes.push("Moved channels.telegram.groupMentionsOnly → channels.telegram.groups.\"*\".requireMention.");
			} else changes.push("Removed channels.telegram.groupMentionsOnly (channels.telegram.groups.\"*\" already set).");
			const { groupMentionsOnly: _ignored, ...rest } = updated;
			updated = rest;
			changed = true;
		}
	}
	const streaming = normalizeLegacyStreamingAliases({
		entry: updated,
		pathPrefix: "channels.telegram",
		changes,
		includePreviewChunk: true,
		resolvedMode: resolveTelegramPreviewStreamMode(updated)
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
			const accountStreaming = normalizeLegacyStreamingAliases({
				entry: account,
				pathPrefix: `channels.telegram.accounts.${accountId}`,
				changes,
				includePreviewChunk: true,
				resolvedMode: resolveTelegramPreviewStreamMode(account)
			});
			if (accountStreaming.changed) {
				accounts[accountId] = accountStreaming.entry;
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
	if (!changed && changes.length === 0) return {
		config: cfg,
		changes: []
	};
	return {
		config: {
			...cfg,
			channels: {
				...cfg.channels,
				telegram: updated
			}
		},
		changes
	};
}
//#endregion
//#region extensions/telegram/src/setup-contract.ts
const singleAccountKeysToMove = ["streaming"];
const namedAccountPromotionKeys = ["botToken", "tokenFile"];
//#endregion
export { normalizeCompatibilityConfig as i, singleAccountKeysToMove as n, legacyConfigRules as r, namedAccountPromotionKeys as t };
