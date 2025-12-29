"""
Supabase 데이터베이스 저장 모듈
모든 날짜/시간은 한국 표준시(KST)로 저장됩니다.
"""

import os
from supabase import create_client, Client
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any

# Supabase 설정
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("❌ SUPABASE_URL 및 SUPABASE_SERVICE_KEY 환경 변수가 필요합니다!")

# Supabase 클라이언트 초기화
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# 한국 시간대 (KST = UTC+9)
KST = timezone(timedelta(hours=9))


def get_kst_now_str():
    """
    현재 한국 시간을 문자열로 반환합니다.
    ISO 8601 형식, timezone 정보 포함: 2025-12-29T09:00:00+09:00
    """
    return datetime.now(KST).isoformat()


def parse_scraped_at(scraped_at_str: str) -> str:
    """
    scraped_at 문자열을 KST로 변환합니다.

    Args:
        scraped_at_str: ISO 8601 형식의 날짜/시간 문자열

    Returns:
        KST timezone을 포함한 ISO 8601 문자열
    """
    try:
        # ISO 형식 파싱
        dt = datetime.fromisoformat(scraped_at_str.replace('Z', '+00:00'))

        # timezone이 없으면 KST로 간주
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=KST)
        else:
            # 다른 timezone이면 KST로 변환
            dt = dt.astimezone(KST)

        return dt.isoformat()
    except:
        # 파싱 실패시 현재 KST 시간 반환
        return get_kst_now_str()


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
            # scraped_at을 KST로 변환
            scraped_at = item.get("scraped_at")
            if scraped_at:
                scraped_at_kst = parse_scraped_at(scraped_at)
            else:
                scraped_at_kst = get_kst_now_str()

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
                "scraped_at": scraped_at_kst
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


def get_total_news_count() -> int:
    """
    전체 뉴스 개수 조회

    Returns:
        전체 뉴스 개수
    """
    try:
        result = supabase.table("news") \
            .select("id", count="exact") \
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
    # KST 기준으로 cutoff 날짜 계산
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
    print(f"현재 KST 시간: {get_kst_now_str()}")

    # 테스트 뉴스 저장
    test_news = [{
        "title": "테스트 뉴스 (KST)",
        "url": f"https://test.com/{datetime.now().timestamp()}",
        "date": datetime.now(KST).date().isoformat(),
        "category": "정치",
        "source": "테스트",
        "image_url": "https://via.placeholder.com/300x200",
        "scraped_at": get_kst_now_str()
    }]

    save_news_to_db(test_news)
    print("\n✅ Supabase 연결 성공!")
