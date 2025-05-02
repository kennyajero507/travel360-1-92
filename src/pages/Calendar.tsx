
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "../components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

interface Event {
  id: string;
  title: string;
  date: Date;
  type: "quote" | "inquiry" | "booking";
  client: string;
}

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([
    {
      id: "event-1",
      title: "Safari Tour Quote Due",
      date: new Date(2025, 4, 5), // May 5, 2025
      type: "quote",
      client: "Michael Chen"
    },
    {
      id: "event-2",
      title: "Zanzibar Trip Starts",
      date: new Date(2025, 4, 10), // May 10, 2025
      type: "booking",
      client: "Sarah Johnson"
    },
    {
      id: "event-3",
      title: "New Inquiry Follow-up",
      date: new Date(2025, 4, 15), // May 15, 2025
      type: "inquiry",
      client: "Emily Rodriguez"
    },
    {
      id: "event-4",
      title: "Cape Town Quote Review",
      date: new Date(2025, 4, 20), // May 20, 2025
      type: "quote",
      client: "David Kim"
    },
  ]);

  // Get events for selected date
  const selectedDateEvents = date 
    ? events.filter(event => 
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
      )
    : [];

  // Get badge color based on event type
  const getEventTypeColor = (type: string) => {
    switch(type) {
      case "quote": return "bg-blue-100 text-blue-800";
      case "inquiry": return "bg-yellow-100 text-yellow-800";
      case "booking": return "bg-green-100 text-green-800";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-gray-500 mt-2">Manage your schedule and upcoming events</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="border rounded-md p-3"
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {date ? format(date, "MMMM d, yyyy") : "No Date Selected"} Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedDateEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-gray-500">Client: {event.client}</p>
                      </div>
                      <Badge variant="outline" className={getEventTypeColor(event.type)}>
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">
                No events scheduled for this day
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;
