import { t as pickGatewaySelfPresence } from "./gateway-presence-Cb0GPWis.js";
import { t as resolveGatewayProbeTarget } from "./probe-target-l911xuWk.js";
import { r as resolveGatewayProbeAuthSafeWithSecretInputs } from "./probe-auth-DPDUBBEY.js";
//#region src/commands/status.gateway-probe.ts
async function resolveGatewayProbeAuthResolution(cfg) {
	return resolveGatewayProbeAuthSafeWithSecretInputs({
		cfg,
		mode: resolveGatewayProbeTarget(cfg).mode,
		env: process.env
	});
}
async function resolveGatewayProbeAuth(cfg) {
	return (await resolveGatewayProbeAuthResolution(cfg)).auth;
}
//#endregion
export { pickGatewaySelfPresence, resolveGatewayProbeAuth, resolveGatewayProbeAuthResolution };
