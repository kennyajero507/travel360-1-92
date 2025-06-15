export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          operation: string | null
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          operation?: string | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          operation?: string | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      hotels: {
        Row: {
          additional_details: Json | null
          address: string | null
          amenities: Json | null
          category: string
          contact_info: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          destination: string
          id: string
          images: Json | null
          location: string | null
          name: string
          org_id: string | null
          policies: Json | null
          pricing: Json | null
          room_types: Json | null
          status: string
          updated_at: string | null
        }
        Insert: {
          additional_details?: Json | null
          address?: string | null
          amenities?: Json | null
          category: string
          contact_info?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          destination: string
          id?: string
          images?: Json | null
          location?: string | null
          name: string
          org_id?: string | null
          policies?: Json | null
          pricing?: Json | null
          room_types?: Json | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          additional_details?: Json | null
          address?: string | null
          amenities?: Json | null
          category?: string
          contact_info?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          destination?: string
          id?: string
          images?: Json | null
          location?: string | null
          name?: string
          org_id?: string | null
          policies?: Json | null
          pricing?: Json | null
          room_types?: Json | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          adults: number
          assigned_agent_name: string | null
          assigned_to: string | null
          check_in_date: string
          check_out_date: string
          children: number
          client_email: string | null
          client_mobile: string
          client_name: string
          created_at: string | null
          created_by: string | null
          custom_destination: string | null
          custom_package: string | null
          days_count: number | null
          description: string | null
          destination: string
          enquiry_number: string | null
          id: string
          infants: number
          lead_source: string | null
          nights_count: number | null
          num_rooms: number | null
          org_id: string | null
          package_name: string | null
          priority: string | null
          status: string
          tour_consultant: string | null
          tour_type: string
          updated_at: string | null
        }
        Insert: {
          adults: number
          assigned_agent_name?: string | null
          assigned_to?: string | null
          check_in_date: string
          check_out_date: string
          children: number
          client_email?: string | null
          client_mobile: string
          client_name: string
          created_at?: string | null
          created_by?: string | null
          custom_destination?: string | null
          custom_package?: string | null
          days_count?: number | null
          description?: string | null
          destination: string
          enquiry_number?: string | null
          id: string
          infants: number
          lead_source?: string | null
          nights_count?: number | null
          num_rooms?: number | null
          org_id?: string | null
          package_name?: string | null
          priority?: string | null
          status?: string
          tour_consultant?: string | null
          tour_type: string
          updated_at?: string | null
        }
        Update: {
          adults?: number
          assigned_agent_name?: string | null
          assigned_to?: string | null
          check_in_date?: string
          check_out_date?: string
          children?: number
          client_email?: string | null
          client_mobile?: string
          client_name?: string
          created_at?: string | null
          created_by?: string | null
          custom_destination?: string | null
          custom_package?: string | null
          days_count?: number | null
          description?: string | null
          destination?: string
          enquiry_number?: string | null
          id?: string
          infants?: number
          lead_source?: string | null
          nights_count?: number | null
          num_rooms?: number | null
          org_id?: string | null
          package_name?: string | null
          priority?: string | null
          status?: string
          tour_consultant?: string | null
          tour_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string | null
          email: string
          id: string
          org_id: string
          role: string
          status: string | null
          token: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          org_id: string
          role?: string
          status?: string | null
          token?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          org_id?: string
          role?: string
          status?: string | null
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner_id: string | null
          subscription_tier: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          owner_id?: string | null
          subscription_tier?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          subscription_tier?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          org_id: string | null
          role: string
          trial_ends_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          org_id?: string | null
          role?: string
          trial_ends_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          org_id?: string | null
          role?: string
          trial_ends_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          activities: Json | null
          adults: number | null
          approved_hotel_id: string | null
          children_no_bed: number | null
          children_with_bed: number | null
          client: string | null
          created_at: string | null
          created_by: string | null
          currency_code: string | null
          destination: string
          duration_days: number | null
          duration_nights: number | null
          end_date: string | null
          hotel_id: string | null
          id: string
          infants: number | null
          inquiry_id: string | null
          lead_source: string | null
          markup_type: string | null
          markup_value: number | null
          package_name: string | null
          room_arrangements: Json | null
          sectionmarkups: Json | null
          start_date: string | null
          status: string
          summary_data: Json | null
          tour_type: string | null
          transfers: Json | null
          transports: Json | null
          updated_at: string | null
        }
        Insert: {
          activities?: Json | null
          adults?: number | null
          approved_hotel_id?: string | null
          children_no_bed?: number | null
          children_with_bed?: number | null
          client?: string | null
          created_at?: string | null
          created_by?: string | null
          currency_code?: string | null
          destination: string
          duration_days?: number | null
          duration_nights?: number | null
          end_date?: string | null
          hotel_id?: string | null
          id?: string
          infants?: number | null
          inquiry_id?: string | null
          lead_source?: string | null
          markup_type?: string | null
          markup_value?: number | null
          package_name?: string | null
          room_arrangements?: Json | null
          sectionmarkups?: Json | null
          start_date?: string | null
          status?: string
          summary_data?: Json | null
          tour_type?: string | null
          transfers?: Json | null
          transports?: Json | null
          updated_at?: string | null
        }
        Update: {
          activities?: Json | null
          adults?: number | null
          approved_hotel_id?: string | null
          children_no_bed?: number | null
          children_with_bed?: number | null
          client?: string | null
          created_at?: string | null
          created_by?: string | null
          currency_code?: string | null
          destination?: string
          duration_days?: number | null
          duration_nights?: number | null
          end_date?: string | null
          hotel_id?: string | null
          id?: string
          infants?: number | null
          inquiry_id?: string | null
          lead_source?: string | null
          markup_type?: string | null
          markup_value?: number | null
          package_name?: string | null
          room_arrangements?: Json | null
          sectionmarkups?: Json | null
          start_date?: string | null
          status?: string
          summary_data?: Json | null
          tour_type?: string | null
          transfers?: Json | null
          transports?: Json | null
          updated_at?: string | null
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
