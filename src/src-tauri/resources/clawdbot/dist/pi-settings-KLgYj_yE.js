//#region src/agents/pi-settings.ts
const DEFAULT_PI_COMPACTION_RESERVE_TOKENS_FLOOR = 2e4;
function resolveCompactionReserveTokensFloor(cfg) {
	const raw = cfg?.agents?.defaults?.compaction?.reserveTokensFloor;
	if (typeof raw === "number" && Number.isFinite(raw) && raw >= 0) return Math.floor(raw);
	return DEFAULT_PI_COMPACTION_RESERVE_TOKENS_FLOOR;
}
function toNonNegativeInt(value) {
	if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return;
	return Math.floor(value);
}
function toPositiveInt(value) {
	if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return;
	return Math.floor(value);
}
function applyPiCompactionSettingsFromConfig(params) {
	const currentReserveTokens = params.settingsManager.getCompactionReserveTokens();
	const currentKeepRecentTokens = params.settingsManager.getCompactionKeepRecentTokens();
	const compactionCfg = params.cfg?.agents?.defaults?.compaction;
	const configuredReserveTokens = toNonNegativeInt(compactionCfg?.reserveTokens);
	const configuredKeepRecentTokens = toPositiveInt(compactionCfg?.keepRecentTokens);
	const reserveTokensFloor = resolveCompactionReserveTokensFloor(params.cfg);
	const targetReserveTokens = Math.max(configuredReserveTokens ?? currentReserveTokens, reserveTokensFloor);
	const targetKeepRecentTokens = configuredKeepRecentTokens ?? currentKeepRecentTokens;
	const overrides = {};
	if (targetReserveTokens !== currentReserveTokens) overrides.reserveTokens = targetReserveTokens;
	if (targetKeepRecentTokens !== currentKeepRecentTokens) overrides.keepRecentTokens = targetKeepRecentTokens;
	const didOverride = Object.keys(overrides).length > 0;
	if (didOverride) params.settingsManager.applyOverrides({ compaction: overrides });
	return {
		didOverride,
		compaction: {
			reserveTokens: targetReserveTokens,
			keepRecentTokens: targetKeepRecentTokens
		}
	};
}
/** Decide whether Pi's internal auto-compaction should be disabled for this run. */
function shouldDisablePiAutoCompaction(params) {
	return params.contextEngineInfo?.ownsCompaction === true;
}
/** Disable Pi auto-compaction via settings when a context engine owns compaction. */
function applyPiAutoCompactionGuard(params) {
	const disable = shouldDisablePiAutoCompaction({ contextEngineInfo: params.contextEngineInfo });
	const hasMethod = typeof params.settingsManager.setCompactionEnabled === "function";
	if (!disable || !hasMethod) return {
		supported: hasMethod,
		disabled: false
	};
	params.settingsManager.setCompactionEnabled(false);
	return {
		supported: true,
		disabled: true
	};
}
//#endregion
export { applyPiAutoCompactionGuard as n, applyPiCompactionSettingsFromConfig as r, DEFAULT_PI_COMPACTION_RESERVE_TOKENS_FLOOR as t };
