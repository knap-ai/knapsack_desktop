import { s as wrapExternalContent } from "./external-content-CoIROwJI.js";
import { n as buildUntrustedChannelMetadata } from "./security-runtime-DCa00BFS.js";
import { f as resolveDiscordOwnerAllowFrom } from "./allow-list-qE0AJ4XV.js";
//#region extensions/discord/src/monitor/inbound-context.ts
function buildDiscordGroupSystemPrompt(channelConfig) {
	const systemPromptParts = [channelConfig?.systemPrompt?.trim() || null].filter((entry) => Boolean(entry));
	return systemPromptParts.length > 0 ? systemPromptParts.join("\n\n") : void 0;
}
function buildDiscordUntrustedContext(params) {
	if (!params.isGuild) return;
	const entries = [buildUntrustedChannelMetadata({
		source: "discord",
		label: "Discord channel topic",
		entries: [params.channelTopic]
	}), typeof params.messageBody === "string" && params.messageBody.trim().length > 0 ? wrapExternalContent(`UNTRUSTED Discord message body\n${params.messageBody.trim()}`, {
		source: "unknown",
		includeWarning: false
	}) : void 0].filter((entry) => Boolean(entry));
	return entries.length > 0 ? entries : void 0;
}
function buildDiscordInboundAccessContext(params) {
	return {
		groupSystemPrompt: params.isGuild ? buildDiscordGroupSystemPrompt(params.channelConfig) : void 0,
		untrustedContext: buildDiscordUntrustedContext({
			isGuild: params.isGuild,
			channelTopic: params.channelTopic,
			messageBody: params.messageBody
		}),
		ownerAllowFrom: resolveDiscordOwnerAllowFrom({
			channelConfig: params.channelConfig,
			guildInfo: params.guildInfo,
			sender: params.sender,
			allowNameMatching: params.allowNameMatching
		})
	};
}
//#endregion
export { buildDiscordInboundAccessContext as n, buildDiscordGroupSystemPrompt as t };
