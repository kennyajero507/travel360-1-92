
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { MapPin } from 'lucide-react';

const Itineraries = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Itineraries</h1>
        <p className="text-gray-600 mt-2">Manage your travel itineraries and tour packages</p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <CardTitle>Itinerary Management</CardTitle>
          </div>
          <CardDescription>
            Create and manage detailed travel itineraries for your clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This feature is coming soon. You'll be able to create detailed day-by-day itineraries, 
            manage tour packages, and provide comprehensive travel plans to your clients.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Itineraries;
