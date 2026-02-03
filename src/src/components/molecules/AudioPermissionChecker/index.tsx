import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { logError } from 'src/utils/errorHandling';

interface AudioPermissionCheckerProps {
  onBothPermissionsGranted: () => void;
}

const AudioPermissionChecker: React.FC<AudioPermissionCheckerProps> = ({ 
  onBothPermissionsGranted 
}) => {
  const [micPermission, setMicPermission] = useState(localStorage.getItem('micPermissionGranted') === 'true');
  const [systemAudioPermission, setSystemAudioPermission] = useState(localStorage.getItem('screenPermissionGranted') === 'true');
  const [isCheckingMic, setIsCheckingMic] = useState(false);
  const [isCheckingSystemAudio, setIsCheckingSystemAudio] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const checkAndConfirmMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());

      setMicPermission(true);
      localStorage.setItem('micPermissionGranted', 'true');
      return true;
    } catch (error) {
      setMicPermission(false);
      localStorage.removeItem('micPermissionGranted');
      return false;
    }
  };

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

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      setMicPermission(true);
      localStorage.setItem('micPermissionGranted', 'true');

      if (systemAudioPermission) {
        onBothPermissionsGranted();
      }
      
      return true;
    } catch (error) {
      setMicPermission(false);
      localStorage.removeItem('micPermissionGranted');
      return false;
    } finally {
      setIsCheckingMic(false);
    }
  };

  const requestSystemAudioAccess = async () => {
    setIsCheckingSystemAudio(true);
    try {
      try {
        await invoke<{ success: boolean }>('open_screen_recording_settings');

        setSystemAudioPermission(true);
        localStorage.setItem('screenPermissionGranted', 'true');

        if (micPermission) {
          onBothPermissionsGranted();
        }
        
        return true;
      } catch (error) {
        logError(new Error('Failed to open System audio settings'), {
          additionalInfo: '',
          error: error instanceof Error ? error.message : String(error),
        })
        localStorage.removeItem('screenPermissionGranted');
        return false;
      }
    } catch (error) {
      setSystemAudioPermission(false);
      localStorage.removeItem('screenPermissionGranted');
      return false;
    } finally {
      setIsCheckingSystemAudio(false);
    }
  };

  useEffect(() => {
    const initialCheck = async () => {
      try {
        if (localStorage.getItem('micPermissionGranted') === 'true' && 
            localStorage.getItem('screenPermissionGranted') === 'true') {
          const hasMicPermission = await checkAndConfirmMicrophonePermission();
          
          if (hasMicPermission) {
            onBothPermissionsGranted();
          }
        } else {
          const hasMicPermission = await checkAndConfirmMicrophonePermission();
          
          if (hasMicPermission && localStorage.getItem('screenPermissionGranted') === 'true') {
            onBothPermissionsGranted();
          }
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
  }, [onBothPermissionsGranted]);

  useEffect(() => {
    if (micPermission && systemAudioPermission) {
      onBothPermissionsGranted();
    }
  }, [micPermission, systemAudioPermission, onBothPermissionsGranted]);

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
                {isCheckingSystemAudio ? 'Opening...' : 'Enable screen access'}
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
                {isCheckingMic ? 'Opening...' : 'Enable audio access'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPermissionChecker;