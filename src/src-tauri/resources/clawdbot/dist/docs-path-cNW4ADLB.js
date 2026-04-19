import { t as resolveOpenClawPackageRoot } from "./openclaw-root-BNWw3cXT.js";
import fs from "node:fs";
import path from "node:path";
//#region src/agents/docs-path.ts
async function resolveOpenClawDocsPath(params) {
	const workspaceDir = params.workspaceDir?.trim();
	if (workspaceDir) {
		const workspaceDocs = path.join(workspaceDir, "docs");
		if (fs.existsSync(workspaceDocs)) return workspaceDocs;
	}
	const packageRoot = await resolveOpenClawPackageRoot({
		cwd: params.cwd,
		argv1: params.argv1,
		moduleUrl: params.moduleUrl
	});
	if (!packageRoot) return null;
	const packageDocs = path.join(packageRoot, "docs");
	return fs.existsSync(packageDocs) ? packageDocs : null;
}
//#endregion
export { resolveOpenClawDocsPath as t };
