import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Profile } from 'src/hooks/auth/useAuth'
import { PRIVACY_POLICY_LINK, TERMS_LINK } from 'src/utils/constants'
import { open } from '@tauri-apps/api/shell'
import { KNLocalStorage } from 'src/utils/KNLocalStorage'
import PrivacySetup from './PrivacySetup'
import FirstFollowUps from './FirstFollowUps'

export const KN_ONBOARDING_URL_PARAM = 'onboarding'
export const KN_LOCAL_STORAGE_KEY_HAS_ONBOARDED = 'kn_has_onboarded'
export const getHasOnboarded = async () => ['0.5.5', '1'].includes(await KNLocalStorage.getItem(KN_LOCAL_STORAGE_KEY_HAS_ONBOARDED) as string)
export const setHasOnboarded = async (value: boolean) => { await KNLocalStorage.setItem(KN_LOCAL_STORAGE_KEY_HAS_ONBOARDED, value ? '1' : '0') }

// Only navigation progress is persisted here. Source text lives in the existing local loop store.
const PROGRESS = 'kn_follow_up_onboarding_v1'
function savedStep(): number {
  try { return localStorage.getItem(PROGRESS) === 'find' ? 2 : localStorage.getItem(PROGRESS) === 'privacy' ? 1 : 0 }
  catch { return 0 }
}
export const Onboarding = (_props: { updateProfile: (profile: Profile) => void }) => {
  const [step, setStep] = useState(savedStep)
  const finishing = useRef(false)
  const navigate = useNavigate()
  useEffect(() => { let active = true; void getHasOnboarded().then(done => { if (active && done) navigate('/home') }); return () => { active = false } }, [navigate])
  const move = (next: number) => {
    try { localStorage.setItem(PROGRESS, next === 2 ? 'find' : next === 1 ? 'privacy' : 'welcome') } catch { /* navigation still works */ }
    setStep(next)
  }
  const finish = async () => {
    if (finishing.current) return
    finishing.current = true
    try { await setHasOnboarded(true); navigate('/home') }
    finally { finishing.current = false }
  }
  return <main className="h-full overflow-auto bg-white text-zinc-900 p-6 sm:p-10">
    <div className="mx-auto max-w-2xl">
      <p className="text-sm text-zinc-500">Knapsack Desktop · {step + 1} of 3</p>
      {step > 0 && <button className="underline my-4" onClick={() => move(step - 1)}>Back</button>}
      {step === 0 && <>
        <h1 className="text-3xl font-semibold mt-8">Find follow-ups I owe</h1>
        <p className="my-6">Start with one set of meeting notes or a conversation. See the evidence, check what is still open, and choose what to track.</p>
        <p className="my-6">You can work locally without a Knapsack account. Account sign-in, permission to read mail or calendars, and your AI model are separate choices. Desktop work stays on this device unless you explicitly enable an available sharing capability.</p>
        <button className="rounded bg-zinc-900 text-white px-6 py-3" onClick={() => move(1)}>Find follow-ups I owe</button>
        <p className="text-sm my-6">By continuing you agree to our <a className="underline" href={TERMS_LINK} target="_blank" rel="noreferrer">Terms of Use</a> and <a className="underline" href={PRIVACY_POLICY_LINK} target="_blank" rel="noreferrer">Privacy Policy</a>.</p>
      </>}
      {step === 1 && <PrivacySetup onNext={() => move(2)} onLearnMore={() => void open(PRIVACY_POLICY_LINK)} />}
      {step === 2 && <FirstFollowUps onFinish={finish} onConfigure={() => { void finish() }} />}
    </div>
  </main>
}
