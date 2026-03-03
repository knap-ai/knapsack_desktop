import React, { useState } from 'react'

import './TabBar.scss'

interface TabData {
  id: TabChoices
  svg: string
  label: string
  isActive: boolean
}

export enum TabChoices {
  Openclaw = 'Openclaw',
  Work = 'Work',
  Email = 'Email',
  Meeting = 'Meeting',
  Automate = 'Automate',
  Chat = 'Chat',
  NewAutomation = 'NewAutomation',
  Activity = 'Activity',
  Workspaces = 'Workspaces',
  MCPMarketplace = 'MCPMarketplace',
}

interface TabBarProps {
  currentTab: TabChoices
  setCurrentTab: (tabChoice: TabChoices) => void
  fullRelease: boolean | null
}

const TabBar: React.FC<TabBarProps> = ({ currentTab, setCurrentTab, fullRelease }) => {
  const [collapsed, setCollapsed] = useState(true)

  const tabs: TabData[] = [
    {
      id: TabChoices.Openclaw,
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
      id: TabChoices.Workspaces,
      svg: '/assets/images/tabBar/automateTab.svg',
      label: 'RAG',
      isActive: false,
    },
    {
      id: TabChoices.MCPMarketplace,
      svg: '/assets/images/tabBar/automateTab.svg',
      label: 'Skills',
      isActive: false,
    },
  ]

  const numActiveTabs = tabs.filter(tab => tab.isActive).length

  if (numActiveTabs <= 1) return null

  if (collapsed) {
    return (
      <div data-tauri-drag-region className="TabBarContainer TabBarContainer--collapsed mt-12 select-none">
        <button
          className="TabBarExpandBtn"
          onClick={() => setCollapsed(false)}
          title="Show tabs"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div
      data-tauri-drag-region
      className="TabBarContainer mt-12 select-none flex flex-col space-y-0"
    >
      <button
        className="TabBarCollapseBtn"
        onClick={() => setCollapsed(true)}
        title="Hide tabs"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {tabs.map(tab => {
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
