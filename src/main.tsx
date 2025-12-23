import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/css/style.css'  // 기존 CSS 그대로 사용
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
