import { type GeminiCliOAuthCredentials } from "./oauth.shared.js";
export declare function exchangeCodeForTokens(code: string, verifier: string): Promise<GeminiCliOAuthCredentials>;
