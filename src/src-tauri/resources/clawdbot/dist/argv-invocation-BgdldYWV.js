import { D as getCommandPathWithRootOptions, I as isRootHelpInvocation, P as hasHelpOrVersion, j as getPrimaryCommand } from "./logger-x0IvPL2B.js";
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
