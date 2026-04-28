//#region src/plugin-sdk/migration.ts
const MIGRATION_REASON_MISSING_SOURCE_OR_TARGET = "missing source or target";
const MIGRATION_REASON_TARGET_EXISTS = "target exists";
function createMigrationItem(params) {
	return {
		...params,
		status: params.status ?? "planned"
	};
}
function markMigrationItemConflict(item, reason) {
	return {
		...item,
		status: "conflict",
		reason
	};
}
function markMigrationItemError(item, reason) {
	return {
		...item,
		status: "error",
		reason
	};
}
function markMigrationItemSkipped(item, reason) {
	return {
		...item,
		status: "skipped",
		reason
	};
}
function summarizeMigrationItems(items) {
	return {
		total: items.length,
		planned: items.filter((item) => item.status === "planned").length,
		migrated: items.filter((item) => item.status === "migrated").length,
		skipped: items.filter((item) => item.status === "skipped").length,
		conflicts: items.filter((item) => item.status === "conflict").length,
		errors: items.filter((item) => item.status === "error").length,
		sensitive: items.filter((item) => item.sensitive).length
	};
}
const REDACTED_MIGRATION_VALUE = "[redacted]";
const SECRET_KEY_MARKERS = [
	"accesstoken",
	"apikey",
	"authorization",
	"bearertoken",
	"clientsecret",
	"cookie",
	"credential",
	"password",
	"privatekey",
	"refreshtoken",
	"secret"
];
const SECRET_VALUE_PATTERNS = [
	/\bBearer\s+[A-Za-z0-9._~+/=-]+/gu,
	/\bsk-[A-Za-z0-9_-]{8,}\b/gu,
	/\bgh[pousr]_[A-Za-z0-9_]{16,}\b/gu,
	/\bxox[abprs]-[A-Za-z0-9-]{8,}\b/gu,
	/\bAIza[0-9A-Za-z_-]{12,}\b/gu
];
function normalizeSecretKey(key) {
	return key.toLowerCase().replaceAll(/[^a-z0-9]/gu, "");
}
function isSecretKey(key) {
	const normalized = normalizeSecretKey(key);
	if (normalized === "token" || normalized.endsWith("token")) return true;
	if (normalized === "auth" || normalized === "authorization") return true;
	return SECRET_KEY_MARKERS.some((marker) => normalized.includes(marker));
}
function isRecord(value) {
	return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function isSecretReferenceLike(value) {
	if (!isRecord(value)) return false;
	return value.source === "env" && typeof value.id === "string" && (value.provider === void 0 || typeof value.provider === "string");
}
function redactString(value) {
	let next = value;
	for (const pattern of SECRET_VALUE_PATTERNS) next = next.replace(pattern, REDACTED_MIGRATION_VALUE);
	return next;
}
function redactMigrationValueInternal(value, seen) {
	if (typeof value === "string") return redactString(value);
	if (Array.isArray(value)) return value.map((entry) => redactMigrationValueInternal(entry, seen));
	if (!value || typeof value !== "object") return value;
	if (seen.has(value)) return REDACTED_MIGRATION_VALUE;
	seen.add(value);
	const next = {};
	for (const [key, entry] of Object.entries(value)) {
		if (isSecretKey(key) && !isSecretReferenceLike(entry)) {
			next[key] = REDACTED_MIGRATION_VALUE;
			continue;
		}
		next[key] = redactMigrationValueInternal(entry, seen);
	}
	return next;
}
function redactMigrationValue(value) {
	return redactMigrationValueInternal(value, /* @__PURE__ */ new WeakSet());
}
function redactMigrationItem(item) {
	return redactMigrationValue(item);
}
function redactMigrationPlan(plan) {
	return redactMigrationValue(plan);
}
//#endregion
export { markMigrationItemError as a, redactMigrationPlan as c, markMigrationItemConflict as i, redactMigrationValue as l, MIGRATION_REASON_TARGET_EXISTS as n, markMigrationItemSkipped as o, createMigrationItem as r, redactMigrationItem as s, MIGRATION_REASON_MISSING_SOURCE_OR_TARGET as t, summarizeMigrationItems as u };
