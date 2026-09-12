import Foundation

enum MobileServiceAvailability: Equatable {
  case checking
  case desktopOnline
  case desktopNeedsSignIn
  case offlineReady(lastSync: Date?)
  case setupRequired

  var title: String {
    switch self {
    case .checking:
      return "Checking connection"
    case .desktopOnline:
      return "Online - all features ready"
    case .desktopNeedsSignIn:
      return "Desktop found - sign in required"
    case .offlineReady:
      return "Offline - notes and recording available"
    case .setupRequired:
      return "Not connected - setup required"
    }
  }

  var detail: String {
    switch self {
    case .checking:
      return "Confirming which Knapsack services are available."
    case .desktopOnline:
      return "Chats, meeting prep, notes, and recording are available."
    case .desktopNeedsSignIn:
      return "Open Knapsack Desktop and finish signing in to use chats and meeting prep."
    case .offlineReady(let lastSync):
      if let lastSync {
        return "Saved content is available. Chats and new prep need a connection. Last synced \(lastSync.formatted(date: .abbreviated, time: .shortened))."
      }
      return "Saved content is available. Chats and new prep need a connection."
    case .setupRequired:
      return "Connect to Knapsack Desktop to load your workspace."
    }
  }

  var systemImage: String {
    switch self {
    case .checking:
      return "arrow.triangle.2.circlepath"
    case .desktopOnline:
      return "checkmark.circle.fill"
    case .desktopNeedsSignIn:
      return "person.crop.circle.badge.exclamationmark"
    case .offlineReady:
      return "exclamationmark.triangle.fill"
    case .setupRequired:
      return "xmark.circle.fill"
    }
  }

  var supportsLiveActions: Bool {
    self == .desktopOnline
  }
}

@MainActor
final class MeetingListViewModel: ObservableObject {
  @Published var session: MobileLinkedSession?
  @Published var calendarEvents: [MobileCalendarEventSummary] = []
  @Published var meetings: [MobileMeetingDetail] = []
  @Published var selectedMeeting: MobileMeetingDetail?
  @Published var chats: [MobileChatSummary] = []
  @Published var selectedChat: MobileChatDetail?
  @Published var managedAgents: [MobileManagedAgent] = []
  @Published var managedAgentSessions: [MobileManagedAgentSession] = []
  @Published var selectedManagedAgent: MobileManagedAgent?
  @Published var managedAgentMessages: [MobileChatMessage] = []
  @Published var isSendingManagedAgentMessage = false
  @Published var nextMeetingPrep: MobileChatDetail?
  @Published var isLoadingNextMeetingPrep = false
  @Published private(set) var meetingPreps: [String: MobileChatDetail] = [:]
  @Published private(set) var loadingMeetingPrepIDs: Set<String> = []
  @Published var autopilotBrief: MobileAutopilotBrief?
  @Published var isLoadingAutopilot = false
  @Published var selectedAutopilotEmail: MobileAutopilotEmailDetail?
  @Published var isLoadingAutopilotEmail = false
  @Published var isPerformingAutopilotEmailAction = false
  @Published var brainRoot = ""
  @Published var brainCurrentPath = ""
  @Published var brainEntries: [MobileBrainEntry] = []
  @Published var selectedBrainPage: MobileBrainPage?
  @Published var isLoadingBrain = false
  @Published var isRunningGBrainPrompt = false
  @Published var isSendingChatMessage = false
  @Published var isConnectingToDesktop = false
  @Published private(set) var isDesktopReachable = false
  @Published private(set) var isCheckingConnection = true
  @Published private(set) var lastSuccessfulSyncAt: Date?
  @Published var serverURLText: String
  @Published var errorMessage: String?
  @Published var statusMessage: String?
  private var lastAutoConnectedDesktopID: String?
  private var preparedEventID: String?
  private let lastSuccessfulSyncStoreKey = "knapsack.mobile.lastSuccessfulSyncAt"

  private let api: MobileAPI

  init(api: MobileAPI = .shared) {
    self.api = api
    self.serverURLText = Self.initialServerURLText(for: api)
    let storedTimestamp = UserDefaults.standard.double(forKey: lastSuccessfulSyncStoreKey)
    self.lastSuccessfulSyncAt = storedTimestamp > 0 ? Date(timeIntervalSince1970: storedTimestamp) : nil
  }

