import React from 'react'
import { EmailImportance } from 'src/hooks/dataSources/useEmailAutopilot'
import KNAnalytics from 'src/utils/KNAnalytics'

export enum EmailTab {
  NEEDS_RESPONSE = 'NEEDS_RESPONSE',
  FYI = 'FYI',
  MARKETING = 'MARKETING',
}

export const mapImportanceToTab = (importance: EmailImportance): EmailTab => {
  switch (importance) {
    case EmailImportance.IMPORTANT:
      return EmailTab.NEEDS_RESPONSE
    case EmailImportance.IMPORTANT_NO_RESPONSE:
    case EmailImportance.INFORMATIONAL:
      return EmailTab.FYI
    case EmailImportance.MARKETING:
    case EmailImportance.UNIMPORTANT:
      return EmailTab.MARKETING
    default:
      return EmailTab.NEEDS_RESPONSE
  }
}

export const mapTabToImportance = (tab: EmailTab): EmailImportance => {
  switch (tab) {
    case EmailTab.NEEDS_RESPONSE:
      return EmailImportance.IMPORTANT
    case EmailTab.FYI:
      return EmailImportance.IMPORTANT_NO_RESPONSE
    case EmailTab.MARKETING:
      return EmailImportance.MARKETING
    default:
      return EmailImportance.IMPORTANT
  }
}

const getCategoryDisplayName = (category: EmailImportance): string => {
  switch (category) {
    case EmailImportance.IMPORTANT:
      return 'Needs response'
    case EmailImportance.IMPORTANT_NO_RESPONSE:
      return 'Important'
    case EmailImportance.INFORMATIONAL:
      return 'Informational'
    case EmailImportance.MARKETING:
      return 'Marketing'
    case EmailImportance.UNIMPORTANT:
      return 'Unimportant'
    default:
      return 'Misc'
  }
}

interface EmailCategoryTabsProps {
  selectedCategory: EmailImportance | null
  onSelectCategory: (category: EmailImportance) => void
  emailCounts: Record<EmailImportance, { total: number; active: number }>
}

const EmailCategoryTabs: React.FC<EmailCategoryTabsProps> = ({
  selectedCategory,
  onSelectCategory,
  emailCounts,
}) => {
  const selectedTab = selectedCategory ? mapImportanceToTab(selectedCategory) : EmailTab.NEEDS_RESPONSE

  const getTabCount = (tab: EmailTab): number => {
    let count = 0

    if (tab === EmailTab.NEEDS_RESPONSE) {
      count = emailCounts[EmailImportance.IMPORTANT]?.active || 0
    }
    else if (tab === EmailTab.FYI) {
      count = (emailCounts[EmailImportance.IMPORTANT_NO_RESPONSE]?.active || 0) +
              (emailCounts[EmailImportance.INFORMATIONAL]?.active || 0)
    }
    else if (tab === EmailTab.MARKETING) {
      count = (emailCounts[EmailImportance.MARKETING]?.active || 0) +
              (emailCounts[EmailImportance.UNIMPORTANT]?.active || 0)
    }

    return count
  }

  const tabs = [
    { id: EmailTab.NEEDS_RESPONSE, label: 'NEEDS RESPONSE' },
    { id: EmailTab.FYI, label: 'FYI' },
    { id: EmailTab.MARKETING, label: 'MARKETING' },
  ]

  const handleTabSelect = (tab: EmailTab) => {
    const category = mapTabToImportance(tab)

    const totalEmails = Object.values(emailCounts).reduce((sum, { total }) => sum + total, 0)

    KNAnalytics.trackEvent('category_selected', {
      previous_category: selectedCategory || 'none',
      new_category: category,
      category_name: getCategoryDisplayName(category),
      active_emails_in_selected_category: emailCounts[category]?.active || 0,
      total_emails_in_selected_category: emailCounts[category]?.total || 0,
      classification_counts: {
        important_needs_response: emailCounts[EmailImportance.IMPORTANT]?.total || 0,
        important_no_response: emailCounts[EmailImportance.IMPORTANT_NO_RESPONSE]?.total || 0,
        informational: emailCounts[EmailImportance.INFORMATIONAL]?.total || 0,
        marketing: emailCounts[EmailImportance.MARKETING]?.total || 0,
        unimportant: emailCounts[EmailImportance.UNIMPORTANT]?.total || 0,
        unclassified: emailCounts[EmailImportance.UNCLASSIFIED]?.total || 0
      },
      total_emails: totalEmails
    })

    onSelectCategory(category)
  }

  return (
    <div className="relative">
      <div className="flex justify-center">
        {tabs.map(tab => {
          const count = getTabCount(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => handleTabSelect(tab.id)}
              className={`py-4 px-8 relative
                ${selectedTab === tab.id
                  ? 'text-ks-warm-grey-950 border-b-[1px] border-ks-warm-grey-950'
                  : 'text-ks-warm-grey-500 border-b-[1px] border-ks-warm-grey-200 hover:text-ks-warm-grey-700'
                }`}
            >
              <span className="font-bold font-Lora tracking-wider text-xs">
                {tab.label}
              </span>

              {count > 0 && (
                <span className="ml-1.5 bg-ks-warm-grey-200 text-ks-warm-grey-950 px-2 py-0.5 rounded-full text-xs font-Inter font-semibold">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default EmailCategoryTabs
