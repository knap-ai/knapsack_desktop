import { r as logVerbose } from "./globals-De6QTwLG.js";
import { a as requireGatewayClientScopeForInternalChannel } from "./command-gates-CM511X5Y.js";
import { C as stopWithText, b as resolveAcpAction, d as COMMAND, x as resolveAcpHelpText } from "./shared-BnfTOmGC.js";
//#region src/auto-reply/reply/commands-acp.ts
let lifecycleHandlersPromise;
let runtimeOptionHandlersPromise;
let diagnosticHandlersPromise;
async function loadAcpActionHandler(action) {
	if (action === "spawn" || action === "cancel" || action === "steer" || action === "close") {
		lifecycleHandlersPromise ??= import("./lifecycle-CORyf-n0.js");
		const handlers = await lifecycleHandlersPromise;
		return {
			spawn: handlers.handleAcpSpawnAction,
			cancel: handlers.handleAcpCancelAction,
			steer: handlers.handleAcpSteerAction,
			close: handlers.handleAcpCloseAction
		}[action];
	}
	if (action === "status" || action === "set-mode" || action === "set" || action === "cwd" || action === "permissions" || action === "timeout" || action === "model" || action === "reset-options") {
		runtimeOptionHandlersPromise ??= import("./runtime-options-C5l-BkYE.js");
		const handlers = await runtimeOptionHandlersPromise;
		return {
			status: handlers.handleAcpStatusAction,
			"set-mode": handlers.handleAcpSetModeAction,
			set: handlers.handleAcpSetAction,
			cwd: handlers.handleAcpCwdAction,
			permissions: handlers.handleAcpPermissionsAction,
			timeout: handlers.handleAcpTimeoutAction,
			model: handlers.handleAcpModelAction,
			"reset-options": handlers.handleAcpResetOptionsAction
		}[action];
	}
	diagnosticHandlersPromise ??= import("./diagnostics-C-MZsZfY.js");
	const handlers = await diagnosticHandlersPromise;
	return {
		doctor: handlers.handleAcpDoctorAction,
		install: async (params, tokens) => handlers.handleAcpInstallAction(params, tokens),
		sessions: async (params, tokens) => handlers.handleAcpSessionsAction(params, tokens)
	}[action];
}
const ACP_MUTATING_ACTIONS = new Set([
	"spawn",
	"cancel",
	"steer",
	"close",
	"status",
	"set-mode",
	"set",
	"cwd",
	"permissions",
	"timeout",
	"model",
	"reset-options"
]);
const handleAcpCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const normalized = params.command.commandBodyNormalized;
	if (!normalized.startsWith("/acp")) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /acp from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	const tokens = normalized.slice(COMMAND.length).trim().split(/\s+/).filter(Boolean);
	const action = resolveAcpAction(tokens);
	if (action === "help") return stopWithText(resolveAcpHelpText());
	if (ACP_MUTATING_ACTIONS.has(action)) {
		const scopeBlock = requireGatewayClientScopeForInternalChannel(params, {
			label: "/acp",
			allowedScopes: ["operator.admin"],
			missingText: "This /acp action requires operator.admin on the internal channel."
		});
		if (scopeBlock) return scopeBlock;
	}
	return await (await loadAcpActionHandler(action))(params, tokens);
};
//#endregion
export { handleAcpCommand as t };
