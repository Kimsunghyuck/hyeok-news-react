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
