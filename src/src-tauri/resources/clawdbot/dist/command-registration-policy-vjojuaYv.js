import { t as resolveCliArgvInvocation } from "./argv-invocation-C0QUafZn.js";
import { t as isTruthyEnvValue } from "./env-BAymvSVL.js";
//#region src/cli/command-registration-policy.ts
function shouldRegisterPrimaryCommandOnly(argv) {
	const invocation = resolveCliArgvInvocation(argv);
	return invocation.primary !== null || !invocation.hasHelpOrVersion;
}
function shouldSkipPluginCommandRegistration(params) {
	if (params.hasBuiltinPrimary) return true;
	const invocation = resolveCliArgvInvocation(params.argv);
	if (params.primary === "help") return invocation.hasHelpOrVersion && invocation.commandPath.length <= 1;
	if (!params.primary) return invocation.hasHelpOrVersion;
	return false;
}
function shouldEagerRegisterSubcommands(env = process.env) {
	return isTruthyEnvValue(env.OPENCLAW_DISABLE_LAZY_SUBCOMMANDS);
}
function shouldRegisterPrimarySubcommandOnly(argv, env = process.env) {
	return !shouldEagerRegisterSubcommands(env) && shouldRegisterPrimaryCommandOnly(argv);
}
//#endregion
export { shouldSkipPluginCommandRegistration as i, shouldRegisterPrimaryCommandOnly as n, shouldRegisterPrimarySubcommandOnly as r, shouldEagerRegisterSubcommands as t };
