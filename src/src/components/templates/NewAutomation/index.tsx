import './styles.module.scss'

import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'

import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import { Connection, ConnectionKeys } from 'src/api/connections'
import { Automation, CadenceType, DaysOfWeek } from 'src/automations/automation'
import { IFeed } from 'src/hooks/feed/useFeed'
import { useSources } from 'src/hooks/newAutomation/useNewAutomation'
import usePreview from 'src/hooks/newAutomation/usePreview'
import useSubmit from 'src/hooks/newAutomation/useSubmit'
import { DISCORD_LINK, TERMS_LINK } from 'src/utils/constants'
import { setInitialSources } from 'src/utils/initialSources'
import KNAnalytics from 'src/utils/KNAnalytics'

import { Button, ButtonSize, ButtonVariant } from 'src/components/atoms/button'
import { InputText } from 'src/components/atoms/input-text'
import MenuItem, { MenuItemVariant } from 'src/components/molecules/MenuItem'
import TimeInput from 'src/components/molecules/TimeInput'
import MultiSelectSearch from 'src/components/organisms/MultiSelectSearch'
import TextRenderer from 'src/components/TextRenderer'

import { open } from '@tauri-apps/api/shell'

import { ToastrState } from '../Home/Home'
import Discord from '/assets/images/icons/discord.svg'
import Label from '/assets/images/Label.svg'

