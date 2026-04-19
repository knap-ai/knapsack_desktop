import { t as formatMatrixErrorMessage } from "./errors-DxFYl2Z6.js";
import { n as LogService, r as noop } from "./logger-C5fFucd6.js";
import { i as MATRIX_IDB_SNAPSHOT_LOCK_OPTIONS, n as isRepairableSecretStorageAccessError } from "./recovery-key-store-Don3cuud.js";
import { withFileLock } from "openclaw/plugin-sdk/infra-runtime";
import fs from "node:fs";
import path from "node:path";
import { MatrixEventEvent } from "matrix-js-sdk/lib/matrix.js";
import { VerificationMethod } from "matrix-js-sdk/lib/types.js";
import "fake-indexeddb/auto";
import { CryptoEvent } from "matrix-js-sdk/lib/crypto-api/CryptoEvent.js";
import { indexedDB } from "fake-indexeddb";
import { VerificationPhase, VerificationRequestEvent, VerifierEvent } from "matrix-js-sdk/lib/crypto-api/verification.js";
//#region extensions/matrix/src/matrix/sdk/verification-status.ts
function isMatrixDeviceLocallyVerified(status) {
	return status?.localVerified === true;
}
function isMatrixDeviceOwnerVerified(status) {
	return status?.crossSigningVerified === true || status?.signedByOwner === true;
}
function isMatrixDeviceVerifiedInCurrentClient(status) {
	return status?.isVerified?.() === true || isMatrixDeviceLocallyVerified(status) || isMatrixDeviceOwnerVerified(status);
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
		const deferSecretStorageBootstrapUntilAfterCrossSigning = options.forceResetCrossSigning === true;
		this.registerVerificationRequestHandler(crypto);
		if (!deferSecretStorageBootstrapUntilAfterCrossSigning) await this.bootstrapSecretStorage(crypto, {
			strict,
			allowSecretStorageRecreateWithoutRecoveryKey: options.allowSecretStorageRecreateWithoutRecoveryKey === true
		});
		let crossSigning = await this.bootstrapCrossSigning(crypto, {
			forceResetCrossSigning: options.forceResetCrossSigning === true,
			allowAutomaticCrossSigningReset: options.allowAutomaticCrossSigningReset !== false,
			allowSecretStorageRecreateWithoutRecoveryKey: options.allowSecretStorageRecreateWithoutRecoveryKey === true,
			strict
		});
		await this.bootstrapSecretStorage(crypto, {
			strict,
			allowSecretStorageRecreateWithoutRecoveryKey: options.allowSecretStorageRecreateWithoutRecoveryKey === true
		});
		if (deferSecretStorageBootstrapUntilAfterCrossSigning) crossSigning = await this.bootstrapCrossSigning(crypto, {
			forceResetCrossSigning: false,
			allowAutomaticCrossSigningReset: false,
			allowSecretStorageRecreateWithoutRecoveryKey: options.allowSecretStorageRecreateWithoutRecoveryKey === true,
			strict
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
			const resetCrossSigning = async () => {
				await crypto.bootstrapCrossSigning({
					setupNewCrossSigning: true,
					authUploadDeviceSigningKeys
				});
			};
			try {
				await resetCrossSigning();
			} catch (err) {
				if (options.allowSecretStorageRecreateWithoutRecoveryKey && isRepairableSecretStorageAccessError(err)) {
					LogService.warn("MatrixClientLite", "Forced cross-signing reset could not unlock secret storage; recreating secret storage and retrying.");
					try {
						await this.deps.recoveryKeyStore.bootstrapSecretStorageWithRecoveryKey(crypto, {
							allowSecretStorageRecreateWithoutRecoveryKey: true,
							forceNewSecretStorage: true
						});
						await resetCrossSigning();
					} catch (repairErr) {
						LogService.warn("MatrixClientLite", "Forced cross-signing reset failed:", repairErr);
						if (options.strict) throw repairErr instanceof Error ? repairErr : new Error(String(repairErr));
						return {
							ready: false,
							published: false
						};
					}
					return await finalize();
				}
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
	matrixCryptoNodeRuntimePromise ??= import("./crypto-node.runtime-D0MQ8kIG.js");
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
		req.addEventListener("success", () => resolve(req.result), { once: true });
		req.addEventListener("error", () => reject(req.error), { once: true });
	});
}
async function dumpIndexedDatabases(databasePrefix) {
	const idb = indexedDB;
	const dbList = await idb.databases();
	const snapshot = [];
	const expectedPrefix = databasePrefix ? `${databasePrefix}::` : null;
	for (const { name, version } of dbList) {
		if (!name || !version) continue;
		if (expectedPrefix && !name.startsWith(expectedPrefix)) continue;
		const db = await new Promise((resolve, reject) => {
			const r = idb.open(name, version);
			r.addEventListener("success", () => resolve(r.result), { once: true });
			r.addEventListener("error", () => reject(r.error), { once: true });
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
	const idb = indexedDB;
	for (const dbSnap of snapshot) await new Promise((resolve, reject) => {
		const r = idb.open(dbSnap.name, dbSnap.version);
		r.addEventListener("upgradeneeded", () => {
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
		});
		r.addEventListener("success", () => {
			(async () => {
				const db = r.result;
				for (const storeSnap of dbSnap.stores) {
					if (storeSnap.records.length === 0) continue;
					const tx = db.transaction(storeSnap.name, "readwrite");
					const store = tx.objectStore(storeSnap.name);
					for (const rec of storeSnap.records) if (storeSnap.keyPath !== null) store.put(rec.value);
					else store.put(rec.value, rec.key);
					await new Promise((res) => {
						tx.addEventListener("complete", () => res(), { once: true });
					});
				}
				db.close();
				resolve();
			})().catch(reject);
		}, { once: true });
		r.addEventListener("error", () => reject(r.error), { once: true });
	});
}
function resolveDefaultIdbSnapshotPath() {
	const stateDir = process.env.OPENCLAW_STATE_DIR || path.join(process.env.HOME || "/tmp", ".openclaw");
	return path.join(stateDir, "matrix", "crypto-idb-snapshot.json");
}
async function restoreIdbFromDisk(snapshotPath) {
	const candidatePaths = snapshotPath ? [snapshotPath] : [resolveDefaultIdbSnapshotPath()];
	for (const resolvedPath of candidatePaths) try {
		if (await withFileLock(resolvedPath, MATRIX_IDB_SNAPSHOT_LOCK_OPTIONS, async () => {
			const snapshot = parseSnapshotPayload(fs.readFileSync(resolvedPath, "utf8"));
			if (!snapshot) return false;
			await restoreIndexedDatabases(snapshot);
			LogService.info("IdbPersistence", `Restored ${snapshot.length} IndexedDB database(s) from ${resolvedPath}`);
			return true;
		})) return true;
	} catch (err) {
		LogService.warn("IdbPersistence", `Failed to restore IndexedDB snapshot from ${resolvedPath}:`, err);
		continue;
	}
	return false;
}
async function persistIdbToDisk(params) {
	const snapshotPath = params?.snapshotPath ?? resolveDefaultIdbSnapshotPath();
	try {
		fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
		const persistedCount = await withFileLock(snapshotPath, MATRIX_IDB_SNAPSHOT_LOCK_OPTIONS, async () => {
			const snapshot = await dumpIndexedDatabases(params?.databasePrefix);
			if (snapshot.length === 0) return 0;
			fs.writeFileSync(snapshotPath, JSON.stringify(snapshot));
			fs.chmodSync(snapshotPath, 384);
			return snapshot.length;
		});
		if (persistedCount === 0) return;
		LogService.debug("IdbPersistence", `Persisted ${persistedCount} IndexedDB database(s) to ${snapshotPath}`);
	} catch (err) {
		LogService.warn("IdbPersistence", "Failed to persist IndexedDB snapshot:", err);
	}
}
//#endregion
//#region extensions/matrix/src/matrix/sdk/verification-manager.ts
const MATRIX_VERIFICATION_PHASES = new Set([
	-1,
	VerificationPhase.Unsent,
	VerificationPhase.Requested,
	VerificationPhase.Ready,
	VerificationPhase.Started,
	VerificationPhase.Cancelled,
	VerificationPhase.Done
]);
function isMatrixVerificationPhase(value) {
	return typeof value === "number" && MATRIX_VERIFICATION_PHASES.has(value);
}
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
	readVerificationPhase(request, fallback) {
		const phase = this.readRequestValue(request, () => request.phase, fallback);
		return isMatrixVerificationPhase(phase) ? phase : fallback;
	}
	pruneVerificationSessions(nowMs) {
		for (const [id, session] of this.verificationSessions) {
			const phase = this.readVerificationPhase(session.request, -1);
			if ((phase === VerificationPhase.Done || phase === VerificationPhase.Cancelled) && nowMs - session.updatedAtMs > TERMINAL_SESSION_RETENTION_MS) this.verificationSessions.delete(id);
		}
		if (this.verificationSessions.size <= MAX_TRACKED_VERIFICATION_SESSIONS) return;
		const sortedByAge = Array.from(this.verificationSessions.entries()).toSorted((a, b) => a[1].updatedAtMs - b[1].updatedAtMs);
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
		const phase = this.readVerificationPhase(request, VerificationPhase.Requested);
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
		const phase = this.readVerificationPhase(request, VerificationPhase.Requested);
		const accepting = this.readRequestValue(request, () => request.accepting, false);
		const declining = this.readRequestValue(request, () => request.declining, false);
		if (isSelfVerification || initiatedByMe) return;
		if (phase !== VerificationPhase.Requested || accepting || declining) return;
		session.acceptRequested = true;
		request.accept().then(() => {
			this.touchVerificationSession(session);
		}).catch((err) => {
			session.acceptRequested = false;
			session.error = formatMatrixErrorMessage(err);
			this.touchVerificationSession(session);
		});
	}
	maybeAutoStartInboundSas(session) {
		if (session.activeVerifier || session.verifyStarted || session.startRequested) return;
		if (this.readRequestValue(session.request, () => session.request.initiatedByMe, true)) return;
		if (!this.readRequestValue(session.request, () => session.request.isSelfVerification, false)) return;
		const phase = this.readVerificationPhase(session.request, VerificationPhase.Requested);
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
			session.error = formatMatrixErrorMessage(err);
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
			if (this.readVerificationPhase(session.request, VerificationPhase.Requested) >= VerificationPhase.Cancelled) return;
			session.sasAutoConfirmStarted = true;
			callbacks.confirm().then(() => {
				this.touchVerificationSession(session);
			}).catch((err) => {
				session.error = formatMatrixErrorMessage(err);
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
			session.error = formatMatrixErrorMessage(err);
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
		return Array.from(this.verificationSessions.values()).map((session) => this.buildVerificationSummary(session)).toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt));
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
export { MatrixCryptoBootstrapper, MatrixDecryptBridge, MatrixVerificationManager, createMatrixCryptoFacade, isMatrixDeviceOwnerVerified, isMatrixDeviceVerifiedInCurrentClient, persistIdbToDisk, restoreIdbFromDisk };
