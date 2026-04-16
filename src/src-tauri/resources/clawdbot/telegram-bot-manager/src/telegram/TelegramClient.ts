import type {
  TelegramApiResponse,
  TelegramUpdate,
  TelegramUser,
  TelegramMessage,
  SendMessageParams,
} from './types.js';

const BASE = 'https://api.telegram.org';
const POLL_TIMEOUT_SEC = 25;
const MAX_BACKOFF_MS = 64_000;

export class TelegramError extends Error {
  constructor(
    message: string,
    public readonly code: number,
  ) {
    super(message);
    this.name = 'TelegramError';
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class TelegramClient {
  private readonly token: string;

  constructor(token: string) {
    this.token = token;
  }

  private url(method: string): string {
    return `${BASE}/bot${this.token}/${method}`;
  }

  async call<T>(method: string, params?: Record<string, unknown>): Promise<T> {
    let backoff = 1_000;
    while (true) {
      try {
        const res = await fetch(this.url(method), {
          method: params !== undefined ? 'POST' : 'GET',
          headers: params !== undefined ? { 'Content-Type': 'application/json' } : undefined,
          body: params !== undefined ? JSON.stringify(params) : undefined,
        });
        const json: TelegramApiResponse<T> = await res.json() as TelegramApiResponse<T>;
        if (!json.ok) {
          if (res.status === 429 && json.parameters?.retry_after) {
            await sleep(json.parameters.retry_after * 1_000);
            continue;
          }
          throw new TelegramError(
            json.description ?? `HTTP ${res.status}`,
            json.error_code ?? res.status,
          );
        }
        return json.result!;
      } catch (err) {
        if (err instanceof TelegramError) throw err;
        await sleep(backoff);
        backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
      }
    }
  }

  getMe(): Promise<TelegramUser> {
    return this.call<TelegramUser>('getMe');
  }

  getUpdates(offset: number, limit = 100): Promise<TelegramUpdate[]> {
    return this.call<TelegramUpdate[]>('getUpdates', {
      offset,
      limit,
      timeout: POLL_TIMEOUT_SEC,
      allowed_updates: [
        'message',
        'edited_message',
        'callback_query',
        'inline_query',
        'my_chat_member',
        'managed_bot',
      ],
    });
  }

  sendMessage(params: SendMessageParams): Promise<TelegramMessage> {
    return this.call<TelegramMessage>('sendMessage', params as Record<string, unknown>);
  }

  sendPhoto(chatId: number | string, photo: string, caption?: string): Promise<TelegramMessage> {
    return this.call<TelegramMessage>('sendPhoto', { chat_id: chatId, photo, caption });
  }

  sendDocument(
    chatId: number | string,
    document: string,
    caption?: string,
  ): Promise<TelegramMessage> {
    return this.call<TelegramMessage>('sendDocument', { chat_id: chatId, document, caption });
  }

  editMessageText(
    chatId: number | string,
    messageId: number,
    text: string,
    parseMode?: string,
  ): Promise<TelegramMessage | true> {
    return this.call<TelegramMessage | true>('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: parseMode,
    });
  }

  answerCallbackQuery(callbackQueryId: string, text?: string): Promise<true> {
    return this.call<true>('answerCallbackQuery', {
      callback_query_id: callbackQueryId,
      text,
    });
  }

  setWebhook(
    url: string,
    options?: {
      maxConnections?: number;
      allowedUpdates?: string[];
      secretToken?: string;
      dropPendingUpdates?: boolean;
    },
  ): Promise<true> {
    return this.call<true>('setWebhook', {
      url,
      max_connections: options?.maxConnections ?? 40,
      allowed_updates: options?.allowedUpdates,
      secret_token: options?.secretToken,
      drop_pending_updates: options?.dropPendingUpdates,
    });
  }

  deleteWebhook(dropPendingUpdates = false): Promise<true> {
    return this.call<true>('deleteWebhook', { drop_pending_updates: dropPendingUpdates });
  }

  getChat(chatId: number | string): Promise<{ id: number; username?: string; first_name?: string }> {
    return this.call<{ id: number; username?: string; first_name?: string }>('getChat', {
      chat_id: chatId,
    });
  }

  getManagedBotToken(userId: number): Promise<string> {
    return this.call<string>('getManagedBotToken', { user_id: userId });
  }

  replaceManagedBotToken(userId: number): Promise<string> {
    return this.call<string>('replaceManagedBotToken', { user_id: userId });
  }
}
