import { C as buildParseArgv } from "./logger-BCzP_yik.js";
import { r as resolveActionArgs } from "./helpers-WPE6f1fx.js";
//#region src/cli/program/command-tree.ts
function removeCommand(program, command) {
	const commands = program.commands;
	const index = commands.indexOf(command);
	if (index < 0) return false;
	commands.splice(index, 1);
	return true;
}
function removeCommandByName(program, name) {
	const existing = program.commands.find((command) => command.name() === name);
	if (!existing) return false;
	return removeCommand(program, existing);
}
//#endregion
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
export { removeCommandByName as n, registerLazyCommand as t };
