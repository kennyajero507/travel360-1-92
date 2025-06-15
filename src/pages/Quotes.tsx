
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import { useQuoteData } from "../hooks/useQuoteData";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { QuoteTable } from "../components/quote/QuoteTable";
import { QuoteFilters } from "../components/quote/QuoteFilters";
import { QuoteData } from "../types/quote.types";

const Quotes = () => {
  const navigate = useNavigate();
  const { quotes, isLoading, deleteQuote } = useQuoteData();
  
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredQuotes = useMemo(() => {
    let filtered: QuoteData[] = quotes || [];

    if (filter !== "all") {
      filtered = filtered.filter((quote) => quote.status.toLowerCase() === filter);
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      filtered = filtered.filter(
        (quote) =>
          quote.client?.toLowerCase().includes(searchTerm) ||
          quote.destination?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [quotes, filter, search]);

  if (isLoading) {
    return (
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quotes</h1>
        <Button onClick={() => navigate("/quotes/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Quote
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <QuoteFilters filter={filter} setFilter={setFilter} search={search} setSearch={setSearch} />
          <QuoteTable
            quotes={filteredQuotes}
            onDelete={deleteQuote}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Quotes;
