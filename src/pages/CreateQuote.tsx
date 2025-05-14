
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { toast } from "sonner";
import { Plus, Minus, Save, Download, Eye, Mail, CalendarIcon, Users, Phone } from "lucide-react";
import { useRole } from "../contexts/RoleContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { differenceInDays, format } from "date-fns";
import { cn } from "@/lib/utils";

// Mock inquiry data for demo purposes - in a real app, this would come from an API
const mockInquiriesData = {
  "I-2024-001": {
    id: "I-2024-001",
    client: "John Smith",
    mobile: "+1 (555) 123-4567",
    destination: "Zanzibar",
    startDate: "2024-08-20",
    endDate: "2024-08-27",
    travelers: {
      adults: 2,
      children: 0,
      infants: 0
    },
    roomType: "Deluxe",
    numRooms: 1,
    budget: 5000,
    preferences: "Beach access, luxury accommodations"
  },
  "I-2024-002": {
    id: "I-2024-002",
    client: "Emily Wilson",
    mobile: "+1 (555) 234-5678",
    destination: "Serengeti Safari",
    startDate: "2024-09-10",
    endDate: "2024-09-20",
    travelers: {
      adults: 2,
      children: 2,
      infants: 0
    },
    roomType: "Family",
    numRooms: 1,
    budget: 12000,
    preferences: "Family-friendly activities, wildlife viewing"
  }
};

// Types for our form data
interface AccommodationItem {
  id: string;
  roomType: string;
  paxPerRoomType: number;
  roomsNeeded: number;
  costPerPersonPerNight: number;
  nights: number;
  total: number;
}

interface ActivityItem {
  id: string;
  name: string;
  description: string;
  costPerPerson: number;
  totalPax: number;
  total: number;
}

interface TransportItem {
  id: string;
  type: string;
  description: string;
  costPerPerson: number;
  totalPax: number;
  total: number;
}

interface QuoteFormData {
  client: string;
  mobile: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: {
    adults: number;
    children: number;
    infants: number;
  };
  duration: {
    days: number;
    nights: number;
  };
  accommodations: AccommodationItem[];
  activities: ActivityItem[];
  transports: TransportItem[];
  markup: {
    type: "percentage" | "fixed" | "cost-plus";
    value: number;
  };
  notes: string;
}

// Room types for selection
const roomTypes = [
  "Twin Sharing",
  "Triple Sharing",
  "Single",
  "Quad",
  "Family Suite"
];

