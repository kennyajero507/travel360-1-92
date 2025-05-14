
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

interface HotelsHeaderProps {
  title: string;
  subtitle: string;
  showAddButton: boolean;
  role: string;
}

const HotelsHeader: React.FC<HotelsHeaderProps> = ({ title, subtitle, showAddButton, role }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-600">{title}</h1>
        <p className="text-gray-500 mt-2">{subtitle}</p>
      </div>
      {showAddButton && (
        <Button asChild className="self-start">
          <Link to="/hotels/create">
            <Plus className="mr-2 h-4 w-4" />
            {role === 'agent' ? 'Submit New Hotel' : 'Add New Hotel'}
          </Link>
        </Button>
      )}
    </div>
  );
};

export default HotelsHeader;
