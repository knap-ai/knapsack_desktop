import "../../paths-BZtyHNCi.js";
import { E as resolveAgentIdFromSessionKey, T as normalizeMainKey, l as ensureAgentWorkspace, w as normalizeAgentId } from "../../workspace-CUznpDHg.js";
import { _ as DEFAULT_CHAT_CHANNEL, d as defaultRuntime, l as createSubsystemLogger } from "../../exec-DBtWJ4Ld.js";
import { a as resolveAgentModelPrimary, i as resolveAgentModelFallbacksOverride, o as resolveAgentSkillsFilter, r as resolveAgentDir, s as resolveAgentWorkspaceDir, t as listAgentIds } from "../../agent-scope-xZu8sXcF.js";
import { a as normalizeOutboundPayloadsForJson, i as normalizeOutboundPayloads, r as formatOutboundPayloadLog, t as deliverOutboundPayloads, w as SILENT_REPLY_TOKEN } from "../../deliver-aThCVOeQ.js";
import { A as getSkillsSnapshotVersion, G as resolveAgentTimeoutMs, J as clearAgentRunContext, K as AGENT_LANE_NESTED, M as clearSessionAuthProfileOverride, N as applyModelOverrideToSessionEntry, O as resolveSendPolicy, P as applyVerboseOverride, T as hasNonzeroUsage, X as registerAgentRunContext, Y as emitAgentEvent, b as resolveSessionDeliveryTarget, g as runCliAgent, h as setCliSessionId, j as lookupContextTokens, k as getRemoteSkillEligibility, m as getCliSessionId, t as runEmbeddedPiAgent, w as deriveSessionTotalTokens, x as runWithModelFallback, y as resolveOutboundTarget } from "../../pi-embedded-D69Ciu0d.js";
import { F as getChannelPlugin, L as normalizeChannelId, b as resolveMessageChannel, f as INTERNAL_MESSAGE_CHANNEL, h as isInternalMessageChannel, m as isGatewayMessageChannel, p as isDeliverableMessageChannel, v as normalizeMessageChannel } from "../../image-ops-CQkyIkuI.js";
import "../../boolean-Bb19hm9Y.js";
import { C as modelKey, E as resolveConfiguredModelRef, L as DEFAULT_CONTEXT_TOKENS, R as DEFAULT_MODEL, S as isCliProvider, h as ensureAuthProfileStore, k as resolveThinkingDefault, y as buildAllowedModelSet, z as DEFAULT_PROVIDER } from "../../model-auth-BffKC6OJ.js";
import { t as formatCliCommand } from "../../command-format-BmTFj7S4.js";
import { n as loadConfig } from "../../config-DAGaFnCt.js";
import "../../send-oeFwp37b.js";
import "../../send-Cv6A4K4k.js";
import "../../send-BWIKm-Ci.js";
import "../../github-copilot-token-BRNzgUa_.js";
import "../../pi-model-discovery-Cexg1XRf.js";
import { J as loadSessionStore, Nt as buildWorkspaceSkillSnapshot, Q as updateSessionStore, a as formatXHighModelHint, d as normalizeVerboseLevel, dt as resolveChannelResetConfig, ft as resolveSessionResetPolicy, i as formatThinkingLevels, l as normalizeThinkLevel, lt as resolveSessionKey, p as supportsXHighThinking, pt as resolveSessionResetType, st as normalizeAccountId, ut as evaluateSessionFreshness, vt as resolveExplicitAgentSessionKey, yt as resolveMainSessionKey } from "../../pi-embedded-helpers-mrBZwZ9b.js";
import "../../chrome-DdEflVKx.js";
import "../../frontmatter-Uu27Y56g.js";
import "../../store-l7p5BQMc.js";
import { n as resolveSessionFilePath, s as resolveStorePath } from "../../paths-CpGplyYJ.js";
import "../../tool-images-BVaD9DCP.js";
import "../../image-CZapiPj9.js";
import "../../manager-TKJUwtha.js";
import "../../sqlite-Dashr12i.js";
import "../../retry-BhlI4gtw.js";
import "../../redact-DcuzVizL.js";
import "../../common-fdrT4FYK.js";
import "../../ir-XjRYsEjJ.js";
import "../../fetch-BUVoWGPC.js";
import "../../render-CiikiGbn.js";
import { s as loadModelCatalog } from "../../runner-C0QyHqy1.js";
import "../../send-B9PAu0LZ.js";
import "../../send-CV8EAKqp.js";
import "../../channel-activity-BHDtnoEK.js";
import "../../tables-BY2rftQn.js";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

