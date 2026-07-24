import AVFoundation
import Foundation

@MainActor
final class WatchRecorder: NSObject, ObservableObject {
  @Published var isRecording = false
  @Published var lastFileURL: URL?
  @Published var statusText = "Ready"

  private var recorder: AVAudioRecorder?
  private(set) var startedAt: Date?
  private(set) var endedAt: Date?

  func start() throws {
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
    recorder?.record()
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
}
