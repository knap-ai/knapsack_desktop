import Foundation

struct CarPlayDriveAction: Equatable, Identifiable {
  enum Kind: Equatable {
    case scout
    case continueChat
    case nextMeetingPrep
    case captureIdea
  }

  var kind: Kind
  var title: String
  var detail: String
  var id: Kind { kind }
}
enum CarPlayDriveContent {
  static let primaryActions = [
    CarPlayDriveAction(
      kind: .scout,
      title: "Talk to Scout",
      detail: "Start or resume a hands-free conversation"
    ),
    CarPlayDriveAction(
      kind: .continueChat,
      title: "Continue a chat",
      detail: "Pick up a recent Knapsack conversation"
    ),
    CarPlayDriveAction(
      kind: .nextMeetingPrep,
      title: "Hear next meeting prep",
      detail: "Listen to the key action and summary"
    ),
    CarPlayDriveAction(
      kind: .captureIdea,
      title: "Capture an idea",
      detail: "Save an idea or action item hands-free"
    ),
  ]

  static func recentChats(from cachedChats: [MobileChatSummary], limit: Int = 6) -> [MobileChatSummary] {
    Array(cachedChats.sorted { $0.updatedAt > $1.updatedAt }.prefix(limit))
  }

  static func nextEvent(from events: [MobileCalendarEventSummary], now: Date = Date()) -> MobileCalendarEventSummary? {
    let timestamp = Int64(now.timeIntervalSince1970)
    return events
      .filter { ($0.start ?? Int64.min) >= timestamp }
      .sorted { ($0.start ?? Int64.max) < ($1.start ?? Int64.max) }
      .first
  }
}
