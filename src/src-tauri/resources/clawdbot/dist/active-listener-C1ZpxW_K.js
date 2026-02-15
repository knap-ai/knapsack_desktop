import { w as DEFAULT_ACCOUNT_ID } from "./agent-scope-CCxRobXB.js";
import { t as formatCliCommand } from "./command-format-qUVxzqYm.js";
import { r as markdownToIRWithMeta } from "./ir-CA_q26JN.js";

//#region src/markdown/render.ts
const STYLE_RANK = new Map([
	"blockquote",
	"code_block",
	"code",
	"bold",
	"italic",
	"strikethrough",
	"spoiler"
].map((style, index) => [style, index]));
function sortStyleSpans(spans) {
	return [...spans].toSorted((a, b) => {
		if (a.start !== b.start) return a.start - b.start;
		if (a.end !== b.end) return b.end - a.end;
		return (STYLE_RANK.get(a.style) ?? 0) - (STYLE_RANK.get(b.style) ?? 0);
	});
}
function renderMarkdownWithMarkers(ir, options) {
	const text = ir.text ?? "";
	if (!text) return "";
	const styleMarkers = options.styleMarkers;
	const styled = sortStyleSpans(ir.styles.filter((span) => Boolean(styleMarkers[span.style])));
	const boundaries = /* @__PURE__ */ new Set();
	boundaries.add(0);
	boundaries.add(text.length);
	const startsAt = /* @__PURE__ */ new Map();
	for (const span of styled) {
		if (span.start === span.end) continue;
		boundaries.add(span.start);
		boundaries.add(span.end);
		const bucket = startsAt.get(span.start);
		if (bucket) bucket.push(span);
		else startsAt.set(span.start, [span]);
	}
	for (const spans of startsAt.values()) spans.sort((a, b) => {
		if (a.end !== b.end) return b.end - a.end;
		return (STYLE_RANK.get(a.style) ?? 0) - (STYLE_RANK.get(b.style) ?? 0);
	});
	const linkStarts = /* @__PURE__ */ new Map();
	if (options.buildLink) for (const link of ir.links) {
		if (link.start === link.end) continue;
		const rendered = options.buildLink(link, text);
		if (!rendered) continue;
		boundaries.add(rendered.start);
		boundaries.add(rendered.end);
		const openBucket = linkStarts.get(rendered.start);
		if (openBucket) openBucket.push(rendered);
		else linkStarts.set(rendered.start, [rendered]);
	}
	const points = [...boundaries].toSorted((a, b) => a - b);
	const stack = [];
	let out = "";
	for (let i = 0; i < points.length; i += 1) {
		const pos = points[i];
		while (stack.length && stack[stack.length - 1]?.end === pos) {
			const item = stack.pop();
			if (item) out += item.close;
		}
		const openingItems = [];
		const openingLinks = linkStarts.get(pos);
		if (openingLinks && openingLinks.length > 0) for (const [index, link] of openingLinks.entries()) openingItems.push({
			end: link.end,
			open: link.open,
			close: link.close,
			kind: "link",
			index
		});
		const openingStyles = startsAt.get(pos);
		if (openingStyles) for (const [index, span] of openingStyles.entries()) {
			const marker = styleMarkers[span.style];
			if (!marker) continue;
			openingItems.push({
				end: span.end,
				open: marker.open,
				close: marker.close,
				kind: "style",
				style: span.style,
				index
			});
		}
		if (openingItems.length > 0) {
			openingItems.sort((a, b) => {
				if (a.end !== b.end) return b.end - a.end;
				if (a.kind !== b.kind) return a.kind === "link" ? -1 : 1;
				if (a.kind === "style" && b.kind === "style") return (STYLE_RANK.get(a.style) ?? 0) - (STYLE_RANK.get(b.style) ?? 0);
				return a.index - b.index;
			});
			for (const item of openingItems) {
				out += item.open;
				stack.push({
					close: item.close,
					end: item.end
				});
			}
		}
		const next = points[i + 1];
		if (next === void 0) break;
		if (next > pos) out += options.escapeText(text.slice(pos, next));
	}
	return out;
}

