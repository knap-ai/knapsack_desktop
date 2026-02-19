import React, { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { logError } from 'src/utils/errorHandling';

interface AudioPermissions {
  microphone: boolean;
  screen_recording: boolean;
  all_granted: boolean;
}

interface AudioPermissionCheckerProps {
  onBothPermissionsGranted: () => void;
}

const AudioPermissionChecker: React.FC<AudioPermissionCheckerProps> = ({
  onBothPermissionsGranted
}) => {
  const [micPermission, setMicPermission] = useState(false);
  const [systemAudioPermission, setSystemAudioPermission] = useState(false);
  const [isCheckingMic, setIsCheckingMic] = useState(false);
  const [isCheckingSystemAudio, setIsCheckingSystemAudio] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

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
        onBothPermissionsGranted();
      }
    } finally {
      setIsCheckingMic(false);
    }
  };

  const requestSystemAudioAccess = async () => {
    setIsCheckingSystemAudio(true);
    try {
      try {
        await invoke<{ success: boolean }>('open_screen_recording_settings');
      } catch (error) {
        logError(new Error('Failed to open System audio settings'), {
          additionalInfo: '',
          error: error instanceof Error ? error.message : String(error),
        })
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
        onBothPermissionsGranted();
      }
    } finally {
      setIsCheckingSystemAudio(false);
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
          onBothPermissionsGranted();
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
  }, [onBothPermissionsGranted, checkRealPermissions]);

  useEffect(() => {
    if (micPermission && systemAudioPermission) {
      onBothPermissionsGranted();
    }
  }, [micPermission, systemAudioPermission, onBothPermissionsGranted]);

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
        onBothPermissionsGranted();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [micPermission, systemAudioPermission, onBothPermissionsGranted, checkRealPermissions]);

  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-ks-warm-grey-100 z-50 flex items-center justify-center p-4">
        <div className="text-ks-warm-grey-950">Loading permissions...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-ks-warm-grey-200 bg-opacity-75 z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl flex TightShadow flex-col items-center max-w-[650px] w-full p-10">
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
              <span className="font-bold">Audio</span> and <span className="font-bold">screen</span><br/>
              access is required<br/>
              to create meeting notes
            </h1>
          </div>
          <div className="flex flex-col gap-5 w-full max-w-[400px] mx-auto">
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
                <span>Screen access enabled</span>
              </button>
            ) : (
              <button
                className="w-full py-4 px-8 bg-ks-red-800 hover:bg-ks-red-900 rounded-full text-white font-normal transition-colors"
                onClick={requestSystemAudioAccess}
                disabled={isCheckingSystemAudio}
              >
                {isCheckingSystemAudio ? 'Checking...' : 'Enable screen access'}
              </button>
            )}

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
                <span>Audio access enabled</span>
              </button>
            ) : (
              <button
                className="w-full py-4 px-8 bg-ks-red-800 hover:bg-ks-red-900 rounded-full text-white font-normal transition-colors"
                onClick={requestMicrophoneAccess}
                disabled={isCheckingMic}
              >
                {isCheckingMic ? 'Checking...' : 'Enable audio access'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPermissionChecker;
