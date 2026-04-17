/**
 * Reads the live Knapsack agent roster from openclaw.json or the Knapsack
 * SQLite database. Never returns a hardcoded list — always reflects the current
 * user configuration, including user-added or renamed agents.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));

export interface KnapsackAgent {
  id: string;
  displayName: string;
  active: boolean;
  telegramUsername?: string;
  telegramBotId?: number;
}

interface OpenClawAgentEntry {
  id: string;
  name?: string;
  displayName?: string;
  active?: boolean;
  disabled?: boolean;
  telegram?: {
    username?: string;
    botId?: number;
  };
}

interface OpenClawConfig {
  agents?: {
    list?: OpenClawAgentEntry[];
  };
}

function loadOpenClawConfig(): OpenClawConfig {
  const candidates = [
    resolve(__dir, '../openclaw.json'),
    resolve(__dir, '../../openclaw.json'),
    resolve(process.env.KNAPSACK_WORKSPACE ?? process.cwd(), 'openclaw.json'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) {
      return JSON.parse(readFileSync(p, 'utf-8')) as OpenClawConfig;
    }
  }
  return {};
}

export async function getActiveAgents(): Promise<KnapsackAgent[]> {
  const config = loadOpenClawConfig();
  const list: OpenClawAgentEntry[] = config.agents?.list ?? [];

  return list
    .filter(a => a.active !== false && !a.disabled)
    .map(a => ({
      id: a.id,
      displayName: a.displayName ?? a.name ?? a.id,
      active: true,
      telegramUsername: a.telegram?.username,
      telegramBotId: a.telegram?.botId,
    }));
}

export function toBotUsername(agentId: string): string {
  const slug = agentId.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const name = `knapsack_${slug}_bot`;
  return name.slice(0, 32);
}

export function toSecretKey(agentId: string): string {
  return `TELEGRAM_TOKEN_${agentId.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
}
