import { executeWorkflow } from 'src/api/browser_workflows'

import BaseStep, { StepExecuteContext, StepExecuteHelpers } from './Base'

export default class BrowserWorkflowStep extends BaseStep {
  private workflowUuid: string

  constructor({ workflowUuid }: { workflowUuid: string }) {
    super({ sources: [], argsJSON: JSON.stringify({ workflowUuid }) })
    this.workflowUuid = workflowUuid
  }

  async execute(context: StepExecuteContext, helpers: StepExecuteHelpers) {
    const { result } = await executeWorkflow(this.workflowUuid)

    const summary = `Browser workflow completed: ${result.succeeded}/${result.total} steps succeeded.`
    const failedSteps = result.steps
      .filter((s) => s.status === 'failed')
      .map((s) => `Step ${s.stepIndex}: ${s.actionType} - ${s.detail || 'unknown error'}`)

    const fullResult =
      failedSteps.length > 0
        ? `${summary}\nFailed steps:\n${failedSteps.join('\n')}`
        : summary

    return super.execute(
      {
        ...context,
        response: fullResult,
        workflowResult: result,
      },
      helpers
    )
  }

  static getName(): string {
    return 'browser_workflow'
  }

  static create(args_json: string | null) {
    const args = JSON.parse(args_json ?? '{}') as { workflowUuid: string }
    return new BrowserWorkflowStep(args)
  }
}
