//#region src/plugins/setup-descriptors.ts
function listSetupProviderIds(record) {
	return record.setup?.providers?.map((entry) => entry.id) ?? record.providers;
}
function listSetupCliBackendIds(record) {
	return record.setup?.cliBackends ?? record.cliBackends;
}
//#endregion
export { listSetupProviderIds as n, listSetupCliBackendIds as t };
