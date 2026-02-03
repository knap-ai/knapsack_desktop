import { AutomationDataSources } from '../automation'
import BaseStep, { StepExecuteContext, StepExecuteHelpers } from './Base'

export default class SemanticSearch extends BaseStep {
  private userPrompt: string

  constructor({
    sources,
    userPrompt,
    useLocal,
    descriptionOtherCadence,
  }: {
    sources: AutomationDataSources[]
    userPrompt: string
    useLocal?: boolean
    descriptionOtherCadence?: string
  }) {
    super({
      sources,
      argsJSON: JSON.stringify({ sources, userPrompt, useLocal, descriptionOtherCadence }),
    })
    this.userPrompt = userPrompt
  }

  async execute(context: StepExecuteContext, helpers: StepExecuteHelpers) {
    const sourceDocuments = await helpers.dataFetcher.semanticSearch(
      this.userPrompt,
      [],
      this.sources,
      10
    )

    // TODO: I really don't like having the web data source specially treated here...
    // We should generalize.
    let webResponse = undefined
    if (this.sources.includes(AutomationDataSources.WEB)) {
      webResponse = await helpers.submitWebSearch(this.userPrompt)
    }

    return super.execute(
      {
        ...context,
        semanticSearchResults: sourceDocuments,
        webResponse: webResponse,
      },
      helpers,
    )
  }

  static getName(): string {
    return 'semantic-search'
  }

  getPrompt(): string {
    return this.userPrompt
  }

  static create(args_json: string | null) {
    const args = JSON.parse(args_json ?? '{}') as ConstructorParameters<typeof SemanticSearch>[0]
    return new SemanticSearch(args)
  }
}
