import { N as isRootHelpInvocation, O as getPrimaryCommand, j as hasHelpOrVersion, w as getCommandPathWithRootOptions } from "./logger-D8OnBgBc.js";
//#region src/cli/argv-invocation.ts
function resolveCliArgvInvocation(argv) {
	return {
		argv,
		commandPath: getCommandPathWithRootOptions(argv, 2),
		primary: getPrimaryCommand(argv),
		hasHelpOrVersion: hasHelpOrVersion(argv),
		isRootHelpInvocation: isRootHelpInvocation(argv)
	};
}
//#endregion
export { resolveCliArgvInvocation as t };
