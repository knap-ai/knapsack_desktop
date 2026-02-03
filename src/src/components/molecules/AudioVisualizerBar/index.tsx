import React from 'react'
import { LiveAudioVisualizer } from 'react-audio-visualize';

interface AudioVisualizerBarProps {
  recorder: any
}

const AudioVisualizerBar: React.FC<AudioVisualizerBarProps> = ({
  recorder,
}) => {

  return (
    <div className="flex flex-row gap-x-4">
      {recorder.mediaRecorder && (
        <LiveAudioVisualizer
          mediaRecorder={recorder.mediaRecorder}
          width={420}
          height={75}
          barWidth={3}
          fftSize={512}
          barColor={'#913631'}
        />
      )}

    </div>
  )
}

export default AudioVisualizerBar
