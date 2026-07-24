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
