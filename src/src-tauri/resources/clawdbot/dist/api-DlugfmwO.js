import { t as formatDocsLink } from "./links-8xRhWBQL.js";
import { _ as normalizeAccountId, g as DEFAULT_ACCOUNT_ID } from "./session-key-DAhnzjyr.js";
import { a as hasConfiguredSecretInput } from "./types.secrets-DgX397vI.js";
import { i as createPatchedAccountSetupAdapter } from "./setup-helpers-B2gYys18.js";
import { C as createTopLevelChannelDmPolicy, D as mergeAllowFromEntries, U as promptSingleChannelSecretInput, Y as runSingleChannelSecretStep, d as buildSingleChannelSecretPromptState, x as createStandardChannelSetupStatus } from "./setup-wizard-proxy-DoOpOF8S.js";
import { i as resolveZaloAccount, n as listZaloAccountIds, r as resolveDefaultZaloAccountId } from "./accounts-DcKwFiLd.js";
const zaloSetupAdapter = createPatchedAccountSetupAdapter({
	channelKey: "zalo",
	validateInput: ({ accountId, input }) => {
		if (input.useEnv && accountId !== "default") return "ZALO_BOT_TOKEN can only be used for the default account.";
		if (!input.useEnv && !input.token && !input.tokenFile) return "Zalo requires token or --token-file (or --use-env).";
		return null;
	},
	buildPatch: (input) => input.useEnv ? {} : input.tokenFile ? { tokenFile: input.tokenFile } : input.token ? { botToken: input.token } : {}
});
//#endregion
//#region extensions/zalo/src/setup-surface.ts
const channel = "zalo";
function setZaloUpdateMode(cfg, accountId, mode, webhookUrl, webhookSecret, webhookPath) {
	const isDefault = accountId === DEFAULT_ACCOUNT_ID;
	if (mode === "polling") {
		if (isDefault) {
			const { webhookUrl: _url, webhookSecret: _secret, webhookPath: _path, ...rest } = cfg.channels?.zalo ?? {};
			return {
				...cfg,
				channels: {
					...cfg.channels,
					zalo: rest
				}
			};
		}
		const accounts = { ...cfg.channels?.zalo?.accounts };
		const { webhookUrl: _url, webhookSecret: _secret, webhookPath: _path, ...rest } = accounts[accountId] ?? {};
		accounts[accountId] = rest;
		return {
			...cfg,
			channels: {
				...cfg.channels,
				zalo: {
					...cfg.channels?.zalo,
					accounts
				}
			}
		};
	}
	if (isDefault) return {
		...cfg,
		channels: {
			...cfg.channels,
			zalo: {
				...cfg.channels?.zalo,
				webhookUrl,
				webhookSecret,
				webhookPath
			}
		}
	};
	const accounts = { ...cfg.channels?.zalo?.accounts };
	accounts[accountId] = {
		...accounts[accountId],
		webhookUrl,
		webhookSecret,
		webhookPath
	};
	return {
		...cfg,
		channels: {
			...cfg.channels,
			zalo: {
				...cfg.channels?.zalo,
				accounts
			}
		}
	};
}
async function noteZaloTokenHelp(prompter) {
	await prompter.note([
		"1) Open Zalo Bot Platform: https://bot.zaloplatforms.com",
		"2) Create a bot and get the token",
		"3) Token looks like 12345689:abc-xyz",
		"Tip: you can also set ZALO_BOT_TOKEN in your env.",
		`Docs: ${formatDocsLink("/channels/zalo", "zalo")}`
	].join("\n"), "Zalo bot token");
}
async function promptZaloAllowFrom(params) {
	const { cfg, prompter, accountId } = params;
	const existingAllowFrom = resolveZaloAccount({
		cfg,
		accountId
	}).config.allowFrom ?? [];
	const entry = await prompter.text({
		message: "Zalo allowFrom (user id)",
		placeholder: "123456789",
		initialValue: existingAllowFrom[0] ? String(existingAllowFrom[0]) : void 0,
		validate: (value) => {
			const raw = String(value ?? "").trim();
			if (!raw) return "Required";
			if (!/^\d+$/.test(raw)) return "Use a numeric Zalo user id";
		}
	});
	const unique = mergeAllowFromEntries(existingAllowFrom, [String(entry).trim()]);
	if (accountId === "default") return {
		...cfg,
		channels: {
			...cfg.channels,
			zalo: {
				...cfg.channels?.zalo,
				enabled: true,
				dmPolicy: "allowlist",
				allowFrom: unique
			}
		}
	};
	return {
		...cfg,
		channels: {
			...cfg.channels,
			zalo: {
				...cfg.channels?.zalo,
				enabled: true,
				accounts: {
					...cfg.channels?.zalo?.accounts,
					[accountId]: {
						...cfg.channels?.zalo?.accounts?.[accountId],
						enabled: cfg.channels?.zalo?.accounts?.[accountId]?.enabled ?? true,
						dmPolicy: "allowlist",
						allowFrom: unique
					}
				}
			}
		}
	};
}
const zaloDmPolicy = createTopLevelChannelDmPolicy({
	label: "Zalo",
	channel,
	policyKey: "channels.zalo.dmPolicy",
	allowFromKey: "channels.zalo.allowFrom",
	getCurrent: (cfg) => cfg.channels?.zalo?.dmPolicy ?? "pairing",
	promptAllowFrom: async ({ cfg, prompter, accountId }) => {
		return await promptZaloAllowFrom({
			cfg,
			prompter,
			accountId: accountId && normalizeAccountId(accountId) ? normalizeAccountId(accountId) ?? "default" : resolveDefaultZaloAccountId(cfg)
		});
	}
});
const zaloSetupWizard = {
	channel,
	status: createStandardChannelSetupStatus({
		channelLabel: "Zalo",
		configuredLabel: "configured",
		unconfiguredLabel: "needs token",
		configuredHint: "recommended · configured",
		unconfiguredHint: "recommended · newcomer-friendly",
		configuredScore: 1,
		unconfiguredScore: 10,
		includeStatusLine: true,
		resolveConfigured: ({ cfg }) => listZaloAccountIds(cfg).some((accountId) => {
			const account = resolveZaloAccount({
				cfg,
				accountId,
				allowUnresolvedSecretRef: true
			});
			return Boolean(account.token) || hasConfiguredSecretInput(account.config.botToken) || Boolean(account.config.tokenFile?.trim());
		})
	}),
	credentials: [],
	finalize: async ({ cfg, accountId, forceAllowFrom, options, prompter }) => {
		let next = cfg;
		const resolvedAccount = resolveZaloAccount({
			cfg: next,
			accountId,
			allowUnresolvedSecretRef: true
		});
		const accountConfigured = Boolean(resolvedAccount.token);
		const allowEnv = accountId === DEFAULT_ACCOUNT_ID;
		const hasConfigToken = Boolean(hasConfiguredSecretInput(resolvedAccount.config.botToken) || resolvedAccount.config.tokenFile);
		next = (await runSingleChannelSecretStep({
			cfg: next,
			prompter,
			providerHint: "zalo",
			credentialLabel: "bot token",
			secretInputMode: options?.secretInputMode,
			accountConfigured,
			hasConfigToken,
			allowEnv,
			envValue: process.env.ZALO_BOT_TOKEN,
			envPrompt: "ZALO_BOT_TOKEN detected. Use env var?",
			keepPrompt: "Zalo token already configured. Keep it?",
			inputPrompt: "Enter Zalo bot token",
			preferredEnvVar: "ZALO_BOT_TOKEN",
			onMissingConfigured: async () => await noteZaloTokenHelp(prompter),
			applyUseEnv: async (currentCfg) => accountId === "default" ? {
				...currentCfg,
				channels: {
					...currentCfg.channels,
					zalo: {
						...currentCfg.channels?.zalo,
						enabled: true
					}
				}
			} : currentCfg,
			applySet: async (currentCfg, value) => accountId === "default" ? {
				...currentCfg,
				channels: {
					...currentCfg.channels,
					zalo: {
						...currentCfg.channels?.zalo,
						enabled: true,
						botToken: value
					}
				}
			} : {
				...currentCfg,
				channels: {
					...currentCfg.channels,
					zalo: {
						...currentCfg.channels?.zalo,
						enabled: true,
						accounts: {
							...currentCfg.channels?.zalo?.accounts,
							[accountId]: {
								...currentCfg.channels?.zalo?.accounts?.[accountId],
								enabled: true,
								botToken: value
							}
						}
					}
				}
			}
		})).cfg;
		if (await prompter.confirm({
			message: "Use webhook mode for Zalo?",
			initialValue: Boolean(resolvedAccount.config.webhookUrl)
		})) {
			const webhookUrl = String(await prompter.text({
				message: "Webhook URL (https://...) ",
				initialValue: resolvedAccount.config.webhookUrl,
				validate: (value) => value?.trim()?.startsWith("https://") ? void 0 : "HTTPS URL required"
			})).trim();
			const defaultPath = (() => {
				try {
					return new URL(webhookUrl).pathname || "/zalo-webhook";
				} catch {
					return "/zalo-webhook";
				}
			})();
			let webhookSecretResult = await promptSingleChannelSecretInput({
				cfg: next,
				prompter,
				providerHint: "zalo-webhook",
				credentialLabel: "webhook secret",
				secretInputMode: options?.secretInputMode,
				...buildSingleChannelSecretPromptState({
					accountConfigured: hasConfiguredSecretInput(resolvedAccount.config.webhookSecret),
					hasConfigToken: hasConfiguredSecretInput(resolvedAccount.config.webhookSecret),
					allowEnv: false
				}),
				envPrompt: "",
				keepPrompt: "Zalo webhook secret already configured. Keep it?",
				inputPrompt: "Webhook secret (8-256 chars)",
				preferredEnvVar: "ZALO_WEBHOOK_SECRET"
			});
			while (webhookSecretResult.action === "set" && typeof webhookSecretResult.value === "string" && (webhookSecretResult.value.length < 8 || webhookSecretResult.value.length > 256)) {
				await prompter.note("Webhook secret must be between 8 and 256 characters.", "Zalo webhook");
				webhookSecretResult = await promptSingleChannelSecretInput({
					cfg: next,
					prompter,
					providerHint: "zalo-webhook",
					credentialLabel: "webhook secret",
					secretInputMode: options?.secretInputMode,
					...buildSingleChannelSecretPromptState({
						accountConfigured: false,
						hasConfigToken: false,
						allowEnv: false
					}),
					envPrompt: "",
					keepPrompt: "Zalo webhook secret already configured. Keep it?",
					inputPrompt: "Webhook secret (8-256 chars)",
					preferredEnvVar: "ZALO_WEBHOOK_SECRET"
				});
			}
			const webhookSecret = webhookSecretResult.action === "set" ? webhookSecretResult.value : resolvedAccount.config.webhookSecret;
			const webhookPath = String(await prompter.text({
				message: "Webhook path (optional)",
				initialValue: resolvedAccount.config.webhookPath ?? defaultPath
			})).trim();
			next = setZaloUpdateMode(next, accountId, "webhook", webhookUrl, webhookSecret, webhookPath || void 0);
		} else next = setZaloUpdateMode(next, accountId, "polling");
		if (forceAllowFrom) next = await promptZaloAllowFrom({
			cfg: next,
			prompter,
			accountId
		});
		return { cfg: next };
	},
	dmPolicy: zaloDmPolicy
};
//#endregion
export { zaloSetupAdapter as n, zaloSetupWizard as t };
