# 향후 구현 예정 기능

> **작성일**: 2025-12-22
> **상태**: 보류 (Phase 7에서 제외)

이 문서는 현재 프로젝트에서 구현이 보류된 기능들의 상세 명세를 담고 있습니다.
나중에 필요할 때 이 문서를 참고하여 구현할 수 있습니다.

---

## 📊 1. 트렌드 패널 (Trend Panel)

### 개요
사이드 패널 형태로 열리는 트렌드 분석 기능입니다.
두 개의 탭(트렌드 탭, 통계 탭)으로 구성되며, 뉴스 데이터의 키워드 분석과 통계를 시각화합니다.

### 원본 구현 위치
- **HTML**: `docs/index.html` (line 163-230)
- **JavaScript**: `docs/static/js/main.js`
  - `initTrendPanel()` (line 1054)
  - `displayTrendKeywords()` (line 1166)
  - `displayCategoryKeywords()` (line 1189)

### UI 구조

```html
<!-- 트렌드 패널 -->
<div id="trend-panel" class="trend-panel">
  <div class="trend-panel-header">
    <h2>📈 트렌드</h2>
    <button id="close-trend-panel" class="close-panel-btn">×</button>
  </div>

  <!-- 탭 네비게이션 -->
  <div class="trend-tabs">
    <button class="trend-tab active" data-tab="trends">🔥 트렌드</button>
    <button class="trend-tab" data-tab="statistics">📊 통계</button>
  </div>

  <!-- 트렌드 탭 콘텐츠 -->
  <div class="trend-panel-content active" id="trends-content">
    <!-- 일일 TOP 키워드 -->
    <div class="trend-section">
      <h3>일일 TOP 키워드</h3>
      <div id="daily-keywords" class="keyword-cloud"></div>
    </div>

    <!-- 카테고리별 키워드 -->
    <div class="trend-section">
      <h3>카테고리별 키워드</h3>
      <div id="category-keywords"></div>
    </div>
  </div>

  <!-- 통계 탭 콘텐츠 -->
  <div class="trend-panel-content" id="statistics-content">
    <!-- 차트들 -->
  </div>
</div>

<!-- 오버레이 -->
<div id="trend-overlay" class="trend-overlay"></div>
```

### CSS 클래스
기존 `style.css`에 이미 정의되어 있는 클래스:
- `.trend-panel` - 사이드 패널 컨테이너
- `.trend-panel.active` - 패널 열림 상태
- `.trend-tab` - 탭 버튼
- `.trend-panel-content` - 탭 콘텐츠
- `.keyword-cloud` - 키워드 클라우드
- `.trend-overlay` - 배경 오버레이

### React 구현 계획

#### 1. 타입 정의
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

export interface TrendPanelProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: string
}
```

#### 2. 컴포넌트 구조
```
src/components/TrendPanel/
├── TrendPanel.tsx              # 메인 컴포넌트
├── TrendPanel.types.ts         # 타입 정의
├── TrendTab.tsx                # 트렌드 탭 콘텐츠
├── StatisticsTab.tsx           # 통계 탭 콘텐츠
├── KeywordCloud.tsx            # 키워드 클라우드
└── index.ts
```

#### 3. TrendPanel.tsx 예시
```typescript
import React, { useState, useEffect } from 'react'
import TrendTab from './TrendTab'
import StatisticsTab from './StatisticsTab'
import type { TrendPanelProps } from './TrendPanel.types'

