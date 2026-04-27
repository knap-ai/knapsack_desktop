import { r as listChannelPlugins } from "./registry-B2TRwbJD.js";
import "./plugins-BZ_I3cWH.js";
//#region src/infra/channels-status-issues.ts
function collectChannelStatusIssues(payload) {
	const issues = [];
	const accountsByChannel = payload.channelAccounts;
	for (const plugin of listChannelPlugins()) {
		const collect = plugin.status?.collectStatusIssues;
		if (!collect) continue;
		const raw = accountsByChannel?.[plugin.id];
		if (!Array.isArray(raw)) continue;
		issues.push(...collect(raw));
	}
	return issues;
}
//#endregion
export { collectChannelStatusIssues as t };
