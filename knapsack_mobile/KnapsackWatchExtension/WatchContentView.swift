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

      VStack(spacing: 8) {
        HStack {
          Image("BrandMark")
            .resizable()
            .scaledToFit()
            .frame(width: 16, height: 16)
            .padding(6)
            .background(Color.white.opacity(0.10))
            .clipShape(Circle())
          Spacer()
          Text(recorder.isRecording ? "LIVE" : "READY")
            .font(KnapsackBrand.inter(10, weight: .bold))
            .foregroundStyle(recorder.isRecording ? KnapsackBrand.amber : .white.opacity(0.8))
        }

        Button {
          if recorder.isRecording {
            recorder.stop()
          } else {
            do {
              try recorder.start()
            } catch {
              recorder.statusText = error.localizedDescription
            }
          }
        } label: {
          ZStack {
            Circle()
              .fill(Color.white.opacity(0.10))
              .frame(width: 100, height: 100)

            Circle()
              .fill(recorder.isRecording ? KnapsackBrand.coral : KnapsackBrand.amber)
              .frame(width: 78, height: 78)

            if !recorder.isRecording {
              Circle()
                .fill(KnapsackBrand.heroGradient)
                .frame(width: 78, height: 78)
            }

            VStack(spacing: 4) {
              Image(systemName: recorder.isRecording ? "stop.fill" : "mic.fill")
                .font(.system(size: 22, weight: .semibold))
              Text(recorder.isRecording ? "Stop" : "Start")
                .font(KnapsackBrand.inter(12, weight: .bold))
            }
            .foregroundStyle(recorder.isRecording ? .white : KnapsackBrand.ink)
          }
        }
        .buttonStyle(.plain)

        Text(recorder.isRecording ? "Recording to Knapsack" : "Tap to start a note")
          .font(KnapsackBrand.inter(13, weight: .semibold))
          .foregroundStyle(.white)
          .multilineTextAlignment(.center)

        Text(recorder.statusText)
          .font(KnapsackBrand.inter(11))
          .multilineTextAlignment(.center)
          .foregroundStyle(.white.opacity(0.72))
          .lineLimit(2)

        Button("Sync to iPhone") {
          guard let fileURL = recorder.lastFileURL else { return }
          syncManager.transferRecording(
            fileURL: fileURL,
            startedAt: recorder.startedAt,
            endedAt: recorder.endedAt
          )
        }
        .font(KnapsackBrand.inter(12, weight: .semibold))
        .foregroundStyle(.white)
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(Color.white.opacity(0.12))
        .clipShape(Capsule())
        .disabled(recorder.lastFileURL == nil || recorder.isRecording)

        Text(syncManager.status)
          .font(KnapsackBrand.inter(10))
          .multilineTextAlignment(.center)
          .foregroundStyle(.white.opacity(0.65))

        if let notification = syncManager.latestChatNotification {
          VStack(alignment: .leading, spacing: 4) {
            Text("Latest reply")
              .font(KnapsackBrand.inter(10, weight: .bold))
              .foregroundStyle(.white.opacity(0.7))
              .textCase(.uppercase)

            Text(notification.title)
              .font(KnapsackBrand.inter(12, weight: .semibold))
              .foregroundStyle(.white)
              .lineLimit(1)

            Text(notification.body)
              .font(KnapsackBrand.inter(11))
              .foregroundStyle(.white.opacity(0.82))
              .lineLimit(3)
          }
          .frame(maxWidth: .infinity, alignment: .leading)
          .padding(10)
          .background(Color.white.opacity(0.08))
          .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        }
      }
      .padding(.horizontal, 14)
      .padding(.vertical, 8)
    }
    .onAppear {
      syncManager.activate()
    }
  }
}
