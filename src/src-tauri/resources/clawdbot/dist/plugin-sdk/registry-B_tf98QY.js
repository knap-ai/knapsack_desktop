//#region src/acp/runtime/errors.ts
const ACP_ERROR_CODES = [
	"ACP_BACKEND_MISSING",
	"ACP_BACKEND_UNAVAILABLE",
	"ACP_BACKEND_UNSUPPORTED_CONTROL",
	"ACP_DISPATCH_DISABLED",
	"ACP_INVALID_RUNTIME_OPTION",
	"ACP_SESSION_INIT_FAILED",
	"ACP_TURN_FAILED"
];
var AcpRuntimeError = class extends Error {
	constructor(code, message, options) {
		super(message);
		this.name = "AcpRuntimeError";
		this.code = code;
		this.cause = options?.cause;
	}
};
function isAcpRuntimeError(value) {
	return value instanceof AcpRuntimeError;
}
function toAcpRuntimeError(params) {
	if (params.error instanceof AcpRuntimeError) return params.error;
	if (params.error instanceof Error) return new AcpRuntimeError(params.fallbackCode, params.error.message, { cause: params.error });
	return new AcpRuntimeError(params.fallbackCode, params.fallbackMessage, { cause: params.error });
}
async function withAcpRuntimeErrorBoundary(params) {
	try {
		return await params.run();
	} catch (error) {
		throw toAcpRuntimeError({
			error,
			fallbackCode: params.fallbackCode,
			fallbackMessage: params.fallbackMessage
		});
	}
}
//#endregion
//#region src/acp/runtime/registry.ts
const ACP_RUNTIME_REGISTRY_STATE_KEY = Symbol.for("openclaw.acpRuntimeRegistryState");
function createAcpRuntimeRegistryGlobalState() {
	return { backendsById: /* @__PURE__ */ new Map() };
}
function resolveAcpRuntimeRegistryGlobalState() {
	const runtimeGlobal = globalThis;
	if (!runtimeGlobal[ACP_RUNTIME_REGISTRY_STATE_KEY]) runtimeGlobal[ACP_RUNTIME_REGISTRY_STATE_KEY] = createAcpRuntimeRegistryGlobalState();
	return runtimeGlobal[ACP_RUNTIME_REGISTRY_STATE_KEY];
}
const ACP_BACKENDS_BY_ID = resolveAcpRuntimeRegistryGlobalState().backendsById;
function normalizeBackendId(id) {
	return id?.trim().toLowerCase() || "";
}
function isBackendHealthy(backend) {
	if (!backend.healthy) return true;
	try {
		return backend.healthy();
	} catch {
		return false;
	}
}
function registerAcpRuntimeBackend(backend) {
	const id = normalizeBackendId(backend.id);
	if (!id) throw new Error("ACP runtime backend id is required");
	if (!backend.runtime) throw new Error(`ACP runtime backend "${id}" is missing runtime implementation`);
	ACP_BACKENDS_BY_ID.set(id, {
		...backend,
		id
	});
}
function unregisterAcpRuntimeBackend(id) {
	const normalized = normalizeBackendId(id);
	if (!normalized) return;
	ACP_BACKENDS_BY_ID.delete(normalized);
}
function getAcpRuntimeBackend(id) {
	const normalized = normalizeBackendId(id);
	if (normalized) return ACP_BACKENDS_BY_ID.get(normalized) ?? null;
	if (ACP_BACKENDS_BY_ID.size === 0) return null;
	for (const backend of ACP_BACKENDS_BY_ID.values()) if (isBackendHealthy(backend)) return backend;
	return ACP_BACKENDS_BY_ID.values().next().value ?? null;
}
function requireAcpRuntimeBackend(id) {
	const normalized = normalizeBackendId(id);
	const backend = getAcpRuntimeBackend(normalized || void 0);
	if (!backend) throw new AcpRuntimeError("ACP_BACKEND_MISSING", "ACP runtime backend is not configured. Install and enable the acpx runtime plugin.");
	if (!isBackendHealthy(backend)) throw new AcpRuntimeError("ACP_BACKEND_UNAVAILABLE", "ACP runtime backend is currently unavailable. Try again in a moment.");
	if (normalized && backend.id !== normalized) throw new AcpRuntimeError("ACP_BACKEND_MISSING", `ACP runtime backend "${normalized}" is not registered.`);
	return backend;
}
//#endregion
export { ACP_ERROR_CODES as a, toAcpRuntimeError as c, unregisterAcpRuntimeBackend as i, withAcpRuntimeErrorBoundary as l, registerAcpRuntimeBackend as n, AcpRuntimeError as o, requireAcpRuntimeBackend as r, isAcpRuntimeError as s, getAcpRuntimeBackend as t };
