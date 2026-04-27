import { a as normalizeLowercaseStringOrEmpty } from "./string-coerce-C1IzJjqi.js";
import { r as callGateway } from "./call-Gv9tybWD.js";
import { r as stripToolMessages } from "./chat-history-text-Di3xj5tF.js";
import { i as formatRunLabel } from "./subagents-format-Cqhgw9EJ.js";
import { c as resolveSubagentEntryForToken, r as formatLogLines, u as stopWithText } from "./shared-DOdpx7Ch.js";
//#region src/auto-reply/reply/commands-subagents/action-log.ts
async function handleSubagentsLogAction(ctx) {
	const { runs, restTokens } = ctx;
	const target = restTokens[0];
	if (!target) return stopWithText("📜 Usage: /subagents log <id|#> [limit]");
	const includeTools = restTokens.some((token) => normalizeLowercaseStringOrEmpty(token) === "tools");
	const limitToken = restTokens.find((token) => /^\d+$/.test(token));
	const limit = limitToken ? Math.min(200, Math.max(1, Number.parseInt(limitToken, 10))) : 20;
	const targetResolution = resolveSubagentEntryForToken(runs, target);
	if ("reply" in targetResolution) return targetResolution.reply;
	const history = await callGateway({
		method: "chat.history",
		params: {
			sessionKey: targetResolution.entry.childSessionKey,
			limit
		}
	});
	const rawMessages = Array.isArray(history?.messages) ? history.messages : [];
	const lines = formatLogLines(includeTools ? rawMessages : stripToolMessages(rawMessages));
	const header = `📜 Subagent log: ${formatRunLabel(targetResolution.entry)}`;
	if (lines.length === 0) return stopWithText(`${header}\n(no messages)`);
	return stopWithText([header, ...lines].join("\n"));
}
//#endregion
export { handleSubagentsLogAction };