//#region src/cli/deps.ts
function createDefaultDeps() {
	return {
		sendMessageWhatsApp: async (...args) => {
			const { sendMessageWhatsApp } = await import("../../web-DdkHYTHf.js");
			return await sendMessageWhatsApp(...args);
		},
		sendMessageTelegram: async (...args) => {
			const { sendMessageTelegram } = await import("../../send-BWIKm-Ci.js").then((n) => n.s);
			return await sendMessageTelegram(...args);
		},
		sendMessageDiscord: async (...args) => {
			const { sendMessageDiscord } = await import("../../send-Cv6A4K4k.js").then((n) => n.t);
			return await sendMessageDiscord(...args);
		},
		sendMessageSlack: async (...args) => {
			const { sendMessageSlack } = await import("../../send-oeFwp37b.js").then((n) => n.n);
			return await sendMessageSlack(...args);
		},
		sendMessageSignal: async (...args) => {
			const { sendMessageSignal } = await import("../../send-B9PAu0LZ.js").then((n) => n.i);
			return await sendMessageSignal(...args);
		},
		sendMessageIMessage: async (...args) => {
			const { sendMessageIMessage } = await import("../../send-CV8EAKqp.js").then((n) => n.n);
			return await sendMessageIMessage(...args);
		}
	};
}

//#endregion
//#region src/cli/outbound-send-deps.ts
function createOutboundSendDeps(deps) {
	return {
		sendWhatsApp: deps.sendMessageWhatsApp,
		sendTelegram: deps.sendMessageTelegram,
		sendDiscord: deps.sendMessageDiscord,
		sendSlack: deps.sendMessageSlack,
		sendSignal: deps.sendMessageSignal,
		sendIMessage: deps.sendMessageIMessage
	};
}

//#endregion
//#region src/infra/outbound/agent-delivery.ts
function resolveAgentDeliveryPlan(params) {
	const requestedRaw = typeof params.requestedChannel === "string" ? params.requestedChannel.trim() : "";
	const requestedChannel = (requestedRaw ? normalizeMessageChannel(requestedRaw) : void 0) || "last";
	const explicitTo = typeof params.explicitTo === "string" && params.explicitTo.trim() ? params.explicitTo.trim() : void 0;
	const baseDelivery = resolveSessionDeliveryTarget({
		entry: params.sessionEntry,
		requestedChannel: requestedChannel === INTERNAL_MESSAGE_CHANNEL ? "last" : requestedChannel,
		explicitTo,
		explicitThreadId: params.explicitThreadId
	});
	const resolvedChannel = (() => {
		if (requestedChannel === INTERNAL_MESSAGE_CHANNEL) return INTERNAL_MESSAGE_CHANNEL;
		if (requestedChannel === "last") {
			if (baseDelivery.channel && baseDelivery.channel !== INTERNAL_MESSAGE_CHANNEL) return baseDelivery.channel;
			return params.wantsDelivery ? DEFAULT_CHAT_CHANNEL : INTERNAL_MESSAGE_CHANNEL;
		}
		if (isGatewayMessageChannel(requestedChannel)) return requestedChannel;
		if (baseDelivery.channel && baseDelivery.channel !== INTERNAL_MESSAGE_CHANNEL) return baseDelivery.channel;
		return params.wantsDelivery ? DEFAULT_CHAT_CHANNEL : INTERNAL_MESSAGE_CHANNEL;
	})();
	const deliveryTargetMode = explicitTo ? "explicit" : isDeliverableMessageChannel(resolvedChannel) ? "implicit" : void 0;
	const resolvedAccountId = normalizeAccountId(params.accountId) ?? (deliveryTargetMode === "implicit" ? baseDelivery.accountId : void 0);
	let resolvedTo = explicitTo;
	if (!resolvedTo && isDeliverableMessageChannel(resolvedChannel) && resolvedChannel === baseDelivery.lastChannel) resolvedTo = baseDelivery.lastTo;
	return {
		baseDelivery,
		resolvedChannel,
		resolvedTo,
		resolvedAccountId,
		resolvedThreadId: baseDelivery.threadId,
		deliveryTargetMode
	};
}
function resolveAgentOutboundTarget(params) {
	const targetMode = params.targetMode ?? params.plan.deliveryTargetMode ?? (params.plan.resolvedTo ? "explicit" : "implicit");
	if (!isDeliverableMessageChannel(params.plan.resolvedChannel)) return {
		resolvedTarget: null,
		resolvedTo: params.plan.resolvedTo,
		targetMode
	};
	if (params.validateExplicitTarget !== true && params.plan.resolvedTo) return {
		resolvedTarget: null,
		resolvedTo: params.plan.resolvedTo,
		targetMode
	};
	const resolvedTarget = resolveOutboundTarget({
		channel: params.plan.resolvedChannel,
		to: params.plan.resolvedTo,
		cfg: params.cfg,
		accountId: params.plan.resolvedAccountId,
		mode: targetMode
	});
	return {
		resolvedTarget,
		resolvedTo: resolvedTarget.ok ? resolvedTarget.to : params.plan.resolvedTo,
		targetMode
	};
}

