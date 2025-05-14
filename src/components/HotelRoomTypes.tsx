import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";
import { Input } from "../components/ui/input";
import { RoomType } from "../types/hotel.types";
import { Plus, Edit, Trash } from "lucide-react";
import { toast } from "sonner";

interface HotelRoomTypesProps {
  hotelId: string;
  hotelName: string;
  roomTypes: RoomType[];
  onSaveRoomTypes: (roomTypes: RoomType[]) => void;
  onCancel: () => void;
  onComplete: () => void;
}

const HotelRoomTypes: React.FC<HotelRoomTypesProps> = ({
  hotelId,
  hotelName,
  roomTypes: initialRoomTypes,
  onSaveRoomTypes,
  onCancel,
  onComplete
}) => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(initialRoomTypes);
  const [newRoomType, setNewRoomType] = useState<Omit<RoomType, 'id'>>({
    name: "",
    maxOccupancy: 1,
    bedOptions: "",
    ratePerNight: 0,
    ratePerPersonPerNight: 0,
    amenities: [],
    totalUnits: 1
  });
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: keyof Omit<RoomType, 'id'>) => {
    const value = field === 'maxOccupancy' || field === 'ratePerNight' || field === 'ratePerPersonPerNight' || field === 'totalUnits'
      ? Number(e.target.value)
      : e.target.value;
  
    setNewRoomType(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddRoomType = () => {
    if (!newRoomType.name || !newRoomType.bedOptions || !newRoomType.maxOccupancy || !newRoomType.ratePerNight || !newRoomType.totalUnits) {
      toast.error("Please fill in all room details.");
      return;
    }
  
    const newId = `room-${Date.now()}`;
    const newRoom: RoomType = { id: newId, ...newRoomType };
    setRoomTypes([...roomTypes, newRoom]);
    setNewRoomType({
      name: "",
      maxOccupancy: 1,
      bedOptions: "",
      ratePerNight: 0,
      ratePerPersonPerNight: 0,
      amenities: [],
      totalUnits: 1
    });
  };

  const handleEditRoomType = (roomId: string) => {
    setEditingRoomId(roomId);
    const roomToEdit = roomTypes.find(room => room.id === roomId);
    if (roomToEdit) {
      setNewRoomType({
        name: roomToEdit.name,
        maxOccupancy: roomToEdit.maxOccupancy,
        bedOptions: roomToEdit.bedOptions,
        ratePerNight: roomToEdit.ratePerNight,
        ratePerPersonPerNight: roomToEdit.ratePerPersonPerNight,
        amenities: roomToEdit.amenities,
        totalUnits: roomToEdit.totalUnits
      });
    }
  };

  const handleUpdateRoomType = () => {
    if (!editingRoomId) return;
  
    if (!newRoomType.name || !newRoomType.bedOptions || !newRoomType.maxOccupancy || !newRoomType.ratePerNight || !newRoomType.totalUnits) {
      toast.error("Please fill in all room details.");
      return;
    }
  
    const updatedRoomTypes = roomTypes.map(room =>
      room.id === editingRoomId ? { id: editingRoomId, ...newRoomType } : room
    );
    setRoomTypes(updatedRoomTypes);
    setEditingRoomId(null);
    setNewRoomType({
      name: "",
      maxOccupancy: 1,
      bedOptions: "",
      ratePerNight: 0,
      ratePerPersonPerNight: 0,
      amenities: [],
      totalUnits: 1
    });
  };

  const handleDeleteRoomType = (roomId: string) => {
    setRoomTypes(roomTypes.filter(room => room.id !== roomId));
  };

  const handleSave = () => {
    onSaveRoomTypes(roomTypes);
    onComplete();
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Manage Room Types for {hotelName}</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">{editingRoomId ? 'Edit Room Type' : 'Add New Room Type'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="roomName" className="block text-sm font-medium text-gray-700">Room Type Name</label>
            <Input
              type="text"
              id="roomName"
              value={newRoomType.name}
              onChange={(e) => handleInputChange(e, 'name')}
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="maxOccupancy" className="block text-sm font-medium text-gray-700">Max Occupancy</label>
            <Input
              type="number"
              id="maxOccupancy"
              value={newRoomType.maxOccupancy}
              onChange={(e) => handleInputChange(e, 'maxOccupancy')}
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="bedOptions" className="block text-sm font-medium text-gray-700">Bed Options</label>
            <Input
              type="text"
              id="bedOptions"
              value={newRoomType.bedOptions}
              onChange={(e) => handleInputChange(e, 'bedOptions')}
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="ratePerNight" className="block text-sm font-medium text-gray-700">Rate per Night</label>
            <Input
              type="number"
              id="ratePerNight"
              value={newRoomType.ratePerNight}
              onChange={(e) => handleInputChange(e, 'ratePerNight')}
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="ratePerPersonPerNight" className="block text-sm font-medium text-gray-700">Rate per Person</label>
            <Input
              type="number"
              id="ratePerPersonPerNight"
              value={newRoomType.ratePerPersonPerNight || ''}
              onChange={(e) => handleInputChange(e, 'ratePerPersonPerNight')}
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="totalUnits" className="block text-sm font-medium text-gray-700">Total Units</label>
            <Input
              type="number"
              id="totalUnits"
              value={newRoomType.totalUnits}
              onChange={(e) => handleInputChange(e, 'totalUnits')}
              className="mt-1"
            />
          </div>
        </div>
        <div className="mt-4">
          {editingRoomId ? (
            <Button type="button" variant="secondary" onClick={handleUpdateRoomType}>
              Update Room Type
            </Button>
          ) : (
            <Button type="button" onClick={handleAddRoomType}>
              Add Room Type
            </Button>
          )}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Room Type</TableHead>
            <TableHead>Max Occupancy</TableHead>
            <TableHead>Bed Options</TableHead>
            <TableHead>Rate per Night</TableHead>
            <TableHead>Per Person Rate</TableHead>
            <TableHead>Units</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roomTypes.map((room) => (
            <TableRow key={room.id}>
              <TableCell className="font-medium">{room.name}</TableCell>
              <TableCell>{room.maxOccupancy}</TableCell>
              <TableCell>{room.bedOptions}</TableCell>
              <TableCell>${room.ratePerNight.toFixed(2)}</TableCell>
              <TableCell>${(room.ratePerPersonPerNight || 0).toFixed(2)}</TableCell>
              <TableCell>{room.totalUnits}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handleEditRoomType(room.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteRoomType(room.id)}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end mt-4 gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSave}>
          Save & Complete
        </Button>
      </div>
    </div>
  );
};

export default HotelRoomTypes;
