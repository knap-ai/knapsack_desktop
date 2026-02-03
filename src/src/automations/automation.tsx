import dayjs from 'dayjs'
import { ConnectionKeys } from 'src/api/connections'
import { SourceDocument } from 'src/utils/SourceDocument'

import { genAutomationUUID } from '../utils/uuid'
import BaseStep from './steps/Base'

export enum CadenceType {
  EVERY_MINUTE = 'every_minute',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  NEVER = 'never',
  OTHER = 'other',
}

export type Cadence = {
  type: CadenceType
  dayOfWeek?: DaysOfWeek
  time?: string
}

export enum DaysOfWeek {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday',
}

export enum AutomationDataSources {
  GMAIL = 'gmail',
  GOOGLE_CALENDAR = 'google_calendar',
  DRIVE = 'drive',
  LOCAL_FILES = 'file',
  WEB = 'web',
}

export const convertAutomationDataSourceToConnectionKey = (automationDataSource: string) => {
  switch (automationDataSource) {
    case AutomationDataSources.GOOGLE_CALENDAR:
      return ConnectionKeys.GOOGLE_CALENDAR
    case AutomationDataSources.GMAIL:
      return ConnectionKeys.GOOGLE_GMAIL
    case AutomationDataSources.DRIVE:
      return ConnectionKeys.GOOGLE_DRIVE
    case AutomationDataSources.LOCAL_FILES:
      return ConnectionKeys.LOCAL_FILES
    default:
      return undefined
  }
}

export const automationDataSourcesIndex: Record<
  AutomationDataSources,
  { asset: string; label: string }
> = {
  [AutomationDataSources.GOOGLE_CALENDAR]: {
    asset: '/assets/images/dataSources/gcal.svg',
    label: 'Google Calendar',
  },
  [AutomationDataSources.GMAIL]: {
    asset: '/assets/images/dataSources/gmail.svg',
    label: 'Gmail',
  },
  [AutomationDataSources.DRIVE]: {
    asset: '/assets/images/dataSources/gdrive.svg',
    label: 'Google Drive',
  },
  [AutomationDataSources.LOCAL_FILES]: {
    asset: '/assets/images/dataSources/files.png',
    label: 'Desktop files',
  },
  [AutomationDataSources.WEB]: {
    asset: '/assets/images/dataSources/web.svg',
    label: 'Web',
  },
}

export enum AutomationTrigger {
  CLICK = 'click',
  CADENCE = 'cadence',
  STARTUP = 'startup',
}

export type AutomationRun = {
  id?: number
  documents?: SourceDocument[]
  threadId?: number
  scheduleDate?: Date
  executionDate?: Date
  runParams?: unknown
  automationUuid?: string
}

type AutomationProps = {
  id?: number
  uuid?: string
  name: string
  description: string
  runs: AutomationRun[]
  cadences: Cadence[]
  steps: BaseStep[]
  isActive?: boolean | undefined
  isBeta?: boolean | undefined
  showLibrary?: boolean | undefined
  icon?: string | undefined
}

export class Automation {
  private id?: number
  private uuid: string
  name: string
  private description: string
  private runs: AutomationRun[]
  private cadences: Cadence[]
  private steps: BaseStep[]
  private isActive?: boolean | undefined
  private isBeta?: boolean | undefined
  private loading?: boolean
  private showLibrary?: boolean | undefined
  icon?: string | undefined

  constructor({
    id,
    uuid,
    name,
    description,
    runs,
    cadences,
    steps,
    isActive,
    isBeta,
    showLibrary,
    icon,
  }: AutomationProps) {
    this.id = id
    this.name = name
    this.description = description
    this.runs = runs
    this.cadences = cadences
    this.steps = steps
    this.uuid = uuid === undefined ? genAutomationUUID(name) : uuid
    this.isActive = isActive
    this.isBeta = isBeta
    this.loading = false
    this.showLibrary = showLibrary ?? true
    this.icon = icon
  }

  getId() {
    return this.id
  }

  getUuid() {
    return this.uuid
  }

  getName() {
    return this.name
  }

  getDescription() {
    return this.description
  }

  getDataSources() {
    const sources = this.steps.reduce((acc: string[], step) => [...acc, ...step.getSources()], [])
    return [...new Set(sources)]
  }

  getRuns() {
    return this.runs
  }

  getCadences() {
    return this.cadences
  }

  getIsActive() {
    return this.isActive
  }

  getIsBeta() {
    return this.isBeta
  }

  getShowLibrary() {
    return this.showLibrary
  }

  getIcon() {
    return this.icon
  }

  getLoading() {
    return this.loading
  }

  setLoading(loading: boolean) {
    this.loading = loading
    return this
  }

  setIsActive(isActive: boolean) {
    this.isActive = isActive
    return this
  }

  setRuns(runs: AutomationRun[]) {
    this.runs = runs
    return this
  }

  createRun(run: AutomationRun) {
    this.runs = [...this.runs, run]
    return this
  }

  updateRun(run: AutomationRun, runId?: number) {
    const index = runId ? this.runs.findIndex(run => run.id === runId) : this.runs.length - 1
    this.runs[index] = run
    return this
  }

  getSteps() {
    return this.steps
  }

  findCadence(date: Date): Cadence | undefined {
    const checkTime = (cadence: Cadence) => cadence.time === dayjs(date).format('HH:mm')
    const checkDayOfWeek = (cadence: Cadence) => {
      const dayOfWeekMapping = [
        DaysOfWeek.SUNDAY,
        DaysOfWeek.MONDAY,
        DaysOfWeek.TUESDAY,
        DaysOfWeek.WEDNESDAY,
        DaysOfWeek.THURSDAY,
        DaysOfWeek.FRIDAY,
        DaysOfWeek.SATURDAY,
      ]
      const dayOfWeek = dayOfWeekMapping[date.getDay()]
      return cadence.dayOfWeek === dayOfWeek
    }
    const checkDailyCadence = (cadence: Cadence) =>
      cadence.type === CadenceType.DAILY && checkTime(cadence)
    const checkHourlyCadence = (cadence: Cadence) =>
      cadence.type === CadenceType.HOURLY && date.getMinutes() === 0
    const checkEveryMinuteCadence = (cadence: Cadence) => cadence.type === CadenceType.EVERY_MINUTE
    const checkWeeklyCadence = (cadence: Cadence) =>
      cadence.type === CadenceType.WEEKLY && checkDayOfWeek(cadence) && checkTime(cadence)
    return this.cadences.find(
      cadence =>
        checkDailyCadence(cadence) ||
        checkHourlyCadence(cadence) ||
        checkWeeklyCadence(cadence) ||
        checkEveryMinuteCadence(cadence),
    )
  }

  serialize() {
    return {
      id: this.id,
      uuid: this.uuid,
      name: this.name,
      description: this.description,
      cadences: this.cadences.map(cadence => ({
        cadence_type: cadence.type,
        day_of_week: cadence.dayOfWeek,
        time: cadence.time,
      })),
      runs: [],
      steps: this.steps.map((step, index) => ({ ...step.serialize(), ordering: index })),
      is_active: this.isActive,
      show_library: this.showLibrary,
      icon: this.icon,
    }
  }
}
