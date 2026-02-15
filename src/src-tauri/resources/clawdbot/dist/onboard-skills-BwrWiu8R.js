import { A as modelKey, D as buildModelAliasIndex, F as resolveConfiguredModelRef, Nt as DEFAULT_MODEL, Pt as DEFAULT_PROVIDER, T as buildAllowedModelSet, _ as upsertAuthProfileWithLock, _t as normalizeSecretInput, j as normalizeProviderId, mt as resolveEnvApiKey, p as listProfilesForProvider, ut as getCustomProviderApiKey, v as ensureAuthProfileStore } from "./auth-profiles-DnpV8DWM.js";
import { t as formatCliCommand } from "./command-format-CVN3MX2Q.js";
import { s as ensureDir, t as CONFIG_DIR, y as resolveUserPath } from "./utils-q1rHOG-N.js";
import { t as runCommandWithTimeout } from "./exec-B52LZOrO.js";
import { a as fetchWithTimeout, r as fetchWithSsrFGuard } from "./fetch-CiM7YqYo.js";
import { s as loadModelCatalog } from "./runner-BY_Cu0GM.js";
import { h as hasBinary, i as loadWorkspaceSkillEntries, t as resolveSkillsInstallPreferences, x as resolveSkillKey } from "./skills-C1pxUa-I.js";
import { g as resolveNodeManagerOptions, r as detectBinary } from "./onboard-helpers-HBGG6t5A.js";
import { t as resolveBrewExecutable } from "./brew-BHpoAcHk.js";
import { t as scanDirectoryWithSummary } from "./skill-scanner-DFG_N86N.js";
import { n as resolveWideAreaDiscoveryDomain } from "./widearea-dns-BL3z20Oj.js";
import { a as OPENAI_CODEX_DEFAULT_MODEL } from "./auth-choice-D4mJmR9L.js";
import { i as formatTokenK, o as normalizeAlias } from "./github-copilot-auth-CzffPdhi.js";
import { t as buildWorkspaceSkillStatus } from "./skills-status-C0KraF77.js";
import path from "node:path";
import fs from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

