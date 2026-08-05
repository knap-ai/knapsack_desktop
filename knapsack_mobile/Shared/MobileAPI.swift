import Foundation

final class MobileAPI {
  static let shared = MobileAPI()

  private let decoder = JSONDecoder()
  private let encoder = JSONEncoder()
  private let fallbackStoreKey = "knapsack.mobile.fallback.meetings"
  private let fallbackChatStoreKey = "knapsack.mobile.fallback.chats"
  private let baseURLStoreKey = "knapsack.mobile.baseURL"
  private let pairingTokenStoreKey = "knapsack.mobile.pairingToken"
  private let mobileTokenHeader = "x-knapsack-mobile-token"

  static var defaultBaseURL: URL {
#if targetEnvironment(simulator)
    return URL(string: "http://127.0.0.1:18898")!
#else
    return URL(string: "http://knapsack.invalid:18898")!
#endif
  }

  var persistedBaseURL: URL? {
    guard let raw = UserDefaults.standard.string(forKey: baseURLStoreKey),
          let url = URL(string: raw) else {
      return nil
    }
    return url
  }

  var hasPersistedBaseURL: Bool {
    persistedBaseURL != nil
  }

  var pairingToken: String? {
    get {
      let token = UserDefaults.standard.string(forKey: pairingTokenStoreKey)?
        .trimmingCharacters(in: .whitespacesAndNewlines)
      guard let token, !token.isEmpty else {
        return nil
      }
      return token
    }
    set {
      let trimmed = newValue?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
      if trimmed.isEmpty {
        UserDefaults.standard.removeObject(forKey: pairingTokenStoreKey)
      } else {
        UserDefaults.standard.set(trimmed, forKey: pairingTokenStoreKey)
      }
    }
  }

  static func isLoopbackURL(_ url: URL) -> Bool {
    guard let host = url.host()?.lowercased() else {
      return false
    }
    return host == "localhost" || host == "127.0.0.1" || host == "::1"
  }

  var baseURL: URL {
    get {
      if let url = persistedBaseURL {
        return url
      }
      return Self.defaultBaseURL
    }
    set {
      UserDefaults.standard.set(newValue.absoluteString, forKey: baseURLStoreKey)
    }
  }

  func listMeetings() async throws -> [MobileMeetingDetail] {
    do {
      let remote: [MobileMeetingDetail] = try await fetch(path: "/api/knapsack/mobile/meetings")
      let merged = mergeMeetings(remoteMeetings: remote, localMeetings: loadFallbackMeetings())
      try? saveFallbackMeetings(merged)
      return merged
    } catch {
      return loadFallbackMeetings()
    }
  }

  func createMeeting(title: String? = nil, subtitle: String? = nil, sourceDevice: String = "iphone") async throws -> MobileMeetingDetail {
    do {
      let meeting: MobileMeetingDetail = try await send(
        path: "/api/knapsack/mobile/meetings",
        method: "POST",
        body: CreateMeetingRequest(title: title, subtitle: subtitle, sourceDevice: sourceDevice)
      )
      try? upsertFallbackMeeting(meeting)
      return meeting
    } catch {
      return try createFallbackMeeting(title: title, subtitle: subtitle, sourceDevice: sourceDevice)
    }
  }

  func getMeeting(threadID: UInt64) async throws -> MobileMeetingDetail {
    do {
      let meeting: MobileMeetingDetail = try await fetch(path: "/api/knapsack/mobile/meetings/\(threadID)")
      try? upsertFallbackMeeting(meeting)
      return meeting
    } catch {
      guard let meeting = loadFallbackMeetings().first(where: { $0.id == threadID }) else {
        throw MobileAPIError.server("Meeting not found.")
      }
      return meeting
    }
  }

  func listChats() async throws -> [MobileChatSummary] {
    do {
      let chats: [MobileChatSummary] = try await fetch(path: "/api/knapsack/mobile/chats")
      try? saveFallbackChats(chats)
      return chats
    } catch {
      return loadFallbackChats()
    }
  }

