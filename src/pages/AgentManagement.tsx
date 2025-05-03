
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRole } from "../contexts/RoleContext";
import { toast } from "sonner";
import AgentManagementComponent from "../components/AgentManagement";

const AgentManagement = () => {
  const { role, tier, permissions } = useRole();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user has permission to manage agents
    if (!permissions.canManageAgents) {
      toast.error("You don't have permission to manage agents");
      navigate("/");
    }
  }, [permissions, navigate]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-600">Agent Management</h1>
        <p className="text-gray-500 mt-2">
          {role === 'admin' 
            ? 'Manage all agents in the system' 
            : `Manage your agents - ${tier} subscription`}
        </p>
      </div>

      <AgentManagementComponent />
    </div>
  );
};

export default AgentManagement;
