import { t as runtime_api_exports } from "./runtime-api.js";
import { safeParseJsonWithSchema } from "openclaw/plugin-sdk/extension-shared";
import { AllowFromListSchema, DmPolicySchema, MarkdownConfigSchema, buildChannelConfigSchema } from "openclaw/plugin-sdk/channel-config-primitives";
import { buildSecretInputSchema, hasConfiguredSecretInput, normalizeSecretInputString } from "openclaw/plugin-sdk/secret-input";
import { z } from "openclaw/plugin-sdk/zod";
import { SimplePool, finalizeEvent, getPublicKey, nip19, verifyEvent } from "nostr-tools";
import { decrypt, encrypt } from "nostr-tools/nip04";
import { normalizeLowercaseStringOrEmpty, normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { formatErrorMessage } from "openclaw/plugin-sdk/error-runtime";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { z as z$1 } from "zod";
import { createPluginRuntimeStore } from "openclaw/plugin-sdk/runtime-store";
import { DEFAULT_ACCOUNT_ID, normalizeAccountId, normalizeOptionalAccountId } from "openclaw/plugin-sdk/account-id";
import { listCombinedAccountIds, resolveListedDefaultAccountId } from "openclaw/plugin-sdk/account-resolution";
import { DEFAULT_ACCOUNT_ID as DEFAULT_ACCOUNT_ID$1 } from "openclaw/plugin-sdk/routing";
import { createStandardChannelSetupStatus, createTopLevelChannelDmPolicy, createTopLevelChannelParsedAllowFromPrompt, formatDocsLink, mergeAllowFromEntries, parseSetupEntriesWithParser, patchTopLevelChannelConfigSection, splitSetupEntries } from "openclaw/plugin-sdk/setup";
//#region extensions/nostr/src/config-schema.ts
/**
* Validates https:// URLs only (no javascript:, data:, file:, etc.)
*/
const safeUrlSchema = z.string().url().refine((url) => {
	try {
		return new URL(url).protocol === "https:";
	} catch {
		return false;
	}
}, { message: "URL must use https:// protocol" });
/**
* NIP-01 profile metadata schema
* https://github.com/nostr-protocol/nips/blob/master/01.md
*/
const NostrProfileSchema = z.object({
	name: z.string().max(256).optional(),
	displayName: z.string().max(256).optional(),
	about: z.string().max(2e3).optional(),
	picture: safeUrlSchema.optional(),
	banner: safeUrlSchema.optional(),
	website: safeUrlSchema.optional(),
	nip05: z.string().optional(),
	lud16: z.string().optional()
});
/**
* Zod schema for channels.nostr.* configuration
*/
const NostrConfigSchema = z.object({
	name: z.string().optional(),
	defaultAccount: z.string().optional(),
	enabled: z.boolean().optional(),
	markdown: MarkdownConfigSchema,
	privateKey: buildSecretInputSchema().optional(),
	relays: z.array(z.string()).optional(),
	dmPolicy: DmPolicySchema.optional(),
	allowFrom: AllowFromListSchema,
	profile: NostrProfileSchema.optional()
});
buildChannelConfigSchema(NostrConfigSchema);
//#endregion
//#region extensions/nostr/src/default-relays.ts
const DEFAULT_RELAYS = ["wss://relay.damus.io", "wss://nos.lol"];
//#endregion
//#region extensions/nostr/src/metrics.ts
/**
* Create a metrics collector instance.
* Optionally pass an onMetric callback to receive real-time metric events.
*/
function createMetrics(onMetric) {
	let eventsReceived = 0;
	let eventsProcessed = 0;
	let eventsDuplicate = 0;
	const eventsRejected = {
		invalidShape: 0,
		wrongKind: 0,
		stale: 0,
		future: 0,
		rateLimited: 0,
		invalidSignature: 0,
		oversizedCiphertext: 0,
		oversizedPlaintext: 0,
		decryptFailed: 0,
		selfMessage: 0
	};
	const relays = /* @__PURE__ */ new Map();
	const rateLimiting = {
		perSenderHits: 0,
		globalHits: 0
	};
	const decrypt = {
		success: 0,
		failure: 0
	};
	const memory = {
		seenTrackerSize: 0,
		rateLimiterEntries: 0
	};
	function getOrCreateRelay(url) {
		let relay = relays.get(url);
		if (!relay) {
			relay = {
				connects: 0,
				disconnects: 0,
				reconnects: 0,
				errors: 0,
				messagesReceived: {
					event: 0,
					eose: 0,
					closed: 0,
					notice: 0,
					ok: 0,
					auth: 0
				},
				circuitBreakerState: "closed",
				circuitBreakerOpens: 0,
				circuitBreakerCloses: 0
			};
			relays.set(url, relay);
		}
		return relay;
	}
	function emit(name, value = 1, labels) {
		if (onMetric) onMetric({
			name,
			value,
			timestamp: Date.now(),
			labels
		});
		const relayUrl = labels?.relay;
		switch (name) {
			case "event.received":
				eventsReceived += value;
				break;
			case "event.processed":
				eventsProcessed += value;
				break;
			case "event.duplicate":
				eventsDuplicate += value;
				break;
			case "event.rejected.invalid_shape":
				eventsRejected.invalidShape += value;
				break;
			case "event.rejected.wrong_kind":
				eventsRejected.wrongKind += value;
				break;
			case "event.rejected.stale":
				eventsRejected.stale += value;
				break;
			case "event.rejected.future":
				eventsRejected.future += value;
				break;
			case "event.rejected.rate_limited":
				eventsRejected.rateLimited += value;
				break;
			case "event.rejected.invalid_signature":
				eventsRejected.invalidSignature += value;
				break;
			case "event.rejected.oversized_ciphertext":
				eventsRejected.oversizedCiphertext += value;
				break;
			case "event.rejected.oversized_plaintext":
				eventsRejected.oversizedPlaintext += value;
				break;
			case "event.rejected.decrypt_failed":
				eventsRejected.decryptFailed += value;
				break;
			case "event.rejected.self_message":
				eventsRejected.selfMessage += value;
				break;
			case "relay.connect":
				if (relayUrl) getOrCreateRelay(relayUrl).connects += value;
				break;
			case "relay.disconnect":
				if (relayUrl) getOrCreateRelay(relayUrl).disconnects += value;
				break;
			case "relay.reconnect":
				if (relayUrl) getOrCreateRelay(relayUrl).reconnects += value;
				break;
			case "relay.error":
				if (relayUrl) getOrCreateRelay(relayUrl).errors += value;
				break;
			case "relay.message.event":
				if (relayUrl) getOrCreateRelay(relayUrl).messagesReceived.event += value;
				break;
			case "relay.message.eose":
				if (relayUrl) getOrCreateRelay(relayUrl).messagesReceived.eose += value;
				break;
			case "relay.message.closed":
				if (relayUrl) getOrCreateRelay(relayUrl).messagesReceived.closed += value;
				break;
			case "relay.message.notice":
				if (relayUrl) getOrCreateRelay(relayUrl).messagesReceived.notice += value;
				break;
			case "relay.message.ok":
				if (relayUrl) getOrCreateRelay(relayUrl).messagesReceived.ok += value;
				break;
			case "relay.message.auth":
				if (relayUrl) getOrCreateRelay(relayUrl).messagesReceived.auth += value;
				break;
			case "relay.circuit_breaker.open":
				if (relayUrl) {
					const r = getOrCreateRelay(relayUrl);
					r.circuitBreakerState = "open";
					r.circuitBreakerOpens += value;
				}
				break;
			case "relay.circuit_breaker.close":
				if (relayUrl) {
					const r = getOrCreateRelay(relayUrl);
					r.circuitBreakerState = "closed";
					r.circuitBreakerCloses += value;
				}
				break;
			case "relay.circuit_breaker.half_open":
				if (relayUrl) getOrCreateRelay(relayUrl).circuitBreakerState = "half_open";
				break;
			case "rate_limit.per_sender":
				rateLimiting.perSenderHits += value;
				break;
			case "rate_limit.global":
				rateLimiting.globalHits += value;
				break;
			case "decrypt.success":
				decrypt.success += value;
				break;
			case "decrypt.failure":
				decrypt.failure += value;
				break;
			case "memory.seen_tracker_size":
				memory.seenTrackerSize = value;
				break;
			case "memory.rate_limiter_entries":
				memory.rateLimiterEntries = value;
				break;
		}
	}
	function getSnapshot() {
		const relaysObj = {};
		for (const [url, stats] of relays) relaysObj[url] = {
			...stats,
			messagesReceived: { ...stats.messagesReceived }
		};
		return {
			eventsReceived,
			eventsProcessed,
			eventsDuplicate,
			eventsRejected: { ...eventsRejected },
			relays: relaysObj,
			rateLimiting: { ...rateLimiting },
			decrypt: { ...decrypt },
			memory: { ...memory },
			snapshotAt: Date.now()
		};
	}
	function reset() {
		eventsReceived = 0;
		eventsProcessed = 0;
		eventsDuplicate = 0;
		Object.assign(eventsRejected, {
			invalidShape: 0,
			wrongKind: 0,
			stale: 0,
			future: 0,
			rateLimited: 0,
			invalidSignature: 0,
			oversizedCiphertext: 0,
			oversizedPlaintext: 0,
			decryptFailed: 0,
			selfMessage: 0
		});
		relays.clear();
		rateLimiting.perSenderHits = 0;
		rateLimiting.globalHits = 0;
		decrypt.success = 0;
		decrypt.failure = 0;
		memory.seenTrackerSize = 0;
		memory.rateLimiterEntries = 0;
	}
	return {
		emit,
		getSnapshot,
		reset
	};
}
/**
* Create a no-op metrics instance (for when metrics are disabled).
*/
function createNoopMetrics() {
	const emptySnapshot = {
		eventsReceived: 0,
		eventsProcessed: 0,
		eventsDuplicate: 0,
		eventsRejected: {
			invalidShape: 0,
			wrongKind: 0,
			stale: 0,
			future: 0,
			rateLimited: 0,
			invalidSignature: 0,
			oversizedCiphertext: 0,
			oversizedPlaintext: 0,
			decryptFailed: 0,
			selfMessage: 0
		},
		relays: {},
		rateLimiting: {
			perSenderHits: 0,
			globalHits: 0
		},
		decrypt: {
			success: 0,
			failure: 0
		},
		memory: {
			seenTrackerSize: 0,
			rateLimiterEntries: 0
		},
		snapshotAt: 0
	};
	return {
		emit: () => {},
		getSnapshot: () => ({
			...emptySnapshot,
			snapshotAt: Date.now()
		}),
		reset: () => {}
	};
}
//#endregion
//#region extensions/nostr/src/nostr-profile.ts
/**
* Nostr Profile Management (NIP-01 kind:0)
*
* Profile events are "replaceable" - the latest created_at wins.
* This module handles profile event creation and publishing.
*/
/**
* Convert our config profile schema to NIP-01 content format.
* Strips undefined fields and validates URLs.
*/
function profileToContent(profile) {
	const validated = NostrProfileSchema.parse(profile);
	const content = {};
	if (validated.name !== void 0) content.name = validated.name;
	if (validated.displayName !== void 0) content.display_name = validated.displayName;
	if (validated.about !== void 0) content.about = validated.about;
	if (validated.picture !== void 0) content.picture = validated.picture;
	if (validated.banner !== void 0) content.banner = validated.banner;
	if (validated.website !== void 0) content.website = validated.website;
	if (validated.nip05 !== void 0) content.nip05 = validated.nip05;
	if (validated.lud16 !== void 0) content.lud16 = validated.lud16;
	return content;
}
/**
* Convert NIP-01 content format back to our config profile schema.
* Useful for importing existing profiles from relays.
*/
function contentToProfile(content) {
	const profile = {};
	if (content.name !== void 0) profile.name = content.name;
	if (content.display_name !== void 0) profile.displayName = content.display_name;
	if (content.about !== void 0) profile.about = content.about;
	if (content.picture !== void 0) profile.picture = content.picture;
	if (content.banner !== void 0) profile.banner = content.banner;
	if (content.website !== void 0) profile.website = content.website;
	if (content.nip05 !== void 0) profile.nip05 = content.nip05;
	if (content.lud16 !== void 0) profile.lud16 = content.lud16;
	return profile;
}
/**
* Create a signed kind:0 profile event.
*
* @param sk - Private key as Uint8Array (32 bytes)
* @param profile - Profile data to include
* @param lastPublishedAt - Previous profile timestamp (for monotonic guarantee)
* @returns Signed Nostr event
*/
function createProfileEvent(sk, profile, lastPublishedAt) {
	const content = profileToContent(profile);
	const contentJson = JSON.stringify(content);
	const now = Math.floor(Date.now() / 1e3);
	return finalizeEvent({
		kind: 0,
		content: contentJson,
		tags: [],
		created_at: lastPublishedAt !== void 0 ? Math.max(now, lastPublishedAt + 1) : now
	}, sk);
}
/** Per-relay publish timeout (ms) */
const RELAY_PUBLISH_TIMEOUT_MS = 5e3;
/**
* Publish a profile event to multiple relays.
*
* Best-effort: publishes to all relays in parallel, reports per-relay results.
* Does NOT retry automatically - caller should handle retries if needed.
*
* @param pool - SimplePool instance for relay connections
* @param relays - Array of relay WebSocket URLs
* @param event - Signed profile event (kind:0)
* @returns Publish results with successes and failures
*/
async function publishProfileEvent(pool, relays, event) {
	const successes = [];
	const failures = [];
	const publishPromises = relays.map(async (relay) => {
		try {
			const timeoutPromise = new Promise((_, reject) => {
				setTimeout(() => reject(/* @__PURE__ */ new Error("timeout")), RELAY_PUBLISH_TIMEOUT_MS);
			});
			await Promise.race([...pool.publish([relay], event), timeoutPromise]);
			successes.push(relay);
		} catch (err) {
			const errorMessage = formatErrorMessage(err);
			failures.push({
				relay,
				error: errorMessage
			});
		}
	});
	await Promise.all(publishPromises);
	return {
		eventId: event.id,
		successes,
		failures,
		createdAt: event.created_at
	};
}
/**
* Create and publish a profile event in one call.
*
* @param pool - SimplePool instance
* @param sk - Private key as Uint8Array
* @param relays - Array of relay URLs
* @param profile - Profile data
* @param lastPublishedAt - Previous timestamp for monotonic ordering
* @returns Publish results
*/
async function publishProfile(pool, sk, relays, profile, lastPublishedAt) {
	return publishProfileEvent(pool, relays, createProfileEvent(sk, profile, lastPublishedAt));
}
//#endregion
//#region extensions/nostr/src/runtime.ts
const { setRuntime: setNostrRuntime, getRuntime: getNostrRuntime } = createPluginRuntimeStore({
	pluginId: "nostr",
	errorMessage: "Nostr runtime not initialized"
});
//#endregion
//#region extensions/nostr/src/nostr-state-store.ts
const STORE_VERSION = 2;
const PROFILE_STATE_VERSION = 1;
const NullableFiniteNumberSchema = z$1.number().finite().nullable().catch(null);
const NostrBusStateV1Schema = z$1.object({
	version: z$1.literal(1),
	lastProcessedAt: NullableFiniteNumberSchema,
	gatewayStartedAt: NullableFiniteNumberSchema
});
const NostrBusStateSchema = z$1.object({
	version: z$1.literal(2),
	lastProcessedAt: NullableFiniteNumberSchema,
	gatewayStartedAt: NullableFiniteNumberSchema,
	recentEventIds: z$1.array(z$1.unknown()).catch([]).transform((ids) => ids.filter((id) => typeof id === "string"))
});
const NostrProfileStateSchema = z$1.object({
	version: z$1.literal(1),
	lastPublishedAt: NullableFiniteNumberSchema,
	lastPublishedEventId: z$1.string().nullable().catch(null),
	lastPublishResults: z$1.record(z$1.string(), z$1.enum([
		"ok",
		"failed",
		"timeout"
	])).nullable().catch(null)
});
function normalizeAccountId$1(accountId) {
	const trimmed = accountId?.trim();
	if (!trimmed) return "default";
	return trimmed.replace(/[^a-z0-9._-]+/gi, "_");
}
function resolveNostrStatePath(accountId, env = process.env) {
	const stateDir = getNostrRuntime().state.resolveStateDir(env, os.homedir);
	const normalized = normalizeAccountId$1(accountId);
	return path.join(stateDir, "nostr", `bus-state-${normalized}.json`);
}
function resolveNostrProfileStatePath(accountId, env = process.env) {
	const stateDir = getNostrRuntime().state.resolveStateDir(env, os.homedir);
	const normalized = normalizeAccountId$1(accountId);
	return path.join(stateDir, "nostr", `profile-state-${normalized}.json`);
}
function safeParseState(raw) {
	const parsedV2 = safeParseJsonWithSchema(NostrBusStateSchema, raw);
	if (parsedV2) return parsedV2;
	const parsedV1 = safeParseJsonWithSchema(NostrBusStateV1Schema, raw);
	if (!parsedV1) return null;
	return {
		version: 2,
		lastProcessedAt: parsedV1.lastProcessedAt,
		gatewayStartedAt: parsedV1.gatewayStartedAt,
		recentEventIds: []
	};
}
async function readNostrBusState(params) {
	const filePath = resolveNostrStatePath(params.accountId, params.env);
	try {
		return safeParseState(await fs.readFile(filePath, "utf-8"));
	} catch (err) {
		if (err.code === "ENOENT") return null;
		return null;
	}
}
async function writeNostrBusState(params) {
	const filePath = resolveNostrStatePath(params.accountId, params.env);
	const dir = path.dirname(filePath);
	await fs.mkdir(dir, {
		recursive: true,
		mode: 448
	});
	const tmp = path.join(dir, `${path.basename(filePath)}.${crypto.randomUUID()}.tmp`);
	const payload = {
		version: STORE_VERSION,
		lastProcessedAt: params.lastProcessedAt,
		gatewayStartedAt: params.gatewayStartedAt,
		recentEventIds: (params.recentEventIds ?? []).filter((x) => typeof x === "string")
	};
	await fs.writeFile(tmp, `${JSON.stringify(payload, null, 2)}\n`, { encoding: "utf-8" });
	await fs.chmod(tmp, 384);
	await fs.rename(tmp, filePath);
}
/**
* Determine the `since` timestamp for subscription.
* Returns the later of: lastProcessedAt or gatewayStartedAt (both from disk),
* falling back to `now` for fresh starts.
*/
function computeSinceTimestamp(state, nowSec = Math.floor(Date.now() / 1e3)) {
	if (!state) return nowSec;
	const candidates = [state.lastProcessedAt, state.gatewayStartedAt].filter((t) => t !== null && t > 0);
	if (candidates.length === 0) return nowSec;
	return Math.max(...candidates);
}
function safeParseProfileState(raw) {
	return safeParseJsonWithSchema(NostrProfileStateSchema, raw);
}
async function readNostrProfileState(params) {
	const filePath = resolveNostrProfileStatePath(params.accountId, params.env);
	try {
		return safeParseProfileState(await fs.readFile(filePath, "utf-8"));
	} catch (err) {
		if (err.code === "ENOENT") return null;
		return null;
	}
}
async function writeNostrProfileState(params) {
	const filePath = resolveNostrProfileStatePath(params.accountId, params.env);
	const dir = path.dirname(filePath);
	await fs.mkdir(dir, {
		recursive: true,
		mode: 448
	});
	const tmp = path.join(dir, `${path.basename(filePath)}.${crypto.randomUUID()}.tmp`);
	const payload = {
		version: PROFILE_STATE_VERSION,
		lastPublishedAt: params.lastPublishedAt,
		lastPublishedEventId: params.lastPublishedEventId,
		lastPublishResults: params.lastPublishResults
	};
	await fs.writeFile(tmp, `${JSON.stringify(payload, null, 2)}\n`, { encoding: "utf-8" });
	await fs.chmod(tmp, 384);
	await fs.rename(tmp, filePath);
}
//#endregion
//#region extensions/nostr/src/seen-tracker.ts
/**
* Create a new seen tracker with LRU eviction and TTL expiration.
*/
function createSeenTracker(options) {
	const maxEntries = options?.maxEntries ?? 1e5;
	const ttlMs = options?.ttlMs ?? 3600 * 1e3;
	const pruneIntervalMs = options?.pruneIntervalMs ?? 600 * 1e3;
	const entries = /* @__PURE__ */ new Map();
	let head = null;
	let tail = null;
	function moveToFront(id) {
		const entry = entries.get(id);
		if (!entry) return;
		if (head === id) return;
		if (entry.prev) {
			const prevEntry = entries.get(entry.prev);
			if (prevEntry) prevEntry.next = entry.next;
		}
		if (entry.next) {
			const nextEntry = entries.get(entry.next);
			if (nextEntry) nextEntry.prev = entry.prev;
		}
		if (tail === id) tail = entry.prev;
		entry.prev = null;
		entry.next = head;
		if (head) {
			const headEntry = entries.get(head);
			if (headEntry) headEntry.prev = id;
		}
		head = id;
		if (!tail) tail = id;
	}
	function removeFromList(id) {
		const entry = entries.get(id);
		if (!entry) return;
		if (entry.prev) {
			const prevEntry = entries.get(entry.prev);
			if (prevEntry) prevEntry.next = entry.next;
		} else head = entry.next;
		if (entry.next) {
			const nextEntry = entries.get(entry.next);
			if (nextEntry) nextEntry.prev = entry.prev;
		} else tail = entry.prev;
	}
	function evictLRU() {
		if (!tail) return;
		const idToEvict = tail;
		removeFromList(idToEvict);
		entries.delete(idToEvict);
	}
	function insertAtFront(id, seenAt) {
		const newEntry = {
			seenAt,
			prev: null,
			next: head
		};
		if (head) {
			const headEntry = entries.get(head);
			if (headEntry) headEntry.prev = id;
		}
		entries.set(id, newEntry);
		head = id;
		if (!tail) tail = id;
	}
	function pruneExpired() {
		const now = Date.now();
		const toDelete = [];
		for (const [id, entry] of entries) if (now - entry.seenAt > ttlMs) toDelete.push(id);
		for (const id of toDelete) {
			removeFromList(id);
			entries.delete(id);
		}
	}
	let pruneTimer;
	if (pruneIntervalMs > 0) {
		pruneTimer = setInterval(pruneExpired, pruneIntervalMs);
		if (pruneTimer.unref) pruneTimer.unref();
	}
	function add(id) {
		const now = Date.now();
		const existing = entries.get(id);
		if (existing) {
			existing.seenAt = now;
			moveToFront(id);
			return;
		}
		while (entries.size >= maxEntries) evictLRU();
		insertAtFront(id, now);
	}
	function has(id) {
		const entry = entries.get(id);
		if (!entry) {
			add(id);
			return false;
		}
		if (Date.now() - entry.seenAt > ttlMs) {
			removeFromList(id);
			entries.delete(id);
			add(id);
			return false;
		}
		entry.seenAt = Date.now();
		moveToFront(id);
		return true;
	}
	function peek(id) {
		const entry = entries.get(id);
		if (!entry) return false;
		if (Date.now() - entry.seenAt > ttlMs) {
			removeFromList(id);
			entries.delete(id);
			return false;
		}
		return true;
	}
	function deleteEntry(id) {
		if (entries.has(id)) {
			removeFromList(id);
			entries.delete(id);
		}
	}
	function clear() {
		entries.clear();
		head = null;
		tail = null;
	}
	function size() {
		return entries.size;
	}
	function stop() {
		if (pruneTimer) {
			clearInterval(pruneTimer);
			pruneTimer = void 0;
		}
	}
	function seed(ids) {
		const now = Date.now();
		for (let i = ids.length - 1; i >= 0; i--) {
			const id = ids[i];
			if (!entries.has(id) && entries.size < maxEntries) insertAtFront(id, now);
		}
	}
	return {
		has,
		add,
		peek,
		delete: deleteEntry,
		clear,
		size,
		stop,
		seed
	};
}
//#endregion
//#region extensions/nostr/src/nostr-bus.ts
const STARTUP_LOOKBACK_SEC = 120;
const MAX_PERSISTED_EVENT_IDS = 5e3;
const STATE_PERSIST_DEBOUNCE_MS = 5e3;
const DEFAULT_INBOUND_GUARD_POLICY = (0, runtime_api_exports.createDirectDmPreCryptoGuardPolicy)();
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_RESET_MS = 3e4;
const HEALTH_WINDOW_MS = 6e4;
function createFixedWindowRateLimiter(params) {
	const windowMs = Math.max(1, Math.floor(params.windowMs));
	const maxRequests = Math.max(1, Math.floor(params.maxRequests));
	const maxTrackedKeys = Math.max(1, Math.floor(params.maxTrackedKeys));
	const state = /* @__PURE__ */ new Map();
	const touch = (key, value) => {
		state.delete(key);
		state.set(key, value);
	};
	const prune = (nowMs) => {
		for (const [key, entry] of state) if (nowMs - entry.windowStartMs >= windowMs) state.delete(key);
		while (state.size > maxTrackedKeys) {
			const oldest = state.keys().next().value;
			if (!oldest) break;
			state.delete(oldest);
		}
	};
	return {
		isRateLimited: (key, nowMs = Date.now()) => {
			if (!key) return false;
			prune(nowMs);
			const existing = state.get(key);
			if (!existing || nowMs - existing.windowStartMs >= windowMs) {
				touch(key, {
					count: 1,
					windowStartMs: nowMs
				});
				return false;
			}
			const nextCount = existing.count + 1;
			touch(key, {
				count: nextCount,
				windowStartMs: existing.windowStartMs
			});
			return nextCount > maxRequests;
		},
		size: () => state.size,
		clear: () => state.clear()
	};
}
function createCircuitBreaker(relay, metrics, threshold = CIRCUIT_BREAKER_THRESHOLD, resetMs = CIRCUIT_BREAKER_RESET_MS) {
	const state = {
		state: "closed",
		failures: 0,
		lastFailure: 0,
		lastSuccess: Date.now()
	};
	return {
		canAttempt() {
			if (state.state === "closed") return true;
			if (state.state === "open") {
				if (Date.now() - state.lastFailure >= resetMs) {
					state.state = "half_open";
					metrics.emit("relay.circuit_breaker.half_open", 1, { relay });
					return true;
				}
				return false;
			}
			return true;
		},
		recordSuccess() {
			if (state.state === "half_open") {
				state.state = "closed";
				state.failures = 0;
				metrics.emit("relay.circuit_breaker.close", 1, { relay });
			} else if (state.state === "closed") state.failures = 0;
			state.lastSuccess = Date.now();
		},
		recordFailure() {
			state.failures++;
			state.lastFailure = Date.now();
			if (state.state === "half_open") {
				state.state = "open";
				metrics.emit("relay.circuit_breaker.open", 1, { relay });
			} else if (state.state === "closed" && state.failures >= threshold) {
				state.state = "open";
				metrics.emit("relay.circuit_breaker.open", 1, { relay });
			}
		},
		getState() {
			return state.state;
		}
	};
}
function createRelayHealthTracker() {
	const stats = /* @__PURE__ */ new Map();
	function getOrCreate(relay) {
		let s = stats.get(relay);
		if (!s) {
			s = {
				successCount: 0,
				failureCount: 0,
				latencySum: 0,
				latencyCount: 0,
				lastSuccess: 0,
				lastFailure: 0
			};
			stats.set(relay, s);
		}
		return s;
	}
	return {
		recordSuccess(relay, latencyMs) {
			const s = getOrCreate(relay);
			s.successCount++;
			s.latencySum += latencyMs;
			s.latencyCount++;
			s.lastSuccess = Date.now();
		},
		recordFailure(relay) {
			const s = getOrCreate(relay);
			s.failureCount++;
			s.lastFailure = Date.now();
		},
		getScore(relay) {
			const s = stats.get(relay);
			if (!s) return .5;
			const total = s.successCount + s.failureCount;
			if (total === 0) return .5;
			const successRate = s.successCount / total;
			const now = Date.now();
			const recencyBonus = s.lastSuccess > s.lastFailure ? Math.max(0, 1 - (now - s.lastSuccess) / HEALTH_WINDOW_MS) * .2 : 0;
			const avgLatency = s.latencyCount > 0 ? s.latencySum / s.latencyCount : 1e3;
			const latencyPenalty = Math.min(.2, avgLatency / 1e4);
			return Math.max(0, Math.min(1, successRate + recencyBonus - latencyPenalty));
		},
		getSortedRelays(relays) {
			return [...relays].toSorted((a, b) => this.getScore(b) - this.getScore(a));
		}
	};
}
/**
* Validate and normalize a private key (accepts hex or nsec format)
*/
function validatePrivateKey(key) {
	const trimmed = key.trim();
	if (trimmed.startsWith("nsec1")) {
		const decoded = nip19.decode(trimmed);
		if (decoded.type !== "nsec") throw new Error("Invalid nsec key: wrong type");
		return decoded.data;
	}
	if (!/^[0-9a-fA-F]{64}$/.test(trimmed)) throw new Error("Private key must be 64 hex characters or nsec bech32 format");
	const bytes = new Uint8Array(32);
	for (let i = 0; i < 32; i++) bytes[i] = parseInt(trimmed.slice(i * 2, i * 2 + 2), 16);
	return bytes;
}
/**
* Get public key from private key (hex or nsec format)
*/
function getPublicKeyFromPrivate(privateKey) {
	return getPublicKey(validatePrivateKey(privateKey));
}
/**
* Start the Nostr DM bus - subscribes to NIP-04 encrypted DMs
*/
async function startNostrBus(options) {
	const { privateKey, relays = DEFAULT_RELAYS, onMessage, authorizeSender, onError, onEose, onMetric, maxSeenEntries = 1e5, seenTtlMs = 3600 * 1e3 } = options;
	const sk = validatePrivateKey(privateKey);
	const pk = getPublicKey(sk);
	const pool = new SimplePool();
	const accountId = options.accountId ?? pk.slice(0, 16);
	const gatewayStartedAt = Math.floor(Date.now() / 1e3);
	const guardPolicy = (0, runtime_api_exports.createDirectDmPreCryptoGuardPolicy)({
		...DEFAULT_INBOUND_GUARD_POLICY,
		...options.guardPolicy,
		rateLimit: {
			...DEFAULT_INBOUND_GUARD_POLICY.rateLimit,
			...options.guardPolicy?.rateLimit
		}
	});
	const metrics = onMetric ? createMetrics(onMetric) : createNoopMetrics();
	const seen = createSeenTracker({
		maxEntries: maxSeenEntries,
		ttlMs: seenTtlMs
	});
	const circuitBreakers = /* @__PURE__ */ new Map();
	const healthTracker = createRelayHealthTracker();
	for (const relay of relays) circuitBreakers.set(relay, createCircuitBreaker(relay, metrics));
	const state = await readNostrBusState({ accountId });
	const baseSince = computeSinceTimestamp(state, gatewayStartedAt);
	const since = Math.max(0, baseSince - STARTUP_LOOKBACK_SEC);
	if (state?.recentEventIds?.length) seen.seed(state.recentEventIds);
	await writeNostrBusState({
		accountId,
		lastProcessedAt: state?.lastProcessedAt ?? gatewayStartedAt,
		gatewayStartedAt,
		recentEventIds: state?.recentEventIds ?? []
	});
	let pendingWrite;
	let lastProcessedAt = state?.lastProcessedAt ?? gatewayStartedAt;
	let recentEventIds = (state?.recentEventIds ?? []).slice(-MAX_PERSISTED_EVENT_IDS);
	function scheduleStatePersist(eventCreatedAt, eventId) {
		lastProcessedAt = Math.max(lastProcessedAt, eventCreatedAt);
		recentEventIds.push(eventId);
		if (recentEventIds.length > MAX_PERSISTED_EVENT_IDS) recentEventIds = recentEventIds.slice(-MAX_PERSISTED_EVENT_IDS);
		if (pendingWrite) clearTimeout(pendingWrite);
		pendingWrite = setTimeout(() => {
			writeNostrBusState({
				accountId,
				lastProcessedAt,
				gatewayStartedAt,
				recentEventIds
			}).catch((err) => onError?.(err, "persist state"));
		}, STATE_PERSIST_DEBOUNCE_MS);
	}
	const inflight = /* @__PURE__ */ new Set();
	const perSenderRateLimiter = createFixedWindowRateLimiter({
		windowMs: guardPolicy.rateLimit.windowMs,
		maxRequests: guardPolicy.rateLimit.maxPerSenderPerWindow,
		maxTrackedKeys: guardPolicy.rateLimit.maxTrackedSenderKeys
	});
	const globalRateLimiter = createFixedWindowRateLimiter({
		windowMs: guardPolicy.rateLimit.windowMs,
		maxRequests: guardPolicy.rateLimit.maxGlobalPerWindow,
		maxTrackedKeys: 1
	});
	const updateRateLimiterSizeMetric = () => {
		metrics.emit("memory.rate_limiter_entries", perSenderRateLimiter.size() + globalRateLimiter.size());
	};
	async function handleEvent(event) {
		try {
			metrics.emit("event.received");
			if (seen.peek(event.id) || inflight.has(event.id)) {
				metrics.emit("event.duplicate");
				return;
			}
			inflight.add(event.id);
			const markSeen = () => {
				seen.add(event.id);
				metrics.emit("memory.seen_tracker_size", seen.size());
			};
			const rejectAndMarkSeen = (metric) => {
				markSeen();
				metrics.emit(metric);
			};
			if (event.pubkey === pk) {
				rejectAndMarkSeen("event.rejected.self_message");
				return;
			}
			if (event.created_at < since) {
				rejectAndMarkSeen("event.rejected.stale");
				return;
			}
			if (event.created_at > Math.floor(Date.now() / 1e3) + guardPolicy.maxFutureSkewSec) {
				metrics.emit("event.rejected.future");
				return;
			}
			if (!guardPolicy.allowedKinds.includes(event.kind)) {
				rejectAndMarkSeen("event.rejected.wrong_kind");
				return;
			}
			let targetsUs = false;
			for (const t of event.tags) if (t[0] === "p" && t[1] === pk) {
				targetsUs = true;
				break;
			}
			if (!targetsUs) {
				rejectAndMarkSeen("event.rejected.wrong_kind");
				return;
			}
			const replyTo = async (text) => {
				await sendEncryptedDm(pool, sk, event.pubkey, text, relays, metrics, circuitBreakers, healthTracker, onError);
			};
			const rejectIfGlobalRateLimited = () => {
				updateRateLimiterSizeMetric();
				if (globalRateLimiter.isRateLimited("global")) {
					metrics.emit("rate_limit.global");
					metrics.emit("event.rejected.rate_limited");
					updateRateLimiterSizeMetric();
					return true;
				}
				updateRateLimiterSizeMetric();
				return false;
			};
			const rejectIfVerifiedSenderRateLimited = () => {
				updateRateLimiterSizeMetric();
				if (perSenderRateLimiter.isRateLimited(event.pubkey)) {
					metrics.emit("rate_limit.per_sender");
					metrics.emit("event.rejected.rate_limited");
					updateRateLimiterSizeMetric();
					return true;
				}
				updateRateLimiterSizeMetric();
				return false;
			};
			if (Buffer.byteLength(event.content, "utf8") > guardPolicy.maxCiphertextBytes) {
				if (rejectIfGlobalRateLimited()) return;
				rejectAndMarkSeen("event.rejected.oversized_ciphertext");
				return;
			}
			if (rejectIfGlobalRateLimited()) return;
			if (!verifyEvent(event)) {
				rejectAndMarkSeen("event.rejected.invalid_signature");
				onError?.(/* @__PURE__ */ new Error("Invalid signature"), `event ${event.id}`);
				return;
			}
			if (rejectIfVerifiedSenderRateLimited()) return;
			if (authorizeSender) {
				if (await authorizeSender({
					senderPubkey: event.pubkey,
					reply: replyTo
				}) !== "allow") {
					markSeen();
					return;
				}
			}
			let plaintext;
			try {
				plaintext = decrypt(sk, event.pubkey, event.content);
				metrics.emit("decrypt.success");
			} catch (err) {
				markSeen();
				metrics.emit("decrypt.failure");
				metrics.emit("event.rejected.decrypt_failed");
				onError?.(err, `decrypt from ${event.pubkey}`);
				return;
			}
			if (Buffer.byteLength(plaintext, "utf8") > guardPolicy.maxPlaintextBytes) {
				markSeen();
				metrics.emit("event.rejected.oversized_plaintext");
				return;
			}
			await onMessage(event.pubkey, plaintext, replyTo, {
				eventId: event.id,
				createdAt: event.created_at
			});
			markSeen();
			metrics.emit("event.processed");
			scheduleStatePersist(event.created_at, event.id);
		} catch (err) {
			onError?.(err, `event ${event.id}`);
		} finally {
			inflight.delete(event.id);
		}
	}
	const sub = pool.subscribeMany(relays, [{
		kinds: [4],
		"#p": [pk],
		since
	}], {
		onevent: handleEvent,
		oneose: () => {
			for (const relay of relays) metrics.emit("relay.message.eose", 1, { relay });
			onEose?.(relays.join(", "));
		},
		onclose: (reason) => {
			for (const relay of relays) {
				metrics.emit("relay.message.closed", 1, { relay });
				options.onDisconnect?.(relay);
			}
			onError?.(/* @__PURE__ */ new Error(`Subscription closed: ${reason.join(", ")}`), "subscription");
		}
	});
	const sendDm = async (toPubkey, text) => {
		await sendEncryptedDm(pool, sk, toPubkey, text, relays, metrics, circuitBreakers, healthTracker, onError);
	};
	const publishProfile$1 = async (profile) => {
		const result = await publishProfile(pool, sk, relays, profile, (await readNostrProfileState({ accountId }))?.lastPublishedAt ?? void 0);
		const publishResults = {};
		for (const relay of result.successes) publishResults[relay] = "ok";
		for (const { relay, error } of result.failures) publishResults[relay] = error === "timeout" ? "timeout" : "failed";
		await writeNostrProfileState({
			accountId,
			lastPublishedAt: result.createdAt,
			lastPublishedEventId: result.eventId,
			lastPublishResults: publishResults
		});
		return result;
	};
	const getProfileState = async () => {
		const state = await readNostrProfileState({ accountId });
		return {
			lastPublishedAt: state?.lastPublishedAt ?? null,
			lastPublishedEventId: state?.lastPublishedEventId ?? null,
			lastPublishResults: state?.lastPublishResults ?? null
		};
	};
	return {
		close: () => {
			sub.close();
			seen.stop();
			perSenderRateLimiter.clear();
			globalRateLimiter.clear();
			if (pendingWrite) {
				clearTimeout(pendingWrite);
				writeNostrBusState({
					accountId,
					lastProcessedAt,
					gatewayStartedAt,
					recentEventIds
				}).catch((err) => onError?.(err, "persist state on close"));
			}
		},
		publicKey: pk,
		sendDm,
		getMetrics: () => metrics.getSnapshot(),
		publishProfile: publishProfile$1,
		getProfileState
	};
}
/**
* Send an encrypted DM to a pubkey
*/
async function sendEncryptedDm(pool, sk, toPubkey, text, relays, metrics, circuitBreakers, healthTracker, onError) {
	const reply = finalizeEvent({
		kind: 4,
		content: encrypt(sk, toPubkey, text),
		tags: [["p", toPubkey]],
		created_at: Math.floor(Date.now() / 1e3)
	}, sk);
	const sortedRelays = healthTracker.getSortedRelays(relays);
	let lastError;
	for (const relay of sortedRelays) {
		const cb = circuitBreakers.get(relay);
		if (cb && !cb.canAttempt()) continue;
		const startTime = Date.now();
		try {
			const [publishPromise] = pool.publish([relay], reply);
			if (!publishPromise) throw new Error(`Failed to create publish promise for relay ${relay}`);
			await publishPromise;
			const latency = Date.now() - startTime;
			cb?.recordSuccess();
			healthTracker.recordSuccess(relay, latency);
			return;
		} catch (err) {
			lastError = err;
			const latency = Date.now() - startTime;
			cb?.recordFailure();
			healthTracker.recordFailure(relay);
			metrics.emit("relay.error", 1, {
				relay,
				latency
			});
			onError?.(lastError, `publish to ${relay}`);
		}
	}
	throw new Error(`Failed to publish to any relay: ${lastError?.message}`);
}
/**
* Normalize a pubkey to hex format (accepts npub or hex)
*/
function normalizePubkey(input) {
	const trimmed = input.trim();
	if (trimmed.startsWith("npub1")) {
		const decoded = nip19.decode(trimmed);
		if (decoded.type !== "npub") throw new Error("Invalid npub key");
		return Array.from(decoded.data).map((b) => b.toString(16).padStart(2, "0")).join("");
	}
	if (!/^[0-9a-fA-F]{64}$/.test(trimmed)) throw new Error("Pubkey must be 64 hex characters or npub format");
	return normalizeLowercaseStringOrEmpty(trimmed);
}
//#endregion
//#region extensions/nostr/src/types.ts
function resolveConfiguredDefaultNostrAccountId(cfg) {
	const nostrCfg = cfg.channels?.nostr;
	return normalizeOptionalAccountId(nostrCfg?.defaultAccount);
}
/**
* List all configured Nostr account IDs
*/
function listNostrAccountIds(cfg) {
	const nostrCfg = cfg.channels?.nostr;
	return listCombinedAccountIds({
		configuredAccountIds: [],
		implicitAccountId: normalizeSecretInputString(nostrCfg?.privateKey) ? resolveConfiguredDefaultNostrAccountId(cfg) ?? DEFAULT_ACCOUNT_ID : void 0
	});
}
/**
* Get the default account ID
*/
function resolveDefaultNostrAccountId(cfg) {
	return resolveListedDefaultAccountId({
		accountIds: listNostrAccountIds(cfg),
		configuredDefaultAccountId: resolveConfiguredDefaultNostrAccountId(cfg)
	});
}
/**
* Resolve a Nostr account from config
*/
function resolveNostrAccount(opts) {
	const accountId = normalizeAccountId(opts.accountId ?? resolveDefaultNostrAccountId(opts.cfg));
	const nostrCfg = opts.cfg.channels?.nostr;
	const baseEnabled = nostrCfg?.enabled !== false;
	const privateKey = normalizeSecretInputString(nostrCfg?.privateKey) ?? "";
	const configured = Boolean(privateKey);
	let publicKey = "";
	if (privateKey) try {
		publicKey = getPublicKeyFromPrivate(privateKey);
	} catch {}
	return {
		accountId,
		name: normalizeOptionalString(nostrCfg?.name),
		enabled: baseEnabled,
		configured,
		privateKey,
		publicKey,
		relays: nostrCfg?.relays ?? DEFAULT_RELAYS,
		profile: nostrCfg?.profile,
		config: {
			enabled: nostrCfg?.enabled,
			name: nostrCfg?.name,
			privateKey: nostrCfg?.privateKey,
			relays: nostrCfg?.relays,
			dmPolicy: nostrCfg?.dmPolicy,
			allowFrom: nostrCfg?.allowFrom,
			profile: nostrCfg?.profile
		}
	};
}
//#endregion
//#region extensions/nostr/src/setup-surface.ts
const channel = "nostr";
const NOSTR_SETUP_HELP_LINES = [
	"Use a Nostr private key in nsec or 64-character hex format.",
	"Relay URLs are optional. Leave blank to keep the default relay set.",
	"Env vars supported: NOSTR_PRIVATE_KEY (default account only).",
	`Docs: ${formatDocsLink("/channels/nostr", "channels/nostr")}`
];
const NOSTR_ALLOW_FROM_HELP_LINES = [
	"Allowlist Nostr DMs by npub or hex pubkey.",
	"Examples:",
	"- npub1...",
	"- nostr:npub1...",
	"- 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
	"Multiple entries: comma-separated.",
	`Docs: ${formatDocsLink("/channels/nostr", "channels/nostr")}`
];
function buildNostrSetupPatch(accountId, patch) {
	return {
		...accountId !== DEFAULT_ACCOUNT_ID$1 ? { defaultAccount: accountId } : {},
		...patch
	};
}
function parseRelayUrls(raw) {
	const entries = splitSetupEntries(raw);
	const relays = [];
	for (const entry of entries) {
		try {
			const parsed = new URL(entry);
			if (parsed.protocol !== "ws:" && parsed.protocol !== "wss:") return {
				relays: [],
				error: `Relay must use ws:// or wss:// (${entry})`
			};
		} catch {
			return {
				relays: [],
				error: `Invalid relay URL: ${entry}`
			};
		}
		relays.push(entry);
	}
	return { relays: [...new Set(relays)] };
}
function parseNostrAllowFrom(raw) {
	return parseSetupEntriesWithParser(raw, (entry) => {
		const cleaned = entry.replace(/^nostr:/i, "").trim();
		try {
			return { value: normalizePubkey(cleaned) };
		} catch {
			return { error: `Invalid Nostr pubkey: ${entry}` };
		}
	});
}
const nostrDmPolicy = createTopLevelChannelDmPolicy({
	label: "Nostr",
	channel,
	policyKey: "channels.nostr.dmPolicy",
	allowFromKey: "channels.nostr.allowFrom",
	getCurrent: (cfg) => cfg.channels?.nostr?.dmPolicy ?? "pairing",
	promptAllowFrom: createTopLevelChannelParsedAllowFromPrompt({
		channel,
		defaultAccountId: resolveDefaultNostrAccountId,
		noteTitle: "Nostr allowlist",
		noteLines: NOSTR_ALLOW_FROM_HELP_LINES,
		message: "Nostr allowFrom",
		placeholder: "npub1..., 0123abcd...",
		parseEntries: parseNostrAllowFrom,
		mergeEntries: ({ existing, parsed }) => mergeAllowFromEntries(existing, parsed)
	})
});
const nostrSetupAdapter = {
	resolveAccountId: ({ cfg, accountId }) => accountId?.trim() || resolveDefaultNostrAccountId(cfg),
	applyAccountName: ({ cfg, accountId, name }) => patchTopLevelChannelConfigSection({
		cfg,
		channel,
		patch: buildNostrSetupPatch(accountId, name?.trim() ? { name: name.trim() } : {})
	}),
	validateInput: ({ input }) => {
		const typedInput = input;
		if (!typedInput.useEnv) {
			const privateKey = typedInput.privateKey?.trim();
			if (!privateKey) return "Nostr requires --private-key or --use-env.";
			try {
				getPublicKeyFromPrivate(privateKey);
			} catch {
				return "Nostr private key must be valid nsec or 64-character hex.";
			}
		}
		if (typedInput.relayUrls?.trim()) return parseRelayUrls(typedInput.relayUrls).error ?? null;
		return null;
	},
	applyAccountConfig: ({ cfg, accountId, input }) => {
		const typedInput = input;
		const relayResult = typedInput.relayUrls?.trim() ? parseRelayUrls(typedInput.relayUrls) : { relays: [] };
		return patchTopLevelChannelConfigSection({
			cfg,
			channel,
			enabled: true,
			clearFields: typedInput.useEnv ? ["privateKey"] : void 0,
			patch: buildNostrSetupPatch(accountId, {
				...typedInput.useEnv ? {} : { privateKey: typedInput.privateKey?.trim() },
				...relayResult.relays.length > 0 ? { relays: relayResult.relays } : {}
			})
		});
	}
};
const nostrSetupWizard = {
	channel,
	resolveAccountIdForConfigure: ({ accountOverride, defaultAccountId }) => accountOverride?.trim() || defaultAccountId,
	resolveShouldPromptAccountIds: () => false,
	status: createStandardChannelSetupStatus({
		channelLabel: "Nostr",
		configuredLabel: "configured",
		unconfiguredLabel: "needs private key",
		configuredHint: "configured",
		unconfiguredHint: "needs private key",
		configuredScore: 1,
		unconfiguredScore: 0,
		includeStatusLine: true,
		resolveConfigured: ({ cfg }) => resolveNostrAccount({ cfg }).configured,
		resolveExtraStatusLines: ({ cfg }) => {
			return [`Relays: ${resolveNostrAccount({ cfg }).relays.length || DEFAULT_RELAYS.length}`];
		}
	}),
	introNote: {
		title: "Nostr setup",
		lines: NOSTR_SETUP_HELP_LINES
	},
	envShortcut: {
		prompt: "NOSTR_PRIVATE_KEY detected. Use env var?",
		preferredEnvVar: "NOSTR_PRIVATE_KEY",
		isAvailable: ({ cfg, accountId }) => accountId === DEFAULT_ACCOUNT_ID$1 && Boolean(process.env.NOSTR_PRIVATE_KEY?.trim()) && !hasConfiguredSecretInput(resolveNostrAccount({
			cfg,
			accountId
		}).config.privateKey),
		apply: async ({ cfg, accountId }) => patchTopLevelChannelConfigSection({
			cfg,
			channel,
			enabled: true,
			clearFields: ["privateKey"],
			patch: buildNostrSetupPatch(accountId, {})
		})
	},
	credentials: [{
		inputKey: "privateKey",
		providerHint: channel,
		credentialLabel: "private key",
		preferredEnvVar: "NOSTR_PRIVATE_KEY",
		helpTitle: "Nostr private key",
		helpLines: NOSTR_SETUP_HELP_LINES,
		envPrompt: "NOSTR_PRIVATE_KEY detected. Use env var?",
		keepPrompt: "Nostr private key already configured. Keep it?",
		inputPrompt: "Nostr private key (nsec... or hex)",
		allowEnv: ({ accountId }) => accountId === DEFAULT_ACCOUNT_ID$1,
		inspect: ({ cfg, accountId }) => {
			const account = resolveNostrAccount({
				cfg,
				accountId
			});
			return {
				accountConfigured: account.configured,
				hasConfiguredValue: hasConfiguredSecretInput(account.config.privateKey),
				resolvedValue: normalizeSecretInputString(account.config.privateKey),
				envValue: process.env.NOSTR_PRIVATE_KEY?.trim()
			};
		},
		applyUseEnv: async ({ cfg, accountId }) => patchTopLevelChannelConfigSection({
			cfg,
			channel,
			enabled: true,
			clearFields: ["privateKey"],
			patch: buildNostrSetupPatch(accountId, {})
		}),
		applySet: async ({ cfg, accountId, resolvedValue }) => patchTopLevelChannelConfigSection({
			cfg,
			channel,
			enabled: true,
			patch: buildNostrSetupPatch(accountId, { privateKey: resolvedValue })
		})
	}],
	textInputs: [{
		inputKey: "relayUrls",
		message: "Relay URLs (comma-separated, optional)",
		placeholder: DEFAULT_RELAYS.join(", "),
		required: false,
		applyEmptyValue: true,
		helpTitle: "Nostr relays",
		helpLines: ["Use ws:// or wss:// relay URLs.", "Leave blank to keep the default relay set."],
		currentValue: ({ cfg, accountId }) => {
			const account = resolveNostrAccount({
				cfg,
				accountId
			});
			const configuredRelays = cfg.channels?.nostr?.relays;
			return (configuredRelays && configuredRelays.length > 0 ? account.relays : []).join(", ");
		},
		keepPrompt: (value) => `Relay URLs set (${value}). Keep them?`,
		validate: ({ value }) => parseRelayUrls(value).error,
		applySet: async ({ cfg, accountId, value }) => {
			const relayResult = parseRelayUrls(value);
			return patchTopLevelChannelConfigSection({
				cfg,
				channel,
				enabled: true,
				clearFields: relayResult.relays.length > 0 ? void 0 : ["relays"],
				patch: buildNostrSetupPatch(accountId, relayResult.relays.length > 0 ? { relays: relayResult.relays } : {})
			});
		}
	}],
	dmPolicy: nostrDmPolicy,
	disable: (cfg) => patchTopLevelChannelConfigSection({
		cfg,
		channel,
		patch: { enabled: false }
	})
};
//#endregion
export { resolveNostrAccount as a, getNostrRuntime as c, NostrConfigSchema as d, NostrProfileSchema as f, resolveDefaultNostrAccountId as i, setNostrRuntime as l, nostrSetupWizard as n, normalizePubkey as o, listNostrAccountIds as r, startNostrBus as s, nostrSetupAdapter as t, contentToProfile as u };
