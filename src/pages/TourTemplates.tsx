
import React, { useState } from "react";
import { useTourTemplates } from "../hooks/useTourTemplates";
import { TourTemplate, TourTemplateFormData } from "../types/tour.types";
import TourTemplatesList from "../components/tours/TourTemplatesList";
import TourTemplateForm from "../components/tours/TourTemplateForm";

const TourTemplates = () => {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<TourTemplate | null>(null);
  
  const { createTourTemplate, updateTourTemplate, isCreating, isUpdating } = useTourTemplates();

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setView('create');
  };

  const handleEdit = (template: TourTemplate) => {
    setSelectedTemplate(template);
    setView('edit');
  };

  const handleSave = async (data: TourTemplateFormData) => {
    if (view === 'edit' && selectedTemplate) {
      await updateTourTemplate({ id: selectedTemplate.id, data });
    } else {
      await createTourTemplate(data);
    }
    setView('list');
    setSelectedTemplate(null);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedTemplate(null);
  };

  if (view === 'create' || view === 'edit') {
    return (
      <TourTemplateForm
        template={selectedTemplate || undefined}
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={isCreating || isUpdating}
      />
    );
  }

  return (
    <TourTemplatesList
      onCreateNew={handleCreateNew}
      onEdit={handleEdit}
    />
  );
};

export default TourTemplates;
