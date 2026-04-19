import { n as parseSlackBlocksInput } from "./blocks-input-DBKMsIf6.js";
import { normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { reduceInteractiveReply } from "openclaw/plugin-sdk/interactive-runtime";
//#region extensions/slack/src/truncate.ts
function truncateSlackText(value, max) {
	const trimmed = value.trim();
	if (trimmed.length <= max) return trimmed;
	if (max <= 1) return trimmed.slice(0, max);
	return `${trimmed.slice(0, max - 1)}…`;
}
//#endregion
//#region extensions/slack/src/blocks-render.ts
const SLACK_REPLY_BUTTON_ACTION_ID = "openclaw:reply_button";
const SLACK_REPLY_SELECT_ACTION_ID = "openclaw:reply_select";
const SLACK_SECTION_TEXT_MAX = 3e3;
const SLACK_PLAIN_TEXT_MAX = 75;
function buildSlackReplyButtonActionId(buttonIndex, choiceIndex) {
	return `${SLACK_REPLY_BUTTON_ACTION_ID}:${String(buttonIndex)}:${String(choiceIndex + 1)}`;
}
function buildSlackReplySelectActionId(selectIndex) {
	return `${SLACK_REPLY_SELECT_ACTION_ID}:${String(selectIndex)}`;
}
function resolveSlackButtonStyle(style) {
	if (style === "primary" || style === "danger") return style;
	if (style === "success") return "primary";
}
function buildSlackInteractiveBlocks(interactive) {
	return reduceInteractiveReply(interactive, {
		blocks: [],
		buttonIndex: 0,
		selectIndex: 0
	}, (state, block) => {
		if (block.type === "text") {
			const trimmed = block.text.trim();
			if (!trimmed) return state;
			state.blocks.push({
				type: "section",
				text: {
					type: "mrkdwn",
					text: truncateSlackText(trimmed, SLACK_SECTION_TEXT_MAX)
				}
			});
			return state;
		}
		if (block.type === "buttons") {
			if (block.buttons.length === 0) return state;
			state.blocks.push({
				type: "actions",
				block_id: `openclaw_reply_buttons_${++state.buttonIndex}`,
				elements: block.buttons.map((button, choiceIndex) => {
					const style = resolveSlackButtonStyle(button.style);
					return {
						type: "button",
						action_id: buildSlackReplyButtonActionId(state.buttonIndex, choiceIndex),
						text: {
							type: "plain_text",
							text: truncateSlackText(button.label, SLACK_PLAIN_TEXT_MAX),
							emoji: true
						},
						value: button.value,
						...style ? { style } : {}
					};
				})
			});
			return state;
		}
		if (block.options.length === 0) return state;
		state.blocks.push({
			type: "actions",
			block_id: `openclaw_reply_select_${++state.selectIndex}`,
			elements: [{
				type: "static_select",
				action_id: buildSlackReplySelectActionId(state.selectIndex),
				placeholder: {
					type: "plain_text",
					text: truncateSlackText(normalizeOptionalString(block.placeholder) ?? "Choose an option", SLACK_PLAIN_TEXT_MAX),
					emoji: true
				},
				options: block.options.map((option, _choiceIndex) => ({
					text: {
						type: "plain_text",
						text: truncateSlackText(option.label, SLACK_PLAIN_TEXT_MAX),
						emoji: true
					},
					value: option.value
				}))
			}]
		});
		return state;
	}).blocks;
}
//#endregion
//#region extensions/slack/src/reply-blocks.ts
function resolveSlackReplyBlocks(payload) {
	const slackData = payload.channelData?.slack;
	const interactiveBlocks = buildSlackInteractiveBlocks(payload.interactive);
	let channelBlocks = [];
	if (slackData && typeof slackData === "object" && !Array.isArray(slackData)) channelBlocks = parseSlackBlocksInput(slackData.blocks) ?? [];
	const blocks = [...channelBlocks, ...interactiveBlocks];
	if (blocks.length > 50) throw new Error(`Slack blocks cannot exceed 50 items after interactive render`);
	return blocks.length > 0 ? blocks : void 0;
}
//#endregion
export { truncateSlackText as a, buildSlackInteractiveBlocks as i, SLACK_REPLY_BUTTON_ACTION_ID as n, SLACK_REPLY_SELECT_ACTION_ID as r, resolveSlackReplyBlocks as t };
