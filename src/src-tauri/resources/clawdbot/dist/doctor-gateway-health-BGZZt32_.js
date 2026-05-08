import { i as formatErrorMessage } from "./errors-CDFVCV9D.js";
import { n as buildGatewayConnectionDetails, r as callGateway } from "./call-CP7A3sdw.js";
import { t as note } from "./note-B6LXIgud.js";
import { n as formatHealthCheckFailure } from "./health-format-Dba3c-PK.js";
import { n as healthCommand } from "./health-DeX4rMEb.js";
import { t as collectChannelStatusIssues } from "./channels-status-issues-BxguQ1CM.js";
//#region src/commands/doctor-gateway-health.ts
function isGatewayCallTimeout(message) {
	return /^gateway timeout after \d+ms(?:\n|$)/.test(message);
}
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
			params: { probe: false },
			timeoutMs,
			config: params.cfg
		});
		return {
			checked: true,
			ready: payload.embedding.ok,
			error: payload.embedding.error
		};
	} catch (err) {
		const message = formatErrorMessage(err);
		if (isGatewayCallTimeout(message)) return {
			checked: false,
			ready: false,
			error: `gateway memory probe timed out: ${message}`
		};
		return {
			checked: true,
			ready: false,
			error: `gateway memory probe unavailable: ${message}`
		};
	}
}
//#endregion
export { checkGatewayHealth, probeGatewayMemoryStatus };
