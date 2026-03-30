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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      article_submissions: {
        Row: {
          author_email: string
          author_name: string
          created_at: string
          id: string
          status: string
          summary: string
          title: string
        }
        Insert: {
          author_email: string
          author_name: string
          created_at?: string
          id?: string
          status?: string
          summary: string
          title: string
        }
        Update: {
          author_email?: string
          author_name?: string
          created_at?: string
          id?: string
          status?: string
          summary?: string
          title?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          content: string
          created_at: string
          excerpt: string
          featured_image: string | null
          id: string
          published: boolean | null
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          content: string
          created_at?: string
          excerpt: string
          featured_image?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          content?: string
          created_at?: string
          excerpt?: string
          featured_image?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          assistant_message: string
          created_at: string
          id: string
          redirect_url: string | null
          session_id: string
          user_message: string
          user_metadata: Json | null
        }
        Insert: {
          assistant_message: string
          created_at?: string
          id?: string
          redirect_url?: string | null
          session_id: string
          user_message: string
          user_metadata?: Json | null
        }
        Update: {
          assistant_message?: string
          created_at?: string
          id?: string
          redirect_url?: string | null
          session_id?: string
          user_message?: string
          user_metadata?: Json | null
        }
        Relationships: []
      }
      delivery_order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          quantity: number
          strain_id: string
          strain_name: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          quantity?: number
          strain_id: string
          strain_name: string
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          quantity?: number
          strain_id?: string
          strain_name?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "delivery_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_order_items_strain_id_fkey"
            columns: ["strain_id"]
            isOneToOne: false
            referencedRelation: "tenant_strains"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_orders: {
        Row: {
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          delivery_address: string
          delivery_fee: number
          delivery_lat: number | null
          delivery_lng: number | null
          distance_km: number | null
          driver_notes: string | null
          estimated_delivery_minutes: number | null
          id: string
          status: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address: string
          delivery_fee?: number
          delivery_lat?: number | null
          delivery_lng?: number | null
          distance_km?: number | null
          driver_notes?: string | null
          estimated_delivery_minutes?: number | null
          id?: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: string
          delivery_fee?: number
          delivery_lat?: number | null
          delivery_lng?: number | null
          distance_km?: number | null
          driver_notes?: string | null
          estimated_delivery_minutes?: number | null
          id?: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      demo_requests: {
        Row: {
          company: string
          created_at: string
          current_systems: string | null
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          preferred_date: string | null
          status: string
          store_count: string
          updated_at: string
        }
        Insert: {
          company: string
          created_at?: string
          current_systems?: string | null
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          preferred_date?: string | null
          status?: string
          store_count: string
          updated_at?: string
        }
        Update: {
          company?: string
          created_at?: string
          current_systems?: string | null
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          preferred_date?: string | null
          status?: string
          store_count?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_leads: {
        Row: {
          created_at: string
          email: string
          id: string
          promo_code: string | null
          source: string | null
          subscribed: boolean | null
          used: boolean
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          promo_code?: string | null
          source?: string | null
          subscribed?: boolean | null
          used?: boolean
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          promo_code?: string | null
          source?: string | null
          subscribed?: boolean | null
          used?: boolean
          used_at?: string | null
        }
        Relationships: []
      }
      plant_care_logs: {
        Row: {
          created_at: string
          details: Json | null
          id: string
          log_date: string
          log_type: string
          notes: string | null
          plant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          id?: string
          log_date?: string
          log_type: string
          notes?: string | null
          plant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          id?: string
          log_date?: string
          log_type?: string
          notes?: string | null
          plant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plant_care_logs_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      plant_environment_logs: {
        Row: {
          created_at: string
          humidity: number | null
          id: string
          light_hours: number | null
          logged_at: string
          notes: string | null
          nutrient_ppm: number | null
          ph_level: number | null
          plant_id: string
          temperature: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          humidity?: number | null
          id?: string
          light_hours?: number | null
          logged_at?: string
          notes?: string | null
          nutrient_ppm?: number | null
          ph_level?: number | null
          plant_id: string
          temperature?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          humidity?: number | null
          id?: string
          light_hours?: number | null
          logged_at?: string
          notes?: string | null
          nutrient_ppm?: number | null
          ph_level?: number | null
          plant_id?: string
          temperature?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plant_environment_logs_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      plants: {
        Row: {
          created_at: string
          growth_stage: string
          id: string
          image_url: string | null
          notes: string | null
          plant_name: string
          planted_date: string
          strain_name: string | null
          strain_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          growth_stage?: string
          id?: string
          image_url?: string | null
          notes?: string | null
          plant_name: string
          planted_date?: string
          strain_name?: string | null
          strain_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          growth_stage?: string
          id?: string
          image_url?: string | null
          notes?: string | null
          plant_name?: string
          planted_date?: string
          strain_name?: string | null
          strain_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      review_votes: {
        Row: {
          created_at: string | null
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "strain_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "strain_reviews_public"
            referencedColumns: ["id"]
          },
        ]
      }
      strain_journal: {
        Row: {
          consumption_method: string | null
          created_at: string
          dosage: string | null
          effects: Json | null
          id: string
          mood_after: number | null
          mood_before: number | null
          notes: string | null
          rating: number | null
          session_date: string
          strain_name: string
          strain_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          consumption_method?: string | null
          created_at?: string
          dosage?: string | null
          effects?: Json | null
          id?: string
          mood_after?: number | null
          mood_before?: number | null
          notes?: string | null
          rating?: number | null
          session_date?: string
          strain_name: string
          strain_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          consumption_method?: string | null
          created_at?: string
          dosage?: string | null
          effects?: Json | null
          id?: string
          mood_after?: number | null
          mood_before?: number | null
          notes?: string | null
          rating?: number | null
          session_date?: string
          strain_name?: string
          strain_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      strain_reviews: {
        Row: {
          cons: string[] | null
          created_at: string
          effects: Json | null
          helpful_count: number | null
          id: string
          pros: string[] | null
          rating: number
          review_text: string
          strain_name: string
          strain_type: string | null
          title: string
          updated_at: string
          user_id: string
          verified_purchase: boolean | null
        }
        Insert: {
          cons?: string[] | null
          created_at?: string
          effects?: Json | null
          helpful_count?: number | null
          id?: string
          pros?: string[] | null
          rating: number
          review_text: string
          strain_name: string
          strain_type?: string | null
          title: string
          updated_at?: string
          user_id: string
          verified_purchase?: boolean | null
        }
        Update: {
          cons?: string[] | null
          created_at?: string
          effects?: Json | null
          helpful_count?: number | null
          id?: string
          pros?: string[] | null
          rating?: number
          review_text?: string
          strain_name?: string
          strain_type?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          verified_purchase?: boolean | null
        }
        Relationships: []
      }
      strain_scans: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          identified_strain: string | null
          image_url: string | null
          strain_details: Json | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          identified_strain?: string | null
          image_url?: string | null
          strain_details?: Json | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          identified_strain?: string | null
          image_url?: string | null
          strain_details?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          cancelled_at: string | null
          created_at: string
          currency: string
          ends_at: string | null
          id: string
          payfast_token: string | null
          payment_id: string | null
          plan: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          cancelled_at?: string | null
          created_at?: string
          currency?: string
          ends_at?: string | null
          id?: string
          payfast_token?: string | null
          payment_id?: string | null
          plan?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          cancelled_at?: string | null
          created_at?: string
          currency?: string
          ends_at?: string | null
          id?: string
          payfast_token?: string | null
          payment_id?: string | null
          plan?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tenant_strains: {
        Row: {
          category: string
          cbd_max: number | null
          cbd_min: number | null
          created_at: string
          id: string
          in_stock: boolean | null
          notes: string | null
          price: number | null
          primary_effect: string | null
          primary_terpene: string | null
          secondary_terpene: string | null
          strain_name: string
          strain_type: string
          tenant_id: string
          thc_max: number | null
          thc_min: number | null
          updated_at: string
        }
        Insert: {
          category: string
          cbd_max?: number | null
          cbd_min?: number | null
          created_at?: string
          id?: string
          in_stock?: boolean | null
          notes?: string | null
          price?: number | null
          primary_effect?: string | null
          primary_terpene?: string | null
          secondary_terpene?: string | null
          strain_name: string
          strain_type?: string
          tenant_id: string
          thc_max?: number | null
          thc_min?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          cbd_max?: number | null
          cbd_min?: number | null
          created_at?: string
          id?: string
          in_stock?: boolean | null
          notes?: string | null
          price?: number | null
          primary_effect?: string | null
          primary_terpene?: string | null
          secondary_terpene?: string | null
          strain_name?: string
          strain_type?: string
          tenant_id?: string
          thc_max?: number | null
          thc_min?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_strains_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          branding_color: string | null
          branding_logo_url: string | null
          business_email: string
          business_name: string
          created_at: string
          embed_key: string
          id: string
          phone: string | null
          plan: string
          plan_price: number
          pos_system: string | null
          status: string
          store_count: number | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          branding_color?: string | null
          branding_logo_url?: string | null
          business_email: string
          business_name: string
          created_at?: string
          embed_key?: string
          id?: string
          phone?: string | null
          plan?: string
          plan_price?: number
          pos_system?: string | null
          status?: string
          store_count?: number | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          branding_color?: string | null
          branding_logo_url?: string | null
          business_email?: string
          business_name?: string
          created_at?: string
          embed_key?: string
          id?: string
          phone?: string | null
          plan?: string
          plan_price?: number
          pos_system?: string | null
          status?: string
          store_count?: number | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      tolerance_breaks: {
        Row: {
          created_at: string
          daily_logs: Json | null
          end_date: string | null
          id: string
          motivation_notes: string[] | null
          reason: string | null
          start_date: string
          status: string
          target_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_logs?: Json | null
          end_date?: string | null
          id?: string
          motivation_notes?: string[] | null
          reason?: string | null
          start_date?: string
          status?: string
          target_days: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_logs?: Json | null
          end_date?: string | null
          id?: string
          motivation_notes?: string[] | null
          reason?: string | null
          start_date?: string
          status?: string
          target_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      strain_reviews_public: {
        Row: {
          cons: string[] | null
          created_at: string | null
          effects: Json | null
          helpful_count: number | null
          id: string | null
          pros: string[] | null
          rating: number | null
          review_text: string | null
          strain_name: string | null
          strain_type: string | null
          title: string | null
          verified_purchase: boolean | null
        }
        Insert: {
          cons?: string[] | null
          created_at?: string | null
          effects?: Json | null
          helpful_count?: number | null
          id?: string | null
          pros?: string[] | null
          rating?: number | null
          review_text?: string | null
          strain_name?: string | null
          strain_type?: string | null
          title?: string | null
          verified_purchase?: boolean | null
        }
        Update: {
          cons?: string[] | null
          created_at?: string | null
          effects?: Json | null
          helpful_count?: number | null
          id?: string | null
          pros?: string[] | null
          rating?: number | null
          review_text?: string | null
          strain_name?: string | null
          strain_type?: string | null
          title?: string | null
          verified_purchase?: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_article_rate_limit: { Args: { p_email: string }; Returns: boolean }
      check_chat_rate_limit: {
        Args: { p_session_id: string }
        Returns: boolean
      }
      check_demo_rate_limit: { Args: { p_email: string }; Returns: boolean }
      check_email_rate_limit: { Args: { p_email: string }; Returns: boolean }
      get_my_embed_key: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_review_helpful: { Args: { p_review_id: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
