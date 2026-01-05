/**
 * Hyeok News Crawler - React + TypeScript 버전
 * Phase 7: Firebase 인증 통합 완료
 */

import { useState, useEffect } from 'react'
import Navigation from './components/Navigation'
import NewsTicker from './components/NewsTicker'
import HomeDashboard from './components/HomeDashboard'
import NewsGrid from './components/NewsGrid'
import BookmarkModal from './components/BookmarkModal'
import AuthLanding from './components/AuthLanding'
import { useBookmarks } from './hooks/useBookmarks'
import { useTheme } from './hooks/useTheme'
import { useNews } from './hooks/useNews'
import { useAuth } from './hooks/useAuth'
import type { NewsItem, CategoryId, SourceId } from './types/news.types'
import { CATEGORY_NAMES, SOURCE_NAMES } from './types/news.types'
import images from './assets/images'
import { getTodayKST } from './utils/date'
import { supabase } from './config/supabase'

function App() {
  // 화면 상태
  const [isHomeView, setIsHomeView] = useState(true)
  const [currentCategory, setCurrentCategory] = useState<CategoryId>('politics')
  const [currentSource, setCurrentSource] = useState<SourceId>('donga')
  const [selectedDate, setSelectedDate] = useState(getTodayKST())
  const [tickerNews, setTickerNews] = useState<NewsItem[]>([])
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false)

  // Custom Hooks
  const { user, loading: authLoading, error: authError, signInWithGoogle, signOut, clearError } = useAuth()
  const { bookmarks, bookmarkedIds, toggleBookmark, removeBookmark } = useBookmarks()
  const { toggleTheme } = useTheme()

  // 티커 뉴스 로드
  useEffect(() => {
    loadTickerNews()
  }, [])

  const loadTickerNews = async () => {
    try {
      const categories = ['politics', 'economy', 'society', 'international', 'culture', 'sports']
      const allNews: NewsItem[] = []

      // 오늘 날짜의 시작 시간 (KST 기준 00:00:00)
      const todayKST = getTodayKST()
      const todayStart = todayKST + 'T00:00:00+09:00'

      // 각 카테고리에서 오늘 날짜의 최신 뉴스 2-3개씩 가져오기
      for (const category of categories) {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('category_en', category)
          .gte('scraped_at', todayStart)
          .order('scraped_at', { ascending: false })
          .limit(3)

        if (error) {
          console.error(`티커 뉴스 로드 실패 (${category}):`, error)
          continue
        }

        if (data && data.length > 0) {
          type NewsRow = {
            title: string
            url: string
            date: string
            category: string
            category_en: string | null
            source: string
            source_en: string | null
            image_url: string | null
            scraped_at: string
          }
          const newsItems: NewsItem[] = (data as NewsRow[]).map(item => ({
            title: item.title,
            url: item.url,
            date: item.date,
            category: item.category,
            category_en: item.category_en || undefined,
            source: item.source,
            source_en: item.source_en || undefined,
            image_url: item.image_url || undefined,
            scraped_at: item.scraped_at
          }))
          allNews.push(...newsItems)
        }
      }

      // 뉴스를 랜덤하게 섞기
      const shuffled = allNews.sort(() => Math.random() - 0.5)

      // 최대 15개만 사용
      setTickerNews(shuffled.slice(0, 15))
      console.log('✅ 티커 뉴스 로드 완료:', shuffled.length, '개 (카테고리별 랜덤)')
    } catch (error) {
      console.error('티커 뉴스 로드 실패:', error)
    }
  }

  // 카테고리 뷰일 때만 뉴스 로드
  const { news, loading } = useNews(
    currentCategory,
    currentSource,
    selectedDate
  )

  // 로고 클릭: 홈으로 이동
  const handleLogoClick = () => {
    setIsHomeView(true)
  }

  // 카테고리 클릭: 해당 카테고리 뉴스 보기
  const handleCategoryClick = (category: CategoryId) => {
    setCurrentCategory(category)
    setCurrentSource('donga')  // 기본 신문사
    setIsHomeView(false)
  }

  // 신문사 선택: 카테고리 + 신문사 조합으로 뉴스 보기
  const handleSourceSelect = (category: CategoryId, source: SourceId) => {
    setCurrentCategory(category)
    setCurrentSource(source)
    setIsHomeView(false)
  }

  // 북마크 버튼 클릭
  const handleBookmarkClick = () => {
    setIsBookmarkModalOpen(true)
  }

  // 북마크 모달 닫기
  const handleCloseBookmarkModal = () => {
    setIsBookmarkModalOpen(false)
  }

  // 북마크 토글
  const handleBookmark = (item: NewsItem) => {
    toggleBookmark(item)
  }

  // 공유 핸들러
  const handleShare = async (item: NewsItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          url: item.url
        })
      } catch (error) {
        console.log('공유 취소됨')
      }
    } else {
      // Fallback: URL 복사
      try {
        await navigator.clipboard.writeText(item.url)
        alert('링크가 복사되었습니다! 📋')
      } catch (error) {
        alert('링크 복사 실패')
      }
    }
  }

  // 로그아웃 핸들러
  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await signOut()
    }
  }

  // 인증 로딩 중
  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: 'var(--text-secondary)'
      }}>
        인증 확인 중...
      </div>
    )
  }

  // 로그인하지 않은 경우 AuthLanding 표시
  if (!user) {
    return (
      <AuthLanding
        onSignIn={signInWithGoogle}
        loading={authLoading}
        error={authError}
        onClearError={clearError}
      />
    )
  }

  // 로그인한 사용자에게 메인 앱 표시
  return (
    <>
      {/* 네비게이션 바 */}
      <Navigation
        activeCategory={isHomeView ? null : currentCategory}
        bookmarkCount={bookmarkedIds.length}
        onLogoClick={handleLogoClick}
        onCategoryClick={handleCategoryClick}
        onSourceSelect={handleSourceSelect}
        onBookmarkClick={handleBookmarkClick}
        onThemeToggle={toggleTheme}
        onLogout={handleLogout}
      />

      {/* 뉴스 티커 */}
      <NewsTicker newsItems={tickerNews} />

      {/* 북마크 모달 */}
      <BookmarkModal
        isOpen={isBookmarkModalOpen}
        onClose={handleCloseBookmarkModal}
        bookmarks={bookmarks}
        onRemoveBookmark={removeBookmark}
      />

      {/* 메인 콘텐츠 */}
      {isHomeView ? (
        // 홈 대시보드
        <HomeDashboard
          onCategoryClick={handleCategoryClick}
          bookmarkedIds={bookmarkedIds}
        />
      ) : (
        // 카테고리별 뉴스 그리드
        <section className="news-section">
          <div className="container">
            {/* 날짜 선택기 영역 */}
            <div className="date-selector-wrapper">
              <div className="news-source-title">
                <h2>
                  <span className={`category-label ${currentCategory}`}>
                    {CATEGORY_NAMES[currentCategory]}
                  </span>
                  <img
                    src={images[currentSource]}
                    alt={SOURCE_NAMES[currentSource]}
                    style={{ width: '24px', height: '24px', marginLeft: '0.5rem', marginRight: '0.5rem' }}
                  />
                  {SOURCE_NAMES[currentSource]}
                </h2>
              </div>
              <div className="date-selector-controls">
                <label htmlFor="date-select">스크랩 날짜:</label>
                <input
                  type="date"
                  id="date-select"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            {/* 로딩 스피너 */}
            {loading ? (
              <div id="loading-spinner" className="loading-spinner">
                <div className="spinner"></div>
                <p>뉴스를 불러오는 중...</p>
              </div>
            ) : news.length > 0 ? (
              <>
                <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                  총 {news.length}개의 뉴스
                </p>
                <NewsGrid
                  newsItems={news}
                  bookmarkedIds={bookmarkedIds}
                  onBookmark={handleBookmark}
                  onShare={handleShare}
                />
              </>
            ) : (
              <div id="empty-state" className="empty-state">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  style={{ marginBottom: '1rem', color: 'var(--text-secondary)', opacity: 0.5 }}
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <p>해당 날짜의 뉴스가 없습니다</p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                  다른 날짜를 선택해주세요
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  )
}

export default App
