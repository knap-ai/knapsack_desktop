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
    case agenda = "Agenda"

    var id: String { rawValue }
  }

  @StateObject private var viewModel = MeetingListViewModel()
  @StateObject private var discovery = DesktopDiscoveryCoordinator()
  @StateObject private var recorder = PhoneRecorder()
  @StateObject private var watchSync = WatchSyncCoordinator.shared
  @State private var draftNotes = ""
  @State private var draftChatMessage = ""
  @State private var searchText = ""
  @State private var selectedPane: DesktopPane = .notes
  @State private var noteDetailMode: NoteDetailMode = .read
  @State private var isShowingSettings = false
  @State private var presentedMeeting: MobileMeetingDetail?
  @State private var presentedChat: MobileChatDetail?
  @FocusState private var isNotesEditorFocused: Bool
  private let isRunningTests = ProcessInfo.processInfo.environment["XCTestConfigurationFilePath"] != nil

  var body: some View {
    TabView(selection: $selectedPane) {
      notesTab
        .tag(DesktopPane.notes)
        .tabItem {
          Label("Notes", systemImage: "note.text")
        }

      chatsTab
        .tag(DesktopPane.chats)
        .tabItem {
          Label("Chats", systemImage: "bubble.left.and.bubble.right")
        }

      agendaTab
        .tag(DesktopPane.agenda)
        .tabItem {
          Label("Agenda", systemImage: "calendar")
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
      NavigationStack {
        ScrollView {
          chatDetailView(chat)
            .padding()
        }
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
  }

  private var notesTab: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 20) {
        notesHeader
        searchBar
        quickCaptureCard
        meetingsSection
        syncSection
      }
      .padding()
    }
    .background(Color.white.ignoresSafeArea())
  }

  private var chatsTab: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 20) {
        chatsHeader
        searchBar
        chatsSection
      }
      .padding()
    }
    .background(Color.white.ignoresSafeArea())
  }

  private var agendaTab: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 20) {
        agendaHeader
        searchBar
        agendaSection
        syncSection
      }
      .padding()
    }
    .background(Color.white.ignoresSafeArea())
  }

  private var notesHeader: some View {
    sectionHeader(
      eyebrow: "Knapsack",
      title: "My Notes",
      subtitle: "Capture, review, and polish meetings without hunting through one giant screen."
    ) {
      headerActionButton(systemName: "gearshape")
    }
  }

  private var chatsHeader: some View {
    sectionHeader(
      eyebrow: "Knapsack",
      title: "Desktop Chats",
      subtitle: "Pick up active desktop conversations from your phone."
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

  private var agendaHeader: some View {
    sectionHeader(
      eyebrow: "Knapsack",
      title: "Agenda",
      subtitle: "See what is coming up, then jump straight into note capture."
    ) {
      headerActionButton(systemName: "gearshape")
    }
  }

  private func sectionHeader<Accessory: View>(
    eyebrow: String,
    title: String,
    subtitle: String,
    @ViewBuilder accessory: () -> Accessory
  ) -> some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack(alignment: .center) {
        VStack(alignment: .leading, spacing: 4) {
          Text(eyebrow)
            .font(KnapsackBrand.inter(14, weight: .semibold))
            .foregroundStyle(KnapsackBrand.inkMuted)

          Text(title)
            .font(KnapsackBrand.inter(40, weight: .bold))
            .foregroundStyle(KnapsackBrand.ink)
        }

        Spacer()

        accessory()
      }

      Text(subtitle)
        .font(KnapsackBrand.spectralItalic(20))
        .foregroundStyle(KnapsackBrand.ink.opacity(0.9))
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

      TextField("Search your workspace", text: $searchText)
        .textInputAutocapitalization(.never)
        .autocorrectionDisabled()
        .font(KnapsackBrand.inter(16))
        .foregroundStyle(KnapsackBrand.ink)
        .tint(KnapsackBrand.ink)
    }
    .padding(.horizontal, 16)
    .padding(.vertical, 14)
    .background(Color.white)
    .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
    .overlay(
      RoundedRectangle(cornerRadius: 20, style: .continuous)
        .stroke(KnapsackBrand.line, lineWidth: 1)
    )
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
        Text("Desktop connection")
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

        SecureField("Mobile pairing code", text: $viewModel.pairingCodeText)
          .textInputAutocapitalization(.never)
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

        Text("For the first connection, paste the Mobile pairing code from Settings on your Mac. If discovery misses your Mac, enter its local address here instead of 127.0.0.1.")
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

  private var quickCaptureCard: some View {
    VStack(alignment: .leading, spacing: 16) {
      HStack(alignment: .top) {
        VStack(alignment: .leading, spacing: 6) {
          Text("Quick capture")
            .font(KnapsackBrand.inter(14, weight: .semibold))
            .foregroundStyle(KnapsackBrand.inkMuted)

          Text(recorder.isRecording ? "Taking notes…" : "Ready for your next meeting")
            .font(KnapsackBrand.spectral(30))
            .foregroundStyle(KnapsackBrand.ink)
            .fixedSize(horizontal: false, vertical: true)
        }

        Spacer()

        Text(formattedNowTime)
          .font(KnapsackBrand.inter(13, weight: .semibold))
          .foregroundStyle(KnapsackBrand.slate)
      }

      HStack(spacing: 10) {
        statChip(label: "Phone", value: recorder.isRecording ? "Live" : "Ready")
        statChip(label: "Watch", value: watchSync.lastSyncMessage == nil ? "Standby" : "Synced")
        statChip(label: "Server", value: "Desktop")
      }

      HStack(spacing: 10) {
        Button(recorder.isRecording ? "Finish" : "Start notes") {
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
          Task { await viewModel.createMeeting() }
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
        Text("Desktop Chats")
          .font(KnapsackBrand.inter(28, weight: .bold))
          .foregroundStyle(KnapsackBrand.ink)
        Spacer()
        Button("New Chat") {
          Task {
            await viewModel.createChat()
            selectedPane = .chats
          }
        }
        .brandPill(background: KnapsackBrand.paper, foreground: KnapsackBrand.ink)

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
    VStack(alignment: .leading, spacing: 16) {
          HStack {
            Text(chatTimeString(chat.updatedAt))
              .font(KnapsackBrand.inter(12, weight: .medium))
              .foregroundStyle(KnapsackBrand.slate)
            Spacer()
            Button("Refresh") {
              Task { await viewModel.selectChat(MobileChatSummary(thread: chat.thread, preview: nil, updatedAt: chat.updatedAt, messageCount: chat.messages.count)) }
            }
            .brandPill(background: KnapsackBrand.paper, foreground: KnapsackBrand.ink)
          }

          Text(chat.thread.title ?? "Desktop chat")
            .font(KnapsackBrand.spectral(34))
            .foregroundStyle(KnapsackBrand.ink)

          VStack(alignment: .leading, spacing: 12) {
            ForEach(chat.messages, id: \.stableID) { message in
              VStack(alignment: .leading, spacing: 6) {
                Text(message.role == "user" ? "You" : "Knapsack")
                  .font(KnapsackBrand.inter(11, weight: .semibold))
                  .foregroundStyle(KnapsackBrand.inkMuted)
                  .textCase(.uppercase)
                Text(message.content)
                  .font(KnapsackBrand.inter(15))
                  .foregroundStyle(KnapsackBrand.ink)
              }
              .padding(14)
              .frame(maxWidth: .infinity, alignment: .leading)
              .background(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                  .fill(message.role == "user" ? KnapsackBrand.paper : Color.white)
              )
              .overlay(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                  .stroke(KnapsackBrand.line, lineWidth: 1)
              )
            }
          }

          VStack(alignment: .leading, spacing: 12) {
            Text("Reply from iPhone")
              .font(KnapsackBrand.inter(11, weight: .semibold))
              .foregroundStyle(KnapsackBrand.inkMuted)
              .textCase(.uppercase)

            TextField("Message Knapsack on your desktop", text: $draftChatMessage, axis: .vertical)
              .font(KnapsackBrand.inter(15))
              .foregroundStyle(KnapsackBrand.ink)
              .tint(KnapsackBrand.ink)
              .lineLimit(3...8)
              .textInputAutocapitalization(.sentences)
              .padding(16)
              .background(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                  .fill(KnapsackBrand.paper)
              )
              .overlay(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                  .stroke(KnapsackBrand.line, lineWidth: 1)
              )

            HStack {
              Spacer()

              Button(viewModel.isSendingChatMessage ? "Sending…" : "Send") {
                let pendingMessage = draftChatMessage
                Task {
                  let didSend = await viewModel.sendChatMessage(pendingMessage)
                  if didSend {
                    draftChatMessage = ""
                  }
                }
              }
              .brandPill(
                background: viewModel.isSendingChatMessage ? KnapsackBrand.paper : KnapsackBrand.ink,
                foreground: viewModel.isSendingChatMessage ? KnapsackBrand.inkMuted : .white
              )
              .disabled(
                viewModel.isSendingChatMessage ||
                  draftChatMessage.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
              )
            }
          }
    }
    .padding(22)
    .background(RoundedRectangle(cornerRadius: 28, style: .continuous).fill(Color.white))
    .overlay(
      RoundedRectangle(cornerRadius: 28, style: .continuous)
        .stroke(KnapsackBrand.line, lineWidth: 1)
    )
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
      let date = Date(timeIntervalSince1970: TimeInterval(meeting.metadata.updatedAt))
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
      .padding(18)
      .background(
        RoundedRectangle(cornerRadius: 26, style: .continuous)
          .fill(Color.white)
      )
      .overlay(
        RoundedRectangle(cornerRadius: 26, style: .continuous)
          .stroke(KnapsackBrand.line, lineWidth: 1)
      )
  }

  func brandPill(background: Color, foreground: Color) -> some View {
    self
      .font(KnapsackBrand.inter(15, weight: .semibold))
      .foregroundStyle(foreground)
      .padding(.horizontal, 16)
      .padding(.vertical, 12)
      .background(background)
      .clipShape(Capsule())
  }
}
