import SwiftUI

private enum NoteDetailMode: String, CaseIterable, Identifiable {
  case read = "Read"
  case edit = "Edit"

  var id: String { rawValue }
}

private enum NoteBlock: Identifiable {
  case heading(String)
  case bullet(String)
  case paragraph(String)

  var id: String {
    switch self {
    case .heading(let text):
      return "heading-\(text)"
    case .bullet(let text):
      return "bullet-\(text)"
    case .paragraph(let text):
      return "paragraph-\(text)"
    }
  }
}

struct ContentView: View {
  private enum DesktopPane: String, CaseIterable, Identifiable {
    case notes = "Notes"
    case chats = "Chats"

    var id: String { rawValue }
  }

  @StateObject private var viewModel = MeetingListViewModel()
  @StateObject private var discovery = DesktopDiscoveryCoordinator()
  @StateObject private var recorder = PhoneRecorder()
  @StateObject private var watchSync = WatchSyncCoordinator.shared
  @State private var draftNotes = ""
  @State private var draftChatMessage = ""
  @State private var expandedChatMessageIDs: Set<UInt64> = []
  @State private var draftAutopilotReply = ""
  @State private var gbrainDraftPrompt = ""
  @State private var searchText = ""
  @State private var selectedPane: DesktopPane = .chats
  @State private var noteDetailMode: NoteDetailMode = .read
  @State private var isShowingSettings = false
  @State private var presentedMeeting: MobileMeetingDetail?
  @State private var presentedChat: MobileChatDetail?
  @State private var presentedAutopilotEmail: MobileAutopilotEmailDetail?
  @FocusState private var isNotesEditorFocused: Bool
  @FocusState private var isAutopilotReplyFocused: Bool
  private let isRunningTests = ProcessInfo.processInfo.environment["XCTestConfigurationFilePath"] != nil

  var body: some View {
    TabView(selection: $selectedPane) {
      chatsTab
        .tag(DesktopPane.chats)
        .tabItem {
          Label("Chats", systemImage: "bubble.left.and.bubble.right")
        }

      notesTab
        .tag(DesktopPane.notes)
        .tabItem {
          Label("Meeting notes", systemImage: "note.text")
        }
    }
    .sheet(isPresented: $isShowingSettings) {
      NavigationStack {
        ScrollView {
          VStack(alignment: .leading, spacing: 20) {
            accountCard
            watchComplicationCard
          }
          .padding()
        }
        .background(Color.white.ignoresSafeArea())
        .toolbar {
          ToolbarItem(placement: .topBarLeading) {
            Text("Knapsack")
              .font(KnapsackBrand.inter(17, weight: .semibold))
              .foregroundStyle(KnapsackBrand.ink)
          }
          ToolbarItem(placement: .topBarTrailing) {
            Button("Done") {
              isShowingSettings = false
            }
            .font(KnapsackBrand.inter(15, weight: .semibold))
            .foregroundStyle(KnapsackBrand.ink)
          }
        }
      }
    }
    .sheet(item: $presentedMeeting, onDismiss: {
      noteDetailMode = .read
      isNotesEditorFocused = false
    }) { meeting in
      NavigationStack {
        ScrollView {
          meetingDetailView(meeting)
            .padding()
        }
        .scrollDismissesKeyboard(.interactively)
        .background(Color.white.ignoresSafeArea())
        .toolbar {
          ToolbarItem(placement: .topBarLeading) {
            Button("Close") {
              presentedMeeting = nil
            }
            .font(KnapsackBrand.inter(15, weight: .semibold))
            .foregroundStyle(KnapsackBrand.ink)
          }
          ToolbarItem(placement: .principal) {
            Text("Meeting")
              .font(KnapsackBrand.inter(17, weight: .semibold))
              .foregroundStyle(KnapsackBrand.ink)
          }
        }
      }
    }
    .sheet(item: $presentedChat) { chat in
      let liveChat = currentPresentedChat(fallback: chat)
      NavigationStack {
        ScrollView {
          chatDetailView(liveChat)
            .padding()
            .padding(.bottom, 12)
        }
        .safeAreaInset(edge: .bottom, spacing: 0) {
          chatComposer
        }
        .scrollDismissesKeyboard(.interactively)
        .background(Color.white.ignoresSafeArea())
        .toolbar {
          ToolbarItem(placement: .topBarLeading) {
            Button("Close") {
              presentedChat = nil
            }
            .font(KnapsackBrand.inter(15, weight: .semibold))
            .foregroundStyle(KnapsackBrand.ink)
          }
          ToolbarItem(placement: .principal) {
            Text("Chat")
              .font(KnapsackBrand.inter(17, weight: .semibold))
              .foregroundStyle(KnapsackBrand.ink)
          }
        }
      }
    }
    .sheet(item: $presentedAutopilotEmail) { detail in
      let liveDetail = currentPresentedAutopilotEmail(fallback: detail)
      NavigationStack {
        ScrollView {
          autopilotEmailDetailView(liveDetail)
            .padding()
        }
        .scrollDismissesKeyboard(.interactively)
        .background(Color.white.ignoresSafeArea())
        .toolbar {
          ToolbarItem(placement: .topBarLeading) {
            Button("Close") {
              presentedAutopilotEmail = nil
              draftAutopilotReply = ""
              isAutopilotReplyFocused = false
            }
            .font(KnapsackBrand.inter(15, weight: .semibold))
            .foregroundStyle(KnapsackBrand.ink)
          }
          ToolbarItem(placement: .principal) {
            Text("Email")
              .font(KnapsackBrand.inter(17, weight: .semibold))
              .foregroundStyle(KnapsackBrand.ink)
          }
        }
      }
    }
    .sheet(item: $viewModel.selectedBrainPage) { page in
      NavigationStack {
        ScrollView {
          gbrainPageView(page)
            .padding()
        }
        .background(Color.white.ignoresSafeArea())
        .toolbar {
          ToolbarItem(placement: .topBarLeading) {
            Button("Close") {
              viewModel.selectedBrainPage = nil
            }
            .font(KnapsackBrand.inter(15, weight: .semibold))
            .foregroundStyle(KnapsackBrand.ink)
          }
          ToolbarItem(placement: .principal) {
            Text(page.title)
              .font(KnapsackBrand.inter(17, weight: .semibold))
              .foregroundStyle(KnapsackBrand.ink)
          }
        }
      }
    }
    .scrollDismissesKeyboard(.interactively)
    .background(Color.white.ignoresSafeArea())
    .task {
      guard !isRunningTests else { return }
      discovery.startBrowsing()
      watchSync.activate()
      await watchSync.importPendingSharedRecordings()
      await viewModel.refresh()
    }
    .onDisappear {
      discovery.stopBrowsing()
    }
    .onChange(of: discovery.preferredDesktop?.id) { _, _ in
      Task {
        await viewModel.adoptDiscoveredDesktop(discovery.preferredDesktop)
      }
    }
    .onChange(of: viewModel.selectedMeeting?.id) { _, _ in
      draftNotes = viewModel.selectedMeeting?.notes ?? ""
      noteDetailMode = .read
      isNotesEditorFocused = false
    }
    .onChange(of: viewModel.selectedChat?.updatedAt) { _, _ in
      guard let selectedChat = viewModel.selectedChat,
            presentedChat?.id == selectedChat.id else { return }
      presentedChat = selectedChat
    }
    .onChange(of: presentedChat?.id) { _, _ in
      draftChatMessage = ""
    }
    .onChange(of: viewModel.selectedAutopilotEmail?.id) { _, _ in
      guard let selectedEmail = viewModel.selectedAutopilotEmail,
            presentedAutopilotEmail?.id == selectedEmail.id else { return }
      presentedAutopilotEmail = selectedEmail
    }
    .onChange(of: presentedAutopilotEmail?.id) { _, _ in
      draftAutopilotReply = ""
    }
  }

  private var brainTab: some View {
    pageScrollView {
      VStack(alignment: .leading, spacing: 22) {
        gbrainHeader
        searchBar
        gbrainBriefCard
        gbrainResearchCard
        gbrainLibrarySection
      }
    }
  }

  private var autopilotTab: some View {
    pageScrollView {
      VStack(alignment: .leading, spacing: 22) {
        autopilotHeader
        searchBar
        autopilotHeroCard
        autopilotAskCard
        autopilotSections
      }
    }
  }

  private var notesTab: some View {
    pageScrollView {
      VStack(alignment: .leading, spacing: 22) {
        notesHeader
        searchBar
        quickCaptureCard
        meetingsSection
        syncSection
      }
    }
  }

  private var chatsTab: some View {
    pageScrollView {
      VStack(alignment: .leading, spacing: 22) {
        chatsHeader
        searchBar
        chatsSection
      }
    }
  }

  private var notesHeader: some View {
    sectionHeader(
      eyebrow: "Knapsack",
      title: "Meeting notes",
      subtitle: "Capture the conversation, keep the signal, and turn it into a useful follow-up."
    ) {
      headerActionButton(systemName: "gearshape")
    }
  }

  private var autopilotHeader: some View {
    sectionHeader(
      eyebrow: "Knapsack",
      title: "Autopilot",
      subtitle: "See what matters across email, meetings, calendar, and chats before the day runs away from you."
    ) {
      headerActionButton(systemName: "gearshape")
    }
  }

  private var gbrainHeader: some View {
    sectionHeader(
      eyebrow: "Knapsack",
      title: "GBrain",
      subtitle: "Stay on top of your world passively, then research the next thing before the moment passes."
    ) {
      headerActionButton(systemName: "gearshape")
    }
  }

  private var chatsHeader: some View {
    sectionHeader(
      eyebrow: "Knapsack",
      title: "Chats",
      subtitle: "Continue every Knapsack conversation from your phone, including team work from desktop."
    ) {
      HStack(spacing: 10) {
        Button("New chat") {
          Task {
            await viewModel.createChat()
            if let chat = viewModel.selectedChat {
              presentedChat = chat
            }
          }
        }
        .brandPill(background: KnapsackBrand.ink, foreground: .white)

        headerActionButton(systemName: "gearshape")
      }
    }
  }

  private func pageScrollView<Content: View>(@ViewBuilder content: () -> Content) -> some View {
    ScrollView {
      content()
        .padding(.horizontal, 20)
        .padding(.top, 12)
        .padding(.bottom, 120)
    }
    .background(Color.white.ignoresSafeArea())
  }

