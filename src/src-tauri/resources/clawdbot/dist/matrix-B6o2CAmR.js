import "./redact-BDinS1q9.js";
import "./links-Ce33eXq9.js";
import "./zod-schema.core-Cx4hqkoC.js";
import "./config-schema-BoSEJoAt.js";
import "./zod-schema.agent-runtime-BB53-_4o.js";
import "./net-D3XSbNNz.js";
import "./json-store-Bwo-RrS7.js";
import "./session-binding-service-CAxmjUEJ.js";
import "./setup-helpers-CjYO5YkF.js";
import "./channel-plugin-common-eQve8rmh.js";
import "./status-helpers-CtpWf3f1.js";
import "./identity-BVAU5Jb3.js";
import "./common-RGbDbB5n.js";
import "./fetch-guard-Lvq2pw52.js";
import "./local-roots-CaV3b967.js";
import "./secret-input-C8U7qpTM.js";
import "./setup-wizard-helpers-BfrhuTOh.js";
import "./run-command-ByGgkdeW.js";
import "./runtime-DQYrJ0Nk.js";
import { t as createOptionalChannelSetupSurface } from "./channel-setup-CHiUxDQ-.js";
import "./reply-prefix--bHYafND.js";
import "./channel-reply-pipeline-S26JmiPz.js";
import "./setup-group-access-Eg0ylq60.js";
import "./outbound-media-Cj_f0fBE.js";
import "./matrix-thread-bindings-ZwqoAVaX.js";
import "./matrix-helper-DsmkgjOW.js";
import "./matrix-runtime-surface-BQb_BOSl.js";
import "./matrix-surface-Dq7kB5Vi.js";
//#region src/plugin-sdk/matrix.ts
const matrixSetup = createOptionalChannelSetupSurface({
	channel: "matrix",
	label: "Matrix",
	npmSpec: "@openclaw/matrix",
	docsPath: "/channels/matrix"
});
const matrixSetupWizard = matrixSetup.setupWizard;
const matrixSetupAdapter = matrixSetup.setupAdapter;
//#endregion
export { matrixSetupWizard as n, matrixSetupAdapter as t };
