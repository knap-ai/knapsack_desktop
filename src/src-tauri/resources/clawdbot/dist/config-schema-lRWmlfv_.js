import { a as hasConfiguredSecretInput } from "./types.secrets-CeL3gSMO.js";
import { h as MarkdownConfigSchema, l as GroupPolicySchema, o as DmPolicySchema } from "./zod-schema.core-CYrn8zgQ.js";
import { n as buildCatchallMultiAccountChannelSchema, r as buildChannelConfigSchema, t as AllowFromListSchema } from "./config-schema-sgVTuroC.js";
import { c as ToolPolicySchema } from "./zod-schema.agent-runtime-BSPBF_O_.js";
import { r as buildSecretInputSchema } from "./secret-input-BEMaS7ol.js";
import "./channel-config-schema-BNbUh-jY.js";
import { t as zod_exports } from "./zod-BUbl8seT.js";
import "./secret-input-DwXeRlOM.js";
//#region extensions/bluebubbles/src/config-ui-hints.ts
const bluebubblesChannelConfigUiHints = {
	"": {
		label: "BlueBubbles",
		help: "BlueBubbles channel provider configuration used for Apple messaging bridge integrations. Keep DM policy aligned with your trusted sender model in shared deployments."
	},
	dmPolicy: {
		label: "BlueBubbles DM Policy",
		help: "Direct message access control (\"pairing\" recommended). \"open\" requires channels.bluebubbles.allowFrom=[\"*\"]."
	}
};
//#endregion
//#region extensions/bluebubbles/src/config-schema.ts
const bluebubblesActionSchema = zod_exports.z.object({
	reactions: zod_exports.z.boolean().default(true),
	edit: zod_exports.z.boolean().default(true),
	unsend: zod_exports.z.boolean().default(true),
	reply: zod_exports.z.boolean().default(true),
	sendWithEffect: zod_exports.z.boolean().default(true),
	renameGroup: zod_exports.z.boolean().default(true),
	setGroupIcon: zod_exports.z.boolean().default(true),
	addParticipant: zod_exports.z.boolean().default(true),
	removeParticipant: zod_exports.z.boolean().default(true),
	leaveGroup: zod_exports.z.boolean().default(true),
	sendAttachment: zod_exports.z.boolean().default(true)
}).optional();
const bluebubblesGroupConfigSchema = zod_exports.z.object({
	requireMention: zod_exports.z.boolean().optional(),
	tools: ToolPolicySchema
});
const bluebubblesNetworkSchema = zod_exports.z.object({ dangerouslyAllowPrivateNetwork: zod_exports.z.boolean().optional() }).strict().optional();
const bluebubblesCatchupSchema = zod_exports.z.object({
	enabled: zod_exports.z.boolean().optional(),
	maxAgeMinutes: zod_exports.z.number().int().positive().optional(),
	perRunLimit: zod_exports.z.number().int().positive().optional(),
	firstRunLookbackMinutes: zod_exports.z.number().int().positive().optional(),
	maxFailureRetries: zod_exports.z.number().int().positive().optional()
}).strict().optional();
const BlueBubblesChannelConfigSchema = buildChannelConfigSchema(buildCatchallMultiAccountChannelSchema(zod_exports.z.object({
	name: zod_exports.z.string().optional(),
	enabled: zod_exports.z.boolean().optional(),
	markdown: MarkdownConfigSchema,
	actions: bluebubblesActionSchema,
	serverUrl: zod_exports.z.string().optional(),
	password: buildSecretInputSchema().optional(),
	webhookPath: zod_exports.z.string().optional(),
	dmPolicy: DmPolicySchema.optional(),
	allowFrom: AllowFromListSchema,
	groupAllowFrom: AllowFromListSchema,
	groupPolicy: GroupPolicySchema.optional(),
	enrichGroupParticipantsFromContacts: zod_exports.z.boolean().optional().default(true),
	historyLimit: zod_exports.z.number().int().min(0).optional(),
	dmHistoryLimit: zod_exports.z.number().int().min(0).optional(),
	textChunkLimit: zod_exports.z.number().int().positive().optional(),
	chunkMode: zod_exports.z.enum(["length", "newline"]).optional(),
	mediaMaxMb: zod_exports.z.number().int().positive().optional(),
	mediaLocalRoots: zod_exports.z.array(zod_exports.z.string()).optional(),
	sendReadReceipts: zod_exports.z.boolean().optional(),
	network: bluebubblesNetworkSchema,
	catchup: bluebubblesCatchupSchema,
	blockStreaming: zod_exports.z.boolean().optional(),
	groups: zod_exports.z.object({}).catchall(bluebubblesGroupConfigSchema).optional()
}).superRefine((value, ctx) => {
	const serverUrl = value.serverUrl?.trim() ?? "";
	const passwordConfigured = hasConfiguredSecretInput(value.password);
	if (serverUrl && !passwordConfigured) ctx.addIssue({
		code: zod_exports.z.ZodIssueCode.custom,
		path: ["password"],
		message: "password is required when serverUrl is configured"
	});
})).safeExtend({ actions: bluebubblesActionSchema }), { uiHints: bluebubblesChannelConfigUiHints });
//#endregion
export { BlueBubblesChannelConfigSchema as t };
