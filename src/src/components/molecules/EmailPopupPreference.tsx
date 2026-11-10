import { useEmailPopupPreference } from 'src/hooks/useEmailPopupPreference'

export default function EmailPopupPreference() {
  const preference = useEmailPopupPreference()
  return (
    <div className="rounded-lg border border-ks-warm-grey-200 p-3 text-sm">
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={preference.enabled}
          disabled={!preference.ready || preference.busy}
          onChange={event => void preference.setEnabled(event.target.checked)}
        />
        <span>
          Show Email Autopilot popups
          <span className="block text-xs text-ks-warm-grey-600 mt-1">
            Off by default. Allow automatic email suggestions for this account on this device. You
            can still open Email Autopilot yourself.
          </span>
        </span>
      </label>
      {preference.error && <p role="alert">{preference.error}</p>}
    </div>
  )
}
