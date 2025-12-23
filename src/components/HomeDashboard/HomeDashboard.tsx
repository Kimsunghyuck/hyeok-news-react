/**
 * HomeDashboard 컴포넌트
 *
 * 홈 화면 대시보드
 * 신문사별로 주요 뉴스를 한눈에 표시 (원본 프로젝트 형식)
 */

import React, { useState, useEffect } from 'react'
import type { HomeDashboardProps } from './HomeDashboard.types'
import type { NewsItem, SourceId } from '../../types/news.types'

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
      const dateStr = '2025-12-19'
      const categories = ['politics', 'economy', 'society', 'international', 'culture', 'sports']
      const sources: SourceId[] = ['donga', 'chosun', 'joongang']

      const newspaperNews: Record<SourceId, NewsItem[]> = {
        donga: [],
        chosun: [],
        joongang: []
      }

      // 각 카테고리/신문사 조합에서 첫 번째 뉴스만 가져오기
      for (const category of categories) {
        for (const source of sources) {
          try {
            const times = ['09-00', '15-00']
            let _loaded = false

            for (const time of times) {
              const url = `/data/${category}/${source}/news_${dateStr}_${time}.json`
              const response = await fetch(url)

              if (response.ok) {
                const news: NewsItem[] = await response.json()
                if (news.length > 0) {
                  const article = news[0]
                  article.category_en = category
                  article.source_en = source
                  newspaperNews[source].push(article)
                  _loaded = true
                  break
                }
              }
            }
          } catch (error) {
            console.error(`Failed to load ${category}/${source}:`, error)
          }
        }
      }

      setNewsData(newspaperNews)
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

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
            홈 대시보드 로딩 중...
          </p>
        </div>
      </div>
    )
  }

  const sourceNames: Record<SourceId, string> = {
    donga: '동아일보',
    chosun: '조선일보',
    joongang: '중앙일보'
  }

  const sourceLogos: Record<SourceId, string> = {
    donga: '/src/assets/images/donga.png',
    chosun: '/src/assets/images/chosun.png',
    joongang: '/src/assets/images/joongang.png'
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
            {(Object.keys(newsData) as SourceId[]).map(source => {
              const articles = newsData[source]

              // 데이터가 없는 경우
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
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default React.memo(HomeDashboard)
