
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { User, Phone } from "lucide-react";
import { InquiryFormProps } from "../../types/inquiry.types";

export const ClientInformationCard = ({ formData, setFormData, validationErrors }: InquiryFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Client Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="client_name" className="block text-sm font-medium mb-2">
              Client Name *
            </label>
            <Input
              id="client_name"
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              placeholder="Enter client name"
              className={`bg-white text-black ${
                validationErrors.some(error => error.includes('Client Name')) 
                  ? 'border-red-500 focus:border-red-500' 
                  : ''
              }`}
            />
          </div>
          
          <div>
            <label htmlFor="client_email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <Input
              id="client_email"
              value={formData.client_email}
              onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
              placeholder="Email address"
              type="email"
              className="bg-white text-black"
            />
          </div>
          
          <div>
            <label htmlFor="client_mobile" className="block text-sm font-medium mb-2">
              Mobile Number *
            </label>
            <div className="flex items-center">
              <Phone className="mr-2 h-4 w-4 text-gray-500" />
              <Input
                id="client_mobile"
                value={formData.client_mobile}
                onChange={(e) => setFormData({ ...formData, client_mobile: e.target.value })}
                placeholder="Mobile phone number"
                className={`bg-white text-black ${
                  validationErrors.some(error => error.includes('Mobile Number')) 
                    ? 'border-red-500 focus:border-red-500' 
                    : ''
                }`}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
