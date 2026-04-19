//#region src/cron/isolated-agent/run-session-state.ts
function createPersistCronSessionEntry(params) {
	return async () => {
		if (params.isFastTestEnv) return;
		params.cronSession.store[params.agentSessionKey] = params.cronSession.sessionEntry;
		if (params.runSessionKey !== params.agentSessionKey) params.cronSession.store[params.runSessionKey] = params.cronSession.sessionEntry;
		await params.updateSessionStore(params.cronSession.storePath, (store) => {
			store[params.agentSessionKey] = params.cronSession.sessionEntry;
			if (params.runSessionKey !== params.agentSessionKey) store[params.runSessionKey] = params.cronSession.sessionEntry;
		});
	};
}
async function persistCronSkillsSnapshotIfChanged(params) {
	if (params.isFastTestEnv || params.skillsSnapshot === params.cronSession.sessionEntry.skillsSnapshot) return;
	params.cronSession.sessionEntry = {
		...params.cronSession.sessionEntry,
		updatedAt: params.nowMs,
		skillsSnapshot: params.skillsSnapshot
	};
	await params.persistSessionEntry();
}
function markCronSessionPreRun(params) {
	params.entry.modelProvider = params.provider;
	params.entry.model = params.model;
	params.entry.systemSent = true;
}
function syncCronSessionLiveSelection(params) {
	params.entry.modelProvider = params.liveSelection.provider;
	params.entry.model = params.liveSelection.model;
	if (params.liveSelection.authProfileId) {
		params.entry.authProfileOverride = params.liveSelection.authProfileId;
		params.entry.authProfileOverrideSource = params.liveSelection.authProfileIdSource;
		if (params.liveSelection.authProfileIdSource === "auto") params.entry.authProfileOverrideCompactionCount = params.entry.compactionCount ?? 0;
		else delete params.entry.authProfileOverrideCompactionCount;
		return;
	}
	delete params.entry.authProfileOverride;
	delete params.entry.authProfileOverrideSource;
	delete params.entry.authProfileOverrideCompactionCount;
}
//#endregion
export { syncCronSessionLiveSelection as i, markCronSessionPreRun as n, persistCronSkillsSnapshotIfChanged as r, createPersistCronSessionEntry as t };