  var availability: MobileServiceAvailability {
    if isCheckingConnection {
      return .checking
    }
    if isDesktopReachable, session?.linked == true {
      return .desktopOnline
    }
    if isDesktopReachable {
      return .desktopNeedsSignIn
    }
    if session != nil || !calendarEvents.isEmpty || !meetings.isEmpty || !chats.isEmpty {
      return .offlineReady(lastSync: lastSuccessfulSyncAt)
    }
    return .setupRequired
  }

  var currentMeetingID: UInt64? {
    selectedMeeting?.id
  }

  func refresh() async {
    isCheckingConnection = true
    defer { isCheckingConnection = false }
    hydrateCachedWorkspaceIfNeeded()
    if shouldWaitForDesktopLink {
      isDesktopReachable = false
      statusMessage = session == nil && meetings.isEmpty && chats.isEmpty
        ? "Open Knapsack on your Mac and keep this screen open. Your desktop should appear automatically."
        : "Offline - saved notes, chats, and recording remain available."
      errorMessage = nil
      return
    }

    do {
      async let sessionTask = api.getSession()
      async let calendarTask = api.listCalendarEvents()
      async let meetingsTask = api.listMeetings()
      async let chatsTask = api.listChats()
      session = try await sessionTask
      calendarEvents = try await calendarTask
      meetings = try await meetingsTask
      chats = try await chatsTask
      chats.sort { $0.updatedAt > $1.updatedAt }
      isDesktopReachable = true
      recordSuccessfulSync()
      isCheckingConnection = false
      hydrateCachedNextMeetingPrep()
      await preloadNextMeetingPrep()
      if let selectedID = selectedMeeting?.id,
         let matched = meetings.first(where: { $0.id == selectedID }) {
        selectedMeeting = matched
      } else if selectedMeeting == nil {
        selectedMeeting = meetings.first
      }

      if let selectedChatID = selectedChat?.id {
        selectedChat = try? await api.getChat(threadID: selectedChatID)
      } else if let firstChatID = chats.first?.id {
        selectedChat = try? await api.getChat(threadID: firstChatID)
      }

      if let profile = session?.profile {
        statusMessage = "Linked as \(profile.email). Loaded \(meetings.count) meeting\(meetings.count == 1 ? "" : "s"), \(chats.count) chat\(chats.count == 1 ? "" : "s"), and \(calendarEvents.count) event\(calendarEvents.count == 1 ? "" : "s")."
      } else {
        statusMessage = "Loaded \(meetings.count) meeting\(meetings.count == 1 ? "" : "s") and \(chats.count) chat\(chats.count == 1 ? "" : "s")."
      }
      errorMessage = nil
      await refreshManagedAgents()
    } catch {
      isDesktopReachable = false
      let cached = api.loadCachedWorkspace()
      session = cached.session
      calendarEvents = cached.calendarEvents
      meetings = cached.meetings
      chats = cached.chats.sorted { $0.updatedAt > $1.updatedAt }
      if selectedMeeting == nil {
        selectedMeeting = meetings.first
      }
      errorMessage = friendlyMessage(for: error)
      statusMessage = chats.isEmpty && meetings.isEmpty
        ? "Reconnect to your Mac to load your workspace."
        : "Offline - showing saved chats and meeting notes."
    }
  }

  @discardableResult
  func refreshConnectionStatus() async -> Bool {
    let wasReachable = isDesktopReachable
    let shouldShowChecking = session == nil && meetings.isEmpty && chats.isEmpty
    if shouldShowChecking { isCheckingConnection = true }
    defer {
      if shouldShowChecking { isCheckingConnection = false }
    }

    guard !shouldWaitForDesktopLink else {
      isDesktopReachable = false
      return false
    }

    do {
      let liveSession = try await api.getSession()
      session = liveSession
      isDesktopReachable = true
      recordSuccessfulSync()
      errorMessage = nil
      return !wasReachable
    } catch {
      isDesktopReachable = false
      return false
    }
  }

  private func recordSuccessfulSync() {
    let now = Date()
    lastSuccessfulSyncAt = now
    UserDefaults.standard.set(now.timeIntervalSince1970, forKey: lastSuccessfulSyncStoreKey)
  }

  private func hydrateCachedWorkspaceIfNeeded() {
    let cached = api.loadCachedWorkspace()
    if session == nil { session = cached.session }
    if calendarEvents.isEmpty { calendarEvents = cached.calendarEvents }
    if meetings.isEmpty { meetings = cached.meetings }
    if chats.isEmpty { chats = cached.chats.sorted { $0.updatedAt > $1.updatedAt } }
    hydrateCachedNextMeetingPrep()
  }

