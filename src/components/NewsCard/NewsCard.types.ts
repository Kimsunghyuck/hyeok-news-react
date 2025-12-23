/**
 * NewsCard 컴포넌트 Props 타입 정의
 */

import type { NewsItem } from '../../types/news.types'

export interface NewsCardProps {
  newsItem: NewsItem              // 뉴스 데이터
  isBookmarked: boolean           // 북마크 여부
  onBookmark: (item: NewsItem) => void    // 북마크 토글 핸들러
  onShare: (item: NewsItem) => void       // 공유 핸들러
}
