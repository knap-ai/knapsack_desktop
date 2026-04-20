import { s as normalizeStringEntries } from "./string-normalization-xm3f27dv.js";
import { r as normalizeProviderId } from "./provider-id-KaStHhRz.js";
import { o as resolveProviderIdForAuth } from "./provider-env-vars-Sj-BhOn9.js";
import { c as saveAuthProfileStore, l as updateAuthProfileStoreWithLock, r as ensureAuthProfileStoreForLocalUpdate } from "./store-C1I9Mkh8.js";
import { n as normalizeSecretInput } from "./normalize-secret-input-DqcJmob1.js";
//#region src/agents/auth-profiles/profiles.ts
function dedupeProfileIds(profileIds) {
	return [...new Set(profileIds)];
}
async function setAuthProfileOrder(params) {
	const providerKey = normalizeProviderId(params.provider);
	const deduped = dedupeProfileIds(params.order && Array.isArray(params.order) ? normalizeStringEntries(params.order) : []);
	return await updateAuthProfileStoreWithLock({
		agentDir: params.agentDir,
		updater: (store) => {
			store.order = store.order ?? {};
			if (deduped.length === 0) {
				if (!store.order[providerKey]) return false;
				delete store.order[providerKey];
				if (Object.keys(store.order).length === 0) store.order = void 0;
				return true;
			}
			store.order[providerKey] = deduped;
			return true;
		}
	});
}
function upsertAuthProfile(params) {
	const credential = params.credential.type === "api_key" ? {
		...params.credential,
		...typeof params.credential.key === "string" ? { key: normalizeSecretInput(params.credential.key) } : {}
	} : params.credential.type === "token" ? {
		...params.credential,
		token: normalizeSecretInput(params.credential.token)
	} : params.credential;
	const store = ensureAuthProfileStoreForLocalUpdate(params.agentDir);
	store.profiles[params.profileId] = credential;
	saveAuthProfileStore(store, params.agentDir, {
		filterExternalAuthProfiles: false,
		syncExternalCli: false
	});
}
async function upsertAuthProfileWithLock(params) {
	return await updateAuthProfileStoreWithLock({
		agentDir: params.agentDir,
		updater: (store) => {
			store.profiles[params.profileId] = params.credential;
			return true;
		}
	});
}
async function removeProviderAuthProfilesWithLock(params) {
	const providerKey = resolveProviderIdForAuth(params.provider);
	const storeOrderKey = normalizeProviderId(params.provider);
	return await updateAuthProfileStoreWithLock({
		agentDir: params.agentDir,
		updater: (store) => {
			const profileIds = listProfilesForProvider(store, params.provider);
			let changed = false;
			for (const profileId of profileIds) {
				if (store.profiles[profileId]) {
					delete store.profiles[profileId];
					changed = true;
				}
				if (store.usageStats?.[profileId]) {
					delete store.usageStats[profileId];
					changed = true;
				}
			}
			if (store.order?.[storeOrderKey]) {
				delete store.order[storeOrderKey];
				changed = true;
				if (Object.keys(store.order).length === 0) store.order = void 0;
			}
			if (store.lastGood?.[providerKey]) {
				delete store.lastGood[providerKey];
				changed = true;
				if (Object.keys(store.lastGood).length === 0) store.lastGood = void 0;
			}
			if (store.usageStats && Object.keys(store.usageStats).length === 0) store.usageStats = void 0;
			return changed;
		}
	});
}
function listProfilesForProvider(store, provider) {
	const providerKey = resolveProviderIdForAuth(provider);
	return Object.entries(store.profiles).filter(([, cred]) => resolveProviderIdForAuth(cred.provider) === providerKey).map(([id]) => id);
}
async function markAuthProfileGood(params) {
	const { store, provider, profileId, agentDir } = params;
	const providerKey = resolveProviderIdForAuth(provider);
	const updated = await updateAuthProfileStoreWithLock({
		agentDir,
		updater: (freshStore) => {
			const profile = freshStore.profiles[profileId];
			if (!profile || resolveProviderIdForAuth(profile.provider) !== providerKey) return false;
			freshStore.lastGood = {
				...freshStore.lastGood,
				[providerKey]: profileId
			};
			return true;
		}
	});
	if (updated) {
		store.lastGood = updated.lastGood;
		return;
	}
	const profile = store.profiles[profileId];
	if (!profile || resolveProviderIdForAuth(profile.provider) !== providerKey) return;
	store.lastGood = {
		...store.lastGood,
		[providerKey]: profileId
	};
	saveAuthProfileStore(store, agentDir);
}
//#endregion
export { setAuthProfileOrder as a, removeProviderAuthProfilesWithLock as i, listProfilesForProvider as n, upsertAuthProfile as o, markAuthProfileGood as r, upsertAuthProfileWithLock as s, dedupeProfileIds as t };
