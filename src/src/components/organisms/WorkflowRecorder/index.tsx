import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  createWorkflow,
  getWorkflows,
  executeWorkflow,
  deleteWorkflow,
  getWorkflowRuns,
  BrowserWorkflow,
  BrowserWorkflowRun,
  RecordedAction,
  WorkflowExecutionResult,
} from 'src/api/browser_workflows'

import { CadenceType, Cadence, DaysOfWeek } from 'src/automations/automation'

type RecorderStatus = 'idle' | 'recording' | 'saving' | 'playing'

/**
 * Published Knapsack Chrome extension ID from the Chrome Web Store.
 * Override via localStorage 'knapsack-extension-id' for dev/unpacked builds.
 */
const KNAPSACK_EXTENSION_ID = 'ndolhgjognokndkmkcjgookcogfbgdpg'

function getExtensionId(): string {
  return localStorage.getItem('knapsack-extension-id') || KNAPSACK_EXTENSION_ID
}

/**
 * Send a message to the Knapsack Chrome extension via chrome.runtime.sendMessage.
 * Falls back to the relay control endpoint for environments without chrome APIs
 * (e.g. when running inside Tauri's webview).
 */
async function sendExtensionMessage(msg: Record<string, unknown>): Promise<unknown> {
  const extensionId = getExtensionId()

  // Try direct Chrome extension messaging first (works if running inside Chrome)
  if (typeof chrome !== 'undefined' && chrome?.runtime?.sendMessage) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(extensionId, msg, (response: unknown) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else {
          resolve(response)
        }
      })
    })
  }

  // Fallback for Tauri webview: relay through the local control endpoint
  const resp = await fetch('http://127.0.0.1:18792/recorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(msg),
  })
  return resp.json()
}

