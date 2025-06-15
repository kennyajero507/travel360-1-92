
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { InquiryData } from "../../types/inquiry.types";
import { InquiryStatusBadge } from "./InquiryStatusBadge";
import { format } from "date-fns";

interface InquiryDetailsViewProps {
  inquiry: InquiryData;
}

export const InquiryDetailsView = ({ inquiry }: InquiryDetailsViewProps) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP');
  };

  return (
    <div className="space-y-6">
      {/* Status and Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-600">Status</label>
          <div className="mt-1">
            <InquiryStatusBadge status={inquiry.status} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Tour Type</label>
          <div className="mt-1">
            <Badge variant={inquiry.tour_type === 'international' ? 'default' : 'secondary'}>
              {inquiry.tour_type === 'international' ? 'International' : 'Domestic'}
            </Badge>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Priority</label>
          <div className="mt-1">
            {inquiry.priority ? (
              <Badge 
                variant={
                  inquiry.priority === 'High' || inquiry.priority === 'Urgent' 
                    ? 'destructive' 
                    : 'outline'
                }
              >
                {inquiry.priority}
              </Badge>
            ) : (
              <span className="text-gray-500">Not set</span>
            )}
          </div>
        </div>
      </div>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Client Name</label>
              <p className="mt-1 text-sm">{inquiry.client_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Mobile</label>
              <p className="mt-1 text-sm">{inquiry.client_mobile}</p>
            </div>
            {inquiry.client_email && (
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="mt-1 text-sm">{inquiry.client_email}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Travel Information */}
      <Card>
        <CardHeader>
          <CardTitle>Travel Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Destination</label>
              <p className="mt-1 text-sm">{inquiry.destination}</p>
            </div>
            {inquiry.package_name && (
              <div>
                <label className="text-sm font-medium text-gray-600">Package</label>
                <p className="mt-1 text-sm">{inquiry.package_name}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-600">Check-in Date</label>
              <p className="mt-1 text-sm">{formatDate(inquiry.check_in_date)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Check-out Date</label>
              <p className="mt-1 text-sm">{formatDate(inquiry.check_out_date)}</p>
            </div>
            {inquiry.days_count && (
              <div>
                <label className="text-sm font-medium text-gray-600">Duration</label>
                <p className="mt-1 text-sm">{inquiry.days_count} days, {inquiry.nights_count} nights</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Group Information */}
      <Card>
        <CardHeader>
          <CardTitle>Group Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Adults</label>
              <p className="mt-1 text-sm">{inquiry.adults}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Children</label>
              <p className="mt-1 text-sm">{inquiry.children}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Infants</label>
              <p className="mt-1 text-sm">{inquiry.infants}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Rooms</label>
              <p className="mt-1 text-sm">{inquiry.num_rooms}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tour Type Specific Information */}
      {inquiry.tour_type === 'international' && (
        <Card>
          <CardHeader>
            <CardTitle>International Tour Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inquiry.visa_required !== null && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Visa Required</label>
                  <p className="mt-1 text-sm">{inquiry.visa_required ? 'Yes' : 'No'}</p>
                </div>
              )}
              {inquiry.passport_expiry_date && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Passport Expiry</label>
                  <p className="mt-1 text-sm">{formatDate(inquiry.passport_expiry_date)}</p>
                </div>
              )}
              {inquiry.preferred_currency && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Preferred Currency</label>
                  <p className="mt-1 text-sm">{inquiry.preferred_currency}</p>
                </div>
              )}
              {inquiry.flight_preference && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Flight Preference</label>
                  <p className="mt-1 text-sm">{inquiry.flight_preference}</p>
                </div>
              )}
              {inquiry.travel_insurance_required !== null && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Travel Insurance</label>
                  <p className="mt-1 text-sm">{inquiry.travel_insurance_required ? 'Required' : 'Not Required'}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {inquiry.tour_type === 'domestic' && (
        <Card>
          <CardHeader>
            <CardTitle>Domestic Tour Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inquiry.regional_preference && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Regional Preference</label>
                  <p className="mt-1 text-sm">{inquiry.regional_preference}</p>
                </div>
              )}
              {inquiry.transport_mode_preference && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Transport Mode</label>
                  <p className="mt-1 text-sm">{inquiry.transport_mode_preference}</p>
                </div>
              )}
              {inquiry.guide_language_preference && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Guide Language</label>
                  <p className="mt-1 text-sm">{inquiry.guide_language_preference}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {inquiry.estimated_budget_range && (
            <div>
              <label className="text-sm font-medium text-gray-600">Budget Range</label>
              <p className="mt-1 text-sm">{inquiry.estimated_budget_range}</p>
            </div>
          )}
          {inquiry.special_requirements && (
            <div>
              <label className="text-sm font-medium text-gray-600">Special Requirements</label>
              <p className="mt-1 text-sm whitespace-pre-wrap">{inquiry.special_requirements}</p>
            </div>
          )}
          {inquiry.description && (
            <div>
              <label className="text-sm font-medium text-gray-600">Description</label>
              <p className="mt-1 text-sm whitespace-pre-wrap">{inquiry.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Information */}
      {inquiry.assigned_agent_name && (
        <Card>
          <CardHeader>
            <CardTitle>Assignment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Assigned Agent</label>
              <p className="mt-1 text-sm">{inquiry.assigned_agent_name}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inquiry.created_at && (
              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p className="mt-1 text-sm">{formatDate(inquiry.created_at)}</p>
              </div>
            )}
            {inquiry.updated_at && (
              <div>
                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                <p className="mt-1 text-sm">{formatDate(inquiry.updated_at)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
