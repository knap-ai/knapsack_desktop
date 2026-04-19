import "./errors-D8p6rxH8.js";
import "./tmp-openclaw-dir-eyAoWbVe.js";
import "./env-BiSxzotM.js";
import "./file-lock-BMw37VAn.js";
import "./undici-global-dispatcher-yJO9KyXW.js";
import "./fetch-guard-B3p4gGaY.js";
import "./ssrf-DoOclwFS.js";
import "./exec-approvals-DqhUu-iS.js";
import "./fs-safe-B7mHodgb.js";
import "./proxy-fetch-5deRg8He.js";
import { n as drainPendingDeliveries$1 } from "./delivery-queue-CDEI8gW6.js";
import "./system-events-Dq_M0n12.js";
import "./retry-cGVSdz2T.js";
import "./secret-file-BlBf_gtc.js";
import "./http-body-CmkD5yuo.js";
import "./exec-approval-reply-D_dFeWJb.js";
import "./approval-native-runtime-B1-LcwZj.js";
import "./exec-approval-command-display-BXRwRjXB.js";
import "./exec-approval-session-target-bO6xI_Ze.js";
import "./heartbeat-visibility-K-nKdcA-.js";
import "./transport-ready-Dto5g1sj.js";
import "./identity-zKl_6vuv.js";
import "./retry-policy-DOGOeyKz.js";
import "./ssrf-policy-CChtVzhj.js";
//#region src/plugin-sdk/infra-runtime.ts
function normalizeWhatsAppReconnectAccountId(accountId) {
	return (accountId ?? "").trim() || "default";
}
const WHATSAPP_NO_LISTENER_ERROR_RE = /No active WhatsApp Web listener/i;
let outboundDeliverRuntimePromise = null;
async function loadOutboundDeliverRuntime() {
	outboundDeliverRuntimePromise ??= import("./deliver-runtime-C_1KCZF4.js");
	return await outboundDeliverRuntimePromise;
}
async function drainPendingDeliveries(opts) {
	const deliver = opts.deliver ?? (await loadOutboundDeliverRuntime()).deliverOutboundPayloads;
	await drainPendingDeliveries$1({
		...opts,
		deliver
	});
}
/**
* @deprecated Prefer plugin-owned reconnect policy wired through
* `drainPendingDeliveries(...)`. This compatibility shim preserves the
* historical public SDK symbol for existing plugin callers.
*/
async function drainReconnectQueue(opts) {
	const normalizedAccountId = normalizeWhatsAppReconnectAccountId(opts.accountId);
	await drainPendingDeliveries({
		drainKey: `whatsapp:${normalizedAccountId}`,
		logLabel: "WhatsApp reconnect drain",
		cfg: opts.cfg,
		log: opts.log,
		stateDir: opts.stateDir,
		deliver: opts.deliver,
		selectEntry: (entry) => ({
			match: entry.channel === "whatsapp" && normalizeWhatsAppReconnectAccountId(entry.accountId) === normalizedAccountId && typeof entry.lastError === "string" && WHATSAPP_NO_LISTENER_ERROR_RE.test(entry.lastError),
			bypassBackoff: true
		})
	});
}
//#endregion
export { drainReconnectQueue as n, drainPendingDeliveries as t };
