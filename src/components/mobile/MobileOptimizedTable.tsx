
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MoreVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MobileTableItem {
  id: string;
  title: string;
  subtitle?: string;
  status?: string;
  statusColor?: string;
  metadata?: Array<{ label: string; value: string }>;
  actions?: React.ReactNode;
}

interface MobileOptimizedTableProps {
  items: MobileTableItem[];
  onItemClick?: (item: MobileTableItem) => void;
  className?: string;
}

const MobileOptimizedTable = ({ items, onItemClick, className }: MobileOptimizedTableProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => (
        <Card 
          key={item.id} 
          className={cn(
            "cursor-pointer hover:shadow-md transition-shadow",
            onItemClick && "active:scale-[0.98]"
          )}
          onClick={() => onItemClick?.(item)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{item.title}</h3>
                {item.subtitle && (
                  <p className="text-xs text-gray-500 mt-1 truncate">{item.subtitle}</p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-2">
                {item.status && (
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", item.statusColor)}
                  >
                    {item.status}
                  </Badge>
                )}
                {item.actions && (
                  <div onClick={(e) => e.stopPropagation()}>
                    {item.actions}
                  </div>
                )}
              </div>
            </div>
            
            {item.metadata && item.metadata.length > 0 && (
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                {item.metadata.map((meta, index) => (
                  <div key={index}>
                    <span className="font-medium">{meta.label}:</span> {meta.value}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      
      {items.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 text-sm">No items found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MobileOptimizedTable;
