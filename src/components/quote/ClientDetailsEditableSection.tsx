
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { User, Edit, Save, X } from "lucide-react";
import { QuoteData } from "../../types/quote.types";

interface ClientDetailsEditableSectionProps {
  quote: QuoteData;
  onQuoteUpdate: (updatedQuote: QuoteData) => void;
}

const ClientDetailsEditableSection: React.FC<ClientDetailsEditableSectionProps> = ({
  quote,
  onQuoteUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuote, setEditedQuote] = useState<QuoteData>(quote);

  const handleEdit = () => {
    setEditedQuote(quote);
    setIsEditing(true);
  };

  const handleSave = () => {
    onQuoteUpdate(editedQuote);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedQuote(quote);
    setIsEditing(false);
  };

  const handleChange = (field: keyof QuoteData, value: any) => {
    setEditedQuote(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTotalTravelers = () => {
    return quote.adults + quote.children_with_bed + quote.children_no_bed + quote.infants;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Client Details
          </CardTitle>
          {!isEditing ? (
            <Button onClick={handleEdit} size="sm" variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={handleCancel} size="sm" variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isEditing ? (
          // View Mode
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Contact Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Client Name:</span>
                    <p className="font-medium">{quote.client}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Mobile:</span>
                    <p className="font-medium">{quote.mobile}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Destination:</span>
                    <p className="font-medium">{quote.destination}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-2">Trip Details</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Travel Dates:</span>
                    <p className="font-medium">
                      {formatDate(quote.start_date)} - {formatDate(quote.end_date)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Duration:</span>
                    <p className="font-medium">{quote.duration_nights} nights, {quote.duration_days} days</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Tour Type:</span>
                    <Badge variant="outline">{quote.tour_type}</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Traveler Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{quote.adults}</p>
                    <p className="text-sm text-gray-600">Adults</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{quote.children_with_bed}</p>
                    <p className="text-sm text-gray-600">Children (with bed)</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{quote.children_no_bed}</p>
                    <p className="text-sm text-gray-600">Children (no bed)</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{quote.infants}</p>
                    <p className="text-sm text-gray-600">Infants</p>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <Badge className="bg-gray-600">
                    Total: {getTotalTravelers()} Travelers
                  </Badge>
                </div>
              </div>

              {quote.notes && (
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Notes</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{quote.notes}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="client">Client Name *</Label>
                <Input
                  id="client"
                  value={editedQuote.client}
                  onChange={(e) => handleChange('client', e.target.value)}
                  placeholder="Enter client name"
                />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile *</Label>
                <Input
                  id="mobile"
                  value={editedQuote.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  placeholder="Enter mobile number"
                />
              </div>
              <div>
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  value={editedQuote.destination}
                  onChange={(e) => handleChange('destination', e.target.value)}
                  placeholder="Enter destination"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={editedQuote.start_date}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={editedQuote.end_date}
                    onChange={(e) => handleChange('end_date', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adults">Adults *</Label>
                  <Input
                    id="adults"
                    type="number"
                    min="0"
                    value={editedQuote.adults}
                    onChange={(e) => handleChange('adults', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="children_with_bed">Children (with bed)</Label>
                  <Input
                    id="children_with_bed"
                    type="number"
                    min="0"
                    value={editedQuote.children_with_bed}
                    onChange={(e) => handleChange('children_with_bed', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="children_no_bed">Children (no bed)</Label>
                  <Input
                    id="children_no_bed"
                    type="number"
                    min="0"
                    value={editedQuote.children_no_bed}
                    onChange={(e) => handleChange('children_no_bed', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="infants">Infants</Label>
                  <Input
                    id="infants"
                    type="number"
                    min="0"
                    value={editedQuote.infants}
                    onChange={(e) => handleChange('infants', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="tour_type">Tour Type</Label>
                <select
                  id="tour_type"
                  value={editedQuote.tour_type}
                  onChange={(e) => handleChange('tour_type', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="domestic">Domestic</option>
                  <option value="international">International</option>
                </select>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={editedQuote.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientDetailsEditableSection;
