/**
 * Firebase 설정 및 초기화
 *
 * Firebase Google Sign-in 인증을 위한 설정 파일
 */

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

// Firebase 설정 (원본 프로젝트와 동일)
const firebaseConfig = {
  apiKey: "AIzaSyDA_4iqiPRv0QJQS_vEkTHjqtd7XtF2wZ4",
  authDomain: "hyeok-news-crawler.firebaseapp.com",
  projectId: "hyeok-news-crawler",
  storageBucket: "hyeok-news-crawler.firebasestorage.app",
  messagingSenderId: "792473801664",
  appId: "1:792473801664:web:34c6b9ea4ec7bcff3f2e25"
}

// Firebase 초기화
let app
let auth
let googleProvider

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  googleProvider = new GoogleAuthProvider()

  // 매번 계정 선택 화면 표시
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  })

  console.log('✅ Firebase initialized successfully')
} catch (error) {
  console.error('❌ Firebase initialization failed:', error)
}

export { auth, googleProvider }
export default app
