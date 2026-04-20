import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import "./text-runtime-DTMxvodz.js";
import { n as approveDevicePairing } from "./device-pairing-CItl9tqB.js";
import "./api-DBU_JI9w.js";
import { n as formatPendingRequests } from "./notify-B4aX9C_9.js";
//#region extensions/device-pair/pair-command-approve.ts
function buildMultiplePendingApprovalReply(pending) {
	return { text: `${formatPendingRequests(pending)}\n\nMultiple pending requests found. Approve one explicitly:
/pair approve <requestId>
Or approve the most recent:
/pair approve latest` };
}
function selectPendingApprovalRequest(params) {
	if (params.pending.length === 0) return { reply: { text: "No pending device pairing requests." } };
	if (!params.requested) return params.pending.length === 1 ? { pending: params.pending[0] } : { reply: buildMultiplePendingApprovalReply(params.pending) };
	if (normalizeLowercaseStringOrEmpty(params.requested) === "latest") return { pending: [...params.pending].toSorted((a, b) => (b.ts ?? 0) - (a.ts ?? 0))[0] };
	return {
		pending: params.pending.find((entry) => entry.requestId === params.requested),
		reply: void 0
	};
}
function formatApprovedPairingReply(approved) {
	const label = normalizeOptionalString(approved.device.displayName) || approved.device.deviceId;
	const platform = normalizeOptionalString(approved.device.platform);
	return { text: `✅ Paired ${label}${platform ? ` (${platform})` : ""}.` };
}
function formatForbiddenPairingRequirement(approved) {
	return approved.scope ?? approved.role ?? "additional approval";
}
async function approvePendingPairingRequest(params) {
	const approved = params.callerScopes === void 0 ? await approveDevicePairing(params.requestId) : await approveDevicePairing(params.requestId, { callerScopes: params.callerScopes });
	if (!approved) return { text: "Pairing request not found." };
	if (approved.status === "forbidden") return { text: `⚠️ This command requires ${formatForbiddenPairingRequirement(approved)} to approve this pairing request.` };
	return formatApprovedPairingReply(approved);
}
//#endregion
export { selectPendingApprovalRequest as n, approvePendingPairingRequest as t };
