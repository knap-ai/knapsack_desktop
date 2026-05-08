import { d as setMatrixThreadBindingIdleTimeoutBySessionKey, p as setMatrixThreadBindingMaxAgeBySessionKey } from "./thread-bindings-shared-BNM9ln6K.js";
import { a as resolveMatrixDefaultOrOnlyAccountId, i as resolveMatrixChannelConfig, n as requiresExplicitMatrixDefaultAccount, r as resolveConfiguredMatrixAccountIds, s as resolveMatrixAccountStringValues, t as findMatrixAccountEntry } from "./account-selection-CgvQn_T8.js";
import { n as listMatrixEnvAccountIds, r as resolveMatrixEnvAccountToken, t as getMatrixScopedEnvVarNames } from "./env-vars-KF01E9CM.js";
import { n as setMatrixRuntime } from "./runtime-CvAfSP12.js";
import { a as resolveMatrixCredentialsPath, c as resolveMatrixLegacyFlatStoreRoot, i as resolveMatrixCredentialsFilename, l as sanitizeMatrixPathSegment, n as resolveMatrixAccountStorageRoot, o as resolveMatrixHomeserverKey, r as resolveMatrixCredentialsDir, s as resolveMatrixLegacyFlatStoragePaths, t as hashMatrixAccessToken } from "./storage-paths-CR-Jr5Jc.js";
import { i as isMatrixSdkAvailable, r as ensureMatrixSdkInstalled } from "./deps-Dp9cpROI.js";
import { assertHttpUrlTargetsPrivateNetwork, closeDispatcher, createPinnedDispatcher, resolvePinnedHostnameWithPolicy, ssrfPolicyFromAllowPrivateNetwork, ssrfPolicyFromDangerouslyAllowPrivateNetwork } from "openclaw/plugin-sdk/ssrf-runtime";
import { writeJsonFileAtomically } from "openclaw/plugin-sdk/json-store";
import { formatZonedTimestamp } from "openclaw/plugin-sdk/core";
//#region extensions/matrix/runtime-api.ts
function chunkTextForOutbound(text, limit) {
	const chunks = [];
	let remaining = text;
	while (remaining.length > limit) {
		const window = remaining.slice(0, limit);
		const splitAt = Math.max(window.lastIndexOf("\n"), window.lastIndexOf(" "));
		const breakAt = splitAt > 0 ? splitAt : limit;
		chunks.push(remaining.slice(0, breakAt).trimEnd());
		remaining = remaining.slice(breakAt).trimStart();
	}
	if (remaining.length > 0 || text.length === 0) chunks.push(remaining);
	return chunks;
}
//#endregion
export { assertHttpUrlTargetsPrivateNetwork, chunkTextForOutbound, closeDispatcher, createPinnedDispatcher, ensureMatrixSdkInstalled, findMatrixAccountEntry, formatZonedTimestamp, getMatrixScopedEnvVarNames, hashMatrixAccessToken, isMatrixSdkAvailable, listMatrixEnvAccountIds, requiresExplicitMatrixDefaultAccount, resolveConfiguredMatrixAccountIds, resolveMatrixAccountStorageRoot, resolveMatrixAccountStringValues, resolveMatrixChannelConfig, resolveMatrixCredentialsDir, resolveMatrixCredentialsFilename, resolveMatrixCredentialsPath, resolveMatrixDefaultOrOnlyAccountId, resolveMatrixEnvAccountToken, resolveMatrixHomeserverKey, resolveMatrixLegacyFlatStoragePaths, resolveMatrixLegacyFlatStoreRoot, resolvePinnedHostnameWithPolicy, sanitizeMatrixPathSegment, setMatrixRuntime, setMatrixThreadBindingIdleTimeoutBySessionKey, setMatrixThreadBindingMaxAgeBySessionKey, ssrfPolicyFromAllowPrivateNetwork, ssrfPolicyFromDangerouslyAllowPrivateNetwork, writeJsonFileAtomically };
