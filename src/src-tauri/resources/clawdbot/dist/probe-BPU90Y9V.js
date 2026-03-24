import { r as formatErrorMessage } from "./errors-BxyFnvP3.js";
import { r as isLoopbackHost } from "./net-JAg9zL0G.js";
import { h as GATEWAY_CLIENT_NAMES, m as GATEWAY_CLIENT_MODES } from "./message-channel-BliByQBl.js";
import { a as READ_SCOPE, u as GatewayClient } from "./method-scopes-BiEi0X2g.js";
import { randomUUID } from "node:crypto";
//#region src/gateway/probe.ts
const MIN_PROBE_TIMEOUT_MS = 250;
const MAX_TIMER_DELAY_MS = 2147483647;
function clampProbeTimeoutMs(timeoutMs) {
	return Math.min(MAX_TIMER_DELAY_MS, Math.max(250, timeoutMs));
}
async function probeGateway(opts) {
	const startedAt = Date.now();
	const instanceId = randomUUID();
	let connectLatencyMs = null;
	let connectError = null;
	let close = null;
	const disableDeviceIdentity = (() => {
		try {
			const hostname = new URL(opts.url).hostname;
			return isLoopbackHost(hostname) && !(opts.auth?.token || opts.auth?.password);
		} catch {
			return false;
		}
	})();
	const detailLevel = opts.includeDetails === false ? "none" : opts.detailLevel ?? "full";
	return await new Promise((resolve) => {
		let settled = false;
		let timer = null;
		const clearProbeTimer = () => {
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
		};
		const armProbeTimer = (onTimeout) => {
			clearProbeTimer();
			timer = setTimeout(onTimeout, clampProbeTimeoutMs(opts.timeoutMs));
		};
		const settle = (result) => {
			if (settled) return;
			settled = true;
			clearProbeTimer();
			client.stop();
			resolve({
				url: opts.url,
				...result
			});
		};
		const client = new GatewayClient({
			url: opts.url,
			token: opts.auth?.token,
			password: opts.auth?.password,
			scopes: [READ_SCOPE],
			clientName: GATEWAY_CLIENT_NAMES.CLI,
			clientVersion: "dev",
			mode: GATEWAY_CLIENT_MODES.PROBE,
			instanceId,
			deviceIdentity: disableDeviceIdentity ? null : void 0,
			onConnectError: (err) => {
				connectError = formatErrorMessage(err);
			},
			onClose: (code, reason) => {
				close = {
					code,
					reason
				};
			},
			onHelloOk: async () => {
				connectLatencyMs = Date.now() - startedAt;
				if (detailLevel === "none") {
					settle({
						ok: true,
						connectLatencyMs,
						error: null,
						close,
						health: null,
						status: null,
						presence: null,
						configSnapshot: null
					});
					return;
				}
				armProbeTimer(() => {
					settle({
						ok: false,
						connectLatencyMs,
						error: "timeout",
						close,
						health: null,
						status: null,
						presence: null,
						configSnapshot: null
					});
				});
				try {
					if (detailLevel === "presence") {
						const presence = await client.request("system-presence");
						settle({
							ok: true,
							connectLatencyMs,
							error: null,
							close,
							health: null,
							status: null,
							presence: Array.isArray(presence) ? presence : null,
							configSnapshot: null
						});
						return;
					}
					const [health, status, presence, configSnapshot] = await Promise.all([
						client.request("health"),
						client.request("status"),
						client.request("system-presence"),
						client.request("config.get", {})
					]);
					settle({
						ok: true,
						connectLatencyMs,
						error: null,
						close,
						health,
						status,
						presence: Array.isArray(presence) ? presence : null,
						configSnapshot
					});
				} catch (err) {
					settle({
						ok: false,
						connectLatencyMs,
						error: formatErrorMessage(err),
						close,
						health: null,
						status: null,
						presence: null,
						configSnapshot: null
					});
				}
			}
		});
		armProbeTimer(() => {
			settle({
				ok: false,
				connectLatencyMs,
				error: connectError ? `connect failed: ${connectError}` : "timeout",
				close,
				health: null,
				status: null,
				presence: null,
				configSnapshot: null
			});
		});
		client.start();
	});
}
//#endregion
export { probeGateway as i, MIN_PROBE_TIMEOUT_MS as n, clampProbeTimeoutMs as r, MAX_TIMER_DELAY_MS as t };
