import { z } from 'zod'

export const tournamentSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  slug: z.string().min(1, 'Slug ist erforderlich').regex(/^[a-z0-9-]+$/, 'Nur Kleinbuchstaben, Zahlen und Bindestriche'),
  description: z.string().optional(),
})
export type TournamentFormData = z.infer<typeof tournamentSchema>

export const roundSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  round_order: z.coerce.number().int().min(1, 'Reihenfolge ab 1'),
  deadline_at: z.string().default(''),
})
export type RoundFormData = z.infer<typeof roundSchema>

export const matchSchema = z.object({
  match_number: z.coerce.number().int().min(1, 'Match-Nummer ab 1'),
  player_a: z.string().min(1, 'Spieler A ist erforderlich'),
  player_b: z.string().min(1, 'Spieler B ist erforderlich'),
})
export type MatchFormData = z.infer<typeof matchSchema>

export const resultSchema = z.object({
  winner: z.string().min(1, 'Gewinner auswählen'),
  winner_letters: z.enum(['none', 'S', 'SL', 'SLV', 'SLVS'], {
    errorMap: () => ({ message: 'Buchstaben auswählen' }),
  }),
})
export type ResultFormData = z.infer<typeof resultSchema>
