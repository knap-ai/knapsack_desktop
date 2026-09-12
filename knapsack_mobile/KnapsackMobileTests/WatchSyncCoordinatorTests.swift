import XCTest
@testable import KnapsackMobileApp

final class WatchSyncCoordinatorTests: XCTestCase {
  func testAvailabilityClearlySeparatesOnlineFromOfflineCapability() {
    let lastSync = Date(timeIntervalSince1970: 1_800_000_000)

    XCTAssertTrue(MobileServiceAvailability.desktopOnline.supportsLiveActions)
    XCTAssertFalse(MobileServiceAvailability.offlineReady(lastSync: lastSync).supportsLiveActions)
    XCTAssertTrue(MobileServiceAvailability.desktopOnline.title.contains("all features"))
    XCTAssertTrue(MobileServiceAvailability.offlineReady(lastSync: lastSync).title.contains("notes and recording"))
    XCTAssertTrue(MobileServiceAvailability.offlineReady(lastSync: lastSync).detail.contains("Last synced"))
    XCTAssertEqual(MobileServiceAvailability.desktopNeedsSignIn.title, "Desktop found - sign in required")
  }

  func testMeetingDisplayTitleFallsBackToDesktopSubtitle() {
    let meeting = MobileMeetingDetail(
      thread: MobileThread(
        id: 42,
        timestamp: 1_789_000_000_000,
        hideFollowUp: nil,
        feedItemId: 9,
        title: "",
        subtitle: "Tiendas Neto Discussion",
        threadType: "MEETING NOTES",
        recorded: true,
        savedTranscript: nil,
        promptTemplate: nil
      ),
      metadata: MobileMeetingMetadata(
        threadId: 42,
        status: .ready,
        sourceDevice: "desktop",
        latestAudioFile: nil,
        notesPreview: "Decisions and actions",
        startedAt: nil,
        endedAt: nil,
        updatedAt: 1_789_000_100
      ),
      notes: "Meeting notes"
    )

    XCTAssertEqual(meeting.displayTitle, "Tiendas Neto Discussion")
    XCTAssertEqual(meeting.displayTimestamp, 1_789_000_000_000)
  }

  func testStarterTeamAlwaysIncludesScout() {
    XCTAssertEqual(MobileTeamRoster.starter.agents.first?.id, "scout")
    XCTAssertEqual(MobileTeamRoster.starter.agents.first?.displayName, "Scout")
    XCTAssertGreaterThanOrEqual(MobileTeamRoster.starter.agents.count, 4)
  }

  func testFutureMeetingPrepUsesEventSpecificTitleAndContext() {
    let event = MobileCalendarEventSummary(
      id: 77,
      eventId: "calendar-event-77",
      title: "Board planning",
      description: "Review hiring plan",
      location: "Conference room",
      start: 1_800_000_000,
      end: 1_800_003_600,
      googleMeetURL: nil,
      calendarAccountEmail: "mark@example.com",
      meetingThreadId: nil,
      notesPreview: nil,
      prepChatThreadId: nil,
      prepPreview: nil
    )

    XCTAssertTrue(event.prepConversationTitle.contains("Board planning"))
    XCTAssertTrue(event.prepPrompt.contains("Review hiring plan"))
    XCTAssertTrue(event.prepPrompt.contains("Conference room"))
  }

  private let appGroupOverrideEnv = "KNAPSACK_MOBILE_APP_GROUP_ROOT"
  private let mobileCacheKeys = [
    "knapsack.mobile.fallback.meetings",
    "knapsack.mobile.fallback.chats",
    "knapsack.mobile.fallback.chatDetails",
    "knapsack.mobile.fallback.calendar",
    "knapsack.mobile.fallback.session",
  ]

  override func setUp() {
    super.setUp()
    URLProtocol.registerClass(MockURLProtocol.self)
    MockURLProtocol.reset()
    UserDefaults.standard.removeObject(forKey: "knapsack.mobile.baseURL")
    mobileCacheKeys.forEach { UserDefaults.standard.removeObject(forKey: $0) }
  }

  override func tearDown() {
    unsetenv(appGroupOverrideEnv)
    UserDefaults.standard.removeObject(forKey: "knapsack.mobile.baseURL")
    mobileCacheKeys.forEach { UserDefaults.standard.removeObject(forKey: $0) }
    MockURLProtocol.reset()
    URLProtocol.unregisterClass(MockURLProtocol.self)
    super.tearDown()
  }

