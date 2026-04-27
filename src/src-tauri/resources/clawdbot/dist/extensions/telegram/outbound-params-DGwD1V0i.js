//#region extensions/telegram/src/targets.ts
const TELEGRAM_NUMERIC_CHAT_ID_REGEX = /^-?\d+$/;
const TELEGRAM_USERNAME_REGEX = /^[A-Za-z0-9_]{5,}$/i;
function stripTelegramInternalPrefixes(to) {
	let trimmed = to.trim();
	let strippedTelegramPrefix = false;
	while (true) {
		const next = (() => {
			if (/^(telegram|tg):/i.test(trimmed)) {
				strippedTelegramPrefix = true;
				return trimmed.replace(/^(telegram|tg):/i, "").trim();
			}
			if (strippedTelegramPrefix && /^group:/i.test(trimmed)) return trimmed.replace(/^group:/i, "").trim();
			return trimmed;
		})();
		if (next === trimmed) return trimmed;
		trimmed = next;
	}
}
function normalizeTelegramChatId(raw) {
	const stripped = stripTelegramInternalPrefixes(raw);
	if (!stripped) return;
	if (TELEGRAM_NUMERIC_CHAT_ID_REGEX.test(stripped)) return stripped;
}
function isNumericTelegramChatId(raw) {
	return TELEGRAM_NUMERIC_CHAT_ID_REGEX.test(raw.trim());
}
function normalizeTelegramLookupTarget(raw) {
	const stripped = stripTelegramInternalPrefixes(raw);
	if (!stripped) return;
	if (isNumericTelegramChatId(stripped)) return stripped;
	const tmeMatch = /^(?:https?:\/\/)?t\.me\/([A-Za-z0-9_]+)$/i.exec(stripped);
	if (tmeMatch?.[1]) return `@${tmeMatch[1]}`;
	if (stripped.startsWith("@")) {
		const handle = stripped.slice(1);
		if (!handle || !TELEGRAM_USERNAME_REGEX.test(handle)) return;
		return `@${handle}`;
	}
	if (TELEGRAM_USERNAME_REGEX.test(stripped)) return `@${stripped}`;
}
/**
* Parse a Telegram delivery target into chatId and optional topic/thread ID.
*
* Supported formats:
* - `chatId` (plain chat ID, t.me link, @username, or internal prefixes like `telegram:...`)
* - `chatId:topicId` (numeric topic/thread ID)
* - `chatId:topic:topicId` (explicit topic marker; preferred)
*/
function resolveTelegramChatType(chatId) {
	const trimmed = chatId.trim();
	if (!trimmed) return "unknown";
	if (isNumericTelegramChatId(trimmed)) return trimmed.startsWith("-") ? "group" : "direct";
	return "unknown";
}
function parseTelegramTarget(to) {
	const normalized = stripTelegramInternalPrefixes(to);
	const topicMatch = /^(.+?):topic:(\d+)$/.exec(normalized);
	if (topicMatch) return {
		chatId: topicMatch[1],
		messageThreadId: Number.parseInt(topicMatch[2], 10),
		chatType: resolveTelegramChatType(topicMatch[1])
	};
	const colonMatch = /^(.+):(\d+)$/.exec(normalized);
	if (colonMatch) return {
		chatId: colonMatch[1],
		messageThreadId: Number.parseInt(colonMatch[2], 10),
		chatType: resolveTelegramChatType(colonMatch[1])
	};
	return {
		chatId: normalized,
		chatType: resolveTelegramChatType(normalized)
	};
}
function resolveTelegramTargetChatType(target) {
	return parseTelegramTarget(target).chatType;
}
//#endregion
//#region extensions/telegram/src/outbound-params.ts
function parseIntegerId(value) {
	if (!/^-?\d+$/.test(value)) return;
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) ? parsed : void 0;
}
function normalizeTelegramReplyToMessageId(value) {
	if (typeof value === "number") return Number.isFinite(value) ? Math.trunc(value) : void 0;
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	return trimmed ? parseIntegerId(trimmed) : void 0;
}
function parseTelegramReplyToMessageId(replyToId) {
	return normalizeTelegramReplyToMessageId(replyToId);
}
function parseTelegramThreadId(threadId) {
	if (threadId == null) return;
	if (typeof threadId === "number") return Number.isFinite(threadId) ? Math.trunc(threadId) : void 0;
	const trimmed = threadId.trim();
	if (!trimmed) return;
	const topicMatch = /^-?\d+:topic:(\d+)$/.exec(trimmed);
	if (topicMatch) return parseIntegerId(topicMatch[1]);
	const scopedMatch = /^-?\d+:(-?\d+)$/.exec(trimmed);
	return parseIntegerId(scopedMatch ? scopedMatch[1] : trimmed);
}
//#endregion
export { normalizeTelegramChatId as a, resolveTelegramTargetChatType as c, isNumericTelegramChatId as i, stripTelegramInternalPrefixes as l, parseTelegramReplyToMessageId as n, normalizeTelegramLookupTarget as o, parseTelegramThreadId as r, parseTelegramTarget as s, normalizeTelegramReplyToMessageId as t };
