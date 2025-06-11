
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { DatePicker } from "../ui/date-picker";
import { Checkbox } from "../ui/checkbox";
import { BookingFilters as FilterType } from "../../types/enhanced-booking.types";
import { FilterX, Search } from "lucide-react";

interface BookingFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

const BookingFilters = ({ filters, onFiltersChange, onApplyFilters, onClearFilters }: BookingFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<FilterType>(filters);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatus = checked 
      ? [...(localFilters.status || []), status]
      : (localFilters.status || []).filter(s => s !== status);
    
    setLocalFilters(prev => ({ ...prev, status: newStatus }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApplyFilters();
  };

  const handleClear = () => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClearFilters();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Advanced Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={localFilters.status?.includes(option.value) || false}
                    onCheckedChange={(checked) => handleStatusChange(option.value, !!checked)}
                  />
                  <Label htmlFor={option.value} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label>Travel Date Range</Label>
            <div className="space-y-2">
              <DatePicker
                date={localFilters.dateRange?.start ? new Date(localFilters.dateRange.start) : undefined}
                onSelect={(date) => 
                  setLocalFilters(prev => ({ 
                    ...prev, 
                    dateRange: { 
                      ...prev.dateRange, 
                      start: date?.toISOString().split('T')[0] || '',
                      end: prev.dateRange?.end || ''
                    }
                  }))
                }
                placeholder="Start Date"
              />
              <DatePicker
                date={localFilters.dateRange?.end ? new Date(localFilters.dateRange.end) : undefined}
                onSelect={(date) => 
                  setLocalFilters(prev => ({ 
                    ...prev, 
                    dateRange: { 
                      ...prev.dateRange, 
                      start: prev.dateRange?.start || '',
                      end: date?.toISOString().split('T')[0] || ''
                    }
                  }))
                }
                placeholder="End Date"
              />
            </div>
          </div>

          {/* Client Filter */}
          <div className="space-y-2">
            <Label htmlFor="client-filter">Client Name</Label>
            <Input
              id="client-filter"
              placeholder="Search by client name..."
              value={localFilters.client || ''}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, client: e.target.value }))}
            />
          </div>

          {/* Hotel Filter */}
          <div className="space-y-2">
            <Label htmlFor="hotel-filter">Hotel Name</Label>
            <Input
              id="hotel-filter"
              placeholder="Search by hotel name..."
              value={localFilters.hotel || ''}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, hotel: e.target.value }))}
            />
          </div>

          {/* Amount Range Filter */}
          <div className="space-y-2">
            <Label>Amount Range</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Min amount"
                type="number"
                value={localFilters.amountRange?.min || ''}
                onChange={(e) => 
                  setLocalFilters(prev => ({ 
                    ...prev, 
                    amountRange: { 
                      ...prev.amountRange, 
                      min: Number(e.target.value),
                      max: prev.amountRange?.max || 0
                    }
                  }))
                }
              />
              <Input
                placeholder="Max amount"
                type="number"
                value={localFilters.amountRange?.max || ''}
                onChange={(e) => 
                  setLocalFilters(prev => ({ 
                    ...prev, 
                    amountRange: { 
                      ...prev.amountRange, 
                      min: prev.amountRange?.min || 0,
                      max: Number(e.target.value)
                    }
                  }))
                }
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleApply} className="flex-1">
            <Search className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
          <Button variant="outline" onClick={handleClear}>
            <FilterX className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingFilters;
