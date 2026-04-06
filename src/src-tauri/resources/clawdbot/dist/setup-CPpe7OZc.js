import "./utils-CE3P21nG.js";
import "./links-Ce33eXq9.js";
import "./setup-helpers-CjYO5YkF.js";
import "./setup-binary-D465X4Qa.js";
import "./signal-cli-install-DXYl97Y-.js";
import "./setup-wizard-proxy-CAoI5CTi.js";
import "./setup-wizard-helpers-BfrhuTOh.js";
//#region src/plugin-sdk/resolution-notes.ts
/** Format a short note that separates successfully resolved targets from unresolved passthrough values. */
function formatResolvedUnresolvedNote(params) {
	if (params.resolved.length === 0 && params.unresolved.length === 0) return;
	return [params.resolved.length > 0 ? `Resolved: ${params.resolved.join(", ")}` : void 0, params.unresolved.length > 0 ? `Unresolved (kept as typed): ${params.unresolved.join(", ")}` : void 0].filter(Boolean).join("\n");
}
//#endregion
export { formatResolvedUnresolvedNote as t };
