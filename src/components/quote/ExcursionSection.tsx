
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Plus, X, MapPin, Calendar } from "lucide-react";
import MarkupCalculator from "./MarkupCalculator";

interface Excursion {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  duration: string;
  participants: number;
  cost_per_person: number;
  total_cost: number;
  category: 'sightseeing' | 'adventure' | 'cultural' | 'nature' | 'food' | 'shopping';
  included: string[];
  excluded: string[];
}

interface ExcursionSectionProps {
  excursions: Excursion[];
  onExcursionsChange: (excursions: Excursion[]) => void;
}

const ExcursionSection: React.FC<ExcursionSectionProps> = ({
  excursions,
  onExcursionsChange
}) => {
  const [newExcursion, setNewExcursion] = useState<Partial<Excursion>>({
    title: '',
    description: '',
    location: '',
    date: '',
    duration: '',
    participants: 1,
    cost_per_person: 0,
    category: 'sightseeing',
    included: [],
    excluded: []
  });

  const addExcursion = () => {
    if (!newExcursion.title || !newExcursion.location || !newExcursion.date) {
      return;
    }

    const excursion: Excursion = {
      id: `excursion-${Date.now()}`,
      title: newExcursion.title!,
      description: newExcursion.description || '',
      location: newExcursion.location!,
      date: newExcursion.date!,
      duration: newExcursion.duration || '',
      participants: newExcursion.participants || 1,
      cost_per_person: newExcursion.cost_per_person || 0,
      total_cost: (newExcursion.participants || 1) * (newExcursion.cost_per_person || 0),
      category: newExcursion.category as Excursion['category'],
      included: newExcursion.included || [],
      excluded: newExcursion.excluded || []
    };

    onExcursionsChange([...excursions, excursion]);
    
    // Reset form
    setNewExcursion({
      title: '',
      description: '',
      location: '',
      date: '',
      duration: '',
      participants: 1,
      cost_per_person: 0,
      category: 'sightseeing',
      included: [],
      excluded: []
    });
  };

  const updateExcursion = (id: string, updates: Partial<Excursion>) => {
    const updated = excursions.map(excursion => {
      if (excursion.id === id) {
        const updatedExcursion = { ...excursion, ...updates };
        // Recalculate total cost
        updatedExcursion.total_cost = updatedExcursion.participants * updatedExcursion.cost_per_person;
        return updatedExcursion;
      }
      return excursion;
    });
    onExcursionsChange(updated);
  };

  const removeExcursion = (id: string) => {
    onExcursionsChange(excursions.filter(e => e.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalExcursionCost = excursions.reduce((sum, excursion) => sum + excursion.total_cost, 0);

  const categoryColors = {
    sightseeing: 'bg-blue-100 text-blue-800',
    adventure: 'bg-red-100 text-red-800',
    cultural: 'bg-purple-100 text-purple-800',
    nature: 'bg-green-100 text-green-800',
    food: 'bg-orange-100 text-orange-800',
    shopping: 'bg-pink-100 text-pink-800'
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <MapPin className="h-5 w-5 text-green-600" />
        <CardTitle>Quote Excursion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Excursion Form */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-4">Add Excursion</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Excursion Title"
              value={newExcursion.title}
              onChange={(e) => setNewExcursion({...newExcursion, title: e.target.value})}
            />
            
            <Input
              placeholder="Location"
              value={newExcursion.location}
              onChange={(e) => setNewExcursion({...newExcursion, location: e.target.value})}
            />
            
            <Input
              type="date"
              value={newExcursion.date}
              onChange={(e) => setNewExcursion({...newExcursion, date: e.target.value})}
            />
            
            <Input
              placeholder="Duration (e.g., 4 hours, Full day)"
              value={newExcursion.duration}
              onChange={(e) => setNewExcursion({...newExcursion, duration: e.target.value})}
            />
            
            <Select
              value={newExcursion.category}
              onValueChange={(value: Excursion['category']) => 
                setNewExcursion({...newExcursion, category: value})
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sightseeing">Sightseeing</SelectItem>
                <SelectItem value="adventure">Adventure</SelectItem>
                <SelectItem value="cultural">Cultural</SelectItem>
                <SelectItem value="nature">Nature</SelectItem>
                <SelectItem value="food">Food & Dining</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Participants"
                min="1"
                value={newExcursion.participants}
                onChange={(e) => setNewExcursion({...newExcursion, participants: parseInt(e.target.value) || 1})}
              />
              
              <Input
                type="number"
                placeholder="Cost per person"
                min="0"
                step="0.01"
                value={newExcursion.cost_per_person}
                onChange={(e) => setNewExcursion({...newExcursion, cost_per_person: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Textarea
              placeholder="Description"
              value={newExcursion.description}
              onChange={(e) => setNewExcursion({...newExcursion, description: e.target.value})}
              rows={3}
            />
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button onClick={addExcursion} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-1" />
              Add Excursion
            </Button>
          </div>
        </div>

        {/* Excursions List */}
        {excursions.length > 0 && (
          <div className="space-y-4">
            {excursions.map((excursion) => (
              <div key={excursion.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Input
                        value={excursion.title}
                        onChange={(e) => updateExcursion(excursion.id, { title: e.target.value })}
                        className="font-medium text-lg"
                      />
                      <span className={`px-2 py-1 rounded text-xs ${categoryColors[excursion.category]}`}>
                        {excursion.category}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <Input
                          value={excursion.location}
                          onChange={(e) => updateExcursion(excursion.id, { location: e.target.value })}
                          placeholder="Location"
                          className="text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <Input
                          type="date"
                          value={excursion.date}
                          onChange={(e) => updateExcursion(excursion.id, { date: e.target.value })}
                          className="text-sm"
                        />
                      </div>
                      <Input
                        value={excursion.duration}
                        onChange={(e) => updateExcursion(excursion.id, { duration: e.target.value })}
                        placeholder="Duration"
                        className="text-sm"
                      />
                      <div className="text-right">
                        <span className="text-lg font-semibold text-green-600">
                          {formatCurrency(excursion.total_cost)}
                        </span>
                      </div>
                    </div>
                    <Textarea
                      value={excursion.description}
                      onChange={(e) => updateExcursion(excursion.id, { description: e.target.value })}
                      placeholder="Description"
                      rows={2}
                      className="mb-3"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={excursion.participants}
                        onChange={(e) => updateExcursion(excursion.id, { participants: parseInt(e.target.value) || 1 })}
                        placeholder="Participants"
                      />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={excursion.cost_per_person}
                        onChange={(e) => updateExcursion(excursion.id, { cost_per_person: parseFloat(e.target.value) || 0 })}
                        placeholder="Cost per person"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExcursion(excursion.id)}
                    className="text-red-600 hover:text-red-800 ml-4"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {excursions.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No excursions added yet</p>
            <p className="text-sm text-gray-400">Add sightseeing tours, activities, and experiences</p>
          </div>
        )}

        {/* Excursion Total with Markup */}
        {totalExcursionCost > 0 && (
          <div className="border-t pt-4">
            <MarkupCalculator
              basePrice={totalExcursionCost}
              initialMarkup={20}
              onMarkupChange={(calculation) => {
                // Handle markup calculation
                console.log('Excursion markup:', calculation);
              }}
              label="Excursions"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExcursionSection;
