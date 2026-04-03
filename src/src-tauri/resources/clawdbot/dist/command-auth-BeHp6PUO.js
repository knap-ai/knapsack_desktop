import { r as normalizeStringEntries } from "./string-normalization-De1VSx5S.js";
import { a as normalizeAnyChannelId } from "./registry-DTO_OK4F.js";
import { d as normalizeMessageChannel, o as isInternalMessageChannel, t as INTERNAL_MESSAGE_CHANNEL } from "./message-channel-D19EDm2g.js";
import { n as listChannelPlugins, t as getChannelPlugin } from "./registry-fiJfPVib.js";
import "./plugins-DF32jmMU.js";
//#region src/auto-reply/command-auth.ts
function resolveProviderFromContext(ctx, cfg) {
	const explicitMessageChannels = [
		ctx.Surface,
		ctx.OriginatingChannel,
		ctx.Provider
	].map((value) => normalizeMessageChannel(value)).filter((value) => Boolean(value));
	const explicitMessageChannel = explicitMessageChannels.find((value) => value !== INTERNAL_MESSAGE_CHANNEL);
	if (!explicitMessageChannel && explicitMessageChannels.includes("webchat")) return {
		providerId: void 0,
		hadResolutionError: false
	};
	const direct = normalizeAnyChannelId(explicitMessageChannel ?? void 0) ?? explicitMessageChannel ?? normalizeAnyChannelId(ctx.Provider) ?? normalizeAnyChannelId(ctx.Surface) ?? normalizeAnyChannelId(ctx.OriginatingChannel);
	if (direct) return {
		providerId: direct,
		hadResolutionError: false
	};
	const candidates = [ctx.From, ctx.To].filter((value) => Boolean(value?.trim())).flatMap((value) => value.split(":").map((part) => part.trim()));
	for (const candidate of candidates) {
		const normalizedCandidateChannel = normalizeMessageChannel(candidate);
		if (normalizedCandidateChannel === "webchat") return {
			providerId: void 0,
			hadResolutionError: false
		};
		const normalized = normalizeAnyChannelId(normalizedCandidateChannel ?? void 0) ?? normalizedCandidateChannel ?? normalizeAnyChannelId(candidate);
		if (normalized) return {
			providerId: normalized,
			hadResolutionError: false
		};
	}
	const inferredProviders = probeInferredProviders(ctx, cfg);
	const inferred = inferredProviders.candidates;
	if (inferred.length === 1) return {
		providerId: inferred[0].providerId,
		hadResolutionError: inferred[0].hadResolutionError
	};
	return {
		providerId: void 0,
		hadResolutionError: inferredProviders.droppedResolutionError || inferred.some((entry) => entry.hadResolutionError)
	};
}
function probeInferredProviders(ctx, cfg) {
	let droppedResolutionError = false;
	return {
		candidates: listChannelPlugins().map((plugin) => {
			const resolvedAllowFrom = resolveProviderAllowFrom({
				plugin,
				cfg,
				accountId: ctx.AccountId
			});
			if (formatAllowFromList({
				plugin,
				cfg,
				accountId: ctx.AccountId,
				allowFrom: resolvedAllowFrom.allowFrom
			}).length === 0) {
				if (resolvedAllowFrom.hadResolutionError) droppedResolutionError = true;
				return null;
			}
			return {
				providerId: plugin.id,
				hadResolutionError: resolvedAllowFrom.hadResolutionError
			};
		}).filter((value) => Boolean(value)),
		droppedResolutionError
	};
}
function formatAllowFromList(params) {
	const { plugin, cfg, accountId, allowFrom } = params;
	if (!allowFrom || allowFrom.length === 0) return [];
	if (plugin?.config?.formatAllowFrom) return plugin.config.formatAllowFrom({
		cfg,
		accountId,
		allowFrom
	});
	return normalizeStringEntries(allowFrom);
}
function normalizeAllowFromEntry(params) {
	return formatAllowFromList({
		plugin: params.plugin,
		cfg: params.cfg,
		accountId: params.accountId,
		allowFrom: [params.value]
	}).filter((entry) => entry.trim().length > 0);
}
function resolveProviderAllowFrom(params) {
	const { plugin, cfg, accountId } = params;
	const providerId = plugin?.id;
	if (!plugin?.config?.resolveAllowFrom) return {
		allowFrom: resolveFallbackAllowFrom({
			cfg,
			providerId,
			accountId
		}),
		hadResolutionError: false
	};
	try {
		const allowFrom = plugin.config.resolveAllowFrom({
			cfg,
			accountId
		});
		if (allowFrom == null) return {
			allowFrom: [],
			hadResolutionError: false
		};
		if (!Array.isArray(allowFrom)) {
			console.warn(`[command-auth] resolveAllowFrom returned an invalid allowFrom for provider "${providerId}", falling back to config allowFrom: invalid_result`);
			return {
				allowFrom: resolveFallbackAllowFrom({
					cfg,
					providerId,
					accountId
				}),
				hadResolutionError: true
			};
		}
		return {
			allowFrom,
			hadResolutionError: false
		};
	} catch (err) {
		console.warn(`[command-auth] resolveAllowFrom threw for provider "${providerId}", falling back to config allowFrom: ${describeAllowFromResolutionError(err)}`);
		return {
			allowFrom: resolveFallbackAllowFrom({
				cfg,
				providerId,
				accountId
			}),
			hadResolutionError: true
		};
	}
}
function describeAllowFromResolutionError(err) {
	if (err instanceof Error) return err.name.trim() || "Error";
	return "unknown_error";
}
function resolveOwnerAllowFromList(params) {
	const raw = params.allowFrom ?? params.cfg.commands?.ownerAllowFrom;
	if (!Array.isArray(raw) || raw.length === 0) return [];
	const filtered = [];
	for (const entry of raw) {
		const trimmed = String(entry ?? "").trim();
		if (!trimmed) continue;
		const separatorIndex = trimmed.indexOf(":");
		if (separatorIndex > 0) {
			const channel = normalizeAnyChannelId(trimmed.slice(0, separatorIndex));
			if (channel) {
				if (params.providerId && channel !== params.providerId) continue;
				const remainder = trimmed.slice(separatorIndex + 1).trim();
				if (remainder) filtered.push(remainder);
				continue;
			}
		}
		filtered.push(trimmed);
	}
	return formatAllowFromList({
		plugin: params.plugin,
		cfg: params.cfg,
		accountId: params.accountId,
		allowFrom: filtered
	});
}
/**
* Resolves the commands.allowFrom list for a given provider.
* Returns the provider-specific list if defined, otherwise the "*" global list.
* Returns null if commands.allowFrom is not configured at all (fall back to channel allowFrom).
*/
function resolveCommandsAllowFromList(params) {
	const { plugin, cfg, accountId, providerId } = params;
	const commandsAllowFrom = cfg.commands?.allowFrom;
	if (!commandsAllowFrom || typeof commandsAllowFrom !== "object") return null;
	const providerList = commandsAllowFrom[providerId ?? ""];
	const globalList = commandsAllowFrom["*"];
	const rawList = Array.isArray(providerList) ? providerList : globalList;
	if (!Array.isArray(rawList)) return null;
	return formatAllowFromList({
		plugin,
		cfg,
		accountId,
		allowFrom: rawList
	});
}
function isConversationLikeIdentity(value) {
	const normalized = value.trim().toLowerCase();
	if (!normalized) return false;
	if (normalized.includes("@g.us")) return true;
	if (normalized.startsWith("chat_id:")) return true;
	return /(^|:)(channel|group|thread|topic|room|space|spaces):/.test(normalized);
}
function shouldUseFromAsSenderFallback(params) {
	const from = (params.from ?? "").trim();
	if (!from) return false;
	const chatType = (params.chatType ?? "").trim().toLowerCase();
	if (chatType && chatType !== "direct") return false;
	return !isConversationLikeIdentity(from);
}
function resolveSenderCandidates(params) {
	const { plugin, cfg, accountId } = params;
	const candidates = [];
	const pushCandidate = (value) => {
		const trimmed = (value ?? "").trim();
		if (!trimmed) return;
		candidates.push(trimmed);
	};
	if (params.providerId === "whatsapp") {
		pushCandidate(params.senderE164);
		pushCandidate(params.senderId);
	} else {
		pushCandidate(params.senderId);
		pushCandidate(params.senderE164);
	}
	if (candidates.length === 0 && shouldUseFromAsSenderFallback({
		from: params.from,
		chatType: params.chatType
	})) pushCandidate(params.from);
	const normalized = [];
	for (const sender of candidates) {
		const entries = normalizeAllowFromEntry({
			plugin,
			cfg,
			accountId,
			value: sender
		});
		for (const entry of entries) if (!normalized.includes(entry)) normalized.push(entry);
	}
	return normalized;
}
function resolveFallbackAllowFrom(params) {
	const providerId = params.providerId?.trim();
	if (!providerId) return [];
	const channelCfg = params.cfg.channels?.[providerId];
	const accountCfg = resolveFallbackAccountConfig(channelCfg?.accounts, params.accountId) ?? resolveFallbackDefaultAccountConfig(channelCfg);
	const allowFrom = accountCfg?.allowFrom ?? accountCfg?.dm?.allowFrom ?? channelCfg?.allowFrom ?? channelCfg?.dm?.allowFrom;
	return Array.isArray(allowFrom) ? allowFrom : [];
}
function resolveFallbackAccountConfig(accounts, accountId) {
	const normalizedAccountId = accountId?.trim().toLowerCase();
	if (!accounts || !normalizedAccountId) return;
	const direct = accounts[normalizedAccountId];
	if (direct) return direct;
	const matchKey = Object.keys(accounts).find((key) => key.trim().toLowerCase() === normalizedAccountId);
	return matchKey ? accounts[matchKey] : void 0;
}
function resolveFallbackDefaultAccountConfig(channelCfg) {
	const accounts = channelCfg?.accounts;
	if (!accounts) return;
	const preferred = resolveFallbackAccountConfig(accounts, channelCfg?.defaultAccount) ?? resolveFallbackAccountConfig(accounts, "default");
	if (preferred) return preferred;
	const definedAccounts = Object.values(accounts).filter(Boolean);
	return definedAccounts.length === 1 ? definedAccounts[0] : void 0;
}
function resolveFallbackCommandOptions(providerId) {
	return { enforceOwnerForCommands: providerId === "whatsapp" };
}
function resolveCommandAuthorization(params) {
	const { ctx, cfg, commandAuthorized } = params;
	const { providerId, hadResolutionError: providerResolutionError } = resolveProviderFromContext(ctx, cfg);
	const plugin = providerId ? getChannelPlugin(providerId) : void 0;
	const from = (ctx.From ?? "").trim();
	const to = (ctx.To ?? "").trim();
	const commandsAllowFromConfigured = Boolean(cfg.commands?.allowFrom && typeof cfg.commands.allowFrom === "object");
	const commandsAllowFromList = resolveCommandsAllowFromList({
		plugin,
		cfg,
		accountId: ctx.AccountId,
		providerId
	});
	const resolvedAllowFrom = providerResolutionError ? {
		allowFrom: resolveFallbackAllowFrom({
			cfg,
			providerId,
			accountId: ctx.AccountId
		}),
		hadResolutionError: true
	} : resolveProviderAllowFrom({
		plugin,
		cfg,
		accountId: ctx.AccountId
	});
	const allowFromList = formatAllowFromList({
		plugin,
		cfg,
		accountId: ctx.AccountId,
		allowFrom: resolvedAllowFrom.allowFrom
	});
	const configOwnerAllowFromList = resolveOwnerAllowFromList({
		plugin,
		cfg,
		accountId: ctx.AccountId,
		providerId,
		allowFrom: cfg.commands?.ownerAllowFrom
	});
	const contextOwnerAllowFromList = resolveOwnerAllowFromList({
		plugin,
		cfg,
		accountId: ctx.AccountId,
		providerId,
		allowFrom: ctx.OwnerAllowFrom
	});
	const allowAll = !resolvedAllowFrom.hadResolutionError && (allowFromList.length === 0 || allowFromList.some((entry) => entry.trim() === "*"));
	const ownerCandidatesForCommands = allowAll ? [] : allowFromList.filter((entry) => entry !== "*");
	if (!allowAll && ownerCandidatesForCommands.length === 0 && to) {
		const normalizedTo = normalizeAllowFromEntry({
			plugin,
			cfg,
			accountId: ctx.AccountId,
			value: to
		});
		if (normalizedTo.length > 0) ownerCandidatesForCommands.push(...normalizedTo);
	}
	const ownerAllowAll = configOwnerAllowFromList.some((entry) => entry.trim() === "*");
	const explicitOwners = configOwnerAllowFromList.filter((entry) => entry !== "*");
	const explicitOverrides = contextOwnerAllowFromList.filter((entry) => entry !== "*");
	const ownerList = Array.from(new Set(explicitOwners.length > 0 ? explicitOwners : ownerAllowAll ? [] : explicitOverrides.length > 0 ? explicitOverrides : ownerCandidatesForCommands));
	const senderCandidates = resolveSenderCandidates({
		plugin,
		providerId,
		cfg,
		accountId: ctx.AccountId,
		senderId: ctx.SenderId,
		senderE164: ctx.SenderE164,
		from,
		chatType: ctx.ChatType
	});
	const matchedSender = ownerList.length ? senderCandidates.find((candidate) => ownerList.includes(candidate)) : void 0;
	const matchedCommandOwner = ownerCandidatesForCommands.length ? senderCandidates.find((candidate) => ownerCandidatesForCommands.includes(candidate)) : void 0;
	const senderId = matchedSender ?? senderCandidates[0];
	const enforceOwner = Boolean(plugin?.commands?.enforceOwnerForCommands ?? resolveFallbackCommandOptions(providerId).enforceOwnerForCommands);
	const senderIsOwnerByIdentity = Boolean(matchedSender);
	const senderIsOwnerByScope = isInternalMessageChannel(ctx.Provider) && Array.isArray(ctx.GatewayClientScopes) && ctx.GatewayClientScopes.includes("operator.admin");
	const ownerAllowlistConfigured = ownerAllowAll || explicitOwners.length > 0;
	const senderIsOwner = ctx.ForceSenderIsOwnerFalse ? false : senderIsOwnerByIdentity || senderIsOwnerByScope || ownerAllowAll;
	const isOwnerForCommands = !(enforceOwner || ownerAllowlistConfigured) ? true : ownerAllowAll ? true : ownerAllowlistConfigured ? senderIsOwner : allowAll || ownerCandidatesForCommands.length === 0 || Boolean(matchedCommandOwner);
	let isAuthorizedSender;
	if (commandsAllowFromList !== null || providerResolutionError && commandsAllowFromConfigured) {
		const commandsAllowAll = !providerResolutionError && Boolean(commandsAllowFromList?.some((entry) => entry.trim() === "*"));
		const matchedCommandsAllowFrom = commandsAllowFromList?.length ? senderCandidates.find((candidate) => commandsAllowFromList.includes(candidate)) : void 0;
		isAuthorizedSender = !providerResolutionError && (commandsAllowAll || Boolean(matchedCommandsAllowFrom));
	} else isAuthorizedSender = commandAuthorized && isOwnerForCommands;
	return {
		providerId,
		ownerList,
		senderId: senderId || void 0,
		senderIsOwner,
		isAuthorizedSender,
		from: from || void 0,
		to: to || void 0
	};
}
//#endregion
export { resolveCommandAuthorization as t };
