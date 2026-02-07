export const KN_SERVER_HOST = 'http://localhost:8897' // TODO: phil: should this be https?
export const KN_API_REST_FUZZY_SEARCH = KN_SERVER_HOST + '/api/knapsack/fuzzy_search'
export const KN_API_REST_SEMANTIC_SEARCH = KN_SERVER_HOST + '/api/knapsack/semantic_search'
export const KN_API_STREAM_LLM_COMPLETE = KN_SERVER_HOST + '/api/knapsack/llm_complete'
export const KN_API_STOP_LLM_EXECUTION = KN_SERVER_HOST + '/api/knapsack/stop_llm_execution'

export const KN_API_FEATURE_STATUS = KN_SERVER_HOST + '/api/knapsack/release_type'
export const KN_API_AUTOMATIONS = KN_SERVER_HOST + '/api/knapsack/automations'
export const KN_API_AUTOMATIONS_START_CHECK =
  KN_SERVER_HOST + '/api/knapsack/automations/start_check'
export const KN_API_AUTOMATION_RUNS = KN_SERVER_HOST + '/api/knapsack/automations/runs'
export const KN_API_AUTOMATION_SCHEDULE_RUNS =
  KN_SERVER_HOST + '/api/knapsack/automations/runs/schedule'
export const KN_API_FEEDBACKS = KN_SERVER_HOST + '/api/knapsack/automations/feedbacks'
export const KN_API_SYSTEM_MESSAGES = KN_SERVER_HOST + '/api/knapsack/system_messages'

export const KN_API_THREADS = KN_SERVER_HOST + '/api/knapsack/threads'
export const KN_API_CREATE_MESSAGE = KN_SERVER_HOST + '/api/knapsack/messages'
export const KN_API_FEED_ITEM = KN_SERVER_HOST + '/api/knapsack/feed_items'

export const KN_API_CONNECTIONS = KN_SERVER_HOST + '/api/knapsack/connections'
export const KN_API_CONNECTIONS_SIGNOUT = KN_SERVER_HOST + '/api/knapsack/connections/signout'
export const KN_API_CONNECTIONS_GET_STATUS = KN_SERVER_HOST + '/api/knapsack/connections/is_syncing'
export const KN_API_COMPLETE_GOOGLE_SIGN_IN =
  KN_SERVER_HOST + '/api/knapsack/google/complete/signin'
export const KN_API_GOOGLE_PROFILE = KN_SERVER_HOST + '/api/knapsack/connections/google/profile'
export const KN_API_GOOGLE_ACCESS_TOKEN =
  KN_SERVER_HOST + '/api/knapsack/connections/google/auth_token'
export const KN_API_GOOGLE_DRIVE = KN_SERVER_HOST + '/api/knapsack/connections/google/drive'
export const KN_API_GOOGLE_GMAIL = KN_SERVER_HOST + '/api/knapsack/connections/google/gmail'
export const KN_API_GOOGLE_GMAIL_READ =
  KN_SERVER_HOST + '/api/knapsack/connections/google/gmail/read'
export const KN_API_MICROSOFT_OUTLOOK_READ =
  KN_SERVER_HOST + '/api/knapsack/connections/microsoft/outlook/read'
export const KN_API_MICROSOFT_OUTLOOK_REPLY =
  KN_SERVER_HOST + '/api/knapsack/connections/microsoft/outlook/reply'
export const KN_API_GOOGLE_CALENDAR = KN_SERVER_HOST + '/api/knapsack/connections/google/calendar'
export const KN_API_LOCAL_FILES = KN_SERVER_HOST + '/api/knapsack/connections/local/files'
export const KN_API_GET_EVENTS =
  KN_SERVER_HOST + '/api/knapsack/calendar/get_events'
export const KN_API_GET_GOOGLE_EVENTS =
  KN_SERVER_HOST + '/api/knapsack/connections/google/calendar/get_events'
export const KN_API_GET_EVENTS_IDS_BY_RECURRENCE_ID =
  KN_SERVER_HOST + '/api/knapsack/connections/google/calendar/get_emails_by_recurrence_id'
export const KN_API_GOOGLE_DRIVE_FILES =
  KN_SERVER_HOST + '/api/knapsack/connections/google/drive/files'
export const KN_API_GOOGLE_DRIVE_MIME_TYPES =
  KN_SERVER_HOST + '/api/knapsack/google/drive/mimeTypes'
export const KN_API_GET_EMAIL_THREAD = KN_SERVER_HOST + '/api/knapsack/email_thread'
export const KN_API_UPDATE_EMAIL = KN_SERVER_HOST + '/api/knapsack/update_email'

// export const KN_API_GET_MICROSOFT_EVENTS =
//   KN_SERVER_HOST + '/api/knapsack/connections/microsoft/calendar/get_events'
export const KN_API_MICROSOFT_PROFILE =
  KN_SERVER_HOST + '/api/knapsack/connections/microsoft/profile'
export const KN_API_MICROSOFT_CALENDAR =
  KN_SERVER_HOST + '/api/knapsack/connections/microsoft/calendar'
export const KN_API_MICROSOFT_OUTLOOK =
  KN_SERVER_HOST + '/api/knapsack/connections/microsoft/outlook'
export const KN_API_MICROSOFT_ONE_DRIVE =
  KN_SERVER_HOST + '/api/knapsack/connections/microsoft/onedrive'

export const API_SERVER_AUTOMATIONS = import.meta.env.VITE_KN_API_SERVER + '/api/automations/'
export const API_SERVER_USERS = import.meta.env.VITE_KN_API_SERVER + '/api/users'

