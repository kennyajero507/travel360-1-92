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
      inquiries: {
        Row: {
          adults: number
          assigned_agent_name: string | null
          assigned_to: string | null
          budget: number | null
          children: number
          client: string
          created_at: string | null
          created_by: string | null
          destination: string
          end_date: string
          id: string
          infants: number
          mobile: string
          num_rooms: number
          preferences: string | null
          priority: string | null
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          adults?: number
          assigned_agent_name?: string | null
          assigned_to?: string | null
          budget?: number | null
          children?: number
          client: string
          created_at?: string | null
          created_by?: string | null
          destination: string
          end_date: string
          id: string
          infants?: number
          mobile: string
          num_rooms?: number
          preferences?: string | null
          priority?: string | null
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          adults?: number
          assigned_agent_name?: string | null
          assigned_to?: string | null
          budget?: number | null
          children?: number
          client?: string
          created_at?: string | null
          created_by?: string | null
          destination?: string
          end_date?: string
          id?: string
          infants?: number
          mobile?: string
          num_rooms?: number
          preferences?: string | null
          priority?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          activities: Json
          adults: number
          children_no_bed: number
          children_with_bed: number
          client: string
          created_at: string | null
          created_by: string | null
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
          transfers: Json
          transports: Json
          updated_at: string | null
        }
        Insert: {
          activities?: Json
          adults?: number
          children_no_bed?: number
          children_with_bed?: number
          client: string
          created_at?: string | null
          created_by?: string | null
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
          transfers?: Json
          transports?: Json
          updated_at?: string | null
        }
        Update: {
          activities?: Json
          adults?: number
          children_no_bed?: number
          children_with_bed?: number
          client?: string
          created_at?: string | null
          created_by?: string | null
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
          transfers?: Json
          transports?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
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
