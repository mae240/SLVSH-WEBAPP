import { describe, expect, it } from 'vitest'
import { lettersToDB, lettersToForm, lettersLabel } from './letters'

describe('lettersToDB', () => {
  it("maps 'none' to null (clean win, zero letters)", () => {
    expect(lettersToDB('none')).toBeNull()
  })

  it('passes letter values through', () => {
    expect(lettersToDB('S')).toBe('S')
    expect(lettersToDB('SLVS')).toBe('SLVS')
  })
})

describe('lettersToForm', () => {
  it("maps null back to 'none'", () => {
    expect(lettersToForm(null)).toBe('none')
  })

  it('passes letter values through', () => {
    expect(lettersToForm('SL')).toBe('SL')
  })

  it('round-trips every form value', () => {
    for (const val of ['none', 'S', 'SL', 'SLV', 'SLVS']) {
      expect(lettersToForm(lettersToDB(val))).toBe(val)
    }
  })
})

describe('lettersLabel', () => {
  it("shows 'Clean' for a zero-letter win", () => {
    expect(lettersLabel(null)).toBe('Clean')
  })

  it('shows the letters otherwise', () => {
    expect(lettersLabel('SLV')).toBe('SLV')
  })
})
