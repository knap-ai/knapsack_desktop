import { n as LogService } from "./logger-a6JNXTRe.js";
import fsSync from "node:fs";
import path from "node:path";
import { decodeRecoveryKey } from "matrix-js-sdk/lib/crypto-api/recovery-key.js";
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
	resolveEncodedRecoveryKeyInput(params) {
		const encodedPrivateKey = params.encodedPrivateKey.trim();
		if (!encodedPrivateKey) throw new Error("Matrix recovery key is required");
		let privateKey;
		try {
			privateKey = decodeRecoveryKey(encodedPrivateKey);
		} catch (err) {
			throw new Error(`Invalid Matrix recovery key: ${err instanceof Error ? err.message : String(err)}`);
		}
		const keyId = typeof params.keyId === "string" && params.keyId.trim() ? params.keyId.trim() : null;
		return {
			encodedPrivateKey,
			privateKey,
			keyId,
			keyInfo: params.keyInfo ?? this.loadStoredRecoveryKey()?.keyInfo
		};
	}
	storeEncodedRecoveryKey(params) {
		const prepared = this.resolveEncodedRecoveryKeyInput(params);
		this.saveRecoveryKeyToDisk({
			keyId: prepared.keyId,
			keyInfo: prepared.keyInfo,
			privateKey: prepared.privateKey,
			encodedPrivateKey: prepared.encodedPrivateKey
		});
		if (prepared.keyId) this.rememberSecretStorageKey(prepared.keyId, prepared.privateKey, prepared.keyInfo);
		return this.getRecoveryKeySummary() ?? {};
	}
	stageEncodedRecoveryKey(params) {
		const prepared = this.resolveEncodedRecoveryKeyInput(params);
		this.discardStagedRecoveryKey();
		this.stagedRecoveryKey = {
			version: 1,
			createdAt: (/* @__PURE__ */ new Date()).toISOString(),
			keyId: prepared.keyId,
			encodedPrivateKey: prepared.encodedPrivateKey,
			privateKeyBase64: Buffer.from(prepared.privateKey).toString("base64"),
			keyInfo: prepared.keyInfo
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
			if (!fsSync.existsSync(this.recoveryKeyPath)) return null;
			const raw = fsSync.readFileSync(this.recoveryKeyPath, "utf8");
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
			fsSync.mkdirSync(path.dirname(this.recoveryKeyPath), { recursive: true });
			fsSync.writeFileSync(this.recoveryKeyPath, JSON.stringify(payload, null, 2), "utf8");
			fsSync.chmodSync(this.recoveryKeyPath, 384);
		} catch (err) {
			LogService.warn("MatrixClientLite", "Failed to persist recovery key:", err);
		}
	}
};
//#endregion
export { isRepairableSecretStorageAccessError as n, MatrixRecoveryKeyStore as t };
