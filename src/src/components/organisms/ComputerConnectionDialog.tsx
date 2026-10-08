import { Dialog } from 'src/components/molecules/Dialog'
import StateBackupControl from './StateBackupControl'

export default function ComputerConnectionDialog({ isOpen, onClose, onSignIn }: { isOpen: boolean; onClose: () => void; onSignIn: () => void }) {
  return <Dialog isOpen={isOpen} onClose={onClose} className="w-[calc(100vw-2rem)] max-w-2xl max-h-[85vh] overflow-y-auto bg-white text-zinc-900">
    {isOpen && <StateBackupControl isOpen={isOpen} onSignIn={onSignIn} />}
  </Dialog>
}
