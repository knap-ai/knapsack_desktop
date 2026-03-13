import React, { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { logError } from 'src/utils/errorHandling';
import {
  getMeetingChatAutoSend,
  setMeetingChatAutoSend,
  getMeetingChatMessage,
  setMeetingChatMessage,
} from 'src/utils/settings';

interface AudioPermissions {
  microphone: boolean;
  screen_recording: boolean;
  all_granted: boolean;
}

interface AudioPermissionCheckerProps {
  onBothPermissionsGranted: () => void;
  onClose?: () => void;
}

const AudioPermissionChecker: React.FC<AudioPermissionCheckerProps> = ({
  onBothPermissionsGranted,
  onClose,
}) => {
  const [micPermission, setMicPermission] = useState(false);
  const [systemAudioPermission, setSystemAudioPermission] = useState(false);
  const [isCheckingMic, setIsCheckingMic] = useState(false);
  const [isCheckingSystemAudio, setIsCheckingSystemAudio] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [systemAudioAttempts, setSystemAudioAttempts] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  // Meeting chat notice opt-in state
  const [showChatNoticeStep, setShowChatNoticeStep] = useState(false);
  const [chatNoticeEnabled, setChatNoticeEnabled] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isEditingMessage, setIsEditingMessage] = useState(false);

  const checkRealPermissions = useCallback(async (): Promise<AudioPermissions> => {
    try {
      const permissions = await invoke<AudioPermissions>('check_audio_permissions');
      return permissions;
    } catch {
      // Fallback: if the command isn't available, use localStorage as before
      return {
        microphone: localStorage.getItem('micPermissionGranted') === 'true',
        screen_recording: localStorage.getItem('screenPermissionGranted') === 'true',
        all_granted:
          localStorage.getItem('micPermissionGranted') === 'true' &&
          localStorage.getItem('screenPermissionGranted') === 'true',
      };
    }
  }, []);

  // When both permissions are granted, transition to the chat notice step
  // instead of immediately dismissing
  const handleAudioPermissionsReady = useCallback(() => {
    // If the user has already configured the meeting chat notice before
    // (permissionsDismissed was set in a previous session), skip straight
    // to dismissing.
    const alreadyConfigured = localStorage.getItem('kn_meeting_chat_configured') === 'true';
    if (alreadyConfigured) {
      onBothPermissionsGranted();
    } else {
      setShowChatNoticeStep(true);
    }
  }, [onBothPermissionsGranted]);

  const handleFinishSetup = useCallback(async () => {
    await setMeetingChatAutoSend(chatNoticeEnabled);
    if (chatMessage) {
      await setMeetingChatMessage(chatMessage);
    }
    localStorage.setItem('kn_meeting_chat_configured', 'true');
    onBothPermissionsGranted();
  }, [chatNoticeEnabled, chatMessage, onBothPermissionsGranted]);

  // Load existing chat notice settings when the step appears
  useEffect(() => {
    if (showChatNoticeStep) {
      getMeetingChatAutoSend().then(setChatNoticeEnabled);
      getMeetingChatMessage().then(setChatMessage);
    }
  }, [showChatNoticeStep]);

  const requestMicrophoneAccess = async () => {
    setIsCheckingMic(true);
    try {
      try {
        await invoke<{ success: boolean }>('open_microphone_settings');
      } catch (err) {
        logError(new Error('Failed to open Mic settings'), {
          additionalInfo: '',
          error: err instanceof Error ? err.message : String(err),
        })
      }

      // Try browser getUserMedia to trigger the OS permission prompt
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
      } catch {
        // getUserMedia may fail, but the user might still grant via System Settings
      }

      // Re-check the actual OS permission status
      const permissions = await checkRealPermissions();
      setMicPermission(permissions.microphone);
      if (permissions.microphone) {
        localStorage.setItem('micPermissionGranted', 'true');
      } else {
        localStorage.removeItem('micPermissionGranted');
      }

      if (permissions.all_granted) {
        handleAudioPermissionsReady();
      }
    } finally {
      setIsCheckingMic(false);
    }
  };

  const requestSystemAudioAccess = async () => {
    setIsCheckingSystemAudio(true);
    setSystemAudioAttempts(prev => prev + 1);
    try {
      let settingsResult: { success: boolean; already_granted?: boolean } | undefined;
      try {
        settingsResult = await invoke<{ success: boolean; already_granted?: boolean }>('open_screen_recording_settings');
      } catch (error) {
        logError(new Error('Failed to open System audio settings'), {
          additionalInfo: '',
          error: error instanceof Error ? error.message : String(error),
        })
      }

      // If the tap probe in open_screen_recording_settings already confirmed
      // permission is granted, update state immediately without waiting.
      if (settingsResult?.already_granted) {
        setSystemAudioPermission(true);
        localStorage.setItem('screenPermissionGranted', 'true');
        const permissions = await checkRealPermissions();
        setMicPermission(permissions.microphone);
        if (permissions.microphone) {
          localStorage.setItem('micPermissionGranted', 'true');
        }
        if (permissions.all_granted) {
          handleAudioPermissionsReady();
        }
        return;
      }

      // Wait a moment for the user to interact with System Settings
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Re-check the actual OS permission status
      const permissions = await checkRealPermissions();
      setSystemAudioPermission(permissions.screen_recording);
      if (permissions.screen_recording) {
        localStorage.setItem('screenPermissionGranted', 'true');
      } else {
        localStorage.removeItem('screenPermissionGranted');
      }

      if (permissions.all_granted) {
        handleAudioPermissionsReady();
      }
    } finally {
      setIsCheckingSystemAudio(false);
    }
  };

  const resetPermissions = async () => {
    setIsResetting(true);
    try {
      try {
        await invoke('reset_audio_permissions');
      } catch (error) {
        logError(new Error('Failed to reset audio permissions'), {
          additionalInfo: '',
          error: error instanceof Error ? error.message : String(error),
        });
      }

      // Wait for the OS to process the reset and re-prompt
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Re-check permissions
      const permissions = await checkRealPermissions();
      setMicPermission(permissions.microphone);
      setSystemAudioPermission(permissions.screen_recording);

      if (permissions.microphone) {
        localStorage.setItem('micPermissionGranted', 'true');
      }
      if (permissions.screen_recording) {
        localStorage.setItem('screenPermissionGranted', 'true');
      }
      if (permissions.all_granted) {
        handleAudioPermissionsReady();
      }
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    const initialCheck = async () => {
      try {
        const permissions = await checkRealPermissions();
        setMicPermission(permissions.microphone);
        setSystemAudioPermission(permissions.screen_recording);

        // Sync localStorage with actual OS state
        if (permissions.microphone) {
          localStorage.setItem('micPermissionGranted', 'true');
        } else {
          localStorage.removeItem('micPermissionGranted');
        }
        if (permissions.screen_recording) {
          localStorage.setItem('screenPermissionGranted', 'true');
        } else {
          localStorage.removeItem('screenPermissionGranted');
        }

        if (permissions.all_granted) {
          handleAudioPermissionsReady();
        }
      } catch (error) {
        logError(new Error('Permission initialization check failed'), {
          additionalInfo: '',
          error: error instanceof Error ? error.message : String(error),
        })
      } finally {
        setIsInitializing(false);
      }
    };

    initialCheck();
  }, [handleAudioPermissionsReady, checkRealPermissions]);

  // Both permissions required — transition to chat notice step when both are true
  useEffect(() => {
    if (micPermission && systemAudioPermission) {
      handleAudioPermissionsReady();
    }
  }, [micPermission, systemAudioPermission, handleAudioPermissionsReady]);

  // Poll for permission changes while the component is visible
  // (user may grant permissions in System Settings without coming back to the app)
  useEffect(() => {
    if (micPermission && systemAudioPermission) return;

    const interval = setInterval(async () => {
      const permissions = await checkRealPermissions();
      if (permissions.microphone && !micPermission) {
        setMicPermission(true);
        localStorage.setItem('micPermissionGranted', 'true');
      }
      if (permissions.screen_recording && !systemAudioPermission) {
        setSystemAudioPermission(true);
        localStorage.setItem('screenPermissionGranted', 'true');
      }
      if (permissions.all_granted) {
        handleAudioPermissionsReady();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [micPermission, systemAudioPermission, handleAudioPermissionsReady, checkRealPermissions]);

  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-ks-warm-grey-100 z-50 flex items-center justify-center p-4">
        <div className="text-ks-warm-grey-950">Loading permissions...</div>
      </div>
    );
  }

  // ── Meeting chat notice opt-in step ──
  if (showChatNoticeStep) {
    return (
      <div className="fixed inset-0 bg-ks-warm-grey-200 bg-opacity-75 z-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl flex TightShadow flex-col items-center max-w-[650px] w-full p-10 relative">
          <div className="w-full max-w-[300px] bg-[#2D2D2D] rounded-xl TightShadow overflow-hidden mb-8">
            <div className="py-4 px-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white rounded-xl p-1 w-9 h-9 flex items-center justify-center">
                  <img
                    src="/assets/images/knap-logo-medium.png"
                    alt="Knapsack Logo"
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <span className="text-white text-xl font-medium">Knapsack</span>
              </div>

              <div className="w-12 h-6 bg-[#0066FF] rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="mb-6">
              <h1 className="text-4xl text-ks-warm-grey-950 !font-Lora">
                <span className="font-bold">Notify</span> attendees<br/>
                when you're taking notes
              </h1>
              <p className="text-sm text-ks-warm-grey-500 mt-3 max-w-[400px] mx-auto leading-5">
                Automatically send a message in your meeting chat to let others know Knapsack is transcribing. This uses macOS Accessibility to paste into Zoom or Google Meet.
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-[440px] mx-auto">
              {/* Toggle for auto-send */}
              <button
                className={`flex items-center justify-between w-full py-4 px-6 rounded-full font-normal transition-colors border-[1px] border-solid ${
                  chatNoticeEnabled
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : 'bg-ks-warm-grey-50 border-ks-warm-grey-300 text-ks-warm-grey-700'
                }`}
                onClick={() => setChatNoticeEnabled(!chatNoticeEnabled)}
              >
                <span className="text-left">
                  Auto-send meeting chat notice
                </span>
                <div className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ml-3 ${
                  chatNoticeEnabled ? 'bg-[#0066FF]' : 'bg-ks-warm-grey-300'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                    chatNoticeEnabled ? 'right-0.5' : 'left-0.5'
                  }`}></div>
                </div>
              </button>

              {/* Message preview / edit */}
              {chatNoticeEnabled && (
                <div className="bg-ks-warm-grey-50 border border-ks-warm-grey-200 rounded-xl p-4 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-ks-warm-grey-500 tracking-wide">
                      MESSAGE
                    </span>
                    <button
                      className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                      onClick={() => setIsEditingMessage(!isEditingMessage)}
                    >
                      {isEditingMessage ? 'Done' : 'Edit'}
                    </button>
                  </div>
                  {isEditingMessage ? (
                    <textarea
                      className="w-full text-sm text-ks-warm-grey-800 bg-white border border-ks-warm-grey-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-300"
                      rows={2}
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                    />
                  ) : (
                    <p className="text-sm text-ks-warm-grey-800 leading-5">
                      "{chatMessage}"
                    </p>
                  )}
                </div>
              )}

              {/* Done button */}
              <button
                className="w-full py-4 px-8 bg-ks-red-800 hover:bg-ks-red-900 rounded-full text-white font-normal transition-colors mt-2"
                onClick={handleFinishSetup}
              >
                {chatNoticeEnabled ? 'Enable & continue' : 'Skip for now'}
              </button>

              <p className="text-xs text-ks-warm-grey-400 leading-5">
                You can change this anytime in Settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Audio permissions step ──
  return (
    <div className="fixed inset-0 bg-ks-warm-grey-200 bg-opacity-75 z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl flex TightShadow flex-col items-center max-w-[650px] w-full p-10 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-ks-warm-grey-500 hover:text-ks-warm-grey-800 hover:bg-ks-warm-grey-100 transition-colors"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        <div className="w-full max-w-[300px] bg-[#2D2D2D] rounded-xl TightShadow overflow-hidden mb-8">
          <div className="py-4 px-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-xl p-1 w-9 h-9 flex items-center justify-center">
                <img
                  src="/assets/images/knap-logo-medium.png"
                  alt="Knapsack Logo"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <span className="text-white text-xl font-medium">Knapsack</span>
            </div>

            <div className="w-12 h-6 bg-[#0066FF] rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-4xl text-ks-warm-grey-950 !font-Lora">
              <span className="font-bold">Audio</span> access<br/>
              is required<br/>
              to create meeting notes
            </h1>
          </div>
          <div className="flex flex-col gap-5 w-full max-w-[400px] mx-auto">
            {/* Microphone permission */}
            {micPermission ? (
              <button
                className="flex items-center justify-center gap-3 w-full py-4 px-8 bg-ks-warm-grey-50 rounded-full text-ks-warm-grey-950 font-normal border-[1px] border-solid border-ks-warm-grey-950"
                disabled
              >
                <img
                  src="/assets/images/icons/Bullet-Check.svg"
                  alt="Check"
                  className="w-6 h-6"
                />
                <span>Microphone access enabled</span>
              </button>
            ) : (
              <button
                className="w-full py-4 px-8 bg-ks-red-800 hover:bg-ks-red-900 rounded-full text-white font-normal transition-colors"
                onClick={requestMicrophoneAccess}
                disabled={isCheckingMic}
              >
                {isCheckingMic ? 'Checking...' : 'Enable microphone access'}
              </button>
            )}

            {/* System audio permission */}
            {systemAudioPermission ? (
              <button
                className="flex items-center justify-center gap-3 w-full py-4 px-8 bg-ks-warm-grey-50 rounded-full text-ks-warm-grey-950 font-normal border-[1px] border-solid border-ks-warm-grey-950"
                disabled
              >
                <img
                  src="/assets/images/icons/Bullet-Check.svg"
                  alt="Check"
                  className="w-6 h-6"
                />
                <span>System audio access enabled</span>
              </button>
            ) : (
              <button
                className={`w-full py-4 px-8 rounded-full font-normal transition-colors ${
                  micPermission
                    ? 'bg-ks-red-800 hover:bg-ks-red-900 text-white'
                    : 'bg-ks-warm-grey-200 text-ks-warm-grey-500 cursor-not-allowed'
                }`}
                onClick={requestSystemAudioAccess}
                disabled={isCheckingSystemAudio || !micPermission}
              >
                {isCheckingSystemAudio ? 'Checking...' : 'Enable system audio access'}
              </button>
            )}
          </div>
          {(!micPermission || !systemAudioPermission) && (
            <div className="mt-6 max-w-[400px] mx-auto text-center">
              {systemAudioAttempts >= 2 && !systemAudioPermission ? (
                <>
                  <p className="text-xs text-ks-warm-grey-500 leading-5 mb-3">
                    Still not detected? Your permissions may be stale. Try resetting them:
                  </p>
                  <button
                    className="text-xs text-ks-red-800 hover:text-ks-red-900 underline transition-colors"
                    onClick={resetPermissions}
                    disabled={isResetting}
                  >
                    {isResetting ? 'Resetting permissions...' : 'Reset and re-request permissions'}
                  </button>
                  <p className="text-xs text-ks-warm-grey-400 mt-2 leading-5">
                    This will clear saved permissions. You may need to re-enable Knapsack in System Settings and restart the app.
                  </p>
                </>
              ) : (
                <p className="text-xs text-ks-warm-grey-500 leading-5">
                  Already enabled in System Settings? This screen will update automatically once access is detected. If it doesn't, try quitting and reopening Knapsack.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioPermissionChecker;
