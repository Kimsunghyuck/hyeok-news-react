/**
 * 타입 정의 통합 Export
 *
 * 모든 타입을 여기서 한 번에 import할 수 있습니다.
 * 사용 예: import { NewsItem, Bookmark, TrendData } from '@/types'
 */

// 뉴스 관련 타입
export type {
  NewsItem,
  Category,
  Source,
  CategoryId,
  SourceId,
  CrawlTime,
  DateString,
  NewspaperNews
} from './news.types'

export {
  CATEGORY_NAMES,
  SOURCE_NAMES,
  SOURCE_LOGOS
} from './news.types'

// 북마크 관련 타입
export type {
  Bookmark,
  BookmarkStats
} from './bookmark.types'

// 트렌드 관련 타입
export type {
  Keyword,
  TrendData,
  StatisticsData,
  WeeklyStats
} from './trend.types'
