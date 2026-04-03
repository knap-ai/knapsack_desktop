import { t as getChannelPlugin } from "./registry-fiJfPVib.js";
//#region src/channels/read-only-account-inspect.ts
async function inspectReadOnlyChannelAccount(params) {
	const inspectAccount = getChannelPlugin(params.channelId)?.config.inspectAccount;
	if (!inspectAccount) return null;
	return await Promise.resolve(inspectAccount(params.cfg, params.accountId));
}
//#endregion
export { inspectReadOnlyChannelAccount as t };
