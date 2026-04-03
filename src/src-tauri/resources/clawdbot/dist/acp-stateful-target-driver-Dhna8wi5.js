import { pn as readAcpSessionEntry } from "./pi-embedded-BYdcxQ5A.js";
import { l as resolveConfiguredAcpBindingSpecFromRecord } from "./binding-registry-D0ByHSyN.js";
import { a as resolveConfiguredAcpBindingSpecBySessionKey, n as ensureConfiguredAcpBindingSession, r as resetAcpSessionInPlace, t as ensureConfiguredAcpBindingReady } from "./persistent-bindings.lifecycle-CqLV8fwu.js";
//#region src/channels/plugins/acp-stateful-target-driver.ts
function toAcpStatefulBindingTargetDescriptor(params) {
	const metaAgentId = (readAcpSessionEntry(params)?.acp)?.agent?.trim();
	if (metaAgentId) return {
		kind: "stateful",
		driverId: "acp",
		sessionKey: params.sessionKey,
		agentId: metaAgentId
	};
	const spec = resolveConfiguredAcpBindingSpecBySessionKey(params);
	if (!spec) return null;
	return {
		kind: "stateful",
		driverId: "acp",
		sessionKey: params.sessionKey,
		agentId: spec.agentId,
		...spec.label ? { label: spec.label } : {}
	};
}
async function ensureAcpTargetReady(params) {
	const configuredBinding = resolveConfiguredAcpBindingSpecFromRecord(params.bindingResolution.record);
	if (!configuredBinding) return {
		ok: false,
		error: "Configured ACP binding unavailable"
	};
	return await ensureConfiguredAcpBindingReady({
		cfg: params.cfg,
		configuredBinding: {
			spec: configuredBinding,
			record: params.bindingResolution.record
		}
	});
}
async function ensureAcpTargetSession(params) {
	const spec = resolveConfiguredAcpBindingSpecFromRecord(params.bindingResolution.record);
	if (!spec) return {
		ok: false,
		sessionKey: params.bindingResolution.statefulTarget.sessionKey,
		error: "Configured ACP binding unavailable"
	};
	return await ensureConfiguredAcpBindingSession({
		cfg: params.cfg,
		spec
	});
}
async function resetAcpTargetInPlace(params) {
	return await resetAcpSessionInPlace(params);
}
const acpStatefulBindingTargetDriver = {
	id: "acp",
	ensureReady: ensureAcpTargetReady,
	ensureSession: ensureAcpTargetSession,
	resolveTargetBySessionKey: toAcpStatefulBindingTargetDescriptor,
	resetInPlace: resetAcpTargetInPlace
};
//#endregion
export { acpStatefulBindingTargetDriver };
