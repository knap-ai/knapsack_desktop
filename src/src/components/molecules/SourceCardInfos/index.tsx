import { FeedItem } from 'src/api/feed_items'
import { IThread } from 'src/api/threads'

interface SourceCardInfosProps {
  feedItem?: FeedItem
  thread?: IThread
  description: string
  key: string
}

export function SourceCardInfos({ key, description }: SourceCardInfosProps) {
  return (
    <div key={key}>
      {' '}
      <p className="py-2 text-left font-light">{description}</p>
    </div>
  )
}
