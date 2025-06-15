
import { useHotelsData } from '../hooks/useHotelsData';
import { useAuth } from '../contexts/AuthContext';
import HotelsHeader from '../components/hotel/HotelsHeader';
import HotelFilters from '../components/hotel/HotelFilters';
import HotelTable from '../components/hotel/HotelTable';
import { Skeleton } from '@/components/ui/skeleton';
import { getPermissionsForRole } from '@/contexts/role/defaultPermissions';
import { UserRole } from '@/contexts/role/types';

const Hotels = () => {
  const { 
    filteredHotels, 
    isLoading, 
    error, 
    filter, 
    setFilter, 
    search, 
    setSearch,
    toggleHotelStatus
  } = useHotelsData();
  
  const { profile } = useAuth();
  const userRole = profile?.role as UserRole || 'agent';
  const permissions = getPermissionsForRole(userRole);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center">
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-36" />
        </div>
        <div className="flex gap-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 flex-1" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-6">Error loading hotels: {error.message}</div>;
  }
  
  const canAddHotels = permissions.canAddHotels;
  const canEditHotels = permissions.canEditHotels;
  
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <HotelsHeader 
        title="Hotel Management"
        subtitle="View, add, and manage your hotel inventory and negotiated rates."
        showAddButton={canAddHotels}
        role={userRole}
      />
      <HotelFilters 
        filter={filter} 
        setFilter={setFilter}
        search={search}
        setSearch={setSearch}
      />
      <HotelTable 
        hotels={filteredHotels}
        permissions={{ canEditHotels }}
        onToggleStatus={toggleHotelStatus}
      />
    </div>
  );
};

export default Hotels;
