/**
 * Feishu app registration via OAuth device-code flow.
 *
 * Migrated from feishu-plugin-cli's `feishu-auth.ts` and `install-prompts.ts`.
 * Replaces axios with native fetch, removes inquirer/ora/chalk in favor of
 * the openclaw WizardPrompter surface.
 */
import type { FeishuDomain } from "./types.js";
export interface AppRegistrationResult {
    appId: string;
    appSecret: string;
    domain: FeishuDomain;
    openId?: string;
}
export interface BeginResult {
    deviceCode: string;
    qrUrl: string;
    userCode: string;
    interval: number;
    expireIn: number;
}
export type PollOutcome = {
    status: "success";
    result: AppRegistrationResult;
} | {
    status: "access_denied";
} | {
    status: "expired";
} | {
    status: "timeout";
} | {
    status: "error";
    message: string;
};
/**
 * Step 1: Initialize registration and verify the environment supports
 * `client_secret` auth.
 *
 * @throws If the environment does not support `client_secret`.
 */
export declare function initAppRegistration(domain?: FeishuDomain): Promise<void>;
/**
 * Step 2: Begin the device-code flow. Returns a device code and a QR URL
 * that the user should scan with Feishu/Lark mobile app.
 */
export declare function beginAppRegistration(domain?: FeishuDomain): Promise<BeginResult>;
/**
 * Step 3: Poll for authorization result until success, denial, expiry, or
 * timeout. Automatically handles domain switching when `tenant_brand` is
 * detected as "lark".
 */
export declare function pollAppRegistration(params: {
    deviceCode: string;
    interval: number;
    expireIn: number;
    initialDomain?: FeishuDomain;
    abortSignal?: AbortSignal;
    /** Registration type parameter: "ob_user" for user mode, "ob_app" for bot mode. */
    tp?: string;
}): Promise<PollOutcome>;
/**
 * Print QR code directly to stdout.
 *
 * QR codes must be printed without any surrounding box/border decoration,
 * otherwise the pattern is corrupted and cannot be scanned.
 */
export declare function printQrCode(url: string): Promise<void>;
/**
 * Fetch the app owner's open_id using the application.v6.application.get API.
 *
 * Used during setup to auto-populate security policy allowlists.
 * Returns undefined on any failure (fail-open).
 */
export declare function getAppOwnerOpenId(params: {
    appId: string;
    appSecret: string;
    domain?: FeishuDomain;
}): Promise<string | undefined>;
