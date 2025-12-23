/**
 * useBookmarks Hook
 *
 * 북마크 관리를 위한 Custom Hook
 * localStorage를 사용하여 북마크를 영구 저장합니다.
 */

import { useState, useEffect, useCallback } from 'react'
import type { Bookmark } from '../types/bookmark.types'
import type { NewsItem } from '../types/news.types'

const STORAGE_KEY = 'hyeok-news-bookmarks'

/**
 * useBookmarks Hook의 반환 타입
 */
interface UseBookmarksReturn {
  bookmarks: Bookmark[]                           // 북마크 목록
  bookmarkedIds: string[]                         // 북마크된 뉴스 ID 목록
  toggleBookmark: (newsItem: NewsItem) => void    // 북마크 토글
  removeBookmark: (bookmarkId: string) => void    // 북마크 제거
  clearAllBookmarks: () => void                   // 모든 북마크 제거
  isBookmarked: (newsId: string) => boolean       // 북마크 여부 확인
}

/**
 * 북마크를 관리하는 Hook
 *
 * @returns 북마크 목록, 북마크 관리 함수들
 *
 * @example
 * ```typescript
 * const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks()
 *
 * // 북마크 토글
 * <button onClick={() => toggleBookmark(newsItem)}>
 *   {isBookmarked(newsId) ? '★' : '☆'}
 * </button>
 *
 * // 북마크 목록 표시
 * {bookmarks.map(bookmark => <NewsCard key={bookmark.id} newsItem={bookmark} />)}
 * ```
 */
export function useBookmarks(): UseBookmarksReturn {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([])

  // 초기 로드: localStorage에서 북마크 불러오기
  useEffect(() => {
    loadBookmarks()
  }, [])

  // localStorage에서 북마크 로드
  const loadBookmarks = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed: Bookmark[] = JSON.parse(saved)
        setBookmarks(parsed)
        setBookmarkedIds(parsed.map(b => b.id))
      }
    } catch (error) {
      console.error('북마크 로드 실패:', error)
      setBookmarks([])
      setBookmarkedIds([])
    }
  }

  // localStorage에 북마크 저장
  const saveBookmarks = (newBookmarks: Bookmark[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks))
      setBookmarks(newBookmarks)
      setBookmarkedIds(newBookmarks.map(b => b.id))
    } catch (error) {
      console.error('북마크 저장 실패:', error)
    }
  }

  // 뉴스 ID 생성 (URL 기반 해시)
  const generateNewsId = (url: string): string => {
    let hash = 0
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return 'news_' + Math.abs(hash).toString(36)
  }

  // 북마크 토글 (추가/제거)
  const toggleBookmark = useCallback((newsItem: NewsItem) => {
    const newsId = generateNewsId(newsItem.url)

    setBookmarks(prevBookmarks => {
      // 이미 북마크되어 있으면 제거
      if (prevBookmarks.some(b => b.id === newsId)) {
        const newBookmarks = prevBookmarks.filter(b => b.id !== newsId)
        saveBookmarks(newBookmarks)
        return newBookmarks
      }

      // 북마크 추가
      const newBookmark: Bookmark = {
        id: newsId,
        title: newsItem.title,
        url: newsItem.url,
        image: newsItem.image_url || '',
        category: newsItem.category,
        source: newsItem.source,
        date: newsItem.date,
        bookmarkedAt: Date.now()
      }

      const newBookmarks = [newBookmark, ...prevBookmarks]
      saveBookmarks(newBookmarks)
      return newBookmarks
    })
  }, [])

  // 특정 북마크 제거
  const removeBookmark = useCallback((bookmarkId: string) => {
    const newBookmarks = bookmarks.filter(b => b.id !== bookmarkId)
    saveBookmarks(newBookmarks)
  }, [bookmarks])

  // 모든 북마크 제거
  const clearAllBookmarks = useCallback(() => {
    saveBookmarks([])
  }, [])

  // 북마크 여부 확인
  const isBookmarked = useCallback((newsId: string): boolean => {
    return bookmarkedIds.includes(newsId)
  }, [bookmarkedIds])

  return {
    bookmarks,
    bookmarkedIds,
    toggleBookmark,
    removeBookmark,
    clearAllBookmarks,
    isBookmarked
  }
}
