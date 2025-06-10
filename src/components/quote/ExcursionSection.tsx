
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { DatePicker } from "../ui/date-picker";
import { QuoteActivity } from "../../types/quote.types";
import { Compass, Trash, Plus, Edit, Check } from "lucide-react";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";

interface ExcursionSectionProps {
  excursions: QuoteActivity[];
  onExcursionsChange: (excursions: QuoteActivity[]) => void;
}

const ExcursionSection: React.FC<ExcursionSectionProps> = ({ excursions, onExcursionsChange }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [excursion, setExcursion] = useState<QuoteActivity>({
    id: `activity-${Date.now()}`,
    name: "",
    description: "",
    date: new Date().toISOString(),
    cost_per_person: 0,
    num_people: 1,
    total_cost: 0
  });

  const handleInputChange = (field: string, value: any) => {
    setExcursion(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate total cost
      if (field === "cost_per_person" || field === "num_people") {
        updated.total_cost = updated.cost_per_person * updated.num_people;
      }
      
      return updated;
    });
  };

  const handleAdd = () => {
    const newExcursion = {
      ...excursion,
      id: `activity-${Date.now()}`,
      total_cost: excursion.cost_per_person * excursion.num_people
    };
    
    onExcursionsChange([...excursions, newExcursion]);
    resetForm();
    setIsAdding(false);
  };

  const handleEdit = (index: number) => {
    setExcursion(excursions[index]);
    setEditingIndex(index);
  };

  const handleUpdate = () => {
    if (editingIndex === null) return;
    
    const updatedExcursion = {
      ...excursion,
      total_cost: excursion.cost_per_person * excursion.num_people
    };
    
    const updatedExcursions = [...excursions];
    updatedExcursions[editingIndex] = updatedExcursion;
    onExcursionsChange(updatedExcursions);
    
    resetForm();
  };

  const handleDelete = (index: number) => {
    const updatedExcursions = [...excursions];
    updatedExcursions.splice(index, 1);
    onExcursionsChange(updatedExcursions);
  };

  const resetForm = () => {
    setExcursion({
      id: `activity-${Date.now()}`,
      name: "",
      description: "",
      date: new Date().toISOString(),
      cost_per_person: 0,
      num_people: 1,
      total_cost: 0
    });
    setEditingIndex(null);
  };

  const cancelForm = () => {
    resetForm();
    setIsAdding(false);
  };

  const categories = [
    "sightseeing", 
    "adventure", 
    "cultural", 
    "water_activity", 
    "nature", 
    "entertainment",
    "guided_tour"
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-blue-600" />
            Excursions & Activities
          </CardTitle>
          {!isAdding && editingIndex === null && (
            <Button 
              size="sm"
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Excursion
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Excursion form */}
        {(isAdding || editingIndex !== null) && (
          <div className="space-y-4 p-4 border rounded-md bg-gray-50 mb-4">
            <h3 className="font-medium">{editingIndex !== null ? "Edit Excursion" : "Add New Excursion"}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="excursion-name">Activity Name</Label>
                <Input
                  id="excursion-name"
                  value={excursion.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="excursion-category">Category</Label>
                <Select
                  value={excursion.category || "sightseeing"}
                  onValueChange={(value) => handleInputChange("category", value)}
                >
                  <SelectTrigger id="excursion-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="excursion-date">Date</Label>
                <DatePicker
                  date={excursion.date ? new Date(excursion.date) : undefined}
                  onSelect={(date) => 
                    handleInputChange("date", date ? date.toISOString() : new Date().toISOString())
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="excursion-location">Location</Label>
                <Input
                  id="excursion-location"
                  value={excursion.location || ""}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="excursion-description">Description</Label>
                <Textarea
                  id="excursion-description"
                  value={excursion.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="excursion-cost">Cost Per Person</Label>
                <Input
                  id="excursion-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={excursion.cost_per_person}
                  onChange={(e) => handleInputChange("cost_per_person", parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="excursion-people">Number of People</Label>
                <Input
                  id="excursion-people"
                  type="number"
                  min="1"
                  value={excursion.num_people}
                  onChange={(e) => handleInputChange("num_people", parseInt(e.target.value) || 1)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Total Cost</Label>
                <div className="p-2 bg-gray-100 border rounded-md font-medium">
                  ${(excursion.cost_per_person * excursion.num_people).toFixed(2)}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={cancelForm}
              >
                Cancel
              </Button>
              <Button
                onClick={editingIndex !== null ? handleUpdate : handleAdd}
                disabled={!excursion.name || excursion.cost_per_person <= 0}
              >
                <Check className="h-4 w-4 mr-1" />
                {editingIndex !== null ? "Update" : "Add"} Excursion
              </Button>
            </div>
          </div>
        )}
        
        {/* Excursion list */}
        {excursions.length > 0 ? (
          <div className="space-y-3">
            {excursions.map((item, index) => (
              <div key={item.id || index} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {item.category && (
                      <Badge className="capitalize" variant="outline">
                        {item.category.replace('_', ' ')}
                      </Badge>
                    )}
                    <h4 className="font-medium">{item.name}</h4>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(item.date).toLocaleDateString()}
                    {item.location && <span> | {item.location}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${item.total_cost.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">
                    ${item.cost_per_person.toFixed(2)} × {item.num_people} people
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(index)}
                    disabled={isAdding || editingIndex !== null}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(index)}
                    className="text-red-500"
                    disabled={isAdding || editingIndex !== null}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No excursions added yet. Click "Add Excursion" to get started.
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="w-full flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {excursions.length} excursion{excursions.length !== 1 ? 's' : ''} added
          </div>
          <div className="font-medium">
            Total: ${excursions.reduce((sum, item) => sum + item.total_cost, 0).toFixed(2)}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ExcursionSection;
