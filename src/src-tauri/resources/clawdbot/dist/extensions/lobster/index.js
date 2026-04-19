import { t as definePluginEntry } from "../../plugin-entry-Bkat4og3.js";
import { t as readLineFromStream } from "../../read_line-CHjw_HGN.js";
import { promises } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import os from "node:os";
import fs$1 from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { PassThrough, Readable, Writable } from "node:stream";
import { Buffer as Buffer$1 } from "node:buffer";
import { Ajv } from "ajv";
import { Type } from "@sinclair/typebox";
import { parse } from "yaml";
//#region node_modules/@clawdbot/lobster/dist/src/shell.js
function resolveInlineShellCommand({ command, env, platform = process.platform }) {
	const shellOverride = String(env?.LOBSTER_SHELL ?? "").trim();
	const isWindows = platform === "win32";
	if (shellOverride) return {
		command: shellOverride,
		argv: buildShellArgs({
			shellCommand: shellOverride,
			command,
			isWindows
		})
	};
	if (isWindows) return {
		command: String(env?.ComSpec ?? env?.COMSPEC ?? "cmd.exe").trim() || "cmd.exe",
		argv: [
			"/d",
			"/s",
			"/c",
			command
		]
	};
	return {
		command: "/bin/sh",
		argv: ["-lc", command]
	};
}
function buildShellArgs({ shellCommand, command, isWindows }) {
	const lowered = shellCommand.toLowerCase();
	const looksLikeCmd = lowered.endsWith("cmd") || lowered.endsWith("cmd.exe");
	if (lowered.endsWith("powershell") || lowered.endsWith("powershell.exe") || lowered.endsWith("pwsh") || lowered.endsWith("pwsh.exe")) return [
		"-NoProfile",
		"-Command",
		command
	];
	if (looksLikeCmd || isWindows) return [
		"/d",
		"/s",
		"/c",
		command
	];
	return ["-lc", command];
}
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/commands/stdlib/exec.js
const execCommand = {
	name: "exec",
	meta: {
		description: "Run an OS command",
		argsSchema: {
			type: "object",
			properties: {
				json: {
					type: "boolean",
					description: "Parse stdout as JSON (single value)."
				},
				shell: {
					type: "string",
					description: "Run via the system shell with this command line."
				},
				_: {
					type: "array",
					items: { type: "string" },
					description: "Command + args."
				}
			},
			required: ["_"]
		},
		sideEffects: ["local_exec"]
	},
	help() {
		return "exec — run an OS command\n\nUsage:\n  exec <command...>\n  exec --stdin raw|json|jsonl <command...>\n  exec --json <command...>\n  exec --shell \"<command line>\"\n\nNotes:\n  - With --json, parses stdout as JSON (single value).\n  - With --stdin, writes pipeline input to stdin.\n  - With --shell (or a single arg containing spaces), runs via the system shell.\n";
	},
	async run({ input, args, ctx }) {
		const cmd = args._;
		const cwd = ctx?.cwd ?? process.cwd();
		const shellLine = typeof args.shell === "string" ? args.shell : null;
		const useShell = Boolean(args.shell) || cmd.length === 1 && /\s/.test(cmd[0]);
		const stdinMode = typeof args.stdin === "string" ? String(args.stdin).toLowerCase() : null;
		if (!cmd.length && !shellLine) throw new Error("exec requires a command");
		let stdinPayload = null;
		if (stdinMode) {
			const items = [];
			for await (const item of input) items.push(item);
			stdinPayload = encodeStdin(items, stdinMode);
		} else for await (const _item of input);
		const result = useShell ? await runShellLine(shellLine ?? cmd[0] ?? "", {
			env: ctx.env,
			cwd,
			stdin: stdinPayload,
			signal: ctx.signal
		}) : await runProcess$1(cmd[0], cmd.slice(1), {
			env: ctx.env,
			cwd,
			stdin: stdinPayload,
			signal: ctx.signal
		});
		if (args.json) {
			let parsed;
			try {
				parsed = JSON.parse(result.stdout.trim() || "null");
			} catch (err) {
				throw new Error(`exec --json could not parse stdout as JSON: ${err?.message ?? String(err)}`);
			}
			return { output: asStream$5(Array.isArray(parsed) ? parsed : [parsed]) };
		}
		return { output: asStream$5(result.stdout.split(/\r?\n/).filter(Boolean)) };
	}
};
function runProcess$1(command, argv, { env, cwd, stdin, signal }) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, argv, {
			env,
			cwd,
			signal,
			stdio: [
				"pipe",
				"pipe",
				"pipe"
			]
		});
		let stdout = "";
		let stderr = "";
		child.stdout.setEncoding("utf8");
		child.stderr.setEncoding("utf8");
		child.stdout.on("data", (d) => {
			stdout += d;
		});
		child.stderr.on("data", (d) => {
			stderr += d;
		});
		if (typeof stdin === "string") {
			child.stdin.setDefaultEncoding("utf8");
			child.stdin.write(stdin);
		}
		child.stdin.end();
		child.on("error", reject);
		child.on("close", (code) => {
			if (code === 0) return resolve({
				stdout,
				stderr
			});
			reject(/* @__PURE__ */ new Error(`exec failed (${code}): ${stderr.trim() || stdout.trim() || command}`));
		});
	});
}
function runShellLine(commandLine, { env, cwd, stdin, signal }) {
	const shell = resolveInlineShellCommand({
		command: commandLine,
		env
	});
	return runProcess$1(shell.command, shell.argv, {
		env,
		cwd,
		stdin,
		signal
	});
}
function encodeStdin(items, mode) {
	if (mode === "json") return JSON.stringify(items);
	if (mode === "jsonl") return items.map((item) => JSON.stringify(item)).join("\n") + (items.length ? "\n" : "");
	if (mode === "raw") return items.map((item) => typeof item === "string" ? item : JSON.stringify(item)).join("\n");
	throw new Error(`exec --stdin must be raw, json, or jsonl (got ${mode})`);
}
async function* asStream$5(items) {
	for (const item of items) yield item;
}
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/commands/stdlib/head.js
const headCommand = {
	name: "head",
	meta: {
		description: "Take first N items",
		argsSchema: {
			type: "object",
			properties: {
				n: {
					type: "number",
					description: "Number of items to take",
					default: 10
				},
				_: {
					type: "array",
					items: { type: "string" }
				}
			},
			required: []
		},
		sideEffects: []
	},
	help() {
		return `head — take first N items\n\nUsage:\n  head --n 10\n`;
	},
	async run({ input, args }) {
		const n = args.n === void 0 ? 10 : Number(args.n);
		if (!Number.isFinite(n) || n < 0) throw new Error("head --n must be a non-negative number");
		return { output: (async function* () {
			let i = 0;
			for await (const item of input) {
				if (i++ >= n) break;
				yield item;
			}
		})() };
	}
};
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/commands/stdlib/json.js
const jsonCommand = {
	name: "json",
	meta: {
		description: "Render pipeline output as JSON",
		argsSchema: {
			type: "object",
			properties: {},
			required: []
		},
		sideEffects: []
	},
	help() {
		return `json — render pipeline output as JSON\n\nUsage:\n  ... | json\n`;
	},
	async run({ input, ctx }) {
		const items = [];
		for await (const item of input) items.push(item);
		ctx.render.json(items);
		return {
			output: emptyStream$2(),
			rendered: true
		};
	}
};
async function* emptyStream$2() {}
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/commands/stdlib/pick.js
const pickCommand = {
	name: "pick",
	meta: {
		description: "Project fields from objects",
		argsSchema: {
			type: "object",
			properties: { _: {
				type: "array",
				items: { type: "string" },
				description: "First positional arg is a comma-separated list of fields"
			} },
			required: ["_"]
		},
		sideEffects: []
	},
	help() {
		return `pick — project fields from objects\n\nUsage:\n  ... | pick id,subject,from\n`;
	},
	async run({ input, args }) {
		const spec = args._[0];
		if (!spec) throw new Error("pick requires a comma-separated field list");
		const fields = spec.split(",").map((s) => s.trim()).filter(Boolean);
		return { output: (async function* () {
			for await (const item of input) {
				if (item === null || typeof item !== "object") {
					yield item;
					continue;
				}
				const out = {};
				for (const f of fields) out[f] = item[f];
				yield out;
			}
		})() };
	}
};
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/commands/stdlib/table.js
function stringifyCell(v) {
	if (v === null || v === void 0) return "";
	if (typeof v === "string") return v;
	if (typeof v === "number" || typeof v === "boolean") return String(v);
	return JSON.stringify(v);
}
const tableCommand = {
	name: "table",
	meta: {
		description: "Render items as a simple table",
		argsSchema: {
			type: "object",
			properties: {},
			required: []
		},
		sideEffects: []
	},
	help() {
		return `table — render items as a simple table\n\nUsage:\n  ... | table\n\nNotes:\n  - If items are objects, columns are union of keys (first 20 items).\n`;
	},
	async run({ input, ctx }) {
		const items = [];
		for await (const item of input) items.push(item);
		if (items.length === 0) {
			ctx.stdout.write("(no results)\n");
			return {
				output: emptyStream$1(),
				rendered: true
			};
		}
		const sample = items.slice(0, 20);
		const objectItems = sample.filter((x) => x && typeof x === "object" && !Array.isArray(x));
		if (objectItems.length === sample.length) {
			const cols = [];
			const seen = /* @__PURE__ */ new Set();
			for (const obj of objectItems) for (const k of Object.keys(obj)) if (!seen.has(k)) {
				seen.add(k);
				cols.push(k);
			}
			const rows = [cols, ...items.map((it) => cols.map((c) => stringifyCell(it?.[c])))].map((row) => row.map((cell) => cell.replace(/\n/g, " ")));
			const widths = cols.map((_, i) => Math.max(...rows.map((r) => r[i].length), 3));
			const renderRow = (row) => row.map((cell, i) => cell.padEnd(widths[i])).join("  ");
			ctx.stdout.write(renderRow(rows[0]) + "\n");
			ctx.stdout.write(widths.map((w) => "-".repeat(w)).join("  ") + "\n");
			for (const row of rows.slice(1)) ctx.stdout.write(renderRow(row) + "\n");
			return {
				output: emptyStream$1(),
				rendered: true
			};
		}
		for (const item of items) ctx.stdout.write(stringifyCell(item) + "\n");
		return {
			output: emptyStream$1(),
			rendered: true
		};
	}
};
async function* emptyStream$1() {}
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/commands/stdlib/where.js
function parsePredicate(expr) {
	const m = expr.match(/^([a-zA-Z0-9_.]+)\s*(==|=|!=|<=|>=|<|>)\s*(.+)$/);
	if (!m) throw new Error(`Invalid where expression: ${expr}`);
	const [, path, op, rawValue] = m;
	let value = rawValue;
	if (rawValue === "true") value = true;
	else if (rawValue === "false") value = false;
	else if (rawValue === "null") value = null;
	else if (!Number.isNaN(Number(rawValue)) && rawValue.trim() !== "") value = Number(rawValue);
	return {
		path,
		op: op === "=" ? "==" : op,
		value
	};
}
function getPath(obj, path) {
	const parts = path.split(".");
	let cur = obj;
	for (const p of parts) {
		if (cur === null || typeof cur !== "object") return void 0;
		cur = cur[p];
	}
	return cur;
}
function compare(left, op, right) {
	switch (op) {
		case "==": return left == right;
		case "!=": return left != right;
		case "<": return left < right;
		case "<=": return left <= right;
		case ">": return left > right;
		case ">=": return left >= right;
		default: throw new Error(`Unsupported operator: ${op}`);
	}
}
const whereCommand = {
	name: "where",
	meta: {
		description: "Filter objects by a simple predicate",
		argsSchema: {
			type: "object",
			properties: { _: {
				type: "array",
				items: { type: "string" },
				description: "First positional arg is an expression like field=value or minutes>=30"
			} },
			required: ["_"]
		},
		sideEffects: []
	},
	help() {
		return `where — filter objects by a simple predicate\n\nUsage:\n  ... | where unread=true\n  ... | where minutes>=30\n  ... | where sender.domain==example.com\n`;
	},
	async run({ input, args }) {
		const expr = args._[0];
		if (!expr) throw new Error("where requires an expression (e.g. field=value)");
		const pred = parsePredicate(expr);
		return { output: (async function* () {
			for await (const item of input) if (compare(getPath(item, pred.path), pred.op, pred.value)) yield item;
		})() };
	}
};
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/commands/stdlib/sort.js
function getByPath$4(obj, path) {
	if (!path) return void 0;
	const parts = path.split(".").filter(Boolean);
	let cur = obj;
	for (const p of parts) {
		if (cur == null) return void 0;
		cur = cur[p];
	}
	return cur;
}
function defaultCompare(a, b) {
	const aU = a === void 0 || a === null;
	const bU = b === void 0 || b === null;
	if (aU && bU) return 0;
	if (aU) return 1;
	if (bU) return -1;
	if (typeof a === "number" && typeof b === "number") return a - b;
	const aStr = String(a);
	const bStr = String(b);
	if (aStr < bStr) return -1;
	if (aStr > bStr) return 1;
	return 0;
}
const sortCommand = {
	name: "sort",
	meta: {
		description: "Sort items (stable) by a key or by stringified value",
		argsSchema: {
			type: "object",
			properties: {
				key: {
					type: "string",
					description: "Dot-path key to sort by (e.g. updatedAt, pr.number)"
				},
				desc: {
					type: "boolean",
					description: "Sort descending"
				},
				_: {
					type: "array",
					items: { type: "string" }
				}
			},
			required: []
		},
		sideEffects: []
	},
	help() {
		return "sort — sort items (stable) by a key\n\nUsage:\n  ... | sort\n  ... | sort --key updatedAt\n  ... | sort --key prNumber --desc\n\nNotes:\n  - Sorting is stable (preserves order for equal keys).\n  - undefined/null keys sort last.\n";
	},
	async run({ input, args }) {
		const key = typeof args.key === "string" ? args.key : void 0;
		const desc = Boolean(args.desc);
		const items = [];
		let idx = 0;
		for await (const item of input) {
			items.push({
				item,
				idx
			});
			idx++;
		}
		items.sort((a, b) => {
			const c = defaultCompare(key ? getByPath$4(a.item, key) : a.item, key ? getByPath$4(b.item, key) : b.item);
			if (c !== 0) return desc ? -c : c;
			return a.idx - b.idx;
		});
		return { output: (async function* () {
			for (const x of items) yield x.item;
		})() };
	}
};
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/commands/stdlib/dedupe.js
function getByPath$3(obj, path) {
	if (!path) return obj;
	const parts = path.split(".").filter(Boolean);
	let cur = obj;
	for (const p of parts) {
		if (cur == null) return void 0;
		cur = cur[p];
	}
	return cur;
}
const dedupeCommand = {
	name: "dedupe",
	meta: {
		description: "Remove duplicate items, keeping first occurrence (stable)",
		argsSchema: {
			type: "object",
			properties: {
				key: {
					type: "string",
					description: "Dot-path key used for identity (defaults to whole item)"
				},
				_: {
					type: "array",
					items: { type: "string" }
				}
			},
			required: []
		},
		sideEffects: []
	},
	help() {
		return "dedupe — remove duplicate items (stable)\n\nUsage:\n  ... | dedupe\n  ... | dedupe --key id\n\nNotes:\n  - Keeps the first occurrence.\n";
	},
	async run({ input, args }) {
		const key = typeof args.key === "string" ? args.key : void 0;
		const seen = /* @__PURE__ */ new Set();
		return { output: (async function* () {
			for await (const item of input) {
				const id = key ? getByPath$3(item, key) : item;
				const k = JSON.stringify(id);
				if (seen.has(k)) continue;
				seen.add(k);
				yield item;
			}
		})() };
	}
};
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/commands/stdlib/template.js
function getByPath$2(obj, path) {
	if (path === "." || path === "this") return obj;
	const parts = path.split(".").filter(Boolean);
	let cur = obj;
	for (const p of parts) {
		if (cur == null) return void 0;
		cur = cur[p];
	}
	return cur;
}
function renderTemplate$1(tpl, ctx) {
	return tpl.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_m, expr) => {
		const val = getByPath$2(ctx, String(expr ?? "").trim());
		if (val === void 0 || val === null) return "";
		if (typeof val === "string") return val;
		return JSON.stringify(val);
	});
}
const templateCommand = {
	name: "template",
	meta: {
		description: "Render a simple {{path}} template against each input item",
		argsSchema: {
			type: "object",
			properties: {
				text: {
					type: "string",
					description: "Template text (supports {{path}}; {{.}} for the whole item)"
				},
				file: {
					type: "string",
					description: "Template file path"
				},
				_: {
					type: "array",
					items: { type: "string" }
				}
			},
			required: []
		},
		sideEffects: []
	},
	help() {
		return "template — render a simple template against each item\n\nUsage:\n  ... | template --text 'PR {{number}}: {{title}}'\n  ... | template --file ./draft.txt\n\nTemplate syntax:\n  - {{field}} or {{nested.field}}\n  - {{.}} for the whole item\n  - Missing values render as empty string\n";
	},
	async run({ input, args }) {
		let tpl = typeof args.text === "string" ? args.text : void 0;
		const file = typeof args.file === "string" ? args.file : void 0;
		if (!tpl && file) tpl = await fs$1.readFile(file, "utf8");
		if (!tpl) {
			const positional = Array.isArray(args._) ? args._ : [];
			if (positional.length) tpl = positional.join(" ");
		}
		if (!tpl) throw new Error("template requires --text or --file (or positional text)");
		return { output: (async function* () {
			for await (const item of input) yield renderTemplate$1(String(tpl), item);
		})() };
	}
};
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/commands/stdlib/map.js
function getByPath$1(obj, path) {
	if (path === "." || path === "this") return obj;
	const parts = path.split(".").filter(Boolean);
	let cur = obj;
	for (const p of parts) {
		if (cur == null) return void 0;
		cur = cur[p];
	}
	return cur;
}
function renderTemplate(tpl, ctx) {
	return tpl.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_m, expr) => {
		const val = getByPath$1(ctx, String(expr ?? "").trim());
		if (val === void 0 || val === null) return "";
		if (typeof val === "string") return val;
		return JSON.stringify(val);
	});
}
function parseAssignments(tokens) {
	const out = [];
	for (const tok of tokens ?? []) {
		const s = String(tok);
		const idx = s.indexOf("=");
		if (idx === -1) continue;
		const key = s.slice(0, idx).trim();
		const value = s.slice(idx + 1);
		if (!key) continue;
		out.push({
			key,
			value
		});
	}
	return out;
}
const mapCommand = {
	name: "map",
	meta: {
		description: "Transform items (wrap/unwrap/add fields)",
		argsSchema: {
			type: "object",
			properties: {
				wrap: {
					type: "string",
					description: "Wrap each item as {wrap: item}"
				},
				unwrap: {
					type: "string",
					description: "Unwrap a field (yield item[unwrap])"
				},
				_: {
					type: "array",
					items: { type: "string" },
					description: "Optional assignments like key=value (value supports {{path}})"
				}
			},
			required: []
		},
		sideEffects: []
	},
	help() {
		return "map — transform items\n\nUsage:\n  ... | map --wrap item\n  ... | map --unwrap item\n  ... | map foo=bar id={{id}}\n\nNotes:\n  - Assignments are added to an object item (preserves existing fields).\n  - Assignment values support template placeholders like {{id}} and {{nested.field}}.\n";
	},
	async run({ input, args }) {
		const wrap = typeof args.wrap === "string" ? args.wrap : void 0;
		const unwrap = typeof args.unwrap === "string" ? args.unwrap : void 0;
		const assignments = parseAssignments(Array.isArray(args._) ? args._ : []);
		if (wrap && unwrap) throw new Error("map cannot use both --wrap and --unwrap");
		return { output: (async function* () {
			for await (const item of input) {
				let cur = item;
				if (unwrap) {
					if (cur && typeof cur === "object") cur = cur[unwrap];
					else cur = void 0;
					yield cur;
					continue;
				}
				if (wrap) cur = { [wrap]: cur };
				if (assignments.length > 0) {
					if (cur === null || typeof cur !== "object" || Array.isArray(cur)) cur = { value: cur };
					for (const { key, value } of assignments) cur[key] = renderTemplate(String(value), item);
				}
				yield cur;
			}
		})() };
	}
};
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/commands/stdlib/group_by.js
function getByPath(obj, path) {
	const parts = path.split(".").filter(Boolean);
	let cur = obj;
	for (const p of parts) {
		if (cur == null) return void 0;
		cur = cur[p];
	}
	return cur;
}
const groupByCommand = {
	name: "groupBy",
	meta: {
		description: "Group items by a key (stable group order)",
		argsSchema: {
			type: "object",
			properties: {
				key: {
					type: "string",
					description: "Dot-path key to group by (required)"
				},
				_: {
					type: "array",
					items: { type: "string" }
				}
			},
			required: ["key"]
		},
		sideEffects: []
	},
	help() {
		return "groupBy — group items by a key\n\nUsage:\n  ... | groupBy --key from\n\nOutput:\n  Stream of { key, items, count } objects\n\nNotes:\n  - Group order is stable (order of first appearance).\n";
	},
	async run({ input, args }) {
		const keyPath = String(args.key ?? "").trim();
		if (!keyPath) throw new Error("groupBy requires --key");
		const groups = /* @__PURE__ */ new Map();
		const order = [];
		for await (const item of input) {
			const keyVal = getByPath(item, keyPath);
			const k = JSON.stringify(keyVal);
			if (!groups.has(k)) {
				groups.set(k, {
					key: keyVal,
					items: []
				});
				order.push(k);
			}
			groups.get(k).items.push(item);
		}
		return { output: (async function* () {
			for (const k of order) {
				const g = groups.get(k);
				yield {
					key: g.key,
					items: g.items,
					count: g.items.length
				};
			}
		})() };
	}
};
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/commands/stdlib/approve.js
function isInteractive$2(stdin) {
	return Boolean(stdin.isTTY);
}
const approveCommand = {
	name: "approve",
	meta: {
		description: "Require confirmation to continue",
		argsSchema: {
			type: "object",
			properties: {
				prompt: {
					type: "string",
					description: "Approval prompt text",
					default: "Approve?"
				},
				emit: {
					type: "boolean",
					description: "Force emit approval request + halt"
				},
				_: {
					type: "array",
					items: { type: "string" }
				}
			},
			required: []
		},
		sideEffects: []
	},
	help() {
		return `approve — require confirmation to continue\n\nUsage:\n  ... | approve --prompt "Send these emails?"\n  ... | approve --emit --prompt "Send these emails?"\n  ... | approve --emit --preview-from-stdin --limit 5 --prompt "Proceed?"\n\nModes:\n  - Interactive (default): prompts on TTY and passes items through if approved.\n  - Emit (--emit): returns an approval request object and stops the pipeline.\n\nNotes:\n  - In tool mode (or non-interactive), this emits an approval request and halts.\n`;
	},
	async run({ input, args, ctx }) {
		const prompt = args.prompt ?? "Approve?";
		const previewFromStdin = Boolean(args.previewFromStdin ?? args["preview-from-stdin"]);
		const previewLimitRaw = args.limit ?? args.previewLimit ?? args["preview-limit"];
		const previewLimit = Number.isFinite(Number(previewLimitRaw)) ? Number(previewLimitRaw) : 5;
		const items = [];
		for await (const item of input) items.push(item);
		if (Boolean(args.emit) || ctx.mode === "tool" || !isInteractive$2(ctx.stdin)) {
			const preview = previewFromStdin ? buildPreview(items.slice(0, Math.max(0, previewLimit))) : void 0;
			return {
				halt: true,
				output: (async function* () {
					yield {
						type: "approval_request",
						prompt,
						items,
						...preview ? { preview } : null
					};
				})()
			};
		}
		ctx.stdout.write(`${prompt} [y/N] `);
		const answer = await readLineFromStream(ctx.stdin, { timeoutMs: parseApprovalTimeoutMs$1(ctx.env) });
		if (!/^y(es)?$/i.test(String(answer).trim())) throw new Error("Not approved");
		return { output: asStream$4(items) };
	}
};
function buildPreview(items) {
	if (!items.length) return "";
	if (items.every((item) => typeof item === "string")) return items.join("\n");
	return JSON.stringify(items, null, 2);
}
function parseApprovalTimeoutMs$1(env) {
	const raw = env?.LOBSTER_APPROVAL_INPUT_TIMEOUT_MS;
	const value = Number(raw);
	if (!Number.isFinite(value) || value <= 0) return 0;
	return Math.floor(value);
}
async function* asStream$4(items) {
	for (const item of items) yield item;
}
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/validation.js
const sharedAjv = new Ajv({
	allErrors: false,
	strict: false,
	addUsedSchema: false
});
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/commands/stdlib/ask.js
function isInteractive$1(stdin) {
	return Boolean(stdin.isTTY);
}
function compileAskValidator(schema) {
	try {
		return sharedAjv.compile(schema);
	} catch {
		throw new Error("ask response schema is invalid");
	}
}
function validateAskResponse(validator, response) {
	if (validator(response)) return;
	const first = validator.errors?.[0];
	const pathValue = first?.instancePath || "/";
	const reason = first?.message ? ` ${first.message}` : "";
	throw new Error(`ask response failed schema validation at ${pathValue}:${reason}`);
}
function parseInteractiveCandidates(text) {
	let parsed;
	try {
		parsed = JSON.parse(text);
	} catch {
		return [text, { decision: text }];
	}
	if (typeof parsed === "string") return [parsed, { decision: parsed }];
	return [parsed];
}
const askCommand = {
	name: "ask",
	meta: {
		description: "Pause and request structured input from the user",
		argsSchema: {
			type: "object",
			properties: {
				prompt: {
					type: "string",
					description: "Question or instruction to show",
					default: "Input required"
				},
				schema: {
					type: "string",
					description: "JSON Schema string for the expected response"
				},
				"subject-from-stdin": {
					type: "boolean",
					description: "Use stdin content as the subject (preview text)"
				},
				emit: {
					type: "boolean",
					description: "Force emit mode"
				},
				_: {
					type: "array",
					items: { type: "string" }
				}
			},
			required: []
		},
		sideEffects: []
	},
	help() {
		return [
			"ask — pause and request structured input from the user",
			"",
			"Usage:",
			"  ... | ask --prompt \"Approve, reject, or send feedback:\"",
			"  ... | ask --prompt \"Feedback?\" --schema '{\"type\":\"object\",\"properties\":{\"decision\":{\"type\":\"string\"},\"feedback\":{\"type\":\"string\"}},\"required\":[\"decision\"]}'",
			"  ... | ask --subject-from-stdin --prompt \"Review this draft:\"",
			"",
			"Notes:",
			"  - In tool mode (or non-interactive), emits a needs_input envelope and halts.",
			"  - Use --schema to constrain the response shape (JSON Schema).",
			"  - Use --subject-from-stdin to embed the current pipeline value as preview text."
		].join("\n");
	},
	async run({ input, args, ctx }) {
		const prompt = typeof args.prompt === "string" ? args.prompt : "Input required";
		const subjectFromStdin = Boolean(args["subject-from-stdin"] ?? args.subjectFromStdin);
		const schemaRaw = typeof args.schema === "string" ? args.schema : null;
		const items = [];
		for await (const item of input) items.push(item);
		let responseSchema = {
			type: "object",
			properties: {
				decision: {
					type: "string",
					enum: [
						"approve",
						"reject",
						"redraft"
					]
				},
				feedback: {
					type: "string",
					description: "Feedback for redraft"
				}
			},
			required: ["decision"]
		};
		if (schemaRaw) {
			let parsedSchema;
			try {
				parsedSchema = JSON.parse(schemaRaw);
			} catch {
				throw new Error("ask --schema must be valid JSON");
			}
			if (!parsedSchema || typeof parsedSchema !== "object" || Array.isArray(parsedSchema)) throw new Error("ask --schema must decode to a JSON schema object");
			responseSchema = parsedSchema;
		}
		const responseValidator = compileAskValidator(responseSchema);
		let subject;
		if (subjectFromStdin && items.length > 0) subject = { text: items.map((item) => typeof item === "string" ? item : JSON.stringify(item)).join("\n").slice(0, 2e3) };
		if (Boolean(args.emit) || ctx.mode === "tool" || !isInteractive$1(ctx.stdin)) return {
			halt: true,
			output: (async function* () {
				yield {
					type: "input_request",
					prompt,
					responseSchema,
					...subject ? { subject } : null,
					items
				};
			})()
		};
		ctx.stdout.write(`${prompt}\n> `);
		const { readLineFromStream } = await import("../../read_line-CVrsLQX_.js");
		const raw = await readLineFromStream(ctx.stdin, { timeoutMs: 0 });
		const text = String(raw ?? "").trim();
		let lastError;
		for (const candidate of parseInteractiveCandidates(text)) try {
			validateAskResponse(responseValidator, candidate);
			return { output: (async function* () {
				yield candidate;
			})() };
		} catch (err) {
			lastError = err;
		}
		throw lastError ?? /* @__PURE__ */ new Error("ask response failed schema validation");
	}
};
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/commands/stdlib/openclaw_invoke.js
function createInvokeCommand(commandName) {
	return {
		name: commandName,
		meta: {
			description: "Call a local OpenClaw tool endpoint",
			argsSchema: {
				type: "object",
				properties: {
					url: {
						type: "string",
						description: "OpenClaw control URL (or OPENCLAW_URL / CLAWD_URL)"
					},
					token: {
						type: "string",
						description: "Bearer token (or OPENCLAW_TOKEN / CLAWD_TOKEN)"
					},
					tool: {
						type: "string",
						description: "Tool name (e.g. message, cron, github, etc.)"
					},
					action: {
						type: "string",
						description: "Tool action"
					},
					"args-json": {
						type: "string",
						description: "JSON string of tool args"
					},
					sessionKey: {
						type: "string",
						description: "Optional session key attribution"
					},
					"session-key": {
						type: "string",
						description: "Alias for sessionKey"
					},
					dryRun: {
						type: "boolean",
						description: "Dry run"
					},
					"dry-run": {
						type: "boolean",
						description: "Alias for dryRun"
					},
					each: {
						type: "boolean",
						description: "Map each pipeline item into tool args"
					},
					itemKey: {
						type: "string",
						description: "Key to set from the pipeline item (default: item)"
					},
					"item-key": {
						type: "string",
						description: "Alias for itemKey"
					},
					_: {
						type: "array",
						items: { type: "string" }
					}
				},
				required: ["tool", "action"]
			},
			sideEffects: ["calls_clawd_tool"]
		},
		help() {
			return `${commandName} — call a local OpenClaw tool endpoint\n\nUsage:\n  ${commandName} --tool message --action send --args-json '{"provider":"telegram","to":"...","message":"..."}'\n  ${commandName} --tool message --action send --args-json '{...}' --dry-run\n  ... | ${commandName} --tool message --action send --each --item-key message --args-json '{"provider":"telegram","to":"..."}'\n\nConfig:\n  - Uses OPENCLAW_URL env var by default (or pass --url).\n  - Backward compatible: CLAWD_URL is also supported.\n  - Optional Bearer token via OPENCLAW_TOKEN env var (or pass --token).\n  - Backward compatible: CLAWD_TOKEN is also supported.\n  - Optional attribution via --session-key <sessionKey>.\n\nNotes:\n  - This is a thin transport bridge. Lobster should not own OAuth/secrets.\n`;
		},
		async run({ input, args, ctx }) {
			const each = Boolean(args.each);
			const itemKey = String(args.itemKey ?? args["item-key"] ?? "item");
			const url = String(args.url ?? ctx.env.OPENCLAW_URL ?? ctx.env.CLAWD_URL ?? "").trim();
			if (!url) throw new Error(`${commandName} requires --url or OPENCLAW_URL`);
			const tool = args.tool;
			const action = args.action;
			if (!tool || !action) throw new Error(`${commandName} requires --tool and --action`);
			const token = String(args.token ?? ctx.env.OPENCLAW_TOKEN ?? ctx.env.CLAWD_TOKEN ?? "").trim();
			let toolArgs = {};
			if (args["args-json"]) try {
				toolArgs = JSON.parse(String(args["args-json"]));
			} catch (_err) {
				throw new Error(`${commandName} --args-json must be valid JSON`);
			}
			if (each && (toolArgs === null || typeof toolArgs !== "object" || Array.isArray(toolArgs))) throw new Error(`${commandName} --each requires --args-json to be an object`);
			const endpoint = new URL("/tools/invoke", url);
			const sessionKey = args.sessionKey ?? args["session-key"] ?? null;
			const dryRun = args.dryRun ?? args["dry-run"] ?? null;
			const invokeOnce = async (argsValue) => {
				const res = await fetch(endpoint, {
					method: "POST",
					headers: {
						"content-type": "application/json",
						...token ? { authorization: `Bearer ${token}` } : null
					},
					body: JSON.stringify({
						tool: String(tool),
						action: String(action),
						args: argsValue,
						...sessionKey ? { sessionKey: String(sessionKey) } : null,
						...dryRun !== null ? { dryRun: Boolean(dryRun) } : null
					})
				});
				const text = await res.text();
				if (!res.ok) throw new Error(`${commandName} failed (${res.status}): ${text.slice(0, 400)}`);
				let parsed;
				try {
					parsed = text ? JSON.parse(text) : null;
				} catch (_err) {
					throw new Error(`${commandName} expected JSON response`);
				}
				if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && "ok" in parsed) {
					if (parsed.ok !== true) {
						const msg = parsed?.error?.message ?? "Unknown error";
						throw new Error(`${commandName} tool error: ${msg}`);
					}
					const result = parsed.result;
					return Array.isArray(result) ? result : [result];
				}
				return Array.isArray(parsed) ? parsed : [parsed];
			};
			if (!each) {
				for await (const _item of input);
				return { output: asStream$3(await invokeOnce(toolArgs)) };
			}
			const out = [];
			for await (const item of input) {
				const items = await invokeOnce({
					...toolArgs,
					[itemKey]: item
				});
				out.push(...items);
			}
			return { output: asStream$3(out) };
		}
	};
}
async function* asStream$3(items) {
	for (const item of items) yield item;
}
const openclawInvokeCommand = createInvokeCommand("openclaw.invoke");
const clawdInvokeCommand = createInvokeCommand("clawd.invoke");
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/state/store.js
function defaultStateDir(env) {
	return env?.LOBSTER_STATE_DIR && String(env.LOBSTER_STATE_DIR).trim() || path.join(os.homedir(), ".lobster", "state");
}
function keyToPath(stateDir, key) {
	const safe = String(key).toLowerCase().replace(/[^a-z0-9._-]+/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "");
	if (!safe) throw new Error("state key is empty/invalid");
	return path.join(stateDir, `${safe}.json`);
}
function stableStringify(value) {
	return JSON.stringify(value, (_k, v) => {
		if (v && typeof v === "object" && !Array.isArray(v)) return Object.fromEntries(Object.keys(v).sort().map((k) => [k, v[k]]));
		return v;
	});
}
async function readStateJson({ env, key }) {
	const filePath = keyToPath(defaultStateDir(env), key);
	try {
		const text = await promises.readFile(filePath, "utf8");
		return JSON.parse(text);
	} catch (err) {
		if (err?.code === "ENOENT") return null;
		throw err;
	}
}
async function writeStateJson({ env, key, value }) {
	const stateDir = defaultStateDir(env);
	const filePath = keyToPath(stateDir, key);
	await promises.mkdir(stateDir, { recursive: true });
	await promises.writeFile(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}
async function deleteStateJson({ env, key }) {
	const filePath = keyToPath(defaultStateDir(env), key);
	try {
		await promises.unlink(filePath);
	} catch (err) {
		if (err?.code === "ENOENT") return;
		throw err;
	}
}
function sanitizeApprovalId(approvalId) {
	return approvalId.replace(/[^a-f0-9]/g, "");
}
/**
* Generate a short, human-friendly approval ID (8 hex chars).
* These are easy to copy/paste in chat interfaces where full
* base64url resume tokens are unwieldy.
*/
function generateApprovalId() {
	return randomBytes(4).toString("hex");
}
/**
* Write a reverse-index file that maps approvalId → stateKey.
* Call this after writeStateJson to enable short-ID resume.
*/
async function writeApprovalIndex({ env, stateKey, approvalId }) {
	const stateDir = defaultStateDir(env);
	const safe = sanitizeApprovalId(approvalId);
	if (!safe) return;
	await promises.mkdir(stateDir, { recursive: true });
	const indexPath = path.join(stateDir, `approval_${safe}.json`);
	await promises.writeFile(indexPath, JSON.stringify({
		stateKey,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	}) + "\n", {
		encoding: "utf8",
		flag: "wx",
		mode: 384
	});
}
/**
* Create a unique approval ID index without ever overwriting an existing mapping.
*/
async function createApprovalIndex({ env, stateKey }) {
	for (let attempt = 0; attempt < 16; attempt++) {
		const approvalId = generateApprovalId();
		try {
			await writeApprovalIndex({
				env,
				stateKey,
				approvalId
			});
			return approvalId;
		} catch (err) {
			if (err?.code === "EEXIST") continue;
			throw err;
		}
	}
	throw new Error("Could not allocate a unique approval ID");
}
/**
* Look up a state key by short approval ID.
* Returns the stateKey string or null if not found.
*/
async function findStateKeyByApprovalId({ env, approvalId }) {
	const stateDir = defaultStateDir(env);
	const safe = sanitizeApprovalId(approvalId);
	if (!safe) return null;
	const indexPath = path.join(stateDir, `approval_${safe}.json`);
	try {
		const text = await promises.readFile(indexPath, "utf8");
		const data = JSON.parse(text);
		return typeof data?.stateKey === "string" ? data.stateKey : null;
	} catch (err) {
		if (err?.code === "ENOENT") return null;
		throw err;
	}
}
/**
* Delete the approval ID index file (cleanup after resume or cancel).
*/
async function deleteApprovalId({ env, approvalId }) {
	const stateDir = defaultStateDir(env);
	const safe = sanitizeApprovalId(approvalId);
	if (!safe) return;
	const indexPath = path.join(stateDir, `approval_${safe}.json`);
	try {
		await promises.unlink(indexPath);
	} catch (err) {
		if (err?.code === "ENOENT") return;
		throw err;
	}
}
/**
* Clean up any approval index file that points to the given stateKey.
* Used when resuming via --token (where we don't know the approvalId).
* Scans index files in the state dir — O(n) but n is tiny in practice.
*/
async function cleanupApprovalIndexByStateKey({ env, stateKey }) {
	const stateDir = defaultStateDir(env);
	let files;
	try {
		files = await promises.readdir(stateDir);
	} catch (err) {
		if (err?.code === "ENOENT") return;
		throw err;
	}
	for (const file of files) {
		if (!file.startsWith("approval_") || !file.endsWith(".json")) continue;
		try {
			const text = await promises.readFile(path.join(stateDir, file), "utf8");
			if (JSON.parse(text)?.stateKey === stateKey) {
				await promises.unlink(path.join(stateDir, file)).catch(() => {});
				return;
			}
		} catch {}
	}
}
async function diffAndStore({ env, key, value }) {
	const before = await readStateJson({
		env,
		key
	});
	const changed = stableStringify(before) !== stableStringify(value);
	await writeStateJson({
		env,
		key,
		value
	});
	return {
		before,
		after: value,
		changed
	};
}
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/commands/stdlib/llm_invoke.js
const ajv = new Ajv({
	allErrors: true,
	strict: false
});
const payloadSchema = {
	type: "object",
	properties: {
		prompt: {
			type: "string",
			minLength: 1
		},
		model: {
			type: "string",
			minLength: 1
		},
		artifacts: {
			type: "array",
			items: {
				type: "object",
				properties: {
					kind: { type: "string" },
					role: { type: "string" },
					name: { type: "string" },
					mimeType: { type: "string" },
					text: { type: "string" },
					data: {},
					uri: { type: "string" }
				},
				additionalProperties: true
			}
		},
		artifactHashes: {
			type: "array",
			items: {
				type: "string",
				minLength: 10
			}
		},
		schemaVersion: { type: "string" },
		metadata: {
			type: "object",
			additionalProperties: true
		},
		outputSchema: {
			type: "object",
			additionalProperties: true
		},
		temperature: { type: "number" },
		maxOutputTokens: { type: "number" },
		retryContext: {
			type: "object",
			properties: {
				attempt: { type: "number" },
				validationErrors: {
					type: "array",
					items: { type: "string" }
				}
			},
			additionalProperties: false
		}
	},
	required: [
		"prompt",
		"artifacts",
		"artifactHashes"
	],
	additionalProperties: false
};
const responseSchema = {
	type: "object",
	properties: {
		ok: { type: "boolean" },
		result: {
			type: "object",
			properties: {
				runId: { type: "string" },
				model: { type: "string" },
				prompt: { type: "string" },
				status: { type: "string" },
				output: {
					type: "object",
					properties: {
						text: { type: "string" },
						data: {},
						format: { type: "string" }
					},
					required: [],
					additionalProperties: true
				},
				usage: {
					type: "object",
					properties: {
						inputTokens: { type: "number" },
						outputTokens: { type: "number" },
						totalTokens: { type: "number" }
					},
					additionalProperties: true
				},
				warnings: {
					type: "array",
					items: { type: "string" }
				},
				metadata: {
					type: "object",
					additionalProperties: true
				},
				diagnostics: {
					type: "object",
					additionalProperties: true
				}
			},
			required: ["output"],
			additionalProperties: true
		},
		error: {
			type: "object",
			additionalProperties: true
		}
	},
	required: ["ok"],
	additionalProperties: true
};
const validatePayload = ajv.compile(payloadSchema);
const validateResponseEnvelope = ajv.compile(responseSchema);
const DEFAULT_MAX_VALIDATION_RETRIES = 1;
const STATE_VERSION = 1;
const llmInvokeCommand = createLlmInvokeCommand({
	name: "llm.invoke",
	itemKind: "llm.invoke",
	stateType: "llm.invoke",
	cacheNamespace: "llm.invoke",
	defaultProvider: null,
	description: "Call a configured LLM adapter with typed payloads and caching",
	helpTitle: "llm.invoke — call a configured LLM adapter with caching and schema validation",
	helpConfig: [
		"Provider resolution order: --provider, LOBSTER_LLM_PROVIDER, then environment auto-detect.",
		"Built-in providers: openclaw, pi, http.",
		"OpenClaw provider uses OPENCLAW_URL (CLAWD_URL also supported) and OPENCLAW_TOKEN.",
		"Pi provider uses LOBSTER_PI_LLM_ADAPTER_URL and is intended to be supplied by a Pi extension.",
		"Generic http provider uses LOBSTER_LLM_ADAPTER_URL and optional LOBSTER_LLM_ADAPTER_TOKEN."
	],
	helpExamples: [
		"llm.invoke --prompt 'Write summary'",
		"llm.invoke --provider openclaw --model claude-3-sonnet --prompt 'Write summary'",
		"cat artifacts.json | llm.invoke --provider pi --prompt 'Score each item'",
		"... | llm.invoke --prompt 'Plan next steps' --output-schema '{\"type\":\"object\"}'"
	],
	sourceForProvider(provider) {
		return provider;
	},
	legacyEnvCompat: true
});
const llmTaskInvokeCommand = createLlmInvokeCommand({
	name: "llm_task.invoke",
	itemKind: "llm_task.invoke",
	stateType: "llm_task.invoke",
	cacheNamespace: "llm_task.invoke",
	defaultProvider: "openclaw",
	description: "Backward-compatible alias for llm.invoke using the OpenClaw adapter",
	helpTitle: "llm_task.invoke — backward-compatible alias for llm.invoke using OpenClaw",
	helpConfig: ["Requires OPENCLAW_URL (or CLAWD_URL) and optionally OPENCLAW_TOKEN.", "Use llm.invoke for new workflows and non-OpenClaw adapters."],
	helpExamples: [
		"llm_task.invoke --prompt 'Write summary'",
		"llm_task.invoke --model claude-3-sonnet --prompt 'Write summary'",
		"cat artifacts.json | llm_task.invoke --prompt 'Score each item'"
	],
	sourceForProvider() {
		return "clawd";
	},
	legacyEnvCompat: true
});
function createLlmInvokeCommand(config) {
	return {
		name: config.name,
		meta: {
			description: config.description,
			argsSchema: {
				type: "object",
				properties: {
					provider: {
						type: "string",
						description: "LLM adapter provider (openclaw, pi, http). Optional if auto-detected."
					},
					token: {
						type: "string",
						description: "Optional bearer token for providers that support it."
					},
					prompt: {
						type: "string",
						description: "Primary prompt / instructions"
					},
					model: {
						type: "string",
						description: "Model identifier. Optional; adapter defaults may apply if omitted."
					},
					"artifacts-json": {
						type: "string",
						description: "JSON array of artifacts to send"
					},
					"metadata-json": {
						type: "string",
						description: "JSON object of metadata to include"
					},
					"output-schema": {
						type: "string",
						description: "JSON schema LLM output must satisfy"
					},
					"schema-version": {
						type: "string",
						description: "Logical schema version for caching"
					},
					"max-validation-retries": {
						type: "number",
						description: "Retries when schema validation fails"
					},
					temperature: {
						type: "number",
						description: "Sampling temperature"
					},
					"max-output-tokens": {
						type: "number",
						description: "Max completion tokens"
					},
					"state-key": {
						type: "string",
						description: "Run-state key override (else LOBSTER_RUN_STATE_KEY)"
					},
					refresh: {
						type: "boolean",
						description: "Bypass run-state + cache"
					},
					"disable-cache": {
						type: "boolean",
						description: "Skip persistent cache"
					},
					_: {
						type: "array",
						items: { type: "string" }
					}
				},
				required: []
			},
			sideEffects: ["calls_llm"]
		},
		help() {
			return `${[
				config.helpTitle,
				"",
				"Usage:",
				...config.helpExamples.map((example) => `  ${example}`),
				"",
				"Features:",
				"  - Typed payload validation before invoking the adapter.",
				"  - Run-state + file cache so resumes do not re-call the LLM.",
				"  - Optional JSON-schema enforcement with bounded retries.",
				"",
				"Config:",
				...config.helpConfig.map((line) => `  - ${line}`)
			].join("\n")}\n`;
		},
		async run({ input, args, ctx }) {
			return runLlmInvoke({
				input,
				args,
				ctx,
				config
			});
		}
	};
}
async function runLlmInvoke({ input, args, ctx, config }) {
	const env = ctx.env ?? process.env;
	const provider = resolveProvider(args, env, config.defaultProvider, ctx);
	const adapter = resolveAdapter({
		provider,
		env,
		args,
		config,
		ctx
	});
	const prompt = extractPrompt(args);
	if (!prompt) throw new Error(`${config.name} requires --prompt or positional text`);
	const model = resolveModel(args, env, config.legacyEnvCompat);
	const schemaVersion = resolveEnvString(args["schema-version"], ["LOBSTER_LLM_SCHEMA_VERSION", ...config.legacyEnvCompat ? ["LLM_TASK_SCHEMA_VERSION"] : []], env, "v1");
	const maxOutputTokens = parseOptionalNumber(args["max-output-tokens"]);
	const temperature = parseOptionalNumber(args.temperature);
	const providedArtifacts = parseJsonArray(args["artifacts-json"], `${config.name} --artifacts-json`);
	const metadataObject = parseJsonObject(args["metadata-json"], `${config.name} --metadata-json`);
	const userOutputSchema = parseJsonObject(args["output-schema"], `${config.name} --output-schema`);
	const maxValidationRetriesRaw = args["max-validation-retries"] ?? getFirstEnv(env, ["LOBSTER_LLM_VALIDATION_RETRIES", ...config.legacyEnvCompat ? ["LLM_TASK_VALIDATION_RETRIES"] : []]);
	const maxValidationRetries = userOutputSchema ? Math.max(0, Number.isFinite(Number(maxValidationRetriesRaw)) ? Number(maxValidationRetriesRaw) : DEFAULT_MAX_VALIDATION_RETRIES) : 0;
	const disableCache = flag(args["disable-cache"]);
	const forceRefresh = flag(args.refresh ?? getFirstEnv(env, ["LOBSTER_LLM_FORCE_REFRESH", ...config.legacyEnvCompat ? ["LLM_TASK_FORCE_REFRESH"] : []]));
	const stateKey = String(args["state-key"] ?? env.LOBSTER_RUN_STATE_KEY ?? "").trim() || null;
	const inputArtifacts = [];
	for await (const item of input) inputArtifacts.push(item);
	const normalizedArtifacts = [...inputArtifacts, ...providedArtifacts].map(normalizeArtifact);
	const artifactHashes = normalizedArtifacts.map(hashArtifact);
	const cacheKey = computeCacheKey({
		provider,
		prompt,
		model,
		schemaVersion,
		artifactHashes,
		outputSchema: userOutputSchema
	});
	if (stateKey && !forceRefresh) {
		const reused = pickReusableState(await readStateJson({
			env,
			key: stateKey
		}).catch(() => null), cacheKey, config.stateType);
		if (reused) return { output: streamOf$1(reused.items.map((item) => ({
			...item,
			source: "run_state",
			cached: true
		}))) };
	}
	if (!disableCache && !forceRefresh) {
		const cache = await readCacheEntry(env, cacheKey, config.cacheNamespace);
		if (cache) return { output: streamOf$1(cache.items.map((item) => ({
			...item,
			source: "cache",
			cached: true
		}))) };
	}
	const payload = {
		prompt,
		...model ? { model } : null,
		artifacts: normalizedArtifacts,
		artifactHashes
	};
	if (metadataObject) payload.metadata = metadataObject;
	if (userOutputSchema) payload.outputSchema = userOutputSchema;
	if (schemaVersion) payload.schemaVersion = schemaVersion;
	if (Number.isFinite(maxOutputTokens ?? NaN)) payload.maxOutputTokens = Number(maxOutputTokens);
	if (Number.isFinite(temperature ?? NaN)) payload.temperature = Number(temperature);
	if (!validatePayload(payload)) throw new Error(`${config.name} payload invalid: ${ajv.errorsText(validatePayload.errors)}`);
	const validator = userOutputSchema ? ajv.compile(userOutputSchema) : null;
	let attempt = 0;
	let lastValidationErrors = [];
	while (true) {
		attempt += 1;
		if (attempt > 1) payload.retryContext = {
			attempt,
			...lastValidationErrors.length ? { validationErrors: lastValidationErrors } : null
		};
		else delete payload.retryContext;
		let responseEnvelope;
		try {
			responseEnvelope = await adapter.invoke({
				env,
				args,
				payload
			});
		} catch (err) {
			throw new Error(`${config.name} request failed: ${err?.message ?? String(err)}`);
		}
		if (!validateResponseEnvelope(responseEnvelope)) throw new Error(`${config.name} received invalid response envelope`);
		if (responseEnvelope.ok !== true) {
			const message = responseEnvelope.error?.message ?? "llm adapter returned an error";
			throw new Error(`${config.name} remote error: ${message}`);
		}
		const normalized = normalizeResult({
			envelope: responseEnvelope,
			cacheKey,
			schemaVersion,
			artifactHashes,
			source: adapter.source,
			attempt,
			itemKind: config.itemKind
		});
		if (!validator) {
			await persistOutputs({
				env,
				stateKey,
				cacheKey,
				items: normalized,
				stateType: config.stateType
			});
			if (!disableCache) await writeCacheEntry(env, cacheKey, normalized, config.cacheNamespace);
			return { output: streamOf$1(normalized) };
		}
		if (validator(normalized[0]?.output?.data ?? null)) {
			await persistOutputs({
				env,
				stateKey,
				cacheKey,
				items: normalized,
				stateType: config.stateType
			});
			if (!disableCache) await writeCacheEntry(env, cacheKey, normalized, config.cacheNamespace);
			return { output: streamOf$1(normalized) };
		}
		lastValidationErrors = collectAjvErrors(validator.errors);
		if (attempt > maxValidationRetries + 1) throw new Error(`${config.name} output failed schema validation: ${lastValidationErrors.join("; ")}`);
	}
}
function resolveProvider(args, env, defaultProvider, ctx) {
	const explicit = String(args.provider ?? env.LOBSTER_LLM_PROVIDER ?? "").trim().toLowerCase();
	if (explicit) {
		if (explicit === "openclaw" || explicit === "pi" || explicit === "http") return explicit;
		if (getDirectAdapter(ctx, explicit)) return explicit;
		throw new Error(`Unsupported llm provider: ${explicit}`);
	}
	if (defaultProvider) return defaultProvider;
	const directAdapters = ctx?.llmAdapters && typeof ctx.llmAdapters === "object" ? Object.keys(ctx.llmAdapters).filter((key) => getDirectAdapter(ctx, key)) : [];
	if (directAdapters.length === 1) return directAdapters[0];
	if (String(env.LOBSTER_PI_LLM_ADAPTER_URL ?? "").trim()) return "pi";
	if (String(env.OPENCLAW_URL ?? env.CLAWD_URL ?? "").trim()) return "openclaw";
	if (String(env.LOBSTER_LLM_ADAPTER_URL ?? "").trim()) return "http";
	throw new Error("llm.invoke could not resolve a provider. Set --provider or LOBSTER_LLM_PROVIDER");
}
function resolveAdapter({ provider, env, args, config, ctx }) {
	const direct = getDirectAdapter(ctx, provider);
	if (direct) {
		const invoke = typeof direct === "function" ? direct : direct.invoke;
		return {
			provider,
			source: typeof direct === "function" ? provider : direct.source ?? provider,
			async invoke({ payload }) {
				return invoke({
					env,
					args,
					payload,
					ctx
				});
			}
		};
	}
	if (provider === "openclaw") {
		const openclawUrl = String(env.OPENCLAW_URL ?? env.CLAWD_URL ?? "").trim();
		if (!openclawUrl) throw new Error(`${config.name} requires OPENCLAW_URL (or CLAWD_URL) for provider=openclaw`);
		const endpoint = new URL("/tools/invoke", openclawUrl);
		const token = String(args.token ?? env.OPENCLAW_TOKEN ?? env.CLAWD_TOKEN ?? "").trim();
		return {
			provider,
			source: config.sourceForProvider?.(provider) ?? "openclaw",
			async invoke({ payload }) {
				return invokeOpenClawAdapter({
					endpoint,
					token,
					payload
				});
			}
		};
	}
	if (provider === "pi") {
		const adapterUrl = String(env.LOBSTER_PI_LLM_ADAPTER_URL ?? "").trim();
		if (!adapterUrl) throw new Error(`${config.name} requires LOBSTER_PI_LLM_ADAPTER_URL for provider=pi`);
		const token = String(args.token ?? env.LOBSTER_PI_LLM_ADAPTER_TOKEN ?? "").trim();
		return {
			provider,
			source: config.sourceForProvider?.(provider) ?? "pi",
			async invoke({ payload }) {
				return invokeHttpAdapter({
					endpoint: buildAdapterEndpoint(adapterUrl),
					token,
					payload
				});
			}
		};
	}
	const adapterUrl = String(env.LOBSTER_LLM_ADAPTER_URL ?? "").trim();
	if (!adapterUrl) throw new Error(`${config.name} requires LOBSTER_LLM_ADAPTER_URL for provider=http`);
	const token = String(args.token ?? env.LOBSTER_LLM_ADAPTER_TOKEN ?? "").trim();
	return {
		provider,
		source: config.sourceForProvider?.(provider) ?? "http",
		async invoke({ payload }) {
			return invokeHttpAdapter({
				endpoint: buildAdapterEndpoint(adapterUrl),
				token,
				payload
			});
		}
	};
}
function getDirectAdapter(ctx, provider) {
	const adapters = ctx?.llmAdapters;
	if (!adapters || typeof adapters !== "object") return null;
	const adapter = adapters[provider];
	if (typeof adapter === "function") return adapter;
	if (adapter && typeof adapter === "object" && typeof adapter.invoke === "function") return adapter;
	return null;
}
function buildAdapterEndpoint(rawUrl) {
	const endpoint = new URL(rawUrl);
	if (endpoint.pathname === "/" || endpoint.pathname === "") endpoint.pathname = "/invoke";
	return endpoint;
}
async function invokeOpenClawAdapter({ endpoint, token, payload }) {
	const res = await fetch(endpoint, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			...token ? { authorization: `Bearer ${token}` } : null
		},
		body: JSON.stringify({
			tool: "llm-task",
			action: "invoke",
			args: payload
		})
	});
	const text = await res.text();
	if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${text.slice(0, 400)}`);
	let parsed;
	try {
		parsed = text ? JSON.parse(text) : null;
	} catch {
		throw new Error("Response was not JSON");
	}
	if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && "ok" in parsed) {
		if (parsed.ok !== true) {
			const msg = parsed?.error?.message ?? "Unknown error";
			throw new Error(`openclaw adapter error: ${msg}`);
		}
		const inner = parsed.result;
		if (inner && typeof inner === "object" && !Array.isArray(inner) && "ok" in inner) return inner;
		return {
			ok: true,
			result: inner
		};
	}
	return {
		ok: true,
		result: parsed
	};
}
async function invokeHttpAdapter({ endpoint, token, payload }) {
	const res = await fetch(endpoint, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			...token ? { authorization: `Bearer ${token}` } : null
		},
		body: JSON.stringify(payload)
	});
	const text = await res.text();
	if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${text.slice(0, 400)}`);
	let parsed;
	try {
		parsed = text ? JSON.parse(text) : null;
	} catch {
		throw new Error("Response was not JSON");
	}
	if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && "ok" in parsed) return parsed;
	return {
		ok: true,
		result: parsed
	};
}
function resolveModel(args, env, legacyEnvCompat) {
	return resolveEnvString(args.model, ["LOBSTER_LLM_MODEL", ...legacyEnvCompat ? ["LLM_TASK_MODEL"] : []], env, "");
}
function resolveEnvString(raw, envKeys, env, fallback) {
	if (raw !== void 0 && raw !== null && String(raw).trim()) return String(raw).trim();
	const fromEnv = getFirstEnv(env, envKeys);
	if (fromEnv && String(fromEnv).trim()) return String(fromEnv).trim();
	return fallback;
}
function getFirstEnv(env, keys) {
	for (const key of keys) if (env?.[key] !== void 0 && env?.[key] !== null && String(env[key]).trim()) return env[key];
}
function extractPrompt(args) {
	if (args.prompt) return String(args.prompt);
	if (Array.isArray(args._) && args._.length) return args._.join(" ");
	return "";
}
function parseJsonArray(raw, label) {
	if (!raw) return [];
	try {
		const parsed = JSON.parse(String(raw));
		if (!Array.isArray(parsed)) throw new Error("must be array");
		return parsed;
	} catch {
		throw new Error(`${label} must be a JSON array`);
	}
}
function parseJsonObject(raw, label) {
	if (!raw) return null;
	try {
		const parsed = JSON.parse(String(raw));
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("must be an object");
		return parsed;
	} catch {
		throw new Error(`${label} must be a JSON object`);
	}
}
function parseOptionalNumber(value) {
	if (value === void 0 || value === null) return null;
	const num = Number(value);
	return Number.isFinite(num) ? num : null;
}
function flag(value) {
	if (value === void 0 || value === null) return false;
	if (typeof value === "boolean") return value;
	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase();
		if ([
			"false",
			"0",
			"no"
		].includes(normalized)) return false;
		if ([
			"true",
			"1",
			"yes"
		].includes(normalized)) return true;
	}
	return Boolean(value);
}
function normalizeArtifact(raw) {
	if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw;
	if (typeof raw === "string") return {
		kind: "text",
		text: raw
	};
	if (typeof raw === "number" || typeof raw === "boolean") return {
		kind: "text",
		text: String(raw)
	};
	return {
		kind: "json",
		data: raw
	};
}
function hashArtifact(artifact) {
	const stable = stableStringify(artifact);
	return createHash("sha256").update(stable).digest("hex");
}
function computeCacheKey({ provider, prompt, model, schemaVersion, artifactHashes, outputSchema }) {
	const payload = {
		provider,
		prompt,
		model: model || `${provider}-default`,
		schemaVersion,
		artifactHashes,
		outputSchema: outputSchema ?? null
	};
	return createHash("sha256").update(stableStringify(payload)).digest("hex");
}
function normalizeResult({ envelope, cacheKey, schemaVersion, artifactHashes, source, attempt, itemKind }) {
	const result = envelope.result ?? {};
	const output = result.output ?? {};
	return [{
		kind: itemKind,
		runId: result.runId ?? null,
		prompt: result.prompt ?? null,
		model: result.model ?? null,
		schemaVersion,
		status: String(result.status ?? "completed"),
		cacheKey,
		artifactHashes,
		output: {
			format: output.format ?? (output.data ? "json" : "text"),
			text: output.text ?? null,
			data: output.data ?? null
		},
		usage: result.usage ?? null,
		metadata: result.metadata ?? null,
		warnings: result.warnings ?? null,
		diagnostics: result.diagnostics ?? null,
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		source,
		cached: source !== "remote" && source !== "openclaw" && source !== "clawd" && source !== "pi" && source !== "http",
		attemptCount: attempt
	}];
}
async function persistOutputs({ env, stateKey, cacheKey, items, stateType }) {
	if (!stateKey) return;
	await writeStateJson({
		env,
		key: stateKey,
		value: {
			type: stateType,
			version: STATE_VERSION,
			cacheKey,
			items,
			storedAt: (/* @__PURE__ */ new Date()).toISOString()
		}
	});
}
function pickReusableState(stored, cacheKey, stateType) {
	if (!stored || typeof stored !== "object") return null;
	if (stored.type !== stateType) return null;
	if (stored.cacheKey !== cacheKey) return null;
	if (!Array.isArray(stored.items)) return null;
	return { items: stored.items };
}
function collectAjvErrors(errors) {
	if (!errors?.length) return [];
	return errors.map((err) => `${err.instancePath || "/"} ${err.message ?? ""}`.trim());
}
async function readCacheEntry(env, key, cacheNamespace) {
	const filePath = path.join(getCacheDir(env), cacheNamespace, `${key}.json`);
	try {
		const text = await promises.readFile(filePath, "utf8");
		return JSON.parse(text);
	} catch (err) {
		if (err?.code === "ENOENT") return null;
		throw err;
	}
}
async function writeCacheEntry(env, key, items, cacheNamespace) {
	const dir = path.join(getCacheDir(env), cacheNamespace);
	await promises.mkdir(dir, { recursive: true });
	const filePath = path.join(dir, `${key}.json`);
	await promises.writeFile(filePath, JSON.stringify({
		items,
		cacheKey: key,
		storedAt: (/* @__PURE__ */ new Date()).toISOString()
	}, null, 2));
}
function getCacheDir(env) {
	if (env?.LOBSTER_CACHE_DIR) return String(env.LOBSTER_CACHE_DIR);
	return path.join(process.cwd(), ".lobster-cache");
}
async function* streamOf$1(items) {
	for (const item of items) yield item;
}
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/commands/stdlib/state.js
const stateGetCommand = {
	name: "state.get",
	meta: {
		description: "Read a JSON value from Lobster state",
		argsSchema: {
			type: "object",
			properties: { _: {
				type: "array",
				items: { type: "string" },
				description: "Key"
			} },
			required: ["_"]
		},
		sideEffects: ["reads_state"]
	},
	help() {
		return `state.get — read a JSON value from Lobster state\n\nUsage:\n  state.get <key>\n\nEnv:\n  LOBSTER_STATE_DIR overrides storage directory\n`;
	},
	async run({ args, ctx }) {
		const key = args._[0];
		if (!key) throw new Error("state.get requires a key");
		const filePath = keyToPath(defaultStateDir(ctx.env), key);
		let value = null;
		try {
			const text = await promises.readFile(filePath, "utf8");
			value = JSON.parse(text);
		} catch (err) {
			if (err?.code === "ENOENT") value = null;
			else throw err;
		}
		return { output: asStream$2([value]) };
	}
};
const stateSetCommand = {
	name: "state.set",
	meta: {
		description: "Write a JSON value to Lobster state",
		argsSchema: {
			type: "object",
			properties: { _: {
				type: "array",
				items: { type: "string" },
				description: "Key"
			} },
			required: ["_"]
		},
		sideEffects: ["writes_state"]
	},
	help() {
		return `state.set — write a JSON value to Lobster state\n\nUsage:\n  <value> | state.set <key>\n\nNotes:\n  - Consumes the entire input stream; stores a single JSON value.\n`;
	},
	async run({ input, args, ctx }) {
		const key = args._[0];
		if (!key) throw new Error("state.set requires a key");
		const items = [];
		for await (const item of input) items.push(item);
		const value = items.length === 1 ? items[0] : items;
		const stateDir = defaultStateDir(ctx.env);
		const filePath = keyToPath(stateDir, key);
		await promises.mkdir(stateDir, { recursive: true });
		await promises.writeFile(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
		return { output: asStream$2([value]) };
	}
};
async function* asStream$2(items) {
	for (const item of items) yield item;
}
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/commands/stdlib/diff_last.js
const diffLastCommand = {
	name: "diff.last",
	meta: {
		description: "Compare current items to last stored snapshot",
		argsSchema: {
			type: "object",
			properties: {
				key: {
					type: "string",
					description: "State key to diff against"
				},
				_: {
					type: "array",
					items: { type: "string" }
				}
			},
			required: ["key"]
		},
		sideEffects: ["writes_state"]
	},
	help() {
		return `diff.last — compare current items to last stored snapshot\n\nUsage:\n  <items> | diff.last --key <stateKey>\n\nOutput:\n  { changed, key, before, after }\n`;
	},
	async run({ input, args, ctx }) {
		const key = args.key ?? args._[0];
		if (!key) throw new Error("diff.last requires --key");
		const afterItems = [];
		for await (const item of input) afterItems.push(item);
		const after = afterItems.length === 1 ? afterItems[0] : afterItems;
		const { before, changed } = await diffAndStore({
			env: ctx.env,
			key,
			value: after
		});
		return { output: (async function* () {
			yield {
				kind: "diff.last",
				key,
				changed,
				before,
				after
			};
		})() };
	}
};
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/workflows/registry.js
const workflowRegistry = {
	"github.pr.monitor": {
		name: "github.pr.monitor",
		description: "Fetch PR state via gh, diff against last run, emit only on change.",
		argsSchema: {
			type: "object",
			properties: {
				repo: {
					type: "string",
					description: "owner/repo (e.g. openclaw/openclaw)"
				},
				pr: {
					type: "number",
					description: "Pull request number"
				},
				key: {
					type: "string",
					description: "Optional state key override."
				},
				changesOnly: {
					type: "boolean",
					description: "If true, suppress output when unchanged."
				},
				summaryOnly: {
					type: "boolean",
					description: "If true, return only a compact change summary (smaller output)."
				}
			},
			required: ["repo", "pr"]
		},
		examples: [{
			args: {
				repo: "openclaw/openclaw",
				pr: 1152
			},
			description: "Monitor a PR and report when it changes."
		}],
		sideEffects: []
	},
	"github.pr.monitor.notify": {
		name: "github.pr.monitor.notify",
		description: "Monitor a PR and emit a single human-friendly message when it changes.",
		argsSchema: {
			type: "object",
			properties: {
				repo: {
					type: "string",
					description: "owner/repo (e.g. openclaw/openclaw)"
				},
				pr: {
					type: "number",
					description: "Pull request number"
				},
				key: {
					type: "string",
					description: "Optional state key override."
				}
			},
			required: ["repo", "pr"]
		},
		examples: [{
			args: {
				repo: "openclaw/openclaw",
				pr: 1152
			},
			description: "Emit \"PR updated\" message only when changed."
		}],
		sideEffects: []
	}
};
function listWorkflows() {
	return Object.values(workflowRegistry).map((w) => ({
		name: w.name,
		description: w.description,
		argsSchema: w.argsSchema,
		examples: w.examples,
		sideEffects: w.sideEffects
	}));
}
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/commands/workflows/workflows_list.js
const workflowsListCommand = {
	name: "workflows.list",
	meta: {
		description: "List available Lobster workflows",
		argsSchema: {
			type: "object",
			properties: {},
			required: []
		},
		sideEffects: []
	},
	help() {
		return `workflows.list — list available Lobster workflows\n\nUsage:\n  workflows.list\n\nNotes:\n  - Intended for OpenClaw to discover workflows dynamically.\n`;
	},
	async run({ input }) {
		for await (const _item of input);
		return { output: asStream$1(listWorkflows()) };
	}
};
async function* asStream$1(items) {
	for (const item of items) yield item;
}
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/workflows/github_pr_monitor.js
function runProcess(command, argv, { env, cwd }) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, argv, {
			env,
			cwd,
			stdio: [
				"ignore",
				"pipe",
				"pipe"
			]
		});
		let stdout = "";
		let stderr = "";
		child.stdout.setEncoding("utf8");
		child.stderr.setEncoding("utf8");
		child.stdout.on("data", (d) => {
			stdout += d;
		});
		child.stderr.on("data", (d) => {
			stderr += d;
		});
		child.on("error", (err) => {
			if (err?.code === "ENOENT") {
				reject(/* @__PURE__ */ new Error("gh not found on PATH (install GitHub CLI)"));
				return;
			}
			reject(err);
		});
		child.on("close", (code) => {
			if (code === 0) return resolve({
				stdout,
				stderr
			});
			reject(/* @__PURE__ */ new Error(`gh failed (${code}): ${stderr.trim() || stdout.trim()}`));
		});
	});
}
function pickSubset(snapshot) {
	if (!snapshot || typeof snapshot !== "object") return null;
	return {
		number: snapshot.number,
		title: snapshot.title,
		url: snapshot.url,
		state: snapshot.state,
		isDraft: snapshot.isDraft,
		mergeable: snapshot.mergeable,
		reviewDecision: snapshot.reviewDecision,
		updatedAt: snapshot.updatedAt,
		baseRefName: snapshot.baseRefName,
		headRefName: snapshot.headRefName
	};
}
function buildPrChangeSummary(before, after) {
	const a = pickSubset(after);
	const b = pickSubset(before);
	if (!a) return {
		changedFields: [],
		changes: {}
	};
	if (!b) return {
		changedFields: Object.keys(a),
		changes: Object.fromEntries(Object.keys(a).map((k) => [k, {
			from: null,
			to: a[k]
		}]))
	};
	const changes = {};
	for (const key of Object.keys(a)) if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) changes[key] = {
		from: b[key],
		to: a[key]
	};
	return {
		changedFields: Object.keys(changes),
		changes
	};
}
function formatPrChangeMessage({ repo, pr, changedFields, prInfo }) {
	const fields = changedFields.length ? ` (${changedFields.join(", ")})` : "";
	return `PR updated: ${repo}#${pr}${prInfo?.title ? `: ${prInfo.title}` : ""}${fields}.${prInfo?.url ? ` ${prInfo.url}` : ""}`.replace(/\s+/g, " ").trim();
}
async function runGithubPrMonitorWorkflow({ args, ctx }) {
	const repo = args.repo;
	const pr = args.pr;
	if (!repo || !pr) throw new Error("github.pr.monitor requires args.repo and args.pr");
	const key = args.key ?? `github.pr:${repo}#${pr}`;
	const changesOnly = Boolean(args.changesOnly);
	const summaryOnly = Boolean(args.summaryOnly);
	const { stdout } = await runProcess("gh", [
		"pr",
		"view",
		String(pr),
		"--repo",
		String(repo),
		"--json",
		"number,title,url,state,isDraft,mergeable,reviewDecision,author,baseRefName,headRefName,updatedAt"
	], {
		env: ctx.env,
		cwd: process.cwd()
	});
	let current;
	try {
		current = JSON.parse(stdout.trim());
	} catch {
		throw new Error("gh returned non-JSON output");
	}
	const { changed, before } = await diffAndStore({
		env: ctx.env,
		key,
		value: current
	});
	if (changesOnly && !changed) return {
		kind: "github.pr.monitor",
		repo,
		prNumber: Number(pr),
		key,
		changed: false,
		suppressed: true
	};
	const summary = buildPrChangeSummary(before, current);
	if (summaryOnly) return {
		kind: "github.pr.monitor",
		repo,
		prNumber: Number(pr),
		key,
		changed,
		summary,
		pr: {
			number: current.number,
			title: current.title,
			url: current.url,
			state: current.state,
			updatedAt: current.updatedAt
		}
	};
	return {
		kind: "github.pr.monitor",
		repo,
		prNumber: Number(pr),
		key,
		changed,
		summary,
		prSnapshot: current
	};
}
async function runGithubPrMonitorNotifyWorkflow({ args, ctx }) {
	const base = await runGithubPrMonitorWorkflow({
		args: {
			...args,
			changesOnly: true,
			summaryOnly: true
		},
		ctx
	});
	if (base.suppressed) return {
		kind: "github.pr.monitor.notify",
		suppressed: true
	};
	const changedFields = base.summary?.changedFields ?? [];
	const prInfo = base.pr ?? {};
	return {
		kind: "github.pr.monitor.notify",
		changed: Boolean(base.changed),
		repo: args.repo,
		prNumber: Number(args.pr),
		message: formatPrChangeMessage({
			repo: args.repo,
			pr: Number(args.pr),
			changedFields,
			prInfo
		}),
		pr: prInfo,
		summary: base.summary
	};
}
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/commands/workflows/workflows_run.js
const runners = {
	"github.pr.monitor": runGithubPrMonitorWorkflow,
	"github.pr.monitor.notify": runGithubPrMonitorNotifyWorkflow
};
const recipeRunners = {};
const workflowsRunCommand = {
	name: "workflows.run",
	meta: {
		description: "Run a named Lobster workflow",
		argsSchema: {
			type: "object",
			properties: {
				name: {
					type: "string",
					description: "Workflow name"
				},
				"args-json": {
					type: "string",
					description: "JSON string of workflow args"
				},
				_: {
					type: "array",
					items: { type: "string" }
				}
			},
			required: ["name"]
		},
		sideEffects: []
	},
	help() {
		return `workflows.run — run a named Lobster workflow\n\nUsage:\n  workflows.run --name <workflow> [--args-json '{...}']\n\nExample:\n  workflows.run --name github.pr.monitor.notify --args-json '{"repo":"openclaw/openclaw","pr":1152}'\n`;
	},
	async run({ input, args, ctx }) {
		for await (const _item of input);
		const name = args.name ?? args._[0];
		if (!name) throw new Error("workflows.run requires --name");
		const recipeRunner = recipeRunners[name];
		if (recipeRunner) {
			let workflowArgs = {};
			if (args["args-json"]) try {
				workflowArgs = JSON.parse(String(args["args-json"]));
			} catch {
				throw new Error("workflows.run --args-json must be valid JSON");
			}
			return { output: asStream([await recipeRunner({
				args: workflowArgs,
				ctx
			})]) };
		}
		if (!workflowRegistry[name]) throw new Error(`Unknown workflow: ${name}`);
		const runner = runners[name];
		if (!runner) throw new Error(`Workflow runner not implemented: ${name}`);
		let workflowArgs = {};
		if (args["args-json"]) try {
			workflowArgs = JSON.parse(String(args["args-json"]));
		} catch {
			throw new Error("workflows.run --args-json must be valid JSON");
		}
		return { output: asStream([await runner({
			args: workflowArgs,
			ctx
		})]) };
	}
};
async function* asStream(items) {
	for (const item of items) yield item;
}
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/commands/commands_list.js
function parseDescriptionFromHelp(helpText) {
	const firstLine = helpText.split("\n").find((l) => l.trim().length > 0) ?? "";
	return firstLine.includes("—") ? firstLine.split("—").slice(1).join("—").trim() : firstLine.trim();
}
const commandsListCommand = {
	name: "commands.list",
	help() {
		return "commands.list — list available Lobster pipeline commands\n\nUsage:\n  commands.list\n\nNotes:\n  - Intended for agents (e.g. OpenClaw) to discover available pipeline stages dynamically.\n  - Output includes name/description plus optional metadata (argsSchema/examples/sideEffects) when provided by commands.\n";
	},
	meta: {
		description: "List available Lobster pipeline commands",
		argsSchema: {
			type: "object",
			properties: {},
			required: []
		},
		sideEffects: []
	},
	async run({ input, ctx }) {
		for await (const _ of input);
		const output = ctx.registry.list().map((name) => {
			const cmd = ctx.registry.get(name);
			const help = typeof cmd?.help === "function" ? String(cmd.help()) : "";
			return {
				name,
				description: cmd?.meta?.description ?? parseDescriptionFromHelp(help),
				argsSchema: cmd?.meta?.argsSchema ?? null,
				examples: cmd?.meta?.examples ?? null,
				sideEffects: cmd?.meta?.sideEffects ?? null
			};
		});
		return { output: (async function* () {
			for (const item of output) yield item;
		})() };
	}
};
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/commands/stdlib/gog_gmail_search.js
function run$1(cmd, argv, env, cwd) {
	return new Promise((resolve, reject) => {
		const child = spawn(cmd, argv, {
			env: {
				...process.env,
				...env
			},
			cwd,
			stdio: [
				"ignore",
				"pipe",
				"pipe"
			]
		});
		let stdout = "";
		let stderr = "";
		child.stdout?.on("data", (d) => stdout += String(d));
		child.stderr?.on("data", (d) => stderr += String(d));
		child.on("error", (err) => {
			if (err?.code === "ENOENT") {
				reject(/* @__PURE__ */ new Error("gog not found on PATH (install: https://github.com/steipete/gogcli)"));
				return;
			}
			reject(err);
		});
		child.on("close", (code) => {
			resolve({
				stdout,
				stderr,
				code
			});
		});
	});
}
const gogGmailSearchCommand = {
	name: "gog.gmail.search",
	meta: {
		description: "Fetch Gmail threads via gog (JSON)",
		argsSchema: {
			type: "object",
			properties: {
				query: {
					type: "string",
					description: "Gmail search query",
					default: "newer_than:1d"
				},
				max: {
					type: "number",
					description: "Max results",
					default: 20
				},
				limit: {
					type: "number",
					description: "Alias for max"
				},
				_: {
					type: "array",
					items: { type: "string" }
				}
			},
			required: []
		},
		sideEffects: ["reads_email"]
	},
	help() {
		return "gog.gmail.search — fetch Gmail messages via gog (JSON)\n\nUsage:\n  gog.gmail.search --query 'newer_than:1d' --max 20\n\nNotes:\n  - Requires the gog CLI: https://github.com/steipete/gogcli\n  - Set GOG_BIN to override the executable used (default: gog).\n  - This command outputs an array of message objects (as a stream).\n";
	},
	async run({ input, args, ctx }) {
		for await (const _item of input);
		const query = String(args.query ?? "newer_than:1d");
		const max = Number(args.max ?? args.limit ?? 20);
		const gogBinRaw = String(ctx.env.GOG_BIN ?? "gog");
		const argvBase = [
			"gmail",
			"search",
			query,
			"--json",
			"--max",
			String(max)
		];
		const isScript = /\.(mjs|cjs|js|ts)$/i.test(gogBinRaw);
		const res = await run$1(isScript ? process.execPath : gogBinRaw, isScript ? [gogBinRaw, ...argvBase] : argvBase, ctx.env, process.cwd());
		if (res.code !== 0) throw new Error(`gog.gmail.search failed (${res.code ?? "?"}): ${res.stderr.slice(0, 400)}`);
		let parsed;
		try {
			parsed = JSON.parse(res.stdout);
		} catch (_err) {
			throw new Error("gog.gmail.search expected JSON output");
		}
		const items = Array.isArray(parsed) ? parsed.flatMap((x) => Array.isArray(x?.threads) ? x.threads : [x]) : Array.isArray(parsed?.threads) ? parsed.threads : [parsed];
		return { output: (async function* () {
			for (const item of items) yield item;
		})() };
	}
};
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/commands/stdlib/gog_gmail_send.js
function run(cmd, argv, env, cwd) {
	return new Promise((resolve, reject) => {
		const child = spawn(cmd, argv, {
			env: {
				...process.env,
				...env
			},
			cwd,
			stdio: [
				"ignore",
				"pipe",
				"pipe"
			]
		});
		let stdout = "";
		let stderr = "";
		child.stdout?.on("data", (d) => stdout += String(d));
		child.stderr?.on("data", (d) => stderr += String(d));
		child.on("error", (err) => {
			if (err?.code === "ENOENT") {
				reject(/* @__PURE__ */ new Error("gog not found on PATH (install: https://github.com/steipete/gogcli)"));
				return;
			}
			reject(err);
		});
		child.on("close", (code) => {
			resolve({
				stdout,
				stderr,
				code
			});
		});
	});
}
function parseDraft(item) {
	if (!item || typeof item !== "object") throw new Error("gog.gmail.send expects draft objects");
	const to = String(item.to ?? "").trim();
	const subject = String(item.subject ?? "").trim();
	const body = String(item.body ?? "").trim();
	if (!to) throw new Error("gog.gmail.send draft missing to");
	return {
		to,
		subject,
		body
	};
}
const gogGmailSendCommand = {
	name: "gog.gmail.send",
	meta: {
		description: "Send Gmail messages via gog",
		argsSchema: {
			type: "object",
			properties: {
				dryRun: {
					type: "boolean",
					description: "If true, do not send; echo drafts"
				},
				"dry-run": {
					type: "boolean",
					description: "Alias for dryRun"
				},
				_: {
					type: "array",
					items: { type: "string" }
				}
			},
			required: []
		},
		sideEffects: ["sends_email"]
	},
	help() {
		return "gog.gmail.send — send Gmail messages via gog\n\nUsage:\n  ... | approve --prompt 'Send replies?' | gog.gmail.send\n\nInput:\n  Stream of draft objects: { to, subject, body }\n\nNotes:\n  - Requires the gog CLI: https://github.com/steipete/gogcli\n  - Set GOG_BIN to override the executable used (default: gog).\n";
	},
	async run({ input, args, ctx }) {
		const dryRun = Boolean(args.dryRun ?? args["dry-run"] ?? false);
		const gogBinRaw = String(ctx.env.GOG_BIN ?? "gog");
		const isScript = /\.(mjs|cjs|js|ts)$/i.test(gogBinRaw);
		const gogBin = isScript ? process.execPath : gogBinRaw;
		const results = [];
		for await (const item of input) {
			const draft = parseDraft(item);
			if (dryRun) {
				results.push({
					ok: true,
					dryRun: true,
					...draft
				});
				continue;
			}
			const argvBase = [
				"gmail",
				"send",
				"--to",
				draft.to,
				...draft.subject ? ["--subject", draft.subject] : [],
				...draft.body ? ["--body", draft.body] : [],
				"--json"
			];
			const res = await run(gogBin, isScript ? [gogBinRaw, ...argvBase] : argvBase, ctx.env, process.cwd());
			if (res.code !== 0) throw new Error(`gog.gmail.send failed (${res.code ?? "?"}): ${res.stderr.slice(0, 400)}`);
			let parsed;
			try {
				parsed = res.stdout ? JSON.parse(res.stdout) : { ok: true };
			} catch (_err) {
				parsed = {
					ok: true,
					raw: res.stdout
				};
			}
			results.push(parsed);
		}
		return { output: (async function* () {
			for (const r of results) yield r;
		})() };
	}
};
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/commands/stdlib/email_triage.js
function normalizeEmail(raw) {
	const id = String(raw?.id ?? raw?.messageId ?? "").trim();
	const threadId = String(raw?.threadId ?? raw?.thread_id ?? id).trim();
	const from = String(raw?.from ?? raw?.sender ?? "").trim();
	const subject = String(raw?.subject ?? "").trim();
	const date = String(raw?.date ?? raw?.internalDate ?? raw?.timestamp ?? "").trim();
	const snippet = String(raw?.snippet ?? raw?.bodyPreview ?? "").trim();
	const labels = Array.isArray(raw?.labels) ? raw.labels.map((x) => String(x)) : [];
	return {
		id,
		threadId: threadId || id,
		from,
		subject,
		date,
		snippet,
		labels
	};
}
function isLikelyNoReply(from) {
	const f = from.toLowerCase();
	return f.includes("no-reply") || f.includes("noreply") || f.includes("do-not-reply") || f.includes("donotreply");
}
function extractEmailAddress(from) {
	const m = String(from).match(/<([^>]+)>/);
	if (m?.[1]) return m[1].trim();
	return (String(from).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "").trim();
}
function ensureRe(subject) {
	const s = String(subject ?? "").trim();
	if (!s) return "Re:";
	return /^re:\s*/i.test(s) ? s : `Re: ${s}`;
}
function buildDeterministicReport(emails) {
	const buckets = {
		needsReply: [],
		needsAction: [],
		fyi: []
	};
	for (const e of emails) {
		const subjLower = e.subject.toLowerCase();
		const unread = e.labels.some((l) => l.toUpperCase() === "UNREAD");
		if (subjLower.includes("action required") || subjLower.includes("urgent")) {
			buckets.needsAction.push(e);
			continue;
		}
		if (unread && !isLikelyNoReply(e.from)) {
			buckets.needsReply.push(e);
			continue;
		}
		buckets.fyi.push(e);
	}
	return {
		summary: `${buckets.needsReply.length} need replies, ${buckets.needsAction.length} need action, ${buckets.fyi.length} FYI`,
		buckets: {
			needsReply: buckets.needsReply.map((x) => x.id),
			needsAction: buckets.needsAction.map((x) => x.id),
			fyi: buckets.fyi.map((x) => x.id)
		},
		emails,
		mode: "deterministic"
	};
}
function triagePrompt(emails) {
	return "You are an email triage assistant.\nGiven the following emails, return JSON that categorizes each email and (when category is needs_reply) drafts a short reply.\nGuidelines:\n- Keep replies concise, friendly, and professional.\n- If sender appears to be automated (no-reply), do not draft a reply; categorize as fyi unless it is clearly urgent/actionable.\n- Use one of categories: needs_reply, needs_action, fyi.\n- The reply body should be plain text, no markdown.\n\nEmails (JSON):\n" + JSON.stringify(emails.map((e) => ({
		id: e.id,
		from: e.from,
		subject: e.subject,
		date: e.date,
		snippet: e.snippet,
		labels: e.labels
	})), null, 2);
}
const TRIAGE_OUTPUT_SCHEMA = {
	type: "object",
	properties: { decisions: {
		type: "array",
		items: {
			type: "object",
			properties: {
				id: { type: "string" },
				category: {
					type: "string",
					enum: [
						"needs_reply",
						"needs_action",
						"fyi"
					]
				},
				rationale: { type: "string" },
				reply: {
					type: "object",
					properties: {
						subject: { type: "string" },
						body: { type: "string" }
					},
					required: ["body"],
					additionalProperties: false
				}
			},
			required: ["id", "category"],
			additionalProperties: false
		}
	} },
	required: ["decisions"],
	additionalProperties: false
};
const emailTriageCommand = {
	name: "email.triage",
	meta: {
		description: "Email triage (deterministic by default, optionally LLM-assisted via llm.invoke)",
		argsSchema: {
			type: "object",
			properties: {
				limit: {
					type: "number",
					description: "Maximum items to consume from input stream",
					default: 20
				},
				llm: {
					type: "boolean",
					description: "Use llm.invoke for categorization + draft replies"
				},
				model: {
					type: "string",
					description: "Model for llm.invoke (optional; adapter defaults may apply)"
				},
				url: {
					type: "string",
					description: "Reserved for compatibility (ignored in OpenClaw mode)"
				},
				token: {
					type: "string",
					description: "Bearer token (or OPENCLAW_TOKEN/CLAWD_TOKEN)"
				},
				temperature: {
					type: "number",
					description: "LLM temperature"
				},
				"max-output-tokens": {
					type: "number",
					description: "Max completion tokens"
				},
				emit: {
					type: "string",
					description: "Output mode: 'report' (default) or 'drafts'",
					default: "report"
				},
				"state-key": {
					type: "string",
					description: "Run-state key forwarded to llm.invoke"
				},
				_: {
					type: "array",
					items: { type: "string" }
				}
			},
			required: []
		},
		sideEffects: []
	},
	help() {
		return "email.triage — categorize emails and draft replies (optional LLM)\n\nUsage (deterministic):\n  gog.gmail.search --query 'newer_than:1d' --max 20 | email.triage\n\nUsage (LLM-assisted drafts):\n  gog.gmail.search --query 'newer_than:1d' --max 20 | email.triage --llm --model <model>\n\nSend drafts (requires approval):\n  ... | email.triage --llm --model <model> --emit drafts | approve --prompt 'Send replies?' | gog.gmail.send\n\nNotes:\n  - Read-only by default: does not send anything.\n  - LLM mode uses llm.invoke (and its cache/resume semantics).\n";
	},
	async run({ input, args, ctx }) {
		const limit = Number(args.limit ?? 20);
		const emit = String(args.emit ?? "report").trim() || "report";
		const emails = [];
		for await (const item of input) {
			emails.push(normalizeEmail(item));
			if (emails.length >= limit) break;
		}
		const wantLlm = Boolean(args.llm ?? false);
		const env = ctx?.env ?? process.env;
		const hasLlmProvider = Boolean(String(env.LOBSTER_LLM_PROVIDER ?? "").trim() || String(env.LOBSTER_PI_LLM_ADAPTER_URL ?? "").trim() || String(env.LOBSTER_LLM_ADAPTER_URL ?? "").trim() || String(env.OPENCLAW_URL ?? env.CLAWD_URL ?? "").trim());
		if (!wantLlm || !hasLlmProvider) {
			const report = buildDeterministicReport(emails);
			if (emit === "drafts") return { output: streamOf([]) };
			return { output: streamOf([report]) };
		}
		const model = String(args.model ?? "").trim();
		if (!ctx?.registry) throw new Error("email.triage (LLM mode) requires ctx.registry");
		const llmCmd = ctx.registry.get("llm.invoke") ?? ctx.registry.get("llm_task.invoke");
		if (!llmCmd) throw new Error("email.triage requires llm.invoke to be registered");
		const llmRes = await llmCmd.run({
			input: streamOf(emails),
			args: {
				_: [],
				url: args.url,
				token: args.token,
				...model ? { model } : null,
				prompt: triagePrompt(emails),
				"output-schema": JSON.stringify(TRIAGE_OUTPUT_SCHEMA),
				"schema-version": "email_triage.v1",
				temperature: args.temperature,
				"max-output-tokens": args["max-output-tokens"],
				"state-key": args["state-key"] ?? env.LOBSTER_RUN_STATE_KEY
			},
			ctx
		});
		const llmItems = [];
		for await (const it of llmRes.output) llmItems.push(it);
		const data = llmItems[0]?.output?.data;
		const decisions = (Array.isArray(data?.decisions) ? data.decisions : []).map((d) => ({
			id: String(d?.id ?? "").trim(),
			category: String(d?.category ?? "fyi"),
			rationale: d?.rationale ? String(d.rationale) : void 0,
			reply: d?.reply && typeof d.reply === "object" ? {
				subject: d.reply.subject,
				body: String(d.reply.body ?? "")
			} : void 0
		})).filter((d) => d.id);
		const byId = new Map(emails.map((e) => [e.id, e]));
		const buckets = {
			needsReply: [],
			needsAction: [],
			fyi: []
		};
		const drafts = [];
		for (const d of decisions) {
			if (d.category === "needs_reply") buckets.needsReply.push(d.id);
			else if (d.category === "needs_action") buckets.needsAction.push(d.id);
			else buckets.fyi.push(d.id);
			if (d.category === "needs_reply" && d.reply?.body) {
				const email = byId.get(d.id);
				const to = email ? extractEmailAddress(email.from) : "";
				if (to && !isLikelyNoReply(email?.from ?? "")) drafts.push({
					emailId: d.id,
					to,
					subject: d.reply.subject ? String(d.reply.subject) : ensureRe(email?.subject ?? ""),
					body: String(d.reply.body)
				});
			}
		}
		const summary = `${buckets.needsReply.length} need replies, ${buckets.needsAction.length} need action, ${buckets.fyi.length} FYI`;
		if (emit === "drafts") return { output: (async function* () {
			for (const d of drafts) yield {
				to: d.to,
				subject: d.subject,
				body: d.body,
				emailId: d.emailId
			};
		})() };
		return { output: streamOf([{
			summary,
			buckets,
			emails,
			decisions,
			drafts,
			mode: "llm"
		}]) };
	}
};
async function* streamOf(items) {
	for (const item of items) yield item;
}
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/commands/registry.js
function createDefaultRegistry() {
	const commands = /* @__PURE__ */ new Map();
	for (const cmd of [
		execCommand,
		headCommand,
		jsonCommand,
		pickCommand,
		tableCommand,
		whereCommand,
		sortCommand,
		dedupeCommand,
		templateCommand,
		mapCommand,
		groupByCommand,
		approveCommand,
		askCommand,
		openclawInvokeCommand,
		clawdInvokeCommand,
		llmInvokeCommand,
		llmTaskInvokeCommand,
		stateGetCommand,
		stateSetCommand,
		diffLastCommand,
		workflowsListCommand,
		workflowsRunCommand,
		commandsListCommand,
		gogGmailSearchCommand,
		gogGmailSendCommand,
		emailTriageCommand
	]) commands.set(cmd.name, cmd);
	return {
		get(name) {
			return commands.get(name);
		},
		list() {
			return [...commands.keys()].sort();
		}
	};
}
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/parser.js
function isWhitespace(ch) {
	return ch === " " || ch === "	" || ch === "\n" || ch === "\r";
}
function splitPipes(input) {
	const parts = [];
	let current = "";
	let quote = null;
	for (let i = 0; i < input.length; i++) {
		const ch = input[i];
		if (quote) {
			if (ch === "\\") {
				const next = input[i + 1];
				if (next) {
					current += ch + next;
					i++;
					continue;
				}
			}
			current += ch;
			if (ch === quote) quote = null;
			continue;
		}
		if (ch === "\"" || ch === "'") {
			quote = ch;
			current += ch;
			continue;
		}
		if (ch === "|") {
			parts.push(current.trim());
			current = "";
			continue;
		}
		current += ch;
	}
	if (quote) throw new Error("Unclosed quote");
	if (current.trim().length > 0) parts.push(current.trim());
	return parts;
}
function tokenizeCommand(input) {
	const tokens = [];
	let current = "";
	let quote = null;
	const push = () => {
		if (current.length > 0) tokens.push(current);
		current = "";
	};
	for (let i = 0; i < input.length; i++) {
		const ch = input[i];
		if (quote) {
			if (quote === "'") {
				if (ch === "\\" && input[i + 1] === quote) {
					current += quote;
					i++;
					continue;
				}
				if (ch === quote) {
					quote = null;
					continue;
				}
				current += ch;
				continue;
			}
			if (ch === "\\") {
				const next = input[i + 1];
				if (next === "\"" || next === "\\" || next === "$" || next === "`") {
					current += next;
					i++;
					continue;
				}
				if (next === "\n") {
					i++;
					continue;
				}
				current += ch;
				continue;
			}
			if (ch === quote) {
				quote = null;
				continue;
			}
			current += ch;
			continue;
		}
		if (ch === "\"" || ch === "'") {
			quote = ch;
			continue;
		}
		if (isWhitespace(ch)) {
			push();
			continue;
		}
		current += ch;
	}
	if (quote) throw new Error("Unclosed quote");
	push();
	return tokens;
}
function parseArgs(tokens) {
	const args = { _: [] };
	for (let i = 0; i < tokens.length; i++) {
		const tok = tokens[i];
		if (tok.startsWith("--")) {
			const eq = tok.indexOf("=");
			if (eq !== -1) {
				const key = tok.slice(2, eq);
				args[key] = tok.slice(eq + 1);
				continue;
			}
			const key = tok.slice(2);
			const next = tokens[i + 1];
			if (!next || next.startsWith("--")) {
				args[key] = true;
				continue;
			}
			args[key] = next;
			i++;
			continue;
		}
		args._.push(tok);
	}
	return args;
}
function parsePipeline(input) {
	const stages = splitPipes(input);
	if (stages.length === 0) throw new Error("Empty pipeline");
	return stages.map((stage) => {
		const tokens = tokenizeCommand(stage);
		if (tokens.length === 0) throw new Error("Empty command stage");
		return {
			name: tokens[0],
			args: parseArgs(tokens.slice(1)),
			raw: stage
		};
	});
}
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/renderers/json.js
function createJsonRenderer(stdout) {
	return {
		json(items) {
			stdout.write(JSON.stringify(items, null, 2));
			stdout.write("\n");
		},
		lines(lines) {
			for (const line of lines) stdout.write(String(line) + "\n");
		}
	};
}
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/runtime.js
async function runPipeline({ pipeline, registry, stdin, stdout, stderr, env, mode = "human", input, cwd = void 0, llmAdapters = void 0, signal = void 0, dryRun = false }) {
	if (dryRun) return dryRunPipeline({
		pipeline,
		registry,
		stderr
	});
	let stream = input ?? emptyStream();
	let rendered = false;
	let halted = false;
	let haltedAt = null;
	const ctx = {
		stdin,
		stdout,
		stderr,
		env,
		registry,
		mode,
		cwd,
		llmAdapters,
		signal,
		render: createJsonRenderer(stdout)
	};
	for (let idx = 0; idx < pipeline.length; idx++) {
		const stage = pipeline[idx];
		const command = registry.get(stage.name);
		if (!command) throw new Error(`Unknown command: ${stage.name}`);
		const result = await command.run({
			input: stream,
			args: stage.args,
			ctx
		});
		if (result?.rendered) rendered = true;
		if (result?.halt) {
			halted = true;
			haltedAt = {
				index: idx,
				stage
			};
			stream = result.output ?? emptyStream();
			break;
		}
		stream = result?.output ?? emptyStream();
	}
	const items = [];
	for await (const item of stream) items.push(item);
	return {
		items,
		rendered,
		halted,
		haltedAt
	};
}
function dryRunPipeline({ pipeline, registry, stderr }) {
	const lines = [];
	lines.push(`[DRY RUN] Pipeline (${pipeline.length} stage${pipeline.length !== 1 ? "s" : ""}):`);
	for (let idx = 0; idx < pipeline.length; idx++) {
		const stage = pipeline[idx];
		if (!registry.get(stage.name)) throw new Error(`Unknown command: ${stage.name}`);
		const formattedArgs = stage.args ? formatStageArgs(stage.args) : "";
		const argsStr = formattedArgs ? `  args: ${formattedArgs}` : "";
		lines.push(`  ${idx + 1}. ${stage.name}${argsStr}`);
	}
	lines.push("");
	stderr.write(lines.join("\n"));
	return {
		items: [],
		rendered: true,
		halted: false,
		haltedAt: null
	};
}
function formatStageArgs(args) {
	const parts = [];
	for (const [key, value] of Object.entries(args)) if (key === "_") {
		const positional = Array.isArray(value) ? value : [value];
		for (const v of positional) if (v !== void 0 && v !== null) parts.push(String(v));
	} else parts.push(`${key}=${typeof value === "string" ? value : JSON.stringify(value)}`);
	return parts.join(", ");
}
async function* emptyStream() {}
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/token.js
function encodeToken(obj) {
	const json = JSON.stringify(obj);
	return Buffer$1.from(json, "utf8").toString("base64url");
}
function decodeToken(token) {
	try {
		const json = Buffer$1.from(String(token), "base64url").toString("utf8");
		return JSON.parse(json);
	} catch (_err) {
		throw new Error("Invalid token");
	}
}
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/workflows/file.js
var WorkflowResumeArgumentError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "WorkflowResumeArgumentError";
	}
};
async function loadWorkflowFile(filePath) {
	const text = await promises.readFile(filePath, "utf8");
	const parsed = path.extname(filePath).toLowerCase() === ".json" ? JSON.parse(text) : parse(text);
	if (!parsed || typeof parsed !== "object") throw new Error("Workflow file must be a JSON/YAML object");
	const steps = parsed.steps;
	if (!Array.isArray(steps) || steps.length === 0) throw new Error("Workflow file requires a non-empty steps array");
	const seen = /* @__PURE__ */ new Set();
	for (const step of steps) {
		if (!step || typeof step !== "object") throw new Error("Workflow step must be an object");
		if (!step.id || typeof step.id !== "string") throw new Error("Workflow step requires an id");
		const shellCommand = typeof step.run === "string" ? step.run : step.command;
		const pipeline = typeof step.pipeline === "string" ? step.pipeline : void 0;
		const executionCount = Number(Boolean(shellCommand)) + Number(Boolean(pipeline));
		if (executionCount === 0 && !isApprovalStep(step.approval) && !isInputStep(step.input)) throw new Error(`Workflow step ${step.id} requires run, command, pipeline, approval, or input`);
		if (executionCount > 1) throw new Error(`Workflow step ${step.id} can only define one of run, command, or pipeline`);
		if (executionCount > 0 && isInputStep(step.input)) throw new Error(`Workflow step ${step.id} input steps cannot define run, command, or pipeline`);
		if (isApprovalStep(step.approval) && isInputStep(step.input)) throw new Error(`Workflow step ${step.id} cannot define both approval and input`);
		if (step.run !== void 0 && typeof step.run !== "string") throw new Error(`Workflow step ${step.id} run must be a string`);
		if (step.command !== void 0 && typeof step.command !== "string") throw new Error(`Workflow step ${step.id} command must be a string`);
		if (step.pipeline !== void 0 && typeof step.pipeline !== "string") throw new Error(`Workflow step ${step.id} pipeline must be a string`);
		if (step.input !== void 0 && !isInputStep(step.input)) throw new Error(`Workflow step ${step.id} input must be an object`);
		if (step.input && typeof step.input.prompt !== "string") throw new Error(`Workflow step ${step.id} input.prompt must be a string`);
		if (step.input && (step.input.responseSchema === void 0 || typeof step.input.responseSchema !== "object")) throw new Error(`Workflow step ${step.id} input.responseSchema must be an object`);
		if (step.input) try {
			sharedAjv.compile(step.input.responseSchema);
		} catch (err) {
			throw new Error(`Workflow step ${step.id} input.responseSchema is invalid: ${err?.message ?? String(err)}`);
		}
		if (seen.has(step.id)) throw new Error(`Duplicate workflow step id: ${step.id}`);
		seen.add(step.id);
	}
	return parsed;
}
function resolveWorkflowArgs(argDefs, provided) {
	const resolved = {};
	if (argDefs) {
		for (const [key, def] of Object.entries(argDefs)) if (def && typeof def === "object" && "default" in def) resolved[key] = def.default;
	}
	if (provided) for (const [key, value] of Object.entries(provided)) resolved[key] = value;
	return resolved;
}
async function runWorkflowFile({ filePath, args, ctx, resume, approved, response, cancel }) {
	const consumedResumeStateKey = resume?.stateKey && typeof resume.stateKey === "string" ? resume.stateKey : null;
	const resumeState = resume?.stateKey ? await loadWorkflowResumeState(ctx.env, resume.stateKey) : resume ?? null;
	if (resumeState?.approvalStepId && resumeState?.inputStepId) throw new Error("Invalid workflow resume state");
	if (resumeState?.approvalStepId) {
		if (response !== void 0) throw new WorkflowResumeArgumentError("Workflow resume requires --approve yes|no for approval requests");
		if (cancel !== true && typeof approved !== "boolean") throw new WorkflowResumeArgumentError("Workflow resume requires --approve yes|no for approval requests");
		if (cancel === true || approved === false) {
			if (consumedResumeStateKey) await deleteStateJson({
				env: ctx.env,
				key: consumedResumeStateKey
			});
			return {
				status: "cancelled",
				output: []
			};
		}
	}
	if (resumeState?.inputStepId && cancel === true) {
		if (consumedResumeStateKey) await deleteStateJson({
			env: ctx.env,
			key: consumedResumeStateKey
		});
		return {
			status: "cancelled",
			output: []
		};
	}
	const resolvedFilePath = filePath ?? resumeState?.filePath;
	if (!resolvedFilePath) throw new Error("Workflow file path required");
	const workflow = await loadWorkflowFile(resolvedFilePath);
	const resolvedArgs = resolveWorkflowArgs(workflow.args, args ?? resumeState?.args);
	const steps = workflow.steps;
	const stepIndexById = new Map(steps.map((step, idx) => [step.id, idx]));
	const results = resumeState?.steps ? cloneResults(resumeState.steps) : {};
	const startIndex = resumeState?.resumeAtIndex ?? 0;
	if (resumeState?.approvalStepId && typeof approved === "boolean") {
		const previous = results[resumeState.approvalStepId] ?? { id: resumeState.approvalStepId };
		previous.approved = approved;
		results[resumeState.approvalStepId] = previous;
	}
	if (resumeState?.inputStepId) {
		if (approved !== void 0) throw new WorkflowResumeArgumentError("Workflow resume requires --response-json for input requests");
		if (response === void 0) throw new WorkflowResumeArgumentError("Workflow resume requires --response-json for input requests");
		const inputStep = steps[stepIndexById.get(resumeState.inputStepId) ?? -1];
		if (!inputStep || !isInputStep(inputStep.input)) throw new Error(`Invalid input step in resume state: ${resumeState.inputStepId}`);
		try {
			validateInputResponse({
				schema: resumeState.inputSchema ?? inputStep.input.responseSchema,
				response,
				stepId: inputStep.id
			});
		} catch (err) {
			throw new WorkflowResumeArgumentError(err?.message ?? String(err));
		}
		const previous = results[resumeState.inputStepId] ?? { id: resumeState.inputStepId };
		previous.subject = resumeState.inputSubject ?? null;
		previous.response = response;
		delete previous.skipped;
		results[resumeState.inputStepId] = previous;
	}
	if (ctx.dryRun) return dryRunWorkflow({
		steps,
		resolvedArgs,
		results,
		startIndex,
		ctx
	});
	let lastStepId = resumeState?.inputStepId ?? findLastCompletedStepId(steps, results);
	for (let idx = startIndex; idx < steps.length; idx++) {
		const step = steps[idx];
		if (!evaluateCondition(step.when ?? step.condition, results)) {
			results[step.id] = {
				id: step.id,
				skipped: true
			};
			continue;
		}
		if (isInputStep(step.input)) {
			const subject = resolveInputSubject({
				step,
				args: resolvedArgs,
				results,
				lastStepId
			});
			if (ctx.mode === "tool" || !isInteractive(ctx.stdin)) {
				const inputRequest = buildNeedsInputRequest({
					stepId: step.id,
					prompt: step.input.prompt,
					responseSchema: step.input.responseSchema,
					defaults: step.input.defaults,
					subject,
					maxEnvelopeBytes: resolveToolEnvelopeMaxBytes(ctx.env)
				});
				const stateKey = await saveWorkflowResumeState(ctx.env, {
					filePath: resolvedFilePath,
					resumeAtIndex: idx + 1,
					steps: results,
					args: resolvedArgs,
					inputStepId: step.id,
					inputSchema: step.input.responseSchema,
					inputSubject: subject,
					createdAt: (/* @__PURE__ */ new Date()).toISOString()
				});
				if (consumedResumeStateKey && consumedResumeStateKey !== stateKey) await deleteStateJson({
					env: ctx.env,
					key: consumedResumeStateKey
				});
				const resumeToken = encodeToken({
					protocolVersion: 1,
					v: 1,
					kind: "workflow-file",
					stateKey
				});
				return {
					status: "needs_input",
					output: [],
					requiresInput: {
						...inputRequest,
						resumeToken
					}
				};
			}
			ctx.stdout.write(`${step.input.prompt}\n`);
			ctx.stdout.write("Enter JSON response: ");
			const raw = await readLineFromStream(ctx.stdin, { timeoutMs: parseApprovalTimeoutMs(ctx.env) });
			const parsed = parseResponseJson(String(raw ?? "").trim());
			validateInputResponse({
				schema: step.input.responseSchema,
				response: parsed,
				stepId: step.id
			});
			results[step.id] = {
				id: step.id,
				subject,
				response: parsed
			};
			lastStepId = step.id;
			continue;
		}
		const env = mergeEnv(ctx.env, workflow.env, step.env, resolvedArgs, results);
		const cwd = resolveCwd(step.cwd ?? workflow.cwd, resolvedArgs) ?? ctx.cwd;
		const execution = getStepExecution(step);
		let result;
		if (execution.kind === "shell") {
			const { stdout } = await runShellCommand({
				command: resolveTemplate(execution.value, resolvedArgs, results),
				stdin: resolveShellStdin(step.stdin, resolvedArgs, results),
				env,
				cwd,
				signal: ctx.signal
			});
			result = {
				id: step.id,
				stdout,
				json: parseJson(stdout)
			};
		} else if (execution.kind === "pipeline") {
			if (!ctx.registry) throw new Error(`Workflow step ${step.id} requires a command registry for pipeline execution`);
			const pipelineText = resolveTemplate(execution.value, resolvedArgs, results);
			const inputValue = resolveInputValue(step.stdin, resolvedArgs, results);
			result = await runPipelineStep({
				stepId: step.id,
				pipelineText,
				inputValue,
				ctx,
				env,
				cwd
			});
		} else {
			const inputValue = resolveInputValue(step.stdin, resolvedArgs, results);
			result = createSyntheticStepResult(step.id, inputValue);
		}
		results[step.id] = result;
		lastStepId = step.id;
		if (isApprovalStep(step.approval)) {
			const approval = extractApprovalRequest(step, results[step.id]);
			if (ctx.mode === "tool" || !isInteractive(ctx.stdin)) {
				const stateKey = await saveWorkflowResumeState(ctx.env, {
					filePath: resolvedFilePath,
					resumeAtIndex: idx + 1,
					steps: results,
					args: resolvedArgs,
					approvalStepId: step.id,
					createdAt: (/* @__PURE__ */ new Date()).toISOString()
				});
				let approvalId;
				try {
					approvalId = await createApprovalIndex({
						env: ctx.env,
						stateKey
					});
				} catch (err) {
					await deleteStateJson({
						env: ctx.env,
						key: stateKey
					}).catch(() => {});
					throw err;
				}
				if (consumedResumeStateKey && consumedResumeStateKey !== stateKey) await deleteStateJson({
					env: ctx.env,
					key: consumedResumeStateKey
				});
				const resumeToken = encodeToken({
					protocolVersion: 1,
					v: 1,
					kind: "workflow-file",
					stateKey
				});
				return {
					status: "needs_approval",
					output: [],
					requiresApproval: {
						...approval,
						resumeToken,
						approvalId
					}
				};
			}
			ctx.stdout.write(`${approval.prompt} [y/N] `);
			const answer = await readLineFromStream(ctx.stdin, { timeoutMs: parseApprovalTimeoutMs(ctx.env) });
			if (!/^y(es)?$/i.test(String(answer).trim())) throw new Error("Not approved");
			results[step.id].approved = true;
		}
	}
	const output = lastStepId ? toOutputItems(results[lastStepId]) : [];
	if (consumedResumeStateKey) await deleteStateJson({
		env: ctx.env,
		key: consumedResumeStateKey
	});
	return {
		status: "ok",
		output
	};
}
function dryRunStdinNote(stdin) {
	if (stdin === null || stdin === void 0) return null;
	if (typeof stdin !== "string") return null;
	const trimmed = stdin.trim();
	if (/^\$[A-Za-z0-9_-]+\.(stdout|json)$/.test(trimmed)) return `${trimmed}  [output unknown at plan time]`;
	if (/\$[A-Za-z0-9_-]+\.(stdout|json)/.test(trimmed)) return `${trimmed}  [contains step output refs — unknown at plan time]`;
	return null;
}
function dryRunTemplateNote(input) {
	if (/\$[A-Za-z0-9_-]+\.(stdout|json)/.test(input)) return "[contains step output refs — unknown at plan time]";
	return null;
}
function hasDeferredDryRunStageName(input) {
	return /\$[A-Za-z0-9_-]+\.(stdout|json)/.test(input);
}
function resolveDryRunTemplate(input, args, results) {
	return resolveArgsTemplate(input, args).replace(/\$([A-Za-z0-9_-]+)\.(stdout|json|approved)/g, (match, id, field) => {
		if (field === "approved") {
			const step = results[id];
			if (!step) return match;
			return step.approved === true ? "true" : "false";
		}
		return match;
	});
}
function dryRunWorkflow({ steps, resolvedArgs, results, startIndex, ctx }) {
	const lines = [];
	const totalSteps = steps.length - startIndex;
	lines.push(`[DRY RUN] Would execute ${totalSteps} step${totalSteps !== 1 ? "s" : ""}:\n`);
	for (let idx = startIndex; idx < steps.length; idx++) {
		const step = steps[idx];
		const num = idx - startIndex + 1;
		if (!evaluateCondition(step.when ?? step.condition, results)) {
			results[step.id] = {
				id: step.id,
				skipped: true
			};
			lines.push(`  ${num}. ${step.id}  [skipped — condition: false]`);
			continue;
		}
		if (isInputStep(step.input)) {
			lines.push(`  ${num}. ${step.id}  [input]`);
			lines.push(`     prompt: ${step.input.prompt}`);
			lines.push(`     [input required]`);
			results[step.id] = {
				id: step.id,
				response: { pending: true }
			};
			continue;
		}
		if (step.stdin !== void 0 && step.stdin !== null) try {
			resolveInputValue(step.stdin, resolvedArgs, results);
		} catch (err) {
			throw new Error(`Workflow step ${step.id} stdin: ${err?.message ?? String(err)}`);
		}
		const execution = getStepExecution(step);
		const stdinNote = dryRunStdinNote(step.stdin);
		if (execution.kind === "shell") {
			const command = resolveDryRunTemplate(execution.value, resolvedArgs, results);
			const commandNote = dryRunTemplateNote(command);
			lines.push(`  ${num}. ${step.id}  [shell]`);
			lines.push(`     run: ${command}${commandNote ? `  ${commandNote}` : ""}`);
		} else if (execution.kind === "pipeline") {
			const pipelineText = resolveDryRunTemplate(execution.value, resolvedArgs, results);
			const pipelineNote = dryRunTemplateNote(pipelineText);
			if (!ctx.registry) throw new Error(`Workflow step ${step.id} requires a command registry for pipeline execution`);
			const stages = parsePipeline(pipelineText);
			for (const stage of stages) {
				if (hasDeferredDryRunStageName(stage.name)) continue;
				if (!ctx.registry.get(stage.name)) throw new Error(`Workflow step ${step.id} pipeline references unknown command: ${stage.name}`);
			}
			lines.push(`  ${num}. ${step.id}  [pipeline]`);
			lines.push(`     pipeline: ${pipelineText}${pipelineNote ? `  ${pipelineNote}` : ""}`);
			if (stages.some((stage) => hasDeferredDryRunStageName(stage.name))) lines.push("     [command validation deferred — stage name depends on step output]");
		} else lines.push(`  ${num}. ${step.id}  [no-op]`);
		if (stdinNote) lines.push(`     stdin: ${stdinNote}`);
		if (isApprovalStep(step.approval)) lines.push(`     [approval required]`);
		results[step.id] = isApprovalStep(step.approval) ? {
			id: step.id,
			approved: true
		} : { id: step.id };
	}
	lines.push("");
	ctx.stderr.write(lines.join("\n"));
	return {
		status: "ok",
		output: []
	};
}
function decodeWorkflowResumePayload(payload) {
	if (!payload || typeof payload !== "object") return null;
	const data = payload;
	if (data.kind !== "workflow-file") return null;
	if (data.protocolVersion !== 1 || data.v !== 1) throw new Error("Unsupported token version");
	if (data.stateKey && typeof data.stateKey === "string") return data;
	if (!data.filePath || typeof data.filePath !== "string") throw new Error("Invalid workflow token");
	if (typeof data.resumeAtIndex !== "number") throw new Error("Invalid workflow token");
	if (!data.steps || typeof data.steps !== "object") throw new Error("Invalid workflow token");
	if (!data.args || typeof data.args !== "object") throw new Error("Invalid workflow token");
	return data;
}
async function saveWorkflowResumeState(env, state) {
	const stateKey = `workflow_resume_${randomUUID()}`;
	await writeStateJson({
		env,
		key: stateKey,
		value: state
	});
	return stateKey;
}
async function loadWorkflowResumeState(env, stateKey) {
	const stored = await readStateJson({
		env,
		key: stateKey
	});
	if (!stored || typeof stored !== "object") throw new Error("Workflow resume state not found");
	const data = stored;
	if (!data.filePath || typeof data.filePath !== "string") throw new Error("Invalid workflow resume state");
	if (typeof data.resumeAtIndex !== "number") throw new Error("Invalid workflow resume state");
	if (!data.steps || typeof data.steps !== "object") throw new Error("Invalid workflow resume state");
	if (!data.args || typeof data.args !== "object") throw new Error("Invalid workflow resume state");
	return data;
}
function mergeEnv(base, workflowEnv, stepEnv, args, results) {
	const env = { ...base };
	env.LOBSTER_ARGS_JSON = JSON.stringify(args ?? {});
	for (const [key, value] of Object.entries(args ?? {})) {
		const normalized = normalizeArgEnvKey(key);
		if (!normalized) continue;
		env[`LOBSTER_ARG_${normalized}`] = String(value);
	}
	const apply = (source) => {
		if (!source) return;
		for (const [key, value] of Object.entries(source)) if (typeof value === "string") env[key] = resolveTemplate(value, args, results);
	};
	apply(workflowEnv);
	apply(stepEnv);
	return env;
}
function normalizeArgEnvKey(key) {
	const trimmed = String(key ?? "").trim();
	if (!trimmed) return null;
	return trimmed.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "") || null;
}
function resolveCwd(cwd, args) {
	if (!cwd) return void 0;
	return resolveArgsTemplate(cwd, args);
}
function resolveInputValue(stdin, args, results) {
	if (stdin === null || stdin === void 0) return null;
	if (typeof stdin === "string") {
		const ref = parseStepRef(stdin.trim());
		if (ref) return getStepRefValue(ref, results, true);
		return resolveTemplate(stdin, args, results);
	}
	return stdin;
}
function resolveShellStdin(stdin, args, results) {
	return encodeShellInput(resolveInputValue(stdin, args, results));
}
function resolveTemplate(input, args, results) {
	return resolveStepRefs(resolveArgsTemplate(input, args), results);
}
function resolveArgsTemplate(input, args) {
	return input.replace(/\$\{([A-Za-z0-9_-]+)\}/g, (match, key) => {
		if (key in args) return String(args[key]);
		return match;
	});
}
function resolveStepRefs(input, results) {
	return input.replace(/\$([A-Za-z0-9_-]+)\.([A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*)/g, (match, id, pathValue) => {
		if (!(id in results)) return match;
		const refValue = getStepRefValue({
			id,
			path: pathValue
		}, results, false);
		if (refValue === void 0) {
			if (pathValue === "approved" || pathValue === "skipped") return "false";
			return "";
		}
		return renderTemplateValue(refValue);
	});
}
function parseStepRef(value) {
	const match = value.match(/^\$([A-Za-z0-9_-]+)\.([A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*)$/);
	if (!match) return null;
	return {
		id: match[1],
		path: match[2]
	};
}
function getStepRefValue(ref, results, strict) {
	const step = results[ref.id];
	if (!step) {
		if (strict) throw new Error(`Unknown step reference: ${ref.id}.${ref.path}`);
		return;
	}
	return getValueByPath(step, ref.path);
}
function evaluateCondition(condition, results) {
	if (condition === void 0 || condition === null) return true;
	if (typeof condition === "boolean") return condition;
	if (typeof condition !== "string") throw new Error("Unsupported condition type");
	const trimmed = condition.trim();
	if (trimmed === "true") return true;
	if (trimmed === "false") return false;
	return evaluateConditionExpression(trimmed, results);
}
function isApprovalStep(approval) {
	if (approval === true) return true;
	if (typeof approval === "string" && approval.trim().length > 0) return true;
	if (approval && typeof approval === "object" && !Array.isArray(approval)) return true;
	return false;
}
function isInputStep(input) {
	return Boolean(input && typeof input === "object" && !Array.isArray(input));
}
function extractApprovalRequest(step, result) {
	const approvalConfig = normalizeApprovalConfig(step.approval);
	const fallbackPrompt = approvalConfig.prompt ?? `Approve ${step.id}?`;
	const json = result.json;
	if (json && typeof json === "object" && !Array.isArray(json)) {
		const candidate = json;
		if (candidate.requiresApproval?.prompt) return {
			type: "approval_request",
			prompt: candidate.requiresApproval.prompt,
			items: candidate.requiresApproval.items ?? [],
			...candidate.requiresApproval.preview ? { preview: candidate.requiresApproval.preview } : null
		};
		if (candidate.prompt) return {
			type: "approval_request",
			prompt: candidate.prompt,
			items: candidate.items ?? [],
			...candidate.preview ? { preview: candidate.preview } : null
		};
	}
	const items = approvalConfig.items ?? normalizeApprovalItems(result.json);
	const preview = approvalConfig.preview ?? buildResultPreview(result);
	return {
		type: "approval_request",
		prompt: fallbackPrompt,
		items,
		...preview ? { preview } : null
	};
}
function parseJson(stdout) {
	const trimmed = stdout.trim();
	if (!trimmed) return void 0;
	try {
		return JSON.parse(trimmed);
	} catch {
		return;
	}
}
function toOutputItems(result) {
	if (!result) return [];
	if (result.json !== void 0) return Array.isArray(result.json) ? result.json : [result.json];
	if (result.response !== void 0) return Array.isArray(result.response) ? result.response : [result.response];
	if (result.stdout !== void 0) return result.stdout === "" ? [] : [result.stdout];
	return [];
}
function cloneResults(results) {
	const out = {};
	for (const [key, value] of Object.entries(results)) out[key] = { ...value };
	return out;
}
function findLastCompletedStepId(steps, results) {
	for (let idx = steps.length - 1; idx >= 0; idx--) if (results[steps[idx].id]) return steps[idx].id;
	return null;
}
function isInteractive(stdin) {
	return Boolean(stdin.isTTY);
}
function parseApprovalTimeoutMs(env) {
	const raw = env?.LOBSTER_APPROVAL_INPUT_TIMEOUT_MS;
	const value = Number(raw);
	if (!Number.isFinite(value) || value <= 0) return 0;
	return Math.floor(value);
}
const MAX_NEEDS_INPUT_SUBJECT_BYTES = 192e3;
const DEFAULT_TOOL_ENVELOPE_MAX_BYTES = 512e3;
const RESUME_TOKEN_PLACEHOLDER = "x".repeat(220);
function parseResponseJson(raw) {
	try {
		return JSON.parse(raw);
	} catch {
		throw new Error("Input response must be valid JSON");
	}
}
function validateInputResponse(params) {
	const validator = sharedAjv.compile(params.schema);
	if (validator(params.response)) return;
	const first = validator.errors?.[0];
	const pathValue = first?.instancePath || "/";
	const reason = first?.message ? ` ${first.message}` : "";
	throw new Error(`Workflow input step ${params.stepId} response failed schema validation at ${pathValue}:${reason}`);
}
function resolveInputSubject(params) {
	if (params.step.stdin !== void 0) return resolveInputValue(params.step.stdin, params.args, params.results);
	if (!params.lastStepId) return null;
	const previous = params.results[params.lastStepId];
	if (!previous) return null;
	if (previous.json !== void 0) return previous.json;
	if (previous.response !== void 0) return previous.response;
	if (previous.stdout !== void 0) return previous.stdout;
	return null;
}
function maybeTruncateInputSubject(subject) {
	let serialized = "";
	try {
		serialized = JSON.stringify(subject ?? null);
	} catch {
		return {
			truncated: true,
			bytes: 0,
			preview: "[unserializable subject]"
		};
	}
	const byteLength = Buffer.byteLength(serialized, "utf8");
	if (byteLength <= MAX_NEEDS_INPUT_SUBJECT_BYTES) return subject;
	return {
		truncated: true,
		bytes: byteLength,
		preview: serialized.slice(0, 2e3)
	};
}
function resolveToolEnvelopeMaxBytes(env) {
	const raw = env?.LOBSTER_MAX_TOOL_ENVELOPE_BYTES;
	const parsed = Number(raw);
	if (!Number.isFinite(parsed) || parsed < 1024) return DEFAULT_TOOL_ENVELOPE_MAX_BYTES;
	return Math.floor(parsed);
}
function buildNeedsInputRequest(params) {
	const base = {
		type: "input_request",
		prompt: params.prompt,
		responseSchema: params.responseSchema,
		...params.defaults !== void 0 ? { defaults: params.defaults } : null
	};
	let subject = params.subject;
	let request = {
		...base,
		subject
	};
	if (fitsNeedsInputEnvelope(request, params.maxEnvelopeBytes)) return request;
	subject = maybeTruncateInputSubject(subject);
	request = {
		...base,
		subject
	};
	if (fitsNeedsInputEnvelope(request, params.maxEnvelopeBytes)) return request;
	request = {
		...base,
		subject: {
			truncated: true,
			bytes: estimateSerializedBytes(params.subject),
			preview: "[subject omitted: envelope size limit]"
		}
	};
	if (fitsNeedsInputEnvelope(request, params.maxEnvelopeBytes)) return request;
	throw new Error(`Workflow input step ${params.stepId} needs_input envelope exceeds ${params.maxEnvelopeBytes} bytes even after subject truncation`);
}
function fitsNeedsInputEnvelope(request, maxEnvelopeBytes) {
	return estimateSerializedBytes({
		protocolVersion: 1,
		ok: true,
		status: "needs_input",
		output: [],
		requiresApproval: null,
		requiresInput: {
			...request,
			resumeToken: RESUME_TOKEN_PLACEHOLDER
		}
	}) <= maxEnvelopeBytes;
}
function estimateSerializedBytes(value) {
	try {
		return Buffer.byteLength(JSON.stringify(value), "utf8");
	} catch {
		return Number.POSITIVE_INFINITY;
	}
}
function renderTemplateValue(value) {
	if (value === void 0 || value === null) return "";
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);
	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
}
function getValueByPath(value, pathValue) {
	const fields = pathValue.split(".");
	let current = value;
	for (const field of fields) {
		if (current === null || current === void 0) return void 0;
		if (Array.isArray(current)) {
			const idx = Number(field);
			if (!Number.isInteger(idx) || idx < 0 || idx >= current.length) return void 0;
			current = current[idx];
			continue;
		}
		if (typeof current !== "object") return void 0;
		current = current[field];
	}
	return current;
}
function evaluateConditionExpression(expression, results) {
	const tokens = tokenizeCondition(expression);
	if (tokens.length === 0) throw new Error(`Unsupported condition: ${expression}`);
	let index = 0;
	function parseOr() {
		let left = parseAnd();
		while (match("or")) {
			const right = parseAnd();
			left = Boolean(left) || Boolean(right);
		}
		return left;
	}
	function parseAnd() {
		let left = parseEquality();
		while (match("and")) {
			const right = parseEquality();
			left = Boolean(left) && Boolean(right);
		}
		return left;
	}
	function parseEquality() {
		const left = parseUnary(false);
		if (match("eq")) return compareConditionValues(left, parseUnary(true));
		if (match("neq")) return !compareConditionValues(left, parseUnary(true));
		return left;
	}
	function parseUnary(allowBareIdentifier) {
		if (match("not")) return !Boolean(parseUnary(allowBareIdentifier));
		return parsePrimary(allowBareIdentifier);
	}
	function parsePrimary(allowBareIdentifier) {
		const token = tokens[index];
		if (!token) throw new Error(`Unsupported condition: ${expression}`);
		index += 1;
		if (token.type === "lparen") {
			const value = parseOr();
			expect("rparen");
			return value;
		}
		if (token.type === "step_ref") return getStepRefValue(token.value, results, true);
		if (token.type === "string" || token.type === "number" || token.type === "boolean" || token.type === "null") return token.value;
		if (token.type === "identifier" && allowBareIdentifier) return token.value;
		throw new Error(`Unsupported condition: ${expression}`);
	}
	function match(type) {
		if (tokens[index]?.type !== type) return false;
		index += 1;
		return true;
	}
	function expect(type) {
		if (!match(type)) throw new Error(`Unsupported condition: ${expression}`);
	}
	const value = parseOr();
	if (index !== tokens.length) throw new Error(`Unsupported condition: ${expression}`);
	return Boolean(value);
}
function compareConditionValues(left, right) {
	if (Array.isArray(left) || Array.isArray(right) || isPlainConditionObject(left) || isPlainConditionObject(right)) return isDeepStrictEqual(left, right);
	return Object.is(left, right);
}
function isPlainConditionObject(value) {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function tokenizeCondition(expression) {
	const tokens = [];
	let index = 0;
	while (index < expression.length) {
		const ch = expression[index];
		if (/\s/.test(ch)) {
			index += 1;
			continue;
		}
		if (ch === "(") {
			tokens.push({ type: "lparen" });
			index += 1;
			continue;
		}
		if (ch === ")") {
			tokens.push({ type: "rparen" });
			index += 1;
			continue;
		}
		if (expression.startsWith("&&", index)) {
			tokens.push({ type: "and" });
			index += 2;
			continue;
		}
		if (expression.startsWith("||", index)) {
			tokens.push({ type: "or" });
			index += 2;
			continue;
		}
		if (expression.startsWith("==", index)) {
			tokens.push({ type: "eq" });
			index += 2;
			continue;
		}
		if (expression.startsWith("!=", index)) {
			tokens.push({ type: "neq" });
			index += 2;
			continue;
		}
		if (ch === "!") {
			tokens.push({ type: "not" });
			index += 1;
			continue;
		}
		if (ch === "$") {
			const matched = matchConditionStepRef(expression, index);
			if (!matched) throw new Error(`Unsupported condition: ${expression}`);
			tokens.push({
				type: "step_ref",
				value: matched.ref
			});
			index = matched.nextIndex;
			continue;
		}
		if (ch === "\"" || ch === "'") {
			const parsed = parseQuotedConditionString(expression, index, ch);
			tokens.push({
				type: "string",
				value: parsed.value
			});
			index = parsed.nextIndex;
			continue;
		}
		const numberMatch = expression.slice(index).match(/^-?\d+(?:\.\d+)?/);
		if (numberMatch) {
			tokens.push({
				type: "number",
				value: Number(numberMatch[0])
			});
			index += numberMatch[0].length;
			continue;
		}
		const identMatch = expression.slice(index).match(/^[A-Za-z_][A-Za-z0-9_-]*/);
		if (identMatch) {
			const raw = identMatch[0];
			if (raw === "true") tokens.push({
				type: "boolean",
				value: true
			});
			else if (raw === "false") tokens.push({
				type: "boolean",
				value: false
			});
			else if (raw === "null") tokens.push({
				type: "null",
				value: null
			});
			else tokens.push({
				type: "identifier",
				value: raw
			});
			index += raw.length;
			continue;
		}
		throw new Error(`Unsupported condition: ${expression}`);
	}
	return tokens;
}
function matchConditionStepRef(expression, startIndex) {
	const match = expression.slice(startIndex).match(/^\$([A-Za-z0-9_-]+)\.([A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*)/);
	if (!match) return null;
	return {
		ref: {
			id: match[1],
			path: match[2]
		},
		nextIndex: startIndex + match[0].length
	};
}
function parseQuotedConditionString(expression, startIndex, quoteChar) {
	let value = "";
	let index = startIndex + 1;
	while (index < expression.length) {
		const ch = expression[index];
		if (ch === "\\") {
			const next = expression[index + 1];
			if (next === void 0) break;
			value += next;
			index += 2;
			continue;
		}
		if (ch === quoteChar) return {
			value,
			nextIndex: index + 1
		};
		value += ch;
		index += 1;
	}
	throw new Error(`Unsupported condition: ${expression}`);
}
async function runShellCommand({ command, stdin, env, cwd, signal }) {
	const { spawn } = await import("node:child_process");
	return await new Promise((resolve, reject) => {
		const shell = resolveInlineShellCommand({
			command,
			env
		});
		const child = spawn(shell.command, shell.argv, {
			env,
			cwd,
			signal,
			stdio: [
				"pipe",
				"pipe",
				"pipe"
			]
		});
		let stdout = "";
		let stderr = "";
		child.stdout.setEncoding("utf8");
		child.stderr.setEncoding("utf8");
		child.stdout.on("data", (d) => {
			stdout += d;
		});
		child.stderr.on("data", (d) => {
			stderr += d;
		});
		if (typeof stdin === "string") {
			child.stdin.setDefaultEncoding("utf8");
			child.stdin.write(stdin);
		}
		child.stdin.end();
		child.on("error", reject);
		child.on("close", (code) => {
			if (code === 0) return resolve({
				stdout,
				stderr
			});
			reject(/* @__PURE__ */ new Error(`workflow command failed (${code}): ${stderr.trim() || stdout.trim() || command}`));
		});
	});
}
function getStepExecution(step) {
	if (typeof step.pipeline === "string" && step.pipeline.trim()) return {
		kind: "pipeline",
		value: step.pipeline
	};
	const shellCommand = typeof step.run === "string" ? step.run : step.command;
	if (typeof shellCommand === "string" && shellCommand.trim()) return {
		kind: "shell",
		value: shellCommand
	};
	return { kind: "none" };
}
async function runPipelineStep({ stepId, pipelineText, inputValue, ctx, env, cwd }) {
	let pipeline;
	try {
		pipeline = parsePipeline(pipelineText);
	} catch (err) {
		throw new Error(`Workflow step ${stepId} pipeline parse failed: ${err?.message ?? String(err)}`);
	}
	const stdout = new PassThrough();
	let renderedStdout = "";
	stdout.setEncoding("utf8");
	stdout.on("data", (chunk) => {
		renderedStdout += String(chunk);
	});
	const result = await runPipeline({
		pipeline,
		registry: ctx.registry,
		stdin: ctx.stdin,
		stdout,
		stderr: ctx.stderr,
		env,
		mode: ctx.mode,
		cwd,
		signal: ctx.signal,
		llmAdapters: ctx.llmAdapters,
		input: inputValueToStream(inputValue)
	});
	stdout.end();
	if (result.halted) {
		const haltedName = result.haltedAt?.stage?.name ?? "unknown";
		if (result.items.length === 1 && result.items[0]?.type === "approval_request") throw new Error(`Workflow step ${stepId} halted for approval inside pipeline stage ${haltedName}. Use a separate approval step in the workflow file.`);
		throw new Error(`Workflow step ${stepId} halted before completion at pipeline stage ${haltedName}`);
	}
	return {
		id: stepId,
		stdout: renderedStdout || serializePipelineItemsToStdout(result.items),
		json: result.items.length ? result.items.length === 1 ? result.items[0] : result.items : parseJson(renderedStdout)
	};
}
function createSyntheticStepResult(stepId, value) {
	if (value === null || value === void 0) return { id: stepId };
	if (typeof value === "string") return {
		id: stepId,
		stdout: value,
		json: parseJson(value)
	};
	return {
		id: stepId,
		stdout: serializeValueForStdout(value),
		json: value
	};
}
function encodeShellInput(value) {
	if (value === null || value === void 0) return null;
	if (typeof value === "string") return value;
	return JSON.stringify(value);
}
function* inputValueToItems(value) {
	if (value === null || value === void 0) return;
	if (Array.isArray(value)) {
		for (const item of value) yield item;
		return;
	}
	yield value;
}
function inputValueToStream(value) {
	return (async function* () {
		for (const item of inputValueToItems(value)) yield item;
	})();
}
function serializePipelineItemsToStdout(items) {
	if (!items.length) return "";
	if (items.every((item) => typeof item === "string")) return items.map((item) => String(item)).join("\n");
	if (items.length === 1) return serializeValueForStdout(items[0]);
	return JSON.stringify(items);
}
function serializeValueForStdout(value) {
	if (value === null || value === void 0) return "";
	if (typeof value === "string") return value;
	return JSON.stringify(value);
}
function normalizeApprovalConfig(approval) {
	if (approval === true || approval === "required" || approval === void 0 || approval === false) return {};
	if (typeof approval === "string") return { prompt: approval };
	if (approval && typeof approval === "object" && !Array.isArray(approval)) return approval;
	return {};
}
function normalizeApprovalItems(value) {
	if (value === void 0) return [];
	return Array.isArray(value) ? value : [value];
}
function buildResultPreview(result) {
	if (result.stdout) return result.stdout.trim().slice(0, 2e3);
	if (result.json !== void 0) return serializeValueForStdout(result.json).trim().slice(0, 2e3);
}
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/resume.js
/**
* Determine the resume payload kind from a state key prefix.
* State keys use naming conventions: pipeline_resume_<uuid> or workflow_resume_<uuid>.
*/
function kindFromStateKey(stateKey) {
	if (stateKey.startsWith("pipeline_resume_")) return "pipeline-resume";
	if (stateKey.startsWith("workflow_resume_")) return "workflow-file";
	return "workflow-file";
}
function decodeResumeToken(token) {
	const payload = decodeToken(token);
	if (!payload || typeof payload !== "object") throw new Error("Invalid token");
	if (payload.protocolVersion !== 1) throw new Error("Unsupported protocol version");
	if (payload.v !== 1) throw new Error("Unsupported token version");
	const workflowPayload = decodeWorkflowResumePayload(payload);
	if (workflowPayload) return workflowPayload;
	const pipelinePayload = decodePipelineResumePayload(payload);
	if (pipelinePayload) return pipelinePayload;
	throw new Error("Invalid token");
}
function decodePipelineResumePayload(payload) {
	if (!payload || typeof payload !== "object") return null;
	const data = payload;
	if (data.kind !== "pipeline-resume") return null;
	if (data.protocolVersion !== 1 || data.v !== 1) throw new Error("Unsupported token version");
	if (!data.stateKey || typeof data.stateKey !== "string") throw new Error("Invalid token");
	return {
		protocolVersion: 1,
		v: 1,
		kind: "pipeline-resume",
		stateKey: data.stateKey
	};
}
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/pipeline_resume_state.js
function extractPipelineHalt(output) {
	const halted = output.halted && output.items.length === 1 ? output.items[0] : null;
	return {
		approval: halted?.type === "approval_request" ? halted : null,
		inputRequest: halted?.type === "input_request" ? halted : null
	};
}
async function finalizePipelineToolRun(params) {
	const { approval, inputRequest } = extractPipelineHalt(params.output);
	if (approval) {
		const nextStateKey = await savePipelineResumeState(params.env, {
			pipeline: params.pipeline,
			resumeAtIndex: (params.output.haltedAt?.index ?? -1) + 1,
			items: approval.items,
			haltType: "approval_request",
			prompt: approval.prompt,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		});
		if (params.previousStateKey) {
			await cleanupApprovalIndexByStateKey({
				env: params.env,
				stateKey: params.previousStateKey
			});
			await deleteStateJson({
				env: params.env,
				key: params.previousStateKey
			});
		}
		let approvalId;
		try {
			approvalId = await createApprovalIndex({
				env: params.env,
				stateKey: nextStateKey
			});
		} catch (err) {
			await deleteStateJson({
				env: params.env,
				key: nextStateKey
			}).catch(() => {});
			throw err;
		}
		const resumeToken = encodeToken({
			protocolVersion: 1,
			v: 1,
			kind: "pipeline-resume",
			stateKey: nextStateKey
		});
		return {
			status: "needs_approval",
			output: [],
			requiresApproval: {
				...approval,
				resumeToken,
				approvalId
			},
			requiresInput: null
		};
	}
	if (inputRequest) {
		const nextStateKey = await savePipelineResumeState(params.env, {
			pipeline: params.pipeline,
			resumeAtIndex: (params.output.haltedAt?.index ?? -1) + 1,
			items: [],
			haltType: "input_request",
			inputSchema: inputRequest.responseSchema,
			prompt: inputRequest.prompt,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		});
		if (params.previousStateKey) {
			await cleanupApprovalIndexByStateKey({
				env: params.env,
				stateKey: params.previousStateKey
			});
			await deleteStateJson({
				env: params.env,
				key: params.previousStateKey
			});
		}
		const resumeToken = encodeToken({
			protocolVersion: 1,
			v: 1,
			kind: "pipeline-resume",
			stateKey: nextStateKey
		});
		return {
			status: "needs_input",
			output: [],
			requiresApproval: null,
			requiresInput: {
				type: "input_request",
				prompt: inputRequest.prompt,
				responseSchema: inputRequest.responseSchema,
				...inputRequest.defaults !== void 0 ? { defaults: inputRequest.defaults } : null,
				...inputRequest.subject !== void 0 ? { subject: inputRequest.subject } : null,
				resumeToken
			}
		};
	}
	if (params.previousStateKey) {
		await cleanupApprovalIndexByStateKey({
			env: params.env,
			stateKey: params.previousStateKey
		});
		await deleteStateJson({
			env: params.env,
			key: params.previousStateKey
		});
	}
	return {
		status: "ok",
		output: params.output.items,
		requiresApproval: null,
		requiresInput: null
	};
}
async function savePipelineResumeState(env, state) {
	const stateKey = `pipeline_resume_${randomUUID()}`;
	await writeStateJson({
		env,
		key: stateKey,
		value: state
	});
	return stateKey;
}
async function loadPipelineResumeState(env, stateKey) {
	const stored = await readStateJson({
		env,
		key: stateKey
	});
	if (!stored || typeof stored !== "object") throw new Error("Pipeline resume state not found");
	const data = stored;
	if (!Array.isArray(data.pipeline)) throw new Error("Invalid pipeline resume state");
	if (typeof data.resumeAtIndex !== "number") throw new Error("Invalid pipeline resume state");
	if (!Array.isArray(data.items)) throw new Error("Invalid pipeline resume state");
	if (data.haltType !== void 0 && !["approval_request", "input_request"].includes(data.haltType)) throw new Error("Invalid pipeline resume state");
	return data;
}
function validatePipelineInputResponse(schema, response) {
	if (schema === void 0) throw new Error("pipeline input response schema is missing");
	let validator;
	try {
		validator = sharedAjv.compile(schema);
	} catch {
		throw new Error("pipeline input response schema is invalid");
	}
	if (validator(response)) return;
	const first = validator.errors?.[0];
	const pathValue = first?.instancePath || "/";
	const reason = first?.message ? ` ${first.message}` : "";
	throw new Error(`pipeline input response failed schema validation at ${pathValue}:${reason}`);
}
//#endregion
//#region node_modules/@clawdbot/lobster/dist/src/core/tool_runtime.js
async function runToolRequest({ pipeline, filePath, args, ctx = {} }) {
	const runtime = createToolContext(ctx);
	const hasPipeline = typeof pipeline === "string" && pipeline.trim().length > 0;
	const hasFile = typeof filePath === "string" && filePath.trim().length > 0;
	if (!hasPipeline && !hasFile) return errorEnvelope("parse_error", "run requires either pipeline or filePath");
	if (hasPipeline && hasFile) return errorEnvelope("parse_error", "run accepts either pipeline or filePath, not both");
	if (hasFile) {
		let resolvedFilePath;
		try {
			resolvedFilePath = await resolveWorkflowFile$1(filePath, runtime.cwd);
		} catch (err) {
			return errorEnvelope("parse_error", err?.message ?? String(err));
		}
		try {
			const output = await runWorkflowFile({
				filePath: resolvedFilePath,
				args,
				ctx: runtime
			});
			if (output.status === "needs_approval") return okEnvelope("needs_approval", [], output.requiresApproval ?? null, null);
			if (output.status === "needs_input") return okEnvelope("needs_input", [], null, output.requiresInput ?? null);
			if (output.status === "cancelled") return okEnvelope("cancelled", [], null, null);
			return okEnvelope("ok", output.output, null, null);
		} catch (err) {
			return errorEnvelope("runtime_error", err?.message ?? String(err));
		}
	}
	let parsed;
	try {
		parsed = parsePipeline(String(pipeline));
	} catch (err) {
		return errorEnvelope("parse_error", err?.message ?? String(err));
	}
	try {
		const output = await runPipeline({
			pipeline: parsed,
			registry: runtime.registry,
			input: [],
			stdin: runtime.stdin,
			stdout: runtime.stdout,
			stderr: runtime.stderr,
			env: runtime.env,
			mode: "tool",
			cwd: runtime.cwd,
			llmAdapters: runtime.llmAdapters,
			signal: runtime.signal
		});
		const finalized = await finalizePipelineToolRun({
			env: runtime.env,
			pipeline: parsed,
			output
		});
		return okEnvelope(finalized.status, finalized.output, finalized.requiresApproval, finalized.requiresInput);
	} catch (err) {
		return errorEnvelope("runtime_error", err?.message ?? String(err));
	}
}
async function resumeToolRequest({ token, approvalId, approved, response, cancel, ctx = {} }) {
	const runtime = createToolContext(ctx);
	let payload;
	let resolvedApprovalId = approvalId ?? null;
	try {
		let resolvedToken;
		if (approvalId) {
			const stateKey = await findStateKeyByApprovalId({
				env: runtime.env,
				approvalId
			});
			if (!stateKey) return errorEnvelope("parse_error", `Approval ID "${approvalId}" not found or expired`);
			resolvedToken = encodeToken({
				protocolVersion: 1,
				v: 1,
				kind: kindFromStateKey(stateKey),
				stateKey
			});
		} else if (token) resolvedToken = token;
		else return errorEnvelope("parse_error", "resume requires token or approvalId");
		payload = decodeResumeToken(resolvedToken);
	} catch (err) {
		return errorEnvelope("parse_error", err?.message ?? String(err));
	}
	const cleanupIndex = async () => {
		if (resolvedApprovalId) await deleteApprovalId({
			env: runtime.env,
			approvalId: resolvedApprovalId
		});
		else if (payload?.stateKey) await cleanupApprovalIndexByStateKey({
			env: runtime.env,
			stateKey: payload.stateKey
		});
	};
	if (cancel === true) {
		await cleanupIndex();
		if (payload.kind === "workflow-file" && payload.stateKey) await deleteStateJson({
			env: runtime.env,
			key: payload.stateKey
		});
		if (payload.kind === "pipeline-resume" && payload.stateKey) await deleteStateJson({
			env: runtime.env,
			key: payload.stateKey
		});
		return okEnvelope("cancelled", [], null, null);
	}
	if (payload.kind === "workflow-file") try {
		const output = await runWorkflowFile({
			filePath: payload.filePath,
			ctx: runtime,
			resume: payload,
			approved,
			response,
			cancel
		});
		if (output.status === "needs_approval") return okEnvelope("needs_approval", [], output.requiresApproval ?? null, null);
		if (output.status === "needs_input") return okEnvelope("needs_input", [], null, output.requiresInput ?? null);
		await cleanupIndex();
		if (output.status === "cancelled") return okEnvelope("cancelled", [], null, null);
		return okEnvelope("ok", output.output, null, null);
	} catch (err) {
		if (err instanceof WorkflowResumeArgumentError) return errorEnvelope("parse_error", err.message);
		return errorEnvelope("runtime_error", err?.message ?? String(err));
	}
	let resumeState;
	try {
		resumeState = await loadPipelineResumeState(runtime.env, payload.stateKey);
	} catch (err) {
		return errorEnvelope("runtime_error", err?.message ?? String(err));
	}
	if (resumeState.haltType === "input_request") {
		if (approved !== void 0) return errorEnvelope("parse_error", "pipeline input resumes require response");
		if (response === void 0) return errorEnvelope("parse_error", "pipeline input resumes require response");
		try {
			validatePipelineInputResponse(resumeState.inputSchema, response);
		} catch (err) {
			return errorEnvelope("parse_error", err?.message ?? String(err));
		}
	} else {
		if (response !== void 0) return errorEnvelope("parse_error", "approval resumes require approved=true|false, not response");
		if (approved !== true) {
			await cleanupIndex();
			await deleteStateJson({
				env: runtime.env,
				key: payload.stateKey
			});
			return okEnvelope("cancelled", [], null, null);
		}
	}
	const remaining = resumeState.pipeline.slice(resumeState.resumeAtIndex);
	const input = streamFromItems(resumeState.haltType === "input_request" ? [response] : resumeState.items);
	try {
		const output = await runPipeline({
			pipeline: remaining,
			registry: runtime.registry,
			stdin: runtime.stdin,
			stdout: runtime.stdout,
			stderr: runtime.stderr,
			env: runtime.env,
			mode: "tool",
			cwd: runtime.cwd,
			llmAdapters: runtime.llmAdapters,
			signal: runtime.signal,
			input
		});
		await cleanupIndex();
		const finalized = await finalizePipelineToolRun({
			env: runtime.env,
			pipeline: remaining,
			output,
			previousStateKey: payload.stateKey
		});
		return okEnvelope(finalized.status, finalized.output, finalized.requiresApproval, finalized.requiresInput);
	} catch (err) {
		return errorEnvelope("runtime_error", err?.message ?? String(err));
	}
}
function createToolContext(ctx = {}) {
	return {
		cwd: ctx.cwd ?? process.cwd(),
		env: {
			...process.env,
			...ctx.env
		},
		mode: "tool",
		stdin: ctx.stdin ?? process.stdin,
		stdout: ctx.stdout ?? createCaptureStream(),
		stderr: ctx.stderr ?? createCaptureStream(),
		signal: ctx.signal,
		registry: ctx.registry ?? createDefaultRegistry(),
		llmAdapters: ctx.llmAdapters
	};
}
function createCaptureStream() {
	return new Writable({ write(_chunk, _encoding, callback) {
		callback();
	} });
}
function okEnvelope(status, output, requiresApproval, requiresInput) {
	return {
		protocolVersion: 1,
		ok: true,
		status,
		output,
		requiresApproval,
		requiresInput
	};
}
function errorEnvelope(type, message) {
	return {
		protocolVersion: 1,
		ok: false,
		error: {
			type,
			message
		}
	};
}
function streamFromItems(items) {
	return (async function* () {
		for (const item of items) yield item;
	})();
}
async function resolveWorkflowFile$1(candidate, cwd) {
	const { stat } = await import("node:fs/promises");
	const resolved = path.isAbsolute(candidate) ? candidate : path.resolve(cwd, candidate);
	if (!(await stat(resolved)).isFile()) throw new Error("Workflow path is not a file");
	const ext = path.extname(resolved).toLowerCase();
	if (![
		".lobster",
		".yaml",
		".yml",
		".json"
	].includes(ext)) throw new Error("Workflow file must end in .lobster, .yaml, .yml, or .json");
	return resolved;
}
//#endregion
//#region extensions/lobster/src/lobster-runner.ts
function normalizeForCwdSandbox(p) {
	const normalized = path.normalize(p);
	return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}
function resolveLobsterCwd(cwdRaw) {
	if (typeof cwdRaw !== "string" || !cwdRaw.trim()) return process.cwd();
	const cwd = cwdRaw.trim();
	if (path.isAbsolute(cwd)) throw new Error("cwd must be a relative path");
	const base = process.cwd();
	const resolved = path.resolve(base, cwd);
	const rel = path.relative(normalizeForCwdSandbox(base), normalizeForCwdSandbox(resolved));
	if (rel === "" || rel === ".") return resolved;
	if (rel.startsWith("..") || path.isAbsolute(rel)) throw new Error("cwd must stay within the gateway working directory");
	return resolved;
}
function createLimitedSink(maxBytes, label) {
	let bytes = 0;
	return new Writable({ write(chunk, _encoding, callback) {
		bytes += Buffer.byteLength(String(chunk), "utf8");
		if (bytes > maxBytes) {
			callback(/* @__PURE__ */ new Error(`lobster ${label} exceeded maxStdoutBytes`));
			return;
		}
		callback();
	} });
}
function normalizeEnvelope(envelope) {
	if (envelope.ok) {
		if (envelope.status === "needs_input") return {
			ok: false,
			error: {
				type: "unsupported_status",
				message: "Lobster input requests are not supported by the OpenClaw Lobster tool yet"
			}
		};
		return {
			ok: true,
			status: envelope.status ?? "ok",
			output: Array.isArray(envelope.output) ? envelope.output : [],
			requiresApproval: envelope.requiresApproval ? {
				type: "approval_request",
				prompt: envelope.requiresApproval.prompt,
				items: envelope.requiresApproval.items,
				...envelope.requiresApproval.resumeToken ? { resumeToken: envelope.requiresApproval.resumeToken } : {}
			} : null
		};
	}
	return {
		ok: false,
		error: {
			type: envelope.error?.type,
			message: envelope.error?.message ?? "lobster runtime failed"
		}
	};
}
function throwOnErrorEnvelope(envelope) {
	if (envelope.ok) return envelope;
	throw new Error(envelope.error.message);
}
async function resolveWorkflowFile(candidate, cwd) {
	const { stat } = await import("node:fs/promises");
	const resolved = path.isAbsolute(candidate) ? candidate : path.resolve(cwd, candidate);
	if (!(await stat(resolved)).isFile()) throw new Error("Workflow path is not a file");
	const ext = path.extname(resolved).toLowerCase();
	if (![
		".lobster",
		".yaml",
		".yml",
		".json"
	].includes(ext)) throw new Error("Workflow file must end in .lobster, .yaml, .yml, or .json");
	return resolved;
}
async function detectWorkflowFile(candidate, cwd) {
	const trimmed = candidate.trim();
	if (!trimmed || trimmed.includes("|")) return null;
	try {
		return await resolveWorkflowFile(trimmed, cwd);
	} catch {
		return null;
	}
}
function parseWorkflowArgs(argsJson) {
	return JSON.parse(argsJson);
}
function createEmbeddedToolContext(params, signal) {
	const env = { ...process.env };
	return {
		cwd: params.cwd,
		env,
		mode: "tool",
		stdin: Readable.from([]),
		stdout: createLimitedSink(Math.max(1024, params.maxStdoutBytes), "stdout"),
		stderr: createLimitedSink(Math.max(1024, params.maxStdoutBytes), "stderr"),
		signal
	};
}
async function withTimeout(timeoutMs, fn) {
	const timeout = Math.max(200, timeoutMs);
	const controller = new AbortController();
	return await new Promise((resolve, reject) => {
		const onTimeout = () => {
			const error = /* @__PURE__ */ new Error("lobster runtime timed out");
			controller.abort(error);
			reject(error);
		};
		const timer = setTimeout(onTimeout, timeout);
		fn(controller.signal).then((value) => {
			clearTimeout(timer);
			resolve(value);
		}, (error) => {
			clearTimeout(timer);
			reject(error);
		});
	});
}
async function loadEmbeddedToolRuntimeFromPackage() {
	return {
		runToolRequest,
		resumeToolRequest
	};
}
function createEmbeddedLobsterRunner(options) {
	const loadRuntime = options?.loadRuntime ?? loadEmbeddedToolRuntimeFromPackage;
	let runtimePromise;
	return { async run(params) {
		runtimePromise ??= loadRuntime();
		const runtime = await runtimePromise;
		return await withTimeout(params.timeoutMs, async (signal) => {
			const ctx = createEmbeddedToolContext(params, signal);
			if (params.action === "run") {
				const pipeline = params.pipeline?.trim() ?? "";
				if (!pipeline) throw new Error("pipeline required");
				const filePath = await detectWorkflowFile(pipeline, params.cwd);
				if (filePath) {
					const parsedArgsJson = params.argsJson?.trim() ?? "";
					let args;
					if (parsedArgsJson) try {
						args = parseWorkflowArgs(parsedArgsJson);
					} catch {
						throw new Error("run --args-json must be valid JSON");
					}
					return throwOnErrorEnvelope(normalizeEnvelope(await runtime.runToolRequest({
						filePath,
						args,
						ctx
					})));
				}
				return throwOnErrorEnvelope(normalizeEnvelope(await runtime.runToolRequest({
					pipeline,
					ctx
				})));
			}
			const token = params.token?.trim() ?? "";
			if (!token) throw new Error("token required");
			if (typeof params.approve !== "boolean") throw new Error("approve required");
			return throwOnErrorEnvelope(normalizeEnvelope(await runtime.resumeToolRequest({
				token,
				approved: params.approve,
				ctx
			})));
		});
	} };
}
//#endregion
//#region extensions/lobster/src/lobster-taskflow.ts
function toJsonLike(value, seen = /* @__PURE__ */ new WeakSet()) {
	if (value === null) return null;
	switch (typeof value) {
		case "boolean":
		case "string": return value;
		case "number": return Number.isFinite(value) ? value : String(value);
		case "bigint": return value.toString();
		case "undefined":
		case "function":
		case "symbol": return null;
		case "object": {
			if (value instanceof Date) return value.toISOString();
			if (Array.isArray(value)) return value.map((item) => toJsonLike(item, seen));
			if (seen.has(value)) return "[Circular]";
			seen.add(value);
			const jsonObject = {};
			for (const [key, entry] of Object.entries(value)) {
				if (entry === void 0 || typeof entry === "function" || typeof entry === "symbol") continue;
				jsonObject[key] = toJsonLike(entry, seen);
			}
			seen.delete(value);
			return jsonObject;
		}
	}
	return null;
}
function buildApprovalWaitState(envelope) {
	if (!envelope.requiresApproval) return {
		kind: "lobster_approval",
		prompt: "",
		items: []
	};
	return {
		kind: "lobster_approval",
		prompt: envelope.requiresApproval.prompt,
		items: envelope.requiresApproval.items.map((item) => toJsonLike(item)),
		...envelope.requiresApproval.resumeToken ? { resumeToken: envelope.requiresApproval.resumeToken } : {}
	};
}
function applyEnvelopeToFlow(params) {
	const { taskFlow, flow, envelope, waitingStep } = params;
	if (!envelope.ok) return taskFlow.fail({
		flowId: flow.flowId,
		expectedRevision: flow.revision
	});
	if (envelope.status === "needs_approval") return taskFlow.setWaiting({
		flowId: flow.flowId,
		expectedRevision: flow.revision,
		currentStep: waitingStep,
		waitJson: buildApprovalWaitState(envelope)
	});
	return taskFlow.finish({
		flowId: flow.flowId,
		expectedRevision: flow.revision
	});
}
function buildEnvelopeError(envelope) {
	return new Error(envelope.error.message);
}
async function runManagedLobsterFlow(params) {
	const flow = params.taskFlow.createManaged({
		controllerId: params.controllerId,
		goal: params.goal,
		currentStep: params.currentStep ?? "run_lobster",
		...params.stateJson !== void 0 ? { stateJson: params.stateJson } : {}
	});
	try {
		const envelope = await params.runner.run(params.runnerParams);
		const mutation = applyEnvelopeToFlow({
			taskFlow: params.taskFlow,
			flow,
			envelope,
			waitingStep: params.waitingStep ?? "await_lobster_approval"
		});
		if (!envelope.ok) return {
			ok: false,
			flow,
			mutation,
			error: buildEnvelopeError(envelope)
		};
		return {
			ok: true,
			envelope,
			flow,
			mutation
		};
	} catch (error) {
		const err = error instanceof Error ? error : new Error(String(error));
		try {
			return {
				ok: false,
				flow,
				mutation: params.taskFlow.fail({
					flowId: flow.flowId,
					expectedRevision: flow.revision
				}),
				error: err
			};
		} catch {
			return {
				ok: false,
				flow,
				error: err
			};
		}
	}
}
async function resumeManagedLobsterFlow(params) {
	const resumed = params.taskFlow.resume({
		flowId: params.flowId,
		expectedRevision: params.expectedRevision,
		status: "running",
		currentStep: params.currentStep ?? "resume_lobster"
	});
	if (!resumed.applied) return {
		ok: false,
		mutation: resumed,
		error: /* @__PURE__ */ new Error(`TaskFlow resume failed: ${resumed.code}`)
	};
	try {
		const envelope = await params.runner.run(params.runnerParams);
		const mutation = applyEnvelopeToFlow({
			taskFlow: params.taskFlow,
			flow: resumed.flow,
			envelope,
			waitingStep: params.waitingStep ?? "await_lobster_approval"
		});
		if (!envelope.ok) return {
			ok: false,
			flow: resumed.flow,
			mutation,
			error: buildEnvelopeError(envelope)
		};
		return {
			ok: true,
			envelope,
			flow: resumed.flow,
			mutation
		};
	} catch (error) {
		const err = error instanceof Error ? error : new Error(String(error));
		try {
			const mutation = params.taskFlow.fail({
				flowId: params.flowId,
				expectedRevision: resumed.flow.revision
			});
			return {
				ok: false,
				flow: resumed.flow,
				mutation,
				error: err
			};
		} catch {
			return {
				ok: false,
				flow: resumed.flow,
				error: err
			};
		}
	}
}
//#endregion
//#region extensions/lobster/src/lobster-tool.ts
function readOptionalTrimmedString(value, fieldName) {
	if (value === void 0) return;
	if (typeof value !== "string") throw new Error(`${fieldName} must be a string`);
	const trimmed = value.trim();
	return trimmed ? trimmed : void 0;
}
function readOptionalNumber(value, fieldName) {
	if (value === void 0) return;
	if (typeof value !== "number" || !Number.isInteger(value)) throw new Error(`${fieldName} must be an integer`);
	return value;
}
function readOptionalBoolean(value, fieldName) {
	if (value === void 0) return;
	if (typeof value !== "boolean") throw new Error(`${fieldName} must be a boolean`);
	return value;
}
function parseOptionalFlowStateJson(value) {
	if (value === void 0) return;
	if (typeof value !== "string") throw new Error("flowStateJson must be a JSON string");
	try {
		return JSON.parse(value);
	} catch {
		throw new Error("flowStateJson must be valid JSON");
	}
}
function parseRunFlowParams(params) {
	const controllerId = readOptionalTrimmedString(params.flowControllerId, "flowControllerId");
	const goal = readOptionalTrimmedString(params.flowGoal, "flowGoal");
	const currentStep = readOptionalTrimmedString(params.flowCurrentStep, "flowCurrentStep");
	const waitingStep = readOptionalTrimmedString(params.flowWaitingStep, "flowWaitingStep");
	const stateJson = parseOptionalFlowStateJson(params.flowStateJson);
	const resumeFlowId = readOptionalTrimmedString(params.flowId, "flowId");
	const resumeRevision = readOptionalNumber(params.flowExpectedRevision, "flowExpectedRevision");
	if (!(controllerId !== void 0 || goal !== void 0 || currentStep !== void 0 || waitingStep !== void 0 || stateJson !== void 0)) return null;
	if (resumeFlowId !== void 0 || resumeRevision !== void 0) throw new Error("run action does not accept flowId or flowExpectedRevision");
	if (!controllerId) throw new Error("flowControllerId required when using managed TaskFlow run mode");
	if (!goal) throw new Error("flowGoal required when using managed TaskFlow run mode");
	return {
		controllerId,
		goal,
		...currentStep ? { currentStep } : {},
		...waitingStep ? { waitingStep } : {},
		...stateJson !== void 0 ? { stateJson } : {}
	};
}
function parseResumeFlowParams(params) {
	const flowId = readOptionalTrimmedString(params.flowId, "flowId");
	const expectedRevision = readOptionalNumber(params.flowExpectedRevision, "flowExpectedRevision");
	const currentStep = readOptionalTrimmedString(params.flowCurrentStep, "flowCurrentStep");
	const waitingStep = readOptionalTrimmedString(params.flowWaitingStep, "flowWaitingStep");
	const token = readOptionalTrimmedString(params.token, "token");
	const approve = readOptionalBoolean(params.approve, "approve");
	const runControllerId = readOptionalTrimmedString(params.flowControllerId, "flowControllerId");
	const runGoal = readOptionalTrimmedString(params.flowGoal, "flowGoal");
	const stateJson = params.flowStateJson;
	if (!(flowId !== void 0 || expectedRevision !== void 0 || currentStep !== void 0 || waitingStep !== void 0)) return null;
	if (runControllerId !== void 0 || runGoal !== void 0 || stateJson !== void 0) throw new Error("resume action does not accept flowControllerId, flowGoal, or flowStateJson");
	if (!flowId) throw new Error("flowId required when using managed TaskFlow resume mode");
	if (expectedRevision === void 0) throw new Error("flowExpectedRevision required when using managed TaskFlow resume mode");
	if (!token) throw new Error("token required when using managed TaskFlow resume mode");
	if (approve === void 0) throw new Error("approve required when using managed TaskFlow resume mode");
	return {
		flowId,
		expectedRevision,
		...currentStep ? { currentStep } : {},
		...waitingStep ? { waitingStep } : {}
	};
}
function formatManagedFlowResult(result) {
	const details = {
		...result.envelope && typeof result.envelope === "object" && !Array.isArray(result.envelope) ? result.envelope : { envelope: result.envelope },
		flow: result.flow,
		mutation: result.mutation
	};
	return {
		content: [{
			type: "text",
			text: JSON.stringify(details, null, 2)
		}],
		details
	};
}
function requireTaskFlowRuntime(taskFlow, action) {
	if (!taskFlow) throw new Error(`Managed TaskFlow ${action} mode requires a bound taskFlow runtime`);
	return taskFlow;
}
function resolveManagedFlowToolResult(result) {
	if (!result.ok) throw result.error;
	return formatManagedFlowResult(result);
}
function createLobsterTool(api, options) {
	const runner = options?.runner ?? createEmbeddedLobsterRunner();
	return {
		name: "lobster",
		label: "Lobster Workflow",
		description: "Run Lobster pipelines as a local-first workflow runtime (typed JSON envelope + resumable approvals).",
		parameters: Type.Object({
			action: Type.Unsafe({
				type: "string",
				enum: ["run", "resume"]
			}),
			pipeline: Type.Optional(Type.String()),
			argsJson: Type.Optional(Type.String()),
			token: Type.Optional(Type.String()),
			approve: Type.Optional(Type.Boolean()),
			cwd: Type.Optional(Type.String({ description: "Relative working directory (optional). Must stay within the gateway working directory." })),
			timeoutMs: Type.Optional(Type.Number()),
			maxStdoutBytes: Type.Optional(Type.Number()),
			flowControllerId: Type.Optional(Type.String()),
			flowGoal: Type.Optional(Type.String()),
			flowStateJson: Type.Optional(Type.String()),
			flowId: Type.Optional(Type.String()),
			flowExpectedRevision: Type.Optional(Type.Number()),
			flowCurrentStep: Type.Optional(Type.String()),
			flowWaitingStep: Type.Optional(Type.String())
		}),
		async execute(_id, params) {
			const action = typeof params.action === "string" ? params.action.trim() : "";
			if (!action) throw new Error("action required");
			if (action !== "run" && action !== "resume") throw new Error(`Unknown action: ${action}`);
			const cwd = resolveLobsterCwd(params.cwd);
			const timeoutMs = typeof params.timeoutMs === "number" ? params.timeoutMs : 2e4;
			const maxStdoutBytes = typeof params.maxStdoutBytes === "number" ? params.maxStdoutBytes : 512e3;
			if (api.runtime?.version && api.logger?.debug) api.logger.debug(`lobster plugin runtime=${api.runtime.version}`);
			const runnerParams = {
				action,
				...typeof params.pipeline === "string" ? { pipeline: params.pipeline } : {},
				...typeof params.argsJson === "string" ? { argsJson: params.argsJson } : {},
				...typeof params.token === "string" ? { token: params.token } : {},
				...typeof params.approve === "boolean" ? { approve: params.approve } : {},
				cwd,
				timeoutMs,
				maxStdoutBytes
			};
			const taskFlow = options?.taskFlow;
			if (action === "run") {
				const flowParams = parseRunFlowParams(params);
				if (flowParams) return resolveManagedFlowToolResult(await runManagedLobsterFlow({
					taskFlow: requireTaskFlowRuntime(taskFlow, "run"),
					runner,
					runnerParams,
					controllerId: flowParams.controllerId,
					goal: flowParams.goal,
					...flowParams.stateJson !== void 0 ? { stateJson: flowParams.stateJson } : {},
					...flowParams.currentStep ? { currentStep: flowParams.currentStep } : {},
					...flowParams.waitingStep ? { waitingStep: flowParams.waitingStep } : {}
				}));
			} else {
				const flowParams = parseResumeFlowParams(params);
				if (flowParams) return resolveManagedFlowToolResult(await resumeManagedLobsterFlow({
					taskFlow: requireTaskFlowRuntime(taskFlow, "resume"),
					runner,
					runnerParams,
					flowId: flowParams.flowId,
					expectedRevision: flowParams.expectedRevision,
					...flowParams.currentStep ? { currentStep: flowParams.currentStep } : {},
					...flowParams.waitingStep ? { waitingStep: flowParams.waitingStep } : {}
				}));
			}
			const envelope = await runner.run(runnerParams);
			if (!envelope.ok) throw new Error(envelope.error.message);
			return {
				content: [{
					type: "text",
					text: JSON.stringify(envelope, null, 2)
				}],
				details: envelope
			};
		}
	};
}
//#endregion
//#region extensions/lobster/index.ts
var lobster_default = definePluginEntry({
	id: "lobster",
	name: "Lobster",
	description: "Optional local shell helper tools",
	register(api) {
		api.registerTool(((ctx) => {
			if (ctx.sandboxed) return null;
			return createLobsterTool(api, { taskFlow: api.runtime?.taskFlow && ctx.sessionKey ? api.runtime.taskFlow.fromToolContext(ctx) : void 0 });
		}), { optional: true });
	}
});
//#endregion
export { lobster_default as default };
