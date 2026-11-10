// Production banner and modal, with inert update callbacks. No updater IPC.
import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { UpdateBannerContent } from 'src/components/molecules/UpdateBanner'
import { Dialog } from 'src/components/molecules/Dialog'
import styles from 'src/components/templates/Home/components/SettingsDialog/styles.module.scss'
import 'src/main.css'
function Fixture() {
  const [open, setOpen] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [clicks, setClicks] = useState(0)
  return <>
    <UpdateBannerContent updateState={installing ? {status: 'downloading'} : {status: 'available', version: '0.0.0-synthetic'}} autoInstallEnabled={false} countdownRemainingSec={null} dismissed={false} dismiss={() => {}} restartApp={async () => {setClicks(v=>v+1);setInstalling(true)}} />
    <button onClick={() => setOpen(true)}>Open synthetic Settings</button>
    <output>Synthetic installs: {clicks}</output>
    <Dialog isOpen={open} onClose={() => setOpen(false)} className={styles.fullScreenSettings}>
      <div className={styles.settingsBody}><header className={styles.settingsHeader}><h1>Synthetic Settings</h1></header><p>Closing Settings never cancels a native update.</p></div>
    </Dialog>
  </>
}
createRoot(document.getElementById('root')!).render(<Fixture />)
