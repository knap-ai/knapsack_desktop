//#region extensions/matrix/src/matrix/credentials-write.runtime.ts
async function saveMatrixCredentials(...args) {
	return (await import("./credentials-B_srZK1B.js")).saveMatrixCredentials(...args);
}
async function saveBackfilledMatrixDeviceId(...args) {
	return (await import("./credentials-B_srZK1B.js")).saveBackfilledMatrixDeviceId(...args);
}
async function touchMatrixCredentials(...args) {
	return (await import("./credentials-B_srZK1B.js")).touchMatrixCredentials(...args);
}
//#endregion
export { saveBackfilledMatrixDeviceId, saveMatrixCredentials, touchMatrixCredentials };
