
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Package, AlertCircle } from 'lucide-react';

const QuotePackageManager: React.FC = () => {
  // For now, package feature is disabled until backend/table is ready.
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          Create Quote Package for Client Selection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Quote package feature will be available soon. Please wait until system update is complete.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default QuotePackageManager;
