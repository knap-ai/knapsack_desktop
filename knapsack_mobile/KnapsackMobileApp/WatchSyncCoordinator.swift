import Foundation
import WatchConnectivity

@MainActor
final class WatchSyncCoordinator: NSObject, ObservableObject {
  static let shared = WatchSyncCoordinator()

  private enum ChatNotificationKeys {
    static let kind = "kind"
    static let chatReply = "chatReply"
    static let title = "title"
    static let body = "body"
    static let threadID = "threadID"
    static let timestamp = "timestamp"
  }

  @Published var lastSyncMessage: String?

  private override init() {
    super.init()
  }

  func activate() {
    guard WCSession.isSupported() else { return }
    let session = WCSession.default
    session.delegate = self
    session.activate()
  }

  func importPendingSharedRecordings(showWhenEmpty: Bool = false) async {
    do {
      let pending = try WatchSharedBridge.pendingRecordings()
      guard !pending.isEmpty else {
        if showWhenEmpty {
          lastSyncMessage = "No pending watch clips."
        }
        return
      }

      var importedCount = 0
      for entry in pending {
        let fileURL = try WatchSharedBridge.recordingFileURL(for: entry)
        try await importRecording(
          fileURL: fileURL,
          sourceDevice: entry.sourceDevice,
          startedAt: entry.startedAt,
          endedAt: entry.endedAt
        )
        try WatchSharedBridge.remove(entry)
        importedCount += 1
      }

      lastSyncMessage = importedCount == 1
        ? "Imported 1 watch clip."
        : "Imported \(importedCount) watch clips."
    } catch {
      lastSyncMessage = error.localizedDescription
    }
  }

  private func importRecording(
    fileURL: URL,
    sourceDevice: String,
    startedAt: Int64?,
    endedAt: Int64?
  ) async throws {
    let meeting = try await MobileAPI.shared.createMeeting(
      title: "Watch note",
      subtitle: "Imported from Apple Watch",
      sourceDevice: sourceDevice
    )
    _ = try await MobileAPI.shared.updateStatus(
      threadID: meeting.id,
      status: .syncingToPhone,
      sourceDevice: sourceDevice,
      startedAt: startedAt,
      endedAt: endedAt
    )
    _ = try await MobileAPI.shared.uploadRecording(
      threadID: meeting.id,
      fileURL: fileURL,
      sourceDevice: sourceDevice,
      startedAt: startedAt,
      endedAt: endedAt
    )
  }

  func sendChatNotification(threadID: UInt64, title: String, body: String) {
    guard WCSession.isSupported() else { return }

    let trimmedBody = body.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmedBody.isEmpty else { return }

    let payload: [String: Any] = [
      ChatNotificationKeys.kind: ChatNotificationKeys.chatReply,
      ChatNotificationKeys.title: title,
      ChatNotificationKeys.body: String(trimmedBody.prefix(240)),
      ChatNotificationKeys.threadID: threadID,
      ChatNotificationKeys.timestamp: Int64(Date().timeIntervalSince1970),
    ]

    let session = WCSession.default
    guard session.activationState == .activated else {
      lastSyncMessage = "Watch is not connected for chat alerts yet."
      return
    }

    do {
      try session.updateApplicationContext(payload)
    } catch {
      lastSyncMessage = "Could not update watch context."
    }

    session.transferUserInfo(payload)

    if session.isReachable {
      session.sendMessage(payload, replyHandler: nil) { [weak self] _ in
        Task { @MainActor in
          self?.lastSyncMessage = "Watch chat alert may be delayed."
        }
      }
    }

    lastSyncMessage = "Sent chat alert to Apple Watch."
  }
}

extension WatchSyncCoordinator: WCSessionDelegate {
  nonisolated func session(
    _ session: WCSession,
    didReceive file: WCSessionFile
  ) {
    let metadata = file.metadata ?? [:]
    let bridgeID = metadata["bridgeID"] as? String
    let sourceDevice = metadata["sourceDevice"] as? String ?? "watch"
    let startedAt = metadata["startedAt"] as? Int64
    let endedAt = metadata["endedAt"] as? Int64

    Task { @MainActor in
      do {
        try await importRecording(
          fileURL: file.fileURL,
          sourceDevice: sourceDevice,
          startedAt: startedAt,
          endedAt: endedAt
        )
        if let bridgeID {
          try? WatchSharedBridge.remove(id: bridgeID)
        }
        lastSyncMessage = "Synced watch recording from WatchConnectivity."
      } catch {
        lastSyncMessage = error.localizedDescription
      }
    }
  }

  nonisolated func session(
    _ session: WCSession,
    activationDidCompleteWith activationState: WCSessionActivationState,
    error: Error?
  ) {}

  nonisolated func sessionDidBecomeInactive(_ session: WCSession) {}

  nonisolated func sessionDidDeactivate(_ session: WCSession) {
    session.activate()
  }
}