const AUTOMATION_LABELS = {
  [CadenceType.NEVER]: 'Run on Request',
  [CadenceType.HOURLY]: 'Hourly',
  [CadenceType.DAILY]: 'Daily',
  [CadenceType.WEEKLY]: 'Weekly',
  [CadenceType.OTHER]: 'Other',
}
type NewAutomationProps = {
  className?: string
  onConnectionItemClick: (connectionKey: ConnectionKeys[]) => void
  connections: Record<string, Connection>
  handleAutomationPreview: (
    automation: Automation,
    onAutomationFinishCallback: (message: string) => void,
  ) => Promise<void>
  setUseLocalLLM: (useLocalLLM: boolean) => void
  useLocalLLM: boolean
  email_user: string
  saveLocally: boolean
  handleBackButton: () => void
  feed?: IFeed
  dataSourceTitle: string
  menuTitle: string
  promptTile: string
  labelButtonPreview: string
  cadenceTitle: string
  labelButtonSubmit: string
  handleOpenToastr: (
    message: ReactElement,
    alertType: ToastrState['alertType'],
    autoHideDuration?: number,
  ) => void
}
const NewAutomation: React.FC<NewAutomationProps> = ({
  connections,
  onConnectionItemClick,
  handleAutomationPreview,
  setUseLocalLLM,
  useLocalLLM,
  email_user,
  saveLocally,
  handleBackButton,
  dataSourceTitle,
  menuTitle,
  promptTile,
  labelButtonPreview,
  cadenceTitle,
  labelButtonSubmit,
  handleOpenToastr,
  feed,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpenMenu, setIsOpenMenu] = useState(false)

  const {
    selectedSources,
    sourceOptions,
    setSelectedSources,
    setSourceOptions,
    handleMenuItemClick,
    handleSelectedSourceClick,
  } = useSources(connections, onConnectionItemClick)
  const [automationCadence, setAutomationCadence] = useState<
    Exclude<CadenceType, CadenceType.EVERY_MINUTE>
  >(CadenceType.NEVER)
  const [time, setTime] = useState<string | undefined>(undefined)
  const [dayOfWeek, setDayOfWeek] = useState<DaysOfWeek | undefined>(undefined)
  const [descriptionOtherCadence, setDescriptionOtherCadence] = useState<string | undefined>(
    undefined,
  )

  useEffect(() => {
    const connectedSources = setInitialSources(connections, onConnectionItemClick).connectedSources

    const updatedConnectedSources = connectedSources.map(source => ({
      ...source,
      onClick: () => handleSelectedSourceClick(source.label),
    }))
    setSelectedSources(updatedConnectedSources)
  }, [])

  useEffect(() => {
    const connectedSources = setInitialSources(connections, onConnectionItemClick).connectedSources

    const filteredSourcesMenu = sourceOptions.map(source => {
      const isConnected = connectedSources.some(
        connectedSource => connectedSource.label === source.label,
      )

      const isSelected = selectedSources.some(
        selectedSource => selectedSource.label === source.label,
      )

      if (isConnected && isSelected) {
        return {
          ...source,
          variantButton: ButtonVariant.connected,
          labelButton: 'CONNECTED',
          variant: MenuItemVariant.selected,
          onClickButton: undefined,
        }
      } else if (isConnected) {
        return {
          ...source,
          variantButton: ButtonVariant.connected,
          labelButton: 'CONNECTED',
          variant: MenuItemVariant.ghost,
          onClickButton: undefined,
        }
      }

      return source
    })
    setSourceOptions(filteredSourcesMenu)
  }, [connections])

  const filteredOptions = sourceOptions?.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (filteredOptions?.length === 0 && searchTerm !== '') {
    filteredOptions.push({
      icon: <SearchOutlinedIcon />,
      label: searchTerm,
      labelButton: 'PENDING',
      variantButton: ButtonVariant.pending,
      variant: MenuItemVariant.ghost,
      onClick: () => handleMenuItemClick(searchTerm),
      sizeButton: ButtonSize.badge,
      hasButton: true,
    })
  }

  const dropdownRef = useRef<HTMLDivElement>(null)
  const dropdownRefCadence = useRef<HTMLDivElement>(null)
  const dropdownRefDay = useRef<HTMLDivElement>(null)

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpenMenu(false)
      setSearchTerm('')
    }
    if (dropdownRefCadence.current && !dropdownRefCadence.current.contains(event.target as Node)) {
      closeDropdownContent()
    }

    if (dropdownRefDay.current && !dropdownRefDay.current.contains(event.target as Node)) {
      closeDropdownDay()
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const llmPromptRef = useRef<HTMLTextAreaElement>(null)

  const { preview, handlePreviewClick } = usePreview(
    handleAutomationPreview,
    useLocalLLM,
    setUseLocalLLM,
    handleOpenToastr,
  )

  const { handleSubmitClick } = useSubmit(
    saveLocally,
    email_user,
    handleBackButton,
    handleOpenToastr,
    feed,
  )

  const [isDropdownContentOpen, setDropdownContentOpen] = useState(false)
  const openDropdownContent = useCallback(() => {
    setDropdownContentOpen(true)
  }, [])
  const closeDropdownContent = useCallback(() => {
    setDropdownContentOpen(false)
  }, [])

  const [isDropdownContentDay, setDropdownContentDay] = useState(false)
  const openDropdownDay = useCallback(() => {
    setDropdownContentDay(true)
  }, [])
  const closeDropdownDay = useCallback(() => {
    setDropdownContentDay(false)
  }, [])

  const getAutomationCadence = (key: string): CadenceType => {
    const automationCadence = Object.entries(AUTOMATION_LABELS).find(
      ([k, v]) => k === key || v === key,
    )

    if (automationCadence) {
      return automationCadence[0] as CadenceType
    }

    return CadenceType.NEVER
  }

  const handleDropdownDayClick = (dayOfWeek: DaysOfWeek) => {
    setDayOfWeek(dayOfWeek)
    closeDropdownDay()
  }
  const handleDropdownCadenceClick = (cadenceKey: string) => {
    setAutomationCadence(
      getAutomationCadence(cadenceKey) as Exclude<CadenceType, CadenceType.EVERY_MINUTE>,
    )
    if (cadenceKey !== CadenceType.OTHER) {
      setDescriptionOtherCadence(undefined)
    }
    closeDropdownContent()
  }

  const handleTimeChange = (hour: string, minute: string, meridiem: string) => {
    if (hour !== '' || minute !== '') {
      const hourNumber = parseInt(hour)
      const minuteNumber = parseInt(minute)

      if (
        hourNumber >= 1 &&
        hourNumber <= 12 &&
        minuteNumber >= 0 &&
        minuteNumber <= 59 &&
        (meridiem.toUpperCase() === 'AM' || meridiem.toUpperCase() === 'PM')
      ) {
        const convertedDate = new Date()
        convertedDate.setHours(hourNumber)
        convertedDate.setMinutes(minuteNumber)
        if (meridiem.toUpperCase() === 'PM' && hourNumber !== 12) {
          convertedDate.setHours(hourNumber + 12)
        } else if (meridiem.toUpperCase() === 'AM' && hourNumber === 12) {
          convertedDate.setHours(0)
        }
        setTime(
          convertedDate.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
          }),
        )
      } else {
        setTime(undefined)
      }
    }
  }
  const handleOtherCadenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setDescriptionOtherCadence(value)
  }

  const handleDiscordClick = () => {
    open(DISCORD_LINK)
  }

  const handleTermsClick = () => {
    open(TERMS_LINK)
  }

  return (
    <div className="flex-col flex-1 max-h-full overflow-auto">
      <div
        className="flex content-center items-center gap-2 mb-6 mt-6 ml-10 text-sm"
        data-tauri-drag-region
      >
        <div
          className="cursor-pointer"
          onClick={() => {
            KNAnalytics.trackEvent('NewAutomationToHome', {})
            handleBackButton()
          }}
        >
          Home
        </div>
        <img className="w-2.5 h-2.5" src="/assets/images/navigation_arrow_vector.svg" />
        <div>New Automation Request</div>
      </div>
      <div className="flex flex-row relative text-sm flex-start space-between mb-5">
        <div className="flex flex-col justify-self-start flex-start ml-10 gap-6 mt-1 w-1/2 max-w-[720px]">
          <div className="flex flex-col flex-start gap-2">
            <div className="relative h-6 inline">{promptTile}</div>
            <div className="align-stretch border-solid border-gray-200 rounded-md bg-white TightShadow min-h-48 flex flex-row items-start justify-start p-1 text-gray-500">
              <textarea
                ref={llmPromptRef}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handlePreviewClick(llmPromptRef, selectedSources, false)
                  }
                }}
                className="flex-grow-1 relative text-align-left w-full h-full resize-none"
                placeholder={`e.g. Speak to me in the second person (e.g., Your last interaction with this person was…”). Do not use any information about people who are not participants in this meeting unless they work at the same company as people in this meeting.

Output the meeting preparation in this format (without printing the <format> and </format> tags:`}
              ></textarea>
            </div>
          </div>
          <div className="flex flex-col flex-start gap-2" ref={dropdownRef}>
            <div className="relative h-6 inline">{dataSourceTitle}</div>
            <MultiSelectSearch
              selectedSources={selectedSources}
              filteredOptions={filteredOptions}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              isOpen={isOpenMenu}
              menuTitle={menuTitle}
              placeHolderInput="Add data sources"
              iconInput={<SearchOutlinedIcon />}
              onClickInput={() => setIsOpenMenu(true)}
            />
          </div>
          <div className="flex flex-col flex-start gap-1 flex-grow-1">
            <div className="relative h-6 inline">{cadenceTitle}</div>
            <div
              className={`${automationCadence === CadenceType.DAILY ? 'flex flex-row flex-start gap-6' : 'flex flex-col flex-start gap-4'}`}
            >
              <div>
                <div
                  className="relative flex flex-row items-center justify-start gap-4 rounded-lg bg-white border border-gray-200 box-border w-fit h-10 px-4 py-2"
                  onClick={openDropdownContent}
                >
                  <div className="flex flex-col flex-start gap-4">
                    {AUTOMATION_LABELS[automationCadence] ?? ''}
                  </div>
                  <img className="object-contain w-3 h-3 relative" alt="" src={Label} />
                </div>
                {isDropdownContentOpen && (
                  <div
                    className="w-[151px] relative border border-gray-200 rounded-md bg-white box-border flex flex-col items-start justify-start text-left text-sm text-black max-h-[100px] overflow-auto"
                    ref={dropdownRefCadence}
                  >
                    {Object.entries(AUTOMATION_LABELS).map(([key, value]) => (
                      <MenuItem
                        key={key}
                        label={value}
                        variant={MenuItemVariant.regular}
                        onClick={() => handleDropdownCadenceClick(key)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {automationCadence === CadenceType.WEEKLY && (
                <div className="flex flex-col">
                  <div className="w-[360px] relative h-[40px] flex flex-row items-start justify-start text-left text-sm text-gray-470">
                    <div>
                      <div
                        className="relative flex flex-row items-center justify-start gap-4 rounded-md bg-white border border-gray-200 box-border max-w-[140px] h-10 px-4 py-2"
                        onClick={openDropdownDay}
                      >
                        <div className="flex flex-col flex-start gap-4">{dayOfWeek}</div>
                        <img className="object-contain w-3 h-3 relative" alt="" src={Label} />
                      </div>

                      {isDropdownContentDay && (
                        <div
                          className="w-[151px] relative border border-gray-200 rounded-md bg-white box-border flex flex-col items-start justify-start text-left text-sm text-black max-h-[100px] overflow-auto"
                          ref={dropdownRefDay}
                        >
                          {Object.entries(DaysOfWeek).map(([key, value]) => (
                            <MenuItem
                              key={key}
                              label={value}
                              variant={MenuItemVariant.regular}
                              onClick={() => handleDropdownDayClick(value)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex relative max-h-[40px]">
                      <TimeInput onTimeChange={handleTimeChange} />
                    </div>
                  </div>
                </div>
              )}

              {automationCadence === CadenceType.OTHER && (
                <InputText
                  className="flex flex-row flex-1 relative w-full h-[36px] text-sm"
                  placeholder="Please describe"
                  onChange={handleOtherCadenceChange}
                />
              )}
              {automationCadence === CadenceType.DAILY && (
                <div className="flex relative max-h-[40px]">
                  <TimeInput onTimeChange={handleTimeChange} />
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-row gap-x-4 w-fit">
            <Button
              label={labelButtonPreview}
              size={ButtonSize.fullWidth}
              variant={ButtonVariant.borderBlue}
              onClick={() => handlePreviewClick(llmPromptRef, selectedSources, false)}
              className="shadow-md"
            />
            <Button
              label={labelButtonSubmit}
              size={ButtonSize.fullWidth}
              variant={ButtonVariant.regularBlue}
              onClick={() =>
                handleSubmitClick(
                  llmPromptRef,
                  selectedSources,
                  automationCadence,
                  time,
                  dayOfWeek,
                  descriptionOtherCadence,
                  false,
                )
              }
            />
          </div>
          <div className="h-full flex items-end">
            <span className="text-black text-sm font-normal leading-tight">
              We publish automations in accordance with our
            </span>
            <span
              className="text-blue-700 text-sm  leading-normal ml-1 hover:cursor-pointer"
              onClick={handleTermsClick}
            >
              Terms of Use
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-self-start flex-start ml-14 gap-3 mt-1 w-full mr-4 mb-5 max-h-[660px]">
          <div className="flex flex-row  items-center  justify-between w-full">
            <div className="relative text-sm ">Preview</div>
            <div
              onClick={handleDiscordClick}
              className="relative flex flex-row items-center flex-start gap-2 hover:cursor-pointer text-[10px] text-right"
            >
              <div className="h-[25px] flex flex-col gap-0.5 text-right">
                <span className="text-ks-neutral-700 text-[10px] leading-[10px]">Need ideas?</span>
                <span className="text-ks-neutral-700 text-sm font-bold leading-[14px]">
                  Join our Discord
                </span>
              </div>
              <img className="relative" alt="Discord Invite" src={Discord} />
            </div>
          </div>
          <div className="flex w-full relative TightShadow rounded-lg bg-white mb-4 h-full">
            <div className="w-full overflow-auto flex flex-col h-full text-left items-center p-5">
              <TextRenderer text={preview}></TextRenderer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default NewAutomation
