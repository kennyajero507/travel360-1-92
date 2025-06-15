import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

// Define interfaces for the expected payload
interface TravelVoucher {
  voucher_reference: string;
  issued_date: string;
  // other voucher fields...
}

interface Booking {
  id: string;
  client: string;
  hotel_name: string;
  travel_start: string;
  travel_end: string;
  quote_id?: string;
  // other booking fields...
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { voucher, booking }: { voucher: TravelVoucher; booking: Booking } = await req.json();

    if (!booking.quote_id) {
      throw new Error("Booking is not linked to a quote, cannot find client email.");
    }

    // Fetch the quote to get the client's email
    const { data: quote, error: quoteError } = await supabaseAdmin
      .from("quotes")
      .select("client_email")
      .eq("id", booking.quote_id)
      .single();

    if (quoteError) throw quoteError;
    if (!quote || !quote.client_email) {
      throw new Error("Client email not found for this booking's quote.");
    }
    
    const recipientEmail = quote.client_email;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1>Hello ${booking.client},</h1>
        <p>Your travel voucher for your booking to <strong>${booking.hotel_name}</strong> is attached and ready.</p>
        <h2>Voucher Details:</h2>
        <ul>
          <li><strong>Voucher Reference:</strong> ${voucher.voucher_reference}</li>
          <li><strong>Hotel:</strong> ${booking.hotel_name}</li>
          <li><strong>Travel Dates:</strong> ${new Date(booking.travel_start).toLocaleDateString()} - ${new Date(booking.travel_end).toLocaleDateString()}</li>
        </ul>
        <p>Please have this voucher ready for your trip. If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>The Lovable Agency Team</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: "Lovable Agency <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `Your Travel Voucher for ${booking.hotel_name}`,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(error.message);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-voucher-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
