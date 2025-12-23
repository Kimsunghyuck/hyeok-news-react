/**
 * 트렌드 분석 관련 TypeScript 타입 정의
 *
 * analyzer.py가 생성하는 트렌드 데이터 구조
 */

import type { CategoryId } from './news.types'

/**
 * 키워드 인터페이스
 * 각 키워드와 등장 횟수
 */
export interface Keyword {
  word: string      // 키워드 (한글)
  count: number     // 등장 횟수
}

/**
 * 트렌드 데이터 인터페이스
 * data/trends/trends_YYYY-MM-DD.json 파일 구조
 */
export interface TrendData {
  date: string                                    // 날짜 (YYYY-MM-DD)
  generated_at: string                            // 생성 시각 (ISO 8601)
  daily_top_keywords: Keyword[]                   // 일일 Top 키워드 (최대 20개)
  category_keywords: Record<CategoryId, Keyword[]> // 카테고리별 키워드
}

/**
 * 통계 데이터 인터페이스
 * 통계 대시보드에서 사용
 */
export interface StatisticsData {
  totalArticles: number                      // 총 기사 수
  categoryData: Record<string, number>       // 카테고리별 기사 수
  sourceData: Record<string, number>         // 신문사별 기사 수
}

/**
 * 주간 통계 데이터 인터페이스
 * 최근 7일 트렌드 차트용
 */
export interface WeeklyStats {
  labels: string[]   // 날짜 레이블 (MM-DD 형식)
  data: number[]     // 각 날짜의 기사 수
}
