import "./store-D-8DaAtv.js";
import { n as resolveAuthProfileMetadata } from "./identity-Ddp4YVqj.js";
import "./oauth-BMVacBS0.js";
import "./repair-BeS4nI_5.js";
import "./order-Din7_cCm.js";
import "./profiles-CrHNjqxk.js";
import "./usage-BxJGDEXo.js";
//#region src/agents/auth-profiles/display.ts
function resolveAuthProfileDisplayLabel(params) {
	const { displayName, email } = resolveAuthProfileMetadata(params);
	if (displayName) return `${params.profileId} (${displayName})`;
	if (email) return `${params.profileId} (${email})`;
	return params.profileId;
}
//#endregion
export { resolveAuthProfileDisplayLabel as t };
