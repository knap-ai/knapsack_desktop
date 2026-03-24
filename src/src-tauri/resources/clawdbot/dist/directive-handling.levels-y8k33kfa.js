//#region src/auto-reply/reply/directive-handling.levels.ts
async function resolveCurrentDirectiveLevels(params) {
	const currentThinkLevel = params.sessionEntry?.thinkingLevel ?? await params.resolveDefaultThinkingLevel() ?? params.agentCfg?.thinkingDefault;
	return {
		currentThinkLevel,
		currentFastMode: typeof params.sessionEntry?.fastMode === "boolean" ? params.sessionEntry.fastMode : typeof params.agentEntry?.fastModeDefault === "boolean" ? params.agentEntry.fastModeDefault : void 0,
		currentVerboseLevel: params.sessionEntry?.verboseLevel ?? params.agentCfg?.verboseDefault,
		currentReasoningLevel: params.sessionEntry?.reasoningLevel ?? (currentThinkLevel === "off" ? params.agentEntry?.reasoningDefault ?? "off" : "off"),
		currentElevatedLevel: params.sessionEntry?.elevatedLevel ?? params.agentCfg?.elevatedDefault
	};
}
//#endregion
export { resolveCurrentDirectiveLevels as t };