  private func hydrateCachedNextMeetingPrep() {
    guard nextMeetingPrep == nil, let event = nextCalendarEvent else { return }
    let cached = api.cachedChat(threadID: event.prepChatThreadId, titled: event.prepConversationTitle)
      ?? api.cachedChat(threadID: event.prepChatThreadId, titled: "Prep: \(event.displayTitle)")
    if let cached {
      meetingPreps[event.eventId] = cached
      nextMeetingPrep = cached
    }
  }

  func refreshAutopilot() async {
    isLoadingAutopilot = true
    defer { isLoadingAutopilot = false }

    do {
      autopilotBrief = try await api.getAutopilotBrief()
      errorMessage = nil
    } catch {
      autopilotBrief = nil
      errorMessage = friendlyMessage(for: error)
    }
  }

  func openAutopilotCard(_ card: MobileAutopilotCard) async {
    if let emailUID = card.emailUID {
      do {
        isLoadingAutopilotEmail = true
        selectedAutopilotEmail = try await api.getAutopilotEmail(emailUID: emailUID)
        statusMessage = "Loaded email thread."
        errorMessage = nil
      } catch {
        errorMessage = friendlyMessage(for: error)
      }
      isLoadingAutopilotEmail = false
      return
    }

    if let chatID = card.relatedChatThreadID {
      do {
        selectedChat = try await api.getChat(threadID: chatID)
        statusMessage = "Opened desktop chat."
        errorMessage = nil
      } catch {
        errorMessage = friendlyMessage(for: error)
      }
      return
    }

    if let meetingID = card.relatedThreadID {
      do {
        selectedMeeting = try await api.getMeeting(threadID: meetingID)
        statusMessage = "Opened meeting note."
        errorMessage = nil
      } catch {
        errorMessage = friendlyMessage(for: error)
      }
    }
  }

  func performAutopilotEmailAction(
    _ action: MobileAutopilotEmailAction,
    replyBody: String? = nil
  ) async -> Bool {
    guard let emailUID = selectedAutopilotEmail?.emailUID else { return false }

    do {
      isPerformingAutopilotEmailAction = true
      selectedAutopilotEmail = try await api.performAutopilotEmailAction(
        emailUID: emailUID,
        action: action,
        replyBody: replyBody
      )
      await refreshAutopilot()
      statusMessage = statusMessageForAutopilotAction(action)
      errorMessage = nil
      isPerformingAutopilotEmailAction = false
      return true
    } catch {
      isPerformingAutopilotEmailAction = false
      errorMessage = friendlyMessage(for: error)
      return false
    }
  }

  func saveServerURL() {
    if let url = normalizedServerURL(from: serverURLText) {
      if Self.shouldRejectLoopbackURL(url) {
        errorMessage = "Use your Mac's local network address here, not 127.0.0.1."
        return
      }
      serverURLText = url.absoluteString
      api.baseURL = url
      statusMessage = "Saved server URL."
      errorMessage = nil
    } else {
      errorMessage = "Server URL is invalid."
    }
  }

  func connectToDesktop() async {
    guard let url = normalizedServerURL(from: serverURLText) else {
      errorMessage = "Enter your desktop address like http://192.168.1.20:18898."
      return
    }

    if Self.shouldRejectLoopbackURL(url) {
      errorMessage = "Use your Mac's local network address here, not 127.0.0.1."
      return
    }

    isConnectingToDesktop = true
    serverURLText = url.absoluteString
    api.baseURL = url

    do {
      let linkedSession = try await api.getSession()
      session = linkedSession
      isDesktopReachable = true
      statusMessage = linkedSession.linked
        ? "Connected to your desktop as \(linkedSession.profile?.email ?? "your Knapsack account")."
        : "Connected to desktop. Finish signing in on your Mac to sync chats, meetings, and calendar."
      errorMessage = nil
      await refresh()
    } catch {
      if error is URLError {
        isDesktopReachable = false
      }
      errorMessage = "Could not reach Knapsack Desktop at \(url.host() ?? url.absoluteString). Make sure the Mac app is open and use your Mac's local network address."
    }

    isConnectingToDesktop = false
  }

