
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Building2 } from 'lucide-react';

const Suppliers = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
        <p className="text-gray-600 mt-2">Manage your travel suppliers and vendor relationships</p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-green-600" />
            <CardTitle>Supplier Management</CardTitle>
          </div>
          <CardDescription>
            Manage your network of hotels, transport providers, and tour operators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This feature is coming soon. You'll be able to manage your supplier database, 
            track contracts, compare rates, and maintain vendor relationships.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Suppliers;
