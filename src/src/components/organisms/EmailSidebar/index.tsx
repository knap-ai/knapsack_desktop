import React, { useState, useEffect } from 'react'
import KNAnalytics from 'src/utils/KNAnalytics'

import { EmailImportance } from 'src/hooks/dataSources/useEmailAutopilot'

interface EmailCategorySidebarProps {
  categories: Record<EmailImportance, { total: number; active: number }>
  selectedCategory: EmailImportance | null
  onSelectCategory: (category: EmailImportance) => void
}

const EmailCategorySidebar: React.FC<EmailCategorySidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  const getCategoryDisplayName = (category: EmailImportance): string => {
    if (category === EmailImportance.IMPORTANT) {
      return 'Needs response'
    } else if (category === EmailImportance.IMPORTANT_NO_RESPONSE) {
      return 'Important'
    } else if (category === EmailImportance.INFORMATIONAL) {
      return 'Informational'
    } else if (category === EmailImportance.MARKETING) {
      return 'Marketing'
    } else if (category === EmailImportance.UNIMPORTANT) {
      return 'Unimportant'
    }
    return 'Misc'
  }

  const handleCategorySelect = (category: EmailImportance) => {
    if (category !== selectedCategory) {
      const totalEmails = Object.values(categories).reduce((sum, { total }) => sum + total, 0);

      KNAnalytics.trackEvent('category_selected', {
        previous_category: selectedCategory || 'none',
        new_category: category,
        category_name: getCategoryDisplayName(category),
        active_emails_in_selected_category: categories[category]?.active || 0,
        total_emails_in_selected_category: categories[category]?.total || 0,
        classification_counts: {
          important_needs_response: categories[EmailImportance.IMPORTANT]?.total || 0,
          important_no_response: categories[EmailImportance.IMPORTANT_NO_RESPONSE]?.total || 0,
          informational: categories[EmailImportance.INFORMATIONAL]?.total || 0,
          marketing: categories[EmailImportance.MARKETING]?.total || 0,
          unimportant: categories[EmailImportance.UNIMPORTANT]?.total || 0,
          unclassified: categories[EmailImportance.UNCLASSIFIED]?.total || 0
        },
        total_emails: totalEmails
      })
    }

    onSelectCategory(category)
  }

  return (
    <div className={`
      w-full pb-2 px-4 text-ks-warm-grey-950 opacity-100
      transform transition-all duration-300 ease-in-out origin-top
      ${isVisible ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 h-0 overflow-hidden'}
    `}>
      <div className="space-y-1 mt-2">
        {Object.entries(categories)
          .filter(([category]) => category !== EmailImportance.UNCLASSIFIED)
          .map(([category, { active }]) => (
            <div
              key={category}
              onClick={() => handleCategorySelect(category as EmailImportance)}
              className={`
                text-sm leading-4 flex justify-between items-center py-2.5 px-3 rounded cursor-pointer text-ks-warm-grey-950
                transition-all duration-200
                ${selectedCategory === category 
                  ? 'bg-ks-warm-grey-100 font-medium' 
                  : 'hover:bg-ks-warm-grey-100'}
              `}
            >
              <div className={`${selectedCategory === category ? '' : 'opacity-60'}`}>
                {getCategoryDisplayName(category as EmailImportance)}
              </div>
              <div className=
                {`${selectedCategory === category ? 'bg-ks-warm-grey-400' : 'bg-ks-warm-grey-200'}
                  text-ks-warm-grey-950 min-w-[1.75em] px-2
                  py-0.5 rounded-full text-sm flex justify-center`}>
                {active}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default EmailCategorySidebar
