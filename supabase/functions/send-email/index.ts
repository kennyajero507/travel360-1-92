
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  template?: string;
  templateData?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, template, templateData }: EmailRequest = await req.json();

    console.log('Email request received:', { to, subject, template });

    // For now, we'll log the email instead of actually sending it
    // In production, you would integrate with a service like SendGrid, Resend, etc.
    
    const emailLog = {
      to,
      subject,
      html,
      template,
      templateData,
      timestamp: new Date().toISOString(),
      status: 'queued', // In real implementation, this would be 'sent' or 'failed'
    };

    console.log('Email logged:', emailLog);

    // Here you would typically:
    // 1. Validate the email address
    // 2. Apply rate limiting
    // 3. Use a template engine if template is provided
    // 4. Send via email service provider
    // 5. Log the result in database

    // Mock successful response
    return new Response(
      JSON.stringify({
        success: true,
        messageId: `mock-${Date.now()}`,
        status: 'queued',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in send-email function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
