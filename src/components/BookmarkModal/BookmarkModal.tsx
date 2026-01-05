/**
 * BookmarkModal 컴포넌트
 *
 * 저장된 북마크를 표시하고 관리하는 모달
 */

import React, { useEffect } from 'react'
import type { BookmarkModalProps } from './BookmarkModal.types'

const BookmarkModal: React.FC<BookmarkModalProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onRemoveBookmark
}) => {
  // 모달이 열릴 때 body 스크롤 막기
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  // 모달이 열려있지 않으면 렌더링하지 않음
  if (!isOpen) return null

  // 날짜 포맷팅
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  // 북마크 제거 핸들러
  const handleRemove = (e: React.MouseEvent, bookmarkId: string) => {
    e.stopPropagation()
    onRemoveBookmark(bookmarkId)
  }

  return (
    <div id="bookmark-modal" className="bookmark-modal active">
      <div className="bookmark-modal-content">
        {/* 모달 헤더 */}
        <div className="bookmark-modal-header">
          <h2>📚 내 북마크</h2>
          <button
            id="close-bookmark-modal"
            className="close-modal-btn"
            onClick={onClose}
            aria-label="닫기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* 모달 바디 */}
        <div className="bookmark-modal-body">
          {/* Empty State */}
          {bookmarks.length === 0 ? (
            <div id="bookmark-empty-state" className="bookmark-empty-state">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              <h3>저장된 북마크가 없습니다</h3>
              <p>관심있는 기사의 별 아이콘을 클릭해보세요</p>
            </div>
          ) : (
            /* 북마크 그리드 */
            <div id="bookmark-grid" className="bookmark-grid">
              {bookmarks.map(bookmark => (
                <article
                  key={bookmark.id}
                  className="news-card"
                  data-news-id={bookmark.id}
                >
                  {/* 북마크 제거 버튼 */}
                  <button
                    className="bookmark-btn bookmarked"
                    onClick={(e) => handleRemove(e, bookmark.id)}
                    aria-label="북마크 제거"
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
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </button>

                  {/* 이미지 */}
                  <div
                    className="news-card-image-wrapper"
                    onClick={() => window.open(bookmark.url, '_blank')}
                  >
                    {bookmark.image ? (
                      <img
                        src={bookmark.image}
                        alt={bookmark.title}
                        className="news-card-image"
                        loading="lazy"
                      />
                    ) : (
                      <div className="news-card-image-placeholder">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <span>이미지 준비중</span>
                      </div>
                    )}
                  </div>

                  {/* 콘텐츠 */}
                  <div
                    className="news-card-content"
                    onClick={() => window.open(bookmark.url, '_blank')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="news-card-header">
                      <span className={`news-card-category ${bookmark.category}`}>
                        {bookmark.category}
                      </span>
                      <span className="news-card-date">
                        작성일: {formatDate(bookmark.date)}
                      </span>
                    </div>
                    <h3 className="news-card-title">{bookmark.title}</h3>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default React.memo(BookmarkModal)
