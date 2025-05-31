
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { InquiryFormProps, AvailableAgent } from "../../types/inquiry.types";

interface AgentAssignmentCardProps extends InquiryFormProps {
  availableAgents: AvailableAgent[];
}

export const AgentAssignmentCard = ({ formData, setFormData, availableAgents }: AgentAssignmentCardProps) => {
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
            <Select
              value={formData.assigned_agent}
              onValueChange={(value) => setFormData({ ...formData, assigned_agent: value })}
            >
              <SelectTrigger className="bg-white text-black">
                <SelectValue placeholder="Select an agent (optional)" />
              </SelectTrigger>
              <SelectContent>
                {availableAgents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
