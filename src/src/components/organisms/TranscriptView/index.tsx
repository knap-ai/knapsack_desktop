import cn from 'classnames'
import { useEffect, useState } from "react";
import { getSavedTranscript } from "src/api/transcripts";
import { detectLanguage, translateToEnglish, type DetectedLanguage } from "src/utils/translate";

import styles from './styles.module.scss'

interface TranscriptViewProps {
  threadId: number
  onClose: () => void
}

const TranscriptView: React.FC<TranscriptViewProps> = ({
  threadId,
  onClose,
}) => {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detectedLang, setDetectedLang] = useState<DetectedLanguage | null>(null);
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);

  useEffect(() => {
    if (threadId) {
      getSavedTranscript(threadId.toString()).then(data => {
        if (!data) {
          setError("Transcript not found")
          return
        }
        const text = data.content.split("\n\n\n")[1];
        setContent(text);
        setDetectedLang(detectLanguage(text ?? ''));
        setIsTranslated(false);
        setTranslatedContent(null);
        setTranslateError(null);
      }).catch(() => {
        setError("Failed to fetch transcript")
      })
    }
  }, [threadId])

  const handleTranslate = async () => {
    if (!content || !detectedLang) return;
    if (translatedContent) {
      setIsTranslated(true);
      return;
    }
    setIsTranslating(true);
    setTranslateError(null);
    try {
      const result = await translateToEnglish(content, detectedLang.code);
      setTranslatedContent(result);
      setIsTranslated(true);
    } catch {
      setTranslateError("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const displayedContent = isTranslated ? translatedContent : content;

  return (
    <div className="text-ks-warm-grey-900 h-screen flex flex-col overflow-hidden mt-3 mr-0 w-[18em] ml-1">
      <div className="flex flex-row w-full mt-6 justify-between pl-1 pr-3">
        <div className="uppercase text-ks-warm-grey-800 font-Lora font-bold text-xs leading-4 tracking-[1.44px] ml-1">
          Transcript
        </div>
        <img className="h-2.5 my-auto cursor-pointer" src="assets/images/icons/x_close.svg" onClick={() => onClose()} />
      </div>

      {detectedLang && (
        <div className="flex flex-row items-center gap-2 mt-3 pl-1 pr-3">
          <span className="text-[10px] text-ks-warm-grey-800 font-InterTight">
            {detectedLang.name} detected
          </span>
          {!isTranslated ? (
            <button
              onClick={handleTranslate}
              disabled={isTranslating}
              className="text-[10px] font-semibold font-InterTight uppercase tracking-[0.08em] text-blue-600 hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {isTranslating ? "Translating…" : "Translate to English"}
            </button>
          ) : (
            <button
              onClick={() => setIsTranslated(false)}
              className="text-[10px] font-semibold font-InterTight uppercase tracking-[0.08em] text-ks-warm-grey-800 hover:underline"
            >
              Show Original
            </button>
          )}
        </div>
      )}

      {translateError && (
        <div className="pl-1 pr-3 mt-1 text-[10px] text-red-500">{translateError}</div>
      )}

      {
        error ? (
          <div className="p-6 text-center text-red-500 flex-1 flex items-center justify-center">
            {error}
          </div>
        ) : (
          <>
            <div className="flex-1 flex flex-col overflow-hidden mt-6 mb-24">
              <div className={
                  cn("space-y-4 text-sm leading-relaxed flex-1 overflow-auto pl-1 pr-3",
                     styles.scrollbarHide)}>
                {displayedContent?.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-start leading-[1.6] mb-2">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </>
        )
      }
    </div>
  );
}

export default TranscriptView;
