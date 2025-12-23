/**
 * NewsGrid 컴포넌트 Props 타입 정의
 */

import type { NewsItem } from '../../types/news.types'

export interface NewsGridProps {
  newsItems: NewsItem[]                       // 표시할 뉴스 목록
  bookmarkedIds: string[]                     // 북마크된 뉴스 ID 목록
  onBookmark: (item: NewsItem) => void        // 북마크 핸들러
  onShare: (item: NewsItem) => void           // 공유 핸들러
}