  private func sectionHeader<Accessory: View>(
    eyebrow: String,
    title: String,
    subtitle: String,
    @ViewBuilder accessory: () -> Accessory
  ) -> some View {
    VStack(alignment: .leading, spacing: 10) {
      HStack(alignment: .center) {
        VStack(alignment: .leading, spacing: 4) {
          Text(eyebrow)
            .font(KnapsackBrand.inter(14, weight: .semibold))
            .foregroundStyle(KnapsackBrand.inkMuted)

          Text(title)
            .font(KnapsackBrand.inter(36, weight: .bold))
            .foregroundStyle(KnapsackBrand.ink)
        }

        Spacer()

        accessory()
      }

      Text(subtitle)
        .font(KnapsackBrand.spectralItalic(18))
        .foregroundStyle(KnapsackBrand.ink.opacity(0.82))
        .fixedSize(horizontal: false, vertical: true)
    }
  }

  private func headerActionButton(systemName: String) -> some View {
    Button {
      isShowingSettings = true
    } label: {
      Image(systemName: systemName)
        .font(.system(size: 17, weight: .semibold))
        .foregroundStyle(KnapsackBrand.ink)
        .frame(width: 42, height: 42)
        .background(KnapsackBrand.paper)
        .clipShape(Circle())
        .overlay(Circle().stroke(KnapsackBrand.line, lineWidth: 1))
    }
    .buttonStyle(.plain)
  }

  private var searchBar: some View {
    HStack(spacing: 12) {
      Image(systemName: "magnifyingglass")
        .foregroundStyle(KnapsackBrand.slate)

      TextField(searchPlaceholder, text: $searchText)
        .textInputAutocapitalization(.never)
        .autocorrectionDisabled()
        .font(KnapsackBrand.inter(16))
        .foregroundStyle(KnapsackBrand.ink)
        .tint(KnapsackBrand.ink)

      if !searchText.isEmpty {
        Button {
          searchText = ""
        } label: {
          Image(systemName: "xmark.circle.fill")
            .font(.system(size: 16, weight: .medium))
            .foregroundStyle(KnapsackBrand.slate.opacity(0.7))
        }
        .buttonStyle(.plain)
      }
    }
    .padding(.horizontal, 16)
    .padding(.vertical, 14)
    .background(KnapsackBrand.paper.opacity(0.9))
    .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
    .overlay(
      RoundedRectangle(cornerRadius: 20, style: .continuous)
        .stroke(KnapsackBrand.line, lineWidth: 1)
    )
  }

  private var searchPlaceholder: String {
    switch selectedPane {
    case .notes:
      return "Search meetings and notes"
    case .chats:
      return "Search chats and replies"
    }
  }

  private var accountCard: some View {
    VStack(alignment: .leading, spacing: 16) {
      HStack(alignment: .top) {
        VStack(alignment: .leading, spacing: 6) {
          Text(viewModel.session?.linked == true ? "Linked account" : "Connect to desktop")
            .font(KnapsackBrand.inter(14, weight: .semibold))
            .foregroundStyle(KnapsackBrand.inkMuted)

          if let profile = viewModel.session?.profile {
            Text(profile.name ?? "Knapsack")
              .font(KnapsackBrand.spectral(28))
              .foregroundStyle(KnapsackBrand.ink)

            Text(profile.email)
              .font(KnapsackBrand.inter(15))
              .foregroundStyle(KnapsackBrand.slate)
          } else {
            Text("Link your desktop")
              .font(KnapsackBrand.spectral(28))
              .foregroundStyle(KnapsackBrand.ink)

            Text("Knapsack will find the signed-in desktop app on your local network and inherit its chats, meetings, and calendar.")
              .font(KnapsackBrand.inter(15))
              .foregroundStyle(KnapsackBrand.slate)
          }
        }

        Spacer()

        Text(viewModel.session?.linked == true ? "Linked" : "Not linked")
          .font(KnapsackBrand.inter(12, weight: .semibold))
          .foregroundStyle(viewModel.session?.linked == true ? KnapsackBrand.ink : KnapsackBrand.slate)
          .padding(.horizontal, 12)
          .padding(.vertical, 8)
          .background(Capsule().fill(KnapsackBrand.paper))
      }

      HStack(spacing: 10) {
        capabilityChip(label: "Calendar", isActive: viewModel.session?.calendarConnected == true)
        capabilityChip(label: "Email", isActive: viewModel.session?.emailConnected == true)
        capabilityChip(label: "Drive", isActive: viewModel.session?.driveConnected == true)
      }

      if let label = viewModel.session?.desktopLabel {
        Text(label)
          .font(KnapsackBrand.inter(13))
          .foregroundStyle(KnapsackBrand.slate)
      }

      if let desktop = discovery.preferredDesktop, viewModel.session?.linked != true {
        VStack(alignment: .leading, spacing: 8) {
          Text("Nearby desktop")
            .font(KnapsackBrand.inter(12, weight: .semibold))
            .foregroundStyle(KnapsackBrand.inkMuted)

          HStack(spacing: 10) {
            Image(systemName: "desktopcomputer")
              .foregroundStyle(KnapsackBrand.ink)

            VStack(alignment: .leading, spacing: 4) {
              Text(desktop.name)
                .font(KnapsackBrand.inter(15, weight: .semibold))
                .foregroundStyle(KnapsackBrand.ink)

              Text(desktop.url.absoluteString)
                .font(KnapsackBrand.inter(13))
                .foregroundStyle(KnapsackBrand.slate)
            }

            Spacer()

            Text("Auto")
              .font(KnapsackBrand.inter(11, weight: .semibold))
              .foregroundStyle(KnapsackBrand.inkMuted)
              .padding(.horizontal, 10)
              .padding(.vertical, 6)
              .background(Capsule().fill(KnapsackBrand.paper))
          }
          .padding(.horizontal, 14)
          .padding(.vertical, 12)
          .background(Color.white)
          .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
          .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
              .stroke(KnapsackBrand.line, lineWidth: 1)
          )
        }
      }

      VStack(alignment: .leading, spacing: 10) {
        Text("Manual fallback")
          .font(KnapsackBrand.inter(12, weight: .semibold))
          .foregroundStyle(KnapsackBrand.inkMuted)

        TextField("http://192.168.1.20:18898", text: $viewModel.serverURLText)
          .textInputAutocapitalization(.never)
          .keyboardType(.URL)
          .autocorrectionDisabled()
          .font(KnapsackBrand.inter(15))
          .padding(.horizontal, 14)
          .padding(.vertical, 12)
          .background(KnapsackBrand.paper)
          .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
          .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
              .stroke(KnapsackBrand.line, lineWidth: 1)
          )

        HStack(spacing: 10) {
          Button(viewModel.isConnectingToDesktop ? "Connecting…" : "Connect") {
            Task { await viewModel.connectToDesktop() }
          }
          .brandPill(
            background: viewModel.isConnectingToDesktop ? KnapsackBrand.paper : KnapsackBrand.ink,
            foreground: viewModel.isConnectingToDesktop ? KnapsackBrand.inkMuted : .white
          )
          .disabled(viewModel.isConnectingToDesktop)

          Button("Save") {
            viewModel.saveServerURL()
          }
          .brandPill(background: KnapsackBrand.paper, foreground: KnapsackBrand.ink)
        }

        Text("You should not need this normally. If discovery misses your Mac, enter its local address here instead of 127.0.0.1.")
          .font(KnapsackBrand.inter(13))
          .foregroundStyle(KnapsackBrand.slate)
      }

      if let discoveryStatus = discovery.statusText, viewModel.session?.linked != true {
        Text(discoveryStatus)
          .font(KnapsackBrand.inter(13))
          .foregroundStyle(KnapsackBrand.slate)
      }

      if let status = viewModel.statusMessage {
        Text(status)
          .font(KnapsackBrand.inter(13))
          .foregroundStyle(KnapsackBrand.slate)
      }

