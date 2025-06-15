
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { QuoteData } from "../../types/quote.types";

interface QuoteSummaryCardProps {
  quote: QuoteData;
  totalPrice: number;
}

const QuoteSummaryCard = ({ quote, totalPrice }: QuoteSummaryCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quote Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Client</Label>
            <p className="text-gray-900">{quote.client}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Destination</Label>
            <p className="text-gray-900">{quote.destination}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Travel Dates</Label>
            <p className="text-gray-900">
              {new Date(quote.start_date).toLocaleDateString()} - {new Date(quote.end_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Duration</Label>
            <p className="text-gray-900">{quote.duration_nights} nights, {quote.duration_days} days</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Adults</Label>
            <p className="text-gray-900">{quote.adults}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Children with Bed</Label>
            <p className="text-gray-900">{quote.children_with_bed}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Children no Bed</Label>
            <p className="text-gray-900">{quote.children_no_bed}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Infants</Label>
            <p className="text-gray-900">{quote.infants}</p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Total Amount</span>
            <span className="text-xl font-bold text-teal-600">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteSummaryCard;
