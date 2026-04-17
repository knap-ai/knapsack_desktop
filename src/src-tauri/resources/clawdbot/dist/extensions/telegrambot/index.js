// telegram-bot-manager/src/extension.ts
import { definePluginEntry } from "../../plugin-entry-DA7dUJNL.js";

// telegram-bot-manager/src/telegram/TelegramClient.ts
var BASE = "https://api.telegram.org";
var POLL_TIMEOUT_SEC = 25;
var MAX_BACKOFF_MS = 64e3;
var TelegramError = class extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "TelegramError";
  }
};
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
var TelegramClient = class {
  token;
  constructor(token) {
    this.token = token;
  }
  url(method) {
    return `${BASE}/bot${this.token}/${method}`;
  }
  async call(method, params) {
    let backoff = 1e3;
    while (true) {
      try {
        const res = await fetch(this.url(method), {
          method: params !== void 0 ? "POST" : "GET",
          headers: params !== void 0 ? { "Content-Type": "application/json" } : void 0,
          body: params !== void 0 ? JSON.stringify(params) : void 0
        });
        const json = await res.json();
        if (!json.ok) {
          if (res.status === 429 && json.parameters?.retry_after) {
            await sleep(json.parameters.retry_after * 1e3);
            continue;
          }
          throw new TelegramError(
            json.description ?? `HTTP ${res.status}`,
            json.error_code ?? res.status
          );
        }
        return json.result;
      } catch (err) {
        if (err instanceof TelegramError) throw err;
        await sleep(backoff);
        backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
      }
    }
  }
  getMe() {
    return this.call("getMe");
  }
  getUpdates(offset, limit = 100) {
    return this.call("getUpdates", {
      offset,
      limit,
      timeout: POLL_TIMEOUT_SEC,
      allowed_updates: [
        "message",
        "edited_message",
        "callback_query",
        "inline_query",
        "my_chat_member",
        "managed_bot"
      ]
    });
  }
  sendMessage(params) {
    return this.call("sendMessage", params);
  }
  sendPhoto(chatId, photo, caption) {
    return this.call("sendPhoto", { chat_id: chatId, photo, caption });
  }
  sendDocument(chatId, document, caption) {
    return this.call("sendDocument", { chat_id: chatId, document, caption });
  }
  editMessageText(chatId, messageId, text, parseMode) {
    return this.call("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: parseMode
    });
  }
  answerCallbackQuery(callbackQueryId, text) {
    return this.call("answerCallbackQuery", {
      callback_query_id: callbackQueryId,
      text
    });
  }
  setWebhook(url, options) {
    return this.call("setWebhook", {
      url,
      max_connections: options?.maxConnections ?? 40,
      allowed_updates: options?.allowedUpdates,
      secret_token: options?.secretToken,
      drop_pending_updates: options?.dropPendingUpdates
    });
  }
  deleteWebhook(dropPendingUpdates = false) {
    return this.call("deleteWebhook", { drop_pending_updates: dropPendingUpdates });
  }
  getChat(chatId) {
    return this.call("getChat", {
      chat_id: chatId
    });
  }
  getManagedBotToken(userId) {
    return this.call("getManagedBotToken", { user_id: userId });
  }
  replaceManagedBotToken(userId) {
    return this.call("replaceManagedBotToken", { user_id: userId });
  }
};

// telegram-bot-manager/src/telegram/keyboards.ts
function createInlineKeyboard(buttons) {
  return {
    inline_keyboard: buttons.map(
      (row) => row.map((btn) => {
        const b = { text: btn.text };
        if (btn.callbackData) b.callback_data = btn.callbackData;
        if (btn.url) b.url = btn.url;
        return b;
      })
    )
  };
}
function parseCallbackData(data) {
  const [action, ...args] = data.split(":");
  return { action, args };
}
function buildCallbackData(action, ...args) {
  const result = [action, ...args].join(":");
  if (result.length > 64) {
    throw new Error(`callback_data too long: ${result.length} bytes (max 64)`);
  }
  return result;
}

// telegram-bot-manager/src/extension.ts
function ok(respond, data) {
  respond({ ok: true, ...data });
}
function fail(respond, message) {
  respond({ ok: false, error: message });
}
var extension_default = definePluginEntry({
  id: "telegrambot",
  name: "Telegram Managed Bot Provisioner",
  description: "Bot API 9.6 Managed Bots helpers \u2014 deeplink generation and token retrieval. Message routing and polling are handled by the built-in telegram channel.",
  register(api) {
    api.registerGatewayMethod("telegram.managedbot.deeplink", ({ params, respond }) => {
      const { managerUsername, suggestedUsername, suggestedName } = params ?? {};
      if (!managerUsername || !suggestedUsername) {
        return fail(respond, "managerUsername and suggestedUsername are required");
      }
      let url = `https://t.me/newbot/${managerUsername}/${suggestedUsername}`;
      if (suggestedName) url += `?name=${encodeURIComponent(String(suggestedName))}`;
      ok(respond, { deeplink: url });
    });
    api.registerGatewayMethod("telegram.managedbot.getToken", async ({ params, respond }) => {
      const { managerToken, botUsername } = params ?? {};
      if (!managerToken || !botUsername) {
        return fail(respond, "managerToken and botUsername are required");
      }
      try {
        const manager = new TelegramClient(String(managerToken));
        const username = String(botUsername).replace(/^@/, "");
        const chat = await manager.getChat(`@${username}`);
        const token = await manager.getManagedBotToken(chat.id);
        ok(respond, {
          token,
          botId: chat.id,
          username: chat.username ?? username
        });
      } catch (err) {
        fail(respond, err instanceof Error ? err.message : String(err));
      }
    });
    api.registerGatewayMethod("telegram.managedbot.replaceToken", async ({ params, respond }) => {
      const { managerToken, botUserId } = params ?? {};
      if (!managerToken || !botUserId) {
        return fail(respond, "managerToken and botUserId are required");
      }
      try {
        const manager = new TelegramClient(String(managerToken));
        const token = await manager.replaceManagedBotToken(Number(botUserId));
        ok(respond, { token });
      } catch (err) {
        fail(respond, err instanceof Error ? err.message : String(err));
      }
    });
    api.registerGatewayMethod("telegram.keyboard.createInline", ({ params, respond }) => {
      const { buttons } = params ?? {};
      if (!Array.isArray(buttons)) return fail(respond, "buttons must be an array of arrays");
      ok(respond, createInlineKeyboard(buttons));
    });
    api.registerGatewayMethod("telegram.keyboard.buildCallbackData", ({ params, respond }) => {
      const { action, args = [] } = params ?? {};
      if (!action) return fail(respond, "action is required");
      try {
        ok(respond, { data: buildCallbackData(String(action), ...args) });
      } catch (err) {
        fail(respond, err instanceof Error ? err.message : String(err));
      }
    });
    api.registerGatewayMethod("telegram.keyboard.parseCallbackData", ({ params, respond }) => {
      const { data } = params ?? {};
      if (!data) return fail(respond, "data is required");
      ok(respond, parseCallbackData(String(data)));
    });
  }
});
export {
  extension_default as default
};
