import { TelegramClient, TelegramError } from './TelegramClient.js';
import { saveBot, getBot, listBots, removeBot } from './db/botStore.js';
import { startPolling, stopPolling } from './AgentBotRouter.js';
import type { BotRegistration } from './types.js';

export class TelegramBotManager {
  /** Validate a bot token, store the registration, and start long-polling. */
  async registerBot(agentId: string, token: string): Promise<BotRegistration> {
    const client = new TelegramClient(token);
    const me = await client.getMe();
    if (!me.is_bot) throw new TelegramError('Token does not belong to a bot', 400);

    const existing = getBot(agentId);
    if (existing?.pollingActive) stopPolling(agentId);

    const reg: BotRegistration = {
      agentId,
      token,
      botId: me.id,
      username: me.username ?? '',
      displayName: me.first_name,
      createdAt: Date.now(),
      pollingActive: false,
      lastUpdateId: 0,
    };
    saveBot(reg);
    await startPolling(agentId);
    reg.pollingActive = true;
    return reg;
  }

  async getStatus(
    agentId: string,
  ): Promise<{ configured: boolean; username?: string; displayName?: string; botId?: number }> {
    const reg = getBot(agentId);
    if (!reg) return { configured: false };
    return { configured: true, username: reg.username, displayName: reg.displayName, botId: reg.botId };
  }

  async sendMessage(
    agentId: string,
    chatId: number | string,
    text: string,
    options?: Record<string, unknown>,
  ): Promise<void> {
    const reg = getBot(agentId);
    if (!reg) throw new Error(`No bot registered for agent ${agentId}`);
    const client = new TelegramClient(reg.token);
    await client.sendMessage({ chat_id: chatId, text, ...(options ?? {}) } as Parameters<typeof client.sendMessage>[0]);
  }

  /**
   * Retrieve a managed bot's token using the manager bot's authority (Bot API 9.6).
   * Resolves @username → user_id via getChat, then calls getManagedBotToken.
   */
  async getManagedBotToken(
    managerToken: string,
    botUsername: string,
  ): Promise<{ token: string; botId: number; username: string }> {
    const manager = new TelegramClient(managerToken);
    const chat = await manager.getChat(`@${botUsername}`);
    const token = await manager.getManagedBotToken(chat.id);
    return { token, botId: chat.id, username: chat.username ?? botUsername };
  }

  /** Rotate a managed bot's token. Returns the new token. */
  async replaceManagedBotToken(managerToken: string, botUserId: number): Promise<string> {
    const manager = new TelegramClient(managerToken);
    return manager.replaceManagedBotToken(botUserId);
  }

  unregisterBot(agentId: string): boolean {
    stopPolling(agentId);
    return removeBot(agentId);
  }

  listBots(): BotRegistration[] {
    return listBots();
  }
}
