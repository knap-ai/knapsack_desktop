export function googleSignInHandoff(url: string): string | null {
  try {
    const page = new URL(url)
    if (page.protocol !== 'https:' || page.hostname !== 'accounts.google.com'
      || !/\/signin(?:\/|$)|\/ServiceLogin(?:\/|$)/i.test(page.pathname)) return null
    const destination = new URL(page.searchParams.get('continue') || 'https://www.google.com/')
    // Do not propagate a rejected/embedded OAuth request to another browser.
    return destination.protocol === 'https:'
      && (destination.hostname === 'google.com' || destination.hostname.endsWith('.google.com'))
      && destination.hostname !== 'accounts.google.com'
      ? destination.href : 'https://www.google.com/'
  } catch {
    return null
  }
}
