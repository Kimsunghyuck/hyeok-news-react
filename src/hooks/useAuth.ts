/**
 * useAuth Hook
 *
 * Firebase 인증 상태 관리를 위한 Custom Hook
 */

import { useState, useEffect } from 'react'
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'

interface UseAuthReturn {
  user: User | null
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

/**
 * Firebase 인증 상태를 관리하는 Hook
 *
 * @returns 사용자 정보, 로딩 상태, 에러, 로그인/로그아웃 함수
 *
 * @example
 * ```tsx
 * const { user, loading, signInWithGoogle, signOut } = useAuth()
 *
 * if (loading) return <div>로딩 중...</div>
 * if (!user) return <button onClick={signInWithGoogle}>로그인</button>
 * return <button onClick={signOut}>로그아웃</button>
 * ```
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 인증 상태 관찰
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)

      if (currentUser) {
        console.log('👤 User is signed in:', currentUser.email)
        console.log('   Display name:', currentUser.displayName)
      } else {
        console.log('👤 User is signed out')
      }
    })

    // 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe()
  }, [])

  // Google 로그인
  const signInWithGoogle = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      console.log('✅ User signed in:', user.email)
      console.log('   Display name:', user.displayName)
      console.log('   User ID:', user.uid)

    } catch (err: any) {
      console.error('❌ Google sign-in error:', err)
      console.error('Error code:', err.code)
      console.error('Error message:', err.message)

      let errorMessage = 'Google 로그인에 실패했습니다.'

      // 에러 코드별 메시지
      switch (err.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = '로그인 창이 닫혔습니다. 다시 시도해주세요.'
          break
        case 'auth/popup-blocked':
          errorMessage = '팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.'
          break
        case 'auth/cancelled-popup-request':
          // 사용자가 여러 번 클릭한 경우 - 에러 표시 안 함
          setLoading(false)
          return
        case 'auth/unauthorized-domain':
          errorMessage = 'Firebase 콘솔에서 현재 도메인을 승인된 도메인에 추가해주세요.'
          break
        case 'auth/operation-not-allowed':
          errorMessage = 'Firebase 콘솔에서 Google 로그인을 활성화해주세요.'
          break
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // 로그아웃
  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      console.log('✅ User signed out successfully')
    } catch (err) {
      console.error('❌ Sign out error:', err)
      setError('로그아웃에 실패했습니다. 다시 시도해주세요.')
    }
  }

  // 에러 초기화
  const clearError = () => {
    setError(null)
  }

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
    clearError
  }
}
