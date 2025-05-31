
import { Bell, Calendar, Search, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useAuth } from "../contexts/AuthContext";
import { ProfileDropdown } from "./ProfileDropdown";
import { Link } from "react-router-dom";
import { getRoleDisplayName } from "../utils/authHelpers";

const Header = () => {
  const { userProfile } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-4 px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search inquiries, quotes, bookings..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Calendar Button */}
          <Button variant="ghost" size="sm" asChild>
            <Link to="/calendar">
              <Calendar className="h-4 w-4" />
            </Link>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500">
              3
            </Badge>
          </Button>

          {/* User Role Display */}
          {userProfile && (
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                {getRoleDisplayName(userProfile.role)}
              </span>
            </div>
          )}

          {/* Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
