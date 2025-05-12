
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { useRole } from "../contexts/RoleContext";

interface InquiryFormData {
  client: string;
  contact: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  priority: string;
  preferences: string;
}

const CreateInquiry = () => {
  const navigate = useNavigate();
  const { role } = useRole();
  
  const [formData, setFormData] = useState<InquiryFormData>({
    client: "",
    contact: "",
    destination: "",
    startDate: "",
    endDate: "",
    travelers: 2,
    budget: 5000,
    priority: "Normal",
    preferences: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, save to database via API
    console.log("Inquiry data:", formData);
    
    toast.success("Inquiry created successfully!");
    navigate("/inquiries");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-600">Create Inquiry</h1>
          <p className="text-gray-500 mt-2">Record a new client inquiry</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="client" className="block text-sm font-medium mb-2">
                  Client Name
                </label>
                <Input
                  id="client"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  placeholder="Enter client name"
                  required
                  className="bg-white text-black"
                />
              </div>
              <div>
                <label htmlFor="contact" className="block text-sm font-medium mb-2">
                  Contact (Email or Phone)
                </label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="Email or phone number"
                  required
                  className="bg-white text-black"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="destination" className="block text-sm font-medium mb-2">
                  Destination
                </label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="Destination"
                  required
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
                  <SelectTrigger id="priority" className="bg-white text-black">
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
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                  Start Date
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  className="bg-white text-black"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                  End Date
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  className="bg-white text-black"
                />
              </div>
              <div>
                <label htmlFor="travelers" className="block text-sm font-medium mb-2">
                  Number of Travelers
                </label>
                <Input
                  id="travelers"
                  type="number"
                  min="1"
                  value={formData.travelers}
                  onChange={(e) => setFormData({ ...formData, travelers: parseInt(e.target.value) })}
                  required
                  className="bg-white text-black"
                />
              </div>
              <div>
                <label htmlFor="budget" className="block text-sm font-medium mb-2">
                  Budget ($)
                </label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                  required
                  className="bg-white text-black"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="preferences" className="block text-sm font-medium mb-2">
                  Preferences & Special Requests
                </label>
                <textarea
                  id="preferences"
                  className="w-full min-h-[100px] p-3 border rounded-md bg-white text-black"
                  value={formData.preferences}
                  onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                  placeholder="Any special requests or preferences (e.g., beach access, luxury accommodations)"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate("/inquiries")}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Create Inquiry
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateInquiry;
