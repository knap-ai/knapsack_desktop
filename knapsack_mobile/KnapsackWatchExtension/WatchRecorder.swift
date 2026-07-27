import AVFoundation
import Foundation

enum WatchRecorderStartError: LocalizedError {
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
final class WatchRecorder: NSObject, ObservableObject {
  @Published var isRecording = false
  @Published var lastFileURL: URL?
  @Published var statusText = "Ready"

  private var recorder: AVAudioRecorder?
  private(set) var startedAt: Date?
  private(set) var endedAt: Date?

  func start() async throws {
    guard try await ensureMicrophonePermission() else {
      throw WatchRecorderStartError.microphonePermissionDenied
    }

    let session = AVAudioSession.sharedInstance()
    try session.setCategory(.record, mode: .default)
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
      throw WatchRecorderStartError.recorderFailedToStart
    }
    lastFileURL = url
    startedAt = Date()
    endedAt = nil
    isRecording = true
    statusText = "Recording"
    KnapsackComplicationStore.shared.setRecording(true)
  }

  func stop() {
    recorder?.stop()
    endedAt = Date()
    isRecording = false
    statusText = "Saved on watch"
    KnapsackComplicationStore.shared.setRecording(false)
    KnapsackComplicationStore.shared.setSyncStatus(statusText)
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
