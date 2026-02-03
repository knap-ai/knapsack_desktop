import cn from 'classnames'
import { useEffect, useState } from "react";
import { getSavedTranscript } from "src/api/transcripts";

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

  useEffect(() => {
    if (threadId) {
      getSavedTranscript(threadId.toString()).then(data => {
        if (!data) {
          setError("Transcript not found")
          return
        }
        setContent(data.content.split("\n\n\n")[1]);
        console.log("SETTING CONTENT: ", data.content.split("\n\n\n")[1])
      }).catch(() => {
        setError("Failed to fetch transcript")
      })

    }
  }, [threadId])


  return (
    <div className="text-ks-warm-grey-900 h-screen flex flex-col overflow-hidden mt-3 mr-0 w-[18em] ml-1">
      <div className="flex flex-row w-full mt-6 justify-between pl-1 pr-3">
        <div className="uppercase text-ks-warm-grey-800 font-Lora font-bold text-xs leading-4 tracking-[1.44px] ml-1">
          Transcript
        </div>
        <img className="h-2.5 my-auto cursor-pointer" src="assets/images/icons/x_close.svg" onClick={() => onClose()} />
      </div>
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
                {content?.split('\n').map((paragraph, index) => (
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