  func getChat(threadID: UInt64) async throws -> MobileChatDetail {
    try await fetch(path: "/api/knapsack/mobile/chats/\(threadID)")
  }

  func createChat(title: String? = nil) async throws -> MobileChatDetail {
    let chat: MobileChatDetail = try await send(
      path: "/api/knapsack/mobile/chats",
      method: "POST",
      body: CreateMobileChatRequest(title: title)
    )
    try? upsertFallbackChatSummary(from: chat)
    return chat
  }

  func sendChatMessage(threadID: UInt64, text: String) async throws -> MobileChatDetail {
    let chat: MobileChatDetail = try await send(
      path: "/api/knapsack/mobile/chats/\(threadID)/messages",
      method: "POST",
      body: SendMobileChatMessageRequest(text: text)
    )
    try? upsertFallbackChatSummary(from: chat)
    return chat
  }

  func getSession() async throws -> MobileLinkedSession {
    try await fetch(path: "/api/knapsack/mobile/session")
  }

  func listCalendarEvents() async throws -> [MobileCalendarEventSummary] {
    try await fetch(path: "/api/knapsack/mobile/calendar")
  }

  func getAutopilotBrief() async throws -> MobileAutopilotBrief {
    try await fetch(path: "/api/knapsack/mobile/autopilot")
  }

  func getAutopilotEmail(emailUID: String) async throws -> MobileAutopilotEmailDetail {
    try await fetch(path: "/api/knapsack/mobile/autopilot/email/\(emailUID)")
  }

  func performAutopilotEmailAction(
    emailUID: String,
    action: MobileAutopilotEmailAction,
    replyBody: String? = nil
  ) async throws -> MobileAutopilotEmailDetail {
    try await send(
      path: "/api/knapsack/mobile/autopilot/email/\(emailUID)/action",
      method: "POST",
      body: MobileAutopilotEmailActionRequest(action: action, replyBody: replyBody)
    )
  }

  func getGBrainRoot() async throws -> String {
    try await fetch(path: "/api/knapsack/mobile/gbrain/root")
  }

  func listGBrainEntries(subPath: String = "") async throws -> [MobileBrainEntry] {
    try await fetch(path: "/api/knapsack/mobile/gbrain/list", queryItems: [
      URLQueryItem(name: "subPath", value: subPath)
    ])
  }

  func getGBrainPage(relPath: String) async throws -> MobileBrainPage {
    try await fetch(path: "/api/knapsack/mobile/gbrain/page", queryItems: [
      URLQueryItem(name: "relPath", value: relPath)
    ])
  }

  func saveNotes(threadID: UInt64, notes: String) async throws -> MobileMeetingMetadata {
    do {
      return try await send(
        path: "/api/knapsack/mobile/meetings/\(threadID)/notes",
        method: "POST",
        body: SaveNotesRequest(notes: notes)
      )
    } catch {
      return try updateFallbackMeeting(threadID: threadID) { meeting in
        meeting.notes = notes
        meeting.metadata.notesPreview = String(notes.prefix(120))
        meeting.metadata.updatedAt = nowTimestamp()
      }.metadata
    }
  }

  func updateStatus(
    threadID: UInt64,
    status: MeetingStatus,
    sourceDevice: String,
    startedAt: Int64? = nil,
    endedAt: Int64? = nil
  ) async throws -> MobileMeetingMetadata {
    do {
      return try await send(
        path: "/api/knapsack/mobile/meetings/\(threadID)/status",
        method: "POST",
        body: UpdateStatusRequest(
          status: status,
          sourceDevice: sourceDevice,
          startedAt: startedAt,
          endedAt: endedAt
        )
      )
    } catch {
      return try updateFallbackMeeting(threadID: threadID) { meeting in
        meeting.metadata.status = status
        meeting.metadata.sourceDevice = sourceDevice
        meeting.metadata.startedAt = startedAt ?? meeting.metadata.startedAt
        meeting.metadata.endedAt = endedAt ?? meeting.metadata.endedAt
        meeting.metadata.updatedAt = nowTimestamp()
      }.metadata
    }
  }

