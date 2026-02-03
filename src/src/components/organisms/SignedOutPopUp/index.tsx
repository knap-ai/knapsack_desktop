import React from 'react';

interface SignOutPopupProps {
  onClose: () => void;
  onSignIn: () => void;
}

const SignOutPopup: React.FC<SignOutPopupProps> = ({
  onClose,
  onSignIn,
}) => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-[51]">
        <span className="text-left block mb-4">
          Your session has expired.<br />Please sign in again to continue.
        </span>
        <button 
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={onSignIn}
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default SignOutPopup;