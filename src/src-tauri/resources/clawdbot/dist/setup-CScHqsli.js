import "./utils-DvkbxKCZ.js";
import "./types.secrets-ClP-vJ-P.js";
import "./setup-helpers-CWjxgWew.js";
import "./setup-wizard-helpers-CCAvauB7.js";
import "./setup-binary-7XRuhb6Z.js";
import "./setup-wizard-proxy-C3zL2Dtj.js";
//#region src/plugin-sdk/resolution-notes.ts
/** Format a short note that separates successfully resolved targets from unresolved passthrough values. */
function formatResolvedUnresolvedNote(params) {
	if (params.resolved.length === 0 && params.unresolved.length === 0) return;
	return [params.resolved.length > 0 ? `Resolved: ${params.resolved.join(", ")}` : void 0, params.unresolved.length > 0 ? `Unresolved (kept as typed): ${params.unresolved.join(", ")}` : void 0].filter(Boolean).join("\n");
}
//#endregion
export { formatResolvedUnresolvedNote as t };
