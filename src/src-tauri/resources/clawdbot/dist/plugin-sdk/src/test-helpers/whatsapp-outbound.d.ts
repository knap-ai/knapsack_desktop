import { type MockInstance } from "vitest";
import type { OpenClawConfig } from "../config/config.js";
export declare function createWhatsAppPollFixture(): {
    cfg: OpenClawConfig;
    poll: {
        question: string;
        options: string[];
        maxSelections: number;
    };
    to: string;
    accountId: string;
};
export declare function expectWhatsAppPollSent(sendPollWhatsApp: MockInstance, params: {
    cfg: OpenClawConfig;
    poll: {
        question: string;
        options: string[];
        maxSelections: number;
    };
    to?: string;
    accountId?: string;
}): void;
