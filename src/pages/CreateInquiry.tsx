
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
import { Save, User, MapPin, Calendar, Phone } from "lucide-react";
import { useRole } from "../contexts/RoleContext";
import { createInquiry } from "../services/inquiryService";

interface InquiryFormData {
  client: string;
  contact: string;
  mobile: string;
  destination: string;
  startDate: string;
  endDate: string;
  numRooms: number;
  travelers: {
    adults: number;
    children: number; 
    infants: number;
  };
  budget: number;
  priority: string;
  preferences: string;
  assignedAgent: string;
}

const CreateInquiry = () => {
  const navigate = useNavigate();
  const { role, currentUser, permissions } = useRole();
  
  const [formData, setFormData] = useState<InquiryFormData>({
    client: "",
    contact: "",
    mobile: "",
    destination: "",
    startDate: "",
    endDate: "",
    numRooms: 1,
    travelers: {
      adults: 2,
      children: 0,
      infants: 0
    },
    budget: 5000,
    priority: "Normal",
    preferences: "",
    assignedAgent: ""
  });

  const [availableAgents, setAvailableAgents] = useState([
    { id: "agent-1", name: "James Smith" },
    { id: "agent-2", name: "Sarah Johnson" },
    { id: "agent-3", name: "Robert Lee" },
    { id: "agent-4", name: "Emma Wilson" }
  ]);

  // Check if the current user is an agent
  const isAgent = role === 'agent';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate for required fields
    if (!formData.client || !formData.mobile || !formData.destination || 
        !formData.startDate || !formData.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // If the user is an agent, automatically assign the inquiry to themselves
      const submittedFormData = { 
        client: formData.client,
        mobile: formData.mobile,
        destination: formData.destination,
        start_date: formData.startDate,
        end_date: formData.endDate,
        num_rooms: formData.numRooms,
        adults: formData.travelers.adults,
        children: formData.travelers.children,
        infants: formData.travelers.infants,
        budget: formData.budget,
        priority: formData.priority,
        preferences: formData.preferences,
        // Auto-assign to current agent if user is an agent
        assigned_to: isAgent ? currentUser.id : formData.assignedAgent,
        assigned_agent_name: isAgent ? currentUser.name : 
          formData.assignedAgent ? availableAgents.find(a => a.id === formData.assignedAgent)?.name : null,
        created_by: currentUser.id,
        status: "New"
      };
      
      // Save to Supabase
      await createInquiry(submittedFormData);
      
      toast.success("Inquiry created successfully!");
      navigate("/inquiries");
    } catch (error) {
      console.error("Error creating inquiry:", error);
      toast.error("Failed to create inquiry. Please try again.");
    }
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
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="client" className="block text-sm font-medium mb-2">
                  Client Name *
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
                  Contact Email
                </label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="Email address"
                  type="email"
                  className="bg-white text-black"
                />
              </div>
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium mb-2">
                  Mobile Number *
                </label>
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-gray-500" />
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="Mobile phone number"
                    required
                    className="bg-white text-black"
                  />
                </div>
              </div>
              {/* Only show agent assignment if user has permission to assign inquiries */}
              {(role === 'org_owner' || role === 'tour_operator' || role === 'system_admin') && permissions.canAssignInquiries && (
                <div>
                  <label htmlFor="assignedAgent" className="block text-sm font-medium mb-2">
                    Assign to Agent
                  </label>
                  <Select
                    value={formData.assignedAgent}
                    onValueChange={(value) => setFormData({ ...formData, assignedAgent: value })}
                  >
                    <SelectTrigger id="assignedAgent" className="bg-white text-black">
                      <SelectValue placeholder="Select an agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAgents.map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Trip Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="destination" className="block text-sm font-medium mb-2">
                  Destination *
                </label>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                  <Input
                    id="destination"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder="Destination"
                    required
                    className="bg-white text-black"
                  />
                </div>
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
                  Start Date *
                </label>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                  End Date *
                </label>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    className="bg-white text-black"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 md:col-span-2">
                <div>
                  <label htmlFor="adults" className="block text-sm font-medium mb-2">
                    Adults
                  </label>
                  <Input
                    id="adults"
                    type="number"
                    min="1"
                    value={formData.travelers.adults}
                    onChange={(e) => setFormData({
                      ...formData,
                      travelers: {
                        ...formData.travelers,
                        adults: parseInt(e.target.value)
                      }
                    })}
                    required
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
                    value={formData.travelers.children}
                    onChange={(e) => setFormData({
                      ...formData,
                      travelers: {
                        ...formData.travelers,
                        children: parseInt(e.target.value)
                      }
                    })}
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
                    value={formData.travelers.infants}
                    onChange={(e) => setFormData({
                      ...formData,
                      travelers: {
                        ...formData.travelers,
                        infants: parseInt(e.target.value)
                      }
                    })}
                    className="bg-white text-black"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="numRooms" className="block text-sm font-medium mb-2">
                  Number of Rooms
                </label>
                <Input
                  id="numRooms"
                  type="number"
                  min="1"
                  value={formData.numRooms}
                  onChange={(e) => setFormData({ ...formData, numRooms: parseInt(e.target.value) })}
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
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            <Save className="mr-2 h-4 w-4" />
            Create Inquiry
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateInquiry;
