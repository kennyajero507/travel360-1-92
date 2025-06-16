
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Plus, X, GripVertical, MapPin, Utensils, Car } from "lucide-react";
import { ItineraryDay } from "../../types/tour.types";

interface ItineraryBuilderProps {
  itinerary: ItineraryDay[];
  duration: number;
  onChange: (itinerary: ItineraryDay[]) => void;
}

const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({ 
  itinerary, 
  duration, 
  onChange 
}) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  // Initialize itinerary days based on duration
  React.useEffect(() => {
    const currentDays = itinerary.length;
    if (currentDays < duration) {
      // Add missing days
      const newDays: ItineraryDay[] = [];
      for (let i = currentDays + 1; i <= duration; i++) {
        newDays.push({
          day: i,
          title: `Day ${i}`,
          description: '',
          location: '',
          meals: [],
          transport: '',
          activities: []
        });
      }
      onChange([...itinerary, ...newDays]);
    } else if (currentDays > duration) {
      // Remove extra days
      onChange(itinerary.slice(0, duration));
    }
  }, [duration, itinerary, onChange]);

  const updateDay = (dayIndex: number, updates: Partial<ItineraryDay>) => {
    const updatedItinerary = itinerary.map((day, index) => 
      index === dayIndex ? { ...day, ...updates } : day
    );
    onChange(updatedItinerary);
  };

  const addMeal = (dayIndex: number, meal: string) => {
    if (meal.trim()) {
      const day = itinerary[dayIndex];
      updateDay(dayIndex, {
        meals: [...day.meals, meal.trim()]
      });
    }
  };

  const removeMeal = (dayIndex: number, mealIndex: number) => {
    const day = itinerary[dayIndex];
    updateDay(dayIndex, {
      meals: day.meals.filter((_, i) => i !== mealIndex)
    });
  };

  const addActivity = (dayIndex: number, activity: string) => {
    if (activity.trim()) {
      const day = itinerary[dayIndex];
      updateDay(dayIndex, {
        activities: [...day.activities, activity.trim()]
      });
    }
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const day = itinerary[dayIndex];
    updateDay(dayIndex, {
      activities: day.activities.filter((_, i) => i !== activityIndex)
    });
  };

  const commonMeals = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
  const commonActivities = [
    'Game Drive',
    'Walking Safari',
    'Cultural Visit',
    'City Tour',
    'Beach Activities',
    'Photography',
    'Bird Watching',
    'Nature Walk',
    'Shopping',
    'Rest & Relaxation'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Itinerary Builder
          </CardTitle>
          <p className="text-sm text-gray-600">
            Build a detailed day-by-day itinerary for your {duration}-day tour
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {itinerary.map((day, dayIndex) => (
              <Card key={dayIndex} className="border">
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => setExpandedDay(expandedDay === dayIndex ? null : dayIndex)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <CardTitle className="text-lg">Day {day.day}</CardTitle>
                      <Badge variant="outline">{day.title}</Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      {expandedDay === dayIndex ? 'Collapse' : 'Expand'}
                    </Button>
                  </div>
                  {day.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {day.location}
                    </div>
                  )}
                </CardHeader>

                {expandedDay === dayIndex && (
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`day-${dayIndex}-title`}>Day Title</Label>
                        <Input
                          id={`day-${dayIndex}-title`}
                          value={day.title}
                          onChange={(e) => updateDay(dayIndex, { title: e.target.value })}
                          placeholder={`Day ${day.day} activities`}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`day-${dayIndex}-location`}>Location</Label>
                        <Input
                          id={`day-${dayIndex}-location`}
                          value={day.location}
                          onChange={(e) => updateDay(dayIndex, { location: e.target.value })}
                          placeholder="Primary location for this day"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`day-${dayIndex}-description`}>Description</Label>
                      <Textarea
                        id={`day-${dayIndex}-description`}
                        value={day.description}
                        onChange={(e) => updateDay(dayIndex, { description: e.target.value })}
                        placeholder="Detailed description of the day's activities..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`day-${dayIndex}-transport`}>Transport</Label>
                      <Input
                        id={`day-${dayIndex}-transport`}
                        value={day.transport}
                        onChange={(e) => updateDay(dayIndex, { transport: e.target.value })}
                        placeholder="e.g., Safari vehicle, Flight, Walking"
                      />
                    </div>

                    {/* Meals Section */}
                    <div>
                      <Label className="flex items-center gap-2">
                        <Utensils className="h-4 w-4" />
                        Meals Included
                      </Label>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {commonMeals.map((meal) => (
                            <Button
                              key={meal}
                              type="button"
                              variant={day.meals.includes(meal) ? "default" : "outline"}
                              size="sm"
                              onClick={() => 
                                day.meals.includes(meal) 
                                  ? removeMeal(dayIndex, day.meals.indexOf(meal))
                                  : addMeal(dayIndex, meal)
                              }
                            >
                              {meal}
                            </Button>
                          ))}
                        </div>

                        {day.meals.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {day.meals.map((meal, mealIndex) => (
                              <Badge key={mealIndex} variant="secondary" className="flex items-center gap-1">
                                {meal}
                                <X 
                                  className="h-3 w-3 cursor-pointer" 
                                  onClick={() => removeMeal(dayIndex, mealIndex)}
                                />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Activities Section */}
                    <div>
                      <Label className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Activities
                      </Label>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {commonActivities.map((activity) => (
                            <Button
                              key={activity}
                              type="button"
                              variant={day.activities.includes(activity) ? "default" : "outline"}
                              size="sm"
                              onClick={() => 
                                day.activities.includes(activity) 
                                  ? removeActivity(dayIndex, day.activities.indexOf(activity))
                                  : addActivity(dayIndex, activity)
                              }
                            >
                              {activity}
                            </Button>
                          ))}
                        </div>

                        {day.activities.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {day.activities.map((activity, activityIndex) => (
                              <Badge key={activityIndex} variant="secondary" className="flex items-center gap-1">
                                {activity}
                                <X 
                                  className="h-3 w-3 cursor-pointer" 
                                  onClick={() => removeActivity(dayIndex, activityIndex)}
                                />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ItineraryBuilder;
