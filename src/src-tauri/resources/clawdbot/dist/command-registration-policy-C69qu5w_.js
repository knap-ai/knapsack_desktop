import { t as resolveCliArgvInvocation } from "./argv-invocation-DloX2c7c.js";
import { t as isTruthyEnvValue } from "./env-BiSxzotM.js";
//#region src/cli/command-registration-policy.ts
function shouldRegisterPrimaryCommandOnly(argv) {
	const invocation = resolveCliArgvInvocation(argv);
	return invocation.primary !== null || !invocation.hasHelpOrVersion;
}
function shouldSkipPluginCommandRegistration(params) {
	if (params.hasBuiltinPrimary) return true;
	if (!params.primary) return resolveCliArgvInvocation(params.argv).hasHelpOrVersion;
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
