/**
 * 뉴스 관련 TypeScript 타입 정의
 *
 * 이 파일은 뉴스 데이터의 구조를 정의합니다.
 * TypeScript가 자동완성과 타입 검사를 제공합니다.
 */

/**
 * 뉴스 아이템 인터페이스
 * JSON 데이터 파일의 각 뉴스 객체 구조
 */
export interface NewsItem {
  title: string           // 뉴스 제목
  url: string            // 뉴스 기사 URL
  date: string           // 뉴스 날짜 (YYYY-MM-DD)
  category: string       // 카테고리 (한글: 정치, 스포츠 등)
  source: string         // 신문사 (한글: 동아일보, 조선일보 등)
  image_url?: string     // 이미지 URL (선택적 - 없을 수도 있음)
  scraped_at?: string    // 크롤링 시각 (ISO 8601 형식)
  main_category?: string // 메인 카테고리 (일부 데이터에만 존재)
  category_en?: string   // 영문 카테고리 (프론트엔드에서 추가)
  source_en?: string     // 영문 소스 (프론트엔드에서 추가)
}

/**
 * 카테고리 ID 타입
 * 정확히 이 6개 문자열만 허용됩니다.
 */
export type CategoryId =
  | 'politics'      // 정치
  | 'sports'        // 스포츠
  | 'economy'       // 경제
  | 'society'       // 사회
  | 'international' // 국제
  | 'culture'       // 문화

/**
 * 신문사 ID 타입
 * 정확히 이 3개 문자열만 허용됩니다.
 */
export type SourceId =
  | 'donga'    // 동아일보
  | 'chosun'   // 조선일보
  | 'joongang' // 중앙일보

/**
 * 카테고리 정보 인터페이스
 */
export interface Category {
  id: CategoryId     // 영문 ID
  name: string       // 한글 이름
}

/**
 * 신문사 정보 인터페이스
 */
export interface Source {
  id: SourceId       // 영문 ID
  name: string       // 한글 이름
  logo: string       // 로고 이미지 경로
}

/**
 * 크롤링 시간 타입
 * 하루에 3번 크롤링: 09:00, 15:00, 19:00
 */
export type CrawlTime = '09-00' | '15-00' | '19-00'

/**
 * 날짜 문자열 타입 (YYYY-MM-DD 형식)
 */
export type DateString = string

/**
 * 신문사별 뉴스 데이터 구조
 * 홈 대시보드에서 사용
 */
export interface NewspaperNews {
  donga: NewsItem[]
  chosun: NewsItem[]
  joongang: NewsItem[]
}

/**
 * 카테고리 이름 매핑
 * CategoryId → 한글 이름
 */
export const CATEGORY_NAMES: Record<CategoryId, string> = {
  politics: '정치',
  sports: '스포츠',
  economy: '경제',
  society: '사회',
  international: '국제',
  culture: '문화'
}

/**
 * 신문사 이름 매핑
 * SourceId → 한글 이름
 */
export const SOURCE_NAMES: Record<SourceId, string> = {
  donga: '동아일보',
  chosun: '조선일보',
  joongang: '중앙일보'
}

/**
 * 신문사 로고 경로 매핑
 */
export const SOURCE_LOGOS: Record<SourceId, string> = {
  donga: '/src/assets/images/donga.png',
  chosun: '/src/assets/images/chosun.png',
  joongang: '/src/assets/images/joongang.png'
}
