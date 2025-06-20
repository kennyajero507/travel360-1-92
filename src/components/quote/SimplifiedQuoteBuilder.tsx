
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { 
  User, 
  Hotel, 
  MapPin, 
  Calendar,
  Plus,
  Eye,
  Save,
  CreditCard,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { QuoteData, RoomArrangement } from '../../types/quote.types';
import CurrencyDisplay from './CurrencyDisplay';
import HotelComparisonToggle from './HotelComparisonToggle';
import HotelComparisonManager from './HotelComparisonManager';
import RoomArrangementSection from './RoomArrangementSection';
import TransferSection from './TransferSection';
import TransportBookingSection from './TransportBookingSection';
import ExcursionSection from './ExcursionSection';

interface SimplifiedQuoteBuilderProps {
  quote: QuoteData;
  hotels: any[];
  onQuoteUpdate: (updatedQuote: QuoteData) => void;
  onSave: () => Promise<void>;
  onPreview: () => void;
  onConvertToBooking: () => void;
  onAddHotelForComparison: () => void;
  saving?: boolean;
}

const SimplifiedQuoteBuilder: React.FC<SimplifiedQuoteBuilderProps> = ({
  quote,
  hotels,
  onQuoteUpdate,
  onSave,
  onPreview,
  onConvertToBooking,
  onAddHotelForComparison,
  saving = false
}) => {
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [roomArrangements, setRoomArrangements] = useState<RoomArrangement[]>(quote.room_arrangements || []);
  const [showServices, setShowServices] = useState(false);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [hotelOptions, setHotelOptions] = useState<any[]>([]);

  // Find selected hotel
  useEffect(() => {
    if (quote.hotel_id && hotels.length > 0) {
      const hotel = hotels.find(h => h.id === quote.hotel_id);
      setSelectedHotel(hotel);
    }
  }, [quote.hotel_id, hotels]);

  // Calculate completion progress
  const calculateProgress = () => {
    let completed = 0;
    const total = 3;

    // Block 1: Client & Travel Details (client info + hotel/accommodation)
    if (quote.client && quote.mobile && quote.destination && selectedHotel && roomArrangements.length > 0) {
      completed++;
    }

    // Block 2: Additional Services (optional but counts if any exist)
    if (quote.transports?.length > 0 || quote.transfers?.length > 0 || quote.activities?.length > 0) {
      completed++;
    } else {
      completed++; // Optional block counts as complete even if empty
    }

    // Block 3: Summary (always complete when other blocks are done)
    if (completed >= 1) {
      completed = Math.max(completed, 2);
    }

    return (completed / total) * 100;
  };

  const handleHotelSelection = (hotelId: string) => {
    const hotel = hotels.find(h => h.id === hotelId);
    setSelectedHotel(hotel);
    
    // Update quote with selected hotel
    const updatedQuote = {
      ...quote,
      hotel_id: hotelId
    };
    onQuoteUpdate(updatedQuote);

    // Add default room arrangement if none exists
    if (roomArrangements.length === 0) {
      const defaultRoom: RoomArrangement = {
        id: `room-${Date.now()}`,
        hotel_id: hotelId,
        room_type: 'Standard Room',
        num_rooms: 1,
        adults: quote.adults || 2,
        children_with_bed: quote.children_with_bed || 0,
        children_no_bed: quote.children_no_bed || 0,
        infants: quote.infants || 0,
        rate_per_night: {
          adult: hotel?.base_rate || 100,
          childWithBed: (hotel?.base_rate || 100) * 0.7,
          childNoBed: (hotel?.base_rate || 100) * 0.4,
          infant: 0
        },
        nights: quote.duration_nights || 1,
        total: 0
      };
      
      // Calculate total
      defaultRoom.total = defaultRoom.num_rooms * (
        (defaultRoom.adults * defaultRoom.rate_per_night.adult * defaultRoom.nights) +
        (defaultRoom.children_with_bed * defaultRoom.rate_per_night.childWithBed * defaultRoom.nights) +
        (defaultRoom.children_no_bed * defaultRoom.rate_per_night.childNoBed * defaultRoom.nights)
      );

      setRoomArrangements([defaultRoom]);
    }
  };

  const handleRoomArrangementsChange = (updatedArrangements: RoomArrangement[]) => {
    setRoomArrangements(updatedArrangements);
    const updatedQuote = {
      ...quote,
      room_arrangements: updatedArrangements
    };
    onQuoteUpdate(updatedQuote);
  };

  const handleComparisonToggle = (enabled: boolean) => {
    setIsComparisonMode(enabled);
    if (enabled) {
      onAddHotelForComparison();
    }
  };

  const handleAddHotelOption = (hotel: any) => {
    setHotelOptions(prev => [...prev, hotel]);
  };

  const handleRemoveHotelOption = (hotelId: string) => {
    setHotelOptions(prev => prev.filter(h => h.id !== hotelId));
  };

  const handleSelectHotelOption = (hotelId: string) => {
    setHotelOptions(prev => prev.map(h => ({ ...h, isSelected: h.id === hotelId })));
  };

  const isReadyForBooking = () => {
    return quote.client && 
           quote.mobile && 
           selectedHotel && 
           roomArrangements.length > 0 &&
           calculateProgress() >= 66;
  };

  const accommodationTotal = roomArrangements.reduce((sum, room) => sum + (room.total || 0), 0);
  const servicesTotal = (quote.transports?.reduce((sum, t) => sum + (t.total_cost || 0), 0) || 0) +
                       (quote.transfers?.reduce((sum, t) => sum + (t.total || 0), 0) || 0) +
                       (quote.activities?.reduce((sum, a) => sum + (a.total_cost || 0), 0) || 0);
  const grandTotal = accommodationTotal + servicesTotal;

  const availableRoomTypes = selectedHotel?.room_types || ['Standard Room', 'Deluxe Room', 'Suite', 'Family Room'];

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">Quote Builder</CardTitle>
              <p className="text-gray-600 mt-1">
                {quote.client ? `Quote for ${quote.client}` : 'Create a new quote'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={onSave}
                disabled={saving}
                variant="outline"
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={onPreview}
                variant="outline"
                size="sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Completion Progress</span>
              <Badge variant="outline">{Math.round(calculateProgress())}% Complete</Badge>
            </div>
            <Progress value={calculateProgress()} className="w-full" />
          </div>
        </CardHeader>
      </Card>

      {/* Block 1: Client & Travel Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-blue-600" />
            🔶 Block 1: Client & Travel Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Client Name</Label>
              <Input
                value={quote.client || ''}
                onChange={(e) => onQuoteUpdate({ ...quote, client: e.target.value })}
                placeholder="Enter client name"
              />
            </div>
            <div>
              <Label>Mobile</Label>
              <Input
                value={quote.mobile || ''}
                onChange={(e) => onQuoteUpdate({ ...quote, mobile: e.target.value })}
                placeholder="Mobile number"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={quote.client_email || ''}
                onChange={(e) => onQuoteUpdate({ ...quote, client_email: e.target.value })}
                placeholder="Email address"
              />
            </div>
          </div>

          {/* Travel Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Destination</Label>
              <Input
                value={quote.destination || ''}
                onChange={(e) => onQuoteUpdate({ ...quote, destination: e.target.value })}
                placeholder="Destination"
              />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={quote.start_date || ''}
                onChange={(e) => onQuoteUpdate({ ...quote, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={quote.end_date || ''}
                onChange={(e) => onQuoteUpdate({ ...quote, end_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Duration</Label>
              <div className="text-sm text-gray-600 pt-2">
                {quote.duration_days || 0} days, {quote.duration_nights || 0} nights
              </div>
            </div>
          </div>

          {/* Traveler Count */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label>Adults</Label>
              <Input
                type="number"
                min="1"
                value={quote.adults || 1}
                onChange={(e) => onQuoteUpdate({ ...quote, adults: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <Label>Children (with bed)</Label>
              <Input
                type="number"
                min="0"
                value={quote.children_with_bed || 0}
                onChange={(e) => onQuoteUpdate({ ...quote, children_with_bed: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Children (no bed)</Label>
              <Input
                type="number"
                min="0"
                value={quote.children_no_bed || 0}
                onChange={(e) => onQuoteUpdate({ ...quote, children_no_bed: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Infants</Label>
              <Input
                type="number"
                min="0"
                value={quote.infants || 0}
                onChange={(e) => onQuoteUpdate({ ...quote, infants: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Hotel Selection */}
          <div className="border-t pt-6">
            <h3 className="flex items-center gap-2 font-medium mb-4">
              <Hotel className="h-4 w-4 text-green-600" />
              Hotel & Accommodation
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label>Select Hotel</Label>
                <Select value={selectedHotel?.id || ''} onValueChange={handleHotelSelection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a hotel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels.map(hotel => (
                      <SelectItem key={hotel.id} value={hotel.id}>
                        {hotel.name} - {hotel.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Detailed Room Arrangements */}
              {selectedHotel && (
                <div className="mt-6">
                  <RoomArrangementSection
                    roomArrangements={roomArrangements}
                    duration={quote.duration_nights || 1}
                    onRoomArrangementsChange={handleRoomArrangementsChange}
                    availableRoomTypes={availableRoomTypes}
                    hotelId={selectedHotel.id}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hotel Comparison Toggle */}
      <HotelComparisonToggle
        isComparisonMode={isComparisonMode}
        onToggle={handleComparisonToggle}
        disabled={!selectedHotel}
      />

      {/* Hotel Comparison Manager */}
      {isComparisonMode && (
        <HotelComparisonManager
          isComparisonMode={isComparisonMode}
          hotelOptions={hotelOptions}
          onAddHotel={handleAddHotelOption}
          onRemoveHotel={handleRemoveHotelOption}
          onSelectHotel={handleSelectHotelOption}
          currencyCode={quote.currency_code || 'USD'}
        />
      )}

      {/* Block 2: Additional Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-purple-600" />
            🔶 Block 2: Additional Services (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={() => setShowServices(!showServices)}
              variant="outline"
              className="w-full justify-between"
            >
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {showServices ? 'Hide Services' : 'Add Services'}
              </div>
              {showServices ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {showServices && (
              <div className="space-y-6 border-t pt-6">
                {/* Transport Section */}
                <TransportBookingSection
                  transports={quote.transports || []}
                  onTransportsChange={(transports) => onQuoteUpdate({ ...quote, transports })}
                />

                {/* Transfer Section */}
                <TransferSection
                  transfers={quote.transfers || []}
                  onTransfersChange={(transfers) => onQuoteUpdate({ ...quote, transfers })}
                />

                {/* Activities Section */}
                <ExcursionSection
                  excursions={quote.activities || []}
                  onExcursionsChange={(activities) => onQuoteUpdate({ ...quote, activities })}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Block 3: Quote Summary & Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-orange-600" />
            🔶 Block 3: Quote Summary & Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cost Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Accommodation:</span>
                  <CurrencyDisplay amount={accommodationTotal} currencyCode={quote.currency_code} />
                </div>
                <div className="flex justify-between">
                  <span>Additional Services:</span>
                  <CurrencyDisplay amount={servicesTotal} currencyCode={quote.currency_code} />
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Total Amount:</span>
                  <CurrencyDisplay amount={grandTotal} currencyCode={quote.currency_code} />
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  <CurrencyDisplay amount={grandTotal} currencyCode={quote.currency_code} />
                </div>
                <div className="text-sm text-gray-600">
                  Total Quote Value
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Primary Action */}
            <Button
              onClick={onConvertToBooking}
              disabled={!isReadyForBooking()}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Convert to Booking
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            {/* Secondary Actions */}
            <Button
              onClick={() => setIsComparisonMode(!isComparisonMode)}
              disabled={!selectedHotel}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Compare Hotels
            </Button>
          </div>

          {!isReadyForBooking() && (
            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
              Complete all essential information to enable booking conversion
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplifiedQuoteBuilder;
