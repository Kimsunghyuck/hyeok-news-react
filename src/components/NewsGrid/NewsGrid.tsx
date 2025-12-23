/**
 * NewsGrid 컴포넌트
 *
 * 뉴스 카드들을 그리드 형태로 표시
 */

import React from 'react'
import NewsCard from '../NewsCard'
import type { NewsGridProps } from './NewsGrid.types'

const NewsGrid: React.FC<NewsGridProps> = ({
  newsItems,
  bookmarkedIds,
  onBookmark,
  onShare
}) => {
  // 뉴스 ID 생성 (북마크 체크용)
  const generateNewsId = (url: string): string => {
    let hash = 0
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return 'news_' + Math.abs(hash).toString(36)
  }

  return (
    <div id="news-grid" className="news-grid">
      {newsItems.map((item) => {
        const newsId = generateNewsId(item.url)
        const isBookmarked = bookmarkedIds.includes(newsId)

        return (
          <NewsCard
            key={item.url}
            newsItem={item}
            isBookmarked={isBookmarked}
            onBookmark={onBookmark}
            onShare={onShare}
          />
        )
      })}
    </div>
  )
}

export default React.memo(NewsGrid)
