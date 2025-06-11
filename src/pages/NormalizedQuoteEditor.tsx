
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import NormalizedQuoteBuilder from '../components/quote/NormalizedQuoteBuilder';
import { useRole } from '../contexts/RoleContext';

const NormalizedQuoteEditor = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const { role } = useRole();

  if (!quoteId) {
    return (
      <div className="text-center py-8">
        <p>Quote ID not found</p>
        <Button onClick={() => navigate('/quotes')} className="mt-4">
          Return to Quotes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/quotes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quotes
        </Button>
        <h1 className="text-2xl font-bold">Edit Quote (Normalized)</h1>
      </div>

      <NormalizedQuoteBuilder quoteId={quoteId} userRole={role} />
    </div>
  );
};

export default NormalizedQuoteEditor;
