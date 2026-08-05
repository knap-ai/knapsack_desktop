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
