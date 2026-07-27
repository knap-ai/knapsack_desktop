import ClockKit
import Foundation
import UserNotifications
import WatchConnectivity

private enum KnapsackComplicationKeys {
  static let suiteName = "group.ai.knapsack.mobile"
  static let isRecording = "knapsack.complication.isRecording"
  static let syncStatus = "knapsack.complication.syncStatus"
  static let updatedAt = "knapsack.complication.updatedAt"
}

struct KnapsackComplicationSnapshot {
  let isRecording: Bool
  let syncStatus: String
  let updatedAt: Date

  var titleText: String {
    if isRecording {
      return "LIVE"
    }
    if syncStatus.localizedCaseInsensitiveContains("reply") {
      return "CHAT"
    }
    if syncStatus.localizedCaseInsensitiveContains("sync")
      || syncStatus.localizedCaseInsensitiveContains("queued")
      || syncStatus.localizedCaseInsensitiveContains("saved") {
      return "SYNC"
    }
    return "READY"
  }

  var subtitleText: String {
    if isRecording {
      return "NOTE"
    }
    if syncStatus.localizedCaseInsensitiveContains("reply") {
      return "NEW"
    }
    if syncStatus.localizedCaseInsensitiveContains("sync")
      || syncStatus.localizedCaseInsensitiveContains("queued")
      || syncStatus.localizedCaseInsensitiveContains("saved") {
      return "PHONE"
    }
    return "TAP"
  }

  var flatText: String {
    isRecording ? "Knapsack Live" : "Knapsack \(subtitleText.capitalized)"
  }
}

@MainActor
final class KnapsackComplicationStore {
  static let shared = KnapsackComplicationStore()

  private let defaults = UserDefaults(suiteName: KnapsackComplicationKeys.suiteName)

  func setRecording(_ isRecording: Bool) {
    defaults?.set(isRecording, forKey: KnapsackComplicationKeys.isRecording)
    if isRecording {
      defaults?.set("Recording to Knapsack", forKey: KnapsackComplicationKeys.syncStatus)
    }
    touch()
  }

  func setSyncStatus(_ status: String) {
    defaults?.set(status, forKey: KnapsackComplicationKeys.syncStatus)
    touch()
  }

  func currentSnapshot() -> KnapsackComplicationSnapshot {
    KnapsackComplicationSnapshot(
      isRecording: defaults?.bool(forKey: KnapsackComplicationKeys.isRecording) ?? false,
      syncStatus: defaults?.string(forKey: KnapsackComplicationKeys.syncStatus) ?? "Ready",
      updatedAt: Date(timeIntervalSince1970: defaults?.double(forKey: KnapsackComplicationKeys.updatedAt) ?? Date().timeIntervalSince1970)
    )
  }

  private func touch() {
    defaults?.set(Date().timeIntervalSince1970, forKey: KnapsackComplicationKeys.updatedAt)
    reloadComplications()
  }

  private func reloadComplications() {
    let server = CLKComplicationServer.sharedInstance()
    server.activeComplications?.forEach { complication in
      server.reloadTimeline(for: complication)
    }
  }
}

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

final class KnapsackComplicationController: NSObject, CLKComplicationDataSource {
  private let store = KnapsackComplicationStore.shared

  func getComplicationDescriptors(
    handler: @escaping ([CLKComplicationDescriptor]) -> Void
  ) {
    handler([
      CLKComplicationDescriptor(
        identifier: "knapsack.capture",
        displayName: "Knapsack",
        supportedFamilies: [
          .circularSmall,
          .modularSmall,
          .utilitarianSmall,
          .graphicCircular,
        ]
      )
    ])
  }

  func handleSharedComplicationDescriptors(_ complicationDescriptors: [CLKComplicationDescriptor]) {}

  func getSupportedTimeTravelDirections(
    for complication: CLKComplication,
    withHandler handler: @escaping (CLKComplicationTimeTravelDirections) -> Void
  ) {
    handler([])
  }

  func getTimelineStartDate(
    for complication: CLKComplication,
    withHandler handler: @escaping (Date?) -> Void
  ) {
    handler(nil)
  }

  func getTimelineEndDate(
    for complication: CLKComplication,
    withHandler handler: @escaping (Date?) -> Void
  ) {
    handler(nil)
  }

  func getPrivacyBehavior(
    for complication: CLKComplication,
    withHandler handler: @escaping (CLKComplicationPrivacyBehavior) -> Void
  ) {
    handler(.showOnLockScreen)
  }

  func getCurrentTimelineEntry(
    for complication: CLKComplication,
    withHandler handler: @escaping (CLKComplicationTimelineEntry?) -> Void
  ) {
    let snapshot = store.currentSnapshot()
    guard let template = template(for: complication.family, snapshot: snapshot) else {
      handler(nil)
      return
    }
    handler(CLKComplicationTimelineEntry(date: snapshot.updatedAt, complicationTemplate: template))
  }

  func getTimelineEntries(
    for complication: CLKComplication,
    after date: Date,
    limit: Int,
    withHandler handler: @escaping ([CLKComplicationTimelineEntry]?) -> Void
  ) {
    handler(nil)
  }

  func getLocalizableSampleTemplate(
    for complication: CLKComplication,
    withHandler handler: @escaping (CLKComplicationTemplate?) -> Void
  ) {
    handler(template(for: complication.family, snapshot: sampleSnapshot))
  }

  private var sampleSnapshot: KnapsackComplicationSnapshot {
    KnapsackComplicationSnapshot(
      isRecording: false,
      syncStatus: "Ready",
      updatedAt: Date()
    )
  }

  private func template(
    for family: CLKComplicationFamily,
    snapshot: KnapsackComplicationSnapshot
  ) -> CLKComplicationTemplate? {
    let title = CLKSimpleTextProvider(text: snapshot.titleText)
    let subtitle = CLKSimpleTextProvider(text: snapshot.subtitleText)

    switch family {
    case .circularSmall:
      return CLKComplicationTemplateCircularSmallStackText(
        line1TextProvider: title,
        line2TextProvider: subtitle
      )
    case .modularSmall:
      return CLKComplicationTemplateModularSmallStackText(
        line1TextProvider: title,
        line2TextProvider: subtitle
      )
    case .utilitarianSmall:
      return CLKComplicationTemplateUtilitarianSmallFlat(
        textProvider: CLKSimpleTextProvider(text: snapshot.flatText)
      )
    case .graphicCircular:
      return CLKComplicationTemplateGraphicCircularStackText(
        line1TextProvider: title,
        line2TextProvider: subtitle
      )
    default:
      return nil
    }
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
