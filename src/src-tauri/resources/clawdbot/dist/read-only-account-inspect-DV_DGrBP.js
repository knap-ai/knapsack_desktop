import { t as getBundledChannelAccountInspector } from "./bundled-Bd4FvHUg.js";
import { n as getLoadedChannelPlugin } from "./registry-B2TRwbJD.js";
//#region src/channels/read-only-account-inspect.ts
async function inspectReadOnlyChannelAccount(params) {
	const inspectAccount = getLoadedChannelPlugin(params.channelId)?.config.inspectAccount ?? getBundledChannelAccountInspector(params.channelId);
	if (!inspectAccount) return null;
	return await Promise.resolve(inspectAccount(params.cfg, params.accountId));
}
//#endregion
export { inspectReadOnlyChannelAccount as t };