//#region src/infra/bonjour-discovery.ts
const DEFAULT_TIMEOUT_MS = 2e3;
const GATEWAY_SERVICE_TYPE = "_openclaw-gw._tcp";
function decodeDnsSdEscapes(value) {
	let decoded = false;
	const bytes = [];
	let pending = "";
	const flush = () => {
		if (!pending) return;
		bytes.push(...Buffer.from(pending, "utf8"));
		pending = "";
	};
	for (let i = 0; i < value.length; i += 1) {
		const ch = value[i] ?? "";
		if (ch === "\\" && i + 3 < value.length) {
			const escaped = value.slice(i + 1, i + 4);
			if (/^[0-9]{3}$/.test(escaped)) {
				const byte = Number.parseInt(escaped, 10);
				if (!Number.isFinite(byte) || byte < 0 || byte > 255) {
					pending += ch;
					continue;
				}
				flush();
				bytes.push(byte);
				decoded = true;
				i += 3;
				continue;
			}
		}
		pending += ch;
	}
	if (!decoded) return value;
	flush();
	return Buffer.from(bytes).toString("utf8");
}
function isTailnetIPv4(address) {
	const parts = address.split(".");
	if (parts.length !== 4) return false;
	const octets = parts.map((p) => Number.parseInt(p, 10));
	if (octets.some((n) => !Number.isFinite(n) || n < 0 || n > 255)) return false;
	const [a, b] = octets;
	return a === 100 && b >= 64 && b <= 127;
}
function parseDigShortLines(stdout) {
	return stdout.split("\n").map((l) => l.trim()).filter(Boolean);
}
function parseDigTxt(stdout) {
	const tokens = [];
	for (const raw of stdout.split("\n")) {
		const line = raw.trim();
		if (!line) continue;
		const matches = Array.from(line.matchAll(/"([^"]*)"/g), (m) => m[1] ?? "");
		for (const m of matches) {
			const unescaped = m.replaceAll("\\\\", "\\").replaceAll("\\\"", "\"").replaceAll("\\n", "\n");
			tokens.push(unescaped);
		}
	}
	return tokens;
}
function parseDigSrv(stdout) {
	const line = stdout.split("\n").map((l) => l.trim()).find(Boolean);
	if (!line) return null;
	const parts = line.split(/\s+/).filter(Boolean);
	if (parts.length < 4) return null;
	const port = Number.parseInt(parts[2] ?? "", 10);
	const hostRaw = parts[3] ?? "";
	if (!Number.isFinite(port) || port <= 0) return null;
	const host = hostRaw.replace(/\.$/, "");
	if (!host) return null;
	return {
		host,
		port
	};
}
function parseTailscaleStatusIPv4s(stdout) {
	const parsed = stdout ? JSON.parse(stdout) : {};
	const out = [];
	const addIps = (value) => {
		if (!value || typeof value !== "object") return;
		const ips = value.TailscaleIPs;
		if (!Array.isArray(ips)) return;
		for (const ip of ips) {
			if (typeof ip !== "string") continue;
			const trimmed = ip.trim();
			if (trimmed && isTailnetIPv4(trimmed)) out.push(trimmed);
		}
	};
	addIps(parsed.Self);
	const peerObj = parsed.Peer;
	if (peerObj && typeof peerObj === "object") for (const peer of Object.values(peerObj)) addIps(peer);
	return [...new Set(out)];
}
function parseIntOrNull(value) {
	if (!value) return;
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) ? parsed : void 0;
}
function parseTxtTokens(tokens) {
	const txt = {};
	for (const token of tokens) {
		const idx = token.indexOf("=");
		if (idx <= 0) continue;
		const key = token.slice(0, idx).trim();
		const value = decodeDnsSdEscapes(token.slice(idx + 1).trim());
		if (!key) continue;
		txt[key] = value;
	}
	return txt;
}
function parseDnsSdBrowse(stdout) {
	const instances = /* @__PURE__ */ new Set();
	for (const raw of stdout.split("\n")) {
		const line = raw.trim();
		if (!line || !line.includes(GATEWAY_SERVICE_TYPE)) continue;
		if (!line.includes("Add")) continue;
		const match = line.match(/_openclaw-gw\._tcp\.?\s+(.+)$/);
		if (match?.[1]) instances.add(decodeDnsSdEscapes(match[1].trim()));
	}
	return Array.from(instances.values());
}
function parseDnsSdResolve(stdout, instanceName) {
	const decodedInstanceName = decodeDnsSdEscapes(instanceName);
	const beacon = { instanceName: decodedInstanceName };
	let txt = {};
	for (const raw of stdout.split("\n")) {
		const line = raw.trim();
		if (!line) continue;
		if (line.includes("can be reached at")) {
			const match = line.match(/can be reached at\s+([^\s:]+):(\d+)/i);
			if (match?.[1]) beacon.host = match[1].replace(/\.$/, "");
			if (match?.[2]) beacon.port = parseIntOrNull(match[2]);
			continue;
		}
		if (line.startsWith("txt") || line.includes("txtvers=")) txt = parseTxtTokens(line.split(/\s+/).filter(Boolean));
	}
	beacon.txt = Object.keys(txt).length ? txt : void 0;
	if (txt.displayName) beacon.displayName = decodeDnsSdEscapes(txt.displayName);
	if (txt.lanHost) beacon.lanHost = txt.lanHost;
	if (txt.tailnetDns) beacon.tailnetDns = txt.tailnetDns;
	if (txt.cliPath) beacon.cliPath = txt.cliPath;
	beacon.gatewayPort = parseIntOrNull(txt.gatewayPort);
	beacon.sshPort = parseIntOrNull(txt.sshPort);
	if (txt.gatewayTls) {
		const raw = txt.gatewayTls.trim().toLowerCase();
		beacon.gatewayTls = raw === "1" || raw === "true" || raw === "yes";
	}
	if (txt.gatewayTlsSha256) beacon.gatewayTlsFingerprintSha256 = txt.gatewayTlsSha256;
	if (txt.role) beacon.role = txt.role;
	if (txt.transport) beacon.transport = txt.transport;
	if (!beacon.displayName) beacon.displayName = decodedInstanceName;
	return beacon;
}
async function discoverViaDnsSd(domain, timeoutMs, run) {
	const instances = parseDnsSdBrowse((await run([
		"dns-sd",
		"-B",
		GATEWAY_SERVICE_TYPE,
		domain
	], { timeoutMs })).stdout);
	const results = [];
	for (const instance of instances) {
		const parsed = parseDnsSdResolve((await run([
			"dns-sd",
			"-L",
			instance,
			GATEWAY_SERVICE_TYPE,
			domain
		], { timeoutMs })).stdout, instance);
		if (parsed) results.push({
			...parsed,
			domain
		});
	}
	return results;
}
async function discoverWideAreaViaTailnetDns(domain, timeoutMs, run) {
	if (!domain || domain === "local.") return [];
	const startedAt = Date.now();
	const remainingMs = () => timeoutMs - (Date.now() - startedAt);
	const tailscaleCandidates = ["tailscale", "/Applications/Tailscale.app/Contents/MacOS/Tailscale"];
	let ips = [];
	for (const candidate of tailscaleCandidates) try {
		ips = parseTailscaleStatusIPv4s((await run([
			candidate,
			"status",
			"--json"
		], { timeoutMs: Math.max(1, Math.min(700, remainingMs())) })).stdout);
		if (ips.length > 0) break;
	} catch {}
	if (ips.length === 0) return [];
	if (remainingMs() <= 0) return [];
	ips = ips.slice(0, 40);
	const probeName = `${GATEWAY_SERVICE_TYPE}.${domain.replace(/\.$/, "")}`;
	const concurrency = 6;
	let nextIndex = 0;
	let nameserver = null;
	let ptrs = [];
	const worker = async () => {
		while (nameserver === null) {
			const budget = remainingMs();
			if (budget <= 0) return;
			const i = nextIndex;
			nextIndex += 1;
			if (i >= ips.length) return;
			const ip = ips[i] ?? "";
			if (!ip) continue;
			try {
				const lines = parseDigShortLines((await run([
					"dig",
					"+short",
					"+time=1",
					"+tries=1",
					`@${ip}`,
					probeName,
					"PTR"
				], { timeoutMs: Math.max(1, Math.min(250, budget)) })).stdout);
				if (lines.length === 0) continue;
				nameserver = ip;
				ptrs = lines;
				return;
			} catch {}
		}
	};
	await Promise.all(Array.from({ length: Math.min(concurrency, ips.length) }, () => worker()));
	if (!nameserver || ptrs.length === 0) return [];
	if (remainingMs() <= 0) return [];
	const nameserverArg = `@${String(nameserver)}`;
	const results = [];
	for (const ptr of ptrs) {
		const budget = remainingMs();
		if (budget <= 0) break;
		const ptrName = ptr.trim().replace(/\.$/, "");
		if (!ptrName) continue;
		const instanceName = ptrName.replace(/\.?_openclaw-gw\._tcp\..*$/, "");
		const srv = await run([
			"dig",
			"+short",
			"+time=1",
			"+tries=1",
			nameserverArg,
			ptrName,
			"SRV"
		], { timeoutMs: Math.max(1, Math.min(350, budget)) }).catch(() => null);
		const srvParsed = srv ? parseDigSrv(srv.stdout) : null;
		if (!srvParsed) continue;
		const txtBudget = remainingMs();
		if (txtBudget <= 0) {
			results.push({
				instanceName: instanceName || ptrName,
				displayName: instanceName || ptrName,
				domain,
				host: srvParsed.host,
				port: srvParsed.port
			});
			continue;
		}
		const txt = await run([
			"dig",
			"+short",
			"+time=1",
			"+tries=1",
			nameserverArg,
			ptrName,
			"TXT"
		], { timeoutMs: Math.max(1, Math.min(350, txtBudget)) }).catch(() => null);
		const txtTokens = txt ? parseDigTxt(txt.stdout) : [];
		const txtMap = txtTokens.length > 0 ? parseTxtTokens(txtTokens) : {};
		const beacon = {
			instanceName: instanceName || ptrName,
			displayName: txtMap.displayName || instanceName || ptrName,
			domain,
			host: srvParsed.host,
			port: srvParsed.port,
			txt: Object.keys(txtMap).length ? txtMap : void 0,
			gatewayPort: parseIntOrNull(txtMap.gatewayPort),
			sshPort: parseIntOrNull(txtMap.sshPort),
			tailnetDns: txtMap.tailnetDns || void 0,
			cliPath: txtMap.cliPath || void 0
		};
		if (txtMap.gatewayTls) {
			const raw = txtMap.gatewayTls.trim().toLowerCase();
			beacon.gatewayTls = raw === "1" || raw === "true" || raw === "yes";
		}
		if (txtMap.gatewayTlsSha256) beacon.gatewayTlsFingerprintSha256 = txtMap.gatewayTlsSha256;
		if (txtMap.role) beacon.role = txtMap.role;
		if (txtMap.transport) beacon.transport = txtMap.transport;
		results.push(beacon);
	}
	return results;
}
function parseAvahiBrowse(stdout) {
	const results = [];
	let current = null;
	for (const raw of stdout.split("\n")) {
		const line = raw.trimEnd();
		if (!line) continue;
		if (line.startsWith("=") && line.includes(GATEWAY_SERVICE_TYPE)) {
			if (current) results.push(current);
			const marker = ` ${GATEWAY_SERVICE_TYPE}`;
			const idx = line.indexOf(marker);
			const left = idx >= 0 ? line.slice(0, idx).trim() : line;
			const parts = left.split(/\s+/);
			const instanceName = parts.length > 3 ? parts.slice(3).join(" ") : left;
			current = {
				instanceName,
				displayName: instanceName
			};
			continue;
		}
		if (!current) continue;
		const trimmed = line.trim();
		if (trimmed.startsWith("hostname =")) {
			const match = trimmed.match(/hostname\s*=\s*\[([^\]]+)\]/);
			if (match?.[1]) current.host = match[1];
			continue;
		}
		if (trimmed.startsWith("port =")) {
			const match = trimmed.match(/port\s*=\s*\[(\d+)\]/);
			if (match?.[1]) current.port = parseIntOrNull(match[1]);
			continue;
		}
		if (trimmed.startsWith("txt =")) {
			const txt = parseTxtTokens(Array.from(trimmed.matchAll(/"([^"]*)"/g), (m) => m[1]));
			current.txt = Object.keys(txt).length ? txt : void 0;
			if (txt.displayName) current.displayName = txt.displayName;
			if (txt.lanHost) current.lanHost = txt.lanHost;
			if (txt.tailnetDns) current.tailnetDns = txt.tailnetDns;
			if (txt.cliPath) current.cliPath = txt.cliPath;
			current.gatewayPort = parseIntOrNull(txt.gatewayPort);
			current.sshPort = parseIntOrNull(txt.sshPort);
			if (txt.gatewayTls) {
				const raw = txt.gatewayTls.trim().toLowerCase();
				current.gatewayTls = raw === "1" || raw === "true" || raw === "yes";
			}
			if (txt.gatewayTlsSha256) current.gatewayTlsFingerprintSha256 = txt.gatewayTlsSha256;
			if (txt.role) current.role = txt.role;
			if (txt.transport) current.transport = txt.transport;
		}
	}
	if (current) results.push(current);
	return results;
}
async function discoverViaAvahi(domain, timeoutMs, run) {
	const args = [
		"avahi-browse",
		"-rt",
		GATEWAY_SERVICE_TYPE
	];
	if (domain && domain !== "local.") args.push("-d", domain.replace(/\.$/, ""));
	return parseAvahiBrowse((await run(args, { timeoutMs })).stdout).map((beacon) => ({
		...beacon,
		domain
	}));
}
async function discoverGatewayBeacons(opts = {}) {
	const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
	const platform = opts.platform ?? process.platform;
	const run = opts.run ?? runCommandWithTimeout;
	const wideAreaDomain = resolveWideAreaDiscoveryDomain({ configDomain: opts.wideAreaDomain });
	const domainsRaw = Array.isArray(opts.domains) ? opts.domains : [];
	const defaultDomains = ["local.", ...wideAreaDomain ? [wideAreaDomain] : []];
	const domains = (domainsRaw.length > 0 ? domainsRaw : defaultDomains).map((d) => String(d).trim()).filter(Boolean).map((d) => d.endsWith(".") ? d : `${d}.`);
	try {
		if (platform === "darwin") {
			const discovered = (await Promise.allSettled(domains.map(async (domain) => await discoverViaDnsSd(domain, timeoutMs, run)))).flatMap((r) => r.status === "fulfilled" ? r.value : []);
			const wantsWideArea = wideAreaDomain ? domains.includes(wideAreaDomain) : false;
			const hasWideArea = wideAreaDomain ? discovered.some((b) => b.domain === wideAreaDomain) : false;
			if (wantsWideArea && !hasWideArea && wideAreaDomain) {
				const fallback = await discoverWideAreaViaTailnetDns(wideAreaDomain, timeoutMs, run).catch(() => []);
				return [...discovered, ...fallback];
			}
			return discovered;
		}
		if (platform === "linux") return (await Promise.allSettled(domains.map(async (domain) => await discoverViaAvahi(domain, timeoutMs, run)))).flatMap((r) => r.status === "fulfilled" ? r.value : []);
	} catch {
		return [];
	}
	return [];
}

