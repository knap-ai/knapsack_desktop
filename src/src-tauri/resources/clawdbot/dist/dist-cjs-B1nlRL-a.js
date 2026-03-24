import { a as __toCommonJS, i as __require, t as __commonJSMin } from "./chunk-DORXReHP.js";
import { t as require_dist_cjs$3 } from "./dist-cjs-WSNQnW7p.js";
import { n as init_client, t as client_exports } from "./client-Cta4m6Io.js";
import "./dist-cjs-CG_9COlG.js";
import { n as sts_exports, t as init_sts } from "./sts-6HzBb82z.js";
//#region node_modules/@aws-sdk/credential-provider-web-identity/node_modules/@smithy/property-provider/dist-cjs/index.js
var require_dist_cjs$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
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
//#region node_modules/@aws-sdk/credential-provider-web-identity/node_modules/@smithy/shared-ini-file-loader/dist-cjs/getHomeDir.js
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
//#region node_modules/@aws-sdk/credential-provider-web-identity/node_modules/@smithy/shared-ini-file-loader/dist-cjs/getSSOTokenFilepath.js
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
//#region node_modules/@aws-sdk/credential-provider-web-identity/node_modules/@smithy/shared-ini-file-loader/dist-cjs/getSSOTokenFromFile.js
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
//#region node_modules/@aws-sdk/credential-provider-web-identity/node_modules/@smithy/shared-ini-file-loader/dist-cjs/readFile.js
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
//#region node_modules/@aws-sdk/credential-provider-web-identity/node_modules/@smithy/shared-ini-file-loader/dist-cjs/index.js
var require_dist_cjs$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var getHomeDir = require_getHomeDir();
	var getSSOTokenFilepath = require_getSSOTokenFilepath();
	var getSSOTokenFromFile = require_getSSOTokenFromFile();
	var path = __require("path");
	var types = require_dist_cjs$3();
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
//#region node_modules/@aws-sdk/credential-provider-web-identity/dist-cjs/fromWebToken.js
var require_fromWebToken = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || (function() {
		var ownKeys = function(o) {
			ownKeys = Object.getOwnPropertyNames || function(o) {
				var ar = [];
				for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
				return ar;
			};
			return ownKeys(o);
		};
		return function(mod) {
			if (mod && mod.__esModule) return mod;
			var result = {};
			if (mod != null) {
				for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
			}
			__setModuleDefault(result, mod);
			return result;
		};
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.fromWebToken = void 0;
	const fromWebToken = (init) => async (awsIdentityProperties) => {
		init.logger?.debug("@aws-sdk/credential-provider-web-identity - fromWebToken");
		const { roleArn, roleSessionName, webIdentityToken, providerId, policyArns, policy, durationSeconds } = init;
		let { roleAssumerWithWebIdentity } = init;
		if (!roleAssumerWithWebIdentity) {
			const { getDefaultRoleAssumerWithWebIdentity } = await Promise.resolve().then(() => __importStar((init_sts(), __toCommonJS(sts_exports))));
			roleAssumerWithWebIdentity = getDefaultRoleAssumerWithWebIdentity({
				...init.clientConfig,
				credentialProviderLogger: init.logger,
				parentClientConfig: {
					...awsIdentityProperties?.callerClientConfig,
					...init.parentClientConfig
				}
			}, init.clientPlugins);
		}
		return roleAssumerWithWebIdentity({
			RoleArn: roleArn,
			RoleSessionName: roleSessionName ?? `aws-sdk-js-session-${Date.now()}`,
			WebIdentityToken: webIdentityToken,
			ProviderId: providerId,
			PolicyArns: policyArns,
			Policy: policy,
			DurationSeconds: durationSeconds
		});
	};
	exports.fromWebToken = fromWebToken;
}));
//#endregion
//#region node_modules/@aws-sdk/credential-provider-web-identity/dist-cjs/fromTokenFile.js
var require_fromTokenFile = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.fromTokenFile = void 0;
	const client_1 = (init_client(), __toCommonJS(client_exports));
	const property_provider_1 = require_dist_cjs$2();
	const shared_ini_file_loader_1 = require_dist_cjs$1();
	const node_fs_1 = __require("node:fs");
	const fromWebToken_1 = require_fromWebToken();
	const ENV_TOKEN_FILE = "AWS_WEB_IDENTITY_TOKEN_FILE";
	const ENV_ROLE_ARN = "AWS_ROLE_ARN";
	const ENV_ROLE_SESSION_NAME = "AWS_ROLE_SESSION_NAME";
	const fromTokenFile = (init = {}) => async (awsIdentityProperties) => {
		init.logger?.debug("@aws-sdk/credential-provider-web-identity - fromTokenFile");
		const webIdentityTokenFile = init?.webIdentityTokenFile ?? process.env[ENV_TOKEN_FILE];
		const roleArn = init?.roleArn ?? process.env[ENV_ROLE_ARN];
		const roleSessionName = init?.roleSessionName ?? process.env[ENV_ROLE_SESSION_NAME];
		if (!webIdentityTokenFile || !roleArn) throw new property_provider_1.CredentialsProviderError("Web identity configuration not specified", { logger: init.logger });
		const credentials = await (0, fromWebToken_1.fromWebToken)({
			...init,
			webIdentityToken: shared_ini_file_loader_1.externalDataInterceptor?.getTokenRecord?.()[webIdentityTokenFile] ?? (0, node_fs_1.readFileSync)(webIdentityTokenFile, { encoding: "ascii" }),
			roleArn,
			roleSessionName
		})(awsIdentityProperties);
		if (webIdentityTokenFile === process.env[ENV_TOKEN_FILE]) (0, client_1.setCredentialFeature)(credentials, "CREDENTIALS_ENV_VARS_STS_WEB_ID_TOKEN", "h");
		return credentials;
	};
	exports.fromTokenFile = fromTokenFile;
}));
//#endregion
//#region node_modules/@aws-sdk/credential-provider-web-identity/dist-cjs/index.js
var require_dist_cjs = /* @__PURE__ */ __commonJSMin(((exports) => {
	var fromTokenFile = require_fromTokenFile();
	var fromWebToken = require_fromWebToken();
	Object.prototype.hasOwnProperty.call(fromTokenFile, "__proto__") && !Object.prototype.hasOwnProperty.call(exports, "__proto__") && Object.defineProperty(exports, "__proto__", {
		enumerable: true,
		value: fromTokenFile["__proto__"]
	});
	Object.keys(fromTokenFile).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) exports[k] = fromTokenFile[k];
	});
	Object.prototype.hasOwnProperty.call(fromWebToken, "__proto__") && !Object.prototype.hasOwnProperty.call(exports, "__proto__") && Object.defineProperty(exports, "__proto__", {
		enumerable: true,
		value: fromWebToken["__proto__"]
	});
	Object.keys(fromWebToken).forEach(function(k) {
		if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) exports[k] = fromWebToken[k];
	});
}));
//#endregion
export default require_dist_cjs();
export {};
