
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AgentManagement = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to team management
    navigate("/team", { replace: true });
  }, [navigate]);

  return null;
};

export default AgentManagement;