const CreateQuote = () => {
  const { inquiryId } = useParams();
  const navigate = useNavigate();
  const { role, currentUser, permissions } = useRole();
  const { formatAmount } = useCurrency();
  
  // Check if user has permission to create quotes
  useEffect(() => {
    // Only allow agent, tour_operator, org_owner, or system_admin roles to create quotes
    if (!['agent', 'tour_operator', 'org_owner', 'system_admin'].includes(role)) {
      toast.error("You don't have permission to create quotes");
      navigate("/");
    }
  }, [role, navigate]);
  
  // Get inquiry data if inquiryId is provided
  const mockInquiry = inquiryId && mockInquiriesData[inquiryId as keyof typeof mockInquiriesData] 
    ? mockInquiriesData[inquiryId as keyof typeof mockInquiriesData]
    : null;

  const [formData, setFormData] = useState<QuoteFormData>({
    client: mockInquiry?.client || "",
    mobile: mockInquiry?.mobile || "",
    destination: mockInquiry?.destination || "",
    startDate: mockInquiry?.startDate || "",
    endDate: mockInquiry?.endDate || "",
    travelers: {
      adults: mockInquiry?.travelers?.adults || 2,
      children: mockInquiry?.travelers?.children || 0,
      infants: mockInquiry?.travelers?.infants || 0,
    },
    duration: {
      days: 0,
      nights: 0
    },
    accommodations: [
      {
        id: "accom-1",
        roomType: "Twin Sharing",
        paxPerRoomType: mockInquiry?.travelers?.adults || 2,
        roomsNeeded: 1,
        costPerPersonPerNight: 60,
        nights: 0,
        total: 0
      }
    ],
    activities: [
      {
        id: "activity-1",
        name: "Safari Game Drive",
        description: "Half-day game drive with professional guide",
        costPerPerson: 75,
        totalPax: mockInquiry?.travelers?.adults || 2,
        total: 0
      }
    ],
    transports: [
      {
        id: "transport-1",
        type: "Airport Transfer",
        description: "Return airport transfers",
        costPerPerson: 25,
        totalPax: mockInquiry?.travelers?.adults || 2,
        total: 0
      }
    ],
    markup: {
      type: "percentage",
      value: 15
    },
    notes: ""
  });

  // Calculate total travelers
  const calculateTotalTravelers = () => {
    return formData.travelers.adults + formData.travelers.children;
  };

  // Calculate days and nights when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (startDate && endDate && startDate <= endDate) {
        const days = differenceInDays(endDate, startDate) + 1; // +1 to include the start day
        const nights = days - 1;
        
        setFormData(prev => ({
          ...prev,
          duration: {
            days,
            nights
          },
          accommodations: prev.accommodations.map(item => ({
            ...item,
            nights,
            total: calculateAccommodationTotal(item.paxPerRoomType, item.costPerPersonPerNight, nights, item.roomsNeeded)
          }))
        }));
      }
    }
  }, [formData.startDate, formData.endDate]);

  // Update total travelers in all sections when traveler numbers change
  useEffect(() => {
    const totalTravelers = calculateTotalTravelers();
    
    setFormData(prev => ({
      ...prev,
      accommodations: prev.accommodations.map(item => ({
        ...item,
        total: calculateAccommodationTotal(item.paxPerRoomType, item.costPerPersonPerNight, item.nights, item.roomsNeeded)
      })),
      activities: prev.activities.map(item => ({
        ...item,
        totalPax: totalTravelers,
        total: item.costPerPerson * totalTravelers
      })),
      transports: prev.transports.map(item => ({
        ...item,
        totalPax: totalTravelers,
        total: item.costPerPerson * totalTravelers
      }))
    }));
  }, [formData.travelers]);

  // Calculate accommodation total based on pax, cost per night, nights, and rooms
  const calculateAccommodationTotal = (
    paxPerRoomType: number,
    costPerPersonPerNight: number,
    nights: number,
    roomsNeeded: number
  ) => {
    return paxPerRoomType * costPerPersonPerNight * nights * roomsNeeded;
  };

  // Calculate totals
  const calculateAccommodationSubtotal = () => {
    return formData.accommodations.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateActivitiesSubtotal = () => {
    return formData.activities.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTransportSubtotal = () => {
    return formData.transports.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateSubtotal = () => {
    return calculateAccommodationSubtotal() + calculateActivitiesSubtotal() + calculateTransportSubtotal();
  };

  const calculateMarkup = () => {
    const subtotal = calculateSubtotal();
    if (formData.markup.type === "percentage") {
      return (subtotal * formData.markup.value) / 100;
    } else if (formData.markup.type === "cost-plus") {
      // For cost-plus, we calculate what would be 100% if the cost is 85%
      return (subtotal / 0.85) - subtotal;
    } else {
      return formData.markup.value;
    }
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateMarkup();
  };

  const calculatePerPersonCost = () => {
    const totalTravelers = calculateTotalTravelers();
    return totalTravelers > 0 ? calculateGrandTotal() / totalTravelers : 0;
  };

  // Update accommodation item
  const updateAccommodation = (id: string, field: keyof AccommodationItem, value: any) => {
    setFormData(prev => {
      const updatedAccommodations = prev.accommodations.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate total if relevant fields changed
          if (field === "paxPerRoomType" || field === "costPerPersonPerNight" || field === "nights" || field === "roomsNeeded") {
            updatedItem.total = calculateAccommodationTotal(
              updatedItem.paxPerRoomType,
              updatedItem.costPerPersonPerNight,
              updatedItem.nights,
              updatedItem.roomsNeeded
            );
          }
          
          return updatedItem;
        }
        return item;
      });
      
      return { ...prev, accommodations: updatedAccommodations };
    });
  };

  // Add new accommodation
  const addAccommodation = () => {
    const newId = `accom-${formData.accommodations.length + 1}`;
    const totalTravelers = calculateTotalTravelers();
    
    setFormData(prev => ({
      ...prev,
      accommodations: [...prev.accommodations, {
        id: newId,
        roomType: "Twin Sharing",
        paxPerRoomType: 2,
        roomsNeeded: 1,
        costPerPersonPerNight: 60,
        nights: prev.duration.nights || 0,
        total: calculateAccommodationTotal(2, 60, prev.duration.nights || 0, 1)
      }]
    }));
  };

  // Remove accommodation
  const removeAccommodation = (id: string) => {
    if (formData.accommodations.length === 1) {
      toast.error("You must have at least one accommodation option");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      accommodations: prev.accommodations.filter(item => item.id !== id)
    }));
  };

  // Update activity item
  const updateActivity = (id: string, field: keyof ActivityItem, value: any) => {
    setFormData(prev => {
      const updatedActivities = prev.activities.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate total if cost or pax changed
          if (field === "costPerPerson" || field === "totalPax") {
            updatedItem.total = updatedItem.costPerPerson * updatedItem.totalPax;
          }
          
          return updatedItem;
        }
        return item;
      });
      
      return { ...prev, activities: updatedActivities };
    });
  };

  // Add new activity
  const addActivity = () => {
    const newId = `activity-${formData.activities.length + 1}`;
    const totalTravelers = calculateTotalTravelers();
    
    setFormData(prev => ({
      ...prev,
      activities: [...prev.activities, {
        id: newId,
        name: "",
        description: "",
        costPerPerson: 0,
        totalPax: totalTravelers,
        total: 0
      }]
    }));
  };

  // Remove activity
  const removeActivity = (id: string) => {
    if (formData.activities.length === 1) {
      toast.error("You must have at least one activity");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter(item => item.id !== id)
    }));
  };

  // Update transport item
  const updateTransport = (id: string, field: keyof TransportItem, value: any) => {
    setFormData(prev => {
      const updatedTransports = prev.transports.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate total if cost or pax changed
          if (field === "costPerPerson" || field === "totalPax") {
            updatedItem.total = updatedItem.costPerPerson * updatedItem.totalPax;
          }
          
          return updatedItem;
        }
        return item;
      });
      
      return { ...prev, transports: updatedTransports };
    });
  };

  // Add new transport
  const addTransport = () => {
    const newId = `transport-${formData.transports.length + 1}`;
    const totalTravelers = calculateTotalTravelers();
    
    setFormData(prev => ({
      ...prev,
      transports: [...prev.transports, {
        id: newId,
        type: "Transfer",
        description: "",
        costPerPerson: 0,
        totalPax: totalTravelers,
        total: 0
      }]
    }));
  };

  // Remove transport
  const removeTransport = (id: string) => {
    if (formData.transports.length === 1) {
      toast.error("You must have at least one transport item");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      transports: prev.transports.filter(item => item.id !== id)
    }));
  };

  // Handle markup change
  const updateMarkup = (field: "type" | "value", value: any) => {
    setFormData(prev => ({
      ...prev,
      markup: {
        ...prev.markup,
        [field]: value
      }
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, save to database via API
    console.log("Quote data:", formData);
    
    toast.success("Quote created successfully!");
    navigate("/quotes");
  };

  // Save as draft
  const saveAsDraft = () => {
    console.log("Draft saved:", formData);
    toast.success("Quote saved as draft");
    navigate("/quotes");
  };
  
  // Preview quote
  const previewQuote = () => {
    // In a real app, this would generate a preview
    toast.info("Generating quote preview...");
    // Store the current quote data in session storage for preview
    sessionStorage.setItem('previewQuote', JSON.stringify({
      ...formData,
      subtotal: calculateSubtotal(),
      markup: {
        ...formData.markup,
        amount: calculateMarkup()
      },
      grandTotal: calculateGrandTotal(),
      perPersonCost: calculatePerPersonCost()
    }));
    // Open in new tab
    window.open('/quote-preview', '_blank');
  };
  
  // Download quote as PDF
  const downloadQuote = () => {
    toast.success("Quote downloaded as PDF");
    // In a real app, this would generate and download a PDF
  };
  
  // Email quote to client
  const emailQuote = () => {
    toast.success("Quote sent to client via email");
    // In a real app, this would send an email
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-600">Create Tour Package Quote</h1>
          <p className="text-gray-500 mt-2">
            {inquiryId ? `Creating quote from inquiry #${inquiryId}` : "Create a new quote for your client"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={saveAsDraft}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button variant="outline" onClick={previewQuote}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button type="submit" form="quote-form" className="bg-blue-600 hover:bg-blue-700">
            Create Quote
          </Button>
        </div>
      </div>

      {mockInquiry && (
        <Card>
          <CardHeader>
            <CardTitle>Inquiry Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Client</p>
                <p>{mockInquiry.client}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Mobile</p>
                <p>{mockInquiry.mobile}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Destination</p>
                <p>{mockInquiry.destination}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Dates</p>
                <p>
                  {new Date(mockInquiry.startDate).toLocaleDateString()} - 
                  {new Date(mockInquiry.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Budget</p>
                <p>{formatAmount(mockInquiry.budget)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Room Details</p>
                <p>{mockInquiry.numRooms} {mockInquiry.roomType} Room(s)</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Travelers</p>
                <p>
                  {mockInquiry.travelers.adults} Adults
                  {mockInquiry.travelers.children > 0 ? `, ${mockInquiry.travelers.children} Children` : ''}
                  {mockInquiry.travelers.infants > 0 ? `, ${mockInquiry.travelers.infants} Infants` : ''}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Preferences</p>
                <p>{mockInquiry.preferences}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form id="quote-form" onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="client" className="block text-sm font-medium mb-2">
                  Client Name
                </label>
                <Input
                  id="client"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  placeholder="Enter client name"
                  required
                  className="bg-white text-black"
                />
              </div>
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium mb-2">
                  Mobile Number
                </label>
                <div className="flex items-center">
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="Client phone number"
                    required
                    className="bg-white text-black"
                  />
                  <Phone className="ml-2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label htmlFor="destination" className="block text-sm font-medium mb-2">
                  Destination
                </label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="Destination"
                  required
                  className="bg-white text-black"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Travel Dates Section */}
        <Card>
          <CardHeader>
            <CardTitle>Travel Dates & Group Composition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Start Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white text-black",
                        !formData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? (
                        format(new Date(formData.startDate), "PPP")
                      ) : (
                        <span>Select start date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.startDate ? new Date(formData.startDate) : undefined}
                      onSelect={(date) => 
                        setFormData({ 
                          ...formData, 
                          startDate: date ? format(date, "yyyy-MM-dd") : "" 
                        })
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  End Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white text-black",
                        !formData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? (
                        format(new Date(formData.endDate), "PPP")
                      ) : (
                        <span>Select end date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate ? new Date(formData.endDate) : undefined}
                      onSelect={(date) => 
                        setFormData({ 
                          ...formData, 
                          endDate: date ? format(date, "yyyy-MM-dd") : "" 
                        })
                      }
                      disabled={date => {
                        // Disable dates before start date
                        if (!formData.startDate) return false;
                        return date < new Date(formData.startDate);
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Trip Duration
                </label>
                <div className="px-4 py-2 border rounded-md bg-white">
                  {formData.duration.days > 0 ? (
                    <p>{formData.duration.days} days / {formData.duration.nights} nights</p>
                  ) : (
                    <p>Select start and end dates to calculate</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-md font-medium mb-3">Group Composition</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="adults" className="block text-sm font-medium mb-2">
                    Adults
                  </label>
                  <Input
                    id="adults"
                    type="number"
                    min="1"
                    value={formData.travelers.adults}
                    onChange={(e) => setFormData({
                      ...formData,
                      travelers: {
                        ...formData.travelers,
                        adults: parseInt(e.target.value) || 0
                      }
                    })}
                    required
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <label htmlFor="children" className="block text-sm font-medium mb-2">
                    Children
                  </label>
                  <Input
                    id="children"
                    type="number"
                    min="0"
                    value={formData.travelers.children}
                    onChange={(e) => setFormData({
                      ...formData,
                      travelers: {
                        ...formData.travelers,
                        children: parseInt(e.target.value) || 0
                      }
                    })}
                    className="bg-white text-black"
                  />
                </div>
                <div>
                  <label htmlFor="infants" className="block text-sm font-medium mb-2">
                    Infants
                  </label>
                  <Input
                    id="infants"
                    type="number"
                    min="0"
                    value={formData.travelers.infants}
                    onChange={(e) => setFormData({
                      ...formData,
                      travelers: {
                        ...formData.travelers,
                        infants: parseInt(e.target.value) || 0
                      }
                    })}
                    className="bg-white text-black"
                  />
                </div>
              </div>
              <div className="mt-4 px-4 py-3 bg-blue-50 rounded-md">
                <p className="text-blue-700">
                  <Users className="inline-block h-4 w-4 mr-2" />
                  Total Travelers: <span className="font-medium">{calculateTotalTravelers()}</span> 
                  {formData.travelers.infants > 0 && ` (+ ${formData.travelers.infants} infants)`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accommodations Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Per Person Accommodation Setup</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addAccommodation}>
              <Plus className="h-4 w-4 mr-2" />
              Add Accommodation
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.accommodations.map((item, index) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Accommodation {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAccommodation(item.id)}
                  >
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Room Type</label>
                    <Select
                      value={item.roomType}
                      onValueChange={(value) => updateAccommodation(item.id, "roomType", value)}
                    >
                      <SelectTrigger className="bg-white text-black">
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        {roomTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cost Per Person Per Night</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.costPerPersonPerNight}
                      onChange={(e) => updateAccommodation(item.id, "costPerPersonPerNight", parseFloat(e.target.value) || 0)}
                      className="bg-white text-black"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Pax in This Room Type</label>
                    <Input
                      type="number"
                      min="1"
                      value={item.paxPerRoomType}
                      onChange={(e) => updateAccommodation(item.id, "paxPerRoomType", parseInt(e.target.value) || 0)}
                      className="bg-white text-black"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Rooms Needed</label>
                    <Input
                      type="number"
                      min="1"
                      value={item.roomsNeeded}
                      onChange={(e) => updateAccommodation(item.id, "roomsNeeded", parseInt(e.target.value) || 0)}
                      className="bg-white text-black"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Number of Nights</label>
                    <Input
                      type="number"
                      min="1"
                      value={item.nights}
                      onChange={(e) => updateAccommodation(item.id, "nights", parseInt(e.target.value) || 0)}
                      className="bg-white text-black"
                      readOnly={formData.duration.nights > 0}
                    />
                  </div>
                </div>
                <div className="mt-2 p-2 bg-gray-50 rounded-md flex justify-between items-center">
                  <span className="text-sm">
                    {item.paxPerRoomType} pax × ${item.costPerPersonPerNight}/night × {item.nights} nights × {item.roomsNeeded} rooms
                  </span>
                  <span className="font-medium">{formatAmount(item.total)}</span>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-medium">Accommodation Subtotal</span>
              <span className="font-medium">{formatAmount(calculateAccommodationSubtotal())}</span>
            </div>
          </CardContent>
        </Card>

        {/* Activities Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Activities</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addActivity}>
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.activities.map((item, index) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Activity {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeActivity(item.id)}
                  >
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Activity Name</label>
                    <Input
                      value={item.name}
                      onChange={(e) => updateActivity(item.id, "name", e.target.value)}
                      placeholder="Activity name"
                      className="bg-white text-black"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cost Per Person</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.costPerPerson}
                      onChange={(e) => updateActivity(item.id, "costPerPerson", parseFloat(e.target.value) || 0)}
                      className="bg-white text-black"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateActivity(item.id, "description", e.target.value)}
                      placeholder="Brief description"
                      className="bg-white text-black"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Total Participants</label>
                    <Input
                      type="number"
                      min="1"
                      value={item.totalPax}
                      onChange={(e) => updateActivity(item.id, "totalPax", parseInt(e.target.value) || 0)}
                      className="bg-white text-black"
                    />
                  </div>
                </div>
                <div className="mt-2 p-2 bg-gray-50 rounded-md flex justify-between items-center">
                  <span className="text-sm">
                    {item.totalPax} participants × ${item.costPerPerson} per person
                  </span>
                  <span className="font-medium">{formatAmount(item.total)}</span>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-medium">Activities Subtotal</span>
              <span className="font-medium">{formatAmount(calculateActivitiesSubtotal())}</span>
            </div>
          </CardContent>
        </Card>

        {/* Transportation Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transportation</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addTransport}>
              <Plus className="h-4 w-4 mr-2" />
              Add Transport
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.transports.map((transport, index) => (
              <div key={transport.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Transport {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTransport(transport.id)}
                  >
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type</label>
                    <Select 
                      value={transport.type} 
                      onValueChange={(value) => updateTransport(transport.id, "type", value)}
                    >
                      <SelectTrigger className="bg-white text-black">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Airport Transfer">Airport Transfer</SelectItem>
                        <SelectItem value="Safari Vehicle">Safari Vehicle</SelectItem>
                        <SelectItem value="Private Car">Private Car</SelectItem>
                        <SelectItem value="Ferry">Ferry</SelectItem>
                        <SelectItem value="Domestic Flight">Domestic Flight</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Input
                      value={transport.description}
                      onChange={(e) => updateTransport(transport.id, "description", e.target.value)}
                      placeholder="E.g., Airport to hotel"
                      className="bg-white text-black"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cost Per Person</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={transport.costPerPerson}
                      onChange={(e) => updateTransport(transport.id, "costPerPerson", parseFloat(e.target.value) || 0)}
                      className="bg-white text-black"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Total Passengers</label>
                    <Input
                      type="number"
                      min="1"
                      value={transport.totalPax}
                      onChange={(e) => updateTransport(transport.id, "totalPax", parseInt(e.target.value) || 0)}
                      className="bg-white text-black"
                    />
                  </div>
                </div>
                <div className="mt-2 p-2 bg-gray-50 rounded-md flex justify-between items-center">
                  <span className="text-sm">
                    {transport.totalPax} passengers × ${transport.costPerPerson} per person
                  </span>
                  <span className="font-medium">{formatAmount(transport.total)}</span>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-medium">Transportation Subtotal</span>
              <span className="font-medium">{formatAmount(calculateTransportSubtotal())}</span>
            </div>
          </CardContent>
        </Card>

        {/* Markup Section */}
        <Card>
          <CardHeader>
            <CardTitle>Markup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Markup Type</label>
                <Select 
                  value={formData.markup.type} 
                  onValueChange={(value: "percentage" | "fixed" | "cost-plus") => updateMarkup("type", value)}
                >
                  <SelectTrigger className="bg-white text-black">
                    <SelectValue placeholder="Select markup type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="cost-plus">Cost Plus (85%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {formData.markup.type === "percentage" ? "Percentage (%)" : 
                   formData.markup.type === "fixed" ? "Amount" : 
                   "Cost Percentage (%)"}
                </label>
                <Input
                  type="number"
                  min="0"
                  step={formData.markup.type === "percentage" ? "1" : "0.01"}
                  value={formData.markup.value}
                  onChange={(e) => updateMarkup("value", parseFloat(e.target.value))}
                  required
                  className="bg-white text-black"
                  disabled={formData.markup.type === "cost-plus"}
                />
                {formData.markup.type === "cost-plus" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Fixed at 85% cost, 15% markup
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              className="min-h-[100px] bg-white text-black"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special requests or additional information..."
            />
          </CardContent>
        </Card>

        {/* Quote Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Quote Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Accommodation Subtotal</span>
                <span>{formatAmount(calculateAccommodationSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>Activities Subtotal</span>
                <span>{formatAmount(calculateActivitiesSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>Transportation Subtotal</span>
                <span>{formatAmount(calculateTransportSubtotal())}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatAmount(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  {formData.markup.type === "percentage" ? `Markup (${formData.markup.value}%)` : 
                   formData.markup.type === "fixed" ? "Markup (Fixed)" : 
                   "Markup (Cost Plus 85%)"}
                </span>
                <span>{formatAmount(calculateMarkup())}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Grand Total</span>
                <span>{formatAmount(calculateGrandTotal())}</span>
              </div>
              <div className="flex justify-between text-md text-blue-600 font-semibold bg-blue-50 p-3 rounded-md">
                <span>Per Person Cost</span>
                <span>{formatAmount(calculatePerPersonCost())}</span>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={emailQuote}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email to Client
                </Button>
                <Button type="button" variant="outline" onClick={downloadQuote}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={saveAsDraft}>
            Save as Draft
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Create Quote</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuote;
