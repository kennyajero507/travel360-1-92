
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Loader2 } from "lucide-react";
import { InquiryFormProps, AvailableAgent } from "../../types/inquiry.types";

interface AgentAssignmentCardProps extends InquiryFormProps {
  availableAgents: AvailableAgent[];
  loadingAgents?: boolean;
}

export const AgentAssignmentCard = ({ 
  formData, 
  setFormData, 
  availableAgents, 
  loadingAgents = false 
}: AgentAssignmentCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="assigned_agent" className="block text-sm font-medium mb-2">
              Assign to Agent
            </label>
            {loadingAgents ? (
              <div className="flex items-center justify-center py-2 border rounded">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading agents...
              </div>
            ) : (
              <Select
                value={formData.assigned_agent}
                onValueChange={(value) => setFormData({ ...formData, assigned_agent: value })}
              >
                <SelectTrigger className="bg-white text-black">
                  <SelectValue placeholder="Select an agent (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {availableAgents.length === 0 ? (
                    <SelectItem value="" disabled>No agents available</SelectItem>
                  ) : (
                    availableAgents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
            {availableAgents.length === 0 && !loadingAgents && (
              <p className="text-sm text-gray-500 mt-1">
                No agents available for assignment
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
