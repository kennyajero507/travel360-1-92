
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
      toast.error("You don't have permission to manage agents. This feature requires appropriate role and subscription tier.");
      navigate("/settings");
    }
  }, [permissions, navigate]);

  // Generate appropriate title based on role
  const getRoleTitle = () => {
    switch(role) {
      case 'system_admin': return 'Manage All Agents';
      case 'org_owner': return 'Manage Organization Agents';
      case 'tour_operator': return 'Manage Team Agents';
      default: return 'Agent Management';
    }
  };

  // Generate subtitle based on role and tier
  const getSubtitle = () => {
    if (role === 'system_admin') return 'System-wide agent management';
    if (role === 'org_owner') return `Organization owner - ${tier.charAt(0).toUpperCase() + tier.slice(1)} subscription`;
    if (role === 'tour_operator') return `Tour operator - ${tier.charAt(0).toUpperCase() + tier.slice(1)} subscription`;
    return '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-600">{getRoleTitle()}</h1>
        <p className="text-gray-500 mt-2">{getSubtitle()}</p>
      </div>

      <AgentManagementComponent />
    </div>
  );
};

export default AgentManagement;
