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
  const isInitialized = useRef(false)

  useEffect(() => {
    // Swiper 초기화 (한 번만)
    if (newsItems.length > 0 && !isInitialized.current) {
      // DOM이 준비될 때까지 약간 지연
      const timer = setTimeout(() => {
        const swiperElement = document.querySelector('.news-ticker-swiper')
        if (swiperElement && !swiperRef.current) {
          swiperRef.current = new Swiper('.news-ticker-swiper', {
            modules: [Autoplay],
            direction: 'vertical',
            loop: true,
            autoplay: {
              delay: 3000,
              disableOnInteraction: false
            },
            speed: 500,
            slidesPerView: 1,
            spaceBetween: 0
          })
          isInitialized.current = true
        }
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [newsItems])

  // 컴포넌트 언마운트 시에만 정리
  useEffect(() => {
    return () => {
      if (swiperRef.current) {
        swiperRef.current.destroy(true, true)
        swiperRef.current = null
        isInitialized.current = false
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
