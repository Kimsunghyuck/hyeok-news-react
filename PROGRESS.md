# React + TypeScript + Vite 마이그레이션 플랜

> **프로젝트**: Hyeok News Crawler
> **목표**: Vanilla JS → React + TypeScript + Vite 마이그레이션 (CSS 100% 보존)
> **예상 기간**: 2-3주
> **작성일**: 2025-12-22
> **최종 업데이트**: 2025-12-23 09:50 KST
> **현재 진행**: ✅ Phase 1-9 완료! 🎉 | Supabase DB 통합 완료!

---

## 🎯 왜 React + TypeScript인가?

### React의 장점
- ✅ 컴포넌트 기반 구조 (재사용성)
- ✅ 명확한 상태 관리 (Hooks)
- ✅ 풍부한 생태계

### TypeScript의 장점
- ✅ **타입 안정성** - 버그를 코드 작성 중에 미리 발견
- ✅ **자동완성** - IDE가 모든 속성/메서드를 알려줌
- ✅ **리팩토링 안전** - 변수명 변경 시 자동으로 모든 곳 수정

### Vite의 장점
- ✅ **개발 서버 초고속** - 1~2초 만에 시작
- ✅ **즉시 반영** - 파일 저장하면 0.1초 만에 브라우저 업데이트
- ✅ **간단한 설정** - 복잡한 Webpack 설정 불필요

---

## 📊 현재 프로젝트 분석

### 코드 규모
- **JavaScript**: 2,258 줄 (main.js) + 인증 로직 (auth.js)
- **HTML**: 393 줄 (index.html)
- **CSS**: 2,143 줄 (style.css)
- **총 복잡도**: 중간 (컴포넌트 10-15개 예상)

### 주요 기능
1. **뉴스 표시**: 홈 대시보드, 카테고리별 그리드, 티커
2. **상호작용**: 북마크, 공유, 다크모드, 날짜 선택
3. **데이터 시각화**: 트렌드 키워드, 통계 차트
4. **인증**: Firebase Google 로그인

---

## 📋 단계별 실행 계획

### Phase 1: 환경 설정 (1일)

#### 1.1 TypeScript React 프로젝트 생성
```bash
# React + TypeScript 템플릿으로 생성
npm create vite@latest hyeok-news-react -- --template react-ts

cd hyeok-news-react
npm install
```

생성되는 기본 구조:
```
hyeok-news-react/
├── src/
│   ├── App.tsx          ← TypeScript 파일 (.tsx)
│   ├── main.tsx
│   └── vite-env.d.ts    ← 타입 정의 파일
├── tsconfig.json        ← TypeScript 설정
├── package.json
└── vite.config.ts
```

#### 1.2 필수 패키지 설치
```bash
# 유틸리티
npm install classnames
npm install @types/classnames  # TypeScript 타입 정의

# 기존 라이브러리
npm install swiper chart.js
npm install @types/chart.js    # TypeScript 타입

# Firebase
npm install firebase

# React Router
npm install react-router-dom
npm install @types/react-router-dom  # TypeScript 타입
```

**TypeScript 추가 사항**: `@types/` 패키지 = TypeScript가 라이브러리를 이해하도록 도와줌

#### 1.3 폴더 구조 설정
```
src/
├── assets/
│   ├── css/
│   │   └── style.css          ← 기존 CSS 그대로
│   └── images/
├── components/
│   ├── Navigation/
│   │   ├── Navigation.tsx     ← TypeScript 파일
│   │   └── Navigation.types.ts  ← 타입 정의 파일
│   ├── NewsCard/
│   │   ├── NewsCard.tsx
│   │   └── NewsCard.types.ts
│   └── ...
├── hooks/
│   ├── useNews.ts
│   ├── useBookmarks.ts
│   └── useTheme.ts
├── types/                     ← 공통 타입 정의
│   ├── news.types.ts
│   ├── bookmark.types.ts
│   └── index.ts
├── utils/
│   └── helpers.ts
├── App.tsx
└── main.tsx
```

