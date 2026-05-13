import cn from 'classnames'
import { useEffect, useMemo, useState } from "react";
import { getSavedTranscript } from "src/api/transcripts";
import { detectLanguage, translateToEnglish, type DetectedLanguage } from "src/utils/translate";

import styles from './styles.module.scss'

interface TranscriptViewProps {
  threadId: number
  onClose: () => void
  participantNames?: string[]
}

const TranscriptView: React.FC<TranscriptViewProps> = ({
  threadId,
  onClose,
  participantNames = [],
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
        const text = extractTranscriptBody(data.content);
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
  const turns = useMemo(
    () => formatTranscriptTurns(displayedContent ?? '', participantNames),
    [displayedContent, participantNames],
  );

  return (
    <div className="text-ks-warm-grey-900 h-screen flex flex-col overflow-hidden mt-3 mr-0 w-[22em] ml-1">
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
                  cn("space-y-3 text-sm leading-relaxed flex-1 overflow-auto pl-1 pr-3",
                     styles.scrollbarHide)}>
                {turns.map((turn, index) => (
                  <article key={index} className={styles.turn}>
                    <div className={styles.turnHeader}>
                      <span className={styles.speaker}>{turn.speaker}</span>
                      {turn.inferred && <span className={styles.inferred}>inferred</span>}
                    </div>
                    <p className={styles.turnText}>{turn.text}</p>
                  </article>
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

interface TranscriptTurn {
  speaker: string
  text: string
  inferred: boolean
}

const extractTranscriptBody = (raw: string) => {
  const parts = raw.split(/\n{3,}/).map(part => part.trim()).filter(Boolean)
  return parts.length > 1 ? parts.slice(1).join('\n\n') : raw.trim()
}

const formatTranscriptTurns = (raw: string, participantNames: string[]): TranscriptTurn[] => {
  const text = raw.replace(/\r/g, '').trim()
  if (!text) return []

  const knownSpeakers = participantNames
    .map(name => name.trim())
    .filter(Boolean)
  const fallbackSpeakers = knownSpeakers.length > 0
    ? knownSpeakers.slice(0, 4)
    : ['Speaker 1', 'Speaker 2']

  const explicitTurns = parseExplicitSpeakerTurns(text, knownSpeakers)
  if (explicitTurns.length > 0) return explicitTurns

  return inferSpeakerTurns(text, fallbackSpeakers)
}

const parseExplicitSpeakerTurns = (text: string, knownSpeakers: string[]): TranscriptTurn[] => {
  const speakerPattern = /^([A-Z][\w'.-]+(?:\s+[A-Z][\w'.-]+){0,3}|Speaker\s+\d+|You|Me)\s*:\s*(.+)$/i
  const turns: TranscriptTurn[] = []

  text.split(/\n+/).forEach(line => {
    const trimmed = line.trim()
    if (!trimmed) return
    const match = trimmed.match(speakerPattern)
    if (!match) {
      if (turns.length > 0) {
        turns[turns.length - 1].text += ` ${trimmed}`
      }
      return
    }
    turns.push({
      speaker: normalizeSpeakerName(match[1], knownSpeakers),
      text: match[2].trim(),
      inferred: false,
    })
  })

  return turns
}

const inferSpeakerTurns = (text: string, speakerNames: string[]): TranscriptTurn[] => {
  const sentences = text
    .replace(/\s+/g, ' ')
    .match(/[^.!?]+[.!?]+(?:["']|\))?|[^.!?]+$/g)
    ?.map(sentence => sentence.trim())
    .filter(Boolean) ?? []

  if (sentences.length === 0) return []

  const turns: TranscriptTurn[] = []
  let speakerIndex = 0

  sentences.forEach((sentence, index) => {
    const startsResponse = /^(yes|yeah|yep|no|right|okay|ok|exactly|interesting|got it|sure|well)\b/i.test(sentence)
    const previous = turns[turns.length - 1]
    const previousLooksLikeQuestion = previous?.text.trim().endsWith('?')
    const shouldStartTurn =
      index === 0 ||
      previousLooksLikeQuestion ||
      startsResponse ||
      previous.text.length > 260

    if (shouldStartTurn) {
      if (index > 0) speakerIndex = (speakerIndex + 1) % Math.max(speakerNames.length, 1)
      turns.push({
        speaker: speakerNames[speakerIndex] ?? `Speaker ${speakerIndex + 1}`,
        text: sentence,
        inferred: true,
      })
    } else {
      previous.text += ` ${sentence}`
    }
  })

  return turns
}

const normalizeSpeakerName = (speaker: string, knownSpeakers: string[]) => {
  const known = knownSpeakers.find(name => name.toLowerCase() === speaker.toLowerCase())
  return known ?? speaker
}
