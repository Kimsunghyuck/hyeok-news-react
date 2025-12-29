/**
 * HomeDashboard 컴포넌트
 *
 * 홈 화면 대시보드
 * 신문사별로 주요 뉴스를 한눈에 표시 (원본 프로젝트 형식)
 */

import React, { useState, useEffect } from 'react'
import type { HomeDashboardProps } from './HomeDashboard.types'
import type { NewsItem, SourceId } from '../../types/news.types'
import images from '../../assets/images'
import { supabase } from '../../config/supabase'
import type { Database } from '../../types/supabase.types'
import { getTodayKST } from '../../utils/date'

const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onCategoryClick: _onCategoryClick,
  bookmarkedIds: _bookmarkedIds
}) => {
  const [newsData, setNewsData] = useState<Record<SourceId, NewsItem[]>>({
    donga: [],
    chosun: [],
    joongang: []
  })
  const [loading, setLoading] = useState(true)

  // 최신 뉴스 데이터 로드
  useEffect(() => {
    loadHomeDashboard()
  }, [])

  const loadHomeDashboard = async () => {
    setLoading(true)

    try {
      const categories = ['politics', 'economy', 'society', 'international', 'culture', 'sports']
      const sources: SourceId[] = ['donga', 'chosun', 'joongang']

      const newspaperNews: Record<SourceId, NewsItem[]> = {
        donga: [],
        chosun: [],
        joongang: []
      }

      // 오늘 날짜의 시작 시간 (KST 기준 00:00:00)
      const todayKST = getTodayKST()
      const todayStart = todayKST + 'T00:00:00+09:00'

      // 각 신문사별로 최신 뉴스 가져오기 (모든 카테고리 포함)
      for (const source of sources) {
        try {
          // 각 카테고리에서 오늘 날짜의 최신 뉴스 1개씩 가져오기
          for (const category of categories) {
            const { data, error } = await supabase
              .from('news')
              .select('*')
              .eq('source_en', source)
              .eq('category_en', category)
              .gte('scraped_at', todayStart)
              .order('scraped_at', { ascending: false })
              .limit(1)

            if (error) {
              console.error(`Failed to load ${category}/${source}:`, error)
              continue
            }

            if (data && data.length > 0) {
              type NewsRow = Database['public']['Tables']['news']['Row']
              const item = data[0] as NewsRow
              const newsItem: NewsItem = {
                title: item.title,
                url: item.url,
                date: item.date,
                category: item.category,
                category_en: category,
                source: item.source,
                source_en: source,
                image_url: item.image_url || undefined,
                scraped_at: item.scraped_at
              }
              newspaperNews[source].push(newsItem)
            }
          }
        } catch (error) {
          console.error(`Failed to load ${source}:`, error)
        }
      }

      setNewsData(newspaperNews)
      console.log('✅ 홈 대시보드 로드 완료:', newspaperNews)
    } catch (error) {
      console.error('홈 대시보드 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  // 카테고리 이름 매핑
  const categoryNames: Record<string, string> = {
    politics: '정치',
    sports: '스포츠',
    economy: '경제',
    society: '사회',
    international: '국제',
    culture: '문화'
  }

  // 시간 포맷팅
  const formatTime = (scrapedAt: string | undefined): string => {
    if (!scrapedAt) return ''
    const date = new Date(scrapedAt)
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  // 스켈레톤 로딩 컴포넌트
  const renderSkeletonLoading = () => {
    const sources: SourceId[] = ['donga', 'chosun', 'joongang']

    return (
      <>
        {sources.map((source) => (
          <div key={source} className="skeleton-column">
            <div className="skeleton-header">
              <div className="skeleton skeleton-logo"></div>
              <div className="skeleton skeleton-title"></div>
            </div>
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className="skeleton-article">
                <div className="skeleton skeleton-category"></div>
                <div className="skeleton skeleton-article-title"></div>
                <div className="skeleton skeleton-article-title-2"></div>
                <div className="skeleton skeleton-time"></div>
              </div>
            ))}
          </div>
        ))}
      </>
    )
  }

  const sourceNames: Record<SourceId, string> = {
    donga: '동아일보',
    chosun: '조선일보',
    joongang: '중앙일보'
  }

  const sourceLogos: Record<SourceId, string> = {
    donga: images.donga,
    chosun: images.chosun,
    joongang: images.joongang
  }

  return (
    <section className="home-dashboard">
      <div className="container">
        <div className="home-header">
          <h1>📰 오늘의 뉴스</h1>
          <p className="home-subtitle">모든 카테고리의 최신 소식을 한눈에 확인하세요</p>
        </div>

        {/* 신문사별 헤드라인 비교 */}
        <div className="home-section newspaper-comparison">
          <h2>🗞️ 신문사별 주요 뉴스</h2>
          <div className="comparison-grid" id="newspaper-comparison-grid">
            {loading ? (
              // 로딩 중: 스켈레톤 표시
              renderSkeletonLoading()
            ) : (
              (() => {
              // 모든 신문사 데이터가 비어있는지 확인
              const totalArticles = Object.values(newsData).reduce((sum, articles) => sum + articles.length, 0)

              // 모든 데이터가 없으면 중앙 메시지 표시
              if (totalArticles === 0) {
                return (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{
                      background: 'var(--bg-light)',
                      borderRadius: '16px',
                      padding: '3rem',
                      maxWidth: '600px',
                      margin: '0 auto',
                      border: '2px dashed var(--border-color)'
                    }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100"
                        height="100"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        style={{ margin: '0 auto 1.5rem', color: 'var(--secondary-color)', display: 'block' }}
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.8rem' }}>
                        📰 업데이트 대기중
                      </h2>
                      <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '1.1rem',
                        lineHeight: '1.8',
                        marginBottom: '1.5rem'
                      }}>
                        기사가 아직 업데이트 되지 않았습니다.<br />
                        잠시 후 다시 확인해주세요.
                      </p>
                      <div style={{
                        marginTop: '2rem',
                        paddingTop: '2rem',
                        borderTop: '1px solid var(--border-color)'
                      }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                          💡 매일 오전 9시, 오후 3시, 오후 7시에<br />
                          새로운 뉴스가 업데이트됩니다
                        </p>
                      </div>
                    </div>
                  </div>
                )
              }

              // 일부 데이터가 있으면 신문사별로 표시
              return (Object.keys(newsData) as SourceId[]).map(source => {
                const articles = newsData[source]

                // 개별 신문사 데이터가 없는 경우
                if (articles.length === 0) {
                  return (
                    <div key={source} className="comparison-column">
                      <div className="comparison-header">
                        <img src={sourceLogos[source]} alt={sourceNames[source]} />
                        <h3>{sourceNames[source]}</h3>
                      </div>
                      <div className="comparison-no-data">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          style={{ marginBottom: '1rem', color: 'var(--text-secondary)', opacity: 0.5 }}
                        >
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          업데이트 대기중
                        </p>
                      </div>
                    </div>
                  )
                }

                // 데이터가 있는 경우
                return (
                  <div key={source} className="comparison-column">
                    <div className="comparison-header">
                      <img src={sourceLogos[source]} alt={sourceNames[source]} />
                      <h3>{sourceNames[source]}</h3>
                    </div>
                    {articles.map(article => (
                      <div key={article.url} className="comparison-article">
                        <span className={`comparison-article-category ${article.category_en}`}>
                          {categoryNames[article.category_en || ''] || article.category}
                        </span>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="comparison-article-title"
                        >
                          {article.title}
                        </a>
                        <div className="comparison-article-time">
                          {formatTime(article.scraped_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })
              })()
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default React.memo(HomeDashboard)