//#endregion
//#region src/infra/outbound/envelope.ts
const isOutboundPayloadJson = (payload) => "mediaUrl" in payload;
function buildOutboundResultEnvelope(params) {
	const hasPayloads = params.payloads !== void 0;
	const payloads = params.payloads === void 0 ? void 0 : params.payloads.length === 0 ? [] : isOutboundPayloadJson(params.payloads[0]) ? params.payloads : normalizeOutboundPayloadsForJson(params.payloads);
	if (params.flattenDelivery !== false && params.delivery && !params.meta && !hasPayloads) return params.delivery;
	return {
		...hasPayloads ? { payloads } : {},
		...params.meta ? { meta: params.meta } : {},
		...params.delivery ? { delivery: params.delivery } : {}
	};
}

//#endregion
//#region src/commands/agent/delivery.ts
const NESTED_LOG_PREFIX = "[agent:nested]";
function formatNestedLogPrefix(opts) {
	const parts = [NESTED_LOG_PREFIX];
	const session = opts.sessionKey ?? opts.sessionId;
	if (session) parts.push(`session=${session}`);
	if (opts.runId) parts.push(`run=${opts.runId}`);
	const channel = opts.messageChannel ?? opts.channel;
	if (channel) parts.push(`channel=${channel}`);
	if (opts.to) parts.push(`to=${opts.to}`);
	if (opts.accountId) parts.push(`account=${opts.accountId}`);
	return parts.join(" ");
}
function logNestedOutput(runtime, opts, output) {
	const prefix = formatNestedLogPrefix(opts);
	for (const line of output.split(/\r?\n/)) {
		if (!line) continue;
		runtime.log(`${prefix} ${line}`);
	}
}
async function deliverAgentCommandResult(params) {
	const { cfg, deps, runtime, opts, sessionEntry, payloads, result } = params;
	const deliver = opts.deliver === true;
	const bestEffortDeliver = opts.bestEffortDeliver === true;
	const deliveryPlan = resolveAgentDeliveryPlan({
		sessionEntry,
		requestedChannel: opts.replyChannel ?? opts.channel,
		explicitTo: opts.replyTo ?? opts.to,
		explicitThreadId: opts.threadId,
		accountId: opts.replyAccountId ?? opts.accountId,
		wantsDelivery: deliver
	});
	const deliveryChannel = deliveryPlan.resolvedChannel;
	const deliveryPlugin = !isInternalMessageChannel(deliveryChannel) ? getChannelPlugin(normalizeChannelId(deliveryChannel) ?? deliveryChannel) : void 0;
	const isDeliveryChannelKnown = isInternalMessageChannel(deliveryChannel) || Boolean(deliveryPlugin);
	const targetMode = opts.deliveryTargetMode ?? deliveryPlan.deliveryTargetMode ?? (opts.to ? "explicit" : "implicit");
	const resolvedAccountId = deliveryPlan.resolvedAccountId;
	const resolved = deliver && isDeliveryChannelKnown && deliveryChannel ? resolveAgentOutboundTarget({
		cfg,
		plan: deliveryPlan,
		targetMode,
		validateExplicitTarget: true
	}) : {
		resolvedTarget: null,
		resolvedTo: deliveryPlan.resolvedTo,
		targetMode
	};
	const resolvedTarget = resolved.resolvedTarget;
	const deliveryTarget = resolved.resolvedTo;
	const resolvedThreadId = deliveryPlan.resolvedThreadId ?? opts.threadId;
	const resolvedReplyToId = deliveryChannel === "slack" && resolvedThreadId != null ? String(resolvedThreadId) : void 0;
	const resolvedThreadTarget = deliveryChannel === "slack" ? void 0 : resolvedThreadId;
	const logDeliveryError = (err) => {
		const message = `Delivery failed (${deliveryChannel}${deliveryTarget ? ` to ${deliveryTarget}` : ""}): ${String(err)}`;
		runtime.error?.(message);
		if (!runtime.error) runtime.log(message);
	};
	if (deliver) {
		if (!isDeliveryChannelKnown) {
			const err = /* @__PURE__ */ new Error(`Unknown channel: ${deliveryChannel}`);
			if (!bestEffortDeliver) throw err;
			logDeliveryError(err);
		} else if (resolvedTarget && !resolvedTarget.ok) {
			if (!bestEffortDeliver) throw resolvedTarget.error;
			logDeliveryError(resolvedTarget.error);
		}
	}
	const normalizedPayloads = normalizeOutboundPayloadsForJson(payloads ?? []);
	if (opts.json) {
		runtime.log(JSON.stringify(buildOutboundResultEnvelope({
			payloads: normalizedPayloads,
			meta: result.meta
		}), null, 2));
		if (!deliver) return {
			payloads: normalizedPayloads,
			meta: result.meta
		};
	}
	if (!payloads || payloads.length === 0) {
		runtime.log("No reply from agent.");
		return {
			payloads: [],
			meta: result.meta
		};
	}
	const deliveryPayloads = normalizeOutboundPayloads(payloads);
	const logPayload = (payload) => {
		if (opts.json) return;
		const output = formatOutboundPayloadLog(payload);
		if (!output) return;
		if (opts.lane === AGENT_LANE_NESTED) {
			logNestedOutput(runtime, opts, output);
			return;
		}
		runtime.log(output);
	};
	if (!deliver) for (const payload of deliveryPayloads) logPayload(payload);
	if (deliver && deliveryChannel && !isInternalMessageChannel(deliveryChannel)) {
		if (deliveryTarget) await deliverOutboundPayloads({
			cfg,
			channel: deliveryChannel,
			to: deliveryTarget,
			accountId: resolvedAccountId,
			payloads: deliveryPayloads,
			replyToId: resolvedReplyToId ?? null,
			threadId: resolvedThreadTarget ?? null,
			bestEffort: bestEffortDeliver,
			onError: (err) => logDeliveryError(err),
			onPayload: logPayload,
			deps: createOutboundSendDeps(deps)
		});
	}
	return {
		payloads: normalizedPayloads,
		meta: result.meta
	};
}