  @MainActor
  func testImportPendingSharedRecordingsRunsWatchToPhoneSyncFlow() async throws {
    let tempRoot = FileManager.default.temporaryDirectory
      .appendingPathComponent(UUID().uuidString, isDirectory: true)
    try FileManager.default.createDirectory(at: tempRoot, withIntermediateDirectories: true)
    setenv(appGroupOverrideEnv, tempRoot.path, 1)

    let sourceFile = tempRoot.appendingPathComponent("sample.m4a")
    try Data("audio".utf8).write(to: sourceFile)

    let startedAt = Date(timeIntervalSince1970: 1_720_000_000)
    let endedAt = Date(timeIntervalSince1970: 1_720_000_120)
    _ = try WatchSharedBridge.enqueueRecording(
      from: sourceFile,
      sourceDevice: "watch",
      startedAt: startedAt,
      endedAt: endedAt
    )

    MobileAPI.shared.baseURL = URL(string: "https://knapsack.test")!
    let expectedStartedAt = Int64(startedAt.timeIntervalSince1970)
    let expectedEndedAt = Int64(endedAt.timeIntervalSince1970)

    MockURLProtocol.requestHandler = { request in
      let path = request.url?.path ?? ""
      switch (request.httpMethod ?? "GET", path) {
      case ("POST", "/api/knapsack/mobile/meetings"):
        if let body = Self.bodyData(for: request) {
          let create = try JSONDecoder().decode(CreateMeetingRequest.self, from: body)
          XCTAssertEqual(create.title, "Watch note")
          XCTAssertEqual(create.subtitle, "Imported from Apple Watch")
          XCTAssertEqual(create.sourceDevice, "watch")
        }

        let meeting = MobileMeetingDetail(
          thread: MobileThread(
            id: 101,
            timestamp: expectedStartedAt,
            hideFollowUp: false,
            feedItemId: nil,
            title: "Watch note",
            subtitle: "Imported from Apple Watch",
            threadType: "MEETING NOTES",
            recorded: false,
            savedTranscript: nil,
            promptTemplate: nil
          ),
          metadata: MobileMeetingMetadata(
            threadId: 101,
            status: .created,
            sourceDevice: "watch",
            latestAudioFile: nil,
            notesPreview: nil,
            startedAt: nil,
            endedAt: nil,
            updatedAt: expectedStartedAt
          ),
          notes: nil
        )
        return try Self.jsonResponse(APIEnvelope(success: true, data: meeting, error: nil))

      case ("POST", "/api/knapsack/mobile/meetings/101/status"):
        let body = try XCTUnwrap(Self.bodyData(for: request))
        let status = try JSONDecoder().decode(UpdateStatusRequest.self, from: body)
        XCTAssertEqual(status.status, .syncingToPhone)
        XCTAssertEqual(status.sourceDevice, "watch")
        XCTAssertEqual(status.startedAt, expectedStartedAt)
        XCTAssertEqual(status.endedAt, expectedEndedAt)

        let metadata = MobileMeetingMetadata(
          threadId: 101,
          status: .syncingToPhone,
          sourceDevice: "watch",
          latestAudioFile: nil,
          notesPreview: nil,
          startedAt: expectedStartedAt,
          endedAt: expectedEndedAt,
          updatedAt: expectedStartedAt
        )
        return try Self.jsonResponse(APIEnvelope(success: true, data: metadata, error: nil))

      case ("POST", "/api/knapsack/mobile/meetings/101/recording"):
        let body = try XCTUnwrap(Self.bodyData(for: request))
        let bodyText = String(decoding: body, as: UTF8.self)
        XCTAssertTrue(bodyText.contains("name=\"sourceDevice\""))
        XCTAssertTrue(bodyText.contains("\r\nwatch\r\n"))
        XCTAssertTrue(bodyText.contains("name=\"startedAt\""))
        XCTAssertTrue(bodyText.contains(String(expectedStartedAt)))
        XCTAssertTrue(bodyText.contains("name=\"endedAt\""))
        XCTAssertTrue(bodyText.contains(String(expectedEndedAt)))
        XCTAssertTrue(bodyText.contains("filename=\""))
        XCTAssertTrue(bodyText.contains("Content-Type: audio/m4a"))

        let metadata = MobileMeetingMetadata(
          threadId: 101,
          status: .uploaded,
          sourceDevice: "watch",
          latestAudioFile: "/tmp/101-sample.m4a",
          notesPreview: nil,
          startedAt: expectedStartedAt,
          endedAt: expectedEndedAt,
          updatedAt: expectedEndedAt
        )
        return try Self.jsonResponse(APIEnvelope(success: true, data: metadata, error: nil))

      default:
        XCTFail("Unexpected request: \((request.httpMethod ?? "GET")) \(path)")
        throw URLError(.unsupportedURL)
      }
    }

    let coordinator = WatchSyncCoordinator.shared
    coordinator.lastSyncMessage = nil

    await coordinator.importPendingSharedRecordings()

    XCTAssertEqual(coordinator.lastSyncMessage, "Imported 1 watch clip.")
    XCTAssertEqual(try WatchSharedBridge.pendingRecordings().count, 0)
    XCTAssertEqual(MockURLProtocol.seenRequests.map { "\($0.httpMethod ?? "GET") \($0.url?.path ?? "")" }, [
      "POST /api/knapsack/mobile/meetings",
      "POST /api/knapsack/mobile/meetings/101/status",
      "POST /api/knapsack/mobile/meetings/101/recording",
    ])
  }

