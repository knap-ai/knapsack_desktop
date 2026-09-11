import Foundation

enum MeetingStatus: String, Codable, CaseIterable {
  case created = "CREATED"
  case recording = "RECORDING"
  case saved = "SAVED"
  case syncingToPhone = "SYNCING_TO_PHONE"
  case uploading = "UPLOADING"
  case uploaded = "UPLOADED"
  case generatingNotes = "GENERATING_NOTES"
  case ready = "READY"
  case failed = "FAILED"
}

struct MobileThread: Codable, Identifiable {
  var id: UInt64?
  var timestamp: Int64?
  var hideFollowUp: Bool?
  var feedItemId: UInt64?
  var title: String?
  var subtitle: String?
  var threadType: String
  var recorded: Bool?
  var savedTranscript: String?
  var promptTemplate: String?
}

struct MobileMeetingMetadata: Codable {
  var threadId: UInt64
  var status: MeetingStatus
  var sourceDevice: String?
  var latestAudioFile: String?
  var notesPreview: String?
  var startedAt: Int64?
  var endedAt: Int64?
  var updatedAt: Int64
}

struct MobileMeetingDetail: Codable, Identifiable {
  var thread: MobileThread
  var metadata: MobileMeetingMetadata
  var notes: String?

  var id: UInt64 { thread.id ?? metadata.threadId }

  var displayTitle: String {
    let title = thread.title?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
    if !title.isEmpty && title.localizedCaseInsensitiveCompare("Untitled meeting") != .orderedSame {
      return title
    }

    let subtitle = thread.subtitle?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
    return subtitle.isEmpty ? "Untitled meeting" : subtitle
  }

  var displayTimestamp: Int64 {
    let threadTimestamp = thread.timestamp ?? 0
    return threadTimestamp > 0 ? threadTimestamp : metadata.updatedAt
  }
}

struct MobileChatSummary: Codable, Identifiable {
  var thread: MobileThread
  var preview: String?
  var updatedAt: Int64
  var messageCount: Int

  var id: UInt64 { thread.id ?? 0 }
}

struct MobileChatMessage: Codable, Identifiable {
  var id: UInt64?
  var timestamp: Int64
  var role: String
  var content: String

  var stableID: UInt64 {
    id ?? UInt64(max(timestamp, 0))
  }
}

struct MobileChatDetail: Codable, Identifiable {
  var thread: MobileThread
  var messages: [MobileChatMessage]
  var updatedAt: Int64

  var id: UInt64 { thread.id ?? 0 }
}

struct CreateMobileChatRequest: Codable {
  var title: String?
}

struct SendMobileChatMessageRequest: Codable {
  var text: String
}

struct MobileManagedAgent: Codable, Identifiable {
  var id: String
  var name: String
  var emoji: String
  var personality: String
  var soul: String
  var browserProfile: String
  var suggestedPrompts: [String]

  var agentId: String { id }
  var displayName: String { name }
}

struct MobileTeamRoster: Codable {
  var agents: [MobileManagedAgent]

  static let starter = MobileTeamRoster(agents: [
    MobileManagedAgent(
      id: "scout",
      name: "Scout",
      emoji: "\u{1F4CB}",
      personality: "Your executive assistant",
      soul: "You are Scout, an organized, proactive, and detail-oriented executive assistant.",
      browserProfile: "agent-scout",
      suggestedPrompts: [
        "Brief me on today's meetings, commitments, and top priorities.",
        "Find the follow-ups most at risk of falling through the cracks.",
      ]
    ),
    MobileManagedAgent(
      id: "polly",
      name: "Polly",
      emoji: "\u{1F4EC}",
      personality: "Your inbox and social media monitor",
      soul: "You are Polly, a warm and concise inbox and social media monitor.",
      browserProfile: "agent-polly",
      suggestedPrompts: ["Triage my inbox and show me what deserves a response first."]
    ),
    MobileManagedAgent(
      id: "atlas",
      name: "Atlas",
      emoji: "\u{1F91D}",
      personality: "Your relationship optimizer",
      soul: "You are Atlas, a strategic relationship and opportunity advisor.",
      browserProfile: "agent-atlas",
      suggestedPrompts: ["Who should I follow up with now, and what should I say?"]
    ),
    MobileManagedAgent(
      id: "coach",
      name: "Coach",
      emoji: "\u{1F3AF}",
      personality: "Your daily work coach",
      soul: "You are Coach, a direct, analytical, and encouraging daily work coach.",
      browserProfile: "agent-coach",
      suggestedPrompts: ["Give me a realistic plan for today based on my recent work."]
    ),
  ])
}

struct MobileTeamMessageResponse: Codable {
  var reply: String
}

struct MobileTeamMessages: Codable {
  var messages: [MobileChatMessage]
}

struct MobileManagedAgentSession: Codable, Identifiable {
  var sessionId: String
  var agentId: String
  var userId: String
  var taskSummary: String
  var status: String
  var messageCount: Int
  var lastInboundMessage: String?
  var lastReplySummary: String?
  var updatedAt: String

  var id: String { sessionId }
}

struct MobileManagedAgentsIndex: Codable {
  var success: Bool
  var agents: [MobileManagedAgent]
  var executionSessions: [MobileManagedAgentSession]
}

struct MobileManagedAgentRunResponse: Codable {
  var success: Bool
  var session: MobileManagedAgentSession
  var reply: String?
  var message: String
}

