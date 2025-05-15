
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, Download, Eye, Mail, Hotel } from "lucide-react";
import { useRole } from "../contexts/RoleContext";
import { QuoteData } from "../types/quote.types";
import { getQuoteById, saveQuote } from "../services/quoteService";
import RoomArrangement from "../components/quote/RoomArrangement";
import { useQuoteCalculations } from "../hooks/useQuoteCalculations";
import { useHotelsData } from "../hooks/useHotelsData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

// Available room types
const availableRoomTypes = [
  "Single Room",
  "Double Room",
  "Twin Room", 
  "Triple Room",
  "Quad Room",
  "Family Room"
];

const EditQuote = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const { role } = useRole();
  const { hotels } = useHotelsData();
  
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState<string>("");
  const [availableRoomTypesFromHotel, setAvailableRoomTypesFromHotel] = useState<string[]>(availableRoomTypes);
  
  // Load quote data
  useEffect(() => {
    if (!quoteId) return;
    
    const loadQuote = async () => {
      try {
        setLoading(true);
        const quoteData = await getQuoteById(quoteId);
        
        if (quoteData) {
          setQuote(quoteData);
          // If there's a saved hotelId in the quote, select it
          if (quoteData.hotelId) {
            setSelectedHotelId(quoteData.hotelId);
          }
        } else {
          toast.error("Quote not found");
          navigate("/quotes");
        }
      } catch (error) {
        console.error("Error loading quote:", error);
        toast.error("Failed to load quote data");
      } finally {
        setLoading(false);
      }
    };
    
    loadQuote();
  }, [quoteId, navigate]);
  
  // Check permissions
  useEffect(() => {
    // Only allow agent, tour_operator, org_owner, or system_admin roles to edit quotes
    if (!['agent', 'tour_operator', 'org_owner', 'system_admin'].includes(role)) {
      toast.error("You don't have permission to edit quotes");
      navigate("/");
    }
  }, [role, navigate]);

  // Update available room types when hotel is selected
  useEffect(() => {
    if (selectedHotelId && hotels.length > 0) {
      const selectedHotel = hotels.find(hotel => hotel.id === selectedHotelId);
      if (selectedHotel && selectedHotel.roomTypes && selectedHotel.roomTypes.length > 0) {
        const hotelRoomTypes = selectedHotel.roomTypes.map(roomType => roomType.name);
        setAvailableRoomTypesFromHotel(hotelRoomTypes);
      } else {
        setAvailableRoomTypesFromHotel(availableRoomTypes);
      }
    } else {
      setAvailableRoomTypesFromHotel(availableRoomTypes);
    }
  }, [selectedHotelId, hotels]);
  
  // Use the quote calculations hook if quote data is available
  const calculations = quote ? useQuoteCalculations(quote) : null;
  
  // Handle hotel selection
  const handleHotelSelection = (hotelId: string) => {
    setSelectedHotelId(hotelId);
    if (quote) {
      setQuote({
        ...quote,
        hotelId: hotelId
      });
    }
  };
  
  // Handle room arrangements change
  const handleRoomArrangementsChange = (arrangements) => {
    if (!quote) return;
    
    setQuote(prev => {
      if (!prev) return prev;
      
      // Calculate total travelers from room arrangements
      const totalTravelers = calculations?.calculateTotalTravelers(arrangements);
      
      return {
        ...prev,
        roomArrangements: arrangements,
        travelers: totalTravelers || prev.travelers
      };
    });
  };
  
  // Handle save quote
  const handleSave = async () => {
    if (!quote) return;
    
    try {
      setSaving(true);
      const savedQuote = await saveQuote({
        ...quote,
        hotelId: selectedHotelId
      });
      toast.success("Quote saved successfully");
      setQuote(savedQuote);
    } catch (error) {
      console.error("Error saving quote:", error);
      toast.error("Failed to save quote");
    } finally {
      setSaving(false);
    }
  };
  
  // Preview quote
  const previewQuote = () => {
    if (!quote || !calculations) return;
    
    // Store the current quote data in session storage for preview
    sessionStorage.setItem('previewQuote', JSON.stringify({
      ...quote,
      subtotal: calculations.calculateSubtotal(),
      markup: {
        ...quote.markup,
        amount: calculations.calculateMarkup()
      },
      grandTotal: calculations.calculateGrandTotal(),
      perPersonCost: calculations.calculatePerPersonCost(),
      hotelId: selectedHotelId
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
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading quote data...</span>
      </div>
    );
  }
  
  if (!quote) {
    return (
      <div className="text-center py-8">
        <p>Quote not found or unable to load quote data.</p>
        <Button className="mt-4" onClick={() => navigate("/quotes")}>
          Return to Quotes
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-600">Edit Quote {quote.id}</h1>
          <p className="text-gray-500 mt-2">
            {quote.client} - {new Date(quote.createdAt || "").toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
          <Button variant="outline" onClick={previewQuote}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline" onClick={emailQuote}>
            <Mail className="mr-2 h-4 w-4" />
            Email to Client
          </Button>
          <Button onClick={downloadQuote} className="bg-blue-600 hover:bg-blue-700">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
      
      {/* Client Details Card (read only in edit mode) */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Client</p>
              <p className="font-medium">{quote.client}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Mobile</p>
              <p>{quote.mobile}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Destination</p>
              <p>{quote.destination}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Travel Period</p>
              <p>
                {new Date(quote.startDate).toLocaleDateString()} - {new Date(quote.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Duration</p>
              <p>{quote.duration.days} days / {quote.duration.nights} nights</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="capitalize">{quote.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Hotel Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Hotel className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Select Hotel</h2>
            </div>
            
            <Select value={selectedHotelId} onValueChange={handleHotelSelection}>
              <SelectTrigger className="w-full bg-white text-black">
                <SelectValue placeholder="Select a hotel from inventory" />
              </SelectTrigger>
              <SelectContent>
                {hotels.map(hotel => (
                  <SelectItem key={hotel.id} value={hotel.id}>
                    {hotel.name} - {hotel.category} ({hotel.destination})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Room Arrangements Section */}
      <RoomArrangement 
        roomArrangements={quote.roomArrangements}
        duration={quote.duration.nights}
        onRoomArrangementsChange={handleRoomArrangementsChange}
        availableRoomTypes={availableRoomTypesFromHotel}
      />
      
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => navigate("/quotes")}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default EditQuote;
