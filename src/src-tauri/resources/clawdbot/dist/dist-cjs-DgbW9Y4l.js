import { a as __toCommonJS, i as __require, t as __commonJSMin } from "./chunk-DORXReHP.js";
import { t as require_dist_cjs$4 } from "./dist-cjs-g8U_euY0.js";
import { n as init_client, t as client_exports } from "./client-Cta4m6Io.js";
import { _ as tslib_es6_exports, g as init_tslib_es6, m as require_dist_cjs$5, t as require_dist_cjs$6, v as require_dist_cjs$7 } from "./dist-cjs-Bw_je4qJ.js";
//#region node_modules/@aws-sdk/credential-provider-http/node_modules/@smithy/querystring-builder/dist-cjs/index.js
var require_dist_cjs$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var utilUriEscape = require_dist_cjs$5();
	function buildQueryString(query) {
		const parts = [];
		for (let key of Object.keys(query).sort()) {
			const value = query[key];
			key = utilUriEscape.escapeUri(key);
			if (Array.isArray(value)) for (let i = 0, iLen = value.length; i < iLen; i++) parts.push(`${key}=${utilUriEscape.escapeUri(value[i])}`);
			else {
				let qsEntry = key;
				if (value || typeof value === "string") qsEntry += `=${utilUriEscape.escapeUri(value)}`;
				parts.push(qsEntry);
			}
		}
		return parts.join("&");
	}
	exports.buildQueryString = buildQueryString;
}));
//#endregion
//#region node_modules/@aws-sdk/credential-provider-http/node_modules/@smithy/node-http-handler/dist-cjs/index.js
var require_dist_cjs$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var protocolHttp = require_dist_cjs$4();
	var querystringBuilder = require_dist_cjs$3();
	var http = __require("http");
	var https = __require("https");
	var stream = __require("stream");
	var http2 = __require("http2");
	function buildAbortError(abortSignal) {
		const reason = abortSignal && typeof abortSignal === "object" && "reason" in abortSignal ? abortSignal.reason : void 0;
		if (reason) {
			if (reason instanceof Error) {
				const abortError = /* @__PURE__ */ new Error("Request aborted");
				abortError.name = "AbortError";
				abortError.cause = reason;
				return abortError;
			}
			const abortError = new Error(String(reason));
			abortError.name = "AbortError";
			return abortError;
		}
		const abortError = /* @__PURE__ */ new Error("Request aborted");
		abortError.name = "AbortError";
		return abortError;
	}
	const NODEJS_TIMEOUT_ERROR_CODES = [
		"ECONNRESET",
		"EPIPE",
		"ETIMEDOUT"
	];
	const getTransformedHeaders = (headers) => {
		const transformedHeaders = {};
		for (const name of Object.keys(headers)) {
			const headerValues = headers[name];
			transformedHeaders[name] = Array.isArray(headerValues) ? headerValues.join(",") : headerValues;
		}
		return transformedHeaders;
	};
	const timing = {
		setTimeout: (cb, ms) => setTimeout(cb, ms),
		clearTimeout: (timeoutId) => clearTimeout(timeoutId)
	};
	const DEFER_EVENT_LISTENER_TIME$2 = 1e3;
	const setConnectionTimeout = (request, reject, timeoutInMs = 0) => {
		if (!timeoutInMs) return -1;
		const registerTimeout = (offset) => {
			const timeoutId = timing.setTimeout(() => {
				request.destroy();
				reject(Object.assign(/* @__PURE__ */ new Error(`@smithy/node-http-handler - the request socket did not establish a connection with the server within the configured timeout of ${timeoutInMs} ms.`), { name: "TimeoutError" }));
			}, timeoutInMs - offset);
			const doWithSocket = (socket) => {
				if (socket?.connecting) socket.on("connect", () => {
					timing.clearTimeout(timeoutId);
				});
				else timing.clearTimeout(timeoutId);
			};
			if (request.socket) doWithSocket(request.socket);
			else request.on("socket", doWithSocket);
		};
		if (timeoutInMs < 2e3) {
			registerTimeout(0);
			return 0;
		}
		return timing.setTimeout(registerTimeout.bind(null, DEFER_EVENT_LISTENER_TIME$2), DEFER_EVENT_LISTENER_TIME$2);
	};
	const setRequestTimeout = (req, reject, timeoutInMs = 0, throwOnRequestTimeout, logger) => {
		if (timeoutInMs) return timing.setTimeout(() => {
			let msg = `@smithy/node-http-handler - [${throwOnRequestTimeout ? "ERROR" : "WARN"}] a request has exceeded the configured ${timeoutInMs} ms requestTimeout.`;
			if (throwOnRequestTimeout) {
				const error = Object.assign(new Error(msg), {
					name: "TimeoutError",
					code: "ETIMEDOUT"
				});
				req.destroy(error);
				reject(error);
			} else {
				msg += ` Init client requestHandler with throwOnRequestTimeout=true to turn this into an error.`;
				logger?.warn?.(msg);
			}
		}, timeoutInMs);
		return -1;
	};
	const DEFER_EVENT_LISTENER_TIME$1 = 3e3;
	const setSocketKeepAlive = (request, { keepAlive, keepAliveMsecs }, deferTimeMs = DEFER_EVENT_LISTENER_TIME$1) => {
		if (keepAlive !== true) return -1;
		const registerListener = () => {
			if (request.socket) request.socket.setKeepAlive(keepAlive, keepAliveMsecs || 0);
			else request.on("socket", (socket) => {
				socket.setKeepAlive(keepAlive, keepAliveMsecs || 0);
			});
		};
		if (deferTimeMs === 0) {
			registerListener();
			return 0;
		}
		return timing.setTimeout(registerListener, deferTimeMs);
	};
	const DEFER_EVENT_LISTENER_TIME = 3e3;
	const setSocketTimeout = (request, reject, timeoutInMs = 0) => {
		const registerTimeout = (offset) => {
			const timeout = timeoutInMs - offset;
			const onTimeout = () => {
				request.destroy();
				reject(Object.assign(/* @__PURE__ */ new Error(`@smithy/node-http-handler - the request socket timed out after ${timeoutInMs} ms of inactivity (configured by client requestHandler).`), { name: "TimeoutError" }));
			};
			if (request.socket) {
				request.socket.setTimeout(timeout, onTimeout);
				request.on("close", () => request.socket?.removeListener("timeout", onTimeout));
			} else request.setTimeout(timeout, onTimeout);
		};
		if (0 < timeoutInMs && timeoutInMs < 6e3) {
			registerTimeout(0);
			return 0;
		}
		return timing.setTimeout(registerTimeout.bind(null, timeoutInMs === 0 ? 0 : DEFER_EVENT_LISTENER_TIME), DEFER_EVENT_LISTENER_TIME);
	};
	const MIN_WAIT_TIME = 6e3;
	async function writeRequestBody(httpRequest, request, maxContinueTimeoutMs = MIN_WAIT_TIME, externalAgent = false) {
		const headers = request.headers ?? {};
		const expect = headers.Expect || headers.expect;
		let timeoutId = -1;
		let sendBody = true;
		if (!externalAgent && expect === "100-continue") sendBody = await Promise.race([new Promise((resolve) => {
			timeoutId = Number(timing.setTimeout(() => resolve(true), Math.max(MIN_WAIT_TIME, maxContinueTimeoutMs)));
		}), new Promise((resolve) => {
			httpRequest.on("continue", () => {
				timing.clearTimeout(timeoutId);
				resolve(true);
			});
			httpRequest.on("response", () => {
				timing.clearTimeout(timeoutId);
				resolve(false);
			});
			httpRequest.on("error", () => {
				timing.clearTimeout(timeoutId);
				resolve(false);
			});
		})]);
		if (sendBody) writeBody(httpRequest, request.body);
	}
	function writeBody(httpRequest, body) {
		if (body instanceof stream.Readable) {
			body.pipe(httpRequest);
			return;
		}
		if (body) {
			const isBuffer = Buffer.isBuffer(body);
			if (isBuffer || typeof body === "string") {
				if (isBuffer && body.byteLength === 0) httpRequest.end();
				else httpRequest.end(body);
				return;
			}
			const uint8 = body;
			if (typeof uint8 === "object" && uint8.buffer && typeof uint8.byteOffset === "number" && typeof uint8.byteLength === "number") {
				httpRequest.end(Buffer.from(uint8.buffer, uint8.byteOffset, uint8.byteLength));
				return;
			}
			httpRequest.end(Buffer.from(body));
			return;
		}
		httpRequest.end();
	}
	const DEFAULT_REQUEST_TIMEOUT = 0;
	var NodeHttpHandler = class NodeHttpHandler {
		config;
		configProvider;
		socketWarningTimestamp = 0;
		externalAgent = false;
		metadata = { handlerProtocol: "http/1.1" };
		static create(instanceOrOptions) {
			if (typeof instanceOrOptions?.handle === "function") return instanceOrOptions;
			return new NodeHttpHandler(instanceOrOptions);
		}
		static checkSocketUsage(agent, socketWarningTimestamp, logger = console) {
			const { sockets, requests, maxSockets } = agent;
			if (typeof maxSockets !== "number" || maxSockets === Infinity) return socketWarningTimestamp;
			if (Date.now() - 15e3 < socketWarningTimestamp) return socketWarningTimestamp;
			if (sockets && requests) for (const origin in sockets) {
				const socketsInUse = sockets[origin]?.length ?? 0;
				const requestsEnqueued = requests[origin]?.length ?? 0;
				if (socketsInUse >= maxSockets && requestsEnqueued >= 2 * maxSockets) {
					logger?.warn?.(`@smithy/node-http-handler:WARN - socket usage at capacity=${socketsInUse} and ${requestsEnqueued} additional requests are enqueued.
See https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/node-configuring-maxsockets.html
or increase socketAcquisitionWarningTimeout=(millis) in the NodeHttpHandler config.`);
					return Date.now();
				}
			}
			return socketWarningTimestamp;
		}
		constructor(options) {
			this.configProvider = new Promise((resolve, reject) => {
				if (typeof options === "function") options().then((_options) => {
					resolve(this.resolveDefaultConfig(_options));
				}).catch(reject);
				else resolve(this.resolveDefaultConfig(options));
			});
		}
		resolveDefaultConfig(options) {
			const { requestTimeout, connectionTimeout, socketTimeout, socketAcquisitionWarningTimeout, httpAgent, httpsAgent, throwOnRequestTimeout, logger } = options || {};
			const keepAlive = true;
			const maxSockets = 50;
			return {
				connectionTimeout,
				requestTimeout,
				socketTimeout,
				socketAcquisitionWarningTimeout,
				throwOnRequestTimeout,
				httpAgent: (() => {
					if (httpAgent instanceof http.Agent || typeof httpAgent?.destroy === "function") {
						this.externalAgent = true;
						return httpAgent;
					}
					return new http.Agent({
						keepAlive,
						maxSockets,
						...httpAgent
					});
				})(),
				httpsAgent: (() => {
					if (httpsAgent instanceof https.Agent || typeof httpsAgent?.destroy === "function") {
						this.externalAgent = true;
						return httpsAgent;
					}
					return new https.Agent({
						keepAlive,
						maxSockets,
						...httpsAgent
					});
				})(),
				logger
			};
		}
		destroy() {
			this.config?.httpAgent?.destroy();
			this.config?.httpsAgent?.destroy();
		}
		async handle(request, { abortSignal, requestTimeout } = {}) {
			if (!this.config) this.config = await this.configProvider;
			return new Promise((_resolve, _reject) => {
				const config = this.config;
				let writeRequestBodyPromise = void 0;
				const timeouts = [];
				const resolve = async (arg) => {
					await writeRequestBodyPromise;
					timeouts.forEach(timing.clearTimeout);
					_resolve(arg);
				};
				const reject = async (arg) => {
					await writeRequestBodyPromise;
					timeouts.forEach(timing.clearTimeout);
					_reject(arg);
				};
				if (abortSignal?.aborted) {
					reject(buildAbortError(abortSignal));
					return;
				}
				const isSSL = request.protocol === "https:";
				const headers = request.headers ?? {};
				const expectContinue = (headers.Expect ?? headers.expect) === "100-continue";
				let agent = isSSL ? config.httpsAgent : config.httpAgent;
				if (expectContinue && !this.externalAgent) agent = new (isSSL ? https.Agent : http.Agent)({
					keepAlive: false,
					maxSockets: Infinity
				});
				timeouts.push(timing.setTimeout(() => {
					this.socketWarningTimestamp = NodeHttpHandler.checkSocketUsage(agent, this.socketWarningTimestamp, config.logger);
				}, config.socketAcquisitionWarningTimeout ?? (config.requestTimeout ?? 2e3) + (config.connectionTimeout ?? 1e3)));
				const queryString = querystringBuilder.buildQueryString(request.query || {});
				let auth = void 0;
				if (request.username != null || request.password != null) auth = `${request.username ?? ""}:${request.password ?? ""}`;
				let path = request.path;
				if (queryString) path += `?${queryString}`;
				if (request.fragment) path += `#${request.fragment}`;
				let hostname = request.hostname ?? "";
				if (hostname[0] === "[" && hostname.endsWith("]")) hostname = request.hostname.slice(1, -1);
				else hostname = request.hostname;
				const nodeHttpsOptions = {
					headers: request.headers,
					host: hostname,
					method: request.method,
					path,
					port: request.port,
					agent,
					auth
				};
				const req = (isSSL ? https.request : http.request)(nodeHttpsOptions, (res) => {
					resolve({ response: new protocolHttp.HttpResponse({
						statusCode: res.statusCode || -1,
						reason: res.statusMessage,
						headers: getTransformedHeaders(res.headers),
						body: res
					}) });
				});
				req.on("error", (err) => {
					if (NODEJS_TIMEOUT_ERROR_CODES.includes(err.code)) reject(Object.assign(err, { name: "TimeoutError" }));
					else reject(err);
				});
				if (abortSignal) {
					const onAbort = () => {
						req.destroy();
						reject(buildAbortError(abortSignal));
					};
					if (typeof abortSignal.addEventListener === "function") {
						const signal = abortSignal;
						signal.addEventListener("abort", onAbort, { once: true });
						req.once("close", () => signal.removeEventListener("abort", onAbort));
					} else abortSignal.onabort = onAbort;
				}
				const effectiveRequestTimeout = requestTimeout ?? config.requestTimeout;
				timeouts.push(setConnectionTimeout(req, reject, config.connectionTimeout));
				timeouts.push(setRequestTimeout(req, reject, effectiveRequestTimeout, config.throwOnRequestTimeout, config.logger ?? console));
				timeouts.push(setSocketTimeout(req, reject, config.socketTimeout));
				const httpAgent = nodeHttpsOptions.agent;
				if (typeof httpAgent === "object" && "keepAlive" in httpAgent) timeouts.push(setSocketKeepAlive(req, {
					keepAlive: httpAgent.keepAlive,
					keepAliveMsecs: httpAgent.keepAliveMsecs
				}));
				writeRequestBodyPromise = writeRequestBody(req, request, effectiveRequestTimeout, this.externalAgent).catch((e) => {
					timeouts.forEach(timing.clearTimeout);
					return _reject(e);
				});
			});
		}
		updateHttpClientConfig(key, value) {
			this.config = void 0;
			this.configProvider = this.configProvider.then((config) => {
				return {
					...config,
					[key]: value
				};
			});
		}
		httpHandlerConfigs() {
			return this.config ?? {};
		}
	};
	var NodeHttp2ConnectionPool = class {
		sessions = [];
		constructor(sessions) {
			this.sessions = sessions ?? [];
		}
		poll() {
			if (this.sessions.length > 0) return this.sessions.shift();
		}
		offerLast(session) {
			this.sessions.push(session);
		}
		contains(session) {
			return this.sessions.includes(session);
		}
		remove(session) {
			this.sessions = this.sessions.filter((s) => s !== session);
		}
		[Symbol.iterator]() {
			return this.sessions[Symbol.iterator]();
		}
		destroy(connection) {
			for (const session of this.sessions) if (session === connection) {
				if (!session.destroyed) session.destroy();
			}
		}
	};
	var NodeHttp2ConnectionManager = class {
		constructor(config) {
			this.config = config;
			if (this.config.maxConcurrency && this.config.maxConcurrency <= 0) throw new RangeError("maxConcurrency must be greater than zero.");
		}
		config;
		sessionCache = /* @__PURE__ */ new Map();
		lease(requestContext, connectionConfiguration) {
			const url = this.getUrlString(requestContext);
			const existingPool = this.sessionCache.get(url);
			if (existingPool) {
				const existingSession = existingPool.poll();
				if (existingSession && !this.config.disableConcurrency) return existingSession;
			}
			const session = http2.connect(url);
			if (this.config.maxConcurrency) session.settings({ maxConcurrentStreams: this.config.maxConcurrency }, (err) => {
				if (err) throw new Error("Fail to set maxConcurrentStreams to " + this.config.maxConcurrency + "when creating new session for " + requestContext.destination.toString());
			});
			session.unref();
			const destroySessionCb = () => {
				session.destroy();
				this.deleteSession(url, session);
			};
			session.on("goaway", destroySessionCb);
			session.on("error", destroySessionCb);
			session.on("frameError", destroySessionCb);
			session.on("close", () => this.deleteSession(url, session));
			if (connectionConfiguration.requestTimeout) session.setTimeout(connectionConfiguration.requestTimeout, destroySessionCb);
			const connectionPool = this.sessionCache.get(url) || new NodeHttp2ConnectionPool();
			connectionPool.offerLast(session);
			this.sessionCache.set(url, connectionPool);
			return session;
		}
		deleteSession(authority, session) {
			const existingConnectionPool = this.sessionCache.get(authority);
			if (!existingConnectionPool) return;
			if (!existingConnectionPool.contains(session)) return;
			existingConnectionPool.remove(session);
			this.sessionCache.set(authority, existingConnectionPool);
		}
		release(requestContext, session) {
			const cacheKey = this.getUrlString(requestContext);
			this.sessionCache.get(cacheKey)?.offerLast(session);
		}
		destroy() {
			for (const [key, connectionPool] of this.sessionCache) {
				for (const session of connectionPool) {
					if (!session.destroyed) session.destroy();
					connectionPool.remove(session);
				}
				this.sessionCache.delete(key);
			}
		}
		setMaxConcurrentStreams(maxConcurrentStreams) {
			if (maxConcurrentStreams && maxConcurrentStreams <= 0) throw new RangeError("maxConcurrentStreams must be greater than zero.");
			this.config.maxConcurrency = maxConcurrentStreams;
		}
		setDisableConcurrentStreams(disableConcurrentStreams) {
			this.config.disableConcurrency = disableConcurrentStreams;
		}
		getUrlString(request) {
			return request.destination.toString();
		}
	};
	var NodeHttp2Handler = class NodeHttp2Handler {
		config;
		configProvider;
		metadata = { handlerProtocol: "h2" };
		connectionManager = new NodeHttp2ConnectionManager({});
		static create(instanceOrOptions) {
			if (typeof instanceOrOptions?.handle === "function") return instanceOrOptions;
			return new NodeHttp2Handler(instanceOrOptions);
		}
		constructor(options) {
			this.configProvider = new Promise((resolve, reject) => {
				if (typeof options === "function") options().then((opts) => {
					resolve(opts || {});
				}).catch(reject);
				else resolve(options || {});
			});
		}
		destroy() {
			this.connectionManager.destroy();
		}
		async handle(request, { abortSignal, requestTimeout } = {}) {
			if (!this.config) {
				this.config = await this.configProvider;
				this.connectionManager.setDisableConcurrentStreams(this.config.disableConcurrentStreams || false);
				if (this.config.maxConcurrentStreams) this.connectionManager.setMaxConcurrentStreams(this.config.maxConcurrentStreams);
			}
			const { requestTimeout: configRequestTimeout, disableConcurrentStreams } = this.config;
			const effectiveRequestTimeout = requestTimeout ?? configRequestTimeout;
			return new Promise((_resolve, _reject) => {
				let fulfilled = false;
				let writeRequestBodyPromise = void 0;
				const resolve = async (arg) => {
					await writeRequestBodyPromise;
					_resolve(arg);
				};
				const reject = async (arg) => {
					await writeRequestBodyPromise;
					_reject(arg);
				};
				if (abortSignal?.aborted) {
					fulfilled = true;
					reject(buildAbortError(abortSignal));
					return;
				}
				const { hostname, method, port, protocol, query } = request;
				let auth = "";
				if (request.username != null || request.password != null) auth = `${request.username ?? ""}:${request.password ?? ""}@`;
				const authority = `${protocol}//${auth}${hostname}${port ? `:${port}` : ""}`;
				const requestContext = { destination: new URL(authority) };
				const session = this.connectionManager.lease(requestContext, {
					requestTimeout: this.config?.sessionTimeout,
					disableConcurrentStreams: disableConcurrentStreams || false
				});
				const rejectWithDestroy = (err) => {
					if (disableConcurrentStreams) this.destroySession(session);
					fulfilled = true;
					reject(err);
				};
				const queryString = querystringBuilder.buildQueryString(query || {});
				let path = request.path;
				if (queryString) path += `?${queryString}`;
				if (request.fragment) path += `#${request.fragment}`;
				const req = session.request({
					...request.headers,
					[http2.constants.HTTP2_HEADER_PATH]: path,
					[http2.constants.HTTP2_HEADER_METHOD]: method
				});
				session.ref();
				req.on("response", (headers) => {
					const httpResponse = new protocolHttp.HttpResponse({
						statusCode: headers[":status"] || -1,
						headers: getTransformedHeaders(headers),
						body: req
					});
					fulfilled = true;
					resolve({ response: httpResponse });
					if (disableConcurrentStreams) {
						session.close();
						this.connectionManager.deleteSession(authority, session);
					}
				});
				if (effectiveRequestTimeout) req.setTimeout(effectiveRequestTimeout, () => {
					req.close();
					const timeoutError = /* @__PURE__ */ new Error(`Stream timed out because of no activity for ${effectiveRequestTimeout} ms`);
					timeoutError.name = "TimeoutError";
					rejectWithDestroy(timeoutError);
				});
				if (abortSignal) {
					const onAbort = () => {
						req.close();
						rejectWithDestroy(buildAbortError(abortSignal));
					};
					if (typeof abortSignal.addEventListener === "function") {
						const signal = abortSignal;
						signal.addEventListener("abort", onAbort, { once: true });
						req.once("close", () => signal.removeEventListener("abort", onAbort));
					} else abortSignal.onabort = onAbort;
				}
				req.on("frameError", (type, code, id) => {
					rejectWithDestroy(/* @__PURE__ */ new Error(`Frame type id ${type} in stream id ${id} has failed with code ${code}.`));
				});
				req.on("error", rejectWithDestroy);
				req.on("aborted", () => {
					rejectWithDestroy(/* @__PURE__ */ new Error(`HTTP/2 stream is abnormally aborted in mid-communication with result code ${req.rstCode}.`));
				});
				req.on("close", () => {
					session.unref();
					if (disableConcurrentStreams) session.destroy();
					if (!fulfilled) rejectWithDestroy(/* @__PURE__ */ new Error("Unexpected error: http2 request did not get a response"));
				});
				writeRequestBodyPromise = writeRequestBody(req, request, effectiveRequestTimeout);
			});
		}
		updateHttpClientConfig(key, value) {
			this.config = void 0;
			this.configProvider = this.configProvider.then((config) => {
				return {
					...config,
					[key]: value
				};
			});
		}
		httpHandlerConfigs() {
			return this.config ?? {};
		}
		destroySession(session) {
			if (!session.destroyed) session.destroy();
		}
	};
	var Collector = class extends stream.Writable {
		bufferedBytes = [];
		_write(chunk, encoding, callback) {
			this.bufferedBytes.push(chunk);
			callback();
		}
	};
	const streamCollector = (stream) => {
		if (isReadableStreamInstance(stream)) return collectReadableStream(stream);
		return new Promise((resolve, reject) => {
			const collector = new Collector();
			stream.pipe(collector);
			stream.on("error", (err) => {
				collector.end();
				reject(err);
			});
			collector.on("error", reject);
			collector.on("finish", function() {
				resolve(new Uint8Array(Buffer.concat(this.bufferedBytes)));
			});
		});
	};
	const isReadableStreamInstance = (stream) => typeof ReadableStream === "function" && stream instanceof ReadableStream;
	async function collectReadableStream(stream) {
		const chunks = [];
		const reader = stream.getReader();
		let isDone = false;
		let length = 0;
		while (!isDone) {
			const { done, value } = await reader.read();
			if (value) {
				chunks.push(value);
				length += value.length;
			}
			isDone = done;
		}
		const collected = new Uint8Array(length);
		let offset = 0;
		for (const chunk of chunks) {
			collected.set(chunk, offset);
			offset += chunk.length;
		}
		return collected;
	}
	exports.DEFAULT_REQUEST_TIMEOUT = DEFAULT_REQUEST_TIMEOUT;
	exports.NodeHttp2Handler = NodeHttp2Handler;
	exports.NodeHttpHandler = NodeHttpHandler;
	exports.streamCollector = streamCollector;
}));
//#endregion
//#region node_modules/@aws-sdk/credential-provider-http/node_modules/@smithy/property-provider/dist-cjs/index.js
var require_dist_cjs$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var ProviderError = class ProviderError extends Error {
		name = "ProviderError";
		tryNextLink;
		constructor(message, options = true) {
			let logger;
			let tryNextLink = true;
			if (typeof options === "boolean") {
				logger = void 0;
				tryNextLink = options;
			} else if (options != null && typeof options === "object") {
				logger = options.logger;
				tryNextLink = options.tryNextLink ?? true;
			}
			super(message);
			this.tryNextLink = tryNextLink;
			Object.setPrototypeOf(this, ProviderError.prototype);
			logger?.debug?.(`@smithy/property-provider ${tryNextLink ? "->" : "(!)"} ${message}`);
		}
		static from(error, options = true) {
			return Object.assign(new this(error.message, options), error);
		}
	};
	var CredentialsProviderError = class CredentialsProviderError extends ProviderError {
		name = "CredentialsProviderError";
		constructor(message, options = true) {
			super(message, options);
			Object.setPrototypeOf(this, CredentialsProviderError.prototype);
		}
	};
	var TokenProviderError = class TokenProviderError extends ProviderError {
		name = "TokenProviderError";
		constructor(message, options = true) {
			super(message, options);
			Object.setPrototypeOf(this, TokenProviderError.prototype);
		}
	};
	const chain = (...providers) => async () => {
		if (providers.length === 0) throw new ProviderError("No providers in chain");
		let lastProviderError;
		for (const provider of providers) try {
			return await provider();
		} catch (err) {
			lastProviderError = err;
			if (err?.tryNextLink) continue;
			throw err;
		}
		throw lastProviderError;
	};
	const fromStatic = (staticValue) => () => Promise.resolve(staticValue);
	const memoize = (provider, isExpired, requiresRefresh) => {
		let resolved;
		let pending;
		let hasResult;
		let isConstant = false;
		const coalesceProvider = async () => {
			if (!pending) pending = provider();
			try {
				resolved = await pending;
				hasResult = true;
				isConstant = false;
			} finally {
				pending = void 0;
			}
			return resolved;
		};
		if (isExpired === void 0) return async (options) => {
			if (!hasResult || options?.forceRefresh) resolved = await coalesceProvider();
			return resolved;
		};
		return async (options) => {
			if (!hasResult || options?.forceRefresh) resolved = await coalesceProvider();
			if (isConstant) return resolved;
			if (requiresRefresh && !requiresRefresh(resolved)) {
				isConstant = true;
				return resolved;
			}
			if (isExpired(resolved)) {
				await coalesceProvider();
				return resolved;
			}
			return resolved;
		};
	};
	exports.CredentialsProviderError = CredentialsProviderError;
	exports.ProviderError = ProviderError;
	exports.TokenProviderError = TokenProviderError;
	exports.chain = chain;
	exports.fromStatic = fromStatic;
	exports.memoize = memoize;
}));
//#endregion
//#region node_modules/@aws-sdk/credential-provider-http/dist-cjs/fromHttp/checkUrl.js
var require_checkUrl = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.checkUrl = void 0;
	const property_provider_1 = require_dist_cjs$1();
	const ECS_CONTAINER_HOST = "169.254.170.2";
	const EKS_CONTAINER_HOST_IPv4 = "169.254.170.23";
	const EKS_CONTAINER_HOST_IPv6 = "[fd00:ec2::23]";
	const checkUrl = (url, logger) => {
		if (url.protocol === "https:") return;
		if (url.hostname === ECS_CONTAINER_HOST || url.hostname === EKS_CONTAINER_HOST_IPv4 || url.hostname === EKS_CONTAINER_HOST_IPv6) return;
		if (url.hostname.includes("[")) {
			if (url.hostname === "[::1]" || url.hostname === "[0000:0000:0000:0000:0000:0000:0000:0001]") return;
		} else {
			if (url.hostname === "localhost") return;
			const ipComponents = url.hostname.split(".");
			const inRange = (component) => {
				const num = parseInt(component, 10);
				return 0 <= num && num <= 255;
			};
			if (ipComponents[0] === "127" && inRange(ipComponents[1]) && inRange(ipComponents[2]) && inRange(ipComponents[3]) && ipComponents.length === 4) return;
		}
		throw new property_provider_1.CredentialsProviderError(`URL not accepted. It must either be HTTPS or match one of the following:
  - loopback CIDR 127.0.0.0/8 or [::1/128]
  - ECS container host 169.254.170.2
  - EKS container host 169.254.170.23 or [fd00:ec2::23]`, { logger });
	};
	exports.checkUrl = checkUrl;
}));
//#endregion
//#region node_modules/@aws-sdk/credential-provider-http/dist-cjs/fromHttp/requestHelpers.js
var require_requestHelpers = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createGetRequest = createGetRequest;
	exports.getCredentials = getCredentials;
	const property_provider_1 = require_dist_cjs$1();
	const protocol_http_1 = require_dist_cjs$4();
	const smithy_client_1 = require_dist_cjs$6();
	const util_stream_1 = require_dist_cjs$7();
	function createGetRequest(url) {
		return new protocol_http_1.HttpRequest({
			protocol: url.protocol,
			hostname: url.hostname,
			port: Number(url.port),
			path: url.pathname,
			query: Array.from(url.searchParams.entries()).reduce((acc, [k, v]) => {
				acc[k] = v;
				return acc;
			}, {}),
			fragment: url.hash
		});
	}
	async function getCredentials(response, logger) {
		const str = await (0, util_stream_1.sdkStreamMixin)(response.body).transformToString();
		if (response.statusCode === 200) {
			const parsed = JSON.parse(str);
			if (typeof parsed.AccessKeyId !== "string" || typeof parsed.SecretAccessKey !== "string" || typeof parsed.Token !== "string" || typeof parsed.Expiration !== "string") throw new property_provider_1.CredentialsProviderError("HTTP credential provider response not of the required format, an object matching: { AccessKeyId: string, SecretAccessKey: string, Token: string, Expiration: string(rfc3339) }", { logger });
			return {
				accessKeyId: parsed.AccessKeyId,
				secretAccessKey: parsed.SecretAccessKey,
				sessionToken: parsed.Token,
				expiration: (0, smithy_client_1.parseRfc3339DateTime)(parsed.Expiration)
			};
		}
		if (response.statusCode >= 400 && response.statusCode < 500) {
			let parsedBody = {};
			try {
				parsedBody = JSON.parse(str);
			} catch (e) {}
			throw Object.assign(new property_provider_1.CredentialsProviderError(`Server responded with status: ${response.statusCode}`, { logger }), {
				Code: parsedBody.Code,
				Message: parsedBody.Message
			});
		}
		throw new property_provider_1.CredentialsProviderError(`Server responded with status: ${response.statusCode}`, { logger });
	}
}));
//#endregion
//#region node_modules/@aws-sdk/credential-provider-http/dist-cjs/fromHttp/retry-wrapper.js
var require_retry_wrapper = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.retryWrapper = void 0;
	const retryWrapper = (toRetry, maxRetries, delayMs) => {
		return async () => {
			for (let i = 0; i < maxRetries; ++i) try {
				return await toRetry();
			} catch (e) {
				await new Promise((resolve) => setTimeout(resolve, delayMs));
			}
			return await toRetry();
		};
	};
	exports.retryWrapper = retryWrapper;
}));
//#endregion
//#region node_modules/@aws-sdk/credential-provider-http/dist-cjs/fromHttp/fromHttp.js
var require_fromHttp = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.fromHttp = void 0;
	const tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
	const client_1 = (init_client(), __toCommonJS(client_exports));
	const node_http_handler_1 = require_dist_cjs$2();
	const property_provider_1 = require_dist_cjs$1();
	const promises_1 = tslib_1.__importDefault(__require("node:fs/promises"));
	const checkUrl_1 = require_checkUrl();
	const requestHelpers_1 = require_requestHelpers();
	const retry_wrapper_1 = require_retry_wrapper();
	const AWS_CONTAINER_CREDENTIALS_RELATIVE_URI = "AWS_CONTAINER_CREDENTIALS_RELATIVE_URI";
	const DEFAULT_LINK_LOCAL_HOST = "http://169.254.170.2";
	const AWS_CONTAINER_CREDENTIALS_FULL_URI = "AWS_CONTAINER_CREDENTIALS_FULL_URI";
	const AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE = "AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE";
	const AWS_CONTAINER_AUTHORIZATION_TOKEN = "AWS_CONTAINER_AUTHORIZATION_TOKEN";
	const fromHttp = (options = {}) => {
		options.logger?.debug("@aws-sdk/credential-provider-http - fromHttp");
		let host;
		const relative = options.awsContainerCredentialsRelativeUri ?? process.env[AWS_CONTAINER_CREDENTIALS_RELATIVE_URI];
		const full = options.awsContainerCredentialsFullUri ?? process.env[AWS_CONTAINER_CREDENTIALS_FULL_URI];
		const token = options.awsContainerAuthorizationToken ?? process.env[AWS_CONTAINER_AUTHORIZATION_TOKEN];
		const tokenFile = options.awsContainerAuthorizationTokenFile ?? process.env[AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE];
		const warn = options.logger?.constructor?.name === "NoOpLogger" || !options.logger?.warn ? console.warn : options.logger.warn.bind(options.logger);
		if (relative && full) {
			warn("@aws-sdk/credential-provider-http: you have set both awsContainerCredentialsRelativeUri and awsContainerCredentialsFullUri.");
			warn("awsContainerCredentialsFullUri will take precedence.");
		}
		if (token && tokenFile) {
			warn("@aws-sdk/credential-provider-http: you have set both awsContainerAuthorizationToken and awsContainerAuthorizationTokenFile.");
			warn("awsContainerAuthorizationToken will take precedence.");
		}
		if (full) host = full;
		else if (relative) host = `${DEFAULT_LINK_LOCAL_HOST}${relative}`;
		else throw new property_provider_1.CredentialsProviderError(`No HTTP credential provider host provided.
Set AWS_CONTAINER_CREDENTIALS_FULL_URI or AWS_CONTAINER_CREDENTIALS_RELATIVE_URI.`, { logger: options.logger });
		const url = new URL(host);
		(0, checkUrl_1.checkUrl)(url, options.logger);
		const requestHandler = node_http_handler_1.NodeHttpHandler.create({
			requestTimeout: options.timeout ?? 1e3,
			connectionTimeout: options.timeout ?? 1e3
		});
		return (0, retry_wrapper_1.retryWrapper)(async () => {
			const request = (0, requestHelpers_1.createGetRequest)(url);
			if (token) request.headers.Authorization = token;
			else if (tokenFile) request.headers.Authorization = (await promises_1.default.readFile(tokenFile)).toString();
			try {
				const result = await requestHandler.handle(request);
				return (0, requestHelpers_1.getCredentials)(result.response).then((creds) => (0, client_1.setCredentialFeature)(creds, "CREDENTIALS_HTTP", "z"));
			} catch (e) {
				throw new property_provider_1.CredentialsProviderError(String(e), { logger: options.logger });
			}
		}, options.maxRetries ?? 3, options.timeout ?? 1e3);
	};
	exports.fromHttp = fromHttp;
}));
//#endregion
//#region node_modules/@aws-sdk/credential-provider-http/dist-cjs/index.js
var require_dist_cjs = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.fromHttp = void 0;
	var fromHttp_1 = require_fromHttp();
	Object.defineProperty(exports, "fromHttp", {
		enumerable: true,
		get: function() {
			return fromHttp_1.fromHttp;
		}
	});
}));
//#endregion
export default require_dist_cjs();
export {};
