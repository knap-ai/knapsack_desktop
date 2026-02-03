import React, { useEffect } from 'react';

import { ConnectionKeys, getAccessToken, googleConnections } from 'src/api/connections';
import { openGoogleAuthScreen } from 'src/utils/permissions/google';

const googlePermissions: Record<string, boolean> = {
  [ConnectionKeys.GOOGLE_CALENDAR]: true,
  [ConnectionKeys.GOOGLE_DRIVE]: true,
  [ConnectionKeys.GOOGLE_GMAIL]: true,
  [ConnectionKeys.GOOGLE_PROFILE]: true,
};

interface GoogleAuthPopupProps {
  onClose: () => void;
  onAuth: () => Promise<void>;
  userEmail: string;
}

const GoogleAuthPopup: React.FC<GoogleAuthPopupProps> = ({
    onClose,
    onAuth,
    userEmail,
  }) => {
    useEffect(() => {
      let isActive = true;
      
      const checkAuth = async () => {
        if (!isActive) return;
        
        try {
          await getAccessToken(userEmail, ConnectionKeys.GOOGLE_PROFILE);
          if (isActive) {
            await onAuth();
            onClose();
          }
        } catch (error) {
          if (isActive) console.log("popup auth check failed");
        }
      };
  
      const interval = setInterval(checkAuth, 500);
      
      checkAuth();
  
      return () => {
        isActive = false;
        clearInterval(interval);
      };
    }, [userEmail, onAuth, onClose]);

  const handleAuth = async () => {
    try {
      await getAccessToken(userEmail, ConnectionKeys.GOOGLE_PROFILE);
      onAuth();
      onClose();
    } catch {
      let scopes: string[] = [];
      for (const [key, googlePermission] of Object.entries(googlePermissions)) {
        if (googlePermission) {
          scopes = [...scopes, ...googleConnections[key].scopes];
        }
      }
      openGoogleAuthScreen(scopes.join(' '));
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[99998]"
      onClick={handleOverlayClick}
    >
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-[99999] TightShadow">
        <span className="text-left block mb-4">
          This automation needs access to your Google account to<br />run properly
        </span>
        <button 
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={handleAuth}
        >
          Allow Access
        </button>
      </div>
    </div>
  );
};

export default GoogleAuthPopup;