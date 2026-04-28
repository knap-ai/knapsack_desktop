import { r as createLegacyPrivateNetworkDoctorContract } from "./ssrf-policy-BMzLPvV8.js";
import "./ssrf-runtime-CIV6CU_8.js";
//#region extensions/mattermost/src/doctor-contract.ts
const contract = createLegacyPrivateNetworkDoctorContract({ channelKey: "mattermost" });
const legacyConfigRules = contract.legacyConfigRules;
const normalizeCompatibilityConfig = contract.normalizeCompatibilityConfig;
//#endregion
export { normalizeCompatibilityConfig as n, legacyConfigRules as t };
