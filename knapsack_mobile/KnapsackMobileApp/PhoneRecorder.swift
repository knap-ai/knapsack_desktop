import AVFoundation
import Foundation

enum RecorderStartError: LocalizedError {
  case microphonePermissionDenied
  case recorderFailedToStart

  var errorDescription: String? {
    switch self {
    case .microphonePermissionDenied:
      return "Microphone access is required to record notes."
    case .recorderFailedToStart:
      return "Knapsack could not start recording. Please try again."
    }
  }
}

@MainActor
final class PhoneRecorder: NSObject, ObservableObject {
  @Published var isRecording = false
  @Published var currentFileURL: URL?

  private var recorder: AVAudioRecorder?
  private(set) var recordingStartedAt: Date?
  private(set) var recordingEndedAt: Date?

  func start() async throws {
    guard try await ensureMicrophonePermission() else {
      throw RecorderStartError.microphonePermissionDenied
    }

    let session = AVAudioSession.sharedInstance()
    try session.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker])
    try session.setActive(true)

    let url = FileManager.default.temporaryDirectory
      .appendingPathComponent(UUID().uuidString)
      .appendingPathExtension("m4a")
    let settings: [String: Any] = [
      AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
      AVSampleRateKey: 44_100,
      AVNumberOfChannelsKey: 1,
      AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue,
    ]

    recorder = try AVAudioRecorder(url: url, settings: settings)
    recorder?.prepareToRecord()
    guard recorder?.record() == true else {
      throw RecorderStartError.recorderFailedToStart
    }
    currentFileURL = url
    recordingStartedAt = Date()
    recordingEndedAt = nil
    isRecording = true
  }

  func stop() {
    recorder?.stop()
    recordingEndedAt = Date()
    isRecording = false
  }

  private func ensureMicrophonePermission() async throws -> Bool {
    let session = AVAudioSession.sharedInstance()
    switch session.recordPermission {
    case .granted:
      return true
    case .denied:
      return false
    case .undetermined:
      return await withCheckedContinuation { continuation in
        session.requestRecordPermission { granted in
          continuation.resume(returning: granted)
        }
      }
    @unknown default:
      return false
    }
  }
}
