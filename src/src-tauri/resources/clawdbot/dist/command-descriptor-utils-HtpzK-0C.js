import { t as sanitizeForLog } from "./ansi-BZHMLcUk.js";
//#region src/cli/program/command-descriptor-utils.ts
const SAFE_COMMAND_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;
function normalizeCommandDescriptorName(name) {
	const normalized = name.trim();
	return SAFE_COMMAND_NAME_PATTERN.test(normalized) ? normalized : null;
}
function assertSafeCommandDescriptorName(name) {
	const normalized = normalizeCommandDescriptorName(name);
	if (!normalized) throw new Error(`Invalid CLI command name: ${JSON.stringify(name.trim())}`);
	return normalized;
}
function sanitizeCommandDescriptorDescription(description) {
	return sanitizeForLog(description).trim();
}
function getCommandDescriptorNames(descriptors) {
	return descriptors.map((descriptor) => descriptor.name);
}
function getCommandsWithSubcommands(descriptors) {
	return descriptors.filter((descriptor) => descriptor.hasSubcommands).map((descriptor) => descriptor.name);
}
function collectUniqueCommandDescriptors(descriptorGroups) {
	const seen = /* @__PURE__ */ new Set();
	const descriptors = [];
	for (const group of descriptorGroups) for (const descriptor of group) {
		if (seen.has(descriptor.name)) continue;
		seen.add(descriptor.name);
		descriptors.push(descriptor);
	}
	return descriptors;
}
function defineCommandDescriptorCatalog(descriptors) {
	return {
		descriptors,
		getDescriptors: () => descriptors,
		getNames: () => getCommandDescriptorNames(descriptors),
		getCommandsWithSubcommands: () => getCommandsWithSubcommands(descriptors)
	};
}
function addCommandDescriptorsToProgram(program, descriptors, existingCommands = /* @__PURE__ */ new Set()) {
	for (const descriptor of descriptors) {
		const name = assertSafeCommandDescriptorName(descriptor.name);
		if (existingCommands.has(name)) continue;
		program.command(name).description(sanitizeCommandDescriptorDescription(descriptor.description));
		existingCommands.add(name);
	}
	return existingCommands;
}
//#endregion
export { sanitizeCommandDescriptorDescription as a, normalizeCommandDescriptorName as i, collectUniqueCommandDescriptors as n, defineCommandDescriptorCatalog as r, addCommandDescriptorsToProgram as t };
