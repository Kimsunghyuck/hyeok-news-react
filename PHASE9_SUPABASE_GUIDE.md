# Phase 9: Supabase 데이터베이스 통합 - 구현 가이드

> **작성일**: 2025-12-22
> **상태**: 준비 완료 - 구현 대기 중
> **예상 작업 시간**: 3-4시간

이 문서는 Phase 9의 상세 구현 가이드입니다. 단계별로 따라하면 Supabase DB 통합을 완료할 수 있습니다.

---

## 📋 사전 준비

### 필요한 계정
- ✅ Supabase 계정 (https://supabase.com - 무료)
- ✅ GitHub 계정 (이미 있음)

### 필요한 파일 (기존 프로젝트에서 복사)
```bash
# document-test 프로젝트에서 복사할 파일들
C:\VibeCoding\document-test\
├── crawler.py
├── parser.py
├── config.py
└── requirements.txt
```

---

## 🚀 Step 1: Supabase 프로젝트 생성 (10분)

### 1.1 Supabase 회원가입 및 프로젝트 생성

1. https://supabase.com 접속
2. "Start your project" 클릭
3. GitHub 계정으로 로그인
4. "New Project" 클릭

**프로젝트 설정**:
- Name: `hyeok-news-crawler`
- Database Password: **강력한 비밀번호 설정** (저장 필수!)
- Region: `Northeast Asia (Seoul)` 또는 `Singapore`
- Pricing Plan: `Free` 선택

5. "Create new project" 클릭 (약 2분 소요)

### 1.2 API 키 확인

프로젝트 생성 후:
1. 좌측 메뉴 → `Settings` → `API`
2. 다음 값들을 복사해서 저장:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (공개 키 - React 앱용)
   - **service_role key**: `eyJhbGc...` (비밀 키 - 크롤러용, **절대 공개 금지!**)

---

## 🗄️ Step 2: 데이터베이스 테이블 생성 (10분)

### 2.1 SQL Editor 열기

1. Supabase 대시보드 좌측 메뉴 → `SQL Editor`
2. "New query" 클릭

### 2.2 테이블 생성 SQL 실행

아래 SQL을 복사해서 붙여넣고 "Run" 클릭:

```sql
-- ============================================
-- 뉴스 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS news (
  -- 기본 키
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- 뉴스 정보
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  date DATE NOT NULL,

  -- 카테고리 및 출처
  category TEXT NOT NULL,
  category_en TEXT,
  source TEXT NOT NULL,
  source_en TEXT,

  -- 이미지
  image_url TEXT,

  -- 메타데이터
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 인덱스 생성 (성능 최적화)
-- ============================================

-- 카테고리별 조회 최적화
CREATE INDEX IF NOT EXISTS idx_news_category
ON news(category);

-- 신문사별 조회 최적화
CREATE INDEX IF NOT EXISTS idx_news_source
ON news(source);

-- 날짜별 조회 최적화 (최신순 정렬)
CREATE INDEX IF NOT EXISTS idx_news_date
ON news(date DESC);

-- 카테고리 + 날짜 복합 조회 최적화
CREATE INDEX IF NOT EXISTS idx_news_category_date
ON news(category, date DESC);

-- 신문사 + 날짜 복합 조회 최적화
CREATE INDEX IF NOT EXISTS idx_news_source_date
ON news(source, date DESC);

-- 카테고리 + 신문사 + 날짜 복합 조회 최적화
CREATE INDEX IF NOT EXISTS idx_news_category_source_date
ON news(category, source, date DESC);

-- URL 중복 방지 (이미 UNIQUE 제약조건으로 처리됨)

-- ============================================
-- updated_at 자동 업데이트 트리거
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_news_updated_at
BEFORE UPDATE ON news
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) 정책
-- ============================================

-- RLS 활성화
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (누구나 뉴스 읽기 가능)
CREATE POLICY "Enable read access for all users"
ON news FOR SELECT
USING (true);

-- 서비스 역할만 삽입/업데이트/삭제 가능
CREATE POLICY "Enable insert for service role only"
ON news FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Enable update for service role only"
ON news FOR UPDATE
USING (auth.role() = 'service_role');

CREATE POLICY "Enable delete for service role only"
ON news FOR DELETE
USING (auth.role() = 'service_role');
```

### 2.3 테이블 확인

1. 좌측 메뉴 → `Table Editor`
2. `news` 테이블이 생성되었는지 확인
3. 컬럼 목록 확인:
   - id, title, url, date, category, source, image_url 등

---

## 🐍 Step 3: Python 크롤러 파일 준비 (30분)

### 3.1 기존 프로젝트에서 파일 복사

```bash
# hyeok-news-react 프로젝트 루트에 backend 폴더 생성
mkdir backend
cd backend

# document-test에서 파일 복사
copy C:\VibeCoding\document-test\crawler.py .
copy C:\VibeCoding\document-test\parser.py .
copy C:\VibeCoding\document-test\config.py .
copy C:\VibeCoding\document-test\requirements.txt .
```

### 3.2 requirements.txt 수정

```txt
# 기존 의존성
requests==2.31.0
beautifulsoup4==4.12.3
lxml==5.1.0
pytz==2024.1

# 추가: Supabase 클라이언트
supabase==2.3.4
```

### 3.3 새 파일 생성: `db_saver.py`

```python
"""
Supabase 데이터베이스 저장 모듈
"""

import os
from supabase import create_client, Client
from datetime import datetime
import pytz
from typing import List, Dict, Any

# Supabase 설정
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("❌ SUPABASE_URL 및 SUPABASE_SERVICE_KEY 환경 변수가 필요합니다!")

# Supabase 클라이언트 초기화
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# 한국 시간대
KST = pytz.timezone('Asia/Seoul')


def save_news_to_db(news_items: List[Dict[str, Any]]) -> Dict[str, int]:
    """
    뉴스 데이터를 Supabase에 저장

    Args:
        news_items: 뉴스 아이템 리스트

    Returns:
        {"success": 성공 개수, "failed": 실패 개수, "duplicate": 중복 개수}
    """
    if not news_items:
        print("⚠️ 저장할 뉴스가 없습니다.")
        return {"success": 0, "failed": 0, "duplicate": 0}

    success_count = 0
    failed_count = 0
    duplicate_count = 0

    print(f"\n📦 총 {len(news_items)}개 뉴스를 DB에 저장 중...")

    for idx, item in enumerate(news_items, 1):
        try:
            # 데이터 준비
            data = {
                "title": item["title"],
                "url": item["url"],
                "date": item["date"],
                "category": item.get("category", item.get("main_category", "")),
                "category_en": item.get("category_en"),
                "source": item["source"],
                "source_en": item.get("source_en"),
                "image_url": item.get("image_url"),
                "scraped_at": item.get("scraped_at", datetime.now(KST).isoformat())
            }

            # Upsert: URL이 같으면 업데이트, 없으면 삽입
            result = supabase.table("news").upsert(
                data,
                on_conflict="url"
            ).execute()

            # 성공
            if result.data:
                success_count += 1
                if idx % 10 == 0:  # 10개마다 진행 상황 출력
                    print(f"  진행: {idx}/{len(news_items)} ({success_count} 성공)")
            else:
                duplicate_count += 1

        except Exception as e:
            error_msg = str(e)

            # 중복 키 에러 (이미 존재하는 URL)
            if "duplicate key" in error_msg.lower() or "unique constraint" in error_msg.lower():
                duplicate_count += 1
            else:
                failed_count += 1
                print(f"  ❌ [{idx}] 저장 실패: {item['title'][:30]}...")
                print(f"     에러: {error_msg[:100]}")

    # 결과 출력
    print(f"\n✅ 저장 완료!")
    print(f"   성공: {success_count}개")
    print(f"   중복: {duplicate_count}개")
    print(f"   실패: {failed_count}개")

    return {
        "success": success_count,
        "failed": failed_count,
        "duplicate": duplicate_count
    }


def get_news_count_by_date(date: str) -> int:
    """
    특정 날짜의 뉴스 개수 조회

    Args:
        date: YYYY-MM-DD 형식

    Returns:
        뉴스 개수
    """
    try:
        result = supabase.table("news") \
            .select("id", count="exact") \
            .eq("date", date) \
            .execute()

        return result.count if hasattr(result, 'count') else 0
    except Exception as e:
        print(f"❌ 뉴스 개수 조회 실패: {e}")
        return 0


def delete_old_news(days: int = 30) -> int:
    """
    오래된 뉴스 삭제 (기본 30일)

    Args:
        days: 삭제할 기준 일수

    Returns:
        삭제된 뉴스 개수
    """
    from datetime import timedelta

    cutoff_date = (datetime.now(KST) - timedelta(days=days)).date()

    try:
        result = supabase.table("news") \
            .delete() \
            .lt("date", str(cutoff_date)) \
            .execute()

        deleted_count = len(result.data) if result.data else 0
        print(f"🗑️ {cutoff_date} 이전 뉴스 {deleted_count}개 삭제 완료")

        return deleted_count
    except Exception as e:
        print(f"❌ 뉴스 삭제 실패: {e}")
        return 0


if __name__ == "__main__":
    # 테스트 코드
    print("🧪 Supabase 연결 테스트...")

    # 테스트 뉴스 저장
    test_news = [{
        "title": "테스트 뉴스",
        "url": f"https://test.com/{datetime.now().timestamp()}",
        "date": datetime.now(KST).date().isoformat(),
        "category": "정치",
        "source": "테스트",
        "image_url": "https://via.placeholder.com/300x200",
        "scraped_at": datetime.now(KST).isoformat()
    }]

    save_news_to_db(test_news)
    print("\n✅ Supabase 연결 성공!")
```

### 3.4 `crawler.py` 수정

기존 `crawler.py`의 `main()` 함수를 수정:

```python
# crawler.py 하단에 추가

from db_saver import save_news_to_db

def main():
    """메인 크롤링 함수"""
    categories = ['politics', 'economy', 'society', 'international', 'culture', 'sports']
    sources = ['donga', 'chosun', 'joongang']

    all_news = []

    for category in categories:
        for source in sources:
            print(f"🔍 크롤링 중: {category} - {source}")

            try:
                news_items = crawl_news(category, source)  # 기존 함수 사용
                all_news.extend(news_items)
                print(f"   ✅ {len(news_items)}개 수집 완료")
            except Exception as e:
                print(f"   ❌ 크롤링 실패: {e}")
                continue

    # Supabase에 저장
    if all_news:
        save_news_to_db(all_news)
    else:
        print("⚠️ 수집된 뉴스가 없습니다.")

    print("\n✅ 전체 크롤링 완료!")
```

---

## ⚙️ Step 4: GitHub Actions 워크플로우 생성 (20분)

### 4.1 워크플로우 파일 생성

```yaml
# .github/workflows/crawl-to-db.yml
name: Crawl News to Supabase

on:
  schedule:
    # 하루 3번 실행 (KST 09:00, 15:00, 19:00)
    - cron: '0 0 * * *'   # 00:00 UTC = 09:00 KST
    - cron: '0 6 * * *'   # 06:00 UTC = 15:00 KST
    - cron: '0 10 * * *'  # 10:00 UTC = 19:00 KST

  # 수동 실행 옵션
  workflow_dispatch:
    inputs:
      test_mode:
        description: '테스트 모드 (소량 크롤링)'
        required: false
        default: 'false'

jobs:
  crawl:
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🐍 Set up Python 3.11
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: 📦 Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt

      - name: 🔍 Run crawler and save to Supabase
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
        run: |
          cd backend
          python crawler.py

      - name: 📊 Summary
        if: always()
        run: |
          echo "✅ Crawling completed at $(date '+%Y-%m-%d %H:%M:%S KST')"
          echo "Check Supabase dashboard for results"

      - name: ❌ Notify on failure
        if: failure()
        run: |
          echo "::error::Crawling failed! Check logs for details."
```

### 4.2 GitHub Secrets 설정

1. GitHub 저장소 페이지 → `Settings` → `Secrets and variables` → `Actions`
2. `New repository secret` 클릭
3. 다음 2개의 시크릿 추가:

**Secret 1: SUPABASE_URL**
- Name: `SUPABASE_URL`
- Value: `https://xxxxx.supabase.co` (Step 1.2에서 복사한 Project URL)

**Secret 2: SUPABASE_SERVICE_KEY**
- Name: `SUPABASE_SERVICE_KEY`
- Value: `eyJhbGc...` (Step 1.2에서 복사한 service_role key)

---

## ⚛️ Step 5: React 앱 Supabase 연동 (1시간)

### 5.1 패키지 설치

```bash
npm install @supabase/supabase-js
```

### 5.2 환경 변수 설정

`.env.local` 파일 생성 (프로젝트 루트):

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...  # anon public key

# Firebase (기존)
VITE_FIREBASE_API_KEY=...
# ...
```

**중요**: `.env.local`을 `.gitignore`에 추가 (이미 되어 있어야 함)

### 5.3 Supabase 클라이언트 생성

```typescript
// src/config/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase 환경 변수가 설정되지 않았습니다!')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

console.log('✅ Supabase 클라이언트 초기화 완료')
```

### 5.4 TypeScript 타입 생성 (옵션)

```typescript
// src/types/supabase.types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      news: {
        Row: {
          id: string
          title: string
          url: string
          date: string
          category: string
          category_en: string | null
          source: string
          source_en: string | null
          image_url: string | null
          scraped_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          url: string
          date: string
          category: string
          category_en?: string | null
          source: string
          source_en?: string | null
          image_url?: string | null
          scraped_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          url?: string
          date?: string
          category?: string
          category_en?: string | null
          source?: string
          source_en?: string | null
          image_url?: string | null
          scraped_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
```

### 5.5 useNews Hook 수정

```typescript
// src/hooks/useNews.ts
import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import type { NewsItem, CategoryId, SourceId } from '../types/news.types'

interface UseNewsReturn {
  news: NewsItem[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useNews(
  category: CategoryId,
  source: SourceId,
  date: string
): UseNewsReturn {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadNews = async () => {
    setLoading(true)
    setError(null)

    try {
      // Supabase에서 데이터 가져오기
      const { data, error: supabaseError } = await supabase
        .from('news')
        .select('*')
        .eq('category', category)
        .eq('source', source)
        .eq('date', date)
        .order('scraped_at', { ascending: false })

      if (supabaseError) {
        throw supabaseError
      }

      // NewsItem 타입으로 변환
      const newsItems: NewsItem[] = (data || []).map(item => ({
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

      setNews(newsItems)
      console.log(`✅ 뉴스 로드 성공: ${newsItems.length}개`)
    } catch (err) {
      setError(err as Error)
      console.error('❌ 뉴스 로드 실패:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNews()
  }, [category, source, date])

  return { news, loading, error, refetch: loadNews }
}
```

### 5.6 HomeDashboard 수정 (옵션 - 최신 뉴스만 로드)

```typescript
// src/hooks/useLatestNews.ts
import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import type { NewsItem, CategoryId } from '../types/news.types'

export function useLatestNews(category: CategoryId, limit: number = 3) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLatestNews = async () => {
      setLoading(true)

      try {
        const { data } = await supabase
          .from('news')
          .select('*')
          .eq('category', category)
          .order('scraped_at', { ascending: false })
          .limit(limit)

        setNews(data as NewsItem[] || [])
      } catch (err) {
        console.error('최신 뉴스 로드 실패:', err)
      } finally {
        setLoading(false)
      }
    }

    loadLatestNews()
  }, [category, limit])

  return { news, loading }
}
```

---

## ✅ Step 6: 테스트 및 검증 (30분)

### 6.1 로컬 Python 크롤러 테스트

```bash
cd backend

# 환경 변수 설정 (Windows PowerShell)
$env:SUPABASE_URL="https://xxxxx.supabase.co"
$env:SUPABASE_SERVICE_KEY="eyJhbGc..."

# 크롤러 실행
python crawler.py
```

**예상 출력**:
```
🔍 크롤링 중: politics - donga
   ✅ 10개 수집 완료
🔍 크롤링 중: politics - chosun
   ✅ 8개 수집 완료
...
📦 총 150개 뉴스를 DB에 저장 중...
  진행: 10/150 (10 성공)
  진행: 20/150 (20 성공)
...
✅ 저장 완료!
   성공: 150개
   중복: 0개
   실패: 0개
```

### 6.2 Supabase 대시보드에서 확인

1. Supabase 대시보드 → `Table Editor` → `news` 테이블
2. 저장된 뉴스 데이터 확인

### 6.3 React 앱 테스트

```bash
npm run dev
```

1. 브라우저 콘솔에서 "✅ 뉴스 로드 성공: X개" 메시지 확인
2. 뉴스 그리드에 데이터 표시 확인
3. 카테고리/신문사 필터 동작 확인

### 6.4 GitHub Actions 수동 실행 테스트

1. GitHub 저장소 → `Actions` 탭
2. `Crawl News to Supabase` 워크플로우 선택
3. `Run workflow` 버튼 클릭
4. 워크플로우 실행 로그 확인

---

## 📊 완료 체크리스트

### Phase 9.1: Supabase 프로젝트 생성
- [ ] Supabase 계정 생성
- [ ] 프로젝트 생성 완료
- [ ] API 키 저장 (URL, anon key, service key)

### Phase 9.2: 데이터베이스 설정
- [ ] `news` 테이블 생성
- [ ] 인덱스 생성 완료
- [ ] RLS 정책 설정 완료

### Phase 9.3: Python 크롤러 구현
- [ ] `backend/` 폴더 생성
- [ ] 기존 파일 복사 완료
- [ ] `db_saver.py` 생성
- [ ] `crawler.py` 수정
- [ ] 로컬 테스트 성공

### Phase 9.4: GitHub Actions 설정
- [ ] `.github/workflows/crawl-to-db.yml` 생성
- [ ] GitHub Secrets 설정 완료
- [ ] 수동 실행 테스트 성공

### Phase 9.5: React 앱 연동
- [ ] `@supabase/supabase-js` 설치
- [ ] `.env.local` 설정
- [ ] `src/config/supabase.ts` 생성
- [ ] `useNews.ts` 수정
- [ ] 로컬 테스트 성공

---

## 🎉 완료 후 다음 단계

Phase 9 완료 후:
1. ✅ JSON 파일 제거 (더 이상 불필요)
2. ✅ `public/data/` 폴더 정리
3. ✅ README.md 업데이트
4. ✅ PROGRESS.md 업데이트 (Phase 9 완료 체크)

---

## 🆘 문제 해결

### Q1: "Supabase 연결 실패" 에러
**해결**:
- 환경 변수 확인 (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`)
- API 키가 올바른지 확인
- 네트워크 연결 확인

### Q2: "RLS 정책으로 인한 접근 거부" 에러
**해결**:
- Python 크롤러: `service_role` key 사용 확인
- React 앱: `anon` key 사용 확인
- RLS 정책 재확인

### Q3: "중복 키" 에러
**해결**:
- 정상 동작 (이미 존재하는 URL은 업데이트됨)
- `upsert` 대신 `insert`를 사용했다면 `upsert`로 변경

---

**이 문서를 따라하면 Phase 9를 완료할 수 있습니다!** 🚀
