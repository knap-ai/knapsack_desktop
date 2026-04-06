//#region src/test-utils/fetch-mock.ts
function withFetchPreconnect(fn) {
	return Object.assign(fn, { preconnect: (_url, _options) => {} });
}
//#endregion
export { withFetchPreconnect as t };
