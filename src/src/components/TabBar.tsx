import React from 'react'

import './TabBar.scss'

interface TabData {
  id: TabChoices
  svg: string
  label: string
  isActive: boolean
}

export enum TabChoices {
  Moltbot = 'Moltbot',
  Work = 'Work',
  Email = 'Email',
  Meeting = 'Meeting',
  Automate = 'Automate',
  Chat = 'Chat',
  NewAutomation = 'NewAutomation',
  Activity = 'Activity',
}

interface TabBarProps {
  currentTab: TabChoices
  setCurrentTab: (tabChoice: TabChoices) => void
  fullRelease: boolean | null
}

const TabBar: React.FC<TabBarProps> = ({ currentTab, setCurrentTab, fullRelease }) => {
  const tabs: TabData[] = [
    {
      id: TabChoices.Moltbot,
      svg: '/assets/images/tabBar/chatTab.svg',
      label: 'Chat',
      isActive: true,
    },
    {
      id: TabChoices.Email,
      svg: '/assets/images/tabBar/emailTab.svg',
      label: 'Email',
      isActive: true,
    },
    {
      id: TabChoices.Meeting,
      svg: '/assets/images/tabBar/meetingTab.svg',
      label: 'Meetings',
      isActive: true,
    },
    {
      id: TabChoices.Automate,
      svg: '/assets/images/tabBar/automateTab.svg',
      label: 'Automate',
      isActive: fullRelease === true,
    },
    {
      id: TabChoices.Chat,
      svg: '/assets/images/tabBar/chatTab.svg',
      label: 'Chat',
      isActive: fullRelease === true,
    },
    {
      id: TabChoices.Activity,
      svg: '/assets/images/tabBar/planTab.svg',
      label: 'Activity',
      isActive: true,
    },
  ]

  const numActiveTabs = tabs.filter(tab => tab.isActive).length

  return (
    <div
      data-tauri-drag-region
      className="TabBarContainer mt-12 select-none flex flex-col space-y-0"
    >
      {numActiveTabs > 1 &&
        tabs.map(tab => {
          const selectedTabClass = currentTab === tab.id ? 'SelectedTabItem' : 'TabItem'
          return (
            <div key={tab.id}>
              {tab.isActive && (
                <div className={`rounded-lg text-center cursor-pointer`}>
                  <div
                    data-tauri-drag-region
                    className={`OuterTabItem p-0.5 m-3 mt-3 mb-0 text-center rounded-2xl ${selectedTabClass}`}
                    onClick={() => setCurrentTab(tab.id)}
                  >
                    <div
                      className={`InnerTabItem cursor-pointer w-12 h-12 content-center items-center rounded-xl ${selectedTabClass}`}
                    >
                      <img src={tab.svg} className="w-7 m-auto" alt={tab.label} />
                    </div>
                  </div>
                  <span className={`TabName ${selectedTabClass}`}>{tab.label}</span>
                </div>
              )}
            </div>
          )
        })}
    </div>
  )
}

export default TabBar
