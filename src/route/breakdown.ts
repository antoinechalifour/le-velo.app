import type { SegmentCategory } from './segmentCategory'

export type BreakdownEntry = {
  category: SegmentCategory
  distanceM: number
  share: number
}
