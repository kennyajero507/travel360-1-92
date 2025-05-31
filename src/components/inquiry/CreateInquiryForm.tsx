
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Save, Globe, Package, FileText, Loader2 } from "lucide-react";
import { useRole } from "../../contexts/RoleContext";
import { ValidationErrorsCard } from "./ValidationErrorsCard";
import { BasicInformationCard } from "./BasicInformationCard";
import { ClientInformationCard } from "./ClientInformationCard";
import { DestinationPackageCard } from "./DestinationPackageCard";
import { TravelDatesCard } from "./TravelDatesCard";
import { GroupInformationCard } from "./GroupInformationCard";
import { AgentAssignmentCard } from "./AgentAssignmentCard";
import { useInquiryForm } from "../../hooks/useInquiryForm";

export const CreateInquiryForm = () => {
  const { role, permissions } = useRole();
  const {
    activeTab,
    formData,
    setFormData,
    validationErrors,
    availableAgents,
    isAgent,
    isSubmitting,
    handleTabChange,
    saveDraft,
    handleSubmit,
    handleCancel
  } = useInquiryForm();

  return (
    <div className="space-y-6">
      <ValidationErrorsCard validationErrors={validationErrors} />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="domestic">
            <Globe className="mr-2 h-4 w-4" />
            Domestic Tours
          </TabsTrigger>
          <TabsTrigger value="international">
            <Package className="mr-2 h-4 w-4" />
            International Tours
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <form onSubmit={handleSubmit} className="space-y-6">
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

            {!isAgent && (role === 'org_owner' || role === 'tour_operator' || role === 'system_admin') && permissions?.canAssignInquiries && (
              <AgentAssignmentCard 
                formData={formData} 
                setFormData={setFormData} 
                validationErrors={validationErrors}
                activeTab={activeTab}
                availableAgents={availableAgents}
              />
            )}

            <div className="flex justify-end space-x-4 pt-4">
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
                variant="outline" 
                onClick={saveDraft}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Save Draft
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Create Inquiry
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};
