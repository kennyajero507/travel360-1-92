
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import { Hotel } from "../types/hotel.types";
import { useAuth } from "../contexts/AuthContext";

interface HotelFormProps {
  initialData?: Partial<Hotel>;
  onSubmit: (data: Partial<Hotel>) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

const HotelForm: React.FC<HotelFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState<Partial<Hotel>>({
    name: "",
    destination: "",
    category: "",
    status: "Active",
    address: "",
    description: "",
    amenities: [],
    contact_info: {},
    ...initialData
  });

  const [newAmenity, setNewAmenity] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        amenities: initialData.amenities || []
      }));
    }
  }, [initialData]);

  const handleInputChange = (field: keyof Hotel, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact_info: {
        ...prev.contact_info,
        [field]: value
      }
    }));
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities?.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...(prev.amenities || []), newAmenity.trim()]
      }));
      setNewAmenity("");
    }
  };

  const removeAmenity = (amenityToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities?.filter(amenity => amenity !== amenityToRemove) || []
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name?.trim()) {
      toast.error("Hotel name is required");
      return false;
    }
    if (!formData.destination?.trim()) {
      toast.error("Destination is required");
      return false;
    }
    if (!formData.category?.trim()) {
      toast.error("Category is required");
      return false;
    }
    if (!profile?.org_id) {
      toast.error("Organization information missing");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Ensure org_id is set for new hotels
      const submissionData = {
        ...formData,
        org_id: profile?.org_id,
        created_by: profile?.id
      };

      await onSubmit(submissionData);
      
      if (!isEditing) {
        // Reset form for new hotel creation
        setFormData({
          name: "",
          destination: "",
          category: "",
          status: "Active",
          address: "",
          description: "",
          amenities: [],
          contact_info: {}
        });
        toast.success("Hotel created successfully!");
      }
    } catch (error) {
      console.error("Error submitting hotel form:", error);
      toast.error("Failed to save hotel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Hotel Name *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter hotel name"
                required
              />
            </div>

            <div>
              <Label htmlFor="destination">Destination *</Label>
              <Input
                id="destination"
                value={formData.destination || ""}
                onChange={(e) => handleInputChange("destination", e.target.value)}
                placeholder="Enter destination"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category || ""}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Budget">Budget</SelectItem>
                  <SelectItem value="3 Star">3 Star</SelectItem>
                  <SelectItem value="4 Star">4 Star</SelectItem>
                  <SelectItem value="5 Star">5 Star</SelectItem>
                  <SelectItem value="Luxury">Luxury</SelectItem>
                  <SelectItem value="Resort">Resort</SelectItem>
                  <SelectItem value="Boutique">Boutique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || "Active"}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address || ""}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter hotel address"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter hotel description"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.contact_info?.phone || ""}
                onChange={(e) => handleContactInfoChange("phone", e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.contact_info?.email || ""}
                onChange={(e) => handleContactInfoChange("email", e.target.value)}
                placeholder="Enter email address"
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.contact_info?.website || ""}
                onChange={(e) => handleContactInfoChange("website", e.target.value)}
                placeholder="Enter website URL"
              />
            </div>

            <div>
              <Label htmlFor="manager">Manager Name</Label>
              <Input
                id="manager"
                value={formData.contact_info?.manager || ""}
                onChange={(e) => handleContactInfoChange("manager", e.target.value)}
                placeholder="Enter manager name"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Amenities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              placeholder="Add amenity"
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
            />
            <Button type="button" onClick={addAmenity} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.amenities?.map((amenity, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {amenity}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeAmenity(amenity)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : isEditing ? "Update Hotel" : "Create Hotel"}
        </Button>
      </div>
    </form>
  );
};

export default HotelForm;
