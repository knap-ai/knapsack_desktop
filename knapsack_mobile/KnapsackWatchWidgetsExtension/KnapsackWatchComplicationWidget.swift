import SwiftUI
import WidgetKit

private struct KnapsackWidgetEntry: TimelineEntry {
  let date: Date
  let snapshot: KnapsackComplicationSnapshot
}

private struct KnapsackWidgetProvider: TimelineProvider {
  private func currentSnapshot() -> KnapsackComplicationSnapshot {
    KnapsackComplicationStore.shared.currentSnapshot()
  }

  func placeholder(in context: Context) -> KnapsackWidgetEntry {
    KnapsackWidgetEntry(
      date: .now,
      snapshot: currentSnapshot()
    )
  }

  func getSnapshot(in context: Context, completion: @escaping (KnapsackWidgetEntry) -> Void) {
    completion(KnapsackWidgetEntry(date: .now, snapshot: currentSnapshot()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<KnapsackWidgetEntry>) -> Void) {
    let snapshot = currentSnapshot()
    let entry = KnapsackWidgetEntry(date: snapshot.updatedAt, snapshot: snapshot)
    completion(Timeline(entries: [entry], policy: .never))
  }
}

private struct KnapsackWidgetView: View {
  let entry: KnapsackWidgetEntry

  var body: some View {
    switch widgetFamily {
    case .accessoryCircular:
      ZStack {
        Circle()
          .fill(entry.snapshot.isRecording ? Color.orange.opacity(0.18) : Color.accentColor.opacity(0.14))
        Image("BrandMark")
          .resizable()
          .scaledToFit()
          .padding(8)
      }
      .widgetAccentable()
    case .accessoryCorner:
      Image("BrandMark")
        .resizable()
        .scaledToFit()
        .padding(4)
        .widgetCurvesContent()
    case .accessoryInline:
      Label(entry.snapshot.isRecording ? "Knapsack Recording" : "Knapsack Ready", image: "BrandMark")
    default:
      HStack(spacing: 8) {
        ZStack {
          RoundedRectangle(cornerRadius: 10, style: .continuous)
            .fill(entry.snapshot.isRecording ? Color.orange.opacity(0.18) : Color.accentColor.opacity(0.12))
          Image("BrandMark")
            .resizable()
            .scaledToFit()
            .padding(8)
        }
        .frame(width: 40, height: 40)

        VStack(alignment: .leading, spacing: 4) {
          Text("Knapsack")
            .font(.system(.headline, design: .rounded, weight: .semibold))
          Text(entry.snapshot.flatText)
            .font(.system(.caption, design: .rounded))
            .foregroundStyle(.secondary)
        }
        Spacer(minLength: 0)
      }
    }
  }

  @Environment(\.widgetFamily) private var widgetFamily
}

struct KnapsackWatchComplicationWidget: Widget {
  let kind = KnapsackComplicationDefinition.widgetKind

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: KnapsackWidgetProvider()) { entry in
      KnapsackWidgetView(entry: entry)
        .containerBackground(.fill.tertiary, for: .widget)
    }
    .configurationDisplayName("Knapsack")
    .description("See whether Knapsack is ready, recording, or waiting to sync.")
    .supportedFamilies([
      .accessoryCircular,
      .accessoryCorner,
      .accessoryInline,
      .accessoryRectangular,
    ])
  }
}

#Preview(as: .accessoryRectangular) {
  KnapsackWatchComplicationWidget()
} timeline: {
  KnapsackWidgetEntry(
    date: .now,
    snapshot: KnapsackComplicationSnapshot(
      isRecording: true,
      syncStatus: "Recording to Knapsack",
      updatedAt: .now
    )
  )
}