const TrendPanel: React.FC<TrendPanelProps> = ({
  isOpen,
  onClose,
  selectedDate
}) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'statistics'>('trends')
  const [trendData, setTrendData] = useState<TrendData | null>(null)

  // 트렌드 데이터 로드
  useEffect(() => {
    if (isOpen) {
      loadTrendData()
    }
  }, [isOpen, selectedDate])

  const loadTrendData = async () => {
    try {
      const response = await fetch(`/data/trends/trends_${selectedDate}.json`)
      if (response.ok) {
        const data = await response.json()
        setTrendData(data)
      }
    } catch (error) {
      console.error('트렌드 데이터 로드 실패:', error)
    }
  }

  // body 스크롤 제어
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <div id="trend-panel" className={`trend-panel ${isOpen ? 'active' : ''}`}>
        {/* 헤더 */}
        <div className="trend-panel-header">
          <h2>📈 트렌드</h2>
          <button
            id="close-trend-panel"
            className="close-panel-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="trend-tabs">
          <button
            className={`trend-tab ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveTab('trends')}
          >
            🔥 트렌드
          </button>
          <button
            className={`trend-tab ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            📊 통계
          </button>
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === 'trends' ? (
          <TrendTab trendData={trendData} />
        ) : (
          <StatisticsTab selectedDate={selectedDate} />
        )}
      </div>

      {/* 오버레이 */}
      <div
        id="trend-overlay"
        className={`trend-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      ></div>
    </>
  )
}

export default React.memo(TrendPanel)
```

#### 4. KeywordCloud.tsx 예시
```typescript
import React from 'react'
import type { Keyword } from '../../types/trend.types'

interface KeywordCloudProps {
  keywords: Keyword[]
}

const KeywordCloud: React.FC<KeywordCloudProps> = ({ keywords }) => {
  // 키워드 빈도에 따라 폰트 크기 계산
  const getFontSize = (count: number, maxCount: number): number => {
    const minSize = 14
    const maxSize = 32
    return minSize + (count / maxCount) * (maxSize - minSize)
  }

  if (keywords.length === 0) {
    return <p>키워드 데이터가 없습니다</p>
  }

  const maxCount = Math.max(...keywords.map(k => k.count))

  return (
    <div className="keyword-cloud">
      {keywords.map((keyword, index) => (
        <span
          key={index}
          className="keyword-item"
          style={{
            fontSize: `${getFontSize(keyword.count, maxCount)}px`
          }}
        >
          {keyword.word}
        </span>
      ))}
    </div>
  )
}

export default React.memo(KeywordCloud)
```

### 데이터 구조
트렌드 데이터는 `/data/trends/trends_YYYY-MM-DD.json` 형식으로 저장:

```json
{
  "date": "2025-12-19",
  "daily_top_keywords": [
    { "word": "대통령", "count": 45 },
    { "word": "경제", "count": 38 },
    { "word": "정책", "count": 32 }
  ],
  "category_keywords": {
    "politics": [
      { "word": "국회", "count": 25 },
      { "word": "법안", "count": 20 }
    ],
    "economy": [
      { "word": "주가", "count": 30 },
      { "word": "환율", "count": 22 }
    ]
  }
}
```

### App.tsx 통합
```typescript
// 상태 추가
const [isTrendPanelOpen, setIsTrendPanelOpen] = useState(false)

// 네비게이션에 트렌드 버튼 추가
<Navigation
  // ... 기존 props
  onTrendClick={() => setIsTrendPanelOpen(true)}
/>

// TrendPanel 렌더링
<TrendPanel
  isOpen={isTrendPanelOpen}
  onClose={() => setIsTrendPanelOpen(false)}
  selectedDate={selectedDate}
/>
```

---

## 📈 2. 통계 차트 (Statistics Charts)

### 개요
Chart.js를 활용하여 뉴스 데이터를 시각화하는 3개의 차트를 제공합니다.

### 필수 패키지
```bash
npm install chart.js react-chartjs-2
```

### 차트 종류

#### 2.1 카테고리별 파이 차트 (Category Pie Chart)

**목적**: 카테고리별 뉴스 기사 수 분포를 파이 차트로 표시

**원본 구현**: `renderCategoryPieChart()` (main.js line 1450)

**데이터 구조**:
```typescript
interface CategoryData {
  labels: string[]      // ['정치', '경제', '사회', ...]
  counts: number[]      // [120, 95, 87, ...]
}
```

**React 구현**:
```typescript
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const CategoryPieChart: React.FC<{ data: CategoryData }> = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [{
      data: data.counts,
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40'
      ]
    }]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || ''
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${value}개 (${percentage}%)`
          }
        }
      }
    }
  }

  return (
    <div className="chart-container" style={{ height: '300px' }}>
      <Pie data={chartData} options={options} />
    </div>
  )
}
```

#### 2.2 신문사별 바 차트 (Source Bar Chart)

**목적**: 신문사별 기사 수를 막대 그래프로 비교

**원본 구현**: `renderSourceBarChart()` (main.js line 1522)

**React 구현**:
```typescript
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const SourceBarChart: React.FC<{ data: SourceData }> = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [{
      label: '기사 수',
      data: data.counts,
      backgroundColor: [
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 99, 132, 0.5)',
        'rgba(75, 192, 192, 0.5)'
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(75, 192, 192, 1)'
      ],
      borderWidth: 1
    }]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10
        }
      }
    }
  }

  return (
    <div className="chart-container" style={{ height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}
```

#### 2.3 주간 라인 차트 (Weekly Line Chart)

**목적**: 최근 7일간의 일일 기사 수 트렌드를 라인 차트로 표시

**원본 구현**: `renderWeeklyLineChart()` (main.js line 1607)

**React 구현**:
```typescript
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const WeeklyLineChart: React.FC<{ data: WeeklyData }> = ({ data }) => {
  const chartData = {
    labels: data.dates,  // ['12/13', '12/14', '12/15', ...]
    datasets: [{
      label: '일일 기사 수',
      data: data.counts,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.4
    }]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  return (
    <div className="chart-container" style={{ height: '300px' }}>
      <Line data={chartData} options={options} />
    </div>
  )
}
```

### StatisticsTab.tsx 통합

```typescript
import React, { useState, useEffect } from 'react'
import CategoryPieChart from './CategoryPieChart'
import SourceBarChart from './SourceBarChart'
import WeeklyLineChart from './WeeklyLineChart'

interface StatisticsTabProps {
  selectedDate: string
}

const StatisticsTab: React.FC<StatisticsTabProps> = ({ selectedDate }) => {
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null)
  const [sourceData, setSourceData] = useState<SourceData | null>(null)
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [selectedDate])

  const loadStatistics = async () => {
    setLoading(true)
    try {
      // 통계 데이터 로드 로직
      // ...
    } catch (error) {
      console.error('통계 데이터 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>통계 로딩 중...</div>
  }

  return (
    <div className="trend-panel-content" id="statistics-content">
      {/* 오늘의 뉴스 현황 */}
      <div className="stats-overview">
        <h3>오늘의 뉴스 현황</h3>
        <div className="stats-summary-grid">
          <div className="stats-card">
            <div className="stats-number">{totalNews}</div>
            <div className="stats-label">총 기사</div>
          </div>
          <div className="stats-card">
            <div className="stats-number">{categoryCount}</div>
            <div className="stats-label">카테고리</div>
          </div>
          <div className="stats-card">
            <div className="stats-number">{sourceCount}</div>
            <div className="stats-label">신문사</div>
          </div>
        </div>
      </div>

      {/* 카테고리별 분포 */}
      <div className="trend-section">
        <h3>카테고리별 분포</h3>
        {categoryData && <CategoryPieChart data={categoryData} />}
      </div>

      {/* 신문사별 기사 수 */}
      <div className="trend-section">
        <h3>신문사별 기사 수</h3>
        {sourceData && <SourceBarChart data={sourceData} />}
      </div>

      {/* 최근 7일 기사 트렌드 */}
      <div className="trend-section">
        <h3>최근 7일 기사 트렌드</h3>
        {weeklyData && <WeeklyLineChart data={weeklyData} />}
      </div>
    </div>
  )
}

export default React.memo(StatisticsTab)
```

---

## 📦 구현 시 필요한 작업

### 1. 패키지 설치
```bash
npm install chart.js react-chartjs-2
```

### 2. 타입 정의 파일 추가
- `src/types/trend.types.ts`
- `src/types/chart.types.ts`

### 3. 컴포넌트 생성
- `src/components/TrendPanel/`
- `src/components/Charts/`

### 4. App.tsx 수정
- 트렌드 패널 상태 추가
- 네비게이션에 트렌드 버튼 추가

### 5. CSS 확인
기존 `style.css`에 트렌드 패널 관련 스타일이 이미 정의되어 있으므로 추가 CSS 작업은 최소화됩니다.

---

## 🔗 참고 자료

- **Chart.js 공식 문서**: https://www.chartjs.org/
- **react-chartjs-2 문서**: https://react-chartjs-2.js.org/
- **원본 구현**: `C:\VibeCoding\document-test\docs\static\js\main.js`
- **원본 HTML**: `C:\VibeCoding\document-test\docs\index.html`

---

## 📝 구현 우선순위 (향후 참고)

1. **Phase 1**: TrendPanel 컴포넌트 기본 구조 및 탭 전환
2. **Phase 2**: TrendTab - 키워드 클라우드 구현
3. **Phase 3**: StatisticsTab - 3개 차트 구현
4. **Phase 4**: 데이터 로딩 로직 및 에러 처리
5. **Phase 5**: 애니메이션 및 사용자 경험 개선

---

**이 문서는 향후 기능 구현 시 참고용으로 작성되었습니다.**