  func uploadRecording(
    threadID: UInt64,
    fileURL: URL,
    sourceDevice: String,
    startedAt: Int64?,
    endedAt: Int64?
  ) async throws -> MobileMeetingMetadata {
    do {
      return try await uploadRemoteRecording(
        threadID: threadID,
        fileURL: fileURL,
        sourceDevice: sourceDevice,
        startedAt: startedAt,
        endedAt: endedAt
      )
    } catch {
      return try updateFallbackMeeting(threadID: threadID) { meeting in
        meeting.metadata.status = .uploaded
        meeting.metadata.sourceDevice = sourceDevice
        meeting.metadata.latestAudioFile = fileURL.lastPathComponent
        meeting.metadata.startedAt = startedAt ?? meeting.metadata.startedAt
        meeting.metadata.endedAt = endedAt ?? meeting.metadata.endedAt
        meeting.metadata.updatedAt = nowTimestamp()
        meeting.thread.recorded = true
      }.metadata
    }
  }

  private func uploadRemoteRecording(
    threadID: UInt64,
    fileURL: URL,
    sourceDevice: String,
    startedAt: Int64?,
    endedAt: Int64?
  ) async throws -> MobileMeetingMetadata {
    let boundary = UUID().uuidString
    var request = URLRequest(url: baseURL.appendingPathComponent("api/knapsack/mobile/meetings/\(threadID)/recording"))
    request.httpMethod = "POST"
    request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
    applyAuthentication(to: &request)

    let fileData = try Data(contentsOf: fileURL)
    var body = Data()

    func appendField(_ name: String, value: String) {
      body.append("--\(boundary)\r\n".data(using: .utf8)!)
      body.append("Content-Disposition: form-data; name=\"\(name)\"\r\n\r\n".data(using: .utf8)!)
      body.append("\(value)\r\n".data(using: .utf8)!)
    }

    appendField("sourceDevice", value: sourceDevice)
    if let startedAt {
      appendField("startedAt", value: String(startedAt))
    }
    if let endedAt {
      appendField("endedAt", value: String(endedAt))
    }

    body.append("--\(boundary)\r\n".data(using: .utf8)!)
    body.append(
      "Content-Disposition: form-data; name=\"file\"; filename=\"\(fileURL.lastPathComponent)\"\r\n"
        .data(using: .utf8)!
    )
    body.append("Content-Type: audio/m4a\r\n\r\n".data(using: .utf8)!)
    body.append(fileData)
    body.append("\r\n".data(using: .utf8)!)
    body.append("--\(boundary)--\r\n".data(using: .utf8)!)
    request.httpBody = body

    let (data, response) = try await URLSession.shared.data(for: request)
    guard let httpResponse = response as? HTTPURLResponse else {
      throw MobileAPIError.invalidResponse
    }
    let envelope = try decoder.decode(APIEnvelope<MobileMeetingMetadata>.self, from: data)
    guard httpResponse.statusCode < 300 else {
      throw MobileAPIError.server(envelope.error ?? "Upload failed")
    }
    guard let metadata = envelope.data else {
      throw MobileAPIError.uploadFailed
    }
    return metadata
  }

  private func requestURL(path: String, queryItems: [URLQueryItem] = []) throws -> URL {
    let normalizedPath = path.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
    let base = baseURL.appendingPathComponent(normalizedPath)
    guard var components = URLComponents(url: base, resolvingAgainstBaseURL: false) else {
      throw MobileAPIError.invalidResponse
    }
    if !queryItems.isEmpty {
      components.queryItems = queryItems
    }
    guard let url = components.url else {
      throw MobileAPIError.invalidResponse
    }
    return url
  }