#### 체크리스트
- [ ] Vite + React + TypeScript 프로젝트 생성
- [ ] 패키지 설치 완료
- [ ] 폴더 구조 생성
- [ ] 개발 서버 실행 확인 (`npm run dev`)

---

### Phase 2: 타입 정의 작성 (1일)

**TypeScript의 핵심**: 먼저 **데이터 구조(타입)를 정의**합니다.

#### 2.1 뉴스 아이템 타입
```typescript
// src/types/news.types.ts

export interface NewsItem {
  title: string
  url: string
  date: string
  category: string
  category_en?: string
  source: string
  source_en?: string
  image_url?: string
  scraped_at?: string
}

export type CategoryId = 'politics' | 'sports' | 'economy' | 'society' | 'international' | 'culture'
export type SourceId = 'donga' | 'chosun' | 'joongang'

export interface Category {
  id: CategoryId
  name: string
}

export interface Source {
  id: SourceId
  name: string
  logo: string
}
```

**설명**:
- `interface NewsItem` = 뉴스 데이터의 형태 정의
- `?` = 선택적 속성 (없을 수도 있음)
- `type CategoryId` = 정확히 이 6개 문자열만 허용

#### 2.2 북마크 타입
```typescript
// src/types/bookmark.types.ts

export interface Bookmark {
  id: string
  title: string
  url: string
  image: string
  category: string
  source: string
  date: string
  bookmarkedAt: number
}
```

#### 2.3 트렌드 타입
```typescript
// src/types/trend.types.ts

export interface Keyword {
  word: string
  count: number
}

export interface TrendData {
  date: string
  daily_top_keywords: Keyword[]
  category_keywords: {
    [key: string]: Keyword[]
  }
}
```

#### 체크리스트
- [ ] 타입 정의 파일 작성
- [ ] VS Code에서 자동완성 작동 확인

---

### Phase 3: CSS 및 정적 파일 이동 (0.5일)

#### 3.1 CSS 파일 복사
```bash
# 기존 CSS를 그대로 복사
cp docs/static/css/style.css hyeok-news-react/src/assets/css/
```

#### 3.2 main.tsx에서 CSS import
```typescript
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './assets/css/style.css'  // ← CSS 그대로 사용

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

**TypeScript 추가 사항**: `!` = "이 요소는 확실히 존재함"을 TypeScript에게 알림

#### 3.3 이미지 및 데이터 복사
```bash
cp -r docs/static/images hyeok-news-react/src/assets/
cp -r docs/data hyeok-news-react/public/
```

---

### Phase 4: 기본 컴포넌트 구조 (2일)

#### 4.1 NewsCard 컴포넌트 (TypeScript 버전)

**타입 정의**:
```typescript
// src/components/NewsCard/NewsCard.types.ts
import { NewsItem } from '../../types/news.types'

export interface NewsCardProps {
  newsItem: NewsItem
  isBookmarked: boolean
  onBookmark: (item: NewsItem) => void
  onShare: (item: NewsItem) => void
}
```

**컴포넌트**:
```typescript
// src/components/NewsCard/NewsCard.tsx
import React from 'react'
import classNames from 'classnames'
import { NewsCardProps } from './NewsCard.types'

