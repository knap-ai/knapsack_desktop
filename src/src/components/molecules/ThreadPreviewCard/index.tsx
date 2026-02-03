import dayjs from 'dayjs'
import KNUtils from 'src/utils/KNStringUtils'
import { useState, useRef, useEffect } from 'react'

import PencilIcon from '/assets/images/icons/pencil.svg'
import TrashIcon from '/assets/images/icons/trash.svg'
import KNDateUtils from 'src/utils/KNDateUtils'

interface ThreadPreviewCardProps {
  title: string
  subTitle: string
  executedTime: Date
  isSelected: boolean
  isRecording: boolean | undefined
  setIsSelected: () => void
  hasLabel?: boolean
  showFullDate?: boolean
  onTitleChange?: (newTitle: string) => void
  onDelete?: () => void
}

const ThreadPreviewCard = ({
  title,
  subTitle,
  executedTime,
  isSelected,
  isRecording,
  setIsSelected,
  hasLabel = false,
  showFullDate = false,
  onTitleChange,
  onDelete,
}: ThreadPreviewCardProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState(title);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const titleRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formattedTime = showFullDate
    ? KNDateUtils.formatDayWithCleanTime(executedTime)
    : dayjs(executedTime).format('h:mm A').toString();

  const isTitleTruncated = title.length > 22;

  useEffect(() => {
    setEditableTitle(title);
  }, [title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (showTooltip && tooltipRef.current && titleRef.current) {
      const titleRect = titleRef.current.getBoundingClientRect();
      tooltipRef.current.style.left = `${titleRect.left}px`;
      tooltipRef.current.style.top = `${titleRect.bottom + 5}px`;
    }
  }, [showTooltip]);

  useEffect(() => {
    const handleMouseEnterCard = () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovering(true);
      }, 50)
    }

    const handleMouseLeaveCard = () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovering(false);
      }, 50)
    }

    const cardElement = cardRef.current;
    if (cardElement) {
      cardElement.addEventListener('mouseenter', handleMouseEnterCard)
      cardElement.addEventListener('mouseleave', handleMouseLeaveCard)
    }

    return () => {
      if (cardElement) {
        cardElement.removeEventListener('mouseenter', handleMouseEnterCard)
        cardElement.removeEventListener('mouseleave', handleMouseLeaveCard)
      }
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  const handleEditClick = (e: React.MouseEvent) => {
    if (onTitleChange) {
      e.stopPropagation();
      setIsEditing(true);
    }
  };

  const handleTrashClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
    setShowConfirmDelete(false);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmDelete(false);
  };

  const saveTitle = () => {
    setIsEditing(false);
    if (onTitleChange && editableTitle.trim() !== title && editableTitle.trim() !== '') {
      onTitleChange(editableTitle.trim());
    } else {
      setEditableTitle(title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTitle();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditableTitle(title);
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={() => setIsSelected()}
      className={`w-full max-w-[45rem] ml-auto mr-auto px-2 ${
        hasLabel ? 'pb-2' : 'py-2'
      } rounded-[4px] flex-col justify-start items-start inline-flex transition-colors cursor-pointer rounded-lg ${
        isSelected ? 'opacity-100 text-warm-grey-950 font-medium' : 'text-warm-grey-800 font-normal'
      }`}
    >
      <div className={`flex flex-row gap-x-1 self-stretch items-center w-full`}>
        {isRecording && <div className="w-2 h-2 rounded bg-[#c14841] animate-pulse" />}
        <div className="flex-grow min-w-0 flex-col leading-4 justify-start items-start">
          <div
            className="relative flex items-center"
            ref={titleRef}
            onMouseEnter={() => isTitleTruncated && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={handleKeyDown}
                className="text-sm w-full bg-white border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '200px' }}
              />
            ) : (
              <div className={`text-sm truncate w-full ${isSelected ? '' : 'opacity-60'}`}>
                {title !== '' ? KNUtils.shortenText(title, 22) : 'New Chat'}
              </div>
            )}
  
            {showTooltip && isTitleTruncated && !isEditing && (
              <div
                ref={tooltipRef}
                className="fixed z-50 bg-white text-black px-3 py-1 rounded-md TightShadow w-56 break-words text-xs"
              >
                {title}
              </div>
            )}
          </div>
          {subTitle && (
            <div className={`text-sm font-semibold leading-tight truncate w-full ${isSelected ? 'opacity-60' : ''}`}>
              {subTitle}
            </div>
          )}
        </div>
        <div
          className="flex-shrink-0 flex-col justify-start items-end gap-1 min-w-[100px] px-2"
        >
          <div className="flex items-center justify-end gap-1 w-full">
            {showConfirmDelete ? (
              <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                <button
                  className="text-sm text-ks-warm-grey-600 hover:text-ks-warm-grey-700"
                  onClick={handleCancelDelete}
                >
                  Cancel
                </button>
                <button
                  className="text-sm text-ks-red-800 hover:text-ks-red-900"
                  onClick={handleConfirmDelete}
                >
                  Delete
                </button>
              </div>
            ) : (
              isHovering && (onTitleChange || onDelete) ? (
                <div className="flex gap-5">
                  {onTitleChange && (
                    <img
                      src={PencilIcon}
                      alt="Edit title"
                      className="w-4 h-4 cursor-pointer opacity-60 hover:opacity-100"
                      onClick={handleEditClick}
                    />
                  )}
                  {onDelete && (
                    <img
                      src={TrashIcon}
                      alt="Delete item"
                      className="w-4 h-4 cursor-pointer opacity-60 hover:opacity-100"
                      onClick={handleTrashClick}
                    />
                  )}
                </div>
              ) : (
                <div className={`text-right text-sm leading-4 ${isSelected ? '' : 'opacity-60'}`}>
                  {formattedTime}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadPreviewCard;
