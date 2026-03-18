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
  onCalendarToggle?: () => void
  isCalendarOpen?: boolean
}

const TabBar: React.FC<TabBarProps> = ({ currentTab, setCurrentTab, fullRelease, onCalendarToggle, isCalendarOpen }) => {
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
        {/* Calendar toggle button - replaces hamburger */}
        <button
          className={`TabBarExpandBtn ${isCalendarOpen ? 'TabBarExpandBtn--active' : ''}`}
          onClick={onCalendarToggle}
          title={isCalendarOpen ? 'Hide calendar' : 'Show calendar'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
        {/* Expand tabs button */}
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
      {/* Calendar toggle */}
      <button
        className={`TabBarExpandBtn ${isCalendarOpen ? 'TabBarExpandBtn--active' : ''}`}
        onClick={onCalendarToggle}
        title={isCalendarOpen ? 'Hide calendar' : 'Show calendar'}
        style={{ marginBottom: 4 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>
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