  func adoptDiscoveredDesktop(_ desktop: DiscoveredDesktop?) async {
    guard let desktop else { return }

    if serverURLText != desktop.url.absoluteString {
      serverURLText = desktop.url.absoluteString
      statusMessage = "Found \(desktop.name) nearby."
    }
    if let pairingToken = desktop.pairingToken {
      api.pairingToken = pairingToken
    }

    guard lastAutoConnectedDesktopID != desktop.id else { return }
    if session?.linked == true,
       api.baseURL.host() == desktop.url.host(),
       api.baseURL.port == desktop.url.port {
      return
    }

    lastAutoConnectedDesktopID = desktop.id
    await connectToDesktop()
  }

  var shouldWaitForDesktopLink: Bool {
#if targetEnvironment(simulator)
    false
#else
    !api.hasPersistedBaseURL || MobileAPI.isLoopbackURL(api.baseURL)
#endif
  }

  func createMeeting() async {
    do {
      let meeting = try await api.createMeeting(title: "Mobile meeting", subtitle: nil, sourceDevice: "iphone")
      selectedMeeting = meeting
      await refresh()
      statusMessage = "Created meeting \(meeting.id)."
    } catch {
      errorMessage = friendlyMessage(for: error)
    }
  }

  func createMeetingForRecordingIfNeeded() async -> MobileMeetingDetail? {
    if let event = nextCalendarEvent {
      if let meetingID = event.meetingThreadId,
         let linkedMeeting = try? await api.getMeeting(threadID: meetingID) {
        selectedMeeting = linkedMeeting
        return linkedMeeting
      }
      if let selectedMeeting,
         selectedMeeting.thread.title == event.title,
         selectedMeeting.metadata.status == .recording {
        return selectedMeeting
      }
      do {
        let created = try await api.createMeeting(
          title: event.title ?? "Recorded meeting",
          subtitle: event.start.map { Date(timeIntervalSince1970: TimeInterval($0)).formatted(date: .abbreviated, time: .shortened) },
          sourceDevice: "iphone"
        )
        selectedMeeting = created
        await refresh()
        statusMessage = "Ready to record \(created.thread.title ?? "your next meeting")."
        return created
      } catch {
        errorMessage = friendlyMessage(for: error)
        return nil
      }
    }
    if let selectedMeeting, selectedMeeting.metadata.status == .recording {
      return selectedMeeting
    }
    do {
      let created = try await api.createMeeting(title: "Recorded from iPhone", subtitle: nil, sourceDevice: "iphone")
      selectedMeeting = created
      await refresh()
      statusMessage = "Prepared meeting \(created.id) for recording."
      return created
    } catch {
      errorMessage = friendlyMessage(for: error)
      return nil
    }
  }

  var nextCalendarEvent: MobileCalendarEventSummary? {
    let now = Int64(Date().timeIntervalSince1970)
    return calendarEvents
      .filter { ($0.end ?? $0.start ?? 0) >= now }
      .min { ($0.start ?? Int64.max) < ($1.start ?? Int64.max) }
  }

  func preloadNextMeetingPrep(force: Bool = false) async {
    guard isDesktopReachable, let event = nextCalendarEvent else { return }
    guard force || preparedEventID != event.eventId else { return }
    preparedEventID = event.eventId
    isLoadingNextMeetingPrep = true
    defer { isLoadingNextMeetingPrep = false }

    nextMeetingPrep = await prepareMeeting(event, force: force)
    if nextMeetingPrep == nil {
      preparedEventID = nil
    }
  }

  func prep(for event: MobileCalendarEventSummary) -> MobileChatDetail? {
    meetingPreps[event.eventId]
      ?? api.cachedChat(threadID: event.prepChatThreadId, titled: event.prepConversationTitle)
      ?? api.cachedChat(threadID: event.prepChatThreadId, titled: "Prep: \(event.displayTitle)")
  }

  func isLoadingPrep(for event: MobileCalendarEventSummary) -> Bool {
    loadingMeetingPrepIDs.contains(event.eventId)
  }

