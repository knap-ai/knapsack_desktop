import { open } from '@tauri-apps/api/shell'
import { Dialog } from 'src/components/molecules/Dialog'
import { Button } from 'src/components/atoms/button'

interface AutomationLabModalProps {
  isOpen: boolean
  onClose: () => void
}

const AutomationLabModal = ({ isOpen, onClose }: AutomationLabModalProps) => {
  const openCalendlyLink = () => {
    open('https://calendly.com/mark-knap/automation-lab?month=2025-04')
    onClose()
  }

  return (
    <Dialog
      onClose={onClose}
      isOpen={isOpen}
      dismissable={true}
      className="flex items-center justify-center"
    >
      <div className="bg-white py-8 px-10 rounded-lg font-Lora text-center content-center max-w-xl">
        <h2 className="text-2xl font-semibold text-black mb-4">AI has never been this bespoke.</h2>

        <div className="text-base font-Inter text-gray-700 mb-6">
          Knapsack Studio, our latest innovation, is arriving soon! Anyone will be able to automate their workflows, simply and safely.
        </div>
        <div className="text-base font-Inter text-gray-700 mb-6">
            Ahead of Studio's release, we're offering white-glove Automation Labs to help companies solve their <span className="font-bold">trickiest workflow challenges</span>.
        </div>

        <div className="font-Inter text-black text-sm font-medium mb-8">
          <div className="mb-4">
            <span className="font-semibold">What to expect:</span>
            <ul className="list-disc text-left pl-8 mt-2 space-y-1">
              <li>45-minute Automation Lab with the Knapsack team</li>
              <li>Discussion of your workflow challenges</li>
              <li>Live automation building to address these challenges</li>
              <li>Custom implementation planning</li>
            </ul>
          </div>
        </div>

        <Button
          label="Book your Automation Lab"
          className="bg-ks-red-600 hover:bg-ks-red-700 font-Inter text-base text-white py-3 px-6 rounded-lg transition-colors font-medium"
          onClick={openCalendlyLink}
        />
      </div>
    </Dialog>
  )
}

export default AutomationLabModal
