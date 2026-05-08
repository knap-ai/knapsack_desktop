import { t as buildParseArgv } from "./argv-Bh2LLxMT.js";
import { t as removeCommandByName } from "./command-tree-CjLL1vPq.js";
import { r as resolveActionArgs } from "./helpers-DOs6tuvR.js";
//#region src/cli/program/action-reparse.ts
async function reparseProgramFromActionArgs(program, actionArgs) {
	const actionCommand = actionArgs.at(-1);
	const rawArgs = (actionCommand?.parent ?? program).rawArgs;
	const actionArgsList = resolveActionArgs(actionCommand);
	const fallbackArgv = actionCommand?.name() ? [actionCommand.name(), ...actionArgsList] : actionArgsList;
	const parseArgv = buildParseArgv({
		programName: program.name(),
		rawArgs,
		fallbackArgv
	});
	await program.parseAsync(parseArgv);
}
//#endregion
//#region src/cli/program/register-lazy-command.ts
function resolvePlaceholderOptionArgs(command) {
	const out = [];
	for (const option of command.options) {
		const value = command.getOptionValue(option.attributeName());
		if (value === void 0 || value === false) continue;
		const flag = option.long ?? option.short;
		if (!flag) continue;
		out.push(flag);
		if (value !== true) out.push(String(value));
	}
	return out;
}
function registerLazyCommand({ program, name, description, options, removeNames, register }) {
	const placeholder = program.command(name).description(description);
	for (const option of options ?? []) placeholder.option(option.flags, option.description);
	placeholder.allowUnknownOption(true);
	placeholder.allowExcessArguments(true);
	placeholder.action(async (...actionArgs) => {
		const actionCommand = actionArgs.at(-1);
		if (actionCommand) actionCommand.args = [...resolvePlaceholderOptionArgs(actionCommand), ...actionCommand.args ?? []];
		for (const commandName of new Set(removeNames ?? [name])) removeCommandByName(program, commandName);
		await register();
		await reparseProgramFromActionArgs(program, actionArgs);
	});
}
//#endregion
//#region src/cli/program/register-command-groups.ts
function getCommandGroupNames(entry) {
	return entry.names ?? entry.placeholders.map((placeholder) => placeholder.name);
}
function findCommandGroupEntry(entries, name) {
	return entries.find((entry) => getCommandGroupNames(entry).includes(name));
}
function removeCommandGroupNames(program, entry) {
	for (const name of new Set(getCommandGroupNames(entry))) removeCommandByName(program, name);
}
async function registerCommandGroupByName(program, entries, name) {
	const entry = findCommandGroupEntry(entries, name);
	if (!entry) return false;
	removeCommandGroupNames(program, entry);
	await entry.register(program);
	return true;
}
function registerLazyCommandGroup(program, entry, placeholder) {
	registerLazyCommand({
		program,
		name: placeholder.name,
		description: placeholder.description,
		options: placeholder.options,
		removeNames: [...new Set(getCommandGroupNames(entry))],
		register: async () => {
			await entry.register(program);
		}
	});
}
function registerCommandGroups(program, entries, params) {
	if (params.eager) {
		for (const entry of entries) entry.register(program);
		return;
	}
	if (params.primary && params.registerPrimaryOnly) {
		const entry = findCommandGroupEntry(entries, params.primary);
		if (entry) {
			const placeholder = entry.placeholders.find((candidate) => candidate.name === params.primary);
			if (placeholder) registerLazyCommandGroup(program, entry, placeholder);
			return;
		}
	}
	for (const entry of entries) for (const placeholder of entry.placeholders) registerLazyCommandGroup(program, entry, placeholder);
}
//#endregion
export { registerLazyCommandGroup as a, registerCommandGroups as i, getCommandGroupNames as n, removeCommandGroupNames as o, registerCommandGroupByName as r, findCommandGroupEntry as t };
