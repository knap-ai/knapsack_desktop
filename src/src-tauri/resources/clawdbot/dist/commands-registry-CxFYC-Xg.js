import { i as normalizeLowercaseStringOrEmpty, o as normalizeOptionalLowercaseString } from "./string-coerce-BUSzWgUA.js";
import { t as getChannelPlugin } from "./registry-Delpa74L.js";
import { n as DEFAULT_MODEL, r as DEFAULT_PROVIDER } from "./defaults-CiQa3xnX.js";
import "./plugins-D4ODSIPT.js";
import { d as resolveConfiguredModelRef } from "./model-selection-CTdyYoio.js";
import { n as getNativeCommandSurfaces, t as getChatCommands } from "./commands-registry.data-DyhIRBbT.js";
import { n as listChatCommands, r as listChatCommandsForConfig } from "./commands-registry-list-MHrd1pp9.js";
import { r as normalizeCommandBody } from "./commands-registry-normalize-By3bcvJy.js";
//#region src/auto-reply/commands-registry.ts
function resolveNativeName(command, provider) {
	if (!command.nativeName) return;
	if (!provider) return command.nativeName;
	return getChannelPlugin(provider)?.commands?.resolveNativeCommandName?.({
		commandKey: command.key,
		defaultName: command.nativeName
	}) ?? command.nativeName;
}
function toNativeCommandSpec(command, provider) {
	return {
		name: resolveNativeName(command, provider) ?? command.key,
		description: command.description,
		acceptsArgs: Boolean(command.acceptsArgs),
		args: command.args
	};
}
function listNativeSpecsFromCommands(commands, provider) {
	return commands.filter((command) => command.scope !== "text" && command.nativeName).map((command) => toNativeCommandSpec(command, provider));
}
function listNativeCommandSpecs(params) {
	return listNativeSpecsFromCommands(listChatCommands({ skillCommands: params?.skillCommands }), params?.provider);
}
function listNativeCommandSpecsForConfig(cfg, params) {
	return listNativeSpecsFromCommands(listChatCommandsForConfig(cfg, params), params?.provider);
}
function findCommandByNativeName(name, provider) {
	const normalized = normalizeOptionalLowercaseString(name);
	if (!normalized) return;
	return getChatCommands().find((command) => command.scope !== "text" && normalizeOptionalLowercaseString(resolveNativeName(command, provider)) === normalized);
}
function buildCommandText(commandName, args) {
	const trimmedArgs = args?.trim();
	return trimmedArgs ? `/${commandName} ${trimmedArgs}` : `/${commandName}`;
}
function parsePositionalArgs(definitions, raw) {
	const values = {};
	const trimmed = raw.trim();
	if (!trimmed) return values;
	const tokens = trimmed.split(/\s+/).filter(Boolean);
	let index = 0;
	for (const definition of definitions) {
		if (index >= tokens.length) break;
		if (definition.captureRemaining) {
			values[definition.name] = tokens.slice(index).join(" ");
			index = tokens.length;
			break;
		}
		values[definition.name] = tokens[index];
		index += 1;
	}
	return values;
}
function formatPositionalArgs(definitions, values) {
	const parts = [];
	for (const definition of definitions) {
		const value = values[definition.name];
		if (value == null) continue;
		let rendered;
		if (typeof value === "string") rendered = value.trim();
		else rendered = String(value);
		if (!rendered) continue;
		parts.push(rendered);
		if (definition.captureRemaining) break;
	}
	return parts.length > 0 ? parts.join(" ") : void 0;
}
function parseCommandArgs(command, raw) {
	const trimmed = raw?.trim();
	if (!trimmed) return;
	if (!command.args || command.argsParsing === "none") return { raw: trimmed };
	return {
		raw: trimmed,
		values: parsePositionalArgs(command.args, trimmed)
	};
}
function serializeCommandArgs(command, args) {
	if (!args) return;
	const raw = args.raw?.trim();
	if (raw) return raw;
	if (!args.values || !command.args) return;
	if (command.formatArgs) return command.formatArgs(args.values);
	return formatPositionalArgs(command.args, args.values);
}
function buildCommandTextFromArgs(command, args) {
	return buildCommandText(command.nativeName ?? command.key, serializeCommandArgs(command, args));
}
function resolveDefaultCommandContext(cfg) {
	const resolved = resolveConfiguredModelRef({
		cfg: cfg ?? {},
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	});
	return {
		provider: resolved.provider ?? "openai",
		model: resolved.model ?? "gpt-5.4"
	};
}
function resolveCommandArgChoices(params) {
	const { command, arg, cfg } = params;
	if (!arg.choices) return [];
	const provided = arg.choices;
	return (Array.isArray(provided) ? provided : (() => {
		const defaults = resolveDefaultCommandContext(cfg);
		return provided({
			cfg,
			provider: params.provider ?? defaults.provider,
			model: params.model ?? defaults.model,
			command,
			arg
		});
	})()).map((choice) => typeof choice === "string" ? {
		value: choice,
		label: choice
	} : choice);
}
function resolveCommandArgMenu(params) {
	const { command, args, cfg } = params;
	if (!command.args || !command.argsMenu) return null;
	if (command.argsParsing === "none") return null;
	const argSpec = command.argsMenu;
	const argName = argSpec === "auto" ? command.args.find((arg) => resolveCommandArgChoices({
		command,
		arg,
		cfg
	}).length > 0)?.name : argSpec.arg;
	if (!argName) return null;
	if (args?.values && args.values[argName] != null) return null;
	if (args?.raw && !args.values) return null;
	const arg = command.args.find((entry) => entry.name === argName);
	if (!arg) return null;
	const choices = resolveCommandArgChoices({
		command,
		arg,
		cfg
	});
	if (choices.length === 0) return null;
	return {
		arg,
		choices,
		title: argSpec !== "auto" ? argSpec.title : void 0
	};
}
function isCommandMessage(raw) {
	return normalizeCommandBody(raw).startsWith("/");
}
function isNativeCommandSurface(surface) {
	if (!surface) return false;
	return getNativeCommandSurfaces().has(normalizeLowercaseStringOrEmpty(surface));
}
function shouldHandleTextCommands(params) {
	if (params.commandSource === "native") return true;
	if (params.cfg.commands?.text !== false) return true;
	return !isNativeCommandSurface(params.surface);
}
//#endregion
export { isNativeCommandSurface as a, parseCommandArgs as c, serializeCommandArgs as d, shouldHandleTextCommands as f, isCommandMessage as i, resolveCommandArgChoices as l, buildCommandTextFromArgs as n, listNativeCommandSpecs as o, findCommandByNativeName as r, listNativeCommandSpecsForConfig as s, buildCommandText as t, resolveCommandArgMenu as u };
