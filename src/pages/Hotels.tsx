
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useRole } from "../contexts/RoleContext";
import { toast } from "sonner";
import { Hotel as HotelIcon } from "lucide-react";
import { useHotelsData } from "../hooks/useHotelsData";
import HotelsHeader from "../components/hotel/HotelsHeader";
import HotelFilters from "../components/hotel/HotelFilters";
import HotelTable from "../components/hotel/HotelTable";

const Hotels = () => {
  const { role, tier, permissions } = useRole();
  const navigate = useNavigate();
  const { 
    filter, 
    setFilter, 
    search, 
    setSearch, 
    filteredHotels,
    toggleHotelStatus 
  } = useHotelsData();

  useEffect(() => {
    // Check permissions based on role
    if (!permissions.canAddHotels && !permissions.canSubmitHotels) {
      toast.error("You don't have permission to access hotel management");
      navigate("/");
    }
  }, [permissions, navigate]);

  // Generate appropriate title based on role
  const getRoleTitle = () => {
    switch(role) {
      case 'system_admin': return 'Global Hotel Inventory';
      case 'org_owner': return 'Organization Hotel Inventory';
      case 'tour_operator': return 'Team Hotel Inventory';
      case 'agent': return 'Hotel Inventory';
      default: return 'Hotels';
    }
  };

  // Generate subtitle based on role and tier
  const getSubtitle = () => {
    if (role === 'system_admin') return 'System-wide hotel management';
    
    const formattedRole = (() => {
      switch(role) {
        case 'org_owner': return 'Organization Owner';
        case 'tour_operator': return 'Tour Operator';
        case 'agent': return 'Travel Agent';
        default: return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    })();
    
    return `${formattedRole} Access - ${tier.charAt(0).toUpperCase() + tier.slice(1)} subscription`;
  };

  // Show add button based on permissions
  const showAddButton = permissions.canAddHotels;

  return (
    <div className="space-y-6">
      <HotelsHeader 
        title={getRoleTitle()} 
        subtitle={getSubtitle()} 
        showAddButton={showAddButton} 
        role={role} 
      />

      <Card>
        <CardHeader>
          <CardTitle>
            {role === 'agent' && !permissions.canAddHotels 
              ? 'Available Hotels' 
              : 'Hotel Inventory'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <HotelFilters
            filter={filter}
            setFilter={setFilter}
            search={search}
            setSearch={setSearch}
          />

          <HotelTable 
            hotels={filteredHotels}
            permissions={permissions}
            onToggleStatus={toggleHotelStatus}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Hotels;
