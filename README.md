# Hyeok News React

> **한국 3대 일간지 뉴스 크롤링 및 대시보드**
> React + TypeScript + Firebase + Supabase

🔗 **배포**: https://hyeok-news-react.vercel.app
📦 **GitHub**: https://github.com/Kimsunghyuck/hyeok-news-react

---

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시작하기](#-시작하기)
- [프로젝트 구조](#-프로젝트-구조)
- [배포](#-배포)

---

## 🎯 프로젝트 소개

한국 3대 일간지(동아일보, 조선일보, 중앙일보)의 뉴스를 자동으로 수집하고, 카테고리별로 정리하여 제공하는 웹 애플리케이션입니다.

- **자동 크롤링**: GitHub Actions로 하루 3번 실행 (09:00, 15:00, 19:00 KST)
- **실시간 대시보드**: 6개 카테고리 (정치, 경제, 사회, 국제, 문화, 스포츠)
- **Google 로그인**: Firebase Authentication
- **반응형 디자인**: 모바일/데스크톱 최적화

---

## ✨ 주요 기능

### 뉴스 대시보드
- 3개 신문사 × 6개 카테고리 비교 뷰
- 최신 뉴스 자동 스크롤 티커
- 신문사별/카테고리별 필터링
- 날짜 선택으로 과거 뉴스 조회

### 사용자 기능
- Firebase Google 소셜 로그인
- 북마크 저장 (로컬 스토리지)
- 다크모드 지원
- Web Share API / URL 복사

### 자동화
- GitHub Actions 크롤링 (하루 3회)
- Supabase PostgreSQL 자동 저장
- Vercel 자동 배포

---

## 🛠️ 기술 스택

### Core
- **React** `19.2.0` - UI 라이브러리, 최신 안정 버전
- **TypeScript** `5.9.3` - 정적 타입 검사 및 타입 안정성
- **Vite** `7.2.4` - 차세대 빌드 도구 (초고속 HMR, 0.4초 시작)

### Routing & State
- **React Router DOM** `7.11.0` - 클라이언트 사이드 라우팅
- **Custom Hooks** - 상태 관리 (useNews, useBookmarks, useTheme, useAuth)

### UI & Styling
- **Swiper** `12.0.3` - 터치 슬라이더 (뉴스 티커)
- **classnames** `2.5.1` - 조건부 CSS 클래스 관리
- **Vanilla CSS** - 커스텀 스타일시트 (2,143줄)

### Backend & Database
- **Supabase** `2.89.0` - PostgreSQL 데이터베이스 + RESTful API
  - Row Level Security (RLS) 적용
  - 실시간 쿼리 및 필터링
  - Anon Key 기반 보안 연결
- **Python 3.x** - 뉴스 크롤러
  - `requests` - HTTP 요청
  - `BeautifulSoup4` - HTML 파싱
  - `python-dotenv` - 환경 변수 관리

### Authentication
- **Firebase** `12.7.0` - 인증 시스템
  - Google OAuth 2.0 소셜 로그인
  - `onAuthStateChanged` 실시간 인증 상태 관리
  - Firebase SDK 최적화

### DevOps & Automation
- **GitHub Actions** - CI/CD 파이프라인
  - 스케줄 크롤링 (Cron: 09:00, 15:00, 19:00 KST)
  - Python 크롤러 자동 실행
  - Supabase 자동 업로드
- **Vercel** - 프론트엔드 배포
  - Git 푸시 자동 배포
  - 환경 변수 관리
  - 글로벌 CDN

### Development Tools
- **ESLint** `9.39.1` - JavaScript/TypeScript 린터
- **TypeScript ESLint** `8.46.4` - TypeScript 전용 린트 규칙
- **eslint-plugin-react-hooks** `7.0.1` - React Hooks 린팅
- **@types/*** - TypeScript 타입 정의
  - `@types/react` `19.2.5`
  - `@types/react-dom` `19.2.3`
  - `@types/node` `24.10.1`

### Data Visualization (준비중)
- **Chart.js** `4.5.1` - 통계 차트 라이브러리 (향후 사용 예정)

---

## 🚀 시작하기

### 요구사항
- Node.js 18+
- Firebase 프로젝트 (Google 로그인)
- Supabase 프로젝트 (데이터베이스)

### 설치 및 실행
```bash
# 저장소 클론
git clone https://github.com/Kimsunghyuck/hyeok-news-react.git
cd hyeok-news-react

# 의존성 설치
npm install

# 환경 변수 설정 (.env.local)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_SUPABASE_URL=https://your_project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# 개발 서버 실행
npm run dev  # → http://localhost:5173

# 프로덕션 빌드
npm run build
npm run preview
```

---

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── Navigation/      # 네비게이션 바
│   ├── NewsCard/        # 뉴스 카드
│   ├── NewsGrid/        # 뉴스 그리드
│   ├── NewsTicker/      # 뉴스 티커
│   ├── HomeDashboard/   # 홈 대시보드
│   ├── BookmarkModal/   # 북마크 모달
│   └── AuthLanding/     # 로그인 랜딩
├── hooks/               # Custom Hooks
│   ├── useNews.ts       # 뉴스 데이터 (Supabase)
│   ├── useBookmarks.ts  # 북마크 관리
│   ├── useTheme.ts      # 다크모드
│   └── useAuth.ts       # Firebase 인증
├── config/              # 설정
│   ├── firebase.ts      # Firebase 초기화
│   └── supabase.ts      # Supabase 클라이언트
├── types/               # TypeScript 타입
├── utils/               # 유틸리티 함수
└── assets/              # 정적 파일 (CSS, images)

backend/                 # Python 크롤러
├── crawler.py           # 메인 크롤러
├── parser.py            # HTML 파싱
├── db_saver.py          # Supabase 저장
└── requirements.txt

.github/workflows/
└── crawl-to-db.yml      # 자동 크롤링 스케줄
```

---

## 🌐 배포

### Vercel (프론트엔드)
1. GitHub 저장소 연결
2. 환경 변수 설정 (VITE_FIREBASE_*, VITE_SUPABASE_*)
3. Git 푸시 시 자동 배포

### GitHub Actions (크롤러)
- **스케줄**: 매일 09:00, 15:00, 19:00 KST
- **Secrets**: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`

---

## 📊 프로젝트 정보

- **컴포넌트**: 7개
- **Custom Hooks**: 4개
- **타입 정의**: 15개+
- **빌드 시간**: ~2초
- **개발 서버**: 0.4초 시작

---

**마지막 업데이트**: 2025-12-29
