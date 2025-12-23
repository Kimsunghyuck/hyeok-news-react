/**
 * NewsTicker 컴포넌트
 *
 * 네비게이션 바로 아래 표시되는 뉴스 티커
 * Swiper를 사용하여 세로 방향 자동 스크롤
 */

import React, { useEffect, useRef } from 'react'
import Swiper from 'swiper'
import { Autoplay } from 'swiper/modules'
import type { NewsItem } from '../../types/news.types'

interface NewsTickerProps {
  newsItems: NewsItem[]  // 티커에 표시할 뉴스 목록
}

const NewsTicker: React.FC<NewsTickerProps> = ({ newsItems }) => {
  const swiperRef = useRef<Swiper | null>(null)

  useEffect(() => {
    // newsItems가 없으면 아무것도 안 함
    if (newsItems.length === 0) return

    // DOM이 준비될 때까지 약간 지연
    const timer = setTimeout(() => {
      const swiperElement = document.querySelector('.news-ticker-swiper')

      if (swiperElement) {
        // 기존 Swiper가 있으면 파괴
        if (swiperRef.current) {
          swiperRef.current.destroy(true, true)
          swiperRef.current = null
        }

        // 새로운 Swiper 생성
        swiperRef.current = new Swiper('.news-ticker-swiper', {
          modules: [Autoplay],
          direction: 'vertical',
          loop: newsItems.length > 1, // 1개보다 많을 때만 loop
          autoplay: {
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false
          },
          speed: 500,
          slidesPerView: 1,
          spaceBetween: 0,
          allowTouchMove: false // 마우스/터치로 슬라이드 이동 방지
        })

        console.log('✅ Swiper 초기화 완료:', newsItems.length, '개 아이템')
      }
    }, 150)

    return () => {
      clearTimeout(timer)
    }
  }, [newsItems])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (swiperRef.current) {
        swiperRef.current.destroy(true, true)
        swiperRef.current = null
      }
    }
  }, [])

  if (newsItems.length === 0) {
    return null
  }

  // 카테고리 영문명 매핑
  const getCategoryClass = (category: string): string => {
    const categoryMap: Record<string, string> = {
      '정치': 'politics',
      '스포츠': 'sports',
      '경제': 'economy',
      '사회': 'society',
      '국제': 'international',
      '문화': 'culture'
    }
    return categoryMap[category] || 'politics'
  }

  return (
    <div className="news-ticker-banner">
      <div className="swiper news-ticker-swiper">
        <div className="swiper-wrapper">
          {newsItems.map((item) => (
            <div key={item.url} className="swiper-slide">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ticker-item"
              >
                <span className={`ticker-category ${getCategoryClass(item.category)}`}>
                  {item.category}
                </span>
                <span className="ticker-title">{item.title}</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default React.memo(NewsTicker)
