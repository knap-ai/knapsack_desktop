#if canImport(CarPlay)
import AVFoundation
import CarPlay
import UIKit

@MainActor
final class KnapsackCarPlaySceneDelegate: UIResponder, CPTemplateApplicationSceneDelegate {
  private var interfaceController: CPInterfaceController?
  private let api = MobileAPI.shared
  private let speechSynthesizer = AVSpeechSynthesizer()

  func templateApplicationScene(
    _ templateApplicationScene: CPTemplateApplicationScene,
    didConnect interfaceController: CPInterfaceController
  ) {
    self.interfaceController = interfaceController
    interfaceController.setRootTemplate(makeRootTemplate(), animated: false, completion: nil)
  }

  private func makeRootTemplate() -> CPListTemplate {
    let rows = CarPlayDriveContent.primaryActions.map { action in
      let item = CPListItem(text: action.title, detailText: action.detail)
      item.handler = { [weak self] _, completion in
        self?.handle(action.kind)
        completion()
      }
      return item
    }
    let template = CPListTemplate(title: "Knapsack Drive", sections: [CPListSection(items: rows)])
    template.tabTitle = "Drive"
    template.tabImage = UIImage(systemName: "steeringwheel")
    return template
  }

  private func handle(_ action: CarPlayDriveAction.Kind) {
    switch action {
    case .scout:
      presentVoiceSession(target: .scout(conversationID: nil), title: "Scout")
    case .continueChat:
      presentRecentChats()
    case .nextMeetingPrep:
      presentNextMeetingPrep()
    case .captureIdea:
      presentVoiceSession(target: .ideaCapture, title: "Capture an idea")
    }
  }

  private func presentRecentChats() {
    let cached = api.loadCachedWorkspace().chats
    let rows = CarPlayDriveContent.recentChats(from: cached).map { chat in
      let title = chat.thread.title?.trimmingCharacters(in: .whitespacesAndNewlines)
      let item = CPListItem(text: title?.isEmpty == false ? title! : "Knapsack chat", detailText: chat.preview)
      item.handler = { [weak self] _, completion in
        self?.presentVoiceSession(
          target: .conversation(id: String(chat.id), title: title ?? "Knapsack chat"),
          title: title ?? "Knapsack chat"
        )
        completion()
      }
      return item
    }

    guard !rows.isEmpty else {
      presentInformation(
        title: "Recent chats",
        detail: "No synced conversations are available yet."
      )
      return
    }
    interfaceController?.pushTemplate(
      CPListTemplate(title: "Recent chats", sections: [CPListSection(items: rows)]),
      animated: true,
      completion: nil
    )
  }

  private func presentNextMeetingPrep() {
    let workspace = api.loadCachedWorkspace()
    guard let event = CarPlayDriveContent.nextEvent(from: workspace.calendarEvents) else {
      presentInformation(title: "Meeting prep", detail: "No upcoming meeting is synced.")
      return
    }
    let prep = event.prepPreview?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
    guard !prep.isEmpty else {
      presentVoiceSession(
        target: .meetingPrep(eventID: event.eventId, title: event.displayTitle),
        title: event.displayTitle
      )
      return
    }

    let spokenPrep = String(prep.prefix(1_200))
    speechSynthesizer.stopSpeaking(at: .immediate)
    speechSynthesizer.speak(AVSpeechUtterance(string: spokenPrep))
    presentInformation(title: event.displayTitle, detail: String(prep.prefix(240)))
  }

  private func presentVoiceSession(target: RealtimeVoiceTarget, title: String) {
    // Do not imply that a live session exists until Studio can mint a secure,
    // short-lived credential for this surface.
    presentInformation(
      title: title,
      detail: "Live voice requires the Knapsack Studio relay and is not available in this build."
    )
    _ = target
  }

  private func presentInformation(title: String, detail: String) {
    let template = CPInformationTemplate(
      title: title,
      layout: .leading,
      items: [CPInformationItem(title: "", detail: detail)],
      actions: []
    )
    interfaceController?.pushTemplate(template, animated: true, completion: nil)
  }
}
#endif
