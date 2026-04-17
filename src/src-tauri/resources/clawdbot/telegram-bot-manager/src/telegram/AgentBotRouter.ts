import { TelegramClient } from './TelegramClient.js';
import { getBot, updateLastUpdateId } from './db/botStore.js';
import type { TelegramUpdate } from './types.js';

export type UpdateHandler = (
  agentId: string,
  update: TelegramUpdate,
  client: TelegramClient,
) => Promise<void>;

const pollingLoops = new Map<string, AbortController>();
let globalHandler: UpdateHandler | null = null;

export function setUpdateHandler(handler: UpdateHandler): void {
  globalHandler = handler;
}

export async function startPolling(agentId: string): Promise<void> {
  if (pollingLoops.has(agentId)) return;

  const reg = getBot(agentId);
  if (!reg) throw new Error(`No bot registered for agent ${agentId}`);

  const ac = new AbortController();
  pollingLoops.set(agentId, ac);

  const client = new TelegramClient(reg.token);
  let offset = reg.lastUpdateId > 0 ? reg.lastUpdateId + 1 : 0;

  const loop = async () => {
    while (!ac.signal.aborted) {
      try {
        const updates = await client.getUpdates(offset);
        for (const update of updates) {
          offset = update.update_id + 1;
          updateLastUpdateId(agentId, update.update_id);
          if (globalHandler) {
            await globalHandler(agentId, update, client).catch(err => {
              console.error(`[telegrambot] handler error for agent ${agentId}:`, err);
            });
          }
        }
      } catch (err: unknown) {
        if (!ac.signal.aborted) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[telegrambot] polling error for agent ${agentId}:`, msg);
          await new Promise(r => setTimeout(r, 5_000));
        }
      }
    }
  };

  loop().catch(() => {});
}

export function stopPolling(agentId: string): void {
  const ac = pollingLoops.get(agentId);
  if (ac) {
    ac.abort();
    pollingLoops.delete(agentId);
  }
}

export function isPolling(agentId: string): boolean {
  return pollingLoops.has(agentId);
}
