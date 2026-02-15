import "./paths-BZtyHNCi.js";
import "./workspace-CUznpDHg.js";
import "./exec-DBtWJ4Ld.js";
import "./agent-scope-xZu8sXcF.js";
import "./image-ops-CQkyIkuI.js";
import "./boolean-Bb19hm9Y.js";
import "./model-auth-BffKC6OJ.js";
import "./config-DAGaFnCt.js";
import "./github-copilot-token-BRNzgUa_.js";
import "./tool-images-BVaD9DCP.js";
import { i as jsonResult, l as readStringParam, o as readReactionParams, t as createActionGate } from "./common-fdrT4FYK.js";
import "./ir-XjRYsEjJ.js";
import "./fetch-BUVoWGPC.js";
import "./render-CiikiGbn.js";
import "./tables-BY2rftQn.js";
import { r as sendReactionWhatsApp } from "./outbound-Dw7f6HJ9.js";

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
		await sendReactionWhatsApp(chatJid, messageId, remove ? "" : emoji, {
			verbose: false,
			fromMe: typeof fromMeRaw === "boolean" ? fromMeRaw : void 0,
			participant: participant ?? void 0,
			accountId: accountId ?? void 0
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