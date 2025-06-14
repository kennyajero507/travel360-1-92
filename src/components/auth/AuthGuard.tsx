
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
  // allowedRoles will be re-implemented in a future step
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Role-based access will be added back later once the core auth is solid.
  return <>{children}</>;
};

export default AuthGuard;
