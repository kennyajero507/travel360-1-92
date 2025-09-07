import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PDFGenerationRequest {
  quoteId: string;
  includeClientInfo?: boolean;
  template?: 'standard' | 'detailed' | 'minimal';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('PDF generation function started');

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { quoteId, includeClientInfo = true, template = 'standard' }: PDFGenerationRequest = await req.json();

    console.log('Generating PDF for quote:', quoteId);

    // Fetch quote details with related data
    const { data: quote, error: quoteError } = await supabaseClient
      .from('quotes')
      .select(`
        *,
        quote_options (*),
        profiles!created_by (full_name, email, phone),
        organizations!org_id (name, primary_color, secondary_color, logo_url)
      `)
      .eq('id', quoteId)
      .single();

    if (quoteError || !quote) {
      throw new Error(`Quote not found: ${quoteError?.message}`);
    }

    // Generate HTML content for PDF
    const htmlContent = generatePDFHTML(quote, { includeClientInfo, template });

    // Here you would integrate with a PDF generation service
    // For now, we'll return the HTML content that can be used by the frontend
    // In production, you might use services like:
    // - Puppeteer Cloud
    // - HTML/CSS to PDF API
    // - jsPDF (client-side)
    
    // Log the PDF generation
    await supabaseClient
      .from('quote_interactions')
      .insert({
        quote_id: quoteId,
        interaction_type: 'downloaded',
        interaction_data: {
          template,
          generated_at: new Date().toISOString()
        }
      });

    console.log('PDF HTML generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        htmlContent,
        fileName: `quote-${quote.quote_number || quoteId}.pdf`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Error in generate-quote-pdf function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to generate PDF" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

function generatePDFHTML(quote: any, options: { includeClientInfo: boolean; template: string }) {
  const { includeClientInfo, template } = options;
  const orgName = quote.organizations?.name || "TravelFlow360";
  const primaryColor = quote.organizations?.primary_color || "#0d9488";
  const logoUrl = quote.organizations?.logo_url;

  const hasMultipleOptions = quote.quote_options && quote.quote_options.length > 1;
  const totalGuests = (quote.adults || 0) + (quote.children_with_bed || 0) + (quote.children_no_bed || 0) + (quote.infants || 0);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          font-size: 14px;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid ${primaryColor};
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .logo {
          max-height: 60px;
        }
        
        .company-info {
          text-align: right;
        }
        
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: ${primaryColor};
          margin: 0;
        }
        
        .quote-title {
          font-size: 28px;
          font-weight: bold;
          color: ${primaryColor};
          text-align: center;
          margin: 20px 0;
        }
        
        .quote-number {
          background: ${primaryColor};
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: bold;
          display: inline-block;
        }
        
        .section {
          margin: 25px 0;
          break-inside: avoid;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: ${primaryColor};
          border-bottom: 2px solid #eee;
          padding-bottom: 8px;
          margin-bottom: 15px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 20px 0;
        }
        
        .info-item {
          display: flex;
          margin: 8px 0;
        }
        
        .info-label {
          font-weight: bold;
          min-width: 120px;
          color: #666;
        }
        
        .info-value {
          color: #333;
        }
        
        .option-card {
          border: 2px solid #eee;
          border-radius: 8px;
          padding: 20px;
          margin: 15px 0;
          break-inside: avoid;
        }
        
        .option-recommended {
          border-color: #fbbf24;
          background-color: #fffbeb;
        }
        
        .option-selected {
          border-color: ${primaryColor};
          background-color: #f0fdfa;
        }
        
        .option-title {
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 10px 0;
        }
        
        .option-price {
          font-size: 24px;
          font-weight: bold;
          color: #059669;
          text-align: right;
          margin: 10px 0;
        }
        
        .inclusions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px;
          margin: 15px 0;
        }
        
        .inclusion-item {
          background: #f3f4f6;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
        }
        
        .price-breakdown {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .price-row {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
          padding: 4px 0;
        }
        
        .price-row.total {
          border-top: 2px solid #333;
          font-weight: bold;
          font-size: 18px;
          margin-top: 15px;
          padding-top: 15px;
        }
        
        .terms {
          background: #f9fafb;
          border-left: 4px solid ${primaryColor};
          padding: 15px;
          margin: 20px 0;
          font-size: 12px;
        }
        
        .footer {
          margin-top: 40px;
          border-top: 1px solid #eee;
          padding-top: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        
        .badge {
          background: #fbbf24;
          color: #92400e;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .badge.selected {
          background: ${primaryColor};
          color: white;
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div>
          ${logoUrl ? `<img src="${logoUrl}" alt="${orgName}" class="logo">` : ''}
          ${!logoUrl ? `<h1 class="company-name">${orgName}</h1>` : ''}
        </div>
        <div class="company-info">
          ${quote.profiles?.full_name ? `<div><strong>${quote.profiles.full_name}</strong></div>` : ''}
          ${quote.profiles?.email ? `<div>${quote.profiles.email}</div>` : ''}
          ${quote.profiles?.phone ? `<div>${quote.profiles.phone}</div>` : ''}
        </div>
      </div>

      <!-- Quote Title -->
      <div class="quote-title">
        Travel Quote
        ${quote.quote_number ? `<br><span class="quote-number">#${quote.quote_number}</span>` : ''}
      </div>

      <!-- Client Information -->
      ${includeClientInfo ? `
        <div class="section">
          <div class="section-title">Client Information</div>
          <div class="info-grid">
            <div>
              <div class="info-item">
                <span class="info-label">Client Name:</span>
                <span class="info-value">${quote.client}</span>
              </div>
              ${quote.client_email ? `
                <div class="info-item">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${quote.client_email}</span>
                </div>
              ` : ''}
              ${quote.mobile ? `
                <div class="info-item">
                  <span class="info-label">Mobile:</span>
                  <span class="info-value">${quote.mobile}</span>
                </div>
              ` : ''}
            </div>
            <div>
              <div class="info-item">
                <span class="info-label">Quote Date:</span>
                <span class="info-value">${new Date(quote.created_at).toLocaleDateString()}</span>
              </div>
              ${quote.valid_until ? `
                <div class="info-item">
                  <span class="info-label">Valid Until:</span>
                  <span class="info-value">${new Date(quote.valid_until).toLocaleDateString()}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Trip Details -->
      <div class="section">
        <div class="section-title">Trip Details</div>
        <div class="info-grid">
          <div>
            <div class="info-item">
              <span class="info-label">Destination:</span>
              <span class="info-value">${quote.destination}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Travel Dates:</span>
              <span class="info-value">
                ${new Date(quote.start_date).toLocaleDateString()} - ${new Date(quote.end_date).toLocaleDateString()}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Duration:</span>
              <span class="info-value">${quote.duration_nights} nights, ${quote.duration_days} days</span>
            </div>
          </div>
          <div>
            <div class="info-item">
              <span class="info-label">Total Guests:</span>
              <span class="info-value">${totalGuests}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Adults:</span>
              <span class="info-value">${quote.adults}</span>
            </div>
            ${quote.children_with_bed > 0 ? `
              <div class="info-item">
                <span class="info-label">Children (with bed):</span>
                <span class="info-value">${quote.children_with_bed}</span>
              </div>
            ` : ''}
            ${quote.children_no_bed > 0 ? `
              <div class="info-item">
                <span class="info-label">Children (no bed):</span>
                <span class="info-value">${quote.children_no_bed}</span>
              </div>
            ` : ''}
            ${quote.infants > 0 ? `
              <div class="info-item">
                <span class="info-label">Infants:</span>
                <span class="info-value">${quote.infants}</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Package Options or Single Quote -->
      ${hasMultipleOptions ? `
        <div class="section">
          <div class="section-title">Package Options</div>
          ${quote.quote_options.map((option: any) => `
            <div class="option-card ${option.is_recommended ? 'option-recommended' : ''} ${option.is_selected ? 'option-selected' : ''}">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <div class="option-title">
                    ${option.option_name}
                    ${option.is_recommended ? '<span class="badge">Recommended</span>' : ''}
                    ${option.is_selected ? '<span class="badge selected">Selected</span>' : ''}
                  </div>
                  ${option.option_description ? `<p style="margin: 8px 0; color: #666;">${option.option_description}</p>` : ''}
                </div>
                <div class="option-price">
                  ${option.currency_code} ${option.total_price.toLocaleString()}
                </div>
              </div>
              
              ${option.inclusions && option.inclusions.length > 0 ? `
                <div style="margin-top: 15px;">
                  <strong>Included:</strong>
                  <div class="inclusions">
                    ${option.inclusions.map((inc: string) => `<div class="inclusion-item">${inc}</div>`).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : `
        <!-- Single Quote Pricing -->
        <div class="section">
          <div class="section-title">Quote Summary</div>
          <div class="price-breakdown">
            <div class="price-row">
              <span>Subtotal:</span>
              <span>${quote.currency_code || 'USD'} ${(quote.subtotal || 0).toLocaleString()}</span>
            </div>
            ${quote.markup_percentage > 0 ? `
              <div class="price-row">
                <span>Service Fee (${quote.markup_percentage}%):</span>
                <span>${quote.currency_code || 'USD'} ${(quote.markup_amount || 0).toLocaleString()}</span>
              </div>
            ` : ''}
            <div class="price-row total">
              <span>Total Amount:</span>
              <span>${quote.currency_code || 'USD'} ${(quote.total_amount || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      `}

      <!-- Inclusions -->
      ${quote.inclusions && quote.inclusions.length > 0 ? `
        <div class="section">
          <div class="section-title">What's Included</div>
          <div class="inclusions">
            ${quote.inclusions.map((inc: string) => `<div class="inclusion-item">${inc}</div>`).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Exclusions -->
      ${quote.exclusions && quote.exclusions.length > 0 ? `
        <div class="section">
          <div class="section-title">What's Not Included</div>
          <div class="inclusions">
            ${quote.exclusions.map((exc: string) => `<div class="inclusion-item" style="background: #fef2f2; color: #dc2626;">${exc}</div>`).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Terms & Conditions -->
      ${quote.terms_conditions ? `
        <div class="section">
          <div class="section-title">Terms & Conditions</div>
          <div class="terms">
            ${quote.terms_conditions.replace(/\n/g, '<br>')}
          </div>
        </div>
      ` : ''}

      <!-- Notes -->
      ${quote.notes ? `
        <div class="section">
          <div class="section-title">Additional Notes</div>
          <div class="terms">
            ${quote.notes.replace(/\n/g, '<br>')}
          </div>
        </div>
      ` : ''}

      <!-- Footer -->
      <div class="footer">
        <p>Thank you for choosing ${orgName} for your travel needs!</p>
        <p>This quote was generated on ${new Date().toLocaleDateString()} and is subject to availability and our terms & conditions.</p>
      </div>
    </body>
    </html>
  `;
}

serve(handler);