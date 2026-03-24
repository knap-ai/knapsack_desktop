import { clearCredentialsCache, extractGeminiCliCredentials } from "./oauth.credentials.js";
import type { GeminiCliOAuthContext, GeminiCliOAuthCredentials } from "./oauth.shared.js";
export { clearCredentialsCache, extractGeminiCliCredentials };
export type { GeminiCliOAuthContext, GeminiCliOAuthCredentials };
export declare function loginGeminiCliOAuth(ctx: GeminiCliOAuthContext): Promise<GeminiCliOAuthCredentials>;
