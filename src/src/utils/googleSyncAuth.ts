// HTTP 400/401 also represent sync, proxy and Knapsack-session failures.
// Only an explicit Google refresh-token rejection warrants reconnecting Google.
export function googleReconnectRequired(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return /Invalid refresh token|invalid_grant/i.test(message)
}
