/**
 * Regenerates the `channels.telegram` block in openclaw.json from the live
 * agent roster and provisioned bot tokens.
 *
 * Each agent gets one Telegram channel entry. Tokens are referenced via env
 * vars (TELEGRAM_TOKEN_<AGENT_ID>) rather than stored as plaintext.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type KnapsackAgent, toSecretKey } from './get-agent-roster.js';

const __dir = dirname(fileURLToPath(import.meta.url));

interface TokenEntry {
  agentId: string;
  token: string;
  username: string;
}

interface TelegramChannelEntry {
  id: string;
  agentId: string;
  token: string;
  description: string;
}

function findOpenClawConfig(): string {
  const candidates = [
    resolve(__dir, '../openclaw.json'),
    resolve(__dir, '../../openclaw.json'),
    resolve(process.env.KNAPSACK_WORKSPACE ?? process.cwd(), 'openclaw.json'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  throw new Error('openclaw.json not found. Set KNAPSACK_WORKSPACE or run from the workspace root.');
}

export async function syncOpenClawChannelConfig(
  agents: KnapsackAgent[],
  newTokens: TokenEntry[] = [],
): Promise<void> {
  const configPath = findOpenClawConfig();
  const config = JSON.parse(readFileSync(configPath, 'utf-8')) as Record<string, unknown>;

  // Build per-agent Telegram channel entries. Token references use env vars so
  // plaintext secrets never appear in openclaw.json.
  const telegramEntries: TelegramChannelEntry[] = agents
    .filter(a => a.telegramUsername || newTokens.some(t => t.agentId === a.id))
    .map(a => {
      const secretKey = toSecretKey(a.id);
      return {
        id: `${a.id}-bot`,
        agentId: a.id,
        token: `\${${secretKey}}`,
        description: `${a.displayName} — managed Telegram bot`,
      };
    });

  if (!config.channels || typeof config.channels !== 'object') {
    config.channels = {};
  }
  (config.channels as Record<string, unknown>).telegram = telegramEntries;

  // Write tokens to environment / secrets store.
  // In a real deployment this would call OpenClaw's secrets manager API;
  // here we write a .env fragment for operator reference (never committed).
  const envLines = newTokens.map(t => `${toSecretKey(t.agentId)}=${t.token}`);
  if (envLines.length) {
    const envPath = resolve(dirname(configPath), '.telegram-tokens.env');
    writeFileSync(envPath, envLines.join('\n') + '\n', { mode: 0o600 });
    console.log(
      `\nTokens written to ${envPath} (mode 600, .gitignore this file)\n` +
        'Load them before starting the gateway:\n' +
        `  export $(cat ${envPath} | xargs)`,
    );
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
  console.log(`\nUpdated ${configPath} with ${telegramEntries.length} Telegram channel entry(ies).`);
}
