import { i as parseStrictPositiveInteger } from "./parse-finite-number-BfJR0a23.js";
//#region src/cli/shared/parse-port.ts
function parsePort(raw) {
	if (raw === void 0 || raw === null) return null;
	return parseStrictPositiveInteger(raw) ?? null;
}
//#endregion
export { parsePort as t };
