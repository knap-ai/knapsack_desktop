import { E as buildParseArgv } from "./logger-x0IvPL2B.js";
import { t as removeCommandByName } from "./command-tree-BbzgXx1M.js";
import { r as resolveActionArgs } from "./helpers-D9vam6Kx.js";
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
function registerLazyCommand({ program, name, description, removeNames, register }) {
	const placeholder = program.command(name).description(description);
	placeholder.allowUnknownOption(true);
	placeholder.allowExcessArguments(true);
	placeholder.action(async (...actionArgs) => {
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