//#endregion
//#region src/commands/agent/run-context.ts
function resolveAgentRunContext(opts) {
	const merged = opts.runContext ? { ...opts.runContext } : {};
	const normalizedChannel = resolveMessageChannel(merged.messageChannel ?? opts.messageChannel, opts.replyChannel ?? opts.channel);
	if (normalizedChannel) merged.messageChannel = normalizedChannel;
	const normalizedAccountId = normalizeAccountId(merged.accountId ?? opts.accountId);
	if (normalizedAccountId) merged.accountId = normalizedAccountId;
	const groupId = (merged.groupId ?? opts.groupId)?.toString().trim();
	if (groupId) merged.groupId = groupId;
	const groupChannel = (merged.groupChannel ?? opts.groupChannel)?.toString().trim();
	if (groupChannel) merged.groupChannel = groupChannel;
	const groupSpace = (merged.groupSpace ?? opts.groupSpace)?.toString().trim();
	if (groupSpace) merged.groupSpace = groupSpace;
	if (merged.currentThreadTs == null && opts.threadId != null && opts.threadId !== "" && opts.threadId !== null) merged.currentThreadTs = String(opts.threadId);
	if (!merged.currentChannelId && opts.to) {
		const trimmedTo = opts.to.trim();
		if (trimmedTo) merged.currentChannelId = trimmedTo;
	}
	return merged;
}

//#endregion
//#region src/commands/agent/session-store.ts
async function updateSessionStoreAfterAgentRun(params) {
	const { cfg, sessionId, sessionKey, storePath, sessionStore, defaultProvider, defaultModel, fallbackProvider, fallbackModel, result } = params;
	const usage = result.meta.agentMeta?.usage;
	const promptTokens = result.meta.agentMeta?.promptTokens;
	const compactionsThisRun = Math.max(0, result.meta.agentMeta?.compactionCount ?? 0);
	const modelUsed = result.meta.agentMeta?.model ?? fallbackModel ?? defaultModel;
	const providerUsed = result.meta.agentMeta?.provider ?? fallbackProvider ?? defaultProvider;
	const contextTokens = params.contextTokensOverride ?? lookupContextTokens(modelUsed) ?? DEFAULT_CONTEXT_TOKENS;
	const entry = sessionStore[sessionKey] ?? {
		sessionId,
		updatedAt: Date.now()
	};
	const next = {
		...entry,
		sessionId,
		updatedAt: Date.now(),
		modelProvider: providerUsed,
		model: modelUsed,
		contextTokens
	};
	if (isCliProvider(providerUsed, cfg)) {
		const cliSessionId = result.meta.agentMeta?.sessionId?.trim();
		if (cliSessionId) setCliSessionId(next, providerUsed, cliSessionId);
	}
	next.abortedLastRun = result.meta.aborted ?? false;
	if (hasNonzeroUsage(usage)) {
		const input = usage.input ?? 0;
		const output = usage.output ?? 0;
		const totalTokens = deriveSessionTotalTokens({
			usage,
			contextTokens,
			promptTokens
		}) ?? input;
		next.inputTokens = input;
		next.outputTokens = output;
		next.totalTokens = totalTokens;
		next.totalTokensFresh = true;
	}
	if (compactionsThisRun > 0) next.compactionCount = (entry.compactionCount ?? 0) + compactionsThisRun;
	sessionStore[sessionKey] = next;
	await updateSessionStore(storePath, (store) => {
		store[sessionKey] = next;
	});
}

