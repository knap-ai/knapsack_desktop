import "./tmp-openclaw-dir-Day5KPIY.js";
import "./zod-schema.core-Cx4hqkoC.js";
import "./config-schema-BoSEJoAt.js";
import "./zod-schema.agent-runtime-BB53-_4o.js";
import "./setup-helpers-CjYO5YkF.js";
import "./status-helpers-CtpWf3f1.js";
import "./setup-wizard-helpers-BfrhuTOh.js";
import { t as createOptionalChannelSetupSurface } from "./channel-setup-CHiUxDQ-.js";
import "./channel-reply-pipeline-S26JmiPz.js";
import "./command-auth-Bajp-QXz.js";
import "./outbound-media-Cj_f0fBE.js";
//#region src/plugin-sdk/zalouser.ts
const zalouserSetup = createOptionalChannelSetupSurface({
	channel: "zalouser",
	label: "Zalo Personal",
	npmSpec: "@openclaw/zalouser",
	docsPath: "/channels/zalouser"
});
const zalouserSetupAdapter = zalouserSetup.setupAdapter;
const zalouserSetupWizard = zalouserSetup.setupWizard;
//#endregion
export { zalouserSetupWizard as n, zalouserSetupAdapter as t };
