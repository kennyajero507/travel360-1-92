
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { getInquiryById, updateInquiry } from "../services/inquiryService";
import { toast } from "sonner";

const EditInquiry = () => {
  const { inquiryId } = useParams();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        if (!inquiryId) {
          toast.error("No inquiry ID provided");
          navigate("/inquiries");
          return;
        }
        
        const data = await getInquiryById(inquiryId);
        setInquiry(data);
      } catch (error) {
        console.error("Error fetching inquiry:", error);
        toast.error("Failed to load inquiry");
      } finally {
        setLoading(false);
      }
    };

    fetchInquiry();
  }, [inquiryId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!inquiryId) return;
      
      await updateInquiry(inquiryId, inquiry);
      toast.success("Inquiry updated successfully");
      navigate("/inquiries");
    } catch (error) {
      console.error("Error updating inquiry:", error);
      toast.error("Failed to update inquiry");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInquiry(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading inquiry details...</div>;
  }

  if (!inquiry) {
    return <div className="text-center text-red-500">Inquiry not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Inquiry</h1>
        <Button variant="outline" onClick={() => navigate("/inquiries")}>
          Back to Inquiries
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inquiry Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="client" className="text-sm font-medium">Client Name</label>
                <input
                  id="client"
                  name="client"
                  value={inquiry.client || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="mobile" className="text-sm font-medium">Mobile</label>
                <input
                  id="mobile"
                  name="mobile"
                  value={inquiry.mobile || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="destination" className="text-sm font-medium">Destination</label>
                <input
                  id="destination"
                  name="destination"
                  value={inquiry.destination || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="budget" className="text-sm font-medium">Budget</label>
                <input
                  id="budget"
                  name="budget"
                  type="number"
                  value={inquiry.budget || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="start_date" className="text-sm font-medium">Start Date</label>
                <input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={inquiry.start_date || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="end_date" className="text-sm font-medium">End Date</label>
                <input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={inquiry.end_date || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="adults" className="text-sm font-medium">Adults</label>
                <input
                  id="adults"
                  name="adults"
                  type="number"
                  min="1"
                  value={inquiry.adults || 1}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="children" className="text-sm font-medium">Children</label>
                <input
                  id="children"
                  name="children"
                  type="number"
                  min="0"
                  value={inquiry.children || 0}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="infants" className="text-sm font-medium">Infants</label>
                <input
                  id="infants"
                  name="infants"
                  type="number"
                  min="0"
                  value={inquiry.infants || 0}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="num_rooms" className="text-sm font-medium">Number of Rooms</label>
                <input
                  id="num_rooms"
                  name="num_rooms"
                  type="number"
                  min="1"
                  value={inquiry.num_rooms || 1}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Status</label>
                <select
                  id="status"
                  name="status"
                  value={inquiry.status || "New"}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="New">New</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Quoted">Quoted</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={inquiry.priority || "Normal"}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="preferences" className="text-sm font-medium">Preferences/Notes</label>
              <textarea
                id="preferences"
                name="preferences"
                value={inquiry.preferences || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded h-32"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => navigate("/inquiries")}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditInquiry;
