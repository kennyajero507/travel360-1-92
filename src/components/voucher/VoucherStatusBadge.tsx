
import React from 'react';
import { Badge } from '../ui/badge';

interface VoucherStatusBadgeProps {
  status: 'pending' | 'issued' | 'sent' | 'used';
}

const VoucherStatusBadge = ({ status }: VoucherStatusBadgeProps) => {
  const variants = {
    pending: { variant: 'secondary' as const, color: 'text-yellow-700 bg-yellow-100' },
    issued: { variant: 'default' as const, color: 'text-blue-700 bg-blue-100' },
    sent: { variant: 'default' as const, color: 'text-green-700 bg-green-100' },
    used: { variant: 'outline' as const, color: 'text-gray-700 bg-gray-100' }
  };

  const config = variants[status];

  return (
    <Badge variant={config.variant} className={config.color}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default VoucherStatusBadge;
