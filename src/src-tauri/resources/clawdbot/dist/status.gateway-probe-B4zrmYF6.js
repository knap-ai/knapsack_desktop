import { t as pickGatewaySelfPresence } from "./gateway-presence-Cv_3NmBw.js";
import { t as resolveGatewayProbeTarget } from "./probe-target-CiA-jcVT.js";
import { r as resolveGatewayProbeAuthSafeWithSecretInputs } from "./probe-auth-Do8ggGFF.js";
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
