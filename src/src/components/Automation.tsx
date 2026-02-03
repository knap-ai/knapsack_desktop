import { useState } from 'react'

import Box from '@mui/material/Box'

import { KNChatMessage } from './../api/threads'
import { KNChatMessageList } from './KNChatMessageList'

import './Automation.scss'

interface AutomationProps {
  onRemoveSource: (index: number, type: string) => void
}

function Automation({ onRemoveSource }: AutomationProps) {
  const [automationsOutputs, _setAutomationRuns] = useState<KNChatMessage[]>([])
  const [isChatLoading, _setIsChatLoading] = useState(false)

  return (
    <div className="flex flex-col KNResults">
      <div className="flex-1 flex flex-row">
        <div className="flex-1 flex flex-col overflow-y-auto">
          <Box className="p-2 flex flex-col" sx={{ maxHeight: '65rem' }}>
            <div className="AutomationList">
              <span className="font-medium text-xl">Automation</span>
            </div>
          </Box>
        </div>
        <div className="flex-1 flex flex-col">
          <KNChatMessageList
            dataSource={automationsOutputs}
            isChatLoading={isChatLoading}
            searchItems={[]}
            webSearchResponse={[]}
            onRemoveSource={onRemoveSource}
            semanticSearchResponse={[]}
            currentTab="feed"
          />
        </div>
      </div>
    </div>
  )
}

export default Automation
