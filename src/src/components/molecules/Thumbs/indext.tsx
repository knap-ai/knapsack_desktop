import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt'
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt'
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt'
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt'

export interface IThumbsProp {
  selected: number
  handleVote: (vote: 1 | -1) => void
  className?: string
}

const Thumbs = ({ selected, handleVote, className }: IThumbsProp) => {
  return (
    <>
      {(selected == 0 || selected == -1) && (
        <ThumbUpOffAltIcon
          className={className}
          sx={{ fontSize: 16 }}
          onClick={() => handleVote(1)} />
      )}

      {selected == 1 && (
        <ThumbUpAltIcon
          className={className}
          sx={{ fontSize: 16 }}
          onClick={() => handleVote(1)} />
      )}
      {(selected == 0 || selected == 1) && (
        <ThumbDownOffAltIcon
          className={className}
          sx={{ fontSize: 16 }}
          onClick={() => handleVote(-1)} />
      )}

      {selected == -1 && <ThumbDownAltIcon className={className} onClick={() => handleVote(-1)} />}
    </>
  )
}
export default Thumbs
