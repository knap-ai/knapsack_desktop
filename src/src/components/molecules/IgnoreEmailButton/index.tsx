import { useState, useRef, useEffect } from 'react';
import { AutopilotActions } from 'src/hooks/dataSources/useEmailAutopilot';
import { KNLocalStorage } from 'src/utils/KNLocalStorage';

const IGNORE_ACTION_STORAGE_KEY = "IGNORE_EMAIL_ACTION";

interface IgnoreEmailButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  action: AutopilotActions;
  updateAction: (actionSide: 'LEFT' | 'RIGHT', action: AutopilotActions) => void;
}

const options = [
  {value: AutopilotActions.MARK_AS_READ, label: 'Mark as read'},
  {value: AutopilotActions.ARCHIVE, label: 'Archive'},
  {value: AutopilotActions.DELETE, label: 'Delete'}
]

const labelByValue: Record<AutopilotActions, string> = options.reduce((obj, option) => {
  obj[option.value] = option.label;
  return obj;
}, {} as Record<AutopilotActions, string>);

const IgnoreEmailButton = ({
  onSuccess,
  onError,
  action: propAction,
  updateAction
}: IgnoreEmailButtonProps) => {
  const [localAction, setLocalAction] = useState<AutopilotActions>(propAction);
  const [isIgnoring, setIsIgnoring] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isUserChangeRef = useRef(false);

  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const savedAction = await KNLocalStorage.getItem(IGNORE_ACTION_STORAGE_KEY);

        if (savedAction && Object.values(AutopilotActions).includes(savedAction as AutopilotActions)) {
          setLocalAction(savedAction as AutopilotActions);
          updateAction('LEFT', savedAction as AutopilotActions);
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
        const storedAction = await KNLocalStorage.getItem(IGNORE_ACTION_STORAGE_KEY);
        if (storedAction && storedAction !== localAction &&
            Object.values(AutopilotActions).includes(storedAction as AutopilotActions)) {
          setLocalAction(storedAction as AutopilotActions);
          updateAction('LEFT', storedAction as AutopilotActions);
        }
      } catch (error) {
        console.error('Sync error:', error);
      }
    };

    const intervalId = setInterval(syncWithStorage, 500);
    return () => clearInterval(intervalId);
  }, [localAction, updateAction]);

  const handleIgnore = async () => {
    setIsIgnoring(true);
    try {
      // Add your ignore logic here if needed
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsIgnoring(false);
    }
  };

  const handleActionSelect = (selectedAction: AutopilotActions) => {
    isUserChangeRef.current = true;

    setLocalAction(selectedAction);
    updateAction('LEFT', selectedAction);

    const saveToStorage = async () => {
      try {
        await KNLocalStorage.setItem(IGNORE_ACTION_STORAGE_KEY, selectedAction);
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleIgnore}
        disabled={isIgnoring}
        className={`pl-3 pr-2 py-1.5 rounded-full bg-ks-warm-grey-200 hover:bg-ks-warm-grey-300 text-gray-700 flex items-center gap-2 ${
          isIgnoring ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <img
          className="w-4 h-5 ml-1"
          src="/assets/images/icons/LeftArrowKey.png"
          onClick={(e) => {
            e.stopPropagation();
            toggleDropdown();
          }}/>
        <div className="text-sm text-[#000000] font-medium my-0">{labelByValue[localAction]}</div>
        <img
          className="w-6 h-6 ml-1"
          src="/assets/images/drop_down_black.svg"
          onClick={(e) => {
            e.stopPropagation();
            toggleDropdown();
          }}/>
      </button>
      {isDropdownOpen && (
        <div className="absolute left-0 mt-2 w-44 rounded-md shadow-lg bg-white border-grey border-2 overflow-hidden">
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

export default IgnoreEmailButton;
