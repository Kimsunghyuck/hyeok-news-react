/**
 * HomeDashboard 컴포넌트 Props 타입 정의
 */

import type { CategoryId } from '../../types/news.types'

export interface HomeDashboardProps {
  onCategoryClick: (category: CategoryId) => void    // 카테고리 클릭 핸들러
  bookmarkedIds: string[]                            // 북마크된 뉴스 ID 목록
}
