pub const KN_LLM_FILES_MAX_WORDS: u32 = 2000; // ~2667k tokens, which is the default context window size for Gemma

pub const KN_SEARCH_ITEM_FIELD_UNIQUE_ID: &str = "uniqueId";
pub const KN_SEARCH_ITEM_FIELD_FILTER_TYPE: &str = "filterType";
pub const KN_SEARCH_ITEM_FILTER_TYPE_GMAIL: &str = "GMAIL";
pub const KN_SEARCH_ITEM_FILTER_TYPE_FILE: &str = "FILES";
pub const KN_SEARCH_ITEM_FILTER_TYPE_DRIVE: &str = "DRIVE";
pub const KN_SEARCH_ITEM_FILTER_TYPE_WEB: &str = "WEB";
pub const KN_MICROSOFT_AUTH_URL: &str = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
pub const KN_MICROSOFT_TOKEN_URL: &str = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
pub const KN_MICROSOFT_REDIRECT_URL: &str = "http://localhost:8897/api/knapsack/microsoft/signin";

pub const EMBEDDING_BATCH_SIZE: usize = 8;
pub const GMAIL_DOWNLOADS_THREAD_POOL_SIZE: usize = 8;
