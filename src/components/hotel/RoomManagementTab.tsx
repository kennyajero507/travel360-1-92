
import { Button } from "../ui/button";
import { Save } from "lucide-react";
import HotelRoomManagement from "../HotelRoomManagement";
import { RoomType } from "../../types/hotel.types";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface RoomManagementTabProps {
  hotelId: string;
  hotelName: string;
  roomTypes: RoomType[];
  onSaveRoomTypes: (roomTypes: RoomType[]) => void;
  onCancel: () => void;
  onComplete: () => void;
}

const RoomManagementTab = ({
  hotelId,
  hotelName,
  roomTypes: initialRoomTypes,
  onSaveRoomTypes,
  onCancel,
  onComplete
}: RoomManagementTabProps) => {
  const [currentRoomTypes, setCurrentRoomTypes] = useState<RoomType[]>(initialRoomTypes);
  
  // Update local state when props change
  useEffect(() => {
    setCurrentRoomTypes(initialRoomTypes);
  }, [initialRoomTypes]);
  
  // Handle room types updates from the room management component
  const handleRoomTypesUpdate = (updatedRoomTypes: RoomType[]) => {
    setCurrentRoomTypes(updatedRoomTypes);
  };
  
  // Save room types and complete the process
  const handleSave = () => {
    onSaveRoomTypes(currentRoomTypes);
    toast.success("Room types saved successfully!");
  };
  
  // Complete the hotel setup
  const handleComplete = () => {
    onSaveRoomTypes(currentRoomTypes);
    toast.success("Hotel and rooms saved successfully!");
    onComplete();
  };

  if (!hotelName) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-gray-500 mb-4">Please save hotel details first before managing rooms</p>
        <Button onClick={() => {
          const detailsTab = document.getElementById("hotel-details-tab");
          if (detailsTab) {
            (detailsTab as HTMLButtonElement).click();
          }
        }}>
          Return to Hotel Details
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HotelRoomManagement 
        hotelId={hotelId} 
        hotelName={hotelName}
        onSaveRoomTypes={handleRoomTypesUpdate}
        initialRoomTypes={currentRoomTypes}
      />
      
      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="button" 
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Room Types
        </Button>
        <Button 
          type="button" 
          onClick={handleComplete}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="mr-2 h-4 w-4" />
          Complete Hotel Setup
        </Button>
      </div>
    </div>
  );
};

export default RoomManagementTab;
