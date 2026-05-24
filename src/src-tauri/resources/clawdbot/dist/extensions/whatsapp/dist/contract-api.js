import { c as normalizeWhatsAppTarget$1, t as isWhatsAppGroupJid$1 } from "./normalize-target-bVWjgftN.js";
import { t as whatsappCommandPolicy$1 } from "./command-policy-BIOSHySD.js";
import { t as resolveLegacyGroupSessionKey$1 } from "./group-session-contract-DDnZSsJ1.js";
import { n as unsupportedSecretRefSurfacePatterns, t as collectUnsupportedSecretRefConfigCandidates } from "./security-contract-nAzD945y.js";
import { r as isLegacyGroupSessionKey$1, t as canonicalizeLegacySessionKey$1 } from "./session-contract-DMTm6Q_L.js";
import { n as listWhatsAppDirectoryGroupsFromConfig, r as listWhatsAppDirectoryPeersFromConfig } from "./directory-config-CfLFAK54.js";
import { t as resolveWhatsAppRuntimeGroupPolicy$1 } from "./runtime-group-policy-DeSRFXEV.js";
import { n as testing } from "./access-control-p_vcYDW7.js";
//#region extensions/whatsapp/contract-api.ts
const canonicalizeLegacySessionKey = canonicalizeLegacySessionKey$1;
const isLegacyGroupSessionKey = isLegacyGroupSessionKey$1;
const isWhatsAppGroupJid = isWhatsAppGroupJid$1;
const normalizeWhatsAppTarget = normalizeWhatsAppTarget$1;
const resolveLegacyGroupSessionKey = resolveLegacyGroupSessionKey$1;
const resolveWhatsAppRuntimeGroupPolicy = resolveWhatsAppRuntimeGroupPolicy$1;
const whatsappAccessControlTesting = testing;
const whatsappCommandPolicy = whatsappCommandPolicy$1;
//#endregion
export { canonicalizeLegacySessionKey, collectUnsupportedSecretRefConfigCandidates, isLegacyGroupSessionKey, isWhatsAppGroupJid, listWhatsAppDirectoryGroupsFromConfig, listWhatsAppDirectoryPeersFromConfig, normalizeWhatsAppTarget, resolveLegacyGroupSessionKey, resolveWhatsAppRuntimeGroupPolicy, unsupportedSecretRefSurfacePatterns, whatsappAccessControlTesting, whatsappCommandPolicy };
