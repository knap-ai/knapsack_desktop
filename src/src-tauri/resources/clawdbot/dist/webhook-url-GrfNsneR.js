//#region src/cron/session-target.ts
const INVALID_CRON_SESSION_TARGET_ID_ERROR = "invalid cron sessionTarget session id";
function isInvalidCronSessionTargetIdError(error) {
	return error instanceof Error && error.message === "invalid cron sessionTarget session id";
}
function assertSafeCronSessionTargetId(sessionId) {
	const trimmed = sessionId.trim();
	if (!trimmed) throw new Error(INVALID_CRON_SESSION_TARGET_ID_ERROR);
	if (trimmed.includes("/") || trimmed.includes("\\") || trimmed.includes("\0")) throw new Error(INVALID_CRON_SESSION_TARGET_ID_ERROR);
	return trimmed;
}
//#endregion
//#region src/cron/webhook-url.ts
function isAllowedWebhookProtocol(protocol) {
	return protocol === "http:" || protocol === "https:";
}
function normalizeHttpWebhookUrl(value) {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	try {
		if (!isAllowedWebhookProtocol(new URL(trimmed).protocol)) return null;
		return trimmed;
	} catch {
		return null;
	}
}
//#endregion
export { assertSafeCronSessionTargetId as n, isInvalidCronSessionTargetIdError as r, normalizeHttpWebhookUrl as t };