//#endregion
//#region src/commands/agent/session.ts
function resolveSessionKeyForRequest(opts) {
	const sessionCfg = opts.cfg.session;
	const scope = sessionCfg?.scope ?? "per-sender";
	const mainKey = normalizeMainKey(sessionCfg?.mainKey);
	const explicitSessionKey = opts.sessionKey?.trim() || resolveExplicitAgentSessionKey({
		cfg: opts.cfg,
		agentId: opts.agentId
	});
	const storeAgentId = resolveAgentIdFromSessionKey(explicitSessionKey);
	const storePath = resolveStorePath(sessionCfg?.store, { agentId: storeAgentId });
	const sessionStore = loadSessionStore(storePath);
	const ctx = opts.to?.trim() ? { From: opts.to } : void 0;
	let sessionKey = explicitSessionKey ?? (ctx ? resolveSessionKey(scope, ctx, mainKey) : void 0);
	if (!explicitSessionKey && opts.sessionId && (!sessionKey || sessionStore[sessionKey]?.sessionId !== opts.sessionId)) {
		const foundKey = Object.keys(sessionStore).find((key) => sessionStore[key]?.sessionId === opts.sessionId);
		if (foundKey) sessionKey = foundKey;
	}
	if (opts.sessionId && !explicitSessionKey && (!sessionKey || sessionStore[sessionKey]?.sessionId !== opts.sessionId)) {
		const allAgentIds = listAgentIds(opts.cfg);
		for (const agentId of allAgentIds) {
			if (agentId === storeAgentId) continue;
			const altStorePath = resolveStorePath(sessionCfg?.store, { agentId });
			const altStore = loadSessionStore(altStorePath);
			const foundKey = Object.keys(altStore).find((key) => altStore[key]?.sessionId === opts.sessionId);
			if (foundKey) return {
				sessionKey: foundKey,
				sessionStore: altStore,
				storePath: altStorePath
			};
		}
	}
	return {
		sessionKey,
		sessionStore,
		storePath
	};
}
function resolveSession(opts) {
	const sessionCfg = opts.cfg.session;
	const { sessionKey, sessionStore, storePath } = resolveSessionKeyForRequest({
		cfg: opts.cfg,
		to: opts.to,
		sessionId: opts.sessionId,
		sessionKey: opts.sessionKey,
		agentId: opts.agentId
	});
	const now = Date.now();
	const sessionEntry = sessionKey ? sessionStore[sessionKey] : void 0;
	const resetPolicy = resolveSessionResetPolicy({
		sessionCfg,
		resetType: resolveSessionResetType({ sessionKey }),
		resetOverride: resolveChannelResetConfig({
			sessionCfg,
			channel: sessionEntry?.lastChannel ?? sessionEntry?.channel
		})
	});
	const fresh = sessionEntry ? evaluateSessionFreshness({
		updatedAt: sessionEntry.updatedAt,
		now,
		policy: resetPolicy
	}).fresh : false;
	return {
		sessionId: opts.sessionId?.trim() || (fresh ? sessionEntry?.sessionId : void 0) || crypto.randomUUID(),
		sessionKey,
		sessionEntry,
		sessionStore,
		storePath,
		isNewSession: !fresh && !opts.sessionId,
		persistedThinking: fresh && sessionEntry?.thinkingLevel ? normalizeThinkLevel(sessionEntry.thinkingLevel) : void 0,
		persistedVerbose: fresh && sessionEntry?.verboseLevel ? normalizeVerboseLevel(sessionEntry.verboseLevel) : void 0
	};
}

