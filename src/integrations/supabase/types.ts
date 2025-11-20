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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string
          created_at: string | null
          excerpt: string
          featured_image_url: string | null
          id: string
          meta_description: string
          meta_title: string
          published: boolean | null
          published_at: string | null
          slug: string
          tags: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          excerpt: string
          featured_image_url?: string | null
          id?: string
          meta_description: string
          meta_title: string
          published?: boolean | null
          published_at?: string | null
          slug: string
          tags?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string
          featured_image_url?: string | null
          id?: string
          meta_description?: string
          meta_title?: string
          published?: boolean | null
          published_at?: string | null
          slug?: string
          tags?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          active: boolean | null
          business_name: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          pipeline_stage: string
          setup_fee_cents: number | null
          source_submission_id: string | null
          website_url: string | null
        }
        Insert: {
          active?: boolean | null
          business_name?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          pipeline_stage?: string
          setup_fee_cents?: number | null
          source_submission_id?: string | null
          website_url?: string | null
        }
        Update: {
          active?: boolean | null
          business_name?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          pipeline_stage?: string
          setup_fee_cents?: number | null
          source_submission_id?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_source_submission_id_fkey"
            columns: ["source_submission_id"]
            isOneToOne: false
            referencedRelation: "contact_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          estimate_high: number | null
          estimate_low: number | null
          id: string
          name: string
          notes: string | null
          project_description: string
          selected_options: Json | null
          status: string
          website_url: string | null
          wish: string
        }
        Insert: {
          created_at?: string | null
          email: string
          estimate_high?: number | null
          estimate_low?: number | null
          id?: string
          name: string
          notes?: string | null
          project_description: string
          selected_options?: Json | null
          status?: string
          website_url?: string | null
          wish: string
        }
        Update: {
          created_at?: string | null
          email?: string
          estimate_high?: number | null
          estimate_low?: number | null
          id?: string
          name?: string
          notes?: string | null
          project_description?: string
          selected_options?: Json | null
          status?: string
          website_url?: string | null
          wish?: string
        }
        Relationships: []
      }
      project_intakes: {
        Row: {
          budget_range: string | null
          business_name: string | null
          client_id: string | null
          content_readiness: string | null
          created_at: string | null
          design_examples: string | null
          email: string
          fit_status: string
          goals: string | null
          id: string
          kanban_stage: string
          name: string
          pages_estimate: number | null
          project_description: string | null
          raw_conversation: Json | null
          raw_summary: string | null
          source: string | null
          special_needs: string | null
          suggested_tier: string | null
          tech_comfort: string | null
          timeline: string | null
        }
        Insert: {
          budget_range?: string | null
          business_name?: string | null
          client_id?: string | null
          content_readiness?: string | null
          created_at?: string | null
          design_examples?: string | null
          email: string
          fit_status?: string
          goals?: string | null
          id?: string
          kanban_stage?: string
          name: string
          pages_estimate?: number | null
          project_description?: string | null
          raw_conversation?: Json | null
          raw_summary?: string | null
          source?: string | null
          special_needs?: string | null
          suggested_tier?: string | null
          tech_comfort?: string | null
          timeline?: string | null
        }
        Update: {
          budget_range?: string | null
          business_name?: string | null
          client_id?: string | null
          content_readiness?: string | null
          created_at?: string | null
          design_examples?: string | null
          email?: string
          fit_status?: string
          goals?: string | null
          id?: string
          kanban_stage?: string
          name?: string
          pages_estimate?: number | null
          project_description?: string | null
          raw_conversation?: Json | null
          raw_summary?: string | null
          source?: string | null
          special_needs?: string | null
          suggested_tier?: string | null
          tech_comfort?: string | null
          timeline?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_intakes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      update_requests: {
        Row: {
          actual_minutes: number | null
          ai_confidence: string | null
          ai_explanation: string | null
          ai_price_cents: number | null
          ai_type: string | null
          attachments: Json | null
          client_id: string
          completed_at: string | null
          created_at: string | null
          description: string
          estimated_minutes: number | null
          id: string
          internal_notes: string | null
          priority: string
          quoted_price_cents: number | null
          size_tier: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_minutes?: number | null
          ai_confidence?: string | null
          ai_explanation?: string | null
          ai_price_cents?: number | null
          ai_type?: string | null
          attachments?: Json | null
          client_id: string
          completed_at?: string | null
          created_at?: string | null
          description: string
          estimated_minutes?: number | null
          id?: string
          internal_notes?: string | null
          priority?: string
          quoted_price_cents?: number | null
          size_tier?: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_minutes?: number | null
          ai_confidence?: string | null
          ai_explanation?: string | null
          ai_price_cents?: number | null
          ai_type?: string | null
          attachments?: Json | null
          client_id?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string
          estimated_minutes?: number | null
          id?: string
          internal_notes?: string | null
          priority?: string
          quoted_price_cents?: number | null
          size_tier?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "update_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      emails_match: {
        Args: { email1: string; email2: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "client"
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
      app_role: ["admin", "client"],
    },
  },
} as const