export default function WorkflowRecorder() {
  const [status, setStatus] = useState<RecorderStatus>('idle')
  const [workflows, setWorkflows] = useState<BrowserWorkflow[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<BrowserWorkflow | null>(null)
  const [runs, setRuns] = useState<BrowserWorkflowRun[]>([])
  const [lastResult, setLastResult] = useState<WorkflowExecutionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Recording state
  const [recordingTabId, setRecordingTabId] = useState<number | null>(null)
  const [actionCount, setActionCount] = useState(0)

  // Save dialog
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [workflowName, setWorkflowName] = useState('')
  const [workflowDescription, setWorkflowDescription] = useState('')
  const [cadenceType, setCadenceType] = useState<CadenceType>(CadenceType.NEVER)
  const [cadenceDay, setCadenceDay] = useState<DaysOfWeek>(DaysOfWeek.MONDAY)
  const [cadenceTime, setCadenceTime] = useState('09:00')
  const pendingRecording = useRef<{
    startUrl: string
    actions: RecordedAction[]
  } | null>(null)

  const loadWorkflows = useCallback(async () => {
    try {
      const wfs = await getWorkflows()
      setWorkflows(wfs)
    } catch (e) {
      console.error('Failed to load workflows:', e)
    }
  }, [])

  useEffect(() => {
    loadWorkflows()
  }, [loadWorkflows])

  const startRecording = useCallback(async () => {
    setError(null)
    try {
      // Get the active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      const tab = tabs[0]
      if (!tab?.id) {
        setError('No active tab found. Please open a Chrome tab first.')
        return
      }

      await sendExtensionMessage({
        type: 'OPENCLAW_RECORDER_START',
        tabId: tab.id,
      })

      setRecordingTabId(tab.id)
      setStatus('recording')
      setActionCount(0)

      // Poll for action count
      const interval = setInterval(async () => {
        try {
          const resp = (await sendExtensionMessage({
            type: 'OPENCLAW_RECORDER_STATUS',
          })) as { recording: boolean; actionCount: number } | null
          if (resp && resp.recording) {
            setActionCount(resp.actionCount)
          } else {
            clearInterval(interval)
          }
        } catch {
          clearInterval(interval)
        }
      }, 1000)
    } catch (e) {
      setError(`Failed to start recording: ${e instanceof Error ? e.message : String(e)}`)
    }
  }, [])

  const stopRecording = useCallback(async () => {
    try {
      const result = (await sendExtensionMessage({
        type: 'OPENCLAW_RECORDER_STOP_AND_GET',
      })) as { startUrl: string; actions: RecordedAction[] } | null

      if (result && result.actions.length > 0) {
        pendingRecording.current = result
        setShowSaveDialog(true)
      } else {
        setError('No actions were recorded.')
      }
    } catch (e) {
      setError(`Failed to stop recording: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setStatus('idle')
      setRecordingTabId(null)
    }
  }, [])

  const saveWorkflow = useCallback(async () => {
    if (!pendingRecording.current || !workflowName.trim()) return
    setStatus('saving')
    setError(null)

    try {
      const workflow = await createWorkflow({
        name: workflowName.trim(),
        description: workflowDescription.trim(),
        startUrl: pendingRecording.current.startUrl,
        stepsJson: JSON.stringify(pendingRecording.current.actions),
      })

      // If a cadence was selected, create an automation with this workflow as a step
      if (cadenceType !== CadenceType.NEVER) {
        const cadence: Cadence = {
          type: cadenceType,
          time: cadenceTime,
          dayOfWeek: cadenceType === CadenceType.WEEKLY ? cadenceDay : undefined,
        }

        // Create automation via the existing automation API
        await fetch('http://127.0.0.1:8897/api/knapsack/automations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uuid: `wf-${workflow.uuid}`,
            name: `Workflow: ${workflowName.trim()}`,
            description: `Scheduled browser workflow: ${workflowDescription.trim()}`,
            is_active: true,
            cadences: [
              {
                cadence_type: cadence.type,
                day_of_week: cadence.dayOfWeek,
                time: cadence.time,
              },
            ],
            steps: [
              {
                name: 'browser_workflow',
                args_json: JSON.stringify({ workflowUuid: workflow.uuid }),
              },
            ],
          }),
        })
      }

      pendingRecording.current = null
      setShowSaveDialog(false)
      setWorkflowName('')
      setWorkflowDescription('')
      setCadenceType(CadenceType.NEVER)
      await loadWorkflows()
    } catch (e) {
      setError(`Failed to save workflow: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setStatus('idle')
    }
  }, [
    workflowName,
    workflowDescription,
    cadenceType,
    cadenceDay,
    cadenceTime,
    loadWorkflows,
  ])

  const playWorkflow = useCallback(
    async (workflow: BrowserWorkflow) => {
      setStatus('playing')
      setError(null)
      setSelectedWorkflow(workflow)
      try {
        const { result } = await executeWorkflow(workflow.uuid)
        setLastResult(result)
        const workflowRuns = await getWorkflowRuns(workflow.uuid)
        setRuns(workflowRuns)
      } catch (e) {
        setError(`Playback failed: ${e instanceof Error ? e.message : String(e)}`)
      } finally {
        setStatus('idle')
      }
    },
    []
  )

  const handleDeleteWorkflow = useCallback(
    async (id: number) => {
      await deleteWorkflow(id)
      await loadWorkflows()
      if (selectedWorkflow?.id === id) {
        setSelectedWorkflow(null)
        setLastResult(null)
      }
    },
    [loadWorkflows, selectedWorkflow]
  )

  const viewRuns = useCallback(async (workflow: BrowserWorkflow) => {
    setSelectedWorkflow(workflow)
    const workflowRuns = await getWorkflowRuns(workflow.uuid)
    setRuns(workflowRuns)
  }, [])

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Browser Workflow Recorder</h2>
        <div className="flex gap-2">
          {status === 'idle' && (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
            >
              <span className="h-2 w-2 rounded-full bg-white" />
              Start Recording
            </button>
          )}
          {status === 'recording' && (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              <span className="h-3 w-3 rounded-sm bg-red-500" />
              Stop Recording ({actionCount} actions)
            </button>
          )}
          {status === 'playing' && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-sm text-blue-700">
              <span className="animate-spin">&#9696;</span>
              Playing workflow...
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold">Save Recorded Workflow</h3>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Workflow name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <textarea
              placeholder="Description (optional)"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              rows={2}
            />
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Schedule (optional)
              </label>
              <select
                value={cadenceType}
                onChange={(e) => setCadenceType(e.target.value as CadenceType)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value={CadenceType.NEVER}>No schedule</option>
                <option value={CadenceType.EVERY_MINUTE}>Every minute (testing)</option>
                <option value={CadenceType.HOURLY}>Hourly</option>
                <option value={CadenceType.DAILY}>Daily</option>
                <option value={CadenceType.WEEKLY}>Weekly</option>
              </select>
              {(cadenceType === CadenceType.DAILY ||
                cadenceType === CadenceType.WEEKLY) && (
                <input
                  type="time"
                  value={cadenceTime}
                  onChange={(e) => setCadenceTime(e.target.value)}
                  className="ml-2 rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              )}
              {cadenceType === CadenceType.WEEKLY && (
                <select
                  value={cadenceDay}
                  onChange={(e) => setCadenceDay(e.target.value as DaysOfWeek)}
                  className="ml-2 rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  {Object.values(DaysOfWeek).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveWorkflow}
                disabled={!workflowName.trim()}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
              >
                Save Workflow
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false)
                  pendingRecording.current = null
                }}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workflows List */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-gray-600">Saved Workflows</h3>
        {workflows.length === 0 && (
          <p className="text-sm text-gray-400">
            No workflows recorded yet. Click &quot;Start Recording&quot; to begin.
          </p>
        )}
        {workflows.map((wf) => {
          const steps: RecordedAction[] = JSON.parse(wf.stepsJson || '[]')
          return (
            <div
              key={wf.uuid}
              className={`flex items-center justify-between rounded-lg border p-3 ${
                selectedWorkflow?.uuid === wf.uuid
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{wf.name}</span>
                <span className="text-xs text-gray-500">
                  {steps.length} steps &middot; {wf.startUrl}
                </span>
                {wf.description && (
                  <span className="text-xs text-gray-400">{wf.description}</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => playWorkflow(wf)}
                  disabled={status !== 'idle'}
                  className="rounded-md bg-green-500 px-3 py-1 text-xs font-medium text-white hover:bg-green-600 disabled:opacity-50"
                >
                  Play
                </button>
                <button
                  onClick={() => viewRuns(wf)}
                  className="rounded-md bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300"
                >
                  Runs
                </button>
                <button
                  onClick={() => wf.id && handleDeleteWorkflow(wf.id)}
                  className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Last Execution Result */}
      {lastResult && selectedWorkflow && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold">
            Last Run: {selectedWorkflow.name}
          </h3>
          <div className="mb-2 flex gap-4 text-xs">
            <span className="text-green-600">
              {lastResult.succeeded} succeeded
            </span>
            <span className="text-red-600">{lastResult.failed} failed</span>
            <span className="text-gray-500">{lastResult.total} total</span>
          </div>
          <div className="flex flex-col gap-1">
            {lastResult.steps.map((step) => (
              <div
                key={step.stepIndex}
                className={`flex items-center gap-2 rounded px-2 py-1 text-xs ${
                  step.status === 'success' || step.status === 'fallback_success'
                    ? 'bg-green-50 text-green-700'
                    : step.status === 'failed'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-gray-50 text-gray-600'
                }`}
              >
                <span className="font-mono">#{step.stepIndex}</span>
                <span className="font-medium">{step.actionType}</span>
                <span>{step.status}</span>
                {step.detail && (
                  <span className="truncate text-gray-500">{step.detail}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Run History */}
      {runs.length > 0 && selectedWorkflow && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold">
            Run History: {selectedWorkflow.name}
          </h3>
          <div className="flex flex-col gap-1">
            {runs.slice(0, 10).map((run) => (
              <div
                key={run.id}
                className="flex items-center justify-between rounded px-2 py-1 text-xs"
              >
                <span
                  className={`rounded px-2 py-0.5 font-medium ${
                    run.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : run.status === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {run.status}
                </span>
                <span className="text-gray-500">
                  {run.startedAt
                    ? new Date(run.startedAt * 1000).toLocaleString()
                    : 'N/A'}
                </span>
                {run.errorMessage && (
                  <span className="truncate text-red-500">{run.errorMessage}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extension Setup Help */}
      <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
        <p className="font-medium">Setup:</p>
        <ol className="mt-1 list-inside list-decimal">
          <li>
            Install the{' '}
            <a
              href="https://chrome.google.com/webstore/detail/ndolhgjognokndkmkcjgookcogfbgdpg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Knapsack Chrome Extension
            </a>
          </li>
          <li>Open Chrome and navigate to the page where your workflow starts</li>
          <li>Click &quot;Start Recording&quot; and perform your workflow</li>
          <li>Click &quot;Stop Recording&quot; to save and optionally schedule</li>
        </ol>
      </div>
    </div>
  )
}
