import { n as VERSION } from "./version-Bk5OW-rN.js";
import { c as collectUniqueCommandDescriptors, s as addCommandDescriptorsToProgram } from "./register-command-groups-CYJh89EB.js";
import { t as getCoreCliCommandDescriptors } from "./core-command-descriptors-CpUuaIlu.js";
import { n as getSubCliEntries } from "./subcli-descriptors-WsFGYT6i.js";
import { t as configureProgramHelp } from "./help-DO0F0A21.js";
import { t as getPluginCliCommandDescriptors } from "./cli-zoji3r3V.js";
import { Command } from "commander";
//#region src/cli/program/root-help.ts
async function buildRootHelpProgram(renderOptions) {
	const program = new Command();
	configureProgramHelp(program, {
		programVersion: VERSION,
		channelOptions: [],
		messageChannelOptions: "",
		agentChannelOptions: ""
	});
	addCommandDescriptorsToProgram(program, collectUniqueCommandDescriptors([
		getCoreCliCommandDescriptors(),
		getSubCliEntries(),
		await getPluginCliCommandDescriptors(renderOptions?.config, renderOptions?.env, { pluginSdkResolution: renderOptions?.pluginSdkResolution })
	]));
	return program;
}
async function renderRootHelpText(renderOptions) {
	const program = await buildRootHelpProgram(renderOptions);
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
async function outputRootHelp(renderOptions) {
	process.stdout.write(await renderRootHelpText(renderOptions));
}
//#endregion
export { outputRootHelp };
