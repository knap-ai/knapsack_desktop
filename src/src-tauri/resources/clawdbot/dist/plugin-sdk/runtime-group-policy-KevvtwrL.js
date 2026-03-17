//#region src/line/flex-templates/common.ts
function attachFooterText(bubble, footer) {
	bubble.footer = {
		type: "box",
		layout: "vertical",
		contents: [{
			type: "text",
			text: footer,
			size: "xs",
			color: "#AAAAAA",
			wrap: true,
			align: "center"
		}],
		paddingAll: "lg",
		backgroundColor: "#FAFAFA"
	};
}
//#endregion
//#region src/line/flex-templates/schedule-cards.ts
function buildTitleSubtitleHeader(params) {
	const { title, subtitle } = params;
	const headerContents = [{
		type: "text",
		text: title,
		weight: "bold",
		size: "xl",
		color: "#111111",
		wrap: true
	}];
	if (subtitle) headerContents.push({
		type: "text",
		text: subtitle,
		size: "sm",
		color: "#888888",
		margin: "sm",
		wrap: true
	});
	return headerContents;
}
function buildCardHeaderSections(headerContents) {
	return [{
		type: "box",
		layout: "vertical",
		contents: headerContents,
		paddingBottom: "lg"
	}, {
		type: "separator",
		color: "#EEEEEE"
	}];
}
function createMegaBubbleWithFooter(params) {
	const bubble = {
		type: "bubble",
		size: "mega",
		body: {
			type: "box",
			layout: "vertical",
			contents: params.bodyContents,
			paddingAll: "xl",
			backgroundColor: "#FFFFFF"
		}
	};
	if (params.footer) attachFooterText(bubble, params.footer);
	return bubble;
}
/**
* Create a receipt/summary card (for orders, transactions, data tables)
*
* Editorial design: Clean table layout with alternating row backgrounds,
* prominent total section, and clear visual hierarchy.
*/
function createReceiptCard(params) {
	const { title, subtitle, items, total, footer } = params;
	const itemRows = items.slice(0, 12).map((item, index) => ({
		type: "box",
		layout: "horizontal",
		contents: [{
			type: "text",
			text: item.name,
			size: "sm",
			color: item.highlight ? "#111111" : "#666666",
			weight: item.highlight ? "bold" : "regular",
			flex: 3,
			wrap: true
		}, {
			type: "text",
			text: item.value,
			size: "sm",
			color: item.highlight ? "#06C755" : "#333333",
			weight: item.highlight ? "bold" : "regular",
			flex: 2,
			align: "end",
			wrap: true
		}],
		paddingAll: "md",
		backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#FAFAFA"
	}));
	const bodyContents = [...buildCardHeaderSections(buildTitleSubtitleHeader({
		title,
		subtitle
	})), {
		type: "box",
		layout: "vertical",
		contents: itemRows,
		margin: "md",
		cornerRadius: "md",
		borderWidth: "light",
		borderColor: "#EEEEEE"
	}];
	if (total) bodyContents.push({
		type: "box",
		layout: "horizontal",
		contents: [{
			type: "text",
			text: total.label,
			size: "lg",
			weight: "bold",
			color: "#111111",
			flex: 2
		}, {
			type: "text",
			text: total.value,
			size: "xl",
			weight: "bold",
			color: "#06C755",
			flex: 2,
			align: "end"
		}],
		margin: "xl",
		paddingAll: "lg",
		backgroundColor: "#F0FDF4",
		cornerRadius: "lg"
	});
	return createMegaBubbleWithFooter({
		bodyContents,
		footer
	});
}
/**
* Create a calendar event card (for meetings, appointments, reminders)
*
* Editorial design: Date as hero, strong typographic hierarchy,
* color-blocked zones, full text wrapping for readability.
*/
function createEventCard(params) {
	const { title, date, time, location, description, calendar, isAllDay, action } = params;
	const dateBlock = {
		type: "box",
		layout: "vertical",
		contents: [{
			type: "text",
			text: date.toUpperCase(),
			size: "sm",
			weight: "bold",
			color: "#06C755",
			wrap: true
		}, {
			type: "text",
			text: isAllDay ? "ALL DAY" : time ?? "",
			size: "xxl",
			weight: "bold",
			color: "#111111",
			wrap: true,
			margin: "xs"
		}],
		paddingBottom: "lg",
		borderWidth: "none"
	};
	if (!time && !isAllDay) dateBlock.contents = [{
		type: "text",
		text: date,
		size: "xl",
		weight: "bold",
		color: "#111111",
		wrap: true
	}];
	const bodyContents = [dateBlock, {
		type: "box",
		layout: "horizontal",
		contents: [{
			type: "box",
			layout: "vertical",
			contents: [],
			width: "4px",
			backgroundColor: "#06C755",
			cornerRadius: "2px"
		}, {
			type: "box",
			layout: "vertical",
			contents: [{
				type: "text",
				text: title,
				size: "lg",
				weight: "bold",
				color: "#1a1a1a",
				wrap: true
			}, ...calendar ? [{
				type: "text",
				text: calendar,
				size: "xs",
				color: "#888888",
				margin: "sm",
				wrap: true
			}] : []],
			flex: 1,
			paddingStart: "lg"
		}],
		paddingTop: "lg",
		paddingBottom: "lg",
		borderWidth: "light",
		borderColor: "#EEEEEE"
	}];
	if (location || description) {
		const detailItems = [];
		if (location) detailItems.push({
			type: "box",
			layout: "horizontal",
			contents: [{
				type: "text",
				text: "📍",
				size: "sm",
				flex: 0
			}, {
				type: "text",
				text: location,
				size: "sm",
				color: "#444444",
				margin: "md",
				flex: 1,
				wrap: true
			}],
			alignItems: "flex-start"
		});
		if (description) detailItems.push({
			type: "text",
			text: description,
			size: "sm",
			color: "#666666",
			wrap: true,
			margin: location ? "lg" : "none"
		});
		bodyContents.push({
			type: "box",
			layout: "vertical",
			contents: detailItems,
			margin: "lg",
			paddingAll: "lg",
			backgroundColor: "#F8F9FA",
			cornerRadius: "lg"
		});
	}
	return {
		type: "bubble",
		size: "mega",
		body: {
			type: "box",
			layout: "vertical",
			contents: bodyContents,
			paddingAll: "xl",
			backgroundColor: "#FFFFFF",
			action
		}
	};
}
/**
* Create a calendar agenda card showing multiple events
*
* Editorial timeline design: Time-focused left column with event details
* on the right. Visual accent bars indicate event priority/recency.
*/
function createAgendaCard(params) {
	const { title, subtitle, events, footer } = params;
	const headerContents = buildTitleSubtitleHeader({
		title,
		subtitle
	});
	const eventItems = events.slice(0, 6).map((event, index) => {
		const isActive = event.isNow || index === 0;
		const accentColor = isActive ? "#06C755" : "#E5E5E5";
		const timeColumn = {
			type: "box",
			layout: "vertical",
			contents: [{
				type: "text",
				text: event.time ?? "—",
				size: "sm",
				weight: isActive ? "bold" : "regular",
				color: isActive ? "#06C755" : "#666666",
				align: "end",
				wrap: true
			}],
			width: "65px",
			justifyContent: "flex-start"
		};
		const dotColumn = {
			type: "box",
			layout: "vertical",
			contents: [{
				type: "box",
				layout: "vertical",
				contents: [],
				width: "10px",
				height: "10px",
				backgroundColor: accentColor,
				cornerRadius: "5px"
			}],
			width: "24px",
			alignItems: "center",
			justifyContent: "flex-start",
			paddingTop: "xs"
		};
		const detailContents = [{
			type: "text",
			text: event.title,
			size: "md",
			weight: "bold",
			color: "#1a1a1a",
			wrap: true
		}];
		const secondaryParts = [];
		if (event.location) secondaryParts.push(event.location);
		if (event.calendar) secondaryParts.push(event.calendar);
		if (secondaryParts.length > 0) detailContents.push({
			type: "text",
			text: secondaryParts.join(" · "),
			size: "xs",
			color: "#888888",
			wrap: true,
			margin: "xs"
		});
		return {
			type: "box",
			layout: "horizontal",
			contents: [
				timeColumn,
				dotColumn,
				{
					type: "box",
					layout: "vertical",
					contents: detailContents,
					flex: 1
				}
			],
			margin: index > 0 ? "xl" : void 0,
			alignItems: "flex-start"
		};
	});
	return createMegaBubbleWithFooter({
		bodyContents: [...buildCardHeaderSections(headerContents), {
			type: "box",
			layout: "vertical",
			contents: eventItems,
			paddingTop: "xl"
		}],
		footer
	});
}
//#endregion
//#region src/line/flex-templates/message.ts
/**
* Wrap a FlexContainer in a FlexMessage
*/
function toFlexMessage(altText, contents) {
	return {
		type: "flex",
		altText,
		contents
	};
}
//#endregion
//#region src/line/markdown-to-line.ts
/**
* Regex patterns for markdown detection
*/
const MARKDOWN_TABLE_REGEX = /^\|(.+)\|[\r\n]+\|[-:\s|]+\|[\r\n]+((?:\|.+\|[\r\n]*)+)/gm;
const MARKDOWN_CODE_BLOCK_REGEX = /```(\w*)\n([\s\S]*?)```/g;
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)/g;
/**
* Detect and extract markdown tables from text
*/
function extractMarkdownTables(text) {
	const tables = [];
	let textWithoutTables = text;
	MARKDOWN_TABLE_REGEX.lastIndex = 0;
	let match;
	const matches = [];
	while ((match = MARKDOWN_TABLE_REGEX.exec(text)) !== null) {
		const fullMatch = match[0];
		const headerLine = match[1];
		const bodyLines = match[2];
		const headers = parseTableRow(headerLine);
		const rows = bodyLines.trim().split(/[\r\n]+/).filter((line) => line.trim()).map(parseTableRow);
		if (headers.length > 0 && rows.length > 0) matches.push({
			fullMatch,
			table: {
				headers,
				rows
			}
		});
	}
	for (let i = matches.length - 1; i >= 0; i--) {
		const { fullMatch, table } = matches[i];
		tables.unshift(table);
		textWithoutTables = textWithoutTables.replace(fullMatch, "");
	}
	return {
		tables,
		textWithoutTables
	};
}
/**
* Parse a single table row (pipe-separated values)
*/
function parseTableRow(row) {
	return row.split("|").map((cell) => cell.trim()).filter((cell, index, arr) => {
		if (index === 0 && cell === "") return false;
		if (index === arr.length - 1 && cell === "") return false;
		return true;
	});
}
/**
* Convert a markdown table to a LINE Flex Message bubble
*/
function convertTableToFlexBubble(table) {
	const parseCell = (value) => {
		const raw = value?.trim() ?? "";
		if (!raw) return {
			text: "-",
			bold: false,
			hasMarkup: false
		};
		let hasMarkup = false;
		return {
			text: raw.replace(/\*\*(.+?)\*\*/g, (_, inner) => {
				hasMarkup = true;
				return String(inner);
			}).trim() || "-",
			bold: /^\*\*.+\*\*$/.test(raw),
			hasMarkup
		};
	};
	const headerCells = table.headers.map((header) => parseCell(header));
	const rowCells = table.rows.map((row) => row.map((cell) => parseCell(cell)));
	const hasInlineMarkup = headerCells.some((cell) => cell.hasMarkup) || rowCells.some((row) => row.some((cell) => cell.hasMarkup));
	if (table.headers.length === 2 && !hasInlineMarkup) {
		const items = rowCells.map((row) => ({
			name: row[0]?.text ?? "-",
			value: row[1]?.text ?? "-"
		}));
		return createReceiptCard({
			title: headerCells.map((cell) => cell.text).join(" / "),
			items
		});
	}
	return {
		type: "bubble",
		body: {
			type: "box",
			layout: "vertical",
			contents: [
				{
					type: "box",
					layout: "horizontal",
					contents: headerCells.map((cell) => ({
						type: "text",
						text: cell.text,
						weight: "bold",
						size: "sm",
						color: "#333333",
						flex: 1,
						wrap: true
					})),
					paddingBottom: "sm"
				},
				{
					type: "separator",
					margin: "sm"
				},
				...rowCells.slice(0, 10).map((row, rowIndex) => {
					return {
						type: "box",
						layout: "horizontal",
						contents: table.headers.map((_, colIndex) => {
							const cell = row[colIndex] ?? {
								text: "-",
								bold: false,
								hasMarkup: false
							};
							return {
								type: "text",
								text: cell.text,
								size: "sm",
								color: "#666666",
								flex: 1,
								wrap: true,
								weight: cell.bold ? "bold" : void 0
							};
						}),
						margin: rowIndex === 0 ? "md" : "sm"
					};
				})
			],
			paddingAll: "lg"
		}
	};
}
/**
* Detect and extract code blocks from text
*/
function extractCodeBlocks(text) {
	const codeBlocks = [];
	let textWithoutCode = text;
	MARKDOWN_CODE_BLOCK_REGEX.lastIndex = 0;
	let match;
	const matches = [];
	while ((match = MARKDOWN_CODE_BLOCK_REGEX.exec(text)) !== null) {
		const fullMatch = match[0];
		const language = match[1] || void 0;
		const code = match[2];
		matches.push({
			fullMatch,
			block: {
				language,
				code: code.trim()
			}
		});
	}
	for (let i = matches.length - 1; i >= 0; i--) {
		const { fullMatch, block } = matches[i];
		codeBlocks.unshift(block);
		textWithoutCode = textWithoutCode.replace(fullMatch, "");
	}
	return {
		codeBlocks,
		textWithoutCode
	};
}
/**
* Convert a code block to a LINE Flex Message bubble
*/
function convertCodeBlockToFlexBubble(block) {
	const titleText = block.language ? `Code (${block.language})` : "Code";
	const displayCode = block.code.length > 2e3 ? block.code.slice(0, 2e3) + "\n..." : block.code;
	return {
		type: "bubble",
		body: {
			type: "box",
			layout: "vertical",
			contents: [{
				type: "text",
				text: titleText,
				weight: "bold",
				size: "sm",
				color: "#666666"
			}, {
				type: "box",
				layout: "vertical",
				contents: [{
					type: "text",
					text: displayCode,
					size: "xs",
					color: "#333333",
					wrap: true
				}],
				backgroundColor: "#F5F5F5",
				paddingAll: "md",
				cornerRadius: "md",
				margin: "sm"
			}],
			paddingAll: "lg"
		}
	};
}
/**
* Extract markdown links from text
*/
function extractLinks(text) {
	const links = [];
	MARKDOWN_LINK_REGEX.lastIndex = 0;
	let match;
	while ((match = MARKDOWN_LINK_REGEX.exec(text)) !== null) links.push({
		text: match[1],
		url: match[2]
	});
	return {
		links,
		textWithLinks: text.replace(MARKDOWN_LINK_REGEX, "$1")
	};
}
/**
* Strip markdown formatting from text (for plain text output)
* Handles: bold, italic, strikethrough, headers, blockquotes, horizontal rules
*/
function stripMarkdown(text) {
	let result = text;
	result = result.replace(/\*\*(.+?)\*\*/g, "$1");
	result = result.replace(/__(.+?)__/g, "$1");
	result = result.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "$1");
	result = result.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, "$1");
	result = result.replace(/~~(.+?)~~/g, "$1");
	result = result.replace(/^#{1,6}\s+(.+)$/gm, "$1");
	result = result.replace(/^>\s?(.*)$/gm, "$1");
	result = result.replace(/^[-*_]{3,}$/gm, "");
	result = result.replace(/`([^`]+)`/g, "$1");
	result = result.replace(/\n{3,}/g, "\n\n");
	result = result.trim();
	return result;
}
/**
* Main function: Process text for LINE output
* - Extracts tables → Flex Messages
* - Extracts code blocks → Flex Messages
* - Strips remaining markdown
* - Returns processed text + Flex Messages
*/
function processLineMessage(text) {
	const flexMessages = [];
	let processedText = text;
	const { tables, textWithoutTables } = extractMarkdownTables(processedText);
	processedText = textWithoutTables;
	for (const table of tables) {
		const bubble = convertTableToFlexBubble(table);
		flexMessages.push(toFlexMessage("Table", bubble));
	}
	const { codeBlocks, textWithoutCode } = extractCodeBlocks(processedText);
	processedText = textWithoutCode;
	for (const block of codeBlocks) {
		const bubble = convertCodeBlockToFlexBubble(block);
		flexMessages.push(toFlexMessage("Code", bubble));
	}
	const { textWithLinks } = extractLinks(processedText);
	processedText = textWithLinks;
	processedText = stripMarkdown(processedText);
	return {
		text: processedText,
		flexMessages
	};
}
/**
* Check if text contains markdown that needs conversion
*/
function hasMarkdownToConvert(text) {
	MARKDOWN_TABLE_REGEX.lastIndex = 0;
	if (MARKDOWN_TABLE_REGEX.test(text)) return true;
	MARKDOWN_CODE_BLOCK_REGEX.lastIndex = 0;
	if (MARKDOWN_CODE_BLOCK_REGEX.test(text)) return true;
	if (/\*\*[^*]+\*\*/.test(text)) return true;
	if (/~~[^~]+~~/.test(text)) return true;
	if (/^#{1,6}\s+/m.test(text)) return true;
	if (/^>\s+/m.test(text)) return true;
	return false;
}
//#endregion
//#region src/config/runtime-group-policy.ts
function resolveRuntimeGroupPolicy(params) {
	const configuredFallbackPolicy = params.configuredFallbackPolicy ?? "open";
	const missingProviderFallbackPolicy = params.missingProviderFallbackPolicy ?? "allowlist";
	return {
		groupPolicy: params.providerConfigPresent ? params.groupPolicy ?? params.defaultGroupPolicy ?? configuredFallbackPolicy : params.groupPolicy ?? missingProviderFallbackPolicy,
		providerMissingFallbackApplied: !params.providerConfigPresent && params.groupPolicy === void 0
	};
}
function resolveDefaultGroupPolicy(cfg) {
	return cfg.channels?.defaults?.groupPolicy;
}
const GROUP_POLICY_BLOCKED_LABEL = {
	group: "group messages",
	guild: "guild messages",
	room: "room messages",
	channel: "channel messages",
	space: "space messages"
};
/**
* Standard provider runtime policy:
* - configured provider fallback: open
* - missing provider fallback: allowlist (fail-closed)
*/
function resolveOpenProviderRuntimeGroupPolicy(params) {
	return resolveRuntimeGroupPolicy({
		providerConfigPresent: params.providerConfigPresent,
		groupPolicy: params.groupPolicy,
		defaultGroupPolicy: params.defaultGroupPolicy,
		configuredFallbackPolicy: "open",
		missingProviderFallbackPolicy: "allowlist"
	});
}
/**
* Strict provider runtime policy:
* - configured provider fallback: allowlist
* - missing provider fallback: allowlist (fail-closed)
*/
function resolveAllowlistProviderRuntimeGroupPolicy(params) {
	return resolveRuntimeGroupPolicy({
		providerConfigPresent: params.providerConfigPresent,
		groupPolicy: params.groupPolicy,
		defaultGroupPolicy: params.defaultGroupPolicy,
		configuredFallbackPolicy: "allowlist",
		missingProviderFallbackPolicy: "allowlist"
	});
}
const warnedMissingProviderGroupPolicy = /* @__PURE__ */ new Set();
function warnMissingProviderGroupPolicyFallbackOnce(params) {
	if (!params.providerMissingFallbackApplied) return false;
	const key = `${params.providerKey}:${params.accountId ?? "*"}`;
	if (warnedMissingProviderGroupPolicy.has(key)) return false;
	warnedMissingProviderGroupPolicy.add(key);
	const blockedLabel = params.blockedLabel?.trim() || "group messages";
	params.log(`${params.providerKey}: channels.${params.providerKey} is missing; defaulting groupPolicy to "allowlist" (${blockedLabel} blocked until explicitly configured).`);
	return true;
}
/**
* Test helper. Keeps warning-cache state deterministic across test files.
*/
function resetMissingProviderGroupPolicyFallbackWarningsForTesting() {
	warnedMissingProviderGroupPolicy.clear();
}
//#endregion
export { resolveOpenProviderRuntimeGroupPolicy as a, hasMarkdownToConvert as c, createAgendaCard as d, createEventCard as f, resolveDefaultGroupPolicy as i, processLineMessage as l, attachFooterText as m, resetMissingProviderGroupPolicyFallbackWarningsForTesting as n, resolveRuntimeGroupPolicy as o, createReceiptCard as p, resolveAllowlistProviderRuntimeGroupPolicy as r, warnMissingProviderGroupPolicyFallbackOnce as s, GROUP_POLICY_BLOCKED_LABEL as t, stripMarkdown as u };
