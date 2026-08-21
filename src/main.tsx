import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { iniciarServiceWorkerPwa } from './lib/firebase'
import { desbloquearAudioTrasGesto } from './lib/notificationSound'

iniciarServiceWorkerPwa()
desbloquearAudioTrasGesto()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
