import AboutMeAutomation from 'src/automations/steps/AboutMe'
import BaseStep from 'src/automations/steps/Base'
import BusinessCoachAutomation from 'src/automations/steps/BusinessCoach'
import FinraCompliance from 'src/automations/steps/FinraCompliance'
import LeadScoring from 'src/automations/steps/LeadScoring'
import PostSafely from 'src/automations/steps/PostSafely'
import SocialMediaPlanner from 'src/automations/steps/SocialMediaPlanner'
import StrategicPlan from 'src/automations/steps/StrategicPlan'

import { Automation, CadenceType, DaysOfWeek } from '../automations/automation'
import EmailSummary from '../automations/steps/EmailSummary'
import MeetingPrep from '../automations/steps/MeetingPrep'
import Prompt from '../automations/steps/Prompt'
import SemanticSearch from '../automations/steps/SemanticSearch'
import {
  API_SERVER_AUTOMATIONS,
  KN_API_AUTOMATION_RUNS,
  KN_API_AUTOMATION_SCHEDULE_RUNS,
  KN_API_AUTOMATIONS,
  KN_API_AUTOMATIONS_START_CHECK,
  KN_API_SYSTEM_MESSAGES,
} from '../utils/constants'
import { serializeThreadWithMessages } from './threads'
import { serializeFeedItem } from './feed_items'

const serializeAutomationRun = (run: {
  id: number
  userId: number
  threadId: number
  scheduleTimestamp: number
  executionTimestamp?: number
  run_params?: string
}) => ({
  id: run.id,
  threadId: run.threadId,
  scheduleDate: new Date(run.scheduleTimestamp),
  executionDate: run.executionTimestamp ? new Date(run.executionTimestamp * 1000) : undefined,
  runParams: run.run_params ? JSON.parse(run.run_params) : undefined,
})

const serializeAutomation = (automationData: {
  id: number
  uuid: string
  name: string
  description: string
  isActive: boolean
  isBeta: boolean
  showLibrary: boolean
  icon?: string
  triggerCadences: {
    id: number
    cadenceType: string
    dayOfWeek?: string | null
    time: string | null
  }[]
  runs: [
    {
      id: number
      date: number
      userId: number
      threadId: number
      scheduleTimestamp: number
      executionTimestamp?: number
    },
  ]
  steps: [
    {
      id: number
      name: string
      ordering: number
      argsJson: string | null
    },
  ]
}) => {
  const constructors = [
    EmailSummary,
    MeetingPrep,
    Prompt,
    SemanticSearch,
    FinraCompliance,
    PostSafely,
    StrategicPlan,
    BusinessCoachAutomation,
    AboutMeAutomation,
    SocialMediaPlanner,
    LeadScoring,
  ]
  const stepOrdering = automationData.steps.map(step => {
    return step.ordering
  })
  const automationStepsMapping = automationData.steps.map(step => {
    const Step = constructors.find(constructor => constructor.getName() === step.name)
    if (!Step) {
      console.error('Missing step implementation')
      return
    }
    return Step.create(step.argsJson)
  })
  const automationSteps = stepOrdering.map(ordering => automationStepsMapping[ordering])
  const automation = new Automation({
    id: automationData.id,
    uuid: automationData.uuid,
    name: automationData.name,
    description: automationData.description,
    runs: automationData.runs.map(serializeAutomationRun),
    cadences: automationData.triggerCadences.map(cadence => ({
      type: cadence.cadenceType as CadenceType,
      dayOfWeek: (cadence.dayOfWeek as DaysOfWeek) ?? undefined,
      time: cadence.time ?? undefined,
    })),
    steps: automationSteps as BaseStep[],
    isActive: automationData.isActive,
    isBeta: automationData.isBeta,
    showLibrary: automationData.showLibrary,
    icon: automationData.icon,
  })
  return automation
}