//#endregion
//#region src/commands/model-picker.ts
const KEEP_VALUE = "__keep__";
const MANUAL_VALUE = "__manual__";
const VLLM_VALUE = "__vllm__";
const PROVIDER_FILTER_THRESHOLD = 30;
const VLLM_DEFAULT_BASE_URL = "http://127.0.0.1:8000/v1";
const VLLM_DEFAULT_CONTEXT_WINDOW = 128e3;
const VLLM_DEFAULT_MAX_TOKENS = 8192;
const VLLM_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
const HIDDEN_ROUTER_MODELS = new Set(["openrouter/auto"]);
function hasAuthForProvider(provider, cfg, store) {
	if (listProfilesForProvider(store, provider).length > 0) return true;
	if (resolveEnvApiKey(provider)) return true;
	if (getCustomProviderApiKey(cfg, provider)) return true;
	return false;
}
function resolveConfiguredModelRaw(cfg) {
	const raw = cfg.agents?.defaults?.model;
	if (typeof raw === "string") return raw.trim();
	return raw?.primary?.trim() ?? "";
}
function resolveConfiguredModelKeys(cfg) {
	const models = cfg.agents?.defaults?.models ?? {};
	return Object.keys(models).map((key) => String(key ?? "").trim()).filter((key) => key.length > 0);
}
function normalizeModelKeys(values) {
	const seen = /* @__PURE__ */ new Set();
	const next = [];
	for (const raw of values) {
		const value = String(raw ?? "").trim();
		if (!value || seen.has(value)) continue;
		seen.add(value);
		next.push(value);
	}
	return next;
}
async function promptManualModel(params) {
	const modelInput = await params.prompter.text({
		message: params.allowBlank ? "Default model (blank to keep)" : "Default model",
		initialValue: params.initialValue,
		placeholder: "provider/model",
		validate: params.allowBlank ? void 0 : (value) => value?.trim() ? void 0 : "Required"
	});
	const model = String(modelInput ?? "").trim();
	if (!model) return {};
	return { model };
}
async function promptDefaultModel(params) {
	const cfg = params.config;
	const allowKeep = params.allowKeep ?? true;
	const includeManual = params.includeManual ?? true;
	const includeVllm = params.includeVllm ?? false;
	const ignoreAllowlist = params.ignoreAllowlist ?? false;
	const preferredProviderRaw = params.preferredProvider?.trim();
	const preferredProvider = preferredProviderRaw ? normalizeProviderId(preferredProviderRaw) : void 0;
	const configuredRaw = resolveConfiguredModelRaw(cfg);
	const resolved = resolveConfiguredModelRef({
		cfg,
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	});
	const resolvedKey = modelKey(resolved.provider, resolved.model);
	const configuredKey = configuredRaw ? resolvedKey : "";
	const catalog = await loadModelCatalog({
		config: cfg,
		useCache: false
	});
	if (catalog.length === 0) return promptManualModel({
		prompter: params.prompter,
		allowBlank: allowKeep,
		initialValue: configuredRaw || resolvedKey || void 0
	});
	const aliasIndex = buildModelAliasIndex({
		cfg,
		defaultProvider: DEFAULT_PROVIDER
	});
	let models = catalog;
	if (!ignoreAllowlist) {
		const { allowedCatalog } = buildAllowedModelSet({
			cfg,
			catalog,
			defaultProvider: DEFAULT_PROVIDER
		});
		models = allowedCatalog.length > 0 ? allowedCatalog : catalog;
	}
	if (models.length === 0) return promptManualModel({
		prompter: params.prompter,
		allowBlank: allowKeep,
		initialValue: configuredRaw || resolvedKey || void 0
	});
	const providers = Array.from(new Set(models.map((entry) => entry.provider))).toSorted((a, b) => a.localeCompare(b));
	const hasPreferredProvider = preferredProvider ? providers.includes(preferredProvider) : false;
	if (!hasPreferredProvider && providers.length > 1 && models.length > PROVIDER_FILTER_THRESHOLD) {
		const selection = await params.prompter.select({
			message: "Filter models by provider",
			options: [{
				value: "*",
				label: "All providers"
			}, ...providers.map((provider) => {
				const count = models.filter((entry) => entry.provider === provider).length;
				return {
					value: provider,
					label: provider,
					hint: `${count} model${count === 1 ? "" : "s"}`
				};
			})]
		});
		if (selection !== "*") models = models.filter((entry) => entry.provider === selection);
	}
	if (hasPreferredProvider && preferredProvider) models = models.filter((entry) => entry.provider === preferredProvider);
	const agentDir = params.agentDir;
	const authStore = ensureAuthProfileStore(agentDir, { allowKeychainPrompt: false });
	const authCache = /* @__PURE__ */ new Map();
	const hasAuth = (provider) => {
		const cached = authCache.get(provider);
		if (cached !== void 0) return cached;
		const value = hasAuthForProvider(provider, cfg, authStore);
		authCache.set(provider, value);
		return value;
	};
	const options = [];
	if (allowKeep) options.push({
		value: KEEP_VALUE,
		label: configuredRaw ? `Keep current (${configuredRaw})` : `Keep current (default: ${resolvedKey})`,
		hint: configuredRaw && configuredRaw !== resolvedKey ? `resolves to ${resolvedKey}` : void 0
	});
	if (includeManual) options.push({
		value: MANUAL_VALUE,
		label: "Enter model manually"
	});
	if (includeVllm && agentDir) options.push({
		value: VLLM_VALUE,
		label: "vLLM (custom)",
		hint: "Enter vLLM URL + API key + model"
	});
	const seen = /* @__PURE__ */ new Set();
	const addModelOption = (entry) => {
		const key = modelKey(entry.provider, entry.id);
		if (seen.has(key)) return;
		if (HIDDEN_ROUTER_MODELS.has(key)) return;
		const hints = [];
		if (entry.name && entry.name !== entry.id) hints.push(entry.name);
		if (entry.contextWindow) hints.push(`ctx ${formatTokenK(entry.contextWindow)}`);
		if (entry.reasoning) hints.push("reasoning");
		const aliases = aliasIndex.byKey.get(key);
		if (aliases?.length) hints.push(`alias: ${aliases.join(", ")}`);
		if (!hasAuth(entry.provider)) hints.push("auth missing");
		options.push({
			value: key,
			label: key,
			hint: hints.length > 0 ? hints.join(" · ") : void 0
		});
		seen.add(key);
	};
	for (const entry of models) addModelOption(entry);
	if (configuredKey && !seen.has(configuredKey)) options.push({
		value: configuredKey,
		label: configuredKey,
		hint: "current (not in catalog)"
	});
	let initialValue = allowKeep ? KEEP_VALUE : configuredKey || void 0;
	if (allowKeep && hasPreferredProvider && preferredProvider && resolved.provider !== preferredProvider) {
		const firstModel = models[0];
		if (firstModel) initialValue = modelKey(firstModel.provider, firstModel.id);
	}
	const selection = await params.prompter.select({
		message: params.message ?? "Default model",
		options,
		initialValue
	});
	if (selection === KEEP_VALUE) return {};
	if (selection === MANUAL_VALUE) return promptManualModel({
		prompter: params.prompter,
		allowBlank: false,
		initialValue: configuredRaw || resolvedKey || void 0
	});
	if (selection === VLLM_VALUE) {
		if (!agentDir) {
			await params.prompter.note("vLLM setup requires an agent directory context.", "vLLM not available");
			return {};
		}
		const baseUrlRaw = await params.prompter.text({
			message: "vLLM base URL",
			initialValue: VLLM_DEFAULT_BASE_URL,
			placeholder: VLLM_DEFAULT_BASE_URL,
			validate: (value) => value?.trim() ? void 0 : "Required"
		});
		const apiKeyRaw = await params.prompter.text({
			message: "vLLM API key",
			placeholder: "sk-... (or any non-empty string)",
			validate: (value) => value?.trim() ? void 0 : "Required"
		});
		const modelIdRaw = await params.prompter.text({
			message: "vLLM model",
			placeholder: "meta-llama/Meta-Llama-3-8B-Instruct",
			validate: (value) => value?.trim() ? void 0 : "Required"
		});
		const baseUrl = String(baseUrlRaw ?? "").trim().replace(/\/+$/, "");
		const apiKey = String(apiKeyRaw ?? "").trim();
		const modelId = String(modelIdRaw ?? "").trim();
		await upsertAuthProfileWithLock({
			profileId: "vllm:default",
			credential: {
				type: "api_key",
				provider: "vllm",
				key: apiKey
			},
			agentDir
		});
		const nextConfig = {
			...cfg,
			models: {
				...cfg.models,
				mode: cfg.models?.mode ?? "merge",
				providers: {
					...cfg.models?.providers,
					vllm: {
						baseUrl,
						api: "openai-completions",
						apiKey: "VLLM_API_KEY",
						models: [{
							id: modelId,
							name: modelId,
							reasoning: false,
							input: ["text"],
							cost: VLLM_DEFAULT_COST,
							contextWindow: VLLM_DEFAULT_CONTEXT_WINDOW,
							maxTokens: VLLM_DEFAULT_MAX_TOKENS
						}]
					}
				}
			}
		};
		return {
			model: `vllm/${modelId}`,
			config: nextConfig
		};
	}
	return { model: String(selection) };
}
async function promptModelAllowlist(params) {
	const cfg = params.config;
	const existingKeys = resolveConfiguredModelKeys(cfg);
	const allowedKeys = normalizeModelKeys(params.allowedKeys ?? []);
	const allowedKeySet = allowedKeys.length > 0 ? new Set(allowedKeys) : null;
	const resolved = resolveConfiguredModelRef({
		cfg,
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	});
	const resolvedKey = modelKey(resolved.provider, resolved.model);
	const initialSeeds = normalizeModelKeys([
		...existingKeys,
		resolvedKey,
		...params.initialSelections ?? []
	]);
	const initialKeys = allowedKeySet ? initialSeeds.filter((key) => allowedKeySet.has(key)) : initialSeeds;
	const catalog = await loadModelCatalog({
		config: cfg,
		useCache: false
	});
	if (catalog.length === 0 && allowedKeys.length === 0) {
		const raw = await params.prompter.text({
			message: params.message ?? "Allowlist models (comma-separated provider/model; blank to keep current)",
			initialValue: existingKeys.join(", "),
			placeholder: `${OPENAI_CODEX_DEFAULT_MODEL}, anthropic/claude-opus-4-6`
		});
		const parsed = String(raw ?? "").split(",").map((value) => value.trim()).filter((value) => value.length > 0);
		if (parsed.length === 0) return {};
		return { models: normalizeModelKeys(parsed) };
	}
	const aliasIndex = buildModelAliasIndex({
		cfg,
		defaultProvider: DEFAULT_PROVIDER
	});
	const authStore = ensureAuthProfileStore(params.agentDir, { allowKeychainPrompt: false });
	const authCache = /* @__PURE__ */ new Map();
	const hasAuth = (provider) => {
		const cached = authCache.get(provider);
		if (cached !== void 0) return cached;
		const value = hasAuthForProvider(provider, cfg, authStore);
		authCache.set(provider, value);
		return value;
	};
	const options = [];
	const seen = /* @__PURE__ */ new Set();
	const addModelOption = (entry) => {
		const key = modelKey(entry.provider, entry.id);
		if (seen.has(key)) return;
		if (HIDDEN_ROUTER_MODELS.has(key)) return;
		const hints = [];
		if (entry.name && entry.name !== entry.id) hints.push(entry.name);
		if (entry.contextWindow) hints.push(`ctx ${formatTokenK(entry.contextWindow)}`);
		if (entry.reasoning) hints.push("reasoning");
		const aliases = aliasIndex.byKey.get(key);
		if (aliases?.length) hints.push(`alias: ${aliases.join(", ")}`);
		if (!hasAuth(entry.provider)) hints.push("auth missing");
		options.push({
			value: key,
			label: key,
			hint: hints.length > 0 ? hints.join(" · ") : void 0
		});
		seen.add(key);
	};
	const filteredCatalog = allowedKeySet ? catalog.filter((entry) => allowedKeySet.has(modelKey(entry.provider, entry.id))) : catalog;
	for (const entry of filteredCatalog) addModelOption(entry);
	const supplementalKeys = allowedKeySet ? allowedKeys : existingKeys;
	for (const key of supplementalKeys) {
		if (seen.has(key)) continue;
		options.push({
			value: key,
			label: key,
			hint: allowedKeySet ? "allowed (not in catalog)" : "configured (not in catalog)"
		});
		seen.add(key);
	}
	if (options.length === 0) return {};
	const selected = normalizeModelKeys((await params.prompter.multiselect({
		message: params.message ?? "Models in /model picker (multi-select)",
		options,
		initialValues: initialKeys.length > 0 ? initialKeys : void 0
	})).map((value) => String(value)));
	if (selected.length > 0) return { models: selected };
	if (existingKeys.length === 0) return { models: [] };
	if (!await params.prompter.confirm({
		message: "Clear the model allowlist? (shows all models)",
		initialValue: false
	})) return {};
	return { models: [] };
}
function applyPrimaryModel(cfg, model) {
	const defaults = cfg.agents?.defaults;
	const existingModel = defaults?.model;
	const existingModels = defaults?.models;
	const fallbacks = typeof existingModel === "object" && existingModel !== null && "fallbacks" in existingModel ? existingModel.fallbacks : void 0;
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...defaults,
				model: {
					...fallbacks ? { fallbacks } : void 0,
					primary: model
				},
				models: {
					...existingModels,
					[model]: existingModels?.[model] ?? {}
				}
			}
		}
	};
}
function applyModelAllowlist(cfg, models) {
	const defaults = cfg.agents?.defaults;
	const normalized = normalizeModelKeys(models);
	if (normalized.length === 0) {
		if (!defaults?.models) return cfg;
		const { models: _ignored, ...restDefaults } = defaults;
		return {
			...cfg,
			agents: {
				...cfg.agents,
				defaults: restDefaults
			}
		};
	}
	const existingModels = defaults?.models ?? {};
	const nextModels = {};
	for (const key of normalized) nextModels[key] = existingModels[key] ?? {};
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...defaults,
				models: nextModels
			}
		}
	};
}
function applyModelFallbacksFromSelection(cfg, selection) {
	const normalized = normalizeModelKeys(selection);
	if (normalized.length <= 1) return cfg;
	const resolved = resolveConfiguredModelRef({
		cfg,
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	});
	const resolvedKey = modelKey(resolved.provider, resolved.model);
	if (!normalized.includes(resolvedKey)) return cfg;
	const defaults = cfg.agents?.defaults;
	const existingModel = defaults?.model;
	const existingPrimary = typeof existingModel === "string" ? existingModel : existingModel && typeof existingModel === "object" ? existingModel.primary : void 0;
	const fallbacks = normalized.filter((key) => key !== resolvedKey);
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...defaults,
				model: {
					...typeof existingModel === "object" ? existingModel : void 0,
					primary: existingPrimary ?? resolvedKey,
					fallbacks
				}
			}
		}
	};
}

