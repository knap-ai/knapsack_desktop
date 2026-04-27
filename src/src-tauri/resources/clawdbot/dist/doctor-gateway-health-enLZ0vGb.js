import { i as formatErrorMessage } from "./errors-Jbvi20TW.js";
import { n as buildGatewayConnectionDetails, r as callGateway } from "./call-Gv9tybWD.js";
import { t as note } from "./note-D_Kkgdi2.js";
import { n as formatHealthCheckFailure } from "./health-format-Cu0AxhMs.js";
import { n as healthCommand } from "./health-DpiT_nOq.js";
import { t as collectChannelStatusIssues } from "./channels-status-issues-CJwNQzkG.js";
//#region src/commands/doctor-gateway-health.ts
async function checkGatewayHealth(params) {
	const gatewayDetails = buildGatewayConnectionDetails({ config: params.cfg });
	const timeoutMs = typeof params.timeoutMs === "number" && params.timeoutMs > 0 ? params.timeoutMs : 1e4;
	let healthOk = false;
	try {
		await healthCommand({
			json: false,
			timeoutMs,
			config: params.cfg
		}, params.runtime);
		healthOk = true;
	} catch (err) {
		if (String(err).includes("gateway closed")) {
			note("Gateway not running.", "Gateway");
			note(gatewayDetails.message, "Gateway connection");
		} else params.runtime.error(formatHealthCheckFailure(err));
	}
	if (healthOk) try {
		const issues = collectChannelStatusIssues(await callGateway({
			method: "channels.status",
			params: {
				probe: true,
				timeoutMs: 5e3
			},
			timeoutMs: 6e3
		}));
		if (issues.length > 0) note(issues.map((issue) => `- ${issue.channel} ${issue.accountId}: ${issue.message}${issue.fix ? ` (${issue.fix})` : ""}`).join("\n"), "Channel warnings");
	} catch {}
	return { healthOk };
}
async function probeGatewayMemoryStatus(params) {
	const timeoutMs = typeof params.timeoutMs === "number" && params.timeoutMs > 0 ? params.timeoutMs : 8e3;
	try {
		const payload = await callGateway({
			method: "doctor.memory.status",
			timeoutMs,
			config: params.cfg
		});
		return {
			checked: true,
			ready: payload.embedding.ok,
			error: payload.embedding.error
		};
	} catch (err) {
		return {
			checked: true,
			ready: false,
			error: `gateway memory probe unavailable: ${formatErrorMessage(err)}`
		};
	}
}
//#endregion
export { checkGatewayHealth, probeGatewayMemoryStatus };
