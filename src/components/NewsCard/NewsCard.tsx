/**
 * NewsCard 컴포넌트
 *
 * 뉴스 카드를 표시하는 컴포넌트
 * 기존 HTML 구조를 100% 동일하게 유지 (CSS 호환성)
 */

import React from 'react'
import classNames from 'classnames'
import type { NewsCardProps } from './NewsCard.types'
import { CATEGORY_NAMES, SOURCE_LOGOS } from '../../types/news.types'

const NewsCard: React.FC<NewsCardProps> = ({
  newsItem,
  isBookmarked,
  onBookmark,
  onShare
}) => {
  // 이벤트 핸들러
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onBookmark(newsItem)
  }

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onShare(newsItem)
  }

  const handleCardClick = () => {
    window.open(newsItem.url, '_blank')
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const noImageDiv = img.nextElementSibling as HTMLElement
    if (noImageDiv) {
      img.style.display = 'none'
      noImageDiv.style.display = 'flex'
    }
  }

  // 날짜 포맷팅
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}`
  }

  // 카테고리 클래스 가져오기
  const getCategoryClass = (): string => {
    const category = newsItem.category || newsItem.main_category || ''
    const categoryMap: Record<string, string> = {
      '정치': 'politics',
      'politics': 'politics',
      '스포츠': 'sports',
      'sports': 'sports',
      '경제': 'economy',
      'economy': 'economy',
      '사회': 'society',
      'society': 'society',
      '국제': 'international',
      'international': 'international',
      '문화': 'culture',
      'culture': 'culture'
    }
    return categoryMap[category] || 'politics'
  }

  // 신문사 로고 가져오기
  const getSourceLogo = (): string => {
    const source = newsItem.source
    const logoMap: Record<string, string> = {
      '동아일보': '/src/assets/images/donga.png',
      'donga': '/src/assets/images/donga.png',
      '조선일보': '/src/assets/images/chosun.png',
      'chosun': '/src/assets/images/chosun.png',
      '중앙일보': '/src/assets/images/joongang.png',
      'joongang': '/src/assets/images/joongang.png'
    }
    return logoMap[source] || '/src/assets/images/no-image.png'
  }

  return (
    <article className="news-card" data-news-id={newsItem.url}>
      {/* 북마크 버튼 */}
      <button
        className={classNames('bookmark-btn', {
          'bookmarked': isBookmarked
        })}
        onClick={handleBookmarkClick}
        aria-label="북마크"
      >
        <svg
          className="bookmark-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      </button>

      {/* 공유 버튼 */}
      <button
        className="share-btn"
        onClick={handleShareClick}
        aria-label="공유"
      >
        <svg
          className="share-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
      </button>

      {/* 이미지 영역 */}
      <div className="news-card-image-wrapper" onClick={handleCardClick}>
        <img
          src={newsItem.image_url || '/src/assets/images/no-image.png'}
          alt={newsItem.title}
          className="news-card-image"
          onError={handleImageError}
          loading="lazy"
        />
        <div className="news-card-no-image" style={{ display: 'none' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span>이미지 준비중</span>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="news-card-content" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
        <div className="news-card-header">
          <span className={`news-card-category ${getCategoryClass()}`}>
            {newsItem.category || newsItem.main_category}
          </span>
          <span className="news-card-date">
            {formatDate(newsItem.date)}
          </span>
        </div>
        <h3 className="news-card-title">{newsItem.title}</h3>
        <div className="news-card-source">
          <img src={getSourceLogo()} alt={newsItem.source} />
          <span>{newsItem.source}</span>
        </div>
      </div>
    </article>
  )
}

// React.memo로 감싸서 불필요한 리렌더링 방지
export default React.memo(NewsCard)
