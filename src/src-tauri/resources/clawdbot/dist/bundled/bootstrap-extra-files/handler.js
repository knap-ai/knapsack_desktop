import { t as createSubsystemLogger } from "../../subsystem-CWI_MDy_.js";
import { l as normalizeTrimmedStringList } from "../../string-normalization-Bvcn03I9.js";
import { d as filterBootstrapFilesForSession, h as loadExtraBootstrapFilesWithDiagnostics } from "../../workspace-DiB6mKpP.js";
import { a as isAgentBootstrapEvent } from "../../internal-hooks-BxzYnhn4.js";
import { r as resolveHookConfig } from "../../config-DAN30bYQ.js";
//#region src/hooks/bundled/bootstrap-extra-files/handler.ts
const HOOK_KEY = "bootstrap-extra-files";
const log = createSubsystemLogger("bootstrap-extra-files");
function resolveExtraBootstrapPatterns(hookConfig) {
	const fromPaths = normalizeTrimmedStringList(hookConfig.paths);
	if (fromPaths.length > 0) return fromPaths;
	const fromPatterns = normalizeTrimmedStringList(hookConfig.patterns);
	if (fromPatterns.length > 0) return fromPatterns;
	return normalizeTrimmedStringList(hookConfig.files);
}
const bootstrapExtraFilesHook = async (event) => {
	if (!isAgentBootstrapEvent(event)) return;
	const context = event.context;
	const hookConfig = resolveHookConfig(context.cfg, HOOK_KEY);
	if (!hookConfig || hookConfig.enabled === false) return;
	const patterns = resolveExtraBootstrapPatterns(hookConfig);
	if (patterns.length === 0) return;
	try {
		const { files: extras, diagnostics } = await loadExtraBootstrapFilesWithDiagnostics(context.workspaceDir, patterns);
		if (diagnostics.length > 0) log.debug("skipped extra bootstrap candidates", {
			skipped: diagnostics.length,
			reasons: diagnostics.reduce((counts, item) => {
				counts[item.reason] = (counts[item.reason] ?? 0) + 1;
				return counts;
			}, {})
		});
		if (extras.length === 0) return;
		context.bootstrapFiles = filterBootstrapFilesForSession([...context.bootstrapFiles, ...extras], context.sessionKey);
	} catch (err) {
		log.warn(`failed: ${String(err)}`);
	}
};
//#endregion
export { bootstrapExtraFilesHook as default };