//#endregion
//#region src/commands/agent.ts
async function agentCommand(opts, runtime = defaultRuntime, deps = createDefaultDeps()) {
	const body = (opts.message ?? "").trim();
	if (!body) throw new Error("Message (--message) is required");
	if (!opts.to && !opts.sessionId && !opts.sessionKey && !opts.agentId) throw new Error("Pass --to <E.164>, --session-id, or --agent to choose a session");
	const cfg = loadConfig();
	const agentIdOverrideRaw = opts.agentId?.trim();
	const agentIdOverride = agentIdOverrideRaw ? normalizeAgentId(agentIdOverrideRaw) : void 0;
	if (agentIdOverride) {
		if (!listAgentIds(cfg).includes(agentIdOverride)) throw new Error(`Unknown agent id "${agentIdOverrideRaw}". Use "${formatCliCommand("openclaw agents list")}" to see configured agents.`);
	}
	if (agentIdOverride && opts.sessionKey) {
		const sessionAgentId = resolveAgentIdFromSessionKey(opts.sessionKey);
		if (sessionAgentId !== agentIdOverride) throw new Error(`Agent id "${agentIdOverrideRaw}" does not match session key agent "${sessionAgentId}".`);
	}
	const agentCfg = cfg.agents?.defaults;
	const sessionAgentId = agentIdOverride ?? resolveAgentIdFromSessionKey(opts.sessionKey?.trim());
	const workspaceDirRaw = resolveAgentWorkspaceDir(cfg, sessionAgentId);
	const agentDir = resolveAgentDir(cfg, sessionAgentId);
	const workspaceDir = (await ensureAgentWorkspace({
		dir: workspaceDirRaw,
		ensureBootstrapFiles: !agentCfg?.skipBootstrap
	})).dir;
	const configuredModel = resolveConfiguredModelRef({
		cfg,
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	});
	const thinkingLevelsHint = formatThinkingLevels(configuredModel.provider, configuredModel.model);
	const thinkOverride = normalizeThinkLevel(opts.thinking);
	const thinkOnce = normalizeThinkLevel(opts.thinkingOnce);
	if (opts.thinking && !thinkOverride) throw new Error(`Invalid thinking level. Use one of: ${thinkingLevelsHint}.`);
	if (opts.thinkingOnce && !thinkOnce) throw new Error(`Invalid one-shot thinking level. Use one of: ${thinkingLevelsHint}.`);
	const verboseOverride = normalizeVerboseLevel(opts.verbose);
	if (opts.verbose && !verboseOverride) throw new Error("Invalid verbose level. Use \"on\", \"full\", or \"off\".");
	const timeoutSecondsRaw = opts.timeout !== void 0 ? Number.parseInt(String(opts.timeout), 10) : void 0;
	if (timeoutSecondsRaw !== void 0 && (Number.isNaN(timeoutSecondsRaw) || timeoutSecondsRaw <= 0)) throw new Error("--timeout must be a positive integer (seconds)");
	const timeoutMs = resolveAgentTimeoutMs({
		cfg,
		overrideSeconds: timeoutSecondsRaw
	});
	const { sessionId, sessionKey, sessionEntry: resolvedSessionEntry, sessionStore, storePath, isNewSession, persistedThinking, persistedVerbose } = resolveSession({
		cfg,
		to: opts.to,
		sessionId: opts.sessionId,
		sessionKey: opts.sessionKey,
		agentId: agentIdOverride
	});
	let sessionEntry = resolvedSessionEntry;
	const runId = opts.runId?.trim() || sessionId;
	try {
		if (opts.deliver === true) {
			if (resolveSendPolicy({
				cfg,
				entry: sessionEntry,
				sessionKey,
				channel: sessionEntry?.channel,
				chatType: sessionEntry?.chatType
			}) === "deny") throw new Error("send blocked by session policy");
		}
		let resolvedThinkLevel = thinkOnce ?? thinkOverride ?? persistedThinking ?? agentCfg?.thinkingDefault;
		const resolvedVerboseLevel = verboseOverride ?? persistedVerbose ?? agentCfg?.verboseDefault;
		if (sessionKey) registerAgentRunContext(runId, {
			sessionKey,
			verboseLevel: resolvedVerboseLevel
		});
		const needsSkillsSnapshot = isNewSession || !sessionEntry?.skillsSnapshot;
		const skillsSnapshotVersion = getSkillsSnapshotVersion(workspaceDir);
		const skillFilter = resolveAgentSkillsFilter(cfg, sessionAgentId);
		const skillsSnapshot = needsSkillsSnapshot ? buildWorkspaceSkillSnapshot(workspaceDir, {
			config: cfg,
			eligibility: { remote: getRemoteSkillEligibility() },
			snapshotVersion: skillsSnapshotVersion,
			skillFilter
		}) : sessionEntry?.skillsSnapshot;
		if (skillsSnapshot && sessionStore && sessionKey && needsSkillsSnapshot) {
			const next = {
				...sessionEntry ?? {
					sessionId,
					updatedAt: Date.now()
				},
				sessionId,
				updatedAt: Date.now(),
				skillsSnapshot
			};
			sessionStore[sessionKey] = next;
			await updateSessionStore(storePath, (store) => {
				store[sessionKey] = next;
			});
			sessionEntry = next;
		}
		if (sessionStore && sessionKey) {
			const next = {
				...sessionStore[sessionKey] ?? sessionEntry ?? {
					sessionId,
					updatedAt: Date.now()
				},
				sessionId,
				updatedAt: Date.now()
			};
			if (thinkOverride) next.thinkingLevel = thinkOverride;
			applyVerboseOverride(next, verboseOverride);
			sessionStore[sessionKey] = next;
			await updateSessionStore(storePath, (store) => {
				store[sessionKey] = next;
			});
		}
		const agentModelPrimary = resolveAgentModelPrimary(cfg, sessionAgentId);
		const { provider: defaultProvider, model: defaultModel } = resolveConfiguredModelRef({
			cfg: agentModelPrimary ? {
				...cfg,
				agents: {
					...cfg.agents,
					defaults: {
						...cfg.agents?.defaults,
						model: {
							...typeof cfg.agents?.defaults?.model === "object" ? cfg.agents.defaults.model : void 0,
							primary: agentModelPrimary
						}
					}
				}
			} : cfg,
			defaultProvider: DEFAULT_PROVIDER,
			defaultModel: DEFAULT_MODEL
		});
		let provider = defaultProvider;
		let model = defaultModel;
		const hasAllowlist = agentCfg?.models && Object.keys(agentCfg.models).length > 0;
		const hasStoredOverride = Boolean(sessionEntry?.modelOverride || sessionEntry?.providerOverride);
		const needsModelCatalog = hasAllowlist || hasStoredOverride;
		let allowedModelKeys = /* @__PURE__ */ new Set();
		let allowedModelCatalog = [];
		let modelCatalog = null;
		if (needsModelCatalog) {
			modelCatalog = await loadModelCatalog({ config: cfg });
			const allowed = buildAllowedModelSet({
				cfg,
				catalog: modelCatalog,
				defaultProvider,
				defaultModel
			});
			allowedModelKeys = allowed.allowedKeys;
			allowedModelCatalog = allowed.allowedCatalog;
		}
		if (sessionEntry && sessionStore && sessionKey && hasStoredOverride) {
			const entry = sessionEntry;
			const overrideProvider = sessionEntry.providerOverride?.trim() || defaultProvider;
			const overrideModel = sessionEntry.modelOverride?.trim();
			if (overrideModel) {
				const key = modelKey(overrideProvider, overrideModel);
				if (!isCliProvider(overrideProvider, cfg) && allowedModelKeys.size > 0 && !allowedModelKeys.has(key)) {
					const { updated } = applyModelOverrideToSessionEntry({
						entry,
						selection: {
							provider: defaultProvider,
							model: defaultModel,
							isDefault: true
						}
					});
					if (updated) {
						sessionStore[sessionKey] = entry;
						await updateSessionStore(storePath, (store) => {
							store[sessionKey] = entry;
						});
					}
				}
			}
		}
		const storedProviderOverride = sessionEntry?.providerOverride?.trim();
		const storedModelOverride = sessionEntry?.modelOverride?.trim();
		if (storedModelOverride) {
			const candidateProvider = storedProviderOverride || defaultProvider;
			const key = modelKey(candidateProvider, storedModelOverride);
			if (isCliProvider(candidateProvider, cfg) || allowedModelKeys.size === 0 || allowedModelKeys.has(key)) {
				provider = candidateProvider;
				model = storedModelOverride;
			}
		}
		if (sessionEntry) {
			const authProfileId = sessionEntry.authProfileOverride;
			if (authProfileId) {
				const entry = sessionEntry;
				const profile = ensureAuthProfileStore().profiles[authProfileId];
				if (!profile || profile.provider !== provider) {
					if (sessionStore && sessionKey) await clearSessionAuthProfileOverride({
						sessionEntry: entry,
						sessionStore,
						sessionKey,
						storePath
					});
				}
			}
		}
		if (!resolvedThinkLevel) {
			let catalogForThinking = modelCatalog ?? allowedModelCatalog;
			if (!catalogForThinking || catalogForThinking.length === 0) {
				modelCatalog = await loadModelCatalog({ config: cfg });
				catalogForThinking = modelCatalog;
			}
			resolvedThinkLevel = resolveThinkingDefault({
				cfg,
				provider,
				model,
				catalog: catalogForThinking
			});
		}
		if (resolvedThinkLevel === "xhigh" && !supportsXHighThinking(provider, model)) {
			if (Boolean(thinkOnce || thinkOverride)) throw new Error(`Thinking level "xhigh" is only supported for ${formatXHighModelHint()}.`);
			resolvedThinkLevel = "high";
			if (sessionEntry && sessionStore && sessionKey && sessionEntry.thinkingLevel === "xhigh") {
				const entry = sessionEntry;
				entry.thinkingLevel = "high";
				entry.updatedAt = Date.now();
				sessionStore[sessionKey] = entry;
				await updateSessionStore(storePath, (store) => {
					store[sessionKey] = entry;
				});
			}
		}
		const sessionFile = resolveSessionFilePath(sessionId, sessionEntry, { agentId: sessionAgentId });
		const startedAt = Date.now();
		let lifecycleEnded = false;
		let result;
		let fallbackProvider = provider;
		let fallbackModel = model;
		try {
			const runContext = resolveAgentRunContext(opts);
			const messageChannel = resolveMessageChannel(runContext.messageChannel, opts.replyChannel ?? opts.channel);
			const spawnedBy = opts.spawnedBy ?? sessionEntry?.spawnedBy;
			const fallbackResult = await runWithModelFallback({
				cfg,
				provider,
				model,
				agentDir,
				fallbacksOverride: resolveAgentModelFallbacksOverride(cfg, sessionAgentId),
				run: (providerOverride, modelOverride) => {
					if (isCliProvider(providerOverride, cfg)) {
						const cliSessionId = getCliSessionId(sessionEntry, providerOverride);
						return runCliAgent({
							sessionId,
							sessionKey,
							agentId: sessionAgentId,
							sessionFile,
							workspaceDir,
							config: cfg,
							prompt: body,
							provider: providerOverride,
							model: modelOverride,
							thinkLevel: resolvedThinkLevel,
							timeoutMs,
							runId,
							extraSystemPrompt: opts.extraSystemPrompt,
							cliSessionId,
							images: opts.images,
							streamParams: opts.streamParams
						});
					}
					const authProfileId = providerOverride === provider ? sessionEntry?.authProfileOverride : void 0;
					return runEmbeddedPiAgent({
						sessionId,
						sessionKey,
						agentId: sessionAgentId,
						messageChannel,
						agentAccountId: runContext.accountId,
						messageTo: opts.replyTo ?? opts.to,
						messageThreadId: opts.threadId,
						groupId: runContext.groupId,
						groupChannel: runContext.groupChannel,
						groupSpace: runContext.groupSpace,
						spawnedBy,
						currentChannelId: runContext.currentChannelId,
						currentThreadTs: runContext.currentThreadTs,
						replyToMode: runContext.replyToMode,
						hasRepliedRef: runContext.hasRepliedRef,
						senderIsOwner: true,
						sessionFile,
						workspaceDir,
						config: cfg,
						skillsSnapshot,
						prompt: body,
						images: opts.images,
						clientTools: opts.clientTools,
						provider: providerOverride,
						model: modelOverride,
						authProfileId,
						authProfileIdSource: authProfileId ? sessionEntry?.authProfileOverrideSource : void 0,
						thinkLevel: resolvedThinkLevel,
						verboseLevel: resolvedVerboseLevel,
						timeoutMs,
						runId,
						lane: opts.lane,
						abortSignal: opts.abortSignal,
						extraSystemPrompt: opts.extraSystemPrompt,
						inputProvenance: opts.inputProvenance,
						streamParams: opts.streamParams,
						agentDir,
						onAgentEvent: (evt) => {
							if (evt.stream === "lifecycle" && typeof evt.data?.phase === "string" && (evt.data.phase === "end" || evt.data.phase === "error")) lifecycleEnded = true;
						}
					});
				}
			});
			result = fallbackResult.result;
			fallbackProvider = fallbackResult.provider;
			fallbackModel = fallbackResult.model;
			if (!lifecycleEnded) emitAgentEvent({
				runId,
				stream: "lifecycle",
				data: {
					phase: "end",
					startedAt,
					endedAt: Date.now(),
					aborted: result.meta.aborted ?? false
				}
			});
		} catch (err) {
			if (!lifecycleEnded) emitAgentEvent({
				runId,
				stream: "lifecycle",
				data: {
					phase: "error",
					startedAt,
					endedAt: Date.now(),
					error: String(err)
				}
			});
			throw err;
		}
		if (sessionStore && sessionKey) await updateSessionStoreAfterAgentRun({
			cfg,
			contextTokensOverride: agentCfg?.contextTokens,
			sessionId,
			sessionKey,
			storePath,
			sessionStore,
			defaultProvider: provider,
			defaultModel: model,
			fallbackProvider,
			fallbackModel,
			result
		});
		const payloads = result.payloads ?? [];
		return await deliverAgentCommandResult({
			cfg,
			deps,
			runtime,
			opts,
			sessionEntry,
			result,
			payloads
		});
	} finally {
		clearAgentRunContext(runId);
	}
}

