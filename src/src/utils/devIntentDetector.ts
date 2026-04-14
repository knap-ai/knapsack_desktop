/** Detects if a user message indicates they want to build/develop something. */

const BUILD_PATTERNS = [
  /\b(build|create|implement|develop|code|ship|deploy|launch)\b.*\b(app|feature|page|component|api|endpoint|service|product|tool|dashboard|panel|widget|module|plugin|integration)\b/i,
  /\b(add|make|set up|write)\b.*\b(feature|functionality|component|page|endpoint|integration|module)\b/i,
  /\b(i('m| am) (building|developing|working on|creating|implementing))\b/i,
  /\b(need to|want to|let's|help me)\b.*\b(build|create|implement|develop|code|ship)\b/i,
  /\b(new project|new feature|new app|start building)\b/i,
  /\b(frontend|backend|full.?stack|react|typescript|rust|api|database)\b.*\b(for|to|that)\b/i,
]

export function detectBuildIntent(message: string): boolean {
  return BUILD_PATTERNS.some(p => p.test(message))
}

export function extractProjectDescription(message: string): string {
  // Return the message itself as the project description - the user's words
  // are the best description of what they want to build
  return message.trim()
}
