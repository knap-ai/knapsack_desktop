import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { t as createOperatorApprovalsGatewayClient } from "./operator-approvals-client-CGHXKajQ.js";
import { t as buildChannelApprovalNativeTargetKey } from "./approval-native-target-key-DkH4SJHX.js";
//#region src/infra/approval-native-delivery.ts
function dedupeTargets(targets) {
	const seen = /* @__PURE__ */ new Set();
	const deduped = [];
	for (const target of targets) {
		const key = buildChannelApprovalNativeTargetKey(target.target);
		if (seen.has(key)) continue;
		seen.add(key);
		deduped.push(target);
	}
	return deduped;
}
async function resolveChannelNativeApprovalDeliveryPlan(params) {
	const adapter = params.adapter;
	if (!adapter) return {
		targets: [],
		originTarget: null,
		notifyOriginWhenDmOnly: false
	};
	const capabilities = adapter.describeDeliveryCapabilities({
		cfg: params.cfg,
		accountId: params.accountId,
		approvalKind: params.approvalKind,
		request: params.request
	});
	if (!capabilities.enabled) return {
		targets: [],
		originTarget: null,
		notifyOriginWhenDmOnly: false
	};
	const originTarget = capabilities.supportsOriginSurface && adapter.resolveOriginTarget ? await adapter.resolveOriginTarget({
		cfg: params.cfg,
		accountId: params.accountId,
		approvalKind: params.approvalKind,
		request: params.request
	}) ?? null : null;
	const approverDmTargets = capabilities.supportsApproverDmSurface && adapter.resolveApproverDmTargets ? await adapter.resolveApproverDmTargets({
		cfg: params.cfg,
		accountId: params.accountId,
		approvalKind: params.approvalKind,
		request: params.request
	}) : [];
	const plannedTargets = [];
	const preferOrigin = capabilities.preferredSurface === "origin" || capabilities.preferredSurface === "both";
	const preferApproverDm = capabilities.preferredSurface === "approver-dm" || capabilities.preferredSurface === "both";
	if (preferOrigin && originTarget) plannedTargets.push({
		surface: "origin",
		target: originTarget,
		reason: "preferred"
	});
	if (preferApproverDm) for (const target of approverDmTargets) plannedTargets.push({
		surface: "approver-dm",
		target,
		reason: "preferred"
	});
	else if (!originTarget) for (const target of approverDmTargets) plannedTargets.push({
		surface: "approver-dm",
		target,
		reason: "fallback"
	});
	return {
		targets: dedupeTargets(plannedTargets),
		originTarget,
		notifyOriginWhenDmOnly: capabilities.preferredSurface === "approver-dm" && capabilities.notifyOriginWhenDmOnly === true && originTarget !== null
	};
}
//#endregion
//#region src/infra/approval-native-route-notice.ts
function formatHumanList(values) {
	if (values.length === 0) return "";
	if (values.length === 1) return values[0];
	if (values.length === 2) return `${values[0]} or ${values[1]}`;
	return `${values.slice(0, -1).join(", ")}, or ${values.at(-1)}`;
}
function describeApprovalDeliveryDestination(params) {
	const surfaces = new Set(params.deliveredTargets.map((target) => target.surface));
	return surfaces.size === 1 && surfaces.has("approver-dm") ? `${params.channelLabel} DMs` : params.channelLabel;
}
function resolveApprovalRoutedElsewhereNoticeText(destinations) {
	const uniqueDestinations = Array.from(new Set(destinations.map((value) => value.trim()))).filter(Boolean);
	if (uniqueDestinations.length === 0) return null;
	return `Approval required. I sent the approval request to ${formatHumanList(uniqueDestinations.toSorted((a, b) => a.localeCompare(b)))}, not this chat.`;
}
//#endregion
//#region src/infra/approval-native-route-coordinator.ts
const activeApprovalRouteRuntimes = /* @__PURE__ */ new Map();
const pendingApprovalRouteNotices = /* @__PURE__ */ new Map();
let approvalRouteRuntimeSeq = 0;
const MAX_APPROVAL_ROUTE_NOTICE_TTL_MS = 5 * 6e4;
function normalizeChannel(value) {
	return normalizeLowercaseStringOrEmpty(value);
}
function clearPendingApprovalRouteNotice(approvalId) {
	const entry = pendingApprovalRouteNotices.get(approvalId);
	if (!entry) return;
	pendingApprovalRouteNotices.delete(approvalId);
	if (entry.cleanupTimeout) clearTimeout(entry.cleanupTimeout);
}
function createPendingApprovalRouteNotice(params) {
	const timeoutMs = Math.min(Math.max(0, params.request.expiresAtMs - Date.now()), MAX_APPROVAL_ROUTE_NOTICE_TTL_MS);
	const cleanupTimeout = setTimeout(() => {
		clearPendingApprovalRouteNotice(params.request.id);
	}, timeoutMs);
	cleanupTimeout.unref?.();
	return {
		request: params.request,
		approvalKind: params.approvalKind,
		expectedRuntimeIds: new Set(params.expectedRuntimeIds ?? []),
		reports: /* @__PURE__ */ new Map(),
		cleanupTimeout,
		finalized: false
	};
}
function resolveRouteNoticeTargetFromRequest(request) {
	const channel = request.request.turnSourceChannel?.trim();
	const to = request.request.turnSourceTo?.trim();
	if (!channel || !to) return null;
	return {
		channel,
		to,
		accountId: request.request.turnSourceAccountId ?? void 0,
		threadId: request.request.turnSourceThreadId ?? void 0
	};
}
function resolveFallbackRouteNoticeTarget(report) {
	const channel = report.channel?.trim();
	const to = report.deliveryPlan.originTarget?.to?.trim();
	if (!channel || !to) return null;
	return {
		channel,
		to,
		accountId: report.accountId ?? void 0,
		threadId: report.deliveryPlan.originTarget?.threadId ?? void 0
	};
}
function didReportDeliverToOrigin(report, originAccountId) {
	const originTarget = report.deliveryPlan.originTarget;
	if (!originTarget) return false;
	const reportAccountId = normalizeOptionalString(report.accountId);
	if (originAccountId !== void 0 && reportAccountId !== void 0 && reportAccountId !== originAccountId) return false;
	const originKey = buildChannelApprovalNativeTargetKey(originTarget);
	return report.deliveredTargets.some((plannedTarget) => buildChannelApprovalNativeTargetKey(plannedTarget.target) === originKey);
}
function resolveApprovalRouteNotice(params) {
	const explicitTarget = resolveRouteNoticeTargetFromRequest(params.request);
	const originChannel = normalizeChannel(explicitTarget?.channel ?? params.request.request.turnSourceChannel);
	const fallbackTarget = params.reports.filter((report) => normalizeChannel(report.channel) === originChannel || !originChannel).map(resolveFallbackRouteNoticeTarget).find((target) => target !== null) ?? null;
	const target = explicitTarget ? {
		...fallbackTarget,
		...explicitTarget,
		accountId: explicitTarget.accountId ?? fallbackTarget?.accountId,
		threadId: explicitTarget.threadId ?? fallbackTarget?.threadId
	} : fallbackTarget;
	if (!target) return null;
	const originAccountId = normalizeOptionalString(target.accountId);
	if (params.reports.some((report) => {
		if (originChannel && normalizeChannel(report.channel) !== originChannel) return false;
		return didReportDeliverToOrigin(report, originAccountId);
	})) return null;
	const text = resolveApprovalRoutedElsewhereNoticeText(params.reports.flatMap((report) => {
		if (!report.channelLabel || report.deliveredTargets.length === 0) return [];
		const reportChannel = normalizeChannel(report.channel);
		if (originChannel && reportChannel === originChannel && !report.deliveryPlan.notifyOriginWhenDmOnly) return [];
		const reportAccountId = normalizeOptionalString(report.accountId);
		if (originChannel && reportChannel === originChannel && originAccountId !== void 0 && reportAccountId !== void 0 && reportAccountId !== originAccountId) return [];
		return [describeApprovalDeliveryDestination({
			channelLabel: report.channelLabel,
			deliveredTargets: report.deliveredTargets
		})];
	}));
	if (!text) return null;
	const requestGateway = params.reports.find((report) => activeApprovalRouteRuntimes.has(report.runtimeId))?.requestGateway ?? params.reports[0]?.requestGateway;
	if (!requestGateway) return null;
	return {
		requestGateway,
		target,
		text
	};
}
async function maybeFinalizeApprovalRouteNotice(approvalId) {
	const entry = pendingApprovalRouteNotices.get(approvalId);
	if (!entry || entry.finalized) return;
	for (const runtimeId of entry.expectedRuntimeIds) if (!entry.reports.has(runtimeId)) return;
	entry.finalized = true;
	const reports = Array.from(entry.reports.values());
	const notice = resolveApprovalRouteNotice({
		request: entry.request,
		reports
	});
	clearPendingApprovalRouteNotice(approvalId);
	if (!notice) return;
	try {
		await notice.requestGateway("send", {
			channel: notice.target.channel,
			to: notice.target.to,
			accountId: notice.target.accountId ?? void 0,
			threadId: notice.target.threadId ?? void 0,
			message: notice.text,
			idempotencyKey: `approval-route-notice:${approvalId}`
		});
	} catch {}
}
function createApprovalNativeRouteReporter(params) {
	const runtimeId = `native-approval-route:${++approvalRouteRuntimeSeq}`;
	let registered = false;
	const report = async (payload) => {
		if (!registered || !params.handledKinds.has(payload.approvalKind)) return;
		const entry = pendingApprovalRouteNotices.get(payload.request.id) ?? createPendingApprovalRouteNotice({
			request: payload.request,
			approvalKind: payload.approvalKind,
			expectedRuntimeIds: [runtimeId]
		});
		entry.expectedRuntimeIds.add(runtimeId);
		entry.reports.set(runtimeId, {
			runtimeId,
			request: payload.request,
			channel: params.channel,
			channelLabel: params.channelLabel,
			accountId: params.accountId,
			deliveryPlan: payload.deliveryPlan,
			deliveredTargets: payload.deliveredTargets,
			requestGateway: params.requestGateway
		});
		pendingApprovalRouteNotices.set(payload.request.id, entry);
		await maybeFinalizeApprovalRouteNotice(payload.request.id);
	};
	return {
		observeRequest(payload) {
			if (!registered || !params.handledKinds.has(payload.approvalKind)) return;
			const entry = pendingApprovalRouteNotices.get(payload.request.id) ?? createPendingApprovalRouteNotice({
				request: payload.request,
				approvalKind: payload.approvalKind,
				expectedRuntimeIds: Array.from(activeApprovalRouteRuntimes.values()).filter((runtime) => runtime.handledKinds.has(payload.approvalKind)).map((runtime) => runtime.runtimeId)
			});
			entry.expectedRuntimeIds.add(runtimeId);
			pendingApprovalRouteNotices.set(payload.request.id, entry);
		},
		start() {
			if (registered) return;
			activeApprovalRouteRuntimes.set(runtimeId, {
				runtimeId,
				handledKinds: params.handledKinds,
				channel: params.channel,
				channelLabel: params.channelLabel,
				accountId: params.accountId,
				requestGateway: params.requestGateway
			});
			registered = true;
		},
		async reportSkipped(params) {
			await report({
				approvalKind: params.approvalKind,
				request: params.request,
				deliveryPlan: {
					targets: [],
					originTarget: null,
					notifyOriginWhenDmOnly: false
				},
				deliveredTargets: []
			});
		},
		async reportDelivery(params) {
			await report(params);
		},
		async stop() {
			if (!registered) return;
			registered = false;
			activeApprovalRouteRuntimes.delete(runtimeId);
			for (const entry of pendingApprovalRouteNotices.values()) {
				entry.expectedRuntimeIds.delete(runtimeId);
				if (entry.expectedRuntimeIds.size === 0) {
					clearPendingApprovalRouteNotice(entry.request.id);
					continue;
				}
				await maybeFinalizeApprovalRouteNotice(entry.request.id);
			}
		}
	};
}
//#endregion
//#region src/infra/exec-approval-channel-runtime.ts
function resolveApprovalReplayMethods(eventKinds) {
	const methods = [];
	if (eventKinds.has("exec")) methods.push("exec.approval.list");
	if (eventKinds.has("plugin")) methods.push("plugin.approval.list");
	return methods;
}
function createExecApprovalChannelRuntime(adapter) {
	const log = createSubsystemLogger(adapter.label);
	const nowMs = adapter.nowMs ?? Date.now;
	const eventKinds = new Set(adapter.eventKinds ?? ["exec"]);
	const pending = /* @__PURE__ */ new Map();
	let gatewayClient = null;
	let started = false;
	let shouldRun = false;
	let startPromise = null;
	const shouldKeepRunning = () => shouldRun;
	const spawn = (label, promise) => {
		promise.catch((err) => {
			const message = formatErrorMessage(err);
			log.error(`${label}: ${message}`);
		});
	};
	const stopClientIfInactive = (client) => {
		if (shouldKeepRunning()) return false;
		gatewayClient = null;
		client.stop();
		return true;
	};
	const clearPendingEntry = (approvalId) => {
		const entry = pending.get(approvalId);
		if (!entry) return null;
		pending.delete(approvalId);
		if (entry.timeoutId) clearTimeout(entry.timeoutId);
		return entry;
	};
	const handleExpired = async (approvalId) => {
		const entry = clearPendingEntry(approvalId);
		if (!entry) return;
		log.debug(`expired ${approvalId}`);
		await adapter.finalizeExpired?.({
			request: entry.request,
			entries: entry.entries
		});
	};
	const handleRequested = async (request, opts) => {
		if (opts?.ignoreIfInactive && !shouldKeepRunning()) return;
		if (!adapter.shouldHandle(request)) return;
		if (pending.has(request.id)) {
			log.debug(`ignored duplicate request ${request.id}`);
			return;
		}
		log.debug(`received request ${request.id}`);
		const entry = {
			request,
			entries: [],
			timeoutId: null,
			delivering: true,
			pendingResolution: null
		};
		pending.set(request.id, entry);
		let entries;
		try {
			entries = await adapter.deliverRequested(request);
		} catch (err) {
			if (pending.get(request.id) === entry) clearPendingEntry(request.id);
			throw err;
		}
		if (pending.get(request.id) !== entry) return;
		if (!entries.length) {
			pending.delete(request.id);
			return;
		}
		entry.entries = entries;
		entry.delivering = false;
		if (entry.pendingResolution) {
			pending.delete(request.id);
			log.debug(`resolved ${entry.pendingResolution.id} with ${entry.pendingResolution.decision}`);
			await adapter.finalizeResolved({
				request: entry.request,
				resolved: entry.pendingResolution,
				entries: entry.entries
			});
			return;
		}
		const timeoutMs = Math.max(0, request.expiresAtMs - nowMs());
		const timeoutId = setTimeout(() => {
			spawn("error handling approval expiration", handleExpired(request.id));
		}, timeoutMs);
		timeoutId.unref?.();
		entry.timeoutId = timeoutId;
	};
	const handleResolved = async (resolved) => {
		const entry = pending.get(resolved.id);
		if (!entry) return;
		if (entry.delivering) {
			entry.pendingResolution = resolved;
			return;
		}
		const finalizedEntry = clearPendingEntry(resolved.id);
		if (!finalizedEntry) return;
		log.debug(`resolved ${resolved.id} with ${resolved.decision}`);
		await adapter.finalizeResolved({
			request: finalizedEntry.request,
			resolved,
			entries: finalizedEntry.entries
		});
	};
	const handleGatewayEvent = (evt) => {
		if (evt.event === "exec.approval.requested" && eventKinds.has("exec")) {
			spawn("error handling approval request", handleRequested(evt.payload, { ignoreIfInactive: true }));
			return;
		}
		if (evt.event === "plugin.approval.requested" && eventKinds.has("plugin")) {
			spawn("error handling approval request", handleRequested(evt.payload, { ignoreIfInactive: true }));
			return;
		}
		if (evt.event === "exec.approval.resolved" && eventKinds.has("exec")) {
			spawn("error handling approval resolved", handleResolved(evt.payload));
			return;
		}
		if (evt.event === "plugin.approval.resolved" && eventKinds.has("plugin")) spawn("error handling approval resolved", handleResolved(evt.payload));
	};
	return {
		async start() {
			if (started) return;
			if (startPromise) {
				await startPromise;
				return;
			}
			shouldRun = true;
			startPromise = (async () => {
				if (!adapter.isConfigured()) {
					log.debug("disabled");
					return;
				}
				let readySettled = false;
				let resolveReady;
				let rejectReady;
				const ready = new Promise((resolve, reject) => {
					resolveReady = resolve;
					rejectReady = reject;
				});
				const settleReady = (fn) => {
					if (readySettled) return;
					readySettled = true;
					fn();
				};
				const client = await createOperatorApprovalsGatewayClient({
					config: adapter.cfg,
					gatewayUrl: adapter.gatewayUrl,
					clientDisplayName: adapter.clientDisplayName,
					onEvent: handleGatewayEvent,
					onHelloOk: () => {
						log.debug("connected to gateway");
						settleReady(resolveReady);
					},
					onConnectError: (err) => {
						log.error(`connect error: ${err.message}`);
						settleReady(() => rejectReady(err));
					},
					onClose: (code, reason) => {
						log.debug(`gateway closed: ${code} ${reason}`);
						settleReady(() => rejectReady(/* @__PURE__ */ new Error(`gateway closed: ${code} ${reason}`)));
					}
				});
				if (!shouldRun) {
					client.stop();
					return;
				}
				await adapter.beforeGatewayClientStart?.();
				gatewayClient = client;
				try {
					client.start();
					await ready;
					if (stopClientIfInactive(client)) return;
					for (const method of resolveApprovalReplayMethods(eventKinds)) {
						if (stopClientIfInactive(client)) return;
						const pendingRequests = await client.request(method, {});
						if (stopClientIfInactive(client)) return;
						for (const request of pendingRequests) {
							if (stopClientIfInactive(client)) return;
							await handleRequested(request, { ignoreIfInactive: true });
						}
					}
					started = true;
				} catch (error) {
					gatewayClient = null;
					started = false;
					client.stop();
					throw error;
				}
			})().finally(() => {
				startPromise = null;
			});
			await startPromise;
		},
		async stop() {
			shouldRun = false;
			if (startPromise) await startPromise.catch(() => {});
			if (!started && !gatewayClient) {
				await adapter.onStopped?.();
				return;
			}
			started = false;
			for (const entry of pending.values()) if (entry.timeoutId) clearTimeout(entry.timeoutId);
			pending.clear();
			gatewayClient?.stop();
			gatewayClient = null;
			await adapter.onStopped?.();
			log.debug("stopped");
		},
		handleRequested,
		handleResolved,
		handleExpired,
		async request(method, params) {
			if (!gatewayClient) throw new Error(`${adapter.label}: gateway client not connected`);
			return await gatewayClient.request(method, params);
		}
	};
}
//#endregion
//#region src/infra/approval-native-runtime.ts
async function deliverApprovalRequestViaChannelNativePlan(params) {
	const deliveryPlan = await resolveChannelNativeApprovalDeliveryPlan({
		cfg: params.cfg,
		accountId: params.accountId,
		approvalKind: params.approvalKind,
		request: params.request,
		adapter: params.adapter
	});
	const deliveredKeys = /* @__PURE__ */ new Set();
	const pendingEntries = [];
	const deliveredTargets = [];
	for (const plannedTarget of deliveryPlan.targets) try {
		const preparedTarget = await params.prepareTarget({
			plannedTarget,
			request: params.request
		});
		if (!preparedTarget) continue;
		if (deliveredKeys.has(preparedTarget.dedupeKey)) {
			params.onDuplicateSkipped?.({
				plannedTarget,
				preparedTarget,
				request: params.request
			});
			continue;
		}
		const entry = await params.deliverTarget({
			plannedTarget,
			preparedTarget: preparedTarget.target,
			request: params.request
		});
		if (!entry) continue;
		deliveredKeys.add(preparedTarget.dedupeKey);
		pendingEntries.push(entry);
		deliveredTargets.push(plannedTarget);
		params.onDelivered?.({
			plannedTarget,
			preparedTarget,
			request: params.request,
			entry
		});
	} catch (error) {
		params.onDeliveryError?.({
			error,
			plannedTarget,
			request: params.request
		});
	}
	return {
		entries: pendingEntries,
		deliveryPlan,
		deliveredTargets
	};
}
function defaultResolveApprovalKind(request) {
	return request.id.startsWith("plugin:") ? "plugin" : "exec";
}
function createChannelNativeApprovalRuntime(adapter) {
	const nowMs = adapter.nowMs ?? Date.now;
	const resolveApprovalKind = adapter.resolveApprovalKind ?? ((request) => defaultResolveApprovalKind(request));
	let runtimeRequest = null;
	const routeReporter = createApprovalNativeRouteReporter({
		handledKinds: new Set(adapter.eventKinds ?? ["exec"]),
		channel: adapter.channel,
		channelLabel: adapter.channelLabel,
		accountId: adapter.accountId,
		requestGateway: async (method, params) => {
			if (!runtimeRequest) throw new Error(`${adapter.label}: gateway client not connected`);
			return await runtimeRequest(method, params);
		}
	});
	const runtime = createExecApprovalChannelRuntime({
		label: adapter.label,
		clientDisplayName: adapter.clientDisplayName,
		cfg: adapter.cfg,
		gatewayUrl: adapter.gatewayUrl,
		eventKinds: adapter.eventKinds,
		isConfigured: adapter.isConfigured,
		shouldHandle: (request) => {
			const approvalKind = resolveApprovalKind(request);
			routeReporter.observeRequest({
				approvalKind,
				request
			});
			let shouldHandle;
			try {
				shouldHandle = adapter.shouldHandle(request);
			} catch (error) {
				routeReporter.reportSkipped({
					approvalKind,
					request
				});
				throw error;
			}
			if (shouldHandle) return shouldHandle;
			routeReporter.reportSkipped({
				approvalKind,
				request
			});
			return false;
		},
		finalizeResolved: adapter.finalizeResolved,
		finalizeExpired: adapter.finalizeExpired,
		onStopped: adapter.onStopped,
		beforeGatewayClientStart: () => {
			routeReporter.start();
		},
		nowMs,
		deliverRequested: async (request) => {
			const approvalKind = resolveApprovalKind(request);
			let deliveryPlan = {
				targets: [],
				originTarget: null,
				notifyOriginWhenDmOnly: false
			};
			let deliveredTargets = [];
			try {
				const pendingContent = await adapter.buildPendingContent({
					request,
					approvalKind,
					nowMs: nowMs()
				});
				const deliveryResult = await deliverApprovalRequestViaChannelNativePlan({
					cfg: adapter.cfg,
					accountId: adapter.accountId,
					approvalKind,
					request,
					adapter: adapter.nativeAdapter,
					prepareTarget: async ({ plannedTarget, request }) => await adapter.prepareTarget({
						plannedTarget,
						request,
						approvalKind,
						pendingContent
					}),
					deliverTarget: async ({ plannedTarget, preparedTarget, request }) => await adapter.deliverTarget({
						plannedTarget,
						preparedTarget,
						request,
						approvalKind,
						pendingContent
					}),
					onDeliveryError: adapter.onDeliveryError ? ({ error, plannedTarget, request }) => {
						adapter.onDeliveryError?.({
							error,
							plannedTarget,
							request,
							approvalKind,
							pendingContent
						});
					} : void 0,
					onDuplicateSkipped: adapter.onDuplicateSkipped ? ({ plannedTarget, preparedTarget, request }) => {
						adapter.onDuplicateSkipped?.({
							plannedTarget,
							preparedTarget,
							request,
							approvalKind,
							pendingContent
						});
					} : void 0,
					onDelivered: adapter.onDelivered ? ({ plannedTarget, preparedTarget, request, entry }) => {
						adapter.onDelivered?.({
							plannedTarget,
							preparedTarget,
							request,
							approvalKind,
							pendingContent,
							entry
						});
					} : void 0
				});
				deliveryPlan = deliveryResult.deliveryPlan;
				deliveredTargets = deliveryResult.deliveredTargets;
				return deliveryResult.entries;
			} finally {
				await routeReporter.reportDelivery({
					approvalKind,
					request,
					deliveryPlan,
					deliveredTargets
				});
			}
		}
	});
	runtimeRequest = (method, params) => runtime.request(method, params);
	return {
		...runtime,
		async start() {
			try {
				await runtime.start();
			} catch (error) {
				await routeReporter.stop();
				throw error;
			}
		},
		async stop() {
			await routeReporter.stop();
			await runtime.stop();
		}
	};
}
//#endregion
export { resolveChannelNativeApprovalDeliveryPlan as i, deliverApprovalRequestViaChannelNativePlan as n, createExecApprovalChannelRuntime as r, createChannelNativeApprovalRuntime as t };
