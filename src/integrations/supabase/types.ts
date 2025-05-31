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
      bookings: {
        Row: {
          activities: Json
          agent_id: string | null
          booking_reference: string
          client: string
          created_at: string | null
          hotel_id: string
          hotel_name: string
          id: string
          notes: string | null
          quote_id: string
          room_arrangement: Json
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number
          transfers: Json
          transport: Json
          travel_end: string
          travel_start: string
          updated_at: string | null
        }
        Insert: {
          activities?: Json
          agent_id?: string | null
          booking_reference: string
          client: string
          created_at?: string | null
          hotel_id: string
          hotel_name: string
          id?: string
          notes?: string | null
          quote_id: string
          room_arrangement?: Json
          status?: Database["public"]["Enums"]["booking_status"]
          total_price: number
          transfers?: Json
          transport?: Json
          travel_end: string
          travel_start: string
          updated_at?: string | null
        }
        Update: {
          activities?: Json
          agent_id?: string | null
          booking_reference?: string
          client?: string
          created_at?: string | null
          hotel_id?: string
          hotel_name?: string
          id?: string
          notes?: string | null
          quote_id?: string
          room_arrangement?: Json
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
          transfers?: Json
          transport?: Json
          travel_end?: string
          travel_start?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
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
          enquiry_number: string
          id: string
          infants: number
          lead_source: string | null
          nights_count: number | null
          num_rooms: number | null
          package_name: string | null
          priority: string | null
          status: string
          tour_consultant: string | null
          tour_type: string
          updated_at: string | null
        }
        Insert: {
          adults?: number
          assigned_agent_name?: string | null
          assigned_to?: string | null
          check_in_date: string
          check_out_date: string
          children?: number
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
          enquiry_number: string
          id: string
          infants?: number
          lead_source?: string | null
          nights_count?: number | null
          num_rooms?: number | null
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
          enquiry_number?: string
          id?: string
          infants?: number
          lead_source?: string | null
          nights_count?: number | null
          num_rooms?: number | null
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
          expires_at: string
          id: string
          invited_by: string | null
          org_id: string | null
          role: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_id?: string | null
          role: string
          token?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_id?: string | null
          role?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
          company_name: string | null
          created_at: string | null
          default_currency: string | null
          default_markup_percentage: number | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string | null
          settings: Json | null
          subscription_status: string | null
          tagline: string | null
          trial_end: string | null
          trial_start: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          default_currency?: string | null
          default_markup_percentage?: number | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id?: string | null
          settings?: Json | null
          subscription_status?: string | null
          tagline?: string | null
          trial_end?: string | null
          trial_start?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          default_currency?: string | null
          default_markup_percentage?: number | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          settings?: Json | null
          subscription_status?: string | null
          tagline?: string | null
          trial_end?: string | null
          trial_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          org_id: string | null
          role: string | null
          trial_ends_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          org_id?: string | null
          role?: string | null
          trial_ends_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          org_id?: string | null
          role?: string | null
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
      quote_activities: {
        Row: {
          activity_id: string | null
          cost_per_person: number
          created_at: string | null
          description: string | null
          id: string
          num_people: number
          quote_hotel_id: string
          title: string
          total: number
          updated_at: string | null
        }
        Insert: {
          activity_id?: string | null
          cost_per_person?: number
          created_at?: string | null
          description?: string | null
          id?: string
          num_people?: number
          quote_hotel_id: string
          title: string
          total?: number
          updated_at?: string | null
        }
        Update: {
          activity_id?: string | null
          cost_per_person?: number
          created_at?: string | null
          description?: string | null
          id?: string
          num_people?: number
          quote_hotel_id?: string
          title?: string
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_activities_quote_hotel_id_fkey"
            columns: ["quote_hotel_id"]
            isOneToOne: false
            referencedRelation: "quote_hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_hotels: {
        Row: {
          created_at: string | null
          final_price: number
          hotel_id: string
          hotel_name: string
          id: string
          markup_percent: number
          price_per_person: number
          quote_id: string
          total_cost: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          final_price?: number
          hotel_id: string
          hotel_name: string
          id?: string
          markup_percent?: number
          price_per_person?: number
          quote_id: string
          total_cost?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          final_price?: number
          hotel_id?: string
          hotel_name?: string
          id?: string
          markup_percent?: number
          price_per_person?: number
          quote_id?: string
          total_cost?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_hotels_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_room_arrangements: {
        Row: {
          adults: number
          children: number
          cost_per_adult: number
          cost_per_child: number
          cost_per_infant: number
          created_at: string | null
          id: string
          infants: number
          nights: number
          num_rooms: number
          quote_hotel_id: string
          room_type: string
          total: number
          updated_at: string | null
        }
        Insert: {
          adults?: number
          children?: number
          cost_per_adult?: number
          cost_per_child?: number
          cost_per_infant?: number
          created_at?: string | null
          id?: string
          infants?: number
          nights?: number
          num_rooms?: number
          quote_hotel_id: string
          room_type: string
          total?: number
          updated_at?: string | null
        }
        Update: {
          adults?: number
          children?: number
          cost_per_adult?: number
          cost_per_child?: number
          cost_per_infant?: number
          created_at?: string | null
          id?: string
          infants?: number
          nights?: number
          num_rooms?: number
          quote_hotel_id?: string
          room_type?: string
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_room_arrangements_quote_hotel_id_fkey"
            columns: ["quote_hotel_id"]
            isOneToOne: false
            referencedRelation: "quote_hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_transfers: {
        Row: {
          cost_per_vehicle: number
          created_at: string | null
          details: string | null
          from_location: string | null
          id: string
          num_vehicles: number
          quote_hotel_id: string
          to_location: string | null
          total: number
          transfer_type: string
          updated_at: string | null
          vehicle_type: string | null
        }
        Insert: {
          cost_per_vehicle?: number
          created_at?: string | null
          details?: string | null
          from_location?: string | null
          id?: string
          num_vehicles?: number
          quote_hotel_id: string
          to_location?: string | null
          total?: number
          transfer_type: string
          updated_at?: string | null
          vehicle_type?: string | null
        }
        Update: {
          cost_per_vehicle?: number
          created_at?: string | null
          details?: string | null
          from_location?: string | null
          id?: string
          num_vehicles?: number
          quote_hotel_id?: string
          to_location?: string | null
          total?: number
          transfer_type?: string
          updated_at?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_transfers_quote_hotel_id_fkey"
            columns: ["quote_hotel_id"]
            isOneToOne: false
            referencedRelation: "quote_hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          activities: Json
          adults: number
          approved_hotel_id: string | null
          children_no_bed: number
          children_with_bed: number
          client: string
          created_at: string | null
          created_by: string | null
          currency_code: string | null
          destination: string
          duration_days: number
          duration_nights: number
          end_date: string
          hotel_id: string | null
          id: string
          infants: number
          inquiry_id: string | null
          markup_type: string
          markup_value: number
          mobile: string
          notes: string | null
          room_arrangements: Json
          start_date: string
          status: string | null
          tour_type: string | null
          transfers: Json
          transports: Json
          updated_at: string | null
        }
        Insert: {
          activities?: Json
          adults?: number
          approved_hotel_id?: string | null
          children_no_bed?: number
          children_with_bed?: number
          client: string
          created_at?: string | null
          created_by?: string | null
          currency_code?: string | null
          destination: string
          duration_days: number
          duration_nights: number
          end_date: string
          hotel_id?: string | null
          id: string
          infants?: number
          inquiry_id?: string | null
          markup_type: string
          markup_value: number
          mobile: string
          notes?: string | null
          room_arrangements?: Json
          start_date: string
          status?: string | null
          tour_type?: string | null
          transfers?: Json
          transports?: Json
          updated_at?: string | null
        }
        Update: {
          activities?: Json
          adults?: number
          approved_hotel_id?: string | null
          children_no_bed?: number
          children_with_bed?: number
          client?: string
          created_at?: string | null
          created_by?: string | null
          currency_code?: string | null
          destination?: string
          duration_days?: number
          duration_nights?: number
          end_date?: string
          hotel_id?: string | null
          id?: string
          infants?: number
          inquiry_id?: string | null
          markup_type?: string
          markup_value?: number
          mobile?: string
          notes?: string | null
          room_arrangements?: Json
          start_date?: string
          status?: string | null
          tour_type?: string | null
          transfers?: Json
          transports?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      travel_vouchers: {
        Row: {
          booking_id: string
          created_at: string | null
          email_sent: boolean
          id: string
          issued_by: string | null
          issued_date: string
          notes: string | null
          updated_at: string | null
          voucher_pdf_url: string | null
          voucher_reference: string
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          email_sent?: boolean
          id?: string
          issued_by?: string | null
          issued_date?: string
          notes?: string | null
          updated_at?: string | null
          voucher_pdf_url?: string | null
          voucher_reference: string
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          email_sent?: boolean
          id?: string
          issued_by?: string | null
          issued_date?: string
          notes?: string | null
          updated_at?: string | null
          voucher_pdf_url?: string | null
          voucher_reference?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_vouchers_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          org_id: string | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          org_id?: string | null
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          org_id?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: { invitation_token: string }
        Returns: Json
      }
      calculate_nights: {
        Args: { start_date: string; end_date: string }
        Returns: number
      }
      can_access_inquiry: {
        Args: {
          inquiry_record: Database["public"]["Tables"]["inquiries"]["Row"]
        }
        Returns: boolean
      }
      can_access_profile: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
      can_create_inquiry: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      can_modify_inquiry: {
        Args: {
          inquiry_record: Database["public"]["Tables"]["inquiries"]["Row"]
        }
        Returns: boolean
      }
      create_organization: {
        Args: { org_name: string }
        Returns: string
      }
      generate_enquiry_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_email: {
        Args: { user_id: string }
        Returns: string
      }
      is_trial_expired: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      user_has_role: {
        Args: { check_role: string; check_org_id?: string }
        Returns: boolean
      }
      user_in_same_org: {
        Args: { target_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
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
    Enums: {
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
    },
  },
} as const
