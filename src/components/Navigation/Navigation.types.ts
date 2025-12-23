/**
 * Navigation 컴포넌트 Props 타입 정의
 */

import type { CategoryId, SourceId } from '../../types/news.types'

export interface NavigationProps {
  activeCategory: CategoryId | null      // 현재 선택된 카테고리
  bookmarkCount: number                  // 북마크 개수
  onLogoClick: () => void                // 로고 클릭 핸들러
  onCategoryClick: (category: CategoryId) => void  // 카테고리 클릭 핸들러
  onSourceSelect: (category: CategoryId, source: SourceId) => void  // 신문사 선택 핸들러
  onBookmarkClick: () => void            // 북마크 버튼 클릭 핸들러
  onThemeToggle: () => void              // 테마 토글 핸들러
  onLogout?: () => void                  // 로그아웃 핸들러 (선택적)
}
