import Foundation
import UserNotifications
import WatchConnectivity

@MainActor
final class WatchSyncManager: NSObject, ObservableObject {
  static let shared = WatchSyncManager()

  struct ChatNotification: Identifiable, Equatable {
    let id: String
    let title: String
    let body: String
    let threadID: UInt64?
    let timestamp: Date
  }

  private enum ChatNotificationKeys {
    static let kind = "kind"
    static let chatReply = "chatReply"
    static let title = "title"
    static let body = "body"
    static let threadID = "threadID"
    static let timestamp = "timestamp"
  }

  @Published var status = "Ready"
  @Published var latestChatNotification: ChatNotification?

  private override init() {
    super.init()
  }

  func activate() {
    guard WCSession.isSupported() else { return }
    let session = WCSession.default
    session.delegate = self
    session.activate()
    requestNotificationAuthorization()
    KnapsackComplicationStore.shared.setSyncStatus(status)
  }

  func transferRecording(fileURL: URL, startedAt: Date?, endedAt: Date?) {
    do {
      let pending = try WatchSharedBridge.enqueueRecording(
        from: fileURL,
        sourceDevice: "watch",
        startedAt: startedAt,
        endedAt: endedAt
      )
      if WCSession.default.activationState == .activated {
        WCSession.default.transferFile(
          fileURL,
          metadata: [
            "bridgeID": pending.id,
            "sourceDevice": "watch",
            "startedAt": pending.startedAt ?? Int64(Date().timeIntervalSince1970),
            "endedAt": pending.endedAt ?? Int64(Date().timeIntervalSince1970),
          ]
        )
        status = "Queued for iPhone sync"
      } else {
        status = "Saved for iPhone import"
      }
      KnapsackComplicationStore.shared.setSyncStatus(status)
    } catch {
      status = error.localizedDescription
      KnapsackComplicationStore.shared.setSyncStatus(status)
    }
  }

  private func requestNotificationAuthorization() {
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) { _, _ in }
  }

  private func handleChatNotificationPayload(_ payload: [String: Any]) {
    guard payload[ChatNotificationKeys.kind] as? String == ChatNotificationKeys.chatReply else {
      return
    }

    let title = (payload[ChatNotificationKeys.title] as? String)?
      .trimmingCharacters(in: .whitespacesAndNewlines)
    let body = (payload[ChatNotificationKeys.body] as? String)?
      .trimmingCharacters(in: .whitespacesAndNewlines)

    guard let title, !title.isEmpty, let body, !body.isEmpty else { return }

    let threadID = payload[ChatNotificationKeys.threadID] as? UInt64
    let rawTimestamp = payload[ChatNotificationKeys.timestamp] as? Int64
    let timestamp = rawTimestamp.map { Date(timeIntervalSince1970: TimeInterval($0)) } ?? Date()

    latestChatNotification = ChatNotification(
      id: "\(threadID ?? 0)-\(Int(timestamp.timeIntervalSince1970))",
      title: title,
      body: body,
      threadID: threadID,
      timestamp: timestamp
    )
    status = "New desktop reply"
    KnapsackComplicationStore.shared.setSyncStatus(status)

    let content = UNMutableNotificationContent()
    content.title = title
    content.body = body
    content.sound = .default

    let request = UNNotificationRequest(
      identifier: "knapsack-chat-\(threadID ?? 0)",
      content: content,
      trigger: nil
    )
    UNUserNotificationCenter.current().add(request)
  }
}

extension WatchSyncManager: WCSessionDelegate {
  nonisolated func session(
    _ session: WCSession,
    activationDidCompleteWith activationState: WCSessionActivationState,
    error: Error?
  ) {}

  nonisolated func sessionReachabilityDidChange(_ session: WCSession) {}

  nonisolated func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
    Task { @MainActor in
      handleChatNotificationPayload(message)
    }
  }

  nonisolated func session(_ session: WCSession, didReceiveUserInfo userInfo: [String : Any] = [:]) {
    Task { @MainActor in
      handleChatNotificationPayload(userInfo)
    }
  }

  nonisolated func session(
    _ session: WCSession,
    didReceiveApplicationContext applicationContext: [String : Any]
  ) {
    Task { @MainActor in
      handleChatNotificationPayload(applicationContext)
    }
  }
}
