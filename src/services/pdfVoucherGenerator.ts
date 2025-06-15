
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { TravelVoucher, Booking } from '../types/booking.types';

export const generateVoucherPDF = (voucher: TravelVoucher, booking: Booking) => {
  const doc = new jsPDF();
  
  doc.setFontSize(22);
  doc.text(`Travel Voucher`, 105, 20, { align: 'center' });
  doc.setFontSize(16);
  doc.text(voucher.voucher_reference, 105, 30, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Issued Date: ${new Date(voucher.issued_date).toLocaleDateString()}`, 10, 40);
  doc.text(`Booking Ref: ${booking.booking_reference}`, 190, 40, { align: 'right' });
  
  doc.line(10, 45, 200, 45); // separator

  doc.setFontSize(14);
  doc.text('Guest Information', 10, 55);
  doc.setFontSize(12);
  doc.text(`Name: ${booking.client}`, 15, 65);
  
  doc.setFontSize(14);
  doc.text('Hotel Information', 10, 80);
  doc.setFontSize(12);
  doc.text(`Hotel: ${booking.hotel_name}`, 15, 90);
  doc.text(`Travel Period: ${new Date(booking.travel_start).toLocaleDateString()} - ${new Date(booking.travel_end).toLocaleDateString()}`, 15, 98);

  if (booking.room_arrangement && Array.isArray(booking.room_arrangement)) {
    doc.setFontSize(14);
    doc.text('Room Arrangements', 10, 113);
    let y = 123;
    booking.room_arrangement.forEach(room => {
      doc.setFontSize(12);
      doc.text(`- ${room.room_type || 'Room'}: ${room.adults || 0} Adults, ${room.children_with_bed || 0} Children with Bed, ${room.children_no_bed || 0} Children no Bed`, 15, y);
      y += 8;
    });
  }

  if (voucher.notes || booking.notes) {
    doc.setFontSize(14);
    doc.text('Notes', 10, 150);
    doc.setFontSize(12);
    const notes = voucher.notes || booking.notes || '';
    const splitNotes = doc.splitTextToSize(notes, 180);
    doc.text(splitNotes, 15, 160);
  }

  doc.save(`Voucher-${voucher.voucher_reference}.pdf`);
  toast.success("Voucher PDF downloaded.");
};
