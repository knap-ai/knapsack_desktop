import { n as VERSION } from "./version-TiEvEN12.js";
import { t as getCoreCliCommandDescriptors } from "./core-command-descriptors-D1ECm73y.js";
import { n as getSubCliEntries } from "./subcli-descriptors--C6eeWFA.js";
import { t as configureProgramHelp } from "./help-Oj573Z5c.js";
import { t as getPluginCliCommandDescriptors } from "./cli-C7KLq2R6.js";
import { Command } from "commander";
//#region src/cli/program/root-help.ts
async function buildRootHelpProgram() {
	const program = new Command();
	configureProgramHelp(program, {
		programVersion: VERSION,
		channelOptions: [],
		messageChannelOptions: "",
		agentChannelOptions: ""
	});
	const existingCommands = /* @__PURE__ */ new Set();
	for (const command of getCoreCliCommandDescriptors()) {
		program.command(command.name).description(command.description);
		existingCommands.add(command.name);
	}
	for (const command of getSubCliEntries()) {
		if (existingCommands.has(command.name)) continue;
		program.command(command.name).description(command.description);
		existingCommands.add(command.name);
	}
	for (const command of await getPluginCliCommandDescriptors()) {
		if (existingCommands.has(command.name)) continue;
		program.command(command.name).description(command.description);
		existingCommands.add(command.name);
	}
	return program;
}
async function renderRootHelpText() {
	const program = await buildRootHelpProgram();
	let output = "";
	const originalWrite = process.stdout.write.bind(process.stdout);
	const captureWrite = ((chunk) => {
		output += String(chunk);
		return true;
	});
	process.stdout.write = captureWrite;
	try {
		program.outputHelp();
	} finally {
		process.stdout.write = originalWrite;
	}
	return output;
}
async function outputRootHelp() {
	process.stdout.write(await renderRootHelpText());
}
//#endregion
export { outputRootHelp };
