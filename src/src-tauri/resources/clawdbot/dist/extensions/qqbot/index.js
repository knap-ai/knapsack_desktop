import { defineBundledChannelEntry, loadBundledEntryExportSync } from "openclaw/plugin-sdk/channel-entry-contract";
//#region extensions/qqbot/index.ts
function resolveQQBotAccount(config, accountId) {
	return loadBundledEntryExportSync(import.meta.url, {
		specifier: "./api.js",
		exportName: "resolveQQBotAccount"
	})(config, accountId);
}
function sendDocument(context, filePath, options) {
	return loadBundledEntryExportSync(import.meta.url, {
		specifier: "./api.js",
		exportName: "sendDocument"
	})(context, filePath, options);
}
function getFrameworkCommands() {
	return loadBundledEntryExportSync(import.meta.url, {
		specifier: "./api.js",
		exportName: "getFrameworkCommands"
	})();
}
function registerChannelTool(api) {
	loadBundledEntryExportSync(import.meta.url, {
		specifier: "./api.js",
		exportName: "registerChannelTool"
	})(api);
}
function registerRemindTool(api) {
	loadBundledEntryExportSync(import.meta.url, {
		specifier: "./api.js",
		exportName: "registerRemindTool"
	})(api);
}
var qqbot_default = defineBundledChannelEntry({
	id: "qqbot",
	name: "QQ Bot",
	description: "QQ Bot channel plugin",
	importMetaUrl: import.meta.url,
	plugin: {
		specifier: "./api.js",
		exportName: "qqbotPlugin"
	},
	runtime: {
		specifier: "./runtime-api.js",
		exportName: "setQQBotRuntime"
	},
	registerFull(api) {
		registerChannelTool(api);
		registerRemindTool(api);
		for (const cmd of getFrameworkCommands()) api.registerCommand({
			name: cmd.name,
			description: cmd.description,
			requireAuth: true,
			acceptsArgs: true,
			handler: async (ctx) => {
				const fromStripped = (ctx.from ?? "").replace(/^qqbot:/i, "");
				const rawMsgType = fromStripped.split(":")[0] ?? "c2c";
				const msgType = rawMsgType === "group" ? "group" : rawMsgType === "channel" ? "guild" : rawMsgType === "dm" ? "dm" : "c2c";
				const colonIdx = fromStripped.indexOf(":");
				const targetId = colonIdx !== -1 ? fromStripped.slice(colonIdx + 1) : fromStripped;
				const targetType = rawMsgType === "group" ? "group" : rawMsgType === "channel" ? "channel" : rawMsgType === "dm" ? "dm" : "c2c";
				const account = resolveQQBotAccount(ctx.config, ctx.accountId ?? void 0);
				const slashCtx = {
					type: msgType,
					senderId: ctx.senderId ?? "",
					messageId: "",
					eventTimestamp: (/* @__PURE__ */ new Date()).toISOString(),
					receivedAt: Date.now(),
					rawContent: `/${cmd.name}${ctx.args ? ` ${ctx.args}` : ""}`,
					args: ctx.args ?? "",
					accountId: account.accountId,
					appId: account.appId,
					accountConfig: account.config,
					commandAuthorized: true,
					queueSnapshot: {
						totalPending: 0,
						activeUsers: 0,
						maxConcurrentUsers: 10,
						senderPending: 0
					}
				};
				const result = await cmd.handler(slashCtx);
				if (typeof result === "string") return { text: result };
				if (result && typeof result === "object" && "filePath" in result) {
					try {
						await sendDocument({
							targetType,
							targetId,
							account,
							logPrefix: `[qqbot:${account.accountId}]`
						}, String(result.filePath), { allowQQBotDataDownloads: true });
					} catch {}
					return { text: result.text };
				}
				return { text: result && typeof result === "object" && "text" in result && typeof result.text === "string" ? result.text : "⚠️ 命令返回了意外结果。" };
			}
		});
	}
});
//#endregion
export { qqbot_default as default };
