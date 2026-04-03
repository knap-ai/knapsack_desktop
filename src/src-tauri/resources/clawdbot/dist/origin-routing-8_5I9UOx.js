//#region src/auto-reply/reply/origin-routing.ts
function normalizeProviderValue(value) {
	return value?.trim().toLowerCase() || void 0;
}
function resolveOriginMessageProvider(params) {
	return normalizeProviderValue(params.originatingChannel) ?? normalizeProviderValue(params.provider);
}
function resolveOriginMessageTo(params) {
	return params.originatingTo ?? params.to;
}
function resolveOriginAccountId(params) {
	return params.originatingAccountId ?? params.accountId;
}
//#endregion
export { resolveOriginMessageProvider as n, resolveOriginMessageTo as r, resolveOriginAccountId as t };
