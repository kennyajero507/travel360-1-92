
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { BasicInformationCard } from "./BasicInformationCard";
import { ClientInformationCard } from "./ClientInformationCard";
import { DestinationPackageCard } from "./DestinationPackageCard";
import { TravelDatesCard } from "./TravelDatesCard";
import { GroupInformationCard } from "./GroupInformationCard";
import { AgentAssignmentCard } from "./AgentAssignmentCard";
import { ValidationErrorsCard } from "./ValidationErrorsCard";
import { useInquiryForm } from "../../hooks/useInquiryForm";

export const CreateInquiryForm = () => {
  const {
    activeTab,
    formData,
    setFormData,
    validationErrors,
    availableAgents,
    isAgent,
    isSubmitting,
    loadingAgents,
    handleTabChange,
    saveDraft,
    handleSubmit,
    handleCancel
  } = useInquiryForm();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="domestic">Domestic Tours</TabsTrigger>
          <TabsTrigger value="international">International Tours</TabsTrigger>
        </TabsList>

        <TabsContent value="domestic" className="space-y-6">
          <BasicInformationCard 
            formData={formData} 
            setFormData={setFormData} 
            validationErrors={validationErrors}
            activeTab={activeTab}
          />
          
          <ClientInformationCard 
            formData={formData} 
            setFormData={setFormData} 
            validationErrors={validationErrors}
            activeTab={activeTab}
          />
          
          <DestinationPackageCard 
            formData={formData} 
            setFormData={setFormData} 
            validationErrors={validationErrors}
            activeTab={activeTab}
          />
          
          <TravelDatesCard 
            formData={formData} 
            setFormData={setFormData} 
            validationErrors={validationErrors}
            activeTab={activeTab}
          />
          
          <GroupInformationCard 
            formData={formData} 
            setFormData={setFormData} 
            validationErrors={validationErrors}
            activeTab={activeTab}
          />
          
          {!isAgent && availableAgents.length > 0 && (
            <AgentAssignmentCard 
              formData={formData} 
              setFormData={setFormData} 
              availableAgents={availableAgents}
              validationErrors={validationErrors}
              activeTab={activeTab}
              loadingAgents={loadingAgents}
            />
          )}
        </TabsContent>

        <TabsContent value="international" className="space-y-6">
          <BasicInformationCard 
            formData={formData} 
            setFormData={setFormData} 
            validationErrors={validationErrors}
            activeTab={activeTab}
          />
          
          <ClientInformationCard 
            formData={formData} 
            setFormData={setFormData} 
            validationErrors={validationErrors}
            activeTab={activeTab}
          />
          
          <DestinationPackageCard 
            formData={formData} 
            setFormData={setFormData} 
            validationErrors={validationErrors}
            activeTab={activeTab}
          />
          
          <TravelDatesCard 
            formData={formData} 
            setFormData={setFormData} 
            validationErrors={validationErrors}
            activeTab={activeTab}
          />
          
          <GroupInformationCard 
            formData={formData} 
            setFormData={setFormData} 
            validationErrors={validationErrors}
            activeTab={activeTab}
          />
          
          {!isAgent && availableAgents.length > 0 && (
            <AgentAssignmentCard 
              formData={formData} 
              setFormData={setFormData} 
              availableAgents={availableAgents}
              validationErrors={validationErrors}
              activeTab={activeTab}
              loadingAgents={loadingAgents}
            />
          )}
        </TabsContent>
      </Tabs>

      {validationErrors.length > 0 && (
        <ValidationErrorsCard validationErrors={validationErrors} />
      )}

      <div className="flex justify-end space-x-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        
        <Button 
          type="button" 
          variant="secondary" 
          onClick={saveDraft}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save as Draft'}
        </Button>
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
        </Button>
      </div>
    </form>
  );
};
