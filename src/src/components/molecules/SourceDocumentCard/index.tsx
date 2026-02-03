import { SourceDocument } from 'src/utils/SourceDocument';
import { open } from '@tauri-apps/api/shell';
import { useState } from 'react';
import { FaFile, FaLink, FaBook, FaVideo, FaImage } from 'react-icons/fa';
import { XMarkIcon } from '@heroicons/react/24/outline'
import KNStringUtils from 'src/utils/KNStringUtils'

interface SourceDocumentProps {
  index: number
  sourceDocument: SourceDocument
  onXClick: (index: number) => void
}

const SourceDocumentCard = ({ index, sourceDocument, onXClick }: SourceDocumentProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = async () => {
    try {
      if (sourceDocument.uri) {
        await open(sourceDocument.uri);
      }
    } catch (error) {
      console.error('Failed to open document:', error);
    }
  };

  const getDocumentIcon = () => {
    switch (sourceDocument.documentType.toLowerCase()) {
      case 'local_files':
        return <FaFile className="w-4 h-4" />;
      case 'web':
        return <FaLink className="w-4 h-4" />;
      case 'book':
        return <FaBook className="w-4 h-4" />;
      case 'video':
        return <FaVideo className="w-4 h-4" />;
      case 'image':
        return <FaImage className="w-4 h-4" />;
      default:
        return <FaFile className="w-4 h-4" />;
    }
  };

  return (
    <div
      key={index}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        onClick={handleClick}
        className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full hover:bg-gray-100 cursor-pointer transition-colors duration-200 TightShadow"
      >
        {getDocumentIcon()}
        <span className="text-sm truncate max-w-[150px]">{sourceDocument.title}</span>
        <button
          onClick={() => onXClick(index) }
          className="hover:bg-gray-200 rounded-full p-1"
        >
          <XMarkIcon className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {isHovered && sourceDocument.summary && (
        <div className="absolute z-10 bottom-full mb-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200 max-w-xs">
          <p className="text-sm text-gray-600">{KNStringUtils.shortenText(sourceDocument.summary, 100)}</p>
        </div>
      )}
    </div>
  )
}

export default SourceDocumentCard
