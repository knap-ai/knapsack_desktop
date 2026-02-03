export default class KNUtils {
  static getUserDisplayTime(timestamp: Date): string {
    const now = new Date()
    const oneDayInMs = 24 * 60 * 60 * 1000

    // Reset time to midnight for comparison
    const today = new Date(now.setHours(0, 0, 0, 0))
    const tomorrow = new Date(today.getTime() + oneDayInMs)
    const dayAfterTomorrow = new Date(tomorrow.getTime() + oneDayInMs)
    const yesterday = new Date(today.getTime() - oneDayInMs)

    const isToday = timestamp >= today && timestamp < tomorrow
    const isYesterday = timestamp >= yesterday && timestamp < today
    const isTomorrow = timestamp >= tomorrow && timestamp < dayAfterTomorrow

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }

    if (isToday) {
      return `Today, ${timestamp.toLocaleTimeString(undefined, timeOptions)}`
    } else if (isYesterday) {
      return `Yesterday, ${timestamp.toLocaleTimeString(undefined, timeOptions)}`
    } else if (isTomorrow) {
      return `Tomorrow, ${timestamp.toLocaleTimeString(undefined, timeOptions)}`
    } else {
      return timestamp.toLocaleString(undefined, {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      })
    }
  }

  static shortenText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text
    }

    return text.substring(0, maxLength) + '...'
  }

  static secondsToDate(secondsString: string): Date {
    const timestampInMilliseconds = parseInt(secondsString) * 1000
    return new Date(timestampInMilliseconds)
  }

  static bytesToMB(bytes: number): number {
    return bytes / 1024 / 1024
  }

  static makeRandomString(): string {
    return (Math.random() + 1).toString(36).substring(3)
  }

  static getRandomInt(min: number, max: number): number {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  static getDomainAsWord(url: string | undefined) {
    if (url === undefined) {
      return ''
    }
    const hostname = new URL(url).hostname
    const parts = hostname.split('.')
    return parts.length > 1 ? parts[parts.length - 2] : parts[0]
  }

  static getFaviconUrl(url: string | undefined) {
    if (url === undefined) {
      return '/assets/images/knap-logo-medium.png'
    }
    const parsedUrl = new URL(url)
    return parsedUrl.protocol + '//' + parsedUrl.hostname + '/favicon.ico'
  }
}
