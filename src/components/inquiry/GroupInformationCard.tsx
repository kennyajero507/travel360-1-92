
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { User } from "lucide-react";
import { InquiryFormProps } from "../../types/inquiry.types";

export const GroupInformationCard = ({ formData, setFormData }: InquiryFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Group Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label htmlFor="adults" className="block text-sm font-medium mb-2">
              Adults
            </label>
            <Input
              id="adults"
              type="number"
              min="1"
              value={formData.adults}
              onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) })}
              className="bg-white text-black"
            />
          </div>
          
          <div>
            <label htmlFor="children" className="block text-sm font-medium mb-2">
              Children
            </label>
            <Input
              id="children"
              type="number"
              min="0"
              value={formData.children}
              onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) })}
              className="bg-white text-black"
            />
          </div>
          
          <div>
            <label htmlFor="infants" className="block text-sm font-medium mb-2">
              Infants
            </label>
            <Input
              id="infants"
              type="number"
              min="0"
              value={formData.infants}
              onChange={(e) => setFormData({ ...formData, infants: parseInt(e.target.value) })}
              className="bg-white text-black"
            />
          </div>
          
          <div>
            <label htmlFor="num_rooms" className="block text-sm font-medium mb-2">
              Rooms
            </label>
            <Input
              id="num_rooms"
              type="number"
              min="1"
              value={formData.num_rooms}
              onChange={(e) => setFormData({ ...formData, num_rooms: parseInt(e.target.value) })}
              className="bg-white text-black"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
