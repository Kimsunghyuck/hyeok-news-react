/**
 * 북마크 관련 TypeScript 타입 정의
 *
 * LocalStorage에 저장되는 북마크 데이터 구조
 */

/**
 * 북마크 아이템 인터페이스
 * LocalStorage의 'newsBookmarks' 키에 저장되는 각 북마크 객체
 */
export interface Bookmark {
  id: string              // 고유 ID (URL 해시)
  title: string           // 뉴스 제목
  url: string            // 뉴스 기사 URL
  image: string          // 이미지 URL (빈 문자열 가능)
  category: string       // 카테고리 (한글)
  source: string         // 신문사 이름 (영문 또는 한글)
  date: string           // 뉴스 날짜 (YYYY-MM-DD)
  bookmarkedAt: number   // 북마크 추가 시각 (타임스탬프)
}

/**
 * 북마크 통계 인터페이스
 * 북마크 모달에서 표시할 통계 정보
 */
export interface BookmarkStats {
  total: number                          // 총 북마크 수
  byCategory: Record<string, number>     // 카테고리별 북마크 수
  bySource: Record<string, number>       // 신문사별 북마크 수
}
