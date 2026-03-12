import type { WinnerLetters } from '@/types/database'

/** Convert form value to DB value: 'none' → null */
export function lettersToDB(val: string): WinnerLetters | null {
  return val === 'none' ? null : (val as WinnerLetters)
}

/** Convert DB value to form value: null → 'none' */
export function lettersToForm(val: WinnerLetters | null): string {
  return val ?? 'none'
}

/** Display label for letters value */
export function lettersLabel(val: WinnerLetters | null): string {
  return val ?? 'Keine'
}
