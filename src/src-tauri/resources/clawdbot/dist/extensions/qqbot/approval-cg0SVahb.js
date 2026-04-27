//#region extensions/qqbot/src/engine/approval/index.ts
function buildExecApprovalText(request) {
	const expiresIn = Math.max(0, Math.round((request.expiresAtMs - Date.now()) / 1e3));
	const lines = ["🔐 命令执行审批", ""];
	const cmd = request.request.commandPreview ?? request.request.command ?? "";
	if (cmd) lines.push(`\`\`\`\n${cmd.slice(0, 300)}\n\`\`\``);
	if (request.request.cwd) lines.push(`\u{1f4c1} \u76ee\u5f55: ${request.request.cwd}`);
	if (request.request.agentId) lines.push(`\u{1f916} Agent: ${request.request.agentId}`);
	lines.push("", `\u23f1\ufe0f \u8d85\u65f6: ${expiresIn} \u79d2`);
	return lines.join("\n");
}
function buildPluginApprovalText(request) {
	const timeoutSec = Math.round((request.request.timeoutMs ?? 12e4) / 1e3);
	const lines = [`${request.request.severity === "critical" ? "🔴" : request.request.severity === "info" ? "🔵" : "🟡"} \u5ba1\u6279\u8bf7\u6c42`, ""];
	lines.push(`\u{1f4cb} ${request.request.title}`);
	if (request.request.description) lines.push(`\u{1f4dd} ${request.request.description}`);
	if (request.request.toolName) lines.push(`\u{1f527} \u5de5\u5177: ${request.request.toolName}`);
	if (request.request.pluginId) lines.push(`\u{1f50c} \u63d2\u4ef6: ${request.request.pluginId}`);
	if (request.request.agentId) lines.push(`\u{1f916} Agent: ${request.request.agentId}`);
	lines.push("", `\u23f1\ufe0f \u8d85\u65f6: ${timeoutSec} \u79d2`);
	return lines.join("\n");
}
/**
* Build the three-button inline keyboard for approval messages.
*
* type=1 (Callback): click triggers INTERACTION_CREATE, button_data = data field.
* group_id "approval": clicking one button grays out the others (mutual exclusion).
* click_limit=1: each user can only click once.
* permission.type=2: all users can interact.
*/
function buildApprovalKeyboard(approvalId, allowedDecisions = [
	"allow-once",
	"allow-always",
	"deny"
]) {
	const makeBtn = (id, label, visitedLabel, data, style) => ({
		id,
		render_data: {
			label,
			visited_label: visitedLabel,
			style
		},
		action: {
			type: 1,
			data,
			permission: { type: 2 },
			click_limit: 1
		},
		group_id: "approval"
	});
	const buttons = [];
	if (allowedDecisions.includes("allow-once")) buttons.push(makeBtn("allow", "✅ 允许一次", "已允许", `approve:${approvalId}:allow-once`, 1));
	if (allowedDecisions.includes("allow-always")) buttons.push(makeBtn("always", "⭐ 始终允许", "已始终允许", `approve:${approvalId}:allow-always`, 1));
	if (allowedDecisions.includes("deny")) buttons.push(makeBtn("deny", "❌ 拒绝", "已拒绝", `approve:${approvalId}:deny`, 0));
	return { content: { rows: [{ buttons }] } };
}
/**
* Extract the delivery target from a sessionKey or turnSourceTo string.
*
* Expected formats:
*   agent:main:qqbot:direct:OPENID  -> { type: "c2c", id: "OPENID" }
*   agent:main:qqbot:c2c:OPENID     -> { type: "c2c", id: "OPENID" }
*   agent:main:qqbot:group:GROUPID  -> { type: "group", id: "GROUPID" }
*
* Returns null if neither field matches the expected pattern.
*/
function resolveApprovalTarget(sessionKey, turnSourceTo) {
	const sk = sessionKey ?? turnSourceTo;
	if (!sk) return null;
	const m = sk.match(/qqbot:(c2c|direct|group):([A-F0-9]+)/i);
	if (!m) return null;
	return {
		type: m[1].toLowerCase() === "group" ? "group" : "c2c",
		id: m[2]
	};
}
/**
* Parse the button_data string from an INTERACTION_CREATE event.
*
* Expected format: `approve:<approvalId>:<decision>`
* where approvalId may be prefixed with "exec:" or "plugin:".
*
* Returns null if the data does not match the approval button format.
*/
function parseApprovalButtonData(buttonData) {
	const m = buttonData.match(/^approve:((?:(?:exec|plugin):)?[0-9a-f-]+):(allow-once|allow-always|deny)$/i);
	if (!m) return null;
	return {
		approvalId: m[1],
		decision: m[2]
	};
}
//#endregion
export { resolveApprovalTarget as a, parseApprovalButtonData as i, buildExecApprovalText as n, buildPluginApprovalText as r, buildApprovalKeyboard as t };
