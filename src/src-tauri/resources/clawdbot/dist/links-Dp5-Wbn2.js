import { t as formatTerminalLink } from "./terminal-link-DyR9auMT.js";
//#region src/terminal/links.ts
function resolveDocsRoot() {
	return "https://docs.openclaw.ai";
}
function formatDocsLink(path, label, opts) {
	const docsRoot = resolveDocsRoot();
	const trimmed = typeof path === "string" ? path.trim() : "";
	const url = trimmed ? trimmed.startsWith("http") ? trimmed : `${docsRoot}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}` : docsRoot;
	return formatTerminalLink(label ?? url, url, {
		fallback: opts?.fallback ?? url,
		force: opts?.force
	});
}
//#endregion
export { formatDocsLink as t };
