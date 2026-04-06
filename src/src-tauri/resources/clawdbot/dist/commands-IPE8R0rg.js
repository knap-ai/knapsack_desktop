import { r as logVerbose } from "./globals-BJZkpw-q.js";
import { b as setPluginCommandRegistryLocked, c as listPluginInvocationKeys, y as pluginCommands } from "./types-BKsOYeOd.js";
import { o as detachPluginConversationBinding, p as requestPluginConversationBinding, s as getCurrentPluginConversationBinding } from "./conversation-binding-oQzcUiHT.js";
import { n as parseExplicitTargetForChannel } from "./target-parsing-CYsOfnR5.js";
//#region src/plugins/commands.ts
/**
* Plugin Command Registry
*
* Manages commands registered by plugins that bypass the LLM agent.
* These commands are processed before built-in commands and before agent invocation.
*/
const MAX_ARGS_LENGTH = 4096;
/**
* Check if a command body matches a registered plugin command.
* Returns the command definition and parsed args if matched.
*
* Note: If a command has `acceptsArgs: false` and the user provides arguments,
* the command will not match. This allows the message to fall through to
* built-in handlers or the agent. Document this behavior to plugin authors.
*/
function matchPluginCommand(commandBody) {
	const trimmed = commandBody.trim();
	if (!trimmed.startsWith("/")) return null;
	const spaceIndex = trimmed.indexOf(" ");
	const commandName = spaceIndex === -1 ? trimmed : trimmed.slice(0, spaceIndex);
	const args = spaceIndex === -1 ? void 0 : trimmed.slice(spaceIndex + 1).trim();
	const key = commandName.toLowerCase();
	const command = pluginCommands.get(key) ?? Array.from(pluginCommands.values()).find((candidate) => listPluginInvocationNames(candidate).includes(key));
	if (!command) return null;
	if (args && !command.acceptsArgs) return null;
	return {
		command,
		args: args || void 0
	};
}
/**
* Sanitize command arguments to prevent injection attacks.
* Removes control characters and enforces length limits.
*/
function sanitizeArgs(args) {
	if (!args) return;
	if (args.length > MAX_ARGS_LENGTH) return args.slice(0, MAX_ARGS_LENGTH);
	let sanitized = "";
	for (const char of args) {
		const code = char.charCodeAt(0);
		if (!(code <= 31 && code !== 9 && code !== 10 || code === 127)) sanitized += char;
	}
	return sanitized;
}
function stripPrefix(raw, prefix) {
	if (!raw) return;
	return raw.startsWith(prefix) ? raw.slice(prefix.length) : raw;
}
function parseDiscordBindingTarget(raw) {
	if (!raw) return null;
	if (raw.startsWith("slash:")) return null;
	const normalized = raw.startsWith("discord:") ? raw.slice(8) : raw;
	if (!normalized) return null;
	if (normalized.startsWith("channel:")) {
		const id = normalized.slice(8).trim();
		return id ? { conversationId: `channel:${id}` } : null;
	}
	if (normalized.startsWith("user:")) {
		const id = normalized.slice(5).trim();
		return id ? { conversationId: `user:${id}` } : null;
	}
	return /^\d+$/.test(normalized.trim()) ? { conversationId: `user:${normalized.trim()}` } : null;
}
function resolveBindingConversationFromCommand(params) {
	const accountId = params.accountId?.trim() || "default";
	if (params.channel === "telegram") {
		const rawTarget = params.to && params.to.startsWith("slash:") ? params.from ?? params.to : params.to ?? params.from;
		if (!rawTarget) return null;
		const target = parseExplicitTargetForChannel("telegram", rawTarget);
		if (!target) return null;
		return {
			channel: "telegram",
			accountId,
			conversationId: target.to,
			threadId: params.messageThreadId ?? target.threadId
		};
	}
	if (params.channel === "discord") {
		const source = params.to?.startsWith("slash:") || !params.to?.trim() ? params.from ?? params.to : params.to;
		const rawTarget = source?.startsWith("discord:") ? stripPrefix(source, "discord:") : source;
		if (!rawTarget || rawTarget.startsWith("slash:")) return null;
		const target = parseExplicitTargetForChannel("discord", rawTarget) ?? parseDiscordBindingTarget(rawTarget);
		if (!target) return null;
		return {
			channel: "discord",
			accountId,
			conversationId: "conversationId" in target ? target.conversationId : `${target.chatType === "direct" ? "user" : "channel"}:${target.to}`,
			parentConversationId: params.threadParentId?.trim() || void 0,
			threadId: params.messageThreadId
		};
	}
	return null;
}
/**
* Execute a plugin command handler.
*
* Note: Plugin authors should still validate and sanitize ctx.args for their
* specific use case. This function provides basic defense-in-depth sanitization.
*/
async function executePluginCommand(params) {
	const { command, args, senderId, channel, isAuthorizedSender, commandBody, config } = params;
	if (command.requireAuth !== false && !isAuthorizedSender) {
		logVerbose(`Plugin command /${command.name} blocked: unauthorized sender ${senderId || "<unknown>"}`);
		return { text: "⚠️ This command requires authorization." };
	}
	const sanitizedArgs = sanitizeArgs(args);
	const bindingConversation = resolveBindingConversationFromCommand({
		channel,
		from: params.from,
		to: params.to,
		accountId: params.accountId,
		messageThreadId: params.messageThreadId,
		threadParentId: params.threadParentId
	});
	const ctx = {
		senderId,
		channel,
		channelId: params.channelId,
		isAuthorizedSender,
		gatewayClientScopes: params.gatewayClientScopes,
		sessionKey: params.sessionKey,
		sessionId: params.sessionId,
		args: sanitizedArgs,
		commandBody,
		config,
		from: params.from,
		to: params.to,
		accountId: params.accountId,
		messageThreadId: params.messageThreadId,
		threadParentId: params.threadParentId,
		requestConversationBinding: async (bindingParams) => {
			if (!command.pluginRoot || !bindingConversation) return {
				status: "error",
				message: "This command cannot bind the current conversation."
			};
			return requestPluginConversationBinding({
				pluginId: command.pluginId,
				pluginName: command.pluginName,
				pluginRoot: command.pluginRoot,
				requestedBySenderId: senderId,
				conversation: bindingConversation,
				binding: bindingParams
			});
		},
		detachConversationBinding: async () => {
			if (!command.pluginRoot || !bindingConversation) return { removed: false };
			return detachPluginConversationBinding({
				pluginRoot: command.pluginRoot,
				conversation: bindingConversation
			});
		},
		getCurrentConversationBinding: async () => {
			if (!command.pluginRoot || !bindingConversation) return null;
			return getCurrentPluginConversationBinding({
				pluginRoot: command.pluginRoot,
				conversation: bindingConversation
			});
		}
	};
	setPluginCommandRegistryLocked(true);
	try {
		const result = await command.handler(ctx);
		logVerbose(`Plugin command /${command.name} executed successfully for ${senderId || "unknown"}`);
		return result;
	} catch (err) {
		const error = err;
		logVerbose(`Plugin command /${command.name} error: ${error.message}`);
		return { text: "⚠️ Command failed. Please try again later." };
	} finally {
		setPluginCommandRegistryLocked(false);
	}
}
/**
* List all registered plugin commands.
* Used for /help and /commands output.
*/
function listPluginCommands() {
	return Array.from(pluginCommands.values()).map((cmd) => ({
		name: cmd.name,
		description: cmd.description,
		pluginId: cmd.pluginId
	}));
}
function listPluginInvocationNames(command) {
	return listPluginInvocationKeys(command);
}
const __testing = { resolveBindingConversationFromCommand };
//#endregion
export { matchPluginCommand as i, executePluginCommand as n, listPluginCommands as r, __testing as t };
