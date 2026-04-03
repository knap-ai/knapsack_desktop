import "./message-channel-D19EDm2g.js";
import "./bindings-CxBQdMiO.js";
import "./resolve-route-DID7K3Jm.js";
import "./base-session-key-BM8QSZQb.js";
//#region src/infra/outbound/thread-id.ts
function normalizeOutboundThreadId(value) {
	if (value == null) return;
	if (typeof value === "number") {
		if (!Number.isFinite(value)) return;
		return String(Math.trunc(value));
	}
	const trimmed = value.trim();
	return trimmed ? trimmed : void 0;
}
//#endregion
export { normalizeOutboundThreadId as t };
