import './style.scss'

import BoltIcon from '@mui/icons-material/Bolt'
// import { Button } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat'

import {
  Automation,
  AutomationDataSources,
  automationDataSourcesIndex,
} from '../../../automations/automation'
import DotsMenu from '../../molecules/MenuCard'

interface AutomationListProps {
  onAutomationViewClick: (automation: Automation) => void
  onAutomationExecuteClick: (automation: Automation) => void
  onBuildNewAutomationClick: () => void
  automations: Automation[]
  onAutomationDeleteClick: (automation: Automation) => void
  onEditAutomationClick: (automation: Automation) => void
}

function AutomationList({
  onBuildNewAutomationClick,
  onAutomationViewClick,
  onAutomationExecuteClick,
  automations,
  onAutomationDeleteClick,
  onEditAutomationClick,
}: AutomationListProps) {
  return (
    <div className="flex flex-col p-6 pl-10">
      <div className="font-semibold text-2xl">Automations</div>
      <div className="font-medium text-lg mb-8 text-soft-gray">
        Build and run workflows. Get tasks done instantly.
      </div>
      <div className="flex flex-row flex-wrap space-x-0">
        {automations.map(automation => {
          return (
            <div className="AutomationCard content-center  flex flex-row justify-between p-2">
              <div
                key={automation.getId()}
                className=" h-48 w-64 flex flex-col justify-between p-2 "
              >
                <div className="AutomationCardSpacer flex flex-col">
                  <div className="AutomationCardHeader flex font-semibold text-start text-lg">
                    <span>{automation.getName()}</span>
                  </div>
                  <div className="AutomationCardBody flex font-medium text-start text-sm text-soft-gray">
                    <span>{automation.getDescription()}</span>
                  </div>
                  <div className="flex flex-1 py-2">
                    {Object.entries(automationDataSourcesIndex)
                      .map(([key, { asset }]) =>
                        automation.getDataSources().includes(key as AutomationDataSources)
                          ? asset
                          : null,
                      )
                      .filter(asset => !!asset)
                      .map(asset => (
                        <img key={asset} className="w-5 mx-1" src={asset as string} />
                      ))}
                  </div>
                </div>
                <div className="flex w-full flex justify-between gap-2">
                  <div
                    className="border border-black w-full cursor-pointer p-2 h-[32px] flex items-center justify-center gap-2 rounded hover:border-[#95b5f5] hover:text-[#95b5f5] text-sm"
                    onClick={() => onAutomationViewClick(automation)}
                  >
                    <ChatIcon fontSize="small" />
                    View
                  </div>
                  <div
                    className="border border-black w-full cursor-pointer p-2 h-[32px] flex items-center justify-center gap-2 rounded hover:border-[#95b5f5] hover:text-[#95b5f5] text-sm"
                    onClick={() => onAutomationExecuteClick(automation)}
                  >
                    <BoltIcon fontSize="small" />
                    Execute
                  </div>
                </div>
              </div>
              {automation.getName() !== 'Email summary' &&
                automation.getName() !== 'Meeting prep' && (
                  <DotsMenu
                    onAutomationDeleteClick={onAutomationDeleteClick}
                    onEditAutomationClick={onEditAutomationClick}
                    automation={automation}
                  />
                )}
            </div>
          )
        })}
        <div
          className="AutomationCardAddNew h-48 w-64 cursor-pointer rounded-lg content-center flex flex-col"
          onClick={() => onBuildNewAutomationClick()}
        >
          <div className="AutomationCardSpacer p-2">
            <div className="AutomationCardHeader font-semibold text-start text-lg">
              <span>+ Build new automation</span>
            </div>
            <div className="AutomationCardBody font-medium text-start text-sm text-soft-gray">
              <span>Create custom automations to get your work done faster.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AutomationList
