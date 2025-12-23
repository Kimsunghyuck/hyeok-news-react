/**
 * useTheme Hook
 *
 * 다크모드/라이트모드를 관리하는 Custom Hook
 * localStorage를 사용하여 사용자 선호도를 영구 저장합니다.
 */

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'hyeok-news-theme'

/**
 * 테마 타입
 */
export type Theme = 'light' | 'dark'

/**
 * useTheme Hook의 반환 타입
 */
interface UseThemeReturn {
  theme: Theme                    // 현재 테마
  isDarkMode: boolean             // 다크모드 여부
  toggleTheme: () => void         // 테마 토글
  setTheme: (theme: Theme) => void  // 테마 직접 설정
}

/**
 * 테마(다크모드)를 관리하는 Hook
 *
 * @returns 현재 테마, 테마 관리 함수들
 *
 * @example
 * ```typescript
 * const { isDarkMode, toggleTheme } = useTheme()
 *
 * return (
 *   <button onClick={toggleTheme}>
 *     {isDarkMode ? '🌙 다크모드' : '☀️ 라이트모드'}
 *   </button>
 * )
 * ```
 */
export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>('light')

  // 초기 로드: localStorage 또는 시스템 설정에서 테마 불러오기
  useEffect(() => {
    loadTheme()
  }, [])

  // 테마 로드
  const loadTheme = () => {
    try {
      // 1. localStorage에 저장된 테마 확인
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
      if (saved === 'dark' || saved === 'light') {
        applyTheme(saved)
        return
      }

      // 2. 시스템 다크모드 설정 확인
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      applyTheme(prefersDark ? 'dark' : 'light')

    } catch (error) {
      console.error('테마 로드 실패:', error)
      applyTheme('light')  // 기본값: 라이트모드
    }
  }

  // 테마 적용
  const applyTheme = (newTheme: Theme) => {
    setThemeState(newTheme)

    // HTML 요소에 data-theme 속성 설정 (원본 CSS와 동일한 방식)
    document.documentElement.setAttribute('data-theme', newTheme)

    // localStorage에 저장
    try {
      localStorage.setItem(STORAGE_KEY, newTheme)
    } catch (error) {
      console.error('테마 저장 실패:', error)
    }
  }

  // 테마 토글 (라이트 ↔ 다크)
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    applyTheme(newTheme)
  }, [theme])

  // 테마 직접 설정
  const setTheme = useCallback((newTheme: Theme) => {
    applyTheme(newTheme)
  }, [])

  return {
    theme,
    isDarkMode: theme === 'dark',
    toggleTheme,
    setTheme
  }
}