  private func fetch<T: Codable>(path: String, queryItems: [URLQueryItem] = []) async throws -> T {
    var request = URLRequest(url: try requestURL(path: path, queryItems: queryItems))
    applyAuthentication(to: &request)
    let (data, response) = try await URLSession.shared.data(for: request)
    guard let httpResponse = response as? HTTPURLResponse else {
      throw MobileAPIError.invalidResponse
    }
    let envelope = try decoder.decode(APIEnvelope<T>.self, from: data)
    guard httpResponse.statusCode < 300 else {
      throw MobileAPIError.server(envelope.error ?? "Request failed")
    }
    guard let payload = envelope.data else {
      throw MobileAPIError.invalidResponse
    }
    return payload
  }

  private func send<T: Codable, Body: Codable>(path: String, method: String, body: Body) async throws -> T {
    var request = URLRequest(url: baseURL.appendingPathComponent(path.trimmingCharacters(in: CharacterSet(charactersIn: "/"))))
    request.httpMethod = method
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    applyAuthentication(to: &request)
    request.httpBody = try encoder.encode(body)
    let (data, response) = try await URLSession.shared.data(for: request)
    guard let httpResponse = response as? HTTPURLResponse else {
      throw MobileAPIError.invalidResponse
    }
    let envelope = try decoder.decode(APIEnvelope<T>.self, from: data)
    guard httpResponse.statusCode < 300 else {
      throw MobileAPIError.server(envelope.error ?? "Request failed")
    }
    guard let payload = envelope.data else {
      throw MobileAPIError.invalidResponse
    }
    return payload
  }

  private func loadFallbackMeetings() -> [MobileMeetingDetail] {
    guard let data = UserDefaults.standard.data(forKey: fallbackStoreKey),
          let meetings = try? decoder.decode([MobileMeetingDetail].self, from: data) else {
      return []
    }
    return meetings.sorted { $0.metadata.updatedAt > $1.metadata.updatedAt }
  }

  private func loadFallbackChats() -> [MobileChatSummary] {
    guard let data = UserDefaults.standard.data(forKey: fallbackChatStoreKey),
          let chats = try? decoder.decode([MobileChatSummary].self, from: data) else {
      return []
    }
    return chats.sorted { $0.updatedAt > $1.updatedAt }
  }

  private func saveFallbackMeetings(_ meetings: [MobileMeetingDetail]) throws {
    let data = try encoder.encode(meetings)
    UserDefaults.standard.set(data, forKey: fallbackStoreKey)
  }

  private func saveFallbackChats(_ chats: [MobileChatSummary]) throws {
    let data = try encoder.encode(chats)
    UserDefaults.standard.set(data, forKey: fallbackChatStoreKey)
  }

  private func upsertFallbackMeeting(_ meeting: MobileMeetingDetail) throws {
    var meetings = loadFallbackMeetings()
    if let index = meetings.firstIndex(where: { $0.id == meeting.id }) {
      meetings[index] = meeting
    } else {
      meetings.insert(meeting, at: 0)
    }
    try saveFallbackMeetings(meetings)
  }

  private func upsertFallbackChatSummary(from chat: MobileChatDetail) throws {
    let preview = chat.messages.last?.content
    let summary = MobileChatSummary(
      thread: chat.thread,
      preview: preview,
      updatedAt: chat.updatedAt,
      messageCount: chat.messages.count
    )
    var chats = loadFallbackChats()
    if let index = chats.firstIndex(where: { $0.id == summary.id }) {
      chats[index] = summary
    } else {
      chats.insert(summary, at: 0)
    }
    chats.sort { $0.updatedAt > $1.updatedAt }
    try saveFallbackChats(chats)
  }

