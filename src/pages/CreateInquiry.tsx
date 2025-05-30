
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import { Save, User, MapPin, Calendar, Phone, Package, Globe } from "lucide-react";
import { useRole } from "../contexts/RoleContext";
import { createInquiry } from "../services/inquiryService";

interface InquiryFormData {
  tour_type: 'domestic' | 'international';
  lead_source: string;
  tour_consultant: string;
  client_name: string;
  client_email: string;
  client_mobile: string;
  destination: string;
  package_name: string;
  custom_package: string;
  custom_destination: string;
  description: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  infants: number;
  num_rooms: number;
  priority: string;
  assigned_agent: string;
}

const CreateInquiry = () => {
  const navigate = useNavigate();
  const { role, currentUser, permissions } = useRole();
  
  const [activeTab, setActiveTab] = useState<'domestic' | 'international'>('domestic');
  const [formData, setFormData] = useState<InquiryFormData>({
    tour_type: 'domestic',
    lead_source: '',
    tour_consultant: currentUser?.name || '',
    client_name: '',
    client_email: '',
    client_mobile: '',
    destination: '',
    package_name: '',
    custom_package: '',
    custom_destination: '',
    description: '',
    check_in_date: '',
    check_out_date: '',
    adults: 2,
    children: 0,
    infants: 0,
    num_rooms: 1,
    priority: 'Normal',
    assigned_agent: ''
  });

  // Sample data for dropdowns
  const leadSources = [
    'Website', 'Agent Referral', 'Social Media', 'Walk-in', 'Phone Call', 'Email', 'Advertisement'
  ];

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

  const availableAgents = [
    { id: "agent-1", name: "James Smith" },
    { id: "agent-2", name: "Sarah Johnson" },
    { id: "agent-3", name: "Robert Lee" },
    { id: "agent-4", name: "Emma Wilson" }
  ];

  // Check if the current user is an agent
  const isAgent = role === 'agent';

  // Calculate days and nights
  const calculateDuration = () => {
    if (formData.check_in_date && formData.check_out_date) {
      const checkIn = new Date(formData.check_in_date);
      const checkOut = new Date(formData.check_out_date);
      const diffTime = checkOut.getTime() - checkIn.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const nights = days - 1;
      return { days, nights };
    }
    return { days: 0, nights: 0 };
  };

  const { days, nights } = calculateDuration();

  const handleTabChange = (value: string) => {
    const tourType = value as 'domestic' | 'international';
    setActiveTab(tourType);
    setFormData(prev => ({
      ...prev,
      tour_type: tourType,
      destination: '',
      package_name: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.client_name || !formData.client_mobile || !formData.destination || 
        !formData.check_in_date || !formData.check_out_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(formData.check_out_date) <= new Date(formData.check_in_date)) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    try {
      const submittedFormData = { 
        tour_type: formData.tour_type,
        lead_source: formData.lead_source,
        tour_consultant: formData.tour_consultant,
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_mobile: formData.client_mobile,
        destination: formData.destination,
        package_name: formData.package_name,
        custom_package: formData.custom_package,
        custom_destination: formData.custom_destination,
        description: formData.description,
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        adults: formData.adults,
        children: formData.children,
        infants: formData.infants,
        num_rooms: formData.num_rooms,
        priority: formData.priority,
        // Auto-assign to current agent if user is an agent
        assigned_to: isAgent ? currentUser.id : formData.assigned_agent,
        assigned_agent_name: isAgent ? currentUser.name : 
          formData.assigned_agent ? availableAgents.find(a => a.id === formData.assigned_agent)?.name : null,
        created_by: currentUser.id,
        status: "New"
      };
      
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
          <h1 className="text-3xl font-bold tracking-tight text-blue-600">Create New Inquiry</h1>
          <p className="text-gray-500 mt-2">Record a new client inquiry for domestic or international tours</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="domestic">
            <Globe className="mr-2 h-4 w-4" />
            Domestic Tours
          </TabsTrigger>
          <TabsTrigger value="international">
            <Package className="mr-2 h-4 w-4" />
            International Tours
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
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

            {/* Client Information */}
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
                      required
                      className="bg-white text-black"
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
                        required
                        className="bg-white text-black"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Destination & Package */}
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
                      Destination *
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

            {/* Travel Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Travel Dates & Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label htmlFor="check_in_date" className="block text-sm font-medium mb-2">
                      Check-in Date *
                    </label>
                    <Input
                      id="check_in_date"
                      type="date"
                      value={formData.check_in_date}
                      onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                      required
                      className="bg-white text-black"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="check_out_date" className="block text-sm font-medium mb-2">
                      Check-out Date *
                    </label>
                    <Input
                      id="check_out_date"
                      type="date"
                      value={formData.check_out_date}
                      onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
                      required
                      className="bg-white text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Days Count
                    </label>
                    <Input
                      value={days > 0 ? days : ''}
                      readOnly
                      placeholder="Auto-calculated"
                      className="bg-gray-100 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nights Count
                    </label>
                    <Input
                      value={nights > 0 ? nights : ''}
                      readOnly
                      placeholder="Auto-calculated"
                      className="bg-gray-100 text-black"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Group Information */}
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

            {/* Agent Assignment (only for non-agents) */}
            {!isAgent && (role === 'org_owner' || role === 'tour_operator' || role === 'system_admin') && permissions.canAssignInquiries && (
              <Card>
                <CardHeader>
                  <CardTitle>Agent Assignment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="assigned_agent" className="block text-sm font-medium mb-2">
                        Assign to Agent
                      </label>
                      <Select
                        value={formData.assigned_agent}
                        onValueChange={(value) => setFormData({ ...formData, assigned_agent: value })}
                      >
                        <SelectTrigger className="bg-white text-black">
                          <SelectValue placeholder="Select an agent (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableAgents.map(agent => (
                            <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreateInquiry;
