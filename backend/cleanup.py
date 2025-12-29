#!/usr/bin/env python3
"""
뉴스 데이터 정리 스크립트

오래된 뉴스 데이터를 Supabase에서 삭제합니다.
GitHub Actions를 통해 매월 자동 실행됩니다.
"""

import sys
from datetime import datetime
from db_saver import delete_old_news, get_total_news_count


def main():
    """메인 정리 함수"""
    print("=" * 60)
    print("🧹 뉴스 데이터 정리 시작")
    print("=" * 60)
    print(f"⏰ 실행 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S KST')}")
    print()

    # 정리 전 데이터 개수 확인
    before_count = get_total_news_count()
    print(f"📊 정리 전 총 뉴스 개수: {before_count:,}개")
    print()

    # 30일 이상 된 뉴스 삭제
    print("🗑️  30일 이상 된 뉴스 삭제 중...")
    deleted_count = delete_old_news(days=-1)

    # 정리 후 데이터 개수 확인
    after_count = get_total_news_count()
    print()
    print(f"📊 정리 후 총 뉴스 개수: {after_count:,}개")
    print()

    # 결과 요약
    print("=" * 60)
    print("✅ 정리 완료")
    print("=" * 60)
    print(f"🗑️  삭제된 뉴스: {deleted_count:,}개")
    print(f"📦 남은 뉴스: {after_count:,}개")
    print(f"💾 절감된 데이터: 약 {deleted_count * 0.5:.1f} KB")
    print()

    # 삭제된 항목이 없으면 경고
    if deleted_count == 0:
        print("⚠️  삭제된 뉴스가 없습니다. 모든 뉴스가 30일 이내입니다.")
        return 0

    return 0


if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
