import { r as getPluginRegistryState } from "./runtime-state-2uqC88Ju.js";
import { n as resolveReservedGatewayMethodScope } from "./gateway-method-policy-ZYJh0jGf.js";
//#region src/gateway/operator-scopes.ts
const ADMIN_SCOPE = "operator.admin";
const READ_SCOPE = "operator.read";
const WRITE_SCOPE = "operator.write";
const APPROVALS_SCOPE = "operator.approvals";
const PAIRING_SCOPE = "operator.pairing";
const TALK_SECRETS_SCOPE = "operator.talk.secrets";
//#endregion
//#region src/gateway/method-scopes.ts
const CLI_DEFAULT_OPERATOR_SCOPES = [
	ADMIN_SCOPE,
	READ_SCOPE,
	WRITE_SCOPE,
	APPROVALS_SCOPE,
	PAIRING_SCOPE,
	TALK_SECRETS_SCOPE
];
const NODE_ROLE_METHODS = new Set([
	"node.invoke.result",
	"node.event",
	"node.pending.drain",
	"node.canvas.capability.refresh",
	"node.pending.pull",
	"node.pending.ack",
	"skills.bins"
]);
const METHOD_SCOPE_BY_NAME = new Map(Object.entries({
	[APPROVALS_SCOPE]: [
		"exec.approval.get",
		"exec.approval.list",
		"exec.approval.request",
		"exec.approval.waitDecision",
		"exec.approval.resolve",
		"plugin.approval.list",
		"plugin.approval.request",
		"plugin.approval.waitDecision",
		"plugin.approval.resolve"
	],
	[PAIRING_SCOPE]: [
		"node.pair.request",
		"node.pair.list",
		"node.pair.reject",
		"node.pair.verify",
		"node.pair.approve",
		"device.pair.list",
		"device.pair.approve",
		"device.pair.reject",
		"device.pair.remove",
		"device.token.rotate",
		"device.token.revoke",
		"node.rename"
	],
	[READ_SCOPE]: [
		"health",
		"doctor.memory.status",
		"doctor.memory.dreamDiary",
		"logs.tail",
		"channels.status",
		"status",
		"usage.status",
		"usage.cost",
		"tts.status",
		"tts.providers",
		"commands.list",
		"models.list",
		"models.authStatus",
		"tools.catalog",
		"tools.effective",
		"agents.list",
		"agent.identity.get",
		"skills.status",
		"skills.search",
		"skills.detail",
		"voicewake.get",
		"sessions.list",
		"sessions.get",
		"sessions.preview",
		"sessions.resolve",
		"sessions.compaction.list",
		"sessions.compaction.get",
		"sessions.subscribe",
		"sessions.unsubscribe",
		"sessions.messages.subscribe",
		"sessions.messages.unsubscribe",
		"sessions.usage",
		"sessions.usage.timeseries",
		"sessions.usage.logs",
		"cron.list",
		"cron.status",
		"cron.runs",
		"gateway.identity.get",
		"system-presence",
		"last-heartbeat",
		"node.list",
		"node.describe",
		"chat.history",
		"config.get",
		"config.schema.lookup",
		"talk.config",
		"agents.files.list",
		"agents.files.get"
	],
	[WRITE_SCOPE]: [
		"message.action",
		"send",
		"poll",
		"agent",
		"agent.wait",
		"wake",
		"talk.mode",
		"talk.speak",
		"tts.enable",
		"tts.disable",
		"tts.convert",
		"tts.setProvider",
		"voicewake.set",
		"node.invoke",
		"chat.send",
		"chat.abort",
		"sessions.create",
		"sessions.send",
		"sessions.steer",
		"sessions.abort",
		"sessions.compaction.branch",
		"doctor.memory.backfillDreamDiary",
		"doctor.memory.resetDreamDiary",
		"doctor.memory.resetGroundedShortTerm",
		"doctor.memory.repairDreamingArtifacts",
		"doctor.memory.dedupeDreamDiary",
		"push.test",
		"node.pending.enqueue"
	],
	[ADMIN_SCOPE]: [
		"channels.logout",
		"agents.create",
		"agents.update",
		"agents.delete",
		"skills.install",
		"skills.update",
		"secrets.reload",
		"secrets.resolve",
		"cron.add",
		"cron.update",
		"cron.remove",
		"cron.run",
		"sessions.patch",
		"sessions.reset",
		"sessions.delete",
		"sessions.compact",
		"sessions.compaction.restore",
		"connect",
		"chat.inject",
		"web.login.start",
		"web.login.wait",
		"set-heartbeats",
		"system-event",
		"agents.files.set"
	],
	[TALK_SECRETS_SCOPE]: []
}).flatMap(([scope, methods]) => methods.map((method) => [method, scope])));
function resolveScopedMethod(method) {
	const explicitScope = METHOD_SCOPE_BY_NAME.get(method);
	if (explicitScope) return explicitScope;
	const reservedScope = resolveReservedGatewayMethodScope(method);
	if (reservedScope) return reservedScope;
	const pluginScope = getPluginRegistryState()?.activeRegistry?.gatewayMethodScopes?.[method];
	if (pluginScope) return pluginScope;
}
function isNodeRoleMethod(method) {
	return NODE_ROLE_METHODS.has(method);
}
function isAdminOnlyMethod(method) {
	return resolveScopedMethod(method) === ADMIN_SCOPE;
}
function resolveRequiredOperatorScopeForMethod(method) {
	return resolveScopedMethod(method);
}
function resolveLeastPrivilegeOperatorScopesForMethod(method) {
	const requiredScope = resolveRequiredOperatorScopeForMethod(method);
	if (requiredScope) return [requiredScope];
	return [];
}
function authorizeOperatorScopesForMethod(method, scopes) {
	if (scopes.includes("operator.admin")) return { allowed: true };
	const requiredScope = resolveRequiredOperatorScopeForMethod(method) ?? "operator.admin";
	if (requiredScope === "operator.read") {
		if (scopes.includes("operator.read") || scopes.includes("operator.write")) return { allowed: true };
		return {
			allowed: false,
			missingScope: READ_SCOPE
		};
	}
	if (scopes.includes(requiredScope)) return { allowed: true };
	return {
		allowed: false,
		missingScope: requiredScope
	};
}
//#endregion
export { resolveLeastPrivilegeOperatorScopesForMethod as a, PAIRING_SCOPE as c, WRITE_SCOPE as d, isNodeRoleMethod as i, READ_SCOPE as l, authorizeOperatorScopesForMethod as n, ADMIN_SCOPE as o, isAdminOnlyMethod as r, APPROVALS_SCOPE as s, CLI_DEFAULT_OPERATOR_SCOPES as t, TALK_SECRETS_SCOPE as u };
