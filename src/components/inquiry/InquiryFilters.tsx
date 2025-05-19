
import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";

interface InquiryFiltersProps {
  filter: string;
  setFilter: (value: string) => void;
  search: string;
  setSearch: (value: string) => void;
}

export const InquiryFilters = ({ filter, setFilter, search, setSearch }: InquiryFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="w-full md:w-64">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="bg-white text-black">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Inquiries</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="quoted">Quoted</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <Input
          placeholder="Search inquiries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white text-black"
        />
      </div>
    </div>
  );
};
