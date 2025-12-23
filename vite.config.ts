import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()]
  // Firebase 팝업 로그인을 위해 COOP/COEP 헤더 제거
  // 프로덕션에서 필요하다면 nginx/서버 레벨에서 설정
})
