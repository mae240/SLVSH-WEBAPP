import { describe, expect, it } from 'vitest'
import { loginSchema } from './login'
import { predictionSchema } from './prediction'
import { matchSchema, resultSchema, tournamentSchema } from './admin'

describe('loginSchema', () => {
  it('accepts a normal login', () => {
    expect(loginSchema.safeParse({ username: 'jesper', password: 'x' }).success).toBe(true)
  })

  it('trims surrounding whitespace from the username', () => {
    const parsed = loginSchema.parse({ username: '  jesper ', password: 'x' })
    expect(parsed.username).toBe('jesper')
  })

  it('rejects a whitespace-only username', () => {
    expect(loginSchema.safeParse({ username: '   ', password: 'x' }).success).toBe(false)
  })

  it('rejects empty fields', () => {
    expect(loginSchema.safeParse({ username: '', password: '' }).success).toBe(false)
  })
})

describe('predictionSchema', () => {
  it('accepts winner + letters', () => {
    const res = predictionSchema.safeParse({
      predicted_winner: 'Jesper',
      predicted_winner_letters: 'SLV',
    })
    expect(res.success).toBe(true)
  })

  it("accepts 'none' (clean-win prediction)", () => {
    const res = predictionSchema.safeParse({
      predicted_winner: 'Jesper',
      predicted_winner_letters: 'none',
    })
    expect(res.success).toBe(true)
  })

  it('rejects letters outside the S-L-V-S progression', () => {
    const res = predictionSchema.safeParse({
      predicted_winner: 'Jesper',
      predicted_winner_letters: 'SLVSH',
    })
    expect(res.success).toBe(false)
  })
})

describe('tournamentSchema', () => {
  it('accepts a lowercase slug', () => {
    expect(tournamentSchema.safeParse({ name: 'Kimbo 2026', slug: 'kimbo-2026' }).success).toBe(true)
  })

  it('rejects slugs with uppercase or spaces', () => {
    expect(tournamentSchema.safeParse({ name: 'X', slug: 'Kimbo 2026' }).success).toBe(false)
  })
})

describe('matchSchema', () => {
  it('coerces match_number from form string input', () => {
    const parsed = matchSchema.parse({ match_number: '3', player_a: 'A', player_b: 'B' })
    expect(parsed.match_number).toBe(3)
  })

  it('rejects a missing player', () => {
    expect(matchSchema.safeParse({ match_number: 1, player_a: 'A', player_b: '' }).success).toBe(false)
  })
})

describe('resultSchema', () => {
  it('accepts a winner with letters', () => {
    expect(resultSchema.safeParse({ winner: 'A', winner_letters: 'S' }).success).toBe(true)
  })

  it('rejects a result without winner', () => {
    expect(resultSchema.safeParse({ winner: '', winner_letters: 'S' }).success).toBe(false)
  })
})
