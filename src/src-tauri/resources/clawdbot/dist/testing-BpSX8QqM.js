import { p as createNonExitingRuntime } from "./subsystem-CJEvHE2o.js";
import { t as isTruthyEnvValue } from "./env-CjUKd1aw.js";
import "./safe-text-BdDBLGQb.js";
import { v as setActivePluginRegistry } from "./runtime-DZz1f0_h.js";
import { f as resolveLoaderPackageRoot, o as findBundledPluginMetadataById } from "./chat-meta-Cdrnv7R-.js";
import { n as drainFileLockStateForTest } from "./file-lock-B6EjeH4S.js";
import "./file-lock-ki4S5WEB.js";
import { n as clearSessionStoreCacheForTest, r as drainSessionStoreLockQueuesForTest } from "./store-BGmy-Wot.js";
import { t as normalizeChatType } from "./chat-type-C7RL3WXY.js";
import { t as resolveConversationLabel } from "./conversation-label--6yrMX97.js";
import { a as loadBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-D_0VC8Qr.js";
import { r as drainSessionWriteLockStateForTest } from "./session-write-lock-BjZ5BFRg.js";
import "./call-CQ0eH9Ew.js";
import "./loader-BkOjign1.js";
import { Mn as toAcpRuntimeError } from "./pi-embedded-BYdcxQ5A.js";
import { a as createPinnedLookup, d as resolvePinnedHostnameWithPolicy, f as ssrf_exports, u as resolvePinnedHostname } from "./ssrf-BWlfjI7J.js";
import "./system-events-DOxYwk9w.js";
import { n as parseInlineDirectives } from "./directive-handling.parse-DPqc0r_v.js";
import "./directive-handling.defaults-DSynRLFa.js";
import { t as buildCommandContext } from "./commands-context-CycENDZL.js";
import { S as it, b as beforeEach, c as globalExpect, d as vi, g as afterEach } from "./dist-CmA5gUW3.js";
import { i as listBundledChannelPlugins } from "./registry-DfIHWCSq.js";
import "./provider-auth-choice.runtime-CLSkFXTi.js";
import { t as withFetchPreconnect } from "./fetch-mock-CFMoc-Jb.js";
import "./commands-acp-CkLai5TJ.js";
import "./commands-DRm1CIub.js";
import "./directive-handling.shared-BvIk7EW8.js";
import "./directive-handling.impl-Xcvwa480.js";
import "./directive-handling.fast-lane-Ax3hAVEe.js";
import "./directive-handling.persist-Dh0Y2S1D.js";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
resolveLoaderPackageRoot({
	modulePath: fileURLToPath(import.meta.url),
	moduleUrl: import.meta.url
}) ?? fileURLToPath(new URL("../..", import.meta.url));
function findBundledPluginMetadata(pluginId) {
	const metadata = findBundledPluginMetadataById(pluginId);
	if (!metadata) throw new Error(`Unknown bundled plugin id: ${pluginId}`);
	return metadata;
}
function loadBundledPluginPublicSurfaceSync(params) {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: findBundledPluginMetadata(params.pluginId).dirName,
		artifactBasename: params.artifactBasename
	});
}
function loadBundledPluginTestApiSync(pluginId) {
	return loadBundledPluginPublicSurfaceSync({
		pluginId,
		artifactBasename: "test-api.js"
	});
}
//#endregion
//#region test/channel-outbounds.ts
const { discordOutbound } = loadBundledPluginTestApiSync("discord");
const { imessageOutbound } = loadBundledPluginPublicSurfaceSync({
	pluginId: "imessage",
	artifactBasename: "src/outbound-adapter.js"
});
const { signalOutbound } = loadBundledPluginTestApiSync("signal");
const { slackOutbound } = loadBundledPluginTestApiSync("slack");
const { telegramOutbound } = loadBundledPluginPublicSurfaceSync({
	pluginId: "telegram",
	artifactBasename: "src/outbound-adapter.js"
});
const { whatsappOutbound } = loadBundledPluginTestApiSync("whatsapp");
//#endregion
//#region src/channels/sender-identity.ts
function validateSenderIdentity(ctx) {
	const issues = [];
	const isDirect = normalizeChatType(ctx.ChatType) === "direct";
	const senderId = ctx.SenderId?.trim() || "";
	const senderName = ctx.SenderName?.trim() || "";
	const senderUsername = ctx.SenderUsername?.trim() || "";
	const senderE164 = ctx.SenderE164?.trim() || "";
	if (!isDirect) {
		if (!senderId && !senderName && !senderUsername && !senderE164) issues.push("missing sender identity (SenderId/SenderName/SenderUsername/SenderE164)");
	}
	if (senderE164) {
		if (!/^\+\d{3,}$/.test(senderE164)) issues.push(`invalid SenderE164: ${senderE164}`);
	}
	if (senderUsername) {
		if (senderUsername.includes("@")) issues.push(`SenderUsername should not include "@": ${senderUsername}`);
		if (/\s/.test(senderUsername)) issues.push(`SenderUsername should not include whitespace: ${senderUsername}`);
	}
	if (ctx.SenderId != null && !senderId) issues.push("SenderId is set but empty");
	return issues;
}
createNonExitingRuntime();
function createSlackOutboundPayloadHarness(params) {
	const sendSlack = vi.fn();
	primeChannelOutboundSendMock(sendSlack, {
		messageId: "sl-1",
		channelId: "C12345",
		ts: "1234.5678"
	}, params.sendResults);
	const ctx = {
		cfg: {},
		to: "C12345",
		text: "",
		payload: params.payload,
		deps: { sendSlack }
	};
	return {
		run: async () => await slackOutbound.sendPayload(ctx),
		sendMock: sendSlack,
		to: ctx.to
	};
}
function primeChannelOutboundSendMock(sendMock, fallbackResult, sendResults = []) {
	sendMock.mockReset();
	if (sendResults.length === 0) {
		sendMock.mockResolvedValue(fallbackResult);
		return;
	}
	for (const result of sendResults) sendMock.mockResolvedValueOnce(result);
}
function expectChannelInboundContextContract(ctx) {
	globalExpect(validateSenderIdentity(ctx)).toEqual([]);
	globalExpect(ctx.Body).toBeTypeOf("string");
	globalExpect(ctx.BodyForAgent).toBeTypeOf("string");
	globalExpect(ctx.BodyForCommands).toBeTypeOf("string");
	const chatType = normalizeChatType(ctx.ChatType);
	if (chatType && chatType !== "direct") globalExpect(ctx.ConversationLabel?.trim() || resolveConversationLabel(ctx)).toBeTruthy();
}
//#endregion
//#region src/channels/plugins/contracts/inbound-testkit.ts
function createInboundContextCapture() {
	return { ctx: void 0 };
}
function buildDispatchInboundCaptureMock(actual, setCtx) {
	const dispatchInboundMessage = vi.fn(async (params) => {
		setCtx(params.ctx);
		return {
			queuedFinal: false,
			counts: {
				tool: 0,
				block: 0,
				final: 0
			}
		};
	});
	return {
		...actual,
		dispatchInboundMessage,
		dispatchInboundMessageWithDispatcher: dispatchInboundMessage,
		dispatchInboundMessageWithBufferedDispatcher: dispatchInboundMessage
	};
}
createInboundContextCapture();
//#endregion
//#region src/cli/test-runtime-capture.ts
function normalizeRuntimeStdout(value) {
	return value.endsWith("\n") ? value.slice(0, -1) : value;
}
function stringifyRuntimeJson(value, space = 2) {
	return JSON.stringify(value, null, space > 0 ? space : void 0);
}
function createCliRuntimeCapture() {
	const runtimeLogs = [];
	const runtimeErrors = [];
	const stringifyArgs = (args) => args.map((value) => String(value)).join(" ");
	const defaultRuntime = {
		log: vi.fn((...args) => {
			runtimeLogs.push(stringifyArgs(args));
		}),
		error: vi.fn((...args) => {
			runtimeErrors.push(stringifyArgs(args));
		}),
		writeStdout: vi.fn((value) => {
			defaultRuntime.log(normalizeRuntimeStdout(value));
		}),
		writeJson: vi.fn((value, space = 2) => {
			defaultRuntime.log(stringifyRuntimeJson(value, space));
		}),
		exit: vi.fn((code) => {
			throw new Error(`__exit__:${code}`);
		})
	};
	return {
		runtimeLogs,
		runtimeErrors,
		defaultRuntime,
		resetRuntimeCapture: () => {
			runtimeLogs.length = 0;
			runtimeErrors.length = 0;
		}
	};
}
function spyRuntimeLogs(runtime) {
	return vi.spyOn(runtime, "log").mockImplementation(() => {});
}
function spyRuntimeErrors(runtime) {
	return vi.spyOn(runtime, "error").mockImplementation(() => {});
}
function spyRuntimeJson(runtime) {
	return vi.spyOn(runtime, "writeJson").mockImplementation(() => {});
}
function firstWrittenJsonArg(writeJson) {
	return writeJson.mock.calls[0]?.[0] ?? null;
}
//#endregion
//#region src/test-utils/channel-plugins.ts
const createTestRegistry = (channels = []) => ({
	plugins: [],
	tools: [],
	hooks: [],
	typedHooks: [],
	channels,
	channelSetups: channels.map((entry) => ({
		pluginId: entry.pluginId,
		plugin: entry.plugin,
		source: entry.source,
		enabled: true
	})),
	providers: [],
	speechProviders: [],
	mediaUnderstandingProviders: [],
	imageGenerationProviders: [],
	webFetchProviders: [],
	webSearchProviders: [],
	gatewayHandlers: {},
	httpRoutes: [],
	cliRegistrars: [],
	services: [],
	commands: [],
	conversationBindingResolvedHandlers: [],
	diagnostics: []
});
//#endregion
//#region src/commands/channel-test-helpers.ts
const { googlechatPlugin } = loadBundledPluginTestApiSync("googlechat");
const { matrixPlugin, setMatrixRuntime } = loadBundledPluginTestApiSync("matrix");
const { msteamsPlugin } = loadBundledPluginTestApiSync("msteams");
const { nostrPlugin } = loadBundledPluginTestApiSync("nostr");
const { tlonPlugin } = loadBundledPluginTestApiSync("tlon");
const { whatsappPlugin } = loadBundledPluginTestApiSync("whatsapp");
function setDefaultChannelPluginRegistryForTests() {
	setMatrixRuntime({ state: { resolveStateDir: (_env, homeDir) => (homeDir ?? (() => "/tmp"))() } });
	setActivePluginRegistry(createTestRegistry([
		...listBundledChannelPlugins(),
		matrixPlugin,
		msteamsPlugin,
		nostrPlugin,
		tlonPlugin,
		googlechatPlugin,
		whatsappPlugin
	].map((plugin) => ({
		pluginId: plugin.id,
		plugin,
		source: "test"
	}))));
}
//#endregion
//#region src/media-understanding/audio.test-helpers.ts
function resolveRequestUrl(input) {
	if (typeof input === "string") return input;
	if (input instanceof URL) return input.toString();
	return input.url;
}
function installPinnedHostnameTestHooks() {
	const resolvePinnedHostname$1 = resolvePinnedHostname;
	const resolvePinnedHostnameWithPolicy$1 = resolvePinnedHostnameWithPolicy;
	const lookupMock = vi.fn();
	let resolvePinnedHostnameSpy = null;
	let resolvePinnedHostnameWithPolicySpy = null;
	beforeEach(() => {
		lookupMock.mockResolvedValue([{
			address: "93.184.216.34",
			family: 4
		}]);
		resolvePinnedHostnameSpy = vi.spyOn(ssrf_exports, "resolvePinnedHostname").mockImplementation((hostname) => resolvePinnedHostname$1(hostname, lookupMock));
		resolvePinnedHostnameWithPolicySpy = vi.spyOn(ssrf_exports, "resolvePinnedHostnameWithPolicy").mockImplementation((hostname, params) => resolvePinnedHostnameWithPolicy$1(hostname, {
			...params,
			lookupFn: lookupMock
		}));
	});
	afterEach(() => {
		lookupMock.mockReset();
		resolvePinnedHostnameSpy?.mockRestore();
		resolvePinnedHostnameWithPolicySpy?.mockRestore();
		resolvePinnedHostnameSpy = null;
		resolvePinnedHostnameWithPolicySpy = null;
	});
}
function createAuthCaptureJsonFetch(responseBody) {
	let seenAuth = null;
	return {
		fetchFn: withFetchPreconnect(async (_input, init) => {
			seenAuth = new Headers(init?.headers).get("authorization");
			return new Response(JSON.stringify(responseBody), {
				status: 200,
				headers: { "content-type": "application/json" }
			});
		}),
		getAuthHeader: () => seenAuth
	};
}
function createRequestCaptureJsonFetch(responseBody) {
	let seenUrl = null;
	let seenInit;
	return {
		fetchFn: withFetchPreconnect(async (input, init) => {
			seenUrl = resolveRequestUrl(input);
			seenInit = init;
			return new Response(JSON.stringify(responseBody), {
				status: 200,
				headers: { "content-type": "application/json" }
			});
		}),
		getRequest: () => ({
			url: seenUrl,
			init: seenInit
		})
	};
}
//#endregion
//#region src/agents/live-test-helpers.ts
function isLiveTestEnabled(extraEnvVars = [], env = process.env) {
	return [
		...extraEnvVars,
		"LIVE",
		"OPENCLAW_LIVE_TEST"
	].some((name) => isTruthyEnvValue(env[name]));
}
//#endregion
//#region src/agents/sandbox/test-fixtures.ts
function createSandboxTestContext(params) {
	const overrides = params?.overrides ?? {};
	const { docker: _unusedDockerOverrides, ...sandboxOverrides } = overrides;
	const docker = {
		image: "openclaw-sandbox:bookworm-slim",
		containerPrefix: "openclaw-sbx-",
		network: "none",
		user: "1000:1000",
		workdir: "/workspace",
		readOnlyRoot: false,
		tmpfs: [],
		capDrop: [],
		seccompProfile: "",
		apparmorProfile: "",
		setupCommand: "",
		binds: [],
		dns: [],
		extraHosts: [],
		pidsLimit: 0,
		...overrides.docker,
		...params?.dockerOverrides
	};
	return {
		enabled: true,
		backendId: "docker",
		sessionKey: "sandbox:test",
		workspaceDir: "/tmp/workspace",
		agentWorkspaceDir: "/tmp/workspace",
		workspaceAccess: "rw",
		runtimeId: "openclaw-sbx-test",
		runtimeLabel: "openclaw-sbx-test",
		containerName: "openclaw-sbx-test",
		containerWorkdir: "/workspace",
		tools: {
			allow: ["*"],
			deny: []
		},
		browserAllowHostControl: false,
		...sandboxOverrides,
		docker
	};
}
//#endregion
//#region src/agents/skills.e2e-test-helpers.ts
async function writeSkill(params) {
	const { dir, name, description, metadata, body, frontmatterExtra } = params;
	await fs.mkdir(dir, { recursive: true });
	const frontmatter = [
		`name: ${name}`,
		`description: ${description}`,
		metadata ? `metadata: ${metadata}` : "",
		frontmatterExtra ?? ""
	].filter((line) => line.trim().length > 0).join("\n");
	await fs.writeFile(path.join(dir, "SKILL.md"), `---\n${frontmatter}\n---

${body ?? `# ${name}\n`}
`, "utf-8");
}
//#endregion
//#region src/acp/runtime/adapter-contract.testkit.ts
async function runAcpRuntimeAdapterContract(params) {
	const runtime = await params.createRuntime();
	const sessionKey = `agent:${params.agentId ?? "codex"}:acp:contract-${randomUUID()}`;
	const agent = params.agentId ?? "codex";
	const handle = await runtime.ensureSession({
		sessionKey,
		agent,
		mode: "persistent"
	});
	globalExpect(handle.sessionKey).toBe(sessionKey);
	globalExpect(handle.backend.trim()).not.toHaveLength(0);
	globalExpect(handle.runtimeSessionName.trim()).not.toHaveLength(0);
	const successEvents = [];
	for await (const event of runtime.runTurn({
		handle,
		text: params.successPrompt ?? "contract-success",
		mode: "prompt",
		requestId: `contract-success-${randomUUID()}`
	})) successEvents.push(event);
	globalExpect(successEvents.some((event) => event.type === "done" || event.type === "text_delta" || event.type === "status" || event.type === "tool_call")).toBe(true);
	await params.assertSuccessEvents?.(successEvents);
	if (params.includeControlChecks ?? true) {
		if (runtime.getStatus) {
			const status = await runtime.getStatus({ handle });
			globalExpect(status).toBeDefined();
			globalExpect(typeof status).toBe("object");
		}
		if (runtime.setMode) await runtime.setMode({
			handle,
			mode: "contract"
		});
		if (runtime.setConfigOption) await runtime.setConfigOption({
			handle,
			key: "contract_key",
			value: "contract_value"
		});
	}
	let errorThrown = null;
	const errorEvents = [];
	const errorPrompt = params.errorPrompt?.trim();
	if (errorPrompt) {
		try {
			for await (const event of runtime.runTurn({
				handle,
				text: errorPrompt,
				mode: "prompt",
				requestId: `contract-error-${randomUUID()}`
			})) errorEvents.push(event);
		} catch (error) {
			errorThrown = error;
		}
		const sawErrorEvent = errorEvents.some((event) => event.type === "error");
		globalExpect(Boolean(errorThrown) || sawErrorEvent).toBe(true);
		if (errorThrown) {
			const acpError = toAcpRuntimeError({
				error: errorThrown,
				fallbackCode: "ACP_TURN_FAILED",
				fallbackMessage: "ACP runtime contract expected an error turn failure."
			});
			globalExpect(acpError.code.length).toBeGreaterThan(0);
			globalExpect(acpError.message.length).toBeGreaterThan(0);
		}
	}
	await params.assertErrorOutcome?.({
		events: errorEvents,
		thrown: errorThrown
	});
	await runtime.cancel({
		handle,
		reason: "contract-cancel"
	});
	await runtime.close({
		handle,
		reason: "contract-close"
	});
}
//#endregion
//#region src/auto-reply/reply/commands.test-harness.ts
function buildCommandTestParams$1(commandBody, cfg, ctxOverrides, options) {
	const ctx = {
		Body: commandBody,
		CommandBody: commandBody,
		CommandSource: "text",
		CommandAuthorized: true,
		Provider: "whatsapp",
		Surface: "whatsapp",
		...ctxOverrides
	};
	return {
		ctx,
		cfg,
		command: buildCommandContext({
			ctx,
			cfg,
			isGroup: false,
			triggerBodyNormalized: commandBody.trim(),
			commandAuthorized: true
		}),
		directives: parseInlineDirectives(commandBody),
		elevated: {
			enabled: true,
			allowed: true,
			failures: []
		},
		sessionKey: "agent:main:main",
		workspaceDir: options?.workspaceDir ?? "/tmp",
		defaultGroupActivation: () => "mention",
		resolvedVerboseLevel: "off",
		resolvedReasoningLevel: "off",
		resolveDefaultThinkingLevel: async () => void 0,
		provider: "whatsapp",
		model: "test-model",
		contextTokens: 0,
		isGroup: false
	};
}
//#endregion
//#region src/auto-reply/reply/commands-spawn.test-harness.ts
function buildCommandTestParams(commandBody, cfg, ctxOverrides) {
	return buildCommandTestParams$1(commandBody, cfg, ctxOverrides);
}
//#endregion
//#region src/test-helpers/http.ts
function jsonResponse(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" }
	});
}
function requestUrl(input) {
	if (typeof input === "string") return input;
	if (input instanceof URL) return input.toString();
	return input.url;
}
function requestBodyText(body) {
	return typeof body === "string" ? body : "{}";
}
//#endregion
//#region src/test-helpers/ssrf.ts
function mockPinnedHostnameResolution(addresses = ["93.184.216.34"]) {
	return vi.spyOn(ssrf_exports, "resolvePinnedHostname").mockImplementation(async (hostname) => {
		const normalized = hostname.trim().toLowerCase().replace(/\.$/, "");
		const pinnedAddresses = [...addresses];
		return {
			hostname: normalized,
			addresses: pinnedAddresses,
			lookup: createPinnedLookup({
				hostname: normalized,
				addresses: pinnedAddresses
			})
		};
	});
}
//#endregion
//#region src/test-helpers/whatsapp-outbound.ts
function createWhatsAppPollFixture() {
	return {
		cfg: { marker: "resolved-cfg" },
		poll: {
			question: "Lunch?",
			options: ["Pizza", "Sushi"],
			maxSelections: 1
		},
		to: "+1555",
		accountId: "work"
	};
}
function expectWhatsAppPollSent(sendPollWhatsApp, params) {
	globalExpect(sendPollWhatsApp).toHaveBeenCalledWith(params.to ?? "+1555", params.poll, {
		verbose: false,
		accountId: params.accountId ?? "work",
		cfg: params.cfg
	});
}
//#endregion
//#region src/test-utils/env.ts
function captureEnv(keys) {
	const snapshot = /* @__PURE__ */ new Map();
	for (const key of keys) snapshot.set(key, process.env[key]);
	return { restore() {
		for (const [key, value] of snapshot) if (value === void 0) delete process.env[key];
		else process.env[key] = value;
	} };
}
function applyEnvValues(env) {
	for (const [key, value] of Object.entries(env)) if (value === void 0) delete process.env[key];
	else process.env[key] = value;
}
function withEnv(env, fn) {
	const snapshot = captureEnv(Object.keys(env));
	try {
		applyEnvValues(env);
		return fn();
	} finally {
		snapshot.restore();
	}
}
async function withEnvAsync(env, fn) {
	const snapshot = captureEnv(Object.keys(env));
	try {
		applyEnvValues(env);
		return await fn();
	} finally {
		snapshot.restore();
	}
}
//#endregion
//#region src/test-utils/session-state-cleanup.ts
let fileLockDrainerForTests = null;
let sessionStoreLockQueueDrainerForTests = null;
let sessionWriteLockDrainerForTests = null;
async function cleanupSessionStateForTest() {
	await (sessionStoreLockQueueDrainerForTests ?? drainSessionStoreLockQueuesForTest)();
	clearSessionStoreCacheForTest();
	await (fileLockDrainerForTests ?? drainFileLockStateForTest)();
	await (sessionWriteLockDrainerForTests ?? drainSessionWriteLockStateForTest)();
}
//#endregion
//#region src/test-helpers/state-dir-env.ts
function snapshotStateDirEnv() {
	return captureEnv(["OPENCLAW_STATE_DIR"]);
}
function restoreStateDirEnv(snapshot) {
	snapshot.restore();
}
function setStateDirEnv(stateDir) {
	process.env.OPENCLAW_STATE_DIR = stateDir;
}
async function withStateDirEnv(prefix, fn) {
	const snapshot = snapshotStateDirEnv();
	const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
	const stateDir = path.join(tempRoot, "state");
	await fs.mkdir(stateDir, { recursive: true });
	setStateDirEnv(stateDir);
	try {
		return await fn({
			tempRoot,
			stateDir
		});
	} finally {
		await cleanupSessionStateForTest().catch(() => void 0);
		restoreStateDirEnv(snapshot);
		await fs.rm(tempRoot, {
			recursive: true,
			force: true
		});
	}
}
//#endregion
//#region src/plugin-sdk/testing.ts
/** Create a tiny Windows `.cmd` shim fixture for plugin tests that spawn CLIs. */
async function createWindowsCmdShimFixture(params) {
	await fs.mkdir(path.dirname(params.scriptPath), { recursive: true });
	await fs.mkdir(path.dirname(params.shimPath), { recursive: true });
	await fs.writeFile(params.scriptPath, "module.exports = {};\n", "utf8");
	await fs.writeFile(params.shimPath, `@echo off\r\n${params.shimLine}\r\n`, "utf8");
}
/** Install a shared test matrix for target-resolution error handling. */
function installCommonResolveTargetErrorCases(params) {
	const { resolveTarget, implicitAllowFrom } = params;
	it("should error on normalization failure with allowlist (implicit mode)", () => {
		const result = resolveTarget({
			to: "invalid-target",
			mode: "implicit",
			allowFrom: implicitAllowFrom
		});
		globalExpect(result.ok).toBe(false);
		globalExpect(result.error).toBeDefined();
	});
	it("should error when no target provided with allowlist", () => {
		const result = resolveTarget({
			to: void 0,
			mode: "implicit",
			allowFrom: implicitAllowFrom
		});
		globalExpect(result.ok).toBe(false);
		globalExpect(result.error).toBeDefined();
	});
	it("should error when no target and no allowlist", () => {
		const result = resolveTarget({
			to: void 0,
			mode: "explicit",
			allowFrom: []
		});
		globalExpect(result.ok).toBe(false);
		globalExpect(result.error).toBeDefined();
	});
	it("should handle whitespace-only target", () => {
		const result = resolveTarget({
			to: "   ",
			mode: "explicit",
			allowFrom: []
		});
		globalExpect(result.ok).toBe(false);
		globalExpect(result.error).toBeDefined();
	});
}
//#endregion
export { expectChannelInboundContextContract as A, createCliRuntimeCapture as C, spyRuntimeLogs as D, spyRuntimeJson as E, buildDispatchInboundCaptureMock as O, setDefaultChannelPluginRegistryForTests as S, spyRuntimeErrors as T, createSandboxTestContext as _, captureEnv as a, createRequestCaptureJsonFetch as b, createWhatsAppPollFixture as c, jsonResponse as d, requestBodyText as f, writeSkill as g, runAcpRuntimeAdapterContract as h, cleanupSessionStateForTest as i, primeChannelOutboundSendMock as j, createSlackOutboundPayloadHarness as k, expectWhatsAppPollSent as l, buildCommandTestParams as m, installCommonResolveTargetErrorCases as n, withEnv as o, requestUrl as p, withStateDirEnv as r, withEnvAsync as s, createWindowsCmdShimFixture as t, mockPinnedHostnameResolution as u, isLiveTestEnabled as v, firstWrittenJsonArg as w, installPinnedHostnameTestHooks as x, createAuthCaptureJsonFetch as y };