      if let error = viewModel.errorMessage, viewModel.session?.linked != true {
        Text(error)
          .font(KnapsackBrand.inter(13))
          .foregroundStyle(KnapsackBrand.coral)
      }
    }
    .cardStyle()
  }

  private var watchComplicationCard: some View {
    VStack(alignment: .leading, spacing: 14) {
      Text("Apple Watch complication")
        .font(KnapsackBrand.inter(14, weight: .semibold))
        .foregroundStyle(KnapsackBrand.inkMuted)

      Text("Add Knapsack to your watch face")
        .font(KnapsackBrand.spectral(24))
        .foregroundStyle(KnapsackBrand.ink)

      Text("On Apple Watch, press and hold the current watch face, tap Edit, swipe to Complications, tap a slot, then choose Knapsack. The complication shows whether you are ready, recording, or waiting to sync.")
        .font(KnapsackBrand.inter(14))
        .foregroundStyle(KnapsackBrand.slate)

      Text("You can also open the Watch app on iPhone, pick a face in My Faces, tap a complication slot, and choose Knapsack.")
        .font(KnapsackBrand.inter(14))
        .foregroundStyle(KnapsackBrand.slate)
    }
    .cardStyle()
  }

  private var autopilotHeroCard: some View {
    VStack(alignment: .leading, spacing: 16) {
      HStack(alignment: .top) {
        VStack(alignment: .leading, spacing: 6) {
          Text("Today with Knapsack")
            .font(KnapsackBrand.inter(14, weight: .semibold))
            .foregroundStyle(KnapsackBrand.inkMuted)

          Text(viewModel.autopilotBrief?.headline ?? "Your brief is getting ready")
            .font(KnapsackBrand.spectral(30))
            .foregroundStyle(KnapsackBrand.ink)
            .fixedSize(horizontal: false, vertical: true)
        }

        Spacer()

        if viewModel.isLoadingAutopilot {
          ProgressView()
            .tint(KnapsackBrand.ink)
        } else {
          Text("\(filteredAutopilotSections.reduce(0) { $0 + $1.cards.count })")
            .font(KnapsackBrand.inter(13, weight: .semibold))
            .foregroundStyle(KnapsackBrand.slate)
        }
      }

      Text(viewModel.autopilotBrief?.summary ?? "Link your desktop account to get a calm, action-oriented brief instead of a raw inbox list.")
        .font(KnapsackBrand.inter(14))
        .foregroundStyle(KnapsackBrand.slate)
        .fixedSize(horizontal: false, vertical: true)

      HStack(spacing: 10) {
        statChip(label: "Email", value: viewModel.session?.emailConnected == true ? "Ready" : "Link")
        statChip(label: "Agenda", value: "\(viewModel.calendarEvents.count)")
        statChip(label: "Chats", value: "\(viewModel.chats.count)")
        statChip(label: "Notes", value: "\(viewModel.meetings.count)")
      }

      HStack(spacing: 10) {
        Button("Refresh brief") {
          Task { await viewModel.refresh() }
        }
        .brandPill(background: KnapsackBrand.ink, foreground: .white)

        Button("Open settings") {
          isShowingSettings = true
        }
        .brandPill(background: KnapsackBrand.paper, foreground: KnapsackBrand.ink)
      }
    }
    .cardStyle()
  }

  private var autopilotAskCard: some View {
    VStack(alignment: .leading, spacing: 16) {
      Text("Ask Knapsack")
        .font(KnapsackBrand.inter(14, weight: .semibold))
        .foregroundStyle(KnapsackBrand.inkMuted)

      Text("Turn the brief into action")
        .font(KnapsackBrand.spectral(28))
        .foregroundStyle(KnapsackBrand.ink)

      Text("Use one tap prompts to draft replies, prep for meetings, or pull the important details out of life-admin email.")
        .font(KnapsackBrand.inter(14))
        .foregroundStyle(KnapsackBrand.slate)

      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 10) {
          ForEach(autopilotPromptSuggestions, id: \.self) { prompt in
            Button(prompt) {
              gbrainDraftPrompt = prompt
              selectedPane = .chats
            }
            .brandPill(background: KnapsackBrand.paper, foreground: KnapsackBrand.ink)
          }
        }
      }
    }
    .cardStyle()
  }

  private var autopilotSections: some View {
    VStack(alignment: .leading, spacing: 18) {
      ForEach(filteredAutopilotSections) { section in
        VStack(alignment: .leading, spacing: 12) {
          HStack {
            VStack(alignment: .leading, spacing: 4) {
              Text(section.title)
                .font(KnapsackBrand.inter(28, weight: .bold))
                .foregroundStyle(KnapsackBrand.ink)

              if let subtitle = section.subtitle {
                Text(subtitle)
                  .font(KnapsackBrand.inter(13))
                  .foregroundStyle(KnapsackBrand.slate)
              }
            }

            Spacer()

            Text("\(section.cards.count)")
              .font(KnapsackBrand.inter(14, weight: .semibold))
              .foregroundStyle(KnapsackBrand.inkMuted)
              .padding(.horizontal, 12)
              .padding(.vertical, 8)
              .background(Capsule().fill(KnapsackBrand.paper))
          }

          ForEach(section.cards) { card in
            autopilotCard(card)
          }
        }
      }
    }
  }

  private func autopilotCard(_ card: MobileAutopilotCard) -> some View {
    Button {
      handleAutopilotCardTap(card)
    } label: {
      VStack(alignment: .leading, spacing: 12) {
        HStack(alignment: .top, spacing: 12) {
          VStack(alignment: .leading, spacing: 6) {
            Text(card.title)
              .font(KnapsackBrand.inter(18, weight: .semibold))
              .foregroundStyle(KnapsackBrand.ink)
              .multilineTextAlignment(.leading)

            Text(card.subtitle)
              .font(KnapsackBrand.inter(13))
              .foregroundStyle(KnapsackBrand.slate)
              .fixedSize(horizontal: false, vertical: true)
          }

          Spacer(minLength: 8)

          VStack(alignment: .trailing, spacing: 8) {
            if let badge = card.badge {
              Text(badge)
                .font(KnapsackBrand.inter(10, weight: .semibold))
                .foregroundStyle(KnapsackBrand.inkMuted)
                .padding(.horizontal, 10)
                .padding(.vertical, 7)
                .background(Capsule().fill(KnapsackBrand.paper))
            }

            if let timestamp = card.timestamp {
              Text(chatTimeString(timestamp))
                .font(KnapsackBrand.inter(11, weight: .medium))
                .foregroundStyle(KnapsackBrand.inkMuted)
            }
          }
        }

        if let preview = card.preview, !preview.isEmpty {
          Text(preview)
            .font(KnapsackBrand.inter(14))
            .foregroundStyle(KnapsackBrand.slate)
            .fixedSize(horizontal: false, vertical: true)
        }

        if let rationale = card.rationale, !rationale.isEmpty {
          Text(rationale)
            .font(KnapsackBrand.inter(12))
            .foregroundStyle(KnapsackBrand.inkMuted)
            .fixedSize(horizontal: false, vertical: true)
        }

        HStack(spacing: 10) {
          if autopilotCardIsDirectlyActionable(card) {
            Text(autopilotPrimaryActionLabel(card))
              .font(KnapsackBrand.inter(12, weight: .semibold))
              .foregroundStyle(KnapsackBrand.ink)
              .padding(.horizontal, 12)
              .padding(.vertical, 8)
              .background(Capsule().fill(KnapsackBrand.paper))
          }

          if !card.suggestedPrompts.isEmpty {
            Text(promptButtonLabel(card.suggestedPrompts[0]))
              .font(KnapsackBrand.inter(12))
              .foregroundStyle(KnapsackBrand.slate)
              .lineLimit(1)
          }
        }
      }
      .padding(18)
      .frame(maxWidth: .infinity, alignment: .leading)
      .background(RoundedRectangle(cornerRadius: 24, style: .continuous).fill(Color.white))
      .overlay(
        RoundedRectangle(cornerRadius: 24, style: .continuous)
          .stroke(KnapsackBrand.line, lineWidth: 1)
      )
    }
    .buttonStyle(.plain)
  }

  private var quickCaptureCard: some View {
    VStack(alignment: .leading, spacing: 16) {
      HStack(alignment: .top) {
        VStack(alignment: .leading, spacing: 6) {
          Text("Quick capture")
            .font(KnapsackBrand.inter(14, weight: .semibold))
            .foregroundStyle(KnapsackBrand.inkMuted)

          Text(recorder.isRecording ? "Recording your meeting" : "Capture your next meeting")
            .font(KnapsackBrand.spectral(30))
            .foregroundStyle(KnapsackBrand.ink)
            .fixedSize(horizontal: false, vertical: true)
        }

        Spacer()

        Text(formattedNowTime)
          .font(KnapsackBrand.inter(13, weight: .semibold))
          .foregroundStyle(KnapsackBrand.slate)
      }

      Text(recorder.isRecording ? "Keep the phone nearby. When you finish, the clip is securely uploaded to the linked desktop meeting." : "Start recording when a conversation begins, or create a clean note to capture the decisions yourself.")
        .font(KnapsackBrand.inter(14))
        .foregroundStyle(KnapsackBrand.slate)
        .fixedSize(horizontal: false, vertical: true)

      HStack(spacing: 10) {
        statChip(label: "Phone", value: recorder.isRecording ? "Live" : "Ready")
        statChip(label: "Watch", value: watchSync.lastSyncMessage == nil ? "Standby" : "Synced")
        statChip(label: "Server", value: "Desktop")
      }

      HStack(spacing: 10) {
        Button(recorder.isRecording ? "Finish recording" : "Start recording") {
          if recorder.isRecording {
            recorder.stop()
            if let fileURL = recorder.currentFileURL {
              Task {
                await viewModel.uploadRecording(
                  fileURL: fileURL,
                  startedAt: recorder.recordingStartedAt,
                  endedAt: recorder.recordingEndedAt
                )
              }
            }
          } else {
            Task {
              do {
                let created = await viewModel.createMeetingForRecordingIfNeeded()
                if let meetingID = created?.id {
                  _ = try await awaitStatusUpdate(for: meetingID, status: .recording)
                }
                try await recorder.start()
              } catch {
                viewModel.errorMessage = error.localizedDescription
              }
            }
          }
        }
        .brandPill(
          background: recorder.isRecording ? KnapsackBrand.coral : KnapsackBrand.ink,
          foreground: .white
        )

        Button("New note") {
          Task {
            await viewModel.createMeeting()
            if let meeting = viewModel.selectedMeeting {
              draftNotes = meeting.notes ?? ""
              noteDetailMode = .edit
              presentedMeeting = meeting
            }
          }
        }
        .brandPill(
          background: Color.white.opacity(0.86),
          foreground: KnapsackBrand.ink
        )
      }

      if let message = viewModel.statusMessage {
        Text(message)
          .font(KnapsackBrand.inter(13))
          .foregroundStyle(KnapsackBrand.slate)
      }

      if let error = viewModel.errorMessage {
        Text(error)
          .font(KnapsackBrand.inter(13))
          .foregroundStyle(.red)
      }

    }
    .cardStyle()
  }

  private var gbrainBriefCard: some View {
    VStack(alignment: .leading, spacing: 16) {
      HStack(alignment: .top) {
        VStack(alignment: .leading, spacing: 6) {
          Text("Passive brief")
            .font(KnapsackBrand.inter(14, weight: .semibold))
            .foregroundStyle(KnapsackBrand.inkMuted)

          Text("What deserves your attention")
            .font(KnapsackBrand.spectral(30))
            .foregroundStyle(KnapsackBrand.ink)
            .fixedSize(horizontal: false, vertical: true)
        }

        Spacer()

        if viewModel.isLoadingBrain {
          ProgressView()
            .tint(KnapsackBrand.ink)
        }
      }

      HStack(spacing: 10) {
        statChip(label: "Agenda", value: "\(viewModel.calendarEvents.count)")
        statChip(label: "Chats", value: "\(viewModel.chats.count)")
        statChip(label: "Brain", value: "\(viewModel.brainEntries.count)")
      }

      VStack(alignment: .leading, spacing: 10) {
        ForEach(gbrainBriefItems, id: \.title) { item in
          VStack(alignment: .leading, spacing: 4) {
            Text(item.title)
              .font(KnapsackBrand.inter(14, weight: .semibold))
              .foregroundStyle(KnapsackBrand.ink)

            Text(item.detail)
              .font(KnapsackBrand.inter(14))
              .foregroundStyle(KnapsackBrand.slate)
              .fixedSize(horizontal: false, vertical: true)
          }
          .frame(maxWidth: .infinity, alignment: .leading)
          .padding(14)
          .background(KnapsackBrand.paper)
          .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
          .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
              .stroke(KnapsackBrand.line, lineWidth: 1)
          )
        }
      }

      HStack(spacing: 10) {
        Button("Daily brief") {
          Task { await runGBrainPrompt(makeDailyBriefPrompt()) }
        }
        .brandPill(background: KnapsackBrand.ink, foreground: .white)

        Button("Refresh") {
          Task {
            await viewModel.refresh()
            await viewModel.refreshGBrain()
          }
        }
        .brandPill(background: KnapsackBrand.paper, foreground: KnapsackBrand.ink)
      }
    }
    .cardStyle()
  }

  private var gbrainResearchCard: some View {
    VStack(alignment: .leading, spacing: 16) {
      Text("Quick research")
        .font(KnapsackBrand.inter(14, weight: .semibold))
        .foregroundStyle(KnapsackBrand.inkMuted)

      Text("Ask once, move on")
        .font(KnapsackBrand.spectral(28))
        .foregroundStyle(KnapsackBrand.ink)

      Text("Use GBrain to connect your meetings, notes, chats, and saved brain pages into one fast answer.")
        .font(KnapsackBrand.inter(14))
        .foregroundStyle(KnapsackBrand.slate)

      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 10) {
          ForEach(gbrainPromptSuggestions, id: \.label) { suggestion in
            Button(suggestion.label) {
              gbrainDraftPrompt = suggestion.prompt
            }
            .brandPill(background: KnapsackBrand.paper, foreground: KnapsackBrand.ink)
          }
        }
      }

      VStack(alignment: .leading, spacing: 8) {
        Text("What are you trying to figure out?")
          .font(KnapsackBrand.inter(12, weight: .semibold))
          .foregroundStyle(KnapsackBrand.inkMuted)
          .textCase(.uppercase)

        TextField("Research a person, company, meeting, or loose thread", text: $gbrainDraftPrompt, axis: .vertical)
          .font(KnapsackBrand.inter(15))
          .foregroundStyle(KnapsackBrand.ink)
          .lineLimit(3...7)
          .padding(16)
          .background(Color.white)
          .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
          .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
              .stroke(KnapsackBrand.line, lineWidth: 1)
          )
      }

      HStack(spacing: 10) {
        Button(viewModel.isRunningGBrainPrompt ? "Researching…" : "Ask GBrain") {
          let prompt = makeResearchPrompt(from: gbrainDraftPrompt)
          Task { await runGBrainPrompt(prompt, clearComposer: true) }
        }
        .brandPill(
          background: viewModel.isRunningGBrainPrompt ? KnapsackBrand.paper : KnapsackBrand.ink,
          foreground: viewModel.isRunningGBrainPrompt ? KnapsackBrand.inkMuted : .white
        )
        .disabled(viewModel.isRunningGBrainPrompt || gbrainDraftPrompt.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)

        Button("Recent meeting") {
          if let meeting = viewModel.meetings.first {
            gbrainDraftPrompt = "What matters most from \(meeting.thread.title ?? "my latest meeting") and what should I do next?"
          }
        }
        .brandPill(background: KnapsackBrand.paper, foreground: KnapsackBrand.ink)
      }
    }
    .cardStyle()
  }

  private var gbrainLibrarySection: some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack {
        VStack(alignment: .leading, spacing: 4) {
          Text("Brain library")
            .font(KnapsackBrand.inter(28, weight: .bold))
            .foregroundStyle(KnapsackBrand.ink)

          Text(viewModel.brainCurrentPath.isEmpty ? "Your saved memory, organized for the phone." : viewModel.brainCurrentPath)
            .font(KnapsackBrand.inter(13))
            .foregroundStyle(KnapsackBrand.slate)
            .lineLimit(2)
        }

        Spacer()

        if !viewModel.brainCurrentPath.isEmpty {
          Button("Up") {
            Task { await viewModel.navigateBrainUp() }
          }
          .brandPill(background: KnapsackBrand.paper, foreground: KnapsackBrand.ink)
        }
      }

      if viewModel.brainEntries.isEmpty {
        Text("No brain pages yet. Run a GBrain prompt to start building the library.")
          .font(KnapsackBrand.inter(15))
          .foregroundStyle(KnapsackBrand.slate)
      } else {
        ForEach(filteredBrainEntries) { entry in
          Button {
            Task {
              if entry.isDir {
                await viewModel.openBrainDirectory(entry)
              } else {
                await viewModel.openBrainPage(entry)
              }
            }
          } label: {
            HStack(spacing: 12) {
              Image(systemName: entry.isDir ? "folder" : "doc.text")
                .font(.system(size: 17, weight: .medium))
                .foregroundStyle(entry.isDir ? KnapsackBrand.amber : KnapsackBrand.inkMuted)
                .frame(width: 24)

              VStack(alignment: .leading, spacing: 4) {
                Text(formattedBrainEntryTitle(entry))
                  .font(KnapsackBrand.inter(16, weight: .semibold))
                  .foregroundStyle(KnapsackBrand.ink)
                  .multilineTextAlignment(.leading)

                Text(entry.isDir ? "Open folder" : "Read page")
                  .font(KnapsackBrand.inter(12))
                  .foregroundStyle(KnapsackBrand.slate)
              }

              Spacer()

              Image(systemName: "chevron.right")
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(KnapsackBrand.inkMuted)
            }
            .padding(18)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(RoundedRectangle(cornerRadius: 24, style: .continuous).fill(Color.white))
            .overlay(
              RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(KnapsackBrand.line, lineWidth: 1)
            )
          }
          .buttonStyle(.plain)
        }
      }
    }
  }

  private var agendaSection: some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack {
        Text("Upcoming")
          .font(KnapsackBrand.inter(28, weight: .bold))
          .foregroundStyle(KnapsackBrand.ink)
        Spacer()
        Text("\(filteredCalendarEvents.count)")
          .font(KnapsackBrand.inter(14, weight: .semibold))
          .foregroundStyle(KnapsackBrand.inkMuted)
          .padding(.horizontal, 12)
          .padding(.vertical, 8)
          .background(Capsule().fill(KnapsackBrand.paper))
      }

      if filteredCalendarEvents.isEmpty {
        Text(viewModel.session?.calendarConnected == true ? "No upcoming events found." : "Connect through your desktop account to bring in your meeting calendar.")
          .font(KnapsackBrand.inter(15))
          .foregroundStyle(KnapsackBrand.slate)
      } else {
        ForEach(filteredCalendarEvents) { event in
          VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top, spacing: 12) {
              VStack(alignment: .leading, spacing: 5) {
                Text(event.title ?? "Untitled event")
                  .font(KnapsackBrand.inter(18, weight: .semibold))
                  .foregroundStyle(KnapsackBrand.ink)

                if let description = event.description, !description.isEmpty {
                  Text(description)
                    .font(KnapsackBrand.inter(13))
                    .foregroundStyle(KnapsackBrand.slate)
                    .lineLimit(2)
                } else if let location = event.location, !location.isEmpty {
                  Text(location)
                    .font(KnapsackBrand.inter(13))
                    .foregroundStyle(KnapsackBrand.slate)
                    .lineLimit(1)
                }
              }

              Spacer(minLength: 10)

              VStack(alignment: .trailing, spacing: 8) {
                Text(calendarEventTimeString(event))
                  .font(KnapsackBrand.inter(12, weight: .medium))
                  .foregroundStyle(KnapsackBrand.slate)
                  .multilineTextAlignment(.trailing)

                Text(event.calendarAccountEmail)
                  .font(KnapsackBrand.inter(10, weight: .medium))
                  .foregroundStyle(KnapsackBrand.inkMuted)
                  .lineLimit(1)
              }
            }
            .padding(18)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(RoundedRectangle(cornerRadius: 24, style: .continuous).fill(Color.white))
            .overlay(
              RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(KnapsackBrand.line, lineWidth: 1)
            )
          }
        }
      }
    }
  }

  private var meetingsSection: some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack {
        Text("Recent")
          .font(KnapsackBrand.inter(28, weight: .bold))
          .foregroundStyle(KnapsackBrand.ink)
        Spacer()
        Text("\(filteredMeetings.count)")
          .font(KnapsackBrand.inter(14, weight: .semibold))
          .foregroundStyle(KnapsackBrand.inkMuted)
          .padding(.horizontal, 12)
          .padding(.vertical, 8)
          .background(Capsule().fill(KnapsackBrand.paper))
      }
      if filteredMeetings.isEmpty {
        Text("No meetings yet. Create one or start recording.")
          .font(KnapsackBrand.inter(15))
          .foregroundStyle(KnapsackBrand.slate)
      } else {
        ForEach(groupedMeetings, id: \.title) { group in
          VStack(alignment: .leading, spacing: 10) {
            Text(group.title)
              .font(KnapsackBrand.inter(13, weight: .semibold))
              .foregroundStyle(KnapsackBrand.slate)
              .textCase(.uppercase)

            ForEach(group.meetings) { meeting in
          Button {
            viewModel.selectedMeeting = meeting
            draftNotes = meeting.notes ?? ""
            noteDetailMode = .read
            isNotesEditorFocused = false
            presentedMeeting = meeting
          } label: {
                HStack(alignment: .top, spacing: 12) {
                  VStack(alignment: .leading, spacing: 5) {
                    Text(meeting.thread.title ?? "Untitled")
                      .font(KnapsackBrand.inter(18, weight: .semibold))
                      .foregroundStyle(KnapsackBrand.ink)
                      .multilineTextAlignment(.leading)

                    if let preview = meeting.metadata.notesPreview, !preview.isEmpty {
                      Text(preview)
                        .font(KnapsackBrand.inter(13))
                        .foregroundStyle(KnapsackBrand.slate)
                        .lineLimit(2)
                    } else {
                      Text(statusSubtitle(for: meeting))
                        .font(KnapsackBrand.inter(13))
                        .foregroundStyle(KnapsackBrand.slate)
                        .lineLimit(2)
                    }
                  }

                  Spacer(minLength: 10)

                  VStack(alignment: .trailing, spacing: 8) {
                    Text(meetingTimeString(for: meeting))
                      .font(KnapsackBrand.inter(12, weight: .medium))
                      .foregroundStyle(KnapsackBrand.slate)

                    if isReadyToStart(meeting) {
                      Text("Start notes")
                        .font(KnapsackBrand.inter(12, weight: .semibold))
                        .foregroundStyle(KnapsackBrand.ink)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(Capsule().fill(KnapsackBrand.amber.opacity(0.30)))
                    } else {
                      Text(meeting.metadata.status.rawValue.replacingOccurrences(of: "_", with: " "))
                        .font(KnapsackBrand.inter(10, weight: .semibold))
                        .foregroundStyle(KnapsackBrand.inkMuted)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 7)
                        .background(Capsule().fill(KnapsackBrand.paper))
                    }
                  }
                }
                .padding(18)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(
                  RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .fill(Color.white)
                )
                .overlay(
                  RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .stroke(viewModel.selectedMeeting?.id == meeting.id ? KnapsackBrand.ink.opacity(0.18) : KnapsackBrand.line, lineWidth: 1)
                )
              }
              .buttonStyle(.plain)
            }
          }
        }
      }
    }
  }

  private func meetingDetailView(_ meeting: MobileMeetingDetail) -> some View {
    VStack(alignment: .leading, spacing: 20) {
          HStack(alignment: .top, spacing: 12) {
            VStack(alignment: .leading, spacing: 8) {
              Text(meetingTimeString(for: meeting))
                .font(KnapsackBrand.inter(12, weight: .medium))
                .foregroundStyle(KnapsackBrand.slate)

              Text(meeting.thread.title ?? "Meeting")
                .font(KnapsackBrand.spectral(36))
                .foregroundStyle(KnapsackBrand.ink)
                .fixedSize(horizontal: false, vertical: true)

              if let subtitle = meeting.thread.subtitle, !subtitle.isEmpty {
                Text(subtitle)
                  .font(KnapsackBrand.inter(15))
                  .foregroundStyle(KnapsackBrand.slate)
              }
            }

            Spacer(minLength: 0)

            VStack(alignment: .trailing, spacing: 10) {
              Text(meeting.metadata.status.rawValue.replacingOccurrences(of: "_", with: " "))
                .font(KnapsackBrand.inter(11, weight: .semibold))
                .foregroundStyle(KnapsackBrand.inkMuted)
                .padding(.horizontal, 10)
                .padding(.vertical, 7)
                .background(Capsule().fill(KnapsackBrand.paper))

              if let latestAudio = meeting.metadata.latestAudioFile {
                Text(latestAudio)
                  .font(KnapsackBrand.inter(11, weight: .medium))
                  .foregroundStyle(KnapsackBrand.inkMuted)
                  .lineLimit(1)
              }
            }
          }

          HStack(spacing: 8) {
            detailMetaChip(label: "Updated", value: meetingTimeString(from: meeting.metadata.updatedAt))
            detailMetaChip(label: "Source", value: meeting.metadata.sourceDevice?.capitalized ?? "Desktop")
            detailMetaChip(label: "State", value: statusSubtitle(for: meeting))
          }

          VStack(alignment: .leading, spacing: 12) {
            HStack {
              Text("Meeting notes")
                .font(KnapsackBrand.inter(13, weight: .semibold))
                .foregroundStyle(KnapsackBrand.slate)
                .textCase(.uppercase)

              Spacer()

              HStack(spacing: 6) {
                ForEach(NoteDetailMode.allCases) { mode in
                  Button {
                    noteDetailMode = mode
                    isNotesEditorFocused = mode == .edit
                  } label: {
                    Text(mode.rawValue)
                      .font(KnapsackBrand.inter(13, weight: .semibold))
                      .foregroundStyle(noteDetailMode == mode ? .white : KnapsackBrand.ink)
                      .padding(.horizontal, 12)
                      .padding(.vertical, 8)
                      .background(
                        Capsule()
                          .fill(noteDetailMode == mode ? KnapsackBrand.ink : Color.white)
                      )
                  }
                  .buttonStyle(.plain)
                }
              }
              .padding(4)
              .background(Capsule().fill(KnapsackBrand.paper))
            }

            if noteDetailMode == .read {
              readOnlyNotesCard(for: draftNotes)
            } else {
              editableNotesCard
            }
          }

          HStack(spacing: 10) {
            Button(noteDetailMode == .edit ? "Save notes" : "Edit notes") {
              if noteDetailMode == .edit {
                Task {
                  await viewModel.saveNotes(draftNotes)
                  noteDetailMode = .read
                  isNotesEditorFocused = false
                }
              } else {
                noteDetailMode = .edit
                isNotesEditorFocused = true
              }
            }
            .brandPill(background: KnapsackBrand.ink, foreground: .white)

            Button("Refresh") {
              Task { await viewModel.refresh() }
            }
            .brandPill(background: Color.white.opacity(0.82), foreground: KnapsackBrand.ink)

            if noteDetailMode == .edit {
              Button("Done") {
                noteDetailMode = .read
                isNotesEditorFocused = false
              }
              .brandPill(background: KnapsackBrand.paper, foreground: KnapsackBrand.ink)
            }
          }
    }
    .padding(22)
    .background(
      RoundedRectangle(cornerRadius: 28, style: .continuous)
        .fill(Color.white)
    )
    .overlay(
      RoundedRectangle(cornerRadius: 28, style: .continuous)
        .stroke(KnapsackBrand.line, lineWidth: 1)
    )
  }

  private var detailSection: some View {
    EmptyView()
  }

  private func loadChatDetail(_ chat: MobileChatSummary) {
    Task {
      await viewModel.selectChat(chat)
      if let detail = viewModel.selectedChat {
        presentedChat = detail
      }
    }
  }

  private func readOnlyNotesCard(for notes: String) -> some View {
    VStack(alignment: .leading, spacing: 14) {
      if notes.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
        Text("No notes yet. Start with the throughline, decisions, and follow-ups.")
          .font(KnapsackBrand.inter(16))
          .foregroundStyle(KnapsackBrand.slate)
      } else {
        ForEach(noteBlocks(from: notes)) { block in
          switch block {
          case .heading(let text):
            Text(text)
              .font(KnapsackBrand.inter(18, weight: .bold))
              .foregroundStyle(KnapsackBrand.ink)
              .padding(.top, 4)
          case .bullet(let text):
            HStack(alignment: .top, spacing: 10) {
              Circle()
                .fill(KnapsackBrand.amber)
                .frame(width: 7, height: 7)
                .padding(.top, 8)
              Text(text)
                .font(KnapsackBrand.inter(16))
                .foregroundStyle(KnapsackBrand.ink)
                .fixedSize(horizontal: false, vertical: true)
            }
          case .paragraph(let text):
            Text(text)
              .font(KnapsackBrand.inter(16))
              .foregroundStyle(KnapsackBrand.ink)
              .fixedSize(horizontal: false, vertical: true)
          }
        }
      }
    }
    .textSelection(.enabled)
    .padding(20)
    .frame(maxWidth: .infinity, alignment: .leading)
    .background(
      RoundedRectangle(cornerRadius: 24, style: .continuous)
        .fill(Color.white)
    )
    .overlay(
      RoundedRectangle(cornerRadius: 24, style: .continuous)
        .stroke(KnapsackBrand.line, lineWidth: 1)
    )
  }

  private var editableNotesCard: some View {
    VStack(alignment: .leading, spacing: 10) {
      Text("Write like a polished recap, not a transcript.")
        .font(KnapsackBrand.inter(14))
        .foregroundStyle(KnapsackBrand.slate)

      TextEditor(text: $draftNotes)
        .frame(minHeight: 280)
        .font(KnapsackBrand.inter(16))
        .foregroundStyle(KnapsackBrand.ink)
        .scrollContentBackground(.hidden)
        .background(Color.clear)
        .focused($isNotesEditorFocused)
    }
    .padding(20)
    .background(
      RoundedRectangle(cornerRadius: 24, style: .continuous)
        .fill(Color.white)
    )
    .overlay(
      RoundedRectangle(cornerRadius: 24, style: .continuous)
        .stroke(KnapsackBrand.line, lineWidth: 1)
    )
  }

  private var chatsSection: some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack {
        Text("Chats")
          .font(KnapsackBrand.inter(28, weight: .bold))
          .foregroundStyle(KnapsackBrand.ink)
        Spacer()
        Text("\(filteredChats.count)")
          .font(KnapsackBrand.inter(14, weight: .semibold))
          .foregroundStyle(KnapsackBrand.inkMuted)
          .padding(.horizontal, 12)
          .padding(.vertical, 8)
          .background(Capsule().fill(KnapsackBrand.paper))
      }

      if filteredChats.isEmpty {
        Text("No desktop chats available yet.")
          .font(KnapsackBrand.inter(15))
          .foregroundStyle(KnapsackBrand.slate)
      } else {
        ForEach(filteredChats) { chat in
          Button {
            loadChatDetail(chat)
          } label: {
            HStack(alignment: .top, spacing: 12) {
              VStack(alignment: .leading, spacing: 6) {
                Text(chat.thread.title ?? "Untitled chat")
                  .font(KnapsackBrand.inter(18, weight: .semibold))
                  .foregroundStyle(KnapsackBrand.ink)
                  .multilineTextAlignment(.leading)

                Text(chat.preview ?? "No preview available.")
                  .font(KnapsackBrand.inter(13))
                  .foregroundStyle(KnapsackBrand.slate)
                  .lineLimit(2)

                if let subtitle = chat.thread.subtitle,
                   subtitle.localizedCaseInsensitiveContains("agent") {
                  Label("Team chat", systemImage: "person.3.fill")
                    .font(KnapsackBrand.inter(11, weight: .semibold))
                    .foregroundStyle(KnapsackBrand.inkMuted)
                }
              }

              Spacer(minLength: 10)

              VStack(alignment: .trailing, spacing: 8) {
                Text(chatTimeString(chat.updatedAt))
                  .font(KnapsackBrand.inter(12, weight: .medium))
                  .foregroundStyle(KnapsackBrand.slate)
                Text("\(chat.messageCount) messages")
                  .font(KnapsackBrand.inter(11, weight: .medium))
                  .foregroundStyle(KnapsackBrand.inkMuted)
              }
            }
            .padding(18)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(RoundedRectangle(cornerRadius: 24, style: .continuous).fill(Color.white))
            .overlay(
              RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(viewModel.selectedChat?.id == chat.id ? KnapsackBrand.ink.opacity(0.18) : KnapsackBrand.line, lineWidth: 1)
            )
          }
          .buttonStyle(.plain)
        }
      }
    }
  }

  private func chatDetailView(_ chat: MobileChatDetail) -> some View {
    let visibleMessages = condensedMessages(for: chat.messages)

    return VStack(alignment: .leading, spacing: 20) {
      HStack(alignment: .center, spacing: 12) {
        VStack(alignment: .leading, spacing: 3) {
          Text(chat.thread.title ?? "Chat")
            .font(KnapsackBrand.inter(22, weight: .semibold))
            .foregroundStyle(KnapsackBrand.ink)
            .lineLimit(2)

          Text(chatTimeString(chat.updatedAt))
            .font(KnapsackBrand.inter(12))
            .foregroundStyle(KnapsackBrand.slate)
        }

        Spacer()

        Button {
          Task {
            await viewModel.selectChat(
              MobileChatSummary(
                thread: chat.thread,
                preview: nil,
                updatedAt: chat.updatedAt,
                messageCount: chat.messages.count
              )
            )
          }
        } label: {
          Image(systemName: "arrow.clockwise")
            .font(.system(size: 15, weight: .semibold))
            .frame(width: 38, height: 38)
            .background(Circle().fill(KnapsackBrand.paper))
        }
        .foregroundStyle(KnapsackBrand.ink)
        .accessibilityLabel("Refresh chat")
      }

      if visibleMessages.isEmpty {
        VStack(alignment: .leading, spacing: 8) {
          Text("Start the conversation")
            .font(KnapsackBrand.inter(18, weight: .semibold))
          Text("Ask about your work, meetings, or a decision you need to make.")
            .font(KnapsackBrand.inter(15))
            .foregroundStyle(KnapsackBrand.slate)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 18, style: .continuous).fill(KnapsackBrand.paper))
      }

      VStack(alignment: .leading, spacing: 16) {
        ForEach(visibleMessages, id: \.stableID) { message in
          HStack(alignment: .bottom, spacing: 8) {
            if message.role == "assistant" {
              Image(systemName: "sparkle")
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(KnapsackBrand.ink)
                .frame(width: 28, height: 28)
                .background(Circle().fill(KnapsackBrand.paper))
            }

            if message.role == "user" { Spacer(minLength: 36) }

            VStack(alignment: .leading, spacing: 7) {
              if message.role == "assistant" {
                Text("KNAPSACK")
                  .font(KnapsackBrand.inter(10, weight: .semibold))
                  .foregroundStyle(KnapsackBrand.inkMuted)
                  .tracking(0.7)
              }

              if message.role == "assistant" {
                assistantMessageContent(message)
              } else {
                markdownMessageText(message.content, foreground: .white)
              }
            }
            .padding(.horizontal, 15)
            .padding(.vertical, 13)
            .background(
              RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(message.role == "user" ? KnapsackBrand.ink : KnapsackBrand.paper)
            )
            .foregroundStyle(message.role == "user" ? Color.white : KnapsackBrand.ink)
            .frame(maxWidth: message.role == "user" ? 300 : .infinity, alignment: .leading)

            if message.role == "assistant" { Spacer(minLength: 20) }
          }
        }
      }
    }
  }

  private var chatComposer: some View {
    HStack(alignment: .bottom, spacing: 10) {
      TextField("Message Knapsack", text: $draftChatMessage, axis: .vertical)
        .font(KnapsackBrand.inter(16))
        .foregroundStyle(KnapsackBrand.ink)
        .tint(KnapsackBrand.ink)
        .lineLimit(1...4)
        .textInputAutocapitalization(.sentences)
        .padding(.horizontal, 16)
        .padding(.vertical, 11)
        .background(RoundedRectangle(cornerRadius: 20, style: .continuous).fill(KnapsackBrand.paper))

      Button {
        let pendingMessage = draftChatMessage
        guard !pendingMessage.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        draftChatMessage = ""
        Task {
          let didSend = await viewModel.sendChatMessage(pendingMessage)
          if didSend {
            presentedChat = viewModel.selectedChat
          } else {
            draftChatMessage = pendingMessage
          }
        }
      } label: {
        Group {
          if viewModel.isSendingChatMessage {
            ProgressView()
              .tint(.white)
          } else {
            Image(systemName: "arrow.up")
              .font(.system(size: 17, weight: .bold))
          }
        }
        .frame(width: 44, height: 44)
        .background(Circle().fill(KnapsackBrand.ink))
        .foregroundStyle(.white)
      }
      .disabled(viewModel.isSendingChatMessage || draftChatMessage.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
      .opacity(draftChatMessage.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? 0.45 : 1)
      .accessibilityLabel(viewModel.isSendingChatMessage ? "Sending message" : "Send message")
    }
    .padding(.horizontal, 20)
    .padding(.top, 12)
    .padding(.bottom, 10)
    .background(.ultraThinMaterial)
    .overlay(alignment: .top) { Divider().overlay(KnapsackBrand.line) }
  }

  @ViewBuilder
  private func assistantMessageContent(_ message: MobileChatMessage) -> some View {
    let isExpanded = expandedChatMessageIDs.contains(message.stableID)
    let content = readableAssistantMessage(message.content)
    let isLong = content.count > 900

    markdownMessageText(content)
      .lineLimit(isLong && !isExpanded ? 12 : nil)

    if isLong {
      Button(isExpanded ? "Show less" : "Read full answer") {
        if isExpanded {
          expandedChatMessageIDs.remove(message.stableID)
        } else {
          expandedChatMessageIDs.insert(message.stableID)
        }
      }
      .font(KnapsackBrand.inter(13, weight: .semibold))
      .foregroundStyle(KnapsackBrand.ink)
      .buttonStyle(.plain)
    }
  }

  @ViewBuilder
  private func markdownMessageText(_ content: String, foreground: Color = KnapsackBrand.ink) -> some View {
    if let markdown = try? AttributedString(markdown: sanitizedMarkdown(content)) {
      Text(markdown)
        .font(KnapsackBrand.inter(15))
        .foregroundStyle(foreground)
        .fixedSize(horizontal: false, vertical: true)
        .textSelection(.enabled)
    } else {
      Text(content)
        .font(KnapsackBrand.inter(15))
        .foregroundStyle(foreground)
        .fixedSize(horizontal: false, vertical: true)
        .textSelection(.enabled)
    }
  }

  private var chatDetailSection: some View {
    EmptyView()
  }

  private var syncSection: some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack {
        VStack(alignment: .leading, spacing: 4) {
          Text("Watch")
            .font(KnapsackBrand.inter(18, weight: .semibold))
            .foregroundStyle(KnapsackBrand.ink)
          Text("Use your watch as the fastest path into a note.")
            .font(KnapsackBrand.inter(13))
            .foregroundStyle(KnapsackBrand.slate)
        }

        Spacer()

        Image(systemName: "applewatch")
          .font(.system(size: 24, weight: .medium))
          .foregroundStyle(KnapsackBrand.inkMuted)
      }

      Button("Import Watch Clips") {
        Task {
          await watchSync.importPendingSharedRecordings(showWhenEmpty: true)
          await viewModel.refresh()
        }
      }
      .brandPill(background: KnapsackBrand.amber.opacity(0.28), foreground: KnapsackBrand.ink)

      if let message = watchSync.lastSyncMessage {
        Text("Watch sync: \(message)")
          .font(KnapsackBrand.inter(13))
          .foregroundStyle(KnapsackBrand.slate)
      } else {
        Text("Record on Apple Watch, then import clips here.")
          .font(KnapsackBrand.inter(13))
          .foregroundStyle(KnapsackBrand.slate)
      }
    }
    .cardStyle()
  }

  private func statChip(label: String, value: String) -> some View {
    VStack(alignment: .leading, spacing: 2) {
      Text(label)
        .font(KnapsackBrand.inter(10, weight: .semibold))
        .foregroundStyle(KnapsackBrand.inkMuted)
        .textCase(.uppercase)
      Text(value)
        .font(KnapsackBrand.inter(13, weight: .semibold))
        .foregroundStyle(KnapsackBrand.ink)
    }
    .padding(.horizontal, 12)
    .padding(.vertical, 10)
    .background(KnapsackBrand.paper)
    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    .overlay(
      RoundedRectangle(cornerRadius: 16, style: .continuous)
        .stroke(KnapsackBrand.line, lineWidth: 1)
    )
  }

  private func capabilityChip(label: String, isActive: Bool) -> some View {
    Text(label)
      .font(KnapsackBrand.inter(12, weight: .semibold))
      .foregroundStyle(isActive ? KnapsackBrand.ink : KnapsackBrand.inkMuted)
      .padding(.horizontal, 12)
      .padding(.vertical, 10)
      .background(KnapsackBrand.paper)
      .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
      .overlay(
        RoundedRectangle(cornerRadius: 16, style: .continuous)
          .stroke(KnapsackBrand.line, lineWidth: 1)
      )
  }

  private func detailMetaChip(label: String, value: String) -> some View {
    VStack(alignment: .leading, spacing: 3) {
      Text(label)
        .font(KnapsackBrand.inter(10, weight: .semibold))
        .foregroundStyle(KnapsackBrand.inkMuted)
        .textCase(.uppercase)
      Text(value)
        .font(KnapsackBrand.inter(13, weight: .semibold))
        .foregroundStyle(KnapsackBrand.ink)
        .lineLimit(2)
    }
    .padding(.horizontal, 12)
    .padding(.vertical, 10)
    .background(KnapsackBrand.paper)
    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    .overlay(
      RoundedRectangle(cornerRadius: 16, style: .continuous)
        .stroke(KnapsackBrand.line, lineWidth: 1)
    )
  }

  private var filteredAutopilotSections: [MobileAutopilotSection] {
    guard let brief = viewModel.autopilotBrief else { return [] }
    let term = searchText.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    guard !term.isEmpty else { return brief.sections }

    return brief.sections.compactMap { section in
      let filteredCards = section.cards.filter { card in
        let haystack = [
          card.title,
          card.subtitle,
          card.preview,
          card.rationale,
          card.badge,
        ]
          .compactMap { $0?.lowercased() }
          .joined(separator: "\n")
        return haystack.contains(term)
      }
      guard !filteredCards.isEmpty else { return nil }
      return MobileAutopilotSection(
        id: section.id,
        title: section.title,
        subtitle: section.subtitle,
        cards: filteredCards
      )
    }
  }

  private var autopilotPromptSuggestions: [String] {
    var prompts = [
      "What needs my attention first today across email, meetings, and chats?",
      "Draft the quickest replies I should send before lunch.",
      "What should I read before my next meeting?",
      "Which inbox items can I safely ignore until later?",
    ]

    if let firstCard = filteredAutopilotSections.first?.cards.first,
       let prompt = firstCard.suggestedPrompts.first {
      prompts.insert(prompt, at: 0)
    }

    var deduped: [String] = []
    for prompt in prompts where !deduped.contains(prompt) {
      deduped.append(prompt)
    }
    return deduped
  }

  private func promptButtonLabel(_ prompt: String) -> String {
    let trimmed = prompt.trimmingCharacters(in: .whitespacesAndNewlines)
    if trimmed.count <= 34 {
      return trimmed
    }
    return String(trimmed.prefix(31)) + "…"
  }

  private var filteredMeetings: [MobileMeetingDetail] {
    let term = searchText.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !term.isEmpty else { return viewModel.meetings }

    return viewModel.meetings.filter { meeting in
      let haystack = [
        meeting.thread.title,
        meeting.thread.subtitle,
        meeting.metadata.notesPreview,
        meeting.notes,
      ]
        .compactMap { $0?.lowercased() }
        .joined(separator: "\n")
      return haystack.contains(term.lowercased())
    }
  }

  private var groupedMeetings: [(title: String, meetings: [MobileMeetingDetail])] {
    let calendar = Calendar.current
    let now = Date()
    let grouped = Dictionary(grouping: filteredMeetings) { meeting in
      let date = Date(timeIntervalSince1970: meetingChronologicalTimestamp(meeting))
      if calendar.isDateInToday(date) {
        return "Today"
      } else if calendar.isDate(date, equalTo: now, toGranularity: .weekOfYear) {
        return "This Week"
      } else {
        return "Earlier"
      }
    }

    return ["Today", "This Week", "Earlier"].compactMap { key in
      guard let meetings = grouped[key], !meetings.isEmpty else { return nil }
      return (key, meetings)
    }
  }

  private var filteredChats: [MobileChatSummary] {
    let term = searchText.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    guard !term.isEmpty else { return viewModel.chats }
    return viewModel.chats.filter { chat in
      let haystack = [
        chat.thread.title,
        chat.thread.subtitle,
        chat.preview,
      ]
        .compactMap { $0?.lowercased() }
        .joined(separator: "\n")
      return haystack.contains(term)
    }
  }

  private var filteredCalendarEvents: [MobileCalendarEventSummary] {
    let term = searchText.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    guard !term.isEmpty else { return viewModel.calendarEvents }
    return viewModel.calendarEvents.filter { event in
      let haystack = [
        event.title,
        event.description,
        event.location,
        event.calendarAccountEmail,
      ]
        .compactMap { $0?.lowercased() }
        .joined(separator: "\n")
      return haystack.contains(term)
    }
  }

  private var filteredBrainEntries: [MobileBrainEntry] {
    let term = searchText.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    guard !term.isEmpty else { return viewModel.brainEntries }
    return viewModel.brainEntries.filter { entry in
      entry.name.lowercased().contains(term) || entry.relPath.lowercased().contains(term)
    }
  }

  private var gbrainBriefItems: [(title: String, detail: String)] {
    var items: [(String, String)] = []

    if let nextEvent = viewModel.calendarEvents.first {
      items.append((
        "Next up",
        "\(nextEvent.title ?? "Untitled event")\(nextEvent.start != nil ? " • \(calendarEventTimeString(nextEvent))" : "")"
      ))
    }

    if let latestMeeting = viewModel.meetings.first {
      items.append((
        "Latest note",
        latestMeeting.metadata.notesPreview ?? statusSubtitle(for: latestMeeting)
      ))
    }

    if let latestChat = viewModel.chats.first {
      items.append((
        "Live thread",
        latestChat.preview ?? "Desktop chat with \(latestChat.messageCount) messages."
      ))
    }

    if let page = viewModel.brainEntries.first(where: { !$0.isDir }) {
      items.append((
        "Saved memory",
        "Open \(formattedBrainEntryTitle(page)) when you need the long-form version."
      ))
    }

    if items.isEmpty {
      items.append((
        "Ready",
        "Once your desktop is linked, GBrain can summarize the day, surface open loops, and answer quick research questions."
      ))
    }

    return items
  }

  private var gbrainPromptSuggestions: [(label: String, prompt: String)] {
    var suggestions: [(String, String)] = [
      ("Today", "What should I stay on top of today across my meetings, notes, chats, and calendar?"),
      ("Open loops", "What are the most important open loops in my world right now, and which ones can wait?"),
    ]

    if let meeting = viewModel.meetings.first {
      suggestions.append((
        "Latest note",
        "Summarize \(meeting.thread.title ?? "my latest meeting"), extract the decisions, and tell me the next actions."
      ))
    }

    if let event = viewModel.calendarEvents.first {
      suggestions.append((
        "Next meeting",
        "Prepare me for \(event.title ?? "my next meeting") using my saved notes, people context, and relevant history."
      ))
    }

    return suggestions
  }

  private var formattedNowTime: String {
    let formatter = DateFormatter()
    formatter.dateFormat = "h:mm a"
    return formatter.string(from: Date())
  }

  private func meetingTimeString(for meeting: MobileMeetingDetail) -> String {
    let timestamp = meeting.thread.timestamp ?? meeting.metadata.updatedAt
    let date = Date(timeIntervalSince1970: normalizedUnixTimestamp(timestamp))
    let formatter = DateFormatter()
    formatter.dateStyle = .medium
    formatter.timeStyle = .short
    return formatter.string(from: date)
  }

  private func meetingTimeString(from timestamp: Int64) -> String {
    let date = Date(timeIntervalSince1970: normalizedUnixTimestamp(timestamp))
    let formatter = DateFormatter()
    formatter.dateStyle = .medium
    formatter.timeStyle = .short
    return formatter.string(from: date)
  }

  private func chatTimeString(_ timestamp: Int64) -> String {
    let date = Date(timeIntervalSince1970: normalizedUnixTimestamp(timestamp))
    let formatter = DateFormatter()
    formatter.dateStyle = .medium
    formatter.timeStyle = .short
    return formatter.string(from: date)
  }

  private func emailMessageTimestamp(_ timestamp: UInt64) -> String {
    let raw = Int64(timestamp)
    return chatTimeString(raw > 10_000_000_000 ? raw : raw * 1000)
  }

  private func statusPill(label: String) -> some View {
    Text(label)
      .font(KnapsackBrand.inter(10, weight: .semibold))
      .foregroundStyle(KnapsackBrand.inkMuted)
      .padding(.horizontal, 10)
      .padding(.vertical, 7)
      .background(Capsule().fill(KnapsackBrand.paper))
  }

  private func calendarEventTimeString(_ event: MobileCalendarEventSummary) -> String {
    guard let start = event.start else { return "Time TBD" }
    let startDate = Date(timeIntervalSince1970: normalizedUnixTimestamp(start))
    let formatter = DateFormatter()
    formatter.dateStyle = .medium
    formatter.timeStyle = .short

    if let end = event.end {
      let endDate = Date(timeIntervalSince1970: normalizedUnixTimestamp(end))
      let timeFormatter = DateFormatter()
      timeFormatter.timeStyle = .short
      timeFormatter.dateStyle = .none
      return "\(formatter.string(from: startDate))\n\(timeFormatter.string(from: startDate)) - \(timeFormatter.string(from: endDate))"
    }

    return formatter.string(from: startDate)
  }

  private func formattedBrainEntryTitle(_ entry: MobileBrainEntry) -> String {
    let baseTitle = (entry.title?.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty == false ? entry.title : entry.name) ?? entry.name
    return baseTitle
      .replacingOccurrences(of: ".md", with: "")
      .replacingOccurrences(of: "-", with: " ")
      .replacingOccurrences(of: "_", with: " ")
  }

  private func makeDailyBriefPrompt() -> String {
    "Give me a concise mobile GBrain brief for today. Use my upcoming meetings, recent notes, desktop chats, and saved brain pages to tell me: 1. what needs attention now, 2. what can wait, 3. what I should read before my next conversation."
  }

  private func makeResearchPrompt(from prompt: String) -> String {
    "Act as my mobile GBrain. Answer quickly but concretely, using my saved notes, meetings, chats, calendar, and brain pages when relevant. Focus on helping me move fast on the go.\n\nQuestion: \(prompt.trimmingCharacters(in: .whitespacesAndNewlines))"
  }

  private func runGBrainPrompt(_ prompt: String, clearComposer: Bool = false) async {
    guard let detail = await viewModel.runGBrainPrompt(prompt) else { return }
    presentedChat = detail
    selectedPane = .chats
    if clearComposer {
      gbrainDraftPrompt = ""
    }
  }

  private func handleAutopilotCardTap(_ card: MobileAutopilotCard) {
    if let prompt = card.suggestedPrompts.first, !autopilotCardIsDirectlyActionable(card) {
      gbrainDraftPrompt = prompt
      selectedPane = .chats
      return
    }

    Task {
      await viewModel.openAutopilotCard(card)
      if let email = viewModel.selectedAutopilotEmail, card.emailUID != nil {
        presentedAutopilotEmail = email
      } else if let chat = viewModel.selectedChat, card.relatedChatThreadID != nil {
        presentedChat = chat
      } else if let meeting = viewModel.selectedMeeting, card.relatedThreadID != nil {
        presentedMeeting = meeting
      }
    }
  }

  private func autopilotCardIsDirectlyActionable(_ card: MobileAutopilotCard) -> Bool {
    card.emailUID != nil || card.relatedChatThreadID != nil || card.relatedThreadID != nil
  }

  private func autopilotPrimaryActionLabel(_ card: MobileAutopilotCard) -> String {
    if card.emailUID != nil {
      return "Open thread"
    }
    if card.relatedChatThreadID != nil {
      return "Open chat"
    }
    if card.relatedThreadID != nil {
      return "Open note"
    }
    return "Ask GBrain"
  }

  private func currentPresentedAutopilotEmail(
    fallback: MobileAutopilotEmailDetail
  ) -> MobileAutopilotEmailDetail {
    guard let selectedEmail = viewModel.selectedAutopilotEmail,
          selectedEmail.id == fallback.id else {
      return fallback
    }
    return selectedEmail
  }

  private func autopilotEmailDetailView(_ detail: MobileAutopilotEmailDetail) -> some View {
    VStack(alignment: .leading, spacing: 18) {
      VStack(alignment: .leading, spacing: 14) {
        HStack(alignment: .top) {
          VStack(alignment: .leading, spacing: 6) {
            Text(detail.category.uppercased())
              .font(KnapsackBrand.inter(12, weight: .semibold))
              .foregroundStyle(KnapsackBrand.inkMuted)

            Text(detail.subject)
              .font(KnapsackBrand.spectral(32))
              .foregroundStyle(KnapsackBrand.ink)
              .fixedSize(horizontal: false, vertical: true)
          }

          Spacer()

          if let badge = detail.badge {
            Text(badge)
              .font(KnapsackBrand.inter(11, weight: .semibold))
              .foregroundStyle(KnapsackBrand.inkMuted)
              .padding(.horizontal, 10)
              .padding(.vertical, 7)
              .background(Capsule().fill(KnapsackBrand.paper))
          }
        }

        Text("From \(detail.sender) via \(detail.provider.capitalized) on \(detail.accountEmail)")
          .font(KnapsackBrand.inter(14))
          .foregroundStyle(KnapsackBrand.slate)

        if let preview = detail.preview, !preview.isEmpty {
          Text(preview)
            .font(KnapsackBrand.inter(15))
            .foregroundStyle(KnapsackBrand.ink)
            .fixedSize(horizontal: false, vertical: true)
        }

        HStack(spacing: 10) {
          Button(viewModel.isPerformingAutopilotEmailAction ? "Working…" : "Mark read") {
            Task { _ = await viewModel.performAutopilotEmailAction(.markRead) }
          }
          .brandPill(
            background: viewModel.isPerformingAutopilotEmailAction ? KnapsackBrand.paper : KnapsackBrand.ink,
            foreground: viewModel.isPerformingAutopilotEmailAction ? KnapsackBrand.inkMuted : .white
          )
          .disabled(viewModel.isPerformingAutopilotEmailAction)

          Button("Archive") {
            Task { _ = await viewModel.performAutopilotEmailAction(.archive) }
          }
          .brandPill(background: KnapsackBrand.paper, foreground: KnapsackBrand.ink)
          .disabled(viewModel.isPerformingAutopilotEmailAction)

          Button("Delete") {
            Task { _ = await viewModel.performAutopilotEmailAction(.delete) }
          }
          .brandPill(background: KnapsackBrand.paper, foreground: KnapsackBrand.coral)
          .disabled(viewModel.isPerformingAutopilotEmailAction)
        }
      }
      .cardStyle()

      VStack(alignment: .leading, spacing: 14) {
        Text("Reply")
          .font(KnapsackBrand.inter(14, weight: .semibold))
          .foregroundStyle(KnapsackBrand.inkMuted)

        TextEditor(text: $draftAutopilotReply)
          .font(KnapsackBrand.inter(15))
          .foregroundStyle(KnapsackBrand.ink)
          .frame(minHeight: 120)
          .padding(14)
          .background(Color.white)
          .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
          .overlay(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
              .stroke(KnapsackBrand.line, lineWidth: 1)
          )
          .focused($isAutopilotReplyFocused)

        HStack(spacing: 10) {
          Button(viewModel.isPerformingAutopilotEmailAction ? "Sending…" : "Send reply") {
            let reply = draftAutopilotReply
            Task {
              let sent = await viewModel.performAutopilotEmailAction(.reply, replyBody: reply)
              if sent {
                draftAutopilotReply = ""
                isAutopilotReplyFocused = false
              }
            }
          }
          .brandPill(
            background: viewModel.isPerformingAutopilotEmailAction ? KnapsackBrand.paper : KnapsackBrand.ink,
            foreground: viewModel.isPerformingAutopilotEmailAction ? KnapsackBrand.inkMuted : .white
          )
          .disabled(
            viewModel.isPerformingAutopilotEmailAction ||
            draftAutopilotReply.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
          )

          if let prompt = detail.suggestedPrompts.first {
            Button("Ask GBrain") {
              gbrainDraftPrompt = prompt
              selectedPane = .chats
              presentedAutopilotEmail = nil
            }
            .brandPill(background: KnapsackBrand.paper, foreground: KnapsackBrand.ink)
          }
        }
      }
      .cardStyle()

      VStack(alignment: .leading, spacing: 12) {
        Text("Thread")
          .font(KnapsackBrand.inter(28, weight: .bold))
          .foregroundStyle(KnapsackBrand.ink)

        ForEach(detail.messages) { message in
          VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top) {
              VStack(alignment: .leading, spacing: 4) {
                Text(message.sender)
                  .font(KnapsackBrand.inter(15, weight: .semibold))
                  .foregroundStyle(KnapsackBrand.ink)

                Text(emailMessageTimestamp(message.date))
                  .font(KnapsackBrand.inter(12))
                  .foregroundStyle(KnapsackBrand.inkMuted)
              }

              Spacer()

              if message.isArchived == true {
                statusPill(label: "Archived")
              } else if message.isRead == true {
                statusPill(label: "Read")
              } else {
                statusPill(label: "Unread")
              }
            }

            if !message.recipients.isEmpty {
              Text("To: \(message.recipients.joined(separator: ", "))")
                .font(KnapsackBrand.inter(12))
                .foregroundStyle(KnapsackBrand.slate)
            }

            Text(message.body.isEmpty ? message.summary : message.body)
              .font(KnapsackBrand.inter(14))
              .foregroundStyle(KnapsackBrand.ink)
              .fixedSize(horizontal: false, vertical: true)
              .textSelection(.enabled)
          }
          .padding(18)
          .frame(maxWidth: .infinity, alignment: .leading)
          .background(RoundedRectangle(cornerRadius: 24, style: .continuous).fill(Color.white))
          .overlay(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
              .stroke(KnapsackBrand.line, lineWidth: 1)
          )
        }
      }
    }
  }

  private func currentPresentedChat(fallback: MobileChatDetail) -> MobileChatDetail {
    guard let selectedChat = viewModel.selectedChat,
          selectedChat.id == fallback.id else {
      return fallback
    }
    return selectedChat
  }

  private func condensedMessages(for messages: [MobileChatMessage]) -> [MobileChatMessage] {
    var condensed: [MobileChatMessage] = []

    for message in messages {
      let normalized = message.content.trimmingCharacters(in: .whitespacesAndNewlines)
      guard !normalized.isEmpty else { continue }

      if let previous = condensed.last,
         previous.role == message.role,
         previous.content.trimmingCharacters(in: .whitespacesAndNewlines) == normalized {
        continue
      }

      condensed.append(message)
    }

    return condensed
  }

  private func readableAssistantMessage(_ content: String) -> String {
    var result = sanitizedMarkdown(content)

    // Some desktop responses arrive as a single calendar paragraph. Restore the
    // visual breaks a phone reader needs without changing the underlying answer.
    result = insertingLineBreaks(
      in: result,
      pattern: "(?<!\\n)(?=(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),)"
    )
    result = insertingLineBreaks(in: result, pattern: "(?<!\\n)(?=All Day:)")
    result = insertingLineBreaks(in: result, pattern: "(?<=[.!?])(?=[A-Z])")
    result = insertingLineBreaks(in: result, pattern: "(?<=(?:AM|PM))(?=\\d{1,2}:)")
    return result.trimmingCharacters(in: .whitespacesAndNewlines)
  }

  private func insertingLineBreaks(in content: String, pattern: String) -> String {
    guard let expression = try? NSRegularExpression(pattern: pattern) else { return content }
    let range = NSRange(content.startIndex..., in: content)
    return expression.stringByReplacingMatches(in: content, range: range, withTemplate: "\n")
  }

  private func sanitizedMarkdown(_ content: String) -> String {
    content
      .replacingOccurrences(of: "\r\n", with: "\n")
      .replacingOccurrences(of: "\r", with: "\n")
  }

  private func gbrainPageView(_ page: MobileBrainPage) -> some View {
    VStack(alignment: .leading, spacing: 18) {
      Text(page.relPath)
        .font(KnapsackBrand.inter(12, weight: .semibold))
        .foregroundStyle(KnapsackBrand.inkMuted)

      Text(page.title)
        .font(KnapsackBrand.spectral(34))
        .foregroundStyle(KnapsackBrand.ink)

      Text(page.content.isEmpty ? "This page is empty." : page.content)
        .font(KnapsackBrand.inter(15))
        .foregroundStyle(KnapsackBrand.ink)
        .textSelection(.enabled)
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    .padding(22)
    .background(RoundedRectangle(cornerRadius: 28, style: .continuous).fill(Color.white))
    .overlay(
      RoundedRectangle(cornerRadius: 28, style: .continuous)
        .stroke(KnapsackBrand.line, lineWidth: 1)
    )
  }

  private func statusSubtitle(for meeting: MobileMeetingDetail) -> String {
    switch meeting.metadata.status {
    case .created:
      return "Ready to start notes."
    case .recording:
      return "Recording in progress."
    case .saved, .uploaded, .ready:
      return "Notes captured and ready to polish."
    case .syncingToPhone, .uploading, .generatingNotes:
      return "Syncing and processing."
    case .failed:
      return "Needs attention."
    }
  }

  private func isReadyToStart(_ meeting: MobileMeetingDetail) -> Bool {
    meeting.metadata.status == .created
  }

  private func normalizedUnixTimestamp(_ rawTimestamp: Int64) -> TimeInterval {
    var value = Double(rawTimestamp)
    while value > 4_000_000_000 {
      value /= 1000
    }
    return value
  }

  private func meetingChronologicalTimestamp(_ meeting: MobileMeetingDetail) -> TimeInterval {
    let threadTimestamp = meeting.thread.timestamp ?? 0
    return normalizedUnixTimestamp(threadTimestamp > 0 ? threadTimestamp : meeting.metadata.updatedAt)
  }

  private func noteBlocks(from notes: String) -> [NoteBlock] {
    notes
      .components(separatedBy: .newlines)
      .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
      .filter { !$0.isEmpty }
      .map { line in
        if line.hasPrefix("## ") {
          return .heading(String(line.dropFirst(3)))
        }

        if line.hasPrefix("# ") {
          return .heading(String(line.dropFirst(2)))
        }

        if line.hasPrefix("- ") || line.hasPrefix("* ") {
          return .bullet(String(line.dropFirst(2)))
        }

        return .paragraph(line)
      }
  }

  private func awaitStatusUpdate(for meetingID: UInt64, status: MeetingStatus) async throws -> MobileMeetingMetadata {
    try await MobileAPI.shared.updateStatus(threadID: meetingID, status: status, sourceDevice: "iphone")
  }
}

private extension View {
  func cardStyle() -> some View {
    self
      .padding(20)
      .background(
        RoundedRectangle(cornerRadius: 28, style: .continuous)
          .fill(Color.white)
      )
      .overlay(
        RoundedRectangle(cornerRadius: 28, style: .continuous)
          .stroke(KnapsackBrand.line, lineWidth: 1)
      )
      .shadow(color: Color.black.opacity(0.035), radius: 18, x: 0, y: 8)
  }

  func brandPill(background: Color, foreground: Color) -> some View {
    self
      .font(KnapsackBrand.inter(15, weight: .semibold))
      .foregroundStyle(foreground)
      .padding(.horizontal, 16)
      .padding(.vertical, 11)
      .background(background)
      .clipShape(Capsule())
  }
}