//#endregion
//#region src/commands/onboard-custom.ts
const DEFAULT_OLLAMA_BASE_URL = "http://127.0.0.1:11434/v1";
const DEFAULT_CONTEXT_WINDOW = 4096;
const DEFAULT_MAX_TOKENS = 4096;
const VERIFY_TIMEOUT_MS = 1e4;
var CustomApiError = class extends Error {
	constructor(code, message) {
		super(message);
		this.name = "CustomApiError";
		this.code = code;
	}
};
const COMPATIBILITY_OPTIONS = [
	{
		value: "openai",
		label: "OpenAI-compatible",
		hint: "Uses /chat/completions"
	},
	{
		value: "anthropic",
		label: "Anthropic-compatible",
		hint: "Uses /messages"
	},
	{
		value: "unknown",
		label: "Unknown (detect automatically)",
		hint: "Probes OpenAI then Anthropic endpoints"
	}
];
function normalizeEndpointId(raw) {
	const trimmed = raw.trim().toLowerCase();
	if (!trimmed) return "";
	return trimmed.replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
}
function buildEndpointIdFromUrl(baseUrl) {
	try {
		const url = new URL(baseUrl);
		return normalizeEndpointId(`custom-${url.hostname.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}${url.port ? `-${url.port}` : ""}`) || "custom";
	} catch {
		return "custom";
	}
}
function resolveUniqueEndpointId(params) {
	const normalized = normalizeEndpointId(params.requestedId) || "custom";
	const existing = params.providers[normalized];
	if (!existing?.baseUrl || existing.baseUrl === params.baseUrl) return {
		providerId: normalized,
		renamed: false
	};
	let suffix = 2;
	let candidate = `${normalized}-${suffix}`;
	while (params.providers[candidate]) {
		suffix += 1;
		candidate = `${normalized}-${suffix}`;
	}
	return {
		providerId: candidate,
		renamed: true
	};
}
function resolveAliasError(params) {
	const trimmed = params.raw.trim();
	if (!trimmed) return;
	let normalized;
	try {
		normalized = normalizeAlias(trimmed);
	} catch (err) {
		return err instanceof Error ? err.message : "Alias is invalid.";
	}
	const aliasIndex = buildModelAliasIndex({
		cfg: params.cfg,
		defaultProvider: DEFAULT_PROVIDER
	});
	const aliasKey = normalized.toLowerCase();
	const existing = aliasIndex.byAlias.get(aliasKey);
	if (!existing) return;
	const existingKey = modelKey(existing.ref.provider, existing.ref.model);
	if (existingKey === params.modelRef) return;
	return `Alias ${normalized} already points to ${existingKey}.`;
}
function buildOpenAiHeaders(apiKey) {
	const headers = {};
	if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
	return headers;
}
function buildAnthropicHeaders(apiKey) {
	const headers = { "anthropic-version": "2023-06-01" };
	if (apiKey) headers["x-api-key"] = apiKey;
	return headers;
}
function formatVerificationError(error) {
	if (!error) return "unknown error";
	if (error instanceof Error) return error.message;
	if (typeof error === "string") return error;
	try {
		return JSON.stringify(error);
	} catch {
		return "unknown error";
	}
}
async function requestOpenAiVerification(params) {
	const endpoint = new URL("chat/completions", params.baseUrl.endsWith("/") ? params.baseUrl : `${params.baseUrl}/`).href;
	try {
		const res = await fetchWithTimeout(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...buildOpenAiHeaders(params.apiKey)
			},
			body: JSON.stringify({
				model: params.modelId,
				messages: [{
					role: "user",
					content: "Hi"
				}],
				max_tokens: 5
			})
		}, VERIFY_TIMEOUT_MS);
		return {
			ok: res.ok,
			status: res.status
		};
	} catch (error) {
		return {
			ok: false,
			error
		};
	}
}
async function requestAnthropicVerification(params) {
	const endpoint = new URL("messages", params.baseUrl.endsWith("/") ? params.baseUrl : `${params.baseUrl}/`).href;
	try {
		const res = await fetchWithTimeout(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...buildAnthropicHeaders(params.apiKey)
			},
			body: JSON.stringify({
				model: params.modelId,
				max_tokens: 16,
				messages: [{
					role: "user",
					content: "Hi"
				}]
			})
		}, VERIFY_TIMEOUT_MS);
		return {
			ok: res.ok,
			status: res.status
		};
	} catch (error) {
		return {
			ok: false,
			error
		};
	}
}
async function promptBaseUrlAndKey(params) {
	const baseUrlInput = await params.prompter.text({
		message: "API Base URL",
		initialValue: params.initialBaseUrl ?? DEFAULT_OLLAMA_BASE_URL,
		placeholder: "https://api.example.com/v1",
		validate: (val) => {
			try {
				new URL(val);
				return;
			} catch {
				return "Please enter a valid URL (e.g. http://...)";
			}
		}
	});
	const apiKeyInput = await params.prompter.text({
		message: "API Key (leave blank if not required)",
		placeholder: "sk-...",
		initialValue: ""
	});
	return {
		baseUrl: baseUrlInput.trim(),
		apiKey: apiKeyInput.trim()
	};
}
function resolveProviderApi(compatibility) {
	return compatibility === "anthropic" ? "anthropic-messages" : "openai-completions";
}
function parseCustomApiCompatibility(raw) {
	const compatibilityRaw = raw?.trim().toLowerCase();
	if (!compatibilityRaw) return "openai";
	if (compatibilityRaw !== "openai" && compatibilityRaw !== "anthropic") throw new CustomApiError("invalid_compatibility", "Invalid --custom-compatibility (use \"openai\" or \"anthropic\").");
	return compatibilityRaw;
}
function resolveCustomProviderId(params) {
	const providers = params.config.models?.providers ?? {};
	const baseUrl = params.baseUrl.trim();
	const explicitProviderId = params.providerId?.trim();
	if (explicitProviderId && !normalizeEndpointId(explicitProviderId)) throw new CustomApiError("invalid_provider_id", "Custom provider ID must include letters, numbers, or hyphens.");
	const requestedProviderId = explicitProviderId || buildEndpointIdFromUrl(baseUrl);
	const providerIdResult = resolveUniqueEndpointId({
		requestedId: requestedProviderId,
		baseUrl,
		providers
	});
	return {
		providerId: providerIdResult.providerId,
		...providerIdResult.renamed ? { providerIdRenamedFrom: normalizeEndpointId(requestedProviderId) || "custom" } : {}
	};
}
function parseNonInteractiveCustomApiFlags(params) {
	const baseUrl = params.baseUrl?.trim() ?? "";
	const modelId = params.modelId?.trim() ?? "";
	if (!baseUrl || !modelId) throw new CustomApiError("missing_required", ["Auth choice \"custom-api-key\" requires a base URL and model ID.", "Use --custom-base-url and --custom-model-id."].join("\n"));
	const apiKey = params.apiKey?.trim();
	const providerId = params.providerId?.trim();
	if (providerId && !normalizeEndpointId(providerId)) throw new CustomApiError("invalid_provider_id", "Custom provider ID must include letters, numbers, or hyphens.");
	return {
		baseUrl,
		modelId,
		compatibility: parseCustomApiCompatibility(params.compatibility),
		...apiKey ? { apiKey } : {},
		...providerId ? { providerId } : {}
	};
}
function applyCustomApiConfig(params) {
	const baseUrl = params.baseUrl.trim();
	try {
		new URL(baseUrl);
	} catch {
		throw new CustomApiError("invalid_base_url", "Custom provider base URL must be a valid URL.");
	}
	if (params.compatibility !== "openai" && params.compatibility !== "anthropic") throw new CustomApiError("invalid_compatibility", "Custom provider compatibility must be \"openai\" or \"anthropic\".");
	const modelId = params.modelId.trim();
	if (!modelId) throw new CustomApiError("invalid_model_id", "Custom provider model ID is required.");
	const providerIdResult = resolveCustomProviderId({
		config: params.config,
		baseUrl,
		providerId: params.providerId
	});
	const providerId = providerIdResult.providerId;
	const providers = params.config.models?.providers ?? {};
	const modelRef = modelKey(providerId, modelId);
	const alias = params.alias?.trim() ?? "";
	const aliasError = resolveAliasError({
		raw: alias,
		cfg: params.config,
		modelRef
	});
	if (aliasError) throw new CustomApiError("invalid_alias", aliasError);
	const existingProvider = providers[providerId];
	const existingModels = Array.isArray(existingProvider?.models) ? existingProvider.models : [];
	const hasModel = existingModels.some((model) => model.id === modelId);
	const nextModel = {
		id: modelId,
		name: `${modelId} (Custom Provider)`,
		contextWindow: DEFAULT_CONTEXT_WINDOW,
		maxTokens: DEFAULT_MAX_TOKENS,
		input: ["text"],
		cost: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0
		},
		reasoning: false
	};
	const mergedModels = hasModel ? existingModels : [...existingModels, nextModel];
	const { apiKey: existingApiKey, ...existingProviderRest } = existingProvider ?? {};
	const normalizedApiKey = params.apiKey?.trim() || (existingApiKey ? existingApiKey.trim() : void 0);
	let config = {
		...params.config,
		models: {
			...params.config.models,
			mode: params.config.models?.mode ?? "merge",
			providers: {
				...providers,
				[providerId]: {
					...existingProviderRest,
					baseUrl,
					api: resolveProviderApi(params.compatibility),
					...normalizedApiKey ? { apiKey: normalizedApiKey } : {},
					models: mergedModels.length > 0 ? mergedModels : [nextModel]
				}
			}
		}
	};
	config = applyPrimaryModel(config, modelRef);
	if (alias) config = {
		...config,
		agents: {
			...config.agents,
			defaults: {
				...config.agents?.defaults,
				models: {
					...config.agents?.defaults?.models,
					[modelRef]: {
						...config.agents?.defaults?.models?.[modelRef],
						alias
					}
				}
			}
		}
	};
	return {
		config,
		providerId,
		modelId,
		...providerIdResult.providerIdRenamedFrom ? { providerIdRenamedFrom: providerIdResult.providerIdRenamedFrom } : {}
	};
}
async function promptCustomApiConfig(params) {
	const { prompter, runtime, config } = params;
	const baseInput = await promptBaseUrlAndKey({ prompter });
	let baseUrl = baseInput.baseUrl;
	let apiKey = baseInput.apiKey;
	const compatibilityChoice = await prompter.select({
		message: "Endpoint compatibility",
		options: COMPATIBILITY_OPTIONS.map((option) => ({
			value: option.value,
			label: option.label,
			hint: option.hint
		}))
	});
	let modelId = (await prompter.text({
		message: "Model ID",
		placeholder: "e.g. llama3, claude-3-7-sonnet",
		validate: (val) => val.trim() ? void 0 : "Model ID is required"
	})).trim();
	let compatibility = compatibilityChoice === "unknown" ? null : compatibilityChoice;
	while (true) {
		let verifiedFromProbe = false;
		if (!compatibility) {
			const probeSpinner = prompter.progress("Detecting endpoint type...");
			if ((await requestOpenAiVerification({
				baseUrl,
				apiKey,
				modelId
			})).ok) {
				probeSpinner.stop("Detected OpenAI-compatible endpoint.");
				compatibility = "openai";
				verifiedFromProbe = true;
			} else if ((await requestAnthropicVerification({
				baseUrl,
				apiKey,
				modelId
			})).ok) {
				probeSpinner.stop("Detected Anthropic-compatible endpoint.");
				compatibility = "anthropic";
				verifiedFromProbe = true;
			} else {
				probeSpinner.stop("Could not detect endpoint type.");
				await prompter.note("This endpoint did not respond to OpenAI or Anthropic style requests.", "Endpoint detection");
				const retryChoice = await prompter.select({
					message: "What would you like to change?",
					options: [
						{
							value: "baseUrl",
							label: "Change base URL"
						},
						{
							value: "model",
							label: "Change model"
						},
						{
							value: "both",
							label: "Change base URL and model"
						}
					]
				});
				if (retryChoice === "baseUrl" || retryChoice === "both") {
					const retryInput = await promptBaseUrlAndKey({
						prompter,
						initialBaseUrl: baseUrl
					});
					baseUrl = retryInput.baseUrl;
					apiKey = retryInput.apiKey;
				}
				if (retryChoice === "model" || retryChoice === "both") modelId = (await prompter.text({
					message: "Model ID",
					placeholder: "e.g. llama3, claude-3-7-sonnet",
					validate: (val) => val.trim() ? void 0 : "Model ID is required"
				})).trim();
				continue;
			}
		}
		if (verifiedFromProbe) break;
		const verifySpinner = prompter.progress("Verifying...");
		const result = compatibility === "anthropic" ? await requestAnthropicVerification({
			baseUrl,
			apiKey,
			modelId
		}) : await requestOpenAiVerification({
			baseUrl,
			apiKey,
			modelId
		});
		if (result.ok) {
			verifySpinner.stop("Verification successful.");
			break;
		}
		if (result.status !== void 0) verifySpinner.stop(`Verification failed: status ${result.status}`);
		else verifySpinner.stop(`Verification failed: ${formatVerificationError(result.error)}`);
		const retryChoice = await prompter.select({
			message: "What would you like to change?",
			options: [
				{
					value: "baseUrl",
					label: "Change base URL"
				},
				{
					value: "model",
					label: "Change model"
				},
				{
					value: "both",
					label: "Change base URL and model"
				}
			]
		});
		if (retryChoice === "baseUrl" || retryChoice === "both") {
			const retryInput = await promptBaseUrlAndKey({
				prompter,
				initialBaseUrl: baseUrl
			});
			baseUrl = retryInput.baseUrl;
			apiKey = retryInput.apiKey;
		}
		if (retryChoice === "model" || retryChoice === "both") modelId = (await prompter.text({
			message: "Model ID",
			placeholder: "e.g. llama3, claude-3-7-sonnet",
			validate: (val) => val.trim() ? void 0 : "Model ID is required"
		})).trim();
		if (compatibilityChoice === "unknown") compatibility = null;
	}
	const providers = config.models?.providers ?? {};
	const suggestedId = buildEndpointIdFromUrl(baseUrl);
	const providerIdInput = await prompter.text({
		message: "Endpoint ID",
		initialValue: suggestedId,
		placeholder: "custom",
		validate: (value) => {
			if (!normalizeEndpointId(value)) return "Endpoint ID is required.";
		}
	});
	const aliasInput = await prompter.text({
		message: "Model alias (optional)",
		placeholder: "e.g. local, ollama",
		initialValue: "",
		validate: (value) => {
			return resolveAliasError({
				raw: value,
				cfg: config,
				modelRef: modelKey(resolveUniqueEndpointId({
					requestedId: normalizeEndpointId(providerIdInput) || "custom",
					baseUrl,
					providers
				}).providerId, modelId)
			});
		}
	});
	const result = applyCustomApiConfig({
		config,
		baseUrl,
		modelId,
		compatibility: compatibility ?? "openai",
		apiKey,
		providerId: providerIdInput,
		alias: aliasInput
	});
	if (result.providerIdRenamedFrom && result.providerId) await prompter.note(`Endpoint ID "${result.providerIdRenamedFrom}" already exists for a different base URL. Using "${result.providerId}".`, "Endpoint ID");
	runtime.log(`Configured custom provider: ${result.providerId}/${result.modelId}`);
	return result;
}

