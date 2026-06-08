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
      activity_log: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string | null
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          addons: Json | null
          budget_range: string | null
          client_email: string
          client_name: string
          client_phone: string | null
          created_at: string
          estimated_total: number
          event_date: string
          event_end_date: string | null
          event_type: string | null
          guest_count: number
          id: string
          notes: string | null
          service_id: string | null
          special_requirements: string | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
          user_id: string | null
          venue: string | null
        }
        Insert: {
          addons?: Json | null
          budget_range?: string | null
          client_email: string
          client_name: string
          client_phone?: string | null
          created_at?: string
          estimated_total?: number
          event_date: string
          event_end_date?: string | null
          event_type?: string | null
          guest_count?: number
          id?: string
          notes?: string | null
          service_id?: string | null
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          user_id?: string | null
          venue?: string | null
        }
        Update: {
          addons?: Json | null
          budget_range?: string | null
          client_email?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string
          estimated_total?: number
          event_date?: string
          event_end_date?: string | null
          event_type?: string | null
          guest_count?: number
          id?: string
          notes?: string | null
          service_id?: string | null
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          user_id?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          category: string | null
          created_at: string
          current_quantity: number
          id: string
          minimum_quantity: number
          name: string
          notes: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_quantity?: number
          id?: string
          minimum_quantity?: number
          name: string
          notes?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          current_quantity?: number
          id?: string
          minimum_quantity?: number
          name?: string
          notes?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          amount_paid: number
          booking_id: string | null
          client_email: string
          client_name: string
          created_at: string
          due_date: string | null
          id: string
          invoice_number: string
          issued_at: string
          notes: string | null
          paid_at: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          updated_at: string
        }
        Insert: {
          amount?: number
          amount_paid?: number
          booking_id?: string | null
          client_email: string
          client_name: string
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          issued_at?: string
          notes?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          amount_paid?: number
          booking_id?: string | null
          client_email?: string
          client_name?: string
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string
          notes?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quotations: {
        Row: {
          amount: number
          booking_id: string | null
          client_email: string
          client_name: string
          created_at: string
          id: string
          notes: string | null
          quote_number: string
          sent_at: string | null
          status: Database["public"]["Enums"]["quotation_status"]
          updated_at: string
        }
        Insert: {
          amount?: number
          booking_id?: string | null
          client_email: string
          client_name: string
          created_at?: string
          id?: string
          notes?: string | null
          quote_number: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["quotation_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          client_email?: string
          client_name?: string
          created_at?: string
          id?: string
          notes?: string | null
          quote_number?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["quotation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          base_price: number
          created_at: string
          description: string | null
          features: Json | null
          id: string
          max_guests: number | null
          min_guests: number | null
          name: string
          per_guest_price: number
          slug: string
          sort_order: number
          tagline: string | null
        }
        Insert: {
          active?: boolean
          base_price?: number
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          max_guests?: number | null
          min_guests?: number | null
          name: string
          per_guest_price?: number
          slug: string
          sort_order?: number
          tagline?: string | null
        }
        Update: {
          active?: boolean
          base_price?: number
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          max_guests?: number | null
          min_guests?: number | null
          name?: string
          per_guest_price?: number
          slug?: string
          sort_order?: number
          tagline?: string | null
        }
        Relationships: []
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer"
      booking_status:
        | "pending"
        | "quoted"
        | "confirmed"
        | "completed"
        | "cancelled"
      invoice_status:
        | "draft"
        | "unpaid"
        | "partial"
        | "paid"
        | "overdue"
        | "cancelled"
      quotation_status:
        | "pending"
        | "sent"
        | "approved"
        | "rejected"
        | "converted"
        | "expired"
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
      app_role: ["admin", "customer"],
      booking_status: [
        "pending",
        "quoted",
        "confirmed",
        "completed",
        "cancelled",
      ],
      invoice_status: [
        "draft",
        "unpaid",
        "partial",
        "paid",
        "overdue",
        "cancelled",
      ],
      quotation_status: [
        "pending",
        "sent",
        "approved",
        "rejected",
        "converted",
        "expired",
      ],
    },
  },
} as const
