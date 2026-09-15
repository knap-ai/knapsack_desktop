import Foundation

enum RealtimeVoiceTarget: Equatable, Codable {
  case scout(conversationID: String?)
  case conversation(id: String, title: String)
  case meetingPrep(eventID: String, title: String)
  case ideaCapture

  private enum CodingKeys: String, CodingKey {
    case kind
    case id
    case title
  }

  private enum Kind: String, Codable {
    case scout
    case conversation
    case meetingPrep = "meeting_prep"
    case ideaCapture = "idea_capture"
  }

  init(from decoder: Decoder) throws {
    let values = try decoder.container(keyedBy: CodingKeys.self)
    switch try values.decode(Kind.self, forKey: .kind) {
    case .scout:
      self = .scout(conversationID: try values.decodeIfPresent(String.self, forKey: .id))
    case .conversation:
      self = .conversation(
        id: try values.decode(String.self, forKey: .id),
        title: try values.decode(String.self, forKey: .title)
      )
    case .meetingPrep:
      self = .meetingPrep(
        eventID: try values.decode(String.self, forKey: .id),
        title: try values.decode(String.self, forKey: .title)
      )
    case .ideaCapture:
      self = .ideaCapture
    }
  }

  func encode(to encoder: Encoder) throws {
    var values = encoder.container(keyedBy: CodingKeys.self)
    switch self {
    case .scout(let conversationID):
      try values.encode(Kind.scout, forKey: .kind)
      try values.encodeIfPresent(conversationID, forKey: .id)
    case .conversation(let id, let title):
      try values.encode(Kind.conversation, forKey: .kind)
      try values.encode(id, forKey: .id)
      try values.encode(title, forKey: .title)
    case .meetingPrep(let eventID, let title):
      try values.encode(Kind.meetingPrep, forKey: .kind)
      try values.encode(eventID, forKey: .id)
      try values.encode(title, forKey: .title)
    case .ideaCapture:
      try values.encode(Kind.ideaCapture, forKey: .kind)
    }
  }
}

struct RealtimeVoiceSessionRequest: Codable, Equatable {
  var target: RealtimeVoiceTarget
  var client: String
  var surface: String
  var capabilities: [String]
  var resumeSessionID: String?

  private enum CodingKeys: String, CodingKey {
    case target
    case client
    case surface
    case capabilities
    case resumeSessionID = "resume_session_id"
  }

  init(target: RealtimeVoiceTarget, surface: String, resumeSessionID: String? = nil) {
    self.target = target
    self.client = "knapsack_mobile"
    self.surface = surface
    self.capabilities = [
      "audio_input",
      "audio_output",
      "text_fallback",
      "interrupt",
      "semantic_turn_detection",
    ]
    self.resumeSessionID = resumeSessionID
  }
}

struct RealtimeVoiceSessionBootstrap: Codable, Equatable {
  var sessionID: String
  var conversationID: String
  var websocketURL: URL
  var clientSecret: String
  var expiresAt: Date

  private enum CodingKeys: String, CodingKey {
    case sessionID = "session_id"
    case conversationID = "conversation_id"
    case websocketURL = "websocket_url"
    case clientSecret = "client_secret"
    case expiresAt = "expires_at"
  }
}

enum RealtimeVoiceClientEvent: Equatable {
  case audio(Data)
  case mute(Bool)
  case text(String)
  case interrupt
  case close
}

enum RealtimeVoiceServerEvent: Equatable {
  case connected(sessionID: String, conversationID: String)
  case listening
  case thinking
  case speaking
  case inputTranscriptDelta(String)
  case outputTranscriptDelta(String)
  case audio(Data)
  case toolStarted(name: String)
  case toolFinished(name: String)
  case reconnecting
  case reconnected
  case closed
  case failed(String)
}

enum RealtimeVoicePhase: Equatable {
  case idle
  case connecting
  case listening
  case thinking
  case speaking
  case reconnecting
  case unavailable(String)
  case ended

  var title: String {
    switch self {
    case .idle: return "Ready"
    case .connecting: return "Connecting securely"
    case .listening: return "Listening"
    case .thinking: return "Scout is thinking"
    case .speaking: return "Scout is speaking"
    case .reconnecting: return "Reconnecting"
    case .unavailable: return "Voice unavailable"
    case .ended: return "Conversation ended"
    }
  }
}

struct RealtimeVoiceSessionState: Equatable {
  var phase: RealtimeVoicePhase = .idle
  var sessionID: String?
  var conversationID: String?
  var isMuted = false
  var inputTranscript = ""
  var outputTranscript = ""

  mutating func begin() {
    phase = .connecting
    inputTranscript = ""
    outputTranscript = ""
  }

  mutating func reduce(_ event: RealtimeVoiceServerEvent) {
    switch event {
    case .connected(let sessionID, let conversationID):
      self.sessionID = sessionID
      self.conversationID = conversationID
      phase = .listening
    case .listening:
      phase = .listening
    case .thinking, .toolStarted, .toolFinished:
      phase = .thinking
    case .speaking, .audio:
      phase = .speaking
    case .inputTranscriptDelta(let delta):
      inputTranscript.append(delta)
    case .outputTranscriptDelta(let delta):
      outputTranscript.append(delta)
    case .reconnecting:
      phase = .reconnecting
    case .reconnected:
      phase = .listening
    case .closed:
      phase = .ended
    case .failed(let message):
      phase = .unavailable(message)
    }
  }
}

protocol RealtimeVoiceSessionTransport: AnyObject {
  var events: AsyncStream<RealtimeVoiceServerEvent> { get }
  func connect(request: RealtimeVoiceSessionRequest) async throws
  func send(_ event: RealtimeVoiceClientEvent) async throws
}

@MainActor
final class RealtimeVoiceSessionController: ObservableObject {
  @Published private(set) var state = RealtimeVoiceSessionState()

  private let transport: RealtimeVoiceSessionTransport
  private var eventTask: Task<Void, Never>?

  init(transport: RealtimeVoiceSessionTransport) {
    self.transport = transport
  }

  func start(
    target: RealtimeVoiceTarget,
    surface: String,
    resumeSessionID: String? = nil
  ) {
    state.begin()
    eventTask?.cancel()
    let request = RealtimeVoiceSessionRequest(
      target: target,
      surface: surface,
      resumeSessionID: resumeSessionID
    )
    eventTask = Task { [weak self] in
      guard let self else { return }
      do {
        try await transport.connect(request: request)
        for await event in transport.events {
          guard !Task.isCancelled else { return }
          state.reduce(event)
        }
      } catch {
        state.reduce(.failed(error.localizedDescription))
      }
    }
  }

  func setMuted(_ muted: Bool) {
    state.isMuted = muted
    Task { try? await transport.send(.mute(muted)) }
  }

  func sendText(_ text: String) {
    Task { try? await transport.send(.text(text)) }
  }

  func interrupt() {
    Task { try? await transport.send(.interrupt) }
  }

  func stop() {
    eventTask?.cancel()
    eventTask = nil
    Task { try? await transport.send(.close) }
    state.reduce(.closed)
  }
}
