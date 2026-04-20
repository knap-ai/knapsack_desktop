import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { n as defaultRuntime } from "./runtime-Dx7oeLYq.js";
import { t as resolveGlobalMap } from "./global-singleton-B80lD-oJ.js";
import { n as resolveGlobalDedupeCache } from "./dedupe-uU1DnJKZ.js";
import { t as CommandLane } from "./lanes-CU7Ll8dR.js";
import { r as clearCommandLane } from "./command-queue-BLDIg9zn.js";
import { _ as shouldSkipQueueItem, a as getExistingFollowupQueue, c as applyQueueDropPolicy, d as buildCollectPrompt, f as clearQueueSummaryState, g as previewQueueSummaryPrompt, h as hasCrossChannelItems, i as clearFollowupQueue, m as drainNextQueueItem, o as getFollowupQueue, p as drainCollectQueueStep, r as FOLLOWUP_QUEUES, u as beginQueueDrain, v as waitForQueueDebounce } from "./settings-runtime-CgE29DNS.js";
import { t as isRoutableChannel } from "./route-reply-CQe8rYFT.js";
//#region src/agents/pi-embedded-runner/lanes.ts
function resolveSessionLane(key) {
	const cleaned = key.trim() || CommandLane.Main;
	return cleaned.startsWith("session:") ? cleaned : `session:${cleaned}`;
}
function resolveGlobalLane(lane) {
	const cleaned = lane?.trim();
	if (cleaned === CommandLane.Cron) return CommandLane.Nested;
	return cleaned ? cleaned : CommandLane.Main;
}
function resolveEmbeddedSessionLane(key) {
	return resolveSessionLane(key);
}
//#endregion
//#region src/auto-reply/reply/queue/drain.ts
const FOLLOWUP_RUN_CALLBACKS = resolveGlobalMap(Symbol.for("openclaw.followupDrainCallbacks"));
function rememberFollowupDrainCallback(key, runFollowup) {
	FOLLOWUP_RUN_CALLBACKS.set(key, runFollowup);
}
function clearFollowupDrainCallback(key) {
	FOLLOWUP_RUN_CALLBACKS.delete(key);
}
/** Restart the drain for `key` if it is currently idle, using the stored callback. */
function kickFollowupDrainIfIdle(key) {
	const cb = FOLLOWUP_RUN_CALLBACKS.get(key);
	if (!cb) return;
	scheduleFollowupDrain(key, cb);
}
function resolveOriginRoutingMetadata(items) {
	return {
		originatingChannel: items.find((item) => item.originatingChannel)?.originatingChannel,
		originatingTo: items.find((item) => item.originatingTo)?.originatingTo,
		originatingAccountId: items.find((item) => item.originatingAccountId)?.originatingAccountId,
		originatingThreadId: items.find((item) => item.originatingThreadId != null && item.originatingThreadId !== "")?.originatingThreadId
	};
}
function resolveFollowupAuthorizationKey(run) {
	return JSON.stringify([
		run.senderId ?? "",
		run.senderE164 ?? "",
		run.senderIsOwner === true,
		run.execOverrides?.host ?? "",
		run.execOverrides?.security ?? "",
		run.execOverrides?.ask ?? "",
		run.execOverrides?.node ?? "",
		run.bashElevated?.enabled === true,
		run.bashElevated?.allowed === true,
		run.bashElevated?.defaultLevel ?? ""
	]);
}
function splitCollectItemsByAuthorization(items) {
	if (items.length <= 1) return items.length === 0 ? [] : [items];
	const groups = [];
	let currentGroup = [];
	let currentKey;
	for (const item of items) {
		const itemKey = resolveFollowupAuthorizationKey(item.run);
		if (currentGroup.length === 0 || itemKey === currentKey) {
			currentGroup.push(item);
			currentKey = itemKey;
			continue;
		}
		groups.push(currentGroup);
		currentGroup = [item];
		currentKey = itemKey;
	}
	if (currentGroup.length > 0) groups.push(currentGroup);
	return groups;
}
function renderCollectItem(item, idx) {
	const senderLabel = item.run.senderName ?? item.run.senderUsername ?? item.run.senderId ?? item.run.senderE164;
	const senderSuffix = senderLabel ? ` (from ${senderLabel})` : "";
	return `---\nQueued #${idx + 1}${senderSuffix}\n${item.prompt}`.trim();
}
function resolveCrossChannelKey(item) {
	const { originatingChannel: channel, originatingTo: to, originatingAccountId: accountId } = item;
	const threadId = item.originatingThreadId;
	if (!channel && !to && !accountId && (threadId == null || threadId === "")) return {};
	if (!isRoutableChannel(channel) || !to) return { cross: true };
	return { key: [
		channel,
		to,
		accountId || "",
		threadId != null && threadId !== "" ? String(threadId) : ""
	].join("|") };
}
function scheduleFollowupDrain(key, runFollowup) {
	const queue = beginQueueDrain(FOLLOWUP_QUEUES, key);
	if (!queue) return;
	const effectiveRunFollowup = FOLLOWUP_RUN_CALLBACKS.get(key) ?? runFollowup;
	rememberFollowupDrainCallback(key, effectiveRunFollowup);
	(async () => {
		try {
			const collectState = { forceIndividualCollect: false };
			while (queue.items.length > 0 || queue.droppedCount > 0) {
				await waitForQueueDebounce(queue);
				if (queue.mode === "collect") {
					const collectDrainResult = await drainCollectQueueStep({
						collectState,
						isCrossChannel: hasCrossChannelItems(queue.items, resolveCrossChannelKey),
						items: queue.items,
						run: effectiveRunFollowup
					});
					if (collectDrainResult === "empty") {
						const summaryOnlyPrompt = previewQueueSummaryPrompt({
							state: queue,
							noun: "message"
						});
						const run = queue.lastRun;
						if (summaryOnlyPrompt && run) {
							await effectiveRunFollowup({
								prompt: summaryOnlyPrompt,
								run,
								enqueuedAt: Date.now()
							});
							clearQueueSummaryState(queue);
							continue;
						}
						break;
					}
					if (collectDrainResult === "drained") continue;
					const items = queue.items.slice();
					const summary = previewQueueSummaryPrompt({
						state: queue,
						noun: "message"
					});
					const authGroups = splitCollectItemsByAuthorization(items);
					if (authGroups.length === 0) {
						const run = queue.lastRun;
						if (!summary || !run) break;
						await effectiveRunFollowup({
							prompt: summary,
							run,
							enqueuedAt: Date.now()
						});
						clearQueueSummaryState(queue);
						continue;
					}
					let pendingSummary = summary;
					for (const groupItems of authGroups) {
						const run = groupItems.at(-1)?.run ?? queue.lastRun;
						if (!run) break;
						const routing = resolveOriginRoutingMetadata(groupItems);
						await effectiveRunFollowup({
							prompt: buildCollectPrompt({
								title: "[Queued messages while agent was busy]",
								items: groupItems,
								summary: pendingSummary,
								renderItem: renderCollectItem
							}),
							run,
							enqueuedAt: Date.now(),
							...routing
						});
						queue.items.splice(0, groupItems.length);
						if (pendingSummary) {
							clearQueueSummaryState(queue);
							pendingSummary = void 0;
						}
					}
					continue;
				}
				const summaryPrompt = previewQueueSummaryPrompt({
					state: queue,
					noun: "message"
				});
				if (summaryPrompt) {
					const run = queue.lastRun;
					if (!run) break;
					if (!await drainNextQueueItem(queue.items, async (item) => {
						await effectiveRunFollowup({
							prompt: summaryPrompt,
							run,
							enqueuedAt: Date.now(),
							originatingChannel: item.originatingChannel,
							originatingTo: item.originatingTo,
							originatingAccountId: item.originatingAccountId,
							originatingThreadId: item.originatingThreadId
						});
					})) break;
					clearQueueSummaryState(queue);
					continue;
				}
				if (!await drainNextQueueItem(queue.items, effectiveRunFollowup)) break;
			}
		} catch (err) {
			queue.lastEnqueuedAt = Date.now();
			defaultRuntime.error?.(`followup queue drain failed for ${key}: ${String(err)}`);
		} finally {
			queue.draining = false;
			if (queue.items.length === 0 && queue.droppedCount === 0) {
				FOLLOWUP_QUEUES.delete(key);
				clearFollowupDrainCallback(key);
			} else scheduleFollowupDrain(key, effectiveRunFollowup);
		}
	})();
}
//#endregion
//#region src/auto-reply/reply/queue/cleanup.ts
const defaultQueueCleanupDeps = {
	resolveEmbeddedSessionLane,
	clearCommandLane
};
const queueCleanupDeps = { ...defaultQueueCleanupDeps };
function resolveQueueCleanupLaneResolver() {
	return typeof queueCleanupDeps.resolveEmbeddedSessionLane === "function" ? queueCleanupDeps.resolveEmbeddedSessionLane : defaultQueueCleanupDeps.resolveEmbeddedSessionLane;
}
function resolveQueueCleanupLaneClearer() {
	return typeof queueCleanupDeps.clearCommandLane === "function" ? queueCleanupDeps.clearCommandLane : defaultQueueCleanupDeps.clearCommandLane;
}
function clearSessionQueues(keys) {
	const seen = /* @__PURE__ */ new Set();
	let followupCleared = 0;
	let laneCleared = 0;
	const clearedKeys = [];
	const resolveLane = resolveQueueCleanupLaneResolver();
	const clearLane = resolveQueueCleanupLaneClearer();
	for (const key of keys) {
		const cleaned = normalizeOptionalString(key);
		if (!cleaned || seen.has(cleaned)) continue;
		seen.add(cleaned);
		clearedKeys.push(cleaned);
		followupCleared += clearFollowupQueue(cleaned);
		clearFollowupDrainCallback(cleaned);
		laneCleared += clearLane(resolveLane(cleaned));
	}
	return {
		followupCleared,
		laneCleared,
		keys: clearedKeys
	};
}
//#endregion
//#region src/auto-reply/reply/queue/enqueue.ts
const RECENT_QUEUE_MESSAGE_IDS = resolveGlobalDedupeCache(Symbol.for("openclaw.recentQueueMessageIds"), {
	ttlMs: 300 * 1e3,
	maxSize: 1e4
});
function buildRecentMessageIdKey(run, queueKey) {
	const messageId = normalizeOptionalString(run.messageId);
	if (!messageId) return;
	return JSON.stringify([
		"queue",
		queueKey,
		run.originatingChannel ?? "",
		run.originatingTo ?? "",
		run.originatingAccountId ?? "",
		run.originatingThreadId == null ? "" : String(run.originatingThreadId),
		messageId
	]);
}
function isRunAlreadyQueued(run, items, allowPromptFallback = false) {
	const hasSameRouting = (item) => item.originatingChannel === run.originatingChannel && item.originatingTo === run.originatingTo && item.originatingAccountId === run.originatingAccountId && item.originatingThreadId === run.originatingThreadId;
	const messageId = normalizeOptionalString(run.messageId);
	if (messageId) return items.some((item) => normalizeOptionalString(item.messageId) === messageId && hasSameRouting(item));
	if (!allowPromptFallback) return false;
	return items.some((item) => item.prompt === run.prompt && hasSameRouting(item));
}
function enqueueFollowupRun(key, run, settings, dedupeMode = "message-id", runFollowup, restartIfIdle = true) {
	const queue = getFollowupQueue(key, settings);
	const recentMessageIdKey = dedupeMode !== "none" ? buildRecentMessageIdKey(run, key) : void 0;
	if (recentMessageIdKey && RECENT_QUEUE_MESSAGE_IDS.peek(recentMessageIdKey)) return false;
	const dedupe = dedupeMode === "none" ? void 0 : (item, items) => isRunAlreadyQueued(item, items, dedupeMode === "prompt");
	if (shouldSkipQueueItem({
		item: run,
		items: queue.items,
		dedupe
	})) return false;
	queue.lastEnqueuedAt = Date.now();
	queue.lastRun = run.run;
	if (!applyQueueDropPolicy({
		queue,
		summarize: (item) => normalizeOptionalString(item.summaryLine) || item.prompt.trim()
	})) return false;
	queue.items.push(run);
	if (recentMessageIdKey) RECENT_QUEUE_MESSAGE_IDS.check(recentMessageIdKey);
	if (runFollowup) rememberFollowupDrainCallback(key, runFollowup);
	if (restartIfIdle && !queue.draining) kickFollowupDrainIfIdle(key);
	return true;
}
function getFollowupQueueDepth(key) {
	const queue = getExistingFollowupQueue(key);
	if (!queue) return 0;
	return queue.items.length;
}
//#endregion
export { resolveEmbeddedSessionLane as a, scheduleFollowupDrain as i, getFollowupQueueDepth as n, resolveGlobalLane as o, clearSessionQueues as r, resolveSessionLane as s, enqueueFollowupRun as t };
