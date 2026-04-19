import { o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
//#region src/shared/string-normalization.ts
function normalizeStringEntries(list) {
	return (list ?? []).map((entry) => normalizeOptionalString(String(entry)) ?? "").filter(Boolean);
}
function normalizeStringEntriesLower(list) {
	return normalizeStringEntries(list).map((entry) => normalizeOptionalLowercaseString(entry) ?? "");
}
function normalizeTrimmedStringList(value) {
	if (!Array.isArray(value)) return [];
	return value.flatMap((entry) => {
		const normalized = normalizeOptionalString(entry);
		return normalized ? [normalized] : [];
	});
}
function normalizeOptionalTrimmedStringList(value) {
	const normalized = normalizeTrimmedStringList(value);
	return normalized.length > 0 ? normalized : void 0;
}
function normalizeArrayBackedTrimmedStringList(value) {
	if (!Array.isArray(value)) return;
	return normalizeTrimmedStringList(value);
}
function normalizeSingleOrTrimmedStringList(value) {
	if (Array.isArray(value)) return normalizeTrimmedStringList(value);
	const normalized = normalizeOptionalString(value);
	return normalized ? [normalized] : [];
}
function normalizeCsvOrLooseStringList(value) {
	if (Array.isArray(value)) return normalizeStringEntries(value);
	if (typeof value === "string") return value.split(",").map((entry) => entry.trim()).filter(Boolean);
	return [];
}
function normalizeHyphenSlug(raw) {
	const trimmed = normalizeOptionalLowercaseString(raw) ?? "";
	if (!trimmed) return "";
	return trimmed.replace(/\s+/g, "-").replace(/[^a-z0-9#@._+-]+/g, "-").replace(/-{2,}/g, "-").replace(/^[-.]+|[-.]+$/g, "");
}
function normalizeAtHashSlug(raw) {
	const trimmed = normalizeOptionalLowercaseString(raw) ?? "";
	if (!trimmed) return "";
	return trimmed.replace(/^[@#]+/, "").replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]+/g, "-").replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "");
}
//#endregion
export { normalizeOptionalTrimmedStringList as a, normalizeStringEntriesLower as c, normalizeHyphenSlug as i, normalizeTrimmedStringList as l, normalizeAtHashSlug as n, normalizeSingleOrTrimmedStringList as o, normalizeCsvOrLooseStringList as r, normalizeStringEntries as s, normalizeArrayBackedTrimmedStringList as t };
