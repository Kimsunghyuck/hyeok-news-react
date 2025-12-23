/**
 * BookmarkModal 컴포넌트 타입 정의
 */

import type { Bookmark } from '../../types/bookmark.types'

export interface BookmarkModalProps {
  isOpen: boolean
  onClose: () => void
  bookmarks: Bookmark[]
  onRemoveBookmark: (bookmarkId: string) => void
}
