import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'swiper/swiper-bundle.css'  // Swiper 전체 CSS (모든 모듈 포함)
import './assets/css/style.css'  // 기존 CSS 그대로 사용
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
