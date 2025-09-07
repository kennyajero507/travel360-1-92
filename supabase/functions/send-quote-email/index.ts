import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quoteId, recipientEmail, emailType = 'new_quote' } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch quote with portal token
    const { data: quote, error } = await supabaseClient
      .from('quotes')
      .select('*, organizations!org_id(name)')
      .eq('id', quoteId)
      .single();

    if (error || !quote) throw new Error('Quote not found');

    const portalUrl = `${req.headers.get("origin")}/quote/${quote.client_portal_token}`;
    const orgName = quote.organizations?.name || "TravelFlow360";

    const emailResponse = await resend.emails.send({
      from: `${orgName} <quotes@yourdomain.com>`,
      to: [recipientEmail],
      subject: `Your Travel Quote #${quote.quote_number} - ${quote.destination}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0d9488;">Your Travel Quote is Ready!</h1>
          <p>Hi ${quote.client},</p>
          <p>Your travel quote for <strong>${quote.destination}</strong> is ready for review.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${portalUrl}" style="background: #0d9488; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Your Quote
            </a>
          </div>
          <p>This quote is valid until ${quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'further notice'}.</p>
        </div>
      `
    });

    if (emailResponse.error) throw emailResponse.error;

    // Update quote
    await supabaseClient
      .from('quotes')
      .update({ sent_to_client_at: new Date().toISOString() })
      .eq('id', quoteId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);