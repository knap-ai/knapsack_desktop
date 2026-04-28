import { i as resolveMatrixAccount } from "./accounts-CvjaPPER.js";
import { r as matrixConfigAdapter, t as MatrixConfigSchema } from "./config-schema-BK-hmF1h.js";
import { n as matrixSetupAdapter, t as createMatrixSetupWizardProxy } from "./setup-core-vUjse8DF.js";
import { describeAccountSnapshot } from "openclaw/plugin-sdk/account-helpers";
import { buildChannelConfigSchema } from "openclaw/plugin-sdk/channel-config-primitives";
const matrixSetupPlugin = {
	id: "matrix",
	meta: {
		id: "matrix",
		label: "Matrix",
		selectionLabel: "Matrix (plugin)",
		docsPath: "/channels/matrix",
		docsLabel: "matrix",
		blurb: "open protocol; configure a homeserver + access token.",
		order: 70,
		quickstartAllowFrom: true
	},
	setupWizard: createMatrixSetupWizardProxy(async () => ({ matrixSetupWizard: (await import("./setup-surface-N3Equur_.js").then((n) => n.t)).matrixSetupWizard })),
	setup: matrixSetupAdapter,
	capabilities: {
		chatTypes: [
			"direct",
			"group",
			"thread"
		],
		polls: true,
		reactions: true,
		threads: true,
		media: true
	},
	reload: { configPrefixes: ["channels.matrix"] },
	configSchema: buildChannelConfigSchema(MatrixConfigSchema),
	config: {
		...matrixConfigAdapter,
		isConfigured: (account) => account.configured,
		describeAccount: (account) => describeAccountSnapshot({
			account,
			configured: account.configured,
			extra: { baseUrl: account.homeserver }
		}),
		hasConfiguredState: ({ cfg }) => resolveMatrixAccount({ cfg }).configured
	}
};
//#endregion
export { matrixSetupPlugin };
