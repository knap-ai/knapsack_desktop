import "./logger-kwZIqwuw.js";
import "./paths-ViKUYWUK.js";
import "./tmp-openclaw-dir-idKIOMmb.js";
import "./theme-CdOoMzRk.js";
import "./globals-DBUMOBZ8.js";
import "./subsystem-DISldKSB.js";
import "./ansi-BEJF8NKS.js";
import "./boolean-C3GkJetE.js";
import "./env-Dnra1IpT.js";
import "./utils-CS0Ikux6.js";
import "./paths-C4Oy7wjk.js";
import "./auth-profiles-DRuJBw5y.js";
import { a as resolveAgentDir, m as resolveDefaultAgentId, v as resolveSessionAgentId } from "./agent-scope-bjWqU22i.js";
import "./boundary-path-Dm0QJ7-y.js";
import "./boundary-file-read-DcZxlWD8.js";
import "./logger-BmpSCz93.js";
import "./exec-B5_AYfQG.js";
import "./workspace-D4K6QX9X.js";
import "./defaults-eEZJg44K.js";
import "./model-selection-BnFtDmP7.js";
import "./io-y3Az_Onx.js";
import "./shell-env-BOu7XeT_.js";
import "./safe-text-yavot2qw.js";
import "./version-CD3oP1-d.js";
import "./env-substitution-O6uabUmO.js";
import "./includes-Bj3eLUWH.js";
import "./zod-schema.providers-core-COy5nBQ0.js";
import "./legacy-web-search-BB-ZHEhz.js";
import "./registry-C5UkPpaO.js";
import "./config-state-Br0ucqMb.js";
import "./min-host-version-RMBWtIAR.js";
import "./manifest-registry-B5JNQdOM.js";
import "./runtime-guard-PhQ6PwQa.js";
import "./avatar-policy-B5nOfso_.js";
import "./ip-Ce8EDTBZ.js";
import "./zod-schema.agent-runtime-Dtg4Jy6G.js";
import "./zod-schema.core-BuVz8Rk7.js";
import "./config-D4zN4BRl.js";
import "./file-lock-DEiVq2ow.js";
import "./audit-fs-DTQIjp2r.js";
import "./resolve-B7S4PlnO.js";
import "./profiles-COPO-hHI.js";
import "./message-channel-BliByQBl.js";
import { l as updateSessionStore } from "./store-C5UK26Ce.js";
import "./runtime-Iz8uZ7EU.js";
import "./plugins-B09-vgme.js";
import "./paths-rhN9LKM_.js";
import "./session-write-lock-va3qZE6f.js";
import "./thinking-CJoSRIGR.js";
import { t as applyModelOverrideToSessionEntry } from "./model-overrides-B_s4f-Dt.js";
import { d as lookupCachedContextTokens, t as applyVerboseOverride } from "./level-overrides-DzIzQ3ZY.js";
import { r as enqueueSystemEvent } from "./system-events-BU_NYynX.js";
import { c as resolveModelSelectionFromDirective, n as enqueueModeSwitchEvents, t as canPersistInternalExecDirective } from "./directive-handling.shared-BHflmVy0.js";
//#region src/auto-reply/reply/directive-handling.persist.ts
async function persistInlineDirectives(params) {
	const { directives, cfg, sessionEntry, sessionStore, sessionKey, storePath, elevatedEnabled, elevatedAllowed, defaultProvider, defaultModel, aliasIndex, allowedModelKeys, initialModelLabel, formatModelSwitchEvent, agentCfg } = params;
	let { provider, model } = params;
	const allowInternalExecPersistence = canPersistInternalExecDirective({
		surface: params.surface,
		gatewayClientScopes: params.gatewayClientScopes
	});
	const activeAgentId = sessionKey ? resolveSessionAgentId({
		sessionKey,
		config: cfg
	}) : resolveDefaultAgentId(cfg);
	const agentDir = params.agentDir ?? resolveAgentDir(cfg, activeAgentId);
	if (sessionEntry && sessionStore && sessionKey) {
		const prevElevatedLevel = sessionEntry.elevatedLevel ?? agentCfg?.elevatedDefault ?? (elevatedAllowed ? "on" : "off");
		const prevReasoningLevel = sessionEntry.reasoningLevel ?? "off";
		let elevatedChanged = directives.hasElevatedDirective && directives.elevatedLevel !== void 0 && elevatedEnabled && elevatedAllowed;
		let reasoningChanged = directives.hasReasoningDirective && directives.reasoningLevel !== void 0;
		let updated = false;
		if (directives.hasThinkDirective && directives.thinkLevel) {
			sessionEntry.thinkingLevel = directives.thinkLevel;
			updated = true;
		}
		if (directives.hasVerboseDirective && directives.verboseLevel) {
			applyVerboseOverride(sessionEntry, directives.verboseLevel);
			updated = true;
		}
		if (directives.hasReasoningDirective && directives.reasoningLevel) {
			if (directives.reasoningLevel === "off") sessionEntry.reasoningLevel = "off";
			else sessionEntry.reasoningLevel = directives.reasoningLevel;
			reasoningChanged = reasoningChanged || directives.reasoningLevel !== prevReasoningLevel && directives.reasoningLevel !== void 0;
			updated = true;
		}
		if (directives.hasElevatedDirective && directives.elevatedLevel && elevatedEnabled && elevatedAllowed) {
			sessionEntry.elevatedLevel = directives.elevatedLevel;
			elevatedChanged = elevatedChanged || directives.elevatedLevel !== prevElevatedLevel && directives.elevatedLevel !== void 0;
			updated = true;
		}
		if (directives.hasExecDirective && directives.hasExecOptions && allowInternalExecPersistence) {
			if (directives.execHost) {
				sessionEntry.execHost = directives.execHost;
				updated = true;
			}
			if (directives.execSecurity) {
				sessionEntry.execSecurity = directives.execSecurity;
				updated = true;
			}
			if (directives.execAsk) {
				sessionEntry.execAsk = directives.execAsk;
				updated = true;
			}
			if (directives.execNode) {
				sessionEntry.execNode = directives.execNode;
				updated = true;
			}
		}
		const modelDirective = directives.hasModelDirective && params.effectiveModelDirective ? params.effectiveModelDirective : void 0;
		if (modelDirective) {
			const modelResolution = resolveModelSelectionFromDirective({
				directives: {
					...directives,
					hasModelDirective: true,
					rawModelDirective: modelDirective
				},
				cfg,
				agentDir,
				defaultProvider,
				defaultModel,
				aliasIndex,
				allowedModelKeys,
				allowedModelCatalog: [],
				provider
			});
			if (modelResolution.modelSelection) {
				const { updated: modelUpdated } = applyModelOverrideToSessionEntry({
					entry: sessionEntry,
					selection: modelResolution.modelSelection,
					profileOverride: modelResolution.profileOverride
				});
				provider = modelResolution.modelSelection.provider;
				model = modelResolution.modelSelection.model;
				const nextLabel = `${provider}/${model}`;
				if (nextLabel !== initialModelLabel) enqueueSystemEvent(formatModelSwitchEvent(nextLabel, modelResolution.modelSelection.alias), {
					sessionKey,
					contextKey: `model:${nextLabel}`
				});
				updated = updated || modelUpdated;
			}
		}
		if (directives.hasQueueDirective && directives.queueReset) {
			delete sessionEntry.queueMode;
			delete sessionEntry.queueDebounceMs;
			delete sessionEntry.queueCap;
			delete sessionEntry.queueDrop;
			updated = true;
		}
		if (updated) {
			sessionEntry.updatedAt = Date.now();
			sessionStore[sessionKey] = sessionEntry;
			if (storePath) await updateSessionStore(storePath, (store) => {
				store[sessionKey] = sessionEntry;
			});
			enqueueModeSwitchEvents({
				enqueueSystemEvent,
				sessionEntry,
				sessionKey,
				elevatedChanged,
				reasoningChanged
			});
		}
	}
	return {
		provider,
		model,
		contextTokens: agentCfg?.contextTokens ?? lookupCachedContextTokens(model) ?? 2e5
	};
}
//#endregion
export { persistInlineDirectives };
