
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { Compass, Plus, X, Calendar } from "lucide-react";
import { QuoteActivity } from "../../types/quote.types";

interface ExcursionSectionProps {
  excursions: QuoteActivity[];
  onExcursionsChange: (excursions: QuoteActivity[]) => void;
}

const ExcursionSection: React.FC<ExcursionSectionProps> = ({
  excursions,
  onExcursionsChange
}) => {
  const addExcursion = () => {
    const newExcursion: QuoteActivity = {
      id: `activity-${Date.now()}`,
      name: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      cost_per_person: 0,
      num_people: 1,
      total_cost: 0,
      category: 'sightseeing',
      location: '',
      duration_hours: 4,
      hotel_id: undefined
    };
    
    onExcursionsChange([...excursions, newExcursion]);
  };

  const updateExcursion = (id: string, updates: Partial<QuoteActivity>) => {
    const updatedExcursions = excursions.map(excursion => {
      if (excursion.id === id) {
        const updated = { ...excursion, ...updates };
        updated.total_cost = updated.cost_per_person * updated.num_people;
        return updated;
      }
      return excursion;
    });
    onExcursionsChange(updatedExcursions);
  };

  const removeExcursion = (id: string) => {
    onExcursionsChange(excursions.filter(excursion => excursion.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const activityCategories = [
    'sightseeing',
    'adventure',
    'cultural',
    'entertainment',
    'shopping',
    'dining',
    'wellness',
    'educational'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-purple-600" />
          Activities & Excursions
        </CardTitle>
        <Button onClick={addExcursion} size="sm" className="w-fit">
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {excursions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Compass className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No activities added yet</p>
            <Button onClick={addExcursion} size="sm" className="mt-2">
              Add First Activity
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {excursions.map(excursion => (
              <Card key={excursion.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-3">
                      <div>
                        <Label>Activity Name</Label>
                        <Input
                          value={excursion.name}
                          onChange={(e) => updateExcursion(excursion.id, { name: e.target.value })}
                          placeholder="e.g., City Walking Tour"
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <select
                          value={excursion.category}
                          onChange={(e) => updateExcursion(excursion.id, { category: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          {activityCategories.map(category => (
                            <option key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          value={excursion.location || ''}
                          onChange={(e) => updateExcursion(excursion.id, { location: e.target.value })}
                          placeholder="Activity location"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Date</Label>
                          <Input
                            type="date"
                            value={excursion.date}
                            onChange={(e) => updateExcursion(excursion.id, { date: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Duration (hours)</Label>
                          <Input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={excursion.duration_hours || 4}
                            onChange={(e) => updateExcursion(excursion.id, { duration_hours: parseFloat(e.target.value) || 4 })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Cost per Person</Label>
                          <Input
                            type="number"
                            value={excursion.cost_per_person}
                            onChange={(e) => updateExcursion(excursion.id, { cost_per_person: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label>Number of People</Label>
                          <Input
                            type="number"
                            min="1"
                            value={excursion.num_people}
                            onChange={(e) => updateExcursion(excursion.id, { num_people: parseInt(e.target.value) || 1 })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={excursion.description || ''}
                          onChange={(e) => updateExcursion(excursion.id, { description: e.target.value })}
                          placeholder="Activity details..."
                          rows={3}
                        />
                      </div>
                      <div className="text-right">
                        <div className="mb-2">
                          <span className="text-sm text-gray-600">Total:</span>
                          <Badge variant="outline" className="ml-2 text-purple-600 font-medium">
                            {formatCurrency(excursion.total_cost)}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => removeExcursion(excursion.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {excursions.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Activities:</span>
              <Badge className="bg-purple-600 text-white">
                {formatCurrency(excursions.reduce((sum, excursion) => sum + excursion.total_cost, 0))}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExcursionSection;
