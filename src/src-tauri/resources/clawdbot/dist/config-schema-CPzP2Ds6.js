import { a as DmPolicySchema } from "./zod-schema.core-BuVz8Rk7.js";
import { z } from "zod";
//#region src/channels/plugins/config-schema.ts
const AllowFromEntrySchema = z.union([z.string(), z.number()]);
const AllowFromListSchema = z.array(AllowFromEntrySchema).optional();
function buildNestedDmConfigSchema() {
	return z.object({
		enabled: z.boolean().optional(),
		policy: DmPolicySchema.optional(),
		allowFrom: AllowFromListSchema
	}).optional();
}
function buildCatchallMultiAccountChannelSchema(accountSchema) {
	return accountSchema.extend({
		accounts: z.object({}).catchall(accountSchema).optional(),
		defaultAccount: z.string().optional()
	});
}
function buildChannelConfigSchema(schema) {
	const schemaWithJson = schema;
	if (typeof schemaWithJson.toJSONSchema === "function") return { schema: schemaWithJson.toJSONSchema({
		target: "draft-07",
		unrepresentable: "any"
	}) };
	return { schema: {
		type: "object",
		additionalProperties: true
	} };
}
//#endregion
export { buildNestedDmConfigSchema as i, buildCatchallMultiAccountChannelSchema as n, buildChannelConfigSchema as r, AllowFromListSchema as t };
