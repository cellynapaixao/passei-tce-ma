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
  public: {
    Tables: {
      exam_editions: {
        Row: {
          config: Json
          created_at: string
          id: string
          name: string
          official_url: string | null
          organizer: string
          slug: string
          year: number
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          name: string
          official_url?: string | null
          organizer: string
          slug: string
          year: number
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          name?: string
          official_url?: string | null
          organizer?: string
          slug?: string
          year?: number
        }
        Relationships: []
      }
      positions: {
        Row: {
          cargo: Database["public"]["Enums"]["cargo_enum"]
          code: string
          config: Json
          created_at: string
          edition_id: string
          especialidade: string
          exam_date: string | null
          formacao: string | null
          full_name: string
          id: string
        }
        Insert: {
          cargo: Database["public"]["Enums"]["cargo_enum"]
          code: string
          config?: Json
          created_at?: string
          edition_id: string
          especialidade: string
          exam_date?: string | null
          formacao?: string | null
          full_name: string
          id?: string
        }
        Update: {
          cargo?: Database["public"]["Enums"]["cargo_enum"]
          code?: string
          config?: Json
          created_at?: string
          edition_id?: string
          especialidade?: string
          exam_date?: string | null
          formacao?: string | null
          full_name?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "exam_editions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_attempts: {
        Row: {
          algorithm_version: string
          client_attempt_id: string
          confidence: number | null
          created_at: string
          error_type: string | null
          id: string
          is_correct: boolean
          mode: Database["public"]["Enums"]["session_mode_enum"]
          question_id: string
          response_time_ms: number | null
          selected_key: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          algorithm_version?: string
          client_attempt_id: string
          confidence?: number | null
          created_at?: string
          error_type?: string | null
          id?: string
          is_correct: boolean
          mode?: Database["public"]["Enums"]["session_mode_enum"]
          question_id: string
          response_time_ms?: number | null
          selected_key?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          algorithm_version?: string
          client_attempt_id?: string
          confidence?: number | null
          created_at?: string
          error_type?: string | null
          id?: string
          is_correct?: boolean
          mode?: Database["public"]["Enums"]["session_mode_enum"]
          question_id?: string
          response_time_ms?: number | null
          selected_key?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_attempts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_position_matches: {
        Row: {
          aderencia: number
          edital_ref: string | null
          position_id: string
          question_id: string
        }
        Insert: {
          aderencia?: number
          edital_ref?: string | null
          position_id: string
          question_id: string
        }
        Update: {
          aderencia?: number
          edital_ref?: string | null
          position_id?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_position_matches_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_position_matches_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_relationships: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          kind: string
          origin_id: string
          target_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind: string
          origin_id: string
          target_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          origin_id?: string
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_relationships_origin_id_fkey"
            columns: ["origin_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_relationships_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_syllabus_matches: {
        Row: {
          question_id: string
          syllabus_node_id: string
          weight: number
        }
        Insert: {
          question_id: string
          syllabus_node_id: string
          weight?: number
        }
        Update: {
          question_id?: string
          syllabus_node_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "question_syllabus_matches_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_syllabus_matches_syllabus_node_id_fkey"
            columns: ["syllabus_node_id"]
            isOneToOne: false
            referencedRelation: "syllabus_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          alternatives: Json
          correct_key: string | null
          created_at: string
          created_by: string | null
          distractor_rationales: Json
          exam_block: Database["public"]["Enums"]["exam_block_enum"]
          exam_format: Database["public"]["Enums"]["exam_format_enum"]
          explanation: string | null
          id: string
          published_at: string | null
          question_type: Database["public"]["Enums"]["question_type_enum"]
          question_weight: number
          review_status: Database["public"]["Enums"]["review_status_enum"]
          source_reference: Json
          statement: string
          updated_at: string
        }
        Insert: {
          alternatives?: Json
          correct_key?: string | null
          created_at?: string
          created_by?: string | null
          distractor_rationales?: Json
          exam_block: Database["public"]["Enums"]["exam_block_enum"]
          exam_format: Database["public"]["Enums"]["exam_format_enum"]
          explanation?: string | null
          id?: string
          published_at?: string | null
          question_type: Database["public"]["Enums"]["question_type_enum"]
          question_weight?: number
          review_status?: Database["public"]["Enums"]["review_status_enum"]
          source_reference?: Json
          statement: string
          updated_at?: string
        }
        Update: {
          alternatives?: Json
          correct_key?: string | null
          created_at?: string
          created_by?: string | null
          distractor_rationales?: Json
          exam_block?: Database["public"]["Enums"]["exam_block_enum"]
          exam_format?: Database["public"]["Enums"]["exam_format_enum"]
          explanation?: string | null
          id?: string
          published_at?: string | null
          question_type?: Database["public"]["Enums"]["question_type_enum"]
          question_weight?: number
          review_status?: Database["public"]["Enums"]["review_status_enum"]
          source_reference?: Json
          statement?: string
          updated_at?: string
        }
        Relationships: []
      }
      review_recommendations: {
        Row: {
          consumed_at: string | null
          created_at: string
          id: string
          priority: number
          reason: string | null
          source_attempt_id: string | null
          target_question_id: string
          user_id: string
        }
        Insert: {
          consumed_at?: string | null
          created_at?: string
          id?: string
          priority?: number
          reason?: string | null
          source_attempt_id?: string | null
          target_question_id: string
          user_id: string
        }
        Update: {
          consumed_at?: string | null
          created_at?: string
          id?: string
          priority?: number
          reason?: string | null
          source_attempt_id?: string | null
          target_question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_recommendations_source_attempt_id_fkey"
            columns: ["source_attempt_id"]
            isOneToOne: false
            referencedRelation: "question_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_recommendations_target_question_id_fkey"
            columns: ["target_question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      srs_states: {
        Row: {
          algorithm_version: string
          due_at: string
          easiness: number
          interval_days: number
          last_grade: number | null
          question_id: string
          repetitions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          algorithm_version?: string
          due_at?: string
          easiness?: number
          interval_days?: number
          last_grade?: number | null
          question_id: string
          repetitions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          algorithm_version?: string
          due_at?: string
          easiness?: number
          interval_days?: number
          last_grade?: number | null
          question_id?: string
          repetitions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "srs_states_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      study_profile_checkins: {
        Row: {
          created_at: string
          id: string
          kind: string
          payload: Json
          question_index: number
          session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          payload?: Json
          question_index: number
          session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          payload?: Json
          question_index?: number
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_profile_checkins_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          correct_count: number
          ended_at: string | null
          id: string
          mode: Database["public"]["Enums"]["session_mode_enum"]
          position_id: string | null
          question_count: number
          started_at: string
          user_id: string
        }
        Insert: {
          correct_count?: number
          ended_at?: string | null
          id?: string
          mode?: Database["public"]["Enums"]["session_mode_enum"]
          position_id?: string | null
          question_count?: number
          started_at?: string
          user_id: string
        }
        Update: {
          correct_count?: number
          ended_at?: string | null
          id?: string
          mode?: Database["public"]["Enums"]["session_mode_enum"]
          position_id?: string | null
          question_count?: number
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      syllabus_nodes: {
        Row: {
          code: string
          created_at: string
          edition_id: string
          exam_block: Database["public"]["Enums"]["exam_block_enum"]
          id: string
          ordering: number
          parent_id: string | null
          title: string
        }
        Insert: {
          code: string
          created_at?: string
          edition_id: string
          exam_block: Database["public"]["Enums"]["exam_block_enum"]
          id?: string
          ordering?: number
          parent_id?: string | null
          title: string
        }
        Update: {
          code?: string
          created_at?: string
          edition_id?: string
          exam_block?: Database["public"]["Enums"]["exam_block_enum"]
          id?: string
          ordering?: number
          parent_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "syllabus_nodes_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "exam_editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syllabus_nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "syllabus_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          font_scale: number
          high_contrast: boolean
          preferred_position_id: string | null
          reduce_motion: boolean
          tts_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          font_scale?: number
          high_contrast?: boolean
          preferred_position_id?: string | null
          reduce_motion?: boolean
          tts_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          font_scale?: number
          high_contrast?: boolean
          preferred_position_id?: string | null
          reduce_motion?: boolean
          tts_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_preferred_position_id_fkey"
            columns: ["preferred_position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      srs_sm2_next: {
        Args: {
          p_easiness: number
          p_grade: number
          p_interval_days: number
          p_repetitions: number
        }
        Returns: {
          due_at: string
          easiness: number
          interval_days: number
          repetitions: number
        }[]
      }
      submit_attempt: {
        Args: {
          p_client_attempt_id: string
          p_confidence: number
          p_mode: Database["public"]["Enums"]["session_mode_enum"]
          p_question_id: string
          p_response_time_ms: number
          p_selected_key: string
          p_session_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "curator" | "user"
      cargo_enum: "analista" | "auditor" | "tecnico"
      exam_block_enum: "gerais" | "especificos"
      exam_format_enum: "objetiva" | "discursiva"
      question_type_enum: "multipla_escolha_5" | "certo_errado" | "discursiva"
      review_status_enum:
        | "draft"
        | "in_review"
        | "approved"
        | "published"
        | "retired"
      session_mode_enum: "geral" | "foco" | "revisao" | "diagnostico"
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
  public: {
    Enums: {
      app_role: ["admin", "curator", "user"],
      cargo_enum: ["analista", "auditor", "tecnico"],
      exam_block_enum: ["gerais", "especificos"],
      exam_format_enum: ["objetiva", "discursiva"],
      question_type_enum: ["multipla_escolha_5", "certo_errado", "discursiva"],
      review_status_enum: [
        "draft",
        "in_review",
        "approved",
        "published",
        "retired",
      ],
      session_mode_enum: ["geral", "foco", "revisao", "diagnostico"],
    },
  },
} as const