  private func createFallbackMeeting(title: String?, subtitle: String?, sourceDevice: String) throws -> MobileMeetingDetail {
    var meetings = loadFallbackMeetings()
    let nextID = (meetings.map(\.id).max() ?? 0) + 1
    let now = nowTimestamp()
    let meeting = MobileMeetingDetail(
      thread: MobileThread(
        id: nextID,
        timestamp: now,
        hideFollowUp: false,
        feedItemId: nil,
        title: title ?? "Mobile meeting",
        subtitle: subtitle,
        threadType: "MEETING NOTES",
        recorded: false,
        savedTranscript: nil,
        promptTemplate: nil
      ),
      metadata: MobileMeetingMetadata(
        threadId: nextID,
        status: .created,
        sourceDevice: sourceDevice,
        latestAudioFile: nil,
        notesPreview: nil,
        startedAt: nil,
        endedAt: nil,
        updatedAt: now
      ),
      notes: nil
    )
    meetings.insert(meeting, at: 0)
    try saveFallbackMeetings(meetings)
    return meeting
  }

  private func updateFallbackMeeting(
    threadID: UInt64,
    mutate: (inout MobileMeetingDetail) -> Void
  ) throws -> MobileMeetingDetail {
    var meetings = loadFallbackMeetings()
    guard let index = meetings.firstIndex(where: { $0.id == threadID }) else {
      throw MobileAPIError.server("Meeting not found.")
    }
    mutate(&meetings[index])
    try saveFallbackMeetings(meetings)
    return meetings[index]
  }

  private func mergeMeetings(
    remoteMeetings: [MobileMeetingDetail],
    localMeetings: [MobileMeetingDetail]
  ) -> [MobileMeetingDetail] {
    var merged: [UInt64: MobileMeetingDetail] = [:]
    for meeting in localMeetings {
      merged[meeting.id] = meeting
    }
    for meeting in remoteMeetings {
      if let local = merged[meeting.id] {
        merged[meeting.id] = MobileMeetingDetail(
          thread: MobileThread(
            id: meeting.thread.id ?? local.thread.id,
            timestamp: meeting.thread.timestamp ?? local.thread.timestamp,
            hideFollowUp: meeting.thread.hideFollowUp ?? local.thread.hideFollowUp,
            feedItemId: meeting.thread.feedItemId ?? local.thread.feedItemId,
            title: meeting.thread.title ?? local.thread.title,
            subtitle: meeting.thread.subtitle ?? local.thread.subtitle,
            threadType: meeting.thread.threadType,
            recorded: meeting.thread.recorded ?? local.thread.recorded,
            savedTranscript: meeting.thread.savedTranscript ?? local.thread.savedTranscript,
            promptTemplate: meeting.thread.promptTemplate ?? local.thread.promptTemplate
          ),
          metadata: MobileMeetingMetadata(
            threadId: meeting.metadata.threadId,
            status: local.metadata.updatedAt > meeting.metadata.updatedAt ? local.metadata.status : meeting.metadata.status,
            sourceDevice: local.metadata.updatedAt > meeting.metadata.updatedAt ? local.metadata.sourceDevice : meeting.metadata.sourceDevice,
            latestAudioFile: local.metadata.latestAudioFile ?? meeting.metadata.latestAudioFile,
            notesPreview: local.metadata.notesPreview ?? meeting.metadata.notesPreview,
            startedAt: local.metadata.startedAt ?? meeting.metadata.startedAt,
            endedAt: local.metadata.endedAt ?? meeting.metadata.endedAt,
            updatedAt: max(local.metadata.updatedAt, meeting.metadata.updatedAt)
          ),
          notes: local.notes ?? meeting.notes
        )
      } else {
        merged[meeting.id] = meeting
      }
    }
    return merged.values.sorted { $0.metadata.updatedAt > $1.metadata.updatedAt }
  }

  private func nowTimestamp() -> Int64 {
    Int64(Date().timeIntervalSince1970)
  }

  private func applyAuthentication(to request: inout URLRequest) {
    if let pairingToken {
      request.setValue(pairingToken, forHTTPHeaderField: mobileTokenHeader)
    }
  }
}
