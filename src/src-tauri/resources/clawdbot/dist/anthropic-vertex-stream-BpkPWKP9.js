import { d as readStringValue, i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import { J as normalizeGoogleApiBaseUrl } from "./io-5pxHCi7V.js";
import { r as resolveProviderRequestCapabilities } from "./provider-attribution-BJhkfmfB.js";
import { L as resolveProviderTransportTurnStateWithPlugin, N as resolveProviderStreamFn } from "./provider-runtime-khVgWetm.js";
import { i as loadBundledPluginPublicSurfaceModuleSync } from "./facade-loader-CGu7k8Om.js";
import { s as detectOpenAICompletionsCompat } from "./provider-model-compat-Dsxuyzi4.js";
import { t as normalizeToolParameterSchema } from "./pi-tools.schema-D43D41q6.js";
import { d as resolveDebugProxySettings } from "./runtime-CdS7ehWO.js";
import { n as resolveOpenAIResponsesPayloadPolicy, r as flattenCompletionMessagesToStringContent, t as applyOpenAIResponsesPayloadPolicy } from "./openai-responses-payload-policy-D48wiGIs.js";
import { a as mergeModelProviderRequestOverrides, c as resolveProviderRequestPolicyConfig, i as getModelProviderRequestTransport, n as buildProviderRequestDispatcherPolicy } from "./provider-request-config-S_W3yUlE.js";
import { i as stripSystemPromptCacheBoundary } from "./system-prompt-cache-boundary-NUMoTji1.js";
import { n as applyAnthropicPayloadPolicyToParams, r as resolveAnthropicPayloadPolicy } from "./anthropic-payload-policy-DKgsteMF.js";
import { r as hasCopilotVisionInput, t as buildCopilotDynamicHeaders } from "./copilot-dynamic-headers-CYppRNbP.js";
import { n as fetchWithSsrFGuard } from "./fetch-guard-B3p4gGaY.js";
import { t as parseGeminiAuth } from "./gemini-auth-CalhrTDk.js";
import { randomUUID } from "node:crypto";
import { calculateCost, createAssistantMessageEventStream, getApiProvider, getEnvApiKey, parseStreamingJson, registerApiProvider, streamAnthropic } from "@mariozechner/pi-ai";
import { convertMessages } from "@mariozechner/pi-ai/openai-completions";
import OpenAI, { AzureOpenAI } from "openai";
import { AnthropicVertex } from "@anthropic-ai/vertex-sdk";
//#region src/agents/openai-tool-schema.ts
const optionalString = readStringValue;
function normalizeStrictOpenAIJsonSchema(schema) {
	return normalizeStrictOpenAIJsonSchemaRecursive(normalizeToolParameterSchema(schema ?? {}));
}
function normalizeStrictOpenAIJsonSchemaRecursive(schema) {
	if (Array.isArray(schema)) {
		let changed = false;
		const normalized = schema.map((entry) => {
			const next = normalizeStrictOpenAIJsonSchemaRecursive(entry);
			changed ||= next !== entry;
			return next;
		});
		return changed ? normalized : schema;
	}
	if (!schema || typeof schema !== "object") return schema;
	const record = schema;
	let changed = false;
	const normalized = {};
	for (const [key, value] of Object.entries(record)) {
		const next = normalizeStrictOpenAIJsonSchemaRecursive(value);
		normalized[key] = next;
		changed ||= next !== value;
	}
	if (normalized.type === "object") {
		const properties = normalized.properties && typeof normalized.properties === "object" && !Array.isArray(normalized.properties) ? normalized.properties : void 0;
		if (properties && Object.keys(properties).length === 0 && !Array.isArray(normalized.required)) {
			normalized.required = [];
			changed = true;
		}
	}
	return changed ? normalized : schema;
}
function normalizeOpenAIStrictToolParameters(schema, strict) {
	if (!strict) return normalizeToolParameterSchema(schema ?? {});
	return normalizeStrictOpenAIJsonSchema(schema);
}
function isStrictOpenAIJsonSchemaCompatible(schema) {
	return isStrictOpenAIJsonSchemaCompatibleRecursive(normalizeStrictOpenAIJsonSchema(schema));
}
function isStrictOpenAIJsonSchemaCompatibleRecursive(schema) {
	if (Array.isArray(schema)) return schema.every((entry) => isStrictOpenAIJsonSchemaCompatibleRecursive(entry));
	if (!schema || typeof schema !== "object") return true;
	const record = schema;
	if ("anyOf" in record || "oneOf" in record || "allOf" in record) return false;
	if (Array.isArray(record.type)) return false;
	if (record.type === "object" && record.additionalProperties !== false) return false;
	if (record.type === "object") {
		const properties = record.properties && typeof record.properties === "object" && !Array.isArray(record.properties) ? record.properties : {};
		const required = Array.isArray(record.required) ? record.required.filter((entry) => typeof entry === "string") : void 0;
		if (!required) return false;
		const requiredSet = new Set(required);
		if (Object.keys(properties).some((key) => !requiredSet.has(key))) return false;
	}
	return Object.entries(record).every(([key, entry]) => {
		if (key === "properties" && entry && typeof entry === "object" && !Array.isArray(entry)) return Object.values(entry).every((value) => isStrictOpenAIJsonSchemaCompatibleRecursive(value));
		return isStrictOpenAIJsonSchemaCompatibleRecursive(entry);
	});
}
function resolveOpenAIStrictToolFlagForInventory(tools, strict) {
	if (strict !== true) return strict === false ? false : void 0;
	return tools.every((tool) => isStrictOpenAIJsonSchemaCompatible(tool.parameters));
}
function resolvesToNativeOpenAIStrictTools(model, transport) {
	const capabilities = resolveProviderRequestCapabilities({
		provider: optionalString(model.provider),
		api: optionalString(model.api),
		baseUrl: optionalString(model.baseUrl),
		capability: "llm",
		transport,
		modelId: optionalString(model.id),
		compat: model.compat && typeof model.compat === "object" ? model.compat : void 0
	});
	if (!capabilities.usesKnownNativeOpenAIRoute) return false;
	return capabilities.provider === "openai" || capabilities.provider === "openai-codex" || capabilities.provider === "azure-openai" || capabilities.provider === "azure-openai-responses";
}
function resolveOpenAIStrictToolSetting(model, options) {
	if (resolvesToNativeOpenAIStrictTools(model, options?.transport ?? "stream")) return true;
	if (options?.supportsStrictMode) return false;
}
//#endregion
//#region src/agents/openai-reasoning-compat.ts
const OPENAI_MEDIUM_ONLY_REASONING_MODEL_IDS = new Set(["gpt-5.1-codex-mini", "gpt-5.4-mini"]);
function readCompatReasoningEffortMap(compat) {
	if (!compat || typeof compat !== "object") return {};
	const rawMap = compat.reasoningEffortMap;
	if (!rawMap || typeof rawMap !== "object") return {};
	return Object.fromEntries(Object.entries(rawMap).filter((entry) => typeof entry[0] === "string" && typeof entry[1] === "string"));
}
function resolveOpenAIReasoningEffortMap(model, fallbackMap = {}) {
	const provider = normalizeLowercaseStringOrEmpty(model.provider ?? "");
	const id = normalizeLowercaseStringOrEmpty(model.id ?? "");
	const builtinMap = (provider === "openai" || provider === "openai-codex") && OPENAI_MEDIUM_ONLY_REASONING_MODEL_IDS.has(id) ? {
		minimal: "medium",
		low: "medium"
	} : {};
	return {
		...fallbackMap,
		...builtinMap,
		...readCompatReasoningEffortMap(model.compat)
	};
}
function mapOpenAIReasoningEffortForModel(params) {
	const { effort } = params;
	if (effort === void 0 || effort === "none") return effort;
	return resolveOpenAIReasoningEffortMap(params.model, params.fallbackMap)[effort] ?? effort;
}
//#endregion
//#region src/agents/openai-reasoning-effort.ts
function normalizeOpenAIReasoningEffort(effort) {
	return effort === "minimal" ? "low" : effort;
}
//#endregion
//#region node_modules/@anthropic-ai/sdk/internal/tslib.mjs
function __classPrivateFieldSet(receiver, state, value, kind, f) {
	if (kind === "m") throw new TypeError("Private method is not writable");
	if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
	if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
	return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
function __classPrivateFieldGet(receiver, state, kind, f) {
	if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
	if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
	return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
//#endregion
//#region node_modules/@anthropic-ai/sdk/internal/utils/uuid.mjs
/**
* https://stackoverflow.com/a/2117523
*/
let uuid4 = function() {
	const { crypto } = globalThis;
	if (crypto?.randomUUID) {
		uuid4 = crypto.randomUUID.bind(crypto);
		return crypto.randomUUID();
	}
	const u8 = new Uint8Array(1);
	const randomByte = crypto ? () => crypto.getRandomValues(u8)[0] : () => Math.random() * 255 & 255;
	return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (+c ^ randomByte() & 15 >> +c / 4).toString(16));
};
//#endregion
//#region node_modules/@anthropic-ai/sdk/internal/errors.mjs
function isAbortError(err) {
	return typeof err === "object" && err !== null && ("name" in err && err.name === "AbortError" || "message" in err && String(err.message).includes("FetchRequestCanceledException"));
}
const castToError = (err) => {
	if (err instanceof Error) return err;
	if (typeof err === "object" && err !== null) {
		try {
			if (Object.prototype.toString.call(err) === "[object Error]") {
				const error = new Error(err.message, err.cause ? { cause: err.cause } : {});
				if (err.stack) error.stack = err.stack;
				if (err.cause && !error.cause) error.cause = err.cause;
				if (err.name) error.name = err.name;
				return error;
			}
		} catch {}
		try {
			return new Error(JSON.stringify(err));
		} catch {}
	}
	return new Error(err);
};
//#endregion
//#region node_modules/@anthropic-ai/sdk/core/error.mjs
var AnthropicError = class extends Error {};
var APIError = class APIError extends AnthropicError {
	constructor(status, error, message, headers, type) {
		super(`${APIError.makeMessage(status, error, message)}`);
		this.status = status;
		this.headers = headers;
		this.requestID = headers?.get("request-id");
		this.error = error;
		this.type = type ?? null;
	}
	static makeMessage(status, error, message) {
		const msg = error?.message ? typeof error.message === "string" ? error.message : JSON.stringify(error.message) : error ? JSON.stringify(error) : message;
		if (status && msg) return `${status} ${msg}`;
		if (status) return `${status} status code (no body)`;
		if (msg) return msg;
		return "(no status code or body)";
	}
	static generate(status, errorResponse, message, headers) {
		if (!status || !headers) return new APIConnectionError({
			message,
			cause: castToError(errorResponse)
		});
		const error = errorResponse;
		const type = error?.["error"]?.["type"];
		if (status === 400) return new BadRequestError(status, error, message, headers, type);
		if (status === 401) return new AuthenticationError(status, error, message, headers, type);
		if (status === 403) return new PermissionDeniedError(status, error, message, headers, type);
		if (status === 404) return new NotFoundError(status, error, message, headers, type);
		if (status === 409) return new ConflictError(status, error, message, headers, type);
		if (status === 422) return new UnprocessableEntityError(status, error, message, headers, type);
		if (status === 429) return new RateLimitError(status, error, message, headers, type);
		if (status >= 500) return new InternalServerError(status, error, message, headers, type);
		return new APIError(status, error, message, headers, type);
	}
};
var APIUserAbortError = class extends APIError {
	constructor({ message } = {}) {
		super(void 0, void 0, message || "Request was aborted.", void 0);
	}
};
var APIConnectionError = class extends APIError {
	constructor({ message, cause }) {
		super(void 0, void 0, message || "Connection error.", void 0);
		if (cause) this.cause = cause;
	}
};
var APIConnectionTimeoutError = class extends APIConnectionError {
	constructor({ message } = {}) {
		super({ message: message ?? "Request timed out." });
	}
};
var BadRequestError = class extends APIError {};
var AuthenticationError = class extends APIError {};
var PermissionDeniedError = class extends APIError {};
var NotFoundError = class extends APIError {};
var ConflictError = class extends APIError {};
var UnprocessableEntityError = class extends APIError {};
var RateLimitError = class extends APIError {};
var InternalServerError = class extends APIError {};
//#endregion
//#region node_modules/@anthropic-ai/sdk/internal/utils/values.mjs
const startsWithSchemeRegexp = /^[a-z][a-z0-9+.-]*:/i;
const isAbsoluteURL = (url) => {
	return startsWithSchemeRegexp.test(url);
};
let isArray = (val) => (isArray = Array.isArray, isArray(val));
let isReadonlyArray = isArray;
/** Returns an object if the given value isn't an object, otherwise returns as-is */
function maybeObj(x) {
	if (typeof x !== "object") return {};
	return x ?? {};
}
function isEmptyObj(obj) {
	if (!obj) return true;
	for (const _k in obj) return false;
	return true;
}
function hasOwn(obj, key) {
	return Object.prototype.hasOwnProperty.call(obj, key);
}
const validatePositiveInteger = (name, n) => {
	if (typeof n !== "number" || !Number.isInteger(n)) throw new AnthropicError(`${name} must be an integer`);
	if (n < 0) throw new AnthropicError(`${name} must be a positive integer`);
	return n;
};
const safeJSON = (text) => {
	try {
		return JSON.parse(text);
	} catch (err) {
		return;
	}
};
//#endregion
//#region node_modules/@anthropic-ai/sdk/internal/utils/sleep.mjs
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
//#endregion
//#region node_modules/@anthropic-ai/sdk/version.mjs
const VERSION = "0.81.0";
//#endregion
//#region node_modules/@anthropic-ai/sdk/internal/detect-platform.mjs
const isRunningInBrowser = () => {
	return typeof window !== "undefined" && typeof window.document !== "undefined" && typeof navigator !== "undefined";
};
/**
* Note this does not detect 'browser'; for that, use getBrowserInfo().
*/
function getDetectedPlatform() {
	if (typeof Deno !== "undefined" && Deno.build != null) return "deno";
	if (typeof EdgeRuntime !== "undefined") return "edge";
	if (Object.prototype.toString.call(typeof globalThis.process !== "undefined" ? globalThis.process : 0) === "[object process]") return "node";
	return "unknown";
}
const getPlatformProperties = () => {
	const detectedPlatform = getDetectedPlatform();
	if (detectedPlatform === "deno") return {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": VERSION,
		"X-Stainless-OS": normalizePlatform(Deno.build.os),
		"X-Stainless-Arch": normalizeArch(Deno.build.arch),
		"X-Stainless-Runtime": "deno",
		"X-Stainless-Runtime-Version": typeof Deno.version === "string" ? Deno.version : Deno.version?.deno ?? "unknown"
	};
	if (typeof EdgeRuntime !== "undefined") return {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": VERSION,
		"X-Stainless-OS": "Unknown",
		"X-Stainless-Arch": `other:${EdgeRuntime}`,
		"X-Stainless-Runtime": "edge",
		"X-Stainless-Runtime-Version": globalThis.process.version
	};
	if (detectedPlatform === "node") return {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": VERSION,
		"X-Stainless-OS": normalizePlatform(globalThis.process.platform ?? "unknown"),
		"X-Stainless-Arch": normalizeArch(globalThis.process.arch ?? "unknown"),
		"X-Stainless-Runtime": "node",
		"X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
	};
	const browserInfo = getBrowserInfo();
	if (browserInfo) return {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": VERSION,
		"X-Stainless-OS": "Unknown",
		"X-Stainless-Arch": "unknown",
		"X-Stainless-Runtime": `browser:${browserInfo.browser}`,
		"X-Stainless-Runtime-Version": browserInfo.version
	};
	return {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": VERSION,
		"X-Stainless-OS": "Unknown",
		"X-Stainless-Arch": "unknown",
		"X-Stainless-Runtime": "unknown",
		"X-Stainless-Runtime-Version": "unknown"
	};
};
function getBrowserInfo() {
	if (typeof navigator === "undefined" || !navigator) return null;
	for (const { key, pattern } of [
		{
			key: "edge",
			pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
		},
		{
			key: "ie",
			pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
		},
		{
			key: "ie",
			pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/
		},
		{
			key: "chrome",
			pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
		},
		{
			key: "firefox",
			pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
		},
		{
			key: "safari",
			pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/
		}
	]) {
		const match = pattern.exec(navigator.userAgent);
		if (match) return {
			browser: key,
			version: `${match[1] || 0}.${match[2] || 0}.${match[3] || 0}`
		};
	}
	return null;
}
const normalizeArch = (arch) => {
	if (arch === "x32") return "x32";
	if (arch === "x86_64" || arch === "x64") return "x64";
	if (arch === "arm") return "arm";
	if (arch === "aarch64" || arch === "arm64") return "arm64";
	if (arch) return `other:${arch}`;
	return "unknown";
};
const normalizePlatform = (platform) => {
	platform = platform.toLowerCase();
	if (platform.includes("ios")) return "iOS";
	if (platform === "android") return "Android";
	if (platform === "darwin") return "MacOS";
	if (platform === "win32") return "Windows";
	if (platform === "freebsd") return "FreeBSD";
	if (platform === "openbsd") return "OpenBSD";
	if (platform === "linux") return "Linux";
	if (platform) return `Other:${platform}`;
	return "Unknown";
};
let _platformHeaders;
const getPlatformHeaders = () => {
	return _platformHeaders ?? (_platformHeaders = getPlatformProperties());
};
//#endregion
//#region node_modules/@anthropic-ai/sdk/internal/shims.mjs
function getDefaultFetch() {
	if (typeof fetch !== "undefined") return fetch;
	throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function makeReadableStream(...args) {
	const ReadableStream = globalThis.ReadableStream;
	if (typeof ReadableStream === "undefined") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
	return new ReadableStream(...args);
}
function ReadableStreamFrom(iterable) {
	let iter = Symbol.asyncIterator in iterable ? iterable[Symbol.asyncIterator]() : iterable[Symbol.iterator]();
	return makeReadableStream({
		start() {},
		async pull(controller) {
			const { done, value } = await iter.next();
			if (done) controller.close();
			else controller.enqueue(value);
		},
		async cancel() {
			await iter.return?.();
		}
	});
}
/**
* Most browsers don't yet have async iterable support for ReadableStream,
* and Node has a very different way of reading bytes from its "ReadableStream".
*
* This polyfill was pulled from https://github.com/MattiasBuelens/web-streams-polyfill/pull/122#issuecomment-1627354490
*/
function ReadableStreamToAsyncIterable(stream) {
	if (stream[Symbol.asyncIterator]) return stream;
	const reader = stream.getReader();
	return {
		async next() {
			try {
				const result = await reader.read();
				if (result?.done) reader.releaseLock();
				return result;
			} catch (e) {
				reader.releaseLock();
				throw e;
			}
		},
		async return() {
			const cancelPromise = reader.cancel();
			reader.releaseLock();
			await cancelPromise;
			return {
				done: true,
				value: void 0
			};
		},
		[Symbol.asyncIterator]() {
			return this;
		}
	};
}
/**
* Cancels a ReadableStream we don't need to consume.
* See https://undici.nodejs.org/#/?id=garbage-collection
*/
async function CancelReadableStream(stream) {
	if (stream === null || typeof stream !== "object") return;
	if (stream[Symbol.asyncIterator]) {
		await stream[Symbol.asyncIterator]().return?.();
		return;
	}
	const reader = stream.getReader();
	const cancelPromise = reader.cancel();
	reader.releaseLock();
	await cancelPromise;
}
//#endregion
//#region node_modules/@anthropic-ai/sdk/internal/request-options.mjs
const FallbackEncoder = ({ headers, body }) => {
	return {
		bodyHeaders: { "content-type": "application/json" },
		body: JSON.stringify(body)
	};
};
//#endregion
//#region node_modules/@anthropic-ai/sdk/internal/utils/query.mjs
/**
* Basic re-implementation of `qs.stringify` for primitive types.
*/
function stringifyQuery(query) {
	return Object.entries(query).filter(([_, value]) => typeof value !== "undefined").map(([key, value]) => {
		if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
		if (value === null) return `${encodeURIComponent(key)}=`;
		throw new AnthropicError(`Cannot stringify type ${typeof value}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
	}).join("&");
}
//#endregion
//#region node_modules/@anthropic-ai/sdk/internal/utils/bytes.mjs
function concatBytes(buffers) {
	let length = 0;
	for (const buffer of buffers) length += buffer.length;
	const output = new Uint8Array(length);
	let index = 0;
	for (const buffer of buffers) {
		output.set(buffer, index);
		index += buffer.length;
	}
	return output;
}
let encodeUTF8_;
function encodeUTF8(str) {
	let encoder;
	return (encodeUTF8_ ?? (encoder = new globalThis.TextEncoder(), encodeUTF8_ = encoder.encode.bind(encoder)))(str);
}
let decodeUTF8_;
function decodeUTF8(bytes) {
	let decoder;
	return (decodeUTF8_ ?? (decoder = new globalThis.TextDecoder(), decodeUTF8_ = decoder.decode.bind(decoder)))(bytes);
}
//#endregion
//#region node_modules/@anthropic-ai/sdk/internal/decoders/line.mjs
var _LineDecoder_buffer, _LineDecoder_carriageReturnIndex;
/**
* A re-implementation of httpx's `LineDecoder` in Python that handles incrementally
* reading lines from text.
*
* https://github.com/encode/httpx/blob/920333ea98118e9cf617f246905d7b202510941c/httpx/_decoders.py#L258
*/
var LineDecoder = class {
	constructor() {
		_LineDecoder_buffer.set(this, void 0);
		_LineDecoder_carriageReturnIndex.set(this, void 0);
		__classPrivateFieldSet(this, _LineDecoder_buffer, new Uint8Array(), "f");
		__classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
	}
	decode(chunk) {
		if (chunk == null) return [];
		const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === "string" ? encodeUTF8(chunk) : chunk;
		__classPrivateFieldSet(this, _LineDecoder_buffer, concatBytes([__classPrivateFieldGet(this, _LineDecoder_buffer, "f"), binaryChunk]), "f");
		const lines = [];
		let patternIndex;
		while ((patternIndex = findNewlineIndex(__classPrivateFieldGet(this, _LineDecoder_buffer, "f"), __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f"))) != null) {
			if (patternIndex.carriage && __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") == null) {
				__classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, patternIndex.index, "f");
				continue;
			}
			if (__classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") != null && (patternIndex.index !== __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") + 1 || patternIndex.carriage)) {
				lines.push(decodeUTF8(__classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(0, __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") - 1)));
				__classPrivateFieldSet(this, _LineDecoder_buffer, __classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(__classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f")), "f");
				__classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
				continue;
			}
			const endIndex = __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") !== null ? patternIndex.preceding - 1 : patternIndex.preceding;
			const line = decodeUTF8(__classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(0, endIndex));
			lines.push(line);
			__classPrivateFieldSet(this, _LineDecoder_buffer, __classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(patternIndex.index), "f");
			__classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
		}
		return lines;
	}
	flush() {
		if (!__classPrivateFieldGet(this, _LineDecoder_buffer, "f").length) return [];
		return this.decode("\n");
	}
};
_LineDecoder_buffer = /* @__PURE__ */ new WeakMap(), _LineDecoder_carriageReturnIndex = /* @__PURE__ */ new WeakMap();
LineDecoder.NEWLINE_CHARS = new Set(["\n", "\r"]);
LineDecoder.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
/**
* This function searches the buffer for the end patterns, (\r or \n)
* and returns an object with the index preceding the matched newline and the
* index after the newline char. `null` is returned if no new line is found.
*
* ```ts
* findNewLineIndex('abc\ndef') -> { preceding: 2, index: 3 }
* ```
*/
function findNewlineIndex(buffer, startIndex) {
	const newline = 10;
	const carriage = 13;
	for (let i = startIndex ?? 0; i < buffer.length; i++) {
		if (buffer[i] === newline) return {
			preceding: i,
			index: i + 1,
			carriage: false
		};
		if (buffer[i] === carriage) return {
			preceding: i,
			index: i + 1,
			carriage: true
		};
	}
	return null;
}
function findDoubleNewlineIndex(buffer) {
	const newline = 10;
	const carriage = 13;
	for (let i = 0; i < buffer.length - 1; i++) {
		if (buffer[i] === newline && buffer[i + 1] === newline) return i + 2;
		if (buffer[i] === carriage && buffer[i + 1] === carriage) return i + 2;
		if (buffer[i] === carriage && buffer[i + 1] === newline && i + 3 < buffer.length && buffer[i + 2] === carriage && buffer[i + 3] === newline) return i + 4;
	}
	return -1;
}
//#endregion
//#region node_modules/@anthropic-ai/sdk/internal/utils/log.mjs
const levelNumbers = {
	off: 0,
	error: 200,
	warn: 300,
	info: 400,
	debug: 500
};
const parseLogLevel = (maybeLevel, sourceName, client) => {
	if (!maybeLevel) return;
	if (hasOwn(levelNumbers, maybeLevel)) return maybeLevel;
	loggerFor(client).warn(`${sourceName} was set to ${JSON.stringify(maybeLevel)}, expected one of ${JSON.stringify(Object.keys(levelNumbers))}`);
};
function noop() {}
function makeLogFn(fnLevel, logger, logLevel) {
	if (!logger || levelNumbers[fnLevel] > levelNumbers[logLevel]) return noop;
	else return logger[fnLevel].bind(logger);
}
const noopLogger = {
	error: noop,
	warn: noop,
	info: noop,
	debug: noop
};
let cachedLoggers = /* @__PURE__ */ new WeakMap();
function loggerFor(client) {
	const logger = client.logger;
	const logLevel = client.logLevel ?? "off";
	if (!logger) return noopLogger;
	const cachedLogger = cachedLoggers.get(logger);
	if (cachedLogger && cachedLogger[0] === logLevel) return cachedLogger[1];
	const levelLogger = {
		error: makeLogFn("error", logger, logLevel),
		warn: makeLogFn("warn", logger, logLevel),
		info: makeLogFn("info", logger, logLevel),
		debug: makeLogFn("debug", logger, logLevel)
	};
	cachedLoggers.set(logger, [logLevel, levelLogger]);
	return levelLogger;
}
const formatRequestDetails = (details) => {
	if (details.options) {
		details.options = { ...details.options };
		delete details.options["headers"];
	}
	if (details.headers) details.headers = Object.fromEntries((details.headers instanceof Headers ? [...details.headers] : Object.entries(details.headers)).map(([name, value]) => [name, name.toLowerCase() === "x-api-key" || name.toLowerCase() === "authorization" || name.toLowerCase() === "cookie" || name.toLowerCase() === "set-cookie" ? "***" : value]));
	if ("retryOfRequestLogID" in details) {
		if (details.retryOfRequestLogID) details.retryOf = details.retryOfRequestLogID;
		delete details.retryOfRequestLogID;
	}
	return details;
};
//#endregion
//#region node_modules/@anthropic-ai/sdk/core/streaming.mjs
var _Stream_client;
var Stream = class Stream {
	constructor(iterator, controller, client) {
		this.iterator = iterator;
		_Stream_client.set(this, void 0);
		this.controller = controller;
		__classPrivateFieldSet(this, _Stream_client, client, "f");
	}
	static fromSSEResponse(response, controller, client) {
		let consumed = false;
		const logger = client ? loggerFor(client) : console;
		async function* iterator() {
			if (consumed) throw new AnthropicError("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
			consumed = true;
			let done = false;
			try {
				for await (const sse of _iterSSEMessages(response, controller)) {
					if (sse.event === "completion") try {
						yield JSON.parse(sse.data);
					} catch (e) {
						logger.error(`Could not parse message into JSON:`, sse.data);
						logger.error(`From chunk:`, sse.raw);
						throw e;
					}
					if (sse.event === "message_start" || sse.event === "message_delta" || sse.event === "message_stop" || sse.event === "content_block_start" || sse.event === "content_block_delta" || sse.event === "content_block_stop") try {
						yield JSON.parse(sse.data);
					} catch (e) {
						logger.error(`Could not parse message into JSON:`, sse.data);
						logger.error(`From chunk:`, sse.raw);
						throw e;
					}
					if (sse.event === "ping") continue;
					if (sse.event === "error") {
						const body = safeJSON(sse.data) ?? sse.data;
						const type = body?.error?.type;
						throw new APIError(void 0, body, void 0, response.headers, type);
					}
				}
				done = true;
			} catch (e) {
				if (isAbortError(e)) return;
				throw e;
			} finally {
				if (!done) controller.abort();
			}
		}
		return new Stream(iterator, controller, client);
	}
	/**
	* Generates a Stream from a newline-separated ReadableStream
	* where each item is a JSON value.
	*/
	static fromReadableStream(readableStream, controller, client) {
		let consumed = false;
		async function* iterLines() {
			const lineDecoder = new LineDecoder();
			const iter = ReadableStreamToAsyncIterable(readableStream);
			for await (const chunk of iter) for (const line of lineDecoder.decode(chunk)) yield line;
			for (const line of lineDecoder.flush()) yield line;
		}
		async function* iterator() {
			if (consumed) throw new AnthropicError("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
			consumed = true;
			let done = false;
			try {
				for await (const line of iterLines()) {
					if (done) continue;
					if (line) yield JSON.parse(line);
				}
				done = true;
			} catch (e) {
				if (isAbortError(e)) return;
				throw e;
			} finally {
				if (!done) controller.abort();
			}
		}
		return new Stream(iterator, controller, client);
	}
	[(_Stream_client = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
		return this.iterator();
	}
	/**
	* Splits the stream into two streams which can be
	* independently read from at different speeds.
	*/
	tee() {
		const left = [];
		const right = [];
		const iterator = this.iterator();
		const teeIterator = (queue) => {
			return { next: () => {
				if (queue.length === 0) {
					const result = iterator.next();
					left.push(result);
					right.push(result);
				}
				return queue.shift();
			} };
		};
		return [new Stream(() => teeIterator(left), this.controller, __classPrivateFieldGet(this, _Stream_client, "f")), new Stream(() => teeIterator(right), this.controller, __classPrivateFieldGet(this, _Stream_client, "f"))];
	}
	/**
	* Converts this stream to a newline-separated ReadableStream of
	* JSON stringified values in the stream
	* which can be turned back into a Stream with `Stream.fromReadableStream()`.
	*/
	toReadableStream() {
		const self = this;
		let iter;
		return makeReadableStream({
			async start() {
				iter = self[Symbol.asyncIterator]();
			},
			async pull(ctrl) {
				try {
					const { value, done } = await iter.next();
					if (done) return ctrl.close();
					const bytes = encodeUTF8(JSON.stringify(value) + "\n");
					ctrl.enqueue(bytes);
				} catch (err) {
					ctrl.error(err);
				}
			},
			async cancel() {
				await iter.return?.();
			}
		});
	}
};
async function* _iterSSEMessages(response, controller) {
	if (!response.body) {
		controller.abort();
		if (typeof globalThis.navigator !== "undefined" && globalThis.navigator.product === "ReactNative") throw new AnthropicError(`The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api`);
		throw new AnthropicError(`Attempted to iterate over a response with no body`);
	}
	const sseDecoder = new SSEDecoder();
	const lineDecoder = new LineDecoder();
	const iter = ReadableStreamToAsyncIterable(response.body);
	for await (const sseChunk of iterSSEChunks(iter)) for (const line of lineDecoder.decode(sseChunk)) {
		const sse = sseDecoder.decode(line);
		if (sse) yield sse;
	}
	for (const line of lineDecoder.flush()) {
		const sse = sseDecoder.decode(line);
		if (sse) yield sse;
	}
}
/**
* Given an async iterable iterator, iterates over it and yields full
* SSE chunks, i.e. yields when a double new-line is encountered.
*/
async function* iterSSEChunks(iterator) {
	let data = new Uint8Array();
	for await (const chunk of iterator) {
		if (chunk == null) continue;
		const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === "string" ? encodeUTF8(chunk) : chunk;
		let newData = new Uint8Array(data.length + binaryChunk.length);
		newData.set(data);
		newData.set(binaryChunk, data.length);
		data = newData;
		let patternIndex;
		while ((patternIndex = findDoubleNewlineIndex(data)) !== -1) {
			yield data.slice(0, patternIndex);
			data = data.slice(patternIndex);
		}
	}
	if (data.length > 0) yield data;
}
var SSEDecoder = class {
	constructor() {
		this.event = null;
		this.data = [];
		this.chunks = [];
	}
	decode(line) {
		if (line.endsWith("\r")) line = line.substring(0, line.length - 1);
		if (!line) {
			if (!this.event && !this.data.length) return null;
			const sse = {
				event: this.event,
				data: this.data.join("\n"),
				raw: this.chunks
			};
			this.event = null;
			this.data = [];
			this.chunks = [];
			return sse;
		}
		this.chunks.push(line);
		if (line.startsWith(":")) return null;
		let [fieldname, _, value] = partition(line, ":");
		if (value.startsWith(" ")) value = value.substring(1);
		if (fieldname === "event") this.event = value;
		else if (fieldname === "data") this.data.push(value);
		return null;
	}
};
function partition(str, delimiter) {
	const index = str.indexOf(delimiter);
	if (index !== -1) return [
		str.substring(0, index),
		delimiter,
		str.substring(index + delimiter.length)
	];
	return [
		str,
		"",
		""
	];
}
//#endregion
//#region node_modules/@anthropic-ai/sdk/internal/parse.mjs
async function defaultParseResponse(client, props) {
	const { response, requestLogID, retryOfRequestLogID, startTime } = props;
	const body = await (async () => {
		if (props.options.stream) {
			loggerFor(client).debug("response", response.status, response.url, response.headers, response.body);
			if (props.options.__streamClass) return props.options.__streamClass.fromSSEResponse(response, props.controller);
			return Stream.fromSSEResponse(response, props.controller);
		}
		if (response.status === 204) return null;
		if (props.options.__binaryResponse) return response;
		const mediaType = response.headers.get("content-type")?.split(";")[0]?.trim();
		if (mediaType?.includes("application/json") || mediaType?.endsWith("+json")) {
			if (response.headers.get("content-length") === "0") return;
			return addRequestID(await response.json(), response);
		}
		return await response.text();
	})();
	loggerFor(client).debug(`[${requestLogID}] response parsed`, formatRequestDetails({
		retryOfRequestLogID,
		url: response.url,
		status: response.status,
		body,
		durationMs: Date.now() - startTime
	}));
	return body;
}
function addRequestID(value, response) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return value;
	return Object.defineProperty(value, "_request_id", {
		value: response.headers.get("request-id"),
		enumerable: false
	});
}
//#endregion
//#region node_modules/@anthropic-ai/sdk/core/api-promise.mjs
var _APIPromise_client;
/**
* A subclass of `Promise` providing additional helper methods
* for interacting with the SDK.
*/
var APIPromise = class APIPromise extends Promise {
	constructor(client, responsePromise, parseResponse = defaultParseResponse) {
		super((resolve) => {
			resolve(null);
		});
		this.responsePromise = responsePromise;
		this.parseResponse = parseResponse;
		_APIPromise_client.set(this, void 0);
		__classPrivateFieldSet(this, _APIPromise_client, client, "f");
	}
	_thenUnwrap(transform) {
		return new APIPromise(__classPrivateFieldGet(this, _APIPromise_client, "f"), this.responsePromise, async (client, props) => addRequestID(transform(await this.parseResponse(client, props), props), props.response));
	}
	/**
	* Gets the raw `Response` instance instead of parsing the response
	* data.
	*
	* If you want to parse the response body but still get the `Response`
	* instance, you can use {@link withResponse()}.
	*
	* 👋 Getting the wrong TypeScript type for `Response`?
	* Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
	* to your `tsconfig.json`.
	*/
	asResponse() {
		return this.responsePromise.then((p) => p.response);
	}
	/**
	* Gets the parsed response data, the raw `Response` instance and the ID of the request,
	* returned via the `request-id` header which is useful for debugging requests and resporting
	* issues to Anthropic.
	*
	* If you just want to get the raw `Response` instance without parsing it,
	* you can use {@link asResponse()}.
	*
	* 👋 Getting the wrong TypeScript type for `Response`?
	* Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
	* to your `tsconfig.json`.
	*/
	async withResponse() {
		const [data, response] = await Promise.all([this.parse(), this.asResponse()]);
		return {
			data,
			response,
			request_id: response.headers.get("request-id")
		};
	}
	parse() {
		if (!this.parsedPromise) this.parsedPromise = this.responsePromise.then((data) => this.parseResponse(__classPrivateFieldGet(this, _APIPromise_client, "f"), data));
		return this.parsedPromise;
	}
	then(onfulfilled, onrejected) {
		return this.parse().then(onfulfilled, onrejected);
	}
	catch(onrejected) {
		return this.parse().catch(onrejected);
	}
	finally(onfinally) {
		return this.parse().finally(onfinally);
	}
};
_APIPromise_client = /* @__PURE__ */ new WeakMap();
//#endregion
//#region node_modules/@anthropic-ai/sdk/core/pagination.mjs
var _AbstractPage_client;
var AbstractPage = class {
	constructor(client, response, body, options) {
		_AbstractPage_client.set(this, void 0);
		__classPrivateFieldSet(this, _AbstractPage_client, client, "f");
		this.options = options;
		this.response = response;
		this.body = body;
	}
	hasNextPage() {
		if (!this.getPaginatedItems().length) return false;
		return this.nextPageRequestOptions() != null;
	}
	async getNextPage() {
		const nextOptions = this.nextPageRequestOptions();
		if (!nextOptions) throw new AnthropicError("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
		return await __classPrivateFieldGet(this, _AbstractPage_client, "f").requestAPIList(this.constructor, nextOptions);
	}
	async *iterPages() {
		let page = this;
		yield page;
		while (page.hasNextPage()) {
			page = await page.getNextPage();
			yield page;
		}
	}
	async *[(_AbstractPage_client = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
		for await (const page of this.iterPages()) for (const item of page.getPaginatedItems()) yield item;
	}
};
/**
* This subclass of Promise will resolve to an instantiated Page once the request completes.
*
* It also implements AsyncIterable to allow auto-paginating iteration on an unawaited list call, eg:
*
*    for await (const item of client.items.list()) {
*      console.log(item)
*    }
*/
var PagePromise = class extends APIPromise {
	constructor(client, request, Page) {
		super(client, request, async (client, props) => new Page(client, props.response, await defaultParseResponse(client, props), props.options));
	}
	/**
	* Allow auto-paginating iteration on an unawaited list call, eg:
	*
	*    for await (const item of client.items.list()) {
	*      console.log(item)
	*    }
	*/
	async *[Symbol.asyncIterator]() {
		const page = await this;
		for await (const item of page) yield item;
	}
};
var Page = class extends AbstractPage {
	constructor(client, response, body, options) {
		super(client, response, body, options);
		this.data = body.data || [];
		this.has_more = body.has_more || false;
		this.first_id = body.first_id || null;
		this.last_id = body.last_id || null;
	}
	getPaginatedItems() {
		return this.data ?? [];
	}
	hasNextPage() {
		if (this.has_more === false) return false;
		return super.hasNextPage();
	}
	nextPageRequestOptions() {
		if (this.options.query?.["before_id"]) {
			const first_id = this.first_id;
			if (!first_id) return null;
			return {
				...this.options,
				query: {
					...maybeObj(this.options.query),
					before_id: first_id
				}
			};
		}
		const cursor = this.last_id;
		if (!cursor) return null;
		return {
			...this.options,
			query: {
				...maybeObj(this.options.query),
				after_id: cursor
			}
		};
	}
};
var PageCursor = class extends AbstractPage {
	constructor(client, response, body, options) {
		super(client, response, body, options);
		this.data = body.data || [];
		this.has_more = body.has_more || false;
		this.next_page = body.next_page || null;
	}
	getPaginatedItems() {
		return this.data ?? [];
	}
	hasNextPage() {
		if (this.has_more === false) return false;
		return super.hasNextPage();
	}
	nextPageRequestOptions() {
		const cursor = this.next_page;
		if (!cursor) return null;
		return {
			...this.options,
			query: {
				...maybeObj(this.options.query),
				page: cursor
			}
		};
	}
};
//#endregion
//#region node_modules/@anthropic-ai/sdk/internal/uploads.mjs
const checkFileSupport = () => {
	if (typeof File === "undefined") {
		const { process } = globalThis;
		const isOldNode = typeof process?.versions?.node === "string" && parseInt(process.versions.node.split(".")) < 20;
		throw new Error("`File` is not defined as a global, which is required for file uploads." + (isOldNode ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
	}
};
/**
* Construct a `File` instance. This is used to ensure a helpful error is thrown
* for environments that don't define a global `File` yet.
*/
function makeFile(fileBits, fileName, options) {
	checkFileSupport();
	return new File(fileBits, fileName ?? "unknown_file", options);
}
function getName(value, stripPath) {
	const val = typeof value === "object" && value !== null && ("name" in value && value.name && String(value.name) || "url" in value && value.url && String(value.url) || "filename" in value && value.filename && String(value.filename) || "path" in value && value.path && String(value.path)) || "";
	return stripPath ? val.split(/[\\/]/).pop() || void 0 : val;
}
const isAsyncIterable = (value) => value != null && typeof value === "object" && typeof value[Symbol.asyncIterator] === "function";
const multipartFormRequestOptions = async (opts, fetch, stripFilenames = true) => {
	return {
		...opts,
		body: await createForm(opts.body, fetch, stripFilenames)
	};
};
const supportsFormDataMap = /* @__PURE__ */ new WeakMap();
/**
* node-fetch doesn't support the global FormData object in recent node versions. Instead of sending
* properly-encoded form data, it just stringifies the object, resulting in a request body of "[object FormData]".
* This function detects if the fetch function provided supports the global FormData object to avoid
* confusing error messages later on.
*/
function supportsFormData(fetchObject) {
	const fetch = typeof fetchObject === "function" ? fetchObject : fetchObject.fetch;
	const cached = supportsFormDataMap.get(fetch);
	if (cached) return cached;
	const promise = (async () => {
		try {
			const FetchResponse = "Response" in fetch ? fetch.Response : (await fetch("data:,")).constructor;
			const data = new FormData();
			if (data.toString() === await new FetchResponse(data).text()) return false;
			return true;
		} catch {
			return true;
		}
	})();
	supportsFormDataMap.set(fetch, promise);
	return promise;
}
const createForm = async (body, fetch, stripFilenames = true) => {
	if (!await supportsFormData(fetch)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
	const form = new FormData();
	await Promise.all(Object.entries(body || {}).map(([key, value]) => addFormValue(form, key, value, stripFilenames)));
	return form;
};
const isNamedBlob = (value) => value instanceof Blob && "name" in value;
const addFormValue = async (form, key, value, stripFilenames) => {
	if (value === void 0) return;
	if (value == null) throw new TypeError(`Received null for "${key}"; to pass null in FormData, you must use the string 'null'`);
	if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") form.append(key, String(value));
	else if (value instanceof Response) {
		let options = {};
		const contentType = value.headers.get("Content-Type");
		if (contentType) options = { type: contentType };
		form.append(key, makeFile([await value.blob()], getName(value, stripFilenames), options));
	} else if (isAsyncIterable(value)) form.append(key, makeFile([await new Response(ReadableStreamFrom(value)).blob()], getName(value, stripFilenames)));
	else if (isNamedBlob(value)) form.append(key, makeFile([value], getName(value, stripFilenames), { type: value.type }));
	else if (Array.isArray(value)) await Promise.all(value.map((entry) => addFormValue(form, key + "[]", entry, stripFilenames)));
	else if (typeof value === "object") await Promise.all(Object.entries(value).map(([name, prop]) => addFormValue(form, `${key}[${name}]`, prop, stripFilenames)));
	else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${value} instead`);
};
//#endregion
//#region node_modules/@anthropic-ai/sdk/internal/to-file.mjs
/**
* This check adds the arrayBuffer() method type because it is available and used at runtime
*/
const isBlobLike = (value) => value != null && typeof value === "object" && typeof value.size === "number" && typeof value.type === "string" && typeof value.text === "function" && typeof value.slice === "function" && typeof value.arrayBuffer === "function";
/**
* This check adds the arrayBuffer() method type because it is available and used at runtime
*/
const isFileLike = (value) => value != null && typeof value === "object" && typeof value.name === "string" && typeof value.lastModified === "number" && isBlobLike(value);
const isResponseLike = (value) => value != null && typeof value === "object" && typeof value.url === "string" && typeof value.blob === "function";
/**
* Helper for creating a {@link File} to pass to an SDK upload method from a variety of different data formats
* @param value the raw content of the file. Can be an {@link Uploadable}, BlobLikePart, or AsyncIterable of BlobLikeParts
* @param {string=} name the name of the file. If omitted, toFile will try to determine a file name from bits if possible
* @param {Object=} options additional properties
* @param {string=} options.type the MIME type of the content
* @param {number=} options.lastModified the last modified timestamp
* @returns a {@link File} with the given properties
*/
async function toFile(value, name, options) {
	checkFileSupport();
	value = await value;
	name || (name = getName(value, true));
	if (isFileLike(value)) {
		if (value instanceof File && name == null && options == null) return value;
		return makeFile([await value.arrayBuffer()], name ?? value.name, {
			type: value.type,
			lastModified: value.lastModified,
			...options
		});
	}
	if (isResponseLike(value)) {
		const blob = await value.blob();
		name || (name = new URL(value.url).pathname.split(/[\\/]/).pop());
		return makeFile(await getBytes(blob), name, options);
	}
	const parts = await getBytes(value);
	if (!options?.type) {
		const type = parts.find((part) => typeof part === "object" && "type" in part && part.type);
		if (typeof type === "string") options = {
			...options,
			type
		};
	}
	return makeFile(parts, name, options);
}
async function getBytes(value) {
	let parts = [];
	if (typeof value === "string" || ArrayBuffer.isView(value) || value instanceof ArrayBuffer) parts.push(value);
	else if (isBlobLike(value)) parts.push(value instanceof Blob ? value : await value.arrayBuffer());
	else if (isAsyncIterable(value)) for await (const chunk of value) parts.push(...await getBytes(chunk));
	else {
		const constructor = value?.constructor?.name;
		throw new Error(`Unexpected data type: ${typeof value}${constructor ? `; constructor: ${constructor}` : ""}${propsForError(value)}`);
	}
	return parts;
}
function propsForError(value) {
	if (typeof value !== "object" || value === null) return "";
	return `; props: [${Object.getOwnPropertyNames(value).map((p) => `"${p}"`).join(", ")}]`;
}
//#endregion
//#region node_modules/@anthropic-ai/sdk/core/resource.mjs
var APIResource = class {
	constructor(client) {
		this._client = client;
	}
};
//#endregion
//#region node_modules/@anthropic-ai/sdk/internal/headers.mjs
const brand_privateNullableHeaders = Symbol.for("brand.privateNullableHeaders");
function* iterateHeaders(headers) {
	if (!headers) return;
	if (brand_privateNullableHeaders in headers) {
		const { values, nulls } = headers;
		yield* values.entries();
		for (const name of nulls) yield [name, null];
		return;
	}
	let shouldClear = false;
	let iter;
	if (headers instanceof Headers) iter = headers.entries();
	else if (isReadonlyArray(headers)) iter = headers;
	else {
		shouldClear = true;
		iter = Object.entries(headers ?? {});
	}
	for (let row of iter) {
		const name = row[0];
		if (typeof name !== "string") throw new TypeError("expected header name to be a string");
		const values = isReadonlyArray(row[1]) ? row[1] : [row[1]];
		let didClear = false;
		for (const value of values) {
			if (value === void 0) continue;
			if (shouldClear && !didClear) {
				didClear = true;
				yield [name, null];
			}
			yield [name, value];
		}
	}
}
const buildHeaders = (newHeaders) => {
	const targetHeaders = new Headers();
	const nullHeaders = /* @__PURE__ */ new Set();
	for (const headers of newHeaders) {
		const seenHeaders = /* @__PURE__ */ new Set();
		for (const [name, value] of iterateHeaders(headers)) {
			const lowerName = name.toLowerCase();
			if (!seenHeaders.has(lowerName)) {
				targetHeaders.delete(name);
				seenHeaders.add(lowerName);
			}
			if (value === null) {
				targetHeaders.delete(name);
				nullHeaders.add(lowerName);
			} else {
				targetHeaders.append(name, value);
				nullHeaders.delete(lowerName);
			}
		}
	}
	return {
		[brand_privateNullableHeaders]: true,
		values: targetHeaders,
		nulls: nullHeaders
	};
};
//#endregion
//#region node_modules/@anthropic-ai/sdk/lib/stainless-helper-header.mjs
/**
* Shared utilities for tracking SDK helper usage.
*/
/**
* Symbol used to mark objects created by SDK helpers for tracking.
* The value is the helper name (e.g., 'mcpTool', 'betaZodTool').
*/
const SDK_HELPER_SYMBOL = Symbol("anthropic.sdk.stainlessHelper");
function wasCreatedByStainlessHelper(value) {
	return typeof value === "object" && value !== null && SDK_HELPER_SYMBOL in value;
}
/**
* Collects helper names from tools and messages arrays.
* Returns a deduplicated array of helper names found.
*/
function collectStainlessHelpers(tools, messages) {
	const helpers = /* @__PURE__ */ new Set();
	if (tools) {
		for (const tool of tools) if (wasCreatedByStainlessHelper(tool)) helpers.add(tool[SDK_HELPER_SYMBOL]);
	}
	if (messages) for (const message of messages) {
		if (wasCreatedByStainlessHelper(message)) helpers.add(message[SDK_HELPER_SYMBOL]);
		if (Array.isArray(message.content)) {
			for (const block of message.content) if (wasCreatedByStainlessHelper(block)) helpers.add(block[SDK_HELPER_SYMBOL]);
		}
	}
	return Array.from(helpers);
}
/**
* Builds x-stainless-helper header value from tools and messages.
* Returns an empty object if no helpers are found.
*/
function stainlessHelperHeader(tools, messages) {
	const helpers = collectStainlessHelpers(tools, messages);
	if (helpers.length === 0) return {};
	return { "x-stainless-helper": helpers.join(", ") };
}
/**
* Builds x-stainless-helper header value from a file object.
* Returns an empty object if the file is not marked with a helper.
*/
function stainlessHelperHeaderFromFile(file) {
	if (wasCreatedByStainlessHelper(file)) return { "x-stainless-helper": file[SDK_HELPER_SYMBOL] };
	return {};
}
//#endregion
//#region node_modules/@anthropic-ai/sdk/internal/utils/path.mjs
/**
* Percent-encode everything that isn't safe to have in a path without encoding safe chars.
*
* Taken from https://datatracker.ietf.org/doc/html/rfc3986#section-3.3:
* > unreserved  = ALPHA / DIGIT / "-" / "." / "_" / "~"
* > sub-delims  = "!" / "$" / "&" / "'" / "(" / ")" / "*" / "+" / "," / ";" / "="
* > pchar       = unreserved / pct-encoded / sub-delims / ":" / "@"
*/
function encodeURIPath(str) {
	return str.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
const EMPTY = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null));
const createPathTagFunction = (pathEncoder = encodeURIPath) => function path(statics, ...params) {
	if (statics.length === 1) return statics[0];
	let postPath = false;
	const invalidSegments = [];
	const path = statics.reduce((previousValue, currentValue, index) => {
		if (/[?#]/.test(currentValue)) postPath = true;
		const value = params[index];
		let encoded = (postPath ? encodeURIComponent : pathEncoder)("" + value);
		if (index !== params.length && (value == null || typeof value === "object" && value.toString === Object.getPrototypeOf(Object.getPrototypeOf(value.hasOwnProperty ?? EMPTY) ?? EMPTY)?.toString)) {
			encoded = value + "";
			invalidSegments.push({
				start: previousValue.length + currentValue.length,
				length: encoded.length,
				error: `Value of type ${Object.prototype.toString.call(value).slice(8, -1)} is not a valid path parameter`
			});
		}
		return previousValue + currentValue + (index === params.length ? "" : encoded);
	}, "");
	const pathOnly = path.split(/[?#]/, 1)[0];
	const invalidSegmentPattern = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
	let match;
	while ((match = invalidSegmentPattern.exec(pathOnly)) !== null) invalidSegments.push({
		start: match.index,
		length: match[0].length,
		error: `Value "${match[0]}" can\'t be safely passed as a path parameter`
	});
	invalidSegments.sort((a, b) => a.start - b.start);
	if (invalidSegments.length > 0) {
		let lastEnd = 0;
		const underline = invalidSegments.reduce((acc, segment) => {
			const spaces = " ".repeat(segment.start - lastEnd);
			const arrows = "^".repeat(segment.length);
			lastEnd = segment.start + segment.length;
			return acc + spaces + arrows;
		}, "");
		throw new AnthropicError(`Path parameters result in path with invalid segments:\n${invalidSegments.map((e) => e.error).join("\n")}\n${path}\n${underline}`);
	}
	return path;
};
/**
* URI-encodes path params and ensures no unsafe /./ or /../ path segments are introduced.
*/
const path = /* @__PURE__ */ createPathTagFunction(encodeURIPath);
//#endregion
//#region node_modules/@anthropic-ai/sdk/resources/beta/files.mjs
var Files = class extends APIResource {
	/**
	* List Files
	*
	* @example
	* ```ts
	* // Automatically fetches more pages as needed.
	* for await (const fileMetadata of client.beta.files.list()) {
	*   // ...
	* }
	* ```
	*/
	list(params = {}, options) {
		const { betas, ...query } = params ?? {};
		return this._client.getAPIList("/v1/files", Page, {
			query,
			...options,
			headers: buildHeaders([{ "anthropic-beta": [...betas ?? [], "files-api-2025-04-14"].toString() }, options?.headers])
		});
	}
	/**
	* Delete File
	*
	* @example
	* ```ts
	* const deletedFile = await client.beta.files.delete(
	*   'file_id',
	* );
	* ```
	*/
	delete(fileID, params = {}, options) {
		const { betas } = params ?? {};
		return this._client.delete(path`/v1/files/${fileID}`, {
			...options,
			headers: buildHeaders([{ "anthropic-beta": [...betas ?? [], "files-api-2025-04-14"].toString() }, options?.headers])
		});
	}
	/**
	* Download File
	*
	* @example
	* ```ts
	* const response = await client.beta.files.download(
	*   'file_id',
	* );
	*
	* const content = await response.blob();
	* console.log(content);
	* ```
	*/
	download(fileID, params = {}, options) {
		const { betas } = params ?? {};
		return this._client.get(path`/v1/files/${fileID}/content`, {
			...options,
			headers: buildHeaders([{
				"anthropic-beta": [...betas ?? [], "files-api-2025-04-14"].toString(),
				Accept: "application/binary"
			}, options?.headers]),
			__binaryResponse: true
		});
	}
	/**
	* Get File Metadata
	*
	* @example
	* ```ts
	* const fileMetadata =
	*   await client.beta.files.retrieveMetadata('file_id');
	* ```
	*/
	retrieveMetadata(fileID, params = {}, options) {
		const { betas } = params ?? {};
		return this._client.get(path`/v1/files/${fileID}`, {
			...options,
			headers: buildHeaders([{ "anthropic-beta": [...betas ?? [], "files-api-2025-04-14"].toString() }, options?.headers])
		});
	}
	/**
	* Upload File
	*
	* @example
	* ```ts
	* const fileMetadata = await client.beta.files.upload({
	*   file: fs.createReadStream('path/to/file'),
	* });
	* ```
	*/
	upload(params, options) {
		const { betas, ...body } = params;
		return this._client.post("/v1/files", multipartFormRequestOptions({
			body,
			...options,
			headers: buildHeaders([
				{ "anthropic-beta": [...betas ?? [], "files-api-2025-04-14"].toString() },
				stainlessHelperHeaderFromFile(body.file),
				options?.headers
			])
		}, this._client));
	}
};
//#endregion
//#region node_modules/@anthropic-ai/sdk/resources/beta/models.mjs
var Models$1 = class extends APIResource {
	/**
	* Get a specific model.
	*
	* The Models API response can be used to determine information about a specific
	* model or resolve a model alias to a model ID.
	*
	* @example
	* ```ts
	* const betaModelInfo = await client.beta.models.retrieve(
	*   'model_id',
	* );
	* ```
	*/
	retrieve(modelID, params = {}, options) {
		const { betas } = params ?? {};
		return this._client.get(path`/v1/models/${modelID}?beta=true`, {
			...options,
			headers: buildHeaders([{ ...betas?.toString() != null ? { "anthropic-beta": betas?.toString() } : void 0 }, options?.headers])
		});
	}
	/**
	* List available models.
	*
	* The Models API response can be used to determine which models are available for
	* use in the API. More recently released models are listed first.
	*
	* @example
	* ```ts
	* // Automatically fetches more pages as needed.
	* for await (const betaModelInfo of client.beta.models.list()) {
	*   // ...
	* }
	* ```
	*/
	list(params = {}, options) {
		const { betas, ...query } = params ?? {};
		return this._client.getAPIList("/v1/models?beta=true", Page, {
			query,
			...options,
			headers: buildHeaders([{ ...betas?.toString() != null ? { "anthropic-beta": betas?.toString() } : void 0 }, options?.headers])
		});
	}
};
//#endregion
//#region node_modules/@anthropic-ai/sdk/internal/constants.mjs
/**
* Model-specific timeout constraints for non-streaming requests
*/
const MODEL_NONSTREAMING_TOKENS = {
	"claude-opus-4-20250514": 8192,
	"claude-opus-4-0": 8192,
	"claude-4-opus-20250514": 8192,
	"anthropic.claude-opus-4-20250514-v1:0": 8192,
	"claude-opus-4@20250514": 8192,
	"claude-opus-4-1-20250805": 8192,
	"anthropic.claude-opus-4-1-20250805-v1:0": 8192,
	"claude-opus-4-1@20250805": 8192
};
//#endregion
//#region node_modules/@anthropic-ai/sdk/lib/beta-parser.mjs
function getOutputFormat$1(params) {
	return params?.output_format ?? params?.output_config?.format;
}
function maybeParseBetaMessage(message, params, opts) {
	const outputFormat = getOutputFormat$1(params);
	if (!params || !("parse" in (outputFormat ?? {}))) return {
		...message,
		content: message.content.map((block) => {
			if (block.type === "text") {
				const parsedBlock = Object.defineProperty({ ...block }, "parsed_output", {
					value: null,
					enumerable: false
				});
				return Object.defineProperty(parsedBlock, "parsed", {
					get() {
						opts.logger.warn("The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead.");
						return null;
					},
					enumerable: false
				});
			}
			return block;
		}),
		parsed_output: null
	};
	return parseBetaMessage(message, params, opts);
}
function parseBetaMessage(message, params, opts) {
	let firstParsedOutput = null;
	const content = message.content.map((block) => {
		if (block.type === "text") {
			const parsedOutput = parseBetaOutputFormat(params, block.text);
			if (firstParsedOutput === null) firstParsedOutput = parsedOutput;
			const parsedBlock = Object.defineProperty({ ...block }, "parsed_output", {
				value: parsedOutput,
				enumerable: false
			});
			return Object.defineProperty(parsedBlock, "parsed", {
				get() {
					opts.logger.warn("The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead.");
					return parsedOutput;
				},
				enumerable: false
			});
		}
		return block;
	});
	return {
		...message,
		content,
		parsed_output: firstParsedOutput
	};
}
function parseBetaOutputFormat(params, content) {
	const outputFormat = getOutputFormat$1(params);
	if (outputFormat?.type !== "json_schema") return null;
	try {
		if ("parse" in outputFormat) return outputFormat.parse(content);
		return JSON.parse(content);
	} catch (error) {
		throw new AnthropicError(`Failed to parse structured output: ${error}`);
	}
}
//#endregion
//#region node_modules/@anthropic-ai/sdk/_vendor/partial-json-parser/parser.mjs
const tokenize = (input) => {
	let current = 0;
	let tokens = [];
	while (current < input.length) {
		let char = input[current];
		if (char === "\\") {
			current++;
			continue;
		}
		if (char === "{") {
			tokens.push({
				type: "brace",
				value: "{"
			});
			current++;
			continue;
		}
		if (char === "}") {
			tokens.push({
				type: "brace",
				value: "}"
			});
			current++;
			continue;
		}
		if (char === "[") {
			tokens.push({
				type: "paren",
				value: "["
			});
			current++;
			continue;
		}
		if (char === "]") {
			tokens.push({
				type: "paren",
				value: "]"
			});
			current++;
			continue;
		}
		if (char === ":") {
			tokens.push({
				type: "separator",
				value: ":"
			});
			current++;
			continue;
		}
		if (char === ",") {
			tokens.push({
				type: "delimiter",
				value: ","
			});
			current++;
			continue;
		}
		if (char === "\"") {
			let value = "";
			let danglingQuote = false;
			char = input[++current];
			while (char !== "\"") {
				if (current === input.length) {
					danglingQuote = true;
					break;
				}
				if (char === "\\") {
					current++;
					if (current === input.length) {
						danglingQuote = true;
						break;
					}
					value += char + input[current];
					char = input[++current];
				} else {
					value += char;
					char = input[++current];
				}
			}
			char = input[++current];
			if (!danglingQuote) tokens.push({
				type: "string",
				value
			});
			continue;
		}
		if (char && /\s/.test(char)) {
			current++;
			continue;
		}
		let NUMBERS = /[0-9]/;
		if (char && NUMBERS.test(char) || char === "-" || char === ".") {
			let value = "";
			if (char === "-") {
				value += char;
				char = input[++current];
			}
			while (char && NUMBERS.test(char) || char === ".") {
				value += char;
				char = input[++current];
			}
			tokens.push({
				type: "number",
				value
			});
			continue;
		}
		let LETTERS = /[a-z]/i;
		if (char && LETTERS.test(char)) {
			let value = "";
			while (char && LETTERS.test(char)) {
				if (current === input.length) break;
				value += char;
				char = input[++current];
			}
			if (value == "true" || value == "false" || value === "null") tokens.push({
				type: "name",
				value
			});
			else {
				current++;
				continue;
			}
			continue;
		}
		current++;
	}
	return tokens;
}, strip = (tokens) => {
	if (tokens.length === 0) return tokens;
	let lastToken = tokens[tokens.length - 1];
	switch (lastToken.type) {
		case "separator":
			tokens = tokens.slice(0, tokens.length - 1);
			return strip(tokens);
		case "number":
			let lastCharacterOfLastToken = lastToken.value[lastToken.value.length - 1];
			if (lastCharacterOfLastToken === "." || lastCharacterOfLastToken === "-") {
				tokens = tokens.slice(0, tokens.length - 1);
				return strip(tokens);
			}
		case "string":
			let tokenBeforeTheLastToken = tokens[tokens.length - 2];
			if (tokenBeforeTheLastToken?.type === "delimiter") {
				tokens = tokens.slice(0, tokens.length - 1);
				return strip(tokens);
			} else if (tokenBeforeTheLastToken?.type === "brace" && tokenBeforeTheLastToken.value === "{") {
				tokens = tokens.slice(0, tokens.length - 1);
				return strip(tokens);
			}
			break;
		case "delimiter":
			tokens = tokens.slice(0, tokens.length - 1);
			return strip(tokens);
	}
	return tokens;
}, unstrip = (tokens) => {
	let tail = [];
	tokens.map((token) => {
		if (token.type === "brace") if (token.value === "{") tail.push("}");
		else tail.splice(tail.lastIndexOf("}"), 1);
		if (token.type === "paren") if (token.value === "[") tail.push("]");
		else tail.splice(tail.lastIndexOf("]"), 1);
	});
	if (tail.length > 0) tail.reverse().map((item) => {
		if (item === "}") tokens.push({
			type: "brace",
			value: "}"
		});
		else if (item === "]") tokens.push({
			type: "paren",
			value: "]"
		});
	});
	return tokens;
}, generate = (tokens) => {
	let output = "";
	tokens.map((token) => {
		switch (token.type) {
			case "string":
				output += "\"" + token.value + "\"";
				break;
			default:
				output += token.value;
				break;
		}
	});
	return output;
}, partialParse = (input) => JSON.parse(generate(unstrip(strip(tokenize(input)))));
//#endregion
//#region node_modules/@anthropic-ai/sdk/lib/BetaMessageStream.mjs
var _BetaMessageStream_instances, _BetaMessageStream_currentMessageSnapshot, _BetaMessageStream_params, _BetaMessageStream_connectedPromise, _BetaMessageStream_resolveConnectedPromise, _BetaMessageStream_rejectConnectedPromise, _BetaMessageStream_endPromise, _BetaMessageStream_resolveEndPromise, _BetaMessageStream_rejectEndPromise, _BetaMessageStream_listeners, _BetaMessageStream_ended, _BetaMessageStream_errored, _BetaMessageStream_aborted, _BetaMessageStream_catchingPromiseCreated, _BetaMessageStream_response, _BetaMessageStream_request_id, _BetaMessageStream_logger, _BetaMessageStream_getFinalMessage, _BetaMessageStream_getFinalText, _BetaMessageStream_handleError, _BetaMessageStream_beginRequest, _BetaMessageStream_addStreamEvent, _BetaMessageStream_endRequest, _BetaMessageStream_accumulateMessage;
const JSON_BUF_PROPERTY$1 = "__json_buf";
function tracksToolInput$1(content) {
	return content.type === "tool_use" || content.type === "server_tool_use" || content.type === "mcp_tool_use";
}
var BetaMessageStream = class BetaMessageStream {
	constructor(params, opts) {
		_BetaMessageStream_instances.add(this);
		this.messages = [];
		this.receivedMessages = [];
		_BetaMessageStream_currentMessageSnapshot.set(this, void 0);
		_BetaMessageStream_params.set(this, null);
		this.controller = new AbortController();
		_BetaMessageStream_connectedPromise.set(this, void 0);
		_BetaMessageStream_resolveConnectedPromise.set(this, () => {});
		_BetaMessageStream_rejectConnectedPromise.set(this, () => {});
		_BetaMessageStream_endPromise.set(this, void 0);
		_BetaMessageStream_resolveEndPromise.set(this, () => {});
		_BetaMessageStream_rejectEndPromise.set(this, () => {});
		_BetaMessageStream_listeners.set(this, {});
		_BetaMessageStream_ended.set(this, false);
		_BetaMessageStream_errored.set(this, false);
		_BetaMessageStream_aborted.set(this, false);
		_BetaMessageStream_catchingPromiseCreated.set(this, false);
		_BetaMessageStream_response.set(this, void 0);
		_BetaMessageStream_request_id.set(this, void 0);
		_BetaMessageStream_logger.set(this, void 0);
		_BetaMessageStream_handleError.set(this, (error) => {
			__classPrivateFieldSet(this, _BetaMessageStream_errored, true, "f");
			if (isAbortError(error)) error = new APIUserAbortError();
			if (error instanceof APIUserAbortError) {
				__classPrivateFieldSet(this, _BetaMessageStream_aborted, true, "f");
				return this._emit("abort", error);
			}
			if (error instanceof AnthropicError) return this._emit("error", error);
			if (error instanceof Error) {
				const anthropicError = new AnthropicError(error.message);
				anthropicError.cause = error;
				return this._emit("error", anthropicError);
			}
			return this._emit("error", new AnthropicError(String(error)));
		});
		__classPrivateFieldSet(this, _BetaMessageStream_connectedPromise, new Promise((resolve, reject) => {
			__classPrivateFieldSet(this, _BetaMessageStream_resolveConnectedPromise, resolve, "f");
			__classPrivateFieldSet(this, _BetaMessageStream_rejectConnectedPromise, reject, "f");
		}), "f");
		__classPrivateFieldSet(this, _BetaMessageStream_endPromise, new Promise((resolve, reject) => {
			__classPrivateFieldSet(this, _BetaMessageStream_resolveEndPromise, resolve, "f");
			__classPrivateFieldSet(this, _BetaMessageStream_rejectEndPromise, reject, "f");
		}), "f");
		__classPrivateFieldGet(this, _BetaMessageStream_connectedPromise, "f").catch(() => {});
		__classPrivateFieldGet(this, _BetaMessageStream_endPromise, "f").catch(() => {});
		__classPrivateFieldSet(this, _BetaMessageStream_params, params, "f");
		__classPrivateFieldSet(this, _BetaMessageStream_logger, opts?.logger ?? console, "f");
	}
	get response() {
		return __classPrivateFieldGet(this, _BetaMessageStream_response, "f");
	}
	get request_id() {
		return __classPrivateFieldGet(this, _BetaMessageStream_request_id, "f");
	}
	/**
	* Returns the `MessageStream` data, the raw `Response` instance and the ID of the request,
	* returned vie the `request-id` header which is useful for debugging requests and resporting
	* issues to Anthropic.
	*
	* This is the same as the `APIPromise.withResponse()` method.
	*
	* This method will raise an error if you created the stream using `MessageStream.fromReadableStream`
	* as no `Response` is available.
	*/
	async withResponse() {
		__classPrivateFieldSet(this, _BetaMessageStream_catchingPromiseCreated, true, "f");
		const response = await __classPrivateFieldGet(this, _BetaMessageStream_connectedPromise, "f");
		if (!response) throw new Error("Could not resolve a `Response` object");
		return {
			data: this,
			response,
			request_id: response.headers.get("request-id")
		};
	}
	/**
	* Intended for use on the frontend, consuming a stream produced with
	* `.toReadableStream()` on the backend.
	*
	* Note that messages sent to the model do not appear in `.on('message')`
	* in this context.
	*/
	static fromReadableStream(stream) {
		const runner = new BetaMessageStream(null);
		runner._run(() => runner._fromReadableStream(stream));
		return runner;
	}
	static createMessage(messages, params, options, { logger } = {}) {
		const runner = new BetaMessageStream(params, { logger });
		for (const message of params.messages) runner._addMessageParam(message);
		__classPrivateFieldSet(runner, _BetaMessageStream_params, {
			...params,
			stream: true
		}, "f");
		runner._run(() => runner._createMessage(messages, {
			...params,
			stream: true
		}, {
			...options,
			headers: {
				...options?.headers,
				"X-Stainless-Helper-Method": "stream"
			}
		}));
		return runner;
	}
	_run(executor) {
		executor().then(() => {
			this._emitFinal();
			this._emit("end");
		}, __classPrivateFieldGet(this, _BetaMessageStream_handleError, "f"));
	}
	_addMessageParam(message) {
		this.messages.push(message);
	}
	_addMessage(message, emit = true) {
		this.receivedMessages.push(message);
		if (emit) this._emit("message", message);
	}
	async _createMessage(messages, params, options) {
		const signal = options?.signal;
		let abortHandler;
		if (signal) {
			if (signal.aborted) this.controller.abort();
			abortHandler = this.controller.abort.bind(this.controller);
			signal.addEventListener("abort", abortHandler);
		}
		try {
			__classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_beginRequest).call(this);
			const { response, data: stream } = await messages.create({
				...params,
				stream: true
			}, {
				...options,
				signal: this.controller.signal
			}).withResponse();
			this._connected(response);
			for await (const event of stream) __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_addStreamEvent).call(this, event);
			if (stream.controller.signal?.aborted) throw new APIUserAbortError();
			__classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_endRequest).call(this);
		} finally {
			if (signal && abortHandler) signal.removeEventListener("abort", abortHandler);
		}
	}
	_connected(response) {
		if (this.ended) return;
		__classPrivateFieldSet(this, _BetaMessageStream_response, response, "f");
		__classPrivateFieldSet(this, _BetaMessageStream_request_id, response?.headers.get("request-id"), "f");
		__classPrivateFieldGet(this, _BetaMessageStream_resolveConnectedPromise, "f").call(this, response);
		this._emit("connect");
	}
	get ended() {
		return __classPrivateFieldGet(this, _BetaMessageStream_ended, "f");
	}
	get errored() {
		return __classPrivateFieldGet(this, _BetaMessageStream_errored, "f");
	}
	get aborted() {
		return __classPrivateFieldGet(this, _BetaMessageStream_aborted, "f");
	}
	abort() {
		this.controller.abort();
	}
	/**
	* Adds the listener function to the end of the listeners array for the event.
	* No checks are made to see if the listener has already been added. Multiple calls passing
	* the same combination of event and listener will result in the listener being added, and
	* called, multiple times.
	* @returns this MessageStream, so that calls can be chained
	*/
	on(event, listener) {
		(__classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] = [])).push({ listener });
		return this;
	}
	/**
	* Removes the specified listener from the listener array for the event.
	* off() will remove, at most, one instance of a listener from the listener array. If any single
	* listener has been added multiple times to the listener array for the specified event, then
	* off() must be called multiple times to remove each instance.
	* @returns this MessageStream, so that calls can be chained
	*/
	off(event, listener) {
		const listeners = __classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event];
		if (!listeners) return this;
		const index = listeners.findIndex((l) => l.listener === listener);
		if (index >= 0) listeners.splice(index, 1);
		return this;
	}
	/**
	* Adds a one-time listener function for the event. The next time the event is triggered,
	* this listener is removed and then invoked.
	* @returns this MessageStream, so that calls can be chained
	*/
	once(event, listener) {
		(__classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] = [])).push({
			listener,
			once: true
		});
		return this;
	}
	/**
	* This is similar to `.once()`, but returns a Promise that resolves the next time
	* the event is triggered, instead of calling a listener callback.
	* @returns a Promise that resolves the next time given event is triggered,
	* or rejects if an error is emitted.  (If you request the 'error' event,
	* returns a promise that resolves with the error).
	*
	* Example:
	*
	*   const message = await stream.emitted('message') // rejects if the stream errors
	*/
	emitted(event) {
		return new Promise((resolve, reject) => {
			__classPrivateFieldSet(this, _BetaMessageStream_catchingPromiseCreated, true, "f");
			if (event !== "error") this.once("error", reject);
			this.once(event, resolve);
		});
	}
	async done() {
		__classPrivateFieldSet(this, _BetaMessageStream_catchingPromiseCreated, true, "f");
		await __classPrivateFieldGet(this, _BetaMessageStream_endPromise, "f");
	}
	get currentMessage() {
		return __classPrivateFieldGet(this, _BetaMessageStream_currentMessageSnapshot, "f");
	}
	/**
	* @returns a promise that resolves with the the final assistant Message response,
	* or rejects if an error occurred or the stream ended prematurely without producing a Message.
	* If structured outputs were used, this will be a ParsedMessage with a `parsed` field.
	*/
	async finalMessage() {
		await this.done();
		return __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_getFinalMessage).call(this);
	}
	/**
	* @returns a promise that resolves with the the final assistant Message's text response, concatenated
	* together if there are more than one text blocks.
	* Rejects if an error occurred or the stream ended prematurely without producing a Message.
	*/
	async finalText() {
		await this.done();
		return __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_getFinalText).call(this);
	}
	_emit(event, ...args) {
		if (__classPrivateFieldGet(this, _BetaMessageStream_ended, "f")) return;
		if (event === "end") {
			__classPrivateFieldSet(this, _BetaMessageStream_ended, true, "f");
			__classPrivateFieldGet(this, _BetaMessageStream_resolveEndPromise, "f").call(this);
		}
		const listeners = __classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event];
		if (listeners) {
			__classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] = listeners.filter((l) => !l.once);
			listeners.forEach(({ listener }) => listener(...args));
		}
		if (event === "abort") {
			const error = args[0];
			if (!__classPrivateFieldGet(this, _BetaMessageStream_catchingPromiseCreated, "f") && !listeners?.length) Promise.reject(error);
			__classPrivateFieldGet(this, _BetaMessageStream_rejectConnectedPromise, "f").call(this, error);
			__classPrivateFieldGet(this, _BetaMessageStream_rejectEndPromise, "f").call(this, error);
			this._emit("end");
			return;
		}
		if (event === "error") {
			const error = args[0];
			if (!__classPrivateFieldGet(this, _BetaMessageStream_catchingPromiseCreated, "f") && !listeners?.length) Promise.reject(error);
			__classPrivateFieldGet(this, _BetaMessageStream_rejectConnectedPromise, "f").call(this, error);
			__classPrivateFieldGet(this, _BetaMessageStream_rejectEndPromise, "f").call(this, error);
			this._emit("end");
		}
	}
	_emitFinal() {
		if (this.receivedMessages.at(-1)) this._emit("finalMessage", __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_getFinalMessage).call(this));
	}
	async _fromReadableStream(readableStream, options) {
		const signal = options?.signal;
		let abortHandler;
		if (signal) {
			if (signal.aborted) this.controller.abort();
			abortHandler = this.controller.abort.bind(this.controller);
			signal.addEventListener("abort", abortHandler);
		}
		try {
			__classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_beginRequest).call(this);
			this._connected(null);
			const stream = Stream.fromReadableStream(readableStream, this.controller);
			for await (const event of stream) __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_addStreamEvent).call(this, event);
			if (stream.controller.signal?.aborted) throw new APIUserAbortError();
			__classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_endRequest).call(this);
		} finally {
			if (signal && abortHandler) signal.removeEventListener("abort", abortHandler);
		}
	}
	[(_BetaMessageStream_currentMessageSnapshot = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_params = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_connectedPromise = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_resolveConnectedPromise = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_rejectConnectedPromise = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_endPromise = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_resolveEndPromise = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_rejectEndPromise = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_listeners = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_ended = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_errored = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_aborted = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_catchingPromiseCreated = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_response = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_request_id = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_logger = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_handleError = /* @__PURE__ */ new WeakMap(), _BetaMessageStream_instances = /* @__PURE__ */ new WeakSet(), _BetaMessageStream_getFinalMessage = function _BetaMessageStream_getFinalMessage() {
		if (this.receivedMessages.length === 0) throw new AnthropicError("stream ended without producing a Message with role=assistant");
		return this.receivedMessages.at(-1);
	}, _BetaMessageStream_getFinalText = function _BetaMessageStream_getFinalText() {
		if (this.receivedMessages.length === 0) throw new AnthropicError("stream ended without producing a Message with role=assistant");
		const textBlocks = this.receivedMessages.at(-1).content.filter((block) => block.type === "text").map((block) => block.text);
		if (textBlocks.length === 0) throw new AnthropicError("stream ended without producing a content block with type=text");
		return textBlocks.join(" ");
	}, _BetaMessageStream_beginRequest = function _BetaMessageStream_beginRequest() {
		if (this.ended) return;
		__classPrivateFieldSet(this, _BetaMessageStream_currentMessageSnapshot, void 0, "f");
	}, _BetaMessageStream_addStreamEvent = function _BetaMessageStream_addStreamEvent(event) {
		if (this.ended) return;
		const messageSnapshot = __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_accumulateMessage).call(this, event);
		this._emit("streamEvent", event, messageSnapshot);
		switch (event.type) {
			case "content_block_delta": {
				const content = messageSnapshot.content.at(-1);
				switch (event.delta.type) {
					case "text_delta":
						if (content.type === "text") this._emit("text", event.delta.text, content.text || "");
						break;
					case "citations_delta":
						if (content.type === "text") this._emit("citation", event.delta.citation, content.citations ?? []);
						break;
					case "input_json_delta":
						if (tracksToolInput$1(content) && content.input) this._emit("inputJson", event.delta.partial_json, content.input);
						break;
					case "thinking_delta":
						if (content.type === "thinking") this._emit("thinking", event.delta.thinking, content.thinking);
						break;
					case "signature_delta":
						if (content.type === "thinking") this._emit("signature", content.signature);
						break;
					case "compaction_delta":
						if (content.type === "compaction" && content.content) this._emit("compaction", content.content);
						break;
					default: checkNever$1(event.delta);
				}
				break;
			}
			case "message_stop":
				this._addMessageParam(messageSnapshot);
				this._addMessage(maybeParseBetaMessage(messageSnapshot, __classPrivateFieldGet(this, _BetaMessageStream_params, "f"), { logger: __classPrivateFieldGet(this, _BetaMessageStream_logger, "f") }), true);
				break;
			case "content_block_stop":
				this._emit("contentBlock", messageSnapshot.content.at(-1));
				break;
			case "message_start":
				__classPrivateFieldSet(this, _BetaMessageStream_currentMessageSnapshot, messageSnapshot, "f");
				break;
			case "content_block_start":
			case "message_delta": break;
		}
	}, _BetaMessageStream_endRequest = function _BetaMessageStream_endRequest() {
		if (this.ended) throw new AnthropicError(`stream has ended, this shouldn't happen`);
		const snapshot = __classPrivateFieldGet(this, _BetaMessageStream_currentMessageSnapshot, "f");
		if (!snapshot) throw new AnthropicError(`request ended without sending any chunks`);
		__classPrivateFieldSet(this, _BetaMessageStream_currentMessageSnapshot, void 0, "f");
		return maybeParseBetaMessage(snapshot, __classPrivateFieldGet(this, _BetaMessageStream_params, "f"), { logger: __classPrivateFieldGet(this, _BetaMessageStream_logger, "f") });
	}, _BetaMessageStream_accumulateMessage = function _BetaMessageStream_accumulateMessage(event) {
		let snapshot = __classPrivateFieldGet(this, _BetaMessageStream_currentMessageSnapshot, "f");
		if (event.type === "message_start") {
			if (snapshot) throw new AnthropicError(`Unexpected event order, got ${event.type} before receiving "message_stop"`);
			return event.message;
		}
		if (!snapshot) throw new AnthropicError(`Unexpected event order, got ${event.type} before "message_start"`);
		switch (event.type) {
			case "message_stop": return snapshot;
			case "message_delta":
				snapshot.container = event.delta.container;
				snapshot.stop_reason = event.delta.stop_reason;
				snapshot.stop_sequence = event.delta.stop_sequence;
				snapshot.usage.output_tokens = event.usage.output_tokens;
				snapshot.context_management = event.context_management;
				if (event.usage.input_tokens != null) snapshot.usage.input_tokens = event.usage.input_tokens;
				if (event.usage.cache_creation_input_tokens != null) snapshot.usage.cache_creation_input_tokens = event.usage.cache_creation_input_tokens;
				if (event.usage.cache_read_input_tokens != null) snapshot.usage.cache_read_input_tokens = event.usage.cache_read_input_tokens;
				if (event.usage.server_tool_use != null) snapshot.usage.server_tool_use = event.usage.server_tool_use;
				if (event.usage.iterations != null) snapshot.usage.iterations = event.usage.iterations;
				return snapshot;
			case "content_block_start":
				snapshot.content.push(event.content_block);
				return snapshot;
			case "content_block_delta": {
				const snapshotContent = snapshot.content.at(event.index);
				switch (event.delta.type) {
					case "text_delta":
						if (snapshotContent?.type === "text") snapshot.content[event.index] = {
							...snapshotContent,
							text: (snapshotContent.text || "") + event.delta.text
						};
						break;
					case "citations_delta":
						if (snapshotContent?.type === "text") snapshot.content[event.index] = {
							...snapshotContent,
							citations: [...snapshotContent.citations ?? [], event.delta.citation]
						};
						break;
					case "input_json_delta":
						if (snapshotContent && tracksToolInput$1(snapshotContent)) {
							let jsonBuf = snapshotContent[JSON_BUF_PROPERTY$1] || "";
							jsonBuf += event.delta.partial_json;
							const newContent = { ...snapshotContent };
							Object.defineProperty(newContent, JSON_BUF_PROPERTY$1, {
								value: jsonBuf,
								enumerable: false,
								writable: true
							});
							if (jsonBuf) try {
								newContent.input = partialParse(jsonBuf);
							} catch (err) {
								const error = new AnthropicError(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${err}. JSON: ${jsonBuf}`);
								__classPrivateFieldGet(this, _BetaMessageStream_handleError, "f").call(this, error);
							}
							snapshot.content[event.index] = newContent;
						}
						break;
					case "thinking_delta":
						if (snapshotContent?.type === "thinking") snapshot.content[event.index] = {
							...snapshotContent,
							thinking: snapshotContent.thinking + event.delta.thinking
						};
						break;
					case "signature_delta":
						if (snapshotContent?.type === "thinking") snapshot.content[event.index] = {
							...snapshotContent,
							signature: event.delta.signature
						};
						break;
					case "compaction_delta":
						if (snapshotContent?.type === "compaction") snapshot.content[event.index] = {
							...snapshotContent,
							content: (snapshotContent.content || "") + event.delta.content
						};
						break;
					default: checkNever$1(event.delta);
				}
				return snapshot;
			}
			case "content_block_stop": return snapshot;
		}
	}, Symbol.asyncIterator)]() {
		const pushQueue = [];
		const readQueue = [];
		let done = false;
		this.on("streamEvent", (event) => {
			const reader = readQueue.shift();
			if (reader) reader.resolve(event);
			else pushQueue.push(event);
		});
		this.on("end", () => {
			done = true;
			for (const reader of readQueue) reader.resolve(void 0);
			readQueue.length = 0;
		});
		this.on("abort", (err) => {
			done = true;
			for (const reader of readQueue) reader.reject(err);
			readQueue.length = 0;
		});
		this.on("error", (err) => {
			done = true;
			for (const reader of readQueue) reader.reject(err);
			readQueue.length = 0;
		});
		return {
			next: async () => {
				if (!pushQueue.length) {
					if (done) return {
						value: void 0,
						done: true
					};
					return new Promise((resolve, reject) => readQueue.push({
						resolve,
						reject
					})).then((chunk) => chunk ? {
						value: chunk,
						done: false
					} : {
						value: void 0,
						done: true
					});
				}
				return {
					value: pushQueue.shift(),
					done: false
				};
			},
			return: async () => {
				this.abort();
				return {
					value: void 0,
					done: true
				};
			}
		};
	}
	toReadableStream() {
		return new Stream(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
	}
};
function checkNever$1(x) {}
//#endregion
//#region node_modules/@anthropic-ai/sdk/lib/tools/ToolError.mjs
/**
* An error that can be thrown from a tool's `run` method to return structured
* content blocks as the error result, rather than just a string message.
*
* When the ToolRunner catches this error, it will use the `content` property
* as the tool result with `is_error: true`.
*
* @example
* ```ts
* const tool = {
*   name: 'my_tool',
*   run: async (input) => {
*     if (somethingWentWrong) {
*       throw new ToolError([
*         { type: 'text', text: 'Error details here' },
*         { type: 'image', source: { type: 'base64', data: '...', media_type: 'image/png' } },
*       ]);
*     }
*     return 'success';
*   },
* };
* ```
*/
var ToolError = class extends Error {
	constructor(content) {
		const message = typeof content === "string" ? content : content.map((block) => {
			if (block.type === "text") return block.text;
			return `[${block.type}]`;
		}).join(" ");
		super(message);
		this.name = "ToolError";
		this.content = content;
	}
};
const DEFAULT_SUMMARY_PROMPT = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
1. Task Overview
The user's core request and success criteria
Any clarifications or constraints they specified
2. Current State
What has been completed so far
Files created, modified, or analyzed (with paths if relevant)
Key outputs or artifacts produced
3. Important Discoveries
Technical constraints or requirements uncovered
Decisions made and their rationale
Errors encountered and how they were resolved
What approaches were tried that didn't work (and why)
4. Next Steps
Specific actions needed to complete the task
Any blockers or open questions to resolve
Priority order if multiple steps remain
5. Context to Preserve
User preferences or style requirements
Domain-specific details that aren't obvious
Any promises made to the user
Be concise but complete—err on the side of including information that would prevent duplicate work or repeated mistakes. Write in a way that enables immediate resumption of the task.
Wrap your summary in <summary></summary> tags.`;
//#endregion
//#region node_modules/@anthropic-ai/sdk/lib/tools/BetaToolRunner.mjs
var _BetaToolRunner_instances, _BetaToolRunner_consumed, _BetaToolRunner_mutated, _BetaToolRunner_state, _BetaToolRunner_options, _BetaToolRunner_message, _BetaToolRunner_toolResponse, _BetaToolRunner_completion, _BetaToolRunner_iterationCount, _BetaToolRunner_checkAndCompact, _BetaToolRunner_generateToolResponse;
/**
* Just Promise.withResolvers(), which is not available in all environments.
*/
function promiseWithResolvers() {
	let resolve;
	let reject;
	return {
		promise: new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		}),
		resolve,
		reject
	};
}
/**
* A ToolRunner handles the automatic conversation loop between the assistant and tools.
*
* A ToolRunner is an async iterable that yields either BetaMessage or BetaMessageStream objects
* depending on the streaming configuration.
*/
var BetaToolRunner = class {
	constructor(client, params, options) {
		_BetaToolRunner_instances.add(this);
		this.client = client;
		/** Whether the async iterator has been consumed */
		_BetaToolRunner_consumed.set(this, false);
		/** Whether parameters have been mutated since the last API call */
		_BetaToolRunner_mutated.set(this, false);
		/** Current state containing the request parameters */
		_BetaToolRunner_state.set(this, void 0);
		_BetaToolRunner_options.set(this, void 0);
		/** Promise for the last message received from the assistant */
		_BetaToolRunner_message.set(this, void 0);
		/** Cached tool response to avoid redundant executions */
		_BetaToolRunner_toolResponse.set(this, void 0);
		/** Promise resolvers for waiting on completion */
		_BetaToolRunner_completion.set(this, void 0);
		/** Number of iterations (API requests) made so far */
		_BetaToolRunner_iterationCount.set(this, 0);
		__classPrivateFieldSet(this, _BetaToolRunner_state, { params: {
			...params,
			messages: structuredClone(params.messages)
		} }, "f");
		const helperValue = ["BetaToolRunner", ...collectStainlessHelpers(params.tools, params.messages)].join(", ");
		__classPrivateFieldSet(this, _BetaToolRunner_options, {
			...options,
			headers: buildHeaders([{ "x-stainless-helper": helperValue }, options?.headers])
		}, "f");
		__classPrivateFieldSet(this, _BetaToolRunner_completion, promiseWithResolvers(), "f");
	}
	async *[(_BetaToolRunner_consumed = /* @__PURE__ */ new WeakMap(), _BetaToolRunner_mutated = /* @__PURE__ */ new WeakMap(), _BetaToolRunner_state = /* @__PURE__ */ new WeakMap(), _BetaToolRunner_options = /* @__PURE__ */ new WeakMap(), _BetaToolRunner_message = /* @__PURE__ */ new WeakMap(), _BetaToolRunner_toolResponse = /* @__PURE__ */ new WeakMap(), _BetaToolRunner_completion = /* @__PURE__ */ new WeakMap(), _BetaToolRunner_iterationCount = /* @__PURE__ */ new WeakMap(), _BetaToolRunner_instances = /* @__PURE__ */ new WeakSet(), _BetaToolRunner_checkAndCompact = async function _BetaToolRunner_checkAndCompact() {
		const compactionControl = __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.compactionControl;
		if (!compactionControl || !compactionControl.enabled) return false;
		let tokensUsed = 0;
		if (__classPrivateFieldGet(this, _BetaToolRunner_message, "f") !== void 0) try {
			const message = await __classPrivateFieldGet(this, _BetaToolRunner_message, "f");
			tokensUsed = message.usage.input_tokens + (message.usage.cache_creation_input_tokens ?? 0) + (message.usage.cache_read_input_tokens ?? 0) + message.usage.output_tokens;
		} catch {
			return false;
		}
		const threshold = compactionControl.contextTokenThreshold ?? 1e5;
		if (tokensUsed < threshold) return false;
		const model = compactionControl.model ?? __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.model;
		const summaryPrompt = compactionControl.summaryPrompt ?? DEFAULT_SUMMARY_PROMPT;
		const messages = __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages;
		if (messages[messages.length - 1].role === "assistant") {
			const lastMessage = messages[messages.length - 1];
			if (Array.isArray(lastMessage.content)) {
				const nonToolBlocks = lastMessage.content.filter((block) => block.type !== "tool_use");
				if (nonToolBlocks.length === 0) messages.pop();
				else lastMessage.content = nonToolBlocks;
			}
		}
		const response = await this.client.beta.messages.create({
			model,
			messages: [...messages, {
				role: "user",
				content: [{
					type: "text",
					text: summaryPrompt
				}]
			}],
			max_tokens: __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.max_tokens
		}, { headers: { "x-stainless-helper": "compaction" } });
		if (response.content[0]?.type !== "text") throw new AnthropicError("Expected text response for compaction");
		__classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages = [{
			role: "user",
			content: response.content
		}];
		return true;
	}, Symbol.asyncIterator)]() {
		var _a;
		if (__classPrivateFieldGet(this, _BetaToolRunner_consumed, "f")) throw new AnthropicError("Cannot iterate over a consumed stream");
		__classPrivateFieldSet(this, _BetaToolRunner_consumed, true, "f");
		__classPrivateFieldSet(this, _BetaToolRunner_mutated, true, "f");
		__classPrivateFieldSet(this, _BetaToolRunner_toolResponse, void 0, "f");
		try {
			while (true) {
				let stream;
				try {
					if (__classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.max_iterations && __classPrivateFieldGet(this, _BetaToolRunner_iterationCount, "f") >= __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.max_iterations) break;
					__classPrivateFieldSet(this, _BetaToolRunner_mutated, false, "f");
					__classPrivateFieldSet(this, _BetaToolRunner_toolResponse, void 0, "f");
					__classPrivateFieldSet(this, _BetaToolRunner_iterationCount, (_a = __classPrivateFieldGet(this, _BetaToolRunner_iterationCount, "f"), _a++, _a), "f");
					__classPrivateFieldSet(this, _BetaToolRunner_message, void 0, "f");
					const { max_iterations, compactionControl, ...params } = __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params;
					if (params.stream) {
						stream = this.client.beta.messages.stream({ ...params }, __classPrivateFieldGet(this, _BetaToolRunner_options, "f"));
						__classPrivateFieldSet(this, _BetaToolRunner_message, stream.finalMessage(), "f");
						__classPrivateFieldGet(this, _BetaToolRunner_message, "f").catch(() => {});
						yield stream;
					} else {
						__classPrivateFieldSet(this, _BetaToolRunner_message, this.client.beta.messages.create({
							...params,
							stream: false
						}, __classPrivateFieldGet(this, _BetaToolRunner_options, "f")), "f");
						yield __classPrivateFieldGet(this, _BetaToolRunner_message, "f");
					}
					if (!await __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_checkAndCompact).call(this)) {
						if (!__classPrivateFieldGet(this, _BetaToolRunner_mutated, "f")) {
							const { role, content } = await __classPrivateFieldGet(this, _BetaToolRunner_message, "f");
							__classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages.push({
								role,
								content
							});
						}
						const toolMessage = await __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_generateToolResponse).call(this, __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages.at(-1));
						if (toolMessage) __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages.push(toolMessage);
						else if (!__classPrivateFieldGet(this, _BetaToolRunner_mutated, "f")) break;
					}
				} finally {
					if (stream) stream.abort();
				}
			}
			if (!__classPrivateFieldGet(this, _BetaToolRunner_message, "f")) throw new AnthropicError("ToolRunner concluded without a message from the server");
			__classPrivateFieldGet(this, _BetaToolRunner_completion, "f").resolve(await __classPrivateFieldGet(this, _BetaToolRunner_message, "f"));
		} catch (error) {
			__classPrivateFieldSet(this, _BetaToolRunner_consumed, false, "f");
			__classPrivateFieldGet(this, _BetaToolRunner_completion, "f").promise.catch(() => {});
			__classPrivateFieldGet(this, _BetaToolRunner_completion, "f").reject(error);
			__classPrivateFieldSet(this, _BetaToolRunner_completion, promiseWithResolvers(), "f");
			throw error;
		}
	}
	setMessagesParams(paramsOrMutator) {
		if (typeof paramsOrMutator === "function") __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params = paramsOrMutator(__classPrivateFieldGet(this, _BetaToolRunner_state, "f").params);
		else __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params = paramsOrMutator;
		__classPrivateFieldSet(this, _BetaToolRunner_mutated, true, "f");
		__classPrivateFieldSet(this, _BetaToolRunner_toolResponse, void 0, "f");
	}
	/**
	* Get the tool response for the last message from the assistant.
	* Avoids redundant tool executions by caching results.
	*
	* @returns A promise that resolves to a BetaMessageParam containing tool results, or null if no tools need to be executed
	*
	* @example
	* const toolResponse = await runner.generateToolResponse();
	* if (toolResponse) {
	*   console.log('Tool results:', toolResponse.content);
	* }
	*/
	async generateToolResponse() {
		const message = await __classPrivateFieldGet(this, _BetaToolRunner_message, "f") ?? this.params.messages.at(-1);
		if (!message) return null;
		return __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_generateToolResponse).call(this, message);
	}
	/**
	* Wait for the async iterator to complete. This works even if the async iterator hasn't yet started, and
	* will wait for an instance to start and go to completion.
	*
	* @returns A promise that resolves to the final BetaMessage when the iterator completes
	*
	* @example
	* // Start consuming the iterator
	* for await (const message of runner) {
	*   console.log('Message:', message.content);
	* }
	*
	* // Meanwhile, wait for completion from another part of the code
	* const finalMessage = await runner.done();
	* console.log('Final response:', finalMessage.content);
	*/
	done() {
		return __classPrivateFieldGet(this, _BetaToolRunner_completion, "f").promise;
	}
	/**
	* Returns a promise indicating that the stream is done. Unlike .done(), this will eagerly read the stream:
	* * If the iterator has not been consumed, consume the entire iterator and return the final message from the
	* assistant.
	* * If the iterator has been consumed, waits for it to complete and returns the final message.
	*
	* @returns A promise that resolves to the final BetaMessage from the conversation
	* @throws {AnthropicError} If no messages were processed during the conversation
	*
	* @example
	* const finalMessage = await runner.runUntilDone();
	* console.log('Final response:', finalMessage.content);
	*/
	async runUntilDone() {
		if (!__classPrivateFieldGet(this, _BetaToolRunner_consumed, "f")) for await (const _ of this);
		return this.done();
	}
	/**
	* Get the current parameters being used by the ToolRunner.
	*
	* @returns A readonly view of the current ToolRunnerParams
	*
	* @example
	* const currentParams = runner.params;
	* console.log('Current model:', currentParams.model);
	* console.log('Message count:', currentParams.messages.length);
	*/
	get params() {
		return __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params;
	}
	/**
	* Add one or more messages to the conversation history.
	*
	* @param messages - One or more BetaMessageParam objects to add to the conversation
	*
	* @example
	* runner.pushMessages(
	*   { role: 'user', content: 'Also, what about the weather in NYC?' }
	* );
	*
	* @example
	* // Adding multiple messages
	* runner.pushMessages(
	*   { role: 'user', content: 'What about NYC?' },
	*   { role: 'user', content: 'And Boston?' }
	* );
	*/
	pushMessages(...messages) {
		this.setMessagesParams((params) => ({
			...params,
			messages: [...params.messages, ...messages]
		}));
	}
	/**
	* Makes the ToolRunner directly awaitable, equivalent to calling .runUntilDone()
	* This allows using `await runner` instead of `await runner.runUntilDone()`
	*/
	then(onfulfilled, onrejected) {
		return this.runUntilDone().then(onfulfilled, onrejected);
	}
};
_BetaToolRunner_generateToolResponse = async function _BetaToolRunner_generateToolResponse(lastMessage) {
	if (__classPrivateFieldGet(this, _BetaToolRunner_toolResponse, "f") !== void 0) return __classPrivateFieldGet(this, _BetaToolRunner_toolResponse, "f");
	__classPrivateFieldSet(this, _BetaToolRunner_toolResponse, generateToolResponse(__classPrivateFieldGet(this, _BetaToolRunner_state, "f").params, lastMessage), "f");
	return __classPrivateFieldGet(this, _BetaToolRunner_toolResponse, "f");
};
async function generateToolResponse(params, lastMessage = params.messages.at(-1)) {
	if (!lastMessage || lastMessage.role !== "assistant" || !lastMessage.content || typeof lastMessage.content === "string") return null;
	const toolUseBlocks = lastMessage.content.filter((content) => content.type === "tool_use");
	if (toolUseBlocks.length === 0) return null;
	return {
		role: "user",
		content: await Promise.all(toolUseBlocks.map(async (toolUse) => {
			const tool = params.tools.find((t) => ("name" in t ? t.name : t.mcp_server_name) === toolUse.name);
			if (!tool || !("run" in tool)) return {
				type: "tool_result",
				tool_use_id: toolUse.id,
				content: `Error: Tool '${toolUse.name}' not found`,
				is_error: true
			};
			try {
				let input = toolUse.input;
				if ("parse" in tool && tool.parse) input = tool.parse(input);
				const result = await tool.run(input);
				return {
					type: "tool_result",
					tool_use_id: toolUse.id,
					content: result
				};
			} catch (error) {
				return {
					type: "tool_result",
					tool_use_id: toolUse.id,
					content: error instanceof ToolError ? error.content : `Error: ${error instanceof Error ? error.message : String(error)}`,
					is_error: true
				};
			}
		}))
	};
}
//#endregion
//#region node_modules/@anthropic-ai/sdk/internal/decoders/jsonl.mjs
var JSONLDecoder = class JSONLDecoder {
	constructor(iterator, controller) {
		this.iterator = iterator;
		this.controller = controller;
	}
	async *decoder() {
		const lineDecoder = new LineDecoder();
		for await (const chunk of this.iterator) for (const line of lineDecoder.decode(chunk)) yield JSON.parse(line);
		for (const line of lineDecoder.flush()) yield JSON.parse(line);
	}
	[Symbol.asyncIterator]() {
		return this.decoder();
	}
	static fromResponse(response, controller) {
		if (!response.body) {
			controller.abort();
			if (typeof globalThis.navigator !== "undefined" && globalThis.navigator.product === "ReactNative") throw new AnthropicError(`The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api`);
			throw new AnthropicError(`Attempted to iterate over a response with no body`);
		}
		return new JSONLDecoder(ReadableStreamToAsyncIterable(response.body), controller);
	}
};
//#endregion
//#region node_modules/@anthropic-ai/sdk/resources/beta/messages/batches.mjs
var Batches$1 = class extends APIResource {
	/**
	* Send a batch of Message creation requests.
	*
	* The Message Batches API can be used to process multiple Messages API requests at
	* once. Once a Message Batch is created, it begins processing immediately. Batches
	* can take up to 24 hours to complete.
	*
	* Learn more about the Message Batches API in our
	* [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
	*
	* @example
	* ```ts
	* const betaMessageBatch =
	*   await client.beta.messages.batches.create({
	*     requests: [
	*       {
	*         custom_id: 'my-custom-id-1',
	*         params: {
	*           max_tokens: 1024,
	*           messages: [
	*             { content: 'Hello, world', role: 'user' },
	*           ],
	*           model: 'claude-opus-4-6',
	*         },
	*       },
	*     ],
	*   });
	* ```
	*/
	create(params, options) {
		const { betas, ...body } = params;
		return this._client.post("/v1/messages/batches?beta=true", {
			body,
			...options,
			headers: buildHeaders([{ "anthropic-beta": [...betas ?? [], "message-batches-2024-09-24"].toString() }, options?.headers])
		});
	}
	/**
	* This endpoint is idempotent and can be used to poll for Message Batch
	* completion. To access the results of a Message Batch, make a request to the
	* `results_url` field in the response.
	*
	* Learn more about the Message Batches API in our
	* [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
	*
	* @example
	* ```ts
	* const betaMessageBatch =
	*   await client.beta.messages.batches.retrieve(
	*     'message_batch_id',
	*   );
	* ```
	*/
	retrieve(messageBatchID, params = {}, options) {
		const { betas } = params ?? {};
		return this._client.get(path`/v1/messages/batches/${messageBatchID}?beta=true`, {
			...options,
			headers: buildHeaders([{ "anthropic-beta": [...betas ?? [], "message-batches-2024-09-24"].toString() }, options?.headers])
		});
	}
	/**
	* List all Message Batches within a Workspace. Most recently created batches are
	* returned first.
	*
	* Learn more about the Message Batches API in our
	* [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
	*
	* @example
	* ```ts
	* // Automatically fetches more pages as needed.
	* for await (const betaMessageBatch of client.beta.messages.batches.list()) {
	*   // ...
	* }
	* ```
	*/
	list(params = {}, options) {
		const { betas, ...query } = params ?? {};
		return this._client.getAPIList("/v1/messages/batches?beta=true", Page, {
			query,
			...options,
			headers: buildHeaders([{ "anthropic-beta": [...betas ?? [], "message-batches-2024-09-24"].toString() }, options?.headers])
		});
	}
	/**
	* Delete a Message Batch.
	*
	* Message Batches can only be deleted once they've finished processing. If you'd
	* like to delete an in-progress batch, you must first cancel it.
	*
	* Learn more about the Message Batches API in our
	* [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
	*
	* @example
	* ```ts
	* const betaDeletedMessageBatch =
	*   await client.beta.messages.batches.delete(
	*     'message_batch_id',
	*   );
	* ```
	*/
	delete(messageBatchID, params = {}, options) {
		const { betas } = params ?? {};
		return this._client.delete(path`/v1/messages/batches/${messageBatchID}?beta=true`, {
			...options,
			headers: buildHeaders([{ "anthropic-beta": [...betas ?? [], "message-batches-2024-09-24"].toString() }, options?.headers])
		});
	}
	/**
	* Batches may be canceled any time before processing ends. Once cancellation is
	* initiated, the batch enters a `canceling` state, at which time the system may
	* complete any in-progress, non-interruptible requests before finalizing
	* cancellation.
	*
	* The number of canceled requests is specified in `request_counts`. To determine
	* which requests were canceled, check the individual results within the batch.
	* Note that cancellation may not result in any canceled requests if they were
	* non-interruptible.
	*
	* Learn more about the Message Batches API in our
	* [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
	*
	* @example
	* ```ts
	* const betaMessageBatch =
	*   await client.beta.messages.batches.cancel(
	*     'message_batch_id',
	*   );
	* ```
	*/
	cancel(messageBatchID, params = {}, options) {
		const { betas } = params ?? {};
		return this._client.post(path`/v1/messages/batches/${messageBatchID}/cancel?beta=true`, {
			...options,
			headers: buildHeaders([{ "anthropic-beta": [...betas ?? [], "message-batches-2024-09-24"].toString() }, options?.headers])
		});
	}
	/**
	* Streams the results of a Message Batch as a `.jsonl` file.
	*
	* Each line in the file is a JSON object containing the result of a single request
	* in the Message Batch. Results are not guaranteed to be in the same order as
	* requests. Use the `custom_id` field to match results to requests.
	*
	* Learn more about the Message Batches API in our
	* [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
	*
	* @example
	* ```ts
	* const betaMessageBatchIndividualResponse =
	*   await client.beta.messages.batches.results(
	*     'message_batch_id',
	*   );
	* ```
	*/
	async results(messageBatchID, params = {}, options) {
		const batch = await this.retrieve(messageBatchID);
		if (!batch.results_url) throw new AnthropicError(`No batch \`results_url\`; Has it finished processing? ${batch.processing_status} - ${batch.id}`);
		const { betas } = params ?? {};
		return this._client.get(batch.results_url, {
			...options,
			headers: buildHeaders([{
				"anthropic-beta": [...betas ?? [], "message-batches-2024-09-24"].toString(),
				Accept: "application/binary"
			}, options?.headers]),
			stream: true,
			__binaryResponse: true
		})._thenUnwrap((_, props) => JSONLDecoder.fromResponse(props.response, props.controller));
	}
};
//#endregion
//#region node_modules/@anthropic-ai/sdk/resources/beta/messages/messages.mjs
const DEPRECATED_MODELS$1 = {
	"claude-1.3": "November 6th, 2024",
	"claude-1.3-100k": "November 6th, 2024",
	"claude-instant-1.1": "November 6th, 2024",
	"claude-instant-1.1-100k": "November 6th, 2024",
	"claude-instant-1.2": "November 6th, 2024",
	"claude-3-sonnet-20240229": "July 21st, 2025",
	"claude-3-opus-20240229": "January 5th, 2026",
	"claude-2.1": "July 21st, 2025",
	"claude-2.0": "July 21st, 2025",
	"claude-3-7-sonnet-latest": "February 19th, 2026",
	"claude-3-7-sonnet-20250219": "February 19th, 2026"
};
const MODELS_TO_WARN_WITH_THINKING_ENABLED$1 = ["claude-opus-4-6"];
var Messages$1 = class extends APIResource {
	constructor() {
		super(...arguments);
		this.batches = new Batches$1(this._client);
	}
	create(params, options) {
		const modifiedParams = transformOutputFormat(params);
		const { betas, ...body } = modifiedParams;
		if (body.model in DEPRECATED_MODELS$1) console.warn(`The model '${body.model}' is deprecated and will reach end-of-life on ${DEPRECATED_MODELS$1[body.model]}\nPlease migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`);
		if (body.model in MODELS_TO_WARN_WITH_THINKING_ENABLED$1 && body.thinking && body.thinking.type === "enabled") console.warn(`Using Claude with ${body.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
		let timeout = this._client._options.timeout;
		if (!body.stream && timeout == null) {
			const maxNonstreamingTokens = MODEL_NONSTREAMING_TOKENS[body.model] ?? void 0;
			timeout = this._client.calculateNonstreamingTimeout(body.max_tokens, maxNonstreamingTokens);
		}
		const helperHeader = stainlessHelperHeader(body.tools, body.messages);
		return this._client.post("/v1/messages?beta=true", {
			body,
			timeout: timeout ?? 6e5,
			...options,
			headers: buildHeaders([
				{ ...betas?.toString() != null ? { "anthropic-beta": betas?.toString() } : void 0 },
				helperHeader,
				options?.headers
			]),
			stream: modifiedParams.stream ?? false
		});
	}
	/**
	* Send a structured list of input messages with text and/or image content, along with an expected `output_format` and
	* the response will be automatically parsed and available in the `parsed_output` property of the message.
	*
	* @example
	* ```ts
	* const message = await client.beta.messages.parse({
	*   model: 'claude-3-5-sonnet-20241022',
	*   max_tokens: 1024,
	*   messages: [{ role: 'user', content: 'What is 2+2?' }],
	*   output_format: zodOutputFormat(z.object({ answer: z.number() }), 'math'),
	* });
	*
	* console.log(message.parsed_output?.answer); // 4
	* ```
	*/
	parse(params, options) {
		options = {
			...options,
			headers: buildHeaders([{ "anthropic-beta": [...params.betas ?? [], "structured-outputs-2025-12-15"].toString() }, options?.headers])
		};
		return this.create(params, options).then((message) => parseBetaMessage(message, params, { logger: this._client.logger ?? console }));
	}
	/**
	* Create a Message stream
	*/
	stream(body, options) {
		return BetaMessageStream.createMessage(this, body, options);
	}
	/**
	* Count the number of tokens in a Message.
	*
	* The Token Count API can be used to count the number of tokens in a Message,
	* including tools, images, and documents, without creating it.
	*
	* Learn more about token counting in our
	* [user guide](https://docs.claude.com/en/docs/build-with-claude/token-counting)
	*
	* @example
	* ```ts
	* const betaMessageTokensCount =
	*   await client.beta.messages.countTokens({
	*     messages: [{ content: 'string', role: 'user' }],
	*     model: 'claude-opus-4-6',
	*   });
	* ```
	*/
	countTokens(params, options) {
		const { betas, ...body } = transformOutputFormat(params);
		return this._client.post("/v1/messages/count_tokens?beta=true", {
			body,
			...options,
			headers: buildHeaders([{ "anthropic-beta": [...betas ?? [], "token-counting-2024-11-01"].toString() }, options?.headers])
		});
	}
	toolRunner(body, options) {
		return new BetaToolRunner(this._client, body, options);
	}
};
/**
* Transform deprecated output_format to output_config.format
* Returns a modified copy of the params without mutating the original
*/
function transformOutputFormat(params) {
	if (!params.output_format) return params;
	if (params.output_config?.format) throw new AnthropicError("Both output_format and output_config.format were provided. Please use only output_config.format (output_format is deprecated).");
	const { output_format, ...rest } = params;
	return {
		...rest,
		output_config: {
			...params.output_config,
			format: output_format
		}
	};
}
Messages$1.Batches = Batches$1;
Messages$1.BetaToolRunner = BetaToolRunner;
Messages$1.ToolError = ToolError;
//#endregion
//#region node_modules/@anthropic-ai/sdk/resources/beta/skills/versions.mjs
var Versions = class extends APIResource {
	/**
	* Create Skill Version
	*
	* @example
	* ```ts
	* const version = await client.beta.skills.versions.create(
	*   'skill_id',
	* );
	* ```
	*/
	create(skillID, params = {}, options) {
		const { betas, ...body } = params ?? {};
		return this._client.post(path`/v1/skills/${skillID}/versions?beta=true`, multipartFormRequestOptions({
			body,
			...options,
			headers: buildHeaders([{ "anthropic-beta": [...betas ?? [], "skills-2025-10-02"].toString() }, options?.headers])
		}, this._client));
	}
	/**
	* Get Skill Version
	*
	* @example
	* ```ts
	* const version = await client.beta.skills.versions.retrieve(
	*   'version',
	*   { skill_id: 'skill_id' },
	* );
	* ```
	*/
	retrieve(version, params, options) {
		const { skill_id, betas } = params;
		return this._client.get(path`/v1/skills/${skill_id}/versions/${version}?beta=true`, {
			...options,
			headers: buildHeaders([{ "anthropic-beta": [...betas ?? [], "skills-2025-10-02"].toString() }, options?.headers])
		});
	}
	/**
	* List Skill Versions
	*
	* @example
	* ```ts
	* // Automatically fetches more pages as needed.
	* for await (const versionListResponse of client.beta.skills.versions.list(
	*   'skill_id',
	* )) {
	*   // ...
	* }
	* ```
	*/
	list(skillID, params = {}, options) {
		const { betas, ...query } = params ?? {};
		return this._client.getAPIList(path`/v1/skills/${skillID}/versions?beta=true`, PageCursor, {
			query,
			...options,
			headers: buildHeaders([{ "anthropic-beta": [...betas ?? [], "skills-2025-10-02"].toString() }, options?.headers])
		});
	}
	/**
	* Delete Skill Version
	*
	* @example
	* ```ts
	* const version = await client.beta.skills.versions.delete(
	*   'version',
	*   { skill_id: 'skill_id' },
	* );
	* ```
	*/
	delete(version, params, options) {
		const { skill_id, betas } = params;
		return this._client.delete(path`/v1/skills/${skill_id}/versions/${version}?beta=true`, {
			...options,
			headers: buildHeaders([{ "anthropic-beta": [...betas ?? [], "skills-2025-10-02"].toString() }, options?.headers])
		});
	}
};
//#endregion
//#region node_modules/@anthropic-ai/sdk/resources/beta/skills/skills.mjs
var Skills = class extends APIResource {
	constructor() {
		super(...arguments);
		this.versions = new Versions(this._client);
	}
	/**
	* Create Skill
	*
	* @example
	* ```ts
	* const skill = await client.beta.skills.create();
	* ```
	*/
	create(params = {}, options) {
		const { betas, ...body } = params ?? {};
		return this._client.post("/v1/skills?beta=true", multipartFormRequestOptions({
			body,
			...options,
			headers: buildHeaders([{ "anthropic-beta": [...betas ?? [], "skills-2025-10-02"].toString() }, options?.headers])
		}, this._client, false));
	}
	/**
	* Get Skill
	*
	* @example
	* ```ts
	* const skill = await client.beta.skills.retrieve('skill_id');
	* ```
	*/
	retrieve(skillID, params = {}, options) {
		const { betas } = params ?? {};
		return this._client.get(path`/v1/skills/${skillID}?beta=true`, {
			...options,
			headers: buildHeaders([{ "anthropic-beta": [...betas ?? [], "skills-2025-10-02"].toString() }, options?.headers])
		});
	}
	/**
	* List Skills
	*
	* @example
	* ```ts
	* // Automatically fetches more pages as needed.
	* for await (const skillListResponse of client.beta.skills.list()) {
	*   // ...
	* }
	* ```
	*/
	list(params = {}, options) {
		const { betas, ...query } = params ?? {};
		return this._client.getAPIList("/v1/skills?beta=true", PageCursor, {
			query,
			...options,
			headers: buildHeaders([{ "anthropic-beta": [...betas ?? [], "skills-2025-10-02"].toString() }, options?.headers])
		});
	}
	/**
	* Delete Skill
	*
	* @example
	* ```ts
	* const skill = await client.beta.skills.delete('skill_id');
	* ```
	*/
	delete(skillID, params = {}, options) {
		const { betas } = params ?? {};
		return this._client.delete(path`/v1/skills/${skillID}?beta=true`, {
			...options,
			headers: buildHeaders([{ "anthropic-beta": [...betas ?? [], "skills-2025-10-02"].toString() }, options?.headers])
		});
	}
};
Skills.Versions = Versions;
//#endregion
//#region node_modules/@anthropic-ai/sdk/resources/beta/beta.mjs
var Beta = class extends APIResource {
	constructor() {
		super(...arguments);
		this.models = new Models$1(this._client);
		this.messages = new Messages$1(this._client);
		this.files = new Files(this._client);
		this.skills = new Skills(this._client);
	}
};
Beta.Models = Models$1;
Beta.Messages = Messages$1;
Beta.Files = Files;
Beta.Skills = Skills;
//#endregion
//#region node_modules/@anthropic-ai/sdk/resources/completions.mjs
var Completions = class extends APIResource {
	create(params, options) {
		const { betas, ...body } = params;
		return this._client.post("/v1/complete", {
			body,
			timeout: this._client._options.timeout ?? 6e5,
			...options,
			headers: buildHeaders([{ ...betas?.toString() != null ? { "anthropic-beta": betas?.toString() } : void 0 }, options?.headers]),
			stream: params.stream ?? false
		});
	}
};
//#endregion
//#region node_modules/@anthropic-ai/sdk/lib/parser.mjs
function getOutputFormat(params) {
	return params?.output_config?.format;
}
function maybeParseMessage(message, params, opts) {
	const outputFormat = getOutputFormat(params);
	if (!params || !("parse" in (outputFormat ?? {}))) return {
		...message,
		content: message.content.map((block) => {
			if (block.type === "text") return Object.defineProperty({ ...block }, "parsed_output", {
				value: null,
				enumerable: false
			});
			return block;
		}),
		parsed_output: null
	};
	return parseMessage(message, params, opts);
}
function parseMessage(message, params, opts) {
	let firstParsedOutput = null;
	const content = message.content.map((block) => {
		if (block.type === "text") {
			const parsedOutput = parseOutputFormat(params, block.text);
			if (firstParsedOutput === null) firstParsedOutput = parsedOutput;
			return Object.defineProperty({ ...block }, "parsed_output", {
				value: parsedOutput,
				enumerable: false
			});
		}
		return block;
	});
	return {
		...message,
		content,
		parsed_output: firstParsedOutput
	};
}
function parseOutputFormat(params, content) {
	const outputFormat = getOutputFormat(params);
	if (outputFormat?.type !== "json_schema") return null;
	try {
		if ("parse" in outputFormat) return outputFormat.parse(content);
		return JSON.parse(content);
	} catch (error) {
		throw new AnthropicError(`Failed to parse structured output: ${error}`);
	}
}
//#endregion
//#region node_modules/@anthropic-ai/sdk/lib/MessageStream.mjs
var _MessageStream_instances, _MessageStream_currentMessageSnapshot, _MessageStream_params, _MessageStream_connectedPromise, _MessageStream_resolveConnectedPromise, _MessageStream_rejectConnectedPromise, _MessageStream_endPromise, _MessageStream_resolveEndPromise, _MessageStream_rejectEndPromise, _MessageStream_listeners, _MessageStream_ended, _MessageStream_errored, _MessageStream_aborted, _MessageStream_catchingPromiseCreated, _MessageStream_response, _MessageStream_request_id, _MessageStream_logger, _MessageStream_getFinalMessage, _MessageStream_getFinalText, _MessageStream_handleError, _MessageStream_beginRequest, _MessageStream_addStreamEvent, _MessageStream_endRequest, _MessageStream_accumulateMessage;
const JSON_BUF_PROPERTY = "__json_buf";
function tracksToolInput(content) {
	return content.type === "tool_use" || content.type === "server_tool_use";
}
var MessageStream = class MessageStream {
	constructor(params, opts) {
		_MessageStream_instances.add(this);
		this.messages = [];
		this.receivedMessages = [];
		_MessageStream_currentMessageSnapshot.set(this, void 0);
		_MessageStream_params.set(this, null);
		this.controller = new AbortController();
		_MessageStream_connectedPromise.set(this, void 0);
		_MessageStream_resolveConnectedPromise.set(this, () => {});
		_MessageStream_rejectConnectedPromise.set(this, () => {});
		_MessageStream_endPromise.set(this, void 0);
		_MessageStream_resolveEndPromise.set(this, () => {});
		_MessageStream_rejectEndPromise.set(this, () => {});
		_MessageStream_listeners.set(this, {});
		_MessageStream_ended.set(this, false);
		_MessageStream_errored.set(this, false);
		_MessageStream_aborted.set(this, false);
		_MessageStream_catchingPromiseCreated.set(this, false);
		_MessageStream_response.set(this, void 0);
		_MessageStream_request_id.set(this, void 0);
		_MessageStream_logger.set(this, void 0);
		_MessageStream_handleError.set(this, (error) => {
			__classPrivateFieldSet(this, _MessageStream_errored, true, "f");
			if (isAbortError(error)) error = new APIUserAbortError();
			if (error instanceof APIUserAbortError) {
				__classPrivateFieldSet(this, _MessageStream_aborted, true, "f");
				return this._emit("abort", error);
			}
			if (error instanceof AnthropicError) return this._emit("error", error);
			if (error instanceof Error) {
				const anthropicError = new AnthropicError(error.message);
				anthropicError.cause = error;
				return this._emit("error", anthropicError);
			}
			return this._emit("error", new AnthropicError(String(error)));
		});
		__classPrivateFieldSet(this, _MessageStream_connectedPromise, new Promise((resolve, reject) => {
			__classPrivateFieldSet(this, _MessageStream_resolveConnectedPromise, resolve, "f");
			__classPrivateFieldSet(this, _MessageStream_rejectConnectedPromise, reject, "f");
		}), "f");
		__classPrivateFieldSet(this, _MessageStream_endPromise, new Promise((resolve, reject) => {
			__classPrivateFieldSet(this, _MessageStream_resolveEndPromise, resolve, "f");
			__classPrivateFieldSet(this, _MessageStream_rejectEndPromise, reject, "f");
		}), "f");
		__classPrivateFieldGet(this, _MessageStream_connectedPromise, "f").catch(() => {});
		__classPrivateFieldGet(this, _MessageStream_endPromise, "f").catch(() => {});
		__classPrivateFieldSet(this, _MessageStream_params, params, "f");
		__classPrivateFieldSet(this, _MessageStream_logger, opts?.logger ?? console, "f");
	}
	get response() {
		return __classPrivateFieldGet(this, _MessageStream_response, "f");
	}
	get request_id() {
		return __classPrivateFieldGet(this, _MessageStream_request_id, "f");
	}
	/**
	* Returns the `MessageStream` data, the raw `Response` instance and the ID of the request,
	* returned vie the `request-id` header which is useful for debugging requests and resporting
	* issues to Anthropic.
	*
	* This is the same as the `APIPromise.withResponse()` method.
	*
	* This method will raise an error if you created the stream using `MessageStream.fromReadableStream`
	* as no `Response` is available.
	*/
	async withResponse() {
		__classPrivateFieldSet(this, _MessageStream_catchingPromiseCreated, true, "f");
		const response = await __classPrivateFieldGet(this, _MessageStream_connectedPromise, "f");
		if (!response) throw new Error("Could not resolve a `Response` object");
		return {
			data: this,
			response,
			request_id: response.headers.get("request-id")
		};
	}
	/**
	* Intended for use on the frontend, consuming a stream produced with
	* `.toReadableStream()` on the backend.
	*
	* Note that messages sent to the model do not appear in `.on('message')`
	* in this context.
	*/
	static fromReadableStream(stream) {
		const runner = new MessageStream(null);
		runner._run(() => runner._fromReadableStream(stream));
		return runner;
	}
	static createMessage(messages, params, options, { logger } = {}) {
		const runner = new MessageStream(params, { logger });
		for (const message of params.messages) runner._addMessageParam(message);
		__classPrivateFieldSet(runner, _MessageStream_params, {
			...params,
			stream: true
		}, "f");
		runner._run(() => runner._createMessage(messages, {
			...params,
			stream: true
		}, {
			...options,
			headers: {
				...options?.headers,
				"X-Stainless-Helper-Method": "stream"
			}
		}));
		return runner;
	}
	_run(executor) {
		executor().then(() => {
			this._emitFinal();
			this._emit("end");
		}, __classPrivateFieldGet(this, _MessageStream_handleError, "f"));
	}
	_addMessageParam(message) {
		this.messages.push(message);
	}
	_addMessage(message, emit = true) {
		this.receivedMessages.push(message);
		if (emit) this._emit("message", message);
	}
	async _createMessage(messages, params, options) {
		const signal = options?.signal;
		let abortHandler;
		if (signal) {
			if (signal.aborted) this.controller.abort();
			abortHandler = this.controller.abort.bind(this.controller);
			signal.addEventListener("abort", abortHandler);
		}
		try {
			__classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_beginRequest).call(this);
			const { response, data: stream } = await messages.create({
				...params,
				stream: true
			}, {
				...options,
				signal: this.controller.signal
			}).withResponse();
			this._connected(response);
			for await (const event of stream) __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_addStreamEvent).call(this, event);
			if (stream.controller.signal?.aborted) throw new APIUserAbortError();
			__classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_endRequest).call(this);
		} finally {
			if (signal && abortHandler) signal.removeEventListener("abort", abortHandler);
		}
	}
	_connected(response) {
		if (this.ended) return;
		__classPrivateFieldSet(this, _MessageStream_response, response, "f");
		__classPrivateFieldSet(this, _MessageStream_request_id, response?.headers.get("request-id"), "f");
		__classPrivateFieldGet(this, _MessageStream_resolveConnectedPromise, "f").call(this, response);
		this._emit("connect");
	}
	get ended() {
		return __classPrivateFieldGet(this, _MessageStream_ended, "f");
	}
	get errored() {
		return __classPrivateFieldGet(this, _MessageStream_errored, "f");
	}
	get aborted() {
		return __classPrivateFieldGet(this, _MessageStream_aborted, "f");
	}
	abort() {
		this.controller.abort();
	}
	/**
	* Adds the listener function to the end of the listeners array for the event.
	* No checks are made to see if the listener has already been added. Multiple calls passing
	* the same combination of event and listener will result in the listener being added, and
	* called, multiple times.
	* @returns this MessageStream, so that calls can be chained
	*/
	on(event, listener) {
		(__classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] = [])).push({ listener });
		return this;
	}
	/**
	* Removes the specified listener from the listener array for the event.
	* off() will remove, at most, one instance of a listener from the listener array. If any single
	* listener has been added multiple times to the listener array for the specified event, then
	* off() must be called multiple times to remove each instance.
	* @returns this MessageStream, so that calls can be chained
	*/
	off(event, listener) {
		const listeners = __classPrivateFieldGet(this, _MessageStream_listeners, "f")[event];
		if (!listeners) return this;
		const index = listeners.findIndex((l) => l.listener === listener);
		if (index >= 0) listeners.splice(index, 1);
		return this;
	}
	/**
	* Adds a one-time listener function for the event. The next time the event is triggered,
	* this listener is removed and then invoked.
	* @returns this MessageStream, so that calls can be chained
	*/
	once(event, listener) {
		(__classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] = [])).push({
			listener,
			once: true
		});
		return this;
	}
	/**
	* This is similar to `.once()`, but returns a Promise that resolves the next time
	* the event is triggered, instead of calling a listener callback.
	* @returns a Promise that resolves the next time given event is triggered,
	* or rejects if an error is emitted.  (If you request the 'error' event,
	* returns a promise that resolves with the error).
	*
	* Example:
	*
	*   const message = await stream.emitted('message') // rejects if the stream errors
	*/
	emitted(event) {
		return new Promise((resolve, reject) => {
			__classPrivateFieldSet(this, _MessageStream_catchingPromiseCreated, true, "f");
			if (event !== "error") this.once("error", reject);
			this.once(event, resolve);
		});
	}
	async done() {
		__classPrivateFieldSet(this, _MessageStream_catchingPromiseCreated, true, "f");
		await __classPrivateFieldGet(this, _MessageStream_endPromise, "f");
	}
	get currentMessage() {
		return __classPrivateFieldGet(this, _MessageStream_currentMessageSnapshot, "f");
	}
	/**
	* @returns a promise that resolves with the the final assistant Message response,
	* or rejects if an error occurred or the stream ended prematurely without producing a Message.
	* If structured outputs were used, this will be a ParsedMessage with a `parsed_output` field.
	*/
	async finalMessage() {
		await this.done();
		return __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_getFinalMessage).call(this);
	}
	/**
	* @returns a promise that resolves with the the final assistant Message's text response, concatenated
	* together if there are more than one text blocks.
	* Rejects if an error occurred or the stream ended prematurely without producing a Message.
	*/
	async finalText() {
		await this.done();
		return __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_getFinalText).call(this);
	}
	_emit(event, ...args) {
		if (__classPrivateFieldGet(this, _MessageStream_ended, "f")) return;
		if (event === "end") {
			__classPrivateFieldSet(this, _MessageStream_ended, true, "f");
			__classPrivateFieldGet(this, _MessageStream_resolveEndPromise, "f").call(this);
		}
		const listeners = __classPrivateFieldGet(this, _MessageStream_listeners, "f")[event];
		if (listeners) {
			__classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] = listeners.filter((l) => !l.once);
			listeners.forEach(({ listener }) => listener(...args));
		}
		if (event === "abort") {
			const error = args[0];
			if (!__classPrivateFieldGet(this, _MessageStream_catchingPromiseCreated, "f") && !listeners?.length) Promise.reject(error);
			__classPrivateFieldGet(this, _MessageStream_rejectConnectedPromise, "f").call(this, error);
			__classPrivateFieldGet(this, _MessageStream_rejectEndPromise, "f").call(this, error);
			this._emit("end");
			return;
		}
		if (event === "error") {
			const error = args[0];
			if (!__classPrivateFieldGet(this, _MessageStream_catchingPromiseCreated, "f") && !listeners?.length) Promise.reject(error);
			__classPrivateFieldGet(this, _MessageStream_rejectConnectedPromise, "f").call(this, error);
			__classPrivateFieldGet(this, _MessageStream_rejectEndPromise, "f").call(this, error);
			this._emit("end");
		}
	}
	_emitFinal() {
		if (this.receivedMessages.at(-1)) this._emit("finalMessage", __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_getFinalMessage).call(this));
	}
	async _fromReadableStream(readableStream, options) {
		const signal = options?.signal;
		let abortHandler;
		if (signal) {
			if (signal.aborted) this.controller.abort();
			abortHandler = this.controller.abort.bind(this.controller);
			signal.addEventListener("abort", abortHandler);
		}
		try {
			__classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_beginRequest).call(this);
			this._connected(null);
			const stream = Stream.fromReadableStream(readableStream, this.controller);
			for await (const event of stream) __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_addStreamEvent).call(this, event);
			if (stream.controller.signal?.aborted) throw new APIUserAbortError();
			__classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_endRequest).call(this);
		} finally {
			if (signal && abortHandler) signal.removeEventListener("abort", abortHandler);
		}
	}
	[(_MessageStream_currentMessageSnapshot = /* @__PURE__ */ new WeakMap(), _MessageStream_params = /* @__PURE__ */ new WeakMap(), _MessageStream_connectedPromise = /* @__PURE__ */ new WeakMap(), _MessageStream_resolveConnectedPromise = /* @__PURE__ */ new WeakMap(), _MessageStream_rejectConnectedPromise = /* @__PURE__ */ new WeakMap(), _MessageStream_endPromise = /* @__PURE__ */ new WeakMap(), _MessageStream_resolveEndPromise = /* @__PURE__ */ new WeakMap(), _MessageStream_rejectEndPromise = /* @__PURE__ */ new WeakMap(), _MessageStream_listeners = /* @__PURE__ */ new WeakMap(), _MessageStream_ended = /* @__PURE__ */ new WeakMap(), _MessageStream_errored = /* @__PURE__ */ new WeakMap(), _MessageStream_aborted = /* @__PURE__ */ new WeakMap(), _MessageStream_catchingPromiseCreated = /* @__PURE__ */ new WeakMap(), _MessageStream_response = /* @__PURE__ */ new WeakMap(), _MessageStream_request_id = /* @__PURE__ */ new WeakMap(), _MessageStream_logger = /* @__PURE__ */ new WeakMap(), _MessageStream_handleError = /* @__PURE__ */ new WeakMap(), _MessageStream_instances = /* @__PURE__ */ new WeakSet(), _MessageStream_getFinalMessage = function _MessageStream_getFinalMessage() {
		if (this.receivedMessages.length === 0) throw new AnthropicError("stream ended without producing a Message with role=assistant");
		return this.receivedMessages.at(-1);
	}, _MessageStream_getFinalText = function _MessageStream_getFinalText() {
		if (this.receivedMessages.length === 0) throw new AnthropicError("stream ended without producing a Message with role=assistant");
		const textBlocks = this.receivedMessages.at(-1).content.filter((block) => block.type === "text").map((block) => block.text);
		if (textBlocks.length === 0) throw new AnthropicError("stream ended without producing a content block with type=text");
		return textBlocks.join(" ");
	}, _MessageStream_beginRequest = function _MessageStream_beginRequest() {
		if (this.ended) return;
		__classPrivateFieldSet(this, _MessageStream_currentMessageSnapshot, void 0, "f");
	}, _MessageStream_addStreamEvent = function _MessageStream_addStreamEvent(event) {
		if (this.ended) return;
		const messageSnapshot = __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_accumulateMessage).call(this, event);
		this._emit("streamEvent", event, messageSnapshot);
		switch (event.type) {
			case "content_block_delta": {
				const content = messageSnapshot.content.at(-1);
				switch (event.delta.type) {
					case "text_delta":
						if (content.type === "text") this._emit("text", event.delta.text, content.text || "");
						break;
					case "citations_delta":
						if (content.type === "text") this._emit("citation", event.delta.citation, content.citations ?? []);
						break;
					case "input_json_delta":
						if (tracksToolInput(content) && content.input) this._emit("inputJson", event.delta.partial_json, content.input);
						break;
					case "thinking_delta":
						if (content.type === "thinking") this._emit("thinking", event.delta.thinking, content.thinking);
						break;
					case "signature_delta":
						if (content.type === "thinking") this._emit("signature", content.signature);
						break;
					default: checkNever(event.delta);
				}
				break;
			}
			case "message_stop":
				this._addMessageParam(messageSnapshot);
				this._addMessage(maybeParseMessage(messageSnapshot, __classPrivateFieldGet(this, _MessageStream_params, "f"), { logger: __classPrivateFieldGet(this, _MessageStream_logger, "f") }), true);
				break;
			case "content_block_stop":
				this._emit("contentBlock", messageSnapshot.content.at(-1));
				break;
			case "message_start":
				__classPrivateFieldSet(this, _MessageStream_currentMessageSnapshot, messageSnapshot, "f");
				break;
			case "content_block_start":
			case "message_delta": break;
		}
	}, _MessageStream_endRequest = function _MessageStream_endRequest() {
		if (this.ended) throw new AnthropicError(`stream has ended, this shouldn't happen`);
		const snapshot = __classPrivateFieldGet(this, _MessageStream_currentMessageSnapshot, "f");
		if (!snapshot) throw new AnthropicError(`request ended without sending any chunks`);
		__classPrivateFieldSet(this, _MessageStream_currentMessageSnapshot, void 0, "f");
		return maybeParseMessage(snapshot, __classPrivateFieldGet(this, _MessageStream_params, "f"), { logger: __classPrivateFieldGet(this, _MessageStream_logger, "f") });
	}, _MessageStream_accumulateMessage = function _MessageStream_accumulateMessage(event) {
		let snapshot = __classPrivateFieldGet(this, _MessageStream_currentMessageSnapshot, "f");
		if (event.type === "message_start") {
			if (snapshot) throw new AnthropicError(`Unexpected event order, got ${event.type} before receiving "message_stop"`);
			return event.message;
		}
		if (!snapshot) throw new AnthropicError(`Unexpected event order, got ${event.type} before "message_start"`);
		switch (event.type) {
			case "message_stop": return snapshot;
			case "message_delta":
				snapshot.stop_reason = event.delta.stop_reason;
				snapshot.stop_sequence = event.delta.stop_sequence;
				snapshot.usage.output_tokens = event.usage.output_tokens;
				if (event.usage.input_tokens != null) snapshot.usage.input_tokens = event.usage.input_tokens;
				if (event.usage.cache_creation_input_tokens != null) snapshot.usage.cache_creation_input_tokens = event.usage.cache_creation_input_tokens;
				if (event.usage.cache_read_input_tokens != null) snapshot.usage.cache_read_input_tokens = event.usage.cache_read_input_tokens;
				if (event.usage.server_tool_use != null) snapshot.usage.server_tool_use = event.usage.server_tool_use;
				return snapshot;
			case "content_block_start":
				snapshot.content.push({ ...event.content_block });
				return snapshot;
			case "content_block_delta": {
				const snapshotContent = snapshot.content.at(event.index);
				switch (event.delta.type) {
					case "text_delta":
						if (snapshotContent?.type === "text") snapshot.content[event.index] = {
							...snapshotContent,
							text: (snapshotContent.text || "") + event.delta.text
						};
						break;
					case "citations_delta":
						if (snapshotContent?.type === "text") snapshot.content[event.index] = {
							...snapshotContent,
							citations: [...snapshotContent.citations ?? [], event.delta.citation]
						};
						break;
					case "input_json_delta":
						if (snapshotContent && tracksToolInput(snapshotContent)) {
							let jsonBuf = snapshotContent[JSON_BUF_PROPERTY] || "";
							jsonBuf += event.delta.partial_json;
							const newContent = { ...snapshotContent };
							Object.defineProperty(newContent, JSON_BUF_PROPERTY, {
								value: jsonBuf,
								enumerable: false,
								writable: true
							});
							if (jsonBuf) newContent.input = partialParse(jsonBuf);
							snapshot.content[event.index] = newContent;
						}
						break;
					case "thinking_delta":
						if (snapshotContent?.type === "thinking") snapshot.content[event.index] = {
							...snapshotContent,
							thinking: snapshotContent.thinking + event.delta.thinking
						};
						break;
					case "signature_delta":
						if (snapshotContent?.type === "thinking") snapshot.content[event.index] = {
							...snapshotContent,
							signature: event.delta.signature
						};
						break;
					default: checkNever(event.delta);
				}
				return snapshot;
			}
			case "content_block_stop": return snapshot;
		}
	}, Symbol.asyncIterator)]() {
		const pushQueue = [];
		const readQueue = [];
		let done = false;
		this.on("streamEvent", (event) => {
			const reader = readQueue.shift();
			if (reader) reader.resolve(event);
			else pushQueue.push(event);
		});
		this.on("end", () => {
			done = true;
			for (const reader of readQueue) reader.resolve(void 0);
			readQueue.length = 0;
		});
		this.on("abort", (err) => {
			done = true;
			for (const reader of readQueue) reader.reject(err);
			readQueue.length = 0;
		});
		this.on("error", (err) => {
			done = true;
			for (const reader of readQueue) reader.reject(err);
			readQueue.length = 0;
		});
		return {
			next: async () => {
				if (!pushQueue.length) {
					if (done) return {
						value: void 0,
						done: true
					};
					return new Promise((resolve, reject) => readQueue.push({
						resolve,
						reject
					})).then((chunk) => chunk ? {
						value: chunk,
						done: false
					} : {
						value: void 0,
						done: true
					});
				}
				return {
					value: pushQueue.shift(),
					done: false
				};
			},
			return: async () => {
				this.abort();
				return {
					value: void 0,
					done: true
				};
			}
		};
	}
	toReadableStream() {
		return new Stream(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
	}
};
function checkNever(x) {}
//#endregion
//#region node_modules/@anthropic-ai/sdk/resources/messages/batches.mjs
var Batches = class extends APIResource {
	/**
	* Send a batch of Message creation requests.
	*
	* The Message Batches API can be used to process multiple Messages API requests at
	* once. Once a Message Batch is created, it begins processing immediately. Batches
	* can take up to 24 hours to complete.
	*
	* Learn more about the Message Batches API in our
	* [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
	*
	* @example
	* ```ts
	* const messageBatch = await client.messages.batches.create({
	*   requests: [
	*     {
	*       custom_id: 'my-custom-id-1',
	*       params: {
	*         max_tokens: 1024,
	*         messages: [
	*           { content: 'Hello, world', role: 'user' },
	*         ],
	*         model: 'claude-opus-4-6',
	*       },
	*     },
	*   ],
	* });
	* ```
	*/
	create(body, options) {
		return this._client.post("/v1/messages/batches", {
			body,
			...options
		});
	}
	/**
	* This endpoint is idempotent and can be used to poll for Message Batch
	* completion. To access the results of a Message Batch, make a request to the
	* `results_url` field in the response.
	*
	* Learn more about the Message Batches API in our
	* [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
	*
	* @example
	* ```ts
	* const messageBatch = await client.messages.batches.retrieve(
	*   'message_batch_id',
	* );
	* ```
	*/
	retrieve(messageBatchID, options) {
		return this._client.get(path`/v1/messages/batches/${messageBatchID}`, options);
	}
	/**
	* List all Message Batches within a Workspace. Most recently created batches are
	* returned first.
	*
	* Learn more about the Message Batches API in our
	* [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
	*
	* @example
	* ```ts
	* // Automatically fetches more pages as needed.
	* for await (const messageBatch of client.messages.batches.list()) {
	*   // ...
	* }
	* ```
	*/
	list(query = {}, options) {
		return this._client.getAPIList("/v1/messages/batches", Page, {
			query,
			...options
		});
	}
	/**
	* Delete a Message Batch.
	*
	* Message Batches can only be deleted once they've finished processing. If you'd
	* like to delete an in-progress batch, you must first cancel it.
	*
	* Learn more about the Message Batches API in our
	* [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
	*
	* @example
	* ```ts
	* const deletedMessageBatch =
	*   await client.messages.batches.delete('message_batch_id');
	* ```
	*/
	delete(messageBatchID, options) {
		return this._client.delete(path`/v1/messages/batches/${messageBatchID}`, options);
	}
	/**
	* Batches may be canceled any time before processing ends. Once cancellation is
	* initiated, the batch enters a `canceling` state, at which time the system may
	* complete any in-progress, non-interruptible requests before finalizing
	* cancellation.
	*
	* The number of canceled requests is specified in `request_counts`. To determine
	* which requests were canceled, check the individual results within the batch.
	* Note that cancellation may not result in any canceled requests if they were
	* non-interruptible.
	*
	* Learn more about the Message Batches API in our
	* [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
	*
	* @example
	* ```ts
	* const messageBatch = await client.messages.batches.cancel(
	*   'message_batch_id',
	* );
	* ```
	*/
	cancel(messageBatchID, options) {
		return this._client.post(path`/v1/messages/batches/${messageBatchID}/cancel`, options);
	}
	/**
	* Streams the results of a Message Batch as a `.jsonl` file.
	*
	* Each line in the file is a JSON object containing the result of a single request
	* in the Message Batch. Results are not guaranteed to be in the same order as
	* requests. Use the `custom_id` field to match results to requests.
	*
	* Learn more about the Message Batches API in our
	* [user guide](https://docs.claude.com/en/docs/build-with-claude/batch-processing)
	*
	* @example
	* ```ts
	* const messageBatchIndividualResponse =
	*   await client.messages.batches.results('message_batch_id');
	* ```
	*/
	async results(messageBatchID, options) {
		const batch = await this.retrieve(messageBatchID);
		if (!batch.results_url) throw new AnthropicError(`No batch \`results_url\`; Has it finished processing? ${batch.processing_status} - ${batch.id}`);
		return this._client.get(batch.results_url, {
			...options,
			headers: buildHeaders([{ Accept: "application/binary" }, options?.headers]),
			stream: true,
			__binaryResponse: true
		})._thenUnwrap((_, props) => JSONLDecoder.fromResponse(props.response, props.controller));
	}
};
//#endregion
//#region node_modules/@anthropic-ai/sdk/resources/messages/messages.mjs
var Messages = class extends APIResource {
	constructor() {
		super(...arguments);
		this.batches = new Batches(this._client);
	}
	create(body, options) {
		if (body.model in DEPRECATED_MODELS) console.warn(`The model '${body.model}' is deprecated and will reach end-of-life on ${DEPRECATED_MODELS[body.model]}\nPlease migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`);
		if (body.model in MODELS_TO_WARN_WITH_THINKING_ENABLED && body.thinking && body.thinking.type === "enabled") console.warn(`Using Claude with ${body.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
		let timeout = this._client._options.timeout;
		if (!body.stream && timeout == null) {
			const maxNonstreamingTokens = MODEL_NONSTREAMING_TOKENS[body.model] ?? void 0;
			timeout = this._client.calculateNonstreamingTimeout(body.max_tokens, maxNonstreamingTokens);
		}
		const helperHeader = stainlessHelperHeader(body.tools, body.messages);
		return this._client.post("/v1/messages", {
			body,
			timeout: timeout ?? 6e5,
			...options,
			headers: buildHeaders([helperHeader, options?.headers]),
			stream: body.stream ?? false
		});
	}
	/**
	* Send a structured list of input messages with text and/or image content, along with an expected `output_config.format` and
	* the response will be automatically parsed and available in the `parsed_output` property of the message.
	*
	* @example
	* ```ts
	* const message = await client.messages.parse({
	*   model: 'claude-sonnet-4-5-20250929',
	*   max_tokens: 1024,
	*   messages: [{ role: 'user', content: 'What is 2+2?' }],
	*   output_config: {
	*     format: zodOutputFormat(z.object({ answer: z.number() })),
	*   },
	* });
	*
	* console.log(message.parsed_output?.answer); // 4
	* ```
	*/
	parse(params, options) {
		return this.create(params, options).then((message) => parseMessage(message, params, { logger: this._client.logger ?? console }));
	}
	/**
	* Create a Message stream.
	*
	* If `output_config.format` is provided with a parseable format (like `zodOutputFormat()`),
	* the final message will include a `parsed_output` property with the parsed content.
	*
	* @example
	* ```ts
	* const stream = client.messages.stream({
	*   model: 'claude-sonnet-4-5-20250929',
	*   max_tokens: 1024,
	*   messages: [{ role: 'user', content: 'What is 2+2?' }],
	*   output_config: {
	*     format: zodOutputFormat(z.object({ answer: z.number() })),
	*   },
	* });
	*
	* const message = await stream.finalMessage();
	* console.log(message.parsed_output?.answer); // 4
	* ```
	*/
	stream(body, options) {
		return MessageStream.createMessage(this, body, options, { logger: this._client.logger ?? console });
	}
	/**
	* Count the number of tokens in a Message.
	*
	* The Token Count API can be used to count the number of tokens in a Message,
	* including tools, images, and documents, without creating it.
	*
	* Learn more about token counting in our
	* [user guide](https://docs.claude.com/en/docs/build-with-claude/token-counting)
	*
	* @example
	* ```ts
	* const messageTokensCount =
	*   await client.messages.countTokens({
	*     messages: [{ content: 'string', role: 'user' }],
	*     model: 'claude-opus-4-6',
	*   });
	* ```
	*/
	countTokens(body, options) {
		return this._client.post("/v1/messages/count_tokens", {
			body,
			...options
		});
	}
};
const DEPRECATED_MODELS = {
	"claude-1.3": "November 6th, 2024",
	"claude-1.3-100k": "November 6th, 2024",
	"claude-instant-1.1": "November 6th, 2024",
	"claude-instant-1.1-100k": "November 6th, 2024",
	"claude-instant-1.2": "November 6th, 2024",
	"claude-3-sonnet-20240229": "July 21st, 2025",
	"claude-3-opus-20240229": "January 5th, 2026",
	"claude-2.1": "July 21st, 2025",
	"claude-2.0": "July 21st, 2025",
	"claude-3-7-sonnet-latest": "February 19th, 2026",
	"claude-3-7-sonnet-20250219": "February 19th, 2026",
	"claude-3-5-haiku-latest": "February 19th, 2026",
	"claude-3-5-haiku-20241022": "February 19th, 2026"
};
const MODELS_TO_WARN_WITH_THINKING_ENABLED = ["claude-opus-4-6"];
Messages.Batches = Batches;
//#endregion
//#region node_modules/@anthropic-ai/sdk/resources/models.mjs
var Models = class extends APIResource {
	/**
	* Get a specific model.
	*
	* The Models API response can be used to determine information about a specific
	* model or resolve a model alias to a model ID.
	*/
	retrieve(modelID, params = {}, options) {
		const { betas } = params ?? {};
		return this._client.get(path`/v1/models/${modelID}`, {
			...options,
			headers: buildHeaders([{ ...betas?.toString() != null ? { "anthropic-beta": betas?.toString() } : void 0 }, options?.headers])
		});
	}
	/**
	* List available models.
	*
	* The Models API response can be used to determine which models are available for
	* use in the API. More recently released models are listed first.
	*/
	list(params = {}, options) {
		const { betas, ...query } = params ?? {};
		return this._client.getAPIList("/v1/models", Page, {
			query,
			...options,
			headers: buildHeaders([{ ...betas?.toString() != null ? { "anthropic-beta": betas?.toString() } : void 0 }, options?.headers])
		});
	}
};
//#endregion
//#region node_modules/@anthropic-ai/sdk/internal/utils/env.mjs
/**
* Read an environment variable.
*
* Trims beginning and trailing whitespace.
*
* Will return undefined if the environment variable doesn't exist or cannot be accessed.
*/
const readEnv = (env) => {
	if (typeof globalThis.process !== "undefined") return globalThis.process.env?.[env]?.trim() ?? void 0;
	if (typeof globalThis.Deno !== "undefined") return globalThis.Deno.env?.get?.(env)?.trim();
};
//#endregion
//#region node_modules/@anthropic-ai/sdk/client.mjs
var _BaseAnthropic_instances, _a, _BaseAnthropic_encoder, _BaseAnthropic_baseURLOverridden;
const HUMAN_PROMPT = "\\n\\nHuman:";
const AI_PROMPT = "\\n\\nAssistant:";
/**
* Base class for Anthropic API clients.
*/
var BaseAnthropic = class {
	/**
	* API Client for interfacing with the Anthropic API.
	*
	* @param {string | null | undefined} [opts.apiKey=process.env['ANTHROPIC_API_KEY'] ?? null]
	* @param {string | null | undefined} [opts.authToken=process.env['ANTHROPIC_AUTH_TOKEN'] ?? null]
	* @param {string} [opts.baseURL=process.env['ANTHROPIC_BASE_URL'] ?? https://api.anthropic.com] - Override the default base URL for the API.
	* @param {number} [opts.timeout=10 minutes] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
	* @param {MergedRequestInit} [opts.fetchOptions] - Additional `RequestInit` options to be passed to `fetch` calls.
	* @param {Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
	* @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
	* @param {HeadersLike} opts.defaultHeaders - Default headers to include with every request to the API.
	* @param {Record<string, string | undefined>} opts.defaultQuery - Default query parameters to include with every request to the API.
	* @param {boolean} [opts.dangerouslyAllowBrowser=false] - By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
	*/
	constructor({ baseURL = readEnv("ANTHROPIC_BASE_URL"), apiKey = readEnv("ANTHROPIC_API_KEY") ?? null, authToken = readEnv("ANTHROPIC_AUTH_TOKEN") ?? null, ...opts } = {}) {
		_BaseAnthropic_instances.add(this);
		_BaseAnthropic_encoder.set(this, void 0);
		const options = {
			apiKey,
			authToken,
			...opts,
			baseURL: baseURL || `https://api.anthropic.com`
		};
		if (!options.dangerouslyAllowBrowser && isRunningInBrowser()) throw new AnthropicError("It looks like you're running in a browser-like environment.\n\nThis is disabled by default, as it risks exposing your secret API credentials to attackers.\nIf you understand the risks and have appropriate mitigations in place,\nyou can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\nnew Anthropic({ apiKey, dangerouslyAllowBrowser: true });\n");
		this.baseURL = options.baseURL;
		this.timeout = options.timeout ?? _a.DEFAULT_TIMEOUT;
		this.logger = options.logger ?? console;
		const defaultLogLevel = "warn";
		this.logLevel = defaultLogLevel;
		this.logLevel = parseLogLevel(options.logLevel, "ClientOptions.logLevel", this) ?? parseLogLevel(readEnv("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? defaultLogLevel;
		this.fetchOptions = options.fetchOptions;
		this.maxRetries = options.maxRetries ?? 2;
		this.fetch = options.fetch ?? getDefaultFetch();
		__classPrivateFieldSet(this, _BaseAnthropic_encoder, FallbackEncoder, "f");
		this._options = options;
		this.apiKey = typeof apiKey === "string" ? apiKey : null;
		this.authToken = authToken;
	}
	/**
	* Create a new client instance re-using the same options given to the current client with optional overriding.
	*/
	withOptions(options) {
		return new this.constructor({
			...this._options,
			baseURL: this.baseURL,
			maxRetries: this.maxRetries,
			timeout: this.timeout,
			logger: this.logger,
			logLevel: this.logLevel,
			fetch: this.fetch,
			fetchOptions: this.fetchOptions,
			apiKey: this.apiKey,
			authToken: this.authToken,
			...options
		});
	}
	defaultQuery() {
		return this._options.defaultQuery;
	}
	validateHeaders({ values, nulls }) {
		if (values.get("x-api-key") || values.get("authorization")) return;
		if (this.apiKey && values.get("x-api-key")) return;
		if (nulls.has("x-api-key")) return;
		if (this.authToken && values.get("authorization")) return;
		if (nulls.has("authorization")) return;
		throw new Error("Could not resolve authentication method. Expected either apiKey or authToken to be set. Or for one of the \"X-Api-Key\" or \"Authorization\" headers to be explicitly omitted");
	}
	async authHeaders(opts) {
		return buildHeaders([await this.apiKeyAuth(opts), await this.bearerAuth(opts)]);
	}
	async apiKeyAuth(opts) {
		if (this.apiKey == null) return;
		return buildHeaders([{ "X-Api-Key": this.apiKey }]);
	}
	async bearerAuth(opts) {
		if (this.authToken == null) return;
		return buildHeaders([{ Authorization: `Bearer ${this.authToken}` }]);
	}
	/**
	* Basic re-implementation of `qs.stringify` for primitive types.
	*/
	stringifyQuery(query) {
		return stringifyQuery(query);
	}
	getUserAgent() {
		return `${this.constructor.name}/JS ${VERSION}`;
	}
	defaultIdempotencyKey() {
		return `stainless-node-retry-${uuid4()}`;
	}
	makeStatusError(status, error, message, headers) {
		return APIError.generate(status, error, message, headers);
	}
	buildURL(path, query, defaultBaseURL) {
		const baseURL = !__classPrivateFieldGet(this, _BaseAnthropic_instances, "m", _BaseAnthropic_baseURLOverridden).call(this) && defaultBaseURL || this.baseURL;
		const url = isAbsoluteURL(path) ? new URL(path) : new URL(baseURL + (baseURL.endsWith("/") && path.startsWith("/") ? path.slice(1) : path));
		const defaultQuery = this.defaultQuery();
		const pathQuery = Object.fromEntries(url.searchParams);
		if (!isEmptyObj(defaultQuery) || !isEmptyObj(pathQuery)) query = {
			...pathQuery,
			...defaultQuery,
			...query
		};
		if (typeof query === "object" && query && !Array.isArray(query)) url.search = this.stringifyQuery(query);
		return url.toString();
	}
	_calculateNonstreamingTimeout(maxTokens) {
		const defaultTimeout = 600;
		if (3600 * maxTokens / 128e3 > defaultTimeout) throw new AnthropicError("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#streaming-responses for more details");
		return defaultTimeout * 1e3;
	}
	/**
	* Used as a callback for mutating the given `FinalRequestOptions` object.
	*/
	async prepareOptions(options) {}
	/**
	* Used as a callback for mutating the given `RequestInit` object.
	*
	* This is useful for cases where you want to add certain headers based off of
	* the request properties, e.g. `method` or `url`.
	*/
	async prepareRequest(request, { url, options }) {}
	get(path, opts) {
		return this.methodRequest("get", path, opts);
	}
	post(path, opts) {
		return this.methodRequest("post", path, opts);
	}
	patch(path, opts) {
		return this.methodRequest("patch", path, opts);
	}
	put(path, opts) {
		return this.methodRequest("put", path, opts);
	}
	delete(path, opts) {
		return this.methodRequest("delete", path, opts);
	}
	methodRequest(method, path, opts) {
		return this.request(Promise.resolve(opts).then((opts) => {
			return {
				method,
				path,
				...opts
			};
		}));
	}
	request(options, remainingRetries = null) {
		return new APIPromise(this, this.makeRequest(options, remainingRetries, void 0));
	}
	async makeRequest(optionsInput, retriesRemaining, retryOfRequestLogID) {
		const options = await optionsInput;
		const maxRetries = options.maxRetries ?? this.maxRetries;
		if (retriesRemaining == null) retriesRemaining = maxRetries;
		await this.prepareOptions(options);
		const { req, url, timeout } = await this.buildRequest(options, { retryCount: maxRetries - retriesRemaining });
		await this.prepareRequest(req, {
			url,
			options
		});
		/** Not an API request ID, just for correlating local log entries. */
		const requestLogID = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0");
		const retryLogStr = retryOfRequestLogID === void 0 ? "" : `, retryOf: ${retryOfRequestLogID}`;
		const startTime = Date.now();
		loggerFor(this).debug(`[${requestLogID}] sending request`, formatRequestDetails({
			retryOfRequestLogID,
			method: options.method,
			url,
			options,
			headers: req.headers
		}));
		if (options.signal?.aborted) throw new APIUserAbortError();
		const controller = new AbortController();
		const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(castToError);
		const headersTime = Date.now();
		if (response instanceof globalThis.Error) {
			const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
			if (options.signal?.aborted) throw new APIUserAbortError();
			const isTimeout = isAbortError(response) || /timed? ?out/i.test(String(response) + ("cause" in response ? String(response.cause) : ""));
			if (retriesRemaining) {
				loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} - ${retryMessage}`);
				loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} (${retryMessage})`, formatRequestDetails({
					retryOfRequestLogID,
					url,
					durationMs: headersTime - startTime,
					message: response.message
				}));
				return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID);
			}
			loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} - error; no more retries left`);
			loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} (error; no more retries left)`, formatRequestDetails({
				retryOfRequestLogID,
				url,
				durationMs: headersTime - startTime,
				message: response.message
			}));
			if (isTimeout) throw new APIConnectionTimeoutError();
			throw new APIConnectionError({ cause: response });
		}
		const responseInfo = `[${requestLogID}${retryLogStr}${[...response.headers.entries()].filter(([name]) => name === "request-id").map(([name, value]) => ", " + name + ": " + JSON.stringify(value)).join("")}] ${req.method} ${url} ${response.ok ? "succeeded" : "failed"} with status ${response.status} in ${headersTime - startTime}ms`;
		if (!response.ok) {
			const shouldRetry = await this.shouldRetry(response);
			if (retriesRemaining && shouldRetry) {
				const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
				await CancelReadableStream(response.body);
				loggerFor(this).info(`${responseInfo} - ${retryMessage}`);
				loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage})`, formatRequestDetails({
					retryOfRequestLogID,
					url: response.url,
					status: response.status,
					headers: response.headers,
					durationMs: headersTime - startTime
				}));
				return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID, response.headers);
			}
			const retryMessage = shouldRetry ? `error; no more retries left` : `error; not retryable`;
			loggerFor(this).info(`${responseInfo} - ${retryMessage}`);
			const errText = await response.text().catch((err) => castToError(err).message);
			const errJSON = safeJSON(errText);
			const errMessage = errJSON ? void 0 : errText;
			loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage})`, formatRequestDetails({
				retryOfRequestLogID,
				url: response.url,
				status: response.status,
				headers: response.headers,
				message: errMessage,
				durationMs: Date.now() - startTime
			}));
			throw this.makeStatusError(response.status, errJSON, errMessage, response.headers);
		}
		loggerFor(this).info(responseInfo);
		loggerFor(this).debug(`[${requestLogID}] response start`, formatRequestDetails({
			retryOfRequestLogID,
			url: response.url,
			status: response.status,
			headers: response.headers,
			durationMs: headersTime - startTime
		}));
		return {
			response,
			options,
			controller,
			requestLogID,
			retryOfRequestLogID,
			startTime
		};
	}
	getAPIList(path, Page, opts) {
		return this.requestAPIList(Page, opts && "then" in opts ? opts.then((opts) => ({
			method: "get",
			path,
			...opts
		})) : {
			method: "get",
			path,
			...opts
		});
	}
	requestAPIList(Page, options) {
		const request = this.makeRequest(options, null, void 0);
		return new PagePromise(this, request, Page);
	}
	async fetchWithTimeout(url, init, ms, controller) {
		const { signal, method, ...options } = init || {};
		const abort = this._makeAbort(controller);
		if (signal) signal.addEventListener("abort", abort, { once: true });
		const timeout = setTimeout(abort, ms);
		const isReadableBody = globalThis.ReadableStream && options.body instanceof globalThis.ReadableStream || typeof options.body === "object" && options.body !== null && Symbol.asyncIterator in options.body;
		const fetchOptions = {
			signal: controller.signal,
			...isReadableBody ? { duplex: "half" } : {},
			method: "GET",
			...options
		};
		if (method) fetchOptions.method = method.toUpperCase();
		try {
			return await this.fetch.call(void 0, url, fetchOptions);
		} finally {
			clearTimeout(timeout);
		}
	}
	async shouldRetry(response) {
		const shouldRetryHeader = response.headers.get("x-should-retry");
		if (shouldRetryHeader === "true") return true;
		if (shouldRetryHeader === "false") return false;
		if (response.status === 408) return true;
		if (response.status === 409) return true;
		if (response.status === 429) return true;
		if (response.status >= 500) return true;
		return false;
	}
	async retryRequest(options, retriesRemaining, requestLogID, responseHeaders) {
		let timeoutMillis;
		const retryAfterMillisHeader = responseHeaders?.get("retry-after-ms");
		if (retryAfterMillisHeader) {
			const timeoutMs = parseFloat(retryAfterMillisHeader);
			if (!Number.isNaN(timeoutMs)) timeoutMillis = timeoutMs;
		}
		const retryAfterHeader = responseHeaders?.get("retry-after");
		if (retryAfterHeader && !timeoutMillis) {
			const timeoutSeconds = parseFloat(retryAfterHeader);
			if (!Number.isNaN(timeoutSeconds)) timeoutMillis = timeoutSeconds * 1e3;
			else timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
		}
		if (timeoutMillis === void 0) {
			const maxRetries = options.maxRetries ?? this.maxRetries;
			timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
		}
		await sleep(timeoutMillis);
		return this.makeRequest(options, retriesRemaining - 1, requestLogID);
	}
	calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries) {
		const initialRetryDelay = .5;
		const maxRetryDelay = 8;
		const numRetries = maxRetries - retriesRemaining;
		return Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay) * (1 - Math.random() * .25) * 1e3;
	}
	calculateNonstreamingTimeout(maxTokens, maxNonstreamingTokens) {
		const maxTime = 3600 * 1e3;
		const defaultTime = 600 * 1e3;
		if (maxTime * maxTokens / 128e3 > defaultTime || maxNonstreamingTokens != null && maxTokens > maxNonstreamingTokens) throw new AnthropicError("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details");
		return defaultTime;
	}
	async buildRequest(inputOptions, { retryCount = 0 } = {}) {
		const options = { ...inputOptions };
		const { method, path, query, defaultBaseURL } = options;
		const url = this.buildURL(path, query, defaultBaseURL);
		if ("timeout" in options) validatePositiveInteger("timeout", options.timeout);
		options.timeout = options.timeout ?? this.timeout;
		const { bodyHeaders, body } = this.buildBody({ options });
		return {
			req: {
				method,
				headers: await this.buildHeaders({
					options: inputOptions,
					method,
					bodyHeaders,
					retryCount
				}),
				...options.signal && { signal: options.signal },
				...globalThis.ReadableStream && body instanceof globalThis.ReadableStream && { duplex: "half" },
				...body && { body },
				...this.fetchOptions ?? {},
				...options.fetchOptions ?? {}
			},
			url,
			timeout: options.timeout
		};
	}
	async buildHeaders({ options, method, bodyHeaders, retryCount }) {
		let idempotencyHeaders = {};
		if (this.idempotencyHeader && method !== "get") {
			if (!options.idempotencyKey) options.idempotencyKey = this.defaultIdempotencyKey();
			idempotencyHeaders[this.idempotencyHeader] = options.idempotencyKey;
		}
		const headers = buildHeaders([
			idempotencyHeaders,
			{
				Accept: "application/json",
				"User-Agent": this.getUserAgent(),
				"X-Stainless-Retry-Count": String(retryCount),
				...options.timeout ? { "X-Stainless-Timeout": String(Math.trunc(options.timeout / 1e3)) } : {},
				...getPlatformHeaders(),
				...this._options.dangerouslyAllowBrowser ? { "anthropic-dangerous-direct-browser-access": "true" } : void 0,
				"anthropic-version": "2023-06-01"
			},
			await this.authHeaders(options),
			this._options.defaultHeaders,
			bodyHeaders,
			options.headers
		]);
		this.validateHeaders(headers);
		return headers.values;
	}
	_makeAbort(controller) {
		return () => controller.abort();
	}
	buildBody({ options: { body, headers: rawHeaders } }) {
		if (!body) return {
			bodyHeaders: void 0,
			body: void 0
		};
		const headers = buildHeaders([rawHeaders]);
		if (ArrayBuffer.isView(body) || body instanceof ArrayBuffer || body instanceof DataView || typeof body === "string" && headers.values.has("content-type") || globalThis.Blob && body instanceof globalThis.Blob || body instanceof FormData || body instanceof URLSearchParams || globalThis.ReadableStream && body instanceof globalThis.ReadableStream) return {
			bodyHeaders: void 0,
			body
		};
		else if (typeof body === "object" && (Symbol.asyncIterator in body || Symbol.iterator in body && "next" in body && typeof body.next === "function")) return {
			bodyHeaders: void 0,
			body: ReadableStreamFrom(body)
		};
		else if (typeof body === "object" && headers.values.get("content-type") === "application/x-www-form-urlencoded") return {
			bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
			body: this.stringifyQuery(body)
		};
		else return __classPrivateFieldGet(this, _BaseAnthropic_encoder, "f").call(this, {
			body,
			headers
		});
	}
};
_a = BaseAnthropic, _BaseAnthropic_encoder = /* @__PURE__ */ new WeakMap(), _BaseAnthropic_instances = /* @__PURE__ */ new WeakSet(), _BaseAnthropic_baseURLOverridden = function _BaseAnthropic_baseURLOverridden() {
	return this.baseURL !== "https://api.anthropic.com";
};
BaseAnthropic.Anthropic = _a;
BaseAnthropic.HUMAN_PROMPT = HUMAN_PROMPT;
BaseAnthropic.AI_PROMPT = AI_PROMPT;
BaseAnthropic.DEFAULT_TIMEOUT = 6e5;
BaseAnthropic.AnthropicError = AnthropicError;
BaseAnthropic.APIError = APIError;
BaseAnthropic.APIConnectionError = APIConnectionError;
BaseAnthropic.APIConnectionTimeoutError = APIConnectionTimeoutError;
BaseAnthropic.APIUserAbortError = APIUserAbortError;
BaseAnthropic.NotFoundError = NotFoundError;
BaseAnthropic.ConflictError = ConflictError;
BaseAnthropic.RateLimitError = RateLimitError;
BaseAnthropic.BadRequestError = BadRequestError;
BaseAnthropic.AuthenticationError = AuthenticationError;
BaseAnthropic.InternalServerError = InternalServerError;
BaseAnthropic.PermissionDeniedError = PermissionDeniedError;
BaseAnthropic.UnprocessableEntityError = UnprocessableEntityError;
BaseAnthropic.toFile = toFile;
/**
* API Client for interfacing with the Anthropic API.
*/
var Anthropic = class extends BaseAnthropic {
	constructor() {
		super(...arguments);
		this.completions = new Completions(this);
		this.messages = new Messages(this);
		this.models = new Models(this);
		this.beta = new Beta(this);
	}
};
Anthropic.Completions = Completions;
Anthropic.Messages = Messages;
Anthropic.Models = Models;
Anthropic.Beta = Beta;
//#endregion
//#region src/agents/provider-transport-fetch.ts
function buildManagedResponse(response, release) {
	if (!response.body) {
		release();
		return response;
	}
	const source = response.body;
	let reader;
	let released = false;
	const finalize = async () => {
		if (released) return;
		released = true;
		await release().catch(() => void 0);
	};
	const wrappedBody = new ReadableStream({
		start() {
			reader = source.getReader();
		},
		async pull(controller) {
			try {
				const chunk = await reader?.read();
				if (!chunk || chunk.done) {
					controller.close();
					await finalize();
					return;
				}
				controller.enqueue(chunk.value);
			} catch (error) {
				controller.error(error);
				await finalize();
			}
		},
		async cancel(reason) {
			try {
				await reader?.cancel(reason);
			} finally {
				await finalize();
			}
		}
	});
	return new Response(wrappedBody, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers
	});
}
function resolveModelRequestPolicy(model) {
	const debugProxy = resolveDebugProxySettings();
	let explicitDebugProxyUrl;
	if (debugProxy.enabled && debugProxy.proxyUrl) try {
		if (new URL(model.baseUrl).protocol === "https:") explicitDebugProxyUrl = debugProxy.proxyUrl;
	} catch {}
	const request = mergeModelProviderRequestOverrides(getModelProviderRequestTransport(model), { proxy: explicitDebugProxyUrl ? {
		mode: "explicit-proxy",
		url: explicitDebugProxyUrl
	} : void 0 });
	return resolveProviderRequestPolicyConfig({
		provider: model.provider,
		api: model.api,
		baseUrl: model.baseUrl,
		capability: "llm",
		transport: "stream",
		request,
		allowPrivateNetwork: request?.allowPrivateNetwork === true
	});
}
function buildGuardedModelFetch(model) {
	const requestConfig = resolveModelRequestPolicy(model);
	const dispatcherPolicy = buildProviderRequestDispatcherPolicy(requestConfig);
	return async (input, init) => {
		const request = input instanceof Request ? new Request(input, init) : void 0;
		const result = await fetchWithSsrFGuard({
			url: request?.url ?? (input instanceof URL ? input.toString() : typeof input === "string" ? input : (() => {
				throw new Error("Unsupported fetch input for transport-aware model request");
			})()),
			init: (request && {
				method: request.method,
				headers: request.headers,
				body: request.body ?? void 0,
				redirect: request.redirect,
				signal: request.signal,
				...request.body ? { duplex: "half" } : {}
			}) ?? init,
			capture: { meta: {
				provider: model.provider,
				api: model.api,
				model: model.id
			} },
			dispatcherPolicy,
			allowCrossOriginUnsafeRedirectReplay: false,
			...requestConfig.allowPrivateNetwork ? { policy: { allowPrivateNetwork: true } } : {}
		});
		return buildManagedResponse(result.response, result.release);
	};
}
//#endregion
//#region src/agents/transport-message-transform.ts
function appendMissingToolResults(result, pendingToolCalls, existingToolResultIds) {
	for (const toolCall of pendingToolCalls) if (!existingToolResultIds.has(toolCall.id)) result.push({
		role: "toolResult",
		toolCallId: toolCall.id,
		toolName: toolCall.name,
		content: [{
			type: "text",
			text: "No result provided"
		}],
		isError: true,
		timestamp: Date.now()
	});
}
function transformTransportMessages(messages, model, normalizeToolCallId) {
	const toolCallIdMap = /* @__PURE__ */ new Map();
	const transformed = messages.map((msg) => {
		if (msg.role === "user") return msg;
		if (msg.role === "toolResult") {
			const normalizedId = toolCallIdMap.get(msg.toolCallId);
			return normalizedId && normalizedId !== msg.toolCallId ? {
				...msg,
				toolCallId: normalizedId
			} : msg;
		}
		if (msg.role !== "assistant") return msg;
		const isSameModel = msg.provider === model.provider && msg.api === model.api && msg.model === model.id;
		const content = [];
		for (const block of msg.content) {
			if (block.type === "thinking") {
				if (block.redacted) {
					if (isSameModel) content.push(block);
					continue;
				}
				if (isSameModel && block.thinkingSignature) {
					content.push(block);
					continue;
				}
				if (!block.thinking.trim()) continue;
				content.push(isSameModel ? block : {
					type: "text",
					text: block.thinking
				});
				continue;
			}
			if (block.type === "text") {
				content.push(isSameModel ? block : {
					type: "text",
					text: block.text
				});
				continue;
			}
			if (block.type !== "toolCall") {
				content.push(block);
				continue;
			}
			let normalizedToolCall = block;
			if (!isSameModel && block.thoughtSignature) {
				normalizedToolCall = { ...normalizedToolCall };
				delete normalizedToolCall.thoughtSignature;
			}
			if (!isSameModel && normalizeToolCallId) {
				const normalizedId = normalizeToolCallId(block.id, model, msg);
				if (normalizedId !== block.id) {
					toolCallIdMap.set(block.id, normalizedId);
					normalizedToolCall = {
						...normalizedToolCall,
						id: normalizedId
					};
				}
			}
			content.push(normalizedToolCall);
		}
		return {
			...msg,
			content
		};
	});
	const result = [];
	let pendingToolCalls = [];
	let existingToolResultIds = /* @__PURE__ */ new Set();
	for (const msg of transformed) {
		if (msg.role === "assistant") {
			if (pendingToolCalls.length > 0) {
				appendMissingToolResults(result, pendingToolCalls, existingToolResultIds);
				pendingToolCalls = [];
				existingToolResultIds = /* @__PURE__ */ new Set();
			}
			if (msg.stopReason === "error" || msg.stopReason === "aborted") continue;
			const toolCalls = msg.content.filter((block) => block.type === "toolCall");
			if (toolCalls.length > 0) {
				pendingToolCalls = toolCalls.map((block) => ({
					id: block.id,
					name: block.name
				}));
				existingToolResultIds = /* @__PURE__ */ new Set();
			}
			result.push(msg);
			continue;
		}
		if (msg.role === "toolResult") {
			existingToolResultIds.add(msg.toolCallId);
			result.push(msg);
			continue;
		}
		if (pendingToolCalls.length > 0) {
			appendMissingToolResults(result, pendingToolCalls, existingToolResultIds);
			pendingToolCalls = [];
			existingToolResultIds = /* @__PURE__ */ new Set();
		}
		result.push(msg);
	}
	return result;
}
//#endregion
//#region src/agents/transport-stream-shared.ts
function sanitizeTransportPayloadText(text) {
	return text.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "");
}
function coerceTransportToolCallArguments(argumentsValue) {
	if (argumentsValue && typeof argumentsValue === "object" && !Array.isArray(argumentsValue)) return argumentsValue;
	if (typeof argumentsValue === "string") try {
		const parsed = JSON.parse(argumentsValue);
		if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
	} catch {}
	return {};
}
function mergeTransportHeaders(...headerSources) {
	const merged = {};
	for (const headers of headerSources) if (headers) Object.assign(merged, headers);
	return Object.keys(merged).length > 0 ? merged : void 0;
}
function mergeTransportMetadata(payload, metadata) {
	if (!metadata || Object.keys(metadata).length === 0) return payload;
	const existingMetadata = payload.metadata && typeof payload.metadata === "object" && !Array.isArray(payload.metadata) ? payload.metadata : void 0;
	return {
		...payload,
		metadata: {
			...existingMetadata,
			...metadata
		}
	};
}
function createEmptyTransportUsage() {
	return {
		input: 0,
		output: 0,
		cacheRead: 0,
		cacheWrite: 0,
		totalTokens: 0,
		cost: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0,
			total: 0
		}
	};
}
function createWritableTransportEventStream() {
	const eventStream = createAssistantMessageEventStream();
	return {
		eventStream,
		stream: eventStream
	};
}
function finalizeTransportStream(params) {
	const { stream, output, signal } = params;
	if (signal?.aborted) throw new Error("Request was aborted");
	if (output.stopReason === "aborted" || output.stopReason === "error") throw new Error("An unknown error occurred");
	stream.push({
		type: "done",
		reason: output.stopReason,
		message: output
	});
	stream.end();
}
function failTransportStream(params) {
	const { stream, output, signal, error, cleanup } = params;
	cleanup?.();
	output.stopReason = signal?.aborted ? "aborted" : "error";
	output.errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
	stream.push({
		type: "error",
		reason: output.stopReason,
		error: output
	});
	stream.end();
}
//#endregion
//#region src/agents/anthropic-transport-stream.ts
const CLAUDE_CODE_VERSION = "2.1.75";
const CLAUDE_CODE_TOOL_LOOKUP = new Map([
	"Read",
	"Write",
	"Edit",
	"Bash",
	"Grep",
	"Glob",
	"AskUserQuestion",
	"EnterPlanMode",
	"ExitPlanMode",
	"KillShell",
	"NotebookEdit",
	"Skill",
	"Task",
	"TaskOutput",
	"TodoWrite",
	"WebFetch",
	"WebSearch"
].map((tool) => [normalizeLowercaseStringOrEmpty(tool), tool]));
function supportsAdaptiveThinking(modelId) {
	return modelId.includes("opus-4-6") || modelId.includes("opus-4.6") || modelId.includes("sonnet-4-6") || modelId.includes("sonnet-4.6");
}
function mapThinkingLevelToEffort(level, modelId) {
	switch (level) {
		case "minimal":
		case "low": return "low";
		case "medium": return "medium";
		case "xhigh": return modelId.includes("opus-4-6") || modelId.includes("opus-4.6") ? "max" : "high";
		default: return "high";
	}
}
function clampReasoningLevel(level) {
	return level === "xhigh" ? "high" : level;
}
function resolvePositiveAnthropicMaxTokens(value) {
	if (typeof value !== "number" || !Number.isFinite(value)) return;
	const floored = Math.floor(value);
	return floored > 0 ? floored : void 0;
}
function resolveAnthropicMessagesMaxTokens(params) {
	const requested = resolvePositiveAnthropicMaxTokens(params.requestedMaxTokens);
	if (requested !== void 0) return requested;
	const modelMax = resolvePositiveAnthropicMaxTokens(params.modelMaxTokens);
	return modelMax !== void 0 ? Math.min(modelMax, 32e3) : void 0;
}
function adjustMaxTokensForThinking(params) {
	const budgets = {
		minimal: 1024,
		low: 2048,
		medium: 8192,
		high: 16384,
		...params.customBudgets
	};
	const minOutputTokens = 1024;
	let thinkingBudget = budgets[clampReasoningLevel(params.reasoningLevel)];
	const maxTokens = Math.min(params.baseMaxTokens + thinkingBudget, params.modelMaxTokens);
	if (maxTokens <= thinkingBudget) thinkingBudget = Math.max(0, maxTokens - minOutputTokens);
	return {
		maxTokens,
		thinkingBudget
	};
}
function isAnthropicOAuthToken(apiKey) {
	return apiKey.includes("sk-ant-oat");
}
function toClaudeCodeName(name) {
	return CLAUDE_CODE_TOOL_LOOKUP.get(normalizeLowercaseStringOrEmpty(name)) ?? name;
}
function fromClaudeCodeName(name, tools) {
	if (tools && tools.length > 0) {
		const lowerName = normalizeLowercaseStringOrEmpty(name);
		const matchedTool = tools.find((tool) => normalizeLowercaseStringOrEmpty(tool.name) === lowerName);
		if (matchedTool) return matchedTool.name;
	}
	return name;
}
function convertContentBlocks(content) {
	if (!content.some((item) => item.type === "image")) return sanitizeTransportPayloadText(content.map((item) => "text" in item ? item.text : "").join("\n"));
	const blocks = content.map((block) => {
		if (block.type === "text") return {
			type: "text",
			text: sanitizeTransportPayloadText(block.text)
		};
		return {
			type: "image",
			source: {
				type: "base64",
				media_type: block.mimeType,
				data: block.data
			}
		};
	});
	if (!blocks.some((block) => block.type === "text")) blocks.unshift({
		type: "text",
		text: "(see attached image)"
	});
	return blocks;
}
function normalizeToolCallId$1(id) {
	return id.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64);
}
function convertAnthropicMessages(messages, model, isOAuthToken) {
	const params = [];
	const transformedMessages = transformTransportMessages(messages, model, normalizeToolCallId$1);
	for (let i = 0; i < transformedMessages.length; i += 1) {
		const msg = transformedMessages[i];
		if (msg.role === "user") {
			if (typeof msg.content === "string") {
				if (msg.content.trim().length > 0) params.push({
					role: "user",
					content: sanitizeTransportPayloadText(msg.content)
				});
				continue;
			}
			const blocks = msg.content.map((item) => item.type === "text" ? {
				type: "text",
				text: sanitizeTransportPayloadText(item.text)
			} : {
				type: "image",
				source: {
					type: "base64",
					media_type: item.mimeType,
					data: item.data
				}
			});
			let filteredBlocks = model.input.includes("image") ? blocks : blocks.filter((block) => block.type !== "image");
			filteredBlocks = filteredBlocks.filter((block) => block.type !== "text" || block.text.trim().length > 0);
			if (filteredBlocks.length === 0) continue;
			params.push({
				role: "user",
				content: filteredBlocks
			});
			continue;
		}
		if (msg.role === "assistant") {
			const blocks = [];
			for (const block of msg.content) {
				if (block.type === "text") {
					if (block.text.trim().length > 0) blocks.push({
						type: "text",
						text: sanitizeTransportPayloadText(block.text)
					});
					continue;
				}
				if (block.type === "thinking") {
					if (block.redacted) {
						blocks.push({
							type: "redacted_thinking",
							data: block.thinkingSignature
						});
						continue;
					}
					if (block.thinking.trim().length === 0) continue;
					if (!block.thinkingSignature || block.thinkingSignature.trim().length === 0) blocks.push({
						type: "text",
						text: sanitizeTransportPayloadText(block.thinking)
					});
					else blocks.push({
						type: "thinking",
						thinking: sanitizeTransportPayloadText(block.thinking),
						signature: block.thinkingSignature
					});
					continue;
				}
				if (block.type === "toolCall") blocks.push({
					type: "tool_use",
					id: block.id,
					name: isOAuthToken ? toClaudeCodeName(block.name) : block.name,
					input: coerceTransportToolCallArguments(block.arguments)
				});
			}
			if (blocks.length > 0) params.push({
				role: "assistant",
				content: blocks
			});
			continue;
		}
		if (msg.role === "toolResult") {
			const toolResult = msg;
			const toolResults = [{
				type: "tool_result",
				tool_use_id: toolResult.toolCallId,
				content: convertContentBlocks(toolResult.content),
				is_error: toolResult.isError
			}];
			let j = i + 1;
			while (j < transformedMessages.length && transformedMessages[j].role === "toolResult") {
				const nextMsg = transformedMessages[j];
				toolResults.push({
					type: "tool_result",
					tool_use_id: nextMsg.toolCallId,
					content: convertContentBlocks(nextMsg.content),
					is_error: nextMsg.isError
				});
				j += 1;
			}
			i = j - 1;
			params.push({
				role: "user",
				content: toolResults
			});
		}
	}
	return params;
}
function convertAnthropicTools(tools, isOAuthToken) {
	if (!tools) return [];
	return tools.map((tool) => ({
		name: isOAuthToken ? toClaudeCodeName(tool.name) : tool.name,
		description: tool.description,
		input_schema: {
			type: "object",
			properties: tool.parameters.properties || {},
			required: tool.parameters.required || []
		}
	}));
}
function mapStopReason$1(reason) {
	switch (reason) {
		case "end_turn": return "stop";
		case "max_tokens": return "length";
		case "tool_use": return "toolUse";
		case "pause_turn": return "stop";
		case "refusal":
		case "sensitive": return "error";
		case "stop_sequence": return "stop";
		default: throw new Error(`Unhandled stop reason: ${String(reason)}`);
	}
}
function createAnthropicTransportClient(params) {
	const { model, context, apiKey, options } = params;
	const needsInterleavedBeta = (options?.interleavedThinking ?? true) && !supportsAdaptiveThinking(model.id);
	const fetch = buildGuardedModelFetch(model);
	if (model.provider === "github-copilot") {
		const betaFeatures = needsInterleavedBeta ? ["interleaved-thinking-2025-05-14"] : [];
		return {
			client: new Anthropic({
				apiKey: null,
				authToken: apiKey,
				baseURL: model.baseUrl,
				dangerouslyAllowBrowser: true,
				defaultHeaders: mergeTransportHeaders({
					accept: "application/json",
					"anthropic-dangerous-direct-browser-access": "true",
					...betaFeatures.length > 0 ? { "anthropic-beta": betaFeatures.join(",") } : {}
				}, model.headers, buildCopilotDynamicHeaders({
					messages: context.messages,
					hasImages: hasCopilotVisionInput(context.messages)
				}), options?.headers),
				fetch
			}),
			isOAuthToken: false
		};
	}
	const betaFeatures = ["fine-grained-tool-streaming-2025-05-14"];
	if (needsInterleavedBeta) betaFeatures.push("interleaved-thinking-2025-05-14");
	if (isAnthropicOAuthToken(apiKey)) return {
		client: new Anthropic({
			apiKey: null,
			authToken: apiKey,
			baseURL: model.baseUrl,
			dangerouslyAllowBrowser: true,
			defaultHeaders: mergeTransportHeaders({
				accept: "application/json",
				"anthropic-dangerous-direct-browser-access": "true",
				"anthropic-beta": `claude-code-20250219,oauth-2025-04-20,${betaFeatures.join(",")}`,
				"user-agent": `claude-cli/${CLAUDE_CODE_VERSION}`,
				"x-app": "cli"
			}, model.headers, options?.headers),
			fetch
		}),
		isOAuthToken: true
	};
	return {
		client: new Anthropic({
			apiKey,
			baseURL: model.baseUrl,
			dangerouslyAllowBrowser: true,
			defaultHeaders: mergeTransportHeaders({
				accept: "application/json",
				"anthropic-dangerous-direct-browser-access": "true",
				"anthropic-beta": betaFeatures.join(",")
			}, model.headers, options?.headers),
			fetch
		}),
		isOAuthToken: false
	};
}
function buildAnthropicParams(model, context, isOAuthToken, options) {
	const maxTokens = resolveAnthropicMessagesMaxTokens({
		modelMaxTokens: model.maxTokens,
		requestedMaxTokens: options?.maxTokens
	});
	if (maxTokens === void 0) throw new Error(`Anthropic Messages transport requires a positive maxTokens value for ${model.provider}/${model.id}`);
	const payloadPolicy = resolveAnthropicPayloadPolicy({
		provider: model.provider,
		api: model.api,
		baseUrl: model.baseUrl,
		cacheRetention: options?.cacheRetention,
		enableCacheControl: true
	});
	const params = {
		model: model.id,
		messages: convertAnthropicMessages(context.messages, model, isOAuthToken),
		max_tokens: maxTokens,
		stream: true
	};
	if (isOAuthToken) params.system = [{
		type: "text",
		text: "You are Claude Code, Anthropic's official CLI for Claude."
	}, ...context.systemPrompt ? [{
		type: "text",
		text: sanitizeTransportPayloadText(context.systemPrompt)
	}] : []];
	else if (context.systemPrompt) params.system = [{
		type: "text",
		text: sanitizeTransportPayloadText(context.systemPrompt)
	}];
	if (options?.temperature !== void 0 && !options.thinkingEnabled) params.temperature = options.temperature;
	if (context.tools) params.tools = convertAnthropicTools(context.tools, isOAuthToken);
	if (model.reasoning) {
		if (options?.thinkingEnabled) if (supportsAdaptiveThinking(model.id)) {
			params.thinking = { type: "adaptive" };
			if (options.effort) params.output_config = { effort: options.effort };
		} else params.thinking = {
			type: "enabled",
			budget_tokens: options.thinkingBudgetTokens || 1024
		};
		else if (options?.thinkingEnabled === false) params.thinking = { type: "disabled" };
	}
	if (options?.metadata && typeof options.metadata.user_id === "string") params.metadata = { user_id: options.metadata.user_id };
	if (options?.toolChoice) params.tool_choice = typeof options.toolChoice === "string" ? { type: options.toolChoice } : options.toolChoice;
	applyAnthropicPayloadPolicyToParams(params, payloadPolicy);
	return params;
}
function resolveAnthropicTransportOptions(model, options, apiKey) {
	const baseMaxTokens = resolveAnthropicMessagesMaxTokens({
		modelMaxTokens: model.maxTokens,
		requestedMaxTokens: options?.maxTokens
	});
	if (baseMaxTokens === void 0) throw new Error(`Anthropic Messages transport requires a positive maxTokens value for ${model.provider}/${model.id}`);
	const reasoningModelMaxTokens = resolvePositiveAnthropicMaxTokens(model.maxTokens) ?? baseMaxTokens;
	const resolved = {
		temperature: options?.temperature,
		maxTokens: baseMaxTokens,
		signal: options?.signal,
		apiKey,
		cacheRetention: options?.cacheRetention,
		sessionId: options?.sessionId,
		headers: options?.headers,
		onPayload: options?.onPayload,
		maxRetryDelayMs: options?.maxRetryDelayMs,
		metadata: options?.metadata,
		interleavedThinking: options?.interleavedThinking,
		toolChoice: options?.toolChoice,
		thinkingBudgets: options?.thinkingBudgets,
		reasoning: options?.reasoning
	};
	if (!options?.reasoning) {
		resolved.thinkingEnabled = false;
		return resolved;
	}
	if (supportsAdaptiveThinking(model.id)) {
		resolved.thinkingEnabled = true;
		resolved.effort = mapThinkingLevelToEffort(options.reasoning, model.id);
		return resolved;
	}
	const adjusted = adjustMaxTokensForThinking({
		baseMaxTokens,
		modelMaxTokens: reasoningModelMaxTokens,
		reasoningLevel: options.reasoning,
		customBudgets: options.thinkingBudgets
	});
	resolved.maxTokens = adjusted.maxTokens;
	resolved.thinkingEnabled = true;
	resolved.thinkingBudgetTokens = adjusted.thinkingBudget;
	return resolved;
}
function createAnthropicMessagesTransportStreamFn() {
	return (rawModel, context, rawOptions) => {
		const model = rawModel;
		const options = rawOptions;
		const { eventStream, stream } = createWritableTransportEventStream();
		(async () => {
			const output = {
				role: "assistant",
				content: [],
				api: "anthropic-messages",
				provider: model.provider,
				model: model.id,
				usage: createEmptyTransportUsage(),
				stopReason: "stop",
				timestamp: Date.now()
			};
			try {
				const apiKey = options?.apiKey ?? getEnvApiKey(model.provider) ?? "";
				if (!apiKey) throw new Error(`No API key for provider: ${model.provider}`);
				const transportOptions = resolveAnthropicTransportOptions(model, options, apiKey);
				const { client, isOAuthToken } = createAnthropicTransportClient({
					model,
					context,
					apiKey,
					options: transportOptions
				});
				let params = buildAnthropicParams(model, context, isOAuthToken, transportOptions);
				const nextParams = await transportOptions.onPayload?.(params, model);
				if (nextParams !== void 0) params = nextParams;
				const anthropicStream = client.messages.stream({
					...params,
					stream: true
				}, transportOptions.signal ? { signal: transportOptions.signal } : void 0);
				stream.push({
					type: "start",
					partial: output
				});
				const blocks = output.content;
				for await (const event of anthropicStream) {
					if (event.type === "message_start") {
						const message = event.message;
						const usage = message?.usage ?? {};
						output.responseId = typeof message?.id === "string" ? message.id : void 0;
						output.usage.input = typeof usage.input_tokens === "number" ? usage.input_tokens : 0;
						output.usage.output = typeof usage.output_tokens === "number" ? usage.output_tokens : 0;
						output.usage.cacheRead = typeof usage.cache_read_input_tokens === "number" ? usage.cache_read_input_tokens : 0;
						output.usage.cacheWrite = typeof usage.cache_creation_input_tokens === "number" ? usage.cache_creation_input_tokens : 0;
						output.usage.totalTokens = output.usage.input + output.usage.output + output.usage.cacheRead + output.usage.cacheWrite;
						calculateCost(model, output.usage);
						continue;
					}
					if (event.type === "content_block_start") {
						const contentBlock = event.content_block;
						const index = typeof event.index === "number" ? event.index : -1;
						if (contentBlock?.type === "text") {
							const block = {
								type: "text",
								text: "",
								index
							};
							output.content.push(block);
							stream.push({
								type: "text_start",
								contentIndex: output.content.length - 1,
								partial: output
							});
							continue;
						}
						if (contentBlock?.type === "thinking") {
							const block = {
								type: "thinking",
								thinking: "",
								thinkingSignature: "",
								index
							};
							output.content.push(block);
							stream.push({
								type: "thinking_start",
								contentIndex: output.content.length - 1,
								partial: output
							});
							continue;
						}
						if (contentBlock?.type === "redacted_thinking") {
							const block = {
								type: "thinking",
								thinking: "[Reasoning redacted]",
								thinkingSignature: typeof contentBlock.data === "string" ? contentBlock.data : "",
								redacted: true,
								index
							};
							output.content.push(block);
							stream.push({
								type: "thinking_start",
								contentIndex: output.content.length - 1,
								partial: output
							});
							continue;
						}
						if (contentBlock?.type === "tool_use") {
							const block = {
								type: "toolCall",
								id: typeof contentBlock.id === "string" ? contentBlock.id : "",
								name: typeof contentBlock.name === "string" ? isOAuthToken ? fromClaudeCodeName(contentBlock.name, context.tools) : contentBlock.name : "",
								arguments: contentBlock.input && typeof contentBlock.input === "object" ? contentBlock.input : {},
								partialJson: "",
								index
							};
							output.content.push(block);
							stream.push({
								type: "toolcall_start",
								contentIndex: output.content.length - 1,
								partial: output
							});
						}
						continue;
					}
					if (event.type === "content_block_delta") {
						const index = blocks.findIndex((block) => block.index === event.index);
						const block = blocks[index];
						const delta = event.delta;
						if (block?.type === "text" && delta?.type === "text_delta" && typeof delta.text === "string") {
							block.text += delta.text;
							stream.push({
								type: "text_delta",
								contentIndex: index,
								delta: delta.text,
								partial: output
							});
							continue;
						}
						if (block?.type === "thinking" && delta?.type === "thinking_delta" && typeof delta.thinking === "string") {
							block.thinking += delta.thinking;
							stream.push({
								type: "thinking_delta",
								contentIndex: index,
								delta: delta.thinking,
								partial: output
							});
							continue;
						}
						if (block?.type === "toolCall" && delta?.type === "input_json_delta" && typeof delta.partial_json === "string") {
							block.partialJson += delta.partial_json;
							block.arguments = parseStreamingJson(block.partialJson);
							stream.push({
								type: "toolcall_delta",
								contentIndex: index,
								delta: delta.partial_json,
								partial: output
							});
							continue;
						}
						if (block?.type === "thinking" && delta?.type === "signature_delta" && typeof delta.signature === "string") block.thinkingSignature = `${block.thinkingSignature ?? ""}${delta.signature}`;
						continue;
					}
					if (event.type === "content_block_stop") {
						const index = blocks.findIndex((block) => block.index === event.index);
						const block = blocks[index];
						if (!block) continue;
						delete block.index;
						if (block.type === "text") {
							stream.push({
								type: "text_end",
								contentIndex: index,
								content: block.text,
								partial: output
							});
							continue;
						}
						if (block.type === "thinking") {
							stream.push({
								type: "thinking_end",
								contentIndex: index,
								content: block.thinking,
								partial: output
							});
							continue;
						}
						if (block.type === "toolCall") {
							if (typeof block.partialJson === "string" && block.partialJson.length > 0) block.arguments = parseStreamingJson(block.partialJson);
							delete block.partialJson;
							stream.push({
								type: "toolcall_end",
								contentIndex: index,
								toolCall: block,
								partial: output
							});
						}
						continue;
					}
					if (event.type === "message_delta") {
						const delta = event.delta;
						const usage = event.usage;
						if (delta?.stop_reason) output.stopReason = mapStopReason$1(delta.stop_reason);
						if (typeof usage?.input_tokens === "number") output.usage.input = usage.input_tokens;
						if (typeof usage?.output_tokens === "number") output.usage.output = usage.output_tokens;
						if (typeof usage?.cache_read_input_tokens === "number") output.usage.cacheRead = usage.cache_read_input_tokens;
						if (typeof usage?.cache_creation_input_tokens === "number") output.usage.cacheWrite = usage.cache_creation_input_tokens;
						output.usage.totalTokens = output.usage.input + output.usage.output + output.usage.cacheRead + output.usage.cacheWrite;
						calculateCost(model, output.usage);
					}
				}
				finalizeTransportStream({
					stream,
					output,
					signal: transportOptions.signal
				});
			} catch (error) {
				failTransportStream({
					stream,
					output,
					signal: options?.signal,
					error,
					cleanup: () => {
						for (const block of output.content) delete block.index;
					}
				});
			}
		})();
		return eventStream;
	};
}
//#endregion
//#region src/agents/google-transport-stream.ts
let toolCallCounter = 0;
function isGemini3ProModel(modelId) {
	return /gemini-3(?:\.\d+)?-pro/.test(normalizeLowercaseStringOrEmpty(modelId));
}
function isGemini3FlashModel(modelId) {
	return /gemini-3(?:\.\d+)?-flash/.test(normalizeLowercaseStringOrEmpty(modelId));
}
function requiresToolCallId(modelId) {
	return modelId.startsWith("claude-") || modelId.startsWith("gpt-oss-");
}
function supportsMultimodalFunctionResponse(modelId) {
	const match = normalizeLowercaseStringOrEmpty(modelId).match(/^gemini(?:-live)?-(\d+)/);
	if (!match) return true;
	return Number.parseInt(match[1] ?? "", 10) >= 3;
}
function retainThoughtSignature(existing, incoming) {
	if (typeof incoming === "string" && incoming.length > 0) return incoming;
	return existing;
}
function mapToolChoice(choice) {
	if (!choice) return;
	if (typeof choice === "object" && choice.type === "function") return {
		mode: "ANY",
		allowedFunctionNames: [choice.function.name]
	};
	switch (choice) {
		case "none": return { mode: "NONE" };
		case "any":
		case "required": return { mode: "ANY" };
		default: return { mode: "AUTO" };
	}
}
function mapStopReasonString(reason) {
	switch (reason) {
		case "STOP": return "stop";
		case "MAX_TOKENS": return "length";
		default: return "error";
	}
}
function normalizeToolCallId(id) {
	return id.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64);
}
function resolveGoogleModelPath(modelId) {
	if (modelId.startsWith("models/") || modelId.startsWith("tunedModels/")) return modelId;
	return `models/${modelId}`;
}
function buildGoogleRequestUrl(model) {
	return `${normalizeGoogleApiBaseUrl(model.baseUrl)}/${resolveGoogleModelPath(model.id)}:streamGenerateContent?alt=sse`;
}
function resolveThinkingLevel(level, modelId) {
	if (isGemini3ProModel(modelId)) switch (level) {
		case "minimal":
		case "low": return "LOW";
		case "medium":
		case "high":
		case "xhigh": return "HIGH";
	}
	switch (level) {
		case "minimal": return "MINIMAL";
		case "low": return "LOW";
		case "medium": return "MEDIUM";
		case "high":
		case "xhigh": return "HIGH";
	}
	throw new Error("Unsupported thinking level");
}
function getDisabledThinkingConfig(modelId) {
	if (isGemini3ProModel(modelId)) return { thinkingLevel: "LOW" };
	if (isGemini3FlashModel(modelId)) return { thinkingLevel: "MINIMAL" };
	return { thinkingBudget: 0 };
}
function getGoogleThinkingBudget(modelId, effort, customBudgets) {
	const normalizedEffort = effort === "xhigh" ? "high" : effort;
	if (customBudgets?.[normalizedEffort] !== void 0) return customBudgets[normalizedEffort];
	if (modelId.includes("2.5-pro")) return {
		minimal: 128,
		low: 2048,
		medium: 8192,
		high: 32768
	}[normalizedEffort];
	if (modelId.includes("2.5-flash")) return {
		minimal: 128,
		low: 2048,
		medium: 8192,
		high: 24576
	}[normalizedEffort];
}
function resolveGoogleThinkingConfig(model, options) {
	if (!model.reasoning) return;
	if (options?.thinking) {
		if (!options.thinking.enabled) return getDisabledThinkingConfig(model.id);
		const config = { includeThoughts: true };
		if (options.thinking.level) config.thinkingLevel = options.thinking.level;
		else if (typeof options.thinking.budgetTokens === "number") config.thinkingBudget = options.thinking.budgetTokens;
		return config;
	}
	if (!options?.reasoning) return getDisabledThinkingConfig(model.id);
	if (isGemini3ProModel(model.id) || isGemini3FlashModel(model.id)) return {
		includeThoughts: true,
		thinkingLevel: resolveThinkingLevel(options.reasoning, model.id)
	};
	const budget = getGoogleThinkingBudget(model.id, options.reasoning, options.thinkingBudgets);
	return {
		includeThoughts: true,
		...typeof budget === "number" ? { thinkingBudget: budget } : {}
	};
}
function convertGoogleMessages(model, context) {
	const contents = [];
	const transformedMessages = transformTransportMessages(context.messages, model, (id) => requiresToolCallId(model.id) ? normalizeToolCallId(id) : id);
	for (const msg of transformedMessages) {
		if (msg.role === "user") {
			if (typeof msg.content === "string") {
				contents.push({
					role: "user",
					parts: [{ text: sanitizeTransportPayloadText(msg.content) }]
				});
				continue;
			}
			const parts = msg.content.map((item) => item.type === "text" ? { text: sanitizeTransportPayloadText(item.text) } : { inlineData: {
				mimeType: item.mimeType,
				data: item.data
			} }).filter((item) => model.input.includes("image") || !("inlineData" in item));
			if (parts.length > 0) contents.push({
				role: "user",
				parts
			});
			continue;
		}
		if (msg.role === "assistant") {
			const isSameProviderAndModel = msg.provider === model.provider && msg.model === model.id;
			const parts = [];
			for (const block of msg.content) {
				if (block.type === "text") {
					if (!block.text.trim()) continue;
					parts.push({
						text: sanitizeTransportPayloadText(block.text),
						...isSameProviderAndModel && block.textSignature ? { thoughtSignature: block.textSignature } : {}
					});
					continue;
				}
				if (block.type === "thinking") {
					if (!block.thinking.trim()) continue;
					if (isSameProviderAndModel) parts.push({
						thought: true,
						text: sanitizeTransportPayloadText(block.thinking),
						...block.thinkingSignature ? { thoughtSignature: block.thinkingSignature } : {}
					});
					else parts.push({ text: sanitizeTransportPayloadText(block.thinking) });
					continue;
				}
				if (block.type === "toolCall") parts.push({
					functionCall: {
						name: block.name,
						args: coerceTransportToolCallArguments(block.arguments),
						...requiresToolCallId(model.id) ? { id: block.id } : {}
					},
					...isSameProviderAndModel && block.thoughtSignature ? { thoughtSignature: block.thoughtSignature } : {}
				});
			}
			if (parts.length > 0) contents.push({
				role: "model",
				parts
			});
			continue;
		}
		if (msg.role === "toolResult") {
			const textResult = msg.content.filter((item) => item.type === "text").map((item) => item.text).join("\n");
			const imageContent = model.input.includes("image") ? msg.content.filter((item) => item.type === "image") : [];
			const responseValue = textResult ? sanitizeTransportPayloadText(textResult) : imageContent.length > 0 ? "(see attached image)" : "";
			const imageParts = imageContent.map((imageBlock) => ({ inlineData: {
				mimeType: imageBlock.mimeType,
				data: imageBlock.data
			} }));
			const functionResponse = { functionResponse: {
				name: msg.toolName,
				response: msg.isError ? { error: responseValue } : { output: responseValue },
				...supportsMultimodalFunctionResponse(model.id) && imageParts.length > 0 ? { parts: imageParts } : {},
				...requiresToolCallId(model.id) ? { id: msg.toolCallId } : {}
			} };
			const last = contents[contents.length - 1];
			if (last?.role === "user" && Array.isArray(last.parts) && last.parts.some((part) => "functionResponse" in part)) last.parts.push(functionResponse);
			else contents.push({
				role: "user",
				parts: [functionResponse]
			});
			if (imageParts.length > 0 && !supportsMultimodalFunctionResponse(model.id)) contents.push({
				role: "user",
				parts: [{ text: "Tool result image:" }, ...imageParts]
			});
		}
	}
	return contents;
}
function convertGoogleTools(tools) {
	if (tools.length === 0) return;
	return [{ functionDeclarations: tools.map((tool) => ({
		name: tool.name,
		description: tool.description,
		parametersJsonSchema: tool.parameters
	})) }];
}
function buildGoogleGenerativeAiParams(model, context, options) {
	const generationConfig = {};
	if (typeof options?.temperature === "number") generationConfig.temperature = options.temperature;
	if (typeof options?.maxTokens === "number") generationConfig.maxOutputTokens = options.maxTokens;
	const thinkingConfig = resolveGoogleThinkingConfig(model, options);
	if (thinkingConfig) generationConfig.thinkingConfig = thinkingConfig;
	const params = { contents: convertGoogleMessages(model, context) };
	if (typeof options?.cachedContent === "string" && options.cachedContent.trim()) params.cachedContent = options.cachedContent.trim();
	if (Object.keys(generationConfig).length > 0) params.generationConfig = generationConfig;
	if (context.systemPrompt) params.systemInstruction = { parts: [{ text: sanitizeTransportPayloadText(stripSystemPromptCacheBoundary(context.systemPrompt)) }] };
	if (context.tools?.length) {
		params.tools = convertGoogleTools(context.tools);
		const toolChoice = mapToolChoice(options?.toolChoice);
		if (toolChoice) params.toolConfig = { functionCallingConfig: toolChoice };
	}
	return params;
}
function buildGoogleHeaders(model, apiKey, optionHeaders) {
	return mergeTransportHeaders({ accept: "text/event-stream" }, apiKey ? parseGeminiAuth(apiKey).headers : void 0, model.headers, optionHeaders) ?? { accept: "text/event-stream" };
}
async function* parseGoogleSseChunks(response, signal) {
	if (!response.body) throw new Error("No response body");
	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";
	const abortHandler = () => {
		reader.cancel().catch(() => void 0);
	};
	signal?.addEventListener("abort", abortHandler);
	try {
		while (true) {
			if (signal?.aborted) throw new Error("Request was aborted");
			const { done, value } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true }).replace(/\r/g, "");
			let boundary = buffer.indexOf("\n\n");
			while (boundary >= 0) {
				const rawEvent = buffer.slice(0, boundary);
				buffer = buffer.slice(boundary + 2);
				boundary = buffer.indexOf("\n\n");
				const data = rawEvent.split("\n").filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).join("\n");
				if (!data || data === "[DONE]") continue;
				yield JSON.parse(data);
			}
		}
	} finally {
		signal?.removeEventListener("abort", abortHandler);
	}
}
function updateUsage(output, model, chunk) {
	const usage = chunk.usageMetadata;
	if (!usage) return;
	const promptTokens = usage.promptTokenCount || 0;
	const cacheRead = usage.cachedContentTokenCount || 0;
	output.usage = {
		input: Math.max(0, promptTokens - cacheRead),
		output: (usage.candidatesTokenCount || 0) + (usage.thoughtsTokenCount || 0),
		cacheRead,
		cacheWrite: 0,
		totalTokens: usage.totalTokenCount || 0,
		cost: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0,
			total: 0
		}
	};
	calculateCost(model, output.usage);
}
function pushTextBlockEnd(stream, output, blockIndex) {
	const block = output.content[blockIndex];
	if (!block) return;
	if (block.type === "thinking") {
		stream.push({
			type: "thinking_end",
			contentIndex: blockIndex,
			content: block.thinking,
			partial: output
		});
		return;
	}
	if (block.type === "text") stream.push({
		type: "text_end",
		contentIndex: blockIndex,
		content: block.text,
		partial: output
	});
}
function createGoogleGenerativeAiTransportStreamFn() {
	return (rawModel, context, rawOptions) => {
		const model = rawModel;
		const options = rawOptions;
		const { eventStream, stream } = createWritableTransportEventStream();
		(async () => {
			const output = {
				role: "assistant",
				content: [],
				api: "google-generative-ai",
				provider: model.provider,
				model: model.id,
				usage: createEmptyTransportUsage(),
				stopReason: "stop",
				timestamp: Date.now()
			};
			try {
				const apiKey = options?.apiKey ?? getEnvApiKey(model.provider) ?? void 0;
				const fetch = buildGuardedModelFetch(model);
				let params = buildGoogleGenerativeAiParams(model, context, options);
				const nextParams = await options?.onPayload?.(params, model);
				if (nextParams !== void 0) params = nextParams;
				const response = await fetch(buildGoogleRequestUrl(model), {
					method: "POST",
					headers: buildGoogleHeaders(model, apiKey, options?.headers),
					body: JSON.stringify(params),
					signal: options?.signal
				});
				if (!response.ok) {
					const message = await response.text().catch(() => "");
					throw new Error(`Google Generative AI API error (${response.status}): ${message}`);
				}
				stream.push({
					type: "start",
					partial: output
				});
				let currentBlockIndex = -1;
				for await (const chunk of parseGoogleSseChunks(response, options?.signal)) {
					output.responseId ||= chunk.responseId;
					updateUsage(output, model, chunk);
					const candidate = chunk.candidates?.[0];
					if (candidate?.content?.parts) for (const part of candidate.content.parts) {
						if (typeof part.text === "string") {
							const isThinking = part.thought === true;
							const currentBlock = output.content[currentBlockIndex];
							if (currentBlockIndex < 0 || !currentBlock || isThinking && currentBlock.type !== "thinking" || !isThinking && currentBlock.type !== "text") {
								if (currentBlockIndex >= 0) pushTextBlockEnd(stream, output, currentBlockIndex);
								if (isThinking) {
									output.content.push({
										type: "thinking",
										thinking: ""
									});
									currentBlockIndex = output.content.length - 1;
									stream.push({
										type: "thinking_start",
										contentIndex: currentBlockIndex,
										partial: output
									});
								} else {
									output.content.push({
										type: "text",
										text: ""
									});
									currentBlockIndex = output.content.length - 1;
									stream.push({
										type: "text_start",
										contentIndex: currentBlockIndex,
										partial: output
									});
								}
							}
							const activeBlock = output.content[currentBlockIndex];
							if (activeBlock?.type === "thinking") {
								activeBlock.thinking += part.text;
								activeBlock.thinkingSignature = retainThoughtSignature(activeBlock.thinkingSignature, part.thoughtSignature);
								stream.push({
									type: "thinking_delta",
									contentIndex: currentBlockIndex,
									delta: part.text,
									partial: output
								});
							} else if (activeBlock?.type === "text") {
								activeBlock.text += part.text;
								activeBlock.textSignature = retainThoughtSignature(activeBlock.textSignature, part.thoughtSignature);
								stream.push({
									type: "text_delta",
									contentIndex: currentBlockIndex,
									delta: part.text,
									partial: output
								});
							}
						}
						if (part.functionCall) {
							if (currentBlockIndex >= 0) {
								pushTextBlockEnd(stream, output, currentBlockIndex);
								currentBlockIndex = -1;
							}
							const providedId = part.functionCall.id;
							const isDuplicate = output.content.some((block) => block.type === "toolCall" && block.id === providedId);
							const toolCall = {
								type: "toolCall",
								id: providedId && !isDuplicate ? providedId : `${part.functionCall.name || "tool"}_${Date.now()}_${++toolCallCounter}`,
								name: part.functionCall.name || "",
								arguments: part.functionCall.args ?? {}
							};
							output.content.push(toolCall);
							const blockIndex = output.content.length - 1;
							stream.push({
								type: "toolcall_start",
								contentIndex: blockIndex,
								partial: output
							});
							stream.push({
								type: "toolcall_delta",
								contentIndex: blockIndex,
								delta: JSON.stringify(toolCall.arguments),
								partial: output
							});
							stream.push({
								type: "toolcall_end",
								contentIndex: blockIndex,
								toolCall,
								partial: output
							});
						}
					}
					if (typeof candidate?.finishReason === "string") {
						output.stopReason = mapStopReasonString(candidate.finishReason);
						if (output.content.some((block) => block.type === "toolCall")) output.stopReason = "toolUse";
					}
				}
				if (currentBlockIndex >= 0) pushTextBlockEnd(stream, output, currentBlockIndex);
				finalizeTransportStream({
					stream,
					output,
					signal: options?.signal
				});
			} catch (error) {
				failTransportStream({
					stream,
					output,
					signal: options?.signal,
					error
				});
			}
		})();
		return eventStream;
	};
}
//#endregion
//#region src/agents/openai-transport-stream.ts
const DEFAULT_AZURE_OPENAI_API_VERSION = "2024-12-01-preview";
function stringifyUnknown(value, fallback = "") {
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	return fallback;
}
function stringifyJsonLike(value, fallback = "") {
	if (typeof value === "string") return value;
	if (value && typeof value === "object") return JSON.stringify(value);
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	return fallback;
}
function getServiceTierCostMultiplier(serviceTier) {
	switch (serviceTier) {
		case "flex": return .5;
		case "priority": return 2;
		default: return 1;
	}
}
function applyServiceTierPricing(usage, serviceTier) {
	const multiplier = getServiceTierCostMultiplier(serviceTier);
	if (multiplier === 1) return;
	usage.cost.input *= multiplier;
	usage.cost.output *= multiplier;
	usage.cost.cacheRead *= multiplier;
	usage.cost.cacheWrite *= multiplier;
	usage.cost.total = usage.cost.input + usage.cost.output + usage.cost.cacheRead + usage.cost.cacheWrite;
}
function resolveAzureOpenAIApiVersion(env = process.env) {
	return env.AZURE_OPENAI_API_VERSION?.trim() || DEFAULT_AZURE_OPENAI_API_VERSION;
}
function shortHash(value) {
	let hash = 0;
	for (let i = 0; i < value.length; i += 1) hash = hash * 31 + value.charCodeAt(i) | 0;
	return Math.abs(hash).toString(36);
}
function encodeTextSignatureV1(id, phase) {
	return JSON.stringify({
		v: 1,
		id,
		...phase ? { phase } : {}
	});
}
function parseTextSignature(signature) {
	if (!signature) return;
	if (signature.startsWith("{")) try {
		const parsed = JSON.parse(signature);
		if (parsed.v === 1 && typeof parsed.id === "string") return parsed.phase === "commentary" || parsed.phase === "final_answer" ? {
			id: parsed.id,
			phase: parsed.phase
		} : { id: parsed.id };
	} catch {}
	return { id: signature };
}
function convertResponsesMessages(model, context, allowedToolCallProviders, options) {
	const messages = [];
	const normalizeIdPart = (part) => {
		const sanitized = part.replace(/[^a-zA-Z0-9_-]/g, "_");
		return (sanitized.length > 64 ? sanitized.slice(0, 64) : sanitized).replace(/_+$/, "");
	};
	const buildForeignResponsesItemId = (itemId) => {
		const normalized = `fc_${shortHash(itemId)}`;
		return normalized.length > 64 ? normalized.slice(0, 64) : normalized;
	};
	const normalizeToolCallId = (id, _targetModel, source) => {
		if (!allowedToolCallProviders.has(model.provider)) return normalizeIdPart(id);
		if (!id.includes("|")) return normalizeIdPart(id);
		const [callId, itemId] = id.split("|");
		const normalizedCallId = normalizeIdPart(callId);
		let normalizedItemId = source.provider !== model.provider || source.api !== model.api ? buildForeignResponsesItemId(itemId) : normalizeIdPart(itemId);
		if (!normalizedItemId.startsWith("fc_")) normalizedItemId = normalizeIdPart(`fc_${normalizedItemId}`);
		return `${normalizedCallId}|${normalizedItemId}`;
	};
	const transformedMessages = transformTransportMessages(context.messages, model, normalizeToolCallId);
	if ((options?.includeSystemPrompt ?? true) && context.systemPrompt) messages.push({
		role: model.reasoning && options?.supportsDeveloperRole !== false ? "developer" : "system",
		content: sanitizeTransportPayloadText(stripSystemPromptCacheBoundary(context.systemPrompt))
	});
	let msgIndex = 0;
	for (const msg of transformedMessages) {
		if (msg.role === "user") if (typeof msg.content === "string") messages.push({
			role: "user",
			content: [{
				type: "input_text",
				text: sanitizeTransportPayloadText(msg.content)
			}]
		});
		else {
			const content = msg.content.map((item) => item.type === "text" ? {
				type: "input_text",
				text: sanitizeTransportPayloadText(item.text)
			} : {
				type: "input_image",
				detail: "auto",
				image_url: `data:${item.mimeType};base64,${item.data}`
			}).filter((item) => model.input.includes("image") || item.type !== "input_image");
			if (content.length > 0) messages.push({
				role: "user",
				content
			});
		}
		else if (msg.role === "assistant") {
			const output = [];
			const isDifferentModel = msg.model !== model.id && msg.provider === model.provider && msg.api === model.api;
			for (const block of msg.content) if (block.type === "thinking") {
				if (block.thinkingSignature) output.push(JSON.parse(block.thinkingSignature));
			} else if (block.type === "text") {
				let msgId = parseTextSignature(block.textSignature)?.id ?? `msg_${msgIndex}`;
				if (msgId.length > 64) msgId = `msg_${shortHash(msgId)}`;
				output.push({
					type: "message",
					role: "assistant",
					content: [{
						type: "output_text",
						text: sanitizeTransportPayloadText(block.text),
						annotations: []
					}],
					status: "completed",
					id: msgId,
					phase: parseTextSignature(block.textSignature)?.phase
				});
			} else if (block.type === "toolCall") {
				const [callId, itemIdRaw] = block.id.split("|");
				const itemId = isDifferentModel && itemIdRaw?.startsWith("fc_") ? void 0 : itemIdRaw;
				output.push({
					type: "function_call",
					id: itemId,
					call_id: callId,
					name: block.name,
					arguments: typeof block.arguments === "string" ? block.arguments : JSON.stringify(block.arguments ?? {})
				});
			}
			if (output.length > 0) messages.push(...output);
		} else if (msg.role === "toolResult") {
			const textResult = msg.content.filter((item) => item.type === "text").map((item) => item.text).join("\n");
			const hasImages = msg.content.some((item) => item.type === "image");
			const [callId] = msg.toolCallId.split("|");
			messages.push({
				type: "function_call_output",
				call_id: callId,
				output: hasImages && model.input.includes("image") ? [...textResult ? [{
					type: "input_text",
					text: sanitizeTransportPayloadText(textResult)
				}] : [], ...msg.content.filter((item) => item.type === "image").map((item) => ({
					type: "input_image",
					detail: "auto",
					image_url: `data:${item.mimeType};base64,${item.data}`
				}))] : sanitizeTransportPayloadText(textResult || "(see attached image)")
			});
		}
		msgIndex += 1;
	}
	return messages;
}
function convertResponsesTools(tools, options) {
	const strict = resolveOpenAIStrictToolFlagForInventory(tools, options?.strict);
	if (strict === void 0) return tools.map((tool) => ({
		type: "function",
		name: tool.name,
		description: tool.description,
		parameters: tool.parameters
	}));
	return tools.map((tool) => ({
		type: "function",
		name: tool.name,
		description: tool.description,
		parameters: normalizeOpenAIStrictToolParameters(tool.parameters, strict),
		strict
	}));
}
async function processResponsesStream(openaiStream, output, stream, model, options) {
	let currentItem = null;
	let currentBlock = null;
	const blockIndex = () => output.content.length - 1;
	for await (const rawEvent of openaiStream) {
		const event = rawEvent;
		const type = stringifyUnknown(event.type);
		if (type === "response.created") output.responseId = stringifyUnknown(event.response?.id);
		else if (type === "response.output_item.added") {
			const item = event.item;
			if (item.type === "reasoning") {
				currentItem = item;
				currentBlock = {
					type: "thinking",
					thinking: ""
				};
				output.content.push(currentBlock);
				stream.push({
					type: "thinking_start",
					contentIndex: blockIndex(),
					partial: output
				});
			} else if (item.type === "message") {
				currentItem = item;
				currentBlock = {
					type: "text",
					text: ""
				};
				output.content.push(currentBlock);
				stream.push({
					type: "text_start",
					contentIndex: blockIndex(),
					partial: output
				});
			} else if (item.type === "function_call") {
				currentItem = item;
				currentBlock = {
					type: "toolCall",
					id: `${stringifyUnknown(item.call_id)}|${stringifyUnknown(item.id)}`,
					name: stringifyUnknown(item.name),
					arguments: {},
					partialJson: stringifyJsonLike(item.arguments)
				};
				output.content.push(currentBlock);
				stream.push({
					type: "toolcall_start",
					contentIndex: blockIndex(),
					partial: output
				});
			}
		} else if (type === "response.reasoning_summary_text.delta") {
			if (currentItem?.type === "reasoning" && currentBlock?.type === "thinking") {
				currentBlock.thinking = `${stringifyUnknown(currentBlock.thinking)}${stringifyUnknown(event.delta)}`;
				stream.push({
					type: "thinking_delta",
					contentIndex: blockIndex(),
					delta: stringifyUnknown(event.delta),
					partial: output
				});
			}
		} else if (type === "response.output_text.delta" || type === "response.refusal.delta") {
			if (currentItem?.type === "message" && currentBlock?.type === "text") {
				currentBlock.text = `${stringifyUnknown(currentBlock.text)}${stringifyUnknown(event.delta)}`;
				stream.push({
					type: "text_delta",
					contentIndex: blockIndex(),
					delta: stringifyUnknown(event.delta),
					partial: output
				});
			}
		} else if (type === "response.function_call_arguments.delta") {
			if (currentItem?.type === "function_call" && currentBlock?.type === "toolCall") {
				currentBlock.partialJson = `${stringifyJsonLike(currentBlock.partialJson)}${stringifyJsonLike(event.delta)}`;
				currentBlock.arguments = parseStreamingJson(stringifyJsonLike(currentBlock.partialJson));
				stream.push({
					type: "toolcall_delta",
					contentIndex: blockIndex(),
					delta: stringifyJsonLike(event.delta),
					partial: output
				});
			}
		} else if (type === "response.output_item.done") {
			const item = event.item;
			if (item.type === "reasoning" && currentBlock?.type === "thinking") {
				const summary = Array.isArray(item.summary) ? item.summary.map((part) => {
					return part.text ?? "";
				}).join("\n\n") : "";
				currentBlock.thinking = summary;
				currentBlock.thinkingSignature = JSON.stringify(item);
				stream.push({
					type: "thinking_end",
					contentIndex: blockIndex(),
					content: stringifyUnknown(currentBlock.thinking),
					partial: output
				});
				currentBlock = null;
			} else if (item.type === "message" && currentBlock?.type === "text") {
				const content = Array.isArray(item.content) ? item.content : [];
				currentBlock.text = content.map((part) => {
					const contentPart = part;
					return contentPart.type === "output_text" ? contentPart.text ?? "" : contentPart.refusal ?? "";
				}).join("");
				currentBlock.textSignature = encodeTextSignatureV1(stringifyUnknown(item.id), item.phase ?? void 0);
				stream.push({
					type: "text_end",
					contentIndex: blockIndex(),
					content: stringifyUnknown(currentBlock.text),
					partial: output
				});
				currentBlock = null;
			} else if (item.type === "function_call") {
				const args = currentBlock?.type === "toolCall" && currentBlock.partialJson ? parseStreamingJson(stringifyJsonLike(currentBlock.partialJson, "{}")) : parseStreamingJson(stringifyJsonLike(item.arguments, "{}"));
				stream.push({
					type: "toolcall_end",
					contentIndex: blockIndex(),
					toolCall: {
						type: "toolCall",
						id: `${stringifyUnknown(item.call_id)}|${stringifyUnknown(item.id)}`,
						name: stringifyUnknown(item.name),
						arguments: args
					},
					partial: output
				});
				currentBlock = null;
			}
		} else if (type === "response.completed") {
			const response = event.response;
			if (typeof response?.id === "string") output.responseId = response.id;
			const usage = response?.usage;
			if (usage) {
				const cachedTokens = usage.input_tokens_details?.cached_tokens || 0;
				output.usage = {
					input: (usage.input_tokens || 0) - cachedTokens,
					output: usage.output_tokens || 0,
					cacheRead: cachedTokens,
					cacheWrite: 0,
					totalTokens: usage.total_tokens || 0,
					cost: {
						input: 0,
						output: 0,
						cacheRead: 0,
						cacheWrite: 0,
						total: 0
					}
				};
			}
			calculateCost(model, output.usage);
			if (options?.applyServiceTierPricing) options.applyServiceTierPricing(output.usage, response?.service_tier ?? options.serviceTier);
			output.stopReason = mapResponsesStopReason(response?.status);
			if (output.content.some((block) => block.type === "toolCall") && output.stopReason === "stop") output.stopReason = "toolUse";
		} else if (type === "error") throw new Error(`Error Code ${stringifyUnknown(event.code, "unknown")}: ${stringifyUnknown(event.message, "Unknown error")}`);
		else if (type === "response.failed") {
			const response = event.response;
			const msg = response?.error ? `${response.error.code || "unknown"}: ${response.error.message || "no message"}` : response?.incomplete_details?.reason ? `incomplete: ${response.incomplete_details.reason}` : "Unknown error (no error details in response)";
			throw new Error(msg);
		}
	}
}
function mapResponsesStopReason(status) {
	if (!status) return "stop";
	switch (status) {
		case "completed": return "stop";
		case "incomplete": return "length";
		case "failed":
		case "cancelled": return "error";
		case "in_progress":
		case "queued": return "stop";
		default: throw new Error(`Unhandled stop reason: ${status}`);
	}
}
function buildOpenAIClientHeaders(model, context, optionHeaders, turnHeaders) {
	const headers = { ...model.headers };
	if (model.provider === "github-copilot") Object.assign(headers, buildCopilotDynamicHeaders({
		messages: context.messages,
		hasImages: hasCopilotVisionInput(context.messages)
	}));
	if (optionHeaders) Object.assign(headers, optionHeaders);
	if (turnHeaders) Object.assign(headers, turnHeaders);
	return headers;
}
function resolveProviderTransportTurnState(model, params) {
	return resolveProviderTransportTurnStateWithPlugin({
		provider: model.provider,
		context: {
			provider: model.provider,
			modelId: model.id,
			model,
			sessionId: params.sessionId,
			turnId: params.turnId,
			attempt: params.attempt,
			transport: params.transport
		}
	});
}
function createOpenAIResponsesClient(model, context, apiKey, optionHeaders, turnHeaders) {
	return new OpenAI({
		apiKey,
		baseURL: model.baseUrl,
		dangerouslyAllowBrowser: true,
		defaultHeaders: buildOpenAIClientHeaders(model, context, optionHeaders, turnHeaders),
		fetch: buildGuardedModelFetch(model)
	});
}
function createOpenAIResponsesTransportStreamFn() {
	return (model, context, options) => {
		const eventStream = createAssistantMessageEventStream();
		const stream = eventStream;
		(async () => {
			const output = {
				role: "assistant",
				content: [],
				api: model.api,
				provider: model.provider,
				model: model.id,
				usage: {
					input: 0,
					output: 0,
					cacheRead: 0,
					cacheWrite: 0,
					totalTokens: 0,
					cost: {
						input: 0,
						output: 0,
						cacheRead: 0,
						cacheWrite: 0,
						total: 0
					}
				},
				stopReason: "stop",
				timestamp: Date.now()
			};
			try {
				const apiKey = options?.apiKey || getEnvApiKey(model.provider) || "";
				const turnState = resolveProviderTransportTurnState(model, {
					sessionId: options?.sessionId,
					turnId: randomUUID(),
					attempt: 1,
					transport: "stream"
				});
				const client = createOpenAIResponsesClient(model, context, apiKey, options?.headers, turnState?.headers);
				let params = buildOpenAIResponsesParams(model, context, options, turnState?.metadata);
				const nextParams = await options?.onPayload?.(params, model);
				if (nextParams !== void 0) params = nextParams;
				params = mergeTransportMetadata(params, turnState?.metadata);
				const responseStream = await client.responses.create(params, options?.signal ? { signal: options.signal } : void 0);
				stream.push({
					type: "start",
					partial: output
				});
				await processResponsesStream(responseStream, output, stream, model, {
					serviceTier: options?.serviceTier,
					applyServiceTierPricing
				});
				if (options?.signal?.aborted) throw new Error("Request was aborted");
				if (output.stopReason === "aborted" || output.stopReason === "error") throw new Error("An unknown error occurred");
				stream.push({
					type: "done",
					reason: output.stopReason,
					message: output
				});
				stream.end();
			} catch (error) {
				output.stopReason = options?.signal?.aborted ? "aborted" : "error";
				output.errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
				stream.push({
					type: "error",
					reason: output.stopReason,
					error: output
				});
				stream.end();
			}
		})();
		return eventStream;
	};
}
function resolveCacheRetention(cacheRetention) {
	if (cacheRetention === "short" || cacheRetention === "long" || cacheRetention === "none") return cacheRetention;
	if (typeof process !== "undefined" && process.env.PI_CACHE_RETENTION === "long") return "long";
	return "short";
}
function getPromptCacheRetention(baseUrl, cacheRetention) {
	if (cacheRetention !== "long") return;
	return baseUrl?.includes("api.openai.com") ? "24h" : void 0;
}
function resolveOpenAIReasoningEffort(options) {
	return normalizeOpenAIReasoningEffort(options?.reasoningEffort ?? options?.reasoning ?? "high");
}
function coerceOpenAIApiReasoningEffort(effort) {
	const normalized = normalizeOpenAIReasoningEffort(effort);
	switch (normalized) {
		case "none":
		case "low":
		case "medium":
		case "high":
		case "xhigh": return normalized;
		default: return "high";
	}
}
function buildOpenAIResponsesParams(model, context, options, metadata) {
	const compat = getCompat(model);
	const supportsDeveloperRole = typeof compat.supportsDeveloperRole === "boolean" ? compat.supportsDeveloperRole : void 0;
	const messages = convertResponsesMessages(model, context, new Set([
		"openai",
		"openai-codex",
		"opencode",
		"azure-openai-responses"
	]), { supportsDeveloperRole });
	const cacheRetention = resolveCacheRetention(options?.cacheRetention);
	const payloadPolicy = resolveOpenAIResponsesPayloadPolicy(model, { storeMode: "disable" });
	const params = {
		model: model.id,
		input: messages,
		stream: true,
		prompt_cache_key: cacheRetention === "none" ? void 0 : options?.sessionId,
		prompt_cache_retention: getPromptCacheRetention(model.baseUrl, cacheRetention),
		...metadata ? { metadata } : {}
	};
	if (options?.maxTokens) params.max_output_tokens = options.maxTokens;
	if (options?.temperature !== void 0) params.temperature = options.temperature;
	if (options?.serviceTier !== void 0 && payloadPolicy.allowsServiceTier) params.service_tier = options.serviceTier;
	if (context.tools) params.tools = convertResponsesTools(context.tools, { strict: resolveOpenAIStrictToolSetting(model, { transport: "stream" }) });
	if (model.reasoning) {
		if (options?.reasoningEffort || options?.reasoning || options?.reasoningSummary) {
			const requestedReasoningEffort = resolveOpenAIReasoningEffort(options);
			const reasoningEffort = coerceOpenAIApiReasoningEffort(mapOpenAIReasoningEffortForModel({
				model,
				effort: requestedReasoningEffort
			}) ?? requestedReasoningEffort);
			params.reasoning = {
				effort: reasoningEffort === "none" ? "high" : reasoningEffort,
				summary: options?.reasoningSummary || "auto"
			};
			params.include = ["reasoning.encrypted_content"];
		} else if (model.provider !== "github-copilot") {
			params.reasoning = {
				effort: "high",
				summary: "auto"
			};
			params.include = ["reasoning.encrypted_content"];
		}
	}
	applyOpenAIResponsesPayloadPolicy(params, payloadPolicy);
	return params;
}
function createAzureOpenAIResponsesTransportStreamFn() {
	return (model, context, options) => {
		const eventStream = createAssistantMessageEventStream();
		const stream = eventStream;
		(async () => {
			const output = {
				role: "assistant",
				content: [],
				api: "azure-openai-responses",
				provider: model.provider,
				model: model.id,
				usage: {
					input: 0,
					output: 0,
					cacheRead: 0,
					cacheWrite: 0,
					totalTokens: 0,
					cost: {
						input: 0,
						output: 0,
						cacheRead: 0,
						cacheWrite: 0,
						total: 0
					}
				},
				stopReason: "stop",
				timestamp: Date.now()
			};
			try {
				const apiKey = options?.apiKey || getEnvApiKey(model.provider) || "";
				const turnState = resolveProviderTransportTurnState(model, {
					sessionId: options?.sessionId,
					turnId: randomUUID(),
					attempt: 1,
					transport: "stream"
				});
				const client = createAzureOpenAIClient(model, context, apiKey, options?.headers, turnState?.headers);
				let params = buildAzureOpenAIResponsesParams(model, context, options, resolveAzureDeploymentName(model), turnState?.metadata);
				const nextParams = await options?.onPayload?.(params, model);
				if (nextParams !== void 0) params = nextParams;
				params = mergeTransportMetadata(params, turnState?.metadata);
				const responseStream = await client.responses.create(params, options?.signal ? { signal: options.signal } : void 0);
				stream.push({
					type: "start",
					partial: output
				});
				await processResponsesStream(responseStream, output, stream, model);
				if (options?.signal?.aborted) throw new Error("Request was aborted");
				if (output.stopReason === "aborted" || output.stopReason === "error") throw new Error("An unknown error occurred");
				stream.push({
					type: "done",
					reason: output.stopReason,
					message: output
				});
				stream.end();
			} catch (error) {
				output.stopReason = options?.signal?.aborted ? "aborted" : "error";
				output.errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
				stream.push({
					type: "error",
					reason: output.stopReason,
					error: output
				});
				stream.end();
			}
		})();
		return eventStream;
	};
}
function normalizeAzureBaseUrl(baseUrl) {
	return baseUrl.replace(/\/+$/, "");
}
function resolveAzureDeploymentName(model) {
	const deploymentMap = process.env.AZURE_OPENAI_DEPLOYMENT_NAME_MAP;
	if (deploymentMap) for (const entry of deploymentMap.split(",")) {
		const [modelId, deploymentName] = entry.split("=", 2).map((value) => value?.trim());
		if (modelId === model.id && deploymentName) return deploymentName;
	}
	return model.id;
}
function createAzureOpenAIClient(model, context, apiKey, optionHeaders, turnHeaders) {
	return new AzureOpenAI({
		apiKey,
		apiVersion: resolveAzureOpenAIApiVersion(),
		dangerouslyAllowBrowser: true,
		defaultHeaders: buildOpenAIClientHeaders(model, context, optionHeaders, turnHeaders),
		baseURL: normalizeAzureBaseUrl(model.baseUrl),
		fetch: buildGuardedModelFetch(model)
	});
}
function buildAzureOpenAIResponsesParams(model, context, options, deploymentName, metadata) {
	const params = buildOpenAIResponsesParams(model, context, options, metadata);
	params.model = deploymentName;
	delete params.store;
	return params;
}
function hasToolHistory(messages) {
	return messages.some((message) => message.role === "toolResult" || message.role === "assistant" && message.content.some((block) => block.type === "toolCall"));
}
function createOpenAICompletionsClient(model, context, apiKey, optionHeaders) {
	return new OpenAI({
		apiKey,
		baseURL: model.baseUrl,
		dangerouslyAllowBrowser: true,
		defaultHeaders: buildOpenAIClientHeaders(model, context, optionHeaders),
		fetch: buildGuardedModelFetch(model)
	});
}
function createOpenAICompletionsTransportStreamFn() {
	return (model, context, options) => {
		const eventStream = createAssistantMessageEventStream();
		const stream = eventStream;
		(async () => {
			const output = {
				role: "assistant",
				content: [],
				api: model.api,
				provider: model.provider,
				model: model.id,
				usage: {
					input: 0,
					output: 0,
					cacheRead: 0,
					cacheWrite: 0,
					totalTokens: 0,
					cost: {
						input: 0,
						output: 0,
						cacheRead: 0,
						cacheWrite: 0,
						total: 0
					}
				},
				stopReason: "stop",
				timestamp: Date.now()
			};
			try {
				const client = createOpenAICompletionsClient(model, context, options?.apiKey || getEnvApiKey(model.provider) || "", options?.headers);
				let params = buildOpenAICompletionsParams(model, context, options);
				const nextParams = await options?.onPayload?.(params, model);
				if (nextParams !== void 0) params = nextParams;
				const responseStream = await client.chat.completions.create(params, { signal: options?.signal });
				stream.push({
					type: "start",
					partial: output
				});
				await processOpenAICompletionsStream(responseStream, output, model, stream);
				if (options?.signal?.aborted) throw new Error("Request was aborted");
				stream.push({
					type: "done",
					reason: output.stopReason,
					message: output
				});
				stream.end();
			} catch (error) {
				output.stopReason = options?.signal?.aborted ? "aborted" : "error";
				output.errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
				stream.push({
					type: "error",
					reason: output.stopReason,
					error: output
				});
				stream.end();
			}
		})();
		return eventStream;
	};
}
async function processOpenAICompletionsStream(responseStream, output, model, stream) {
	let currentBlock = null;
	let pendingThinkingDelta = null;
	const blockIndex = () => output.content.length - 1;
	const finishCurrentBlock = () => {
		if (!currentBlock) return;
		if (currentBlock.type === "toolCall") {
			currentBlock.arguments = parseStreamingJson(currentBlock.partialArgs);
			const completed = {
				...currentBlock,
				arguments: parseStreamingJson(currentBlock.partialArgs)
			};
			output.content[blockIndex()] = completed;
		}
	};
	const appendThinkingDelta = (reasoningDelta) => {
		if (!currentBlock || currentBlock.type !== "thinking") {
			finishCurrentBlock();
			currentBlock = {
				type: "thinking",
				thinking: "",
				thinkingSignature: reasoningDelta.signature
			};
			output.content.push(currentBlock);
			stream.push({
				type: "thinking_start",
				contentIndex: blockIndex(),
				partial: output
			});
		}
		currentBlock.thinking += reasoningDelta.text;
		stream.push({
			type: "thinking_delta",
			contentIndex: blockIndex(),
			delta: reasoningDelta.text,
			partial: output
		});
	};
	const flushPendingThinkingDelta = () => {
		if (!pendingThinkingDelta) return;
		const bufferedDelta = pendingThinkingDelta;
		pendingThinkingDelta = null;
		appendThinkingDelta(bufferedDelta);
	};
	for await (const chunk of responseStream) {
		output.responseId ||= chunk.id;
		if (chunk.usage) output.usage = parseTransportChunkUsage(chunk.usage, model);
		const choice = Array.isArray(chunk.choices) ? chunk.choices[0] : void 0;
		if (!choice) continue;
		const choiceUsage = choice.usage;
		if (!chunk.usage && choiceUsage) output.usage = parseTransportChunkUsage(choiceUsage, model);
		if (choice.finish_reason) {
			const finishReasonResult = mapStopReason(choice.finish_reason);
			output.stopReason = finishReasonResult.stopReason;
			if (finishReasonResult.errorMessage) output.errorMessage = finishReasonResult.errorMessage;
		}
		if (!choice.delta) continue;
		if (choice.delta.content) {
			flushPendingThinkingDelta();
			if (!currentBlock || currentBlock.type !== "text") {
				finishCurrentBlock();
				currentBlock = {
					type: "text",
					text: ""
				};
				output.content.push(currentBlock);
				stream.push({
					type: "text_start",
					contentIndex: blockIndex(),
					partial: output
				});
			}
			currentBlock.text += choice.delta.content;
			stream.push({
				type: "text_delta",
				contentIndex: blockIndex(),
				delta: choice.delta.content,
				partial: output
			});
			continue;
		}
		const reasoningDelta = getCompletionsReasoningDelta(choice.delta);
		if (reasoningDelta) if (currentBlock?.type === "toolCall") if (!pendingThinkingDelta) pendingThinkingDelta = { ...reasoningDelta };
		else pendingThinkingDelta.text += reasoningDelta.text;
		else appendThinkingDelta(reasoningDelta);
		if (choice.delta.tool_calls && choice.delta.tool_calls.length > 0) for (const toolCall of choice.delta.tool_calls) {
			if (!currentBlock || currentBlock.type !== "toolCall" || toolCall.id && currentBlock.id !== toolCall.id) {
				finishCurrentBlock();
				currentBlock = {
					type: "toolCall",
					id: toolCall.id || "",
					name: toolCall.function?.name || "",
					arguments: {},
					partialArgs: ""
				};
				output.content.push(currentBlock);
				stream.push({
					type: "toolcall_start",
					contentIndex: blockIndex(),
					partial: output
				});
			}
			if (currentBlock.type !== "toolCall") continue;
			if (toolCall.id) currentBlock.id = toolCall.id;
			if (toolCall.function?.name) currentBlock.name = toolCall.function.name;
			if (toolCall.function?.arguments) {
				currentBlock.partialArgs += toolCall.function.arguments;
				currentBlock.arguments = parseStreamingJson(currentBlock.partialArgs);
				stream.push({
					type: "toolcall_delta",
					contentIndex: blockIndex(),
					delta: toolCall.function.arguments,
					partial: output
				});
			}
		}
	}
	finishCurrentBlock();
	flushPendingThinkingDelta();
	const hasToolCalls = output.content.some((block) => block.type === "toolCall");
	if (output.stopReason === "toolUse" && !hasToolCalls) output.stopReason = "stop";
}
function getCompletionsReasoningDelta(delta) {
	const reasoningDetails = delta.reasoning_details;
	if (Array.isArray(reasoningDetails)) {
		let text = "";
		for (const item of reasoningDetails) {
			const detail = item;
			if (detail.type === "reasoning.text" && typeof detail.text === "string" && detail.text) text += detail.text;
		}
		if (text) return {
			signature: "reasoning_details",
			text
		};
	}
	for (const field of [
		"reasoning_content",
		"reasoning",
		"reasoning_text"
	]) {
		const value = delta[field];
		if (typeof value === "string" && value.length > 0) return {
			signature: field,
			text: value
		};
	}
	return null;
}
function detectCompat(model) {
	const provider = model.provider;
	const { capabilities, defaults: compatDefaults } = detectOpenAICompletionsCompat(model);
	const endpointClass = capabilities.endpointClass;
	const reasoningEffortMap = (endpointClass === "groq-native" || endpointClass === "default" && provider === "groq") && model.id === "qwen/qwen3-32b" ? {
		minimal: "default",
		low: "default",
		medium: "default",
		high: "default",
		xhigh: "default"
	} : {};
	return {
		supportsStore: compatDefaults.supportsStore,
		supportsDeveloperRole: compatDefaults.supportsDeveloperRole,
		supportsReasoningEffort: compatDefaults.supportsReasoningEffort,
		reasoningEffortMap,
		supportsUsageInStreaming: compatDefaults.supportsUsageInStreaming,
		maxTokensField: compatDefaults.maxTokensField,
		requiresToolResultName: false,
		requiresAssistantAfterToolResult: false,
		requiresThinkingAsText: false,
		thinkingFormat: compatDefaults.thinkingFormat,
		openRouterRouting: {},
		vercelGatewayRouting: {},
		supportsStrictMode: compatDefaults.supportsStrictMode
	};
}
function getCompat(model) {
	const detected = detectCompat(model);
	const compat = model.compat ?? {};
	const supportsStore = typeof compat.supportsStore === "boolean" ? compat.supportsStore : detected.supportsStore;
	const supportsReasoningEffort = typeof compat.supportsReasoningEffort === "boolean" ? compat.supportsReasoningEffort : detected.supportsReasoningEffort;
	return {
		supportsStore,
		supportsDeveloperRole: compat.supportsDeveloperRole ?? detected.supportsDeveloperRole,
		supportsReasoningEffort,
		reasoningEffortMap: resolveOpenAIReasoningEffortMap(model, detected.reasoningEffortMap),
		supportsUsageInStreaming: compat.supportsUsageInStreaming ?? detected.supportsUsageInStreaming,
		maxTokensField: compat.maxTokensField ?? detected.maxTokensField,
		requiresToolResultName: compat.requiresToolResultName ?? detected.requiresToolResultName,
		requiresAssistantAfterToolResult: compat.requiresAssistantAfterToolResult ?? detected.requiresAssistantAfterToolResult,
		requiresThinkingAsText: compat.requiresThinkingAsText ?? detected.requiresThinkingAsText,
		thinkingFormat: compat.thinkingFormat ?? detected.thinkingFormat,
		openRouterRouting: compat.openRouterRouting ?? {},
		vercelGatewayRouting: compat.vercelGatewayRouting ?? detected.vercelGatewayRouting,
		supportsStrictMode: compat.supportsStrictMode ?? detected.supportsStrictMode,
		requiresStringContent: compat.requiresStringContent ?? false
	};
}
function mapReasoningEffort(effort, reasoningEffortMap) {
	return reasoningEffortMap[effort] ?? effort;
}
function resolveOpenAICompletionsReasoningEffort(options) {
	return options?.reasoningEffort ?? options?.reasoning ?? "high";
}
function mapNativeOpenAIReasoningEffort(effort, reasoningEffortMap) {
	return normalizeOpenAIReasoningEffort(mapReasoningEffort(effort, reasoningEffortMap));
}
function convertTools(tools, compat, model) {
	const strict = resolveOpenAIStrictToolFlagForInventory(tools, resolveOpenAIStrictToolSetting(model, {
		transport: "stream",
		supportsStrictMode: compat?.supportsStrictMode
	}));
	return tools.map((tool) => ({
		type: "function",
		function: {
			name: tool.name,
			description: tool.description,
			parameters: normalizeOpenAIStrictToolParameters(tool.parameters, strict === true),
			...strict === void 0 ? {} : { strict }
		}
	}));
}
function buildOpenAICompletionsParams(model, context, options) {
	const compat = getCompat(model);
	const messages = convertMessages(model, context.systemPrompt ? {
		...context,
		systemPrompt: stripSystemPromptCacheBoundary(context.systemPrompt)
	} : context, compat);
	const params = {
		model: model.id,
		messages: compat.requiresStringContent ? flattenCompletionMessagesToStringContent(messages) : messages,
		stream: true
	};
	if (compat.supportsUsageInStreaming) params.stream_options = { include_usage: true };
	if (compat.supportsStore) params.store = false;
	if (options?.maxTokens) if (compat.maxTokensField === "max_tokens") params.max_tokens = options.maxTokens;
	else params.max_completion_tokens = options.maxTokens;
	if (options?.temperature !== void 0) params.temperature = options.temperature;
	if (context.tools) {
		params.tools = convertTools(context.tools, compat, model);
		if (options?.toolChoice) params.tool_choice = options.toolChoice;
	} else if (hasToolHistory(context.messages)) params.tools = [];
	const completionsReasoningEffort = resolveOpenAICompletionsReasoningEffort(options);
	if (compat.thinkingFormat === "openrouter" && model.reasoning && completionsReasoningEffort) params.reasoning = { effort: mapReasoningEffort(completionsReasoningEffort, compat.reasoningEffortMap) };
	else if (completionsReasoningEffort && model.reasoning && compat.supportsReasoningEffort) params.reasoning_effort = mapNativeOpenAIReasoningEffort(completionsReasoningEffort, compat.reasoningEffortMap);
	return params;
}
function parseTransportChunkUsage(rawUsage, model) {
	const cachedTokens = rawUsage.prompt_tokens_details?.cached_tokens || 0;
	const promptTokens = rawUsage.prompt_tokens || 0;
	const input = Math.max(0, promptTokens - cachedTokens);
	const outputTokens = rawUsage.completion_tokens || 0;
	const usage = {
		input,
		output: outputTokens,
		cacheRead: cachedTokens,
		cacheWrite: 0,
		totalTokens: input + outputTokens + cachedTokens,
		cost: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0,
			total: 0
		}
	};
	calculateCost(model, usage);
	return usage;
}
function mapStopReason(reason) {
	if (reason === null) return { stopReason: "stop" };
	switch (reason) {
		case "stop":
		case "end": return { stopReason: "stop" };
		case "length": return { stopReason: "length" };
		case "function_call":
		case "tool_calls": return { stopReason: "toolUse" };
		case "content_filter": return {
			stopReason: "error",
			errorMessage: "Provider finish_reason: content_filter"
		};
		case "network_error": return {
			stopReason: "error",
			errorMessage: "Provider finish_reason: network_error"
		};
		default: return {
			stopReason: "error",
			errorMessage: `Provider finish_reason: ${reason}`
		};
	}
}
//#endregion
//#region src/agents/provider-transport-stream.ts
const SUPPORTED_TRANSPORT_APIS = new Set([
	"openai-responses",
	"openai-codex-responses",
	"openai-completions",
	"azure-openai-responses",
	"anthropic-messages",
	"google-generative-ai"
]);
const SIMPLE_TRANSPORT_API_ALIAS = {
	"openai-responses": "openclaw-openai-responses-transport",
	"openai-codex-responses": "openclaw-openai-responses-transport",
	"openai-completions": "openclaw-openai-completions-transport",
	"azure-openai-responses": "openclaw-azure-openai-responses-transport",
	"anthropic-messages": "openclaw-anthropic-messages-transport",
	"google-generative-ai": "openclaw-google-generative-ai-transport"
};
function createSupportedTransportStreamFn(api) {
	switch (api) {
		case "openai-responses":
		case "openai-codex-responses": return createOpenAIResponsesTransportStreamFn();
		case "openai-completions": return createOpenAICompletionsTransportStreamFn();
		case "azure-openai-responses": return createAzureOpenAIResponsesTransportStreamFn();
		case "anthropic-messages": return createAnthropicMessagesTransportStreamFn();
		case "google-generative-ai": return createGoogleGenerativeAiTransportStreamFn();
		default: return;
	}
}
function hasTransportOverrides(model) {
	const request = getModelProviderRequestTransport(model);
	return Boolean(request?.proxy || request?.tls);
}
function isTransportAwareApiSupported(api) {
	return SUPPORTED_TRANSPORT_APIS.has(api);
}
function resolveTransportAwareSimpleApi(api) {
	return SIMPLE_TRANSPORT_API_ALIAS[api];
}
function createTransportAwareStreamFnForModel(model) {
	if (!hasTransportOverrides(model)) return;
	if (!isTransportAwareApiSupported(model.api)) throw new Error(`Model-provider request.proxy/request.tls is not yet supported for api "${model.api}"`);
	return createSupportedTransportStreamFn(model.api);
}
function createBoundaryAwareStreamFnForModel(model) {
	if (!isTransportAwareApiSupported(model.api)) return;
	return createSupportedTransportStreamFn(model.api);
}
function prepareTransportAwareSimpleModel(model) {
	const streamFn = createTransportAwareStreamFnForModel(model);
	const alias = resolveTransportAwareSimpleApi(model.api);
	if (!streamFn || !alias) return model;
	return {
		...model,
		api: alias
	};
}
function buildTransportAwareSimpleStreamFn(model) {
	return createTransportAwareStreamFnForModel(model);
}
//#endregion
//#region src/agents/custom-api-registry.ts
const CUSTOM_API_SOURCE_PREFIX = "openclaw-custom-api:";
function getCustomApiRegistrySourceId(api) {
	return `${CUSTOM_API_SOURCE_PREFIX}${api}`;
}
function ensureCustomApiRegistered(api, streamFn) {
	if (getApiProvider(api)) return false;
	registerApiProvider({
		api,
		stream: (model, context, options) => streamFn(model, context, options),
		streamSimple: (model, context, options) => streamFn(model, context, options)
	}, getCustomApiRegistrySourceId(api));
	return true;
}
//#endregion
//#region src/agents/provider-stream.ts
function registerProviderStreamForModel(params) {
	const streamFn = resolveProviderStreamFn({
		provider: params.model.provider,
		config: params.cfg,
		workspaceDir: params.workspaceDir,
		env: params.env,
		context: {
			config: params.cfg,
			agentDir: params.agentDir,
			workspaceDir: params.workspaceDir,
			provider: params.model.provider,
			modelId: params.model.id,
			model: params.model
		}
	}) ?? createTransportAwareStreamFnForModel(params.model);
	if (!streamFn) return;
	ensureCustomApiRegistered(params.model.api, streamFn);
	return streamFn;
}
//#endregion
//#region src/plugin-sdk/anthropic-vertex.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "anthropic-vertex",
		artifactBasename: "api.js"
	});
}
const resolveAnthropicVertexClientRegion = ((...args) => loadFacadeModule().resolveAnthropicVertexClientRegion(...args));
const resolveAnthropicVertexProjectId = ((...args) => loadFacadeModule().resolveAnthropicVertexProjectId(...args));
//#endregion
//#region src/agents/anthropic-vertex-stream.ts
function resolveAnthropicVertexMaxTokens(params) {
	const modelMax = typeof params.modelMaxTokens === "number" && Number.isFinite(params.modelMaxTokens) && params.modelMaxTokens > 0 ? Math.floor(params.modelMaxTokens) : void 0;
	const requested = typeof params.requestedMaxTokens === "number" && Number.isFinite(params.requestedMaxTokens) && params.requestedMaxTokens > 0 ? Math.floor(params.requestedMaxTokens) : void 0;
	if (modelMax !== void 0 && requested !== void 0) return Math.min(requested, modelMax);
	return requested ?? modelMax;
}
function createAnthropicVertexOnPayload(params) {
	const policy = resolveAnthropicPayloadPolicy({
		provider: params.model.provider,
		api: params.model.api,
		baseUrl: params.model.baseUrl,
		cacheRetention: params.cacheRetention,
		enableCacheControl: true
	});
	function applyPolicy(payload) {
		if (payload && typeof payload === "object" && !Array.isArray(payload)) applyAnthropicPayloadPolicyToParams(payload, policy);
		return payload;
	}
	return async (payload, model) => {
		const shapedPayload = applyPolicy(payload);
		const nextPayload = await params.onPayload?.(shapedPayload, model);
		if (nextPayload === void 0 || nextPayload === shapedPayload) return shapedPayload;
		return applyPolicy(nextPayload);
	};
}
/**
* Create a StreamFn that routes through pi-ai's `streamAnthropic` with an
* injected `AnthropicVertex` client.  All streaming, message conversion, and
* event handling is handled by pi-ai — we only supply the GCP-authenticated
* client and map SimpleStreamOptions → AnthropicOptions.
*/
function createAnthropicVertexStreamFn(projectId, region, baseURL) {
	const client = new AnthropicVertex({
		region,
		...baseURL ? { baseURL } : {},
		...projectId ? { projectId } : {}
	});
	return (model, context, options) => {
		const transportModel = model;
		const maxTokens = resolveAnthropicVertexMaxTokens({
			modelMaxTokens: transportModel.maxTokens,
			requestedMaxTokens: options?.maxTokens
		});
		const opts = {
			client,
			temperature: options?.temperature,
			...maxTokens !== void 0 ? { maxTokens } : {},
			signal: options?.signal,
			cacheRetention: options?.cacheRetention,
			sessionId: options?.sessionId,
			headers: options?.headers,
			onPayload: createAnthropicVertexOnPayload({
				model: transportModel,
				cacheRetention: options?.cacheRetention,
				onPayload: options?.onPayload
			}),
			maxRetryDelayMs: options?.maxRetryDelayMs,
			metadata: options?.metadata
		};
		if (options?.reasoning) if (model.id.includes("opus-4-6") || model.id.includes("opus-4.6") || model.id.includes("sonnet-4-6") || model.id.includes("sonnet-4.6")) {
			opts.thinkingEnabled = true;
			opts.effort = {
				minimal: "low",
				low: "low",
				medium: "medium",
				high: "high",
				xhigh: model.id.includes("opus-4-6") || model.id.includes("opus-4.6") ? "max" : "high"
			}[options.reasoning] ?? "high";
		} else {
			opts.thinkingEnabled = true;
			const budgets = options.thinkingBudgets;
			opts.thinkingBudgetTokens = (budgets && options.reasoning in budgets ? budgets[options.reasoning] : void 0) ?? 1e4;
		}
		else opts.thinkingEnabled = false;
		return streamAnthropic(transportModel, context, opts);
	};
}
function resolveAnthropicVertexSdkBaseUrl(baseUrl) {
	const trimmed = baseUrl?.trim();
	if (!trimmed) return;
	try {
		const url = new URL(trimmed);
		const normalizedPath = url.pathname.replace(/\/+$/, "");
		if (!normalizedPath || normalizedPath === "") {
			url.pathname = "/v1";
			return url.toString().replace(/\/$/, "");
		}
		if (!normalizedPath.endsWith("/v1")) {
			url.pathname = `${normalizedPath}/v1`;
			return url.toString().replace(/\/$/, "");
		}
		return trimmed;
	} catch {
		return trimmed;
	}
}
function createAnthropicVertexStreamFnForModel(model, env = process.env) {
	return createAnthropicVertexStreamFn(resolveAnthropicVertexProjectId(env), resolveAnthropicVertexClientRegion({
		baseUrl: model.baseUrl,
		env
	}), resolveAnthropicVertexSdkBaseUrl(model.baseUrl));
}
//#endregion
export { createBoundaryAwareStreamFnForModel as a, mergeTransportMetadata as c, normalizeOpenAIReasoningEffort as d, mapOpenAIReasoningEffortForModel as f, resolveOpenAIStrictToolSetting as h, buildTransportAwareSimpleStreamFn as i, sanitizeTransportPayloadText as l, resolveOpenAIStrictToolFlagForInventory as m, registerProviderStreamForModel as n, prepareTransportAwareSimpleModel as o, normalizeOpenAIStrictToolParameters as p, ensureCustomApiRegistered as r, mergeTransportHeaders as s, createAnthropicVertexStreamFnForModel as t, buildGuardedModelFetch as u };
