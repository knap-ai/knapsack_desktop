import { r as logVerbose } from "./globals-BJZkpw-q.js";
import { d as updateSessionStore, i as loadSessionStore } from "./store-BGmy-Wot.js";
import "./sessions-DC7OiAdD.js";
import { r as getSessionBindingService } from "./session-binding-service-CAxmjUEJ.js";
import { $n as sanitizeTaskStatusText, B as resolveAcpThreadSessionDetailLines, Cn as validateRuntimeModeInput, Dn as resolveAcpSessionResolutionError, G as cleanupFailedAcpSpawn, H as resolveAcpAgentPolicyError, K as findLatestTaskForRelatedSessionKeyForOwner, L as resolveAcpSpawnRuntimePolicyError, Mn as toAcpRuntimeError, R as resolveAcpSessionCwd, Sn as validateRuntimeCwdInput, Tn as validateRuntimePermissionProfileInput, U as resolveAcpDispatchPolicyError, V as isAcpEnabledByPolicy, W as resolveAcpDispatchPolicyMessage, bn as parseRuntimeTimeoutSecondsInput, fn as getAcpSessionManager, gn as getAcpRuntimeBackend, mn as resolveSessionStorePathForAcp, vn as requireAcpRuntimeBackend, wn as validateRuntimeModelInput, xn as validateRuntimeConfigOptionInput, z as resolveAcpSessionIdentifierLinesFromIdentity } from "./pi-embedded-BYdcxQ5A.js";
import { a as requiresNativeThreadContextForThreadHere, c as resolveThreadBindingIdleTimeoutMsForChannel, d as resolveThreadBindingMaxAgeMsForChannel, f as resolveThreadBindingPlacementForCurrentContext, i as formatThreadBindingSpawnDisabledError, p as resolveThreadBindingSpawnPolicy, r as formatThreadBindingDisabledError, v as resolveThreadBindingIntroText, y as resolveThreadBindingThreadName } from "./thread-bindings-policy-ypJ47uk9.js";
import { u as requireGatewayClientScopeForInternalChannel } from "./commands-models-C7cfE2pl.js";
import { t as formatAcpRuntimeErrorText } from "./error-text-CtgJQqdg.js";
import { A as ACP_SET_MODE_USAGE, B as parseSpawnInput, C as ACP_CWD_USAGE, D as ACP_PERMISSIONS_USAGE, E as ACP_MODEL_USAGE, F as formatAcpCapabilitiesText, G as stopWithText, H as resolveAcpAction, I as formatRuntimeOptionsText, J as resolveConfiguredAcpBackendId, K as withAcpCommandErrorBoundary, L as parseOptionalSingleTarget, M as ACP_TIMEOUT_USAGE, N as COMMAND, O as ACP_RESET_OPTIONS_USAGE, P as collectAcpErrorText, Q as resolveAcpCommandThreadId, R as parseSetCommandInput, T as ACP_INSTALL_USAGE, U as resolveAcpHelpText, V as parseSteerInput, W as resolveCommandRequestId, X as resolveAcpCommandBindingContext, Y as resolveAcpCommandAccountId, Z as resolveAcpCommandConversationId, j as ACP_STATUS_USAGE, k as ACP_SESSIONS_USAGE, n as resolveBoundAcpThreadSessionKey, q as resolveAcpInstallCommandHint, t as resolveAcpTargetSessionKey, w as ACP_DOCTOR_USAGE, z as parseSingleValueCommandInput } from "./targets-B2kSozK7.js";
import { randomUUID } from "node:crypto";
//#region src/auto-reply/reply/commands-acp/diagnostics.ts
async function handleAcpDoctorAction(params, restTokens) {
	if (restTokens.length > 0) return stopWithText(`⚠️ ${ACP_DOCTOR_USAGE}`);
	const backendId = resolveConfiguredAcpBackendId(params.cfg);
	const installHint = resolveAcpInstallCommandHint(params.cfg);
	const registeredBackend = getAcpRuntimeBackend(backendId);
	const managerSnapshot = getAcpSessionManager().getObservabilitySnapshot(params.cfg);
	const lines = [
		"ACP doctor:",
		"-----",
		`configuredBackend: ${backendId}`
	];
	lines.push(`activeRuntimeSessions: ${managerSnapshot.runtimeCache.activeSessions}`);
	lines.push(`runtimeIdleTtlMs: ${managerSnapshot.runtimeCache.idleTtlMs}`);
	lines.push(`evictedIdleRuntimes: ${managerSnapshot.runtimeCache.evictedTotal}`);
	lines.push(`activeTurns: ${managerSnapshot.turns.active}`);
	lines.push(`queueDepth: ${managerSnapshot.turns.queueDepth}`);
	lines.push(`turnLatencyMs: avg=${managerSnapshot.turns.averageLatencyMs}, max=${managerSnapshot.turns.maxLatencyMs}`);
	lines.push(`turnCounts: completed=${managerSnapshot.turns.completed}, failed=${managerSnapshot.turns.failed}`);
	const errorStatsText = Object.entries(managerSnapshot.errorsByCode).map(([code, count]) => `${code}=${count}`).join(", ") || "(none)";
	lines.push(`errorCodes: ${errorStatsText}`);
	if (registeredBackend) lines.push(`registeredBackend: ${registeredBackend.id}`);
	else lines.push("registeredBackend: (none)");
	if (registeredBackend?.runtime.doctor) try {
		const report = await registeredBackend.runtime.doctor();
		lines.push(`runtimeDoctor: ${report.ok ? "ok" : "error"} (${report.message})`);
		if (report.code) lines.push(`runtimeDoctorCode: ${report.code}`);
		if (report.installCommand) lines.push(`runtimeDoctorInstall: ${report.installCommand}`);
		for (const detail of report.details ?? []) lines.push(`runtimeDoctorDetail: ${detail}`);
	} catch (error) {
		lines.push(`runtimeDoctor: error (${toAcpRuntimeError({
			error,
			fallbackCode: "ACP_TURN_FAILED",
			fallbackMessage: "Runtime doctor failed."
		}).message})`);
	}
	try {
		const backend = requireAcpRuntimeBackend(backendId);
		const capabilities = backend.runtime.getCapabilities ? await backend.runtime.getCapabilities({}) : {
			controls: [],
			configOptionKeys: []
		};
		lines.push("healthy: yes");
		lines.push(`capabilities: ${formatAcpCapabilitiesText(capabilities.controls ?? [])}`);
		if ((capabilities.configOptionKeys?.length ?? 0) > 0) lines.push(`configKeys: ${capabilities.configOptionKeys?.join(", ")}`);
		return stopWithText(lines.join("\n"));
	} catch (error) {
		const acpError = toAcpRuntimeError({
			error,
			fallbackCode: "ACP_TURN_FAILED",
			fallbackMessage: "ACP backend doctor failed."
		});
		lines.push("healthy: no");
		lines.push(formatAcpRuntimeErrorText(acpError));
		lines.push(`next: ${installHint}`);
		lines.push(`next: openclaw config set plugins.entries.${backendId}.enabled true`);
		if (backendId.toLowerCase() === "acpx") lines.push("next: verify acpx is installed (`acpx --help`).");
		return stopWithText(lines.join("\n"));
	}
}
function handleAcpInstallAction(params, restTokens) {
	if (restTokens.length > 0) return stopWithText(`⚠️ ${ACP_INSTALL_USAGE}`);
	const backendId = resolveConfiguredAcpBackendId(params.cfg);
	const installHint = resolveAcpInstallCommandHint(params.cfg);
	return stopWithText([
		"ACP install:",
		"-----",
		`configuredBackend: ${backendId}`,
		`run: ${installHint}`,
		`then: openclaw config set plugins.entries.${backendId}.enabled true`,
		"then: /acp doctor"
	].join("\n"));
}
function formatAcpSessionLine(params) {
	const acp = params.entry.acp;
	if (!acp) return "";
	const marker = params.currentSessionKey === params.key ? "*" : " ";
	const label = params.entry.label?.trim() || acp.agent;
	const threadText = params.threadId ? `, thread:${params.threadId}` : "";
	return `${marker} ${label} (${acp.mode}, ${acp.state}, backend:${acp.backend}${threadText}) -> ${params.key}`;
}
function handleAcpSessionsAction(params, restTokens) {
	if (restTokens.length > 0) return stopWithText(ACP_SESSIONS_USAGE);
	const currentSessionKey = resolveBoundAcpThreadSessionKey(params) || params.sessionKey;
	if (!currentSessionKey) return stopWithText("⚠️ Missing session key.");
	const { storePath } = resolveSessionStorePathForAcp({
		cfg: params.cfg,
		sessionKey: currentSessionKey
	});
	let store;
	try {
		store = loadSessionStore(storePath);
	} catch {
		store = {};
	}
	const bindingContext = resolveAcpCommandBindingContext(params);
	const normalizedChannel = bindingContext.channel;
	const normalizedAccountId = bindingContext.accountId || void 0;
	const bindingService = getSessionBindingService();
	const rows = Object.entries(store).filter(([, entry]) => Boolean(entry?.acp)).toSorted(([, a], [, b]) => (b?.updatedAt ?? 0) - (a?.updatedAt ?? 0)).slice(0, 20).map(([key, entry]) => {
		const bindingThreadId = bindingService.listBySession(key).find((binding) => (!normalizedChannel || binding.conversation.channel === normalizedChannel) && (!normalizedAccountId || binding.conversation.accountId === normalizedAccountId))?.conversation.conversationId;
		return formatAcpSessionLine({
			key,
			entry,
			currentSessionKey,
			threadId: bindingThreadId
		});
	}).filter(Boolean);
	if (rows.length === 0) return stopWithText("ACP sessions:\n-----\n(none)");
	return stopWithText([
		"ACP sessions:",
		"-----",
		...rows
	].join("\n"));
}
//#endregion
//#region src/auto-reply/reply/commands-acp/lifecycle.ts
function resolveAcpBindingLabelNoun(params) {
	if (params.placement === "child") return "thread";
	if (!params.threadId) return "conversation";
	return params.conversationId === params.threadId ? "thread" : "conversation";
}
async function bindSpawnedAcpSessionToCurrentConversation(params) {
	if (params.bindMode === "off") return {
		ok: false,
		error: "internal: conversation binding is disabled for this spawn"
	};
	const bindingContext = resolveAcpCommandBindingContext(params.commandParams);
	const channel = bindingContext.channel;
	if (!channel) return {
		ok: false,
		error: "ACP current-conversation binding requires a channel context."
	};
	const accountId = resolveAcpCommandAccountId(params.commandParams);
	const bindingPolicy = resolveThreadBindingSpawnPolicy({
		cfg: params.commandParams.cfg,
		channel,
		accountId,
		kind: "acp"
	});
	if (!bindingPolicy.enabled) return {
		ok: false,
		error: formatThreadBindingDisabledError({
			channel: bindingPolicy.channel,
			accountId: bindingPolicy.accountId,
			kind: "acp"
		})
	};
	const bindingService = getSessionBindingService();
	const capabilities = bindingService.getCapabilities({
		channel: bindingPolicy.channel,
		accountId: bindingPolicy.accountId
	});
	if (!capabilities.adapterAvailable || !capabilities.bindSupported) return {
		ok: false,
		error: `Conversation bindings are unavailable for ${channel}.`
	};
	if (!capabilities.placements.includes("current")) return {
		ok: false,
		error: `Conversation bindings do not support current placement for ${channel}.`
	};
	const currentConversationId = bindingContext.conversationId?.trim() || "";
	if (!currentConversationId) return {
		ok: false,
		error: `--bind here requires running /acp spawn inside an active ${channel} conversation.`
	};
	const senderId = params.commandParams.command.senderId?.trim() || "";
	const parentConversationId = bindingContext.parentConversationId?.trim() || void 0;
	const conversationRef = {
		channel: bindingPolicy.channel,
		accountId: bindingPolicy.accountId,
		conversationId: currentConversationId,
		...parentConversationId && parentConversationId !== currentConversationId ? { parentConversationId } : {}
	};
	const existingBinding = bindingService.resolveByConversation(conversationRef);
	const boundBy = typeof existingBinding?.metadata?.boundBy === "string" ? existingBinding.metadata.boundBy.trim() : "";
	if (existingBinding && boundBy && boundBy !== "system" && senderId && senderId !== boundBy) return {
		ok: false,
		error: `Only ${boundBy} can rebind this ${resolveAcpBindingLabelNoun({
			placement: "current",
			threadId: bindingContext.threadId,
			conversationId: currentConversationId
		})}.`
	};
	const label = params.label || params.agentId;
	try {
		return {
			ok: true,
			binding: await bindingService.bind({
				targetSessionKey: params.sessionKey,
				targetKind: "session",
				conversation: conversationRef,
				placement: "current",
				metadata: {
					threadName: resolveThreadBindingThreadName({
						agentId: params.agentId,
						label
					}),
					agentId: params.agentId,
					label,
					boundBy: senderId || "unknown",
					introText: resolveThreadBindingIntroText({
						agentId: params.agentId,
						label,
						idleTimeoutMs: resolveThreadBindingIdleTimeoutMsForChannel({
							cfg: params.commandParams.cfg,
							channel: bindingPolicy.channel,
							accountId: bindingPolicy.accountId
						}),
						maxAgeMs: resolveThreadBindingMaxAgeMsForChannel({
							cfg: params.commandParams.cfg,
							channel: bindingPolicy.channel,
							accountId: bindingPolicy.accountId
						}),
						sessionCwd: resolveAcpSessionCwd(params.sessionMeta),
						sessionDetails: resolveAcpThreadSessionDetailLines({
							sessionKey: params.sessionKey,
							meta: params.sessionMeta
						})
					})
				}
			})
		};
	} catch (error) {
		return {
			ok: false,
			error: (error instanceof Error ? error.message : String(error)) || `Failed to bind the current ${channel} conversation to the new ACP session.`
		};
	}
}
async function bindSpawnedAcpSessionToThread(params) {
	const { commandParams, threadMode } = params;
	if (threadMode === "off") return {
		ok: false,
		error: "internal: thread binding is disabled for this spawn"
	};
	const bindingContext = resolveAcpCommandBindingContext(commandParams);
	const channel = bindingContext.channel;
	if (!channel) return {
		ok: false,
		error: "ACP thread binding requires a channel context."
	};
	const accountId = resolveAcpCommandAccountId(commandParams);
	const spawnPolicy = resolveThreadBindingSpawnPolicy({
		cfg: commandParams.cfg,
		channel,
		accountId,
		kind: "acp"
	});
	if (!spawnPolicy.enabled) return {
		ok: false,
		error: formatThreadBindingDisabledError({
			channel: spawnPolicy.channel,
			accountId: spawnPolicy.accountId,
			kind: "acp"
		})
	};
	if (!spawnPolicy.spawnEnabled) return {
		ok: false,
		error: formatThreadBindingSpawnDisabledError({
			channel: spawnPolicy.channel,
			accountId: spawnPolicy.accountId,
			kind: "acp"
		})
	};
	const bindingService = getSessionBindingService();
	const capabilities = bindingService.getCapabilities({
		channel: spawnPolicy.channel,
		accountId: spawnPolicy.accountId
	});
	if (!capabilities.adapterAvailable) return {
		ok: false,
		error: `Thread bindings are unavailable for ${channel}.`
	};
	if (!capabilities.bindSupported) return {
		ok: false,
		error: `Thread bindings are unavailable for ${channel}.`
	};
	const currentThreadId = bindingContext.threadId ?? "";
	const currentConversationId = bindingContext.conversationId?.trim() || "";
	const requiresThreadIdForHere = requiresNativeThreadContextForThreadHere(channel);
	if (threadMode === "here" && (requiresThreadIdForHere && !currentThreadId || !requiresThreadIdForHere && !currentConversationId)) return {
		ok: false,
		error: `--thread here requires running /acp spawn inside an active ${channel} thread/conversation.`
	};
	const placement = resolveThreadBindingPlacementForCurrentContext({
		channel,
		threadId: currentThreadId || void 0
	});
	if (!capabilities.placements.includes(placement)) return {
		ok: false,
		error: `Thread bindings do not support ${placement} placement for ${channel}.`
	};
	if (!currentConversationId) return {
		ok: false,
		error: `Could not resolve a ${channel} conversation for ACP thread spawn.`
	};
	const senderId = commandParams.command.senderId?.trim() || "";
	const parentConversationId = bindingContext.parentConversationId?.trim() || void 0;
	const conversationRef = {
		channel: spawnPolicy.channel,
		accountId: spawnPolicy.accountId,
		conversationId: currentConversationId,
		...parentConversationId && parentConversationId !== currentConversationId ? { parentConversationId } : {}
	};
	if (placement === "current") {
		const existingBinding = bindingService.resolveByConversation(conversationRef);
		const boundBy = typeof existingBinding?.metadata?.boundBy === "string" ? existingBinding.metadata.boundBy.trim() : "";
		if (existingBinding && boundBy && boundBy !== "system" && senderId && senderId !== boundBy) return {
			ok: false,
			error: `Only ${boundBy} can rebind this ${resolveAcpBindingLabelNoun({
				placement,
				threadId: currentThreadId || void 0,
				conversationId: currentConversationId
			})}.`
		};
	}
	const label = params.label || params.agentId;
	try {
		return {
			ok: true,
			binding: await bindingService.bind({
				targetSessionKey: params.sessionKey,
				targetKind: "session",
				conversation: conversationRef,
				placement,
				metadata: {
					threadName: resolveThreadBindingThreadName({
						agentId: params.agentId,
						label
					}),
					agentId: params.agentId,
					label,
					boundBy: senderId || "unknown",
					introText: resolveThreadBindingIntroText({
						agentId: params.agentId,
						label,
						idleTimeoutMs: resolveThreadBindingIdleTimeoutMsForChannel({
							cfg: commandParams.cfg,
							channel: spawnPolicy.channel,
							accountId: spawnPolicy.accountId
						}),
						maxAgeMs: resolveThreadBindingMaxAgeMsForChannel({
							cfg: commandParams.cfg,
							channel: spawnPolicy.channel,
							accountId: spawnPolicy.accountId
						}),
						sessionCwd: resolveAcpSessionCwd(params.sessionMeta),
						sessionDetails: resolveAcpThreadSessionDetailLines({
							sessionKey: params.sessionKey,
							meta: params.sessionMeta
						})
					})
				}
			})
		};
	} catch (error) {
		return {
			ok: false,
			error: (error instanceof Error ? error.message : String(error)) || `Failed to bind a ${channel} thread/conversation to the new ACP session.`
		};
	}
}
async function cleanupFailedSpawn(params) {
	await cleanupFailedAcpSpawn({
		cfg: params.cfg,
		sessionKey: params.sessionKey,
		shouldDeleteSession: params.shouldDeleteSession,
		deleteTranscript: false,
		runtimeCloseHandle: params.initializedRuntime
	});
}
async function persistSpawnedSessionLabel(params) {
	const label = params.label?.trim();
	if (!label) return;
	const now = Date.now();
	if (params.commandParams.sessionStore) {
		const existing = params.commandParams.sessionStore[params.sessionKey];
		if (existing) params.commandParams.sessionStore[params.sessionKey] = {
			...existing,
			label,
			updatedAt: now
		};
	}
	if (!params.commandParams.storePath) return;
	await updateSessionStore(params.commandParams.storePath, (store) => {
		const existing = store[params.sessionKey];
		if (!existing) return;
		store[params.sessionKey] = {
			...existing,
			label,
			updatedAt: now
		};
	});
}
async function handleAcpSpawnAction(params, restTokens) {
	if (!isAcpEnabledByPolicy(params.cfg)) return stopWithText("ACP is disabled by policy (`acp.enabled=false`).");
	const parsed = parseSpawnInput(params, restTokens);
	if (!parsed.ok) return stopWithText(`⚠️ ${parsed.error}`);
	const spawn = parsed.value;
	const runtimePolicyError = resolveAcpSpawnRuntimePolicyError({
		cfg: params.cfg,
		requesterSessionKey: params.sessionKey
	});
	if (runtimePolicyError) return stopWithText(`⚠️ ${runtimePolicyError}`);
	const agentPolicyError = resolveAcpAgentPolicyError(params.cfg, spawn.agentId);
	if (agentPolicyError) return stopWithText(collectAcpErrorText({
		error: agentPolicyError,
		fallbackCode: "ACP_SESSION_INIT_FAILED",
		fallbackMessage: "ACP target agent is not allowed by policy."
	}));
	const acpManager = getAcpSessionManager();
	const sessionKey = `agent:${spawn.agentId}:acp:${randomUUID()}`;
	let initializedBackend = "";
	let initializedMeta;
	let initializedRuntime;
	try {
		const initialized = await acpManager.initializeSession({
			cfg: params.cfg,
			sessionKey,
			agent: spawn.agentId,
			mode: spawn.mode,
			cwd: spawn.cwd
		});
		initializedRuntime = {
			runtime: initialized.runtime,
			handle: initialized.handle
		};
		initializedBackend = initialized.handle.backend || initialized.meta.backend;
		initializedMeta = initialized.meta;
	} catch (err) {
		return stopWithText(collectAcpErrorText({
			error: err,
			fallbackCode: "ACP_SESSION_INIT_FAILED",
			fallbackMessage: "Could not initialize ACP session runtime."
		}));
	}
	let binding = null;
	if (spawn.bind !== "off") {
		const bound = await bindSpawnedAcpSessionToCurrentConversation({
			commandParams: params,
			sessionKey,
			agentId: spawn.agentId,
			label: spawn.label,
			bindMode: spawn.bind,
			sessionMeta: initializedMeta
		});
		if (!bound.ok) {
			await cleanupFailedSpawn({
				cfg: params.cfg,
				sessionKey,
				shouldDeleteSession: true,
				initializedRuntime
			});
			return stopWithText(`⚠️ ${bound.error}`);
		}
		binding = bound.binding;
	} else if (spawn.thread !== "off") {
		const bound = await bindSpawnedAcpSessionToThread({
			commandParams: params,
			sessionKey,
			agentId: spawn.agentId,
			label: spawn.label,
			threadMode: spawn.thread,
			sessionMeta: initializedMeta
		});
		if (!bound.ok) {
			await cleanupFailedSpawn({
				cfg: params.cfg,
				sessionKey,
				shouldDeleteSession: true,
				initializedRuntime
			});
			return stopWithText(`⚠️ ${bound.error}`);
		}
		binding = bound.binding;
	}
	try {
		await persistSpawnedSessionLabel({
			commandParams: params,
			sessionKey,
			label: spawn.label
		});
	} catch (err) {
		await cleanupFailedSpawn({
			cfg: params.cfg,
			sessionKey,
			shouldDeleteSession: true,
			initializedRuntime
		});
		return stopWithText(`⚠️ ACP spawn failed: ${err instanceof Error ? err.message : String(err)}`);
	}
	const parts = [`✅ Spawned ACP session ${sessionKey} (${spawn.mode}, backend ${initializedBackend}).`];
	if (binding) {
		const currentConversationId = resolveAcpCommandConversationId(params)?.trim() || "";
		const boundConversationId = binding.conversation.conversationId.trim();
		const placementLabel = resolveAcpBindingLabelNoun({
			conversationId: currentConversationId,
			placement: currentConversationId && boundConversationId === currentConversationId ? "current" : "child",
			threadId: resolveAcpCommandThreadId(params)
		});
		if (currentConversationId && boundConversationId === currentConversationId) parts.push(`Bound this ${placementLabel} to ${sessionKey}.`);
		else parts.push(`Created ${placementLabel} ${boundConversationId} and bound it to ${sessionKey}.`);
	} else parts.push("Session is unbound (use /acp spawn ... --bind here to bind this conversation, or /focus <session-key> where supported).");
	const dispatchNote = resolveAcpDispatchPolicyMessage(params.cfg);
	if (dispatchNote) parts.push(`ℹ️ ${dispatchNote}`);
	if (binding?.conversation.channel === "telegram" && binding.conversation.conversationId.includes(":topic:")) return {
		shouldContinue: false,
		reply: {
			text: parts.join(" "),
			channelData: { telegram: { pin: true } }
		}
	};
	return stopWithText(parts.join(" "));
}
function resolveAcpSessionForCommandOrStop(params) {
	const error = resolveAcpSessionResolutionError(params.acpManager.resolveSession({
		cfg: params.cfg,
		sessionKey: params.sessionKey
	}));
	if (error) return stopWithText(collectAcpErrorText({
		error,
		fallbackCode: "ACP_SESSION_INIT_FAILED",
		fallbackMessage: error.message
	}));
	return null;
}
async function resolveAcpTokenTargetSessionKeyOrStop(params) {
	const token = params.restTokens.join(" ").trim() || void 0;
	const target = await resolveAcpTargetSessionKey({
		commandParams: params.commandParams,
		token
	});
	if (!target.ok) return stopWithText(`⚠️ ${target.error}`);
	return target.sessionKey;
}
async function withResolvedAcpSessionTarget(params) {
	const acpManager = getAcpSessionManager();
	const targetSessionKey = await resolveAcpTokenTargetSessionKeyOrStop({
		commandParams: params.commandParams,
		restTokens: params.restTokens
	});
	if (typeof targetSessionKey !== "string") return targetSessionKey;
	const guardFailure = resolveAcpSessionForCommandOrStop({
		acpManager,
		cfg: params.commandParams.cfg,
		sessionKey: targetSessionKey
	});
	if (guardFailure) return guardFailure;
	return await params.run({
		acpManager,
		sessionKey: targetSessionKey
	});
}
async function handleAcpCancelAction(params, restTokens) {
	return await withResolvedAcpSessionTarget({
		commandParams: params,
		restTokens,
		run: async ({ acpManager, sessionKey }) => await withAcpCommandErrorBoundary({
			run: async () => await acpManager.cancelSession({
				cfg: params.cfg,
				sessionKey,
				reason: "manual-cancel"
			}),
			fallbackCode: "ACP_TURN_FAILED",
			fallbackMessage: "ACP cancel failed before completion.",
			onSuccess: () => stopWithText(`✅ Cancel requested for ACP session ${sessionKey}.`)
		})
	});
}
async function runAcpSteer(params) {
	const acpManager = getAcpSessionManager();
	let output = "";
	await acpManager.runTurn({
		cfg: params.cfg,
		sessionKey: params.sessionKey,
		text: params.instruction,
		mode: "steer",
		requestId: params.requestId,
		onEvent: (event) => {
			if (event.type !== "text_delta") return;
			if (event.stream && event.stream !== "output") return;
			if (event.text) {
				output += event.text;
				if (output.length > 800) output = `${output.slice(0, 800)}…`;
			}
		}
	});
	return output.trim();
}
async function handleAcpSteerAction(params, restTokens) {
	const dispatchPolicyError = resolveAcpDispatchPolicyError(params.cfg);
	if (dispatchPolicyError) return stopWithText(collectAcpErrorText({
		error: dispatchPolicyError,
		fallbackCode: "ACP_DISPATCH_DISABLED",
		fallbackMessage: dispatchPolicyError.message
	}));
	const parsed = parseSteerInput(restTokens);
	if (!parsed.ok) return stopWithText(`⚠️ ${parsed.error}`);
	const acpManager = getAcpSessionManager();
	const target = await resolveAcpTargetSessionKey({
		commandParams: params,
		token: parsed.value.sessionToken
	});
	if (!target.ok) return stopWithText(`⚠️ ${target.error}`);
	const guardFailure = resolveAcpSessionForCommandOrStop({
		acpManager,
		cfg: params.cfg,
		sessionKey: target.sessionKey
	});
	if (guardFailure) return guardFailure;
	return await withAcpCommandErrorBoundary({
		run: async () => await runAcpSteer({
			cfg: params.cfg,
			sessionKey: target.sessionKey,
			instruction: parsed.value.instruction,
			requestId: `${resolveCommandRequestId(params)}:steer`
		}),
		fallbackCode: "ACP_TURN_FAILED",
		fallbackMessage: "ACP steer failed before completion.",
		onSuccess: (steerOutput) => {
			if (!steerOutput) return stopWithText(`✅ ACP steer sent to ${target.sessionKey}.`);
			return stopWithText(`✅ ACP steer sent to ${target.sessionKey}.\n${steerOutput}`);
		}
	});
}
async function handleAcpCloseAction(params, restTokens) {
	return await withResolvedAcpSessionTarget({
		commandParams: params,
		restTokens,
		run: async ({ acpManager, sessionKey }) => {
			let runtimeNotice = "";
			try {
				const closed = await acpManager.closeSession({
					cfg: params.cfg,
					sessionKey,
					reason: "manual-close",
					allowBackendUnavailable: true,
					clearMeta: true
				});
				runtimeNotice = closed.runtimeNotice ? ` (${closed.runtimeNotice})` : "";
			} catch (error) {
				return stopWithText(collectAcpErrorText({
					error,
					fallbackCode: "ACP_TURN_FAILED",
					fallbackMessage: "ACP close failed before completion."
				}));
			}
			const removedBindings = await getSessionBindingService().unbind({
				targetSessionKey: sessionKey,
				reason: "manual"
			});
			return stopWithText(`✅ Closed ACP session ${sessionKey}${runtimeNotice}. Removed ${removedBindings.length} binding${removedBindings.length === 1 ? "" : "s"}.`);
		}
	});
}
//#endregion
//#region src/auto-reply/reply/commands-acp/runtime-options.ts
async function resolveTargetSessionKeyOrStop(params) {
	const target = await resolveAcpTargetSessionKey({
		commandParams: params.commandParams,
		token: params.token
	});
	if (!target.ok) return stopWithText(`⚠️ ${target.error}`);
	return target.sessionKey;
}
async function resolveOptionalSingleTargetOrStop(params) {
	const parsed = parseOptionalSingleTarget(params.restTokens, params.usage);
	if (!parsed.ok) return stopWithText(`⚠️ ${parsed.error}`);
	return await resolveTargetSessionKeyOrStop({
		commandParams: params.commandParams,
		token: parsed.sessionToken
	});
}
async function resolveSingleTargetValueOrStop(params) {
	const parsed = parseSingleValueCommandInput(params.restTokens, params.usage);
	if (!parsed.ok) return stopWithText(`⚠️ ${parsed.error}`);
	const targetSessionKey = await resolveTargetSessionKeyOrStop({
		commandParams: params.commandParams,
		token: parsed.value.sessionToken
	});
	if (typeof targetSessionKey !== "string") return targetSessionKey;
	return {
		targetSessionKey,
		value: parsed.value.value
	};
}
async function withSingleTargetValue(params) {
	const resolved = await resolveSingleTargetValueOrStop({
		commandParams: params.commandParams,
		restTokens: params.restTokens,
		usage: params.usage
	});
	if (!("targetSessionKey" in resolved)) return resolved;
	return await params.run(resolved);
}
async function handleAcpStatusAction(params, restTokens) {
	const targetSessionKey = await resolveOptionalSingleTargetOrStop({
		commandParams: params,
		restTokens,
		usage: ACP_STATUS_USAGE
	});
	if (typeof targetSessionKey !== "string") return targetSessionKey;
	return await withAcpCommandErrorBoundary({
		run: async () => await getAcpSessionManager().getSessionStatus({
			cfg: params.cfg,
			sessionKey: targetSessionKey
		}),
		fallbackCode: "ACP_TURN_FAILED",
		fallbackMessage: "Could not read ACP session status.",
		onSuccess: (status) => {
			const linkedTask = findLatestTaskForRelatedSessionKeyForOwner({
				relatedSessionKey: status.sessionKey,
				callerOwnerKey: params.sessionKey
			});
			const sessionIdentifierLines = resolveAcpSessionIdentifierLinesFromIdentity({
				backend: status.backend,
				identity: status.identity
			});
			const taskProgress = sanitizeTaskStatusText(linkedTask?.progressSummary);
			const taskSummary = sanitizeTaskStatusText(linkedTask?.terminalSummary, { errorContext: true });
			const taskError = sanitizeTaskStatusText(linkedTask?.error, { errorContext: true });
			const lastError = sanitizeTaskStatusText(status.lastError, { errorContext: true });
			const runtimeSummary = sanitizeTaskStatusText(status.runtimeStatus?.summary, { errorContext: true });
			const runtimeDetails = sanitizeTaskStatusText(status.runtimeStatus?.details, { errorContext: true });
			return stopWithText([
				"ACP status:",
				"-----",
				`session: ${status.sessionKey}`,
				`backend: ${status.backend}`,
				`agent: ${status.agent}`,
				...sessionIdentifierLines,
				`sessionMode: ${status.mode}`,
				`state: ${status.state}`,
				...linkedTask ? [
					`taskId: ${linkedTask.taskId}`,
					`taskStatus: ${linkedTask.status}`,
					`delivery: ${linkedTask.deliveryStatus}`,
					...taskProgress ? [`taskProgress: ${taskProgress}`] : [],
					...taskSummary ? [`taskSummary: ${taskSummary}`] : [],
					...taskError ? [`taskError: ${taskError}`] : [],
					...typeof linkedTask.lastEventAt === "number" ? [`taskUpdatedAt: ${new Date(linkedTask.lastEventAt).toISOString()}`] : []
				] : [],
				`runtimeOptions: ${formatRuntimeOptionsText(status.runtimeOptions)}`,
				`capabilities: ${formatAcpCapabilitiesText(status.capabilities.controls)}`,
				`lastActivityAt: ${new Date(status.lastActivityAt).toISOString()}`,
				...lastError ? [`lastError: ${lastError}`] : [],
				...runtimeSummary ? [`runtime: ${runtimeSummary}`] : [],
				...runtimeDetails ? [`runtimeDetails: ${runtimeDetails}`] : []
			].join("\n"));
		}
	});
}
async function handleAcpSetModeAction(params, restTokens) {
	return await withSingleTargetValue({
		commandParams: params,
		restTokens,
		usage: ACP_SET_MODE_USAGE,
		run: async ({ targetSessionKey, value }) => await withAcpCommandErrorBoundary({
			run: async () => {
				const runtimeMode = validateRuntimeModeInput(value);
				return {
					runtimeMode,
					options: await getAcpSessionManager().setSessionRuntimeMode({
						cfg: params.cfg,
						sessionKey: targetSessionKey,
						runtimeMode
					})
				};
			},
			fallbackCode: "ACP_TURN_FAILED",
			fallbackMessage: "Could not update ACP runtime mode.",
			onSuccess: ({ runtimeMode, options }) => stopWithText(`✅ Updated ACP runtime mode for ${targetSessionKey}: ${runtimeMode}. Effective options: ${formatRuntimeOptionsText(options)}`)
		})
	});
}
async function handleAcpSetAction(params, restTokens) {
	const parsed = parseSetCommandInput(restTokens);
	if (!parsed.ok) return stopWithText(`⚠️ ${parsed.error}`);
	const target = await resolveAcpTargetSessionKey({
		commandParams: params,
		token: parsed.value.sessionToken
	});
	if (!target.ok) return stopWithText(`⚠️ ${target.error}`);
	const key = parsed.value.key.trim();
	const value = parsed.value.value.trim();
	return await withAcpCommandErrorBoundary({
		run: async () => {
			if (key.toLowerCase() === "cwd") {
				const cwd = validateRuntimeCwdInput(value);
				const options = await getAcpSessionManager().updateSessionRuntimeOptions({
					cfg: params.cfg,
					sessionKey: target.sessionKey,
					patch: { cwd }
				});
				return { text: `✅ Updated ACP cwd for ${target.sessionKey}: ${cwd}. Effective options: ${formatRuntimeOptionsText(options)}` };
			}
			const validated = validateRuntimeConfigOptionInput(key, value);
			const options = await getAcpSessionManager().setSessionConfigOption({
				cfg: params.cfg,
				sessionKey: target.sessionKey,
				key: validated.key,
				value: validated.value
			});
			return { text: `✅ Updated ACP config option for ${target.sessionKey}: ${validated.key}=${validated.value}. Effective options: ${formatRuntimeOptionsText(options)}` };
		},
		fallbackCode: "ACP_TURN_FAILED",
		fallbackMessage: "Could not update ACP config option.",
		onSuccess: ({ text }) => stopWithText(text)
	});
}
async function handleAcpCwdAction(params, restTokens) {
	return await withSingleTargetValue({
		commandParams: params,
		restTokens,
		usage: ACP_CWD_USAGE,
		run: async ({ targetSessionKey, value }) => await withAcpCommandErrorBoundary({
			run: async () => {
				const cwd = validateRuntimeCwdInput(value);
				return {
					cwd,
					options: await getAcpSessionManager().updateSessionRuntimeOptions({
						cfg: params.cfg,
						sessionKey: targetSessionKey,
						patch: { cwd }
					})
				};
			},
			fallbackCode: "ACP_TURN_FAILED",
			fallbackMessage: "Could not update ACP cwd.",
			onSuccess: ({ cwd, options }) => stopWithText(`✅ Updated ACP cwd for ${targetSessionKey}: ${cwd}. Effective options: ${formatRuntimeOptionsText(options)}`)
		})
	});
}
async function handleAcpPermissionsAction(params, restTokens) {
	return await withSingleTargetValue({
		commandParams: params,
		restTokens,
		usage: ACP_PERMISSIONS_USAGE,
		run: async ({ targetSessionKey, value }) => await withAcpCommandErrorBoundary({
			run: async () => {
				const permissionProfile = validateRuntimePermissionProfileInput(value);
				return {
					permissionProfile,
					options: await getAcpSessionManager().setSessionConfigOption({
						cfg: params.cfg,
						sessionKey: targetSessionKey,
						key: "approval_policy",
						value: permissionProfile
					})
				};
			},
			fallbackCode: "ACP_TURN_FAILED",
			fallbackMessage: "Could not update ACP permissions profile.",
			onSuccess: ({ permissionProfile, options }) => stopWithText(`✅ Updated ACP permissions profile for ${targetSessionKey}: ${permissionProfile}. Effective options: ${formatRuntimeOptionsText(options)}`)
		})
	});
}
async function handleAcpTimeoutAction(params, restTokens) {
	return await withSingleTargetValue({
		commandParams: params,
		restTokens,
		usage: ACP_TIMEOUT_USAGE,
		run: async ({ targetSessionKey, value }) => await withAcpCommandErrorBoundary({
			run: async () => {
				const timeoutSeconds = parseRuntimeTimeoutSecondsInput(value);
				return {
					timeoutSeconds,
					options: await getAcpSessionManager().setSessionConfigOption({
						cfg: params.cfg,
						sessionKey: targetSessionKey,
						key: "timeout",
						value: String(timeoutSeconds)
					})
				};
			},
			fallbackCode: "ACP_TURN_FAILED",
			fallbackMessage: "Could not update ACP timeout.",
			onSuccess: ({ timeoutSeconds, options }) => stopWithText(`✅ Updated ACP timeout for ${targetSessionKey}: ${timeoutSeconds}s. Effective options: ${formatRuntimeOptionsText(options)}`)
		})
	});
}
async function handleAcpModelAction(params, restTokens) {
	return await withSingleTargetValue({
		commandParams: params,
		restTokens,
		usage: ACP_MODEL_USAGE,
		run: async ({ targetSessionKey, value }) => await withAcpCommandErrorBoundary({
			run: async () => {
				const model = validateRuntimeModelInput(value);
				return {
					model,
					options: await getAcpSessionManager().setSessionConfigOption({
						cfg: params.cfg,
						sessionKey: targetSessionKey,
						key: "model",
						value: model
					})
				};
			},
			fallbackCode: "ACP_TURN_FAILED",
			fallbackMessage: "Could not update ACP model.",
			onSuccess: ({ model, options }) => stopWithText(`✅ Updated ACP model for ${targetSessionKey}: ${model}. Effective options: ${formatRuntimeOptionsText(options)}`)
		})
	});
}
async function handleAcpResetOptionsAction(params, restTokens) {
	const targetSessionKey = await resolveOptionalSingleTargetOrStop({
		commandParams: params,
		restTokens,
		usage: ACP_RESET_OPTIONS_USAGE
	});
	if (typeof targetSessionKey !== "string") return targetSessionKey;
	return await withAcpCommandErrorBoundary({
		run: async () => await getAcpSessionManager().resetSessionRuntimeOptions({
			cfg: params.cfg,
			sessionKey: targetSessionKey
		}),
		fallbackCode: "ACP_TURN_FAILED",
		fallbackMessage: "Could not reset ACP runtime options.",
		onSuccess: () => stopWithText(`✅ Reset ACP runtime options for ${targetSessionKey}.`)
	});
}
//#endregion
//#region src/auto-reply/reply/commands-acp.ts
const ACP_ACTION_HANDLERS = {
	spawn: handleAcpSpawnAction,
	cancel: handleAcpCancelAction,
	steer: handleAcpSteerAction,
	close: handleAcpCloseAction,
	status: handleAcpStatusAction,
	"set-mode": handleAcpSetModeAction,
	set: handleAcpSetAction,
	cwd: handleAcpCwdAction,
	permissions: handleAcpPermissionsAction,
	timeout: handleAcpTimeoutAction,
	model: handleAcpModelAction,
	"reset-options": handleAcpResetOptionsAction,
	doctor: handleAcpDoctorAction,
	install: async (params, tokens) => handleAcpInstallAction(params, tokens),
	sessions: async (params, tokens) => handleAcpSessionsAction(params, tokens)
};
const ACP_MUTATING_ACTIONS = new Set([
	"spawn",
	"cancel",
	"steer",
	"close",
	"status",
	"set-mode",
	"set",
	"cwd",
	"permissions",
	"timeout",
	"model",
	"reset-options"
]);
const handleAcpCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const normalized = params.command.commandBodyNormalized;
	if (!normalized.startsWith("/acp")) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /acp from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	const tokens = normalized.slice(COMMAND.length).trim().split(/\s+/).filter(Boolean);
	const action = resolveAcpAction(tokens);
	if (action === "help") return stopWithText(resolveAcpHelpText());
	if (ACP_MUTATING_ACTIONS.has(action)) {
		const scopeBlock = requireGatewayClientScopeForInternalChannel(params, {
			label: "/acp",
			allowedScopes: ["operator.admin"],
			missingText: "This /acp action requires operator.admin on the internal channel."
		});
		if (scopeBlock) return scopeBlock;
	}
	const handler = ACP_ACTION_HANDLERS[action];
	return handler ? await handler(params, tokens) : stopWithText(resolveAcpHelpText());
};
//#endregion
export { handleAcpCommand as t };
