import { Button, ButtonSize, ButtonVariant } from 'src/components/atoms/button'

interface ExecutableCardProps<T = any> {
  id: string
  title: string
  description: string
  highlightedText: string
  buttonLabel: string
  iconUrl?: string
  onClick: (params: T | undefined) => void
  onClickParams?: T
}

export default function ExecutableCard<T>({
  id,
  title,
  description,
  buttonLabel,
  onClick,
  onClickParams,
  highlightedText,
  iconUrl,
}: ExecutableCardProps<T>) {
  return (
    <div
      key={id}
      className={`w-60 h-[174px] p-4 bg-white rounded-lg shadow-[inset_0px_0px_1px_0px_rgba(0,0,0,0.45)] transition-shadow duration-200 ease-in-out hover:shadow-[0px_6px_12px_0px_rgba(0,0,0,0.12),0px_0px_4px_0px_rgba(0,0,0,0.25)] flex-row inline-flex`}
    >
      <div className="h-full w-full flex-col justify-start items-start gap-2 inline-flex">
        <div className="flex flex-row self-stretch justify-start items-start gap-2">
          <div className="w-8 h-8 content-center items-center">
            <img src={iconUrl} alt={title} className="object-contain" />
          </div>
          <div className="flex flex-1"></div>
          <div className="text-blue-500 text-xs font-bold font-RobotoMono leading-none tracking-wide pt-1">
            {highlightedText}
          </div>
        </div>
        <div className="flex flex-col justify-start items-start gap-0.5">
          <div className="text-zinc-700 text-base font-medium font-['Inter'] leading-7">
            {title}
          </div>
          <div className="grow shrink basis-0 text-zinc-700 text-xs font-medium font-['Inter Tight'] leading-4">
            {description}
          </div>
        </div>
        <div className="flex flex-1"></div>
        <div className="flex-row self-stretch justify-start items-start gap-2 flex">
          <div className="text-zinc-400 text-xs font-medium font-['Inter Tight'] mt-auto leading-none">
            Runs on demand
          </div>
          <div className="flex flex-grow"></div>
          <Button
            label={buttonLabel}
            size={ButtonSize.pill}
            variant={ButtonVariant.runNow}
            className="m-0"
            onClick={() => onClick(onClickParams)}
          />
        </div>
      </div>
      <div className="h-full flex-col"></div>
    </div>
  )
}
