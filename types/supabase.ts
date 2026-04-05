export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      daily_lessons: {
        Row: {
          created_at: string
          day: number
          id: number
          listening_text: string
          topic: string
          vocabulary: Json
          writing_prompt: string
        }
        Insert: {
          created_at?: string
          day: number
          id?: number
          listening_text?: string
          topic: string
          vocabulary?: Json
          writing_prompt?: string
        }
        Update: {
          created_at?: string
          day?: number
          id?: number
          listening_text?: string
          topic?: string
          vocabulary?: Json
          writing_prompt?: string
        }
        Relationships: []
      }
      progress: {
        Row: {
          completed_at: string | null
          created_at: string
          day_number: number
          id: string
          listening_done: boolean
          speaking_done: boolean
          telegram_id: number
          updated_at: string
          vocab_done: boolean
          writing_done: boolean
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          day_number: number
          id?: string
          listening_done?: boolean
          speaking_done?: boolean
          telegram_id: number
          updated_at?: string
          vocab_done?: boolean
          writing_done?: boolean
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          day_number?: number
          id?: string
          listening_done?: boolean
          speaking_done?: boolean
          telegram_id?: number
          updated_at?: string
          vocab_done?: boolean
          writing_done?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "progress_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      speaking_attempts: {
        Row: {
          created_at: string
          day_number: number
          expected_text: string
          feedback: string | null
          id: string
          score: number | null
          telegram_id: number
          transcription: string
        }
        Insert: {
          created_at?: string
          day_number: number
          expected_text?: string
          feedback?: string | null
          id?: string
          score?: number | null
          telegram_id: number
          transcription?: string
        }
        Update: {
          created_at?: string
          day_number?: number
          expected_text?: string
          feedback?: string | null
          id?: string
          score?: number | null
          telegram_id?: number
          transcription?: string
        }
        Relationships: [
          {
            foreignKeyName: "speaking_attempts_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          current_day: number
          first_name: string
          language_code: string | null
          last_active: string
          last_name: string | null
          started_at: string
          streak: number
          telegram_id: number
          username: string | null
        }
        Insert: {
          created_at?: string
          current_day?: number
          first_name?: string
          language_code?: string | null
          last_active?: string
          last_name?: string | null
          started_at?: string
          streak?: number
          telegram_id: number
          username?: string | null
        }
        Update: {
          created_at?: string
          current_day?: number
          first_name?: string
          language_code?: string | null
          last_active?: string
          last_name?: string | null
          started_at?: string
          streak?: number
          telegram_id?: number
          username?: string | null
        }
        Relationships: []
      }
      writing_attempts: {
        Row: {
          corrected_text: string
          created_at: string
          day_number: number
          feedback: string | null
          id: string
          original_text: string
          score: number | null
          telegram_id: number
        }
        Insert: {
          corrected_text?: string
          created_at?: string
          day_number: number
          feedback?: string | null
          id?: string
          original_text?: string
          score?: number | null
          telegram_id: number
        }
        Update: {
          corrected_text?: string
          created_at?: string
          day_number?: number
          feedback?: string | null
          id?: string
          original_text?: string
          score?: number | null
          telegram_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "writing_attempts_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
