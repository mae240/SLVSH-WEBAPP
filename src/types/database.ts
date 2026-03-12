export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

// Letters the WINNER accumulated (loser always ends at SLVSH)
export type WinnerLetters = 'S' | 'SL' | 'SLV' | 'SLVS'
export type TournamentStatus = 'draft' | 'active' | 'finished'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          email: string | null
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id: string
          display_name: string
          email?: string | null
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          email?: string | null
          is_admin?: boolean
          created_at?: string
        }
        Relationships: []
      }
      tournaments: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          status: TournamentStatus
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          status?: TournamentStatus
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          status?: TournamentStatus
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tournaments_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      rounds: {
        Row: {
          id: string
          tournament_id: string
          name: string
          round_order: number
          deadline_at: string
          is_locked: boolean
          is_open: boolean
          created_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          name: string
          round_order: number
          deadline_at: string
          is_locked?: boolean
          is_open?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          name?: string
          round_order?: number
          deadline_at?: string
          is_locked?: boolean
          is_open?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'rounds_tournament_id_fkey'
            columns: ['tournament_id']
            isOneToOne: false
            referencedRelation: 'tournaments'
            referencedColumns: ['id']
          },
        ]
      }
      matches: {
        Row: {
          id: string
          tournament_id: string
          round_id: string
          match_number: number
          player_a: string
          player_b: string
          winner: string | null
          winner_letters: WinnerLetters | null
          is_finished: boolean
          created_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          round_id: string
          match_number: number
          player_a: string
          player_b: string
          winner?: string | null
          winner_letters?: WinnerLetters | null
          is_finished?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          round_id?: string
          match_number?: number
          player_a?: string
          player_b?: string
          winner?: string | null
          winner_letters?: WinnerLetters | null
          is_finished?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'matches_tournament_id_fkey'
            columns: ['tournament_id']
            isOneToOne: false
            referencedRelation: 'tournaments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'matches_round_id_fkey'
            columns: ['round_id']
            isOneToOne: false
            referencedRelation: 'rounds'
            referencedColumns: ['id']
          },
        ]
      }
      predictions: {
        Row: {
          id: string
          user_id: string
          tournament_id: string
          round_id: string
          match_id: string
          predicted_winner: string
          predicted_winner_letters: WinnerLetters | null
          submitted_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tournament_id: string
          round_id: string
          match_id: string
          predicted_winner: string
          predicted_winner_letters: WinnerLetters | null
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tournament_id?: string
          round_id?: string
          match_id?: string
          predicted_winner?: string
          predicted_winner_letters?: WinnerLetters | null
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'predictions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'predictions_tournament_id_fkey'
            columns: ['tournament_id']
            isOneToOne: false
            referencedRelation: 'tournaments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'predictions_round_id_fkey'
            columns: ['round_id']
            isOneToOne: false
            referencedRelation: 'rounds'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'predictions_match_id_fkey'
            columns: ['match_id']
            isOneToOne: false
            referencedRelation: 'matches'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      scored_predictions: {
        Row: {
          id: string
          user_id: string
          tournament_id: string
          round_id: string
          match_id: string
          predicted_winner: string
          predicted_winner_letters: WinnerLetters | null
          winner: string | null
          winner_letters: WinnerLetters | null
          is_finished: boolean
          user_display_name: string
          winner_points: number
          letters_points: number
          total_points: number
        }
        Relationships: []
      }
      leaderboard_totals: {
        Row: {
          user_id: string
          tournament_id: string
          user_display_name: string
          total_points: number
          matches_scored: number
          rank: number
        }
        Relationships: []
      }
      leaderboard_by_round: {
        Row: {
          user_id: string
          tournament_id: string
          round_id: string
          user_display_name: string
          total_points: number
          matches_scored: number
          rank: number
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
  }
}