  func prepareMeeting(_ event: MobileCalendarEventSummary, force: Bool = false) async -> MobileChatDetail? {
    guard isDesktopReachable else {
      errorMessage = "Reconnect to your desktop to generate new meeting prep."
      return prep(for: event)
    }

    loadingMeetingPrepIDs.insert(event.eventId)
    defer { loadingMeetingPrepIDs.remove(event.eventId) }

    if !force, let cached = prep(for: event) {
      storePrep(cached, for: event)
      return cached
    }

    if let prepChatID = event.prepChatThreadId,
       let detail = try? await api.getChat(threadID: prepChatID) {
      if force {
        return await refreshMeetingPrep(event, chat: detail)
      }
      storePrep(detail, for: event)
      return detail
    }

    let titles = [event.prepConversationTitle, "Prep: \(event.displayTitle)"]
    if let existing = chats.first(where: { titles.contains($0.thread.title ?? "") }),
       let detail = try? await api.getChat(threadID: existing.id) {
      if force {
        return await refreshMeetingPrep(event, chat: detail)
      }
      storePrep(detail, for: event)
      return detail
    }

    do {
      let chat = try await api.createChat(title: event.prepConversationTitle)
      return await refreshMeetingPrep(event, chat: chat)
    } catch {
      errorMessage = friendlyMessage(for: error)
      return nil
    }
  }

  private func refreshMeetingPrep(
    _ event: MobileCalendarEventSummary,
    chat: MobileChatDetail
  ) async -> MobileChatDetail? {
    do {
      let detail = try await api.sendChatMessage(threadID: chat.id, text: event.prepPrompt)
      storePrep(detail, for: event)
      upsertChatSummary(from: detail)
      return detail
    } catch {
      errorMessage = friendlyMessage(for: error)
      return nil
    }
  }

  private func storePrep(_ prep: MobileChatDetail, for event: MobileCalendarEventSummary) {
    meetingPreps[event.eventId] = prep
    if event.eventId == nextCalendarEvent?.eventId {
      nextMeetingPrep = prep
    }
  }

  func openCalendarEvent(_ event: MobileCalendarEventSummary) async -> MobileMeetingDetail? {
    guard let meetingID = event.meetingThreadId else { return nil }
    do {
      let meeting = try await api.getMeeting(threadID: meetingID)
      selectedMeeting = meeting
      return meeting
    } catch {
      errorMessage = friendlyMessage(for: error)
      return nil
    }
  }

  func uploadRecording(fileURL: URL, startedAt: Date?, endedAt: Date?) async {
    guard let meeting = await createMeetingForRecordingIfNeeded() else { return }
    do {
      _ = try await api.updateStatus(
        threadID: meeting.id,
        status: .uploading,
        sourceDevice: "iphone",
        startedAt: startedAt.map { Int64($0.timeIntervalSince1970) },
        endedAt: endedAt.map { Int64($0.timeIntervalSince1970) }
      )
      _ = try await api.uploadRecording(
        threadID: meeting.id,
        fileURL: fileURL,
        sourceDevice: "iphone",
        startedAt: startedAt.map { Int64($0.timeIntervalSince1970) },
        endedAt: endedAt.map { Int64($0.timeIntervalSince1970) }
      )
      await refresh()
      statusMessage = "Uploaded recording for meeting \(meeting.id)."
    } catch {
      errorMessage = friendlyMessage(for: error)
    }
  }

  func saveNotes(_ notes: String) async {
    guard let meetingID = selectedMeeting?.id else { return }
    do {
      _ = try await api.saveNotes(threadID: meetingID, notes: notes)
      selectedMeeting = try await api.getMeeting(threadID: meetingID)
      await refresh()
      statusMessage = "Saved notes for meeting \(meetingID)."
    } catch {
      errorMessage = friendlyMessage(for: error)
    }
  }

  func selectChat(_ chat: MobileChatSummary) async {
    do {
      selectedChat = try await api.getChat(threadID: chat.id)
      statusMessage = "Loaded chat \(chat.id)."
      errorMessage = nil
    } catch {
      errorMessage = friendlyMessage(for: error)
    }
  }

  func refreshManagedAgents() async {
    guard let index = try? await api.getManagedAgents() else { return }
    managedAgents = index.agents
    managedAgentSessions = index.executionSessions.sorted { $0.updatedAt > $1.updatedAt }
  }

