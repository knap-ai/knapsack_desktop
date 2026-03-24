import { t as createOptionalChannelSetupSurface } from "./channel-setup-C5JbULY6.js";
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
