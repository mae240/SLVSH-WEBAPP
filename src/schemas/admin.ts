import { z } from 'zod'

export const tournamentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens only'),
  description: z.string().optional(),
})
export type TournamentFormData = z.infer<typeof tournamentSchema>

export const roundSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  round_order: z.coerce.number().int().min(1, 'Order starts at 1'),
  deadline_at: z.string().default(''),
})
export type RoundFormData = z.infer<typeof roundSchema>

export const matchSchema = z.object({
  match_number: z.coerce.number().int().min(1, 'Match number starts at 1'),
  player_a: z.string().min(1, 'Player A is required'),
  player_b: z.string().min(1, 'Player B is required'),
})
export type MatchFormData = z.infer<typeof matchSchema>

export const resultSchema = z.object({
  winner: z.string().min(1, 'Pick a winner'),
  winner_letters: z.enum(['none', 'S', 'SL', 'SLV', 'SLVS'], {
    errorMap: () => ({ message: 'Pick the letters' }),
  }),
})
export type ResultFormData = z.infer<typeof resultSchema>
