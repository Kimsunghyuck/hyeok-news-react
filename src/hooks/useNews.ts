/**
 * useNews Hook
 *
 * 뉴스 데이터 로딩을 관리하는 Custom Hook
 * 카테고리, 신문사, 날짜에 따라 뉴스를 자동으로 로드합니다.
 */

import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import type { NewsItem, CategoryId, SourceId } from '../types/news.types'
import type { Database } from '../types/supabase.types'

/**
 * useNews Hook의 반환 타입
 */
interface UseNewsReturn {
  news: NewsItem[]          // 로드된 뉴스 목록
  loading: boolean          // 로딩 상태
  error: Error | null       // 에러 객체
  reload: () => void        // 수동 새로고침 함수
}

/**
 * 뉴스 데이터를 로드하는 Hook
 *
 * @param category - 카테고리 ID (politics, sports, economy 등)
 * @param source - 신문사 ID (donga, chosun, joongang)
 * @param date - 날짜 (YYYY-MM-DD 형식)
 * @returns 뉴스 목록, 로딩 상태, 에러, 새로고침 함수
 *
 * @example
 * ```typescript
 * const { news, loading, error } = useNews('politics', 'donga', '2025-12-22')
 *
 * if (loading) return <div>로딩 중...</div>
 * if (error) return <div>에러: {error.message}</div>
 * return <NewsGrid newsItems={news} />
 * ```
 */
export function useNews(
  category: CategoryId,
  source: SourceId,
  date: string
): UseNewsReturn {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // 뉴스 로드 함수
  const loadNews = async () => {
    setLoading(true)
    setError(null)

    try {
      // Supabase에서 데이터 가져오기
      // category_en과 source_en 필드를 사용 (영어 값 저장됨)
      const { data, error: supabaseError } = await supabase
        .from('news')
        .select('*')
        .eq('category_en', category)
        .eq('source_en', source)
        .eq('date', date)
        .order('scraped_at', { ascending: false })

      if (supabaseError) {
        throw supabaseError
      }

      // NewsItem 타입으로 변환
      type NewsRow = Database['public']['Tables']['news']['Row']
      const newsItems: NewsItem[] = ((data || []) as NewsRow[]).map(item => ({
        title: item.title,
        url: item.url,
        date: item.date,
        category: item.category,
        category_en: item.category_en || undefined,
        source: item.source,
        source_en: item.source_en || undefined,
        image_url: item.image_url || undefined,
        scraped_at: item.scraped_at
      }))

      setNews(newsItems)
      console.log(`✅ 뉴스 로드 성공: ${newsItems.length}개`)
    } catch (err) {
      setError(err as Error)
      console.error('❌ 뉴스 로드 실패:', err)
      setNews([])
    } finally {
      setLoading(false)
    }
  }

  // category, source, date가 변경되면 자동으로 뉴스 재로드
  useEffect(() => {
    loadNews()
  }, [category, source, date])

  return {
    news,
    loading,
    error,
    reload: loadNews  // 수동 새로고침용
  }
}
