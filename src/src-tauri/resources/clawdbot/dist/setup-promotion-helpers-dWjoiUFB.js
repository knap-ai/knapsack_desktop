import { c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
import { n as normalizeAccountId, t as DEFAULT_ACCOUNT_ID } from "./account-id-DhSD7lhD.js";
import { n as getBundledChannelPlugin, o as hasBundledChannelPackageSetupFeature } from "./bundled-CAfVQCWF.js";
import { n as getLoadedChannelPlugin } from "./registry-yTN80EXi.js";
//#region src/channels/plugins/setup-promotion-helpers.ts
const COMMON_SINGLE_ACCOUNT_KEYS_TO_MOVE = new Set([
	"name",
	"token",
	"tokenFile",
	"botToken",
	"appToken",
	"account",
	"signalNumber",
	"authDir",
	"cliPath",
	"dbPath",
	"httpUrl",
	"httpHost",
	"httpPort",
	"webhookPath",
	"webhookUrl",
	"webhookSecret",
	"service",
	"region",
	"homeserver",
	"userId",
	"accessToken",
	"password",
	"deviceName",
	"url",
	"code",
	"dmPolicy",
	"allowFrom",
	"groupPolicy",
	"groupAllowFrom",
	"defaultTo"
]);
function asPromotionSurface(setup) {
	return setup && typeof setup === "object" ? setup : null;
}
function getLoadedChannelSetupPromotionSurface(channelKey) {
	return asPromotionSurface(getLoadedChannelPlugin(channelKey)?.setup);
}
function getBundledChannelSetupPromotionSurface(channelKey) {
	if (!hasBundledChannelPackageSetupFeature(channelKey, "configPromotion")) return null;
	return asPromotionSurface(getBundledChannelPlugin(channelKey)?.setup);
}
function isStaticSingleAccountPromotionKey(key) {
	return COMMON_SINGLE_ACCOUNT_KEYS_TO_MOVE.has(key);
}
function resolveSingleAccountKeysToMove(params) {
	const hasNamedAccounts = Object.keys(params.channel.accounts ?? {}).some(Boolean);
	const entries = Object.entries(params.channel).filter(([key, value]) => key !== "accounts" && key !== "defaultAccount" && key !== "enabled" && value !== void 0).map(([key]) => key);
	if (entries.length === 0) return [];
	let loadedSetupSurface;
	const resolveLoadedSetupSurface = () => {
		loadedSetupSurface ??= getLoadedChannelSetupPromotionSurface(params.channelKey);
		return loadedSetupSurface;
	};
	let bundledSetupSurface;
	const resolveBundledSetupSurface = () => {
		bundledSetupSurface ??= getBundledChannelSetupPromotionSurface(params.channelKey);
		return bundledSetupSurface;
	};
	const keysToMove = entries.filter((key) => {
		if (isStaticSingleAccountPromotionKey(key)) return true;
		return Boolean(resolveLoadedSetupSurface()?.singleAccountKeysToMove?.includes(key) || resolveBundledSetupSurface()?.singleAccountKeysToMove?.includes(key));
	});
	if (!hasNamedAccounts || keysToMove.length === 0) return keysToMove;
	const namedAccountPromotionKeys = resolveLoadedSetupSurface()?.namedAccountPromotionKeys ?? resolveBundledSetupSurface()?.namedAccountPromotionKeys;
	if (!namedAccountPromotionKeys) return keysToMove;
	return keysToMove.filter((key) => namedAccountPromotionKeys.includes(key));
}
function resolveSingleAccountPromotionTarget(params) {
	const accounts = params.channel.accounts ?? {};
	const resolveExistingAccountId = (targetAccountId) => {
		const normalizedTargetAccountId = normalizeAccountId(targetAccountId);
		return Object.keys(accounts).find((accountId) => normalizeAccountId(accountId) === normalizedTargetAccountId) ?? normalizedTargetAccountId;
	};
	const loadedSurface = getLoadedChannelSetupPromotionSurface(params.channelKey);
	const bundledSurface = loadedSurface?.resolveSingleAccountPromotionTarget ? void 0 : getBundledChannelSetupPromotionSurface(params.channelKey);
	const resolved = (loadedSurface?.resolveSingleAccountPromotionTarget ?? bundledSurface?.resolveSingleAccountPromotionTarget)?.({ channel: params.channel });
	const normalizedResolved = normalizeOptionalString(resolved);
	if (normalizedResolved) return resolveExistingAccountId(normalizedResolved);
	return resolveExistingAccountId(DEFAULT_ACCOUNT_ID);
}
//#endregion
export { resolveSingleAccountPromotionTarget as n, resolveSingleAccountKeysToMove as t };
