import * as React from 'react'

import MoreVertIcon from '@mui/icons-material/MoreVert'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

import { Automation } from '../../../automations/automation'

interface Props {
  onAutomationDeleteClick: (automation: Automation) => void
  onEditAutomationClick: (automation: Automation) => void
  automation: Automation
}

export default function DotsMenu({
  onAutomationDeleteClick,
  onEditAutomationClick,
  automation,
}: Props) {
  const handleClose = () => {
    setAnchorMenuDispatcher(null)
  }

  const options = [
    {
      name: 'Delete',
      handler: () => {
        onAutomationDeleteClick(automation)
        handleClose()
      },
    },
    {
      name: 'Edit',
      handler: () => {
        onEditAutomationClick(automation)
        handleClose()
      },
    },
  ]
  const [menuDispatcherElement, setAnchorMenuDispatcher] = React.useState<null | HTMLElement>(null)
  const open = !!menuDispatcherElement
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorMenuDispatcher(event.currentTarget)
  }

  return (
    <div>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          'aria-labelledby': 'long-button',
        }}
        anchorEl={menuDispatcherElement}
        open={open}
        onClose={handleClose}
      >
        {options.map(option => (
          <MenuItem key={option.name} onClick={option.handler}>
            {option.name}
          </MenuItem>
        ))}
      </Menu>
    </div>
  )
}
