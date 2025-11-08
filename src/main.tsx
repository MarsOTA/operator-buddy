import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register Service Worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Nuova versione disponibile! Vuoi aggiornare?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App pronta per funzionare offline')
  },
})

createRoot(document.getElementById("root")!).render(<App />);
