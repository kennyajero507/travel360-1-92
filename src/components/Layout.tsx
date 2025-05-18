
import { Outlet } from "react-router-dom";
import VerticalNav from "./VerticalNav";
import { useState } from "react";
import { cn } from "../lib/utils";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <VerticalNav collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className={cn("flex-1 overflow-auto transition-all duration-300", 
        collapsed ? "ml-20" : "ml-64"
      )}>
        <div className="container py-6 px-4 mx-auto">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default Layout;
