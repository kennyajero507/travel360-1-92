
import React, { useState, useMemo } from "react";
import { Plus, Search, Filter, Edit, Copy, Archive, Eye } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useTours } from "../../hooks/useTours";
import { Tour } from "../../types/tour.types";
import { useNavigate } from "react-router-dom";

interface ToursListProps {
  onCreateNew: () => void;
  onEdit: (tour: Tour) => void;
}

const ToursList: React.FC<ToursListProps> = ({ onCreateNew, onEdit }) => {
  const navigate = useNavigate();
  const { tours, isLoading, deleteTour, duplicateTour } = useTours();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDuration, setFilterDuration] = useState<string>("all");

  const filteredTours = useMemo(() => {
    return tours.filter((tour) => {
      const matchesSearch = tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tour.destination_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === "all" || tour.tour_type === filterType;
      
      const matchesDuration = filterDuration === "all" || 
        (filterDuration === "short" && tour.duration_days <= 3) ||
        (filterDuration === "medium" && tour.duration_days > 3 && tour.duration_days <= 7) ||
        (filterDuration === "long" && tour.duration_days > 7);
      
      return matchesSearch && matchesType && matchesDuration;
    });
  }, [tours, searchTerm, filterType, filterDuration]);

  const handleDuplicate = async (tour: Tour) => {
    const newTitle = `${tour.title} (Copy)`;
    try {
      await duplicateTour({ id: tour.id, newTitle });
    } catch (error) {
      console.error("Failed to duplicate tour:", error);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to archive this tour?")) {
      deleteTour(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading tours...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tours</h2>
          <p className="text-gray-600">Manage your reusable tour packages and itineraries</p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create Tour
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Tour Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="domestic">Domestic</SelectItem>
                <SelectItem value="international">International</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDuration} onValueChange={setFilterDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Durations</SelectItem>
                <SelectItem value="short">Short (1-3 days)</SelectItem>
                <SelectItem value="medium">Medium (4-7 days)</SelectItem>
                <SelectItem value="long">Long (8+ days)</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setFilterType("all");
              setFilterDuration("all");
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tours Table */}
      <Card>
        <CardContent className="p-0">
          {filteredTours.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No tours found. Create your first tour to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTours.map((tour) => (
                  <TableRow key={tour.id}>
                    <TableCell className="font-medium">{tour.title}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{tour.destination_name}</div>
                        <div className="text-sm text-gray-500">{tour.region}, {tour.country}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{tour.duration_days} days</div>
                        <div className="text-gray-500">{tour.duration_nights} nights</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={tour.tour_type === 'domestic' ? 'default' : 'secondary'}>
                        {tour.tour_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {tour.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {tour.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{tour.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {tour.base_price ? (
                        <div className="text-sm">
                          <div className="font-medium">{tour.currency_code} {tour.base_price.toLocaleString()}</div>
                          <div className="text-gray-500">Base price</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(tour)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicate(tour)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(tour.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ToursList;
