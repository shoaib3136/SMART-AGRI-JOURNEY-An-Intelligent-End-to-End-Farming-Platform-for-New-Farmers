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
      buyer_inquiries: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          is_read: boolean | null
          listing_id: string
          listing_type: string
          message: string | null
          seller_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          listing_id: string
          listing_type: string
          message?: string | null
          seller_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          listing_id?: string
          listing_type?: string
          message?: string | null
          seller_id?: string
        }
        Relationships: []
      }
      crop_predictions: {
        Row: {
          confidence: number | null
          created_at: string | null
          humidity: number | null
          id: string
          nitrogen: number
          ph_level: number
          phosphorus: number
          potassium: number
          rainfall: number | null
          recommended_crop: string | null
          season: string | null
          temperature: number | null
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          humidity?: number | null
          id?: string
          nitrogen: number
          ph_level: number
          phosphorus: number
          potassium: number
          rainfall?: number | null
          recommended_crop?: string | null
          season?: string | null
          temperature?: number | null
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          humidity?: number | null
          id?: string
          nitrogen?: number
          ph_level?: number
          phosphorus?: number
          potassium?: number
          rainfall?: number | null
          recommended_crop?: string | null
          season?: string | null
          temperature?: number | null
          user_id?: string
        }
        Relationships: []
      }
      disease_detections: {
        Row: {
          causes: string | null
          confidence: number | null
          created_at: string | null
          crop_type: string | null
          disease_name: string | null
          id: string
          image_url: string | null
          prevention: string | null
          severity: string | null
          treatment: string | null
          user_id: string
        }
        Insert: {
          causes?: string | null
          confidence?: number | null
          created_at?: string | null
          crop_type?: string | null
          disease_name?: string | null
          id?: string
          image_url?: string | null
          prevention?: string | null
          severity?: string | null
          treatment?: string | null
          user_id: string
        }
        Update: {
          causes?: string | null
          confidence?: number | null
          created_at?: string | null
          crop_type?: string | null
          disease_name?: string | null
          id?: string
          image_url?: string | null
          prevention?: string | null
          severity?: string | null
          treatment?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fertilizer_recommendations: {
        Row: {
          application_schedule: string | null
          created_at: string | null
          crop_type: string
          id: string
          nitrogen_level: number
          phosphorus_level: number
          potassium_level: number
          quantity_per_acre: number | null
          recommended_fertilizer: string | null
          user_id: string
        }
        Insert: {
          application_schedule?: string | null
          created_at?: string | null
          crop_type: string
          id?: string
          nitrogen_level: number
          phosphorus_level: number
          potassium_level: number
          quantity_per_acre?: number | null
          recommended_fertilizer?: string | null
          user_id: string
        }
        Update: {
          application_schedule?: string | null
          created_at?: string | null
          crop_type?: string
          id?: string
          nitrogen_level?: number
          phosphorus_level?: number
          potassium_level?: number
          quantity_per_acre?: number | null
          recommended_fertilizer?: string | null
          user_id?: string
        }
        Relationships: []
      }
      inquiry_messages: {
        Row: {
          created_at: string
          id: string
          inquiry_id: string
          message: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          inquiry_id: string
          message: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          inquiry_id?: string
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_messages_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "buyer_inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      lands: {
        Row: {
          area_acres: number
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          location: string
          owner_id: string
          price_per_month: number
          soil_type: string | null
          title: string
          updated_at: string | null
          water_availability: string | null
        }
        Insert: {
          area_acres: number
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          location: string
          owner_id: string
          price_per_month: number
          soil_type?: string | null
          title: string
          updated_at?: string | null
          water_availability?: string | null
        }
        Update: {
          area_acres?: number
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          location?: string
          owner_id?: string
          price_per_month?: number
          soil_type?: string | null
          title?: string
          updated_at?: string | null
          water_availability?: string | null
        }
        Relationships: []
      }
      marketplace_listings: {
        Row: {
          created_at: string | null
          crop_name: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          location: string | null
          price_per_unit: number
          quantity: number
          seller_id: string
          unit: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          crop_name: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          location?: string | null
          price_per_unit: number
          quantity: number
          seller_id: string
          unit?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          crop_name?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          location?: string | null
          price_per_unit?: number
          quantity?: number
          seller_id?: string
          unit?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          listing_id: string
          payment_intent_id: string | null
          payment_status: string
          quantity: number
          seller_id: string
          status: string
          total_amount: number
          unit: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          listing_id: string
          payment_intent_id?: string | null
          payment_status?: string
          quantity: number
          seller_id: string
          status?: string
          total_amount: number
          unit: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          listing_id?: string
          payment_intent_id?: string | null
          payment_status?: string
          quantity?: number
          seller_id?: string
          status?: string
          total_amount?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "farmer" | "landowner" | "buyer"
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
      app_role: ["farmer", "landowner", "buyer"],
    },
  },
} as const
