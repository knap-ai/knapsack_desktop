// OpenClaw plugin entry point for Managed Bot provisioning helpers.
//
// OpenClaw's built-in telegram channel owns all polling, webhook, and message
// routing. This extension only exposes the Bot API 9.6 Managed Bots methods
// that the provisioner needs (deeplink generation and getManagedBotToken).

// @ts-ignore — path resolved by the OpenClaw plugin loader at runtime
import { definePluginEntry } from '../../plugin-entry-DA7dUJNL.js';

import { TelegramClient } from './telegram/TelegramClient.js';
import { createInlineKeyboard, buildCallbackData, parseCallbackData } from './telegram/keyboards.js';

function ok(respond: (r: unknown) => void, data: Record<string, unknown>) {
  respond({ ok: true, ...data });
}

function fail(respond: (r: unknown) => void, message: string) {
  respond({ ok: false, error: message });
}

export default definePluginEntry({
  id: 'telegrambot',
  name: 'Telegram Managed Bot Provisioner',
  description:
    'Bot API 9.6 Managed Bots helpers — deeplink generation and token retrieval. ' +
    'Message routing and polling are handled by the built-in telegram channel.',

  register(api: {
    registerGatewayMethod: (
      name: string,
      handler: (ctx: {
        params: Record<string, unknown>;
        respond: (r: unknown) => void;
      }) => void | Promise<void>,
    ) => void;
  }) {
    // ── Managed Bot deeplink ─────────────────────────────────

    api.registerGatewayMethod('telegram.managedbot.deeplink', ({ params, respond }) => {
      const { managerUsername, suggestedUsername, suggestedName } = params ?? {};
      if (!managerUsername || !suggestedUsername) {
        return fail(respond, 'managerUsername and suggestedUsername are required');
      }
      let url = `https://t.me/newbot/${managerUsername}/${suggestedUsername}`;
      if (suggestedName) url += `?name=${encodeURIComponent(String(suggestedName))}`;
      ok(respond, { deeplink: url });
    });

    // ── Managed Bot token retrieval (Bot API 9.6) ────────────

    api.registerGatewayMethod('telegram.managedbot.getToken', async ({ params, respond }) => {
      const { managerToken, botUsername } = params ?? {};
      if (!managerToken || !botUsername) {
        return fail(respond, 'managerToken and botUsername are required');
      }
      try {
        const manager = new TelegramClient(String(managerToken));
        const username = String(botUsername).replace(/^@/, '');
        const chat = await manager.getChat(`@${username}`);
        const token = await manager.getManagedBotToken(chat.id);
        ok(respond, {
          token,
          botId: chat.id,
          username: chat.username ?? username,
        });
      } catch (err: unknown) {
        fail(respond, err instanceof Error ? err.message : String(err));
      }
    });

    // ── Token rotation ───────────────────────────────────────

    api.registerGatewayMethod('telegram.managedbot.replaceToken', async ({ params, respond }) => {
      const { managerToken, botUserId } = params ?? {};
      if (!managerToken || !botUserId) {
        return fail(respond, 'managerToken and botUserId are required');
      }
      try {
        const manager = new TelegramClient(String(managerToken));
        const token = await manager.replaceManagedBotToken(Number(botUserId));
        ok(respond, { token });
      } catch (err: unknown) {
        fail(respond, err instanceof Error ? err.message : String(err));
      }
    });

    // ── Keyboard utilities ───────────────────────────────────

    api.registerGatewayMethod('telegram.keyboard.createInline', ({ params, respond }) => {
      const { buttons } = params ?? {};
      if (!Array.isArray(buttons)) return fail(respond, 'buttons must be an array of arrays');
      ok(respond, createInlineKeyboard(buttons) as unknown as Record<string, unknown>);
    });

    api.registerGatewayMethod('telegram.keyboard.buildCallbackData', ({ params, respond }) => {
      const { action, args = [] } = params ?? {};
      if (!action) return fail(respond, 'action is required');
      try {
        ok(respond, { data: buildCallbackData(String(action), ...(args as string[])) });
      } catch (err: unknown) {
        fail(respond, err instanceof Error ? err.message : String(err));
      }
    });

    api.registerGatewayMethod('telegram.keyboard.parseCallbackData', ({ params, respond }) => {
      const { data } = params ?? {};
      if (!data) return fail(respond, 'data is required');
      ok(respond, parseCallbackData(String(data)) as unknown as Record<string, unknown>);
    });
  },
});