//#endregion
//#region src/commands/onboard-remote.ts
const DEFAULT_GATEWAY_URL = "ws://127.0.0.1:18789";
function pickHost(beacon) {
	return beacon.tailnetDns || beacon.lanHost || beacon.host;
}
function buildLabel(beacon) {
	const host = pickHost(beacon);
	const port = beacon.gatewayPort ?? beacon.port ?? 18789;
	return `${beacon.displayName ?? beacon.instanceName} (${host ? `${host}:${port}` : "host unknown"})`;
}
function ensureWsUrl(value) {
	const trimmed = value.trim();
	if (!trimmed) return DEFAULT_GATEWAY_URL;
	return trimmed;
}
async function promptRemoteGatewayConfig(cfg, prompter) {
	let selectedBeacon = null;
	let suggestedUrl = cfg.gateway?.remote?.url ?? DEFAULT_GATEWAY_URL;
	const hasBonjourTool = await detectBinary("dns-sd") || await detectBinary("avahi-browse");
	const wantsDiscover = hasBonjourTool ? await prompter.confirm({
		message: "Discover gateway on LAN (Bonjour)?",
		initialValue: true
	}) : false;
	if (!hasBonjourTool) await prompter.note(["Bonjour discovery requires dns-sd (macOS) or avahi-browse (Linux).", "Docs: https://docs.openclaw.ai/gateway/discovery"].join("\n"), "Discovery");
	if (wantsDiscover) {
		const wideAreaDomain = resolveWideAreaDiscoveryDomain({ configDomain: cfg.discovery?.wideArea?.domain });
		const spin = prompter.progress("Searching for gateways…");
		const beacons = await discoverGatewayBeacons({
			timeoutMs: 2e3,
			wideAreaDomain
		});
		spin.stop(beacons.length > 0 ? `Found ${beacons.length} gateway(s)` : "No gateways found");
		if (beacons.length > 0) {
			const selection = await prompter.select({
				message: "Select gateway",
				options: [...beacons.map((beacon, index) => ({
					value: String(index),
					label: buildLabel(beacon)
				})), {
					value: "manual",
					label: "Enter URL manually"
				}]
			});
			if (selection !== "manual") {
				const idx = Number.parseInt(String(selection), 10);
				selectedBeacon = Number.isFinite(idx) ? beacons[idx] ?? null : null;
			}
		}
	}
	if (selectedBeacon) {
		const host = pickHost(selectedBeacon);
		const port = selectedBeacon.gatewayPort ?? 18789;
		if (host) if (await prompter.select({
			message: "Connection method",
			options: [{
				value: "direct",
				label: `Direct gateway WS (${host}:${port})`
			}, {
				value: "ssh",
				label: "SSH tunnel (loopback)"
			}]
		}) === "direct") suggestedUrl = `ws://${host}:${port}`;
		else {
			suggestedUrl = DEFAULT_GATEWAY_URL;
			await prompter.note([
				"Start a tunnel before using the CLI:",
				`ssh -N -L 18789:127.0.0.1:18789 <user>@${host}${selectedBeacon.sshPort ? ` -p ${selectedBeacon.sshPort}` : ""}`,
				"Docs: https://docs.openclaw.ai/gateway/remote"
			].join("\n"), "SSH tunnel");
		}
	}
	const urlInput = await prompter.text({
		message: "Gateway WebSocket URL",
		initialValue: suggestedUrl,
		validate: (value) => String(value).trim().startsWith("ws://") || String(value).trim().startsWith("wss://") ? void 0 : "URL must start with ws:// or wss://"
	});
	const url = ensureWsUrl(String(urlInput));
	const authChoice = await prompter.select({
		message: "Gateway auth",
		options: [{
			value: "token",
			label: "Token (recommended)"
		}, {
			value: "off",
			label: "No auth"
		}]
	});
	let token = cfg.gateway?.remote?.token ?? "";
	if (authChoice === "token") token = String(await prompter.text({
		message: "Gateway token",
		initialValue: token,
		validate: (value) => value?.trim() ? void 0 : "Required"
	})).trim();
	else token = "";
	return {
		...cfg,
		gateway: {
			...cfg.gateway,
			mode: "remote",
			remote: {
				url,
				token: token || void 0
			}
		}
	};
}

