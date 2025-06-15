
import React from "react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { QuoteStatus } from "../../types/quote.types";

interface QuoteFiltersProps {
  filter: string;
  setFilter: (value: string) => void;
  search: string;
  setSearch: (value: string) => void;
}

const statuses: QuoteStatus[] = ['draft', 'sent', 'approved', 'rejected', 'expired'];

export const QuoteFilters = ({ filter, setFilter, search, setSearch }: QuoteFiltersProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search quotes by client, destination..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map(status => (
                <SelectItem key={status} value={status} className="capitalize">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
