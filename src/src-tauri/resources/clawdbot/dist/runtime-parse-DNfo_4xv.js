import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import { n as isRich, r as theme, t as colorize } from "./theme-D5sxSdHD.js";
//#region src/daemon/arg-split.ts
function splitArgsPreservingQuotes(value, options) {
	const args = [];
	let current = "";
	let inQuotes = false;
	const escapeMode = options?.escapeMode ?? "none";
	for (let i = 0; i < value.length; i++) {
		const char = value[i];
		if (escapeMode === "backslash" && char === "\\") {
			if (i + 1 < value.length) {
				current += value[i + 1];
				i++;
			}
			continue;
		}
		if (escapeMode === "backslash-quote-only" && char === "\\" && i + 1 < value.length && value[i + 1] === "\"") {
			current += "\"";
			i++;
			continue;
		}
		if (char === "\"") {
			inQuotes = !inQuotes;
			continue;
		}
		if (!inQuotes && /\s/.test(char)) {
			if (current) {
				args.push(current);
				current = "";
			}
			continue;
		}
		current += char;
	}
	if (current) args.push(current);
	return args;
}
//#endregion
//#region src/daemon/output.ts
const toPosixPath = (value) => value.replace(/\\/g, "/");
function formatLine(label, value) {
	const rich = isRich();
	return `${colorize(rich, theme.muted, `${label}:`)} ${colorize(rich, theme.command, value)}`;
}
function writeFormattedLines(stdout, lines, opts) {
	if (opts?.leadingBlankLine) stdout.write("\n");
	for (const line of lines) stdout.write(`${formatLine(line.label, line.value)}\n`);
}
//#endregion
//#region src/daemon/runtime-parse.ts
function parseKeyValueOutput(output, separator) {
	const entries = {};
	for (const rawLine of output.split(/\r?\n/)) {
		const line = rawLine.trim();
		if (!line) continue;
		const idx = line.indexOf(separator);
		if (idx <= 0) continue;
		const key = normalizeLowercaseStringOrEmpty(line.slice(0, idx));
		if (!key) continue;
		entries[key] = line.slice(idx + separator.length).trim();
	}
	return entries;
}
//#endregion
export { splitArgsPreservingQuotes as a, writeFormattedLines as i, formatLine as n, toPosixPath as r, parseKeyValueOutput as t };
