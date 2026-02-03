export enum KNSearchFilterType {
  ALL = 'All',
  FILES = 'FILES',
  WEB = 'WEB',
  ARXIV = 'ARXIV',
  GIT = 'GIT',
  DRIVE = 'DRIVE',
  GMAIL = 'GMAIL',
  GITHUB = 'GITHUB',
  SLACK = 'SLACK',
  ADD_CONNECTOR = 'ADD_CONNECTOR',
}
export enum KNFileType {
  WEB = 'web',
  EMAIL = 'emails',
  CALENDAR = 'calendar_events',
  DRIVE_FILE = 'drive_documents',
  LOCAL_FILE = 'local_files',
}

export var SEARCH_FILTER_IMAGE_ASSETS_DIR = '/assets/images/searchFilters'

export class KNSearchFilterItem {
  icon_url: string
  name: string
  placeholder: string = ''
  type: KNSearchFilterType

  constructor(
    name: string,
    type: KNSearchFilterType,
    icon_filename: string,
    placeholder: string = '',
  ) {
    this.name = name
    this.icon_url = SEARCH_FILTER_IMAGE_ASSETS_DIR + '/' + icon_filename
    this.type = type
    this.placeholder = placeholder
  }
}

export var ALL_SEARCH_FILTER_ITEM = new KNSearchFilterItem(
  'All',
  KNSearchFilterType.ALL,
  'all.svg',
  'Ask about your data...',
)
export var FILE_SEARCH_FILTER_ITEM = new KNSearchFilterItem(
  'Local Files',
  KNSearchFilterType.FILES,
  'files.png',
  'Ask about your data...',
)
export var WEB_SEARCH_FILTER_ITEM = new KNSearchFilterItem(
  'Web',
  KNSearchFilterType.WEB,
  'web.svg',
  'Ask the web...',
)
export var ARXIV_SEARCH_FILTER_ITEM = new KNSearchFilterItem(
  'arXiv',
  KNSearchFilterType.ARXIV,
  'arxiv.png',
  'Search papers on arXiv...',
)
export var GIT_SEARCH_FILTER_ITEM = new KNSearchFilterItem(
  'git',
  KNSearchFilterType.GIT,
  'git.png',
  'Search through Git versioned files...',
)
export var GMAIL_SEARCH_FILTER_ITEM = new KNSearchFilterItem(
  'Gmail',
  KNSearchFilterType.GMAIL,
  'gmail.png',
  'Search messages on Gmail...',
)
export var GITHUB_SEARCH_FILTER_ITEM = new KNSearchFilterItem(
  'GitHub',
  KNSearchFilterType.GITHUB,
  'github-mark.svg',
  'Ask about your code base...',
)
export var SLACK_SEARCH_FILTER_ITEM = new KNSearchFilterItem(
  'Slack',
  KNSearchFilterType.SLACK,
  'slack.png',
  'Ask anything about your Slack conversations...',
)
export var ADD_CONNECTOR_SEARCH_FILTER_ITEM = new KNSearchFilterItem(
  'Add Connector',
  KNSearchFilterType.ADD_CONNECTOR,
  'addconnector.png',
  '',
)

export var SEARCH_FILTER_ITEMS: Record<string, KNSearchFilterItem> = {
  [KNSearchFilterType.ALL]: ALL_SEARCH_FILTER_ITEM,
  [KNSearchFilterType.FILES]: FILE_SEARCH_FILTER_ITEM,
  [KNSearchFilterType.WEB]: WEB_SEARCH_FILTER_ITEM,
  [KNSearchFilterType.GITHUB]: GITHUB_SEARCH_FILTER_ITEM,
  [KNSearchFilterType.SLACK]: SLACK_SEARCH_FILTER_ITEM,
  // TODO: Re-enable for Calendar + Gmail sync
  // [KNSearchFilterType.GMAIL]: GMAIL_SEARCH_FILTER_ITEM,
}

export function getSearchFilterPlaceholder(type: KNSearchFilterType | null): string {
  if (type === null) {
    return ''
  }
  return SEARCH_FILTER_ITEMS[type]?.placeholder
}
