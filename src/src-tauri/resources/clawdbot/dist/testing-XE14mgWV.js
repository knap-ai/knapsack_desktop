import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { t as resolveBundledPluginsDir } from "./bundled-dir-D4Wk35JT.js";
import { t as isTruthyEnvValue } from "./env-BiSxzotM.js";
import { f as setBundledChannelRuntime, n as getBundledChannelPlugin, s as listBundledChannelPluginIds } from "./bundled-CGMeVzvo.js";
import { n as normalizeBundledPluginArtifactSubpath } from "./public-surface-runtime-nilbjlrn.js";
import { t as findBundledPluginMetadataById } from "./bundled-plugin-metadata-Da-MNAHv.js";
import { l as resolveLoaderPackageRoot } from "./sdk-alias-w29OTN9p.js";
import "./safe-text-BfEU6V1V.js";
import "./loader-DYW2PvbF.js";
import { y as setActivePluginRegistry } from "./runtime-BB1a2aCy.js";
import { i as loadBundledPluginPublicSurfaceModuleSync } from "./facade-loader-CGu7k8Om.js";
import { t as normalizeChatType } from "./chat-type-DFnPOWna.js";
import { t as resolveConversationLabel } from "./conversation-label-Cio1HuOl.js";
import { g as ssrf_exports, h as resolvePinnedHostnameWithPolicy, m as resolvePinnedHostname } from "./ssrf-DoOclwFS.js";
import "./call-BA3do6C0.js";
import "./system-events-Dq_M0n12.js";
import { i as toAcpRuntimeError } from "./errors-DrSVrMCJ.js";
import "./manager-CECGVjs9.js";
import { t as buildCommandContext } from "./commands-context-v7HiTv6d.js";
import { t as parseInlineDirectives } from "./directive-handling.parse-DA7dFuNT.js";
import { a as it, i as beforeEach, n as vi, r as afterEach, t as globalExpect } from "./test.D1JkM1w4-Lo0MJB5A.js";
import "./provider-auth-choice.runtime-BKIxh1se.js";
import { n as cleanupSessionStateForTest, o as withFetchPreconnect, r as captureEnv } from "./temp-home-D_g8rf6m.js";
import "./commands-acp-C9Oxo62w.js";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import fs$1 from "node:fs/promises";
import { randomUUID } from "node:crypto";
//#region src/channels/sender-identity.ts
function validateSenderIdentity(ctx) {
	const issues = [];
	const isDirect = normalizeChatType(ctx.ChatType) === "direct";
	const senderId = normalizeOptionalString(ctx.SenderId) || "";
	const senderName = normalizeOptionalString(ctx.SenderName) || "";
	const senderUsername = normalizeOptionalString(ctx.SenderUsername) || "";
	const senderE164 = normalizeOptionalString(ctx.SenderE164) || "";
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
//#endregion
//#region src/channels/plugins/contracts/test-helpers.ts
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
	realtimeTranscriptionProviders: [],
	realtimeVoiceProviders: [],
	mediaUnderstandingProviders: [],
	imageGenerationProviders: [],
	videoGenerationProviders: [],
	musicGenerationProviders: [],
	webFetchProviders: [],
	webSearchProviders: [],
	memoryEmbeddingProviders: [],
	textTransforms: [],
	agentHarnesses: [],
	gatewayHandlers: {},
	gatewayMethodScopes: {},
	httpRoutes: [],
	cliRegistrars: [],
	reloads: [],
	nodeHostCommands: [],
	securityAuditCollectors: [],
	services: [],
	commands: [],
	conversationBindingResolvedHandlers: [],
	diagnostics: []
});
//#endregion
//#region src/commands/channel-test-registry.ts
function resolveChannelPluginsForTests(onlyPluginIds) {
	return (onlyPluginIds ?? listBundledChannelPluginIds()).flatMap((id) => {
		const plugin = getBundledChannelPlugin(id);
		return plugin ? [plugin] : [];
	});
}
function createChannelTestRuntime() {
	return { state: { resolveStateDir: (_env, homeDir) => (homeDir ?? (() => "/tmp"))() } };
}
function setChannelPluginRegistryForTests(onlyPluginIds) {
	const plugins = resolveChannelPluginsForTests(onlyPluginIds);
	const runtime = createChannelTestRuntime();
	for (const plugin of plugins) try {
		setBundledChannelRuntime(plugin.id, runtime);
	} catch {}
	setActivePluginRegistry(createTestRegistry(plugins.map((plugin) => ({
		pluginId: plugin.id,
		plugin,
		source: "test"
	}))));
}
function setDefaultChannelPluginRegistryForTests() {
	setChannelPluginRegistryForTests();
}
//#endregion
//#region src/media-understanding/audio.test-helpers.ts
function resolveRequestUrl(input) {
	if (typeof input === "string") return input;
	if (input instanceof URL) return input.toString();
	return input.url;
}
function installPinnedHostnameTestHooks() {
	const resolvePinnedHostname$2 = resolvePinnedHostname;
	const resolvePinnedHostnameWithPolicy$2 = resolvePinnedHostnameWithPolicy;
	const lookupMock = vi.fn();
	let resolvePinnedHostnameSpy = null;
	let resolvePinnedHostnameWithPolicySpy = null;
	beforeEach(() => {
		lookupMock.mockResolvedValue([{
			address: "93.184.216.34",
			family: 4
		}]);
		resolvePinnedHostnameSpy = vi.spyOn(ssrf_exports, "resolvePinnedHostname").mockImplementation((hostname) => resolvePinnedHostname$2(hostname, lookupMock));
		resolvePinnedHostnameWithPolicySpy = vi.spyOn(ssrf_exports, "resolvePinnedHostnameWithPolicy").mockImplementation((hostname, params) => resolvePinnedHostnameWithPolicy$2(hostname, {
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
	await fs$1.mkdir(dir, { recursive: true });
	const frontmatter = [
		`name: ${name}`,
		`description: ${description}`,
		metadata ? `metadata: ${metadata}` : "",
		frontmatterExtra ?? ""
	].filter((line) => line.trim().length > 0).join("\n");
	await fs$1.writeFile(path.join(dir, "SKILL.md"), `---\n${frontmatter}\n---

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
	const errorPrompt = normalizeOptionalString(params.errorPrompt);
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
	const resolvePinnedHostname$1 = resolvePinnedHostname;
	const resolvePinnedHostnameWithPolicy$1 = resolvePinnedHostnameWithPolicy;
	const lookupFn = (async (hostname, options) => {
		const normalized = normalizeLowercaseStringOrEmpty(hostname).replace(/\.$/, "");
		const resolved = addresses.map((address) => ({
			address,
			family: address.includes(":") ? 6 : 4,
			hostname: normalized
		}));
		return options?.all === true ? resolved : resolved[0];
	});
	const pinned = vi.spyOn(ssrf_exports, "resolvePinnedHostname").mockImplementation((hostname) => resolvePinnedHostname$1(hostname, lookupFn));
	const pinnedWithPolicy = vi.spyOn(ssrf_exports, "resolvePinnedHostnameWithPolicy").mockImplementation((hostname, params) => resolvePinnedHostnameWithPolicy$1(hostname, {
		...params,
		lookupFn
	}));
	return { mockRestore: () => {
		pinned.mockRestore();
		pinnedWithPolicy.mockRestore();
	} };
}
//#endregion
//#region src/test-helpers/windows-cmd-shim.ts
async function createWindowsCmdShimFixture(params) {
	await fs$1.mkdir(path.dirname(params.scriptPath), { recursive: true });
	await fs$1.mkdir(path.dirname(params.shimPath), { recursive: true });
	await fs$1.writeFile(params.scriptPath, "module.exports = {};\n", "utf8");
	await fs$1.writeFile(params.shimPath, `@echo off\r\n${params.shimLine}\r\n`, "utf8");
}
//#endregion
//#region src/test-helpers/resolve-target-error-cases.ts
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
	const tempRoot = await fs$1.mkdtemp(path.join(os.tmpdir(), prefix));
	const stateDir = path.join(tempRoot, "state");
	await fs$1.mkdir(stateDir, { recursive: true });
	setStateDirEnv(stateDir);
	try {
		return await fn({
			tempRoot,
			stateDir
		});
	} finally {
		await cleanupSessionStateForTest().catch(() => void 0);
		restoreStateDirEnv(snapshot);
		await fs$1.rm(tempRoot, {
			recursive: true,
			force: true
		});
	}
}
//#endregion
//#region src/test-utils/chunk-test-helpers.ts
function countLines(text) {
	return text.split("\n").length;
}
function hasBalancedFences(chunk) {
	let open = null;
	for (const line of chunk.split("\n")) {
		const match = line.match(/^( {0,3})(`{3,}|~{3,})(.*)$/);
		if (!match) continue;
		const marker = match[2];
		if (!open) {
			open = {
				markerChar: marker[0],
				markerLen: marker.length
			};
			continue;
		}
		if (open.markerChar === marker[0] && marker.length >= open.markerLen) open = null;
	}
	return open === null;
}
//#endregion
//#region src/test-utils/bundled-plugin-public-surface.ts
const OPENCLAW_PACKAGE_ROOT = resolveLoaderPackageRoot({
	modulePath: fileURLToPath(import.meta.url),
	moduleUrl: import.meta.url
}) ?? fileURLToPath(new URL("../..", import.meta.url));
function isSafeBundledPluginDirName(pluginId) {
	return /^[a-z0-9][a-z0-9._-]*$/u.test(pluginId);
}
function readPluginManifestId(pluginDir) {
	try {
		const manifestPath = path.join(pluginDir, "openclaw.plugin.json");
		const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
		return typeof parsed.id === "string" ? parsed.id : void 0;
	} catch {
		return;
	}
}
function findBundledPluginMetadataFast(pluginId) {
	if (!isSafeBundledPluginDirName(pluginId)) return;
	const roots = [
		resolveBundledPluginsDir(),
		path.resolve(OPENCLAW_PACKAGE_ROOT, "extensions"),
		path.resolve(OPENCLAW_PACKAGE_ROOT, "dist-runtime", "extensions"),
		path.resolve(OPENCLAW_PACKAGE_ROOT, "dist", "extensions")
	].filter((entry, index, values) => Boolean(entry) && values.indexOf(entry) === index);
	for (const root of roots) if (readPluginManifestId(path.join(root, pluginId)) === pluginId) return { dirName: pluginId };
}
function findBundledPluginMetadata(pluginId) {
	const metadata = findBundledPluginMetadataFast(pluginId) ?? findBundledPluginMetadataById(pluginId);
	if (!metadata) throw new Error(`Unknown bundled plugin id: ${pluginId}`);
	return metadata;
}
function loadBundledPluginPublicSurfaceSync(params) {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: findBundledPluginMetadata(params.pluginId).dirName,
		artifactBasename: normalizeBundledPluginArtifactSubpath(params.artifactBasename)
	});
}
function loadBundledPluginTestApiSync(pluginId) {
	return loadBundledPluginPublicSurfaceSync({
		pluginId,
		artifactBasename: "test-api.js"
	});
}
function resolveBundledPluginPublicModulePath(params) {
	const metadata = findBundledPluginMetadata(params.pluginId);
	return path.resolve(OPENCLAW_PACKAGE_ROOT, "extensions", metadata.dirName, normalizeBundledPluginArtifactSubpath(params.artifactBasename));
}
function resolveVitestSourceModulePath(targetPath) {
	if (!targetPath.endsWith(".js")) return targetPath;
	const sourcePath = `${targetPath.slice(0, -3)}.ts`;
	return pathExists(sourcePath) ? sourcePath : targetPath;
}
function pathExists(filePath) {
	try {
		return Boolean(filePath) && path.isAbsolute(filePath) && fs.statSync(filePath).isFile();
	} catch {
		return false;
	}
}
function resolveRelativeBundledPluginPublicModuleId(params) {
	const fromFilePath = fileURLToPath(params.fromModuleUrl);
	const targetPath = resolveVitestSourceModulePath(resolveBundledPluginPublicModulePath({
		pluginId: params.pluginId,
		artifactBasename: params.artifactBasename
	}));
	const relativePath = path.relative(path.dirname(fromFilePath), targetPath).replaceAll(path.sep, "/");
	return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
}
//#endregion
//#region src/test-utils/auth-token-assertions.ts
function expectGeneratedTokenPersistedToGatewayAuth(params) {
	globalExpect(params.generatedToken).toMatch(/^[0-9a-f]{48}$/);
	globalExpect(params.authToken).toBe(params.generatedToken);
	globalExpect(params.persistedConfig?.gateway?.auth?.mode).toBe("token");
	globalExpect(params.persistedConfig?.gateway?.auth?.token).toBe(params.generatedToken);
}
//#endregion
export { primeChannelOutboundSendMock as A, createCliRuntimeCapture as C, spyRuntimeLogs as D, spyRuntimeJson as E, buildDispatchInboundCaptureMock as O, setDefaultChannelPluginRegistryForTests as S, spyRuntimeErrors as T, createSandboxTestContext as _, countLines as a, createRequestCaptureJsonFetch as b, installCommonResolveTargetErrorCases as c, jsonResponse as d, requestBodyText as f, writeSkill as g, runAcpRuntimeAdapterContract as h, resolveRelativeBundledPluginPublicModuleId as i, expectChannelInboundContextContract as k, createWindowsCmdShimFixture as l, buildCommandTestParams as m, loadBundledPluginPublicSurfaceSync as n, hasBalancedFences as o, requestUrl as p, loadBundledPluginTestApiSync as r, withStateDirEnv as s, expectGeneratedTokenPersistedToGatewayAuth as t, mockPinnedHostnameResolution as u, isLiveTestEnabled as v, firstWrittenJsonArg as w, installPinnedHostnameTestHooks as x, createAuthCaptureJsonFetch as y };
