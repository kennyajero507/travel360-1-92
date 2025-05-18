
import { useState } from "react";
import { Button } from "../ui/button";
import { Save } from "lucide-react";
import HotelForm from "../HotelForm";
import AdditionalHotelDetails from "./AdditionalHotelDetails";
import { Hotel } from "../../types/hotel.types";

interface HotelDetailsTabProps {
  hotelData: Hotel;
  additionalDetails: {
    description: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    hasNegotiatedRate: boolean;
    website: string;
  };
  setAdditionalDetails: (details: any) => void;
  onHotelSubmit: (hotelFormData: any) => void;
  onCancel: () => void;
  handleFormSubmit: (e: React.FormEvent) => void;
}

const HotelDetailsTab = ({
  additionalDetails,
  setAdditionalDetails,
  onHotelSubmit,
  onCancel,
  handleFormSubmit
}: HotelDetailsTabProps) => {
  return (
    <div className="space-y-6 pt-4">
      <HotelForm onSubmit={onHotelSubmit} />
      
      <AdditionalHotelDetails 
        additionalDetails={additionalDetails}
        setAdditionalDetails={setAdditionalDetails}
      />

      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleFormSubmit}>
          <Save className="mr-2 h-4 w-4" />
          Save Hotel Details
        </Button>
      </div>
    </div>
  );
};

export default HotelDetailsTab;
