import { n as writeJsonFileAtomically } from "../../json-store-Bwo-RrS7.js";
import { d as resolvePinnedHostnameWithPolicy, i as createPinnedDispatcher, r as closeDispatcher } from "../../ssrf-BWlfjI7J.js";
import { n as formatZonedTimestamp } from "../../format-datetime-BQbPAZKm.js";
import { a as ssrfPolicyFromAllowPrivateNetwork, t as assertHttpUrlTargetsPrivateNetwork } from "../../ssrf-policy-B7Ivb-NK.js";
import "../../ssrf-runtime-BoGiIhjZ.js";
import { a as resolveMatrixDefaultOrOnlyAccountId, c as resolveMatrixEnvAccountToken, i as resolveMatrixChannelConfig, l as resolveMatrixAccountStringValues, n as requiresExplicitMatrixDefaultAccount, o as getMatrixScopedEnvVarNames, r as resolveConfiguredMatrixAccountIds, s as listMatrixEnvAccountIds, t as findMatrixAccountEntry } from "../../account-selection-BoMWBXkb.js";
import { n as setMatrixRuntime } from "../../runtime-Jdij2_G2.js";
import { a as resolveMatrixCredentialsPath, c as resolveMatrixLegacyFlatStoreRoot, i as resolveMatrixCredentialsFilename, l as sanitizeMatrixPathSegment, n as resolveMatrixAccountStorageRoot, o as resolveMatrixHomeserverKey, r as resolveMatrixCredentialsDir, s as resolveMatrixLegacyFlatStoragePaths, t as hashMatrixAccessToken } from "../../storage-paths-DQTtejVa.js";
import { f as setMatrixThreadBindingMaxAgeBySessionKey, u as setMatrixThreadBindingIdleTimeoutBySessionKey } from "../../thread-bindings-shared-C0nky8nQ.js";
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
export { assertHttpUrlTargetsPrivateNetwork, chunkTextForOutbound, closeDispatcher, createPinnedDispatcher, findMatrixAccountEntry, formatZonedTimestamp, getMatrixScopedEnvVarNames, hashMatrixAccessToken, listMatrixEnvAccountIds, requiresExplicitMatrixDefaultAccount, resolveConfiguredMatrixAccountIds, resolveMatrixAccountStorageRoot, resolveMatrixAccountStringValues, resolveMatrixChannelConfig, resolveMatrixCredentialsDir, resolveMatrixCredentialsFilename, resolveMatrixCredentialsPath, resolveMatrixDefaultOrOnlyAccountId, resolveMatrixEnvAccountToken, resolveMatrixHomeserverKey, resolveMatrixLegacyFlatStoragePaths, resolveMatrixLegacyFlatStoreRoot, resolvePinnedHostnameWithPolicy, sanitizeMatrixPathSegment, setMatrixRuntime, setMatrixThreadBindingIdleTimeoutBySessionKey, setMatrixThreadBindingMaxAgeBySessionKey, ssrfPolicyFromAllowPrivateNetwork, writeJsonFileAtomically };
