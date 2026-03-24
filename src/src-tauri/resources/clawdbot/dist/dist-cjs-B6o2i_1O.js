import { a as __toCommonJS, i as __require, o as __toESM, t as __commonJSMin } from "./chunk-DORXReHP.js";
import { t as require_dist_cjs$4 } from "./dist-cjs-WSNQnW7p.js";
import { t as require_dist_cjs$5 } from "./dist-cjs-g8U_euY0.js";
import { n as init_client, t as client_exports } from "./client-Cta4m6Io.js";
import { n as require_dist_cjs$6, t as require_dist_cjs$7 } from "./dist-cjs-wpZMVU3i.js";
//#region node_modules/@aws-sdk/credential-provider-login/node_modules/@smithy/property-provider/dist-cjs/index.js
var require_dist_cjs$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
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
//#region node_modules/@aws-sdk/credential-provider-login/node_modules/@smithy/shared-ini-file-loader/dist-cjs/getHomeDir.js
var require_getHomeDir = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getHomeDir = void 0;
	const os_1 = __require("os");
	const path_1$1 = __require("path");
	const homeDirCache = {};
	const getHomeDirCacheKey = () => {
		if (process && process.geteuid) return `${process.geteuid()}`;
		return "DEFAULT";
	};
	const getHomeDir = () => {
		const { HOME, USERPROFILE, HOMEPATH, HOMEDRIVE = `C:${path_1$1.sep}` } = process.env;
		if (HOME) return HOME;
		if (USERPROFILE) return USERPROFILE;
		if (HOMEPATH) return `${HOMEDRIVE}${HOMEPATH}`;
		const homeDirCacheKey = getHomeDirCacheKey();
		if (!homeDirCache[homeDirCacheKey]) homeDirCache[homeDirCacheKey] = (0, os_1.homedir)();
		return homeDirCache[homeDirCacheKey];
	};
	exports.getHomeDir = getHomeDir;
}));
//#endregion
//#region node_modules/@aws-sdk/credential-provider-login/node_modules/@smithy/shared-ini-file-loader/dist-cjs/getSSOTokenFilepath.js
var require_getSSOTokenFilepath = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getSSOTokenFilepath = void 0;
	const crypto_1 = __require("crypto");
	const path_1 = __require("path");
	const getHomeDir_1 = require_getHomeDir();
	const getSSOTokenFilepath = (id) => {
		const cacheName = (0, crypto_1.createHash)("sha1").update(id).digest("hex");
		return (0, path_1.join)((0, getHomeDir_1.getHomeDir)(), ".aws", "sso", "cache", `${cacheName}.json`);
	};
	exports.getSSOTokenFilepath = getSSOTokenFilepath;
}));
//#endregion
//#region node_modules/@aws-sdk/credential-provider-login/node_modules/@smithy/shared-ini-file-loader/dist-cjs/getSSOTokenFromFile.js
var require_getSSOTokenFromFile = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getSSOTokenFromFile = exports.tokenIntercept = void 0;
	const promises_1$1 = __require("fs/promises");
	const getSSOTokenFilepath_1 = require_getSSOTokenFilepath();
	exports.tokenIntercept = {};
	const getSSOTokenFromFile = async (id) => {
		if (exports.tokenIntercept[id]) return exports.tokenIntercept[id];
		const ssoTokenFilepath = (0, getSSOTokenFilepath_1.getSSOTokenFilepath)(id);
		const ssoTokenText = await (0, promises_1$1.readFile)(ssoTokenFilepath, "utf8");
		return JSON.parse(ssoTokenText);
	};
	exports.getSSOTokenFromFile = getSSOTokenFromFile;
}));
//#endregion
//#region node_modules/@aws-sdk/credential-provider-login/node_modules/@smithy/shared-ini-file-loader/dist-cjs/readFile.js
var require_readFile = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.readFile = exports.fileIntercept = exports.filePromises = void 0;
	const promises_1 = __require("node:fs/promises");
	exports.filePromises = {};
	exports.fileIntercept = {};
	const readFile = (path, options) => {
		if (exports.fileIntercept[path] !== void 0) return exports.fileIntercept[path];
		if (!exports.filePromises[path] || options?.ignoreCache) exports.filePromises[path] = (0, promises_1.readFile)(path, "utf8");
		return exports.filePromises[path];
	};
	exports.readFile = readFile;
}));
//#endregion
//#region node_modules/@aws-sdk/credential-provider-login/node_modules/@smithy/shared-ini-file-loader/dist-cjs/index.js
var require_dist_cjs$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var getHomeDir = require_getHomeDir();
	var getSSOTokenFilepath = require_getSSOTokenFilepath();
	var getSSOTokenFromFile = require_getSSOTokenFromFile();
	var path = __require("path");
	var types = require_dist_cjs$4();
	var readFile = require_readFile();
	const ENV_PROFILE = "AWS_PROFILE";
	const DEFAULT_PROFILE = "default";
	const getProfileName = (init) => init.profile || process.env[ENV_PROFILE] || DEFAULT_PROFILE;
	const CONFIG_PREFIX_SEPARATOR = ".";
	const getConfigData = (data) => Object.entries(data).filter(([key]) => {
		const indexOfSeparator = key.indexOf(CONFIG_PREFIX_SEPARATOR);
		if (indexOfSeparator === -1) return false;
		return Object.values(types.IniSectionType).includes(key.substring(0, indexOfSeparator));
	}).reduce((acc, [key, value]) => {
		const indexOfSeparator = key.indexOf(CONFIG_PREFIX_SEPARATOR);
		const updatedKey = key.substring(0, indexOfSeparator) === types.IniSectionType.PROFILE ? key.substring(indexOfSeparator + 1) : key;
		acc[updatedKey] = value;
		return acc;
	}, { ...data.default && { default: data.default } });
	const ENV_CONFIG_PATH = "AWS_CONFIG_FILE";
	const getConfigFilepath = () => process.env[ENV_CONFIG_PATH] || path.join(getHomeDir.getHomeDir(), ".aws", "config");
	const ENV_CREDENTIALS_PATH = "AWS_SHARED_CREDENTIALS_FILE";
	const getCredentialsFilepath = () => process.env[ENV_CREDENTIALS_PATH] || path.join(getHomeDir.getHomeDir(), ".aws", "credentials");
	const prefixKeyRegex = /^([\w-]+)\s(["'])?([\w-@\+\.%:/]+)\2$/;
	const profileNameBlockList = ["__proto__", "profile __proto__"];
	const parseIni = (iniData) => {
		const map = {};
		let currentSection;
		let currentSubSection;
		for (const iniLine of iniData.split(/\r?\n/)) {
			const trimmedLine = iniLine.split(/(^|\s)[;#]/)[0].trim();
			if (trimmedLine[0] === "[" && trimmedLine[trimmedLine.length - 1] === "]") {
				currentSection = void 0;
				currentSubSection = void 0;
				const sectionName = trimmedLine.substring(1, trimmedLine.length - 1);
				const matches = prefixKeyRegex.exec(sectionName);
				if (matches) {
					const [, prefix, , name] = matches;
					if (Object.values(types.IniSectionType).includes(prefix)) currentSection = [prefix, name].join(CONFIG_PREFIX_SEPARATOR);
				} else currentSection = sectionName;
				if (profileNameBlockList.includes(sectionName)) throw new Error(`Found invalid profile name "${sectionName}"`);
			} else if (currentSection) {
				const indexOfEqualsSign = trimmedLine.indexOf("=");
				if (![0, -1].includes(indexOfEqualsSign)) {
					const [name, value] = [trimmedLine.substring(0, indexOfEqualsSign).trim(), trimmedLine.substring(indexOfEqualsSign + 1).trim()];
					if (value === "") currentSubSection = name;
					else {
						if (currentSubSection && iniLine.trimStart() === iniLine) currentSubSection = void 0;
						map[currentSection] = map[currentSection] || {};
						const key = currentSubSection ? [currentSubSection, name].join(CONFIG_PREFIX_SEPARATOR) : name;
						map[currentSection][key] = value;
					}
				}
			}
		}
		return map;
	};
	const swallowError$1 = () => ({});
	const loadSharedConfigFiles = async (init = {}) => {
		const { filepath = getCredentialsFilepath(), configFilepath = getConfigFilepath() } = init;
		const homeDir = getHomeDir.getHomeDir();
		const relativeHomeDirPrefix = "~/";
		let resolvedFilepath = filepath;
		if (filepath.startsWith(relativeHomeDirPrefix)) resolvedFilepath = path.join(homeDir, filepath.slice(2));
		let resolvedConfigFilepath = configFilepath;
		if (configFilepath.startsWith(relativeHomeDirPrefix)) resolvedConfigFilepath = path.join(homeDir, configFilepath.slice(2));
		const parsedFiles = await Promise.all([readFile.readFile(resolvedConfigFilepath, { ignoreCache: init.ignoreCache }).then(parseIni).then(getConfigData).catch(swallowError$1), readFile.readFile(resolvedFilepath, { ignoreCache: init.ignoreCache }).then(parseIni).catch(swallowError$1)]);
		return {
			configFile: parsedFiles[0],
			credentialsFile: parsedFiles[1]
		};
	};
	const getSsoSessionData = (data) => Object.entries(data).filter(([key]) => key.startsWith(types.IniSectionType.SSO_SESSION + CONFIG_PREFIX_SEPARATOR)).reduce((acc, [key, value]) => ({
		...acc,
		[key.substring(key.indexOf(CONFIG_PREFIX_SEPARATOR) + 1)]: value
	}), {});
	const swallowError = () => ({});
	const loadSsoSessionData = async (init = {}) => readFile.readFile(init.configFilepath ?? getConfigFilepath()).then(parseIni).then(getSsoSessionData).catch(swallowError);
	const mergeConfigFiles = (...files) => {
		const merged = {};
		for (const file of files) for (const [key, values] of Object.entries(file)) if (merged[key] !== void 0) Object.assign(merged[key], values);
		else merged[key] = values;
		return merged;
	};
	const parseKnownFiles = async (init) => {
		const parsedFiles = await loadSharedConfigFiles(init);
		return mergeConfigFiles(parsedFiles.configFile, parsedFiles.credentialsFile);
	};
	const externalDataInterceptor = {
		getFileRecord() {
			return readFile.fileIntercept;
		},
		interceptFile(path, contents) {
			readFile.fileIntercept[path] = Promise.resolve(contents);
		},
		getTokenRecord() {
			return getSSOTokenFromFile.tokenIntercept;
		},
		interceptToken(id, contents) {
			getSSOTokenFromFile.tokenIntercept[id] = contents;
		}
	};
	exports.getSSOTokenFromFile = getSSOTokenFromFile.getSSOTokenFromFile;
	exports.readFile = readFile.readFile;
	exports.CONFIG_PREFIX_SEPARATOR = CONFIG_PREFIX_SEPARATOR;
	exports.DEFAULT_PROFILE = DEFAULT_PROFILE;
	exports.ENV_PROFILE = ENV_PROFILE;
	exports.externalDataInterceptor = externalDataInterceptor;
	exports.getProfileName = getProfileName;
	exports.loadSharedConfigFiles = loadSharedConfigFiles;
	exports.loadSsoSessionData = loadSsoSessionData;
	exports.parseKnownFiles = parseKnownFiles;
	Object.prototype.hasOwnProperty.call(getHomeDir, "__proto__") && !Object.prototype.hasOwnProperty.call(exports, "__proto__") && Object.defineProperty(exports, "__proto__", {
		enumerable: true,
		value: getHomeDir["__proto__"]
	});
	Object.keys(getHomeDir).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) exports[k] = getHomeDir[k];
	});
	Object.prototype.hasOwnProperty.call(getSSOTokenFilepath, "__proto__") && !Object.prototype.hasOwnProperty.call(exports, "__proto__") && Object.defineProperty(exports, "__proto__", {
		enumerable: true,
		value: getSSOTokenFilepath["__proto__"]
	});
	Object.keys(getSSOTokenFilepath).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) exports[k] = getSSOTokenFilepath[k];
	});
}));
//#endregion
//#region node_modules/@aws-sdk/credential-provider-login/dist-cjs/index.js
var require_dist_cjs$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var client = (init_client(), __toCommonJS(client_exports));
	var propertyProvider = require_dist_cjs$3();
	var sharedIniFileLoader = require_dist_cjs$2();
	var protocolHttp = require_dist_cjs$5();
	var node_crypto = __require("node:crypto");
	var node_fs = __require("node:fs");
	var node_os = __require("node:os");
	var node_path = __require("node:path");
	var LoginCredentialsFetcher = class LoginCredentialsFetcher {
		profileData;
		init;
		callerClientConfig;
		static REFRESH_THRESHOLD = 300 * 1e3;
		constructor(profileData, init, callerClientConfig) {
			this.profileData = profileData;
			this.init = init;
			this.callerClientConfig = callerClientConfig;
		}
		async loadCredentials() {
			const token = await this.loadToken();
			if (!token) throw new propertyProvider.CredentialsProviderError(`Failed to load a token for session ${this.loginSession}, please re-authenticate using aws login`, {
				tryNextLink: false,
				logger: this.logger
			});
			const accessToken = token.accessToken;
			const now = Date.now();
			if (new Date(accessToken.expiresAt).getTime() - now <= LoginCredentialsFetcher.REFRESH_THRESHOLD) return this.refresh(token);
			return {
				accessKeyId: accessToken.accessKeyId,
				secretAccessKey: accessToken.secretAccessKey,
				sessionToken: accessToken.sessionToken,
				accountId: accessToken.accountId,
				expiration: new Date(accessToken.expiresAt)
			};
		}
		get logger() {
			return this.init?.logger;
		}
		get loginSession() {
			return this.profileData.login_session;
		}
		async refresh(token) {
			const { SigninClient, CreateOAuth2TokenCommand } = await import("./signin-CpXe0fRo.js");
			const { logger, userAgentAppId } = this.callerClientConfig ?? {};
			const isH2 = (requestHandler) => {
				return requestHandler?.metadata?.handlerProtocol === "h2";
			};
			const requestHandler = isH2(this.callerClientConfig?.requestHandler) ? void 0 : this.callerClientConfig?.requestHandler;
			const client = new SigninClient({
				credentials: {
					accessKeyId: "",
					secretAccessKey: ""
				},
				region: this.profileData.region ?? await this.callerClientConfig?.region?.() ?? process.env.AWS_REGION,
				requestHandler,
				logger,
				userAgentAppId,
				...this.init?.clientConfig
			});
			this.createDPoPInterceptor(client.middlewareStack);
			const commandInput = { tokenInput: {
				clientId: token.clientId,
				refreshToken: token.refreshToken,
				grantType: "refresh_token"
			} };
			try {
				const response = await client.send(new CreateOAuth2TokenCommand(commandInput));
				const { accessKeyId, secretAccessKey, sessionToken } = response.tokenOutput?.accessToken ?? {};
				const { refreshToken, expiresIn } = response.tokenOutput ?? {};
				if (!accessKeyId || !secretAccessKey || !sessionToken || !refreshToken) throw new propertyProvider.CredentialsProviderError("Token refresh response missing required fields", {
					logger: this.logger,
					tryNextLink: false
				});
				const expiresInMs = (expiresIn ?? 900) * 1e3;
				const expiration = new Date(Date.now() + expiresInMs);
				const updatedToken = {
					...token,
					accessToken: {
						...token.accessToken,
						accessKeyId,
						secretAccessKey,
						sessionToken,
						expiresAt: expiration.toISOString()
					},
					refreshToken
				};
				await this.saveToken(updatedToken);
				const newAccessToken = updatedToken.accessToken;
				return {
					accessKeyId: newAccessToken.accessKeyId,
					secretAccessKey: newAccessToken.secretAccessKey,
					sessionToken: newAccessToken.sessionToken,
					accountId: newAccessToken.accountId,
					expiration
				};
			} catch (error) {
				if (error.name === "AccessDeniedException") {
					const errorType = error.error;
					let message;
					switch (errorType) {
						case "TOKEN_EXPIRED":
							message = "Your session has expired. Please reauthenticate.";
							break;
						case "USER_CREDENTIALS_CHANGED":
							message = "Unable to refresh credentials because of a change in your password. Please reauthenticate with your new password.";
							break;
						case "INSUFFICIENT_PERMISSIONS":
							message = "Unable to refresh credentials due to insufficient permissions. You may be missing permission for the 'CreateOAuth2Token' action.";
							break;
						default: message = `Failed to refresh token: ${String(error)}. Please re-authenticate using \`aws login\``;
					}
					throw new propertyProvider.CredentialsProviderError(message, {
						logger: this.logger,
						tryNextLink: false
					});
				}
				throw new propertyProvider.CredentialsProviderError(`Failed to refresh token: ${String(error)}. Please re-authenticate using aws login`, { logger: this.logger });
			}
		}
		async loadToken() {
			const tokenFilePath = this.getTokenFilePath();
			try {
				let tokenData;
				try {
					tokenData = await sharedIniFileLoader.readFile(tokenFilePath, { ignoreCache: this.init?.ignoreCache });
				} catch {
					tokenData = await node_fs.promises.readFile(tokenFilePath, "utf8");
				}
				const token = JSON.parse(tokenData);
				const missingFields = [
					"accessToken",
					"clientId",
					"refreshToken",
					"dpopKey"
				].filter((k) => !token[k]);
				if (!token.accessToken?.accountId) missingFields.push("accountId");
				if (missingFields.length > 0) throw new propertyProvider.CredentialsProviderError(`Token validation failed, missing fields: ${missingFields.join(", ")}`, {
					logger: this.logger,
					tryNextLink: false
				});
				return token;
			} catch (error) {
				throw new propertyProvider.CredentialsProviderError(`Failed to load token from ${tokenFilePath}: ${String(error)}`, {
					logger: this.logger,
					tryNextLink: false
				});
			}
		}
		async saveToken(token) {
			const tokenFilePath = this.getTokenFilePath();
			const directory = node_path.dirname(tokenFilePath);
			try {
				await node_fs.promises.mkdir(directory, { recursive: true });
			} catch (error) {}
			await node_fs.promises.writeFile(tokenFilePath, JSON.stringify(token, null, 2), "utf8");
		}
		getTokenFilePath() {
			const directory = process.env.AWS_LOGIN_CACHE_DIRECTORY ?? node_path.join(node_os.homedir(), ".aws", "login", "cache");
			const loginSessionBytes = Buffer.from(this.loginSession, "utf8");
			const loginSessionSha256 = node_crypto.createHash("sha256").update(loginSessionBytes).digest("hex");
			return node_path.join(directory, `${loginSessionSha256}.json`);
		}
		derToRawSignature(derSignature) {
			let offset = 2;
			if (derSignature[offset] !== 2) throw new Error("Invalid DER signature");
			offset++;
			const rLength = derSignature[offset++];
			let r = derSignature.subarray(offset, offset + rLength);
			offset += rLength;
			if (derSignature[offset] !== 2) throw new Error("Invalid DER signature");
			offset++;
			const sLength = derSignature[offset++];
			let s = derSignature.subarray(offset, offset + sLength);
			r = r[0] === 0 ? r.subarray(1) : r;
			s = s[0] === 0 ? s.subarray(1) : s;
			const rPadded = Buffer.concat([Buffer.alloc(32 - r.length), r]);
			const sPadded = Buffer.concat([Buffer.alloc(32 - s.length), s]);
			return Buffer.concat([rPadded, sPadded]);
		}
		createDPoPInterceptor(middlewareStack) {
			middlewareStack.add((next) => async (args) => {
				if (protocolHttp.HttpRequest.isInstance(args.request)) {
					const request = args.request;
					const actualEndpoint = `${request.protocol}//${request.hostname}${request.port ? `:${request.port}` : ""}${request.path}`;
					const dpop = await this.generateDpop(request.method, actualEndpoint);
					request.headers = {
						...request.headers,
						DPoP: dpop
					};
				}
				return next(args);
			}, {
				step: "finalizeRequest",
				name: "dpopInterceptor",
				override: true
			});
		}
		async generateDpop(method = "POST", endpoint) {
			const token = await this.loadToken();
			try {
				const privateKey = node_crypto.createPrivateKey({
					key: token.dpopKey,
					format: "pem",
					type: "sec1"
				});
				const publicDer = node_crypto.createPublicKey(privateKey).export({
					format: "der",
					type: "spki"
				});
				let pointStart = -1;
				for (let i = 0; i < publicDer.length; i++) if (publicDer[i] === 4) {
					pointStart = i;
					break;
				}
				const x = publicDer.slice(pointStart + 1, pointStart + 33);
				const y = publicDer.slice(pointStart + 33, pointStart + 65);
				const header = {
					alg: "ES256",
					typ: "dpop+jwt",
					jwk: {
						kty: "EC",
						crv: "P-256",
						x: x.toString("base64url"),
						y: y.toString("base64url")
					}
				};
				const payload = {
					jti: crypto.randomUUID(),
					htm: method,
					htu: endpoint,
					iat: Math.floor(Date.now() / 1e3)
				};
				const message = `${Buffer.from(JSON.stringify(header)).toString("base64url")}.${Buffer.from(JSON.stringify(payload)).toString("base64url")}`;
				const asn1Signature = node_crypto.sign("sha256", Buffer.from(message), privateKey);
				return `${message}.${this.derToRawSignature(asn1Signature).toString("base64url")}`;
			} catch (error) {
				throw new propertyProvider.CredentialsProviderError(`Failed to generate Dpop proof: ${error instanceof Error ? error.message : String(error)}`, {
					logger: this.logger,
					tryNextLink: false
				});
			}
		}
	};
	const fromLoginCredentials = (init) => async ({ callerClientConfig } = {}) => {
		init?.logger?.debug?.("@aws-sdk/credential-providers - fromLoginCredentials");
		const profiles = await sharedIniFileLoader.parseKnownFiles(init || {});
		const profileName = sharedIniFileLoader.getProfileName({ profile: init?.profile ?? callerClientConfig?.profile });
		const profile = profiles[profileName];
		if (!profile?.login_session) throw new propertyProvider.CredentialsProviderError(`Profile ${profileName} does not contain login_session.`, {
			tryNextLink: true,
			logger: init?.logger
		});
		const credentials = await new LoginCredentialsFetcher(profile, init, callerClientConfig).loadCredentials();
		return client.setCredentialFeature(credentials, "CREDENTIALS_LOGIN", "AD");
	};
	exports.fromLoginCredentials = fromLoginCredentials;
}));
//#endregion
//#region node_modules/@aws-sdk/credential-provider-ini/dist-cjs/index.js
var require_dist_cjs = /* @__PURE__ */ __commonJSMin(((exports) => {
	var sharedIniFileLoader = require_dist_cjs$6();
	var propertyProvider = require_dist_cjs$7();
	var client = (init_client(), __toCommonJS(client_exports));
	var credentialProviderLogin = require_dist_cjs$1();
	const resolveCredentialSource = (credentialSource, profileName, logger) => {
		const sourceProvidersMap = {
			EcsContainer: async (options) => {
				const { fromHttp } = await import("./dist-cjs-DgbW9Y4l.js").then((m) => /* @__PURE__ */ __toESM(m.default));
				const { fromContainerMetadata } = await import("./dist-cjs-BxdSkkYZ.js").then((m) => /* @__PURE__ */ __toESM(m.default));
				logger?.debug("@aws-sdk/credential-provider-ini - credential_source is EcsContainer");
				return async () => propertyProvider.chain(fromHttp(options ?? {}), fromContainerMetadata(options))().then(setNamedProvider);
			},
			Ec2InstanceMetadata: async (options) => {
				logger?.debug("@aws-sdk/credential-provider-ini - credential_source is Ec2InstanceMetadata");
				const { fromInstanceMetadata } = await import("./dist-cjs-BxdSkkYZ.js").then((m) => /* @__PURE__ */ __toESM(m.default));
				return async () => fromInstanceMetadata(options)().then(setNamedProvider);
			},
			Environment: async (options) => {
				logger?.debug("@aws-sdk/credential-provider-ini - credential_source is Environment");
				const { fromEnv } = await import("./dist-cjs-R_QBYPw2.js").then((m) => /* @__PURE__ */ __toESM(m.default));
				return async () => fromEnv(options)().then(setNamedProvider);
			}
		};
		if (credentialSource in sourceProvidersMap) return sourceProvidersMap[credentialSource];
		else throw new propertyProvider.CredentialsProviderError(`Unsupported credential source in profile ${profileName}. Got ${credentialSource}, expected EcsContainer or Ec2InstanceMetadata or Environment.`, { logger });
	};
	const setNamedProvider = (creds) => client.setCredentialFeature(creds, "CREDENTIALS_PROFILE_NAMED_PROVIDER", "p");
	const isAssumeRoleProfile = (arg, { profile = "default", logger } = {}) => {
		return Boolean(arg) && typeof arg === "object" && typeof arg.role_arn === "string" && ["undefined", "string"].indexOf(typeof arg.role_session_name) > -1 && ["undefined", "string"].indexOf(typeof arg.external_id) > -1 && ["undefined", "string"].indexOf(typeof arg.mfa_serial) > -1 && (isAssumeRoleWithSourceProfile(arg, {
			profile,
			logger
		}) || isCredentialSourceProfile(arg, {
			profile,
			logger
		}));
	};
	const isAssumeRoleWithSourceProfile = (arg, { profile, logger }) => {
		const withSourceProfile = typeof arg.source_profile === "string" && typeof arg.credential_source === "undefined";
		if (withSourceProfile) logger?.debug?.(`    ${profile} isAssumeRoleWithSourceProfile source_profile=${arg.source_profile}`);
		return withSourceProfile;
	};
	const isCredentialSourceProfile = (arg, { profile, logger }) => {
		const withProviderProfile = typeof arg.credential_source === "string" && typeof arg.source_profile === "undefined";
		if (withProviderProfile) logger?.debug?.(`    ${profile} isCredentialSourceProfile credential_source=${arg.credential_source}`);
		return withProviderProfile;
	};
	const resolveAssumeRoleCredentials = async (profileName, profiles, options, callerClientConfig, visitedProfiles = {}, resolveProfileData) => {
		options.logger?.debug("@aws-sdk/credential-provider-ini - resolveAssumeRoleCredentials (STS)");
		const profileData = profiles[profileName];
		const { source_profile, region } = profileData;
		if (!options.roleAssumer) {
			const { getDefaultRoleAssumer } = await import("./sts-DdfHJjfp.js");
			options.roleAssumer = getDefaultRoleAssumer({
				...options.clientConfig,
				credentialProviderLogger: options.logger,
				parentClientConfig: {
					...callerClientConfig,
					...options?.parentClientConfig,
					region: region ?? options?.parentClientConfig?.region ?? callerClientConfig?.region
				}
			}, options.clientPlugins);
		}
		if (source_profile && source_profile in visitedProfiles) throw new propertyProvider.CredentialsProviderError(`Detected a cycle attempting to resolve credentials for profile ${sharedIniFileLoader.getProfileName(options)}. Profiles visited: ` + Object.keys(visitedProfiles).join(", "), { logger: options.logger });
		options.logger?.debug(`@aws-sdk/credential-provider-ini - finding credential resolver using ${source_profile ? `source_profile=[${source_profile}]` : `profile=[${profileName}]`}`);
		const sourceCredsProvider = source_profile ? resolveProfileData(source_profile, profiles, options, callerClientConfig, {
			...visitedProfiles,
			[source_profile]: true
		}, isCredentialSourceWithoutRoleArn(profiles[source_profile] ?? {})) : (await resolveCredentialSource(profileData.credential_source, profileName, options.logger)(options))();
		if (isCredentialSourceWithoutRoleArn(profileData)) return sourceCredsProvider.then((creds) => client.setCredentialFeature(creds, "CREDENTIALS_PROFILE_SOURCE_PROFILE", "o"));
		else {
			const params = {
				RoleArn: profileData.role_arn,
				RoleSessionName: profileData.role_session_name || `aws-sdk-js-${Date.now()}`,
				ExternalId: profileData.external_id,
				DurationSeconds: parseInt(profileData.duration_seconds || "3600", 10)
			};
			const { mfa_serial } = profileData;
			if (mfa_serial) {
				if (!options.mfaCodeProvider) throw new propertyProvider.CredentialsProviderError(`Profile ${profileName} requires multi-factor authentication, but no MFA code callback was provided.`, {
					logger: options.logger,
					tryNextLink: false
				});
				params.SerialNumber = mfa_serial;
				params.TokenCode = await options.mfaCodeProvider(mfa_serial);
			}
			const sourceCreds = await sourceCredsProvider;
			return options.roleAssumer(sourceCreds, params).then((creds) => client.setCredentialFeature(creds, "CREDENTIALS_PROFILE_SOURCE_PROFILE", "o"));
		}
	};
	const isCredentialSourceWithoutRoleArn = (section) => {
		return !section.role_arn && !!section.credential_source;
	};
	const isLoginProfile = (data) => {
		return Boolean(data && data.login_session);
	};
	const resolveLoginCredentials = async (profileName, options, callerClientConfig) => {
		const credentials = await credentialProviderLogin.fromLoginCredentials({
			...options,
			profile: profileName
		})({ callerClientConfig });
		return client.setCredentialFeature(credentials, "CREDENTIALS_PROFILE_LOGIN", "AC");
	};
	const isProcessProfile = (arg) => Boolean(arg) && typeof arg === "object" && typeof arg.credential_process === "string";
	const resolveProcessCredentials = async (options, profile) => import("./dist-cjs-tGIX__yx.js").then((m) => /* @__PURE__ */ __toESM(m.default)).then(({ fromProcess }) => fromProcess({
		...options,
		profile
	})().then((creds) => client.setCredentialFeature(creds, "CREDENTIALS_PROFILE_PROCESS", "v")));
	const resolveSsoCredentials = async (profile, profileData, options = {}, callerClientConfig) => {
		const { fromSSO } = await import("./dist-cjs-BQ2lExdw.js").then((m) => /* @__PURE__ */ __toESM(m.default));
		return fromSSO({
			profile,
			logger: options.logger,
			parentClientConfig: options.parentClientConfig,
			clientConfig: options.clientConfig
		})({ callerClientConfig }).then((creds) => {
			if (profileData.sso_session) return client.setCredentialFeature(creds, "CREDENTIALS_PROFILE_SSO", "r");
			else return client.setCredentialFeature(creds, "CREDENTIALS_PROFILE_SSO_LEGACY", "t");
		});
	};
	const isSsoProfile = (arg) => arg && (typeof arg.sso_start_url === "string" || typeof arg.sso_account_id === "string" || typeof arg.sso_session === "string" || typeof arg.sso_region === "string" || typeof arg.sso_role_name === "string");
	const isStaticCredsProfile = (arg) => Boolean(arg) && typeof arg === "object" && typeof arg.aws_access_key_id === "string" && typeof arg.aws_secret_access_key === "string" && ["undefined", "string"].indexOf(typeof arg.aws_session_token) > -1 && ["undefined", "string"].indexOf(typeof arg.aws_account_id) > -1;
	const resolveStaticCredentials = async (profile, options) => {
		options?.logger?.debug("@aws-sdk/credential-provider-ini - resolveStaticCredentials");
		const credentials = {
			accessKeyId: profile.aws_access_key_id,
			secretAccessKey: profile.aws_secret_access_key,
			sessionToken: profile.aws_session_token,
			...profile.aws_credential_scope && { credentialScope: profile.aws_credential_scope },
			...profile.aws_account_id && { accountId: profile.aws_account_id }
		};
		return client.setCredentialFeature(credentials, "CREDENTIALS_PROFILE", "n");
	};
	const isWebIdentityProfile = (arg) => Boolean(arg) && typeof arg === "object" && typeof arg.web_identity_token_file === "string" && typeof arg.role_arn === "string" && ["undefined", "string"].indexOf(typeof arg.role_session_name) > -1;
	const resolveWebIdentityCredentials = async (profile, options, callerClientConfig) => import("./dist-cjs-B1nlRL-a.js").then((m) => /* @__PURE__ */ __toESM(m.default)).then(({ fromTokenFile }) => fromTokenFile({
		webIdentityTokenFile: profile.web_identity_token_file,
		roleArn: profile.role_arn,
		roleSessionName: profile.role_session_name,
		roleAssumerWithWebIdentity: options.roleAssumerWithWebIdentity,
		logger: options.logger,
		parentClientConfig: options.parentClientConfig
	})({ callerClientConfig }).then((creds) => client.setCredentialFeature(creds, "CREDENTIALS_PROFILE_STS_WEB_ID_TOKEN", "q")));
	const resolveProfileData = async (profileName, profiles, options, callerClientConfig, visitedProfiles = {}, isAssumeRoleRecursiveCall = false) => {
		const data = profiles[profileName];
		if (Object.keys(visitedProfiles).length > 0 && isStaticCredsProfile(data)) return resolveStaticCredentials(data, options);
		if (isAssumeRoleRecursiveCall || isAssumeRoleProfile(data, {
			profile: profileName,
			logger: options.logger
		})) return resolveAssumeRoleCredentials(profileName, profiles, options, callerClientConfig, visitedProfiles, resolveProfileData);
		if (isStaticCredsProfile(data)) return resolveStaticCredentials(data, options);
		if (isWebIdentityProfile(data)) return resolveWebIdentityCredentials(data, options, callerClientConfig);
		if (isProcessProfile(data)) return resolveProcessCredentials(options, profileName);
		if (isSsoProfile(data)) return await resolveSsoCredentials(profileName, data, options, callerClientConfig);
		if (isLoginProfile(data)) return resolveLoginCredentials(profileName, options, callerClientConfig);
		throw new propertyProvider.CredentialsProviderError(`Could not resolve credentials using profile: [${profileName}] in configuration/credentials file(s).`, { logger: options.logger });
	};
	const fromIni = (init = {}) => async ({ callerClientConfig } = {}) => {
		init.logger?.debug("@aws-sdk/credential-provider-ini - fromIni");
		const profiles = await sharedIniFileLoader.parseKnownFiles(init);
		return resolveProfileData(sharedIniFileLoader.getProfileName({ profile: init.profile ?? callerClientConfig?.profile }), profiles, init, callerClientConfig);
	};
	exports.fromIni = fromIni;
}));
//#endregion
export default require_dist_cjs();
export {};
