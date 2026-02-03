import React, { useState } from 'react'

import ArrowBackIcon from '@mui/icons-material/ArrowBackIosNew'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import dayjs from 'dayjs'

import {
  AutomationDataSources,
  automationDataSourcesIndex,
  CadenceType,
  DaysOfWeek,
} from '../../../automations/automation'
import Prompt from '../../../automations/steps/Prompt'
import SemanticSearch from '../../../automations/steps/SemanticSearch'
import { CreateAutomationProps } from 'src/App'

interface AutomationFormProps {
  handleBackButton: () => void
  handleAutomationAction: (props: CreateAutomationProps) => Promise<void>
  userPrompt: string | undefined
  timeDefault: dayjs.Dayjs | undefined
  nameAutomation: string | undefined
  descriptionAutomation: string | undefined
  dataSourcesIds: string[] | undefined
  cadence: CadenceType
  daysOfWeek: DaysOfWeek | undefined
}

const AUTOMATION_LABELS = {
  [CadenceType.NEVER]: 'Manual only',
  [CadenceType.HOURLY]: 'Hourly',
  [CadenceType.DAILY]: 'Daily',
  [CadenceType.WEEKLY]: 'Weekly',
}

const AutomationForm: React.FC<AutomationFormProps> = ({
  handleBackButton,
  handleAutomationAction,
  userPrompt,
  timeDefault,
  nameAutomation,
  descriptionAutomation,
  dataSourcesIds,
  cadence,
  daysOfWeek,
}) => {
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedDataSourceIds, setSelectedDataSourceIds] = useState<AutomationDataSources[]>([])
  const [automationCadence, setAutomationCadence] = useState<CadenceType>(cadence)
  const [time, setTime] = useState<string | undefined>(timeDefault?.format('HH:mm'))
  const [dayOfWeek, setDayOfWeek] = useState<DaysOfWeek | undefined>(daysOfWeek)
  const nameRef = React.useRef<HTMLInputElement>(null)
  const descriptionRef = React.useRef<HTMLTextAreaElement>(null)
  const llmPromptRef = React.useRef<HTMLTextAreaElement>(null)

  //setTime(timeDefault?.format('HH:mm'));
  const handleAutomationFormAction = () => {
    setErrorMessage('')
    const llmPrompt = llmPromptRef.current?.value
    const automationName = nameRef.current?.value
    const automationDescription = descriptionRef.current?.value

    if (!selectedDataSourceIds.length) {
      setErrorMessage('Please select at least one data source in Step 1.')
      return
    }
    if (!llmPrompt) {
      setErrorMessage('Please specify what Knapsack should do with the data in Step 2.')
      return
    }
    if (!automationName) {
      setErrorMessage('Please provide a name for the automation in Step 3.')
      return
    }
    if (!automationDescription) {
      setErrorMessage('Please provide a description for the automation in Step 3.')
      return
    }
    handleAutomationAction({
      name: automationName,
      description: automationDescription,
      steps: [
        new SemanticSearch({ sources: selectedDataSourceIds, userPrompt: llmPrompt }),
        new Prompt({ userPrompt: llmPrompt }),
      ],
      cadences:
        automationCadence !== CadenceType.NEVER
          ? [
              {
                type: automationCadence,
                time: time,
                dayOfWeek,
              },
            ]
          : [],
    })
    handleBackButton()
  }

  const getDataCardCSSClass = (dataSource: AutomationDataSources) => {
    if (selectedDataSourceIds.includes(dataSource)) {
      return 'DataCardSelected'
    }
    return 'DataCard'
  }

  const handleChangeInCadence = (event: any) => {
    setAutomationCadence(event.target.value)
    setDayOfWeek(undefined)
  }

  const handleChangeInDayOfWeek = (event: any) => {
    setDayOfWeek(event.target.value as DaysOfWeek)
  }

  const onDataCardClick = (dataSource: AutomationDataSources) => {
    if (selectedDataSourceIds.includes(dataSource)) {
      setSelectedDataSourceIds(selectedDataSourceIds.filter(item => item !== dataSource))
    } else {
      setSelectedDataSourceIds([...selectedDataSourceIds, dataSource])
    }
  }

  if (dataSourcesIds !== undefined) {
    Object.entries(dataSourcesIds).forEach(([_, value]) => {
      const dataSourceA = value as AutomationDataSources
      if (!selectedDataSourceIds.includes(dataSourceA)) {
        setSelectedDataSourceIds([...selectedDataSourceIds, dataSourceA])
      }
    })
  }

  return (
    <div className="AutomationFormContainer flex flex-col flex-1 max-h-full p-6 py-2 right-0 rounded-md top-24">
      <div className="flex justify-between w-full flex-row">
        <div
          className="flex items-center justify-center cursor-pointer p-6 gap-2 text-[#1566BB] text-xl"
          onClick={handleBackButton}
        >
          <ArrowBackIcon />
          <span className="pb-1">Back</span>
        </div>
      </div>
      <div className="max-h-full overflow-y-auto">
        <div className="flex flex-row">
          <div className="BuildStep pr-12 step-1">
            <span className="font-semibold text-xl">Step 1: Select data sources</span>
            {Object.entries(automationDataSourcesIndex).map(([key, { label, asset }]) => {
              return (
                <div
                  key={key}
                  className={`${getDataCardCSSClass(key as AutomationDataSources)} w-48 rounded-xl p-1 m-2 mx-auto content-center flex flex-row`}
                  onClick={() => onDataCardClick(key as AutomationDataSources)}
                >
                  <div className="flex flex-1 py-2">
                    <img className="w-5 mx-2" src={asset} />
                  </div>
                  <div className="DataCardHeader flex font-regular text-start text-base mr-1">
                    <span className="content-center">{label}</span>
                  </div>
                  <div className="DataCardBody flex font-medium text-start text-sm text-soft-gray">
                    <span></span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="BuildStep flex-1 pl-12">
            <div className="flex flex-col justify-end">
              <span className="font-semibold text-xl">
                Step 2: Describe what Knapsack should do with this data
              </span>
              <textarea
                className="mt-2 h-48 p-2 rounded-lg"
                placeholder="What should Knapsack do with this data..."
                ref={llmPromptRef}
                defaultValue={userPrompt}
              ></textarea>
            </div>
          </div>
        </div>
        <div className="BuildStep mt-8 step-3 pt-4">
          <div className="flex flex-col items-center">
            <div className="mb-2 mb-8">
              <span className="font-semibold text-xl">
                Step 3: When should this automation run?
              </span>
            </div>
            <div className="flex flex-row space-x-8 ">
              <div>
                <FormControl className="w-48" variant="outlined">
                  <InputLabel id="cadence-picker-label">Cadence</InputLabel>
                  <Select
                    labelId="cadence-picker-label"
                    id="cadence-picker"
                    value={automationCadence}
                    onChange={handleChangeInCadence}
                    label="Automation Cadence"
                  >
                    {Object.entries(AUTOMATION_LABELS).map(([key, label]) => (
                      <MenuItem key={key} value={key}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              {automationCadence == CadenceType.WEEKLY && (
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="day-picker-label">Day of the Week</InputLabel>
                  <Select
                    labelId="day-picker-label"
                    id="day-picker"
                    value={dayOfWeek}
                    onChange={handleChangeInDayOfWeek}
                    label="Day of the Week"
                    className="capitalize"
                  >
                    {Object.entries(DaysOfWeek).map(([key, value]) => (
                      <MenuItem key={key} value={key} className="capitalize">
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {automationCadence !== CadenceType.NEVER &&
                automationCadence &&
                automationCadence !== CadenceType.HOURLY && (
                  <div className="w-96">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TimePicker
                        label="Time"
                        defaultValue={timeDefault}
                        onChange={time => setTime(time?.format('HH:mm'))}
                      />
                    </LocalizationProvider>
                  </div>
                )}
            </div>
          </div>
        </div>
        <div className="BuildStep mt-8 step-3 pt-4">
          <div className="flex flex-col items-center">
            <span className="font-semibold text-xl">Step 4: Provide a name and description</span>
            <input
              className="mt-2 p-2 rounded-lg h-12 w-64"
              placeholder="Name"
              ref={nameRef}
              defaultValue={nameAutomation}
            />
            <textarea
              className="mt-2 h-48 p-2 rounded-lg h-24 w-96"
              placeholder="Description"
              ref={descriptionRef}
              defaultValue={descriptionAutomation}
            ></textarea>
          </div>
        </div>
        <div className="flex-grow"></div>
        <div className="flex flex-1 justify-center">
          {errorMessage.length > 0 && (
            <div className="ErrorCreatingAutomation">
              <span>Error saving automation: {errorMessage}</span>
            </div>
          )}
          <button
            className="BuildEditAutomationButton p-2 mt-8 rounded-lg bg-[#1566BB] text-white"
            onClick={handleAutomationFormAction}
          >
            Save automation
          </button>
        </div>
      </div>
    </div>
  )
}

export default AutomationForm