  func openManagedAgent(_ agent: MobileManagedAgent) async {
    selectedManagedAgent = agent
    var fallbackMessages: [MobileChatMessage] = []
    let sessions = managedAgentSessions
      .filter { $0.agentId == agent.agentId }
      .sorted { $0.updatedAt < $1.updatedAt }
    for (index, session) in sessions.enumerated() {
      let timestamp = Int64(index * 2)
      if let inbound = session.lastInboundMessage, !inbound.isEmpty {
        fallbackMessages.append(MobileChatMessage(id: nil, timestamp: timestamp, role: "user", content: inbound))
      }
      if let reply = session.lastReplySummary, !reply.isEmpty {
        fallbackMessages.append(MobileChatMessage(id: nil, timestamp: timestamp + 1, role: "assistant", content: reply))
      }
    }
    managedAgentMessages = fallbackMessages

    do {
      managedAgentMessages = try await api.getManagedAgentMessages(agentID: agent.agentId)
      errorMessage = nil
    } catch {
      if fallbackMessages.isEmpty {
        errorMessage = friendlyMessage(for: error)
      }
    }
  }

  func sendManagedAgentMessage(_ text: String) async -> Bool {
    let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
    guard let agent = selectedManagedAgent, !trimmed.isEmpty else { return false }
    let timestamp = Int64(Date().timeIntervalSince1970 * 1000)
    managedAgentMessages.append(MobileChatMessage(id: nil, timestamp: timestamp, role: "user", content: trimmed))
    isSendingManagedAgentMessage = true
    defer { isSendingManagedAgentMessage = false }

    do {
      let response = try await api.sendManagedAgentMessage(agentID: agent.agentId, text: trimmed)
      if !response.reply.isEmpty {
        let reply = response.reply
        managedAgentMessages.append(MobileChatMessage(id: nil, timestamp: timestamp + 1, role: "assistant", content: reply))
      }
      errorMessage = nil
      return true
    } catch {
      managedAgentMessages.removeLast()
      errorMessage = friendlyMessage(for: error)
      return false
    }
  }

  func createChat() async {
    do {
      let chat = try await api.createChat(title: "Chat from iPhone")
      selectedChat = chat
      await refresh()
      statusMessage = "Created chat \(chat.id)."
      errorMessage = nil
    } catch {
      errorMessage = friendlyMessage(for: error)
    }
  }

  func refreshGBrain() async {
    isLoadingBrain = true
    defer { isLoadingBrain = false }

    do {
      brainRoot = try await api.getGBrainRoot()
      brainEntries = try await api.listGBrainEntries(subPath: brainCurrentPath)
      errorMessage = nil
    } catch {
      brainEntries = []
      errorMessage = friendlyMessage(for: error)
    }
  }

  func openBrainDirectory(_ entry: MobileBrainEntry) async {
    guard entry.isDir else { return }
    brainCurrentPath = entry.relPath
    await refreshGBrain()
  }

  func navigateBrainUp() async {
    guard !brainCurrentPath.isEmpty else { return }
    let components = brainCurrentPath.split(separator: "/").dropLast()
    brainCurrentPath = components.joined(separator: "/")
    await refreshGBrain()
  }

  func openBrainPage(_ entry: MobileBrainEntry) async {
    guard !entry.isDir else { return }
    do {
      selectedBrainPage = try await api.getGBrainPage(relPath: entry.relPath)
      errorMessage = nil
    } catch {
      errorMessage = friendlyMessage(for: error)
    }
  }

  func runGBrainPrompt(_ prompt: String) async -> MobileChatDetail? {
    let trimmed = prompt.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmed.isEmpty else { return nil }

    do {
      isRunningGBrainPrompt = true
      let detail = try await sendGBrainPrompt(trimmed)
      selectedChat = detail
      upsertChatSummary(from: detail)
      statusMessage = "Knapsack has your answer ready."
      errorMessage = nil
      isRunningGBrainPrompt = false
      return detail
    } catch {
      isRunningGBrainPrompt = false
      errorMessage = friendlyMessage(for: error)
      return nil
    }
  }

