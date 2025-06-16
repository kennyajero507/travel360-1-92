
import React from 'react';
import PaymentDashboard from '../components/payment/PaymentDashboard';
import MobileResponsiveWrapper from '../components/mobile/MobileResponsiveWrapper';

const PaymentManagement = () => {
  return (
    <MobileResponsiveWrapper>
      <PaymentDashboard />
    </MobileResponsiveWrapper>
  );
};

export default PaymentManagement;
