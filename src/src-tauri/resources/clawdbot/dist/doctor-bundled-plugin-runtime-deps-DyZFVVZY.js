import { n as resolveOpenClawPackageRootSync } from "./openclaw-root-BNWw3cXT.js";
import { t as formatCliCommand } from "./command-format-BFuugklF.js";
import { c as scanBundledPluginRuntimeDeps, i as repairBundledRuntimeDepsInstallRoot, o as resolveBundledRuntimeDependencyPackageInstallRoot } from "./bundled-runtime-deps-BdEAdjwi.js";
import { t as note } from "./note-D_Kkgdi2.js";
//#region src/commands/doctor-bundled-plugin-runtime-deps.ts
async function maybeRepairBundledPluginRuntimeDeps(params) {
	const packageRoot = params.packageRoot ?? resolveOpenClawPackageRootSync({
		argv1: process.argv[1],
		cwd: process.cwd(),
		moduleUrl: import.meta.url
	});
	if (!packageRoot) return;
	const { deps, missing, conflicts } = scanBundledPluginRuntimeDeps({
		packageRoot,
		config: params.config,
		includeConfiguredChannels: params.includeConfiguredChannels,
		env: params.env ?? process.env
	});
	if (conflicts.length > 0) note([
		"Bundled plugin runtime deps use conflicting versions.",
		...conflicts.flatMap((conflict) => [`- ${conflict.name}: ${conflict.versions.join(", ")}`].concat(conflict.versions.flatMap((version) => {
			const pluginIds = conflict.pluginIdsByVersion.get(version) ?? [];
			return pluginIds.length > 0 ? [`  - ${version}: ${pluginIds.join(", ")}`] : [];
		}))),
		`Update bundled plugins and rerun ${formatCliCommand("openclaw doctor")}.`
	].join("\n"), "Bundled plugins");
	if (missing.length === 0) return;
	const missingSpecs = missing.map((dep) => `${dep.name}@${dep.version}`);
	const installSpecs = deps.map((dep) => `${dep.name}@${dep.version}`);
	note([
		"Bundled plugin runtime deps are missing.",
		...missing.map((dep) => `- ${dep.name}@${dep.version} (used by ${dep.pluginIds.join(", ")})`),
		`Fix: run ${formatCliCommand("openclaw doctor --fix")} to install them.`
	].join("\n"), "Bundled plugins");
	if (!(params.prompter.shouldRepair || params.prompter.repairMode.nonInteractive || await params.prompter.confirmAutoFix({
		message: "Install missing bundled plugin runtime deps now?",
		initialValue: true
	}))) return;
	try {
		note(`Installed bundled plugin deps: ${repairBundledRuntimeDepsInstallRoot({
			installRoot: resolveBundledRuntimeDependencyPackageInstallRoot(packageRoot, { env: params.env ?? process.env }),
			missingSpecs,
			installSpecs,
			env: params.env ?? process.env,
			installDeps: params.installDeps
		}).installSpecs.join(", ")}`, "Bundled plugins");
	} catch (error) {
		params.runtime.error(`Failed to install bundled plugin runtime deps: ${String(error)}`);
	}
}
//#endregion
export { maybeRepairBundledPluginRuntimeDeps };
