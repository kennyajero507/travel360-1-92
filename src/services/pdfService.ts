
import { supabase } from "../integrations/supabase/client";

class PDFService {
  async generateVoucherPDF(voucherData: any): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-pdf', {
        body: {
          type: 'voucher',
          data: voucherData,
          template: 'voucher_template',
        },
      });

      if (error) {
        console.error('Error generating voucher PDF:', error);
        return null;
      }

      return data.pdfUrl;
    } catch (error) {
      console.error('Error in PDF service:', error);
      return null;
    }
  }

  async generateInvoicePDF(invoiceData: any): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-pdf', {
        body: {
          type: 'invoice',
          data: invoiceData,
          template: 'invoice_template',
        },
      });

      if (error) {
        console.error('Error generating invoice PDF:', error);
        return null;
      }

      return data.pdfUrl;
    } catch (error) {
      console.error('Error in PDF service:', error);
      return null;
    }
  }

  async generateQuotePDF(quoteData: any): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-pdf', {
        body: {
          type: 'quote',
          data: quoteData,
          template: 'quote_template',
        },
      });

      if (error) {
        console.error('Error generating quote PDF:', error);
        return null;
      }

      return data.pdfUrl;
    } catch (error) {
      console.error('Error in PDF service:', error);
      return null;
    }
  }
}

export const pdfService = new PDFService();
