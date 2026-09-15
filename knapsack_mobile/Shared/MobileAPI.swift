import Foundation
import Security

final class MobileAPI {
  static let shared = MobileAPI()

  private let decoder = JSONDecoder()
  private let encoder = JSONEncoder()
  private let fallbackStoreKey = "knapsack.mobile.fallback.meetings"
  private let fallbackChatStoreKey = "knapsack.mobile.fallback.chats"
  private let fallbackChatDetailStoreKey = "knapsack.mobile.fallback.chatDetails"
  private let fallbackCalendarStoreKey = "knapsack.mobile.fallback.calendar"
  private let fallbackSessionStoreKey = "knapsack.mobile.fallback.session"
  private let fallbackTeamStoreKey = "knapsack.mobile.fallback.team"
  private let fallbackTeamMessagesStoreKey = "knapsack.mobile.fallback.teamMessages"
  private let fallbackAutopilotStoreKey = "knapsack.mobile.fallback.autopilot"
  private let baseURLStoreKey = "knapsack.mobile.baseURL"
  private let pairingTokenStoreKey = "knapsack.mobile.pairingToken"
  private let mobileTokenHeader = "x-knapsack-mobile-token"
  private let requestTimeout: TimeInterval = 6
  private let inferenceRequestTimeout: TimeInterval = 300
  private let studioBaseURL = URL(string: "https://api.knapsack.ai")!
  private let studioChatIDStoreKey = "knapsack.mobile.studio.emailChatID"
  private let studioTokenService = "ai.knap.KnapsackMobile.studio"

