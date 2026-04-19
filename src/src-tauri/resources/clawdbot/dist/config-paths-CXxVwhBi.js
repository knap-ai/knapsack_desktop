//#region src/plugin-sdk/config-paths.ts
/** Resolve the config path prefix for a channel account, falling back to the root channel section. */
function resolveChannelAccountConfigBasePath(params) {
	const accounts = (params.cfg.channels?.[params.channelKey])?.accounts;
	return Boolean(accounts?.[params.accountId]) ? `channels.${params.channelKey}.accounts.${params.accountId}.` : `channels.${params.channelKey}.`;
}
//#endregion
export { resolveChannelAccountConfigBasePath as t };