//#endregion
//#region src/agents/skills-install.ts
function isNodeReadableStream(value) {
	return Boolean(value && typeof value.pipe === "function");
}
function summarizeInstallOutput(text) {
	const raw = text.trim();
	if (!raw) return;
	const lines = raw.split("\n").map((line) => line.trim()).filter(Boolean);
	if (lines.length === 0) return;
	const preferred = lines.find((line) => /^error\b/i.test(line)) ?? lines.find((line) => /\b(err!|error:|failed)\b/i.test(line)) ?? lines.at(-1);
	if (!preferred) return;
	const normalized = preferred.replace(/\s+/g, " ").trim();
	const maxLen = 200;
	return normalized.length > maxLen ? `${normalized.slice(0, maxLen - 1)}…` : normalized;
}
function formatInstallFailureMessage(result) {
	const code = typeof result.code === "number" ? `exit ${result.code}` : "unknown exit";
	const summary = summarizeInstallOutput(result.stderr) ?? summarizeInstallOutput(result.stdout);
	if (!summary) return `Install failed (${code})`;
	return `Install failed (${code}): ${summary}`;
}
function withWarnings(result, warnings) {
	if (warnings.length === 0) return result;
	return {
		...result,
		warnings: warnings.slice()
	};
}
function formatScanFindingDetail(rootDir, finding) {
	const relativePath = path.relative(rootDir, finding.file);
	const filePath = relativePath && relativePath !== "." && !relativePath.startsWith("..") ? relativePath : path.basename(finding.file);
	return `${finding.message} (${filePath}:${finding.line})`;
}
async function collectSkillInstallScanWarnings(entry) {
	const warnings = [];
	const skillName = entry.skill.name;
	const skillDir = path.resolve(entry.skill.baseDir);
	try {
		const summary = await scanDirectoryWithSummary(skillDir);
		if (summary.critical > 0) {
			const criticalDetails = summary.findings.filter((finding) => finding.severity === "critical").map((finding) => formatScanFindingDetail(skillDir, finding)).join("; ");
			warnings.push(`WARNING: Skill "${skillName}" contains dangerous code patterns: ${criticalDetails}`);
		} else if (summary.warn > 0) warnings.push(`Skill "${skillName}" has ${summary.warn} suspicious code pattern(s). Run "openclaw security audit --deep" for details.`);
	} catch (err) {
		warnings.push(`Skill "${skillName}" code safety scan failed (${String(err)}). Installation continues; run "openclaw security audit --deep" after install.`);
	}
	return warnings;
}
function resolveInstallId(spec, index) {
	return (spec.id ?? `${spec.kind}-${index}`).trim();
}
function findInstallSpec(entry, installId) {
	const specs = entry.metadata?.install ?? [];
	for (const [index, spec] of specs.entries()) if (resolveInstallId(spec, index) === installId) return spec;
}
function buildNodeInstallCommand(packageName, prefs) {
	switch (prefs.nodeManager) {
		case "pnpm": return [
			"pnpm",
			"add",
			"-g",
			"--ignore-scripts",
			packageName
		];
		case "yarn": return [
			"yarn",
			"global",
			"add",
			"--ignore-scripts",
			packageName
		];
		case "bun": return [
			"bun",
			"add",
			"-g",
			"--ignore-scripts",
			packageName
		];
		default: return [
			"npm",
			"install",
			"-g",
			"--ignore-scripts",
			packageName
		];
	}
}
function buildInstallCommand(spec, prefs) {
	switch (spec.kind) {
		case "brew":
			if (!spec.formula) return {
				argv: null,
				error: "missing brew formula"
			};
			return { argv: [
				"brew",
				"install",
				spec.formula
			] };
		case "node":
			if (!spec.package) return {
				argv: null,
				error: "missing node package"
			};
			return { argv: buildNodeInstallCommand(spec.package, prefs) };
		case "go":
			if (!spec.module) return {
				argv: null,
				error: "missing go module"
			};
			return { argv: [
				"go",
				"install",
				spec.module
			] };
		case "uv":
			if (!spec.package) return {
				argv: null,
				error: "missing uv package"
			};
			return { argv: [
				"uv",
				"tool",
				"install",
				spec.package
			] };
		case "download": return {
			argv: null,
			error: "download install handled separately"
		};
		default: return {
			argv: null,
			error: "unsupported installer"
		};
	}
}
function resolveDownloadTargetDir(entry, spec) {
	if (spec.targetDir?.trim()) return resolveUserPath(spec.targetDir);
	const key = resolveSkillKey(entry.skill, entry);
	return path.join(CONFIG_DIR, "tools", key);
}
function resolveArchiveType(spec, filename) {
	const explicit = spec.archive?.trim().toLowerCase();
	if (explicit) return explicit;
	const lower = filename.toLowerCase();
	if (lower.endsWith(".tar.gz") || lower.endsWith(".tgz")) return "tar.gz";
	if (lower.endsWith(".tar.bz2") || lower.endsWith(".tbz2")) return "tar.bz2";
	if (lower.endsWith(".zip")) return "zip";
}
async function downloadFile(url, destPath, timeoutMs) {
	const { response, release } = await fetchWithSsrFGuard({
		url,
		timeoutMs: Math.max(1e3, timeoutMs)
	});
	try {
		if (!response.ok || !response.body) throw new Error(`Download failed (${response.status} ${response.statusText})`);
		await ensureDir(path.dirname(destPath));
		const file = fs.createWriteStream(destPath);
		const body = response.body;
		await pipeline(isNodeReadableStream(body) ? body : Readable.fromWeb(body), file);
		return { bytes: (await fs.promises.stat(destPath)).size };
	} finally {
		await release();
	}
}
async function extractArchive(params) {
	const { archivePath, archiveType, targetDir, stripComponents, timeoutMs } = params;
	if (archiveType === "zip") {
		if (!hasBinary("unzip")) return {
			stdout: "",
			stderr: "unzip not found on PATH",
			code: null
		};
		return await runCommandWithTimeout([
			"unzip",
			"-q",
			archivePath,
			"-d",
			targetDir
		], { timeoutMs });
	}
	if (!hasBinary("tar")) return {
		stdout: "",
		stderr: "tar not found on PATH",
		code: null
	};
	const argv = [
		"tar",
		"xf",
		archivePath,
		"-C",
		targetDir
	];
	if (typeof stripComponents === "number" && Number.isFinite(stripComponents)) argv.push("--strip-components", String(Math.max(0, Math.floor(stripComponents))));
	return await runCommandWithTimeout(argv, { timeoutMs });
}
async function installDownloadSpec(params) {
	const { entry, spec, timeoutMs } = params;
	const url = spec.url?.trim();
	if (!url) return {
		ok: false,
		message: "missing download url",
		stdout: "",
		stderr: "",
		code: null
	};
	let filename = "";
	try {
		const parsed = new URL(url);
		filename = path.basename(parsed.pathname);
	} catch {
		filename = path.basename(url);
	}
	if (!filename) filename = "download";
	const targetDir = resolveDownloadTargetDir(entry, spec);
	await ensureDir(targetDir);
	const archivePath = path.join(targetDir, filename);
	let downloaded = 0;
	try {
		downloaded = (await downloadFile(url, archivePath, timeoutMs)).bytes;
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return {
			ok: false,
			message,
			stdout: "",
			stderr: message,
			code: null
		};
	}
	const archiveType = resolveArchiveType(spec, filename);
	if (!(spec.extract ?? Boolean(archiveType))) return {
		ok: true,
		message: `Downloaded to ${archivePath}`,
		stdout: `downloaded=${downloaded}`,
		stderr: "",
		code: 0
	};
	if (!archiveType) return {
		ok: false,
		message: "extract requested but archive type could not be detected",
		stdout: "",
		stderr: "",
		code: null
	};
	const extractResult = await extractArchive({
		archivePath,
		archiveType,
		targetDir,
		stripComponents: spec.stripComponents,
		timeoutMs
	});
	const success = extractResult.code === 0;
	return {
		ok: success,
		message: success ? `Downloaded and extracted to ${targetDir}` : formatInstallFailureMessage(extractResult),
		stdout: extractResult.stdout.trim(),
		stderr: extractResult.stderr.trim(),
		code: extractResult.code
	};
}
async function resolveBrewBinDir(timeoutMs, brewExe) {
	const exe = brewExe ?? (hasBinary("brew") ? "brew" : resolveBrewExecutable());
	if (!exe) return;
	const prefixResult = await runCommandWithTimeout([exe, "--prefix"], { timeoutMs: Math.min(timeoutMs, 3e4) });
	if (prefixResult.code === 0) {
		const prefix = prefixResult.stdout.trim();
		if (prefix) return path.join(prefix, "bin");
	}
	const envPrefix = process.env.HOMEBREW_PREFIX?.trim();
	if (envPrefix) return path.join(envPrefix, "bin");
	for (const candidate of ["/opt/homebrew/bin", "/usr/local/bin"]) try {
		if (fs.existsSync(candidate)) return candidate;
	} catch {}
}
async function installSkill(params) {
	const timeoutMs = Math.min(Math.max(params.timeoutMs ?? 3e5, 1e3), 9e5);
	const entry = loadWorkspaceSkillEntries(resolveUserPath(params.workspaceDir)).find((item) => item.skill.name === params.skillName);
	if (!entry) return {
		ok: false,
		message: `Skill not found: ${params.skillName}`,
		stdout: "",
		stderr: "",
		code: null
	};
	const spec = findInstallSpec(entry, params.installId);
	const warnings = await collectSkillInstallScanWarnings(entry);
	if (!spec) return withWarnings({
		ok: false,
		message: `Installer not found: ${params.installId}`,
		stdout: "",
		stderr: "",
		code: null
	}, warnings);
	if (spec.kind === "download") return withWarnings(await installDownloadSpec({
		entry,
		spec,
		timeoutMs
	}), warnings);
	const command = buildInstallCommand(spec, resolveSkillsInstallPreferences(params.config));
	if (command.error) return withWarnings({
		ok: false,
		message: command.error,
		stdout: "",
		stderr: "",
		code: null
	}, warnings);
	const brewExe = hasBinary("brew") ? "brew" : resolveBrewExecutable();
	if (spec.kind === "brew" && !brewExe) return withWarnings({
		ok: false,
		message: "brew not installed",
		stdout: "",
		stderr: "",
		code: null
	}, warnings);
	if (spec.kind === "uv" && !hasBinary("uv")) if (brewExe) {
		const brewResult = await runCommandWithTimeout([
			brewExe,
			"install",
			"uv"
		], { timeoutMs });
		if (brewResult.code !== 0) return withWarnings({
			ok: false,
			message: "Failed to install uv (brew)",
			stdout: brewResult.stdout.trim(),
			stderr: brewResult.stderr.trim(),
			code: brewResult.code
		}, warnings);
	} else return withWarnings({
		ok: false,
		message: "uv not installed (install via brew)",
		stdout: "",
		stderr: "",
		code: null
	}, warnings);
	if (!command.argv || command.argv.length === 0) return withWarnings({
		ok: false,
		message: "invalid install command",
		stdout: "",
		stderr: "",
		code: null
	}, warnings);
	if (spec.kind === "brew" && brewExe && command.argv[0] === "brew") command.argv[0] = brewExe;
	if (spec.kind === "go" && !hasBinary("go")) if (brewExe) {
		const brewResult = await runCommandWithTimeout([
			brewExe,
			"install",
			"go"
		], { timeoutMs });
		if (brewResult.code !== 0) return withWarnings({
			ok: false,
			message: "Failed to install go (brew)",
			stdout: brewResult.stdout.trim(),
			stderr: brewResult.stderr.trim(),
			code: brewResult.code
		}, warnings);
	} else return withWarnings({
		ok: false,
		message: "go not installed (install via brew)",
		stdout: "",
		stderr: "",
		code: null
	}, warnings);
	let env;
	if (spec.kind === "go" && brewExe) {
		const brewBin = await resolveBrewBinDir(timeoutMs, brewExe);
		if (brewBin) env = { GOBIN: brewBin };
	}
	const result = await (async () => {
		const argv = command.argv;
		if (!argv || argv.length === 0) return {
			code: null,
			stdout: "",
			stderr: "invalid install command"
		};
		try {
			return await runCommandWithTimeout(argv, {
				timeoutMs,
				env
			});
		} catch (err) {
			return {
				code: null,
				stdout: "",
				stderr: err instanceof Error ? err.message : String(err)
			};
		}
	})();
	const success = result.code === 0;
	return withWarnings({
		ok: success,
		message: success ? "Installed" : formatInstallFailureMessage(result),
		stdout: result.stdout.trim(),
		stderr: result.stderr.trim(),
		code: result.code
	}, warnings);
}

