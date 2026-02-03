import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'

dayjs.extend(advancedFormat)
export default class KNDateUtils {
  static isSameDay(date1: Date | number, date2: Date | number): boolean {
    const d1 = date1 instanceof Date ? date1 : new Date(date1)
    const d2 = date2 instanceof Date ? date2 : new Date(date2)

    return d1.getDate() === d2.getDate()
  }

  static sortByTimestamp<T extends { timestamp: Date | number }>(
    items: T[],
    ascending: boolean = true,
  ): T[] {
    return items.sort((a, b) => {
      const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : Number(a.timestamp)
      const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : Number(b.timestamp)
      return ascending ? aTime - bTime : bTime - aTime
    })
  }

  static sortByDate<T extends { date: Date | number }>(items: T[], ascending: boolean = true): T[] {
    return items.sort((a, b) => {
      const aTime = a.date instanceof Date ? a.date.getTime() : Number(a.date)
      const bTime = b.date instanceof Date ? b.date.getTime() : Number(b.date)
      return ascending ? aTime - bTime : bTime - aTime
    })
  }

  static timelineKeyFromTimestamp(timestamp: Date | number): string {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const inputDate = timestamp instanceof Date ? timestamp : new Date(timestamp)
    const inputDateWithoutTime = new Date(
      inputDate.getFullYear(),
      inputDate.getMonth(),
      inputDate.getDate(),
    )

    if (inputDateWithoutTime.getTime() === today.getTime()) {
      return 'Today, ' + dayjs(inputDate).format('MMM Do')
    } else if (inputDateWithoutTime.getTime() === yesterday.getTime()) {
      return 'Yesterday, ' + dayjs(inputDate).format('MMM Do')
    } else if (inputDateWithoutTime.getFullYear() === 1970) {
      return 'Tutorial'
    } else if (inputDateWithoutTime > today) {
      return 'COMING UP'
    }

    return dayjs(inputDate).format('ddd MMM Do')
  }

  static isFutureDay(timestamp: Date | number): boolean {
    const today = new Date()

    return dayjs(timestamp).isAfter(dayjs(today), 'day')
  }

  static isPastDay(timestamp: Date | number): boolean {
    const today = new Date()

    return dayjs(timestamp).isBefore(dayjs(today), 'day')
  }
  
  static nDaysAgo(n: number): Date {
    const day = dayjs().subtract(n, 'day').toDate()
    day.setHours(0, 0, 0, 0)
    return day
  }

  static formatDate(date: Date, format: string = 'MM/DD/YYYY'): string {
    let datejs = dayjs(date)

    return datejs.format(format);
  }

  static formatStandardDateTime(date: Date): string {
    let datejs = dayjs(date)

    return datejs.format('MMM DD, YYYY hh:mm a');
  }

  static formatCleanTime(date: Date | number): string {
    const d = date instanceof Date ? date : new Date(date);
    const hours = d.getHours();
    const minutes = d.getMinutes();

    const displayHours = hours % 12 || 12;
    const amPm = hours >= 12 ? 'PM' : 'AM';

    if (minutes === 0) {
      return `${displayHours}${amPm}`;
    }

    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes}${amPm}`;
  }

  static formatDayWithCleanTime(date: Date | number): string {
    const d = date instanceof Date ? date : new Date(date);
    const dayOfWeek = dayjs(d).format('ddd');
    const cleanTime = KNDateUtils.formatCleanTime(d);
    
    return `${dayOfWeek}, ${cleanTime}`;
  }

  /**
   * Formats a timestamp to display in a user-friendly format:
   * - "Today, 9:35am"
   * - "Yesterday, 10:28pm"
   * - "Nov 11, 12:22pm"
   * @param timestamp Unix timestamp in seconds
   * @returns Formatted date string
   */
  static formatFriendlyDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    
    // Format time (e.g., "9:35am")
    const timeString = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    
    // Check if the date is today
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return `Today, ${timeString}`;
    }
    
    // Check if the date was yesterday
    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return `Yesterday, ${timeString}`;
    }
    
    // Otherwise, format as "MMM DD, HH:MM am/pm" (e.g., "Nov 11, 12:22pm")
    const dateString = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    
    return `${dateString}, ${timeString}`;
  }
}