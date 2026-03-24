import { a as logVerbose } from "./globals-DBUMOBZ8.js";
import { _ as normalizeAccountId, u as resolveAgentIdFromSessionKey } from "./session-key-DAhnzjyr.js";
import { a as getRuntimeConfigSnapshot } from "./io-y3Az_Onx.js";
import { Ji as Routes, jr as parseDiscordTarget, li as createDiscordRestClient } from "./pi-embedded-CbCYZxIb.js";
import { n as readAcpSessionEntry } from "./manager-Bw8JrihM.js";
import { K as registerSessionBindingAdapter, a as resolveThreadBindingConversationIdFromBindingId, i as resolveThreadBindingThreadName, n as resolveThreadBindingFarewellText, q as unregisterSessionBindingAdapter, r as resolveThreadBindingIntroText } from "./conversation-runtime-nmWgJSXS.js";
import { l as resolveThreadBindingMaxAgeMs, o as resolveThreadBindingIdleTimeoutMs } from "./thread-bindings-policy-C1Av-nes.js";
import { A as resolveThreadBindingsPath, C as resetThreadBindingsForTests, D as resolveThreadBindingInactivityExpiresAt, E as resolveThreadBindingIdleTimeoutMs$1, F as DEFAULT_THREAD_BINDING_IDLE_TIMEOUT_MS, I as THREAD_BINDINGS_SWEEP_INTERVAL_MS, M as setBindingRecord, N as shouldDefaultPersist, O as resolveThreadBindingMaxAgeExpiresAt, P as shouldPersistBindingMutations, S as removeBindingRecord, T as resolveBindingRecordKey, _ as normalizeTargetKind, a as isThreadArchived, b as rememberRecentUnboundWebhookEcho, c as summarizeDiscordError, d as PERSIST_BY_ACCOUNT_ID, f as THREAD_BINDING_TOUCH_PERSIST_MIN_INTERVAL_MS, h as getThreadBindingToken, i as isDiscordThreadGoneError, j as saveBindingsToDisk, k as resolveThreadBindingMaxAgeMs$1, l as BINDINGS_BY_THREAD_ID, m as forgetThreadBindingToken, n as createWebhookForChannel, o as maybeSendBindingMessage, p as ensureBindingsLoaded, r as findReusableWebhook, s as resolveChannelIdForBinding, t as createThreadForBinding, u as MANAGERS_BY_ACCOUNT_ID, v as normalizeThreadBindingDurationMs, w as resolveBindingIdsForSession, x as rememberThreadBindingToken, y as normalizeThreadId } from "./thread-bindings.messages-C6WRAx05.js";
//#region extensions/discord/src/monitor/thread-bindings.config.ts
function resolveDiscordThreadBindingIdleTimeoutMs(params) {
	const accountId = normalizeAccountId(params.accountId);
	const root = params.cfg.channels?.discord?.threadBindings;
	const account = params.cfg.channels?.discord?.accounts?.[accountId]?.threadBindings;
	return resolveThreadBindingIdleTimeoutMs({
		channelIdleHoursRaw: account?.idleHours ?? root?.idleHours,
		sessionIdleHoursRaw: params.cfg.session?.threadBindings?.idleHours
	});
}
function resolveDiscordThreadBindingMaxAgeMs(params) {
	const accountId = normalizeAccountId(params.accountId);
	const root = params.cfg.channels?.discord?.threadBindings;
	const account = params.cfg.channels?.discord?.accounts?.[accountId]?.threadBindings;
	return resolveThreadBindingMaxAgeMs({
		channelMaxAgeHoursRaw: account?.maxAgeHours ?? root?.maxAgeHours,
		sessionMaxAgeHoursRaw: params.cfg.session?.threadBindings?.maxAgeHours
	});
}
//#endregion
//#region extensions/discord/src/monitor/thread-bindings.manager.ts
function registerManager(manager) {
	MANAGERS_BY_ACCOUNT_ID.set(manager.accountId, manager);
}
function unregisterManager(accountId, manager) {
	if (MANAGERS_BY_ACCOUNT_ID.get(accountId) === manager) MANAGERS_BY_ACCOUNT_ID.delete(accountId);
}
const SWEEPERS_BY_ACCOUNT_ID = /* @__PURE__ */ new Map();
function resolveEffectiveBindingExpiresAt(params) {
	const inactivityExpiresAt = resolveThreadBindingInactivityExpiresAt({
		record: params.record,
		defaultIdleTimeoutMs: params.defaultIdleTimeoutMs
	});
	const maxAgeExpiresAt = resolveThreadBindingMaxAgeExpiresAt({
		record: params.record,
		defaultMaxAgeMs: params.defaultMaxAgeMs
	});
	if (inactivityExpiresAt != null && maxAgeExpiresAt != null) return Math.min(inactivityExpiresAt, maxAgeExpiresAt);
	return inactivityExpiresAt ?? maxAgeExpiresAt;
}
function createNoopManager(accountIdRaw) {
	return {
		accountId: normalizeAccountId(accountIdRaw),
		getIdleTimeoutMs: () => DEFAULT_THREAD_BINDING_IDLE_TIMEOUT_MS,
		getMaxAgeMs: () => 0,
		getByThreadId: () => void 0,
		getBySessionKey: () => void 0,
		listBySessionKey: () => [],
		listBindings: () => [],
		touchThread: () => null,
		bindTarget: async () => null,
		unbindThread: () => null,
		unbindBySessionKey: () => [],
		stop: () => {}
	};
}
function toSessionBindingTargetKind(raw) {
	return raw === "subagent" ? "subagent" : "session";
}
function toThreadBindingTargetKind(raw) {
	return raw === "subagent" ? "subagent" : "acp";
}
function isDirectConversationBindingId(value) {
	const trimmed = value?.trim();
	return Boolean(trimmed && /^(user:|channel:)/i.test(trimmed));
}
function toSessionBindingRecord(record, defaults) {
	return {
		bindingId: resolveBindingRecordKey({
			accountId: record.accountId,
			threadId: record.threadId
		}) ?? `${record.accountId}:${record.threadId}`,
		targetSessionKey: record.targetSessionKey,
		targetKind: toSessionBindingTargetKind(record.targetKind),
		conversation: {
			channel: "discord",
			accountId: record.accountId,
			conversationId: record.threadId,
			parentConversationId: record.channelId
		},
		status: "active",
		boundAt: record.boundAt,
		expiresAt: resolveEffectiveBindingExpiresAt({
			record,
			defaultIdleTimeoutMs: defaults.idleTimeoutMs,
			defaultMaxAgeMs: defaults.maxAgeMs
		}),
		metadata: {
			agentId: record.agentId,
			label: record.label,
			webhookId: record.webhookId,
			webhookToken: record.webhookToken,
			boundBy: record.boundBy,
			lastActivityAt: record.lastActivityAt,
			idleTimeoutMs: resolveThreadBindingIdleTimeoutMs$1({
				record,
				defaultIdleTimeoutMs: defaults.idleTimeoutMs
			}),
			maxAgeMs: resolveThreadBindingMaxAgeMs$1({
				record,
				defaultMaxAgeMs: defaults.maxAgeMs
			}),
			...record.metadata
		}
	};
}
function createThreadBindingManager(params = {}) {
	ensureBindingsLoaded();
	const accountId = normalizeAccountId(params.accountId);
	const existing = MANAGERS_BY_ACCOUNT_ID.get(accountId);
	if (existing) {
		rememberThreadBindingToken({
			accountId,
			token: params.token
		});
		return existing;
	}
	rememberThreadBindingToken({
		accountId,
		token: params.token
	});
	const persist = params.persist ?? shouldDefaultPersist();
	PERSIST_BY_ACCOUNT_ID.set(accountId, persist);
	const idleTimeoutMs = normalizeThreadBindingDurationMs(params.idleTimeoutMs, DEFAULT_THREAD_BINDING_IDLE_TIMEOUT_MS);
	const maxAgeMs = normalizeThreadBindingDurationMs(params.maxAgeMs, 0);
	const resolveCurrentCfg = () => getRuntimeConfigSnapshot() ?? params.cfg;
	const resolveCurrentToken = () => getThreadBindingToken(accountId) ?? params.token;
	let sweepTimer = null;
	const runSweepOnce = async () => {
		const bindings = manager.listBindings();
		if (bindings.length === 0) return;
		let rest = null;
		for (const snapshotBinding of bindings) {
			const binding = manager.getByThreadId(snapshotBinding.threadId);
			if (!binding) continue;
			const now = Date.now();
			const inactivityExpiresAt = resolveThreadBindingInactivityExpiresAt({
				record: binding,
				defaultIdleTimeoutMs: idleTimeoutMs
			});
			const maxAgeExpiresAt = resolveThreadBindingMaxAgeExpiresAt({
				record: binding,
				defaultMaxAgeMs: maxAgeMs
			});
			const expirationCandidates = [];
			if (inactivityExpiresAt != null && now >= inactivityExpiresAt) expirationCandidates.push({
				reason: "idle-expired",
				at: inactivityExpiresAt
			});
			if (maxAgeExpiresAt != null && now >= maxAgeExpiresAt) expirationCandidates.push({
				reason: "max-age-expired",
				at: maxAgeExpiresAt
			});
			if (expirationCandidates.length > 0) {
				expirationCandidates.sort((a, b) => a.at - b.at);
				const reason = expirationCandidates[0]?.reason ?? "idle-expired";
				manager.unbindThread({
					threadId: binding.threadId,
					reason,
					sendFarewell: true,
					farewellText: resolveThreadBindingFarewellText({
						reason,
						idleTimeoutMs: resolveThreadBindingIdleTimeoutMs$1({
							record: binding,
							defaultIdleTimeoutMs: idleTimeoutMs
						}),
						maxAgeMs: resolveThreadBindingMaxAgeMs$1({
							record: binding,
							defaultMaxAgeMs: maxAgeMs
						})
					})
				});
				continue;
			}
			if (isDirectConversationBindingId(binding.threadId)) continue;
			if (!rest) try {
				const cfg = resolveCurrentCfg();
				rest = createDiscordRestClient({
					accountId,
					token: resolveCurrentToken()
				}, cfg).rest;
			} catch {
				return;
			}
			try {
				const channel = await rest.get(Routes.channel(binding.threadId));
				if (!channel || typeof channel !== "object") {
					logVerbose(`discord thread binding sweep probe returned invalid payload for ${binding.threadId}`);
					continue;
				}
				if (isThreadArchived(channel)) manager.unbindThread({
					threadId: binding.threadId,
					reason: "thread-archived",
					sendFarewell: true
				});
			} catch (err) {
				if (isDiscordThreadGoneError(err)) {
					logVerbose(`discord thread binding sweep removing stale binding ${binding.threadId}: ${summarizeDiscordError(err)}`);
					manager.unbindThread({
						threadId: binding.threadId,
						reason: "thread-delete",
						sendFarewell: false
					});
					continue;
				}
				logVerbose(`discord thread binding sweep probe failed for ${binding.threadId}: ${summarizeDiscordError(err)}`);
			}
		}
	};
	SWEEPERS_BY_ACCOUNT_ID.set(accountId, runSweepOnce);
	const manager = {
		accountId,
		getIdleTimeoutMs: () => idleTimeoutMs,
		getMaxAgeMs: () => maxAgeMs,
		getByThreadId: (threadId) => {
			const key = resolveBindingRecordKey({
				accountId,
				threadId
			});
			if (!key) return;
			const entry = BINDINGS_BY_THREAD_ID.get(key);
			if (!entry || entry.accountId !== accountId) return;
			return entry;
		},
		getBySessionKey: (targetSessionKey) => {
			return manager.listBySessionKey(targetSessionKey)[0];
		},
		listBySessionKey: (targetSessionKey) => {
			return resolveBindingIdsForSession({
				targetSessionKey,
				accountId
			}).map((bindingKey) => BINDINGS_BY_THREAD_ID.get(bindingKey)).filter((entry) => Boolean(entry));
		},
		listBindings: () => [...BINDINGS_BY_THREAD_ID.values()].filter((entry) => entry.accountId === accountId),
		touchThread: (touchParams) => {
			const key = resolveBindingRecordKey({
				accountId,
				threadId: touchParams.threadId
			});
			if (!key) return null;
			const existing = BINDINGS_BY_THREAD_ID.get(key);
			if (!existing || existing.accountId !== accountId) return null;
			const now = Date.now();
			const at = typeof touchParams.at === "number" && Number.isFinite(touchParams.at) ? Math.max(0, Math.floor(touchParams.at)) : now;
			const nextRecord = {
				...existing,
				lastActivityAt: Math.max(existing.lastActivityAt || 0, at)
			};
			setBindingRecord(nextRecord);
			if (touchParams.persist ?? persist) saveBindingsToDisk({ minIntervalMs: THREAD_BINDING_TOUCH_PERSIST_MIN_INTERVAL_MS });
			return nextRecord;
		},
		bindTarget: async (bindParams) => {
			const cfg = resolveCurrentCfg();
			let threadId = normalizeThreadId(bindParams.threadId);
			let channelId = bindParams.channelId?.trim() || "";
			const directConversationBinding = isDirectConversationBindingId(threadId) || isDirectConversationBindingId(channelId);
			if (!threadId && bindParams.createThread) {
				if (!channelId) return null;
				const threadName = resolveThreadBindingThreadName({
					agentId: bindParams.agentId,
					label: bindParams.label
				});
				threadId = await createThreadForBinding({
					cfg,
					accountId,
					token: resolveCurrentToken(),
					channelId,
					threadName: bindParams.threadName?.trim() || threadName
				}) ?? void 0;
			}
			if (!threadId) return null;
			if (!channelId && directConversationBinding) channelId = threadId;
			if (!channelId) channelId = await resolveChannelIdForBinding({
				cfg,
				accountId,
				token: resolveCurrentToken(),
				threadId,
				channelId: bindParams.channelId
			}) ?? "";
			if (!channelId) return null;
			const targetSessionKey = bindParams.targetSessionKey.trim();
			if (!targetSessionKey) return null;
			const targetKind = normalizeTargetKind(bindParams.targetKind, targetSessionKey);
			let webhookId = bindParams.webhookId?.trim() || "";
			let webhookToken = bindParams.webhookToken?.trim() || "";
			if (!directConversationBinding && (!webhookId || !webhookToken)) {
				const cachedWebhook = findReusableWebhook({
					accountId,
					channelId
				});
				webhookId = cachedWebhook.webhookId ?? "";
				webhookToken = cachedWebhook.webhookToken ?? "";
			}
			if (!directConversationBinding && (!webhookId || !webhookToken)) {
				const createdWebhook = await createWebhookForChannel({
					cfg,
					accountId,
					token: resolveCurrentToken(),
					channelId
				});
				webhookId = createdWebhook.webhookId ?? "";
				webhookToken = createdWebhook.webhookToken ?? "";
			}
			const now = Date.now();
			const record = {
				accountId,
				channelId,
				threadId,
				targetKind,
				targetSessionKey,
				agentId: bindParams.agentId?.trim() || resolveAgentIdFromSessionKey(targetSessionKey),
				label: bindParams.label?.trim() || void 0,
				webhookId: webhookId || void 0,
				webhookToken: webhookToken || void 0,
				boundBy: bindParams.boundBy?.trim() || "system",
				boundAt: now,
				lastActivityAt: now,
				idleTimeoutMs,
				maxAgeMs,
				metadata: bindParams.metadata && typeof bindParams.metadata === "object" ? { ...bindParams.metadata } : void 0
			};
			setBindingRecord(record);
			if (persist) saveBindingsToDisk();
			const introText = bindParams.introText?.trim();
			if (introText) maybeSendBindingMessage({
				cfg,
				record,
				text: introText
			});
			return record;
		},
		unbindThread: (unbindParams) => {
			const bindingKey = resolveBindingRecordKey({
				accountId,
				threadId: unbindParams.threadId
			});
			if (!bindingKey) return null;
			const existing = BINDINGS_BY_THREAD_ID.get(bindingKey);
			if (!existing || existing.accountId !== accountId) return null;
			const removed = removeBindingRecord(bindingKey);
			if (!removed) return null;
			rememberRecentUnboundWebhookEcho(removed);
			if (persist) saveBindingsToDisk();
			if (unbindParams.sendFarewell !== false) maybeSendBindingMessage({
				cfg: resolveCurrentCfg(),
				record: removed,
				text: resolveThreadBindingFarewellText({
					reason: unbindParams.reason,
					farewellText: unbindParams.farewellText,
					idleTimeoutMs: resolveThreadBindingIdleTimeoutMs$1({
						record: removed,
						defaultIdleTimeoutMs: idleTimeoutMs
					}),
					maxAgeMs: resolveThreadBindingMaxAgeMs$1({
						record: removed,
						defaultMaxAgeMs: maxAgeMs
					})
				}),
				preferWebhook: false
			});
			return removed;
		},
		unbindBySessionKey: (unbindParams) => {
			const ids = resolveBindingIdsForSession({
				targetSessionKey: unbindParams.targetSessionKey,
				accountId,
				targetKind: unbindParams.targetKind
			});
			if (ids.length === 0) return [];
			const removed = [];
			for (const bindingKey of ids) {
				const binding = BINDINGS_BY_THREAD_ID.get(bindingKey);
				if (!binding) continue;
				const entry = manager.unbindThread({
					threadId: binding.threadId,
					reason: unbindParams.reason,
					sendFarewell: unbindParams.sendFarewell,
					farewellText: unbindParams.farewellText
				});
				if (entry) removed.push(entry);
			}
			return removed;
		},
		stop: () => {
			if (sweepTimer) {
				clearInterval(sweepTimer);
				sweepTimer = null;
			}
			SWEEPERS_BY_ACCOUNT_ID.delete(accountId);
			unregisterManager(accountId, manager);
			unregisterSessionBindingAdapter({
				channel: "discord",
				accountId,
				adapter: sessionBindingAdapter
			});
			forgetThreadBindingToken(accountId);
		}
	};
	if (params.enableSweeper !== false) {
		sweepTimer = setInterval(() => {
			runSweepOnce();
		}, THREAD_BINDINGS_SWEEP_INTERVAL_MS);
		if (!(process.env.VITEST || false)) sweepTimer.unref?.();
	}
	const sessionBindingAdapter = {
		channel: "discord",
		accountId,
		capabilities: { placements: ["current", "child"] },
		bind: async (input) => {
			if (input.conversation.channel !== "discord") return null;
			const targetSessionKey = input.targetSessionKey.trim();
			if (!targetSessionKey) return null;
			const conversationId = input.conversation.conversationId.trim();
			const placement = input.placement === "child" ? "child" : "current";
			const metadata = input.metadata ?? {};
			const label = typeof metadata.label === "string" ? metadata.label.trim() || void 0 : void 0;
			const threadName = typeof metadata.threadName === "string" ? metadata.threadName.trim() || void 0 : void 0;
			const introText = typeof metadata.introText === "string" ? metadata.introText.trim() || void 0 : void 0;
			const boundBy = typeof metadata.boundBy === "string" ? metadata.boundBy.trim() || void 0 : void 0;
			const agentId = typeof metadata.agentId === "string" ? metadata.agentId.trim() || void 0 : void 0;
			let threadId;
			let channelId = input.conversation.parentConversationId?.trim() || void 0;
			let createThread = false;
			if (placement === "child") {
				createThread = true;
				if (!channelId && conversationId) channelId = await resolveChannelIdForBinding({
					cfg: resolveCurrentCfg(),
					accountId,
					token: resolveCurrentToken(),
					threadId: conversationId
				}) ?? void 0;
			} else threadId = conversationId || void 0;
			const bound = await manager.bindTarget({
				threadId,
				channelId,
				createThread,
				threadName,
				targetKind: toThreadBindingTargetKind(input.targetKind),
				targetSessionKey,
				agentId,
				label,
				boundBy,
				introText,
				metadata
			});
			return bound ? toSessionBindingRecord(bound, {
				idleTimeoutMs,
				maxAgeMs
			}) : null;
		},
		listBySession: (targetSessionKey) => manager.listBySessionKey(targetSessionKey).map((entry) => toSessionBindingRecord(entry, {
			idleTimeoutMs,
			maxAgeMs
		})),
		resolveByConversation: (ref) => {
			if (ref.channel !== "discord") return null;
			const binding = manager.getByThreadId(ref.conversationId);
			return binding ? toSessionBindingRecord(binding, {
				idleTimeoutMs,
				maxAgeMs
			}) : null;
		},
		touch: (bindingId, at) => {
			const threadId = resolveThreadBindingConversationIdFromBindingId({
				accountId,
				bindingId
			});
			if (!threadId) return;
			manager.touchThread({
				threadId,
				at,
				persist: true
			});
		},
		unbind: async (input) => {
			if (input.targetSessionKey?.trim()) return manager.unbindBySessionKey({
				targetSessionKey: input.targetSessionKey,
				reason: input.reason
			}).map((entry) => toSessionBindingRecord(entry, {
				idleTimeoutMs,
				maxAgeMs
			}));
			const threadId = resolveThreadBindingConversationIdFromBindingId({
				accountId,
				bindingId: input.bindingId
			});
			if (!threadId) return [];
			const removed = manager.unbindThread({
				threadId,
				reason: input.reason
			});
			return removed ? [toSessionBindingRecord(removed, {
				idleTimeoutMs,
				maxAgeMs
			})] : [];
		}
	};
	registerSessionBindingAdapter(sessionBindingAdapter);
	registerManager(manager);
	return manager;
}
function createNoopThreadBindingManager(accountId) {
	return createNoopManager(accountId);
}
function getThreadBindingManager(accountId) {
	const normalized = normalizeAccountId(accountId);
	return MANAGERS_BY_ACCOUNT_ID.get(normalized) ?? null;
}
const __testing = {
	resolveThreadBindingsPath,
	resolveThreadBindingThreadName,
	resetThreadBindingsForTests,
	runThreadBindingSweepForAccount: async (accountId) => {
		const sweep = SWEEPERS_BY_ACCOUNT_ID.get(normalizeAccountId(accountId));
		if (sweep) await sweep();
	}
};
//#endregion
//#region extensions/discord/src/monitor/thread-bindings.lifecycle.ts
const ACP_STARTUP_HEALTH_PROBE_CONCURRENCY_LIMIT = 8;
async function mapWithConcurrency(params) {
	if (params.items.length === 0) return [];
	const limit = Math.max(1, Math.floor(params.limit));
	const resultsByIndex = /* @__PURE__ */ new Map();
	let nextIndex = 0;
	const runWorker = async () => {
		for (;;) {
			const index = nextIndex;
			nextIndex += 1;
			if (index >= params.items.length) return;
			resultsByIndex.set(index, await params.worker(params.items[index], index));
		}
	};
	const workers = Array.from({ length: Math.min(limit, params.items.length) }, () => runWorker());
	await Promise.all(workers);
	return params.items.map((_item, index) => resultsByIndex.get(index));
}
function normalizeNonNegativeMs(raw) {
	if (!Number.isFinite(raw)) return 0;
	return Math.max(0, Math.floor(raw));
}
function resolveBindingIdsForTargetSession(params) {
	ensureBindingsLoaded();
	const targetSessionKey = params.targetSessionKey.trim();
	if (!targetSessionKey) return [];
	return resolveBindingIdsForSession({
		targetSessionKey,
		accountId: params.accountId ? normalizeAccountId(params.accountId) : void 0,
		targetKind: params.targetKind
	});
}
function updateBindingsForTargetSession(ids, update) {
	if (ids.length === 0) return [];
	const now = Date.now();
	const updated = [];
	for (const bindingKey of ids) {
		const existing = BINDINGS_BY_THREAD_ID.get(bindingKey);
		if (!existing) continue;
		const nextRecord = update(existing, now);
		setBindingRecord(nextRecord);
		updated.push(nextRecord);
	}
	if (updated.length > 0 && shouldPersistBindingMutations()) saveBindingsToDisk({ force: true });
	return updated;
}
function listThreadBindingsForAccount(accountId) {
	const manager = getThreadBindingManager(accountId);
	if (!manager) return [];
	return manager.listBindings();
}
function listThreadBindingsBySessionKey(params) {
	return resolveBindingIdsForTargetSession(params).map((bindingKey) => BINDINGS_BY_THREAD_ID.get(bindingKey)).filter((entry) => Boolean(entry));
}
async function autoBindSpawnedDiscordSubagent(params) {
	if (params.channel?.trim().toLowerCase() !== "discord") return null;
	const manager = getThreadBindingManager(params.accountId);
	if (!manager) return null;
	const managerToken = getThreadBindingToken(manager.accountId);
	const requesterThreadId = normalizeThreadId(params.threadId);
	let channelId = "";
	if (requesterThreadId) {
		const existing = manager.getByThreadId(requesterThreadId);
		if (existing?.channelId?.trim()) channelId = existing.channelId.trim();
		else channelId = await resolveChannelIdForBinding({
			cfg: params.cfg,
			accountId: manager.accountId,
			token: managerToken,
			threadId: requesterThreadId
		}) ?? "";
	}
	if (!channelId) {
		const to = params.to?.trim() || "";
		if (!to) return null;
		try {
			const target = parseDiscordTarget(to, { defaultKind: "channel" });
			if (!target || target.kind !== "channel") return null;
			channelId = await resolveChannelIdForBinding({
				cfg: params.cfg,
				accountId: manager.accountId,
				token: managerToken,
				threadId: target.id
			}) ?? "";
		} catch {
			return null;
		}
	}
	return await manager.bindTarget({
		threadId: void 0,
		channelId,
		createThread: true,
		threadName: resolveThreadBindingThreadName({
			agentId: params.agentId,
			label: params.label
		}),
		targetKind: "subagent",
		targetSessionKey: params.childSessionKey,
		agentId: params.agentId,
		label: params.label,
		boundBy: params.boundBy ?? "system",
		introText: resolveThreadBindingIntroText({
			agentId: params.agentId,
			label: params.label,
			idleTimeoutMs: manager.getIdleTimeoutMs(),
			maxAgeMs: manager.getMaxAgeMs()
		})
	});
}
function unbindThreadBindingsBySessionKey(params) {
	const ids = resolveBindingIdsForTargetSession(params);
	if (ids.length === 0) return [];
	const removed = [];
	for (const bindingKey of ids) {
		const record = BINDINGS_BY_THREAD_ID.get(bindingKey);
		if (!record) continue;
		const manager = MANAGERS_BY_ACCOUNT_ID.get(record.accountId);
		if (manager) {
			const unbound = manager.unbindThread({
				threadId: record.threadId,
				reason: params.reason,
				sendFarewell: params.sendFarewell,
				farewellText: params.farewellText
			});
			if (unbound) removed.push(unbound);
			continue;
		}
		const unbound = removeBindingRecord(bindingKey);
		if (unbound) {
			rememberRecentUnboundWebhookEcho(unbound);
			removed.push(unbound);
		}
	}
	if (removed.length > 0 && shouldPersistBindingMutations()) saveBindingsToDisk({ force: true });
	return removed;
}
function setThreadBindingIdleTimeoutBySessionKey(params) {
	const ids = resolveBindingIdsForTargetSession(params);
	const idleTimeoutMs = normalizeNonNegativeMs(params.idleTimeoutMs);
	return updateBindingsForTargetSession(ids, (existing, now) => ({
		...existing,
		idleTimeoutMs,
		lastActivityAt: now
	}));
}
function setThreadBindingMaxAgeBySessionKey(params) {
	const ids = resolveBindingIdsForTargetSession(params);
	const maxAgeMs = normalizeNonNegativeMs(params.maxAgeMs);
	return updateBindingsForTargetSession(ids, (existing, now) => ({
		...existing,
		maxAgeMs,
		boundAt: now,
		lastActivityAt: now
	}));
}
function resolveStoredAcpBindingHealth(params) {
	if (!params.session.acp) return "stale";
	return "healthy";
}
async function reconcileAcpThreadBindingsOnStartup(params) {
	const manager = getThreadBindingManager(params.accountId);
	if (!manager) return {
		checked: 0,
		removed: 0,
		staleSessionKeys: []
	};
	const acpBindings = manager.listBindings().filter((binding) => binding.targetKind === "acp" && binding.metadata?.pluginBindingOwner !== "plugin");
	const staleBindings = [];
	const probeTargets = [];
	for (const binding of acpBindings) {
		const sessionKey = binding.targetSessionKey.trim();
		if (!sessionKey) {
			staleBindings.push(binding);
			continue;
		}
		const session = readAcpSessionEntry({
			cfg: params.cfg,
			sessionKey
		});
		if (!session) {
			staleBindings.push(binding);
			continue;
		}
		if (session.storeReadFailed) continue;
		if (resolveStoredAcpBindingHealth({ session }) === "stale") {
			staleBindings.push(binding);
			continue;
		}
		if (!params.healthProbe) continue;
		probeTargets.push({
			binding,
			sessionKey,
			session
		});
	}
	if (params.healthProbe && probeTargets.length > 0) {
		const probeResults = await mapWithConcurrency({
			items: probeTargets,
			limit: ACP_STARTUP_HEALTH_PROBE_CONCURRENCY_LIMIT,
			worker: async ({ binding, sessionKey, session }) => {
				try {
					return {
						binding,
						status: (await params.healthProbe?.({
							cfg: params.cfg,
							accountId: manager.accountId,
							sessionKey,
							binding,
							session
						}))?.status ?? "uncertain"
					};
				} catch {
					return {
						binding,
						status: "uncertain"
					};
				}
			}
		});
		for (const probeResult of probeResults) if (probeResult.status === "stale") staleBindings.push(probeResult.binding);
	}
	if (staleBindings.length === 0) return {
		checked: acpBindings.length,
		removed: 0,
		staleSessionKeys: []
	};
	const staleSessionKeys = [];
	let removed = 0;
	for (const binding of staleBindings) {
		staleSessionKeys.push(binding.targetSessionKey);
		if (manager.unbindThread({
			threadId: binding.threadId,
			reason: "stale-session",
			sendFarewell: params.sendFarewell ?? false
		})) removed += 1;
	}
	return {
		checked: acpBindings.length,
		removed,
		staleSessionKeys: [...new Set(staleSessionKeys)]
	};
}
//#endregion
export { setThreadBindingIdleTimeoutBySessionKey as a, __testing as c, getThreadBindingManager as d, resolveDiscordThreadBindingIdleTimeoutMs as f, reconcileAcpThreadBindingsOnStartup as i, createNoopThreadBindingManager as l, listThreadBindingsBySessionKey as n, setThreadBindingMaxAgeBySessionKey as o, resolveDiscordThreadBindingMaxAgeMs as p, listThreadBindingsForAccount as r, unbindThreadBindingsBySessionKey as s, autoBindSpawnedDiscordSubagent as t, createThreadBindingManager as u };
