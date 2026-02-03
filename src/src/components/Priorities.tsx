import './Priorities.scss'

import { useEffect } from 'react'

import KNUtils from 'src/utils/KNStringUtils'

interface PrioritiesProps {
  onPriorityClick: (index: number, priority: Priority) => void
  selectedPriorityIndex: number
}

export interface Priority {
  title: string
  private_temp: string
  prompt: string
  sources: any[]
}

function Priorities({ onPriorityClick, selectedPriorityIndex }: PrioritiesProps) {
  useEffect(() => {
    console.log('Priorities: Component has mounted or updated')
    return () => {
      console.log('Priorities: Component will unmount')
    }
  }, [selectedPriorityIndex])

  const priorities: Priority[] = [
    {
      title: 'WWDC 2024',
      private_temp: 'WWDC 2024 updates',
      prompt:
        "What are the latest updates from WWDC 2024? How does this give us a competitive advantage if we're building cross-platform on-device AI?",
      sources: [],
    },
    {
      title: 'On-device AI',
      private_temp: 'On-device AI vs cloud based LLMs',
      prompt:
        'Give a list of reasons why on-device AI is preferable to cloud based LLMs like OpenAI and Gemini.  Include specific call outs to increases in AI capable computers and smartphones and the privacy benefits in industries like health care and finance.',
      sources: [],
    },
    {
      title: 'SLMs vs LLMs',
      private_temp: 'Small language models vs large language models',
      prompt:
        'Explain what small language models are and how they are cheaper and in some cases better than large language models.  Share the top open source small language models.',
      sources: [],
    },
    {
      title: 'Incumbents & Privacy',
      private_temp: 'Privacy challenges for OpenAI, Microsoft, and Google',
      prompt:
        'Explain what privacy challenges OpenAI, Microsoft, and Google have faced in the last year in rolling out their AI services.  Be specific with examples.  Explain how this makes room for a new startup focused on private AI.',
      sources: [],
    },
  ]

  return (
    <div className="w-full">
      {priorities && (
        <div className="flex flex-col">
          <div className="m-4 flex flex-col">
            <span className="mx-4 mt-0 mb-0 text-body-text text-bold text-kn-font-large">
              Sample prompts
            </span>
          </div>
          <div className="flex flex-row flex-wrap justify-center">
            {priorities &&
              priorities.map((mtg, index) => {
                const priorityTitle = mtg.title ? KNUtils.shortenText(mtg.title, 55) : ''

                return (
                  <div
                    className={
                      `w-48 mx-auto searchItem flex text-kn-color-text-gray text-kn-font-sublabel-value border border-kn-color-border-gray rounded-md whitespace-nowrap h-12 justify-center content-center ` +
                      (selectedPriorityIndex == index ? 'selected' : '')
                    }
                    key={index}
                    onClick={() => {
                      onPriorityClick(index, mtg)
                    }}
                  >
                    <div className="mx-2 flex-col text-center">
                      <div className="text-base text-body-text">{priorityTitle}</div>
                      <div className="title">{}</div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Priorities
