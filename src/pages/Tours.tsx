
import React, { useState } from "react";
import { useTours } from "../hooks/useTours";
import { Tour, TourFormData } from "../types/tour.types";
import ToursList from "../components/tours/ToursList";
import TourForm from "../components/tours/TourForm";

const Tours = () => {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  
  const { createTour, updateTour, isCreating, isUpdating } = useTours();

  const handleCreateNew = () => {
    setSelectedTour(null);
    setView('create');
  };

  const handleEdit = (tour: Tour) => {
    setSelectedTour(tour);
    setView('edit');
  };

  const handleSave = async (data: TourFormData) => {
    if (view === 'edit' && selectedTour) {
      await updateTour({ id: selectedTour.id, data });
    } else {
      await createTour(data);
    }
    setView('list');
    setSelectedTour(null);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedTour(null);
  };

  if (view === 'create' || view === 'edit') {
    return (
      <TourForm
        tour={selectedTour || undefined}
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={isCreating || isUpdating}
      />
    );
  }

  return (
    <ToursList
      onCreateNew={handleCreateNew}
      onEdit={handleEdit}
    />
  );
};

export default Tours;
