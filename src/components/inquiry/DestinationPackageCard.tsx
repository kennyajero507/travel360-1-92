
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { MapPin } from "lucide-react";
import { InquiryFormProps } from "../../types/inquiry.types";

const domesticDestinations = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Goa', 'Kerala', 'Rajasthan', 'Kashmir'
];

const internationalDestinations = [
  'Dubai', 'Singapore', 'Thailand', 'Maldives', 'Europe', 'USA', 'Australia', 'Japan', 'Bali', 'Malaysia'
];

const domesticPackages = [
  'Golden Triangle', 'Kerala Backwaters', 'Rajasthan Royal', 'Goa Beach', 'Himachal Adventure'
];

const internationalPackages = [
  'Dubai Deluxe', 'Singapore City Break', 'Thailand Beach', 'Maldives Honeymoon', 'Europe Grand Tour'
];

export const DestinationPackageCard = ({ formData, setFormData, activeTab }: InquiryFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Destination & Package Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="destination" className="block text-sm font-medium mb-2">
              Destination
            </label>
            <Select
              value={formData.destination}
              onValueChange={(value) => setFormData({ ...formData, destination: value })}
            >
              <SelectTrigger className="bg-white text-black">
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {(activeTab === 'domestic' ? domesticDestinations : internationalDestinations).map(dest => (
                  <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="package_name" className="block text-sm font-medium mb-2">
              Package
            </label>
            <Select
              value={formData.package_name}
              onValueChange={(value) => setFormData({ ...formData, package_name: value })}
            >
              <SelectTrigger className="bg-white text-black">
                <SelectValue placeholder="Select package" />
              </SelectTrigger>
              <SelectContent>
                {(activeTab === 'domestic' ? domesticPackages : internationalPackages).map(pkg => (
                  <SelectItem key={pkg} value={pkg}>{pkg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="custom_package" className="block text-sm font-medium mb-2">
              Custom Package Name
            </label>
            <Input
              id="custom_package"
              value={formData.custom_package}
              onChange={(e) => setFormData({ ...formData, custom_package: e.target.value })}
              placeholder="Enter custom package name"
              className="bg-white text-black"
            />
          </div>

          <div>
            <label htmlFor="custom_destination" className="block text-sm font-medium mb-2">
              Custom Destination
            </label>
            <Input
              id="custom_destination"
              value={formData.custom_destination}
              onChange={(e) => setFormData({ ...formData, custom_destination: e.target.value })}
              placeholder="Enter custom destination"
              className="bg-white text-black"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description & Preferences
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Notes on preferences, special requirements, or travel intent"
              className="bg-white text-black min-h-[100px]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
