
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { ClientQuotePreview } from '../types/quote.types';

export const generateQuotePDF = (quotePreview: ClientQuotePreview) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.text(`Travel Quote`, 105, 20, { align: 'center' });
  doc.setFontSize(16);
  doc.text(quotePreview.packageName || `${quotePreview.destination} Package`, 105, 30, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Quote ID: ${quotePreview.id}`, 10, 40);
  doc.text(`Issued Date: ${new Date(quotePreview.createdAt).toLocaleDateString()}`, 190, 40, { align: 'right' });
  
  doc.line(10, 45, 200, 45); // separator

  // Client Information
  doc.setFontSize(14);
  doc.text('Client Information', 10, 55);
  doc.setFontSize(12);
  doc.text(`Name: ${quotePreview.client}`, 15, 65);
  
  // Travel Details
  doc.setFontSize(14);
  doc.text('Travel Details', 10, 80);
  doc.setFontSize(12);
  doc.text(`Destination: ${quotePreview.destination}`, 15, 90);
  doc.text(`Travel Period: ${new Date(quotePreview.startDate).toLocaleDateString()} - ${new Date(quotePreview.endDate).toLocaleDateString()}`, 15, 98);
  doc.text(`Duration: ${quotePreview.duration.days} Days / ${quotePreview.duration.nights} Nights`, 15, 106);
  doc.text(`Travelers: ${quotePreview.travelers.adults} Adults, ${quotePreview.travelers.childrenWithBed || 0} Children`, 15, 114);

  // Hotel Options
  if (quotePreview.hotelOptions && quotePreview.hotelOptions.length > 0) {
    doc.setFontSize(14);
    doc.text('Accommodation Options', 10, 130);
    let y = 140;
    quotePreview.hotelOptions.forEach(hotel => {
      doc.setFontSize(12);
      doc.text(`- ${hotel.name} (${hotel.category})`, 15, y);
      y += 8;
    });
  }
  
  // Total Cost
  doc.setFontSize(16);
  doc.text('Total Estimated Cost', 10, 170);
  doc.setFontSize(18);
  doc.text(`${quotePreview.totalCost.toLocaleString()} ${quotePreview.currency}`, 15, 180);

  doc.save(`Quote-${quotePreview.id}.pdf`);
  toast.success("Quote PDF downloaded.");
};
