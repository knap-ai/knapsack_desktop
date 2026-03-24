import { YS as listEnabledDiscordAccounts, cn as handleDiscordMessageAction, qS as createDiscordActionGate } from "./pi-embedded-CbCYZxIb.js";
import { a as listTokenSourcedAccounts, i as createUnionActionGate, l as stringEnum } from "./channel-actions-fV93bLjV.js";
import { Type } from "@sinclair/typebox";
//#region extensions/discord/src/message-tool-schema.ts
const discordComponentEmojiSchema = Type.Object({
	name: Type.String(),
	id: Type.Optional(Type.String()),
	animated: Type.Optional(Type.Boolean())
});
const discordComponentOptionSchema = Type.Object({
	label: Type.String(),
	value: Type.String(),
	description: Type.Optional(Type.String()),
	emoji: Type.Optional(discordComponentEmojiSchema),
	default: Type.Optional(Type.Boolean())
});
const discordComponentButtonSchema = Type.Object({
	label: Type.String(),
	style: Type.Optional(stringEnum([
		"primary",
		"secondary",
		"success",
		"danger",
		"link"
	])),
	url: Type.Optional(Type.String()),
	emoji: Type.Optional(discordComponentEmojiSchema),
	disabled: Type.Optional(Type.Boolean()),
	allowedUsers: Type.Optional(Type.Array(Type.String({ description: "Discord user ids or names allowed to interact with this button." })))
});
const discordComponentSelectSchema = Type.Object({
	type: Type.Optional(stringEnum([
		"string",
		"user",
		"role",
		"mentionable",
		"channel"
	])),
	placeholder: Type.Optional(Type.String()),
	minValues: Type.Optional(Type.Number()),
	maxValues: Type.Optional(Type.Number()),
	options: Type.Optional(Type.Array(discordComponentOptionSchema))
});
const discordComponentBlockSchema = Type.Object({
	type: Type.String(),
	text: Type.Optional(Type.String()),
	texts: Type.Optional(Type.Array(Type.String())),
	accessory: Type.Optional(Type.Object({
		type: Type.String(),
		url: Type.Optional(Type.String()),
		button: Type.Optional(discordComponentButtonSchema)
	})),
	spacing: Type.Optional(stringEnum(["small", "large"])),
	divider: Type.Optional(Type.Boolean()),
	buttons: Type.Optional(Type.Array(discordComponentButtonSchema)),
	select: Type.Optional(discordComponentSelectSchema),
	items: Type.Optional(Type.Array(Type.Object({
		url: Type.String(),
		description: Type.Optional(Type.String()),
		spoiler: Type.Optional(Type.Boolean())
	}))),
	file: Type.Optional(Type.String()),
	spoiler: Type.Optional(Type.Boolean())
});
const discordComponentModalFieldSchema = Type.Object({
	type: Type.String(),
	name: Type.Optional(Type.String()),
	label: Type.String(),
	description: Type.Optional(Type.String()),
	placeholder: Type.Optional(Type.String()),
	required: Type.Optional(Type.Boolean()),
	options: Type.Optional(Type.Array(discordComponentOptionSchema)),
	minValues: Type.Optional(Type.Number()),
	maxValues: Type.Optional(Type.Number()),
	minLength: Type.Optional(Type.Number()),
	maxLength: Type.Optional(Type.Number()),
	style: Type.Optional(stringEnum(["short", "paragraph"]))
});
const discordComponentModalSchema = Type.Object({
	title: Type.String(),
	triggerLabel: Type.Optional(Type.String()),
	triggerStyle: Type.Optional(stringEnum([
		"primary",
		"secondary",
		"success",
		"danger",
		"link"
	])),
	fields: Type.Array(discordComponentModalFieldSchema)
});
function createDiscordMessageToolComponentsSchema() {
	return Type.Object({
		text: Type.Optional(Type.String()),
		reusable: Type.Optional(Type.Boolean({ description: "Allow components to be used multiple times until they expire." })),
		container: Type.Optional(Type.Object({
			accentColor: Type.Optional(Type.String()),
			spoiler: Type.Optional(Type.Boolean())
		})),
		blocks: Type.Optional(Type.Array(discordComponentBlockSchema)),
		modal: Type.Optional(discordComponentModalSchema)
	}, { description: "Discord components v2 payload. Set reusable=true to keep buttons, selects, and forms active until expiry." });
}
//#endregion
//#region extensions/discord/src/channel-actions.ts
function resolveDiscordActionDiscovery(cfg) {
	const accounts = listTokenSourcedAccounts(listEnabledDiscordAccounts(cfg));
	if (accounts.length === 0) return null;
	const unionGate = createUnionActionGate(accounts, (account) => createDiscordActionGate({
		cfg,
		accountId: account.accountId
	}));
	return { isEnabled: (key, defaultValue = true) => unionGate(key, defaultValue) };
}
function describeDiscordMessageTool({ cfg }) {
	const discovery = resolveDiscordActionDiscovery(cfg);
	if (!discovery) return {
		actions: [],
		capabilities: [],
		schema: null
	};
	const actions = new Set(["send"]);
	if (discovery.isEnabled("polls")) actions.add("poll");
	if (discovery.isEnabled("reactions")) {
		actions.add("react");
		actions.add("reactions");
		actions.add("emoji-list");
	}
	if (discovery.isEnabled("messages")) {
		actions.add("read");
		actions.add("edit");
		actions.add("delete");
	}
	if (discovery.isEnabled("pins")) {
		actions.add("pin");
		actions.add("unpin");
		actions.add("list-pins");
	}
	if (discovery.isEnabled("permissions")) actions.add("permissions");
	if (discovery.isEnabled("threads")) {
		actions.add("thread-create");
		actions.add("thread-list");
		actions.add("thread-reply");
	}
	if (discovery.isEnabled("search")) actions.add("search");
	if (discovery.isEnabled("stickers")) actions.add("sticker");
	if (discovery.isEnabled("memberInfo")) actions.add("member-info");
	if (discovery.isEnabled("roleInfo")) actions.add("role-info");
	if (discovery.isEnabled("emojiUploads")) actions.add("emoji-upload");
	if (discovery.isEnabled("stickerUploads")) actions.add("sticker-upload");
	if (discovery.isEnabled("roles", false)) {
		actions.add("role-add");
		actions.add("role-remove");
	}
	if (discovery.isEnabled("channelInfo")) {
		actions.add("channel-info");
		actions.add("channel-list");
	}
	if (discovery.isEnabled("channels")) {
		actions.add("channel-create");
		actions.add("channel-edit");
		actions.add("channel-delete");
		actions.add("channel-move");
		actions.add("category-create");
		actions.add("category-edit");
		actions.add("category-delete");
	}
	if (discovery.isEnabled("voiceStatus")) actions.add("voice-status");
	if (discovery.isEnabled("events")) {
		actions.add("event-list");
		actions.add("event-create");
	}
	if (discovery.isEnabled("moderation", false)) {
		actions.add("timeout");
		actions.add("kick");
		actions.add("ban");
	}
	if (discovery.isEnabled("presence", false)) actions.add("set-presence");
	return {
		actions: Array.from(actions),
		capabilities: ["interactive", "components"],
		schema: { properties: { components: Type.Optional(createDiscordMessageToolComponentsSchema()) } }
	};
}
const discordMessageActions = {
	describeMessageTool: describeDiscordMessageTool,
	extractToolSend: ({ args }) => {
		const action = typeof args.action === "string" ? args.action.trim() : "";
		if (action === "sendMessage") {
			const to = typeof args.to === "string" ? args.to : void 0;
			return to ? { to } : null;
		}
		if (action === "threadReply") {
			const channelId = typeof args.channelId === "string" ? args.channelId.trim() : "";
			return channelId ? { to: `channel:${channelId}` } : null;
		}
		return null;
	},
	handleAction: async ({ action, params, cfg, accountId, requesterSenderId, toolContext, mediaLocalRoots }) => {
		return await handleDiscordMessageAction({
			action,
			params,
			cfg,
			accountId,
			requesterSenderId,
			toolContext,
			mediaLocalRoots
		});
	}
};
//#endregion
export { discordMessageActions as t };
