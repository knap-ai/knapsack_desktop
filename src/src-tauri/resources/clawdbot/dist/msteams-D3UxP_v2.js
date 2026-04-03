import "./utils-CE3P21nG.js";
import "./links-Ce33eXq9.js";
import "./zod-schema.providers-core-BJorTsd7.js";
import "./config-schema-BoSEJoAt.js";
import "./file-lock-B6EjeH4S.js";
import "./json-store-Bwo-RrS7.js";
import "./status-helpers-CtpWf3f1.js";
import "./tokens-Bot0VGKf.js";
import "./mime-C9472kP8.js";
import "./ssrf-BWlfjI7J.js";
import "./fetch-guard-Lvq2pw52.js";
import "./store-CCBPdtW9.js";
import "./setup-wizard-helpers-BfrhuTOh.js";
import "./dm-policy-shared-ikRqobo8.js";
import "./history-5RBVRj2e.js";
import { t as createOptionalChannelSetupSurface } from "./channel-setup-CHiUxDQ-.js";
import "./channel-reply-pipeline-S26JmiPz.js";
import "./ssrf-policy-B7Ivb-NK.js";
import "./inbound-reply-dispatch-C6njCLzy.js";
import "./web-media-DPyBx-37.js";
import "./outbound-media-Cj_f0fBE.js";
import "./session-envelope-B7B9p70N.js";
//#region src/plugin-sdk/msteams.ts
const msteamsSetup = createOptionalChannelSetupSurface({
	channel: "msteams",
	label: "Microsoft Teams",
	npmSpec: "@openclaw/msteams",
	docsPath: "/channels/msteams"
});
const msteamsSetupWizard = msteamsSetup.setupWizard;
const msteamsSetupAdapter = msteamsSetup.setupAdapter;
//#endregion
export { msteamsSetupWizard as n, msteamsSetupAdapter as t };
