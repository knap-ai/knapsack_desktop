import "./text-runtime-DTMxvodz.js";
import "./error-runtime-CgBDklBz.js";
//#region extensions/memory-core/src/dreaming-shared.ts
function normalizeTrimmedString(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : void 0;
}
function includesSystemEventToken(cleanedBody, eventText) {
	const normalizedBody = normalizeTrimmedString(cleanedBody);
	const normalizedEventText = normalizeTrimmedString(eventText);
	if (!normalizedBody || !normalizedEventText) return false;
	if (normalizedBody === normalizedEventText) return true;
	return normalizedBody.split(/\r?\n/).some((line) => line.trim() === normalizedEventText);
}
//#endregion
export { normalizeTrimmedString as n, includesSystemEventToken as t };
