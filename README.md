# Hyeok News Crawler - React + TypeScript

> **뉴스 크롤링 및 대시보드 웹 애플리케이션**
> Vanilla JS → React + TypeScript + Vite 마이그레이션 완료
> Firebase 인증 + Supabase 데이터베이스 통합

🔗 **배포 URL**: https://hyeok-news-react.vercel.app
📦 **GitHub**: https://github.com/Kimsunghyuck/hyeok-news-react

---

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시작하기](#-시작하기)
- [프로젝트 구조](#-프로젝트-구조)
- [배포](#-배포)
- [개발 가이드](#-개발-가이드)
- [향후 계획](#-향후-계획)

---

## 🎯 프로젝트 소개

한국 주요 일간지(동아일보, 조선일보, 중앙일보)의 뉴스를 자동으로 수집하고, 카테고리별로 정리하여 대시보드 형태로 제공하는 웹 애플리케이션입니다.

### 프로젝트 개요
- **이전 프로젝트**: Vanilla JavaScript 기반 (document-test)
- **현재 프로젝트**: React + TypeScript로 완전 재작성
- **마이그레이션 기간**: 2025-12-22 ~ 2025-12-23
- **CSS 보존율**: 100% (2,143줄 그대로 사용)

---

## ✨ 주요 기능

### 1. 뉴스 대시보드
- **홈 대시보드**: 3개 신문사의 주요 뉴스를 카테고리별로 비교
- **뉴스 티커**: 상단에 최신 뉴스 자동 스크롤
- **카테고리별 뉴스**: 6개 카테고리 (정치, 경제, 사회, 국제, 문화, 스포츠)
- **신문사별 필터**: 동아일보, 조선일보, 중앙일보

### 2. 인증 시스템
- **Firebase Google 로그인**: 간편한 Google 계정 로그인
- **인증 기반 접근 제어**: 로그인 후 서비스 이용 가능
- **실시간 인증 상태 관리**: onAuthStateChanged

### 3. 북마크 기능
- **뉴스 북마크**: 관심 기사 저장
- **북마크 모달**: 저장된 기사 목록 확인 및 삭제
- **로컬 스토리지 저장**: 브라우저에 영구 저장

### 4. 사용자 경험
- **다크모드**: 다크/라이트 테마 전환
- **공유 기능**: Web Share API / URL 복사
- **반응형 디자인**: 모바일/데스크톱 최적화
- **날짜 선택**: 과거 뉴스 조회

### 5. 자동화
- **자동 크롤링**: GitHub Actions로 하루 3번 실행 (09:00, 15:00, 19:00 KST)
- **Supabase 저장**: PostgreSQL 데이터베이스에 자동 저장
- **실시간 업데이트**: 최신 뉴스 자동 반영

---

## 🛠️ 기술 스택

### Frontend
- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구 (초고속 HMR)
- **classnames** - 동적 클래스 관리
- **Swiper** - 뉴스 티커 슬라이더

### Backend & Database
- **Supabase** - PostgreSQL 데이터베이스 + RESTful API
- **Python** - 뉴스 크롤러 (requests, BeautifulSoup)
- **GitHub Actions** - CI/CD 자동화

### Authentication
- **Firebase Authentication** - Google OAuth

### Deployment
- **Vercel** - React 앱 호스팅
- **GitHub** - 버전 관리 및 자동 크롤링

### Code Quality
- **ESLint** - 코드 린팅
- **TypeScript ESLint** - TypeScript 린팅

---

## 🚀 시작하기

### 필수 요구사항
- Node.js 18 이상
- npm 또는 yarn
- Firebase 프로젝트 (Google 로그인용)
- Supabase 프로젝트 (데이터베이스용)

### 1. 저장소 클론
```bash
git clone https://github.com/Kimsunghyuck/hyeok-news-react.git
cd hyeok-news-react
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일 생성:
```env
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Supabase
VITE_SUPABASE_URL=https://your_project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. 개발 서버 실행
```bash
npm run dev
```
→ http://localhost:5173 에서 확인

### 5. 프로덕션 빌드
```bash
npm run build
npm run preview
```

---

## 📁 프로젝트 구조

```
hyeok-news-react/
├── src/
│   ├── assets/              # 정적 파일
│   │   ├── css/
│   │   │   └── style.css    # 기존 CSS (2,143줄, 100% 보존)
│   │   └── images/
│   ├── components/          # React 컴포넌트
│   │   ├── Navigation/
│   │   ├── NewsCard/
│   │   ├── NewsGrid/
│   │   ├── NewsTicker/
│   │   ├── HomeDashboard/
│   │   ├── BookmarkModal/
│   │   └── AuthLanding/
│   ├── hooks/               # Custom Hooks
│   │   ├── useNews.ts       # 뉴스 데이터 로딩 (Supabase)
│   │   ├── useBookmarks.ts  # 북마크 관리
│   │   ├── useTheme.ts      # 다크모드
│   │   └── useAuth.ts       # Firebase 인증
│   ├── config/              # 설정 파일
│   │   ├── firebase.ts      # Firebase 초기화
│   │   └── supabase.ts      # Supabase 클라이언트
│   ├── types/               # TypeScript 타입 정의
│   │   ├── news.types.ts
│   │   ├── bookmark.types.ts
│   │   ├── trend.types.ts
│   │   └── supabase.types.ts
│   ├── utils/               # 유틸리티 함수
│   │   └── date.ts          # 날짜 처리 (KST)
│   ├── App.tsx              # 메인 앱
│   └── main.tsx             # 엔트리 포인트
├── backend/                 # Python 크롤러
│   ├── crawler.py           # 메인 크롤러
│   ├── parser.py            # HTML 파싱
│   ├── config.py            # 크롤러 설정
│   ├── db_saver.py          # Supabase 저장
│   └── requirements.txt     # Python 의존성
├── .github/
│   └── workflows/
│       └── crawl-to-db.yml  # 자동 크롤링 워크플로우
├── public/                  # 정적 파일
├── .env.local               # 환경 변수 (git 제외)
├── vite.config.ts           # Vite 설정
├── tsconfig.json            # TypeScript 설정
└── package.json             # npm 의존성
```

---

## 🌐 배포

### Vercel 배포 (자동)
1. Vercel에 GitHub 저장소 연결
2. 환경 변수 설정 (VITE_* 변수들)
3. 자동 배포 완료!

### GitHub Actions 자동 크롤링
- **스케줄**: 매일 09:00, 15:00, 19:00 KST
- **GitHub Secrets 필요**:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_KEY`

---

## 💻 개발 가이드

### 타입 안정성
모든 컴포넌트와 함수에 TypeScript 타입이 적용되어 있습니다:

```typescript
// 뉴스 아이템 타입
interface NewsItem {
  title: string
  url: string
  date: string
  category: string
  source: string
  image_url?: string
  scraped_at?: string
}

// Props 타입
interface NewsCardProps {
  newsItem: NewsItem
  isBookmarked: boolean
  onBookmark: (item: NewsItem) => void
  onShare: (item: NewsItem) => void
}
```

### Custom Hooks 사용

```typescript
// 뉴스 데이터 로딩
const { news, loading } = useNews('politics', 'donga', '2025-12-23')

// 북마크 관리
const { bookmarks, toggleBookmark, removeBookmark } = useBookmarks()

// 테마 전환
const { toggleTheme } = useTheme()

// 인증 관리
const { user, signInWithGoogle, signOut } = useAuth()
```

### CSS 클래스 규칙
- 기존 CSS를 100% 보존하기 위해 클래스명을 동일하게 유지
- `className="news-card"` 형식 사용
- 동적 클래스는 `classnames` 라이브러리 사용

```tsx
<div className={classNames('bookmark-btn', {
  'bookmarked': isBookmarked
})}>
```

---

## 🔮 향후 계획

### Phase 10: 추가 기능 (보류)
다음 기능들은 향후 구현 예정입니다:

#### 1. 트렌드 패널
- 키워드 클라우드 (일일 TOP 키워드)
- 카테고리별 키워드 분석
- 사이드 패널 UI

#### 2. 통계 차트 (Chart.js)
- 카테고리별 파이 차트
- 신문사별 바 차트
- 주간 라인 차트 (최근 7일 트렌드)

---

## 🐛 트러블슈팅

### 이미지 404 에러
**문제**: 프로덕션에서 이미지가 로드되지 않음
**해결**: Vite는 명시적 import 필요
```typescript
// ❌ 잘못된 방법
<img src="/src/assets/images/logo.png" />

// ✅ 올바른 방법
import logoImage from '../../assets/images/logo.png'
<img src={logoImage} />
```

### Firebase unauthorized-domain 에러
**문제**: Firebase 인증이 작동하지 않음
**해결**: Firebase Console에서 Vercel 도메인 추가
1. Firebase Console → Authentication → Settings
2. Authorized domains에 `your-app.vercel.app` 추가

### Supabase 쿼리 실패
**문제**: 뉴스 데이터가 로드되지 않음
**해결**: `category_en`, `source_en` 필드 사용
```typescript
// ❌ 잘못된 쿼리
.eq('category', 'politics')  // category는 한글

// ✅ 올바른 쿼리
.eq('category_en', 'politics')  // category_en이 영어
```

---

## 📊 프로젝트 통계

- **총 코드 라인**: ~30,000줄
- **컴포넌트 수**: 7개
- **Custom Hooks**: 4개
- **TypeScript 타입**: 15개 이상
- **CSS 보존율**: 100%
- **빌드 시간**: ~2초
- **개발 서버 시작**: 0.4초

---

## 📄 라이선스

이 프로젝트는 개인 학습 목적으로 제작되었습니다.

---

## 👨‍💻 개발자

**Kimsunghyuck**
- GitHub: https://github.com/Kimsunghyuck
- Email: ksh93@example.com

---

**마지막 업데이트**: 2025-12-23
**버전**: 1.0.0 (Phase 9 완료)
