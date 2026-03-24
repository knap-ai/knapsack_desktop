import "../../logger-kwZIqwuw.js";
import "../../paths-ViKUYWUK.js";
import "../../tmp-openclaw-dir-idKIOMmb.js";
import "../../theme-CdOoMzRk.js";
import "../../globals-DBUMOBZ8.js";
import { t as createSubsystemLogger } from "../../subsystem-DISldKSB.js";
import "../../ansi-BEJF8NKS.js";
import "../../boolean-C3GkJetE.js";
import "../../utils-CS0Ikux6.js";
import "../../boundary-path-Dm0QJ7-y.js";
import "../../boundary-file-read-DcZxlWD8.js";
import "../../logger-BmpSCz93.js";
import "../../exec-B5_AYfQG.js";
import { f as filterBootstrapFilesForSession, m as loadExtraBootstrapFilesWithDiagnostics } from "../../workspace-D4K6QX9X.js";
import { i as isAgentBootstrapEvent } from "../../internal-hooks-CIUghoK4.js";
import "../../frontmatter-CP5371Rm.js";
import "../../frontmatter-AzDGezO7.js";
import { r as resolveHookConfig } from "../../config-Bnl_ZCTo.js";
//#region src/hooks/bundled/bootstrap-extra-files/handler.ts
const HOOK_KEY = "bootstrap-extra-files";
const log = createSubsystemLogger("bootstrap-extra-files");
function normalizeStringArray(value) {
	if (!Array.isArray(value)) return [];
	return value.map((v) => typeof v === "string" ? v.trim() : "").filter(Boolean);
}
function resolveExtraBootstrapPatterns(hookConfig) {
	const fromPaths = normalizeStringArray(hookConfig.paths);
	if (fromPaths.length > 0) return fromPaths;
	const fromPatterns = normalizeStringArray(hookConfig.patterns);
	if (fromPatterns.length > 0) return fromPatterns;
	return normalizeStringArray(hookConfig.files);
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
