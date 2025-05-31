
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Calendar, Users, MapPin, Package } from "lucide-react";
import { QuoteData } from "../../types/quote.types";
import { useCurrency } from "../../contexts/CurrencyContext";

interface Inquiry {
  id: string;
  enquiry_number: string;
  client_name: string;
  client_mobile: string;
  destination: string;
  package_name?: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  infants: number;
  tour_type: 'domestic' | 'international';
  assigned_agent_name?: string;
  assigned_to?: string;
}

interface QuoteInitializerProps {
  inquiries: Inquiry[];
  onInitializeQuote: (quote: QuoteData) => void;
  onCancel: () => void;
}

const QuoteInitializer = ({ inquiries, onInitializeQuote, onCancel }: QuoteInitializerProps) => {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const { currency, currencies } = useCurrency();
  const [selectedCurrency, setSelectedCurrency] = useState(currency.code);

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return {
      days: nights + 1,
      nights: nights
    };
  };

  const handleInquirySelect = (inquiryId: string) => {
    const inquiry = inquiries.find(inq => inq.id === inquiryId);
    setSelectedInquiry(inquiry || null);
  };

  const handleInitialize = () => {
    if (!selectedInquiry) return;

    const duration = calculateDuration(selectedInquiry.check_in_date, selectedInquiry.check_out_date);
    
    const newQuote: QuoteData = {
      id: `Q-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      inquiryId: selectedInquiry.id,
      client: selectedInquiry.client_name,
      mobile: selectedInquiry.client_mobile,
      destination: selectedInquiry.destination,
      packageName: selectedInquiry.package_name,
      startDate: selectedInquiry.check_in_date,
      endDate: selectedInquiry.check_out_date,
      duration: duration,
      travelers: {
        adults: selectedInquiry.adults,
        childrenWithBed: selectedInquiry.children,
        childrenNoBed: 0,
        infants: selectedInquiry.infants
      },
      tourType: selectedInquiry.tour_type,
      currencyCode: selectedCurrency,
      roomArrangements: [],
      activities: [],
      transports: [],
      transfers: [],
      markup: {
        type: "percentage",
        value: 25 // Default markup
      },
      notes: "",
      status: "draft",
      assignedAgent: selectedInquiry.assigned_agent_name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onInitializeQuote(newQuote);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-teal-600" />
            Initialize Quote from Inquiry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Inquiry</label>
            <Select onValueChange={handleInquirySelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an inquiry to create quote from..." />
              </SelectTrigger>
              <SelectContent>
                {inquiries.map((inquiry) => (
                  <SelectItem key={inquiry.id} value={inquiry.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{inquiry.enquiry_number} - {inquiry.client_name}</span>
                      <Badge variant={inquiry.tour_type === 'international' ? 'default' : 'secondary'}>
                        {inquiry.tour_type}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Quote Currency</label>
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger className="w-full md:w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    {curr.symbol} - {curr.code} ({curr.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedInquiry && (
            <Card className="border border-teal-100 bg-teal-50">
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-teal-600" />
                    <div>
                      <p className="text-xs text-gray-500">Destination</p>
                      <p className="font-medium">{selectedInquiry.destination}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-teal-600" />
                    <div>
                      <p className="text-xs text-gray-500">Travel Dates</p>
                      <p className="font-medium">
                        {new Date(selectedInquiry.check_in_date).toLocaleDateString()} - {new Date(selectedInquiry.check_out_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-teal-600" />
                    <div>
                      <p className="text-xs text-gray-500">Travelers</p>
                      <p className="font-medium">
                        {selectedInquiry.adults}A {selectedInquiry.children}C {selectedInquiry.infants}I
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tour Type</p>
                    <Badge variant={selectedInquiry.tour_type === 'international' ? 'default' : 'secondary'}>
                      {selectedInquiry.tour_type}
                    </Badge>
                  </div>
                </div>
                {selectedInquiry.package_name && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">Package</p>
                    <p className="font-medium">{selectedInquiry.package_name}</p>
                  </div>
                )}
                {selectedInquiry.assigned_agent_name && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">Assigned Agent</p>
                    <p className="font-medium">{selectedInquiry.assigned_agent_name}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleInitialize} 
              disabled={!selectedInquiry}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Initialize Quote
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuoteInitializer;
