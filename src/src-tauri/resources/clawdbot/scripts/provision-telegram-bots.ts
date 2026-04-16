/**
 * Provisions one Telegram managed bot per active Knapsack agent using
 * Telegram Bot API 9.6 getManagedBotToken. Idempotent: already-provisioned
 * agents are skipped unless --rotate is passed.
 *
 * Prerequisites:
 *   - Manager bot registered in BotFather with can_manage_bots: true
 *   - TELEGRAM_MANAGER_TOKEN set in environment or OpenClaw secrets
 *
 * Usage:
 *   npx ts-node scripts/provision-telegram-bots.ts
 *   npx ts-node scripts/provision-telegram-bots.ts --rotate --agent scout
 */

import { getActiveAgents, toBotUsername, toSecretKey, type KnapsackAgent } from './get-agent-roster.js';
import { syncOpenClawChannelConfig } from './sync-openclaw-channel-config.js';

const MANAGER_TOKEN = process.env.TELEGRAM_MANAGER_TOKEN ?? '';
const TG_API = 'https://api.telegram.org';

interface TgResponse<T = unknown> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
  parameters?: { retry_after?: number };
}

async function tgCall<T>(token: string, method: string, body?: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${TG_API}/bot${token}/${method}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = (await res.json()) as TgResponse<T>;
  if (!json.ok) {
    throw new Error(`Telegram ${method} failed: ${json.description} (code ${json.error_code})`);
  }
  return json.result!;
}

async function resolveUsername(username: string): Promise<{ id: number; username?: string }> {
  return tgCall<{ id: number; username?: string }>(MANAGER_TOKEN, 'getChat', {
    chat_id: `@${username}`,
  });
}

async function getManagedToken(userId: number): Promise<string> {
  return tgCall<string>(MANAGER_TOKEN, 'getManagedBotToken', { user_id: userId });
}

async function replaceManagedToken(userId: number): Promise<string> {
  return tgCall<string>(MANAGER_TOKEN, 'replaceManagedBotToken', { user_id: userId });
}

interface ProvisionResult {
  agentId: string;
  token: string;
  username: string;
  botId: number;
  status: 'provisioned' | 'skipped' | 'rotated' | 'error';
  error?: string;
}

async function provisionAgent(
  agent: KnapsackAgent,
  opts: { rotate: boolean },
): Promise<ProvisionResult> {
  const suggestedUsername = toBotUsername(agent.id);

  if (agent.telegramUsername && !opts.rotate) {
    console.log(`  ⏭  ${agent.displayName} → @${agent.telegramUsername} (already provisioned, skipping)`);
    return {
      agentId: agent.id,
      token: process.env[toSecretKey(agent.id)] ?? '',
      username: agent.telegramUsername,
      botId: agent.telegramBotId ?? 0,
      status: 'skipped',
    };
  }

  try {
    // Resolve the suggested bot username to a user_id.
    // The bot must already exist (created via the deeplink or BotFather) before
    // getManagedBotToken can be called.
    const chat = await resolveUsername(suggestedUsername);
    const token = opts.rotate
      ? await replaceManagedToken(chat.id)
      : await getManagedToken(chat.id);

    // Validate the token is live
    const me = await tgCall<{ id: number; username?: string; first_name: string }>(
      token,
      'getMe',
    );

    const result: ProvisionResult = {
      agentId: agent.id,
      token,
      username: me.username ?? suggestedUsername,
      botId: me.id,
      status: opts.rotate ? 'rotated' : 'provisioned',
    };

    const icon = opts.rotate ? '🔄' : '✓';
    console.log(`  ${icon} ${agent.displayName} → @${result.username} (id: ${result.botId})`);
    return result;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ✗ ${agent.displayName}: ${msg}`);
    return { agentId: agent.id, token: '', username: '', botId: 0, status: 'error', error: msg };
  }
}

async function main() {
  if (!MANAGER_TOKEN) {
    console.error('ERROR: TELEGRAM_MANAGER_TOKEN is not set.');
    console.error('Set it to the token of a manager bot with can_manage_bots: true.');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const rotate = args.includes('--rotate');
  const agentFilter = args.includes('--agent') ? args[args.indexOf('--agent') + 1] : null;

  // Verify the manager bot
  const managerMe = await tgCall<{ username?: string; can_manage_bots?: boolean }>(
    MANAGER_TOKEN,
    'getMe',
  );
  if (!managerMe.can_manage_bots) {
    console.warn(
      `WARNING: Manager bot @${managerMe.username} does not have can_manage_bots: true.\n` +
        'Enable it in BotFather with /setmanager.',
    );
  }
  console.log(`Manager bot: @${managerMe.username}`);

  let agents = await getActiveAgents();
  if (agentFilter) {
    agents = agents.filter(a => a.id === agentFilter);
    if (!agents.length) {
      console.error(`No active agent with id "${agentFilter}" found.`);
      process.exit(1);
    }
  }

  console.log(`\nProvisioning bots for ${agents.length} active agent(s)...\n`);
  const results: ProvisionResult[] = [];
  for (const agent of agents) {
    results.push(await provisionAgent(agent, { rotate }));
  }

  // Rebuild the OpenClaw channel config from the updated roster
  await syncOpenClawChannelConfig(
    agents.map(a => {
      const r = results.find(r => r.agentId === a.id);
      return {
        ...a,
        telegramUsername: r?.username || a.telegramUsername,
        telegramBotId: r?.botId || a.telegramBotId,
      };
    }),
    results.filter(r => r.status !== 'skipped' && r.token),
  );

  const errors = results.filter(r => r.status === 'error');
  if (errors.length) {
    console.error(`\n${errors.length} agent(s) failed provisioning.`);
    process.exit(1);
  }
  console.log('\nDone. Restart the OpenClaw gateway to apply token changes.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
