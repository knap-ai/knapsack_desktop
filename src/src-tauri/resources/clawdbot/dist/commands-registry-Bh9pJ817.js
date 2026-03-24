import { l as escapeRegExp } from "./utils-CS0Ikux6.js";
import { n as DEFAULT_MODEL, r as DEFAULT_PROVIDER } from "./defaults-eEZJg44K.js";
import { h as resolveConfiguredModelRef } from "./model-selection-BnFtDmP7.js";
import { t as isCommandFlagEnabled } from "./commands-C6oAw_H-.js";
import { n as getNativeCommandSurfaces, t as getChatCommands } from "./commands-registry.data-BFXJWoqi.js";
//#region src/auto-reply/commands-registry.ts
let cachedTextAliasMap = null;
let cachedTextAliasCommands = null;
let cachedDetection;
let cachedDetectionCommands = null;
function getTextAliasMap() {
	const commands = getChatCommands();
	if (cachedTextAliasMap && cachedTextAliasCommands === commands) return cachedTextAliasMap;
	const map = /* @__PURE__ */ new Map();
	for (const command of commands) {
		const canonical = command.textAliases[0]?.trim() || `/${command.key}`;
		const acceptsArgs = Boolean(command.acceptsArgs);
		for (const alias of command.textAliases) {
			const normalized = alias.trim().toLowerCase();
			if (!normalized) continue;
			if (!map.has(normalized)) map.set(normalized, {
				key: command.key,
				canonical,
				acceptsArgs
			});
		}
	}
	cachedTextAliasMap = map;
	cachedTextAliasCommands = commands;
	return map;
}
function buildSkillCommandDefinitions(skillCommands) {
	if (!skillCommands || skillCommands.length === 0) return [];
	return skillCommands.map((spec) => ({
		key: `skill:${spec.skillName}`,
		nativeName: spec.name,
		description: spec.description,
		textAliases: [`/${spec.name}`],
		acceptsArgs: true,
		argsParsing: "none",
		scope: "both"
	}));
}
function listChatCommands(params) {
	const commands = getChatCommands();
	if (!params?.skillCommands?.length) return [...commands];
	return [...commands, ...buildSkillCommandDefinitions(params.skillCommands)];
}
function isCommandEnabled(cfg, commandKey) {
	if (commandKey === "config") return isCommandFlagEnabled(cfg, "config");
	if (commandKey === "mcp") return isCommandFlagEnabled(cfg, "mcp");
	if (commandKey === "plugins") return isCommandFlagEnabled(cfg, "plugins");
	if (commandKey === "debug") return isCommandFlagEnabled(cfg, "debug");
	if (commandKey === "bash") return isCommandFlagEnabled(cfg, "bash");
	return true;
}
function listChatCommandsForConfig(cfg, params) {
	const base = getChatCommands().filter((command) => isCommandEnabled(cfg, command.key));
	if (!params?.skillCommands?.length) return base;
	return [...base, ...buildSkillCommandDefinitions(params.skillCommands)];
}
const NATIVE_NAME_OVERRIDES = {
	discord: { tts: "voice" },
	slack: { status: "agentstatus" }
};
function resolveNativeName(command, provider) {
	if (!command.nativeName) return;
	if (provider) {
		const override = NATIVE_NAME_OVERRIDES[provider]?.[command.key];
		if (override) return override;
	}
	return command.nativeName;
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
	const normalized = name.trim().toLowerCase();
	return getChatCommands().find((command) => command.scope !== "text" && resolveNativeName(command, provider)?.toLowerCase() === normalized);
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
		provider: resolved.provider ?? "anthropic",
		model: resolved.model ?? "claude-opus-4-6"
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
function normalizeCommandBody(raw, options) {
	const trimmed = raw.trim();
	if (!trimmed.startsWith("/")) return trimmed;
	const newline = trimmed.indexOf("\n");
	const singleLine = newline === -1 ? trimmed : trimmed.slice(0, newline).trim();
	const colonMatch = singleLine.match(/^\/([^\s:]+)\s*:(.*)$/);
	const normalized = colonMatch ? (() => {
		const [, command, rest] = colonMatch;
		const normalizedRest = rest.trimStart();
		return normalizedRest ? `/${command} ${normalizedRest}` : `/${command}`;
	})() : singleLine;
	const normalizedBotUsername = options?.botUsername?.trim().toLowerCase();
	const mentionMatch = normalizedBotUsername ? normalized.match(/^\/([^\s@]+)@([^\s]+)(.*)$/) : null;
	const commandBody = mentionMatch && mentionMatch[2].toLowerCase() === normalizedBotUsername ? `/${mentionMatch[1]}${mentionMatch[3] ?? ""}` : normalized;
	const lowered = commandBody.toLowerCase();
	const textAliasMap = getTextAliasMap();
	const exact = textAliasMap.get(lowered);
	if (exact) return exact.canonical;
	const tokenMatch = commandBody.match(/^\/([^\s]+)(?:\s+([\s\S]+))?$/);
	if (!tokenMatch) return commandBody;
	const [, token, rest] = tokenMatch;
	const tokenKey = `/${token.toLowerCase()}`;
	const tokenSpec = textAliasMap.get(tokenKey);
	if (!tokenSpec) return commandBody;
	if (rest && !tokenSpec.acceptsArgs) return commandBody;
	const normalizedRest = rest?.trimStart();
	return normalizedRest ? `${tokenSpec.canonical} ${normalizedRest}` : tokenSpec.canonical;
}
function isCommandMessage(raw) {
	return normalizeCommandBody(raw).startsWith("/");
}
function getCommandDetection(_cfg) {
	const commands = getChatCommands();
	if (cachedDetection && cachedDetectionCommands === commands) return cachedDetection;
	const exact = /* @__PURE__ */ new Set();
	const patterns = [];
	for (const cmd of commands) for (const alias of cmd.textAliases) {
		const normalized = alias.trim().toLowerCase();
		if (!normalized) continue;
		exact.add(normalized);
		const escaped = escapeRegExp(normalized);
		if (!escaped) continue;
		if (cmd.acceptsArgs) patterns.push(`${escaped}(?:\\s+.+|\\s*:\\s*.*)?`);
		else patterns.push(`${escaped}(?:\\s*:\\s*)?`);
	}
	cachedDetection = {
		exact,
		regex: patterns.length ? new RegExp(`^(?:${patterns.join("|")})$`, "i") : /$^/
	};
	cachedDetectionCommands = commands;
	return cachedDetection;
}
function maybeResolveTextAlias(raw, cfg) {
	const trimmed = normalizeCommandBody(raw).trim();
	if (!trimmed.startsWith("/")) return null;
	const detection = getCommandDetection(cfg);
	const normalized = trimmed.toLowerCase();
	if (detection.exact.has(normalized)) return normalized;
	if (!detection.regex.test(normalized)) return null;
	const tokenMatch = normalized.match(/^\/([^\s:]+)(?:\s|$)/);
	if (!tokenMatch) return null;
	const tokenKey = `/${tokenMatch[1]}`;
	return getTextAliasMap().has(tokenKey) ? tokenKey : null;
}
function resolveTextCommand(raw, cfg) {
	const trimmed = normalizeCommandBody(raw).trim();
	const alias = maybeResolveTextAlias(trimmed, cfg);
	if (!alias) return null;
	const spec = getTextAliasMap().get(alias);
	if (!spec) return null;
	const command = getChatCommands().find((entry) => entry.key === spec.key);
	if (!command) return null;
	if (!spec.acceptsArgs) return { command };
	return {
		command,
		args: trimmed.slice(alias.length).trim() || void 0
	};
}
function isNativeCommandSurface(surface) {
	if (!surface) return false;
	return getNativeCommandSurfaces().has(surface.toLowerCase());
}
function shouldHandleTextCommands(params) {
	if (params.commandSource === "native") return true;
	if (params.cfg.commands?.text !== false) return true;
	return !isNativeCommandSurface(params.surface);
}
//#endregion
export { resolveTextCommand as _, isCommandEnabled as a, listChatCommands as c, listNativeCommandSpecsForConfig as d, maybeResolveTextAlias as f, resolveCommandArgMenu as g, resolveCommandArgChoices as h, getCommandDetection as i, listChatCommandsForConfig as l, parseCommandArgs as m, buildCommandTextFromArgs as n, isCommandMessage as o, normalizeCommandBody as p, findCommandByNativeName as r, isNativeCommandSurface as s, buildCommandText as t, listNativeCommandSpecs as u, serializeCommandArgs as v, shouldHandleTextCommands as y };
