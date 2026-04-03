import { y as readSnakeCaseParamRaw } from "./common-RGbDbB5n.js";
//#region src/poll-params.ts
const SHARED_POLL_CREATION_PARAM_DEFS = {
	pollQuestion: { kind: "string" },
	pollOption: { kind: "stringArray" },
	pollDurationHours: { kind: "number" },
	pollMulti: { kind: "boolean" }
};
const TELEGRAM_POLL_CREATION_PARAM_DEFS = {
	pollDurationSeconds: { kind: "number" },
	pollAnonymous: { kind: "boolean" },
	pollPublic: { kind: "boolean" }
};
const POLL_CREATION_PARAM_DEFS = {
	...SHARED_POLL_CREATION_PARAM_DEFS,
	...TELEGRAM_POLL_CREATION_PARAM_DEFS
};
const POLL_CREATION_PARAM_NAMES = Object.keys(POLL_CREATION_PARAM_DEFS);
const SHARED_POLL_CREATION_PARAM_NAMES = Object.keys(SHARED_POLL_CREATION_PARAM_DEFS);
function readPollParamRaw(params, key) {
	return readSnakeCaseParamRaw(params, key);
}
function resolveTelegramPollVisibility(params) {
	if (params.pollAnonymous && params.pollPublic) throw new Error("pollAnonymous and pollPublic are mutually exclusive");
	return params.pollAnonymous ? true : params.pollPublic ? false : void 0;
}
function hasPollCreationParams(params) {
	for (const key of POLL_CREATION_PARAM_NAMES) {
		const def = POLL_CREATION_PARAM_DEFS[key];
		const value = readPollParamRaw(params, key);
		if (def.kind === "string" && typeof value === "string" && value.trim().length > 0) return true;
		if (def.kind === "stringArray") {
			if (Array.isArray(value) && value.some((entry) => typeof entry === "string" && entry.trim())) return true;
			if (typeof value === "string" && value.trim().length > 0) return true;
		}
		if (def.kind === "number") {
			if (typeof value === "number" && Number.isFinite(value) && value !== 0) return true;
			if (typeof value === "string") {
				const trimmed = value.trim();
				const parsed = Number(trimmed);
				if (trimmed.length > 0 && Number.isFinite(parsed) && parsed !== 0) return true;
			}
		}
		if (def.kind === "boolean") {
			if (value === true) return true;
			if (typeof value === "string" && value.trim().toLowerCase() === "true") return true;
		}
	}
	return false;
}
//#endregion
export { resolveTelegramPollVisibility as i, SHARED_POLL_CREATION_PARAM_NAMES as n, hasPollCreationParams as r, POLL_CREATION_PARAM_DEFS as t };
