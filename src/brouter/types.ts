import { z } from 'zod'

export const brouterMessageSchema = z.tuple([
  z.string(),
  z.string(),
  z.string(),
  z.string(),
  z.string(),
  z.string(),
  z.string(),
])

export const brouterTrackPropsSchema = z.object({
  creator: z.string().optional(),
  name: z.string().optional(),
  'track-length': z.string().optional(),
  'filtered ascend': z.string().optional(),
  'plain-ascend': z.string().optional(),
  'total-time': z.string().optional(),
  'total-energy': z.string().optional(),
  cost: z.string().optional(),
  messages: z.array(brouterMessageSchema).optional(),
  times: z.array(z.number()).optional(),
})

export const brouterFeatureSchema = z.object({
  type: z.literal('Feature'),
  geometry: z.object({
    type: z.literal('LineString'),
    coordinates: z.array(z.array(z.number())),
  }),
  properties: brouterTrackPropsSchema,
})

export const brouterResponseSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(brouterFeatureSchema),
})

export type BrouterMessage = z.infer<typeof brouterMessageSchema>
export type BrouterTrackProps = z.infer<typeof brouterTrackPropsSchema>
export type BrouterFeature = z.infer<typeof brouterFeatureSchema>
export type BrouterResponse = z.infer<typeof brouterResponseSchema>
