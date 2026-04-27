//#region src/agents/pi-compaction-constants.ts
/**
* Absolute minimum prompt budget in tokens.  When the context window is
* large enough that `contextTokenBudget * MIN_PROMPT_BUDGET_RATIO` exceeds
* this value, this absolute floor takes precedence.
*/
const MIN_PROMPT_BUDGET_TOKENS = 8e3;
/**
* Minimum share of the context window that must remain available for prompt
* content after reserve tokens are subtracted.
*/
const MIN_PROMPT_BUDGET_RATIO = .5;
//#endregion
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
	let reserveTokensFloor = resolveCompactionReserveTokensFloor(params.cfg);
	const ctxBudget = params.contextTokenBudget;
	if (typeof ctxBudget === "number" && Number.isFinite(ctxBudget) && ctxBudget > 0) {
		const minPromptBudget = Math.min(MIN_PROMPT_BUDGET_TOKENS, Math.max(1, Math.floor(ctxBudget * MIN_PROMPT_BUDGET_RATIO)));
		const maxReserve = Math.max(0, ctxBudget - minPromptBudget);
		reserveTokensFloor = Math.min(reserveTokensFloor, maxReserve);
	}
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
export { MIN_PROMPT_BUDGET_TOKENS as a, MIN_PROMPT_BUDGET_RATIO as i, applyPiAutoCompactionGuard as n, applyPiCompactionSettingsFromConfig as r, DEFAULT_PI_COMPACTION_RESERVE_TOKENS_FLOOR as t };
