
import React, { useState, useMemo } from "react";
import { Plus, Search, Filter, Edit, Copy, Archive, Eye } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useTourTemplates } from "../../hooks/useTourTemplates";
import { TourTemplate } from "../../types/tour.types";
import { useNavigate } from "react-router-dom";

interface TourTemplatesListProps {
  onCreateNew: () => void;
  onEdit: (template: TourTemplate) => void;
}

const TourTemplatesList: React.FC<TourTemplatesListProps> = ({ onCreateNew, onEdit }) => {
  const navigate = useNavigate();
  const { tourTemplates, isLoading, deleteTourTemplate, duplicateTourTemplate } = useTourTemplates();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDuration, setFilterDuration] = useState<string>("all");

  const filteredTemplates = useMemo(() => {
    return tourTemplates.filter((template) => {
      const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.destination_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === "all" || template.tour_type === filterType;
      
      const matchesDuration = filterDuration === "all" || 
        (filterDuration === "short" && template.duration_days <= 3) ||
        (filterDuration === "medium" && template.duration_days > 3 && template.duration_days <= 7) ||
        (filterDuration === "long" && template.duration_days > 7);
      
      return matchesSearch && matchesType && matchesDuration;
    });
  }, [tourTemplates, searchTerm, filterType, filterDuration]);

  const handleDuplicate = async (template: TourTemplate) => {
    const newTitle = `${template.title} (Copy)`;
    try {
      await duplicateTourTemplate({ id: template.id, newTitle });
    } catch (error) {
      console.error("Failed to duplicate template:", error);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to archive this tour template?")) {
      deleteTourTemplate(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading tour templates...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tour Templates</h2>
          <p className="text-gray-600">Manage your reusable tour packages and itineraries</p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create Tour Template
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
                placeholder="Search templates..."
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

      {/* Templates Table */}
      <Card>
        <CardContent className="p-0">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No tour templates found. Create your first template to get started.</p>
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
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.title}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{template.destination_name}</div>
                        <div className="text-sm text-gray-500">{template.region}, {template.country}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{template.duration_days} days</div>
                        <div className="text-gray-500">{template.duration_nights} nights</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.tour_type === 'domestic' ? 'default' : 'secondary'}>
                        {template.tour_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {template.base_price ? (
                        <div className="text-sm">
                          <div className="font-medium">{template.currency_code} {template.base_price.toLocaleString()}</div>
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
                          onClick={() => onEdit(template)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicate(template)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(template.id)}
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

export default TourTemplatesList;
