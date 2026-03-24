import { g as DEFAULT_ACCOUNT_ID } from "./session-key-DAhnzjyr.js";
import { Vb as createChatChannelPlugin, Yb as createHybridChannelConfigAdapter, zb as buildChannelOutboundSessionRoute } from "./pi-embedded-CbCYZxIb.js";
import { n as describeAccountSnapshot } from "./account-helpers-BzkeDMfB.js";
import { r as buildChannelConfigSchema } from "./config-schema-CPzP2Ds6.js";
import { l as createComputedAccountStatusAdapter, u as createDefaultChannelRuntimeState } from "./status-helpers-Cflmo90d.js";
import { n as createRuntimeOutboundDelegates } from "./runtime-forwarders-Cv9Bdwov.js";
import { r as createLazyRuntimeModule } from "./lazy-runtime-CPDBPNrj.js";
import { a as tlonSetupAdapter, c as listTlonAccountIds, d as normalizeShip, l as resolveTlonAccount, m as resolveTlonOutboundTarget, n as createTlonSetupWizardBase, p as parseTlonTarget, u as formatTargetHint } from "./setup-core-BiS_UYEO.js";
import { z } from "zod";
//#region extensions/tlon/src/config-schema.ts
const ShipSchema = z.string().min(1);
const ChannelNestSchema = z.string().min(1);
const TlonChannelRuleSchema = z.object({
	mode: z.enum(["restricted", "open"]).optional(),
	allowedShips: z.array(ShipSchema).optional()
});
const TlonAuthorizationSchema = z.object({ channelRules: z.record(z.string(), TlonChannelRuleSchema).optional() });
const tlonCommonConfigFields = {
	name: z.string().optional(),
	enabled: z.boolean().optional(),
	ship: ShipSchema.optional(),
	url: z.string().optional(),
	code: z.string().optional(),
	allowPrivateNetwork: z.boolean().optional(),
	groupChannels: z.array(ChannelNestSchema).optional(),
	dmAllowlist: z.array(ShipSchema).optional(),
	autoDiscoverChannels: z.boolean().optional(),
	showModelSignature: z.boolean().optional(),
	responsePrefix: z.string().optional(),
	autoAcceptDmInvites: z.boolean().optional(),
	autoAcceptGroupInvites: z.boolean().optional(),
	ownerShip: ShipSchema.optional()
};
const TlonAccountSchema = z.object({ ...tlonCommonConfigFields });
const tlonChannelConfigSchema = buildChannelConfigSchema(z.object({
	...tlonCommonConfigFields,
	authorization: TlonAuthorizationSchema.optional(),
	defaultAuthorizedShips: z.array(ShipSchema).optional(),
	accounts: z.record(z.string(), TlonAccountSchema).optional()
}));
//#endregion
//#region extensions/tlon/src/session-route.ts
function resolveTlonOutboundSessionRoute(params) {
	const parsed = parseTlonTarget(params.target);
	if (!parsed) return null;
	if (parsed.kind === "group") return buildChannelOutboundSessionRoute({
		cfg: params.cfg,
		agentId: params.agentId,
		channel: "tlon",
		accountId: params.accountId,
		peer: {
			kind: "group",
			id: parsed.nest
		},
		chatType: "group",
		from: `tlon:group:${parsed.nest}`,
		to: `tlon:${parsed.nest}`
	});
	return buildChannelOutboundSessionRoute({
		cfg: params.cfg,
		agentId: params.agentId,
		channel: "tlon",
		accountId: params.accountId,
		peer: {
			kind: "direct",
			id: parsed.ship
		},
		chatType: "direct",
		from: `tlon:${parsed.ship}`,
		to: `tlon:${parsed.ship}`
	});
}
//#endregion
//#region extensions/tlon/src/channel.ts
const TLON_CHANNEL_ID = "tlon";
const loadTlonChannelRuntime = createLazyRuntimeModule(() => import("./channel.runtime-B3CXQCVB.js"));
const tlonSetupWizardProxy = createTlonSetupWizardBase({
	resolveConfigured: async ({ cfg }) => await (await loadTlonChannelRuntime()).tlonSetupWizard.status.resolveConfigured({ cfg }),
	resolveStatusLines: async ({ cfg, configured }) => await (await loadTlonChannelRuntime()).tlonSetupWizard.status.resolveStatusLines?.({
		cfg,
		configured
	}) ?? [],
	finalize: async (params) => await (await loadTlonChannelRuntime()).tlonSetupWizard.finalize(params)
});
const tlonConfigAdapter = createHybridChannelConfigAdapter({
	sectionKey: TLON_CHANNEL_ID,
	listAccountIds: listTlonAccountIds,
	resolveAccount: resolveTlonAccount,
	defaultAccountId: () => DEFAULT_ACCOUNT_ID,
	clearBaseFields: [
		"ship",
		"code",
		"url",
		"name"
	],
	preserveSectionOnDefaultDelete: true,
	resolveAllowFrom: (account) => account.dmAllowlist,
	formatAllowFrom: (allowFrom) => allowFrom.map((entry) => normalizeShip(String(entry))).filter(Boolean)
});
const tlonPlugin = createChatChannelPlugin({
	base: {
		id: TLON_CHANNEL_ID,
		meta: {
			id: TLON_CHANNEL_ID,
			label: "Tlon",
			selectionLabel: "Tlon (Urbit)",
			docsPath: "/channels/tlon",
			docsLabel: "tlon",
			blurb: "Decentralized messaging on Urbit",
			aliases: ["urbit"],
			order: 90
		},
		capabilities: {
			chatTypes: [
				"direct",
				"group",
				"thread"
			],
			media: true,
			reply: true,
			threads: true
		},
		setup: tlonSetupAdapter,
		setupWizard: tlonSetupWizardProxy,
		reload: { configPrefixes: ["channels.tlon"] },
		configSchema: tlonChannelConfigSchema,
		config: {
			...tlonConfigAdapter,
			isConfigured: (account) => account.configured,
			describeAccount: (account) => describeAccountSnapshot({
				account,
				configured: account.configured,
				extra: {
					ship: account.ship,
					url: account.url
				}
			})
		},
		messaging: {
			normalizeTarget: (target) => {
				const parsed = parseTlonTarget(target);
				if (!parsed) return target.trim();
				if (parsed.kind === "dm") return parsed.ship;
				return parsed.nest;
			},
			targetResolver: {
				looksLikeId: (target) => Boolean(parseTlonTarget(target)),
				hint: formatTargetHint()
			},
			resolveOutboundSessionRoute: (params) => resolveTlonOutboundSessionRoute(params)
		},
		status: createComputedAccountStatusAdapter({
			defaultRuntime: createDefaultChannelRuntimeState(DEFAULT_ACCOUNT_ID),
			collectStatusIssues: (accounts) => {
				return accounts.flatMap((account) => {
					if (!account.configured) return [{
						channel: TLON_CHANNEL_ID,
						accountId: account.accountId,
						kind: "config",
						message: "Account not configured (missing ship, code, or url)"
					}];
					return [];
				});
			},
			buildChannelSummary: ({ snapshot }) => {
				const s = snapshot;
				return {
					configured: s.configured ?? false,
					ship: s.ship ?? null,
					url: s.url ?? null
				};
			},
			probeAccount: async ({ account }) => {
				if (!account.configured || !account.ship || !account.url || !account.code) return {
					ok: false,
					error: "Not configured"
				};
				return await (await loadTlonChannelRuntime()).probeTlonAccount(account);
			},
			resolveAccountSnapshot: ({ account }) => ({
				accountId: account.accountId,
				name: account.name ?? void 0,
				enabled: account.enabled,
				configured: account.configured,
				extra: {
					ship: account.ship,
					url: account.url
				}
			})
		}),
		gateway: { startAccount: async (ctx) => await (await loadTlonChannelRuntime()).startTlonGatewayAccount(ctx) }
	},
	outbound: {
		deliveryMode: "direct",
		textChunkLimit: 1e4,
		resolveTarget: ({ to }) => resolveTlonOutboundTarget(to),
		...createRuntimeOutboundDelegates({
			getRuntime: loadTlonChannelRuntime,
			sendText: { resolve: (runtime) => runtime.tlonRuntimeOutbound.sendText },
			sendMedia: { resolve: (runtime) => runtime.tlonRuntimeOutbound.sendMedia }
		})
	}
});
//#endregion
export { tlonPlugin as t };
