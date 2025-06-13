
import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, Filter } from 'lucide-react';

interface SearchAndFilterProps {
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  filterOptions?: Array<{
    key: string;
    label: string;
    options: Array<{ value: string; label: string }>;
  }>;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchPlaceholder = "Search...",
  onSearch,
  onFilter,
  filterOptions = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    onFilter?.({});
    onSearch?.('');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg border">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {/* Filters */}
      {filterOptions.length > 0 && (
        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-gray-400" />
          {filterOptions.map((option) => (
            <Select
              key={option.key}
              value={filters[option.key] || ''}
              onValueChange={(value) => handleFilterChange(option.key, value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={option.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All {option.label}</SelectItem>
                {option.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;
