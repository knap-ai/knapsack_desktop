import { i as __require, o as __toESM, t as __commonJSMin } from "./chunk-DORXReHP.js";
import { n as redactSensitiveText } from "./redact-BDinS1q9.js";
import { _ as normalizeAccountId, g as DEFAULT_ACCOUNT_ID, v as normalizeOptionalAccountId } from "./session-key-DAhnzjyr.js";
import { a as hasConfiguredSecretInput, c as normalizeResolvedSecretInputString } from "./types.secrets-DgX397vI.js";
import { n as resolveNormalizedAccountEntry } from "./account-lookup-C4CvUou_.js";
import { i as isPrivateOrLoopbackHost } from "./net-JAg9zL0G.js";
import { Zt as listConfiguredAccountIds } from "./pi-embedded-CbCYZxIb.js";
import { o as resolveMergedAccountConfig } from "./account-helpers-BzkeDMfB.js";
import { o as isAutoLinkedFileRef } from "./text-runtime-DVXt5xhi.js";
import { d as resolvePinnedHostnameWithPolicy, i as createPinnedDispatcher, r as closeDispatcher } from "./ssrf-0bPJMoZR.js";
import { t as KeyedAsyncQueue } from "./keyed-async-queue-Bj6YmEFK.js";
import { n as writeJsonFileAtomically } from "./json-store--JDX3zNL.js";
import { a as ssrfPolicyFromAllowPrivateNetwork, t as assertHttpUrlTargetsPrivateNetwork } from "./ssrf-policy-DYINyIKC.js";
import { t as require_src } from "./src-BoNU6eQs.js";
import { n as normalizePollInput } from "./polls-BSvCQ2Fu.js";
import { r as resolveMatrixAccountStringValues } from "./matrix-wu3iTLk7.js";
import { d as requiresExplicitMatrixDefaultAccount, f as resolveConfiguredMatrixAccountIds, h as getMatrixScopedEnvVarNames, m as resolveMatrixDefaultOrOnlyAccountId, n as resolveMatrixAccountStorageRoot, s as resolveMatrixLegacyFlatStoragePaths } from "./helper-api-CFToxS1G.js";
import { r as maybeCreateMatrixMigrationSnapshot } from "./matrix-migration-snapshot-DTfN6Lm9.js";
import { a as getMatrixRuntime, n as loadMatrixCredentials, t as credentialsMatchConfig } from "./credentials-read-BLFr7diG.js";
import { $ as MapWithDefault, A as VerifierEvent, E as decodeRecoveryKey, N as Preset, O as VerificationPhase, U as KnownMembership, V as UNREAD_THREAD_NOTIFICATIONS, W as EventType$1, Y as logger, Z as MemoryCryptoStore, a as RoomStateEvent, ct as require_asyncToGenerator, et as deepCopy, it as recursiveMapToObject, j as MatrixScheduler, k as VerificationRequestEvent, l as ClientEvent, nt as isSupportedReceiptType, o as MAX_STICKY_DURATION_MS, ot as UnstableValue, q as TypedEventEmitter, s as MatrixEventEvent, st as require_defineProperty, t as VerificationMethod, u as MatrixClient$1, w as CryptoEvent } from "./types-DPt19vBR.js";
import { t as fromBuffer } from "./lib-362MCLYr.js";
import { n as TrackType, r as TrackTypeValueToKeyMap } from "./types-C97YVBu8.js";
import { S as UINT32_LE, a as UnsupportedFileTypeError, i as InternalParserError, n as CouldNotDetermineFileTypeError } from "./BasicParser-DQZpQAx5.js";
import { l as toRatio, n as decodeString } from "./Util-BhHo2Aeh.js";
import { c as TimestampFormat, i as LyricsContentType } from "./ID3v2Token--qJbrmUG.js";
import { a as textDecode, t as APEv2Parser } from "./APEv2Parser-D9Lk3cbl.js";
import { r as hasID3v1Header } from "./ID3v1Parser-CceERVjr.js";
import fs, { readFileSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { format } from "node:util";
import fs$1 from "node:fs/promises";
import { fileTypeFromBuffer } from "file-type";
import { EventEmitter } from "node:events";
import MarkdownIt from "markdown-it";
//#region extensions/matrix/src/matrix/account-config.ts
function resolveMatrixBaseConfig(cfg) {
	return cfg.channels?.matrix ?? {};
}
function resolveMatrixAccountsMap(cfg) {
	const accounts = resolveMatrixBaseConfig(cfg).accounts;
	if (!accounts || typeof accounts !== "object") return {};
	return accounts;
}
function listNormalizedMatrixAccountIds(cfg) {
	return listConfiguredAccountIds({
		accounts: resolveMatrixAccountsMap(cfg),
		normalizeAccountId
	});
}
function findMatrixAccountConfig(cfg, accountId) {
	return resolveNormalizedAccountEntry(resolveMatrixAccountsMap(cfg), accountId, normalizeAccountId);
}
function hasExplicitMatrixAccountConfig(cfg, accountId) {
	const normalized = normalizeAccountId(accountId);
	if (findMatrixAccountConfig(cfg, normalized)) return true;
	if (normalized !== "default") return false;
	const matrix = resolveMatrixBaseConfig(cfg);
	return typeof matrix.enabled === "boolean" || typeof matrix.name === "string" || typeof matrix.homeserver === "string" || typeof matrix.userId === "string" || typeof matrix.accessToken === "string" || typeof matrix.password === "string" || typeof matrix.deviceId === "string" || typeof matrix.deviceName === "string" || typeof matrix.avatarUrl === "string";
}
//#endregion
//#region extensions/matrix/src/matrix/client/runtime.ts
function isBunRuntime() {
	return typeof process.versions.bun === "string";
}
//#endregion
//#region extensions/matrix/src/matrix/config-update.ts
function applyNullableStringField(target, key, value) {
	if (value === void 0) return;
	if (value === null) {
		delete target[key];
		return;
	}
	const trimmed = value.trim();
	if (!trimmed) {
		delete target[key];
		return;
	}
	target[key] = trimmed;
}
function cloneMatrixDmConfig(dm) {
	if (!dm) return dm;
	return {
		...dm,
		...dm.allowFrom ? { allowFrom: [...dm.allowFrom] } : {}
	};
}
function cloneMatrixRoomMap(rooms) {
	if (!rooms) return rooms;
	return Object.fromEntries(Object.entries(rooms).map(([roomId, roomCfg]) => [roomId, roomCfg ? { ...roomCfg } : roomCfg]));
}
function applyNullableArrayField(target, key, value) {
	if (value === void 0) return;
	if (value === null) {
		delete target[key];
		return;
	}
	target[key] = [...value];
}
function shouldStoreMatrixAccountAtTopLevel(cfg, accountId) {
	if (normalizeAccountId(accountId) !== "default") return false;
	const accounts = cfg.channels?.matrix?.accounts;
	return !accounts || Object.keys(accounts).length === 0;
}
function resolveMatrixConfigPath(cfg, accountId) {
	const normalizedAccountId = normalizeAccountId(accountId);
	if (shouldStoreMatrixAccountAtTopLevel(cfg, normalizedAccountId)) return "channels.matrix";
	return `channels.matrix.accounts.${normalizedAccountId}`;
}
function resolveMatrixConfigFieldPath(cfg, accountId, fieldPath) {
	const suffix = fieldPath.trim().replace(/^\.+/, "");
	if (!suffix) return resolveMatrixConfigPath(cfg, accountId);
	return `${resolveMatrixConfigPath(cfg, accountId)}.${suffix}`;
}
function updateMatrixAccountConfig(cfg, accountId, patch) {
	const matrix = cfg.channels?.matrix ?? {};
	const normalizedAccountId = normalizeAccountId(accountId);
	const nextAccount = { ...findMatrixAccountConfig(cfg, normalizedAccountId) ?? (normalizedAccountId === "default" ? matrix : {}) };
	if (patch.name !== void 0) if (patch.name === null) delete nextAccount.name;
	else {
		const trimmed = patch.name.trim();
		if (trimmed) nextAccount.name = trimmed;
		else delete nextAccount.name;
	}
	if (typeof patch.enabled === "boolean") nextAccount.enabled = patch.enabled;
	else if (typeof nextAccount.enabled !== "boolean") nextAccount.enabled = true;
	applyNullableStringField(nextAccount, "homeserver", patch.homeserver);
	applyNullableStringField(nextAccount, "userId", patch.userId);
	applyNullableStringField(nextAccount, "accessToken", patch.accessToken);
	applyNullableStringField(nextAccount, "password", patch.password);
	applyNullableStringField(nextAccount, "deviceId", patch.deviceId);
	applyNullableStringField(nextAccount, "deviceName", patch.deviceName);
	applyNullableStringField(nextAccount, "avatarUrl", patch.avatarUrl);
	if (patch.allowPrivateNetwork !== void 0) if (patch.allowPrivateNetwork === null) delete nextAccount.allowPrivateNetwork;
	else nextAccount.allowPrivateNetwork = patch.allowPrivateNetwork;
	if (patch.initialSyncLimit !== void 0) if (patch.initialSyncLimit === null) delete nextAccount.initialSyncLimit;
	else nextAccount.initialSyncLimit = Math.max(0, Math.floor(patch.initialSyncLimit));
	if (patch.encryption !== void 0) if (patch.encryption === null) delete nextAccount.encryption;
	else nextAccount.encryption = patch.encryption;
	if (patch.allowBots !== void 0) if (patch.allowBots === null) delete nextAccount.allowBots;
	else nextAccount.allowBots = patch.allowBots;
	if (patch.dm !== void 0) if (patch.dm === null) delete nextAccount.dm;
	else nextAccount.dm = cloneMatrixDmConfig({
		...nextAccount.dm ?? {},
		...patch.dm
	});
	if (patch.groupPolicy !== void 0) if (patch.groupPolicy === null) delete nextAccount.groupPolicy;
	else nextAccount.groupPolicy = patch.groupPolicy;
	applyNullableArrayField(nextAccount, "groupAllowFrom", patch.groupAllowFrom);
	if (patch.groups !== void 0) if (patch.groups === null) delete nextAccount.groups;
	else nextAccount.groups = cloneMatrixRoomMap(patch.groups);
	if (patch.rooms !== void 0) if (patch.rooms === null) delete nextAccount.rooms;
	else nextAccount.rooms = cloneMatrixRoomMap(patch.rooms);
	const nextAccounts = Object.fromEntries(Object.entries(matrix.accounts ?? {}).filter(([rawAccountId]) => rawAccountId === normalizedAccountId || normalizeAccountId(rawAccountId) !== normalizedAccountId));
	if (shouldStoreMatrixAccountAtTopLevel(cfg, normalizedAccountId)) {
		const { accounts: _ignoredAccounts, defaultAccount, ...baseMatrix } = matrix;
		return {
			...cfg,
			channels: {
				...cfg.channels,
				matrix: {
					...baseMatrix,
					...defaultAccount ? { defaultAccount } : {},
					enabled: true,
					...nextAccount
				}
			}
		};
	}
	return {
		...cfg,
		channels: {
			...cfg.channels,
			matrix: {
				...matrix,
				enabled: true,
				accounts: {
					...nextAccounts,
					[normalizedAccountId]: nextAccount
				}
			}
		}
	};
}
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/errors.js
const messages = {
	AbortError: "A request was aborted, for example through a call to IDBTransaction.abort.",
	ConstraintError: "A mutation operation in the transaction failed because a constraint was not satisfied. For example, an object such as an object store or index already exists and a request attempted to create a new one.",
	DataCloneError: "The data being stored could not be cloned by the internal structured cloning algorithm.",
	DataError: "Data provided to an operation does not meet requirements.",
	InvalidAccessError: "An invalid operation was performed on an object. For example transaction creation attempt was made, but an empty scope was provided.",
	InvalidStateError: "An operation was called on an object on which it is not allowed or at a time when it is not allowed. Also occurs if a request is made on a source object that has been deleted or removed. Use TransactionInactiveError or ReadOnlyError when possible, as they are more specific variations of InvalidStateError.",
	NotFoundError: "The operation failed because the requested database object could not be found. For example, an object store did not exist but was being opened.",
	ReadOnlyError: "The mutating operation was attempted in a \"readonly\" transaction.",
	TransactionInactiveError: "A request was placed against a transaction which is currently not active, or which is finished.",
	SyntaxError: "The keypath argument contains an invalid key path",
	VersionError: "An attempt was made to open a database using a lower version than the existing version."
};
const setErrorCode = (error, value) => {
	Object.defineProperty(error, "code", {
		value,
		writable: false,
		enumerable: true,
		configurable: false
	});
};
var AbortError = class extends DOMException {
	constructor(message = messages.AbortError) {
		super(message, "AbortError");
	}
};
var ConstraintError = class extends DOMException {
	constructor(message = messages.ConstraintError) {
		super(message, "ConstraintError");
	}
};
var DataError = class extends DOMException {
	constructor(message = messages.DataError) {
		super(message, "DataError");
		setErrorCode(this, 0);
	}
};
var InvalidAccessError = class extends DOMException {
	constructor(message = messages.InvalidAccessError) {
		super(message, "InvalidAccessError");
	}
};
var InvalidStateError = class extends DOMException {
	constructor(message = messages.InvalidStateError) {
		super(message, "InvalidStateError");
		setErrorCode(this, 11);
	}
};
var NotFoundError = class extends DOMException {
	constructor(message = messages.NotFoundError) {
		super(message, "NotFoundError");
	}
};
var ReadOnlyError = class extends DOMException {
	constructor(message = messages.ReadOnlyError) {
		super(message, "ReadOnlyError");
	}
};
var SyntaxError = class extends DOMException {
	constructor(message = messages.VersionError) {
		super(message, "SyntaxError");
		setErrorCode(this, 12);
	}
};
var TransactionInactiveError = class extends DOMException {
	constructor(message = messages.TransactionInactiveError) {
		super(message, "TransactionInactiveError");
		setErrorCode(this, 0);
	}
};
var VersionError = class extends DOMException {
	constructor(message = messages.VersionError) {
		super(message, "VersionError");
	}
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/isSharedArrayBuffer.js
function isSharedArrayBuffer(input) {
	return typeof SharedArrayBuffer !== "undefined" && input instanceof SharedArrayBuffer;
}
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/valueToKeyWithoutThrowing.js
const INVALID_TYPE = Symbol("INVALID_TYPE");
const INVALID_VALUE = Symbol("INVALID_VALUE");
const valueToKeyWithoutThrowing = (input, seen) => {
	if (typeof input === "number") {
		if (isNaN(input)) return INVALID_VALUE;
		return input;
	} else if (Object.prototype.toString.call(input) === "[object Date]") {
		const ms = input.valueOf();
		if (isNaN(ms)) return INVALID_VALUE;
		return new Date(ms);
	} else if (typeof input === "string") return input;
	else if (input instanceof ArrayBuffer || isSharedArrayBuffer(input) || typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView && ArrayBuffer.isView(input)) {
		if ("detached" in input ? input.detached : input.byteLength === 0) return INVALID_VALUE;
		let arrayBuffer;
		let offset = 0;
		let length = 0;
		if (input instanceof ArrayBuffer || isSharedArrayBuffer(input)) {
			arrayBuffer = input;
			length = input.byteLength;
		} else {
			arrayBuffer = input.buffer;
			offset = input.byteOffset;
			length = input.byteLength;
		}
		return arrayBuffer.slice(offset, offset + length);
	} else if (Array.isArray(input)) {
		if (seen === void 0) seen = /* @__PURE__ */ new Set();
		else if (seen.has(input)) return INVALID_VALUE;
		seen.add(input);
		let hasInvalid = false;
		const keys = Array.from({ length: input.length }, (_, i) => {
			if (hasInvalid) return;
			if (!Object.hasOwn(input, i)) {
				hasInvalid = true;
				return;
			}
			const entry = input[i];
			const key = valueToKeyWithoutThrowing(entry, seen);
			if (key === INVALID_VALUE || key === INVALID_TYPE) {
				hasInvalid = true;
				return;
			}
			return key;
		});
		if (hasInvalid) return INVALID_VALUE;
		return keys;
	} else return INVALID_TYPE;
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/valueToKey.js
const valueToKey = (input, seen) => {
	const result = valueToKeyWithoutThrowing(input, seen);
	if (result === INVALID_VALUE || result === INVALID_TYPE) throw new DataError();
	return result;
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/cmp.js
const getType = (x) => {
	if (typeof x === "number") return "Number";
	if (Object.prototype.toString.call(x) === "[object Date]") return "Date";
	if (Array.isArray(x)) return "Array";
	if (typeof x === "string") return "String";
	if (x instanceof ArrayBuffer) return "Binary";
	throw new DataError();
};
const cmp = (first, second) => {
	if (second === void 0) throw new TypeError();
	first = valueToKey(first);
	second = valueToKey(second);
	const t1 = getType(first);
	const t2 = getType(second);
	if (t1 !== t2) {
		if (t1 === "Array") return 1;
		if (t1 === "Binary" && (t2 === "String" || t2 === "Date" || t2 === "Number")) return 1;
		if (t1 === "String" && (t2 === "Date" || t2 === "Number")) return 1;
		if (t1 === "Date" && t2 === "Number") return 1;
		return -1;
	}
	if (t1 === "Binary") {
		first = new Uint8Array(first);
		second = new Uint8Array(second);
	}
	if (t1 === "Array" || t1 === "Binary") {
		const length = Math.min(first.length, second.length);
		for (let i = 0; i < length; i++) {
			const result = cmp(first[i], second[i]);
			if (result !== 0) return result;
		}
		if (first.length > second.length) return 1;
		if (first.length < second.length) return -1;
		return 0;
	}
	if (t1 === "Date") {
		if (first.getTime() === second.getTime()) return 0;
	} else if (first === second) return 0;
	return first > second ? 1 : -1;
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/FDBKeyRange.js
var FDBKeyRange = class FDBKeyRange {
	static only(value) {
		if (arguments.length === 0) throw new TypeError();
		value = valueToKey(value);
		return new FDBKeyRange(value, value, false, false);
	}
	static lowerBound(lower, open = false) {
		if (arguments.length === 0) throw new TypeError();
		lower = valueToKey(lower);
		return new FDBKeyRange(lower, void 0, open, true);
	}
	static upperBound(upper, open = false) {
		if (arguments.length === 0) throw new TypeError();
		upper = valueToKey(upper);
		return new FDBKeyRange(void 0, upper, true, open);
	}
	static bound(lower, upper, lowerOpen = false, upperOpen = false) {
		if (arguments.length < 2) throw new TypeError();
		const cmpResult = cmp(lower, upper);
		if (cmpResult === 1 || cmpResult === 0 && (lowerOpen || upperOpen)) throw new DataError();
		lower = valueToKey(lower);
		upper = valueToKey(upper);
		return new FDBKeyRange(lower, upper, lowerOpen, upperOpen);
	}
	constructor(lower, upper, lowerOpen, upperOpen) {
		this.lower = lower;
		this.upper = upper;
		this.lowerOpen = lowerOpen;
		this.upperOpen = upperOpen;
	}
	includes(key) {
		if (arguments.length === 0) throw new TypeError();
		key = valueToKey(key);
		if (this.lower !== void 0) {
			const cmpResult = cmp(this.lower, key);
			if (cmpResult === 1 || cmpResult === 0 && this.lowerOpen) return false;
		}
		if (this.upper !== void 0) {
			const cmpResult = cmp(this.upper, key);
			if (cmpResult === -1 || cmpResult === 0 && this.upperOpen) return false;
		}
		return true;
	}
	get [Symbol.toStringTag]() {
		return "IDBKeyRange";
	}
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/extractKey.js
const extractKey = (keyPath, value) => {
	if (Array.isArray(keyPath)) {
		const result = [];
		for (let item of keyPath) {
			if (item !== void 0 && item !== null && typeof item !== "string" && item.toString) item = item.toString();
			const key = extractKey(item, value).key;
			result.push(valueToKey(key));
		}
		return {
			type: "found",
			key: result
		};
	}
	if (keyPath === "") return {
		type: "found",
		key: value
	};
	let remainingKeyPath = keyPath;
	let object = value;
	while (remainingKeyPath !== null) {
		let identifier;
		const i = remainingKeyPath.indexOf(".");
		if (i >= 0) {
			identifier = remainingKeyPath.slice(0, i);
			remainingKeyPath = remainingKeyPath.slice(i + 1);
		} else {
			identifier = remainingKeyPath;
			remainingKeyPath = null;
		}
		if (!(identifier === "length" && (typeof object === "string" || Array.isArray(object)) || (identifier === "size" || identifier === "type") && typeof Blob !== "undefined" && object instanceof Blob || (identifier === "name" || identifier === "lastModified") && typeof File !== "undefined" && object instanceof File) && (typeof object !== "object" || object === null || !Object.hasOwn(object, identifier))) return { type: "notFound" };
		object = object[identifier];
	}
	return {
		type: "found",
		key: object
	};
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/cloneValueForInsertion.js
function cloneValueForInsertion(value, transaction) {
	if (transaction._state !== "active") throw new Error("Assert: transaction state is active");
	transaction._state = "inactive";
	try {
		return structuredClone(value);
	} finally {
		transaction._state = "active";
	}
}
//#endregion
//#region node_modules/fake-indexeddb/build/esm/FDBCursor.js
const getEffectiveObjectStore = (cursor) => {
	if (cursor.source instanceof FDBObjectStore) return cursor.source;
	return cursor.source.objectStore;
};
const makeKeyRange = (range, lowers, uppers) => {
	let lower = range !== void 0 ? range.lower : void 0;
	let upper = range !== void 0 ? range.upper : void 0;
	for (const lowerTemp of lowers) {
		if (lowerTemp === void 0) continue;
		if (lower === void 0 || cmp(lower, lowerTemp) === 1) lower = lowerTemp;
	}
	for (const upperTemp of uppers) {
		if (upperTemp === void 0) continue;
		if (upper === void 0 || cmp(upper, upperTemp) === -1) upper = upperTemp;
	}
	if (lower !== void 0 && upper !== void 0) return FDBKeyRange.bound(lower, upper);
	if (lower !== void 0) return FDBKeyRange.lowerBound(lower);
	if (upper !== void 0) return FDBKeyRange.upperBound(upper);
};
var FDBCursor = class {
	_gotValue = false;
	_position = void 0;
	_objectStorePosition = void 0;
	_keyOnly = false;
	_key = void 0;
	_primaryKey = void 0;
	constructor(source, range, direction = "next", request, keyOnly = false) {
		this._range = range;
		this._source = source;
		this._direction = direction;
		this._request = request;
		this._keyOnly = keyOnly;
	}
	get source() {
		return this._source;
	}
	set source(val) {}
	get request() {
		return this._request;
	}
	set request(val) {}
	get direction() {
		return this._direction;
	}
	set direction(val) {}
	get key() {
		return this._key;
	}
	set key(val) {}
	get primaryKey() {
		return this._primaryKey;
	}
	set primaryKey(val) {}
	_iterate(key, primaryKey) {
		const sourceIsObjectStore = this.source instanceof FDBObjectStore;
		const records = this.source instanceof FDBObjectStore ? this.source._rawObjectStore.records : this.source._rawIndex.records;
		let foundRecord;
		if (this.direction === "next") {
			const range = makeKeyRange(this._range, [key, this._position], []);
			for (const record of records.values(range)) {
				const cmpResultKey = key !== void 0 ? cmp(record.key, key) : void 0;
				const cmpResultPosition = this._position !== void 0 ? cmp(record.key, this._position) : void 0;
				if (key !== void 0) {
					if (cmpResultKey === -1) continue;
				}
				if (primaryKey !== void 0) {
					if (cmpResultKey === -1) continue;
					const cmpResultPrimaryKey = cmp(record.value, primaryKey);
					if (cmpResultKey === 0 && cmpResultPrimaryKey === -1) continue;
				}
				if (this._position !== void 0 && sourceIsObjectStore) {
					if (cmpResultPosition !== 1) continue;
				}
				if (this._position !== void 0 && !sourceIsObjectStore) {
					if (cmpResultPosition === -1) continue;
					if (cmpResultPosition === 0 && cmp(record.value, this._objectStorePosition) !== 1) continue;
				}
				if (this._range !== void 0) {
					if (!this._range.includes(record.key)) continue;
				}
				foundRecord = record;
				break;
			}
		} else if (this.direction === "nextunique") {
			const range = makeKeyRange(this._range, [key, this._position], []);
			for (const record of records.values(range)) {
				if (key !== void 0) {
					if (cmp(record.key, key) === -1) continue;
				}
				if (this._position !== void 0) {
					if (cmp(record.key, this._position) !== 1) continue;
				}
				if (this._range !== void 0) {
					if (!this._range.includes(record.key)) continue;
				}
				foundRecord = record;
				break;
			}
		} else if (this.direction === "prev") {
			const range = makeKeyRange(this._range, [], [key, this._position]);
			for (const record of records.values(range, "prev")) {
				const cmpResultKey = key !== void 0 ? cmp(record.key, key) : void 0;
				const cmpResultPosition = this._position !== void 0 ? cmp(record.key, this._position) : void 0;
				if (key !== void 0) {
					if (cmpResultKey === 1) continue;
				}
				if (primaryKey !== void 0) {
					if (cmpResultKey === 1) continue;
					const cmpResultPrimaryKey = cmp(record.value, primaryKey);
					if (cmpResultKey === 0 && cmpResultPrimaryKey === 1) continue;
				}
				if (this._position !== void 0 && sourceIsObjectStore) {
					if (cmpResultPosition !== -1) continue;
				}
				if (this._position !== void 0 && !sourceIsObjectStore) {
					if (cmpResultPosition === 1) continue;
					if (cmpResultPosition === 0 && cmp(record.value, this._objectStorePosition) !== -1) continue;
				}
				if (this._range !== void 0) {
					if (!this._range.includes(record.key)) continue;
				}
				foundRecord = record;
				break;
			}
		} else if (this.direction === "prevunique") {
			let tempRecord;
			const range = makeKeyRange(this._range, [], [key, this._position]);
			for (const record of records.values(range, "prev")) {
				if (key !== void 0) {
					if (cmp(record.key, key) === 1) continue;
				}
				if (this._position !== void 0) {
					if (cmp(record.key, this._position) !== -1) continue;
				}
				if (this._range !== void 0) {
					if (!this._range.includes(record.key)) continue;
				}
				tempRecord = record;
				break;
			}
			if (tempRecord) foundRecord = records.get(tempRecord.key);
		}
		let result;
		if (!foundRecord) {
			this._key = void 0;
			if (!sourceIsObjectStore) this._objectStorePosition = void 0;
			if (!this._keyOnly && this.toString() === "[object IDBCursorWithValue]") this.value = void 0;
			result = null;
		} else {
			this._position = foundRecord.key;
			if (!sourceIsObjectStore) this._objectStorePosition = foundRecord.value;
			this._key = foundRecord.key;
			if (sourceIsObjectStore) {
				this._primaryKey = structuredClone(foundRecord.key);
				if (!this._keyOnly && this.toString() === "[object IDBCursorWithValue]") this.value = structuredClone(foundRecord.value);
			} else {
				this._primaryKey = structuredClone(foundRecord.value);
				if (!this._keyOnly && this.toString() === "[object IDBCursorWithValue]") {
					if (this.source instanceof FDBObjectStore) throw new Error("This should never happen");
					const value = this.source.objectStore._rawObjectStore.getValue(foundRecord.value);
					this.value = structuredClone(value);
				}
			}
			this._gotValue = true;
			result = this;
		}
		return result;
	}
	update(value) {
		if (value === void 0) throw new TypeError();
		const effectiveObjectStore = getEffectiveObjectStore(this);
		const effectiveKey = Object.hasOwn(this.source, "_rawIndex") ? this.primaryKey : this._position;
		const transaction = effectiveObjectStore.transaction;
		if (transaction._state !== "active") throw new TransactionInactiveError();
		if (transaction.mode === "readonly") throw new ReadOnlyError();
		if (effectiveObjectStore._rawObjectStore.deleted) throw new InvalidStateError();
		if (!(this.source instanceof FDBObjectStore) && this.source._rawIndex.deleted) throw new InvalidStateError();
		if (!this._gotValue || !Object.hasOwn(this, "value")) throw new InvalidStateError();
		const clone = cloneValueForInsertion(value, transaction);
		if (effectiveObjectStore.keyPath !== null) {
			let tempKey;
			try {
				tempKey = extractKey(effectiveObjectStore.keyPath, clone).key;
			} catch (err) {}
			if (cmp(tempKey, effectiveKey) !== 0) throw new DataError();
		}
		const record = {
			key: effectiveKey,
			value: clone
		};
		return transaction._execRequestAsync({
			operation: effectiveObjectStore._rawObjectStore.storeRecord.bind(effectiveObjectStore._rawObjectStore, record, false, transaction._rollbackLog),
			source: this
		});
	}
	advance(count) {
		if (!Number.isInteger(count) || count <= 0) throw new TypeError();
		const effectiveObjectStore = getEffectiveObjectStore(this);
		const transaction = effectiveObjectStore.transaction;
		if (transaction._state !== "active") throw new TransactionInactiveError();
		if (effectiveObjectStore._rawObjectStore.deleted) throw new InvalidStateError();
		if (!(this.source instanceof FDBObjectStore) && this.source._rawIndex.deleted) throw new InvalidStateError();
		if (!this._gotValue) throw new InvalidStateError();
		if (this._request) this._request.readyState = "pending";
		transaction._execRequestAsync({
			operation: () => {
				let result;
				for (let i = 0; i < count; i++) {
					result = this._iterate();
					if (!result) break;
				}
				return result;
			},
			request: this._request,
			source: this.source
		});
		this._gotValue = false;
	}
	continue(key) {
		const effectiveObjectStore = getEffectiveObjectStore(this);
		const transaction = effectiveObjectStore.transaction;
		if (transaction._state !== "active") throw new TransactionInactiveError();
		if (effectiveObjectStore._rawObjectStore.deleted) throw new InvalidStateError();
		if (!(this.source instanceof FDBObjectStore) && this.source._rawIndex.deleted) throw new InvalidStateError();
		if (!this._gotValue) throw new InvalidStateError();
		if (key !== void 0) {
			key = valueToKey(key);
			const cmpResult = cmp(key, this._position);
			if (cmpResult <= 0 && (this.direction === "next" || this.direction === "nextunique") || cmpResult >= 0 && (this.direction === "prev" || this.direction === "prevunique")) throw new DataError();
		}
		if (this._request) this._request.readyState = "pending";
		transaction._execRequestAsync({
			operation: this._iterate.bind(this, key),
			request: this._request,
			source: this.source
		});
		this._gotValue = false;
	}
	continuePrimaryKey(key, primaryKey) {
		const effectiveObjectStore = getEffectiveObjectStore(this);
		const transaction = effectiveObjectStore.transaction;
		if (transaction._state !== "active") throw new TransactionInactiveError();
		if (effectiveObjectStore._rawObjectStore.deleted) throw new InvalidStateError();
		if (!(this.source instanceof FDBObjectStore) && this.source._rawIndex.deleted) throw new InvalidStateError();
		if (this.source instanceof FDBObjectStore || this.direction !== "next" && this.direction !== "prev") throw new InvalidAccessError();
		if (!this._gotValue) throw new InvalidStateError();
		if (key === void 0 || primaryKey === void 0) throw new DataError();
		key = valueToKey(key);
		const cmpResult = cmp(key, this._position);
		if (cmpResult === -1 && this.direction === "next" || cmpResult === 1 && this.direction === "prev") throw new DataError();
		const cmpResult2 = cmp(primaryKey, this._objectStorePosition);
		if (cmpResult === 0) {
			if (cmpResult2 <= 0 && this.direction === "next" || cmpResult2 >= 0 && this.direction === "prev") throw new DataError();
		}
		if (this._request) this._request.readyState = "pending";
		transaction._execRequestAsync({
			operation: this._iterate.bind(this, key, primaryKey),
			request: this._request,
			source: this.source
		});
		this._gotValue = false;
	}
	delete() {
		const effectiveObjectStore = getEffectiveObjectStore(this);
		const effectiveKey = Object.hasOwn(this.source, "_rawIndex") ? this.primaryKey : this._position;
		const transaction = effectiveObjectStore.transaction;
		if (transaction._state !== "active") throw new TransactionInactiveError();
		if (transaction.mode === "readonly") throw new ReadOnlyError();
		if (effectiveObjectStore._rawObjectStore.deleted) throw new InvalidStateError();
		if (!(this.source instanceof FDBObjectStore) && this.source._rawIndex.deleted) throw new InvalidStateError();
		if (!this._gotValue || !Object.hasOwn(this, "value")) throw new InvalidStateError();
		return transaction._execRequestAsync({
			operation: effectiveObjectStore._rawObjectStore.deleteRecord.bind(effectiveObjectStore._rawObjectStore, effectiveKey, transaction._rollbackLog),
			source: this
		});
	}
	get [Symbol.toStringTag]() {
		return "IDBCursor";
	}
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/FDBCursorWithValue.js
var FDBCursorWithValue = class extends FDBCursor {
	value = void 0;
	constructor(source, range, direction, request) {
		super(source, range, direction, request);
	}
	get [Symbol.toStringTag]() {
		return "IDBCursorWithValue";
	}
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/FakeEventTarget.js
const stopped = (event, listener) => {
	return event.immediatePropagationStopped || event.eventPhase === event.CAPTURING_PHASE && listener.capture === false || event.eventPhase === event.BUBBLING_PHASE && listener.capture === true;
};
const invokeEventListeners = (event, obj) => {
	event.currentTarget = obj;
	const errors = [];
	const invoke = (callbackOrObject) => {
		try {
			(typeof callbackOrObject === "function" ? callbackOrObject : callbackOrObject.handleEvent).call(event.currentTarget, event);
		} catch (err) {
			errors.push(err);
		}
	};
	for (const listener of obj.listeners.slice()) {
		if (event.type !== listener.type || stopped(event, listener)) continue;
		invoke(listener.callback);
	}
	const prop = {
		abort: "onabort",
		blocked: "onblocked",
		close: "onclose",
		complete: "oncomplete",
		error: "onerror",
		success: "onsuccess",
		upgradeneeded: "onupgradeneeded",
		versionchange: "onversionchange"
	}[event.type];
	if (prop === void 0) throw new Error(`Unknown event type: "${event.type}"`);
	const callback = event.currentTarget[prop];
	if (callback) {
		const listener = {
			callback,
			capture: false,
			type: event.type
		};
		if (!stopped(event, listener)) invoke(listener.callback);
	}
	if (errors.length) throw new AggregateError(errors);
};
var FakeEventTarget = class {
	listeners = [];
	addEventListener(type, callback, options) {
		const capture = !!(typeof options === "object" && options ? options.capture : options);
		this.listeners.push({
			callback,
			capture,
			type
		});
	}
	removeEventListener(type, callback, options) {
		const capture = !!(typeof options === "object" && options ? options.capture : options);
		const i = this.listeners.findIndex((listener) => {
			return listener.type === type && listener.callback === callback && listener.capture === capture;
		});
		this.listeners.splice(i, 1);
	}
	dispatchEvent(event) {
		if (event.dispatched || !event.initialized) throw new InvalidStateError("The object is in an invalid state.");
		event.isTrusted = false;
		event.dispatched = true;
		event.target = this;
		event.eventPhase = event.CAPTURING_PHASE;
		for (const obj of event.eventPath) if (!event.propagationStopped) invokeEventListeners(event, obj);
		event.eventPhase = event.AT_TARGET;
		if (!event.propagationStopped) invokeEventListeners(event, event.target);
		if (event.bubbles) {
			event.eventPath.reverse();
			event.eventPhase = event.BUBBLING_PHASE;
			for (const obj of event.eventPath) if (!event.propagationStopped) invokeEventListeners(event, obj);
		}
		event.dispatched = false;
		event.eventPhase = event.NONE;
		event.currentTarget = null;
		if (event.canceled) return false;
		return true;
	}
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/FDBRequest.js
var FDBRequest = class extends FakeEventTarget {
	_result = null;
	_error = null;
	source = null;
	transaction = null;
	readyState = "pending";
	onsuccess = null;
	onerror = null;
	get error() {
		if (this.readyState === "pending") throw new InvalidStateError();
		return this._error;
	}
	set error(value) {
		this._error = value;
	}
	get result() {
		if (this.readyState === "pending") throw new InvalidStateError();
		return this._result;
	}
	set result(value) {
		this._result = value;
	}
	get [Symbol.toStringTag]() {
		return "IDBRequest";
	}
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/FakeDOMStringList.js
var FakeDOMStringList = class {
	constructor(...values) {
		this._values = values;
		for (let i = 0; i < values.length; i++) this[i] = values[i];
	}
	contains(value) {
		return this._values.includes(value);
	}
	item(i) {
		if (i < 0 || i >= this._values.length) return null;
		return this._values[i];
	}
	get length() {
		return this._values.length;
	}
	[Symbol.iterator]() {
		return this._values[Symbol.iterator]();
	}
	_push(...values) {
		for (let i = 0; i < values.length; i++) this[this._values.length + i] = values[i];
		this._values.push(...values);
	}
	_sort(...values) {
		this._values.sort(...values);
		for (let i = 0; i < this._values.length; i++) this[i] = this._values[i];
		return this;
	}
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/valueToKeyRange.js
const valueToKeyRange = (value, nullDisallowedFlag = false) => {
	if (value instanceof FDBKeyRange) return value;
	if (value === null || value === void 0) {
		if (nullDisallowedFlag) throw new DataError();
		return new FDBKeyRange(void 0, void 0, false, false);
	}
	const key = valueToKey(value);
	return FDBKeyRange.only(key);
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/getKeyPath.js
const convertKey = (key) => typeof key === "object" && key ? key + "" : key;
function getKeyPath(keyPath) {
	return Array.isArray(keyPath) ? keyPath.map(convertKey) : convertKey(keyPath);
}
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/isPotentiallyValidKeyRange.js
const isPotentiallyValidKeyRange = (value) => {
	if (value instanceof FDBKeyRange) return true;
	return valueToKeyWithoutThrowing(value) !== INVALID_TYPE;
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/enforceRange.js
const enforceRange = (num, type) => {
	const min = 0;
	const max = type === "unsigned long" ? 4294967295 : 9007199254740991;
	if (isNaN(num) || num < min || num > max) throw new TypeError();
	if (num >= 0) return Math.floor(num);
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/extractGetAllOptions.js
const extractGetAllOptions = (queryOrOptions, count, numArguments) => {
	let query;
	let direction;
	if (queryOrOptions === void 0 || queryOrOptions === null || isPotentiallyValidKeyRange(queryOrOptions)) {
		query = queryOrOptions;
		if (numArguments > 1 && count !== void 0) count = enforceRange(count, "unsigned long");
	} else {
		const getAllOptions = queryOrOptions;
		if (getAllOptions.query !== void 0) query = getAllOptions.query;
		if (getAllOptions.count !== void 0) count = enforceRange(getAllOptions.count, "unsigned long");
		if (getAllOptions.direction !== void 0) direction = getAllOptions.direction;
	}
	return {
		query,
		count,
		direction
	};
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/FDBIndex.js
const confirmActiveTransaction$1 = (index) => {
	if (index._rawIndex.deleted || index.objectStore._rawObjectStore.deleted) throw new InvalidStateError();
	if (index.objectStore.transaction._state !== "active") throw new TransactionInactiveError();
};
var FDBIndex = class {
	constructor(objectStore, rawIndex) {
		this._rawIndex = rawIndex;
		this._name = rawIndex.name;
		this.objectStore = objectStore;
		this.keyPath = getKeyPath(rawIndex.keyPath);
		this.multiEntry = rawIndex.multiEntry;
		this.unique = rawIndex.unique;
	}
	get name() {
		return this._name;
	}
	set name(name) {
		const transaction = this.objectStore.transaction;
		if (!transaction.db._runningVersionchangeTransaction) throw transaction._state === "active" ? new InvalidStateError() : new TransactionInactiveError();
		if (transaction._state !== "active") throw new TransactionInactiveError();
		if (this._rawIndex.deleted || this.objectStore._rawObjectStore.deleted) throw new InvalidStateError();
		name = String(name);
		if (name === this._name) return;
		if (this.objectStore.indexNames.contains(name)) throw new ConstraintError();
		const oldName = this._name;
		const oldIndexNames = [...this.objectStore.indexNames];
		this._name = name;
		this._rawIndex.name = name;
		this.objectStore._indexesCache.delete(oldName);
		this.objectStore._indexesCache.set(name, this);
		this.objectStore._rawObjectStore.rawIndexes.delete(oldName);
		this.objectStore._rawObjectStore.rawIndexes.set(name, this._rawIndex);
		this.objectStore.indexNames = new FakeDOMStringList(...Array.from(this.objectStore._rawObjectStore.rawIndexes.keys()).filter((indexName) => {
			const index = this.objectStore._rawObjectStore.rawIndexes.get(indexName);
			return index && !index.deleted;
		}).sort());
		if (!this.objectStore.transaction._createdIndexes.has(this._rawIndex)) transaction._rollbackLog.push(() => {
			this._name = oldName;
			this._rawIndex.name = oldName;
			this.objectStore._indexesCache.delete(name);
			this.objectStore._indexesCache.set(oldName, this);
			this.objectStore._rawObjectStore.rawIndexes.delete(name);
			this.objectStore._rawObjectStore.rawIndexes.set(oldName, this._rawIndex);
			this.objectStore.indexNames = new FakeDOMStringList(...oldIndexNames);
		});
	}
	openCursor(range, direction) {
		confirmActiveTransaction$1(this);
		if (range === null) range = void 0;
		if (range !== void 0 && !(range instanceof FDBKeyRange)) range = FDBKeyRange.only(valueToKey(range));
		const request = new FDBRequest();
		request.source = this;
		request.transaction = this.objectStore.transaction;
		const cursor = new FDBCursorWithValue(this, range, direction, request);
		return this.objectStore.transaction._execRequestAsync({
			operation: cursor._iterate.bind(cursor),
			request,
			source: this
		});
	}
	openKeyCursor(range, direction) {
		confirmActiveTransaction$1(this);
		if (range === null) range = void 0;
		if (range !== void 0 && !(range instanceof FDBKeyRange)) range = FDBKeyRange.only(valueToKey(range));
		const request = new FDBRequest();
		request.source = this;
		request.transaction = this.objectStore.transaction;
		const cursor = new FDBCursor(this, range, direction, request, true);
		return this.objectStore.transaction._execRequestAsync({
			operation: cursor._iterate.bind(cursor),
			request,
			source: this
		});
	}
	get(key) {
		confirmActiveTransaction$1(this);
		if (!(key instanceof FDBKeyRange)) key = valueToKey(key);
		return this.objectStore.transaction._execRequestAsync({
			operation: this._rawIndex.getValue.bind(this._rawIndex, key),
			source: this
		});
	}
	getAll(queryOrOptions, count) {
		const options = extractGetAllOptions(queryOrOptions, count, arguments.length);
		confirmActiveTransaction$1(this);
		const range = valueToKeyRange(options.query);
		return this.objectStore.transaction._execRequestAsync({
			operation: this._rawIndex.getAllValues.bind(this._rawIndex, range, options.count, options.direction),
			source: this
		});
	}
	getKey(key) {
		confirmActiveTransaction$1(this);
		if (!(key instanceof FDBKeyRange)) key = valueToKey(key);
		return this.objectStore.transaction._execRequestAsync({
			operation: this._rawIndex.getKey.bind(this._rawIndex, key),
			source: this
		});
	}
	getAllKeys(queryOrOptions, count) {
		const options = extractGetAllOptions(queryOrOptions, count, arguments.length);
		confirmActiveTransaction$1(this);
		const range = valueToKeyRange(options.query);
		return this.objectStore.transaction._execRequestAsync({
			operation: this._rawIndex.getAllKeys.bind(this._rawIndex, range, options.count, options.direction),
			source: this
		});
	}
	getAllRecords(options) {
		let query;
		let count;
		let direction;
		if (options !== void 0) {
			if (options.query !== void 0) query = options.query;
			if (options.count !== void 0) count = enforceRange(options.count, "unsigned long");
			if (options.direction !== void 0) direction = options.direction;
		}
		confirmActiveTransaction$1(this);
		const range = valueToKeyRange(query);
		return this.objectStore.transaction._execRequestAsync({
			operation: this._rawIndex.getAllRecords.bind(this._rawIndex, range, count, direction),
			source: this
		});
	}
	count(key) {
		confirmActiveTransaction$1(this);
		if (key === null) key = void 0;
		if (key !== void 0 && !(key instanceof FDBKeyRange)) key = FDBKeyRange.only(valueToKey(key));
		return this.objectStore.transaction._execRequestAsync({
			operation: () => {
				return this._rawIndex.count(key);
			},
			source: this
		});
	}
	get [Symbol.toStringTag]() {
		return "IDBIndex";
	}
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/canInjectKey.js
const canInjectKey = (keyPath, value) => {
	if (Array.isArray(keyPath)) throw new Error("The key paths used in this section are always strings and never sequences, since it is not possible to create a object store which has a key generator and also has a key path that is a sequence.");
	const identifiers = keyPath.split(".");
	if (identifiers.length === 0) throw new Error("Assert: identifiers is not empty");
	identifiers.pop();
	for (const identifier of identifiers) {
		if (typeof value !== "object" && !Array.isArray(value)) return false;
		if (!Object.hasOwn(value, identifier)) return true;
		value = value[identifier];
	}
	return typeof value === "object" || Array.isArray(value);
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/FDBRecord.js
var FDBRecord = class {
	constructor(key, primaryKey, value) {
		this._key = key;
		this._primaryKey = primaryKey;
		this._value = value;
	}
	get key() {
		return this._key;
	}
	set key(_) {}
	get primaryKey() {
		return this._primaryKey;
	}
	set primaryKey(_) {}
	get value() {
		return this._value;
	}
	set value(_) {}
	get [Symbol.toStringTag]() {
		return "IDBRecord";
	}
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/binarySearchTree.js
const MAX_TOMBSTONE_FACTOR = 2 / 3;
const EVERYTHING_KEY_RANGE = new FDBKeyRange(void 0, void 0, false, false);
/**
* Simple red-black binary tree with some aspects of a scapegoat tree. The main goal here is simplicity of
* implementation, tailored to the needs of IndexedDB.
*
* Basically this implements a [red-black tree][1] for insertions, but uses the much simpler [scapegoat tree][2]
* strategy for deletions. Deletions are a simple matter of rebuilding the tree from scratch if more than 2/3 of the
* tree is full of deleted (tombstone) markers.
*
* [1]: https://en.wikipedia.org/wiki/Red%E2%80%93black_tree
* [2]: https://en.wikipedia.org/wiki/Scapegoat_tree
*/
var BinarySearchTree = class {
	_numTombstones = 0;
	_numNodes = 0;
	/**
	*
	* @param keysAreUnique - whether keys can be unique, and thus whether we cn skip checking `record.value` when
	* comparing. This is basically used to distinguish ObjectStores (where the value is the entire object, not used
	* as a key) from non-unique Indexes (where both the key and the value are meaningful keys used for sorting)
	*/
	constructor(keysAreUnique) {
		this._keysAreUnique = !!keysAreUnique;
	}
	size() {
		return this._numNodes - this._numTombstones;
	}
	get(record) {
		return this._getByComparator(this._root, (otherRecord) => this._compare(record, otherRecord));
	}
	contains(record) {
		return !!this.get(record);
	}
	_compare(a, b) {
		const keyComparison = cmp(a.key, b.key);
		if (keyComparison !== 0) return keyComparison;
		return this._keysAreUnique ? 0 : cmp(a.value, b.value);
	}
	_getByComparator(node, comparator) {
		let current = node;
		while (current) {
			const comparison = comparator(current.record);
			if (comparison < 0) current = current.left;
			else if (comparison > 0) current = current.right;
			else return current.record;
		}
	}
	/**
	* Put a new record, and return the overwritten record if an overwrite occurred.
	* @param record
	* @param noOverwrite - throw a ConstraintError in case of overwrite
	*/
	put(record, noOverwrite = false) {
		if (!this._root) {
			this._root = {
				record,
				left: void 0,
				right: void 0,
				parent: void 0,
				deleted: false,
				red: false
			};
			this._numNodes++;
			return;
		}
		return this._put(this._root, record, noOverwrite);
	}
	_put(node, record, noOverwrite) {
		const comparison = this._compare(record, node.record);
		if (comparison < 0) if (node.left) return this._put(node.left, record, noOverwrite);
		else {
			node.left = {
				record,
				left: void 0,
				right: void 0,
				parent: node,
				deleted: false,
				red: true
			};
			this._onNewNodeInserted(node.left);
		}
		else if (comparison > 0) if (node.right) return this._put(node.right, record, noOverwrite);
		else {
			node.right = {
				record,
				left: void 0,
				right: void 0,
				parent: node,
				deleted: false,
				red: true
			};
			this._onNewNodeInserted(node.right);
		}
		else if (node.deleted) {
			node.deleted = false;
			node.record = record;
			this._numTombstones--;
		} else if (noOverwrite) throw new ConstraintError();
		else {
			const overwrittenRecord = node.record;
			node.record = record;
			return overwrittenRecord;
		}
	}
	delete(record) {
		if (!this._root) return;
		this._delete(this._root, record);
		if (this._numTombstones > this._numNodes * MAX_TOMBSTONE_FACTOR) {
			const records = [...this.getAllRecords()];
			this._root = this._rebuild(records, void 0, false);
			this._numNodes = records.length;
			this._numTombstones = 0;
		}
	}
	_delete(node, record) {
		if (!node) return;
		const comparison = this._compare(record, node.record);
		if (comparison < 0) this._delete(node.left, record);
		else if (comparison > 0) this._delete(node.right, record);
		else if (!node.deleted) {
			this._numTombstones++;
			node.deleted = true;
		}
	}
	*getAllRecords(descending = false) {
		yield* this.getRecords(EVERYTHING_KEY_RANGE, descending);
	}
	*getRecords(keyRange, descending = false) {
		yield* this._getRecordsForNode(this._root, keyRange, descending);
	}
	*_getRecordsForNode(node, keyRange, descending = false) {
		if (!node) return;
		yield* this._findRecords(node, keyRange, descending);
	}
	*_findRecords(node, keyRange, descending = false) {
		const { lower, upper, lowerOpen, upperOpen } = keyRange;
		const { record: { key } } = node;
		const lowerComparison = lower === void 0 ? -1 : cmp(lower, key);
		const upperComparison = upper === void 0 ? 1 : cmp(upper, key);
		const moreLeft = this._keysAreUnique ? lowerComparison < 0 : lowerComparison <= 0;
		const moreRight = this._keysAreUnique ? upperComparison > 0 : upperComparison >= 0;
		const moreStart = descending ? moreRight : moreLeft;
		const moreEnd = descending ? moreLeft : moreRight;
		const start = descending ? "right" : "left";
		const end = descending ? "left" : "right";
		const lowerMatches = lowerOpen ? lowerComparison < 0 : lowerComparison <= 0;
		const upperMatches = upperOpen ? upperComparison > 0 : upperComparison >= 0;
		if (moreStart && node[start]) yield* this._findRecords(node[start], keyRange, descending);
		if (lowerMatches && upperMatches && !node.deleted) yield node.record;
		if (moreEnd && node[end]) yield* this._findRecords(node[end], keyRange, descending);
	}
	_onNewNodeInserted(newNode) {
		this._numNodes++;
		this._rebalanceTree(newNode);
	}
	_rebalanceTree(node) {
		let parent = node.parent;
		do {
			if (!parent.red) return;
			const grandparent = parent.parent;
			if (!grandparent) {
				parent.red = false;
				return;
			}
			const parentIsRightChild = parent === grandparent.right;
			const uncle = parentIsRightChild ? grandparent.left : grandparent.right;
			if (!uncle || !uncle.red) {
				if (node === (parentIsRightChild ? parent.left : parent.right)) {
					this._rotateSubtree(parent, parentIsRightChild);
					node = parent;
					parent = parentIsRightChild ? grandparent.right : grandparent.left;
				}
				this._rotateSubtree(grandparent, !parentIsRightChild);
				parent.red = false;
				grandparent.red = true;
				return;
			}
			parent.red = false;
			uncle.red = false;
			grandparent.red = true;
			node = grandparent;
		} while (node.parent ? parent = node.parent : false);
	}
	_rotateSubtree(node, right) {
		const parent = node.parent;
		const newRoot = right ? node.left : node.right;
		const newChild = right ? newRoot.right : newRoot.left;
		node[right ? "left" : "right"] = newChild;
		if (newChild) newChild.parent = node;
		newRoot[right ? "right" : "left"] = node;
		newRoot.parent = parent;
		node.parent = newRoot;
		if (parent) parent[node === parent.right ? "right" : "left"] = newRoot;
		else this._root = newRoot;
		return newRoot;
	}
	_rebuild(records, parent, red) {
		const { length } = records;
		if (!length) return;
		const mid = length >>> 1;
		const node = {
			record: records[mid],
			left: void 0,
			right: void 0,
			parent,
			deleted: false,
			red
		};
		const left = this._rebuild(records.slice(0, mid), node, !red);
		const right = this._rebuild(records.slice(mid + 1), node, !red);
		node.left = left;
		node.right = right;
		return node;
	}
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/RecordStore.js
var RecordStore = class {
	constructor(keysAreUnique) {
		this.keysAreUnique = keysAreUnique;
		this.records = new BinarySearchTree(this.keysAreUnique);
	}
	get(key) {
		const range = key instanceof FDBKeyRange ? key : FDBKeyRange.only(key);
		return this.records.getRecords(range).next().value;
	}
	/**
	* Put a new record, and return the overwritten record if an overwrite occurred.
	* @param newRecord
	* @param noOverwrite - throw a ConstraintError in case of overwrite
	*/
	put(newRecord, noOverwrite = false) {
		return this.records.put(newRecord, noOverwrite);
	}
	delete(key) {
		const range = key instanceof FDBKeyRange ? key : FDBKeyRange.only(key);
		const deletedRecords = [...this.records.getRecords(range)];
		for (const record of deletedRecords) this.records.delete(record);
		return deletedRecords;
	}
	deleteByValue(key) {
		const range = key instanceof FDBKeyRange ? key : FDBKeyRange.only(key);
		const deletedRecords = [];
		for (const record of this.records.getAllRecords()) if (range.includes(record.value)) {
			this.records.delete(record);
			deletedRecords.push(record);
		}
		return deletedRecords;
	}
	clear() {
		const deletedRecords = [...this.records.getAllRecords()];
		this.records = new BinarySearchTree(this.keysAreUnique);
		return deletedRecords;
	}
	values(range, direction = "next") {
		const descending = direction === "prev" || direction === "prevunique";
		const records = range ? this.records.getRecords(range, descending) : this.records.getAllRecords(descending);
		return { [Symbol.iterator]: () => {
			const next = () => {
				return records.next();
			};
			if (direction === "next" || direction === "prev") return { next };
			if (direction === "nextunique") {
				let previousValue = void 0;
				return { next: () => {
					let current = next();
					while (!current.done && previousValue !== void 0 && cmp(previousValue.key, current.value.key) === 0) current = next();
					previousValue = current.value;
					return current;
				} };
			}
			let current = next();
			let nextResult = next();
			return { next: () => {
				while (!nextResult.done && cmp(current.value.key, nextResult.value.key) === 0) {
					current = nextResult;
					nextResult = next();
				}
				const result = current;
				current = nextResult;
				nextResult = next();
				return result;
			} };
		} };
	}
	size() {
		return this.records.size();
	}
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/Index.js
var Index = class {
	deleted = false;
	initialized = false;
	constructor(rawObjectStore, name, keyPath, multiEntry, unique) {
		this.rawObjectStore = rawObjectStore;
		this.name = name;
		this.keyPath = keyPath;
		this.multiEntry = multiEntry;
		this.unique = unique;
		this.records = new RecordStore(unique);
	}
	getKey(key) {
		const record = this.records.get(key);
		return record !== void 0 ? record.value : void 0;
	}
	getAllKeys(range, count, direction) {
		if (count === void 0 || count === 0) count = Infinity;
		const records = [];
		for (const record of this.records.values(range, direction)) {
			records.push(structuredClone(record.value));
			if (records.length >= count) break;
		}
		return records;
	}
	getValue(key) {
		const record = this.records.get(key);
		return record !== void 0 ? this.rawObjectStore.getValue(record.value) : void 0;
	}
	getAllValues(range, count, direction) {
		if (count === void 0 || count === 0) count = Infinity;
		const records = [];
		for (const record of this.records.values(range, direction)) {
			records.push(this.rawObjectStore.getValue(record.value));
			if (records.length >= count) break;
		}
		return records;
	}
	getAllRecords(range, count, direction) {
		if (count === void 0 || count === 0) count = Infinity;
		const records = [];
		for (const record of this.records.values(range, direction)) {
			records.push(new FDBRecord(structuredClone(record.key), structuredClone(this.rawObjectStore.getKey(record.value)), this.rawObjectStore.getValue(record.value)));
			if (records.length >= count) break;
		}
		return records;
	}
	storeRecord(newRecord) {
		let indexKey;
		try {
			indexKey = extractKey(this.keyPath, newRecord.value).key;
		} catch (err) {
			if (err.name === "DataError") return;
			throw err;
		}
		if (!this.multiEntry || !Array.isArray(indexKey)) try {
			valueToKey(indexKey);
		} catch (e) {
			return;
		}
		else {
			const keep = [];
			for (const part of indexKey) if (keep.indexOf(part) < 0) try {
				keep.push(valueToKey(part));
			} catch (err) {}
			indexKey = keep;
		}
		if (!this.multiEntry || !Array.isArray(indexKey)) {
			if (this.unique) {
				if (this.records.get(indexKey)) throw new ConstraintError();
			}
		} else if (this.unique) {
			for (const individualIndexKey of indexKey) if (this.records.get(individualIndexKey)) throw new ConstraintError();
		}
		if (!this.multiEntry || !Array.isArray(indexKey)) this.records.put({
			key: indexKey,
			value: newRecord.key
		});
		else for (const individualIndexKey of indexKey) this.records.put({
			key: individualIndexKey,
			value: newRecord.key
		});
	}
	initialize(transaction) {
		if (this.initialized) throw new Error("Index already initialized");
		transaction._execRequestAsync({
			operation: () => {
				try {
					for (const record of this.rawObjectStore.records.values()) this.storeRecord(record);
					this.initialized = true;
				} catch (err) {
					transaction._abort(err.name);
				}
			},
			source: null
		});
	}
	count(range) {
		let count = 0;
		for (const record of this.records.values(range)) count += 1;
		return count;
	}
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/validateKeyPath.js
const validateKeyPath = (keyPath, parent) => {
	if (keyPath !== void 0 && keyPath !== null && typeof keyPath !== "string" && keyPath.toString && (parent === "array" || !Array.isArray(keyPath))) keyPath = keyPath.toString();
	if (typeof keyPath === "string") {
		if (keyPath === "" && parent !== "string") return;
		try {
			if (keyPath.length >= 1 && /^(?:[$A-Z_a-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B2\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC])(?:[$0-9A-Z_a-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B2\u08E4-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA69D\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2D\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC])*$/.test(keyPath)) return;
		} catch (err) {
			throw new SyntaxError(err.message);
		}
		if (keyPath.indexOf(" ") >= 0) throw new SyntaxError("The keypath argument contains an invalid key path (no spaces allowed).");
	}
	if (Array.isArray(keyPath) && keyPath.length > 0) {
		if (parent) throw new SyntaxError("The keypath argument contains an invalid key path (nested arrays).");
		for (const part of keyPath) validateKeyPath(part, "array");
		return;
	} else if (typeof keyPath === "string" && keyPath.indexOf(".") >= 0) {
		keyPath = keyPath.split(".");
		for (const part of keyPath) validateKeyPath(part, "string");
		return;
	}
	throw new SyntaxError();
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/FDBObjectStore.js
const confirmActiveTransaction = (objectStore) => {
	if (objectStore._rawObjectStore.deleted) throw new InvalidStateError();
	if (objectStore.transaction._state !== "active") throw new TransactionInactiveError();
};
const buildRecordAddPut = (objectStore, value, key) => {
	confirmActiveTransaction(objectStore);
	if (objectStore.transaction.mode === "readonly") throw new ReadOnlyError();
	if (objectStore.keyPath !== null) {
		if (key !== void 0) throw new DataError();
	}
	const clone = cloneValueForInsertion(value, objectStore.transaction);
	if (objectStore.keyPath !== null) {
		const tempKey = extractKey(objectStore.keyPath, clone);
		if (tempKey.type === "found") valueToKey(tempKey.key);
		else if (!objectStore._rawObjectStore.keyGenerator) throw new DataError();
		else if (!canInjectKey(objectStore.keyPath, clone)) throw new DataError();
	}
	if (objectStore.keyPath === null && objectStore._rawObjectStore.keyGenerator === null && key === void 0) throw new DataError();
	if (key !== void 0) key = valueToKey(key);
	return {
		key,
		value: clone
	};
};
var FDBObjectStore = class {
	_indexesCache = /* @__PURE__ */ new Map();
	constructor(transaction, rawObjectStore) {
		this._rawObjectStore = rawObjectStore;
		this._name = rawObjectStore.name;
		this.keyPath = getKeyPath(rawObjectStore.keyPath);
		this.autoIncrement = rawObjectStore.autoIncrement;
		this.transaction = transaction;
		this.indexNames = new FakeDOMStringList(...Array.from(rawObjectStore.rawIndexes.keys()).sort());
	}
	get name() {
		return this._name;
	}
	set name(name) {
		const transaction = this.transaction;
		if (!transaction.db._runningVersionchangeTransaction) throw transaction._state === "active" ? new InvalidStateError() : new TransactionInactiveError();
		confirmActiveTransaction(this);
		name = String(name);
		if (name === this._name) return;
		if (this._rawObjectStore.rawDatabase.rawObjectStores.has(name)) throw new ConstraintError();
		const oldName = this._name;
		const oldObjectStoreNames = [...transaction.db.objectStoreNames];
		this._name = name;
		this._rawObjectStore.name = name;
		this.transaction._objectStoresCache.delete(oldName);
		this.transaction._objectStoresCache.set(name, this);
		this._rawObjectStore.rawDatabase.rawObjectStores.delete(oldName);
		this._rawObjectStore.rawDatabase.rawObjectStores.set(name, this._rawObjectStore);
		transaction.db.objectStoreNames = new FakeDOMStringList(...Array.from(this._rawObjectStore.rawDatabase.rawObjectStores.keys()).filter((objectStoreName) => {
			const objectStore = this._rawObjectStore.rawDatabase.rawObjectStores.get(objectStoreName);
			return objectStore && !objectStore.deleted;
		}).sort());
		const oldScope = new Set(transaction._scope);
		const oldTransactionObjectStoreNames = [...transaction.objectStoreNames];
		this.transaction._scope.delete(oldName);
		transaction._scope.add(name);
		transaction.objectStoreNames = new FakeDOMStringList(...Array.from(transaction._scope).sort());
		if (!this.transaction._createdObjectStores.has(this._rawObjectStore)) transaction._rollbackLog.push(() => {
			this._name = oldName;
			this._rawObjectStore.name = oldName;
			this.transaction._objectStoresCache.delete(name);
			this.transaction._objectStoresCache.set(oldName, this);
			this._rawObjectStore.rawDatabase.rawObjectStores.delete(name);
			this._rawObjectStore.rawDatabase.rawObjectStores.set(oldName, this._rawObjectStore);
			transaction.db.objectStoreNames = new FakeDOMStringList(...oldObjectStoreNames);
			transaction._scope = oldScope;
			transaction.objectStoreNames = new FakeDOMStringList(...oldTransactionObjectStoreNames);
		});
	}
	put(value, key) {
		if (arguments.length === 0) throw new TypeError();
		const record = buildRecordAddPut(this, value, key);
		return this.transaction._execRequestAsync({
			operation: this._rawObjectStore.storeRecord.bind(this._rawObjectStore, record, false, this.transaction._rollbackLog),
			source: this
		});
	}
	add(value, key) {
		if (arguments.length === 0) throw new TypeError();
		const record = buildRecordAddPut(this, value, key);
		return this.transaction._execRequestAsync({
			operation: this._rawObjectStore.storeRecord.bind(this._rawObjectStore, record, true, this.transaction._rollbackLog),
			source: this
		});
	}
	delete(key) {
		if (arguments.length === 0) throw new TypeError();
		confirmActiveTransaction(this);
		if (this.transaction.mode === "readonly") throw new ReadOnlyError();
		if (!(key instanceof FDBKeyRange)) key = valueToKey(key);
		return this.transaction._execRequestAsync({
			operation: this._rawObjectStore.deleteRecord.bind(this._rawObjectStore, key, this.transaction._rollbackLog),
			source: this
		});
	}
	get(key) {
		if (arguments.length === 0) throw new TypeError();
		confirmActiveTransaction(this);
		if (!(key instanceof FDBKeyRange)) key = valueToKey(key);
		return this.transaction._execRequestAsync({
			operation: this._rawObjectStore.getValue.bind(this._rawObjectStore, key),
			source: this
		});
	}
	getAll(queryOrOptions, count) {
		const options = extractGetAllOptions(queryOrOptions, count, arguments.length);
		confirmActiveTransaction(this);
		const range = valueToKeyRange(options.query);
		return this.transaction._execRequestAsync({
			operation: this._rawObjectStore.getAllValues.bind(this._rawObjectStore, range, options.count, options.direction),
			source: this
		});
	}
	getKey(key) {
		if (arguments.length === 0) throw new TypeError();
		confirmActiveTransaction(this);
		if (!(key instanceof FDBKeyRange)) key = valueToKey(key);
		return this.transaction._execRequestAsync({
			operation: this._rawObjectStore.getKey.bind(this._rawObjectStore, key),
			source: this
		});
	}
	getAllKeys(queryOrOptions, count) {
		const options = extractGetAllOptions(queryOrOptions, count, arguments.length);
		confirmActiveTransaction(this);
		const range = valueToKeyRange(options.query);
		return this.transaction._execRequestAsync({
			operation: this._rawObjectStore.getAllKeys.bind(this._rawObjectStore, range, options.count, options.direction),
			source: this
		});
	}
	getAllRecords(options) {
		let query;
		let count;
		let direction;
		if (options !== void 0) {
			if (options.query !== void 0) query = options.query;
			if (options.count !== void 0) count = enforceRange(options.count, "unsigned long");
			if (options.direction !== void 0) direction = options.direction;
		}
		confirmActiveTransaction(this);
		const range = valueToKeyRange(query);
		return this.transaction._execRequestAsync({
			operation: this._rawObjectStore.getAllRecords.bind(this._rawObjectStore, range, count, direction),
			source: this
		});
	}
	clear() {
		confirmActiveTransaction(this);
		if (this.transaction.mode === "readonly") throw new ReadOnlyError();
		return this.transaction._execRequestAsync({
			operation: this._rawObjectStore.clear.bind(this._rawObjectStore, this.transaction._rollbackLog),
			source: this
		});
	}
	openCursor(range, direction) {
		confirmActiveTransaction(this);
		if (range === null) range = void 0;
		if (range !== void 0 && !(range instanceof FDBKeyRange)) range = FDBKeyRange.only(valueToKey(range));
		const request = new FDBRequest();
		request.source = this;
		request.transaction = this.transaction;
		const cursor = new FDBCursorWithValue(this, range, direction, request);
		return this.transaction._execRequestAsync({
			operation: cursor._iterate.bind(cursor),
			request,
			source: this
		});
	}
	openKeyCursor(range, direction) {
		confirmActiveTransaction(this);
		if (range === null) range = void 0;
		if (range !== void 0 && !(range instanceof FDBKeyRange)) range = FDBKeyRange.only(valueToKey(range));
		const request = new FDBRequest();
		request.source = this;
		request.transaction = this.transaction;
		const cursor = new FDBCursor(this, range, direction, request, true);
		return this.transaction._execRequestAsync({
			operation: cursor._iterate.bind(cursor),
			request,
			source: this
		});
	}
	createIndex(name, keyPath, optionalParameters = {}) {
		if (arguments.length < 2) throw new TypeError();
		const multiEntry = optionalParameters.multiEntry !== void 0 ? optionalParameters.multiEntry : false;
		const unique = optionalParameters.unique !== void 0 ? optionalParameters.unique : false;
		if (this.transaction.mode !== "versionchange") throw new InvalidStateError();
		confirmActiveTransaction(this);
		if (this.indexNames.contains(name)) throw new ConstraintError();
		validateKeyPath(keyPath);
		if (Array.isArray(keyPath) && multiEntry) throw new InvalidAccessError();
		const indexNames = [...this.indexNames];
		const index = new Index(this._rawObjectStore, name, keyPath, multiEntry, unique);
		this.indexNames._push(name);
		this.indexNames._sort();
		this.transaction._createdIndexes.add(index);
		this._rawObjectStore.rawIndexes.set(name, index);
		index.initialize(this.transaction);
		this.transaction._rollbackLog.push(() => {
			index.deleted = true;
			this.indexNames = new FakeDOMStringList(...indexNames);
			this._rawObjectStore.rawIndexes.delete(index.name);
		});
		return new FDBIndex(this, index);
	}
	index(name) {
		if (arguments.length === 0) throw new TypeError();
		if (this._rawObjectStore.deleted || this.transaction._state === "finished") throw new InvalidStateError();
		const index = this._indexesCache.get(name);
		if (index !== void 0) return index;
		const rawIndex = this._rawObjectStore.rawIndexes.get(name);
		if (!this.indexNames.contains(name) || rawIndex === void 0) throw new NotFoundError();
		const index2 = new FDBIndex(this, rawIndex);
		this._indexesCache.set(name, index2);
		return index2;
	}
	deleteIndex(name) {
		if (arguments.length === 0) throw new TypeError();
		if (this.transaction.mode !== "versionchange") throw new InvalidStateError();
		confirmActiveTransaction(this);
		const rawIndex = this._rawObjectStore.rawIndexes.get(name);
		if (rawIndex === void 0) throw new NotFoundError();
		this.transaction._rollbackLog.push(() => {
			rawIndex.deleted = false;
			this._rawObjectStore.rawIndexes.set(rawIndex.name, rawIndex);
			this.indexNames._push(rawIndex.name);
			this.indexNames._sort();
		});
		this.indexNames = new FakeDOMStringList(...Array.from(this.indexNames).filter((indexName) => {
			return indexName !== name;
		}));
		rawIndex.deleted = true;
		this.transaction._execRequestAsync({
			operation: () => {
				if (rawIndex === this._rawObjectStore.rawIndexes.get(name)) this._rawObjectStore.rawIndexes.delete(name);
			},
			source: this
		});
	}
	count(key) {
		confirmActiveTransaction(this);
		if (key === null) key = void 0;
		if (key !== void 0 && !(key instanceof FDBKeyRange)) key = FDBKeyRange.only(valueToKey(key));
		return this.transaction._execRequestAsync({
			operation: () => {
				return this._rawObjectStore.count(key);
			},
			source: this
		});
	}
	get [Symbol.toStringTag]() {
		return "IDBObjectStore";
	}
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/FakeEvent.js
var Event = class {
	eventPath = [];
	NONE = 0;
	CAPTURING_PHASE = 1;
	AT_TARGET = 2;
	BUBBLING_PHASE = 3;
	propagationStopped = false;
	immediatePropagationStopped = false;
	canceled = false;
	initialized = true;
	dispatched = false;
	target = null;
	currentTarget = null;
	eventPhase = 0;
	defaultPrevented = false;
	isTrusted = false;
	timeStamp = Date.now();
	constructor(type, eventInitDict = {}) {
		this.type = type;
		this.bubbles = eventInitDict.bubbles !== void 0 ? eventInitDict.bubbles : false;
		this.cancelable = eventInitDict.cancelable !== void 0 ? eventInitDict.cancelable : false;
	}
	preventDefault() {
		if (this.cancelable) this.canceled = true;
	}
	stopPropagation() {
		this.propagationStopped = true;
	}
	stopImmediatePropagation() {
		this.propagationStopped = true;
		this.immediatePropagationStopped = true;
	}
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/scheduling.js
function getSetImmediateFromJsdom() {
	if (typeof navigator !== "undefined" && /jsdom/.test(navigator.userAgent)) {
		const outerRealmFunctionConstructor = Node.constructor;
		return new outerRealmFunctionConstructor("return setImmediate")();
	} else return;
}
const schedulerPostTask = typeof scheduler !== "undefined" && ((fn) => scheduler.postTask(fn));
const doSetTimeout = (fn) => setTimeout(fn, 0);
const queueTask = (fn) => {
	(globalThis.setImmediate || getSetImmediateFromJsdom() || schedulerPostTask || doSetTimeout)(fn);
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/FDBTransaction.js
const prioritizedListenerTypes = [
	"error",
	"abort",
	"complete"
];
var FDBTransaction = class extends FakeEventTarget {
	_state = "active";
	_started = false;
	_rollbackLog = [];
	_objectStoresCache = /* @__PURE__ */ new Map();
	_openRequest = null;
	error = null;
	onabort = null;
	oncomplete = null;
	onerror = null;
	_prioritizedListeners = /* @__PURE__ */ new Map();
	_requests = [];
	_createdIndexes = /* @__PURE__ */ new Set();
	_createdObjectStores = /* @__PURE__ */ new Set();
	constructor(storeNames, mode, durability, db) {
		super();
		this._scope = new Set(storeNames);
		this.mode = mode;
		this.durability = durability;
		this.db = db;
		this.objectStoreNames = new FakeDOMStringList(...Array.from(this._scope).sort());
		for (const type of prioritizedListenerTypes) this.addEventListener(type, () => {
			this._prioritizedListeners.get(type)?.();
		});
	}
	_abort(errName) {
		for (const f of this._rollbackLog.reverse()) f();
		if (errName !== null) this.error = new DOMException(void 0, errName);
		for (const { request } of this._requests) if (request.readyState !== "done") {
			request.readyState = "done";
			if (request.source) queueTask(() => {
				request.result = void 0;
				request.error = new AbortError();
				const event = new Event("error", {
					bubbles: true,
					cancelable: true
				});
				event.eventPath = [this.db, this];
				try {
					request.dispatchEvent(event);
				} catch (_err) {
					if (this._state === "active") this._abort("AbortError");
				}
			});
		}
		queueTask(() => {
			const isUpgradeTransaction = this.mode === "versionchange";
			if (isUpgradeTransaction) this.db._rawDatabase.connections = this.db._rawDatabase.connections.filter((connection) => !connection._rawDatabase.transactions.includes(this));
			const event = new Event("abort", {
				bubbles: true,
				cancelable: false
			});
			event.eventPath = [this.db];
			this.dispatchEvent(event);
			if (isUpgradeTransaction) {
				const request = this._openRequest;
				request.transaction = null;
				request.result = void 0;
			}
		});
		this._state = "finished";
	}
	abort() {
		if (this._state === "committing" || this._state === "finished") throw new InvalidStateError();
		this._state = "active";
		this._abort(null);
	}
	objectStore(name) {
		if (this._state !== "active") throw new InvalidStateError();
		const objectStore = this._objectStoresCache.get(name);
		if (objectStore !== void 0) return objectStore;
		const rawObjectStore = this.db._rawDatabase.rawObjectStores.get(name);
		if (!this._scope.has(name) || rawObjectStore === void 0) throw new NotFoundError();
		const objectStore2 = new FDBObjectStore(this, rawObjectStore);
		this._objectStoresCache.set(name, objectStore2);
		return objectStore2;
	}
	_execRequestAsync(obj) {
		const source = obj.source;
		const operation = obj.operation;
		let request = Object.hasOwn(obj, "request") ? obj.request : null;
		if (this._state !== "active") throw new TransactionInactiveError();
		if (!request) if (!source) request = new FDBRequest();
		else {
			request = new FDBRequest();
			request.source = source;
			request.transaction = source.transaction;
		}
		this._requests.push({
			operation,
			request
		});
		return request;
	}
	_start() {
		this._started = true;
		let operation;
		let request;
		while (this._requests.length > 0) {
			const r = this._requests.shift();
			if (r && r.request.readyState !== "done") {
				request = r.request;
				operation = r.operation;
				break;
			}
		}
		if (request && operation) {
			if (!request.source) operation();
			else {
				let defaultAction;
				let event;
				try {
					const result = operation();
					request.readyState = "done";
					request.result = result;
					request.error = void 0;
					if (this._state === "inactive") this._state = "active";
					event = new Event("success", {
						bubbles: false,
						cancelable: false
					});
				} catch (err) {
					request.readyState = "done";
					request.result = void 0;
					request.error = err;
					if (this._state === "inactive") this._state = "active";
					event = new Event("error", {
						bubbles: true,
						cancelable: true
					});
					defaultAction = this._abort.bind(this, err.name);
				}
				try {
					event.eventPath = [this.db, this];
					request.dispatchEvent(event);
				} catch (_err) {
					if (this._state === "active") {
						this._abort("AbortError");
						defaultAction = void 0;
					}
				}
				if (!event.canceled) {
					if (defaultAction) defaultAction();
				}
			}
			queueTask(this._start.bind(this));
			return;
		}
		if (this._state !== "finished") {
			this._state = "finished";
			if (!this.error) {
				const event = new Event("complete");
				this.dispatchEvent(event);
			}
		}
	}
	commit() {
		if (this._state !== "active") throw new InvalidStateError();
		this._state = "committing";
	}
	get [Symbol.toStringTag]() {
		return "IDBTransaction";
	}
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/KeyGenerator.js
const MAX_KEY = 9007199254740992;
var KeyGenerator = class {
	num = 0;
	next() {
		if (this.num >= MAX_KEY) throw new ConstraintError();
		this.num += 1;
		return this.num;
	}
	setIfLarger(num) {
		const value = Math.floor(Math.min(num, MAX_KEY)) - 1;
		if (value >= this.num) this.num = value + 1;
	}
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/ObjectStore.js
var ObjectStore = class {
	deleted = false;
	records = new RecordStore(true);
	rawIndexes = /* @__PURE__ */ new Map();
	constructor(rawDatabase, name, keyPath, autoIncrement) {
		this.rawDatabase = rawDatabase;
		this.keyGenerator = autoIncrement === true ? new KeyGenerator() : null;
		this.deleted = false;
		this.name = name;
		this.keyPath = keyPath;
		this.autoIncrement = autoIncrement;
	}
	getKey(key) {
		const record = this.records.get(key);
		return record !== void 0 ? structuredClone(record.key) : void 0;
	}
	getAllKeys(range, count, direction) {
		if (count === void 0 || count === 0) count = Infinity;
		const records = [];
		for (const record of this.records.values(range, direction)) {
			records.push(structuredClone(record.key));
			if (records.length >= count) break;
		}
		return records;
	}
	getValue(key) {
		const record = this.records.get(key);
		return record !== void 0 ? structuredClone(record.value) : void 0;
	}
	getAllValues(range, count, direction) {
		if (count === void 0 || count === 0) count = Infinity;
		const records = [];
		for (const record of this.records.values(range, direction)) {
			records.push(structuredClone(record.value));
			if (records.length >= count) break;
		}
		return records;
	}
	getAllRecords(range, count, direction) {
		if (count === void 0 || count === 0) count = Infinity;
		const records = [];
		for (const record of this.records.values(range, direction)) {
			records.push(new FDBRecord(structuredClone(record.key), structuredClone(record.key), structuredClone(record.value)));
			if (records.length >= count) break;
		}
		return records;
	}
	storeRecord(newRecord, noOverwrite, rollbackLog) {
		if (this.keyPath !== null) {
			const key = extractKey(this.keyPath, newRecord.value).key;
			if (key !== void 0) newRecord.key = key;
		}
		const rollbackLogForThisOperation = [];
		if (this.keyGenerator !== null && newRecord.key === void 0) {
			let rolledBack = false;
			const keyGeneratorBefore = this.keyGenerator.num;
			const rollbackKeyGenerator = () => {
				if (rolledBack) return;
				rolledBack = true;
				if (this.keyGenerator) this.keyGenerator.num = keyGeneratorBefore;
			};
			rollbackLogForThisOperation.push(rollbackKeyGenerator);
			if (rollbackLog) rollbackLog.push(rollbackKeyGenerator);
			newRecord.key = this.keyGenerator.next();
			if (this.keyPath !== null) {
				if (Array.isArray(this.keyPath)) throw new Error("Cannot have an array key path in an object store with a key generator");
				let remainingKeyPath = this.keyPath;
				let object = newRecord.value;
				let identifier;
				let i = 0;
				while (i >= 0) {
					if (typeof object !== "object") throw new DataError();
					i = remainingKeyPath.indexOf(".");
					if (i >= 0) {
						identifier = remainingKeyPath.slice(0, i);
						remainingKeyPath = remainingKeyPath.slice(i + 1);
						if (!Object.hasOwn(object, identifier)) Object.defineProperty(object, identifier, {
							configurable: true,
							enumerable: true,
							writable: true,
							value: {}
						});
						object = object[identifier];
					}
				}
				identifier = remainingKeyPath;
				Object.defineProperty(object, identifier, {
					configurable: true,
					enumerable: true,
					writable: true,
					value: newRecord.key
				});
			}
		} else if (this.keyGenerator !== null && typeof newRecord.key === "number") this.keyGenerator.setIfLarger(newRecord.key);
		const existingRecord = this.records.put(newRecord, noOverwrite);
		let rolledBack = false;
		const rollbackStoreRecord = () => {
			if (rolledBack) return;
			rolledBack = true;
			if (existingRecord) this.storeRecord(existingRecord, false);
			else this.deleteRecord(newRecord.key);
		};
		rollbackLogForThisOperation.push(rollbackStoreRecord);
		if (rollbackLog) rollbackLog.push(rollbackStoreRecord);
		if (existingRecord) for (const rawIndex of this.rawIndexes.values()) rawIndex.records.deleteByValue(newRecord.key);
		try {
			for (const rawIndex of this.rawIndexes.values()) if (rawIndex.initialized) rawIndex.storeRecord(newRecord);
		} catch (err) {
			if (err.name === "ConstraintError") for (const rollback of rollbackLogForThisOperation) rollback();
			throw err;
		}
		return newRecord.key;
	}
	deleteRecord(key, rollbackLog) {
		const deletedRecords = this.records.delete(key);
		if (rollbackLog) for (const record of deletedRecords) rollbackLog.push(() => {
			this.storeRecord(record, true);
		});
		for (const rawIndex of this.rawIndexes.values()) rawIndex.records.deleteByValue(key);
	}
	clear(rollbackLog) {
		const deletedRecords = this.records.clear();
		if (rollbackLog) for (const record of deletedRecords) rollbackLog.push(() => {
			this.storeRecord(record, true);
		});
		for (const rawIndex of this.rawIndexes.values()) rawIndex.records.clear();
	}
	count(range) {
		if (range === void 0 || range.lower === void 0 && range.upper === void 0) return this.records.size();
		let count = 0;
		for (const record of this.records.values(range)) count += 1;
		return count;
	}
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/closeConnection.js
const closeConnection = (connection, forced = false) => {
	connection._closePending = true;
	if (connection._rawDatabase.transactions.every((transaction) => {
		return transaction._state === "finished";
	})) {
		connection._closed = true;
		connection._rawDatabase.connections = connection._rawDatabase.connections.filter((otherConnection) => {
			return connection !== otherConnection;
		});
		if (forced) {
			const event = new Event("close", {
				bubbles: false,
				cancelable: false
			});
			event.eventPath = [];
			connection.dispatchEvent(event);
		}
	} else queueTask(() => {
		closeConnection(connection, forced);
	});
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/FDBDatabase.js
const confirmActiveVersionchangeTransaction = (database) => {
	let transaction;
	if (database._runningVersionchangeTransaction) transaction = database._rawDatabase.transactions.findLast((tx) => {
		return tx.mode === "versionchange";
	});
	if (!transaction) throw new InvalidStateError();
	if (transaction._state !== "active") throw new TransactionInactiveError();
	return transaction;
};
var FDBDatabase = class extends FakeEventTarget {
	_closePending = false;
	_closed = false;
	_runningVersionchangeTransaction = false;
	constructor(rawDatabase) {
		super();
		this._rawDatabase = rawDatabase;
		this._rawDatabase.connections.push(this);
		this.name = rawDatabase.name;
		this.version = rawDatabase.version;
		this.objectStoreNames = new FakeDOMStringList(...Array.from(rawDatabase.rawObjectStores.keys()).sort());
	}
	createObjectStore(name, options = {}) {
		if (name === void 0) throw new TypeError();
		const transaction = confirmActiveVersionchangeTransaction(this);
		const keyPath = options !== null && options.keyPath !== void 0 ? options.keyPath : null;
		const autoIncrement = options !== null && options.autoIncrement !== void 0 ? options.autoIncrement : false;
		if (keyPath !== null) validateKeyPath(keyPath);
		if (this._rawDatabase.rawObjectStores.has(name)) throw new ConstraintError();
		if (autoIncrement && (keyPath === "" || Array.isArray(keyPath))) throw new InvalidAccessError();
		const objectStoreNames = [...this.objectStoreNames];
		const transactionObjectStoreNames = [...transaction.objectStoreNames];
		const rawObjectStore = new ObjectStore(this._rawDatabase, name, keyPath, autoIncrement);
		this.objectStoreNames._push(name);
		this.objectStoreNames._sort();
		transaction._scope.add(name);
		transaction._createdObjectStores.add(rawObjectStore);
		this._rawDatabase.rawObjectStores.set(name, rawObjectStore);
		transaction.objectStoreNames = new FakeDOMStringList(...this.objectStoreNames);
		transaction._rollbackLog.push(() => {
			rawObjectStore.deleted = true;
			this.objectStoreNames = new FakeDOMStringList(...objectStoreNames);
			transaction.objectStoreNames = new FakeDOMStringList(...transactionObjectStoreNames);
			transaction._scope.delete(rawObjectStore.name);
			this._rawDatabase.rawObjectStores.delete(rawObjectStore.name);
		});
		return transaction.objectStore(name);
	}
	deleteObjectStore(name) {
		if (name === void 0) throw new TypeError();
		const transaction = confirmActiveVersionchangeTransaction(this);
		const store = this._rawDatabase.rawObjectStores.get(name);
		if (store === void 0) throw new NotFoundError();
		this.objectStoreNames = new FakeDOMStringList(...Array.from(this.objectStoreNames).filter((objectStoreName) => {
			return objectStoreName !== name;
		}));
		transaction.objectStoreNames = new FakeDOMStringList(...this.objectStoreNames);
		const objectStore = transaction._objectStoresCache.get(name);
		let prevIndexNames;
		if (objectStore) {
			prevIndexNames = [...objectStore.indexNames];
			objectStore.indexNames = new FakeDOMStringList();
		}
		transaction._rollbackLog.push(() => {
			store.deleted = false;
			this._rawDatabase.rawObjectStores.set(store.name, store);
			this.objectStoreNames._push(store.name);
			transaction.objectStoreNames._push(store.name);
			this.objectStoreNames._sort();
			if (objectStore && prevIndexNames) objectStore.indexNames = new FakeDOMStringList(...prevIndexNames);
		});
		store.deleted = true;
		this._rawDatabase.rawObjectStores.delete(name);
		transaction._objectStoresCache.delete(name);
	}
	transaction(storeNames, mode, options) {
		mode = mode !== void 0 ? mode : "readonly";
		if (mode !== "readonly" && mode !== "readwrite" && mode !== "versionchange") throw new TypeError("Invalid mode: " + mode);
		if (this._rawDatabase.transactions.some((transaction) => {
			return transaction._state === "active" && transaction.mode === "versionchange" && transaction.db === this;
		})) throw new InvalidStateError();
		if (this._closePending) throw new InvalidStateError();
		if (!Array.isArray(storeNames)) storeNames = [storeNames];
		if (storeNames.length === 0 && mode !== "versionchange") throw new InvalidAccessError();
		for (const storeName of storeNames) if (!this.objectStoreNames.contains(storeName)) throw new NotFoundError("No objectStore named " + storeName + " in this database");
		const durability = options?.durability ?? "default";
		if (durability !== "default" && durability !== "strict" && durability !== "relaxed") throw new TypeError(`'${durability}' (value of 'durability' member of IDBTransactionOptions) is not a valid value for enumeration IDBTransactionDurability`);
		const tx = new FDBTransaction(storeNames, mode, durability, this);
		this._rawDatabase.transactions.push(tx);
		this._rawDatabase.processTransactions();
		return tx;
	}
	close() {
		closeConnection(this);
	}
	get [Symbol.toStringTag]() {
		return "IDBDatabase";
	}
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/FDBOpenDBRequest.js
var FDBOpenDBRequest = class extends FDBRequest {
	onupgradeneeded = null;
	onblocked = null;
	get [Symbol.toStringTag]() {
		return "IDBOpenDBRequest";
	}
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/FDBVersionChangeEvent.js
var FDBVersionChangeEvent = class extends Event {
	constructor(type, parameters = {}) {
		super(type);
		this.newVersion = parameters.newVersion !== void 0 ? parameters.newVersion : null;
		this.oldVersion = parameters.oldVersion !== void 0 ? parameters.oldVersion : 0;
	}
	get [Symbol.toStringTag]() {
		return "IDBVersionChangeEvent";
	}
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/intersection.js
/**
* Minimal polyfill of `Set.prototype.intersection`, available in Node 22+.
* @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/intersection
* @param set1
* @param set2
*/
function intersection(set1, set2) {
	if ("intersection" in set1) return set1.intersection(set2);
	return new Set([...set1].filter((item) => set2.has(item)));
}
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/Database.js
var Database = class {
	transactions = [];
	rawObjectStores = /* @__PURE__ */ new Map();
	connections = [];
	constructor(name, version) {
		this.name = name;
		this.version = version;
		this.processTransactions = this.processTransactions.bind(this);
	}
	processTransactions() {
		queueTask(() => {
			const running = this.transactions.filter((transaction) => transaction._started && transaction._state !== "finished");
			const waiting = this.transactions.filter((transaction) => !transaction._started && transaction._state !== "finished");
			const next = waiting.find((transaction, i) => {
				if (running.some((other) => !(transaction.mode === "readonly" && other.mode === "readonly") && intersection(other._scope, transaction._scope).size > 0)) return false;
				return !waiting.slice(0, i).some((other) => intersection(other._scope, transaction._scope).size > 0);
			});
			if (next) {
				next.addEventListener("complete", this.processTransactions);
				next.addEventListener("abort", this.processTransactions);
				next._start();
			}
		});
	}
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/lib/validateRequiredArguments.js
function validateRequiredArguments(numArguments, expectedNumArguments, methodName) {
	if (numArguments < expectedNumArguments) throw new TypeError(`${methodName}: At least ${expectedNumArguments} ${expectedNumArguments === 1 ? "argument" : "arguments"} required, but only ${arguments.length} passed`);
}
//#endregion
//#region node_modules/fake-indexeddb/build/esm/FDBFactory.js
const runTaskInConnectionQueue = (connectionQueues, name, task) => {
	const queue = connectionQueues.get(name) ?? Promise.resolve();
	connectionQueues.set(name, queue.then(task));
};
const waitForOthersClosedDelete = (databases, name, openDatabases, cb) => {
	if (openDatabases.some((openDatabase2) => {
		return !openDatabase2._closed && !openDatabase2._closePending;
	})) {
		queueTask(() => waitForOthersClosedDelete(databases, name, openDatabases, cb));
		return;
	}
	databases.delete(name);
	cb(null);
};
const deleteDatabase = (databases, connectionQueues, name, request, cb) => {
	const deleteDBTask = () => {
		return new Promise((resolve) => {
			const db = databases.get(name);
			const oldVersion = db !== void 0 ? db.version : 0;
			const onComplete = (err) => {
				try {
					if (err) cb(err);
					else cb(null, oldVersion);
				} finally {
					resolve();
				}
			};
			try {
				const db = databases.get(name);
				if (db === void 0) {
					onComplete(null);
					return;
				}
				const openConnections = db.connections.filter((connection) => {
					return !connection._closed;
				});
				for (const openDatabase2 of openConnections) if (!openDatabase2._closePending) queueTask(() => {
					const event = new FDBVersionChangeEvent("versionchange", {
						newVersion: null,
						oldVersion: db.version
					});
					openDatabase2.dispatchEvent(event);
				});
				queueTask(() => {
					if (openConnections.some((openDatabase3) => {
						return !openDatabase3._closed && !openDatabase3._closePending;
					})) queueTask(() => {
						const event = new FDBVersionChangeEvent("blocked", {
							newVersion: null,
							oldVersion: db.version
						});
						request.dispatchEvent(event);
					});
					waitForOthersClosedDelete(databases, name, openConnections, onComplete);
				});
			} catch (err) {
				onComplete(err);
			}
		});
	};
	runTaskInConnectionQueue(connectionQueues, name, deleteDBTask);
};
const runVersionchangeTransaction = (connection, version, request, cb) => {
	connection._runningVersionchangeTransaction = true;
	const oldVersion = connection._oldVersion = connection.version;
	const openConnections = connection._rawDatabase.connections.filter((otherDatabase) => {
		return connection !== otherDatabase;
	});
	for (const openDatabase2 of openConnections) if (!openDatabase2._closed && !openDatabase2._closePending) queueTask(() => {
		const event = new FDBVersionChangeEvent("versionchange", {
			newVersion: version,
			oldVersion
		});
		openDatabase2.dispatchEvent(event);
	});
	queueTask(() => {
		if (openConnections.some((openDatabase3) => {
			return !openDatabase3._closed && !openDatabase3._closePending;
		})) queueTask(() => {
			const event = new FDBVersionChangeEvent("blocked", {
				newVersion: version,
				oldVersion
			});
			request.dispatchEvent(event);
		});
		const waitForOthersClosed = () => {
			if (openConnections.some((openDatabase2) => {
				return !openDatabase2._closed && !openDatabase2._closePending;
			})) {
				queueTask(waitForOthersClosed);
				return;
			}
			connection._rawDatabase.version = version;
			connection.version = version;
			const transaction = connection.transaction(Array.from(connection.objectStoreNames), "versionchange");
			transaction._openRequest = request;
			request.result = connection;
			request.readyState = "done";
			request.transaction = transaction;
			transaction._rollbackLog.push(() => {
				connection._rawDatabase.version = oldVersion;
				connection.version = oldVersion;
			});
			transaction._state = "active";
			const event = new FDBVersionChangeEvent("upgradeneeded", {
				newVersion: version,
				oldVersion
			});
			let didThrow = false;
			try {
				request.dispatchEvent(event);
			} catch (_err) {
				didThrow = true;
			}
			const concludeUpgrade = () => {
				if (transaction._state === "active") {
					transaction._state = "inactive";
					if (didThrow) transaction._abort("AbortError");
				}
			};
			if (didThrow) concludeUpgrade();
			else queueTask(concludeUpgrade);
			transaction._prioritizedListeners.set("error", () => {
				connection._runningVersionchangeTransaction = false;
				connection._oldVersion = void 0;
			});
			transaction._prioritizedListeners.set("abort", () => {
				connection._runningVersionchangeTransaction = false;
				connection._oldVersion = void 0;
				queueTask(() => {
					request.transaction = null;
					cb(new AbortError());
				});
			});
			transaction._prioritizedListeners.set("complete", () => {
				connection._runningVersionchangeTransaction = false;
				connection._oldVersion = void 0;
				queueTask(() => {
					request.transaction = null;
					if (connection._closePending) cb(new AbortError());
					else cb(null);
				});
			});
		};
		waitForOthersClosed();
	});
};
const openDatabase = (databases, connectionQueues, name, version, request, cb) => {
	const openDBTask = () => {
		return new Promise((resolve) => {
			const onComplete = (err) => {
				try {
					if (err) cb(err);
					else cb(null, connection);
				} finally {
					resolve();
				}
			};
			let db = databases.get(name);
			if (db === void 0) {
				db = new Database(name, 0);
				databases.set(name, db);
			}
			if (version === void 0) version = db.version !== 0 ? db.version : 1;
			if (db.version > version) return onComplete(new VersionError());
			const connection = new FDBDatabase(db);
			if (db.version < version) runVersionchangeTransaction(connection, version, request, (err) => {
				onComplete(err);
			});
			else onComplete(null);
		});
	};
	runTaskInConnectionQueue(connectionQueues, name, openDBTask);
};
var FDBFactory = class {
	_databases = /* @__PURE__ */ new Map();
	_connectionQueues = /* @__PURE__ */ new Map();
	cmp(first, second) {
		validateRequiredArguments(arguments.length, 2, "IDBFactory.cmp");
		return cmp(first, second);
	}
	deleteDatabase(name) {
		validateRequiredArguments(arguments.length, 1, "IDBFactory.deleteDatabase");
		const request = new FDBOpenDBRequest();
		request.source = null;
		queueTask(() => {
			deleteDatabase(this._databases, this._connectionQueues, name, request, (err, oldVersion) => {
				if (err) {
					request.error = new DOMException(err.message, err.name);
					request.readyState = "done";
					const event = new Event("error", {
						bubbles: true,
						cancelable: true
					});
					event.eventPath = [];
					request.dispatchEvent(event);
					return;
				}
				request.result = void 0;
				request.readyState = "done";
				const event2 = new FDBVersionChangeEvent("success", {
					newVersion: null,
					oldVersion
				});
				request.dispatchEvent(event2);
			});
		});
		return request;
	}
	open(name, version) {
		validateRequiredArguments(arguments.length, 1, "IDBFactory.open");
		if (arguments.length > 1 && version !== void 0) version = enforceRange(version, "MAX_SAFE_INTEGER");
		if (version === 0) throw new TypeError("Database version cannot be 0");
		const request = new FDBOpenDBRequest();
		request.source = null;
		queueTask(() => {
			openDatabase(this._databases, this._connectionQueues, name, version, request, (err, connection) => {
				if (err) {
					request.result = void 0;
					request.readyState = "done";
					request.error = new DOMException(err.message, err.name);
					const event = new Event("error", {
						bubbles: true,
						cancelable: true
					});
					event.eventPath = [];
					request.dispatchEvent(event);
					return;
				}
				request.result = connection;
				request.readyState = "done";
				const event2 = new Event("success");
				event2.eventPath = [];
				request.dispatchEvent(event2);
			});
		});
		return request;
	}
	databases() {
		return Promise.resolve(Array.from(this._databases.entries(), ([name, database]) => {
			const activeVersionChangeConnection = database.connections.find((connection) => connection._runningVersionchangeTransaction);
			return {
				name,
				version: activeVersionChangeConnection ? activeVersionChangeConnection._oldVersion : database.version
			};
		}).filter(({ version }) => {
			return version > 0;
		}));
	}
	get [Symbol.toStringTag]() {
		return "IDBFactory";
	}
};
//#endregion
//#region node_modules/fake-indexeddb/build/esm/fakeIndexedDB.js
const fakeIndexedDB = new FDBFactory();
//#endregion
//#region node_modules/fake-indexeddb/auto/index.mjs
var globalVar = typeof window !== "undefined" ? window : typeof WorkerGlobalScope !== "undefined" ? self : typeof global !== "undefined" ? global : Function("return this;")();
const createPropertyDescriptor = (value) => {
	return {
		value,
		enumerable: false,
		configurable: true,
		writable: true
	};
};
Object.defineProperties(globalVar, {
	indexedDB: createPropertyDescriptor(fakeIndexedDB),
	IDBCursor: createPropertyDescriptor(FDBCursor),
	IDBCursorWithValue: createPropertyDescriptor(FDBCursorWithValue),
	IDBDatabase: createPropertyDescriptor(FDBDatabase),
	IDBFactory: createPropertyDescriptor(FDBFactory),
	IDBIndex: createPropertyDescriptor(FDBIndex),
	IDBKeyRange: createPropertyDescriptor(FDBKeyRange),
	IDBObjectStore: createPropertyDescriptor(FDBObjectStore),
	IDBOpenDBRequest: createPropertyDescriptor(FDBOpenDBRequest),
	IDBRecord: createPropertyDescriptor(FDBRecord),
	IDBRequest: createPropertyDescriptor(FDBRequest),
	IDBTransaction: createPropertyDescriptor(FDBTransaction),
	IDBVersionChangeEvent: createPropertyDescriptor(FDBVersionChangeEvent)
});
//#endregion
//#region node_modules/matrix-js-sdk/lib/store/memory.js
/**
* This is an internal module. See {@link MemoryStore} for the public class.
*/
var import_asyncToGenerator = /* @__PURE__ */ __toESM(require_asyncToGenerator(), 1);
var import_defineProperty = /* @__PURE__ */ __toESM(require_defineProperty(), 1);
function isValidFilterId(filterId) {
	return typeof filterId === "string" && !!filterId && filterId !== "undefined" && filterId !== "null" || typeof filterId === "number";
}
var MemoryStore = class {
	/**
	* Construct a new in-memory data store for the Matrix Client.
	* @param opts - Config options
	*/
	constructor() {
		var opts = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
		(0, import_defineProperty.default)(this, "rooms", {});
		(0, import_defineProperty.default)(this, "users", {});
		(0, import_defineProperty.default)(this, "syncToken", null);
		(0, import_defineProperty.default)(this, "filters", new MapWithDefault(() => /* @__PURE__ */ new Map()));
		(0, import_defineProperty.default)(this, "accountData", /* @__PURE__ */ new Map());
		(0, import_defineProperty.default)(this, "localStorage", void 0);
		(0, import_defineProperty.default)(this, "oobMembers", /* @__PURE__ */ new Map());
		(0, import_defineProperty.default)(this, "pendingEvents", {});
		(0, import_defineProperty.default)(this, "clientOptions", void 0);
		(0, import_defineProperty.default)(this, "pendingToDeviceBatches", []);
		(0, import_defineProperty.default)(this, "nextToDeviceBatchId", 0);
		(0, import_defineProperty.default)(this, "createUser", void 0);
		/**
		* Called when a room member in a room being tracked by this store has been
		* updated.
		*/
		(0, import_defineProperty.default)(this, "onRoomMember", (event, state, member) => {
			var _this$createUser;
			if (member.membership === KnownMembership.Invite) return;
			var user = this.users[member.userId] || ((_this$createUser = this.createUser) === null || _this$createUser === void 0 ? void 0 : _this$createUser.call(this, member.userId));
			if (member.name) {
				user.setDisplayName(member.name);
				if (member.events.member) user.setRawDisplayName(member.events.member.getDirectionalContent().displayname);
			}
			if (member.events.member && member.events.member.getContent().avatar_url) user.setAvatarUrl(member.events.member.getContent().avatar_url);
			this.users[user.userId] = user;
		});
		this.localStorage = opts.localStorage;
	}
	/**
	* Retrieve the token to stream from.
	* @returns The token or null.
	*/
	getSyncToken() {
		return this.syncToken;
	}
	/** @returns whether or not the database was newly created in this session. */
	isNewlyCreated() {
		return Promise.resolve(true);
	}
	/**
	* Set the token to stream from.
	* @param token - The token to stream from.
	*/
	setSyncToken(token) {
		this.syncToken = token;
	}
	/**
	* Store the given room.
	* @param room - The room to be stored. All properties must be stored.
	*/
	storeRoom(room) {
		this.rooms[room.roomId] = room;
		room.currentState.on(RoomStateEvent.Members, this.onRoomMember);
		room.currentState.getMembers().forEach((m) => {
			this.onRoomMember(null, room.currentState, m);
		});
	}
	setUserCreator(creator) {
		this.createUser = creator;
	}
	/**
	* Retrieve a room by its' room ID.
	* @param roomId - The room ID.
	* @returns The room or null.
	*/
	getRoom(roomId) {
		return this.rooms[roomId] || null;
	}
	/**
	* Retrieve all known rooms.
	* @returns A list of rooms, which may be empty.
	*/
	getRooms() {
		return Object.values(this.rooms);
	}
	/**
	* Permanently delete a room.
	*/
	removeRoom(roomId) {
		if (this.rooms[roomId]) this.rooms[roomId].currentState.removeListener(RoomStateEvent.Members, this.onRoomMember);
		delete this.rooms[roomId];
	}
	/**
	* Retrieve a summary of all the rooms.
	* @returns A summary of each room.
	*/
	getRoomSummaries() {
		return Object.values(this.rooms).map(function(room) {
			return room.summary;
		});
	}
	/**
	* Store a User.
	* @param user - The user to store.
	*/
	storeUser(user) {
		this.users[user.userId] = user;
	}
	/**
	* Retrieve a User by its' user ID.
	* @param userId - The user ID.
	* @returns The user or null.
	*/
	getUser(userId) {
		return this.users[userId] || null;
	}
	/**
	* Retrieve all known users.
	* @returns A list of users, which may be empty.
	*/
	getUsers() {
		return Object.values(this.users);
	}
	/**
	* Retrieve scrollback for this room.
	* @param room - The matrix room
	* @param limit - The max number of old events to retrieve.
	* @returns An array of objects which will be at most 'limit'
	* length and at least 0. The objects are the raw event JSON.
	*/
	scrollback(room, limit) {
		return [];
	}
	/**
	* Store events for a room. The events have already been added to the timeline
	* @param room - The room to store events for.
	* @param events - The events to store.
	* @param token - The token associated with these events.
	* @param toStart - True if these are paginated results.
	*/
	storeEvents(room, events, token, toStart) {}
	/**
	* Store a filter.
	*/
	storeFilter(filter) {
		if (!(filter !== null && filter !== void 0 && filter.userId) || !(filter !== null && filter !== void 0 && filter.filterId)) return;
		this.filters.getOrCreate(filter.userId).set(filter.filterId, filter);
	}
	/**
	* Retrieve a filter.
	* @returns A filter or null.
	*/
	getFilter(userId, filterId) {
		var _this$filters$get;
		return ((_this$filters$get = this.filters.get(userId)) === null || _this$filters$get === void 0 ? void 0 : _this$filters$get.get(filterId)) || null;
	}
	/**
	* Retrieve a filter ID with the given name.
	* @param filterName - The filter name.
	* @returns The filter ID or null.
	*/
	getFilterIdByName(filterName) {
		if (!this.localStorage) return null;
		var key = "mxjssdk_memory_filter_" + filterName;
		try {
			var value = this.localStorage.getItem(key);
			if (isValidFilterId(value)) return value;
		} catch (_unused) {}
		return null;
	}
	/**
	* Set a filter name to ID mapping.
	*/
	setFilterIdByName(filterName, filterId) {
		if (!this.localStorage) return;
		var key = "mxjssdk_memory_filter_" + filterName;
		try {
			if (isValidFilterId(filterId)) this.localStorage.setItem(key, filterId);
			else this.localStorage.removeItem(key);
		} catch (_unused2) {}
	}
	/**
	* Store user-scoped account data events.
	* N.B. that account data only allows a single event per type, so multiple
	* events with the same type will replace each other.
	* @param events - The events to store.
	*/
	storeAccountDataEvents(events) {
		events.forEach((event) => {
			if (!Object.keys(event.getContent()).length) this.accountData.delete(event.getType());
			else this.accountData.set(event.getType(), event);
		});
	}
	/**
	* Get account data event by event type
	* @param eventType - The event type being queried
	* @returns the user account_data event of given type, if any
	*/
	getAccountData(eventType) {
		return this.accountData.get(eventType);
	}
	/**
	* setSyncData does nothing as there is no backing data store.
	*
	* @param syncData - The sync data
	* @returns An immediately resolved promise.
	*/
	setSyncData(syncData) {
		return Promise.resolve();
	}
	/**
	* We never want to save becase we have nothing to save to.
	*
	* @returns If the store wants to save
	*/
	wantsSave() {
		return false;
	}
	/**
	* Save does nothing as there is no backing data store.
	* @param force - True to force a save (but the memory
	*     store still can't save anything)
	*/
	save(force) {
		return Promise.resolve();
	}
	/**
	* Startup does nothing as this store doesn't require starting up.
	* @returns An immediately resolved promise.
	*/
	startup() {
		return Promise.resolve();
	}
	/**
	* @returns Promise which resolves with a sync response to restore the
	* client state to where it was at the last save, or null if there
	* is no saved sync data.
	*/
	getSavedSync() {
		return Promise.resolve(null);
	}
	/**
	* @returns If there is a saved sync, the nextBatch token
	* for this sync, otherwise null.
	*/
	getSavedSyncToken() {
		return Promise.resolve(null);
	}
	/**
	* Delete all data from this store.
	* @returns An immediately resolved promise.
	*/
	deleteAllData() {
		this.rooms = {};
		this.users = {};
		this.syncToken = null;
		this.filters = new MapWithDefault(() => /* @__PURE__ */ new Map());
		this.accountData = /* @__PURE__ */ new Map();
		return Promise.resolve();
	}
	/**
	* Returns the out-of-band membership events for this room that
	* were previously loaded.
	* @returns the events, potentially an empty array if OOB loading didn't yield any new members
	* @returns in case the members for this room haven't been stored yet
	*/
	getOutOfBandMembers(roomId) {
		return Promise.resolve(this.oobMembers.get(roomId) || null);
	}
	/**
	* Stores the out-of-band membership events for this room. Note that
	* it still makes sense to store an empty array as the OOB status for the room is
	* marked as fetched, and getOutOfBandMembers will return an empty array instead of null
	* @param membershipEvents - the membership events to store
	* @returns when all members have been stored
	*/
	setOutOfBandMembers(roomId, membershipEvents) {
		this.oobMembers.set(roomId, membershipEvents);
		return Promise.resolve();
	}
	clearOutOfBandMembers(roomId) {
		this.oobMembers.delete(roomId);
		return Promise.resolve();
	}
	getClientOptions() {
		return Promise.resolve(this.clientOptions);
	}
	storeClientOptions(options) {
		this.clientOptions = Object.assign({}, options);
		return Promise.resolve();
	}
	getPendingEvents(roomId) {
		var _this = this;
		return (0, import_asyncToGenerator.default)(function* () {
			var _this$pendingEvents$r;
			return (_this$pendingEvents$r = _this.pendingEvents[roomId]) !== null && _this$pendingEvents$r !== void 0 ? _this$pendingEvents$r : [];
		})();
	}
	setPendingEvents(roomId, events) {
		var _this2 = this;
		return (0, import_asyncToGenerator.default)(function* () {
			_this2.pendingEvents[roomId] = events;
		})();
	}
	saveToDeviceBatches(batches) {
		for (var batch of batches) this.pendingToDeviceBatches.push({
			id: this.nextToDeviceBatchId++,
			eventType: batch.eventType,
			txnId: batch.txnId,
			batch: batch.batch
		});
		return Promise.resolve();
	}
	getOldestToDeviceBatch() {
		var _this3 = this;
		return (0, import_asyncToGenerator.default)(function* () {
			if (_this3.pendingToDeviceBatches.length === 0) return null;
			return _this3.pendingToDeviceBatches[0];
		})();
	}
	removeToDeviceBatch(id) {
		this.pendingToDeviceBatches = this.pendingToDeviceBatches.filter((batch) => batch.id !== id);
		return Promise.resolve();
	}
	destroy() {
		return (0, import_asyncToGenerator.default)(function* () {})();
	}
};
//#endregion
//#region node_modules/matrix-widget-api/lib/interfaces/WidgetApiDirection.js
var require_WidgetApiDirection = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WidgetApiDirection = void 0;
	exports.invertedDirection = invertedDirection;
	var WidgetApiDirection = /* @__PURE__ */ function(WidgetApiDirection) {
		WidgetApiDirection["ToWidget"] = "toWidget";
		WidgetApiDirection["FromWidget"] = "fromWidget";
		return WidgetApiDirection;
	}({});
	exports.WidgetApiDirection = WidgetApiDirection;
	function invertedDirection(dir) {
		if (dir === WidgetApiDirection.ToWidget) return WidgetApiDirection.FromWidget;
		else if (dir === WidgetApiDirection.FromWidget) return WidgetApiDirection.ToWidget;
		else throw new Error("Invalid direction");
	}
}));
//#endregion
//#region node_modules/matrix-widget-api/lib/interfaces/ApiVersion.js
var require_ApiVersion = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.UnstableApiVersion = exports.MatrixApiVersion = exports.CurrentApiVersions = void 0;
	var MatrixApiVersion = /* @__PURE__ */ function(MatrixApiVersion) {
		MatrixApiVersion["Prerelease1"] = "0.0.1";
		MatrixApiVersion["Prerelease2"] = "0.0.2";
		return MatrixApiVersion;
	}({});
	exports.MatrixApiVersion = MatrixApiVersion;
	var UnstableApiVersion = /* @__PURE__ */ function(UnstableApiVersion) {
		UnstableApiVersion["MSC2762"] = "org.matrix.msc2762";
		UnstableApiVersion["MSC2762_UPDATE_STATE"] = "org.matrix.msc2762_update_state";
		UnstableApiVersion["MSC2871"] = "org.matrix.msc2871";
		UnstableApiVersion["MSC2873"] = "org.matrix.msc2873";
		UnstableApiVersion["MSC2931"] = "org.matrix.msc2931";
		UnstableApiVersion["MSC2974"] = "org.matrix.msc2974";
		UnstableApiVersion["MSC2876"] = "org.matrix.msc2876";
		UnstableApiVersion["MSC3819"] = "org.matrix.msc3819";
		UnstableApiVersion["MSC3846"] = "town.robin.msc3846";
		UnstableApiVersion["MSC3869"] = "org.matrix.msc3869";
		UnstableApiVersion["MSC3973"] = "org.matrix.msc3973";
		UnstableApiVersion["MSC4039"] = "org.matrix.msc4039";
		return UnstableApiVersion;
	}({});
	exports.UnstableApiVersion = UnstableApiVersion;
	exports.CurrentApiVersions = [
		MatrixApiVersion.Prerelease1,
		MatrixApiVersion.Prerelease2,
		UnstableApiVersion.MSC2762,
		UnstableApiVersion.MSC2762_UPDATE_STATE,
		UnstableApiVersion.MSC2871,
		UnstableApiVersion.MSC2873,
		UnstableApiVersion.MSC2931,
		UnstableApiVersion.MSC2974,
		UnstableApiVersion.MSC2876,
		UnstableApiVersion.MSC3819,
		UnstableApiVersion.MSC3846,
		UnstableApiVersion.MSC3869,
		UnstableApiVersion.MSC3973,
		UnstableApiVersion.MSC4039
	];
}));
//#endregion
//#region node_modules/matrix-widget-api/lib/transport/PostmessageTransport.js
var require_PostmessageTransport = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PostmessageTransport = void 0;
	var _events$2 = __require("events");
	var _ = require_lib();
	var _excluded = ["message"];
	function _typeof(obj) {
		"@babel/helpers - typeof";
		return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
			return typeof obj;
		} : function(obj) {
			return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
		}, _typeof(obj);
	}
	function _objectWithoutProperties(source, excluded) {
		if (source == null) return {};
		var target = _objectWithoutPropertiesLoose(source, excluded);
		var key, i;
		if (Object.getOwnPropertySymbols) {
			var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
			for (i = 0; i < sourceSymbolKeys.length; i++) {
				key = sourceSymbolKeys[i];
				if (excluded.indexOf(key) >= 0) continue;
				if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
				target[key] = source[key];
			}
		}
		return target;
	}
	function _objectWithoutPropertiesLoose(source, excluded) {
		if (source == null) return {};
		var target = {};
		var sourceKeys = Object.keys(source);
		var key, i;
		for (i = 0; i < sourceKeys.length; i++) {
			key = sourceKeys[i];
			if (excluded.indexOf(key) >= 0) continue;
			target[key] = source[key];
		}
		return target;
	}
	function ownKeys(object, enumerableOnly) {
		var keys = Object.keys(object);
		if (Object.getOwnPropertySymbols) {
			var symbols = Object.getOwnPropertySymbols(object);
			enumerableOnly && (symbols = symbols.filter(function(sym) {
				return Object.getOwnPropertyDescriptor(object, sym).enumerable;
			})), keys.push.apply(keys, symbols);
		}
		return keys;
	}
	function _objectSpread(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = null != arguments[i] ? arguments[i] : {};
			i % 2 ? ownKeys(Object(source), !0).forEach(function(key) {
				_defineProperty(target, key, source[key]);
			}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
				Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
			});
		}
		return target;
	}
	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
	}
	function _defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ("value" in descriptor) descriptor.writable = true;
			Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
		}
	}
	function _createClass(Constructor, protoProps, staticProps) {
		if (protoProps) _defineProperties(Constructor.prototype, protoProps);
		if (staticProps) _defineProperties(Constructor, staticProps);
		Object.defineProperty(Constructor, "prototype", { writable: false });
		return Constructor;
	}
	function _inherits(subClass, superClass) {
		if (typeof superClass !== "function" && superClass !== null) throw new TypeError("Super expression must either be null or a function");
		subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: {
			value: subClass,
			writable: true,
			configurable: true
		} });
		Object.defineProperty(subClass, "prototype", { writable: false });
		if (superClass) _setPrototypeOf(subClass, superClass);
	}
	function _setPrototypeOf(o, p) {
		_setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
			o.__proto__ = p;
			return o;
		};
		return _setPrototypeOf(o, p);
	}
	function _createSuper(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf(Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf(this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn(this, result);
		};
	}
	function _possibleConstructorReturn(self, call) {
		if (call && (_typeof(call) === "object" || typeof call === "function")) return call;
		else if (call !== void 0) throw new TypeError("Derived constructors may only return object or undefined");
		return _assertThisInitialized(self);
	}
	function _assertThisInitialized(self) {
		if (self === void 0) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
		return self;
	}
	function _isNativeReflectConstruct() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	function _getPrototypeOf(o) {
		_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
			return o.__proto__ || Object.getPrototypeOf(o);
		};
		return _getPrototypeOf(o);
	}
	function _defineProperty(obj, key, value) {
		key = _toPropertyKey(key);
		if (key in obj) Object.defineProperty(obj, key, {
			value,
			enumerable: true,
			configurable: true,
			writable: true
		});
		else obj[key] = value;
		return obj;
	}
	function _toPropertyKey(arg) {
		var key = _toPrimitive(arg, "string");
		return _typeof(key) === "symbol" ? key : String(key);
	}
	function _toPrimitive(input, hint) {
		if (_typeof(input) !== "object" || input === null) return input;
		var prim = input[Symbol.toPrimitive];
		if (prim !== void 0) {
			var res = prim.call(input, hint || "default");
			if (_typeof(res) !== "object") return res;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return (hint === "string" ? String : Number)(input);
	}
	exports.PostmessageTransport = /* @__PURE__ */ function(_EventEmitter) {
		_inherits(PostmessageTransport, _EventEmitter);
		var _super = _createSuper(PostmessageTransport);
		function PostmessageTransport(sendDirection, initialWidgetId, transportWindow, inboundWindow) {
			var _this;
			_classCallCheck(this, PostmessageTransport);
			_this = _super.call(this);
			_this.sendDirection = sendDirection;
			_this.transportWindow = transportWindow;
			_this.inboundWindow = inboundWindow;
			_defineProperty(_assertThisInitialized(_this), "strictOriginCheck", false);
			_defineProperty(_assertThisInitialized(_this), "targetOrigin", "*");
			_defineProperty(_assertThisInitialized(_this), "timeoutSeconds", 10);
			_defineProperty(_assertThisInitialized(_this), "_ready", false);
			_defineProperty(_assertThisInitialized(_this), "_widgetId", void 0);
			_defineProperty(_assertThisInitialized(_this), "outboundRequests", /* @__PURE__ */ new Map());
			_defineProperty(_assertThisInitialized(_this), "stopController", new AbortController());
			_defineProperty(_assertThisInitialized(_this), "handleMessage", function(ev) {
				if (_this.stopController.signal.aborted) return;
				if (!ev.data) return;
				if (_this.strictOriginCheck && ev.origin !== globalThis.origin) return;
				var response = ev.data;
				if (!response.action || !response.requestId || !response.widgetId) return;
				if (response.response) {
					if (response.api !== _this.sendDirection) return;
					_this.handleResponse(response);
				} else {
					var request = response;
					if (request.api !== (0, _.invertedDirection)(_this.sendDirection)) return;
					_this.handleRequest(request);
				}
			});
			_this._widgetId = initialWidgetId;
			return _this;
		}
		_createClass(PostmessageTransport, [
			{
				key: "ready",
				get: function get() {
					return this._ready;
				}
			},
			{
				key: "widgetId",
				get: function get() {
					return this._widgetId || null;
				}
			},
			{
				key: "nextRequestId",
				get: function get() {
					var idBase = "widgetapi-".concat(Date.now());
					var index = 0;
					var id = idBase;
					while (this.outboundRequests.has(id)) id = "".concat(idBase, "-").concat(index++);
					this.outboundRequests.set(id, null);
					return id;
				}
			},
			{
				key: "sendInternal",
				value: function sendInternal(message) {
					console.log("[PostmessageTransport] Sending object to ".concat(this.targetOrigin, ": "), message);
					this.transportWindow.postMessage(message, this.targetOrigin);
				}
			},
			{
				key: "reply",
				value: function reply(request, responseData) {
					return this.sendInternal(_objectSpread(_objectSpread({}, request), {}, { response: responseData }));
				}
			},
			{
				key: "send",
				value: function send(action, data) {
					return this.sendComplete(action, data).then(function(r) {
						return r.response;
					});
				}
			},
			{
				key: "sendComplete",
				value: function sendComplete(action, data) {
					var _this2 = this;
					if (!this.ready || !this.widgetId) return Promise.reject(/* @__PURE__ */ new Error("Not ready or unknown widget ID"));
					var request = {
						api: this.sendDirection,
						widgetId: this.widgetId,
						requestId: this.nextRequestId,
						action,
						data
					};
					if (action === _.WidgetApiToWidgetAction.UpdateVisibility) request["visible"] = data["visible"];
					return new Promise(function(prResolve, prReject) {
						var resolve = function resolve(response) {
							cleanUp();
							prResolve(response);
						};
						var reject = function reject(err) {
							cleanUp();
							prReject(err);
						};
						var timerId = setTimeout(function() {
							return reject(/* @__PURE__ */ new Error("Request timed out"));
						}, (_this2.timeoutSeconds || 1) * 1e3);
						var onStop = function onStop() {
							return reject(/* @__PURE__ */ new Error("Transport stopped"));
						};
						_this2.stopController.signal.addEventListener("abort", onStop);
						var cleanUp = function cleanUp() {
							_this2.outboundRequests["delete"](request.requestId);
							clearTimeout(timerId);
							_this2.stopController.signal.removeEventListener("abort", onStop);
						};
						_this2.outboundRequests.set(request.requestId, {
							request,
							resolve,
							reject
						});
						_this2.sendInternal(request);
					});
				}
			},
			{
				key: "start",
				value: function start() {
					this.inboundWindow.addEventListener("message", this.handleMessage);
					this._ready = true;
				}
			},
			{
				key: "stop",
				value: function stop() {
					this._ready = false;
					this.stopController.abort();
					this.inboundWindow.removeEventListener("message", this.handleMessage);
				}
			},
			{
				key: "handleRequest",
				value: function handleRequest(request) {
					if (this.widgetId) {
						if (this.widgetId !== request.widgetId) return;
					} else this._widgetId = request.widgetId;
					this.emit("message", new CustomEvent("message", { detail: request }));
				}
			},
			{
				key: "handleResponse",
				value: function handleResponse(response) {
					if (response.widgetId !== this.widgetId) return;
					var req = this.outboundRequests.get(response.requestId);
					if (!req) return;
					if ((0, _.isErrorResponse)(response.response)) {
						var _response$response$er = response.response.error, message = _response$response$er.message, data = _objectWithoutProperties(_response$response$er, _excluded);
						req.reject(new _.WidgetApiResponseError(message, data));
					} else req.resolve(response);
				}
			}
		]);
		return PostmessageTransport;
	}(_events$2.EventEmitter);
}));
//#endregion
//#region node_modules/matrix-widget-api/lib/interfaces/WidgetApiAction.js
var require_WidgetApiAction = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WidgetApiToWidgetAction = exports.WidgetApiFromWidgetAction = void 0;
	exports.WidgetApiToWidgetAction = /* @__PURE__ */ function(WidgetApiToWidgetAction) {
		WidgetApiToWidgetAction["SupportedApiVersions"] = "supported_api_versions";
		WidgetApiToWidgetAction["Capabilities"] = "capabilities";
		WidgetApiToWidgetAction["NotifyCapabilities"] = "notify_capabilities";
		WidgetApiToWidgetAction["ThemeChange"] = "theme_change";
		WidgetApiToWidgetAction["LanguageChange"] = "language_change";
		WidgetApiToWidgetAction["TakeScreenshot"] = "screenshot";
		WidgetApiToWidgetAction["UpdateVisibility"] = "visibility";
		WidgetApiToWidgetAction["OpenIDCredentials"] = "openid_credentials";
		WidgetApiToWidgetAction["WidgetConfig"] = "widget_config";
		WidgetApiToWidgetAction["CloseModalWidget"] = "close_modal";
		WidgetApiToWidgetAction["ButtonClicked"] = "button_clicked";
		WidgetApiToWidgetAction["SendEvent"] = "send_event";
		WidgetApiToWidgetAction["SendToDevice"] = "send_to_device";
		WidgetApiToWidgetAction["UpdateState"] = "update_state";
		WidgetApiToWidgetAction["UpdateTurnServers"] = "update_turn_servers";
		return WidgetApiToWidgetAction;
	}({});
	exports.WidgetApiFromWidgetAction = /* @__PURE__ */ function(WidgetApiFromWidgetAction) {
		WidgetApiFromWidgetAction["SupportedApiVersions"] = "supported_api_versions";
		WidgetApiFromWidgetAction["ContentLoaded"] = "content_loaded";
		WidgetApiFromWidgetAction["SendSticker"] = "m.sticker";
		WidgetApiFromWidgetAction["UpdateAlwaysOnScreen"] = "set_always_on_screen";
		WidgetApiFromWidgetAction["GetOpenIDCredentials"] = "get_openid";
		WidgetApiFromWidgetAction["CloseModalWidget"] = "close_modal";
		WidgetApiFromWidgetAction["OpenModalWidget"] = "open_modal";
		WidgetApiFromWidgetAction["SetModalButtonEnabled"] = "set_button_enabled";
		WidgetApiFromWidgetAction["SendEvent"] = "send_event";
		WidgetApiFromWidgetAction["SendToDevice"] = "send_to_device";
		WidgetApiFromWidgetAction["WatchTurnServers"] = "watch_turn_servers";
		WidgetApiFromWidgetAction["UnwatchTurnServers"] = "unwatch_turn_servers";
		WidgetApiFromWidgetAction["BeeperReadRoomAccountData"] = "com.beeper.read_room_account_data";
		WidgetApiFromWidgetAction["MSC2876ReadEvents"] = "org.matrix.msc2876.read_events";
		WidgetApiFromWidgetAction["MSC2931Navigate"] = "org.matrix.msc2931.navigate";
		WidgetApiFromWidgetAction["MSC2974RenegotiateCapabilities"] = "org.matrix.msc2974.request_capabilities";
		WidgetApiFromWidgetAction["MSC3869ReadRelations"] = "org.matrix.msc3869.read_relations";
		WidgetApiFromWidgetAction["MSC3973UserDirectorySearch"] = "org.matrix.msc3973.user_directory_search";
		WidgetApiFromWidgetAction["MSC4039GetMediaConfigAction"] = "org.matrix.msc4039.get_media_config";
		WidgetApiFromWidgetAction["MSC4039UploadFileAction"] = "org.matrix.msc4039.upload_file";
		WidgetApiFromWidgetAction["MSC4039DownloadFileAction"] = "org.matrix.msc4039.download_file";
		WidgetApiFromWidgetAction["MSC4157UpdateDelayedEvent"] = "org.matrix.msc4157.update_delayed_event";
		return WidgetApiFromWidgetAction;
	}({});
}));
//#endregion
//#region node_modules/matrix-widget-api/lib/interfaces/GetOpenIDAction.js
var require_GetOpenIDAction = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.OpenIDRequestState = void 0;
	exports.OpenIDRequestState = /* @__PURE__ */ function(OpenIDRequestState) {
		OpenIDRequestState["Allowed"] = "allowed";
		OpenIDRequestState["Blocked"] = "blocked";
		OpenIDRequestState["PendingUserConfirmation"] = "request";
		return OpenIDRequestState;
	}({});
}));
//#endregion
//#region node_modules/matrix-widget-api/lib/interfaces/WidgetType.js
var require_WidgetType = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MatrixWidgetType = void 0;
	exports.MatrixWidgetType = /* @__PURE__ */ function(MatrixWidgetType) {
		MatrixWidgetType["Custom"] = "m.custom";
		MatrixWidgetType["JitsiMeet"] = "m.jitsi";
		MatrixWidgetType["Stickerpicker"] = "m.stickerpicker";
		return MatrixWidgetType;
	}({});
}));
//#endregion
//#region node_modules/matrix-widget-api/lib/interfaces/ModalWidgetActions.js
var require_ModalWidgetActions = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BuiltInModalButtonID = void 0;
	exports.BuiltInModalButtonID = /* @__PURE__ */ function(BuiltInModalButtonID) {
		BuiltInModalButtonID["Close"] = "m.close";
		return BuiltInModalButtonID;
	}({});
}));
//#endregion
//#region node_modules/matrix-widget-api/lib/models/WidgetEventCapability.js
var require_WidgetEventCapability = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WidgetEventCapability = exports.EventKind = exports.EventDirection = void 0;
	function _typeof(obj) {
		"@babel/helpers - typeof";
		return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
			return typeof obj;
		} : function(obj) {
			return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
		}, _typeof(obj);
	}
	function _createForOfIteratorHelper(o, allowArrayLike) {
		var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
		if (!it) {
			if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
				if (it) o = it;
				var i = 0;
				var F = function F() {};
				return {
					s: F,
					n: function n() {
						if (i >= o.length) return { done: true };
						return {
							done: false,
							value: o[i++]
						};
					},
					e: function e(_e) {
						throw _e;
					},
					f: F
				};
			}
			throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
		}
		var normalCompletion = true, didErr = false, err;
		return {
			s: function s() {
				it = it.call(o);
			},
			n: function n() {
				var step = it.next();
				normalCompletion = step.done;
				return step;
			},
			e: function e(_e2) {
				didErr = true;
				err = _e2;
			},
			f: function f() {
				try {
					if (!normalCompletion && it["return"] != null) it["return"]();
				} finally {
					if (didErr) throw err;
				}
			}
		};
	}
	function _unsupportedIterableToArray(o, minLen) {
		if (!o) return;
		if (typeof o === "string") return _arrayLikeToArray(o, minLen);
		var n = Object.prototype.toString.call(o).slice(8, -1);
		if (n === "Object" && o.constructor) n = o.constructor.name;
		if (n === "Map" || n === "Set") return Array.from(o);
		if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
	}
	function _arrayLikeToArray(arr, len) {
		if (len == null || len > arr.length) len = arr.length;
		for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
		return arr2;
	}
	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
	}
	function _defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ("value" in descriptor) descriptor.writable = true;
			Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
		}
	}
	function _createClass(Constructor, protoProps, staticProps) {
		if (protoProps) _defineProperties(Constructor.prototype, protoProps);
		if (staticProps) _defineProperties(Constructor, staticProps);
		Object.defineProperty(Constructor, "prototype", { writable: false });
		return Constructor;
	}
	function _toPropertyKey(arg) {
		var key = _toPrimitive(arg, "string");
		return _typeof(key) === "symbol" ? key : String(key);
	}
	function _toPrimitive(input, hint) {
		if (_typeof(input) !== "object" || input === null) return input;
		var prim = input[Symbol.toPrimitive];
		if (prim !== void 0) {
			var res = prim.call(input, hint || "default");
			if (_typeof(res) !== "object") return res;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return (hint === "string" ? String : Number)(input);
	}
	var EventKind = /* @__PURE__ */ function(EventKind) {
		EventKind["Event"] = "event";
		EventKind["State"] = "state_event";
		EventKind["ToDevice"] = "to_device";
		EventKind["RoomAccount"] = "room_account";
		return EventKind;
	}({});
	exports.EventKind = EventKind;
	var EventDirection = /* @__PURE__ */ function(EventDirection) {
		EventDirection["Send"] = "send";
		EventDirection["Receive"] = "receive";
		return EventDirection;
	}({});
	exports.EventDirection = EventDirection;
	exports.WidgetEventCapability = /* @__PURE__ */ function() {
		function WidgetEventCapability(direction, eventType, kind, keyStr, raw) {
			_classCallCheck(this, WidgetEventCapability);
			this.direction = direction;
			this.eventType = eventType;
			this.kind = kind;
			this.keyStr = keyStr;
			this.raw = raw;
		}
		_createClass(WidgetEventCapability, [
			{
				key: "matchesAsStateEvent",
				value: function matchesAsStateEvent(direction, eventType, stateKey) {
					if (this.kind !== EventKind.State) return false;
					if (this.direction !== direction) return false;
					if (this.eventType !== eventType) return false;
					if (this.keyStr === null) return true;
					if (this.keyStr === stateKey) return true;
					return false;
				}
			},
			{
				key: "matchesAsToDeviceEvent",
				value: function matchesAsToDeviceEvent(direction, eventType) {
					if (this.kind !== EventKind.ToDevice) return false;
					if (this.direction !== direction) return false;
					if (this.eventType !== eventType) return false;
					return true;
				}
			},
			{
				key: "matchesAsRoomEvent",
				value: function matchesAsRoomEvent(direction, eventType) {
					var msgtype = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : null;
					if (this.kind !== EventKind.Event) return false;
					if (this.direction !== direction) return false;
					if (this.eventType !== eventType) return false;
					if (this.eventType === "m.room.message") {
						if (this.keyStr === null) return true;
						if (this.keyStr === msgtype) return true;
					} else return true;
					return false;
				}
			},
			{
				key: "matchesAsRoomAccountData",
				value: function matchesAsRoomAccountData(direction, eventType) {
					if (this.kind !== EventKind.RoomAccount) return false;
					if (this.direction !== direction) return false;
					if (this.eventType !== eventType) return false;
					return true;
				}
			}
		], [
			{
				key: "forStateEvent",
				value: function forStateEvent(direction, eventType, stateKey) {
					eventType = eventType.replace(/#/g, "\\#");
					stateKey = stateKey !== null && stateKey !== void 0 ? "#".concat(stateKey) : "";
					var str = "org.matrix.msc2762.".concat(direction, ".state_event:").concat(eventType).concat(stateKey);
					return WidgetEventCapability.findEventCapabilities([str])[0];
				}
			},
			{
				key: "forToDeviceEvent",
				value: function forToDeviceEvent(direction, eventType) {
					var str = "org.matrix.msc3819.".concat(direction, ".to_device:").concat(eventType);
					return WidgetEventCapability.findEventCapabilities([str])[0];
				}
			},
			{
				key: "forRoomEvent",
				value: function forRoomEvent(direction, eventType) {
					var str = "org.matrix.msc2762.".concat(direction, ".event:").concat(eventType);
					return WidgetEventCapability.findEventCapabilities([str])[0];
				}
			},
			{
				key: "forRoomMessageEvent",
				value: function forRoomMessageEvent(direction, msgtype) {
					msgtype = msgtype === null || msgtype === void 0 ? "" : msgtype;
					var str = "org.matrix.msc2762.".concat(direction, ".event:m.room.message#").concat(msgtype);
					return WidgetEventCapability.findEventCapabilities([str])[0];
				}
			},
			{
				key: "forRoomAccountData",
				value: function forRoomAccountData(direction, eventType) {
					var str = "com.beeper.capabilities.".concat(direction, ".room_account_data:").concat(eventType);
					return WidgetEventCapability.findEventCapabilities([str])[0];
				}
			},
			{
				key: "findEventCapabilities",
				value: function findEventCapabilities(capabilities) {
					var parsed = [];
					var _iterator = _createForOfIteratorHelper(capabilities), _step;
					try {
						for (_iterator.s(); !(_step = _iterator.n()).done;) {
							var cap = _step.value;
							var _direction = null;
							var eventSegment = void 0;
							var _kind = null;
							if (cap.startsWith("org.matrix.msc2762.send.event:")) {
								_direction = EventDirection.Send;
								_kind = EventKind.Event;
								eventSegment = cap.substring(30);
							} else if (cap.startsWith("org.matrix.msc2762.send.state_event:")) {
								_direction = EventDirection.Send;
								_kind = EventKind.State;
								eventSegment = cap.substring(36);
							} else if (cap.startsWith("org.matrix.msc3819.send.to_device:")) {
								_direction = EventDirection.Send;
								_kind = EventKind.ToDevice;
								eventSegment = cap.substring(34);
							} else if (cap.startsWith("org.matrix.msc2762.receive.event:")) {
								_direction = EventDirection.Receive;
								_kind = EventKind.Event;
								eventSegment = cap.substring(33);
							} else if (cap.startsWith("org.matrix.msc2762.receive.state_event:")) {
								_direction = EventDirection.Receive;
								_kind = EventKind.State;
								eventSegment = cap.substring(39);
							} else if (cap.startsWith("org.matrix.msc3819.receive.to_device:")) {
								_direction = EventDirection.Receive;
								_kind = EventKind.ToDevice;
								eventSegment = cap.substring(37);
							} else if (cap.startsWith("com.beeper.capabilities.receive.room_account_data:")) {
								_direction = EventDirection.Receive;
								_kind = EventKind.RoomAccount;
								eventSegment = cap.substring(50);
							}
							if (_direction === null || _kind === null || eventSegment === void 0) continue;
							var expectingKeyStr = eventSegment.startsWith("m.room.message#") || _kind === EventKind.State;
							var _keyStr = null;
							if (eventSegment.includes("#") && expectingKeyStr) {
								var parts = eventSegment.split("#");
								var idx = parts.findIndex(function(p) {
									return !p.endsWith("\\");
								});
								eventSegment = parts.slice(0, idx + 1).map(function(p) {
									return p.endsWith("\\") ? p.substring(0, p.length - 1) : p;
								}).join("#");
								_keyStr = parts.slice(idx + 1).join("#");
							}
							parsed.push(new WidgetEventCapability(_direction, eventSegment, _kind, _keyStr, cap));
						}
					} catch (err) {
						_iterator.e(err);
					} finally {
						_iterator.f();
					}
					return parsed;
				}
			}
		]);
		return WidgetEventCapability;
	}();
}));
//#endregion
//#region node_modules/matrix-widget-api/lib/Symbols.js
var require_Symbols = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Symbols = void 0;
	exports.Symbols = /* @__PURE__ */ function(Symbols) {
		Symbols["AnyRoom"] = "*";
		return Symbols;
	}({});
}));
//#endregion
//#region node_modules/matrix-widget-api/lib/interfaces/UpdateDelayedEventAction.js
var require_UpdateDelayedEventAction = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.UpdateDelayedEventAction = void 0;
	exports.UpdateDelayedEventAction = /* @__PURE__ */ function(UpdateDelayedEventAction) {
		UpdateDelayedEventAction["Cancel"] = "cancel";
		UpdateDelayedEventAction["Restart"] = "restart";
		UpdateDelayedEventAction["Send"] = "send";
		return UpdateDelayedEventAction;
	}({});
}));
//#endregion
//#region node_modules/matrix-widget-api/lib/WidgetApi.js
var require_WidgetApi = /* @__PURE__ */ __commonJSMin(((exports) => {
	function _typeof(obj) {
		"@babel/helpers - typeof";
		return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
			return typeof obj;
		} : function(obj) {
			return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
		}, _typeof(obj);
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WidgetApiResponseError = exports.WidgetApi = void 0;
	var _events$1 = __require("events");
	var _WidgetApiDirection = require_WidgetApiDirection();
	var _ApiVersion = require_ApiVersion();
	var _PostmessageTransport = require_PostmessageTransport();
	var _WidgetApiAction = require_WidgetApiAction();
	var _GetOpenIDAction = require_GetOpenIDAction();
	var _WidgetType = require_WidgetType();
	var _ModalWidgetActions = require_ModalWidgetActions();
	var _WidgetEventCapability = require_WidgetEventCapability();
	var _Symbols = require_Symbols();
	var _UpdateDelayedEventAction = require_UpdateDelayedEventAction();
	function _regeneratorRuntime() {
		"use strict";
		/*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() {
			return exports$2;
		};
		var exports$2 = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function(obj, key, desc) {
			obj[key] = desc.value;
		}, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
		function define(obj, key, value) {
			return Object.defineProperty(obj, key, {
				value,
				enumerable: !0,
				configurable: !0,
				writable: !0
			}), obj[key];
		}
		try {
			define({}, "");
		} catch (err) {
			define = function define(obj, key, value) {
				return obj[key] = value;
			};
		}
		function wrap(innerFn, outerFn, self, tryLocsList) {
			var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype);
			return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, new Context(tryLocsList || [])) }), generator;
		}
		function tryCatch(fn, obj, arg) {
			try {
				return {
					type: "normal",
					arg: fn.call(obj, arg)
				};
			} catch (err) {
				return {
					type: "throw",
					arg: err
				};
			}
		}
		exports$2.wrap = wrap;
		var ContinueSentinel = {};
		function Generator() {}
		function GeneratorFunction() {}
		function GeneratorFunctionPrototype() {}
		var IteratorPrototype = {};
		define(IteratorPrototype, iteratorSymbol, function() {
			return this;
		});
		var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([])));
		NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype);
		var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
		function defineIteratorMethods(prototype) {
			[
				"next",
				"throw",
				"return"
			].forEach(function(method) {
				define(prototype, method, function(arg) {
					return this._invoke(method, arg);
				});
			});
		}
		function AsyncIterator(generator, PromiseImpl) {
			function invoke(method, arg, resolve, reject) {
				var record = tryCatch(generator[method], generator, arg);
				if ("throw" !== record.type) {
					var result = record.arg, value = result.value;
					return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function(value) {
						invoke("next", value, resolve, reject);
					}, function(err) {
						invoke("throw", err, resolve, reject);
					}) : PromiseImpl.resolve(value).then(function(unwrapped) {
						result.value = unwrapped, resolve(result);
					}, function(error) {
						return invoke("throw", error, resolve, reject);
					});
				}
				reject(record.arg);
			}
			var previousPromise;
			defineProperty(this, "_invoke", { value: function value(method, arg) {
				function callInvokeWithMethodAndArg() {
					return new PromiseImpl(function(resolve, reject) {
						invoke(method, arg, resolve, reject);
					});
				}
				return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
			} });
		}
		function makeInvokeMethod(innerFn, self, context) {
			var state = "suspendedStart";
			return function(method, arg) {
				if ("executing" === state) throw new Error("Generator is already running");
				if ("completed" === state) {
					if ("throw" === method) throw arg;
					return doneResult();
				}
				for (context.method = method, context.arg = arg;;) {
					var delegate = context.delegate;
					if (delegate) {
						var delegateResult = maybeInvokeDelegate(delegate, context);
						if (delegateResult) {
							if (delegateResult === ContinueSentinel) continue;
							return delegateResult;
						}
					}
					if ("next" === context.method) context.sent = context._sent = context.arg;
					else if ("throw" === context.method) {
						if ("suspendedStart" === state) throw state = "completed", context.arg;
						context.dispatchException(context.arg);
					} else "return" === context.method && context.abrupt("return", context.arg);
					state = "executing";
					var record = tryCatch(innerFn, self, context);
					if ("normal" === record.type) {
						if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue;
						return {
							value: record.arg,
							done: context.done
						};
					}
					"throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg);
				}
			};
		}
		function maybeInvokeDelegate(delegate, context) {
			var methodName = context.method, method = delegate.iterator[methodName];
			if (void 0 === method) return context.delegate = null, "throw" === methodName && delegate.iterator["return"] && (context.method = "return", context.arg = void 0, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = /* @__PURE__ */ new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel;
			var record = tryCatch(method, delegate.iterator, context.arg);
			if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel;
			var info = record.arg;
			return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = void 0), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = /* @__PURE__ */ new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel);
		}
		function pushTryEntry(locs) {
			var entry = { tryLoc: locs[0] };
			1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry);
		}
		function resetTryEntry(entry) {
			var record = entry.completion || {};
			record.type = "normal", delete record.arg, entry.completion = record;
		}
		function Context(tryLocsList) {
			this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0);
		}
		function values(iterable) {
			if (iterable) {
				var iteratorMethod = iterable[iteratorSymbol];
				if (iteratorMethod) return iteratorMethod.call(iterable);
				if ("function" == typeof iterable.next) return iterable;
				if (!isNaN(iterable.length)) {
					var i = -1, next = function next() {
						for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next;
						return next.value = void 0, next.done = !0, next;
					};
					return next.next = next;
				}
			}
			return { next: doneResult };
		}
		function doneResult() {
			return {
				value: void 0,
				done: !0
			};
		}
		return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", {
			value: GeneratorFunctionPrototype,
			configurable: !0
		}), defineProperty(GeneratorFunctionPrototype, "constructor", {
			value: GeneratorFunction,
			configurable: !0
		}), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports$2.isGeneratorFunction = function(genFun) {
			var ctor = "function" == typeof genFun && genFun.constructor;
			return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name));
		}, exports$2.mark = function(genFun) {
			return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun;
		}, exports$2.awrap = function(arg) {
			return { __await: arg };
		}, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function() {
			return this;
		}), exports$2.AsyncIterator = AsyncIterator, exports$2.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
			void 0 === PromiseImpl && (PromiseImpl = Promise);
			var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
			return exports$2.isGeneratorFunction(outerFn) ? iter : iter.next().then(function(result) {
				return result.done ? result.value : iter.next();
			});
		}, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function() {
			return this;
		}), define(Gp, "toString", function() {
			return "[object Generator]";
		}), exports$2.keys = function(val) {
			var object = Object(val), keys = [];
			for (var key in object) keys.push(key);
			return keys.reverse(), function next() {
				for (; keys.length;) {
					var key = keys.pop();
					if (key in object) return next.value = key, next.done = !1, next;
				}
				return next.done = !0, next;
			};
		}, exports$2.values = values, Context.prototype = {
			constructor: Context,
			reset: function reset(skipTempReset) {
				if (this.prev = 0, this.next = 0, this.sent = this._sent = void 0, this.done = !1, this.delegate = null, this.method = "next", this.arg = void 0, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = void 0);
			},
			stop: function stop() {
				this.done = !0;
				var rootRecord = this.tryEntries[0].completion;
				if ("throw" === rootRecord.type) throw rootRecord.arg;
				return this.rval;
			},
			dispatchException: function dispatchException(exception) {
				if (this.done) throw exception;
				var context = this;
				function handle(loc, caught) {
					return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = void 0), !!caught;
				}
				for (var i = this.tryEntries.length - 1; i >= 0; --i) {
					var entry = this.tryEntries[i], record = entry.completion;
					if ("root" === entry.tryLoc) return handle("end");
					if (entry.tryLoc <= this.prev) {
						var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc");
						if (hasCatch && hasFinally) {
							if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
							if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
						} else if (hasCatch) {
							if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
						} else {
							if (!hasFinally) throw new Error("try statement without catch or finally");
							if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
						}
					}
				}
			},
			abrupt: function abrupt(type, arg) {
				for (var i = this.tryEntries.length - 1; i >= 0; --i) {
					var entry = this.tryEntries[i];
					if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
						var finallyEntry = entry;
						break;
					}
				}
				finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null);
				var record = finallyEntry ? finallyEntry.completion : {};
				return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record);
			},
			complete: function complete(record, afterLoc) {
				if ("throw" === record.type) throw record.arg;
				return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel;
			},
			finish: function finish(finallyLoc) {
				for (var i = this.tryEntries.length - 1; i >= 0; --i) {
					var entry = this.tryEntries[i];
					if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
				}
			},
			"catch": function _catch(tryLoc) {
				for (var i = this.tryEntries.length - 1; i >= 0; --i) {
					var entry = this.tryEntries[i];
					if (entry.tryLoc === tryLoc) {
						var record = entry.completion;
						if ("throw" === record.type) {
							var thrown = record.arg;
							resetTryEntry(entry);
						}
						return thrown;
					}
				}
				throw new Error("illegal catch attempt");
			},
			delegateYield: function delegateYield(iterable, resultName, nextLoc) {
				return this.delegate = {
					iterator: values(iterable),
					resultName,
					nextLoc
				}, "next" === this.method && (this.arg = void 0), ContinueSentinel;
			}
		}, exports$2;
	}
	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
		try {
			var info = gen[key](arg);
			var value = info.value;
		} catch (error) {
			reject(error);
			return;
		}
		if (info.done) resolve(value);
		else Promise.resolve(value).then(_next, _throw);
	}
	function _asyncToGenerator(fn) {
		return function() {
			var self = this, args = arguments;
			return new Promise(function(resolve, reject) {
				var gen = fn.apply(self, args);
				function _next(value) {
					asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
				}
				function _throw(err) {
					asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
				}
				_next(void 0);
			});
		};
	}
	function ownKeys(object, enumerableOnly) {
		var keys = Object.keys(object);
		if (Object.getOwnPropertySymbols) {
			var symbols = Object.getOwnPropertySymbols(object);
			enumerableOnly && (symbols = symbols.filter(function(sym) {
				return Object.getOwnPropertyDescriptor(object, sym).enumerable;
			})), keys.push.apply(keys, symbols);
		}
		return keys;
	}
	function _objectSpread(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = null != arguments[i] ? arguments[i] : {};
			i % 2 ? ownKeys(Object(source), !0).forEach(function(key) {
				_defineProperty(target, key, source[key]);
			}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
				Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
			});
		}
		return target;
	}
	function _createForOfIteratorHelper(o, allowArrayLike) {
		var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
		if (!it) {
			if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
				if (it) o = it;
				var i = 0;
				var F = function F() {};
				return {
					s: F,
					n: function n() {
						if (i >= o.length) return { done: true };
						return {
							done: false,
							value: o[i++]
						};
					},
					e: function e(_e) {
						throw _e;
					},
					f: F
				};
			}
			throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
		}
		var normalCompletion = true, didErr = false, err;
		return {
			s: function s() {
				it = it.call(o);
			},
			n: function n() {
				var step = it.next();
				normalCompletion = step.done;
				return step;
			},
			e: function e(_e2) {
				didErr = true;
				err = _e2;
			},
			f: function f() {
				try {
					if (!normalCompletion && it["return"] != null) it["return"]();
				} finally {
					if (didErr) throw err;
				}
			}
		};
	}
	function _unsupportedIterableToArray(o, minLen) {
		if (!o) return;
		if (typeof o === "string") return _arrayLikeToArray(o, minLen);
		var n = Object.prototype.toString.call(o).slice(8, -1);
		if (n === "Object" && o.constructor) n = o.constructor.name;
		if (n === "Map" || n === "Set") return Array.from(o);
		if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
	}
	function _arrayLikeToArray(arr, len) {
		if (len == null || len > arr.length) len = arr.length;
		for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
		return arr2;
	}
	function _defineProperty(obj, key, value) {
		key = _toPropertyKey(key);
		if (key in obj) Object.defineProperty(obj, key, {
			value,
			enumerable: true,
			configurable: true,
			writable: true
		});
		else obj[key] = value;
		return obj;
	}
	function _defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ("value" in descriptor) descriptor.writable = true;
			Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
		}
	}
	function _createClass(Constructor, protoProps, staticProps) {
		if (protoProps) _defineProperties(Constructor.prototype, protoProps);
		if (staticProps) _defineProperties(Constructor, staticProps);
		Object.defineProperty(Constructor, "prototype", { writable: false });
		return Constructor;
	}
	function _toPropertyKey(arg) {
		var key = _toPrimitive(arg, "string");
		return _typeof(key) === "symbol" ? key : String(key);
	}
	function _toPrimitive(input, hint) {
		if (_typeof(input) !== "object" || input === null) return input;
		var prim = input[Symbol.toPrimitive];
		if (prim !== void 0) {
			var res = prim.call(input, hint || "default");
			if (_typeof(res) !== "object") return res;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return (hint === "string" ? String : Number)(input);
	}
	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
	}
	function _inherits(subClass, superClass) {
		if (typeof superClass !== "function" && superClass !== null) throw new TypeError("Super expression must either be null or a function");
		subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: {
			value: subClass,
			writable: true,
			configurable: true
		} });
		Object.defineProperty(subClass, "prototype", { writable: false });
		if (superClass) _setPrototypeOf(subClass, superClass);
	}
	function _createSuper(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf(Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf(this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn(this, result);
		};
	}
	function _possibleConstructorReturn(self, call) {
		if (call && (_typeof(call) === "object" || typeof call === "function")) return call;
		else if (call !== void 0) throw new TypeError("Derived constructors may only return object or undefined");
		return _assertThisInitialized(self);
	}
	function _assertThisInitialized(self) {
		if (self === void 0) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
		return self;
	}
	function _wrapNativeSuper(Class) {
		var _cache = typeof Map === "function" ? /* @__PURE__ */ new Map() : void 0;
		_wrapNativeSuper = function _wrapNativeSuper(Class) {
			if (Class === null || !_isNativeFunction(Class)) return Class;
			if (typeof Class !== "function") throw new TypeError("Super expression must either be null or a function");
			if (typeof _cache !== "undefined") {
				if (_cache.has(Class)) return _cache.get(Class);
				_cache.set(Class, Wrapper);
			}
			function Wrapper() {
				return _construct(Class, arguments, _getPrototypeOf(this).constructor);
			}
			Wrapper.prototype = Object.create(Class.prototype, { constructor: {
				value: Wrapper,
				enumerable: false,
				writable: true,
				configurable: true
			} });
			return _setPrototypeOf(Wrapper, Class);
		};
		return _wrapNativeSuper(Class);
	}
	function _construct(Parent, args, Class) {
		if (_isNativeReflectConstruct()) _construct = Reflect.construct.bind();
		else _construct = function _construct(Parent, args, Class) {
			var a = [null];
			a.push.apply(a, args);
			var instance = new (Function.bind.apply(Parent, a))();
			if (Class) _setPrototypeOf(instance, Class.prototype);
			return instance;
		};
		return _construct.apply(null, arguments);
	}
	function _isNativeReflectConstruct() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	function _isNativeFunction(fn) {
		return Function.toString.call(fn).indexOf("[native code]") !== -1;
	}
	function _setPrototypeOf(o, p) {
		_setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
			o.__proto__ = p;
			return o;
		};
		return _setPrototypeOf(o, p);
	}
	function _getPrototypeOf(o) {
		_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
			return o.__proto__ || Object.getPrototypeOf(o);
		};
		return _getPrototypeOf(o);
	}
	function _awaitAsyncGenerator(value) {
		return new _OverloadYield(value, 0);
	}
	function _wrapAsyncGenerator(fn) {
		return function() {
			return new _AsyncGenerator(fn.apply(this, arguments));
		};
	}
	function _AsyncGenerator(gen) {
		var front, back;
		function resume(key, arg) {
			try {
				var result = gen[key](arg), value = result.value, overloaded = value instanceof _OverloadYield;
				Promise.resolve(overloaded ? value.v : value).then(function(arg) {
					if (overloaded) {
						var nextKey = "return" === key ? "return" : "next";
						if (!value.k || arg.done) return resume(nextKey, arg);
						arg = gen[nextKey](arg).value;
					}
					settle(result.done ? "return" : "normal", arg);
				}, function(err) {
					resume("throw", err);
				});
			} catch (err) {
				settle("throw", err);
			}
		}
		function settle(type, value) {
			switch (type) {
				case "return":
					front.resolve({
						value,
						done: !0
					});
					break;
				case "throw":
					front.reject(value);
					break;
				default: front.resolve({
					value,
					done: !1
				});
			}
			(front = front.next) ? resume(front.key, front.arg) : back = null;
		}
		this._invoke = function(key, arg) {
			return new Promise(function(resolve, reject) {
				var request = {
					key,
					arg,
					resolve,
					reject,
					next: null
				};
				back ? back = back.next = request : (front = back = request, resume(key, arg));
			});
		}, "function" != typeof gen["return"] && (this["return"] = void 0);
	}
	_AsyncGenerator.prototype["function" == typeof Symbol && Symbol.asyncIterator || "@@asyncIterator"] = function() {
		return this;
	}, _AsyncGenerator.prototype.next = function(arg) {
		return this._invoke("next", arg);
	}, _AsyncGenerator.prototype["throw"] = function(arg) {
		return this._invoke("throw", arg);
	}, _AsyncGenerator.prototype["return"] = function(arg) {
		return this._invoke("return", arg);
	};
	function _OverloadYield(value, kind) {
		this.v = value, this.k = kind;
	}
	var WidgetApiResponseError = /* @__PURE__ */ function(_Error) {
		_inherits(WidgetApiResponseError, _Error);
		var _super = _createSuper(WidgetApiResponseError);
		function WidgetApiResponseError(message, data) {
			var _this2;
			_classCallCheck(this, WidgetApiResponseError);
			_this2 = _super.call(this, message);
			_this2.data = data;
			return _this2;
		}
		return _createClass(WidgetApiResponseError);
	}(/* @__PURE__ */ _wrapNativeSuper(Error));
	/**
	* API handler for widgets. This raises events for each action
	* received as `action:${action}` (eg: "action:screenshot").
	* Default handling can be prevented by using preventDefault()
	* on the raised event. The default handling varies for each
	* action: ones which the SDK can handle safely are acknowledged
	* appropriately and ones which are unhandled (custom or require
	* the widget to do something) are rejected with an error.
	*
	* Events which are preventDefault()ed must reply using the
	* transport. The events raised will have a detail of an
	* IWidgetApiRequest interface.
	*
	* When the WidgetApi is ready to start sending requests, it will
	* raise a "ready" CustomEvent. After the ready event fires, actions
	* can be sent and the transport will be ready.
	*/
	exports.WidgetApiResponseError = WidgetApiResponseError;
	WidgetApiResponseError.prototype.name = WidgetApiResponseError.name;
	exports.WidgetApi = /* @__PURE__ */ function(_EventEmitter) {
		_inherits(WidgetApi, _EventEmitter);
		var _super2 = _createSuper(WidgetApi);
		/**
		* Creates a new API handler for the given widget.
		* @param {string} widgetId The widget ID to listen for. If not supplied then
		* the API will use the widget ID from the first valid request it receives.
		* @param {string} clientOrigin The origin of the client, or null if not known.
		*/
		function WidgetApi() {
			var _this3;
			var widgetId = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null;
			var clientOrigin = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
			_classCallCheck(this, WidgetApi);
			_this3 = _super2.call(this);
			_defineProperty(_assertThisInitialized(_this3), "transport", void 0);
			_defineProperty(_assertThisInitialized(_this3), "capabilitiesFinished", false);
			_defineProperty(_assertThisInitialized(_this3), "supportsMSC2974Renegotiate", false);
			_defineProperty(_assertThisInitialized(_this3), "requestedCapabilities", []);
			_defineProperty(_assertThisInitialized(_this3), "approvedCapabilities", void 0);
			_defineProperty(_assertThisInitialized(_this3), "cachedClientVersions", void 0);
			_defineProperty(_assertThisInitialized(_this3), "turnServerWatchers", 0);
			if (!globalThis.parent) throw new Error("No parent window. This widget doesn't appear to be embedded properly.");
			_this3.transport = new _PostmessageTransport.PostmessageTransport(_WidgetApiDirection.WidgetApiDirection.FromWidget, widgetId, globalThis.parent, globalThis);
			_this3.transport.targetOrigin = clientOrigin;
			_this3.transport.on("message", _this3.handleMessage.bind(_assertThisInitialized(_this3)));
			return _this3;
		}
		/**
		* Determines if the widget was granted a particular capability. Note that on
		* clients where the capabilities are not fed back to the widget this function
		* will rely on requested capabilities instead.
		* @param {Capability} capability The capability to check for approval of.
		* @returns {boolean} True if the widget has approval for the given capability.
		*/
		_createClass(WidgetApi, [
			{
				key: "hasCapability",
				value: function hasCapability(capability) {
					if (Array.isArray(this.approvedCapabilities)) return this.approvedCapabilities.includes(capability);
					return this.requestedCapabilities.includes(capability);
				}
			},
			{
				key: "requestCapability",
				value: function requestCapability(capability) {
					if (this.capabilitiesFinished && !this.supportsMSC2974Renegotiate) throw new Error("Capabilities have already been negotiated");
					this.requestedCapabilities.push(capability);
				}
			},
			{
				key: "requestCapabilities",
				value: function requestCapabilities(capabilities) {
					var _iterator = _createForOfIteratorHelper(capabilities), _step;
					try {
						for (_iterator.s(); !(_step = _iterator.n()).done;) {
							var cap = _step.value;
							this.requestCapability(cap);
						}
					} catch (err) {
						_iterator.e(err);
					} finally {
						_iterator.f();
					}
				}
			},
			{
				key: "requestCapabilityForRoomTimeline",
				value: function requestCapabilityForRoomTimeline(roomId) {
					this.requestCapability("org.matrix.msc2762.timeline:".concat(roomId));
				}
			},
			{
				key: "requestCapabilityToSendState",
				value: function requestCapabilityToSendState(eventType, stateKey) {
					this.requestCapability(_WidgetEventCapability.WidgetEventCapability.forStateEvent(_WidgetEventCapability.EventDirection.Send, eventType, stateKey).raw);
				}
			},
			{
				key: "requestCapabilityToReceiveState",
				value: function requestCapabilityToReceiveState(eventType, stateKey) {
					this.requestCapability(_WidgetEventCapability.WidgetEventCapability.forStateEvent(_WidgetEventCapability.EventDirection.Receive, eventType, stateKey).raw);
				}
			},
			{
				key: "requestCapabilityToSendToDevice",
				value: function requestCapabilityToSendToDevice(eventType) {
					this.requestCapability(_WidgetEventCapability.WidgetEventCapability.forToDeviceEvent(_WidgetEventCapability.EventDirection.Send, eventType).raw);
				}
			},
			{
				key: "requestCapabilityToReceiveToDevice",
				value: function requestCapabilityToReceiveToDevice(eventType) {
					this.requestCapability(_WidgetEventCapability.WidgetEventCapability.forToDeviceEvent(_WidgetEventCapability.EventDirection.Receive, eventType).raw);
				}
			},
			{
				key: "requestCapabilityToSendEvent",
				value: function requestCapabilityToSendEvent(eventType) {
					this.requestCapability(_WidgetEventCapability.WidgetEventCapability.forRoomEvent(_WidgetEventCapability.EventDirection.Send, eventType).raw);
				}
			},
			{
				key: "requestCapabilityToReceiveEvent",
				value: function requestCapabilityToReceiveEvent(eventType) {
					this.requestCapability(_WidgetEventCapability.WidgetEventCapability.forRoomEvent(_WidgetEventCapability.EventDirection.Receive, eventType).raw);
				}
			},
			{
				key: "requestCapabilityToSendMessage",
				value: function requestCapabilityToSendMessage(msgtype) {
					this.requestCapability(_WidgetEventCapability.WidgetEventCapability.forRoomMessageEvent(_WidgetEventCapability.EventDirection.Send, msgtype).raw);
				}
			},
			{
				key: "requestCapabilityToReceiveMessage",
				value: function requestCapabilityToReceiveMessage(msgtype) {
					this.requestCapability(_WidgetEventCapability.WidgetEventCapability.forRoomMessageEvent(_WidgetEventCapability.EventDirection.Receive, msgtype).raw);
				}
			},
			{
				key: "requestCapabilityToReceiveRoomAccountData",
				value: function requestCapabilityToReceiveRoomAccountData(eventType) {
					this.requestCapability(_WidgetEventCapability.WidgetEventCapability.forRoomAccountData(_WidgetEventCapability.EventDirection.Receive, eventType).raw);
				}
			},
			{
				key: "requestOpenIDConnectToken",
				value: function requestOpenIDConnectToken() {
					var _this4 = this;
					return new Promise(function(resolve, reject) {
						_this4.transport.sendComplete(_WidgetApiAction.WidgetApiFromWidgetAction.GetOpenIDCredentials, {}).then(function(response) {
							var rdata = response.response;
							if (rdata.state === _GetOpenIDAction.OpenIDRequestState.Allowed) resolve(rdata);
							else if (rdata.state === _GetOpenIDAction.OpenIDRequestState.Blocked) reject(/* @__PURE__ */ new Error("User declined to verify their identity"));
							else if (rdata.state === _GetOpenIDAction.OpenIDRequestState.PendingUserConfirmation) _this4.on("action:".concat(_WidgetApiAction.WidgetApiToWidgetAction.OpenIDCredentials), function handlerFn(ev) {
								ev.preventDefault();
								var request = ev.detail;
								if (request.data.original_request_id !== response.requestId) return;
								if (request.data.state === _GetOpenIDAction.OpenIDRequestState.Allowed) {
									resolve(request.data);
									_this4.transport.reply(request, {});
								} else if (request.data.state === _GetOpenIDAction.OpenIDRequestState.Blocked) {
									reject(/* @__PURE__ */ new Error("User declined to verify their identity"));
									_this4.transport.reply(request, {});
								} else {
									reject(/* @__PURE__ */ new Error("Invalid state on reply: " + rdata.state));
									_this4.transport.reply(request, { error: { message: "Invalid state" } });
								}
								_this4.off("action:".concat(_WidgetApiAction.WidgetApiToWidgetAction.OpenIDCredentials), handlerFn);
							});
							else reject(/* @__PURE__ */ new Error("Invalid state: " + rdata.state));
						})["catch"](reject);
					});
				}
			},
			{
				key: "updateRequestedCapabilities",
				value: function updateRequestedCapabilities() {
					return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.MSC2974RenegotiateCapabilities, { capabilities: this.requestedCapabilities }).then();
				}
			},
			{
				key: "sendContentLoaded",
				value: function sendContentLoaded() {
					return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.ContentLoaded, {}).then();
				}
			},
			{
				key: "sendSticker",
				value: function sendSticker(sticker) {
					return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.SendSticker, sticker).then();
				}
			},
			{
				key: "setAlwaysOnScreen",
				value: function setAlwaysOnScreen(value) {
					return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.UpdateAlwaysOnScreen, { value }).then(function(res) {
						return res.success;
					});
				}
			},
			{
				key: "openModalWidget",
				value: function openModalWidget(url, name) {
					var buttons = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [];
					var data = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {};
					var type = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : _WidgetType.MatrixWidgetType.Custom;
					return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.OpenModalWidget, {
						type,
						url,
						name,
						buttons,
						data
					}).then();
				}
			},
			{
				key: "closeModalWidget",
				value: function closeModalWidget() {
					var data = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
					return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.CloseModalWidget, data).then();
				}
			},
			{
				key: "sendRoomEvent",
				value: function sendRoomEvent(eventType, content, roomId, delay, parentDelayId, stickyDurationMs) {
					return this.sendEvent(eventType, void 0, content, roomId, delay, parentDelayId, stickyDurationMs);
				}
			},
			{
				key: "sendStateEvent",
				value: function sendStateEvent(eventType, stateKey, content, roomId, delay, parentDelayId) {
					return this.sendEvent(eventType, stateKey, content, roomId, delay, parentDelayId);
				}
			},
			{
				key: "sendEvent",
				value: function sendEvent(eventType, stateKey, content, roomId, delay, parentDelayId, stickyDurationMs) {
					return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.SendEvent, _objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread({
						type: eventType,
						content
					}, stateKey !== void 0 && { state_key: stateKey }), roomId !== void 0 && { room_id: roomId }), delay !== void 0 && { delay }), parentDelayId !== void 0 && { parent_delay_id: parentDelayId }), stickyDurationMs !== void 0 && { sticky_duration_ms: stickyDurationMs }));
				}
			},
			{
				key: "cancelScheduledDelayedEvent",
				value: function cancelScheduledDelayedEvent(delayId) {
					return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.MSC4157UpdateDelayedEvent, {
						delay_id: delayId,
						action: _UpdateDelayedEventAction.UpdateDelayedEventAction.Cancel
					});
				}
			},
			{
				key: "restartScheduledDelayedEvent",
				value: function restartScheduledDelayedEvent(delayId) {
					return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.MSC4157UpdateDelayedEvent, {
						delay_id: delayId,
						action: _UpdateDelayedEventAction.UpdateDelayedEventAction.Restart
					});
				}
			},
			{
				key: "sendScheduledDelayedEvent",
				value: function sendScheduledDelayedEvent(delayId) {
					return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.MSC4157UpdateDelayedEvent, {
						delay_id: delayId,
						action: _UpdateDelayedEventAction.UpdateDelayedEventAction.Send
					});
				}
			},
			{
				key: "sendToDevice",
				value: function sendToDevice(eventType, encrypted, contentMap) {
					return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.SendToDevice, {
						type: eventType,
						encrypted,
						messages: contentMap
					});
				}
			},
			{
				key: "readRoomAccountData",
				value: function readRoomAccountData(eventType, roomIds) {
					var data = { type: eventType };
					if (roomIds) if (roomIds.includes(_Symbols.Symbols.AnyRoom)) data.room_ids = _Symbols.Symbols.AnyRoom;
					else data.room_ids = roomIds;
					return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.BeeperReadRoomAccountData, data).then(function(r) {
						return r.events;
					});
				}
			},
			{
				key: "readRoomEvents",
				value: function readRoomEvents(eventType, limit, msgtype, roomIds, since) {
					var data = {
						type: eventType,
						msgtype
					};
					if (limit !== void 0) data.limit = limit;
					if (roomIds) if (roomIds.includes(_Symbols.Symbols.AnyRoom)) data.room_ids = _Symbols.Symbols.AnyRoom;
					else data.room_ids = roomIds;
					if (since) data.since = since;
					return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.MSC2876ReadEvents, data).then(function(r) {
						return r.events;
					});
				}
			},
			{
				key: "readEventRelations",
				value: function() {
					var _readEventRelations = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee(eventId, roomId, relationType, eventType, limit, from, to, direction) {
						var versions, data;
						return _regeneratorRuntime().wrap(function _callee$(_context) {
							while (1) switch (_context.prev = _context.next) {
								case 0:
									_context.next = 2;
									return this.getClientVersions();
								case 2:
									versions = _context.sent;
									if (versions.includes(_ApiVersion.UnstableApiVersion.MSC3869)) {
										_context.next = 5;
										break;
									}
									throw new Error("The read_relations action is not supported by the client.");
								case 5:
									data = {
										event_id: eventId,
										rel_type: relationType,
										event_type: eventType,
										room_id: roomId,
										to,
										from,
										limit,
										direction
									};
									return _context.abrupt("return", this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.MSC3869ReadRelations, data));
								case 7:
								case "end": return _context.stop();
							}
						}, _callee, this);
					}));
					function readEventRelations(_x, _x2, _x3, _x4, _x5, _x6, _x7, _x8) {
						return _readEventRelations.apply(this, arguments);
					}
					return readEventRelations;
				}()
			},
			{
				key: "readStateEvents",
				value: function readStateEvents(eventType, limit, stateKey, roomIds) {
					var data = {
						type: eventType,
						state_key: stateKey === void 0 ? true : stateKey
					};
					if (limit !== void 0) data.limit = limit;
					if (roomIds) if (roomIds.includes(_Symbols.Symbols.AnyRoom)) data.room_ids = _Symbols.Symbols.AnyRoom;
					else data.room_ids = roomIds;
					return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.MSC2876ReadEvents, data).then(function(r) {
						return r.events;
					});
				}
			},
			{
				key: "setModalButtonEnabled",
				value: function setModalButtonEnabled(buttonId, isEnabled) {
					if (buttonId === _ModalWidgetActions.BuiltInModalButtonID.Close) throw new Error("The close button cannot be disabled");
					return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.SetModalButtonEnabled, {
						button: buttonId,
						enabled: isEnabled
					}).then();
				}
			},
			{
				key: "navigateTo",
				value: function navigateTo(uri) {
					if (!uri || !uri.startsWith("https://matrix.to/#")) throw new Error("Invalid matrix.to URI");
					return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.MSC2931Navigate, { uri }).then();
				}
			},
			{
				key: "getTurnServers",
				value: function getTurnServers() {
					var _this = this;
					return _wrapAsyncGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee3() {
						var setTurnServer, onUpdateTurnServers;
						return _regeneratorRuntime().wrap(function _callee3$(_context3) {
							while (1) switch (_context3.prev = _context3.next) {
								case 0:
									onUpdateTurnServers = /* @__PURE__ */ function() {
										var _ref = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee2(ev) {
											return _regeneratorRuntime().wrap(function _callee2$(_context2) {
												while (1) switch (_context2.prev = _context2.next) {
													case 0:
														ev.preventDefault();
														setTurnServer(ev.detail.data);
														_this.transport.reply(ev.detail, {});
													case 3:
													case "end": return _context2.stop();
												}
											}, _callee2);
										}));
										return function onUpdateTurnServers(_x9) {
											return _ref.apply(this, arguments);
										};
									}();
									_this.on("action:".concat(_WidgetApiAction.WidgetApiToWidgetAction.UpdateTurnServers), onUpdateTurnServers);
									if (!(_this.turnServerWatchers === 0)) {
										_context3.next = 12;
										break;
									}
									_context3.prev = 3;
									_context3.next = 6;
									return _awaitAsyncGenerator(_this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.WatchTurnServers, {}));
								case 6:
									_context3.next = 12;
									break;
								case 8:
									_context3.prev = 8;
									_context3.t0 = _context3["catch"](3);
									_this.off("action:".concat(_WidgetApiAction.WidgetApiToWidgetAction.UpdateTurnServers), onUpdateTurnServers);
									throw _context3.t0;
								case 12:
									_this.turnServerWatchers++;
									_context3.prev = 13;
								case 14:
									_context3.next = 17;
									return _awaitAsyncGenerator(new Promise(function(resolve) {
										return setTurnServer = resolve;
									}));
								case 17:
									_context3.next = 19;
									return _context3.sent;
								case 19:
									_context3.next = 14;
									break;
								case 21:
									_context3.prev = 21;
									_this.off("action:".concat(_WidgetApiAction.WidgetApiToWidgetAction.UpdateTurnServers), onUpdateTurnServers);
									_this.turnServerWatchers--;
									if (!(_this.turnServerWatchers === 0)) {
										_context3.next = 27;
										break;
									}
									_context3.next = 27;
									return _awaitAsyncGenerator(_this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.UnwatchTurnServers, {}));
								case 27: return _context3.finish(21);
								case 28:
								case "end": return _context3.stop();
							}
						}, _callee3, null, [[3, 8], [
							13,
							,
							21,
							28
						]]);
					}))();
				}
			},
			{
				key: "searchUserDirectory",
				value: function() {
					var _searchUserDirectory = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee4(searchTerm, limit) {
						var versions, data;
						return _regeneratorRuntime().wrap(function _callee4$(_context4) {
							while (1) switch (_context4.prev = _context4.next) {
								case 0:
									_context4.next = 2;
									return this.getClientVersions();
								case 2:
									versions = _context4.sent;
									if (versions.includes(_ApiVersion.UnstableApiVersion.MSC3973)) {
										_context4.next = 5;
										break;
									}
									throw new Error("The user_directory_search action is not supported by the client.");
								case 5:
									data = {
										search_term: searchTerm,
										limit
									};
									return _context4.abrupt("return", this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.MSC3973UserDirectorySearch, data));
								case 7:
								case "end": return _context4.stop();
							}
						}, _callee4, this);
					}));
					function searchUserDirectory(_x10, _x11) {
						return _searchUserDirectory.apply(this, arguments);
					}
					return searchUserDirectory;
				}()
			},
			{
				key: "getMediaConfig",
				value: function() {
					var _getMediaConfig = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee5() {
						var versions, data;
						return _regeneratorRuntime().wrap(function _callee5$(_context5) {
							while (1) switch (_context5.prev = _context5.next) {
								case 0:
									_context5.next = 2;
									return this.getClientVersions();
								case 2:
									versions = _context5.sent;
									if (versions.includes(_ApiVersion.UnstableApiVersion.MSC4039)) {
										_context5.next = 5;
										break;
									}
									throw new Error("The get_media_config action is not supported by the client.");
								case 5:
									data = {};
									return _context5.abrupt("return", this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.MSC4039GetMediaConfigAction, data));
								case 7:
								case "end": return _context5.stop();
							}
						}, _callee5, this);
					}));
					function getMediaConfig() {
						return _getMediaConfig.apply(this, arguments);
					}
					return getMediaConfig;
				}()
			},
			{
				key: "uploadFile",
				value: function() {
					var _uploadFile = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee6(file) {
						var versions, data;
						return _regeneratorRuntime().wrap(function _callee6$(_context6) {
							while (1) switch (_context6.prev = _context6.next) {
								case 0:
									_context6.next = 2;
									return this.getClientVersions();
								case 2:
									versions = _context6.sent;
									if (versions.includes(_ApiVersion.UnstableApiVersion.MSC4039)) {
										_context6.next = 5;
										break;
									}
									throw new Error("The upload_file action is not supported by the client.");
								case 5:
									data = { file };
									return _context6.abrupt("return", this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.MSC4039UploadFileAction, data));
								case 7:
								case "end": return _context6.stop();
							}
						}, _callee6, this);
					}));
					function uploadFile(_x12) {
						return _uploadFile.apply(this, arguments);
					}
					return uploadFile;
				}()
			},
			{
				key: "downloadFile",
				value: function() {
					var _downloadFile = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee7(contentUri) {
						var versions, data;
						return _regeneratorRuntime().wrap(function _callee7$(_context7) {
							while (1) switch (_context7.prev = _context7.next) {
								case 0:
									_context7.next = 2;
									return this.getClientVersions();
								case 2:
									versions = _context7.sent;
									if (versions.includes(_ApiVersion.UnstableApiVersion.MSC4039)) {
										_context7.next = 5;
										break;
									}
									throw new Error("The download_file action is not supported by the client.");
								case 5:
									data = { content_uri: contentUri };
									return _context7.abrupt("return", this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.MSC4039DownloadFileAction, data));
								case 7:
								case "end": return _context7.stop();
							}
						}, _callee7, this);
					}));
					function downloadFile(_x13) {
						return _downloadFile.apply(this, arguments);
					}
					return downloadFile;
				}()
			},
			{
				key: "start",
				value: function start() {
					var _this5 = this;
					this.transport.start();
					this.getClientVersions().then(function(v) {
						if (v.includes(_ApiVersion.UnstableApiVersion.MSC2974)) _this5.supportsMSC2974Renegotiate = true;
					});
				}
			},
			{
				key: "handleMessage",
				value: function handleMessage(ev) {
					var actionEv = new CustomEvent("action:".concat(ev.detail.action), {
						detail: ev.detail,
						cancelable: true
					});
					this.emit("action:".concat(ev.detail.action), actionEv);
					if (!actionEv.defaultPrevented) switch (ev.detail.action) {
						case _WidgetApiAction.WidgetApiToWidgetAction.SupportedApiVersions: return this.replyVersions(ev.detail);
						case _WidgetApiAction.WidgetApiToWidgetAction.Capabilities: return this.handleCapabilities(ev.detail);
						case _WidgetApiAction.WidgetApiToWidgetAction.UpdateVisibility: return this.transport.reply(ev.detail, {});
						case _WidgetApiAction.WidgetApiToWidgetAction.NotifyCapabilities: return this.transport.reply(ev.detail, {});
						default: return this.transport.reply(ev.detail, { error: { message: "Unknown or unsupported to-widget action: " + ev.detail.action } });
					}
				}
			},
			{
				key: "replyVersions",
				value: function replyVersions(request) {
					this.transport.reply(request, { supported_versions: _ApiVersion.CurrentApiVersions });
				}
			},
			{
				key: "getClientVersions",
				value: function getClientVersions() {
					var _this6 = this;
					if (Array.isArray(this.cachedClientVersions)) return Promise.resolve(this.cachedClientVersions);
					return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.SupportedApiVersions, {}).then(function(r) {
						_this6.cachedClientVersions = r.supported_versions;
						return r.supported_versions;
					})["catch"](function(e) {
						console.warn("non-fatal error getting supported client versions: ", e);
						return [];
					});
				}
			},
			{
				key: "handleCapabilities",
				value: function handleCapabilities(request) {
					var _this7 = this;
					if (this.capabilitiesFinished) return this.transport.reply(request, { error: { message: "Capability negotiation already completed" } });
					return this.getClientVersions().then(function(v) {
						if (v.includes(_ApiVersion.UnstableApiVersion.MSC2871)) _this7.once("action:".concat(_WidgetApiAction.WidgetApiToWidgetAction.NotifyCapabilities), function(ev) {
							_this7.approvedCapabilities = ev.detail.data.approved;
							_this7.emit("ready");
						});
						else _this7.emit("ready");
						_this7.capabilitiesFinished = true;
						return _this7.transport.reply(request, { capabilities: _this7.requestedCapabilities });
					});
				}
			}
		]);
		return WidgetApi;
	}(_events$1.EventEmitter);
}));
//#endregion
//#region node_modules/matrix-widget-api/lib/interfaces/Capabilities.js
var require_Capabilities = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.VideoConferenceCapabilities = exports.StickerpickerCapabilities = exports.MatrixCapabilities = void 0;
	exports.getTimelineRoomIDFromCapability = getTimelineRoomIDFromCapability;
	exports.isTimelineCapability = isTimelineCapability;
	exports.isTimelineCapabilityFor = isTimelineCapabilityFor;
	var MatrixCapabilities = /* @__PURE__ */ function(MatrixCapabilities) {
		MatrixCapabilities["Screenshots"] = "m.capability.screenshot";
		MatrixCapabilities["StickerSending"] = "m.sticker";
		MatrixCapabilities["AlwaysOnScreen"] = "m.always_on_screen";
		MatrixCapabilities["RequiresClient"] = "io.element.requires_client";
		MatrixCapabilities["MSC2931Navigate"] = "org.matrix.msc2931.navigate";
		MatrixCapabilities["MSC3846TurnServers"] = "town.robin.msc3846.turn_servers";
		MatrixCapabilities["MSC3973UserDirectorySearch"] = "org.matrix.msc3973.user_directory_search";
		MatrixCapabilities["MSC4039UploadFile"] = "org.matrix.msc4039.upload_file";
		MatrixCapabilities["MSC4039DownloadFile"] = "org.matrix.msc4039.download_file";
		MatrixCapabilities["MSC4157SendDelayedEvent"] = "org.matrix.msc4157.send.delayed_event";
		MatrixCapabilities["MSC4157UpdateDelayedEvent"] = "org.matrix.msc4157.update_delayed_event";
		MatrixCapabilities["MSC4407SendStickyEvent"] = "org.matrix.msc4407.send.sticky_event";
		MatrixCapabilities["MSC4407ReceiveStickyEvent"] = "org.matrix.msc4407.receive.sticky_event";
		return MatrixCapabilities;
	}({});
	exports.MatrixCapabilities = MatrixCapabilities;
	exports.StickerpickerCapabilities = [MatrixCapabilities.StickerSending];
	/**
	* Determines if a capability is a capability for a timeline.
	* @param {Capability} capability The capability to test.
	* @returns {boolean} True if a timeline capability, false otherwise.
	*/
	exports.VideoConferenceCapabilities = [MatrixCapabilities.AlwaysOnScreen];
	function isTimelineCapability(capability) {
		return capability === null || capability === void 0 ? void 0 : capability.startsWith("org.matrix.msc2762.timeline:");
	}
	/**
	* Determines if a capability is a timeline capability for the given room.
	* @param {Capability} capability The capability to test.
	* @param {string | Symbols.AnyRoom} roomId The room ID, or `Symbols.AnyRoom` for that designation.
	* @returns {boolean} True if a matching capability, false otherwise.
	*/
	function isTimelineCapabilityFor(capability, roomId) {
		return capability === "org.matrix.msc2762.timeline:".concat(roomId);
	}
	/**
	* Gets the room ID described by a timeline capability.
	* @param {string} capability The capability to parse.
	* @returns {string} The room ID.
	*/
	function getTimelineRoomIDFromCapability(capability) {
		return capability.substring(capability.indexOf(":") + 1);
	}
}));
//#endregion
//#region node_modules/matrix-widget-api/lib/util/SimpleObservable.js
var require_SimpleObservable = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SimpleObservable = void 0;
	function _typeof(obj) {
		"@babel/helpers - typeof";
		return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
			return typeof obj;
		} : function(obj) {
			return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
		}, _typeof(obj);
	}
	function _createForOfIteratorHelper(o, allowArrayLike) {
		var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
		if (!it) {
			if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
				if (it) o = it;
				var i = 0;
				var F = function F() {};
				return {
					s: F,
					n: function n() {
						if (i >= o.length) return { done: true };
						return {
							done: false,
							value: o[i++]
						};
					},
					e: function e(_e) {
						throw _e;
					},
					f: F
				};
			}
			throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
		}
		var normalCompletion = true, didErr = false, err;
		return {
			s: function s() {
				it = it.call(o);
			},
			n: function n() {
				var step = it.next();
				normalCompletion = step.done;
				return step;
			},
			e: function e(_e2) {
				didErr = true;
				err = _e2;
			},
			f: function f() {
				try {
					if (!normalCompletion && it["return"] != null) it["return"]();
				} finally {
					if (didErr) throw err;
				}
			}
		};
	}
	function _unsupportedIterableToArray(o, minLen) {
		if (!o) return;
		if (typeof o === "string") return _arrayLikeToArray(o, minLen);
		var n = Object.prototype.toString.call(o).slice(8, -1);
		if (n === "Object" && o.constructor) n = o.constructor.name;
		if (n === "Map" || n === "Set") return Array.from(o);
		if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
	}
	function _arrayLikeToArray(arr, len) {
		if (len == null || len > arr.length) len = arr.length;
		for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
		return arr2;
	}
	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
	}
	function _defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ("value" in descriptor) descriptor.writable = true;
			Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
		}
	}
	function _createClass(Constructor, protoProps, staticProps) {
		if (protoProps) _defineProperties(Constructor.prototype, protoProps);
		if (staticProps) _defineProperties(Constructor, staticProps);
		Object.defineProperty(Constructor, "prototype", { writable: false });
		return Constructor;
	}
	function _defineProperty(obj, key, value) {
		key = _toPropertyKey(key);
		if (key in obj) Object.defineProperty(obj, key, {
			value,
			enumerable: true,
			configurable: true,
			writable: true
		});
		else obj[key] = value;
		return obj;
	}
	function _toPropertyKey(arg) {
		var key = _toPrimitive(arg, "string");
		return _typeof(key) === "symbol" ? key : String(key);
	}
	function _toPrimitive(input, hint) {
		if (_typeof(input) !== "object" || input === null) return input;
		var prim = input[Symbol.toPrimitive];
		if (prim !== void 0) {
			var res = prim.call(input, hint || "default");
			if (_typeof(res) !== "object") return res;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return (hint === "string" ? String : Number)(input);
	}
	exports.SimpleObservable = /* @__PURE__ */ function() {
		function SimpleObservable(initialFn) {
			_classCallCheck(this, SimpleObservable);
			_defineProperty(this, "listeners", []);
			if (initialFn) this.listeners.push(initialFn);
		}
		_createClass(SimpleObservable, [
			{
				key: "onUpdate",
				value: function onUpdate(fn) {
					this.listeners.push(fn);
				}
			},
			{
				key: "update",
				value: function update(val) {
					var _iterator = _createForOfIteratorHelper(this.listeners), _step;
					try {
						for (_iterator.s(); !(_step = _iterator.n()).done;) {
							var listener = _step.value;
							listener(val);
						}
					} catch (err) {
						_iterator.e(err);
					} finally {
						_iterator.f();
					}
				}
			},
			{
				key: "close",
				value: function close() {
					this.listeners = [];
				}
			}
		]);
		return SimpleObservable;
	}();
}));
//#endregion
//#region node_modules/matrix-widget-api/lib/ClientWidgetApi.js
var require_ClientWidgetApi = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ClientWidgetApi = void 0;
	var _events = __require("events");
	var _PostmessageTransport = require_PostmessageTransport();
	var _WidgetApiDirection = require_WidgetApiDirection();
	var _WidgetApiAction = require_WidgetApiAction();
	var _Capabilities = require_Capabilities();
	var _ApiVersion = require_ApiVersion();
	var _WidgetEventCapability = require_WidgetEventCapability();
	var _GetOpenIDAction = require_GetOpenIDAction();
	var _SimpleObservable = require_SimpleObservable();
	var _Symbols = require_Symbols();
	var _UpdateDelayedEventAction = require_UpdateDelayedEventAction();
	function _typeof(obj) {
		"@babel/helpers - typeof";
		return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
			return typeof obj;
		} : function(obj) {
			return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
		}, _typeof(obj);
	}
	function ownKeys(object, enumerableOnly) {
		var keys = Object.keys(object);
		if (Object.getOwnPropertySymbols) {
			var symbols = Object.getOwnPropertySymbols(object);
			enumerableOnly && (symbols = symbols.filter(function(sym) {
				return Object.getOwnPropertyDescriptor(object, sym).enumerable;
			})), keys.push.apply(keys, symbols);
		}
		return keys;
	}
	function _objectSpread(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = null != arguments[i] ? arguments[i] : {};
			i % 2 ? ownKeys(Object(source), !0).forEach(function(key) {
				_defineProperty(target, key, source[key]);
			}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
				Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
			});
		}
		return target;
	}
	function _createForOfIteratorHelper(o, allowArrayLike) {
		var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
		if (!it) {
			if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
				if (it) o = it;
				var i = 0;
				var F = function F() {};
				return {
					s: F,
					n: function n() {
						if (i >= o.length) return { done: true };
						return {
							done: false,
							value: o[i++]
						};
					},
					e: function e(_e) {
						throw _e;
					},
					f: F
				};
			}
			throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
		}
		var normalCompletion = true, didErr = false, err;
		return {
			s: function s() {
				it = it.call(o);
			},
			n: function n() {
				var step = it.next();
				normalCompletion = step.done;
				return step;
			},
			e: function e(_e2) {
				didErr = true;
				err = _e2;
			},
			f: function f() {
				try {
					if (!normalCompletion && it["return"] != null) it["return"]();
				} finally {
					if (didErr) throw err;
				}
			}
		};
	}
	function _toConsumableArray(arr) {
		return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
	}
	function _nonIterableSpread() {
		throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}
	function _unsupportedIterableToArray(o, minLen) {
		if (!o) return;
		if (typeof o === "string") return _arrayLikeToArray(o, minLen);
		var n = Object.prototype.toString.call(o).slice(8, -1);
		if (n === "Object" && o.constructor) n = o.constructor.name;
		if (n === "Map" || n === "Set") return Array.from(o);
		if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
	}
	function _iterableToArray(iter) {
		if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
	}
	function _arrayWithoutHoles(arr) {
		if (Array.isArray(arr)) return _arrayLikeToArray(arr);
	}
	function _arrayLikeToArray(arr, len) {
		if (len == null || len > arr.length) len = arr.length;
		for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
		return arr2;
	}
	function _regeneratorRuntime() {
		"use strict";
		/*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() {
			return exports$1;
		};
		var exports$1 = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function(obj, key, desc) {
			obj[key] = desc.value;
		}, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
		function define(obj, key, value) {
			return Object.defineProperty(obj, key, {
				value,
				enumerable: !0,
				configurable: !0,
				writable: !0
			}), obj[key];
		}
		try {
			define({}, "");
		} catch (err) {
			define = function define(obj, key, value) {
				return obj[key] = value;
			};
		}
		function wrap(innerFn, outerFn, self, tryLocsList) {
			var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype);
			return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, new Context(tryLocsList || [])) }), generator;
		}
		function tryCatch(fn, obj, arg) {
			try {
				return {
					type: "normal",
					arg: fn.call(obj, arg)
				};
			} catch (err) {
				return {
					type: "throw",
					arg: err
				};
			}
		}
		exports$1.wrap = wrap;
		var ContinueSentinel = {};
		function Generator() {}
		function GeneratorFunction() {}
		function GeneratorFunctionPrototype() {}
		var IteratorPrototype = {};
		define(IteratorPrototype, iteratorSymbol, function() {
			return this;
		});
		var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([])));
		NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype);
		var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
		function defineIteratorMethods(prototype) {
			[
				"next",
				"throw",
				"return"
			].forEach(function(method) {
				define(prototype, method, function(arg) {
					return this._invoke(method, arg);
				});
			});
		}
		function AsyncIterator(generator, PromiseImpl) {
			function invoke(method, arg, resolve, reject) {
				var record = tryCatch(generator[method], generator, arg);
				if ("throw" !== record.type) {
					var result = record.arg, value = result.value;
					return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function(value) {
						invoke("next", value, resolve, reject);
					}, function(err) {
						invoke("throw", err, resolve, reject);
					}) : PromiseImpl.resolve(value).then(function(unwrapped) {
						result.value = unwrapped, resolve(result);
					}, function(error) {
						return invoke("throw", error, resolve, reject);
					});
				}
				reject(record.arg);
			}
			var previousPromise;
			defineProperty(this, "_invoke", { value: function value(method, arg) {
				function callInvokeWithMethodAndArg() {
					return new PromiseImpl(function(resolve, reject) {
						invoke(method, arg, resolve, reject);
					});
				}
				return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
			} });
		}
		function makeInvokeMethod(innerFn, self, context) {
			var state = "suspendedStart";
			return function(method, arg) {
				if ("executing" === state) throw new Error("Generator is already running");
				if ("completed" === state) {
					if ("throw" === method) throw arg;
					return doneResult();
				}
				for (context.method = method, context.arg = arg;;) {
					var delegate = context.delegate;
					if (delegate) {
						var delegateResult = maybeInvokeDelegate(delegate, context);
						if (delegateResult) {
							if (delegateResult === ContinueSentinel) continue;
							return delegateResult;
						}
					}
					if ("next" === context.method) context.sent = context._sent = context.arg;
					else if ("throw" === context.method) {
						if ("suspendedStart" === state) throw state = "completed", context.arg;
						context.dispatchException(context.arg);
					} else "return" === context.method && context.abrupt("return", context.arg);
					state = "executing";
					var record = tryCatch(innerFn, self, context);
					if ("normal" === record.type) {
						if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue;
						return {
							value: record.arg,
							done: context.done
						};
					}
					"throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg);
				}
			};
		}
		function maybeInvokeDelegate(delegate, context) {
			var methodName = context.method, method = delegate.iterator[methodName];
			if (void 0 === method) return context.delegate = null, "throw" === methodName && delegate.iterator["return"] && (context.method = "return", context.arg = void 0, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = /* @__PURE__ */ new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel;
			var record = tryCatch(method, delegate.iterator, context.arg);
			if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel;
			var info = record.arg;
			return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = void 0), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = /* @__PURE__ */ new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel);
		}
		function pushTryEntry(locs) {
			var entry = { tryLoc: locs[0] };
			1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry);
		}
		function resetTryEntry(entry) {
			var record = entry.completion || {};
			record.type = "normal", delete record.arg, entry.completion = record;
		}
		function Context(tryLocsList) {
			this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0);
		}
		function values(iterable) {
			if (iterable) {
				var iteratorMethod = iterable[iteratorSymbol];
				if (iteratorMethod) return iteratorMethod.call(iterable);
				if ("function" == typeof iterable.next) return iterable;
				if (!isNaN(iterable.length)) {
					var i = -1, next = function next() {
						for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next;
						return next.value = void 0, next.done = !0, next;
					};
					return next.next = next;
				}
			}
			return { next: doneResult };
		}
		function doneResult() {
			return {
				value: void 0,
				done: !0
			};
		}
		return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", {
			value: GeneratorFunctionPrototype,
			configurable: !0
		}), defineProperty(GeneratorFunctionPrototype, "constructor", {
			value: GeneratorFunction,
			configurable: !0
		}), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports$1.isGeneratorFunction = function(genFun) {
			var ctor = "function" == typeof genFun && genFun.constructor;
			return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name));
		}, exports$1.mark = function(genFun) {
			return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun;
		}, exports$1.awrap = function(arg) {
			return { __await: arg };
		}, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function() {
			return this;
		}), exports$1.AsyncIterator = AsyncIterator, exports$1.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
			void 0 === PromiseImpl && (PromiseImpl = Promise);
			var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
			return exports$1.isGeneratorFunction(outerFn) ? iter : iter.next().then(function(result) {
				return result.done ? result.value : iter.next();
			});
		}, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function() {
			return this;
		}), define(Gp, "toString", function() {
			return "[object Generator]";
		}), exports$1.keys = function(val) {
			var object = Object(val), keys = [];
			for (var key in object) keys.push(key);
			return keys.reverse(), function next() {
				for (; keys.length;) {
					var key = keys.pop();
					if (key in object) return next.value = key, next.done = !1, next;
				}
				return next.done = !0, next;
			};
		}, exports$1.values = values, Context.prototype = {
			constructor: Context,
			reset: function reset(skipTempReset) {
				if (this.prev = 0, this.next = 0, this.sent = this._sent = void 0, this.done = !1, this.delegate = null, this.method = "next", this.arg = void 0, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = void 0);
			},
			stop: function stop() {
				this.done = !0;
				var rootRecord = this.tryEntries[0].completion;
				if ("throw" === rootRecord.type) throw rootRecord.arg;
				return this.rval;
			},
			dispatchException: function dispatchException(exception) {
				if (this.done) throw exception;
				var context = this;
				function handle(loc, caught) {
					return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = void 0), !!caught;
				}
				for (var i = this.tryEntries.length - 1; i >= 0; --i) {
					var entry = this.tryEntries[i], record = entry.completion;
					if ("root" === entry.tryLoc) return handle("end");
					if (entry.tryLoc <= this.prev) {
						var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc");
						if (hasCatch && hasFinally) {
							if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
							if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
						} else if (hasCatch) {
							if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
						} else {
							if (!hasFinally) throw new Error("try statement without catch or finally");
							if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
						}
					}
				}
			},
			abrupt: function abrupt(type, arg) {
				for (var i = this.tryEntries.length - 1; i >= 0; --i) {
					var entry = this.tryEntries[i];
					if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
						var finallyEntry = entry;
						break;
					}
				}
				finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null);
				var record = finallyEntry ? finallyEntry.completion : {};
				return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record);
			},
			complete: function complete(record, afterLoc) {
				if ("throw" === record.type) throw record.arg;
				return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel;
			},
			finish: function finish(finallyLoc) {
				for (var i = this.tryEntries.length - 1; i >= 0; --i) {
					var entry = this.tryEntries[i];
					if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
				}
			},
			"catch": function _catch(tryLoc) {
				for (var i = this.tryEntries.length - 1; i >= 0; --i) {
					var entry = this.tryEntries[i];
					if (entry.tryLoc === tryLoc) {
						var record = entry.completion;
						if ("throw" === record.type) {
							var thrown = record.arg;
							resetTryEntry(entry);
						}
						return thrown;
					}
				}
				throw new Error("illegal catch attempt");
			},
			delegateYield: function delegateYield(iterable, resultName, nextLoc) {
				return this.delegate = {
					iterator: values(iterable),
					resultName,
					nextLoc
				}, "next" === this.method && (this.arg = void 0), ContinueSentinel;
			}
		}, exports$1;
	}
	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
		try {
			var info = gen[key](arg);
			var value = info.value;
		} catch (error) {
			reject(error);
			return;
		}
		if (info.done) resolve(value);
		else Promise.resolve(value).then(_next, _throw);
	}
	function _asyncToGenerator(fn) {
		return function() {
			var self = this, args = arguments;
			return new Promise(function(resolve, reject) {
				var gen = fn.apply(self, args);
				function _next(value) {
					asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
				}
				function _throw(err) {
					asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
				}
				_next(void 0);
			});
		};
	}
	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
	}
	function _defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ("value" in descriptor) descriptor.writable = true;
			Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
		}
	}
	function _createClass(Constructor, protoProps, staticProps) {
		if (protoProps) _defineProperties(Constructor.prototype, protoProps);
		if (staticProps) _defineProperties(Constructor, staticProps);
		Object.defineProperty(Constructor, "prototype", { writable: false });
		return Constructor;
	}
	function _inherits(subClass, superClass) {
		if (typeof superClass !== "function" && superClass !== null) throw new TypeError("Super expression must either be null or a function");
		subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: {
			value: subClass,
			writable: true,
			configurable: true
		} });
		Object.defineProperty(subClass, "prototype", { writable: false });
		if (superClass) _setPrototypeOf(subClass, superClass);
	}
	function _setPrototypeOf(o, p) {
		_setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
			o.__proto__ = p;
			return o;
		};
		return _setPrototypeOf(o, p);
	}
	function _createSuper(Derived) {
		var hasNativeReflectConstruct = _isNativeReflectConstruct();
		return function _createSuperInternal() {
			var Super = _getPrototypeOf(Derived), result;
			if (hasNativeReflectConstruct) {
				var NewTarget = _getPrototypeOf(this).constructor;
				result = Reflect.construct(Super, arguments, NewTarget);
			} else result = Super.apply(this, arguments);
			return _possibleConstructorReturn(this, result);
		};
	}
	function _possibleConstructorReturn(self, call) {
		if (call && (_typeof(call) === "object" || typeof call === "function")) return call;
		else if (call !== void 0) throw new TypeError("Derived constructors may only return object or undefined");
		return _assertThisInitialized(self);
	}
	function _assertThisInitialized(self) {
		if (self === void 0) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
		return self;
	}
	function _isNativeReflectConstruct() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	function _getPrototypeOf(o) {
		_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
			return o.__proto__ || Object.getPrototypeOf(o);
		};
		return _getPrototypeOf(o);
	}
	function _defineProperty(obj, key, value) {
		key = _toPropertyKey(key);
		if (key in obj) Object.defineProperty(obj, key, {
			value,
			enumerable: true,
			configurable: true,
			writable: true
		});
		else obj[key] = value;
		return obj;
	}
	function _toPropertyKey(arg) {
		var key = _toPrimitive(arg, "string");
		return _typeof(key) === "symbol" ? key : String(key);
	}
	function _toPrimitive(input, hint) {
		if (_typeof(input) !== "object" || input === null) return input;
		var prim = input[Symbol.toPrimitive];
		if (prim !== void 0) {
			var res = prim.call(input, hint || "default");
			if (_typeof(res) !== "object") return res;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return (hint === "string" ? String : Number)(input);
	}
	function _asyncIterator(iterable) {
		var method, async, sync, retry = 2;
		for ("undefined" != typeof Symbol && (async = Symbol.asyncIterator, sync = Symbol.iterator); retry--;) {
			if (async && null != (method = iterable[async])) return method.call(iterable);
			if (sync && null != (method = iterable[sync])) return new AsyncFromSyncIterator(method.call(iterable));
			async = "@@asyncIterator", sync = "@@iterator";
		}
		throw new TypeError("Object is not async iterable");
	}
	function AsyncFromSyncIterator(s) {
		function AsyncFromSyncIteratorContinuation(r) {
			if (Object(r) !== r) return Promise.reject(/* @__PURE__ */ new TypeError(r + " is not an object."));
			var done = r.done;
			return Promise.resolve(r.value).then(function(value) {
				return {
					value,
					done
				};
			});
		}
		return AsyncFromSyncIterator = function AsyncFromSyncIterator(s) {
			this.s = s, this.n = s.next;
		}, AsyncFromSyncIterator.prototype = {
			s: null,
			n: null,
			next: function next() {
				return AsyncFromSyncIteratorContinuation(this.n.apply(this.s, arguments));
			},
			"return": function _return(value) {
				var ret = this.s["return"];
				return void 0 === ret ? Promise.resolve({
					value,
					done: !0
				}) : AsyncFromSyncIteratorContinuation(ret.apply(this.s, arguments));
			},
			"throw": function _throw(value) {
				var thr = this.s["return"];
				return void 0 === thr ? Promise.reject(value) : AsyncFromSyncIteratorContinuation(thr.apply(this.s, arguments));
			}
		}, new AsyncFromSyncIterator(s);
	}
	exports.ClientWidgetApi = /* @__PURE__ */ function(_EventEmitter) {
		_inherits(ClientWidgetApi, _EventEmitter);
		var _super = _createSuper(ClientWidgetApi);
		/**
		* Creates a new client widget API. This will instantiate the transport
		* and start everything. When the iframe is loaded under the widget's
		* conditions, a "ready" event will be raised.
		* @param {Widget} widget The widget to communicate with.
		* @param {HTMLIFrameElement} iframe The iframe the widget is in.
		* @param {WidgetDriver} driver The driver for this widget/client.
		*/
		function ClientWidgetApi(widget, iframe, driver) {
			var _this;
			_classCallCheck(this, ClientWidgetApi);
			_this = _super.call(this);
			_this.widget = widget;
			_this.driver = driver;
			_defineProperty(_assertThisInitialized(_this), "transport", void 0);
			_defineProperty(_assertThisInitialized(_this), "cachedWidgetVersions", null);
			_defineProperty(_assertThisInitialized(_this), "contentLoadedActionSent", false);
			_defineProperty(_assertThisInitialized(_this), "allowedCapabilities", /* @__PURE__ */ new Set());
			_defineProperty(_assertThisInitialized(_this), "allowedEvents", []);
			_defineProperty(_assertThisInitialized(_this), "isStopped", false);
			_defineProperty(_assertThisInitialized(_this), "turnServers", null);
			_defineProperty(_assertThisInitialized(_this), "contentLoadedWaitTimer", void 0);
			_defineProperty(_assertThisInitialized(_this), "pushRoomStateTasks", /* @__PURE__ */ new Set());
			_defineProperty(_assertThisInitialized(_this), "pushRoomStateResult", /* @__PURE__ */ new Map());
			_defineProperty(_assertThisInitialized(_this), "flushRoomStateTask", null);
			_defineProperty(_assertThisInitialized(_this), "viewedRoomId", null);
			if (!(iframe !== null && iframe !== void 0 && iframe.contentWindow)) throw new Error("No iframe supplied");
			if (!widget) throw new Error("Invalid widget");
			if (!driver) throw new Error("Invalid driver");
			_this.transport = new _PostmessageTransport.PostmessageTransport(_WidgetApiDirection.WidgetApiDirection.ToWidget, widget.id, iframe.contentWindow, globalThis);
			_this.transport.targetOrigin = widget.origin;
			_this.transport.on("message", _this.handleMessage.bind(_assertThisInitialized(_this)));
			iframe.addEventListener("load", _this.onIframeLoad.bind(_assertThisInitialized(_this)));
			_this.transport.start();
			return _this;
		}
		_createClass(ClientWidgetApi, [
			{
				key: "hasCapability",
				value: function hasCapability(capability) {
					return this.allowedCapabilities.has(capability);
				}
			},
			{
				key: "canUseRoomTimeline",
				value: function canUseRoomTimeline(roomId) {
					return this.hasCapability("org.matrix.msc2762.timeline:".concat(_Symbols.Symbols.AnyRoom)) || this.hasCapability("org.matrix.msc2762.timeline:".concat(roomId));
				}
			},
			{
				key: "canSendRoomEvent",
				value: function canSendRoomEvent(eventType) {
					var msgtype = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
					return this.allowedEvents.some(function(e) {
						return e.matchesAsRoomEvent(_WidgetEventCapability.EventDirection.Send, eventType, msgtype);
					});
				}
			},
			{
				key: "canSendStateEvent",
				value: function canSendStateEvent(eventType, stateKey) {
					return this.allowedEvents.some(function(e) {
						return e.matchesAsStateEvent(_WidgetEventCapability.EventDirection.Send, eventType, stateKey);
					});
				}
			},
			{
				key: "canSendToDeviceEvent",
				value: function canSendToDeviceEvent(eventType) {
					return this.allowedEvents.some(function(e) {
						return e.matchesAsToDeviceEvent(_WidgetEventCapability.EventDirection.Send, eventType);
					});
				}
			},
			{
				key: "canReceiveRoomEvent",
				value: function canReceiveRoomEvent(eventType) {
					var msgtype = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
					return this.allowedEvents.some(function(e) {
						return e.matchesAsRoomEvent(_WidgetEventCapability.EventDirection.Receive, eventType, msgtype);
					});
				}
			},
			{
				key: "canReceiveStateEvent",
				value: function canReceiveStateEvent(eventType, stateKey) {
					return this.allowedEvents.some(function(e) {
						return e.matchesAsStateEvent(_WidgetEventCapability.EventDirection.Receive, eventType, stateKey);
					});
				}
			},
			{
				key: "canReceiveToDeviceEvent",
				value: function canReceiveToDeviceEvent(eventType) {
					return this.allowedEvents.some(function(e) {
						return e.matchesAsToDeviceEvent(_WidgetEventCapability.EventDirection.Receive, eventType);
					});
				}
			},
			{
				key: "canReceiveRoomAccountData",
				value: function canReceiveRoomAccountData(eventType) {
					return this.allowedEvents.some(function(e) {
						return e.matchesAsRoomAccountData(_WidgetEventCapability.EventDirection.Receive, eventType);
					});
				}
			},
			{
				key: "stop",
				value: function stop() {
					this.isStopped = true;
					this.transport.stop();
				}
			},
			{
				key: "getWidgetVersions",
				value: function() {
					var _getWidgetVersions = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee() {
						var r;
						return _regeneratorRuntime().wrap(function _callee$(_context) {
							while (1) switch (_context.prev = _context.next) {
								case 0:
									if (!Array.isArray(this.cachedWidgetVersions)) {
										_context.next = 2;
										break;
									}
									return _context.abrupt("return", this.cachedWidgetVersions);
								case 2:
									_context.prev = 2;
									_context.next = 5;
									return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.SupportedApiVersions, {});
								case 5:
									r = _context.sent;
									this.cachedWidgetVersions = r.supported_versions;
									return _context.abrupt("return", r.supported_versions);
								case 10:
									_context.prev = 10;
									_context.t0 = _context["catch"](2);
									console.warn("non-fatal error getting supported widget versions: ", _context.t0);
									return _context.abrupt("return", []);
								case 14:
								case "end": return _context.stop();
							}
						}, _callee, this, [[2, 10]]);
					}));
					function getWidgetVersions() {
						return _getWidgetVersions.apply(this, arguments);
					}
					return getWidgetVersions;
				}()
			},
			{
				key: "beginCapabilities",
				value: function beginCapabilities() {
					var _this2 = this;
					this.emit("preparing");
					var requestedCaps;
					this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.Capabilities, {}).then(function(caps) {
						requestedCaps = caps.capabilities;
						return _this2.driver.validateCapabilities(new Set(caps.capabilities));
					}).then(function(allowedCaps) {
						_this2.allowCapabilities(_toConsumableArray(allowedCaps), requestedCaps);
						_this2.emit("ready");
					})["catch"](function(e) {
						_this2.emit("error:preparing", e);
					});
				}
			},
			{
				key: "allowCapabilities",
				value: function allowCapabilities(allowed, requested) {
					var _this$allowedEvents, _this3 = this;
					console.log("Widget ".concat(this.widget.id, " is allowed capabilities:"), allowed);
					var _iterator2 = _createForOfIteratorHelper(allowed), _step2;
					try {
						for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
							var c = _step2.value;
							this.allowedCapabilities.add(c);
						}
					} catch (err) {
						_iterator2.e(err);
					} finally {
						_iterator2.f();
					}
					var allowedEvents = _WidgetEventCapability.WidgetEventCapability.findEventCapabilities(allowed);
					(_this$allowedEvents = this.allowedEvents).push.apply(_this$allowedEvents, _toConsumableArray(allowedEvents));
					this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.NotifyCapabilities, {
						requested,
						approved: Array.from(this.allowedCapabilities)
					})["catch"](function(e) {
						console.warn("non-fatal error notifying widget of approved capabilities:", e);
					}).then(function() {
						_this3.emit("capabilitiesNotified");
					});
					var _iterator3 = _createForOfIteratorHelper(allowed), _step3;
					try {
						for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
							var _c = _step3.value;
							if ((0, _Capabilities.isTimelineCapability)(_c)) {
								var roomId = (0, _Capabilities.getTimelineRoomIDFromCapability)(_c);
								if (roomId === _Symbols.Symbols.AnyRoom) {
									var _iterator5 = _createForOfIteratorHelper(this.driver.getKnownRooms()), _step5;
									try {
										for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
											var _roomId = _step5.value;
											this.pushRoomState(_roomId);
										}
									} catch (err) {
										_iterator5.e(err);
									} finally {
										_iterator5.f();
									}
								} else this.pushRoomState(roomId);
							}
						}
					} catch (err) {
						_iterator3.e(err);
					} finally {
						_iterator3.f();
					}
					if (allowed.includes(_Capabilities.MatrixCapabilities.MSC4407ReceiveStickyEvent)) {
						console.debug("Widget ".concat(this.widget.id, " is allowed to receive sticky events, check current sticky state."));
						var roomIds = allowed.filter(function(capability) {
							return (0, _Capabilities.isTimelineCapability)(capability);
						}).map(function(timelineCapability) {
							return (0, _Capabilities.getTimelineRoomIDFromCapability)(timelineCapability);
						}).flatMap(function(roomIdOrWildcard) {
							if (roomIdOrWildcard === _Symbols.Symbols.AnyRoom) return _this3.driver.getKnownRooms();
							else return roomIdOrWildcard;
						});
						console.debug("Widget ".concat(this.widget.id, " is allowed to receive sticky events in rooms:"), roomIds);
						var _iterator4 = _createForOfIteratorHelper(roomIds), _step4;
						try {
							var _loop = function _loop() {
								var roomId = _step4.value;
								_this3.pushStickyState(roomId)["catch"](function(err) {
									console.error("Failed to push sticky events to widget ".concat(_this3.widget.id, " for room ").concat(roomId, ":"), err);
								});
							};
							for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) _loop();
						} catch (err) {
							_iterator4.e(err);
						} finally {
							_iterator4.f();
						}
					}
					if (allowedEvents.length > 0 && this.viewedRoomId !== null && !this.canUseRoomTimeline(this.viewedRoomId)) this.pushRoomState(this.viewedRoomId);
				}
			},
			{
				key: "onIframeLoad",
				value: function onIframeLoad(ev) {
					if (this.widget.waitForIframeLoad) this.beginCapabilities();
					else {
						console.log("waitForIframeLoad is false: waiting for widget to send contentLoaded");
						this.contentLoadedWaitTimer = setTimeout(function() {
							console.error("Widget specified waitForIframeLoad=false but timed out waiting for contentLoaded event!");
						}, 1e4);
						this.contentLoadedActionSent = false;
					}
				}
			},
			{
				key: "handleContentLoadedAction",
				value: function handleContentLoadedAction(action) {
					if (this.contentLoadedWaitTimer !== void 0) {
						clearTimeout(this.contentLoadedWaitTimer);
						this.contentLoadedWaitTimer = void 0;
					}
					if (this.contentLoadedActionSent) throw new Error("Improper sequence: ContentLoaded Action can only be sent once after the widget loaded and should only be used if waitForIframeLoad is false (default=true)");
					if (this.widget.waitForIframeLoad) this.transport.reply(action, { error: { message: "Improper sequence: not expecting ContentLoaded event if waitForIframeLoad is true (default=true)" } });
					else {
						this.transport.reply(action, {});
						this.beginCapabilities();
					}
					this.contentLoadedActionSent = true;
				}
			},
			{
				key: "replyVersions",
				value: function replyVersions(request) {
					this.transport.reply(request, { supported_versions: _ApiVersion.CurrentApiVersions });
				}
			},
			{
				key: "supportsUpdateState",
				value: function() {
					var _supportsUpdateState = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee2() {
						return _regeneratorRuntime().wrap(function _callee2$(_context2) {
							while (1) switch (_context2.prev = _context2.next) {
								case 0:
									_context2.next = 2;
									return this.getWidgetVersions();
								case 2: return _context2.abrupt("return", _context2.sent.includes(_ApiVersion.UnstableApiVersion.MSC2762_UPDATE_STATE));
								case 3:
								case "end": return _context2.stop();
							}
						}, _callee2, this);
					}));
					function supportsUpdateState() {
						return _supportsUpdateState.apply(this, arguments);
					}
					return supportsUpdateState;
				}()
			},
			{
				key: "handleCapabilitiesRenegotiate",
				value: function handleCapabilitiesRenegotiate(request) {
					var _request$data, _this4 = this;
					this.transport.reply(request, {});
					var requested = ((_request$data = request.data) === null || _request$data === void 0 ? void 0 : _request$data.capabilities) || [];
					var newlyRequested = new Set(requested.filter(function(r) {
						return !_this4.hasCapability(r);
					}));
					if (newlyRequested.size === 0) this.allowCapabilities([], []);
					this.driver.validateCapabilities(newlyRequested).then(function(allowed) {
						return _this4.allowCapabilities(_toConsumableArray(allowed), _toConsumableArray(newlyRequested));
					});
				}
			},
			{
				key: "handleNavigate",
				value: function handleNavigate(request) {
					var _request$data2, _this5 = this;
					if (!this.hasCapability(_Capabilities.MatrixCapabilities.MSC2931Navigate)) return this.transport.reply(request, { error: { message: "Missing capability" } });
					if (!((_request$data2 = request.data) !== null && _request$data2 !== void 0 && _request$data2.uri.startsWith("https://matrix.to/#"))) return this.transport.reply(request, { error: { message: "Invalid matrix.to URI" } });
					var onErr = function onErr(e) {
						console.error("[ClientWidgetApi] Failed to handle navigation: ", e);
						_this5.handleDriverError(e, request, "Error handling navigation");
					};
					try {
						this.driver.navigate(request.data.uri.toString())["catch"](function(e) {
							return onErr(e);
						}).then(function() {
							return _this5.transport.reply(request, {});
						});
					} catch (e) {
						return onErr(e);
					}
				}
			},
			{
				key: "handleOIDC",
				value: function handleOIDC(request) {
					var _this6 = this;
					var phase = 1;
					var replyState = function replyState(state, credential) {
						credential = credential || {};
						if (phase > 1) return _this6.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.OpenIDCredentials, _objectSpread({
							state,
							original_request_id: request.requestId
						}, credential));
						else return _this6.transport.reply(request, _objectSpread({ state }, credential));
					};
					var replyError = function replyError(msg) {
						console.error("[ClientWidgetApi] Failed to handle OIDC: ", msg);
						if (phase > 1) return replyState(_GetOpenIDAction.OpenIDRequestState.Blocked);
						else return _this6.transport.reply(request, { error: { message: msg } });
					};
					var observer = new _SimpleObservable.SimpleObservable(function(update) {
						if (update.state === _GetOpenIDAction.OpenIDRequestState.PendingUserConfirmation && phase > 1) {
							observer.close();
							return replyError("client provided out-of-phase response to OIDC flow");
						}
						if (update.state === _GetOpenIDAction.OpenIDRequestState.PendingUserConfirmation) {
							replyState(update.state);
							phase++;
							return;
						}
						if (update.state === _GetOpenIDAction.OpenIDRequestState.Allowed && !update.token) return replyError("client provided invalid OIDC token for an allowed request");
						if (update.state === _GetOpenIDAction.OpenIDRequestState.Blocked) update.token = void 0;
						observer.close();
						return replyState(update.state, update.token);
					});
					this.driver.askOpenID(observer);
				}
			},
			{
				key: "handleReadRoomAccountData",
				value: function handleReadRoomAccountData(request) {
					var _this7 = this;
					var events = this.driver.readRoomAccountData(request.data.type);
					if (!this.canReceiveRoomAccountData(request.data.type)) return this.transport.reply(request, { error: { message: "Cannot read room account data of this type" } });
					return events.then(function(evs) {
						_this7.transport.reply(request, { events: evs });
					});
				}
			},
			{
				key: "handleReadEvents",
				value: function() {
					var _handleReadEvents = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee3(request) {
						var _this8 = this;
						var askRoomIds, _iterator6, _step6, roomId, limit, since, stateKey, msgtype, _stateKey, events;
						return _regeneratorRuntime().wrap(function _callee3$(_context3) {
							while (1) switch (_context3.prev = _context3.next) {
								case 0:
									if (request.data.type) {
										_context3.next = 2;
										break;
									}
									return _context3.abrupt("return", this.transport.reply(request, { error: { message: "Invalid request - missing event type" } }));
								case 2:
									if (!(request.data.limit !== void 0 && (!request.data.limit || request.data.limit < 0))) {
										_context3.next = 4;
										break;
									}
									return _context3.abrupt("return", this.transport.reply(request, { error: { message: "Invalid request - limit out of range" } }));
								case 4:
									if (!(request.data.room_ids === void 0)) {
										_context3.next = 8;
										break;
									}
									askRoomIds = this.viewedRoomId === null ? [] : [this.viewedRoomId];
									_context3.next = 30;
									break;
								case 8:
									if (!(request.data.room_ids === _Symbols.Symbols.AnyRoom)) {
										_context3.next = 12;
										break;
									}
									askRoomIds = this.driver.getKnownRooms().filter(function(roomId) {
										return _this8.canUseRoomTimeline(roomId);
									});
									_context3.next = 30;
									break;
								case 12:
									askRoomIds = request.data.room_ids;
									_iterator6 = _createForOfIteratorHelper(askRoomIds);
									_context3.prev = 14;
									_iterator6.s();
								case 16:
									if ((_step6 = _iterator6.n()).done) {
										_context3.next = 22;
										break;
									}
									roomId = _step6.value;
									if (this.canUseRoomTimeline(roomId)) {
										_context3.next = 20;
										break;
									}
									return _context3.abrupt("return", this.transport.reply(request, { error: { message: "Unable to access room timeline: ".concat(roomId) } }));
								case 20:
									_context3.next = 16;
									break;
								case 22:
									_context3.next = 27;
									break;
								case 24:
									_context3.prev = 24;
									_context3.t0 = _context3["catch"](14);
									_iterator6.e(_context3.t0);
								case 27:
									_context3.prev = 27;
									_iterator6.f();
									return _context3.finish(27);
								case 30:
									limit = request.data.limit || 0;
									since = request.data.since;
									stateKey = void 0;
									msgtype = void 0;
									if (!(request.data.state_key !== void 0)) {
										_context3.next = 40;
										break;
									}
									stateKey = request.data.state_key === true ? void 0 : request.data.state_key.toString();
									if (this.canReceiveStateEvent(request.data.type, (_stateKey = stateKey) !== null && _stateKey !== void 0 ? _stateKey : null)) {
										_context3.next = 38;
										break;
									}
									return _context3.abrupt("return", this.transport.reply(request, { error: { message: "Cannot read state events of this type" } }));
								case 38:
									_context3.next = 43;
									break;
								case 40:
									msgtype = request.data.msgtype;
									if (this.canReceiveRoomEvent(request.data.type, msgtype)) {
										_context3.next = 43;
										break;
									}
									return _context3.abrupt("return", this.transport.reply(request, { error: { message: "Cannot read room events of this type" } }));
								case 43:
									if (!(request.data.room_ids === void 0 && askRoomIds.length === 0)) {
										_context3.next = 50;
										break;
									}
									console.warn("The widgetDriver uses deprecated behaviour:\n It does not set the viewedRoomId using `setViewedRoomId`");
									_context3.next = 47;
									return request.data.state_key === void 0 ? this.driver.readRoomEvents(request.data.type, msgtype, limit, null, since) : this.driver.readStateEvents(request.data.type, stateKey, limit, null);
								case 47:
									events = _context3.sent;
									_context3.next = 68;
									break;
								case 50:
									_context3.next = 52;
									return this.supportsUpdateState();
								case 52:
									if (!_context3.sent) {
										_context3.next = 58;
										break;
									}
									_context3.next = 55;
									return Promise.all(askRoomIds.map(function(roomId) {
										return _this8.driver.readRoomTimeline(roomId, request.data.type, msgtype, stateKey, limit, since);
									}));
								case 55:
									events = _context3.sent.flat(1);
									_context3.next = 68;
									break;
								case 58:
									if (!(request.data.state_key === void 0)) {
										_context3.next = 64;
										break;
									}
									_context3.next = 61;
									return Promise.all(askRoomIds.map(function(roomId) {
										return _this8.driver.readRoomTimeline(roomId, request.data.type, msgtype, stateKey, limit, since);
									}));
								case 61:
									_context3.t1 = _context3.sent;
									_context3.next = 67;
									break;
								case 64:
									_context3.next = 66;
									return Promise.all(askRoomIds.map(function(roomId) {
										return _this8.driver.readRoomState(roomId, request.data.type, stateKey);
									}));
								case 66: _context3.t1 = _context3.sent;
								case 67: events = _context3.t1.flat(1);
								case 68: this.transport.reply(request, { events });
								case 69:
								case "end": return _context3.stop();
							}
						}, _callee3, this, [[
							14,
							24,
							27,
							30
						]]);
					}));
					function handleReadEvents(_x) {
						return _handleReadEvents.apply(this, arguments);
					}
					return handleReadEvents;
				}()
			},
			{
				key: "handleSendEvent",
				value: function handleSendEvent(request) {
					var _this9 = this;
					if (!request.data.type) return this.transport.reply(request, { error: { message: "Invalid request - missing event type" } });
					if (!!request.data.room_id && !this.canUseRoomTimeline(request.data.room_id)) return this.transport.reply(request, { error: { message: "Unable to access room timeline: ".concat(request.data.room_id) } });
					var isDelayedEvent = request.data.delay !== void 0 || request.data.parent_delay_id !== void 0;
					if (isDelayedEvent && !this.hasCapability(_Capabilities.MatrixCapabilities.MSC4157SendDelayedEvent)) return this.transport.reply(request, { error: { message: "Missing capability for ".concat(_Capabilities.MatrixCapabilities.MSC4157SendDelayedEvent) } });
					var isStickyEvent = request.data.sticky_duration_ms !== void 0;
					if (isStickyEvent && !this.hasCapability(_Capabilities.MatrixCapabilities.MSC4407SendStickyEvent)) return this.transport.reply(request, { error: { message: "Missing capability for ".concat(_Capabilities.MatrixCapabilities.MSC4407SendStickyEvent) } });
					var sendEventPromise;
					if (request.data.state_key !== void 0) {
						if (!this.canSendStateEvent(request.data.type, request.data.state_key)) return this.transport.reply(request, { error: { message: "Cannot send state events of this type" } });
						if (isStickyEvent) return this.transport.reply(request, { error: { message: "Cannot send a state event with a sticky duration" } });
						if (isDelayedEvent) {
							var _request$data$delay, _request$data$parent_;
							sendEventPromise = this.driver.sendDelayedEvent((_request$data$delay = request.data.delay) !== null && _request$data$delay !== void 0 ? _request$data$delay : null, (_request$data$parent_ = request.data.parent_delay_id) !== null && _request$data$parent_ !== void 0 ? _request$data$parent_ : null, request.data.type, request.data.content || {}, request.data.state_key, request.data.room_id);
						} else sendEventPromise = this.driver.sendEvent(request.data.type, request.data.content || {}, request.data.state_key, request.data.room_id);
					} else {
						var content = request.data.content || {};
						var msgtype = content["msgtype"];
						if (!this.canSendRoomEvent(request.data.type, msgtype)) return this.transport.reply(request, { error: { message: "Cannot send room events of this type" } });
						var params = [
							request.data.type,
							content,
							null,
							request.data.room_id
						];
						if (isDelayedEvent && request.data.sticky_duration_ms) {
							var _request$data$delay2, _request$data$parent_2;
							sendEventPromise = this.driver.sendDelayedStickyEvent((_request$data$delay2 = request.data.delay) !== null && _request$data$delay2 !== void 0 ? _request$data$delay2 : null, (_request$data$parent_2 = request.data.parent_delay_id) !== null && _request$data$parent_2 !== void 0 ? _request$data$parent_2 : null, request.data.sticky_duration_ms, request.data.type, content, request.data.room_id);
						} else if (isDelayedEvent) {
							var _this$driver, _request$data$delay3, _request$data$parent_3;
							sendEventPromise = (_this$driver = this.driver).sendDelayedEvent.apply(_this$driver, [(_request$data$delay3 = request.data.delay) !== null && _request$data$delay3 !== void 0 ? _request$data$delay3 : null, (_request$data$parent_3 = request.data.parent_delay_id) !== null && _request$data$parent_3 !== void 0 ? _request$data$parent_3 : null].concat(params));
						} else if (request.data.sticky_duration_ms) sendEventPromise = this.driver.sendStickyEvent(request.data.sticky_duration_ms, request.data.type, content, request.data.room_id);
						else {
							var _this$driver2;
							sendEventPromise = (_this$driver2 = this.driver).sendEvent.apply(_this$driver2, params);
						}
					}
					sendEventPromise.then(function(sentEvent) {
						return _this9.transport.reply(request, _objectSpread({ room_id: sentEvent.roomId }, "eventId" in sentEvent ? { event_id: sentEvent.eventId } : { delay_id: sentEvent.delayId }));
					})["catch"](function(e) {
						console.error("error sending event: ", e);
						_this9.handleDriverError(e, request, "Error sending event");
					});
				}
			},
			{
				key: "handleUpdateDelayedEvent",
				value: function handleUpdateDelayedEvent(request) {
					var _this10 = this;
					if (!request.data.delay_id) return this.transport.reply(request, { error: { message: "Invalid request - missing delay_id" } });
					if (!this.hasCapability(_Capabilities.MatrixCapabilities.MSC4157UpdateDelayedEvent)) return this.transport.reply(request, { error: { message: "Missing capability" } });
					var updateDelayedEvent;
					switch (request.data.action) {
						case _UpdateDelayedEventAction.UpdateDelayedEventAction.Cancel:
							updateDelayedEvent = this.driver.cancelScheduledDelayedEvent;
							break;
						case _UpdateDelayedEventAction.UpdateDelayedEventAction.Restart:
							updateDelayedEvent = this.driver.restartScheduledDelayedEvent;
							break;
						case _UpdateDelayedEventAction.UpdateDelayedEventAction.Send:
							updateDelayedEvent = this.driver.sendScheduledDelayedEvent;
							break;
						default: return this.transport.reply(request, { error: { message: "Invalid request - unsupported action" } });
					}
					updateDelayedEvent.call(this.driver, request.data.delay_id).then(function() {
						return _this10.transport.reply(request, {});
					})["catch"](function(e) {
						console.error("error updating delayed event: ", e);
						_this10.handleDriverError(e, request, "Error updating delayed event");
					});
				}
			},
			{
				key: "handleSendToDevice",
				value: function() {
					var _handleSendToDevice = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee4(request) {
						return _regeneratorRuntime().wrap(function _callee4$(_context4) {
							while (1) switch (_context4.prev = _context4.next) {
								case 0:
									if (request.data.type) {
										_context4.next = 4;
										break;
									}
									this.transport.reply(request, { error: { message: "Invalid request - missing event type" } });
									_context4.next = 26;
									break;
								case 4:
									if (request.data.messages) {
										_context4.next = 8;
										break;
									}
									this.transport.reply(request, { error: { message: "Invalid request - missing event contents" } });
									_context4.next = 26;
									break;
								case 8:
									if (!(typeof request.data.encrypted !== "boolean")) {
										_context4.next = 12;
										break;
									}
									this.transport.reply(request, { error: { message: "Invalid request - missing encryption flag" } });
									_context4.next = 26;
									break;
								case 12:
									if (this.canSendToDeviceEvent(request.data.type)) {
										_context4.next = 16;
										break;
									}
									this.transport.reply(request, { error: { message: "Cannot send to-device events of this type" } });
									_context4.next = 26;
									break;
								case 16:
									_context4.prev = 16;
									_context4.next = 19;
									return this.driver.sendToDevice(request.data.type, request.data.encrypted, request.data.messages);
								case 19:
									this.transport.reply(request, {});
									_context4.next = 26;
									break;
								case 22:
									_context4.prev = 22;
									_context4.t0 = _context4["catch"](16);
									console.error("error sending to-device event", _context4.t0);
									this.handleDriverError(_context4.t0, request, "Error sending event");
								case 26:
								case "end": return _context4.stop();
							}
						}, _callee4, this, [[16, 22]]);
					}));
					function handleSendToDevice(_x2) {
						return _handleSendToDevice.apply(this, arguments);
					}
					return handleSendToDevice;
				}()
			},
			{
				key: "pollTurnServers",
				value: function() {
					var _pollTurnServers = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee5(turnServers, initialServer) {
						var _iteratorAbruptCompletion, _didIteratorError, _iteratorError, _iterator, _step, server;
						return _regeneratorRuntime().wrap(function _callee5$(_context5) {
							while (1) switch (_context5.prev = _context5.next) {
								case 0:
									_context5.prev = 0;
									_context5.next = 3;
									return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.UpdateTurnServers, initialServer);
								case 3:
									_iteratorAbruptCompletion = false;
									_didIteratorError = false;
									_context5.prev = 5;
									_iterator = _asyncIterator(turnServers);
								case 7:
									_context5.next = 9;
									return _iterator.next();
								case 9:
									if (!(_iteratorAbruptCompletion = !(_step = _context5.sent).done)) {
										_context5.next = 16;
										break;
									}
									server = _step.value;
									_context5.next = 13;
									return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.UpdateTurnServers, server);
								case 13:
									_iteratorAbruptCompletion = false;
									_context5.next = 7;
									break;
								case 16:
									_context5.next = 22;
									break;
								case 18:
									_context5.prev = 18;
									_context5.t0 = _context5["catch"](5);
									_didIteratorError = true;
									_iteratorError = _context5.t0;
								case 22:
									_context5.prev = 22;
									_context5.prev = 23;
									if (!(_iteratorAbruptCompletion && _iterator["return"] != null)) {
										_context5.next = 27;
										break;
									}
									_context5.next = 27;
									return _iterator["return"]();
								case 27:
									_context5.prev = 27;
									if (!_didIteratorError) {
										_context5.next = 30;
										break;
									}
									throw _iteratorError;
								case 30: return _context5.finish(27);
								case 31: return _context5.finish(22);
								case 32:
									_context5.next = 37;
									break;
								case 34:
									_context5.prev = 34;
									_context5.t1 = _context5["catch"](0);
									console.error("error polling for TURN servers", _context5.t1);
								case 37:
								case "end": return _context5.stop();
							}
						}, _callee5, this, [
							[0, 34],
							[
								5,
								18,
								22,
								32
							],
							[
								23,
								,
								27,
								31
							]
						]);
					}));
					function pollTurnServers(_x3, _x4) {
						return _pollTurnServers.apply(this, arguments);
					}
					return pollTurnServers;
				}()
			},
			{
				key: "handleWatchTurnServers",
				value: function() {
					var _handleWatchTurnServers = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee6(request) {
						var turnServers, _yield$turnServers$ne, done, value;
						return _regeneratorRuntime().wrap(function _callee6$(_context6) {
							while (1) switch (_context6.prev = _context6.next) {
								case 0:
									if (this.hasCapability(_Capabilities.MatrixCapabilities.MSC3846TurnServers)) {
										_context6.next = 4;
										break;
									}
									this.transport.reply(request, { error: { message: "Missing capability" } });
									_context6.next = 26;
									break;
								case 4:
									if (!this.turnServers) {
										_context6.next = 8;
										break;
									}
									this.transport.reply(request, {});
									_context6.next = 26;
									break;
								case 8:
									_context6.prev = 8;
									turnServers = this.driver.getTurnServers();
									_context6.next = 12;
									return turnServers.next();
								case 12:
									_yield$turnServers$ne = _context6.sent;
									done = _yield$turnServers$ne.done;
									value = _yield$turnServers$ne.value;
									if (!done) {
										_context6.next = 17;
										break;
									}
									throw new Error("Client refuses to provide any TURN servers");
								case 17:
									this.transport.reply(request, {});
									this.pollTurnServers(turnServers, value);
									this.turnServers = turnServers;
									_context6.next = 26;
									break;
								case 22:
									_context6.prev = 22;
									_context6.t0 = _context6["catch"](8);
									console.error("error getting first TURN server results", _context6.t0);
									this.transport.reply(request, { error: { message: "TURN servers not available" } });
								case 26:
								case "end": return _context6.stop();
							}
						}, _callee6, this, [[8, 22]]);
					}));
					function handleWatchTurnServers(_x5) {
						return _handleWatchTurnServers.apply(this, arguments);
					}
					return handleWatchTurnServers;
				}()
			},
			{
				key: "handleUnwatchTurnServers",
				value: function() {
					var _handleUnwatchTurnServers = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee7(request) {
						return _regeneratorRuntime().wrap(function _callee7$(_context7) {
							while (1) switch (_context7.prev = _context7.next) {
								case 0:
									if (this.hasCapability(_Capabilities.MatrixCapabilities.MSC3846TurnServers)) {
										_context7.next = 4;
										break;
									}
									this.transport.reply(request, { error: { message: "Missing capability" } });
									_context7.next = 12;
									break;
								case 4:
									if (this.turnServers) {
										_context7.next = 8;
										break;
									}
									this.transport.reply(request, {});
									_context7.next = 12;
									break;
								case 8:
									_context7.next = 10;
									return this.turnServers["return"](void 0);
								case 10:
									this.turnServers = null;
									this.transport.reply(request, {});
								case 12:
								case "end": return _context7.stop();
							}
						}, _callee7, this);
					}));
					function handleUnwatchTurnServers(_x6) {
						return _handleUnwatchTurnServers.apply(this, arguments);
					}
					return handleUnwatchTurnServers;
				}()
			},
			{
				key: "handleReadRelations",
				value: function() {
					var _handleReadRelations = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee8(request) {
						var _this11 = this;
						var result, chunk;
						return _regeneratorRuntime().wrap(function _callee8$(_context8) {
							while (1) switch (_context8.prev = _context8.next) {
								case 0:
									if (request.data.event_id) {
										_context8.next = 2;
										break;
									}
									return _context8.abrupt("return", this.transport.reply(request, { error: { message: "Invalid request - missing event ID" } }));
								case 2:
									if (!(request.data.limit !== void 0 && request.data.limit < 0)) {
										_context8.next = 4;
										break;
									}
									return _context8.abrupt("return", this.transport.reply(request, { error: { message: "Invalid request - limit out of range" } }));
								case 4:
									if (!(request.data.room_id !== void 0 && !this.canUseRoomTimeline(request.data.room_id))) {
										_context8.next = 6;
										break;
									}
									return _context8.abrupt("return", this.transport.reply(request, { error: { message: "Unable to access room timeline: ".concat(request.data.room_id) } }));
								case 6:
									_context8.prev = 6;
									_context8.next = 9;
									return this.driver.readEventRelations(request.data.event_id, request.data.room_id, request.data.rel_type, request.data.event_type, request.data.from, request.data.to, request.data.limit, request.data.direction);
								case 9:
									result = _context8.sent;
									chunk = result.chunk.filter(function(e) {
										if (e.state_key !== void 0) return _this11.canReceiveStateEvent(e.type, e.state_key);
										else return _this11.canReceiveRoomEvent(e.type, e.content["msgtype"]);
									});
									return _context8.abrupt("return", this.transport.reply(request, {
										chunk,
										prev_batch: result.prevBatch,
										next_batch: result.nextBatch
									}));
								case 14:
									_context8.prev = 14;
									_context8.t0 = _context8["catch"](6);
									console.error("error getting the relations", _context8.t0);
									this.handleDriverError(_context8.t0, request, "Unexpected error while reading relations");
								case 18:
								case "end": return _context8.stop();
							}
						}, _callee8, this, [[6, 14]]);
					}));
					function handleReadRelations(_x7) {
						return _handleReadRelations.apply(this, arguments);
					}
					return handleReadRelations;
				}()
			},
			{
				key: "handleUserDirectorySearch",
				value: function() {
					var _handleUserDirectorySearch = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee9(request) {
						var result;
						return _regeneratorRuntime().wrap(function _callee9$(_context9) {
							while (1) switch (_context9.prev = _context9.next) {
								case 0:
									if (this.hasCapability(_Capabilities.MatrixCapabilities.MSC3973UserDirectorySearch)) {
										_context9.next = 2;
										break;
									}
									return _context9.abrupt("return", this.transport.reply(request, { error: { message: "Missing capability" } }));
								case 2:
									if (!(typeof request.data.search_term !== "string")) {
										_context9.next = 4;
										break;
									}
									return _context9.abrupt("return", this.transport.reply(request, { error: { message: "Invalid request - missing search term" } }));
								case 4:
									if (!(request.data.limit !== void 0 && request.data.limit < 0)) {
										_context9.next = 6;
										break;
									}
									return _context9.abrupt("return", this.transport.reply(request, { error: { message: "Invalid request - limit out of range" } }));
								case 6:
									_context9.prev = 6;
									_context9.next = 9;
									return this.driver.searchUserDirectory(request.data.search_term, request.data.limit);
								case 9:
									result = _context9.sent;
									return _context9.abrupt("return", this.transport.reply(request, {
										limited: result.limited,
										results: result.results.map(function(r) {
											return {
												user_id: r.userId,
												display_name: r.displayName,
												avatar_url: r.avatarUrl
											};
										})
									}));
								case 13:
									_context9.prev = 13;
									_context9.t0 = _context9["catch"](6);
									console.error("error searching in the user directory", _context9.t0);
									this.handleDriverError(_context9.t0, request, "Unexpected error while searching in the user directory");
								case 17:
								case "end": return _context9.stop();
							}
						}, _callee9, this, [[6, 13]]);
					}));
					function handleUserDirectorySearch(_x8) {
						return _handleUserDirectorySearch.apply(this, arguments);
					}
					return handleUserDirectorySearch;
				}()
			},
			{
				key: "handleGetMediaConfig",
				value: function() {
					var _handleGetMediaConfig = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee10(request) {
						var result;
						return _regeneratorRuntime().wrap(function _callee10$(_context10) {
							while (1) switch (_context10.prev = _context10.next) {
								case 0:
									if (this.hasCapability(_Capabilities.MatrixCapabilities.MSC4039UploadFile)) {
										_context10.next = 2;
										break;
									}
									return _context10.abrupt("return", this.transport.reply(request, { error: { message: "Missing capability" } }));
								case 2:
									_context10.prev = 2;
									_context10.next = 5;
									return this.driver.getMediaConfig();
								case 5:
									result = _context10.sent;
									return _context10.abrupt("return", this.transport.reply(request, result));
								case 9:
									_context10.prev = 9;
									_context10.t0 = _context10["catch"](2);
									console.error("error while getting the media configuration", _context10.t0);
									this.handleDriverError(_context10.t0, request, "Unexpected error while getting the media configuration");
								case 13:
								case "end": return _context10.stop();
							}
						}, _callee10, this, [[2, 9]]);
					}));
					function handleGetMediaConfig(_x9) {
						return _handleGetMediaConfig.apply(this, arguments);
					}
					return handleGetMediaConfig;
				}()
			},
			{
				key: "handleUploadFile",
				value: function() {
					var _handleUploadFile = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee11(request) {
						var result;
						return _regeneratorRuntime().wrap(function _callee11$(_context11) {
							while (1) switch (_context11.prev = _context11.next) {
								case 0:
									if (this.hasCapability(_Capabilities.MatrixCapabilities.MSC4039UploadFile)) {
										_context11.next = 2;
										break;
									}
									return _context11.abrupt("return", this.transport.reply(request, { error: { message: "Missing capability" } }));
								case 2:
									_context11.prev = 2;
									_context11.next = 5;
									return this.driver.uploadFile(request.data.file);
								case 5:
									result = _context11.sent;
									return _context11.abrupt("return", this.transport.reply(request, { content_uri: result.contentUri }));
								case 9:
									_context11.prev = 9;
									_context11.t0 = _context11["catch"](2);
									console.error("error while uploading a file", _context11.t0);
									this.handleDriverError(_context11.t0, request, "Unexpected error while uploading a file");
								case 13:
								case "end": return _context11.stop();
							}
						}, _callee11, this, [[2, 9]]);
					}));
					function handleUploadFile(_x10) {
						return _handleUploadFile.apply(this, arguments);
					}
					return handleUploadFile;
				}()
			},
			{
				key: "handleDownloadFile",
				value: function() {
					var _handleDownloadFile = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee12(request) {
						var result;
						return _regeneratorRuntime().wrap(function _callee12$(_context12) {
							while (1) switch (_context12.prev = _context12.next) {
								case 0:
									if (this.hasCapability(_Capabilities.MatrixCapabilities.MSC4039DownloadFile)) {
										_context12.next = 2;
										break;
									}
									return _context12.abrupt("return", this.transport.reply(request, { error: { message: "Missing capability" } }));
								case 2:
									_context12.prev = 2;
									_context12.next = 5;
									return this.driver.downloadFile(request.data.content_uri);
								case 5:
									result = _context12.sent;
									return _context12.abrupt("return", this.transport.reply(request, { file: result.file }));
								case 9:
									_context12.prev = 9;
									_context12.t0 = _context12["catch"](2);
									console.error("error while downloading a file", _context12.t0);
									this.handleDriverError(_context12.t0, request, "Unexpected error while downloading a file");
								case 13:
								case "end": return _context12.stop();
							}
						}, _callee12, this, [[2, 9]]);
					}));
					function handleDownloadFile(_x11) {
						return _handleDownloadFile.apply(this, arguments);
					}
					return handleDownloadFile;
				}()
			},
			{
				key: "handleDriverError",
				value: function handleDriverError(e, request, message) {
					var data = this.driver.processError(e);
					this.transport.reply(request, { error: _objectSpread({ message }, data) });
				}
			},
			{
				key: "handleMessage",
				value: function handleMessage(ev) {
					if (this.isStopped) return;
					var actionEv = new CustomEvent("action:".concat(ev.detail.action), {
						detail: ev.detail,
						cancelable: true
					});
					this.emit("action:".concat(ev.detail.action), actionEv);
					if (!actionEv.defaultPrevented) switch (ev.detail.action) {
						case _WidgetApiAction.WidgetApiFromWidgetAction.ContentLoaded: return this.handleContentLoadedAction(ev.detail);
						case _WidgetApiAction.WidgetApiFromWidgetAction.SupportedApiVersions: return this.replyVersions(ev.detail);
						case _WidgetApiAction.WidgetApiFromWidgetAction.SendEvent: return this.handleSendEvent(ev.detail);
						case _WidgetApiAction.WidgetApiFromWidgetAction.SendToDevice: return this.handleSendToDevice(ev.detail);
						case _WidgetApiAction.WidgetApiFromWidgetAction.GetOpenIDCredentials: return this.handleOIDC(ev.detail);
						case _WidgetApiAction.WidgetApiFromWidgetAction.MSC2931Navigate: return this.handleNavigate(ev.detail);
						case _WidgetApiAction.WidgetApiFromWidgetAction.MSC2974RenegotiateCapabilities: return this.handleCapabilitiesRenegotiate(ev.detail);
						case _WidgetApiAction.WidgetApiFromWidgetAction.MSC2876ReadEvents: return this.handleReadEvents(ev.detail);
						case _WidgetApiAction.WidgetApiFromWidgetAction.WatchTurnServers: return this.handleWatchTurnServers(ev.detail);
						case _WidgetApiAction.WidgetApiFromWidgetAction.UnwatchTurnServers: return this.handleUnwatchTurnServers(ev.detail);
						case _WidgetApiAction.WidgetApiFromWidgetAction.MSC3869ReadRelations: return this.handleReadRelations(ev.detail);
						case _WidgetApiAction.WidgetApiFromWidgetAction.MSC3973UserDirectorySearch: return this.handleUserDirectorySearch(ev.detail);
						case _WidgetApiAction.WidgetApiFromWidgetAction.BeeperReadRoomAccountData: return this.handleReadRoomAccountData(ev.detail);
						case _WidgetApiAction.WidgetApiFromWidgetAction.MSC4039GetMediaConfigAction: return this.handleGetMediaConfig(ev.detail);
						case _WidgetApiAction.WidgetApiFromWidgetAction.MSC4039UploadFileAction: return this.handleUploadFile(ev.detail);
						case _WidgetApiAction.WidgetApiFromWidgetAction.MSC4039DownloadFileAction: return this.handleDownloadFile(ev.detail);
						case _WidgetApiAction.WidgetApiFromWidgetAction.MSC4157UpdateDelayedEvent: return this.handleUpdateDelayedEvent(ev.detail);
						default: return this.transport.reply(ev.detail, { error: { message: "Unknown or unsupported from-widget action: " + ev.detail.action } });
					}
				}
			},
			{
				key: "updateTheme",
				value: function updateTheme(theme) {
					return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.ThemeChange, theme);
				}
			},
			{
				key: "updateLanguage",
				value: function updateLanguage(lang) {
					return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.LanguageChange, { lang });
				}
			},
			{
				key: "takeScreenshot",
				value: function takeScreenshot() {
					return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.TakeScreenshot, {});
				}
			},
			{
				key: "updateVisibility",
				value: function updateVisibility(isVisible) {
					return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.UpdateVisibility, { visible: isVisible });
				}
			},
			{
				key: "sendWidgetConfig",
				value: function sendWidgetConfig(data) {
					return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.WidgetConfig, data).then();
				}
			},
			{
				key: "notifyModalWidgetButtonClicked",
				value: function notifyModalWidgetButtonClicked(id) {
					return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.ButtonClicked, { id }).then();
				}
			},
			{
				key: "notifyModalWidgetClose",
				value: function notifyModalWidgetClose(data) {
					return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.CloseModalWidget, data).then();
				}
			},
			{
				key: "feedEvent",
				value: function() {
					var _feedEvent = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee13(rawEvent, currentViewedRoomId) {
						var _rawEvent$content;
						return _regeneratorRuntime().wrap(function _callee13$(_context13) {
							while (1) switch (_context13.prev = _context13.next) {
								case 0:
									if (currentViewedRoomId !== void 0) this.setViewedRoomId(currentViewedRoomId);
									if (!(rawEvent.room_id !== this.viewedRoomId && !this.canUseRoomTimeline(rawEvent.room_id))) {
										_context13.next = 3;
										break;
									}
									return _context13.abrupt("return");
								case 3:
									if (!(rawEvent.state_key !== void 0 && rawEvent.state_key !== null)) {
										_context13.next = 8;
										break;
									}
									if (this.canReceiveStateEvent(rawEvent.type, rawEvent.state_key)) {
										_context13.next = 6;
										break;
									}
									return _context13.abrupt("return");
								case 6:
									_context13.next = 10;
									break;
								case 8:
									if (this.canReceiveRoomEvent(rawEvent.type, (_rawEvent$content = rawEvent.content) === null || _rawEvent$content === void 0 ? void 0 : _rawEvent$content["msgtype"])) {
										_context13.next = 10;
										break;
									}
									return _context13.abrupt("return");
								case 10:
									_context13.next = 12;
									return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.SendEvent, rawEvent);
								case 12:
								case "end": return _context13.stop();
							}
						}, _callee13, this);
					}));
					function feedEvent(_x12, _x13) {
						return _feedEvent.apply(this, arguments);
					}
					return feedEvent;
				}()
			},
			{
				key: "feedToDevice",
				value: function() {
					var _feedToDevice = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee14(message, encrypted) {
						return _regeneratorRuntime().wrap(function _callee14$(_context14) {
							while (1) switch (_context14.prev = _context14.next) {
								case 0:
									if (!this.canReceiveToDeviceEvent(message.type)) {
										_context14.next = 3;
										break;
									}
									_context14.next = 3;
									return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.SendToDevice, _objectSpread(_objectSpread({}, message), {}, { encrypted }));
								case 3:
								case "end": return _context14.stop();
							}
						}, _callee14, this);
					}));
					function feedToDevice(_x14, _x15) {
						return _feedToDevice.apply(this, arguments);
					}
					return feedToDevice;
				}()
			},
			{
				key: "setViewedRoomId",
				value: function setViewedRoomId(roomId) {
					this.viewedRoomId = roomId;
					if (roomId !== null && !this.canUseRoomTimeline(roomId)) this.pushRoomState(roomId);
				}
			},
			{
				key: "flushRoomState",
				value: function() {
					var _flushRoomState = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee15() {
						var events, _iterator7, _step7, eventTypeMap, _iterator8, _step8, stateKeyMap;
						return _regeneratorRuntime().wrap(function _callee15$(_context15) {
							while (1) switch (_context15.prev = _context15.next) {
								case 0: _context15.prev = 0;
								case 1:
									_context15.next = 3;
									return Promise.all(this.pushRoomStateTasks);
								case 3: if (this.pushRoomStateTasks.size > 0) {
									_context15.next = 1;
									break;
								}
								case 4:
									events = [];
									_iterator7 = _createForOfIteratorHelper(this.pushRoomStateResult.values());
									try {
										for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
											eventTypeMap = _step7.value;
											_iterator8 = _createForOfIteratorHelper(eventTypeMap.values());
											try {
												for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
													stateKeyMap = _step8.value;
													events.push.apply(events, _toConsumableArray(stateKeyMap.values()));
												}
											} catch (err) {
												_iterator8.e(err);
											} finally {
												_iterator8.f();
											}
										}
									} catch (err) {
										_iterator7.e(err);
									} finally {
										_iterator7.f();
									}
									_context15.next = 9;
									return this.getWidgetVersions();
								case 9:
									if (!_context15.sent.includes(_ApiVersion.UnstableApiVersion.MSC2762_UPDATE_STATE)) {
										_context15.next = 12;
										break;
									}
									_context15.next = 12;
									return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.UpdateState, { state: events });
								case 12:
									_context15.prev = 12;
									this.flushRoomStateTask = null;
									return _context15.finish(12);
								case 15:
								case "end": return _context15.stop();
							}
						}, _callee15, this, [[
							0,
							,
							12,
							15
						]]);
					}));
					function flushRoomState() {
						return _flushRoomState.apply(this, arguments);
					}
					return flushRoomState;
				}()
			},
			{
				key: "pushStickyState",
				value: function() {
					var _pushStickyState = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee17(roomId) {
						var _this12 = this;
						return _regeneratorRuntime().wrap(function _callee17$(_context17) {
							while (1) switch (_context17.prev = _context17.next) {
								case 0:
									console.debug("Pushing sticky state to widget for room", roomId);
									return _context17.abrupt("return", this.driver.readStickyEvents(roomId).then(function(events) {
										return {
											roomId,
											stickyEvents: events.filter(function(e) {
												var _e$content;
												return _this12.canReceiveRoomEvent(e.type, typeof ((_e$content = e.content) === null || _e$content === void 0 ? void 0 : _e$content.msgtype) === "string" ? e.content.msgtype : null);
											})
										};
									}).then(/* @__PURE__ */ function() {
										var _ref2 = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee16(_ref) {
											var roomId, stickyEvents, promises;
											return _regeneratorRuntime().wrap(function _callee16$(_context16) {
												while (1) switch (_context16.prev = _context16.next) {
													case 0:
														roomId = _ref.roomId, stickyEvents = _ref.stickyEvents;
														console.debug("Pushing", stickyEvents.length, "sticky events to widget for room", roomId);
														promises = stickyEvents.map(function(rawEvent) {
															return _this12.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.SendEvent, rawEvent);
														});
														_context16.next = 5;
														return Promise.all(promises);
													case 5:
													case "end": return _context16.stop();
												}
											}, _callee16);
										}));
										return function(_x17) {
											return _ref2.apply(this, arguments);
										};
									}()));
								case 2:
								case "end": return _context17.stop();
							}
						}, _callee17, this);
					}));
					function pushStickyState(_x16) {
						return _pushStickyState.apply(this, arguments);
					}
					return pushStickyState;
				}()
			},
			{
				key: "pushRoomState",
				value: function pushRoomState(roomId) {
					var _this13 = this;
					var _iterator9 = _createForOfIteratorHelper(this.allowedEvents), _step9;
					try {
						var _loop2 = function _loop2() {
							var cap = _step9.value;
							if (cap.kind === _WidgetEventCapability.EventKind.State && cap.direction === _WidgetEventCapability.EventDirection.Receive) {
								var _cap$keyStr, _this13$flushRoomStat;
								var task = _this13.driver.readRoomState(roomId, cap.eventType, (_cap$keyStr = cap.keyStr) !== null && _cap$keyStr !== void 0 ? _cap$keyStr : void 0).then(function(events) {
									var _iterator10 = _createForOfIteratorHelper(events), _step10;
									try {
										for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
											var event = _step10.value;
											var eventTypeMap = _this13.pushRoomStateResult.get(roomId);
											if (eventTypeMap === void 0) {
												eventTypeMap = /* @__PURE__ */ new Map();
												_this13.pushRoomStateResult.set(roomId, eventTypeMap);
											}
											var stateKeyMap = eventTypeMap.get(cap.eventType);
											if (stateKeyMap === void 0) {
												stateKeyMap = /* @__PURE__ */ new Map();
												eventTypeMap.set(cap.eventType, stateKeyMap);
											}
											if (!stateKeyMap.has(event.state_key)) stateKeyMap.set(event.state_key, event);
										}
									} catch (err) {
										_iterator10.e(err);
									} finally {
										_iterator10.f();
									}
								}, function(e) {
									return console.error("Failed to read room state for ".concat(roomId, " (").concat(cap.eventType, ", ").concat(cap.keyStr, ")"), e);
								}).then(function() {
									_this13.pushRoomStateTasks["delete"](task);
								});
								_this13.pushRoomStateTasks.add(task);
								(_this13$flushRoomStat = _this13.flushRoomStateTask) !== null && _this13$flushRoomStat !== void 0 || (_this13.flushRoomStateTask = _this13.flushRoomState());
								_this13.flushRoomStateTask["catch"](function(e) {
									return console.error("Failed to push room state", e);
								});
							}
						};
						for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) _loop2();
					} catch (err) {
						_iterator9.e(err);
					} finally {
						_iterator9.f();
					}
				}
			},
			{
				key: "feedStateUpdate",
				value: function() {
					var _feedStateUpdate = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee18(rawEvent) {
						var eventTypeMap, stateKeyMap;
						return _regeneratorRuntime().wrap(function _callee18$(_context18) {
							while (1) switch (_context18.prev = _context18.next) {
								case 0:
									if (!(rawEvent.state_key === void 0)) {
										_context18.next = 2;
										break;
									}
									throw new Error("Not a state event");
								case 2:
									if (!((rawEvent.room_id === this.viewedRoomId || this.canUseRoomTimeline(rawEvent.room_id)) && this.canReceiveStateEvent(rawEvent.type, rawEvent.state_key))) {
										_context18.next = 21;
										break;
									}
									if (!(this.pushRoomStateTasks.size === 0)) {
										_context18.next = 11;
										break;
									}
									_context18.next = 6;
									return this.getWidgetVersions();
								case 6:
									if (!_context18.sent.includes(_ApiVersion.UnstableApiVersion.MSC2762_UPDATE_STATE)) {
										_context18.next = 9;
										break;
									}
									_context18.next = 9;
									return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.UpdateState, { state: [rawEvent] });
								case 9:
									_context18.next = 21;
									break;
								case 11:
									eventTypeMap = this.pushRoomStateResult.get(rawEvent.room_id);
									if (eventTypeMap === void 0) {
										eventTypeMap = /* @__PURE__ */ new Map();
										this.pushRoomStateResult.set(rawEvent.room_id, eventTypeMap);
									}
									stateKeyMap = eventTypeMap.get(rawEvent.type);
									if (stateKeyMap === void 0) {
										stateKeyMap = /* @__PURE__ */ new Map();
										eventTypeMap.set(rawEvent.type, stateKeyMap);
									}
									if (!stateKeyMap.has(rawEvent.type)) stateKeyMap.set(rawEvent.state_key, rawEvent);
								case 16:
									_context18.next = 18;
									return Promise.all(this.pushRoomStateTasks);
								case 18: if (this.pushRoomStateTasks.size > 0) {
									_context18.next = 16;
									break;
								}
								case 19:
									_context18.next = 21;
									return this.flushRoomStateTask;
								case 21:
								case "end": return _context18.stop();
							}
						}, _callee18, this);
					}));
					function feedStateUpdate(_x18) {
						return _feedStateUpdate.apply(this, arguments);
					}
					return feedStateUpdate;
				}()
			}
		]);
		return ClientWidgetApi;
	}(_events.EventEmitter);
}));
//#endregion
//#region node_modules/matrix-widget-api/lib/interfaces/IWidgetApiErrorResponse.js
var require_IWidgetApiErrorResponse = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isErrorResponse = isErrorResponse;
	function _typeof(obj) {
		"@babel/helpers - typeof";
		return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
			return typeof obj;
		} : function(obj) {
			return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
		}, _typeof(obj);
	}
	/**
	* The format of errors returned by Matrix API requests
	* made by a WidgetDriver.
	*/
	function isErrorResponse(responseData) {
		var error = responseData.error;
		return _typeof(error) === "object" && error !== null && "message" in error && typeof error.message === "string";
	}
}));
//#endregion
//#region node_modules/matrix-widget-api/lib/interfaces/WidgetKind.js
var require_WidgetKind = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WidgetKind = void 0;
	exports.WidgetKind = /* @__PURE__ */ function(WidgetKind) {
		WidgetKind["Room"] = "room";
		WidgetKind["Account"] = "account";
		WidgetKind["Modal"] = "modal";
		return WidgetKind;
	}({});
}));
//#endregion
//#region node_modules/matrix-widget-api/lib/interfaces/ModalButtonKind.js
var require_ModalButtonKind = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ModalButtonKind = void 0;
	exports.ModalButtonKind = /* @__PURE__ */ function(ModalButtonKind) {
		ModalButtonKind["Primary"] = "m.primary";
		ModalButtonKind["Secondary"] = "m.secondary";
		ModalButtonKind["Warning"] = "m.warning";
		ModalButtonKind["Danger"] = "m.danger";
		ModalButtonKind["Link"] = "m.link";
		return ModalButtonKind;
	}({});
}));
//#endregion
//#region node_modules/matrix-widget-api/lib/models/validation/url.js
var require_url = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isValidUrl = isValidUrl;
	function isValidUrl(val) {
		if (!val) return false;
		try {
			var parsed = new URL(val);
			if (parsed.protocol !== "http" && parsed.protocol !== "https") return false;
			return true;
		} catch (e) {
			if (e instanceof TypeError) return false;
			throw e;
		}
	}
}));
//#endregion
//#region node_modules/matrix-widget-api/lib/models/validation/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.assertPresent = assertPresent;
	function assertPresent(obj, key) {
		if (!obj[key]) throw new Error("".concat(String(key), " is required"));
	}
}));
//#endregion
//#region node_modules/matrix-widget-api/lib/models/Widget.js
var require_Widget = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Widget = void 0;
	var _ = require_lib();
	var _utils = require_utils();
	function _typeof(obj) {
		"@babel/helpers - typeof";
		return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
			return typeof obj;
		} : function(obj) {
			return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
		}, _typeof(obj);
	}
	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
	}
	function _defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ("value" in descriptor) descriptor.writable = true;
			Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
		}
	}
	function _createClass(Constructor, protoProps, staticProps) {
		if (protoProps) _defineProperties(Constructor.prototype, protoProps);
		if (staticProps) _defineProperties(Constructor, staticProps);
		Object.defineProperty(Constructor, "prototype", { writable: false });
		return Constructor;
	}
	function _toPropertyKey(arg) {
		var key = _toPrimitive(arg, "string");
		return _typeof(key) === "symbol" ? key : String(key);
	}
	function _toPrimitive(input, hint) {
		if (_typeof(input) !== "object" || input === null) return input;
		var prim = input[Symbol.toPrimitive];
		if (prim !== void 0) {
			var res = prim.call(input, hint || "default");
			if (_typeof(res) !== "object") return res;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return (hint === "string" ? String : Number)(input);
	}
	exports.Widget = /* @__PURE__ */ function() {
		function Widget(definition) {
			_classCallCheck(this, Widget);
			this.definition = definition;
			if (!this.definition) throw new Error("Definition is required");
			(0, _utils.assertPresent)(definition, "id");
			(0, _utils.assertPresent)(definition, "creatorUserId");
			(0, _utils.assertPresent)(definition, "type");
			(0, _utils.assertPresent)(definition, "url");
		}
		/**
		* The user ID who created the widget.
		*/
		_createClass(Widget, [
			{
				key: "creatorUserId",
				get: function get() {
					return this.definition.creatorUserId;
				}
			},
			{
				key: "type",
				get: function get() {
					return this.definition.type;
				}
			},
			{
				key: "id",
				get: function get() {
					return this.definition.id;
				}
			},
			{
				key: "name",
				get: function get() {
					return this.definition.name || null;
				}
			},
			{
				key: "title",
				get: function get() {
					return this.rawData.title || null;
				}
			},
			{
				key: "templateUrl",
				get: function get() {
					return this.definition.url;
				}
			},
			{
				key: "origin",
				get: function get() {
					return new URL(this.templateUrl).origin;
				}
			},
			{
				key: "waitForIframeLoad",
				get: function get() {
					if (this.definition.waitForIframeLoad === false) return false;
					if (this.definition.waitForIframeLoad === true) return true;
					return true;
				}
			},
			{
				key: "rawData",
				get: function get() {
					return this.definition.data || {};
				}
			},
			{
				key: "getCompleteUrl",
				value: function getCompleteUrl(params) {
					return (0, _.runTemplate)(this.templateUrl, this.definition, params);
				}
			}
		]);
		return Widget;
	}();
}));
//#endregion
//#region node_modules/matrix-widget-api/lib/models/WidgetParser.js
var require_WidgetParser = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WidgetParser = void 0;
	var _Widget = require_Widget();
	var _url = require_url();
	function _typeof(obj) {
		"@babel/helpers - typeof";
		return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
			return typeof obj;
		} : function(obj) {
			return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
		}, _typeof(obj);
	}
	function _createForOfIteratorHelper(o, allowArrayLike) {
		var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
		if (!it) {
			if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
				if (it) o = it;
				var i = 0;
				var F = function F() {};
				return {
					s: F,
					n: function n() {
						if (i >= o.length) return { done: true };
						return {
							done: false,
							value: o[i++]
						};
					},
					e: function e(_e) {
						throw _e;
					},
					f: F
				};
			}
			throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
		}
		var normalCompletion = true, didErr = false, err;
		return {
			s: function s() {
				it = it.call(o);
			},
			n: function n() {
				var step = it.next();
				normalCompletion = step.done;
				return step;
			},
			e: function e(_e2) {
				didErr = true;
				err = _e2;
			},
			f: function f() {
				try {
					if (!normalCompletion && it["return"] != null) it["return"]();
				} finally {
					if (didErr) throw err;
				}
			}
		};
	}
	function _unsupportedIterableToArray(o, minLen) {
		if (!o) return;
		if (typeof o === "string") return _arrayLikeToArray(o, minLen);
		var n = Object.prototype.toString.call(o).slice(8, -1);
		if (n === "Object" && o.constructor) n = o.constructor.name;
		if (n === "Map" || n === "Set") return Array.from(o);
		if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
	}
	function _arrayLikeToArray(arr, len) {
		if (len == null || len > arr.length) len = arr.length;
		for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
		return arr2;
	}
	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
	}
	function _defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ("value" in descriptor) descriptor.writable = true;
			Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
		}
	}
	function _createClass(Constructor, protoProps, staticProps) {
		if (protoProps) _defineProperties(Constructor.prototype, protoProps);
		if (staticProps) _defineProperties(Constructor, staticProps);
		Object.defineProperty(Constructor, "prototype", { writable: false });
		return Constructor;
	}
	function _toPropertyKey(arg) {
		var key = _toPrimitive(arg, "string");
		return _typeof(key) === "symbol" ? key : String(key);
	}
	function _toPrimitive(input, hint) {
		if (_typeof(input) !== "object" || input === null) return input;
		var prim = input[Symbol.toPrimitive];
		if (prim !== void 0) {
			var res = prim.call(input, hint || "default");
			if (_typeof(res) !== "object") return res;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return (hint === "string" ? String : Number)(input);
	}
	exports.WidgetParser = /* @__PURE__ */ function() {
		function WidgetParser() {
			_classCallCheck(this, WidgetParser);
		}
		/**
		* Parses widgets from the "m.widgets" account data event. This will always
		* return an array, though may be empty if no valid widgets were found.
		* @param {IAccountDataWidgets} content The content of the "m.widgets" account data.
		* @returns {Widget[]} The widgets in account data, or an empty array.
		*/
		_createClass(WidgetParser, null, [
			{
				key: "parseAccountData",
				value: function parseAccountData(content) {
					if (!content) return [];
					var result = [];
					for (var _i = 0, _Object$keys = Object.keys(content); _i < _Object$keys.length; _i++) {
						var _widgetId = _Object$keys[_i];
						var roughWidget = content[_widgetId];
						if (!roughWidget) continue;
						if (roughWidget.type !== "m.widget" && roughWidget.type !== "im.vector.modular.widgets") continue;
						if (!roughWidget.sender) continue;
						if ((roughWidget.state_key || roughWidget.id) !== _widgetId) continue;
						var asStateEvent = {
							content: roughWidget.content,
							sender: roughWidget.sender,
							type: "m.widget",
							state_key: _widgetId,
							event_id: "$example",
							room_id: "!example",
							origin_server_ts: 1
						};
						var widget = WidgetParser.parseRoomWidget(asStateEvent);
						if (widget) result.push(widget);
					}
					return result;
				}
			},
			{
				key: "parseWidgetsFromRoomState",
				value: function parseWidgetsFromRoomState(currentState) {
					if (!currentState) return [];
					var result = [];
					var _iterator = _createForOfIteratorHelper(currentState), _step;
					try {
						for (_iterator.s(); !(_step = _iterator.n()).done;) {
							var state = _step.value;
							var widget = WidgetParser.parseRoomWidget(state);
							if (widget) result.push(widget);
						}
					} catch (err) {
						_iterator.e(err);
					} finally {
						_iterator.f();
					}
					return result;
				}
			},
			{
				key: "parseRoomWidget",
				value: function parseRoomWidget(stateEvent) {
					if (!stateEvent) return null;
					if (stateEvent.type !== "m.widget" && stateEvent.type !== "im.vector.modular.widgets") return null;
					var content = stateEvent.content || {};
					var estimatedWidget = {
						id: stateEvent.state_key,
						creatorUserId: content["creatorUserId"] || stateEvent.sender,
						name: content["name"],
						type: content["type"],
						url: content["url"],
						waitForIframeLoad: content["waitForIframeLoad"],
						data: content["data"]
					};
					return WidgetParser.processEstimatedWidget(estimatedWidget);
				}
			},
			{
				key: "processEstimatedWidget",
				value: function processEstimatedWidget(widget) {
					if (!widget.id || !widget.creatorUserId || !widget.type) return null;
					if (!(0, _url.isValidUrl)(widget.url)) return null;
					return new _Widget.Widget(widget);
				}
			}
		]);
		return WidgetParser;
	}();
}));
//#endregion
//#region node_modules/matrix-widget-api/lib/templating/url-template.js
var require_url_template = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.runTemplate = runTemplate;
	exports.toString = toString;
	function runTemplate(url, widget, params) {
		var variables = Object.assign({}, widget.data, {
			"matrix_room_id": params.widgetRoomId || "",
			"matrix_user_id": params.currentUserId,
			"matrix_display_name": params.userDisplayName || params.currentUserId,
			"matrix_avatar_url": params.userHttpAvatarUrl || "",
			"matrix_widget_id": widget.id,
			"org.matrix.msc2873.client_id": params.clientId || "",
			"org.matrix.msc2873.client_theme": params.clientTheme || "",
			"org.matrix.msc2873.client_language": params.clientLanguage || "",
			"org.matrix.msc3819.matrix_device_id": params.deviceId || "",
			"org.matrix.msc4039.matrix_base_url": params.baseUrl || ""
		});
		var result = url;
		for (var _i = 0, _Object$keys = Object.keys(variables); _i < _Object$keys.length; _i++) {
			var key = _Object$keys[_i];
			var pattern = "$".concat(key).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			var rexp = new RegExp(pattern, "g");
			result = result.replace(rexp, encodeURIComponent(toString(variables[key])));
		}
		return result;
	}
	function toString(a) {
		if (a === null || a === void 0) return "".concat(a);
		return String(a);
	}
}));
//#endregion
//#region node_modules/matrix-widget-api/lib/driver/WidgetDriver.js
var require_WidgetDriver = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WidgetDriver = void 0;
	var _ = require_lib();
	function _typeof(obj) {
		"@babel/helpers - typeof";
		return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
			return typeof obj;
		} : function(obj) {
			return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
		}, _typeof(obj);
	}
	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
	}
	function _defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ("value" in descriptor) descriptor.writable = true;
			Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
		}
	}
	function _createClass(Constructor, protoProps, staticProps) {
		if (protoProps) _defineProperties(Constructor.prototype, protoProps);
		if (staticProps) _defineProperties(Constructor, staticProps);
		Object.defineProperty(Constructor, "prototype", { writable: false });
		return Constructor;
	}
	function _toPropertyKey(arg) {
		var key = _toPrimitive(arg, "string");
		return _typeof(key) === "symbol" ? key : String(key);
	}
	function _toPrimitive(input, hint) {
		if (_typeof(input) !== "object" || input === null) return input;
		var prim = input[Symbol.toPrimitive];
		if (prim !== void 0) {
			var res = prim.call(input, hint || "default");
			if (_typeof(res) !== "object") return res;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return (hint === "string" ? String : Number)(input);
	}
	exports.WidgetDriver = /* @__PURE__ */ function() {
		function WidgetDriver() {
			_classCallCheck(this, WidgetDriver);
		}
		_createClass(WidgetDriver, [
			{
				key: "validateCapabilities",
				value: function validateCapabilities(requested) {
					return Promise.resolve(/* @__PURE__ */ new Set());
				}
			},
			{
				key: "sendEvent",
				value: function sendEvent(eventType, content) {
					arguments.length > 2 && arguments[2] !== void 0 && arguments[2];
					arguments.length > 3 && arguments[3] !== void 0 && arguments[3];
					return Promise.reject(/* @__PURE__ */ new Error("Failed to override function"));
				}
			},
			{
				key: "sendStickyEvent",
				value: function sendStickyEvent(stickyDurationMs, eventType, content) {
					arguments.length > 3 && arguments[3] !== void 0 && arguments[3];
					throw new Error("Method not implemented.");
				}
			},
			{
				key: "sendDelayedEvent",
				value: function sendDelayedEvent(delay, parentDelayId, eventType, content) {
					arguments.length > 4 && arguments[4] !== void 0 && arguments[4];
					arguments.length > 5 && arguments[5] !== void 0 && arguments[5];
					return Promise.reject(/* @__PURE__ */ new Error("Failed to override function"));
				}
			},
			{
				key: "sendDelayedStickyEvent",
				value: function sendDelayedStickyEvent(delay, parentDelayId, stickyDurationMs, eventType, content) {
					arguments.length > 5 && arguments[5] !== void 0 && arguments[5];
					throw new Error("Method not implemented.");
				}
			},
			{
				key: "cancelScheduledDelayedEvent",
				value: function cancelScheduledDelayedEvent(delayId) {
					return Promise.reject(/* @__PURE__ */ new Error("Failed to override function"));
				}
			},
			{
				key: "restartScheduledDelayedEvent",
				value: function restartScheduledDelayedEvent(delayId) {
					return Promise.reject(/* @__PURE__ */ new Error("Failed to override function"));
				}
			},
			{
				key: "sendScheduledDelayedEvent",
				value: function sendScheduledDelayedEvent(delayId) {
					return Promise.reject(/* @__PURE__ */ new Error("Failed to override function"));
				}
			},
			{
				key: "sendToDevice",
				value: function sendToDevice(eventType, encrypted, contentMap) {
					return Promise.reject(/* @__PURE__ */ new Error("Failed to override function"));
				}
			},
			{
				key: "readRoomAccountData",
				value: function readRoomAccountData(eventType) {
					arguments.length > 1 && arguments[1] !== void 0 && arguments[1];
					return Promise.resolve([]);
				}
			},
			{
				key: "readRoomEvents",
				value: function readRoomEvents(eventType, msgtype, limit) {
					arguments.length > 3 && arguments[3] !== void 0 && arguments[3];
					arguments.length > 4 && arguments[4];
					return Promise.resolve([]);
				}
			},
			{
				key: "readStateEvents",
				value: function readStateEvents(eventType, stateKey, limit) {
					arguments.length > 3 && arguments[3] !== void 0 && arguments[3];
					return Promise.resolve([]);
				}
			},
			{
				key: "readStickyEvents",
				value: function readStickyEvents(roomId) {
					throw new Error("readStickyEvents is not implemented");
				}
			},
			{
				key: "readRoomTimeline",
				value: function readRoomTimeline(roomId, eventType, msgtype, stateKey, limit, since) {
					if (stateKey === void 0) return this.readRoomEvents(eventType, msgtype, limit, [roomId], since);
					else return this.readStateEvents(eventType, stateKey, limit, [roomId]);
				}
			},
			{
				key: "readRoomState",
				value: function readRoomState(roomId, eventType, stateKey) {
					return this.readStateEvents(eventType, stateKey, Number.MAX_SAFE_INTEGER, [roomId]);
				}
			},
			{
				key: "readEventRelations",
				value: function readEventRelations(eventId, roomId, relationType, eventType, from, to, limit, direction) {
					return Promise.resolve({ chunk: [] });
				}
			},
			{
				key: "askOpenID",
				value: function askOpenID(observer) {
					observer.update({ state: _.OpenIDRequestState.Blocked });
				}
			},
			{
				key: "navigate",
				value: function navigate(uri) {
					throw new Error("Navigation is not implemented");
				}
			},
			{
				key: "getTurnServers",
				value: function getTurnServers() {
					throw new Error("TURN server support is not implemented");
				}
			},
			{
				key: "searchUserDirectory",
				value: function searchUserDirectory(searchTerm, limit) {
					return Promise.resolve({
						limited: false,
						results: []
					});
				}
			},
			{
				key: "getMediaConfig",
				value: function getMediaConfig() {
					throw new Error("Get media config is not implemented");
				}
			},
			{
				key: "uploadFile",
				value: function uploadFile(file) {
					throw new Error("Upload file is not implemented");
				}
			},
			{
				key: "downloadFile",
				value: function downloadFile(contentUri) {
					throw new Error("Download file is not implemented");
				}
			},
			{
				key: "getKnownRooms",
				value: function getKnownRooms() {
					throw new Error("Querying known rooms is not implemented");
				}
			},
			{
				key: "processError",
				value: function processError(error) {}
			}
		]);
		return WidgetDriver;
	}();
}));
//#endregion
//#region node_modules/matrix-widget-api/lib/index.js
var require_lib = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var _WidgetApi = require_WidgetApi();
	Object.keys(_WidgetApi).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (key in exports && exports[key] === _WidgetApi[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function get() {
				return _WidgetApi[key];
			}
		});
	});
	var _ClientWidgetApi = require_ClientWidgetApi();
	Object.keys(_ClientWidgetApi).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (key in exports && exports[key] === _ClientWidgetApi[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function get() {
				return _ClientWidgetApi[key];
			}
		});
	});
	var _Symbols = require_Symbols();
	Object.keys(_Symbols).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (key in exports && exports[key] === _Symbols[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function get() {
				return _Symbols[key];
			}
		});
	});
	var _PostmessageTransport = require_PostmessageTransport();
	Object.keys(_PostmessageTransport).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (key in exports && exports[key] === _PostmessageTransport[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function get() {
				return _PostmessageTransport[key];
			}
		});
	});
	var _WidgetType = require_WidgetType();
	Object.keys(_WidgetType).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (key in exports && exports[key] === _WidgetType[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function get() {
				return _WidgetType[key];
			}
		});
	});
	var _IWidgetApiErrorResponse = require_IWidgetApiErrorResponse();
	Object.keys(_IWidgetApiErrorResponse).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (key in exports && exports[key] === _IWidgetApiErrorResponse[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function get() {
				return _IWidgetApiErrorResponse[key];
			}
		});
	});
	var _WidgetApiAction = require_WidgetApiAction();
	Object.keys(_WidgetApiAction).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (key in exports && exports[key] === _WidgetApiAction[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function get() {
				return _WidgetApiAction[key];
			}
		});
	});
	var _WidgetApiDirection = require_WidgetApiDirection();
	Object.keys(_WidgetApiDirection).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (key in exports && exports[key] === _WidgetApiDirection[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function get() {
				return _WidgetApiDirection[key];
			}
		});
	});
	var _ApiVersion = require_ApiVersion();
	Object.keys(_ApiVersion).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (key in exports && exports[key] === _ApiVersion[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function get() {
				return _ApiVersion[key];
			}
		});
	});
	var _Capabilities = require_Capabilities();
	Object.keys(_Capabilities).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (key in exports && exports[key] === _Capabilities[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function get() {
				return _Capabilities[key];
			}
		});
	});
	var _GetOpenIDAction = require_GetOpenIDAction();
	Object.keys(_GetOpenIDAction).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (key in exports && exports[key] === _GetOpenIDAction[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function get() {
				return _GetOpenIDAction[key];
			}
		});
	});
	var _WidgetKind = require_WidgetKind();
	Object.keys(_WidgetKind).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (key in exports && exports[key] === _WidgetKind[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function get() {
				return _WidgetKind[key];
			}
		});
	});
	var _ModalButtonKind = require_ModalButtonKind();
	Object.keys(_ModalButtonKind).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (key in exports && exports[key] === _ModalButtonKind[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function get() {
				return _ModalButtonKind[key];
			}
		});
	});
	var _ModalWidgetActions = require_ModalWidgetActions();
	Object.keys(_ModalWidgetActions).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (key in exports && exports[key] === _ModalWidgetActions[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function get() {
				return _ModalWidgetActions[key];
			}
		});
	});
	var _UpdateDelayedEventAction = require_UpdateDelayedEventAction();
	Object.keys(_UpdateDelayedEventAction).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (key in exports && exports[key] === _UpdateDelayedEventAction[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function get() {
				return _UpdateDelayedEventAction[key];
			}
		});
	});
	var _WidgetEventCapability = require_WidgetEventCapability();
	Object.keys(_WidgetEventCapability).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (key in exports && exports[key] === _WidgetEventCapability[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function get() {
				return _WidgetEventCapability[key];
			}
		});
	});
	var _url = require_url();
	Object.keys(_url).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (key in exports && exports[key] === _url[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function get() {
				return _url[key];
			}
		});
	});
	var _utils = require_utils();
	Object.keys(_utils).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (key in exports && exports[key] === _utils[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function get() {
				return _utils[key];
			}
		});
	});
	var _Widget = require_Widget();
	Object.keys(_Widget).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (key in exports && exports[key] === _Widget[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function get() {
				return _Widget[key];
			}
		});
	});
	var _WidgetParser = require_WidgetParser();
	Object.keys(_WidgetParser).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (key in exports && exports[key] === _WidgetParser[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function get() {
				return _WidgetParser[key];
			}
		});
	});
	var _urlTemplate = require_url_template();
	Object.keys(_urlTemplate).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (key in exports && exports[key] === _urlTemplate[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function get() {
				return _urlTemplate[key];
			}
		});
	});
	var _SimpleObservable = require_SimpleObservable();
	Object.keys(_SimpleObservable).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (key in exports && exports[key] === _SimpleObservable[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function get() {
				return _SimpleObservable[key];
			}
		});
	});
	var _WidgetDriver = require_WidgetDriver();
	Object.keys(_WidgetDriver).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (key in exports && exports[key] === _WidgetDriver[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function get() {
				return _WidgetDriver[key];
			}
		});
	});
}));
require_lib();
//#endregion
//#region node_modules/matrix-js-sdk/lib/receipt-accumulator.js
/**
* Summarises the read receipts within a room. Used by the sync accumulator.
*
* Given receipts for users, picks the most recently-received one and provides
* the results in a new fake receipt event returned from
* buildAccumulatedReceiptEvent().
*
* Handles unthreaded receipts and receipts in each thread separately, so the
* returned event contains the most recently received unthreaded receipt, and
* the most recently received receipt in each thread.
*/
var ReceiptAccumulator = class {
	constructor() {
		/** user_id -\> most-recently-received unthreaded receipt */
		(0, import_defineProperty.default)(this, "unthreadedReadReceipts", /* @__PURE__ */ new Map());
		/** thread_id -\> user_id -\> most-recently-received receipt for this thread */
		(0, import_defineProperty.default)(this, "threadedReadReceipts", new MapWithDefault(() => /* @__PURE__ */ new Map()));
	}
	/**
	* Provide an unthreaded receipt for this user. Overwrites any other
	* unthreaded receipt we have for this user.
	*/
	setUnthreaded(userId, receipt) {
		this.unthreadedReadReceipts.set(userId, receipt);
	}
	/**
	* Provide a receipt for this user in this thread. Overwrites any other
	* receipt we have for this user in this thread.
	*/
	setThreaded(threadId, userId, receipt) {
		this.threadedReadReceipts.getOrCreate(threadId).set(userId, receipt);
	}
	/**
	* @returns an iterator of pairs of [userId, AccumulatedReceipt] - all the
	*          most recently-received unthreaded receipts for each user.
	*/
	allUnthreaded() {
		return this.unthreadedReadReceipts.entries();
	}
	/**
	* @returns an iterator of pairs of [userId, AccumulatedReceipt] - all the
	*          most recently-received threaded receipts for each user, in all
	*          threads.
	*/
	*allThreaded() {
		for (var receiptsForThread of this.threadedReadReceipts.values()) for (var e of receiptsForThread.entries()) yield e;
	}
	/**
	* Given a list of ephemeral events, find the receipts and store the
	* relevant ones to be returned later from buildAccumulatedReceiptEvent().
	*/
	consumeEphemeralEvents(events) {
		events === null || events === void 0 || events.forEach((e) => {
			if (e.type !== EventType$1.Receipt || !e.content) return;
			Object.keys(e.content).forEach((eventId) => {
				Object.entries(e.content[eventId]).forEach((_ref) => {
					var [key, value] = _ref;
					if (!isSupportedReceiptType(key)) return;
					for (var userId of Object.keys(value)) {
						var data = e.content[eventId][key][userId];
						var receipt = {
							data: e.content[eventId][key][userId],
							type: key,
							eventId
						};
						if (!data.thread_id) this.setUnthreaded(userId, receipt);
						else this.setThreaded(data.thread_id, userId, receipt);
					}
				});
			});
		});
	}
	/**
	* Build a receipt event that contains all relevant information for this
	* room, taking the most recently received receipt for each user in an
	* unthreaded context, and in each thread.
	*/
	buildAccumulatedReceiptEvent(roomId) {
		var receiptEvent = {
			type: EventType$1.Receipt,
			room_id: roomId,
			content: {}
		};
		var receiptEventContent = new MapWithDefault(() => new MapWithDefault(() => /* @__PURE__ */ new Map()));
		for (var [userId, receiptData] of this.allUnthreaded()) receiptEventContent.getOrCreate(receiptData.eventId).getOrCreate(receiptData.type).set(userId, receiptData.data);
		for (var [_userId, _receiptData] of this.allThreaded()) receiptEventContent.getOrCreate(_receiptData.eventId).getOrCreate(_receiptData.type).set(_userId, _receiptData.data);
		receiptEvent.content = recursiveMapToObject(receiptEventContent);
		return receiptEventContent.size > 0 ? receiptEvent : null;
	}
};
//#endregion
//#region node_modules/matrix-js-sdk/lib/sync-accumulator.js
/**
* This is an internal module. See {@link SyncAccumulator} for the public class.
*/
/** A to-device message as received from the sync. */
/**
* A (possibly decrypted) to-device message after it has been successfully processed by the sdk.
*
* If the message was encrypted, the `encryptionInfo` field will contain the encryption information.
* If the message was sent in clear, this field will be null.
*
* The `message` field contains the message `type`, `content`, and `sender` as if the message was sent in clear.
*/
var Category = /* @__PURE__ */ function(Category) {
	Category["Invite"] = "invite";
	Category["Leave"] = "leave";
	Category["Join"] = "join";
	Category["Knock"] = "knock";
	return Category;
}({});
function isTaggedEvent(event) {
	return "_localTs" in event && event["_localTs"] !== void 0;
}
/**
* The purpose of this class is to accumulate /sync responses such that a
* complete "initial" JSON response can be returned which accurately represents
* the sum total of the /sync responses accumulated to date. It only handles
* room data: that is, everything under the "rooms" top-level key.
*
* This class is used when persisting room data so a complete /sync response can
* be loaded from disk and incremental syncs can be performed on the server,
* rather than asking the server to do an initial sync on startup.
*/
var SyncAccumulator = class {
	constructor() {
		this.opts = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
		(0, import_defineProperty.default)(this, "accountData", {});
		(0, import_defineProperty.default)(this, "inviteRooms", {});
		(0, import_defineProperty.default)(this, "knockRooms", {});
		(0, import_defineProperty.default)(this, "joinRooms", {});
		(0, import_defineProperty.default)(this, "nextBatch", null);
		this.opts.maxTimelineEntries = this.opts.maxTimelineEntries || 50;
	}
	accumulate(syncResponse) {
		var fromDatabase = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
		this.accumulateRooms(syncResponse, fromDatabase);
		this.accumulateAccountData(syncResponse);
		this.nextBatch = syncResponse.next_batch;
	}
	accumulateAccountData(syncResponse) {
		if (!syncResponse.account_data || !syncResponse.account_data.events) return;
		syncResponse.account_data.events.forEach((e) => {
			this.accountData[e.type] = e;
		});
	}
	/**
	* Accumulate incremental /sync room data.
	* @param syncResponse - the complete /sync JSON
	* @param fromDatabase - True if the sync response is one saved to the database
	*/
	accumulateRooms(syncResponse) {
		var fromDatabase = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
		if (!syncResponse.rooms) return;
		if (syncResponse.rooms.invite) Object.keys(syncResponse.rooms.invite).forEach((roomId) => {
			this.accumulateRoom(roomId, Category.Invite, syncResponse.rooms.invite[roomId], fromDatabase);
		});
		if (syncResponse.rooms.join) Object.keys(syncResponse.rooms.join).forEach((roomId) => {
			this.accumulateRoom(roomId, Category.Join, syncResponse.rooms.join[roomId], fromDatabase);
		});
		if (syncResponse.rooms.leave) Object.keys(syncResponse.rooms.leave).forEach((roomId) => {
			this.accumulateRoom(roomId, Category.Leave, syncResponse.rooms.leave[roomId], fromDatabase);
		});
		if (syncResponse.rooms.knock) Object.keys(syncResponse.rooms.knock).forEach((roomId) => {
			this.accumulateRoom(roomId, Category.Knock, syncResponse.rooms.knock[roomId], fromDatabase);
		});
	}
	accumulateRoom(roomId, category, data) {
		var fromDatabase = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : false;
		switch (category) {
			case Category.Invite:
				if (this.knockRooms[roomId]) delete this.knockRooms[roomId];
				this.accumulateInviteState(roomId, data);
				break;
			case Category.Knock:
				this.accumulateKnockState(roomId, data);
				break;
			case Category.Join:
				if (this.knockRooms[roomId]) delete this.knockRooms[roomId];
				else if (this.inviteRooms[roomId]) delete this.inviteRooms[roomId];
				this.accumulateJoinState(roomId, data, fromDatabase);
				break;
			case Category.Leave:
				if (this.knockRooms[roomId]) delete this.knockRooms[roomId];
				else if (this.inviteRooms[roomId]) delete this.inviteRooms[roomId];
				else delete this.joinRooms[roomId];
				break;
			default: logger.error("Unknown cateogory: ", category);
		}
	}
	accumulateInviteState(roomId, data) {
		if (!data.invite_state || !data.invite_state.events) return;
		if (!this.inviteRooms[roomId]) {
			this.inviteRooms[roomId] = { invite_state: data.invite_state };
			return;
		}
		var currentData = this.inviteRooms[roomId];
		data.invite_state.events.forEach((e) => {
			var hasAdded = false;
			for (var i = 0; i < currentData.invite_state.events.length; i++) {
				var current = currentData.invite_state.events[i];
				if (current.type === e.type && current.state_key == e.state_key) {
					currentData.invite_state.events[i] = e;
					hasAdded = true;
				}
			}
			if (!hasAdded) currentData.invite_state.events.push(e);
		});
	}
	accumulateKnockState(roomId, data) {
		if (!data.knock_state || !data.knock_state.events) return;
		if (!this.knockRooms[roomId]) {
			this.knockRooms[roomId] = { knock_state: data.knock_state };
			return;
		}
		var currentData = this.knockRooms[roomId];
		data.knock_state.events.forEach((e) => {
			var hasAdded = false;
			for (var i = 0; i < currentData.knock_state.events.length; i++) {
				var current = currentData.knock_state.events[i];
				if (current.type === e.type && current.state_key == e.state_key) {
					currentData.knock_state.events[i] = e;
					hasAdded = true;
				}
			}
			if (!hasAdded) currentData.knock_state.events.push(e);
		});
	}
	accumulateJoinState(roomId, data) {
		var _ref, _data, _data$ephemeral, _data$state, _data$orgMatrixMsc, _data$timeline, _data$msc4354_sticky;
		var fromDatabase = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
		var now = Date.now();
		if (!this.joinRooms[roomId]) this.joinRooms[roomId] = {
			_currentState: Object.create(null),
			_timeline: [],
			_accountData: Object.create(null),
			_unreadNotifications: {},
			_unreadThreadNotifications: {},
			_summary: {},
			_receipts: new ReceiptAccumulator(),
			_stickyEvents: []
		};
		var currentData = this.joinRooms[roomId];
		if (data.account_data && data.account_data.events) data.account_data.events.forEach((e) => {
			currentData._accountData[e.type] = e;
		});
		if (data.unread_notifications) currentData._unreadNotifications = data.unread_notifications;
		currentData._unreadThreadNotifications = (_ref = (_data = data[UNREAD_THREAD_NOTIFICATIONS.stable]) !== null && _data !== void 0 ? _data : data[UNREAD_THREAD_NOTIFICATIONS.unstable]) !== null && _ref !== void 0 ? _ref : void 0;
		if (data.summary) {
			var _sum$HEROES_KEY, _sum$JOINED_COUNT_KEY, _sum$INVITED_COUNT_KE;
			var HEROES_KEY = "m.heroes";
			var INVITED_COUNT_KEY = "m.invited_member_count";
			var JOINED_COUNT_KEY = "m.joined_member_count";
			var acc = currentData._summary;
			var sum = data.summary;
			acc[HEROES_KEY] = (_sum$HEROES_KEY = sum[HEROES_KEY]) !== null && _sum$HEROES_KEY !== void 0 ? _sum$HEROES_KEY : acc[HEROES_KEY];
			acc[JOINED_COUNT_KEY] = (_sum$JOINED_COUNT_KEY = sum[JOINED_COUNT_KEY]) !== null && _sum$JOINED_COUNT_KEY !== void 0 ? _sum$JOINED_COUNT_KEY : acc[JOINED_COUNT_KEY];
			acc[INVITED_COUNT_KEY] = (_sum$INVITED_COUNT_KE = sum[INVITED_COUNT_KEY]) !== null && _sum$INVITED_COUNT_KE !== void 0 ? _sum$INVITED_COUNT_KE : acc[INVITED_COUNT_KEY];
		}
		currentData._receipts.consumeEphemeralEvents((_data$ephemeral = data.ephemeral) === null || _data$ephemeral === void 0 ? void 0 : _data$ephemeral.events);
		if (data.timeline && data.timeline.limited) currentData._timeline = [];
		(_data$state = data.state) === null || _data$state === void 0 || (_data$state = _data$state.events) === null || _data$state === void 0 || _data$state.forEach((e) => {
			setState(currentData._currentState, e);
		});
		(_data$orgMatrixMsc = data["org.matrix.msc4222.state_after"]) === null || _data$orgMatrixMsc === void 0 || (_data$orgMatrixMsc = _data$orgMatrixMsc.events) === null || _data$orgMatrixMsc === void 0 || _data$orgMatrixMsc.forEach((e) => {
			setState(currentData._currentState, e);
		});
		(_data$timeline = data.timeline) === null || _data$timeline === void 0 || (_data$timeline = _data$timeline.events) === null || _data$timeline === void 0 || _data$timeline.forEach((e, index) => {
			var _data$timeline$prev_b;
			if (!data["org.matrix.msc4222.state_after"]) setState(currentData._currentState, e);
			var transformedEvent;
			if (!fromDatabase) {
				var _e$unsigned;
				transformedEvent = Object.assign({}, e);
				if (transformedEvent.unsigned !== void 0) transformedEvent.unsigned = Object.assign({}, transformedEvent.unsigned);
				var age = (_e$unsigned = e.unsigned) === null || _e$unsigned === void 0 ? void 0 : _e$unsigned.age;
				if (age !== void 0) transformedEvent._localTs = Date.now() - age;
			} else transformedEvent = e;
			currentData._timeline.push({
				event: transformedEvent,
				token: index === 0 ? (_data$timeline$prev_b = data.timeline.prev_batch) !== null && _data$timeline$prev_b !== void 0 ? _data$timeline$prev_b : null : null
			});
		});
		currentData._stickyEvents = currentData._stickyEvents.filter((_ref2) => {
			var { expiresTs } = _ref2;
			return expiresTs > now;
		});
		if ((_data$msc4354_sticky = data.msc4354_sticky) !== null && _data$msc4354_sticky !== void 0 && _data$msc4354_sticky.events) currentData._stickyEvents = currentData._stickyEvents.concat(data.msc4354_sticky.events.map((event) => {
			return {
				event,
				expiresTs: Math.min(event.msc4354_sticky.duration_ms, MAX_STICKY_DURATION_MS) + Math.min(event.origin_server_ts, now)
			};
		}));
		if (currentData._timeline.length > this.opts.maxTimelineEntries) {
			for (var i = currentData._timeline.length - this.opts.maxTimelineEntries; i < currentData._timeline.length; i++) if (currentData._timeline[i].token) {
				currentData._timeline = currentData._timeline.slice(i, currentData._timeline.length);
				break;
			}
		}
	}
	/**
	* Return everything under the 'rooms' key from a /sync response which
	* represents all room data that should be stored. This should be paired
	* with the sync token which represents the most recent /sync response
	* provided to accumulate().
	* @param forDatabase - True to generate a sync to be saved to storage
	* @returns An object with a "nextBatch", "roomsData" and "accountData"
	* keys.
	* The "nextBatch" key is a string which represents at what point in the
	* /sync stream the accumulator reached. This token should be used when
	* restarting a /sync stream at startup. Failure to do so can lead to missing
	* events. The "roomsData" key is an Object which represents the entire
	* /sync response from the 'rooms' key onwards. The "accountData" key is
	* a list of raw events which represent global account data.
	*/
	getJSON() {
		var forDatabase = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false;
		var data = {
			join: {},
			invite: {},
			knock: {},
			leave: {}
		};
		Object.keys(this.inviteRooms).forEach((roomId) => {
			data.invite[roomId] = this.inviteRooms[roomId];
		});
		Object.keys(this.knockRooms).forEach((roomId) => {
			data.knock[roomId] = this.knockRooms[roomId];
		});
		Object.keys(this.joinRooms).forEach((roomId) => {
			var _roomData$_stickyEven;
			var roomData = this.joinRooms[roomId];
			var roomJson = {
				"ephemeral": { events: [] },
				"account_data": { events: [] },
				"state": { events: [] },
				"org.matrix.msc4222.state_after": { events: [] },
				"timeline": {
					events: [],
					prev_batch: null
				},
				"unread_notifications": roomData._unreadNotifications,
				"unread_thread_notifications": roomData._unreadThreadNotifications,
				"summary": roomData._summary,
				"msc4354_sticky": (_roomData$_stickyEven = roomData._stickyEvents) !== null && _roomData$_stickyEven !== void 0 && _roomData$_stickyEven.length ? { events: roomData._stickyEvents.map((e) => e.event) } : void 0
			};
			Object.keys(roomData._accountData).forEach((evType) => {
				roomJson.account_data.events.push(roomData._accountData[evType]);
			});
			var receiptEvent = roomData._receipts.buildAccumulatedReceiptEvent(roomId);
			if (receiptEvent) roomJson.ephemeral.events.push(receiptEvent);
			roomData._timeline.forEach((msgData) => {
				if (!roomJson.timeline.prev_batch) {
					if (!msgData.token) return;
					roomJson.timeline.prev_batch = msgData.token;
				}
				var transformedEvent;
				if (!forDatabase && isTaggedEvent(msgData.event)) {
					transformedEvent = Object.assign({}, msgData.event);
					if (transformedEvent.unsigned !== void 0) transformedEvent.unsigned = Object.assign({}, transformedEvent.unsigned);
					delete transformedEvent._localTs;
					transformedEvent.unsigned = transformedEvent.unsigned || {};
					transformedEvent.unsigned.age = Date.now() - msgData.event._localTs;
				} else transformedEvent = msgData.event;
				roomJson.timeline.events.push(transformedEvent);
			});
			var rollBackState = Object.create(null);
			for (var i = roomJson.timeline.events.length - 1; i >= 0; i--) {
				var timelineEvent = roomJson.timeline.events[i];
				if (timelineEvent.state_key === null || timelineEvent.state_key === void 0) continue;
				var prevStateEvent = deepCopy(timelineEvent);
				if (prevStateEvent.unsigned) {
					if (prevStateEvent.unsigned.prev_content) prevStateEvent.content = prevStateEvent.unsigned.prev_content;
					if (prevStateEvent.unsigned.prev_sender) prevStateEvent.sender = prevStateEvent.unsigned.prev_sender;
				}
				setState(rollBackState, prevStateEvent);
			}
			Object.keys(roomData._currentState).forEach((evType) => {
				Object.keys(roomData._currentState[evType]).forEach((stateKey) => {
					var ev = roomData._currentState[evType][stateKey];
					roomJson["org.matrix.msc4222.state_after"].events.push(ev);
					if (rollBackState[evType] && rollBackState[evType][stateKey]) ev = rollBackState[evType][stateKey];
					roomJson.state.events.push(ev);
				});
			});
			data.join[roomId] = roomJson;
		});
		var accData = [];
		Object.keys(this.accountData).forEach((evType) => {
			accData.push(this.accountData[evType]);
		});
		return {
			nextBatch: this.nextBatch,
			roomsData: data,
			accountData: accData
		};
	}
	getNextBatchToken() {
		return this.nextBatch;
	}
};
function setState(eventMap, event) {
	if (event.state_key === null || event.state_key === void 0 || !event.type) return;
	if (!eventMap[event.type]) eventMap[event.type] = Object.create(null);
	eventMap[event.type][event.state_key] = event;
}
new UnstableValue("oauth_aware_preferred", "org.matrix.msc3824.delegated_oidc_compatibility");
/**
* A client can identify a user using their Matrix ID.
* This can either be the fully qualified Matrix user ID, or just the localpart of the user ID.
* @see https://spec.matrix.org/v1.7/client-server-api/#matrix-user-id
*/
/**
* A client can identify a user using a 3PID associated with the user’s account on the homeserver,
* where the 3PID was previously associated using the /account/3pid API.
* See the 3PID Types Appendix for a list of Third-party ID media.
* @see https://spec.matrix.org/v1.7/client-server-api/#third-party-id
*/
/**
* A client can identify a user using a phone number associated with the user’s account,
* where the phone number was previously associated using the /account/3pid API.
* The phone number can be passed in as entered by the user; the homeserver will be responsible for canonicalising it.
* If the client wishes to canonicalise the phone number,
* then it can use the m.id.thirdparty identifier type with a medium of msisdn instead.
*
* The country is the two-letter uppercase ISO-3166-1 alpha-2 country code that the number in phone should be parsed as if it were dialled from.
*
* @see https://spec.matrix.org/v1.7/client-server-api/#phone-number
*/
/**
* User Identifiers usable for login & user-interactive authentication.
*
* Extensibly allows more than Matrix specified identifiers.
*/
/**
* Request body for POST /login request
* @see https://spec.matrix.org/v1.7/client-server-api/#post_matrixclientv3login
*/
/**
* Response body for POST /login request
* @see https://spec.matrix.org/v1.7/client-server-api/#post_matrixclientv3login
*/
/**
* The result of a successful `m.login.token` issuance request as per https://spec.matrix.org/v1.7/client-server-api/#post_matrixclientv1loginget_token
*/
//#endregion
//#region node_modules/matrix-js-sdk/lib/store/local-storage-events-emitter.js
/**
* Used in element-web as a temporary hack to handle all the localStorage errors on the highest level possible
* As of 15.11.2021 (DD/MM/YYYY) we're not properly handling local storage exceptions anywhere.
* This store, as an event emitter, is used to re-emit local storage exceptions so that we can handle them
* and show some kind of a "It's dead Jim" modal to the users, telling them that hey,
* maybe you should check out your disk, as it's probably dying and your session may die with it.
* See: https://github.com/vector-im/element-web/issues/18423
*/
var LocalStorageErrorsEventsEmitter = class extends TypedEventEmitter {};
new LocalStorageErrorsEventsEmitter();
//#endregion
//#region node_modules/matrix-js-sdk/lib/matrix.js
var cryptoStoreFactory = () => new MemoryCryptoStore();
function amendClientOpts(opts) {
	var _opts$store, _opts$scheduler, _opts$cryptoStore;
	opts.store = (_opts$store = opts.store) !== null && _opts$store !== void 0 ? _opts$store : new MemoryStore({ localStorage: globalThis.localStorage });
	opts.scheduler = (_opts$scheduler = opts.scheduler) !== null && _opts$scheduler !== void 0 ? _opts$scheduler : new MatrixScheduler();
	opts.cryptoStore = (_opts$cryptoStore = opts.cryptoStore) !== null && _opts$cryptoStore !== void 0 ? _opts$cryptoStore : cryptoStoreFactory();
	return opts;
}
/**
* Construct a Matrix Client. Similar to {@link MatrixClient}
* except that the 'request', 'store' and 'scheduler' dependencies are satisfied.
* @param opts - The configuration options for this client. These configuration
* options will be passed directly to {@link MatrixClient}.
*
* @returns A new matrix client.
* @see {@link MatrixClient} for the full list of options for
* `opts`.
*/
function createClient(opts) {
	return new MatrixClient$1(amendClientOpts(opts));
}
//#endregion
//#region node_modules/matrix-js-sdk/lib/index.js
if (globalThis.__js_sdk_entrypoint) throw new Error("Multiple matrix-js-sdk entrypoints detected!");
globalThis.__js_sdk_entrypoint = true;
//#endregion
//#region extensions/matrix/src/matrix/backup-health.ts
function resolveMatrixRoomKeyBackupIssue(backup) {
	if (!backup.serverVersion) return {
		code: "missing-server-backup",
		summary: "missing on server",
		message: "no room-key backup exists on the homeserver"
	};
	if (backup.decryptionKeyCached === false) {
		if (backup.keyLoadError) return {
			code: "key-load-failed",
			summary: "present but backup key unavailable on this device",
			message: `backup decryption key could not be loaded from secret storage (${backup.keyLoadError})`
		};
		if (backup.keyLoadAttempted) return {
			code: "key-not-loaded",
			summary: "present but backup key unavailable on this device",
			message: "backup decryption key is not loaded on this device (secret storage did not return a key)"
		};
		return {
			code: "key-not-loaded",
			summary: "present but backup key unavailable on this device",
			message: "backup decryption key is not loaded on this device"
		};
	}
	if (backup.matchesDecryptionKey === false) return {
		code: "key-mismatch",
		summary: "present but backup key mismatch on this device",
		message: "backup key mismatch (this device does not have the matching backup decryption key)"
	};
	if (backup.trusted === false) return {
		code: "untrusted-signature",
		summary: "present but not trusted on this device",
		message: "backup signature chain is not trusted by this device"
	};
	if (!backup.activeVersion) return {
		code: "inactive",
		summary: "present on server but inactive on this device",
		message: "backup exists but is not active on this device"
	};
	if (backup.trusted === null || backup.matchesDecryptionKey === null || backup.decryptionKeyCached === null) return {
		code: "indeterminate",
		summary: "present but trust state unknown",
		message: "backup trust state could not be fully determined"
	};
	return {
		code: "ok",
		summary: "active and trusted on this device",
		message: null
	};
}
function resolveMatrixRoomKeyBackupReadinessError(backup, opts) {
	const issue = resolveMatrixRoomKeyBackupIssue(backup);
	if (issue.code === "missing-server-backup") return opts.requireServerBackup ? "Matrix room key backup is missing on the homeserver." : null;
	if (issue.code === "ok") return null;
	if (issue.message) return `Matrix room key backup is not usable: ${issue.message}.`;
	return "Matrix room key backup is not usable on this device.";
}
//#endregion
//#region extensions/matrix/src/matrix/sdk/logger.ts
function noop() {}
let forceConsoleLogging = false;
function setMatrixConsoleLogging(enabled) {
	forceConsoleLogging = enabled;
}
function resolveRuntimeLogger(module) {
	if (forceConsoleLogging) return null;
	try {
		return getMatrixRuntime().logging.getChildLogger({ module: `matrix:${module}` });
	} catch {
		return null;
	}
}
function formatMessage(module, messageOrObject) {
	if (messageOrObject.length === 0) return `[${module}]`;
	return redactSensitiveText(`[${module}] ${format(...messageOrObject)}`);
}
var ConsoleLogger = class {
	emit(level, module, ...messageOrObject) {
		const runtimeLogger = resolveRuntimeLogger(module);
		const message = formatMessage(module, messageOrObject);
		if (runtimeLogger) {
			if (level === "debug") {
				runtimeLogger.debug?.(message);
				return;
			}
			runtimeLogger[level](message);
			return;
		}
		if (level === "debug") {
			console.debug(message);
			return;
		}
		console[level](message);
	}
	trace(module, ...messageOrObject) {
		this.emit("debug", module, ...messageOrObject);
	}
	debug(module, ...messageOrObject) {
		this.emit("debug", module, ...messageOrObject);
	}
	info(module, ...messageOrObject) {
		this.emit("info", module, ...messageOrObject);
	}
	warn(module, ...messageOrObject) {
		this.emit("warn", module, ...messageOrObject);
	}
	error(module, ...messageOrObject) {
		this.emit("error", module, ...messageOrObject);
	}
};
let activeLogger = new ConsoleLogger();
const LogService = {
	setLogger(logger) {
		activeLogger = logger;
	},
	trace(module, ...messageOrObject) {
		activeLogger.trace(module, ...messageOrObject);
	},
	debug(module, ...messageOrObject) {
		activeLogger.debug(module, ...messageOrObject);
	},
	info(module, ...messageOrObject) {
		activeLogger.info(module, ...messageOrObject);
	},
	warn(module, ...messageOrObject) {
		activeLogger.warn(module, ...messageOrObject);
	},
	error(module, ...messageOrObject) {
		activeLogger.error(module, ...messageOrObject);
	}
};
//#endregion
//#region extensions/matrix/src/matrix/client/file-sync-store.ts
const STORE_VERSION = 1;
const PERSIST_DEBOUNCE_MS = 250;
function createAsyncLock() {
	let lock = Promise.resolve();
	return async function withLock(fn) {
		const previous = lock;
		let release;
		lock = new Promise((resolve) => {
			release = resolve;
		});
		await previous;
		try {
			return await fn();
		} finally {
			release?.();
		}
	};
}
function isRecord(value) {
	return typeof value === "object" && value !== null;
}
function normalizeRoomsData(value) {
	if (!isRecord(value)) return null;
	return {
		[Category.Join]: isRecord(value[Category.Join]) ? value[Category.Join] : {},
		[Category.Invite]: isRecord(value[Category.Invite]) ? value[Category.Invite] : {},
		[Category.Leave]: isRecord(value[Category.Leave]) ? value[Category.Leave] : {},
		[Category.Knock]: isRecord(value[Category.Knock]) ? value[Category.Knock] : {}
	};
}
function toPersistedSyncData(value) {
	if (!isRecord(value)) return null;
	if (typeof value.nextBatch === "string" && value.nextBatch.trim()) {
		const roomsData = normalizeRoomsData(value.roomsData);
		if (!Array.isArray(value.accountData) || !roomsData) return null;
		return {
			nextBatch: value.nextBatch,
			accountData: value.accountData,
			roomsData
		};
	}
	if (typeof value.next_batch === "string" && value.next_batch.trim()) {
		const roomsData = normalizeRoomsData(value.rooms);
		if (!roomsData) return null;
		return {
			nextBatch: value.next_batch,
			accountData: isRecord(value.account_data) && Array.isArray(value.account_data.events) ? value.account_data.events : [],
			roomsData
		};
	}
	return null;
}
function readPersistedStore(raw) {
	try {
		const parsed = JSON.parse(raw);
		const savedSync = toPersistedSyncData(parsed.savedSync);
		if (parsed.version === STORE_VERSION) return {
			version: STORE_VERSION,
			savedSync,
			clientOptions: isRecord(parsed.clientOptions) ? parsed.clientOptions : void 0,
			cleanShutdown: parsed.cleanShutdown === true
		};
		return {
			version: STORE_VERSION,
			savedSync: toPersistedSyncData(parsed),
			cleanShutdown: false
		};
	} catch {
		return null;
	}
}
function cloneJson(value) {
	return structuredClone(value);
}
function syncDataToSyncResponse(syncData) {
	return {
		next_batch: syncData.nextBatch,
		rooms: syncData.roomsData,
		account_data: { events: syncData.accountData }
	};
}
var FileBackedMatrixSyncStore = class extends MemoryStore {
	constructor(storagePath) {
		super();
		this.storagePath = storagePath;
		this.persistLock = createAsyncLock();
		this.accumulator = new SyncAccumulator();
		this.savedSync = null;
		this.cleanShutdown = false;
		this.dirty = false;
		this.persistTimer = null;
		this.persistPromise = null;
		let restoredSavedSync = null;
		let restoredClientOptions;
		let restoredCleanShutdown = false;
		try {
			const persisted = readPersistedStore(readFileSync(this.storagePath, "utf8"));
			restoredSavedSync = persisted?.savedSync ?? null;
			restoredClientOptions = persisted?.clientOptions;
			restoredCleanShutdown = persisted?.cleanShutdown === true;
		} catch {}
		this.savedSync = restoredSavedSync;
		this.savedClientOptions = restoredClientOptions;
		this.hadSavedSyncOnLoad = restoredSavedSync !== null;
		this.hadCleanShutdownOnLoad = this.hadSavedSyncOnLoad && restoredCleanShutdown;
		this.cleanShutdown = this.hadCleanShutdownOnLoad;
		if (this.savedSync) {
			this.accumulator.accumulate(syncDataToSyncResponse(this.savedSync), true);
			super.setSyncToken(this.savedSync.nextBatch);
		}
		if (this.savedClientOptions) super.storeClientOptions(this.savedClientOptions);
	}
	hasSavedSync() {
		return this.hadSavedSyncOnLoad;
	}
	hasSavedSyncFromCleanShutdown() {
		return this.hadCleanShutdownOnLoad;
	}
	getSavedSync() {
		return Promise.resolve(this.savedSync ? cloneJson(this.savedSync) : null);
	}
	getSavedSyncToken() {
		return Promise.resolve(this.savedSync?.nextBatch ?? null);
	}
	setSyncData(syncData) {
		this.accumulator.accumulate(syncData);
		this.savedSync = this.accumulator.getJSON();
		this.markDirtyAndSchedulePersist();
		return Promise.resolve();
	}
	getClientOptions() {
		return Promise.resolve(this.savedClientOptions ? cloneJson(this.savedClientOptions) : void 0);
	}
	storeClientOptions(options) {
		this.savedClientOptions = cloneJson(options);
		super.storeClientOptions(options);
		this.markDirtyAndSchedulePersist();
		return Promise.resolve();
	}
	save(force = false) {
		if (force) return this.flush();
		return Promise.resolve();
	}
	wantsSave() {
		return false;
	}
	async deleteAllData() {
		if (this.persistTimer) {
			clearTimeout(this.persistTimer);
			this.persistTimer = null;
		}
		this.dirty = false;
		await this.persistPromise?.catch(() => void 0);
		await super.deleteAllData();
		this.savedSync = null;
		this.savedClientOptions = void 0;
		this.cleanShutdown = false;
		await fs$1.rm(this.storagePath, { force: true }).catch(() => void 0);
	}
	markCleanShutdown() {
		this.cleanShutdown = true;
		this.dirty = true;
	}
	async flush() {
		if (this.persistTimer) {
			clearTimeout(this.persistTimer);
			this.persistTimer = null;
		}
		while (this.dirty || this.persistPromise) {
			if (this.dirty && !this.persistPromise) this.persistPromise = this.persist().finally(() => {
				this.persistPromise = null;
			});
			await this.persistPromise;
		}
	}
	markDirtyAndSchedulePersist() {
		this.cleanShutdown = false;
		this.dirty = true;
		if (this.persistTimer) return;
		this.persistTimer = setTimeout(() => {
			this.persistTimer = null;
			this.flush().catch((err) => {
				LogService.warn("MatrixFileSyncStore", "Failed to persist Matrix sync store:", err);
			});
		}, PERSIST_DEBOUNCE_MS);
		this.persistTimer.unref?.();
	}
	async persist() {
		this.dirty = false;
		const payload = {
			version: STORE_VERSION,
			savedSync: this.savedSync ? cloneJson(this.savedSync) : null,
			cleanShutdown: this.cleanShutdown === true,
			...this.savedClientOptions ? { clientOptions: cloneJson(this.savedClientOptions) } : {}
		};
		try {
			await this.persistLock(async () => {
				await writeJsonFileAtomically(this.storagePath, payload);
			});
		} catch (err) {
			this.dirty = true;
			throw err;
		}
	}
};
//#endregion
//#region extensions/matrix/src/matrix/client/logging.ts
let matrixSdkLoggingConfigured = false;
let matrixSdkLogMode = "default";
const matrixSdkBaseLogger = new ConsoleLogger();
const matrixSdkSilentMethodFactory = () => () => {};
let matrixSdkRootMethodFactory;
let matrixSdkRootLoggerInitialized = false;
function shouldSuppressMatrixHttpNotFound(module, messageOrObject) {
	if (!module.includes("MatrixHttpClient")) return false;
	return messageOrObject.some((entry) => {
		if (!entry || typeof entry !== "object") return false;
		return entry.errcode === "M_NOT_FOUND";
	});
}
function ensureMatrixSdkLoggingConfigured() {
	if (!matrixSdkLoggingConfigured) matrixSdkLoggingConfigured = true;
	applyMatrixSdkLogger();
}
function setMatrixSdkLogMode(mode) {
	matrixSdkLogMode = mode;
	if (!matrixSdkLoggingConfigured) return;
	applyMatrixSdkLogger();
}
function setMatrixSdkConsoleLogging(enabled) {
	setMatrixConsoleLogging(enabled);
}
function createMatrixJsSdkClientLogger(prefix = "matrix") {
	return createMatrixJsSdkLoggerInstance(prefix);
}
function applyMatrixJsSdkRootLoggerMode() {
	const rootLogger = logger;
	if (!matrixSdkRootLoggerInitialized) {
		matrixSdkRootMethodFactory = rootLogger.methodFactory;
		matrixSdkRootLoggerInitialized = true;
	}
	rootLogger.methodFactory = matrixSdkLogMode === "quiet" ? matrixSdkSilentMethodFactory : matrixSdkRootMethodFactory;
	rootLogger.rebuild?.();
}
function applyMatrixSdkLogger() {
	applyMatrixJsSdkRootLoggerMode();
	if (matrixSdkLogMode === "quiet") {
		LogService.setLogger({
			trace: () => {},
			debug: () => {},
			info: () => {},
			warn: () => {},
			error: () => {}
		});
		return;
	}
	LogService.setLogger({
		trace: (module, ...messageOrObject) => matrixSdkBaseLogger.trace(module, ...messageOrObject),
		debug: (module, ...messageOrObject) => matrixSdkBaseLogger.debug(module, ...messageOrObject),
		info: (module, ...messageOrObject) => matrixSdkBaseLogger.info(module, ...messageOrObject),
		warn: (module, ...messageOrObject) => matrixSdkBaseLogger.warn(module, ...messageOrObject),
		error: (module, ...messageOrObject) => {
			if (shouldSuppressMatrixHttpNotFound(module, messageOrObject)) return;
			matrixSdkBaseLogger.error(module, ...messageOrObject);
		}
	});
}
function createMatrixJsSdkLoggerInstance(prefix) {
	const log = (method, ...messageOrObject) => {
		if (matrixSdkLogMode === "quiet") return;
		matrixSdkBaseLogger[method](prefix, ...messageOrObject);
	};
	return {
		trace: (...messageOrObject) => log("trace", ...messageOrObject),
		debug: (...messageOrObject) => log("debug", ...messageOrObject),
		info: (...messageOrObject) => log("info", ...messageOrObject),
		warn: (...messageOrObject) => log("warn", ...messageOrObject),
		error: (...messageOrObject) => {
			if (shouldSuppressMatrixHttpNotFound(prefix, messageOrObject)) return;
			log("error", ...messageOrObject);
		},
		getChild: (namespace) => {
			const nextNamespace = namespace.trim();
			return createMatrixJsSdkLoggerInstance(nextNamespace ? `${prefix}.${nextNamespace}` : prefix);
		}
	};
}
//#endregion
//#region extensions/matrix/src/matrix/sdk/recovery-key-store.ts
function isRepairableSecretStorageAccessError(err) {
	const message = (err instanceof Error ? err.message : String(err)).toLowerCase();
	if (!message) return false;
	if (message.includes("getsecretstoragekey callback returned falsey")) return true;
	if (message.includes("decrypting secret") && message.includes("bad mac")) return true;
	return false;
}
var MatrixRecoveryKeyStore = class {
	constructor(recoveryKeyPath) {
		this.recoveryKeyPath = recoveryKeyPath;
		this.secretStorageKeyCache = /* @__PURE__ */ new Map();
		this.stagedRecoveryKey = null;
		this.stagedCacheKeyIds = /* @__PURE__ */ new Set();
	}
	buildCryptoCallbacks() {
		return {
			getSecretStorageKey: async ({ keys }) => {
				const requestedKeyIds = Object.keys(keys ?? {});
				if (requestedKeyIds.length === 0) return null;
				for (const keyId of requestedKeyIds) {
					const cached = this.secretStorageKeyCache.get(keyId);
					if (cached) return [keyId, new Uint8Array(cached.key)];
				}
				const staged = this.stagedRecoveryKey;
				if (staged?.privateKeyBase64) {
					const privateKey = new Uint8Array(Buffer.from(staged.privateKeyBase64, "base64"));
					if (privateKey.length > 0) {
						const stagedKeyId = staged.keyId && requestedKeyIds.includes(staged.keyId) ? staged.keyId : requestedKeyIds[0];
						if (stagedKeyId) {
							this.rememberSecretStorageKey(stagedKeyId, privateKey, staged.keyInfo);
							this.stagedCacheKeyIds.add(stagedKeyId);
							return [stagedKeyId, privateKey];
						}
					}
				}
				const stored = this.loadStoredRecoveryKey();
				if (!stored?.privateKeyBase64) return null;
				const privateKey = new Uint8Array(Buffer.from(stored.privateKeyBase64, "base64"));
				if (privateKey.length === 0) return null;
				if (stored.keyId && requestedKeyIds.includes(stored.keyId)) {
					this.rememberSecretStorageKey(stored.keyId, privateKey, stored.keyInfo);
					return [stored.keyId, privateKey];
				}
				const firstRequestedKeyId = requestedKeyIds[0];
				if (!firstRequestedKeyId) return null;
				this.rememberSecretStorageKey(firstRequestedKeyId, privateKey, stored.keyInfo);
				return [firstRequestedKeyId, privateKey];
			},
			cacheSecretStorageKey: (keyId, keyInfo, key) => {
				const privateKey = new Uint8Array(key);
				const normalizedKeyInfo = {
					passphrase: keyInfo?.passphrase,
					name: typeof keyInfo?.name === "string" ? keyInfo.name : void 0
				};
				this.rememberSecretStorageKey(keyId, privateKey, normalizedKeyInfo);
				const stored = this.loadStoredRecoveryKey();
				this.saveRecoveryKeyToDisk({
					keyId,
					keyInfo: normalizedKeyInfo,
					privateKey,
					encodedPrivateKey: stored?.encodedPrivateKey
				});
			}
		};
	}
	getRecoveryKeySummary() {
		const stored = this.loadStoredRecoveryKey();
		if (!stored) return null;
		return {
			encodedPrivateKey: stored.encodedPrivateKey,
			keyId: stored.keyId,
			createdAt: stored.createdAt
		};
	}
	storeEncodedRecoveryKey(params) {
		const encodedPrivateKey = params.encodedPrivateKey.trim();
		if (!encodedPrivateKey) throw new Error("Matrix recovery key is required");
		let privateKey;
		try {
			privateKey = decodeRecoveryKey(encodedPrivateKey);
		} catch (err) {
			throw new Error(`Invalid Matrix recovery key: ${err instanceof Error ? err.message : String(err)}`);
		}
		const normalizedKeyId = typeof params.keyId === "string" && params.keyId.trim() ? params.keyId.trim() : null;
		const keyInfo = params.keyInfo ?? this.loadStoredRecoveryKey()?.keyInfo;
		this.saveRecoveryKeyToDisk({
			keyId: normalizedKeyId,
			keyInfo,
			privateKey,
			encodedPrivateKey
		});
		if (normalizedKeyId) this.rememberSecretStorageKey(normalizedKeyId, privateKey, keyInfo);
		return this.getRecoveryKeySummary() ?? {};
	}
	stageEncodedRecoveryKey(params) {
		const encodedPrivateKey = params.encodedPrivateKey.trim();
		if (!encodedPrivateKey) throw new Error("Matrix recovery key is required");
		let privateKey;
		try {
			privateKey = decodeRecoveryKey(encodedPrivateKey);
		} catch (err) {
			throw new Error(`Invalid Matrix recovery key: ${err instanceof Error ? err.message : String(err)}`);
		}
		const normalizedKeyId = typeof params.keyId === "string" && params.keyId.trim() ? params.keyId.trim() : null;
		this.discardStagedRecoveryKey();
		this.stagedRecoveryKey = {
			version: 1,
			createdAt: (/* @__PURE__ */ new Date()).toISOString(),
			keyId: normalizedKeyId,
			encodedPrivateKey,
			privateKeyBase64: Buffer.from(privateKey).toString("base64"),
			keyInfo: params.keyInfo ?? this.loadStoredRecoveryKey()?.keyInfo
		};
	}
	commitStagedRecoveryKey(params) {
		if (!this.stagedRecoveryKey) return this.getRecoveryKeySummary();
		const staged = this.stagedRecoveryKey;
		const privateKey = new Uint8Array(Buffer.from(staged.privateKeyBase64, "base64"));
		const keyId = typeof params?.keyId === "string" && params.keyId.trim() ? params.keyId.trim() : staged.keyId;
		this.saveRecoveryKeyToDisk({
			keyId,
			keyInfo: params?.keyInfo ?? staged.keyInfo,
			privateKey,
			encodedPrivateKey: staged.encodedPrivateKey
		});
		this.clearStagedRecoveryKeyTracking();
		return this.getRecoveryKeySummary();
	}
	discardStagedRecoveryKey() {
		for (const keyId of this.stagedCacheKeyIds) this.secretStorageKeyCache.delete(keyId);
		this.clearStagedRecoveryKeyTracking();
	}
	async bootstrapSecretStorageWithRecoveryKey(crypto, options = {}) {
		let status = null;
		const getSecretStorageStatus = crypto.getSecretStorageStatus;
		if (typeof getSecretStorageStatus === "function") try {
			status = await getSecretStorageStatus.call(crypto);
		} catch (err) {
			LogService.warn("MatrixClientLite", "Failed to read secret storage status:", err);
		}
		const hasDefaultSecretStorageKey = Boolean(status?.defaultKeyId);
		const hasKnownInvalidSecrets = Object.values(status?.secretStorageKeyValidityMap ?? {}).some((valid) => valid === false);
		let generatedRecoveryKey = false;
		const storedRecovery = this.loadStoredRecoveryKey();
		const stagedRecovery = this.stagedRecoveryKey;
		const sourceRecovery = stagedRecovery ?? storedRecovery;
		let recoveryKey = sourceRecovery ? {
			keyInfo: sourceRecovery.keyInfo,
			privateKey: new Uint8Array(Buffer.from(sourceRecovery.privateKeyBase64, "base64")),
			encodedPrivateKey: sourceRecovery.encodedPrivateKey
		} : null;
		if (recoveryKey && status?.defaultKeyId) {
			const defaultKeyId = status.defaultKeyId;
			this.rememberSecretStorageKey(defaultKeyId, recoveryKey.privateKey, recoveryKey.keyInfo);
			if (!stagedRecovery && storedRecovery && storedRecovery.keyId !== defaultKeyId) this.saveRecoveryKeyToDisk({
				keyId: defaultKeyId,
				keyInfo: recoveryKey.keyInfo,
				privateKey: recoveryKey.privateKey,
				encodedPrivateKey: recoveryKey.encodedPrivateKey
			});
		}
		const ensureRecoveryKey = async () => {
			if (recoveryKey) return recoveryKey;
			if (typeof crypto.createRecoveryKeyFromPassphrase !== "function") throw new Error("Matrix crypto backend does not support recovery key generation (createRecoveryKeyFromPassphrase missing)");
			recoveryKey = await crypto.createRecoveryKeyFromPassphrase();
			this.saveRecoveryKeyToDisk(recoveryKey);
			generatedRecoveryKey = true;
			return recoveryKey;
		};
		const shouldRecreateSecretStorage = options.forceNewSecretStorage === true || !hasDefaultSecretStorageKey || !recoveryKey && status?.ready === false || hasKnownInvalidSecrets;
		if (hasKnownInvalidSecrets) recoveryKey = null;
		const secretStorageOptions = { setupNewKeyBackup: options.setupNewKeyBackup === true };
		if (shouldRecreateSecretStorage) {
			secretStorageOptions.setupNewSecretStorage = true;
			secretStorageOptions.createSecretStorageKey = ensureRecoveryKey;
		}
		try {
			await crypto.bootstrapSecretStorage(secretStorageOptions);
		} catch (err) {
			if (!(options.allowSecretStorageRecreateWithoutRecoveryKey === true && hasDefaultSecretStorageKey && isRepairableSecretStorageAccessError(err))) throw err;
			recoveryKey = null;
			LogService.warn("MatrixClientLite", "Secret storage exists on the server but local recovery material cannot unlock it; recreating secret storage during explicit bootstrap.");
			await crypto.bootstrapSecretStorage({
				setupNewSecretStorage: true,
				setupNewKeyBackup: options.setupNewKeyBackup === true,
				createSecretStorageKey: ensureRecoveryKey
			});
		}
		if (generatedRecoveryKey && this.recoveryKeyPath) LogService.warn("MatrixClientLite", `Generated Matrix recovery key and saved it to ${this.recoveryKeyPath}. Keep this file secure.`);
	}
	clearStagedRecoveryKeyTracking() {
		this.stagedRecoveryKey = null;
		this.stagedCacheKeyIds.clear();
	}
	rememberSecretStorageKey(keyId, key, keyInfo) {
		if (!keyId.trim()) return;
		this.secretStorageKeyCache.set(keyId, {
			key: new Uint8Array(key),
			keyInfo
		});
	}
	loadStoredRecoveryKey() {
		if (!this.recoveryKeyPath) return null;
		try {
			if (!fs.existsSync(this.recoveryKeyPath)) return null;
			const raw = fs.readFileSync(this.recoveryKeyPath, "utf8");
			const parsed = JSON.parse(raw);
			if (parsed.version !== 1 || typeof parsed.createdAt !== "string" || typeof parsed.privateKeyBase64 !== "string" || !parsed.privateKeyBase64.trim()) return null;
			return {
				version: 1,
				createdAt: parsed.createdAt,
				keyId: typeof parsed.keyId === "string" ? parsed.keyId : null,
				encodedPrivateKey: typeof parsed.encodedPrivateKey === "string" ? parsed.encodedPrivateKey : void 0,
				privateKeyBase64: parsed.privateKeyBase64,
				keyInfo: parsed.keyInfo && typeof parsed.keyInfo === "object" ? {
					passphrase: parsed.keyInfo.passphrase,
					name: typeof parsed.keyInfo.name === "string" ? parsed.keyInfo.name : void 0
				} : void 0
			};
		} catch {
			return null;
		}
	}
	saveRecoveryKeyToDisk(params) {
		if (!this.recoveryKeyPath) return;
		try {
			const payload = {
				version: 1,
				createdAt: (/* @__PURE__ */ new Date()).toISOString(),
				keyId: typeof params.keyId === "string" ? params.keyId : null,
				encodedPrivateKey: params.encodedPrivateKey,
				privateKeyBase64: Buffer.from(params.privateKey).toString("base64"),
				keyInfo: params.keyInfo ? {
					passphrase: params.keyInfo.passphrase,
					name: params.keyInfo.name
				} : void 0
			};
			fs.mkdirSync(path.dirname(this.recoveryKeyPath), { recursive: true });
			fs.writeFileSync(this.recoveryKeyPath, JSON.stringify(payload, null, 2), "utf8");
			fs.chmodSync(this.recoveryKeyPath, 384);
		} catch (err) {
			LogService.warn("MatrixClientLite", "Failed to persist recovery key:", err);
		}
	}
};
//#endregion
//#region extensions/matrix/src/matrix/sdk/verification-status.ts
function isMatrixDeviceOwnerVerified(status) {
	return status?.crossSigningVerified === true || status?.signedByOwner === true;
}
//#endregion
//#region extensions/matrix/src/matrix/sdk/crypto-bootstrap.ts
var MatrixCryptoBootstrapper = class {
	constructor(deps) {
		this.deps = deps;
		this.verificationHandlerRegistered = false;
	}
	async bootstrap(crypto, options = {}) {
		const strict = options.strict === true;
		this.registerVerificationRequestHandler(crypto);
		await this.bootstrapSecretStorage(crypto, {
			strict,
			allowSecretStorageRecreateWithoutRecoveryKey: options.allowSecretStorageRecreateWithoutRecoveryKey === true
		});
		const crossSigning = await this.bootstrapCrossSigning(crypto, {
			forceResetCrossSigning: options.forceResetCrossSigning === true,
			allowAutomaticCrossSigningReset: options.allowAutomaticCrossSigningReset !== false,
			allowSecretStorageRecreateWithoutRecoveryKey: options.allowSecretStorageRecreateWithoutRecoveryKey === true,
			strict
		});
		await this.bootstrapSecretStorage(crypto, {
			strict,
			allowSecretStorageRecreateWithoutRecoveryKey: options.allowSecretStorageRecreateWithoutRecoveryKey === true
		});
		const ownDeviceVerified = await this.ensureOwnDeviceTrust(crypto, strict);
		return {
			crossSigningReady: crossSigning.ready,
			crossSigningPublished: crossSigning.published,
			ownDeviceVerified
		};
	}
	createSigningKeysUiAuthCallback(params) {
		return async (makeRequest) => {
			try {
				return await makeRequest(null);
			} catch {
				try {
					return await makeRequest({ type: "m.login.dummy" });
				} catch {
					if (!params.password?.trim()) throw new Error("Matrix cross-signing key upload requires UIA; provide matrix.password for m.login.password fallback");
					return await makeRequest({
						type: "m.login.password",
						identifier: {
							type: "m.id.user",
							user: params.userId
						},
						password: params.password
					});
				}
			}
		};
	}
	async bootstrapCrossSigning(crypto, options) {
		const userId = await this.deps.getUserId();
		const authUploadDeviceSigningKeys = this.createSigningKeysUiAuthCallback({
			userId,
			password: this.deps.getPassword?.()
		});
		const hasPublishedCrossSigningKeys = async () => {
			if (typeof crypto.userHasCrossSigningKeys !== "function") return true;
			try {
				return await crypto.userHasCrossSigningKeys(userId, true);
			} catch {
				return false;
			}
		};
		const isCrossSigningReady = async () => {
			if (typeof crypto.isCrossSigningReady !== "function") return true;
			try {
				return await crypto.isCrossSigningReady();
			} catch {
				return false;
			}
		};
		const finalize = async () => {
			const ready = await isCrossSigningReady();
			const published = await hasPublishedCrossSigningKeys();
			if (ready && published) {
				LogService.info("MatrixClientLite", "Cross-signing bootstrap complete");
				return {
					ready,
					published
				};
			}
			const message = "Cross-signing bootstrap finished but server keys are still not published";
			LogService.warn("MatrixClientLite", message);
			if (options.strict) throw new Error(message);
			return {
				ready,
				published
			};
		};
		if (options.forceResetCrossSigning) {
			try {
				await crypto.bootstrapCrossSigning({
					setupNewCrossSigning: true,
					authUploadDeviceSigningKeys
				});
			} catch (err) {
				LogService.warn("MatrixClientLite", "Forced cross-signing reset failed:", err);
				if (options.strict) throw err instanceof Error ? err : new Error(String(err));
				return {
					ready: false,
					published: false
				};
			}
			return await finalize();
		}
		try {
			await crypto.bootstrapCrossSigning({ authUploadDeviceSigningKeys });
		} catch (err) {
			if (options.allowSecretStorageRecreateWithoutRecoveryKey && isRepairableSecretStorageAccessError(err)) {
				LogService.warn("MatrixClientLite", "Cross-signing bootstrap could not unlock secret storage; recreating secret storage during explicit bootstrap and retrying.");
				await this.deps.recoveryKeyStore.bootstrapSecretStorageWithRecoveryKey(crypto, {
					allowSecretStorageRecreateWithoutRecoveryKey: true,
					forceNewSecretStorage: true
				});
				await crypto.bootstrapCrossSigning({ authUploadDeviceSigningKeys });
			} else if (!options.allowAutomaticCrossSigningReset) {
				LogService.warn("MatrixClientLite", "Initial cross-signing bootstrap failed and automatic reset is disabled:", err);
				return {
					ready: false,
					published: false
				};
			} else {
				LogService.warn("MatrixClientLite", "Initial cross-signing bootstrap failed, trying reset:", err);
				try {
					await crypto.bootstrapCrossSigning({
						setupNewCrossSigning: true,
						authUploadDeviceSigningKeys
					});
				} catch (resetErr) {
					LogService.warn("MatrixClientLite", "Failed to bootstrap cross-signing:", resetErr);
					if (options.strict) throw resetErr instanceof Error ? resetErr : new Error(String(resetErr));
					return {
						ready: false,
						published: false
					};
				}
			}
		}
		const firstPassReady = await isCrossSigningReady();
		const firstPassPublished = await hasPublishedCrossSigningKeys();
		if (firstPassReady && firstPassPublished) {
			LogService.info("MatrixClientLite", "Cross-signing bootstrap complete");
			return {
				ready: true,
				published: true
			};
		}
		if (!options.allowAutomaticCrossSigningReset) return {
			ready: firstPassReady,
			published: firstPassPublished
		};
		try {
			await crypto.bootstrapCrossSigning({
				setupNewCrossSigning: true,
				authUploadDeviceSigningKeys
			});
		} catch (err) {
			LogService.warn("MatrixClientLite", "Fallback cross-signing bootstrap failed:", err);
			if (options.strict) throw err instanceof Error ? err : new Error(String(err));
			return {
				ready: false,
				published: false
			};
		}
		return await finalize();
	}
	async bootstrapSecretStorage(crypto, options) {
		try {
			await this.deps.recoveryKeyStore.bootstrapSecretStorageWithRecoveryKey(crypto, { allowSecretStorageRecreateWithoutRecoveryKey: options.allowSecretStorageRecreateWithoutRecoveryKey });
			LogService.info("MatrixClientLite", "Secret storage bootstrap complete");
		} catch (err) {
			LogService.warn("MatrixClientLite", "Failed to bootstrap secret storage:", err);
			if (options.strict) throw err instanceof Error ? err : new Error(String(err));
		}
	}
	registerVerificationRequestHandler(crypto) {
		if (this.verificationHandlerRegistered) return;
		this.verificationHandlerRegistered = true;
		crypto.on(CryptoEvent.VerificationRequestReceived, async (request) => {
			const verificationRequest = request;
			try {
				this.deps.verificationManager.trackVerificationRequest(verificationRequest);
			} catch (err) {
				LogService.warn("MatrixClientLite", `Failed to track verification request from ${verificationRequest.otherUserId}:`, err);
			}
		});
		this.deps.decryptBridge.bindCryptoRetrySignals(crypto);
		LogService.info("MatrixClientLite", "Verification request handler registered");
	}
	async ensureOwnDeviceTrust(crypto, strict = false) {
		const deviceId = this.deps.getDeviceId()?.trim();
		if (!deviceId) return null;
		const userId = await this.deps.getUserId();
		if (isMatrixDeviceOwnerVerified(typeof crypto.getDeviceVerificationStatus === "function" ? await crypto.getDeviceVerificationStatus(userId, deviceId).catch(() => null) : null)) return true;
		if (typeof crypto.setDeviceVerified === "function") await crypto.setDeviceVerified(userId, deviceId, true);
		if (typeof crypto.crossSignDevice === "function") {
			if (typeof crypto.isCrossSigningReady === "function" ? await crypto.isCrossSigningReady() : true) await crypto.crossSignDevice(deviceId);
		}
		const verified = isMatrixDeviceOwnerVerified(typeof crypto.getDeviceVerificationStatus === "function" ? await crypto.getDeviceVerificationStatus(userId, deviceId).catch(() => null) : null);
		if (!verified && strict) throw new Error(`Matrix own device ${deviceId} is not verified by its owner after bootstrap`);
		return verified;
	}
};
//#endregion
//#region extensions/matrix/src/matrix/sdk/crypto-facade.ts
let matrixCryptoNodeRuntimePromise = null;
async function loadMatrixCryptoNodeRuntime() {
	matrixCryptoNodeRuntimePromise ??= import("./crypto-node.runtime-bJ973wum.js");
	return await matrixCryptoNodeRuntimePromise;
}
function createMatrixCryptoFacade(deps) {
	return {
		prepare: async (_joinedRooms) => {},
		updateSyncData: async (_toDeviceMessages, _otkCounts, _unusedFallbackKeyAlgs, _changedDeviceLists, _leftDeviceLists) => {},
		isRoomEncrypted: async (roomId) => {
			if (deps.client.getRoom(roomId)?.hasEncryptionStateEvent()) return true;
			try {
				const event = await deps.getRoomStateEvent(roomId, "m.room.encryption", "");
				return typeof event.algorithm === "string" && event.algorithm.length > 0;
			} catch {
				return false;
			}
		},
		requestOwnUserVerification: async () => {
			const crypto = deps.client.getCrypto();
			return await deps.verificationManager.requestOwnUserVerification(crypto);
		},
		encryptMedia: async (buffer) => {
			const { Attachment } = await loadMatrixCryptoNodeRuntime();
			const encrypted = Attachment.encrypt(new Uint8Array(buffer));
			const mediaInfoJson = encrypted.mediaEncryptionInfo;
			if (!mediaInfoJson) throw new Error("Matrix media encryption failed: missing media encryption info");
			const parsed = JSON.parse(mediaInfoJson);
			return {
				buffer: Buffer.from(encrypted.encryptedData),
				file: {
					key: parsed.key,
					iv: parsed.iv,
					hashes: parsed.hashes,
					v: parsed.v
				}
			};
		},
		decryptMedia: async (file, opts) => {
			const { Attachment, EncryptedAttachment } = await loadMatrixCryptoNodeRuntime();
			const encrypted = await deps.downloadContent(file.url, opts);
			const metadata = {
				url: file.url,
				key: file.key,
				iv: file.iv,
				hashes: file.hashes,
				v: file.v
			};
			const attachment = new EncryptedAttachment(new Uint8Array(encrypted), JSON.stringify(metadata));
			const decrypted = Attachment.decrypt(attachment);
			return Buffer.from(decrypted);
		},
		getRecoveryKey: async () => {
			return deps.recoveryKeyStore.getRecoveryKeySummary();
		},
		listVerifications: async () => {
			return deps.verificationManager.listVerifications();
		},
		ensureVerificationDmTracked: async ({ roomId, userId }) => {
			const crypto = deps.client.getCrypto();
			const request = typeof crypto?.findVerificationRequestDMInProgress === "function" ? crypto.findVerificationRequestDMInProgress(roomId, userId) : void 0;
			if (!request) return null;
			return deps.verificationManager.trackVerificationRequest(request);
		},
		requestVerification: async (params) => {
			const crypto = deps.client.getCrypto();
			return await deps.verificationManager.requestVerification(crypto, params);
		},
		acceptVerification: async (id) => {
			return await deps.verificationManager.acceptVerification(id);
		},
		cancelVerification: async (id, params) => {
			return await deps.verificationManager.cancelVerification(id, params);
		},
		startVerification: async (id, method = "sas") => {
			return await deps.verificationManager.startVerification(id, method);
		},
		generateVerificationQr: async (id) => {
			return await deps.verificationManager.generateVerificationQr(id);
		},
		scanVerificationQr: async (id, qrDataBase64) => {
			return await deps.verificationManager.scanVerificationQr(id, qrDataBase64);
		},
		confirmVerificationSas: async (id) => {
			return await deps.verificationManager.confirmVerificationSas(id);
		},
		mismatchVerificationSas: async (id) => {
			return deps.verificationManager.mismatchVerificationSas(id);
		},
		confirmVerificationReciprocateQr: async (id) => {
			return deps.verificationManager.confirmVerificationReciprocateQr(id);
		},
		getVerificationSas: async (id) => {
			return deps.verificationManager.getVerificationSas(id);
		}
	};
}
//#endregion
//#region extensions/matrix/src/matrix/sdk/decrypt-bridge.ts
const MATRIX_DECRYPT_RETRY_BASE_DELAY_MS = 1500;
const MATRIX_DECRYPT_RETRY_MAX_DELAY_MS = 3e4;
const MATRIX_DECRYPT_RETRY_MAX_ATTEMPTS = 8;
function resolveDecryptRetryKey(roomId, eventId) {
	if (!roomId || !eventId) return null;
	return `${roomId}|${eventId}`;
}
function isDecryptionFailure(event) {
	return typeof event.isDecryptionFailure === "function" && event.isDecryptionFailure();
}
var MatrixDecryptBridge = class {
	constructor(deps) {
		this.deps = deps;
		this.trackedEncryptedEvents = /* @__PURE__ */ new WeakSet();
		this.decryptedMessageDedupe = /* @__PURE__ */ new Map();
		this.decryptRetries = /* @__PURE__ */ new Map();
		this.failedDecryptionsNotified = /* @__PURE__ */ new Set();
		this.activeRetryRuns = 0;
		this.retryIdleResolvers = /* @__PURE__ */ new Set();
		this.cryptoRetrySignalsBound = false;
	}
	shouldEmitUnencryptedMessage(roomId, eventId) {
		if (!eventId) return true;
		const key = `${roomId}|${eventId}`;
		if (this.decryptedMessageDedupe.get(key) === void 0) return true;
		this.decryptedMessageDedupe.delete(key);
		return false;
	}
	attachEncryptedEvent(event, roomId) {
		if (this.trackedEncryptedEvents.has(event)) return;
		this.trackedEncryptedEvents.add(event);
		event.on(MatrixEventEvent.Decrypted, (decryptedEvent, err) => {
			this.handleEncryptedEventDecrypted({
				roomId,
				encryptedEvent: event,
				decryptedEvent,
				err
			});
		});
	}
	retryPendingNow(reason) {
		const pending = Array.from(this.decryptRetries.entries());
		if (pending.length === 0) return;
		LogService.debug("MatrixClientLite", `Retrying pending decryptions due to ${reason}`);
		for (const [retryKey, state] of pending) {
			if (state.timer) {
				clearTimeout(state.timer);
				state.timer = null;
			}
			if (state.inFlight) continue;
			this.runDecryptRetry(retryKey).catch(noop);
		}
	}
	bindCryptoRetrySignals(crypto) {
		if (!crypto || this.cryptoRetrySignalsBound) return;
		this.cryptoRetrySignalsBound = true;
		const trigger = (reason) => {
			this.retryPendingNow(reason);
		};
		crypto.on(CryptoEvent.KeyBackupDecryptionKeyCached, () => {
			trigger("crypto.keyBackupDecryptionKeyCached");
		});
		crypto.on(CryptoEvent.RehydrationCompleted, () => {
			trigger("dehydration.RehydrationCompleted");
		});
		crypto.on(CryptoEvent.DevicesUpdated, () => {
			trigger("crypto.devicesUpdated");
		});
		crypto.on(CryptoEvent.KeysChanged, () => {
			trigger("crossSigning.keysChanged");
		});
	}
	stop() {
		for (const retryKey of this.decryptRetries.keys()) this.clearDecryptRetry(retryKey);
	}
	async drainPendingDecryptions(reason) {
		for (let attempts = 0; attempts < MATRIX_DECRYPT_RETRY_MAX_ATTEMPTS; attempts += 1) {
			if (this.decryptRetries.size === 0) return;
			this.retryPendingNow(reason);
			await this.waitForActiveRetryRunsToFinish();
			if (!Array.from(this.decryptRetries.values()).some((state) => state.timer || state.inFlight)) return;
		}
	}
	handleEncryptedEventDecrypted(params) {
		const decryptedRoomId = params.decryptedEvent.getRoomId() || params.roomId;
		const decryptedRaw = this.deps.toRaw(params.decryptedEvent);
		const retryEventId = decryptedRaw.event_id || params.encryptedEvent.getId() || "";
		const retryKey = resolveDecryptRetryKey(decryptedRoomId, retryEventId);
		if (params.err) {
			this.emitFailedDecryptionOnce(retryKey, decryptedRoomId, decryptedRaw, params.err);
			this.scheduleDecryptRetry({
				event: params.encryptedEvent,
				roomId: decryptedRoomId,
				eventId: retryEventId
			});
			return;
		}
		if (isDecryptionFailure(params.decryptedEvent)) {
			this.emitFailedDecryptionOnce(retryKey, decryptedRoomId, decryptedRaw, /* @__PURE__ */ new Error("Matrix event failed to decrypt"));
			this.scheduleDecryptRetry({
				event: params.encryptedEvent,
				roomId: decryptedRoomId,
				eventId: retryEventId
			});
			return;
		}
		if (retryKey) this.clearDecryptRetry(retryKey);
		this.rememberDecryptedMessage(decryptedRoomId, decryptedRaw.event_id);
		this.deps.emitDecryptedEvent(decryptedRoomId, decryptedRaw);
		this.deps.emitMessage(decryptedRoomId, decryptedRaw);
	}
	emitFailedDecryptionOnce(retryKey, roomId, event, error) {
		if (retryKey) {
			if (this.failedDecryptionsNotified.has(retryKey)) return;
			this.failedDecryptionsNotified.add(retryKey);
		}
		this.deps.emitFailedDecryption(roomId, event, error);
	}
	scheduleDecryptRetry(params) {
		const retryKey = resolveDecryptRetryKey(params.roomId, params.eventId);
		if (!retryKey) return;
		const existing = this.decryptRetries.get(retryKey);
		if (existing?.timer || existing?.inFlight) return;
		const attempts = (existing?.attempts ?? 0) + 1;
		if (attempts > MATRIX_DECRYPT_RETRY_MAX_ATTEMPTS) {
			this.clearDecryptRetry(retryKey);
			LogService.debug("MatrixClientLite", `Giving up decryption retry for ${params.eventId} in ${params.roomId} after ${attempts - 1} attempts`);
			return;
		}
		const delayMs = Math.min(MATRIX_DECRYPT_RETRY_BASE_DELAY_MS * 2 ** (attempts - 1), MATRIX_DECRYPT_RETRY_MAX_DELAY_MS);
		const next = {
			event: params.event,
			roomId: params.roomId,
			eventId: params.eventId,
			attempts,
			inFlight: false,
			timer: null
		};
		next.timer = setTimeout(() => {
			this.runDecryptRetry(retryKey).catch(noop);
		}, delayMs);
		this.decryptRetries.set(retryKey, next);
	}
	async runDecryptRetry(retryKey) {
		const state = this.decryptRetries.get(retryKey);
		if (!state || state.inFlight) return;
		state.inFlight = true;
		state.timer = null;
		this.activeRetryRuns += 1;
		if (!(typeof this.deps.client.decryptEventIfNeeded === "function")) {
			this.clearDecryptRetry(retryKey);
			this.activeRetryRuns = Math.max(0, this.activeRetryRuns - 1);
			this.resolveRetryIdleIfNeeded();
			return;
		}
		try {
			await this.deps.client.decryptEventIfNeeded?.(state.event, { isRetry: true });
		} catch {} finally {
			state.inFlight = false;
			this.activeRetryRuns = Math.max(0, this.activeRetryRuns - 1);
			this.resolveRetryIdleIfNeeded();
		}
		if (this.decryptRetries.get(retryKey) !== state) return;
		if (isDecryptionFailure(state.event)) {
			this.scheduleDecryptRetry(state);
			return;
		}
		this.clearDecryptRetry(retryKey);
	}
	clearDecryptRetry(retryKey) {
		const state = this.decryptRetries.get(retryKey);
		if (state?.timer) clearTimeout(state.timer);
		this.decryptRetries.delete(retryKey);
		this.failedDecryptionsNotified.delete(retryKey);
	}
	rememberDecryptedMessage(roomId, eventId) {
		if (!eventId) return;
		const now = Date.now();
		this.pruneDecryptedMessageDedupe(now);
		this.decryptedMessageDedupe.set(`${roomId}|${eventId}`, now);
	}
	pruneDecryptedMessageDedupe(now) {
		const ttlMs = 3e4;
		for (const [key, createdAt] of this.decryptedMessageDedupe) if (now - createdAt > ttlMs) this.decryptedMessageDedupe.delete(key);
		const maxEntries = 2048;
		while (this.decryptedMessageDedupe.size > maxEntries) {
			const oldest = this.decryptedMessageDedupe.keys().next().value;
			if (oldest === void 0) break;
			this.decryptedMessageDedupe.delete(oldest);
		}
	}
	async waitForActiveRetryRunsToFinish() {
		if (this.activeRetryRuns === 0) return;
		await new Promise((resolve) => {
			this.retryIdleResolvers.add(resolve);
			if (this.activeRetryRuns === 0) {
				this.retryIdleResolvers.delete(resolve);
				resolve();
			}
		});
	}
	resolveRetryIdleIfNeeded() {
		if (this.activeRetryRuns !== 0) return;
		for (const resolve of this.retryIdleResolvers) resolve();
		this.retryIdleResolvers.clear();
	}
};
//#endregion
//#region extensions/matrix/src/matrix/sdk/event-helpers.ts
function matrixEventToRaw(event) {
	const unsigned = event.getUnsigned?.() ?? {};
	const raw = {
		event_id: event.getId() ?? "",
		sender: event.getSender() ?? "",
		type: event.getType() ?? "",
		origin_server_ts: event.getTs() ?? 0,
		content: (event.getContent?.() ?? {}) || {},
		unsigned
	};
	const stateKey = resolveMatrixStateKey(event);
	if (typeof stateKey === "string") raw.state_key = stateKey;
	return raw;
}
function parseMxc(url) {
	const match = /^mxc:\/\/([^/]+)\/(.+)$/.exec(url.trim());
	if (!match) return null;
	return {
		server: match[1],
		mediaId: match[2]
	};
}
function buildHttpError(statusCode, bodyText) {
	let message = `Matrix HTTP ${statusCode}`;
	if (bodyText.trim()) try {
		const parsed = JSON.parse(bodyText);
		if (typeof parsed.error === "string" && parsed.error.trim()) message = parsed.error.trim();
		else message = bodyText.slice(0, 500);
	} catch {
		message = bodyText.slice(0, 500);
	}
	return Object.assign(new Error(message), { statusCode });
}
function resolveMatrixStateKey(event) {
	const direct = event.getStateKey?.();
	if (typeof direct === "string") return direct;
	const wireContent = event.getWireContent?.();
	if (wireContent && typeof wireContent.state_key === "string") return wireContent.state_key;
	const rawEvent = event.event;
	if (rawEvent && typeof rawEvent.state_key === "string") return rawEvent.state_key;
}
//#endregion
//#region extensions/matrix/src/matrix/sdk/read-response-with-limit.ts
async function readChunkWithIdleTimeout(reader, chunkTimeoutMs) {
	let timeoutId;
	let timedOut = false;
	return await new Promise((resolve, reject) => {
		const clear = () => {
			if (timeoutId !== void 0) {
				clearTimeout(timeoutId);
				timeoutId = void 0;
			}
		};
		timeoutId = setTimeout(() => {
			timedOut = true;
			clear();
			reader.cancel().catch(() => void 0);
			reject(/* @__PURE__ */ new Error(`Matrix media download stalled: no data received for ${chunkTimeoutMs}ms`));
		}, chunkTimeoutMs);
		reader.read().then((result) => {
			clear();
			if (!timedOut) resolve(result);
		}, (err) => {
			clear();
			if (!timedOut) reject(err);
		});
	});
}
async function readResponseWithLimit(res, maxBytes, opts) {
	const onOverflow = opts?.onOverflow ?? ((params) => /* @__PURE__ */ new Error(`Content too large: ${params.size} bytes (limit: ${params.maxBytes} bytes)`));
	const chunkTimeoutMs = opts?.chunkTimeoutMs;
	const body = res.body;
	if (!body || typeof body.getReader !== "function") {
		const fallback = Buffer.from(await res.arrayBuffer());
		if (fallback.length > maxBytes) throw onOverflow({
			size: fallback.length,
			maxBytes,
			res
		});
		return fallback;
	}
	const reader = body.getReader();
	const chunks = [];
	let total = 0;
	try {
		while (true) {
			const { done, value } = chunkTimeoutMs ? await readChunkWithIdleTimeout(reader, chunkTimeoutMs) : await reader.read();
			if (done) break;
			if (value?.length) {
				total += value.length;
				if (total > maxBytes) {
					try {
						await reader.cancel();
					} catch {}
					throw onOverflow({
						size: total,
						maxBytes,
						res
					});
				}
				chunks.push(value);
			}
		}
	} finally {
		try {
			reader.releaseLock();
		} catch {}
	}
	return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)), total);
}
//#endregion
//#region extensions/matrix/src/matrix/sdk/transport.ts
function normalizeEndpoint(endpoint) {
	if (!endpoint) return "/";
	return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
}
function applyQuery(url, qs) {
	if (!qs) return;
	for (const [key, rawValue] of Object.entries(qs)) {
		if (rawValue === void 0 || rawValue === null) continue;
		if (Array.isArray(rawValue)) {
			for (const item of rawValue) {
				if (item === void 0 || item === null) continue;
				url.searchParams.append(key, String(item));
			}
			continue;
		}
		url.searchParams.set(key, String(rawValue));
	}
}
function isRedirectStatus(statusCode) {
	return statusCode >= 300 && statusCode < 400;
}
function toFetchUrl(resource) {
	if (resource instanceof URL) return resource.toString();
	if (typeof resource === "string") return resource;
	return resource.url;
}
function buildBufferedResponse(params) {
	const response = new Response(params.body, {
		status: params.source.status,
		statusText: params.source.statusText,
		headers: new Headers(params.source.headers)
	});
	try {
		Object.defineProperty(response, "url", {
			value: params.source.url || params.url,
			configurable: true
		});
	} catch {}
	return response;
}
function buildAbortSignal(params) {
	const { timeoutMs, signal } = params;
	if (!timeoutMs && !signal) return {
		signal: void 0,
		cleanup: () => {}
	};
	if (!timeoutMs) return {
		signal,
		cleanup: () => {}
	};
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
	const onAbort = () => controller.abort();
	if (signal) if (signal.aborted) controller.abort();
	else signal.addEventListener("abort", onAbort, { once: true });
	return {
		signal: controller.signal,
		cleanup: () => {
			clearTimeout(timeoutId);
			if (signal) signal.removeEventListener("abort", onAbort);
		}
	};
}
async function fetchWithMatrixGuardedRedirects(params) {
	let currentUrl = new URL(params.url);
	let method = (params.init?.method ?? "GET").toUpperCase();
	let body = params.init?.body;
	let headers = new Headers(params.init?.headers ?? {});
	const maxRedirects = 5;
	const visited = /* @__PURE__ */ new Set();
	const { signal, cleanup } = buildAbortSignal({
		timeoutMs: params.timeoutMs,
		signal: params.signal
	});
	for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
		let dispatcher;
		try {
			dispatcher = createPinnedDispatcher(await resolvePinnedHostnameWithPolicy(currentUrl.hostname, { policy: params.ssrfPolicy }), void 0, params.ssrfPolicy);
			const response = await fetch(currentUrl.toString(), {
				...params.init,
				method,
				body,
				headers,
				redirect: "manual",
				signal,
				dispatcher
			});
			if (!isRedirectStatus(response.status)) return {
				response,
				release: async () => {
					cleanup();
					await closeDispatcher(dispatcher);
				},
				finalUrl: currentUrl.toString()
			};
			const location = response.headers.get("location");
			if (!location) {
				cleanup();
				await closeDispatcher(dispatcher);
				throw new Error(`Matrix redirect missing location header (${currentUrl.toString()})`);
			}
			const nextUrl = new URL(location, currentUrl);
			if (nextUrl.protocol !== currentUrl.protocol) {
				cleanup();
				await closeDispatcher(dispatcher);
				throw new Error(`Blocked cross-protocol redirect (${currentUrl.protocol} -> ${nextUrl.protocol})`);
			}
			const nextUrlString = nextUrl.toString();
			if (visited.has(nextUrlString)) {
				cleanup();
				await closeDispatcher(dispatcher);
				throw new Error("Redirect loop detected");
			}
			visited.add(nextUrlString);
			if (nextUrl.origin !== currentUrl.origin) {
				headers = new Headers(headers);
				headers.delete("authorization");
			}
			if (response.status === 303 || (response.status === 301 || response.status === 302) && method !== "GET" && method !== "HEAD") {
				method = "GET";
				body = void 0;
				headers = new Headers(headers);
				headers.delete("content-type");
				headers.delete("content-length");
			}
			response.body?.cancel();
			await closeDispatcher(dispatcher);
			currentUrl = nextUrl;
		} catch (error) {
			cleanup();
			await closeDispatcher(dispatcher);
			throw error;
		}
	}
	cleanup();
	throw new Error(`Too many redirects while requesting ${params.url}`);
}
function createMatrixGuardedFetch(params) {
	return (async (resource, init) => {
		const url = toFetchUrl(resource);
		const { signal, ...requestInit } = init ?? {};
		const { response, release } = await fetchWithMatrixGuardedRedirects({
			url,
			init: requestInit,
			signal: signal ?? void 0,
			ssrfPolicy: params.ssrfPolicy
		});
		try {
			return buildBufferedResponse({
				source: response,
				body: await response.arrayBuffer(),
				url
			});
		} finally {
			await release();
		}
	});
}
async function performMatrixRequest(params) {
	const isAbsoluteEndpoint = params.endpoint.startsWith("http://") || params.endpoint.startsWith("https://");
	if (isAbsoluteEndpoint && params.allowAbsoluteEndpoint !== true) throw new Error(`Absolute Matrix endpoint is blocked by default: ${params.endpoint}. Set allowAbsoluteEndpoint=true to opt in.`);
	const baseUrl = isAbsoluteEndpoint ? new URL(params.endpoint) : new URL(normalizeEndpoint(params.endpoint), params.homeserver);
	applyQuery(baseUrl, params.qs);
	const headers = new Headers();
	headers.set("Accept", params.raw ? "*/*" : "application/json");
	if (params.accessToken) headers.set("Authorization", `Bearer ${params.accessToken}`);
	let body;
	if (params.body !== void 0) if (params.body instanceof Uint8Array || params.body instanceof ArrayBuffer || typeof params.body === "string") body = params.body;
	else {
		headers.set("Content-Type", "application/json");
		body = JSON.stringify(params.body);
	}
	const { response, release } = await fetchWithMatrixGuardedRedirects({
		url: baseUrl.toString(),
		init: {
			method: params.method,
			headers,
			body
		},
		timeoutMs: params.timeoutMs,
		ssrfPolicy: params.ssrfPolicy
	});
	try {
		if (params.raw) {
			const contentLength = response.headers.get("content-length");
			if (params.maxBytes && contentLength) {
				const length = Number(contentLength);
				if (Number.isFinite(length) && length > params.maxBytes) throw new Error(`Matrix media exceeds configured size limit (${length} bytes > ${params.maxBytes} bytes)`);
			}
			const bytes = params.maxBytes ? await readResponseWithLimit(response, params.maxBytes, {
				onOverflow: ({ maxBytes, size }) => /* @__PURE__ */ new Error(`Matrix media exceeds configured size limit (${size} bytes > ${maxBytes} bytes)`),
				chunkTimeoutMs: params.readIdleTimeoutMs
			}) : Buffer.from(await response.arrayBuffer());
			return {
				response,
				text: bytes.toString("utf8"),
				buffer: bytes
			};
		}
		const text = await response.text();
		return {
			response,
			text,
			buffer: Buffer.from(text, "utf8")
		};
	} finally {
		await release();
	}
}
//#endregion
//#region extensions/matrix/src/matrix/sdk/http-client.ts
var MatrixAuthedHttpClient = class {
	constructor(homeserver, accessToken, ssrfPolicy) {
		this.homeserver = homeserver;
		this.accessToken = accessToken;
		this.ssrfPolicy = ssrfPolicy;
	}
	async requestJson(params) {
		const { response, text } = await performMatrixRequest({
			homeserver: this.homeserver,
			accessToken: this.accessToken,
			method: params.method,
			endpoint: params.endpoint,
			qs: params.qs,
			body: params.body,
			timeoutMs: params.timeoutMs,
			ssrfPolicy: this.ssrfPolicy,
			allowAbsoluteEndpoint: params.allowAbsoluteEndpoint
		});
		if (!response.ok) throw buildHttpError(response.status, text);
		if ((response.headers.get("content-type") ?? "").includes("application/json")) {
			if (!text.trim()) return {};
			return JSON.parse(text);
		}
		return text;
	}
	async requestRaw(params) {
		const { response, buffer } = await performMatrixRequest({
			homeserver: this.homeserver,
			accessToken: this.accessToken,
			method: params.method,
			endpoint: params.endpoint,
			qs: params.qs,
			timeoutMs: params.timeoutMs,
			raw: true,
			maxBytes: params.maxBytes,
			readIdleTimeoutMs: params.readIdleTimeoutMs,
			ssrfPolicy: this.ssrfPolicy,
			allowAbsoluteEndpoint: params.allowAbsoluteEndpoint
		});
		if (!response.ok) throw buildHttpError(response.status, buffer.toString("utf8"));
		return buffer;
	}
};
//#endregion
//#region extensions/matrix/src/matrix/sdk/idb-persistence.ts
function isValidIdbIndexSnapshot(value) {
	if (!value || typeof value !== "object") return false;
	const candidate = value;
	return typeof candidate.name === "string" && (typeof candidate.keyPath === "string" || Array.isArray(candidate.keyPath) && candidate.keyPath.every((entry) => typeof entry === "string")) && typeof candidate.multiEntry === "boolean" && typeof candidate.unique === "boolean";
}
function isValidIdbRecordSnapshot(value) {
	if (!value || typeof value !== "object") return false;
	return "key" in value && "value" in value;
}
function isValidIdbStoreSnapshot(value) {
	if (!value || typeof value !== "object") return false;
	const candidate = value;
	const validKeyPath = candidate.keyPath === null || typeof candidate.keyPath === "string" || Array.isArray(candidate.keyPath) && candidate.keyPath.every((entry) => typeof entry === "string");
	return typeof candidate.name === "string" && validKeyPath && typeof candidate.autoIncrement === "boolean" && Array.isArray(candidate.indexes) && candidate.indexes.every((entry) => isValidIdbIndexSnapshot(entry)) && Array.isArray(candidate.records) && candidate.records.every((entry) => isValidIdbRecordSnapshot(entry));
}
function isValidIdbDatabaseSnapshot(value) {
	if (!value || typeof value !== "object") return false;
	const candidate = value;
	return typeof candidate.name === "string" && typeof candidate.version === "number" && Number.isFinite(candidate.version) && candidate.version > 0 && Array.isArray(candidate.stores) && candidate.stores.every((entry) => isValidIdbStoreSnapshot(entry));
}
function parseSnapshotPayload(data) {
	const parsed = JSON.parse(data);
	if (!Array.isArray(parsed) || parsed.length === 0) return null;
	if (!parsed.every((entry) => isValidIdbDatabaseSnapshot(entry))) throw new Error("Malformed IndexedDB snapshot payload");
	return parsed;
}
function idbReq(req) {
	return new Promise((resolve, reject) => {
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}
async function dumpIndexedDatabases(databasePrefix) {
	const idb = fakeIndexedDB;
	const dbList = await idb.databases();
	const snapshot = [];
	const expectedPrefix = databasePrefix ? `${databasePrefix}::` : null;
	for (const { name, version } of dbList) {
		if (!name || !version) continue;
		if (expectedPrefix && !name.startsWith(expectedPrefix)) continue;
		const db = await new Promise((resolve, reject) => {
			const r = idb.open(name, version);
			r.onsuccess = () => resolve(r.result);
			r.onerror = () => reject(r.error);
		});
		const stores = [];
		for (const storeName of db.objectStoreNames) {
			const store = db.transaction(storeName, "readonly").objectStore(storeName);
			const storeInfo = {
				name: storeName,
				keyPath: store.keyPath,
				autoIncrement: store.autoIncrement,
				indexes: [],
				records: []
			};
			for (const idxName of store.indexNames) {
				const idx = store.index(idxName);
				storeInfo.indexes.push({
					name: idxName,
					keyPath: idx.keyPath,
					multiEntry: idx.multiEntry,
					unique: idx.unique
				});
			}
			const keys = await idbReq(store.getAllKeys());
			const values = await idbReq(store.getAll());
			storeInfo.records = keys.map((k, i) => ({
				key: k,
				value: values[i]
			}));
			stores.push(storeInfo);
		}
		snapshot.push({
			name,
			version,
			stores
		});
		db.close();
	}
	return snapshot;
}
async function restoreIndexedDatabases(snapshot) {
	const idb = fakeIndexedDB;
	for (const dbSnap of snapshot) await new Promise((resolve, reject) => {
		const r = idb.open(dbSnap.name, dbSnap.version);
		r.onupgradeneeded = () => {
			const db = r.result;
			for (const storeSnap of dbSnap.stores) {
				const opts = {};
				if (storeSnap.keyPath !== null) opts.keyPath = storeSnap.keyPath;
				if (storeSnap.autoIncrement) opts.autoIncrement = true;
				const store = db.createObjectStore(storeSnap.name, opts);
				for (const idx of storeSnap.indexes) store.createIndex(idx.name, idx.keyPath, {
					unique: idx.unique,
					multiEntry: idx.multiEntry
				});
			}
		};
		r.onsuccess = async () => {
			try {
				const db = r.result;
				for (const storeSnap of dbSnap.stores) {
					if (storeSnap.records.length === 0) continue;
					const tx = db.transaction(storeSnap.name, "readwrite");
					const store = tx.objectStore(storeSnap.name);
					for (const rec of storeSnap.records) if (storeSnap.keyPath !== null) store.put(rec.value);
					else store.put(rec.value, rec.key);
					await new Promise((res) => {
						tx.oncomplete = () => res();
					});
				}
				db.close();
				resolve();
			} catch (err) {
				reject(err);
			}
		};
		r.onerror = () => reject(r.error);
	});
}
function resolveDefaultIdbSnapshotPath() {
	const stateDir = process.env.OPENCLAW_STATE_DIR || path.join(process.env.HOME || "/tmp", ".openclaw");
	return path.join(stateDir, "matrix", "crypto-idb-snapshot.json");
}
async function restoreIdbFromDisk(snapshotPath) {
	const candidatePaths = snapshotPath ? [snapshotPath] : [resolveDefaultIdbSnapshotPath()];
	for (const resolvedPath of candidatePaths) try {
		const snapshot = parseSnapshotPayload(fs.readFileSync(resolvedPath, "utf8"));
		if (!snapshot) continue;
		await restoreIndexedDatabases(snapshot);
		LogService.info("IdbPersistence", `Restored ${snapshot.length} IndexedDB database(s) from ${resolvedPath}`);
		return true;
	} catch (err) {
		LogService.warn("IdbPersistence", `Failed to restore IndexedDB snapshot from ${resolvedPath}:`, err);
		continue;
	}
	return false;
}
async function persistIdbToDisk(params) {
	const snapshotPath = params?.snapshotPath ?? resolveDefaultIdbSnapshotPath();
	try {
		const snapshot = await dumpIndexedDatabases(params?.databasePrefix);
		if (snapshot.length === 0) return;
		fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
		fs.writeFileSync(snapshotPath, JSON.stringify(snapshot));
		fs.chmodSync(snapshotPath, 384);
		LogService.debug("IdbPersistence", `Persisted ${snapshot.length} IndexedDB database(s) to ${snapshotPath}`);
	} catch (err) {
		LogService.warn("IdbPersistence", "Failed to persist IndexedDB snapshot:", err);
	}
}
//#endregion
//#region extensions/matrix/src/matrix/sdk/verification-manager.ts
const MAX_TRACKED_VERIFICATION_SESSIONS = 256;
const TERMINAL_SESSION_RETENTION_MS = 1440 * 60 * 1e3;
const SAS_AUTO_CONFIRM_DELAY_MS = 3e4;
var MatrixVerificationManager = class {
	constructor() {
		this.verificationSessions = /* @__PURE__ */ new Map();
		this.verificationSessionCounter = 0;
		this.trackedVerificationRequests = /* @__PURE__ */ new WeakSet();
		this.trackedVerificationVerifiers = /* @__PURE__ */ new WeakSet();
		this.summaryListeners = /* @__PURE__ */ new Set();
	}
	readRequestValue(request, reader, fallback) {
		try {
			return reader();
		} catch {
			return fallback;
		}
	}
	pruneVerificationSessions(nowMs) {
		for (const [id, session] of this.verificationSessions) {
			const phase = this.readRequestValue(session.request, () => session.request.phase, -1);
			if ((phase === VerificationPhase.Done || phase === VerificationPhase.Cancelled) && nowMs - session.updatedAtMs > TERMINAL_SESSION_RETENTION_MS) this.verificationSessions.delete(id);
		}
		if (this.verificationSessions.size <= MAX_TRACKED_VERIFICATION_SESSIONS) return;
		const sortedByAge = Array.from(this.verificationSessions.entries()).sort((a, b) => a[1].updatedAtMs - b[1].updatedAtMs);
		const overflow = this.verificationSessions.size - MAX_TRACKED_VERIFICATION_SESSIONS;
		for (let i = 0; i < overflow; i += 1) {
			const entry = sortedByAge[i];
			if (entry) this.verificationSessions.delete(entry[0]);
		}
	}
	getVerificationPhaseName(phase) {
		switch (phase) {
			case VerificationPhase.Unsent: return "unsent";
			case VerificationPhase.Requested: return "requested";
			case VerificationPhase.Ready: return "ready";
			case VerificationPhase.Started: return "started";
			case VerificationPhase.Cancelled: return "cancelled";
			case VerificationPhase.Done: return "done";
			default: return `unknown(${phase})`;
		}
	}
	emitVerificationSummary(session) {
		const summary = this.buildVerificationSummary(session);
		for (const listener of this.summaryListeners) listener(summary);
	}
	touchVerificationSession(session) {
		session.updatedAtMs = Date.now();
		this.emitVerificationSummary(session);
	}
	clearSasAutoConfirmTimer(session) {
		if (!session.sasAutoConfirmTimer) return;
		clearTimeout(session.sasAutoConfirmTimer);
		session.sasAutoConfirmTimer = void 0;
	}
	buildVerificationSummary(session) {
		const request = session.request;
		const phase = this.readRequestValue(request, () => request.phase, VerificationPhase.Requested);
		const accepting = this.readRequestValue(request, () => request.accepting, false);
		const declining = this.readRequestValue(request, () => request.declining, false);
		const pending = this.readRequestValue(request, () => request.pending, false);
		const methodsRaw = this.readRequestValue(request, () => request.methods, []);
		const methods = Array.isArray(methodsRaw) ? methodsRaw.filter((entry) => typeof entry === "string") : [];
		const sasCallbacks = session.sasCallbacks ?? session.activeVerifier?.getShowSasCallbacks();
		if (sasCallbacks) session.sasCallbacks = sasCallbacks;
		const canAccept = phase < VerificationPhase.Ready && !accepting && !declining;
		return {
			id: session.id,
			transactionId: this.readRequestValue(request, () => request.transactionId, void 0),
			roomId: this.readRequestValue(request, () => request.roomId, void 0),
			otherUserId: this.readRequestValue(request, () => request.otherUserId, "unknown"),
			otherDeviceId: this.readRequestValue(request, () => request.otherDeviceId, void 0),
			isSelfVerification: this.readRequestValue(request, () => request.isSelfVerification, false),
			initiatedByMe: this.readRequestValue(request, () => request.initiatedByMe, false),
			phase,
			phaseName: this.getVerificationPhaseName(phase),
			pending,
			methods,
			chosenMethod: this.readRequestValue(request, () => request.chosenMethod ?? null, null),
			canAccept,
			hasSas: Boolean(sasCallbacks),
			sas: sasCallbacks ? {
				decimal: sasCallbacks.sas.decimal,
				emoji: sasCallbacks.sas.emoji
			} : void 0,
			hasReciprocateQr: Boolean(session.reciprocateQrCallbacks),
			completed: phase === VerificationPhase.Done,
			error: session.error,
			createdAt: new Date(session.createdAtMs).toISOString(),
			updatedAt: new Date(session.updatedAtMs).toISOString()
		};
	}
	findVerificationSession(id) {
		const direct = this.verificationSessions.get(id);
		if (direct) return direct;
		for (const session of this.verificationSessions.values()) if (this.readRequestValue(session.request, () => session.request.transactionId, "") === id) return session;
		throw new Error(`Matrix verification request not found: ${id}`);
	}
	ensureVerificationRequestTracked(session) {
		const requestObj = session.request;
		if (this.trackedVerificationRequests.has(requestObj)) return;
		this.trackedVerificationRequests.add(requestObj);
		session.request.on(VerificationRequestEvent.Change, () => {
			this.touchVerificationSession(session);
			this.maybeAutoAcceptInboundRequest(session);
			const verifier = this.readRequestValue(session.request, () => session.request.verifier, null);
			if (verifier) this.attachVerifierToVerificationSession(session, verifier);
			this.maybeAutoStartInboundSas(session);
		});
	}
	maybeAutoAcceptInboundRequest(session) {
		if (session.acceptRequested) return;
		const request = session.request;
		const isSelfVerification = this.readRequestValue(request, () => request.isSelfVerification, false);
		const initiatedByMe = this.readRequestValue(request, () => request.initiatedByMe, false);
		const phase = this.readRequestValue(request, () => request.phase, VerificationPhase.Requested);
		const accepting = this.readRequestValue(request, () => request.accepting, false);
		const declining = this.readRequestValue(request, () => request.declining, false);
		if (isSelfVerification || initiatedByMe) return;
		if (phase !== VerificationPhase.Requested || accepting || declining) return;
		session.acceptRequested = true;
		request.accept().then(() => {
			this.touchVerificationSession(session);
		}).catch((err) => {
			session.acceptRequested = false;
			session.error = err instanceof Error ? err.message : String(err);
			this.touchVerificationSession(session);
		});
	}
	maybeAutoStartInboundSas(session) {
		if (session.activeVerifier || session.verifyStarted || session.startRequested) return;
		if (this.readRequestValue(session.request, () => session.request.initiatedByMe, true)) return;
		if (!this.readRequestValue(session.request, () => session.request.isSelfVerification, false)) return;
		const phase = this.readRequestValue(session.request, () => session.request.phase, VerificationPhase.Requested);
		if (phase < VerificationPhase.Ready || phase >= VerificationPhase.Cancelled) return;
		const methodsRaw = this.readRequestValue(session.request, () => session.request.methods, []);
		const methods = Array.isArray(methodsRaw) ? methodsRaw.filter((entry) => typeof entry === "string") : [];
		const chosenMethod = this.readRequestValue(session.request, () => session.request.chosenMethod, null);
		if (!(methods.includes(VerificationMethod.Sas) || chosenMethod === VerificationMethod.Sas)) return;
		session.startRequested = true;
		session.request.startVerification(VerificationMethod.Sas).then((verifier) => {
			this.attachVerifierToVerificationSession(session, verifier);
			this.touchVerificationSession(session);
		}).catch(() => {
			session.startRequested = false;
		});
	}
	attachVerifierToVerificationSession(session, verifier) {
		session.activeVerifier = verifier;
		this.touchVerificationSession(session);
		const maybeSas = verifier.getShowSasCallbacks();
		if (maybeSas) {
			session.sasCallbacks = maybeSas;
			this.maybeAutoConfirmSas(session);
		}
		const maybeReciprocateQr = verifier.getReciprocateQrCodeCallbacks();
		if (maybeReciprocateQr) session.reciprocateQrCallbacks = maybeReciprocateQr;
		const verifierObj = verifier;
		if (this.trackedVerificationVerifiers.has(verifierObj)) {
			this.ensureVerificationStarted(session);
			return;
		}
		this.trackedVerificationVerifiers.add(verifierObj);
		verifier.on(VerifierEvent.ShowSas, (sas) => {
			session.sasCallbacks = sas;
			this.touchVerificationSession(session);
			this.maybeAutoConfirmSas(session);
		});
		verifier.on(VerifierEvent.ShowReciprocateQr, (qr) => {
			session.reciprocateQrCallbacks = qr;
			this.touchVerificationSession(session);
		});
		verifier.on(VerifierEvent.Cancel, (err) => {
			this.clearSasAutoConfirmTimer(session);
			session.error = err instanceof Error ? err.message : String(err);
			this.touchVerificationSession(session);
		});
		this.ensureVerificationStarted(session);
	}
	maybeAutoConfirmSas(session) {
		if (session.sasAutoConfirmStarted || session.sasAutoConfirmTimer) return;
		if (this.readRequestValue(session.request, () => session.request.initiatedByMe, true)) return;
		const callbacks = session.sasCallbacks ?? session.activeVerifier?.getShowSasCallbacks();
		if (!callbacks) return;
		session.sasCallbacks = callbacks;
		session.sasAutoConfirmTimer = setTimeout(() => {
			session.sasAutoConfirmTimer = void 0;
			if (this.readRequestValue(session.request, () => session.request.phase, VerificationPhase.Requested) >= VerificationPhase.Cancelled) return;
			session.sasAutoConfirmStarted = true;
			callbacks.confirm().then(() => {
				this.touchVerificationSession(session);
			}).catch((err) => {
				session.error = err instanceof Error ? err.message : String(err);
				this.touchVerificationSession(session);
			});
		}, SAS_AUTO_CONFIRM_DELAY_MS);
	}
	ensureVerificationStarted(session) {
		if (!session.activeVerifier || session.verifyStarted) return;
		session.verifyStarted = true;
		session.verifyPromise = session.activeVerifier.verify().then(() => {
			this.touchVerificationSession(session);
		}).catch((err) => {
			session.error = err instanceof Error ? err.message : String(err);
			this.touchVerificationSession(session);
		});
	}
	onSummaryChanged(listener) {
		this.summaryListeners.add(listener);
		return () => {
			this.summaryListeners.delete(listener);
		};
	}
	trackVerificationRequest(request) {
		this.pruneVerificationSessions(Date.now());
		const txId = this.readRequestValue(request, () => request.transactionId?.trim(), "");
		if (txId) {
			for (const existing of this.verificationSessions.values()) if (this.readRequestValue(existing.request, () => existing.request.transactionId, "") === txId) {
				existing.request = request;
				this.ensureVerificationRequestTracked(existing);
				const verifier = this.readRequestValue(request, () => request.verifier, null);
				if (verifier) this.attachVerifierToVerificationSession(existing, verifier);
				this.touchVerificationSession(existing);
				return this.buildVerificationSummary(existing);
			}
		}
		const now = Date.now();
		const session = {
			id: `verification-${++this.verificationSessionCounter}`,
			request,
			createdAtMs: now,
			updatedAtMs: now,
			verifyStarted: false,
			startRequested: false,
			acceptRequested: false,
			sasAutoConfirmStarted: false
		};
		this.verificationSessions.set(session.id, session);
		this.ensureVerificationRequestTracked(session);
		this.maybeAutoAcceptInboundRequest(session);
		const verifier = this.readRequestValue(request, () => request.verifier, null);
		if (verifier) this.attachVerifierToVerificationSession(session, verifier);
		this.maybeAutoStartInboundSas(session);
		this.emitVerificationSummary(session);
		return this.buildVerificationSummary(session);
	}
	async requestOwnUserVerification(crypto) {
		if (!crypto) return null;
		const request = await crypto.requestOwnUserVerification();
		if (!request) return null;
		return this.trackVerificationRequest(request);
	}
	listVerifications() {
		this.pruneVerificationSessions(Date.now());
		return Array.from(this.verificationSessions.values()).map((session) => this.buildVerificationSummary(session)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
	}
	async requestVerification(crypto, params) {
		if (!crypto) throw new Error("Matrix crypto is not available");
		let request = null;
		if (params.ownUser) request = await crypto.requestOwnUserVerification();
		else if (params.userId && params.deviceId && crypto.requestDeviceVerification) request = await crypto.requestDeviceVerification(params.userId, params.deviceId);
		else if (params.userId && params.roomId && crypto.requestVerificationDM) request = await crypto.requestVerificationDM(params.userId, params.roomId);
		else throw new Error("Matrix verification request requires one of: ownUser, userId+deviceId, or userId+roomId");
		if (!request) throw new Error("Matrix verification request could not be created");
		return this.trackVerificationRequest(request);
	}
	async acceptVerification(id) {
		const session = this.findVerificationSession(id);
		await session.request.accept();
		this.touchVerificationSession(session);
		return this.buildVerificationSummary(session);
	}
	async cancelVerification(id, params) {
		const session = this.findVerificationSession(id);
		await session.request.cancel(params);
		this.touchVerificationSession(session);
		return this.buildVerificationSummary(session);
	}
	async startVerification(id, method = "sas") {
		const session = this.findVerificationSession(id);
		if (method !== "sas") throw new Error("Matrix startVerification currently supports only SAS directly");
		const verifier = await session.request.startVerification(VerificationMethod.Sas);
		this.attachVerifierToVerificationSession(session, verifier);
		this.ensureVerificationStarted(session);
		return this.buildVerificationSummary(session);
	}
	async generateVerificationQr(id) {
		const qr = await this.findVerificationSession(id).request.generateQRCode();
		if (!qr) throw new Error("Matrix verification QR data is not available yet");
		return { qrDataBase64: Buffer.from(qr).toString("base64") };
	}
	async scanVerificationQr(id, qrDataBase64) {
		const session = this.findVerificationSession(id);
		const trimmed = qrDataBase64.trim();
		if (!trimmed) throw new Error("Matrix verification QR payload is required");
		const qrBytes = Buffer.from(trimmed, "base64");
		if (qrBytes.length === 0) throw new Error("Matrix verification QR payload is invalid base64");
		const verifier = await session.request.scanQRCode(new Uint8ClampedArray(qrBytes));
		this.attachVerifierToVerificationSession(session, verifier);
		this.ensureVerificationStarted(session);
		return this.buildVerificationSummary(session);
	}
	async confirmVerificationSas(id) {
		const session = this.findVerificationSession(id);
		const callbacks = session.sasCallbacks ?? session.activeVerifier?.getShowSasCallbacks();
		if (!callbacks) throw new Error("Matrix SAS confirmation is not available for this verification request");
		this.clearSasAutoConfirmTimer(session);
		session.sasCallbacks = callbacks;
		session.sasAutoConfirmStarted = true;
		await callbacks.confirm();
		this.touchVerificationSession(session);
		return this.buildVerificationSummary(session);
	}
	mismatchVerificationSas(id) {
		const session = this.findVerificationSession(id);
		const callbacks = session.sasCallbacks ?? session.activeVerifier?.getShowSasCallbacks();
		if (!callbacks) throw new Error("Matrix SAS mismatch is not available for this verification request");
		this.clearSasAutoConfirmTimer(session);
		session.sasCallbacks = callbacks;
		callbacks.mismatch();
		this.touchVerificationSession(session);
		return this.buildVerificationSummary(session);
	}
	confirmVerificationReciprocateQr(id) {
		const session = this.findVerificationSession(id);
		const callbacks = session.reciprocateQrCallbacks ?? session.activeVerifier?.getReciprocateQrCodeCallbacks();
		if (!callbacks) throw new Error("Matrix reciprocate-QR confirmation is not available for this verification request");
		session.reciprocateQrCallbacks = callbacks;
		callbacks.confirm();
		this.touchVerificationSession(session);
		return this.buildVerificationSummary(session);
	}
	getVerificationSas(id) {
		const session = this.findVerificationSession(id);
		const callbacks = session.sasCallbacks ?? session.activeVerifier?.getShowSasCallbacks();
		if (!callbacks) throw new Error("Matrix SAS data is not available for this verification request");
		session.sasCallbacks = callbacks;
		return {
			decimal: callbacks.sas.decimal,
			emoji: callbacks.sas.emoji
		};
	}
};
//#endregion
//#region extensions/matrix/src/matrix/sdk.ts
function normalizeOptionalString(value) {
	const normalized = value?.trim();
	return normalized ? normalized : null;
}
function isMatrixNotFoundError(err) {
	const errObj = err;
	if (errObj?.statusCode === 404 || errObj?.body?.errcode === "M_NOT_FOUND") return true;
	const message = (err instanceof Error ? err.message : String(err)).toLowerCase();
	return message.includes("m_not_found") || message.includes("[404]") || message.includes("not found");
}
function isUnsupportedAuthenticatedMediaEndpointError(err) {
	const statusCode = err?.statusCode;
	if (statusCode === 404 || statusCode === 405 || statusCode === 501) return true;
	const message = (err instanceof Error ? err.message : String(err)).toLowerCase();
	return message.includes("m_unrecognized") || message.includes("unrecognized request") || message.includes("method not allowed") || message.includes("not implemented");
}
var MatrixClient = class {
	constructor(homeserver, accessToken, _storage, _cryptoStorage, opts = {}) {
		this.emitter = new EventEmitter();
		this.bridgeRegistered = false;
		this.started = false;
		this.cryptoBootstrapped = false;
		this.dmRoomIds = /* @__PURE__ */ new Set();
		this.cryptoInitialized = false;
		this.verificationManager = new MatrixVerificationManager();
		this.sendQueue = new KeyedAsyncQueue();
		this.stopPersistPromise = null;
		this.dms = {
			update: async () => {
				await this.refreshDmCache();
			},
			isDm: (roomId) => this.dmRoomIds.has(roomId)
		};
		this.idbPersistTimer = null;
		this.httpClient = new MatrixAuthedHttpClient(homeserver, accessToken, opts.ssrfPolicy);
		this.localTimeoutMs = Math.max(1, opts.localTimeoutMs ?? 6e4);
		this.initialSyncLimit = opts.initialSyncLimit;
		this.encryptionEnabled = opts.encryption === true;
		this.password = opts.password;
		this.syncStore = opts.storagePath ? new FileBackedMatrixSyncStore(opts.storagePath) : void 0;
		this.idbSnapshotPath = opts.idbSnapshotPath;
		this.cryptoDatabasePrefix = opts.cryptoDatabasePrefix;
		this.selfUserId = opts.userId?.trim() || null;
		this.autoBootstrapCrypto = opts.autoBootstrapCrypto !== false;
		this.recoveryKeyStore = new MatrixRecoveryKeyStore(opts.recoveryKeyPath);
		const cryptoCallbacks = this.encryptionEnabled ? this.recoveryKeyStore.buildCryptoCallbacks() : void 0;
		this.client = createClient({
			baseUrl: homeserver,
			accessToken,
			userId: opts.userId,
			deviceId: opts.deviceId,
			logger: createMatrixJsSdkClientLogger("MatrixClient"),
			localTimeoutMs: this.localTimeoutMs,
			fetchFn: createMatrixGuardedFetch({ ssrfPolicy: opts.ssrfPolicy }),
			store: this.syncStore,
			cryptoCallbacks,
			verificationMethods: [
				VerificationMethod.Sas,
				VerificationMethod.ShowQrCode,
				VerificationMethod.ScanQrCode,
				VerificationMethod.Reciprocate
			]
		});
		this.decryptBridge = new MatrixDecryptBridge({
			client: this.client,
			toRaw: (event) => matrixEventToRaw(event),
			emitDecryptedEvent: (roomId, event) => {
				this.emitter.emit("room.decrypted_event", roomId, event);
			},
			emitMessage: (roomId, event) => {
				this.emitter.emit("room.message", roomId, event);
			},
			emitFailedDecryption: (roomId, event, error) => {
				this.emitter.emit("room.failed_decryption", roomId, event, error);
			}
		});
		this.cryptoBootstrapper = new MatrixCryptoBootstrapper({
			getUserId: () => this.getUserId(),
			getPassword: () => opts.password,
			getDeviceId: () => this.client.getDeviceId(),
			verificationManager: this.verificationManager,
			recoveryKeyStore: this.recoveryKeyStore,
			decryptBridge: this.decryptBridge
		});
		this.verificationManager.onSummaryChanged((summary) => {
			this.emitter.emit("verification.summary", summary);
		});
		if (this.encryptionEnabled) this.crypto = createMatrixCryptoFacade({
			client: this.client,
			verificationManager: this.verificationManager,
			recoveryKeyStore: this.recoveryKeyStore,
			getRoomStateEvent: (roomId, eventType, stateKey = "") => this.getRoomStateEvent(roomId, eventType, stateKey),
			downloadContent: (mxcUrl) => this.downloadContent(mxcUrl)
		});
	}
	on(eventName, listener) {
		this.emitter.on(eventName, listener);
		return this;
	}
	off(eventName, listener) {
		this.emitter.off(eventName, listener);
		return this;
	}
	async start() {
		await this.startSyncSession({ bootstrapCrypto: true });
	}
	async startSyncSession(opts) {
		if (this.started) return;
		this.registerBridge();
		await this.initializeCryptoIfNeeded();
		await this.client.startClient({ initialSyncLimit: this.initialSyncLimit });
		if (opts.bootstrapCrypto && this.autoBootstrapCrypto) await this.bootstrapCryptoIfNeeded();
		this.started = true;
		this.emitOutstandingInviteEvents();
		await this.refreshDmCache().catch(noop);
	}
	async prepareForOneOff() {
		if (!this.encryptionEnabled) return;
		await this.initializeCryptoIfNeeded();
		if (!this.crypto) return;
		try {
			const joinedRooms = await this.getJoinedRooms();
			await this.crypto.prepare(joinedRooms);
		} catch {}
	}
	hasPersistedSyncState() {
		return this.syncStore?.hasSavedSyncFromCleanShutdown() === true;
	}
	async ensureStartedForCryptoControlPlane() {
		if (this.started) return;
		await this.startSyncSession({ bootstrapCrypto: false });
	}
	stopSyncWithoutPersist() {
		if (this.idbPersistTimer) {
			clearInterval(this.idbPersistTimer);
			this.idbPersistTimer = null;
		}
		this.client.stopClient();
		this.started = false;
	}
	async drainPendingDecryptions(reason = "matrix client shutdown") {
		await this.decryptBridge.drainPendingDecryptions(reason);
	}
	stop() {
		this.stopSyncWithoutPersist();
		this.decryptBridge.stop();
		this.syncStore?.markCleanShutdown();
		this.stopPersistPromise = Promise.all([persistIdbToDisk({
			snapshotPath: this.idbSnapshotPath,
			databasePrefix: this.cryptoDatabasePrefix
		}).catch(noop), this.syncStore?.flush().catch(noop)]).then(() => void 0);
	}
	async stopAndPersist() {
		this.stop();
		await this.stopPersistPromise;
	}
	async bootstrapCryptoIfNeeded() {
		if (!this.encryptionEnabled || !this.cryptoInitialized || this.cryptoBootstrapped) return;
		const crypto = this.client.getCrypto();
		if (!crypto) return;
		const initial = await this.cryptoBootstrapper.bootstrap(crypto, { allowAutomaticCrossSigningReset: false });
		if (!initial.crossSigningPublished || initial.ownDeviceVerified === false) if ((await this.getOwnDeviceVerificationStatus()).signedByOwner) LogService.warn("MatrixClientLite", "Cross-signing/bootstrap is incomplete for an already owner-signed device; skipping automatic reset and preserving the current identity. Restore the recovery key or run an explicit verification bootstrap if repair is needed.");
		else if (this.password?.trim()) try {
			const repaired = await this.cryptoBootstrapper.bootstrap(crypto, {
				forceResetCrossSigning: true,
				strict: true
			});
			if (repaired.crossSigningPublished && repaired.ownDeviceVerified !== false) LogService.info("MatrixClientLite", "Cross-signing/bootstrap recovered after forced reset");
		} catch (err) {
			LogService.warn("MatrixClientLite", "Failed to recover cross-signing/bootstrap with forced reset:", err);
		}
		else LogService.warn("MatrixClientLite", "Cross-signing/bootstrap incomplete and no password is configured for UIA fallback");
		this.cryptoBootstrapped = true;
	}
	async initializeCryptoIfNeeded() {
		if (!this.encryptionEnabled || this.cryptoInitialized) return;
		await restoreIdbFromDisk(this.idbSnapshotPath);
		try {
			await this.client.initRustCrypto({ cryptoDatabasePrefix: this.cryptoDatabasePrefix });
			this.cryptoInitialized = true;
			await persistIdbToDisk({
				snapshotPath: this.idbSnapshotPath,
				databasePrefix: this.cryptoDatabasePrefix
			});
			this.idbPersistTimer = setInterval(() => {
				persistIdbToDisk({
					snapshotPath: this.idbSnapshotPath,
					databasePrefix: this.cryptoDatabasePrefix
				}).catch(noop);
			}, 6e4);
		} catch (err) {
			LogService.warn("MatrixClientLite", "Failed to initialize rust crypto:", err);
		}
	}
	async getUserId() {
		const fromClient = this.client.getUserId();
		if (fromClient) {
			this.selfUserId = fromClient;
			return fromClient;
		}
		if (this.selfUserId) return this.selfUserId;
		const resolved = (await this.doRequest("GET", "/_matrix/client/v3/account/whoami")).user_id?.trim();
		if (!resolved) throw new Error("Matrix whoami did not return user_id");
		this.selfUserId = resolved;
		return resolved;
	}
	async getJoinedRooms() {
		const joined = await this.client.getJoinedRooms();
		return Array.isArray(joined.joined_rooms) ? joined.joined_rooms : [];
	}
	async getJoinedRoomMembers(roomId) {
		const joined = (await this.client.getJoinedRoomMembers(roomId))?.joined;
		if (!joined || typeof joined !== "object") return [];
		return Object.keys(joined);
	}
	async getRoomStateEvent(roomId, eventType, stateKey = "") {
		return await this.client.getStateEvent(roomId, eventType, stateKey) ?? {};
	}
	async getAccountData(eventType) {
		return this.client.getAccountData(eventType)?.getContent() ?? void 0;
	}
	async setAccountData(eventType, content) {
		await this.client.setAccountData(eventType, content);
		await this.refreshDmCache().catch(noop);
	}
	async resolveRoom(aliasOrRoomId) {
		if (aliasOrRoomId.startsWith("!")) return aliasOrRoomId;
		if (!aliasOrRoomId.startsWith("#")) return aliasOrRoomId;
		try {
			return (await this.client.getRoomIdForAlias(aliasOrRoomId)).room_id ?? null;
		} catch {
			return null;
		}
	}
	async createDirectRoom(remoteUserId, opts = {}) {
		const initialState = opts.encrypted ? [{
			type: "m.room.encryption",
			state_key: "",
			content: { algorithm: "m.megolm.v1.aes-sha2" }
		}] : void 0;
		return (await this.client.createRoom({
			invite: [remoteUserId],
			is_direct: true,
			preset: Preset.TrustedPrivateChat,
			initial_state: initialState
		})).room_id;
	}
	async sendMessage(roomId, content) {
		return await this.runSerializedRoomSend(roomId, async () => {
			return (await this.client.sendMessage(roomId, content)).event_id;
		});
	}
	async sendEvent(roomId, eventType, content) {
		return await this.runSerializedRoomSend(roomId, async () => {
			return (await this.client.sendEvent(roomId, eventType, content)).event_id;
		});
	}
	async runSerializedRoomSend(roomId, task) {
		return await this.sendQueue.enqueue(roomId, task);
	}
	async sendStateEvent(roomId, eventType, stateKey, content) {
		return (await this.client.sendStateEvent(roomId, eventType, content, stateKey)).event_id;
	}
	async redactEvent(roomId, eventId, reason) {
		return (await this.client.redactEvent(roomId, eventId, void 0, reason?.trim() ? { reason } : void 0)).event_id;
	}
	async doRequest(method, endpoint, qs, body, opts) {
		return await this.httpClient.requestJson({
			method,
			endpoint,
			qs,
			body,
			timeoutMs: this.localTimeoutMs,
			allowAbsoluteEndpoint: opts?.allowAbsoluteEndpoint
		});
	}
	async getUserProfile(userId) {
		return await this.client.getProfileInfo(userId);
	}
	async setDisplayName(displayName) {
		await this.client.setDisplayName(displayName);
	}
	async setAvatarUrl(avatarUrl) {
		await this.client.setAvatarUrl(avatarUrl);
	}
	async joinRoom(roomId) {
		await this.client.joinRoom(roomId);
	}
	mxcToHttp(mxcUrl) {
		return this.client.mxcUrlToHttp(mxcUrl, void 0, void 0, void 0, true, false, true);
	}
	async downloadContent(mxcUrl, opts = {}) {
		const parsed = parseMxc(mxcUrl);
		if (!parsed) throw new Error(`Invalid Matrix content URI: ${mxcUrl}`);
		const encodedServer = encodeURIComponent(parsed.server);
		const encodedMediaId = encodeURIComponent(parsed.mediaId);
		const request = async (endpoint) => await this.httpClient.requestRaw({
			method: "GET",
			endpoint,
			qs: { allow_remote: opts.allowRemote ?? true },
			timeoutMs: this.localTimeoutMs,
			maxBytes: opts.maxBytes,
			readIdleTimeoutMs: opts.readIdleTimeoutMs
		});
		const authenticatedEndpoint = `/_matrix/client/v1/media/download/${encodedServer}/${encodedMediaId}`;
		try {
			return await request(authenticatedEndpoint);
		} catch (err) {
			if (!isUnsupportedAuthenticatedMediaEndpointError(err)) throw err;
		}
		return await request(`/_matrix/media/v3/download/${encodedServer}/${encodedMediaId}`);
	}
	async uploadContent(file, contentType, filename) {
		return (await this.client.uploadContent(new Uint8Array(file), {
			type: contentType || "application/octet-stream",
			name: filename,
			includeFilename: Boolean(filename)
		})).content_uri;
	}
	async getEvent(roomId, eventId) {
		const rawEvent = await this.client.fetchRoomEvent(roomId, eventId);
		if (rawEvent.type !== "m.room.encrypted") return rawEvent;
		const event = this.client.getEventMapper()(rawEvent);
		let decryptedEvent;
		const onDecrypted = (candidate) => {
			decryptedEvent = candidate;
		};
		event.once(MatrixEventEvent.Decrypted, onDecrypted);
		try {
			await this.client.decryptEventIfNeeded(event);
		} finally {
			event.off(MatrixEventEvent.Decrypted, onDecrypted);
		}
		return matrixEventToRaw(decryptedEvent ?? event);
	}
	async getRelations(roomId, eventId, relationType, eventType, opts = {}) {
		const result = await this.client.relations(roomId, eventId, relationType, eventType, opts);
		return {
			originalEvent: result.originalEvent ? matrixEventToRaw(result.originalEvent) : null,
			events: result.events.map((event) => matrixEventToRaw(event)),
			nextBatch: result.nextBatch ?? null,
			prevBatch: result.prevBatch ?? null
		};
	}
	async hydrateEvents(roomId, events) {
		if (events.length === 0) return [];
		const mapper = this.client.getEventMapper();
		const mappedEvents = events.map((event) => mapper({
			room_id: roomId,
			...event
		}));
		await Promise.all(mappedEvents.map((event) => this.client.decryptEventIfNeeded(event)));
		return mappedEvents.map((event) => matrixEventToRaw(event));
	}
	async setTyping(roomId, typing, timeoutMs) {
		await this.client.sendTyping(roomId, typing, timeoutMs);
	}
	async sendReadReceipt(roomId, eventId) {
		await this.httpClient.requestJson({
			method: "POST",
			endpoint: `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/receipt/m.read/${encodeURIComponent(eventId)}`,
			body: {},
			timeoutMs: this.localTimeoutMs
		});
	}
	async getRoomKeyBackupStatus() {
		if (!this.encryptionEnabled) return {
			serverVersion: null,
			activeVersion: null,
			trusted: null,
			matchesDecryptionKey: null,
			decryptionKeyCached: null,
			keyLoadAttempted: false,
			keyLoadError: null
		};
		const crypto = this.client.getCrypto();
		const serverVersionFallback = await this.resolveRoomKeyBackupVersion();
		if (!crypto) return {
			serverVersion: serverVersionFallback,
			activeVersion: null,
			trusted: null,
			matchesDecryptionKey: null,
			decryptionKeyCached: null,
			keyLoadAttempted: false,
			keyLoadError: null
		};
		let { activeVersion, decryptionKeyCached } = await this.resolveRoomKeyBackupLocalState(crypto);
		let { serverVersion, trusted, matchesDecryptionKey } = await this.resolveRoomKeyBackupTrustState(crypto, serverVersionFallback);
		const shouldLoadBackupKey = Boolean(serverVersion) && (decryptionKeyCached === false || matchesDecryptionKey === false);
		const shouldActivateBackup = Boolean(serverVersion) && !activeVersion;
		let keyLoadAttempted = false;
		let keyLoadError = null;
		if (serverVersion && (shouldLoadBackupKey || shouldActivateBackup)) {
			if (shouldLoadBackupKey) if (typeof crypto.loadSessionBackupPrivateKeyFromSecretStorage === "function") {
				keyLoadAttempted = true;
				try {
					await crypto.loadSessionBackupPrivateKeyFromSecretStorage();
				} catch (err) {
					keyLoadError = err instanceof Error ? err.message : String(err);
				}
			} else keyLoadError = "Matrix crypto backend does not support loading backup keys from secret storage";
			if (!keyLoadError) await this.enableTrustedRoomKeyBackupIfPossible(crypto);
			({activeVersion, decryptionKeyCached} = await this.resolveRoomKeyBackupLocalState(crypto));
			({serverVersion, trusted, matchesDecryptionKey} = await this.resolveRoomKeyBackupTrustState(crypto, serverVersion));
		}
		return {
			serverVersion,
			activeVersion,
			trusted,
			matchesDecryptionKey,
			decryptionKeyCached,
			keyLoadAttempted,
			keyLoadError
		};
	}
	async getOwnDeviceVerificationStatus() {
		const recoveryKey = this.recoveryKeyStore.getRecoveryKeySummary();
		const userId = this.client.getUserId() ?? this.selfUserId ?? null;
		const deviceId = this.client.getDeviceId()?.trim() || null;
		const backup = await this.getRoomKeyBackupStatus();
		if (!this.encryptionEnabled) return {
			encryptionEnabled: false,
			userId,
			deviceId,
			verified: false,
			localVerified: false,
			crossSigningVerified: false,
			signedByOwner: false,
			recoveryKeyStored: Boolean(recoveryKey),
			recoveryKeyCreatedAt: recoveryKey?.createdAt ?? null,
			recoveryKeyId: recoveryKey?.keyId ?? null,
			backupVersion: backup.serverVersion,
			backup
		};
		const crypto = this.client.getCrypto();
		let deviceStatus = null;
		if (crypto && userId && deviceId && typeof crypto.getDeviceVerificationStatus === "function") deviceStatus = await crypto.getDeviceVerificationStatus(userId, deviceId).catch(() => null);
		return {
			encryptionEnabled: true,
			userId,
			deviceId,
			verified: isMatrixDeviceOwnerVerified(deviceStatus),
			localVerified: deviceStatus?.localVerified === true,
			crossSigningVerified: deviceStatus?.crossSigningVerified === true,
			signedByOwner: deviceStatus?.signedByOwner === true,
			recoveryKeyStored: Boolean(recoveryKey),
			recoveryKeyCreatedAt: recoveryKey?.createdAt ?? null,
			recoveryKeyId: recoveryKey?.keyId ?? null,
			backupVersion: backup.serverVersion,
			backup
		};
	}
	async verifyWithRecoveryKey(rawRecoveryKey) {
		const fail = async (error) => ({
			success: false,
			error,
			...await this.getOwnDeviceVerificationStatus()
		});
		if (!this.encryptionEnabled) return await fail("Matrix encryption is disabled for this client");
		await this.ensureStartedForCryptoControlPlane();
		const crypto = this.client.getCrypto();
		if (!crypto) return await fail("Matrix crypto is not available (start client with encryption enabled)");
		const trimmedRecoveryKey = rawRecoveryKey.trim();
		if (!trimmedRecoveryKey) return await fail("Matrix recovery key is required");
		try {
			this.recoveryKeyStore.stageEncodedRecoveryKey({
				encodedPrivateKey: trimmedRecoveryKey,
				keyId: await this.resolveDefaultSecretStorageKeyId(crypto)
			});
		} catch (err) {
			return await fail(err instanceof Error ? err.message : String(err));
		}
		try {
			await this.cryptoBootstrapper.bootstrap(crypto, { allowAutomaticCrossSigningReset: false });
			await this.enableTrustedRoomKeyBackupIfPossible(crypto);
			const status = await this.getOwnDeviceVerificationStatus();
			if (!status.verified) {
				this.recoveryKeyStore.discardStagedRecoveryKey();
				return {
					success: false,
					error: "Matrix device is still not verified by its owner after applying the recovery key. Ensure cross-signing is available and the device is signed.",
					...status
				};
			}
			const backupError = resolveMatrixRoomKeyBackupReadinessError(status.backup, { requireServerBackup: false });
			if (backupError) {
				this.recoveryKeyStore.discardStagedRecoveryKey();
				return {
					success: false,
					error: backupError,
					...status
				};
			}
			this.recoveryKeyStore.commitStagedRecoveryKey({ keyId: await this.resolveDefaultSecretStorageKeyId(crypto) });
			const committedStatus = await this.getOwnDeviceVerificationStatus();
			return {
				success: true,
				verifiedAt: (/* @__PURE__ */ new Date()).toISOString(),
				...committedStatus
			};
		} catch (err) {
			this.recoveryKeyStore.discardStagedRecoveryKey();
			return await fail(err instanceof Error ? err.message : String(err));
		}
	}
	async restoreRoomKeyBackup(params = {}) {
		let loadedFromSecretStorage = false;
		const fail = async (error) => {
			const backup = await this.getRoomKeyBackupStatus();
			return {
				success: false,
				error,
				backupVersion: backup.serverVersion,
				imported: 0,
				total: 0,
				loadedFromSecretStorage,
				backup
			};
		};
		if (!this.encryptionEnabled) return await fail("Matrix encryption is disabled for this client");
		await this.ensureStartedForCryptoControlPlane();
		const crypto = this.client.getCrypto();
		if (!crypto) return await fail("Matrix crypto is not available (start client with encryption enabled)");
		try {
			const rawRecoveryKey = params.recoveryKey?.trim();
			if (rawRecoveryKey) this.recoveryKeyStore.stageEncodedRecoveryKey({
				encodedPrivateKey: rawRecoveryKey,
				keyId: await this.resolveDefaultSecretStorageKeyId(crypto)
			});
			const backup = await this.getRoomKeyBackupStatus();
			loadedFromSecretStorage = backup.keyLoadAttempted && !backup.keyLoadError;
			const backupError = resolveMatrixRoomKeyBackupReadinessError(backup, { requireServerBackup: true });
			if (backupError) {
				this.recoveryKeyStore.discardStagedRecoveryKey();
				return await fail(backupError);
			}
			if (typeof crypto.restoreKeyBackup !== "function") {
				this.recoveryKeyStore.discardStagedRecoveryKey();
				return await fail("Matrix crypto backend does not support full key backup restore");
			}
			const restore = await crypto.restoreKeyBackup();
			if (rawRecoveryKey) this.recoveryKeyStore.commitStagedRecoveryKey({ keyId: await this.resolveDefaultSecretStorageKeyId(crypto) });
			const finalBackup = await this.getRoomKeyBackupStatus();
			return {
				success: true,
				backupVersion: backup.serverVersion,
				imported: typeof restore.imported === "number" ? restore.imported : 0,
				total: typeof restore.total === "number" ? restore.total : 0,
				loadedFromSecretStorage,
				restoredAt: (/* @__PURE__ */ new Date()).toISOString(),
				backup: finalBackup
			};
		} catch (err) {
			this.recoveryKeyStore.discardStagedRecoveryKey();
			return await fail(err instanceof Error ? err.message : String(err));
		}
	}
	async resetRoomKeyBackup() {
		let previousVersion = null;
		let deletedVersion = null;
		const fail = async (error) => {
			const backup = await this.getRoomKeyBackupStatus();
			return {
				success: false,
				error,
				previousVersion,
				deletedVersion,
				createdVersion: backup.serverVersion,
				backup
			};
		};
		if (!this.encryptionEnabled) return await fail("Matrix encryption is disabled for this client");
		await this.ensureStartedForCryptoControlPlane();
		const crypto = this.client.getCrypto();
		if (!crypto) return await fail("Matrix crypto is not available (start client with encryption enabled)");
		previousVersion = await this.resolveRoomKeyBackupVersion();
		try {
			if (previousVersion) {
				try {
					await this.doRequest("DELETE", `/_matrix/client/v3/room_keys/version/${encodeURIComponent(previousVersion)}`);
				} catch (err) {
					if (!isMatrixNotFoundError(err)) throw err;
				}
				deletedVersion = previousVersion;
			}
			await this.recoveryKeyStore.bootstrapSecretStorageWithRecoveryKey(crypto, { setupNewKeyBackup: true });
			await this.enableTrustedRoomKeyBackupIfPossible(crypto);
			const backup = await this.getRoomKeyBackupStatus();
			const createdVersion = backup.serverVersion;
			if (!createdVersion) return await fail("Matrix room key backup is still missing after reset.");
			if (backup.activeVersion !== createdVersion) return await fail("Matrix room key backup was recreated on the server but is not active on this device.");
			if (backup.decryptionKeyCached === false) return await fail("Matrix room key backup was recreated but its decryption key is not cached on this device.");
			if (backup.matchesDecryptionKey === false) return await fail("Matrix room key backup was recreated but this device does not have the matching backup decryption key.");
			if (backup.trusted === false) return await fail("Matrix room key backup was recreated but is not trusted on this device.");
			return {
				success: true,
				previousVersion,
				deletedVersion,
				createdVersion,
				resetAt: (/* @__PURE__ */ new Date()).toISOString(),
				backup
			};
		} catch (err) {
			return await fail(err instanceof Error ? err.message : String(err));
		}
	}
	async getOwnCrossSigningPublicationStatus() {
		const userId = this.client.getUserId() ?? this.selfUserId ?? null;
		if (!userId) return {
			userId: null,
			masterKeyPublished: false,
			selfSigningKeyPublished: false,
			userSigningKeyPublished: false,
			published: false
		};
		try {
			const response = await this.doRequest("POST", "/_matrix/client/v3/keys/query", void 0, { device_keys: { [userId]: [] } });
			const masterKeyPublished = Boolean(response.master_keys?.[userId]);
			const selfSigningKeyPublished = Boolean(response.self_signing_keys?.[userId]);
			const userSigningKeyPublished = Boolean(response.user_signing_keys?.[userId]);
			return {
				userId,
				masterKeyPublished,
				selfSigningKeyPublished,
				userSigningKeyPublished,
				published: masterKeyPublished && selfSigningKeyPublished && userSigningKeyPublished
			};
		} catch {
			return {
				userId,
				masterKeyPublished: false,
				selfSigningKeyPublished: false,
				userSigningKeyPublished: false,
				published: false
			};
		}
	}
	async bootstrapOwnDeviceVerification(params) {
		const pendingVerifications = async () => this.crypto ? (await this.crypto.listVerifications()).length : 0;
		if (!this.encryptionEnabled) return {
			success: false,
			error: "Matrix encryption is disabled for this client",
			verification: await this.getOwnDeviceVerificationStatus(),
			crossSigning: await this.getOwnCrossSigningPublicationStatus(),
			pendingVerifications: await pendingVerifications(),
			cryptoBootstrap: null
		};
		let bootstrapError;
		let bootstrapSummary = null;
		try {
			await this.ensureStartedForCryptoControlPlane();
			const crypto = this.client.getCrypto();
			if (!crypto) throw new Error("Matrix crypto is not available (start client with encryption enabled)");
			const rawRecoveryKey = params?.recoveryKey?.trim();
			if (rawRecoveryKey) this.recoveryKeyStore.stageEncodedRecoveryKey({
				encodedPrivateKey: rawRecoveryKey,
				keyId: await this.resolveDefaultSecretStorageKeyId(crypto)
			});
			bootstrapSummary = await this.cryptoBootstrapper.bootstrap(crypto, {
				forceResetCrossSigning: params?.forceResetCrossSigning === true,
				allowSecretStorageRecreateWithoutRecoveryKey: true,
				strict: true
			});
			await this.ensureRoomKeyBackupEnabled(crypto);
		} catch (err) {
			this.recoveryKeyStore.discardStagedRecoveryKey();
			bootstrapError = err instanceof Error ? err.message : String(err);
		}
		const verification = await this.getOwnDeviceVerificationStatus();
		const crossSigning = await this.getOwnCrossSigningPublicationStatus();
		const verificationError = verification.verified && crossSigning.published ? null : bootstrapError ?? "Matrix verification bootstrap did not produce a device verified by its owner with published cross-signing keys";
		const backupError = verificationError === null ? resolveMatrixRoomKeyBackupReadinessError(verification.backup, { requireServerBackup: true }) : null;
		const success = verificationError === null && backupError === null;
		if (success) this.recoveryKeyStore.commitStagedRecoveryKey({ keyId: await this.resolveDefaultSecretStorageKeyId(this.client.getCrypto()) });
		else this.recoveryKeyStore.discardStagedRecoveryKey();
		return {
			success,
			error: success ? void 0 : backupError ?? verificationError ?? void 0,
			verification: success ? await this.getOwnDeviceVerificationStatus() : verification,
			crossSigning,
			pendingVerifications: await pendingVerifications(),
			cryptoBootstrap: bootstrapSummary
		};
	}
	async listOwnDevices() {
		const currentDeviceId = this.client.getDeviceId()?.trim() || null;
		const devices = await this.client.getDevices();
		return (Array.isArray(devices?.devices) ? devices.devices : []).map((device) => ({
			deviceId: device.device_id,
			displayName: device.display_name?.trim() || null,
			lastSeenIp: device.last_seen_ip?.trim() || null,
			lastSeenTs: typeof device.last_seen_ts === "number" && Number.isFinite(device.last_seen_ts) ? device.last_seen_ts : null,
			current: currentDeviceId !== null && device.device_id === currentDeviceId
		}));
	}
	async deleteOwnDevices(deviceIds) {
		const uniqueDeviceIds = [...new Set(deviceIds.map((value) => value.trim()).filter(Boolean))];
		const currentDeviceId = this.client.getDeviceId()?.trim() || null;
		const protectedDeviceIds = uniqueDeviceIds.filter((deviceId) => deviceId === currentDeviceId);
		if (protectedDeviceIds.length > 0) throw new Error(`Refusing to delete the current Matrix device: ${protectedDeviceIds[0]}`);
		const deleteWithAuth = async (authData) => {
			await this.client.deleteMultipleDevices(uniqueDeviceIds, authData);
		};
		if (uniqueDeviceIds.length > 0) try {
			await deleteWithAuth();
		} catch (err) {
			const session = err && typeof err === "object" && "data" in err && err.data && typeof err.data === "object" && "session" in err.data && typeof err.data.session === "string" ? err.data.session : null;
			const userId = await this.getUserId().catch(() => this.selfUserId);
			if (!session || !userId || !this.password?.trim()) throw err;
			await deleteWithAuth({
				type: "m.login.password",
				session,
				identifier: {
					type: "m.id.user",
					user: userId
				},
				password: this.password
			});
		}
		return {
			currentDeviceId,
			deletedDeviceIds: uniqueDeviceIds,
			remainingDevices: await this.listOwnDevices()
		};
	}
	async resolveActiveRoomKeyBackupVersion(crypto) {
		if (typeof crypto.getActiveSessionBackupVersion !== "function") return null;
		return normalizeOptionalString(await crypto.getActiveSessionBackupVersion().catch(() => null));
	}
	async resolveCachedRoomKeyBackupDecryptionKey(crypto) {
		const getSessionBackupPrivateKey = crypto.getSessionBackupPrivateKey;
		if (typeof getSessionBackupPrivateKey !== "function") return null;
		const key = await getSessionBackupPrivateKey.call(crypto).catch(() => null);
		return key ? key.length > 0 : false;
	}
	async resolveRoomKeyBackupLocalState(crypto) {
		const [activeVersion, decryptionKeyCached] = await Promise.all([this.resolveActiveRoomKeyBackupVersion(crypto), this.resolveCachedRoomKeyBackupDecryptionKey(crypto)]);
		return {
			activeVersion,
			decryptionKeyCached
		};
	}
	async resolveRoomKeyBackupTrustState(crypto, fallbackVersion) {
		let serverVersion = fallbackVersion;
		let trusted = null;
		let matchesDecryptionKey = null;
		if (typeof crypto.getKeyBackupInfo === "function") {
			const info = await crypto.getKeyBackupInfo().catch(() => null);
			serverVersion = normalizeOptionalString(info?.version) ?? serverVersion;
			if (info && typeof crypto.isKeyBackupTrusted === "function") {
				const trustInfo = await crypto.isKeyBackupTrusted(info).catch(() => null);
				trusted = typeof trustInfo?.trusted === "boolean" ? trustInfo.trusted : null;
				matchesDecryptionKey = typeof trustInfo?.matchesDecryptionKey === "boolean" ? trustInfo.matchesDecryptionKey : null;
			}
		}
		return {
			serverVersion,
			trusted,
			matchesDecryptionKey
		};
	}
	async resolveDefaultSecretStorageKeyId(crypto) {
		const getSecretStorageStatus = crypto?.getSecretStorageStatus;
		if (typeof getSecretStorageStatus !== "function") return;
		return (await getSecretStorageStatus.call(crypto).catch(() => null))?.defaultKeyId;
	}
	async resolveRoomKeyBackupVersion() {
		try {
			return normalizeOptionalString((await this.doRequest("GET", "/_matrix/client/v3/room_keys/version")).version);
		} catch {
			return null;
		}
	}
	async enableTrustedRoomKeyBackupIfPossible(crypto) {
		if (typeof crypto.checkKeyBackupAndEnable !== "function") return;
		await crypto.checkKeyBackupAndEnable();
	}
	async ensureRoomKeyBackupEnabled(crypto) {
		if (await this.resolveRoomKeyBackupVersion()) return;
		LogService.info("MatrixClientLite", "No room key backup version found on server, creating one via secret storage bootstrap");
		await this.recoveryKeyStore.bootstrapSecretStorageWithRecoveryKey(crypto, { setupNewKeyBackup: true });
		const createdVersion = await this.resolveRoomKeyBackupVersion();
		if (!createdVersion) throw new Error("Matrix room key backup is still missing after bootstrap");
		LogService.info("MatrixClientLite", `Room key backup enabled (version ${createdVersion})`);
	}
	registerBridge() {
		if (this.bridgeRegistered) return;
		this.bridgeRegistered = true;
		this.client.on(ClientEvent.Event, (event) => {
			const roomId = event.getRoomId();
			if (!roomId) return;
			const raw = matrixEventToRaw(event);
			const isEncryptedEvent = raw.type === "m.room.encrypted";
			this.emitter.emit("room.event", roomId, raw);
			if (isEncryptedEvent) this.emitter.emit("room.encrypted_event", roomId, raw);
			else if (this.decryptBridge.shouldEmitUnencryptedMessage(roomId, raw.event_id)) this.emitter.emit("room.message", roomId, raw);
			const stateKey = raw.state_key ?? "";
			const selfUserId = this.client.getUserId() ?? this.selfUserId ?? "";
			const membership = raw.type === "m.room.member" ? raw.content.membership : void 0;
			if (stateKey && selfUserId && stateKey === selfUserId) {
				if (membership === "invite") this.emitter.emit("room.invite", roomId, raw);
				else if (membership === "join") this.emitter.emit("room.join", roomId, raw);
			}
			if (isEncryptedEvent) this.decryptBridge.attachEncryptedEvent(event, roomId);
		});
		this.client.on(ClientEvent.Room, (room) => {
			this.emitMembershipForRoom(room);
		});
	}
	emitMembershipForRoom(room) {
		const roomObj = room;
		const roomId = roomObj.roomId?.trim();
		if (!roomId) return;
		const membership = roomObj.getMyMembership?.() ?? roomObj.selfMembership ?? void 0;
		const selfUserId = this.client.getUserId() ?? this.selfUserId ?? "";
		if (!selfUserId) return;
		const raw = {
			event_id: `$membership-${roomId}-${Date.now()}`,
			type: "m.room.member",
			sender: selfUserId,
			state_key: selfUserId,
			content: { membership },
			origin_server_ts: Date.now(),
			unsigned: { age: 0 }
		};
		if (membership === "invite") {
			this.emitter.emit("room.invite", roomId, raw);
			return;
		}
		if (membership === "join") this.emitter.emit("room.join", roomId, raw);
	}
	emitOutstandingInviteEvents() {
		const listRooms = this.client.getRooms;
		if (typeof listRooms !== "function") return;
		const rooms = listRooms.call(this.client);
		if (!Array.isArray(rooms)) return;
		for (const room of rooms) this.emitMembershipForRoom(room);
	}
	async refreshDmCache() {
		const direct = await this.getAccountData("m.direct");
		this.dmRoomIds.clear();
		if (!direct || typeof direct !== "object") return;
		for (const value of Object.values(direct)) {
			if (!Array.isArray(value)) continue;
			for (const roomId of value) if (typeof roomId === "string" && roomId.trim()) this.dmRoomIds.add(roomId);
		}
	}
};
//#endregion
//#region extensions/matrix/src/matrix/client/config.ts
function clean(value, path) {
	return normalizeResolvedSecretInputString({
		value,
		path
	}) ?? "";
}
function resolveMatrixBaseConfigFieldPath(field) {
	return `channels.matrix.${field}`;
}
function readMatrixBaseConfigField(matrix, field) {
	return clean(matrix[field], resolveMatrixBaseConfigFieldPath(field));
}
function readMatrixAccountConfigField(cfg, accountId, account, field) {
	return clean(account[field], resolveMatrixConfigFieldPath(cfg, accountId, field));
}
function clampMatrixInitialSyncLimit(value) {
	return typeof value === "number" ? Math.max(0, Math.floor(value)) : void 0;
}
const MATRIX_HTTP_HOMESERVER_ERROR = "Matrix homeserver must use https:// unless it targets a private or loopback host";
function buildMatrixNetworkFields(allowPrivateNetwork) {
	if (!allowPrivateNetwork) return {};
	return {
		allowPrivateNetwork: true,
		ssrfPolicy: ssrfPolicyFromAllowPrivateNetwork(true)
	};
}
function resolveGlobalMatrixEnvConfig(env) {
	return {
		homeserver: clean(env.MATRIX_HOMESERVER, "MATRIX_HOMESERVER"),
		userId: clean(env.MATRIX_USER_ID, "MATRIX_USER_ID"),
		accessToken: clean(env.MATRIX_ACCESS_TOKEN, "MATRIX_ACCESS_TOKEN") || void 0,
		password: clean(env.MATRIX_PASSWORD, "MATRIX_PASSWORD") || void 0,
		deviceId: clean(env.MATRIX_DEVICE_ID, "MATRIX_DEVICE_ID") || void 0,
		deviceName: clean(env.MATRIX_DEVICE_NAME, "MATRIX_DEVICE_NAME") || void 0
	};
}
function resolveMatrixEnvAuthReadiness(accountId, env = process.env) {
	const normalizedAccountId = normalizeAccountId(accountId);
	const scoped = resolveScopedMatrixEnvConfig(normalizedAccountId, env);
	const scopedReady = hasReadyMatrixEnvAuth(scoped);
	if (normalizedAccountId !== "default") {
		const keys = getMatrixScopedEnvVarNames(normalizedAccountId);
		return {
			ready: scopedReady,
			homeserver: scoped.homeserver || void 0,
			userId: scoped.userId || void 0,
			sourceHint: `${keys.homeserver} (+ auth vars)`,
			missingMessage: `Set per-account env vars for "${normalizedAccountId}" (for example ${keys.homeserver} + ${keys.accessToken} or ${keys.userId} + ${keys.password}).`
		};
	}
	const defaultScoped = resolveScopedMatrixEnvConfig(DEFAULT_ACCOUNT_ID, env);
	const global = resolveGlobalMatrixEnvConfig(env);
	const defaultScopedReady = hasReadyMatrixEnvAuth(defaultScoped);
	const globalReady = hasReadyMatrixEnvAuth(global);
	const defaultKeys = getMatrixScopedEnvVarNames(DEFAULT_ACCOUNT_ID);
	return {
		ready: defaultScopedReady || globalReady,
		homeserver: defaultScoped.homeserver || global.homeserver || void 0,
		userId: defaultScoped.userId || global.userId || void 0,
		sourceHint: "MATRIX_* or MATRIX_DEFAULT_*",
		missingMessage: `Set Matrix env vars for the default account (for example MATRIX_HOMESERVER + MATRIX_ACCESS_TOKEN, MATRIX_USER_ID + MATRIX_PASSWORD, or ${defaultKeys.homeserver} + ${defaultKeys.accessToken}).`
	};
}
function resolveScopedMatrixEnvConfig(accountId, env = process.env) {
	const keys = getMatrixScopedEnvVarNames(accountId);
	return {
		homeserver: clean(env[keys.homeserver], keys.homeserver),
		userId: clean(env[keys.userId], keys.userId),
		accessToken: clean(env[keys.accessToken], keys.accessToken) || void 0,
		password: clean(env[keys.password], keys.password) || void 0,
		deviceId: clean(env[keys.deviceId], keys.deviceId) || void 0,
		deviceName: clean(env[keys.deviceName], keys.deviceName) || void 0
	};
}
function hasScopedMatrixEnvConfig(accountId, env) {
	const scoped = resolveScopedMatrixEnvConfig(accountId, env);
	return Boolean(scoped.homeserver || scoped.userId || scoped.accessToken || scoped.password || scoped.deviceId || scoped.deviceName);
}
function hasReadyMatrixEnvAuth(config) {
	const homeserver = clean(config.homeserver, "matrix.env.homeserver");
	const userId = clean(config.userId, "matrix.env.userId");
	const accessToken = clean(config.accessToken, "matrix.env.accessToken");
	const password = clean(config.password, "matrix.env.password");
	return Boolean(homeserver && (accessToken || userId && password));
}
function validateMatrixHomeserverUrl(homeserver, opts) {
	const trimmed = clean(homeserver, "matrix.homeserver");
	if (!trimmed) throw new Error("Matrix homeserver is required (matrix.homeserver)");
	let parsed;
	try {
		parsed = new URL(trimmed);
	} catch {
		throw new Error("Matrix homeserver must be a valid http(s) URL");
	}
	if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("Matrix homeserver must use http:// or https://");
	if (!parsed.hostname) throw new Error("Matrix homeserver must include a hostname");
	if (parsed.username || parsed.password) throw new Error("Matrix homeserver URL must not include embedded credentials");
	if (parsed.search || parsed.hash) throw new Error("Matrix homeserver URL must not include query strings or fragments");
	if (parsed.protocol === "http:" && opts?.allowPrivateNetwork !== true && !isPrivateOrLoopbackHost(parsed.hostname)) throw new Error(MATRIX_HTTP_HOMESERVER_ERROR);
	return trimmed;
}
async function resolveValidatedMatrixHomeserverUrl(homeserver, opts) {
	const normalized = validateMatrixHomeserverUrl(homeserver, opts);
	await assertHttpUrlTargetsPrivateNetwork(normalized, {
		allowPrivateNetwork: opts?.allowPrivateNetwork,
		lookupFn: opts?.lookupFn,
		errorMessage: MATRIX_HTTP_HOMESERVER_ERROR
	});
	return normalized;
}
function resolveMatrixConfigForAccount(cfg, accountId, env = process.env) {
	const matrix = resolveMatrixBaseConfig(cfg);
	const account = findMatrixAccountConfig(cfg, accountId) ?? {};
	const normalizedAccountId = normalizeAccountId(accountId);
	const scopedEnv = resolveScopedMatrixEnvConfig(normalizedAccountId, env);
	const globalEnv = resolveGlobalMatrixEnvConfig(env);
	const accountField = (field) => readMatrixAccountConfigField(cfg, normalizedAccountId, account, field);
	const resolvedStrings = resolveMatrixAccountStringValues({
		accountId: normalizedAccountId,
		account: {
			homeserver: accountField("homeserver"),
			userId: accountField("userId"),
			accessToken: accountField("accessToken"),
			password: accountField("password"),
			deviceId: accountField("deviceId"),
			deviceName: accountField("deviceName")
		},
		scopedEnv,
		channel: {
			homeserver: readMatrixBaseConfigField(matrix, "homeserver"),
			userId: readMatrixBaseConfigField(matrix, "userId"),
			accessToken: readMatrixBaseConfigField(matrix, "accessToken"),
			password: readMatrixBaseConfigField(matrix, "password"),
			deviceId: readMatrixBaseConfigField(matrix, "deviceId"),
			deviceName: readMatrixBaseConfigField(matrix, "deviceName")
		},
		globalEnv
	});
	const initialSyncLimit = clampMatrixInitialSyncLimit(account.initialSyncLimit) ?? clampMatrixInitialSyncLimit(matrix.initialSyncLimit);
	const encryption = typeof account.encryption === "boolean" ? account.encryption : matrix.encryption ?? false;
	const allowPrivateNetwork = account.allowPrivateNetwork === true || matrix.allowPrivateNetwork === true ? true : void 0;
	return {
		homeserver: resolvedStrings.homeserver,
		userId: resolvedStrings.userId,
		accessToken: resolvedStrings.accessToken || void 0,
		password: resolvedStrings.password || void 0,
		deviceId: resolvedStrings.deviceId || void 0,
		deviceName: resolvedStrings.deviceName || void 0,
		initialSyncLimit,
		encryption,
		...buildMatrixNetworkFields(allowPrivateNetwork)
	};
}
function resolveImplicitMatrixAccountId(cfg, _env = process.env) {
	if (requiresExplicitMatrixDefaultAccount(cfg)) return null;
	return normalizeAccountId(resolveMatrixDefaultOrOnlyAccountId(cfg));
}
function resolveMatrixAuthContext(params) {
	const cfg = params?.cfg ?? getMatrixRuntime().config.loadConfig();
	const env = params?.env ?? process.env;
	const explicitAccountId = normalizeOptionalAccountId(params?.accountId);
	const effectiveAccountId = explicitAccountId ?? resolveImplicitMatrixAccountId(cfg, env);
	if (!effectiveAccountId) throw new Error("Multiple Matrix accounts are configured and channels.matrix.defaultAccount is not set. Set \"channels.matrix.defaultAccount\" to the intended account or pass --account <id>.");
	if (explicitAccountId && explicitAccountId !== "default" && !listNormalizedMatrixAccountIds(cfg).includes(explicitAccountId) && !hasScopedMatrixEnvConfig(explicitAccountId, env)) throw new Error(`Matrix account "${explicitAccountId}" is not configured. Add channels.matrix.accounts.${explicitAccountId} or define scoped ${getMatrixScopedEnvVarNames(explicitAccountId).accessToken.replace(/_ACCESS_TOKEN$/, "")}_* variables.`);
	return {
		cfg,
		env,
		accountId: effectiveAccountId,
		resolved: resolveMatrixConfigForAccount(cfg, effectiveAccountId, env)
	};
}
async function resolveMatrixAuth(params) {
	const { cfg, env, accountId, resolved } = resolveMatrixAuthContext(params);
	const homeserver = await resolveValidatedMatrixHomeserverUrl(resolved.homeserver, { allowPrivateNetwork: resolved.allowPrivateNetwork });
	let credentialsWriter;
	const loadCredentialsWriter = async () => {
		credentialsWriter ??= await import("./credentials-write.runtime-C64t_vmg.js");
		return credentialsWriter;
	};
	const cached = loadMatrixCredentials(env, accountId);
	const cachedCredentials = cached && credentialsMatchConfig(cached, {
		homeserver,
		userId: resolved.userId || "",
		accessToken: resolved.accessToken
	}) ? cached : null;
	if (resolved.accessToken) {
		let userId = resolved.userId;
		const hasMatchingCachedToken = cachedCredentials?.accessToken === resolved.accessToken;
		let knownDeviceId = hasMatchingCachedToken ? cachedCredentials?.deviceId || resolved.deviceId : resolved.deviceId;
		if (!userId || !knownDeviceId) {
			ensureMatrixSdkLoggingConfigured();
			const whoami = await new MatrixClient(homeserver, resolved.accessToken, void 0, void 0, { ssrfPolicy: resolved.ssrfPolicy }).doRequest("GET", "/_matrix/client/v3/account/whoami");
			if (!userId) {
				const fetchedUserId = whoami.user_id?.trim();
				if (!fetchedUserId) throw new Error("Matrix whoami did not return user_id");
				userId = fetchedUserId;
			}
			if (!knownDeviceId) knownDeviceId = whoami.device_id?.trim() || resolved.deviceId;
		}
		if (!cachedCredentials || !hasMatchingCachedToken || cachedCredentials.userId !== userId || (cachedCredentials.deviceId || void 0) !== knownDeviceId) {
			const { saveMatrixCredentials } = await loadCredentialsWriter();
			await saveMatrixCredentials({
				homeserver,
				userId,
				accessToken: resolved.accessToken,
				deviceId: knownDeviceId
			}, env, accountId);
		} else if (hasMatchingCachedToken) {
			const { touchMatrixCredentials } = await loadCredentialsWriter();
			await touchMatrixCredentials(env, accountId);
		}
		return {
			accountId,
			homeserver,
			userId,
			accessToken: resolved.accessToken,
			password: resolved.password,
			deviceId: knownDeviceId,
			deviceName: resolved.deviceName,
			initialSyncLimit: resolved.initialSyncLimit,
			encryption: resolved.encryption,
			...buildMatrixNetworkFields(resolved.allowPrivateNetwork)
		};
	}
	if (cachedCredentials) {
		const { touchMatrixCredentials } = await loadCredentialsWriter();
		await touchMatrixCredentials(env, accountId);
		return {
			accountId,
			homeserver: cachedCredentials.homeserver,
			userId: cachedCredentials.userId,
			accessToken: cachedCredentials.accessToken,
			password: resolved.password,
			deviceId: cachedCredentials.deviceId || resolved.deviceId,
			deviceName: resolved.deviceName,
			initialSyncLimit: resolved.initialSyncLimit,
			encryption: resolved.encryption,
			...buildMatrixNetworkFields(resolved.allowPrivateNetwork)
		};
	}
	if (!resolved.userId) throw new Error("Matrix userId is required when no access token is configured (matrix.userId)");
	if (!resolved.password) throw new Error("Matrix password is required when no access token is configured (matrix.password)");
	ensureMatrixSdkLoggingConfigured();
	const login = await new MatrixClient(homeserver, "", void 0, void 0, { ssrfPolicy: resolved.ssrfPolicy }).doRequest("POST", "/_matrix/client/v3/login", void 0, {
		type: "m.login.password",
		identifier: {
			type: "m.id.user",
			user: resolved.userId
		},
		password: resolved.password,
		device_id: resolved.deviceId,
		initial_device_display_name: resolved.deviceName ?? "OpenClaw Gateway"
	});
	const accessToken = login.access_token?.trim();
	if (!accessToken) throw new Error("Matrix login did not return an access token");
	const auth = {
		accountId,
		homeserver,
		userId: login.user_id ?? resolved.userId,
		accessToken,
		password: resolved.password,
		deviceId: login.device_id ?? resolved.deviceId,
		deviceName: resolved.deviceName,
		initialSyncLimit: resolved.initialSyncLimit,
		encryption: resolved.encryption,
		...buildMatrixNetworkFields(resolved.allowPrivateNetwork)
	};
	const { saveMatrixCredentials } = await loadCredentialsWriter();
	await saveMatrixCredentials({
		homeserver: auth.homeserver,
		userId: auth.userId,
		accessToken: auth.accessToken,
		deviceId: auth.deviceId
	}, env, accountId);
	return auth;
}
const STORAGE_META_FILENAME = "storage-meta.json";
const THREAD_BINDINGS_FILENAME = "thread-bindings.json";
const LEGACY_CRYPTO_MIGRATION_FILENAME = "legacy-crypto-migration.json";
const RECOVERY_KEY_FILENAME = "recovery-key.json";
const IDB_SNAPSHOT_FILENAME = "crypto-idb-snapshot.json";
const STARTUP_VERIFICATION_FILENAME = "startup-verification.json";
function resolveLegacyStoragePaths(env = process.env) {
	const legacy = resolveMatrixLegacyFlatStoragePaths(getMatrixRuntime().state.resolveStateDir(env, os.homedir));
	return {
		storagePath: legacy.storagePath,
		cryptoPath: legacy.cryptoPath
	};
}
function assertLegacyMigrationAccountSelection(params) {
	const cfg = getMatrixRuntime().config.loadConfig();
	if (!cfg.channels?.matrix || typeof cfg.channels.matrix !== "object") return;
	if (requiresExplicitMatrixDefaultAccount(cfg)) throw new Error("Legacy Matrix client storage cannot be migrated automatically because multiple Matrix accounts are configured and channels.matrix.defaultAccount is not set.");
	const selectedAccountId = normalizeAccountId(resolveMatrixDefaultOrOnlyAccountId(cfg));
	const currentAccountId = normalizeAccountId(params.accountKey);
	if (selectedAccountId !== currentAccountId) throw new Error(`Legacy Matrix client storage targets account "${selectedAccountId}", but the current client is starting account "${currentAccountId}". Start the selected account first so flat legacy storage is not migrated into the wrong account directory.`);
}
function scoreStorageRoot(rootDir) {
	let score = 0;
	if (fs.existsSync(path.join(rootDir, "bot-storage.json"))) score += 8;
	if (fs.existsSync(path.join(rootDir, "crypto"))) score += 8;
	if (fs.existsSync(path.join(rootDir, THREAD_BINDINGS_FILENAME))) score += 4;
	if (fs.existsSync(path.join(rootDir, LEGACY_CRYPTO_MIGRATION_FILENAME))) score += 3;
	if (fs.existsSync(path.join(rootDir, RECOVERY_KEY_FILENAME))) score += 2;
	if (fs.existsSync(path.join(rootDir, IDB_SNAPSHOT_FILENAME))) score += 2;
	if (fs.existsSync(path.join(rootDir, STORAGE_META_FILENAME))) score += 1;
	return score;
}
function resolveStorageRootMtimeMs(rootDir) {
	try {
		return fs.statSync(rootDir).mtimeMs;
	} catch {
		return 0;
	}
}
function readStoredRootMetadata(rootDir) {
	const metadata = {};
	try {
		const parsed = JSON.parse(fs.readFileSync(path.join(rootDir, STORAGE_META_FILENAME), "utf8"));
		if (typeof parsed.homeserver === "string" && parsed.homeserver.trim()) metadata.homeserver = parsed.homeserver.trim();
		if (typeof parsed.userId === "string" && parsed.userId.trim()) metadata.userId = parsed.userId.trim();
		if (typeof parsed.accountId === "string" && parsed.accountId.trim()) metadata.accountId = parsed.accountId.trim();
		if (typeof parsed.accessTokenHash === "string" && parsed.accessTokenHash.trim()) metadata.accessTokenHash = parsed.accessTokenHash.trim();
		if (typeof parsed.deviceId === "string" && parsed.deviceId.trim()) metadata.deviceId = parsed.deviceId.trim();
	} catch {}
	try {
		const parsed = JSON.parse(fs.readFileSync(path.join(rootDir, STARTUP_VERIFICATION_FILENAME), "utf8"));
		if (!metadata.deviceId && typeof parsed.deviceId === "string" && parsed.deviceId.trim()) metadata.deviceId = parsed.deviceId.trim();
	} catch {}
	return metadata;
}
function isCompatibleStorageRoot(params) {
	const metadata = readStoredRootMetadata(params.candidateRootDir);
	if (metadata.homeserver && metadata.homeserver !== params.homeserver) return false;
	if (metadata.userId && metadata.userId !== params.userId) return false;
	if (metadata.accountId && normalizeAccountId(metadata.accountId) !== normalizeAccountId(params.accountKey)) return false;
	if (params.deviceId && metadata.deviceId && metadata.deviceId.trim() && metadata.deviceId.trim() !== params.deviceId.trim()) return false;
	if (params.requireExplicitDeviceMatch && params.deviceId && (!metadata.deviceId || metadata.deviceId.trim() !== params.deviceId.trim())) return false;
	return true;
}
function resolvePreferredMatrixStorageRoot(params) {
	const parentDir = path.dirname(params.canonicalRootDir);
	const bestCurrentScore = scoreStorageRoot(params.canonicalRootDir);
	let best = {
		rootDir: params.canonicalRootDir,
		tokenHash: params.canonicalTokenHash,
		score: bestCurrentScore,
		mtimeMs: resolveStorageRootMtimeMs(params.canonicalRootDir)
	};
	let siblingEntries = [];
	try {
		siblingEntries = fs.readdirSync(parentDir, { withFileTypes: true });
	} catch {
		return {
			rootDir: best.rootDir,
			tokenHash: best.tokenHash
		};
	}
	for (const entry of siblingEntries) {
		if (!entry.isDirectory()) continue;
		if (entry.name === params.canonicalTokenHash) continue;
		const candidateRootDir = path.join(parentDir, entry.name);
		if (!isCompatibleStorageRoot({
			candidateRootDir,
			homeserver: params.homeserver,
			userId: params.userId,
			accountKey: params.accountKey,
			deviceId: params.deviceId,
			requireExplicitDeviceMatch: Boolean(params.deviceId)
		})) continue;
		const candidateScore = scoreStorageRoot(candidateRootDir);
		if (candidateScore <= 0) continue;
		const candidateMtimeMs = resolveStorageRootMtimeMs(candidateRootDir);
		if (candidateScore > best.score || best.rootDir !== params.canonicalRootDir && candidateScore === best.score && candidateMtimeMs > best.mtimeMs) best = {
			rootDir: candidateRootDir,
			tokenHash: entry.name,
			score: candidateScore,
			mtimeMs: candidateMtimeMs
		};
	}
	return {
		rootDir: best.rootDir,
		tokenHash: best.tokenHash
	};
}
function resolveMatrixStoragePaths(params) {
	const env = params.env ?? process.env;
	const canonical = resolveMatrixAccountStorageRoot({
		stateDir: params.stateDir ?? getMatrixRuntime().state.resolveStateDir(env, os.homedir),
		homeserver: params.homeserver,
		userId: params.userId,
		accessToken: params.accessToken,
		accountId: params.accountId
	});
	const { rootDir, tokenHash } = resolvePreferredMatrixStorageRoot({
		canonicalRootDir: canonical.rootDir,
		canonicalTokenHash: canonical.tokenHash,
		homeserver: params.homeserver,
		userId: params.userId,
		accountKey: canonical.accountKey,
		deviceId: params.deviceId
	});
	return {
		rootDir,
		storagePath: path.join(rootDir, "bot-storage.json"),
		cryptoPath: path.join(rootDir, "crypto"),
		metaPath: path.join(rootDir, STORAGE_META_FILENAME),
		recoveryKeyPath: path.join(rootDir, "recovery-key.json"),
		idbSnapshotPath: path.join(rootDir, IDB_SNAPSHOT_FILENAME),
		accountKey: canonical.accountKey,
		tokenHash
	};
}
async function maybeMigrateLegacyStorage(params) {
	const legacy = resolveLegacyStoragePaths(params.env);
	const hasLegacyStorage = fs.existsSync(legacy.storagePath);
	const hasLegacyCrypto = fs.existsSync(legacy.cryptoPath);
	if (!hasLegacyStorage && !hasLegacyCrypto) return;
	const hasTargetStorage = fs.existsSync(params.storagePaths.storagePath);
	const hasTargetCrypto = fs.existsSync(params.storagePaths.cryptoPath);
	const shouldMigrateStorage = hasLegacyStorage && !hasTargetStorage;
	const shouldMigrateCrypto = hasLegacyCrypto && !hasTargetCrypto;
	if (!shouldMigrateStorage && !shouldMigrateCrypto) return;
	assertLegacyMigrationAccountSelection({ accountKey: params.storagePaths.accountKey });
	const logger = getMatrixRuntime().logging.getChildLogger({ module: "matrix-storage" });
	await maybeCreateMatrixMigrationSnapshot({
		trigger: "matrix-client-fallback",
		env: params.env,
		log: logger
	});
	fs.mkdirSync(params.storagePaths.rootDir, { recursive: true });
	const moved = [];
	const skippedExistingTargets = [];
	try {
		if (shouldMigrateStorage) moveLegacyStoragePathOrThrow({
			sourcePath: legacy.storagePath,
			targetPath: params.storagePaths.storagePath,
			label: "sync store",
			moved
		});
		else if (hasLegacyStorage) skippedExistingTargets.push(`- sync store remains at ${legacy.storagePath} because ${params.storagePaths.storagePath} already exists`);
		if (shouldMigrateCrypto) moveLegacyStoragePathOrThrow({
			sourcePath: legacy.cryptoPath,
			targetPath: params.storagePaths.cryptoPath,
			label: "crypto store",
			moved
		});
		else if (hasLegacyCrypto) skippedExistingTargets.push(`- crypto store remains at ${legacy.cryptoPath} because ${params.storagePaths.cryptoPath} already exists`);
	} catch (err) {
		const rollbackError = rollbackLegacyMoves(moved);
		throw new Error(rollbackError ? `Failed migrating legacy Matrix client storage: ${String(err)}. Rollback also failed: ${rollbackError}` : `Failed migrating legacy Matrix client storage: ${String(err)}`);
	}
	if (moved.length > 0) logger.info(`matrix: migrated legacy client storage into ${params.storagePaths.rootDir}\n${moved.map((entry) => `- ${entry.label}: ${entry.sourcePath} -> ${entry.targetPath}`).join("\n")}`);
	if (skippedExistingTargets.length > 0) logger.warn?.(`matrix: legacy client storage still exists in the flat path because some account-scoped targets already existed.\n${skippedExistingTargets.join("\n")}`);
}
function moveLegacyStoragePathOrThrow(params) {
	if (!fs.existsSync(params.sourcePath)) return;
	if (fs.existsSync(params.targetPath)) throw new Error(`legacy Matrix ${params.label} target already exists (${params.targetPath}); refusing to overwrite it automatically`);
	fs.renameSync(params.sourcePath, params.targetPath);
	params.moved.push({
		sourcePath: params.sourcePath,
		targetPath: params.targetPath,
		label: params.label
	});
}
function rollbackLegacyMoves(moved) {
	for (const entry of moved.toReversed()) try {
		if (!fs.existsSync(entry.targetPath) || fs.existsSync(entry.sourcePath)) continue;
		fs.renameSync(entry.targetPath, entry.sourcePath);
	} catch (err) {
		return `${entry.label} (${entry.targetPath} -> ${entry.sourcePath}): ${String(err)}`;
	}
	return null;
}
function writeStorageMeta(params) {
	try {
		const payload = {
			homeserver: params.homeserver,
			userId: params.userId,
			accountId: params.accountId ?? "default",
			accessTokenHash: params.storagePaths.tokenHash,
			deviceId: params.deviceId ?? null,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		fs.mkdirSync(params.storagePaths.rootDir, { recursive: true });
		fs.writeFileSync(params.storagePaths.metaPath, JSON.stringify(payload, null, 2), "utf-8");
	} catch {}
}
//#endregion
//#region extensions/matrix/src/matrix/client/create-client.ts
async function createMatrixClient(params) {
	ensureMatrixSdkLoggingConfigured();
	const env = process.env;
	const homeserver = await resolveValidatedMatrixHomeserverUrl(params.homeserver, { allowPrivateNetwork: params.allowPrivateNetwork });
	const userId = params.userId?.trim() || "unknown";
	const matrixClientUserId = params.userId?.trim() || void 0;
	const storagePaths = resolveMatrixStoragePaths({
		homeserver,
		userId,
		accessToken: params.accessToken,
		accountId: params.accountId,
		deviceId: params.deviceId,
		env
	});
	await maybeMigrateLegacyStorage({
		storagePaths,
		env
	});
	fs.mkdirSync(storagePaths.rootDir, { recursive: true });
	writeStorageMeta({
		storagePaths,
		homeserver,
		userId,
		accountId: params.accountId,
		deviceId: params.deviceId
	});
	const cryptoDatabasePrefix = `openclaw-matrix-${storagePaths.accountKey}-${storagePaths.tokenHash}`;
	return new MatrixClient(homeserver, params.accessToken, void 0, void 0, {
		userId: matrixClientUserId,
		password: params.password,
		deviceId: params.deviceId,
		encryption: params.encryption,
		localTimeoutMs: params.localTimeoutMs,
		initialSyncLimit: params.initialSyncLimit,
		storagePath: storagePaths.storagePath,
		recoveryKeyPath: storagePaths.recoveryKeyPath,
		idbSnapshotPath: storagePaths.idbSnapshotPath,
		cryptoDatabasePrefix,
		autoBootstrapCrypto: params.autoBootstrapCrypto,
		ssrfPolicy: params.ssrfPolicy
	});
}
//#endregion
//#region extensions/matrix/src/matrix/client/shared.ts
const sharedClientStates = /* @__PURE__ */ new Map();
const sharedClientPromises = /* @__PURE__ */ new Map();
function buildSharedClientKey(auth) {
	return [
		auth.homeserver,
		auth.userId,
		auth.accessToken,
		auth.encryption ? "e2ee" : "plain",
		auth.allowPrivateNetwork ? "private-net" : "strict-net",
		auth.accountId
	].join("|");
}
async function createSharedMatrixClient(params) {
	return {
		client: await createMatrixClient({
			homeserver: params.auth.homeserver,
			userId: params.auth.userId,
			accessToken: params.auth.accessToken,
			password: params.auth.password,
			deviceId: params.auth.deviceId,
			encryption: params.auth.encryption,
			localTimeoutMs: params.timeoutMs,
			initialSyncLimit: params.auth.initialSyncLimit,
			accountId: params.auth.accountId,
			allowPrivateNetwork: params.auth.allowPrivateNetwork,
			ssrfPolicy: params.auth.ssrfPolicy
		}),
		key: buildSharedClientKey(params.auth),
		started: false,
		cryptoReady: false,
		startPromise: null,
		leases: 0
	};
}
function findSharedClientStateByInstance(client) {
	for (const state of sharedClientStates.values()) if (state.client === client) return state;
	return null;
}
function deleteSharedClientState(state) {
	sharedClientStates.delete(state.key);
	sharedClientPromises.delete(state.key);
}
async function ensureSharedClientStarted(params) {
	if (params.state.started) return;
	if (params.state.startPromise) {
		await params.state.startPromise;
		return;
	}
	params.state.startPromise = (async () => {
		const client = params.state.client;
		if (params.encryption && !params.state.cryptoReady) try {
			const joinedRooms = await client.getJoinedRooms();
			if (client.crypto) {
				await client.crypto.prepare(joinedRooms);
				params.state.cryptoReady = true;
			}
		} catch (err) {
			LogService.warn("MatrixClientLite", "Failed to prepare crypto:", err);
		}
		await client.start();
		params.state.started = true;
	})();
	try {
		await params.state.startPromise;
	} finally {
		params.state.startPromise = null;
	}
}
async function resolveSharedMatrixClientState(params = {}) {
	const requestedAccountId = normalizeOptionalAccountId(params.accountId);
	if (params.auth && requestedAccountId && requestedAccountId !== params.auth.accountId) throw new Error(`Matrix shared client account mismatch: requested ${requestedAccountId}, auth resolved ${params.auth.accountId}`);
	const authContext = params.auth ? null : resolveMatrixAuthContext({
		cfg: params.cfg,
		env: params.env,
		accountId: params.accountId
	});
	const auth = params.auth ?? await resolveMatrixAuth({
		cfg: authContext?.cfg ?? params.cfg,
		env: authContext?.env ?? params.env,
		accountId: authContext?.accountId
	});
	const key = buildSharedClientKey(auth);
	const shouldStart = params.startClient !== false;
	const existingState = sharedClientStates.get(key);
	if (existingState) {
		if (shouldStart) await ensureSharedClientStarted({
			state: existingState,
			timeoutMs: params.timeoutMs,
			initialSyncLimit: auth.initialSyncLimit,
			encryption: auth.encryption
		});
		return existingState;
	}
	const existingPromise = sharedClientPromises.get(key);
	if (existingPromise) {
		const pending = await existingPromise;
		if (shouldStart) await ensureSharedClientStarted({
			state: pending,
			timeoutMs: params.timeoutMs,
			initialSyncLimit: auth.initialSyncLimit,
			encryption: auth.encryption
		});
		return pending;
	}
	const creationPromise = createSharedMatrixClient({
		auth,
		timeoutMs: params.timeoutMs
	});
	sharedClientPromises.set(key, creationPromise);
	try {
		const created = await creationPromise;
		sharedClientStates.set(key, created);
		if (shouldStart) await ensureSharedClientStarted({
			state: created,
			timeoutMs: params.timeoutMs,
			initialSyncLimit: auth.initialSyncLimit,
			encryption: auth.encryption
		});
		return created;
	} finally {
		sharedClientPromises.delete(key);
	}
}
async function resolveSharedMatrixClient(params = {}) {
	return (await resolveSharedMatrixClientState(params)).client;
}
async function acquireSharedMatrixClient(params = {}) {
	const state = await resolveSharedMatrixClientState(params);
	state.leases += 1;
	return state.client;
}
async function releaseSharedClientInstance(client, mode = "stop") {
	const state = findSharedClientStateByInstance(client);
	if (!state) return false;
	state.leases = Math.max(0, state.leases - 1);
	if (state.leases > 0) return false;
	deleteSharedClientState(state);
	if (mode === "persist") await client.stopAndPersist();
	else client.stop();
	return true;
}
//#endregion
//#region extensions/matrix/src/matrix/accounts.ts
function resolveMatrixAccountUserId(params) {
	const env = params.env ?? process.env;
	const resolved = resolveMatrixConfigForAccount(params.cfg, params.accountId, env);
	const configuredUserId = resolved.userId.trim();
	if (configuredUserId) return configuredUserId;
	const stored = loadMatrixCredentials(env, params.accountId);
	if (!stored) return null;
	if (resolved.homeserver && stored.homeserver !== resolved.homeserver) return null;
	if (resolved.accessToken && stored.accessToken !== resolved.accessToken) return null;
	return stored.userId.trim() || null;
}
function listMatrixAccountIds(cfg) {
	const ids = resolveConfiguredMatrixAccountIds(cfg, process.env);
	return ids.length > 0 ? ids : [DEFAULT_ACCOUNT_ID];
}
function resolveDefaultMatrixAccountId(cfg) {
	return normalizeAccountId(resolveMatrixDefaultOrOnlyAccountId(cfg));
}
function resolveConfiguredMatrixBotUserIds(params) {
	const env = params.env ?? process.env;
	const currentAccountId = normalizeAccountId(params.accountId);
	const accountIds = new Set(resolveConfiguredMatrixAccountIds(params.cfg, env));
	if (resolveMatrixAccount({
		cfg: params.cfg,
		accountId: "default"
	}).configured) accountIds.add(DEFAULT_ACCOUNT_ID);
	const ids = /* @__PURE__ */ new Set();
	for (const accountId of accountIds) {
		if (normalizeAccountId(accountId) === currentAccountId) continue;
		if (!resolveMatrixAccount({
			cfg: params.cfg,
			accountId
		}).configured) continue;
		const userId = resolveMatrixAccountUserId({
			cfg: params.cfg,
			accountId,
			env
		});
		if (userId) ids.add(userId);
	}
	return ids;
}
function resolveMatrixAccount(params) {
	const accountId = normalizeAccountId(params.accountId);
	const matrixBase = resolveMatrixBaseConfig(params.cfg);
	const base = resolveMatrixAccountConfig({
		cfg: params.cfg,
		accountId
	});
	const enabled = base.enabled !== false && matrixBase.enabled !== false;
	const resolved = resolveMatrixConfigForAccount(params.cfg, accountId, process.env);
	const hasHomeserver = Boolean(resolved.homeserver);
	const hasUserId = Boolean(resolved.userId);
	const hasAccessToken = Boolean(resolved.accessToken);
	const hasPassword = Boolean(resolved.password);
	const hasPasswordAuth = hasUserId && (hasPassword || hasConfiguredSecretInput(base.password));
	const stored = loadMatrixCredentials(process.env, accountId);
	const hasStored = stored && resolved.homeserver ? credentialsMatchConfig(stored, {
		homeserver: resolved.homeserver,
		userId: resolved.userId || ""
	}) : false;
	const configured = hasHomeserver && (hasAccessToken || hasPasswordAuth || Boolean(hasStored));
	return {
		accountId,
		enabled,
		name: base.name?.trim() || void 0,
		configured,
		homeserver: resolved.homeserver || void 0,
		userId: resolved.userId || void 0,
		config: base
	};
}
function resolveMatrixAccountConfig(params) {
	const accountId = normalizeAccountId(params.accountId);
	return resolveMergedAccountConfig({
		channelConfig: resolveMatrixBaseConfig(params.cfg),
		accounts: params.cfg.channels?.matrix?.accounts,
		accountId,
		normalizeAccountId,
		nestedObjectKeys: ["dm", "actions"]
	});
}
//#endregion
//#region extensions/matrix/src/matrix/target-ids.ts
const MATRIX_PREFIX = "matrix:";
const ROOM_PREFIX = "room:";
const CHANNEL_PREFIX = "channel:";
const USER_PREFIX = "user:";
function stripKnownPrefixes(raw, prefixes) {
	let normalized = raw.trim();
	while (normalized) {
		const lowered = normalized.toLowerCase();
		const matched = prefixes.find((prefix) => lowered.startsWith(prefix));
		if (!matched) return normalized;
		normalized = normalized.slice(matched.length).trim();
	}
	return normalized;
}
function resolveMatrixTargetIdentity(raw) {
	const normalized = stripKnownPrefixes(raw, [MATRIX_PREFIX]);
	if (!normalized) return null;
	const lowered = normalized.toLowerCase();
	if (lowered.startsWith(USER_PREFIX)) {
		const id = normalized.slice(5).trim();
		return id ? {
			kind: "user",
			id
		} : null;
	}
	if (lowered.startsWith(ROOM_PREFIX)) {
		const id = normalized.slice(5).trim();
		return id ? {
			kind: "room",
			id
		} : null;
	}
	if (lowered.startsWith(CHANNEL_PREFIX)) {
		const id = normalized.slice(8).trim();
		return id ? {
			kind: "room",
			id
		} : null;
	}
	if (isMatrixQualifiedUserId(normalized)) return {
		kind: "user",
		id: normalized
	};
	return {
		kind: "room",
		id: normalized
	};
}
function isMatrixQualifiedUserId(raw) {
	const trimmed = raw.trim();
	return trimmed.startsWith("@") && trimmed.includes(":");
}
function normalizeMatrixResolvableTarget(raw) {
	return stripKnownPrefixes(raw, [
		MATRIX_PREFIX,
		ROOM_PREFIX,
		CHANNEL_PREFIX
	]);
}
function normalizeMatrixMessagingTarget(raw) {
	return stripKnownPrefixes(raw, [
		MATRIX_PREFIX,
		ROOM_PREFIX,
		CHANNEL_PREFIX,
		USER_PREFIX
	]) || void 0;
}
function resolveMatrixDirectUserId(params) {
	if (params.chatType !== "direct") return;
	if (!normalizeMatrixResolvableTarget(params.to ?? "").startsWith("!")) return;
	const userId = stripKnownPrefixes(params.from ?? "", [MATRIX_PREFIX, USER_PREFIX]);
	return isMatrixQualifiedUserId(userId) ? userId : void 0;
}
//#endregion
//#region extensions/matrix/src/matrix/active-client.ts
const activeClients = /* @__PURE__ */ new Map();
function resolveAccountKey(accountId) {
	return normalizeAccountId(accountId) || "default";
}
function setActiveMatrixClient(client, accountId) {
	const key = resolveAccountKey(accountId);
	if (!client) {
		activeClients.delete(key);
		return;
	}
	activeClients.set(key, client);
}
function getActiveMatrixClient(accountId) {
	const key = resolveAccountKey(accountId);
	return activeClients.get(key) ?? null;
}
//#endregion
//#region extensions/matrix/src/matrix/client-bootstrap.ts
async function ensureResolvedClientReadiness(params) {
	if (params.readiness === "started") {
		await params.client.start();
		return;
	}
	if (params.readiness === "prepared" || !params.readiness && params.preparedByDefault) await params.client.prepareForOneOff();
}
function ensureMatrixNodeRuntime() {
	if (isBunRuntime()) throw new Error("Matrix support requires Node (bun runtime not supported)");
}
async function resolveRuntimeMatrixClient(opts) {
	ensureMatrixNodeRuntime();
	if (opts.client) {
		await opts.onResolved?.(opts.client, { preparedByDefault: false });
		return {
			client: opts.client,
			stopOnDone: false
		};
	}
	const cfg = opts.cfg ?? getMatrixRuntime().config.loadConfig();
	const authContext = resolveMatrixAuthContext({
		cfg,
		accountId: opts.accountId
	});
	const active = getActiveMatrixClient(authContext.accountId);
	if (active) {
		await opts.onResolved?.(active, { preparedByDefault: false });
		return {
			client: active,
			stopOnDone: false
		};
	}
	const client = await acquireSharedMatrixClient({
		cfg,
		timeoutMs: opts.timeoutMs,
		accountId: authContext.accountId,
		startClient: false
	});
	try {
		await opts.onResolved?.(client, { preparedByDefault: true });
	} catch (err) {
		await releaseSharedClientInstance(client, "stop");
		throw err;
	}
	return {
		client,
		stopOnDone: true,
		cleanup: async (mode) => {
			await releaseSharedClientInstance(client, mode);
		}
	};
}
async function resolveRuntimeMatrixClientWithReadiness(opts) {
	return await resolveRuntimeMatrixClient({
		client: opts.client,
		cfg: opts.cfg,
		timeoutMs: opts.timeoutMs,
		accountId: opts.accountId,
		onResolved: async (client, context) => {
			await ensureResolvedClientReadiness({
				client,
				readiness: opts.readiness,
				preparedByDefault: context.preparedByDefault
			});
		}
	});
}
async function stopResolvedRuntimeMatrixClient(resolved, mode = "stop") {
	if (!resolved.stopOnDone) return;
	if (resolved.cleanup) {
		await resolved.cleanup(mode);
		return;
	}
	if (mode === "persist") {
		await resolved.client.stopAndPersist();
		return;
	}
	resolved.client.stop();
}
async function withResolvedRuntimeMatrixClient(opts, run, stopMode = "stop") {
	const resolved = await resolveRuntimeMatrixClientWithReadiness(opts);
	try {
		return await run(resolved.client);
	} finally {
		await stopResolvedRuntimeMatrixClient(resolved, stopMode);
	}
}
//#endregion
//#region extensions/matrix/src/matrix/poll-types.ts
/**
* Matrix Poll Types (MSC3381)
*
* Defines types for Matrix poll events:
* - m.poll.start - Creates a new poll
* - m.poll.response - Records a vote
* - m.poll.end - Closes a poll
*/
const M_POLL_START = "m.poll.start";
const M_POLL_RESPONSE = "m.poll.response";
const M_POLL_END = "m.poll.end";
const ORG_POLL_START = "org.matrix.msc3381.poll.start";
const ORG_POLL_RESPONSE = "org.matrix.msc3381.poll.response";
const ORG_POLL_END = "org.matrix.msc3381.poll.end";
const POLL_EVENT_TYPES = [
	M_POLL_START,
	M_POLL_RESPONSE,
	M_POLL_END,
	ORG_POLL_START,
	ORG_POLL_RESPONSE,
	ORG_POLL_END
];
const POLL_START_TYPES = [M_POLL_START, ORG_POLL_START];
const POLL_RESPONSE_TYPES = [M_POLL_RESPONSE, ORG_POLL_RESPONSE];
const POLL_END_TYPES = [M_POLL_END, ORG_POLL_END];
function isPollStartType(eventType) {
	return POLL_START_TYPES.includes(eventType);
}
function isPollResponseType(eventType) {
	return POLL_RESPONSE_TYPES.includes(eventType);
}
function isPollEndType(eventType) {
	return POLL_END_TYPES.includes(eventType);
}
function isPollEventType(eventType) {
	return POLL_EVENT_TYPES.includes(eventType);
}
function getTextContent(text) {
	if (!text) return "";
	return text["m.text"] ?? text["org.matrix.msc1767.text"] ?? text.body ?? "";
}
function parsePollStart(content) {
	const poll = content["m.poll.start"] ?? content["org.matrix.msc3381.poll.start"] ?? content["m.poll"];
	if (!poll) return null;
	const question = getTextContent(poll.question).trim();
	if (!question) return null;
	const answers = poll.answers.map((answer) => ({
		id: answer.id,
		text: getTextContent(answer).trim()
	})).filter((answer) => answer.id.trim().length > 0 && answer.text.length > 0);
	if (answers.length === 0) return null;
	const maxSelectionsRaw = poll.max_selections;
	const maxSelections = typeof maxSelectionsRaw === "number" && Number.isFinite(maxSelectionsRaw) ? Math.floor(maxSelectionsRaw) : 1;
	return {
		question,
		answers,
		kind: poll.kind ?? "m.poll.disclosed",
		maxSelections: Math.min(Math.max(maxSelections, 1), answers.length)
	};
}
function parsePollStartContent(content) {
	const parsed = parsePollStart(content);
	if (!parsed) return null;
	return {
		eventId: "",
		roomId: "",
		sender: "",
		senderName: "",
		question: parsed.question,
		answers: parsed.answers.map((answer) => answer.text),
		kind: parsed.kind,
		maxSelections: parsed.maxSelections
	};
}
function formatPollAsText(summary) {
	return [
		"[Poll]",
		summary.question,
		"",
		...summary.answers.map((answer, idx) => `${idx + 1}. ${answer}`)
	].join("\n");
}
function resolvePollReferenceEventId(content) {
	if (!content || typeof content !== "object") return null;
	const relates = content["m.relates_to"];
	if (!relates || typeof relates.event_id !== "string") return null;
	const eventId = relates.event_id.trim();
	return eventId.length > 0 ? eventId : null;
}
function parsePollResponseAnswerIds(content) {
	if (!content || typeof content !== "object") return null;
	const response = content["m.poll.response"] ?? content["org.matrix.msc3381.poll.response"];
	if (!response || !Array.isArray(response.answers)) return null;
	return response.answers.filter((answer) => typeof answer === "string");
}
function buildPollResultsSummary(params) {
	const parsed = parsePollStart(params.content);
	if (!parsed) return null;
	let pollClosedAt = Number.POSITIVE_INFINITY;
	for (const event of params.relationEvents) {
		if (event.unsigned?.redacted_because) continue;
		if (!isPollEndType(typeof event.type === "string" ? event.type : "")) continue;
		if (event.sender !== params.sender) continue;
		const ts = typeof event.origin_server_ts === "number" && Number.isFinite(event.origin_server_ts) ? event.origin_server_ts : Number.POSITIVE_INFINITY;
		if (ts < pollClosedAt) pollClosedAt = ts;
	}
	const answerIds = new Set(parsed.answers.map((answer) => answer.id));
	const latestVoteBySender = /* @__PURE__ */ new Map();
	const orderedRelationEvents = [...params.relationEvents].sort((left, right) => {
		const leftTs = typeof left.origin_server_ts === "number" && Number.isFinite(left.origin_server_ts) ? left.origin_server_ts : Number.POSITIVE_INFINITY;
		const rightTs = typeof right.origin_server_ts === "number" && Number.isFinite(right.origin_server_ts) ? right.origin_server_ts : Number.POSITIVE_INFINITY;
		if (leftTs !== rightTs) return leftTs - rightTs;
		return (left.event_id ?? "").localeCompare(right.event_id ?? "");
	});
	for (const event of orderedRelationEvents) {
		if (event.unsigned?.redacted_because) continue;
		if (!isPollResponseType(typeof event.type === "string" ? event.type : "")) continue;
		const senderId = typeof event.sender === "string" ? event.sender.trim() : "";
		if (!senderId) continue;
		const eventTs = typeof event.origin_server_ts === "number" && Number.isFinite(event.origin_server_ts) ? event.origin_server_ts : Number.POSITIVE_INFINITY;
		if (eventTs > pollClosedAt) continue;
		const rawAnswers = parsePollResponseAnswerIds(event.content) ?? [];
		const normalizedAnswers = Array.from(new Set(rawAnswers.map((answerId) => answerId.trim()).filter((answerId) => answerIds.has(answerId)).slice(0, parsed.maxSelections)));
		latestVoteBySender.set(senderId, {
			ts: eventTs,
			eventId: typeof event.event_id === "string" ? event.event_id : "",
			answerIds: normalizedAnswers
		});
	}
	const voteCounts = new Map(parsed.answers.map((answer) => [answer.id, 0]));
	let totalVotes = 0;
	for (const latestVote of latestVoteBySender.values()) {
		if (latestVote.answerIds.length === 0) continue;
		totalVotes += 1;
		for (const answerId of latestVote.answerIds) voteCounts.set(answerId, (voteCounts.get(answerId) ?? 0) + 1);
	}
	return {
		eventId: params.pollEventId,
		roomId: params.roomId,
		sender: params.sender,
		senderName: params.senderName,
		question: parsed.question,
		answers: parsed.answers.map((answer) => answer.text),
		kind: parsed.kind,
		maxSelections: parsed.maxSelections,
		entries: parsed.answers.map((answer) => ({
			id: answer.id,
			text: answer.text,
			votes: voteCounts.get(answer.id) ?? 0
		})),
		totalVotes,
		closed: Number.isFinite(pollClosedAt)
	};
}
function formatPollResultsAsText(summary) {
	const lines = [
		summary.closed ? "[Poll closed]" : "[Poll]",
		summary.question,
		""
	];
	const revealResults = summary.kind === "m.poll.disclosed" || summary.closed;
	for (const [index, entry] of summary.entries.entries()) {
		if (!revealResults) {
			lines.push(`${index + 1}. ${entry.text}`);
			continue;
		}
		lines.push(`${index + 1}. ${entry.text} (${entry.votes} vote${entry.votes === 1 ? "" : "s"})`);
	}
	lines.push("");
	if (!revealResults) lines.push("Responses are hidden until the poll closes.");
	else lines.push(`Total voters: ${summary.totalVotes}`);
	return lines.join("\n");
}
function buildTextContent$1(body) {
	return {
		"m.text": body,
		"org.matrix.msc1767.text": body
	};
}
function buildPollFallbackText(question, answers) {
	if (answers.length === 0) return question;
	return `${question}\n${answers.map((answer, idx) => `${idx + 1}. ${answer}`).join("\n")}`;
}
function buildPollStartContent(poll) {
	const normalized = normalizePollInput(poll);
	const answers = normalized.options.map((option, idx) => ({
		id: `answer${idx + 1}`,
		...buildTextContent$1(option)
	}));
	const isMultiple = normalized.maxSelections > 1;
	const fallbackText = buildPollFallbackText(normalized.question, answers.map((answer) => getTextContent(answer)));
	return {
		[M_POLL_START]: {
			question: buildTextContent$1(normalized.question),
			kind: isMultiple ? "m.poll.undisclosed" : "m.poll.disclosed",
			max_selections: normalized.maxSelections,
			answers
		},
		"m.text": fallbackText,
		"org.matrix.msc1767.text": fallbackText
	};
}
function buildPollResponseContent(pollEventId, answerIds) {
	return {
		[M_POLL_RESPONSE]: { answers: answerIds },
		[ORG_POLL_RESPONSE]: { answers: answerIds },
		"m.relates_to": {
			rel_type: "m.reference",
			event_id: pollEventId
		}
	};
}
//#endregion
//#region extensions/matrix/src/matrix/reaction-common.ts
const MATRIX_ANNOTATION_RELATION_TYPE = "m.annotation";
const MATRIX_REACTION_EVENT_TYPE = "m.reaction";
function normalizeMatrixReactionMessageId(messageId) {
	const normalized = messageId.trim();
	if (!normalized) throw new Error("Matrix reaction requires a messageId");
	return normalized;
}
function normalizeMatrixReactionEmoji(emoji) {
	const normalized = emoji.trim();
	if (!normalized) throw new Error("Matrix reaction requires an emoji");
	return normalized;
}
function buildMatrixReactionContent(messageId, emoji) {
	return { "m.relates_to": {
		rel_type: MATRIX_ANNOTATION_RELATION_TYPE,
		event_id: normalizeMatrixReactionMessageId(messageId),
		key: normalizeMatrixReactionEmoji(emoji)
	} };
}
function buildMatrixReactionRelationsPath(roomId, messageId) {
	return `/_matrix/client/v1/rooms/${encodeURIComponent(roomId)}/relations/${encodeURIComponent(normalizeMatrixReactionMessageId(messageId))}/${MATRIX_ANNOTATION_RELATION_TYPE}/${MATRIX_REACTION_EVENT_TYPE}`;
}
function extractMatrixReactionAnnotation(content) {
	if (!content || typeof content !== "object") return;
	const relatesTo = content["m.relates_to"];
	if (!relatesTo || typeof relatesTo !== "object") return;
	if (typeof relatesTo.rel_type === "string" && relatesTo.rel_type !== "m.annotation") return;
	const key = typeof relatesTo.key === "string" ? relatesTo.key.trim() : "";
	if (!key) return;
	return {
		key,
		eventId: (typeof relatesTo.event_id === "string" ? relatesTo.event_id.trim() : "") || void 0
	};
}
function extractMatrixReactionKey(content) {
	return extractMatrixReactionAnnotation(content)?.key;
}
function summarizeMatrixReactionEvents(events) {
	const summaries = /* @__PURE__ */ new Map();
	for (const event of events) {
		const key = extractMatrixReactionKey(event.content);
		if (!key) continue;
		const sender = event.sender?.trim() ?? "";
		const entry = summaries.get(key) ?? {
			key,
			count: 0,
			users: []
		};
		entry.count += 1;
		if (sender && !entry.users.includes(sender)) entry.users.push(sender);
		summaries.set(key, entry);
	}
	return Array.from(summaries.values());
}
function selectOwnMatrixReactionEventIds(events, userId, emoji) {
	const senderId = userId.trim();
	if (!senderId) return [];
	const targetEmoji = emoji?.trim();
	const ids = [];
	for (const event of events) {
		if ((event.sender?.trim() ?? "") !== senderId) continue;
		if (targetEmoji && extractMatrixReactionKey(event.content) !== targetEmoji) continue;
		const eventId = event.event_id?.trim();
		if (eventId) ids.push(eventId);
	}
	return ids;
}
//#endregion
//#region extensions/matrix/src/matrix/send/client.ts
const getCore$3 = () => getMatrixRuntime();
function resolveMediaMaxBytes(accountId, cfg) {
	const matrixCfg = resolveMatrixAccountConfig({
		cfg: cfg ?? getCore$3().config.loadConfig(),
		accountId
	});
	const mediaMaxMb = typeof matrixCfg.mediaMaxMb === "number" ? matrixCfg.mediaMaxMb : void 0;
	if (typeof mediaMaxMb === "number") return mediaMaxMb * 1024 * 1024;
}
async function withResolvedMatrixClient(opts, run) {
	return await withResolvedRuntimeMatrixClient({
		...opts,
		readiness: "prepared"
	}, run);
}
//#endregion
//#region extensions/matrix/src/matrix/format.ts
const md = new MarkdownIt({
	html: false,
	linkify: true,
	breaks: true,
	typographer: false
});
md.enable("strikethrough");
const { escapeHtml } = md.utils;
function shouldSuppressAutoLink(tokens, idx) {
	const token = tokens[idx];
	if (token?.type !== "link_open" || token.info !== "auto") return false;
	const href = token.attrGet("href") ?? "";
	const label = tokens[idx + 1]?.type === "text" ? tokens[idx + 1]?.content ?? "" : "";
	return Boolean(href && label && isAutoLinkedFileRef(href, label));
}
md.renderer.rules.image = (tokens, idx) => escapeHtml(tokens[idx]?.content ?? "");
md.renderer.rules.html_block = (tokens, idx) => escapeHtml(tokens[idx]?.content ?? "");
md.renderer.rules.html_inline = (tokens, idx) => escapeHtml(tokens[idx]?.content ?? "");
md.renderer.rules.link_open = (tokens, idx, _options, _env, self) => shouldSuppressAutoLink(tokens, idx) ? "" : self.renderToken(tokens, idx, _options);
md.renderer.rules.link_close = (tokens, idx, _options, _env, self) => {
	const openIdx = idx - 2;
	if (openIdx >= 0 && shouldSuppressAutoLink(tokens, openIdx)) return "";
	return self.renderToken(tokens, idx, _options);
};
function markdownToMatrixHtml(markdown) {
	return md.render(markdown ?? "").trimEnd();
}
//#endregion
//#region extensions/matrix/src/matrix/send/types.ts
const MsgType = {
	Text: "m.text",
	Image: "m.image",
	Audio: "m.audio",
	Video: "m.video",
	File: "m.file",
	Notice: "m.notice"
};
const RelationType = {
	Annotation: MATRIX_ANNOTATION_RELATION_TYPE,
	Replace: "m.replace",
	Thread: "m.thread"
};
const EventType = {
	Direct: "m.direct",
	Reaction: MATRIX_REACTION_EVENT_TYPE,
	RoomMessage: "m.room.message"
};
//#endregion
//#region extensions/matrix/src/matrix/send/formatting.ts
const getCore$2 = () => getMatrixRuntime();
function buildTextContent(body, relation) {
	const content = relation ? {
		msgtype: MsgType.Text,
		body,
		"m.relates_to": relation
	} : {
		msgtype: MsgType.Text,
		body
	};
	applyMatrixFormatting(content, body);
	return content;
}
function applyMatrixFormatting(content, body) {
	const formatted = markdownToMatrixHtml(body ?? "");
	if (!formatted) return;
	content.format = "org.matrix.custom.html";
	content.formatted_body = formatted;
}
function buildReplyRelation(replyToId) {
	const trimmed = replyToId?.trim();
	if (!trimmed) return;
	return { "m.in_reply_to": { event_id: trimmed } };
}
function buildThreadRelation(threadId, replyToId) {
	const trimmed = threadId.trim();
	return {
		rel_type: RelationType.Thread,
		event_id: trimmed,
		is_falling_back: true,
		"m.in_reply_to": { event_id: replyToId?.trim() || trimmed }
	};
}
function resolveMatrixMsgType(contentType, _fileName) {
	switch (getCore$2().media.mediaKindFromMime(contentType ?? "")) {
		case "image": return MsgType.Image;
		case "audio": return MsgType.Audio;
		case "video": return MsgType.Video;
		default: return MsgType.File;
	}
}
function resolveMatrixVoiceDecision(opts) {
	if (!opts.wantsVoice) return { useVoice: false };
	if (isMatrixVoiceCompatibleAudio(opts)) return { useVoice: true };
	return { useVoice: false };
}
function isMatrixVoiceCompatibleAudio(opts) {
	return getCore$2().media.isVoiceCompatibleAudio({
		contentType: opts.contentType,
		fileName: opts.fileName
	});
}
//#endregion
//#region node_modules/.pnpm/content-type@1.0.5/node_modules/content-type/index.js
/*!
* content-type
* Copyright(c) 2015 Douglas Christopher Wilson
* MIT Licensed
*/
var require_content_type = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* RegExp to match *( ";" parameter ) in RFC 7231 sec 3.1.1.1
	*
	* parameter     = token "=" ( token / quoted-string )
	* token         = 1*tchar
	* tchar         = "!" / "#" / "$" / "%" / "&" / "'" / "*"
	*               / "+" / "-" / "." / "^" / "_" / "`" / "|" / "~"
	*               / DIGIT / ALPHA
	*               ; any VCHAR, except delimiters
	* quoted-string = DQUOTE *( qdtext / quoted-pair ) DQUOTE
	* qdtext        = HTAB / SP / %x21 / %x23-5B / %x5D-7E / obs-text
	* obs-text      = %x80-FF
	* quoted-pair   = "\" ( HTAB / SP / VCHAR / obs-text )
	*/
	var PARAM_REGEXP = /; *([!#$%&'*+.^_`|~0-9A-Za-z-]+) *= *("(?:[\u000b\u0020\u0021\u0023-\u005b\u005d-\u007e\u0080-\u00ff]|\\[\u000b\u0020-\u00ff])*"|[!#$%&'*+.^_`|~0-9A-Za-z-]+) */g;
	/**
	* RegExp to match quoted-pair in RFC 7230 sec 3.2.6
	*
	* quoted-pair = "\" ( HTAB / SP / VCHAR / obs-text )
	* obs-text    = %x80-FF
	*/
	var QESC_REGEXP = /\\([\u000b\u0020-\u00ff])/g;
	/**
	* RegExp to match type in RFC 7231 sec 3.1.1.1
	*
	* media-type = type "/" subtype
	* type       = token
	* subtype    = token
	*/
	var TYPE_REGEXP = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+\/[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
	exports.parse = parse;
	/**
	* Parse media type to object.
	*
	* @param {string|object} string
	* @return {Object}
	* @public
	*/
	function parse(string) {
		if (!string) throw new TypeError("argument string is required");
		var header = typeof string === "object" ? getcontenttype(string) : string;
		if (typeof header !== "string") throw new TypeError("argument string is required to be a string");
		var index = header.indexOf(";");
		var type = index !== -1 ? header.slice(0, index).trim() : header.trim();
		if (!TYPE_REGEXP.test(type)) throw new TypeError("invalid media type");
		var obj = new ContentType(type.toLowerCase());
		if (index !== -1) {
			var key;
			var match;
			var value;
			PARAM_REGEXP.lastIndex = index;
			while (match = PARAM_REGEXP.exec(header)) {
				if (match.index !== index) throw new TypeError("invalid parameter format");
				index += match[0].length;
				key = match[1].toLowerCase();
				value = match[2];
				if (value.charCodeAt(0) === 34) {
					value = value.slice(1, -1);
					if (value.indexOf("\\") !== -1) value = value.replace(QESC_REGEXP, "$1");
				}
				obj.parameters[key] = value;
			}
			if (index !== header.length) throw new TypeError("invalid parameter format");
		}
		return obj;
	}
	/**
	* Get content-type from req/res objects.
	*
	* @param {object}
	* @return {Object}
	* @private
	*/
	function getcontenttype(obj) {
		var header;
		if (typeof obj.getHeader === "function") header = obj.getHeader("content-type");
		else if (typeof obj.headers === "object") header = obj.headers && obj.headers["content-type"];
		if (typeof header !== "string") throw new TypeError("content-type header is missing from object");
		return header;
	}
	/**
	* Class to represent a content type.
	* @private
	*/
	function ContentType(type) {
		this.parameters = Object.create(null);
		this.type = type;
	}
}));
//#endregion
//#region node_modules/.pnpm/media-typer@1.1.0/node_modules/media-typer/index.js
/*!
* media-typer
* Copyright(c) 2014-2017 Douglas Christopher Wilson
* MIT Licensed
*/
var require_media_typer = /* @__PURE__ */ __commonJSMin(((exports) => {
	var TYPE_REGEXP = /^ *([A-Za-z0-9][A-Za-z0-9!#$&^_-]{0,126})\/([A-Za-z0-9][A-Za-z0-9!#$&^_.+-]{0,126}) *$/;
	exports.parse = parse;
	/**
	* Parse media type to object.
	*
	* @param {string} string
	* @return {object}
	* @public
	*/
	function parse(string) {
		if (!string) throw new TypeError("argument string is required");
		if (typeof string !== "string") throw new TypeError("argument string is required to be a string");
		var match = TYPE_REGEXP.exec(string.toLowerCase());
		if (!match) throw new TypeError("invalid media type");
		var type = match[1];
		var subtype = match[2];
		var suffix;
		var index = subtype.lastIndexOf("+");
		if (index !== -1) {
			suffix = subtype.substr(index + 1);
			subtype = subtype.substr(0, index);
		}
		return new MediaType(type, subtype, suffix);
	}
	/**
	* Class for MediaType object.
	* @public
	*/
	function MediaType(type, subtype, suffix) {
		this.type = type;
		this.subtype = subtype;
		this.suffix = suffix;
	}
}));
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/common/GenericTagTypes.js
const defaultTagInfo = { multiple: false };
const commonTags = {
	year: defaultTagInfo,
	track: defaultTagInfo,
	disk: defaultTagInfo,
	title: defaultTagInfo,
	artist: defaultTagInfo,
	artists: {
		multiple: true,
		unique: true
	},
	albumartist: defaultTagInfo,
	albumartists: {
		multiple: true,
		unique: true
	},
	album: defaultTagInfo,
	date: defaultTagInfo,
	originaldate: defaultTagInfo,
	originalyear: defaultTagInfo,
	releasedate: defaultTagInfo,
	comment: {
		multiple: true,
		unique: false
	},
	genre: {
		multiple: true,
		unique: true
	},
	picture: {
		multiple: true,
		unique: true
	},
	composer: {
		multiple: true,
		unique: true
	},
	lyrics: {
		multiple: true,
		unique: false
	},
	albumsort: {
		multiple: false,
		unique: true
	},
	titlesort: {
		multiple: false,
		unique: true
	},
	work: {
		multiple: false,
		unique: true
	},
	artistsort: {
		multiple: false,
		unique: true
	},
	albumartistsort: {
		multiple: false,
		unique: true
	},
	composersort: {
		multiple: false,
		unique: true
	},
	lyricist: {
		multiple: true,
		unique: true
	},
	writer: {
		multiple: true,
		unique: true
	},
	conductor: {
		multiple: true,
		unique: true
	},
	remixer: {
		multiple: true,
		unique: true
	},
	arranger: {
		multiple: true,
		unique: true
	},
	engineer: {
		multiple: true,
		unique: true
	},
	producer: {
		multiple: true,
		unique: true
	},
	technician: {
		multiple: true,
		unique: true
	},
	djmixer: {
		multiple: true,
		unique: true
	},
	mixer: {
		multiple: true,
		unique: true
	},
	label: {
		multiple: true,
		unique: true
	},
	grouping: defaultTagInfo,
	subtitle: { multiple: true },
	discsubtitle: defaultTagInfo,
	totaltracks: defaultTagInfo,
	totaldiscs: defaultTagInfo,
	compilation: defaultTagInfo,
	rating: { multiple: true },
	bpm: defaultTagInfo,
	mood: defaultTagInfo,
	media: defaultTagInfo,
	catalognumber: {
		multiple: true,
		unique: true
	},
	tvShow: defaultTagInfo,
	tvShowSort: defaultTagInfo,
	tvSeason: defaultTagInfo,
	tvEpisode: defaultTagInfo,
	tvEpisodeId: defaultTagInfo,
	tvNetwork: defaultTagInfo,
	podcast: defaultTagInfo,
	podcasturl: defaultTagInfo,
	releasestatus: defaultTagInfo,
	releasetype: { multiple: true },
	releasecountry: defaultTagInfo,
	script: defaultTagInfo,
	language: defaultTagInfo,
	copyright: defaultTagInfo,
	license: defaultTagInfo,
	encodedby: defaultTagInfo,
	encodersettings: defaultTagInfo,
	gapless: defaultTagInfo,
	barcode: defaultTagInfo,
	isrc: { multiple: true },
	asin: defaultTagInfo,
	musicbrainz_recordingid: defaultTagInfo,
	musicbrainz_trackid: defaultTagInfo,
	musicbrainz_albumid: defaultTagInfo,
	musicbrainz_artistid: { multiple: true },
	musicbrainz_albumartistid: { multiple: true },
	musicbrainz_releasegroupid: defaultTagInfo,
	musicbrainz_workid: defaultTagInfo,
	musicbrainz_trmid: defaultTagInfo,
	musicbrainz_discid: defaultTagInfo,
	acoustid_id: defaultTagInfo,
	acoustid_fingerprint: defaultTagInfo,
	musicip_puid: defaultTagInfo,
	musicip_fingerprint: defaultTagInfo,
	website: defaultTagInfo,
	"performer:instrument": {
		multiple: true,
		unique: true
	},
	averageLevel: defaultTagInfo,
	peakLevel: defaultTagInfo,
	notes: {
		multiple: true,
		unique: false
	},
	key: defaultTagInfo,
	originalalbum: defaultTagInfo,
	originalartist: defaultTagInfo,
	discogs_artist_id: {
		multiple: true,
		unique: true
	},
	discogs_release_id: defaultTagInfo,
	discogs_label_id: defaultTagInfo,
	discogs_master_release_id: defaultTagInfo,
	discogs_votes: defaultTagInfo,
	discogs_rating: defaultTagInfo,
	replaygain_track_peak: defaultTagInfo,
	replaygain_track_gain: defaultTagInfo,
	replaygain_album_peak: defaultTagInfo,
	replaygain_album_gain: defaultTagInfo,
	replaygain_track_minmax: defaultTagInfo,
	replaygain_album_minmax: defaultTagInfo,
	replaygain_undo: defaultTagInfo,
	description: { multiple: true },
	longDescription: defaultTagInfo,
	category: { multiple: true },
	hdVideo: defaultTagInfo,
	keywords: { multiple: true },
	movement: defaultTagInfo,
	movementIndex: defaultTagInfo,
	movementTotal: defaultTagInfo,
	podcastId: defaultTagInfo,
	showMovement: defaultTagInfo,
	stik: defaultTagInfo,
	playCounter: defaultTagInfo
};
/**
* @param alias Name of common tag
* @returns {boolean|*} true if given alias is mapped as a singleton', otherwise false
*/
function isSingleton(alias) {
	return commonTags[alias] && !commonTags[alias].multiple;
}
/**
* @param alias Common (generic) tag
* @returns {boolean|*} true if given alias is a singleton or explicitly marked as unique
*/
function isUnique(alias) {
	return !commonTags[alias].multiple || commonTags[alias].unique || false;
}
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/common/GenericTagMapper.js
var CommonTagMapper = class {
	static toIntOrNull(str) {
		const cleaned = Number.parseInt(str, 10);
		return Number.isNaN(cleaned) ? null : cleaned;
	}
	static normalizeTrack(origVal) {
		const split = origVal.toString().split("/");
		return {
			no: Number.parseInt(split[0], 10) || null,
			of: Number.parseInt(split[1], 10) || null
		};
	}
	constructor(tagTypes, tagMap) {
		this.tagTypes = tagTypes;
		this.tagMap = tagMap;
	}
	/**
	* Process and set common tags
	* write common tags to
	* @param tag Native tag
	* @param warnings Register warnings
	* @return common name
	*/
	mapGenericTag(tag, warnings) {
		tag = {
			id: tag.id,
			value: tag.value
		};
		this.postMap(tag, warnings);
		const id = this.getCommonName(tag.id);
		return id ? {
			id,
			value: tag.value
		} : null;
	}
	/**
	* Convert native tag key to common tag key
	* @param tag Native header tag
	* @return common tag name (alias)
	*/
	getCommonName(tag) {
		return this.tagMap[tag];
	}
	/**
	* Handle post mapping exceptions / correction
	* @param tag Tag e.g. {"©alb", "Buena Vista Social Club")
	* @param warnings Used to register warnings
	*/
	postMap(_tag, _warnings) {}
};
CommonTagMapper.maxRatingScore = 1;
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/id3v1/ID3v1TagMap.js
/**
* ID3v1 tag mappings
*/
const id3v1TagMap = {
	title: "title",
	artist: "artist",
	album: "album",
	year: "year",
	comment: "comment",
	track: "track",
	genre: "genre"
};
var ID3v1TagMapper = class extends CommonTagMapper {
	constructor() {
		super(["ID3v1"], id3v1TagMap);
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/common/CaseInsensitiveTagMap.js
var CaseInsensitiveTagMap = class extends CommonTagMapper {
	constructor(tagTypes, tagMap) {
		const upperCaseMap = {};
		for (const tag of Object.keys(tagMap)) upperCaseMap[tag.toUpperCase()] = tagMap[tag];
		super(tagTypes, upperCaseMap);
	}
	/**
	* @tag  Native header tag
	* @return common tag name (alias)
	*/
	getCommonName(tag) {
		return this.tagMap[tag.toUpperCase()];
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/id3v2/ID3v24TagMapper.js
/**
* ID3v2.3/ID3v2.4 tag mappings
*/
const id3v24TagMap = {
	TIT2: "title",
	TPE1: "artist",
	"TXXX:Artists": "artists",
	TPE2: "albumartist",
	TALB: "album",
	TDRV: "date",
	TORY: "originalyear",
	TPOS: "disk",
	TCON: "genre",
	APIC: "picture",
	TCOM: "composer",
	USLT: "lyrics",
	TSOA: "albumsort",
	TSOT: "titlesort",
	TOAL: "originalalbum",
	TSOP: "artistsort",
	TSO2: "albumartistsort",
	TSOC: "composersort",
	TEXT: "lyricist",
	"TXXX:Writer": "writer",
	TPE3: "conductor",
	TPE4: "remixer",
	"IPLS:arranger": "arranger",
	"IPLS:engineer": "engineer",
	"IPLS:producer": "producer",
	"IPLS:DJ-mix": "djmixer",
	"IPLS:mix": "mixer",
	TPUB: "label",
	TIT1: "grouping",
	TIT3: "subtitle",
	TRCK: "track",
	TCMP: "compilation",
	POPM: "rating",
	TBPM: "bpm",
	TMED: "media",
	"TXXX:CATALOGNUMBER": "catalognumber",
	"TXXX:MusicBrainz Album Status": "releasestatus",
	"TXXX:MusicBrainz Album Type": "releasetype",
	"TXXX:MusicBrainz Album Release Country": "releasecountry",
	"TXXX:RELEASECOUNTRY": "releasecountry",
	"TXXX:SCRIPT": "script",
	TLAN: "language",
	TCOP: "copyright",
	WCOP: "license",
	TENC: "encodedby",
	TSSE: "encodersettings",
	"TXXX:BARCODE": "barcode",
	"TXXX:ISRC": "isrc",
	TSRC: "isrc",
	"TXXX:ASIN": "asin",
	"TXXX:originalyear": "originalyear",
	"UFID:http://musicbrainz.org": "musicbrainz_recordingid",
	"TXXX:MusicBrainz Release Track Id": "musicbrainz_trackid",
	"TXXX:MusicBrainz Album Id": "musicbrainz_albumid",
	"TXXX:MusicBrainz Artist Id": "musicbrainz_artistid",
	"TXXX:MusicBrainz Album Artist Id": "musicbrainz_albumartistid",
	"TXXX:MusicBrainz Release Group Id": "musicbrainz_releasegroupid",
	"TXXX:MusicBrainz Work Id": "musicbrainz_workid",
	"TXXX:MusicBrainz TRM Id": "musicbrainz_trmid",
	"TXXX:MusicBrainz Disc Id": "musicbrainz_discid",
	"TXXX:ACOUSTID_ID": "acoustid_id",
	"TXXX:Acoustid Id": "acoustid_id",
	"TXXX:Acoustid Fingerprint": "acoustid_fingerprint",
	"TXXX:MusicIP PUID": "musicip_puid",
	"TXXX:MusicMagic Fingerprint": "musicip_fingerprint",
	WOAR: "website",
	TDRC: "date",
	TYER: "year",
	TDOR: "originaldate",
	"TIPL:arranger": "arranger",
	"TIPL:engineer": "engineer",
	"TIPL:producer": "producer",
	"TIPL:DJ-mix": "djmixer",
	"TIPL:mix": "mixer",
	TMOO: "mood",
	SYLT: "lyrics",
	TSST: "discsubtitle",
	TKEY: "key",
	COMM: "comment",
	TOPE: "originalartist",
	"PRIV:AverageLevel": "averageLevel",
	"PRIV:PeakLevel": "peakLevel",
	"TXXX:DISCOGS_ARTIST_ID": "discogs_artist_id",
	"TXXX:DISCOGS_ARTISTS": "artists",
	"TXXX:DISCOGS_ARTIST_NAME": "artists",
	"TXXX:DISCOGS_ALBUM_ARTISTS": "albumartist",
	"TXXX:DISCOGS_CATALOG": "catalognumber",
	"TXXX:DISCOGS_COUNTRY": "releasecountry",
	"TXXX:DISCOGS_DATE": "originaldate",
	"TXXX:DISCOGS_LABEL": "label",
	"TXXX:DISCOGS_LABEL_ID": "discogs_label_id",
	"TXXX:DISCOGS_MASTER_RELEASE_ID": "discogs_master_release_id",
	"TXXX:DISCOGS_RATING": "discogs_rating",
	"TXXX:DISCOGS_RELEASED": "date",
	"TXXX:DISCOGS_RELEASE_ID": "discogs_release_id",
	"TXXX:DISCOGS_VOTES": "discogs_votes",
	"TXXX:CATALOGID": "catalognumber",
	"TXXX:STYLE": "genre",
	"TXXX:REPLAYGAIN_TRACK_PEAK": "replaygain_track_peak",
	"TXXX:REPLAYGAIN_TRACK_GAIN": "replaygain_track_gain",
	"TXXX:REPLAYGAIN_ALBUM_PEAK": "replaygain_album_peak",
	"TXXX:REPLAYGAIN_ALBUM_GAIN": "replaygain_album_gain",
	"TXXX:MP3GAIN_MINMAX": "replaygain_track_minmax",
	"TXXX:MP3GAIN_ALBUM_MINMAX": "replaygain_album_minmax",
	"TXXX:MP3GAIN_UNDO": "replaygain_undo",
	MVNM: "movement",
	MVIN: "movementIndex",
	PCST: "podcast",
	TCAT: "category",
	TDES: "description",
	TDRL: "releasedate",
	TGID: "podcastId",
	TKWD: "keywords",
	WFED: "podcasturl",
	GRP1: "grouping",
	PCNT: "playCounter"
};
var ID3v24TagMapper = class ID3v24TagMapper extends CaseInsensitiveTagMap {
	static toRating(popm) {
		return {
			source: popm.email,
			rating: popm.rating > 0 ? (popm.rating - 1) / 254 * CommonTagMapper.maxRatingScore : void 0
		};
	}
	constructor() {
		super(["ID3v2.3", "ID3v2.4"], id3v24TagMap);
	}
	/**
	* Handle post mapping exceptions / correction
	* @param tag to post map
	* @param warnings Wil be used to register (collect) warnings
	*/
	postMap(tag, warnings) {
		switch (tag.id) {
			case "UFID":
				{
					const idTag = tag.value;
					if (idTag.owner_identifier === "http://musicbrainz.org") {
						tag.id += `:${idTag.owner_identifier}`;
						tag.value = decodeString(idTag.identifier, "latin1");
					}
				}
				break;
			case "PRIV":
				{
					const customTag = tag.value;
					switch (customTag.owner_identifier) {
						case "AverageLevel":
						case "PeakValue":
							tag.id += `:${customTag.owner_identifier}`;
							tag.value = customTag.data.length === 4 ? UINT32_LE.get(customTag.data, 0) : null;
							if (tag.value === null) warnings.addWarning("Failed to parse PRIV:PeakValue");
							break;
						default: warnings.addWarning(`Unknown PRIV owner-identifier: ${customTag.data}`);
					}
				}
				break;
			case "POPM":
				tag.value = ID3v24TagMapper.toRating(tag.value);
				break;
			default: break;
		}
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/asf/AsfTagMapper.js
/**
* ASF Metadata tag mappings.
* See http://msdn.microsoft.com/en-us/library/ms867702.aspx
*/
const asfTagMap = {
	Title: "title",
	Author: "artist",
	"WM/AlbumArtist": "albumartist",
	"WM/AlbumTitle": "album",
	"WM/Year": "date",
	"WM/OriginalReleaseTime": "originaldate",
	"WM/OriginalReleaseYear": "originalyear",
	Description: "comment",
	"WM/TrackNumber": "track",
	"WM/PartOfSet": "disk",
	"WM/Genre": "genre",
	"WM/Composer": "composer",
	"WM/Lyrics": "lyrics",
	"WM/AlbumSortOrder": "albumsort",
	"WM/TitleSortOrder": "titlesort",
	"WM/ArtistSortOrder": "artistsort",
	"WM/AlbumArtistSortOrder": "albumartistsort",
	"WM/ComposerSortOrder": "composersort",
	"WM/Writer": "lyricist",
	"WM/Conductor": "conductor",
	"WM/ModifiedBy": "remixer",
	"WM/Engineer": "engineer",
	"WM/Producer": "producer",
	"WM/DJMixer": "djmixer",
	"WM/Mixer": "mixer",
	"WM/Publisher": "label",
	"WM/ContentGroupDescription": "grouping",
	"WM/SubTitle": "subtitle",
	"WM/SetSubTitle": "discsubtitle",
	"WM/IsCompilation": "compilation",
	"WM/SharedUserRating": "rating",
	"WM/BeatsPerMinute": "bpm",
	"WM/Mood": "mood",
	"WM/Media": "media",
	"WM/CatalogNo": "catalognumber",
	"MusicBrainz/Album Status": "releasestatus",
	"MusicBrainz/Album Type": "releasetype",
	"MusicBrainz/Album Release Country": "releasecountry",
	"WM/Script": "script",
	"WM/Language": "language",
	Copyright: "copyright",
	LICENSE: "license",
	"WM/EncodedBy": "encodedby",
	"WM/EncodingSettings": "encodersettings",
	"WM/Barcode": "barcode",
	"WM/ISRC": "isrc",
	"MusicBrainz/Track Id": "musicbrainz_recordingid",
	"MusicBrainz/Release Track Id": "musicbrainz_trackid",
	"MusicBrainz/Album Id": "musicbrainz_albumid",
	"MusicBrainz/Artist Id": "musicbrainz_artistid",
	"MusicBrainz/Album Artist Id": "musicbrainz_albumartistid",
	"MusicBrainz/Release Group Id": "musicbrainz_releasegroupid",
	"MusicBrainz/Work Id": "musicbrainz_workid",
	"MusicBrainz/TRM Id": "musicbrainz_trmid",
	"MusicBrainz/Disc Id": "musicbrainz_discid",
	"Acoustid/Id": "acoustid_id",
	"Acoustid/Fingerprint": "acoustid_fingerprint",
	"MusicIP/PUID": "musicip_puid",
	"WM/ARTISTS": "artists",
	"WM/InitialKey": "key",
	ASIN: "asin",
	"WM/Work": "work",
	"WM/AuthorURL": "website",
	"WM/Picture": "picture"
};
var AsfTagMapper = class AsfTagMapper extends CommonTagMapper {
	static toRating(rating) {
		return { rating: Number.parseFloat(rating + 1) / 5 };
	}
	constructor() {
		super(["asf"], asfTagMap);
	}
	postMap(tag) {
		switch (tag.id) {
			case "WM/SharedUserRating": {
				const keys = tag.id.split(":");
				tag.value = AsfTagMapper.toRating(tag.value);
				tag.id = keys[0];
				break;
			}
		}
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/id3v2/ID3v22TagMapper.js
/**
* ID3v2.2 tag mappings
*/
const id3v22TagMap = {
	TT2: "title",
	TP1: "artist",
	TP2: "albumartist",
	TAL: "album",
	TYE: "year",
	COM: "comment",
	TRK: "track",
	TPA: "disk",
	TCO: "genre",
	PIC: "picture",
	TCM: "composer",
	TOR: "originaldate",
	TOT: "originalalbum",
	TXT: "lyricist",
	TP3: "conductor",
	TPB: "label",
	TT1: "grouping",
	TT3: "subtitle",
	TLA: "language",
	TCR: "copyright",
	WCP: "license",
	TEN: "encodedby",
	TSS: "encodersettings",
	WAR: "website",
	PCS: "podcast",
	TCP: "compilation",
	TDR: "date",
	TS2: "albumartistsort",
	TSA: "albumsort",
	TSC: "composersort",
	TSP: "artistsort",
	TST: "titlesort",
	WFD: "podcasturl",
	TBP: "bpm",
	GP1: "grouping"
};
var ID3v22TagMapper = class extends CaseInsensitiveTagMap {
	constructor() {
		super(["ID3v2.2"], id3v22TagMap);
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/apev2/APEv2TagMapper.js
/**
* ID3v2.2 tag mappings
*/
const apev2TagMap = {
	Title: "title",
	Artist: "artist",
	Artists: "artists",
	"Album Artist": "albumartist",
	Album: "album",
	Year: "date",
	Originalyear: "originalyear",
	Originaldate: "originaldate",
	Releasedate: "releasedate",
	Comment: "comment",
	Track: "track",
	Disc: "disk",
	DISCNUMBER: "disk",
	Genre: "genre",
	"Cover Art (Front)": "picture",
	"Cover Art (Back)": "picture",
	Composer: "composer",
	Lyrics: "lyrics",
	ALBUMSORT: "albumsort",
	TITLESORT: "titlesort",
	WORK: "work",
	ARTISTSORT: "artistsort",
	ALBUMARTISTSORT: "albumartistsort",
	COMPOSERSORT: "composersort",
	Lyricist: "lyricist",
	Writer: "writer",
	Conductor: "conductor",
	MixArtist: "remixer",
	Arranger: "arranger",
	Engineer: "engineer",
	Producer: "producer",
	DJMixer: "djmixer",
	Mixer: "mixer",
	Label: "label",
	Grouping: "grouping",
	Subtitle: "subtitle",
	DiscSubtitle: "discsubtitle",
	Compilation: "compilation",
	BPM: "bpm",
	Mood: "mood",
	Media: "media",
	CatalogNumber: "catalognumber",
	MUSICBRAINZ_ALBUMSTATUS: "releasestatus",
	MUSICBRAINZ_ALBUMTYPE: "releasetype",
	RELEASECOUNTRY: "releasecountry",
	Script: "script",
	Language: "language",
	Copyright: "copyright",
	LICENSE: "license",
	EncodedBy: "encodedby",
	EncoderSettings: "encodersettings",
	Barcode: "barcode",
	ISRC: "isrc",
	ASIN: "asin",
	musicbrainz_trackid: "musicbrainz_recordingid",
	musicbrainz_releasetrackid: "musicbrainz_trackid",
	MUSICBRAINZ_ALBUMID: "musicbrainz_albumid",
	MUSICBRAINZ_ARTISTID: "musicbrainz_artistid",
	MUSICBRAINZ_ALBUMARTISTID: "musicbrainz_albumartistid",
	MUSICBRAINZ_RELEASEGROUPID: "musicbrainz_releasegroupid",
	MUSICBRAINZ_WORKID: "musicbrainz_workid",
	MUSICBRAINZ_TRMID: "musicbrainz_trmid",
	MUSICBRAINZ_DISCID: "musicbrainz_discid",
	Acoustid_Id: "acoustid_id",
	ACOUSTID_FINGERPRINT: "acoustid_fingerprint",
	MUSICIP_PUID: "musicip_puid",
	Weblink: "website",
	REPLAYGAIN_TRACK_GAIN: "replaygain_track_gain",
	REPLAYGAIN_TRACK_PEAK: "replaygain_track_peak",
	MP3GAIN_MINMAX: "replaygain_track_minmax",
	MP3GAIN_UNDO: "replaygain_undo"
};
var APEv2TagMapper = class extends CaseInsensitiveTagMap {
	constructor() {
		super(["APEv2"], apev2TagMap);
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/mp4/MP4TagMapper.js
/**
* Ref: https://github.com/sergiomb2/libmp4v2/wiki/iTunesMetadata
*/
const mp4TagMap = {
	"©nam": "title",
	"©ART": "artist",
	aART: "albumartist",
	"----:com.apple.iTunes:Band": "albumartist",
	"©alb": "album",
	"©day": "date",
	"©cmt": "comment",
	"©com": "comment",
	trkn: "track",
	disk: "disk",
	"©gen": "genre",
	covr: "picture",
	"©wrt": "composer",
	"©lyr": "lyrics",
	soal: "albumsort",
	sonm: "titlesort",
	soar: "artistsort",
	soaa: "albumartistsort",
	soco: "composersort",
	"----:com.apple.iTunes:LYRICIST": "lyricist",
	"----:com.apple.iTunes:CONDUCTOR": "conductor",
	"----:com.apple.iTunes:REMIXER": "remixer",
	"----:com.apple.iTunes:ENGINEER": "engineer",
	"----:com.apple.iTunes:PRODUCER": "producer",
	"----:com.apple.iTunes:DJMIXER": "djmixer",
	"----:com.apple.iTunes:MIXER": "mixer",
	"----:com.apple.iTunes:LABEL": "label",
	"©grp": "grouping",
	"----:com.apple.iTunes:SUBTITLE": "subtitle",
	"----:com.apple.iTunes:DISCSUBTITLE": "discsubtitle",
	cpil: "compilation",
	tmpo: "bpm",
	"----:com.apple.iTunes:MOOD": "mood",
	"----:com.apple.iTunes:MEDIA": "media",
	"----:com.apple.iTunes:CATALOGNUMBER": "catalognumber",
	tvsh: "tvShow",
	tvsn: "tvSeason",
	tves: "tvEpisode",
	sosn: "tvShowSort",
	tven: "tvEpisodeId",
	tvnn: "tvNetwork",
	pcst: "podcast",
	purl: "podcasturl",
	"----:com.apple.iTunes:MusicBrainz Album Status": "releasestatus",
	"----:com.apple.iTunes:MusicBrainz Album Type": "releasetype",
	"----:com.apple.iTunes:MusicBrainz Album Release Country": "releasecountry",
	"----:com.apple.iTunes:SCRIPT": "script",
	"----:com.apple.iTunes:LANGUAGE": "language",
	cprt: "copyright",
	"©cpy": "copyright",
	"----:com.apple.iTunes:LICENSE": "license",
	"©too": "encodedby",
	pgap: "gapless",
	"----:com.apple.iTunes:BARCODE": "barcode",
	"----:com.apple.iTunes:ISRC": "isrc",
	"----:com.apple.iTunes:ASIN": "asin",
	"----:com.apple.iTunes:NOTES": "comment",
	"----:com.apple.iTunes:MusicBrainz Track Id": "musicbrainz_recordingid",
	"----:com.apple.iTunes:MusicBrainz Release Track Id": "musicbrainz_trackid",
	"----:com.apple.iTunes:MusicBrainz Album Id": "musicbrainz_albumid",
	"----:com.apple.iTunes:MusicBrainz Artist Id": "musicbrainz_artistid",
	"----:com.apple.iTunes:MusicBrainz Album Artist Id": "musicbrainz_albumartistid",
	"----:com.apple.iTunes:MusicBrainz Release Group Id": "musicbrainz_releasegroupid",
	"----:com.apple.iTunes:MusicBrainz Work Id": "musicbrainz_workid",
	"----:com.apple.iTunes:MusicBrainz TRM Id": "musicbrainz_trmid",
	"----:com.apple.iTunes:MusicBrainz Disc Id": "musicbrainz_discid",
	"----:com.apple.iTunes:Acoustid Id": "acoustid_id",
	"----:com.apple.iTunes:Acoustid Fingerprint": "acoustid_fingerprint",
	"----:com.apple.iTunes:MusicIP PUID": "musicip_puid",
	"----:com.apple.iTunes:fingerprint": "musicip_fingerprint",
	"----:com.apple.iTunes:replaygain_track_gain": "replaygain_track_gain",
	"----:com.apple.iTunes:replaygain_track_peak": "replaygain_track_peak",
	"----:com.apple.iTunes:replaygain_album_gain": "replaygain_album_gain",
	"----:com.apple.iTunes:replaygain_album_peak": "replaygain_album_peak",
	"----:com.apple.iTunes:replaygain_track_minmax": "replaygain_track_minmax",
	"----:com.apple.iTunes:replaygain_album_minmax": "replaygain_album_minmax",
	"----:com.apple.iTunes:replaygain_undo": "replaygain_undo",
	gnre: "genre",
	"----:com.apple.iTunes:ALBUMARTISTSORT": "albumartistsort",
	"----:com.apple.iTunes:ARTISTS": "artists",
	"----:com.apple.iTunes:ORIGINALDATE": "originaldate",
	"----:com.apple.iTunes:ORIGINALYEAR": "originalyear",
	"----:com.apple.iTunes:RELEASEDATE": "releasedate",
	desc: "description",
	ldes: "longDescription",
	"©mvn": "movement",
	"©mvi": "movementIndex",
	"©mvc": "movementTotal",
	"©wrk": "work",
	catg: "category",
	egid: "podcastId",
	hdvd: "hdVideo",
	keyw: "keywords",
	shwm: "showMovement",
	stik: "stik",
	rate: "rating"
};
const tagType = "iTunes";
var MP4TagMapper = class extends CaseInsensitiveTagMap {
	constructor() {
		super([tagType], mp4TagMap);
	}
	postMap(tag, _warnings) {
		switch (tag.id) {
			case "rate":
				tag.value = {
					source: void 0,
					rating: Number.parseFloat(tag.value) / 100
				};
				break;
		}
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/ogg/vorbis/VorbisTagMapper.js
/**
* Vorbis tag mappings
*
* Mapping from native header format to one or possibly more 'common' entries
* The common entries aim to read the same information from different media files
* independent of the underlying format
*/
const vorbisTagMap = {
	TITLE: "title",
	ARTIST: "artist",
	ARTISTS: "artists",
	ALBUMARTIST: "albumartist",
	"ALBUM ARTIST": "albumartist",
	ALBUM: "album",
	DATE: "date",
	ORIGINALDATE: "originaldate",
	ORIGINALYEAR: "originalyear",
	RELEASEDATE: "releasedate",
	COMMENT: "comment",
	TRACKNUMBER: "track",
	DISCNUMBER: "disk",
	GENRE: "genre",
	METADATA_BLOCK_PICTURE: "picture",
	COMPOSER: "composer",
	LYRICS: "lyrics",
	ALBUMSORT: "albumsort",
	TITLESORT: "titlesort",
	WORK: "work",
	ARTISTSORT: "artistsort",
	ALBUMARTISTSORT: "albumartistsort",
	COMPOSERSORT: "composersort",
	LYRICIST: "lyricist",
	WRITER: "writer",
	CONDUCTOR: "conductor",
	REMIXER: "remixer",
	ARRANGER: "arranger",
	ENGINEER: "engineer",
	PRODUCER: "producer",
	DJMIXER: "djmixer",
	MIXER: "mixer",
	LABEL: "label",
	GROUPING: "grouping",
	SUBTITLE: "subtitle",
	DISCSUBTITLE: "discsubtitle",
	TRACKTOTAL: "totaltracks",
	DISCTOTAL: "totaldiscs",
	COMPILATION: "compilation",
	RATING: "rating",
	BPM: "bpm",
	KEY: "key",
	MOOD: "mood",
	MEDIA: "media",
	CATALOGNUMBER: "catalognumber",
	RELEASESTATUS: "releasestatus",
	RELEASETYPE: "releasetype",
	RELEASECOUNTRY: "releasecountry",
	SCRIPT: "script",
	LANGUAGE: "language",
	COPYRIGHT: "copyright",
	LICENSE: "license",
	ENCODEDBY: "encodedby",
	ENCODERSETTINGS: "encodersettings",
	BARCODE: "barcode",
	ISRC: "isrc",
	ASIN: "asin",
	MUSICBRAINZ_TRACKID: "musicbrainz_recordingid",
	MUSICBRAINZ_RELEASETRACKID: "musicbrainz_trackid",
	MUSICBRAINZ_ALBUMID: "musicbrainz_albumid",
	MUSICBRAINZ_ARTISTID: "musicbrainz_artistid",
	MUSICBRAINZ_ALBUMARTISTID: "musicbrainz_albumartistid",
	MUSICBRAINZ_RELEASEGROUPID: "musicbrainz_releasegroupid",
	MUSICBRAINZ_WORKID: "musicbrainz_workid",
	MUSICBRAINZ_TRMID: "musicbrainz_trmid",
	MUSICBRAINZ_DISCID: "musicbrainz_discid",
	ACOUSTID_ID: "acoustid_id",
	ACOUSTID_ID_FINGERPRINT: "acoustid_fingerprint",
	MUSICIP_PUID: "musicip_puid",
	WEBSITE: "website",
	NOTES: "notes",
	TOTALTRACKS: "totaltracks",
	TOTALDISCS: "totaldiscs",
	DISCOGS_ARTIST_ID: "discogs_artist_id",
	DISCOGS_ARTISTS: "artists",
	DISCOGS_ARTIST_NAME: "artists",
	DISCOGS_ALBUM_ARTISTS: "albumartist",
	DISCOGS_CATALOG: "catalognumber",
	DISCOGS_COUNTRY: "releasecountry",
	DISCOGS_DATE: "originaldate",
	DISCOGS_LABEL: "label",
	DISCOGS_LABEL_ID: "discogs_label_id",
	DISCOGS_MASTER_RELEASE_ID: "discogs_master_release_id",
	DISCOGS_RATING: "discogs_rating",
	DISCOGS_RELEASED: "date",
	DISCOGS_RELEASE_ID: "discogs_release_id",
	DISCOGS_VOTES: "discogs_votes",
	CATALOGID: "catalognumber",
	STYLE: "genre",
	REPLAYGAIN_TRACK_GAIN: "replaygain_track_gain",
	REPLAYGAIN_TRACK_PEAK: "replaygain_track_peak",
	REPLAYGAIN_ALBUM_GAIN: "replaygain_album_gain",
	REPLAYGAIN_ALBUM_PEAK: "replaygain_album_peak",
	REPLAYGAIN_MINMAX: "replaygain_track_minmax",
	REPLAYGAIN_ALBUM_MINMAX: "replaygain_album_minmax",
	REPLAYGAIN_UNDO: "replaygain_undo"
};
var VorbisTagMapper = class VorbisTagMapper extends CommonTagMapper {
	static toRating(email, rating, maxScore) {
		return {
			source: email ? email.toLowerCase() : void 0,
			rating: Number.parseFloat(rating) / maxScore * CommonTagMapper.maxRatingScore
		};
	}
	constructor() {
		super(["vorbis"], vorbisTagMap);
	}
	postMap(tag) {
		if (tag.id === "RATING") tag.value = VorbisTagMapper.toRating(void 0, tag.value, 100);
		else if (tag.id.indexOf("RATING:") === 0) {
			const keys = tag.id.split(":");
			tag.value = VorbisTagMapper.toRating(keys[1], tag.value, 1);
			tag.id = keys[0];
		}
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/riff/RiffInfoTagMap.js
/**
* RIFF Info Tags; part of the EXIF 2.3
* Ref: http://owl.phy.queensu.ca/~phil/exiftool/TagNames/RIFF.html#Info
*/
const riffInfoTagMap = {
	IART: "artist",
	ICRD: "date",
	INAM: "title",
	TITL: "title",
	IPRD: "album",
	ITRK: "track",
	IPRT: "track",
	COMM: "comment",
	ICMT: "comment",
	ICNT: "releasecountry",
	GNRE: "genre",
	IWRI: "writer",
	RATE: "rating",
	YEAR: "year",
	ISFT: "encodedby",
	CODE: "encodedby",
	TURL: "website",
	IGNR: "genre",
	IENG: "engineer",
	ITCH: "technician",
	IMED: "media",
	IRPD: "album"
};
var RiffInfoTagMapper = class extends CommonTagMapper {
	constructor() {
		super(["exif"], riffInfoTagMap);
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/matroska/MatroskaTagMapper.js
/**
* EBML Tag map
*/
const ebmlTagMap = {
	"segment:title": "title",
	"album:ARTIST": "albumartist",
	"album:ARTISTSORT": "albumartistsort",
	"album:TITLE": "album",
	"album:DATE_RECORDED": "originaldate",
	"album:DATE_RELEASED": "releasedate",
	"album:PART_NUMBER": "disk",
	"album:TOTAL_PARTS": "totaltracks",
	"track:ARTIST": "artist",
	"track:ARTISTSORT": "artistsort",
	"track:TITLE": "title",
	"track:PART_NUMBER": "track",
	"track:MUSICBRAINZ_TRACKID": "musicbrainz_recordingid",
	"track:MUSICBRAINZ_ALBUMID": "musicbrainz_albumid",
	"track:MUSICBRAINZ_ARTISTID": "musicbrainz_artistid",
	"track:PUBLISHER": "label",
	"track:GENRE": "genre",
	"track:ENCODER": "encodedby",
	"track:ENCODER_OPTIONS": "encodersettings",
	"edition:TOTAL_PARTS": "totaldiscs",
	picture: "picture"
};
var MatroskaTagMapper = class extends CaseInsensitiveTagMap {
	constructor() {
		super(["matroska"], ebmlTagMap);
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/aiff/AiffTagMap.js
/**
* ID3v1 tag mappings
*/
const tagMap = {
	NAME: "title",
	AUTH: "artist",
	"(c) ": "copyright",
	ANNO: "comment"
};
var AiffTagMapper = class extends CommonTagMapper {
	constructor() {
		super(["AIFF"], tagMap);
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/common/CombinedTagMapper.js
var CombinedTagMapper = class {
	constructor() {
		this.tagMappers = {};
		[
			new ID3v1TagMapper(),
			new ID3v22TagMapper(),
			new ID3v24TagMapper(),
			new MP4TagMapper(),
			new MP4TagMapper(),
			new VorbisTagMapper(),
			new APEv2TagMapper(),
			new AsfTagMapper(),
			new RiffInfoTagMapper(),
			new MatroskaTagMapper(),
			new AiffTagMapper()
		].forEach((mapper) => {
			this.registerTagMapper(mapper);
		});
	}
	/**
	* Convert native to generic (common) tags
	* @param tagType Originating tag format
	* @param tag     Native tag to map to a generic tag id
	* @param warnings
	* @return Generic tag result (output of this function)
	*/
	mapTag(tagType, tag, warnings) {
		if (this.tagMappers[tagType]) return this.tagMappers[tagType].mapGenericTag(tag, warnings);
		throw new InternalParserError(`No generic tag mapper defined for tag-format: ${tagType}`);
	}
	registerTagMapper(genericTagMapper) {
		for (const tagType of genericTagMapper.tagTypes) this.tagMappers[tagType] = genericTagMapper;
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/lrc/LyricsParser.js
const TIMESTAMP_REGEX = /\[(\d{2}):(\d{2})\.(\d{2,3})]/;
function parseLyrics(input) {
	if (TIMESTAMP_REGEX.test(input)) return parseLrc(input);
	return toUnsyncedLyrics(input);
}
function toUnsyncedLyrics(lyrics) {
	return {
		contentType: LyricsContentType.lyrics,
		timeStampFormat: TimestampFormat.notSynchronized,
		text: lyrics.trim(),
		syncText: []
	};
}
/**
* Parse LRC (Lyrics) formatted text
* Ref: https://en.wikipedia.org/wiki/LRC_(file_format)
* @param lrcString
*/
function parseLrc(lrcString) {
	const lines = lrcString.split("\n");
	const syncText = [];
	for (const line of lines) {
		const match = line.match(TIMESTAMP_REGEX);
		if (match) {
			const minutes = Number.parseInt(match[1], 10);
			const seconds = Number.parseInt(match[2], 10);
			const ms = match[3].length === 3 ? Number.parseInt(match[3], 10) : Number.parseInt(match[3], 10) * 10;
			const timestamp = (minutes * 60 + seconds) * 1e3 + ms;
			const text = line.replace(TIMESTAMP_REGEX, "").trim();
			syncText.push({
				timestamp,
				text
			});
		}
	}
	return {
		contentType: LyricsContentType.lyrics,
		timeStampFormat: TimestampFormat.milliseconds,
		text: syncText.map((line) => line.text).join("\n"),
		syncText
	};
}
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/common/MetadataCollector.js
var import_src = /* @__PURE__ */ __toESM(require_src(), 1);
const debug$1 = (0, import_src.default)("music-metadata:collector");
const TagPriority = [
	"matroska",
	"APEv2",
	"vorbis",
	"ID3v2.4",
	"ID3v2.3",
	"ID3v2.2",
	"exif",
	"asf",
	"iTunes",
	"AIFF",
	"ID3v1"
];
/**
* Provided to the parser to uodate the metadata result.
* Responsible for triggering async updates
*/
var MetadataCollector = class {
	constructor(opts) {
		this.format = {
			tagTypes: [],
			trackInfo: []
		};
		this.native = {};
		this.common = {
			track: {
				no: null,
				of: null
			},
			disk: {
				no: null,
				of: null
			},
			movementIndex: {
				no: null,
				of: null
			}
		};
		this.quality = { warnings: [] };
		/**
		* Keeps track of origin priority for each mapped id
		*/
		this.commonOrigin = {};
		/**
		* Maps a tag type to a priority
		*/
		this.originPriority = {};
		this.tagMapper = new CombinedTagMapper();
		this.opts = opts;
		let priority = 1;
		for (const tagType of TagPriority) this.originPriority[tagType] = priority++;
		this.originPriority.artificial = 500;
		this.originPriority.id3v1 = 600;
	}
	/**
	* @returns {boolean} true if one or more tags have been found
	*/
	hasAny() {
		return Object.keys(this.native).length > 0;
	}
	addStreamInfo(streamInfo) {
		debug$1(`streamInfo: type=${streamInfo.type ? TrackTypeValueToKeyMap[streamInfo.type] : "?"}, codec=${streamInfo.codecName}`);
		this.format.trackInfo.push(streamInfo);
	}
	setFormat(key, value) {
		debug$1(`format: ${key} = ${value}`);
		this.format[key] = value;
		if (this.opts?.observer) this.opts.observer({
			metadata: this,
			tag: {
				type: "format",
				id: key,
				value
			}
		});
	}
	setAudioOnly() {
		this.setFormat("hasAudio", true);
		this.setFormat("hasVideo", false);
	}
	async addTag(tagType, tagId, value) {
		debug$1(`tag ${tagType}.${tagId} = ${value}`);
		if (!this.native[tagType]) {
			this.format.tagTypes.push(tagType);
			this.native[tagType] = [];
		}
		this.native[tagType].push({
			id: tagId,
			value
		});
		await this.toCommon(tagType, tagId, value);
	}
	addWarning(warning) {
		this.quality.warnings.push({ message: warning });
	}
	async postMap(tagType, tag) {
		switch (tag.id) {
			case "artist": return this.handleSingularArtistTag(tagType, tag, "artist", "artists");
			case "albumartist": return this.handleSingularArtistTag(tagType, tag, "albumartist", "albumartists");
			case "artists": return this.handlePluralArtistTag(tagType, tag, "artist", "artists");
			case "albumartists": return this.handlePluralArtistTag(tagType, tag, "albumartist", "albumartists");
			case "picture": return this.postFixPicture(tag.value).then((picture) => {
				if (picture !== null) {
					tag.value = picture;
					this.setGenericTag(tagType, tag);
				}
			});
			case "totaltracks":
				this.common.track.of = CommonTagMapper.toIntOrNull(tag.value);
				return;
			case "totaldiscs":
				this.common.disk.of = CommonTagMapper.toIntOrNull(tag.value);
				return;
			case "movementTotal":
				this.common.movementIndex.of = CommonTagMapper.toIntOrNull(tag.value);
				return;
			case "track":
			case "disk":
			case "movementIndex": {
				const of = this.common[tag.id].of;
				this.common[tag.id] = CommonTagMapper.normalizeTrack(tag.value);
				this.common[tag.id].of = of != null ? of : this.common[tag.id].of;
				return;
			}
			case "bpm":
			case "year":
			case "originalyear":
				tag.value = Number.parseInt(tag.value, 10);
				break;
			case "date": {
				const year = Number.parseInt(tag.value.substr(0, 4), 10);
				if (!Number.isNaN(year)) this.common.year = year;
				break;
			}
			case "discogs_label_id":
			case "discogs_release_id":
			case "discogs_master_release_id":
			case "discogs_artist_id":
			case "discogs_votes":
				tag.value = typeof tag.value === "string" ? Number.parseInt(tag.value, 10) : tag.value;
				break;
			case "replaygain_track_gain":
			case "replaygain_track_peak":
			case "replaygain_album_gain":
			case "replaygain_album_peak":
				tag.value = toRatio(tag.value);
				break;
			case "replaygain_track_minmax":
				tag.value = tag.value.split(",").map((v) => Number.parseInt(v, 10));
				break;
			case "replaygain_undo": {
				const minMix = tag.value.split(",").map((v) => Number.parseInt(v, 10));
				tag.value = {
					leftChannel: minMix[0],
					rightChannel: minMix[1]
				};
				break;
			}
			case "gapless":
			case "compilation":
			case "podcast":
			case "showMovement":
				tag.value = tag.value === "1" || tag.value === 1;
				break;
			case "isrc": {
				const commonTag = this.common[tag.id];
				if (commonTag && commonTag.indexOf(tag.value) !== -1) return;
				break;
			}
			case "comment":
				if (typeof tag.value === "string") tag.value = { text: tag.value };
				if (tag.value.descriptor === "iTunPGAP") this.setGenericTag(tagType, {
					id: "gapless",
					value: tag.value.text === "1"
				});
				break;
			case "lyrics":
				if (typeof tag.value === "string") tag.value = parseLyrics(tag.value);
				break;
			default:
		}
		if (tag.value !== null) this.setGenericTag(tagType, tag);
	}
	/**
	* Convert native tags to common tags
	* @returns {IAudioMetadata} Native + common tags
	*/
	toCommonMetadata() {
		return {
			format: this.format,
			native: this.native,
			quality: this.quality,
			common: this.common
		};
	}
	/**
	* Handle singular artist tags (artist, albumartist) and cross-populate to plural form
	*/
	handleSingularArtistTag(tagType, tag, singularId, pluralId) {
		if (this.commonOrigin[singularId] === this.originPriority[tagType]) return this.postMap("artificial", {
			id: pluralId,
			value: tag.value
		});
		if (!this.common[pluralId]) this.setGenericTag("artificial", {
			id: pluralId,
			value: tag.value
		});
		this.setGenericTag(tagType, tag);
	}
	/**
	* Handle plural artist tags (artists, albumartists) and cross-populate to singular form
	*/
	handlePluralArtistTag(tagType, tag, singularId, pluralId) {
		if (!this.common[singularId] || this.commonOrigin[singularId] === this.originPriority.artificial) {
			if (!this.common[pluralId] || this.common[pluralId].indexOf(tag.value) === -1) {
				const value = joinArtists((this.common[pluralId] || []).concat([tag.value]));
				this.setGenericTag("artificial", {
					id: singularId,
					value
				});
			}
		}
		this.setGenericTag(tagType, tag);
	}
	/**
	* Fix some common issues with picture object
	* @param picture Picture
	*/
	async postFixPicture(picture) {
		if (picture.data && picture.data.length > 0) {
			if (!picture.format) {
				const fileType = await fileTypeFromBuffer(Uint8Array.from(picture.data));
				if (fileType) picture.format = fileType.mime;
				else return null;
			}
			picture.format = picture.format.toLocaleLowerCase();
			switch (picture.format) {
				case "image/jpg": picture.format = "image/jpeg";
			}
			return picture;
		}
		this.addWarning("Empty picture tag found");
		return null;
	}
	/**
	* Convert native tag to common tags
	*/
	async toCommon(tagType, tagId, value) {
		const tag = {
			id: tagId,
			value
		};
		const genericTag = this.tagMapper.mapTag(tagType, tag, this);
		if (genericTag) await this.postMap(tagType, genericTag);
	}
	/**
	* Set generic tag
	*/
	setGenericTag(tagType, tag) {
		debug$1(`common.${tag.id} = ${tag.value}`);
		const prio0 = this.commonOrigin[tag.id] || 1e3;
		const prio1 = this.originPriority[tagType];
		if (isSingleton(tag.id)) if (prio1 <= prio0) {
			this.common[tag.id] = tag.value;
			this.commonOrigin[tag.id] = prio1;
		} else return debug$1(`Ignore native tag (singleton): ${tagType}.${tag.id} = ${tag.value}`);
		else if (prio1 === prio0) if (!isUnique(tag.id) || this.common[tag.id].indexOf(tag.value) === -1) this.common[tag.id].push(tag.value);
		else debug$1(`Ignore duplicate value: ${tagType}.${tag.id} = ${tag.value}`);
		else if (prio1 < prio0) {
			this.common[tag.id] = [tag.value];
			this.commonOrigin[tag.id] = prio1;
		} else return debug$1(`Ignore native tag (list): ${tagType}.${tag.id} = ${tag.value}`);
		if (this.opts?.observer) this.opts.observer({
			metadata: this,
			tag: {
				type: "common",
				id: tag.id,
				value: tag.value
			}
		});
	}
};
function joinArtists(artists) {
	if (artists.length > 2) return `${artists.slice(0, artists.length - 1).join(", ")} & ${artists[artists.length - 1]}`;
	return artists.join(" & ");
}
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/mpeg/MpegLoader.js
const mpegParserLoader = {
	parserType: "mpeg",
	extensions: [
		".mp2",
		".mp3",
		".m2a",
		".aac",
		"aacp"
	],
	mimeTypes: [
		"audio/mpeg",
		"audio/mp3",
		"audio/aacs",
		"audio/aacp"
	],
	async load() {
		return (await import("./MpegParser-DqXtR8Qn.js")).MpegParser;
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/apev2/Apev2Loader.js
const apeParserLoader = {
	parserType: "apev2",
	extensions: [".ape"],
	mimeTypes: ["audio/ape", "audio/monkeys-audio"],
	async load() {
		return (await import("./APEv2Parser-sMtL1Rkk.js")).APEv2Parser;
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/asf/AsfLoader.js
const asfParserLoader = {
	parserType: "asf",
	extensions: [
		".asf",
		".wma",
		".wmv"
	],
	mimeTypes: [
		"audio/ms-wma",
		"video/ms-wmv",
		"audio/ms-asf",
		"video/ms-asf",
		"application/vnd.ms-asf"
	],
	async load() {
		return (await import("./AsfParser-hFv3y_Jw.js")).AsfParser;
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/dsdiff/DsdiffLoader.js
const dsdiffParserLoader = {
	parserType: "dsdiff",
	extensions: [".dff"],
	mimeTypes: ["audio/dsf", "audio/dsd"],
	async load() {
		return (await import("./DsdiffParser-DM3_gTB-.js")).DsdiffParser;
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/aiff/AiffLoader.js
const aiffParserLoader = {
	parserType: "aiff",
	extensions: [
		".aif",
		"aiff",
		"aifc"
	],
	mimeTypes: [
		"audio/aiff",
		"audio/aif",
		"audio/aifc",
		"application/aiff"
	],
	async load() {
		return (await import("./AiffParser-B7Rvwten.js")).AIFFParser;
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/dsf/DsfLoader.js
const dsfParserLoader = {
	parserType: "dsf",
	extensions: [".dsf"],
	mimeTypes: ["audio/dsf"],
	async load() {
		return (await import("./DsfParser-FJAn55g6.js")).DsfParser;
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/flac/FlacLoader.js
const flacParserLoader = {
	parserType: "flac",
	extensions: [".flac"],
	mimeTypes: ["audio/flac"],
	async load() {
		return (await import("./FlacParser-CirKJkyV.js")).FlacParser;
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/matroska/MatroskaLoader.js
const matroskaParserLoader = {
	parserType: "matroska",
	extensions: [
		".mka",
		".mkv",
		".mk3d",
		".mks",
		"webm"
	],
	mimeTypes: [
		"audio/matroska",
		"video/matroska",
		"audio/webm",
		"video/webm"
	],
	async load() {
		return (await import("./MatroskaParser-BZhYJk1d.js")).MatroskaParser;
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/mp4/Mp4Loader.js
const mp4ParserLoader = {
	parserType: "mp4",
	extensions: [
		".mp4",
		".m4a",
		".m4b",
		".m4pa",
		"m4v",
		"m4r",
		"3gp",
		".mov",
		".movie",
		".qt"
	],
	mimeTypes: [
		"audio/mp4",
		"audio/m4a",
		"video/m4v",
		"video/mp4",
		"video/quicktime"
	],
	async load() {
		return (await import("./MP4Parser-BX05t3ER.js")).MP4Parser;
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/musepack/MusepackLoader.js
const musepackParserLoader = {
	parserType: "musepack",
	extensions: [".mpc"],
	mimeTypes: ["audio/musepack"],
	async load() {
		return (await import("./MusepackParser-DHvAYWBO.js")).MusepackParser;
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/ogg/OggLoader.js
const oggParserLoader = {
	parserType: "ogg",
	extensions: [
		".ogg",
		".ogv",
		".oga",
		".ogm",
		".ogx",
		".opus",
		".spx"
	],
	mimeTypes: [
		"audio/ogg",
		"audio/opus",
		"audio/speex",
		"video/ogg"
	],
	async load() {
		return (await import("./OggParser-q4UuOyH1.js")).OggParser;
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/wavpack/WavPackLoader.js
const wavpackParserLoader = {
	parserType: "wavpack",
	extensions: [".wv", ".wvp"],
	mimeTypes: ["audio/wavpack"],
	async load() {
		return (await import("./WavPackParser-D0W3ct72.js")).WavPackParser;
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/wav/WaveLoader.js
const riffParserLoader = {
	parserType: "riff",
	extensions: [
		".wav",
		"wave",
		".bwf"
	],
	mimeTypes: [
		"audio/vnd.wave",
		"audio/wav",
		"audio/wave"
	],
	async load() {
		return (await import("./WaveParser-C9L8IlLr.js")).WaveParser;
	}
};
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/ParserFactory.js
var import_content_type = /* @__PURE__ */ __toESM(require_content_type(), 1);
var import_media_typer = require_media_typer();
const debug = (0, import_src.default)("music-metadata:parser:factory");
function parseHttpContentType(contentType) {
	const type = import_content_type.parse(contentType);
	const mime = (0, import_media_typer.parse)(type.type);
	return {
		type: mime.type,
		subtype: mime.subtype,
		suffix: mime.suffix,
		parameters: type.parameters
	};
}
var ParserFactory = class {
	constructor() {
		this.parsers = [];
		[
			flacParserLoader,
			mpegParserLoader,
			apeParserLoader,
			mp4ParserLoader,
			matroskaParserLoader,
			riffParserLoader,
			oggParserLoader,
			asfParserLoader,
			aiffParserLoader,
			wavpackParserLoader,
			musepackParserLoader,
			dsfParserLoader,
			dsdiffParserLoader
		].forEach((parser) => {
			this.registerParser(parser);
		});
	}
	registerParser(parser) {
		this.parsers.push(parser);
	}
	async parse(tokenizer, parserLoader, opts) {
		if (tokenizer.supportsRandomAccess()) {
			debug("tokenizer supports random-access, scanning for appending headers");
			await scanAppendingHeaders(tokenizer, opts);
		} else debug("tokenizer does not support random-access, cannot scan for appending headers");
		if (!parserLoader) {
			const buf = new Uint8Array(4100);
			if (tokenizer.fileInfo.mimeType) parserLoader = this.findLoaderForContentType(tokenizer.fileInfo.mimeType);
			if (!parserLoader && tokenizer.fileInfo.path) parserLoader = this.findLoaderForExtension(tokenizer.fileInfo.path);
			if (!parserLoader) {
				debug("Guess parser on content...");
				await tokenizer.peekBuffer(buf, { mayBeLess: true });
				const guessedType = await fileTypeFromBuffer(buf, { mpegOffsetTolerance: 10 });
				if (!guessedType || !guessedType.mime) throw new CouldNotDetermineFileTypeError("Failed to determine audio format");
				debug(`Guessed file type is mime=${guessedType.mime}, extension=${guessedType.ext}`);
				parserLoader = this.findLoaderForContentType(guessedType.mime);
				if (!parserLoader) throw new UnsupportedFileTypeError(`Guessed MIME-type not supported: ${guessedType.mime}`);
			}
		}
		debug(`Loading ${parserLoader.parserType} parser...`);
		const metadata = new MetadataCollector(opts);
		const parser = new (await (parserLoader.load()))(metadata, tokenizer, opts ?? {});
		debug(`Parser ${parserLoader.parserType} loaded`);
		await parser.parse();
		if (metadata.format.trackInfo) {
			if (metadata.format.hasAudio === void 0) metadata.setFormat("hasAudio", !!metadata.format.trackInfo.find((track) => track.type === TrackType.audio));
			if (metadata.format.hasVideo === void 0) metadata.setFormat("hasVideo", !!metadata.format.trackInfo.find((track) => track.type === TrackType.video));
		}
		return metadata.toCommonMetadata();
	}
	/**
	* @param filePath - Path, filename or extension to audio file
	* @return Parser submodule name
	*/
	findLoaderForExtension(filePath) {
		if (!filePath) return;
		const extension = getExtension(filePath).toLocaleLowerCase() || filePath;
		return this.parsers.find((parser) => parser.extensions.indexOf(extension) !== -1);
	}
	findLoaderForContentType(httpContentType) {
		let mime;
		if (!httpContentType) return;
		try {
			mime = parseHttpContentType(httpContentType);
		} catch (_err) {
			debug(`Invalid HTTP Content-Type header value: ${httpContentType}`);
			return;
		}
		const subType = mime.subtype.indexOf("x-") === 0 ? mime.subtype.substring(2) : mime.subtype;
		return this.parsers.find((parser) => parser.mimeTypes.find((loader) => loader.indexOf(`${mime.type}/${subType}`) !== -1));
	}
	getSupportedMimeTypes() {
		const mimeTypeSet = /* @__PURE__ */ new Set();
		this.parsers.forEach((loader) => {
			loader.mimeTypes.forEach((mimeType) => {
				mimeTypeSet.add(mimeType);
				mimeTypeSet.add(mimeType.replace("/", "/x-"));
			});
		});
		return Array.from(mimeTypeSet);
	}
};
function getExtension(fname) {
	const i = fname.lastIndexOf(".");
	return i === -1 ? "" : fname.substring(i);
}
async function getLyricsHeaderLength(tokenizer) {
	const fileSize = tokenizer.fileInfo.size;
	if (fileSize >= 143) {
		const buf = new Uint8Array(15);
		const position = tokenizer.position;
		await tokenizer.readBuffer(buf, { position: fileSize - 143 });
		tokenizer.setPosition(position);
		const txt = textDecode(buf, "latin1");
		if (txt.substring(6) === "LYRICS200") return Number.parseInt(txt.substring(0, 6), 10) + 15;
	}
	return 0;
}
//#endregion
//#region node_modules/.pnpm/music-metadata@11.12.3/node_modules/music-metadata/lib/core.js
/**
* Primary entry point, Node.js specific entry point is MusepackParser.ts
*/
/**
* Parse audio from memory
* @param uint8Array - Uint8Array holding audio data
* @param fileInfo - File information object or MIME-type string
* @param options - Parsing options
* @returns Metadata
* Ref: https://github.com/Borewit/strtok3/blob/e6938c81ff685074d5eb3064a11c0b03ca934c1d/src/index.ts#L15
*/
async function parseBuffer(uint8Array, fileInfo, options = {}) {
	return parseFromTokenizer(fromBuffer(uint8Array, { fileInfo: typeof fileInfo === "string" ? { mimeType: fileInfo } : fileInfo }), options);
}
/**
* Parse audio from ITokenizer source
* @param tokenizer - Audio source implementing the tokenizer interface
* @param options - Parsing options
* @returns Metadata
*/
function parseFromTokenizer(tokenizer, options) {
	return new ParserFactory().parse(tokenizer, void 0, options);
}
async function scanAppendingHeaders(tokenizer, options = {}) {
	let apeOffset = tokenizer.fileInfo.size;
	if (await hasID3v1Header(tokenizer)) {
		apeOffset -= 128;
		const lyricsLen = await getLyricsHeaderLength(tokenizer);
		apeOffset -= lyricsLen;
	}
	options.apeHeader = await APEv2Parser.findApeFooterOffset(tokenizer, apeOffset);
}
//#endregion
//#region extensions/matrix/src/matrix/send/media.ts
const getCore$1 = () => getMatrixRuntime();
function buildMatrixMediaInfo(params) {
	const base = {};
	if (Number.isFinite(params.size)) base.size = params.size;
	if (params.mimetype) base.mimetype = params.mimetype;
	if (params.imageInfo) {
		const dimensional = {
			...base,
			...params.imageInfo
		};
		if (typeof params.durationMs === "number") return {
			...dimensional,
			duration: params.durationMs
		};
		return dimensional;
	}
	if (typeof params.durationMs === "number") return {
		...base,
		duration: params.durationMs
	};
	if (Object.keys(base).length === 0) return;
	return base;
}
function buildMediaContent(params) {
	const info = buildMatrixMediaInfo({
		size: params.size,
		mimetype: params.mimetype,
		durationMs: params.durationMs,
		imageInfo: params.imageInfo
	});
	const base = {
		msgtype: params.msgtype,
		body: params.body,
		filename: params.filename,
		info: info ?? void 0
	};
	if (!params.file && params.url) base.url = params.url;
	if (params.file) base.file = params.file;
	if (params.isVoice) {
		base["org.matrix.msc3245.voice"] = {};
		if (typeof params.durationMs === "number") base["org.matrix.msc1767.audio"] = { duration: params.durationMs };
	}
	if (params.relation) base["m.relates_to"] = params.relation;
	applyMatrixFormatting(base, params.body);
	return base;
}
const THUMBNAIL_MAX_SIDE = 800;
const THUMBNAIL_QUALITY = 80;
async function prepareImageInfo(params) {
	const meta = await getCore$1().media.getImageMetadata(params.buffer).catch(() => null);
	if (!meta) return;
	const imageInfo = {
		w: meta.width,
		h: meta.height
	};
	if (params.encrypted) return imageInfo;
	if (Math.max(meta.width, meta.height) > THUMBNAIL_MAX_SIDE) try {
		const thumbBuffer = await getCore$1().media.resizeToJpeg({
			buffer: params.buffer,
			maxSide: THUMBNAIL_MAX_SIDE,
			quality: THUMBNAIL_QUALITY,
			withoutEnlargement: true
		});
		const thumbMeta = await getCore$1().media.getImageMetadata(thumbBuffer).catch(() => null);
		imageInfo.thumbnail_url = await params.client.uploadContent(thumbBuffer, "image/jpeg", "thumbnail.jpg");
		if (thumbMeta) imageInfo.thumbnail_info = {
			w: thumbMeta.width,
			h: thumbMeta.height,
			mimetype: "image/jpeg",
			size: thumbBuffer.byteLength
		};
	} catch {}
	return imageInfo;
}
async function resolveMediaDurationMs(params) {
	if (params.kind !== "audio" && params.kind !== "video") return;
	try {
		const fileInfo = params.contentType || params.fileName ? {
			mimeType: params.contentType,
			size: params.buffer.byteLength,
			path: params.fileName
		} : void 0;
		const durationSeconds = (await parseBuffer(params.buffer, fileInfo, {
			duration: true,
			skipCovers: true
		})).format.duration;
		if (typeof durationSeconds === "number" && Number.isFinite(durationSeconds)) return Math.max(0, Math.round(durationSeconds * 1e3));
	} catch {}
}
async function uploadFile(client, file, params) {
	return await client.uploadContent(file, params.contentType, params.filename);
}
/**
* Upload media with optional encryption for E2EE rooms.
*/
async function uploadMediaMaybeEncrypted(client, roomId, buffer, params) {
	if (client.crypto && await client.crypto.isRoomEncrypted(roomId) && client.crypto) {
		const encrypted = await client.crypto.encryptMedia(buffer);
		const mxc = await client.uploadContent(encrypted.buffer, params.contentType, params.filename);
		return {
			url: mxc,
			file: {
				url: mxc,
				...encrypted.file
			}
		};
	}
	return { url: await uploadFile(client, buffer, params) };
}
//#endregion
//#region extensions/matrix/src/matrix/direct-room.ts
function trimMaybeString(value) {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}
function normalizeJoinedMatrixMembers(joinedMembers) {
	if (!Array.isArray(joinedMembers)) return [];
	return joinedMembers.map((entry) => trimMaybeString(entry)).filter((entry) => Boolean(entry));
}
function isStrictDirectMembership(params) {
	const selfUserId = trimMaybeString(params.selfUserId);
	const remoteUserId = trimMaybeString(params.remoteUserId);
	const joinedMembers = params.joinedMembers ?? [];
	return Boolean(selfUserId && remoteUserId && joinedMembers.length === 2 && joinedMembers.includes(selfUserId) && joinedMembers.includes(remoteUserId));
}
async function readJoinedMatrixMembers(client, roomId) {
	try {
		return normalizeJoinedMatrixMembers(await client.getJoinedRoomMembers(roomId));
	} catch {
		return null;
	}
}
async function isStrictDirectRoom(params) {
	const selfUserId = trimMaybeString(params.selfUserId) ?? trimMaybeString(await params.client.getUserId().catch(() => null));
	if (!selfUserId) return false;
	const joinedMembers = await readJoinedMatrixMembers(params.client, params.roomId);
	return isStrictDirectMembership({
		selfUserId,
		remoteUserId: params.remoteUserId,
		joinedMembers
	});
}
//#endregion
//#region extensions/matrix/src/matrix/direct-management.ts
async function readMatrixDirectAccountData(client) {
	try {
		const direct = await client.getAccountData(EventType.Direct);
		return direct && typeof direct === "object" && !Array.isArray(direct) ? direct : {};
	} catch {
		return {};
	}
}
function normalizeRemoteUserId(remoteUserId) {
	const normalized = remoteUserId.trim();
	if (!isMatrixQualifiedUserId(normalized)) throw new Error(`Matrix user IDs must be fully qualified (got "${remoteUserId}")`);
	return normalized;
}
function normalizeMappedRoomIds(direct, remoteUserId) {
	const current = direct[remoteUserId];
	if (!Array.isArray(current)) return [];
	const seen = /* @__PURE__ */ new Set();
	const normalized = [];
	for (const value of current) {
		const roomId = typeof value === "string" ? value.trim() : "";
		if (!roomId || seen.has(roomId)) continue;
		seen.add(roomId);
		normalized.push(roomId);
	}
	return normalized;
}
function normalizeRoomIdList(values) {
	const seen = /* @__PURE__ */ new Set();
	const normalized = [];
	for (const value of values) {
		const roomId = value.trim();
		if (!roomId || seen.has(roomId)) continue;
		seen.add(roomId);
		normalized.push(roomId);
	}
	return normalized;
}
async function classifyDirectRoomCandidate(params) {
	const joinedMembers = await readJoinedMatrixMembers(params.client, params.roomId);
	return {
		roomId: params.roomId,
		joinedMembers,
		strict: joinedMembers !== null && isStrictDirectMembership({
			selfUserId: params.selfUserId,
			remoteUserId: params.remoteUserId,
			joinedMembers
		}),
		source: params.source
	};
}
function buildNextDirectContent(params) {
	const current = normalizeMappedRoomIds(params.directContent, params.remoteUserId);
	const nextRooms = normalizeRoomIdList([params.roomId, ...current]);
	return {
		...params.directContent,
		[params.remoteUserId]: nextRooms
	};
}
async function persistMatrixDirectRoomMapping(params) {
	const remoteUserId = normalizeRemoteUserId(params.remoteUserId);
	const directContent = await readMatrixDirectAccountData(params.client);
	if (normalizeMappedRoomIds(directContent, remoteUserId)[0] === params.roomId) return false;
	await params.client.setAccountData(EventType.Direct, buildNextDirectContent({
		directContent,
		remoteUserId,
		roomId: params.roomId
	}));
	return true;
}
async function inspectMatrixDirectRooms(params) {
	const remoteUserId = normalizeRemoteUserId(params.remoteUserId);
	const selfUserId = (await params.client.getUserId().catch(() => null))?.trim() || null;
	const mappedRoomIds = normalizeMappedRoomIds(await readMatrixDirectAccountData(params.client), remoteUserId);
	const mappedRooms = await Promise.all(mappedRoomIds.map(async (roomId) => await classifyDirectRoomCandidate({
		client: params.client,
		roomId,
		remoteUserId,
		selfUserId,
		source: "account-data"
	})));
	const mappedStrict = mappedRooms.find((room) => room.strict);
	let joinedRooms = [];
	if (!mappedStrict && typeof params.client.getJoinedRooms === "function") try {
		const resolved = await params.client.getJoinedRooms();
		joinedRooms = Array.isArray(resolved) ? resolved : [];
	} catch {
		joinedRooms = [];
	}
	const discoveredStrictRoomIds = [];
	for (const roomId of normalizeRoomIdList(joinedRooms)) {
		if (mappedRoomIds.includes(roomId)) continue;
		if (await isStrictDirectRoom({
			client: params.client,
			roomId,
			remoteUserId,
			selfUserId
		})) discoveredStrictRoomIds.push(roomId);
	}
	return {
		selfUserId,
		remoteUserId,
		mappedRoomIds,
		mappedRooms,
		discoveredStrictRoomIds,
		activeRoomId: mappedStrict?.roomId ?? discoveredStrictRoomIds[0] ?? null
	};
}
async function repairMatrixDirectRooms(params) {
	const remoteUserId = normalizeRemoteUserId(params.remoteUserId);
	const directContentBefore = await readMatrixDirectAccountData(params.client);
	const inspected = await inspectMatrixDirectRooms({
		client: params.client,
		remoteUserId
	});
	const activeRoomId = inspected.activeRoomId ?? await params.client.createDirectRoom(remoteUserId, { encrypted: params.encrypted === true });
	const createdRoomId = inspected.activeRoomId ? null : activeRoomId;
	const directContentAfter = buildNextDirectContent({
		directContent: directContentBefore,
		remoteUserId,
		roomId: activeRoomId
	});
	const changed = JSON.stringify(directContentAfter[remoteUserId] ?? []) !== JSON.stringify(directContentBefore[remoteUserId] ?? []);
	if (changed) await persistMatrixDirectRoomMapping({
		client: params.client,
		remoteUserId,
		roomId: activeRoomId
	});
	return {
		...inspected,
		activeRoomId,
		createdRoomId,
		changed,
		directContentBefore,
		directContentAfter
	};
}
//#endregion
//#region extensions/matrix/src/matrix/send/targets.ts
function normalizeTarget(raw) {
	const trimmed = raw.trim();
	if (!trimmed) throw new Error("Matrix target is required (room:<id> or #alias)");
	return trimmed;
}
function normalizeThreadId(raw) {
	if (raw === void 0 || raw === null) return null;
	const trimmed = String(raw).trim();
	return trimmed ? trimmed : null;
}
const MAX_DIRECT_ROOM_CACHE_SIZE = 1024;
const directRoomCacheByClient = /* @__PURE__ */ new WeakMap();
function resolveDirectRoomCache(client) {
	const existing = directRoomCacheByClient.get(client);
	if (existing) return existing;
	const created = /* @__PURE__ */ new Map();
	directRoomCacheByClient.set(client, created);
	return created;
}
function setDirectRoomCached(client, key, value) {
	const directRoomCache = resolveDirectRoomCache(client);
	directRoomCache.set(key, value);
	if (directRoomCache.size > MAX_DIRECT_ROOM_CACHE_SIZE) {
		const oldest = directRoomCache.keys().next().value;
		if (oldest !== void 0) directRoomCache.delete(oldest);
	}
}
async function resolveDirectRoomId(client, userId) {
	const trimmed = userId.trim();
	if (!isMatrixQualifiedUserId(trimmed)) throw new Error(`Matrix user IDs must be fully qualified (got "${trimmed}")`);
	const selfUserId = (await client.getUserId().catch(() => null))?.trim() || null;
	const directRoomCache = resolveDirectRoomCache(client);
	const cached = directRoomCache.get(trimmed);
	if (cached && await isStrictDirectRoom({
		client,
		roomId: cached,
		remoteUserId: trimmed,
		selfUserId
	})) return cached;
	if (cached) directRoomCache.delete(trimmed);
	const inspection = await inspectMatrixDirectRooms({
		client,
		remoteUserId: trimmed
	});
	if (inspection.activeRoomId) {
		setDirectRoomCached(client, trimmed, inspection.activeRoomId);
		if (inspection.mappedRoomIds[0] !== inspection.activeRoomId) await persistMatrixDirectRoomMapping({
			client,
			remoteUserId: trimmed,
			roomId: inspection.activeRoomId
		}).catch(() => {});
		return inspection.activeRoomId;
	}
	throw new Error(`No direct room found for ${trimmed} (m.direct missing)`);
}
async function resolveMatrixRoomId(client, raw) {
	const target = normalizeMatrixResolvableTarget(normalizeTarget(raw));
	if (target.toLowerCase().startsWith("user:")) return await resolveDirectRoomId(client, target.slice(5));
	if (isMatrixQualifiedUserId(target)) return await resolveDirectRoomId(client, target);
	if (target.startsWith("#")) {
		const resolved = await client.resolveRoom(target);
		if (!resolved) throw new Error(`Matrix alias ${target} could not be resolved`);
		return resolved;
	}
	return target;
}
//#endregion
//#region extensions/matrix/src/matrix/send.ts
const MATRIX_TEXT_LIMIT = 4e3;
const getCore = () => getMatrixRuntime();
function isMatrixClient(value) {
	return typeof value.sendEvent === "function";
}
function normalizeMatrixClientResolveOpts(opts) {
	if (!opts) return {};
	if (isMatrixClient(opts)) return { client: opts };
	return {
		client: opts.client,
		cfg: opts.cfg,
		timeoutMs: opts.timeoutMs,
		accountId: opts.accountId
	};
}
async function sendMessageMatrix(to, message, opts = {}) {
	const trimmedMessage = message?.trim() ?? "";
	if (!trimmedMessage && !opts.mediaUrl) throw new Error("Matrix send requires text or media");
	return await withResolvedMatrixClient({
		client: opts.client,
		cfg: opts.cfg,
		timeoutMs: opts.timeoutMs,
		accountId: opts.accountId
	}, async (client) => {
		const roomId = await resolveMatrixRoomId(client, to);
		const cfg = opts.cfg ?? getCore().config.loadConfig();
		const tableMode = getCore().channel.text.resolveMarkdownTableMode({
			cfg,
			channel: "matrix",
			accountId: opts.accountId
		});
		const convertedMessage = getCore().channel.text.convertMarkdownTables(trimmedMessage, tableMode);
		const textLimit = getCore().channel.text.resolveTextChunkLimit(cfg, "matrix", opts.accountId);
		const chunkLimit = Math.min(textLimit, MATRIX_TEXT_LIMIT);
		const chunkMode = getCore().channel.text.resolveChunkMode(cfg, "matrix", opts.accountId);
		const chunks = getCore().channel.text.chunkMarkdownTextWithMode(convertedMessage, chunkLimit, chunkMode);
		const threadId = normalizeThreadId(opts.threadId);
		const relation = threadId ? buildThreadRelation(threadId, opts.replyToId) : buildReplyRelation(opts.replyToId);
		const sendContent = async (content) => {
			return await client.sendMessage(roomId, content);
		};
		let lastMessageId = "";
		if (opts.mediaUrl) {
			const maxBytes = resolveMediaMaxBytes(opts.accountId, cfg);
			const media = await getCore().media.loadWebMedia(opts.mediaUrl, {
				maxBytes,
				localRoots: opts.mediaLocalRoots
			});
			const uploaded = await uploadMediaMaybeEncrypted(client, roomId, media.buffer, {
				contentType: media.contentType,
				filename: media.fileName
			});
			const durationMs = await resolveMediaDurationMs({
				buffer: media.buffer,
				contentType: media.contentType,
				fileName: media.fileName,
				kind: media.kind ?? "unknown"
			});
			const baseMsgType = resolveMatrixMsgType(media.contentType, media.fileName);
			const { useVoice } = resolveMatrixVoiceDecision({
				wantsVoice: opts.audioAsVoice === true,
				contentType: media.contentType,
				fileName: media.fileName
			});
			const msgtype = useVoice ? MsgType.Audio : baseMsgType;
			const imageInfo = msgtype === MsgType.Image ? await prepareImageInfo({
				buffer: media.buffer,
				client,
				encrypted: Boolean(uploaded.file)
			}) : void 0;
			const [firstChunk, ...rest] = chunks;
			lastMessageId = await sendContent(buildMediaContent({
				msgtype,
				body: useVoice ? "Voice message" : firstChunk ?? media.fileName ?? "(file)",
				url: uploaded.url,
				file: uploaded.file,
				filename: media.fileName,
				mimetype: media.contentType,
				size: media.buffer.byteLength,
				durationMs,
				relation,
				isVoice: useVoice,
				imageInfo
			})) ?? lastMessageId;
			const textChunks = useVoice ? chunks : rest;
			const followupRelation = useVoice || threadId ? relation : void 0;
			for (const chunk of textChunks) {
				const text = chunk.trim();
				if (!text) continue;
				lastMessageId = await sendContent(buildTextContent(text, followupRelation)) ?? lastMessageId;
			}
		} else for (const chunk of chunks.length ? chunks : [""]) {
			const text = chunk.trim();
			if (!text) continue;
			lastMessageId = await sendContent(buildTextContent(text, relation)) ?? lastMessageId;
		}
		return {
			messageId: lastMessageId || "unknown",
			roomId
		};
	});
}
async function sendPollMatrix(to, poll, opts = {}) {
	if (!poll.question?.trim()) throw new Error("Matrix poll requires a question");
	if (!poll.options?.length) throw new Error("Matrix poll requires options");
	return await withResolvedMatrixClient({
		client: opts.client,
		cfg: opts.cfg,
		timeoutMs: opts.timeoutMs,
		accountId: opts.accountId
	}, async (client) => {
		const roomId = await resolveMatrixRoomId(client, to);
		const pollContent = buildPollStartContent(poll);
		const threadId = normalizeThreadId(opts.threadId);
		const pollPayload = threadId ? {
			...pollContent,
			"m.relates_to": buildThreadRelation(threadId)
		} : pollContent;
		return {
			eventId: await client.sendEvent(roomId, "m.poll.start", pollPayload) ?? "unknown",
			roomId
		};
	});
}
async function sendTypingMatrix(roomId, typing, timeoutMs, client) {
	await withResolvedMatrixClient({
		client,
		timeoutMs
	}, async (resolved) => {
		const resolvedRoom = await resolveMatrixRoomId(resolved, roomId);
		const resolvedTimeoutMs = typeof timeoutMs === "number" ? timeoutMs : 3e4;
		await resolved.setTyping(resolvedRoom, typing, resolvedTimeoutMs);
	});
}
async function sendReadReceiptMatrix(roomId, eventId, client) {
	if (!eventId?.trim()) return;
	await withResolvedMatrixClient({ client }, async (resolved) => {
		const resolvedRoom = await resolveMatrixRoomId(resolved, roomId);
		await resolved.sendReadReceipt(resolvedRoom, eventId.trim());
	});
}
async function reactMatrixMessage(roomId, messageId, emoji, opts) {
	const clientOpts = normalizeMatrixClientResolveOpts(opts);
	await withResolvedMatrixClient({
		client: clientOpts.client,
		cfg: clientOpts.cfg,
		timeoutMs: clientOpts.timeoutMs,
		accountId: clientOpts.accountId ?? void 0
	}, async (resolved) => {
		const resolvedRoom = await resolveMatrixRoomId(resolved, roomId);
		const reaction = buildMatrixReactionContent(messageId, emoji);
		await resolved.sendEvent(resolvedRoom, EventType.Reaction, reaction);
	});
}
//#endregion
export { resolveMatrixConfigFieldPath as $, normalizeMatrixMessagingTarget as A, resolveSharedMatrixClient as B, isPollStartType as C, withResolvedRuntimeMatrixClient as D, resolvePollReferenceEventId as E, resolveConfiguredMatrixBotUserIds as F, resolveMatrixEnvAuthReadiness as G, resolveMatrixStoragePaths as H, resolveDefaultMatrixAccountId as I, MatrixAuthedHttpClient as J, resolveValidatedMatrixHomeserverUrl as K, resolveMatrixAccount as L, resolveMatrixDirectUserId as M, resolveMatrixTargetIdentity as N, setActiveMatrixClient as O, listMatrixAccountIds as P, resolveMatrixRoomKeyBackupIssue as Q, resolveMatrixAccountConfig as R, isPollEventType as S, parsePollStartContent as T, resolveMatrixAuth as U, createMatrixClient as V, resolveMatrixAuthContext as W, setMatrixSdkLogMode as X, setMatrixSdkConsoleLogging as Y, LogService as Z, summarizeMatrixReactionEvents as _, sendTypingMatrix as a, formatPollAsText as b, repairMatrixDirectRooms as c, readJoinedMatrixMembers as d, resolveMatrixConfigPath as et, MATRIX_ANNOTATION_RELATION_TYPE as f, selectOwnMatrixReactionEventIds as g, extractMatrixReactionAnnotation as h, sendReadReceiptMatrix as i, normalizeMatrixResolvableTarget as j, isMatrixQualifiedUserId as k, isStrictDirectMembership as l, buildMatrixReactionRelationsPath as m, sendMessageMatrix as n, isBunRuntime as nt, resolveMatrixRoomId as o, MATRIX_REACTION_EVENT_TYPE as p, validateMatrixHomeserverUrl as q, sendPollMatrix as r, hasExplicitMatrixAccountConfig as rt, inspectMatrixDirectRooms as s, reactMatrixMessage as t, updateMatrixAccountConfig as tt, isStrictDirectRoom as u, buildPollResponseContent as v, parsePollStart as w, formatPollResultsAsText as x, buildPollResultsSummary as y, releaseSharedClientInstance as z };
