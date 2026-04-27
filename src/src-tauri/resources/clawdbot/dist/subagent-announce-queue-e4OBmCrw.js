import { n as defaultRuntime } from "./runtime-Dx7oeLYq.js";
import { i as normalizeDeliveryContext, n as deliveryContextKey } from "./delivery-context.shared-BRwSoIeK.js";
import { a as clearQueueSummaryState, c as hasCrossChannelItems, d as waitForQueueDebounce, i as buildCollectPrompt, l as previewQueueSummaryPrompt, n as applyQueueRuntimeSettings, o as drainCollectQueueStep, r as beginQueueDrain, s as drainNextQueueItem, t as applyQueueDropPolicy } from "./queue-helpers-DKUAXqnj.js";
//#region src/agents/subagent-announce-queue.ts
const ANNOUNCE_QUEUES = /* @__PURE__ */ new Map();
function getAnnounceQueue(key, settings, send) {
	const existing = ANNOUNCE_QUEUES.get(key);
	if (existing) {
		applyQueueRuntimeSettings({
			target: existing,
			settings
		});
		existing.send = send;
		return existing;
	}
	const created = {
		items: [],
		draining: false,
		lastEnqueuedAt: 0,
		mode: settings.mode,
		debounceMs: typeof settings.debounceMs === "number" ? Math.max(0, settings.debounceMs) : 1e3,
		cap: typeof settings.cap === "number" && settings.cap > 0 ? Math.floor(settings.cap) : 20,
		dropPolicy: settings.dropPolicy ?? "summarize",
		droppedCount: 0,
		summaryLines: [],
		send,
		consecutiveFailures: 0
	};
	applyQueueRuntimeSettings({
		target: created,
		settings
	});
	ANNOUNCE_QUEUES.set(key, created);
	return created;
}
function hasAnnounceCrossChannelItems(items) {
	return hasCrossChannelItems(items, (item) => {
		if (!item.origin) return {};
		if (!item.originKey) return { cross: true };
		return { key: item.originKey };
	});
}
function scheduleAnnounceDrain(key) {
	const queue = beginQueueDrain(ANNOUNCE_QUEUES, key);
	if (!queue) return;
	(async () => {
		try {
			const collectState = { forceIndividualCollect: false };
			for (;;) {
				if (queue.items.length === 0 && queue.droppedCount === 0) break;
				await waitForQueueDebounce(queue);
				if (queue.mode === "collect") {
					const collectDrainResult = await drainCollectQueueStep({
						collectState,
						isCrossChannel: hasAnnounceCrossChannelItems(queue.items),
						items: queue.items,
						run: async (item) => await queue.send(item)
					});
					if (collectDrainResult === "empty") break;
					if (collectDrainResult === "drained") continue;
					const items = queue.items.slice();
					const summary = previewQueueSummaryPrompt({
						state: queue,
						noun: "announce"
					});
					const prompt = buildCollectPrompt({
						title: "[Queued announce messages while agent was busy]",
						items,
						summary,
						renderItem: (item, idx) => `---\nQueued #${idx + 1}\n${item.prompt}`.trim()
					});
					const internalEvents = items.flatMap((item) => item.internalEvents ?? []);
					const last = items.at(-1);
					if (!last) break;
					await queue.send({
						...last,
						prompt,
						internalEvents: internalEvents.length > 0 ? internalEvents : last.internalEvents
					});
					queue.items.splice(0, items.length);
					if (summary) clearQueueSummaryState(queue);
					continue;
				}
				const summaryPrompt = previewQueueSummaryPrompt({
					state: queue,
					noun: "announce"
				});
				if (summaryPrompt) {
					if (!await drainNextQueueItem(queue.items, async (item) => await queue.send({
						...item,
						prompt: summaryPrompt
					}))) break;
					clearQueueSummaryState(queue);
					continue;
				}
				if (!await drainNextQueueItem(queue.items, async (item) => await queue.send(item))) break;
			}
			queue.consecutiveFailures = 0;
		} catch (err) {
			queue.consecutiveFailures++;
			const errorBackoffMs = Math.min(1e3 * 2 ** queue.consecutiveFailures, 6e4);
			const retryDelayMs = Math.max(errorBackoffMs, queue.debounceMs);
			queue.lastEnqueuedAt = Date.now() + retryDelayMs - queue.debounceMs;
			defaultRuntime.error?.(`announce queue drain failed for ${key} (attempt ${queue.consecutiveFailures}, retry in ${Math.round(retryDelayMs / 1e3)}s): ${String(err)}`);
		} finally {
			queue.draining = false;
			if (queue.items.length === 0 && queue.droppedCount === 0) ANNOUNCE_QUEUES.delete(key);
			else scheduleAnnounceDrain(key);
		}
	})();
}
function enqueueAnnounce(params) {
	const queue = getAnnounceQueue(params.key, params.settings, params.send);
	queue.lastEnqueuedAt = Math.max(queue.lastEnqueuedAt, Date.now());
	if (!applyQueueDropPolicy({
		queue,
		summarize: (item) => item.summaryLine?.trim() || item.prompt.trim()
	})) {
		if (queue.dropPolicy === "new") scheduleAnnounceDrain(params.key);
		return false;
	}
	const origin = normalizeDeliveryContext(params.item.origin);
	const originKey = deliveryContextKey(origin);
	queue.items.push({
		...params.item,
		origin,
		originKey
	});
	scheduleAnnounceDrain(params.key);
	return true;
}
//#endregion
export { enqueueAnnounce as t };
