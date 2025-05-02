
import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";
import { Calendar, ChevronLeft, ChevronRight, FileText, Home, Settings, Users } from "lucide-react";

interface VerticalNavProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const VerticalNav = ({ collapsed, setCollapsed }: VerticalNavProps) => {
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <nav
      className={cn(
        "fixed h-full bg-primary text-white shadow-lg transition-all duration-300 z-10",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <h1 className="text-xl font-bold tracking-tight">TravelFlow360</h1>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            "p-2 rounded-full hover:bg-white/10 transition-all",
            collapsed ? "mx-auto" : ""
          )}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="py-4">
        <NavItem to="/" collapsed={collapsed} icon={<Home size={20} />} label="Dashboard" />
        <NavItem to="/quotes" collapsed={collapsed} icon={<FileText size={20} />} label="Quotes" />
        <NavItem to="/clients" collapsed={collapsed} icon={<Users size={20} />} label="Clients" />
        <NavItem to="/calendar" collapsed={collapsed} icon={<Calendar size={20} />} label="Calendar" />
        <NavItem to="/settings" collapsed={collapsed} icon={<Settings size={20} />} label="Settings" />
      </div>
    </nav>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}

const NavItem = ({ to, icon, label, collapsed }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-4 py-3 px-4 transition-colors hover:bg-primary-hover",
          collapsed ? "justify-center px-2" : "",
          isActive ? "bg-white/10" : ""
        )
      }
    >
      <div>{icon}</div>
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
};

export default VerticalNav;
