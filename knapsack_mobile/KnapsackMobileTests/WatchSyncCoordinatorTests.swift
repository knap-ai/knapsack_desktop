import XCTest
@testable import KnapsackMobileApp

final class WatchSyncCoordinatorTests: XCTestCase {
  private let appGroupOverrideEnv = "KNAPSACK_MOBILE_APP_GROUP_ROOT"

  override func setUp() {
    super.setUp()
    URLProtocol.registerClass(MockURLProtocol.self)
    MockURLProtocol.reset()
    UserDefaults.standard.removeObject(forKey: "knapsack.mobile.baseURL")
    UserDefaults.standard.removeObject(forKey: "knapsack.mobile.fallback.meetings")
  }

  override func tearDown() {
    unsetenv(appGroupOverrideEnv)
    UserDefaults.standard.removeObject(forKey: "knapsack.mobile.baseURL")
    UserDefaults.standard.removeObject(forKey: "knapsack.mobile.fallback.meetings")
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
