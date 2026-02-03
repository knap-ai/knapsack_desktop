import { useEffect, useRef, useState } from 'react';
import { sendGmailReply } from '../../../utils/gmailService';
import { DisplayEmail } from 'src/hooks/feed/useFeed'
import { ConnectionKeys } from 'src/api/connections';
import DataFetcher from 'src/utils/data_fetch';
import { AutopilotActions } from 'src/hooks/dataSources/useEmailAutopilot';
import { KNLocalStorage } from 'src/utils/KNLocalStorage';

const SEND_EMAIL_ACTION_STORAGE_KEY = "SEND_EMAIL_ACTION";

const options = [
  {value: AutopilotActions.SEND_REPLY, label: 'Send reply'},
  {value: AutopilotActions.REPLY_ARCHIVE, label: 'Reply and archive'},
  {value: AutopilotActions.REPLY_DELETE, label: 'Reply and delete'}
]

const labelByValue: Record<AutopilotActions, string> = options.reduce((obj, option) => {
  obj[option.value] = option.label;
  return obj;
}, {} as Record<AutopilotActions, string>);

interface SendEmailButtonProps {
  previousEmail: DisplayEmail,
  userEmail: string
  userName: string
  body: string
  threadId?: string
  emailUid: string
  profileProvider: string
  shouldSend: boolean
  action: AutopilotActions
  onSuccess?: () => void
  onError?: (error: Error) => void
  updateAction: (actionSide: 'LEFT' | 'RIGHT', action: AutopilotActions) => void;
}

const SendEmailButton = ({
  previousEmail,
  userEmail,
  userName,
  body,
  threadId,
  onSuccess,
  onError,
  emailUid,
  profileProvider,
  shouldSend,
  action: propAction,
  updateAction,
}: SendEmailButtonProps) => {
  const [localAction, setLocalAction] = useState<AutopilotActions>(propAction);
  const [isSending, setIsSending] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isUserChangeRef = useRef(false);

  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const savedAction = await KNLocalStorage.getItem(SEND_EMAIL_ACTION_STORAGE_KEY);

        if (savedAction && Object.values(AutopilotActions).includes(savedAction as AutopilotActions)) {
          setLocalAction(savedAction as AutopilotActions);
          updateAction('RIGHT', savedAction as AutopilotActions);
        } else {
          setLocalAction(propAction);
        }
      } catch (error) {
        console.error('Failed to load preference:', error);
      }
    };

    loadFromStorage();
  }, []);

  useEffect(() => {
    const syncWithStorage = async () => {
      if (isUserChangeRef.current) return;

      try {
        const storedAction = await KNLocalStorage.getItem(SEND_EMAIL_ACTION_STORAGE_KEY);
        if (storedAction && storedAction !== localAction &&
            Object.values(AutopilotActions).includes(storedAction as AutopilotActions)) {
          setLocalAction(storedAction as AutopilotActions);
          updateAction('RIGHT', storedAction as AutopilotActions);
        }
      } catch (error) {
        console.error('Sync error:', error);
      }
    };

    const intervalId = setInterval(syncWithStorage, 500);
    return () => clearInterval(intervalId);
  }, [localAction, updateAction]);

  const handleSend = async () => {
    setIsSending(true);
    try {
      if (profileProvider === ConnectionKeys.MICROSOFT_PROFILE) {
        const dataFetcher = new DataFetcher()
        await dataFetcher.postOutlookSendReply(userEmail, emailUid, body, previousEmail)
      } else {
        await sendGmailReply({
          previousEmail,
          userEmail,
          userName,
          body,
          threadId,
        });
      }
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsSending(false);
    }
  };

  const handleActionSelect = (selectedAction: AutopilotActions) => {
    isUserChangeRef.current = true;

    setLocalAction(selectedAction);
    updateAction('RIGHT', selectedAction);

    const saveToStorage = async () => {
      try {
        await KNLocalStorage.setItem(SEND_EMAIL_ACTION_STORAGE_KEY, selectedAction);
        isUserChangeRef.current = false;
      } catch (error) {
        console.error('Error saving:', error);
        isUserChangeRef.current = false;
      }
    };

    saveToStorage();

    toggleDropdown();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (shouldSend)
      handleSend()
  }, [shouldSend])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleSend}
        disabled={isSending}
        className={`inline-flex items-center pl-2 pr-3 py-1.5 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-ks-red-800 hover:bg-ks-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 gap-2 ${
          isSending ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSending ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </>
        ) : (
          <>
          <img
            className="w-6 h-6 ml-0"
            src="/assets/images/drop_down_white.svg"
            onClick={(e) => {
              e.stopPropagation();
              toggleDropdown();
            }}/>
            {labelByValue[localAction]}
            <img src="/assets/images/icons/RightArrowKey.png"
              alt="Send" className="w-4 h-5" />
          </>
        )}
      </button>
      {isDropdownOpen && (
        <div className="absolute left-0 mt-2 w-44 shadow-lg bg-white border-grey border-2 rounded-md overflow-hidden">
          <div className="py-0" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {
              options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleActionSelect(option.value)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                  role="menuitem"
                >
                  {option.label}
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default SendEmailButton;
