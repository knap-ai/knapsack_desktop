import { r as logVerbose } from "./globals-De6QTwLG.js";
import { _ as isAcpSessionKey } from "./session-key-Bh1lMwK5.js";
import { f as shouldHandleTextCommands } from "./commands-registry-CxFYC-Xg.js";
import "./commands-context-v7HiTv6d.js";
import { r as resetConfiguredBindingTargetInPlace } from "./binding-targets-xmalh8ui.js";
import { n as resolveBoundAcpThreadSessionKey } from "./targets-B5HUd0VX.js";
import { t as emitResetCommandHooks } from "./commands-reset-hooks-6u0bgkV_.js";
import { t as buildStatusReply } from "./commands-status-BQALf0Ao.js";
//#region src/auto-reply/reply/commands-reset.ts
function applyAcpResetTailContext(ctx, resetTail) {
	const mutableCtx = ctx;
	mutableCtx.Body = resetTail;
	mutableCtx.RawBody = resetTail;
	mutableCtx.CommandBody = resetTail;
	mutableCtx.BodyForCommands = resetTail;
	mutableCtx.BodyForAgent = resetTail;
	mutableCtx.BodyStripped = resetTail;
	mutableCtx.AcpDispatchTailAfterReset = true;
}
async function maybeHandleResetCommand(params) {
	const resetMatch = params.command.commandBodyNormalized.match(/^\/(new|reset)(?:\s|$)/);
	if (!resetMatch) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /reset from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	const commandAction = resetMatch[1] === "reset" ? "reset" : "new";
	const resetTail = params.command.commandBodyNormalized.slice(resetMatch[0].length).trimStart();
	const boundAcpSessionKey = resolveBoundAcpThreadSessionKey(params);
	const boundAcpKey = boundAcpSessionKey && isAcpSessionKey(boundAcpSessionKey) ? boundAcpSessionKey.trim() : void 0;
	if (boundAcpKey) {
		const resetResult = await resetConfiguredBindingTargetInPlace({
			cfg: params.cfg,
			sessionKey: boundAcpKey,
			reason: commandAction,
			commandSource: `${params.command.surface}:${params.ctx.CommandSource ?? "text"}`
		});
		if (!resetResult.ok) logVerbose(`acp reset failed for ${boundAcpKey}: ${resetResult.error ?? "unknown error"}`);
		if (resetResult.ok) {
			params.command.resetHookTriggered = true;
			if (resetTail) {
				applyAcpResetTailContext(params.ctx, resetTail);
				if (params.rootCtx && params.rootCtx !== params.ctx) applyAcpResetTailContext(params.rootCtx, resetTail);
				return { shouldContinue: false };
			}
			return {
				shouldContinue: false,
				reply: { text: "✅ ACP session reset in place." }
			};
		}
		return {
			shouldContinue: false,
			reply: { text: "⚠️ ACP session reset failed. Check /acp status and try again." }
		};
	}
	const targetSessionEntry = params.sessionStore?.[params.sessionKey] ?? params.sessionEntry;
	await emitResetCommandHooks({
		action: commandAction,
		ctx: params.ctx,
		cfg: params.cfg,
		command: params.command,
		sessionKey: params.sessionKey,
		sessionEntry: targetSessionEntry,
		previousSessionEntry: params.previousSessionEntry,
		workspaceDir: params.workspaceDir
	});
	return null;
}
//#endregion
//#region src/auto-reply/reply/commands-core.ts
let commandHandlersRuntimePromise = null;
function loadCommandHandlersRuntime() {
	commandHandlersRuntimePromise ??= import("./commands-handlers.runtime-DLzrVQ1j.js");
	return commandHandlersRuntimePromise;
}
let HANDLERS = null;
async function handleCommands(params) {
	if (HANDLERS === null) HANDLERS = (await loadCommandHandlersRuntime()).loadCommandHandlers();
	const resetResult = await maybeHandleResetCommand(params);
	if (resetResult) return resetResult;
	const allowTextCommands = shouldHandleTextCommands({
		cfg: params.cfg,
		surface: params.command.surface,
		commandSource: params.ctx.CommandSource
	});
	for (const handler of HANDLERS) {
		const result = await handler(params, allowTextCommands);
		if (result) return result;
	}
	return { shouldContinue: true };
}
//#endregion
export { buildStatusReply, handleCommands };
