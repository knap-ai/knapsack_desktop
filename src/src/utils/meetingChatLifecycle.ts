export interface MeetingChatLifecycleState {
  mounted: boolean
  minimized: boolean
  busy: boolean
}

export type MeetingChatLifecycleAction =
  | { type: 'open' }
  | { type: 'minimize' }
  | { type: 'set-busy'; busy: boolean }

export const initialMeetingChatLifecycle: MeetingChatLifecycleState = {
  mounted: false,
  minimized: false,
  busy: false,
}

export function meetingChatLifecycleReducer(
  state: MeetingChatLifecycleState,
  action: MeetingChatLifecycleAction,
): MeetingChatLifecycleState {
  switch (action.type) {
    case 'open':
      if (state.mounted && !state.minimized) return state
      return { ...state, mounted: true, minimized: false }
    case 'minimize':
      if (!state.mounted || state.minimized) return state
      return { ...state, minimized: true }
    case 'set-busy':
      if (state.busy === action.busy) return state
      return { ...state, busy: action.busy }
  }
}

export const meetingChatLauncherLabel = (state: MeetingChatLifecycleState): string => {
  if (!state.mounted) return 'Ask about this meeting'
  return state.busy ? 'Meeting chat is still working — reopen' : 'Meeting chat minimized — reopen'
}
