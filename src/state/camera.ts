import { atom } from 'jotai'
import type { LngLat } from '../geo/lngLat'

export type CameraCommand =
  | { type: 'flyTo'; point: LngLat; zoom?: number }
  | { type: 'fitBounds'; bbox: [LngLat, LngLat] }

type CameraCommandWithNonce = CameraCommand & { nonce: number }

export const cameraCommandAtom = atom<CameraCommandWithNonce | null>(null)

export const pushCameraCommandAtom = atom(
  null,
  (_get, set, cmd: CameraCommand) => {
    set(cameraCommandAtom, { ...cmd, nonce: Date.now() })
  },
)