//#endregion
//#region src/gateway/boot.ts
function generateBootSessionId() {
	return `boot-${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").replace("T", "_").replace("Z", "")}-${crypto.randomUUID().slice(0, 8)}`;
}
const log = createSubsystemLogger("gateway/boot");
const BOOT_FILENAME = "BOOT.md";
function buildBootPrompt(content) {
	return [
		"You are running a boot check. Follow BOOT.md instructions exactly.",
		"",
		"BOOT.md:",
		content,
		"",
		"If BOOT.md asks you to send a message, use the message tool (action=send with channel + target).",
		"Use the `target` field (not `to`) for message tool destinations.",
		`After sending with the message tool, reply with ONLY: ${SILENT_REPLY_TOKEN}.`,
		`If nothing needs attention, reply with ONLY: ${SILENT_REPLY_TOKEN}.`
	].join("\n");
}
async function loadBootFile(workspaceDir) {
	const bootPath = path.join(workspaceDir, BOOT_FILENAME);
	try {
		const trimmed = (await fs.readFile(bootPath, "utf-8")).trim();
		if (!trimmed) return { status: "empty" };
		return {
			status: "ok",
			content: trimmed
		};
	} catch (err) {
		if (err.code === "ENOENT") return { status: "missing" };
		throw err;
	}
}
async function runBootOnce(params) {
	const bootRuntime = {
		log: () => {},
		error: (message) => log.error(String(message)),
		exit: defaultRuntime.exit
	};
	let result;
	try {
		result = await loadBootFile(params.workspaceDir);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		log.error(`boot: failed to read ${BOOT_FILENAME}: ${message}`);
		return {
			status: "failed",
			reason: message
		};
	}
	if (result.status === "missing" || result.status === "empty") return {
		status: "skipped",
		reason: result.status
	};
	const sessionKey = resolveMainSessionKey(params.cfg);
	const message = buildBootPrompt(result.content ?? "");
	const sessionId = generateBootSessionId();
	try {
		await agentCommand({
			message,
			sessionKey,
			sessionId,
			deliver: false
		}, bootRuntime, params.deps);
		return { status: "ran" };
	} catch (err) {
		const messageText = err instanceof Error ? err.message : String(err);
		log.error(`boot: agent run failed: ${messageText}`);
		return {
			status: "failed",
			reason: messageText
		};
	}
}

//#endregion
//#region src/hooks/bundled/boot-md/handler.ts
const runBootChecklist = async (event) => {
	if (event.type !== "gateway" || event.action !== "startup") return;
	const context = event.context ?? {};
	if (!context.cfg || !context.workspaceDir) return;
	const deps = context.deps ?? createDefaultDeps();
	await runBootOnce({
		cfg: context.cfg,
		deps,
		workspaceDir: context.workspaceDir
	});
};

//#endregion
export { runBootChecklist as default };