  var hasStudioSession: Bool {
    keychainValue(account: "refreshToken") != nil
  }

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
      let chats: [MobileChatSummary] = try await fetch(
        path: "/api/knapsack/mobile/chats",
        timeout: 30
      )
      try? saveFallbackChats(chats)
      return chats
    } catch {
      return loadFallbackChats()
    }
  }

  func getChat(threadID: UInt64) async throws -> MobileChatDetail {
    do {
      let chat: MobileChatDetail = try await fetch(path: "/api/knapsack/mobile/chats/\(threadID)")
      try? upsertFallbackChatDetail(chat)
      return chat
    } catch {
      guard let chat = loadFallbackChatDetails().first(where: { $0.id == threadID }) else {
        throw error
      }
      return chat
    }
  }

  func createChat(title: String? = nil) async throws -> MobileChatDetail {
    let chat: MobileChatDetail = try await send(
      path: "/api/knapsack/mobile/chats",
      method: "POST",
      body: CreateMobileChatRequest(title: title)
    )
    try? upsertFallbackChatSummary(from: chat)
    try? upsertFallbackChatDetail(chat)
    return chat
  }

  func sendChatMessage(threadID: UInt64, text: String) async throws -> MobileChatDetail {
    let chat: MobileChatDetail = try await send(
      path: "/api/knapsack/mobile/chats/\(threadID)/messages",
      method: "POST",
      body: SendMobileChatMessageRequest(text: text),
      timeout: inferenceRequestTimeout
    )
    try? upsertFallbackChatSummary(from: chat)
    try? upsertFallbackChatDetail(chat)
    return chat
  }

  func ensureStudioLink(expectedEmail: String? = nil) async -> Bool {
    let normalizedExpectedEmail = expectedEmail?.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    let storedEmail = keychainValue(account: "email")?.lowercased()
    if let normalizedExpectedEmail, storedEmail != nil, storedEmail != normalizedExpectedEmail {
      clearStudioSession()
    }
    if hasStudioSession {
      return true
    }

    do {
      let link: MobileCloudLink = try await sendWithoutBody(
        path: "/api/knapsack/mobile/cloud-link",
        method: "POST"
      )
      let request = StudioSignInRequest(code: link.code)
      let tokens: StudioTokenResponse = try await studioSend(
        path: "/api/authentication/desktop-sign-in",
        method: "POST",
        body: request,
        authenticated: false
      )
      try setKeychainValue(tokens.accessToken, account: "accessToken")
      try setKeychainValue(tokens.refreshToken, account: "refreshToken")
      try setKeychainValue(tokens.email, account: "email")
      return true
    } catch {
      return false
    }
  }

  func getStudioEmailConversation() async throws -> MobileChatDetail? {
    guard await ensureStudioLink() else {
      return nil
    }
    guard let chatID = try await studioEmailChatID(createIfMissing: false) else {
      return nil
    }
    return try await studioEmailConversation(chatID: chatID)
  }

  func sendStudioEmailMessage(_ text: String) async throws -> MobileChatDetail {
    guard await ensureStudioLink() else {
      throw MobileAPIError.server("Connect to your desktop once to finish linking Studio.")
    }
    guard let chatID = try await studioEmailChatID(createIfMissing: true) else {
      throw MobileAPIError.server("Could not start the Studio email conversation.")
    }

    let message = StudioMessageCreate(role: "user", content: text)
    let _: StudioMessage = try await studioSend(
      path: "/api/chat/chats/\(chatID)/messages",
      method: "POST",
      body: message
    )

    let completion = StudioCompletionRequest(
      messages: [],
      toolTypes: [
        StudioToolRequest(toolType: "google_gmail_modify", toolDescription: "Gmail"),
        StudioToolRequest(toolType: "microsoft_outlook_read", toolDescription: "Outlook"),
      ],
      streamUpdates: false,
      chatID: chatID,
      useSmartCache: true,
      parentContext: "This is the user's persistent mobile email assistant. Use email context when relevant. Create a reviewable email draft when asked to respond. Never send email from this mobile conversation; tell the user where the draft was saved."
    )
    try await studioCompletion(completion)
    return try await studioEmailConversation(chatID: chatID)
  }

  func getManagedAgents() async throws -> MobileManagedAgentsIndex {
    do {
      var roster: MobileTeamRoster = try await fetch(path: "/api/knapsack/mobile/team")
      if roster.agents.isEmpty {
        roster = (try? await saveManagedAgents(MobileTeamRoster.starter)) ?? .starter
      }
      if let data = try? encoder.encode(roster) {
        UserDefaults.standard.set(data, forKey: fallbackTeamStoreKey)
      }
      return MobileManagedAgentsIndex(success: true, agents: roster.agents, executionSessions: [])
    } catch {
      guard let data = UserDefaults.standard.data(forKey: fallbackTeamStoreKey),
            let roster = try? decoder.decode(MobileTeamRoster.self, from: data) else {
        throw error
      }
      return MobileManagedAgentsIndex(success: true, agents: roster.agents, executionSessions: [])
    }
  }

  private func saveManagedAgents(_ roster: MobileTeamRoster) async throws -> MobileTeamRoster {
    try await send(
      path: "/api/knapsack/mobile/team",
      method: "POST",
      body: roster
    )
  }

  func cachedChat(threadID: UInt64?, titled title: String) -> MobileChatDetail? {
    let details = loadFallbackChatDetails()
    if let threadID, let detail = details.first(where: { $0.id == threadID }) {
      return detail
    }
    return details.first {
      ($0.thread.title ?? "").localizedCaseInsensitiveCompare(title) == .orderedSame
    }
  }

  func sendManagedAgentMessage(agentID: String, text: String) async throws -> MobileTeamMessageResponse {
    try await send(
      path: "/api/knapsack/mobile/team/\(agentID)/messages",
      method: "POST",
      body: SendMobileChatMessageRequest(text: text),
      timeout: inferenceRequestTimeout
    )
  }

  func getManagedAgentMessages(agentID: String) async throws -> [MobileChatMessage] {
    do {
      let history: MobileTeamMessages = try await fetch(
        path: "/api/knapsack/mobile/team/\(agentID)/messages"
      )
      var cached = loadFallbackTeamMessages()
      cached[agentID] = history.messages
      if let data = try? encoder.encode(cached) {
        UserDefaults.standard.set(data, forKey: fallbackTeamMessagesStoreKey)
      }
      return history.messages
    } catch {
      guard let messages = loadFallbackTeamMessages()[agentID] else {
        throw error
      }
      return messages
    }
  }

  func getSession() async throws -> MobileLinkedSession {
    let session: MobileLinkedSession = try await fetch(path: "/api/knapsack/mobile/session")
    if let data = try? encoder.encode(session) {
      UserDefaults.standard.set(data, forKey: fallbackSessionStoreKey)
    }
    return session
  }

  func loadCachedWorkspace() -> (
    session: MobileLinkedSession?,
    calendarEvents: [MobileCalendarEventSummary],
    meetings: [MobileMeetingDetail],
    chats: [MobileChatSummary]
  ) {
    let session = UserDefaults.standard.data(forKey: fallbackSessionStoreKey)
      .flatMap { try? decoder.decode(MobileLinkedSession.self, from: $0) }
    return (session, loadFallbackCalendarEvents(), loadFallbackMeetings(), loadFallbackChats())
  }

  func listCalendarEvents() async throws -> [MobileCalendarEventSummary] {
    do {
      let events: [MobileCalendarEventSummary] = try await fetch(path: "/api/knapsack/mobile/calendar")
      if let data = try? encoder.encode(events) {
        UserDefaults.standard.set(data, forKey: fallbackCalendarStoreKey)
      }
      return events
    } catch {
      guard let data = UserDefaults.standard.data(forKey: fallbackCalendarStoreKey),
            let events = try? decoder.decode([MobileCalendarEventSummary].self, from: data) else {
        throw error
      }
      return events
    }
  }

  func getAutopilotBrief() async throws -> MobileAutopilotBrief {
    do {
      let brief: MobileAutopilotBrief = try await fetch(path: "/api/knapsack/mobile/autopilot")
      if let data = try? encoder.encode(brief) {
        UserDefaults.standard.set(data, forKey: fallbackAutopilotStoreKey)
      }
      return brief
    } catch {
      guard let data = UserDefaults.standard.data(forKey: fallbackAutopilotStoreKey),
            let brief = try? decoder.decode(MobileAutopilotBrief.self, from: data) else {
        throw error
      }
      return brief
    }
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

  private func fetch<T: Codable>(
    path: String,
    queryItems: [URLQueryItem] = [],
    timeout: TimeInterval? = nil
  ) async throws -> T {
    var request = URLRequest(url: try requestURL(path: path, queryItems: queryItems))
    request.timeoutInterval = timeout ?? requestTimeout
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

  private func send<T: Codable, Body: Codable>(
    path: String,
    method: String,
    body: Body,
    timeout: TimeInterval? = nil
  ) async throws -> T {
    var request = URLRequest(url: baseURL.appendingPathComponent(path.trimmingCharacters(in: CharacterSet(charactersIn: "/"))))
    request.timeoutInterval = timeout ?? requestTimeout
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

  private func sendWithoutBody<T: Codable>(path: String, method: String) async throws -> T {
    var request = URLRequest(url: baseURL.appendingPathComponent(path.trimmingCharacters(in: CharacterSet(charactersIn: "/"))))
    request.timeoutInterval = requestTimeout
    request.httpMethod = method
    applyAuthentication(to: &request)
    let (data, response) = try await URLSession.shared.data(for: request)
    guard let httpResponse = response as? HTTPURLResponse else {
      throw MobileAPIError.invalidResponse
    }
    let envelope = try decoder.decode(APIEnvelope<T>.self, from: data)
    guard httpResponse.statusCode < 300, let payload = envelope.data else {
      throw MobileAPIError.server(envelope.error ?? "Request failed")
    }
    return payload
  }

  private func studioEmailChatID(createIfMissing: Bool) async throws -> String? {
    if let stored = UserDefaults.standard.string(forKey: studioChatIDStoreKey), !stored.isEmpty {
      return stored
    }

    let list: StudioChatsList = try await studioFetch(path: "/api/chat/chats?limit=100")
    if let existing = list.chats.first(where: { $0.title == "Mobile Email" }) {
      UserDefaults.standard.set(existing.id, forKey: studioChatIDStoreKey)
      return existing.id
    }
    guard createIfMissing else { return nil }

    let created: StudioChat = try await studioSend(
      path: "/api/chat/chats",
      method: "POST",
      body: StudioChatCreate(title: "Mobile Email")
    )
    UserDefaults.standard.set(created.id, forKey: studioChatIDStoreKey)
    return created.id
  }

  private func studioEmailConversation(chatID: String) async throws -> MobileChatDetail {
    let payload: StudioMessagesResponse = try await studioFetch(path: "/api/chat/chats/\(chatID)/messages")
    let visible = payload.messages.filter { message in
      guard !message.content.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return false }
      let messageType = message.metadata?.messageType
      return messageType == nil || messageType == "final_response" || messageType == "tool_approval_request"
    }
    let messages = visible.map { message in
      MobileChatMessage(
        id: stableUInt64(message.id),
        timestamp: message.timestamp,
        role: message.role,
        content: message.content
      )
    }
    let updatedAt = messages.last?.timestamp ?? Int64(Date().timeIntervalSince1970)
    return MobileChatDetail(
      thread: MobileThread(
        id: UInt64.max - 1,
        timestamp: messages.first?.timestamp,
        hideFollowUp: false,
        feedItemId: nil,
        title: "Email",
        subtitle: "Synced through Studio",
        threadType: "CHAT",
        recorded: false,
        savedTranscript: nil,
        promptTemplate: nil
      ),
      messages: messages,
      updatedAt: updatedAt
    )
  }

  private func studioCompletion(_ body: StudioCompletionRequest) async throws {
    var request = try studioRequest(path: "/api/chat/completion", authenticated: true)
    request.timeoutInterval = inferenceRequestTimeout
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try encoder.encode(body)
    let (data, response) = try await studioData(for: request)
    guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode < 300 else {
      throw studioError(data: data, response: response)
    }
  }

  private func studioFetch<T: Decodable>(path: String) async throws -> T {
    var request = try studioRequest(path: path, authenticated: true)
    request.timeoutInterval = requestTimeout
    let (data, response) = try await studioData(for: request)
    guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode < 300 else {
      throw studioError(data: data, response: response)
    }
    return try decoder.decode(T.self, from: data)
  }

  private func studioSend<T: Decodable, Body: Encodable>(
    path: String,
    method: String,
    body: Body,
    authenticated: Bool = true
  ) async throws -> T {
    var request = try studioRequest(path: path, authenticated: authenticated)
    request.timeoutInterval = requestTimeout
    request.httpMethod = method
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try encoder.encode(body)
    let (data, response) = try await studioData(for: request, mayRefresh: authenticated)
    guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode < 300 else {
      throw studioError(data: data, response: response)
    }
    return try decoder.decode(T.self, from: data)
  }

  private func studioRequest(path: String, authenticated: Bool) throws -> URLRequest {
    guard let url = URL(string: path, relativeTo: studioBaseURL)?.absoluteURL else {
      throw MobileAPIError.invalidResponse
    }
    var request = URLRequest(url: url)
    if authenticated, let token = keychainValue(account: "accessToken") {
      request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    }
    return request
  }

  private func studioData(
    for request: URLRequest,
    mayRefresh: Bool = true
  ) async throws -> (Data, URLResponse) {
    let result = try await URLSession.shared.data(for: request)
    guard mayRefresh,
          let response = result.1 as? HTTPURLResponse,
          response.statusCode == 401 else {
      return result
    }
    guard try await refreshStudioAccessToken() else {
      clearStudioSession()
      return result
    }
    var retry = request
    retry.setValue("Bearer \(keychainValue(account: "accessToken") ?? "")", forHTTPHeaderField: "Authorization")
    return try await URLSession.shared.data(for: retry)
  }

  private func refreshStudioAccessToken() async throws -> Bool {
    guard let refreshToken = keychainValue(account: "refreshToken") else { return false }
    var request = try studioRequest(path: "/api/authentication/refresh/app", authenticated: false)
    request.setValue(refreshToken, forHTTPHeaderField: "refresh-token")
    let (data, response) = try await URLSession.shared.data(for: request)
    guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode < 300,
          let token = try? decoder.decode(StudioRefreshResponse.self, from: data).accessToken else {
      return false
    }
    try setKeychainValue(token, account: "accessToken")
    return true
  }

  private func studioError(data: Data, response: URLResponse) -> MobileAPIError {
    if let detail = try? decoder.decode(StudioErrorResponse.self, from: data).detail {
      return .server(detail)
    }
    let status = (response as? HTTPURLResponse)?.statusCode ?? 0
    return .server("Studio request failed (\(status)).")
  }

  private func stableUInt64(_ value: String) -> UInt64 {
    value.utf8.reduce(1_469_598_103_934_665_603) { ($0 ^ UInt64($1)) &* 1_099_511_628_211 }
  }

  private func keychainValue(account: String) -> String? {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: studioTokenService,
      kSecAttrAccount as String: account,
      kSecReturnData as String: true,
      kSecMatchLimit as String: kSecMatchLimitOne,
    ]
    var item: CFTypeRef?
    guard SecItemCopyMatching(query as CFDictionary, &item) == errSecSuccess,
          let data = item as? Data else { return nil }
    return String(data: data, encoding: .utf8)
  }

  private func setKeychainValue(_ value: String, account: String) throws {
    let key: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: studioTokenService,
      kSecAttrAccount as String: account,
    ]
    SecItemDelete(key as CFDictionary)
    var item = key
    item[kSecValueData as String] = Data(value.utf8)
    item[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
    let status = SecItemAdd(item as CFDictionary, nil)
    guard status == errSecSuccess else {
      throw MobileAPIError.server("Could not securely save the Studio session.")
    }
  }

  private func clearStudioSession() {
    for account in ["accessToken", "refreshToken", "email"] {
      let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrService as String: studioTokenService,
        kSecAttrAccount as String: account,
      ]
      SecItemDelete(query as CFDictionary)
    }
    UserDefaults.standard.removeObject(forKey: studioChatIDStoreKey)
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

  private func loadFallbackChatDetails() -> [MobileChatDetail] {
    guard let data = UserDefaults.standard.data(forKey: fallbackChatDetailStoreKey),
          let chats = try? decoder.decode([MobileChatDetail].self, from: data) else {
      return []
    }
    return chats.sorted { $0.updatedAt > $1.updatedAt }
  }

  private func loadFallbackTeamMessages() -> [String: [MobileChatMessage]] {
    guard let data = UserDefaults.standard.data(forKey: fallbackTeamMessagesStoreKey),
          let messages = try? decoder.decode([String: [MobileChatMessage]].self, from: data) else {
      return [:]
    }
    return messages
  }

  private func loadFallbackCalendarEvents() -> [MobileCalendarEventSummary] {
    guard let data = UserDefaults.standard.data(forKey: fallbackCalendarStoreKey),
          let events = try? decoder.decode([MobileCalendarEventSummary].self, from: data) else {
      return []
    }
    return events
  }

  private func saveFallbackMeetings(_ meetings: [MobileMeetingDetail]) throws {
    let data = try encoder.encode(meetings)
    UserDefaults.standard.set(data, forKey: fallbackStoreKey)
  }

  private func saveFallbackChats(_ chats: [MobileChatSummary]) throws {
    let data = try encoder.encode(chats)
    UserDefaults.standard.set(data, forKey: fallbackChatStoreKey)
  }

  private func saveFallbackChatDetails(_ chats: [MobileChatDetail]) throws {
    let data = try encoder.encode(Array(chats.prefix(40)))
    UserDefaults.standard.set(data, forKey: fallbackChatDetailStoreKey)
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

  private func upsertFallbackChatDetail(_ chat: MobileChatDetail) throws {
    var chats = loadFallbackChatDetails()
    if let index = chats.firstIndex(where: { $0.id == chat.id }) {
      chats[index] = chat
    } else {
      chats.insert(chat, at: 0)
    }
    chats.sort { $0.updatedAt > $1.updatedAt }
    try saveFallbackChatDetails(chats)
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

private struct StudioSignInRequest: Encodable {
  let code: String
}

private struct StudioTokenResponse: Decodable {
  let accessToken: String
  let refreshToken: String
  let email: String

  enum CodingKeys: String, CodingKey {
    case accessToken = "access_token"
    case refreshToken = "refresh_token"
    case email
  }
}

private struct StudioRefreshResponse: Decodable {
  let accessToken: String

  enum CodingKeys: String, CodingKey {
    case accessToken = "access_token"
  }
}

private struct StudioChatCreate: Encodable {
  let title: String
}

private struct StudioChat: Decodable {
  let id: String
  let title: String
}

private struct StudioChatSummary: Decodable {
  let id: String
  let title: String
}

private struct StudioChatsList: Decodable {
  let chats: [StudioChatSummary]
}

private struct StudioMessageCreate: Encodable {
  let role: String
  let content: String
}

private struct StudioMessage: Decodable {
  let id: String
  let role: String
  let content: String
  let timestamp: Int64
  let metadata: StudioMessageMetadata?

  enum CodingKeys: String, CodingKey {
    case id, role, content, timestamp, metadata
  }

  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: CodingKeys.self)
    id = try container.decode(String.self, forKey: .id)
    role = try container.decode(String.self, forKey: .role)
    content = try container.decodeIfPresent(String.self, forKey: .content) ?? ""
    metadata = try container.decodeIfPresent(StudioMessageMetadata.self, forKey: .metadata)
    if let seconds = try? container.decode(Double.self, forKey: .timestamp) {
      timestamp = Int64(seconds)
    } else {
      let value = try container.decode(String.self, forKey: .timestamp)
      timestamp = Int64(ISO8601DateFormatter().date(from: value)?.timeIntervalSince1970 ?? Date().timeIntervalSince1970)
    }
  }
}

private struct StudioMessageMetadata: Decodable {
  let messageType: String?

  enum CodingKeys: String, CodingKey {
    case messageType = "message_type"
  }
}

private struct StudioMessagesResponse: Decodable {
  let messages: [StudioMessage]
}

private struct StudioToolRequest: Encodable {
  let toolType: String
  let toolDescription: String

  enum CodingKeys: String, CodingKey {
    case toolType = "tool_type"
    case toolDescription = "tool_description"
  }
}

private struct StudioCompletionRequest: Encodable {
  let messages: [StudioMessageCreate]
  let toolTypes: [StudioToolRequest]
  let streamUpdates: Bool
  let chatID: String
  let useSmartCache: Bool
  let parentContext: String

  enum CodingKeys: String, CodingKey {
    case messages
    case toolTypes = "tool_types"
    case streamUpdates = "stream_updates"
    case chatID = "chat_id"
    case useSmartCache = "use_smart_cache"
    case parentContext = "parent_context"
  }
}

private struct StudioErrorResponse: Decodable {
  let detail: String
}
