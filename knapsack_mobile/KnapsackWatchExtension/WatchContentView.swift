import SwiftUI

struct WatchContentView: View {
  @StateObject private var recorder = WatchRecorder()
  @StateObject private var syncManager = WatchSyncManager.shared

  var body: some View {
    ZStack {
      LinearGradient(
        colors: [
          Color(red: 0.12, green: 0.21, blue: 0.23),
          Color(red: 0.02, green: 0.10, blue: 0.12)
        ],
        startPoint: .top,
        endPoint: .bottom
      )
      .ignoresSafeArea()

      VStack(spacing: 9) {
        HStack {
          Image("BrandMark")
            .resizable()
            .scaledToFit()
            .frame(width: 15, height: 15)
            .padding(5)
            .background(Color.white.opacity(0.10))
            .clipShape(Circle())

          Spacer()

          HStack(spacing: 4) {
            Circle()
              .fill(recorder.isRecording ? KnapsackBrand.coral : KnapsackBrand.amber)
              .frame(width: 6, height: 6)
            Text(recorder.isRecording ? "Recording" : "Ready")
          }
          .font(KnapsackBrand.inter(10, weight: .bold))
          .foregroundStyle(.white.opacity(0.82))
        }

        Spacer(minLength: 0)

        Button {
          toggleRecording()
        } label: {
          ZStack {
            Circle()
              .fill(Color.white.opacity(0.09))
              .frame(width: 92, height: 92)

            Circle()
              .fill(
                recorder.isRecording
                  ? AnyShapeStyle(KnapsackBrand.coral)
                  : AnyShapeStyle(KnapsackBrand.heroGradient)
              )
              .frame(width: 72, height: 72)

            VStack(spacing: 3) {
              Image(systemName: recorder.isRecording ? "stop.fill" : "mic.fill")
                .font(.system(size: 20, weight: .semibold))
              Text(recorder.isRecording ? "Stop" : "Record")
                .font(KnapsackBrand.inter(11, weight: .bold))
            }
            .foregroundStyle(recorder.isRecording ? .white : KnapsackBrand.ink)
          }
        }
        .buttonStyle(.plain)

        Text(recorder.isRecording ? "Capturing this meeting" : "Start a meeting note")
          .font(KnapsackBrand.inter(12, weight: .semibold))
          .foregroundStyle(.white)
          .multilineTextAlignment(.center)

        if recorder.lastFileURL != nil && !recorder.isRecording {
          Button {
            sendLastNote()
          } label: {
            Label("Send last note", systemImage: "arrow.up.circle.fill")
              .font(KnapsackBrand.inter(11, weight: .semibold))
              .foregroundStyle(.white)
              .padding(.horizontal, 12)
              .padding(.vertical, 7)
              .background(Capsule().fill(Color.white.opacity(0.11)))
          }
          .buttonStyle(.plain)
        }

        Spacer(minLength: 0)

        if let activityText {
          HStack(spacing: 6) {
            Image(systemName: syncManager.latestChatNotification == nil ? "iphone" : "bubble.left.fill")
              .font(.system(size: 10, weight: .semibold))
            Text(activityText)
              .lineLimit(1)
          }
          .font(KnapsackBrand.inter(10, weight: .medium))
          .foregroundStyle(.white.opacity(0.68))
        }
      }
      .padding(.horizontal, 15)
      .padding(.vertical, 9)
    }
    .onAppear {
      syncManager.activate()
    }
  }

  private var activityText: String? {
    if let notification = syncManager.latestChatNotification {
      return "Reply from \(notification.title)"
    }
    if syncManager.status != "Ready" {
      return syncManager.status
    }
    return recorder.statusText == "Ready" ? nil : recorder.statusText
  }

  private func toggleRecording() {
    if recorder.isRecording {
      recorder.stop()
      return
    }
    Task {
      do {
        try await recorder.start()
      } catch {
        recorder.statusText = error.localizedDescription
      }
    }
  }

  private func sendLastNote() {
    guard let fileURL = recorder.lastFileURL else { return }
    syncManager.transferRecording(
      fileURL: fileURL,
      startedAt: recorder.startedAt,
      endedAt: recorder.endedAt
    )
  }
}
