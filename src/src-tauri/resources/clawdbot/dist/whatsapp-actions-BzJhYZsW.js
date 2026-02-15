import "./paths-rb94mUrR.js";
import "./agent-scope-CCxRobXB.js";
import "./exec-DYHF__-L.js";
import "./model-selection-Ch-ZMovh.js";
import "./github-copilot-token-Cr_SiZeh.js";
import "./image-ops-DF9AQADy.js";
import "./config-C94oBlHq.js";
import "./tool-images-B9awJkZZ.js";
import { i as jsonResult, l as readStringParam, o as readReactionParams, t as createActionGate } from "./common-BEfPwaXB.js";
import "./ir-CA_q26JN.js";
import "./fetch-Qc6XQcFW.js";
import "./active-listener-C1ZpxW_K.js";
import { r as sendReactionWhatsApp } from "./outbound-DWShCHxH.js";

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