import { animated, useSpring } from 'react-spring'

export type KNSearchIndexingProgressModalProps = {
  progress: number
  isOnboarding: boolean
}

export const KNSearchIndexingProgressModal: React.FC<KNSearchIndexingProgressModalProps> = ({
  progress,
  isOnboarding: _isOnboarding,
}) => {
  const progressAnimation = useSpring({
    width: `${progress}%`,
    config: { tension: 210, friction: 20 },
  })

  // const text = "Your files are being processed. Start exploring by searching your files under \"Local Files\", or asking a question under \"Local AI\".";

  const text1 =
    'Your Knapsack is being packed privately. We run AI on your Mac. None of your files are ever shared with us.'
  // let text2 = "Start searching your files under ";
  // let text3 = "Local Files";
  // let text4 = ", or ask a question under ";
  // let text5 = "Local AI";
  // let text6 = ".";

  return (
    <animated.div className="absolute bg-kn-color-bg-gray bottom-0 border border-b-0 border-kn-color-border-gray h-12 rounded-bl-md rounded-br-md w-full flex flex-col">
      <animated.div style={progressAnimation} className="h-2 bg-kn-color-blue w-full" />
      <div className="h-full content-center items-center">
        <div className="text-kn-color-text-gray ml-7 pb-1 my-auto text-kn-font-loader">{text1}</div>
      </div>
    </animated.div>
  )
}

export default KNSearchIndexingProgressModal
