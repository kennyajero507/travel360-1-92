
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Define the structure of the quote preview data we expect.
// This is a subset of the full ClientQuotePreview type from the frontend.
interface ClientQuotePreview {
  id: string;
  client: string;
  destination: string;
}

interface QuoteEmailRequest {
  quotePreview: ClientQuotePreview;
  recipientEmail: string;
}

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
    const { quotePreview, recipientEmail }: QuoteEmailRequest = await req.json();
    
    // Fallback to SITE_URL env var, then to a default for local dev
    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:5173';
    const previewUrl = `${siteUrl}/quote-preview?id=${quotePreview.id}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1>Hello ${quotePreview.client},</h1>
        <p>Your personalized travel quote for <strong>${quotePreview.destination}</strong> is ready for your review.</p>
        <p>You can view the complete details by clicking the button below:</p>
        <a href="${previewUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Your Quote</a>
        <p>If you have any questions or would like to make changes, please don't hesitate to reply to this email.</p>
        <p>Best regards,<br>The Lovable Agency Team</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: "Lovable Agency <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `Your Travel Quote for ${quotePreview.destination} is Ready!`,
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
    console.error("Error in send-quote-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
