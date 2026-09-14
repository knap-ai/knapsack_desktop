/** Only offer Developer Mode for an explicit software-building request.
 * Ordinary tasks often contain words like "write", "page", "project", or
 * "build consensus"; none of those authorize a coding-mode suggestion.
 */
const SOFTWARE_ARTIFACT =
  /\b(?:app|application|software|website|web\s+app|mobile\s+app|codebase|source\s+code|api|endpoint|plugin|ui\s+component|react\s+component|frontend|backend)\b/i
const BUILD_ACTION = /\b(?:build|implement|develop|code|program|deploy|ship|create|add)\b/i
const EXPLICIT_FEATURE = /\b(?:build|implement|develop|code|ship|deploy|add)\b.{0,100}\b(?:software\s+feature|feature\s+in\s+(?:the\s+)?(?:app|codebase)|api\s+integration)\b/i
const EXPLICIT_CODE_FIX = /\b(?:fix|debug|refactor)\b.{0,100}\b(?:codebase|source\s+code|api\s+endpoint|ui\s+component|react\s+component)\b/i

export function detectBuildIntent(message: string): boolean {
  const text = message.trim()
  if (!text || text.length > 600) return false
  return EXPLICIT_FEATURE.test(text) || EXPLICIT_CODE_FIX.test(text) ||
    (BUILD_ACTION.test(text) && SOFTWARE_ARTIFACT.test(text))
}

export function extractProjectDescription(message: string): string {
  // Return the message itself as the project description - the user's words
  // are the best description of what they want to build
  return message.trim()
}
