//#region src/agents/pi-embedded-runner/compact.runtime.ts
let compactRuntimePromise = null;
function loadCompactRuntime() {
	compactRuntimePromise ??= import("./compact-Fl3cALvc.js");
	return compactRuntimePromise;
}
async function compactEmbeddedPiSessionDirect(...args) {
	const { compactEmbeddedPiSessionDirect } = await loadCompactRuntime();
	return compactEmbeddedPiSessionDirect(...args);
}
//#endregion
export { compactEmbeddedPiSessionDirect };
