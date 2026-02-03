import { useState } from 'react'

import { Connection, ConnectionKeys } from 'src/api/connections'
import { setInitialSources } from 'src/utils/initialSources'
import KNAnalytics from 'src/utils/KNAnalytics'

import { ButtonSize, ButtonVariant } from 'src/components/atoms/button'
import { MenuItemVariant } from 'src/components/molecules/MenuItem'

import X from '/assets/images/x.svg'

export type SelectedSources = {
  label: string
  onClick: () => void
  icon: React.ReactElement | React.ReactNode
  variant: ButtonVariant
  size: ButtonSize
  sourceId?: string
}
export type SelectedSourcesInitial = {
  label: string
  icon: React.ReactElement | React.ReactNode
  variant: ButtonVariant
  size: ButtonSize
  sourceId?: string
}
export type MenuSources = {
  label: string
  onClick: () => void
  labelButton: string
  variantButton: ButtonVariant
  variant: MenuItemVariant
  icon: React.ReactElement | React.ReactNode
  onClickButton?: () => void
  sizeButton: ButtonSize
  hasButton: boolean
  sourceId?: string
}
export type MenuSourcesInitial = {
  label: string
  labelButton: string
  variantButton: ButtonVariant
  variant: MenuItemVariant
  icon: React.ReactElement | React.ReactNode
  onClickButton?: () => void
  sizeButton: ButtonSize
  hasButton: boolean
  sourceId?: string
}

export function useSources(
  connections: Record<string, Connection>,
  onConnectionItemClick: (connectionKey: ConnectionKeys[]) => void,
) {
  const { connectedSources, sourcesMenu } = setInitialSources(connections, onConnectionItemClick)

  const updatedConnectedSources: SelectedSources[] = connectedSources.map(source => ({
    ...source,
    onClick: () => handleSelectedSourceClick(source.label),
  }))

  const updatedSourcesMenu: MenuSources[] = sourcesMenu.map(source => ({
    ...source,
    onClick: () => handleMenuItemClick(source.label),
  }))

  const [selectedSources, setSelectedSources] = useState<SelectedSources[]>(updatedConnectedSources)

  const [sourceOptions, setSourceOptions] = useState<MenuSources[]>(updatedSourcesMenu)

  const handleSelectedSourceClick = (label: string) => {
    KNAnalytics.trackEvent('NewAutomationRemoveSource', {
      selectedSources: selectedSources.map(selectedSource => selectedSource.label),
      source: label,
    })
    setSourceOptions(prevSourceOptions =>
      prevSourceOptions.map(sourceOption =>
        sourceOption.label === label
          ? { ...sourceOption, variant: MenuItemVariant.ghost }
          : sourceOption,
      ),
    )
    setSelectedSources(prevSelectedSources =>
      prevSelectedSources.filter(source => source.label !== label),
    )
  }

  const handleMenuItemClick = (label: string) => {
    setSourceOptions(prevSourceOptions =>
      prevSourceOptions.map(sourceOption => {
        if (sourceOption.label === label) {
          if (sourceOption.variant === MenuItemVariant.selected) {
            return { ...sourceOption, variant: MenuItemVariant.ghost }
          } else {
            return { ...sourceOption, variant: MenuItemVariant.selected }
          }
        }
        return sourceOption
      }),
    )

    const sourceId = sourceOptions.find(sourceOption => sourceOption.label === label)?.sourceId
    KNAnalytics.trackEvent('NewAutomationAddSource', {
      selectedSources: selectedSources.map(selectedSource => selectedSource.label),
      source: label,
    })
    setSelectedSources(prevSelectedSources =>
      prevSelectedSources.some(source => source.label === label)
        ? prevSelectedSources.filter(source => source.label !== label)
        : [
            ...prevSelectedSources,
            {
              label,
              onClick: () => handleSelectedSourceClick(label),
              icon: <img src={X} alt="close" />,
              variant: ButtonVariant.selected,
              size: ButtonSize.pill,
              sourceId: sourceId ?? label,
            },
          ],
    )
  }

  return {
    selectedSources,
    sourceOptions,
    setSelectedSources,
    setSourceOptions,
    handleMenuItemClick,
    handleSelectedSourceClick,
  }
}
