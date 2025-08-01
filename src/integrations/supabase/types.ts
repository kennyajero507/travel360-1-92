export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_activity_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
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
      bookings: {
        Row: {
          activities: Json | null
          agent_id: string | null
          booking_reference: string
          client: string
          client_email: string | null
          created_at: string | null
          hotel_id: string | null
          hotel_name: string
          id: string
          notes: string | null
          org_id: string | null
          quote_id: string | null
          room_arrangement: Json | null
          status: string
          total_price: number
          transfers: Json | null
          transport: Json | null
          travel_end: string
          travel_start: string
          updated_at: string | null
        }
        Insert: {
          activities?: Json | null
          agent_id?: string | null
          booking_reference: string
          client: string
          client_email?: string | null
          created_at?: string | null
          hotel_id?: string | null
          hotel_name: string
          id?: string
          notes?: string | null
          org_id?: string | null
          quote_id?: string | null
          room_arrangement?: Json | null
          status?: string
          total_price?: number
          transfers?: Json | null
          transport?: Json | null
          travel_end: string
          travel_start: string
          updated_at?: string | null
        }
        Update: {
          activities?: Json | null
          agent_id?: string | null
          booking_reference?: string
          client?: string
          client_email?: string | null
          created_at?: string | null
          hotel_id?: string | null
          hotel_name?: string
          id?: string
          notes?: string | null
          org_id?: string | null
          quote_id?: string | null
          room_arrangement?: Json | null
          status?: string
          total_price?: number
          transfers?: Json | null
          transport?: Json | null
          travel_end?: string
          travel_start?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_quote_id"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string
          id: string
          location: string | null
          name: string
          org_id: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email: string
          id?: string
          location?: string | null
          name: string
          org_id?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string
          id?: string
          location?: string | null
          name?: string
          org_id?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_org_id_fkey"
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
          org_id: string | null
          subject: string
          template_type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          org_id?: string | null
          subject: string
          template_type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          org_id?: string | null
          subject?: string
          template_type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_room_inventory: {
        Row: {
          booked_units: number
          created_at: string | null
          hotel_id: string
          id: string
          inventory_date: string
          notes: string | null
          room_type_id: string
          updated_at: string | null
        }
        Insert: {
          booked_units?: number
          created_at?: string | null
          hotel_id: string
          id?: string
          inventory_date: string
          notes?: string | null
          room_type_id: string
          updated_at?: string | null
        }
        Update: {
          booked_units?: number
          created_at?: string | null
          hotel_id?: string
          id?: string
          inventory_date?: string
          notes?: string | null
          room_type_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotel_room_inventory_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
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
          children_no_bed: number | null
          children_with_bed: number | null
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
          document_checklist: Json | null
          enquiry_number: string | null
          estimated_budget_range: string | null
          flight_preference: string | null
          guide_language_preference: string | null
          id: string
          infants: number
          lead_source: string | null
          nights_count: number | null
          notes: string | null
          num_adults: number | null
          num_children: number | null
          num_rooms: number | null
          org_id: string | null
          package_name: string | null
          passport_expiry_date: string | null
          preferred_currency: string | null
          priority: string | null
          regional_preference: string | null
          special_requirements: string | null
          status: string
          tour_consultant: string | null
          tour_type: string
          transport_mode_preference: string | null
          travel_end: string | null
          travel_insurance_required: boolean | null
          travel_start: string | null
          updated_at: string | null
          visa_required: boolean | null
          workflow_stage: string | null
        }
        Insert: {
          adults: number
          assigned_agent_name?: string | null
          assigned_to?: string | null
          check_in_date: string
          check_out_date: string
          children: number
          children_no_bed?: number | null
          children_with_bed?: number | null
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
          document_checklist?: Json | null
          enquiry_number?: string | null
          estimated_budget_range?: string | null
          flight_preference?: string | null
          guide_language_preference?: string | null
          id: string
          infants: number
          lead_source?: string | null
          nights_count?: number | null
          notes?: string | null
          num_adults?: number | null
          num_children?: number | null
          num_rooms?: number | null
          org_id?: string | null
          package_name?: string | null
          passport_expiry_date?: string | null
          preferred_currency?: string | null
          priority?: string | null
          regional_preference?: string | null
          special_requirements?: string | null
          status?: string
          tour_consultant?: string | null
          tour_type: string
          transport_mode_preference?: string | null
          travel_end?: string | null
          travel_insurance_required?: boolean | null
          travel_start?: string | null
          updated_at?: string | null
          visa_required?: boolean | null
          workflow_stage?: string | null
        }
        Update: {
          adults?: number
          assigned_agent_name?: string | null
          assigned_to?: string | null
          check_in_date?: string
          check_out_date?: string
          children?: number
          children_no_bed?: number | null
          children_with_bed?: number | null
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
          document_checklist?: Json | null
          enquiry_number?: string | null
          estimated_budget_range?: string | null
          flight_preference?: string | null
          guide_language_preference?: string | null
          id?: string
          infants?: number
          lead_source?: string | null
          nights_count?: number | null
          notes?: string | null
          num_adults?: number | null
          num_children?: number | null
          num_rooms?: number | null
          org_id?: string | null
          package_name?: string | null
          passport_expiry_date?: string | null
          preferred_currency?: string | null
          priority?: string | null
          regional_preference?: string | null
          special_requirements?: string | null
          status?: string
          tour_consultant?: string | null
          tour_type?: string
          transport_mode_preference?: string | null
          travel_end?: string | null
          travel_insurance_required?: boolean | null
          travel_start?: string | null
          updated_at?: string | null
          visa_required?: boolean | null
          workflow_stage?: string | null
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
      invoices: {
        Row: {
          amount: number
          booking_id: string | null
          client_email: string | null
          client_name: string
          created_at: string | null
          created_by: string | null
          currency_code: string
          due_date: string | null
          id: string
          invoice_number: string
          line_items: Json | null
          notes: string | null
          organization_id: string | null
          paid_date: string | null
          payment_method: string | null
          quote_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          booking_id?: string | null
          client_email?: string | null
          client_name: string
          created_at?: string | null
          created_by?: string | null
          currency_code?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          line_items?: Json | null
          notes?: string | null
          organization_id?: string | null
          paid_date?: string | null
          payment_method?: string | null
          quote_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          client_email?: string | null
          client_name?: string
          created_at?: string | null
          created_by?: string | null
          currency_code?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          line_items?: Json | null
          notes?: string | null
          organization_id?: string | null
          paid_date?: string | null
          payment_method?: string | null
          quote_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_invoice_booking_id"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoice_quote_id"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          read: boolean
          related_id: string | null
          related_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean
          related_id?: string | null
          related_type?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          org_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          org_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          org_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_audit_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_settings: {
        Row: {
          created_at: string | null
          default_country: string | null
          default_currency: string | null
          default_regions: Json | null
          id: string
          org_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_country?: string | null
          default_currency?: string | null
          default_regions?: Json | null
          id?: string
          org_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_country?: string | null
          default_currency?: string | null
          default_regions?: Json | null
          id?: string
          org_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_settings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_cycle: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string | null
          primary_color: string | null
          secondary_color: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_status: string | null
          subscription_tier: string | null
          tagline: string | null
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          tagline?: string | null
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          tagline?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          currency_code: string
          id: string
          invoice_id: string | null
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          payment_status: string
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          currency_code?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          currency_code?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_payment_booking_id"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_payment_invoice_id"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          country: string | null
          created_at: string | null
          currency: string | null
          email: string | null
          email_notifications: boolean
          full_name: string | null
          id: string
          org_id: string | null
          phone: string | null
          role: string
          sms_notifications: boolean
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          email_notifications?: boolean
          full_name?: string | null
          id: string
          org_id?: string | null
          phone?: string | null
          role?: string
          sms_notifications?: boolean
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          email_notifications?: boolean
          full_name?: string | null
          id?: string
          org_id?: string | null
          phone?: string | null
          role?: string
          sms_notifications?: boolean
          trial_ends_at?: string | null
          updated_at?: string | null
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
          created_at: string | null
          hotel_name: string
          id: string
          nights: number
          num_rooms: number
          quote_id: string | null
          rate_per_night: number
          room_type: string
          subtotal: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          hotel_name: string
          id?: string
          nights?: number
          num_rooms?: number
          quote_id?: string | null
          rate_per_night?: number
          room_type: string
          subtotal?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          hotel_name?: string
          id?: string
          nights?: number
          num_rooms?: number
          quote_id?: string | null
          rate_per_night?: number
          room_type?: string
          subtotal?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_accommodations_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_excursions: {
        Row: {
          activity_type: string
          adult_cost: number | null
          child_cost: number | null
          created_at: string | null
          description: string | null
          id: string
          number_of_children: number | null
          number_of_people: number | null
          quote_id: string | null
          updated_at: string | null
        }
        Insert: {
          activity_type: string
          adult_cost?: number | null
          child_cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          number_of_children?: number | null
          number_of_people?: number | null
          quote_id?: string | null
          updated_at?: string | null
        }
        Update: {
          activity_type?: string
          adult_cost?: number | null
          child_cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          number_of_children?: number | null
          number_of_people?: number | null
          quote_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_excursions_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_hotel_options: {
        Row: {
          created_at: string | null
          currency_code: string | null
          hotel_id: string | null
          id: string
          is_selected: boolean | null
          option_name: string | null
          quote_id: string
          room_arrangements: Json | null
          total_price: number | null
        }
        Insert: {
          created_at?: string | null
          currency_code?: string | null
          hotel_id?: string | null
          id?: string
          is_selected?: boolean | null
          option_name?: string | null
          quote_id: string
          room_arrangements?: Json | null
          total_price?: number | null
        }
        Update: {
          created_at?: string | null
          currency_code?: string | null
          hotel_id?: string | null
          id?: string
          is_selected?: boolean | null
          option_name?: string | null
          quote_id?: string
          room_arrangements?: Json | null
          total_price?: number | null
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
      quote_markup: {
        Row: {
          created_at: string | null
          id: string
          markup_type: string
          quote_id: string | null
          updated_at: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          markup_type?: string
          quote_id?: string | null
          updated_at?: string | null
          value?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          markup_type?: string
          quote_id?: string | null
          updated_at?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_markup_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_packages: {
        Row: {
          client_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          package_name: string
          quote_ids: string[]
          status: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          package_name: string
          quote_ids: string[]
          status?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          package_name?: string
          quote_ids?: string[]
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_packages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_packages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_transfers_new: {
        Row: {
          adult_cost: number | null
          child_cost: number | null
          created_at: string | null
          id: string
          no_adults: number | null
          no_children: number | null
          quote_id: string | null
          ticket_type: string | null
          transfer_operator: string | null
          transfer_type: string
          travel_route: string | null
          updated_at: string | null
        }
        Insert: {
          adult_cost?: number | null
          child_cost?: number | null
          created_at?: string | null
          id?: string
          no_adults?: number | null
          no_children?: number | null
          quote_id?: string | null
          ticket_type?: string | null
          transfer_operator?: string | null
          transfer_type: string
          travel_route?: string | null
          updated_at?: string | null
        }
        Update: {
          adult_cost?: number | null
          child_cost?: number | null
          created_at?: string | null
          id?: string
          no_adults?: number | null
          no_children?: number | null
          quote_id?: string | null
          ticket_type?: string | null
          transfer_operator?: string | null
          transfer_type?: string
          travel_route?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_transfers_new_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_transport: {
        Row: {
          cost_per_person: number
          created_at: string | null
          description: string | null
          id: string
          mode: string | null
          num_passengers: number
          operator: string | null
          quote_id: string | null
          route: string | null
          total_cost: number
          transport_type: string
          updated_at: string | null
        }
        Insert: {
          cost_per_person?: number
          created_at?: string | null
          description?: string | null
          id?: string
          mode?: string | null
          num_passengers?: number
          operator?: string | null
          quote_id?: string | null
          route?: string | null
          total_cost?: number
          transport_type: string
          updated_at?: string | null
        }
        Update: {
          cost_per_person?: number
          created_at?: string | null
          description?: string | null
          id?: string
          mode?: string | null
          num_passengers?: number
          operator?: string | null
          quote_id?: string | null
          route?: string | null
          total_cost?: number
          transport_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_transport_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          activities: Json | null
          adults: number
          approved_hotel_id: string | null
          children_no_bed: number | null
          children_with_bed: number | null
          client: string
          client_email: string | null
          client_selection_date: string | null
          created_at: string | null
          created_by: string | null
          currency_code: string | null
          destination: string
          document_checklist: Json | null
          duration_days: number | null
          duration_nights: number | null
          end_date: string
          estimated_budget_range: string | null
          flight_preference: string | null
          guide_language_preference: string | null
          hotel_id: string | null
          id: string
          infants: number | null
          inquiry_id: string | null
          itinerary: Json | null
          lead_source: string | null
          markup_amount: number | null
          markup_percentage: number | null
          markup_type: string | null
          markup_value: number | null
          mobile: string
          notes: string | null
          org_id: string | null
          package_name: string | null
          passport_expiry_date: string | null
          preferred_currency: string | null
          quote_number: string | null
          regional_preference: string | null
          room_arrangements: Json | null
          sectionmarkups: Json | null
          selected_hotel_option_id: string | null
          sleeping_arrangements: Json | null
          special_requirements: string | null
          start_date: string
          status: string
          subtotal: number | null
          summary_data: Json | null
          total_amount: number | null
          tour_type: string | null
          transfer_options: Json | null
          transfers: Json | null
          transport_mode_preference: string | null
          transport_options: Json | null
          transports: Json | null
          travel_insurance_required: boolean | null
          updated_at: string | null
          valid_until: string | null
          visa_documentation: Json | null
          visa_required: boolean | null
          workflow_stage: string | null
        }
        Insert: {
          activities?: Json | null
          adults: number
          approved_hotel_id?: string | null
          children_no_bed?: number | null
          children_with_bed?: number | null
          client: string
          client_email?: string | null
          client_selection_date?: string | null
          created_at?: string | null
          created_by?: string | null
          currency_code?: string | null
          destination: string
          document_checklist?: Json | null
          duration_days?: number | null
          duration_nights?: number | null
          end_date: string
          estimated_budget_range?: string | null
          flight_preference?: string | null
          guide_language_preference?: string | null
          hotel_id?: string | null
          id?: string
          infants?: number | null
          inquiry_id?: string | null
          itinerary?: Json | null
          lead_source?: string | null
          markup_amount?: number | null
          markup_percentage?: number | null
          markup_type?: string | null
          markup_value?: number | null
          mobile: string
          notes?: string | null
          org_id?: string | null
          package_name?: string | null
          passport_expiry_date?: string | null
          preferred_currency?: string | null
          quote_number?: string | null
          regional_preference?: string | null
          room_arrangements?: Json | null
          sectionmarkups?: Json | null
          selected_hotel_option_id?: string | null
          sleeping_arrangements?: Json | null
          special_requirements?: string | null
          start_date: string
          status?: string
          subtotal?: number | null
          summary_data?: Json | null
          total_amount?: number | null
          tour_type?: string | null
          transfer_options?: Json | null
          transfers?: Json | null
          transport_mode_preference?: string | null
          transport_options?: Json | null
          transports?: Json | null
          travel_insurance_required?: boolean | null
          updated_at?: string | null
          valid_until?: string | null
          visa_documentation?: Json | null
          visa_required?: boolean | null
          workflow_stage?: string | null
        }
        Update: {
          activities?: Json | null
          adults?: number
          approved_hotel_id?: string | null
          children_no_bed?: number | null
          children_with_bed?: number | null
          client?: string
          client_email?: string | null
          client_selection_date?: string | null
          created_at?: string | null
          created_by?: string | null
          currency_code?: string | null
          destination?: string
          document_checklist?: Json | null
          duration_days?: number | null
          duration_nights?: number | null
          end_date?: string
          estimated_budget_range?: string | null
          flight_preference?: string | null
          guide_language_preference?: string | null
          hotel_id?: string | null
          id?: string
          infants?: number | null
          inquiry_id?: string | null
          itinerary?: Json | null
          lead_source?: string | null
          markup_amount?: number | null
          markup_percentage?: number | null
          markup_type?: string | null
          markup_value?: number | null
          mobile?: string
          notes?: string | null
          org_id?: string | null
          package_name?: string | null
          passport_expiry_date?: string | null
          preferred_currency?: string | null
          quote_number?: string | null
          regional_preference?: string | null
          room_arrangements?: Json | null
          sectionmarkups?: Json | null
          selected_hotel_option_id?: string | null
          sleeping_arrangements?: Json | null
          special_requirements?: string | null
          start_date?: string
          status?: string
          subtotal?: number | null
          summary_data?: Json | null
          total_amount?: number | null
          tour_type?: string | null
          transfer_options?: Json | null
          transfers?: Json | null
          transport_mode_preference?: string | null
          transport_options?: Json | null
          transports?: Json | null
          travel_insurance_required?: boolean | null
          updated_at?: string | null
          valid_until?: string | null
          visa_documentation?: Json | null
          visa_required?: boolean | null
          workflow_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_quotes_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_quotes_org"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          action: string
          created_at: string | null
          id: string
          permission: string
          resource: string | null
          role: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          permission: string
          resource?: string | null
          role: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          permission?: string
          resource?: string | null
          role?: string
        }
        Relationships: []
      }
      system_admins: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          message: string | null
          metadata: Json | null
          severity: string | null
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          message?: string | null
          metadata?: Json | null
          severity?: string | null
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          severity?: string | null
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_unit: string | null
          metric_value: number | null
          timestamp: string | null
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_unit?: string | null
          metric_value?: number | null
          timestamp?: string | null
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number | null
          timestamp?: string | null
        }
        Relationships: []
      }
      tour_templates: {
        Row: {
          base_price: number | null
          country: string
          created_at: string | null
          created_by: string | null
          currency_code: string | null
          description: string | null
          destination_name: string
          duration_days: number
          duration_nights: number
          exclusions: Json | null
          id: string
          images: Json | null
          inclusions: Json | null
          is_active: boolean | null
          itinerary: Json | null
          org_id: string | null
          region: string | null
          tags: Json | null
          title: string
          tour_type: string | null
          updated_at: string | null
        }
        Insert: {
          base_price?: number | null
          country?: string
          created_at?: string | null
          created_by?: string | null
          currency_code?: string | null
          description?: string | null
          destination_name: string
          duration_days: number
          duration_nights: number
          exclusions?: Json | null
          id?: string
          images?: Json | null
          inclusions?: Json | null
          is_active?: boolean | null
          itinerary?: Json | null
          org_id?: string | null
          region?: string | null
          tags?: Json | null
          title: string
          tour_type?: string | null
          updated_at?: string | null
        }
        Update: {
          base_price?: number | null
          country?: string
          created_at?: string | null
          created_by?: string | null
          currency_code?: string | null
          description?: string | null
          destination_name?: string
          duration_days?: number
          duration_nights?: number
          exclusions?: Json | null
          id?: string
          images?: Json | null
          inclusions?: Json | null
          is_active?: boolean | null
          itinerary?: Json | null
          org_id?: string | null
          region?: string | null
          tags?: Json | null
          title?: string
          tour_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tour_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tour_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "fk_voucher_booking_id"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_quote_summary: {
        Args: { quote_id_param: string }
        Returns: Json
      }
      check_if_system_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_system_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_user_permission: {
        Args: {
          p_user_id: string
          p_permission: string
          p_resource?: string
          p_action?: string
        }
        Returns: boolean
      }
      create_data_backup: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      create_user_organization: {
        Args: { org_name: string }
        Returns: Json
      }
      debug_auth_status: {
        Args: { target_user_id?: string }
        Returns: Json
      }
      debug_user_auth: {
        Args: { user_id_param?: string }
        Returns: {
          user_exists: boolean
          profile_exists: boolean
          profile_data: Json
          org_exists: boolean
          org_data: Json
          policies_blocking: string[]
        }[]
      }
      debug_user_profile: {
        Args: { target_user_id?: string }
        Returns: Json
      }
      generate_inquiry_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_quote_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_organization_settings: {
        Args: { p_org_id?: string }
        Returns: {
          org_id: string
          default_country: string
          default_currency: string
          default_regions: Json
        }[]
      }
      get_user_org_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_organization: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role_safe: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_system_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      log_admin_activity: {
        Args: {
          p_action: string
          p_target_type?: string
          p_target_id?: string
          p_details?: Json
        }
        Returns: string
      }
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
  public: {
    Enums: {},
  },
} as const
