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
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      booking_analytics: {
        Row: {
          booking_id: string
          booking_source: string | null
          client_satisfaction_score: number | null
          conversion_days: number | null
          created_at: string | null
          id: string
          organization_id: string | null
          profit_margin: number | null
          revenue: number
          updated_at: string | null
        }
        Insert: {
          booking_id: string
          booking_source?: string | null
          client_satisfaction_score?: number | null
          conversion_days?: number | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          profit_margin?: number | null
          revenue?: number
          updated_at?: string | null
        }
        Update: {
          booking_id?: string
          booking_source?: string | null
          client_satisfaction_score?: number | null
          conversion_days?: number | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          profit_margin?: number | null
          revenue?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_analytics_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_analytics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
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
          org_id: string | null
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
          org_id?: string | null
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
          org_id?: string | null
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
          {
            foreignKeyName: "fk_bookings_org"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          subject: string
          template_type: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          subject: string
          template_type: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          subject?: string
          template_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          base_currency: string
          id: string
          rate: number
          target_currency: string
          updated_at: string | null
        }
        Insert: {
          base_currency?: string
          id?: string
          rate: number
          target_currency: string
          updated_at?: string | null
        }
        Update: {
          base_currency?: string
          id?: string
          rate?: number
          target_currency?: string
          updated_at?: string | null
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
        Relationships: [
          {
            foreignKeyName: "hotels_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          org_id: string | null
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
          enquiry_number?: string
          id: string
          infants?: number
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
          enquiry_number?: string
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
        Relationships: [
          {
            foreignKeyName: "fk_inquiries_org"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      invoices: {
        Row: {
          amount: number
          booking_id: string | null
          client_email: string | null
          client_name: string
          created_at: string
          created_by: string | null
          currency_code: string
          due_date: string | null
          id: string
          invoice_number: string
          line_items: Json | null
          notes: string | null
          organization_id: string
          paid_date: string | null
          payment_method: string | null
          quote_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          client_email?: string | null
          client_name: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          line_items?: Json | null
          notes?: string | null
          organization_id: string
          paid_date?: string | null
          payment_method?: string | null
          quote_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          client_email?: string | null
          client_name?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          line_items?: Json | null
          notes?: string | null
          organization_id?: string
          paid_date?: string | null
          payment_method?: string | null
          quote_id?: string | null
          status?: string
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
          {
            foreignKeyName: "invoices_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          booking_id: string | null
          content: string
          created_at: string | null
          id: string
          notification_type: string
          recipient_email: string
          sent_at: string | null
          status: string | null
          subject: string
        }
        Insert: {
          booking_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          notification_type: string
          recipient_email: string
          sent_at?: string | null
          status?: string | null
          subject: string
        }
        Update: {
          booking_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          notification_type?: string
          recipient_email?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
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
          monthly_booking_count: number | null
          monthly_quote_count: number | null
          name: string
          owner_id: string | null
          settings: Json | null
          short_code: string | null
          subscription_end_date: string | null
          subscription_plan_id: string | null
          subscription_start_date: string | null
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
          monthly_booking_count?: number | null
          monthly_quote_count?: number | null
          name: string
          owner_id?: string | null
          settings?: Json | null
          short_code?: string | null
          subscription_end_date?: string | null
          subscription_plan_id?: string | null
          subscription_start_date?: string | null
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
          monthly_booking_count?: number | null
          monthly_quote_count?: number | null
          name?: string
          owner_id?: string | null
          settings?: Json | null
          short_code?: string | null
          subscription_end_date?: string | null
          subscription_plan_id?: string | null
          subscription_start_date?: string | null
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
          {
            foreignKeyName: "organizations_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string | null
          currency_code: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          payment_status: string | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string | null
          currency_code?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string | null
          currency_code?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
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
          preferred_currency: string | null
          role: string | null
          trial_ends_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          org_id?: string | null
          preferred_currency?: string | null
          role?: string | null
          trial_ends_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          org_id?: string | null
          preferred_currency?: string | null
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
      quote_accommodations: {
        Row: {
          adult_cost: number
          cnb_cost: number
          created_at: string
          cwb_cost: number
          id: string
          infant_cost: number
          no_adults: number
          no_cnb: number
          no_cwb: number
          no_infants: number
          no_rooms: number
          quote_id: string
          room_arrangement: string
          room_type: string
        }
        Insert: {
          adult_cost?: number
          cnb_cost?: number
          created_at?: string
          cwb_cost?: number
          id?: string
          infant_cost?: number
          no_adults?: number
          no_cnb?: number
          no_cwb?: number
          no_infants?: number
          no_rooms?: number
          quote_id: string
          room_arrangement: string
          room_type: string
        }
        Update: {
          adult_cost?: number
          cnb_cost?: number
          created_at?: string
          cwb_cost?: number
          id?: string
          infant_cost?: number
          no_adults?: number
          no_cnb?: number
          no_cwb?: number
          no_infants?: number
          no_rooms?: number
          quote_id?: string
          room_arrangement?: string
          room_type?: string
        }
        Relationships: []
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
      quote_excursions: {
        Row: {
          activity_type: string
          adult_cost: number
          child_cost: number
          created_at: string
          description: string | null
          id: string
          number_of_children: number
          number_of_people: number
          quote_id: string
        }
        Insert: {
          activity_type: string
          adult_cost?: number
          child_cost?: number
          created_at?: string
          description?: string | null
          id?: string
          number_of_children?: number
          number_of_people?: number
          quote_id: string
        }
        Update: {
          activity_type?: string
          adult_cost?: number
          child_cost?: number
          created_at?: string
          description?: string | null
          id?: string
          number_of_children?: number
          number_of_people?: number
          quote_id?: string
        }
        Relationships: []
      }
      quote_hotel_options: {
        Row: {
          created_at: string
          currency_code: string
          hotel_id: string | null
          id: string
          is_selected: boolean | null
          option_name: string
          quote_id: string | null
          room_arrangements: Json | null
          total_price: number
        }
        Insert: {
          created_at?: string
          currency_code?: string
          hotel_id?: string | null
          id?: string
          is_selected?: boolean | null
          option_name?: string
          quote_id?: string | null
          room_arrangements?: Json | null
          total_price: number
        }
        Update: {
          created_at?: string
          currency_code?: string
          hotel_id?: string | null
          id?: string
          is_selected?: boolean | null
          option_name?: string
          quote_id?: string | null
          room_arrangements?: Json | null
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_hotel_options_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_hotel_options_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
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
      quote_markup: {
        Row: {
          created_at: string
          id: string
          markup_percentage: number
          notes: string | null
          quote_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          markup_percentage?: number
          notes?: string | null
          quote_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          markup_percentage?: number
          notes?: string | null
          quote_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      quote_package_items: {
        Row: {
          created_at: string | null
          id: string
          is_selected: boolean | null
          option_name: string
          package_id: string
          quote_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_selected?: boolean | null
          option_name?: string
          package_id: string
          quote_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_selected?: boolean | null
          option_name?: string
          package_id?: string
          quote_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_package_items_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "quote_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_package_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_packages: {
        Row: {
          client_email: string | null
          client_feedback: string | null
          client_mobile: string | null
          client_name: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          package_name: string
          selected_quote_id: string | null
          selection_date: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          client_email?: string | null
          client_feedback?: string | null
          client_mobile?: string | null
          client_name: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          package_name: string
          selected_quote_id?: string | null
          selection_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          client_email?: string | null
          client_feedback?: string | null
          client_mobile?: string | null
          client_name?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          package_name?: string
          selected_quote_id?: string | null
          selection_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_packages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      quote_transfers_new: {
        Row: {
          adult_cost: number
          child_cost: number
          created_at: string
          id: string
          no_adults: number
          no_children: number
          quote_id: string
          ticket_type: string | null
          transfer_operator: string | null
          transfer_type: string
          travel_route: string
        }
        Insert: {
          adult_cost?: number
          child_cost?: number
          created_at?: string
          id?: string
          no_adults?: number
          no_children?: number
          quote_id: string
          ticket_type?: string | null
          transfer_operator?: string | null
          transfer_type: string
          travel_route: string
        }
        Update: {
          adult_cost?: number
          child_cost?: number
          created_at?: string
          id?: string
          no_adults?: number
          no_children?: number
          quote_id?: string
          ticket_type?: string | null
          transfer_operator?: string | null
          transfer_type?: string
          travel_route?: string
        }
        Relationships: []
      }
      quote_transport: {
        Row: {
          adult_cost: number
          child_cost: number
          created_at: string
          id: string
          no_adults: number
          no_children: number
          note: string | null
          quote_id: string
          ticket_class: string | null
          ticket_type: string | null
          transport_mode: string
          transport_operator: string | null
          travel_route: string
        }
        Insert: {
          adult_cost?: number
          child_cost?: number
          created_at?: string
          id?: string
          no_adults?: number
          no_children?: number
          note?: string | null
          quote_id: string
          ticket_class?: string | null
          ticket_type?: string | null
          transport_mode: string
          transport_operator?: string | null
          travel_route: string
        }
        Update: {
          adult_cost?: number
          child_cost?: number
          created_at?: string
          id?: string
          no_adults?: number
          no_children?: number
          note?: string | null
          quote_id?: string
          ticket_class?: string | null
          ticket_type?: string | null
          transport_mode?: string
          transport_operator?: string | null
          travel_route?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          activities: Json
          adults: number
          approved_hotel_id: string | null
          children_no_bed: number
          children_with_bed: number
          client: string
          client_feedback: string | null
          client_selection_date: string | null
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
          selected_hotel_option_id: string | null
          short_id: string | null
          start_date: string
          status: string | null
          summary_data: Json | null
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
          client_feedback?: string | null
          client_selection_date?: string | null
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
          selected_hotel_option_id?: string | null
          short_id?: string | null
          start_date: string
          status?: string | null
          summary_data?: Json | null
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
          client_feedback?: string | null
          client_selection_date?: string | null
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
          selected_hotel_option_id?: string | null
          short_id?: string | null
          start_date?: string
          status?: string | null
          summary_data?: Json | null
          tour_type?: string | null
          transfers?: Json
          transports?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_selected_hotel_option_id_fkey"
            columns: ["selected_hotel_option_id"]
            isOneToOne: false
            referencedRelation: "quote_hotel_options"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          features: Json | null
          id: string
          is_active: boolean | null
          max_bookings_per_month: number | null
          max_quotes_per_month: number | null
          max_users: number | null
          name: string
          price_monthly: number
          price_yearly: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_bookings_per_month?: number | null
          max_quotes_per_month?: number | null
          max_users?: number | null
          name: string
          price_monthly: number
          price_yearly?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_bookings_per_month?: number | null
          max_quotes_per_month?: number | null
          max_users?: number | null
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          updated_at?: string
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
      voucher_templates: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          organization_id: string | null
          template_content: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          organization_id?: string | null
          template_content?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          organization_id?: string | null
          template_content?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voucher_templates_organization_id_fkey"
            columns: ["organization_id"]
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
      calculate_quote_summary: {
        Args: { quote_id_param: string }
        Returns: Json
      }
      can_access_inquiry: {
        Args: {
          inquiry_record: Database["public"]["Tables"]["inquiries"]["Row"]
        }
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
      check_system_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_user_role: {
        Args: { check_role: string }
        Returns: boolean
      }
      create_organization: {
        Args: { org_name: string }
        Returns: string
      }
      generate_booking_analytics: {
        Args: { booking_id_param: string }
        Returns: string
      }
      generate_enquiry_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_org_short_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_quote_short_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_authenticated_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_quote_package_with_items: {
        Args: { package_id_param: string }
        Returns: Json
      }
      get_user_email: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_organization: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_trial_expired: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      repair_user_profile: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      reset_monthly_counters: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
