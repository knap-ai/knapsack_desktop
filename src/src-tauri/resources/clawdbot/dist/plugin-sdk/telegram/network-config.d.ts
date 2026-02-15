import type { TelegramNetworkConfig } from "../config/types.telegram.js";
export declare const TELEGRAM_DISABLE_AUTO_SELECT_FAMILY_ENV = "OPENCLAW_TELEGRAM_DISABLE_AUTO_SELECT_FAMILY";
export declare const TELEGRAM_ENABLE_AUTO_SELECT_FAMILY_ENV = "OPENCLAW_TELEGRAM_ENABLE_AUTO_SELECT_FAMILY";
export type TelegramAutoSelectFamilyDecision = {
    value: boolean | null;
    source?: string;
};
export declare function resolveTelegramAutoSelectFamilyDecision(params?: {
    network?: TelegramNetworkConfig;
    env?: NodeJS.ProcessEnv;
    nodeMajor?: number;
}): TelegramAutoSelectFamilyDecision;
