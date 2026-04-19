import { t as formatCliCommand } from "./command-format-Dd3uP9-6.js";
import { r as normalizeProviderId } from "./provider-id-KaStHhRz.js";
import { n as resolvePluginProviders } from "./providers.runtime-Qry7Vql_.js";
import "./model-selection-CTdyYoio.js";
//#region src/commands/provider-auth-guidance.ts
function matchesProviderId(candidate, providerId) {
	const normalized = normalizeProviderId(providerId);
	if (!normalized) return false;
	if (normalizeProviderId(candidate.id) === normalized) return true;
	return (candidate.aliases ?? []).some((alias) => normalizeProviderId(alias) === normalized);
}
function resolveProviderAuthLoginCommand(params) {
	const provider = resolvePluginProviders({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		mode: "setup"
	}).find((candidate) => matchesProviderId(candidate, params.provider));
	if (!provider || provider.auth.length === 0) return;
	return formatCliCommand(`openclaw models auth login --provider ${provider.id}`);
}
function buildProviderAuthRecoveryHint(params) {
	const loginCommand = resolveProviderAuthLoginCommand(params);
	const parts = [];
	if (loginCommand) parts.push(`Run \`${loginCommand}\``);
	if (params.includeConfigure !== false) parts.push(`\`${formatCliCommand("openclaw configure")}\``);
	if (params.includeEnvVar) parts.push("set an API key env var");
	if (parts.length === 0) return `Run \`${formatCliCommand("openclaw configure")}\`.`;
	if (parts.length === 1) return `${parts[0]}.`;
	if (parts.length === 2) return `${parts[0]} or ${parts[1]}.`;
	return `${parts[0]}, ${parts[1]}, or ${parts[2]}.`;
}
//#endregion
export { buildProviderAuthRecoveryHint as t };
