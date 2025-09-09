import React from 'react';
import { useParams } from 'react-router-dom';
import ClientQuotePortal from '../../components/quotes/ClientQuotePortal';

const ClientPortalPage = () => {
  const { token } = useParams<{ token: string }>();

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Quote Link</h1>
          <p className="text-gray-600">The quote link you followed is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientQuotePortal />
    </div>
  );
};

export default ClientPortalPage;