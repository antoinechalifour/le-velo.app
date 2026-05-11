export type BrouterMessage = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
]

export type BrouterTrackProps = {
  creator?: string
  name?: string
  'track-length'?: string
  'filtered ascend'?: string
  'plain-ascend'?: string
  'total-time'?: string
  'total-energy'?: string
  cost?: string
  messages?: BrouterMessage[]
  times?: number[]
}
