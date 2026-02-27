import React from 'react'

import { open } from '@tauri-apps/api/shell'

import { UpdateInfo } from 'src/hooks/useAutoUpdater'

import { Dialog } from './molecules/Dialog'

type UpdateDialogProps = {
  update: UpdateInfo
  onDismiss: () => void
}

const UpdateDialog: React.FC<UpdateDialogProps> = ({ update, onDismiss }) => {
  const handleDownload = async () => {
    await open(update.releaseUrl)
    onDismiss()
  }

  return (
    <Dialog isOpen={true} onClose={onDismiss} className="bg-white p-6 w-[420px] shadow-xl">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Update Available</h2>
        <p className="text-sm text-gray-600">
          A new version of Knapsack is available:{' '}
          <span className="font-medium text-gray-900">v{update.version}</span>
        </p>
        {update.releaseNotes && (
          <div className="max-h-40 overflow-y-auto rounded-md bg-gray-50 p-3">
            <p className="text-xs text-gray-500 whitespace-pre-wrap">{update.releaseNotes}</p>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onDismiss}
            className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Later
          </button>
          <button
            onClick={handleDownload}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors"
          >
            Download
          </button>
        </div>
      </div>
    </Dialog>
  )
}

export default UpdateDialog
