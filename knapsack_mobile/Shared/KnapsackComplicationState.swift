import Foundation
#if canImport(WidgetKit)
import WidgetKit
#endif

enum KnapsackComplicationDefinition {
  static let appGroupSuiteName = "group.ai.knapsack.mobile"
  static let widgetKind = "KnapsackWatchComplication"
}

enum KnapsackComplicationKeys {
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

final class KnapsackComplicationStore {
  static let shared = KnapsackComplicationStore()

  private let defaults = UserDefaults(suiteName: KnapsackComplicationDefinition.appGroupSuiteName)

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
      updatedAt: Date(
        timeIntervalSince1970: defaults?.double(forKey: KnapsackComplicationKeys.updatedAt)
          ?? Date().timeIntervalSince1970
      )
    )
  }

  private func touch() {
    defaults?.set(Date().timeIntervalSince1970, forKey: KnapsackComplicationKeys.updatedAt)
    reloadComplications()
  }

  private func reloadComplications() {
    #if canImport(WidgetKit)
    WidgetCenter.shared.reloadAllTimelines()
    #endif
  }
}
