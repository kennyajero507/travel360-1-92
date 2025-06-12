
import { useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';

interface RealtimeBookingUpdatesProps {
  onBookingUpdate: () => void;
}

const RealtimeBookingUpdates = ({ onBookingUpdate }: RealtimeBookingUpdatesProps) => {
  useEffect(() => {
    // Subscribe to booking changes
    const bookingChannel = supabase
      .channel('booking-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log('Booking change detected:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              toast.success('New booking created', {
                description: `Booking for ${payload.new.client} has been created`
              });
              break;
            case 'UPDATE':
              if (payload.old.status !== payload.new.status) {
                toast.info('Booking status updated', {
                  description: `Status changed from ${payload.old.status} to ${payload.new.status}`
                });
              }
              break;
            case 'DELETE':
              toast.info('Booking deleted');
              break;
          }
          
          onBookingUpdate();
        }
      )
      .subscribe();

    // Subscribe to payment changes
    const paymentChannel = supabase
      .channel('payment-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        (payload) => {
          console.log('Payment change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            toast.success('New payment recorded', {
              description: `Payment of $${payload.new.amount} has been recorded`
            });
          } else if (payload.eventType === 'UPDATE' && payload.old.payment_status !== payload.new.payment_status) {
            toast.info('Payment status updated', {
              description: `Payment status changed to ${payload.new.payment_status}`
            });
          }
          
          onBookingUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingChannel);
      supabase.removeChannel(paymentChannel);
    };
  }, [onBookingUpdate]);

  return null; // This component doesn't render anything
};

export default RealtimeBookingUpdates;
