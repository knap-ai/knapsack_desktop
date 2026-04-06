import { a as createDeviceControlCard, i as createAppleTvRemoteCard, o as createEventCard, r as createAgendaCard, u as createMediaPlayerCard } from "./line-surface-uW5kuJS3.js";
import "./line-DumZay8v.js";
import { a as isSilentReplyText, o as stripSilentToken, r as isSilentReplyPayloadText } from "./tokens-Bot0VGKf.js";
import { a as stripHeartbeatToken } from "./heartbeat-CguHGkad.js";
import { P as sanitizeUserFacingText } from "./pi-embedded-helpers-CGU2Pfj9.js";
import { i as hasReplyPayloadContent } from "./payload-CLtYAQwf.js";
import { n as resolveResponsePrefixTemplate } from "./response-prefix-template-Bz3uIAH1.js";
//#region src/auto-reply/reply/line-directives.ts
/**
* Parse LINE-specific directives from text and extract them into ReplyPayload fields.
*
* Supported directives:
* - [[quick_replies: option1, option2, option3]]
* - [[location: title | address | latitude | longitude]]
* - [[confirm: question | yes_label | no_label]]
* - [[buttons: title | text | btn1:data1, btn2:data2]]
* - [[media_player: title | artist | source | imageUrl | playing/paused]]
* - [[event: title | date | time | location | description]]
* - [[agenda: title | event1_title:event1_time, event2_title:event2_time, ...]]
* - [[device: name | type | status | ctrl1:data1, ctrl2:data2]]
* - [[appletv_remote: name | status]]
*
* Returns the modified payload with directives removed from text and fields populated.
*/
function parseLineDirectives(payload) {
	let text = payload.text;
	if (!text) return payload;
	const result = { ...payload };
	const lineData = { ...result.channelData?.line };
	const toSlug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "device";
	const lineActionData = (action, extras) => {
		const base = [`line.action=${encodeURIComponent(action)}`];
		if (extras) for (const [key, value] of Object.entries(extras)) base.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
		return base.join("&");
	};
	const quickRepliesMatch = text.match(/\[\[quick_replies:\s*([^\]]+)\]\]/i);
	if (quickRepliesMatch) {
		const options = quickRepliesMatch[1].split(",").map((s) => s.trim()).filter(Boolean);
		if (options.length > 0) lineData.quickReplies = [...lineData.quickReplies || [], ...options];
		text = text.replace(quickRepliesMatch[0], "").trim();
	}
	const locationMatch = text.match(/\[\[location:\s*([^\]]+)\]\]/i);
	if (locationMatch && !lineData.location) {
		const parts = locationMatch[1].split("|").map((s) => s.trim());
		if (parts.length >= 4) {
			const [title, address, latStr, lonStr] = parts;
			const latitude = parseFloat(latStr);
			const longitude = parseFloat(lonStr);
			if (!isNaN(latitude) && !isNaN(longitude)) lineData.location = {
				title: title || "Location",
				address: address || "",
				latitude,
				longitude
			};
		}
		text = text.replace(locationMatch[0], "").trim();
	}
	const confirmMatch = text.match(/\[\[confirm:\s*([^\]]+)\]\]/i);
	if (confirmMatch && !lineData.templateMessage) {
		const parts = confirmMatch[1].split("|").map((s) => s.trim());
		if (parts.length >= 3) {
			const [question, yesPart, noPart] = parts;
			const [yesLabel, yesData] = yesPart.includes(":") ? yesPart.split(":").map((s) => s.trim()) : [yesPart, yesPart.toLowerCase()];
			const [noLabel, noData] = noPart.includes(":") ? noPart.split(":").map((s) => s.trim()) : [noPart, noPart.toLowerCase()];
			lineData.templateMessage = {
				type: "confirm",
				text: question,
				confirmLabel: yesLabel,
				confirmData: yesData,
				cancelLabel: noLabel,
				cancelData: noData,
				altText: question
			};
		}
		text = text.replace(confirmMatch[0], "").trim();
	}
	const buttonsMatch = text.match(/\[\[buttons:\s*([^\]]+)\]\]/i);
	if (buttonsMatch && !lineData.templateMessage) {
		const parts = buttonsMatch[1].split("|").map((s) => s.trim());
		if (parts.length >= 3) {
			const [title, bodyText, actionsStr] = parts;
			const actions = actionsStr.split(",").map((actionStr) => {
				const trimmed = actionStr.trim();
				const colonIndex = (() => {
					const index = trimmed.indexOf(":");
					if (index === -1) return -1;
					const lower = trimmed.toLowerCase();
					if (lower.startsWith("http://") || lower.startsWith("https://")) return -1;
					return index;
				})();
				let label;
				let data;
				if (colonIndex === -1) {
					label = trimmed;
					data = trimmed;
				} else {
					label = trimmed.slice(0, colonIndex).trim();
					data = trimmed.slice(colonIndex + 1).trim();
				}
				if (data.startsWith("http://") || data.startsWith("https://")) return {
					type: "uri",
					label,
					uri: data
				};
				if (data.includes("=")) return {
					type: "postback",
					label,
					data
				};
				return {
					type: "message",
					label,
					data: data || label
				};
			});
			if (actions.length > 0) lineData.templateMessage = {
				type: "buttons",
				title,
				text: bodyText,
				actions: actions.slice(0, 4),
				altText: `${title}: ${bodyText}`
			};
		}
		text = text.replace(buttonsMatch[0], "").trim();
	}
	const mediaPlayerMatch = text.match(/\[\[media_player:\s*([^\]]+)\]\]/i);
	if (mediaPlayerMatch && !lineData.flexMessage) {
		const parts = mediaPlayerMatch[1].split("|").map((s) => s.trim());
		if (parts.length >= 1) {
			const [title, artist, source, imageUrl, statusStr] = parts;
			const isPlaying = statusStr?.toLowerCase() === "playing";
			const validImageUrl = imageUrl?.startsWith("https://") ? imageUrl : void 0;
			const deviceKey = toSlug(source || title || "media");
			const card = createMediaPlayerCard({
				title: title || "Unknown Track",
				subtitle: artist || void 0,
				source: source || void 0,
				imageUrl: validImageUrl,
				isPlaying: statusStr ? isPlaying : void 0,
				controls: {
					previous: { data: lineActionData("previous", { "line.device": deviceKey }) },
					play: { data: lineActionData("play", { "line.device": deviceKey }) },
					pause: { data: lineActionData("pause", { "line.device": deviceKey }) },
					next: { data: lineActionData("next", { "line.device": deviceKey }) }
				}
			});
			lineData.flexMessage = {
				altText: `🎵 ${title}${artist ? ` - ${artist}` : ""}`,
				contents: card
			};
		}
		text = text.replace(mediaPlayerMatch[0], "").trim();
	}
	const eventMatch = text.match(/\[\[event:\s*([^\]]+)\]\]/i);
	if (eventMatch && !lineData.flexMessage) {
		const parts = eventMatch[1].split("|").map((s) => s.trim());
		if (parts.length >= 2) {
			const [title, date, time, location, description] = parts;
			const card = createEventCard({
				title: title || "Event",
				date: date || "TBD",
				time: time || void 0,
				location: location || void 0,
				description: description || void 0
			});
			lineData.flexMessage = {
				altText: `📅 ${title} - ${date}${time ? ` ${time}` : ""}`,
				contents: card
			};
		}
		text = text.replace(eventMatch[0], "").trim();
	}
	const appleTvMatch = text.match(/\[\[appletv_remote:\s*([^\]]+)\]\]/i);
	if (appleTvMatch && !lineData.flexMessage) {
		const parts = appleTvMatch[1].split("|").map((s) => s.trim());
		if (parts.length >= 1) {
			const [deviceName, status] = parts;
			const deviceKey = toSlug(deviceName || "apple_tv");
			const card = createAppleTvRemoteCard({
				deviceName: deviceName || "Apple TV",
				status: status || void 0,
				actionData: {
					up: lineActionData("up", { "line.device": deviceKey }),
					down: lineActionData("down", { "line.device": deviceKey }),
					left: lineActionData("left", { "line.device": deviceKey }),
					right: lineActionData("right", { "line.device": deviceKey }),
					select: lineActionData("select", { "line.device": deviceKey }),
					menu: lineActionData("menu", { "line.device": deviceKey }),
					home: lineActionData("home", { "line.device": deviceKey }),
					play: lineActionData("play", { "line.device": deviceKey }),
					pause: lineActionData("pause", { "line.device": deviceKey }),
					volumeUp: lineActionData("volume_up", { "line.device": deviceKey }),
					volumeDown: lineActionData("volume_down", { "line.device": deviceKey }),
					mute: lineActionData("mute", { "line.device": deviceKey })
				}
			});
			lineData.flexMessage = {
				altText: `📺 ${deviceName || "Apple TV"} Remote`,
				contents: card
			};
		}
		text = text.replace(appleTvMatch[0], "").trim();
	}
	const agendaMatch = text.match(/\[\[agenda:\s*([^\]]+)\]\]/i);
	if (agendaMatch && !lineData.flexMessage) {
		const parts = agendaMatch[1].split("|").map((s) => s.trim());
		if (parts.length >= 2) {
			const [title, eventsStr] = parts;
			const events = eventsStr.split(",").map((eventStr) => {
				const trimmed = eventStr.trim();
				const colonIdx = trimmed.lastIndexOf(":");
				if (colonIdx > 0) return {
					title: trimmed.slice(0, colonIdx).trim(),
					time: trimmed.slice(colonIdx + 1).trim()
				};
				return { title: trimmed };
			});
			const card = createAgendaCard({
				title: title || "Agenda",
				events
			});
			lineData.flexMessage = {
				altText: `📋 ${title} (${events.length} events)`,
				contents: card
			};
		}
		text = text.replace(agendaMatch[0], "").trim();
	}
	const deviceMatch = text.match(/\[\[device:\s*([^\]]+)\]\]/i);
	if (deviceMatch && !lineData.flexMessage) {
		const parts = deviceMatch[1].split("|").map((s) => s.trim());
		if (parts.length >= 1) {
			const [deviceName, deviceType, status, controlsStr] = parts;
			const deviceKey = toSlug(deviceName || "device");
			const controls = controlsStr ? controlsStr.split(",").map((ctrlStr) => {
				const [label, data] = ctrlStr.split(":").map((s) => s.trim());
				return {
					label,
					data: lineActionData(data || label.toLowerCase().replace(/\s+/g, "_"), { "line.device": deviceKey })
				};
			}) : [];
			const card = createDeviceControlCard({
				deviceName: deviceName || "Device",
				deviceType: deviceType || void 0,
				status: status || void 0,
				controls
			});
			lineData.flexMessage = {
				altText: `📱 ${deviceName}${status ? `: ${status}` : ""}`,
				contents: card
			};
		}
		text = text.replace(deviceMatch[0], "").trim();
	}
	text = text.replace(/\n{3,}/g, "\n\n").trim();
	result.text = text || void 0;
	if (Object.keys(lineData).length > 0) result.channelData = {
		...result.channelData,
		line: lineData
	};
	return result;
}
/**
* Check if text contains any LINE directives
*/
function hasLineDirectives(text) {
	return /\[\[(quick_replies|location|confirm|buttons|media_player|event|agenda|device|appletv_remote):/i.test(text);
}
//#endregion
//#region src/auto-reply/reply/slack-directives.ts
const SLACK_BUTTON_MAX_ITEMS = 5;
const SLACK_SELECT_MAX_ITEMS = 100;
const SLACK_DIRECTIVE_RE = /\[\[(slack_buttons|slack_select):\s*([^\]]+)\]\]/gi;
const SLACK_OPTIONS_LINE_RE = /^\s*Options:\s*(.+?)\s*\.?\s*$/i;
const SLACK_AUTO_SELECT_MAX_ITEMS = 12;
const SLACK_SIMPLE_OPTION_RE = /^[a-z0-9][a-z0-9 _+/-]{0,31}$/i;
function parseChoice(raw, options) {
	const trimmed = raw.trim();
	if (!trimmed) return null;
	const delimiter = trimmed.indexOf(":");
	if (delimiter === -1) return {
		label: trimmed,
		value: trimmed
	};
	const label = trimmed.slice(0, delimiter).trim();
	let value = trimmed.slice(delimiter + 1).trim();
	if (!label || !value) return null;
	let style;
	if (options?.allowStyle) {
		const styleDelimiter = value.lastIndexOf(":");
		if (styleDelimiter !== -1) {
			const maybeStyle = value.slice(styleDelimiter + 1).trim().toLowerCase();
			if (maybeStyle === "primary" || maybeStyle === "secondary" || maybeStyle === "success" || maybeStyle === "danger") {
				const unstyledValue = value.slice(0, styleDelimiter).trim();
				if (unstyledValue) {
					value = unstyledValue;
					style = maybeStyle;
				}
			}
		}
	}
	return style ? {
		label,
		value,
		style
	} : {
		label,
		value
	};
}
function parseChoices(raw, maxItems, options) {
	return raw.split(",").map((entry) => parseChoice(entry, options)).filter((entry) => Boolean(entry)).slice(0, maxItems);
}
function buildTextBlock(text) {
	const trimmed = text.trim();
	if (!trimmed) return null;
	return {
		type: "text",
		text: trimmed
	};
}
function buildButtonsBlock(raw) {
	const choices = parseChoices(raw, SLACK_BUTTON_MAX_ITEMS, { allowStyle: true });
	if (choices.length === 0) return null;
	return {
		type: "buttons",
		buttons: choices.map((choice) => ({
			label: choice.label,
			value: choice.value,
			...choice.style ? { style: choice.style } : {}
		}))
	};
}
function buildSelectBlock(raw) {
	const parts = raw.split("|").map((entry) => entry.trim()).filter(Boolean);
	if (parts.length === 0) return null;
	const [first, second] = parts;
	const placeholder = parts.length >= 2 ? first : "Choose an option";
	const choices = parseChoices(parts.length >= 2 ? second : first, SLACK_SELECT_MAX_ITEMS);
	if (choices.length === 0) return null;
	return {
		type: "select",
		placeholder,
		options: choices
	};
}
function hasSlackDirectives(text) {
	SLACK_DIRECTIVE_RE.lastIndex = 0;
	return SLACK_DIRECTIVE_RE.test(text);
}
function parseSlackDirectives(payload) {
	const text = payload.text;
	if (!text) return payload;
	const generatedBlocks = [];
	const visibleTextParts = [];
	let cursor = 0;
	let matchedDirective = false;
	let generatedInteractiveBlock = false;
	SLACK_DIRECTIVE_RE.lastIndex = 0;
	for (const match of text.matchAll(SLACK_DIRECTIVE_RE)) {
		matchedDirective = true;
		const matchText = match[0];
		const directiveType = match[1];
		const body = match[2];
		const index = match.index ?? 0;
		const precedingText = text.slice(cursor, index);
		visibleTextParts.push(precedingText);
		const section = buildTextBlock(precedingText);
		if (section) generatedBlocks.push(section);
		const block = directiveType.toLowerCase() === "slack_buttons" ? buildButtonsBlock(body) : buildSelectBlock(body);
		if (block) {
			generatedInteractiveBlock = true;
			generatedBlocks.push(block);
		}
		cursor = index + matchText.length;
	}
	const trailingText = text.slice(cursor);
	visibleTextParts.push(trailingText);
	const trailingSection = buildTextBlock(trailingText);
	if (trailingSection) generatedBlocks.push(trailingSection);
	const cleanedText = visibleTextParts.join("");
	if (!matchedDirective || !generatedInteractiveBlock) return payload;
	return {
		...payload,
		text: cleanedText.trim() || void 0,
		interactive: { blocks: [...payload.interactive?.blocks ?? [], ...generatedBlocks] }
	};
}
function hasSlackBlocks(payload) {
	const blocks = (payload.channelData?.slack)?.blocks;
	if (typeof blocks === "string") return blocks.trim().length > 0;
	return Array.isArray(blocks) && blocks.length > 0;
}
function parseSimpleSlackOptions(raw) {
	const entries = raw.split(",").map((entry) => entry.trim()).filter(Boolean);
	if (entries.length < 2 || entries.length > SLACK_AUTO_SELECT_MAX_ITEMS) return null;
	if (!entries.every((entry) => SLACK_SIMPLE_OPTION_RE.test(entry))) return null;
	if (new Set(entries.map((entry) => entry.toLowerCase())).size !== entries.length) return null;
	return entries.map((entry) => ({
		label: entry,
		value: entry
	}));
}
function parseSlackOptionsLine(payload) {
	const text = payload.text;
	if (!text || payload.interactive?.blocks?.length || hasSlackBlocks(payload)) return payload;
	const lines = text.split("\n");
	const lastNonEmptyIndex = [...lines.keys()].toReversed().find((index) => lines[index]?.trim());
	if (lastNonEmptyIndex == null) return payload;
	const match = (lines[lastNonEmptyIndex] ?? "").match(SLACK_OPTIONS_LINE_RE);
	if (!match) return payload;
	const choices = parseSimpleSlackOptions(match[1] ?? "");
	if (!choices) return payload;
	const bodyText = lines.filter((_, index) => index !== lastNonEmptyIndex).join("\n").trim();
	const generatedBlocks = [];
	const bodyBlock = buildTextBlock(bodyText);
	if (bodyBlock) generatedBlocks.push(bodyBlock);
	generatedBlocks.push(choices.length <= SLACK_BUTTON_MAX_ITEMS ? {
		type: "buttons",
		buttons: choices
	} : {
		type: "select",
		placeholder: "Choose an option",
		options: choices
	});
	return {
		...payload,
		text: bodyText || void 0,
		interactive: { blocks: [...payload.interactive?.blocks ?? [], ...generatedBlocks] }
	};
}
function compileSlackInteractiveReplies(payload) {
	const text = payload.text;
	if (!text) return payload;
	if (hasSlackDirectives(text)) return parseSlackDirectives(payload);
	return parseSlackOptionsLine(payload);
}
//#endregion
//#region src/auto-reply/reply/normalize-reply.ts
function normalizeReplyPayload(payload, opts = {}) {
	const applyChannelTransforms = opts.applyChannelTransforms ?? true;
	const hasContent = (text) => hasReplyPayloadContent({
		...payload,
		text
	}, { trimText: true });
	const trimmed = payload.text?.trim() ?? "";
	if (!hasContent(trimmed)) {
		opts.onSkip?.("empty");
		return null;
	}
	const silentToken = opts.silentToken ?? "NO_REPLY";
	let text = payload.text ?? void 0;
	if (text && isSilentReplyPayloadText(text, silentToken)) {
		if (!hasContent("")) {
			opts.onSkip?.("silent");
			return null;
		}
		text = "";
	}
	if (text && text.includes(silentToken) && !isSilentReplyText(text, silentToken)) {
		text = stripSilentToken(text, silentToken);
		if (!hasContent(text)) {
			opts.onSkip?.("silent");
			return null;
		}
	}
	if (text && !trimmed) text = "";
	if ((opts.stripHeartbeat ?? true) && text?.includes("HEARTBEAT_OK")) {
		const stripped = stripHeartbeatToken(text, { mode: "message" });
		if (stripped.didStrip) opts.onHeartbeatStrip?.();
		if (stripped.shouldSkip && !hasContent(stripped.text)) {
			opts.onSkip?.("heartbeat");
			return null;
		}
		text = stripped.text;
	}
	if (text) text = sanitizeUserFacingText(text, { errorContext: Boolean(payload.isError) });
	if (!hasContent(text)) {
		opts.onSkip?.("empty");
		return null;
	}
	let enrichedPayload = {
		...payload,
		text
	};
	if (applyChannelTransforms && text && hasLineDirectives(text)) {
		enrichedPayload = parseLineDirectives(enrichedPayload);
		text = enrichedPayload.text;
	}
	const effectivePrefix = opts.responsePrefixContext ? resolveResponsePrefixTemplate(opts.responsePrefix, opts.responsePrefixContext) : opts.responsePrefix;
	if (effectivePrefix && text && text.trim() !== "HEARTBEAT_OK" && !text.startsWith(effectivePrefix)) text = `${effectivePrefix} ${text}`;
	enrichedPayload = {
		...enrichedPayload,
		text
	};
	if (applyChannelTransforms && opts.enableSlackInteractiveReplies && text) enrichedPayload = compileSlackInteractiveReplies(enrichedPayload);
	return enrichedPayload;
}
//#endregion
export { normalizeReplyPayload as t };
