//#region extensions/qqbot/src/engine/utils/string-normalize.ts
/**
* String normalization and record-coercion helpers.
*
* These are self-contained re-implementations of the functions that
* the plugin previously imported from `openclaw/plugin-sdk/text-runtime`
* and `openclaw/plugin-sdk/text-runtime` (via record-coerce / string-coerce).
*
* core/ modules use these instead of importing plugin-sdk, keeping the
* shared layer portable between the built-in and standalone versions.
*/
/** Return the trimmed string or `null` when the value is not a non-empty string. */
function normalizeNullableString(value) {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	return trimmed ? trimmed : null;
}
/** Return the trimmed string or `undefined` when the value is not a non-empty string. */
function normalizeOptionalString(value) {
	return normalizeNullableString(value) ?? void 0;
}
/**
* Stringify then normalize.  Accepts `string | number | boolean | bigint`.
* Returns `undefined` for objects, arrays, null, and undefined.
*/
function normalizeStringifiedOptionalString(value) {
	if (typeof value === "string") return normalizeOptionalString(value);
	if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return normalizeOptionalString(String(value));
}
/** Return the trimmed lowercase string or `undefined`. */
function normalizeOptionalLowercaseString(value) {
	return normalizeOptionalString(value)?.toLowerCase();
}
/** Return the trimmed lowercase string or `""`. */
function normalizeLowercaseStringOrEmpty(value) {
	return normalizeOptionalLowercaseString(value) ?? "";
}
/** Coerce a value into a `Record<string, unknown>` or `undefined`. */
function asOptionalObjectRecord(value) {
	return value && typeof value === "object" ? value : void 0;
}
/** Read a string field from a record. */
function readStringField(record, key) {
	const v = record?.[key];
	return typeof v === "string" ? v : void 0;
}
/**
* Normalize filenames into a UTF-8 form that the QQ Bot API accepts reliably.
*
* Decodes percent-escaped names, converts Unicode to NFC, and strips
* ASCII control characters.
*/
function sanitizeFileName(name) {
	if (!name) return name;
	let result = name.trim();
	if (result.includes("%")) try {
		result = decodeURIComponent(result);
	} catch {}
	result = result.normalize("NFC");
	result = result.replace(/\p{Cc}/gu, "");
	return result;
}
//#endregion
export { normalizeStringifiedOptionalString as a, normalizeOptionalString as i, normalizeLowercaseStringOrEmpty as n, readStringField as o, normalizeOptionalLowercaseString as r, sanitizeFileName as s, asOptionalObjectRecord as t };
