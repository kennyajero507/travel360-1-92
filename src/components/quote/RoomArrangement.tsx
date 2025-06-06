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
    roomType: "",
    adults: 1,
    children: 0,
    infants: 0,
    numRooms: 1,
    costPerAdult: 0,
    costPerChild: 0,
    costPerInfant: 0,
    nights: nights,
  });

  const calculateTotal = (arrangement: Partial<RoomArrangementType>): number => {
    const adults = arrangement.adults || 0;
    const children = arrangement.children || 0;
    const infants = arrangement.infants || 0;
    const numRooms = arrangement.numRooms || 1;
    const nightsCount = arrangement.nights || nights;
    const costPerAdult = arrangement.costPerAdult || 0;
    const costPerChild = arrangement.costPerChild || 0;
    const costPerInfant = arrangement.costPerInfant || 0;

    return (
      (adults * costPerAdult + children * costPerChild + infants * costPerInfant) * 
      numRooms * nightsCount
    );
  };

  const addArrangement = () => {
    if (!newArrangement.roomType) return;

    const arrangement: RoomArrangementType = {
      id: crypto.randomUUID(),
      roomType: newArrangement.roomType,
      adults: newArrangement.adults || 1,
      children: newArrangement.children || 0,
      infants: newArrangement.infants || 0,
      numRooms: newArrangement.numRooms || 1,
      costPerAdult: newArrangement.costPerAdult || 0,
      costPerChild: newArrangement.costPerChild || 0,
      costPerInfant: newArrangement.costPerInfant || 0,
      nights: newArrangement.nights || nights,
      total: calculateTotal(newArrangement),
    };

    onChange([...arrangements, arrangement]);
    setNewArrangement({
      roomType: "",
      adults: 1,
      children: 0,
      infants: 0,
      numRooms: 1,
      costPerAdult: 0,
      costPerChild: 0,
      costPerInfant: 0,
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
              <h4 className="font-medium">{arrangement.roomType}</h4>
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
                <Label className="text-sm">Children</Label>
                <Input
                  type="number"
                  min="0"
                  value={arrangement.children}
                  onChange={(e) => updateArrangement(index, { children: parseInt(e.target.value) || 0 })}
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
                  value={arrangement.numRooms}
                  onChange={(e) => updateArrangement(index, { numRooms: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-sm">Cost per Adult</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={arrangement.costPerAdult}
                  onChange={(e) => updateArrangement(index, { costPerAdult: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label className="text-sm">Cost per Child</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={arrangement.costPerChild}
                  onChange={(e) => updateArrangement(index, { costPerChild: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label className="text-sm">Cost per Infant</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={arrangement.costPerInfant}
                  onChange={(e) => updateArrangement(index, { costPerInfant: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-gray-600">
                {arrangement.numRooms} room(s) × {arrangement.nights} night(s)
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
              value={newArrangement.roomType}
              onValueChange={(value) => setNewArrangement({ ...newArrangement, roomType: value })}
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
              <Label className="text-sm">Children</Label>
              <Input
                type="number"
                min="0"
                value={newArrangement.children || 0}
                onChange={(e) => setNewArrangement({ ...newArrangement, children: parseInt(e.target.value) || 0 })}
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
                value={newArrangement.numRooms || 1}
                onChange={(e) => setNewArrangement({ ...newArrangement, numRooms: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-sm">Cost per Adult</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newArrangement.costPerAdult || 0}
                onChange={(e) => setNewArrangement({ ...newArrangement, costPerAdult: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label className="text-sm">Cost per Child</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newArrangement.costPerChild || 0}
                onChange={(e) => setNewArrangement({ ...newArrangement, costPerChild: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label className="text-sm">Cost per Infant</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newArrangement.costPerInfant || 0}
                onChange={(e) => setNewArrangement({ ...newArrangement, costPerInfant: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-gray-600">
              Total: ${calculateTotal(newArrangement).toFixed(2)}
            </span>
            <Button onClick={addArrangement} disabled={!newArrangement.roomType}>
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
