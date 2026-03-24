import { _ as normalizeAccountId } from "./session-key-DAhnzjyr.js";
import { a as getMatrixRuntime } from "./credentials-read-BLFr7diG.js";
import { et as resolveMatrixConfigPath, tt as updateMatrixAccountConfig } from "./send-C-3t8GKS.js";
import { y as withResolvedActionClient } from "./verification-BeSB_N0Z.js";
import { t as syncMatrixOwnProfile } from "./profile-BMjCtAqv.js";
//#region extensions/matrix/src/matrix/actions/profile.ts
async function updateMatrixOwnProfile(opts = {}) {
	const displayName = opts.displayName?.trim();
	const avatarUrl = opts.avatarUrl?.trim();
	const avatarPath = opts.avatarPath?.trim();
	const runtime = getMatrixRuntime();
	return await withResolvedActionClient(opts, async (client) => {
		return await syncMatrixOwnProfile({
			client,
			userId: await client.getUserId(),
			displayName: displayName || void 0,
			avatarUrl: avatarUrl || void 0,
			avatarPath: avatarPath || void 0,
			loadAvatarFromUrl: async (url, maxBytes) => await runtime.media.loadWebMedia(url, maxBytes),
			loadAvatarFromPath: async (path, maxBytes) => await runtime.media.loadWebMedia(path, {
				maxBytes,
				localRoots: opts.mediaLocalRoots
			})
		});
	}, "persist");
}
//#endregion
//#region extensions/matrix/src/profile-update.ts
async function applyMatrixProfileUpdate(params) {
	const runtime = getMatrixRuntime();
	const persistedCfg = runtime.config.loadConfig();
	const accountId = normalizeAccountId(params.account);
	const displayName = params.displayName?.trim() || null;
	const avatarUrl = params.avatarUrl?.trim() || null;
	const avatarPath = params.avatarPath?.trim() || null;
	if (!displayName && !avatarUrl && !avatarPath) throw new Error("Provide name/displayName and/or avatarUrl/avatarPath.");
	const synced = await updateMatrixOwnProfile({
		cfg: params.cfg,
		accountId,
		displayName: displayName ?? void 0,
		avatarUrl: avatarUrl ?? void 0,
		avatarPath: avatarPath ?? void 0,
		mediaLocalRoots: params.mediaLocalRoots
	});
	const persistedAvatarUrl = synced.uploadedAvatarSource && synced.resolvedAvatarUrl ? synced.resolvedAvatarUrl : avatarUrl;
	const updated = updateMatrixAccountConfig(persistedCfg, accountId, {
		name: displayName ?? void 0,
		avatarUrl: persistedAvatarUrl ?? void 0
	});
	await runtime.config.writeConfigFile(updated);
	return {
		accountId,
		displayName,
		avatarUrl: persistedAvatarUrl ?? null,
		profile: {
			displayNameUpdated: synced.displayNameUpdated,
			avatarUpdated: synced.avatarUpdated,
			resolvedAvatarUrl: synced.resolvedAvatarUrl,
			uploadedAvatarSource: synced.uploadedAvatarSource,
			convertedAvatarFromHttp: synced.convertedAvatarFromHttp
		},
		configPath: resolveMatrixConfigPath(updated, accountId)
	};
}
//#endregion
export { updateMatrixOwnProfile as n, applyMatrixProfileUpdate as t };
