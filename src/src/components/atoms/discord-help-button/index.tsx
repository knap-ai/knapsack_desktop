import { DISCORD_LINK } from 'src/utils/constants'
import icon from '/assets/images/Discord_Icon.svg'

export interface IDiscordHelpButtonProps {
}

const DiscordHelpButton = ({
}: IDiscordHelpButtonProps) => {
  return (
    <a className="" href={DISCORD_LINK} target="_blank">
      <div className="justify-center items-center inline-flex">
        <div className="bg-white rounded-[100px] TightShadow p-1">
          <img className="w-5 h-5" alt="Get help on Discord" src={icon} />
        </div>
        <div className="text-subtext pl-2">Help</div>
      </div>
    </a>
  )
}

export { DiscordHelpButton }
