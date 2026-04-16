// In-memory store for bot registrations and poll state.
// Tokens are never logged; production deployments should persist to encrypted SQLite.

import type { BotRegistration } from '../types.js';

const store = new Map<string, BotRegistration>();

export function saveBot(reg: BotRegistration): void {
  store.set(reg.agentId, reg);
}

export function getBot(agentId: string): BotRegistration | undefined {
  return store.get(agentId);
}

export function listBots(): BotRegistration[] {
  return Array.from(store.values());
}

export function removeBot(agentId: string): boolean {
  return store.delete(agentId);
}

export function updateLastUpdateId(agentId: string, updateId: number): void {
  const reg = store.get(agentId);
  if (reg) reg.lastUpdateId = updateId;
}

export function setPollingActive(agentId: string, active: boolean): void {
  const reg = store.get(agentId);
  if (reg) reg.pollingActive = active;
}
