import { r as logVerbose } from "./globals-BJZkpw-q.js";
import { En as resolveAcpAgentFromSessionKey, fn as getAcpSessionManager, pn as readAcpSessionEntry } from "./pi-embedded-BYdcxQ5A.js";
import { c as normalizeText, i as resolveConfiguredBindingRecordBySessionKey, l as resolveConfiguredAcpBindingSpecFromRecord, o as buildConfiguredAcpSessionKey, r as resolveConfiguredBindingRecord, u as toResolvedConfiguredAcpBinding } from "./binding-registry-D0ByHSyN.js";
//#region src/acp/persistent-bindings.resolve.ts
function resolveConfiguredAcpBindingRecord(params) {
	const resolved = resolveConfiguredBindingRecord(params);
	return resolved ? toResolvedConfiguredAcpBinding(resolved.record) : null;
}
function resolveConfiguredAcpBindingSpecBySessionKey(params) {
	const resolved = resolveConfiguredBindingRecordBySessionKey(params);
	return resolved ? resolveConfiguredAcpBindingSpecFromRecord(resolved.record) : null;
}
//#endregion
//#region src/acp/persistent-bindings.lifecycle.ts
function sessionMatchesConfiguredBinding(params) {
	const desiredAgent = (params.spec.acpAgentId ?? params.spec.agentId).trim().toLowerCase();
	const currentAgent = (params.meta.agent ?? "").trim().toLowerCase();
	if (!currentAgent || currentAgent !== desiredAgent) return false;
	if (params.meta.mode !== params.spec.mode) return false;
	const desiredBackend = params.spec.backend?.trim() || params.cfg.acp?.backend?.trim() || "";
	if (desiredBackend) {
		const currentBackend = (params.meta.backend ?? "").trim();
		if (!currentBackend || currentBackend !== desiredBackend) return false;
	}
	const desiredCwd = params.spec.cwd?.trim();
	if (desiredCwd !== void 0) {
		if (desiredCwd !== (params.meta.runtimeOptions?.cwd ?? params.meta.cwd ?? "").trim()) return false;
	}
	return true;
}
async function ensureConfiguredAcpBindingSession(params) {
	const sessionKey = buildConfiguredAcpSessionKey(params.spec);
	const acpManager = getAcpSessionManager();
	try {
		const resolution = acpManager.resolveSession({
			cfg: params.cfg,
			sessionKey
		});
		if (resolution.kind === "ready" && sessionMatchesConfiguredBinding({
			cfg: params.cfg,
			spec: params.spec,
			meta: resolution.meta
		})) return {
			ok: true,
			sessionKey
		};
		if (resolution.kind !== "none") await acpManager.closeSession({
			cfg: params.cfg,
			sessionKey,
			reason: "config-binding-reconfigure",
			clearMeta: false,
			allowBackendUnavailable: true,
			requireAcpSession: false
		});
		await acpManager.initializeSession({
			cfg: params.cfg,
			sessionKey,
			agent: params.spec.acpAgentId ?? params.spec.agentId,
			mode: params.spec.mode,
			cwd: params.spec.cwd,
			backendId: params.spec.backend
		});
		return {
			ok: true,
			sessionKey
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		logVerbose(`acp-configured-binding: failed ensuring ${params.spec.channel}:${params.spec.accountId}:${params.spec.conversationId} -> ${sessionKey}: ${message}`);
		return {
			ok: false,
			sessionKey,
			error: message
		};
	}
}
async function ensureConfiguredAcpBindingReady(params) {
	if (!params.configuredBinding) return { ok: true };
	const ensured = await ensureConfiguredAcpBindingSession({
		cfg: params.cfg,
		spec: params.configuredBinding.spec
	});
	if (ensured.ok) return { ok: true };
	return {
		ok: false,
		error: ensured.error ?? "unknown error"
	};
}
async function resetAcpSessionInPlace(params) {
	const sessionKey = params.sessionKey.trim();
	if (!sessionKey) return {
		ok: false,
		skipped: true
	};
	const meta = readAcpSessionEntry({
		cfg: params.cfg,
		sessionKey
	})?.acp;
	const configuredBinding = !meta || !normalizeText(meta.agent) ? resolveConfiguredAcpBindingSpecBySessionKey({
		cfg: params.cfg,
		sessionKey
	}) : null;
	if (!meta) {
		if (configuredBinding) {
			const ensured = await ensureConfiguredAcpBindingSession({
				cfg: params.cfg,
				spec: configuredBinding
			});
			if (ensured.ok) return { ok: true };
			return {
				ok: false,
				error: ensured.error
			};
		}
		return {
			ok: false,
			skipped: true
		};
	}
	const acpManager = getAcpSessionManager();
	const agent = normalizeText(meta.agent) ?? configuredBinding?.acpAgentId ?? configuredBinding?.agentId ?? resolveAcpAgentFromSessionKey(sessionKey, "main");
	const mode = meta.mode === "oneshot" ? "oneshot" : "persistent";
	const runtimeOptions = { ...meta.runtimeOptions };
	const cwd = normalizeText(runtimeOptions.cwd ?? meta.cwd);
	try {
		await acpManager.closeSession({
			cfg: params.cfg,
			sessionKey,
			reason: `${params.reason}-in-place-reset`,
			clearMeta: false,
			allowBackendUnavailable: true,
			requireAcpSession: false
		});
		await acpManager.initializeSession({
			cfg: params.cfg,
			sessionKey,
			agent,
			mode,
			cwd,
			backendId: normalizeText(meta.backend) ?? normalizeText(params.cfg.acp?.backend)
		});
		const runtimeOptionsPatch = Object.fromEntries(Object.entries(runtimeOptions).filter(([, value]) => value !== void 0));
		if (runtimeOptionsPatch && Object.keys(runtimeOptionsPatch).length > 0) await acpManager.updateSessionRuntimeOptions({
			cfg: params.cfg,
			sessionKey,
			patch: runtimeOptionsPatch
		});
		return { ok: true };
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		logVerbose(`acp-configured-binding: failed reset for ${sessionKey}: ${message}`);
		return {
			ok: false,
			error: message
		};
	}
}
//#endregion
export { resolveConfiguredAcpBindingSpecBySessionKey as a, resolveConfiguredAcpBindingRecord as i, ensureConfiguredAcpBindingSession as n, resetAcpSessionInPlace as r, ensureConfiguredAcpBindingReady as t };
