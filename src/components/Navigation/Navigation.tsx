/**
 * Navigation 컴포넌트
 *
 * 상단 네비게이션 바
 * 로고, 카테고리 메뉴, 북마크, 다크모드 토글 포함
 */

import React, { useState, useRef } from 'react'
import classNames from 'classnames'
import type { NavigationProps } from './Navigation.types'
import { CATEGORY_NAMES } from '../../types/news.types'
import type { CategoryId } from '../../types/news.types'

const Navigation: React.FC<NavigationProps> = ({
  activeCategory,
  bookmarkCount,
  onLogoClick,
  onCategoryClick,
  onSourceSelect,
  onBookmarkClick,
  onThemeToggle,
  onLogout
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<CategoryId | null>(null)
  const hoverTimeoutRef = useRef<number | null>(null)
  // 카테고리 목록
  const categories: { id: CategoryId; name: string }[] = [
    { id: 'politics', name: CATEGORY_NAMES.politics },
    { id: 'economy', name: CATEGORY_NAMES.economy },
    { id: 'society', name: CATEGORY_NAMES.society },
    { id: 'international', name: CATEGORY_NAMES.international },
    { id: 'culture', name: CATEGORY_NAMES.culture },
    { id: 'sports', name: CATEGORY_NAMES.sports }
  ]

  return (
    <nav className="main-navigation">
      <div className="container">
        <div className="nav-content">
          {/* Logo */}
          <a
            href="/"
            className="site-logo"
            onClick={(e) => {
              e.preventDefault()
              onLogoClick()
            }}
          >
            <img src="/src/assets/images/logo.png" alt="Hyeok Crawler Logo" />
            <span className="logo-text">Hyeok Crawler</span>
          </a>

          {/* Categories */}
          <ul className="categories">
            {categories.map((category) => (
              <li
                key={category.id}
                className={classNames('category-item', {
                  'active': activeCategory === category.id
                })}
                data-category={category.id}
                onClick={() => onCategoryClick(category.id)}
                onMouseEnter={() => {
                  // 이전 timeout 취소
                  if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current)
                  }
                  // 150ms 지연 후 hoveredCategory 변경
                  hoverTimeoutRef.current = window.setTimeout(() => {
                    setHoveredCategory(category.id)
                  }, 150)
                }}
                onMouseLeave={() => {
                  // 빠르게 지나가는 경우 timeout 취소
                  if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current)
                  }
                }}
              >
                <span className="category-title">{category.name}</span>
              </li>
            ))}
          </ul>

          {/* Action Buttons */}
          <div className="nav-actions">
            {/* 북마크 버튼 */}
            <button
              id="bookmark-page-btn"
              className="bookmark-page-btn"
              aria-label="내 북마크"
              onClick={onBookmarkClick}
            >
              <svg
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
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              {bookmarkCount > 0 && (
                <span className="bookmark-count">{bookmarkCount}</span>
              )}
            </button>

            {/* 다크모드 토글 버튼 */}
            <button
              id="theme-toggle"
              className="theme-toggle"
              aria-label="다크모드 전환"
              onClick={onThemeToggle}
            >
              <svg
                className="sun-icon"
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
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
              <svg
                className="moon-icon"
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
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </button>

            {/* 로그아웃 버튼 */}
            {onLogout && (
              <button
                id="logout-btn"
                className="logout-btn"
                aria-label="로그아웃"
                onClick={onLogout}
              >
                <svg
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
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            )}
          </div>

          {/* Shared Dropdown - 신문사 선택 */}
          <div
            className="shared-dropdown"
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <ul className="source-list">
              <li
                className="source-item"
                data-source="donga"
                onClick={() => {
                  const targetCategory = hoveredCategory || activeCategory
                  if (targetCategory) {
                    onSourceSelect(targetCategory, 'donga')
                  }
                }}
              >
                <span>동아일보</span>
              </li>
              <li
                className="source-item"
                data-source="chosun"
                onClick={() => {
                  const targetCategory = hoveredCategory || activeCategory
                  if (targetCategory) {
                    onSourceSelect(targetCategory, 'chosun')
                  }
                }}
              >
                <span>조선일보</span>
              </li>
              <li
                className="source-item"
                data-source="joongang"
                onClick={() => {
                  const targetCategory = hoveredCategory || activeCategory
                  if (targetCategory) {
                    onSourceSelect(targetCategory, 'joongang')
                  }
                }}
              >
                <span>중앙일보</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default React.memo(Navigation)
