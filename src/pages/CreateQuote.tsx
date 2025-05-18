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
import RoomArrangementSection from "../components/quote/RoomArrangementSection";
import TransferSection from "../components/quote/TransferSection";
import { RoomArrangement, QuoteActivity, QuoteTransport, QuoteData } from "../types/quote.types";

// Available room types
const availableRoomTypes = [
  "Single Room",
  "Double Room",
  "Twin Room", 
  "Triple Room",
  "Quad Room",
  "Family Room"
];

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

  const [formData, setFormData] = useState<QuoteData>({
    client: mockInquiry?.client || "",
    mobile: mockInquiry?.mobile || "",
    destination: mockInquiry?.destination || "",
    startDate: mockInquiry?.startDate || "",
    endDate: mockInquiry?.endDate || "",
    duration: {
      days: 0,
      nights: 0
    },
    travelers: {
      adults: mockInquiry?.travelers?.adults || 2,
      childrenWithBed: 0,
      childrenNoBed: mockInquiry?.travelers?.children || 0,
      infants: mockInquiry?.travelers?.infants || 0
    },
    roomArrangements: [
      {
        id: "room-1",
        roomType: "Double Room",
        numRooms: 1,
        adults: mockInquiry?.travelers?.adults || 2,
        childrenWithBed: 0,
        childrenNoBed: mockInquiry?.travelers?.children || 0,
        infants: mockInquiry?.travelers?.infants || 0,
        ratePerNight: {
          adult: 80,
          childWithBed: 60,
          childNoBed: 40,
          infant: 0
        },
        nights: 0,
        total: 0
      }
    ],
    activities: [
      {
        id: "activity-1",
        name: "Safari Game Drive",
        description: "Half-day game drive with professional guide",
        costPerPerson: {
          adult: 75,
          child: 40,
          infant: 0
        },
        included: {
          adults: mockInquiry?.travelers?.adults || 2,
          children: mockInquiry?.travelers?.children || 0,
          infants: mockInquiry?.travelers?.infants || 0
        },
        total: 0
      }
    ],
    transports: [
      {
        id: "transport-1",
        type: "Airport Transfer",
        description: "Return airport transfers",
        costPerPerson: {
          adult: 25,
          child: 25,
          infant: 0
        },
        included: {
          adults: mockInquiry?.travelers?.adults || 2,
          children: mockInquiry?.travelers?.children || 0,
          infants: mockInquiry?.travelers?.infants || 0
        },
        total: 0
      }
    ],
    transfers: [], // Add empty transfers array to satisfy type requirements
    markup: {
      type: "percentage",
      value: 15
    },
    notes: "",
    status: "draft"
  });

  // Calculate total travelers
  const calculateTotalTravelers = () => {
    return formData.travelers.adults + formData.travelers.childrenWithBed + formData.travelers.childrenNoBed;
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
          }
        }));
      }
    }
  }, [formData.startDate, formData.endDate]);

  // Update room arrangements when traveler numbers change
  useEffect(() => {
    updateTotals();
  }, [formData.travelers, formData.duration.nights]);

  // Calculate accommodation total based on per-person rates and nights
  const updateTotals = () => {
    // No need to update if no nights calculated yet
    if (formData.duration.nights <= 0) return;

    // Update activities and transports based on current traveler counts
    const updatedActivities = formData.activities.map(activity => {
      const totalAdults = activity.included.adults;
      const totalChildren = activity.included.children;
      const totalInfants = activity.included.infants;
      
      const total = 
        totalAdults * activity.costPerPerson.adult + 
        totalChildren * activity.costPerPerson.child + 
        totalInfants * activity.costPerPerson.infant;
      
      return {
        ...activity,
        total
      };
    });
    
    const updatedTransports = formData.transports.map(transport => {
      const totalAdults = transport.included.adults;
      const totalChildren = transport.included.children;
      const totalInfants = transport.included.infants;
      
      const total = 
        totalAdults * transport.costPerPerson.adult + 
        totalChildren * transport.costPerPerson.child + 
        totalInfants * transport.costPerPerson.infant;
      
      return {
        ...transport,
        total
      };
    });
    
    setFormData(prev => ({
      ...prev,
      activities: updatedActivities,
      transports: updatedTransports
    }));
  };

  // Handle room arrangements change
  const handleRoomArrangementsChange = (arrangements: RoomArrangement[]) => {
    setFormData(prev => ({
      ...prev,
      roomArrangements: arrangements
    }));
    
    // Calculate total travelers from room arrangements
    const totalAdults = arrangements.reduce((sum, arr) => sum + arr.adults * arr.numRooms, 0);
    const totalCWB = arrangements.reduce((sum, arr) => sum + arr.childrenWithBed * arr.numRooms, 0);
    const totalCNB = arrangements.reduce((sum, arr) => sum + arr.childrenNoBed * arr.numRooms, 0);
    const totalInfants = arrangements.reduce((sum, arr) => sum + arr.infants * arr.numRooms, 0);
    
    setFormData(prev => ({
      ...prev,
      travelers: {
        adults: totalAdults,
        childrenWithBed: totalCWB,
        childrenNoBed: totalCNB,
        infants: totalInfants
      }
    }));
  };

  // Update activity item
  const updateActivity = (id: string, field: string, value: any) => {
    setFormData(prev => {
      const updatedActivities = prev.activities.map(item => {
        if (item.id === id) {
          let updatedItem = { ...item };
          
          if (field.startsWith("cost_")) {
            const personType = field.split("_")[1];
            updatedItem = {
              ...updatedItem,
              costPerPerson: {
                ...updatedItem.costPerPerson,
                [personType]: value
              }
            };
          } else if (field.startsWith("included_")) {
            const personType = field.split("_")[1];
            updatedItem = {
              ...updatedItem,
              included: {
                ...updatedItem.included,
                [personType]: value
              }
            };
          } else {
            updatedItem = {
              ...updatedItem,
              [field]: value
            };
          }
          
          // Recalculate total
          updatedItem.total = 
            updatedItem.included.adults * updatedItem.costPerPerson.adult + 
            updatedItem.included.children * updatedItem.costPerPerson.child + 
            updatedItem.included.infants * updatedItem.costPerPerson.infant;
          
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
    
    setFormData(prev => ({
      ...prev,
      activities: [...prev.activities, {
        id: newId,
        name: "",
        description: "",
        costPerPerson: {
          adult: 50,
          child: 25,
          infant: 0
        },
        included: {
          adults: prev.travelers.adults,
          children: prev.travelers.childrenWithBed + prev.travelers.childrenNoBed,
          infants: prev.travelers.infants
        },
        total: prev.travelers.adults * 50 + (prev.travelers.childrenWithBed + prev.travelers.childrenNoBed) * 25
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
  const updateTransport = (id: string, field: string, value: any) => {
    setFormData(prev => {
      const updatedTransports = prev.transports.map(item => {
        if (item.id === id) {
          let updatedItem = { ...item };
          
          if (field.startsWith("cost_")) {
            const personType = field.split("_")[1];
            updatedItem = {
              ...updatedItem,
              costPerPerson: {
                ...updatedItem.costPerPerson,
                [personType]: value
              }
            };
          } else if (field.startsWith("included_")) {
            const personType = field.split("_")[1];
            updatedItem = {
              ...updatedItem,
              included: {
                ...updatedItem.included,
                [personType]: value
              }
            };
          } else {
            updatedItem = {
              ...updatedItem,
              [field]: value
            };
          }
          
          // Recalculate total
          updatedItem.total = 
            updatedItem.included.adults * updatedItem.costPerPerson.adult + 
            updatedItem.included.children * updatedItem.costPerPerson.child + 
            updatedItem.included.infants * updatedItem.costPerPerson.infant;
          
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
    
    setFormData(prev => ({
      ...prev,
      transports: [...prev.transports, {
        id: newId,
        type: "Transfer",
        description: "",
        costPerPerson: {
          adult: 25,
          child: 25,
          infant: 0
        },
        included: {
          adults: prev.travelers.adults,
          children: prev.travelers.childrenWithBed + prev.travelers.childrenNoBed,
          infants: prev.travelers.infants
        },
        total: prev.travelers.adults * 25 + (prev.travelers.childrenWithBed + prev.travelers.childrenNoBed) * 25
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

  // Handle transfers change
  const handleTransfersChange = (transfers: any[]) => {
    setFormData(prev => ({
      ...prev,
      transfers
    }));
  };

  // Update markup change
  const updateMarkup = (field: "type" | "value", value: any) => {
    setFormData(prev => ({
      ...prev,
      markup: {
        ...prev.markup,
        [field]: value
      }
    }));
  };

  // Calculate totals
  const calculateAccommodationSubtotal = () => {
    return formData.roomArrangements.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateActivitiesSubtotal = () => {
    return formData.activities.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTransportSubtotal = () => {
    return formData.transports.reduce((sum, item) => sum + item.total, 0);
  };

  // Update calculateTransfersSubtotal function if it doesn't exist
  const calculateTransfersSubtotal = () => {
    return formData.transfers?.reduce((sum, item) => sum + item.total, 0) || 0;
  };

  // Update calculateSubtotal to include transfers
  const calculateSubtotal = () => {
    return calculateAccommodationSubtotal() + calculateActivitiesSubtotal() + calculateTransportSubtotal() + calculateTransfersSubtotal();
  };

  const calculateMarkup = () => {
    const subtotal = calculateSubtotal();
    if (formData.markup.type === "percentage") {
      return (subtotal / (1 - formData.markup.value / 100)) - subtotal;
    } else {
      // Fixed markup amount
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // In a real app, save to database via API
      const quoteData = {
        ...formData,
        inquiry_id: inquiryId || null,
        status: "sent"
      };
      
      await saveQuote(quoteData);
      toast.success("Quote created successfully!");
      navigate("/quotes");
    } catch (error) {
      console.error("Error creating quote:", error);
      toast.error("Failed to create quote. Please try again.");
    }
  };

  // Save as draft
  const saveAsDraft = async () => {
    try {
      const quoteData = {
        ...formData,
        inquiry_id: inquiryId || null,
        status: "draft"
      };
      
      await saveQuote(quoteData);
      toast.success("Quote saved as draft");
      navigate("/quotes");
    } catch (error) {
      console.error("Error saving quote draft:", error);
      toast.error("Failed to save draft. Please try again.");
    }
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
          <Button type="submit" form="quote-form">
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
            <CardTitle>Travel Dates</CardTitle>
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
          </CardContent>
        </Card>

        {/* SECTION ORDERING CHANGED: First Hotel, then Transportation, Transfer, and Activities */}
        
        {/* 1. Hotel Section (Renamed from Room Arrangements) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Hotel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Room Arrangements Section */}
            <RoomArrangementSection 
              roomArrangements={formData.roomArrangements}
              duration={formData.duration.nights}
              onRoomArrangementsChange={handleRoomArrangementsChange}
              availableRoomTypes={availableRoomTypes}
            />
          </CardContent>
        </Card>

        {/* 2. Transportation Section */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-2">Per Person Rates</h5>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Adult Rate</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={transport.costPerPerson.adult}
                        onChange={(e) => updateTransport(transport.id, "cost_adult", parseFloat(e.target.value) || 0)}
                        className="bg-white text-black"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Child Rate</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={transport.costPerPerson.child}
                        onChange={(e) => updateTransport(transport.id, "cost_child", parseFloat(e.target.value) || 0)}
                        className="bg-white text-black"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Infant Rate</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={transport.costPerPerson.infant}
                        onChange={(e) => updateTransport(transport.id, "cost_infant", parseFloat(e.target.value) || 0)}
                        className="bg-white text-black"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium mb-2">Passengers</h5>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Adults</label>
                      <Input
                        type="number"
                        min="0"
                        value={transport.included.adults}
                        onChange={(e) => updateTransport(transport.id, "included_adults", parseInt(e.target.value) || 0)}
                        className="bg-white text-black"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Children</label>
                      <Input
                        type="number"
                        min="0"
                        value={transport.included.children}
                        onChange={(e) => updateTransport(transport.id, "included_children", parseInt(e.target.value) || 0)}
                        className="bg-white text-black"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Infants</label>
                      <Input
                        type="number"
                        min="0"
                        value={transport.included.infants}
                        onChange={(e) => updateTransport(transport.id, "included_infants", parseInt(e.target.value) || 0)}
                        className="bg-white text-black"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 p-2 bg-gray-50 rounded-md flex justify-between items-center">
                  <span className="text-sm">
                    {transport.type}: {transport.included.adults} adults, {transport.included.children} children, {transport.included.infants} infants
                  </span>
                  <span className="font-medium">${transport.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-medium">Transportation Subtotal</span>
              <span className="font-medium">${calculateTransportSubtotal().toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* 3. Transfer Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transfer</CardTitle>
          </CardHeader>
          <CardContent>
            <TransferSection 
              transfers={formData.transfers || []} 
              onTransfersChange={handleTransfersChange}
            />
          </CardContent>
        </Card>

        {/* 4. Activities Section */}
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
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateActivity(item.id, "description", e.target.value)}
                      placeholder="Brief description"
                      className="bg-white text-black"
                    />
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-2">Per Person Rates</h5>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Adult Rate</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.costPerPerson.adult}
                        onChange={(e) => updateActivity(item.id, "cost_adult", parseFloat(e.target.value) || 0)}
                        className="bg-white text-black"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Child Rate</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.costPerPerson.child}
                        onChange={(e) => updateActivity(item.id, "cost_child", parseFloat(e.target.value) || 0)}
                        className="bg-white text-black"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Infant Rate</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.costPerPerson.infant}
                        onChange={(e) => updateActivity(item.id, "cost_infant", parseFloat(e.target.value) || 0)}
                        className="bg-white text-black"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium mb-2">Participants</h5>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Adults</label>
                      <Input
                        type="number"
                        min="0"
                        value={item.included.adults}
                        onChange={(e) => updateActivity(item.id, "included_adults", parseInt(e.target.value) || 0)}
                        className="bg-white text-black"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Children</label>
                      <Input
                        type="number"
                        min="0"
                        value={item.included.children}
                        onChange={(e) => updateActivity(item.id, "included_children", parseInt(e.target.value) || 0)}
                        className="bg-white text-black"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Infants</label>
                      <Input
                        type="number"
                        min="0"
                        value={item.included.infants}
                        onChange={(e) => updateActivity(item.id, "included_infants", parseInt(e.target.value) || 0)}
                        className="bg-white text-black"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 p-2 bg-gray-50 rounded-md flex justify-between items-center">
                  <span className="text-sm">
                    {item.name || "Activity"}: {item.included.adults} adults, {item.included.children} children, {item.included.infants} infants
                  </span>
                  <span className="font-medium">${item.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-medium">Activities Subtotal</span>
              <span className="font-medium">${calculateActivitiesSubtotal().toFixed(2)}</span>
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
                  onValueChange={(value: "percentage" | "fixed") => updateMarkup("type", value)}
                >
                  <SelectTrigger className="bg-white text-black">
                    <SelectValue placeholder="Select markup type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {formData.markup.type === "percentage" ? "Percentage (%)" : "Amount"}
                </label>
                <Input
                  type="number"
                  min="0"
                  step={formData.markup.type === "percentage" ? "1" : "0.01"}
                  value={formData.markup.value}
                  onChange={(e) => updateMarkup("value", parseFloat(e.target.value))}
                  required
                  className="bg-white text-black"
                />
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
                <span>${calculateAccommodationSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Activities Subtotal</span>
                <span>${calculateActivitiesSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Transportation Subtotal</span>
                <span>${calculateTransportSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Transfers Subtotal</span>
                <span>${calculateTransfersSubtotal().toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  {formData.markup.type === "percentage" ? `Markup (${formData.markup.value}%)` : "Markup (Fixed)"}
                </span>
                <span>${calculateMarkup().toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Grand Total</span>
                <span>${calculateGrandTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-md text-blue-600 font-semibold bg-blue-50 p-3 rounded-md">
                <span>Per Person Cost</span>
                <span>${calculatePerPersonCost().toFixed(2)}</span>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={emailQuote}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email to Client
                </Button>
                <Button type="button" onClick={downloadQuote}>
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
          <Button type="submit">Create Quote</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuote;
