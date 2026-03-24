export declare const CLIENT_ID_KEYS: string[];
export declare const CLIENT_SECRET_KEYS: string[];
export declare const REDIRECT_URI = "http://localhost:8085/oauth2callback";
export declare const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export declare const TOKEN_URL = "https://oauth2.googleapis.com/token";
export declare const USERINFO_URL = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json";
export declare const CODE_ASSIST_ENDPOINT_PROD = "https://cloudcode-pa.googleapis.com";
export declare const CODE_ASSIST_ENDPOINT_DAILY = "https://daily-cloudcode-pa.sandbox.googleapis.com";
export declare const CODE_ASSIST_ENDPOINT_AUTOPUSH = "https://autopush-cloudcode-pa.sandbox.googleapis.com";
export declare const LOAD_CODE_ASSIST_ENDPOINTS: string[];
export declare const DEFAULT_FETCH_TIMEOUT_MS = 10000;
export declare const SCOPES: string[];
export declare const TIER_FREE = "free-tier";
export declare const TIER_LEGACY = "legacy-tier";
export declare const TIER_STANDARD = "standard-tier";
export type GeminiCliOAuthCredentials = {
    access: string;
    refresh: string;
    expires: number;
    email?: string;
    projectId: string;
};
export type GeminiCliOAuthContext = {
    isRemote: boolean;
    openUrl: (url: string) => Promise<void>;
    log: (msg: string) => void;
    note: (message: string, title?: string) => Promise<void>;
    prompt: (message: string) => Promise<string>;
    progress: {
        update: (msg: string) => void;
        stop: (msg?: string) => void;
    };
};
