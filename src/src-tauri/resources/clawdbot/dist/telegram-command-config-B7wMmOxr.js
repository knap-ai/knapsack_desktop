import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
//#region src/plugin-sdk/telegram-command-config.ts
const TELEGRAM_COMMAND_NAME_PATTERN_VALUE = /^[a-z0-9_]{1,32}$/;
function normalizeTelegramCommandNameImpl(value) {
	const trimmed = value.trim();
	if (!trimmed) return "";
	return normalizeLowercaseStringOrEmpty(trimmed.startsWith("/") ? trimmed.slice(1) : trimmed).replace(/-/g, "_");
}
function normalizeTelegramCommandDescriptionImpl(value) {
	return value.trim();
}
function resolveTelegramCustomCommandsImpl(params) {
	const entries = Array.isArray(params.commands) ? params.commands : [];
	const reserved = params.reservedCommands ?? /* @__PURE__ */ new Set();
	const checkReserved = params.checkReserved !== false;
	const checkDuplicates = params.checkDuplicates !== false;
	const seen = /* @__PURE__ */ new Set();
	const resolved = [];
	const issues = [];
	for (let index = 0; index < entries.length; index += 1) {
		const entry = entries[index];
		const normalized = normalizeTelegramCommandNameImpl(entry?.command ?? "");
		if (!normalized) {
			issues.push({
				index,
				field: "command",
				message: "Telegram custom command is missing a command name."
			});
			continue;
		}
		if (!TELEGRAM_COMMAND_NAME_PATTERN_VALUE.test(normalized)) {
			issues.push({
				index,
				field: "command",
				message: `Telegram custom command "/${normalized}" is invalid (use a-z, 0-9, underscore; max 32 chars).`
			});
			continue;
		}
		if (checkReserved && reserved.has(normalized)) {
			issues.push({
				index,
				field: "command",
				message: `Telegram custom command "/${normalized}" conflicts with a native command.`
			});
			continue;
		}
		if (checkDuplicates && seen.has(normalized)) {
			issues.push({
				index,
				field: "command",
				message: `Telegram custom command "/${normalized}" is duplicated.`
			});
			continue;
		}
		const description = normalizeTelegramCommandDescriptionImpl(entry?.description ?? "");
		if (!description) {
			issues.push({
				index,
				field: "description",
				message: `Telegram custom command "/${normalized}" is missing a description.`
			});
			continue;
		}
		if (checkDuplicates) seen.add(normalized);
		resolved.push({
			command: normalized,
			description
		});
	}
	return {
		commands: resolved,
		issues
	};
}
function getTelegramCommandNamePattern() {
	return TELEGRAM_COMMAND_NAME_PATTERN_VALUE;
}
const TELEGRAM_COMMAND_NAME_PATTERN = TELEGRAM_COMMAND_NAME_PATTERN_VALUE;
function normalizeTelegramCommandName(value) {
	return normalizeTelegramCommandNameImpl(value);
}
function normalizeTelegramCommandDescription(value) {
	return normalizeTelegramCommandDescriptionImpl(value);
}
function resolveTelegramCustomCommands(params) {
	return resolveTelegramCustomCommandsImpl(params);
}
//#endregion
export { resolveTelegramCustomCommands as a, normalizeTelegramCommandName as i, getTelegramCommandNamePattern as n, normalizeTelegramCommandDescription as r, TELEGRAM_COMMAND_NAME_PATTERN as t };
