import { Connection, ConnectionKeys } from 'src/api/connections'
import { AutomationDataSources } from 'src/automations/automation'
import {
  MenuSourcesInitial,
  SelectedSourcesInitial,
} from 'src/hooks/newAutomation/useNewAutomation'

import { ButtonSize, ButtonVariant } from 'src/components/atoms/button'
import { MenuItemVariant } from 'src/components/molecules/MenuItem'

import Calendar from '/assets/images/icons/calendar.svg'
import Cloud from '/assets/images/icons/cloud.svg'
import Files from '/assets/images/icons/files.svg'
import Github from '/assets/images/icons/github.svg'
import Globe from '/assets/images/icons/globe.svg'
import Mail from '/assets/images/icons/mail-open.svg'
import Mic from '/assets/images/icons/mic.svg'
import Slack from '/assets/images/icons/slack.svg'
import X from '/assets/images/x.svg'

export const setInitialSources = (
  connections: Record<string, Connection>,
  onConnectionItemClick: (connectionKey: ConnectionKeys[]) => void,
) => {
  const connectedSources: SelectedSourcesInitial[] = []
  let sourcesMenu: MenuSourcesInitial[] = []

  connectedSources.push({
    label: 'Web',
    icon: <img src={X} alt="close" />,
    variant: ButtonVariant.selected,
    size: ButtonSize.pill,
    sourceId: AutomationDataSources.WEB,
  })

  sourcesMenu.push({
    label: 'Web',
    labelButton: 'CONNECTED',
    variantButton: ButtonVariant.connected,
    variant: MenuItemVariant.selected,
    icon: <img src={Globe} />,
    sizeButton: ButtonSize.badge,
    hasButton: true,
    sourceId: AutomationDataSources.WEB,
  })

  if (connections[ConnectionKeys.LOCAL_FILES]) {
    connectedSources.push({
      label: 'Local Files',
      icon: <img src={X} alt="close" />,
      variant: ButtonVariant.selected,
      size: ButtonSize.pill,
      sourceId: AutomationDataSources.LOCAL_FILES,
    })
    sourcesMenu.push({
      label: 'Local Files',
      labelButton: 'CONNECTED',
      variantButton: ButtonVariant.connected,
      variant: MenuItemVariant.selected,
      icon: <img src={Files} />,
      sizeButton: ButtonSize.badge,
      hasButton: true,
      sourceId: AutomationDataSources.LOCAL_FILES,
    })
  } else {
    sourcesMenu.push({
      label: 'Local Files',
      labelButton: 'CONNECT',
      variantButton: ButtonVariant.connect,
      variant: MenuItemVariant.ghost,
      icon: <img src={Files} />,
      onClickButton: () => onConnectionItemClick([ConnectionKeys.LOCAL_FILES]),
      sizeButton: ButtonSize.badge,
      hasButton: true,
      sourceId: AutomationDataSources.LOCAL_FILES,
    })
  }

  if (connections[ConnectionKeys.GOOGLE_GMAIL]) {
    connectedSources.push({
      label: 'Gmail',
      icon: <img src={X} alt="close" />,
      variant: ButtonVariant.selected,
      size: ButtonSize.pill,
      sourceId: AutomationDataSources.GMAIL,
    })

    sourcesMenu.push({
      label: 'Gmail',
      labelButton: 'CONNECTED',
      variantButton: ButtonVariant.connected,
      variant: MenuItemVariant.selected,
      icon: <img src={Mail} />,
      onClickButton: () => onConnectionItemClick([ConnectionKeys.GOOGLE_GMAIL]),
      sizeButton: ButtonSize.badge,
      hasButton: true,
      sourceId: AutomationDataSources.GMAIL,
    })
  } else {
    sourcesMenu.push({
      label: 'Gmail',
      labelButton: 'CONNECT',
      variantButton: ButtonVariant.connect,
      variant: MenuItemVariant.ghost,
      icon: <img src={Mail} />,
      onClickButton: () => onConnectionItemClick([ConnectionKeys.GOOGLE_GMAIL]),
      sizeButton: ButtonSize.badge,
      hasButton: true,
      sourceId: AutomationDataSources.GMAIL,
    })
  }

  if (connections[ConnectionKeys.GOOGLE_CALENDAR]) {
    connectedSources.push({
      label: 'Google Calendar',
      icon: <img src={X} alt="close" />,
      variant: ButtonVariant.selected,
      size: ButtonSize.pill,
      sourceId: AutomationDataSources.GOOGLE_CALENDAR,
    })
    sourcesMenu.push({
      label: 'Google Calendar',
      labelButton: 'CONNECTED',
      variantButton: ButtonVariant.connected,
      variant: MenuItemVariant.selected,
      icon: <img src={Calendar} />,
      onClickButton: () => onConnectionItemClick([ConnectionKeys.GOOGLE_CALENDAR]),
      sizeButton: ButtonSize.badge,
      hasButton: true,
      sourceId: AutomationDataSources.GOOGLE_CALENDAR,
    })
  } else {
    sourcesMenu.push({
      label: 'Google Calendar',
      labelButton: 'CONNECT',
      variantButton: ButtonVariant.connect,
      variant: MenuItemVariant.ghost,
      icon: <img src={Calendar} />,
      onClickButton: () => onConnectionItemClick([ConnectionKeys.GOOGLE_CALENDAR]),
      sizeButton: ButtonSize.badge,
      hasButton: true,
      sourceId: AutomationDataSources.GOOGLE_CALENDAR,
    })
  }

  if (connections[ConnectionKeys.GOOGLE_DRIVE]) {
    connectedSources.push({
      label: 'Google Drive',
      icon: <img src={X} alt="close" />,
      variant: ButtonVariant.selected,
      size: ButtonSize.pill,
      sourceId: AutomationDataSources.DRIVE,
    })
    sourcesMenu.push({
      label: 'Google Drive',
      labelButton: 'CONNECTED',
      variantButton: ButtonVariant.connected,
      variant: MenuItemVariant.selected,
      icon: <img src={Cloud} />,
      onClickButton: () => onConnectionItemClick([ConnectionKeys.GOOGLE_DRIVE]),
      sizeButton: ButtonSize.badge,
      hasButton: true,
      sourceId: AutomationDataSources.DRIVE,
    })
  } else {
    sourcesMenu.push({
      label: 'Google Drive',
      labelButton: 'CONNECT',
      variantButton: ButtonVariant.connect,
      variant: MenuItemVariant.ghost,
      icon: <img src={Cloud} />,
      onClickButton: () => onConnectionItemClick([ConnectionKeys.GOOGLE_DRIVE]),
      sizeButton: ButtonSize.badge,
      hasButton: true,
      sourceId: AutomationDataSources.DRIVE,
    })
  }

  sourcesMenu.sort(a => (a.variantButton === ButtonVariant.connected ? -1 : 1))

  sourcesMenu = [
    ...sourcesMenu,
    ...[
      {
        icon: <img src={Github} />,
        label: 'Github',
        labelButton: 'PENDING',
        variantButton: ButtonVariant.pending,
        variant: MenuItemVariant.ghost,
        sizeButton: ButtonSize.badge,
        hasButton: true,
      },
      {
        icon: <img src={Globe} />,
        label: 'Browser history',
        labelButton: 'PENDING',
        variantButton: ButtonVariant.pending,
        variant: MenuItemVariant.ghost,
        sizeButton: ButtonSize.badge,
        hasButton: true,
      },
      {
        icon: <img src={Mail} />,
        label: 'Outlook',
        labelButton: 'PENDING',
        variantButton: ButtonVariant.pending,
        variant: MenuItemVariant.ghost,
        sizeButton: ButtonSize.badge,
        hasButton: true,
      },
      {
        icon: <img src={Slack} />,
        label: 'Slack',
        labelButton: 'PENDING',
        variantButton: ButtonVariant.pending,
        variant: MenuItemVariant.ghost,
        sizeButton: ButtonSize.badge,
        hasButton: true,
      },
      {
        icon: <img src={Cloud} />,
        label: 'Onedrive',
        labelButton: 'PENDING',
        variantButton: ButtonVariant.pending,
        variant: MenuItemVariant.ghost,
        sizeButton: ButtonSize.badge,
        hasButton: true,
      },
      {
        icon: <img src={Mic} />,
        label: 'Recording',
        labelButton: 'PENDING',
        variantButton: ButtonVariant.pending,
        variant: MenuItemVariant.ghost,
        sizeButton: ButtonSize.badge,
        hasButton: true,
      },
    ],
  ]
  return { connectedSources, sourcesMenu }
}