  func testWatchSharedBridgeRoundTripsPendingRecording() throws {
    let tempRoot = FileManager.default.temporaryDirectory
      .appendingPathComponent(UUID().uuidString, isDirectory: true)
    try FileManager.default.createDirectory(at: tempRoot, withIntermediateDirectories: true)
    setenv(appGroupOverrideEnv, tempRoot.path, 1)

    let sourceFile = tempRoot.appendingPathComponent("bridge.m4a")
    try Data("bridge".utf8).write(to: sourceFile)

    let entry = try WatchSharedBridge.enqueueRecording(
      from: sourceFile,
      sourceDevice: "watch",
      startedAt: nil,
      endedAt: nil
    )

    let pending = try WatchSharedBridge.pendingRecordings()
    XCTAssertEqual(pending.map(\.id), [entry.id])
    XCTAssertTrue(FileManager.default.fileExists(atPath: try WatchSharedBridge.recordingFileURL(for: entry).path))

    try WatchSharedBridge.remove(entry)
    XCTAssertTrue(try WatchSharedBridge.pendingRecordings().isEmpty)
  }

  func testLinkedSessionAndCalendarRemainAvailableOffline() async throws {
    MobileAPI.shared.baseURL = URL(string: "https://knapsack.test")!
    let session = MobileLinkedSession(
      linked: true,
      profile: MobileLinkedProfile(
        email: "person@knapsack.test",
        name: "Test Person",
        uuid: "user-1",
        provider: "google",
        profileImage: nil,
        sharingPermission: nil
      ),
      connectionScopes: ["google_calendar_read"],
      calendarConnected: true,
      emailConnected: false,
      driveConnected: false,
      desktopLabel: "Linked to desktop"
    )
    let event = MobileCalendarEventSummary(
      id: 77,
      eventId: "calendar-77",
      title: "Customer review",
      description: nil,
      location: nil,
      start: 1_780_000_000,
      end: 1_780_003_600,
      googleMeetURL: nil,
      calendarAccountEmail: "person@knapsack.test",
      meetingThreadId: 501,
      notesPreview: "Decided to ship the pilot.",
      prepChatThreadId: 601,
      prepPreview: "Ask about rollout timing."
    )

    MockURLProtocol.requestHandler = { request in
      switch request.url?.path {
      case "/api/knapsack/mobile/session":
        return try Self.jsonResponse(APIEnvelope(success: true, data: session, error: nil))
      case "/api/knapsack/mobile/calendar":
        return try Self.jsonResponse(APIEnvelope(success: true, data: [event], error: nil))
      default:
        throw URLError(.unsupportedURL)
      }
    }

    _ = try await MobileAPI.shared.getSession()
    _ = try await MobileAPI.shared.listCalendarEvents()
    let cached = MobileAPI.shared.loadCachedWorkspace()

    XCTAssertEqual(cached.session?.profile?.email, "person@knapsack.test")
    XCTAssertEqual(cached.calendarEvents.first?.meetingThreadId, 501)
    XCTAssertEqual(cached.calendarEvents.first?.prepChatThreadId, 601)
  }

  private static func jsonResponse<T: Codable>(
    _ payload: APIEnvelope<T>
  ) throws -> (HTTPURLResponse, Data) {
    let response = HTTPURLResponse(
      url: URL(string: "https://knapsack.test")!,
      statusCode: 200,
      httpVersion: nil,
      headerFields: ["Content-Type": "application/json"]
    )!
    return (response, try JSONEncoder().encode(payload))
  }

  private static func bodyData(for request: URLRequest) -> Data? {
    if let body = request.httpBody {
      return body
    }
    guard let stream = request.httpBodyStream else {
      return nil
    }
    stream.open()
    defer { stream.close() }
    var data = Data()
    let bufferSize = 4096
    let buffer = UnsafeMutablePointer<UInt8>.allocate(capacity: bufferSize)
    defer { buffer.deallocate() }
    while stream.hasBytesAvailable {
      let read = stream.read(buffer, maxLength: bufferSize)
      if read <= 0 {
        break
      }
      data.append(buffer, count: read)
    }
    return data.isEmpty ? nil : data
  }
}

private final class MockURLProtocol: URLProtocol {
  static var requestHandler: ((URLRequest) throws -> (HTTPURLResponse, Data))?
  static var seenRequests: [URLRequest] = []

  static func reset() {
    requestHandler = nil
    seenRequests = []
  }

  override class func canInit(with request: URLRequest) -> Bool {
    request.url?.host == "knapsack.test"
  }

  override class func canonicalRequest(for request: URLRequest) -> URLRequest {
    request
  }

  override func startLoading() {
    guard let handler = Self.requestHandler else {
      client?.urlProtocol(self, didFailWithError: URLError(.badServerResponse))
      return
    }

    do {
      Self.seenRequests.append(request)
      let (response, data) = try handler(request)
      client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
      client?.urlProtocol(self, didLoad: data)
      client?.urlProtocolDidFinishLoading(self)
    } catch {
      client?.urlProtocol(self, didFailWithError: error)
    }
  }

  override func stopLoading() {}
}
