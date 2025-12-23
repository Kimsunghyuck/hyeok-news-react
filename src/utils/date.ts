/**
 * 날짜 관련 유틸리티 함수
 */

/**
 * 한국 시간(KST) 기준으로 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
export function getTodayKST(): string {
  const now = new Date()

  // UTC 시간에서 KST(UTC+9)로 변환
  const kstOffset = 9 * 60 // 9시간을 분으로 변환
  const kstTime = new Date(now.getTime() + kstOffset * 60 * 1000)

  const year = kstTime.getUTCFullYear()
  const month = String(kstTime.getUTCMonth() + 1).padStart(2, '0')
  const day = String(kstTime.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * 날짜 문자열을 YYYY.MM.DD 형식으로 포맷
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${year}.${month}.${day}`
}
