import { a as normalizeInteractiveReply } from "./payload-CLtYAQwf.js";
import { t as reduceInteractiveReply } from "./interactive-Bgo7jECU.js";
const TELEGRAM_APPROVE_ALLOW_ALWAYS_PATTERN = /^\/approve(?:@[^\s]+)?\s+[A-Za-z0-9][A-Za-z0-9._:-]*\s+allow-always$/i;
function fitsTelegramCallbackData(value) {
	return Buffer.byteLength(value, "utf8") <= 64;
}
function rewriteTelegramApprovalDecisionAlias(value) {
	if (!value.endsWith(" allow-always")) return value;
	if (!TELEGRAM_APPROVE_ALLOW_ALWAYS_PATTERN.test(value)) return value;
	return value.slice(0, -12) + "always";
}
function sanitizeTelegramCallbackData(value) {
	const rewritten = rewriteTelegramApprovalDecisionAlias(value);
	return fitsTelegramCallbackData(rewritten) ? rewritten : void 0;
}
//#endregion
//#region extensions/telegram/src/button-types.ts
const TELEGRAM_INTERACTIVE_ROW_SIZE = 3;
function toTelegramButtonStyle(style) {
	return style === "danger" || style === "success" || style === "primary" ? style : void 0;
}
function chunkInteractiveButtons(buttons, rows) {
	for (let i = 0; i < buttons.length; i += TELEGRAM_INTERACTIVE_ROW_SIZE) {
		const row = buttons.slice(i, i + TELEGRAM_INTERACTIVE_ROW_SIZE).flatMap((button) => {
			const callbackData = sanitizeTelegramCallbackData(button.value);
			if (!callbackData) return [];
			return [{
				text: button.label,
				callback_data: callbackData,
				style: toTelegramButtonStyle(button.style)
			}];
		});
		if (row.length > 0) rows.push(row);
	}
}
function buildTelegramInteractiveButtons(interactive) {
	const rows = reduceInteractiveReply(interactive, [], (state, block) => {
		if (block.type === "buttons") {
			chunkInteractiveButtons(block.buttons, state);
			return state;
		}
		if (block.type === "select") chunkInteractiveButtons(block.options.map((option) => ({
			label: option.label,
			value: option.value
		})), state);
		return state;
	});
	return rows.length > 0 ? rows : void 0;
}
function resolveTelegramInlineButtons(params) {
	return params.buttons ?? buildTelegramInteractiveButtons(normalizeInteractiveReply(params.interactive));
}
//#endregion
export { fitsTelegramCallbackData as n, resolveTelegramInlineButtons as t };
