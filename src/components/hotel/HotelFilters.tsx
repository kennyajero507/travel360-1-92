
import React from "react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface HotelFiltersProps {
  filter: string;
  setFilter: (value: string) => void;
  search: string;
  setSearch: (value: string) => void;
}

const HotelFilters: React.FC<HotelFiltersProps> = ({
  filter,
  setFilter,
  search,
  setSearch,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="w-full md:w-64">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="bg-white text-black">
            <SelectValue placeholder="Filter hotels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hotels</SelectItem>
            <SelectItem value="negotiated">Negotiated Rates</SelectItem>
            <SelectItem value="non-negotiated">Standard Rates</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <Input
          placeholder="Search hotels..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white text-black"
        />
      </div>
    </div>
  );
};

export default HotelFilters;
