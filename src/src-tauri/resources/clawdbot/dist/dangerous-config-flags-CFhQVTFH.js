//#region src/security/dangerous-tools.ts
/**
* Tools denied via Gateway HTTP `POST /tools/invoke` by default.
* These are high-risk because they enable session orchestration, control-plane actions,
* or interactive flows that don't make sense over a non-interactive HTTP surface.
*/
const DEFAULT_GATEWAY_HTTP_TOOL_DENY = [
	"exec",
	"spawn",
	"shell",
	"fs_write",
	"fs_delete",
	"fs_move",
	"apply_patch",
	"sessions_spawn",
	"sessions_send",
	"cron",
	"gateway",
	"nodes",
	"whatsapp_login"
];
//#endregion
//#region src/security/dangerous-config-flags.ts
function collectEnabledInsecureOrDangerousFlags(cfg) {
	const enabledFlags = [];
	if (cfg.gateway?.controlUi?.allowInsecureAuth === true) enabledFlags.push("gateway.controlUi.allowInsecureAuth=true");
	if (cfg.gateway?.controlUi?.dangerouslyAllowHostHeaderOriginFallback === true) enabledFlags.push("gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback=true");
	if (cfg.gateway?.controlUi?.dangerouslyDisableDeviceAuth === true) enabledFlags.push("gateway.controlUi.dangerouslyDisableDeviceAuth=true");
	if (cfg.hooks?.gmail?.allowUnsafeExternalContent === true) enabledFlags.push("hooks.gmail.allowUnsafeExternalContent=true");
	if (Array.isArray(cfg.hooks?.mappings)) {
		for (const [index, mapping] of cfg.hooks.mappings.entries()) if (mapping?.allowUnsafeExternalContent === true) enabledFlags.push(`hooks.mappings[${index}].allowUnsafeExternalContent=true`);
	}
	if (cfg.tools?.exec?.applyPatch?.workspaceOnly === false) enabledFlags.push("tools.exec.applyPatch.workspaceOnly=false");
	if (cfg.plugins?.entries?.acpx?.config?.permissionMode === "approve-all") enabledFlags.push("plugins.entries.acpx.config.permissionMode=approve-all");
	return enabledFlags;
}
//#endregion
export { DEFAULT_GATEWAY_HTTP_TOOL_DENY as n, collectEnabledInsecureOrDangerousFlags as t };