export const KN_API_REST_GET_RECENT_FILES = KN_SERVER_HOST + '/api/knapsack/recent_files_search'
export const KN_API_REST_GMAIL_SEARCH = KN_SERVER_HOST + '/api/knapsack/gmail_search'
export const KN_API_REST_GMAIL_SEARCH_SENT_EMAILS =
  KN_SERVER_HOST + '/api/knapsack/list_sent_emails_within_timestamps'
export const KN_API_REST_GET_RECENT_EMAILS = KN_SERVER_HOST + '/api/knapsack/recent_emails_search'
export const KN_API_REST_SEARCH_EMAIL_BY_ADDRESES =
  KN_SERVER_HOST + '/api/knapsack/search_emails_by_addresses'
export const KN_API_REST_LIST_EMAILS_AFTER_TIMESTAMP =
  KN_SERVER_HOST + '/api/knapsack/list_emails_within_timestamps'
export const KN_API_REST_GET_RECENT_CALENDAR_EVENTS =
  KN_SERVER_HOST + '/api/knapsack/recent_calendar_events'
export const KN_API_REST_GET_CALENDAR_EVENT = KN_SERVER_HOST + '/api/knapsack/calendar_event'
export const KN_API_GOOGLE_SIGNIN_REDIRECT = KN_SERVER_HOST + '/api/knapsack/google/signin'
export const KN_API_GOOGLE_RESTORE_AUTH =
  KN_SERVER_HOST + '/api/knapsack/google/restore-authentication'

export const KN_API_MICROSOFT_SIGNIN_REDIRECT = KN_SERVER_HOST + '/api/knapsack/microsoft/signin'
export const KN_API_MICROSOFT_RESTORE_AUTH =
  KN_SERVER_HOST + '/api/knapsack/microsoft/restore-authentication'

export const KN_API_START_RECORD = KN_SERVER_HOST + '/api/knapsack/start_recording'
export const KN_API_STOP_RECORD = KN_SERVER_HOST + '/api/knapsack/stop_recording'
export const KN_API_GET_TRANSCRIPT = KN_SERVER_HOST + '/api/knapsack/transcript'
export const KN_API_DELETE_TRANSCRIPT = KN_SERVER_HOST + '/api/knapsack/transcript'
export const KN_API_TRANSCRIPTS_LIST = KN_SERVER_HOST + '/api/knapsack/transcripts/list'
export const KN_API_NOTES = KN_SERVER_HOST + '/api/knapsack/notes'
export const KN_API_RECORD_STATUS = KN_SERVER_HOST + '/api/knapsack/recording_status'
export const KN_API_MIC_USAGE = KN_SERVER_HOST + '/api/knapsack/mic/usage'
export const KN_API_THREAD_TRANSCRIPT = KN_SERVER_HOST + '/api/knapsack/thread/transcript'
export const KN_API_PAUSE_RECORD = KN_SERVER_HOST + '/api/knapsack/pause_recording'

export const KN_API_GET_USER_EMAIL = KN_SERVER_HOST + '/api/knapsack/get_user_email'
export const KN_API_GOOGLE_START_FETCHING = KN_SERVER_HOST + '/api/knapsack/google/start_fetching'

export const KN_API_GET_DOC_INFOS = KN_SERVER_HOST + '/api/knapsack/document_infos'
export const KN_API_GET_DRIVE_DOC_IDS =
  KN_SERVER_HOST + '/api/knapsack/connections/google/drive/ids_by_email'
export const KN_API_CLASSIFY_EMAIL = KN_SERVER_HOST + '/api/knapsack/classify_email'
export const KN_API_GET_API_TOKEN = KN_SERVER_HOST + '/api/knapsack/connections/refresh_token_api'

// Token usage & cost management
export const KN_API_TOKEN_USAGE_SUMMARY = KN_SERVER_HOST + '/api/knapsack/token_usage/summary'
export const KN_API_TOKEN_USAGE_DAILY = KN_SERVER_HOST + '/api/knapsack/token_usage/daily'
export const KN_API_TOKEN_USAGE_RECENT = KN_SERVER_HOST + '/api/knapsack/token_usage/recent'
export const KN_API_TOKEN_USAGE_BUDGET = KN_SERVER_HOST + '/api/knapsack/token_usage/budget_status'

export const KN_CHAT_MESSAGE_MAX_STREAM_READS = 10000 // Maximum number of stream reads
export const GOOGLE_OAUTH2_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
export const MICROSOFT_OAUTH2_AUTH_URL =
  'https://login.microsoftonline.com/knap/oauth2/v2.0/authorize'
export const DISCORD_LINK = 'https://discord.gg/JfNmGpJPew'
export const TERMS_LINK = 'https://www.knapsack.ai/terms'
export const KNAP_STORE_LINK = 'https://www.knapsack.ai/knaps?sort=default&page=1'
export const KNAP_PRICING_LINK = 'https://www.knapsack.ai/pricing'
export const GOOGLE_DRIVE_LINK = 'https://www.googleapis.com/drive/v3/files'

export const PRIVACY_POLICY_LINK = 'https://www.knapsack.ai/privacy-policy'
export const TUTORIAL_LINK = 'https://youtu.be/tyvHpBSgQPo'

export const ONE_WEEK_IN_MILLIS = 1000 * 60 * 60 * 24 * 7
export const ONE_DAY_IN_MILLIS = 1000 * 60 * 60 * 24 * 1
