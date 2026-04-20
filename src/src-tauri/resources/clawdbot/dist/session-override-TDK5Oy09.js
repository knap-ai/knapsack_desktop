import { r as normalizeProviderId } from "./provider-id-KaStHhRz.js";
import { t as hasAnyAuthProfileStoreSource } from "./source-check-D7Bxh6-e.js";
import { n as ensureAuthProfileStore } from "./store-C1I9Mkh8.js";
import "./model-selection-CTdyYoio.js";
import { n as resolveAuthProfileOrder, s as isProfileInCooldown } from "./order-t2w38pFY.js";
//#region src/agents/auth-profiles/session-override.ts
let sessionStoreRuntimePromise;
function loadSessionStoreRuntime() {
	sessionStoreRuntimePromise ??= import("./store.runtime-Cz_llyv3.js");
	return sessionStoreRuntimePromise;
}
function isProfileForProvider(params) {
	const entry = params.store.profiles[params.profileId];
	if (!entry?.provider) return false;
	return normalizeProviderId(entry.provider) === normalizeProviderId(params.provider);
}
async function clearSessionAuthProfileOverride(params) {
	const { sessionEntry, sessionStore, sessionKey, storePath } = params;
	delete sessionEntry.authProfileOverride;
	delete sessionEntry.authProfileOverrideSource;
	delete sessionEntry.authProfileOverrideCompactionCount;
	sessionEntry.updatedAt = Date.now();
	sessionStore[sessionKey] = sessionEntry;
	if (storePath) await (await loadSessionStoreRuntime()).updateSessionStore(storePath, (store) => {
		store[sessionKey] = sessionEntry;
	});
}
async function resolveSessionAuthProfileOverride(params) {
	const { cfg, provider, agentDir, sessionEntry, sessionStore, sessionKey, storePath, isNewSession } = params;
	if (!sessionEntry || !sessionStore || !sessionKey) return sessionEntry?.authProfileOverride;
	const hasConfiguredAuthProfiles = Boolean(params.cfg.auth?.profiles && Object.keys(params.cfg.auth.profiles).length > 0) || Boolean(params.cfg.auth?.order && Object.keys(params.cfg.auth.order).length > 0);
	if (!sessionEntry.authProfileOverride?.trim() && !hasConfiguredAuthProfiles && !hasAnyAuthProfileStoreSource(agentDir)) return;
	const store = ensureAuthProfileStore(agentDir, { allowKeychainPrompt: false });
	const order = resolveAuthProfileOrder({
		cfg,
		store,
		provider
	});
	let current = sessionEntry.authProfileOverride?.trim();
	const source = sessionEntry.authProfileOverrideSource ?? (typeof sessionEntry.authProfileOverrideCompactionCount === "number" ? "auto" : current ? "user" : void 0);
	if (current && !store.profiles[current]) {
		await clearSessionAuthProfileOverride({
			sessionEntry,
			sessionStore,
			sessionKey,
			storePath
		});
		current = void 0;
	}
	if (current && !isProfileForProvider({
		provider,
		profileId: current,
		store
	})) {
		await clearSessionAuthProfileOverride({
			sessionEntry,
			sessionStore,
			sessionKey,
			storePath
		});
		current = void 0;
	}
	if (current && order.length > 0 && !order.includes(current) && source !== "user") {
		await clearSessionAuthProfileOverride({
			sessionEntry,
			sessionStore,
			sessionKey,
			storePath
		});
		current = void 0;
	}
	if (order.length === 0) return;
	const pickFirstAvailable = () => order.find((profileId) => !isProfileInCooldown(store, profileId)) ?? order[0];
	const pickNextAvailable = (active) => {
		const startIndex = order.indexOf(active);
		if (startIndex < 0) return pickFirstAvailable();
		for (let offset = 1; offset <= order.length; offset += 1) {
			const candidate = order[(startIndex + offset) % order.length];
			if (!isProfileInCooldown(store, candidate)) return candidate;
		}
		return order[startIndex] ?? order[0];
	};
	const compactionCount = sessionEntry.compactionCount ?? 0;
	const storedCompaction = typeof sessionEntry.authProfileOverrideCompactionCount === "number" ? sessionEntry.authProfileOverrideCompactionCount : compactionCount;
	if (source === "user" && current && !isNewSession) return current;
	let next = current;
	if (isNewSession) next = current ? pickNextAvailable(current) : pickFirstAvailable();
	else if (current && compactionCount > storedCompaction) next = pickNextAvailable(current);
	else if (!current || isProfileInCooldown(store, current)) next = pickFirstAvailable();
	if (!next) return current;
	if (next !== sessionEntry.authProfileOverride || sessionEntry.authProfileOverrideSource !== "auto" || sessionEntry.authProfileOverrideCompactionCount !== compactionCount) {
		sessionEntry.authProfileOverride = next;
		sessionEntry.authProfileOverrideSource = "auto";
		sessionEntry.authProfileOverrideCompactionCount = compactionCount;
		sessionEntry.updatedAt = Date.now();
		sessionStore[sessionKey] = sessionEntry;
		if (storePath) await (await loadSessionStoreRuntime()).updateSessionStore(storePath, (store) => {
			store[sessionKey] = sessionEntry;
		});
	}
	return next;
}
//#endregion
export { resolveSessionAuthProfileOverride as n, clearSessionAuthProfileOverride as t };
