import "./github-copilot-token-C4Aasre6.js";
import { h as resolveWhatsAppAccount } from "./channel-config-helpers-BAi2qlAE.js";
import { Jr as createActionGate, Qr as readStringParam, Ra as resolveWhatsAppOutboundTarget, Yr as jsonResult, Zr as readReactionParams, qr as ToolAuthorizationError } from "./thread-bindings-SYAnWHuW.js";
import "./paths-WR8OhEmw.js";
import "./logger-s5D1BfzX.js";
import "./tmp-openclaw-dir-DEAexD45.js";
import "./subsystem-7GlwMGJM.js";
import "./utils-B2utBG_m.js";
import "./fetch-CtE9nADJ.js";
import "./exec-CbLkwGIT.js";
import "./thinking-D7ZEZ42s.js";
import "./query-expansion-DrxgDYz1.js";
import "./logger-DD_BJ94Q.js";
import "./zod-schema.core-CtLVNGPW.js";
import "./redact-HAC0uPMW.js";
import "./http-registry-7Lsnrxx9.js";
import "./pairing-token-DNSESXf3.js";
import "./ssrf-BC5-OCfy.js";
import "./fetch-guard-RV5sCukz.js";
import "./registry-B_tf98QY.js";
import "./http-body-CdacFz6y.js";
import { r as sendReactionWhatsApp } from "./outbound-h4APtBc_.js";
//#region src/agents/tools/whatsapp-target-auth.ts
function resolveAuthorizedWhatsAppOutboundTarget(params) {
	const account = resolveWhatsAppAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	const resolution = resolveWhatsAppOutboundTarget({
		to: params.chatJid,
		allowFrom: account.allowFrom ?? [],
		mode: "implicit"
	});
	if (!resolution.ok) throw new ToolAuthorizationError(`WhatsApp ${params.actionLabel} blocked: chatJid "${params.chatJid}" is not in the configured allowFrom list for account "${account.accountId}".`);
	return {
		to: resolution.to,
		accountId: account.accountId
	};
}
//#endregion
//#region src/agents/tools/whatsapp-actions.ts
async function handleWhatsAppAction(params, cfg) {
	const action = readStringParam(params, "action", { required: true });
	const isActionEnabled = createActionGate(cfg.channels?.whatsapp?.actions);
	if (action === "react") {
		if (!isActionEnabled("reactions")) throw new Error("WhatsApp reactions are disabled.");
		const chatJid = readStringParam(params, "chatJid", { required: true });
		const messageId = readStringParam(params, "messageId", { required: true });
		const { emoji, remove, isEmpty } = readReactionParams(params, { removeErrorMessage: "Emoji is required to remove a WhatsApp reaction." });
		const participant = readStringParam(params, "participant");
		const accountId = readStringParam(params, "accountId");
		const fromMeRaw = params.fromMe;
		const fromMe = typeof fromMeRaw === "boolean" ? fromMeRaw : void 0;
		const resolved = resolveAuthorizedWhatsAppOutboundTarget({
			cfg,
			chatJid,
			accountId,
			actionLabel: "reaction"
		});
		const resolvedEmoji = remove ? "" : emoji;
		await sendReactionWhatsApp(resolved.to, messageId, resolvedEmoji, {
			verbose: false,
			fromMe,
			participant: participant ?? void 0,
			accountId: resolved.accountId
		});
		if (!remove && !isEmpty) return jsonResult({
			ok: true,
			added: emoji
		});
		return jsonResult({
			ok: true,
			removed: true
		});
	}
	throw new Error(`Unsupported WhatsApp action: ${action}`);
}
//#endregion
export { handleWhatsAppAction };
