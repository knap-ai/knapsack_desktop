import Foundation

struct PendingWatchRecording: Codable, Identifiable {
  let id: String
  let sourceDevice: String
  let originalFilename: String
  let startedAt: Int64?
  let endedAt: Int64?
  let createdAt: Int64
}

enum WatchSharedBridgeError: Error, LocalizedError {
  case unavailable
  case missingRecording

  var errorDescription: String? {
    switch self {
    case .unavailable:
      return "Shared watch storage is unavailable."
    case .missingRecording:
      return "The saved watch recording could not be found."
    }
  }
}

enum WatchSharedBridge {
  static let appGroupID = "group.ai.knapsack.mobile"
  private static let appGroupRootOverrideEnv = "KNAPSACK_MOBILE_APP_GROUP_ROOT"

  static func enqueueRecording(
    from fileURL: URL,
    sourceDevice: String,
    startedAt: Date?,
    endedAt: Date?
  ) throws -> PendingWatchRecording {
    let entry = PendingWatchRecording(
      id: UUID().uuidString.lowercased(),
      sourceDevice: sourceDevice,
      originalFilename: fileURL.lastPathComponent,
      startedAt: startedAt.map { Int64($0.timeIntervalSince1970) },
      endedAt: endedAt.map { Int64($0.timeIntervalSince1970) },
      createdAt: Int64(Date().timeIntervalSince1970)
    )
    let inboxURL = try ensureInboxURL()
    let destinationURL = audioURL(for: entry, inboxURL: inboxURL)
    let metadataURL = metadataURL(for: entry, inboxURL: inboxURL)

    if FileManager.default.fileExists(atPath: destinationURL.path) {
      try FileManager.default.removeItem(at: destinationURL)
    }
    try FileManager.default.copyItem(at: fileURL, to: destinationURL)
    let metadata = try JSONEncoder().encode(entry)
    try metadata.write(to: metadataURL, options: .atomic)
    return entry
  }

  static func pendingRecordings() throws -> [PendingWatchRecording] {
    let inboxURL = try ensureInboxURL()
    let fileURLs = try FileManager.default.contentsOfDirectory(
      at: inboxURL,
      includingPropertiesForKeys: nil,
      options: [.skipsHiddenFiles]
    )
    let decoder = JSONDecoder()
    return try fileURLs
      .filter { $0.pathExtension == "json" }
      .map { url in
        let data = try Data(contentsOf: url)
        return try decoder.decode(PendingWatchRecording.self, from: data)
      }
      .sorted { $0.createdAt < $1.createdAt }
  }

  static func recordingFileURL(for entry: PendingWatchRecording) throws -> URL {
    let inboxURL = try ensureInboxURL()
    let fileURL = audioURL(for: entry, inboxURL: inboxURL)
    guard FileManager.default.fileExists(atPath: fileURL.path) else {
      throw WatchSharedBridgeError.missingRecording
    }
    return fileURL
  }

  static func remove(_ entry: PendingWatchRecording) throws {
    let inboxURL = try ensureInboxURL()
    let targets = [
      audioURL(for: entry, inboxURL: inboxURL),
      metadataURL(for: entry, inboxURL: inboxURL),
    ]
    for url in targets where FileManager.default.fileExists(atPath: url.path) {
      try FileManager.default.removeItem(at: url)
    }
  }

  static func remove(id: String) throws {
    let inboxURL = try ensureInboxURL()
    let entry = PendingWatchRecording(
      id: id,
      sourceDevice: "watch",
      originalFilename: "",
      startedAt: nil,
      endedAt: nil,
      createdAt: 0
    )
    let metadata = metadataURL(for: entry, inboxURL: inboxURL)
    if FileManager.default.fileExists(atPath: metadata.path),
       let data = try? Data(contentsOf: metadata),
       let decoded = try? JSONDecoder().decode(PendingWatchRecording.self, from: data) {
      try remove(decoded)
      return
    }

    let baseURL = inboxURL.appendingPathComponent(id)
    for url in [
      baseURL.appendingPathExtension("json"),
      baseURL.appendingPathExtension("m4a"),
    ] where FileManager.default.fileExists(atPath: url.path) {
      try FileManager.default.removeItem(at: url)
    }
  }

  private static func ensureInboxURL() throws -> URL {
    if let overrideRoot = ProcessInfo.processInfo.environment[appGroupRootOverrideEnv],
       !overrideRoot.isEmpty {
      let root = URL(fileURLWithPath: overrideRoot, isDirectory: true)
      try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
      let inboxURL = root.appendingPathComponent("watch-inbox", isDirectory: true)
      try FileManager.default.createDirectory(at: inboxURL, withIntermediateDirectories: true)
      return inboxURL
    }

    guard let root = FileManager.default.containerURL(
      forSecurityApplicationGroupIdentifier: appGroupID
    ) else {
      throw WatchSharedBridgeError.unavailable
    }
    let inboxURL = root.appendingPathComponent("watch-inbox", isDirectory: true)
    try FileManager.default.createDirectory(at: inboxURL, withIntermediateDirectories: true)
    return inboxURL
  }

  private static func audioURL(for entry: PendingWatchRecording, inboxURL: URL) -> URL {
    inboxURL.appendingPathComponent(entry.id).appendingPathExtension("m4a")
  }

  private static func metadataURL(for entry: PendingWatchRecording, inboxURL: URL) -> URL {
    inboxURL.appendingPathComponent(entry.id).appendingPathExtension("json")
  }
}