//#endregion
//#region src/polls.ts
function normalizePollInput(input, options = {}) {
	const question = input.question.trim();
	if (!question) throw new Error("Poll question is required");
	const cleaned = (input.options ?? []).map((option) => option.trim()).filter(Boolean);
	if (cleaned.length < 2) throw new Error("Poll requires at least 2 options");
	if (options.maxOptions !== void 0 && cleaned.length > options.maxOptions) throw new Error(`Poll supports at most ${options.maxOptions} options`);
	const maxSelectionsRaw = input.maxSelections;
	const maxSelections = typeof maxSelectionsRaw === "number" && Number.isFinite(maxSelectionsRaw) ? Math.floor(maxSelectionsRaw) : 1;
	if (maxSelections < 1) throw new Error("maxSelections must be at least 1");
	if (maxSelections > cleaned.length) throw new Error("maxSelections cannot exceed option count");
	const durationRaw = input.durationHours;
	const durationHours = typeof durationRaw === "number" && Number.isFinite(durationRaw) ? Math.floor(durationRaw) : void 0;
	if (durationHours !== void 0 && durationHours < 1) throw new Error("durationHours must be at least 1");
	return {
		question,
		options: cleaned,
		maxSelections,
		durationHours
	};
}
function normalizePollDurationHours(value, options) {
	const base = typeof value === "number" && Number.isFinite(value) ? Math.floor(value) : options.defaultHours;
	return Math.min(Math.max(base, 1), options.maxHours);
}

//#endregion
//#region src/markdown/tables.ts
const MARKDOWN_STYLE_MARKERS = {
	bold: {
		open: "**",
		close: "**"
	},
	italic: {
		open: "_",
		close: "_"
	},
	strikethrough: {
		open: "~~",
		close: "~~"
	},
	code: {
		open: "`",
		close: "`"
	},
	code_block: {
		open: "```\n",
		close: "```"
	}
};
function convertMarkdownTables(markdown, mode) {
	if (!markdown || mode === "off") return markdown;
	const { ir, hasTables } = markdownToIRWithMeta(markdown, {
		linkify: false,
		autolink: false,
		headingStyle: "none",
		blockquotePrefix: "",
		tableMode: mode
	});
	if (!hasTables) return markdown;
	return renderMarkdownWithMarkers(ir, {
		styleMarkers: MARKDOWN_STYLE_MARKERS,
		escapeText: (text) => text,
		buildLink: (link, text) => {
			const href = link.href.trim();
			if (!href) return null;
			if (!text.slice(link.start, link.end)) return null;
			return {
				start: link.start,
				end: link.end,
				open: "[",
				close: `](${href})`
			};
		}
	});
}

//#endregion
//#region src/web/active-listener.ts
const listeners = /* @__PURE__ */ new Map();
function resolveWebAccountId(accountId) {
	return (accountId ?? "").trim() || DEFAULT_ACCOUNT_ID;
}
function requireActiveWebListener(accountId) {
	const id = resolveWebAccountId(accountId);
	const listener = listeners.get(id) ?? null;
	if (!listener) throw new Error(`No active WhatsApp Web listener (account: ${id}). Start the gateway, then link WhatsApp with: ${formatCliCommand(`openclaw channels login --channel whatsapp --account ${id}`)}.`);
	return {
		accountId: id,
		listener
	};
}
function setActiveWebListener(accountIdOrListener, maybeListener) {
	const { accountId, listener } = typeof accountIdOrListener === "string" ? {
		accountId: accountIdOrListener,
		listener: maybeListener ?? null
	} : {
		accountId: DEFAULT_ACCOUNT_ID,
		listener: accountIdOrListener ?? null
	};
	const id = resolveWebAccountId(accountId);
	if (!listener) listeners.delete(id);
	else listeners.set(id, listener);
	if (id === DEFAULT_ACCOUNT_ID) {}
}
function getActiveWebListener(accountId) {
	const id = resolveWebAccountId(accountId);
	return listeners.get(id) ?? null;
}

//#endregion
export { normalizePollDurationHours as a, convertMarkdownTables as i, requireActiveWebListener as n, normalizePollInput as o, setActiveWebListener as r, renderMarkdownWithMarkers as s, getActiveWebListener as t };