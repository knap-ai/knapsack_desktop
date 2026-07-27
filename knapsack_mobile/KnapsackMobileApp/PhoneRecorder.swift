import AVFoundation
import Foundation

@MainActor
final class PhoneRecorder: NSObject, ObservableObject {
  @Published var isRecording = false
  @Published var currentFileURL: URL?

  private var recorder: AVAudioRecorder?
  private(set) var recordingStartedAt: Date?
  private(set) var recordingEndedAt: Date?

  func start() throws {
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
    recorder?.record()
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
}
