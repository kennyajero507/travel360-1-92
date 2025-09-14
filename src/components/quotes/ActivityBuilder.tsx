import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/quoteCalculations';
import type { Activity } from '@/types/quote';

interface ActivityBuilderProps {
  activities: Activity[];
  onActivitiesChange: (activities: Activity[]) => void;
  currencyCode: string;
  defaultParticipants: number;
}

export const ActivityBuilder: React.FC<ActivityBuilderProps> = ({
  activities,
  onActivitiesChange,
  currencyCode,
  defaultParticipants
}) => {
  const addActivity = () => {
    const newActivity: Activity = {
      id: `activity_${Date.now()}`,
      name: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      cost_per_person: 0,
      num_people: defaultParticipants,
      total_cost: 0,
      category: '',
      location: '',
      duration_hours: 1
    };
    onActivitiesChange([...activities, newActivity]);
  };

  const updateActivity = (index: number, updates: Partial<Activity>) => {
    const updated = activities.map((activity, i) => {
      if (i === index) {
        const updatedActivity = { ...activity, ...updates };
        // Recalculate total cost
        updatedActivity.total_cost = updatedActivity.cost_per_person * updatedActivity.num_people;
        return updatedActivity;
      }
      return activity;
    });
    onActivitiesChange(updated);
  };

  const removeActivity = (index: number) => {
    onActivitiesChange(activities.filter((_, i) => i !== index));
  };

  const getTotalCost = () => {
    return activities.reduce((total, activity) => total + activity.total_cost, 0);
  };

  const activityTypes = [
    'Game Drive',
    'Walking Safari',
    'Boat Safari',
    'Cultural Visit',
    'Hot Air Balloon',
    'Nature Walk',
    'Bird Watching',
    'Photography Safari',
    'Community Visit',
    'Conservation Activity',
    'Adventure Sport',
    'Spa/Wellness',
    'Other'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Activities & Excursions
          <Badge variant="secondary">
            Total: {formatCurrency(getTotalCost(), currencyCode)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity, index) => (
          <Card key={activity.id || index} className="border-dashed">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Activity Name</Label>
                  <Input
                    value={activity.name}
                    onChange={(e) => updateActivity(index, { name: e.target.value })}
                    placeholder="e.g., Masai Mara Game Drive"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Activity Category</Label>
                  <Select
                    value={activity.category}
                    onValueChange={(value) => updateActivity(index, { category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity category" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={activity.location}
                    onChange={(e) => updateActivity(index, { location: e.target.value })}
                    placeholder="e.g., Masai Mara National Reserve"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Duration (hours)</Label>
                  <Input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={activity.duration_hours}
                    onChange={(e) => updateActivity(index, { duration_hours: parseFloat(e.target.value) || 1 })}
                    placeholder="e.g., 3"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={activity.date}
                    onChange={(e) => updateActivity(index, { date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Cost per Person</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={activity.cost_per_person}
                    onChange={(e) => updateActivity(index, { cost_per_person: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Number of People</Label>
                  <Input
                    type="number"
                    min="1"
                    value={activity.num_people}
                    onChange={(e) => updateActivity(index, { num_people: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={activity.description}
                    onChange={(e) => updateActivity(index, { description: e.target.value })}
                    placeholder="Activity details, what's included, etc."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Total Cost</Label>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-lg">
                      {formatCurrency(activity.total_cost, currencyCode)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeActivity(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addActivity}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </CardContent>
    </Card>
  );
};