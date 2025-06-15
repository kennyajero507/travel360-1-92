
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Trash2, Plus, Calendar, Clock, MapPin } from 'lucide-react';
import { ItineraryItem } from '../../types/quote.types';

interface ItinerarySectionProps {
  itinerary: ItineraryItem[];
  onItineraryChange: (itinerary: ItineraryItem[]) => void;
  startDate: string;
  durationDays: number;
}

const ItinerarySection: React.FC<ItinerarySectionProps> = ({
  itinerary,
  onItineraryChange,
  startDate,
  durationDays
}) => {
  const generateDayStructure = () => {
    const newItinerary: ItineraryItem[] = [];
    const start = new Date(startDate);
    
    for (let i = 0; i < durationDays; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      
      newItinerary.push({
        id: `day-${i + 1}`,
        day: i + 1,
        date: currentDate.toISOString().split('T')[0],
        title: `Day ${i + 1}`,
        description: '',
        activities: [],
        meals_included: [],
        time_slots: [
          { time: '09:00', activity: '', location: '' },
          { time: '12:00', activity: '', location: '' },
          { time: '15:00', activity: '', location: '' },
          { time: '18:00', activity: '', location: '' }
        ]
      });
    }
    
    onItineraryChange(newItinerary);
  };

  const updateItineraryDay = (dayIndex: number, field: keyof ItineraryItem, value: any) => {
    const updated = [...itinerary];
    updated[dayIndex] = { ...updated[dayIndex], [field]: value };
    onItineraryChange(updated);
  };

  const updateTimeSlot = (dayIndex: number, slotIndex: number, field: string, value: string) => {
    const updated = [...itinerary];
    const updatedTimeSlots = [...updated[dayIndex].time_slots];
    updatedTimeSlots[slotIndex] = { ...updatedTimeSlots[slotIndex], [field]: value };
    updated[dayIndex] = { ...updated[dayIndex], time_slots: updatedTimeSlots };
    onItineraryChange(updated);
  };

  const addTimeSlot = (dayIndex: number) => {
    const updated = [...itinerary];
    updated[dayIndex].time_slots.push({ time: '20:00', activity: '', location: '' });
    onItineraryChange(updated);
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    const updated = [...itinerary];
    updated[dayIndex].time_slots = updated[dayIndex].time_slots.filter((_, i) => i !== slotIndex);
    onItineraryChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Itinerary Planning
          </CardTitle>
          {itinerary.length === 0 && (
            <Button onClick={generateDayStructure}>
              <Plus className="h-4 w-4 mr-2" />
              Generate Itinerary
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {itinerary.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No itinerary created yet.</p>
            <p className="text-sm">Generate a {durationDays}-day itinerary structure to get started.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {itinerary.map((day, dayIndex) => (
              <Card key={day.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-blue-600">
                        Day {day.day}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Input
                      value={day.title}
                      onChange={(e) => updateItineraryDay(dayIndex, 'title', e.target.value)}
                      placeholder="Day title..."
                      className="font-medium"
                    />
                    <Textarea
                      value={day.description}
                      onChange={(e) => updateItineraryDay(dayIndex, 'description', e.target.value)}
                      placeholder="Overall description for this day..."
                      rows={2}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Timeline</Label>
                    <div className="space-y-3">
                      {day.time_slots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex items-center gap-2 min-w-[80px]">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <Input
                              type="time"
                              value={slot.time}
                              onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'time', e.target.value)}
                              className="w-20 text-xs"
                            />
                          </div>
                          <div className="flex-1">
                            <Input
                              value={slot.activity}
                              onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'activity', e.target.value)}
                              placeholder="Activity or event..."
                              className="mb-2"
                            />
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <Input
                                value={slot.location || ''}
                                onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'location', e.target.value)}
                                placeholder="Location (optional)"
                                className="text-sm"
                              />
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addTimeSlot(dayIndex)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Time Slot
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ItinerarySection;
