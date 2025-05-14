
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";

interface AdditionalDetailsProps {
  additionalDetails: {
    description: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    hasNegotiatedRate: boolean;
    website: string;
  };
  setAdditionalDetails: (details: any) => void;
}

const AdditionalHotelDetails = ({ 
  additionalDetails, 
  setAdditionalDetails 
}: AdditionalDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Hotel Description
            </label>
            <textarea
              id="description"
              className="w-full min-h-[100px] p-3 border rounded-md bg-white text-black"
              value={additionalDetails.description}
              onChange={(e) => setAdditionalDetails({ ...additionalDetails, description: e.target.value })}
              placeholder="Describe the hotel, its features, and any special notes"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium mb-2">
                Contact Person
              </label>
              <Input
                id="contactPerson"
                value={additionalDetails.contactPerson}
                onChange={(e) => setAdditionalDetails({ ...additionalDetails, contactPerson: e.target.value })}
                placeholder="Hotel contact person"
                className="bg-white text-black"
              />
            </div>
            
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium mb-2">
                Contact Email
              </label>
              <Input
                id="contactEmail"
                type="email"
                value={additionalDetails.contactEmail}
                onChange={(e) => setAdditionalDetails({ ...additionalDetails, contactEmail: e.target.value })}
                placeholder="Contact email address"
                className="bg-white text-black"
              />
            </div>
            
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium mb-2">
                Contact Phone
              </label>
              <Input
                id="contactPhone"
                value={additionalDetails.contactPhone}
                onChange={(e) => setAdditionalDetails({ ...additionalDetails, contactPhone: e.target.value })}
                placeholder="Contact phone number"
                className="bg-white text-black"
              />
            </div>
            
            <div>
              <label htmlFor="website" className="block text-sm font-medium mb-2">
                Hotel Website
              </label>
              <Input
                id="website"
                type="url"
                value={additionalDetails.website}
                onChange={(e) => setAdditionalDetails({ ...additionalDetails, website: e.target.value })}
                placeholder="e.g., https://www.hotelwebsite.com"
                className="bg-white text-black"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="hasNegotiatedRate"
              checked={additionalDetails.hasNegotiatedRate}
              onCheckedChange={(checked) => 
                setAdditionalDetails({ ...additionalDetails, hasNegotiatedRate: checked === true })
              }
            />
            <label htmlFor="hasNegotiatedRate" className="text-sm font-medium">
              This hotel has negotiated rates (special contract rates)
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdditionalHotelDetails;
