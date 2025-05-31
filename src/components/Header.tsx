
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ProfileDropdown from "./ProfileDropdown";

const Header = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'agent': return 'Travel Agent';
      case 'tour_operator': return 'Tour Operator';
      case 'org_owner': return 'Organization Owner';
      case 'system_admin': return 'System Admin';
      case 'client': return 'Client';
      default: return role;
    }
  };

  return (
    <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/calendar")}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Calendar"
        >
          <Calendar className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        {userProfile && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Role: </span>
            <span className="text-blue-600 font-semibold">
              {getRoleDisplayName(userProfile.role)}
            </span>
          </div>
        )}
        <ProfileDropdown />
      </div>
    </div>
  );
};

export default Header;
