
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Calendar } from "lucide-react";
import { InquiryFormProps } from "../../types/inquiry.types";

export const TravelDatesCard = ({ formData, setFormData, validationErrors }: InquiryFormProps) => {
  // Calculate days and nights
  const calculateDuration = () => {
    if (formData.check_in_date && formData.check_out_date) {
      const checkIn = new Date(formData.check_in_date);
      const checkOut = new Date(formData.check_out_date);
      const diffTime = checkOut.getTime() - checkIn.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const nights = days - 1;
      return { days, nights };
    }
    return { days: 0, nights: 0 };
  };

  const { days, nights } = calculateDuration();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Travel Dates & Duration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label htmlFor="check_in_date" className="block text-sm font-medium mb-2">
              Check-in Date *
            </label>
            <Input
              id="check_in_date"
              type="date"
              value={formData.check_in_date}
              onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
              className={`bg-white text-black ${
                validationErrors.some(error => error.includes('Check-in Date')) 
                  ? 'border-red-500 focus:border-red-500' 
                  : ''
              }`}
            />
          </div>
          
          <div>
            <label htmlFor="check_out_date" className="block text-sm font-medium mb-2">
              Check-out Date *
            </label>
            <Input
              id="check_out_date"
              type="date"
              value={formData.check_out_date}
              onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
              className={`bg-white text-black ${
                validationErrors.some(error => error.includes('Check-out Date') || error.includes('Check-out date must be after')) 
                  ? 'border-red-500 focus:border-red-500' 
                  : ''
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Days Count
            </label>
            <Input
              value={days > 0 ? days : ''}
              readOnly
              placeholder="Auto-calculated"
              className="bg-gray-100 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Nights Count
            </label>
            <Input
              value={nights > 0 ? nights : ''}
              readOnly
              placeholder="Auto-calculated"
              className="bg-gray-100 text-black"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
