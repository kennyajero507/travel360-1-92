
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import { Plus, Minus, Save, Download, Eye } from "lucide-react";

// Types for our form data
interface HotelItem {
  id: string;
  name: string;
  ratePerNight: number;
  nights: number;
  total: number;
}

interface TransportItem {
  id: string;
  type: string;
  description: string;
  cost: number;
}

interface QuoteFormData {
  client: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  hotels: HotelItem[];
  transports: TransportItem[];
  markup: {
    type: "percentage" | "fixed";
    value: number;
  };
  notes: string;
}

const CreateQuote = () => {
  const { inquiryId } = useParams();
  const navigate = useNavigate();
  
  // Mock inquiry data (would come from API in real app)
  const mockInquiry = inquiryId ? {
    id: inquiryId,
    client: "John Smith",
    destination: "Zanzibar",
    startDate: "2024-08-20",
    endDate: "2024-08-30",
    travelers: 2,
    budget: "$5,000",
    preferences: "Beach access, luxury accommodations"
  } : null;

  const [formData, setFormData] = useState<QuoteFormData>({
    client: mockInquiry?.client || "",
    destination: mockInquiry?.destination || "",
    startDate: mockInquiry?.startDate || "",
    endDate: mockInquiry?.endDate || "",
    travelers: mockInquiry?.travelers || 2,
    hotels: [
      {
        id: "hotel-1",
        name: "",
        ratePerNight: 0,
        nights: 1,
        total: 0
      }
    ],
    transports: [
      {
        id: "transport-1",
        type: "Flight",
        description: "",
        cost: 0
      }
    ],
    markup: {
      type: "percentage",
      value: 15
    },
    notes: ""
  });

  // Calculate totals
  const calculateHotelSubtotal = () => {
    return formData.hotels.reduce((sum, hotel) => sum + hotel.total, 0);
  };

  const calculateTransportSubtotal = () => {
    return formData.transports.reduce((sum, transport) => sum + transport.cost, 0);
  };

  const calculateSubtotal = () => {
    return calculateHotelSubtotal() + calculateTransportSubtotal();
  };

  const calculateMarkup = () => {
    const subtotal = calculateSubtotal();
    return formData.markup.type === "percentage"
      ? (subtotal * formData.markup.value) / 100
      : formData.markup.value;
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateMarkup();
  };

  // Update hotel item
  const updateHotel = (id: string, field: keyof HotelItem, value: any) => {
    setFormData(prev => {
      const updatedHotels = prev.hotels.map(hotel => {
        if (hotel.id === id) {
          const updatedHotel = { ...hotel, [field]: value };
          
          // Recalculate total if rate or nights changed
          if (field === "ratePerNight" || field === "nights") {
            updatedHotel.total = updatedHotel.ratePerNight * updatedHotel.nights;
          }
          
          return updatedHotel;
        }
        return hotel;
      });
      
      return { ...prev, hotels: updatedHotels };
    });
  };

  // Add new hotel
  const addHotel = () => {
    const newId = `hotel-${formData.hotels.length + 1}`;
    setFormData(prev => ({
      ...prev,
      hotels: [...prev.hotels, {
        id: newId,
        name: "",
        ratePerNight: 0,
        nights: 1,
        total: 0
      }]
    }));
  };

  // Remove hotel
  const removeHotel = (id: string) => {
    if (formData.hotels.length === 1) {
      toast.error("You must have at least one accommodation");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      hotels: prev.hotels.filter(hotel => hotel.id !== id)
    }));
  };

  // Update transport item
  const updateTransport = (id: string, field: keyof TransportItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      transports: prev.transports.map(transport => 
        transport.id === id ? { ...transport, [field]: value } : transport
      )
    }));
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
        cost: 0
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
      transports: prev.transports.filter(transport => transport.id !== id)
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Quote</h1>
          <p className="text-gray-500 mt-2">
            {inquiryId ? `Creating quote from inquiry #${inquiryId}` : "Create a new quote for your client"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={saveAsDraft}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button type="submit" form="quote-form">Create Quote</Button>
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
                <p>{mockInquiry.budget}</p>
              </div>
              <div className="md:col-span-2 lg:col-span-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                />
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
                />
              </div>
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                  Start Date
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                  End Date
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="travelers" className="block text-sm font-medium mb-2">
                  Number of Travelers
                </label>
                <Input
                  id="travelers"
                  type="number"
                  min="1"
                  value={formData.travelers}
                  onChange={(e) => setFormData({ ...formData, travelers: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hotels Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Accommodations</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addHotel}>
              <Plus className="h-4 w-4 mr-2" />
              Add Hotel
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.hotels.map((hotel, index) => (
              <div key={hotel.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Hotel {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHotel(hotel.id)}
                  >
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Hotel Name</label>
                    <Input
                      value={hotel.name}
                      onChange={(e) => updateHotel(hotel.id, "name", e.target.value)}
                      placeholder="Enter hotel name"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Rate per Night ($)</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={hotel.ratePerNight}
                      onChange={(e) => updateHotel(hotel.id, "ratePerNight", parseFloat(e.target.value))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nights</label>
                    <Input
                      type="number"
                      min="1"
                      value={hotel.nights}
                      onChange={(e) => updateHotel(hotel.id, "nights", parseInt(e.target.value))}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-gray-50 p-2 rounded-md">
                    <span className="text-sm font-medium">Total: ${hotel.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-medium">Accommodation Subtotal</span>
              <span className="font-medium">${calculateHotelSubtotal().toFixed(2)}</span>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Flight">Flight</SelectItem>
                        <SelectItem value="Transfer">Transfer</SelectItem>
                        <SelectItem value="Train">Train</SelectItem>
                        <SelectItem value="Car Rental">Car Rental</SelectItem>
                        <SelectItem value="Ferry">Ferry</SelectItem>
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
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cost ($)</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={transport.cost}
                      onChange={(e) => updateTransport(transport.id, "cost", parseFloat(e.target.value))}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-medium">Transportation Subtotal</span>
              <span className="font-medium">${calculateTransportSubtotal().toFixed(2)}</span>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select markup type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {formData.markup.type === "percentage" ? "Percentage (%)" : "Amount ($)"}
                </label>
                <Input
                  type="number"
                  min="0"
                  step={formData.markup.type === "percentage" ? "1" : "0.01"}
                  value={formData.markup.value}
                  onChange={(e) => updateMarkup("value", parseFloat(e.target.value))}
                  required
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
            <textarea
              className="w-full min-h-[100px] p-3 border rounded-md"
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
                <span>${calculateHotelSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Transportation Subtotal</span>
                <span>${calculateTransportSubtotal().toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  Markup ({formData.markup.type === "percentage" ? `${formData.markup.value}%` : "Fixed"})
                </span>
                <span>${calculateMarkup().toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Grand Total</span>
                <span>${calculateGrandTotal().toFixed(2)}</span>
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
