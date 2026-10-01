/** Bind notification consent to the offer even when chat history is stale. */
export function notificationAcceptance(message: string): string {
  return `Yes — please follow through on this specific notification:

${JSON.stringify(message)}

My confirmation applies only to the offer above, not to older requests or account monitoring. Use available tools to retrieve the relevant information and give me the result now. If you cannot access it, explain what is missing. Do not claim that monitoring, scheduling, or another action is active without a successful tool result.`
}
