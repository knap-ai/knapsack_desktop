import "../../logger-kwZIqwuw.js";
import "../../paths-ViKUYWUK.js";
import "../../tmp-openclaw-dir-idKIOMmb.js";
import "../../theme-CdOoMzRk.js";
import "../../globals-DBUMOBZ8.js";
import "../../subsystem-DISldKSB.js";
import "../../ansi-BEJF8NKS.js";
import "../../boolean-C3GkJetE.js";
import "../../env-Dnra1IpT.js";
import "../../utils-CS0Ikux6.js";
import "../../agent-scope-bjWqU22i.js";
import "../../boundary-path-Dm0QJ7-y.js";
import "../../boundary-file-read-DcZxlWD8.js";
import "../../logger-BmpSCz93.js";
import "../../exec-B5_AYfQG.js";
import "../../workspace-D4K6QX9X.js";
import "../../model-selection-BnFtDmP7.js";
import { zt as resolveActiveTalkProviderConfig } from "../../io-y3Az_Onx.js";
import "../../shell-env-BOu7XeT_.js";
import "../../safe-text-yavot2qw.js";
import "../../version-CD3oP1-d.js";
import "../../env-substitution-O6uabUmO.js";
import "../../includes-Bj3eLUWH.js";
import "../../zod-schema.providers-core-COy5nBQ0.js";
import "../../legacy-web-search-BB-ZHEhz.js";
import "../../registry-C5UkPpaO.js";
import "../../config-state-Br0ucqMb.js";
import "../../min-host-version-RMBWtIAR.js";
import "../../manifest-registry-B5JNQdOM.js";
import "../../runtime-guard-PhQ6PwQa.js";
import "../../avatar-policy-B5nOfso_.js";
import "../../ip-Ce8EDTBZ.js";
import "../../zod-schema.agent-runtime-Dtg4Jy6G.js";
import "../../zod-schema.core-BuVz8Rk7.js";
import "../../config-D4zN4BRl.js";
import "../../message-channel-BliByQBl.js";
import "../../store-C5UK26Ce.js";
import "../../runtime-Iz8uZ7EU.js";
import "../../plugins-B09-vgme.js";
import "../../sessions-D9ZgHCHb.js";
import "../../paths-rhN9LKM_.js";
import "../../session-write-lock-va3qZE6f.js";
import "../../commands-C6oAw_H-.js";
import "../../issue-format-BtLIwOtN.js";
import { t as definePluginEntry } from "../../plugin-entry-B2shVOQl.js";
import "../../logging-CCTKg_fh.js";
import "../../config-runtime-BYNizC50.js";
//#region extensions/talk-voice/index.ts
function mask(s, keep = 6) {
	const trimmed = s.trim();
	if (trimmed.length <= keep) return "***";
	return `${trimmed.slice(0, keep)}…`;
}
function isLikelyVoiceId(value) {
	const v = value.trim();
	if (v.length < 10 || v.length > 64) return false;
	return /^[a-zA-Z0-9_-]+$/.test(v);
}
function resolveProviderLabel(providerId) {
	switch (providerId) {
		case "openai": return "OpenAI";
		case "microsoft": return "Microsoft";
		case "elevenlabs": return "ElevenLabs";
		default: return providerId;
	}
}
function formatVoiceMeta(voice) {
	const parts = [voice.locale, voice.gender];
	const personalities = voice.personalities?.filter((value) => value.trim().length > 0) ?? [];
	if (personalities.length > 0) parts.push(personalities.join(", "));
	const filtered = parts.filter((part) => Boolean(part?.trim()));
	return filtered.length > 0 ? filtered.join(" · ") : void 0;
}
function formatVoiceList(voices, limit, providerId) {
	const sliced = voices.slice(0, Math.max(1, Math.min(limit, 50)));
	const lines = [];
	lines.push(`${resolveProviderLabel(providerId)} voices: ${voices.length}`);
	lines.push("");
	for (const v of sliced) {
		const name = (v.name ?? "").trim() || "(unnamed)";
		const category = (v.category ?? "").trim();
		const meta = category ? ` · ${category}` : "";
		lines.push(`- ${name}${meta}`);
		lines.push(`  id: ${v.id}`);
		const details = formatVoiceMeta(v);
		if (details) lines.push(`  meta: ${details}`);
		const description = (v.description ?? "").trim();
		if (description) lines.push(`  note: ${description}`);
	}
	if (voices.length > sliced.length) {
		lines.push("");
		lines.push(`(showing first ${sliced.length})`);
	}
	return lines.join("\n");
}
function findVoice(voices, query) {
	const q = query.trim();
	if (!q) return null;
	const lower = q.toLowerCase();
	const byId = voices.find((v) => v.id === q);
	if (byId) return byId;
	const exactName = voices.find((v) => (v.name ?? "").trim().toLowerCase() === lower);
	if (exactName) return exactName;
	return voices.find((v) => (v.name ?? "").trim().toLowerCase().includes(lower)) ?? null;
}
function asTrimmedString(value) {
	return typeof value === "string" ? value.trim() : "";
}
function resolveCommandLabel(channel) {
	return channel === "discord" ? "/talkvoice" : "/voice";
}
function asProviderBaseUrl(value) {
	return asTrimmedString(value) || void 0;
}
var talk_voice_default = definePluginEntry({
	id: "talk-voice",
	name: "Talk Voice",
	description: "Command helpers for managing Talk voice configuration",
	register(api) {
		api.registerCommand({
			name: "voice",
			nativeNames: { discord: "talkvoice" },
			description: "List/set Talk provider voices (affects iOS Talk playback).",
			acceptsArgs: true,
			handler: async (ctx) => {
				const commandLabel = resolveCommandLabel(ctx.channel);
				const tokens = (ctx.args?.trim() ?? "").split(/\s+/).filter(Boolean);
				const action = (tokens[0] ?? "status").toLowerCase();
				const cfg = api.runtime.config.loadConfig();
				const active = resolveActiveTalkProviderConfig(cfg.talk);
				if (!active) return { text: "Talk voice is not configured.\n\nMissing: talk.provider and talk.providers.<provider>.\nSet it on the gateway, then retry." };
				const providerId = active.provider;
				const providerLabel = resolveProviderLabel(providerId);
				const apiKey = asTrimmedString(active.config.apiKey);
				const baseUrl = asProviderBaseUrl(active.config.baseUrl);
				const currentVoiceId = asTrimmedString(active.config.voiceId) || asTrimmedString(cfg.talk?.voiceId);
				if (action === "status") return { text: `Talk voice status:
- provider: ${providerId}\n- talk.voiceId: ${currentVoiceId ? currentVoiceId : "(unset)"}\n- ${providerId}.apiKey: ${apiKey ? mask(apiKey) : "(unset)"}` };
				if (action === "list") {
					const limit = Number.parseInt(tokens[1] ?? "12", 10);
					try {
						return { text: formatVoiceList(await api.runtime.tts.listVoices({
							provider: providerId,
							cfg,
							apiKey: apiKey || void 0,
							baseUrl
						}), Number.isFinite(limit) ? limit : 12, providerId) };
					} catch (error) {
						return { text: `${providerLabel} voice list failed: ${error instanceof Error ? error.message : String(error)}` };
					}
				}
				if (action === "set") {
					const query = tokens.slice(1).join(" ").trim();
					if (!query) return { text: `Usage: ${commandLabel} set <voiceId|name>` };
					let voices;
					try {
						voices = await api.runtime.tts.listVoices({
							provider: providerId,
							cfg,
							apiKey: apiKey || void 0,
							baseUrl
						});
					} catch (error) {
						return { text: `${providerLabel} voice lookup failed: ${error instanceof Error ? error.message : String(error)}` };
					}
					const chosen = findVoice(voices, query);
					if (!chosen) return { text: `No voice found for ${isLikelyVoiceId(query) ? query : `"${query}"`}. Try: ${commandLabel} list` };
					const nextConfig = {
						...cfg,
						talk: {
							...cfg.talk,
							provider: providerId,
							providers: {
								...cfg.talk?.providers ?? {},
								[providerId]: {
									...cfg.talk?.providers?.[providerId] ?? {},
									voiceId: chosen.id
								}
							},
							...providerId === "elevenlabs" ? { voiceId: chosen.id } : {}
						}
					};
					await api.runtime.config.writeConfigFile(nextConfig);
					return { text: `✅ ${providerLabel} Talk voice set to ${(chosen.name ?? "").trim() || "(unnamed)"}\n${chosen.id}` };
				}
				return { text: [
					"Voice commands:",
					"",
					`${commandLabel} status`,
					`${commandLabel} list [limit]`,
					`${commandLabel} set <voiceId|name>`
				].join("\n") };
			}
		});
	}
});
//#endregion
export { talk_voice_default as default };
