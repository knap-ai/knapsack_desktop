import { t as DEFAULT_ACCOUNT_ID } from "./session-key-BWxPj0z_.js";

//#region src/channels/plugins/helpers.ts
function resolveChannelDefaultAccountId(params) {
	const accountIds = params.accountIds ?? params.plugin.config.listAccountIds(params.cfg);
	return params.plugin.config.defaultAccountId?.(params.cfg) ?? accountIds[0] ?? DEFAULT_ACCOUNT_ID;
}

//#endregion
export { resolveChannelDefaultAccountId as t };