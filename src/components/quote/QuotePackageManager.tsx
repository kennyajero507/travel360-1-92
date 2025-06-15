import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Package, AlertCircle } from 'lucide-react';

const QuotePackageManager: React.FC = () => {
  // To be implemented: actual quote packages DB logic
  // For now, keep feature stub
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
            Quote package feature will be enabled soon. The database infrastructure is now ready; please ask to finalize the UI logic when ready to use live data!
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default QuotePackageManager;
