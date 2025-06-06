
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useRole } from "../contexts/RoleContext";
import { toast } from "sonner";
import { useHotelsData } from "../hooks/useHotelsData";
import HotelsHeader from "../components/hotel/HotelsHeader";
import HotelFilters from "../components/hotel/HotelFilters";
import HotelTable from "../components/hotel/HotelTable";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";

const Hotels = () => {
  const { role, tier, permissions } = useRole();
  const navigate = useNavigate();
  const { 
    filter, 
    setFilter, 
    search, 
    setSearch, 
    filteredHotels,
    toggleHotelStatus,
    isLoading,
    error
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

  if (error) {
    return (
      <div className="space-y-6">
        <HotelsHeader 
          title={getRoleTitle()} 
          subtitle={getSubtitle()} 
          showAddButton={showAddButton} 
          role={role} 
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Hotels</h2>
            <p className="text-gray-600 mb-4">There was an error loading your hotels. Please try again.</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2">Loading hotels...</span>
            </div>
          ) : (
            <HotelTable 
              hotels={filteredHotels}
              permissions={permissions}
              onToggleStatus={toggleHotelStatus}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Hotels;
