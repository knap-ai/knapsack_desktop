import { i as hasNonEmptyString, t as asRecord } from "./comment-shared-BhUvGfra.js";
import { hasConfiguredSecretInput } from "openclaw/plugin-sdk/secret-input";
//#region extensions/feishu/src/message-action-contract.ts
const messageActionTargetAliases = {
	read: { aliases: ["messageId"] },
	pin: { aliases: ["messageId"] },
	unpin: { aliases: ["messageId"] },
	"list-pins": { aliases: ["chatId"] },
	"channel-info": { aliases: ["chatId"] }
};
//#endregion
//#region extensions/feishu/src/security-audit.ts
function isFeishuDocToolEnabled(cfg) {
	const feishu = asRecord(asRecord(cfg.channels)?.feishu);
	if (!feishu || feishu.enabled === false) return false;
	const baseTools = asRecord(feishu.tools);
	const baseDocEnabled = baseTools?.doc !== false;
	const baseAppId = hasNonEmptyString(feishu.appId);
	const baseAppSecret = hasConfiguredSecretInput(feishu.appSecret, cfg.secrets?.defaults);
	const baseConfigured = baseAppId && baseAppSecret;
	const accounts = asRecord(feishu.accounts);
	if (!accounts || Object.keys(accounts).length === 0) return baseDocEnabled && baseConfigured;
	for (const accountValue of Object.values(accounts)) {
		const account = asRecord(accountValue) ?? {};
		if (account.enabled === false) continue;
		if (!((asRecord(account.tools) ?? baseTools)?.doc !== false)) continue;
		if ((hasNonEmptyString(account.appId) || baseAppId) && (hasConfiguredSecretInput(account.appSecret, cfg.secrets?.defaults) || baseAppSecret)) return true;
	}
	return false;
}
function collectFeishuSecurityAuditFindings(params) {
	if (!isFeishuDocToolEnabled(params.cfg)) return [];
	return [{
		checkId: "channels.feishu.doc_owner_open_id",
		severity: "warn",
		title: "Feishu doc create can grant requester permissions",
		detail: "channels.feishu tools include \"doc\"; feishu_doc action \"create\" can grant document access to the trusted requesting Feishu user.",
		remediation: "Disable channels.feishu.tools.doc when not needed, and restrict tool access for untrusted prompts."
	}];
}
//#endregion
export { messageActionTargetAliases as n, collectFeishuSecurityAuditFindings as t };
