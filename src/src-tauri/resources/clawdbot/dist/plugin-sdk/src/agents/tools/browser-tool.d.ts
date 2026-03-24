import { browserAct, browserArmDialog, browserArmFileChooser, browserNavigate, browserPdfSave, browserScreenshotAction } from "../../browser/client-actions.js";
import { browserCloseTab, browserFocusTab, browserOpenTab, browserProfiles, browserStart, browserStatus, browserStop } from "../../browser/client.js";
import { trackSessionBrowserTab, untrackSessionBrowserTab } from "../../browser/session-tab-registry.js";
import { loadConfig } from "../../config/config.js";
import { type AnyAgentTool, imageResultFromFile } from "./common.js";
import { callGatewayTool } from "./gateway.js";
import { listNodes } from "./nodes-utils.js";
export declare const __testing: {
    setDepsForTest(overrides: Partial<{
        browserAct: typeof browserAct;
        browserArmDialog: typeof browserArmDialog;
        browserArmFileChooser: typeof browserArmFileChooser;
        browserCloseTab: typeof browserCloseTab;
        browserFocusTab: typeof browserFocusTab;
        browserNavigate: typeof browserNavigate;
        browserOpenTab: typeof browserOpenTab;
        browserPdfSave: typeof browserPdfSave;
        browserProfiles: typeof browserProfiles;
        browserScreenshotAction: typeof browserScreenshotAction;
        browserStart: typeof browserStart;
        browserStatus: typeof browserStatus;
        browserStop: typeof browserStop;
        imageResultFromFile: typeof imageResultFromFile;
        loadConfig: typeof loadConfig;
        listNodes: typeof listNodes;
        callGatewayTool: typeof callGatewayTool;
        trackSessionBrowserTab: typeof trackSessionBrowserTab;
        untrackSessionBrowserTab: typeof untrackSessionBrowserTab;
    }> | null): void;
};
export declare function createBrowserTool(opts?: {
    sandboxBridgeUrl?: string;
    allowHostControl?: boolean;
    agentSessionKey?: string;
}): AnyAgentTool;
