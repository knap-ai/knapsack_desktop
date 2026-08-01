import Foundation

@MainActor
final class MeetingListViewModel: ObservableObject {
  @Published var session: MobileLinkedSession?
  @Published var calendarEvents: [MobileCalendarEventSummary] = []
  @Published var meetings: [MobileMeetingDetail] = []
  @Published var selectedMeeting: MobileMeetingDetail?
  @Published var chats: [MobileChatSummary] = []
  @Published var selectedChat: MobileChatDetail?
  @Published var isSendingChatMessage = false
  @Published var isConnectingToDesktop = false
  @Published var serverURLText: String
  @Published var pairingCodeText: String
  @Published var errorMessage: String?
  @Published var statusMessage: String?
  private var lastAutoConnectedDesktopID: String?

  private let api: MobileAPI

  init(api: MobileAPI = .shared) {
    self.api = api
    self.serverURLText = Self.initialServerURLText(for: api)
    self.pairingCodeText = api.pairingToken
  }

  var currentMeetingID: UInt64? {
    selectedMeeting?.id
  }

  func refresh() async {
    if shouldWaitForDesktopLink {
      session = nil
      calendarEvents = []
      chats = []
      meetings = []
      selectedMeeting = nil
      selectedChat = nil
      statusMessage = "Open Knapsack on your Mac and keep this screen open. Your desktop should appear automatically."
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
    } catch {
      errorMessage = error.localizedDescription
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
      api.pairingToken = pairingCodeText
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
    api.pairingToken = pairingCodeText

    do {
      let linkedSession = try await api.getSession()
      session = linkedSession
      statusMessage = linkedSession.linked
        ? "Connected to your desktop as \(linkedSession.profile?.email ?? "your Knapsack account")."
        : "Connected to desktop. Finish signing in on your Mac to sync chats, meetings, and calendar."
      errorMessage = nil
      await refresh()
    } catch {
      errorMessage = "Could not authenticate with Knapsack Desktop. Copy the Mobile pairing code from Settings on your Mac, then try again."
    }

    isConnectingToDesktop = false
  }

  func adoptDiscoveredDesktop(_ desktop: DiscoveredDesktop?) async {
    guard let desktop else { return }

    if serverURLText != desktop.url.absoluteString {
      serverURLText = desktop.url.absoluteString
      statusMessage = "Found \(desktop.name) nearby."
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
      errorMessage = error.localizedDescription
    }
  }

  func createMeetingForRecordingIfNeeded() async -> MobileMeetingDetail? {
    if let selectedMeeting {
      return selectedMeeting
    }
    do {
      let created = try await api.createMeeting(title: "Recorded from iPhone", subtitle: nil, sourceDevice: "iphone")
      selectedMeeting = created
      await refresh()
      statusMessage = "Prepared meeting \(created.id) for recording."
      return created
    } catch {
      errorMessage = error.localizedDescription
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
      errorMessage = error.localizedDescription
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
      errorMessage = error.localizedDescription
    }
  }

  func selectChat(_ chat: MobileChatSummary) async {
    do {
      selectedChat = try await api.getChat(threadID: chat.id)
      statusMessage = "Loaded chat \(chat.id)."
      errorMessage = nil
    } catch {
      errorMessage = error.localizedDescription
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
      errorMessage = error.localizedDescription
    }
  }

  func sendChatMessage(_ text: String) async -> Bool {
    let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmed.isEmpty else { return false }

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

      selectedChat = try await api.sendChatMessage(threadID: threadID, text: trimmed)
      chats = try await api.listChats()
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
      isSendingChatMessage = false
      errorMessage = error.localizedDescription
      return false
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
}

struct DiscoveredDesktop: Identifiable, Equatable {
  let id: String
  let name: String
  let url: URL
  let hostName: String
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
      hostName: hostName
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
