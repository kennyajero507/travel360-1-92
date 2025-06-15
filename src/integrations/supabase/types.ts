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
      bookings: {
        Row: {
          activities: Json | null
          agent_id: string | null
          booking_reference: string
          client: string
          created_at: string | null
          hotel_id: string | null
          hotel_name: string
          id: string
          notes: string | null
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
          created_at?: string | null
          hotel_id?: string | null
          hotel_name: string
          id?: string
          notes?: string | null
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
          created_at?: string | null
          hotel_id?: string | null
          hotel_name?: string
          id?: string
          notes?: string | null
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
        }
        Insert: {
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
        }
        Update: {
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
          adults: number | null
          approved_hotel_id: string | null
          children_no_bed: number | null
          children_with_bed: number | null
          client: string | null
          client_selection_date: string | null
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
          selected_hotel_option_id: string | null
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
          client_selection_date?: string | null
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
          selected_hotel_option_id?: string | null
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
          client_selection_date?: string | null
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
          selected_hotel_option_id?: string | null
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
      get_user_org_id: {
        Args: Record<PropertyKey, never>
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