export async function getAutomations(): Promise<Automation[]> {
  const response = await fetch(KN_API_AUTOMATIONS, {
    method: 'GET',
  })
  const data = await response.json()
  if (!data || data['success'] !== true) {
    console.log(`getAutomations data error`)
    throw new Error(`getAutomations data error`)
  }
  return data.data.map(serializeAutomation) as Automation[]
}

export async function upsertAutomation(automation: Automation) {
  const response = await fetch(KN_API_AUTOMATIONS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(automation.serialize()),
  })
  const data = await response.json()
  if (!data || data['success'] !== true) {
    console.log(`createAutomation data error`)
    return false
  }
  return true
}

export async function insertAutomationToServer(automation: Automation, userEmail: string) {
  const response = await fetch(API_SERVER_AUTOMATIONS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...automation.serialize(),
      creator_email: userEmail,
    }),
  })
  const data = await response.json()
  return !!data?.success
}

type InsertAutomationRunArgs = {
  automationUuid: string
  executionDate: Date
  userEmail: string
  userPrompt: string
  userPromptFacade?: string
  botPrompt: string
  threadId?: number
  runId?: number
  documents?: number[]
  feed_item_id?: number
}

export async function insertAutomationRun({
  automationUuid,
  executionDate,
  userEmail,
  userPrompt,
  userPromptFacade,
  botPrompt,
  threadId,
  runId,
  documents,
  feed_item_id,
}: InsertAutomationRunArgs) {
  const response = await fetch(KN_API_AUTOMATION_RUNS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      automation_uuid: automationUuid,
      thread_id: threadId,
      automation_run_id: runId,
      execution_timestamp: executionDate.getTime(),
      user_prompt: userPrompt,
      user_prompt_facade: userPromptFacade,
      result: botPrompt,
      user_email: userEmail,
      documents: documents ?? [],
      feed_item_id,
    }),
  })
  const data = await response.json()
  if (!data || data['success'] !== true) {
    return undefined
  }
  return serializeFeedItem(data.feed_item)
}

export async function deleteAutomationAPI(automation_id: number) {
  const response = await fetch(KN_API_AUTOMATIONS + '/' + automation_id.toString(), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  return !!data?.success
}

export async function updateAutomationAPI(automation_id: number, automation: Automation) {
  const response = await fetch(KN_API_AUTOMATIONS + '/' + automation_id.toString(), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(automation.serialize()),
  })
  const data = await response.json()
  return !!data?.success
}

export async function updateAutomationFeedbackAPI(
  messageId: number,
  userEmail: string,
  feedback: number,
) {
  const response = await fetch(KN_API_AUTOMATIONS + '/feedbacks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message_id: messageId,
      user_email: userEmail,
      feedback: feedback,
    }),
  })
  const responseData = await response.text()

  try {
    const data = JSON.parse(responseData)
    return data?.success
  } catch {
    throw new Error('Failed to parse response as JSON')
    return false
  }
}

export async function getAutomationStartStatusAPI() {
  const response = await fetch(KN_API_AUTOMATIONS_START_CHECK, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  try {
    const data = await response.json()
    return !!data?.success
  } catch (err) {
    console.error(err)
    throw new Error('Failed to get automation start status')
  }
}

export async function insertSystemMessage(
  content: string,
  timestamp: number,
  hide_follow_up: boolean,
  thread_id: number,
  document_ids?: number[],
) {
  const response = await fetch(KN_API_SYSTEM_MESSAGES, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
      timestamp,
      hide_follow_up,
      thread_id,
      document_ids,
    }),
  })
  const data = await response.json()
  if (!data || data['success'] !== true) {
    throw new Error('Failed to insert system message')
  }
  return serializeThreadWithMessages(data.thread)
}

export async function scheduleRuns(userEmail: string) {
  const response = await fetch(KN_API_AUTOMATION_SCHEDULE_RUNS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_email: userEmail }),
  })
  const data = await response.json()
  return !!data?.success
}