//#endregion
//#region src/commands/onboard-skills.ts
function summarizeInstallFailure(message) {
	const cleaned = message.replace(/^Install failed(?:\s*\([^)]*\))?\s*:?\s*/i, "").trim();
	if (!cleaned) return;
	const maxLen = 140;
	return cleaned.length > maxLen ? `${cleaned.slice(0, maxLen - 1)}…` : cleaned;
}
function formatSkillHint(skill) {
	const desc = skill.description?.trim();
	const installLabel = skill.install[0]?.label?.trim();
	const combined = desc && installLabel ? `${desc} — ${installLabel}` : desc || installLabel;
	if (!combined) return "install";
	const maxLen = 90;
	return combined.length > maxLen ? `${combined.slice(0, maxLen - 1)}…` : combined;
}
function upsertSkillEntry(cfg, skillKey, patch) {
	const entries = { ...cfg.skills?.entries };
	entries[skillKey] = {
		...entries[skillKey] ?? {},
		...patch
	};
	return {
		...cfg,
		skills: {
			...cfg.skills,
			entries
		}
	};
}
async function setupSkills(cfg, workspaceDir, runtime, prompter) {
	const report = buildWorkspaceSkillStatus(workspaceDir, { config: cfg });
	const eligible = report.skills.filter((s) => s.eligible);
	const unsupportedOs = report.skills.filter((s) => !s.disabled && !s.blockedByAllowlist && s.missing.os.length > 0);
	const missing = report.skills.filter((s) => !s.eligible && !s.disabled && !s.blockedByAllowlist && s.missing.os.length === 0);
	const blocked = report.skills.filter((s) => s.blockedByAllowlist);
	await prompter.note([
		`Eligible: ${eligible.length}`,
		`Missing requirements: ${missing.length}`,
		`Unsupported on this OS: ${unsupportedOs.length}`,
		`Blocked by allowlist: ${blocked.length}`
	].join("\n"), "Skills status");
	if (!await prompter.confirm({
		message: "Configure skills now? (recommended)",
		initialValue: true
	})) return cfg;
	const installable = missing.filter((skill) => skill.install.length > 0 && skill.missing.bins.length > 0);
	let next = cfg;
	if (installable.length > 0) {
		const selected = (await prompter.multiselect({
			message: "Install missing skill dependencies",
			options: [{
				value: "__skip__",
				label: "Skip for now",
				hint: "Continue without installing dependencies"
			}, ...installable.map((skill) => ({
				value: skill.name,
				label: `${skill.emoji ?? "🧩"} ${skill.name}`,
				hint: formatSkillHint(skill)
			}))]
		})).filter((name) => name !== "__skip__");
		const selectedSkills = selected.map((name) => installable.find((s) => s.name === name)).filter((item) => Boolean(item));
		if (process.platform !== "win32" && selectedSkills.some((skill) => skill.install.some((option) => option.kind === "brew")) && !await detectBinary("brew")) {
			await prompter.note(["Many skill dependencies are shipped via Homebrew.", "Without brew, you'll need to build from source or download releases manually."].join("\n"), "Homebrew recommended");
			if (await prompter.confirm({
				message: "Show Homebrew install command?",
				initialValue: true
			})) await prompter.note(["Run:", "/bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""].join("\n"), "Homebrew install");
		}
		if (selectedSkills.some((skill) => skill.install.some((option) => option.kind === "node"))) {
			const nodeManager = await prompter.select({
				message: "Preferred node manager for skill installs",
				options: resolveNodeManagerOptions()
			});
			next = {
				...next,
				skills: {
					...next.skills,
					install: {
						...next.skills?.install,
						nodeManager
					}
				}
			};
		}
		for (const name of selected) {
			const target = installable.find((s) => s.name === name);
			if (!target || target.install.length === 0) continue;
			const installId = target.install[0]?.id;
			if (!installId) continue;
			const spin = prompter.progress(`Installing ${name}…`);
			const result = await installSkill({
				workspaceDir,
				skillName: target.name,
				installId,
				config: next
			});
			const warnings = result.warnings ?? [];
			if (result.ok) {
				spin.stop(warnings.length > 0 ? `Installed ${name} (with warnings)` : `Installed ${name}`);
				for (const warning of warnings) runtime.log(warning);
				continue;
			}
			const code = result.code == null ? "" : ` (exit ${result.code})`;
			const detail = summarizeInstallFailure(result.message);
			spin.stop(`Install failed: ${name}${code}${detail ? ` — ${detail}` : ""}`);
			for (const warning of warnings) runtime.log(warning);
			if (result.stderr) runtime.log(result.stderr.trim());
			else if (result.stdout) runtime.log(result.stdout.trim());
			runtime.log(`Tip: run \`${formatCliCommand("openclaw doctor")}\` to review skills + requirements.`);
			runtime.log("Docs: https://docs.openclaw.ai/skills");
		}
	}
	for (const skill of missing) {
		if (!skill.primaryEnv || skill.missing.env.length === 0) continue;
		if (!await prompter.confirm({
			message: `Set ${skill.primaryEnv} for ${skill.name}?`,
			initialValue: false
		})) continue;
		const apiKey = String(await prompter.text({
			message: `Enter ${skill.primaryEnv}`,
			validate: (value) => value?.trim() ? void 0 : "Required"
		}));
		next = upsertSkillEntry(next, skill.skillKey, { apiKey: normalizeSecretInput(apiKey) });
	}
	return next;
}

//#endregion
export { applyCustomApiConfig as a, resolveCustomProviderId as c, applyPrimaryModel as d, promptDefaultModel as f, CustomApiError as i, applyModelAllowlist as l, discoverGatewayBeacons as m, installSkill as n, parseNonInteractiveCustomApiFlags as o, promptModelAllowlist as p, promptRemoteGatewayConfig as r, promptCustomApiConfig as s, setupSkills as t, applyModelFallbacksFromSelection as u };