struct MobileManagedAgentRunRequest: Codable {
  var agentId: String
  var userId: String
  var channel: String
  var message: String
  var taskSummary: String?
  var contextKey: String?
  var requiredCapabilities: [String]
  var desktopSessionRequirement: String?
  var gatewayAgentId: String?
}

struct MobileLinkedProfile: Codable {
  var email: String
  var name: String?
  var uuid: String?
  var provider: String?
  var profileImage: String?
  var sharingPermission: Int64?
}

struct MobileLinkedSession: Codable {
  var linked: Bool
  var profile: MobileLinkedProfile?
  var connectionScopes: [String]
  var calendarConnected: Bool
  var emailConnected: Bool
  var driveConnected: Bool
  var desktopLabel: String
}

struct MobileCalendarEventSummary: Codable, Identifiable {
  var id: UInt64
  var eventId: String
  var title: String?
  var description: String?
  var location: String?
  var start: Int64?
  var end: Int64?
  var googleMeetURL: String?
  var calendarAccountEmail: String
  var meetingThreadId: UInt64?
  var notesPreview: String?
  var prepChatThreadId: UInt64?
  var prepPreview: String?

  var displayTitle: String {
    let value = title?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
    return value.isEmpty ? "Untitled meeting" : value
  }

  var prepConversationTitle: String {
    guard let start else { return "Prep: \(displayTitle)" }
    let date = Date(timeIntervalSince1970: TimeInterval(start))
      .formatted(date: .abbreviated, time: .shortened)
    return "Prep: \(displayTitle) - \(date)"
  }

  var prepPrompt: String {
    var context = ["Prepare me for \(displayTitle)"]
    if let start {
      let date = Date(timeIntervalSince1970: TimeInterval(start))
        .formatted(date: .complete, time: .shortened)
      context.append("scheduled for \(date)")
    }
    if let location = location?.trimmingCharacters(in: .whitespacesAndNewlines), !location.isEmpty {
      context.append("at \(location)")
    }
    if let description = description?.trimmingCharacters(in: .whitespacesAndNewlines), !description.isEmpty {
      context.append("Calendar context: \(description)")
    }
    context.append("Use the calendar event, prior meetings, saved notes, and relevant chats. Lead with context, goals, open questions, and the three things I should know before joining.")
    return context.joined(separator: ". ")
  }
}

struct MobileBrainEntry: Codable, Identifiable, Hashable {
  var name: String
  var title: String?
  var relPath: String
  var isDir: Bool

  var id: String { relPath }
}

struct MobileBrainPage: Codable, Identifiable {
  var relPath: String
  var title: String
  var content: String

  var id: String { relPath }
}

struct MobileAutopilotBrief: Codable {
  var headline: String
  var summary: String
  var generatedAt: Int64
  var sections: [MobileAutopilotSection]
}

struct MobileAutopilotSection: Codable, Identifiable {
  var id: String
  var title: String
  var subtitle: String?
  var cards: [MobileAutopilotCard]
}

struct MobileAutopilotCard: Codable, Identifiable {
  var id: String
  var kind: String
  var title: String
  var subtitle: String
  var preview: String?
  var rationale: String?
  var badge: String?
  var timestamp: Int64?
  var emailUID: String?
  var relatedThreadID: UInt64?
  var relatedChatThreadID: UInt64?
  var suggestedPrompts: [String]
}

struct MobileAutopilotEmailMessage: Codable, Identifiable {
  var emailUID: String
  var sender: String
  var recipients: [String]
  var cc: [String]
  var subject: String
  var body: String
  var summary: String
  var date: UInt64
  var isRead: Bool?
  var isArchived: Bool?
  var isDeleted: Bool?

  var id: String { emailUID }
}

struct MobileAutopilotEmailDetail: Codable, Identifiable {
  var emailUID: String
  var accountEmail: String
  var provider: String
  var category: String
  var subject: String
  var sender: String
  var preview: String?
  var badge: String?
  var suggestedPrompts: [String]
  var messages: [MobileAutopilotEmailMessage]

  var id: String { emailUID }

  var latestMessage: MobileAutopilotEmailMessage? {
    messages.first
  }
}

enum MobileAutopilotEmailAction: String, Codable, CaseIterable {
  case markRead = "mark_read"
  case archive = "archive"
  case delete = "delete"
  case reply = "reply"
}

struct APIEnvelope<T: Codable>: Codable {
  let success: Bool
  let data: T?
  let error: String?
}

struct CreateMeetingRequest: Codable {
  let title: String?
  let subtitle: String?
  let sourceDevice: String?
}

struct SaveNotesRequest: Codable {
  let notes: String
}

struct UpdateStatusRequest: Codable {
  let status: MeetingStatus
  let sourceDevice: String?
  let startedAt: Int64?
  let endedAt: Int64?
}

struct MobileAutopilotEmailActionRequest: Codable {
  let action: MobileAutopilotEmailAction
  let replyBody: String?
}

enum MobileAPIError: Error, LocalizedError {
  case invalidResponse
  case server(String)
  case uploadFailed

  var errorDescription: String? {
    switch self {
    case .invalidResponse:
      return "The server response could not be parsed."
    case .server(let message):
      return message
    case .uploadFailed:
      return "The upload did not complete."
    }
  }
}
