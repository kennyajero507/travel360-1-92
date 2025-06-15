import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { MapPin, Check, DollarSign } from 'lucide-react';

interface ClientQuoteSelectionProps {
  quoteId: string;
  hotelOptions: any[]; // Change type from QuoteHotelOption[] to any[]
  onOptionSelect: (optionId: string, feedback?: string) => void;
  selectedOptionId?: string;
  isReadOnly?: boolean;
}

const ClientQuoteSelection: React.FC<ClientQuoteSelectionProps> = ({
  quoteId,
  hotelOptions,
  onOptionSelect,
  selectedOptionId,
  isReadOnly = false
}) => {
  const [selectedOption, setSelectedOption] = useState(selectedOptionId);
  const [feedback, setFeedback] = useState('');

  const handleSelect = (optionId: string) => {
    if (isReadOnly) return;
    setSelectedOption(optionId);
  };

  const handleConfirmSelection = () => {
    if (selectedOption) {
      onOptionSelect(selectedOption, feedback);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Select Your Preferred Hotel Option</h2>
        <p className="text-gray-600">Please review the hotel options below and select your preferred choice</p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {hotelOptions.map((option, index) => (
          <Card 
            key={option.id} 
            className={`cursor-pointer transition-all duration-200 ${
              selectedOption === option.id 
                ? 'ring-2 ring-blue-500 shadow-lg' 
                : 'hover:shadow-md'
            } ${isReadOnly && option.is_selected ? 'ring-2 ring-green-500' : ''}`}
            onClick={() => handleSelect(option.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Option {index + 1}: {option.option_name}
                </CardTitle>
                {(selectedOption === option.id || (isReadOnly && option.is_selected)) && (
                  <Check className="h-5 w-5 text-green-500" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-lg font-semibold text-blue-600">
                  <DollarSign className="h-5 w-5 mr-1" />
                  {option.total_price.toFixed(2)} {option.currency_code}
                </div>
                <Badge variant={option.is_selected ? 'default' : 'secondary'}>
                  {option.is_selected ? 'Selected' : 'Available'}
                </Badge>
              </div>

              {/* Room Arrangements */}
              {option.room_arrangements && option.room_arrangements.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Room Arrangements:</h4>
                  <div className="space-y-2">
                    {option.room_arrangements.map((room: any, roomIndex: number) => (
                      <div key={roomIndex} className="text-sm bg-gray-50 p-2 rounded">
                        <p><strong>{room.room_type}</strong></p>
                        <p>{room.num_rooms} room(s) × {room.nights} nights</p>
                        <p>
                          {room.adults} adults
                          {room.children_with_bed > 0 && `, ${room.children_with_bed} children with bed`}
                          {room.children_no_bed > 0 && `, ${room.children_no_bed} children no bed`}
                          {room.infants > 0 && `, ${room.infants} infants`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotel Images */}
              {option.hotel?.images && option.hotel.images.length > 0 && (
                <div>
                  <img 
                    src={option.hotel.images[0]} 
                    alt={option.option_name}
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!isReadOnly && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="feedback">Additional Comments (Optional)</Label>
            <Textarea
              id="feedback"
              placeholder="Any special requests or comments about your selection..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={handleConfirmSelection}
              disabled={!selectedOption}
              className="px-8 py-2"
            >
              Confirm Selection
            </Button>
          </div>
        </div>
      )}

      {isReadOnly && hotelOptions.find(opt => opt.is_selected) && (
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-green-700 font-medium">
            ✓ You have selected: {hotelOptions.find(opt => opt.is_selected)?.option_name}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientQuoteSelection;
