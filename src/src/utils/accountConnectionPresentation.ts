export function googleAccountConnectPresentation(
  accountCount: number,
  busy: boolean,
  hasPrimaryEmail: boolean,
  hasError: boolean,
) {
  const connected = accountCount > 0
  return {
    buttonLabel: busy ? 'Opening…' : connected ? 'Connect another' : 'Connect Google',
    ariaLabel: connected ? 'Connect another Google account' : 'Connect Google account',
    disabled: busy || !hasPrimaryEmail,
    messageRole: hasError ? 'alert' : 'status',
    messageClassName: `text-xs ${hasError ? 'text-red-600' : 'text-gray-500'}`,
  } as const
}
