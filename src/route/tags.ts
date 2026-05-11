import type { SegmentCategory } from './segmentCategory'

export function parseTags(s: string): Record<string, string> {
  const out: Record<string, string> = {}
  if (!s) return out
  for (const pair of s.split(/\s+/)) {
    if (!pair) continue
    const idx = pair.indexOf('=')
    if (idx > 0) {
      out[pair.slice(0, idx)] = pair.slice(idx + 1)
    }
  }
  return out
}

export function classifyTags(tagsStr: string): SegmentCategory {
  const tags = parseTags(tagsStr)
  const highway = tags.highway

  if (highway === 'cycleway') return 'cycleway'

  if (
    tags.bicycle === 'designated' &&
    (highway === 'path' || highway === 'footway' || highway === 'pedestrian')
  ) {
    return 'shared-bike'
  }

  const cyclewayLane =
    tags.cycleway === 'lane' ||
    tags.cycleway === 'track' ||
    tags['cycleway:left'] === 'lane' ||
    tags['cycleway:right'] === 'lane' ||
    tags['cycleway:both'] === 'lane'
  if (cyclewayLane) return 'shared-bike'

  if (
    highway === 'motorway' ||
    highway === 'motorway_link' ||
    highway === 'trunk' ||
    highway === 'trunk_link'
  ) {
    return 'highway-fast'
  }

  if (
    highway === 'primary' ||
    highway === 'primary_link' ||
    highway === 'secondary' ||
    highway === 'secondary_link'
  ) {
    return 'major-road'
  }

  if (highway === 'tertiary' || highway === 'tertiary_link') return 'minor-road'

  if (
    highway === 'residential' ||
    highway === 'living_street' ||
    highway === 'unclassified' ||
    highway === 'service' ||
    highway === 'track' ||
    highway === 'path' ||
    highway === 'footway' ||
    highway === 'pedestrian' ||
    highway === 'bridleway'
  ) {
    return 'quiet-road'
  }

  return 'unknown'
}
