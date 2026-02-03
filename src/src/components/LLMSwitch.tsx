import { styled } from '@mui/material/styles'
import Switch from '@mui/material/Switch'

interface LLMToggleProps {
  useLocalLLM: boolean
  setUseLocalLLM: (useLocalLLM: boolean) => void
}

const LLMToggle = styled(Switch)(() => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      '& .MuiSwitch-thumb': {
        backgroundColor: '#2058e2',
      },
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: 'url("/assets/images/ui/llm-toggle-remote.svg")',
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#aab4be',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#20e852',
    width: 32,
    height: 32,
    '&::before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: 'url("/assets/images/ui/llm-toggle-local.svg")',
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: '#aab4be',
    borderRadius: 20 / 2,
  },
}))

export default function LLMSwitch({ useLocalLLM, setUseLocalLLM }: LLMToggleProps) {
  return (
    <div data-tauri-drag-region className="p-1 text-right select-none">
      {useLocalLLM && <span className="">Laptop</span>}
      {!useLocalLLM && <span className="">Fast</span>}
      <LLMToggle checked={!useLocalLLM} onChange={() => setUseLocalLLM(!useLocalLLM)} />
    </div>
  )
}