  func sendChatMessage(_ text: String) async -> Bool {
    let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmed.isEmpty else { return false }
    let previousChat = selectedChat

    do {
      isSendingChatMessage = true

      if selectedChat == nil {
        selectedChat = try await api.createChat(title: "Chat from iPhone")
      }

      guard let threadID = selectedChat?.id else {
        isSendingChatMessage = false
        errorMessage = "Could not determine which chat to send to."
        return false
      }

      let optimisticTimestamp = Int64(Date().timeIntervalSince1970 * 1000)
      let optimisticMessage = MobileChatMessage(
        id: nil,
        timestamp: optimisticTimestamp,
        role: "user",
        content: trimmed
      )
      if var optimisticChat = selectedChat {
        optimisticChat.messages.append(optimisticMessage)
        optimisticChat.updatedAt = optimisticTimestamp
        selectedChat = optimisticChat
        upsertChatSummary(from: optimisticChat)
      }

      selectedChat = try await api.sendChatMessage(threadID: threadID, text: trimmed)
      if let selectedChat {
        upsertChatSummary(from: selectedChat)
      }
      if let assistantReply = selectedChat?.messages.last(where: { $0.role == "assistant" })?.content,
         let chatTitle = selectedChat?.thread.title ?? selectedChat?.thread.subtitle {
        WatchSyncCoordinator.shared.sendChatNotification(
          threadID: threadID,
          title: chatTitle,
          body: assistantReply
        )
      }
      statusMessage = "Sent message to desktop chat."
      errorMessage = nil
      isSendingChatMessage = false
      return true
    } catch {
      if let previousChat {
        selectedChat = previousChat
        upsertChatSummary(from: previousChat)
      }
      if error is URLError {
        isDesktopReachable = false
      }
      isSendingChatMessage = false
      errorMessage = friendlyMessage(for: error)
      return false
    }
  }

  func startChat(title: String, prompt: String) async -> MobileChatDetail? {
    let trimmed = prompt.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmed.isEmpty, !isSendingChatMessage else { return nil }

    isSendingChatMessage = true
    defer { isSendingChatMessage = false }

    do {
      let chat = try await api.createChat(title: title)
      let detail = try await api.sendChatMessage(threadID: chat.id, text: trimmed)
      selectedChat = detail
      upsertChatSummary(from: detail)
      statusMessage = "Knapsack has your answer ready."
      errorMessage = nil
      return detail
    } catch {
      if error is URLError {
        isDesktopReachable = false
      }
      errorMessage = friendlyMessage(for: error)
      return nil
    }
  }

  private func upsertChatSummary(from chat: MobileChatDetail) {
    let preview = chat.messages.last?.content
    let summary = MobileChatSummary(
      thread: chat.thread,
      preview: preview,
      updatedAt: chat.updatedAt,
      messageCount: chat.messages.count
    )

    if let index = chats.firstIndex(where: { $0.id == summary.id }) {
      chats[index] = summary
    } else {
      chats.insert(summary, at: 0)
    }

    chats.sort { $0.updatedAt > $1.updatedAt }
  }

  private func sendGBrainPrompt(_ prompt: String) async throws -> MobileChatDetail {
    let threadID: UInt64
    if let existing = chats.first(where: { ($0.thread.title ?? "").localizedCaseInsensitiveContains("gbrain") })?.id {
      threadID = existing
    } else if let existing = selectedChat?.id, (selectedChat?.thread.title ?? "").localizedCaseInsensitiveContains("gbrain") {
      threadID = existing
    } else {
      let chat = try await api.createChat(title: "GBrain")
      threadID = chat.id
      selectedChat = chat
      upsertChatSummary(from: chat)
    }

    return try await api.sendChatMessage(threadID: threadID, text: prompt)
  }

  private func statusMessageForAutopilotAction(_ action: MobileAutopilotEmailAction) -> String {
    switch action {
    case .markRead:
      return "Marked email as read."
    case .archive:
      return "Archived email."
    case .delete:
      return "Deleted email."
    case .reply:
      return "Sent reply."
    }
  }

  private func normalizedServerURL(from raw: String) -> URL? {
    let trimmed = raw.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmed.isEmpty else { return nil }
    let candidate = trimmed.contains("://") ? trimmed : "http://\(trimmed)"
    guard let url = URL(string: candidate),
          let scheme = url.scheme?.lowercased(),
          ["http", "https"].contains(scheme),
          url.host() != nil else {
      return nil
    }
    return url
  }

  private static func initialServerURLText(for api: MobileAPI) -> String {
#if targetEnvironment(simulator)
    return api.baseURL.absoluteString
#else
    guard let persistedURL = api.persistedBaseURL else {
      return ""
    }
    return shouldRejectLoopbackURL(persistedURL) ? "" : persistedURL.absoluteString
#endif
  }

  private static func shouldRejectLoopbackURL(_ url: URL) -> Bool {
#if targetEnvironment(simulator)
    false
#else
    MobileAPI.isLoopbackURL(url)
#endif
  }