const NewsCard: React.FC<NewsCardProps> = ({
  newsItem,
  isBookmarked,
  onBookmark,
  onShare
}) => {
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onBookmark(newsItem)
  }

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onShare(newsItem)
  }

  return (
    <article className="news-card" data-news-id={newsItem.url}>
      <button
        className={classNames('bookmark-btn', {
          'bookmarked': isBookmarked
        })}
        onClick={handleBookmarkClick}
        aria-label="북마크"
      >
        <svg className="bookmark-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      </button>

      <button
        className="share-btn"
        onClick={handleShareClick}
        aria-label="공유"
      >
        <svg className="share-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
      </button>

      <div
        className="news-card-image-wrapper"
        onClick={() => window.open(newsItem.url, '_blank')}
      >
        <img
          src={newsItem.image_url || '/default.png'}
          alt={newsItem.title}
          className="news-card-image"
          loading="lazy"
        />
      </div>

      <div
        className="news-card-content"
        onClick={() => window.open(newsItem.url, '_blank')}
        style={{ cursor: 'pointer' }}
      >
        <div className="news-card-header">
          <span className={`news-card-category ${newsItem.category}`}>
            {newsItem.category}
          </span>
          <span className="news-card-date">
            {new Date(newsItem.date).toLocaleDateString()}
          </span>
        </div>
        <h3 className="news-card-title">{newsItem.title}</h3>
        <div className="news-card-source">
          <span>{newsItem.source}</span>
        </div>
      </div>
    </article>
  )
}

export default React.memo(NewsCard)
```

**TypeScript 장점**:
- `NewsCardProps` 타입으로 props 자동완성
- `React.MouseEvent` 타입으로 이벤트 핸들러 안전
- 잘못된 props 전달 시 빨간 줄로 즉시 에러 표시

#### 4.2 Navigation 컴포넌트

**타입 정의**:
```typescript
// src/components/Navigation/Navigation.types.ts
import { CategoryId, SourceId } from '../../types/news.types'

export interface NavigationProps {
  onLogoClick: () => void
  onCategorySelect: (category: CategoryId) => void
  onSourceSelect: (source: SourceId) => void
  onThemeToggle: () => void
  bookmarkCount: number
  onBookmarkClick: () => void
  onTrendClick: () => void
  onLogout: () => void
}
```

**컴포넌트**:
```typescript
// src/components/Navigation/Navigation.tsx
import React, { useState } from 'react'
import classNames from 'classnames'
import { NavigationProps } from './Navigation.types'
import { CategoryId, Category } from '../../types/news.types'

const categories: Category[] = [
  { id: 'politics', name: '정치' },
  { id: 'sports', name: '스포츠' },
  { id: 'economy', name: '경제' },
  { id: 'society', name: '사회' },
  { id: 'international', name: '국제' },
  { id: 'culture', name: '문화' }
]

const Navigation: React.FC<NavigationProps> = ({
  onLogoClick,
  onCategorySelect,
  onThemeToggle,
  bookmarkCount,
  onBookmarkClick
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null)

  const handleCategoryClick = (categoryId: CategoryId) => {
    setActiveCategory(categoryId)
    onCategorySelect(categoryId)
  }

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
                onClick={() => handleCategoryClick(category.id)}
              >
                <span className="category-title">{category.name}</span>
              </li>
            ))}
          </ul>

          {/* Action Buttons */}
          <div className="nav-actions">
            <button
              id="bookmark-page-btn"
              className="bookmark-page-btn"
              aria-label="내 북마크"
              onClick={onBookmarkClick}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              {bookmarkCount > 0 && (
                <span className="bookmark-count">{bookmarkCount}</span>
              )}
            </button>

            <button
              id="theme-toggle"
              className="theme-toggle"
              aria-label="다크모드 전환"
              onClick={onThemeToggle}
            >
              {/* Theme toggle icons */}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default React.memo(Navigation)
```

---

### Phase 5: Custom Hooks (TypeScript) (2일)

#### 5.1 useNews Hook

```typescript
// src/hooks/useNews.ts
import { useState, useEffect } from 'react'
import { NewsItem, CategoryId, SourceId } from '../types/news.types'

interface UseNewsReturn {
  news: NewsItem[]
  loading: boolean
  error: Error | null
}

