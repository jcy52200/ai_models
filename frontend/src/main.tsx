import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AccessGuard from './components/AccessGuard.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AccessGuard>
      <App />
    </AccessGuard>
  </StrictMode>,
)