  private func friendlyMessage(for error: Error) -> String {
    if let apiError = error as? MobileAPIError,
       let description = apiError.errorDescription {
      return description
    }

    if error is DecodingError {
      return "Knapsack received a response it could not read yet. Please try again."
    }

    let message = error.localizedDescription.trimmingCharacters(in: .whitespacesAndNewlines)
    if message.localizedCaseInsensitiveContains("The data couldn’t be read") ||
      message.localizedCaseInsensitiveContains("The data couldn't be read") {
      return "Knapsack received a response it could not read yet. Please try again."
    }

    return message.isEmpty ? "Something went wrong. Please try again." : message
  }
}

struct DiscoveredDesktop: Identifiable, Equatable {
  let id: String
  let name: String
  let url: URL
  let hostName: String
  let pairingToken: String?
}

@MainActor
final class DesktopDiscoveryCoordinator: NSObject, ObservableObject {
  @Published private(set) var desktops: [DiscoveredDesktop] = []
  @Published private(set) var statusText: String?

  var preferredDesktop: DiscoveredDesktop? {
    desktops.first
  }

  private let browser = NetServiceBrowser()
  private var services: [String: NetService] = [:]
  private var isBrowsing = false

  override init() {
    super.init()
    browser.delegate = self
  }

  deinit {
    browser.stop()
  }

  func startBrowsing() {
    guard !isBrowsing else { return }
    isBrowsing = true
    statusText = "Looking for your desktop nearby…"
    browser.searchForServices(ofType: "_knapsack-mobile._tcp.", inDomain: "local.")
  }

  func stopBrowsing() {
    browser.stop()
    services.values.forEach { $0.stop() }
    services.removeAll()
    desktops.removeAll()
    isBrowsing = false
    statusText = nil
  }

  private func serviceID(for service: NetService) -> String {
    "\(service.domain)|\(service.type)|\(service.name)"
  }

  private func updateService(_ service: NetService) {
    guard let hostName = service.hostName?.trimmingCharacters(in: CharacterSet(charactersIn: ".")),
          !hostName.isEmpty,
          service.port > 0,
          let url = URL(string: "http://\(hostName):\(service.port)") else {
      return
    }

    let txtRecord = NetService.dictionary(fromTXTRecord: service.txtRecordData() ?? Data())
    let discovered = DiscoveredDesktop(
      id: serviceID(for: service),
      name: txtRecord["name"].flatMap { String(data: $0, encoding: .utf8) } ?? service.name,
      url: url,
      hostName: hostName,
      pairingToken: txtRecord["pairingToken"].flatMap { String(data: $0, encoding: .utf8) }
    )

    if let index = desktops.firstIndex(where: { $0.id == discovered.id }) {
      desktops[index] = discovered
    } else {
      desktops.append(discovered)
      desktops.sort { $0.name.localizedCaseInsensitiveCompare($1.name) == .orderedAscending }
    }

    statusText = "Found \(desktops.count) nearby desktop\(desktops.count == 1 ? "" : "s")."
  }
}

@MainActor
extension DesktopDiscoveryCoordinator: NetServiceBrowserDelegate, NetServiceDelegate {
  func netServiceBrowserWillSearch(_ browser: NetServiceBrowser) {
    statusText = "Looking for your desktop nearby…"
  }

  func netServiceBrowser(_ browser: NetServiceBrowser, didFind service: NetService, moreComing: Bool) {
    let id = serviceID(for: service)
    services[id] = service
    service.delegate = self
    service.resolve(withTimeout: 5)
  }

  func netServiceBrowser(_ browser: NetServiceBrowser, didRemove service: NetService, moreComing: Bool) {
    let id = serviceID(for: service)
    services.removeValue(forKey: id)
    desktops.removeAll { $0.id == id }
    if desktops.isEmpty {
      statusText = "No desktop found yet."
    }
  }

  func netServiceBrowser(_ browser: NetServiceBrowser, didNotSearch errorDict: [String : NSNumber]) {
    statusText = "Desktop discovery is unavailable on this network."
  }

  func netServiceDidResolveAddress(_ sender: NetService) {
    updateService(sender)
  }

  func netService(_ sender: NetService, didUpdateTXTRecord data: Data) {
    updateService(sender)
  }

  func netService(_ sender: NetService, didNotResolve errorDict: [String : NSNumber]) {
    if desktops.isEmpty {
      statusText = "Waiting for Knapsack on your Mac…"
    }
  }
}
