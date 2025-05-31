
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { User } from "lucide-react";
import { InquiryFormProps } from "../../types/inquiry.types";

const leadSources = [
  'Website', 'Agent Referral', 'Social Media', 'Walk-in', 'Phone Call', 'Email', 'Advertisement'
];

export const BasicInformationCard = ({ formData, setFormData }: InquiryFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="lead_source" className="block text-sm font-medium mb-2">
              Lead Source
            </label>
            <Select
              value={formData.lead_source}
              onValueChange={(value) => setFormData({ ...formData, lead_source: value })}
            >
              <SelectTrigger className="bg-white text-black">
                <SelectValue placeholder="Select lead source" />
              </SelectTrigger>
              <SelectContent>
                {leadSources.map(source => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="tour_consultant" className="block text-sm font-medium mb-2">
              Tour Consultant
            </label>
            <Input
              id="tour_consultant"
              value={formData.tour_consultant}
              onChange={(e) => setFormData({ ...formData, tour_consultant: e.target.value })}
              placeholder="Consultant name"
              className="bg-white text-black"
            />
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium mb-2">
              Priority
            </label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger className="bg-white text-black">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Urgent">Urgent</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