export function useNews(
  category: CategoryId,
  source: SourceId,
  date: string
): UseNewsReturn {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadNews()
  }, [category, source, date])

  const loadNews = async () => {
    setLoading(true)
    setError(null)

    try {
      const times = ['09-00', '15-00', '19-00']
      let allNews: NewsItem[] = []

      for (const time of times) {
        const response = await fetch(
          `/data/${category}/${source}/news_${date}_${time}.json`
        )
        if (response.ok) {
          const data: NewsItem[] = await response.json()
          allNews = allNews.concat(data)
        }
      }

      setNews(allNews)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { news, loading, error }
}
```

**TypeScript 장점**:
- `UseNewsReturn` 타입으로 반환값 명확
- `NewsItem[]` 타입으로 배열 요소 자동완성
- `category`, `source` 파라미터는 정확한 문자열만 허용

#### 5.2 useBookmarks Hook

```typescript
// src/hooks/useBookmarks.ts
import { useState, useEffect, useCallback } from 'react'
import { Bookmark } from '../types/bookmark.types'
import { NewsItem } from '../types/news.types'

interface UseBookmarksReturn {
  bookmarks: Bookmark[]
  toggleBookmark: (newsItem: NewsItem) => void
  removeBookmark: (bookmarkId: string) => void
}

export function useBookmarks(): UseBookmarksReturn {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('newsBookmarks')
    if (saved) {
      setBookmarks(JSON.parse(saved) as Bookmark[])
    }
  }, [])

  const toggleBookmark = useCallback((newsItem: NewsItem) => {
    setBookmarks(prev => {
      const bookmarkId = generateNewsId(newsItem)
      const exists = prev.some(b => b.id === bookmarkId)

      let newBookmarks: Bookmark[]
      if (exists) {
        newBookmarks = prev.filter(b => b.id !== bookmarkId)
      } else {
        const newBookmark: Bookmark = {
          id: bookmarkId,
          title: newsItem.title,
          url: newsItem.url,
          image: newsItem.image_url || '',
          category: newsItem.category,
          source: newsItem.source,
          date: newsItem.date,
          bookmarkedAt: Date.now()
        }
        newBookmarks = [newBookmark, ...prev]
      }

      localStorage.setItem('newsBookmarks', JSON.stringify(newBookmarks))
      return newBookmarks
    })
  }, [])

  const removeBookmark = useCallback((bookmarkId: string) => {
    setBookmarks(prev => {
      const newBookmarks = prev.filter(b => b.id !== bookmarkId)
      localStorage.setItem('newsBookmarks', JSON.stringify(newBookmarks))
      return newBookmarks
    })
  }, [])

  return { bookmarks, toggleBookmark, removeBookmark }
}

