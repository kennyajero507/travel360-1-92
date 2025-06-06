
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Trash2, Plus } from "lucide-react";
import { RoomArrangement as RoomArrangementType } from "../../types/quote.types";

interface RoomArrangementProps {
  arrangements: RoomArrangementType[];
  onChange: (arrangements: RoomArrangementType[]) => void;
  nights: number;
}

const RoomArrangement: React.FC<RoomArrangementProps> = ({
  arrangements,
  onChange,
  nights,
}) => {
  const [newArrangement, setNewArrangement] = useState<Partial<RoomArrangementType>>({
    room_type: "",
    adults: 1,
    children_with_bed: 0,
    children_no_bed: 0,
    infants: 0,
    num_rooms: 1,
    rate_per_night: {
      adult: 0,
      childWithBed: 0,
      childNoBed: 0,
      infant: 0
    },
    nights: nights,
  });

  const calculateTotal = (arrangement: Partial<RoomArrangementType>): number => {
    const adults = arrangement.adults || 0;
    const childrenWithBed = arrangement.children_with_bed || 0;
    const childrenNoBed = arrangement.children_no_bed || 0;
    const infants = arrangement.infants || 0;
    const numRooms = arrangement.num_rooms || 1;
    const nightsCount = arrangement.nights || nights;
    const ratePerNight = arrangement.rate_per_night;

    if (!ratePerNight) return 0;

    return (
      (adults * ratePerNight.adult + 
       childrenWithBed * ratePerNight.childWithBed + 
       childrenNoBed * ratePerNight.childNoBed + 
       infants * ratePerNight.infant) * 
      numRooms * nightsCount
    );
  };

  const addArrangement = () => {
    if (!newArrangement.room_type) return;

    const arrangement: RoomArrangementType = {
      id: crypto.randomUUID(),
      room_type: newArrangement.room_type,
      adults: newArrangement.adults || 1,
      children_with_bed: newArrangement.children_with_bed || 0,
      children_no_bed: newArrangement.children_no_bed || 0,
      infants: newArrangement.infants || 0,
      num_rooms: newArrangement.num_rooms || 1,
      rate_per_night: newArrangement.rate_per_night || {
        adult: 0,
        childWithBed: 0,
        childNoBed: 0,
        infant: 0
      },
      nights: newArrangement.nights || nights,
      total: calculateTotal(newArrangement),
    };

    onChange([...arrangements, arrangement]);
    setNewArrangement({
      room_type: "",
      adults: 1,
      children_with_bed: 0,
      children_no_bed: 0,
      infants: 0,
      num_rooms: 1,
      rate_per_night: {
        adult: 0,
        childWithBed: 0,
        childNoBed: 0,
        infant: 0
      },
      nights: nights,
    });
  };

  const updateArrangement = (index: number, updates: Partial<RoomArrangementType>) => {
    const updatedArrangements = [...arrangements];
    const updated = { ...updatedArrangements[index], ...updates };
    updated.total = calculateTotal(updated);
    updatedArrangements[index] = updated;
    onChange(updatedArrangements);
  };

  const removeArrangement = (index: number) => {
    const updatedArrangements = arrangements.filter((_, i) => i !== index);
    onChange(updatedArrangements);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Arrangements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Arrangements */}
        {arrangements.map((arrangement, index) => (
          <div key={arrangement.id} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">{arrangement.room_type}</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeArrangement(index)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <Label className="text-sm">Adults</Label>
                <Input
                  type="number"
                  min="0"
                  value={arrangement.adults}
                  onChange={(e) => updateArrangement(index, { adults: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label className="text-sm">Children with Bed</Label>
                <Input
                  type="number"
                  min="0"
                  value={arrangement.children_with_bed}
                  onChange={(e) => updateArrangement(index, { children_with_bed: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label className="text-sm">Children no Bed</Label>
                <Input
                  type="number"
                  min="0"
                  value={arrangement.children_no_bed}
                  onChange={(e) => updateArrangement(index, { children_no_bed: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label className="text-sm">Infants</Label>
                <Input
                  type="number"
                  min="0"
                  value={arrangement.infants}
                  onChange={(e) => updateArrangement(index, { infants: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label className="text-sm">Rooms</Label>
                <Input
                  type="number"
                  min="1"
                  value={arrangement.num_rooms}
                  onChange={(e) => updateArrangement(index, { num_rooms: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label className="text-sm">Cost per Adult</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={arrangement.rate_per_night.adult}
                  onChange={(e) => updateArrangement(index, { 
                    rate_per_night: {
                      ...arrangement.rate_per_night,
                      adult: parseFloat(e.target.value) || 0
                    }
                  })}
                />
              </div>
              <div>
                <Label className="text-sm">Cost per Child with Bed</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={arrangement.rate_per_night.childWithBed}
                  onChange={(e) => updateArrangement(index, { 
                    rate_per_night: {
                      ...arrangement.rate_per_night,
                      childWithBed: parseFloat(e.target.value) || 0
                    }
                  })}
                />
              </div>
              <div>
                <Label className="text-sm">Cost per Child no Bed</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={arrangement.rate_per_night.childNoBed}
                  onChange={(e) => updateArrangement(index, { 
                    rate_per_night: {
                      ...arrangement.rate_per_night,
                      childNoBed: parseFloat(e.target.value) || 0
                    }
                  })}
                />
              </div>
              <div>
                <Label className="text-sm">Cost per Infant</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={arrangement.rate_per_night.infant}
                  onChange={(e) => updateArrangement(index, { 
                    rate_per_night: {
                      ...arrangement.rate_per_night,
                      infant: parseFloat(e.target.value) || 0
                    }
                  })}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-gray-600">
                {arrangement.num_rooms} room(s) × {arrangement.nights} night(s)
              </span>
              <span className="font-bold text-lg">${arrangement.total.toFixed(2)}</span>
            </div>
          </div>
        ))}

        {/* Add New Arrangement */}
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg space-y-3">
          <h4 className="font-medium">Add Room Arrangement</h4>

          <div>
            <Label className="text-sm">Room Type</Label>
            <Select
              value={newArrangement.room_type}
              onValueChange={(value) => setNewArrangement({ ...newArrangement, room_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard Room">Standard Room</SelectItem>
                <SelectItem value="Deluxe Room">Deluxe Room</SelectItem>
                <SelectItem value="Suite">Suite</SelectItem>
                <SelectItem value="Family Room">Family Room</SelectItem>
                <SelectItem value="Single Room">Single Room</SelectItem>
                <SelectItem value="Double Room">Double Room</SelectItem>
                <SelectItem value="Twin Room">Twin Room</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-sm">Adults</Label>
              <Input
                type="number"
                min="0"
                value={newArrangement.adults || 1}
                onChange={(e) => setNewArrangement({ ...newArrangement, adults: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <Label className="text-sm">Children with Bed</Label>
              <Input
                type="number"
                min="0"
                value={newArrangement.children_with_bed || 0}
                onChange={(e) => setNewArrangement({ ...newArrangement, children_with_bed: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label className="text-sm">Children no Bed</Label>
              <Input
                type="number"
                min="0"
                value={newArrangement.children_no_bed || 0}
                onChange={(e) => setNewArrangement({ ...newArrangement, children_no_bed: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label className="text-sm">Infants</Label>
              <Input
                type="number"
                min="0"
                value={newArrangement.infants || 0}
                onChange={(e) => setNewArrangement({ ...newArrangement, infants: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label className="text-sm">Rooms</Label>
              <Input
                type="number"
                min="1"
                value={newArrangement.num_rooms || 1}
                onChange={(e) => setNewArrangement({ ...newArrangement, num_rooms: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <Label className="text-sm">Cost per Adult</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newArrangement.rate_per_night?.adult || 0}
                onChange={(e) => setNewArrangement({ 
                  ...newArrangement, 
                  rate_per_night: {
                    ...newArrangement.rate_per_night!,
                    adult: parseFloat(e.target.value) || 0
                  }
                })}
              />
            </div>
            <div>
              <Label className="text-sm">Cost per Child with Bed</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newArrangement.rate_per_night?.childWithBed || 0}
                onChange={(e) => setNewArrangement({ 
                  ...newArrangement, 
                  rate_per_night: {
                    ...newArrangement.rate_per_night!,
                    childWithBed: parseFloat(e.target.value) || 0
                  }
                })}
              />
            </div>
            <div>
              <Label className="text-sm">Cost per Child no Bed</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newArrangement.rate_per_night?.childNoBed || 0}
                onChange={(e) => setNewArrangement({ 
                  ...newArrangement, 
                  rate_per_night: {
                    ...newArrangement.rate_per_night!,
                    childNoBed: parseFloat(e.target.value) || 0
                  }
                })}
              />
            </div>
            <div>
              <Label className="text-sm">Cost per Infant</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newArrangement.rate_per_night?.infant || 0}
                onChange={(e) => setNewArrangement({ 
                  ...newArrangement, 
                  rate_per_night: {
                    ...newArrangement.rate_per_night!,
                    infant: parseFloat(e.target.value) || 0
                  }
                })}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-gray-600">
              Total: ${calculateTotal(newArrangement).toFixed(2)}
            </span>
            <Button onClick={addArrangement} disabled={!newArrangement.room_type}>
              <Plus className="h-4 w-4 mr-2" />
              Add Arrangement
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomArrangement;