function generateNewsId(newsItem: NewsItem): string {
  const uniqueString = newsItem.url || `${newsItem.title}_${newsItem.date}`
  let hash = 0
  for (let i = 0; i < uniqueString.length; i++) {
    const char = uniqueString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return 'news_' + Math.abs(hash).toString(36)
}
```

#### 5.3 useTheme Hook

```typescript
// src/hooks/useTheme.ts
import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

interface UseThemeReturn {
  theme: Theme
  toggleTheme: () => void
}

export function useTheme(): UseThemeReturn {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return { theme, toggleTheme }
}
```

---

### Phase 6: App.tsx 통합 (1일)

```typescript
// src/App.tsx
import { useState } from 'react'
import Navigation from './components/Navigation/Navigation'
import HomeDashboard from './components/HomeDashboard/HomeDashboard'
import NewsSection from './components/NewsSection/NewsSection'
import { useBookmarks } from './hooks/useBookmarks'
import { useTheme } from './hooks/useTheme'
import { CategoryId, SourceId } from './types/news.types'

function App() {
  const [isHomeView, setIsHomeView] = useState(true)
  const [currentCategory, setCurrentCategory] = useState<CategoryId>('politics')
  const [currentSource, setCurrentSource] = useState<SourceId>('donga')

  const { bookmarks, toggleBookmark } = useBookmarks()
  const { toggleTheme } = useTheme()

  const handleLogoClick = () => {
    setIsHomeView(true)
  }

  const handleCategorySelect = (category: CategoryId) => {
    setCurrentCategory(category)
    setIsHomeView(false)
  }

  const handleSourceSelect = (source: SourceId) => {
    setCurrentSource(source)
    setIsHomeView(false)
  }

  return (
    <>
      <Navigation
        onLogoClick={handleLogoClick}
        onCategorySelect={handleCategorySelect}
        onSourceSelect={handleSourceSelect}
        onThemeToggle={toggleTheme}
        bookmarkCount={bookmarks.length}
        onBookmarkClick={() => {/* 북마크 모달 열기 */}}
        onTrendClick={() => {/* 트렌드 패널 열기 */}}
        onLogout={() => {/* 로그아웃 */}}
      />

      {isHomeView ? (
        <HomeDashboard />
      ) : (
        <NewsSection
          category={currentCategory}
          source={currentSource}
          bookmarks={bookmarks}
          onBookmark={toggleBookmark}
        />
      )}
    </>
  )
}

export default App
```

**TypeScript 장점**:
- `CategoryId`, `SourceId` 타입으로 잘못된 값 방지
- `useState<CategoryId>` 타입으로 상태 타입 명확
- 함수 파라미터 타입 자동 추론

---

## 🛡️ CSS 100% 보존 전략

### 원칙
1. ✅ CSS 파일 절대 수정 금지
2. ✅ 클래스명 100% 동일: `class="news-card"` → `className="news-card"`
3. ✅ HTML 구조 동일하게 유지
4. ✅ 동적 클래스는 `classnames` 라이브러리 사용

### 검증
```bash
# CSS 파일 변경 확인
git diff docs/static/css/style.css hyeok-news-react/src/assets/css/style.css
# 출력: (빈 출력이어야 함)
```

---

## 📊 진행 상황 추적

### ✅ 완료된 Phase
- [x] **Phase 1: 환경 설정** (4/4) - 2025-12-22 완료
  - [x] 1.1 Vite + React + TypeScript 프로젝트 생성
  - [x] 1.2 필수 패키지 설치 (266개 패키지)
  - [x] 1.3 폴더 구조 설정
  - [x] 1.4 개발 서버 실행 확인 (1.8초 시작)

- [x] **Phase 2: 타입 정의 작성** (3/3) - 2025-12-22 완료
  - [x] 2.1 뉴스 타입 정의 (news.types.ts)
  - [x] 2.2 북마크 타입 정의 (bookmark.types.ts)
  - [x] 2.3 트렌드 타입 정의 (trend.types.ts)

- [x] **Phase 3: CSS 및 정적 파일 이동** (5/5) - 2025-12-22 완료 ✨
  - [x] 3.1 Vite 기본 CSS 삭제
  - [x] 3.2 기존 style.css 복사 (2,143줄)
  - [x] 3.3 이미지 파일 복사 (로고, 아이콘 등)
  - [x] 3.4 JSON 데이터 복사 (195개 파일)
  - [x] 3.5 CSS import 및 작동 확인 (**100% 성공!**)

- [x] **Phase 4: 기본 컴포넌트 구조** (5/5) - 2025-12-22 완료 ✨
  - [x] 4.1 NewsCard 컴포넌트 (북마크, 공유 기능 포함)
  - [x] 4.2 Navigation 컴포넌트 (카테고리, 테마 토글)
  - [x] 4.3 NewsGrid 컴포넌트 (뉴스 그리드 레이아웃)
  - [x] 4.4 NewsTicker 컴포넌트 (상단 뉴스 티커)
  - [x] 4.5 HomeDashboard 컴포넌트 (신문사 비교)

- [x] **Phase 5: Custom Hooks** (3/3) - 2025-12-22 완료 ✨
  - [x] 5.1 useNews Hook (뉴스 데이터 로딩)
  - [x] 5.2 useBookmarks Hook (북마크 관리)
  - [x] 5.3 useTheme Hook (다크모드 토글)

- [x] **Phase 6: App.tsx 통합** (1/1) - 2025-12-22 완료 ✨
  - [x] 6.1 전체 컴포넌트 통합 및 상태 관리

- [x] **Phase 7: 고급 기능 구현** (1/1) - 2025-12-22 완료 ✨
  - [x] 7.1 북마크 모달 컴포넌트 (북마크 목록 표시 및 삭제)

- [x] **Phase 8: Firebase Google 로그인 구현** (6/6) - 2025-12-22 완료 ✨
  - [x] 8.1 Firebase 설정 및 초기화 (firebase.ts)
  - [x] 8.2 useAuth Hook 구현 (인증 상태 관리)
  - [x] 8.3 AuthLanding 컴포넌트 (Google 로그인 UI)
  - [x] 8.4 App.tsx 인증 통합 (미인증 시 AuthLanding, 인증 후 메인 앱)
  - [x] 8.5 vite.config.ts 수정 (COOP/COEP 헤더 제거 - 팝업 로그인 지원)
  - [x] 8.6 firebase.ts 개선 (prompt: 'select_account' - 계정 선택 화면 표시)

- [x] **Phase 9: Supabase 데이터베이스 통합** (5/5) - 2025-12-23 완료 ✨
  - [x] 9.1 Supabase 프로젝트 생성 및 테이블 설계 (news 테이블, 인덱스, RLS 정책)
  - [x] 9.2 Python 크롤러 → Supabase 저장 로직 구현 (backend/db_saver.py, crawler.py 수정)
  - [x] 9.3 GitHub Actions 워크플로우 설정 (.github/workflows/crawl-to-db.yml - 하루 3번 자동 실행)
  - [x] 9.4 React 앱 Supabase 클라이언트 설정 (src/config/supabase.ts, .env.local)
  - [x] 9.5 useNews Hook 수정 (JSON fetch → Supabase 쿼리로 전환)

### 🚧 진행 예정 Phase

- [ ] **Phase 10: 배포 및 최적화** - 대기 중
  - [ ] GitHub Actions 자동 크롤링 테스트
  - [ ] 프로덕션 빌드 및 배포
  - [ ] 성능 최적화

### ⏸️ 보류된 기능
다음 기능들은 향후 구현을 위해 `FUTURE_FEATURES.md`에 상세 명세를 문서화했습니다:
- [ ] 트렌드 패널 - 트렌드 탭 (키워드 클라우드)
- [ ] 트렌드 패널 - 통계 탭 (Chart.js 차트 3개)
  - 카테고리별 파이 차트
  - 신문사별 바 차트
  - 주간 라인 차트

> 📄 **참고**: 보류된 기능의 상세 구현 계획은 `FUTURE_FEATURES.md` 참조

### 📋 구현된 주요 컴포넌트 목록
```
src/components/
├── Navigation/          ✅ 완료
├── NewsCard/           ✅ 완료
├── NewsGrid/           ✅ 완료
├── NewsTicker/         ✅ 완료
├── HomeDashboard/      ✅ 완료
├── BookmarkModal/      ✅ 완료
└── AuthLanding/        ✅ 완료 (Phase 8)
```

### 📋 구현된 Hooks 목록
```
src/hooks/
├── useNews.ts          ✅ 완료
├── useBookmarks.ts     ✅ 완료
├── useTheme.ts         ✅ 완료
└── useAuth.ts          ✅ 완료 (Phase 8)
```

### 📋 구현된 설정 파일
```
src/config/
└── firebase.ts         ✅ 완료 (Phase 8)
```

---

## 💡 TypeScript 빠른 가이드

### 기본 타입
```typescript
let name: string = "뉴스"
let count: number = 10
let isActive: boolean = true
let items: string[] = ["a", "b", "c"]
```

### Interface (객체 구조 정의)
```typescript
interface User {
  name: string
  age: number
  email?: string  // 선택적
}
```

### Type (타입 별칭)
```typescript
type Status = 'pending' | 'loading' | 'success' | 'error'
```

### 함수 타입
```typescript
function add(a: number, b: number): number {
  return a + b
}
```

### React Props 타입
```typescript
interface Props {
  title: string
  count: number
  onClick: () => void
}

const Component: React.FC<Props> = ({ title, count, onClick }) => {
  return <div onClick={onClick}>{title}: {count}</div>
}
```

---

## 🎉 마이그레이션 완료!

### ✅ 완료된 모든 Phase (1-9)

**Phase 1-3**: 프로젝트 설정 및 기반 구축
- Vite + React + TypeScript 환경 구성
- 타입 정의 작성 (NewsItem, Bookmark, Trend)
- CSS 및 정적 파일 이동 (100% 보존)

**Phase 4-5**: 컴포넌트 및 Hooks 구현
- 7개의 주요 컴포넌트 구현 (Navigation, NewsCard, NewsGrid, NewsTicker, HomeDashboard, BookmarkModal, AuthLanding)
- 4개의 Custom Hooks 구현 (useNews, useBookmarks, useTheme, useAuth)

**Phase 6-7**: 통합 및 고급 기능
- App.tsx 전체 통합 및 상태 관리
- 북마크 모달 기능 구현

**Phase 8**: Firebase 인증 구현
- Firebase 설정 및 초기화
- Google 로그인 기능 완전 구현
- 인증 기반 앱 접근 제어
- 팝업 로그인 문제 해결 (COOP/COEP 헤더 제거)
- 계정 선택 화면 추가

**Phase 9**: Supabase 데이터베이스 통합 (2025-12-23 완료)
- Supabase 프로젝트 생성 및 PostgreSQL 테이블 설계
- Python 크롤러 Supabase 연동 (backend/db_saver.py, crawler.py)
- GitHub Actions 자동 크롤링 워크플로우 (.github/workflows/crawl-to-db.yml)
- React 앱 Supabase 클라이언트 설정 (src/config/supabase.ts)
- useNews Hook Supabase 쿼리로 전환

### 🎯 주요 성과

✅ **완전한 타입 안정성**
- 모든 컴포넌트와 함수에 TypeScript 타입 적용
- Props 타입 정의로 개발 시 자동완성 지원

✅ **CSS 100% 보존**
- 기존 style.css (2,143줄) 그대로 사용
- 클래스명 완벽 일치로 디자인 동일 유지

✅ **모던 React 패턴**
- Functional Components + Hooks
- React.memo를 통한 성능 최적화
- Custom Hooks로 로직 재사용

✅ **Firebase 인증 통합**
- Google 로그인 기능 완전 구현
- onAuthStateChanged로 실시간 인증 상태 관리
- 인증 기반 앱 접근 제어 (미인증 시 AuthLanding, 인증 후 메인 앱)

✅ **Supabase 데이터베이스 통합**
- PostgreSQL 기반 확장 가능한 데이터 저장소
- Python 크롤러 → Supabase 자동 저장
- GitHub Actions 하루 3번 자동 크롤링
- React 앱 실시간 DB 쿼리

✅ **개발자 경험 향상**
- Vite의 초고속 개발 서버 (0.4초 시작)
- HMR (Hot Module Replacement)로 즉시 반영
- TypeScript 자동완성 및 에러 체크

---

---

## 🗄️ Phase 9: Supabase 데이터베이스 통합 (✅ 완료!)

### 목표
기존 JSON 파일 기반 데이터 저장 방식을 **Supabase PostgreSQL DB**로 전환하여 확장성과 성능을 개선합니다.

### 현재 방식 vs 새로운 방식

#### 기존 방식 (document-test)
```
GitHub Actions → Python 크롤러 → JSON 파일 저장 (docs/data/)
                                      ↓
                                Git Commit & Push
                                      ↓
                                GitHub Pages
                                      ↓
                             React 앱이 JSON 읽기
```

#### 새로운 방식 (Phase 9)
```
GitHub Actions → Python 크롤러 → Supabase PostgreSQL DB
                                      ↓
                                React 앱이 API로 읽기
```

### 구현 단계

#### 9.1 Supabase 프로젝트 생성 및 테이블 설계
**예상 시간**: 30분

- Supabase 프로젝트 생성
- PostgreSQL 테이블 스키마 설계
- 인덱스 및 제약조건 설정
- Row Level Security (RLS) 정책 설정

**테이블 구조**:
```sql
CREATE TABLE news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  source TEXT NOT NULL,
  image_url TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 9.2 Python 크롤러 → Supabase 저장 로직 구현
**예상 시간**: 1-2시간

- `supabase-py` 패키지 설치
- `crawler.py` 수정: JSON 저장 → Supabase upsert
- URL 기반 중복 방지 로직
- 에러 처리 및 재시도 로직

**주요 변경**:
```python
# 기존: JSON 파일 저장
with open(f'data/{category}/{source}/news_{date}.json', 'w') as f:
    json.dump(news_items, f, ensure_ascii=False, indent=2)

# 신규: Supabase 저장
supabase.table("news").upsert(news_items, on_conflict="url").execute()
```

#### 9.3 GitHub Actions 워크플로우 설정
**예상 시간**: 30분

- `.github/workflows/crawl-to-db.yml` 생성
- 하루 3번 자동 실행 (09:00, 15:00, 19:00 KST)
- GitHub Secrets에 Supabase 크레덴셜 저장
- 수동 실행 옵션 추가

#### 9.4 React 앱 Supabase 클라이언트 설정
**예상 시간**: 30분

- `@supabase/supabase-js` 패키지 설치
- `src/config/supabase.ts` 생성
- 환경 변수 설정 (`.env.local`)
- TypeScript 타입 자동 생성

#### 9.5 useNews Hook 수정
**예상 시간**: 1시간

- JSON fetch → Supabase query 전환
- 필터링 로직 (카테고리, 신문사, 날짜)
- 정렬 및 페이지네이션
- 실시간 구독 기능 (옵션)

**주요 변경**:
```typescript
// 기존: JSON 파일 fetch
const response = await fetch(`/data/${category}/${source}/news_${date}.json`)
const data = await response.json()

// 신규: Supabase 쿼리
const { data } = await supabase
  .from('news')
  .select('*')
  .eq('category', category)
  .eq('source', source)
  .eq('date', date)
  .order('scraped_at', { ascending: false })
```

### 기술 스택 추가

| 기술 | 용도 |
|------|------|
| **Supabase** | PostgreSQL 호스팅 + RESTful API |
| **supabase-py** | Python 클라이언트 (크롤러용) |
| **@supabase/supabase-js** | JavaScript 클라이언트 (React용) |

### 예상 총 작업 시간
**3-4시간**

### 장점
- ✅ **확장성**: JSON 파일보다 효율적인 데이터 관리
- ✅ **성능**: 인덱싱을 통한 빠른 쿼리
- ✅ **실시간**: 새 뉴스 실시간 알림 가능
- ✅ **타입 안전**: TypeScript 타입 자동 생성
- ✅ **무료**: 무료 티어로 충분 (500MB DB)

### 비용 분석
**Supabase 무료 티어**:
- 500MB 데이터베이스
- 무제한 API 요청
- 50만 읽기/월

**예상 사용량**:
- 뉴스 1개: ~1KB
- 하루 270개 × 30일 = 8,100개 = **8MB/월**
- 1년 = **~100MB**

→ **무료 티어로 충분!** 🎉

---

## 🚀 향후 확장 가능 기능

보류된 기능들의 상세 구현 계획은 `FUTURE_FEATURES.md`에 문서화되어 있습니다:
- 트렌드 패널 (키워드 클라우드)
- 통계 차트 (Chart.js 활용)

필요 시 해당 문서를 참고하여 구현할 수 있습니다.
